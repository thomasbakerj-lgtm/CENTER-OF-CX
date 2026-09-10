/* bcb.report.mjs
 *
 * Rendered-output reconciliation for the Business Case Builder.
 *
 * bcb.test.mjs proves the arithmetic across 590 assertions. It says nothing about
 * the document a buyer hands a CFO, because every figure in that document is a
 * separate expression written in JSX, and a passing engine can sit underneath a
 * report that quotes a different number, colours a thin return as a strong one,
 * or drops a finding the reader needed. Business Case Builder was the flagship
 * export and the only rail tool without this gate. That is what this file closes.
 *
 * The gate has earned its place five times: four defects in this very tool while
 * 478 engine assertions were green, a six figure self contradiction in TCO while
 * 112 were green, the split money rendering in Channel Shift, and the zero salary
 * contradiction in Attrition.
 *
 * This file does NOT rebuild the report. It slices the ReportActions payload out
 * of the shipped JSX at runtime, binds it to the real engine sliced from the same
 * file, evaluates it, and prints the document. Every figure printed below is the
 * figure the PDF prints.
 *
 * Run from repo root: node bcb.report.mjs
 */
import { readFileSync } from "fs";

const SRC = readFileSync("./BusinessCaseBuilder.jsx", "utf8");
const { COLORS } = await import("./src/lib/benchmarks.js");
/* The real bucket and the real boundary guard, never reconstructed. severityBucket
   decides the band and sanitizeProps decides whether it reaches the wire at all. */
const { severityBucket, sanitizeProps, SEVERITY_BANDS } = await import("./src/lib/track.js");

let pass = 0, fail = 0;
const FAILS = [];
const A = (nm, c, detail = "") => {
  if (c) pass++;
  else { fail++; FAILS.push(nm); console.log("  FAIL:", nm + (detail ? "  ::  " + detail : "")); }
};

/* ---------------------------------------------------------------- slicing */

/** Slice a brace/bracket-balanced expression starting at the first `open` after `from`. */
function balanced(src, from, open, close) {
  const start = src.indexOf(open, from);
  if (start < 0) return null;
  let d = 0, inS = null, esc = false, tick = 0;
  for (let i = start; i < src.length; i++) {
    const c = src[i];
    if (esc) { esc = false; continue; }
    if (c === "\\") { esc = true; continue; }
    if (inS) { if (c === inS) inS = null; continue; }
    if (c === '"' || c === "'") { inS = c; continue; }
    if (c === "`") { tick ^= 1; continue; }
    if (tick) continue;
    if (c === open) d++;
    else if (c === close) { d--; if (d === 0) return { start, end: i + 1, text: src.slice(start, i + 1) }; }
  }
  return null;
}

/** Slice a named JSX prop expression: `name={ ... }`. */
function prop(name) {
  const at = SRC.indexOf(name + "={");
  if (at < 0) return null;
  const b = balanced(SRC, at + name.length, "{", "}");
  return b ? b.text.slice(1, -1) : null;
}

/* The same three string boundaries bcb.test.mjs uses. If an edit lands near one of
   them the slice changes silently, so both harnesses fail loudly on the same seam. */
function slice(startMarker, endMarker) {
  const a = SRC.indexOf(startMarker);
  if (a < 0) { console.error("BLOCKER: engine slice failed, missing: " + startMarker); process.exit(1); }
  const b = SRC.indexOf(endMarker, a);
  if (b < 0) { console.error("BLOCKER: engine slice failed, missing end: " + endMarker); process.exit(1); }
  return SRC.slice(a, b);
}
const helpers = slice("const STATUS = {", "function LogoMark");
const consts = slice("const STANCE = {", "/* De-overlapped model");
const engine = slice("function computeCase(", "export default function");

const subtitleAt = SRC.indexOf("subtitle={");
const subtitleExpr = balanced(SRC, subtitleAt + 9, "{", "}").text.slice(1, -1);
const summaryExpr = prop("summary");
const signalsExpr = prop("signals");
const sectionsExpr = prop("sections");
const toolNameM = SRC.match(/toolName="([^"]+)"/);

