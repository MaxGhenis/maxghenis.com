import { useMemo, useState } from "react";
import {
  ASSETS,
  WORLD_LABELS,
  expectedShares,
  fmtDollars,
  fmtPercent,
  meanRankingAccuracy,
  pTracked,
  trackingCurve,
  type WorldKey,
} from "../lib/democrasim";

// Design tokens (mirrors src/styles/global.css :root).
const C = {
  ink: "#0f172a",
  inkSoft: "#334155",
  inkMuted: "#64748b",
  cream: "#fefdf8",
  creamDark: "#faf9f4",
  amber: "#f59e0b",
  amberDark: "#d97706",
  border: "rgba(15, 23, 42, 0.1)",
  borderSoft: "rgba(15, 23, 42, 0.06)",
  grid: "rgba(15, 23, 42, 0.08)",
};
const MONO = "'JetBrains Mono', monospace";

const N_OPTIONS: { label: string; value: number | null }[] = [
  { label: "101", value: 101 },
  { label: "1,001", value: 1_001 },
  { label: "10,001", value: 10_001 },
  { label: "100,001", value: 100_001 },
  { label: "1,000,001", value: 1_000_001 },
  { label: "268M (limit)", value: null },
];

const WORLD_KEYS: WorldKey[] = [
  "per_capita",
  "proportional",
  "none",
  "sign_flip",
];

const PRESETS: { label: string; sigma: number; bias: number }[] = [
  { label: "Perfect information", sigma: 0, bias: 0 },
  { label: "Moderate noise", sigma: 1_000, bias: 0 },
  { label: "Shared bias", sigma: 1_000, bias: 300 },
];

// Slider position 0 = σ exactly 0; positions 1..100 map log-linearly $1–$100k.
const SIGMA_STEPS = 100;
function positionToSigma(position: number): number {
  if (position <= 0) return 0;
  return Math.exp(
    Math.log(1) +
      ((position - 1) / (SIGMA_STEPS - 1)) * Math.log(100_000 / 1),
  );
}
function sigmaToPosition(sigma: number): number {
  if (sigma <= 0) return 0;
  return (
    1 +
    ((SIGMA_STEPS - 1) * Math.log(sigma / 1)) / Math.log(100_000 / 1)
  );
}

const CHART = { w: 640, h: 240, left: 46, right: 12, top: 12, bottom: 30 };

function xScale(sigma: number): number {
  // σ=0 gets its own slot at the left edge; the log scale starts at $1.
  const plotW = CHART.w - CHART.left - CHART.right;
  const zeroSlot = 18;
  if (sigma <= 0) return CHART.left;
  const t = Math.log(Math.max(sigma, 1)) / Math.log(100_000);
  return CHART.left + zeroSlot + t * (plotW - zeroSlot);
}
function yScale(p: number): number {
  const plotH = CHART.h - CHART.top - CHART.bottom;
  return CHART.top + (1 - p) * plotH;
}

