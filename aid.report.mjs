/* aid.report.mjs
 *
 * Rendered-output reconciliation for the AI Deflection Reality Check.
 *
 * aid.test.mjs proves the arithmetic. It says nothing about the document a buyer
 * takes into a vendor negotiation, because every figure in that document is a
 * separate expression written in JSX, and a passing engine can sit underneath a
 * report that quotes a different number or contradicts itself in prose. Five
 * prior tools confirmed that pattern.
 *
 * This file does NOT rebuild the report. It slices the ReportActions payload out
 * of the shipped JSX at runtime, binds it to the real engine sliced from the same
 * file, evaluates it, and reads the document. Every figure checked below is the
 * figure the PDF prints.
 *
 * It also gates the Tracker 1-15 band, using the real severityBucket and the real
 * sanitizeProps, so what is asserted is what reaches the wire rather than what the
 * tool intended to send.
 *
 * Run from repo root: node aid.report.mjs
 */
import { readFileSync } from "node:fs";

const SRC = readFileSync("./AIDeflectionRealityCheck.jsx", "utf8");
const RA = readFileSync("./ReportActions.jsx", "utf8");
const { MECH, MECH_ORDER, MECH_DEFAULT } = await import("./src/lib/mech.js");
const { createGuards } = await import("./src/lib/guards.js");
const { severityBucket, sanitizeProps, SEVERITY_BANDS } = await import("./src/lib/track.js");

let pass = 0, fail = 0;
const A = (nm, c) => { if (c) pass++; else { fail++; console.log("  FAIL:", nm); } };

/* ---------------------------------------------------------------- slicing */

/* The slicer the other five rendered harnesses use treats an apostrophe as a string
   delimiter wherever it appears, so a comment or a template literal containing the
   word vendor followed by an apostrophe moves the boundary and the slice fails
   silently. This tool carries three of those inside its Methodology text, which is
   how the fragility was found rather than worked around.

   This is a real lexer instead: it skips line comments, block comments, quoted
   strings and template literals, and it descends into every substitution inside a
   template so a nested brace cannot escape the count. Carried as open debt to
   backport to the other five harnesses. */

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
const raAt = SRC.indexOf("<ReportActions");
function prop(name) {
  const at = SRC.indexOf(name + "={", raAt);
  if (at < 0) return null;
  const b = balanced(SRC, at + name.length, "{", "}");
  return b ? b.text.slice(1, -1) : null;
}

/* The engine plus every pure-JS module const the payload leans on. One slice, taken
   by string marker rather than by brace balance, so a stray apostrophe inside a
   template literal in buildAnalystRead cannot move the boundary. */
const ma = SRC.indexOf("/* @engine-start"), mb = SRC.indexOf("function LogoMark");
if (ma < 0 || mb < 0) { console.error("BLOCKER: engine region markers not found."); process.exit(1); }
const engineRegion = SRC.slice(ma, mb).replace(/^export /gm, "");

const sectionsAt = SRC.indexOf("const reportSections = [");
const sectionsB = sectionsAt < 0 ? null : balanced(SRC, sectionsAt, "[", "]");
const sectionsExpr = sectionsB ? sectionsB.text : null;

const subtitleAt = SRC.indexOf("subtitle={", raAt);
const subtitleExpr = subtitleAt < 0 ? null : balanced(SRC, subtitleAt + 9, "{", "}").text.slice(1, -1);
const summaryExpr = prop("summary");
const signalsExpr = prop("signals");
const toolNameM = SRC.match(/toolName="([^"]+)"/);

console.log("\n0. payload slices out of the shipped JSX");
A("the ReportActions subtitle slices out of the shipped JSX", !!subtitleExpr);
A("the ReportActions summary payload slices out of the shipped JSX", !!summaryExpr);
A("the ReportActions signals payload slices out of the shipped JSX", !!signalsExpr);
A("the reportSections array slices out of the shipped JSX", !!sectionsExpr);
A("the report is named", !!toolNameM);
A("the scenario prop carries the live input set", /state=\{s\}/.test(SRC));
A("the defaults prop points at the shared DEFAULTS", /defaults=\{DEFAULTS\}/.test(SRC));
A("the route prop points at the shared ROUTE", /routePath=\{ROUTE\}/.test(SRC));
A("the sections prop points at reportSections", /sections=\{reportSections\}/.test(SRC));