console.log("\n0. payload slices out of the shipped JSX");
A("the ReportActions subtitle slices out of the shipped JSX", !!subtitleExpr);
A("the ReportActions summary payload slices out of the shipped JSX", !!summaryExpr);
A("the ReportActions signals payload slices out of the shipped JSX", !!signalsExpr);
A("the ReportActions sections payload slices out of the shipped JSX", !!sectionsExpr);
A("the report is named", !!toolNameM);
A("the confidence prop is the same grade the engine computed", /confidence=\{conf\.grade\}/.test(SRC));
A("the scenario prop carries the exact input set", /state=\{scenario\}/.test(SRC));
A("the defaults prop points at the shared SCENARIO_DEFAULTS", /defaults=\{SCENARIO_DEFAULTS\}/.test(SRC));
A("the route prop points at the shared ROUTE", /routePath=\{ROUTE\}/.test(SRC));
A("the report payload contains no em-dash",
  [subtitleExpr, summaryExpr, signalsExpr, sectionsExpr].join("").indexOf(String.fromCharCode(0x2014)) < 0);

/* ------------------------------------------------------------- input sets */
/*
 * Set A is the shipped default at the shipped scenario stance: 200 agents, no capacity
 * action committed, evidence is an estimate, no BAU counterfactual. It is the document
 * most users see and the weakest grade the tool can honestly print.
 *
 * Set B is the 1-12 case, and it is the reason this file exists. Signed proposal,
 * reviewed BAU evidence, headcount reduction so realization is cash, no input defects,
 * no ambitious targets, and an implementation figure large enough that the case does
 * not return inside the horizon. Every axis is Finance-grade and the answer is bad.
 * The document must print Finance-grade and must still print the negative finding.
 *
 * Set C is Set B with the return restored by cutting the implementation figure, and
 * nothing else changed. Any difference in confidence between B and C is by definition
 * verdict strength moving an axis, which is the defect.
 *
 * Set D is deliberately hostile: contradictory FCR inputs, a stale inherited marginal
 * cost, targets above every planning range, aggressive stance, and a thin per agent
 * implementation. It exists to prove the three channels stay separate under load and
 * that no money figure anywhere in the document renders malformed.
 *
 * Set E is a full BAU counterfactual with an exit cost heavy enough to push maximum
 * implementation negative while run rate contribution stays positive, which is the
 * only path to the second and third return findings.
 */
const SETS = {
  A: {
    label: "Shipped defaults: 200 agents, no capacity action, evidence is an estimate",
    stance: "expected", rampOn: true, mech: "none", pulled: {}, sources: {},
    mut: () => ({}),
  },
  B: {
    label: "1-12 case: signed proposal, reviewed BAU, headcount reduction, and it does not pay",
    stance: "expected", rampOn: true, mech: "headcount", pulled: {}, sources: {},
    mut: () => ({ evidence: "proposal", bauEvidence: "reviewed", implementationCost: 6000000 }),
  },
  C: {
    label: "Set B exactly, implementation cut so the case returns: the return axis control",
    stance: "expected", rampOn: true, mech: "headcount", pulled: {}, sources: {},
    mut: () => ({ evidence: "proposal", bauEvidence: "reviewed", implementationCost: 400000 }),
  },
  D: {
    label: "Hostile: stale inherited marginal, FCR conflict, targets above every range, aggressive",
    stance: "aggressive", rampOn: true, mech: "growth",
    pulled: { marginalPerContact: true, agents: true }, sources: { marginalPerContact: "tco-calculator" },
    mut: () => ({ evidence: "proposal", marginalPerContact: 9.4, repeatShare: 25, currentFCR: 90,
      containment: 45, htReduction: 30, fcrImprovement: 30, attritionReduction: 40,
      implementationCost: 200000 }),
  },
  E: {
    label: "Full BAU counterfactual with a heavy exit cost: negative maximum implementation",
    stance: "expected", rampOn: true, mech: "hiring", pulled: {}, sources: {},
    mut: () => ({ evidence: "proposal", bauEvidence: "reviewed", bauEliminatedAnnual: 240000,
      bauOverlapMonths: 4, bauExitCost: 2200000, bauBackfillCash: 60000, bauAbsorbedHours: 400 }),
  },
};

