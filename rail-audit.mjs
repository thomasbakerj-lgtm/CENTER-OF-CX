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
  "QAScorecardBuilder.jsx", "FCRLeakageDiagnostic.jsx",
  "VendorMatchEngine.jsx", "PlatformDecisionMatrix.jsx",
  "ContractRiskScanner.jsx", "TransformationReadiness.jsx", "RFPRequirementBuilder.jsx",
  "CXMaturity.jsx", "AIReadiness.jsx", "CXITAlignment.jsx",
  "GovernanceModel.jsx", "RoadmapBuilder.jsx",
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
  let d = 0, str = null, seg = 0;
  /* A shorthand property ({ aht, vol }) has no colon. It still publishes. Missing it hid
     StaffingCalculator as a publisher of aht. A segment that is a bare identifier is one. */
  const shorthand = (a, b) => { const t = body.slice(a, b).trim(); if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(t)) keys.add(t); };
  for (let k = 0; k <= body.length; k++) {
    if (k === body.length) { if (!str && d === 0) shorthand(seg, k); break; }
    const c = body[k], p = body[k - 1];
    if (str) { if (c === str && p !== "\\") str = null; continue; }
    if (c === '"' || c === "'" || c === "`") { str = c; continue; }
    if (c === "{" || c === "[" || c === "(") d++;
    else if (c === "}" || c === "]" || c === ")") d--;
    else if (d === 0 && c === ",") { shorthand(seg, k); seg = k + 1; }
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

/* Map every `const NAME = { ... }` to the string literal VALUES at its top level, so a key
   map walked by Object.entries or Object.values can be resolved to the keys it pulls. */
function constObjectValues(src) {
  const map = new Map();
  const re = /const\s+([A-Za-z0-9_$]+)\s*=\s*\{/g;
  let m;
  while ((m = re.exec(src))) {
    const brace = src.indexOf("{", m.index);
    const end = matchFrom(src, brace, "{", "}");
    if (end === -1) continue;
    const body = src.slice(brace + 1, end - 1);
    const vals = [...body.matchAll(/:\s*["'`]([A-Za-z0-9_]+)["'`]\s*(?:,|$)/g)].map((x) => x[1]);
    if (vals.length) map.set(m[1], vals);
  }
  return map;
}

/* A rail getter called with a variable instead of a string literal. The literal regex below
   never saw these, so TCOCalculator pulled five keys the audit could not see, one of them
   (attrition) published by nobody. A variable key is resolved when it is the loop variable of
   Object.entries(MAP) or Object.values(MAP) over a const object literal. Anything else is
   returned as unresolved, and unresolved fails the gate: an unread pull is not a clean one. */
function wrapperLiterals(src, param) {
  const defs = [...src.matchAll(/(?:const|let)\s+([A-Za-z0-9_$]+)\s*=\s*\(([^)]*)\)\s*=>|function\s+([A-Za-z0-9_$]+)\s*\(([^)]*)\)/g)];
  const out = new Set();
  let found = false;
  for (const d of defs) {
    const name = d[1] || d[3];
    const params = (d[2] ?? d[4]).split(",").map((p) => p.trim().split("=")[0].trim());
    const idx = params.indexOf(param);
    if (idx < 0) continue;
    let calls = 0;
    for (const c of src.matchAll(new RegExp(`(?<![A-Za-z0-9_$.])${name}\\s*\\(`, "g"))) {
      if (c.index === d.index + d[0].indexOf(name) && d[3]) continue; // the function declaration itself
      const open = src.indexOf("(", c.index);
      if (d[1] && src.slice(d.index, open + 1) === src.slice(c.index, open + 1)) continue;
      const end = matchFrom(src, open, "(", ")");
      if (end === -1) return null;
      const args = []; let depth = 0, str = null, seg = open + 1;
      for (let k = open + 1; k < end - 1; k++) {
        const ch = src[k], p = src[k - 1];
        if (str) { if (ch === str && p !== "\\") str = null; continue; }
        if (ch === '"' || ch === "'" || ch === "`") { str = ch; continue; }
        if ("([{".includes(ch)) depth++; else if (")]}".includes(ch)) depth--;
        else if (ch === "," && depth === 0) { args.push(src.slice(seg, k).trim()); seg = k + 1; }
      }
      args.push(src.slice(seg, end - 1).trim());
      const a = args[idx];
      const lit = a && a.match(/^["'`]([A-Za-z0-9_]+)["'`]$/);
      if (!lit) return null;
      out.add(lit[1]); calls++;
    }
    if (calls) found = true;
  }
  return found ? out : null;
}

const PRIM_GETTERS = "getPrimitive|getPrimitiveWithSource|getExternalPrimitive|getExternalWithSource";
function variablePulls(src) {
  const resolved = new Set(), unresolved = new Set(), external = new Set();
  const vals = constObjectValues(src);
  const re = new RegExp(`\\b(${PRIM_GETTERS})\\s*\\(\\s*(?![\\s"'\`)])`, "g");
  let m;
  while ((m = re.exec(src))) {
    /* Read the whole first argument. A bare identifier may resolve; any other expression
       (a call, a member, a ternary, a template) cannot be read statically and is unresolved. */
    const open = src.indexOf("(", m.index);
    const end = matchFrom(src, open, "(", ")");
    let depth = 0, str = null, cut = end === -1 ? src.length : end - 1;
    for (let k = open + 1; k < cut; k++) {
      const ch = src[k], p = src[k - 1];
      if (str) { if (ch === str && p !== "\\") str = null; continue; }
      if (ch === '"' || ch === "'" || ch === "`") { str = ch; continue; }
      if ("([{".includes(ch)) depth++; else if (")]}".includes(ch)) depth--;
      else if (ch === "," && depth === 0) { cut = k; break; }
    }
    const arg = src.slice(open + 1, cut).trim();
    if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(arg)) { unresolved.add(`${m[1]}(${arg})`); continue; }
    const v = arg;
    const ent = new RegExp(`for\\s*\\(\\s*(?:const|let|var)\\s*\\[[^\\]]*\\b${v}\\b[^\\]]*\\]\\s*of\\s*Object\\.entries\\(\\s*([A-Za-z0-9_$]+)\\s*\\)`).exec(src)
      || new RegExp(`for\\s*\\(\\s*(?:const|let|var)\\s+${v}\\s+of\\s*Object\\.values\\(\\s*([A-Za-z0-9_$]+)\\s*\\)`).exec(src);
    const add = (k) => { resolved.add(k); if (m[1] === "getExternalPrimitive" || m[1] === "getExternalWithSource") external.add(k); };
    if (ent && vals.has(ent[1])) { for (const k of vals.get(ent[1])) add(k); continue; }
    /* A local wrapper that forwards its parameter: const take = (field, key) => getter(key).
       Resolved through every call site of the wrapper, reading the argument at that position.
       A call site whose argument there is not a string literal leaves the pull unresolved. */
    const lits = wrapperLiterals(src, v);
    if (lits) for (const k of lits) add(k);
    else unresolved.add(`${m[1]}(${v})`);
  }
  return { resolved, unresolved, external };
}

/* Keys this file reads through getExternalPrimitive or getExternalWithSource, literal or
   resolved. Both getters
   return nothing when the only producer is the caller, so a key fed by no OTHER file
   is as dead as a key fed by nobody. */
function externalPullKeys(src) {
  const keys = new Set(variablePulls(src).external);
  for (const m of src.matchAll(/\b(?:getExternalPrimitive|getExternalWithSource)\s*\(\s*["'`]([A-Za-z0-9_]+)["'`]/g)) keys.add(m[1]);
  return keys;
}

/* Every rail read: the four getters plus the key array inside sourcedExternally. */
function pullKeys(src) {
  const keys = new Set(variablePulls(src).resolved);
  const single = /\b(?:getPrimitive|getPrimitiveWithSource|getExternalPrimitive|getExternalWithSource|getCurrent|getToolResult)\s*\(\s*["'`]([A-Za-z0-9_]+)["'`]/g;
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
const TOOL_FILES = [];          // rail-active tool files, for the severity audit
const deadRefs = [];
const unresolvedPulls = [];      // {file, call}
const externalPulls = [];        // {file, key} read through getExternalPrimitive

for (const [path, src] of files) {
  if (path === "src/lib/metrics.js" || path === "src/lib/toolData.js") { /* machinery, still hygiene-checked below */ }
  const isTool = path.endsWith(".jsx");
  const pubs = isTool ? publishKeys(src) : new Set();
  const pulls = isTool ? pullKeys(src) : new Set();
  for (const k of pubs) { const r = resolve(k); if (!publishersOf.has(r)) publishersOf.set(r, []); publishersOf.get(r).push(path); }
  for (const k of pulls) { const r = resolve(k); if (!pullersOf.has(r)) pullersOf.set(r, []); pullersOf.get(r).push({ file: path, raw: k }); }
  if (isTool) {
    for (const call of variablePulls(src).unresolved) unresolvedPulls.push({ file: path, call });
    for (const k of externalPullKeys(src)) externalPulls.push({ file: path, key: resolve(k) });
  }

  const em = countChar(src, 0x2014), en = countChar(src, 0x2013);
  const smart = countChar(src, 0x2019) + countChar(src, 0x201C) + countChar(src, 0x201D);
  emTotal += em;

  const usesTrack = /from\s+["'`][^"'`]*track["'`]|import\s+.*\btrack\b/.test(src) || /\btrack\s*\(/.test(src);
  const publishes = pubs.size > 0;
  if (isTool && (publishes || pulls.size > 0)) { toolFileCount++; TOOL_FILES.push(path); if (usesTrack) trackAdopters++; }

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

/* self-fed pulls: getExternalPrimitive of a key whose only publishers are the caller itself.
   Skipped when the key is already an orphan, so one defect is reported once. */
const orphanKeys = new Set(orphans.map((o) => o.key));
const selfFed = [];
for (const { file, key } of externalPulls) {
  if (orphanKeys.has(key)) continue;
  const others = (publishersOf.get(key) || []).filter((f) => f !== file);
  if (others.length) continue;
  const d = derivations[key];
  if (d && (publishersOf.get(d.from) || []).some((f) => f !== file)) continue;
  if (!selfFed.some((x) => x.file === file && x.key === key)) selfFed.push({ file, key });
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

line("\n---  UNRESOLVED PULLS  (getter called with a key the audit cannot read)  ---");
if (unresolvedPulls.length === 0) line("  none. every rail read resolves to a named key.");
else for (const u of unresolvedPulls) line(`  ${u.file}  ${u.call}`);

line("\n---  SELF-FED PULLS  (getExternalPrimitive of a key only the caller publishes)  ---");
if (selfFed.length === 0) line("  none. every external read has a producer other than its caller.");
else for (const x of selfFed) line(`  ${x.key}   pulled by ${x.file}, which is its only publisher. getExternalPrimitive always returns undefined.`);

line("\n---  EM-DASH SWEEP  (sitewide zero rule)  ---");
const emFiles = perFile.filter((f) => f.em > 0);
if (emFiles.length === 0) line("  clean. no U+2014 anywhere in the scanned set.");
else { line(`  ${emTotal} em-dash(es) across ${emFiles.length} file(s):`);
  for (const f of emFiles.sort((a, b) => b.em - a.em)) line(`      ${f.em.toString().padStart(3)}  ${f.path}`); }
const enFiles = perFile.filter((f) => f.en > 0);
const smartFiles = perFile.filter((f) => f.smart > 0);
if (enFiles.length) line(`  note: en-dashes (U+2013) in ${enFiles.map((f) => f.path).join(", ")}`);
if (smartFiles.length) line(`  note: smart quotes in ${smartFiles.map((f) => f.path).join(", ")}`);

/* This used to count tools that import track.js directly, and that count is no
   longer the question. tool_view fires once from the router and tool_complete
   fires once from ReportActions, so all nine rail tools are instrumented
   whether or not they name the module. What is still missing per tool is the
   severity band: it travels on the `signals` prop, and a tool that publishes no
   severity leaves the funnel unable to tell curiosity from economic pain. That
   is the real adoption gap, so that is what is measured. */
const sevPublishers = TOOL_FILES.filter((f) => /signals=\{\{[\s\S]{0,4000}?severity\s*:/.test(files.get(f) || ""));
line("\n---  SEVERITY PUBLICATION  (signals.severity)  ---");
line(`  ${sevPublishers.length} of ${toolFileCount} rail-active tools publish a severity band. ` +
  (sevPublishers.length < toolFileCount ? `${toolFileCount - sevPublishers.length} do not.` : "full adoption."));
if (sevPublishers.length < toolFileCount) {
  for (const f of TOOL_FILES.filter((x) => !sevPublishers.includes(x))) line(`      missing  ${f}`);
}

/* A presence check is not a correctness check. As of tracker 1-15 all nine
   publishers route through severityBucket, which cannot emit a word outside the
   canonical bands, and all nine now carry a rendered-output harness that gates the
   published band against the argued ratio at runtime. This static check is kept
   anyway: a hand-written word that is neither a band nor a known synonym is dropped
   by sanitizeProps with no error and no warning, so the tool publishes severity,
   passes the regex above, and sends nothing. That failure is invisible everywhere
   else, and a check that costs nothing to keep is worth more than the argument for
   removing it.

   Comparison operands are stripped before scanning. TCOCalculator used to test
   `f.level === "flag"` inside its own severity expression, and counting that as an
   emitted band would have reported a defect that did not exist. That expression is
   gone, but the strip stays, because the next tool to write one should not have to
   rediscover why the check cried wolf.

   A rail-active tool whose severity expression cannot be sliced is reported as
   unchecked rather than passed over. Silently skipping the file is the failure
   mode this whole section exists to remove. */
const BANDS = new Set(["none", "low", "moderate", "high", "severe"]);
const SYNONYMS = new Set(["normal", "elevated", "critical", "blocked", "clear"]);
const badBands = [], uncheckable = [];
let sevChecked = 0;
for (const f of sevPublishers) {
  const src = files.get(f) || "";
  const at = src.indexOf("signals={{");
  const sev = at < 0 ? -1 : src.indexOf("severity", at);
  if (sev < 0) { uncheckable.push(f); continue; }
  const expr = src.slice(sev, src.indexOf("\n", src.indexOf(",\n", sev)) + 1)
    .replace(/[!=]==?\s*["'][a-z]+["']/g, "");
  sevChecked++;
  for (const lit of expr.match(/"([a-z]+)"|'([a-z]+)'/g) || []) {
    const w = lit.slice(1, -1);
    if (!BANDS.has(w) && !SYNONYMS.has(w)) badBands.push({ file: f, word: w });
  }
}
line("\n---  SEVERITY VOCABULARY  (literal bands against the wire allowlist)  ---");
line(`  ${sevChecked} of ${sevPublishers.length} severity expressions read.`);
if (uncheckable.length) for (const f of uncheckable) line(`      UNCHECKED  ${f}  (severity expression could not be sliced)`);
if (badBands.length === 0) line("  clean. every literal severity value is a canonical band or a mapped synonym.");
else for (const b of badBands) line(`  ${b.file} publishes "${b.word}", which sanitizeProps drops in silence.`);

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
/* A severity word outside the allowlist is dropped in silence, so it can only be
   caught by a gate that fails. Printing it and exiting zero would put the defect
   in a log nobody reads, which is how it got this far. An unreadable severity
   expression counts the same: an unchecked file is not a clean one. */
const sevBroken = badBands.length + uncheckable.length;
const deadBroken = unresolvedPulls.length + selfFed.length;
if (deadBroken) line(`RESULT: ${unresolvedPulls.length} unresolved pull(s), ${selfFed.length} self-fed pull(s). a pull that cannot be fed is dead.`);
if (sevBroken) line(`RESULT: ${badBands.length} severity value(s) outside the wire allowlist, ${uncheckable.length} unchecked.`);
line("");

process.exit(orphans.length + sevBroken + deadBroken);
