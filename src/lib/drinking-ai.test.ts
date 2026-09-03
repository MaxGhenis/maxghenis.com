import { describe, expect, it } from 'vitest';
import {
  AGGREGATE_CATEGORIES,
  AGGREGATE_TOTAL_LITERS,
  AGGREGATE_TOTAL_MULTIPLE_MAX,
  AGGREGATE_TOTAL_MULTIPLE_MIN,
  AGGREGATE_TOTAL_MULTIPLE_2026_MAX,
  AGGREGATE_TOTAL_MULTIPLE_2026_MIN,
  AI_2025_MAX_LITERS,
  AI_2025_MIN_LITERS,
  AI_2026_MAX_LITERS,
  AI_2026_MIN_LITERS,
  BOTTLED_WATER_GALLONS_2025,
  SODA_GALLONS_2025,
  ALMOND_FOOTPRINT_L_PER_KG_CALIFORNIA,
  ALMOND_KERNEL_GRAMS,
  ALTMAN_IMPLIED_LITERS_PER_ALMOND,
  ALTMAN_ML_PER_QUERY,
  ALTMAN_QUERIES_PER_ALMOND,
  DEFAULT_SCOPE_ID,
  DEFAULT_WORKLOAD_ID,
  GOOGLE_WATER_PER_PROMPT_ML,
  IMPLIED_POPULATION,
  PLANT_MILK_BLEND_FOOTPRINT_L_PER_L,
  PN2018_L_PER_L,
  QUERY_SCOPES,
  DEFAULT_SCOPE,
  OAT_GREEN_SHARE,
  QUERIES_PER_DAY,
  SCOPED_DRINKS,
  WORKLOAD_TIERS,
  cellKey,
  dailyUseLabel,
  formatCompact,
  formatFootprint,
  formatLitersRange,
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

  it('defaults to the operational scope, the closest boundary to the drinks\' upstream accounting', () => {
    expect(DEFAULT_SCOPE_ID).toBe('operational');
    expect(DEFAULT_SCOPE.id).toBe('operational');
    expect(DEFAULT_SCOPE.perQueryMl).toBe(2);
  });

  it('the default headline: one beer is about 53,300 queries at 2 mL', () => {
    const beer = SCOPED_DRINKS.find((d) => d.id === 'beer');
    if (!beer) throw new Error('missing beer');
    expect(roundToSigFigs(beer.queriesByScope.operational)).toBe(53_300);
    expect(beer.usageByScope.operational).toBe('5 years');
  });

  it('every scope links a working https source', () => {
    for (const s of QUERY_SCOPES) expect(s.sourceUrl).toMatch(/^https:\/\//);
  });
});

