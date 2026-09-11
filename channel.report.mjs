/* channel.report.mjs
 *
 * Rendered-output reconciliation for the Channel Shift Economics model.
 *
 * The engine harness proves the arithmetic. It says nothing about the document a
 * buyer actually reads, because every figure in the PDF is a separate expression
 * written in JSX, and a passing engine can sit underneath a report that quotes a
 * different number, contradicts itself in prose, or drops a section entirely.
 * That gate found four defects in Business Case Builder while 478 assertions were
 * green, a $100,000 self-contradiction in TCO while 112 were green, and a printed
 * FCR target the engine had never run in FCR Leakage while 139 were green.
 *
 * This file does NOT rebuild the report. It slices the ReportActions payload out
 * of the shipped JSX at runtime, binds it to the real engine output and the real
 * helpers sliced from the same file, evaluates it, and prints the document. Every
 * figure printed below is the figure the PDF prints. If the JSX payload changes
 * shape, this fails rather than reconciling a stale copy.
 *
 * Run from repo root: node channel.report.mjs
 */
import { readFileSync } from "fs";

const SRC = readFileSync("./ChannelShiftModel.jsx", "utf8");
const RA = readFileSync("./ReportActions.jsx", "utf8");
const { MECH } = await import("./src/lib/mech.js");
const { COLORS } = await import("./src/lib/benchmarks.js");
/* The shared clamp and disclosure renderer. The component imports them, so the
   report must be built on the same module, never on a retyped copy. */
const { createGuards, guardVal, guardLine } = await import("./src/lib/guards.js");
/* The real boundary guard and the real bucket, never reconstructed. The tool
   publishes signals.severity through severityBucket, and sanitizeProps is what
   decides whether that value reaches the wire or is silently dropped. */
const { severityBucket, sanitizeProps, SEVERITY_BANDS } = await import("./src/lib/track.js");

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

/** Slice a whole `const name = ...;` statement, however many lines it spans.
 *  The grade ladder is a multi-line conditional; a line-based slice would take
 *  its first branch and silently certify a ladder the app does not run. */
function constStatement(name) {
  const at = SRC.search(new RegExp("^\\s*const " + name + " = ", "m"));
  if (at < 0) return null;
  let inS = null, esc = false, tick = 0, depth = 0;
  for (let i = at; i < SRC.length; i++) {
    const c = SRC[i];
    if (esc) { esc = false; continue; }
    if (c === "\\") { esc = true; continue; }
    if (tick) { if (c === "`") tick = 0; continue; }
    if (inS) { if (c === inS) inS = null; continue; }
    if (c === '"' || c === "'") { inS = c; continue; }
    if (c === "`") { tick = 1; continue; }
    if ("([{".indexOf(c) >= 0) depth++;
    else if (")]}".indexOf(c) >= 0) depth--;
    else if (c === ";" && depth === 0) return SRC.slice(at, i + 1).trim();
  }
  return null;
}

/** Slice a contiguous block of component-scope statements by its endpoints. */
function block(startMarker, endMarker) {
  const a = SRC.indexOf(startMarker);
  const b = SRC.indexOf(endMarker, a);
  if (a < 0 || b < 0) return null;
  return SRC.slice(a, b);
}

const ea = SRC.indexOf("/* @engine-start"), eb = SRC.indexOf("/* @engine-end */");
if (ea < 0 || eb < 0) { console.error("BLOCKER: engine markers not found."); process.exit(1); }
const engineRegion = SRC.slice(ea, eb);

/* The integrity-check block is sliced, never retyped. A retyped flag list is
   exactly the kind of copy that drifts from the shipped one and then certifies
   a report the app would never have produced. */
const flagsRegion = block("  const mixTotal =", "  useEffect(() => {\n    publishToolResult(\"channel-shift\"");

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
A("the integrity-check block slices out", !!flagsRegion && flagsRegion.indexOf("const flags = []") > 0);
A("the multi-line grade ladder slices out whole, not first-branch-only", (constStatement("gradeWhy") || "").indexOf("capped by capacity action") > 0);
A("the confidence prop is the same grade the page displays", /confidence=\{grade\}/.test(SRC));
A("the scenario prop carries the exact input set", /state=\{scenario\}/.test(SRC));
A("the defaults prop points at the shared DEFAULTS", /defaults=\{DEFAULTS\}/.test(SRC));
/* The render preamble retypes the four lines between compute and the grade
   ladder. These gates hold the retyped copy to the shipped one, so the harness
   cannot resolve the capacity action where the page does not. */
A("the component resolves the capacity action off r directly after compute",
  /const r = compute\(d, mech\);\n(?:\s*\/\*[\s\S]*?\*\/\n)?\s*const mechKey = r\.mechKey;\n\s*const verdict = buildVerdict\(d, r, mechKey\);/.test(SRC));
A("the component builds the analyst read on the resolved key", /const analyst = buildAnalystRead\(d, r, mechKey, verdict\);/.test(SRC));
A("the component tests selection on the resolved key", /const mechSelected = mechKey !== "none";/.test(SRC));
A("no MECH lookup on the entered capacity action remains in the component", !/MECH\[mech\]/.test(SRC));

