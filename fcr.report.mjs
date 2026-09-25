/* fcr.report.mjs
 *
 * Rendered-output reconciliation for the FCR Leakage Diagnostic.
 *
 * The engine harness proves the arithmetic. It says nothing about the document a
 * buyer actually reads, because every figure in the PDF is a separate expression
 * written in JSX, and a passing engine can sit underneath a report that quotes a
 * different number, contradicts itself in prose, or drops a section entirely.
 * That gate found four defects in Business Case Builder while 478 assertions were
 * green, and a $100,000 self-contradiction in TCO while 112 were green.
 *
 * This file does NOT rebuild the report. It slices the ReportActions payload out
 * of the shipped JSX at runtime, binds it to the real engine output and the real
 * helper functions sliced from the same file, evaluates it, and prints the
 * document. Every figure printed below is the figure the PDF prints. If the JSX
 * payload changes shape, this fails rather than reconciling a stale copy.
 *
 * Run from repo root: node fcr.report.mjs
 */
import { readFileSync } from "fs";

const SRC = readFileSync("./FCRLeakageDiagnostic.jsx", "utf8");
const RA = readFileSync("./ReportActions.jsx", "utf8");
const { MECH, MECH_ORDER, MECH_INITIAL } = await import("./src/lib/mech.js");
/* The real enum guard. The engine region now resolves the mechanism and the scope
   through pick, so the rendered document cannot be reconciled without it. */
const { createGuards } = await import("./src/lib/guards.js");
/* The real boundary guard and the real bucket, never reconstructed. The tool
   publishes signals.severity through severityBucket, and sanitizeProps is what
   decides whether that value reaches the wire or is silently dropped. */
const { severityBucket, sanitizeProps, SEVERITY_BANDS } = await import("./src/lib/track.js");
/* 11B, session 18. The real registry, confidence module and journey graph. The page
   grades through gradeFCR and names its next steps from nextFor, so the document
   cannot be reconciled against reconstructed copies of either. */
const BENCHMOD = await import("./src/lib/benchmarks.js");
const CONF = await import("./src/lib/confidence.js");
const { nextFor } = await import("./src/lib/journey.js");

let pass = 0, fail = 0;
const A = (nm, c) => { if (c) pass++; else { fail++; console.log("  FAIL:", nm); } };

/* ---------------------------------------------------------------- slicing */

function skipQuoted(src, i) {
  const q = src[i];
  for (let j = i + 1; j < src.length; j++) {
    if (src[j] === "\\") { j++; continue; }
    if (src[j] === q) return j + 1;
    if (src[j] === "\n" && q !== "`") return -1;
  }
  return -1;
}
function skipTemplate(src, i) {
  for (let j = i + 1; j < src.length; j++) {
    if (src[j] === "\\") { j++; continue; }
    if (src[j] === "`") return j + 1;
    if (src[j] === "$" && src[j + 1] === "{") {
      const e = skipBraces(src, j + 1);
      if (e < 0) return -1;
      j = e - 1;
    }
  }
  return -1;
}
function skipBraces(src, i) {
  let d = 0, j = i;
  while (j < src.length) {
    const c = src[j];
    if (c === "/" && src[j + 1] === "/") { const e = src.indexOf("\n", j); if (e < 0) return -1; j = e; continue; }
    if (c === "/" && src[j + 1] === "*") { const e = src.indexOf("*/", j + 2); if (e < 0) return -1; j = e + 2; continue; }
    if (c === '"' || c === "'") { const e = skipQuoted(src, j); if (e < 0) return -1; j = e; continue; }
    if (c === "`") { const e = skipTemplate(src, j); if (e < 0) return -1; j = e; continue; }
    if (c === "{") { d++; j++; continue; }
    if (c === "}") { d--; j++; if (d === 0) return j; continue; }
    j++;
  }
  return -1;
}

/** Slice a brace/bracket-balanced expression starting at the first `open` after `from`. */
function balanced(src, from, open, close) {
  const start = src.indexOf(open, from);
  if (start < 0) return null;
  let d = 0, i = start;
  while (i < src.length) {
    const c = src[i];
    if (c === "/" && src[i + 1] === "/") { const e = src.indexOf("\n", i); if (e < 0) return null; i = e; continue; }
    if (c === "/" && src[i + 1] === "*") { const e = src.indexOf("*/", i + 2); if (e < 0) return null; i = e + 2; continue; }
    if (c === '"' || c === "'") { const e = skipQuoted(src, i); if (e < 0) return null; i = e; continue; }
    if (c === "`") { const e = skipTemplate(src, i); if (e < 0) return null; i = e; continue; }
    if (c === open) { d++; i++; continue; }
    if (c === close) { d--; i++; if (d === 0) return { start, end: i, text: src.slice(start, i) }; continue; }
    i++;
  }
  return null;
}

/* The lexer is pinned directly. Without these fixtures a lexer regression survives
   whenever the shipped JSX happens to contain no comment, quote or substitution
   inside a sliced region, which is luck rather than proof. */
