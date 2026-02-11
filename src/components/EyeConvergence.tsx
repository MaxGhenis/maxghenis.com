import { useState, useEffect, useMemo } from 'react';

/**
 * First-person eye convergence visualization.
 *
 * Shows a face from YOUR perspective. The face scales with distance,
 * a foveal circle shows your ~1° acuity zone, and the unfocused eye
 * blurs proportionally — simulating what you actually experience.
 *
 * All face dimensions derived from real anatomy (mm).
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
};

function deg(rad: number) {
  return (rad * 180) / Math.PI;
}

type FocusTarget = 'left' | 'right';
type UnitSystem = 'metric' | 'imperial';

/** Detailed eye component with anatomically correct proportions */
function FaceEye({
  id,
  cx,
  cy,
  rx,
  ry,
  irisR,
  pupilR,
  blurAmount,
  focused,
  onClick,
}: {
  id: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  irisR: number;
  pupilR: number;
  blurAmount: number;
  focused: boolean;
  onClick: () => void;
}) {
  const filterId = `blur-${id}`;
  return (
    <g
      filter={blurAmount > 0.5 ? `url(#${filterId})` : undefined}
      onClick={onClick}
      style={{ cursor: 'pointer', transition: 'filter 0.3s ease' }}
      role="button"
      aria-label={`Look at their ${id} eye`}
      aria-pressed={focused}
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
        rx={rx}
        ry={ry}
        fill={`url(#${id}-sclera)`}
        stroke={C.inkFaint}
        strokeWidth={Math.max(0.3, rx * 0.04)}
      />
      {/* Iris */}
      <circle cx={cx} cy={cy} r={irisR} fill={`url(#${id}-iris)`} stroke={C.irisOuter} strokeWidth={Math.max(0.2, irisR * 0.06)} />
      {/* Iris ring */}
      <circle cx={cx} cy={cy} r={irisR * 0.7} fill="none" stroke={C.irisInner} strokeWidth={Math.max(0.2, irisR * 0.06)} opacity={0.4} />
      {/* Pupil */}
      <circle cx={cx} cy={cy} r={pupilR} fill={C.pupil} />
      {/* Catchlight */}
      <circle cx={cx - irisR * 0.2} cy={cy - irisR * 0.25} r={irisR * 0.15} fill="white" opacity={0.85} />
      <circle cx={cx + irisR * 0.15} cy={cy + irisR * 0.1} r={irisR * 0.08} fill="white" opacity={0.45} />

      {/* Focus ring */}
      {focused && (
        <circle cx={cx} cy={cy} r={rx * 1.35} fill="none" stroke={C.focusRing} strokeWidth={Math.max(0.8, rx * 0.06)} opacity={0.5}>
          <animate attributeName="r" values={`${rx * 1.3};${rx * 1.5};${rx * 1.3}`} dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2.5s" repeatCount="indefinite" />
        </circle>
      )}
    </g>
  );
}

/** Format distance label */
function formatDist(cm: number, units: UnitSystem): string {
  if (units === 'imperial') {
    const inches = cm / 2.54;
    if (inches < 24) return `${Math.round(inches)} in`;
    const feet = inches / 12;
    return `${feet.toFixed(1)} ft`;
  }
  return cm < 100 ? `${Math.round(cm)} cm` : `${(cm / 100).toFixed(1)} m`;
}

/** Slider range labels */
function rangeLabels(units: UnitSystem): [string, string] {
  return units === 'imperial' ? ['6 in', '16 ft'] : ['15 cm', '5 m'];
}

