/* ownership.test.mjs
 *
 * The ownership engine (src/lib/ownership.js) and the Governance & Operating Model it
 * scores (src/lib/rubrics/governance.js). The engine is sliced from its markers and
 * must equal the module. Every finding rule is checked against an independent oracle
 * on 20,000 random ownership maps; the legacy counts and item list are frozen here so
 * links made before version 1.0 keep their meaning.
 */
import { readFileSync } from "node:fs";
import { scoreOwnership } from "./src/lib/ownership.js";
import { GOVERNANCE as M } from "./src/lib/rubrics/governance.js";
import { JOURNEY } from "./src/lib/journey.js";

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
const DASH = new RegExp("[" + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + "]");
let seed = 20260924;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const pick = (n) => Math.floor(rnd() * n);

/* ------------------------------------------------------------ 0. engine */
section("0. The engine is sliced live and matches the module");
const SRC = readFileSync("./src/lib/ownership.js", "utf8");
const a = SRC.indexOf("/* @engine-start */"), b = SRC.indexOf("/* @engine-end */");
ok("engine markers present, in order", a > 0 && b > a);
const E = new Function(SRC.slice(a, b) + "\nreturn { scoreOwnership };")();
ok("the slice has no import, JSX or DOM access", !/import |<[A-Z]|window\.|document\./.test(SRC.slice(a, b)));

const keys = M.domains.flatMap((d, di) => d.items.map((_, ii) => `${di}-${ii}`));
const nR = M.roles.length;
const randomState = (share = 0.85) => {
  const primary = {}, secondary = {};
  for (const k of keys) {
    if (rnd() < share) primary[k] = pick(nR);
    if (rnd() < 0.5) secondary[k] = pick(nR);
  }
  return { primary, secondary };
};
let same = true;
for (let i = 0; i < 5000; i++) { const st = randomState(); if (JSON.stringify(E.scoreOwnership(M, st)) !== JSON.stringify(scoreOwnership(M, st))) { same = false; break; } }
ok("5,000 random maps: the sliced engine equals the module", same);

/* ------------------------------------------------------------ 1. model */
section("1. The published model is well formed and keeps its legacy meaning");
/* Frozen from GovernanceModel.jsx at main 2240d6b: role order and every decision's text. */
const LEGACY_ROLES = ["CX Leader", "CC Ops", "IT / Arch", "AI / Data", "Finance"];
const LEGACY_ITEMS = [
  ["Overall CX strategy and roadmap", "Customer journey design and mapping", "Experience standards and brand alignment", "CX investment prioritization", "Cross-functional CX governance"],
  ["Service level management and SLAs", "Workforce management and scheduling", "Quality assurance and coaching", "Agent performance and development", "Escalation design and exception handling"],
  ["CCaaS platform selection and management", "Integration architecture and maintenance", "Agent desktop and tooling", "Telephony and channel infrastructure", "Technology vendor management"],
  ["AI strategy and use case prioritization", "Bot and IVA design and performance", "Agent assist deployment and tuning", "AI governance, testing, and guardrails", "Automation ROI measurement"],
  ["Reporting and dashboards", "Interaction analytics (speech, text, sentiment)", "Voice of customer and feedback programs", "Data quality and governance", "Insight-to-action process"],
  ["CX technology budget ownership", "Vendor contract negotiation and renewal", "TCO modeling and cost optimization", "Build vs buy decisions", "Professional services oversight"],
];
ok("the first five roles keep their legacy order, so old links keep every assignment", LEGACY_ROLES.every((r, i) => M.roles[i].label === r));
ok("Risk & Compliance is appended, never inserted", M.roles.length === 6 && M.roles[5].id === "risk");
ok("every decision keeps its legacy position and text", LEGACY_ITEMS.every((d, di) => d.every((t, ii) => M.domains[di].items[ii].text === t)) && M.domains.length === 6);
ok("role ids are unique", new Set(M.roles.map((r) => r.id)).size === nR);
const roleIds = new Set(M.roles.map((r) => r.id));
ok("every common owner and required function is a real role", M.domains.every((d) => d.items.every((it) => roleIds.has(it.common) && (it.involve || []).every((e) => roleIds.has(typeof e === "string" ? e : e.role)))));
const high = M.domains.flatMap((d) => d.items.flatMap((it) => (it.involve || []).filter((e) => typeof e !== "string" && e.severity === "high").map((e) => `${it.text}:${e.role}`)));
ok("exactly the five published control and budget checks are high", high.length === 5 && ["AI governance, testing, and guardrails:risk", "Data quality and governance:risk", "Vendor contract negotiation and renewal:risk", "CX investment prioritization:cx", "CX technology budget ownership:fin"].every((h) => high.includes(h)));
ok("six rules, each with a severity, a title, a test and an action", Object.keys(M.rules).length === 6 && Object.values(M.rules).every((r) => r.severity && r.title && r.test && r.action));
ok("both next diagnostics are journey tools other than this one", !!JOURNEY[M.next.cxIt] && !!JOURNEY[M.next.otherwise] && M.next.cxIt !== M.id && M.next.otherwise !== M.id);
ok("the tool route is a journey node route", !!JOURNEY[M.id] && JOURNEY[M.id].route === M.route);
ok("limits disclose self-report, the common pattern as a question, no score, no vendor",
  M.limits.some((l) => /respondent/i.test(l)) && M.limits.some((l) => /question to confirm/i.test(l)) && M.limits.some((l) => /does not score/i.test(l)) && M.limits.some((l) => /never recommends a vendor/i.test(l)));