console.log("\n0a. the slicer lexer");
{
  const t = (src, o = "{", c = "}") => { const b = balanced(src, 0, o, c); return b ? b.text : null; };
  A("lexer: a brace inside a line comment does not close the slice", t("x { a // }\n b } y") === "{ a // }\n b }");
  A("lexer: a brace inside a block comment does not close the slice", t("{ /* } */ b }") === "{ /* } */ b }");
  A("lexer: an apostrophe inside a comment does not open a string", t("{ // vendor's\n b } '}'") === "{ // vendor's\n b }");
  A("lexer: a brace inside a quoted string does not close the slice", t("{ a: \"}\" }") === "{ a: \"}\" }");
  A("lexer: an escaped quote does not end the string", t("{ a: \"q\\\"}\" }") === "{ a: \"q\\\"}\" }");
  A("lexer: a brace inside a template substitution is counted inside the template", t("{ `${ {k:1}.k }` }") === "{ `${ {k:1}.k }` }");
  A("lexer: a quoted brace inside a template substitution is skipped", t("{ `${ \"}\" }` }") === "{ `${ \"}\" }` }");
  A("lexer: a nested template inside a substitution does not end the outer template", t("{ `a ${ x ? `}` : 1 } b` }") === "{ `a ${ x ? `}` : 1 } b` }");
  A("lexer: a quoted backtick inside a substitution does not open a template", t("{ `${ \"`\" }` }") === "{ `${ \"`\" }` }");
  A("lexer: brackets balance with a quoted close inside", t("[ [1], \"]\" ] ]", "[", "]") === "[ [1], \"]\" ]");
  A("lexer: an unterminated slice returns null", t("{ a { b }") === null);
  A("lexer: a missing open returns null", t("no braces") === null);
  const off = balanced("ab{c}d", 0, "{", "}");
  A("lexer: start and end offsets bound the text exactly", !!off && off.start === 2 && off.end === 5 && off.text === "{c}");
}


/** Slice a named JSX prop expression: `name={ ... }` or `name={[ ... ]}`. */
function prop(name) {
  const at = SRC.indexOf(name + "={");
  if (at < 0) return null;
  const b = balanced(SRC, at + name.length, "{", "}");
  return b ? b.text.slice(1, -1) : null;
}

/** Slice a top-level `const NAME = <literal>;` by balanced bracket. */
function constLiteral(name, open, close) {
  const at = SRC.indexOf("const " + name + " =");
  if (at < 0) return null;
  const b = balanced(SRC, at, open, close);
  return b ? b.text : null;
}

/** Slice a single-line `const name = ...;` declaration verbatim. */
function constLine(name) {
  const m = SRC.match(new RegExp("^\\s*const " + name + " = .*$", "m"));
  return m ? m[0].trim() : null;
}

/* the engine, from the marked region */
const ea = SRC.indexOf("/* @engine-start"), eb = SRC.indexOf("/* @engine-end */");
if (ea < 0 || eb < 0) { console.error("BLOCKER: engine markers not found."); process.exit(1); }
const engineRegion = SRC.slice(ea, eb);

/* the formatters and the dimension model, from the same file */
/* num was the local reader of a local NumField copy; both are gone, the tool uses the shared input. */
const fmtRegion = [constLine("money"), constLine("money2"), constLine("fmtX")].join("\n");
const dimsRegion = "const DIMS = " + constLiteral("DIMS", "[", "]").replace(/^const DIMS = /, "") + ";";

/* the component-scope derivations the payload closes over */
const compRegion = [
  constLine("N"), constLine("dimScore"), constLine("dimComplete"), constLine("allComplete"), constLine("defDeclared"), constLine("confColor"),
  constLine("scopeLabel"), constLine("methodLabel"), constLine("aggMult"),
].join("\n");

const ENGINE_INPUT = constLine("engineInput");
const GRADE_LINE = constLine("G");
const BLOCKED_LINE = constLine("blocked");
A("the shipped grade line slices out of the JSX and grades through gradeFCR",
  !!GRADE_LINE && /^const G = gradeFCR\(\{ I: engineInput, r: R, pre: fromLink \? \{\} : rail\.current\.pre, railOrigin: null \}\);$/.test(GRADE_LINE));
A("the shipped blocked line reads the hard flag and the void", BLOCKED_LINE === "const blocked = R.hardFlag || G.voided;");
A("the shipped engineInput carries the diagnostic completeness", /diagComplete: allComplete/.test(ENGINE_INPUT));
A("the shipped engineInput slices out of the JSX and reads sanitized numerics", !!ENGINE_INPUT && /N\.M\b/.test(ENGINE_INPUT) && /numericCorrections: N\.numericCorrections/.test(ENGINE_INPUT));
const summaryExpr = prop("summary");
const signalsExpr = prop("signals");
const sectionsExpr = prop("sections");
/* P2 task 8: the report adds one next step from the journey graph (withNextStep), as ReportActions does. */
const nextExpr = prop("next") || "null";
globalThis.__withNextStep = (await import("./src/lib/journey.js")).withNextStep;
const subtitleAt = SRC.indexOf("subtitle={");
const subtitleExpr = balanced(SRC, subtitleAt + 9, "{", "}").text.slice(1, -1);

