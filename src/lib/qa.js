/* qa.js
 *
 * The engine for the QA program model (kind "qa", src/lib/rubrics/qaScorecard.js). It
 * checks how a QA form is built, scores one evaluation, carries blind calibration
 * submissions in and out of a plain-text code, and grades a calibration session under
 * the Center of CX Calibration Method: Krippendorff's alpha on total scores (interval)
 * and on item marks (nominal), Gwet's AC1 on critical-fail marks, percent agreement
 * beside each, and a seeded bootstrap interval over calls on every measure.
 *
 * Blind rule: calibrate() returns no result, no score and no evaluator comparison until
 * every evaluator in the session has scored every call. Before that it returns counts.
 *
 * Every finding names its rule, severity and the criteria, calls or evaluators behind it.
 */

/* @engine-start */
const QA_SEVERITY = { critical: 0, high: 1, medium: 2, info: 3 };

function qaFill(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, k) => (vars[k] === undefined ? "" : String(vars[k])));
}

function qaPct(x) { return Math.round(x * 100) + "%"; }

function qaThresholdVars(model) {
  const t = model.thresholds, v = {};
  for (const k of Object.keys(t)) v[k] = /Max$|Min$/.test(k) && t[k].value < 1 ? qaPct(t[k].value) : t[k].value;
  return v;
}

/* The criteria of a form in one flat order: category by category, criterion by criterion. */
function qaCriteria(form) {
  const out = [];
  (form.categories || []).forEach((c, ci) => (c.criteria || []).forEach((cr, cri) => out.push({ key: `${ci}-${cri}`, ci, cri, category: c.name, weight: c.weight, size: c.criteria.length, ...cr })));
  return out;
}

/* A short fingerprint of what evaluators mark: the criteria and which are critical.
   Weights and names can change without invalidating a submission; criteria cannot. */
function qaFormKey(form) {
  let h = 2166136261;
  const s = (form.categories || []).map((c) => (c.criteria || []).map((cr) => (cr.critical ? "!" : "") + cr.text).join("\u0001")).join("\u0002");
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return h.toString(16).padStart(8, "0");
}

function qaLabel(x) { return typeof x === "string" ? x.replace(/[^A-Za-z0-9 ._-]/g, "").trim().slice(0, 24) : ""; }

/* One evaluation: marks is an array of true or false in the flat criteria order. The
   weighted score is before critical fails; autoFail says whether a critical criterion
   was missed. Nothing is scored unless every criterion is marked. */
function scoreEvaluation(form, marks) {
  const crit = qaCriteria(form);
  if (!Array.isArray(marks) || marks.length !== crit.length || crit.length === 0 || marks.some((m) => m !== true && m !== false)) return null;
  let score = 0, autoFail = false;
  crit.forEach((c, i) => {
    if (marks[i]) score += c.weight / c.size;
    else if (c.critical) autoFail = true;
  });
  return { score, autoFail };
}

function encodeSubmission(form, sub) {
  const marks = sub.marks.map((m) => (m ? "Y" : "N")).join("");
  return ["QA1", qaFormKey(form), qaLabel(sub.evaluator), qaLabel(sub.call), marks].join("|");
}

function decodeSubmission(form, code) {
  if (typeof code !== "string") return { ok: false, reason: "not a submission code" };
  const p = code.trim().split("|");
  if (p.length !== 5 || p[0] !== "QA1") return { ok: false, reason: "not a submission code" };
  if (p[1] !== qaFormKey(form)) return { ok: false, reason: "scored on a different form" };
  const evaluator = qaLabel(p[2]), call = qaLabel(p[3]);
  if (!evaluator || !call || evaluator !== p[2] || call !== p[3]) return { ok: false, reason: "missing evaluator or call" };
  const n = qaCriteria(form).length;
  if (!/^[YN]+$/.test(p[4]) || p[4].length !== n) return { ok: false, reason: "not every criterion marked" };
  return { ok: true, evaluator, call, marks: [...p[4]].map((c) => c === "Y") };
}

/* Krippendorff's alpha. units: arrays of values, one array per unit, one value per
   evaluator who rated it. Units with fewer than two values carry no pairs and drop out.
   Pair sums use closed forms: nominal counts ordered pairs with different values,
   interval sums squared differences over ordered pairs. Returns null when there is no
   variation at all, where alpha is undefined. */
function qaPairSum(vals, metric) {
  const m = vals.length;
  if (metric === "interval") { let s = 0, s2 = 0; for (const v of vals) { s += v; s2 += v * v; } return 2 * m * s2 - 2 * s * s; }
  const c = new Map(); for (const v of vals) c.set(v, (c.get(v) || 0) + 1);
  let same = 0; for (const k of c.values()) same += k * k;
  return m * m - same;
}
function krippendorffAlpha(units, metric) {
  const U = units.filter((u) => u.length >= 2);
  const n = U.reduce((s, u) => s + u.length, 0);
  if (n < 2) return null;
  let Do = 0; for (const u of U) Do += qaPairSum(u, metric) / (u.length - 1);
  Do /= n;
  const De = qaPairSum(U.flat(), metric) / (n * (n - 1));
  if (!(De > 1e-12)) return null;
  return 1 - Do / De;
}

