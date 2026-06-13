import { describe, expect, it } from 'vitest';
import {
  AGGREGATE_CATEGORIES,
  AGGREGATE_TOTAL_LITERS,
  AGGREGATE_TOTAL_MULTIPLE_MAX,
  AGGREGATE_TOTAL_MULTIPLE_MIN,
  AI_2025_MAX_LITERS,
  AI_2025_MIN_LITERS,
  DRINKS_WITH_QUERIES,
  GOOGLE_WATER_PER_PROMPT_ML,
  IMPLIED_POPULATION,
  WATER_PER_QUERY_ML,
  dailyUseLabel,
  formatCompact,
  formatMultipleRange,
  roundToSigFigs,
} from './drinking-ai';

function drink(id: string) {
  const found = DRINKS_WITH_QUERIES.find((d) => d.id === id);
  if (!found) throw new Error(`missing drink ${id}`);
  return found;
}

function category(id: string) {
  const found = AGGREGATE_CATEGORIES.find((c) => c.id === id);
  if (!found) throw new Error(`missing category ${id}`);
  return found;
}

describe('per-query baseline', () => {
  it('converts 0.000085 gallons to about 0.32 mL', () => {
    expect(WATER_PER_QUERY_ML).toBeCloseTo(0.3218, 3);
  });

  it('lands within 25% of Google\'s published Gemini median', () => {
    const ratio = WATER_PER_QUERY_ML / GOOGLE_WATER_PER_PROMPT_ML;
    expect(ratio).toBeGreaterThan(1);
    expect(ratio).toBeLessThan(1.25);
  });
});

describe('per-drink query equivalents', () => {
  const expected: Record<string, number> = {
    beer: 331_000,
    wine: 442_000,
    cocktail: 56_000,
    soda: 373_000,
    'orange-juice': 626_000,
    'bottled-water': 1_534,
    'tap-water': 1_100,
  };

  for (const [id, queries] of Object.entries(expected)) {
    it(`${id} is about ${queries.toLocaleString()} queries`, () => {
      expect(drink(id).queries).toBeGreaterThan(queries * 0.99);
      expect(drink(id).queries).toBeLessThan(queries * 1.01);
    });
  }

  it('every drink except tap water links a source', () => {
    for (const d of DRINKS_WITH_QUERIES) {
      if (d.id === 'tap-water') expect(d.sourceUrl).toBeUndefined();
      else expect(d.sourceUrl).toMatch(/^https:\/\//);
    }
  });
});

describe('time-equivalence framing at 30 queries/day', () => {
  it('beer covers about 30 years', () => {
    expect(drink('beer').usageLabel).toBe('30 years');
  });
  it('orange juice covers about 57 years', () => {
    expect(drink('orange-juice').usageLabel).toBe('57 years');
  });
  it('tap water covers about 37 days', () => {
    expect(drink('tap-water').usageLabel).toBe('37 days');
  });
  it('pluralizes a single day', () => {
    expect(dailyUseLabel(30)).toBe('1 day');
  });
});

describe('aggregate categories vs 2025 AI', () => {
  it('AI range is 312.5-764.6 billion liters', () => {
    expect(AI_2025_MIN_LITERS).toBe(312.5e9);
    expect(AI_2025_MAX_LITERS).toBe(764.6e9);
  });

  it('soda derivation implies a US-scale population', () => {
    expect(IMPLIED_POPULATION).toBeGreaterThan(340e6);
    expect(IMPLIED_POPULATION).toBeLessThan(365e6);
  });

  const expectedTrillions: Record<string, number> = {
    soda: 15.3,
    beer: 7.0,
    wine: 3.2,
    'orange-juice': 2.3,
    'bottled-water': 0.088,
  };

  for (const [id, trillions] of Object.entries(expectedTrillions)) {
    it(`${id} totals about ${trillions} trillion liters`, () => {
      expect(category(id).totalWaterLiters / 1e12).toBeCloseTo(trillions, 1);
    });
  }

  it('soda is 20-49x the AI range', () => {
    expect(category('soda').multipleMin).toBeCloseTo(20.1, 1);
    expect(category('soda').multipleMax).toBeCloseTo(49.1, 1);
  });

  it('beer is 9-22x the AI range', () => {
    expect(category('beer').multipleMin).toBeCloseTo(9.2, 1);
    expect(category('beer').multipleMax).toBeCloseTo(22.4, 1);
  });

  it('bottled water stays below the AI range', () => {
    expect(category('bottled-water').multipleMax).toBeLessThan(0.3);
  });

  it('the five categories sum to about 27.9 trillion liters, 37-89x AI', () => {
    expect(AGGREGATE_TOTAL_LITERS / 1e12).toBeCloseTo(27.9, 1);
    expect(AGGREGATE_TOTAL_MULTIPLE_MIN).toBeCloseTo(36.5, 1);
    expect(AGGREGATE_TOTAL_MULTIPLE_MAX).toBeCloseTo(89.4, 1);
  });

  it('every category links at least one source', () => {
    for (const c of AGGREGATE_CATEGORIES) {
      expect(c.sources.length).toBeGreaterThanOrEqual(1);
      for (const s of c.sources) expect(s.url).toMatch(/^https:\/\//);
    }
  });

  it('categories are sorted by total, largest first', () => {
    const totals = AGGREGATE_CATEGORIES.map((c) => c.totalWaterLiters);
    expect([...totals].sort((a, b) => b - a)).toEqual(totals);
  });
});

describe('display rounding', () => {
  it('rounds query counts to 3 significant figures', () => {
    expect(roundToSigFigs(330_992)).toBe(331_000);
    expect(roundToSigFigs(441_572)).toBe(442_000);
    expect(roundToSigFigs(55_943)).toBe(55_900);
    expect(roundToSigFigs(1_533.6)).toBe(1_530);
    expect(roundToSigFigs(1_103.3)).toBe(1_100);
    expect(roundToSigFigs(0)).toBe(0);
  });
});

describe('formatting', () => {
  it('formats compact magnitudes', () => {
    expect(formatCompact(7.0e12)).toBe('7 trillion');
    expect(formatCompact(764.6e9)).toBe('764.6 billion');
    expect(formatCompact(353.7e6)).toBe('353.7 million');
  });

  it('formats multiple ranges with sensible precision', () => {
    expect(formatMultipleRange(9.165, 22.42)).toBe('9.2–22x');
    expect(formatMultipleRange(20.07, 49.1)).toBe('20–49x');
    expect(formatMultipleRange(0.116, 0.283)).toBe('0.1–0.3x');
  });
});