ok("the model carries no em or en dash", !DASH.test(JSON.stringify(M)));

/* ------------------------------------------------------------ 2. rules */
section("2. Every rule fires exactly when its published test holds (20,000 random maps)");
const rid = (id) => M.roles.findIndex((r) => r.id === id);
const bottleneckAt = Math.ceil((2 * keys.length) / nR);
ok("bottleneck threshold is twice an even share, rounded up (10 of 30 across six roles)", scoreOwnership(M, randomState(1)).bottleneckAt === bottleneckAt && bottleneckAt === 10);
function oracle(st) {
  const P = {}, S = {};
  for (const k of keys) {
    if (Number.isInteger(st.primary[k]) && st.primary[k] >= 0 && st.primary[k] < nR) P[k] = st.primary[k];
    if (P[k] !== undefined && Number.isInteger(st.secondary[k]) && st.secondary[k] >= 0 && st.secondary[k] < nR && st.secondary[k] !== P[k]) S[k] = st.secondary[k];
  }
  const out = new Set();
  const assigned = Object.keys(P).length;
  if (assigned < M.minAssigned) return { out, assigned, P, S };
  M.domains.forEach((d, di) => d.items.forEach((it, ii) => {
    const k = `${di}-${ii}`;
    if (P[k] === undefined) { out.add(`unowned:${k}:critical`); return; }
    for (const e of it.involve || []) {
      const r = rid(typeof e === "string" ? e : e.role);
      if (P[k] !== r && S[k] !== r) out.add(`involve:${k}:${M.roles[r].id}:${typeof e === "string" ? "medium" : e.severity}`);
    }
    if (P[k] !== rid(it.common)) out.add(`divergence:${k}:info`);
  }));
  M.roles.forEach((r, ri) => {
    const p = Object.values(P).filter((v) => v === ri).length, s = Object.values(S).filter((v) => v === ri).length;
    if (p >= bottleneckAt) out.add(`bottleneck:${r.id}:high`);
    if (p === 0 && s >= M.advisoryMin) out.add(`advisory:${r.id}:medium`);
  });
  M.domains.forEach((d, di) => {
    const owners = new Set(d.items.map((_, ii) => P[`${di}-${ii}`]).filter((v) => v !== undefined));
    if (owners.size >= M.fragmentedMin) out.add(`fragmented:${d.id}:medium`);
  });
  return { out, assigned, P, S };
}
const sig = (f) => f.rule === "unowned" ? `unowned:${f.item}:${f.severity}` : f.rule === "involve" ? `involve:${f.item}:${f.role}:${f.severity}` : f.rule === "divergence" ? `divergence:${f.item}:${f.severity}`
  : f.rule === "fragmented" ? `fragmented:${f.domain}:${f.severity}` : `${f.rule}:${f.role}:${f.severity}`;
