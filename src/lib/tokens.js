// src/lib/tokens.js
//
// Brand Guide 1.0 (docs/BRAND_GUIDE.md) as data. Redesign Phase 2.
//
// One source for colour, type, space, radius and motion. Pages migrated to the new
// design read these values or the CSS variables generated from them (cssVars below,
// written into index.html between the TOKENS markers). tokens.test.mjs checks every
// value here against the Brand Guide tables, checks text contrast, and fails on a
// hard-coded colour in any file listed as migrated.

/* ------------------------------------------------------------------ colour */

// The house. Navy holds every page; colour marks territory, under a tenth of a screen.
export const HOUSE = {
  ink: "#07111F",      // page background
  navy: "#0B1D3A",     // surfaces, cards
  surface: "#13284A",  // raised controls
  mist: "#EAF0F7",     // primary text on dark
  body: "#C5D2E2",     // long-form secondary text on dark (design canvas; between mist and muted)
  muted: "#9FB0C6",    // captions, labels
  action: "#0072BB",   // primary button fill
  electric: "#0088DD", // Diagnostics fill, focus ring
  sky: "#00AAFF",      // the X in the mark
  sky2: "#6CC8FF",     // links and emphasis on dark
  paper: "#FFFFFF",    // report page
  paper2: "#F2F5F9",   // report panels
  paperInk: "#0B1D3A", // report text
};

// The five pillars. fill is the door and the one primary button on that pillar's
// pages; onDark is its text colour on the house; onLight its text colour on paper.
export const PILLARS = {
  diagnostics: { name: "Diagnostics", fill: "#0088DD", onDark: "#6CC8FF", onLight: "#005C99", soon: false },
  vendors: { name: "Vendor Intelligence", fill: "#12B5A6", onDark: "#4FD8C9", onLight: "#0B766C", soon: false },
  industries: { name: "Industry Insights", fill: "#F5A524", onDark: "#FFC46B", onLight: "#8A5A00", soon: false },
  research: { name: "Research", fill: "#8B6CFF", onDark: "#B7A4FF", onLight: "#5B3FD1", soon: true },
  marketWatch: { name: "Market Watch", fill: "#F0508C", onDark: "#FF8DB5", onLight: "#B01E58", soon: true },
};

// The seven layers, top of the stack first. Only on the stack, its legend and layer
// chips. Plain name first; the technical name is the one Platform Decision's model uses.
export const LAYERS = [
  { id: "l7", n: 7, color: "#9B7BFF", name: "Measure and govern", technical: "Analytics + Governance" },
  { id: "l6", n: 6, color: "#3D9BFF", name: "Route the work", technical: "Routing + Orchestration" },
  { id: "l5", n: 5, color: "#2BC8D9", name: "Hold the conversation", technical: "Conversation Management" },
  { id: "l4", n: 4, color: "#3DDC97", name: "Decide the next step", technical: "Reasoning + Planning" },
  { id: "l3", n: 3, color: "#F2D045", name: "Set the rules", technical: "Policy + Guardrails" },
  { id: "l2", n: 2, color: "#FF9A3D", name: "Do the work", technical: "Workflow Execution" },
  { id: "l1", n: 1, color: "#FF5C7A", name: "Know the customer", technical: "Data Access" },
];

// The evidence mark. The colour names the question, never the answer.
export const ARCS = {
  evidence: "#6CC8FF",
  realization: "#0088DD",
  completeness: "#EAF0F7",
};

// Findings, inside tools and reports only, always with a word and an icon (Brand Guide
// section 6). Critical and clear are fills with ink text on dark and white text on paper;
// high is an outline; unknown is a dashed outline and never red.
export const FINDINGS = {
  critical: { dark: "#FF4757", print: "#C4162A", form: "fill" },
  high: { dark: "#FF6B78", print: "#C4162A", form: "outline" },
  unknown: { dark: "#EAF0F7", print: "#0B1D3A", form: "dashed" },
  clear: { dark: "#22D38A", print: "#0B7A4B", form: "fill" },
};

/* -------------------------------------------------------------------- type */

export const FONT_SANS = "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
export const FONT_CONDENSED = "'IBM Plex Sans Condensed', 'IBM Plex Sans', -apple-system, sans-serif";
export const FONT_MONO = "'IBM Plex Mono', ui-monospace, 'SFMono-Regular', Menlo, monospace";

