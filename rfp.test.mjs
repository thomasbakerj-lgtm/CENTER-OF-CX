/* rfp.test.mjs
 *
 * The RFP engine (src/lib/rfp.js) and the RFP model it reads (src/lib/rubrics/rfpBuilder.js).
 * The engine is sliced from its markers and must equal the module. Coverage, statuses,
 * the order and its ties, deciders, common gaps and every rule are checked against an
 * oracle on random evaluations. The laws are gated directly: only generally available
 * earns full credit, preview and roadmap earn none, an unanswered line is never a zero,
 * the order is only the vendors entered, and a vertical's requirements survive a link.
 */
import { readFileSync } from "node:fs";
import * as E0 from "./src/lib/rfp.js";
import { RFP_BUILDER as M } from "./src/lib/rubrics/rfpBuilder.js";
import { RUBRICS } from "./src/lib/rubrics/index.js";
import { JOURNEY } from "./src/lib/journey.js";

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
const DASH = new RegExp("[" + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + "]");
let seed = 20260924;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const RESP = M.responses.map((r) => r.id);
const close = (a, b) => a === b || Math.abs(a - b) < 1e-9;

const randomEval = () => {
  const vertical = pick(M.verticals), size = pick(M.sizes);
  const activeTags = ["all", ...M.tags.filter(() => rnd() < 0.4).map((t) => t.id)];
  const base = { vertical, size, activeTags, reqs: {} };
  const reqs = E0.rfpRequirements(M, base);
  for (const r of reqs) if (rnd() < 0.2) base.reqs[r.key] = pick(["must", "should", "nice"]);
  const n = Math.floor(rnd() * 5);
  base.vendors = Array.from({ length: n }, (_, i) => (rnd() < 0.1 ? "" : "V" + i));
  base.responses = {}; base.verified = {};
  base.vendors.forEach((_, vi) => {
    base.responses[vi] = {}; base.verified[vi] = {};
    const style = rnd();
    for (const r of reqs) {
      const x = rnd();
      if (x < 0.08) continue;
      base.responses[vi][r.key] = style < 0.4 ? (x < 0.9 ? "ga" : pick(RESP)) : pick(RESP);
      if (rnd() < 0.3) base.verified[vi][r.key] = true;
    }
  });
  if (rnd() < 0.3) base.weights = { must: Math.floor(rnd() * 6), should: Math.floor(rnd() * 3), nice: Math.floor(rnd() * 2) };
  return base;
};

section("0. The engine is sliced live and matches the module");
const SRC = readFileSync("./src/lib/rfp.js", "utf8");
const a = SRC.indexOf("/* @engine-start */"), b = SRC.indexOf("/* @engine-end */");
ok("engine markers present, in order", a > 0 && b > a);
const BODY = SRC.slice(a, b);
const load = (body) => new Function(body + "\nreturn { rfpTags, rfpRequirements, scoreRfp };")();
const E = load(BODY);
ok("the slice has no import, JSX or DOM access", !/import |<[A-Z]|window\.|document\./.test(BODY));
let same = true;
for (let i = 0; i < 2000; i++) { const s = randomEval(); if (JSON.stringify(E.scoreRfp(M, s)) !== JSON.stringify(E0.scoreRfp(M, s))) same = false; }
ok("2,000 random evaluations: the sliced engine equals the module", same);

section("1. The published model is complete and clean");
ok("registered in the rubric registry", RUBRICS["rfp-builder"] === M);
ok("kind rfp, version, date and methodology route", M.kind === "rfp" && /^\d+\.\d+$/.test(M.version) && M.methodology === "/methodology/rfp-builder");
ok("7 layers and 50 requirements, unchanged from the previous version", M.layers.length === 7 && M.layers.reduce((s, l) => s + l.reqs.length, 0) === 50);
ok("only generally available responses earn full credit; preview and roadmap earn none", M.responses.filter((r) => r.credit === 1).every((r) => /generally available/.test(r.label)) && M.responses.find((r) => r.id === "preview").credit === 0 && M.responses.find((r) => r.id === "roadmap").credit === 0);
ok("the partner credit is labelled a default with no source", M.responses.find((r) => r.id === "partner").heuristic === true);
ok("default weights are stated and labelled", M.weights.must === 3 && M.weights.should === 1 && M.weights.nice === 0 && /no published source/.test(M.weightsNote));
for (const id of Object.values(M.next)) ok(`next step ${id} is a journey tool`, !!JOURNEY[id]);
for (const [id, r] of Object.entries(M.rules)) ok(`rule ${id}: severity, title, test and action`, ["critical", "high", "medium", "info"].includes(r.severity) && r.title && r.test && r.action);
ok("the model names no vendor and claims no ranking of its own", !/Genesys|NICE|Five9|Talkdesk|Amazon Connect|Zoom|8x8|Dialpad|Avaya|Cisco/.test(JSON.stringify(M.rules) + JSON.stringify(M.limits)) && /never adds, removes or ranks a vendor/.test(JSON.stringify(M.limits)));
ok("no dash anywhere in the model", !DASH.test(JSON.stringify(M)));

