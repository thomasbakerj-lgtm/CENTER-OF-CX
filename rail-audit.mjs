/* rail-audit.mjs
 *
 * Static, whole-codebase audit for The Center of CX. It answers, without a browser and
 * without clicking through a single tool, the question that gates every lock:
 *
 *   Does any tool pull a rail key that no tool publishes?
 *
 * railReport().orphanPulls answers that at runtime, but only for the tools you happened
 * to visit in one session. This does it statically, for all tools at once, by reading
 * every publishToolResult and every getPrimitive across the repo and diffing them against
 * your REAL metric registry. It imports metrics.js directly, so alias resolution and
 * registration are computed by the same code the app runs, never reconstructed.
 *
 * Publish detection resolves three shapes: an inline object, an object wrapped in
 * normalizeForPublish, and a payload built in a const variable and handed to publish.
 * The normalizeForPublish options object ({ sourceTool }) is recognised and skipped.
 *
 * It also runs three cheap hygiene checks while the files are in hand: em-dashes (your
 * sitewide zero rule), track.js instrumentation adoption, and references to dead files.
 *
 * USAGE
 *   Local, from the repo root (the whole repo is on disk, so this is complete):
 *     node rail-audit.mjs
 *
 *   Remote, from anywhere (fetches the tools it knows about from GitHub raw):
 *     node rail-audit.mjs --remote
 *
 * EXIT CODE is the number of orphan pulls, so this can gate a lock in a script:
 *     node rail-audit.mjs && echo "rail clean"
 */

import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const REMOTE = process.argv.includes("--remote");
const VERBOSE = process.argv.includes("--verbose");
const RAW = "https://raw.githubusercontent.com/thomasbakerj-lgtm/CENTER-OF-CX/main";

/* Files the remote mode fetches. Local mode ignores this and globs the disk instead,
   so local is always complete and this list only bounds the networked convenience path. */
const REMOTE_FILES = [
  "src/lib/metrics.js", "src/lib/toolData.js", "index.html",
  "TCOCalculator.jsx", "StaffingCalculator.jsx", "ShrinkagePlanner.jsx",
  "OccupancyRiskSimulator.jsx", "ForecastAccuracyTracker.jsx", "ScheduleAdherenceCalculator.jsx",
  "AttritionCostCalculator.jsx", "CostPerContactCalculator.jsx", "AIDeflectionRealityCheck.jsx",
  "ChannelShiftModel.jsx", "LicenseBundleGapChecker.jsx", "AHTDecomposition.jsx",
  "AgentExperienceDiagnostic.jsx", "QAScorecardBuilder.jsx", "FCRLeakageDiagnostic.jsx",
  "CalibrationDriftChecker.jsx", "VendorMatchEngine.jsx", "PlatformDecisionMatrix.jsx",
  "ContractRiskScanner.jsx", "TransformationReadiness.jsx", "RFPRequirementBuilder.jsx",
  "CXMaturity.jsx", "AIReadiness.jsx", "ExperienceScorecard.jsx", "CXITAlignment.jsx",
  "GovernanceModel.jsx", "ServiceDesign.jsx", "RoadmapBuilder.jsx", "IntegrationPlanner.jsx",
  "BusinessCaseBuilder.jsx", "HumanPremium.jsx",
];

const DEAD_FILES = ["ToolGate", "GatedReport"]; // flagged dead; any import is a defect

async function loadFiles() {
  const files = new Map(); // path -> source
  if (REMOTE) {
    for (const rel of REMOTE_FILES) {
      try {
        const res = await fetch(`${RAW}/${rel}`);
        if (res.ok) files.set(rel, await res.text());
        else console.error(`  (skip ${rel}: HTTP ${res.status})`);
      } catch (e) { console.error(`  (skip ${rel}: ${e.message})`); }
    }
    return files;
  }
  // Local: every .jsx at root, every .js under src/lib, plus index.html.
  for (const f of readdirSync(".")) {
    if (f.endsWith(".jsx") || f === "index.html") files.set(f, readFileSync(f, "utf8"));
  }
  const lib = "src/lib";
  if (existsSync(lib)) for (const f of readdirSync(lib)) {
    if (f.endsWith(".js")) files.set(join(lib, f), readFileSync(join(lib, f), "utf8"));
  }
  return files;
}

