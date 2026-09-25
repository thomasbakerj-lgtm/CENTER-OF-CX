/* journey.test.mjs
 *
 * The journey contract harness. Tracker 3-01.
 *
 * A journey link fails silently. A dead route renders NotFound, a missing edge
 * renders nothing, and an untracked click is invisible. None of those shows up
 * as a wrong number, so the arithmetic harnesses cannot see them. This one reads
 * the graph as data and the call sites as source.
 *
 * Run: node journey.test.mjs
 */

import { readFileSync, readdirSync } from "node:fs";
import { JOURNEY, PROVING_JOURNEY, DECISION_NODE, nextFor, nextDiagnostic, nextSection, withNextStep, toolAt } from "./src/lib/journey.js";
import { RUBRICS } from "./src/lib/rubrics/index.js";

let pass = 0, fail = 0;
const failures = [];
const ok = (label, cond) => { if (cond) pass++; else { fail++; failures.push(label); } };
const section = (n) => console.log(`\n--- ${n}`);

const APP = readFileSync("App.jsx", "utf8");
const liveRoutes = new Set([...APP.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]));
const ids = Object.keys(JOURNEY);

/* The node set is derived from source, never listed by hand: every JSX file at
   the root that renders <ReportActions and declares TOOL_ID and ROUTE. */
const toolFiles = readdirSync(".").filter((f) => f.endsWith(".jsx") && f !== "ReportActions.jsx")
  .map((f) => ({ f, src: readFileSync(f, "utf8") }))
  .filter(({ src }) => /<ReportActions\b/.test(src))
  .map(({ f, src }) => ({
    f,
    id: (src.match(/const TOOL_ID\s*=\s*"([^"]+)"/) || [])[1],
    route: (src.match(/const ROUTE\s*=\s*"([^"]+)"/) || [])[1],
  }));

/* ------------------------------------------------------------ A. nodes */
section("A. Every ReportActions tool is a node on a live route");
ok("A0  at least nine tools render ReportActions", toolFiles.length >= 9);
ok("A0b node count equals ReportActions tool count", ids.length === toolFiles.length);
for (const t of toolFiles) {
  ok(`A1  ${t.f}: declares TOOL_ID and ROUTE`, !!t.id && !!t.route);
  ok(`A2  ${t.f}: TOOL_ID ${t.id} is a journey node`, !!JOURNEY[t.id]);
  ok(`A3  ${t.f}: ROUTE ${t.route} is a live App route`, liveRoutes.has(t.route));
  if (JOURNEY[t.id]) ok(`A4  ${t.f}: node route equals ROUTE`, JOURNEY[t.id].route === t.route);
}
for (const id of ids) {
  ok(`A5  ${id}: node route is live`, liveRoutes.has(JOURNEY[id].route));
  ok(`A6  ${id}: has a display name`, typeof JOURNEY[id].name === "string" && JOURNEY[id].name.length > 2);
}

/* ------------------------------------------------------------ B. edges */
section("B. Edges are well formed and stay inside V3");
const DASH = /[\u2013\u2014]/;
for (const id of ids) {
  const edges = JOURNEY[id].next;
  /* Edges are the routes a result can take; only one renders (section E), so a node may carry more than three. */
  ok(`B0  ${id}: at least one edge`, Array.isArray(edges) && edges.length >= 1);
  ok(`B1  ${id}: no duplicate targets`, new Set(edges.map((e) => e.to)).size === edges.length);
  for (const e of edges) {
    ok(`B2  ${id} -> ${e.to}: target is a V3 node`, !!JOURNEY[e.to]);
    ok(`B3  ${id} -> ${e.to}: not a self edge`, e.to !== id);
    ok(`B4  ${id} -> ${e.to}: rationale present and short`, typeof e.why === "string" && e.why.length >= 20 && e.why.length <= 120);
    ok(`B5  ${id} -> ${e.to}: rationale carries no en or em dash`, !DASH.test(e.why));
  }
  ok(`B6  ${id}: nextFor resolves every edge`, nextFor(id).length === edges.length);
  for (const r of nextFor(id)) ok(`B7  ${id} -> ${r.to}: resolved href is live`, liveRoutes.has(r.href));
}
for (const bad of ["", "nope", "__proto__", "constructor", null, undefined]) {
  ok(`B8  nextFor(${JSON.stringify(bad)}) renders nothing`, nextFor(bad).length === 0);
}

/* ------------------------------------------------------------ C. shape */
section("C. The proving journey exists and every path ends at a decision");
for (let i = 0; i < PROVING_JOURNEY.length - 1; i++) {
  const a = PROVING_JOURNEY[i], b = PROVING_JOURNEY[i + 1];
  ok(`C0  proving edge ${a} -> ${b}`, !!JOURNEY[a] && JOURNEY[a].next.some((e) => e.to === b));
}
ok("C1  proving journey ends at the decision node", PROVING_JOURNEY[PROVING_JOURNEY.length - 1] === DECISION_NODE);
const reaches = (start, goal) => {
  const seen = new Set([start]); const q = [start];
  while (q.length) {
    const n = q.shift();
    if (n === goal) return true;
    for (const e of (JOURNEY[n] ? JOURNEY[n].next : [])) if (!seen.has(e.to)) { seen.add(e.to); q.push(e.to); }
  }
  return false;
};
for (const id of ids) {
  if (id !== DECISION_NODE) ok(`C2  ${id}: reaches ${DECISION_NODE}`, reaches(id, DECISION_NODE));
  ok(`C3  ${id}: has an inbound edge`, ids.some((o) => o !== id && JOURNEY[o].next.some((e) => e.to === id)));
}