section("2. The requirement set");
const hc = E0.rfpRequirements(M, { vertical: "Healthcare", size: "Under 50 agents", activeTags: ["all"] });
ok("a Healthcare link keeps its HIPAA requirement: the vertical tag is derived, never lost", hc.some((r) => /HIPAA BAA with PHI encryption at rest/.test(r.text)));
ok("a Government link keeps FedRAMP", E0.rfpRequirements(M, { vertical: "Government", activeTags: ["all"] }).some((r) => r.text === "FedRAMP High authorization"));
ok("vertical requirements join as must-haves and can be reprioritized", hc.filter((r) => r.key.startsWith("v-")).every((r) => r.priority === "must") && E0.rfpRequirements(M, { vertical: "Healthcare", reqs: { "v-0": "should" } }).find((r) => r.key === "v-0").priority === "should");
ok("an unknown tag or priority from a link is ignored", E0.rfpRequirements(M, { activeTags: ["all", "bogus"], reqs: { "7-0": "urgent" } }).find((r) => r.key === "7-0").priority === "must");
ok("core requirements are always included", M.layers.every((l) => l.reqs.every((q, i) => !q.tags.includes("all") || E0.rfpRequirements(M, {}).some((r) => r.key === `${l.n}-${i}`))));

section("3. Scores, statuses, order and findings against an oracle");
const oracle = (s) => {
  const reqs = E0.rfpRequirements(M, s);
  const W = { ...M.weights, ...(s.weights || {}) };
  const credit = Object.fromEntries(M.responses.map((r) => [r.id, r.credit]));
  const vs = (s.vendors || []).map((n, vi) => ({ n: (n || "").trim(), vi })).filter((x) => x.n).map(({ n, vi }) => {
    const rs = (s.responses || {})[vi] || {};
    let pts = 0, pos = 0;
    for (const r of reqs) if (rs[r.key]) { pts += W[r.priority] * credit[rs[r.key]]; pos += W[r.priority]; }
    const must = reqs.filter((r) => r.priority === "must");
    const unmet = must.filter((r) => rs[r.key] === "no").length, notGA = must.filter((r) => rs[r.key] === "preview" || rs[r.key] === "roadmap").length, openMust = must.filter((r) => !rs[r.key]).length;
    return { vi, cov: pos ? (pts / pos) * 100 : null, status: unmet ? "unmet" : openMust ? "clarify" : notGA ? "conditional" : "meets" };
  });
  const orderable = vs.filter((v) => (v.status === "meets" || v.status === "conditional") && v.cov !== null).sort((x, y) => y.cov - x.cov || x.vi - y.vi);
  const pos = []; orderable.forEach((v, i) => pos.push(i && orderable[i - 1].cov - v.cov <= 5 ? pos[i - 1] : i + 1));
  return { vs, order: orderable.map((v, i) => v.vi + "@" + pos[i]).join() };
};
let oSame = true, first = null;
for (let i = 0; i < 20000; i++) {
  const s = randomEval(); const r = E0.scoreRfp(M, s), w = oracle(s);
  const g = { vs: r.vendors.map((v) => ({ vi: v.index, cov: v.coverage, status: v.status })), order: r.order.map((o) => o.vendor + "@" + o.position).join() };
  const eq = g.order === w.order && g.vs.length === w.vs.length && g.vs.every((v, j) => v.vi === w.vs[j].vi && v.status === w.vs[j].status && (v.cov === null ? w.vs[j].cov === null : close(v.cov, w.vs[j].cov)));
  if (!eq) { oSame = false; first = first || { g, w }; }
}
ok(`20,000 random evaluations: coverage, status and order equal the oracle${first ? " " + JSON.stringify(first).slice(0, 300) : ""}`, oSame);

