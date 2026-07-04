/**
 * Data and derivations for /drinking-ai.
 *
 * Every figure here traces to a linked primary source; everything else is
 * arithmetic on those figures. Tests in drinking-ai.test.ts pin the headline
 * numbers so silent drift in any constant fails CI.
 *
 * Two things are deliberately kept honest:
 *  - Per-query AI water is a RANGE, not a point. The figure depends entirely on
 *    scope (data-center cooling only / + power-plant water / full per-response
 *    lifecycle). The page lets the reader pick; QUERY_SCOPES holds all three.
 *  - Drink footprints use the canonical peer-reviewed crop-water tables
 *    (Mekonnen & Hoekstra 2011, 2012), not the popular leaflet figures.
 */

export const GALLONS_TO_LITERS = 3.785411784;
export const POUNDS_TO_KG = 0.45359237;

/* ──────────────────────────────────────────────────────────────────────────
   Per-query AI water — three scopes, because the 100× spread in published
   numbers is almost entirely a boundary-definition difference, not a
   disagreement about physics. Google itself frames its 0.26 mL as "orders of
   magnitude less than previous estimates of 45 to 50 mL" — same water, wider box.
   ────────────────────────────────────────────────────────────────────────── */

export interface QueryScope {
  id: string;
  /** Short selector label. */
  label: string;
  /** What the boundary includes. */
  boundary: string;
  perQueryMl: number;
  /** Longer sentence for the methodology / tooltip. */
  detail: string;
  sourceLabel: string;
  sourceUrl: string;
}

/** OpenAI / Altman: 0.000085 gallons per average ChatGPT query. */
export const ALTMAN_GALLONS_PER_QUERY = 0.000085;
export const ALTMAN_ML_PER_QUERY = ALTMAN_GALLONS_PER_QUERY * GALLONS_TO_LITERS * 1000;

export const QUERY_SCOPES: QueryScope[] = [
  {
    id: 'onsite',
    label: 'Data-center cooling',
    boundary: 'On-site cooling water only',
    perQueryMl: ALTMAN_ML_PER_QUERY,
    detail:
      "OpenAI's published average (0.34 Wh, 0.000085 gallons per query). It matches Google's separately measured 0.26 mL median Gemini prompt, which Google defines as on-site data-center cooling water only — no power-plant water.",
    sourceLabel: 'OpenAI (Altman, 2025)',
    sourceUrl: 'https://blog.samaltman.com/the-gentle-singularity',
  },
  {
    id: 'operational',
    label: '+ power-plant water',
    boundary: 'Cooling + electricity generation',
    perQueryMl: 2.0,
    detail:
      'Adds the water used to generate the electricity the query draws, not just data-center cooling — the same supply-chain boundary the drink footprints use. A peer-reviewed measurement puts an efficient 2025 model (GPT-4o) near 2 mL on this basis.',
    sourceLabel: 'Jegham et al. 2025',
    sourceUrl: 'https://arxiv.org/abs/2505.09598',
  },
  {
    id: 'lifecycle',
    label: 'Per-response lifecycle',
    boundary: 'Full marginal response, LCA',
    perQueryMl: 45,
    detail:
      "Mistral's ISO-reviewed life-cycle assessment of one 400-token response from a large model, covering upstream electricity and cooling. Higher because the response is long and the model large; Li & Ren's older GPT-3 figure (10–50 mL/response) sits in the same band.",
    sourceLabel: 'Mistral AI LCA, 2025',
    sourceUrl: 'https://mistral.ai/news/our-contribution-to-a-global-environmental-standard-for-ai',
  },
];

/**
 * Default scope: cooling + power-plant water. The drink footprints count the
 * full supply chain (water embedded in barley, grapes, beans), so the
 * boundary-consistent AI figure includes the water embedded in the query's
 * electricity — not data-center cooling alone.
 */
export const DEFAULT_SCOPE_ID = 'operational';
export const WATER_PER_QUERY_ML = ALTMAN_ML_PER_QUERY;

/* ──────────────────────────────────────────────────────────────────────────
   Workload intensity. The per-query figures above are MEDIAN SINGLE PROMPTS.
   Reasoning models emit far more tokens, and agents chain many calls per task,
   so the honest unit shifts from "query" to "task". Water scales ~linearly with
   tokens, so a token multiplier is roughly a water multiplier.
   ────────────────────────────────────────────────────────────────────────── */

