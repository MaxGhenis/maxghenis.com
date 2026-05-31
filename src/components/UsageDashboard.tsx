import { useEffect, useMemo, useRef, useState } from "react";

// raw.githubusercontent.com refreshes within seconds of a push; jsdelivr's
// CDN cache lags by ~10 min even after manual purge. Use raw with
// cache:"no-store" to avoid the browser's own HTTP cache.
const DATA_URL =
  "https://raw.githubusercontent.com/MaxGhenis/usage-data/main/usage.json";

type Bucket = {
  tokens: number;
  cost: number;
  msgs: number;
  prompts: number;
};
type ClientSet = { claude: Bucket; codex: Bucket; other: Bucket };
type DailyRow = { date: string; human: ClientSet; automated: ClientSet };
type Window = {
  claude: Bucket;
  codex: Bucket;
  other: Bucket;
  total: Bucket;
};
type OriginWindows = { human: Window; automated: Window; all: Window };
type ModelBucket = { tokens: number; cost: number };
type ModelRow = {
  client: string;
  model: string;
  priceSource: string;
  human: ModelBucket;
  automated: ModelBucket;
  all: ModelBucket;
};
type Leaderboard = {
  url: string;
  rank?: { week?: number; month?: number; allTime?: number };
  users?: number;
  asOf?: string;
  embedSvg?: string;
};
type UsageData = {
  generatedAt: string;
  dateRange: { start: string; end: string };
  daily: DailyRow[];
  summary: { week: OriginWindows; month: OriginWindows; lifetime: OriginWindows };
  byModel: ModelRow[];
  pricing?: { note: string };
  leaderboards: {
    tokscale?: Leaderboard;
    straude?: Leaderboard;
  };
};

const CLAUDE_COLOR = "#CC785C";
const CODEX_COLOR = "#10A37F";
const OTHER_COLOR = "#888888";

function fmtTokens(n: number): string {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString();
}

function fmtUSD(n: number): string {
  if (n >= 1000) return "$" + Math.round(n).toLocaleString();
  return "$" + n.toFixed(0);
}

function fmtRelTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const minutes = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

// Snap step to the nearest 1/2/5 × 10^n (common "nice ticks" algorithm)
function niceStep125(rawStep: number): number {
  if (rawStep <= 0) return 1;
  const exp = Math.floor(Math.log10(rawStep));
  const base = Math.pow(10, exp);
  const norm = rawStep / base;
  let nice: number;
  if (norm <= 1) nice = 1;
  else if (norm <= 2) nice = 2;
  else if (norm <= 5) nice = 5;
  else nice = 10;
  return nice * base;
}

function fmtFullDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function fmtWeekLabel(iso: string): string {
  const d = new Date(iso);
  return (
    "Week of " +
    d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    })
  );
}

type Granularity = "day" | "week";
type RangeChoice = "7" | "30" | "90" | "all";
type Metric = "cost" | "tokens" | "prompts" | "msgs";
type Origin = "all" | "human" | "automated";

const METRIC_KEYS: Record<Metric, keyof Bucket> = {
  cost: "cost",
  tokens: "tokens",
  prompts: "prompts",
  msgs: "msgs",
};

function fmtMetric(metric: Metric, value: number): string {
  if (metric === "cost") return fmtUSD(value);
  if (metric === "tokens") return fmtTokens(value);
  return value.toLocaleString();
}

function fmtAxisTick(metric: Metric, value: number): string {
  if (metric === "cost") return "$" + Math.round(value).toLocaleString();
  if (metric === "tokens") return fmtTokens(value);
  return Math.round(value).toLocaleString();
}

const METRIC_LABELS: Record<Metric, string> = {
  cost: "Cost",
  tokens: "Tokens",
  prompts: "Prompts",
  msgs: "Records",
};

const ORIGIN_LABELS: Record<Origin, string> = {
  all: "All",
  human: "Human",
  automated: "Automated",
};

// A daily row reduced to a single origin view: {date, claude, codex, other}.
type FlatRow = { date: string } & ClientSet;

function addBucket(a: Bucket, b: Bucket): Bucket {
  return {
    tokens: a.tokens + b.tokens,
    cost: a.cost + b.cost,
    msgs: a.msgs + b.msgs,
    prompts: a.prompts + b.prompts,
  };
}

