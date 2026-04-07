import { useEffect, useState } from "react";

const DATA_URL =
  "https://raw.githubusercontent.com/MaxGhenis/usage-data/main/usage.json";

type Bucket = { tokens: number; cost: number; msgs: number };
type DailyRow = {
  date: string;
  claude: Bucket;
  codex: Bucket;
  other: Bucket;
};
type Window = { claude: Bucket; codex: Bucket; other: Bucket; total: Bucket };
type ModelRow = {
  client: string;
  model: string;
  tokens: number;
  cost: number;
  share: number;
};
type Leaderboard = {
  url: string;
  rank?: { week?: number; month?: number; allTime?: number };
  users?: number;
  embedSvg?: string;
};
type UsageData = {
  generatedAt: string;
  dateRange: { start: string; end: string };
  daily: DailyRow[];
  summary: { week: Window; month: Window; lifetime: Window };
  byModel: ModelRow[];
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

function StackedBarChart({ daily }: { daily: DailyRow[] }) {
  if (daily.length === 0) return null;

  const width = 760;
  const height = 240;
  const paddingLeft = 50;
  const paddingRight = 10;
  const paddingTop = 10;
  const paddingBottom = 30;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const maxCost = Math.max(
    ...daily.map((d) => d.claude.cost + d.codex.cost + d.other.cost),
    1,
  );
  const barWidth = chartWidth / daily.length;
  const barGap = Math.max(0, barWidth * 0.1);
  const barW = Math.max(1, barWidth - barGap);

  const tickCount = 5;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const val = (maxCost / tickCount) * i;
    return { val, y: paddingTop + chartHeight - (val / maxCost) * chartHeight };
  });

  const monthLabels = daily
    .map((d, i) => {
      const date = new Date(d.date);
      if (date.getUTCDate() <= 3) {
        return {
          i,
          label: date.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
        };
      }
      return null;
    })
    .filter((x): x is { i: number; label: string } => x !== null);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: "100%", height: "auto" }}
      aria-label="Daily spend stacked bar chart"
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
            ${Math.round(t.val).toLocaleString()}
          </text>
        </g>
      ))}

      {daily.map((d, i) => {
        const totalCost = d.claude.cost + d.codex.cost + d.other.cost;
        const claudeH = (d.claude.cost / maxCost) * chartHeight;
        const codexH = (d.codex.cost / maxCost) * chartHeight;
        const otherH = (d.other.cost / maxCost) * chartHeight;
        const x = paddingLeft + i * barWidth;
        const baseY = paddingTop + chartHeight;
        return (
          <g key={d.date}>
            <title>{`${d.date}: $${totalCost.toFixed(0)} (Claude $${d.claude.cost.toFixed(0)}, Codex $${d.codex.cost.toFixed(0)})`}</title>
            {d.claude.cost > 0 && (
              <rect
                x={x}
                y={baseY - claudeH}
                width={barW}
                height={claudeH}
                fill={CLAUDE_COLOR}
              />
            )}
            {d.codex.cost > 0 && (
              <rect
                x={x}
                y={baseY - claudeH - codexH}
                width={barW}
                height={codexH}
                fill={CODEX_COLOR}
              />
            )}
            {d.other.cost > 0 && (
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
          {fmtUSD(total)}
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fontSize={10}
          fill="#888"
        >
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

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch(DATA_URL + "?t=" + Date.now())
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

  if (err) {
    return <div className="usage-error">Failed to load usage data: {err}</div>;
  }
  if (!data) {
    return <div className="usage-loading">Loading usage data…</div>;
  }

  const { summary, daily, byModel, leaderboards, generatedAt } = data;

  return (
    <div className="usage-dashboard">
      <p className="usage-sub">
        Live token usage across Claude Code and Codex CLI. Auto-refreshes every
        5 minutes. Last updated {fmtRelTime(generatedAt)}.
      </p>
      <p className="usage-disclaimer">
        All dollar figures are computed at public API list prices. Actual
        out-of-pocket is a fraction of these numbers because most usage flows
        through ChatGPT Pro and Claude Max flat subscriptions. Token volume is
        real. Aggregates are generated from local JSONL session files via{" "}
        <a href="https://tokscale.ai" target="_blank" rel="noopener">
          Tokscale
        </a>{" "}
        and committed to{" "}
        <a
          href="https://github.com/MaxGhenis/usage-data"
          target="_blank"
          rel="noopener"
        >
          github.com/MaxGhenis/usage-data
        </a>
        . No message content, file paths, or project names are published.
      </p>

      <section className="donut-row">
        <DonutChart window={summary.week} label="Last 7 days" />
        <DonutChart window={summary.month} label="Last 30 days" />
        <DonutChart window={summary.lifetime} label="Lifetime" />
      </section>

      <section>
        <h2>Daily spend</h2>
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-swatch" style={{ background: CLAUDE_COLOR }} />
            Claude Code
          </div>
          <div className="legend-item">
            <span className="legend-swatch" style={{ background: CODEX_COLOR }} />
            Codex CLI
          </div>
          <div className="legend-item">
            <span className="legend-swatch" style={{ background: OTHER_COLOR }} />
            Other
          </div>
        </div>
        <StackedBarChart daily={daily} />
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
              {byModel
                .filter((m) => m.cost > 0)
                .map((m) => (
                  <tr key={`${m.client}:${m.model}`}>
                    <td style={{ textTransform: "capitalize" }}>{m.client}</td>
                    <td className="mono">{m.model}</td>
                    <td style={{ textAlign: "right" }}>{fmtTokens(m.tokens)}</td>
                    <td style={{ textAlign: "right" }}>{fmtUSD(m.cost)}</td>
                    <td style={{ textAlign: "right" }}>{(m.share * 100).toFixed(1)}%</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Public leaderboards</h2>
        <div className="leaderboard-grid">
          {leaderboards.tokscale && (
            <a
              href={leaderboards.tokscale.url}
              target="_blank"
              rel="noopener"
              className="leaderboard-card"
            >
              <div className="leaderboard-card-header">
                <div className="leaderboard-name">Tokscale</div>
                <div className="leaderboard-users">
                  {leaderboards.tokscale.users} users
                </div>
              </div>
              <div className="leaderboard-ranks">
                {leaderboards.tokscale.rank?.week != null && (
                  <div>
                    <span className="rank-label">This week:</span> #
                    {leaderboards.tokscale.rank.week}
                  </div>
                )}
                {leaderboards.tokscale.rank?.month != null && (
                  <div>
                    <span className="rank-label">This month:</span> #
                    {leaderboards.tokscale.rank.month}
                  </div>
                )}
                {leaderboards.tokscale.rank?.allTime != null && (
                  <div>
                    <span className="rank-label">All-time:</span> #
                    {leaderboards.tokscale.rank.allTime}
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
                <div className="leaderboard-users">
                  {leaderboards.straude.users} users
                </div>
              </div>
              <div className="leaderboard-ranks">
                {leaderboards.straude.rank?.week != null && (
                  <div>
                    <span className="rank-label">This week:</span> #
                    {leaderboards.straude.rank.week}
                  </div>
                )}
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
