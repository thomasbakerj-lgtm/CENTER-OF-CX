/* occupancy.report.mjs
 *
 * Rendered-output reconciliation for the Occupancy Risk Simulator. The page is bundled and
 * server-rendered with ReportActions swapped for a probe that captures every PDF section,
 * then every figure the PDF prints is reconciled to the engine run on the same inputs: at
 * the defaults, on an overloaded link and on a link below the target. The method page's
 * worked example is proven to be the tool's own default case.
 */
import { createRequire } from "node:module";
import { build } from "esbuild";
import { encodeScenario } from "./src/lib/scenarioUrl.js";
import { runOccupancy } from "./src/lib/occupancy.js";
import { money } from "./src/lib/guards.js";
import { OCCUPANCY_MODEL } from "./src/lib/rubrics/occupancyModel.js";

const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);

const loc = { search: "", pathname: "/tools/occupancy-risk", href: "https://www.contactcentercx.com/tools/occupancy-risk", hash: "", origin: "https://www.contactcentercx.com" };
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
const r = await build({ entryPoints: ["./OccupancyRiskSimulator.jsx"], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic", loader: { ".js": "jsx" }, external: ["react", "react-dom"], logLevel: "silent",
  plugins: [{ name: "probe", setup(b) { b.onResolve({ filter: /^\.\/ReportActions$/ }, () => ({ path: "p", namespace: "probe" })); b.onLoad({ filter: /.*/, namespace: "probe" }, () => ({ contents: PROBE, loader: "jsx", resolveDir: process.cwd() })); } }] });
const mod = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
const { DEFAULTS, OCC_PARAMS } = mod.exports;

const render = (state) => {
  loc.search = state ? "?s=" + encodeScenario("occupancy-risk", state, DEFAULTS) : "";
  globalThis.__REPORT = null;
  const html = renderToString(React.createElement(mod.exports.default));
  return { html: html.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/g, " ").replace(/\s+/g, " "), rep: globalThis.__REPORT };
};
const sec = (rep, title) => rep.sections.find((s) => s.title === title);
const k = (x) => "$" + Math.round(x / 1000).toLocaleString("en-US") + "K";

for (const [label, state] of [["defaults", null], ["overloaded link", { ...DEFAULTS, agents: 30 }], ["below target", { ...DEFAULTS, agents: 80 }], ["own wage and ramp", { ...DEFAULTS, hourlyRate: 24, trainingWeeks: 10, attritionRate: 50, target: 88 }]]) {
  section(`Reconciliation: ${label}`);
  const { html, rep } = render(state);
  const v = { ...DEFAULTS, ...(state || {}) };
  const X = runOccupancy(v, OCC_PARAMS);
  ok(`${label}: the page rendered and handed the report its sections`, !!rep && rep.sections.length >= 6);
  const occLabel = X.overloaded ? "Over 100%" : (X.occ * 100).toFixed(1) + "%";
  ok(`${label}: occupancy ${occLabel} on the page, in the summary and in the PDF metrics`, html.includes(occLabel) && rep.summary[0].value === occLabel && sec(rep, "Occupancy Analysis").items[0].value === occLabel);
  ok(`${label}: workload and agents at target in the PDF equal the engine`, sec(rep, "Occupancy Analysis").items[2].value === X.intensity.toFixed(1) + " Erl" && sec(rep, "Occupancy Analysis").items[3].value === String(X.agentsAtTarget));
  const F = sec(rep, "Key Findings").items.join(" ");
  if (X.aboveTarget) ok(`${label}: the findings carry the engine's agents to add, staffing cost and attrition cost`, F.includes(X.extraAgents + " more agents") && F.includes(k(X.staffingCost)) && F.includes(k(X.excessAttritionCost)));
  else ok(`${label}: below target, the findings attach no staffing or attrition cost`, /at or below your \d+% target/.test(F) && X.extraAgents === 0);
  ok(`${label}: the replacement cost is stated to the cent`, F.includes("costs " + money(X.replacementCost)) && F.includes(money(X.rampWages)));
  const L = sec(rep, "Occupancy Ladder").rows;
  ok(`${label}: all 15 ladder rows equal the engine`, L.length === 15 && L.every((row, j) => row[1] === X.ladder[j].agents + " agents, " + X.ladder[j].attrition.toFixed(0) + "% attrition, " + k(X.ladder[j].turnoverCost) + "/yr turnover"));
  ok(`${label}: the PDF labels every heuristic and states the paid hours`, sec(rep, "Planning Assumptions").items.filter((x) => /heuristic/.test(x)).length >= 3 && sec(rep, "Planning Assumptions").items.some((x) => /40 a week and 2,080 a year/.test(x)));
  ok(`${label}: no NaN, Infinity or undefined anywhere in the page or the report`, !/NaN|Infinity|undefined/.test(html + JSON.stringify(rep)));
}

section("The method page's worked example is the tool's default case");
const ex = OCCUPANCY_MODEL.example.result, d = runOccupancy(DEFAULTS, OCC_PARAMS);
ok("same inputs: the example's result equals the engine at the tool's defaults", JSON.stringify(ex) === JSON.stringify(d));
ok("every step printed on the method page carries the engine's figures", OCCUPANCY_MODEL.example.steps.map((s) => s[1]).join(" ").includes("$" + Math.round(d.staffingCost).toLocaleString("en-US")) && OCCUPANCY_MODEL.example.steps.map((s) => s[1]).join(" ").includes("$" + Math.round(d.excessAttritionCost).toLocaleString("en-US")));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