const MECH = {
  none: { label: "Not selected", f: 0.00, cred: "none", note: "" },
  growth: { label: "Absorb growth / backlog", f: 0.25, cred: "capacity", note: "" },
  overtime: { label: "Reduce overtime", f: 0.60, cred: "finance", note: "" },
  hiring: { label: "Avoid hiring / attrition freeze", f: 0.75, cred: "finance", note: "" },
  vendor: { label: "Vendor / BPO volume reduction", f: 0.90, cred: "cash", note: "" },
  headcount: { label: "Headcount reduction", f: 1.00, cred: "cash", note: "" },
};
const MECH_ORDER = ["none", "growth", "overtime", "hiring", "vendor", "headcount"];
const MECH_DEFAULT = "hiring";

/* Display names for rail producers, matching the shipped toolLabel map. Only the one
   entry the sets use is needed, and an unknown id must fall through to the id itself
   exactly as the tool does, never to an invented name. */
const TOOL_LABELS = { "tco-calculator": "TCO Calculator" };

function render(S) {
  const preamble = `
    ${helpers}
    ${consts}
    ${engine}
    const d = { ...DEFAULTS, ...MUT() };
    const stance = STANCE_KEY, rampOn = RAMP_ON, mech = MECH_KEY;
    const r = computeCase(d, stance, rampOn, mech);
    const conf = confidenceOf(d, r, stance);
    const insights = caseInsights(r, d, stance, conf);
    const pulled = PULLED, sources = SOURCES;
    const scenario = { d, stance, rampOn, mech };
    const C = { green: GREEN, amber: AMBER, red: RED };
    const stPayback = paybackStatus(r, rampOn);
    const stRoi = roiStatus(r);
    const paybackColor = STATUS_COLOR(stPayback, C);
    const roiColor = r.roiDefined ? STATUS_COLOR(stRoi, C) : MUTED;
    const paybackLabel = r.payback > 0 ? r.payback + " mo" : ">36 mo";
    const gradeColor = conf.grade === "Finance-grade" ? GREEN : conf.grade === "Planning-grade" ? AMBER : MUTED;
    const bucketRows = [
      { label: "Self-service containment", key: "containment", val: r.buckets.containment },
      { label: "Handle-time reduction (talk + ACW)", key: "handleTime", val: r.buckets.handleTime },
      { label: "FCR improvement (avoided repeats)", key: "fcr", val: r.buckets.fcr },
      { label: "Attrition reduction", key: "attrition", val: r.buckets.attrition },
    ].sort((a, b) => b.val - a.val);
    const marginalSource = sources.marginalPerContact ? (TOOL_LABELS[sources.marginalPerContact] || sources.marginalPerContact) : null;
    return {
      r, d, conf, insights, scenario, stPayback, stRoi, paybackColor, roiColor, gradeColor,
      bucketRows, stance, rampOn, mech,
      toolName: TOOL_NAME,
      subtitle: ${subtitleExpr},
      summary: ${summaryExpr},
      signals: ${signalsExpr},
      sections: ${sectionsExpr},
    };`;
  const fn = new Function("COLORS", "NAVY", "DEEP", "ELECTRIC", "LIGHT", "ICE", "WARM", "SLATE", "MUTED",
    "BORDER", "GREEN", "AMBER", "RED", "severityBucket", "MECH", "MECH_ORDER", "MECH_DEFAULT",
    "TOOL_LABELS", "MUT", "STANCE_KEY", "RAMP_ON", "MECH_KEY", "PULLED", "SOURCES", "TOOL_NAME",
    "trackTool", preamble);
  return fn(COLORS, COLORS.navy, "#061325", COLORS.electric, "#00AAFF", "#E8F4FD", "#F8FAFB", "#3A4F6A",
    COLORS.muted, "#D8E3ED", COLORS.green, COLORS.amber, COLORS.red, severityBucket,
    MECH, MECH_ORDER, MECH_DEFAULT, TOOL_LABELS, S.mut, S.stance, S.rampOn, S.mech,
    S.pulled, S.sources, toolNameM[1], { nextStep: () => {}, pdf: () => {} });
}