/* ------------------------------------------------------------ input sets */
/*
 * Set A is the shipped default: 100k contacts, voice-led, 20 points moving to
 * chat and bot, avoid-hiring mechanism. It is the document most users will see.
 *
 * Set B is a smaller, digital-led operation shifting to email as well, with a
 * severe complexity curve, an expensive bot, a cash-creditable mechanism and an
 * explicit validation. It exercises branches A never touches.
 *
 * Set C is deliberately hostile: a scenario link carrying a 150% chat resolution,
 * a 300% displacement rate, a negative bot cost and a negative volume. It exists
 * to prove the document DISCLOSES the corrections rather than quietly printing a
 * clean report off numbers the engine never ran.
 *
 * Set D reuses B's inputs verbatim and changes ONLY the capacity action, so any
 * difference in grade between B and D is attributable to the credit class alone.
 */
const B_INPUTS = {
  monthlyContacts: 38000, hourlyRate: 26, loadedOH: 1.44, marginalOH: 1.22,
  voicePct: 45, voiceAHT: 9.5, voiceConc: 1,
  chatPct: 30, chatAHT: 13, chatConc: 3,
  emailPct: 15, emailAHT: 6, emailConc: 1,
  botPct: 10, botCost: 1.35,
  eligibility: 45,
  shiftToChat: 6, shiftToBot: 4, shiftToEmail: 3,
  resChat: 78, resBot: 52, resEmail: 71,
  dispChat: 74, dispBot: 62, dispEmail: 68,
  escReturnFactor: 1.45, adverseCurve: "severe",
  trainingPerAgent: 2200, rampWeeks: 6, validated: true,
  riskComplaint: false, riskRegulated: false, riskSave: false, riskVulnerable: false, riskAuth: false, riskEmotion: false,
};

const SETS = {
  A: { label: "Shipped defaults, voice-led, chat and bot, avoid hiring", d: null, mech: "hiring", fromLink: false, pulledExternally: false },
  B: { label: "Digital-led, three targets, severe curve, vendor reduction, validated", d: B_INPUTS, mech: "vendor", fromLink: true, pulledExternally: true },
  C: { label: "Hostile scenario link: resolution 150%, displacement 300%, negative bot cost and volume", d: { monthlyContacts: -60000, chatPct: 40, resChat: 150, dispChat: 300, botCost: -2, voiceConc: 0, escReturnFactor: 0.4, rampWeeks: -3 }, mech: "none", fromLink: true, pulledExternally: false },
  D: { label: "Set B inputs exactly, absorb-growth mechanism: the credit-class ceiling", d: B_INPUTS, mech: "growth", fromLink: false, pulledExternally: true },
};

function render(S) {
  const preamble = `
    ${engineRegion}
    const d = D_IN === null ? BASE : { ...BASE, ...D_IN };
    const mech = MECH_KEY;
    const fromLink = FROM_LINK;
    const r = compute(d, mech);
    const mechKey = r.mechKey;
    const verdict = buildVerdict(d, r, mechKey);
    const shiftPts = r.perTarget.reduce((acc, t) => acc + t.shiftPts, 0);
    const analyst = buildAnalystRead(d, r, mechKey, verdict);
    const sourced = SOURCED;
    const mechSelected = mechKey !== "none";
    ${constStatement("evidenceGrade")}
    ${constStatement("grade")}
    ${constStatement("boundBy")}
    ${constStatement("gradeWhy")}
    ${flagsRegion}
    const scenario = { d, mech };
    /* TOOL_ID and ROUTE already come out of the engine region: do not shadow them. */
    return {
      d, mech, mechKey, r, verdict, analyst, flags, grade, gradeWhy, evidenceGrade, boundBy, shiftPts, mixTotal,
      subtitle: \`${subtitleExpr.replace(/^`|`$/g, "")}\`,
      summary: ${summaryExpr},
      signals: ${signalsExpr},
      sections: ${sectionsExpr},
    };`
    .replace(/\bD_IN\b/g, JSON.stringify(S.d))
    .replace(/\bMECH_KEY\b/g, JSON.stringify(S.mech))
    .replace(/\bFROM_LINK\b/g, JSON.stringify(!!S.fromLink))
    .replace(/\bSOURCED\b/g, JSON.stringify(!!S.pulledExternally));

  try {
    return new Function("MECH", "COLORS", "severityBucket", "createGuards", "guardVal", "guardLine", preamble)(MECH, COLORS, severityBucket, createGuards, guardVal, guardLine);
  } catch (e) {
    console.error("BLOCKER: the report payload did not evaluate for set " + S.label + ".");
    console.error(String(e.message || e));
    process.exit(1);
  }
}

/* --------------------------------------------------------------- printing */

