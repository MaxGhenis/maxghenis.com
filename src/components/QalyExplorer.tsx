import { useEffect, useMemo, useRef, useState } from "react";
import {
  ARCHETYPE_KEYS,
  ARCHETYPES,
  PARAMS,
  computeAll,
  fmtDollars,
  fmtQalys,
  TIER_LABELS,
  type ComputeOutput,
  type Driver,
  type Overrides,
  type Summary,
} from "../lib/mackenzie-qaly";

// Design tokens (mirrors src/styles/global.css :root).
const C = {
  ink: "#0f172a",
  inkSoft: "#334155",
  inkMuted: "#64748b",
  cream: "#fefdf8",
  creamDark: "#faf9f4",
  amber: "#f59e0b",
  amberDark: "#d97706",
  amberGlow: "rgba(245, 158, 11, 0.15)",
  border: "rgba(15, 23, 42, 0.1)",
  borderSoft: "rgba(15, 23, 42, 0.06)",
};

const DEFAULT_SHARES = ARCHETYPES.map((a) => a.allocation_share);
const SERIF = "'Playfair Display', Georgia, serif";
const MONO = "'JetBrains Mono', monospace";

type Precision = { label: string; n: number };
const PRECISIONS: Precision[] = [
  { label: "Fast", n: 4000 },
  { label: "Standard", n: 10000 },
  { label: "High", n: 30000 },
];

// Defaults come from the exported parameter file, never hardcoded — a future
// params sync changes the UI defaults automatically.
const DEFAULT_GIVING_B = Math.round(PARAMS.meta.total_giving_usd / 1e8) / 10;
const DEFAULT_REALIZATION = PARAMS.realization_factor.mode;
const DEFAULT_DISCOUNT = PARAMS.meta.discount_rate;