export default function EyeConvergence() {
  const [focus, setFocus] = useState<FocusTarget>('left');
  const [distCm, setDistCm] = useState(30);
  const [units, setUnits] = useState<UnitSystem>('metric');

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

  // All face dimensions from real anatomy (mm) → angular pixels
  const mmToPx = (mm: number) => Math.max(0, deg(mm / (distCm * 10)) * PX_PER_DEG);

  const eyeR = Math.max(2, mmToPx(28) / 2);     // palpebral fissure half-width
  const eyeRy = Math.max(1.5, mmToPx(11) / 2);   // half-height
  const irisR = Math.max(1, mmToPx(12) / 2);      // iris radius
  const pupilR = Math.max(0.5, mmToPx(4) / 2);    // pupil radius
  const faceRx = Math.max(8, mmToPx(140) / 2);    // face half-width
  const faceRy = Math.max(10, mmToPx(190) / 2);   // face half-height

  // Blur proportional to how far outside the fovea the other eye is
  const focusedX = focus === 'left' ? leftEyeX : rightEyeX;
  const excessDeg = Math.max(0, separation - FOVEA_DEG);
  const blurAmount = excessDeg * 0.4;

  // Status text
  const statusText =
    separation > 10
      ? 'Way beyond your fovea (~1\u00b0) \u2014 you must pick one'
      : separation > 5
        ? 'Outside your fovea \u2014 clearly choosing one eye'
        : separation > 1
          ? 'Near foveal range \u2014 you notice, but barely'
          : 'Within your fovea \u2014 feels like both at once';
  const statusColor = separation > 5 ? C.accent : separation > 1 ? C.inkLight : '#5a7a3a';

  const [minLabel, maxLabel] = rangeLabels(units);

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
      {/* Eye toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        {(['left', 'right'] as const).map((side) => {
          const active = focus === side;
          return (
            <button
              key={side}
              onClick={() => setFocus(side)}
              aria-pressed={active}
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
        role="img"
        aria-label={`Face at ${formatDist(distCm, units)} distance. Angular separation between eyes: ${separation.toFixed(1)} degrees. Currently focusing on their ${focus} eye.`}
        style={{
          borderRadius: '16px',
          border: `1px solid ${C.cardBorder}`,
          overflow: 'hidden',
          display: 'block',
        }}
      >
        <title>Eye convergence visualization</title>
        <desc>
          Interactive first-person view showing how the angular separation between someone's eyes changes with distance.
          At close range, one eye appears blurry because it falls outside your fovea.
        </desc>

        <defs>
          <radialGradient id="bg-glow" cx="0.5" cy="0.5" r="0.55">
            <stop offset="0%" stopColor="#fefaf2" />
            <stop offset="100%" stopColor={C.parchment} />
          </radialGradient>
          <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.5">
            <stop offset="50%" stopColor="black" stopOpacity="0" />
            <stop offset="85%" stopColor="black" stopOpacity="0.06" />
            <stop offset="100%" stopColor="black" stopOpacity="0.2" />
          </radialGradient>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feBlend in="SourceGraphic" mode="multiply" />
          </filter>
          <radialGradient id="fovea-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="white" stopOpacity="0.08" />
            <stop offset="80%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="skin-grad" cx="0.5" cy="0.4" r="0.55">
            <stop offset="0%" stopColor="#f5dcc3" />
            <stop offset="60%" stopColor="#e8c9a8" />
            <stop offset="100%" stopColor="#d4ad84" />
          </radialGradient>
          <radialGradient id="cheek-l" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#e8a090" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#e8a090" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cheek-r" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#e8a090" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#e8a090" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Background */}
        <rect width={VW} height={VH} fill="url(#bg-glow)" />
        <rect width={VW} height={VH} filter="url(#grain)" opacity="0.025" />

        {/* Face */}
        <g>
          {/* Face shape */}
          {faceRx > 5 && (
            <>
              <ellipse
                cx={VW / 2}
                cy={eyeY + faceRy * 0.1}
                rx={faceRx}
                ry={faceRy}
                fill="url(#skin-grad)"
                stroke="#c9a57a"
                strokeWidth={Math.max(0.3, eyeR * 0.03)}
                opacity={0.95}
              />
              <circle cx={leftEyeX - mmToPx(5)} cy={eyeY + mmToPx(25)} r={mmToPx(20)} fill="url(#cheek-l)" />
              <circle cx={rightEyeX + mmToPx(5)} cy={eyeY + mmToPx(25)} r={mmToPx(20)} fill="url(#cheek-r)" />
            </>
          )}

          {/* Nose */}
          {mmToPx(10) > 1 && (
            <g opacity={0.4}>
              <line x1={VW / 2} y1={eyeY + mmToPx(5)} x2={VW / 2} y2={eyeY + mmToPx(32)} stroke="#b8956a" strokeWidth={Math.max(0.3, mmToPx(2))} strokeLinecap="round" />
              <path d={`M ${VW / 2 - mmToPx(9)} ${eyeY + mmToPx(34)} Q ${VW / 2} ${eyeY + mmToPx(40)} ${VW / 2 + mmToPx(9)} ${eyeY + mmToPx(34)}`} fill="none" stroke="#b8956a" strokeWidth={Math.max(0.3, mmToPx(1.5))} strokeLinecap="round" />
            </g>
          )}

          {/* Mouth */}
          {mmToPx(10) > 1.5 && (
            <g opacity={0.35}>
              <path d={`M ${VW / 2 - mmToPx(22)} ${eyeY + mmToPx(55)} Q ${VW / 2 - mmToPx(8)} ${eyeY + mmToPx(50)} ${VW / 2} ${eyeY + mmToPx(53)} Q ${VW / 2 + mmToPx(8)} ${eyeY + mmToPx(50)} ${VW / 2 + mmToPx(22)} ${eyeY + mmToPx(55)}`} fill="none" stroke="#c48870" strokeWidth={Math.max(0.4, mmToPx(1.5))} strokeLinecap="round" />
              <path d={`M ${VW / 2 - mmToPx(18)} ${eyeY + mmToPx(56)} Q ${VW / 2} ${eyeY + mmToPx(64)} ${VW / 2 + mmToPx(18)} ${eyeY + mmToPx(56)}`} fill="none" stroke="#c48870" strokeWidth={Math.max(0.3, mmToPx(1.2))} strokeLinecap="round" />
            </g>
          )}

          {/* Eyebrows */}
          {mmToPx(5) > 1 && (
            <>
              <path d={`M ${leftEyeX - mmToPx(17)} ${eyeY - mmToPx(13)} Q ${leftEyeX} ${eyeY - mmToPx(20)} ${leftEyeX + mmToPx(15)} ${eyeY - mmToPx(14)}`} fill="none" stroke="#6b4e35" strokeWidth={Math.max(0.5, mmToPx(2.5))} strokeLinecap="round" opacity={0.45} />
              <path d={`M ${rightEyeX - mmToPx(15)} ${eyeY - mmToPx(14)} Q ${rightEyeX} ${eyeY - mmToPx(20)} ${rightEyeX + mmToPx(17)} ${eyeY - mmToPx(13)}`} fill="none" stroke="#6b4e35" strokeWidth={Math.max(0.5, mmToPx(2.5))} strokeLinecap="round" opacity={0.45} />
            </>
          )}

          {/* Eyes */}
          <FaceEye id="left" cx={leftEyeX} cy={eyeY} rx={eyeR} ry={eyeRy} irisR={irisR} pupilR={pupilR} blurAmount={focus === 'left' ? 0 : blurAmount} focused={focus === 'left'} onClick={() => setFocus('left')} />
          <FaceEye id="right" cx={rightEyeX} cy={eyeY} rx={eyeR} ry={eyeRy} irisR={irisR} pupilR={pupilR} blurAmount={focus === 'right' ? 0 : blurAmount} focused={focus === 'right'} onClick={() => setFocus('right')} />
        </g>

        {/* Foveal circle */}
        <circle cx={focusedX} cy={eyeY} r={FOVEA_R} fill="url(#fovea-glow)" stroke={C.accent} strokeWidth={0.8} strokeDasharray="3 4" opacity={0.5} style={{ transition: 'cx 0.3s ease' }} />
        {FOVEA_R > 6 && (
          <text x={focusedX} y={eyeY - FOVEA_R - 6} textAnchor="middle" fontSize="9" fill={C.accent} opacity={0.6} fontStyle="italic" style={{ transition: 'x 0.3s ease' }}>
            fovea (~1°)
          </text>
        )}

        {/* Peripheral vignette */}
        <rect width={VW} height={VH} fill="url(#vignette)" />
      </svg>

      {/* Distance slider */}
      <div style={{ marginTop: '1rem', padding: '0 0.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: C.label, marginBottom: '0.3rem' }}>
          <span>{minLabel}</span>
          <span style={{ fontStyle: 'italic' }}>distance</span>
          <span>{maxLabel}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={distToSlider(distCm)}
          onChange={(e) => setDistCm(sliderToDist(Number(e.target.value)))}
          aria-label={`Distance: ${formatDist(distCm, units)}`}
          aria-valuemin={15}
          aria-valuemax={500}
          aria-valuenow={Math.round(distCm)}
          aria-valuetext={formatDist(distCm, units)}
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
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: C.ink, fontVariantNumeric: 'tabular-nums', transition: 'all 0.15s ease' }}>
            {formatDist(distCm, units)}
          </div>
          <button
            onClick={() => setUnits(u => u === 'metric' ? 'imperial' : 'metric')}
            aria-label={`Switch to ${units === 'metric' ? 'imperial' : 'metric'} units`}
            style={{
              marginTop: '0.2rem',
              padding: 0,
              border: 'none',
              background: 'none',
              color: C.label,
              fontSize: '0.65rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationStyle: 'dotted' as const,
              fontFamily: 'inherit',
            }}
          >
            {units === 'metric' ? 'show ft/in' : 'show cm/m'}
          </button>
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
      <div style={{ textAlign: 'center', fontSize: '0.8rem', color: C.inkLight, marginTop: '0.4rem', transition: 'color 0.3s ease' }}>
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
