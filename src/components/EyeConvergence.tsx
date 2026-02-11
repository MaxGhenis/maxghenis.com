import { useState, useEffect, useMemo } from 'react';

/**
 * First-person eye convergence visualization.
 *
 * Shows a face from YOUR perspective. The face scales with distance,
 * a foveal circle shows your ~2° acuity zone, and the unfocused eye
 * blurs proportionally — simulating what you actually experience.
 *
 * Aesthetic: Scientific illustration — warm parchment, detailed iris,
 * peripheral vignette. Like looking through your own eyes at an anatomy plate.
 */

// Viewport represents ~40° of horizontal visual field
const VW = 520;
const VH = 360;
const FIELD_OF_VIEW_DEG = 40;
const PX_PER_DEG = VW / FIELD_OF_VIEW_DEG; // 13px per degree
const IPD_CM = 6.3;
const FOVEA_DEG = 2;
const FOVEA_R = (FOVEA_DEG / 2) * PX_PER_DEG; // ~13px radius

// Palette
const C = {
  parchment: '#fdf6ec',
  ink: '#2c1810',
  inkLight: '#6b5344',
  inkFaint: '#b8a696',
  sclera: '#faf8f5',
  irisOuter: '#5c4a2e',
  irisInner: '#8b6914',
  irisHighlight: '#d4a843',
  pupil: '#1a1008',
  accent: '#c45a28',
  accentBg: '#fef3ec',
  cardBorder: '#e8dcc8',
  label: '#8b7355',
  focusRing: '#c45a28',
  vignette: '#1a1008',
};

function deg(rad: number) {
  return (rad * 180) / Math.PI;
}

type FocusTarget = 'left' | 'right';

