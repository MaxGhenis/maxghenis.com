import { describe, expect, it } from 'vitest';
import {
  AGGREGATE_CATEGORIES,
  AGGREGATE_TOTAL_LITERS,
  AGGREGATE_TOTAL_MULTIPLE_MAX,
  AGGREGATE_TOTAL_MULTIPLE_MIN,
  AI_2025_MAX_LITERS,
  AI_2025_MIN_LITERS,
  ALTMAN_ML_PER_QUERY,
  DEFAULT_SCOPE_ID,
  GOOGLE_WATER_PER_PROMPT_ML,
  IMPLIED_POPULATION,
  QUERY_SCOPES,
  SCOPED_DRINKS,
  WATER_PER_QUERY_ML,
  dailyUseLabel,
  formatCompact,
  formatMultipleRange,
  roundToSigFigs,
} from './drinking-ai';

function drink(id: string) {
  const found = SCOPED_DRINKS.find((d) => d.id === id);
  if (!found) throw new Error(`missing drink ${id}`);
  return found;
}

function category(id: string) {
  const found = AGGREGATE_CATEGORIES.find((c) => c.id === id);
  if (!found) throw new Error(`missing category ${id}`);
  return found;
}

describe('per-query scopes', () => {
  it('on-site scope converts 0.000085 gallons to about 0.32 mL', () => {
    expect(ALTMAN_ML_PER_QUERY).toBeCloseTo(0.3218, 3);
    expect(WATER_PER_QUERY_ML).toBe(ALTMAN_ML_PER_QUERY);
  });

  it('on-site lands within 25% of Google\'s published Gemini median', () => {
    const ratio = ALTMAN_ML_PER_QUERY / GOOGLE_WATER_PER_PROMPT_ML;
    expect(ratio).toBeGreaterThan(1);
    expect(ratio).toBeLessThan(1.25);
  });

  it('exposes three scopes spanning two orders of magnitude', () => {
    expect(QUERY_SCOPES.map((s) => s.id)).toEqual(['onsite', 'operational', 'lifecycle']);
    expect(QUERY_SCOPES[0].perQueryMl).toBeCloseTo(0.322, 2);
    expect(QUERY_SCOPES[1].perQueryMl).toBe(2.0);
    expect(QUERY_SCOPES[2].perQueryMl).toBe(45);
  });

  it('default scope is the on-site figure', () => {
    expect(DEFAULT_SCOPE_ID).toBe('onsite');
  });

  it('every scope links a working https source', () => {
    for (const s of QUERY_SCOPES) expect(s.sourceUrl).toMatch(/^https:\/\//);
  });
});

describe('per-drink query equivalents (on-site scope)', () => {
  const expected: Record<string, number> = {
    beer: 331_000,
    wine: 396_000,
    cocktail: 55_900,
    coffee: 412_000,
    tea: 82_600,
    soda: 373_000,
    'orange-juice': 784_000,
    milk: 773_000,
    'bottled-water': 1_530,
    'tap-water': 1_100,
  };

  for (const [id, queries] of Object.entries(expected)) {
    it(`${id} is about ${queries.toLocaleString()} queries`, () => {
      expect(roundToSigFigs(drink(id).queriesByScope.onsite)).toBe(queries);
    });
  }

  it('orange juice and milk outrank beer per serving', () => {
    const onsite = SCOPED_DRINKS.map((d) => d.queriesByScope.onsite);
    expect(Math.max(...onsite)).toBe(drink('orange-juice').queriesByScope.onsite);
    expect(drink('orange-juice').queriesByScope.onsite).toBeGreaterThan(drink('beer').queriesByScope.onsite);
    expect(drink('milk').queriesByScope.onsite).toBeGreaterThan(drink('beer').queriesByScope.onsite);
  });

  it('every drink except tap water links at least one source', () => {
    for (const d of SCOPED_DRINKS) {
      if (d.id === 'tap-water') expect(d.sources).toHaveLength(0);
      else expect(d.sources.length).toBeGreaterThanOrEqual(1);
      for (const s of d.sources) expect(s.url).toMatch(/^https:\/\//);
    }
  });

  it('flags the cocktail figure as non-peer-reviewed', () => {
    expect(drink('cocktail').flagged).toBe(true);
    expect(drink('beer').flagged).toBeUndefined();
  });
});

describe('scope scaling', () => {
  it('a beer ranges from ~2,400 to ~331,000 queries across scopes', () => {
    expect(roundToSigFigs(drink('beer').queriesByScope.onsite)).toBe(331_000);
    expect(roundToSigFigs(drink('beer').queriesByScope.operational)).toBe(53_300);
    expect(roundToSigFigs(drink('beer').queriesByScope.lifecycle)).toBe(2_370);
  });

  it('the comparison survives the largest per-query figure: a beer still beats thousands of queries', () => {
    expect(drink('beer').queriesByScope.lifecycle).toBeGreaterThan(2_000);
  });

  it('on-site always yields more query-equivalents than lifecycle', () => {
    for (const d of SCOPED_DRINKS) {
      expect(d.queriesByScope.onsite).toBeGreaterThan(d.queriesByScope.lifecycle);
    }
  });
});

describe('time-equivalence framing at 30 queries/day', () => {
  it('beer covers about 30 years', () => {
    expect(drink('beer').usageByScope.onsite).toBe('30 years');
  });
  it('orange juice covers about 72 years', () => {
    expect(drink('orange-juice').usageByScope.onsite).toBe('72 years');
  });
  it('tap water covers about 37 days', () => {
    expect(drink('tap-water').usageByScope.onsite).toBe('37 days');
  });
  it('drops to hours for tiny counts', () => {
    expect(dailyUseLabel(30)).toBe('1 day');
    expect(dailyUseLabel(60)).toBe('2 days');
    expect(dailyUseLabel(15)).toBe('12 hours');
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
    coffee: 25.0,
    milk: 20.0,
    soda: 15.3,
    beer: 7.0,
    'orange-juice': 3.0,
    wine: 2.9,
    tea: 2.3,
    'bottled-water': 0.088,
  };

  for (const [id, trillions] of Object.entries(expectedTrillions)) {
    it(`${id} totals about ${trillions} trillion liters`, () => {
      expect(category(id).totalWaterLiters / 1e12).toBeCloseTo(trillions, 1);
    });
  }

  it('coffee and milk are the two largest categories', () => {
    expect(AGGREGATE_CATEGORIES[0].id).toBe('coffee');
    expect(AGGREGATE_CATEGORIES[1].id).toBe('milk');
  });

  it('coffee is 33-80x the AI range', () => {
    expect(category('coffee').multipleMin).toBeCloseTo(32.7, 1);
    expect(category('coffee').multipleMax).toBeCloseTo(80.0, 1);
  });

  it('bottled water stays below the AI range', () => {
    expect(category('bottled-water').multipleMax).toBeLessThan(0.3);
  });

  it('the categories sum to about 75.6 trillion liters, 99-242x AI', () => {
    expect(AGGREGATE_TOTAL_LITERS / 1e12).toBeCloseTo(75.6, 0);
    expect(AGGREGATE_TOTAL_MULTIPLE_MIN).toBeCloseTo(98.9, 0);
    expect(AGGREGATE_TOTAL_MULTIPLE_MAX).toBeCloseTo(241.9, 0);
  });

  it('every category links at least one source', () => {
    for (const c of AGGREGATE_CATEGORIES) {
      expect(c.sources.length).toBeGreaterThanOrEqual(1);
      for (const s of c.sources) expect(s.url).toMatch(/^https:\/\//);
    }
  });

  it('flags tea as the softest figure', () => {
    expect(category('tea').flagged).toBe(true);
    expect(category('milk').flagged).toBeUndefined();
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
    expect(formatMultipleRange(32.7, 80.0)).toBe('33–80x');
    expect(formatMultipleRange(0.116, 0.283)).toBe('0.1–0.3x');
  });
});