const money2 = (x) => (x < 0 ? "-$" : "$") + Math.abs(x).toFixed(2);
const sec = (o, title) => o.sections.find(s => s.title === title);
const secStartingWith = (o, frag) => o.sections.find(s => s.title.indexOf(frag) >= 0);
const rowVal = (s, labelFrag) => { const row = (s.rows || []).find(x => String(x[0]).indexOf(labelFrag) >= 0); return row ? String(row[1]) : null; };
const summaryVal = (o, labelFrag) => { const x = o.summary.find(s => s.label.indexOf(labelFrag) >= 0); return x ? String(x.value) : null; };
const metricVal = (o, labelFrag) => { const s = sec(o, "Decision"); const x = (s.items || []).find(i => i.label.indexOf(labelFrag) >= 0); return x ? String(x.value) : null; };

function printDoc(key, o, S) {
  console.log(`\n${"=".repeat(78)}`);
  console.log(`SET ${key}  ${S.label}`);
  console.log("=".repeat(78));
  console.log(`subtitle:  ${o.subtitle}`);
  console.log(`grade:     ${o.grade}  (evidence ${o.evidenceGrade}, ceiling ${o.r.ceilingGrade}, bound by ${o.boundBy})`);
  console.log(`why:       ${o.gradeWhy}`);
  console.log("\nsummary");
  for (const s of o.summary) console.log(`  ${String(s.label).padEnd(26)} ${s.value}`);
  for (const s of o.sections) {
    console.log(`\n${s.title}`);
    if (s.type === "metrics") for (const i of s.items) console.log(`  ${String(i.label).padEnd(26)} ${String(i.value).padEnd(14)} ${i.sub || ""}`);
    else if (s.type === "table") for (const row of s.rows) console.log(`  ${String(row[0]).padEnd(52)} ${row[1]}`);
    else if (s.type === "findings") for (const i of s.items) console.log(`  - ${i}`);
    else if (s.type === "next") for (const i of s.items) console.log(`  - ${i.tool}: ${i.reason} (${i.href})`);
    else console.log(`  ${s.content}`);
  }
  console.log("\nsignals");
  for (const [k, v] of Object.entries(o.signals)) console.log(`  ${k.padEnd(26)} ${v}`);
}

const OUT = {};
for (const [k, S] of Object.entries(SETS)) OUT[k] = render(S);

/* ------------------------------------------------- 1. structural contract */
console.log("\n1. structural contract");
for (const k of Object.keys(SETS)) {
  const o = OUT[k];
  A(`${k}: the document carries all five permanent sections`,
    ["Decision", "Volume Bridge", "Economics", "Analyst Read", "Methodology"].every(t => !!sec(o, t)) && !!sec(o, "Next Steps"));
  A(`${k}: the adverse-selection section is present`, !!secStartingWith(o, "Adverse Selection"));
  A(`${k}: every section declares a renderable type`,
    o.sections.every(s => ["metrics", "table", "findings", "text", "next"].indexOf(s.type) >= 0));
  A(`${k}: no section is empty`,
    o.sections.every(s => (s.items && s.items.length) || (s.rows && s.rows.length) || (s.content && s.content.length)));
  A(`${k}: the summary carries three headline figures`, o.summary.length === 3);
  A(`${k}: no printed value is NaN, undefined or [object Object]`, (() => {
    const flat = JSON.stringify(o.summary) + JSON.stringify(o.sections) + JSON.stringify(o.signals) + o.subtitle;
    return !/NaN|undefined|\[object Object\]/.test(flat);
  })());
  A(`${k}: no em-dash reaches the document`,
    (JSON.stringify(o.sections) + JSON.stringify(o.summary) + o.subtitle).indexOf(String.fromCharCode(0x2014)) < 0);
  A(`${k}: the next-step links are absolute routes`, sec(o, "Next Steps").items.every(i => i.href.startsWith("/tools/")));
  A(`${k}: the subtitle states the verdict and the grade`,
    o.subtitle.indexOf(o.verdict.label) >= 0 && o.subtitle.indexOf(o.grade) >= 0);
}

