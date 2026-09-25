/* shrinkage.report.mjs
 *
 * Rendered-output reconciliation for the Shrinkage Planner. The page is bundled and
 * server-rendered with ReportActions swapped for a probe that captures every PDF section,
 * then every figure the PDF prints is reconciled to the engine run on the same inputs: at
 * the defaults, on a roster above the need, on a sum past the cap and on an old link with
 * no need entered. The method page's worked example is proven to be the tool's own default.
 */
import { createRequire } from "node:module";
import { build } from "esbuild";
import { encodeScenario } from "./src/lib/scenarioUrl.js";
import { runShrinkage } from "./src/lib/shrinkage.js";
import { SHRINKAGE_MODEL } from "./src/lib/rubrics/shrinkageModel.js";

const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);

const loc = { search: "", pathname: "/tools/shrinkage-planner", href: "https://www.contactcentercx.com/tools/shrinkage-planner", hash: "", origin: "https://www.contactcentercx.com" };
globalThis.window = { location: loc, scrollTo() {}, addEventListener() {}, removeEventListener() {}, history: { replaceState() {} }, matchMedia: () => ({ matches: false, addListener() {}, removeListener() {} }) };
globalThis.document = { title: "", head: { appendChild() {} }, createElement: () => ({ setAttribute() {}, style: {} }), querySelector: () => null, getElementById: () => null, addEventListener() {} };
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
globalThis.sessionStorage = globalThis.localStorage;
Object.defineProperty(globalThis, "navigator", { value: { userAgent: "node" }, configurable: true });
const React = require("react");
const { renderToString } = require("react-dom/server");

/* The probe composes the PDF sections the way ReportActions does (withNextStep), so the checks below read what the
   reader gets, the one next step included. */
const PROBE = `import React from "react";
import { withNextStep } from ${JSON.stringify(process.cwd() + "/src/lib/journey.js")};
export default function ReportActions(p) { globalThis.__REPORT = { ...p, sections: withNextStep(p.toolId, p.sections, p.next) }; return React.createElement("div", null, "probe"); }`;
const r = await build({ entryPoints: ["./ShrinkagePlanner.jsx"], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic", loader: { ".js": "jsx" }, external: ["react", "react-dom"], logLevel: "silent",
  plugins: [{ name: "probe", setup(b) { b.onResolve({ filter: /^\.\/ReportActions$/ }, () => ({ path: "p", namespace: "probe" })); b.onLoad({ filter: /.*/, namespace: "probe" }, () => ({ contents: PROBE, loader: "jsx", resolveDir: process.cwd() })); } }] });
const mod = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
const { DEFAULTS, SHRINK_PARAMS } = mod.exports;

const render = (state) => {
  loc.search = state ? "?s=" + encodeScenario("shrinkage-planner", state, DEFAULTS) : "";
  globalThis.__REPORT = null;
  const html = renderToString(React.createElement(mod.exports.default));
  return { html: html.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/g, " ").replace(/\s+/g, " "), rep: globalThis.__REPORT };
};
const sec = (rep, title) => rep.sections.find((s) => s.title === title);
const usd = (x) => "$" + Math.round(x).toLocaleString("en-US");

for (const [label, state] of [["defaults", null], ["roster above the need", { ...DEFAULTS, agents: 260 }], ["sum past the cap", { ...DEFAULTS, breaks: 60, pto: 50 }], ["own wage, no need entered", { ...DEFAULTS, hourlyRate: 24, needed: 0 }]]) {
  section(`Reconciliation: ${label}`);
  const { html, rep } = render(state);
  const v = { ...DEFAULTS, ...(state || {}) };
  const X = runShrinkage(v, SHRINK_PARAMS);
  const total = X.totalPct.toFixed(1) + "%";
  ok(`${label}: the page rendered and handed the report its sections`, !!rep && rep.sections.length >= 6);
  ok(`${label}: total ${total} on the page, in the summary and in the PDF metrics`, html.includes(total) && rep.summary[0].value === total && sec(rep, "Shrinkage Analysis").items[0].value === total);
  ok(`${label}: agents on the queue and agents to schedule equal the engine everywhere`, rep.summary[1].value === String(X.onQueueRounded) && rep.summary[2].value === String(X.schedule) && sec(rep, "Shrinkage Analysis").items[2].value === String(X.schedule));
  const F = sec(rep, "Key Findings").items.join(" ");
  ok(`${label}: the findings carry the engine's paid time off the queue, its split and one point`, F.includes(usd(X.offQueueValue)) && F.includes(usd(X.plannedValue)) && F.includes(usd(X.unplannedValue)) && F.includes(usd(X.pointValue)) && rep.summary[3].value === usd(X.offQueueValue));
  if (v.needed > 0) ok(`${label}: the schedule finding states the gross-up and the roster position`, F.includes("schedule " + X.schedule) && (X.rosterGap > 0 ? F.includes(X.rosterGap + " short") : X.rosterGap < 0 ? F.includes(-X.rosterGap + " above") : F.includes("exactly")));
  else ok(`${label}: with no need entered, nothing is scheduled against one`, X.schedule === 0 && /No agents needed on the queue/.test(F));
  ok(`${label}: the breakdown rows equal the engine's categories, PTO among the planned`, sec(rep, "Shrinkage Breakdown").rows.length === 9 && sec(rep, "Shrinkage Breakdown").rows.some((r) => r[0] === "PTO and vacation (planned)"));
  ok(`${label}: a cap is disclosed exactly when the engine capped`, X.capped === !!sec(rep, "Inputs Corrected") && (!X.capped || sec(rep, "Inputs Corrected").items.join(" ").includes("Total shrinkage")));
  ok(`${label}: the PDF labels the planning range and states the hours and the load`, sec(rep, "Planning Assumptions").items.some((x) => /heuristic, no published source/.test(x)) && sec(rep, "Planning Assumptions").items.some((x) => /2,080 a year/.test(x)) && sec(rep, "Planning Assumptions").items.some((x) => /1\.3x/.test(x)));
  ok(`${label}: no NaN, Infinity or undefined anywhere in the page or the report`, !/NaN|Infinity|undefined/.test(html + JSON.stringify(rep)));
  ok(`${label}: no figure prints float noise (such as 28.000000000000004) on the page or in the report`, !/\d\.\d*0000000|\d\.\d*9999999/.test(html + JSON.stringify(rep)));
}

section("The method page's worked example is the tool's default case");
const M = JSON.stringify({ ...SHRINKAGE_MODEL, example: { ...SHRINKAGE_MODEL.example, result: null } }) + JSON.stringify(SHRINKAGE_MODEL.constants());
ok("the method page prints the range as 28 to 35 and carries no float noise", /Under 28%/.test(M) && /28 to 35%/.test(M) && /Over 35%/.test(M) && !/\d\.\d*0000000|\d\.\d*9999999/.test(M));
const ex = SHRINKAGE_MODEL.example.result, d = runShrinkage(DEFAULTS, SHRINK_PARAMS);
ok("same inputs: the example's result equals the engine at the tool's defaults", JSON.stringify(ex) === JSON.stringify(d));
ok("every step printed on the method page carries the engine's figures", SHRINKAGE_MODEL.example.steps.map((s) => s[1]).join(" ").includes(usd(d.offQueueValue)) && SHRINKAGE_MODEL.example.steps.map((s) => s[1]).join(" ").includes("rounded up to " + d.schedule));
ok("the method page runs on the tool's own parameters", JSON.stringify(SHRINK_PARAMS) === JSON.stringify({ range: { low: 0.28, high: 0.35 }, load: 1.3, hoursYear: 2080, maxTotal: 99 }));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
