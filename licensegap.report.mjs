/* licensegap.report.mjs
 *
 * Rendered-output reconciliation for the License Bundle Gap Checker.
 *
 * The engine harness proves the arithmetic. It says nothing about the document a
 * buyer takes into a negotiation, because every figure in the PDF is a separate
 * expression written in JSX, and a passing engine can sit underneath a report that
 * quotes a different number, contradicts itself in prose, or drops a section.
 * That gate found four defects in Business Case Builder while 478 assertions were
 * green, a $100,000 self-contradiction in TCO while 112 were green, and the split
 * money rendering in Channel Shift that is still live in Cost per Contact.
 *
 * This file does NOT rebuild the report. It slices the ReportActions payload out
 * of the shipped JSX at runtime, binds it to the real engine output sliced from
 * the same file, evaluates it, and prints the document. Every figure printed below
 * is the figure the PDF prints.
 *
 * Run from repo root: node licensegap.report.mjs
 */
import { readFileSync } from "fs";

const SRC = readFileSync("./LicenseBundleGapChecker.jsx", "utf8");
const RA = readFileSync("./ReportActions.jsx", "utf8");
const { COLORS } = await import("./src/lib/benchmarks.js");
const { createGuards } = await import("./src/lib/guards.js");
const { benchmark } = await import("./src/lib/benchmarks.js");
const { emitGrades, voidResult, isVoid } = await import("./src/lib/confidence.js");
/* The real boundary guard and the real bucket, never reconstructed. The tool
   publishes signals.severity through severityBucket, and sanitizeProps is what
   decides whether that value reaches the wire or is silently dropped. */
const { severityBucket, sanitizeProps, SEVERITY_BANDS } = await import("./src/lib/track.js");

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


/** Slice a named JSX prop expression: `name={ ... }`. */
function prop(name) {
  const at = SRC.indexOf(name + "={");
  if (at < 0) return null;
  const b = balanced(SRC, at + name.length, "{", "}");
  return b ? b.text.slice(1, -1) : null;
}

const ea = SRC.indexOf("/* @engine-start"), eb = SRC.indexOf("/* @engine-end */");
if (ea < 0 || eb < 0) { console.error("BLOCKER: engine markers not found."); process.exit(1); }
const engineRegion = SRC.slice(ea, eb).replace(/^export /gm, "");

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
A("the report receives the emitted grade object, never a local grade string", /grades=\{gradeObj\}/.test(SRC) && !/confidence=\{confidence\}/.test(SRC));
A("the scenario prop carries the exact input set", /state=\{scenario\}/.test(SRC));
A("the defaults prop points at the shared DEFAULTS", /defaults=\{DEFAULTS\}/.test(SRC));
A("the route prop points at the shared ROUTE", /routePath=\{ROUTE\}/.test(SRC));
A("the report payload contains no em-dash",
  [subtitleExpr, summaryExpr, signalsExpr, sectionsExpr].join("").indexOf(String.fromCharCode(0x2014)) < 0);

/* ------------------------------------------------------------ input sets */
/*
 * Set A is the shipped default: 150 agents at $125, three core add-ons, nothing
 * committed, no uplift, evidence is a guess. It is the document most users see.
 *
 * Set B is a fully documented negotiation-ready run: four seat classes, a tier
 * upgrade, priced usage, a real commitment, a renewal uplift, an MSA confirmed in
 * writing. It is the only set that should reach Finance-grade.
 *
 * Set C is deliberately hostile: a scenario link carrying a negative seat count,
 * a negative module cost, a negative usage fee, a 900 percent renewal uplift and
 * a negative expansion. It exists to prove the document DISCLOSES the corrections
 * rather than quietly printing a clean report off numbers the engine never ran,
 * and that no money figure anywhere in the document renders as a malformed number.
 *
 * Set D is Set B with the evidence downgraded to a vendor email and nothing else
 * changed, so any difference in grade between B and D is attributable to the
 * evidence axis alone.
 */
