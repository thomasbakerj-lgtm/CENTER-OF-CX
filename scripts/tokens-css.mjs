// scripts/tokens-css.mjs
//
// Writes the Brand Guide tokens into index.html between <!-- TOKENS_START --> and
// <!-- TOKENS_END -->: preload links for the two first-paint weights, the self-hosted
// @font-face rules and the CSS variables. Run after any change to src/lib/tokens.js;
// tokens.test.mjs fails while the block and the module differ.
//
//   node scripts/tokens-css.mjs          rewrite index.html
//   node scripts/tokens-css.mjs --check  exit 1 when index.html is stale

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { tokensBlock } from "../src/lib/tokensBlock.js";

const FILE = fileURLToPath(new URL("../index.html", import.meta.url));
const START = "<!-- TOKENS_START -->", END = "<!-- TOKENS_END -->";
const html = readFileSync(FILE, "utf8");
const a = html.indexOf(START), b = html.indexOf(END);
if (a < 0 || b < a) { console.error("TOKENS markers missing from index.html"); process.exit(1); }
const next = html.slice(0, a + START.length) + "\n" + tokensBlock() + "\n    " + html.slice(b);
if (process.argv.includes("--check")) {
  if (next !== html) { console.error("index.html tokens block is stale: run node scripts/tokens-css.mjs"); process.exit(1); }
  console.log("index.html tokens block is current");
} else {
  writeFileSync(FILE, next);
  console.log("index.html tokens block written");
}
