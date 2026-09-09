/* chunk.test.mjs
 *
 * Reachability gate for the entry chunk.
 *
 * Before 10-01 every route component and every data file was a static import in
 * App.jsx, so a stranger opening any page downloaded 2,921,160 bytes of
 * JavaScript, roughly 742 kB across the wire, before anything rendered. On the
 * majority-mobile traffic this site actually receives, that is the largest
 * single defect on the platform: correct titles and working instrumentation are
 * worth nothing to somebody who left during the download.
 *
 * Route-level React.lazy fixed it once. This file is what stops it coming back.
 * A bundle regression is invisible in code review, produces no failing
 * assertion anywhere else in the suite, and is discovered by users rather than
 * by the build. So the ceiling is asserted, not observed.
 *
 * The harness builds the app itself through vite's JS API with an inline plugin
 * that records which modules rollup placed in which chunk. That module map is
 * the point. A size ceiling alone can be satisfied by a build that has quietly
 * pinned a data file and shed something else, so section C asserts composition
 * directly rather than inferring it from a number.
 *
 * Run from repo root: node chunk.test.mjs
 */
import { build } from "vite";
import react from "@vitejs/plugin-react";
import { gzipSync } from "node:zlib";
import { readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = "dist-gate";

let pass = 0, fail = 0;
const failures = [];
const ok = (nm, c) => { if (c) pass++; else { fail++; failures.push(nm); } };
const eq = (nm, a, b) => ok(`${nm} (got ${a}, want ${b})`, a === b);
const section = (s) => console.log(`\n${s}`);

/* ------------------------------------------------------------- the ceiling */

/*
 * Two ceilings, because they fail for different reasons. Gzip is what crosses
 * the wire and is what a stranger on 4G waits for. Raw is what the main thread
 * parses and compiles after it lands, which is the part that stalls a mid-range
 * Android even on a fast connection. A regression can move either one.
 *
 * The numbers are argued, not rounded.
 *
 * Measured entry at the close of 10-01: 230,041 bytes raw, 74,681 gzipped.
 *
 * Headroom has to sit between two hard edges. Too little and ordinary edits to
 * the four modules legitimately in the entry chunk fail the build for no
 * reason. src/lib/seo.js carries a generated vendor map, currently 282 entries
 * in 38,203 bytes, roughly 135 raw bytes per vendor, so the shell genuinely
 * grows as the catalogue does. Too much headroom and the gate stops seeing the
 * defect it exists to catch.
 *
 * The defect to catch is a data file or route component finding its way back
 * into the entry chunk. The smallest thing that can do that is
 * AgentAssistData.js at 8,931 bytes raw, 3,100 gzipped. Headroom is set at two
 * thirds of that on each measure, which absorbs roughly forty new vendors'
 * worth of seo map growth plus normal shell edits, and still trips on the
 * smallest possible re-pin with a third of the margin to spare.
 *
 * When the shell legitimately outgrows this, raise it deliberately and rewrite
 * this paragraph. Do not raise it to make a build pass.
 */
const BASE_RAW = 230041;
const BASE_GZ = 74681;
const SMALLEST_SPLIT_RAW = 8931;
const SMALLEST_SPLIT_GZ = 3100;
const RAW_CEILING = BASE_RAW + Math.floor((SMALLEST_SPLIT_RAW * 2) / 3);   // 235,995
const GZ_CEILING = BASE_GZ + Math.floor((SMALLEST_SPLIT_GZ * 2) / 3);      // 76,747

/* ----------------------------------------------------------------- measure */

const chunkOf = new Map();   // module id, relative to root -> chunk file name
let entryName = null;

await build({
  root: ROOT,
  logLevel: "silent",
  build: { outDir: OUT, emptyOutDir: true },
  plugins: [
    react(),
    {
      name: "chunk-gate-measure",
      generateBundle(_opts, bundle) {
        for (const [name, ch] of Object.entries(bundle)) {
          if (ch.type !== "chunk") continue;
          if (ch.isEntry) entryName = name;
          for (const id of Object.keys(ch.modules)) {
            chunkOf.set(id.replace(`${ROOT}/`, ""), name);
          }
        }
      },
    },
  ],
});

const entryPath = `${ROOT}/${OUT}/${entryName}`;
const entryBytes = readFileSync(entryPath);
const raw = entryBytes.length;
const gz = gzipSync(entryBytes, { level: 9 }).length;

const inEntry = [...chunkOf.entries()].filter(([, c]) => c === entryName).map(([m]) => m);
const isNodeModule = (m) => m.startsWith("node_modules") || m.startsWith("\u0000");
const localInEntry = inEntry.filter((m) => !isNodeModule(m));

console.log(`entry chunk: ${entryName}`);
console.log(`  raw  ${raw.toLocaleString()} bytes   ceiling ${RAW_CEILING.toLocaleString()}`);
console.log(`  gzip ${gz.toLocaleString()} bytes   ceiling ${GZ_CEILING.toLocaleString()}`);
console.log(`  local modules in entry: ${localInEntry.length}   total chunks: ${new Set(chunkOf.values()).size}`);

/* --------------------------------------------------- A. the entry resolved */

section("A. the build produced a single identifiable entry");
ok("A1  an entry chunk was emitted", !!entryName);
ok("A2  the entry chunk is on disk and non-empty", raw > 0);
ok("A3  the build actually split, rather than emitting one chunk", new Set(chunkOf.values()).size > 20);

/* ------------------------------------------------------------ B. the gates */

section("B. entry chunk stays under its argued ceiling");
ok(`B1  raw entry ${raw.toLocaleString()} <= ${RAW_CEILING.toLocaleString()}`, raw <= RAW_CEILING);
ok(`B2  gzipped entry ${gz.toLocaleString()} <= ${GZ_CEILING.toLocaleString()}`, gz <= GZ_CEILING);

/*
 * A ceiling with no floor is half a gate. If the entry collapses far below the
 * recorded baseline, something that belongs in the shell has been split out of
 * it, and the likely casualty is the router or the SEO manager. That is a
 * different defect, not a win, and it should be looked at rather than silently
 * accepted as an improvement.
 */
ok(`B3  raw entry ${raw.toLocaleString()} has not collapsed below half the baseline`, raw > BASE_RAW / 2);

/* -------------------------------------------------------- C. composition */

section("C. the entry chunk carries the shell and nothing else");

const dataInEntry = localInEntry.filter((m) => /Data\.js$/.test(m));
/* main.jsx and App.jsx are the shell itself and belong here. src/lib/ holds two
   shared presentational primitives, InfoDot and NumField, which are pulled in by
   tools rather than being routes. Everything else with a .jsx extension is a
   route component and must not be in the entry chunk. */
const SHELL_JSX = new Set(["App.jsx", "main.jsx"]);
const routesInEntry = localInEntry.filter((m) => /\.jsx$/.test(m) && !m.startsWith("src/lib/") && !SHELL_JSX.has(m));

eq("C1  no vendor or vertical data file is pinned in the entry", dataInEntry.length, 0);
eq("C2  no route component is pinned in the entry", routesInEntry.length, 0);
ok("C3  App.jsx is in the entry, as the root shell", inEntry.includes("App.jsx"));
ok("C4  src/lib/seo.js is in the entry, reached from the shell", inEntry.includes("src/lib/seo.js"));
ok("C5  src/lib/track.js is in the entry, so tracking ships before any route", inEntry.includes("src/lib/track.js"));

/*
 * The standing rule from 8-04, now enforced from the other side. seo.js is
 * reached from App.jsx and can never be lazy-loaded, so a data import there
 * pins the whole catalogue into the entry chunk and undoes this item.
 */
const seoSrc = readFileSync(`${ROOT}/src/lib/seo.js`, "utf8");
const trackSrc = readFileSync(`${ROOT}/src/lib/track.js`, "utf8");
const importsData = (s) => /from\s+["'][^"']*Data(\.js)?["']/.test(s);
ok("C6  src/lib/seo.js imports no data file", !importsData(seoSrc));
ok("C7  src/lib/track.js imports no data file", !importsData(trackSrc));

/* ------------------------------- D. the boundary does not swallow tool_view */

section("D. tool_view survives the lazy boundary");

/*
 * Journey is the single call site for tool_view. It reads the path from the
 * router and fires on navigation. If it had ended up inside the Suspense
 * boundary, every tool view would be delayed by a chunk fetch and any view
 * abandoned during that fetch would never be recorded at all, which is exactly
 * the population the instrumentation exists to see.
 *
 * Three separate proofs, because the structural one alone is an argument about
 * source and the size one alone is an argument about bytes.
 */

const appSrc = readFileSync(`${ROOT}/App.jsx`, "utf8");
const iJourney = appSrc.indexOf("<Journey />");
const iSuspense = appSrc.indexOf("<Suspense");
const iSuspenseEnd = appSrc.indexOf("</Suspense>");

ok("D1  App.jsx renders <Journey />", iJourney > -1);
ok("D2  App.jsx opens a Suspense boundary", iSuspense > -1 && iSuspenseEnd > iSuspense);
ok("D3  Journey is a sibling above the boundary, not inside it", iJourney < iSuspense);
ok("D4  Journey calls trackTool.view", /trackTool\.view\(/.test(appSrc));

/* The tracking code is in the entry chunk, so it is parsed and running before
   any route chunk has been requested. Asserted against the built output rather
   than the source. */
const entryText = entryBytes.toString("utf8");
ok("D5  the tool_view event name ships in the entry chunk", entryText.includes("tool_view"));

/* Behavioural. The real trackTool against the real path resolver, for every
   tool route in the sitemap, with the transport captured. A route being lazy
   changes none of this, which is the point. */
const { trackTool, toolIdFromPath, CONFIG } = await import("./src/lib/track.js");

const realWindow = globalThis.window;
const realNavigator = globalThis.navigator;
const sent = [];
const captureNav = { sendBeacon: (u, b) => { sent.push({ u, b }); return true; } };
const key0 = CONFIG.key;
CONFIG.key = "phc_chunk_gate";

/* Every lazily loaded tool route in App.jsx, taken from the routes themselves
   so a new tool cannot quietly escape this check. */
const toolPaths = [...appSrc.matchAll(/path="(\/tools\/[a-z0-9-]+)"/g)].map((m) => m[1]);
ok(`D6  tool routes found in App.jsx (${toolPaths.length})`, toolPaths.length >= 25);

let fired = 0;
let resolved = 0;
for (const p of toolPaths) {
  if (toolIdFromPath(p)) resolved++;
  globalThis.window = { location: { pathname: p } };
  try {
    Object.defineProperty(globalThis, "navigator", { value: captureNav, configurable: true, writable: true });
  } catch { /* locked navigator; the fetch path is exercised instead */ }
  sent.length = 0;
  const id = toolIdFromPath(p);
  if (id) trackTool.view(id);
  if (sent.length === 1) fired++;
}
globalThis.window = realWindow;
try {
  Object.defineProperty(globalThis, "navigator", { value: realNavigator, configurable: true, writable: true });
} catch { /* noop */ }
CONFIG.key = key0;

eq("D7  every tool route resolves to a tool id", resolved, toolPaths.length);
eq("D8  every tool route emits exactly one tool_view beacon", fired, toolPaths.length);

/* Each tool route component is behind its own boundary, so a view recorded
   above the boundary is recorded before the chunk that would have delayed it. */
const lazyToolChunks = new Set(
  [...chunkOf.entries()]
    .filter(([m]) => /Calculator\.jsx$|Diagnostic\.jsx$|Builder\.jsx$/.test(m))
    .map(([, c]) => c)
);
ok("D9  tool components live outside the entry chunk", !lazyToolChunks.has(entryName) && lazyToolChunks.size > 0);

/* -------------------------------------------------------------- E. hygiene */

section("E. house rules");
const EMDASH = String.fromCharCode(0x2014);
const ENDASH = String.fromCharCode(0x2013);
const self = readFileSync(fileURLToPath(import.meta.url), "utf8");
eq("E1  App.jsx carries no em-dash", appSrc.split(EMDASH).length - 1, 0);
eq("E2  App.jsx carries no en-dash", appSrc.split(ENDASH).length - 1, 0);
eq("E3  this harness carries no em-dash", self.split(EMDASH).length - 1, 0);

/* ------------------------------------------------------------------ report */

rmSync(`${ROOT}/${OUT}`, { recursive: true, force: true });

if (failures.length) {
  console.log("\nFAILURES");
  for (const f of failures.slice(0, 40)) console.log(`  ${f}`);
  if (failures.length > 40) console.log(`  ...and ${failures.length - 40} more`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