A("the ReportActions summary payload slices out of the shipped JSX", !!summaryExpr);
A("the ReportActions signals payload slices out of the shipped JSX", !!signalsExpr);
A("the ReportActions sections payload slices out of the shipped JSX", !!sectionsExpr);
A("the ReportActions subtitle slices out of the shipped JSX", !!subtitleExpr);
A("the formatters slice out of the shipped JSX", fmtRegion.split("\n").every(Boolean));
A("the dimension model slices out of the shipped JSX", dimsRegion.length > 500);

/* ------------------------------------------------------- the input set(s) */
/*
 * Input set A is the shipped default with a completed diagnostic, scored so the
 * six dimensions are NOT uniform. A uniform score would let a bug that reads the
 * wrong dimension pass unnoticed.
 * Input set B is an outsourced per-contact centre with finance-confirmed cost and
 * a measured repeat rate, which exercises the branches set A never touches.
 */
const SETS = {
  A: {
    label: "In-house, estimate cost basis, avoid-hiring mechanism, modeled repeats",
    M: 50000, fcrPct: 72, mCPC: 6.5, lCPC: 11,
    scope: "cc", method: "survey", windowDays: 7,
    repeatModel: "one", measuredPct: 22, measuredTargetPct: 0, pathModel: "one",
    repeatMult: 1.4, targetPct: 78, sourcing: "inhouse", mech: "hiring",
    investOneTime: 150000, investRecurring: 90000, costBasis: "estimate",
    fcrPulledDirty: false, fromLink: false,
    scoresBy: { policy: 2, handoff: 3, channel: 4, knowledge: 2, skill: 5, workflow: 3 },
  },
  B: {
    label: "Outsourced per-contact, finance-confirmed cost, measured repeat rate",
    M: 120000, fcrPct: 65, mCPC: 4.2, lCPC: 9.5,
    scope: "enterprise", method: "internal", windowDays: 30,
    repeatModel: "measured", measuredPct: 31, measuredTargetPct: 0, pathModel: "proportional",
    repeatMult: 1.8, targetPct: 74, sourcing: "bpo", mech: "growth",
    investOneTime: 420000, investRecurring: 60000, costBasis: "finance",
    fcrPulledDirty: false, fromLink: false,
    scoresBy: { policy: 4, handoff: 2, channel: 3, knowledge: 5, skill: 4, workflow: 1 },
  },
};

function render(S) {
  /* Build the scores map exactly as the wizard does: four questions per dimension. */
  const scores = {};
  for (const [id, v] of Object.entries(S.scoresBy)) for (let i = 0; i < 4; i++) scores[`${id}-${i}`] = v;

  const preamble = `
    ${fmtRegion}
    ${dimsRegion}
    ${engineRegion}
    const scores = SCORES;
    ${compRegion}
    const dScoreRaw = DIMS.reduce((a, d) => a + dimScore(d.id), 0) / DIMS.length;
    /* The shipped engineInput line, sliced rather than retyped. A retyped copy here
       would have kept reading raw state after the tool moved to sanitized numerics. */
    const dScore = dScoreRaw;
    ${ENGINE_INPUT}
    const R0 = engine(engineInput);
    const R = R0;
    ${GRADE_LINE}
    ${BLOCKED_LINE}
    const sorted = [...DIMS].sort((a, b) => dimScore(a.id) - dimScore(b.id));
    const top = sorted[0];
    return {
      R: { ...R0, ...G, headlineConf: G.confidence }, G, dScore: dScoreRaw, sorted, top,
      subtitle: (${subtitleExpr}),
      summary: (${summaryExpr}),
      signals: (${signalsExpr}),
      sections: (globalThis.__withNextStep("fcr-leakage", ${sectionsExpr}, ${nextExpr})),
    };
  `;

  const argNames = ["benchmark", "emitGrades", "voidResult", "railEvidence", "weakerStream", "realizationFromCred", "nextFor", "MECH_INITIAL", "rail",
    "MECH", "MECH_ORDER", "createGuards", "severityBucket", "SCORES", "COLORS", "M", "fcrPct", "mCPC", "lCPC", "scope", "method",
    "windowDays", "repeatModel", "measuredPct", "measuredTargetPct", "pathModel", "repeatMult", "targetPct",
    "sourcing", "mech", "investOneTime", "investRecurring", "costBasis", "fcrPulledDirty", "fromLink"];
  const C = { GREEN: "g", AMBER: "a", RED: "r", ELECTRIC: "e", NAVY: "n", MUTED: "m", SLATE: "s" };
  const body = "const { GREEN, AMBER, RED, ELECTRIC, NAVY, MUTED, SLATE } = COLORS;" + preamble;
  const fn = new Function(...argNames, body);
  return fn(BENCHMOD.benchmark, CONF.emitGrades, CONF.voidResult, CONF.railEvidence, CONF.weakerStream, CONF.realizationFromCred, nextFor, MECH_INITIAL, { current: { pre: S.pre || {} } },
    MECH, MECH_ORDER, createGuards, severityBucket, scores, C, S.M, S.fcrPct, S.mCPC, S.lCPC, S.scope, S.method, S.windowDays,
    S.repeatModel, S.measuredPct, S.measuredTargetPct, S.pathModel, S.repeatMult, S.targetPct, S.sourcing,
    S.mech, S.investOneTime, S.investRecurring, S.costBasis, S.fcrPulledDirty, S.fromLink);
}