export interface WorkloadTier {
  id: string;
  /** Pill label. */
  label: string;
  /** Plural unit for the headline number ("agentic tasks"). */
  unit: string;
  /** Short plural for the per-day line ("agentic tasks a day"). */
  daily: string;
  /** Singular for the "water per X" detail. */
  unitSingular: string;
  /** Multiplier on a median query's water. */
  multiple: number;
  detail: string;
  sourceLabel: string;
  sourceUrl: string;
  /** True when the multiplier is a Claude mid-range estimate, not a single measurement. */
  estimate?: boolean;
}

export const WORKLOAD_TIERS: WorkloadTier[] = [
  {
    id: 'query',
    label: 'Single query',
    unit: 'average ChatGPT queries',
    daily: 'queries',
    unitSingular: 'query',
    multiple: 1,
    detail:
      "A median single text prompt — the basis for OpenAI's and Google's published per-query figures.",
    sourceLabel: 'Google, 2025',
    sourceUrl: 'https://arxiv.org/abs/2508.15734',
  },
  {
    id: 'reasoning',
    label: 'Reasoning response',
    unit: 'reasoning responses',
    daily: 'reasoning responses',
    unitSingular: 'reasoning response',
    multiple: 10,
    detail:
      'Extended-thinking models emit far more tokens. Measured multipliers run ~2.5x (Epoch) to ~7x (GPT-5 routing) and up to ~50x for long, high-effort reasoning; ~10x is a mid-range estimate.',
    sourceLabel: 'Jegham et al. 2025',
    sourceUrl: 'https://arxiv.org/abs/2505.09598',
    estimate: true,
  },
  {
    id: 'agentic',
    label: 'Agentic task',
    unit: 'agentic tasks',
    daily: 'agentic tasks',
    unitSingular: 'agentic task',
    multiple: 15,
    detail:
      'Agents chain many model calls per task. Anthropic measured its multi-agent systems at about 15x the tokens of a chat; long autonomous coding runs go higher.',
    sourceLabel: 'Anthropic, 2025',
    sourceUrl: 'https://www.anthropic.com/engineering/multi-agent-research-system',
  },
];

export const DEFAULT_WORKLOAD_ID = 'query';

/** Google's median Gemini Apps text prompt (2025), cross-check for the on-site scope. */
export const GOOGLE_WATER_PER_PROMPT_ML = 0.26;

/** Assumed daily usage for the time-equivalence framing. */
export const QUERIES_PER_DAY = 30;

/* ──────────────────────────────────────────────────────────────────────────
   Drink footprints. Liters of water per liter of beverage (green + blue + grey,
   global average) unless noted. Crop tables: Mekonnen & Hoekstra 2011 (HESS);
   milk: Mekonnen & Hoekstra 2012 (Ecosystems); soda: Ercin et al. 2011.
   Per-L values convert the published per-kg figures using standard beverage
   densities (uncontroversial physical constants).
   ────────────────────────────────────────────────────────────────────────── */

// Beer: 298 L/kg (M&H 2011, "beer made from malt") × ~1.008 kg/L ≈ 300 L/L.
export const BEER_FOOTPRINT_L_PER_L = 300;
// Wine: 869 L/kg (M&H 2011, "grape wines") × ~0.99 kg/L ≈ 860 L/L.
export const WINE_FOOTPRINT_L_PER_L = 860;
// Orange juice: 1,018 L/kg (M&H 2011) × ~1.045 kg/L ≈ 1,064 L/L.
export const ORANGE_JUICE_FOOTPRINT_L_PER_L = 1064;
// Soda: 169 L per 0.5 L PET bottle, low end of Ercin et al. 2011's 169–309 range.
export const SODA_FOOTPRINT_L_PER_L = 169 / 0.5;
// Milk: 1,020 L/kg (M&H 2012) × ~1.03 kg/L ≈ 1,050 L/L.
export const MILK_FOOTPRINT_L_PER_KG = 1020;
export const MILK_FOOTPRINT_L_PER_L = 1050;
// Coffee: 18,925 L/kg roasted (M&H 2011); 7 g per cup → ~132 L/cup (paper says ~130).
export const COFFEE_FOOTPRINT_L_PER_KG_ROASTED = 18925;
export const COFFEE_FOOTPRINT_L_PER_KG_GREEN = 15897;
export const COFFEE_GRAMS_PER_CUP = 7;
// Tea: 8,856 L/kg (M&H 2011); 3 g per cup → ~27 L/cup.
export const TEA_FOOTPRINT_L_PER_KG = 8856;
export const TEA_GRAMS_PER_CUP = 3;
// Bottled water: facility process-water ratio, IBWA 2024 benchmarking (2022 data).
export const BOTTLED_WATER_FOOTPRINT_L_PER_L = 1.39;
// Spirits: spiritsEUROPE industry figure, ~18 L per serving (flagged, non-peer-reviewed).
export const SPIRITS_LITERS_PER_SERVING = 18;

