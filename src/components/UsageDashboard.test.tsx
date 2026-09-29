import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import fc from "fast-check";
import UsageDashboard, {
  buildModelTable,
  fmtShare,
  fmtUSD,
  type ModelRow,
  type Origin,
  type UsageData,
} from "./UsageDashboard";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const ORIGINS: Origin[] = ["all", "human", "automated"];

// byModel rows copied from usage.json on usage-data main, generated
// 2026-09-28T19:13:39Z: two priced rows, the three unpriced Codex models that
// usage-data#1 lists under pricing.unpriced, and the zero-token Claude
// "(unknown)" row, which that list leaves out.
const BY_MODEL: ModelRow[] = [
  {
    client: "codex",
    model: "gpt-5.5",
    priceSource: "OpenAI list",
    human: { tokens: 430952785777, cost: 290922.69 },
    automated: { tokens: 87076903, cost: 333.94 },
    all: { tokens: 431039862680, cost: 291256.63 },
  },
  {
    client: "claude",
    model: "claude-fable-5",
    priceSource: "Anthropic list",
    human: { tokens: 86684731442, cost: 169030.93 },
    automated: { tokens: 3086298701, cost: 6148.65 },
    all: { tokens: 89771030143, cost: 175179.58 },
  },
  {
    client: "claude",
    model: "(unknown)",
    priceSource: "unpriced",
    human: { tokens: 0, cost: 0 },
    automated: { tokens: 0, cost: 0 },
    all: { tokens: 0, cost: 0 },
  },
  {
    client: "codex",
    model: "gpt-6-astra",
    priceSource: "unpriced",
    human: { tokens: 11313406284, cost: 0 },
    automated: { tokens: 8294718819, cost: 0 },
    all: { tokens: 19608125103, cost: 0 },
  },
  {
    client: "codex",
    model: "gpt-6-sol",
    priceSource: "unpriced",
    human: { tokens: 1539525, cost: 0 },
    automated: { tokens: 2412601, cost: 0 },
    all: { tokens: 3952126, cost: 0 },
  },
  {
    client: "codex",
    model: "codex-auto-review",
    priceSource: "unpriced",
    human: { tokens: 503820, cost: 0 },
    automated: { tokens: 0, cost: 0 },
    all: { tokens: 503820, cost: 0 },
  },
];

// pricing.unpriced as build_usage.py on usage-data#1 emits it for the rows above.
const UNPRICED = [
  { client: "codex", model: "gpt-6-astra", tokens: 19608125103 },
  { client: "codex", model: "gpt-6-sol", tokens: 3952126 },
  { client: "codex", model: "codex-auto-review", tokens: 503820 },
];

// Three more priced Codex rows from the same usage.json, each under $1 in at
// least one view. The table showed their cost as "$0" and every share here as
// 0.0%, next to the unpriced rows' dashes.
const SUB_DOLLAR: ModelRow[] = [
  {
    client: "codex",
    model: "gpt-5.6-luna",
    priceSource: "OpenAI list",
    human: { tokens: 203801, cost: 0.09 },
    automated: { tokens: 10764589, cost: 2.37 },
    all: { tokens: 10968390, cost: 2.46 },
  },
  {
    client: "codex",
    model: "gpt-5.3-codex",
    priceSource: "OpenAI list (codex rate)",
    human: { tokens: 0, cost: 0 },
    automated: { tokens: 322587, cost: 0.48 },
    all: { tokens: 322587, cost: 0.48 },
  },
  {
    client: "codex",
    model: "gpt-5.1-codex-max",
    priceSource: "OpenAI list",
    human: { tokens: 354196, cost: 0.14 },
    automated: { tokens: 0, cost: 0 },
    all: { tokens: 354196, cost: 0.14 },
  },
];

// The by-model logic before pricing.unpriced existed, kept as the reference
// for the differential property below.
function legacyPricedRows(byModel: ModelRow[], origin: Origin) {
  return byModel
    .map((m) => ({ ...m, sel: m[origin] }))
    .filter((m) => m.sel.cost > 0)
    .sort((a, b) => b.sel.cost - a.sel.cost)
    .map((m) => ({
      client: m.client,
      model: m.model,
      tokens: m.sel.tokens,
      cost: m.sel.cost,
    }));
}

const names = (rows: { model: string }[]) => rows.map((r) => r.model);

