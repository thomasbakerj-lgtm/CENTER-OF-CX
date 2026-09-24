/* renewal.test.mjs
 *
 * The renewal engine (src/lib/renewal.js) and the Platform Decision model it reads
 * (src/lib/rubrics/platformDecision.js). The engine is sliced from its markers and must
 * equal the module. Every per-need status, layer outcome, gate, clock rule and next step
 * is checked against an independent oracle on random answer sets. The laws are gated
 * directly: nothing is averaged, "don't know" is never a gap, a need marked not needed
 * changes nothing, and a better rating never worsens an outcome. Old links keep their
 * ratings and read every need as a must-have seen in production.
 */
import { readFileSync } from "node:fs";
import * as E0 from "./src/lib/renewal.js";
import { PLATFORM_DECISION as M } from "./src/lib/rubrics/platformDecision.js";
import { RUBRICS } from "./src/lib/rubrics/index.js";
import { JOURNEY } from "./src/lib/journey.js";

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
const DASH = new RegExp("[" + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + "]");
let seed = 20260924;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const pick = (a) => a[Math.floor(rnd() * a.length)];
const T = M.thresholds;
const NEEDS = E0.renewalNeeds(M);
const KEYS = NEEDS.map((n) => n.key);

const randomState = (opts = {}) => {
  const scores = {}, need = {}, evidence = {};
  for (const k of KEYS) {
    if (rnd() < (opts.skip || 0)) continue;
    scores[k] = rnd() < 0.12 ? "unknown" : 1 + Math.floor(rnd() * 5);
    if (rnd() < 0.35) need[k] = pick(["must", "nice", "none"]);
    if (rnd() < 0.35) evidence[k] = pick(["production", "vendor"]);
  }
  const clock = {};
  if (rnd() < 0.8) clock.monthsToNotice = Math.floor(rnd() * 14);
  if (rnd() < 0.7) clock.termYears = 1 + Math.floor(rnd() * 5);
  if (rnd() < 0.7) clock.exitKnown = rnd() < 0.5;
  return { scores, need, evidence, clock };
};

/* ------------------------------------------------------------ 0. engine */
section("0. The engine is sliced live and matches the module");
const SRC = readFileSync("./src/lib/renewal.js", "utf8");
const a = SRC.indexOf("/* @engine-start */"), b = SRC.indexOf("/* @engine-end */");
ok("engine markers present, in order", a > 0 && b > a);
const BODY = SRC.slice(a, b);
const load = (body) => new Function(body + "\nreturn { renewalVars, renewalNeeds, scoreRenewal };")();
const E = load(BODY);
ok("the slice has no import, JSX or DOM access", !/import |<[A-Z]|window\.|document\./.test(BODY));
let same = true;
for (let i = 0; i < 2000; i++) { const s = randomState({ skip: rnd() < 0.2 ? 0.1 : 0 }); if (JSON.stringify(E.scoreRenewal(M, s)) !== JSON.stringify(E0.scoreRenewal(M, s))) same = false; }
ok("2,000 random answer sets: the sliced engine equals the module", same);

