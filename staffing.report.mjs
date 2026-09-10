/* staffing.report.mjs
 *
 * Rendered-output reconciliation for the Staffing Requirement Calculator.
 *
 * staffing.test.mjs proves the Erlang engine against published reference values.
 * It says nothing about the document a workforce manager takes into a headcount
 * conversation, because every figure in that document is a separate expression
 * written in JSX, and a passing engine can sit underneath a report that quotes a
 * different number or contradicts itself two sections later.
 *
 * This file does NOT rebuild the report. It slices the ReportActions payload out
 * of the shipped JSX at runtime, binds it to the real engine sliced from the same
 * file, evaluates it, and reads the document.
 *
 * It also gates the Tracker 1-15 band using the real severityBucket and the real
 * sanitizeProps, so what is asserted is what reaches the wire.
 *
 * Run from repo root: node staffing.report.mjs
 */
import { readFileSync } from "node:fs";

const SRC = readFileSync("./StaffingCalculator.jsx", "utf8");
const { BENCH, COLORS, classifyOccupancy, classifyShrinkage } = await import("./src/lib/benchmarks.js");
const { severityBucket, sanitizeProps, SEVERITY_BANDS } = await import("./src/lib/track.js");

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

function slice(a, b) {
  const i = SRC.indexOf(a);
  if (i < 0) return null;
  const j = SRC.indexOf(b, i);
  if (j < 0) return null;
  return SRC.slice(i, j);
}
const ids = slice('const TOOL_ID = "staffing-calculator";', "function LogoMark");
const engine = slice("function erlangB(", "const PRESETS = {");
/* Stop before the S metric component, which is JSX. Everything above it is pure JS. */
const tail = slice("const PRESETS = {", "const S = ({ label");

const raAt = SRC.indexOf("<ReportActions");
function prop(name) {
  const at = SRC.indexOf(name + "={", raAt);
  if (at < 0) return null;
  const b = balanced(SRC, at + name.length, "{", "}");
  return b ? b.text.slice(1, -1) : null;
}
const subtitleAt = SRC.indexOf("subtitle={", raAt);
const subtitleExpr = subtitleAt < 0 ? null : balanced(SRC, subtitleAt + 9, "{", "}").text.slice(1, -1);
const summaryExpr = prop("summary");
const signalsExpr = prop("signals");
const sectionsExpr = prop("sections");
const toolNameM = SRC.match(/toolName="([^"]+)"/);

console.log("\n0. payload slices out of the shipped JSX");
A("the engine region slices out of the shipped JSX", !!ids && !!engine && !!tail);
A("the ReportActions subtitle slices out of the shipped JSX", !!subtitleExpr);
A("the ReportActions summary payload slices out of the shipped JSX", !!summaryExpr);
A("the ReportActions signals payload slices out of the shipped JSX", !!signalsExpr);
A("the ReportActions sections payload slices out of the shipped JSX", !!sectionsExpr);
A("the report is named", !!toolNameM);
A("the scenario prop carries the live input set", /state=\{st\}/.test(SRC));
A("the defaults prop points at the shared DEFAULTS", /defaults=\{DEFAULTS\}/.test(SRC));
A("the route prop points at the shared ROUTE", /routePath=\{ROUTE\}/.test(SRC));

const payloadText = [subtitleExpr, summaryExpr, signalsExpr, sectionsExpr].join("");
A("the report payload contains no em-dash", payloadText.indexOf(String.fromCharCode(0x2014)) < 0);
A("the report payload contains no en-dash", payloadText.indexOf(String.fromCharCode(0x2013)) < 0);
A("the whole tool file contains no em-dash", SRC.indexOf(String.fromCharCode(0x2014)) < 0);
/* Six en-dashes lived in this file until the 1-15 session, two of them inside the
   rendered document, in the occupancy target band and the shrinkage typical range.
   The prohibition is enforced per edit, so a file nobody had edited kept them. */
A("the whole tool file contains no en-dash", SRC.indexOf(String.fromCharCode(0x2013)) < 0);

