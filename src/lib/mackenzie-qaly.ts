/**
 * Client-side TypeScript port of the `msqaly` Monte Carlo cost-effectiveness
 * model (https://github.com/MaxGhenis/mackenzie-scott-qaly).
 *
 * It estimates the health impact, in quality-adjusted life-years (QALYs), of
 * MacKenzie Scott's lifetime philanthropy. The browser implementation is kept
 * in distributional parity with the Python package and reads the exported
 * parameter JSON. The RNG differs (a seeded mulberry32 here vs numpy's PCG64),
 * so results match in distribution — not bit-for-bit — which is all a Monte
 * Carlo estimate claims anyway.
 *
 * Everything runs in the browser; there is no backend.
 */
import rawParams from "../data/mackenzie-qaly-params.json";

// ---------------------------------------------------------------------------
// Parameter types (mirror parameters.yaml)
// ---------------------------------------------------------------------------
export type DistSpec =
  | number
  | { dist: "fixed"; value: number }
  | { dist: "uniform"; low: number; high: number }
  | { dist: "loguniform"; low: number; high: number }
  | { dist: "triangular"; low: number; mode: number; high: number }
  | { dist: "normal"; mean: number; sd: number; min?: number; max?: number }
  | { dist: "lognormal_ci"; low: number; high: number }
  | { dist: "beta"; mean: number; concentration: number };

export interface Archetype {
  label: string;
  allocation_share: number;
  method: "cost_per_qaly" | "cost_per_life" | "cost_per_life_year";
  causal_credibility?: string;
  cost_per_qaly_usd?: DistSpec;
  cost_per_life_usd?: DistSpec;
  cost_per_life_year_usd?: DistSpec;
  source?: string;
  identification?: string;
}

export interface GivingTranche {
  year: number;
  nominal_usd: number;
  cpi: number;
  source: string;
}

export interface Params {
  meta: {
    /** Derived by the Python loader: nominal tranches inflated to base-year $. */
    total_giving_usd: number;
    total_giving_nominal_usd: number;
    giving_tranches: GivingTranche[];
    cpi_target: number;
    base_year: number;
    discount_rate: number;
    cost_per_qaly_floor_usd: number;
  };
  conversions: {
    qaly_per_death_averted: { remaining_life_expectancy: DistSpec; utility_weight: DistSpec };
    vqaly_usd: DistSpec;
    frontier_cost_per_qaly_usd: DistSpec;
    frontier_child: {
      remaining_life_years: { dist: "fixed"; value: number; unit: string };
      utility_weight: { dist: "fixed"; value: number; unit: string };
    };
    vqaly_adult: {
      remaining_life_years: { dist: "fixed"; value: number; unit: string };
      utility_weight: { dist: "fixed"; value: number; unit: string };
    };
  };
  realization_factor: { dist: "triangular"; low: number; mode: number; high: number };
  evidence_tiers: Record<string, { mean: number; concentration: number; design: string }>;
  allocation_concentration: number;
  archetypes: Record<string, Archetype>;
}

export const PARAMS = rawParams as unknown as Params;
export const ARCHETYPE_KEYS = Object.keys(PARAMS.archetypes);
export const ARCHETYPES = ARCHETYPE_KEYS.map((k) => PARAMS.archetypes[k]);

const Z95 = 1.6448536269514722;