const ML = (ml: number) => ml / 1000;

export interface DrinkSource {
  label: string;
  url: string;
}

export interface Drink {
  id: string;
  name: string;
  serving: string;
  servingMl: number;
  waterLiters: number;
  /** How waterLiters is derived from the source figure. */
  derivation: string;
  scopeNote: string;
  sources: DrinkSource[];
  /** Set when the figure is not peer-reviewed (e.g. industry-supplied). */
  flagged?: boolean;
}

const MH2011: DrinkSource = {
  label: 'Mekonnen & Hoekstra 2011',
  url: 'https://hess.copernicus.org/articles/15/1577/2011/hess-15-1577-2011.pdf',
};
const MH2012: DrinkSource = {
  label: 'Mekonnen & Hoekstra 2012',
  url: 'https://www.waterfootprint.org/resources/Mekonnen-Hoekstra-2012-WaterFootprintFarmAnimalProducts_1.pdf',
};
const ERCIN2011: DrinkSource = {
  label: 'Ercin, Aldaya & Hoekstra 2011',
  url: 'https://ayhoekstra.nl/pubs/Ercin-et-al-2011.pdf',
};
const CH2007: DrinkSource = {
  label: 'Chapagain & Hoekstra 2007',
  url: 'https://ayhoekstra.nl/pubs/Chapagain-Hoekstra-2007.pdf',
};
const IBWA_BENCHMARK: DrinkSource = {
  label: 'IBWA 2024 benchmarking',
  url: 'https://bottledwater.org/wp-content/uploads/2024/08/IBWA-Benchmarking-Executive-Summary_May-2024.pdf',
};
const SPIRITS_EUROPE: DrinkSource = {
  label: 'spiritsEUROPE 2020',
  url: 'https://spirits.eu/upload/files/publications/CP.MI-165-2020-%20Farm2Glass%20Brochure%20-%2014%20May%202020.pdf',
};

