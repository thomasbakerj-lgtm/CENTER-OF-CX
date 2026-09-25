/* forecast.report.mjs
 *
 * Rendered-output reconciliation for the Forecast Accuracy Tracker. The page is bundled and
 * server-rendered with ReportActions swapped for a probe that captures every PDF section,
 * then every figure the PDF prints is reconciled to the engine run on the same rows: the
 * labelled sample, entered rows with a forecast running low, entered rows with no AHT, and an
 * old link that carries no AHT. The method page's worked example is proven to be the engine's.
 */
import { createRequire } from "node:module";
import { build } from "esbuild";
import { encodeScenario } from "./src/lib/scenarioUrl.js";
import { runForecast } from "./src/lib/forecast.js";
import { FORECAST_MODEL } from "./src/lib/rubrics/forecastModel.js";

const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);

const loc = { search: "", pathname: "/tools/forecast-accuracy", href: "https://www.contactcentercx.com/tools/forecast-accuracy", hash: "", origin: "https://www.contactcentercx.com" };
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
const r = await build({ entryPoints: ["./ForecastAccuracyTracker.jsx"], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic", loader: { ".js": "jsx" }, external: ["react", "react-dom"], logLevel: "silent",
  plugins: [{ name: "probe", setup(b) { b.onResolve({ filter: /^\.\/ReportActions$/ }, () => ({ path: "p", namespace: "probe" })); b.onLoad({ filter: /.*/, namespace: "probe" }, () => ({ contents: PROBE, loader: "jsx", resolveDir: process.cwd() })); } }] });
const mod = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
const { DEFAULTS, FC_PARAMS } = mod.exports;

const render = (state) => {
  loc.search = state ? "?s=" + encodeScenario("forecast-accuracy", state, DEFAULTS) : "";
  globalThis.__REPORT = null;
  const html = renderToString(React.createElement(mod.exports.default));
  return { html: html.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/g, " ").replace(/\s+/g, " "), rep: globalThis.__REPORT };
};
const sec = (rep, title) => rep.sections.find((s) => s.title === title);
const pc = (x, d = 1) => (x === null ? "n/a" : (x * 100).toFixed(d) + "%");
const NOISE = /\d\.\d*0000000\d|\d\.\d*9999999\d/;
const low = DEFAULTS.rows.map((r) => ({ ...r, actual: Math.round(r.forecast * 1.15) + 1 }));

const cases = [
  ["the labelled sample", null, true],
  ["entered rows, forecast running low", { ...DEFAULTS, rows: low }, false],
  ["entered rows, no AHT", { ...DEFAULTS, rows: low, aht: 0 }, false],
  ["old link without an AHT", { channel: "chat", variance: 12, rows: DEFAULTS.rows.map((r) => ({ ...r, actual: r.forecast + 3 })) }, false],
];
for (const [label, state, sample] of cases) {
  section(`Reconciliation: ${label}`);
  const { html, rep } = render(state);
  const v = { ...DEFAULTS, ...(state || {}) };
  const X = runForecast(v.rows, FC_PARAMS, v.aht);
  ok(`${label}: the page rendered and handed the report its sections`, !!rep && rep.sections.length >= 6);
  ok(`${label}: interval accuracy leads the page, the summary and the PDF metrics`, html.includes(pc(X.intervalAccuracy)) && rep.summary[0].label === "Interval accuracy" && rep.summary[0].value === pc(X.intervalAccuracy) && sec(rep, "Accuracy Metrics").items[0].value === pc(X.intervalAccuracy));
  ok(`${label}: WAPE, MAPE, total-volume accuracy and the tracking signal equal the engine`, rep.summary[1].value === pc(X.wape) && rep.summary[2].value === pc(X.mape) && sec(rep, "Accuracy Metrics").items[2].value === pc(X.totalAccuracy) && rep.summary[3].value === X.trackingSignal.toFixed(1));
  const F = sec(rep, "Key Findings").items.join(" ");
  ok(`${label}: the findings carry the contacts missed and say what the tracking signal reads`, F.includes(X.absErr.toLocaleString("en-US") + " contacts") && (X.lean === "above" ? /forecast is running low/.test(F) : X.lean === "below" ? /forecast is running high/.test(F) : /not distinguished from random error/.test(F)));
  if (label.includes("running low")) ok(`${label}: a forecast 15% low every interval reads as running low`, X.lean === "above");
  ok(`${label}: the largest misses equal the engine's, ranked by contacts`, sec(rep, "Largest Misses").rows.length === X.worst.length && sec(rep, "Largest Misses").rows.every((r, j) => r[0] === X.worst[j].interval));
  if (v.aht > 0) ok(`${label}: workload hours equal the engine at the AHT used`, F.includes((Math.round(X.underHours * 10) / 10).toLocaleString("en-US") + " workload hours unplanned") && F.includes(v.aht + " seconds a contact"));
  else ok(`${label}: with no AHT, no workload hours are claimed`, /Enter an AHT/.test(F) && !/workload hours unplanned/.test(F));
  ok(`${label}: the data section says whether the rows are the sample`, sec(rep, "Data").content.startsWith(sample ? "These are sample volumes" : "Forecast and actual volumes as entered"));
  ok(`${label}: no NaN, Infinity, undefined or float noise in the page or the report`, !/NaN|Infinity|undefined/.test(html + JSON.stringify(rep)) && !NOISE.test(html + JSON.stringify(rep)));
}

section("The method page's worked example is the engine's");
const PAIR = [{ interval: "9:00", forecast: 100, actual: 80 }, { interval: "9:30", forecast: 100, actual: 120 }];
const ex = FORECAST_MODEL.example.result, d = runForecast(PAIR, FC_PARAMS, 360);
ok("same rows: the example's result equals the engine", JSON.stringify(ex) === JSON.stringify(d));
const steps = FORECAST_MODEL.example.steps.map((s) => s[1]).join(" ");
ok("the page shows total accuracy 100% beside WAPE 20%", steps.includes("= 100.0%") && steps.includes("= 20.0%, interval accuracy 80.0%"));
ok("the page runs on the tool's own parameters and says what its example is", JSON.stringify(FC_PARAMS) === JSON.stringify({ tsLimit: 4, intervalMin: 30 }) && /two intervals chosen/.test(FORECAST_MODEL.example.note));
ok("the method page carries no float noise", !NOISE.test(JSON.stringify({ ...FORECAST_MODEL, example: { ...FORECAST_MODEL.example, result: null } }) + JSON.stringify(FORECAST_MODEL.constants())));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