// ---------------------------------------------------------------------------
// Seeded RNG (mulberry32) + samplers — port of distributions.py
// ---------------------------------------------------------------------------
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class RNG {
  private u: () => number;
  private spare: number | null = null;
  constructor(seed: number) {
    this.u = mulberry32(seed);
  }
  uniform(lo = 0, hi = 1): number {
    return lo + (hi - lo) * this.u();
  }
  /** Standard normal via Box–Muller (cached spare). */
  normal(mean = 0, sd = 1): number {
    if (this.spare !== null) {
      const s = this.spare;
      this.spare = null;
      return mean + sd * s;
    }
    let u1 = 0;
    let u2 = 0;
    while (u1 <= 1e-12) u1 = this.u();
    u2 = this.u();
    const r = Math.sqrt(-2 * Math.log(u1));
    const z0 = r * Math.cos(2 * Math.PI * u2);
    this.spare = r * Math.sin(2 * Math.PI * u2);
    return mean + sd * z0;
  }
  /** Gamma(shape, scale=1) — Marsaglia & Tsang (2000). */
  gamma(shape: number): number {
    if (shape < 1) {
      // Boost: Gamma(a) = Gamma(a+1) * U^(1/a)
      return this.gamma(shape + 1) * Math.pow(this.u(), 1 / shape);
    }
    const d = shape - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    // eslint-disable-next-line no-constant-condition
    while (true) {
      let x = 0;
      let v = 0;
      do {
        x = this.normal();
        v = 1 + c * x;
      } while (v <= 0);
      v = v * v * v;
      const u = this.u();
      if (u < 1 - 0.0331 * x * x * x * x) return d * v;
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
    }
  }
  beta(a: number, b: number): number {
    const x = this.gamma(a);
    const y = this.gamma(b);
    return x / (x + y);
  }
  /** Dirichlet(alpha) — returns a probability vector. */
  dirichlet(alpha: number[]): number[] {
    const g = alpha.map((a) => this.gamma(a));
    const s = g.reduce((p, q) => p + q, 0) || 1;
    return g.map((v) => v / s);
  }
}

export function sampleOne(spec: DistSpec, rng: RNG): number {
  if (typeof spec === "number") return spec;
  switch (spec.dist) {
    case "fixed":
      return spec.value;
    case "uniform":
      return rng.uniform(spec.low, spec.high);
    case "loguniform":
      return Math.exp(rng.uniform(Math.log(spec.low), Math.log(spec.high)));
    case "triangular": {
      // Inverse-CDF triangular sampling.
      const { low, mode, high } = spec;
      const u = rng.uniform();
      const fc = (mode - low) / (high - low);
      if (u < fc) return low + Math.sqrt(u * (high - low) * (mode - low));
      return high - Math.sqrt((1 - u) * (high - low) * (high - mode));
    }
    case "normal": {
      let v = rng.normal(spec.mean, spec.sd);
      if (spec.min !== undefined) v = Math.max(v, spec.min);
      if (spec.max !== undefined) v = Math.min(v, spec.max);
      return v;
    }
    case "lognormal_ci": {
      const mu = (Math.log(spec.low) + Math.log(spec.high)) / 2;
      const sigma = (Math.log(spec.high) - Math.log(spec.low)) / (2 * Z95);
      return Math.exp(rng.normal(mu, sigma));
    }
    case "beta": {
      const k = spec.concentration;
      return rng.beta(spec.mean * k, (1 - spec.mean) * k);
    }
  }
}

/** Best-guess central value of a spec (no sampling) — for static display. */
export function impliedMedian(spec: DistSpec): number {
  if (typeof spec === "number") return spec;
  switch (spec.dist) {
    case "fixed":
      return spec.value;
    case "uniform":
      return (spec.low + spec.high) / 2;
    case "loguniform":
    case "lognormal_ci":
      return Math.sqrt(spec.low * spec.high);
    case "triangular":
      return spec.mode;
    case "normal":
      return spec.mean;
    case "beta":
      return spec.mean;
  }
}

// ---------------------------------------------------------------------------
// Model — port of model.py
// ---------------------------------------------------------------------------
export function discountedQale(years: number, utility: number, rate: number): number {
  const L = Math.max(years, 0);
  if (rate <= 0) return utility * L;
  const annuity = (1 - Math.pow(1 + rate, -L)) / rate;
  return utility * annuity * Math.pow(1 + rate, 0.5); // half-cycle correction
}

export interface Overrides {
  /** Total giving in base-year dollars (default: the derived tranche total). */
  totalGiving?: number;
  /** Central realization factor (triangular mode), clamped to [low, high]. */
  realizationMode?: number;
  /**
   * Evidence stance in [0, 1]. 0 = study-design credibility tiers (skeptical,
   * the default); 1 = trust every cited effect at face value (credulous). Each
   * tier mean is interpolated toward 1.
   */
  credulity?: number;
  /** Annual discount rate (default 0.03). */
  discountRate?: number;
  /** Raw allocation weights for the 13 archetypes (normalized internally). */
  shares?: number[];
  n?: number;
  seed?: number;
}