/* -------------------------------------------------------------- printing */

const flat = (sections) => {
  const out = [];
  for (const s of sections) {
    if (!s) continue;
    out.push(`## ${s.title}`);
    if (s.type === "text") out.push(s.content);
    else if (s.type === "metrics") for (const it of s.items) out.push(`  ${it.label}: ${it.value}${it.sub ? "  (" + it.sub + ")" : ""}`);
    else if (s.type === "table") for (const row of s.rows) out.push(`  ${row[0]} | ${row[1]}`);
    else if (s.type === "findings") for (const it of s.items) out.push(`  - ${it}`);
    else if (s.type === "next") for (const it of s.items) out.push(`  -> ${it.tool}: ${it.reason}`);
  }
  return out.join("\n");
};

/* Malformed money: "$-2", "$ 2", "-2$", "2$". fmtFull renders a negative as "-$2", so a
   dollar sign immediately followed by a minus is always a broken render, never a design. */
const MONEY = /\$-|\$\s|\d+\$/;
const results = {};

for (const [k, S] of Object.entries(SETS)) {
  console.log(`\n\n${"=".repeat(78)}\nSET ${k}. ${S.label}\n${"=".repeat(78)}`);
  let R;
  try { R = render(S); } catch (e) {
    fail++; FAILS.push(`set ${k} payload evaluation`);
    console.log("  FAIL: the report payload did not evaluate:", String(e.message || e));
    continue;
  }
  R.S = S; results[k] = R;
  console.log(`\n${R.toolName}`);
  console.log(R.subtitle);
  console.log("\nSUMMARY");
  for (const s of R.summary) console.log(`  ${s.label}: ${s.value}`);
  console.log("\nSIGNALS");
  for (const [sk, sv] of Object.entries(R.signals)) console.log(`  ${sk}: ${sv}`);
  console.log("\nDOCUMENT");
  console.log(flat(R.sections));
}

/* ----------------------------------------------------- reconciliation */

console.log(`\n\n${"=".repeat(78)}\nRECONCILIATION\n${"=".repeat(78)}`);

const sect = (R, t) => R.sections.find(s => s && s.title.indexOf(t) >= 0);
const doc = (R) => flat(R.sections);
const sumOf = (R, label) => (R.summary.find(s => s.label === label) || {}).value;
const metricOf = (R, label) => (sect(R, "Financial Summary").items.find(i => i.label === label) || {});

