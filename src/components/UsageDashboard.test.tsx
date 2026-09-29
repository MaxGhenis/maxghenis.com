import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import fc from "fast-check";
import UsageDashboard, {
  buildModelTable,
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

// ---- Rendering ----

const zero = () => ({ tokens: 0, cost: 0, msgs: 0, prompts: 0 });
const emptyWindow = () => ({ claude: zero(), codex: zero(), other: zero(), total: zero() });
const emptyOrigins = () => ({ human: emptyWindow(), automated: emptyWindow(), all: emptyWindow() });

function usageData(pricing: UsageData["pricing"]): UsageData {
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
    byModel: BY_MODEL,
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
});