export interface ModelResult {
  n: number;
  giving: number;
  labels: string[];
  tiers: string[];
  totalQalys: Float64Array;
  perArchetype: Float64Array[]; // [k][n]
  costPerQaly: Float64Array[];
  credibility: Float64Array[];
  shares: Float64Array[]; // [k][n]
  realization: Float64Array;
  qalyPerDeath: Float64Array;
  frontierQalys: Float64Array;
  valueUsd: Float64Array;
  bcRatio: Float64Array;
  blended: Float64Array;
}

export function runModel(overrides: Overrides = {}): ModelResult {
  const p = PARAMS;
  const n = overrides.n ?? 40000;
  const seed = overrides.seed ?? 0;
  const rng = new RNG(seed);
  const giving = overrides.totalGiving ?? p.meta.total_giving_usd;
  const rate = overrides.discountRate ?? p.meta.discount_rate;
  const floor = p.meta.cost_per_qaly_floor_usd ?? 5000;
  // Evidence stance: 0 = RCT-only (non-randomized tiers shrink to near
  // zero), 0.5 = the drafted best-guess tiers (default), 1 = every effect
  // at face value. Two-sided so disagreement with the priors can point
  // either way; the default sits at the best guess, not an extreme.
  const credulity = clamp(overrides.credulity ?? 0.5, 0, 1);
  const stanceMean = (mean: number, isRandomized: boolean): number => {
    const floor = isRandomized ? mean : 0.01;
    return credulity <= 0.5
      ? floor + (credulity / 0.5) * (mean - floor)
      : mean + ((credulity - 0.5) / 0.5) * (1 - mean);
  };

  // Realization spec, with the mode optionally overridden.
  const rf = p.realization_factor;
  const realSpec: DistSpec = {
    dist: "triangular",
    low: rf.low,
    high: rf.high,
    mode: clamp(overrides.realizationMode ?? rf.mode, rf.low, rf.high),
  };

  // Central allocation shares (overridable), normalized. An all-zero override
  // has no valid normalization — fall back to the parameter-file shares rather
  // than sampling a degenerate Dirichlet.
  const requested = overrides.shares ?? ARCHETYPES.map((a) => a.allocation_share);
  const baseShares = requested.some((v) => v > 0)
    ? requested
    : ARCHETYPES.map((a) => a.allocation_share);
  const shareSum = baseShares.reduce((s, v) => s + Math.max(v, 0), 0);
  const central = baseShares.map((v) => Math.max(v, 0) / shareSum);
  const conc = p.allocation_concentration;
  const alpha = central.map((c) => Math.max(c * conc, 1e-6));

  const k = ARCHETYPES.length;
  const totalQalys = new Float64Array(n);
  const realization = new Float64Array(n);
  const qalyPerDeath = new Float64Array(n);
  const frontierQalys = new Float64Array(n);
  const valueUsd = new Float64Array(n);
  const bcRatio = new Float64Array(n);
  const blended = new Float64Array(n);
  const perArchetype = Array.from({ length: k }, () => new Float64Array(n));
  const costPerQaly = Array.from({ length: k }, () => new Float64Array(n));
  const credibility = Array.from({ length: k }, () => new Float64Array(n));
  const shares = Array.from({ length: k }, () => new Float64Array(n));

  const qd = p.conversions.qaly_per_death_averted;
  const vqalySpec = p.conversions.vqaly_usd;
  const frontierSpec = p.conversions.frontier_cost_per_qaly_usd;
  // The frontier prior is denominated at the 3% reference rate; rescale it to
  // the active rate via the child-QALE ratio so like-for-like holds at any
  // discount setting: cpq(rate) = cpq(3%) * QALE(3%) / QALE(rate).
  const fc = p.conversions.frontier_child;
  const frontierScale =
    discountedQale(fc.remaining_life_years.value, fc.utility_weight.value, 0.03) /
    discountedQale(fc.remaining_life_years.value, fc.utility_weight.value, rate);
  // The VQALY prior is likewise denominated at 3%; rescale by the adult
  // PV-QALY ratio (reproduces HHS Table 2 within ~1%) so benefit/cost stays
  // consistent with the discount slider.
  const va = p.conversions.vqaly_adult;
  const vqalyScale =
    discountedQale(va.remaining_life_years.value, va.utility_weight.value, 0.03) /
    discountedQale(va.remaining_life_years.value, va.utility_weight.value, rate);
  const randomizedTier = p.evidence_tiers.randomized;

  // Precompute per-archetype beta(a, b) credibility parameters ONCE — the tier
  // mean is interpolated toward 1 by credulity, then fixed across all draws.
  const credA = new Float64Array(k);
  const credB = new Float64Array(k);
  const credActive = new Uint8Array(k);
  for (let j = 0; j < k; j++) {
    const tierName = ARCHETYPES[j].causal_credibility;
    if (tierName && !p.evidence_tiers[tierName]) {
      // Fail closed, matching the Python model: an unknown tier is a data
      // error, not full credibility.
      throw new Error(`Unknown evidence tier "${tierName}" for ${ARCHETYPES[j].label}`);
    }
    const t = tierName ? p.evidence_tiers[tierName] : undefined;
    if (!t) {
      credActive[j] = 0;
    } else {
      const m = clamp(stanceMean(t.mean, tierName === "randomized"), 0.001, 0.999);
      credA[j] = m * t.concentration;
      credB[j] = (1 - m) * t.concentration;
      credActive[j] = 1;
    }
  }
  const fm = clamp(stanceMean(randomizedTier.mean, true), 0.001, 0.999);
  const frontierA = fm * randomizedTier.concentration;
  const frontierB = (1 - fm) * randomizedTier.concentration;

  for (let i = 0; i < n; i++) {
    // Shared per-draw quantities.
    const L = sampleOne(qd.remaining_life_expectancy, rng);
    const u = clamp(sampleOne(qd.utility_weight, rng), 0.01, 1);
    const qpd = discountedQale(L, u, rate);
    qalyPerDeath[i] = qpd;

    const real = Math.max(sampleOne(realSpec, rng), 0);
    realization[i] = real;

    const sh = rng.dirichlet(alpha);

    let total = 0;
    for (let j = 0; j < k; j++) {
      const a = ARCHETYPES[j];
      let cpq: number;
      if (a.method === "cost_per_qaly") {
        cpq = sampleOne(a.cost_per_qaly_usd!, rng);
      } else if (a.method === "cost_per_life") {
        cpq = sampleOne(a.cost_per_life_usd!, rng) / qpd;
      } else if (a.method === "cost_per_life_year") {
        // $/life-year -> $/QALY via the same utility draw used in the QALE
        // annuity (mirrors the Python model).
        cpq = sampleOne(a.cost_per_life_year_usd!, rng) / u;
      } else {
        // Fail closed, matching Python: an unknown method is a data error.
        throw new Error(`Unknown method "${a.method}" for ${a.label}`);
      }
      cpq = Math.max(cpq, floor);

      const cred = credActive[j] === 0 ? 1 : clampUnit(rng.beta(credA[j], credB[j]));

      const dollars = giving * sh[j];
      const q = (dollars * real * cred) / cpq;

      shares[j][i] = sh[j];
      costPerQaly[j][i] = cpq;
      credibility[j][i] = cred;
      perArchetype[j][i] = q;
      total += q;
    }
    totalQalys[i] = total;

    // Like-for-like frontier handicap (same realization + RCT-grade credibility),
    // with the QALY-equivalent cost rescaled to the active discount rate.
    const frontierCpq = sampleOne(frontierSpec, rng) * frontierScale;
    const frontierCred = clampUnit(rng.beta(frontierA, frontierB));
    frontierQalys[i] = (giving * real * frontierCred) / frontierCpq;

    const vqaly = sampleOne(vqalySpec, rng) * vqalyScale;
    valueUsd[i] = total * vqaly;
    bcRatio[i] = valueUsd[i] / giving;
    blended[i] = giving / Math.max(total, 1e-9);
  }

  return {
    n,
    giving,
    labels: ARCHETYPES.map((a) => a.label),
    tiers: ARCHETYPES.map((a) => a.causal_credibility ?? "—"),
    totalQalys,
    perArchetype,
    costPerQaly,
    credibility,
    shares,
    realization,
    qalyPerDeath,
    frontierQalys,
    valueUsd,
    bcRatio,
    blended,
  };
}

