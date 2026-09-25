/* floor.test.mjs
 *
 * The V3 floor (doctrine v1.3 Section 10, CLAUDE.md section 12, step 2).
 *
 * Every public tool, rail or not, meets a common floor before any deep work: the
 * result is visible on first use without an email, it exports and shares through
 * ReportActions, it opens from a scenario link, it sits on the journey graph, it uses
 * the one type system, and it renders without throwing.
 *
 * The render gate is the reason this file exists. On 23 Sep 2026 a browser smoke
 * found five tools that rendered a blank page for real visitors: four WFM tools
 * built their PDF block from variables that did not exist, and License Gap, a V3 rail
 * tool, read a name its destructure omitted. The engine harnesses slice the engine
 * only, so none of that was visible to the suite. Here every tool is bundled with
 * esbuild and rendered to a string with react-dom/server, with default inputs, with
 * its SAMPLE state and with hostile inputs, and the text is checked for NaN,
 * Infinity and undefined.
 *
 * Run from repo root: node floor.test.mjs
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";
import { encodeScenario } from "./src/lib/scenarioUrl.js";

const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
const DASH = [String.fromCharCode(0x2014), String.fromCharCode(0x2013)];

/* ------------------------------------------------------------ browser stub */
const loc = { search: "", pathname: "/", href: "https://www.contactcentercx.com/", hash: "", origin: "https://www.contactcentercx.com" };
globalThis.window = {
  location: loc, scrollTo() {}, addEventListener() {}, removeEventListener() {},
  history: { replaceState() {} }, matchMedia: () => ({ matches: false, addListener() {}, removeListener() {} }),
};
globalThis.document = { title: "", head: { appendChild() {} }, createElement: () => ({ setAttribute() {}, style: {} }),
  querySelector: () => null, getElementById: () => null, addEventListener() {} };
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.sessionStorage = globalThis.localStorage;
Object.defineProperty(globalThis, "navigator", { value: { userAgent: "node" }, configurable: true });

const React = require("react");
const { renderToString } = require("react-dom/server");
const JOURNEYMOD = await import("./src/lib/journey.js");

/* ReportActions is replaced by a probe that prints everything the PDF and the
   review request would carry. The PDF content is otherwise built only on click,
   so a section that reads a missing field ("Maturity level: undefined") would
   pass a page render. Every leaf is printed with String(), so NaN, Infinity and
   undefined survive to the text check instead of vanishing inside JSON. A field
   whose value is undefined is an absent optional field and is skipped; the word
   inside a string is still caught. */
const PROBE = `import { withNextStep } from ${JSON.stringify(process.cwd() + "/src/lib/journey.js")};

import React from "react";
const leaf = (v) => v === null ? "null" : typeof v === "object" ? Object.values(v).filter((x) => x !== undefined).map(leaf).join(" | ") : String(v);
export default function ReportActions(p) {
  globalThis.__NEXT = { toolId: p.toolId, steps: withNextStep(p.toolId, p.sections || [], p.next).filter((s) => s.type === "next") };
  return React.createElement("div", { "data-probe": "report" },
    "PROBE request a review ",
    leaf({ toolName: p.toolName, subtitle: p.subtitle, summary: p.summary || [], sections: withNextStep(p.toolId, p.sections || [], p.next) }));
}`;
const probePlugin = { name: "report-probe", setup(b) {
  b.onResolve({ filter: /^\.\/ReportActions$/ }, () => ({ path: "probe", namespace: "probe" }));
  b.onLoad({ filter: /.*/, namespace: "probe" }, () => ({ contents: PROBE, loader: "jsx", resolveDir: process.cwd() }));
} };

async function load(file) {
  const r = await build({ entryPoints: ["./" + file], bundle: true, write: false, format: "cjs", platform: "node",
    jsx: "automatic", loader: { ".js": "jsx" }, external: ["react", "react-dom"], logLevel: "silent", plugins: [probePlugin] });
  const mod = { exports: {} };
  new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
  return mod.exports;
}
function render(mod, route, search) {
  loc.search = search || ""; loc.pathname = route; loc.href = loc.origin + route + (search || "");
  try {
    const html = renderToString(React.createElement(mod.default));
    return { h1: (html.match(/<h1[\s>]/g) || []).length, text: html.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/g, " ").replace(/\s+/g, " ") };
  } catch (e) { return { error: e.message }; }
}
const BAD = /\bNaN\b|\bInfinity\b|\bundefined\b|\[object Object\]/;
/* Float noise: a figure such as 28.000000000000004 or 0.30000000000000004 printed as if
   it were a value. Checked on the default and sample renders, which a reader sees first. */