/* Gwet's AC1 over q categories, and the percent agreement it corrects: the share of
   evaluator pairs, unit by unit, that gave the same value. */
function qaAgreement(units, q) {
  const U = units.filter((u) => u.length >= 2);
  if (!U.length) return null;
  const cats = new Map();
  let pa = 0;
  for (const u of U) {
    const c = new Map(); for (const v of u) c.set(v, (c.get(v) || 0) + 1);
    let s = 0; for (const k of c.values()) s += k * (k - 1);
    pa += s / (u.length * (u.length - 1));
    for (const [v, k] of c) cats.set(v, (cats.get(v) || 0) + k / u.length);
  }
  pa /= U.length;
  let pe = 0; for (const x of cats.values()) { const pi = x / U.length; pe += pi * (1 - pi); }
  pe /= q - 1;
  return { pa, ac1: pe >= 1 ? null : (pa - pe) / (1 - pe) };
}

function qaBand(model, v) { return model.bands.find((b) => v >= b.min); }

/* A seeded bootstrap over calls: resample the calls with replacement, recompute the
   measure, take the percentile interval. Deterministic for a given session. */
function qaBootstrap(model, calls, stat) {
  const B = model.bootstrap;
  let seed = B.seed >>> 0;
  const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const vals = [];
  for (let r = 0; r < B.resamples; r++) {
    const sample = [];
    for (let i = 0; i < calls.length; i++) sample.push(calls[Math.floor(rnd() * calls.length)]);
    const v = stat(sample);
    if (v !== null && Number.isFinite(v)) vals.push(v);
  }
  if (vals.length < B.resamples / 2) return null;
  vals.sort((a, b) => a - b);
  const tail = (1 - B.level) / 2;
  const at = (p) => vals[Math.min(vals.length - 1, Math.max(0, Math.floor(p * vals.length)))];
  return { low: at(tail), high: at(1 - tail) };
}

function lintForm(model, form) {
  const R = model.rules, T = qaThresholdVars(model), findings = [];
  const push = (rule, vars, trace, extra) => findings.push({ rule, group: R[rule].group, severity: R[rule].severity, title: R[rule].title, action: qaFill(R[rule].action, { ...T, ...vars }), trace, ...extra });
  const cats = form.categories || [];
  const total = cats.reduce((a, c) => a + c.weight, 0);
  if (total !== 100) push("weights", { total }, cats.map((_, ci) => `cat-${ci}`));
  cats.forEach((c, ci) => { if (c.weight > 0 && !(c.criteria || []).length) push("emptyCategory", { category: c.name }, [`cat-${ci}`]); });
  const crit = qaCriteria(form);
  const undefinedDefs = crit.filter((c) => !(typeof c.def === "string" && c.def.trim()));
  if (undefinedDefs.length) push("definition", { count: undefinedDefs.length, first: undefinedDefs[0].text }, undefinedDefs.map((c) => c.key));
  const reasons = model.reasons.map((r) => r.id);
  for (const c of crit) if (c.critical && !reasons.includes(c.reason)) push("criticalReason", { criterion: c.text }, [c.key], { criterion: c.key });
  for (const c of crit) {
    const points = c.weight / c.size;
    if (!c.critical && points > model.thresholds.swingMax.value) push("swing", { criterion: c.text, category: c.category, points: Math.round(points * 10) / 10 }, [c.key], { criterion: c.key });
  }
  const foci = model.focus.map((f) => f.id);
  const untagged = crit.filter((c) => !foci.includes(c.focus));
  if (untagged.length) push("focus", { count: untagged.length, first: untagged[0].text }, untagged.map((c) => c.key));
  /* The mix: the share of the form's weight on each focus, a fact with no threshold. */
  const mix = model.focus.map((f) => ({ focus: f.id, label: f.label, weight: crit.filter((c) => c.focus === f.id).reduce((a, c) => a + c.weight / c.size, 0) }));
  const untaggedWeight = untagged.reduce((a, c) => a + c.weight / c.size, 0);
  return { total, criteria: crit.length, critical: crit.filter((c) => c.critical).length, mix, untaggedWeight, findings };
}

/* A calibration session. codes: submission codes in any order; reference: an evaluator
   label or "". Returns the accepted and rejected codes, per-call counts, and, only once
   every evaluator has scored every call, the graded result. */
