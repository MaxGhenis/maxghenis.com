import { describe, it, expect } from 'vitest';
import {
  ADVISORY_LEVEL_COUNTS,
  COUNTRIES,
  FIT,
  FITTED,
  GLOBAL_TREND,
  META,
  TRAVELER_DEATH_CAUSES,
  byName,
  homicideChange,
  lawOrderChange,
  predictFelt,
  topBy,
} from './safety';

// These pin the numbers the page states in prose. If regenerating the data
// moves one, the page copy has to move with it — that's the point.
describe('dataset shape', () => {
  it('carries the full Gallup 2024 field year', () => {
    expect(COUNTRIES.length).toBe(144);
    expect(META.gallupRespondents).toBe(145170);
    expect(META.fieldYear).toBe(2024);
  });

  it('gives every country a felt-safe reading', () => {
    const missing = COUNTRIES.filter(
      (c) => typeof c.feltSafe !== 'number' || Number.isNaN(c.feltSafe),
    );
    expect(missing).toEqual([]);
  });

  it('computes a residual exactly when a homicide rate exists', () => {
    for (const c of COUNTRIES) {
      expect(c.residual === null).toBe(c.homicide === null);
      expect(c.predicted === null).toBe(c.homicide === null);
    }
  });

  it('only uses homicide readings from 2015 or later', () => {
    for (const c of COUNTRIES) {
      if (c.homicideYear !== null) expect(c.homicideYear).toBeGreaterThanOrEqual(2015);
    }
  });

  it('keeps felt-safe percentages in range', () => {
    for (const c of COUNTRIES) {
      expect(c.feltSafe).toBeGreaterThanOrEqual(0);
      expect(c.feltSafe).toBeLessThanOrEqual(100);
    }
  });
});

describe('the fit', () => {
  it('reproduces the stated correlation', () => {
    expect(FIT.n).toBe(FITTED.length);
    expect(FIT.n).toBeGreaterThanOrEqual(110);
    expect(FIT.r).toBeCloseTo(-0.735, 2);
    expect(FIT.r2).toBeCloseTo(0.54, 2);
    expect(FIT.spearman).toBeCloseTo(-0.728, 2);
  });

  it('slopes downward — more homicide, less felt safety', () => {
    expect(FIT.slope).toBeLessThan(0);
    expect(predictFelt(0.5)).toBeGreaterThan(predictFelt(40));
  });

  it('agrees with the stored per-country predictions', () => {
    for (const c of FITTED) {
      expect(predictFelt(c.homicide!)).toBeCloseTo(c.predicted!, 1);
      expect(c.feltSafe - c.predicted!).toBeCloseTo(c.residual!, 1);
    }
  });
});

describe('headline country figures', () => {
  it('Egypt reads 82% felt safe and 87 on the index', () => {
    const eg = byName('Egypt')!;
    expect(eg.feltSafe).toBe(82);
    expect(eg.lawOrder).toBe(87);
    expect(eg.homicideYear).toBe(2017);
  });

  it('the United States reads 71% felt safe and 84 on the index', () => {
    const us = byName('United States')!;
    expect(us.feltSafe).toBe(71);
    expect(us.lawOrder).toBe(84);
    expect(us.homicide).toBeGreaterThan(5);
  });

  it("Egypt's positive residual is smaller than the United States'", () => {
    const eg = byName('Egypt')!;
    const us = byName('United States')!;
    expect(eg.residual!).toBeGreaterThan(0);
    expect(us.residual!).toBeGreaterThan(0);
    expect(eg.residual!).toBeLessThan(us.residual!);
  });

  it('Singapore tops felt safety and South Africa sits last', () => {
    const ranked = topBy('feltSafe', 1);
    expect(ranked[0].country).toBe('Singapore');
    expect(ranked[0].feltSafe).toBe(98);
    const last = topBy('feltSafe', 1, 'asc');
    expect(last[0].country).toBe('South Africa');
    expect(last[0].feltSafe).toBe(33);
  });

  it('Ecuador more than tripled its homicide rate since 2012', () => {
    const ec = byName('Ecuador')!;
    const chg = homicideChange(ec, 2012)!;
    expect(chg.ratio).toBeGreaterThan(3);
    expect(chg.last.rate).toBeGreaterThan(40);
  });

  it('tracks a year-over-year index change where both years exist', () => {
    const withBoth = COUNTRIES.filter((c) => lawOrderChange(c) !== null);
    expect(withBoth.length).toBeGreaterThan(120);
  });
});

describe('traveler-facing data', () => {
  it('has every current advisory level represented', () => {
    for (const lvl of ['1', '2', '3', '4']) {
      expect(ADVISORY_LEVEL_COUNTS[lvl]).toBeGreaterThan(0);
    }
  });

  it('gives Egypt a level 2 advisory', () => {
    const eg = byName('Egypt')!;
    expect(eg.advisory?.level).toBe(2);
  });

  it('has cause-of-death shares that sum to 100', () => {
    const total = TRAVELER_DEATH_CAUSES.reduce((s, c) => s + c.pct, 0);
    expect(total).toBe(100);
  });

  it('puts vehicle accidents above homicide for travelers', () => {
    const vehicle = TRAVELER_DEATH_CAUSES.find((c) => c.cause.includes('Vehicle'))!;
    const homicide = TRAVELER_DEATH_CAUSES.find((c) => c.cause === 'Homicide')!;
    expect(vehicle.pct).toBeGreaterThan(homicide.pct);
  });
});

describe('global trend', () => {
  it('peaks at 73% in 2024', () => {
    const latest = GLOBAL_TREND[GLOBAL_TREND.length - 1];
    expect(latest.year).toBe(2024);
    expect(latest.pct).toBe(73);
    expect(Math.max(...GLOBAL_TREND.map((p) => p.pct))).toBe(73);
  });

  it('runs in chronological order', () => {
    const years = GLOBAL_TREND.map((p) => p.year);
    expect([...years].sort((a, b) => a - b)).toEqual(years);
  });
});
