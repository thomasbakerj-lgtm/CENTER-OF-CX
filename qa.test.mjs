/* qa.test.mjs
 *
 * The QA engine (src/lib/qa.js) and the QA program model it reads
 * (src/lib/rubrics/qaScorecard.js). The engine is sliced from its markers and must equal
 * the module. Krippendorff's alpha is pinned to the worked example in Krippendorff (2011)
 * and checked against a brute-force oracle; Gwet's AC1 is pinned to the kappa paradox
 * table and checked against its definition. The blind rule, every form and calibration
 * rule, the next step and old links are gated, and engine mutants must be caught.
 */
import { readFileSync } from "node:fs";
import * as Q from "./src/lib/qa.js";
import { QA_SCORECARD as M } from "./src/lib/rubrics/qaScorecard.js";
import { RUBRICS } from "./src/lib/rubrics/index.js";
import { JOURNEY } from "./src/lib/journey.js";

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
const DASH = new RegExp("[" + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + "]");
let seed = 20260924;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const pick = (n) => Math.floor(rnd() * n);
const close = (a, b, e = 1e-9) => a === b || Math.abs(a - b) <= e;

/* ------------------------------------------------------------ fixtures */
const FORM = { categories: M.templates.general.categories };
const N = Q.qaCriteria(FORM).length;
const LABELS = ["AB", "CD", "EF", "GH", "IJ"];
const session = (nE, nC, flip = 0.12, form = FORM) => {
  const n = Q.qaCriteria(form).length, codes = [];
  for (let c = 0; c < nC; c++) {
    const quality = rnd();
    for (let e = 0; e < nE; e++) codes.push(Q.encodeSubmission(form, { evaluator: LABELS[e], call: "C" + (100 + c), marks: Array.from({ length: n }, () => (rnd() < flip ? rnd() < quality : rnd() < 0.5 + quality / 2)) }));
  }
  return codes;
};
const shuffle = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = pick(i + 1); [b[i], b[j]] = [b[j], b[i]]; } return b; };

/* ------------------------------------------------------------ 0. engine */
section("0. The engine is sliced live and matches the module");
const SRC = readFileSync("./src/lib/qa.js", "utf8");
const a = SRC.indexOf("/* @engine-start */"), b = SRC.indexOf("/* @engine-end */");
ok("engine markers present, in order", a > 0 && b > a);
const BODY = SRC.slice(a, b);
const NAMES = "qaThresholdVars, qaCriteria, qaFormKey, scoreEvaluation, encodeSubmission, decodeSubmission, krippendorffAlpha, qaAgreement, qaBootstrap, lintForm, calibrate, reviewQA";
const load = (body) => new Function(body + "\nreturn { " + NAMES + " };")();
const E = load(BODY);
ok("the slice has no import, JSX or DOM access", !/import |<[A-Z]|window\.|document\./.test(BODY));
let same = true;
for (let i = 0; i < 300; i++) {
  const codes = session(2 + pick(3), 1 + pick(6));
  const ref = rnd() < 0.3 ? LABELS[0] : "";
  if (JSON.stringify(E.reviewQA(M, FORM, { codes, reference: ref })) !== JSON.stringify(Q.reviewQA(M, FORM, { codes, reference: ref }))) same = false;
}
ok("300 random sessions: the sliced engine equals the module", same);

