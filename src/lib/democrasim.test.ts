import { describe, expect, it } from "vitest";
import {
  ASSETS,
  erf,
  expectedShares,
  meanRankingAccuracy,
  pTracked,
  sigmaGrid,
  trackingCurve,
} from "./democrasim";

// The JSON ships test vectors computed by democrasim's
// analytic_plurality_curve on the FULL 120,408-row electorate. This port
// runs on the compressed margin atoms, so one tolerance covers both the
// erf approximation (<1.5e-7) and the compression error (verified 5.4e-4
// worst-case at export time).
const TOLERANCE = 2e-3;

describe("erf", () => {
  it("matches known values within the A&S 7.1.26 bound", () => {
    expect(erf(0)).toBe(0);
    expect(erf(1)).toBeCloseTo(0.8427007929, 5);
    expect(erf(-1)).toBeCloseTo(-0.8427007929, 5);
    expect(erf(2)).toBeCloseTo(0.995322265, 5);
    expect(erf(1) + erf(-1)).toBe(0); // odd symmetry is exact
  });
});

describe("pTracked against full-electorate Python vectors", () => {
  for (const vector of ASSETS.test_vectors) {
    const label = `${vector.world} σ=${vector.sigma} bias=${vector.bias_toward_b} n=${vector.n_voters}`;
    it(label, () => {
      const world = ASSETS.worlds[vector.world];
      expect(
        pTracked(world, vector.sigma, vector.bias_toward_b, vector.n_voters),
      ).toBeCloseTo(vector.p_tracked, 2.5);
      const shares = expectedShares(world, vector.sigma, vector.bias_toward_b);
      expect(
        Math.abs(shares.optimal - vector.share_optimal),
      ).toBeLessThan(TOLERANCE);
      expect(
        Math.abs(shares.abstain - vector.share_abstain),
      ).toBeLessThan(TOLERANCE);
      if (vector.mean_ranking_accuracy !== null) {
        expect(
          Math.abs(
            meanRankingAccuracy(world, vector.sigma, vector.bias_toward_b) -
              vector.mean_ranking_accuracy,
          ),
        ).toBeLessThan(TOLERANCE);
      }
    });
  }
});

describe("the knife-edge, qualitatively", () => {
  const world = ASSETS.worlds.per_capita;

  it("perfect information elects Policy B in the large-population limit", () => {
    expect(pTracked(world, 0, 0, null)).toBe(0);
  });

  it("moderate noise elects Policy A with certainty in the limit", () => {
    expect(pTracked(world, 1000, 0, null)).toBe(1);
  });

  it("the sign-flip counterfactual tracks at perfect information", () => {
    expect(pTracked(ASSETS.worlds.sign_flip, 0, 0, null)).toBe(1);
  });

  it("gross impacts abstain the no-stakes mass and track at σ=0", () => {
    const shares = expectedShares(ASSETS.worlds.none, 0, 0);
    expect(shares.abstain).toBeGreaterThan(0.7);
    expect(pTracked(ASSETS.worlds.none, 0, 0, null)).toBe(1);
  });

  it("~$221 of shared bias flips the moderate-noise election", () => {
    expect(pTracked(world, 1000, 150, 10_001)).toBeGreaterThan(0.99);
    expect(pTracked(world, 1000, 300, 10_001)).toBeLessThan(0.01);
  });

  it("small electorates track less reliably at fixed σ", () => {
    const small = pTracked(world, 1000, 0, 101);
    const large = pTracked(world, 1000, 0, 100_001);
    expect(small).toBeLessThan(large);
  });
});

describe("grid and curve helpers", () => {
  it("sigmaGrid starts at zero and spans the range", () => {
    const grid = sigmaGrid();
    expect(grid[0]).toBe(0);
    expect(grid[1]).toBeCloseTo(1, 6);
    expect(grid[grid.length - 1]).toBeCloseTo(100_000, 0);
  });

  it("trackingCurve returns one point per sigma", () => {
    const curve = trackingCurve(ASSETS.worlds.per_capita, 0, 10_001);
    expect(curve.length).toBe(sigmaGrid().length);
    expect(curve.every((p) => p.pTracked >= 0 && p.pTracked <= 1)).toBe(true);
  });
});

describe("asset integrity", () => {
  it("worlds carry positive weights and finite margins", () => {
    for (const world of Object.values(ASSETS.worlds)) {
      expect(world.margins.length).toBe(world.weights.length);
      expect(world.weights.every((w) => w > 0)).toBe(true);
      expect(world.margins.every((m) => Number.isFinite(m))).toBe(true);
    }
  });

  it("provenance names the generator and artifact hash", () => {
    expect(ASSETS.provenance.generator).toContain("democrasim");
    expect(ASSETS.provenance.artifact_sha256).toMatch(/^[0-9a-f]{64}$/);
  });
});
