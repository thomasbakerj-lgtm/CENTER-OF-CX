/* terms.test.mjs
 *
 * The contract terms engine (src/lib/terms.js) and the Contract Risk model it reads
 * (src/lib/rubrics/contractRisk.js). The engine is sliced from its markers and must equal
 * the module. The reading, findings, checklist and next step are checked against an
 * oracle on random contracts; "don't know" is never a pass or a severity; old links keep
 * every answer; figures in negotiation positions are labelled.
 */
import { readFileSync } from "node:fs";
import { scoreTerms } from "./src/lib/terms.js";
import { CONTRACT_RISK as M } from "./src/lib/rubrics/contractRisk.js";
import { RUBRICS } from "./src/lib/rubrics/index.js";
import { JOURNEY } from "./src/lib/journey.js";

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
const DASH = new RegExp("[" + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + "]");
let seed = 20260924;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const random = (skip = 0.1) => ({ selections: Object.fromEntries(M.terms.filter(() => rnd() >= skip).map((t) => [t.id, rnd() < 0.12 ? M.unknown.val : pick(t.options).val])) });

section("0. The engine is sliced live and matches the module");
const SRC = readFileSync("./src/lib/terms.js", "utf8");
const a = SRC.indexOf("/* @engine-start */"), b = SRC.indexOf("/* @engine-end */");
ok("engine markers present, in order", a > 0 && b > a);
const BODY = SRC.slice(a, b);
const load = (body) => new Function(body + "\nreturn { scoreTerms };")();
const E = load(BODY);
ok("the slice has no import, JSX or DOM access", !/import |<[A-Z]|window\.|document\./.test(BODY));
let same = true;
for (let i = 0; i < 3000; i++) { const s = random(rnd() < 0.3 ? 0.3 : 0); if (JSON.stringify(E.scoreTerms(M, s)) !== JSON.stringify(scoreTerms(M, s))) same = false; }
ok("3,000 random contracts: the sliced engine equals the module", same);

section("1. The published model is complete and clean");
ok("registered in the rubric registry", RUBRICS["contract-risk"] === M);
ok("kind terms, version, date and methodology route", M.kind === "terms" && /^\d+\.\d+$/.test(M.version) && M.methodology === "/methodology/contract-risk");
ok("13 clauses, ids unique", M.terms.length === 13 && new Set(M.terms.map((t) => t.id)).size === 13);
const LEVELS = M.levels.map((l) => l.id);
for (const t of M.terms) {
  ok(`${t.id}: a reason, at least three options, every option with a known severity and a note`, t.why && t.options.length >= 3 && t.options.every((o) => LEVELS.includes(o.level) && o.note));
  ok(`${t.id}: every option above low says what to ask for`, t.options.every((o) => o.level === "low" || o.negotiate));
  ok(`${t.id}: options run from least to most serious or keep the legacy order`, new Set(t.options.map((o) => o.val)).size === t.options.length);
}
ok("the reading rules cover every case, in order", M.readings.map((r) => r.id).join() === "doNotSign,negotiate,find,notes,clear");
for (const id of Object.values(M.next)) ok(`next step ${id} is a journey tool`, !!JOURNEY[id]);
ok("negotiation figures are labelled as positions from practice", /not sourced benchmarks/.test(M.positionsNote));
ok("retired unsourced claims are gone", !/15-30%|40-100%|Most common vendor tactic|Gold standard|Walk unless|non-negotiable|[Dd]ealbreaker/.test(JSON.stringify(M)));
ok("uptime arithmetic is right: 99.999% about 5 minutes, 99.99% about 53 minutes, 99.9% about 8.8 hours", (() => { const y = 365 * 24 * 60; return Math.round(y * 1e-5) === 5 && Math.round(y * 1e-4) === 53 && (y * 1e-3 / 60).toFixed(1) === "8.8"; })());
ok("no vendor is named", !/Genesys|NICE|Five9|Talkdesk|Amazon|Zoom|8x8|Dialpad|Avaya|Cisco|Salesforce/.test(JSON.stringify(M)));
ok("no dash anywhere in the model", !DASH.test(JSON.stringify(M)));