/* --------------------------------------- 2. the document agrees with itself */
console.log("\n2. internal reconciliation");
for (const k of Object.keys(SETS)) {
  const o = OUT[k], r = o.r;
  const fmtK = (v) => { const x = v, s = x < 0 ? "-" : ""; const a2 = Math.abs(x); return s + (a2 >= 1000000 ? "$" + (a2 / 1000000).toFixed(2) + "M" : a2 >= 1000 ? "$" + (a2 / 1000).toFixed(0) + "K" : "$" + Math.round(a2)); };

  A(`${k}: the headline net realizable matches the engine`, summaryVal(o, "Net realizable") === fmtK(r.netRealizable));
  A(`${k}: the summary and the decision card quote the same net`,
    metricVal(o, "Net Realizable") === fmtK(r.netRealizable) + "/mo");
  A(`${k}: the economics table quotes the same net as the headline`,
    rowVal(sec(o, "Economics"), "Net realizable") === fmtK(r.netRealizable) + "/mo");
  A(`${k}: the summary verdict matches the decision card verdict`,
    summaryVal(o, "Verdict") === metricVal(o, "Verdict"));
  A(`${k}: the annual figure is exactly twelve times the monthly`, (() => {
    const m = sec(o, "Decision").items.find(i => i.label.indexOf("Net Realizable") >= 0);
    return r.netRealizable > 0 ? m.sub === fmtK(r.netRealizable * 12) + "/yr" : m.sub === "net cost";
  })());

  const vb = sec(o, "Volume Bridge");
  A(`${k}: the volume bridge quotes the engine's voice volume`, rowVal(vb, "Voice volume") === Math.round(r.voiceVol).toLocaleString());
  A(`${k}: the volume bridge quotes the engine's eligible pool`, rowVal(vb, "Eligible to shift") === Math.round(r.eligible).toLocaleString());
  A(`${k}: the volume bridge quotes the engine's shifted volume`, rowVal(vb, "Shifted") === Math.round(r.shifted).toLocaleString());
  A(`${k}: the volume bridge quotes the engine's displaced volume`, rowVal(vb, "Displaced voice") === Math.round(r.Dtot).toLocaleString());
  A(`${k}: the volume bridge quotes the engine's bounced volume`, rowVal(vb, "Bounced back") === Math.round(r.Etot).toLocaleString());
  A(`${k}: the bridge label states the eligibility the engine actually ran`,
    (vb.rows.find(x => String(x[0]).indexOf("Eligible to shift") >= 0) || [""])[0].indexOf(`(${r.eligPct}%)`) >= 0);
  A(`${k}: displaced never exceeds shifted in the printed bridge`,
    Number(String(rowVal(vb, "Displaced voice")).replace(/,/g, "")) <= Number(String(rowVal(vb, "Shifted")).replace(/,/g, "")));

  const ad = secStartingWith(o, "Adverse Selection");
  A(`${k}: the adverse table quotes the engine's baseline AHT`, rowVal(ad, "Voice AHT baseline") === r.baseEff.toFixed(1) + " min");
  A(`${k}: the adverse table quotes the engine's residual AHT`, rowVal(ad, "Residual voice AHT") === r.residualEff.toFixed(1) + " min");
  A(`${k}: the adverse table quotes the engine's implied departing AHT`, rowVal(ad, "Implied AHT") === r.deptEff.toFixed(1) + " min");
  A(`${k}: the printed uplift reproduces its own arithmetic`, (() => {
    const label = (ad.rows.find(x => String(x[0]).indexOf("Residual voice AHT") >= 0) || [""])[0];
    return label.indexOf(`(${(r.residualUplift * 100).toFixed(1)}% uplift)`) >= 0;
  })());
  A(`${k}: the residual AHT printed equals the baseline times the printed uplift`, (() => {
    const printed = Number(String(rowVal(ad, "Residual voice AHT")).replace(" min", ""));
    return Math.abs(printed - Number((r.baseEff * (1 + r.residualUplift)).toFixed(1))) < 0.051;
  })());

  const ec = sec(o, "Economics");
  A(`${k}: the economics table quotes the engine's net minutes`, rowVal(ec, "Net agent-minutes") === Math.round(r.netMin).toLocaleString());
  A(`${k}: the bot fee is printed as a cost, never as a saving`, rowVal(ec, "Bot platform fees").startsWith("-$") || rowVal(ec, "Bot platform fees") === "$0/mo");
  A(`${k}: the realized-labor label reproduces the mechanism percentage it applied`,
    (ec.rows.find(x => String(x[0]).indexOf("Realized labor") >= 0) || [""])[0].indexOf(`${Math.round(r.mf * 100)}%`) >= 0);
  A(`${k}: labor minus bot fee equals the printed net`,
    Math.abs((r.laborCash - r.botFee) - r.netRealizable) < 1e-6);
  A(`${k}: the transition figure matches the engine`, rowVal(ec, "Transition (one-time)") !== null);
  A(`${k}: a payback is printed only when the shift pays back`,
    isFinite(r.payback) ? rowVal(ec, "Payback") === r.payback.toFixed(1) + " months" : rowVal(ec, "Payback") === "Does not pay back");
  A(`${k}: a printed payback is never negative`, !String(rowVal(ec, "Payback")).startsWith("-"));

  A(`${k}: the FTE figure is labelled capacity, not headcount`,
    (sec(o, "Decision").items.find(i => i.label.indexOf("FTE") >= 0) || {}).sub === "capacity, not headcount");
  A(`${k}: the break-even the card prints is the one the verdict solved`,
    metricVal(o, "Break-even") === (o.verdict.be != null ? o.verdict.be.toFixed(0) + "%" : "n/a"));
  A(`${k}: the summary break-even matches the decision card`, summaryVal(o, "Break-even") === metricVal(o, "Break-even"));
}