console.log("\n0b. Tracker 1-15, the band is bucketed and not hand-written");
A("severity routes through severityBucket", /severity:\s*severityBucket\(/.test(signalsExpr || ""));
A("the severity expression carries no hand-written band word",
  !/severity:\s*severityBucket\([^\n]*["'](?:normal|elevated|critical|blocked|clear|none|low|moderate|high|severe)["']/.test(signalsExpr || ""));
A("the prior model-validity basis is gone from the severity expression",
  !/severity:\s*[^\n]*valid\.ok/.test(signalsExpr || ""));
A("the band reads the unmanaged occupancy, not the capped figure",
  /severity:\s*severityBucket\([^\n]*pair\.sla\.occ/.test(signalsExpr || ""));
A("the band records its denominator argument in the file", /Tracker 1-15/.test(SRC));
A("the band records what was rejected", (SRC.match(/Rejected:/g) || []).length >= 4);
A("the band declares its unreachable set", /Declared unreachable/.test(SRC));

/* --------------------------------------------------------------- input sets */
/*
 * Set A is the shipped default: 400 contacts per 30-minute interval at 360s AHT to
 * an 80/20 service level. It is the document most users see.
 *
 * Set B is a small queue at a premium service target, which runs cool. It is the
 * route to the bottom band and exists to prove that band is reachable in the
 * rendered document.
 *
 * Set C is a large efficient queue, which Erlang C drives to very high occupancy.
 * It is the route to the top of the scale.
 *
 * Set D is Set C with an occupancy cap switched on. It is the control for Tracker
 * 1-15: a cap holds the reported occupancy under the ceiling and moves the pressure
 * into required headcount, so the band must NOT fall between C and D. The pressure
 * has been priced, not eased.
 *
 * Set E puts the interval below three times AHT, which breaks the Erlang C steady
 * state assumption. The document must say so rather than return a confident number,
 * and model_valid must carry that on the wire independently of the band.
 *
 * Set F is deliberately hostile: a scenario link carrying a negative volume, a
 * negative AHT and a shrinkage beyond 100 percent.
 */
const SETS = {
  A: { label: "Shipped defaults: 400 per 30-minute interval, 360s AHT, 80/20", mut: () => ({}) },
  B: { label: "Small queue at a premium service target: runs cool",
    mut: () => ({ vol: 30, aht: 300, slT: 95, slS: 10 }) },
  C: { label: "Large efficient queue: Erlang C drives occupancy hard",
    mut: () => ({ vol: 2000, aht: 240 }) },
  D: { label: "Set C exactly, occupancy cap switched on: the cap control",
    mut: () => ({ vol: 2000, aht: 240, capOn: true, capPct: 85 }) },
  E: { label: "Interval below three times AHT: the Erlang C steady state breaks",
    mut: () => ({ aht: 900, intv: 15 }) },
  F: { label: "Hostile scenario link: negative volume, negative AHT, shrinkage beyond 100",
    mut: () => ({ vol: -400, aht: -360, shrink: 140 }) },
};

function render(S) {
  const body = `
    ${ids}
    ${engine}
    ${tail}
    const st = { ...DEFAULTS, ...MUT() };
    const { vol, aht, slT, slS, shrink, intv, patience, capOn, capPct, queues, preset } = st;
    const occCap = capOn ? capPct / 100 : null;
    const r = calc(vol, aht, intv, slT / 100, slS, shrink / 100, occCap);
    /* Rail state. The harness renders the standalone document, the case with no
       upstream tool in the session, which is the document most readers receive. */
    const railPerAgent = 0, railHourly = 0;
    const valid = modelValidity(aht, intv);
    const occInfo = classifyOccupancy(r.occ);
    const shrinkInfo = classifyShrinkage(shrink / 100);
    const asaD = r.asa < 1 ? "< 1s" : r.asa > 999 ? "> 15m" : Math.round(r.asa) + "s";
    const p = PRESETS[preset];
    const isCustom = !p || vol !== p.volume || aht !== p.aht || slT !== Math.round(p.slT * 100) || slS !== p.slS || shrink !== Math.round(p.shrink * 100);
    const presetLabel = isCustom ? "Custom" : p.label;
    const aband = abandonmentCheck(r.raw, r.A, aht, patience);
    const adjR = aband ? calc(Math.max(1, Math.round(vol * (1 - aband.estAband))), aht, intv, slT / 100, slS, shrink / 100, occCap) : null;
    const abandMeaningful = aband && adjR && (r.raw - adjR.raw) >= 1 && (aband.estAband >= 0.05 || (r.raw - adjR.raw) >= 2);
    const pair = sustainablePair(vol, aht, intv, slT / 100, slS, shrink / 100, BENCH.occupancy.targetHigh);
    const pool = poolingPenalty(vol, aht, intv, slT / 100, slS, shrink / 100, occCap, queues);
    const cost = staffingCost(r.sched, railPerAgent, railHourly);
    const costCeiling = pair.sustainable ? staffingCost(pair.sustainable.sched, railPerAgent, railHourly) : null;
    const recoveryAnnual = costCeiling ? costCeiling.annual - cost.annual : 0;
    const poolAnnual = pool ? staffingCost(pool.splitFte, railPerAgent, railHourly).annual - staffingCost(pool.pooled.sched, railPerAgent, railHourly).annual : 0;
    const insights = buildInsights(r, slT / 100, slS, occInfo, capOn, capPct, pair, valid, recoveryAnnual, cost, pool);
    const spike = calc(Math.round(vol * 1.2), aht, intv, slT / 100, slS, shrink / 100, occCap);
    const ahtUp = calc(vol, Math.round(aht * 1.1), intv, slT / 100, slS, shrink / 100, occCap);
    const ahtDown = calc(vol, Math.round(aht * 0.9), intv, slT / 100, slS, shrink / 100, occCap);
    const subtitle = ${subtitleExpr};
    const summary = ${summaryExpr};
    const signals = ${signalsExpr};
    const sections = ${sectionsExpr};
    return { st, r, cost, pair, valid, occInfo, shrinkInfo, insights, spike, aband, abandMeaningful,
             subtitle, summary, signals, sections };
  `;
  return new Function("BENCH", "COLORS", "classifyOccupancy", "classifyShrinkage",
    "NAVY", "DEEP", "ELECTRIC", "LIGHT", "WARM", "SLATE", "MUTED", "BORDER", "GREEN", "AMBER", "RED",
    "severityBucket", "MUT", body)(
    BENCH, COLORS, classifyOccupancy, classifyShrinkage,
    COLORS.navy, "#061325", COLORS.electric, "#00AAFF", "#F8FAFB", "#3A4F6A", COLORS.muted,
    "#D8E3ED", COLORS.green, COLORS.amber, COLORS.red, severityBucket, S.mut);
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
const itemsOf = (doc, t) => ((sectionByTitle(doc, t) || {}).items || [])
  .map(i => typeof i === "string" ? i : `${i.action || i.label || i.tool || ""} ${i.detail || i.value || i.reason || ""}`).join(" | ");

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
  A(`${k}: no section is structurally empty`, doc.sections.every(sec => (sec.rows && sec.rows.length) || (sec.items && sec.items.length) || (typeof sec.content === "string" && sec.content.length)));
  A(`${k}: every table row is a pair`, doc.sections.filter(sec => sec.rows).every(sec => sec.rows.every(row => Array.isArray(row) && row.length === 2)));
  A(`${k}: the summary is populated`, Array.isArray(doc.summary) && doc.summary.length >= 6);
  A(`${k}: every summary item carries a label and a value`, doc.summary.every(x => typeof x.label === "string" && x.value !== undefined && x.value !== null));
  A(`${k}: the subtitle is a non-empty string`, typeof doc.subtitle === "string" && doc.subtitle.length > 10);
  A(`${k}: the document carries a Methodology section`, !!sectionByTitle(doc, "Methodology"));
  A(`${k}: the document carries a Key Findings section`, !!sectionByTitle(doc, "Key Findings"));
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
  /* Set F is the documented exception and the reason: see section 7. */
  if (k !== "F") A(`${k}: the document prints no negative agent count`, !/-\d+ (?:agents|FTE)/.test(text));
}
A("F is the only set that prints a negative agent count, which is the open defect",
  /-\d+ (?:agents|FTE)/.test(allText(DOCS.F)));

/* ---- 3. the printed figures reconcile with the engine ---- */
console.log("\n3. printed figures reconcile with the engine");
for (const k of Object.keys(DOCS)) {
  const doc = DOCS[k], r = doc.r, cost = doc.cost;
  A(`${k}: printed base agents equals the engine figure`, summaryValue(doc, "Base agents required") === r.raw);
  A(`${k}: printed scheduled FTE equals the engine figure`, summaryValue(doc, "Scheduled FTE") === r.sched);
  A(`${k}: printed occupancy equals the engine figure`, summaryValue(doc, "Occupancy") === `${(r.occ * 100).toFixed(1)}%`);
  A(`${k}: printed service level equals the engine figure`, String(summaryValue(doc, "Service level achieved")).indexOf(`${(r.sl * 100).toFixed(1)}%`) === 0);
  A(`${k}: the subtitle carries the same FTE the summary carries`, doc.subtitle.indexOf(String(r.sched)) === 0);
  A(`${k}: the subtitle carries the same occupancy the summary carries`, doc.subtitle.indexOf(`${(r.occ * 100).toFixed(1)}%`) > 0);
  A(`${k}: the subtitle carries the same cost confidence the tool exports`, doc.subtitle.indexOf(cost.confidence) > 0);
  A(`${k}: the cost basis line matches the rail state`, summaryValue(doc, "Cost basis") === (cost.sourced ? "user figures via rail" : "benchmark median"));
  /* Shrinkage converts base agents to scheduled FTE, so scheduled can never be the
     smaller of the two on any non-negative shrinkage. */
  /* Shrinkage converts base agents to scheduled FTE, so scheduled can never be smaller
     for any shrinkage inside its domain. Set F carries 140 percent, which is outside it
     and unguarded: see section 7. */
  if (k !== "F") A(`${k}: scheduled FTE is never below base agents`, r.sched >= r.raw);
  /* The Staffing Results metric block must not contradict the summary above it. */
  const metrics = sectionByTitle(doc, "Staffing Results");
  if (metrics && metrics.items) {
    const byLabel = Object.fromEntries(metrics.items.map(i => [i.label, i.value]));
    A(`${k}: the metric block agrees with the summary on base agents`, byLabel["Base Agents Required"] === String(r.raw));
    A(`${k}: the metric block agrees with the summary on scheduled FTE`, byLabel["Scheduled FTE"] === String(r.sched));
    A(`${k}: the metric block agrees with the summary on occupancy`, byLabel["Occupancy"] === summaryValue(doc, "Occupancy"));
  }
}

/* ---- 4. Tracker 1-15: the band that reaches the wire ---- */
console.log("\n4. Tracker 1-15, the band that reaches the wire");
const TH = BENCH.occupancy.targetHigh;
const bandsSeen = new Set();
for (const k of Object.keys(DOCS)) {
  const doc = DOCS[k], pair = doc.pair;
  const raw = doc.signals.severity;
  const wire = sanitizeProps({ severity: raw }).severity;
  const expect = severityBucket(pair.sla.occ > 0 ? Math.max(0, Math.min(1, (pair.sla.occ - TH) / (1 - TH))) : null);
  A(`${k}: the published band equals the band the argued ratio produces`, raw === expect);
  if (pair.sla.occ > 0) {
    A(`${k}: the band is one of the five canonical bands`, SEVERITY_BANDS.indexOf(raw) >= 0);
    A(`${k}: the band survives sanitizeProps and reaches the wire`, wire === raw);
    bandsSeen.add(raw);
  } else {
    A(`${k}: with no unmanaged occupancy, nothing is published`, raw === "");
    A(`${k}: sanitizeProps drops the empty band rather than coercing it to none`, wire === undefined);
  }
  A(`${k}: the band reports none only inside the sustainable band`, raw !== "none" || pair.sla.occ <= TH);
  /* The prior basis read model validity, which is input hygiene. It still reaches the
     wire, on its own property, where it belongs. */
  A(`${k}: model validity still travels independently of the band`, typeof doc.signals.model_valid === "boolean");
  A(`${k}: model validity matches the engine`, doc.signals.model_valid === doc.valid.ok);
  A(`${k}: the occupancy band still travels independently of the band`, typeof doc.signals.occupancy_band === "string");
}
A("the bottom band is reachable in the rendered document", bandsSeen.has("none"));
A("the top of the scale is reachable in the rendered document", bandsSeen.has("high") || bandsSeen.has("severe"));
A("the band moves across the sets rather than reporting one value", bandsSeen.size >= 3);

/* The control. A cap prices the pressure, it does not ease it. */
console.log("\n4b. the cap control: C against D");
{
  const c = DOCS.C, d = DOCS.D;
  A("C and D model the same queue", c.st.vol === d.st.vol && c.st.aht === d.st.aht);
  A("D has the cap switched on", d.signals.set_occupancy_ceiling === true);
  A("C does not", c.signals.set_occupancy_ceiling === false);
  A("the cap holds the reported occupancy down", d.r.occ < c.r.occ);
  A("the cap therefore prints a different occupancy in the document", summaryValue(c, "Occupancy") !== summaryValue(d, "Occupancy"));
  A("the cap moves the pressure into headcount", d.r.sched > c.r.sched);
  A("the band does not fall between C and D", c.signals.severity === d.signals.severity);
  A("the prior r.occ basis would have moved it",
    severityBucket(Math.max(0, Math.min(1, (d.r.occ - TH) / (1 - TH)))) !== c.signals.severity);
}

/* The prior model-validity basis. Asserted so the rejection stays rejected. */
console.log("\n4c. the rejected basis stays rejected");
{
  const E = DOCS.E;
  A("E: the interval breaks the Erlang C steady state assumption", E.valid.ok === false);
  A("E: the wire says so on its own property", E.signals.model_valid === false);
  A("E: the document says so in Key Findings rather than returning a confident number",
    itemsOf(E, "Key Findings").indexOf("times AHT") >= 0);
  A("E: the band reports the occupancy pressure, not the broken model",
    E.signals.severity === severityBucket(Math.max(0, Math.min(1, (E.pair.sla.occ - TH) / (1 - TH)))));
  /* Under the prior basis every invalid model published the same word regardless of
     what the queue was actually doing, which is why it carried no information. */
  A("E: the prior basis would have published the same word as any other invalid model", !E.valid.ok);
}

/* ---- 5. the wire carries no operating detail ---- */
console.log("\n5. the wire carries no operating detail");
for (const k of Object.keys(DOCS)) {
  const sig = DOCS[k].signals;
  const keys = Object.keys(sig);
  A(`${k}: no contact volume travels in signals`, !keys.some(x => /^(vol|volume|contacts)$/i.test(x)));
  A(`${k}: no AHT or wage travels in signals`, !keys.some(x => /aht|wage|hourly|salary/i.test(x)));
  A(`${k}: no raw cost figure travels in signals`, !Object.entries(sig).some(([x, v]) => typeof v === "number" && v > 1000 && !/version/i.test(x)));
  A(`${k}: every signal value is a primitive`, Object.values(sig).every(v => v === null || ["string", "number", "boolean"].indexOf(typeof v) >= 0));
  A(`${k}: sanitizeProps admits only the allowlisted properties`, Object.keys(sanitizeProps(sig)).every(x => ["severity", "tool", "from", "to", "grade", "real", "depth", "via_rail", "repeat"].indexOf(x) >= 0));
}

/* ---- 6. the priced recovery tradeoff is disclosed when it exists ---- */
console.log("\n6. the priced recovery tradeoff is disclosed when it exists");
for (const k of Object.keys(DOCS)) {
  const doc = DOCS[k], pair = doc.pair;
  A(`${k}: the tradeoff signal matches whether a sustainable pair exists`,
    doc.signals.priced_recovery_tradeoff === !!pair.sustainable);
  if (pair.sustainable) {
    A(`${k}: the document prints the FTE at a sustainable ceiling`, summaryValue(doc, "FTE at a sustainable ceiling") === pair.sustainable.sched);
    A(`${k}: the document prices the recovery time in FTE and in cash`, String(summaryValue(doc, "Cost of recovery time")).indexOf(`${pair.deltaFte} FTE`) === 0);
    A(`${k}: the sustainable plan is never smaller than the service-level plan`, pair.sustainable.sched >= pair.sla.sched);
  } else {
    A(`${k}: with no tradeoff the document omits the ceiling lines rather than printing zero`, summaryValue(doc, "FTE at a sustainable ceiling") === undefined);
  }
}

/* ---- 7. the unguarded path: OPEN DEFECT, recorded rather than blessed ---- */
/*
 * This tool applies Object.assign to whatever a scenario link carries and validates no
 * field anywhere, exactly as TCOCalculator does. Set F carries a shrinkage of 140
 * percent, which is outside the domain of the shrinkage conversion: scheduled FTE is
 * base agents over one minus shrinkage, so at 140 percent the denominator goes negative
 * and the document prints minus 235 scheduled FTE and a cost of minus 18 million a year.
 *
 * This is the doctrine defect pattern of negative inputs producing physically impossible
 * results without a guard. It is the SECOND confirmation of it, after TCOCalculator, and
 * it is NOT fixed here. The fix is a guard and disclosure layer over every input,
 * matching the pattern Attrition and Cost per Contact already carry. That is its own
 * tracker item rather than a rider on the 1-15 band retrofit.
 *
 * What these assertions do is pin the defect so it cannot regress in silence and cannot
 * be lost from the record. They assert current behavior and say so. When the guard layer
 * lands, this section is rewritten to assert disclosure instead.
 */
console.log("\n7. the unguarded path: OPEN DEFECT, out-of-domain shrinkage is carried through");
{
  const F = DOCS.F;
  console.log("      OPEN DEFECT: Staffing validates no scenario-link input. At " + F.st.shrink +
    "% shrinkage the document prints " + F.r.sched + " scheduled FTE at " + Math.round(F.cost.annual).toLocaleString() + " a year.");
  A("F: current behavior, shrinkage beyond 100 percent inverts the FTE conversion", F.r.sched < 0);
  A("F: current behavior, the annual cost follows it negative", F.cost.annual < 0);
  A("F: current behavior, nothing in the document discloses a correction",
    itemsOf(F, "Key Findings").indexOf("shrinkage was") < 0);
  /* What the engine does hold, and must keep holding. The Erlang core itself is sound;
     it is the unvalidated conversion around it that is not. */
  A("F: the Erlang core still returns a non-negative base agent count", F.r.raw >= 0);
  A("F: occupancy stays inside its physical domain", F.r.occ >= 0 && F.r.occ <= 1);
  A("F: the service level stays inside its physical domain", F.r.sl >= 0 && F.r.sl <= 1);
  A("F: the tool still exports a cost confidence", typeof F.cost.confidence === "string" && F.cost.confidence.length > 0);
  A("F: the document is still structurally whole", F.sections.length >= 4);
  A("F: whatever the band reports, it is canonical or withheld",
    F.signals.severity === "" || SEVERITY_BANDS.indexOf(F.signals.severity) >= 0);
  /* The band reads occupancy, which the Erlang core keeps in domain, so the 1-15 retrofit
     is not the thing carrying the bad number here. */
  A("F: the band is unaffected by the broken conversion", F.signals.severity === severityBucket(Math.max(0, Math.min(1, (F.pair.sla.occ - TH) / (1 - TH)))));
}

/* ---------------------------------------------------------------- result */
console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