describe('workload tiers', () => {
  it('exposes query, reasoning, and agentic tiers', () => {
    expect(WORKLOAD_TIERS.map((w) => w.id)).toEqual(['query', 'reasoning', 'agentic']);
    expect(WORKLOAD_TIERS[0].multiple).toBe(1);
    expect(WORKLOAD_TIERS[1].multiple).toBe(10);
    expect(WORKLOAD_TIERS[2].multiple).toBe(15);
  });

  it('default workload is a single query', () => {
    expect(DEFAULT_WORKLOAD_ID).toBe('query');
  });

  it('flags the reasoning multiplier as a Claude estimate, not the agentic one', () => {
    const byId = Object.fromEntries(WORKLOAD_TIERS.map((w) => [w.id, w]));
    expect(byId.reasoning.estimate).toBe(true);
    expect(byId.reasoning.detail).toMatch(/Claude/);
    expect(byId.agentic.estimate).toBeUndefined();
    expect(WORKLOAD_TIERS.filter((w) => w.estimate)).toHaveLength(1);
  });

  it('every workload links a working https source', () => {
    for (const w of WORKLOAD_TIERS) expect(w.sourceUrl).toMatch(/^https:\/\//);
  });

  it('a beer is ~33,100 reasoning responses or ~22,100 agentic tasks (on-site)', () => {
    const beer = SCOPED_DRINKS.find((d) => d.id === 'beer');
    if (!beer) throw new Error('missing beer');
    const q = beer.queriesByScope.onsite;
    expect(roundToSigFigs(q / 10)).toBe(33_100);
    expect(roundToSigFigs(q / 15)).toBe(22_100);
  });
});

describe('2026 projection', () => {
  it('scales the 2025 range by the published-rate central multiplier of 1.5x', () => {
    expect(AI_2026_MIN_LITERS).toBeCloseTo(468.75e9, -6);
    expect(AI_2026_MAX_LITERS).toBeCloseTo(1146.9e9, -6);
  });

  it('the drink categories are about 65-159x the projected 2026 AI range', () => {
    expect(AGGREGATE_TOTAL_MULTIPLE_2026_MIN).toBeCloseTo(64.9, 1);
    expect(AGGREGATE_TOTAL_MULTIPLE_2026_MAX).toBeCloseTo(158.7, 1);
  });

  it('the comparison holds even on the most aggressive AI-growth assumption (2.45x)', () => {
    const ai2026High = AI_2025_MAX_LITERS * 2.45;
    expect(AGGREGATE_TOTAL_LITERS / ai2026High).toBeGreaterThan(35);
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
    'orange-juice': 781_000,
    milk: 773_000,
    'almond-milk': 237_000,
    'oat-milk': 187_000,
    'bottled-water': 1_530,
    'tap-water': 1_100,
    almond: 60_000,
  };

  for (const [id, queries] of Object.entries(expected)) {
    it(`${id} is about ${queries.toLocaleString()} queries`, () => {
      expect(roundToSigFigs(drink(id).queriesByScope.onsite)).toBe(queries);
    });
  }

  it('orange juice and milk outrank beer per serving', () => {
    expect(drink('orange-juice').queriesByScope.onsite).toBeGreaterThan(drink('beer').queriesByScope.onsite);
    expect(drink('milk').queriesByScope.onsite).toBeGreaterThan(drink('beer').queriesByScope.onsite);
  });

  it('orange juice is the largest per-serving footprint', () => {
    const onsite = SCOPED_DRINKS.map((d) => d.queriesByScope.onsite);
    expect(Math.max(...onsite)).toBe(drink('orange-juice').queriesByScope.onsite);
  });

  it('the spirits entry is named for what it measures and keeps its id', () => {
    expect(drink('cocktail').name).toBe('Spirits');
    expect(drink('cocktail').headline).toBe('serving of spirits');
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

describe('plant milks and the almond', () => {
  it('a glass of almond milk is about 76 L, four almonds, and 38,100 queries at 2 mL', () => {
    const almondMilk = drink('almond-milk');
    expect(almondMilk.waterLiters).toBeCloseTo(76.3, 1);
    expect(almondMilk.waterLiters / drink('almond').waterLiters).toBeCloseTo(3.95, 1);
    expect(roundToSigFigs(almondMilk.queriesByScope.operational)).toBe(38_100);
    expect(almondMilk.usageByScope.operational).toBe('3 years');
  });

  it('a glass of oat milk is about 60 L and 30,100 queries at 2 mL', () => {
    const oatMilk = drink('oat-milk');
    expect(oatMilk.waterLiters).toBeCloseTo(60.1, 1);
    expect(roundToSigFigs(oatMilk.queriesByScope.operational)).toBe(30_100);
  });

  it('dairy milk outranks almond milk, which outranks oat milk, per glass', () => {
    expect(drink('milk').waterLiters).toBeGreaterThan(drink('almond-milk').waterLiters);
    expect(drink('almond-milk').waterLiters).toBeGreaterThan(drink('oat-milk').waterLiters);
  });

  it('the narrower Poore & Nemecek boundary ranks the milks the same way', () => {
    expect(PN2018_L_PER_L.dairyMilk).toBeGreaterThan(PN2018_L_PER_L.almondMilk);
    expect(PN2018_L_PER_L.almondMilk).toBeGreaterThan(PN2018_L_PER_L.oatMilk);
  });

  it('the notes are built from the constants they quote', () => {
    expect(OAT_GREEN_SHARE).toBeCloseTo(0.83, 2);
    expect(drink('oat-milk').scopeNote).toContain('83% of the oat footprint');
    expect(drink('almond-milk').scopeNote).toContain('36% less');
    expect(PN2018_L_PER_L.oatMilk / (drink('oat-milk').waterLiters / 0.237)).toBeCloseTo(0.19, 2);
  });

  it('one almond is about 19 L: 60,000 / 9,660 / 429 queries across scopes', () => {
    const almond = drink('almond');
    expect(almond.servingMl).toBeUndefined();
    expect(almond.servingGrams).toBe(ALMOND_KERNEL_GRAMS);
    expect(almond.waterLiters).toBeCloseTo(19.3, 1);
    expect(roundToSigFigs(almond.queriesByScope.onsite)).toBe(60_000);
    expect(roundToSigFigs(almond.queriesByScope.operational)).toBe(9_660);
    expect(roundToSigFigs(almond.queriesByScope.lifecycle)).toBe(429);
    expect(almond.usageByScope.operational).toBe('322 days');
  });

  it("Altman's 38,000 queries per almond implies 12.2 L, within 1% of the California-specific kernel", () => {
    expect(ALTMAN_QUERIES_PER_ALMOND).toBe(38_000);
    expect(ALTMAN_IMPLIED_LITERS_PER_ALMOND).toBeCloseTo(12.23, 2);
    const californiaKernel = ALMOND_FOOTPRINT_L_PER_KG_CALIFORNIA * (ALMOND_KERNEL_GRAMS / 1000);
    expect(californiaKernel).toBeCloseTo(12.29, 2);
    expect(Math.abs(ALTMAN_IMPLIED_LITERS_PER_ALMOND / californiaKernel - 1)).toBeLessThan(0.01);
    // On the same California basis at the default 2 mL scope, an almond is ~6,100 queries.
    expect(roundToSigFigs((californiaKernel * 1000) / 2)).toBe(6_140);
  });

  it('the almond is the last selector item and beer stays first', () => {
    expect(SCOPED_DRINKS[0].id).toBe('beer');
    expect(SCOPED_DRINKS[SCOPED_DRINKS.length - 1].id).toBe('almond');
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
  it('orange juice covers about 71 years', () => {
    expect(drink('orange-juice').usageByScope.onsite).toBe('71 years');
  });
  it('tap water covers about 37 days', () => {
    expect(drink('tap-water').usageByScope.onsite).toBe('37 days');
  });
  it('drops to hours, then minutes, for tiny counts', () => {
    expect(dailyUseLabel(30)).toBe('1 day');
    expect(dailyUseLabel(60)).toBe('2 days');
    expect(dailyUseLabel(15)).toBe('12 hours');
    expect(dailyUseLabel(0.526)).toBe('25 minutes');
    expect(dailyUseLabel(0.01)).toBe('1 minute');
  });

  it('rounds before choosing the unit, so 0.99 days is "1 day", not "24 hours"', () => {
    expect(dailyUseLabel(29.7)).toBe('1 day');
    expect(dailyUseLabel(30 * 364.9)).toBe('1 year');
    expect(dailyUseLabel((30 / 24) * 0.99)).toBe('59 minutes');
  });
});

describe('aggregate categories vs 2025 AI', () => {
  it('AI range is 312.5-764.6 billion liters', () => {
    expect(AI_2025_MIN_LITERS).toBe(312.5e9);
    expect(AI_2025_MAX_LITERS).toBe(764.6e9);
  });

  it('soda derivation implies a US-scale population and matches IBWA\'s market-share split', () => {
    expect(IMPLIED_POPULATION).toBeGreaterThan(350e6);
    expect(IMPLIED_POPULATION).toBeLessThan(357e6);
    // IBWA's own volume shares: bottled water 29%, carbonated soft drinks 21% of the US beverage market.
    const sodaFromShares = BOTTLED_WATER_GALLONS_2025 * (21 / 29);
    expect(Math.abs(SODA_GALLONS_2025 / sodaFromShares - 1)).toBeLessThan(0.05);
  });

  const expectedTrillions: Record<string, number> = {
    coffee: 24.94,
    milk: 19.82,
    soda: 15.34,
    beer: 7.01,
    wine: 2.89,
    'orange-juice': 2.84,
    'plant-milk': 0.4,
    'bottled-water': 0.088,
  };
  // Tea: 268 M lb of imported leaf (Tea Association) × 8,856 L/kg, not 86 B servings × 3 g.
  expectedTrillions.tea = 1.08;

  for (const [id, trillions] of Object.entries(expectedTrillions)) {
    it(`${id} totals about ${trillions} trillion liters`, () => {
      expect(category(id).totalWaterLiters / 1e12).toBeCloseTo(trillions, 2);
    });
  }

  it('coffee and milk are the two largest categories', () => {
    expect(AGGREGATE_CATEGORIES[0].id).toBe('coffee');
    expect(AGGREGATE_CATEGORIES[1].id).toBe('milk');
  });

  it('coffee is 33-80x the AI range', () => {
    expect(category('coffee').multipleMin).toBeCloseTo(32.6, 1);
    expect(category('coffee').multipleMax).toBeCloseTo(79.8, 1);
  });

  it('bottled water stays below the AI range', () => {
    expect(category('bottled-water').multipleMax).toBeLessThan(0.3);
  });

  it('plant-based milk lands inside the AI range: about 0.5-1.3x', () => {
    expect(PLANT_MILK_BLEND_FOOTPRINT_L_PER_L).toBeCloseTo(296.6, 1);
    expect(category('plant-milk').multipleMin).toBeCloseTo(0.53, 2);
    expect(category('plant-milk').multipleMax).toBeCloseTo(1.29, 2);
  });

  it('the categories sum to about 74.4 trillion liters, 97-238x AI', () => {
    expect(AGGREGATE_TOTAL_LITERS / 1e12).toBeCloseTo(74.4, 1);
    expect(AGGREGATE_TOTAL_MULTIPLE_MIN).toBeCloseTo(97.3, 1);
    expect(AGGREGATE_TOTAL_MULTIPLE_MAX).toBeCloseTo(238.1, 1);
  });

  it('tea, by leaf mass, is about 1.4-3.4x AI and sits between orange juice and plant milk', () => {
    expect(category('tea').multipleMin).toBeCloseTo(1.41, 2);
    expect(category('tea').multipleMax).toBeCloseTo(3.44, 2);
    const ids = AGGREGATE_CATEGORIES.map((c) => c.id);
    expect(ids.indexOf('tea')).toBe(ids.indexOf('orange-juice') + 1);
    expect(ids.indexOf('plant-milk')).toBe(ids.indexOf('tea') + 1);
  });

  it('every category links at least one source', () => {
    for (const c of AGGREGATE_CATEGORIES) {
      expect(c.sources.length).toBeGreaterThanOrEqual(1);
      for (const s of c.sources) expect(s.url).toMatch(/^https:\/\//);
    }
  });

  it('flags tea and the plant-milk blend as soft figures, not milk', () => {
    expect(category('tea').flagged).toBe(true);
    expect(category('plant-milk').flagged).toBe(true);
    expect(category('milk').flagged).toBeUndefined();
  });

  it('categories are sorted by total, largest first', () => {
    const totals = AGGREGATE_CATEGORIES.map((c) => c.totalWaterLiters);
    expect([...totals].sort((a, b) => b - a)).toEqual(totals);
  });
});

describe('calculator cells (what the page renders)', () => {
  const beer = drink('beer');

  it('beer at the default scope: 53,300 queries, 5,330 reasoning responses, 3,550 agentic tasks', () => {
    expect(beer.cells[cellKey('operational', 'query')].count).toBe(53_300);
    expect(beer.cells[cellKey('operational', 'reasoning')].count).toBe(5_330);
    expect(beer.cells[cellKey('operational', 'agentic')].count).toBe(3_550);
    expect(beer.cells[cellKey('operational', 'query')].drops).toBe(53);
    expect(beer.cells[cellKey('operational', 'query')].usage).toBe('5 years');
  });

  it('the heaviest combination, 45 mL × 15, prices a beer at 158 agentic tasks', () => {
    const cell = beer.cells[cellKey('lifecycle', 'agentic')];
    expect(cell.count).toBe(158);
    expect(cell.subDrop).toBe(true);
    expect(cell.drops).toBe(1);
  });

  it('the blog numbers: coffee 66,200 and tap water 178 at the default scope', () => {
    expect(drink('coffee').cells[cellKey('operational', 'query')].count).toBe(66_200);
    expect(drink('tap-water').cells[cellKey('operational', 'query')].count).toBe(178);
  });

  it('tap water at 45 mL × 15 is half a task: 0.526, shown as "<1 drop" and "25 minutes"', () => {
    const cell = drink('tap-water').cells[cellKey('lifecycle', 'agentic')];
    expect(cell.count).toBe(0.526);
    expect(cell.subDrop).toBe(true);
    expect(cell.usage).toBe('25 minutes');
  });

  it('38 of the 117 cells round below one drop', () => {
    const cells = SCOPED_DRINKS.flatMap((d) => Object.values(d.cells));
    expect(cells).toHaveLength(13 * 9);
    expect(cells.filter((c) => c.subDrop)).toHaveLength(38);
  });

  it('the lede: a year of 30 daily queries is about a fifth of a beer at 2 mL', () => {
    expect((QUERIES_PER_DAY * 365.25) / beer.queriesByScope.operational).toBeCloseTo(0.206, 3);
  });
});

describe('display rounding', () => {
  it('rounds query counts to 3 significant figures without float noise', () => {
    expect(roundToSigFigs(330_992)).toBe(331_000);
    expect(roundToSigFigs(441_572)).toBe(442_000);
    expect(roundToSigFigs(55_943)).toBe(55_900);
    expect(roundToSigFigs(1_533.6)).toBe(1_530);
    expect(roundToSigFigs(1_103.3)).toBe(1_100);
    expect(roundToSigFigs(55.943)).toBe(55.9);
    expect(roundToSigFigs(0.5263)).toBe(0.526);
    expect(roundToSigFigs(0)).toBe(0);
  });
});

describe('formatting', () => {
  it('formats compact magnitudes', () => {
    expect(formatCompact(7.0e12)).toBe('7 trillion');
    expect(formatCompact(764.6e9)).toBe('764.6 billion');
    expect(formatCompact(353.7e6)).toBe('353.7 million');
  });

  it('formats multiple ranges with both ends at the same precision and a true × sign', () => {
    expect(formatMultipleRange(9.165, 22.42)).toBe('9.2–22×');
    expect(formatMultipleRange(32.7, 80.0)).toBe('33–80×');
    expect(formatMultipleRange(0.116, 0.283)).toBe('0.1–0.3×');
    expect(formatMultipleRange(2.988, 7.312)).toBe('3.0–7.3×');
  });

  it('picks the magnitude word after rounding and formats liter ranges once', () => {
    expect(formatCompact(999.95e9)).toBe('1 trillion');
    expect(formatLitersRange(AI_2025_MIN_LITERS, AI_2025_MAX_LITERS)).toBe('312.5–764.6 billion liters');
    expect(formatLitersRange(AI_2026_MIN_LITERS, AI_2026_MAX_LITERS)).toBe('468.8 billion–1.1 trillion liters');
  });

  it('formats footprints to 3 significant figures, in mL below a liter', () => {
    expect(formatFootprint(106.5)).toBe('107 liters');
    expect(formatFootprint(76.29)).toBe('76.3 liters');
    expect(formatFootprint(19.314)).toBe('19.3 liters');
    expect(formatFootprint(0.355)).toBe('355 mL');
    expect(formatFootprint(0.49345)).toBe('493 mL');
  });
});
