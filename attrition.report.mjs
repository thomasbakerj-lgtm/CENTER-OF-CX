/* attrition.report.mjs
 *
 * Rendered-output reconciliation for the Attrition Cost Calculator.
 *
 * The engine harness proves the arithmetic. It says nothing about the document a
 * CFO reads, because every figure in the PDF is a separate expression written in
 * JSX, and a passing engine can sit underneath a report that quotes a different
 * number, contradicts itself in prose, or drops a section. That gate found the
 * $100,000 self-contradiction in TCO while 112 assertions were green, and the
 * License Gap Module Coverage table that printed the raw entered module cost three
 * sections after the same document disclosed the value the engine actually used.
 *
 * This file does NOT rebuild the report. It slices the ReportActions payload out
 * of the shipped JSX at runtime, binds it to the real engine sliced from the same
 * file, evaluates it, and prints the document. Every figure checked below is the
 * figure the PDF prints.
 *
 * It also checks the section ReportActions itself injects from the `grades` prop,
 * because as of this tool the three confidence axes are rendered by the shared
 * component rather than by the tool, and a shared renderer that silently drops an
 * axis is a worse defect than a tool that mis-states one.
 *
 * Run from repo root: node attrition.report.mjs
 */
import { readFileSync } from "fs";

const SRC = readFileSync("./AttritionCostCalculator.jsx", "utf8");
const RA = readFileSync("./ReportActions.jsx", "utf8");
const { COLORS } = await import("./src/lib/benchmarks.js");
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
const gradesExpr = prop("grades");
const summaryExpr = prop("summary");
const signalsExpr = prop("signals");
const sectionsExpr = prop("sections");
const toolNameM = SRC.match(/toolName="([^"]+)"/);

console.log("\n0. payload slices out of the shipped JSX");
A("the ReportActions subtitle slices out of the shipped JSX", !!subtitleExpr);
A("the ReportActions grades payload slices out of the shipped JSX", !!gradesExpr);
A("the ReportActions summary payload slices out of the shipped JSX", !!summaryExpr);
A("the ReportActions signals payload slices out of the shipped JSX", !!signalsExpr);
A("the ReportActions sections payload slices out of the shipped JSX", !!sectionsExpr);
A("the report is named", !!toolNameM);
A("the scenario prop carries the live input set", /state=\{\{ d \}\}/.test(SRC));
A("the defaults prop points at the shared DEFAULTS", /defaults=\{DEFAULTS\}/.test(SRC));
A("the route prop points at the shared ROUTE", /routePath=\{ROUTE\}/.test(SRC));
A("the report payload contains no em-dash",
  [subtitleExpr, gradesExpr, summaryExpr, signalsExpr, sectionsExpr].join("").indexOf(String.fromCharCode(0x2014)) < 0);

/* ---------------------------------------------- the shared confidence block */
/*
 * ReportActions builds the Confidence section, so the tool cannot be checked for
 * it in isolation. These assertions run against the shipped ReportActions.
 */