const NOISE = /\d\.\d*0000000\d|\d\.\d*9999999\d/;
const noiseAt = (t) => { const m = t.match(new RegExp(".{0,40}(" + NOISE.source + ").{0,20}")); return m ? m[0] : ""; };
const badAt = (t) => { const m = t.match(new RegExp(".{0,50}(" + BAD.source + ").{0,30}")); return m ? m[0] : ""; };

/* Every numeric leaf replaced by a hostile value. Arrays and nested objects are
   walked, so a row table or a score map is attacked field by field. */
function hostile(v, x) {
  if (typeof v === "number") return x;
  if (Array.isArray(v)) return v.map((e) => hostile(e, x));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, e]) => [k, hostile(e, x)]));
  return v;
}
const hasNumber = (v) => typeof v === "number" || (v && typeof v === "object" && Object.values(v).some(hasNumber));

/* --------------------------------------------------------- the tool set */
const APP = readFileSync("./App.jsx", "utf8");
const lazyFile = Object.fromEntries([...APP.matchAll(/const (\w+) = lazy\(\(\) => import\('\.\/(\w+)'\)\)/g)].map((m) => [m[1], m[2] + ".jsx"]));
const TOOLS = [...APP.matchAll(/<Route\s+path="(\/tools\/[a-z0-9-]+)"\s+element=\{<(\w+) \/>\}/g)]
  .map((m) => ({ route: m[1], comp: m[2], file: lazyFile[m[2]] }))
  .filter((t) => t.comp !== "LegacyRedirect");

/* The nine rail tools carry their own engine and reconciliation harnesses and read
   scenario links after mount. The floor holds them to the render gate and the
   static rules; the SAMPLE and hostile renders apply to the tools that joined at
   the floor, whose first paint must read the link. */
const RAIL = new Set(["AttritionCostCalculator.jsx", "LicenseBundleGapChecker.jsx", "StaffingCalculator.jsx",
  "CostPerContactCalculator.jsx", "ChannelShiftModel.jsx", "FCRLeakageDiagnostic.jsx", "AIDeflectionRealityCheck.jsx",
  "TCOCalculator.jsx", "BusinessCaseBuilder.jsx"]);
/* Calculators disclose a corrected input. Frameworks drop an out-of-range answer. */
const CALCULATORS = new Set(["AHTDecomposition.jsx", "ShrinkagePlanner.jsx", "OccupancyRiskSimulator.jsx",
  "ForecastAccuracyTracker.jsx", "ScheduleAdherenceCalculator.jsx"]);
/* Builders always show their form and report; a hostile value is clamped and flagged. */
const BUILDERS = new Set(["QAScorecardBuilder.jsx"]);

section("0. The tool set is read from App.jsx");
ok("25 tool routes are mounted", TOOLS.length === 25);
ok("every tool route resolves to a component file", TOOLS.every((t) => !!t.file));