export default function QalyExplorer() {
  const [credulity, setCredulity] = useState(0);
  const [realization, setRealization] = useState(DEFAULT_REALIZATION);
  const [givingB, setGivingB] = useState(DEFAULT_GIVING_B);
  const [discount, setDiscount] = useState(DEFAULT_DISCOUNT);
  const [shares, setShares] = useState<number[]>(DEFAULT_SHARES);
  const [precision, setPrecision] = useState(1);
  const [computed, setComputed] = useState<ComputeOutput | null>(null);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const overrides = useMemo<Overrides>(
    () => ({
      credulity,
      realizationMode: realization,
      totalGiving: givingB * 1e9,
      discountRate: discount,
      shares,
      n: PRECISIONS[precision].n,
      seed: 0,
    }),
    [credulity, realization, givingB, discount, shares, precision],
  );

  // Recompute on any change. Debounced so it fires after you pause dragging —
  // the slider thumb itself never waits on the Monte Carlo.
  useEffect(() => {
    setBusy(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setComputed(computeAll(overrides));
      setBusy(false);
    }, 90);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [overrides]);

  function reset() {
    setCredulity(0);
    setRealization(DEFAULT_REALIZATION);
    setGivingB(DEFAULT_GIVING_B);
    setDiscount(DEFAULT_DISCOUNT);
    setShares(DEFAULT_SHARES);
  }

  const s = computed?.summary;
  // Mirror the model's zero-sum fallback so the displayed percentages always
  // match what is actually simulated (all-zero sliders -> file defaults).
  const normShares = useMemo(() => {
    const effective = shares.some((v) => v > 0) ? shares : DEFAULT_SHARES;
    const sum = effective.reduce((a, b) => a + Math.max(b, 0), 0);
    return effective.map((v) => Math.max(v, 0) / sum);
  }, [shares]);

  return (
    <div style={{ fontFamily: "'Source Sans 3', sans-serif", color: C.ink }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 320px) minmax(0, 1fr)",
          gap: "1.5rem",
          alignItems: "start",
        }}
        className="qaly-grid"
      >
        {/* ---- Controls ---- */}
        <div
          style={{
            background: C.creamDark,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            padding: "1.25rem",
            position: "sticky",
            top: "1rem",
          }}
        >
          <div
            style={{
              fontFamily: SERIF,
              fontSize: "1.05rem",
              fontWeight: 600,
              marginBottom: "0.25rem",
            }}
          >
            Assumptions
          </div>
          <p style={{ fontSize: "0.8rem", color: C.inkMuted, margin: "0 0 1rem" }}>
            Drag to see the estimate move. The model reruns in your browser.
          </p>

          <Slider
            label="Evidence stance"
            value={credulity}
            min={0}
            max={1}
            step={0.01}
            onChange={setCredulity}
            display={
              credulity < 0.04
                ? "skeptical"
                : credulity > 0.96
                  ? "credulous"
                  : `${Math.round(credulity * 100)}% credulous`
            }
            help="Skeptical weights each effect by how well its study identifies causation. Credulous trusts every cited effect at face value."
            accent
          />
          <Slider
            label="Realization (mode)"
            value={realization}
            min={0.55}
            max={1.1}
            step={0.01}
            onChange={setRealization}
            display={`mode ${realization.toFixed(2)}`}
            help="Central value (mode) of a 0.55–1.10 triangular draw for the share of the studied effect a marginal unrestricted grant delivers — the whole distribution is sampled, not this number alone."
          />
          <Slider
            label="Total giving (2026 $)"
            value={givingB}
            min={5}
            max={60}
            step={0.1}
            onChange={setGivingB}
            display={`$${givingB.toFixed(1)}B`}
            help="Real 2026 dollars. Default inflates each year's gifts ($26.39B nominal, 2020–2025) to ~$30.3B with CPI-U."
          />
          <Slider
            label="Discount rate"
            value={discount}
            min={0}
            max={0.07}
            step={0.005}
            onChange={setDiscount}
            display={`${(discount * 100).toFixed(1)}%`}
            help="Annual discount on future life-years."
          />

          <details style={{ marginTop: "0.75rem" }}>
            <summary
              style={{
                cursor: "pointer",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: C.inkSoft,
              }}
            >
              Allocation across causes
            </summary>
            <div style={{ marginTop: "0.75rem" }}>
              {ARCHETYPES.map((a, j) => (
                <Slider
                  key={a.label}
                  label={a.label}
                  value={shares[j]}
                  min={0}
                  max={0.3}
                  step={0.005}
                  small
                  onChange={(v) =>
                    setShares((prev) => prev.map((x, i) => (i === j ? v : x)))
                  }
                  display={`${(normShares[j] * 100).toFixed(0)}%`}
                />
              ))}
            </div>
          </details>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "1rem",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", gap: 4 }}>
              {PRECISIONS.map((pr, i) => (
                <button
                  key={pr.label}
                  onClick={() => setPrecision(i)}
                  style={{
                    fontSize: "0.7rem",
                    padding: "0.25rem 0.5rem",
                    borderRadius: 6,
                    border: `1px solid ${i === precision ? C.amberDark : C.border}`,
                    background: i === precision ? C.amberGlow : "transparent",
                    color: i === precision ? C.amberDark : C.inkMuted,
                    cursor: "pointer",
                  }}
                  title={`${pr.n.toLocaleString()} Monte Carlo draws`}
                >
                  {pr.label}
                </button>
              ))}
            </div>
            <button
              onClick={reset}
              style={{
                fontSize: "0.75rem",
                padding: "0.3rem 0.7rem",
                borderRadius: 6,
                border: `1px solid ${C.border}`,
                background: "transparent",
                color: C.inkSoft,
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          </div>
        </div>

        {/* ---- Results ---- */}
        <div style={{ opacity: busy && computed ? 0.55 : 1, transition: "opacity 150ms" }}>
          {s ? (
            <>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                  gap: "0.75rem",
                  marginBottom: "1.5rem",
                }}
              >
                <Metric
                  hero
                  label="Median QALYs"
                  value={fmtQalys(s.median)}
                  sub={`90%: ${fmtQalys(s.p05)}–${fmtQalys(s.p95)}`}
                />
                <Metric
                  label="Blended $/QALY"
                  value={fmtDollars(s.blendedMedian)}
                  sub={`90%: ${fmtDollars(s.blendedP05)}–${fmtDollars(s.blendedP95)}`}
                />
                <Metric
                  label="Benefit / cost"
                  value={`${s.bcMedian.toFixed(1)}×`}
                  sub={`${fmtDollars(s.valueMedian)} of health at HHS's value/QALY ÷ ${fmtDollars(givingB * 1e9)} given`}
                />
              </div>

              <ChartCard title="Distribution of total QALYs">
                <Histogram hist={computed!.hist} medianLog={computed!.medianLog} median={s.median} />
              </ChartCard>

              <ChartCard title="Where the QALYs come from">
                <ArchetypeBars summary={s} />
              </ChartCard>

              <ChartCard title="What drives the spread">
                <Tornado drivers={computed!.drivers} />
                <p style={{ fontSize: "0.68rem", color: C.inkMuted, margin: "0.5rem 0 0", lineHeight: 1.4 }}>
                  Allocation shares are compositional (they sum to 1), so a
                  share's correlation is relative to the buckets it displaces.
                </p>
              </ChartCard>
            </>
          ) : (
            <div style={{ padding: "4rem", textAlign: "center", color: C.inkMuted }}>
              Running Monte Carlo…
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 760px) {
          .qaly-grid { grid-template-columns: 1fr !important; }
          .qaly-grid > div:first-child { position: static !important; }
        }
        .qaly-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 4px;
          border-radius: 9999px; background: ${C.border}; outline: none; }
        .qaly-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none;
          width: 16px; height: 16px; border-radius: 50%; background: ${C.amber};
          border: 2px solid ${C.cream}; box-shadow: 0 1px 2px rgba(15,23,42,0.2); cursor: pointer; }
        .qaly-slider::-moz-range-thumb { width: 16px; height: 16px; border-radius: 50%;
          background: ${C.amber}; border: 2px solid ${C.cream}; cursor: pointer; }
        .qaly-slider.accent { background: ${C.amberGlow}; height: 6px; }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function Slider(props: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  display: string;
  help?: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div style={{ marginBottom: props.small ? "0.5rem" : "0.85rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <label
          style={{
            fontSize: props.small ? "0.72rem" : "0.8rem",
            fontWeight: 600,
            color: props.accent ? C.amberDark : C.inkSoft,
          }}
        >
          {props.label}
        </label>
        <span style={{ fontSize: "0.75rem", fontFamily: MONO, color: C.ink }}>
          {props.display}
        </span>
      </div>
      <input
        type="range"
        className={`qaly-slider${props.accent ? " accent" : ""}`}
        value={props.value}
        min={props.min}
        max={props.max}
        step={props.step}
        onChange={(e) => props.onChange(parseFloat(e.target.value))}
        style={{ marginTop: 4 }}
      />
      {props.help && (
        <p style={{ fontSize: "0.68rem", color: C.inkMuted, margin: "0.25rem 0 0", lineHeight: 1.4 }}>
          {props.help}
        </p>
      )}
    </div>
  );
}

function Metric(props: { label: string; value: string; sub?: string; hero?: boolean }) {
  return (
    <div
      style={{
        background: props.hero ? C.amberGlow : C.creamDark,
        borderRadius: 10,
        padding: "0.75rem 0.9rem",
        border: `1px solid ${props.hero ? "rgba(217,119,6,0.25)" : C.borderSoft}`,
      }}
    >
      <div style={{ fontSize: "0.7rem", color: C.inkMuted, marginBottom: 2 }}>{props.label}</div>
      <div
        style={{
          fontFamily: SERIF,
          fontSize: props.hero ? "1.9rem" : "1.3rem",
          fontWeight: 700,
          color: props.hero ? C.amberDark : C.ink,
          lineHeight: 1.1,
        }}
      >
        {props.value}
      </div>
      {props.sub && <div style={{ fontSize: "0.65rem", color: C.inkMuted, marginTop: 2 }}>{props.sub}</div>}
    </div>
  );
}

function ChartCard(props: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: C.cream,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "1rem 1.1rem",
        marginBottom: "1rem",
      }}
    >
      <div style={{ fontSize: "0.8rem", fontWeight: 600, color: C.inkSoft, marginBottom: "0.75rem" }}>
        {props.title}
      </div>
      {props.children}
    </div>
  );
}