describe("buildModelTable", () => {
  it("lists unpriced models after the priced ones, sorted by tokens", () => {
    const t = buildModelTable(BY_MODEL, UNPRICED, "all");
    expect(names(t.priced)).toEqual(["gpt-5.5", "claude-fable-5"]);
    expect(t.unpriced).toEqual([
      { client: "codex", model: "gpt-6-astra", tokens: 19608125103, cost: 0 },
      { client: "codex", model: "gpt-6-sol", tokens: 3952126, cost: 0 },
      { client: "codex", model: "codex-auto-review", tokens: 503820, cost: 0 },
    ]);
    expect(t.pricedTotalCost).toBeCloseTo(291256.63 + 175179.58, 6);
  });

  it("takes each origin's tokens from byModel, not the all-origin list", () => {
    const human = buildModelTable(BY_MODEL, UNPRICED, "human");
    expect(human.unpriced.map((r) => [r.model, r.tokens])).toEqual([
      ["gpt-6-astra", 11313406284],
      ["gpt-6-sol", 1539525],
      ["codex-auto-review", 503820],
    ]);
    const automated = buildModelTable(BY_MODEL, UNPRICED, "automated");
    // codex-auto-review has no automated usage, so it has no automated row.
    expect(automated.unpriced.map((r) => [r.model, r.tokens])).toEqual([
      ["gpt-6-astra", 8294718819],
      ["gpt-6-sol", 2412601],
    ]);
  });

  it("sorts each view by that view's tokens, not by list or all-origin order", () => {
    // gpt-6-sol leads the human view but trails gpt-6-astra overall.
    const byModel = BY_MODEL.map((m) =>
      m.model === "gpt-6-sol"
        ? {
            ...m,
            human: { tokens: 20e9, cost: 0 },
            all: { tokens: 20e9 + m.automated.tokens, cost: 0 },
          }
        : m,
    );
    const list = [...UNPRICED].reverse();
    const order = (origin: Origin) =>
      names(buildModelTable(byModel, list, origin).unpriced);
    expect(order("all")).toEqual(["gpt-6-sol", "gpt-6-astra", "codex-auto-review"]);
    expect(order("human")).toEqual(["gpt-6-sol", "gpt-6-astra", "codex-auto-review"]);
    expect(order("automated")).toEqual(["gpt-6-astra", "gpt-6-sol"]);
    // The list itself is in reverse token order; the table must not follow it.
    expect(names(list)).toEqual(["codex-auto-review", "gpt-6-sol", "gpt-6-astra"]);
  });

  it("has no unpriced rows when the field is absent, empty or malformed", () => {
    for (const origin of ORIGINS) {
      const legacy = legacyPricedRows(BY_MODEL, origin);
      for (const list of [undefined, null, [], {}, "gpt-6-astra", 3, [null, 1, "x"]]) {
        const t = buildModelTable(BY_MODEL, list, origin);
        expect(t.unpriced).toEqual([]);
        expect(t.priced).toEqual(legacy);
      }
    }
  });

  it("skips entries without a string client and model", () => {
    const t = buildModelTable(
      BY_MODEL,
      [{ model: "gpt-6-astra", tokens: 5 }, { client: "codex", model: 7, tokens: 5 }],
      "all",
    );
    expect(t.unpriced).toEqual([]);
  });

  it("falls back to the list's tokens only for the all view", () => {
    const list = [{ client: "codex", model: "gpt-7", tokens: 1200 }];
    expect(buildModelTable(BY_MODEL, list, "all").unpriced).toEqual([
      { client: "codex", model: "gpt-7", tokens: 1200, cost: 0 },
    ]);
    // With no byModel row there is no human/automated split to show.
    expect(buildModelTable(BY_MODEL, list, "human").unpriced).toEqual([]);
    expect(buildModelTable(BY_MODEL, list, "automated").unpriced).toEqual([]);
  });

  it("drops entries with no usage in the view, bad token counts, or duplicates", () => {
    const list = [
      { client: "codex", model: "gpt-7", tokens: 0 },
      { client: "codex", model: "gpt-7a", tokens: -3 },
      { client: "codex", model: "gpt-7b", tokens: Number.NaN },
      { client: "codex", model: "gpt-7c", tokens: Number.POSITIVE_INFINITY },
      { client: "codex", model: "gpt-7d", tokens: "12" },
      { client: "claude", model: "(unknown)", tokens: 9 },
      { client: "codex", model: "gpt-6-sol", tokens: 3952126 },
      { client: "codex", model: "gpt-6-sol", tokens: 3952126 },
    ];
    const t = buildModelTable(BY_MODEL, list, "all");
    expect(t.unpriced.map((r) => r.model)).toEqual(["gpt-6-sol"]);
  });

  it("never repeats a model that already has a priced row", () => {
    const t = buildModelTable(
      BY_MODEL,
      [{ client: "codex", model: "gpt-5.5", tokens: 431039862680 }],
      "all",
    );
    expect(t.unpriced).toEqual([]);
    expect(names(t.priced)).toEqual(["gpt-5.5", "claude-fable-5"]);
  });

  it("keeps a model name that is priced under another client", () => {
    const t = buildModelTable(
      BY_MODEL,
      [{ client: "claude", model: "gpt-5.5", tokens: 10 }],
      "all",
    );
    expect(t.unpriced).toEqual([
      { client: "claude", model: "gpt-5.5", tokens: 10, cost: 0 },
    ]);
  });
});