section("4. The laws");
const one = (resp, extra = {}) => { const base = { vertical: "Other", size: "Under 50 agents", activeTags: ["all"], ...extra }; const reqs = E0.rfpRequirements(M, base); return { ...base, vendors: ["A"], responses: { 0: Object.fromEntries(reqs.map((r) => [r.key, resp])) } }; };
ok("all generally available: 100% coverage, meets every must-have", (() => { const r = E0.scoreRfp(M, one("ga")).vendors[0]; return close(r.coverage, 100) && r.status === "meets"; })());
ok("all preview or roadmap: 0% coverage and no must-have met", ["preview", "roadmap"].every((x) => { const v = E0.scoreRfp(M, one(x)).vendors[0]; return v.coverage === 0 && v.status === "conditional" && v.notGA.length === E0.scoreRfp(M, one(x)).counts.must; }));
ok("an unanswered line is never a zero: dropping an answer never lowers coverage below the answered share", (() => { for (let i = 0; i < 3000; i++) { const s = randomEval(); if (!s.vendors.length) continue; const r1 = E0.scoreRfp(M, s); const v = r1.vendors[0]; if (!v) continue; const k = Object.keys(s.responses[v.index])[0]; if (!k || s.responses[v.index][k] !== "no") continue; delete s.responses[v.index][k]; const r2 = E0.scoreRfp(M, s); if (r2.vendors[0].coverage < v.coverage - 1e-9) return false; } return true; })());
ok("an unanswered must-have keeps a vendor out of the order until clarified", (() => { const s = one("ga"); const k = Object.keys(s.responses[0])[0]; delete s.responses[0][k]; const r = E0.scoreRfp(M, s); return r.order.length === 0 && r.notOrdered[0].reason === "has must-haves to clarify" && r.findings.some((f) => f.rule === "clarify"); })());
ok("upgrading any response to generally available never lowers coverage or worsens status (5,000 cases)", (() => { const rank = { meets: 0, conditional: 1, clarify: 2, unmet: 3 }; for (let i = 0; i < 5000; i++) { const s = randomEval(); if (!s.vendors.length || !s.vendors[0]) continue; const r1 = E0.scoreRfp(M, s).vendors.find((v) => v.index === 0); if (!r1) continue; const keys = Object.keys(s.responses[0]); if (!keys.length) continue; const k = pick(keys); s.responses[0][k] = "ga"; const r2 = E0.scoreRfp(M, s).vendors.find((v) => v.index === 0); if (r2.coverage < r1.coverage - 1e-9 || rank[r2.status] > rank[r1.status]) return false; } return true; })());
ok("the order contains only the vendors entered, never one of its own", (() => { for (let i = 0; i < 2000; i++) { const s = randomEval(); const r = E0.scoreRfp(M, s); const names = new Set(s.vendors.map((v) => (v || "").trim()).filter(Boolean)); if (r.order.some((o) => !names.has(o.name)) || r.vendors.some((v) => !names.has(v.name))) return false; } return true; })());
ok("a blank earlier slot never moves a later vendor's responses", (() => { const s = one("ga"); s.vendors = ["", "B"]; s.responses = { 1: s.responses[0] }; const r = E0.scoreRfp(M, s); return r.vendors.length === 1 && r.vendors[0].index === 1 && close(r.vendors[0].coverage, 100); })());
ok("vendors within the tie margin share a position and raise the tie insight", (() => { const s = one("ga"); s.vendors = ["A", "B"]; s.responses[1] = { ...s.responses[0] }; const r = E0.scoreRfp(M, s); return r.order.length === 2 && r.order[0].position === r.order[1].position && r.findings.some((f) => f.rule === "tie"); })());
ok("a claimed must-have stays to verify until seen in the demo", (() => { const s = one("ga"); const r1 = E0.scoreRfp(M, s); s.verified = { 0: Object.fromEntries(Object.keys(s.responses[0]).map((k) => [k, true])) }; const r2 = E0.scoreRfp(M, s); return r1.vendors[0].unverified.length === r1.counts.must && r2.vendors[0].unverified.length === 0 && !r2.findings.some((f) => f.rule === "verify"); })());
ok("a must-have one vendor meets and another does not is named where the choice is decided", (() => { const s = one("ga"); s.vendors = ["A", "B"]; s.responses[1] = { ...s.responses[0] }; const k = E0.scoreRfp(M, s).requirements.find((r) => r.priority === "must").key; s.responses[1][k] = "roadmap"; const r = E0.scoreRfp(M, s); return r.deciders.includes(k) && r.findings.some((f) => f.rule === "decider"); })());
ok("a layer no vendor covers is named, and the next move is the specialist question", (() => { const s = one("ga"); const reqs = E0.scoreRfp(M, s).requirements; const k = reqs.find((r) => r.priority === "must" && r.layer === 1).key; s.responses[0][k] = "roadmap"; const r = E0.scoreRfp(M, s); return r.commonGaps.includes(1) && r.next === "platform-decision"; })());
ok("with no vendor entered, the next move is a starting list in Vendor Match", E0.scoreRfp(M, { vertical: "Other" }).next === "vendor-match");
ok("every rule is reachable", (() => { const seen = new Set(); for (let i = 0; i < 20000; i++) E0.scoreRfp(M, randomEval()).findings.forEach((f) => seen.add(f.rule)); const s = one("ga"); s.vendors = ["A", "B"]; s.responses[1] = { ...s.responses[0] }; E0.scoreRfp(M, s).findings.forEach((f) => seen.add(f.rule)); return Object.keys(M.rules).every((r) => seen.has(r)); })());
ok("every finding action is filled", (() => { for (let i = 0; i < 1000; i++) if (E0.scoreRfp(M, randomEval()).findings.some((f) => /\{|\}|undefined|NaN/.test(f.action))) return false; return true; })());