/* ------------------------------------------------------------- reconcile */

const dollars = (s) => {
  const out = [];
  const re = /-?\$[\d,]+(?:\.\d+)?/g;
  let m; while ((m = re.exec(String(s)))) out.push(m[0]);
  return out;
};
const toNum = (d) => Number(String(d).replace(/[$,]/g, ""));

function findValue(rep, label, where) {
  if (where !== "table") {
    const it = rep.summary.find((i) => i.label === label);
    if (it) return it.value;
  }
  for (const s of rep.sections) {
    if (s.type === "metrics") { const it = s.items.find((i) => i.label === label); if (it) return it.value; }
  }
  return null;
}

function auditSet(key) {
  const S = SETS[key];
  const rep = render(S);
  const R = rep.R;
  console.log("\n" + "=".repeat(78));
  console.log("INPUT SET " + key + "  " + S.label);
  console.log("=".repeat(78));
  console.log("  volume " + S.M.toLocaleString() + "/mo, FCR " + S.fcrPct + "% to " + S.targetPct + "%, marginal $" + S.mCPC +
    ", multiplier " + S.repeatMult + "x, diagnostic " + rep.dScore.toFixed(2) + "/5");
  console.log("  scope " + S.scope + ", method " + S.method + ", sourcing " + S.sourcing + ", mechanism " + S.mech + ", cost basis " + S.costBasis);

  console.log("\n  SUBTITLE  " + rep.subtitle);

  console.log("\n  SUMMARY STRIP (what a reader sees first)");
  for (const it of rep.summary) console.log("    " + it.label.padEnd(34) + it.value);

  for (const s of rep.sections) {
    console.log("\n  [" + s.title.toUpperCase() + "]");
    if (s.type === "text") console.log(wrap(s.content, 74, "    "));
    else if (s.type === "findings") for (const i of s.items) console.log(wrap("- " + i, 74, "    "));
    else if (s.type === "metrics") for (const i of s.items) console.log("    " + i.label.padEnd(48) + String(i.value).padStart(22) + (i.sub ? "   (" + i.sub + ")" : ""));
    else if (s.type === "table") for (const r of s.rows) console.log("    " + r[0].padEnd(34) + r[1]);
    else if (s.type === "next") for (const i of s.items) console.log("    -> " + i.tool + ": " + i.reason);
  }

  console.log("\n  SIGNALS");
  for (const [k, v] of Object.entries(rep.signals)) console.log("    " + k.padEnd(28) + v);

  /* ---- the gate: every dollar figure the report prints must equal the engine ---- */
  const P = (k) => `[${key}] `;
  const eq = (label, printed, expected) => {
    const p = toNum(printed);
    A(P() + label + " reconciles (" + printed + " vs " + Math.round(expected).toLocaleString() + ")", Math.abs(p - Math.round(expected)) <= 1);
  };

  eq("summary repeat burden", findValue(rep, "Repeat burden annual"), R.burdenYr);
  eq("summary controllable burden", findValue(rep, "Controllable burden annual"), R.controllableBurdenYr);
  eq("summary realizable", findValue(rep, "Realizable annual"), R.realizableYr);
  eq("summary year-1 net", findValue(rep, "Year-1 net"), R.year1Net);
  eq("summary year-2 net", findValue(rep, "Year-2 net standalone"), R.year2Net);
  eq("summary two-year cumulative", findValue(rep, "Two-year cumulative net"), R.cum2Yr);

  eq("economics annual burden", findValue(rep, "Annual repeat burden (marginal)"), R.burdenYr);
  eq("economics controllable", findValue(rep, "Controllable leakage burden (not yet savings)"), R.controllableBurdenYr);
  eq("economics non-controllable", findValue(rep, "Non-controllable (excluded)"), R.nonControllableBurdenYr);
  eq("cash gross", findValue(rep, S.sourcing === "bpo" ? "Gross volume reduction value" : "Gross capacity value"), R.grossYr);
  eq("cash realizable", findValue(rep, "Realizable via " + (S.sourcing === "bpo" ? "billing reduction" : "mechanism")), R.realizableYr);
  eq("cash one-time cost", findValue(rep, "One-time cost"), S.investOneTime);
  eq("cash recurring cost", findValue(rep, "Recurring annual cost"), S.investRecurring);
  eq("cash year-1 net", findValue(rep, "Year-1 net (after one-time cost)"), R.year1Net);
  eq("cash year-2 net", findValue(rep, "Year-2 net (standalone)"), R.year2Net);
  eq("cash two-year cumulative", findValue(rep, "Two-year cumulative net"), R.cum2Yr);

  /* the split must close in the printed figures, not only in the engine */
  const ctrl = toNum(findValue(rep, "Controllable leakage burden (not yet savings)"));
  const nonc = toNum(findValue(rep, "Non-controllable (excluded)"));
  const burd = toNum(findValue(rep, "Annual repeat burden (marginal)"));
  A(P() + "printed controllable plus non-controllable equals printed burden", Math.abs(ctrl + nonc - burd) <= 1);

  const y1 = toNum(findValue(rep, "Year-1 net (after one-time cost)"));
  const y2 = toNum(findValue(rep, "Year-2 net (standalone)"));
  const c2 = toNum(findValue(rep, "Two-year cumulative net"));
  A(P() + "printed year 1 plus printed year 2 equals printed two-year cumulative", Math.abs(y1 + y2 - c2) <= 1);

  const gross = toNum(findValue(rep, S.sourcing === "bpo" ? "Gross volume reduction value" : "Gross capacity value"));
  const realz = toNum(findValue(rep, "Realizable via " + (S.sourcing === "bpo" ? "billing reduction" : "mechanism")));
  A(P() + "printed realizable never exceeds printed gross", realz <= gross + 1);
  A(P() + "printed realizable never exceeds printed controllable burden", realz <= ctrl + 1);

  /* every dollar in the prose summary must appear in the metric tables */
  const textSec = rep.sections.find((s) => s.type === "text");
  const inTables = new Set();
  for (const s of rep.sections) if (s.type === "metrics") for (const i of s.items) for (const d of dollars(i.value)) inTables.add(toNum(d));
  for (const i of rep.summary) for (const d of dollars(i.value)) inTables.add(toNum(d));
  const orphans = dollars(textSec.content).map(toNum).filter((v) => !inTables.has(v));
  A(P() + "every dollar figure in the result summary also appears in a table" + (orphans.length ? " (orphans " + orphans.join(", ") + ")" : ""), orphans.length === 0);

  /* the subtitle must not contradict the body */
  const subD = dollars(rep.subtitle).map(toNum);
  A(P() + "every dollar figure in the subtitle appears in the body", subD.every((v) => inTables.has(v)));

  /* confidence must be stated consistently in three places */
  A(P() + "subtitle confidence matches the engine headline", rep.subtitle.indexOf(R.headlineConf) >= 0);
  const confSec = rep.sections.find((s) => s.title === "Confidence and Risk Flags");
  A(P() + "confidence section states the headline grade", confSec.items[0].indexOf(R.headlineConf) >= 0);
  A(P() + "confidence section states the rationale the page prints", confSec.items[0] === "Headline " + R.confidence + ". " + R.gradeWhy);
  /* 11B. The document prints the three graded axes as rows, read from gradeFCR. */
  A(P() + "the evidence row prints the graded evidence axis", confSec.items[1] === "Evidence axis: " + (R.voided ? "Void" : R.evidence) + ".");
  A(P() + "the realization row prints the graded realization axis",
    confSec.items[2] === "Realization axis: " + (R.voided ? "Void" : R.realization) + " (" + (R.mechApplies ? MECH[R.mechKey].label : "per-contact billing") + ").");
  A(P() + "the completeness row prints the graded completeness axis",
    confSec.items[3].indexOf("Completeness axis: " + (R.voided ? "Void" : R.completeness)) === 0 && (R.blockers.length ? confSec.items[3].indexOf(R.blockers.length + " check") > 0 : /model is whole/.test(confSec.items[3])));
  A(P() + "the document states the grade is self-declared", /self-declared/.test(confSec.items[4]));
  A(P() + "the PDF grade object is the gradeFCR object", !!R.gradeObj && R.gradeObj.headline === (R.voided ? null : R.confidence));
  A(P() + "the headline is the minimum of the applicable axes",
    R.voided || R.confidence === CONF.gradeConfidence({ evidence: R.evidence, realization: R.realization, completeness: R.completeness }).headline);
  A(P() + "no document reaches Finance-grade", R.confidence !== "Finance-grade");
  const nx = rep.sections.find((s) => s.title === "Next Step");
  const one = nextFor("fcr-leakage")[0];
  A(P() + "the Next Step is the journey graph's first edge, one step", !!nx && nx.items.length === 1 && JSON.stringify(nx.items[0]) === JSON.stringify({ tool: one.name, href: one.href, reason: one.why }));
  A(P() + "confidence section carries every engine flag", R.flags.every((f) => confSec.items.indexOf(f) >= 0));
  A(P() + "signals report the APPLIED target, not the ask (" + rep.signals.target_fcr + " vs applied " + (R.target * 100).toFixed(1) + "%)",
    Math.abs(Number(String(rep.signals.target_fcr).replace("%", "")) - R.target * 100) < 0.06);
  A(P() + "signals block agrees with the grade on all three axes",
    rep.signals.evidence_confidence === (R.voided ? "void" : R.evidence) && rep.signals.realization_confidence === (R.voided ? "void" : R.realization) && rep.signals.completeness_confidence === (R.voided ? "void" : R.completeness));

  /* payback must say the same thing everywhere it is stated */
  // Payback is stated in three places with two different label styles. They are
  // allowed to be worded differently. They are not allowed to disagree.
  const pbSummary = String(findValue(rep, "Payback"));
  const pbTable = String(findValue(rep, "Payback", "table"));
  A(P() + "payback in the summary strip matches the engine label", pbSummary === R.paybackLabel);
  const same = (a, b) => {
    const norm = (x) => R.neverPaysBack ? (/never/.test(x) ? "never" : x)
      : R.payback ? (x.replace("month ", "m").replace("mo+", "") === "m" + R.payback ? "m" + R.payback : x)
      : (/48/.test(x) ? "48+" : x);
    return norm(a) === norm(b);
  };
  A(P() + "the summary strip and the table say the same thing about payback (" + pbSummary + " / " + pbTable + ")", same(pbSummary, pbTable));
  A(P() + "payback in the prose matches the payback in the table",
    (R.neverPaysBack && /never/.test(textSec.content)) || (!R.neverPaysBack && (textSec.content.indexOf("month " + R.payback) >= 0 || textSec.content.indexOf("beyond " + BENCHMOD.benchmark("fcr.guard.horizon") + " months") >= 0)));

  /* the mechanism must not be named when it does not apply */
  if (S.sourcing === "bpo") {
    const all = JSON.stringify(rep.sections) + rep.subtitle;
    A(P() + "an outsourced case does not credit a capacity mechanism", rep.signals.capacity_action === "not applicable (bpo)");
    A(P() + "an outsourced case states that no mechanism was used", all.indexOf("none was used") >= 0);
    A(P() + "an outsourced case is not presented as Finance-grade realization", R.realization === "Planning-grade");
  } else {
    A(P() + "an in-house case names the capacity mechanism it applied", rep.signals.capacity_action === MECH[R.mechKey].label);
    A(P() + "an in-house case names the credit class", rep.signals.credit_class === MECH[R.mechKey].cred);
  }

  /* the dimension table must carry all six, and the ranking must agree with it */
  const dimTable = rep.sections.find((s) => s.type === "table");
  A(P() + "the dimension table carries all six dimensions", dimTable.rows.length === 6);
  const worst = rep.sorted[0];
  const topSec = rep.sections.find((s) => s.title === "Top Leakage Sources");
  A(P() + "the top leakage source is the lowest-scoring dimension", topSec.items[0].indexOf(worst.name) >= 0);
  const testSec = rep.sections.find((s) => s.title === "30-Day Operating Test");
  A(P() + "the operating test targets the same dimension the ranking names", testSec.items[0].indexOf(worst.name) >= 0);
  A(P() + "the operating test carries a stop condition", testSec.items.some((i) => /Stop condition/.test(i)));

  /* the report must never present capacity as cash */
  const joined = JSON.stringify(rep.sections);
  A(P() + "the report states controllable burden is not yet savings", joined.indexOf("not yet savings") >= 0);
  A(P() + "the report states savings are valued at marginal cost", joined.indexOf("never loaded") >= 0);

  return rep;
}