export const DRINKS: Drink[] = [
  {
    id: 'beer',
    name: 'Beer',
    serving: '12 oz / 355 mL',
    servingMl: 355,
    waterLiters: BEER_FOOTPRINT_L_PER_L * ML(355),
    derivation: '298 L per kg of malt beer (Mekonnen & Hoekstra 2011) ≈ 300 L per L, scaled to 355 mL',
    scopeNote: 'Full green, blue, and grey crop footprint — mostly barley irrigation and rain.',
    sources: [MH2011],
  },
  {
    id: 'wine',
    name: 'Wine',
    serving: '5 oz / 148 mL',
    servingMl: 148,
    waterLiters: WINE_FOOTPRINT_L_PER_L * ML(148),
    derivation: '869 L per kg of wine (Mekonnen & Hoekstra 2011) ≈ 860 L per L, scaled to 148 mL',
    scopeNote: 'Full green, blue, and grey crop footprint — mostly vineyard water.',
    sources: [MH2011],
  },
  {
    id: 'cocktail',
    name: 'Cocktail',
    serving: 'one standard drink',
    servingMl: 44,
    waterLiters: SPIRITS_LITERS_PER_SERVING,
    derivation: '18 L per serving of spirit drink',
    scopeNote: 'Industry figure, not peer-reviewed — the only non-academic drink number on this page. The crop-water literature suggests the true figure is likely higher.',
    sources: [SPIRITS_EUROPE],
    flagged: true,
  },
  {
    id: 'coffee',
    name: 'Coffee',
    serving: '8 oz / 237 mL',
    servingMl: 237,
    waterLiters: COFFEE_FOOTPRINT_L_PER_KG_ROASTED * (COFFEE_GRAMS_PER_CUP / 1000),
    derivation: '18,925 L per kg roasted coffee (Mekonnen & Hoekstra 2011) × 7 g per cup ≈ 132 L',
    scopeNote: 'Set by the beans, not the cup: green-coffee cultivation is among the most water-intensive crops. The classic figure is 130–140 L per cup.',
    sources: [MH2011, CH2007],
  },
  {
    id: 'tea',
    name: 'Tea',
    serving: '8 oz / 237 mL',
    servingMl: 237,
    waterLiters: TEA_FOOTPRINT_L_PER_KG * (TEA_GRAMS_PER_CUP / 1000),
    derivation: '8,856 L per kg tea (Mekonnen & Hoekstra 2011) × 3 g per cup ≈ 27 L',
    scopeNote: 'Also set by the leaf, not the cup — and about a fifth of coffee, since a cup uses less dry weight.',
    sources: [MH2011, CH2007],
  },
  {
    id: 'soda',
    name: 'Soda',
    serving: '12 oz / 355 mL',
    servingMl: 355,
    waterLiters: SODA_FOOTPRINT_L_PER_L * ML(355),
    derivation: '169 L per 0.5 L bottle (low end of Ercin et al. 2011’s 169–309 range) ≈ 338 L per L, scaled to 355 mL',
    scopeNote: 'Low end of the published range; 99.7% is supply-chain water, and the sugar source sets the spread.',
    sources: [ERCIN2011],
  },
  {
    id: 'orange-juice',
    name: 'Orange juice',
    serving: '8 oz / 237 mL',
    servingMl: 237,
    waterLiters: ORANGE_JUICE_FOOTPRINT_L_PER_L * ML(237),
    derivation: '1,018 L per kg of orange juice (Mekonnen & Hoekstra 2011) ≈ 1,064 L per L, scaled to 237 mL',
    scopeNote: 'Full green, blue, and grey crop footprint — mostly orange-grove water.',
    sources: [MH2011],
  },
  {
    id: 'milk',
    name: 'Milk',
    serving: '8 oz / 237 mL',
    servingMl: 237,
    waterLiters: MILK_FOOTPRINT_L_PER_L * ML(237),
    derivation: '1,020 L per kg of milk (Mekonnen & Hoekstra 2012) ≈ 1,050 L per L, scaled to 237 mL',
    scopeNote: 'Full footprint — mostly the water to grow cattle feed.',
    sources: [MH2012],
  },
  {
    id: 'bottled-water',
    name: 'Bottled water',
    serving: '12 oz / 355 mL',
    servingMl: 355,
    waterLiters: BOTTLED_WATER_FOOTPRINT_L_PER_L * ML(355),
    derivation: '1.39 L used per 1 L bottled (IBWA 2024 benchmarking), scaled to 355 mL',
    scopeNote: 'A bottling-plant facility ratio including the product water itself — not a crop footprint, so it is not comparable to the drinks above.',
    sources: [IBWA_BENCHMARK],
  },
  {
    id: 'tap-water',
    name: 'Tap water',
    serving: '12 oz / 355 mL',
    servingMl: 355,
    waterLiters: ML(355),
    derivation: '355 mL — the water in the glass',
    scopeNote: 'Just the water you drink; no treatment or distribution lifecycle added.',
    sources: [],
  },
];

export function queriesForLiters(waterLiters: number, perQueryMl: number = WATER_PER_QUERY_ML): number {
  return (waterLiters * 1000) / perQueryMl;
}

/**
 * Display rounding to 3 significant figures: the footprint inputs carry
 * 2-3 significant figures, so showing more digits would imply precision
 * the sources don't have.
 */
export function roundToSigFigs(value: number, figures = 3): number {
  if (value === 0) return 0;
  const magnitude = 10 ** (Math.floor(Math.log10(Math.abs(value))) - (figures - 1));
  return Math.round(value / magnitude) * magnitude;
}