/* ------------------------------------------------------------ 1. model */
section("1. The published model is complete and clean");
ok("registered in the rubric registry", RUBRICS["qa-scorecard"] === M);
ok("kind qa, version, publication date and methodology route", M.kind === "qa" && /^\d+\.\d+$/.test(M.version) && /^\d{4}-\d{2}-\d{2}$/.test(M.published) && M.methodology === "/methodology/qa-scorecard");
ok("the next step is a journey tool", !!JOURNEY[M.next.tool]);
for (const [id, r] of Object.entries(M.rules)) {
  ok(`rule ${id}: severity, group, title, test and action`, ["critical", "high", "medium", "info"].includes(r.severity) && ["form", "calibration"].includes(r.group) && r.title && r.test && r.action);
  if (r.heuristic) ok(`rule ${id}: its heuristic threshold exists and is labelled heuristic`, M.thresholds[r.heuristic] && M.thresholds[r.heuristic].kind === "heuristic");
}
ok("bands descend and end below every value", M.bands.every((x, i) => i === 0 || x.min < M.bands[i - 1].min) && M.bands[M.bands.length - 1].min === -Infinity);
ok("the cut points are Krippendorff's 0.800 and 0.667", M.bands[0].min === 0.8 && M.bands[1].min === 0.667);
ok("every source is cited with a year", M.sources.length >= 5 && M.sources.every((s) => /\(\d{4}\)/.test(s.text)));
ok("no dash anywhere in the model", !DASH.test(JSON.stringify(M)));
for (const [k, t] of Object.entries(M.templates)) {
  const L = Q.lintForm(M, t);
  ok(`template ${k}: weights total 100 and the form raises no finding`, L.total === 100 && L.findings.length === 0);
  ok(`template ${k}: its mix covers the whole weight`, close(L.mix.reduce((s, m) => s + m.weight, 0), 100, 1e-9) && L.untaggedWeight === 0);
}

/* ------------------------------------------------------------ 2. alpha */
section("2. Krippendorff's alpha: the published example and a brute-force oracle");
const X = null;
const K = [[1, 2, 3, 3, 2, 1, 4, 1, 2, X, X, X], [1, 2, 3, 3, 2, 2, 4, 1, 2, 5, X, 3], [X, 3, 3, 3, 2, 3, 4, 2, 2, 5, 1, X], [1, 2, 3, 3, 2, 4, 4, 1, 2, 5, 1, X]];
const KU = K[0].map((_, i) => K.map((o) => o[i]).filter((v) => v !== null));
ok("Krippendorff (2011) example, nominal alpha 0.743", Q.krippendorffAlpha(KU, "nominal").toFixed(3) === "0.743");
ok("Krippendorff (2011) example, interval alpha 0.849", Q.krippendorffAlpha(KU, "interval").toFixed(3) === "0.849");
const alphaOracle = (units, metric) => {
  const U = units.filter((u) => u.length >= 2), all = U.flat(), n = all.length;
  const d = (x, y) => (metric === "interval" ? (x - y) ** 2 : x === y ? 0 : 1);
  let Do = 0; for (const u of U) { let s = 0; for (let i = 0; i < u.length; i++) for (let j = 0; j < u.length; j++) if (i !== j) s += d(u[i], u[j]); Do += s / (u.length - 1); }
  Do /= n;
  let De = 0; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) De += d(all[i], all[j]);
  De /= n * (n - 1);
  return De === 0 ? null : 1 - Do / De;
};
let aSame = true;
for (let i = 0; i < 2000; i++) {
  const units = Array.from({ length: 1 + pick(12) }, () => Array.from({ length: pick(6) }, () => pick(4)));
  for (const metric of ["nominal", "interval"]) {
    const x = Q.krippendorffAlpha(units, metric), y = alphaOracle(units, metric);
    if (!((x === null && (y === null || units.filter((u) => u.length >= 2).reduce((s, u) => s + u.length, 0) < 2)) || (x !== null && y !== null && close(x, y, 1e-9)))) aSame = false;
  }
}
ok("2,000 random unit sets: closed-form alpha equals the brute-force oracle, both metrics", aSame);
ok("no variation at all: alpha is undefined, never a number", Q.krippendorffAlpha([[1, 1], [1, 1, 1]], "nominal") === null);