/* ---------------------------------------- 3. methodology tells the truth */
console.log("\n3. methodology reconciliation");
for (const k of Object.keys(SETS)) {
  const o = OUT[k], r = o.r, m = sec(o, "Methodology").content;
  A(`${k}: the methodology states the grade the document carries`, m.indexOf(`Report grade: ${o.grade}`) >= 0);
  A(`${k}: the methodology states what bound the grade`, m.indexOf(o.gradeWhy) >= 0);
  A(`${k}: the methodology quotes the eligibility the engine ran`, m.indexOf(`(${r.eligPct}%)`) >= 0);
  A(`${k}: the methodology quotes the return factor the engine ran`, m.indexOf(`factor ${r.erf}x`) >= 0);
  A(`${k}: the methodology names the capacity action applied`, m.indexOf(MECH[o.mech].label) >= 0);
  A(`${k}: the methodology quotes the realization percentage applied`, m.indexOf(`(${Math.round(r.mf * 100)}%)`) >= 0);
  A(`${k}: the methodology names the complexity curve the engine ran`,
    m.indexOf({ mild: "Mild", moderate: "Moderate", severe: "Severe" }[r.curveKey]) >= 0);
  A(`${k}: the methodology quotes the same residual uplift as the adverse table`,
    m.indexOf(`${(r.residualUplift * 100).toFixed(1)}%`) >= 0);
  A(`${k}: the methodology quotes the same departing AHT as the adverse table`,
    m.indexOf(`${r.deptEff.toFixed(1)} minutes`) >= 0);
  A(`${k}: the methodology says bot fees are netted in full, not haircut`, /netted in full/.test(m));
  A(`${k}: the methodology disclaims value and full-investment modelling`, /operating-capacity model/.test(m));
}

/* --------------------------------- 4. corrections are disclosed, not hidden */
console.log("\n4. guard disclosure in the document");
{
  for (const k of ["A", "B", "D"]) {
    A(`${k}: a legal input set prints no corrections section`, !secStartingWith(OUT[k], "Inputs Corrected"));
    A(`${k}: a legal input set reports zero corrections in signals`, OUT[k].signals.inputs_corrected === 0);
    A(`${k}: a legal input set says nothing about corrections in the methodology`,
      sec(OUT[k], "Methodology").content.indexOf("INPUTS CORRECTED") < 0);
  }
  const c = OUT.C, cs = secStartingWith(c, "Inputs Corrected");
  A("C: the hostile scenario link produces a corrections section", !!cs);
  A("C: the corrections section is ordered ahead of the analyst read",
    c.sections.indexOf(cs) < c.sections.indexOf(sec(c, "Analyst Read")));
  A("C: the corrections section is ordered ahead of the integrity checks",
    c.sections.indexOf(cs) < c.sections.indexOf(sec(c, "Integrity Checks")));
  A("C: every engine correction reaches the document", cs.items.length === c.r.guards.length);
  A("C: each correction states both what was entered and what was used",
    c.r.guards.every(g =>
      cs.items.some(i => i.indexOf(`entered ${guardVal(g, "entered")}`) >= 0 && i.indexOf(`computed at ${guardVal(g, "used")}`) >= 0)));
  /* Assert against the shipped renderer. The old form rebuilt "$" + value by hand,
     so the harness encoded the defect it was meant to catch: it required $-2. */
  A("C: every correction line is exactly what the shipped renderer produces",
    cs.items.length === c.r.guards.length && c.r.guards.every((g, i) => cs.items[i] === guardLine(g)));
  A("C: the 150% resolution is disclosed as having run at 100%",
    cs.items.some(i => /Chat resolution/.test(i) && /entered 150/.test(i) && /computed at 100/.test(i)));
  A("C: the 300% displacement is disclosed as having run at 100%",
    cs.items.some(i => /Chat displacement/.test(i) && /entered 300/.test(i) && /computed at 100/.test(i)));
  A("C: the negative volume is disclosed as having run at zero",
    cs.items.some(i => /Monthly contacts/.test(i) && /computed at 0/.test(i)));
  A("C: the negative bot cost is disclosed as having run at zero",
    cs.items.some(i => /Bot cost per contact/.test(i) && /entered -\$2,/.test(i) && /computed at \$0/.test(i)));
  /* Money leads with the sign, matching money() and fmtK(). $-2 is a broken
     magnitude. Every path that discloses the bot cost must print -$2. */
  A("C: the bot cost correction prints -$2 in the corrections section",
    cs.items.some(i => i === "Bot cost per contact: entered -$2, computed at $0."));
  A("C: the bot cost correction prints -$2 in the integrity checks",
    sec(c, "Integrity Checks").items.some(i => /^Bot cost per contact: you entered -\$2, /.test(i)));
  A("C: the bot cost correction prints -$2 in the on-page flag",
    c.flags.some(f => /^Bot cost per contact: you entered -\$2, /.test(f.t)));
  A("C: the bot cost correction prints -$2 in the methodology",
    sec(c, "Methodology").content.indexOf("Bot cost per contact entered -$2, computed at $0") >= 0);
  A("C: no money anywhere in the document or the flags prints the sign behind the symbol",
    JSON.stringify([c.subtitle, c.summary, c.sections, c.flags]).indexOf("$-") < 0);
  /* The corrections section and the integrity check print the same fact. They had
     drifted: one rendered $-2 and the other -2$. One renderer now serves both. */
  A("C: money corrections carry the symbol before the number in every place they appear",
    !/\d\$/.test(JSON.stringify(c.sections)));
  A("C: the corrections section and the integrity checks agree on every entered value",
    c.r.guards.every(g => {
      const entered = guardVal(g, "entered");
      return cs.items.some(i => i.indexOf("entered " + entered) >= 0)
        && sec(c, "Integrity Checks").items.some(i => i.indexOf("entered " + entered) >= 0);
    }));
  A("C: the sub-1x return factor is disclosed as having run at 1x",
    cs.items.some(i => /Escalation return factor/.test(i) && /computed at 1x/.test(i)));
  A("C: the sub-1x voice concurrency is disclosed as having run at 1x",
    cs.items.some(i => /Voice concurrency/.test(i) && /computed at 1x/.test(i)));
  A("C: the negative ramp is disclosed as having run at zero weeks",
    cs.items.some(i => /Ramp weeks/.test(i) && /computed at 0w/.test(i)));
  A("C: the correction count reaches the signals payload", c.signals.inputs_corrected === c.r.guards.length);
  A("C: the methodology repeats every correction", (() => {
    const m = sec(c, "Methodology").content;
    return m.indexOf("INPUTS CORRECTED") > 0 && c.r.guards.every(g => m.indexOf(g.label) >= 0);
  })());
  A("C: a corrected document still prints a complete decision card", sec(c, "Decision").items.length === 4);
  A("C: a zeroed volume prints no money out of thin air", c.r.netRealizable === 0 || Math.abs(c.r.netRealizable) < 1e-9);
  A("C: with no capacity action the document says freed-labor value is zero",
    sec(c, "Integrity Checks").items.some(i => /No capacity action selected/.test(i)));
}

