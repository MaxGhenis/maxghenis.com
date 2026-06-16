import { useMemo, useState } from "react";
import forecastData from "../data/dc-mayor-forecast-series.json";

type MetricId =
  | "dc_real_gdp"
  | "bike_lane_miles"
  | "traffic_fatalities"
  | "housing_permits";

type Metric = {
  id: MetricId;
  label: string;
  unit: string;
  baseline: string;
  target: string;
  lowerIsBetter?: boolean;
};

type ForecastPoint = {
  metricId: MetricId;
  model: string;
  promptVariant: string;
  mcduffieMargin: number;
  georgeMargin: number;
  candidate: string;
  n: number;
  p05: number;
  p25: number;
  p50: number;
  p75: number;
  p95: number;
};

const METRICS: Metric[] = [
  {
    id: "dc_real_gdp",
    label: "D.C. real GDP",
    unit: "millions of chained 2017 dollars",
    baseline: "143,581.6 in 2025:Q4",
    target: "2030:Q4",
  },
  {
    id: "bike_lane_miles",
    label: "Bike lane route miles",
    unit: "route miles",
    baseline: "108.51 route miles",
    target: "End of 2030",
  },
  {
    id: "traffic_fatalities",
    label: "Traffic fatalities",
    unit: "fatal persons",
    baseline: "22 in 2025",
    target: "Calendar year 2030",
    lowerIsBetter: true,
  },
  {
    id: "housing_permits",
    label: "Housing permits",
    unit: "units authorized",
    baseline: "1,591 in 2025",
    target: "Calendar year 2030",
  },
];

const FORECASTS = forecastData as ForecastPoint[];

const GEORGE = "#0f766e";
const MCDUFFIE = "#b45309";
const AXIS = "#111827";

function formatValue(metric: Metric, value: number): string {
  if (metric.id === "dc_real_gdp") return `${Math.round(value).toLocaleString()}`;
  if (metric.id === "bike_lane_miles") return value.toFixed(0);
  return Math.round(value).toLocaleString();
}

