// src/lib/tokensBlock.js
//
// The head block index.html carries for the Brand Guide tokens (see scripts/tokens-css.mjs).
// Kept apart from tokens.js so the browser bundle never ships this string builder.

import { FONT_FILES, fontFaceCss, cssVars } from "./tokens.js";

export function tokensBlock() {
  const pre = FONT_FILES.filter(f => f.preload)
    .map(f => `    <link rel="preload" href="/fonts/${f.file}" as="font" type="font/woff2" crossorigin />`);
  return [...pre, `    <style>${fontFaceCss()}${cssVars()}</style>`].join("\n");
}
