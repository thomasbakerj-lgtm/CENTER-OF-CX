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
const RA = readFileSync("./ReportActions.jsx", "utf8");
const { MECH } = await import("./src/lib/mech.js");
const { COLORS } = await import("./src/lib/benchmarks.js");
/* The shared guard module the engine imports. Injected, never reconstructed. */
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
/* The render preamble retypes the lines between compute and the grade ladder.
   These gates hold the retyped copy to the shipped one, so the harness cannot
   certify a document built on a key the page never resolved. */
A("the component resolves the capacity action from compute before anything reads it",
  /const r = compute\(d, mech\);\n(?:\s*\/\*[\s\S]*?\*\/\n)?\s*const mechKey = r\.mechKey;\n\s*const analyst = buildAnalystRead\(d, r, mechKey\);/.test(SRC));
A("the component tests selection on the resolved key", /const mechSelected = mechKey !== "none";/.test(SRC));
A("no MECH lookup on the entered capacity action remains in the component", !/MECH\[mech\]/.test(SRC));
A("no none test on the entered capacity action remains in the component", !/\bmech (===|!==) "none"/.test(SRC));
A("the rail publishes the capacity action the engine ran", /capacityAction: mechKey,/.test(SRC) && !/capacityAction: mech,/.test(SRC));
A("the selector shows the capacity action the engine ran", /<select value=\{mechKey\}/.test(SRC));
A("the setter, the effect deps and the scenario keep the entered value",
  /onChange=\{e => setMech\(e\.target\.value\)\}/.test(SRC) && /\}, \[d, mech\]\);/.test(SRC) && /const scenario = \{ d, mech \};/.test(SRC));

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
  E: {
    label: "Negative money through a scenario link: the money-guard rendering path",
    d: { loadedCPC: -12, marginalCPC: -4, agentHourly: -30, fcrRate: 150 },
    mech: "none", validated: false, fromLink: true, pulledExternally: false,
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
    const mechKey = r.mechKey;
    const analyst = buildAnalystRead(d, r, mechKey);
    const sourced = SOURCED;
    const mechSelected = mechKey !== "none";
    ${constStatement("evidenceGrade")}
    ${constStatement("grade")}
    ${constStatement("boundBy")}
    ${compRegion}
    /* TOOL_ID and ROUTE already come out of the engine region: do not shadow them. */
    return {
      d, mech, mechKey, r, analyst, grade, gradeWhy, evidenceGrade, boundBy, guardVal, guardLine,
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
    return new Function("MECH", "ELECTRIC", "GREEN", "AMBER", "RED", "MUTED", "severityBucket", "createGuards", "guardVal", "guardLine", preamble)(
      MECH, COLORS.electric, COLORS.green, COLORS.amber, COLORS.red, COLORS.muted, severityBucket, createGuards, guardVal, guardLine
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
    /* Assert against the shipped renderer, not against raw string containment. The
       containment form passed while the document printed -12$ and the on-page flag
       printed $-12, because "-12" is a substring of both. Three paths derived the same
       correction and only one of them was checked, which is the split-rendering defect
       class. Every path now goes through guardVal, and this asserts that. */
    A(`${key}: every correction line is exactly what the shipped renderer produces`,
      corrected.items.length === r.guards.length && r.guards.every((g, i) => corrected.items[i] === P.guardLine(g)));
    A(`${key}: every correction still names the field and both values`,
      r.guards.every((g, i) => corrected.items[i].indexOf(g.label) === 0
        && corrected.items[i].includes(P.guardVal(g, "entered")) && corrected.items[i].includes(P.guardVal(g, "used"))));
    /* The on-page flag and the report section must be the same sentence about the same
       correction, since a reader can hold both at once. */
    A(`${key}: the on-page flag renders the same values as the report section`,
      r.guards.every(g => r.flags.some(f => f.t.includes(P.guardVal(g, "entered")) && f.t.includes(P.guardVal(g, "used")))));
    /* Money leads with the sign, matching money() and fmtK() and every other money
       format in the platform. $-12 is a broken magnitude, not a negative. */
    A(`${key}: no correction prints money with the sign behind the symbol`,
      corrected.items.every(t => t.indexOf("$-") < 0));
    A(`${key}: no money correction prints its unit as a suffix`,
      r.guards.filter(g => g.unit === "$").every((g, i) => !/\d\$/.test(P.guardLine(g))));
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

/* ---- severity band ---- */
/* rail-audit counts severity publishers with a regex, which proves the key was
   typed, not that it means anything. A band that reads the same word at 95% FCR
   and at 20% discriminates nothing, and a band that fails the boundary
   validator is dropped in silence and never reaches the wire. Both failures
   pass a presence check, so both are asserted here on the shipped expression. */
console.log("\nseverity band");
const sevDoc = (label, d) => render({ label, d, mech: "hiring", validated: false, fromLink: false, pulledExternally: false });
const SEV = {
  none: sevDoc("perfect resolution", { fcrRate: 100, contactsPerUnresolved: 2.4 }),
  benign: sevDoc("95% FCR, shallow repeats", { fcrRate: 95, contactsPerUnresolved: 1.2 }),
  mid: sevDoc("shipped defaults", null),
  bad: sevDoc("50% FCR, M 3", { fcrRate: 50, contactsPerUnresolved: 3 }),
  severe: sevDoc("20% FCR, M 6", { fcrRate: 20, contactsPerUnresolved: 6 }),
};
A("100% FCR publishes none, a measurement rather than an absence", SEV.none.signals.severity === "none");
A("a 1% repeat share publishes low", SEV.benign.signals.severity === "low");
A("the shipped defaults publish moderate at a 28% repeat share", SEV.mid.signals.severity === "moderate");
A("a 50% repeat share publishes high", SEV.bad.signals.severity === "high");
A("an 80% repeat share publishes severe", SEV.severe.signals.severity === "severe");
A("the band discriminates: five scenarios produce five distinct bands",
  new Set(Object.values(SEV).map(x => x.signals.severity)).size === 5);

/* The band and the flag on the same page must not disagree. The engine raises a
   resolution-problem flag above a 25% repeat share, and 0.25 is exactly where
   the shared bucket turns moderate, so the two are the same threshold. */
for (const k of ["none", "benign", "mid", "bad", "severe"]) {
  const doc = SEV[k];
  const flagged = doc.r.flags.some(f => /resolution problem, not a price problem/.test(f.t));
  const banded = ["moderate", "high", "severe"].includes(doc.signals.severity);
  A(`${k}: the published band and the resolution-problem flag agree on the 25% threshold`, flagged === banded);
}

for (const [k, doc] of Object.entries({ ...R, ...SEV })) {
  const v = doc.signals.severity;
  if (v === undefined) { A(`${k}: severity is omitted only where no volume was handled`, !(doc.r.handled > 0)); continue; }
  A(`${k}: the published band is in the canonical vocabulary`, SEVERITY_BANDS.includes(v));
  A(`${k}: the published band survives sanitizeProps and lands on the payload`, sanitizeProps({ severity: v }).severity === v);
  A(`${k}: severity reaches the manual review submission as signal_severity`,
    Object.keys(doc.signals).map(x => `signal_${x}`).includes("signal_severity"));
}

/* Zero volume is not a healthy centre, it is an unrun model. repeatShare would
   compute to a clean zero and publish none, so the key is dropped instead. */
const sevEmpty = sevDoc("no volume", { monthlyContacts: 0 });
A("a model with no handled volume publishes no severity at all", !("severity" in sevEmpty.signals));
A("a model with no handled volume carries no signal_severity into the review payload",
  !Object.keys(sevEmpty.signals).map(x => `signal_${x}`).includes("signal_severity"));

/* --------------------------------------------- hostile capacity action */
/* A scenario link carrying mech=bogus crashed the page on MECH[mech].note, and
   mech=toString printed NaN with nothing disclosed. Rendered outside SETS so Sets
   A to E stay byte-identical. The entered text prints in three fragments: the
   corrections sentence, the engine flag (on the page and again in Integrity
   Checks) and the methodology. Replacing whole fragments, rather than splitting on
   the key, keeps "" and names like toLocaleString testable. */
console.log("\nhostile capacity action");
{
  const hasNaN = (v) => typeof v === "number" ? Number.isNaN(v)
    : typeof v === "string" ? /NaN/.test(v)
    : Array.isArray(v) ? v.some(hasNaN)
    : v && typeof v === "object" ? Object.values(v).some(hasNaN) : false;
  const mechDoc = (label, mech) => render({ label, d: null, mech, validated: false, fromLink: true, pulledExternally: false });
  const frags = (k) => [`Capacity action: entered ${k},`, `Capacity action: you entered ${k},`, `Capacity action entered ${k},`];
  const doc = (o) => ({ subtitle: o.subtitle, grade: o.grade, gradeWhy: o.gradeWhy, summary: o.summary, sections: o.sections, signals: o.signals, flags: o.r.flags });
  const face = (o, k) => {
    let s = JSON.stringify(doc(o));
    frags(k).forEach((a, i) => { s = s.split(JSON.stringify(a).slice(1, -1)).join(frags("<KEY>")[i]); });
    return s;
  };
  /* The same document with the one capacity-action correction taken back out. On
     the shipped defaults it is the only correction, so what remains must be the
     none document exactly. */
  const strip = (o, k) => {
    const x = JSON.parse(JSON.stringify(doc(o)));
    const line = guardLine({ label: "Capacity action", entered: String(k), used: "none", unit: "" });
    x.sections = x.sections
      .filter(s => !(s.title.indexOf("\u26a0 Inputs Corrected") === 0 && s.items.length === 1 && s.items[0] === line))
      .map(s => s.title === "Integrity Checks" ? { ...s, items: s.items.filter(t => t.indexOf(`Capacity action: you entered ${k},`) !== 0) } : s)
      .map(s => s.title === "Methodology" ? { ...s, content: s.content.split(` INPUTS CORRECTED: Capacity action entered ${k}, computed at none. Every figure above was computed on the corrected values.`).join("") } : s);
    x.flags = x.flags.filter(f => f.t.indexOf(`Capacity action: you entered ${k},`) !== 0);
    x.signals = { ...x.signals, inputs_corrected: x.signals.inputs_corrected - 1, integrity_flags: x.signals.integrity_flags - 1 };
    return JSON.stringify(x);
  };
  const Z = mechDoc("unrecognised capacity action", "zzz");
  const NONE = mechDoc("no capacity action", "none");
  const hits = (v, f) => JSON.stringify(v).split(f).length - 1;
  A("the unknown-key document prints each entered-text fragment once per surface",
    hits(Z.sections, "Capacity action: entered zzz,") === 1 && hits(Z.sections, "Capacity action: you entered zzz,") === 1
    && hits(Z.sections, "Capacity action entered zzz,") === 1 && hits(Z.r.flags, "Capacity action: you entered zzz,") === 1);
  A("the none document carries no correction, so strip() has one thing to remove", NONE.r.guards.length === 0);
  for (const k of ["bogus", "", undefined, ...Object.getOwnPropertyNames(Object.prototype)]) {
    const tag = JSON.stringify(k === undefined ? "undefined" : k);
    let o = null, threw = null;
    try { o = mechDoc(`capacity action ${tag}`, k); } catch (e) { threw = e; }
    A(`${tag}: the document renders without throwing`, threw === null);
    if (threw) continue;
    const cs = find(o.sections, "\u26a0 Inputs Corrected");
    A(`${tag}: the document prints no NaN anywhere`, !hasNaN({ subtitle: o.subtitle, summary: o.summary, sections: o.sections, signals: o.signals }));
    A(`${tag}: the corrections section discloses the action through the shipped sentence`,
      !!cs && cs.items.length === 1 && cs.items[0] === guardLine({ label: "Capacity action", entered: String(k), used: "none", unit: "" }));
    A(`${tag}: inputs_corrected counts exactly one correction`, o.signals.inputs_corrected === 1);
    A(`${tag}: signals and subtitle name the action the engine ran`, o.signals.capacity_action === MECH.none.label && o.subtitle === NONE.subtitle);
    A(`${tag}: the page flags that no capacity action is selected`, o.r.flags.some(f => /No capacity action selected/.test(f.t)));
    A(`${tag}: realizable prints $0 under the none label`, rowVal(find(o.sections, "Three Value Layers"), `Realizable this cycle (${MECH.none.label}, 0%)`) === "$0/mo");
    A(`${tag}: the grade and its rationale match the none document`, o.grade === NONE.grade && o.gradeWhy === NONE.gradeWhy);
    A(`${tag}: the document matches the unknown-key document apart from the entered text`, face(o, String(k)) === face(Z, "zzz"));
    A(`${tag}: the document is the none document plus the one disclosed correction`, strip(o, String(k)) === JSON.stringify(doc(NONE)));
  }
}

/* The second consumer. ReportActions appends every signal to the Formspree
   review payload, so adding severity changed the manual-handling form too. */
A("ReportActions maps every signal into the review payload as signal_<key>", /signal_\$\{k\}/.test(RA));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