function wrap(s, w, pad) {
  const words = String(s).split(/\s+/); const lines = []; let cur = pad;
  for (const word of words) {
    if ((cur + " " + word).length > w + pad.length && cur.trim()) { lines.push(cur); cur = pad + word; }
    else cur = cur.trim() ? cur + " " + word : pad + word;
  }
  if (cur.trim()) lines.push(cur);
  return lines.join("\n");
}

const repA = auditSet("A");
const repB = auditSet("B");

/* ---- cross-set: the two reports must not be accidentally identical ---- */
A("the two input sets produce materially different reports",
  Math.abs(repA.R.burdenYr - repB.R.burdenYr) > 1000 && repA.R.headlineConf !== repB.R.headlineConf);

/* ---- severity band ---- */
/* rail-audit counts publishers with a regex, which proves the key was typed and
   nothing else. Severity here is the share of the achievable resolution
   frontier the centre is not getting, so the band must move with FCR, survive
   the boundary validator, and reach the manual review payload. Scope cc pins
   the denominator at the engine practical maximum of 0.90. */
console.log("\nseverity band");
const sevDoc = (fcrPct) => render({ ...SETS.A, label: "FCR " + fcrPct + "%", fcrPct, targetPct: Math.max(fcrPct + 1, 78) });
const SEV = { none: sevDoc(90), benign: sevDoc(82), mid: sevDoc(60), bad: sevDoc(45), severe: sevDoc(15) };
A("a centre already at the practical ceiling publishes none", SEV.none.signals.severity === "none");
A("82% FCR against a 0.90 ceiling publishes low", SEV.benign.signals.severity === "low");
A("60% FCR against a 0.90 ceiling publishes moderate", SEV.mid.signals.severity === "moderate");
A("45% FCR against a 0.90 ceiling publishes high", SEV.bad.signals.severity === "high");
A("15% FCR against a 0.90 ceiling publishes severe", SEV.severe.signals.severity === "severe");
A("the band discriminates: five scenarios produce five distinct bands",
  new Set(Object.values(SEV).map(x => x.signals.severity)).size === 5);

