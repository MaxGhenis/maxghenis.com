import { useMemo, useState } from 'react';
import {
  ADVISORY_LABELS,
  COUNTRIES,
  FIT,
  FITTED,
  GLOBAL_TREND,
  TRAVELER_DEATH_CAUSES,
  type Country,
  fmtRate,
  fmtSigned,
  homicideChange,
  lawOrderChange,
} from '../lib/safety';

type View = 'gap' | 'trends' | 'travel';

const VIEWS: { id: View; label: string; blurb: string }[] = [
  {
    id: 'gap',
    label: 'The gap',
    blurb:
      'Every country with both measurements, plotted against each other. The dashed line is the fitted relationship; distance from it is the gap between what people feel and what the record holds.',
  },
  {
    id: 'trends',
    label: 'Trends',
    blurb:
      'Recorded homicide rates over time. Add countries to compare trajectories — progress is not one direction everywhere.',
  },
  {
    id: 'travel',
    label: 'For travelers',
    blurb:
      'What a visitor actually faces: current U.S. State Department advisory levels, and what non-natural deaths of Americans abroad are actually caused by.',
  },
];

const DEFAULT_TREND = ['Egypt', 'United States', 'Ecuador', 'El Salvador'];

const logX = (rate: number) => Math.log10(rate + 0.1);

const VIEW_IDS = VIEWS.map((v) => v.id);

/** Views are addressable: /safety#trends deep-links straight to one. */
function initialView(): View {
  if (typeof window === 'undefined') return 'gap';
  const h = window.location.hash.replace('#', '');
  return (VIEW_IDS as string[]).includes(h) ? (h as View) : 'gap';
}