const B_MUT = (d) => {
  d.classes[0].count = 320; d.classes[0].price = 138;
  d.classes[1].count = 24; d.classes[1].price = 165;
  d.classes[2].count = 4; d.classes[2].price = 210;
  d.classes[3].count = 6; d.classes[3].price = 180;
  d.modules.analytics.status = "tier"; d.modules.analytics.cost = 18;
  d.modules.ai.need = "yes"; d.modules.ai.status = "usage";
  d.modules.digital.need = "yes"; d.modules.digital.status = "addon"; d.modules.digital.cost = 14;
  d.modules.services.need = "yes"; d.modules.services.cost = 180000;
  d.usage.ai = 12000; d.usage.transcription = 4200; d.usage.sms = 2600;
  d.committedSeats = 400; d.commitBasis = "license";
  d.uplift = 6; d.seats18mo = 40;
  d.modules.wem.cost = 27; d.modules.qa.cost = 16;
  d.evidence = "msa"; d.confirmed = true; d.dblAck = true;
};
const SETS = {
  A: { label: "Shipped defaults: 150 agents, three core add-ons, evidence is a guess", mut: (d) => {}, fromLink: false, pulledFrom: null },
  B: { label: "Documented negotiation run: four classes, tier upgrade, priced usage, MSA confirmed", mut: B_MUT, fromLink: false, pulledFrom: "tco-calculator" },
  C: { label: "Hostile scenario link: negative seats, negative cost, negative usage, 900% uplift", fromLink: true, pulledFrom: null,
    mut: (d) => { d.classes[0].count = -150; d.modules.wem.cost = -9999; d.usage.ai = -50000; d.uplift = 900; d.seats18mo = -1000; d.committedSeats = -20; } },
  D: { label: "Set B exactly, evidence downgraded to a vendor email: the evidence axis", fromLink: false, pulledFrom: "tco-calculator",
    mut: (d) => { B_MUT(d); d.evidence = "email"; d.confirmed = false; } },
};