// Brand Guide section 9. Sizes in px; tracking in em.
export const TYPE_SCALE = {
  figure: { size: 96, weight: 700, tracking: "-0.03em", line: 1 },
  display: { size: 72, weight: 700, tracking: "-0.025em", line: 1 },
  h1: { size: 44, weight: 700, tracking: "-0.02em", line: 1.08 },
  h2: { size: 28, weight: 600, tracking: "-0.01em", line: 1.2 },
  h3: { size: 18, weight: 600, tracking: "0", line: 1.35 },
  body: { size: 17, weight: 400, tracking: "0", line: 1.6 },
  small: { size: 14, weight: 400, tracking: "0", line: 1.5 },
  label: { size: 12, weight: 500, tracking: "0.18em", line: 1.4, upper: true },
};

// The self-hosted files in public/fonts (OFL, see public/fonts/OFL.txt). Same origin,
// so the site policy needs no font host.
export const FONT_FILES = [
  { family: "IBM Plex Sans", weight: 400, style: "normal", file: "plex-sans-400.woff2", preload: true },
  { family: "IBM Plex Sans", weight: 400, style: "italic", file: "plex-sans-400-italic.woff2" },
  { family: "IBM Plex Sans", weight: 500, style: "normal", file: "plex-sans-500.woff2" },
  { family: "IBM Plex Sans", weight: 600, style: "normal", file: "plex-sans-600.woff2", preload: true },
  { family: "IBM Plex Sans", weight: 700, style: "normal", file: "plex-sans-700.woff2" },
  { family: "IBM Plex Sans Condensed", weight: 400, style: "normal", file: "plex-sans-condensed-400.woff2" },
  { family: "IBM Plex Sans Condensed", weight: 600, style: "normal", file: "plex-sans-condensed-600.woff2" },
  { family: "IBM Plex Mono", weight: 400, style: "normal", file: "plex-mono-400.woff2" },
  { family: "IBM Plex Mono", weight: 600, style: "normal", file: "plex-mono-600.woff2" },
];

export function fontFaceCss() {
  return FONT_FILES.map(f =>
    `@font-face{font-family:'${f.family}';font-style:${f.style};font-weight:${f.weight};font-display:swap;src:url(/fonts/${f.file}) format('woff2')}`
  ).join("");
}

/* ------------------------------------------------------- space, radius, motion */

export const SPACE = [4, 8, 12, 16, 24, 32, 48, 72];
export const RADIUS = { chip: 6, field: 12, card: 18, pill: 999 };
export const MOTION = {
  press: "180ms",
  count: "450ms",
  draw: "1600ms",
  curve: "cubic-bezier(0.2, 0.8, 0.2, 1)",
};
export const TOUCH = 44;

/* ------------------------------------------------------------ CSS variables */

// Written into index.html between <!-- TOKENS_START --> and <!-- TOKENS_END -->
// by `node scripts/tokens-css.mjs`; tokens.test.mjs fails when the two differ.
export function cssVars() {
  const v = [];
  for (const [k, c] of Object.entries(HOUSE)) v.push(`--cx-${k}:${c}`);
  for (const [k, p] of Object.entries(PILLARS)) v.push(`--cx-${k}:${p.fill}`, `--cx-${k}-on-dark:${p.onDark}`, `--cx-${k}-on-light:${p.onLight}`);
  for (const l of LAYERS) v.push(`--cx-${l.id}:${l.color}`);
  for (const [k, c] of Object.entries(ARCS)) v.push(`--cx-arc-${k}:${c}`);
  for (const [k, f] of Object.entries(FINDINGS)) v.push(`--cx-${k}:${f.dark}`, `--cx-${k}-print:${f.print}`);
  v.push(`--cx-font:${FONT_SANS}`, `--cx-font-condensed:${FONT_CONDENSED}`, `--cx-font-mono:${FONT_MONO}`);
  SPACE.forEach((s, i) => v.push(`--cx-space-${i + 1}:${s}px`));
  for (const [k, r] of Object.entries(RADIUS)) v.push(`--cx-radius-${k}:${r}px`);
  v.push(`--cx-press:${MOTION.press}`, `--cx-count:${MOTION.count}`, `--cx-draw:${MOTION.draw}`, `--cx-curve:${MOTION.curve}`);
  return `:root{${v.join(";")}}`;
}

/* ---------------------------------------------------------------- contrast */

// WCAG 2 relative luminance and contrast ratio, used by the token test and available
// to components that pick a text colour for a fill.
export function luminance(hex) {
  const n = hex.replace("#", "");
  const c = [0, 2, 4].map(i => parseInt(n.slice(i, i + 2), 16) / 255)
    .map(x => (x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

export function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

// Text to set on a pillar fill: ink when it reads at 4.5 or better, else white.
export function onFill(fill) {
  return contrast(fill, HOUSE.ink) >= 4.5 ? HOUSE.ink : "#FFFFFF";
}
