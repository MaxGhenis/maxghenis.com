// Generates the social card for /mackenzie-scott-qaly.
//   bunx tsx scripts/generate-og-mackenzie.ts
// Renders an SVG (site design tokens) to a 1200x630 PNG via sharp.
import sharp from "sharp";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/assets/og-mackenzie-qaly.png");

// Tokens from src/styles/global.css
const ink = "#0f172a";
const inkSoft = "#334155";
const inkMuted = "#64748b";
const cream = "#fefdf8";
const amber = "#f59e0b";
const amberDark = "#d97706";
const grid = "rgba(15,23,42,0.04)";

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${cream}"/>
  <g stroke="${grid}" stroke-width="1">
    ${Array.from({ length: 30 }, (_, i) => `<line x1="${i * 40}" y1="0" x2="${i * 40}" y2="630"/>`).join("")}
    ${Array.from({ length: 16 }, (_, i) => `<line x1="0" y1="${i * 40}" x2="1200" y2="${i * 40}"/>`).join("")}
  </g>
  <rect x="0" y="0" width="14" height="630" fill="${amber}"/>

  <text x="70" y="92" font-family="Georgia, serif" font-size="26" fill="${inkMuted}">maxghenis.com · interactive model</text>

  <text x="70" y="190" font-family="Georgia, serif" font-weight="700" font-size="68" fill="${ink}">MacKenzie Scott's giving,</text>
  <text x="70" y="268" font-family="Georgia, serif" font-weight="700" font-size="68" fill="${ink}">in QALYs</text>

  <text x="70" y="430" font-family="Georgia, serif" font-weight="700" font-size="150" fill="${amberDark}">≈ 205,000</text>
  <text x="74" y="478" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="${inkSoft}">quality-adjusted life-years of health impact</text>

  <text x="70" y="556" font-family="Helvetica, Arial, sans-serif" font-size="27" fill="${inkMuted}">A GiveWell-style cost-effectiveness model of her $26.3B in philanthropy.</text>
  <text x="70" y="592" font-family="Helvetica, Arial, sans-serif" font-size="27" fill="${inkMuted}">Drag the assumptions; the Monte Carlo reruns in your browser.</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(OUT);
console.log("Wrote", OUT);