const payloadText = [subtitleExpr, summaryExpr, signalsExpr, sectionsExpr].join("");
A("the report payload contains no em-dash", payloadText.indexOf(String.fromCharCode(0x2014)) < 0);
A("the report payload contains no en-dash", payloadText.indexOf(String.fromCharCode(0x2013)) < 0);
A("the whole tool file contains no em-dash", SRC.indexOf(String.fromCharCode(0x2014)) < 0);
A("the whole tool file contains no en-dash", SRC.indexOf(String.fromCharCode(0x2013)) < 0);

/* The severity expression must route through severityBucket rather than hand-write a
   word. Tracker 1-15. A hand-written word outside the allowlist is dropped by
   sanitizeProps in silence, which is the failure this gate exists to make impossible. */
console.log("\n0b. Tracker 1-15, the band is bucketed and not hand-written");
A("severity routes through severityBucket", /severity:\s*severityBucket\(/.test(signalsExpr || ""));
A("the severity expression carries no hand-written band word",
  !/severity:\s*[^\n]*["'](?:normal|elevated|critical|blocked|clear|none|low|moderate|high|severe)["']/.test(signalsExpr || ""));
A("the band records its denominator argument in the file", /Tracker 1-15/.test(SRC));
A("the band records what was rejected", (SRC.match(/Rejected:/g) || []).length >= 4);
A("the band declares its unreachable set", /Declared unreachable/.test(SRC));

/* --------------------------------------------------------------- input sets */
/*
 * Set A is the shipped default. Marginal cost is 0, meaning not supplied, so the tool
 * assumes 60 percent of loaded and holds confidence at Directional. It is the document
 * most users see.
 *
 * Set B supplies a real marginal cost, a cash-creditable capacity action and proposal
 * evidence. It is the case that should reach the strongest grade this tool can give.
 *
 * Set C is deliberately hostile: negative volume, rates beyond 100, a capacity action
 * that does not exist and negative costs. Every one of those is reachable through a
 * scenario link. The document must still be whole and must print no impossible figure.
 *
 * Set D selects the zero-realization capacity action. Nothing converts to cash, so the
 * program is a pure loss and break-even is unreachable at any resolution rate.
 *
 * Set E is a free bot: no platform cost, no QA, no tuning, no knowledge maintenance and
 * no escalation premium. Break-even sits at zero, which is the only route to the bottom
 * band. It exists to prove that band is reachable in the rendered document.
 *
 * Set F drives the claimed resolution rate to zero. There is no claim to measure the
 * program against, so the band must be withheld rather than reported as none.
 */
const CASH_KEY = MECH_ORDER.filter(k => MECH[k].cred === "cash").pop();
const ZERO_KEY = MECH_ORDER.filter(k => MECH[k].f === 0)[0];

const SETS = {
  A: { label: "Shipped defaults, marginal cost not supplied", mut: () => ({}) },
  B: { label: "Real marginal cost, cash capacity action, proposal evidence",
    mut: () => ({ marg: 4.2, mech: CASH_KEY, evidence: "proposal", costConfirmed: true }) },
  C: { label: "Hostile scenario link: negative volume, rates beyond 100, unknown action, negative costs",
    mut: () => ({ M: -80000, cpc: -7, marg: -4, eligibleRate: 180, mech: "not-a-mechanism",
      vA: { apparentResolutionRate: 220, repeatLeakRate: -40, escalationPenalty: -60,
        implOneTime: -50000, botPlatformCost: -8000, qaCost: -2000, tuningHours: -40,
        tuningRate: -65, knowledgeMaintHours: -20, knowledgeRate: -55 } }) },
  D: { label: "Zero-realization capacity action: freed time never becomes cash",
    mut: () => ({ marg: 4.2, mech: ZERO_KEY }) },
  E: { label: "Free bot: no operating cost and no escalation premium",
    mut: () => ({ marg: 4.2, mech: CASH_KEY,
      vA: { apparentResolutionRate: 65, repeatLeakRate: 18, escalationPenalty: 0, implOneTime: 0,
        botPlatformCost: 0, qaCost: 0, tuningHours: 0, tuningRate: 65, knowledgeMaintHours: 0, knowledgeRate: 55 } }) },
  F: { label: "Zero claimed resolution: no claim to measure against",
    mut: () => ({ marg: 4.2, mech: CASH_KEY,
      vA: { apparentResolutionRate: 0, repeatLeakRate: 18, escalationPenalty: 25, implOneTime: 0,
        botPlatformCost: 8000, qaCost: 2000, tuningHours: 40, tuningRate: 65, knowledgeMaintHours: 20, knowledgeRate: 55 } }) },
};

function render(S) {
  const body = `
    ${engineRegion}
    const base = { ...DEFAULTS, vA: { ...DEFAULTS.vA }, vB: { ...DEFAULTS.vB } };
    const mut = MUT();
    const s = { ...base, ...mut, vA: { ...base.vA, ...(mut.vA || {}) }, vB: { ...base.vB, ...(mut.vB || {}) } };
    const inputA = { M: s.M, cpc: s.cpc, marg: s.marg, eligibleRate: s.eligibleRate, mech: s.mech,
      rampOn: s.rampOn, rampMonths: s.rampMonths, evidence: s.evidence, costBasisOwned: s.costConfirmed, ...s.vA };
    const inputB = { ...inputA, ...s.vB };
    const R = engine(inputA);
    const RB = engine(inputB);
    const scenarios = buildScenarios(inputA);
    const analyst = buildAnalystRead(R);
    const winner = R.netSavings >= RB.netSavings ? "A" : "B";
    const sensLow = R.netSavings * (1 - R.band), sensHigh = R.netSavings * (1 + R.band);
    /* Rail state. The harness renders the standalone document, the case with no upstream
       tool in the session, which is the document most readers receive. */
    const pulled = { M: false, cpc: false, marg: false };
    const consistent = false;
    const margSource = false;
    const fromLink = false;
    const subtitle = ${subtitleExpr};
    const summary = ${summaryExpr};
    const signals = ${signalsExpr};
    const sections = ${sectionsExpr};
    return { s, R, RB, subtitle, summary, signals, sections, analyst, scenarios };
  `;
  return new Function("MECH", "MECH_ORDER", "MECH_DEFAULT", "severityBucket", "createGuards", "MUT", body)(
    MECH, MECH_ORDER, MECH_DEFAULT, severityBucket, createGuards, S.mut);
}

function allText(doc) {
  const parts = [doc.subtitle];
  for (const sec of doc.sections) {
    parts.push(sec.title);
    if (sec.items) for (const it of sec.items) parts.push(typeof it === "string" ? it : `${it.label || it.tool || ""} ${it.value || it.reason || it.detail || ""}`);
    if (sec.rows) for (const row of sec.rows) parts.push(row.join(" "));
    if (typeof sec.content === "string") parts.push(sec.content);
  }
  for (const x of doc.summary) parts.push(`${x.label} ${x.value}`);
  for (const t of doc.analyst) parts.push(t);
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
  A(`${k}: no section is empty`, doc.sections.every(sec => (sec.rows && sec.rows.length) || (sec.items && sec.items.length) || (typeof sec.content === "string" && sec.content.length)));
  A(`${k}: every table row is a pair`, doc.sections.filter(sec => sec.rows).every(sec => sec.rows.every(row => Array.isArray(row) && row.length === 2)));
  A(`${k}: the summary is populated`, Array.isArray(doc.summary) && doc.summary.length >= 8);
  A(`${k}: every summary item carries a label and a value`, doc.summary.every(x => typeof x.label === "string" && x.value !== undefined && x.value !== null));
  A(`${k}: the subtitle is a non-empty string`, typeof doc.subtitle === "string" && doc.subtitle.length > 10);
  A(`${k}: the analyst read is populated`, Array.isArray(doc.analyst) && doc.analyst.length >= 4);
}

/* ---- 2. no impossible figure reaches the page ---- */
console.log("\n2. no impossible figure reaches the page");
for (const k of Object.keys(DOCS)) {
  const text = allText(DOCS[k]);
  A(`${k}: the document prints no NaN`, !/NaN/.test(text));
  A(`${k}: the document prints no Infinity`, !/Infinity/.test(text));
  A(`${k}: the document prints no undefined`, !/undefined/.test(text));
  A(`${k}: the document prints no null`, !/\bnull\b/.test(text));
  A(`${k}: the document prints no [object Object]`, !/\[object Object\]/.test(text));
  A(`${k}: the document prints no em-dash`, text.indexOf(String.fromCharCode(0x2014)) < 0);
  A(`${k}: the document prints no en-dash`, text.indexOf(String.fromCharCode(0x2013)) < 0);
  A(`${k}: no money figure prints with a broken magnitude`, !/\$-/.test(text));
}

/* ---- 3. the printed figures reconcile with the engine ---- */
console.log("\n3. printed figures reconcile with the engine");
for (const k of Object.keys(DOCS)) {
  const doc = DOCS[k], R = doc.R;
  const money = (v) => (v < 0 ? "-$" : "$") + Math.abs(Math.round(v)).toLocaleString();
  A(`${k}: printed net savings equals the engine net savings`, summaryValue(doc, "Net savings monthly") === money(R.netSavings));
  A(`${k}: printed vendor claim equals the engine vendor claim`, summaryValue(doc, "Vendor claim monthly") === money(R.vendorClaim));
  A(`${k}: printed steady-state annual equals the engine figure`, summaryValue(doc, "Steady-state annual") === money(R.steadyAnnual));
  A(`${k}: printed year one net equals the engine figure`, summaryValue(doc, "Year 1 net") === money(R.year1));
  A(`${k}: printed recommended action equals the engine verdict`, summaryValue(doc, "Recommended action") === R.verdict);
  A(`${k}: printed apparent resolution equals the engine rate`, summaryValue(doc, "Apparent resolution, of involved") === R.rp + "%");
  A(`${k}: printed net automation equals the engine rate`, summaryValue(doc, "Net automation, of total") === R.netAutomationRate.toFixed(1) + "%");
  A(`${k}: printed break-even is a rate when finite and a word when not`,
    isFinite(R.beResPct) ? summaryValue(doc, "Break-even resolution") === R.beResPct.toFixed(1) + "%" : summaryValue(doc, "Break-even resolution") === "never");
  A(`${k}: the subtitle carries the same verdict the summary carries`, doc.subtitle.indexOf(R.verdict) === 0);
  A(`${k}: the subtitle carries the same confidence the tool exports`, doc.subtitle.indexOf(R.headlineConf) > 0);
}

/* ---- 4. the decision section never contradicts the summary ---- */
console.log("\n4. the decision section never contradicts the summary");
for (const k of Object.keys(DOCS)) {
  const doc = DOCS[k];
  const dec = sectionByTitle(doc, "Decision");
  A(`${k}: the document carries a Decision section`, !!dec && !!dec.rows);
  if (dec && dec.rows) {
    const byLabel = Object.fromEntries(dec.rows.map(r => [r[0], r[1]]));
    A(`${k}: the Decision action matches the summary action`, byLabel["Recommended action"] === summaryValue(doc, "Recommended action"));
    A(`${k}: the Decision net savings matches the summary net savings`, byLabel["Net savings monthly"] === summaryValue(doc, "Net savings monthly"));
    A(`${k}: the Decision confidence matches the tool confidence`, byLabel["Confidence"] === doc.R.headlineConf);
  }
}

/* ---- 5. Tracker 1-15: the band that reaches the wire ---- */
console.log("\n5. Tracker 1-15, the band that reaches the wire");
const bandsSeen = new Set();
for (const k of Object.keys(DOCS)) {
  const doc = DOCS[k], R = doc.R;
  const raw = doc.signals.severity;
  const wire = sanitizeProps({ severity: raw }).severity;
  const expect = severityBucket(R.severityRatio);
  A(`${k}: the published band equals the band the engine ratio produces`, raw === expect);
  A(`${k}: the ratio is a number in domain or is withheld`, R.severityRatio === null || (R.severityRatio >= 0 && R.severityRatio <= 1));
  if (R.severityRatio !== null) {
    A(`${k}: the band is one of the five canonical bands`, SEVERITY_BANDS.indexOf(raw) >= 0);
    A(`${k}: the band survives sanitizeProps and reaches the wire`, wire === raw);
    bandsSeen.add(raw);
  } else {
    A(`${k}: with no eligible volume routed, nothing is published`, raw === "");
    A(`${k}: sanitizeProps drops the empty band rather than coercing it to none`, wire === undefined);
  }
  A(`${k}: the band never reports none while the program fails to break even`,
    !(raw === "none" && !isFinite(R.beResPct)));
  A(`${k}: the band reports severe whenever break-even is unreachable`,
    isFinite(R.beResPct) || R.severityRatio === null || raw === "severe");
  /* Tracker 1-15, the Set F defect. Break-even does not depend on the rate claimed, so a
     zero claim against a positive break-even is a claim below any rate that pays. The
     first cut withheld the band there, which reported not known where the answer is
     unambiguous. */
  A(`${k}: a zero claim against a positive break-even reports severe rather than nothing`,
    !(R.rp <= 0 && isFinite(R.beResPct) && R.beResPct > 0 && R.attempted > 0) || raw === "severe");
}
A("the bottom band is reachable in the rendered document", bandsSeen.has("none"));
A("the top band is reachable in the rendered document", bandsSeen.has("severe"));
A("the band moves across the sets rather than reporting one value", bandsSeen.size >= 3);

/* The prior basis is gone. realizedDollarsPct rated the shipped default severe while
   that same case nets money, which is why it was rejected. Asserted so the rejection
   cannot be quietly reversed. */
console.log("\n5b. the rejected basis stays rejected");
{
  const A_ = DOCS.A, B_ = DOCS.B;
  A("the prior basis would have rated the shipped default in the top band", severityBucket(Math.max(0, Math.min(1, 1 - A_.R.realizedDollarsPct / 100))) === "severe");
  A("the argued basis does not", A_.signals.severity !== "severe");
  A("the prior basis would have rated a strong case in the top band too", severityBucket(Math.max(0, Math.min(1, 1 - B_.R.realizedDollarsPct / 100))) === "severe");
  A("the argued basis separates the strong case from the shipped default", B_.signals.severity !== A_.signals.severity || B_.R.beResPct !== A_.R.beResPct);
}

/* ---- 6. the wire carries no operating detail ---- */
console.log("\n6. the wire carries no operating detail");
for (const k of Object.keys(DOCS)) {
  const sig = DOCS[k].signals;
  const keys = Object.keys(sig);
  A(`${k}: no contact volume travels in signals`, !keys.some(x => /^(M|volume|contacts)$/i.test(x)));
  A(`${k}: no cost figure travels in signals`, !keys.some(x => /cost$|price|spend|dollars|claim/i.test(x)));
  A(`${k}: every signal value is a primitive`, Object.values(sig).every(v => v === null || ["string", "number", "boolean"].indexOf(typeof v) >= 0));
  A(`${k}: sanitizeProps admits only the allowlisted properties`, Object.keys(sanitizeProps(sig)).every(x => ["severity", "tool", "from", "to", "grade", "real", "depth", "via_rail", "repeat"].indexOf(x) >= 0));
}

/* ---- 7. the hostile scenario link is disclosed, not absorbed ---- */
console.log("\n7. the hostile scenario link is disclosed, not absorbed");
{
  const C = DOCS.C;
  A("C: the document is still whole under hostile input", C.sections.length >= 4);
  A("C: rates are clamped into their domain", C.R.netAutomationRate >= 0 && C.R.netAutomationRate <= 100);
  A("C: the apparent resolution rate never prints above 100", C.R.rp <= 100);
  A("C: an unknown capacity action falls back to none, never the shipped default", C.R.mechKey === "none" && C.R.mechKey !== MECH_DEFAULT);
  A("C: the document discloses the unknown capacity action it replaced",
    sectionByTitle(C, "Integrity Flags (" + C.R.flags.length + ")").items.filter(t => t === `Capacity action was "not-a-mechanism", which is not an option this tool offers, and was held at ${MECH.none.label}.`).length === 1);
  A("C: the open issues count is a number the document can print", Number.isFinite(C.signals.open_issues));
  A("C: the tool still exports a confidence grade", typeof C.R.headlineConf === "string" && C.R.headlineConf.length > 0);
}

/* ---- 8. the zero-realization case says so rather than printing a zero ---- */
console.log("\n8. the zero-realization case says so rather than printing a zero");
{
  const D = DOCS.D;
  A("D: the zero-realization action produces a loss, not a zero", D.R.netSavings < 0);
  A("D: break-even is unreachable at any resolution rate", !isFinite(D.R.beResPct));
  A("D: the document prints the word never rather than a rate", summaryValue(D, "Break-even resolution") === "never");
  A("D: the band reports severe", D.signals.severity === "severe");
  A("D: the analyst read names the missing capacity action", D.analyst.join(" ").indexOf("no capacity action") >= 0);
}

/* ---- 9. hostile enum links render a whole document (9-11) ----
   Rendered outside SETS so Sets A, B, D, E and F stay byte-identical. The entered text
   prints in one fragment, the correction sentence, carried on the page and again in
   the Integrity Flags section. Replacing that whole fragment, rather than splitting on
   the key, keeps "" and names like toLocaleString testable. */
console.log("\n9. hostile enum links render a whole document");
{
  const HOSTILE = ["bogus", "", "HIRING", "Pilot", ...Object.getOwnPropertyNames(Object.prototype)];
  const CASH = MECH_ORDER.filter(k => MECH[k].cred === "cash").pop();
  const frag = (label, k) => `${label} was "${k}",`;
  const face = (doc, label, k) => JSON.stringify({ ...doc, s: null, R: { ...doc.R, flags: doc.R.flags.map(f => f.split(frag(label, k)).join(frag(label, "<KEY>"))) }, RB: { ...doc.RB, flags: doc.RB.flags.map(f => f.split(frag(label, k)).join(frag(label, "<KEY>"))) },
    sections: doc.sections.map(sec => sec.items ? { ...sec, items: sec.items.map(t => typeof t === "string" ? t.split(frag(label, k)).join(frag(label, "<KEY>")) : t) } : sec) });
  const scrub = (doc, label, k) => allText(doc).split(frag(label, k)).join("");
  const docM = (k) => render({ mut: () => ({ marg: 4.2, evidence: "pilot", costConfirmed: true, mech: k }) });
  const docE = (k) => render({ mut: () => ({ marg: 4.2, mech: CASH, costConfirmed: true, evidence: k }) });

  const faceM = face(docM("bogus"), "Capacity action", "bogus"), faceE = face(docE("bogus"), "Evidence source", "bogus");
  for (const k of HOSTILE) {
    let dm = null, de = null;
    try { dm = docM(k); } catch {}
    try { de = docE(k); } catch {}
    A(`capacity action ${k || '""'}: the document renders`, !!dm);
    A(`evidence source ${k || '""'}: the document renders`, !!de);
    if (dm) {
      A(`capacity action ${k || '""'}: prints no NaN, Infinity, undefined or function`, !/NaN|Infinity|undefined|function|\[object/.test(scrub(dm, "Capacity action", k)));
      A(`capacity action ${k || '""'}: the document is the bogus document with the key swapped`, face(dm, "Capacity action", k) === faceM);
    }
    if (de) {
      A(`evidence source ${k || '""'}: prints no NaN, Infinity, undefined or function`, !/NaN|Infinity|undefined|function|\[object/.test(scrub(de, "Evidence source", k)));
      A(`evidence source ${k || '""'}: the document is the bogus document with the key swapped`, face(de, "Evidence source", k) === faceE);
    }
  }
  const M = docM("toString"), E = docE("constructor");
  A("hostile action: the realization row names Not selected", JSON.stringify(M.sections).indexOf(JSON.stringify(["Realization axis", "Directional (" + MECH.none.label + ")"])) >= 0);
  A("hostile action: the document grade is Directional", M.R.headlineConf === "Directional");
  A("hostile action: no cash action travels in signals", M.signals.has_cash_action === false && M.signals.decision_ready_signal === false);
  A("hostile action: the verdict is never Proceed", M.R.verdict.indexOf("Proceed") !== 0);
  A("hostile evidence: the evidence row names the estimate label", JSON.stringify(E.sections).indexOf(JSON.stringify(["Evidence axis", "Directional (Internal estimate or benchmark)"])) >= 0);
  A("hostile evidence: no document evidence travels in signals",
    E.signals.has_document_evidence === false && E.signals.evaluating_active_proposal === false && E.signals.decision_ready_signal === false);
  A("hostile evidence: the band prints as a whole percentage", Number.isFinite(E.R.band) && E.R.band === 0.25);
  A("hostile evidence: the correction is listed once in Integrity Flags",
    sectionByTitle(E, "Integrity Flags (" + E.R.flags.length + ")").items.filter(t => t.indexOf('Evidence source was "constructor",') === 0).length === 1);
}

/* ---------------------------------------------------------------- result */
console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