/** Detailed eye component (scales with face) */
function FaceEye({
  id,
  cx,
  cy,
  r,
  blurAmount,
  focused,
  onClick,
}: {
  id: string;
  cx: number;
  cy: number;
  r: number; // eye radius, scales with distance
  blurAmount: number;
  focused: boolean;
  onClick: () => void;
}) {
  const irisR = r * 0.72;
  const pupilR = r * 0.36;
  const filterId = `blur-${id}`;
  return (
    <g
      filter={blurAmount > 0.3 ? `url(#${filterId})` : undefined}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <defs>
        <filter id={filterId}>
          <feGaussianBlur stdDeviation={blurAmount} />
        </filter>
        <radialGradient id={`${id}-sclera`} cx="0.45" cy="0.4">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor={C.sclera} />
          <stop offset="100%" stopColor="#ede5d8" />
        </radialGradient>
        <radialGradient id={`${id}-iris`} cx="0.4" cy="0.35">
          <stop offset="0%" stopColor={C.irisHighlight} />
          <stop offset="40%" stopColor={C.irisInner} />
          <stop offset="100%" stopColor={C.irisOuter} />
        </radialGradient>
      </defs>

      {/* Sclera */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={r}
        ry={r * 0.82}
        fill={`url(#${id}-sclera)`}
        stroke={C.inkFaint}
        strokeWidth={Math.max(0.5, r * 0.06)}
      />
      {/* Iris */}
      <circle cx={cx} cy={cy} r={irisR} fill={`url(#${id}-iris)`} stroke={C.irisOuter} strokeWidth={r * 0.03} />
      {/* Iris ring */}
      <circle cx={cx} cy={cy} r={irisR * 0.7} fill="none" stroke={C.irisInner} strokeWidth={r * 0.03} opacity={0.4} />
      {/* Pupil */}
      <circle cx={cx} cy={cy} r={pupilR} fill={C.pupil} />
      {/* Catchlight */}
      <circle cx={cx - r * 0.12} cy={cy - r * 0.15} r={r * 0.1} fill="white" opacity={0.85} />
      <circle cx={cx + r * 0.08} cy={cy + r * 0.06} r={r * 0.05} fill="white" opacity={0.45} />

      {/* Focus ring */}
      {focused && (
        <circle cx={cx} cy={cy} r={r + r * 0.35} fill="none" stroke={C.focusRing} strokeWidth={Math.max(1, r * 0.08)} opacity={0.5}>
          <animate attributeName="r" values={`${r + r * 0.3};${r + r * 0.5};${r + r * 0.3}`} dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2.5s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
}

export default function EyeConvergence() {
  const [focus, setFocus] = useState<FocusTarget>('left');
  const [distCm, setDistCm] = useState(30); // 15cm–500cm

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  // Angular separation of their two eyes (degrees)
  const separation = useMemo(() => 2 * deg(Math.atan((IPD_CM / 2) / distCm)), [distCm]);

  // Convert IPD to pixels at this distance
  const ipdPx = separation * PX_PER_DEG;

  // Eye positions (centered in viewport)
  const leftEyeX = VW / 2 - ipdPx / 2;
  const rightEyeX = VW / 2 + ipdPx / 2;
  const eyeY = VH / 2;

  // Eye radius scales inversely with distance (closer = bigger face)
  // At 30cm, eye ≈ 18px radius. Iris is ~12mm diameter, so angular size = 12/dist(mm) * 180/π
  const eyeAngularDeg = deg(12 / (distCm * 10)); // 12mm iris at dist mm
  const eyeR = Math.max(3, eyeAngularDeg * PX_PER_DEG * 1.4); // scale up slightly for sclera

  // Blur: how far is the unfocused eye from foveal center? (in pixels)
  const focusedX = focus === 'left' ? leftEyeX : rightEyeX;
  const unfocusedX = focus === 'left' ? rightEyeX : leftEyeX;
  const unfocusedDist = Math.abs(unfocusedX - focusedX);
  // Blur stdDeviation proportional to distance from foveal center
  // Beyond fovea (FOVEA_R ~13px), blur ramps up
  const blurAmount = Math.max(0, (unfocusedDist - FOVEA_R) * 0.12);

  // Face outline scales with distance
  const faceRx = ipdPx / 2 + eyeR * 2.5;
  const faceRy = faceRx * 1.2;

  // Nose bridge
  const noseW = ipdPx * 0.15;

  // Status
  const statusText =
    separation > 10
      ? 'Way beyond your fovea (~2\u00b0) \u2014 you must pick one'
      : separation > 5
        ? 'Outside your fovea \u2014 clearly choosing one eye'
        : separation > 2
          ? 'Near foveal range \u2014 you notice, but barely'
          : 'Within your fovea \u2014 feels like both at once';
  const statusColor = separation > 5 ? C.accent : separation > 2 ? C.inkLight : '#5a7a3a';

  // Distance label
  const distLabel = distCm < 100 ? `${Math.round(distCm)} cm` : `${(distCm / 100).toFixed(1)} m`;

  return (
    <div
      style={{
        maxWidth: 560,
        margin: '2.5rem auto',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      {/* Toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        {(['left', 'right'] as const).map((side) => {
          const active = focus === side;
          return (
            <button
              key={side}
              onClick={() => setFocus(side)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '100px',
                border: `1.5px solid ${active ? C.accent : C.cardBorder}`,
                background: active ? C.accentBg : 'transparent',
                color: active ? C.accent : C.inkLight,
                fontWeight: active ? 600 : 400,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                fontFamily: 'inherit',
              }}
            >
              {side === 'left' ? 'Their left eye' : 'Their right eye'}
            </button>
          );
        })}
      </div>

      {/* First-person viewport */}
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        width="100%"
        style={{
          borderRadius: '16px',
          border: `1px solid ${C.cardBorder}`,
          overflow: 'hidden',
          display: 'block',
        }}
      >
        <defs>
          {/* Background gradient */}
          <radialGradient id="bg-glow" cx="0.5" cy="0.5" r="0.55">
            <stop offset="0%" stopColor="#fefaf2" />
            <stop offset="100%" stopColor={C.parchment} />
          </radialGradient>
          {/* Peripheral vignette — simulates vision falloff */}
          <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.5">
            <stop offset="50%" stopColor="black" stopOpacity="0" />
            <stop offset="85%" stopColor="black" stopOpacity="0.06" />
            <stop offset="100%" stopColor="black" stopOpacity="0.2" />
          </radialGradient>
          {/* Grain */}
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="multiply" />
          </filter>
          {/* Fovea highlight */}
          <radialGradient id="fovea-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="white" stopOpacity="0.08" />
            <stop offset="80%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background */}
        <rect width={VW} height={VH} fill="url(#bg-glow)" />
        <rect width={VW} height={VH} filter="url(#grain)" opacity="0.025" />

        {/* Face group — everything scales with distance */}
        <g>
          {/* Face outline (subtle) */}
          {faceRx > 8 && (
            <ellipse
              cx={VW / 2}
              cy={eyeY + faceRy * 0.1}
              rx={faceRx}
              ry={faceRy}
              fill="none"
              stroke={C.inkFaint}
              strokeWidth={Math.max(0.5, eyeR * 0.04)}
              strokeDasharray={`${Math.max(1, eyeR * 0.1)} ${Math.max(2, eyeR * 0.2)}`}
              opacity={0.3}
            />
          )}

          {/* Nose bridge */}
          {noseW > 1 && (
            <line
              x1={VW / 2}
              y1={eyeY + eyeR * 0.3}
              x2={VW / 2}
              y2={eyeY + eyeR * 2}
              stroke={C.inkFaint}
              strokeWidth={Math.max(0.3, noseW * 0.3)}
              opacity={0.2}
              strokeLinecap="round"
            />
          )}

          {/* Eyebrows */}
          {eyeR > 4 && (
            <>
              <path
                d={`M ${leftEyeX - eyeR * 1.1} ${eyeY - eyeR * 1.3} Q ${leftEyeX} ${eyeY - eyeR * 1.8} ${leftEyeX + eyeR * 1.1} ${eyeY - eyeR * 1.3}`}
                fill="none"
                stroke={C.inkFaint}
                strokeWidth={Math.max(0.5, eyeR * 0.1)}
                strokeLinecap="round"
                opacity={0.35}
              />
              <path
                d={`M ${rightEyeX - eyeR * 1.1} ${eyeY - eyeR * 1.3} Q ${rightEyeX} ${eyeY - eyeR * 1.8} ${rightEyeX + eyeR * 1.1} ${eyeY - eyeR * 1.3}`}
                fill="none"
                stroke={C.inkFaint}
                strokeWidth={Math.max(0.5, eyeR * 0.1)}
                strokeLinecap="round"
                opacity={0.35}
              />
            </>
          )}

          {/* Eyes */}
          <FaceEye
            id="left"
            cx={leftEyeX}
            cy={eyeY}
            r={eyeR}
            blurAmount={focus === 'left' ? 0 : blurAmount}
            focused={focus === 'left'}
            onClick={() => setFocus('left')}
          />
          <FaceEye
            id="right"
            cx={rightEyeX}
            cy={eyeY}
            r={eyeR}
            blurAmount={focus === 'right' ? 0 : blurAmount}
            focused={focus === 'right'}
            onClick={() => setFocus('right')}
          />
        </g>

        {/* Foveal circle — fixed size, always centered on focused eye */}
        <circle
          cx={focusedX}
          cy={eyeY}
          r={FOVEA_R}
          fill="url(#fovea-glow)"
          stroke={C.accent}
          strokeWidth={0.8}
          strokeDasharray="3 4"
          opacity={0.5}
        />

        {/* Fovea label */}
        {FOVEA_R > 6 && (
          <text
            x={focusedX}
            y={eyeY - FOVEA_R - 6}
            textAnchor="middle"
            fontSize="9"
            fill={C.accent}
            opacity={0.6}
            fontStyle="italic"
          >
            fovea (~2°)
          </text>
        )}

        {/* Peripheral vignette overlay */}
        <rect width={VW} height={VH} fill="url(#vignette)" />
      </svg>

      {/* Distance slider */}
      <div style={{ marginTop: '1rem', padding: '0 0.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: C.label, marginBottom: '0.3rem' }}>
          <span>15 cm</span>
          <span style={{ fontStyle: 'italic' }}>distance</span>
          <span>5 m</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={distToSlider(distCm)}
          onChange={(e) => setDistCm(sliderToDist(Number(e.target.value)))}
          style={{
            width: '100%',
            height: '6px',
            appearance: 'none',
            WebkitAppearance: 'none',
            background: `linear-gradient(to right, ${C.accent}, ${C.cardBorder})`,
            borderRadius: '3px',
            outline: 'none',
            cursor: 'pointer',
          }}
        />
      </div>

      {/* Stats */}
      <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div style={{ padding: '0.75rem', borderRadius: '12px', border: `1px solid ${C.cardBorder}`, background: C.parchment, textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.label, marginBottom: '0.25rem' }}>
            Distance
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: C.ink, fontVariantNumeric: 'tabular-nums' }}>
            {distLabel}
          </div>
        </div>
        <div style={{ padding: '0.75rem', borderRadius: '12px', border: `1px solid ${C.cardBorder}`, background: C.parchment, textAlign: 'center' }}>
          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: C.label, marginBottom: '0.25rem' }}>
            Angular separation
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: statusColor, fontVariantNumeric: 'tabular-nums', transition: 'color 0.3s ease' }}>
            {separation.toFixed(1)}°
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', fontSize: '0.8rem', color: C.inkLight, marginTop: '0.4rem' }}>
        {statusText}
      </div>
    </div>
  );
}

// Exponential slider mapping: 0–100 → 15cm–500cm
function sliderToDist(v: number): number {
  return 15 * Math.exp((v / 100) * Math.log(500 / 15));
}
function distToSlider(d: number): number {
  return (Math.log(d / 15) / Math.log(500 / 15)) * 100;
}
