// src/lib/mark.js
//
// The mark (Brand Guide section 4): a solid C for the contact center, a second C of bars for the voice of the customer on
// every channel, and the X where they meet. One geometry feeds every place the mark is drawn: the header and footer
// (Shell.jsx), the favicon (scripts/favicon.mjs writes public/favicon.svg) and the report masthead (ReportExport.jsx).
// mark.test.mjs pins the geometry and proves each of those draws from here.
//
// Coordinates sit on a 120 unit box centred on 0,0. The C opens 57 degrees either side of the right-hand axis; the bars
// sit on radius 42 across 230 degrees, never inside 32 or outside 52, their lengths an uneven speech rhythm. Below 40
// pixels the small drawing takes over: nine heavier bars and a heavier C and X, because seventeen bars blur together.
import { HOUSE } from "./tokens.js";

export const MARK = {
  full: { cR: 24, cW: 6.5, tip: 57, barR: 42, barW: 3.4, span: 230, x: 9, xW: 6.5,
    bars: [2, 5, 3, 7, 4, 9, 6, 10, 5, 8, 10, 6, 8, 3, 6, 2.5, 1.5] },
  small: { cR: 24, cW: 9, tip: 57, barR: 42, barW: 6, span: 230, x: 9.5, xW: 9,
    bars: [4, 7, 5, 9.5, 7, 9.5, 5.5, 7.5, 3.5] },
};
export const SMALL_BELOW = 40;
export const geometryFor = (size) => (size < SMALL_BELOW ? MARK.small : MARK.full);

/* Everyday colours: mist C with the voice and X in sky on the house; ink C with the voice and X in action blue on paper. */
export const EVERYDAY = {
  dark: { c: HOUSE.mist, voice: HOUSE.sky, x: HOUSE.sky },
  paper: { c: HOUSE.paperInk, voice: HOUSE.action, x: HOUSE.action },
};

const r2 = (n) => Math.round(n * 100) / 100;

/** The drawing as data: the C path, one entry per bar (a horizontal line on the left, then rotated), the X path. */
export function markParts(g = MARK.full) {
  const t = (g.tip * Math.PI) / 180;
  const cx = r2(g.cR * Math.cos(t)), cy = r2(g.cR * Math.sin(t));
  const step = g.span / (g.bars.length - 1), start = -g.span / 2;
  return {
    c: `M ${cx},${-cy} A ${g.cR} ${g.cR} 0 1 0 ${cx},${cy}`,
    bars: g.bars.map((h, i) => ({ x1: r2(-(g.barR + h)), x2: r2(-(g.barR - h)), rot: r2(start + step * i) })),
    x: `M ${-g.x},${-g.x} L ${g.x},${g.x} M ${g.x},${-g.x} L ${-g.x},${g.x}`,
    cW: g.cW, barW: g.barW, xW: g.xW,
  };
}

/** The mark as an SVG string, for places outside React (the favicon, the report window). `voices` colours the bars in turn. */
export function markSvg({ c, voice, x, voices }, { size = 30, geometry = geometryFor(size), attrs = "" } = {}) {
  const p = markParts(geometry), vs = voices && voices.length ? voices : [voice];
  const bars = p.bars.map((b, i) => `<line x1="${b.x1}" y1="0" x2="${b.x2}" y2="0" transform="rotate(${b.rot})" stroke="${vs[i % vs.length]}"/>`).join("");
  return `<svg width="${size}" height="${size}" viewBox="-60 -60 120 120"${attrs ? " " + attrs : ""}><g fill="none" stroke-linecap="round">` +
    `<path d="${p.c}" stroke="${c}" stroke-width="${p.cW}"/><g stroke-width="${p.barW}">${bars}</g>` +
    `<path d="${p.x}" stroke="${x}" stroke-width="${p.xW}"/></g></svg>`;
}

/** public/favicon.svg: the small drawing, reversed, on a navy tile. */
export function faviconSvg() {
  const inner = markSvg(EVERYDAY.dark, { size: 120, geometry: MARK.small }).replace(/^<svg[^>]*>|<\/svg>$/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="-60 -60 120 120">` +
    `<rect x="-60" y="-60" width="120" height="120" rx="24" fill="${HOUSE.navy}"/><g transform="scale(0.84)">${inner}</g></svg>\n`;
}