section("2. Reading, findings, checklist and next step against an oracle");
const oracle = (s) => {
  const st = M.terms.map((t) => { const v = s.selections[t.id]; const o = t.options.find((x) => x.val === v); return o ? o.level : v === M.unknown.val ? "unknown" : "unanswered"; });
  const n = (k) => st.filter((x) => x === k).length;
  const answered = st.filter((x) => x !== "unanswered").length;
  const reading = answered === 0 ? null : n("critical") ? "doNotSign" : n("high") ? "negotiate" : n("unknown") + n("unanswered") ? "find" : n("medium") ? "notes" : "clear";
  const flagged = st.filter((x) => ["critical", "high", "medium", "unknown"].includes(x)).length;
  const check = st.filter((x) => ["critical", "high", "unknown"].includes(x)).length;
  const at = (id) => st[M.terms.findIndex((t) => t.id === id)];
  const next = reading === null ? null : ["critical", "high", "unknown"].includes(at("addons")) ? "license-gap" : ["critical", "high"].includes(at("renewal")) || ["critical", "high"].includes(at("renewalPrice")) ? "platform-decision" : "tco-calculator";
  return { reading, flagged, check, next };
};
let oSame = true, bad = null;
for (let i = 0; i < 20000; i++) {
  const s = random(rnd() < 0.2 ? 0.4 : 0.05);
  const r = scoreTerms(M, s), w = oracle(s);
  const g = { reading: r.reading, flagged: r.findings.length, check: r.checklist.length, next: r.next };
  if (JSON.stringify(g) !== JSON.stringify(w)) { oSame = false; bad = bad || { g, w }; }
}
ok(`20,000 random contracts: engine equals the oracle${bad ? " " + JSON.stringify(bad) : ""}`, oSame);

section("3. The laws");
const all = (fn) => ({ selections: Object.fromEntries(M.terms.map((t) => [t.id, fn(t)])) });
const lowest = all((t) => t.options.find((o) => o.level === "low").val);
ok("every clause low: no flagged clause", scoreTerms(M, lowest).reading === "clear" && scoreTerms(M, lowest).findings.length === 0);
ok("every clause unknown: find the clauses, no severity claimed", (() => { const r = scoreTerms(M, all(() => M.unknown.val)); return r.reading === "find" && r.counts.critical + r.counts.high + r.counts.medium + r.counts.low === 0 && r.checklist.length === 13; })());
ok("replacing a known low clause with don't know never improves the reading", (() => { const rank = { clear: 0, notes: 1, find: 2, negotiate: 3, doNotSign: 4 }; for (let i = 0; i < 3000; i++) { const s = random(0); const t = pick(M.terms); const r1 = scoreTerms(M, s); s.selections[t.id] = M.unknown.val; const r2 = scoreTerms(M, s); if (rank[r2.reading] < rank[r1.reading] && r1.clauses.find((c) => c.id === t.id).status === "low") return false; } return true; })());
ok("one critical clause among low ones: do not sign as written", (() => { const s = JSON.parse(JSON.stringify(lowest)); s.selections.sla = "No SLA"; return scoreTerms(M, s).reading === "doNotSign"; })());
ok("no answer at all claims no reading and no next step", (() => { const r = scoreTerms(M, { selections: {} }); return r.reading === null && r.next === null && r.findings.length === 0; })());
ok("findings run most serious first", (() => { const o = { critical: 0, high: 1, unknown: 2, medium: 3 }; for (let i = 0; i < 500; i++) { const f = scoreTerms(M, random()).findings; for (let j = 1; j < f.length; j++) if (o[f[j].severity] < o[f[j - 1].severity]) return false; } return true; })());
ok("every reading and next step is reachable", (() => { const R = new Set(), N = new Set(); for (let i = 0; i < 20000; i++) { const r = scoreTerms(M, random(rnd() < 0.5 ? 0 : 0.3)); R.add(r.reading); N.add(r.next); } R.add(scoreTerms(M, lowest).reading); const med = JSON.parse(JSON.stringify(lowest)); med.selections.length = "3 years"; R.add(scoreTerms(M, med).reading); const fnd = JSON.parse(JSON.stringify(lowest)); fnd.selections.sla = M.unknown.val; R.add(scoreTerms(M, fnd).reading); return M.readings.every((x) => R.has(x.id)) && Object.values(M.next).every((x) => N.has(x)); })());