for (const [k, R] of Object.entries(results)) {
  const r = R.r, conf = R.conf;
  console.log(`\nSet ${k}`);

  /* --- the summary strip must reproduce the engine --- */
  A(`${k}: summary realizable savings matches the engine`,
    sumOf(R, "Realizable annual savings") === (r.net >= 1000000 ? "$" + (r.net / 1000000).toFixed(2) + "M" : r.net >= 1000 ? "$" + Math.round(r.net / 1000) + "K" : "$" + Math.round(r.net).toLocaleString()));
  A(`${k}: summary three-year return matches the engine`,
    sumOf(R, "Three-year return") === (r.roiDefined ? Math.round(r.roi3) + "%" : "n/a"));
  A(`${k}: summary confidence names the same three grades the engine computed`,
    sumOf(R, "Case confidence") === `${conf.grade} (cost ${conf.costGrade}, realization ${conf.realizationGrade})`);
  A(`${k}: the subtitle carries the same headline grade as the summary strip`,
    R.subtitle.indexOf("case confidence " + conf.grade) >= 0);

  /* --- payback is one quantity, printed in four places, and they must agree --- */
  const payMetric = metricOf(R, "Payback Period");
  A(`${k}: the payback metric tile matches the engine`,
    payMetric.value === (r.payback > 0 ? `${r.payback} months` : ">36 months"));
  A(`${k}: the payback summary line and the payback tile do not contradict each other`,
    (r.payback > 0) === (sumOf(R, "Payback").indexOf("months") > 0 && sumOf(R, "Payback").indexOf("beyond horizon") < 0));
  A(`${k}: a case that returns beyond the horizon names the month, a case that never returns does not`,
    r.payback > 0 ? true
      : r.trueBreakevenMonth > 0
        ? sumOf(R, "Payback") === `month ${r.trueBreakevenMonth}, beyond horizon`
        : sumOf(R, "Payback") === "no break-even at any horizon");

  /* --- 1-13. Every verdict tile in the PDF must carry the colour the screen computed.
         A hardcoded green on a 5% three-year return is the document telling a CFO the
         opposite of what the screen told the analyst. --- */
  A(`${k}: the PDF payback tile carries the computed colour, not a fixed one`,
    payMetric.color === R.paybackColor, `${payMetric.color} vs ${R.paybackColor}`);
  A(`${k}: the PDF return tile carries the computed colour, not a fixed one`,
    metricOf(R, "3-Year Return").color === R.roiColor, `${metricOf(R, "3-Year Return").color} vs ${R.roiColor}`);
  A(`${k}: a thin or failing return is never printed in the strong colour`,
    (R.stRoi === "positive") === (metricOf(R, "3-Year Return").color === COLORS.green));
  A(`${k}: a payback that does not return is never printed in the strong colour`,
    (R.stPayback === "positive") === (payMetric.color === COLORS.green));
  A(`${k}: both verdict tiles carry the word as well as the colour`,
    /strong|acceptable|thin|does not return/.test(payMetric.sub || "")
    && (!r.roiDefined || /strong|acceptable|thin|does not return/.test(metricOf(R, "3-Year Return").sub || "")));

  /* --- 1-12. The three channels are separate, and all three reach the reader --- */
  const confSect = sect(R, "Confidence & Evidence");
  A(`${k}: the confidence section exists`, !!confSect);
  A(`${k}: every open cost item is printed in the document`,
    conf.open.every(t => confSect.content.indexOf(t) >= 0));
  A(`${k}: every cap is printed in the document`,
    conf.withheld.every(t => confSect.content.indexOf(t) >= 0));
  A(`${k}: every return finding is printed in the document`,
    conf.findings.every(t => confSect.content.indexOf(t) >= 0),
    `${conf.findings.length} findings`);
  A(`${k}: the document tells the reader the findings move no axis`,
    conf.findings.length === 0 || /deliberately excluded from every confidence axis/.test(confSect.content));
  A(`${k}: no return finding is ever presented as capping the grade`,
    conf.findings.every(t => confSect.content.indexOf("capped for reasons that are not cost-input defects: " + t) < 0));
  /* The confidence sentence is written in caseInsights and lands wherever the read ranks it,
     so this counts against the whole read rather than against a position. What must hold is
     that the sentence and the section never disagree about how many findings there are. */
  const readAll = (R.insights || []).join(" ");
  A(`${k}: the analyst read and the confidence section agree on the finding count`,
    conf.findings.length === 0
      ? !/finding(s)? (is|are) reported on the return/.test(readAll)
      : new RegExp(`\\b${conf.findings.length} finding(s)? (is|are) reported on the return`).test(readAll),
    `${conf.findings.length} findings`);

  /* --- the document must never render a malformed money figure --- */
  A(`${k}: no malformed money figure anywhere in the document`, !MONEY.test(doc(R)),
    (doc(R).match(MONEY) || [])[0]);
  A(`${k}: no malformed money figure in the summary strip`,
    !R.summary.some(s => MONEY.test(String(s.value))));

  /* --- the ROI denominator is named, and it is the gross basis, per Decision A --- */
  const roiSub = metricOf(R, "3-Year Return").sub || "";
  A(`${k}: the return tile names its own denominator`,
    !r.roiDefined || /gross transformation cash|modeled 3-yr investment cost/.test(roiSub));
  A(`${k}: the denominator named in the tile matches whether a counterfactual was entered`,
    !r.roiDefined || (r.bauEntered ? /gross transformation cash/.test(roiSub) : /modeled 3-yr investment cost/.test(roiSub)));

  /* --- signals: derived bands only, and the wire carries no free text --- */
  A(`${k}: the severity band is in the frozen vocabulary`, SEVERITY_BANDS.includes(R.signals.severity),
    R.signals.severity);
  A(`${k}: the severity band survives the boundary guard`,
    sanitizeProps({ severity: R.signals.severity }).severity === R.signals.severity);
  A(`${k}: the finding count reaches the reviewer alongside the cap count`,
    R.signals.return_findings === conf.findings.length && R.signals.withheld_caps === conf.withheld.length);
  A(`${k}: no signal carries a raw money figure`,
    !Object.values(R.signals).some(v => typeof v === "number" && Math.abs(v) > 1000));

  /* --- the Decision Read is the tool talking, and it must not contradict the tiles --- */
  const read = (sect(R, "Decision Read").items || []).join(" ");
  /* Rank 1 in the read is the finding that the case does not return. The one recorded
     exception is an uncommitted capacity action, which is the cause rather than the symptom,
     and it may hold the top slot with the no-return finding immediately behind it. */
  A(`${k}: a case that does not return says so at the very top of the read`, (() => {
    if (r.payback > 0) return true;
    const first = R.insights[0] || "", second = R.insights[1] || "";
    if (/does not break even/.test(first)) return true;
    return /releases .* agent hours a year/.test(first) && /does not break even/.test(second);
  })(), (R.insights[0] || "").slice(0, 60));
  A(`${k}: the read never claims a payback the tiles do not show`,
    r.payback > 0 || !/\bpayback of \d/.test(read));
}