// ---- Invariants, checked for arbitrary inputs ----

const modelName = fc.constantFrom(
  "gpt-5.5",
  "gpt-6-astra",
  "gpt-6-sol",
  "codex-auto-review",
  "claude-fable-5",
  "claude-opus-5-5",
  "(unknown)",
);
const client = fc.constantFrom("claude", "codex", "other");
const bucket = fc.record({
  tokens: fc.nat({ max: 5e11 }),
  cost: fc.oneof(
    fc.constant(0),
    fc.double({ min: 0, max: 5e5, noNaN: true }),
    fc.double({ min: -10, max: 0, noNaN: true }),
  ),
});
const modelRow: fc.Arbitrary<ModelRow> = fc
  .record({ client, model: modelName, human: bucket, automated: bucket })
  .map((r) => ({
    client: r.client,
    model: r.model,
    priceSource: r.human.cost > 0 || r.automated.cost > 0 ? "list" : "unpriced",
    human: r.human,
    automated: r.automated,
    all: {
      tokens: r.human.tokens + r.automated.tokens,
      cost: r.human.cost + r.automated.cost,
    },
  }));
// usage-data emits at most one byModel row per (client, model).
const byModelArb = fc.uniqueArray(modelRow, {
  selector: (r) => `${r.client}\u0000${r.model}`,
  maxLength: 8,
});
const unpricedEntry = fc.record({
  client,
  model: modelName,
  tokens: fc.oneof(fc.nat({ max: 5e11 }), fc.constant(0), fc.constant(Number.NaN)),
});
// Mostly well-formed lists, so most runs produce several unpriced rows; the
// rest cover absent and malformed fields.
const unpricedArb = fc.oneof(
  { arbitrary: fc.array(unpricedEntry, { minLength: 2, maxLength: 8 }), weight: 6 },
  { arbitrary: fc.constant(undefined), weight: 1 },
  { arbitrary: fc.constant(null), weight: 1 },
  { arbitrary: fc.anything(), weight: 2 },
);
const originArb = fc.constantFrom<Origin>(...ORIGINS);