/* ------------------------------------------------------------ 3. AC1 */
section("3. Gwet's AC1 and percent agreement");
const px = M.paradox;
const PU = [...Array(px.bothPass).fill([1, 1]), ...Array(px.splitA).fill([1, 0]), ...Array(px.splitB).fill([0, 1]), ...Array(px.bothFail).fill([0, 0])];
const G = Q.qaAgreement(PU, 2);
ok("the paradox table: 90% agreement", close(G.pa, 0.9));
ok("the paradox table: AC1 0.890", G.ac1.toFixed(3) === "0.890");
const pA = (px.bothPass + px.splitA) / px.calls, pB = (px.bothPass + px.splitB) / px.calls, peK = pA * pB + (1 - pA) * (1 - pB);
ok("the paradox table: Cohen's kappa is negative, the paradox the method avoids", ((0.9 - peK) / (1 - peK)).toFixed(3) === "-0.053");
let gSame = true;
for (let i = 0; i < 2000; i++) {
  const units = Array.from({ length: 1 + pick(10) }, () => Array.from({ length: 2 + pick(4) }, () => (rnd() < 0.85 ? 1 : 0)));
  let agree = 0; const pi = [0, 0];
  for (const u of units) { let s = 0, p = 0; for (let x = 0; x < u.length; x++) for (let y = 0; y < u.length; y++) if (x !== y) { p++; if (u[x] === u[y]) s++; } agree += s / p; for (const v of u) pi[v] += 1 / u.length; }
  agree /= units.length;
  const pe = pi.reduce((s, x) => s + (x / units.length) * (1 - x / units.length), 0);
  const g = Q.qaAgreement(units, 2);
  if (!close(g.pa, agree) || !close(g.ac1, (agree - pe) / (1 - pe))) gSame = false;
}
ok("2,000 random sets: percent agreement is the pairwise share and AC1 matches Gwet's definition", gSame);

/* ------------------------------------------------------------ 4. codes */
section("4. Submission codes");
const marks = Array.from({ length: N }, (_, i) => i % 3 !== 0);
const code = Q.encodeSubmission(FORM, { evaluator: "AB", call: "1001", marks });
const dec = Q.decodeSubmission(FORM, code);
ok("a code round-trips evaluator, call and every mark", dec.ok && dec.evaluator === "AB" && dec.call === "1001" && JSON.stringify(dec.marks) === JSON.stringify(marks));
const other = { categories: M.templates.billing.categories };
ok("a code scored on a different form is set aside", !Q.decodeSubmission(other, code).ok && Q.decodeSubmission(other, code).reason === "scored on a different form");
ok("changing a weight keeps codes valid; changing a criterion does not", Q.decodeSubmission({ categories: FORM.categories.map((c, i) => ({ ...c, weight: i ? c.weight : c.weight + 5 })) }, code).ok && !Q.decodeSubmission({ categories: FORM.categories.map((c, i) => (i ? c : { ...c, criteria: c.criteria.map((x, j) => (j ? x : { ...x, text: x.text + "!" })) })) }, code).ok);
ok("a code with too few marks, a stray field or an unsafe label is set aside", !Q.decodeSubmission(FORM, code.slice(0, -1)).ok && !Q.decodeSubmission(FORM, code + "|x").ok && !Q.decodeSubmission(FORM, code.replace("|AB|", "|<b>|")).ok);
ok("labels are cut to safe characters before encoding", Q.encodeSubmission(FORM, { evaluator: "A<script>B", call: "1|2", marks }).split("|")[2] === "AscriptB");
ok("an evaluation scores only when every criterion is marked", Q.scoreEvaluation(FORM, marks.slice(0, -1)) === null && Q.scoreEvaluation(FORM, [...marks.slice(0, -1), undefined]) === null && Q.scoreEvaluation(FORM, marks) !== null);
const allYes = Q.scoreEvaluation(FORM, Array(N).fill(true));
ok("all yes scores the full weight with no auto-fail", close(allYes.score, 100) && !allYes.autoFail);
const critMiss = Q.qaCriteria(FORM).findIndex((c) => c.critical);
const oneCrit = Q.scoreEvaluation(FORM, Array.from({ length: N }, (_, i) => i !== critMiss));
ok("missing one critical criterion auto-fails and still reports the weighted score", oneCrit.autoFail && oneCrit.score < 100);
const dup = [...session(2, 3), Q.encodeSubmission(FORM, { evaluator: "AB", call: "C100", marks })];
ok("a second code for the same evaluator and call is set aside, first one kept", Q.calibrate(M, FORM, dup, "").rejected.some((r) => /second submission/.test(r.reason)));