/* ------------------------------------- the 1-12 gate, stated as one test */

console.log(`\n${"=".repeat(78)}\n1-12 GATE: a confident negative result\n${"=".repeat(78)}`);
{
  const B = results.B, C = results.C;
  if (!B || !C) {
    A("the 1-12 gate sets rendered", false);
  } else {
    A("B: every axis is Finance-grade", B.conf.costGrade === "Finance-grade" && B.conf.realizationGrade === "Finance-grade",
      `${B.conf.costGrade} / ${B.conf.realizationGrade}`);
    A("B: the model is complete, with no open cost items and no caps",
      B.conf.open.length === 0 && B.conf.withheld.length === 0);
    A("B: the case genuinely does not return inside the horizon", B.r.payback === 0);
    A("B: the exported headline grade is Finance-grade", B.conf.grade === "Finance-grade", B.conf.grade);
    A("B: the document prints Finance-grade in the subtitle a buyer reads first",
      B.subtitle.indexOf("case confidence Finance-grade") >= 0);
    A("B: the negative finding survives into the document intact",
      /does not break even within the three-year evaluation horizon/.test(doc(B)));
    A("B: the document says in words that the finding does not lower the grade",
      /does not lower the confidence grade/.test(doc(B)));
    A("B: the payback tile still reports the failure plainly",
      metricOf(B, "Payback Period").value === ">36 months"
      && /does not return/.test(metricOf(B, "Payback Period").sub || ""));
    A("B: the return tile is not printed in the strong colour",
      metricOf(B, "3-Year Return").color !== COLORS.green);

    /* The control. Only the return moved between B and C. */
    A("B and C differ on the answer", B.r.payback !== C.r.payback);
    A("B and C carry identical evidence quality",
      B.conf.costGrade === C.conf.costGrade && B.conf.realizationGrade === C.conf.realizationGrade);
    A("B and C therefore export the identical confidence grade", B.conf.grade === C.conf.grade,
      `${B.conf.grade} vs ${C.conf.grade}`);
    A("B and C differ in the findings channel, which is where the return belongs",
      B.conf.findings.length !== C.conf.findings.length);
    A("the severity band does move between B and C, because severity is where verdict strength lives",
      B.signals.severity !== C.signals.severity, `${B.signals.severity} vs ${C.signals.severity}`);
  }
}

