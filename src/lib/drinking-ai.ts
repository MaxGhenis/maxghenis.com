/**
 * Data and derivations for /drinking-ai.
 *
 * Every figure here traces to a linked primary source; everything else is
 * arithmetic on those figures. Tests in drinking-ai.test.ts pin the headline
 * numbers so silent drift in any constant fails CI.
 */

export const GALLONS_TO_LITERS = 3.785411784;

/** OpenAI's published average per ChatGPT query (Altman, June 10, 2025). */
export const WATER_PER_QUERY_GALLONS = 0.000085;
export const WATER_PER_QUERY_ML = WATER_PER_QUERY_GALLONS * GALLONS_TO_LITERS * 1000;

/** Google's published median Gemini Apps text prompt (2025), for cross-checking. */
export const GOOGLE_WATER_PER_PROMPT_ML = 0.26;

/**
 * de Vries-Gao, "The carbon and water footprints of data centers and what
 * this could mean for artificial intelligence," Patterns (2026):
 * modeled global water footprint of AI systems in 2025.
 */
export const AI_2025_MIN_LITERS = 312.5e9;
export const AI_2025_MAX_LITERS = 764.6e9;

/** Assumed daily usage for the time-equivalence framing. */
export const QUERIES_PER_DAY = 30;

export interface Drink {
  id: string;
  name: string;
  serving: string;
  waterLiters: number;
  formula: string;
  scopeNote: string;
  sourceLabel: string;
  sourceUrl?: string;
}

export const DRINKS: Drink[] = [
  {
    id: 'beer',
    name: 'Beer',
    serving: '12 oz / 355 mL',
    waterLiters: 75 * (355 / 250),
    formula: '75 L per 250 mL glass (Hoekstra 2008), scaled to 355 mL',
    scopeNote: 'Full green, blue, and grey water footprint — mostly barley irrigation and rain.',
    sourceLabel: 'Hoekstra 2008',
    sourceUrl: 'https://www.waterfootprint.org/resources/Hoekstra-2008-WaterfootprintFood.pdf',
  },
  {
    id: 'wine',
    name: 'Wine',
    serving: '5 oz / 148 mL',
    waterLiters: 120 * (148 / 125),
    formula: '120 L per 125 mL glass (Hoekstra 2008), scaled to 148 mL',
    scopeNote: 'Full green, blue, and grey water footprint — mostly vineyard water.',
    sourceLabel: 'Hoekstra 2008',
    sourceUrl: 'https://www.waterfootprint.org/resources/Hoekstra-2008-WaterfootprintFood.pdf',
  },
  {
    id: 'cocktail',
    name: 'Cocktail',
    serving: 'one standard drink',
    waterLiters: 18,
    formula: '18 L per serving of spirit drink',
    scopeNote: 'Industry average from spiritsEUROPE — the only non-government, non-NGO drink figure on this page.',
    sourceLabel: 'spiritsEUROPE 2020',
    sourceUrl: 'https://spirits.eu/upload/files/publications/CP.MI-165-2020-%20Farm2Glass%20Brochure%20-%2014%20May%202020.pdf',
  },
  {
    id: 'soda',
    name: 'Soda',
    serving: '12 oz / 355 mL',
    waterLiters: 169 * (355 / 500),
    formula: '169 L per 0.5 L bottle (low end of 169-309), scaled to 355 mL',
    scopeNote: 'Low end of the published 169-309 L range; sugar source and production route set the spread.',
    sourceLabel: 'Water Footprint Network Report 39',
    sourceUrl: 'https://www.waterfootprint.org/resources/Report39-WaterFootprintCarbonatedBeverage.pdf',
  },
  {
    id: 'orange-juice',
    name: 'Orange juice',
    serving: '8 oz / 237 mL',
    waterLiters: 170 * (237 / 200),
    formula: '170 L per 200 mL glass, scaled to 237 mL',
    scopeNote: 'Full green, blue, and grey water footprint — mostly orange-grove water.',
    sourceLabel: 'Water Footprint Network Report 16',
    sourceUrl: 'https://www.waterfootprint.org/resources/Report16Vol1.pdf',
  },
  {
    id: 'bottled-water',
    name: 'Bottled water',
    serving: '12 oz / 355 mL',
    waterLiters: 1.39 * 0.355,
    formula: '1.39 L used per 1 L bottled, scaled to 355 mL',
    scopeNote: 'Facility process-water ratio, including the product water itself — not a crop footprint.',
    sourceLabel: 'IBWA 2024 benchmarking',
    sourceUrl: 'https://bottledwater.org/wp-content/uploads/2024/08/IBWA-Benchmarking-Executive-Summary_May-2024.pdf',
  },
  {
    id: 'tap-water',
    name: 'Tap water',
    serving: '12 oz / 355 mL',
    waterLiters: 0.355,
    formula: '355 mL — the water in the glass',
    scopeNote: 'Just the water you drink; no treatment or distribution lifecycle added.',
    sourceLabel: 'No external source needed',
  },
];

