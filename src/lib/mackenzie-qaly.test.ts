import { describe, expect, it } from "vitest";
import {
  ARCHETYPE_KEYS,
  PARAMS,
  RNG,
  discountedQale,
  driverSensitivity,
  fmtDollars,
  fmtQalys,
  impliedMedian,
  percentile,
  runModel,
  sampleOne,
  spearman,
  summarize,
} from "./mackenzie-qaly";

// Reference values from the Python model (n=100k seed=0, round 3):
//   giving $30.30B (2026$, from $26.39B nominal disclosed tranches)
//   median 204,840 · mean 224,762 · p05 94,685 · p95 423,654
//   blended $349,922/QALY · benefit-cost 2.12 (HHS VQALY) · frontier multiple 1,215
// Monte Carlo output is RNG-sensitive, so we assert distributional agreement
// with generous tolerances, not bit-parity.

describe("distribution samplers", () => {
  it("lognormal_ci recovers its 5th/95th percentiles", () => {
    const rng = new RNG(1);
    const draws = Array.from({ length: 200000 }, () =>
      sampleOne({ dist: "lognormal_ci", low: 1e4, high: 1e5 }, rng),
    );
    expect(percentile(draws, 5)).toBeGreaterThan(9e3);
    expect(percentile(draws, 5)).toBeLessThan(1.1e4);
    expect(percentile(draws, 95)).toBeGreaterThan(9e4);
    expect(percentile(draws, 95)).toBeLessThan(1.1e5);
  });

  it("beta(mean, concentration) has the right mean and stays in [0,1]", () => {
    const rng = new RNG(2);
    let lo = Infinity;
    let hi = -Infinity;
    let sum = 0;
    const N = 200000;
    for (let i = 0; i < N; i++) {
      const v = sampleOne({ dist: "beta", mean: 0.22, concentration: 6 }, rng);
      if (v < lo) lo = v;
      if (v > hi) hi = v;
      sum += v;
    }
    expect(lo).toBeGreaterThanOrEqual(0);
    expect(hi).toBeLessThanOrEqual(1);
    expect(sum / N).toBeGreaterThan(0.21);
    expect(sum / N).toBeLessThan(0.23);
  });

  it("dirichlet rows sum to 1", () => {
    const rng = new RNG(3);
    for (let t = 0; t < 100; t++) {
      const v = rng.dirichlet([1.8, 3, 13, 4]);
      const s = v.reduce((p, q) => p + q, 0);
      expect(s).toBeCloseTo(1, 10);
      expect(Math.min(...v)).toBeGreaterThanOrEqual(0);
    }
  });

  it("loguniform stays within bounds", () => {
    const rng = new RNG(4);
    for (let t = 0; t < 5000; t++) {
      const v = sampleOne({ dist: "loguniform", low: 100, high: 300 }, rng);
      expect(v).toBeGreaterThanOrEqual(100);
      expect(v).toBeLessThanOrEqual(300);
    }
  });
});

describe("discountedQale", () => {
  it("zero rate is the simple product", () => {
    expect(discountedQale(20, 0.8, 0)).toBeCloseTo(16, 9);
  });
  it("applies the half-cycle correction", () => {
    const ordinary = (0.75 * (1 - Math.pow(1.03, -25))) / 0.03;
    expect(discountedQale(25, 0.75, 0.03)).toBeCloseTo(ordinary * Math.pow(1.03, 0.5), 9);
  });
});

describe("impliedMedian", () => {
  it("loguniform implied median is the geometric mean", () => {
    expect(impliedMedian({ dist: "loguniform", low: 100, high: 400 })).toBeCloseTo(200, 6);
  });
});