/* ------------------------------------------------------- 1. static rules */
section("1. Every tool meets the static floor");
for (const t of TOOLS) {
  const src = readFileSync("./" + t.file, "utf8");
  const tag = `${t.route}:`;
  ok(`${tag} renders ReportActions`, /<ReportActions\b/.test(src));
  ok(`${tag} does not import ReportExport directly`, !/import ReportExport/.test(src));
  ok(`${tag} posts nothing to Formspree itself`, !/formspree\.io/.test(src));
  ok(`${tag} declares TOOL_ID and ROUTE, and ROUTE is its App route`,
    /const TOOL_ID\s*=\s*"[a-z0-9-]+"/.test(src) && (src.match(/const ROUTE\s*=\s*"([^"]+)"/) || [])[1] === t.route);
  ok(`${tag} asks for no email before the result`, !/type="email"|type=\{"email"\}/.test(src));
  ok(`${tag} has no email gate phase`, !/useState\("gate"\)|phase === "gate"/.test(src));
  ok(`${tag} reads a scenario link`, /readScenario\(/.test(src));
  ok(`${tag} uses the type system, no hand-written stacks`, !/DM Sans|Instrument Serif/.test(src) && /from "\.\/src\/lib\/type"/.test(src));
  ok(`${tag} carries no em-dash or en-dash`, DASH.every((d) => src.indexOf(d) < 0));
  if (!RAIL.has(t.file)) {
    ok(`${tag} exports DEFAULTS`, /export const DEFAULTS\s*=/.test(src));
    ok(`${tag} reads the scenario on first paint`, /useState\(\s*\(\)\s*=>[^\n]*readScenario\(/.test(src));
    ok(`${tag} opens with the shared tool frame (ToolNav and ToolHero)`, /<ToolNav\b/.test(src) && /<ToolHero\b/.test(src) && !/<nav\b/.test(src));
  }
  if (CALCULATORS.has(t.file)) ok(`${tag} routes inputs through the shared guard`, /createGuards\(\)/.test(src) && /guardLine/.test(src));
}

/* ------------------------------------------------------- 2. render gate */
section("2. Every tool renders, with defaults, its sample and hostile inputs");
for (const t of TOOLS) {
  const tag = `${t.route}:`;
  let mod;
  try { mod = await load(t.file); } catch (e) { ok(`${tag} bundles (${e.message.slice(0, 80)})`, false); continue; }
  const base = render(mod, t.route, "");
  ok(`${tag} default render does not throw${base.error ? " (" + base.error + ")" : ""}`, !base.error);
  if (base.error) continue;
  ok(`${tag} default render prints no NaN, Infinity or undefined [${badAt(base.text)}]`, !BAD.test(base.text));
  ok(`${tag} default render has exactly one h1 (${base.h1})`, base.h1 === 1);
  ok(`${tag} default render prints no float noise [${noiseAt(base.text)}]`, !NOISE.test(base.text));
  if (RAIL.has(t.file)) continue;

  const id = (readFileSync("./" + t.file, "utf8").match(/const TOOL_ID\s*=\s*"([^"]+)"/) || [])[1];
  const D = mod.DEFAULTS;
  ok(`${tag} DEFAULTS is an object`, D && typeof D === "object");
  if (!D) continue;
  const S = mod.SAMPLE || D;
  const sampleQ = "?s=" + encodeScenario(id, S, D);
  const sample = render(mod, t.route, sampleQ);
  ok(`${tag} sample render does not throw${sample.error ? " (" + sample.error + ")" : ""}`, !sample.error);
  if (!sample.error) {
    ok(`${tag} sample render shows the result and its actions without a gate`, /request a review/i.test(sample.text));
    /* P2 task 8: the report carries exactly one next step, an edge of this tool in the journey graph. */
    const N = globalThis.__NEXT || { steps: [] };
    const edges = (JOURNEYMOD.JOURNEY[N.toolId] || { next: [] }).next.map((e) => JOURNEYMOD.JOURNEY[e.to] && JOURNEYMOD.JOURNEY[e.to].route);
    ok(`${tag} sample render carries exactly one next step, an edge of its journey node`, N.steps.length === 1 && N.steps[0].items.length === 1 && edges.includes(N.steps[0].items[0].href));
    ok(`${tag} sample render prints no NaN, Infinity or undefined [${badAt(sample.text)}]`, !BAD.test(sample.text));
    ok(`${tag} sample render has exactly one h1 (${sample.h1})`, sample.h1 === 1);
    ok(`${tag} sample render prints no float noise [${noiseAt(sample.text)}]`, !NOISE.test(sample.text));
  }
  if (!hasNumber(S)) continue;
  for (const [label, x] of [["negative", -5], ["zero", 0], ["huge", 1e12]]) {
    const h = render(mod, t.route, "?s=" + encodeScenario(id, hostile(S, x), D));
    ok(`${tag} ${label} inputs do not throw${h.error ? " (" + h.error + ")" : ""}`, !h.error);
    if (h.error) continue;
    ok(`${tag} ${label} inputs print no NaN, Infinity or undefined [${badAt(h.text)}]`, !BAD.test(h.text));
    /* A calculator corrects a bad input and still answers. A framework drops an
       answer outside its scale, so a hostile link opens an incomplete assessment,
       never a scored one. */
    if (CALCULATORS.has(t.file)) {
      ok(`${tag} ${label} inputs still show the result and its actions`, /request a review/i.test(h.text));
      if (label === "negative") ok(`${tag} negative inputs are corrected and disclosed`, /computed at/.test(h.text));
    } else if (BUILDERS.has(t.file)) {
      /* A builder always shows its form and report. A hostile weight is clamped, and the
         form check must then say the weights no longer total 100. */
      if (label !== "zero") ok(`${tag} ${label} weights are clamped and the form check flags them`, /Weights do not total 100/.test(h.text));
    } else if (label !== "zero") {
      /* Zero is a valid answer on some framework scales (a role index), so a
         framework is attacked with negative and huge values only. */
      ok(`${tag} ${label} answers outside the scale never reach a scored result`, !/request a review/i.test(h.text) || !mod.SAMPLE);
    }
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