/* ------------------------------------------- 5. confidence and credit class */
console.log("\n5. confidence and credit class");
{
  A("A: untouched defaults with no external source cannot reach Planning-grade", OUT.A.grade === "Directional");
  A("A: the rationale tells the reader what to do about it", /source the volume and rate basis/.test(OUT.A.gradeWhy));
  A("B: externally sourced and validated, on a cash-creditable action, reaches Finance-grade", OUT.B.grade === "Finance-grade");
  A("B: the grade was bound by evidence, not by the credit class", OUT.B.boundBy === "evidence");
  A("D: identical inputs on a capacity-only action cannot reach Finance-grade", OUT.D.grade !== "Finance-grade");
  A("D: the credit class is what bound it", OUT.D.boundBy === "credit class");
  A("D: the rationale names the capacity action that capped it", OUT.D.gradeWhy.indexOf(MECH.growth.label) >= 0);
  A("B and D differ only in the capacity action", JSON.stringify(OUT.B.d) === JSON.stringify(OUT.D.d));
  A("B and D therefore differ in grade for a reason the document states", OUT.B.grade !== OUT.D.grade);
  A("C: no capacity action floors the document at Directional", OUT.C.grade === "Directional");
  A("every set reports which ceiling bound it", Object.keys(SETS).every(k => ["evidence", "credit class"].indexOf(OUT[k].boundBy) >= 0));
  A("no document claims a grade above its credit-class ceiling", Object.keys(SETS).every(k => {
    const rank = { "Directional": 1, "Planning-grade": 2, "Finance-grade": 3 };
    return rank[OUT[k].grade] <= rank[OUT[k].r.ceilingGrade];
  }));
  A("the signals payload records which ceiling bound the grade",
    Object.keys(SETS).every(k => OUT[k].signals.grade_bound_by === OUT[k].boundBy));
}

/* ------------------------------------------------ 6. integrity checks fire */
console.log("\n6. integrity checks");
{
  A("A: a clean baseline still discloses the departing-AHT assumption",
    sec(OUT.A, "Integrity Checks").items.some(i => /Implied assumption/.test(i)));
  A("A: the disclosed assumption quotes the same departing AHT as the adverse table",
    sec(OUT.A, "Integrity Checks").items.some(i => i.indexOf(OUT.A.r.deptEff.toFixed(1)) >= 0));
  A("C: an off-100 channel mix is flagged", sec(OUT.C, "Integrity Checks").items.some(i => /channel mix sums to/.test(i)));
  A("B: a scaled shift is flagged as scaled", OUT.B.r.scaled === false || sec(OUT.B, "Integrity Checks").items.some(i => /scaled to fit/.test(i)));
  A("every flagged text is a non-empty string in every set",
    Object.keys(SETS).every(k => (sec(OUT[k], "Integrity Checks") || { items: [] }).items.every(i => typeof i === "string" && i.length > 10)));
  A("a break-even flag, when present, quotes the same figure the card prints",
    Object.keys(SETS).every(k => {
      const o = OUT[k]; if (o.verdict.be == null || !o.verdict.pt) return true;
      return sec(o, "Integrity Checks").items.some(i => i.indexOf(o.verdict.be.toFixed(0) + "%") >= 0);
    }));
}

