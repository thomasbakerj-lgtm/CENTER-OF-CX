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
const { MECH, MECH_ORDER } = await import("./src/lib/mech.js");

let pass = 0, fail = 0;
const A = (nm, c) => { if (c) pass++; else { fail++; console.log("  FAIL:", nm); } };

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
const fmtRegion = [constLine("money"), constLine("money2"), constLine("fmtX"), constLine("num")].join("\n");
const dimsRegion = "const DIMS = " + constLiteral("DIMS", "[", "]").replace(/^const DIMS = /, "") + ";";

/* the component-scope derivations the payload closes over */
const compRegion = [
  constLine("dimScore"), constLine("defDeclared"), constLine("confColor"),
  constLine("scopeLabel"), constLine("methodLabel"), constLine("aggMult"),
].join("\n");

const summaryExpr = prop("summary");
const signalsExpr = prop("signals");
const sectionsExpr = prop("sections");
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
    const engineInput = { M, fcr: fcrPct / 100, mCPC, lCPC, repeatModel, measuredRate: measuredPct / 100,
      measuredTargetRate: measuredTargetPct > 0 ? measuredTargetPct / 100 : null, pathModel, repeatMult,
      dScore: dScoreRaw || 3, askTarget: targetPct / 100, mech, sourcing, investOneTime, investRecurring,
      costBasis, defDeclared, fcrPulledDirty, scope, method, windowDays };
    const R = engine(engineInput);
    const sorted = [...DIMS].sort((a, b) => dimScore(a.id) - dimScore(b.id));
    const top = sorted[0];
    return {
      R, dScore: dScoreRaw, sorted, top,
      subtitle: (${subtitleExpr}),
      summary: (${summaryExpr}),
      signals: (${signalsExpr}),
      sections: (${sectionsExpr}),
    };
  `;

  const argNames = ["MECH", "MECH_ORDER", "SCORES", "COLORS", "M", "fcrPct", "mCPC", "lCPC", "scope", "method",
    "windowDays", "repeatModel", "measuredPct", "measuredTargetPct", "pathModel", "repeatMult", "targetPct",
    "sourcing", "mech", "investOneTime", "investRecurring", "costBasis", "fcrPulledDirty", "fromLink"];
  const C = { GREEN: "g", AMBER: "a", RED: "r", ELECTRIC: "e", NAVY: "n", MUTED: "m", SLATE: "s" };
  const body = "const { GREEN, AMBER, RED, ELECTRIC, NAVY, MUTED, SLATE } = COLORS;" + preamble;
  const fn = new Function(...argNames, body);
  return fn(MECH, MECH_ORDER, scores, C, S.M, S.fcrPct, S.mCPC, S.lCPC, S.scope, S.method, S.windowDays,
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
  A(P() + "confidence section states both axes", confSec.items[0].indexOf(R.costConf) >= 0 && confSec.items[0].indexOf(R.realConf) >= 0);
  A(P() + "confidence section carries every engine flag", R.flags.every((f) => confSec.items.indexOf(f) >= 0));
  A(P() + "signals report the APPLIED target, not the ask (" + rep.signals.target_fcr + " vs applied " + (R.target * 100).toFixed(1) + "%)",
    Math.abs(Number(String(rep.signals.target_fcr).replace("%", "")) - R.target * 100) < 0.06);
  A(P() + "signals block agrees with the engine on both axes",
    rep.signals.cost_basis_confidence === R.costConf && rep.signals.realization_confidence === R.realConf);

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
    (R.neverPaysBack && /never/.test(textSec.content)) || (!R.neverPaysBack && (textSec.content.indexOf("month " + R.payback) >= 0 || textSec.content.indexOf("beyond 48 months") >= 0)));

  /* the mechanism must not be named when it does not apply */
  if (S.sourcing === "bpo") {
    const all = JSON.stringify(rep.sections) + rep.subtitle;
    A(P() + "an outsourced case does not credit a capacity mechanism", rep.signals.capacity_action === "not applicable (bpo)");
    A(P() + "an outsourced case states that no mechanism was used", all.indexOf("none was used") >= 0);
    A(P() + "an outsourced case is not presented as Finance-grade realization", R.realConf !== "Finance-grade");
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

console.log("\n" + "=".repeat(78));
console.log("  " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