function render(S) {
  const preamble = `
    ${engineRegion}
    const d = (() => { const x = clone(DEFAULTS); MUT(x); return x; })();
    const r = compute(d);
    const { billable, addOnMonthly, tierMonthly, oneTimeTotal, unknowns, doubles, usageMonthly,
      quotedSeat, effLicenseSeat, effPlatformSeat, gapPct, hiddenAnnual, decomp, annualPlatform,
      commitExpSeats, commitExpAnnual, year3LicenseSeat, year3Seat, exp18Annual, gapColor,
      shelfware, drivers, topRecur, singleDriverDominant, confidence, confColor, flags, analyst, confLine,
      guards, invariants, voided, evidenceGrade, completenessCeiling, gradeWhy, doubtWhy,
      gCommitted, gUplift, gSeats18, gCost, gUse, evLabel, gradeObj, boundBy, defaultDrivers } = r;
    const { classes, basis, committedSeats, commitBasis, commitRate, uplift, seats18mo, evidence, confirmed, dblAck, modules, usage } = d;
    const pulled = PULLED_FROM ? { agents: true, from: PULLED_FROM } : {};
    const fromLink = FROM_LINK;
    const scenario = {
      classes, basis,
      committedSeats: n(committedSeats), commitBasis, commitRate: n(commitRate),
      uplift: n(uplift), seats18mo: n(seats18mo),
      evidence, confirmed, dblAck, modules, usage,
    };
    return {
      r, d, scenario,
      toolName: TOOL_NAME,
      subtitle: ${subtitleExpr},
      summary: ${summaryExpr},
      signals: ${signalsExpr},
      sections: ${sectionsExpr},
    };`;
  const fn = new Function("COLORS", "NAVY", "DEEP", "ELECTRIC", "LIGHT", "ICE", "WARM", "SLATE", "MUTED",
    "BORDER", "GREEN", "AMBER", "RED", "TEAL", "severityBucket", "createGuards", "benchmark", "emitGrades", "voidResult", "MUT", "FROM_LINK", "PULLED_FROM", "TOOL_NAME", preamble);
  return fn(COLORS, COLORS.navy, "#061325", COLORS.electric, "#00AAFF", "#E8F4FD", "#F8FAFB", "#3A4F6A",
    COLORS.muted, "#D8E3ED", COLORS.green, COLORS.amber, COLORS.red, "#0EA5A5", severityBucket, createGuards, benchmark, emitGrades, voidResult,
    S.mut, S.fromLink, S.pulledFrom, toolNameM[1]);
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

const money = /\$-|\$\s|-\$?\d+\$|\d+\$/;   // malformed money: "$-2", "-2$", a trailing symbol
const results = {};

for (const [k, S] of Object.entries(SETS)) {
  console.log(`\n\n${"=".repeat(78)}\nSET ${k}. ${S.label}\n${"=".repeat(78)}`);
  let R;
  try { R = render(S); } catch (e) {
    fail++; console.log("  FAIL: the report payload did not evaluate:", String(e.message || e)); continue;
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

/* ------------------------------------------------------ reconciliation */

console.log(`\n\n${"=".repeat(78)}\nRECONCILIATION\n${"=".repeat(78)}`);

const sect = (R, t) => R.sections.find(s => s && s.title.indexOf(t) >= 0);
const doc = (R) => flat(R.sections);
const sumOf = (R, label) => (R.summary.find(s => s.label === label) || {}).value;

for (const [k, R] of Object.entries(results)) {
  const r = R.r, S = R.S;
  console.log(`\nSet ${k}`);

  /* --- the summary strip must reproduce the engine --- */
  A(`${k}: summary quoted seat matches the engine`, sumOf(R, "Quoted seat") === "$" + r.quotedSeat.toFixed(0));
  A(`${k}: summary effective license seat matches the engine`, sumOf(R, "Effective license seat") === "$" + r.effLicenseSeat.toFixed(0));
  A(`${k}: summary platform seat-equivalent matches the engine`, sumOf(R, "Platform seat-equivalent") === "$" + r.effPlatformSeat.toFixed(0));
  A(`${k}: summary bundle gap matches the engine`, sumOf(R, "Bundle gap") === r.gapPct.toFixed(0) + "%");
  A(`${k}: summary hidden annual matches the engine`, sumOf(R, "Hidden annual") === (r.hiddenAnnual >= 1000 ? "$" + Math.round(r.hiddenAnnual / 1000) + "K" : "$" + Math.round(r.hiddenAnnual)));

  /* --- the seat ladder must not contradict itself inside the document --- */
  const metrics = sect(R, "Seat Economics");
  A(`${k}: the seat economics block exists`, !!metrics);
  const mv = (l) => (metrics.items.find(i => i.label === l) || {}).value;
  A(`${k}: seat economics quoted seat agrees with the summary strip`, mv("Quoted Seat") === sumOf(R, "Quoted seat"));
  A(`${k}: seat economics effective seat agrees with the summary strip`, mv("Eff. License Seat") === sumOf(R, "Effective license seat"));
  A(`${k}: seat economics platform seat agrees with the summary strip`, mv("Platform Seat-Eq") === sumOf(R, "Platform seat-equivalent"));
  A(`${k}: the printed ladder is monotonic, quoted <= license <= platform`,
    parseFloat(mv("Quoted Seat").slice(1)) <= parseFloat(mv("Eff. License Seat").slice(1)) + 1e-9
    && parseFloat(mv("Eff. License Seat").slice(1)) <= parseFloat(mv("Platform Seat-Eq").slice(1)) + 1e-9);

  /* --- the decomposition table must sum to its own total --- */
  const tbl = sect(R, "Hidden Annual");
  A(`${k}: the hidden annual table exists`, !!tbl);
  const cell = (l) => (tbl.rows.find(row => row[0] === l) || [])[1];
  A(`${k}: required add-ons row matches the engine`, cell("Required add-ons") === (r.decomp.addOns >= 1000 ? "$" + Math.round(r.decomp.addOns / 1000) + "K" : "$" + Math.round(r.decomp.addOns)));
  A(`${k}: the printed total equals the printed hidden annual in the summary`, cell("Total hidden annual") === sumOf(R, "Hidden annual"));
  A(`${k}: the three printed components reconcile to the printed total within rounding`, (() => {
    const un = (s) => s.indexOf("M") > 0 ? parseFloat(s.replace(/[$M]/g, "")) * 1e6 : s.indexOf("K") > 0 ? parseFloat(s.replace(/[$K]/g, "")) * 1e3 : parseFloat(s.replace(/[$]/g, ""));
    const parts = ["Required add-ons", "Tier upgrades", "Usage-based fees"].map(l => un(cell(l)));
    const total = un(cell("Total hidden annual"));
    const tol = Math.max(1000, Math.abs(total) * 0.01);
    return Math.abs(parts.reduce((a, b) => a + b, 0) - total) <= tol;
  })());

  /* --- money never renders malformed, anywhere in the document --- */
  const text = doc(R) + "\n" + R.subtitle + "\n" + Object.values(R.signals).join("\n") + "\n" + R.summary.map(s => s.value).join("\n");
  A(`${k}: no money figure renders with a trailing dollar symbol`, !/\d\$/.test(text.replace(/\$\d/g, "")));
  A(`${k}: no money figure renders as a bare "$-"`, !/\$-(?!\d)/.test(text));
  A(`${k}: no figure renders as NaN`, text.indexOf("NaN") < 0);
  A(`${k}: no figure renders as undefined`, text.indexOf("undefined") < 0);
  A(`${k}: no figure renders as Infinity`, text.indexOf("Infinity") < 0);
  A(`${k}: the document carries no em-dash`, text.indexOf(String.fromCharCode(0x2014)) < 0);

  /* --- confidence comes from the shared grading layer, stated once --- */
  /* ReportActions renders the Confidence section from the emitted object, so the
     tool no longer writes its own. What the tool still owns is the commercial
     caveat line and the corrections, which stay in their own section. */
  const confSec = sect(R, "Commercial Caveats");
  const g = r.gradeObj;
  A(`${k}: the commercial caveats section exists`, !!confSec);
  A(`${k}: the tool writes no confidence section of its own`, !sect(R, "Confidence & Evidence"));
  A(`${k}: the grade object carries the headline the page shows`, r.voided ? isVoid(g) : g.headline === r.confidence);
  A(`${k}: the grade object names both applicable axes`, r.voided || (g.applicable.join() === "evidence,completeness" && g.evidence === r.evidenceGrade && g.completeness === r.completenessCeiling));
  A(`${k}: every applicable axis carries a reason`, r.voided || (g.reasons.evidence.length > 10 && g.reasons.completeness.length > 10));
  A(`${k}: realization is not applicable and says why`, r.voided || (g.realization === null && g.naReason.length > 40));
  A(`${k}: the grade carries no content defect`, r.voided || g.defects.length === 0);
  A(`${k}: the subtitle carries the same grade and binding axis`, R.subtitle.indexOf(r.confidence) >= 0 && (r.voided || R.subtitle.indexOf(r.boundBy) >= 0));
  A(`${k}: the methodology restates the same grade`, sect(R, "Methodology").content.indexOf(r.confidence) >= 0);
  A(`${k}: the methodology restates the same rationale`, sect(R, "Methodology").content.indexOf(r.gradeWhy) >= 0);
  A(`${k}: signals carry the evidence grade`, R.signals.evidence_grade === r.evidenceGrade);
  A(`${k}: signals carry the completeness ceiling`, R.signals.completeness_ceiling === r.completenessCeiling);
  A(`${k}: signals carry the default-driver count`, R.signals.default_drivers === r.defaultDrivers.length);
  A(`${k}: no prose rationale rides on the wire`, !("grade_bound_by" in R.signals));

  /* --- corrections must be disclosed in the document, not just clamped --- */
  const corr = sect(R, "Inputs Corrected");
  if (r.guards.length) {
    A(`${k}: corrected inputs raise a corrections section`, !!corr);
    A(`${k}: every correction is itemised`, !!corr && corr.items.length === r.guards.length);
    A(`${k}: the corrections section names every corrected input`,
      !!corr && r.guards.every(g => corr.items.some(i => i.indexOf(g.label) >= 0)));
    A(`${k}: every correction prints both what was entered and what was computed`,
      !!corr && corr.items.every(i => i.indexOf("entered") >= 0 && i.indexOf("computed at") >= 0));
    A(`${k}: the methodology repeats the corrections`, sect(R, "Methodology").content.indexOf("INPUTS CORRECTED") >= 0);
    A(`${k}: the confidence section repeats the corrections`, confSec.content.indexOf("INPUTS CORRECTED") >= 0);
    A(`${k}: the corrections section and the methodology render the same values`, (() => {
      const meth = sect(R, "Methodology").content;
      return r.guards.every(g => {
        const ent = g.unit === "$" ? "$" + g.entered : `${g.entered}${g.unit}`;
        const use = g.unit === "$" ? "$" + g.used : `${g.used}${g.unit}`;
        return corr.items.some(i => i.indexOf(ent) >= 0 && i.indexOf(use) >= 0) && meth.indexOf(ent) >= 0 && meth.indexOf(use) >= 0;
      });
    })());
    A(`${k}: a corrected run cannot print Finance-grade`, r.confidence !== "Finance-grade");
    A(`${k}: signals record how many inputs were corrected`, R.signals.inputs_corrected === r.guards.length);
  } else {
    A(`${k}: an uncorrected run raises no corrections section`, !corr);
    A(`${k}: signals record zero corrections`, R.signals.inputs_corrected === 0);
  }

  /* --- the integrity block --- */
  const integ = sect(R, "Integrity Checks");
  if (r.flags.length) {
    A(`${k}: integrity checks reach the document`, !!integ && integ.items.length === r.flags.length);
    A(`${k}: no integrity check is empty`, !!integ && integ.items.every(i => typeof i === "string" && i.length > 10));
  }
  A(`${k}: signals record the integrity flag count`, R.signals.integrity_flags === r.flags.length);

  /* --- module coverage --- */
  const cov = sect(R, "Module Coverage");
  A(`${k}: the module coverage table exists`, !!cov);
  A(`${k}: every coverage row carries a module name and a classification`,
    cov.rows.every(row => typeof row[0] === "string" && typeof row[1] === "string" && row[1].length > 0));
  A(`${k}: shelfware is labelled as shelfware in the coverage table`,
    r.shelfware.every(m => cov.rows.some(row => row[0] === m.name && row[1] === "Shelfware")));
  A(`${k}: signals record the shelfware count`, R.signals.shelfware_modules === r.shelfware.length);
  if (r.shelfware.length) {
    A(`${k}: the shelfware section calls it leverage, never recoverable savings`,
      sect(R, "Shelfware").content.indexOf("Not recoverable") >= 0);
    A(`${k}: the shelfware section heading says leverage, not savings`,
      !!R.sections.find(s => s && s.title.indexOf("leverage, not savings") >= 0));
  }

  /* --- commercial exposure only appears when it exists --- */
  const exp = sect(R, "Commercial Exposure");
  if (r.commitExpSeats > 0 || r.gUplift > 0) {
    A(`${k}: the commercial exposure block exists when there is exposure`, !!exp);
    if (r.commitExpSeats > 0) A(`${k}: printed commit exposure matches the engine seat count`,
      exp.items.some(i => i.label === "Commit Exposure" && i.value === r.commitExpSeats + " seats"));
    if (r.gUplift > 0) {
      A(`${k}: printed year-three seat matches the engine`,
        exp.items.some(i => i.label === "Year-3 Seat-Eq" && i.value === "$" + r.year3Seat.toFixed(0)));
      A(`${k}: the printed uplift is the corrected uplift, never the entered one`,
        exp.items.some(i => i.label === "Year-3 Seat-Eq" && i.sub === r.gUplift + "% uplift"));
      A(`${k}: the printed year-three seat is never below the printed year-one seat`,
        parseFloat(String(exp.items.find(i => i.label === "Year-3 Seat-Eq").value).slice(1)) >= parseFloat(mv("Platform Seat-Eq").slice(1)) - 1);
    }
  } else {
    A(`${k}: no exposure block is printed when there is no exposure`, !exp);
  }

  /* --- provenance --- */
  A(`${k}: the report records where the seat count came from`,
    R.signals.agents_pulled_from === (S.pulledFrom || "none"));
  A(`${k}: a self-published seat count is never reported as an external pull`,
    R.signals.agents_pulled_from !== "license-gap");
  A(`${k}: the report records whether it came from a scenario link`,
    R.signals.from_scenario_link === (S.fromLink ? "yes" : "no"));

  /* --- the analyst read and next steps --- */
  A(`${k}: the analyst read reaches the document`, !!sect(R, "Analyst Read") && sect(R, "Analyst Read").items.length === r.analyst.length);
  A(`${k}: the next steps block offers three routes`, sect(R, "Next Steps").items.length === 3);
  A(`${k}: every next step carries a working route`, sect(R, "Next Steps").items.every(i => /^\/tools\//.test(i.href)));
  A(`${k}: the methodology states that shelfware is not savings`,
    sect(R, "Methodology").content.indexOf("never recoverable savings") >= 0);
  A(`${k}: the methodology states that the platform seat is not a vendor seat price`,
    sect(R, "Methodology").content.indexOf("not a vendor seat price") >= 0);
  A(`${k}: the methodology states that one-time cost is excluded`,
    sect(R, "Methodology").content.indexOf("excluded from the recurring seat economics") >= 0);
}

/* --- cross-set claims --- */
console.log("\nCross-set");
A("only the documented, confirmed, complete run reaches Finance-grade",
  results.B.r.confidence === "Finance-grade"
  && results.A.r.confidence !== "Finance-grade"
  && results.C.r.confidence !== "Finance-grade"
  && results.D.r.confidence !== "Finance-grade");
A("downgrading evidence alone downgrades the grade, with the model unchanged",
  results.D.r.completenessCeiling === results.B.r.completenessCeiling
  && results.D.r.confidence !== results.B.r.confidence
  && results.D.r.boundBy === "evidence");
A("the hostile scenario link discloses its corrections rather than printing clean",
  results.C.r.guards.length >= 5 && !!sect(results.C, "Inputs Corrected"));
A("the hostile scenario link prints negative money ONLY where it discloses a correction", (() => {
  /* "$-9999" is correct inside a corrections disclosure: it is what the user
     entered. It is a defect anywhere else, because it would be a figure the
     engine never ran. Strip the disclosure lines, then nothing may remain. */
  const kept = doc(results.C).split("\n").filter(l =>
    l.indexOf("entered") < 0 && l.indexOf("INPUTS CORRECTED") < 0).join("\n");
  return !/-\$\d|\$-\d/.test(kept);
})());
A("the module coverage table prints the computed cost, never the entered one", (() => {
  const cov = sect(results.C, "Module Coverage");
  return cov.rows.every(row => !/\$-\d/.test(row[1]));
})());
A("the hostile scenario link is not void, because guarding precedes the invariant check",
  results.C.r.voided === false && !sect(results.C, "Output Void"));
A("a void section exists in the payload for the case the invariants ever fire",
  /Output Void/.test(sectionsExpr));
A("the corrections section is placed before the confidence section, so it cannot be missed",
  sectionsExpr.indexOf("Inputs Corrected") < sectionsExpr.indexOf("Commercial Caveats"));
A("the void section is placed first of all", sectionsExpr.indexOf("Output Void") < sectionsExpr.indexOf("Inputs Corrected"));
A("every set produced a document", Object.keys(results).length === 4);

/* ---- severity band ---- */
/* rail-audit counts publishers with a regex, which proves the key was typed and
   nothing else. Severity here is the hidden premium as a share of the quoted
   seat, so the band must move with the gap, agree with the colour the same page
   prints, survive the boundary validator, and reach the review payload. */
console.log("\nseverity band");
const sevDoc = (label, mut) => render({ label, mut, fromLink: false, pulledFrom: null });
const SEV = {
  none: sevDoc("nothing needed beyond the quote", (d) => { Object.keys(d.modules).forEach(k => { d.modules[k].need = "no"; }); }),
  benign: sevDoc("expensive quote, small premium", (d) => { d.classes[0].price = 400; }),
  mid: sevDoc("shipped defaults", () => {}),
  bad: sevDoc("thin quote, same add-ons", (d) => { d.classes[0].price = 90; }),
  severe: sevDoc("priced usage on top of the add-ons", (d) => { d.usage.ai = 4000; d.usage.transcription = 3000; }),
};
A("a quote with nothing hidden behind it publishes none", SEV.none.signals.severity === "none");
A("a 15% premium publishes low", SEV.benign.signals.severity === "low");
A("the shipped defaults publish moderate at a 48% premium", SEV.mid.signals.severity === "moderate");
A("a 67% premium publishes high", SEV.bad.signals.severity === "high");
A("an 85% premium publishes severe", SEV.severe.signals.severity === "severe");
A("the band discriminates: five scenarios produce five distinct bands",
  new Set(Object.values(SEV).map(x => x.signals.severity)).size === 5);

/* The band and the gap colour the same document prints come from one ratio, so
   they cannot say different things. Amber above 40% is moderate or worse; red
   above 80% is severe. */
for (const k of Object.keys(SEV)) {
  const doc = SEV[k];
  const r = doc.r;
  A(k + ": a red gap colour publishes severe", !(r.gapPct > 80) || doc.signals.severity === "severe");
  A(k + ": an amber or red gap colour never publishes below moderate",
    !(r.gapPct > 40) || ["moderate", "high", "severe"].includes(doc.signals.severity));
  A(k + ": a green gap colour never publishes severe", r.gapPct > 40 || doc.signals.severity !== "severe");
}

for (const [k, doc] of Object.entries({ ...results, ...SEV })) {
  const v = doc.signals.severity;
  if (v === undefined) { A(k + ": severity is omitted only where the export is void or there is no quote", doc.r.voided || doc.r.billable <= 0 || doc.r.quotedSeat <= 0); continue; }
  A(k + ": the published band is in the canonical vocabulary", SEVERITY_BANDS.includes(v));
  A(k + ": the published band survives sanitizeProps and lands on the payload", sanitizeProps({ severity: v }).severity === v);
  A(k + ": severity reaches the manual review submission as signal_severity",
    Object.keys(doc.signals).map(x => "signal_" + x).includes("signal_severity"));
}

/* No billable seats means there is no quote to price a premium against. gapPct
   is a structural zero there, not a clean result, so the key is dropped. */
const sevEmpty = sevDoc("no seats", (d) => { d.classes.forEach(c => { c.count = 0; }); });
A("a model with no billable seats publishes no severity at all", !("severity" in sevEmpty.signals));
A("a model with no billable seats carries no signal_severity into the review payload",
  !Object.keys(sevEmpty.signals).map(x => "signal_" + x).includes("signal_severity"));

/* The second consumer. ReportActions appends every signal to the Formspree
   review payload, so adding severity changed the manual-handling form too. */
A("ReportActions maps every signal into the review payload as signal_<key>", /signal_\$\{k\}/.test(RA));


/* Numeric disclosure on the rendered document. Junk in a hand-edited link must
   print no NaN or Infinity outside the disclosure's quote of what was entered,
   must disclose, must block at Directional, and must count in telemetry. */
{
  const dirty = render({ label: "junk numerics", fromLink: true, pulledFrom: null, mut: (d) => {
    d.classes[0].price = "Infinity"; d.committedSeats = "abc"; d.seats18mo = ""; d.usage.ai = "12abc"; d.modules.wem.cost = "$50"; d.uplift = null; } });
  const all = JSON.stringify({ subtitle: dirty.subtitle, summary: dirty.summary, signals: dirty.signals, sections: dirty.sections });
  const scrubbed = all.replace(/entered (as )?(\\"[^\\]*\\"|NaN|-?Infinity|blank)/g, "");
  A("a junk-numeric link prints no NaN, Infinity or undefined in the document or signals", !/NaN|Infinity|undefined/.test(scrubbed));
  A("a junk-numeric link discloses each consumed junk field and exempts the blank uplift",
    ["Agent seat price", "Committed seats", "Seats added within 18 months", "AI assistant / copilot usage fee", "WEM / WFM cost"].every((l) => all.includes(l + " was entered as")) && !all.includes("Renewal uplift was entered as"));
  A("a junk-numeric link blocks at Directional", dirty.r.confidence === "Directional");
  A("telemetry counts the five disclosures", dirty.signals.inputs_corrected === 5);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
