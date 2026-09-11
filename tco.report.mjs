/* tco.report.mjs
 *
 * Rendered-output reconciliation for the Total Cost of Ownership Analysis.
 *
 * tco.test.mjs proves the arithmetic. It says nothing about the document a CFO
 * reads, because every figure in that document is a separate expression written
 * in JSX, and a passing engine can sit underneath a report that quotes a
 * different number or contradicts itself two sections later. This tool is where
 * the original 100,000 dollar self-contradiction was found while 112 engine
 * assertions were green.
 *
 * This file does NOT rebuild the report. It slices the ReportActions payload out
 * of the shipped JSX at runtime, binds it to the real engine sliced from the same
 * file, evaluates it, and reads the document.
 *
 * It also gates the Tracker 1-15 band using the real severityBucket and the real
 * sanitizeProps, so what is asserted is what reaches the wire.
 *
 * Run from repo root: node tco.report.mjs
 */
import { readFileSync } from "node:fs";

const SRC = readFileSync("./TCOCalculator.jsx", "utf8");
const { severityBucket, sanitizeProps, SEVERITY_BANDS } = await import("./src/lib/track.js");
const { BENCH, COLORS } = await import("./src/lib/benchmarks.js");
/* The shared guard module the engine imports. Injected, never reconstructed. */
const { createGuards, guardVal, guardLine } = await import("./src/lib/guards.js");

let pass = 0, fail = 0;
const A = (nm, c) => { if (c) pass++; else { fail++; console.log("  FAIL:", nm); } };

/* ---------------------------------------------------------------- slicing */
/* A real lexer, not the apostrophe-fragile slicer the older harnesses share. It
   skips line comments, block comments, quoted strings and template literals, and
   descends into every substitution inside a template. Introduced in aid.report.mjs
   and carried here; the remaining five harnesses still use the fragile version. */