function calibrate(model, form, codes, reference) {
  const R = model.rules, T = qaThresholdVars(model);
  const crit = qaCriteria(form);
  const accepted = [], rejected = [], seen = new Set();
  (Array.isArray(codes) ? codes : []).forEach((code, i) => {
    if (typeof code !== "string" || !code.trim()) return;
    const d = decodeSubmission(form, code);
    if (!d.ok) { rejected.push({ index: i, reason: d.reason }); return; }
    const id = d.evaluator + "|" + d.call;
    if (seen.has(id)) { rejected.push({ index: i, reason: "a second submission for the same evaluator and call" }); return; }
    seen.add(id);
    accepted.push({ ...d, ...scoreEvaluation(form, d.marks) });
  });
  const evaluators = [...new Set(accepted.map((s) => s.evaluator))].sort();
  const callIds = [...new Set(accepted.map((s) => s.call))].sort();
  const ref = reference && evaluators.includes(reference) ? reference : null;
  const raters = evaluators.filter((e) => e !== ref);
  const status = callIds.map((c) => ({ call: c, scored: accepted.filter((s) => s.call === c).length, of: evaluators.length }));
  const complete = callIds.length > 0 && raters.length >= model.thresholds.minEvaluators.value && status.every((s) => s.scored === evaluators.length);
  const base = { names: evaluators, accepted: accepted.length, rejected, evaluators: evaluators.length, raters: raters.length, calls: callIds.length, status, reference: ref, complete };
  if (!complete) return { ...base, result: null };

  const findings = [];
  const push = (rule, vars, trace, extra) => findings.push({ rule, group: R[rule].group, severity: R[rule].severity, title: R[rule].title, action: qaFill(R[rule].action, { ...T, ...vars }), trace, ...extra });
  const get = (e, c) => accepted.find((s) => s.evaluator === e && s.call === c);
  /* One record per call, raters only, in evaluator order. */
  const calls = callIds.map((c) => ({ call: c, subs: raters.map((e) => get(e, c)) }));
  const critIdx = crit.map((c, i) => (c.critical ? i : -1)).filter((i) => i >= 0);
  const scoreUnits = (cs) => cs.map((c) => c.subs.map((s) => s.score));
  const itemUnits = (cs) => cs.flatMap((c) => crit.map((_, i) => c.subs.map((s) => (s.marks[i] ? 1 : 0))));
  const critUnits = (cs) => cs.flatMap((c) => critIdx.map((i) => c.subs.map((s) => (s.marks[i] ? 1 : 0))));
  const graded = callIds.length >= model.thresholds.minCalls.value;

  const measure = (id, value, agreement, stat) => {
    const m = model.measures.find((x) => x.id === id);
    const interval = graded ? qaBootstrap(model, calls, stat) : null;
    let grade = null;
    if (value === null) grade = agreement === 1 ? "unanimous" : "undefined";
    else if (graded && !interval) grade = "inconclusive";
    else if (graded) {
      const lo = qaBand(model, interval.low), hi = qaBand(model, interval.high);
      grade = lo.id === hi.id ? lo.id : "inconclusive";
    }
    return { id, label: m.label, stat: m.stat, value, agreement, interval, grade, band: value === null ? null : qaBand(model, value).id };
  };
  const sA = krippendorffAlpha(scoreUnits(calls), "interval");
  const sP = qaAgreement(scoreUnits(calls).map((u) => u.map((v) => Math.round(v * 1000))), 2);
  const iA = krippendorffAlpha(itemUnits(calls), "nominal");
  const iP = qaAgreement(itemUnits(calls), 2);
  const measures = [
    measure("score", sA, sP ? sP.pa : null, (cs) => krippendorffAlpha(scoreUnits(cs), "interval")),
    measure("items", iA, iP ? iP.pa : null, (cs) => krippendorffAlpha(itemUnits(cs), "nominal")),
  ];
  if (critIdx.length) {
    const cG = qaAgreement(critUnits(calls), 2);
    measures.push(measure("critical", cG ? cG.ac1 : null, cG ? cG.pa : null, (cs) => { const g = qaAgreement(critUnits(cs), 2); return g ? g.ac1 : null; }));
  }
  const fmt = (v) => v.toFixed(2);
  for (const m of measures) {
    const band = (id) => model.bands.find((b) => b.id === id).label;
    if (m.grade === "unreliable") push("reliability", { measure: m.label.toLowerCase() }, [m.id], { measure: m.id });
    else if (m.grade === "inconclusive") push("inconclusive", m.interval ? { measure: m.label.toLowerCase(), low: fmt(m.interval.low) + " (" + band(qaBand(model, m.interval.low).id) + ")", high: fmt(m.interval.high) + " (" + band(qaBand(model, m.interval.high).id) + ")" } : { measure: m.label.toLowerCase(), low: "Not reliable", high: "Reliable" }, [m.id], { measure: m.id });
    else if (m.grade === "tentative") push("tentative", { measure: m.label.toLowerCase() }, [m.id], { measure: m.id });
  }
  if (!graded) push("notGraded", {}, measures.map((m) => m.id));

  /* Per criterion: the share of evaluator pairs that marked it the same way, over calls. */
  const items = crit.map((c, i) => {
    const g = qaAgreement(calls.map((x) => x.subs.map((s) => (s.marks[i] ? 1 : 0))), 2);
    return { key: c.key, text: c.text, agreement: g.pa };
  });
  for (const it of items) if (it.agreement < model.thresholds.itemAgreementMin.value) push("itemAgreement", { criterion: it.text, agreement: qaPct(it.agreement) }, [it.key], { criterion: it.key });

  /* Bias: each rater's score minus the mean of the other raters on the same call, averaged. */
  const bias = raters.map((e, ei) => {
    const d = calls.map((c) => { const others = c.subs.filter((_, j) => j !== ei); return c.subs[ei].score - others.reduce((a, s) => a + s.score, 0) / others.length; });
    return { evaluator: e, bias: d.reduce((a, x) => a + x, 0) / d.length };
  });
  for (const b of bias) if (Math.abs(b.bias) > model.thresholds.biasMax.value) push("bias", { evaluator: b.evaluator, points: Math.abs(Math.round(b.bias * 10) / 10), direction: b.bias < 0 ? "lower" : "higher" }, [b.evaluator], { evaluator: b.evaluator });

  /* Spread: a call where any rater sits more than spreadMax points from the call's mean. */
  const spread = calls.map((c) => {
    const s = c.subs.map((x) => x.score), mean = s.reduce((a, v) => a + v, 0) / s.length;
    return { call: c.call, mean, low: Math.min(...s), high: Math.max(...s), wide: s.some((v) => Math.abs(v - mean) > model.thresholds.spreadMax.value) };
  });
  for (const s of spread) if (s.wide) push("spread", { call: s.call, low: Math.round(s.low), high: Math.round(s.high) }, [s.call], { call: s.call });

  /* Accuracy against a named reference, when there is one. */
  const accuracy = ref ? raters.map((e) => {
    let same = 0, n = 0, diff = 0;
    for (const c of callIds) { const a = get(e, c), r = get(ref, c); a.marks.forEach((m, i) => { n++; if (m === r.marks[i]) same++; }); diff += a.score - r.score; }
    return { evaluator: e, match: same / n, scoreDiff: diff / callIds.length };
  }) : [];
  for (const a of accuracy) if (a.match < model.thresholds.itemAgreementMin.value) push("reference", { evaluator: a.evaluator, agreement: qaPct(a.match) }, [a.evaluator], { evaluator: a.evaluator });

  const evals = calls.flatMap((c) => c.subs);
  const failShare = evals.filter((s) => s.autoFail).length / evals.length;
  if (failShare > model.thresholds.criticalLoadMax.value) push("criticalLoad", { share: qaPct(failShare) }, callIds);

  return { ...base, result: { graded, measures, items, bias, spread, accuracy, failShare, findings } };
}