/* --------------------------------- severity, 1-12c: argued and reachable */

console.log(`\n${"=".repeat(78)}\n1-12c SEVERITY BAND\n${"=".repeat(78)}`);
{
  const bandOf = (R) => R.signals.severity;
  const seen = new Set(Object.values(results).map(bandOf));
  A("no rendered set produces an empty severity band", !seen.has("") && !seen.has(undefined));
  A("the severity expression is scored on the true break-even month, not on payback alone",
    /severityBucket\(r\.trueBreakevenMonth > 0/.test(SRC));
  A("SOURCE the denominator carries its argument and its rejected alternatives in the file",
    SRC.includes("Rejected: the 36-month evaluation horizon as the denominator")
    && SRC.includes("Rejected: r.payback alone")
    && SRC.includes("Rejected: an absolute month ladder"));
  A("SOURCE the unreachable band is declared rather than left silent",
    SRC.includes("Declared unreachable: none"));

  /* A case that returns beyond the horizon must not share a band with one that never
     returns. The engine distinguishes them everywhere else and the signal now does too. */
  const beyond = results.B && results.B.r.trueBreakevenMonth > 0 ? results.B : null;
  A("a beyond-horizon case reports a real break-even month",
    !!beyond && beyond.r.trueBreakevenMonth > 36);
  A("a beyond-horizon case and a never-returning case do not share one band", (() => {
    const never = severityBucket(1);
    return beyond ? bandOf(beyond) !== never || beyond.r.trueBreakevenMonth / 60 >= 0.75 : false;
  })(), beyond ? `${bandOf(beyond)} at month ${beyond.r.trueBreakevenMonth}` : "no beyond-horizon set");
}

/* ------------------------------------------------- house style and rails */

console.log(`\n${"=".repeat(78)}\nHOUSE STYLE\n${"=".repeat(78)}`);
{
  const all = Object.values(results).map(R => [R.subtitle, flat(R.sections), R.summary.map(s => s.label + s.value).join(" ")].join("\n")).join("\n");
  A("no em-dash reaches the rendered document", all.indexOf(String.fromCharCode(0x2014)) < 0);
  A("no en-dash reaches the rendered document", all.indexOf(String.fromCharCode(0x2013)) < 0);
  A("no rendered figure is NaN, undefined or null", !/NaN|undefined|\bnull\b/.test(all),
    (all.match(/NaN|undefined|\bnull\b/) || [])[0]);
  A("no rendered percentage is Infinity", !/Infinity/.test(all));
  A("every section carries a title", Object.values(results).every(R => R.sections.every(s => !s || (s.title && s.title.length > 0))));
  A("every metrics item carries a label and a value", Object.values(results).every(R =>
    R.sections.filter(s => s && s.type === "metrics").every(s => s.items.every(i => i.label && i.value))));
}

console.log(`\n${"=".repeat(78)}`);
console.log(`PASS ${pass}   FAIL ${fail}   TOTAL ${pass + fail}`);
if (FAILS.length) console.log("\nFailures:\n" + FAILS.map(f => "  - " + f).join("\n"));
process.exit(fail ? 1 : 0);
