// scripts/favicon.mjs
//
// Writes public/favicon.svg from the mark's one geometry (src/lib/mark.js). Run after any change to the mark;
// mark.test.mjs fails while the file and the module differ.
//
//   node scripts/favicon.mjs          rewrite public/favicon.svg
//   node scripts/favicon.mjs --check  exit 1 when public/favicon.svg is stale

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { faviconSvg } from "../src/lib/mark.js";

const FILE = fileURLToPath(new URL("../public/favicon.svg", import.meta.url));
const next = faviconSvg();
if (process.argv.includes("--check")) {
  if (readFileSync(FILE, "utf8") !== next) { console.error("public/favicon.svg is stale: run node scripts/favicon.mjs"); process.exit(1); }
  console.log("public/favicon.svg is current");
} else {
  writeFileSync(FILE, next);
  console.log("public/favicon.svg written");
}