/* Import the REAL registry so alias resolution and registration match the running app.
   In remote mode we fetch it to a temp module; in local mode we import from disk. */
async function loadMetrics(files) {
  const src = files.get("src/lib/metrics.js");
  if (!src) { console.error("metrics.js not found. Run from the repo root, or use --remote."); process.exit(2); }
  const { writeFileSync } = await import("fs");
  const tmp = join(process.cwd(), ".rail-audit-metrics.mjs");
  writeFileSync(tmp, src);
  const m = await import("file://" + tmp);
  return m;
}

/* --- extraction ------------------------------------------------------------------ */

/* Balanced-bracket helpers, string-aware. */
function matchFrom(src, openIdx, open, close) {
  let depth = 0, str = null;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i], p = src[i - 1];
    if (str) { if (c === str && p !== "\\") str = null; continue; }
    if (c === '"' || c === "'" || c === "`") { str = c; continue; }
    if (c === open) depth++;
    else if (c === close) { depth--; if (depth === 0) return i + 1; }
  }
  return -1;
}
function topLevelKeys(body) {
  const keys = new Set();
  let d = 0, str = null;
  for (let k = 0; k < body.length; k++) {
    const c = body[k], p = body[k - 1];
    if (str) { if (c === str && p !== "\\") str = null; continue; }
    if (c === '"' || c === "'" || c === "`") { str = c; continue; }
    if (c === "{" || c === "[" || c === "(") d++;
    else if (c === "}" || c === "]" || c === ")") d--;
    else if (d === 0 && c === ":") {
      let e = k - 1; while (e >= 0 && /\s/.test(body[e])) e--;
      let st = e; while (st >= 0 && /[A-Za-z0-9_$]/.test(body[st])) st--;
      const id = body.slice(st + 1, e + 1);
      if (id && /^[A-Za-z_$]/.test(id)) keys.add(id);
    }
  }
  return keys;
}
/* Map every `const NAME = { ... }` to its top-level keys, so a publish payload built in a
   variable and handed to normalizeForPublish can be resolved back to its keys. */
