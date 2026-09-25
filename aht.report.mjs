/* aht.report.mjs
 *
 * Rendered-output reconciliation for AHT Decomposition. The page is bundled and
 * server-rendered with ReportActions swapped for a probe that captures every PDF section,
 * then every figure the PDF prints is reconciled to the engine run on the same inputs: at
 * the defaults, with two levers switched off and one share edited, with no volume, and on
 * an old link that carries only components. The method page's worked example is proven to
 * be the tool's own default case.
 */
import { createRequire } from "node:module";
import { build } from "esbuild";
import { encodeScenario } from "./src/lib/scenarioUrl.js";
import { runAHT } from "./src/lib/aht.js";
import { AHT_MODEL } from "./src/lib/rubrics/ahtModel.js";

const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);

const loc = { search: "", pathname: "/tools/aht-decomposition", href: "https://www.contactcentercx.com/tools/aht-decomposition", hash: "", origin: "https://www.contactcentercx.com" };
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
const r = await build({ entryPoints: ["./AHTDecomposition.jsx"], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic", loader: { ".js": "jsx" }, external: ["react", "react-dom"], logLevel: "silent",
  plugins: [{ name: "probe", setup(b) { b.onResolve({ filter: /^\.\/ReportActions$/ }, () => ({ path: "p", namespace: "probe" })); b.onLoad({ filter: /.*/, namespace: "probe" }, () => ({ contents: PROBE, loader: "jsx", resolveDir: process.cwd() })); } }] });
const mod = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
const { DEFAULTS } = mod.exports;

const render = (state) => {
  loc.search = state ? "?s=" + encodeScenario("aht-decomposition", state, DEFAULTS) : "";
  globalThis.__REPORT = null;
  const html = renderToString(React.createElement(mod.exports.default));
  return { html: html.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/g, " ").replace(/\s+/g, " "), rep: globalThis.__REPORT };
};
const sec = (rep, title) => rep.sections.find((s) => s.title === title);
const fmt = (sec) => { const s = Math.round(sec); return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`; };
const pc = (x, d = 0) => (x * 100).toFixed(d) + "%";
const NOISE = /\d\.\d*0000000\d|\d\.\d*9999999\d/;
const deep = (s) => ({ ...DEFAULTS, ...s, values: { ...DEFAULTS.values, ...(s.values || {}) }, levers: Object.fromEntries(Object.keys(DEFAULTS.levers).map((k) => [k, { ...DEFAULTS.levers[k], ...((s.levers || {})[k] || {}) }])) });

const cases = [
  ["defaults", null],
  ["two levers off, one share edited", { ...DEFAULTS, levers: { ...DEFAULTS.levers, desktop: { ...DEFAULTS.levers.desktop, on: false }, routing: { ...DEFAULTS.levers.routing, on: false }, summarization: { ...DEFAULTS.levers.summarization, wrap: 30 } } }],
  ["no volume", { ...DEFAULTS, contacts: 0 }],
  ["old link, components only", { values: { talk: 240, hold: 80, wrap: 50, transfer: 30, search: 45, admin: 35 }, contactType: "techSupport" }],
];
for (const [label, state] of cases) {
  section(`Reconciliation: ${label}`);
  const { html, rep } = render(state);
  const v = deep(state || {});
  const X = runAHT(v);
  ok(`${label}: the page rendered and handed the report its sections`, !!rep && rep.sections.length >= 6);
  ok(`${label}: handle time ${fmt(X.total)} on the page, in the summary and in the PDF metrics`, html.includes(fmt(X.total)) && rep.summary[0].value === fmt(X.total) && sec(rep, "Summary Metrics").items[0].value === fmt(X.total));
  ok(`${label}: conversation share and time outside it equal the engine`, rep.summary[1].value === pc(X.talkShare) && rep.summary[2].value === fmt(X.nonTalk));
  ok(`${label}: the combined handle time equals the engine and counts only selected levers`, rep.summary[3].value === fmt(X.combinedNew) && sec(rep, "Summary Metrics").items[3].sub === X.selected + " selected");
  const rows = sec(rep, "Levers").rows;
  ok(`${label}: every lever row carries the engine's seconds and handle time, and says whether it is selected`, rows.length === 4 && X.levers.every((L, j) => rows[j][0].includes(L.on ? "(selected)" : "(not selected)") && rows[j][1].includes(fmt(L.saved) + " a contact") && rows[j][1].includes("handle time " + fmt(L.newAHT))));
  const F = sec(rep, "Key Findings").items.join(" ");
  if (v.contacts > 0 && X.selected) ok(`${label}: agent hours equal the engine and are called capacity`, F.includes(Math.round(X.combinedHours).toLocaleString("en-US") + " agent hours a year of capacity") && /becomes cash only through an action/.test(F));
  else ok(`${label}: with no volume, no hours are claimed`, !/agent hours a year of capacity/.test(F) && /Enter contacts per month/.test(F));
  ok(`${label}: the component rows equal the engine`, sec(rep, "AHT Components").rows.slice(0, 6).every((r, j) => r[1] === `${fmt(v.values[["talk", "hold", "wrap", "transfer", "search", "admin"][j]])} (${pc(X.shares[["talk", "hold", "wrap", "transfer", "search", "admin"][j]])})`));
  ok(`${label}: the PDF labels the lever shares as heuristics and the profiles as illustrative`, sec(rep, "Planning Assumptions").items.some((x) => /planning heuristic with no published source/.test(x)) && sec(rep, "Planning Assumptions").items.some((x) => /illustrative/.test(x)));
  ok(`${label}: no NaN, Infinity, undefined or float noise in the page or the report`, !/NaN|Infinity|undefined/.test(html + JSON.stringify(rep)) && !NOISE.test(html + JSON.stringify(rep)));
}

section("The method page's worked example is the tool's default case");
const ex = AHT_MODEL.example.result, d = runAHT(DEFAULTS);
ok("same inputs: the example's result equals the engine at the tool's defaults", JSON.stringify(ex) === JSON.stringify(d));
const steps = AHT_MODEL.example.steps.map((s) => s[1]).join(" ");
ok("the method page prints the engine's combined figure and hours", steps.includes(Math.round(d.combinedHours).toLocaleString("en-US") + " hours") && steps.includes((Math.round(d.combinedNew * 10) / 10) + "s"));
ok("the method page carries no float noise", !NOISE.test(JSON.stringify({ ...AHT_MODEL, example: { ...AHT_MODEL.example, result: null } }) + JSON.stringify(AHT_MODEL.constants())));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