function Histogram(props: { hist: { x: number; count: number }[]; medianLog: number; median: number }) {
  const W = 640;
  const H = 200;
  const pad = { l: 8, r: 8, t: 10, b: 28 };
  const maxC = Math.max(...props.hist.map((h) => h.count), 1);
  const lo = 4;
  const hi = 6.5;
  const xOf = (lg: number) => pad.l + ((lg - lo) / (hi - lo)) * (W - pad.l - pad.r);
  const bw = (W - pad.l - pad.r) / props.hist.length;
  const ticks = [4, 4.5, 5, 5.5, 6, 6.5];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`Distribution of estimated QALYs, median ${fmtQalys(props.median)}`}>
      {props.hist.map((h, i) => {
        const barH = (h.count / maxC) * (H - pad.t - pad.b);
        return (
          <rect
            key={i}
            x={xOf(h.x) - bw / 2 + 0.5}
            y={H - pad.b - barH}
            width={Math.max(bw - 1, 0.5)}
            height={barH}
            fill={C.amber}
            opacity={0.85}
          />
        );
      })}
      <line
        x1={xOf(props.medianLog)}
        x2={xOf(props.medianLog)}
        y1={pad.t}
        y2={H - pad.b}
        stroke={C.amberDark}
        strokeWidth={2}
      />
      <text
        x={xOf(props.medianLog) + 5}
        y={pad.t + 12}
        fontSize={12}
        fill={C.amberDark}
        fontFamily={MONO}
      >
        median {fmtQalys(props.median)}
      </text>
      {ticks.map((t, i) => (
        <text
          key={t}
          x={xOf(t)}
          y={H - 8}
          fontSize={11}
          fill={C.inkMuted}
          textAnchor={i === 0 ? "start" : i === ticks.length - 1 ? "end" : "middle"}
        >
          {fmtQalys(Math.pow(10, t))}
        </text>
      ))}
    </svg>
  );
}