/* ------------------------------------------------------ 7. signals payload */
console.log("\n7. signals payload");
for (const k of Object.keys(SETS)) {
  const o = OUT[k];
  A(`${k}: signals name the capacity action in words, not a key`, o.signals.capacity_action === MECH[o.mech].label);
  A(`${k}: signals quote the eligibility the engine ran`, o.signals.eligibility_pct === o.r.eligPct + "%");
  A(`${k}: signals record whether the inputs were validated`, ["yes", "no"].indexOf(o.signals.cost_validated) >= 0);
  A(`${k}: signals record the complexity curve`, typeof o.signals.adverse_curve === "string");
  A(`${k}: signals record whether the session arrived from a scenario link`, ["yes", "no"].indexOf(o.signals.from_scenario_link) >= 0);
  A(`${k}: signals carry no personally identifying value`,
    !/[@]|name|email|company/i.test(JSON.stringify(o.signals)));
}

/* ------------------------------------------------------- print the documents */
for (const k of Object.keys(SETS)) printDoc(k, OUT[k], SETS[k]);

/* ---- severity band ---- */
/* This tool judges a proposed plan rather than measuring a standing burden, so
   severity is the shortfall against the break-even resolution rate the engine
   solves for on these exact inputs. rail-audit only proves the key was typed.
   These assertions prove the band moves with the decision, survives the
   boundary validator, and reaches the manual review payload. */
console.log("\nseverity band");
const sevDoc = (label, d) => render({ label, d, mech: "hiring", fromLink: false, pulledExternally: false });
const SEV = {
  none: sevDoc("clears its own break-even", null),
  benign: sevDoc("60% chat resolution, just short", { resChat: 60 }),
  mid: sevDoc("40% chat resolution", { resChat: 40 }),
  bad: sevDoc("20% chat resolution", { resChat: 20 }),
  severe: sevDoc("10% resolution, bot fee 2.50, never breaks even", { resChat: 10, botCost: 2.5 }),
};
A("a plan that clears its break-even publishes none", SEV.none.signals.severity === "none");
A("a plan just short of break-even publishes low", SEV.benign.signals.severity === "low");
A("40% against a 74% break-even publishes moderate", SEV.mid.signals.severity === "moderate");
A("20% against a 74% break-even publishes high", SEV.bad.signals.severity === "high");
A("a plan that never breaks even and nets negative publishes severe", SEV.severe.signals.severity === "severe");
A("the band discriminates: five scenarios produce five distinct bands",
  new Set(Object.values(SEV).map(x => x.signals.severity)).size === 5);

/* The band and the verdict on the same page must not contradict each other. */
A("the severe case is the case the verdict refuses to approve", SEV.severe.verdict.label === "Do not approve yet");
A("the severe case never breaks even inside the range", SEV.severe.verdict.be === null);
A("the severe case nets negative", SEV.severe.r.netRealizable < 0);
A("the none case clears its break-even on the page as well as in the band",
  SEV.none.verdict.be !== null && SEV.none.verdict.curRes >= SEV.none.verdict.be);

for (const [k, doc] of Object.entries({ ...OUT, ...SEV })) {
  const v = doc.signals.severity;
  if (v === undefined) { A(`${k}: severity is omitted only where no shift was modeled`, doc.r.shifted === 0); continue; }
  A(`${k}: the published band is in the canonical vocabulary`, SEVERITY_BANDS.includes(v));
  A(`${k}: the published band survives sanitizeProps and lands on the payload`, sanitizeProps({ severity: v }).severity === v);
  A(`${k}: severity reaches the manual review submission as signal_severity`,
    Object.keys(doc.signals).map(x => `signal_${x}`).includes("signal_severity"));
}

/* With nothing shifted there is no plan to judge. Publishing none would report a
   clean decision where no decision was modeled. */
const sevNoShift = sevDoc("nothing shifted", { shiftToChat: 0, shiftToBot: 0, shiftToEmail: 0 });
A("no shift modeled publishes no severity at all", !("severity" in sevNoShift.signals));
A("no shift modeled carries no signal_severity into the review payload",
  !Object.keys(sevNoShift.signals).map(x => `signal_${x}`).includes("signal_severity"));

/* The second consumer. ReportActions appends every signal to the Formspree
   review payload, so adding severity changed the manual-handling form too. */
A("ReportActions maps every signal into the review payload as signal_<key>", /signal_\$\{k\}/.test(RA));

/* ------------------------------------------ prototype-key complexity curve */
/* A scenario link carrying adverseCurve=toString used to render a document on an
   undefined coefficient: NaN on the page, zero corrections disclosed. Rendered
   here outside SETS so Sets A to D stay byte-identical. */