function formatDiff(metric: Metric, value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatValue(metric, value)}`;
}

function scale(
  value: number,
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number,
) {
  return newMin + ((value - oldMin) * (newMax - newMin)) / (oldMax - oldMin);
}

function nearestNiceStep(rawStep: number) {
  const exponent = Math.floor(Math.log10(rawStep));
  const base = Math.pow(10, exponent);
  const normalized = rawStep / base;
  if (normalized <= 1) return base;
  if (normalized <= 2) return 2 * base;
  if (normalized <= 5) return 5 * base;
  return 10 * base;
}

function scenarioLabel(margin: number) {
  if (margin < 0) return `George wins by ${Math.abs(margin)}`;
  return `McDuffie wins by ${margin}`;
}

function bandPath(
  rows: ForecastPoint[],
  x: (value: number) => number,
  y: (value: number) => number,
) {
  if (rows.length < 2) return "";
  const top = rows.map((row) => `${x(row.mcduffieMargin)},${y(row.p75)}`);
  const bottom = rows
    .slice()
    .reverse()
    .map((row) => `${x(row.mcduffieMargin)},${y(row.p25)}`);
  return `M ${top.concat(bottom).join(" L ")} Z`;
}

function linePath(
  rows: ForecastPoint[],
  x: (value: number) => number,
  y: (value: number) => number,
) {
  return rows
    .map((row, index) => `${index === 0 ? "M" : "L"} ${x(row.mcduffieMargin)},${y(row.p50)}`)
    .join(" ");
}

export default function DCMayorForecastExplorer() {
  const [metricId, setMetricId] = useState<MetricId>("housing_permits");
  const [activePoint, setActivePoint] = useState<ForecastPoint | null>(null);
  const [showBand, setShowBand] = useState(true);

  const metric = METRICS.find((item) => item.id === metricId) ?? METRICS[0];
  const rows = useMemo(
    () =>
      FORECASTS.filter((row) => row.metricId === metric.id).sort(
        (a, b) => a.mcduffieMargin - b.mcduffieMargin,
      ),
    [metric.id],
  );

  const georgeRows = rows.filter((row) => row.mcduffieMargin < 0);
  const mcduffieRows = rows.filter((row) => row.mcduffieMargin > 0);
  const georgeClose = rows.find((row) => row.mcduffieMargin === -1);
  const mcduffieClose = rows.find((row) => row.mcduffieMargin === 1);
  const georgeLandslide = rows.find((row) => row.mcduffieMargin === -20);
  const mcduffieLandslide = rows.find((row) => row.mcduffieMargin === 20);
  const rd = georgeClose && mcduffieClose ? georgeClose.p50 - mcduffieClose.p50 : 0;
  const georgeGradient =
    georgeClose && georgeLandslide ? georgeLandslide.p50 - georgeClose.p50 : 0;
  const mcduffieGradient =
    mcduffieClose && mcduffieLandslide
      ? mcduffieLandslide.p50 - mcduffieClose.p50
      : 0;

  const chart = {
    width: 860,
    height: 420,
    left: 74,
    right: 28,
    top: 34,
    bottom: 66,
  };
  const plotWidth = chart.width - chart.left - chart.right;
  const plotHeight = chart.height - chart.top - chart.bottom;
  const values = rows.flatMap((row) => [row.p05, row.p25, row.p50, row.p75, row.p95]);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const step = nearestNiceStep((rawMax - rawMin || rawMax || 1) / 4);
  const yMin = Math.floor((rawMin - step * 0.25) / step) * step;
  const yMax = Math.ceil((rawMax + step * 0.25) / step) * step;
  const ticks = [];
  for (let value = yMin; value <= yMax + step / 10; value += step) {
    ticks.push(value);
  }

  const x = (value: number) =>
    scale(value, -20, 20, chart.left, chart.left + plotWidth);
  const y = (value: number) =>
    scale(value, yMin, yMax, chart.top + plotHeight, chart.top);

  const hover = activePoint ?? georgeClose ?? rows[0];
  const modelSet = Array.from(
    new Set(
      FORECASTS.map(
        (row) => `${row.model.replace("-", " ")} (${row.promptVariant})`,
      ),
    ),
  ).join(", ");
  const minCellN = Math.min(...FORECASTS.map((row) => row.n));
  const closeCellN = Math.min(
    ...FORECASTS.filter((row) => Math.abs(row.mcduffieMargin) === 1).map(
      (row) => row.n,
    ),
  );
  const favors =
    metric.lowerIsBetter
      ? rd < 0
        ? "George"
        : "McDuffie"
      : rd > 0
        ? "George"
        : "McDuffie";

  return (
    <>
      <section className="dc-forecast" aria-label="Interactive D.C. mayor forecast plot">
        <div className="dc-forecast__header">
          <div>
            <p className="dc-forecast__eyebrow">Codex subagent forecast surface</p>
            <h2>McD -20 to McD +20</h2>
            <p>
              Validated JSON responses, plotted as McDuffie's margin over George.
              Negative margins are George wins; positive margins are McDuffie wins.
              Close cells have a denser agent sample than the outer margins.
            </p>
          </div>
          <label className="dc-forecast__toggle">
            <input
              type="checkbox"
              checked={showBand}
              onChange={(event) => setShowBand(event.target.checked)}
            />
            Show p25-p75 band
          </label>
        </div>

        <div className="dc-forecast__metric-tabs" role="tablist" aria-label="Metric">
          {METRICS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === metric.id ? "is-active" : ""}
              onClick={() => {
                setMetricId(item.id);
                setActivePoint(null);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="dc-forecast__chart-shell">
          <svg
            className="dc-forecast__chart"
            viewBox={`0 0 ${chart.width} ${chart.height}`}
            role="img"
            aria-label={`${metric.label} forecasts by McDuffie vote margin`}
          >
            <rect width={chart.width} height={chart.height} fill="#ffffff" />
            <rect
              x={chart.left}
              y={chart.top}
              width={plotWidth / 2}
              height={plotHeight}
              fill="#ecfdf5"
              opacity="0.48"
            />
            <rect
              x={chart.left + plotWidth / 2}
              y={chart.top}
              width={plotWidth / 2}
              height={plotHeight}
              fill="#fff7ed"
              opacity="0.54"
            />

            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={chart.left}
                  x2={chart.left + plotWidth}
                  y1={y(tick)}
                  y2={y(tick)}
                  stroke="#e5e7eb"
                />
                <text
                  x={chart.left - 10}
                  y={y(tick) + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="#374151"
                >
                  {formatValue(metric, tick)}
                </text>
              </g>
            ))}

            {[-20, -10, 0, 10, 20].map((tick) => (
              <g key={tick}>
                <line
                  x1={x(tick)}
                  x2={x(tick)}
                  y1={chart.top}
                  y2={chart.top + plotHeight}
                  stroke={tick === 0 ? "#94a3b8" : "#e5e7eb"}
                  strokeDasharray={tick === 0 ? "5 5" : undefined}
                />
                <text
                  x={x(tick)}
                  y={chart.top + plotHeight + 26}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#374151"
                >
                  {tick > 0 ? `+${tick}` : tick}
                </text>
              </g>
            ))}

            <text x={chart.left + 12} y={chart.top + 18} fontSize="12" fill={GEORGE}>
              George wins
            </text>
            <text
              x={chart.left + plotWidth - 94}
              y={chart.top + 18}
              fontSize="12"
              fill={MCDUFFIE}
            >
              McDuffie wins
            </text>

            {showBand && (
              <>
                <path d={bandPath(georgeRows, x, y)} fill={GEORGE} opacity="0.12" />
                <path d={bandPath(mcduffieRows, x, y)} fill={MCDUFFIE} opacity="0.14" />
              </>
            )}

            <path
              d={linePath(georgeRows, x, y)}
              fill="none"
              stroke={GEORGE}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={linePath(mcduffieRows, x, y)}
              fill="none"
              stroke={MCDUFFIE}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <line
              x1={chart.left}
              x2={chart.left + plotWidth}
              y1={chart.top + plotHeight}
              y2={chart.top + plotHeight}
              stroke={AXIS}
            />
            <line
              x1={chart.left}
              x2={chart.left}
              y1={chart.top}
              y2={chart.top + plotHeight}
              stroke={AXIS}
            />

            <text
              x={chart.left + plotWidth / 2}
              y={chart.height - 16}
              textAnchor="middle"
              fontSize="13"
              fill={AXIS}
            >
              McDuffie margin over George, percentage points
            </text>
            <text
              x="18"
              y={chart.top + plotHeight / 2}
              transform={`rotate(-90 18 ${chart.top + plotHeight / 2})`}
              textAnchor="middle"
              fontSize="13"
              fill={AXIS}
            >
              {metric.unit}
            </text>

            {rows.map((row) => {
              const color = row.mcduffieMargin < 0 ? GEORGE : MCDUFFIE;
              const isActive = hover === row;
              return (
                <g key={`${row.metricId}-${row.mcduffieMargin}`}>
                  <line
                    x1={x(row.mcduffieMargin)}
                    x2={x(row.mcduffieMargin)}
                    y1={y(row.p25)}
                    y2={y(row.p75)}
                    stroke={color}
                    strokeWidth="1.8"
                    opacity="0.55"
                  />
                  <circle
                    cx={x(row.mcduffieMargin)}
                    cy={y(row.p50)}
                    r={isActive ? 6 : 4.4}
                    fill="#ffffff"
                    stroke={color}
                    strokeWidth={isActive ? 3 : 2.2}
                    tabIndex={0}
                    role="button"
                    aria-label={`${scenarioLabel(row.mcduffieMargin)}: median ${formatValue(metric, row.p50)}`}
                    onMouseEnter={() => setActivePoint(row)}
                    onFocus={() => setActivePoint(row)}
                  />
                </g>
              );
            })}
          </svg>

          <aside className="dc-forecast__tooltip" aria-live="polite">
            <span>{scenarioLabel(hover.mcduffieMargin)}</span>
            <strong>{formatValue(metric, hover.p50)}</strong>
            <small>
              p25-p75: {formatValue(metric, hover.p25)} to {formatValue(metric, hover.p75)}
            </small>
            <small>Cell n: {hover.n}</small>
          </aside>
        </div>

        <div className="dc-forecast__summary">
          <div>
            <span>Cell-median discontinuity</span>
            <strong>{formatDiff(metric, rd)}</strong>
            <small>
              George by 1 forecast minus McDuffie by 1 forecast. Lower is better only
              for fatalities. Favors {favors} in the cell medians.
            </small>
          </div>
          <div>
            <span>George mandate gradient</span>
            <strong>{formatDiff(metric, georgeGradient)}</strong>
            <small>McD -20 minus McD -1.</small>
          </div>
          <div>
            <span>McDuffie mandate gradient</span>
            <strong>{formatDiff(metric, mcduffieGradient)}</strong>
            <small>McD +20 minus McD +1.</small>
          </div>
        </div>

        <div className="dc-forecast__meta">
          <span>Baseline: {metric.baseline}</span>
          <span>Target: {metric.target}</span>
          <span>
            Model set: {modelSet}; close n={closeCellN}; outer n={minCellN}
          </span>
        </div>
      </section>
      <style>{`
        .dc-forecast {
          width: min(980px, calc(100vw - 32px));
          margin: 2rem 0 2.5rem 50%;
          transform: translateX(-50%);
          border: 1px solid #dbe3ea;
          border-radius: 8px;
          background: #ffffff;
          color: #111827;
          box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
          overflow: hidden;
        }

        .dc-forecast__header {
          display: flex;
          justify-content: space-between;
          gap: 1.5rem;
          align-items: flex-start;
          padding: 1.25rem 1.25rem 0.75rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .dc-forecast__eyebrow {
          margin: 0 0 0.35rem;
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0;
        }

        .dc-forecast h2 {
          margin: 0;
          font-size: 1.35rem;
          line-height: 1.2;
          letter-spacing: 0;
        }

        .dc-forecast__header p:not(.dc-forecast__eyebrow) {
          margin: 0.45rem 0 0;
          max-width: 650px;
          color: #475569;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        .dc-forecast__toggle {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          white-space: nowrap;
          color: #334155;
          font-size: 0.9rem;
          padding-top: 0.2rem;
        }

        .dc-forecast__metric-tabs {
          display: flex;
          gap: 0.45rem;
          flex-wrap: wrap;
          padding: 0.85rem 1.25rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f8fafc;
        }

        .dc-forecast__metric-tabs button {
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          border-radius: 8px;
          padding: 0.45rem 0.7rem;
          font: inherit;
          font-size: 0.88rem;
          cursor: pointer;
        }

        .dc-forecast__metric-tabs button:hover {
          border-color: #94a3b8;
        }

        .dc-forecast__metric-tabs button.is-active {
          border-color: #111827;
          background: #111827;
          color: #ffffff;
        }

        .dc-forecast__chart-shell {
          position: relative;
          padding: 0.65rem 1rem 0.25rem;
        }

        .dc-forecast__chart {
          width: 100%;
          height: auto;
          display: block;
        }

        .dc-forecast__tooltip {
          position: absolute;
          top: 1rem;
          right: 1rem;
          display: grid;
          gap: 0.15rem;
          min-width: 150px;
          padding: 0.7rem 0.85rem;
          border: 1px solid #dbe3ea;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.94);
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.1);
        }

        .dc-forecast__tooltip span,
        .dc-forecast__summary span,
        .dc-forecast__meta {
          color: #64748b;
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0;
        }

        .dc-forecast__tooltip strong {
          font-size: 1.4rem;
          line-height: 1.1;
        }

        .dc-forecast__tooltip small,
        .dc-forecast__summary small {
          color: #475569;
          line-height: 1.35;
        }

        .dc-forecast__summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1px;
          background: #e5e7eb;
          border-top: 1px solid #e5e7eb;
        }

        .dc-forecast__summary div {
          display: grid;
          gap: 0.25rem;
          background: #ffffff;
          padding: 1rem 1.1rem;
        }

        .dc-forecast__summary strong {
          font-size: 1.35rem;
          line-height: 1.1;
        }

        .dc-forecast__meta {
          display: flex;
          gap: 0.9rem;
          flex-wrap: wrap;
          padding: 0.85rem 1.25rem;
          background: #f8fafc;
          border-top: 1px solid #e5e7eb;
          text-transform: none;
          font-weight: 600;
        }

        @media (max-width: 720px) {
          .dc-forecast {
            width: min(100%, calc(100vw - 24px));
            margin-top: 1.5rem;
          }

          .dc-forecast__header {
            display: grid;
            gap: 0.9rem;
          }

          .dc-forecast__toggle {
            white-space: normal;
          }

          .dc-forecast__chart-shell {
            overflow-x: auto;
            padding: 0.5rem 0.25rem 0.25rem;
          }

          .dc-forecast__chart {
            min-width: 760px;
          }

          .dc-forecast__tooltip {
            position: static;
            margin: 0 0.75rem 0.75rem;
          }

          .dc-forecast__summary {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