/* The denominator is the engine practical maximum, not the diagnostic-adjusted
   ceiling. A centre that scores badly on the diagnostic has a lower ceilingFCR
   and therefore a smaller gap against it, which would report a weaker band for
   being less able to fix the problem. This asserts the published band is read
   against the frontier and not against that moving ceiling. */
const weakDiag = render({ ...SETS.A, label: "45% FCR, weak diagnostic", fcrPct: 45, targetPct: 78,
  scoresBy: { policy: 1, handoff: 1, channel: 1, knowledge: 1, skill: 1, workflow: 1 } });
A("a weak diagnostic lowers the achievable ceiling", weakDiag.R.ceilingFCR < SEV.bad.R.ceilingFCR);
A("a weak diagnostic does not soften the published band", weakDiag.signals.severity === SEV.bad.signals.severity);

for (const [k, doc] of Object.entries({ A: repA, B: repB, ...SEV })) {
  const v = doc.signals.severity;
  if (v === undefined) { A(k + ": severity is omitted only where the result is blocked", doc.R.hardFlag || doc.R.voided || doc.R.fcrImpossible); continue; }
  A(k + ": the published band is in the canonical vocabulary", SEVERITY_BANDS.includes(v));
  A(k + ": the published band survives sanitizeProps and lands on the payload", sanitizeProps({ severity: v }).severity === v);
  A(k + ": severity reaches the manual review submission as signal_severity",
    Object.keys(doc.signals).map(x => "signal_" + x).includes("signal_severity"));
}