// ---------------------------------------------------------------------------
// Summary statistics
// ---------------------------------------------------------------------------
export function mean(a: ArrayLike<number>): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i];
  return s / a.length;
}

function quantileSorted(sorted: ArrayLike<number>, q: number): number {
  if (sorted.length === 0) return NaN;
  const idx = (q / 100) * (sorted.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

export function percentile(a: ArrayLike<number>, q: number): number {
  const arr = Float64Array.from(a as ArrayLike<number>).sort(); // numeric sort
  return quantileSorted(arr, q);
}

/** Sort once, read several quantiles — avoids re-sorting per quantile. */
export function quantilesOf(a: ArrayLike<number>, qs: number[]): number[] {
  const arr = Float64Array.from(a as ArrayLike<number>).sort();
  return qs.map((q) => quantileSorted(arr, q));
}

export interface ArchetypeSummary {
  key: string;
  label: string;
  tier: string;
  meanQalys: number;
  medianQalys: number;
  medianCostPerQaly: number;
  medianCredibility: number;
  share: number;
}

export interface Summary {
  median: number;
  mean: number;
  p05: number;
  p95: number;
  blendedMedian: number;
  blendedP05: number;
  blendedP95: number;
  valueMedian: number;
  bcMedian: number;
  bcP05: number;
  bcP95: number;
  frontierMedian: number;
  frontierMultiple: number;
  perArchetype: ArchetypeSummary[];
}

export function summarize(r: ModelResult): Summary {
  const tq = r.totalQalys;
  const ratios = new Float64Array(r.n);
  for (let i = 0; i < r.n; i++) ratios[i] = r.frontierQalys[i] / Math.max(tq[i], 1e-9);

  const perArchetype: ArchetypeSummary[] = ARCHETYPES.map((a, j) => ({
    key: ARCHETYPE_KEYS[j],
    label: a.label,
    tier: a.causal_credibility ?? "—",
    meanQalys: mean(r.perArchetype[j]),
    medianQalys: quantilesOf(r.perArchetype[j], [50])[0],
    medianCostPerQaly: quantilesOf(r.costPerQaly[j], [50])[0],
    medianCredibility: quantilesOf(r.credibility[j], [50])[0],
    share: quantilesOf(r.shares[j], [50])[0],
  })).sort((x, y) => y.meanQalys - x.meanQalys);

  const [median, p05, p95] = quantilesOf(tq, [50, 5, 95]);
  const [blendedMedian, blendedP05, blendedP95] = quantilesOf(r.blended, [50, 5, 95]);
  const [bcMedian, bcP05, bcP95] = quantilesOf(r.bcRatio, [50, 5, 95]);
  return {
    median,
    mean: mean(tq),
    p05,
    p95,
    blendedMedian,
    blendedP05,
    blendedP95,
    valueMedian: quantilesOf(r.valueUsd, [50])[0],
    bcMedian,
    bcP05,
    bcP95,
    frontierMedian: quantilesOf(r.frontierQalys, [50])[0],
    frontierMultiple: quantilesOf(ratios, [50])[0],
    perArchetype,
  };
}

// ---------------------------------------------------------------------------
// Probabilistic sensitivity (Spearman tornado) — port of driver_sensitivity
// ---------------------------------------------------------------------------
function ranks(a: ArrayLike<number>): Float64Array {
  // Midranks: ties get their group-average rank, so tied values contribute no
  // spurious sort-order correlation.
  const n = a.length;
  const idx = Array.from({ length: n }, (_, i) => i).sort((x, y) => a[x] - a[y]);
  const r = new Float64Array(n);
  let i = 0;
  while (i < n) {
    let j = i;
    while (j + 1 < n && a[idx[j + 1]] === a[idx[i]]) j++;
    const avg = (i + j) / 2;
    for (let k = i; k <= j; k++) r[idx[k]] = avg;
    i = j + 1;
  }
  return r;
}

export function spearman(x: ArrayLike<number>, y: ArrayLike<number>): number {
  const rx = ranks(x);
  const ry = ranks(y);
  const n = rx.length;
  const mx = (n - 1) / 2;
  let num = 0;
  let dx = 0;
  let dy = 0;
  for (let i = 0; i < n; i++) {
    const ax = rx[i] - mx;
    const ay = ry[i] - mx;
    num += ax * ay;
    dx += ax * ax;
    dy += ay * ay;
  }
  const den = Math.sqrt(dx * dy);
  return den ? num / den : 0;
}

export interface Driver {
  name: string;
  rho: number;
}

export function driverSensitivity(r: ModelResult, top = 12, sampleN = 8000): Driver[] {
  // Rank correlations converge fast, so subsample for speed in the live UI.
  const m = Math.min(r.n, sampleN);
  const sub = (a: Float64Array) => (m === r.n ? a : a.subarray(0, m));
  const tq = sub(r.totalQalys);
  const rows: Driver[] = [
    { name: "Realization factor (global)", rho: spearman(sub(r.realization), tq) },
    { name: "QALYs per death averted", rho: spearman(sub(r.qalyPerDeath), tq) },
  ];
  for (let j = 0; j < r.labels.length; j++) {
    rows.push({ name: `$/QALY · ${r.labels[j]}`, rho: spearman(sub(r.costPerQaly[j]), tq) });
    rows.push({ name: `Credibility · ${r.labels[j]}`, rho: spearman(sub(r.credibility[j]), tq) });
    rows.push({ name: `Allocation · ${r.labels[j]}`, rho: spearman(sub(r.shares[j]), tq) });
  }
  rows.sort((x, y) => Math.abs(y.rho) - Math.abs(x.rho));
  return rows.slice(0, top);
}

// ---------------------------------------------------------------------------
// One-shot compute for the UI / Web Worker: run + summarize + sensitivity +
// a log-scale histogram of total QALYs. Returns small, structured-clone-safe
// objects (no typed arrays), so it can cross a worker boundary cheaply.
// ---------------------------------------------------------------------------
export interface ComputeOutput {
  summary: Summary;
  drivers: Driver[];
  hist: { x: number; count: number }[];
  medianLog: number;
}

export function computeAll(overrides: Overrides): ComputeOutput {
  const r = runModel(overrides);
  const summary = summarize(r);
  const drivers = driverSensitivity(r, 10);

  const lo = 4;
  const hi = 6.5;
  const nbins = 56;
  const hist = Array.from({ length: nbins }, (_, i) => ({
    x: lo + ((i + 0.5) * (hi - lo)) / nbins,
    count: 0,
  }));
  for (let i = 0; i < r.totalQalys.length; i++) {
    const lg = Math.log10(Math.max(r.totalQalys[i], 1));
    const b = Math.floor(((lg - lo) / (hi - lo)) * nbins);
    if (b >= 0 && b < nbins) hist[b].count++;
  }
  return { summary, drivers, hist, medianLog: Math.log10(Math.max(summary.median, 1)) };
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
function clamp(x: number, lo: number, hi: number): number {
  return Math.min(Math.max(x, lo), hi);
}
function clampUnit(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x;
}

export const TIER_LABELS: Record<string, string> = {
  randomized: "RCT / lottery",
  strong_quasi: "strong quasi-exp",
  moderate_quasi: "quasi-exp (contested)",
  observational: "observational",
  projection: "model projection",
  assumption: "assumption",
};

export function fmtQalys(x: number): string {
  const ax = Math.abs(x);
  if (ax >= 999_500) return (x / 1e6).toFixed(2) + "M";
  if (ax >= 1000) return Math.round(x / 1e3) + "k";
  return Math.round(x).toString();
}

export function fmtDollars(x: number): string {
  const ax = Math.abs(x);
  if (ax >= 999_500_000) return "$" + (x / 1e9).toFixed(1) + "B";
  if (ax >= 999_500) return "$" + Math.round(x / 1e6) + "M";
  if (ax >= 1000) return "$" + Math.round(x / 1e3) + "k";
  return "$" + Math.round(x).toString();
}