section("5. Hostile input");
const H = E0.scoreRfp(M, { vertical: "<script>", size: 5, activeTags: "all", reqs: { "7-0": 3 }, vendors: ["A", 7, {}, "B".repeat(500)], responses: { 0: { "7-0": "great" } }, weights: { must: -5, should: 1e12, nice: "x" } });
ok("hostile values are dropped: unknown response, bad weights, long names cut", H.vendors.length === 2 && H.vendors[0].answered === 0 && H.weights.must === 3 && H.weights.should === 1 && H.vendors[1].name.length === 60);

section("6. Mutants are caught");
const mutants = [
  ["preview earns credit", "(s !== null) { points += W[r.priority] * RESP[s].credit;", "(s !== null) { points += W[r.priority] * (s === \"preview\" ? 1 : RESP[s].credit);", (X) => X.scoreRfp(M, one("preview")).vendors[0].coverage !== 0],
  ["unanswered counts as zero", "if (s !== null) { points", "possible += W[r.priority]; if (s !== null) { points", (X) => { const s = one("ga"); delete s.responses[0][Object.keys(s.responses[0])[0]]; return !close(X.scoreRfp(M, s).vendors[0].coverage, 100); }],
  ["the vertical tag is lost", 'const v = state.vertical === "Healthcare" ? ["healthcare"]', 'const v = state.vertical === "Nowhere" ? ["healthcare"]', (X) => !X.rfpRequirements(M, { vertical: "Healthcare" }).some((r) => /HIPAA BAA with PHI encryption at rest/.test(r.text))],
  ["ties are ignored", "const tied = prev && prev.coverage - v.coverage <= model.thresholds.tieMargin.value;", "const tied = false;", (X) => { const s = one("ga"); s.vendors = ["A", "B"]; s.responses[1] = { ...s.responses[0] }; return !X.scoreRfp(M, s).findings.some((f) => f.rule === "tie"); }],
];
for (const [name, from, to, killed] of mutants) {
  ok(`mutant present in source: ${name}`, BODY.includes(from));
  ok(`mutant caught: ${name}`, killed(load(BODY.replace(from, to))));
}

section("7. The tool reads the engine and publishes its method");
const TOOL = readFileSync("./RFPRequirementBuilder.jsx", "utf8");
const APP = readFileSync("./App.jsx", "utf8");
ok("the tool imports the engine and the model", /from "\.\/src\/lib\/rfp"/.test(TOOL) && /from "\.\/src\/lib\/rubrics\/rfpBuilder"/.test(TOOL));
ok("the tool keeps no requirement table of its own", !/const LAYERS = \[/.test(TOOL) && !/const VERTICAL_REQS = \{/.test(TOOL));
ok("the ranked shortlist promise is gone; Vendor Match is offered as a starting list", !/ranked shortlist/i.test(TOOL) && /starting list/.test(TOOL));
ok("scenario links carry packed responses, so a full scoring session fits a link", /state=\{packState\(state\)\}/.test(TOOL) && /export const SAMPLE = packState\(SAMPLE_STATE\)/.test(TOOL));
ok("the tool links the published method and the PDF carries the analyst read, limits and method", /MODEL\.methodology/.test(TOOL) && /title: "Analyst Read"/.test(TOOL) && /title: "What This Tool Cannot Tell You"/.test(TOOL) && /title: "Method"/.test(TOOL));
ok("the consultant path stays", /Connect with a consultant/.test(TOOL));
ok("/methodology/rfp-builder: route mounted and in the sitemap", APP.includes('<Route path="/methodology/rfp-builder" element={<RubricPage id="rfp-builder" />} />') && readFileSync("./public/sitemap.xml", "utf8").includes("/methodology/rfp-builder<"));
ok("no dash in the engine, the model or the tool", !DASH.test(SRC) && !DASH.test(TOOL));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