/* ------------------------------------------------------------ 1. model */
section("1. The published model is complete and clean");
ok("registered in the rubric registry", RUBRICS["platform-decision"] === M);
ok("kind renewal, version, publication date and methodology route", M.kind === "renewal" && /^\d+\.\d+$/.test(M.version) && /^\d{4}-\d{2}-\d{2}$/.test(M.published) && M.methodology === "/methodology/platform-decision");
ok("it declares one truth type and reads no vendor research", /Buyer's own view/.test(M.truthType) && !/import /.test(readFileSync("./src/lib/rubrics/platformDecision.js", "utf8")));
ok("7 layers, 35 needs, keys unchanged from the previous version", M.layers.length === 7 && KEYS.length === 35 && KEYS[0] === "7-0" && KEYS[34] === "1-4");
ok("exactly two core layers", M.layers.filter((l) => l.core).map((l) => l.n).join() === "6,5");
for (const l of M.layers) ok(`layer ${l.n}: its diagnostic is a journey tool`, !!JOURNEY[l.tool]);
for (const id of Object.values(M.next)) ok(`next step ${id} is a journey tool`, !!JOURNEY[id]);
for (const [id, r] of Object.entries(M.rules)) ok(`rule ${id}: severity, title, test and action`, ["critical", "high", "medium", "info"].includes(r.severity) && r.title && r.test && r.action);
ok("every threshold is labelled rule or heuristic", Object.values(T).every((t) => ["rule", "heuristic"].includes(t.kind) && t.text));
ok("no vendor is named in the model", !/Genesys|NICE|Five9|Talkdesk|Amazon Connect|Zoom|8x8|Dialpad|Odigo|Avaya|Cisco|Salesforce/.test(JSON.stringify(M)));
ok("no dash anywhere in the model", !DASH.test(JSON.stringify(M)));
ok("the retired scoring claim is gone", !/scored/i.test(JSON.stringify(M)));

/* ------------------------------------------------------------ 2. oracle */
section("2. Every status, outcome, gate, clock rule and next step against an oracle");
const oracle = (s) => {
  const items = NEEDS.map((n) => {
    const raw = s.scores[n.key];
    const rating = Number.isInteger(raw) && raw >= 1 && raw <= 5 ? raw : raw === "unknown" ? "unknown" : null;
    const need = ["must", "nice", "none"].includes(s.need[n.key]) ? s.need[n.key] : "must";
    const ev = ["production", "vendor"].includes(s.evidence[n.key]) ? s.evidence[n.key] : "production";
    let st;
    if (need === "none") st = "excluded";
    else if (rating === null) st = "unanswered";
    else if (rating === "unknown") st = need === "must" ? "proof" : "open";
    else if (rating <= 2) st = need === "must" ? "gap" : "niceGap";
    else st = need === "must" && ev === "vendor" ? "proof" : "met";
    return { ...n, st };
  });
  const complete = items.every((x) => x.st !== "unanswered");
  const layers = M.layers.map((l) => {
    const level = (k) => (["must", "nice", "none"].includes(s.need[k]) ? s.need[k] : "must");
    const mustAll = items.filter((x) => x.layer === l.n && level(x.key) === "must" && x.st !== "unanswered");
    const gaps = mustAll.filter((x) => x.st === "gap").length, proof = mustAll.filter((x) => x.st === "proof").length;
    const out = gaps > 0 && gaps / mustAll.length >= 0.5 ? (l.core ? "market" : "specialist") : gaps > 0 || proof > 0 ? "conditions" : "renew";
    return out;
  });
  if (!complete) return { complete, layers, gate: null, rules: "", next: null };
  const spec = layers.filter((o) => o === "specialist").length;
  const gate = layers.includes("market") || spec >= 3 ? "evaluate" : layers.some((o) => o !== "renew") ? "conditions" : "renew";
  const m = Number.isFinite(s.clock.monthsToNotice) && s.clock.monthsToNotice >= 0 && s.clock.monthsToNotice <= 120 ? s.clock.monthsToNotice : null;
  const y = Number.isFinite(s.clock.termYears) && s.clock.termYears >= 1 && s.clock.termYears <= 10 ? s.clock.termYears : null;
  const rules = new Set();
  if (items.some((x) => x.st === "gap")) rules.add("blocker");
  if (items.some((x) => x.st === "proof")) rules.add("proof");
  if (items.some((x) => x.st === "niceGap")) rules.add("niceGap");
  if (layers.includes("market")) rules.add("market");
  if (spec) rules.add("specialist");
  if (spec >= 3) rules.add("sprawl");
  if (m === null) rules.add("clockMissing");
  else if (gate === "evaluate" && m < 6) rules.add("noTimeEvaluate");
  else if (gate === "conditions" && m < 3) rules.add("noTimeNegotiate");
  if (s.clock.exitKnown === false) rules.add("exitUnknown");
  if (y !== null && y >= 3 && gate !== "renew") rules.add("longTerm");
  const next = s.clock.exitKnown === false ? "contract-risk" : gate === "evaluate" ? "rfp-builder" : gate === "conditions" ? "contract-risk" : "tco-calculator";
  return { complete, layers, gate, rules: [...rules].sort().join(), next };
};
let oSame = true, firstBad = null;
for (let i = 0; i < 20000; i++) {
  const s = randomState({ skip: rnd() < 0.1 ? 0.05 : 0 });
  const got = E0.scoreRenewal(M, s), want = oracle(s);
  const g = { complete: got.complete, layers: got.layers.map((l) => l.outcome), gate: got.gate, rules: [...new Set(got.findings.map((f) => f.rule))].sort().join(), next: got.next ? got.next.tool : null };
  if (JSON.stringify(g) !== JSON.stringify(want)) { oSame = false; if (!firstBad) firstBad = { g, want }; }
}
ok(`20,000 random answer sets: engine equals the oracle${firstBad ? " " + JSON.stringify(firstBad) : ""}`, oSame);

/* ------------------------------------------------------------ 3. laws */
section("3. The laws");
const allAt = (v, extra = {}) => ({ scores: Object.fromEntries(KEYS.map((k) => [k, v])), need: {}, evidence: {}, clock: { monthsToNotice: 12, termYears: 1, exitKnown: true }, ...extra });
const one = (key, v, base = 5) => { const s = allAt(base); s.scores[key] = v; return s; };
ok("one must-have gap among excellent answers is a gap: nothing is averaged", E0.scoreRenewal(M, one("7-0", 1)).layers[0].outcome === "conditions" && E0.scoreRenewal(M, one("7-0", 1)).findings.some((f) => f.rule === "blocker"));
ok("every need unknown: 35 proof requests, no gap, gate renew with conditions", (() => { const r = E0.scoreRenewal(M, allAt("unknown")); return r.items.every((x) => x.status === "proof") && !r.findings.some((f) => f.rule === "blocker") && r.gate === "conditions"; })());
ok("an unknown never counts as a gap in any layer outcome", (() => { for (let i = 0; i < 3000; i++) { const s = randomState(); const r1 = E0.scoreRenewal(M, s); const s2 = JSON.parse(JSON.stringify(s)); for (const k of KEYS) if (s2.scores[k] === "unknown") s2.scores[k] = 5; const r2 = E0.scoreRenewal(M, s2); if (r1.layers.some((l, j) => l.gaps !== r2.layers[j].gaps)) return false; } return true; })());
ok("a need marked not needed changes nothing, whatever its rating", (() => { for (let i = 0; i < 2000; i++) { const s = randomState(); const k = pick(KEYS); s.need[k] = "none"; const a1 = E0.scoreRenewal(M, s); s.scores[k] = pick([1, 2, 3, 4, 5, "unknown"]); s.evidence[k] = pick(["production", "vendor"]); const a2 = E0.scoreRenewal(M, s); if (a1.gate !== a2.gate || JSON.stringify(a1.layers) !== JSON.stringify(a2.layers)) return false; } return true; })());
const RANK = { renew: 0, conditions: 1, specialist: 2, market: 2 }, GRANK = { renew: 0, conditions: 1, evaluate: 2 };
ok("a better rating never worsens a layer outcome or the gate (5,000 cases)", (() => { for (let i = 0; i < 5000; i++) { const s = randomState(); const k = pick(KEYS); if (!Number.isInteger(s.scores[k]) || s.scores[k] === 5) continue; const r1 = E0.scoreRenewal(M, s); s.scores[k]++; const r2 = E0.scoreRenewal(M, s); if (!r1.complete) continue; if (r2.layers.some((l, j) => RANK[l.outcome] > RANK[r1.layers[j].outcome]) || GRANK[r2.gate] > GRANK[r1.gate]) return false; } return true; })());
ok("seeing a need in production never worsens an outcome against the vendor's word", (() => { for (let i = 0; i < 3000; i++) { const s = randomState(); const k = pick(KEYS); s.evidence[k] = "vendor"; const r1 = E0.scoreRenewal(M, s); s.evidence[k] = "production"; const r2 = E0.scoreRenewal(M, s); if (r1.complete && (r2.layers.some((l, j) => RANK[l.outcome] > RANK[r1.layers[j].outcome]) || GRANK[r2.gate] > GRANK[r1.gate])) return false; } return true; })());
ok("the clock never changes a layer outcome or the gate", (() => { for (let i = 0; i < 2000; i++) { const s = randomState(); const r1 = E0.scoreRenewal(M, s); s.clock = { monthsToNotice: Math.floor(rnd() * 20), termYears: 1 + Math.floor(rnd() * 6), exitKnown: rnd() < 0.5 }; const r2 = E0.scoreRenewal(M, s); if (r1.gate !== r2.gate || JSON.stringify(r1.layers) !== JSON.stringify(r2.layers)) return false; } return true; })());
ok("an incomplete answer set claims no gate, finding or next step", (() => { const s = allAt(4); delete s.scores["3-2"]; const r = E0.scoreRenewal(M, s); return !r.complete && r.gate === null && r.findings.length === 0 && r.next === null; })());

/* ------------------------------------------------------------ 4. reachability */
section("4. Every outcome, gate and rule is reachable");
const seenO = new Set(), seenG = new Set(), seenR = new Set();
for (let i = 0; i < 20000; i++) { const r = E0.scoreRenewal(M, randomState()); r.layers.forEach((l) => seenO.add(l.outcome)); if (r.gate) seenG.add(r.gate); r.findings.forEach((f) => seenR.add(f.rule)); }
seenO.add(E0.scoreRenewal(M, allAt(5)).layers[0].outcome); seenG.add(E0.scoreRenewal(M, allAt(5)).gate);
for (const o of M.outcomes) ok(`outcome ${o.id} is reachable`, seenO.has(o.id));
for (const g of M.gates) ok(`gate ${g.id} is reachable`, seenG.has(g.id));
for (const r of Object.keys(M.rules)) ok(`rule ${r} is reachable`, seenR.has(r));
ok("every finding action is filled", (() => { for (let i = 0; i < 500; i++) if (E0.scoreRenewal(M, randomState()).findings.some((f) => /\{|\}|undefined|NaN/.test(f.action))) return false; return true; })());
ok("findings run most serious first", (() => { const o = { critical: 0, high: 1, medium: 2, info: 3 }; for (let i = 0; i < 500; i++) { const f = E0.scoreRenewal(M, randomState()).findings; for (let j = 1; j < f.length; j++) if (o[f[j].severity] < o[f[j - 1].severity]) return false; } return true; })());
ok("the checklist carries every finding except nice-to-have gaps and the clock note", (() => { for (let i = 0; i < 500; i++) { const r = E0.scoreRenewal(M, randomState()); if (r.checklist.length !== r.findings.filter((f) => f.rule !== "niceGap" && f.rule !== "clockMissing").length) return false; } return true; })());

/* ------------------------------------------------------------ 5. old links and hostile input */
section("5. Old links and hostile input");
const legacy = { scores: Object.fromEntries(M.layers.flatMap((l) => l.needs.map((_, i) => [`${l.n}-${i}`, ((l.n + i) % 5) + 1]))) };
const L = E0.scoreRenewal(M, legacy);
ok("an old link opens complete, every need a must-have seen in production", L.complete && L.items.every((x) => x.need === "must" && x.evidence === "production"));
ok("an old link's critical gaps now surface: 14 must-have gaps, where the average read Extend", L.items.filter((x) => x.status === "gap").length === 14 && L.gate === "conditions");
const hostile = { scores: { "7-0": -5, "7-1": 1e12, "7-2": "5", "__proto__": 3, "9-9": 2 }, need: { "7-0": "maybe" }, evidence: { "7-0": "rumor" }, clock: { monthsToNotice: -5, termYears: 1e12, exitKnown: "no" } };
const H = E0.scoreRenewal(M, hostile);
ok("hostile values are dropped, never scored", !H.complete && H.answered === 0 && H.items[0].need === "must" && H.items[0].evidence === "production");
ok("a hostile clock reads as not entered", (() => { const s = allAt(5, { clock: { monthsToNotice: -5, termYears: 1e12, exitKnown: "no" } }); const r = E0.scoreRenewal(M, s); return r.clock.months === null && r.clock.years === null && r.clock.exitKnown === null && r.findings.some((f) => f.rule === "clockMissing"); })());

/* ------------------------------------------------------------ 6. mutants */
section("6. Engine mutants are caught");
const mutants = [
  ["unknown counts as a gap", 'else if (rating === "unknown") status = need === "must" ? "proof" : "open";', 'else if (rating === "unknown") status = need === "must" ? "gap" : "open";', (X) => X.scoreRenewal(M, allAt("unknown")).items.some((x) => x.status === "gap")],
  ["the default need becomes nice-to-have", ': "must";\n    const evidence', ': "nice";\n    const evidence', (X) => X.scoreRenewal(M, legacy).gate !== L.gate || X.scoreRenewal(M, legacy).items.some((x) => x.need !== "must")],
  ["a core layer gets a specialist", 'outcome = l.core ? "market" : "specialist";', 'outcome = "specialist";', (X) => { const s = allAt(5); for (const k of ["6-0", "6-1", "6-2"]) s.scores[k] = 1; return X.scoreRenewal(M, s).layers.find((l) => l.n === 6).outcome !== "market"; }],
  ["the clock is ignored", 'else if (gate === "evaluate" && months < T.evaluationMonths.value) push("noTimeEvaluate", { months }, ["clock"]);', "", (X) => { const s = allAt(5, { clock: { monthsToNotice: 2 } }); for (const k of ["6-0", "6-1", "6-2"]) s.scores[k] = 1; return !X.scoreRenewal(M, s).findings.some((f) => f.rule === "noTimeEvaluate"); }],
];
for (const [name, from, to, killed] of mutants) {
  ok(`mutant present in source: ${name}`, BODY.includes(from));
  ok(`mutant caught: ${name}`, killed(load(BODY.replace(from, to))));
}

/* ------------------------------------------------------------ 7. wiring */
section("7. The tool reads the engine and publishes its method");
const TOOL = readFileSync("./PlatformDecisionMatrix.jsx", "utf8");
const APP = readFileSync("./App.jsx", "utf8");
ok("the tool imports the engine and the model", /from "\.\/src\/lib\/renewal"/.test(TOOL) && /from "\.\/src\/lib\/rubrics\/platformDecision"/.test(TOOL));
ok("the tool keeps no layer table, average or cut point of its own", !/const LAYERS = \[/.test(TOOL) && !/layerAvg|avg>=4|getRec/.test(TOOL));
ok("the tool promises no ranked vendor shortlist", !/ranked vendor shortlist|Match Me to Vendors/.test(TOOL));
ok("the tool links the published method", /MODEL\.methodology/.test(TOOL));
ok("the PDF carries the checklist, the limits and the method", /title: "Negotiation Checklist"/.test(TOOL) && /title: "What This Tool Cannot Tell You"/.test(TOOL) && /title: "Method"/.test(TOOL));
ok("/methodology/platform-decision: route mounted and in the sitemap", APP.includes('<Route path="/methodology/platform-decision" element={<RubricPage id="platform-decision" />} />') && readFileSync("./public/sitemap.xml", "utf8").includes("/methodology/platform-decision<"));
ok("the journey no longer sends a renewal decision to the Phase 1 vendor ranking", !JOURNEY["platform-decision"].next.some((n) => n.to === "vendor-match"));
ok("no dash in the engine, the model or the tool", !DASH.test(SRC) && !DASH.test(TOOL));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