export default function SafetyExplorer() {
  const [view, setViewState] = useState<View>(initialView);

  const setView = (v: View) => {
    setViewState(v);
    if (typeof window !== 'undefined') {
      history.replaceState(null, '', v === 'gap' ? window.location.pathname : `#${v}`);
    }
  };
  const [selected, setSelected] = useState<string>('Egypt');
  const [hovered, setHovered] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [trendSet, setTrendSet] = useState<string[]>(DEFAULT_TREND);

  const active = useMemo(
    () => COUNTRIES.find((c) => c.country === (hovered ?? selected)) ?? null,
    [hovered, selected],
  );

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return COUNTRIES.filter((c) => c.country.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  return (
    <div className="sx">
      <div className="sx-bar">
        <div className="sx-tabs" role="tablist" aria-label="Views">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={view === v.id}
              className={`sx-tab${view === v.id ? ' is-on' : ''}`}
              onClick={() => setView(v.id)}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className="sx-search">
          <input
            type="search"
            value={query}
            placeholder="Find a country…"
            aria-label="Find a country"
            onChange={(e) => setQuery(e.target.value)}
          />
          {matches.length > 0 && (
            <ul className="sx-matches">
              {matches.map((m) => (
                <li key={m.country}>
                  <button
                    onClick={() => {
                      setSelected(m.country);
                      setQuery('');
                      if (view === 'trends' && !trendSet.includes(m.country)) {
                        setTrendSet((s) => [...s, m.country].slice(-6));
                      }
                    }}
                  >
                    <span>{m.country}</span>
                    <span className="sx-match-val">{m.feltSafe}%</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <p className="sx-blurb">{VIEWS.find((v) => v.id === view)!.blurb}</p>

      {view === 'gap' && (
        <GapView
          selected={selected}
          hovered={hovered}
          onSelect={setSelected}
          onHover={setHovered}
        />
      )}
      {view === 'trends' && (
        <TrendsView set={trendSet} onSet={setTrendSet} onSelect={setSelected} />
      )}
      {view === 'travel' && <TravelView selected={selected} onSelect={setSelected} />}

      {active && <CountryCard c={active} pinned={active.country === selected} />}

      <style>{`
        .sx {
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          background: var(--card);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
          margin: 2rem 0;
        }
        .sx-bar {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--line);
          background: var(--paper);
        }
        .sx-tabs { display: flex; gap: 0.25rem; flex-wrap: wrap; }
        .sx-tab {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.45rem 0.8rem;
          border: 1px solid transparent;
          border-radius: var(--radius-full);
          background: transparent;
          color: var(--ink-muted);
          cursor: pointer;
          transition: all var(--duration-fast) var(--ease-out);
        }
        .sx-tab:hover { color: var(--ink); background: var(--paper-deep); }
        .sx-tab.is-on {
          color: var(--rule-deep);
          border-color: var(--line);
          background: var(--card);
        }
        .sx-search { position: relative; }
        .sx-search input {
          font-family: var(--font-body);
          font-size: 0.85rem;
          padding: 0.45rem 0.75rem;
          border: 1px solid var(--line);
          border-radius: var(--radius-full);
          background: var(--card);
          color: var(--ink);
          min-width: 190px;
        }
        .sx-search input:focus-visible { outline: 2px solid var(--sky); outline-offset: 1px; }
        .sx-matches {
          position: absolute;
          z-index: 20;
          top: calc(100% + 4px);
          right: 0;
          left: 0;
          margin: 0;
          padding: 0.25rem;
          list-style: none;
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
        }
        .sx-matches button {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          width: 100%;
          padding: 0.4rem 0.55rem;
          border: 0;
          border-radius: var(--radius-sm);
          background: transparent;
          font-size: 0.85rem;
          color: var(--ink);
          cursor: pointer;
          text-align: left;
        }
        .sx-matches button:hover { background: var(--paper-deep); }
        .sx-match-val { font-family: var(--font-mono); color: var(--ink-muted); }
        .sx-blurb {
          margin: 0;
          padding: 0.85rem 1rem;
          font-size: 0.9rem;
          line-height: 1.55;
          color: var(--ink-soft);
          border-bottom: 1px solid var(--line);
          background: var(--card);
        }
        .sx-plot { padding: 1rem; }
        .sx-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
          padding: 0 1rem 1rem;
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.04em;
          color: var(--ink-muted);
        }
        .sx-legend span { display: inline-flex; align-items: center; gap: 0.4rem; }
        .sx-key { width: 10px; height: 10px; border-radius: 50%; }
        .sx-card {
          border-top: 1px solid var(--line);
          background: var(--paper);
          padding: 1rem;
        }
        .sx-card-head {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 0.6rem;
          margin-bottom: 0.85rem;
        }
        .sx-card-head h3 { margin: 0; font-size: 1.35rem; }
        .sx-pin {
          font-family: var(--font-mono);
          font-size: 0.62rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink-muted);
        }
        .sx-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 0.75rem;
        }
        .sx-metric {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
          padding: 0.7rem 0.8rem;
        }
        .sx-metric dt {
          font-family: var(--font-mono);
          font-size: 0.62rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink-muted);
          margin-bottom: 0.35rem;
        }
        .sx-metric dd {
          margin: 0;
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 600;
          line-height: 1.1;
          color: var(--ink);
        }
        .sx-metric small {
          display: block;
          margin-top: 0.25rem;
          font-family: var(--font-body);
          font-size: 0.72rem;
          font-weight: 400;
          color: var(--ink-muted);
          line-height: 1.35;
        }
        .sx-none { color: var(--ink-muted); font-size: 1rem; font-family: var(--font-body); }
        .sx-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; padding: 0 1rem 1rem; }
        .sx-chip {
          font-family: var(--font-mono);
          font-size: 0.68rem;
          padding: 0.3rem 0.6rem;
          border: 1px solid var(--line);
          border-radius: var(--radius-full);
          background: var(--card);
          color: var(--ink-soft);
          cursor: pointer;
        }
        .sx-chip:hover { border-color: var(--rule); color: var(--rule-deep); }
        .sx-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; margin: 0; }
        .sx-table th, .sx-table td {
          padding: 0.5rem 0.7rem;
          border-bottom: 1px solid var(--line);
          text-align: left;
        }
        .sx-table th {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink-muted);
          background: transparent;
        }
        .sx-table td.num { font-family: var(--font-mono); text-align: right; }
        .sx-bars { padding: 0 1rem 1rem; }
        .sx-barrow {
          display: grid;
          grid-template-columns: minmax(120px, 1.1fr) 3fr auto;
          gap: 0.75rem;
          align-items: center;
          padding: 0.3rem 0;
          font-size: 0.85rem;
        }
        .sx-bartrack {
          display: block;
          height: 9px;
          background: var(--paper-deep);
          border-radius: var(--radius-full);
          overflow: hidden;
        }
        .sx-barfill { display: block; height: 100%; border-radius: var(--radius-full); }
        .sx-barval { font-family: var(--font-mono); font-size: 0.8rem; color: var(--ink-soft); }
        .sx-scroll { overflow-x: auto; padding: 0 1rem 1rem; }
        .sx-tablewrap {
          max-height: 440px;
          overflow-y: auto;
          border: 1px solid var(--line);
          border-radius: var(--radius-md);
        }
        .sx-tablewrap thead th {
          position: sticky;
          top: 0;
          z-index: 1;
          background: var(--paper);
        }
        .sx-count {
          padding: 0.55rem 1rem 0;
          font-family: var(--font-mono);
          font-size: 0.68rem;
          letter-spacing: 0.04em;
          color: var(--ink-muted);
        }
        @media (max-width: 640px) {
          .sx-bar { flex-direction: column; align-items: stretch; }
          .sx-search input { width: 100%; }
          .sx-barrow { grid-template-columns: minmax(90px, 1fr) 2fr auto; font-size: 0.78rem; }
        }
      `}</style>
    </div>
  );
}

/* ── The gap ─────────────────────────────────────────────────────────────── */

function GapView(props: {
  selected: string;
  hovered: string | null;
  onSelect: (c: string) => void;
  onHover: (c: string | null) => void;
}) {
  const W = 760;
  const H = 460;
  const M = { top: 18, right: 18, bottom: 46, left: 52 };

  const xs = FITTED.map((c) => logX(c.homicide!));
  const xMin = Math.min(...xs) - 0.12;
  const xMax = Math.max(...xs) + 0.12;
  const yMin = 20;
  const yMax = 100;

  const px = (v: number) =>
    M.left + ((v - xMin) / (xMax - xMin)) * (W - M.left - M.right);
  const py = (v: number) =>
    H - M.bottom - ((v - yMin) / (yMax - yMin)) * (H - M.top - M.bottom);

  const xTicks = [0.2, 0.5, 1, 2, 5, 10, 20, 50].filter(
    (t) => logX(t) >= xMin && logX(t) <= xMax,
  );
  const yTicks = [20, 40, 60, 80, 100];

  const lineA = { x: xMin, y: FIT.intercept + FIT.slope * xMin };
  const lineB = { x: xMax, y: FIT.intercept + FIT.slope * xMax };

  const focus = props.hovered ?? props.selected;

  // Label the largest residual in each direction, plus whatever is focused.
  const sorted = [...FITTED].sort((a, b) => b.residual! - a.residual!);
  const labelled = new Set(
    [...sorted.slice(0, 4), ...sorted.slice(-4)].map((c) => c.country),
  );
  labelled.add(focus);

  return (
    <>
      <div className="sx-plot">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          role="img"
          aria-label={`Scatter of felt safety against recorded homicide rate for ${FIT.n} countries. Correlation r equals ${FIT.r}.`}
        >
          {yTicks.map((t) => (
            <g key={t}>
              <line
                x1={M.left}
                x2={W - M.right}
                y1={py(t)}
                y2={py(t)}
                stroke="var(--line)"
                strokeWidth="1"
              />
              <text
                x={M.left - 9}
                y={py(t) + 4}
                textAnchor="end"
                fontSize="11"
                fontFamily="var(--font-mono)"
                fill="var(--ink-muted)"
              >
                {t}%
              </text>
            </g>
          ))}

          {xTicks.map((t) => (
            <text
              key={t}
              x={px(logX(t))}
              y={H - M.bottom + 18}
              textAnchor="middle"
              fontSize="11"
              fontFamily="var(--font-mono)"
              fill="var(--ink-muted)"
            >
              {t}
            </text>
          ))}

          <text
            x={M.left + (W - M.left - M.right) / 2}
            y={H - 6}
            textAnchor="middle"
            fontSize="11.5"
            fontFamily="var(--font-mono)"
            fill="var(--ink-muted)"
          >
            recorded homicides per 100,000 (log scale)
          </text>
          <text
            transform={`rotate(-90 14 ${M.top + (H - M.top - M.bottom) / 2})`}
            x={14}
            y={M.top + (H - M.top - M.bottom) / 2}
            textAnchor="middle"
            fontSize="11.5"
            fontFamily="var(--font-mono)"
            fill="var(--ink-muted)"
          >
            felt safe walking alone at night
          </text>

          <line
            x1={px(lineA.x)}
            y1={py(lineA.y)}
            x2={px(lineB.x)}
            y2={py(lineB.y)}
            stroke="var(--ink-muted)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
          />

          {FITTED.map((c) => {
            const isFocus = c.country === focus;
            const above = c.residual! >= 0;
            const cx = px(logX(c.homicide!));
            const cy = py(c.feltSafe);
            return (
              <g key={c.country}>
                {isFocus && (
                  <line
                    x1={cx}
                    y1={cy}
                    x2={cx}
                    y2={py(c.predicted!)}
                    stroke={above ? 'var(--cast)' : 'var(--sky)'}
                    strokeWidth="1.5"
                  />
                )}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isFocus ? 7 : 4}
                  fill={above ? 'var(--cast)' : 'var(--sky)'}
                  fillOpacity={isFocus ? 1 : 0.5}
                  stroke={isFocus ? 'var(--ink)' : 'none'}
                  strokeWidth="1.5"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => props.onHover(c.country)}
                  onMouseLeave={() => props.onHover(null)}
                  onClick={() => props.onSelect(c.country)}
                >
                  <title>{`${c.country}: felt ${c.feltSafe}%, predicted ${c.predicted}%, ${fmtRate(c.homicide!)} per 100k (${c.homicideYear})`}</title>
                </circle>
                {labelled.has(c.country) && (
                  <text
                    x={cx + (isFocus ? 11 : 7)}
                    y={cy + 3.5}
                    fontSize={isFocus ? 12.5 : 10.5}
                    fontFamily="var(--font-body)"
                    fontWeight={isFocus ? 600 : 400}
                    fill={isFocus ? 'var(--ink)' : 'var(--ink-muted)'}
                    style={{ pointerEvents: 'none' }}
                  >
                    {c.country}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="sx-legend">
        <span>
          <i className="sx-key" style={{ background: 'var(--cast)' }} />
          feels safer than the record predicts
        </span>
        <span>
          <i className="sx-key" style={{ background: 'var(--sky)' }} />
          feels less safe than the record predicts
        </span>
        <span>
          r = {FIT.r.toFixed(2)} · R² = {FIT.r2.toFixed(2)} · n = {FIT.n}
        </span>
      </div>
    </>
  );
}

/* ── Trends ──────────────────────────────────────────────────────────────── */

const TREND_COLORS = [
  'var(--rule)',
  'var(--cast)',
  'var(--sky)',
  'var(--ink)',
  'var(--mist)',
  'var(--rule-deep)',
];

function TrendsView(props: {
  set: string[];
  onSet: (s: string[]) => void;
  onSelect: (c: string) => void;
}) {
  // Rates here span three orders of magnitude (El Salvador peaked near 140,
  // Singapore sits under 0.5). Log is the honest default; linear is a click away.
  const [logScale, setLogScale] = useState(true);

  const W = 760;
  const H = 380;
  const M = { top: 18, right: 108, bottom: 42, left: 52 };

  const rows = props.set
    .map((n) => COUNTRIES.find((c) => c.country === n))
    .filter((c): c is Country => !!c && c.homicideSeries.length > 1);

  const all = rows.flatMap((c) => c.homicideSeries);
  const yearMin = all.length ? Math.min(...all.map((p) => p.year)) : 1995;
  const yearMax = all.length ? Math.max(...all.map((p) => p.year)) : 2024;
  const rateMax = all.length ? Math.max(...all.map((p) => p.rate)) : 10;
  const rateMin = all.length ? Math.min(...all.map((p) => p.rate)) : 0.5;

  const LO = Math.max(0.1, rateMin * 0.7);
  const HI = rateMax * 1.15;

  const px = (y: number) =>
    M.left + ((y - yearMin) / Math.max(1, yearMax - yearMin)) * (W - M.left - M.right);
  const py = (r: number) => {
    const inner = H - M.top - M.bottom;
    if (logScale) {
      const t = (Math.log10(Math.max(r, LO)) - Math.log10(LO)) /
        (Math.log10(HI) - Math.log10(LO));
      return H - M.bottom - t * inner;
    }
    return H - M.bottom - (r / HI) * inner;
  };

  const yTicks: number[] = [];
  if (logScale) {
    for (const t of [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100]) {
      if (t >= LO && t <= HI) yTicks.push(t);
    }
  } else {
    const step = HI > 100 ? 25 : HI > 40 ? 10 : HI > 20 ? 5 : HI > 8 ? 2 : 1;
    for (let v = 0; v <= HI; v += step) yTicks.push(v);
  }

  const xTicks: number[] = [];
  for (let y = Math.ceil(yearMin / 5) * 5; y <= yearMax; y += 5) xTicks.push(y);

  // Nudge end-labels apart so overlapping series stay readable.
  const ends = rows
    .map((c, i) => ({ i, c, last: c.homicideSeries[c.homicideSeries.length - 1] }))
    .sort((a, b) => py(a.last.rate) - py(b.last.rate));
  const labelY = new Map<string, number>();
  let prev = -Infinity;
  for (const e of ends) {
    const want = Math.max(py(e.last.rate), prev + 13);
    labelY.set(e.c.country, want);
    prev = want;
  }

  const pool = [...COUNTRIES]
    .filter((c) => c.homicideSeries.length > 1 && !props.set.includes(c.country))
    .sort((a, b) => (b.homicide ?? 0) - (a.homicide ?? 0))
    .slice(0, 10);

  return (
    <>
      <div className="sx-plot">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          role="img"
          aria-label={`Recorded homicide rates over time for ${rows.map((r) => r.country).join(', ')}.`}
        >
          {yTicks.map((t) => (
            <g key={t}>
              <line
                x1={M.left}
                x2={W - M.right}
                y1={py(t)}
                y2={py(t)}
                stroke="var(--line)"
              />
              <text
                x={M.left - 9}
                y={py(t) + 4}
                textAnchor="end"
                fontSize="11"
                fontFamily="var(--font-mono)"
                fill="var(--ink-muted)"
              >
                {t}
              </text>
            </g>
          ))}
          {xTicks.map((t) => (
            <text
              key={t}
              x={px(t)}
              y={H - M.bottom + 18}
              textAnchor="middle"
              fontSize="11"
              fontFamily="var(--font-mono)"
              fill="var(--ink-muted)"
            >
              {t}
            </text>
          ))}
          <text
            transform={`rotate(-90 13 ${M.top + (H - M.top - M.bottom) / 2})`}
            x={13}
            y={M.top + (H - M.top - M.bottom) / 2}
            textAnchor="middle"
            fontSize="11.5"
            fontFamily="var(--font-mono)"
            fill="var(--ink-muted)"
          >
            homicides per 100,000{logScale ? ' (log scale)' : ''}
          </text>

          {rows.map((c, i) => {
            const pts = c.homicideSeries;
            const d = pts
              .map((p, j) => `${j === 0 ? 'M' : 'L'}${px(p.year)},${py(p.rate)}`)
              .join(' ');
            const last = pts[pts.length - 1];
            return (
              <g key={c.country}>
                <path
                  d={d}
                  fill="none"
                  stroke={TREND_COLORS[i % TREND_COLORS.length]}
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <circle
                  cx={px(last.year)}
                  cy={py(last.rate)}
                  r="3.5"
                  fill={TREND_COLORS[i % TREND_COLORS.length]}
                />
                <text
                  x={px(last.year) + 8}
                  y={(labelY.get(c.country) ?? py(last.rate)) + 4}
                  fontSize="11.5"
                  fontFamily="var(--font-body)"
                  fill={TREND_COLORS[i % TREND_COLORS.length]}
                >
                  {c.country}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="sx-chips">
        <button
          className="sx-chip"
          onClick={() => setLogScale(!logScale)}
          style={{ borderColor: 'var(--rule)', color: 'var(--rule-deep)' }}
          aria-pressed={logScale}
        >
          {logScale ? 'log scale' : 'linear scale'}
        </button>
        {rows.map((c) => (
          <button
            key={c.country}
            className="sx-chip"
            onClick={() => props.onSet(props.set.filter((n) => n !== c.country))}
            aria-label={`Remove ${c.country}`}
          >
            {c.country} ×
          </button>
        ))}
        {pool.slice(0, 6).map((c) => (
          <button
            key={c.country}
            className="sx-chip"
            onClick={() => props.onSet([...props.set, c.country].slice(-6))}
          >
            + {c.country}
          </button>
        ))}
      </div>

      <div className="sx-bars">
        <p className="sx-blurb" style={{ border: 0, padding: '0 0 0.6rem' }}>
          Global share feeling safe walking alone at night, the years Gallup
          states numerically. The full annual series is published only as a
          chart image, so the gaps stay gaps.
        </p>
        {GLOBAL_TREND.map((p) => (
          <div className="sx-barrow" key={p.year}>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{p.year}</span>
            <span className="sx-bartrack">
              <span
                className="sx-barfill"
                style={{ width: `${p.pct}%`, background: 'var(--seam)' }}
              />
            </span>
            <span className="sx-barval">{p.pct}%</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── For travelers ───────────────────────────────────────────────────────── */

function TravelView(props: { selected: string; onSelect: (c: string) => void }) {
  const [level, setLevel] = useState<number | null>(null);

  const withAdvisory = COUNTRIES.filter((c) => c.advisory);
  // Count what filtering actually yields here, not the whole feed — the feed
  // covers territories Gallup never polls.
  const counts = withAdvisory.reduce<Record<number, number>>((acc, c) => {
    acc[c.advisory!.level] = (acc[c.advisory!.level] ?? 0) + 1;
    return acc;
  }, {});
  const shown = level
    ? withAdvisory.filter((c) => c.advisory!.level === level)
    : withAdvisory;
  const sorted = [...shown].sort(
    (a, b) => a.advisory!.level - b.advisory!.level || b.feltSafe - a.feltSafe,
  );

  const levelColor = (l: number) =>
    l === 1
      ? 'var(--mist)'
      : l === 2
        ? 'var(--rule)'
        : l === 3
          ? 'var(--cast)'
          : 'var(--cast-deep)';

  return (
    <>
      <div className="sx-bars">
        <p className="sx-blurb" style={{ border: 0, padding: '0 0 0.6rem' }}>
          Non-natural deaths of U.S. citizens abroad, 2002–2022 (n = 15,549).
          Terrorism sits inside the last row.
        </p>
        {TRAVELER_DEATH_CAUSES.map((c, i) => (
          <div className="sx-barrow" key={c.cause}>
            <span>{c.cause}</span>
            <span className="sx-bartrack">
              <span
                className="sx-barfill"
                style={{
                  width: `${(c.pct / 29) * 100}%`,
                  background: i === 0 ? 'var(--rule)' : 'var(--rule-glow)',
                  border: i === 0 ? 'none' : '1px solid var(--rule)',
                }}
              />
            </span>
            <span className="sx-barval">{c.pct}%</span>
          </div>
        ))}
      </div>

      <div className="sx-chips">
        <button
          className="sx-chip"
          onClick={() => setLevel(null)}
          style={level === null ? { borderColor: 'var(--rule)' } : undefined}
        >
          all levels
        </button>
        {[1, 2, 3, 4].map((l) => (
          <button
            key={l}
            className="sx-chip"
            onClick={() => setLevel(level === l ? null : l)}
            style={level === l ? { borderColor: 'var(--rule)' } : undefined}
          >
            <span
              className="sx-key"
              style={{
                background: levelColor(l),
                display: 'inline-block',
                marginRight: '0.4rem',
              }}
            />
            level {l} · {counts[l] ?? 0}
          </button>
        ))}
      </div>

      <p className="sx-count">
        {sorted.length} of {COUNTRIES.length} countries have a current advisory in
        the feed · click a row to inspect it
      </p>

      <div className="sx-scroll">
        <div className="sx-tablewrap">
        <table className="sx-table">
          <thead>
            <tr>
              <th>Country</th>
              <th>U.S. advisory</th>
              <th style={{ textAlign: 'right' }}>Felt safe</th>
              <th style={{ textAlign: 'right' }}>Homicide</th>
              <th>Issued</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => (
              <tr
                key={c.country}
                onClick={() => props.onSelect(c.country)}
                style={{
                  cursor: 'pointer',
                  background:
                    c.country === props.selected ? 'var(--rule-glow)' : undefined,
                }}
              >
                <td>{c.country}</td>
                <td>
                  <span
                    className="sx-key"
                    style={{
                      background: levelColor(c.advisory!.level),
                      display: 'inline-block',
                      marginRight: '0.45rem',
                    }}
                  />
                  {c.advisory!.level} · {ADVISORY_LABELS[c.advisory!.level]}
                </td>
                <td className="num">{c.feltSafe}%</td>
                <td className="num">
                  {c.homicide === null ? '—' : fmtRate(c.homicide)}
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                  {c.advisory!.issued ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </>
  );
}

/* ── Country card ────────────────────────────────────────────────────────── */

function CountryCard({ c, pinned }: { c: Country; pinned: boolean }) {
  const loChange = lawOrderChange(c);
  const trend = homicideChange(c, 2010);

  return (
    <div className="sx-card">
      <div className="sx-card-head">
        <h3>{c.country}</h3>
        <span className="sx-pin">{pinned ? 'selected' : 'hovering'}</span>
      </div>

      <dl className="sx-metrics">
        <div className="sx-metric">
          <dt>Felt safe at night</dt>
          <dd>{c.feltSafe}%</dd>
          <small>Gallup 2024 · SDG 16.1.4</small>
        </div>

        <div className="sx-metric">
          <dt>Law and order index</dt>
          <dd>
            {c.lawOrder ?? <span className="sx-none">—</span>}
            {loChange !== null && (
              <span
                style={{
                  fontSize: '0.8rem',
                  marginLeft: '0.4rem',
                  color: loChange >= 0 ? 'var(--rule-deep)' : 'var(--cast-deep)',
                }}
              >
                {fmtSigned(loChange)}
              </span>
            )}
          </dd>
          <small>
            {loChange === null
              ? 'Half perception, half reported victimization'
              : 'Change vs 2023 field year'}
          </small>
        </div>

        <div className="sx-metric">
          <dt>Recorded homicide</dt>
          <dd>
            {c.homicide === null ? (
              <span className="sx-none">no data</span>
            ) : (
              fmtRate(c.homicide)
            )}
          </dd>
          <small>
            {c.homicide === null
              ? 'UNODC has no reading since 2015'
              : `per 100,000 · UNODC ${c.homicideYear}`}
          </small>
        </div>

        <div className="sx-metric">
          <dt>Gap vs prediction</dt>
          <dd>
            {c.residual === null ? (
              <span className="sx-none">—</span>
            ) : (
              <span
                style={{
                  color: c.residual >= 0 ? 'var(--cast-deep)' : 'var(--sky)',
                }}
              >
                {fmtSigned(c.residual)}
              </span>
            )}
          </dd>
          <small>
            {c.residual === null
              ? 'Needs both measurements'
              : `Fit predicts ${c.predicted}% from this rate`}
          </small>
        </div>

        <div className="sx-metric">
          <dt>U.S. advisory</dt>
          <dd>
            {c.advisory ? (
              `Level ${c.advisory.level}`
            ) : (
              <span className="sx-none">none</span>
            )}
          </dd>
          <small>
            {c.advisory
              ? `${ADVISORY_LABELS[c.advisory.level]} · issued ${c.advisory.issued ?? 'n/a'}${
                  c.advisory.covers ? ` · filed under "${c.advisory.covers}"` : ''
                }`
              : 'No current State Department advisory in the feed'}
          </small>
        </div>

        <div className="sx-metric">
          <dt>Homicide since 2010</dt>
          <dd>
            {trend === null ? (
              <span className="sx-none">—</span>
            ) : (
              `${trend.ratio.toFixed(2)}×`
            )}
          </dd>
          <small>
            {trend === null
              ? 'Fewer than two readings'
              : `${fmtRate(trend.first.rate)} (${trend.first.year}) → ${fmtRate(trend.last.rate)} (${trend.last.year})`}
          </small>
        </div>
      </dl>
    </div>
  );
}