/* ------------------------------------------------------------ 5. blind */
section("5. The blind rule: nothing is compared until every evaluator has scored every call");
let blind = true, order = true, counts = true;
for (let i = 0; i < 400; i++) {
  const codes = session(2 + pick(3), 2 + pick(4));
  const full = Q.calibrate(M, FORM, codes, "");
  if (!full.complete || !full.result) blind = false;
  const k = pick(codes.length), drop = codes.filter((_, j) => j !== k);
  const part = Q.calibrate(M, FORM, drop, "");
  if (part.result !== null || part.complete) blind = false;
  if (JSON.stringify(Object.keys(part).sort()) !== JSON.stringify(["accepted", "calls", "complete", "evaluators", "names", "raters", "reference", "rejected", "result", "status"])) blind = false;
  if (part.status.some((s) => Object.keys(s).join() !== "call,scored,of")) counts = false;
  if (JSON.stringify(Q.calibrate(M, FORM, shuffle(codes), "")) !== JSON.stringify(full)) order = false;
}
ok("400 sessions of 2 or more calls: complete sessions grade; drop any one code and no result, score or comparison is returned", blind);
ok("a sealed session shows only counts per call", counts);
ok("the order codes are pasted in never changes the result", order);
ok("one evaluator alone never completes a session", Q.calibrate(M, FORM, session(1, 4), "").result === null);
ok("two evaluators with one as reference never complete a session", Q.calibrate(M, FORM, session(2, 4), "AB").result === null);

/* ------------------------------------------------------------ 6. form rules */
section("6. Every form rule, exactly and against an oracle");
const T = M.thresholds;
const lintOracle = (form) => {
  const want = new Set(), crit = Q.qaCriteria(form);
  if (form.categories.reduce((s, c) => s + c.weight, 0) !== 100) want.add("weights");
  if (form.categories.some((c) => c.weight > 0 && !c.criteria.length)) want.add("emptyCategory");
  if (crit.some((c) => !(c.def || "").trim())) want.add("definition");
  if (crit.some((c) => c.critical && !M.reasons.some((r) => r.id === c.reason))) want.add("criticalReason");
  if (crit.some((c) => !c.critical && c.weight / c.size > T.swingMax.value)) want.add("swing");
  if (crit.some((c) => !M.focus.some((f) => f.id === c.focus))) want.add("focus");
  return [...want].sort().join();
};
const randomForm = () => ({ categories: Array.from({ length: 1 + pick(6) }, () => ({ name: "C", weight: pick(45), criteria: Array.from({ length: pick(5) }, () => ({ text: "x" + pick(99), critical: rnd() < 0.25, def: rnd() < 0.9 ? "d" : "", focus: rnd() < 0.9 ? M.focus[pick(3)].id : "", reason: rnd() < 0.85 ? M.reasons[pick(4)].id : "" })) })) });
let lintSame = true;
for (let i = 0; i < 5000; i++) { const f = randomForm(); if ([...new Set(Q.lintForm(M, f).findings.map((x) => x.rule))].sort().join() !== lintOracle(f)) lintSame = false; }
ok("5,000 random forms: the rules raised equal the oracle", lintSame);
const one = (w, n, extra = {}) => ({ categories: [{ name: "A", weight: w, criteria: Array.from({ length: n }, (_, i) => ({ text: "c" + i, critical: false, def: "d", focus: "outcome", ...extra })) }, { name: "B", weight: 100 - w, criteria: Array.from({ length: 10 }, (_, i) => ({ text: "b" + i, critical: false, def: "d", focus: "process" })) }] });
ok("swing at exactly the threshold is not raised", !Q.lintForm(M, one(30, 2)).findings.some((f) => f.rule === "swing"));
ok("swing just over the threshold is raised with its points", Q.lintForm(M, one(31, 2)).findings.some((f) => f.rule === "swing" && /15\.5 points/.test(f.action)));
ok("an auto-fail is exempt from the swing rule", !Q.lintForm(M, one(60, 1, { critical: true, reason: "legal" })).findings.some((f) => f.rule === "swing"));
ok("every finding action is filled: no placeholder is left", (() => { for (let i = 0; i < 500; i++) if (Q.lintForm(M, randomForm()).findings.some((f) => /\{|\}|undefined/.test(f.action))) return false; return true; })());
ok("severities follow the model", Q.lintForm(M, { categories: [{ name: "A", weight: 10, criteria: [] }] }).findings.every((f) => f.severity === M.rules[f.rule].severity));

