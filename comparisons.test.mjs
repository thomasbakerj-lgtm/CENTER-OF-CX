/* comparisons.test.mjs
 *
 * "How others report it" (src/lib/comparisons.js, src/lib/HowOthersReport.jsx, src/lib/comparisons/stateWages.js).
 * Published figures shown beside a tool's result, from TB's two benchmark research runs (28 Sep 2026), each read on
 * the page it cites. The rules this file holds:
 *   1. Every source is complete: publisher, title, date published, date checked, an https link.
 *   2. Every row names its kind and resolves a source; industry FCR rows are the claims registry's own facts.
 *   3. Display only: no tool imports the figures; the panel reads no tool state; no engine region names it.
 *   4. Each tool in the map renders the panel with its own id, and the server render carries every figure and source.
 *   5. Nothing withheld renders: misattributed, vendor-defined, forecast, averaged or out-of-date figures.
 *   6. The state wages: 51 rows, the national median equal to the registry wage, annual close to hourly x 2,080.
 *   7. The retired unsourced lines stay retired (TCO hints, Staffing's "Most centres run", CPC vertical ranges).
 *
 * Run from repo root: node comparisons.test.mjs
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const C = await import("./src/lib/comparisons.js");
const W = await import("./src/lib/comparisons/stateWages.js");
const { CLAIMS } = await import("./src/lib/claims.js");
const { benchmark } = await import("./src/lib/benchmarks.js");
const { JOURNEY } = await import("./src/lib/journey.js");

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail ? "(" + detail + ")" : ""); } };
const section = (t) => console.log("\n" + t);
const read = (p) => readFileSync(p, "utf8");

const TOOL_FILES = {
  "fcr-leakage": "FCRLeakageDiagnostic.jsx", "cost-per-contact": "CostPerContactCalculator.jsx", "attrition-cost": "AttritionCostCalculator.jsx",
  "staffing-calculator": "StaffingCalculator.jsx", "occupancy-risk": "OccupancyRiskSimulator.jsx", "shrinkage-planner": "ShrinkagePlanner.jsx",
  "schedule-adherence": "ScheduleAdherenceCalculator.jsx", "ai-deflection": "AIDeflectionRealityCheck.jsx", "channel-shift": "ChannelShiftModel.jsx",
  "tco-calculator": "TCOCalculator.jsx", "license-gap": "LicenseBundleGapChecker.jsx",
};

section("1. Sources");
for (const [id, s] of Object.entries(C.SOURCES)) {
  ok(`${id}: publisher, title, published, checked`, s.publisher && s.title && s.published && s.checked, JSON.stringify(s));
  ok(`${id}: https link`, /^https:\/\/[^\s]+$/.test(s.url), s.url);
}

section("2. Rows");
const groups = Object.fromEntries(Object.keys(C.GROUPS).map((k) => [k, C.GROUPS[k]()]));
let rows = 0;
for (const g of Object.values(groups)) {
  ok(`${g.id}: title, note, kind`, g.title && g.note && C.KIND_LABEL[g.kind]);
  for (const r of g.rows) {
    rows++;
    ok(`${g.id} / ${r.label}: value and label`, typeof r.value === "string" && r.value && r.label);
    ok(`${g.id} / ${r.label}: kind known`, C.KIND_LABEL[r.kind || g.kind]);
    if (r.claim) {
      const c = CLAIMS[r.claim];
      ok(`${g.id} / ${r.label}: claim ${r.claim} is a checked fact`, c && c.kind === "fact" && c.source && /^https:/.test(c.source.url));
    } else {
      ok(`${g.id} / ${r.label}: source resolves`, C.SOURCES[r.src || g.src], r.src || g.src);
    }
    const s = C.rowSource(r, g);
    ok(`${g.id} / ${r.label}: rowSource gives a link`, s && /^https:/.test(s.url));
  }
}
ok("rows exist", rows > 40, String(rows));
/* The FCR group reads its industry figures from the claims registry, the same records the industry pages render. */
const fcr = groups.fcr;
for (const r of fcr.rows.filter((x) => x.claim)) ok(`FCR ${r.label} equals claim ${r.claim}`, r.value === CLAIMS[r.claim].value);
ok("FCR group: one publisher (SQM Group)", fcr.rows.every((r) => C.rowSource(r, fcr).publisher === "SQM Group"));
ok("FCR group: Retail 77%, Telco 56%, Health insurance 69%", ["Retail|77%", "Telco|56%", "Health insurance|69%"].every((p) => { const [l, v] = p.split("|"); return fcr.rows.some((r) => r.label === l && r.value === v); }));
ok("FCR note names the industries SQM does not publish", /manufacturing, education and travel/.test(fcr.note));
ok("prices: never averaged (no row or note states an average)", !/average/i.test(groups.prices.rows.map((r) => r.label + r.value + (r.detail || "")).join(" ")));
ok("prices: every row names its terms", groups.prices.rows.every((r) => r.detail && /(user|agent|seat)/.test(r.detail)));
ok("attrition: NICE row says unmanaged", groups.attrition.rows.some((r) => r.src === "nice25" && /Unmanaged/.test(r.label)));

