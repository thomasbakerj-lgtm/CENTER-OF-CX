/* adherence.report.mjs
 *
 * Rendered-output reconciliation for the Schedule Adherence Impact Calculator. The page is
 * bundled and server-rendered with ReportActions swapped for a probe that captures every PDF
 * section, then every figure the PDF prints is reconciled to the engine run on the same
 * inputs: at the defaults, on a roster that already misses, on a roster that never needs
 * overtime, and on an old link with the previous defaults. The method page's worked example
 * is proven to be the tool's own default case.
 */
import { createRequire } from "node:module";
import { build } from "esbuild";
import { encodeScenario } from "./src/lib/scenarioUrl.js";
import { runAdherence } from "./src/lib/adherence.js";
import { ADHERENCE_MODEL } from "./src/lib/rubrics/adherenceModel.js";

const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);

const loc = { search: "", pathname: "/tools/schedule-adherence", href: "https://www.contactcentercx.com/tools/schedule-adherence", hash: "", origin: "https://www.contactcentercx.com" };
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
const r = await build({ entryPoints: ["./ScheduleAdherenceCalculator.jsx"], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic", loader: { ".js": "jsx" }, external: ["react", "react-dom"], logLevel: "silent",
  plugins: [{ name: "probe", setup(b) { b.onResolve({ filter: /^\.\/ReportActions$/ }, () => ({ path: "p", namespace: "probe" })); b.onLoad({ filter: /.*/, namespace: "probe" }, () => ({ contents: PROBE, loader: "jsx", resolveDir: process.cwd() })); } }] });
const mod = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
const { DEFAULTS } = mod.exports;

const render = (state) => {
  loc.search = state ? "?s=" + encodeScenario("schedule-adherence", state, DEFAULTS) : "";
  globalThis.__REPORT = null;
  const html = renderToString(React.createElement(mod.exports.default));
  return { html: html.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/g, " ").replace(/\s+/g, " "), rep: globalThis.__REPORT };
};
const sec = (rep, title) => rep.sections.find((s) => s.title === title);
const pc = (x, d = 1) => (x * 100).toFixed(d) + "%";
const usd = (x) => "$" + Math.round(x).toLocaleString("en-US");
const NOISE = /\d\.\d*0000000\d|\d\.\d*9999999\d/;

const cases = [
  ["defaults", null],
  ["a roster that already misses", { ...DEFAULTS, agents: 95 }],
  ["a roster that never needs overtime", { ...DEFAULTS, agents: 140 }],
  ["old link with the previous defaults", { agents: 100, currentAdherence: 92, callsPerHour: 200, aht: 360, slaTarget: 80, slaTime: 20, hourlyRate: 18, otMultiplier: 1.5 }],
];
for (const [label, state] of cases) {
  section(`Reconciliation: ${label}`);
  const { html, rep } = render(state);
  const v = { ...DEFAULTS, ...(state || {}) };
  const X = runAdherence(v);
  ok(`${label}: the page rendered and handed the report its sections`, !!rep && rep.sections.length >= 6);
  ok(`${label}: today's service level on the page, in the summary and in the PDF metrics`, html.includes(pc(X.base.sl)) && rep.summary[0].value === pc(X.base.sl) && sec(rep, "Adherence Impact").items[0].value === pc(X.base.sl) && sec(rep, "Adherence Impact").items[0].sub.endsWith(X.base.meets ? "met" : "missed"));
  ok(`${label}: agents needed and the 3-point row equal the engine`, rep.summary[1].value === String(X.need) && rep.summary[2].value === pc(X.row3.sl) && rep.summary[3].value === (X.row3.otCost === null ? "n/a" : usd(X.row3.otCost)));
  const rows = sec(rep, "Each Point of Adherence").rows;
  ok(`${label}: all 8 rows carry the engine's agents, service level, verdict and overtime`, rows.length === 8 && X.rows.every((r, j) => rows[j][1].startsWith(r.onQueue + " on the queue, service level " + pc(r.sl) + " (" + (r.meets ? "met" : "missed") + ")") && (r.extra === 0 ? rows[j][1].endsWith("no overtime") : rows[j][1].endsWith(usd(r.otCost) + " a year"))));
  const F = sec(rep, "Key Findings").items.join(" ");
  if (!X.base.meets) ok(`${label}: the findings say the target is already missed`, /already missed at today's adherence/.test(F));
  else if (X.firstMiss) ok(`${label}: the findings name the first miss and its overtime to the dollar`, F.includes(`first falls below target at ${X.firstMiss.adh}% adherence`) && (X.firstMiss.extra ? F.includes(usd(X.firstMiss.otCost) + " a year at " + v.otMultiplier + " × $") : true));
  else ok(`${label}: the findings say the target holds through 10 points`, /stays at or above target through 10 points/.test(F));
  ok(`${label}: no abandonment figure and no full-shift overtime anywhere`, !/[Aa]bandon[^s]*%|Est\. Abandon|full 8-hour shift/.test(html + JSON.stringify(rep)));
  ok(`${label}: the assumptions name the multiplier's source and the open hours`, sec(rep, "Planning Assumptions").items.join(" ").includes(v.hoursPerDay + " open hours a day") && /Fair Labor Standards Act|entered by you/.test(sec(rep, "Planning Assumptions").items.join(" ")));
  ok(`${label}: no NaN, Infinity, undefined or float noise in the page or the report`, !/NaN|Infinity|undefined/.test(html + JSON.stringify(rep)) && !NOISE.test(html + JSON.stringify(rep)));
}

section("The method page's worked example is the tool's default case");
const ex = ADHERENCE_MODEL.example.result, d = runAdherence(DEFAULTS);
ok("same inputs: the example's result equals the engine at the tool's defaults", JSON.stringify(ex) === JSON.stringify(d));
const steps = ADHERENCE_MODEL.example.steps.map((s) => s[1]).join(" ");
ok("the page prints the engine's overtime and the published Erlang C values", steps.includes(usd(d.firstMiss.otCost) + " a year") && steps.includes("0.6821, 0.4494, 0.2853, 0.1741"));
ok("the method page carries no float noise", !NOISE.test(JSON.stringify({ ...ADHERENCE_MODEL, example: { ...ADHERENCE_MODEL.example, result: null } }) + JSON.stringify(ADHERENCE_MODEL.constants())));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