/* The whole review: form checks, the calibration session, one ordered findings list and
   the next step. The next step is to fix the form while it has a critical or high
   finding; then to calibrate; then to calibrate again while any measure is not reliable,
   inconclusive, tentative or ungraded; then to test scores against outcomes. */
function reviewQA(model, form, session) {
  const lint = lintForm(model, form);
  const cal = calibrate(model, form, session && session.codes, session && session.reference);
  const ruleOrder = Object.keys(model.rules);
  const findings = [...lint.findings, ...(cal.result ? cal.result.findings : [])];
  findings.sort((a, b) => QA_SEVERITY[a.severity] - QA_SEVERITY[b.severity] || ruleOrder.indexOf(a.rule) - ruleOrder.indexOf(b.rule));
  const formBlocked = lint.findings.some((f) => f.severity === "critical" || f.severity === "high");
  let step;
  if (formBlocked) step = { step: "form", tool: null };
  else if (!cal.result) step = { step: "calibrate", tool: null };
  else if (!cal.result.graded || cal.result.measures.some((m) => m.grade !== "reliable" && m.grade !== "unanimous")) step = { step: "recalibrate", tool: null };
  else step = { step: "outcome", tool: model.next.tool };
  return {
    model: model.id, version: model.version, kind: "qa", lint, calibration: cal, findings, next: step,
    bySeverity: Object.fromEntries(Object.keys(QA_SEVERITY).map((s) => [s, findings.filter((f) => f.severity === s).length])),
  };
}
/* @engine-end */

export { qaThresholdVars, qaCriteria, qaFormKey, scoreEvaluation, encodeSubmission, decodeSubmission, krippendorffAlpha, qaAgreement, qaBootstrap, lintForm, calibrate, reviewQA };