describe("buildModelTable invariants", () => {
  it("priced rows match the pre-change table whatever pricing.unpriced holds", () => {
    fc.assert(
      fc.property(byModelArb, unpricedArb, originArb, (byModel, list, origin) => {
        const t = buildModelTable(byModel, list, origin);
        expect(t.priced).toEqual(legacyPricedRows(byModel, origin));
      }),
    );
  });

  it("priced total is the sum of priced costs, so shares sum to 100%", () => {
    fc.assert(
      fc.property(byModelArb, unpricedArb, originArb, (byModel, list, origin) => {
        const t = buildModelTable(byModel, list, origin);
        const sum = t.priced.reduce((s, r) => s + r.cost, 0);
        expect(t.pricedTotalCost).toBe(sum);
        if (t.priced.length > 0) {
          const shares = t.priced.reduce((s, r) => s + r.cost / t.pricedTotalCost, 0);
          expect(shares).toBeCloseTo(1, 9);
        }
      }),
    );
  });

  it("no (client, model) appears twice across both lists", () => {
    fc.assert(
      fc.property(byModelArb, unpricedArb, originArb, (byModel, list, origin) => {
        const t = buildModelTable(byModel, list, origin);
        const keys = [...t.priced, ...t.unpriced].map((r) => `${r.client}\u0000${r.model}`);
        expect(new Set(keys).size).toBe(keys.length);
      }),
    );
  });

  it("every unpriced row is listed, has usage in the view, and costs nothing", () => {
    fc.assert(
      fc.property(byModelArb, unpricedArb, originArb, (byModel, list, origin) => {
        const t = buildModelTable(byModel, list, origin);
        const listed = Array.isArray(list) ? list : [];
        for (const r of t.unpriced) {
          expect(r.cost).toBe(0);
          expect(r.tokens > 0 && Number.isFinite(r.tokens)).toBe(true);
          expect(
            listed.some((u) => u && u.client === r.client && u.model === r.model),
          ).toBe(true);
          const row = byModel.find((m) => m.client === r.client && m.model === r.model);
          if (row) expect(r.tokens).toBe(row[origin].tokens);
        }
        for (let i = 1; i < t.unpriced.length; i++) {
          expect(t.unpriced[i - 1].tokens).toBeGreaterThanOrEqual(t.unpriced[i].tokens);
        }
      }),
    );
  });

  it("every listed model with usage in the view is shown somewhere", () => {
    fc.assert(
      fc.property(
        byModelArb,
        fc.array(unpricedEntry, { maxLength: 8 }),
        originArb,
        (byModel, list, origin) => {
          const t = buildModelTable(byModel, list, origin);
          const shown = new Set(
            [...t.priced, ...t.unpriced].map((r) => `${r.client}\u0000${r.model}`),
          );
          for (const u of list) {
            const row = byModel.find((m) => m.client === u.client && m.model === u.model);
            const tokens = row ? row[origin].tokens : origin === "all" ? u.tokens : 0;
            if (tokens > 0 && Number.isFinite(tokens)) {
              expect(shown.has(`${u.client}\u0000${u.model}`)).toBe(true);
            }
          }
        },
      ),
    );
  });
});

// ---- Dollar and share formatting ----

// The formatters before sub-dollar costs and tiny shares had their own
// strings, kept as the reference for the differential properties below.
function legacyFmtUSD(n: number): string {
  if (n >= 1000) return "$" + Math.round(n).toLocaleString();
  return "$" + n.toFixed(0);
}
const legacyFmtShare = (cost: number, total: number) =>
  ((cost / total) * 100).toFixed(1) + "%";

describe("fmtUSD", () => {
  it("shows a positive amount under $1 as <$1, never $0", () => {
    expect(fmtUSD(0.48)).toBe("<$1"); // gpt-5.3-codex
    expect(fmtUSD(0.14)).toBe("<$1"); // gpt-5.1-codex-max
    expect(fmtUSD(0.09)).toBe("<$1"); // gpt-5.6-luna, human view
    expect(fmtUSD(0.59)).toBe("<$1"); // previously rounded up to "$1"
    expect(fmtUSD(0.999)).toBe("<$1");
    expect(fmtUSD(Number.MIN_VALUE)).toBe("<$1");
  });

  it("keeps whole dollars from $1 up, and $0 for nothing", () => {
    expect(fmtUSD(0)).toBe("$0");
    expect(fmtUSD(1)).toBe("$1");
    expect(fmtUSD(2.46)).toBe("$2");
    expect(fmtUSD(2.5)).toBe("$3");
    expect(fmtUSD(999.49)).toBe("$999");
    expect(fmtUSD(291256.63)).toBe("$291,257");
  });

  it("uses a thousands separator for anything that rounds to $1,000", () => {
    // Previously $999.50 up to $1,000 rendered as "$1000".
    expect(legacyFmtUSD(999.5)).toBe("$1000");
    expect(fmtUSD(999.5)).toBe("$1,000");
    expect(fmtUSD(999.99)).toBe("$1,000");
    expect(fmtUSD(1000)).toBe("$1,000");
  });
});