/* An impossible FCR is clamped before the model runs. Publishing a band off the
   clamped value would report a reading of a number nobody entered. */
const sevBlocked = render({ ...SETS.A, label: "impossible FCR", fcrPct: 0, targetPct: 78 });
A("an impossible FCR blocks the result", sevBlocked.R.fcrImpossible);
A("a blocked result publishes no severity at all", !("severity" in sevBlocked.signals));
A("a blocked result carries no signal_severity into the review payload",
  !Object.keys(sevBlocked.signals).map(x => "signal_" + x).includes("signal_severity"));

/* --------------------------------------------------- substituted enum documents

   A hand-edited scenario link can carry any string into the mechanism or the
   scope. The document a reader holds must show the value the engine actually ran
   and say so. Two failures were shipped: an unknown mechanism printed a full
   Planning-grade case built on the 75% hiring default nobody chose, and an
   inherited name such as "toString" printed NaN through every dollar figure.
   The rendered document is compared against the fallback document, not merely
   asserted, so a correction can never sit beside numbers from the entered key. */
const asFallbackMech = render({ ...SETS.A, label: "mechanism none", mech: "none" });
const hostileMech = render({ ...SETS.A, label: "mechanism nonsense", mech: "nonsense" });
const protoMech = render({ ...SETS.A, label: "mechanism toString", mech: "toString" });
const asFallbackScope = render({ ...SETS.A, label: "scope enterprise", scope: "enterprise" });
const hostileScope = render({ ...SETS.A, label: "scope nonsense", scope: "nonsense" });

const corrOf = (doc, lead) => doc.R.flags.filter(f => f.indexOf(lead) === 0);
const docDollars = (doc) => JSON.stringify(doc.sections) + JSON.stringify(doc.summary);

A("a substituted mechanism renders the none document, not the hiring default",
  hostileMech.R.realizableYr === asFallbackMech.R.realizableYr && hostileMech.R.realFactor === 0);
A("a substituted mechanism discloses exactly one correction",
  corrOf(hostileMech, "Realization mechanism was").length === 1);
A("the correction names the entered value and the value used",
  /^Realization mechanism was "nonsense", .*was held at Not selected\.$/.test(corrOf(hostileMech, "Realization mechanism was")[0]));
A("the substituted document carries exactly one more flag than the fallback document",
  hostileMech.R.flags.length === asFallbackMech.R.flags.length + 1);
A("an inherited property name renders the same none document, never NaN",
  protoMech.R.mechKey === "none" && !/NaN/.test(docDollars(protoMech)));