/* Old links: the pre-1.0 General Inbound form had no definitions, focus or reasons. */
const LEGACY = { categories: M.templates.general.categories.map((c) => ({ name: c.name, weight: c.weight, criteria: c.criteria.map((x) => ({ text: x.text, critical: x.critical })) })) };
const LL = Q.lintForm(M, LEGACY);
ok("an old link opens: weights still total 100", LL.total === 100);
ok("an old link raises one definition finding for all 14 criteria", LL.findings.filter((f) => f.rule === "definition").length === 1 && LL.findings.find((f) => f.rule === "definition").trace.length === 14);
ok("an old link raises a reason finding for each of its 4 auto-fails", LL.findings.filter((f) => f.rule === "criticalReason").length === 4);
ok("old submission codes still match: the fingerprint reads only criteria and auto-fails", Q.qaFormKey(LEGACY) === Q.qaFormKey(FORM));

/* ------------------------------------------------------------ 7. calibration rules */
section("7. Calibration rules against oracles");
let biasOk = true, spreadOk = true, itemOk = true, refOk = true, loadOk = true, gradedOk = true;
for (let i = 0; i < 400; i++) {
  const nE = 2 + pick(4), nC = 1 + pick(6);
  const codes = session(nE, nC, 0.2);
  const ref = rnd() < 0.3 && nE > 2 ? "AB" : "";
  const c = Q.calibrate(M, FORM, codes, ref);
  const subs = codes.map((x) => ({ ...Q.decodeSubmission(FORM, x) })).map((s) => ({ ...s, ...Q.scoreEvaluation(FORM, s.marks) }));
  const raters = [...new Set(subs.map((s) => s.evaluator))].filter((e) => e !== ref).sort();
  const calls = [...new Set(subs.map((s) => s.call))].sort();
  const get = (e, k) => subs.find((s) => s.evaluator === e && s.call === k);
  for (const e of raters) {
    let d = 0; for (const k of calls) { const o = raters.filter((x) => x !== e); d += get(e, k).score - o.reduce((s, x) => s + get(x, k).score, 0) / o.length; }
    const want = d / calls.length;
    const got = c.result.bias.find((x) => x.evaluator === e).bias;
    if (!close(got, want, 1e-9)) biasOk = false;
    if ((Math.abs(want) > T.biasMax.value) !== c.result.findings.some((f) => f.rule === "bias" && f.evaluator === e)) biasOk = false;
  }
  for (const k of calls) {
    const s = raters.map((e) => get(e, k).score), m = s.reduce((x, y) => x + y, 0) / s.length;
    if (s.some((v) => Math.abs(v - m) > T.spreadMax.value) !== c.result.findings.some((f) => f.rule === "spread" && f.call === k)) spreadOk = false;
  }
  Q.qaCriteria(FORM).forEach((cr, idx) => {
    let s = 0; for (const k of calls) { const v = raters.map((e) => get(e, k).marks[idx]); let a2 = 0, p = 0; for (let x = 0; x < v.length; x++) for (let y = 0; y < v.length; y++) if (x !== y) { p++; if (v[x] === v[y]) a2++; } s += a2 / p; }
    const agree = s / calls.length;
    if (!close(c.result.items[idx].agreement, agree)) itemOk = false;
    if ((agree < T.itemAgreementMin.value) !== c.result.findings.some((f) => f.rule === "itemAgreement" && f.criterion === cr.key)) itemOk = false;
  });
  if (ref) for (const e of raters) {
    let m = 0, n = 0; for (const k of calls) get(e, k).marks.forEach((v, j) => { n++; if (v === get(ref, k).marks[j]) m++; });
    if ((m / n < T.itemAgreementMin.value) !== c.result.findings.some((f) => f.rule === "reference" && f.evaluator === e)) refOk = false;
  } else if (c.result.accuracy.length) refOk = false;
  const share = raters.flatMap((e) => calls.map((k) => get(e, k))).filter((s) => s.autoFail).length / (raters.length * calls.length);
  if ((share > T.criticalLoadMax.value) !== c.result.findings.some((f) => f.rule === "criticalLoad")) loadOk = false;
  if (c.result.graded !== calls.length >= T.minCalls.value) gradedOk = false;
  if (!c.result.graded && (c.result.measures.some((m) => m.grade !== null && m.grade !== "unanimous" && m.grade !== "undefined") || !c.result.findings.some((f) => f.rule === "notGraded"))) gradedOk = false;
}
ok("400 sessions: bias is leave-one-out and flagged exactly past the threshold", biasOk);
ok("400 sessions: a call is flagged exactly when a score sits past the spread threshold", spreadOk);
ok("400 sessions: item agreement is the pairwise share and flagged exactly below the threshold", itemOk);
ok("400 sessions: the reference rule fires exactly below the threshold, and only with a reference", refOk);
ok("400 sessions: critical load fires exactly past its share", loadOk);
ok("400 sessions: fewer than the minimum calls is shown, never graded", gradedOk);