console.log("\n0b. the shared confidence renderer");
A("ReportActions accepts a grades prop", /grades = null/.test(RA));
A("grades defaults to null, so a tool that omits it is unchanged", /grades = null,/.test(RA));
A("the axis order is fixed in one place", /const AXIS_ORDER = \["evidence", "realization", "completeness"\]/.test(RA));
A("the confidence section is prepended, not appended", /\[confidenceSection\(grades, confidence\), \.\.\.sections\]/.test(RA));
A("a tool without grades exports the untouched section list", /grades \? \[confidenceSection[\s\S]{0,60}: sections/.test(RA));
A("an N/A axis is forced to state a reason", /No reason was given, which is itself a defect/.test(RA));
A("the axes are exported to the lead payload as well as the PDF", /axis_\$\{a\}/.test(RA));
A("ReportActions carries no em-dash", RA.indexOf(String.fromCharCode(0x2014)) < 0);

const cs = RA.slice(RA.indexOf("function confidenceSection"));
const confidenceSection = new Function("AXIS_ORDER", "AXIS_LABEL",
  cs.slice(0, balanced(cs, 0, "{", "}").end) + "\nreturn confidenceSection;")(
  ["evidence", "realization", "completeness"],
  { evidence: "Evidence", realization: "Realization", completeness: "Completeness" });
A("the shared confidence section evaluates", typeof confidenceSection === "function");

/* ------------------------------------------------------------- input sets */
/*
 * Set A is the shipped default: 200 agents, 35 percent attrition, full backfill,
 * estimated inputs. It is the document most users see.
 *
 * Set B is the only set that should reach Finance-grade: finance-confirmed inputs,
 * a cashable mechanism, full backfill, cost basis inside the 40-60 band.
 *
 * Set C is deliberately hostile: a scenario link carrying a negative headcount, a
 * ramp productivity of 400 percent, a mechanism of 900, a backfill of 300 and a
 * negative washout rate. Every one of those produced an impossible figure on the
 * shipped tool, and the mechanism of 900 exported Finance-grade while printing the
 * mechanism name as "None" in the same document. This set exists to prove the
 * document DISCLOSES the corrections rather than quietly printing a clean report
 * off numbers the engine never ran.
 *
 * Set D is Set B with the mechanism dropped to none and nothing else changed, so
 * any difference in grade between B and D is attributable to realization alone.
 *
 * Set E is forced under-staffing at half backfill: the case where real value is
 * routed OUT of this model, which the document must say rather than imply zero.
 */
const SETS = {
  A: { label: "Shipped defaults: 200 agents, 35% attrition, full backfill, estimated inputs", mut: () => ({}), fromLink: false },
  B: { label: "Finance-confirmed, cashable mechanism, full backfill", fromLink: false,
    mut: () => ({ evidence: "finance", mech: "vendor" }) },
  C: { label: "Hostile scenario link: negative agents, 400% ramp, mech 900, 300% backfill, negative washout", fromLink: true,
    mut: () => ({ agents: -200, rampProductivity: 400, mech: 900, backfillRate: 300, earlyWashoutRate: -20, classSize: 0 }) },
  D: { label: "Set B exactly, mechanism dropped to none: the realization axis", fromLink: false,
    mut: () => ({ evidence: "finance", mech: "none" }) },
  E: { label: "Forced under-staffing at half backfill: value routed out of this model", fromLink: false,
    mut: () => ({ evidence: "finance", mech: "vendor", backfillRate: 50 }) },
};

function render(S) {
  const body = `
    ${engineRegion}
    const d = { ...clone(DEFAULTS.d), ...MUT() };
    const r = compute(d);
    const fromLink = FROM_LINK;
    const corrections = r.guards.map(g => \`\${g.label}: entered \${guardVal(g, "entered")}, computed at \${guardVal(g, "used")}.\`);
    const subtitle = ${subtitleExpr};
    const grades = ${gradesExpr};
    const summary = ${summaryExpr};
    const signals = ${signalsExpr};
    const sections = ${sectionsExpr};
    const confidence = r.voided ? "Void" : r.confidence;
    return { d, r, subtitle, grades, summary, signals, sections, confidence, corrections };
  `;
  const out = new Function("COLORS", "MECH", "MECH_ORDER", "ELECTRIC", "AMBER", "RED", "GREEN", "MUT", "FROM_LINK", body)(
    COLORS, MECH, MECH_ORDER, COLORS.electric, COLORS.amber, COLORS.red, COLORS.green, S.mut, S.fromLink);
  out.sections = [confidenceSection(out.grades, out.confidence), ...out.sections];
  return out;
}

/* Every money-ish token the document prints, so a malformed figure anywhere fails. */
const MONEY = /-?\$[\d,]+(?:\.\d+)?[KM]?/g;
function allText(doc) {
  const parts = [doc.subtitle];
  for (const s of doc.sections) {
    parts.push(s.title);
    if (s.items) for (const it of s.items) parts.push(typeof it === "string" ? it : `${it.label || it.tool || ""} ${it.value || it.reason || ""}`);
    if (s.rows) for (const row of s.rows) parts.push(row.join(" "));
  }
  for (const x of doc.summary) parts.push(`${x.label} ${x.value}`);
  return parts.join("\n");
}
const sectionByTitle = (doc, t) => doc.sections.find(s => s.title === t);
const itemsOf = (doc, t) => (sectionByTitle(doc, t)?.items || []).map(i => typeof i === "string" ? i : JSON.stringify(i)).join(" | ");

const DOCS = {};
for (const k of Object.keys(SETS)) {
  console.log(`\n--- SET ${k}: ${SETS[k].label}`);
  DOCS[k] = render(SETS[k]);
}

/* ---- 1. the document is structurally whole in every set ---- */
console.log("\n1. document structure");
for (const [k, doc] of Object.entries(DOCS)) {
  A(`${k}: the document has a subtitle`, typeof doc.subtitle === "string" && doc.subtitle.length > 10);
  A(`${k}: the document leads with the Confidence section`, doc.sections[0].title === "Confidence");
  A(`${k}: every section is titled`, doc.sections.every(s => s.title && s.title.length > 2));
  A(`${k}: every section has a type`, doc.sections.every(s => !!s.type));
  A(`${k}: no section is empty`, doc.sections.every(s => (s.items && s.items.length) || (s.rows && s.rows.length)));
  A(`${k}: no findings item is blank`, doc.sections.filter(s => s.type === "findings").every(s => s.items.every(i => typeof i === "string" && i.trim().length > 3)));
  A(`${k}: no table row is blank`, doc.sections.filter(s => s.type === "table").every(s => s.rows.every(rw => rw.length === 2 && rw[0] && rw[1])));
  A(`${k}: the summary carries four headline figures`, doc.summary.length === 4);
  A(`${k}: no summary value is undefined or NaN`, doc.summary.every(x => typeof x.value === "string" && !/undefined|NaN|Infinity/.test(x.value)));
  A(`${k}: the document mentions no undefined, NaN or Infinity anywhere`, !/undefined|NaN|Infinity/.test(allText(doc)));
  A(`${k}: the document contains no em-dash`, allText(doc).indexOf(String.fromCharCode(0x2014)) < 0);
  A(`${k}: every money figure in the document is well formed`, (allText(doc).match(MONEY) || []).every(t => /^-?\$[\d,]+(\.\d+)?[KM]?$/.test(t)));
  A(`${k}: the Next Steps section routes onward`, sectionByTitle(doc, "Next Steps").items.length === 3);
  A(`${k}: every next step carries a tool, a link and a reason`, sectionByTitle(doc, "Next Steps").items.every(i => i.tool && i.href && i.reason));
  A(`${k}: the Methodology section is present`, !!sectionByTitle(doc, "Methodology"));
  A(`${k}: the Evidence Detail section is present`, !!sectionByTitle(doc, "Evidence Detail"));
}

/* ---- 2. the printed figures are the figures the engine computed ---- */
/* This is the split-rendering check. Every headline number appears in more than
   one place in the document, and each place is a separate JSX expression. */
console.log("\n2. printed figures reconcile to the engine");
const money = (v) => { const x = Number(v), s = x < 0 ? "-" : ""; return s + "$" + Math.round(Math.abs(x)).toLocaleString(); };
for (const [k, doc] of Object.entries(DOCS)) {
  const r = doc.r;
  const S = Object.fromEntries(doc.summary.map(x => [x.label, x.value]));
  A(`${k}: summary cash per departure is the engine figure`, S["Cash per departure"] === money(r.cashPerDeparture));
  A(`${k}: summary all-in per departure is the engine figure`, S["All-in per departure"] === money(r.allInPerDeparture));
  A(`${k}: summary annual replacement burden is the engine figure`, S["Annual replacement burden"] === money(r.annualReplBurden));
  A(`${k}: summary early-washout waste is the engine figure`, S["Early-washout waste"] === money(r.earlyWaste));

  const metrics = Object.fromEntries(sectionByTitle(doc, "Burden vs Realizable").items.map(i => [i.label, i.value]));
  A(`${k}: the metrics block agrees with the summary on cash per departure`, metrics["Cash per departure"] === S["Cash per departure"]);
  A(`${k}: the metrics block agrees with the summary on all-in per departure`, metrics["All-in per departure"] === S["All-in per departure"]);
  A(`${k}: the metrics block agrees with the summary on annual burden`, metrics["Annual replacement burden"] === S["Annual replacement burden"]);
  A(`${k}: the metrics block agrees with the summary on early-washout waste`, metrics["Early-washout waste"] === S["Early-washout waste"]);
  A(`${k}: the metrics block prints capacity per departure from the engine`, metrics["Capacity per departure"] === money(r.capacityPerDeparture));

  const rows = Object.fromEntries(sectionByTitle(doc, "Cost Per Replaced Departure").rows);
  A(`${k}: the cost table prints the recruiting figure the engine used`, rows["Recruiting + screening (cash)"] === money(r.recruiting));
  A(`${k}: the cost table prints the training figure the engine used`, rows["Training: wages + trainer (cash)"] === money(r.training));
  A(`${k}: the cost table prints the nesting figure the engine used`, rows["Nesting productivity loss (capacity)"] === money(r.nestingLoss));
  A(`${k}: the cost table prints the ramp figure the engine used`, rows["Ramp-to-proficiency loss (capacity)"] === money(r.rampLoss));
  A(`${k}: the cost table prints the supervisor figure the engine used`, rows["Supervisor coaching (capacity)"] === money(r.supervisorBurden));
  const vacKey = Object.keys(rows).find(x => /Vacancy backfill/.test(x));
  A(`${k}: the cost table prints the vacancy figure the engine used`, rows[vacKey] === money(r.vacancy));
  A(`${k}: the vacancy row names the costing mode actually used`, new RegExp(r.vacancyMode === "gross" ? "gross" : "OT premium").test(vacKey));

  /* The table must add up to the number printed above it, or a reader who checks
     the arithmetic finds the document contradicting itself. */
  const tableSum = Object.entries(rows).reduce((a, [, v]) => a + Number(String(v).replace(/[$,]/g, "")), 0);
  A(`${k}: the cost table sums to the printed all-in per departure, within rounding`, Math.abs(tableSum - Math.round(r.allInPerDeparture)) <= Object.keys(rows).length);
  A(`${k}: the sign-on row appears only when a sign-on bonus exists`, (r.signOn > 0) === Object.keys(rows).some(x => /Sign-on/.test(x)));

  const kf = itemsOf(doc, "Key Findings");
  A(`${k}: key findings quote the same cash per departure`, kf.includes(money(r.cashPerDeparture)));
  A(`${k}: key findings quote the same all-in per departure`, kf.includes(money(r.allInPerDeparture)));
  A(`${k}: key findings quote the same annual burden`, kf.includes(money(r.annualReplBurden)));
  A(`${k}: key findings quote the same early-washout waste`, kf.includes(money(r.earlyWaste)));
  A(`${k}: key findings quote the hire and departure counts the engine used`, kf.includes(`${r.hires} of ${r.departures} departures`));
  A(`${k}: key findings quote the backfill rate the engine used, not the entered one`, kf.includes(`At ${r.backfillRate}% backfill`));
  A(`${k}: key findings quote the washout rate the engine used, not the entered one`, kf.includes(`${r.earlyWashoutRate}% of replacement hires`));
  A(`${k}: key findings quote the realizable figure the engine computed`, kf.includes(money(r.scenarios[0].total)));
}

/* ---- 3. the corrected values are the ones printed ---- */
/* The License Gap defect class: the corrections section discloses one value and a
   table three sections later prints the raw entered one. */
console.log("\n3. corrected inputs, not entered inputs");
const C = DOCS.C;
A("C: the hostile link triggered corrections", C.r.guards.length > 0);
A("C: the document opens a corrections section", !!sectionByTitle(C, "Inputs Corrected Before Calculation"));
A("C: the corrections section names every correction the engine made", sectionByTitle(C, "Inputs Corrected Before Calculation").items.length === C.r.guards.length + 1);
A("C: the corrections section states that the figures were computed on the corrected values", itemsOf(C, "Inputs Corrected Before Calculation").includes("computed on the corrected values"));
A("C: the methodology repeats the corrections rather than hiding them at the top", itemsOf(C, "Methodology").includes("INPUTS CORRECTED"));
A("C: every correction names both the entered and the computed value", C.r.guards.every(g => itemsOf(C, "Inputs Corrected Before Calculation").includes(String(g.entered)) && itemsOf(C, "Inputs Corrected Before Calculation").includes(String(g.used))));
A("C: the entered headcount of -200 is disclosed", itemsOf(C, "Inputs Corrected Before Calculation").includes("entered -200"));
A("C: the document never prints a negative agent count as a result", !/-200 agents|-200 departures/.test(allText(C)));
A("C: the document prints no negative money figure", !(allText(C).match(MONEY) || []).some(t => t.startsWith("-")));
A("C: the printed backfill is the corrected 100, not the entered 300", itemsOf(C, "Key Findings").includes("At 100% backfill"));
A("C: the printed washout is the corrected 0, not the entered -20", itemsOf(C, "Key Findings").includes("0% of replacement hires"));
A("C: the printed mechanism name matches the factor the engine used", itemsOf(C, "Methodology").includes(MECH.none.label));
A("C: the mechanism of 900 does not appear as a credited percentage", !/credits 900%/.test(allText(C)));
A("C: the credited capacity percentage is inside 0 to 100", (() => { const mm = allText(C).match(/credits (\d+)% of freed capacity/); return mm && Number(mm[1]) >= 0 && Number(mm[1]) <= 100; })());
A("C: the class size correction from 0 to 1 is disclosed", itemsOf(C, "Inputs Corrected Before Calculation").includes("Class size"));
A("C: the document cannot claim a grade above Directional", C.confidence === "Directional");
A("C: the subtitle states the binding axis rather than a bare grade", C.subtitle.includes("bound by"));
A("C: the corrections signal is carried to the lead payload", C.signals.inputs_corrected === C.r.guards.length);
for (const [k, doc] of Object.entries(DOCS)) {
  if (k === "C") continue;
  A(`${k}: a clean run prints no corrections section`, !sectionByTitle(doc, "Inputs Corrected Before Calculation"));
  A(`${k}: a clean run does not mention corrected inputs in the methodology`, !itemsOf(doc, "Methodology").includes("INPUTS CORRECTED"));
}

/* ---- 4. the three axes are stated once, consistently, and never contradict ---- */
console.log("\n4. the confidence axes in the document");
for (const [k, doc] of Object.entries(DOCS)) {
  const conf = sectionByTitle(doc, "Confidence");
  const text = conf.items.join(" ");
  A(`${k}: the Confidence section names all three axes`, /Evidence axis/.test(text) && /Realization axis/.test(text) && /Completeness axis/.test(text));
  A(`${k}: each axis prints the grade the engine assigned`, text.includes(`Evidence axis: ${doc.r.grades.evidence}`) && text.includes(`Realization axis: ${doc.r.grades.realization}`) && text.includes(`Completeness axis: ${doc.r.grades.completeness}`));
  A(`${k}: each axis carries its reason`, [doc.r.evidenceReason, doc.r.realizationReason, doc.r.completenessReason].every(x => text.includes(x)));
  A(`${k}: the headline in the document is the headline the engine computed`, text.includes(`Headline: ${doc.confidence}`));
  A(`${k}: the document names the binding axis`, text.includes(`bound by ${doc.r.boundBy}`));
  A(`${k}: the subtitle agrees with the Confidence section on the headline`, doc.subtitle.includes(doc.confidence === "Void" ? "EXPORT VOID" : doc.confidence));
  A(`${k}: the lead payload agrees with the document on the headline`, doc.signals.headline_confidence === (doc.confidence === "Void" ? "void" : doc.confidence));
  A(`${k}: the lead payload agrees with the document on each axis`, doc.signals.evidence_axis === doc.r.grades.evidence && doc.signals.realization_axis === doc.r.grades.realization && doc.signals.completeness_axis === doc.r.grades.completeness);
  A(`${k}: the axes are stated once, not restated by the tool`, (text.match(/Evidence axis/g) || []).length === 1 && !itemsOf(doc, "Evidence Detail").includes("Evidence axis"));
  A(`${k}: no axis is N/A, because this tool models a benefit`, !/not applicable/.test(text));
  A(`${k}: the named binding axis really sits at the headline grade`, doc.r.boundAxes.every(a => doc.r.grades[a] === doc.r.confidence));
}
A("B reaches Finance-grade on every axis", ["evidence", "realization", "completeness"].every(a => DOCS.B.r.grades[a] === "Finance-grade"));
A("B is the only set that reaches Finance-grade overall", Object.entries(DOCS).filter(([, d]) => d.confidence === "Finance-grade").map(([k]) => k).join(",") === "B");
A("D differs from B only on the realization axis", DOCS.D.r.grades.evidence === DOCS.B.r.grades.evidence && DOCS.D.r.grades.completeness === DOCS.B.r.grades.completeness && DOCS.D.r.grades.realization !== DOCS.B.r.grades.realization);
A("D is held down by realization and says so", DOCS.D.r.boundBy.includes("realization") && DOCS.D.confidence === "Directional");
A("D still prints the same cost figures as B, because the mechanism does not change the burden", DOCS.D.summary[2].value === DOCS.B.summary[2].value);
A("D prints a smaller realizable figure than B, because the mechanism credits less", DOCS.D.r.scenarios[0].total < DOCS.B.r.scenarios[0].total);
A("E is held down by completeness, not by evidence or realization", DOCS.E.r.boundBy === "completeness");
A("E keeps Finance-grade evidence despite the hard flag", DOCS.E.r.grades.evidence === "Finance-grade");
A("E keeps Finance-grade realization despite the hard flag", DOCS.E.r.grades.realization === "Finance-grade");

/* ---- 5. the document never claims a routed cost is zero ---- */
console.log("\n5. routed value is stated, never implied as zero");
const E = DOCS.E;
A("E has un-backfilled seats", E.r.unbackfilled > 0);
A("E states the un-backfilled seat count in the evidence detail", itemsOf(E, "Evidence Detail").includes(`${E.r.unbackfilled} un-backfilled seats`));
A("E routes the lost capacity to another tool rather than pricing it here", itemsOf(E, "Evidence Detail").includes("Staffing/Occupancy"));
A("E says explicitly that the value is not zeroed out as free", itemsOf(E, "Evidence Detail").includes("not zeroed out as free"));
A("E repeats the routing in key findings", itemsOf(E, "Key Findings").includes("This is lost capacity, not zero cost"));
A("E raises the routing as a flag, not only as prose", itemsOf(E, "Integrity Flags").includes("not replaced under forced under-staffing"));
A("E points the reader at the tool that can price it", sectionByTitle(E, "Next Steps").items.some(i => /Occupancy/.test(i.tool)));
A("A has no un-backfilled seats and says the full cycle applies", DOCS.A.r.unbackfilled === 0 && itemsOf(DOCS.A, "Key Findings").includes("All departures are refilled"));

/* ---- 6. the mechanism is described consistently everywhere it appears ---- */
console.log("\n6. mechanism consistency");
for (const [k, doc] of Object.entries(DOCS)) {
  const meth = itemsOf(doc, "Methodology");
  A(`${k}: the methodology names the mechanism the engine used`, meth.includes(`"${doc.r.mechName}"`));
  A(`${k}: the methodology states the credited percentage the engine used`, meth.includes(`credits ${Math.round(doc.r.mech * 100)}% of freed capacity`));
  A(`${k}: the methodology names the credit class`, meth.includes(`Credit class ${doc.r.cred}`));
  A(`${k}: the methodology ties the credit class to the realization axis`, meth.includes(`realization axis at ${doc.r.grades.realization}`));
  A(`${k}: the methodology states that cash is never scaled by the mechanism`, meth.includes("never scaled by this factor"));
  A(`${k}: the capacity action reaches the lead payload as the key the engine used`, doc.signals.capacity_action === doc.r.mechKey);
  A(`${k}: the bookability label matches the realization axis`, doc.r.bookLabel === (doc.r.grades.realization === "Finance-grade" ? "Bookable if committed" : doc.r.grades.realization === "Planning-grade" ? "Soft lever, tie to budget" : "Planning only"));
  A(`${k}: key findings state the bookability`, itemsOf(doc, "Key Findings").toLowerCase().includes(doc.r.bookLabel.toLowerCase()));
}

/* ---- 7. flags reach the document ---- */
console.log("\n7. flags reach the document");
for (const [k, doc] of Object.entries(DOCS)) {
  const has = doc.r.flags.length > 0;
  A(`${k}: the flag section exists exactly when the engine raised a flag`, has === !!sectionByTitle(doc, "Integrity Flags"));
  if (has) {
    A(`${k}: every engine flag is printed`, sectionByTitle(doc, "Integrity Flags").items.length === doc.r.flags.length);
    A(`${k}: every printed flag carries its severity marker`, sectionByTitle(doc, "Integrity Flags").items.every(i => /^\[(FLAG|NOTE)\] /.test(i)));
    A(`${k}: a high-severity flag prints as FLAG, not NOTE`, doc.r.flags.every((f, i) => sectionByTitle(doc, "Integrity Flags").items[i].startsWith(f.sev === "high" ? "[FLAG]" : "[NOTE]")));
  }
  A(`${k}: the flag count reaches the lead payload`, doc.signals.integrity_flags === doc.r.flags.length);
  A(`${k}: the hard-flag state reaches the lead payload`, doc.signals.hard_flag === (doc.r.hardFlag ? "yes" : "no"));
}

/* ---- 8. the cost basis claim is never made without the band that tests it ---- */
console.log("\n8. cost basis and the frontline band");
for (const [k, doc] of Object.entries(DOCS)) {
  const ed = itemsOf(doc, "Evidence Detail");
  A(`${k}: the evidence detail states the cost basis against the 40-60 band`, ed.includes("40-60% frontline band") || ed.includes("frontline band cannot test it"));
  A(`${k}: the band figures printed are the engine's band figures`, doc.r.salaryUnknown || (ed.includes(money(doc.r.bandLo)) && ed.includes(money(doc.r.bandHi))));
  A(`${k}: the printed percentage of salary matches the engine`, doc.r.salaryUnknown || ed.includes(`${Math.round(doc.r.pctSalary)}% of salary`));
  A(`${k}: the planning range printed matches the engine`, doc.r.salaryUnknown || (ed.includes(money(doc.r.allInLow)) && ed.includes(money(doc.r.allInHigh))));
  A(`${k}: the in-band verdict printed agrees with the engine`, doc.r.salaryUnknown || ed.includes(doc.r.guardrailOk ? "Within the plausible range." : "Outside the plausible range."));
  A(`${k}: the reference figure is disclosed as not salary-adjusted`, ed.includes("not salary-adjusted") || doc.r.salaryUnknown);
}
const Z = render({ label: "zero salary", fromLink: false, mut: () => ({ avgSalary: 0, evidence: "finance", mech: "vendor" }) });
A("zero salary: the document says the band cannot test the result", itemsOf(Z, "Evidence Detail").includes("cannot test it"));
A("zero salary: the document does not print a false percentage-of-salary claim", !/\b0% of (annual )?salary/.test(allText(Z)));
A("zero salary: the analyst read does not claim a percentage it cannot know", !/\b0% of (annual )?salary/.test(Z.r.analystRead));
A("zero salary: the analyst read says the share is unknown", /unknown share/.test(Z.r.analystRead));
A("zero salary: the percent claim and its disclaimer are built from one expression", Z.r.analystRead.includes(Z.r.pctClaim));
A("known salary: the percent claim states the engine percentage", DOCS.B.r.pctClaim.includes(`${Math.round(DOCS.B.r.pctSalary)}%`));
A("known salary: the short and long percent claims agree", DOCS.B.r.pctShort.includes(`${Math.round(DOCS.B.r.pctSalary)}%`) && DOCS.B.r.analystRead.includes(DOCS.B.r.pctClaim));
const Z0 = render({ label: "zero salary, zero backfill", fromLink: false, mut: () => ({ avgSalary: 0, backfillRate: 0 }) });
A("zero salary at zero backfill also refuses the percentage claim", !/\b0% of (annual )?salary/.test(Z0.r.analystRead));
A("zero salary at zero backfill, downsizing, also refuses the percentage claim", !/\b0% of (annual )?salary/.test(render({ label: "z", fromLink: false, mut: () => ({ avgSalary: 0, backfillRate: 0, unbackfillIntent: "downsizing" }) }).r.analystRead));
A("zero salary: the export is held at Directional", Z.confidence === "Directional");
A("zero salary: completeness is the binding axis", Z.r.boundBy === "completeness");
A("zero salary: no money figure in the document is malformed", (allText(Z).match(MONEY) || []).every(t => /^-?\$[\d,]+(\.\d+)?[KM]?$/.test(t)));

/* ---- 9. the analyst read agrees with the document ---- */
console.log("\n9. the analyst read agrees with the document");
for (const [k, doc] of Object.entries(DOCS)) {
  const a = doc.r.analystRead;
  A(`${k}: the analyst read is substantial prose, not a stub`, a.length > 300);
  A(`${k}: the analyst read quotes the same all-in figure the document prints`, a.includes(money(doc.r.allInPerDeparture)) || doc.r.voided);
  A(`${k}: the analyst read contains no em-dash`, a.indexOf(String.fromCharCode(0x2014)) < 0);
  A(`${k}: the analyst read names the mechanism the engine used`, doc.r.hires === 0 || doc.r.voided || a.includes(doc.r.mechLabel));
  A(`${k}: the rail line and the document agree on the burden`, doc.r.voided || doc.r.railRead.includes(money(doc.r.annualReplBurden)));
  A(`${k}: the rail line and the document agree on the backfill rate`, doc.r.voided || doc.r.railRead.includes(`${doc.r.backfillRate}% backfill`));
  A(`${k}: the rail line and the document agree on the un-backfilled count`, doc.r.voided || doc.r.railRead.includes(`${doc.r.unbackfilled} seats/yr`));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
