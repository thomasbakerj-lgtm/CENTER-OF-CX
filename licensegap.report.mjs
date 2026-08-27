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
const { COLORS } = await import("./src/lib/benchmarks.js");

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
A("the confidence prop is the same grade the engine computed", /confidence=\{confidence\}/.test(SRC));
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
      gCommitted, gUplift, gSeats18, gCost, gUse, evLabel } = r;
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
    "BORDER", "GREEN", "AMBER", "RED", "TEAL", "MUT", "FROM_LINK", "PULLED_FROM", "TOOL_NAME", preamble);
  return fn(COLORS, COLORS.navy, "#061325", COLORS.electric, "#00AAFF", "#E8F4FD", "#F8FAFB", "#3A4F6A",
    COLORS.muted, "#D8E3ED", COLORS.green, COLORS.amber, COLORS.red, "#0EA5A5",
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

  /* --- confidence is stated once, consistently, with its reason --- */
  const confSec = sect(R, "Confidence & Evidence");
  A(`${k}: the confidence section exists`, !!confSec);
  A(`${k}: the confidence section names the grade`, confSec.content.indexOf(r.confidence) >= 0);
  A(`${k}: the confidence section names what bound the grade`, confSec.content.indexOf(r.gradeWhy) >= 0);
  A(`${k}: the confidence section names both axes`,
    confSec.content.indexOf(r.evidenceGrade) >= 0 && confSec.content.indexOf(r.completenessCeiling) >= 0);
  A(`${k}: the subtitle carries the same grade as the confidence section`, R.subtitle.indexOf(r.confidence) >= 0);
  A(`${k}: the methodology restates the same grade`, sect(R, "Methodology").content.indexOf(r.confidence) >= 0);
  A(`${k}: the methodology restates the same rationale`, sect(R, "Methodology").content.indexOf(r.gradeWhy) >= 0);
  A(`${k}: signals carry the evidence grade`, R.signals.evidence_grade === r.evidenceGrade);
  A(`${k}: signals carry the completeness ceiling`, R.signals.completeness_ceiling === r.completenessCeiling);
  A(`${k}: signals carry the rationale, not just the verdict`, R.signals.grade_bound_by === r.gradeWhy);

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
  sectionsExpr.indexOf("Inputs Corrected") < sectionsExpr.indexOf("Confidence & Evidence"));
A("the void section is placed first of all", sectionsExpr.indexOf("Output Void") < sectionsExpr.indexOf("Inputs Corrected"));
A("every set produced a document", Object.keys(results).length === 4);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