describe("model end-to-end", () => {
  const r = runModel({ n: 40000, seed: 0 });
  const s = summarize(r);

  it("uses one QALY-equivalent frontier parameter", () => {
    const conversions = PARAMS.conversions as Record<string, unknown>;
    expect(conversions.frontier_cost_per_qaly_usd).toBeDefined();
    expect(conversions.frontier_cost_per_daly_usd).toBeUndefined();
    expect(conversions.daly_to_qaly_factor).toBeUndefined();
  });

  it("giving is the derived 2026-dollar tranche total, above nominal", () => {
    const meta = PARAMS.meta;
    const real = meta.giving_tranches.reduce(
      (acc, t) => acc + (t.nominal_usd * meta.cpi_target) / t.cpi,
      0,
    );
    expect(meta.total_giving_usd).toBeCloseTo(real, 0);
    expect(meta.total_giving_nominal_usd).toBeCloseTo(26.3934e9, -8);
    expect(meta.total_giving_usd).toBeGreaterThan(meta.total_giving_nominal_usd);
    expect(r.giving).toBeCloseTo(meta.total_giving_usd, 0);
  });

  it("matches the checked reference range within Monte Carlo tolerance", () => {
    expect(s.median).toBeGreaterThan(170000);
    expect(s.median).toBeLessThan(245000);
    expect(s.mean).toBeGreaterThan(185000);
    expect(s.mean).toBeLessThan(270000);
    expect(s.p05).toBeGreaterThan(75000);
    expect(s.p95).toBeLessThan(510000);
  });

  it("blended cost-per-QALY and benefit-cost land near the reference", () => {
    expect(s.blendedMedian).toBeGreaterThan(120000);
    expect(s.blendedMedian).toBeLessThan(185000);
    expect(s.blendedP05).toBeGreaterThan(0);
    expect(s.blendedP05).toBeLessThan(s.blendedMedian);
    expect(s.blendedP95).toBeGreaterThan(s.blendedMedian);
    expect(s.bcMedian).toBeGreaterThan(4.0);
    expect(s.bcMedian).toBeLessThan(6.0);
  });

  it("frontier is handicapped but still ~1,000x+ better per dollar", () => {
    expect(s.frontierMultiple).toBeGreaterThan(380);
    expect(s.frontierMultiple).toBeLessThan(680);
    // handicapped: below the raw giving / frontier_cpq
    const rawFrontier = r.giving / impliedMedian(PARAMS.conversions.frontier_cost_per_qaly_usd);
    expect(s.frontierMedian).toBeLessThan(rawFrontier);
  });

  it("CHC life-year costs are converted to QALYs (unit-slip regression)", () => {
    const j = ARCHETYPE_KEYS.indexOf("health_chc");
    expect(j).toBeGreaterThanOrEqual(0);
    const cpq = r.costPerQaly[j];
    const medianCpq = percentile(cpq, 50);
    // $/QALY must exceed the $/life-year prior's median (divided by utility<1).
    const cply = impliedMedian(PARAMS.archetypes.health_chc.cost_per_life_year_usd!);
    expect(medianCpq).toBeGreaterThan(cply);
    expect(medianCpq).toBeGreaterThan(80000);
    expect(medianCpq).toBeLessThan(140000);
  });

  it("per-archetype QALYs sum to the total", () => {
    for (let i = 0; i < 200; i++) {
      let stacked = 0;
      for (let j = 0; j < r.perArchetype.length; j++) stacked += r.perArchetype[j][i];
      expect(stacked).toBeCloseTo(r.totalQalys[i], 4);
    }
  });

  it("allocation shares sum to 1 each draw; credibility in [0,1]", () => {
    for (let i = 0; i < 200; i++) {
      let sh = 0;
      for (let j = 0; j < r.shares.length; j++) {
        sh += r.shares[j][i];
        expect(r.credibility[j][i]).toBeGreaterThanOrEqual(0);
        expect(r.credibility[j][i]).toBeLessThanOrEqual(1);
      }
      expect(sh).toBeCloseTo(1, 6);
    }
  });

  it("global health dominates; US health archetypes still rank high", () => {
    expect(s.perArchetype[0].label).toContain("Global health");
    // Non-US delivery is ~5% of dollars but most of the modeled QALYs.
    expect(s.perArchetype[0].meanQalys / s.mean).toBeGreaterThan(0.5);
    const top4 = s.perArchetype.slice(0, 4).map((a) => a.label);
    expect(top4.some((l) => l.includes("insurance"))).toBe(true);
    expect(top4.some((l) => l.includes("mental"))).toBe(true);
    const top6 = s.perArchetype.slice(0, 6).map((a) => a.label);
    expect(top6.some((l) => l.includes("housing"))).toBe(true);
  });

  it("equity & justice contributes little health despite a large allocation", () => {
    const eq = s.perArchetype.find((a) => a.label.includes("Equity"))!;
    expect(eq.share).toBeGreaterThan(0.15); // ~22% of dollars
    expect(eq.meanQalys).toBeLessThan(3000); // assumption tier -> shrunk hard
  });
});

describe("evidence-stance slider", () => {
  it("stance spans RCT-only through the best guess to face value", () => {
    const rctOnly = summarize(runModel({ n: 30000, seed: 0, credulity: 0 }));
    const best = summarize(runModel({ n: 30000, seed: 0, credulity: 0.5 }));
    const faceValue = summarize(runModel({ n: 30000, seed: 0, credulity: 1 }));
    expect(rctOnly.median).toBeLessThan(50000); // only randomized evidence counts
    expect(best.median).toBeGreaterThan(4 * rctOnly.median);
    expect(faceValue.median).toBeGreaterThan(1.6 * best.median);
    expect(faceValue.median).toBeGreaterThan(185000); // approaches the "trust everything" figure
  });
});

describe("sensitivity", () => {
  it("realization is a positive driver; a $/QALY is a negative driver", () => {
    const r = runModel({ n: 30000, seed: 0 });
    const drivers = driverSensitivity(r, 40);
    const real = drivers.find((d) => d.name.startsWith("Realization"))!;
    expect(real.rho).toBeGreaterThan(0.05);
    const cpqs = drivers.filter((d) => d.name.startsWith("$/QALY"));
    expect(Math.min(...cpqs.map((d) => d.rho))).toBeLessThan(0);
  });

  it("spearman is +1 for a monotonic increasing relationship", () => {
    const x = Array.from({ length: 500 }, (_, i) => i);
    const y = x.map((v) => v ** 3);
    expect(spearman(x, y)).toBeCloseTo(1, 6);
  });
});

describe("formatters", () => {
  it("formats QALYs across unit boundaries", () => {
    expect(fmtQalys(197000)).toBe("197k");
    expect(fmtQalys(999999)).toBe("1.00M");
    expect(fmtDollars(26_300_000_000)).toBe("$26.3B");
    expect(fmtDollars(999999)).toBe("$1M");
  });
});

describe("discount-rate consistency", () => {
  it("rescales VQALY and the frontier at non-reference rates", () => {
    const base = summarize(runModel({ n: 20000, seed: 13, discountRate: 0.03 }));
    const hi = summarize(runModel({ n: 20000, seed: 13, discountRate: 0.07 }));
    // Per-QALY monetization rises at 7%, approximating HHS's 1205/726 ratio.
    const impliedRatio =
      hi.valueMedian / hi.median / (base.valueMedian / base.median);
    expect(impliedRatio).toBeGreaterThan(1.5);
    expect(impliedRatio).toBeLessThan(1.85);
    // Frontier cost rises too, so frontier QALYs fall.
    expect(hi.frontierMedian).toBeLessThan(0.8 * base.frontierMedian);
  });
});
