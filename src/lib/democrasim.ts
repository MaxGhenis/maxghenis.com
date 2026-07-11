/**
 * Client-side port of democrasim's `analytic_plurality_curve`
 * (https://github.com/MaxGhenis/democrasim).
 *
 * For two policies under plurality voting with linear-Gaussian perception,
 * each voter votes for Policy A with probability Φ((m − b)/(σ√2)), where m
 * is their household's true margin between the policies, b is a shared
 * perceived bias toward Policy B, and σ is perception noise. The electorate
 * reduces to a weighted list of margins, so the probability that the
 * welfare-preferred policy wins an n-voter election has a closed form —
 * no simulation, no backend.
 *
 * Margins come from `src/data/democrasim-assets.json`, exported by the
 * democrasim package from its committed artifact (engine-computed impacts
 * for 120,408 adults). The JSON also carries test vectors computed on the
 * FULL electorate, so the vitest suite pins this port against the Python
 * math and the compression error in one tolerance.
 */
import rawAssets from "../data/democrasim-assets.json";

export type WorldKey = "per_capita" | "proportional" | "none" | "sign_flip";

export interface World {
  margins: number[];
  weights: number[];
}

export interface Assets {
  provenance: {
    generator: string;
    democrasim_version: string;
    democrasim_commit: string;
    artifact_sha256: string;
  };
  constants: {
    labels: string[];
    welfare_optimal_index: number;
    gross_totals_bn: number[];
    levy_per_adult: number[];
    population: number;
    n_rows: number;
    mean_abs_margin_per_capita: number;
  };
  worlds: Record<WorldKey, World>;
  toys: {
    gaussian: { mean: number; sd: number };
    homogeneous_margin: number;
  };
  test_vectors: {
    world: WorldKey;
    sigma: number;
    bias_toward_b: number;
    n_voters: number | null;
    p_tracked: number;
    share_optimal: number;
    share_abstain: number;
    mean_ranking_accuracy: number | null;
  }[];
}

export const ASSETS = rawAssets as unknown as Assets;

export const WORLD_LABELS: Record<WorldKey, string> = {
  per_capita: "equal per-adult levy",
  proportional: "levy proportional to income",
  none: "no financing (gross impacts)",
  sign_flip: "counterfactual: Policy B costs 3% more",
};

const SQRT2 = Math.SQRT2;

/** Abramowitz & Stegun 7.1.26 rational approximation (|error| < 1.5e-7). */
export function erf(x: number): number {
  if (x === 0) return 0; // the polynomial is off by 1e-9 at the origin
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * ax);
  const y =
    1 -
    (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t -
      0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-ax * ax);
  return sign * y;
}

/** Standard normal CDF. */
export function phi(z: number): number {
  return 0.5 * (1 + erf(z / SQRT2));
}

export interface Shares {
  /** Expected vote share for the welfare-preferred policy (Policy A). */
  optimal: number;
  /** Expected vote share for the other policy (Policy B). */
  other: number;
  /** Expected abstention share (exact perceived indifference at σ=0). */
  abstain: number;
}

/**
 * Expected vote shares in a given world at noise σ and shared bias b
 * toward Policy B (both in dollars per year).
 */
export function expectedShares(
  world: World,
  sigma: number,
  biasTowardB: number,
): Shares {
  const { margins, weights } = world;
  let first = 0;
  let abstain = 0;
  let total = 0;
  for (let i = 0; i < margins.length; i++) {
    const w = weights[i];
    const shifted = margins[i] - biasTowardB;
    total += w;
    if (sigma > 0) {
      first += w * phi(shifted / (sigma * SQRT2));
    } else if (shifted > 0) {
      first += w;
    } else if (shifted === 0) {
      abstain += w;
    }
  }
  const optimal = first / total;
  const abst = abstain / total;
  return { optimal, other: 1 - optimal - abst, abstain: abst };
}

/**
 * Probability the welfare-preferred policy wins an election of `nVoters`
 * sampled adults (null = the large-population limit), via the normal
 * approximation to the multinomial vote-count difference — the same closed
 * form as democrasim's `analytic_plurality_curve`.
 */
export function pTracked(
  world: World,
  sigma: number,
  biasTowardB: number,
  nVoters: number | null,
): number {
  const { optimal, other } = expectedShares(world, sigma, biasTowardB);
  const gap = optimal - other;
  if (optimal + other === 0) return 0; // everyone abstains: status quo
  if (nVoters === null) return gap > 0 ? 1 : gap === 0 ? 0.5 : 0;
  const variance = nVoters * (optimal + other - gap * gap);
  if (variance <= 0) return gap > 0 ? 1 : gap === 0 ? 0.5 : 0;
  return phi((nVoters * gap) / Math.sqrt(variance));
}

/**
 * Mean probability a voter correctly ranks the two policies for their own
 * household — the survey-style accuracy coordinate. Voters with a zero true
 * margin are excluded (they have no ranking to get right).
 */
export function meanRankingAccuracy(
  world: World,
  sigma: number,
  biasTowardB: number,
): number {
  const { margins, weights } = world;
  let acc = 0;
  let mass = 0;
  for (let i = 0; i < margins.length; i++) {
    const m = margins[i];
    if (m === 0) continue;
    const w = weights[i];
    const signed = Math.sign(m) * (m - biasTowardB);
    mass += w;
    if (sigma > 0) {
      acc += w * phi(signed / (sigma * SQRT2));
    } else {
      acc += w * (signed > 0 ? 1 : signed === 0 ? 0.5 : 0);
    }
  }
  return acc / mass;
}

/** A log-spaced σ grid (plus σ=0 first) for drawing tracking curves. */
export function sigmaGrid(points = 61, min = 1, max = 100_000): number[] {
  const grid = [0];
  const step = Math.log(max / min) / (points - 2);
  for (let i = 0; i < points - 1; i++) {
    grid.push(min * Math.exp(i * step));
  }
  return grid;
}

export interface CurvePoint {
  sigma: number;
  pTracked: number;
}

export function trackingCurve(
  world: World,
  biasTowardB: number,
  nVoters: number | null,
  sigmas: number[] = sigmaGrid(),
): CurvePoint[] {
  return sigmas.map((sigma) => ({
    sigma,
    pTracked: pTracked(world, sigma, biasTowardB, nVoters),
  }));
}

export function fmtDollars(x: number): string {
  if (x >= 1000) {
    return `$${(x / 1000).toLocaleString("en-US", {
      maximumFractionDigits: x >= 10_000 ? 0 : 1,
    })}k`;
  }
  return `$${x.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function fmtPercent(x: number, digits = 0): string {
  return `${(100 * x).toFixed(digits)}%`;
}