let gradeOk = true, detOk = true;
for (let i = 0; i < 150; i++) {
  const codes = session(2 + pick(3), 3 + pick(6));
  const c1 = Q.calibrate(M, FORM, codes, ""), c2 = Q.calibrate(M, FORM, codes, "");
  if (JSON.stringify(c1) !== JSON.stringify(c2)) detOk = false;
  for (const m of c1.result.measures) {
    if (m.value === null) { if (m.grade !== "unanimous" && m.grade !== "undefined") gradeOk = false; continue; }
    if (!m.interval) { if (m.grade !== "inconclusive") gradeOk = false; continue; }
    if (m.interval.low > m.interval.high) gradeOk = false;
    const band = (v) => M.bands.find((x) => v >= x.min).id;
    const want = band(m.interval.low) === band(m.interval.high) ? band(m.interval.low) : "inconclusive";
    if (m.grade !== want) gradeOk = false;
    const rule = { unreliable: "reliability", inconclusive: "inconclusive", tentative: "tentative" }[want];
    if (rule && !c1.result.findings.some((f) => f.rule === rule && f.measure === m.id)) gradeOk = false;
  }
}
ok("150 sessions: a measure is graded by where its whole interval falls, and raises its finding", gradeOk);
ok("the bootstrap is seeded: the same session always gives the same intervals", detOk);

const unanimous = LABELS.slice(0, 3).flatMap((e) => ["1", "2", "3"].map((k) => Q.encodeSubmission(FORM, { evaluator: e, call: k, marks: Array(N).fill(true) })));
const U3 = Q.reviewQA(M, FORM, { codes: unanimous, reference: "" });
ok("a unanimous session reads as unanimous (alpha undefined) or reliable (AC1 of 1), never as a failure", U3.calibration.result.measures.every((m) => m.grade === "unanimous" || (m.id === "critical" && m.grade === "reliable" && m.value === 1)) && !U3.findings.some((f) => f.severity === "high"));