section("3. Display only");
const cmpSrc = read("src/lib/comparisons.js"), panelSrc = read("src/lib/HowOthersReport.jsx");
ok("comparisons.js imports only the claims registry", (cmpSrc.match(/^import .*$/gm) || []).every((l) => /\.\/claims\.js/.test(l)));
ok("the panel takes only a tool id", /export function HowOthersReport\(\{ toolId \}\)/.test(panelSrc));
ok("the panel reads no rail, scenario or tracking", !/toolData|scenarioUrl|track\.js|publishToolResult|getExternal/.test(panelSrc));
for (const [id, f] of Object.entries(TOOL_FILES)) {
  const s = read(f);
  ok(`${f}: does not import the figures`, !/comparisons(\.js|\/stateWages)/.test(s));
  const m = s.match(/\/\* @engine-start \*\/([\s\S]*?)\/\* @engine-end \*\//);
  ok(`${f}: engine region never names the panel`, !m || !/HowOthersReport|comparisons/.test(m[1]));
}

section("4. Every mapped tool renders the panel");
for (const [id, f] of Object.entries(TOOL_FILES)) {
  ok(`${id}: in the map and a journey tool`, C.TOOL_GROUPS[id] && JOURNEY[id]);
  const s = read(f);
  ok(`${f}: TOOL_ID is ${id}`, new RegExp(`const TOOL_ID = "${id}"`).test(s));
  ok(`${f}: renders <HowOthersReport toolId={TOOL_ID} /> once`, (s.match(/<HowOthersReport toolId=\{TOOL_ID\} \/>/g) || []).length === 1);
}
ok("the map names only tools that render it", Object.keys(C.TOOL_GROUPS).every((k) => TOOL_FILES[k]));

const r = await build({ entryPoints: ["./src/lib/HowOthersReport.jsx"], bundle: true, write: false, format: "cjs", platform: "node",
  jsx: "automatic", external: ["react", "react-dom"], logLevel: "silent" });
const mod = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
const P = mod.exports;
const html = {};
for (const id of Object.keys(C.TOOL_GROUPS)) {
  const out = renderToStaticMarkup(React.createElement(P.HowOthersReport, { toolId: id }));
  html[id] = out;
  const text = out.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&#x27;/g, "'");
  ok(`${id}: one h2, How others report it`, (out.match(/<h2/g) || []).length === 1 && /How others report it/.test(out));
  for (const g of C.groupsFor(id)) {
    for (const row of g.rows) {
      ok(`${id}: shows ${g.id} / ${row.label}`, text.includes(row.value) && text.includes(row.label));
      ok(`${id}: links the source of ${row.label}`, out.includes(C.rowSource(row, g).url.replace(/&/g, "&amp;")));
    }
  }
  ok(`${id}: outside links open safely`, (out.match(/target="_blank"/g) || []).length === (out.match(/rel="noopener noreferrer"/g) || []).length);
  ok(`${id}: says the figures never change the result or grade`, /None of them changes your result or its grade/.test(text));
  ok(`${id}: wage picker exactly when mapped`, /Where are your agents\?/.test(text) === !!C.TOOL_GROUPS[id].wage);
  ok(`${id}: no NaN, undefined or dash`, !/NaN|undefined|Infinity|[\u2013\u2014]/.test(text));
}
ok("a tool with no comparison renders nothing", renderToStaticMarkup(React.createElement(P.HowOthersReport, { toolId: "roadmap-builder" })) === "");

section("5. Nothing withheld renders");
const everything = Object.values(html).join(" ") + " " + Object.values(TOOL_FILES).map(read).join(" ");
for (const w of C.WITHHELD) {
  ok(`withheld has a reason: ${w.claim}`, w.reason && w.match.length);
  for (const m of w.match) ok(`withheld string absent from every tool and panel: "${m}"`, !everything.includes(m));
}

section("6. State wages");
ok("51 rows (50 states and DC)", W.STATE_WAGES.length === 51);
ok("postal codes unique", new Set(W.STATE_WAGES.map((x) => x[0])).size === 51);
ok("national median equals the registry wage", W.NATIONAL_WAGE.hourly === benchmark("market.wage.agent"));
for (const [code, name, hr, yr] of W.STATE_WAGES) {
  ok(`${code}: plausible median`, hr > 12 && hr < 40 && name.length > 3);
  ok(`${code}: annual within $60 of hourly x 2,080`, Math.abs(yr - hr * 2080) <= 60, `${yr} vs ${hr * 2080}`);
}
ok("pinned: California $23.83, Mississippi $17.49, Washington $24.20", ["CA|23.83", "MS|17.49", "WA|24.2"].every((p) => { const [c, v] = p.split("|"); return W.STATE_WAGES.find((x) => x[0] === c)[2] === Number(v); }));
ok("source is BLS May 2025, read on O*NET", /Bureau of Labor Statistics/.test(W.STATE_WAGE_SOURCE.publisher) && W.STATE_WAGE_SOURCE.period === "May 2025" && /onetonline\.org/.test(W.STATE_WAGE_SOURCE.url("CA")));
{
  const out = html["staffing-calculator"];
  ok("the picker opens on the United States median", out.includes("$21.53") && /<option value="" selected="">United States<\/option>/.test(out));
}

section("7. Retired lines stay retired");
ok("TCO: no 'Bench 5:00 to 7:00'", !read("TCOCalculator.jsx").includes("Bench 5:00"));
ok("TCO: no '$4.5K to $7.5K'", !read("TCOCalculator.jsx").includes("4.5K to"));
ok("Staffing: no 'Most centres run'", !read("StaffingCalculator.jsx").includes("Most centres run"));
ok("Staffing: the 80/20 line names its source", read("StaffingCalculator.jsx").includes("SQM Group calls 80% in 20 seconds the traditional standard"));
ok("CPC: no vertical planning ranges", !/VBENCH|cpc\.vert\./.test(read("CostPerContactCalculator.jsx")));

section("8. Copy");
for (const f of ["src/lib/comparisons.js", "src/lib/HowOthersReport.jsx", "src/lib/comparisons/stateWages.js"]) {
  ok(`${f}: no dash characters`, !/[\u2013\u2014]/.test(read(f)));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