function skipQuoted(src, i) {
  const q = src[i];
  for (let j = i + 1; j < src.length; j++) {
    if (src[j] === "\\") { j++; continue; }
    if (src[j] === q) return j + 1;
    if (src[j] === "\n") return -1;
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

const raAt = SRC.indexOf("<ReportActions");
function prop(name, open = "{", close = "}") {
  const at = SRC.indexOf(name + "={", raAt);
  if (at < 0) return null;
  const b = balanced(SRC, at + name.length, open, close);
  return b ? b.text.slice(1, -1) : null;
}

function slice(a, b) {
  const i = SRC.indexOf(a);
  if (i < 0) return null;
  const j = SRC.indexOf(b, i);
  if (j < 0) return null;
  return SRC.slice(i, j);
}
const ids = slice('const TOOL_ID = "tco-calculator";', "const n = (v) =>");
const helpers = slice("const n = (v) =>", "function LogoMark");
const consts = slice("const INDUSTRY = {", "// InfoDot definition strings");
const engine = slice("function reconcile(", "function Calculator");

const subtitleAt = SRC.indexOf("subtitle={", raAt);
const subtitleExpr = subtitleAt < 0 ? null : balanced(SRC, subtitleAt + 9, "{", "}").text.slice(1, -1);
const summaryExpr = prop("summary");
const signalsExpr = prop("signals");
const sectionsExpr = prop("sections");
const toolNameM = SRC.match(/toolName="([^"]+)"/);

console.log("\n0. payload slices out of the shipped JSX");
A("the engine region slices out of the shipped JSX", !!ids && !!helpers && !!consts && !!engine);
A("the ReportActions subtitle slices out of the shipped JSX", !!subtitleExpr);
A("the ReportActions summary payload slices out of the shipped JSX", !!summaryExpr);
A("the ReportActions signals payload slices out of the shipped JSX", !!signalsExpr);
A("the ReportActions sections payload slices out of the shipped JSX", !!sectionsExpr);
A("the report is named", !!toolNameM);
A("the scenario prop carries the input set as entered", /state=\{dRaw\}/.test(SRC));
A("the defaults prop points at the shared SCENARIO_DEFAULTS", /defaults=\{SCENARIO_DEFAULTS\}/.test(SRC));
A("the route prop points at the shared ROUTE", /routePath=\{ROUTE\}/.test(SRC));

const payloadText = [subtitleExpr, summaryExpr, signalsExpr, sectionsExpr].join("");
A("the report payload contains no em-dash", payloadText.indexOf(String.fromCharCode(0x2014)) < 0);
A("the report payload contains no en-dash", payloadText.indexOf(String.fromCharCode(0x2013)) < 0);
A("the whole tool file contains no em-dash", SRC.indexOf(String.fromCharCode(0x2014)) < 0);
A("the whole tool file contains no en-dash", SRC.indexOf(String.fromCharCode(0x2013)) < 0);

console.log("\n0b. Tracker 1-15, the band is bucketed and not hand-written");
A("severity routes through severityBucket", /severity:\s*severityBucket\(/.test(signalsExpr || ""));
A("the severity expression carries no hand-written band word",
  !/severity:\s*severityBucket\([^\n]*["'](?:normal|elevated|critical|blocked|clear|none|low|moderate|high|severe)["']/.test(signalsExpr || ""));
A("the prior hygiene basis is gone from the severity expression",
  !/severity:\s*[^\n]*hasBlock/.test(signalsExpr || ""));
A("the band records its denominator argument in the file", /Tracker 1-15/.test(SRC));
A("the band records what was rejected", (SRC.match(/Rejected:/g) || []).length >= 3);
A("the band declares its unreachable set", /Declared unreachable/.test(SRC));

/* --------------------------------------------------------------- input sets */
/*
 * Set A is the shipped default at the Expected stance. It is the document most
 * users see.
 *
 * Set B is Set A with the stance dropped to None and nothing else changed. It is
 * the control for Tracker 1-15: the stance is an attribution position on how much
 * of the leak you dare book, not a statement that the leak is absent, so the band
 * must not move between A and B even though every booked figure falls to zero.
 *
 * Set C sets every optimization target equal to its current value, so no lever
 * fires. It is the only route to the bottom band and exists to prove that band is
 * reachable in the rendered document.
 *
 * Set D carries a wage far beyond any real operation through a scenario link. This
 * is the guarded path: the per-agent ceiling flag fires, the issue is disclosed as
 * an open item, and confidence falls to Directional.
 *
 * Set E drives every target hard at the Aggressive stance.
 *
 * Set F is invoiced cost basis at the Expected stance with no flags, the only route
 * to Finance-grade.
 *
 * Set G carries a negative headcount and a negative contact volume through a
 * scenario link. Before the guard layer this printed a negative annual cost base.
 * It now proves the correction is made at the engine boundary AND disclosed in the
 * document. See section 6b.
 *
 * Set I carries values the form refuses but the rail contract declares legitimate:
 * occupancy of 120 percent and annual attrition of 150 percent. The guard must pass
 * both untouched, or it repeats the v1 rail defect.
 *
 * Set J carries out-of-domain shares, a collapsing escalator and a forged cost basis,
 * which exercises the scaled recorder and the enum substitution.
 *
 * Set H is heavy attrition against hard targets, which moves the band above the
 * bottom two so the rendered gate exercises the scale rather than one value.
 */
const SETS = {
  A: { label: "Shipped defaults, Expected stance", stance: "expected", mut: () => ({}) },
  B: { label: "Set A exactly, stance dropped to None: the stance control", stance: "none", mut: () => ({}) },
  C: { label: "Every target equal to current: no lever fires", stance: "expected",
    mut: (BASE) => ({ targetContainment: 0, targetFcr: 0, targetAht: BASE.aht, targetAttrition: BASE.attrition }) },
  D: { label: "Impossible wage through a scenario link: the guarded path", stance: "expected",
    mut: () => ({ agentHourly: 90000 }) },
  E: { label: "Every target driven hard at the Aggressive stance", stance: "aggressive",
    mut: () => ({ targetContainment: 0.90, targetFcr: 0.97, targetAht: 120, targetAttrition: 0.02 }) },
  F: { label: "Invoiced cost basis, Expected stance, no flags", stance: "expected",
    mut: () => ({ costBasis: "invoiced" }) },
  G: { label: "Negative headcount through a scenario link: corrected and disclosed", stance: "expected",
    mut: () => ({ agents: -400, monthlyContacts: -250000 }) },
  H: { label: "Heavy attrition against hard targets: the band moves up the scale", stance: "aggressive",
    mut: () => ({ attrition: 0.85, targetAttrition: 0.02, targetContainment: 0.90, targetFcr: 0.97, targetAht: 120 }) },
  I: { label: "Rail-legitimate extremes the form refuses: must pass uncorrected", stance: "expected",
    mut: () => ({ occupancy: 1.2, attrition: 1.5 }) },
  J: { label: "Out-of-domain shares, a collapsing escalator and a forged cost basis", stance: "expected",
    mut: () => ({ shrinkage: 1.4, fcr: -0.2, wageEscalatorPct: -3, costBasis: "forged" }) },
};

function render(S) {
  const body = `
    ${ids}
    ${helpers}
    ${consts}
    ${engine}
    const BASE_D = { ...BASE, ...INDUSTRY.general, industry: "general" };
    const dRaw = { ...BASE_D, ...MUT(BASE_D) };
    const stance = STANCE_KEY;
    const r = computeTCO(dRaw, stance);
    const d = r.d;
    const opt = buildOptimizations(d, r, stance);
    const analyst = buildAnalystRead(d, r, opt, stance);
    const escLabel = r.single ? pctD(r.wEff) + "/yr blended" : "wage " + pctD(r.wEff) + " / license " + pctD(r.lEff);
    /* Rail state. The harness renders the standalone document, the case with no
       upstream tool in the session, which is the document most readers receive. */
    const pulled = {};
    /* Colour selector, copied by reference from the component. It only picks a hex, so
       it cannot move a printed figure, but the payload calls it and the document will
       not evaluate without it. */
    const getBench = (val, low, high, inverse) => {
      if (inverse) return val <= low ? GREEN : val >= high ? RED : AMBER;
      return val >= high ? GREEN : val <= low ? RED : AMBER;
    };
    const subtitle = ${subtitleExpr};
    const summary = ${summaryExpr};
    const signals = ${signalsExpr};
    const sections = ${sectionsExpr};
    return { dRaw, d, r, opt, stance, analyst, escLabel, subtitle, summary, signals, sections, STANCE, INDUSTRY, TCO_DOMAIN, guardTCO, BASE };
  `;
  return new Function("BENCH", "COLORS", "NAVY", "DEEP", "ELECTRIC", "LIGHT", "WARM", "SLATE",
    "MUTED", "BORDER", "GREEN", "AMBER", "RED", "severityBucket", "MUT", "STANCE_KEY",
    "createGuards", "guardVal", "guardLine", body)(
    BENCH, COLORS, COLORS.navy, "#061325", COLORS.electric, "#00AAFF", "#F8FAFB", "#3A4F6A",
    COLORS.muted, "#D8E3ED", COLORS.green, COLORS.amber, COLORS.red, severityBucket, S.mut, S.stance,
    createGuards, guardVal, guardLine);
}

function allText(doc) {
  const parts = [doc.subtitle];
  for (const sec of doc.sections) {
    parts.push(sec.title);
    if (sec.items) for (const it of sec.items) parts.push(typeof it === "string" ? it : `${it.label || it.tool || it.action || ""} ${it.value || it.reason || it.detail || ""}`);
    if (sec.rows) for (const row of sec.rows) parts.push(row.join(" "));
    if (typeof sec.content === "string") parts.push(sec.content);
  }
  for (const x of doc.summary) parts.push(`${x.label} ${x.value}`);
  return parts.join("\n");
}
const summaryValue = (doc, label) => (doc.summary.find(x => x.label === label) || {}).value;
const sectionByTitle = (doc, t) => doc.sections.find(sec => sec.title === t);

const DOCS = {};
for (const k of Object.keys(SETS)) {
  console.log(`\n--- SET ${k}: ${SETS[k].label}`);
  DOCS[k] = render(SETS[k]);
}

/* ---- 1. the document is structurally whole in every set ---- */
console.log("\n1. document structure");
for (const k of Object.keys(DOCS)) {
  const doc = DOCS[k];
  A(`${k}: the document renders`, !!doc && Array.isArray(doc.sections));
  A(`${k}: every section carries a title`, doc.sections.every(sec => typeof sec.title === "string" && sec.title.length > 0));
  A(`${k}: every section carries a type`, doc.sections.every(sec => typeof sec.type === "string" && sec.type.length > 0));
  A(`${k}: no section is structurally empty`, doc.sections.every(sec => sec.type === "actions" || (sec.rows && sec.rows.length) || (sec.items && sec.items.length) || (typeof sec.content === "string" && sec.content.length)));
  A(`${k}: every table row is a pair`, doc.sections.filter(sec => sec.rows).every(sec => sec.rows.every(row => Array.isArray(row) && row.length === 2)));
  A(`${k}: the summary is populated`, Array.isArray(doc.summary) && doc.summary.length >= 8);
  A(`${k}: every summary item carries a label and a value`, doc.summary.every(x => typeof x.label === "string" && x.value !== undefined && x.value !== null));
  A(`${k}: the subtitle is a non-empty string`, typeof doc.subtitle === "string" && doc.subtitle.length > 10);
  A(`${k}: the analyst read is populated`, Array.isArray(doc.analyst) && doc.analyst.length >= 3);
  A(`${k}: the document carries a Methodology section`, !!sectionByTitle(doc, "Methodology"));
  A(`${k}: the document carries a Next Steps section`, !!sectionByTitle(doc, "Next Steps"));
}

/* ---- 2. no impossible figure reaches the page ---- */
console.log("\n2. no impossible figure reaches the page");
for (const k of Object.keys(DOCS)) {
  const text = allText(DOCS[k]);
  A(`${k}: the document prints no NaN`, !/NaN/.test(text));
  A(`${k}: the document prints no Infinity`, !/Infinity/.test(text));
  A(`${k}: the document prints no undefined`, !/undefined/.test(text));
  A(`${k}: the document prints no [object Object]`, !/\[object Object\]/.test(text));
  A(`${k}: the document prints no em-dash`, text.indexOf(String.fromCharCode(0x2014)) < 0);
  A(`${k}: the document prints no en-dash`, text.indexOf(String.fromCharCode(0x2013)) < 0);
  A(`${k}: no percentage prints beyond a plausible domain`,
    (text.match(/(\d+(?:\.\d+)?)%/g) || []).every(m => parseFloat(m) <= 100000));
  /* A money figure rendered as $-1,234 is a broken magnitude. No set is exempt: the
     exclusion Set G carried existed only because the guard layer did not. */
  A(`${k}: no money figure prints with a broken magnitude`, !/\$-/.test(text));
}

/* ---- 3. the printed figures reconcile with the engine ---- */
console.log("\n3. printed figures reconcile with the engine");
for (const k of Object.keys(DOCS)) {
  const doc = DOCS[k], r = doc.r, opt = doc.opt;
  const fmtK = (v) => { const x = v; return x >= 1000000 ? "$" + (x / 1000000).toFixed(1) + "M" : x >= 1000 ? "$" + (x / 1000).toFixed(0) + "K" : "$" + Math.round(x).toLocaleString(); };
  A(`${k}: printed annual TCO equals the engine annual TCO`, summaryValue(doc, "Annual TCO") === fmtK(r.annual));
  A(`${k}: printed three-year TCO equals the engine three-year TCO`, summaryValue(doc, "Three-year TCO") === fmtK(r.threeYear));
  A(`${k}: printed cost per contact equals the engine figure`, summaryValue(doc, "Cost per contact") === "$" + r.costPerContact.toFixed(2));
  A(`${k}: printed cost per resolution equals the engine figure`, summaryValue(doc, "Cost per resolution") === "$" + r.costPerResolution.toFixed(2));
  A(`${k}: printed marginal cost equals the engine figure`, summaryValue(doc, "Marginal cost per contact") === "$" + r.marginalPerContact.toFixed(2));
  A(`${k}: printed labor share equals the engine share`, summaryValue(doc, "Labor share of TCO") === r.disp.laborPctStr);
  A(`${k}: printed booked optimization equals the engine net total`, summaryValue(doc, "Optimization booked monthly") === fmtK(opt.netTotal));
  A(`${k}: printed theoretical optimization equals the engine gross total`, summaryValue(doc, "Optimization theoretical monthly") === fmtK(opt.grossTotal));
  A(`${k}: the subtitle carries the same confidence the tool exports`, doc.subtitle.indexOf(r.confidence) >= 0);
  A(`${k}: the subtitle carries the same stance the summary carries`, doc.subtitle.indexOf(summaryValue(doc, "Realization stance")) >= 0);
  /* The source promises rounded line items always sum to the headline. A CFO should
     never see parts that fail to reconcile with the total above them. */
  const lineSum = opt.items.reduce((s2, o) => s2 + o.net, 0);
  A(`${k}: the optimization line items sum to the booked total`, Math.round(lineSum) === Math.round(opt.netTotal));
  const grossSum = opt.items.reduce((s2, o) => s2 + o.gross, 0);
  A(`${k}: the optimization line items sum to the theoretical total`, Math.round(grossSum) === Math.round(opt.grossTotal));
  /* Annual and three-year must reconcile, which is the identity the source states. */
  A(`${k}: year one equals the annual snapshot`, Math.abs(r.y1 - r.annual) < 0.5);
}

/* ---- 4. Tracker 1-15: the band that reaches the wire ---- */
console.log("\n4. Tracker 1-15, the band that reaches the wire");
const bandsSeen = new Set();
for (const k of Object.keys(DOCS)) {
  const doc = DOCS[k], r = doc.r, opt = doc.opt;
  const raw = doc.signals.severity;
  const wire = sanitizeProps({ severity: raw }).severity;
  const expect = severityBucket(r.annual > 0 ? Math.max(0, Math.min(1, (opt.grossTotal * 12) / r.annual)) : null);
  A(`${k}: the published band equals the band the argued ratio produces`, raw === expect);
  if (r.annual > 0) {
    A(`${k}: the band is one of the five canonical bands`, SEVERITY_BANDS.indexOf(raw) >= 0);
    A(`${k}: the band survives sanitizeProps and reaches the wire`, wire === raw);
    bandsSeen.add(raw);
  } else {
    A(`${k}: with no cost base, nothing is published`, raw === "");
    A(`${k}: sanitizeProps drops the empty band rather than coercing it to none`, wire === undefined);
  }
  A(`${k}: the band reports none only when no lever fires`, raw !== "none" || opt.grossTotal === 0);
}
A("the bottom band is reachable in the rendered document", bandsSeen.has("none"));
A("the band reaches above the bottom two, so the scale is exercised", bandsSeen.has("moderate") || bandsSeen.has("high") || bandsSeen.has("severe"));
A("the band moves across the sets rather than reporting one value", bandsSeen.size >= 3);

/* The control. The stance is an attribution position, not a statement about the leak. */
console.log("\n4b. the stance control: A against B");
{
  const a = DOCS.A, b = DOCS.B;
  A("A and B model the same operation", a.r.annual === b.r.annual);
  A("A and B identify the same theoretical leak", a.opt.grossTotal === b.opt.grossTotal);
  A("the None stance books nothing", b.opt.netTotal === 0);
  A("the None stance therefore prints a different booked figure", summaryValue(a, "Optimization booked monthly") !== summaryValue(b, "Optimization booked monthly"));
  A("the band does not move between A and B", a.signals.severity === b.signals.severity);
  A("the prior net basis would have moved it", severityBucket(Math.max(0, Math.min(1, (b.opt.netTotal * 12) / b.r.annual))) !== a.signals.severity);
  A("the prior net basis would have reported none on a case carrying a real leak",
    severityBucket(Math.max(0, Math.min(1, (b.opt.netTotal * 12) / b.r.annual))) === "none" && b.opt.grossTotal > 0);
  A("the None stance discloses that it books nothing rather than printing a silent zero",
    b.analyst.join(" ").indexOf("books $0 realized") >= 0);
}

/* The prior hygiene basis duplicated confidence_class. Asserted so it stays rejected. */
console.log("\n4c. the rejected basis stays rejected");
for (const k of Object.keys(DOCS)) {
  const doc = DOCS[k], r = doc.r;
  const priorBand = r.hasBlock ? "high" : r.hasFlag ? "moderate" : "low";
  const dupes = r.hasBlock ? doc.signals.confidence_class === "Directional" : true;
  A(`${k}: the prior basis was a restatement of the confidence grade`, dupes || priorBand !== "high");
  A(`${k}: input hygiene still reaches the wire through confidence_class`, typeof doc.signals.confidence_class === "string" && doc.signals.confidence_class.length > 0);
}

/* ---- 5. the wire carries no cost detail ---- */
console.log("\n5. the wire carries no cost detail");
for (const k of Object.keys(DOCS)) {
  const sig = DOCS[k].signals;
  const keys = Object.keys(sig);
  A(`${k}: no wage or seat price travels in signals`, !keys.some(x => /wage|hourly|seat|price/i.test(x)));
  A(`${k}: no raw spend figure travels in signals`, !Object.entries(sig).some(([x, v]) => typeof v === "number" && v > 1000 && !/version/i.test(x)));
  A(`${k}: every signal value is a primitive`, Object.values(sig).every(v => v === null || ["string", "number", "boolean"].indexOf(typeof v) >= 0));
  A(`${k}: sanitizeProps admits only the allowlisted properties`, Object.keys(sanitizeProps(sig)).every(x => ["severity", "tool", "from", "to", "grade", "real", "depth", "via_rail", "repeat"].indexOf(x) >= 0));
}

/* ---- 6. the guarded path: an impossible wage is disclosed, not absorbed ---- */
console.log("\n6. the guarded path: an impossible wage is disclosed, not absorbed");
{
  const D = DOCS.D;
  A("D: the document is still whole under an impossible wage", D.sections.length >= 4);
  A("D: the impossible per-agent cost trips the ceiling flag", D.r.hasBlock);
  A("D: a blocking flag holds confidence at Directional", D.r.confidence === "Directional");
  A("D: the blocking flag is disclosed to the reader, not swallowed", D.r.openIssues.length > 0);
  A("D: the disclosure names the ceiling rather than gesturing at it", D.r.openIssues.join(" ").indexOf("25,000") >= 0);
  A("D: the tool still exports a confidence grade to the wire", typeof D.signals.confidence_class === "string");
  A("D: Finance-grade is unreachable while a blocking flag stands", D.r.confidence !== "Finance-grade");
  A("D: the cost base stays positive, so the band is still published", D.r.annual > 0 && D.signals.severity !== "");
}

/* ---- 6b. the guarded path: corrected at the boundary, disclosed in the document ---- */
/*
 * Set G carries a negative headcount and a negative contact volume through a scenario
 * link. Before the guard layer the engine carried both straight through and the
 * document printed an annual cost base of minus 19,605,275 beside a positive monthly
 * savings figure. The guard clamps both at the engine boundary and the document must
 * say so in three places: its own section, the open issues, and the methodology. Every
 * disclosure renders through the shared guardVal, so this compares against the shipped
 * renderer rather than a string this file invented.
 */
console.log("\n6b. the guarded path: corrected at the boundary, disclosed in the document");
{
  const G = DOCS.G;
  const labels = G.r.guards.map(g => g.label);
  A("G: both out-of-domain inputs are recorded, and nothing else is", G.r.guards.length === 2
    && labels.indexOf("Total Agents (FTE)") >= 0 && labels.indexOf("Monthly Contacts (gross demand)") >= 0);
  A("G: each record carries what was entered beside what was used",
    G.r.guards.every(g => g.entered < 0 && g.used === 1));
  A("G: the engine ran the corrected headcount", G.r.agents === 1 && G.d.agents === 1);
  A("G: the engine ran the corrected volume", G.r.contacts === 1 && G.d.monthlyContacts === 1);
  A("G: the annual cost base is positive", G.r.annual > 0);
  A("G: the share link still carries what was entered", G.dRaw.agents === -400 && G.dRaw.monthlyContacts === -250000);
  const sec = G.sections[0];
  A("G: the corrected-inputs section leads the document", sec.title === "\u26a0 Inputs Corrected Before Calculation");
  A("G: that section prints every correction through the shipped renderer",
    sec.items.length === G.r.guards.length && G.r.guards.every((g, i) => sec.items[i] === guardLine(g)));
  A("G: the entered negative prints with its sign", sec.items.join(" ").indexOf("entered -400,") >= 0);
  const issues = G.r.openIssues.join(" ");
  A("G: every correction is an open issue, rendered through guardVal",
    G.r.guards.every(g => issues.indexOf(guardVal(g, "entered")) >= 0 && issues.indexOf(guardVal(g, "used")) >= 0));
  const meth = (sectionByTitle(G, "Methodology") || {}).content || "";
  A("G: the methodology states the corrections", meth.indexOf("INPUTS CORRECTED") >= 0 && G.r.guards.every(g => meth.indexOf(g.label) >= 0));
  A("G: a corrected input holds confidence at Directional", G.r.confidence === "Directional" && G.subtitle.indexOf("Directional") >= 0);
  A("G: a corrected input is never decision ready", G.signals.decision_ready_signal === false);
  A("G: the signal block counts the corrections", G.signals.inputs_corrected === 2);
  A("G: with a positive cost base the band is published and canonical", SEVERITY_BANDS.indexOf(G.signals.severity) >= 0);

  const J = DOCS.J, jl = (l) => J.r.guards.find(g => g.label === l);
  A("J: a share beyond 100 records in display units", !!jl("Shrinkage") && jl("Shrinkage").entered === 140 && jl("Shrinkage").used === 100 && jl("Shrinkage").unit === "%");
  A("J: the engine ran the share as a fraction", J.d.shrinkage === 1);
  A("J: a negative share records and clamps to zero", !!jl("FCR") && jl("FCR").entered === -20 && J.d.fcr === 0);
  A("J: an escalator below minus 100 clamps to minus 100", !!jl("Wage Growth (labor)") && jl("Wage Growth (labor)").used === -100 && J.d.wageEscalatorPct === -1);
  A("J: a forged cost basis is substituted and disclosed", !!jl("Cost basis") && jl("Cost basis").entered === "forged" && J.d.costBasis === "estimate");
  A("J: exactly the four corrections, no collateral ones", J.r.guards.length === 4);
  A("J: no later year of the projection is negative", J.r.y2 > 0 && J.r.y3 > 0);
  A("J: the printed line reads as a percentage", J.sections[0].items.indexOf("Shrinkage: entered 140%, computed at 100%.") >= 0);

  const I = DOCS.I;
  A("I: occupancy of 120 percent passes uncorrected, per the rail contract", I.d.occupancy === 1.2);
  A("I: attrition of 150 percent passes uncorrected, per the rail contract", I.d.attrition === 1.5);
  A("I: no correction is recorded and no section is added", I.r.guards.length === 0 && I.sections[0].title !== "\u26a0 Inputs Corrected Before Calculation");

  /* Neutrality. The guard must be invisible on every shipped starting point, and must
     hand back the same object so nothing downstream sees a new identity. */
  const guardTCO = DOCS.A.guardTCO, BASE = DOCS.A.BASE, INDUSTRY = DOCS.A.INDUSTRY;
  for (const key of Object.keys(INDUSTRY)) {
    const dd = { ...BASE, ...INDUSTRY[key], industry: key };
    const g = guardTCO(dd);
    A(`${key}: the preset raises no correction and keeps its identity`, g.guards.length === 0 && g.d === dd);
  }
  /* This harness reconstructs the component lines that feed the engine, so it pins them
     to the shipped JSX. A bypass there would otherwise pass every assertion above. */
  for (const line of [
    "const [dRaw, setD] = useState(",
    "const r = computeTCO(dRaw, stance);\n  const d = r.d;",
  ]) A(`the shipped component carries: ${line.replace("\n", " ")}`, SRC.split(line).length === 2);
  A("no second engine call reads the unguarded input", SRC.split("computeTCO(").length === 3);
  for (const k of ["A", "B", "C", "D", "E", "F", "H"])
    A(`${k}: an in-domain set raises no correction`, DOCS[k].r.guards.length === 0 && DOCS[k].d === DOCS[k].dRaw);
}

/* ---- 6c. the guard never corrects a value the form accepts ---- */
/*
 * The domain table and the form are two statements of the same inputs. They drift
 * the moment a field is added to one and not the other. Every NumField in the shipped
 * JSX is read here and held against its row: it must have one, the label must match
 * so the disclosure names the field the reader sees, the display factor must match so
 * the record is in the unit on screen, and the row may be wider than the form but
 * never narrower.
 */
console.log("\n6c. the domain table covers the form and is never narrower");
{
  const FORM = [];
  let at = 0;
  while ((at = SRC.indexOf("<NumField", at)) >= 0) {
    let i = at, depth = 0;
    for (; i < SRC.length; i++) {
      const c = SRC[i];
      if (c === "{") depth++;
      else if (c === "}") depth--;
      else if (depth === 0 && SRC.startsWith("/>", i)) break;
    }
    const t = SRC.slice(at, i);
    const num = (name) => { const m = t.match(new RegExp("\\b" + name + "=\\{(-?[\\d.]+)\\}")); return m ? Number(m[1]) : null; };
    FORM.push({ key: (t.match(/value=\{d\.(\w+)\}/) || [])[1], label: (t.match(/label="([^"]*)"/) || [])[1], min: num("min"), max: num("max"), factor: num("factor") || 1 });
    at = i;
  }
  const ROWS = Object.fromEntries(DOCS.A.TCO_DOMAIN.map(r => [r[0], r]));
  A("the form carries numeric fields to check", FORM.length >= 60);
  A("every form field binds to a named input", FORM.every(f => !!f.key));
  for (const f of FORM) {
    const row = ROWS[f.key];
    A(`${f.key}: has a domain row`, !!row);
    if (!row) continue;
    A(`${f.key}: the row names the field the reader sees`, row[1] === f.label);
    A(`${f.key}: the row records in the unit on screen`, row[5] === f.factor);
    A(`${f.key}: the floor is no higher than the form floor`, f.min === null || row[2] <= f.min);
    A(`${f.key}: the ceiling is no lower than the form ceiling`, f.max === null || row[3] === null || row[3] >= f.max);
  }
  A("no domain row exists without a form field", DOCS.A.TCO_DOMAIN.every(r => FORM.some(f => f.key === r[0])));
}

/* ---- 7. Finance-grade is reachable and is gated on documents ---- */
console.log("\n7. Finance-grade is reachable and is gated on documents");
{
  const F = DOCS.F, A_ = DOCS.A;
  A("F: invoiced costs with no flags reach Finance-grade", F.r.confidence === "Finance-grade");
  A("F: the wire carries the document-evidence boolean", F.signals.has_document_evidence === true);
  A("A: an estimated cost basis does not reach Finance-grade", A_.r.confidence !== "Finance-grade");
  A("A: the wire says so", A_.signals.has_document_evidence === false);
  A("F and A differ only in the cost basis", F.r.annual === A_.r.annual);
}

/* ---------------------------------------------------------------- result */
console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
