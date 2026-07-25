// Generates the social card for /safety.
//   bunx tsx scripts/generate-og-safety.ts
// The card plots the real dataset — the scatter is the finding, not decoration.
import sharp from "sharp";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../src/assets/og-safety.png");
const DATA = JSON.parse(
  readFileSync(join(__dirname, "../src/data/safety-data.json"), "utf-8"),
);

// Tokens from src/styles/global.css (:root, "the seam").
const paper = "#fbfaf6";
const ink = "#211d18";
const inkSoft = "#4a453f";
const inkMuted = "#7d766c";
const line = "#e8e3d8";
const rule = "#b45309";
const cast = "#a94e80";
const sky = "#5e97c8";

const fit = DATA.fit;
const rows = DATA.countries.filter((c: any) => c.homicide !== null);

// Plot frame on the right half of the card.
const X0 = 640, X1 = 1140, Y0 = 150, Y1 = 470;
const lg = (r: number) => Math.log10(r + 0.1);
const xs = rows.map((c: any) => lg(c.homicide));
const xMin = Math.min(...xs) - 0.1;
const xMax = Math.max(...xs) + 0.1;
const px = (v: number) => X0 + ((v - xMin) / (xMax - xMin)) * (X1 - X0);
const py = (v: number) => Y1 - ((v - 20) / 80) * (Y1 - Y0);

const dots = rows
  .map((c: any) => {
    const above = c.feltSafe >= c.predicted;
    return `<circle cx="${px(lg(c.homicide)).toFixed(1)}" cy="${py(c.feltSafe).toFixed(1)}" r="5" fill="${above ? cast : sky}" fill-opacity="0.55"/>`;
  })
  .join("");

const fitLine = `<line x1="${px(xMin).toFixed(1)}" y1="${py(fit.intercept + fit.slope * xMin).toFixed(1)}" x2="${px(xMax).toFixed(1)}" y2="${py(fit.intercept + fit.slope * xMax).toFixed(1)}" stroke="${inkMuted}" stroke-width="2.5" stroke-dasharray="9 6"/>`;

const gridLines = [20, 40, 60, 80, 100]
  .map((t) => `<line x1="${X0}" y1="${py(t).toFixed(1)}" x2="${X1}" y2="${py(t).toFixed(1)}" stroke="${line}" stroke-width="1.5"/>`)
  .join("");

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${paper}"/>
  <rect x="0" y="0" width="14" height="630" fill="${rule}"/>

  <text x="66" y="88" font-family="Georgia, serif" font-size="25" fill="${inkMuted}">maxghenis.com · interactive</text>

  <text x="66" y="186" font-family="Georgia, serif" font-weight="700" font-size="62" fill="${ink}">Felt safety vs.</text>
  <text x="66" y="256" font-family="Georgia, serif" font-weight="700" font-size="62" fill="${ink}">recorded safety</text>

  <text x="66" y="392" font-family="Georgia, serif" font-weight="700" font-size="132" fill="${rule}">${Math.round(fit.r2 * 100)}%</text>
  <text x="70" y="440" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="${inkSoft}">of how safe people feel is explained by</text>
  <text x="70" y="474" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="${inkSoft}">the recorded homicide rate.</text>

  <text x="66" y="552" font-family="Helvetica, Arial, sans-serif" font-size="24" fill="${inkMuted}">${fit.n} countries · Gallup World Poll, UNODC, U.S. State Department</text>

  ${gridLines}
  ${fitLine}
  ${dots}
  <text x="${X0}" y="${Y1 + 34}" font-family="Helvetica, Arial, sans-serif" font-size="20" fill="${inkMuted}">homicides per 100k (log) →</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(OUT);
console.log("Wrote", OUT);