function constObjectMap(src) {
  const map = new Map();
  const re = /const\s+([A-Za-z0-9_$]+)\s*=\s*\{/g;
  let m;
  while ((m = re.exec(src))) {
    const brace = src.indexOf("{", m.index);
    const end = matchFrom(src, brace, "{", "}");
    if (end === -1) continue;
    map.set(m[1], topLevelKeys(src.slice(brace + 1, end - 1)));
  }
  return map;
}
/* Publish keys for a file. Handles three shapes:
     A  publishToolResult(id, { ...payload... })
     B  publishToolResult(id, normalizeForPublish({ ...payload... }, { sourceTool }))
     C  const primitives = { ...payload... }; publishToolResult(id, normalizeForPublish(primitives, { sourceTool }))
   The { sourceTool } options object is recognised and skipped. Only identifiers that
   actually appear inside the publish call are resolved to const objects, so unrelated
   const objects like DEFAULTS are never mistaken for a payload. */
function publishKeys(src) {
  const consts = constObjectMap(src);
  const keys = new Set();
  let i = 0;
  while ((i = src.indexOf("publishToolResult(", i)) !== -1) {
    const paren = i + "publishToolResult".length;
    const end = matchFrom(src, paren, "(", ")");
    const call = src.slice(paren + 1, end === -1 ? src.length : end - 1);
    // inline object literals inside the call, skipping the {sourceTool} options object
    let j = 0;
    while ((j = call.indexOf("{", j)) !== -1) {
      const oe = matchFrom(call, j, "{", "}");
      if (oe === -1) break;
      const kk = topLevelKeys(call.slice(j + 1, oe - 1));
      if (!kk.has("sourceTool")) for (const x of kk) keys.add(x);
      j = oe;
    }
    // identifier payloads resolved to their const definition
    for (const idm of call.matchAll(/\b([A-Za-z_$][A-Za-z0-9_$]*)\b/g))
      if (consts.has(idm[1])) for (const x of consts.get(idm[1])) keys.add(x);
    i = end === -1 ? src.length : end;
  }
  return keys;
}

/* Every rail read: the four getters plus the key array inside sourcedExternally. */
function pullKeys(src) {
  const keys = new Set();
  const single = /\b(?:getPrimitive|getPrimitiveWithSource|getExternalPrimitive|getCurrent|getToolResult)\s*\(\s*["'`]([A-Za-z0-9_]+)["'`]/g;
  let m;
  while ((m = single.exec(src))) keys.add(m[1]);
  const arr = /sourcedExternally\s*\(\s*\[([^\]]*)\]/g;
  while ((m = arr.exec(src))) {
    for (const km of m[1].matchAll(/["'`]([A-Za-z0-9_]+)["'`]/g)) keys.add(km[1]);
  }
  return keys;
}

function toolId(src) {
  const m = src.match(/const\s+TOOL_ID\s*=\s*["'`]([^"'`]+)["'`]/);
  return m ? m[1] : null;
}

function countChar(src, cp) { let n = 0; for (const ch of src) if (ch.codePointAt(0) === cp) n++; return n; }

/* --- run -------------------------------------------------------------------------- */

const files = await loadFiles();
const M = await loadMetrics(files);
const resolve = (k) => (M.resolveKey ? M.resolveKey(k) : k);
const registered = (k) => (M.isRegistered ? M.isRegistered(k) : false);
const derivations = M.derivations || {};

const publishersOf = new Map(); // resolvedKey -> [file]
const pullersOf = new Map();    // resolvedKey -> [{file, raw}]
const perFile = [];             // hygiene + id
let emTotal = 0, trackAdopters = 0, toolFileCount = 0;
const deadRefs = [];

for (const [path, src] of files) {
  if (path === "src/lib/metrics.js" || path === "src/lib/toolData.js") { /* machinery, still hygiene-checked below */ }
  const isTool = path.endsWith(".jsx");
  const pubs = isTool ? publishKeys(src) : new Set();
  const pulls = isTool ? pullKeys(src) : new Set();
  for (const k of pubs) { const r = resolve(k); if (!publishersOf.has(r)) publishersOf.set(r, []); publishersOf.get(r).push(path); }
  for (const k of pulls) { const r = resolve(k); if (!pullersOf.has(r)) pullersOf.set(r, []); pullersOf.get(r).push({ file: path, raw: k }); }

  const em = countChar(src, 0x2014), en = countChar(src, 0x2013);
  const smart = countChar(src, 0x2019) + countChar(src, 0x201C) + countChar(src, 0x201D);
  emTotal += em;

  const usesTrack = /from\s+["'`][^"'`]*track["'`]|import\s+.*\btrack\b/.test(src) || /\btrack\s*\(/.test(src);
  const publishes = pubs.size > 0;
  if (isTool && (publishes || pulls.size > 0)) { toolFileCount++; if (usesTrack) trackAdopters++; }

  for (const d of DEAD_FILES) {
    const re = new RegExp(`from\\s+["'\`]\\./${d}["'\`]|\\b${d}\\b`);
    if (re.test(src) && path !== `${d}.jsx`) deadRefs.push({ file: path, dead: d });
  }

  if (em || en || smart || pubs.size || pulls.size) {
    perFile.push({ path, id: toolId(src), pubs: [...pubs], pulls: [...pulls], em, en, smart, usesTrack, isTool });
  }
}

/* orphan analysis */
const allPublished = new Set(publishersOf.keys());
const orphans = [];
for (const [key, callers] of pullersOf) {
  if (allPublished.has(key)) continue;
  const d = derivations[key];
  if (d && allPublished.has(d.from)) continue; // derivable from a published key
  orphans.push({
    key,
    inRegistry: registered(key),
    derivable: !!d,
    callers: [...new Set(callers.map((c) => c.file))],
  });
}

/* published but pulled by nobody: informational, often export-only, not a defect */
const unconsumed = [...publishersOf.keys()].filter((k) => !pullersOf.has(k));

/* --- report ----------------------------------------------------------------------- */

const line = (s = "") => console.log(s);
line("\n=================  RAIL AND HYGIENE AUDIT  =================");
line(`mode: ${REMOTE ? "remote (bounded file list)" : "local (full repo on disk)"}`);
line(`files scanned: ${files.size}   tool files with rail activity: ${toolFileCount}`);

line("\n---  ORPHAN PULLS  (pulled by a tool, published by none)  ---");
if (orphans.length === 0) line("  none. every pulled key has a publisher or a derivation. rail is clean.");
else {
  for (const o of orphans.sort((a, b) => Number(a.inRegistry) - Number(b.inRegistry))) {
    const sev = o.inRegistry ? "registered but UNPUBLISHED" : "NOT IN REGISTRY (harder failure)";
    line(`  ${o.key}   [${sev}]${o.derivable ? "  (derivation exists but its source is also unpublished)" : ""}`);
    line(`      pulled by: ${o.callers.join(", ")}`);
  }
}

line("\n---  EM-DASH SWEEP  (sitewide zero rule)  ---");
const emFiles = perFile.filter((f) => f.em > 0);
if (emFiles.length === 0) line("  clean. no U+2014 anywhere in the scanned set.");
else { line(`  ${emTotal} em-dash(es) across ${emFiles.length} file(s):`);
  for (const f of emFiles.sort((a, b) => b.em - a.em)) line(`      ${f.em.toString().padStart(3)}  ${f.path}`); }
const enFiles = perFile.filter((f) => f.en > 0);
const smartFiles = perFile.filter((f) => f.smart > 0);
if (enFiles.length) line(`  note: en-dashes (U+2013) in ${enFiles.map((f) => f.path).join(", ")}`);
if (smartFiles.length) line(`  note: smart quotes in ${smartFiles.map((f) => f.path).join(", ")}`);

line("\n---  INSTRUMENTATION ADOPTION  (track.js)  ---");
line(`  ${trackAdopters} of ${toolFileCount} rail-active tools reference track. ` +
  (trackAdopters < toolFileCount ? `${toolFileCount - trackAdopters} do not.` : "full adoption."));

line("\n---  DEAD FILE REFERENCES  ---");
if (deadRefs.length === 0) line("  none of the flagged dead files are referenced.");
else for (const d of deadRefs) line(`  ${d.file} references ${d.dead}`);

line("\n---  CONSUMED CONTRACT  (every key some tool pulls, and who feeds it)  ---");
for (const [k, callers] of [...pullersOf].sort()) {
  const pubs = publishersOf.get(k);
  const feeder = pubs ? `published by ${[...new Set(pubs)].join(", ")}` : (derivations[k] && publishersOf.has(derivations[k].from) ? `derived from ${derivations[k].from}` : "NOBODY");
  line(`  ${k.padEnd(24)} pulled by ${[...new Set(callers.map((c) => c.file))].length}  <-  ${feeder}`);
}

if (VERBOSE) {
  line("\n---  FULL PUBLISH GRAPH  ---");
  for (const [k, fs] of [...publishersOf].sort()) {
    const consumers = pullersOf.has(k) ? pullersOf.get(k).length : 0;
    line(`  ${k.padEnd(28)} published by ${fs.length}, pulled by ${consumers}`);
  }
  if (unconsumed.length) line(`\n  published, no consumer (export-only): ${unconsumed.join(", ")}`);
}

if (!REMOTE) line("\nNote: run from the repo ROOT so every publisher is on disk. A partial file set\n      makes tools whose publishers are absent look falsely orphaned.");

line("\n===========================================================");
line(orphans.length === 0
  ? "RESULT: rail is clean. no orphan pulls."
  : `RESULT: ${orphans.length} orphan pull(s). these must be resolved before any affected tool locks.`);
line("");

process.exit(orphans.length);