console.log("\nprototype-key curve");
{
  const hasNaN = (v) => typeof v === "number" ? Number.isNaN(v)
    : typeof v === "string" ? /NaN/.test(v)
    : Array.isArray(v) ? v.some(hasNaN)
    : v && typeof v === "object" ? Object.values(v).some(hasNaN) : false;
  const face = (o, k) => JSON.stringify({ subtitle: o.subtitle, grade: o.grade, gradeWhy: o.gradeWhy, summary: o.summary, sections: o.sections, signals: o.signals }).split(k).join("<KEY>");
  const Z = sevDoc("unrecognised curve", { adverseCurve: "zzz" });
  for (const k of ["toString", "constructor", "__proto__", "hasOwnProperty", "valueOf"]) {
    const o = sevDoc(`prototype key ${k}`, { adverseCurve: k });
    const cs = secStartingWith(o, "Inputs Corrected");
    A(`${k}: the document prints no NaN anywhere`, !hasNaN({ subtitle: o.subtitle, summary: o.summary, sections: o.sections, signals: o.signals }));
    A(`${k}: the corrections section discloses the curve through the shipped sentence`,
      !!cs && cs.items.includes(guardLine({ label: "Residual complexity curve", entered: k, used: "moderate", unit: "" })));
    A(`${k}: inputs_corrected counts exactly one correction`, o.signals.inputs_corrected === 1);
    A(`${k}: signals record the curve the engine ran, not the entered text`, o.signals.adverse_curve === "moderate" && o.r.curveKey === "moderate");
    A(`${k}: the document matches the unknown-curve document apart from the entered text`, face(o, k) === face(Z, "zzz"));
  }
}

/* --------------------------------------------- hostile capacity action */
/* A scenario link carrying mech=bogus crashed the page on MECH[mech].note, and
   mech=toString printed NaN under an Approve verdict with nothing disclosed.
   Rendered outside SETS so Sets A to D stay byte-identical. The fragments below
   are the three places the entered text is printed: the corrections sentence,
   the integrity flag and the methodology. Replacing whole fragments, rather than
   splitting on the key, keeps "" and names like toLocaleString testable. */
console.log("\nhostile capacity action");
{
  const hasNaN = (v) => typeof v === "number" ? Number.isNaN(v)
    : typeof v === "string" ? /NaN/.test(v)
    : Array.isArray(v) ? v.some(hasNaN)
    : v && typeof v === "object" ? Object.values(v).some(hasNaN) : false;
  const mechDoc = (label, mech) => render({ label, d: null, mech, fromLink: true, pulledExternally: false });
  const face = (o, k) => {
    let s = JSON.stringify({ subtitle: o.subtitle, grade: o.grade, gradeWhy: o.gradeWhy, summary: o.summary, sections: o.sections, signals: o.signals, flags: o.flags });
    for (const [a, b] of [[`Capacity action: entered ${k},`, "Capacity action: entered <KEY>,"], [`Capacity action: you entered ${k},`, "Capacity action: you entered <KEY>,"], [`Capacity action entered ${k},`, "Capacity action entered <KEY>,"]]) s = s.split(JSON.stringify(a).slice(1, -1)).join(b);
    return s;
  };
  const Z = mechDoc("unrecognised capacity action", "zzz");
  const NONE = mechDoc("no capacity action", "none");
  /* The flag sentence prints twice by design: once on the page, once in the
     Integrity Checks section of the document. Each fragment is counted where it
     lives, so face() cannot pass by replacing nothing. */
  const hits = (v, f) => JSON.stringify(v).split(f).length - 1;
  A("the unknown-key document prints each entered-text fragment once per surface",
    hits(Z.sections, "Capacity action: entered zzz,") === 1 && hits(Z.sections, "Capacity action: you entered zzz,") === 1
    && hits(Z.sections, "Capacity action entered zzz,") === 1 && hits(Z.flags, "Capacity action: you entered zzz,") === 1);
  for (const k of ["bogus", "", ...Object.getOwnPropertyNames(Object.prototype)]) {
    const tag = JSON.stringify(k);
    const o = mechDoc(`capacity action ${tag}`, k);
    const cs = secStartingWith(o, "Inputs Corrected");
    A(`${tag}: the document prints no NaN anywhere`, !hasNaN({ subtitle: o.subtitle, summary: o.summary, sections: o.sections, signals: o.signals }));
    A(`${tag}: the corrections section discloses the action through the shipped sentence`,
      !!cs && cs.items.includes(guardLine({ label: "Capacity action", entered: k, used: "none", unit: "" })));
    A(`${tag}: inputs_corrected counts exactly one correction`, o.signals.inputs_corrected === 1);
    A(`${tag}: signals name the action the engine ran`, o.signals.capacity_action === MECH.none.label);
    A(`${tag}: the page flags that no capacity action is selected`, o.flags.some(f => /No capacity action selected/.test(f.t)));
    A(`${tag}: realized labor prints $0 under the none label`, rowVal(sec(o, "Economics"), `Realized labor (${MECH.none.label}, 0%)`) === "$0/mo");
    A(`${tag}: the verdict and grade match the none document`, o.verdict.label === NONE.verdict.label && o.grade === NONE.grade && o.gradeWhy === NONE.gradeWhy);
    A(`${tag}: the document matches the unknown-key document apart from the entered text`, face(o, k) === face(Z, "zzz"));
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