describe("fmtShare", () => {
  it("shows a positive cost's share under 0.05% as <0.1%, never 0.0%", () => {
    // gpt-5.3-codex's $0.48 of the all-view priced total with SUB_DOLLAR added.
    expect(legacyFmtShare(0.48, 466439.29)).toBe("0.0%");
    expect(fmtShare(0.48, 466439.29)).toBe("<0.1%");
    // Live All view: claude-opus-4-5-20251101, $376.90 of $1,232,229.40, 0.031%.
    expect(fmtShare(376.9, 1232229.4)).toBe("<0.1%");
    // The quotient underflows to 0; the cost is still positive.
    expect(fmtShare(Number.MIN_VALUE, 5e5)).toBe("<0.1%");
  });

  it("keeps one decimal place from 0.05% up, and 0.0% for no cost", () => {
    expect(fmtShare(0.06, 100)).toBe("0.1%");
    expect(fmtShare(291256.63, 466439.29)).toBe("62.4%");
    expect(fmtShare(1, 1)).toBe("100.0%");
    expect(fmtShare(0, 1)).toBe("0.0%");
  });

  it("switches from <0.1% to 0.1% exactly at 0.05%", () => {
    // Live Automated view: claude-opus-4-5-20251101, $113.55 of $281,389.29, 0.040%.
    expect(fmtShare(113.55, 281389.29)).toBe("<0.1%");
    // Just below 0.05%, which the old formatter showed as 0.0%.
    expect(legacyFmtShare(0.0004999999999999999, 1)).toBe("0.0%");
    expect(fmtShare(0.0004999999999999999, 1)).toBe("<0.1%");
    expect(fmtShare(1, 2000)).toBe("0.1%");
    // Live All view: claude-sonnet-5, $702.58 of $1,232,229.40, 0.057%.
    expect(fmtShare(702.58, 1232229.4)).toBe("0.1%");
  });
});

// Amounts across the page's range, weighted toward the two ranges where the
// output changed: under $1, and $999.50 up to $1,000.
const dollars = fc.oneof(
  fc.double({ min: 0, max: 1, noNaN: true }),
  fc.double({ min: 999, max: 1001, noNaN: true }),
  fc.double({ min: 0, max: 5e6, noNaN: true }),
);
// A row's cost and a priced total at least that large, in whole cents, plus
// pairs whose share falls between 0.03% and 0.07%, around the cutoff. Cents
// keep the shrink of a failing case short; the underflow case is an example.
const costAndTotal = fc.oneof(
  fc
    .tuple(fc.integer({ min: 1, max: 5e7 }), fc.integer({ min: 0, max: 5e8 }))
    .map(([cost, rest]) => [cost / 100, (cost + rest) / 100] as const),
  fc
    .tuple(fc.integer({ min: 1, max: 5e7 }), fc.double({ min: 0.03, max: 0.07, noNaN: true }))
    .map(([cost, pct]) => [cost / 100, ((cost / 100) * 100) / pct] as const),
);
// Fail within seconds rather than hang CI if a caught failure shrinks slowly.
const TIME_LIMIT = { interruptAfterTimeLimit: 10_000, markInterruptAsFailure: true };

describe("formatting invariants", () => {
  it("fmtUSD matches the old formatter except under $1 and from $999.50 to $1,000", () => {
    fc.assert(
      fc.property(dollars, (n) => {
        const s = fmtUSD(n);
        if (n > 0 && n < 1) expect(s).toBe("<$1");
        else if (n >= 999.5 && n < 1000) expect(s).toBe("$1,000");
        else expect(s).toBe(legacyFmtUSD(n));
      }),
    );
  });

  it("fmtUSD never shows a positive amount as $0", () => {
    fc.assert(
      fc.property(dollars, (n) => {
        if (n > 0) expect(fmtUSD(n)).not.toBe("$0");
      }),
    );
  });

  it("fmtShare matches the old formatter except where it showed a positive cost as 0.0%", () => {
    fc.assert(
      fc.property(costAndTotal, ([cost, total]) => {
        const old = legacyFmtShare(cost, total);
        const s = fmtShare(cost, total);
        if (old === "0.0%") expect(s).toBe("<0.1%");
        else expect(s).toBe(old);
        expect(s).not.toBe("0.0%");
      }),
      TIME_LIMIT,
    );
  });

  it("no priced by-model row shows $0 or 0.0%", () => {
    fc.assert(
      fc.property(byModelArb, unpricedArb, originArb, (byModel, list, origin) => {
        const t = buildModelTable(byModel, list, origin);
        // The component's fallback for an empty priced list.
        const total = t.pricedTotalCost || 1;
        for (const r of t.priced) {
          expect(fmtUSD(r.cost)).not.toBe("$0");
          expect(fmtShare(r.cost, total)).not.toBe("0.0%");
        }
      }),
      TIME_LIMIT,
    );
  });
});

// ---- Rendering ----