let rulesOk = true, countsOk = true, orderOk = true, nextOk = true, det = true, readyOk = true, seen = new Set();
const SEV = { critical: 0, high: 1, medium: 2, info: 3 };
for (let i = 0; i < 20000; i++) {
  const st = randomState(i % 5 === 0 ? 0.6 : i % 5 === 1 ? 1 : 0.9);
  if (i % 7 === 0) { const r = pick(nR); for (const k of keys) if (rnd() < 0.7) st.primary[k] = r; }
  if (i % 11 === 0) { const r = pick(nR); for (const k of keys) { if (st.primary[k] === r) delete st.primary[k]; if (rnd() < 0.5) st.secondary[k] = r; } }
  const o = scoreOwnership(M, st), want = oracle(st);
  const got = new Set(o.findings.map(sig));
  if (got.size !== want.out.size || [...want.out].some((w) => !got.has(w)) || o.findings.length !== got.size) rulesOk = false;
  o.findings.forEach((f) => seen.add(f.rule + ":" + f.severity));
  if (o.ready !== (want.assigned >= M.minAssigned) || (!o.ready && (o.findings.length || o.nextDiagnostic))) readyOk = false;
  const legacyP = M.roles.map((_, ri) => Object.values(want.P).filter((v) => v === ri).length);
  const legacyS = M.roles.map((_, ri) => Object.values(want.S).filter((v) => v === ri).length);
  if (o.counts.some((c, ri) => c.primary !== legacyP[ri] || c.secondary !== legacyS[ri])) countsOk = false;
  for (let j = 1; j < o.findings.length; j++) if (SEV[o.findings[j - 1].severity] > SEV[o.findings[j].severity]) orderOk = false;
  if (o.ready) {
    const serious = o.findings.filter((f) => f.severity === "critical" || f.severity === "high");
    const meet = serious.filter((f) => f.trace.some((k) => ["0", "2"].includes(k.split("-")[0]))).length;
    const expect = serious.length && meet * 2 >= serious.length ? M.next.cxIt : M.next.otherwise;
    if (!o.nextDiagnostic || o.nextDiagnostic.tool !== expect) nextOk = false;
  }
  if (i < 500 && JSON.stringify(scoreOwnership(M, st)) !== JSON.stringify(o)) det = false;
}
ok("every finding equals the oracle, with its published severity, and nothing else is raised", rulesOk);
ok("below 20 assigned decisions nothing is claimed: no finding, no next diagnostic", readyOk);
ok("accountable and contributing counts equal the legacy count formula", countsOk);
ok("findings run from most severe to least", orderOk);
ok("the next diagnostic follows the published rule", nextOk);
ok("scoring is deterministic", det);
for (const r of ["unowned:critical", "involve:high", "involve:medium", "bottleneck:high", "advisory:medium", "fragmented:medium", "divergence:info"])
  ok(`reachable: ${r}`, seen.has(r));

/* ------------------------------------------------------------ 3. fixtures */
section("3. Worked cases");
const common = Object.fromEntries(M.domains.flatMap((d, di) => d.items.map((it, ii) => [`${di}-${ii}`, rid(it.common)])));
const c1 = scoreOwnership(M, { primary: common, secondary: {} });
ok("every decision with its common owner and no contributors: no divergence, and exactly the four control and budget gaps are high",
  c1.bySeverity.info === 0 && c1.bySeverity.high === 4 && c1.findings.filter((f) => f.severity === "high").every((f) => f.rule === "involve"));