/* ------------------------------------------------------------ 8. next step */
section("8. The next step");
let nextOk = true;
for (let i = 0; i < 1500; i++) {
  const form = rnd() < 0.5 ? FORM : randomForm();
  const codes = rnd() < 0.2 ? [] : session(2 + pick(3), 1 + pick(6), 0.12, form);
  const R = Q.reviewQA(M, form, { codes, reference: "" });
  const blocked = R.lint.findings.some((f) => f.severity === "critical" || f.severity === "high");
  const res = R.calibration.result;
  const want = blocked ? "form" : !res ? "calibrate" : !res.graded || res.measures.some((m) => m.grade !== "reliable" && m.grade !== "unanimous") ? "recalibrate" : "outcome";
  if (R.next.step !== want || (R.next.tool !== null) !== (want === "outcome")) nextOk = false;
  for (let j = 1; j < R.findings.length; j++) if ({ critical: 0, high: 1, medium: 2, info: 3 }[R.findings[j].severity] < { critical: 0, high: 1, medium: 2, info: 3 }[R.findings[j - 1].severity]) nextOk = false;
}
ok("1,500 reviews: the next step follows the published order, and findings run most serious first", nextOk);
ok("a clean form with a unanimous graded session goes to FCR Leakage", U3.next.step === "outcome" && U3.next.tool === "fcr-leakage");

/* ------------------------------------------------------------ 9. mutants */
section("9. Engine mutants are caught");
const mutants = [
  ["alpha divides by m instead of m minus 1", "Do += qaPairSum(u, metric) / (u.length - 1);", "Do += qaPairSum(u, metric) / u.length;", (X) => X.krippendorffAlpha(KU, "nominal").toFixed(3) !== "0.743"],
  ["the blind rule is dropped", "if (!complete) return { ...base, result: null };", "", (X) => { try { return X.calibrate(M, FORM, session(3, 3).slice(1), "").result !== null; } catch (e) { return true; } }],
  ["bias compares with the whole call instead of the others", "const others = c.subs.filter((_, j) => j !== ei);", "const others = c.subs;", (X) => { const codes = session(3, 4, 0.3); const x = X.calibrate(M, FORM, codes, "").result.bias, y = Q.calibrate(M, FORM, codes, "").result.bias; return x.some((v, i) => !close(v.bias, y[i].bias)); }],
  ["the swing rule forgets auto-fails are exempt", "if (!c.critical && points >", "if (points >", (X) => X.lintForm(M, one(60, 1, { critical: true, reason: "legal" })).findings.some((f) => f.rule === "swing")],
];
for (const [name, from, to, killed] of mutants) {
  ok(`mutant present in source: ${name}`, BODY.includes(from));
  ok(`mutant caught: ${name}`, killed(load(BODY.replace(from, to))));
}

/* ------------------------------------------------------------ 10. wiring */
section("10. The tool scores through the engine and publishes its method");
const TOOL = readFileSync("./QAScorecardBuilder.jsx", "utf8");
const APP = readFileSync("./App.jsx", "utf8");
ok("the tool imports the engine and the model", /from "\.\/src\/lib\/qa"/.test(TOOL) && /from "\.\/src\/lib\/rubrics\/qaScorecard"/.test(TOOL));
ok("the tool keeps no template or band table of its own", !/const TEMPLATES = \{\n/.test(TOOL) && !/>= 85/.test(TOOL));
ok("the tool links the published method", /href=\{MODEL\.methodology\}/.test(TOOL));
ok("every user string headed for the PDF is escaped", /const esc = /.test(TOOL) && /esc\(c\.name\)/.test(TOOL) && /esc\(f\.action\)/.test(TOOL));
ok("the PDF carries findings, limits and method", /title: "Findings"/.test(TOOL) && /title: "What This Tool Cannot Tell You"/.test(TOOL) && /title: "Method"/.test(TOOL));
ok("/methodology/qa-scorecard: route mounted", APP.includes('<Route path="/methodology/qa-scorecard" element={<RubricPage id="qa-scorecard" />} />'));
ok("/methodology/qa-scorecard: in the sitemap", readFileSync("./public/sitemap.xml", "utf8").includes("/methodology/qa-scorecard<"));
ok("no dash in the engine, the model or the tool", !DASH.test(SRC) && !DASH.test(TOOL) && !DASH.test(readFileSync("./src/lib/rubrics/qaScorecard.js", "utf8")));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
