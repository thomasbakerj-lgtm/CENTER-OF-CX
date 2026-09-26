// src/lib/type.js
//
// The type system. One file, so a brand change is one edit rather than thirty.
//
// IBM Plex Sans (Brand Guide 1.0, section 9; adopted in redesign Phase 2). One
// family carries the hierarchy through size, weight, letterspacing and colour, decided
// once here so thirty tool files do not each improvise. Import the tokens; do not
// hand-write font-family anywhere. Plex Sans Condensed serves wide tables; Plex Mono
// serves formulas. The files are self-hosted in public/fonts (see src/lib/tokens.js).

import { FONT_SANS, FONT_CONDENSED, FONT_MONO, fontFaceCss } from "./tokens.js";

/* ------------------------------------------------------------------ stacks */

export const FONT = FONT_SANS;

// Reserved for wide tables that need to fit more columns. Same design, narrower.
export const FONT_NARROW = FONT_CONDENSED;

// Formulas and code-like figures on method pages.
export const FONT_MONO_STACK = FONT_MONO;

// The @font-face rules every page's stylesheet carries. Same-origin files, so no page
// asks a font host for anything. index.html carries the same rules for first paint.
export const FONT_IMPORT_CSS = fontFaceCss();

/* ------------------------------------------------------------------ weights */

export const W = {
  regular: 400,   // body copy, table cells, hints
  medium: 500,    // emphasised values, active states
  semibold: 600,  // headings, stat values, labels
  bold: 700,      // display only, used sparingly
};

/* -------------------------------------------------------------------- scale */
//
// Negative letterspacing on large sizes is not decoration. A grotesque set at
// 24px and above reads loose at default tracking, which is the single most
// common way a single-family system looks unfinished. The tighter the size,
// the more it needs.

export const TYPE = {
  // Page title. One per page.
  display: { fontFamily: FONT, fontSize: 30, fontWeight: W.semibold, letterSpacing: "-0.7px", lineHeight: 1.12 },

  // Tool title, section opener.
  h1: { fontFamily: FONT, fontSize: 24, fontWeight: W.semibold, letterSpacing: "-0.4px", lineHeight: 1.18 },

  // Card and block headings.
  h2: { fontFamily: FONT, fontSize: 18, fontWeight: W.semibold, letterSpacing: "-0.2px", lineHeight: 1.3 },
  h3: { fontFamily: FONT, fontSize: 15, fontWeight: W.semibold, letterSpacing: "-0.1px", lineHeight: 1.4 },

  // The big number on a stat card. Tabular by construction: these sit in
  // columns and must align.
  statValue: { fontFamily: FONT, fontSize: 26, fontWeight: W.semibold, letterSpacing: "-0.5px", lineHeight: 1.1, fontVariantNumeric: "tabular-nums" },
  statValueLg: { fontFamily: FONT, fontSize: 34, fontWeight: W.semibold, letterSpacing: "-0.8px", lineHeight: 1.05, fontVariantNumeric: "tabular-nums" },

  // Body copy and analyst prose.
  body: { fontFamily: FONT, fontSize: 14, fontWeight: W.regular, lineHeight: 1.65 },
  bodySm: { fontFamily: FONT, fontSize: 12.5, fontWeight: W.regular, lineHeight: 1.6 },

  // Form labels.
  label: { fontFamily: FONT, fontSize: 12, fontWeight: W.semibold, lineHeight: 1.4 },

  // The uppercase eyebrow above a heading, and stat-card captions.
  eyebrow: { fontFamily: FONT, fontSize: 11, fontWeight: W.semibold, letterSpacing: "1.6px", textTransform: "uppercase", lineHeight: 1.4 },

  // Hints under inputs, footnotes, disclaimers.
  caption: { fontFamily: FONT, fontSize: 12, fontWeight: W.regular, lineHeight: 1.5 },

  // Any cell that holds a number. Always tabular.
  cell: { fontFamily: FONT, fontSize: 12.5, fontWeight: W.regular, lineHeight: 1.5 },
  cellNum: { fontFamily: FONT, fontSize: 12.5, fontWeight: W.medium, lineHeight: 1.5, fontVariantNumeric: "tabular-nums" },
};

/* ---------------------------------------------------------------- numerals */
//
// Spread onto anything that renders a figure. Proportional digits make a 1
// narrower than a 0, so currency columns fail to align on the comma. Every
// reconciliation table in this platform depends on a reader adding a column
// and getting the stated total; digits that drift work against that.

export const NUM = { fontVariantNumeric: "tabular-nums" };

/* -------------------------------------------------------- helper for style */

/** Merge a scale token with overrides. `t("h2", { color: NAVY })` */
export function t(key, extra) {
  const base = TYPE[key];
  if (!base) throw new Error("unknown type token: " + key);
  return extra ? { ...base, ...extra } : { ...base };
}