const c2 = scoreOwnership(M, { primary: common, secondary: { "0-3": rid("fin"), "3-3": rid("risk"), "4-3": rid("risk"), "5-0": rid("fin"), "5-1": rid("risk") } });
ok("adding the five contributors clears every high finding", c2.bySeverity.high === 0 && c2.bySeverity.critical === 0);
const allIt = scoreOwnership(M, { primary: Object.fromEntries(keys.map((k) => [k, rid("it")])), secondary: {} });
ok("one role owning all 30 raises a bottleneck", allIt.findings.some((f) => f.rule === "bottleneck" && f.role === "it"));
const adv = scoreOwnership(M, { primary: common, secondary: Object.fromEntries(keys.slice(0, 6).map((k) => [k, rid("risk")])) });
ok("a role contributing to 6 decisions and owning none is influence without authority", adv.findings.some((f) => f.rule === "advisory" && f.role === "risk"));
const frag = { ...common, "0-0": rid("ops"), "0-1": rid("it"), "0-2": rid("fin") };
ok("four different owners in one domain is fragmented", scoreOwnership(M, { primary: frag, secondary: {} }).findings.some((f) => f.rule === "fragmented" && f.domain === "strategy"));
const nineteen = Object.fromEntries(keys.slice(0, 19).map((k) => [k, 0]));
ok("19 assigned: not ready, nothing claimed", scoreOwnership(M, { primary: nineteen, secondary: {} }).ready === false);
ok("20 assigned: ready, and the 10 unassigned are critical", (() => { const o = scoreOwnership(M, { primary: Object.fromEntries(keys.slice(0, 20).map((k) => [k, 0])), secondary: {} }); return o.ready && o.bySeverity.critical === 10; })());
const hostile = { primary: { ...common, "9-9": 1, "0-0": 7, "0-1": -1, "0-2": 1.5, __proto__: 1 }, secondary: { "0-3": 0, "1-0": 99 } };
const h = scoreOwnership(M, hostile);
ok("invalid keys and roles are ignored: they neither assign nor crash", h.assigned === 27 && h.findings.filter((f) => f.rule === "unowned").length === 3);
ok("a contributor equal to the owner is ignored", h.items.find((x) => x.key === "0-3").secondary === null);
ok("a legacy link using only the first five roles opens with every assignment", (() => { const st = { primary: Object.fromEntries(keys.map((k, i) => [k, i % 5])), secondary: {} }; return scoreOwnership(M, st).assigned === 30; })());
ok("every action names its decision or role and carries no unfilled placeholder", [c1, allIt, adv].every((o) => o.findings.every((f) => !/\{\w+\}/.test(f.action) && f.action.length > 20)));

/* ------------------------------------------------------------ 4. tool */
section("4. The tool scores through the engine and publishes its model");
const TOOL = readFileSync("./GovernanceModel.jsx", "utf8");
const APP = readFileSync("./App.jsx", "utf8");
ok("GovernanceModel.jsx imports the engine and its model", /import \{ scoreOwnership \} from "\.\/src\/lib\/ownership"/.test(TOOL) && TOOL.includes("/src/lib/rubrics/governance"));
ok("no local role list, domain list or overload threshold", !/const ROLES = \[|const DOMAINS = \[|pc > 8/.test(TOOL));
ok("renders the findings and the next diagnostic", /R\.findings\.map/.test(TOOL) && /Next diagnostic:/.test(TOOL));
ok("links the published model", /href=\{MODEL\.methodology\}/.test(TOOL));
ok("the PDF carries the findings, the limits and the method", /title: "Findings"/.test(TOOL) && /title: "What This Assessment Cannot Tell You"/.test(TOOL) && /title: "Method"/.test(TOOL));
ok("no claim that anything was saved", !/has been saved/i.test(TOOL));
ok("/methodology/governance-model: route mounted", APP.includes('<Route path="/methodology/governance-model" element={<RubricPage id="governance-model" />} />'));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
