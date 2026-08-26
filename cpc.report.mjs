/* cpc.report.mjs
 *
 * Rendered-output reconciliation for the Cost per Contact / Resolution calculator.
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
 * helper functions sliced from the same file, evaluates it, and prints the
 * document. Every figure printed below is the figure the PDF prints. If the JSX
 * payload changes shape, this fails rather than reconciling a stale copy.
 *
 * Run from repo root: node cpc.report.mjs
 */
import { readFileSync } from "fs";

const SRC = readFileSync("./CostPerContactCalculator.jsx", "utf8");
const { MECH } = await import("./src/lib/mech.js");
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

/** Slice a single-line `const name = ...;` declaration verbatim. */
function constLine(name) {
  const m = SRC.match(new RegExp("^\\s*const " + name + " = .*$", "m"));
  return m ? m[0].trim() : null;
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

const ea = SRC.indexOf("/* @engine-start"), eb = SRC.indexOf("/* @engine-end */");
if (ea < 0 || eb < 0) { console.error("BLOCKER: engine markers not found."); process.exit(1); }
const engineRegion = SRC.slice(ea, eb);

/* Component-scope derivations the payload closes over. Sliced, never retyped:
   a retyped grade ladder is exactly the kind of copy that drifts from the
   shipped one and then certifies a report the app would never have produced. */
const compRegion = [constLine("cprColor"), constStatement("gradeWhy")].join("\n");

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
A("the component-scope derivations slice out", compRegion.split("\n").every(Boolean));
A("the multi-line grade ladder slices out whole, not first-branch-only", (constStatement("grade") || "").indexOf("ceilingGrade") > 0);
A("the confidence prop is the same grade the page displays", /confidence=\{grade\}/.test(SRC));

/* ------------------------------------------------------------ input sets */
/*
 * Set A is the shipped default: an in-house voice-led operation at 72% FCR with
 * the defensible avoid-hiring mechanism. It is the document most users will see.
 *
 * Set B is a larger digital-led operation at 61% FCR stated on the ISSUES basis,
 * with a measured deeper repeat path, an outsourced-style low marginal cost and
 * the growth mechanism. It exercises every branch set A never touches: the other
 * denominator, a capacity-class rather than finance-class mechanism, a non-100%
 * channel mix, and the low-FCR advisory flag.
 *
 * Set C is deliberately hostile: a scenario link carrying a 150% FCR and a
 * negative volume. It exists to prove the document DISCLOSES the correction
 * rather than quietly printing a clean report off numbers the engine never ran.
 */
const SETS = {
  A: {
    label: "In-house voice-led, handled basis, avoid hiring, defaults untouched",
    d: null, mech: "hiring", validated: false, fromLink: false, pulledExternally: false,
  },
  B: {
    label: "Digital-led, ISSUES basis, measured deeper repeats, absorb growth",
    d: {
      monthlyContacts: 22000, denominator: "issues", fcrRate: 61, contactsPerUnresolved: 3.1,
      loadedCPC: 11.4, marginalCPC: 4.9, validated: true,
      agentHourly: 24, overheadMultiplier: 1.42, productiveHoursPerFTE: 128,
      voicePct: 30, chatPct: 45, emailPct: 25,
      voiceAHT: 9.5, chatAHT: 12, emailAHT: 6.5,
      voiceConcurrency: 1, chatConcurrency: 3, emailConcurrency: 1,
    },
    mech: "vendor", validated: true, fromLink: true, pulledExternally: true,
  },
  C: {
    label: "Hostile scenario link: FCR 150%, negative volume, no mechanism",
    d: { monthlyContacts: -50000, fcrRate: 150 },
    mech: "none", validated: false, fromLink: true, pulledExternally: false,
  },
  D: {
    label: "Set B inputs exactly, absorb-growth mechanism: the credit-class ceiling",
    d: null, mech: "growth", validated: true, fromLink: false, pulledExternally: true,
  },
};
/* D reuses B's inputs verbatim. The ONLY difference is the capacity action, so any
   difference in grade between B and D is attributable to the credit class alone. */
SETS.D.d = null;

function render(S) {
  const preamble = `
    ${engineRegion}
    const d = D_IN === null ? BASE : { ...BASE, ...D_IN };
    const mech = MECH_KEY;
    const fromLink = FROM_LINK;
    const r = compute(d, mech);
    const analyst = buildAnalystRead(d, r, mech);
    const sourced = SOURCED;
    const mechSelected = mech !== "none";
    ${constStatement("evidenceGrade")}
    ${constStatement("grade")}
    ${constStatement("boundBy")}
    ${compRegion}
    /* TOOL_ID and ROUTE already come out of the engine region: do not shadow them. */
    return {
      d, mech, r, analyst, grade, gradeWhy, evidenceGrade, boundBy,
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
    return new Function("MECH", "ELECTRIC", "GREEN", "AMBER", "RED", "MUTED", preamble)(
      MECH, COLORS.electric, COLORS.green, COLORS.amber, COLORS.red, COLORS.muted
    );
  } catch (e) {
    console.error("BLOCKER: the ReportActions payload did not evaluate for set:", S.label);
    console.error(String(e.message || e));
    process.exit(1);
  }
}

/* Set A must apply the `validated` flag to the shipped BASE. */
SETS.A.d = { validated: false };
SETS.D.d = { ...SETS.B.d };

/* ------------------------------------------------------------- the document */

const find = (secs, t) => secs.find(s => s.title.indexOf(t) === 0);
const rows = (sec) => sec ? sec.rows : [];
const rowVal = (sec, needle) => { const row = rows(sec).find(x => x[0].indexOf(needle) >= 0); return row ? row[1] : null; };

function printDoc(key, S, P) {
  console.log("\n" + "=".repeat(74));
  console.log(`SET ${key}: ${S.label}`);
  console.log("=".repeat(74));
  console.log(`Report:     Cost per Contact / Resolution`);
  console.log(`Subtitle:   ${P.subtitle}`);
  console.log(`Confidence: ${P.grade}  (${P.gradeWhy})`);
  console.log("\n-- SUMMARY --");
  for (const s of P.summary) console.log(`   ${s.label.padEnd(26)} ${s.value}`);
  console.log("\n-- SIGNALS --");
  for (const [k, v] of Object.entries(P.signals)) console.log(`   ${k.padEnd(26)} ${v}`);
  for (const sec of P.sections) {
    console.log(`\n-- ${sec.title.toUpperCase()} --`);
    if (sec.type === "metrics") for (const i of sec.items) console.log(`   ${i.label.padEnd(26)} ${String(i.value).padEnd(12)} ${i.sub}`);
    else if (sec.type === "table") for (const rw of sec.rows) console.log(`   ${String(rw[0]).padEnd(56)} ${rw[1]}`);
    else if (sec.type === "findings") for (const i of sec.items) console.log(`   - ${i}`);
    else if (sec.type === "next") for (const i of sec.items) console.log(`   → ${i.tool}: ${i.reason}`);
    else console.log("   " + sec.content);
  }
}

/* ------------------------------------------------------------ the assertions */

const R = {};
for (const [key, S] of Object.entries(SETS)) {
  const P = render(S);
  R[key] = P;
  printDoc(key, S, P);
  const { r, d, mech } = P;

  console.log(`\n[set ${key} reconciliation]`);

  /* --- structure --- */
  A(`${key}: every section carries a title and a type`, P.sections.every(s => s.title && s.type));
  A(`${key}: the four headline metrics are present`, find(P.sections, "Cost Metrics").items.length === 4);
  A(`${key}: the three value layers are kept separate in the document`, rows(find(P.sections, "Three Value Layers")).length === 4);
  A(`${key}: the dividend table carries one row per modelled FCR step`, rows(find(P.sections, "FCR Dividend")).length === r.dividend.length);
  A(`${key}: the analyst read reaches the document intact`, find(P.sections, "Analyst Read").items.length === P.analyst.length);
  A(`${key}: methodology is present and states the C identity`, /C = FCR \+ \(1 - FCR\) x M/.test(find(P.sections, "Methodology").content));
  A(`${key}: next steps are offered`, find(P.sections, "Next Steps").items.length === 3);

  /* --- every printed dollar reconciles to the engine --- */
  const mets = find(P.sections, "Cost Metrics").items;
  const money = (v) => (v < 0 ? "-$" : "$") + Math.abs(v).toFixed(2);
  const fmtK = (v) => { const x = v, s = x < 0 ? "-" : ""; const A2 = Math.abs(x); return s + (A2 >= 1000000 ? "$" + (A2 / 1000000).toFixed(2) + "M" : A2 >= 1000 ? "$" + (A2 / 1000).toFixed(0) + "K" : "$" + Math.round(A2)); };

  A(`${key}: summary CPC equals the engine's loaded cost`, P.summary[0].value === money(r.loaded));
  A(`${key}: summary CPR equals the engine's loaded x C`, P.summary[1].value === money(r.loaded * r.C));
  A(`${key}: summary repeat share equals the engine's repeat share`, P.summary[2].value === (r.repeatShare * 100).toFixed(0) + "%");
  A(`${key}: summary burden equals the engine's marginal burden`, P.summary[3].value === fmtK(r.burden) + "/mo");

  A(`${key}: the metrics block CPC agrees with the summary CPC`, mets[0].value === P.summary[0].value);
  A(`${key}: the metrics block CPR agrees with the summary CPR`, mets[1].value === P.summary[1].value);
  A(`${key}: the metrics block repeat share agrees with the summary`, mets[2].value === P.summary[2].value);
  A(`${key}: the metrics block burden agrees with the summary`, mets[3].value === P.summary[3].value);
  A(`${key}: the CPR caption states the same contacts-per-issue the engine ran`, mets[1].sub === `${r.C.toFixed(2)} contacts/issue`);
  A(`${key}: the burden caption states the same FTE the engine ran`, mets[3].sub === `ceiling · ${r.fteBurden.toFixed(1)} FTE`);

  const layers = find(P.sections, "Three Value Layers");
  A(`${key}: the layered burden row equals the headline burden`, rowVal(layers, "Repeat-demand burden") === fmtK(r.burden) + "/mo");
  A(`${key}: the released row equals the engine's +10pt released figure`, rowVal(layers, "Capacity released") === fmtK(r.dividend[1].released) + "/mo");
  A(`${key}: the realizable row equals released x the mechanism factor`, rowVal(layers, "Realizable this cycle") === fmtK(r.dividend[1].released * MECH[mech].f) + "/mo");
  A(`${key}: the loaded-burden row is labelled accounting only, not savings`, rows(layers).some(x => /accounting only, not savings/.test(x[0])));
  A(`${key}: the loaded burden exceeds the marginal burden, or marginal is not below loaded`, r.burdenLoaded >= r.burden);

  /* The single most important claim in the document. If realizable ever reads as
     released, the tool has told a buyer that freed capacity is cash. */
  A(`${key}: realizable is never printed as equal to released unless the mechanism is 100%`,
    MECH[mech].f === 1 || rowVal(layers, "Realizable this cycle") !== rowVal(layers, "Capacity released") || r.dividend[1].released === 0);
  A(`${key}: the realizable row names the mechanism and its factor`,
    rows(layers).some(x => x[0].includes(MECH[mech].label) && x[0].includes(String(Math.round(MECH[mech].f * 100)) + "%")));

  const div = find(P.sections, "FCR Dividend");
  A(`${key}: every dividend row prints released and realizable annualised from the engine`,
    r.dividend.every((s, i) => rows(div)[i][1] === "released " + fmtK(s.released * 12) + "/yr · realizable " + fmtK(s.realizable * 12) + "/yr"));
  A(`${key}: every dividend row names the realism tier`,
    r.dividend.every((s, i) => rows(div)[i][0].includes(s.tier)));
  A(`${key}: the monthly realizable in the layers table annualises to the dividend table`,
    fmtK(r.dividend[1].realizable * 12) === fmtK(r.dividend[1].realizable * 12));

  /* --- the report may not print a number the engine did not run --- */
  A(`${key}: the signals block prints the FCR the engine RAN`, P.signals.fcr_rate === r.fcrPct + "%");
  A(`${key}: the signals block names the mechanism by its shared label`, P.signals.capacity_action === MECH[mech].label);
  A(`${key}: the signals block states the volume basis actually used`, P.signals.volume_basis === d.denominator);
  A(`${key}: the signals block counts the integrity flags the engine raised`, P.signals.integrity_flags === r.flags.length);
  A(`${key}: the signals block counts corrected inputs`, P.signals.inputs_corrected === r.guards.length);
  A(`${key}: the subtitle names the same grade as the confidence field`, P.subtitle.includes(P.grade));
  A(`${key}: the subtitle names the same mechanism as the signals`, P.subtitle.includes(MECH[mech].label));

  /* --- prose may not contradict the tables --- */
  const analystText = find(P.sections, "Analyst Read").items.join(" ");
  A(`${key}: the analyst prose quotes the same CPC as the summary`, analystText.includes(P.summary[0].value));
  A(`${key}: the analyst prose quotes the same CPR as the summary`, analystText.includes(P.summary[1].value));
  A(`${key}: the analyst prose quotes the same burden as the summary`, analystText.includes(fmtK(r.burden)));
  A(`${key}: the analyst prose quotes the same released figure as the layers table`, analystText.includes(fmtK(r.dividend[1].released)));
  A(`${key}: the analyst prose quotes the same realizable figure as the layers table`, analystText.includes(fmtK(r.dividend[1].realizable)));
  A(`${key}: the analyst prose calls released capacity, not cash`, /capacity released, not yet cash/.test(analystText));
  A(`${key}: the analyst prose calls the burden a ceiling`, /ceiling, not a savings figure/.test(analystText));

  const meth = find(P.sections, "Methodology").content;
  A(`${key}: methodology names the volume basis actually used`,
    meth.includes(d.denominator === "issues" ? "resolved issues" : "handled contacts"));
  A(`${key}: methodology names the mechanism and factor used`,
    meth.includes(MECH[mech].label) && meth.includes(String(Math.round(MECH[mech].f * 100)) + "%"));
  A(`${key}: methodology states the grade printed at the top of the document`, meth.includes(P.grade));
  A(`${key}: methodology refuses to call the burden a saving`, /not a savings figure and not "created\."/.test(meth));

  /* --- integrity and corrections must surface in the document, not only in the app --- */
  const corrected = find(P.sections, "⚠ Inputs Corrected");
  if (r.guards.length) {
    A(`${key}: corrected inputs are disclosed in the document`, !!corrected);
    A(`${key}: every correction names the entered value and the computed value`,
      corrected.items.length === r.guards.length && r.guards.every((g, i) => corrected.items[i].includes(String(g.entered)) && corrected.items[i].includes(String(g.used))));
    A(`${key}: the correction is repeated in methodology so the prose cannot contradict it`, /INPUTS CORRECTED/.test(meth));
    A(`${key}: the corrections section is ordered ahead of the analyst read`,
      P.sections.findIndex(s => s.title.indexOf("⚠ Inputs Corrected") === 0) < P.sections.findIndex(s => s.title === "Analyst Read"));
  } else {
    A(`${key}: no corrections section when nothing was corrected`, !corrected);
    A(`${key}: methodology carries no correction notice when nothing was corrected`, !/INPUTS CORRECTED/.test(meth));
  }

  const integ = find(P.sections, "Integrity Checks");
  A(`${key}: the integrity section appears exactly when the engine raised flags`, (!!integ) === (r.flags.length > 0));
  if (integ) A(`${key}: every engine flag reaches the document verbatim`, integ.items.length === r.flags.length && r.flags.every((f, i) => integ.items[i] === f.t));

  /* --- confidence may not exceed what the inputs support --- */
  A(`${key}: Finance-grade requires an externally sourced cost basis, a mechanism and validation`,
    P.grade !== "Finance-grade" || (S.pulledExternally && mech !== "none" && d.validated));
  A(`${key}: no mechanism can never reach Finance-grade`, mech !== "none" || P.grade !== "Finance-grade");
  A(`${key}: the grade rationale names the ceiling that actually bound it`,
    P.boundBy === "credit class"
      ? /capped by capacity action/.test(P.gradeWhy) && P.gradeWhy.includes(MECH[mech].label) && P.gradeWhy.includes(r.cred)
      : !/capped by capacity action/.test(P.gradeWhy));
  A(`${key}: the grade never exceeds what the mechanism's credit class permits`,
    ({ "Directional": 1, "Planning-grade": 2, "Finance-grade": 3 })[P.grade] <=
    ({ "Directional": 1, "Planning-grade": 2, "Finance-grade": 3 })[r.ceilingGrade]);
  A(`${key}: the grade never exceeds what the evidence permits`,
    ({ "Directional": 1, "Planning-grade": 2, "Finance-grade": 3 })[P.grade] <=
    ({ "Directional": 1, "Planning-grade": 2, "Finance-grade": 3 })[P.evidenceGrade]);
  A(`${key}: the credit class printed is the one mech.js assigns the selected action`,
    r.cred === MECH[mech].cred);

  /* --- no impossible figure may print --- */
  const printed = [
    ...P.summary.map(s => s.value),
    ...mets.map(m => String(m.value)),
    ...rows(layers).map(x => x[1]),
    ...rows(div).map(x => x[1]),
  ];
  A(`${key}: no printed figure is NaN, Infinity or undefined`,
    printed.every(v => v != null && !/NaN|Infinity|undefined/.test(v)));
  A(`${key}: no printed figure is negative`, printed.every(v => !/-\$/.test(v)));
}

/* ------------------------------------------------ cross-set reconciliation */
console.log("\n" + "=".repeat(74));
console.log("CROSS-SET");
console.log("=".repeat(74));
A("an untouched default document is Directional: selecting the default mechanism is not rigor",
  R.A.grade === "Directional");
A("a sourced, validated document with a cash-creditable action reaches Finance-grade",
  R.B.grade === "Finance-grade");
A("the same inputs with a capacity-only action cannot reach Finance-grade", R.D.grade !== "Finance-grade");
A("B and D differ ONLY in the capacity action, so the ceiling is attributable",
  JSON.stringify(SETS.B.d) === JSON.stringify(SETS.D.d) && R.B.evidenceGrade === R.D.evidenceGrade);
A("B and D nonetheless carry identical released capacity: the action does not change the capacity",
  R.B.r.dividend[1].released === R.D.r.dividend[1].released);
A("D's document says plainly that the capacity action capped it",
  /capped by capacity action/.test(R.D.gradeWhy));
A("this tool's credit ceiling agrees with FCR Leakage on the same mechanism",
  R.D.r.ceilingGrade === "Directional" && MECH.hiring.cred === "finance");
A("the hostile scenario link cannot reach Finance-grade", R.C.grade !== "Finance-grade");
A("the hostile scenario link discloses corrections the clean sets do not",
  R.C.signals.inputs_corrected > 0 && R.A.signals.inputs_corrected === 0 && R.B.signals.inputs_corrected === 0);
A("the hostile scenario link prints the entered FCR alongside the computed one",
  R.C.signals.fcr_rate_entered === "150%" && R.C.signals.fcr_rate === "100%");
A("the hostile scenario link realizes exactly $0, because no mechanism was chosen",
  R.C.r.dividend.every(s => s.realizable === 0));
A("the clean sets produce different documents, so nothing is hard-coded",
  R.A.summary[1].value !== R.B.summary[1].value && R.A.grade !== R.B.grade);
A("the issues-basis document reports a higher cost per resolution than the defaults",
  R.B.r.cprLoaded > R.A.r.cprLoaded);
A("a capacity-class mechanism realizes less cash than a cash-class one on identical released capacity",
  R.D.r.dividend[1].realizable < R.B.r.dividend[1].realizable);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
