/* shareCard.js
 *
 * Share cards (P1 task 5): the preview image a link shows on LinkedIn, X, Slack or in a message. One per tool, method
 * and industry page; every other page uses the site card. Pure: this builds the SVG, and the build's prerender turns
 * it into a 1200 x 630 PNG under dist/og/ with a committed font (assets/fonts, Archivo, SIL Open Font License), so the
 * image is served from the site itself and no new host is involved.
 */

export const CARD_W = 1200;
export const CARD_H = 630;

const NAVY = "#0B1D3A";
const ELECTRIC = "#0088DD";
const LIGHT = "#9FD3F5";
const MUTED = "#A9B8CC";

/* The card a page uses, or null for the site card. */
export function cardKind(path) {
  if (/^\/tools\/[a-z0-9-]+$/.test(path)) return "Free tool";
  if (/^\/methodology\/[a-z0-9-]+$/.test(path)) return "Published method";
  if (/^\/industries(\/[a-z0-9-]+){0,2}$/.test(path)) return "Industry intelligence";
  return null;
}

/* File name under /og/ for a page's card. */
export function cardFile(path) {
  return cardKind(path) ? `${path.slice(1).replace(/\//g, "-")}.png` : "site.png";
}

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* Greedy word wrap by an average glyph width; the last kept line ends with an ellipsis when text is cut. Archivo's
   average advance is about 0.55 of the font size for mixed case, so this errs toward shorter lines. */
export function wrap(text, size, width, maxLines) {
  const perLine = Math.max(8, Math.floor(width / (size * 0.56)));
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length <= perLine) { line = next; continue; }
    if (line) lines.push(line);
    line = w.length > perLine ? w.slice(0, perLine - 1) + "…" : w;
    if (lines.length === maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length > maxLines) lines.length = maxLines;
  const used = lines.join(" ").split(/\s+/).length;
  if (used < words.length && lines.length) {
    const last = lines[lines.length - 1].replace(/[\s,;:.]+$/, "");
    lines[lines.length - 1] = (last.length + 1 > perLine ? last.slice(0, perLine - 1) : last) + "…";
  }
  return lines;
}

/* First sentence of a description, for the card's summary line. */
export function firstSentence(desc) {
  const m = String(desc).match(/^(.+?[.!?])(\s|$)/);
  return (m ? m[1] : String(desc)).trim();
}

/* The card's SVG for one page. `title` is the page title without the site suffix. */
export function cardSvg({ kind, title, summary, path }) {
  const k = kind || "Independent CX technology intelligence";
  const titleSize = kind ? 60 : 64;
  const tl = wrap(title, titleSize, 1040, 3);
  const sl = wrap(summary || "", 28, 1040, 2);
  const titleTop = 250;
  const lineH = Math.round(titleSize * 1.14);
  const summaryTop = titleTop + tl.length * lineH + 26;
  const url = `contactcentercx.com${path === "/" ? "" : path}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${CARD_H}" viewBox="0 0 ${CARD_W} ${CARD_H}">
  <rect width="${CARD_W}" height="${CARD_H}" fill="${NAVY}"/>
  <rect x="0" y="0" width="12" height="${CARD_H}" fill="${ELECTRIC}"/>
  <text x="80" y="104" font-family="Archivo" font-weight="700" font-size="26" letter-spacing="4" fill="#FFFFFF">THE CENTER OF <tspan fill="${ELECTRIC}">CX</tspan></text>
  <text x="80" y="170" font-family="Archivo" font-weight="700" font-size="24" letter-spacing="2" fill="${LIGHT}">${esc(k.toUpperCase())}</text>
  ${tl.map((l, i) => `<text x="80" y="${titleTop + i * lineH}" font-family="Archivo" font-weight="700" font-size="${titleSize}" fill="#FFFFFF">${esc(l)}</text>`).join("\n  ")}
  ${sl.map((l, i) => `<text x="80" y="${summaryTop + 12 + i * 38}" font-family="Archivo" font-weight="400" font-size="28" fill="${MUTED}">${esc(l)}</text>`).join("\n  ")}
  <rect x="80" y="${CARD_H - 92}" width="72" height="4" fill="${ELECTRIC}"/>
  <text x="80" y="${CARD_H - 50}" font-family="Archivo" font-weight="400" font-size="24" fill="${MUTED}">${esc(url)}</text>
</svg>`;
}