/** "30 years" / "37 days" / "5 hours" / "25 minutes" at QUERIES_PER_DAY per day. */
export function dailyUseLabel(queries: number, perDay: number = QUERIES_PER_DAY): string {
  const days = queries / perDay;
  const years = days / 365.25;
  if (years >= 1) {
    const r = Math.round(years);
    return `${r} year${r === 1 ? '' : 's'}`;
  }
  if (days >= 1) {
    const r = Math.round(days);
    return `${r} day${r === 1 ? '' : 's'}`;
  }
  const hours = days * 24;
  if (hours >= 1) {
    const r = Math.round(hours);
    return `${r} hour${r === 1 ? '' : 's'}`;
  }
  const minutes = Math.max(1, Math.round(hours * 60));
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

export interface ScopedDrink extends Drink {
  /** Query equivalents at each scope, keyed by scope id. */
  queriesByScope: Record<string, number>;
  usageByScope: Record<string, string>;
}

export const SCOPED_DRINKS: ScopedDrink[] = DRINKS.map((drink) => {
  const queriesByScope: Record<string, number> = {};
  const usageByScope: Record<string, string> = {};
  for (const scope of QUERY_SCOPES) {
    const q = queriesForLiters(drink.waterLiters, scope.perQueryMl);
    queriesByScope[scope.id] = q;
    usageByScope[scope.id] = dailyUseLabel(q);
  }
  return { ...drink, queriesByScope, usageByScope };
});

/* ──────────────────────────────────────────────────────────────────────────
   AI annual water benchmark. de Vries-Gao, "The carbon and water footprints of
   data centers and what this could mean for artificial intelligence," Patterns
   (2026). Modeled global water footprint of AI systems in 2025; consumption,
   on-site + off-site.
   ────────────────────────────────────────────────────────────────────────── */

export const AI_2025_MIN_LITERS = 312.5e9;
export const AI_2025_MAX_LITERS = 764.6e9;

export const AI_BENCHMARK_SOURCE: DrinkSource = {
  label: 'de Vries-Gao, Patterns 2026',
  url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12827721/',
};

/**
 * 2026 projection. No source publishes a 2026 AI-water figure, so this is a
 * Claude extrapolation: de Vries-Gao's water is mechanically AI-power ×
 * constant intensity, so 2026 scales with AI-power growth. Published rates
 * for 2025→2026 span ~1.3x (IEA accelerated servers) to ~2.45x (de Vries-Gao's
 * own 2024→2025 pace); 1.5x is a central estimate that assumes the buildout
 * decelerates. A UN University study independently implies ~0.9T L AI water in
 * 2025, near de Vries-Gao's high end, supporting this band.
 */
export const AI_POWER_GROWTH_2025_TO_2026 = 1.5;
export const AI_2026_MIN_LITERS = AI_2025_MIN_LITERS * AI_POWER_GROWTH_2025_TO_2026;
export const AI_2026_MAX_LITERS = AI_2025_MAX_LITERS * AI_POWER_GROWTH_2025_TO_2026;

/* ── Annual US drink volumes ── */

/** NIAAA Surveillance Report 122, US 2023 volumes (gallons). */
export const BEER_GALLONS_2023 = 6_170_858_000;
export const WINE_GALLONS_2023 = 887_990_000;

/** USDA ERS fruit-juices table, US 2021 (gallons, single-strength). */
export const ORANGE_JUICE_GALLONS_2021 = 747_400_000;

/** USDA ERS fluid beverage milk sales, US 2024 (pounds). */
export const MILK_POUNDS_2024 = 43_178_500_000;

/** USDA FAS Coffee World Markets & Trade (Dec 2025): US domestic consumption MY2024/25. */
export const COFFEE_GREEN_KG_2024 = 26_220_000 * 60; // 26,220 thousand 60-kg bags

/** Tea Association of the USA fact sheet, 2023: ~86 billion servings. */
export const TEA_SERVINGS_2023 = 86_000_000_000;

/** IBWA 2026 progress report: preliminary 2025 volume and per-capita figures. */
export const BOTTLED_WATER_GALLONS_2025 = 16_800_000_000;
export const BOTTLED_WATER_PER_CAPITA_GALLONS = 47.5;
export const SODA_PER_CAPITA_GALLONS = 33.9;

/**
 * IBWA publishes a 2025 soda (carbonated soft drink) per-capita figure but no
 * total, so the total comes from the population implied by IBWA's own bottled
 * water total and per-capita pair.
 */
export const IMPLIED_POPULATION = BOTTLED_WATER_GALLONS_2025 / BOTTLED_WATER_PER_CAPITA_GALLONS;
export const SODA_GALLONS_2025 = IMPLIED_POPULATION * SODA_PER_CAPITA_GALLONS;

export interface AggregateCategory {
  id: string;
  name: string;
  year: string;
  totalWaterLiters: number;
  /** Category total divided by the high AI estimate — the conservative multiple. */
  multipleMin: number;
  /** Category total divided by the low AI estimate. */
  multipleMax: number;
  volumeNote: string;
  footprintNote: string;
  sources: DrinkSource[];
  /** Softest data quality, called out on the page. */
  flagged?: boolean;
}

const NIAAA_SOURCE: DrinkSource = {
  label: 'NIAAA Surveillance Report 122',
  url: 'https://www.niaaa.nih.gov/sites/default/files/surveillance-report122.Per-Capita-Consumption.pdf',
};
const ERS_JUICE_SOURCE: DrinkSource = {
  label: 'USDA ERS fruit-juices table',
  url: 'https://ers.usda.gov/media/5349/fruit-juices.csv?v=60123',
};
const ERS_MILK_SOURCE: DrinkSource = {
  label: 'USDA ERS dairy data',
  url: 'https://www.ers.usda.gov/data-products/dairy-data/',
};
const FAS_COFFEE_SOURCE: DrinkSource = {
  label: 'USDA FAS coffee report',
  url: 'https://apps.fas.usda.gov/psdonline/circulars/coffee.pdf',
};
const TEA_USA_SOURCE: DrinkSource = {
  label: 'Tea Association of the USA',
  url: 'https://www.teausa.org/tea-fact-sheet',
};
const IBWA_2026_SOURCE: DrinkSource = {
  label: 'IBWA 2026 progress report',
  url: 'https://bottledwater.org/wp-content/uploads/2026/01/2025-Progress-Report_FINAL.pdf',
};

function aggregate(
  entry: Omit<AggregateCategory, 'multipleMin' | 'multipleMax'>,
): AggregateCategory {
  return {
    ...entry,
    multipleMin: entry.totalWaterLiters / AI_2025_MAX_LITERS,
    multipleMax: entry.totalWaterLiters / AI_2025_MIN_LITERS,
  };
}

const UNSORTED_CATEGORIES: AggregateCategory[] = [
  aggregate({
    id: 'coffee',
    name: 'Coffee',
    year: '2024/25',
    totalWaterLiters: COFFEE_GREEN_KG_2024 * COFFEE_FOOTPRINT_L_PER_KG_GREEN,
    volumeNote: '1.57 billion kg of green coffee (26.2M 60-kg bags)',
    footprintNote: '15,897 L per kg green coffee — measured by bean mass, not brewed volume',
    sources: [FAS_COFFEE_SOURCE, MH2011],
  }),
  aggregate({
    id: 'milk',
    name: 'Milk',
    year: '2024',
    totalWaterLiters: MILK_POUNDS_2024 * POUNDS_TO_KG * MILK_FOOTPRINT_L_PER_KG,
    volumeNote: '43.2 billion lb of fluid milk sold',
    footprintNote: '1,020 L per kg, same source as the calculator',
    sources: [ERS_MILK_SOURCE, MH2012],
  }),
  aggregate({
    id: 'soda',
    name: 'Soda',
    year: '2025',
    totalWaterLiters: SODA_GALLONS_2025 * GALLONS_TO_LITERS * SODA_FOOTPRINT_L_PER_L,
    volumeNote: `${(SODA_GALLONS_2025 / 1e9).toFixed(1)}B gallons, derived from IBWA per-capita figures`,
    footprintNote: '338 L per L — the low end of the published range',
    sources: [IBWA_2026_SOURCE, ERCIN2011],
  }),
  aggregate({
    id: 'beer',
    name: 'Beer',
    year: '2023',
    totalWaterLiters: BEER_GALLONS_2023 * GALLONS_TO_LITERS * BEER_FOOTPRINT_L_PER_L,
    volumeNote: '6.17B gallons (NIAAA)',
    footprintNote: '300 L per L, same source as the calculator',
    sources: [NIAAA_SOURCE, MH2011],
  }),
  aggregate({
    id: 'orange-juice',
    name: 'Orange juice',
    year: '2021',
    totalWaterLiters: ORANGE_JUICE_GALLONS_2021 * GALLONS_TO_LITERS * ORANGE_JUICE_FOOTPRINT_L_PER_L,
    volumeNote: '0.75B gallons (USDA ERS, latest year in the series)',
    footprintNote: '1,064 L per L, same source as the calculator',
    sources: [ERS_JUICE_SOURCE, MH2011],
  }),
  aggregate({
    id: 'wine',
    name: 'Wine',
    year: '2023',
    totalWaterLiters: WINE_GALLONS_2023 * GALLONS_TO_LITERS * WINE_FOOTPRINT_L_PER_L,
    volumeNote: '0.89B gallons (NIAAA)',
    footprintNote: '860 L per L, same source as the calculator',
    sources: [NIAAA_SOURCE, MH2011],
  }),
  aggregate({
    id: 'tea',
    name: 'Tea',
    year: '2023',
    totalWaterLiters: TEA_SERVINGS_2023 * TEA_FOOTPRINT_L_PER_KG * (TEA_GRAMS_PER_CUP / 1000),
    volumeNote: '86 billion servings (Tea Association estimate)',
    footprintNote: '27 L per serving (3 g tea); the softest figure on the chart',
    sources: [TEA_USA_SOURCE, MH2011],
    flagged: true,
  }),
  aggregate({
    id: 'bottled-water',
    name: 'Bottled water',
    year: '2025',
    totalWaterLiters: BOTTLED_WATER_GALLONS_2025 * GALLONS_TO_LITERS * BOTTLED_WATER_FOOTPRINT_L_PER_L,
    volumeNote: '16.8B gallons, preliminary (IBWA)',
    footprintNote: '1.39 L per L facility ratio — the one category below the AI range',
    sources: [IBWA_2026_SOURCE, IBWA_BENCHMARK],
  }),
];

export const AGGREGATE_CATEGORIES: AggregateCategory[] = [...UNSORTED_CATEGORIES].sort(
  (a, b) => b.totalWaterLiters - a.totalWaterLiters,
);

export const AGGREGATE_TOTAL_LITERS = AGGREGATE_CATEGORIES.reduce(
  (total, category) => total + category.totalWaterLiters,
  0,
);
export const AGGREGATE_TOTAL_MULTIPLE_MIN = AGGREGATE_TOTAL_LITERS / AI_2025_MAX_LITERS;
export const AGGREGATE_TOTAL_MULTIPLE_MAX = AGGREGATE_TOTAL_LITERS / AI_2025_MIN_LITERS;
export const AGGREGATE_TOTAL_MULTIPLE_2026_MIN = AGGREGATE_TOTAL_LITERS / AI_2026_MAX_LITERS;
export const AGGREGATE_TOTAL_MULTIPLE_2026_MAX = AGGREGATE_TOTAL_LITERS / AI_2026_MIN_LITERS;

/* ── Formatting ── */

const decimalFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

export function formatCompact(value: number): string {
  if (value >= 1e12) return `${decimalFormatter.format(value / 1e12)} trillion`;
  if (value >= 1e9) return `${decimalFormatter.format(value / 1e9)} billion`;
  if (value >= 1e6) return `${decimalFormatter.format(value / 1e6)} million`;
  return decimalFormatter.format(value);
}

export function formatLiters(value: number): string {
  return `${formatCompact(value)} liters`;
}

export function formatMultipleRange(min: number, max: number): string {
  const fmt = (x: number) => (x >= 10 ? Math.round(x).toString() : decimalFormatter.format(x));
  return `${fmt(min)}–${fmt(max)}x`;
}