function flattenForOrigin(r: DailyRow, origin: Origin): FlatRow {
  if (origin === "human") return { date: r.date, ...r.human };
  if (origin === "automated") return { date: r.date, ...r.automated };
  return {
    date: r.date,
    claude: addBucket(r.human.claude, r.automated.claude),
    codex: addBucket(r.human.codex, r.automated.codex),
    other: addBucket(r.human.other, r.automated.other),
  };
}

function applyRange(daily: FlatRow[], range: RangeChoice): FlatRow[] {
  if (range === "all") return daily;
  const n = parseInt(range, 10);
  return daily.slice(-n);
}

function aggregateWeekly(daily: FlatRow[]): FlatRow[] {
  const groups = new Map<string, FlatRow>();
  for (const r of daily) {
    const d = new Date(r.date);
    const dow = (d.getUTCDay() + 6) % 7;
    const monday = new Date(d);
    monday.setUTCDate(d.getUTCDate() - dow);
    const key = monday.toISOString().slice(0, 10);
    let agg = groups.get(key);
    if (!agg) {
      agg = {
        date: key,
        claude: { tokens: 0, cost: 0, msgs: 0, prompts: 0 },
        codex: { tokens: 0, cost: 0, msgs: 0, prompts: 0 },
        other: { tokens: 0, cost: 0, msgs: 0, prompts: 0 },
      };
      groups.set(key, agg);
    }
    for (const k of ["claude", "codex", "other"] as const) {
      agg[k] = addBucket(agg[k], r[k]);
    }
  }
  return Array.from(groups.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
}

function StackedBarChart({
  daily,
  granularity,
  metric,
}: {
  daily: FlatRow[];
  granularity: Granularity;
  metric: Metric;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{
    index: number;
    x: number;
    y: number;
  } | null>(null);

  if (daily.length === 0) return null;

  const k = METRIC_KEYS[metric];
  const width = 760;
  const height = 240;
  const paddingLeft = 60;
  const paddingRight = 10;
  const paddingTop = 10;
  const paddingBottom = 30;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const dataMax = Math.max(
    ...daily.map((d) => d.claude[k] + d.codex[k] + d.other[k]),
    1,
  );
  const barWidth = chartWidth / daily.length;
  const barGap = Math.max(0, barWidth * 0.1);
  const barW = Math.max(1, barWidth - barGap);

  const targetTicks = 5;
  const step = niceStep125(dataMax / targetTicks);
  const yMax = Math.ceil(dataMax / step) * step;
  const tickCount = Math.round(yMax / step);
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const val = step * i;
    return { val, y: paddingTop + chartHeight - (val / yMax) * chartHeight };
  });

  const monthLabels: { i: number; label: string }[] = [];
  const seenMonths = new Set<string>();
  for (let i = 0; i < daily.length; i++) {
    const date = new Date(daily[i].date);
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
    if (!seenMonths.has(key)) {
      seenMonths.add(key);
      monthLabels.push({
        i,
        label: date.toLocaleDateString("en-US", {
          month: "short",
          timeZone: "UTC",
        }),
      });
    }
  }

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const svgX = xRatio * width;
    const idx = Math.floor((svgX - paddingLeft) / barWidth);
    if (idx < 0 || idx >= daily.length) {
      setHover(null);
      return;
    }
    const containerRect = containerRef.current?.getBoundingClientRect();
    const cx = containerRect ? e.clientX - containerRect.left : 0;
    const cy = containerRect ? e.clientY - containerRect.top : 0;
    setHover({ index: idx, x: cx, y: cy });
  };

  const hovered = hover ? daily[hover.index] : null;
  const hoveredTotal = hovered
    ? hovered.claude[k] + hovered.codex[k] + hovered.other[k]
    : 0;

  return (
    <div ref={containerRef} className="chart-container">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: "100%", height: "auto", display: "block" }}
        aria-label="Daily usage stacked bar chart"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={paddingLeft}
              x2={width - paddingRight}
              y1={t.y}
              y2={t.y}
              stroke="#e5e5e5"
              strokeWidth={1}
            />
            <text
              x={paddingLeft - 6}
              y={t.y + 3}
              fontSize={10}
              fill="#888"
              textAnchor="end"
            >
              {fmtAxisTick(metric, t.val)}
            </text>
          </g>
        ))}

        {daily.map((d, i) => {
          const claudeH = (d.claude[k] / yMax) * chartHeight;
          const codexH = (d.codex[k] / yMax) * chartHeight;
          const otherH = (d.other[k] / yMax) * chartHeight;
          const x = paddingLeft + i * barWidth;
          const baseY = paddingTop + chartHeight;
          const isHovered = hover?.index === i;
          return (
            <g key={d.date} opacity={hover && !isHovered ? 0.5 : 1}>
              {d.claude[k] > 0 && (
                <rect
                  x={x}
                  y={baseY - claudeH}
                  width={barW}
                  height={claudeH}
                  fill={CLAUDE_COLOR}
                />
              )}
              {d.codex[k] > 0 && (
                <rect
                  x={x}
                  y={baseY - claudeH - codexH}
                  width={barW}
                  height={codexH}
                  fill={CODEX_COLOR}
                />
              )}
              {d.other[k] > 0 && (
                <rect
                  x={x}
                  y={baseY - claudeH - codexH - otherH}
                  width={barW}
                  height={otherH}
                  fill={OTHER_COLOR}
                />
              )}
            </g>
          );
        })}

        {hover && (
          <line
            x1={paddingLeft + hover.index * barWidth + barW / 2}
            x2={paddingLeft + hover.index * barWidth + barW / 2}
            y1={paddingTop}
            y2={paddingTop + chartHeight}
            stroke="#222"
            strokeWidth={1}
            strokeDasharray="2,2"
            opacity={0.4}
            pointerEvents="none"
          />
        )}

        {monthLabels.map(({ i, label }) => (
          <text
            key={i}
            x={paddingLeft + i * barWidth}
            y={height - 10}
            fontSize={11}
            fill="#555"
          >
            {label}
          </text>
        ))}
      </svg>

      {hovered && hover && (
        <div
          className="chart-tooltip"
          style={{
            left: hover.x + 12,
            top: Math.max(0, hover.y - 12),
          }}
        >
          <div className="chart-tooltip-date">
            {granularity === "week"
              ? fmtWeekLabel(hovered.date)
              : fmtFullDate(hovered.date)}
          </div>
          <div className="chart-tooltip-total">
            {fmtMetric(metric, hoveredTotal)}
          </div>
          {(["claude", "codex", "other"] as const).map((cli) => {
            if (hovered[cli][k] === 0) return null;
            const color =
              cli === "claude"
                ? CLAUDE_COLOR
                : cli === "codex"
                  ? CODEX_COLOR
                  : OTHER_COLOR;
            const name =
              cli === "claude" ? "Claude" : cli === "codex" ? "Codex" : "Other";
            const meta =
              metric === "cost"
                ? fmtTokens(hovered[cli].tokens)
                : metric === "tokens"
                  ? fmtUSD(hovered[cli].cost)
                  : `${fmtUSD(hovered[cli].cost)} · ${fmtTokens(hovered[cli].tokens)}`;
            return (
              <div key={cli} className="chart-tooltip-row">
                <span
                  className="chart-tooltip-swatch"
                  style={{ background: color }}
                />
                {name} {fmtMetric(metric, hovered[cli][k])}
                <span className="chart-tooltip-meta">{meta}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DonutChart({ window: win, label }: { window: Window; label: string }) {
  const size = 140;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  const total = win.total.cost || 1;
  const segments = [
    { color: CLAUDE_COLOR, value: win.claude.cost, name: "Claude" },
    { color: CODEX_COLOR, value: win.codex.cost, name: "Codex" },
    { color: OTHER_COLOR, value: win.other.cost, name: "Other" },
  ].filter((s) => s.value > 0);

  let cumulative = 0;

  return (
    <div className="donut-card">
      <div className="donut-label">{label}</div>
      <svg width={size} height={size}>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke="#f0f0f0"
          strokeWidth={strokeWidth}
        />
        {segments.map((s, i) => {
          const fraction = s.value / total;
          const dashArray = `${fraction * circumference} ${circumference}`;
          const dashOffset = -cumulative * circumference;
          cumulative += fraction;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
        })}
        <text
          x={cx}
          y={cy - 6}
          textAnchor="middle"
          fontSize={18}
          fontWeight={600}
          fill="#222"
        >
          {fmtUSD(win.total.cost)}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={10} fill="#888">
          {fmtTokens(win.total.tokens)} toks
        </text>
      </svg>
      <div className="donut-legend">
        {segments.map((s, i) => (
          <div key={i} className="donut-legend-item">
            <span
              className="donut-legend-swatch"
              style={{ background: s.color }}
            />
            {s.name} {fmtUSD(s.value)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UsageDashboard() {
  const [data, setData] = useState<UsageData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [range, setRange] = useState<RangeChoice>("all");
  const [metric, setMetric] = useState<Metric>("cost");
  const [origin, setOrigin] = useState<Origin>("all");

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch(DATA_URL + "?t=" + Date.now(), { cache: "no-store" })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then((d) => {
          if (!cancelled) setData(d);
        })
        .catch((e) => {
          if (!cancelled) setErr(String(e));
        });
    };
    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const flatDaily = useMemo<FlatRow[]>(
    () => (data ? data.daily.map((r) => flattenForOrigin(r, origin)) : []),
    [data, origin],
  );

  if (err) {
    return <div className="usage-error">Failed to load usage data: {err}</div>;
  }
  if (!data) {
    return <div className="usage-loading">Loading usage data…</div>;
  }

  const { summary, byModel, leaderboards, generatedAt } = data;

  // by-model rows for the selected origin
  const modelRows = byModel
    .map((m) => ({ ...m, sel: m[origin] }))
    .filter((m) => m.sel.cost > 0)
    .sort((a, b) => b.sel.cost - a.sel.cost);
  const modelTotalCost = modelRows.reduce((s, m) => s + m.sel.cost, 0) || 1;

  const chartDaily =
    granularity === "week"
      ? aggregateWeekly(applyRange(flatDaily, range))
      : applyRange(flatDaily, range);

  const tk = leaderboards.tokscale;

  return (
    <div className="usage-dashboard">
      <p className="usage-sub">
        Live token usage across Claude Code and Codex, indexed from local
        session files by{" "}
        <a href="https://logpile.ai" target="_blank" rel="noopener">
          Logpile
        </a>
        . Auto-refreshes every 5 minutes. Last updated {fmtRelTime(generatedAt)}.
      </p>
      <p className="usage-disclaimer">
        Dollar figures are list-price estimates computed from raw per-model
        token counts at public API rates. Actual out-of-pocket is a fraction of
        these numbers because most usage flows through Claude Max and ChatGPT
        Pro flat subscriptions. <strong>Human</strong> = sessions I started or
        delegated; <strong>Automated</strong> = pipelines, evals, and background
        agents. Token volume is real. Source committed to{" "}
        <a
          href="https://github.com/MaxGhenis/usage-data"
          target="_blank"
          rel="noopener"
        >
          github.com/MaxGhenis/usage-data
        </a>
        . No message content, file paths, or project names are published.
      </p>

      <div className="chart-controls" style={{ marginTop: "1.25rem" }}>
        <div className="seg-group" role="group" aria-label="Origin">
          {(["all", "human", "automated"] as Origin[]).map((o) => (
            <button
              key={o}
              type="button"
              className={`seg-btn${origin === o ? " active" : ""}`}
              onClick={() => setOrigin(o)}
              title={
                o === "human"
                  ? "Sessions I started or delegated"
                  : o === "automated"
                    ? "Pipelines, evals, and background agents"
                    : "Everything"
              }
            >
              {ORIGIN_LABELS[o]}
            </button>
          ))}
        </div>
      </div>

      <section className="donut-row">
        <DonutChart window={summary.week[origin]} label="Last 7 days" />
        <DonutChart window={summary.month[origin]} label="Last 30 days" />
        <DonutChart window={summary.lifetime[origin]} label="Lifetime" />
      </section>

      <section>
        <div className="chart-header">
          <h2>
            {granularity === "week" ? "Weekly " : "Daily "}
            {METRIC_LABELS[metric].toLowerCase()}
            {origin !== "all" ? ` · ${ORIGIN_LABELS[origin].toLowerCase()}` : ""}
          </h2>
          <div className="chart-controls">
            <div className="seg-group" role="group" aria-label="Metric">
              {(["cost", "tokens", "prompts", "msgs"] as Metric[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`seg-btn${metric === m ? " active" : ""}`}
                  onClick={() => setMetric(m)}
                  title={
                    m === "prompts"
                      ? "Real user-typed prompts"
                      : m === "msgs"
                        ? "Message records (user + assistant)"
                        : undefined
                  }
                >
                  {m === "cost"
                    ? "$"
                    : m === "tokens"
                      ? "Tokens"
                      : m === "prompts"
                        ? "Prompts"
                        : "Records"}
                </button>
              ))}
            </div>
            <div className="seg-group" role="group" aria-label="Granularity">
              <button
                type="button"
                className={`seg-btn${granularity === "day" ? " active" : ""}`}
                onClick={() => setGranularity("day")}
              >
                Days
              </button>
              <button
                type="button"
                className={`seg-btn${granularity === "week" ? " active" : ""}`}
                onClick={() => setGranularity("week")}
              >
                Weeks
              </button>
            </div>
            <div className="seg-group" role="group" aria-label="Date range">
              {(["7", "30", "90", "all"] as RangeChoice[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`seg-btn${range === r ? " active" : ""}`}
                  onClick={() => setRange(r)}
                >
                  {r === "all" ? "All" : `${r}d`}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-swatch" style={{ background: CLAUDE_COLOR }} />
            Claude Code
          </div>
          <div className="legend-item">
            <span className="legend-swatch" style={{ background: CODEX_COLOR }} />
            Codex CLI
          </div>
        </div>
        <StackedBarChart
          daily={chartDaily}
          granularity={granularity}
          metric={metric}
        />
      </section>

      <section>
        <h2>By model</h2>
        <div className="table-wrap">
          <table className="usage-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Model</th>
                <th style={{ textAlign: "right" }}>Tokens</th>
                <th style={{ textAlign: "right" }}>Cost</th>
                <th style={{ textAlign: "right" }}>Share</th>
              </tr>
            </thead>
            <tbody>
              {modelRows.map((m) => (
                <tr key={`${m.client}:${m.model}`}>
                  <td style={{ textTransform: "capitalize" }}>{m.client}</td>
                  <td className="mono">{m.model}</td>
                  <td style={{ textAlign: "right" }}>{fmtTokens(m.sel.tokens)}</td>
                  <td style={{ textAlign: "right" }}>{fmtUSD(m.sel.cost)}</td>
                  <td style={{ textAlign: "right" }}>
                    {((m.sel.cost / modelTotalCost) * 100).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Public leaderboards</h2>
        <div className="leaderboard-grid">
          {tk && (
            <a href={tk.url} target="_blank" rel="noopener" className="leaderboard-card">
              <div className="leaderboard-card-header">
                <div className="leaderboard-name">Tokscale</div>
                {tk.users != null && (
                  <div className="leaderboard-users">
                    {tk.users.toLocaleString()} users
                  </div>
                )}
              </div>
              <div className="leaderboard-ranks">
                {tk.rank?.week != null && (
                  <div>
                    <span className="rank-label">This week:</span> #{tk.rank.week}
                  </div>
                )}
                {tk.rank?.month != null && (
                  <div>
                    <span className="rank-label">This month:</span> #{tk.rank.month}
                  </div>
                )}
                {tk.rank?.allTime != null && (
                  <div>
                    <span className="rank-label">All-time:</span> #{tk.rank.allTime}
                  </div>
                )}
                {tk.asOf && (
                  <div className="rank-label" style={{ fontSize: "0.7rem" }}>
                    as of {tk.asOf}
                  </div>
                )}
              </div>
            </a>
          )}
          {leaderboards.straude && (
            <a
              href={leaderboards.straude.url}
              target="_blank"
              rel="noopener"
              className="leaderboard-card"
            >
              <div className="leaderboard-card-header">
                <div className="leaderboard-name">Straude</div>
              </div>
              {leaderboards.straude.embedSvg && (
                <img
                  src={leaderboards.straude.embedSvg}
                  alt="Straude scorecard"
                  className="leaderboard-badge"
                />
              )}
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