A("the mechanism sentence in the report names the resolved mechanism and its rate",
  (() => { const line = JSON.stringify(hostileMech.sections).match(/Mechanism applied: [^"\\]*/);
    return !!line && /^Mechanism applied: Not selected \(0%\), credited as none\.$/.test(line[0]); })());
A("the entered string appears only inside the correction sentence",
  (() => { const all = docDollars(hostileMech);
    const scrubbed = all.split("Realization mechanism was").map((p, i) => i === 0 ? p : p.slice(p.indexOf("was held at"))).join("");
    return /nonsense/.test(all) && !/nonsense/.test(scrubbed); })());
A("a substituted scope renders the strictest-ceiling document",
  hostileScope.R.practicalMax === asFallbackScope.R.practicalMax && hostileScope.R.ceilingFCR === asFallbackScope.R.ceilingFCR);
A("a substituted scope discloses exactly one correction",
  corrOf(hostileScope, "Resolution scope was").length === 1);
A("the FCR definition line names the resolved scope, never the entered string",
  /Enterprise one-contact/.test(docDollars(hostileScope)));
A("both substituted documents block at Directional",
  hostileMech.R.headlineConf === "Directional" && hostileScope.R.headlineConf === "Directional");
A("no substituted document publishes a severity band",
  !("severity" in hostileMech.signals) && !("severity" in hostileScope.signals));
A("a clean document discloses no enum correction at all",
  corrOf(render(SETS.A), "Realization mechanism was").length === 0 &&
  corrOf(render(SETS.A), "Resolution scope was").length === 0);

/* 11B. A document built on this tool's own last run, or on a rail value with no
   origin, prints Directional evidence and says why. A scenario link suppresses the
   prefill record, so the same values opened from a link are the sender's entries. */
{
  const selfDoc = render({ ...SETS.B, label: "restored own run", pre: { M: { value: SETS.B.M, src: "fcr-leakage" } } });
  const railDoc = render({ ...SETS.B, label: "rail volume", pre: { M: { value: SETS.B.M, src: "cost-per-contact" } } });
  const linkDoc = render({ ...SETS.B, label: "same values from a link", fromLink: true, pre: { M: { value: SETS.B.M, src: "fcr-leakage" } } });
  const conf = (d) => d.sections.find((s) => s.title === "Confidence and Risk Flags").items;
  A("a restored own value prints Directional evidence and names self-credentialing", selfDoc.R.evidence === "Directional" && /a tool never credentials itself/.test(conf(selfDoc)[0]));
  A("a rail value with no origin prints Directional evidence and names the rail", railDoc.R.evidence === "Directional" && /arrived over the rail with no recorded origin grade/.test(conf(railDoc)[0]));
  A("the same values from a scenario link are the sender's entries", linkDoc.R.evidence === "Planning-grade" && linkDoc.R.origins.M === "entered");
  A("set B prints Planning-grade headline with a whole model", render(SETS.B).R.confidence === "Planning-grade" && render(SETS.B).R.completeness === "Finance-grade");
  A("set A prints Directional, bound by evidence on a modeled repeat share", render(SETS.A).R.confidence === "Directional" && /modeled from FCR/.test(conf(render(SETS.A))[0]));
}

/* The second consumer. ReportActions appends every signal to the Formspree
   review payload, so adding severity changed the manual-handling form too. */
A("ReportActions maps every signal into the review payload as signal_<key>", /signal_\$\{k\}/.test(RA));

/* Silent substitution. The local NumField copy injected 0 on a cleared field and its
   reader stripped letters, so "1e3" read as 13. The tool now uses the shared input. */
A("FCR imports the shared NumField", /import NumField from "\.\/src\/lib\/NumField";/.test(SRC));
A("FCR carries no local NumField copy", !/function NumField\(/.test(SRC));
A("FCR carries no character-stripping reader", SRC.indexOf('replace(/[^0-9.\\-]/g') < 0 && !/const num = /.test(SRC));
A("every FCR NumField states its floor", (SRC.match(/<NumField [^>]*\/>/g) || []).length === 11
  && (SRC.match(/<NumField [^>]*\/>/g) || []).every(t => /\bmin=\{/.test(t)));
A("no FCR NumField passes the retired align prop", (SRC.match(/<NumField [^>]*\/>/g) || []).every(t => !/ align=/.test(t)));


/* Numeric disclosure on the rendered document. A hand-edited link can carry junk
   in any numeric field. The shipped payload must print no NaN or Infinity outside
   the disclosure's own quote of what was entered, must carry the disclosure, must
   block at Directional, and must count it in telemetry. */
{
  const JUNK = { M: "abc", mCPC: "Infinity", repeatMult: "12abc", investOneTime: null, targetPct: "$50", fcrPct: "1,200" };
  const dirty = render({ ...SETS.A, ...JUNK });
  const all = JSON.stringify({ subtitle: dirty.subtitle, summary: dirty.summary, signals: dirty.signals, sections: dirty.sections });
  const scrubbed = all.replace(/entered as (\\"[^\\]*\\"|NaN|-?Infinity|blank)/g, "");
  A("a junk-numeric link prints no NaN, Infinity or undefined anywhere in the document or signals", !/NaN|Infinity|undefined/.test(scrubbed));
  A("a junk-numeric link discloses every junk field in the document", Object.keys(JUNK).length === 6 &&
    ["Monthly contacts", "Marginal cost per contact", "Repeat complexity multiplier", "One-time cost", "Target FCR", "Current FCR"].every((l) => all.includes(l + " was entered as")));
  A("a junk-numeric link blocks at Directional", dirty.R.headlineConf === "Directional");
  A("telemetry counts the numeric corrections", dirty.signals.inputs_corrected === 6);
  A("a clean document counts zero numeric corrections", render(SETS.A).signals.inputs_corrected === 0 && render(SETS.B).signals.inputs_corrected === 0);
  A("every rendered figure is finite for a junk-numeric link", [dirty.R.burdenYr, dirty.R.realizableYr, dirty.R.year1Net, dirty.R.cum2Yr].every(Number.isFinite));
}

console.log("\n" + "=".repeat(78));
console.log("  " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