const zero = () => ({ tokens: 0, cost: 0, msgs: 0, prompts: 0 });
const emptyWindow = () => ({ claude: zero(), codex: zero(), other: zero(), total: zero() });
const emptyOrigins = () => ({ human: emptyWindow(), automated: emptyWindow(), all: emptyWindow() });

function usageData(pricing: UsageData["pricing"], byModel: ModelRow[] = BY_MODEL): UsageData {
  return {
    generatedAt: "2026-09-28T19:13:39Z",
    dateRange: { start: "2026-09-28", end: "2026-09-28" },
    daily: [
      {
        date: "2026-09-28",
        human: { claude: zero(), codex: zero(), other: zero() },
        automated: { claude: zero(), codex: zero(), other: zero() },
      },
    ],
    summary: { week: emptyOrigins(), month: emptyOrigins(), lifetime: emptyOrigins() },
    byModel,
    pricing,
    leaderboards: {},
  };
}

describe("UsageDashboard by-model table", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  async function renderWith(data: unknown) {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, status: 200, json: async () => data })),
    );
    await act(async () => {
      root.render(createElement(UsageDashboard));
    });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });
  }

  function modelTableRows() {
    const section = [...container.querySelectorAll("section")].find(
      (s) => s.querySelector("h2")?.textContent === "By model",
    );
    expect(section).toBeTruthy();
    return [...section!.querySelectorAll("tbody tr")].map((tr) =>
      [...tr.querySelectorAll("td")].map((td) => td.textContent),
    );
  }

  function clickOrigin(label: string) {
    const group = container.querySelector('[aria-label="Origin"]')!;
    const btn = [...group.querySelectorAll("button")].find((b) => b.textContent === label)!;
    act(() => btn.click());
  }

  const noteText = () => container.querySelector(".usage-table-note")?.textContent ?? null;
  const PLURAL_NOTE =
    "— Not priced yet: the list-price table in usage-data has no rate for these " +
    "models, so their tokens count toward the token totals but add $0 to the dollar " +
    "figures above.";
  const SINGULAR_NOTE =
    "— Not priced yet: the list-price table in usage-data has no rate for this " +
    "model, so its tokens count toward the token totals but add $0 to the dollar " +
    "figures above.";
  const unpricedModels = () =>
    modelTableRows()
      .filter((r) => r[3]?.startsWith("—"))
      .map((r) => [r[1], r[2]]);

  it("shows unpriced models with a dash for cost and share, plus a note", async () => {
    await renderWith(usageData({ note: "n", unpriced: UNPRICED }));
    expect(modelTableRows()).toEqual([
      ["codex", "gpt-5.5", "431.0B", "$291,257", "62.4%"],
      ["claude", "claude-fable-5", "89.8B", "$175,180", "37.6%"],
      ["codex", "gpt-6-astra", "19.6B", "—Not priced yet", "—Not priced yet"],
      ["codex", "gpt-6-sol", "4.0M", "—Not priced yet", "—Not priced yet"],
      ["codex", "codex-auto-review", "503.8K", "—Not priced yet", "—Not priced yet"],
    ]);
    expect(noteText()).toBe(PLURAL_NOTE);
    const link = container.querySelector<HTMLAnchorElement>(".usage-table-note a")!;
    expect(link.textContent).toBe("list-price table");
    expect(link.getAttribute("href")).toBe(
      "https://github.com/MaxGhenis/usage-data/blob/main/extract.py",
    );
    expect(container.querySelectorAll("tr.unpriced-row")).toHaveLength(3);
  });

  it("hides the dash from screen readers and gives them a label instead", async () => {
    await renderWith(usageData({ note: "n", unpriced: UNPRICED }));
    const rows = container.querySelectorAll("tr.unpriced-row");
    expect(rows).toHaveLength(3);
    for (const tr of rows) {
      const tds = tr.querySelectorAll("td");
      for (const td of [tds[3], tds[4]]) {
        const spans = td.querySelectorAll("span");
        expect(spans).toHaveLength(2);
        expect(spans[0].getAttribute("aria-hidden")).toBe("true");
        expect(spans[0].textContent).toBe("—");
        expect(spans[1].className).toBe("sr-only");
        expect(spans[1].textContent).toBe("Not priced yet");
      }
    }
  });

  it("follows the origin toggle, note included", async () => {
    await renderWith(usageData({ note: "n", unpriced: UNPRICED }));
    clickOrigin("Automated");
    expect(unpricedModels()).toEqual([
      ["gpt-6-astra", "8.3B"],
      ["gpt-6-sol", "2.4M"],
    ]);
    expect(noteText()).toBe(PLURAL_NOTE);
    clickOrigin("Human");
    expect(unpricedModels()).toEqual([
      ["gpt-6-astra", "11.3B"],
      ["gpt-6-sol", "1.5M"],
      ["codex-auto-review", "503.8K"],
    ]);
    expect(noteText()).toBe(PLURAL_NOTE);
  });

  it("uses singular wording for one unpriced model", async () => {
    await renderWith(usageData({ note: "n", unpriced: UNPRICED.slice(0, 1) }));
    expect(noteText()).toBe(SINGULAR_NOTE);
  });

  it("counts the rows in the current view, not the list, for the note", async () => {
    // codex-auto-review has no automated usage.
    const autoReview = UNPRICED.filter((u) => u.model === "codex-auto-review");
    const astra = UNPRICED.filter((u) => u.model === "gpt-6-astra");
    await renderWith(usageData({ note: "n", unpriced: [...autoReview, ...astra] }));
    expect(noteText()).toBe(PLURAL_NOTE);
    clickOrigin("Automated");
    expect(unpricedModels()).toEqual([["gpt-6-astra", "8.3B"]]);
    expect(noteText()).toBe(SINGULAR_NOTE);
  });

  it("drops the note when no listed model has usage in the view", async () => {
    const autoReview = UNPRICED.filter((u) => u.model === "codex-auto-review");
    await renderWith(usageData({ note: "n", unpriced: autoReview }));
    expect(unpricedModels()).toEqual([["codex-auto-review", "503.8K"]]);
    expect(noteText()).toBe(SINGULAR_NOTE);
    clickOrigin("Automated");
    expect(container.querySelectorAll("tr.unpriced-row")).toHaveLength(0);
    expect(noteText()).toBeNull();
  });

  for (const [label, pricing] of [
    ["no pricing object", undefined],
    ["pricing without unpriced", { note: "n" }],
    ["an empty unpriced list", { note: "n", unpriced: [] }],
  ] as const) {
    it(`renders the priced table alone with ${label}`, async () => {
      await renderWith(usageData(pricing as UsageData["pricing"]));
      expect(modelTableRows()).toEqual([
        ["codex", "gpt-5.5", "431.0B", "$291,257", "62.4%"],
        ["claude", "claude-fable-5", "89.8B", "$175,180", "37.6%"],
      ]);
      expect(container.querySelector(".usage-table-note")).toBeNull();
      expect(container.querySelector(".usage-error")).toBeNull();
    });
  }

  it("shows priced rows under $1 as <$1 and shares under 0.05% as <0.1%", async () => {
    await renderWith(usageData({ note: "n", unpriced: UNPRICED }, [...BY_MODEL, ...SUB_DOLLAR]));
    const dash = "—Not priced yet";
    expect(modelTableRows()).toEqual([
      ["codex", "gpt-5.5", "431.0B", "$291,257", "62.4%"],
      ["claude", "claude-fable-5", "89.8B", "$175,180", "37.6%"],
      ["codex", "gpt-5.6-luna", "11.0M", "$2", "<0.1%"],
      ["codex", "gpt-5.3-codex", "322.6K", "<$1", "<0.1%"],
      ["codex", "gpt-5.1-codex-max", "354.2K", "<$1", "<0.1%"],
      ["codex", "gpt-6-astra", "19.6B", dash, dash],
      ["codex", "gpt-6-sol", "4.0M", dash, dash],
      ["codex", "codex-auto-review", "503.8K", dash, dash],
    ]);
    expect(container.querySelectorAll("tr.unpriced-row")).toHaveLength(3);
    clickOrigin("Human");
    expect(modelTableRows()).toEqual([
      ["codex", "gpt-5.5", "431.0B", "$290,923", "63.3%"],
      ["claude", "claude-fable-5", "86.7B", "$169,031", "36.7%"],
      ["codex", "gpt-5.1-codex-max", "354.2K", "<$1", "<0.1%"],
      ["codex", "gpt-5.6-luna", "203.8K", "<$1", "<0.1%"],
      ["codex", "gpt-6-astra", "11.3B", dash, dash],
      ["codex", "gpt-6-sol", "1.5M", dash, dash],
      ["codex", "codex-auto-review", "503.8K", dash, dash],
    ]);
    clickOrigin("Automated");
    expect(modelTableRows()).toEqual([
      ["claude", "claude-fable-5", "3.1B", "$6,149", "94.8%"],
      ["codex", "gpt-5.5", "87.1M", "$334", "5.1%"],
      ["codex", "gpt-5.6-luna", "10.8M", "$2", "<0.1%"],
      ["codex", "gpt-5.3-codex", "322.6K", "<$1", "<0.1%"],
      ["codex", "gpt-6-astra", "8.3B", dash, dash],
      ["codex", "gpt-6-sol", "2.4M", dash, dash],
    ]);
  });

  it("shows a day's cost under $1 as <$1 in the chart tooltip", async () => {
    // 2026-09-24 on the live page, All view: $0.40 of Codex cost over 501.6M
    // tokens. The tooltip read "Codex $0". The Claude figures and both prompt
    // and record counts are made up, so every metric shows both rows.
    const data = usageData(undefined);
    data.daily = [
      {
        date: "2026-09-24",
        human: {
          claude: { tokens: 1.2e9, cost: 2500.4, msgs: 10, prompts: 5 },
          codex: { tokens: 501567829, cost: 0.4, msgs: 4, prompts: 2 },
          other: zero(),
        },
        automated: { claude: zero(), codex: zero(), other: zero() },
      },
    ];
    await renderWith(data);
    const svg = container.querySelector<SVGSVGElement>(
      'svg[aria-label="Daily usage stacked bar chart"]',
    )!;
    // happy-dom lays nothing out, so give the chart its viewBox size.
    svg.getBoundingClientRect = () =>
      ({ left: 0, top: 0, right: 760, bottom: 240, width: 760, height: 240 }) as DOMRect;
    const hover = () =>
      act(() => {
        svg.dispatchEvent(
          new MouseEvent("mousemove", { bubbles: true, clientX: 400, clientY: 100 }),
        );
      });
    const tooltipRows = () =>
      [...container.querySelectorAll(".chart-tooltip-row")].map((row) => {
        const meta = row.querySelector(".chart-tooltip-meta")!.textContent!;
        return [row.textContent!.slice(0, -meta.length), meta];
      });

    hover();
    // The day's total, $2,500.80, includes the Codex cost.
    expect(container.querySelector(".chart-tooltip-total")!.textContent).toBe("$2,501");
    expect(tooltipRows()).toEqual([
      ["Claude $2,500", "1.2B"],
      ["Codex <$1", "501.6M"],
    ]);

    const tokensBtn = [
      ...container.querySelectorAll('[aria-label="Metric"] button'),
    ].find((b) => b.textContent === "Tokens") as HTMLButtonElement;
    act(() => tokensBtn.click());
    hover();
    expect(tooltipRows()).toEqual([
      ["Claude 1.2B", "$2,500"],
      ["Codex 501.6M", "<$1"],
    ]);

    const promptsBtn = [
      ...container.querySelectorAll('[aria-label="Metric"] button'),
    ].find((b) => b.textContent === "Prompts") as HTMLButtonElement;
    act(() => promptsBtn.click());
    hover();
    expect(tooltipRows()).toEqual([
      ["Claude 5", "$2,500 · 1.2B"],
      ["Codex 2", "<$1 · 501.6M"],
    ]);
  });

  it("shows a client's cost under $1 as <$1 in the donut legend", async () => {
    // Last 7 days, Human view, on the live page: $0.59 of Codex cost over
    // 592.7M tokens. The legend read "Codex $1".
    const data = usageData(undefined);
    const claude = { tokens: 34393019191, cost: 82440.39, msgs: 0, prompts: 0 };
    const codex = { tokens: 592690538, cost: 0.59, msgs: 0, prompts: 0 };
    data.summary.week.human = {
      claude,
      codex,
      other: zero(),
      total: {
        tokens: claude.tokens + codex.tokens,
        cost: claude.cost + codex.cost,
        msgs: 0,
        prompts: 0,
      },
    };
    await renderWith(data);
    clickOrigin("Human");
    const week = container.querySelector(".donut-card")!;
    expect(week.querySelector(".donut-label")!.textContent).toBe("Last 7 days");
    expect([...week.querySelectorAll("svg text")].map((t) => t.textContent)).toEqual([
      "$82,441",
      "35.0B toks",
    ]);
    expect(
      [...week.querySelectorAll(".donut-legend-item")].map((e) => e.textContent),
    ).toEqual(["Claude $82,440", "Codex <$1"]);
  });
});