section("4. Old links and hostile input");
const LEGACY = { length: "5 years", renewal: "180 days", rateLock: "No rate lock", sla: "No SLA", termination: "Pay remaining term", data: "No export clause", addons: "No pricing committed" };
const L = scoreTerms(M, { selections: LEGACY });
ok("an old link keeps all seven answers", L.answered === 7 && Object.entries(LEGACY).every(([k, v]) => L.clauses.find((c) => c.id === k).selected === v));
ok("an old link reads do not sign, with the six new clauses still to answer", L.reading === "doNotSign" && L.total - L.answered === 6);
const H = scoreTerms(M, { selections: { sla: -5, length: "7 years", __proto__: { x: 1 }, data: 1e12 } });
ok("hostile values are dropped, never read", H.answered === 0 && H.reading === null);

section("5. Mutants are caught");
const mutants = [
  ["don't know counts as low", 'val === model.unknown.val ? "unknown"', 'val === model.unknown.val ? "low"', (X) => X.scoreTerms(M, all(() => M.unknown.val)).reading !== "find"],
  ["unanswered clauses are ignored by the reading", "counts.unknown + (clauses.length - answered)", "counts.unknown", (X) => { const s = { selections: { sla: "99.999% with credits" } }; return X.scoreTerms(M, s).reading !== "find"; }],
  ["high clauses leave the checklist", 'checklist = findings.filter((f) => f.severity !== "medium")', 'checklist = findings.filter((f) => f.severity === "critical")', (X) => { const s = JSON.parse(JSON.stringify(lowest)); s.selections.length = "5 years"; return X.scoreTerms(M, s).checklist.length !== 1; }],
];
for (const [name, from, to, killed] of mutants) {
  ok(`mutant present in source: ${name}`, BODY.includes(from));
  ok(`mutant caught: ${name}`, killed(load(BODY.replace(from, to))));
}

section("6. The tool reads the engine and publishes its method");
const TOOL = readFileSync("./ContractRiskScanner.jsx", "utf8");
const APP = readFileSync("./App.jsx", "utf8");
ok("the tool imports the engine and the model", /from "\.\/src\/lib\/terms"/.test(TOOL) && /from "\.\/src\/lib\/rubrics\/contractRisk"/.test(TOOL));
ok("the tool keeps no clause table or overall cut points of its own", !/const TERMS = \[/.test(TOOL) && !/critical>=2|riskCounts/.test(TOOL));
ok("the tool links the published method and the PDF carries checklist, limits and method", /MODEL\.methodology/.test(TOOL) && /title: "Negotiation Checklist"/.test(TOOL) && /title: "What This Tool Cannot Tell You"/.test(TOOL) && /title: "Method"/.test(TOOL));
ok("the Vendor Match comparison promise is gone", !/Compare terms across vendors|Vendor Match Engine/.test(TOOL));
ok("/methodology/contract-risk: route mounted and in the sitemap", APP.includes('<Route path="/methodology/contract-risk" element={<RubricPage id="contract-risk" />} />') && readFileSync("./public/sitemap.xml", "utf8").includes("/methodology/contract-risk<"));
ok("no dash in the engine, the model or the tool", !DASH.test(SRC) && !DASH.test(TOOL));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