// Concise display names (the model labels are long; drop prefixes/parentheticals).
const SHORT_LABELS: Record<string, string> = {
  health_mental: "Mental & behavioral health",
  health_coverage: "Health insurance & access",
  health_chc: "Community health centers",
  econ_cash: "Cash & financial security",
  econ_food: "Food security",
  econ_housing: "Housing & homelessness",
  econ_workforce: "Workforce & mobility",
  education: "Education",
  equity_justice: "Equity & justice",
  civic_democracy: "Civic / democracy",
  arts_culture: "Arts & culture",
  environment: "Environment / climate",
  other_community: "Other / general community",
};

// Map full model labels -> short labels, for shortening sensitivity-driver names.
const LABEL_TO_SHORT: Record<string, string> = Object.fromEntries(
  ARCHETYPE_KEYS.map((k, i) => [ARCHETYPES[i].label, SHORT_LABELS[k] ?? ARCHETYPES[i].label]),
);

function shortenDriver(name: string): string {
  let out = name;
  for (const [full, short] of Object.entries(LABEL_TO_SHORT)) out = out.replace(full, short);
  return out;
}

function ArchetypeBars(props: { summary: Summary }) {
  const rows = props.summary.perArchetype;
  const maxV = Math.max(...rows.map((r) => r.meanQalys), 1);
  return (
    <div>
      {rows.map((r) => (
        <div key={r.key} style={{ marginBottom: "0.6rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: "0.75rem",
              marginBottom: 3,
            }}
          >
            <span style={{ fontSize: "0.82rem", color: C.ink }}>{SHORT_LABELS[r.key] ?? r.label}</span>
            <span style={{ fontSize: "0.8rem", fontFamily: MONO, color: C.ink, whiteSpace: "nowrap", flexShrink: 0 }}>
              {fmtQalys(r.meanQalys)}
              <span style={{ color: C.inkMuted, fontSize: "0.7rem" }}> · {TIER_LABELS[r.tier] ?? r.tier}</span>
            </span>
          </div>
          <div style={{ background: C.borderSoft, borderRadius: 4, height: 9 }}>
            <div
              style={{
                width: `${(r.meanQalys / maxV) * 100}%`,
                background: C.amber,
                height: "100%",
                borderRadius: 4,
                minWidth: 2,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function Tornado(props: { drivers: Driver[] }) {
  const W = 640;
  const rowH = 26;
  const H = props.drivers.length * rowH + 16;
  const cx = W * 0.62;
  const scale = (W * 0.36) / 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Sensitivity tornado of input drivers">
      <line x1={cx} x2={cx} y1={4} y2={H - 12} stroke={C.border} />
      {props.drivers.map((d, i) => {
        const y = 8 + i * rowH;
        const w = Math.abs(d.rho) * scale;
        const x = d.rho >= 0 ? cx : cx - w;
        return (
          <g key={d.name}>
            <rect x={x} y={y} width={w} height={rowH - 10} rx={2} fill={d.rho >= 0 ? C.amber : C.inkSoft} opacity={0.85} />
            <text
              x={d.rho >= 0 ? cx - 6 : cx + 6}
              y={y + (rowH - 10) / 2 + 4}
              fontSize={11}
              fill={C.inkSoft}
              textAnchor={d.rho >= 0 ? "end" : "start"}
            >
              {(() => {
                const n = shortenDriver(d.name);
                return n.length > 42 ? n.slice(0, 41) + "…" : n;
              })()}
            </text>
            <text x={x + (d.rho >= 0 ? w + 4 : -4)} y={y + (rowH - 10) / 2 + 4} fontSize={10} fontFamily={MONO} fill={C.inkMuted} textAnchor={d.rho >= 0 ? "start" : "end"}>
              {d.rho >= 0 ? "+" : ""}
              {d.rho.toFixed(2)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