export default function DemocrasimExplorer() {
  const [worldKey, setWorldKey] = useState<WorldKey>("per_capita");
  const [sigmaPosition, setSigmaPosition] = useState(
    sigmaToPosition(1_000),
  );
  const [bias, setBias] = useState(0);
  const [nIndex, setNIndex] = useState(2);

  const sigma = positionToSigma(sigmaPosition);
  const nVoters = N_OPTIONS[nIndex].value;
  const world = ASSETS.worlds[worldKey];

  const tracked = useMemo(
    () => pTracked(world, sigma, bias, nVoters),
    [world, sigma, bias, nVoters],
  );
  const shares = useMemo(
    () => expectedShares(world, sigma, bias),
    [world, sigma, bias],
  );
  const accuracy = useMemo(
    () => meanRankingAccuracy(world, sigma, bias),
    [world, sigma, bias],
  );
  const curve = useMemo(
    () => trackingCurve(world, bias, nVoters),
    [world, bias, nVoters],
  );

  const path = useMemo(() => {
    return curve
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"}${xScale(point.sigma).toFixed(1)},${yScale(point.pTracked).toFixed(1)}`,
      )
      .join(" ");
  }, [curve]);

  const [labelA, labelB] = ASSETS.constants.labels;

  return (
    <div
      style={{
        background: C.creamDark,
        border: `1px solid ${C.border}`,
        borderRadius: 12,
        padding: "1.1rem 1.2rem 0.9rem",
        margin: "1.6rem 0",
        color: C.ink,
      }}
    >
      {/* Controls */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem 1.6rem",
          alignItems: "flex-end",
        }}
      >
        <label style={{ flex: "1 1 240px", fontSize: "0.82rem" }}>
          <span style={{ color: C.inkMuted }}>
            Perception noise σ:{" "}
            <strong style={{ color: C.ink, fontFamily: MONO }}>
              {sigma === 0 ? "$0 (exact)" : `${fmtDollars(sigma)}/yr`}
            </strong>
          </span>
          <input
            type="range"
            min={0}
            max={SIGMA_STEPS}
            step={0.5}
            value={sigmaPosition}
            onChange={(event) => setSigmaPosition(Number(event.target.value))}
            style={{ width: "100%", accentColor: C.amber }}
            aria-label="Perception noise, dollars per year"
          />
        </label>
        <label style={{ flex: "1 1 240px", fontSize: "0.82rem" }}>
          <span style={{ color: C.inkMuted }}>
            Shared bias toward {labelB}:{" "}
            <strong style={{ color: C.ink, fontFamily: MONO }}>
              {fmtDollars(bias)}/yr
            </strong>
          </span>
          <input
            type="range"
            min={0}
            max={1_000}
            step={10}
            value={bias}
            onChange={(event) => setBias(Number(event.target.value))}
            style={{ width: "100%", accentColor: C.amber }}
            aria-label="Shared perceived bias toward Policy B, dollars per year"
          />
        </label>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem 1.6rem",
          marginTop: "0.7rem",
          fontSize: "0.82rem",
        }}
      >
        <label style={{ color: C.inkMuted }}>
          Financing world{" "}
          <select
            value={worldKey}
            onChange={(event) => setWorldKey(event.target.value as WorldKey)}
            style={{
              fontFamily: MONO,
              fontSize: "0.8rem",
              background: C.cream,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              padding: "0.15rem 0.3rem",
              color: C.ink,
            }}
          >
            {WORLD_KEYS.map((key) => (
              <option key={key} value={key}>
                {WORLD_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
        <label style={{ color: C.inkMuted }}>
          Sampled voters{" "}
          <select
            value={nIndex}
            onChange={(event) => setNIndex(Number(event.target.value))}
            style={{
              fontFamily: MONO,
              fontSize: "0.8rem",
              background: C.cream,
              border: `1px solid ${C.border}`,
              borderRadius: 6,
              padding: "0.15rem 0.3rem",
              color: C.ink,
            }}
          >
            {N_OPTIONS.map((option, index) => (
              <option key={option.label} value={index}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <span style={{ display: "flex", gap: "0.4rem" }}>
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setSigmaPosition(sigmaToPosition(preset.sigma));
                setBias(preset.bias);
              }}
              style={{
                fontSize: "0.75rem",
                background:
                  sigma === preset.sigma && bias === preset.bias
                    ? C.amber
                    : C.cream,
                color:
                  sigma === preset.sigma && bias === preset.bias
                    ? C.cream
                    : C.inkSoft,
                border: `1px solid ${C.border}`,
                borderRadius: 999,
                padding: "0.2rem 0.7rem",
                cursor: "pointer",
              }}
            >
              {preset.label}
            </button>
          ))}
        </span>
      </div>

      {/* Headline readout */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.4rem 2rem",
          alignItems: "baseline",
          marginTop: "1rem",
        }}
      >
        <div>
          <div style={{ fontSize: "0.72rem", color: C.inkMuted }}>
            P({labelA} — the welfare-preferred policy — wins)
          </div>
          <div
            style={{
              fontFamily: MONO,
              fontSize: "2rem",
              lineHeight: 1.1,
              color: tracked >= 0.5 ? C.amberDark : C.ink,
            }}
          >
            {fmtPercent(tracked, tracked > 0.995 || tracked < 0.005 ? 1 : 0)}
          </div>
        </div>
        <div style={{ fontSize: "0.78rem", color: C.inkSoft }}>
          <div>
            Expected votes: {labelA} {fmtPercent(shares.optimal, 1)} ·{" "}
            {labelB} {fmtPercent(shares.other, 1)}
            {shares.abstain > 0.0005 &&
              ` · abstain ${fmtPercent(shares.abstain, 1)}`}
          </div>
          <div style={{ color: C.inkMuted }}>
            Mean ranking accuracy {accuracy.toFixed(3)} (0.5 = coin flip; a
            derived coordinate, not a sufficient statistic)
          </div>
        </div>
      </div>

      {/* Tracking curve */}
      <svg
        viewBox={`0 0 ${CHART.w} ${CHART.h}`}
        style={{ width: "100%", height: "auto", marginTop: "0.6rem" }}
        role="img"
        aria-label={`Probability the welfare-preferred policy wins, versus perception noise, for ${WORLD_LABELS[worldKey]} at ${N_OPTIONS[nIndex].label} voters`}
      >
        {[0, 0.5, 0.9, 1].map((tick) => (
          <g key={tick}>
            <line
              x1={CHART.left}
              x2={CHART.w - CHART.right}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke={C.grid}
              strokeDasharray={tick === 0.9 ? "4 4" : undefined}
            />
            <text
              x={CHART.left - 6}
              y={yScale(tick) + 3}
              textAnchor="end"
              fontSize={9}
              fill={C.inkMuted}
              fontFamily={MONO}
            >
              {fmtPercent(tick)}
            </text>
          </g>
        ))}
        {[0, 10, 100, 1_000, 10_000, 100_000].map((tick) => (
          <text
            key={tick}
            x={xScale(tick)}
            y={CHART.h - CHART.bottom + 14}
            textAnchor="middle"
            fontSize={9}
            fill={C.inkMuted}
            fontFamily={MONO}
          >
            {tick === 0 ? "0" : fmtDollars(tick)}
          </text>
        ))}
        <text
          x={(CHART.left + CHART.w - CHART.right) / 2}
          y={CHART.h - 2}
          textAnchor="middle"
          fontSize={9}
          fill={C.inkMuted}
        >
          perception noise σ, dollars per year (log scale)
        </text>
        <path d={path} fill="none" stroke={C.ink} strokeWidth={2} />
        <circle
          cx={xScale(sigma)}
          cy={yScale(tracked)}
          r={5}
          fill={C.amber}
          stroke={C.cream}
          strokeWidth={1.5}
        />
      </svg>

      <div
        style={{
          fontSize: "0.68rem",
          color: C.inkMuted,
          borderTop: `1px solid ${C.borderSoft}`,
          paddingTop: "0.5rem",
          marginTop: "0.4rem",
        }}
      >
        Model output, not a measurement: closed-form tracking probability for
        plurality voting with linear-Gaussian perception over{" "}
        {ASSETS.constants.n_rows.toLocaleString()} adults' engine-computed
        household impacts (democrasim{" "}
        {ASSETS.provenance.democrasim_version}, artifact{" "}
        <span style={{ fontFamily: MONO }}>
          {ASSETS.provenance.artifact_sha256.slice(0, 8)}
        </span>
        ).{" "}
        <a href="https://github.com/MaxGhenis/democrasim" style={{ color: C.amberDark }}>
          Code and data
        </a>
        .
      </div>
    </div>
  );
}