/* ------------------------------------------------------------ D. source */
section("D. ReportActions renders the graph and tracks every click");
const RA = readFileSync("ReportActions.jsx", "utf8");
ok("D0  imports nextDiagnostic and withNextStep from src/lib/journey", /import\s*\{\s*nextDiagnostic,\s*withNextStep\s*\}\s*from\s*"\.\/src\/lib\/journey"/.test(RA));
ok("D1  renders one step, nextDiagnostic(toolId, next)", /const step = nextDiagnostic\(toolId, next\)/.test(RA) && !/nextFor\(toolId\)\.map/.test(RA));
ok("D2  the rendered step fires trackTool.nextStep(toolId, step.to)", /trackTool\.nextStep\(toolId,\s*step\.to\)/.test(RA));
ok("D3  href comes from the graph, never a literal", /href=\{step\.href\}/.test(RA));
const block = RA.slice(RA.indexOf("run this next"), RA.indexOf("request review */"));
ok("D4  the card holds no hardcoded tool route", !/\/tools\//.test(block));
ok("D5  the card sits before the review card", RA.indexOf("Run this next") > 0 && RA.indexOf("Run this next") < RA.indexOf("Have someone read it"));
ok("D6  the PDF carries the same step (withNextStep on the exported sections)", /const ownSections = withNextStep\(toolId, sections, next\)/.test(RA));

/* ------------------------------------------------------ E. NextDiagnostic */
/* P2 task 8 (tracker 3-02): one next step per result, from this graph only, on the page and in the PDF. */
section("E. One next diagnostic per result, and it is an edge of the graph");
{
  /* Every choice an engine can make is an edge of its tool, so no result names a tool the graph does not route to. */
  const choices = {};
  for (const [id, r] of Object.entries(RUBRICS)) {
    const t = new Set();
    for (const d of r.dims || r.areas || []) if (d.next) t.add(d.next);
    if (r.next) for (const v of Object.values(r.next)) if (typeof v === "string") t.add(v);
    choices[id] = t;
  }
  const AID = readFileSync("AIDeflectionRealityCheck.jsx", "utf8");
  choices["ai-deflection"] = new Set([...AID.matchAll(/verdictRoute = "(\/tools\/[a-z-]+)"/g)].map((m) => toolAt(m[1])));
  choices["attrition-cost"] = new Set(["occupancy-risk"]);
  for (const [id, set] of Object.entries(choices)) {
    if (!set.size) continue;
    const edges = new Set((JOURNEY[id] ? JOURNEY[id].next : []).map((e) => e.to));
    const missing = [...set].filter((t) => !edges.has(t));
    ok(`E1  ${id}: every next tool its engine can choose is an edge [${missing.join(", ")}]`, !!JOURNEY[id] && missing.length === 0);
  }
  for (const id of ids) {
    const n = nextDiagnostic(id);
    ok(`E2  ${id}: with no choice, one step, the first edge`, !!n && n.to === JOURNEY[id].next[0].to && typeof n.href === "string" && n.why.length > 10);
    for (const e of JOURNEY[id].next) ok(`E3  ${id}: a choice of ${e.to} is honoured`, nextDiagnostic(id, { to: e.to }).to === e.to && nextDiagnostic(id, e.to).to === e.to);
    ok(`E4  ${id}: a choice outside the graph falls back to the first edge`, nextDiagnostic(id, "not-a-tool").to === JOURNEY[id].next[0].to);
  }
  ok("E5  the result's reason replaces the edge's", nextDiagnostic("cx-maturity", { to: "qa-scorecard", because: "Operations is your lowest-scoring dimension." }).why === "Operations is your lowest-scoring dimension.");
  const composed = withNextStep("cost-per-contact", [{ title: "A", type: "text" }, { title: "Old", type: "next", items: [1, 2, 3] }]);
  ok("E6  the PDF keeps the tool's sections, drops any next list, and adds exactly one step", composed.length === 2 && composed.filter((x) => x.type === "next").length === 1 && composed[1].items.length === 1 && composed[1].title === "Next Step");
  ok("E7  an unknown tool gets no step", nextDiagnostic("not-a-tool") === null && nextSection("not-a-tool") === null);
  const tools = readdirSync(".").filter((f) => f.endsWith(".jsx") && /<ReportActions\b/.test(readFileSync(f, "utf8")));
  const own = tools.filter((f) => /type: "next"/.test(readFileSync(f, "utf8")));
  ok(`E8  no tool authors its own next-step list (${tools.length} tools) [${own.join(", ")}]`, tools.length >= 25 && own.length === 0);
  const engineTools = ["CXMaturity.jsx", "AIReadiness.jsx", "TransformationReadiness.jsx", "CXITAlignment.jsx", "GovernanceModel.jsx", "PlatformDecisionMatrix.jsx", "ContractRiskScanner.jsx", "RFPRequirementBuilder.jsx", "QAScorecardBuilder.jsx", "AIDeflectionRealityCheck.jsx", "AttritionCostCalculator.jsx"];
  const noChoice = engineTools.filter((f) => !/<ReportActions[\s\S]{0,80}next=\{/.test(readFileSync(f, "utf8")));
  ok(`E9  every tool whose result chooses a step passes that choice [${noChoice.join(", ")}]`, noChoice.length === 0);
}

/* ------------------------------------------------------------ report */
if (failures.length) {
  console.log("\nFAILURES");
  for (const f of failures.slice(0, 40)) console.log(`  ${f}`);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