export function queriesForLiters(waterLiters: number): number {
  return (waterLiters * 1000) / WATER_PER_QUERY_ML;
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

export interface DrinkWithQueries extends Drink {
  queries: number;
  usageLabel: string;
}

/** "30 years" / "37 days" at QUERIES_PER_DAY queries per day. */
export function dailyUseLabel(queries: number, perDay: number = QUERIES_PER_DAY): string {
  const days = queries / perDay;
  const years = days / 365.25;
  if (years >= 1) return `${Math.round(years)} year${Math.round(years) === 1 ? '' : 's'}`;
  return `${Math.round(days)} day${Math.round(days) === 1 ? '' : 's'}`;
}

export const DRINKS_WITH_QUERIES: DrinkWithQueries[] = DRINKS.map((drink) => ({
  ...drink,
  queries: queriesForLiters(drink.waterLiters),
  usageLabel: dailyUseLabel(queriesForLiters(drink.waterLiters)),
}));

/* ── Aggregate view: one year of US drink categories vs 2025 global AI ── */

/** NIAAA Surveillance Report 122, US 2023 volumes. */
export const BEER_GALLONS_2023 = 6_170_858_000;
export const WINE_GALLONS_2023 = 887_990_000;

/** USDA ERS fruit-juices table, US 2022. */
export const ORANGE_JUICE_GALLONS_2022 = 707_900_000;

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

/** Liters of water footprint per liter of drink, from the same sources as the calculator. */
export const BEER_FOOTPRINT_L_PER_L = 75 / 0.25;
export const WINE_FOOTPRINT_L_PER_L = 120 / 0.125;
export const ORANGE_JUICE_FOOTPRINT_L_PER_L = 170 / 0.2;
export const SODA_FOOTPRINT_L_PER_L = 169 / 0.5;
export const BOTTLED_WATER_FOOTPRINT_L_PER_L = 1.39;

export interface AggregateSource {
  label: string;
  url: string;
}

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
  sources: AggregateSource[];
}

const NIAAA_SOURCE: AggregateSource = {
  label: 'NIAAA Surveillance Report 122',
  url: 'https://www.niaaa.nih.gov/sites/default/files/surveillance-report122.Per-Capita-Consumption.pdf',
};
const HOEKSTRA_SOURCE: AggregateSource = {
  label: 'Hoekstra 2008',
  url: 'https://www.waterfootprint.org/resources/Hoekstra-2008-WaterfootprintFood.pdf',
};
const IBWA_2026_SOURCE: AggregateSource = {
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

export const AGGREGATE_CATEGORIES: AggregateCategory[] = [
  aggregate({
    id: 'soda',
    name: 'Soda',
    year: '2025',
    totalWaterLiters: SODA_GALLONS_2025 * GALLONS_TO_LITERS * SODA_FOOTPRINT_L_PER_L,
    volumeNote: `${(SODA_GALLONS_2025 / 1e9).toFixed(1)}B gallons, derived from IBWA per-capita and bottled-water figures`,
    footprintNote: '338 L per L — the low end of the published range',
    sources: [
      IBWA_2026_SOURCE,
      {
        label: 'Water Footprint Network Report 39',
        url: 'https://www.waterfootprint.org/resources/Report39-WaterFootprintCarbonatedBeverage.pdf',
      },
    ],
  }),
  aggregate({
    id: 'beer',
    name: 'Beer',
    year: '2023',
    totalWaterLiters: BEER_GALLONS_2023 * GALLONS_TO_LITERS * BEER_FOOTPRINT_L_PER_L,
    volumeNote: '6.17B gallons (NIAAA)',
    footprintNote: '300 L per L, same source as the calculator',
    sources: [NIAAA_SOURCE, HOEKSTRA_SOURCE],
  }),
  aggregate({
    id: 'wine',
    name: 'Wine',
    year: '2023',
    totalWaterLiters: WINE_GALLONS_2023 * GALLONS_TO_LITERS * WINE_FOOTPRINT_L_PER_L,
    volumeNote: '0.89B gallons (NIAAA)',
    footprintNote: '960 L per L, same source as the calculator',
    sources: [NIAAA_SOURCE, HOEKSTRA_SOURCE],
  }),
  aggregate({
    id: 'orange-juice',
    name: 'Orange juice',
    year: '2022',
    totalWaterLiters: ORANGE_JUICE_GALLONS_2022 * GALLONS_TO_LITERS * ORANGE_JUICE_FOOTPRINT_L_PER_L,
    volumeNote: '0.71B gallons (USDA ERS)',
    footprintNote: '850 L per L, same source as the calculator',
    sources: [
      {
        label: 'USDA ERS fruit-juices table',
        url: 'https://ers.usda.gov/media/5349/fruit-juices.csv?v=60123',
      },
      {
        label: 'Water Footprint Network Report 16',
        url: 'https://www.waterfootprint.org/resources/Report16Vol1.pdf',
      },
    ],
  }),
  aggregate({
    id: 'bottled-water',
    name: 'Bottled water',
    year: '2025',
    totalWaterLiters: BOTTLED_WATER_GALLONS_2025 * GALLONS_TO_LITERS * BOTTLED_WATER_FOOTPRINT_L_PER_L,
    volumeNote: '16.8B gallons, preliminary (IBWA)',
    footprintNote: '1.39 L per L facility ratio — the one category below the AI range',
    sources: [
      IBWA_2026_SOURCE,
      {
        label: 'IBWA 2024 benchmarking',
        url: 'https://bottledwater.org/wp-content/uploads/2024/08/IBWA-Benchmarking-Executive-Summary_May-2024.pdf',
      },
    ],
  }),
];

export const AGGREGATE_TOTAL_LITERS = AGGREGATE_CATEGORIES.reduce(
  (total, category) => total + category.totalWaterLiters,
  0,
);
export const AGGREGATE_TOTAL_MULTIPLE_MIN = AGGREGATE_TOTAL_LITERS / AI_2025_MAX_LITERS;
export const AGGREGATE_TOTAL_MULTIPLE_MAX = AGGREGATE_TOTAL_LITERS / AI_2025_MIN_LITERS;

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
