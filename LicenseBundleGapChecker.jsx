import { useState, useEffect, useRef } from "react";
import ReportActions from "./ReportActions";
import { COLORS, benchmark } from "./src/lib/benchmarks";
import { emitGrades, voidResult } from "./src/lib/confidence";
import { publishToolResult, getExternalWithSource } from "./src/lib/toolData";
/* An empty rail read, in the shape the old self-capable getter returned, so a missing or self-published value reads as
   nothing (P6 item 15: every pull is external). */
const NO_RAIL = Object.freeze({ value: null, sourceTool: null, railOrigin: null, derived: false, flag: null, confidenceImpact: null });
import { normalizeForPublish } from "./src/lib/metrics";
import NumField from "./src/lib/NumField";
import InfoDot from "./src/lib/InfoDot";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { severityBucket } from "./src/lib/track";
import { createGuards } from "./src/lib/guards";
import { FONT, FONT_IMPORT_CSS, TYPE, W } from "./src/lib/type";
import { ToolFrame } from "./src/lib/ToolFrame.jsx";
import { Result, Finding, Button, resultHow } from "./src/lib/ui.jsx";
import { HOUSE, PILLARS, ARCS, RADIUS, TOUCH, alpha, LINE } from "./src/lib/tokens.js";
import { methodStamp } from "./src/lib/methodVersions.js";

const NAVY = COLORS.navy, DEEP = "#061325", ELECTRIC = COLORS.electric, LIGHT = "#00AAFF";
const ICE = "#E8F4FD", WARM = "#F8FAFB", SLATE = "#3A4F6A", MUTED = COLORS.muted, BORDER = "#D8E3ED";
const GREEN = COLORS.green, AMBER = COLORS.amber, RED = COLORS.red, TEAL = "#0EA5A5";
const WRAP = { maxWidth: 1000, margin: "0 auto", padding: "0 28px" };


/* @engine-start
   Everything between these markers is the License Bundle Gap engine and the
   only things it closes over. licensegap.test.mjs and licensegap.report.mjs
   slice this exact region out of this exact file at runtime and evaluate it,
   so the tested engine and the shipped engine cannot drift apart.

   Before this extraction the arithmetic sat inline in the component body and
   closed over fifteen useState variables, so it could not be evaluated outside
   React at all. n, fmtK, the module and usage tables, the classifier sets and
   DEFAULTS were relocated here unchanged: they are engine dependencies, and
   rebuilding them inside a harness is how a harness starts testing a copy.
   Nothing between their old and new positions evaluated at module load, so the
   move is behaviour-neutral. COLORS is injected from the real benchmarks.js
   and is not reconstructed.

   11B. Every default price and every judgment threshold below is read from the
   benchmark registry by id, so no number ships here without provenance. The
   headline and binding axis come from confidence.js through emitGrades, and a
   failed invariant emits voidResult. No grade ladder lives in this file. */
/* Finite or zero. The isNaN test let Infinity through, so fmtK printed "$InfinityM"
   and an Infinity seat price reached every figure. Identical for finite input. */
const n = (v) => { const p = parseFloat(v); return Number.isFinite(p) ? p : 0; };
const fmtK = (v) => { const x = n(v), s = x < 0 ? "-" : ""; const a = Math.abs(x); return s + (a >= 1000000 ? "$" + (a / 1000000).toFixed(2) + "M" : a >= 1000 ? "$" + (a / 1000).toFixed(0) + "K" : "$" + Math.round(a)); };

/* Guard and disclose, ported from Channel Shift unchanged.

   This tool had four Math.max calls in 597 lines and none of them recorded what
   they changed. Every seat count, price, module cost, usage fee and percentage
   was unclamped, and a scenario link decodes straight into the arithmetic. A
   negative module cost produced a -$9,839 effective seat and a -$17.9M hidden
   annual, and still exported Planning-grade, because both implausibility checks
   only looked upward. Clamping alone is not the fix: a value the engine had to
   change is a value the report must disclose, or the document shows a number the
   engine never ran. `used` carries what was computed, `entered` what was asked. */
const guardVal = (g, which) => which === "entered" && g.invalid ? g.entered : g.unit === "$" ? "$" + g[which] : `${g[which]}${g.unit}`;


const MODULES = [
  { id: "wem", name: "WEM / WFM", typical: benchmark("lbg.module.wem"), desc: "Forecasting, scheduling, adherence", core: true, dStatus: "addon", dScope: "agentsup" },
  { id: "qa", name: "Quality Management", typical: benchmark("lbg.module.qa"), desc: "Evaluation, calibration, coaching", core: true, dStatus: "addon", dScope: "agentsup" },
  { id: "recording", name: "Call Recording", typical: benchmark("lbg.module.recording"), desc: "Voice + screen, compliance", core: true, dStatus: "included", dScope: "all" },
  { id: "analytics", name: "Speech + Text Analytics", typical: benchmark("lbg.module.analytics"), desc: "Interaction analytics, sentiment", core: true, dStatus: "addon", dScope: "all" },
  { id: "ai", name: "AI / GenAI Features", typical: benchmark("lbg.module.ai"), desc: "Summarization, agent assist, copilot", dStatus: "usage", dScope: "agent" },
  { id: "digital", name: "Digital Channels", typical: benchmark("lbg.module.digital"), desc: "Chat, SMS, social, messaging", dStatus: "addon", dScope: "agent" },
  { id: "outbound", name: "Outbound Dialer", typical: benchmark("lbg.module.outbound"), desc: "Preview, progressive, predictive", dStatus: "addon", dScope: "agent" },
  { id: "reporting", name: "Advanced Reporting", typical: benchmark("lbg.module.reporting"), desc: "Custom dashboards, BI connector", dStatus: "addon", dScope: "agentsup" },
  { id: "telephony", name: "BYOC / Telephony", typical: benchmark("lbg.module.telephony"), desc: "Carrier, SIP trunking", dStatus: "usage", dScope: "all" },
  { id: "storage", name: "Storage / Archival", typical: benchmark("lbg.module.storage"), desc: "Extended retention", dStatus: "limited", dScope: "all" },
  { id: "support", name: "Premium Support / TAM", typical: benchmark("lbg.module.support"), desc: "24/7, dedicated CSM, SLA", dStatus: "included", dScope: "all" },
  { id: "services", name: "Professional Services", typical: benchmark("lbg.module.services"), desc: "Implementation (one-time)", dStatus: "onetime", dScope: "all" },
];

const USAGE_TYPES = [
  { id: "ai", name: "AI assistant / copilot", basis: "user · interaction · token" },
  { id: "bot", name: "Bot / virtual agent", basis: "session · minute" },
  { id: "transcription", name: "Transcription", basis: "per minute" },
  { id: "storage", name: "Storage / retention", basis: "GB-month · tier" },
  { id: "sms", name: "SMS / WhatsApp", basis: "per message" },
  { id: "voice", name: "Voice / carrier", basis: "minutes · DID · BYOC" },
];

const STATUS_OPTS = [
  { v: "included", l: "Included" }, { v: "limited", l: "Incl, limited" }, { v: "addon", l: "Per-seat add-on" },
  { v: "tier", l: "Tier upgrade" }, { v: "usage", l: "Usage-based" }, { v: "onetime", l: "One-time" }, { v: "unknown", l: "Unknown" },
];
const NEED_OPTS = [{ v: "yes", l: "Yes" }, { v: "no", l: "No" }, { v: "unsure", l: "Unsure" }];
const SCOPE_OPTS = [{ v: "all", l: "All seats" }, { v: "agent", l: "Agents" }, { v: "agentsup", l: "Agents+Sups" }, { v: "sup", l: "Supervisors" }, { v: "admin", l: "Admins" }, { v: "analyst", l: "Analysts" }];
const EVIDENCE_OPTS = [{ v: "estimate", l: "Estimate / guess" }, { v: "email", l: "Vendor email" }, { v: "proposal", l: "Proposal" }, { v: "orderform", l: "Order form" }, { v: "sku", l: "SKU schedule" }, { v: "msa", l: "MSA / contract" }];
const COST_STATUS = new Set(["addon", "tier"]);
const DOC_EVIDENCE = new Set(["proposal", "orderform", "sku", "msa"]);
const DBL_MAP = { ai: "ai", analytics: "transcription", digital: "sms", recording: "storage", telephony: "voice" };
const DBL_LABEL = { ai: "AI add-on + AI usage tokens", analytics: "analytics module + transcription minutes", digital: "digital channel module + SMS/WhatsApp fees", recording: "recording module + storage retention", telephony: "telephony module + voice/carrier usage" };

/* Scenario contract. Module scope so the identity is stable across renders,
   and so state initializers and the URL encoder read from one definition. */
const TOOL_ID = "license-gap";
const ROUTE = "/tools/license-gap";
const clone = (o) => JSON.parse(JSON.stringify(o));

const DEFAULTS = {
  classes: [
    { id: "agent", name: "Agent", count: 150, price: benchmark("lbg.seat.agent") },
    { id: "sup", name: "Supervisor", count: 0, price: benchmark("lbg.seat.sup") },
    { id: "admin", name: "Admin", count: 0, price: benchmark("lbg.seat.admin") },
    { id: "analyst", name: "Analyst", count: 0, price: benchmark("lbg.seat.analyst") },
  ],
  basis: "named",
  committedSeats: 0,
  commitBasis: "license",
  commitRate: 0,
  uplift: 0,
  seats18mo: 0,
  evidence: "estimate",
  confirmed: false,
  dblAck: false,
  modules: (() => { const m = {}; MODULES.forEach(mod => { m[mod.id] = { need: mod.core ? "yes" : "no", status: mod.dStatus, cost: mod.typical, scope: mod.dScope }; }); return m; })(),
  usage: (() => { const u = {}; USAGE_TYPES.forEach(t => { u[t.id] = 0; }); return u; })(),
};

export function compute(d) {
  const { classes, committedSeats, commitBasis, commitRate, uplift, seats18mo, evidence, confirmed, dblAck, modules, usage } = d;
  /* The shared guard, not a local copy. It clamps exactly as the local one did for
     every finite input, and it records an entry that is not a clean number ("",
     "abc", "12abc", "1,200", null, "Infinity") with its raw text even when the bounds
     did not move it. Before this, all 130 unclean probe cases were silent and 22
     leaked a non-finite figure. "1,200" is held at 1, because a link must reproduce
     the sender's case and that text is locale ambiguous. Typed entry never arrives
     unclean, because NumField parses first.
     One blank is exempt: renewal uplift, because this document already prints "no
     annual uplift entered" whenever it is zero. Committed seats and 18-month seats
     are not exempt, because their "not entered" wording appears only in some grade
     paths and nowhere for 18-month seats. */
  const { guards, guard: sharedGuard } = createGuards();
  const BLANK_OK = new Set(["Renewal uplift"]);
  const guard = (label, raw, min, max, unit) => {
    const c = sharedGuard(label, raw, min, max, unit);
    const g = guards[guards.length - 1];
    if (g && g.label === label && g.invalid && g.entered === "blank" && BLANK_OK.has(label)) guards.pop();
    return c;
  };

  /* Every input is guarded at the point it is consumed rather than in one block
     at the top, so an unused module with a junk cost does not raise a correction
     the reader cannot act on. Guarded values are cached because three separate
     passes read the same module cost and they must agree. */
  const cls = {}, gCost = {}, gUse = {};
  classes.forEach(c => { cls[c.id] = guard(`${c.name} seat count`, c.count, 0, null, ""); });
  const billable = classes.reduce((sum, c) => sum + cls[c.id], 0);
  const baseMonthly = classes.reduce((sum, c) => sum + cls[c.id] * guard(`${c.name} seat price`, c.price, 0, null, "$"), 0);
  const scopeSeats = (sc) => sc === "all" ? billable : sc === "agentsup" ? (cls.agent + cls.sup) : sc === "agent" ? cls.agent : sc === "sup" ? cls.sup : sc === "admin" ? cls.admin : sc === "analyst" ? cls.analyst : billable;
  let addOnMonthly = 0, tierMonthly = 0, oneTimeTotal = 0;
  const unknowns = [], limiteds = [], tiers = [], usageFlagged = [], doubles = [];
  MODULES.forEach(mod => {
    const m = modules[mod.id]; if (m.need !== "yes") return;
    const appl = scopeSeats(m.scope || "all");
    gCost[mod.id] = (m.status === "onetime" || COST_STATUS.has(m.status)) ? guard(`${mod.name} cost`, m.cost, 0, null, "$") : n(m.cost);
    if (m.status === "onetime") oneTimeTotal += gCost[mod.id];
    else if (m.status === "addon") addOnMonthly += appl * gCost[mod.id];
    else if (m.status === "tier") { tierMonthly += appl * gCost[mod.id]; tiers.push(mod.name); }
    else if (m.status === "unknown") unknowns.push(mod.name);
    else if (m.status === "limited") limiteds.push(mod.name);
    else if (m.status === "usage") usageFlagged.push(mod.name);
  });
  USAGE_TYPES.forEach(t => { gUse[t.id] = guard(`${t.name} usage fee`, usage[t.id], 0, null, "$"); });
  MODULES.forEach(mod => {
    const m = modules[mod.id]; if (m.need !== "yes") return;
    const ut = DBL_MAP[mod.id];
    if (ut && COST_STATUS.has(m.status) && gUse[ut] > 0) doubles.push(mod.id);
  });
  const usageMonthly = USAGE_TYPES.reduce((sum, t) => sum + gUse[t.id], 0);
  const licenseMonthly = baseMonthly + addOnMonthly + tierMonthly;
  const platformMonthly = licenseMonthly + usageMonthly;
  const quotedSeat = billable > 0 ? baseMonthly / billable : 0;
  const effLicenseSeat = billable > 0 ? licenseMonthly / billable : 0;
  const effPlatformSeat = billable > 0 ? platformMonthly / billable : 0;
  const gapPct = quotedSeat > 0 ? (effPlatformSeat - quotedSeat) / quotedSeat * 100 : 0;
  const hiddenAnnual = (platformMonthly - baseMonthly) * 12;
  const decomp = { addOns: addOnMonthly * 12, tier: tierMonthly * 12, usage: usageMonthly * 12 };
  const annualPlatform = platformMonthly * 12;
  const gCommitted = guard("Committed seats", committedSeats, 0, null, "");
  /* A renewal uplift above 100 percent per year is a repricing, not a renewal, and it
     compounds twice into the year-three seat. Left unclamped, 900 percent turned a $185
     seat into $18,500 with no flag anywhere. Negative uplift was worse: it modelled a
     renewal that cuts price, and because the "no uplift entered" notice tests for exactly
     zero, a negative value silenced its own warning. */
  const gUplift = guard("Renewal uplift", uplift, 0, 100, "%");
  const gSeats18 = guard("Seats added within 18 months", seats18mo, 0, null, "");
  const commitBasisPrice = commitBasis === "quoted" ? quotedSeat : commitBasis === "custom" ? guard("Custom commit rate", commitRate, 0, null, "$") : effLicenseSeat;
  const commitExpSeats = Math.max(0, gCommitted - billable);
  const commitExpAnnual = commitExpSeats * commitBasisPrice * 12;
  const usagePerSeat = billable > 0 ? usageMonthly / billable : 0;
  const year3LicenseSeat = effLicenseSeat * Math.pow(1 + gUplift / 100, 2);
  const year3Seat = year3LicenseSeat + usagePerSeat; // uplift applies to contracted license rates; usage held flat (volume-driven, not seat-priced)
  const exp18Annual = gSeats18 * effPlatformSeat * 12;
  const gapColor = gapPct > benchmark("lbg.band.gapRed") ? RED : gapPct > benchmark("lbg.band.gapAmber") ? AMBER : GREEN;

  const shelfware = MODULES.filter(mod => { const m = modules[mod.id]; return m.need === "no" && (m.status === "included" || m.status === "limited"); });
  const anyUnsure = MODULES.some(mod => modules[mod.id].need === "unsure");
  const needPriced = MODULES.filter(mod => modules[mod.id].need === "yes" && COST_STATUS.has(modules[mod.id].status));

  // SELF-AUDIT: rank recurring cost drivers, detect category errors before they reach a board deck
  const drivers = [];
  MODULES.forEach(mod => { const m = modules[mod.id]; if (m.need !== "yes") return; const appl = scopeSeats(m.scope || "all"); if (m.status === "addon" || m.status === "tier") drivers.push({ name: mod.name, annual: appl * gCost[mod.id] * 12, usage: false }); });
  if (usageMonthly > 0) drivers.push({ name: "Usage fees (metered)", annual: usageMonthly * 12, usage: true });
  drivers.sort((a, b) => b.annual - a.annual);
  const topDriver = drivers[0] || { name: "none", annual: 0 };
  const dominanceShare = hiddenAnnual > 0 ? topDriver.annual / hiddenAnnual : 0;
  // Miscategorization risk is a per-seat or tier line dominating the RECURRING LICENSE cost. Usage can legitimately dominate the hidden annual in AI-heavy contracts, so it is treated separately and never as a category error.
  const recurringAnnual = decomp.addOns + decomp.tier;
  const recurDrivers = drivers.filter(d => !d.usage);
  const topRecur = recurDrivers[0] || { name: "none", annual: 0 };
  const recurDominance = recurringAnnual > 0 ? topRecur.annual / recurringAnnual : 0;
  const singleDriverDominant = recurDrivers.length >= 2 && recurDominance > benchmark("lbg.guard.recurDominance");
  const usageDominant = hiddenAnnual > 0 && (usageMonthly * 12) / hiddenAnnual > benchmark("lbg.guard.usageDominance");
  const GAP_CEILING = benchmark("lbg.guard.gapPct"), SEAT_MULTIPLE = benchmark("lbg.guard.seatMultiple");
  const gapImplausible = gapPct > GAP_CEILING;
  const seatImplausible = quotedSeat > 0 && effLicenseSeat > quotedSeat * SEAT_MULTIPLE;
  const hardDoubt = gapImplausible || seatImplausible;
  const doubtWhy = [];
  if (gapImplausible) doubtWhy.push(`bundle gap of ${gapPct.toFixed(0)}% exceeds the plausible ceiling of ${GAP_CEILING}%`);
  if (seatImplausible) doubtWhy.push(`effective license seat is ${(effLicenseSeat / Math.max(1, quotedSeat)).toFixed(1)}x the quoted seat`);

  /* IMPOSSIBLE-OUTPUT BLOCKING.

     Add-ons, tier upgrades and usage fees are all non-negative once guarded, so
     quoted <= effective license <= platform seat-equivalent must hold, and none of
     the annual figures can fall below zero. These are not warnings about unlikely
     inputs. If one fails, the arithmetic contradicts itself and no figure in the
     document can be trusted, so the report is voided rather than graded down. */
  const invariants = [];
  if (effLicenseSeat < quotedSeat - 1e-9) invariants.push("effective license seat is below the quoted seat");
  if (effPlatformSeat < effLicenseSeat - 1e-9) invariants.push("platform seat-equivalent is below the effective license seat");
  if (hiddenAnnual < -1e-9) invariants.push("hidden annual is below zero");
  if (commitExpAnnual < -1e-9) invariants.push("commit exposure is below zero");
  if (year3Seat < effPlatformSeat - 1e-9) invariants.push("year-three seat is below the year-one seat");
  if (exp18Annual < -1e-9) invariants.push("18-month expansion is below zero");
  if (![quotedSeat, effLicenseSeat, effPlatformSeat, gapPct, hiddenAnnual, year3Seat].every(Number.isFinite)) invariants.push("an output is not a finite number");

  /* CONFIDENCE. Two named axes, lower of the two, and the report says which bound it.

     There is deliberately no MECH import and no credit-class ceiling here. This tool
     prices contract cost, which is cash out the door, not freed capacity. There is no
     capacity action to select, so CRED_RANK has nothing to rank. Bolting a capacity
     taxonomy onto a cost model to make it match its siblings would be decoration.
     What replaces it is model completeness: whether the cost picture is whole. */
  const evLabel = EVIDENCE_OPTS.find(e => e.v === evidence)?.l || evidence;
  const docEv = DOC_EVIDENCE.has(evidence);
  /* A driver still at its shipped value is a tool default whatever the evidence
     selector says, and doctrine grades a default-priced driver Directional. The
     selector records where the user's numbers came from. It cannot certify a
     number the user never entered. */
  const DEFAULT_SEAT = Object.fromEntries(DEFAULTS.classes.map(c => [c.id, c.price]));
  const defaultDrivers = [
    ...classes.filter(c => cls[c.id] > 0 && n(c.price) === DEFAULT_SEAT[c.id]).map(c => `${c.name} seat price`),
    ...needPriced.filter(mod => mod.typical > 0 && gCost[mod.id] === mod.typical && scopeSeats(modules[mod.id].scope || "all") > 0).map(mod => `${mod.name} cost`),
  ];
  const evidenceGrade = defaultDrivers.length ? "Directional"
    : (docEv && confirmed) ? "Finance-grade" : (docEv || evidence === "email") ? "Planning-grade" : "Directional";

  const modelBlockers = [];
  const badNums = guards.filter(g => g.invalid).length, outOfRange = guards.length - badNums;
  if (badNums) modelBlockers.push(`${badNums} input${badNums > 1 ? "s were" : " was"} not a clean number and ${badNums > 1 ? "were" : "was"} held at the value shown`);
  if (outOfRange) modelBlockers.push(`${outOfRange} input${outOfRange > 1 ? "s were" : " was"} outside the possible range and had to be corrected`);
  if (billable <= 0) modelBlockers.push("no billable seats entered");
  if (quotedSeat <= 0) modelBlockers.push("no quoted seat price entered");
  if (unknowns.length) modelBlockers.push(`${unknowns.length} needed module${unknowns.length > 1 ? "s have" : " has"} unknown inclusion`);
  if (anyUnsure) modelBlockers.push("modules still marked Unsure");
  if (doubtWhy.length) modelBlockers.push(doubtWhy.join("; "));

  const modelGaps = [];
  if (gCommitted <= 0) modelGaps.push("committed seats not entered");
  if (gUplift <= 0) modelGaps.push("renewal uplift not entered");
  if (usageFlagged.length && usageMonthly === 0) modelGaps.push("usage-based modules priced at zero");
  if (doubles.length && !dblAck) modelGaps.push("possible double counts not confirmed as separate charges");
  if (singleDriverDominant) modelGaps.push("one recurring line dominates and its periodicity is unconfirmed");

  const completenessCeiling = modelBlockers.length ? "Directional" : modelGaps.length ? "Planning-grade" : "Finance-grade";
  const evidenceWhy = defaultDrivers.length
    ? `${defaultDrivers.length} priced driver${defaultDrivers.length > 1 ? "s are" : " is"} still at the tool's planning default (${defaultDrivers.join(", ")}). Enter the figures from your quote to lift this axis`
    : `Evidence source is ${evLabel}${docEv && !confirmed ? ", not yet confirmed in writing" : docEv ? ", confirmed in writing" : ""}`;
  const modelWhy = modelBlockers.length || modelGaps.length
    ? (modelBlockers.length ? modelBlockers : modelGaps).join("; ")
    : "The cost model is complete: every needed module classified and priced, commit and uplift entered, no plausibility guard tripped";
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const AXIS_REASON = { evidence: `${cap(evidenceWhy)}.`, completeness: `${cap(modelWhy)}.` };

  /* Realization is not applicable here, and the reason is stated rather than left
     blank. This tool prices contract cost, cash that leaves the building, so there
     is no freed capacity whose conversion to cash could be graded. */
  const voided = invariants.length > 0;
  const gradeObj = voided
    ? voidResult({
        invariant: invariants.join("; "),
        remedy: "Correct the inputs behind the failed check and re-run before citing any figure in this report.",
      })
    : emitGrades({
        evidence: evidenceGrade, realization: null, completeness: completenessCeiling,
        naReason: "This tool prices contract cost, which is cash out the door. No freed capacity is credited, so there is nothing whose conversion to cash could be graded.",
        reasons: AXIS_REASON,
      });
  const confidence = voided ? "Void" : gradeObj.headline;
  const boundBy = voided ? "" : gradeObj.boundBy;
  const gradeWhy = voided ? "export void" : `bound by ${boundBy}. ${gradeObj.boundAxes.map(a => AXIS_REASON[a]).join(" ")}`;
  const confColor = voided ? RED : confidence === "Finance-grade" ? GREEN : confidence === "Planning-grade" ? ELECTRIC : AMBER;

  // INTEGRITY FLAGS
  const flags = [];
  if (voided) flags.push({ sev: "warn", t: `Output void: ${invariants.join("; ")}. Add-ons, tier upgrades and usage fees cannot be negative, so this result contradicts itself. Do not use any figure in this report until the inputs are corrected.` });
  for (const g of guards) flags.push(g.invalid
    ? { sev: "warn", t: `${g.label} was entered as ${guardVal(g, "entered")}, which is not a number, and was held at ${guardVal(g, "used")}. Every figure in this report was computed at that value. Re-enter it as a plain number.` }
    : { sev: "warn", t: `${g.label}: you entered ${guardVal(g, "entered")}, which is outside the possible range. Every figure in this report was computed at ${guardVal(g, "used")}. Correct the input or treat the output as void.` });
  doubles.forEach(id => flags.push(dblAck
    ? { sev: "info", t: `Double count reviewed: ${DBL_LABEL[id]} confirmed as separate charges.` }
    : { sev: "warn", t: `Possible double count: ${DBL_LABEL[id]} are both entered. Confirm these are separate charges, not one already including the other.` }));
  if (unknowns.length) flags.push({ sev: "warn", t: `Unknown inclusion: ${unknowns.join(", ")} needed but bundle status unconfirmed. Get it in writing. This caps confidence at Directional.` });
  if (limiteds.length) flags.push({ sev: "warn", t: `Limited inclusion: ${limiteds.join(", ")} included but capped. Confirm the limit against real volume; overage is where the next surprise hides.` });
  if (tiers.length) flags.push({ sev: "warn", t: `Tier upgrade: ${tiers.join(", ")} force an edition jump ($${tierMonthly > 0 ? Math.round(tierMonthly / Math.max(1, billable)) : 0}/seat blended). Vendor may require all seats on the higher edition. Confirm upgrade scope in writing.` });
  if (usageFlagged.length && usageMonthly === 0) flags.push({ sev: "warn", t: `Usage fee missing: ${usageFlagged.join(", ")} usage-based, but no usage cost entered. The platform equivalent is understated until you add it.` });
  if (commitExpSeats > 0) flags.push({ sev: "warn", t: `Commit exposure: ${gCommitted} committed vs ${billable} active, ${commitExpSeats} idle seats at the ${commitBasis === "quoted" ? "quoted" : commitBasis === "custom" ? "custom" : "license"} basis ($${commitBasisPrice.toFixed(0)}) = ${fmtK(commitExpAnnual)}/yr. Leverage and real cost, not waste.` });
  if (gUplift === 0) flags.push({ sev: "info", t: `Renewal exposure: no annual uplift entered. Ask for the renewal cap and enter it. Year one rarely tells the year-three story.` });
  if (shelfware.length) flags.push({ sev: "info", t: `Shelfware leverage: ${shelfware.map(m => m.name).join(", ")} bundled but unused. Leverage for a lower tier or credits, not recoverable savings.` });
  if (usageMonthly > 0) flags.push({ sev: "info", t: `Normalized, not seat costs: ${fmtK(usageMonthly)}/mo of usage fees are spread across seats for comparison only. They scale with volume, not seats. The platform equivalent is not a vendor seat price.` });
  needPriced.forEach(mod => { if (gCost[mod.id] === 0) flags.push({ sev: "info", t: `${mod.name} is needed and priced, but its cost is $0. Pull the real figure from the quote or the gap is understated.` }); });
  if (singleDriverDominant) flags.push({ sev: "warn", t: `${topRecur.name} drives ${(recurDominance * 100).toFixed(0)}% of the recurring license cost. A single per-seat or tier line that dominates is the classic sign of a one-time or total fee miscoded as recurring. Confirm its pricing behavior before using these figures; confidence is held below Finance-grade until you do.` });
  if (usageDominant) flags.push({ sev: "info", t: `Usage fees are ${Math.round((usageMonthly * 12 / hiddenAnnual) * 100)}% of the hidden annual. That is a usage-heavy contract, not a miscategorization, but the platform seat-equivalent will swing with volume. Confirm the volume assumptions and cap or commit these fees.` });
  if (gapImplausible) flags.push({ sev: "warn", t: `Bundle gap of ${gapPct.toFixed(0)}% is implausibly high, which caps confidence at Directional. Recheck for a one-time or usage cost coded as recurring per-seat.` });
  if (seatImplausible) flags.push({ sev: "warn", t: `Effective seat $${effLicenseSeat.toFixed(0)} is over ${Math.round(effLicenseSeat / Math.max(1, quotedSeat))}x the quoted $${quotedSeat.toFixed(0)}, which caps confidence at Directional. A gap this size almost always means a line item is miscategorized.` });

  // ANALYST READ (reviewer wording)
  const analyst = [];
  analyst.push(`The quoted seat price is not the production-ready license cost. This model separates the vendor's headline seat from required add-ons, tier upgrades, usage-based charges, support packages, commit exposure, and renewal uplift. Across ${billable} billable seats the ${"$" + quotedSeat.toFixed(0)} quote becomes ${"$" + effLicenseSeat.toFixed(0)} once required per-seat modules and edition upgrades are added, and ${"$" + effPlatformSeat.toFixed(0)} per-seat-equivalent once usage fees are normalized in, a ${gapPct.toFixed(0)}% premium worth ${fmtK(hiddenAnnual)}/yr. The hidden annual amount is not automatically waste; it is the portion of platform cost the quote did not make obvious.`);
  if (decomp.addOns + decomp.tier + decomp.usage > 0) analyst.push(`That hidden annual breaks down as ${fmtK(decomp.addOns)} required add-ons, ${fmtK(decomp.tier)} tier upgrades, and ${fmtK(decomp.usage)} usage fees. Each is a different negotiation: add-ons get co-termed and rate-locked, edition upgrades get scope-confirmed, usage fees get capped or committed. Treating them as one number hides the levers.`);
  if (tiers.length) analyst.push(`${tiers.join(" and ")} ${tiers.length > 1 ? "are" : "is"} a tier upgrade, not a line item. Getting ${tiers.length > 1 ? "them" : "it"} can force every seat to a higher edition, not just the users of the feature. Confirm the upgrade scope in writing before you model it.`);
  if (usageMonthly > 0) analyst.push(`${fmtK(usageMonthly)}/mo runs through usage meters and is normalized across seats for comparison only. It is not a seat fee. These scale with volume, so cap or commit them deliberately rather than leaving them open-ended.`);
  if (commitExpSeats > 0) analyst.push(`You're committed to ${gCommitted} seats but staff ${billable}. That ${commitExpSeats}-seat gap, priced at the ${commitBasis === "quoted" ? "quoted base" : commitBasis === "custom" ? "custom commit" : "license"} seat, is ${fmtK(commitExpAnnual)}/yr of commit exposure. Use it to negotiate the minimum down or win ramp flexibility, but budget it until the contract says otherwise.`);
  if (gUplift > 0) analyst.push(`At ${gUplift}% annual uplift, the license component rises while usage fees are held flat: the license seat moves from ${"$" + effLicenseSeat.toFixed(0)} to ${"$" + year3LicenseSeat.toFixed(0)}, putting the year-three platform seat-equivalent at ${"$" + year3Seat.toFixed(0)}, assuming no usage-volume growth. Negotiate the renewal cap now, while you hold the leverage.`);
  if (oneTimeTotal > 0) analyst.push(`Implementation is a one-time cost of ${fmtK(oneTimeTotal)}, deliberately excluded from the recurring seat economics and the hidden annual, which are monthly and per-seat. Budget it once and negotiate it as an upfront concession or waiver; it is not part of the per-seat premium.`);
  if (shelfware.length) analyst.push(`Bundled-but-unused capability is leverage, not recoverable savings. Use ${shelfware.map(m => m.name).join(", ")} to challenge tier fit, request credits, secure implementation concessions, or negotiate future module access. Do not count it as cash unless the vendor confirms a price reduction in writing.`);
  analyst.push(`Use this to budget the real platform baseline and negotiate the terms before signature: price every required module and edition delta in writing, co-term add-ons to the master agreement, cap usage fees, and rate-lock the ${gSeats18 > 0 ? gSeats18 + " seats" : "seats"} you'll need within eighteen months. The quote is the opening move, not the price.`);

  const caveats = [];
  if (doubles.length > 0 && !dblAck) caveats.push(`possible double count not yet confirmed as separate charges (${doubles.map(id => DBL_LABEL[id]).join("; ")})`);
  if (unknowns.length) caveats.push(`${unknowns.length} required module${unknowns.length > 1 ? "s" : ""} with unknown inclusion`);
  if (anyUnsure) caveats.push(`needs marked Unsure`);
  if (usageFlagged.length && usageMonthly === 0) caveats.push(`usage-based module${usageFlagged.length > 1 ? "s" : ""} with no usage cost entered`);
  const confLine = (caveats.length ? `Open issues: ${caveats.join("; ")}. ` : doubles.length > 0 && dblAck ? `Commercial overlap: module and usage fees confirmed as separate charges. ` : `No unresolved commercial caveats. `) + (guards.length ? `INPUTS CORRECTED: ${guards.map(g => `${g.label} entered ${guardVal(g, "entered")}, computed at ${guardVal(g, "used")}`).join("; ")}.` : "");

  return { cls, billable, baseMonthly, addOnMonthly, tierMonthly, oneTimeTotal,
    unknowns, limiteds, tiers, usageFlagged, doubles, usageMonthly, licenseMonthly, platformMonthly,
    quotedSeat, effLicenseSeat, effPlatformSeat, gapPct, hiddenAnnual, decomp, annualPlatform,
    commitBasisPrice, commitExpSeats, commitExpAnnual, usagePerSeat, year3LicenseSeat, year3Seat,
    exp18Annual, gapColor, gCommitted, gUplift, gSeats18, gCost, gUse, shelfware, anyUnsure, needPriced, drivers, topDriver, dominanceShare,
    recurringAnnual, recurDrivers, topRecur, recurDominance, singleDriverDominant, usageDominant,
    gapImplausible, seatImplausible, hardDoubt, doubtWhy, invariants, voided, guards,
    evidenceGrade, completenessCeiling, modelBlockers, modelGaps, boundBy, gradeWhy, gradeObj, defaultDrivers,
    confidence, confColor, flags, analyst, evLabel, caveats, confLine };
}
/* @engine-end */

const DEFS = {
  baseSeat: "The advertised per-agent price the vendor leads with. It typically covers core voice, routing, and basic reporting only. Most everything else is priced separately.",
  effLicenseSeat: "The seat price plus the per-seat modules and edition upgrades you require. Still a true per-seat number: what one production-ready license actually costs.",
  effPlatform: "The license seat plus usage-based fees, normalized across billable seats for comparison. This is a comparison figure, not a seat price. Usage scales with volume, not seats.",
  gap: "How far the all-in platform cost per seat sits above the quote. It is not overcharging. It's the part of a production-ready platform's cost the headline seat price leaves out.",
  basis: "Named licenses bill per assigned user; concurrent bills on peak simultaneous logins. With part-time agents, seasonal ramps, or shared queues, your billable count can differ sharply from headcount.",
  seatClass: "A CCaaS quote rarely maps to one price times all agents. Supervisors, admins, and analysts are often priced differently or on different editions. Enter the classes your quote actually contains.",
  status: "Classify by how a fee behaves, not who sells it. A per-seat add-on bills monthly per seat, a tier upgrade forces a higher edition, usage-based bills by volume, and a one-time cost is charged once. Who charges it, the vendor, a partner, or a third party, is a negotiation question, not a pricing behavior, and it does not change the math. Misfiling a one-time implementation fee as recurring per-seat is how a plausible gap turns into a fake one.",
  scope: "Not every module is priced on every seat. WEM may cover agents and supervisors, AI assist only agents, admin features only admins. Set who each add-on or upgrade applies to so the cost isn't overstated.",
  tier: "Not a line-item add-on. Getting this means moving seats to a higher edition. Enter the per-seat edition delta; it applies to the seats in scope. Vendors often require the whole base on the higher edition, so confirm scope in writing.",
  limited: "Included, but capped: limited retention, minutes, sessions, or seats. The cap is where overage charges hide, so it's flagged for you to confirm against real volume.",
  unknown: "You don't yet know whether this is included, and recording that honestly is the point. Unknown inclusion on a needed module caps export confidence. False precision is worse than a flagged gap.",
  usage: "Metered charges that don't live in the seat price: AI tokens, bot sessions, transcription, storage, SMS, carrier minutes. The biggest reason a per-seat model understates real cost.",
  committed: "The minimum seats your contract obligates you to pay for, which can exceed the seats you actually staff. Paying more committed than active is commit exposure, not waste, but real money and leverage.",
  commitBasis: "Minimum commitments are usually priced on contracted licenses, not your usage-loaded equivalent. Pricing idle committed seats at the platform equivalent overstates the exposure, so this defaults to the license seat.",
  uplift: "The annual percentage your rates rise at renewal. A quote that looks fine in year one can look very different in year three; this projects the seat forward so you negotiate the uplift now.",
  seats18mo: "Seats you expect to add within eighteen months, priced at today's rate. It shows the exposure to rate-lock before signing, while you still have leverage.",
  shelfware: "Modules bundled into your tier that you don't use. Leverage to negotiate a lower tier or credits, but usually not a line you can drop on its own, so it is flagged, never counted as recoverable savings.",
  confidence: "How much weight this output can carry, on two axes with the lower one winning. Evidence grades what the numbers rest on: a document confirmed in writing is Finance-grade, a document or vendor email alone is Planning-grade, an estimate is Directional. Any priced driver left at the tool's planning default grades evidence Directional, whatever the source selector says. Model completeness grades whether the cost picture is whole: unknown inclusion, unresolved Unsure flags, a corrected input, or a tripped plausibility guard cap it at Directional. Realization does not apply, because this tool prices cash out the door and credits no freed capacity. The report always names which axis bound the result.",
  evidence: "What the numbers rest on. An estimate is a guess; a vendor email beats a guess; a proposal or order form is what finance will trust. Finance-grade requires a document, not a checkbox.",
};

function LogoMark({ size = 30, light = true }) {
  const a = light ? "#fff" : NAVY, x = light ? LIGHT : ELECTRIC;
  return <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light ? .6 : .3} /><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light ? .8 : .5} /><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round" /><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /></g></svg>;
}
const hair = alpha(HOUSE.mist, LINE.hair), soft = alpha(HOUSE.mist, LINE.soft), firm = alpha(HOUSE.mist, LINE.firm);
const kicker = { fontSize: 12, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: HOUSE.muted };
const h2 = { fontSize: 18, fontWeight: 600, lineHeight: 1.3, color: HOUSE.mist, margin: "0 0 8px", display: "flex", alignItems: "center", gap: 6 };
const body = { fontSize: 15, lineHeight: 1.6, color: HOUSE.body, margin: 0 };
const small = { fontSize: 13, lineHeight: 1.5, color: HOUSE.muted, margin: 0 };
const link = { color: PILLARS.diagnostics.onDark, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 };
const grid = (min) => ({ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))`, gap: 12 });
const panel = { background: HOUSE.navy, border: `1px solid ${hair}`, borderRadius: RADIUS.card, padding: 20 };
const stat = { ...TYPE.statValue, fontSize: 24, color: HOUSE.mist, margin: "4px 0 2px" };
const field = { width: "100%", boxSizing: "border-box", minHeight: TOUCH, padding: "0 10px", fontFamily: FONT, fontSize: 15, fontWeight: 600, border: `1px solid ${firm}`, borderRadius: RADIUS.field, background: HOUSE.navy, color: HOUSE.mist, outline: "none" };
function Select({ value, onChange, options, label }) {
  return <select aria-label={label} value={value} onChange={e => onChange(e.target.value)} className="lg-sel" style={{ ...field, cursor: "pointer" }}>
    {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
  </select>;
}
function Cell({ value, onChange, prefix, label }) {
  return <div style={{ position: "relative" }}>
    {prefix && <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: HOUSE.muted, pointerEvents: "none" }}>{prefix}</span>}
    <input type="number" aria-label={label} value={value} onChange={e => onChange(e.target.value)} style={{ ...field, paddingLeft: prefix ? 22 : 10, textAlign: "right" }} />
  </div>;
}
function Choice({ label, options, value, onPick }) {
  return (
    <div role="group" aria-label={label} style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map(([v, l]) => (
        <button key={v} type="button" aria-pressed={value === v} onClick={() => onPick(v)} style={{ flex: 1, minHeight: TOUCH, fontFamily: FONT, fontSize: 14, fontWeight: value === v ? 700 : 500, padding: "0 10px", borderRadius: RADIUS.field, cursor: "pointer", border: `1px solid ${value === v ? HOUSE.electric : firm}`, background: value === v ? alpha(HOUSE.electric, 0.22) : "transparent", color: HOUSE.mist }}>{l}</button>
      ))}
    </div>
  );
}
const Tile = ({ label, info, value, sub }) => (
  <div style={panel}><span style={{ ...kicker, display: "flex", alignItems: "center", gap: 4 }}>{label}{info}</span><div style={stat}>{value}</div>{sub && <p style={small}>{sub}</p>}</div>
);

export default function LicenseBundleGapChecker() {
  /* One input object rather than twelve useState slots. DEFAULTS already carried
     the whole shape, so the scenario contract is unchanged; only the component
     state is. The engine now receives that object and closes over nothing. */
  const [d, setD] = useState(() => clone(DEFAULTS));
  const set = (k, v) => setD(p => ({ ...p, [k]: v }));
  const [pulled, setPulled] = useState({});
  const [fromLink, setFromLink] = useState(false);
  const { classes, basis, committedSeats, commitBasis, commitRate, uplift, seats18mo, evidence, confirmed, dblAck, modules, usage } = d;

  useEffect(() => {
    window.scrollTo(0, 0);

    // A scenario link is a deliberate act. It outranks the ambient cross-tool
    // pull, so we rehydrate and return rather than letting the rail overwrite
    // the seat count the user explicitly shared.
    const s = readScenario(TOOL_ID, DEFAULTS);
    if (s) { setD(s); setFromLink(true); clearScenarioParam(); return; }

    /* This tool publishes `agents: billable`. Read back with getPrimitive, a remount
       returned its own number and the badge told the user it came from another tool.
       A value you published is not a value you sourced, so the badge is raised only
       when the rail names a different producer, and it names that producer. Auto-fill
       from your own last run stays: convenience is not evidence, but it is convenient. */
    const ag = (getExternalWithSource("agents", TOOL_ID) || NO_RAIL);
    if (ag.value != null && !isNaN(ag.value)) {
      setD(p => ({ ...p, classes: p.classes.map(x => x.id === "agent" ? { ...x, count: Math.round(ag.value) } : x) }));
      if (ag.sourceTool && ag.sourceTool !== TOOL_ID) setPulled({ agents: true, from: ag.sourceTool });
    }
  }, []);

  const setClass = (id, k, v) => setD(p => ({ ...p, classes: p.classes.map(c => c.id === id ? { ...c, [k]: n(v) } : c) }));
  const setMod = (id, k, v) => setD(p => ({ ...p, modules: { ...p.modules, [id]: { ...p.modules[id], [k]: k === "cost" ? n(v) : v } } }));
  const setUse = (id, v) => setD(p => ({ ...p, usage: { ...p.usage, [id]: n(v) } }));

  const r = compute(d);
  const { billable, addOnMonthly, tierMonthly, oneTimeTotal, unknowns, doubles, usageMonthly,
    quotedSeat, effLicenseSeat, effPlatformSeat, gapPct, hiddenAnnual, decomp, annualPlatform,
    commitExpSeats, commitExpAnnual, year3LicenseSeat, year3Seat, exp18Annual, gapColor,
    shelfware, drivers, topRecur, singleDriverDominant, confidence, confColor, flags, analyst, confLine,
    guards, invariants, voided, evidenceGrade, completenessCeiling, gradeWhy, doubtWhy, gCommitted, gUplift, gSeats18, gCost, gradeObj, boundBy, defaultDrivers, evLabel } = r;

  useEffect(() => {
    /* A voided result fails its own consistency checks. Publishing it would hand a
       sibling tool a negative seat price as a baseline fact, so nothing goes out. */
    if (voided) return;
    publishToolResult("license-gap", normalizeForPublish({
      licenseQuotedSeat: +quotedSeat.toFixed(2), licenseEffectiveLicenseSeat: +effLicenseSeat.toFixed(2), licenseEffectivePlatformSeat: +effPlatformSeat.toFixed(2),
      licenseBundleGapPct: +gapPct.toFixed(1), licenseAddOnAnnual: Math.round(decomp.addOns), licenseTierAnnual: Math.round(decomp.tier), licenseUsageMonthly: Math.round(usageMonthly),
      licenseHiddenAnnual: Math.round(hiddenAnnual), licenseImplementationOneTime: Math.round(oneTimeTotal), licenseAnnualPlatform: Math.round(annualPlatform), licenseYear3Seat: +year3Seat.toFixed(2),
      licenseCommitExposureAnnual: Math.round(commitExpAnnual), agents: billable,
    }, { sourceTool: "license-gap" }).clean); /* eslint-disable-next-line */
  }, [d]);

  /* The exact input set the scenario link carries. Numeric scalars are coerced
     because NumField commits raw strings while typing, and "0" would otherwise
     diff against a default of 0 and ride in the URL for no reason. */
  const scenario = {
    classes, basis,
    committedSeats: n(committedSeats), commitBasis, commitRate: n(commitRate),
    uplift: n(uplift), seats18mo: n(seats18mo),
    evidence, confirmed, dblAck, modules, usage,
  };


  const stamp = methodStamp(TOOL_ID);
  const { how, voidReason } = resultHow(gradeObj);
  const DECOMP = [["Add-ons", decomp.addOns, 0.9], ["Tier upgrades", decomp.tier, 0.55], ["Usage fees", decomp.usage, 0.3]];
  const result = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Result label="Platform cost per seat a month" value={voidReason ? null : effPlatformSeat} format={(v) => "$" + Math.round(v).toLocaleString()}
        change={voidReason ? null : `Quoted $${quotedSeat.toFixed(0)}. Bundle gap +${gapPct.toFixed(0)}%, ${fmtK(hiddenAnnual)} a year above the quote.`}
        how={how} voidReason={voidReason} />
    </div>
  );

  return (
    <ToolFrame toolId={TOOL_ID} section="Cost + Economics" name="License Gap" title="What will your licenses really cost per seat?"
      lede="The advertised seat price is not the license cost. This reconciles the quote against what you actually pay: base seats by class, required add-ons and edition upgrades scoped to the seats they touch, usage fees normalized for comparison, minimum commits, and renewal uplift, plus the shelfware you can use as leverage. It hands TCO and Contract Risk better numbers; it does not replace them."
      method={stamp ? { version: stamp.version, date: stamp.text.replace(/^Method [^,]+, published /, ""), href: stamp.href } : null}
      result={result} pinned={voidReason ? null : { label: "Platform per seat", value: "$" + Math.round(effPlatformSeat).toLocaleString() }}>
      <style>{`${FONT_IMPORT_CSS}.lg-sel option{background:${HOUSE.navy};color:${HOUSE.mist}}`}</style>
      <p style={small}>Every formula, constant and a worked example are in the <a href="/methodology/license-gap" style={link}>published method</a>.{pulled.agents && ` Agent count pulled from your ${pulled.from} run. Editable below.`}</p>

      <fieldset style={{ ...panel, margin: 0 }}>
        <legend style={{ ...kicker, padding: "0 6px" }}>Question 1 of 3 · Seats and commitment</legend>
        <div style={grid(280)}>
          <div>
            <h2 style={h2}>Seat classes<InfoDot text={DEFS.seatClass} title="Seat classes" /></h2>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 84px 100px", gap: 8, padding: "6px 0", ...kicker, letterSpacing: "0.08em" }}>
              <span>Class</span><span style={{ textAlign: "right" }}>Count</span><span style={{ textAlign: "right" }}>$/seat/mo</span>
            </div>
            {classes.map((c) => (
              <div key={c.id} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 84px 100px", gap: 8, padding: "6px 0", alignItems: "center", borderTop: `1px solid ${hair}` }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: HOUSE.mist }}>{c.name}{c.id === "agent" && pulled.agents && <span style={{ ...small, fontWeight: 600, color: PILLARS.diagnostics.onDark, marginLeft: 6 }}>pulled</span>}</span>
                <Cell label={`${c.name} seat count`} value={c.count} onChange={v => setClass(c.id, "count", v)} />
                <Cell label={`${c.name} price per seat per month`} value={c.price} onChange={v => setClass(c.id, "price", v)} prefix="$" />
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 84px 100px", gap: 8, padding: "10px 0 0", borderTop: `1px solid ${soft}`, fontSize: 14, fontWeight: 700, color: HOUSE.mist }}>
              <span>Billable total</span><span style={{ textAlign: "right" }}>{billable}</span><span style={{ textAlign: "right" }}>${quotedSeat.toFixed(0)}</span>
            </div>
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: HOUSE.mist, display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>License basis<InfoDot text={DEFS.basis} title="License basis" /></div>
              <Choice label="License basis" options={[["named", "Named"], ["concurrent", "Concurrent"], ["blended", "Blended"]]} value={basis} onPick={(v) => set("basis", v)} />
              <span style={{ ...small, marginTop: 4, display: "block" }}>{basis === "concurrent" ? "Count peak simultaneous logins, not headcount." : basis === "blended" ? "Each class priced on its own edition or rate." : "Every assigned user needs a license, active or not."}</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <h2 style={h2}>Commitment and renewal</h2>
            <NumField tone="dark" label="Committed / minimum seats" value={committedSeats} onChange={v => set("committedSeats", v)} step={5} min={0} hint="The floor you pay for, even if you staff fewer" info={DEFS.committed} infoTitle="Committed seats" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: HOUSE.mist, display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>Commit priced at<InfoDot text={DEFS.commitBasis} title="Commit basis" /></div>
              <Choice label="Commit priced at" options={[["license", "License seat"], ["quoted", "Quoted base"], ["custom", "Custom"]]} value={commitBasis} onPick={(v) => set("commitBasis", v)} />
              {commitBasis === "custom" && <div style={{ marginTop: 6 }}><Cell label="Custom commit rate per seat" value={commitRate} onChange={v => set("commitRate", v)} prefix="$" /></div>}
            </div>
            <div style={grid(140)}>
              <NumField tone="dark" label="Renewal uplift" value={uplift} onChange={v => set("uplift", v)} suffix="%" step={1} min={0} hint="Rate rise / year" info={DEFS.uplift} infoTitle="Renewal uplift" />
              <NumField tone="dark" label="Seats +18 mo" value={seats18mo} onChange={v => set("seats18mo", v)} step={5} min={0} hint="Expansion to lock" info={DEFS.seats18mo} infoTitle="18-month expansion" />
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset style={{ ...panel, margin: 0 }}>
        <legend style={{ ...kicker, padding: "0 6px", display: "flex", alignItems: "center", gap: 4 }}>Question 2 of 3 · Module coverage<InfoDot text={DEFS.status} title="Module pricing type" /></legend>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {MODULES.map((mod) => {
            const m = modules[mod.id];
            const isCost = COST_STATUS.has(m.status);
            const isOneTime = m.status === "onetime";
            const showCost = m.need === "yes" && (isCost || isOneTime);
            const showScope = m.need === "yes" && isCost;
            const isGap = m.need === "yes" && (isCost || m.status === "usage");
            const isShelf = m.need === "no" && (m.status === "included" || m.status === "limited");
            const isUnk = m.need === "yes" && m.status === "unknown";
            const tag = isUnk ? "Unknown" : isGap ? "Costs extra" : isShelf ? "Shelfware" : m.need === "yes" ? "Included" : null;
            return (
              <div key={mod.id} style={{ padding: "12px 0", borderTop: `1px solid ${hair}` }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: HOUSE.mist }}>{mod.name}</span>
                  {tag && <span style={{ fontSize: 12, fontWeight: 700, color: HOUSE.mist, padding: "1px 8px", borderRadius: RADIUS.chip, border: isUnk ? `1px dashed ${HOUSE.mist}` : `1px solid ${soft}` }}>{tag}</span>}
                  <span style={small}>{mod.desc}</span>
                </div>
                <div style={grid(130)}>
                  <div><span style={small}>Need</span><Select label={`${mod.name}: do you need it`} value={m.need} onChange={v => setMod(mod.id, "need", v)} options={NEED_OPTS} /></div>
                  <div><span style={small}>Pricing type</span><Select label={`${mod.name}: license status`} value={m.status} onChange={v => setMod(mod.id, "status", v)} options={STATUS_OPTS} /></div>
                  <div><span style={small}>Applies to</span>{showScope ? <Select label={`${mod.name}: scope`} value={m.scope} onChange={v => setMod(mod.id, "scope", v)} options={SCOPE_OPTS} /> : <span style={{ ...small, display: "flex", alignItems: "center", minHeight: TOUCH }}>{isOneTime && m.need === "yes" ? "one-time total" : "none"}</span>}</div>
                  <div><span style={small}>$/seat</span>{showCost ? <Cell label={`${mod.name}: add-on cost`} value={m.cost} onChange={v => setMod(mod.id, "cost", v)} prefix="$" /> : <span style={{ ...small, display: "flex", alignItems: "center", minHeight: TOUCH }}>{m.status === "usage" ? "priced below" : "none"}</span>}</div>
                </div>
              </div>
            );
          })}
        </div>
        <p style={{ ...small, marginTop: 8 }}>
          Add-ons <strong style={{ color: HOUSE.mist }}>{fmtK(addOnMonthly)}/mo</strong> · tier upgrades <strong style={{ color: HOUSE.mist }}>{fmtK(tierMonthly)}/mo</strong>{oneTimeTotal > 0 ? <> · implementation <strong style={{ color: HOUSE.mist }}>{fmtK(oneTimeTotal)} one-time</strong></> : null} · scoped to the seats each touches · {shelfware.length} shelfware · {unknowns.length} unknown
        </p>
      </fieldset>

      <fieldset style={{ ...panel, margin: 0 }}>
        <legend style={{ ...kicker, padding: "0 6px", display: "flex", alignItems: "center", gap: 4 }}>Question 3 of 3 · Usage-based fees<InfoDot text={DEFS.usage} title="Usage-based fees" /></legend>
        <div style={grid(180)}>
          {USAGE_TYPES.map(t => (
            <div key={t.id} style={{ border: `1px solid ${n(usage[t.id]) > 0 ? soft : hair}`, borderRadius: RADIUS.field, padding: "10px 12px" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: HOUSE.mist }}>{t.name}</div>
              <div style={{ ...small, marginBottom: 6 }}>{t.basis}</div>
              <Cell label={`${t.name}: monthly amount`} value={usage[t.id]} onChange={v => setUse(t.id, v)} prefix="$" />
              <div style={{ ...small, marginTop: 3 }}>$/month</div>
            </div>
          ))}
        </div>
        <p style={{ ...small, marginTop: 8 }}>Total metered fees <strong style={{ color: HOUSE.mist }}>{fmtK(usageMonthly)}/mo</strong>, normalized to {fmtK(usageMonthly / Math.max(1, billable))}/seat for comparison only, not a seat fee.</p>
      </fieldset>

      {voided && <Finding level="critical" title="Output void">{`${invariants.join("; ")}. Correct the inputs before using any figure on this page.`}</Finding>}

      <div style={grid(150)}>
        <Tile label="Quoted seat" info={<InfoDot text={DEFS.baseSeat} title="Quoted seat" />} value={`$${quotedSeat.toFixed(0)}`} sub="vendor headline" />
        <Tile label="Eff. license seat" info={<InfoDot text={DEFS.effLicenseSeat} title="Effective license seat" />} value={`$${effLicenseSeat.toFixed(0)}`} sub="seat + modules + tier" />
        <Tile label="Platform seat-eq" info={<InfoDot text={DEFS.effPlatform} title="Effective platform seat equivalent" align="right" />} value={`$${effPlatformSeat.toFixed(0)}`} sub="+ usage, normalized" />
        <Tile label="Bundle gap" info={<InfoDot text={DEFS.gap} title="Bundle gap" />} value={`+${gapPct.toFixed(0)}%`} sub="platform vs quote" />
      </div>

      <section aria-label="Hidden annual cost" style={panel}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          <h2 style={{ ...h2, margin: 0 }}>Hidden annual above quoted baseline</h2>
          <span style={{ ...TYPE.statValue, fontSize: 24, color: HOUSE.mist }}>{fmtK(hiddenAnnual)}</span>
        </div>
        <div role="img" aria-label={DECOMP.map(([l, v]) => `${l} ${fmtK(v)}`).join(", ")} style={{ display: "flex", height: 14, borderRadius: RADIUS.chip, overflow: "hidden", marginBottom: 8, background: hair }}>
          {DECOMP.map(([l, v, o]) => {
            const w = hiddenAnnual > 0 ? (v / hiddenAnnual) * 100 : 0;
            return w > 0 ? <div key={l} style={{ width: `${w}%`, background: alpha(ARCS.evidence, o) }} title={`${l} ${fmtK(v)}`} /> : null;
          })}
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {DECOMP.map(([l, v, o]) => (
            <span key={l} style={{ ...small, color: HOUSE.body, display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: alpha(ARCS.evidence, o), display: "inline-block" }} />{l} <strong style={{ color: HOUSE.mist }}>{fmtK(v)}</strong></span>
          ))}
        </div>
      </section>

      {drivers.length > 0 && (
        <section aria-label="Top recurring cost drivers" style={panel}>
          <h2 style={h2}>Top recurring cost drivers</h2>
          {drivers.slice(0, 4).map((dr, i) => { const share = hiddenAnnual > 0 ? dr.annual / hiddenAnnual : 0; const hot = !dr.usage && dr.name === topRecur.name && singleDriverDominant; return (
            <div key={dr.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: `1px solid ${hair}` }}>
              <span style={{ ...small, width: 16 }}>{i + 1}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: HOUSE.mist, flex: 1 }}>{dr.name}{hot ? " (check: confirm periodicity)" : ""}</span>
              <span style={{ ...small, color: HOUSE.body }}>{fmtK(dr.annual)}/yr</span>
              <span style={{ ...small, width: 44, textAlign: "right" }}>{(share * 100).toFixed(0)}%</span>
            </div>
          ); })}
          <p style={{ ...small, marginTop: 6 }}>Share of recurring hidden annual. A single line above 80% is flagged as a likely miscategorization.</p>
        </section>
      )}

      {oneTimeTotal > 0 && (
        <p style={{ ...panel, ...body, fontSize: 14, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span>Implementation (one-time), excluded from the recurring seat economics and hidden annual</span><strong style={{ color: HOUSE.mist }}>{fmtK(oneTimeTotal)}</strong>
        </p>
      )}

      {(commitExpSeats > 0 || gUplift > 0 || gSeats18 > 0) && (
        <div style={grid(170)}>
          <Tile label="Commit exposure" value={commitExpSeats > 0 ? `${commitExpSeats} seats` : "none"} sub={commitExpSeats > 0 ? `vs ${billable} active · ${fmtK(commitExpAnnual)}/yr at ${commitBasis} basis` : "committed ≤ active"} />
          <Tile label="Year-3 seat-eq" value={`$${year3Seat.toFixed(0)}`} sub={gUplift > 0 ? `license $${effLicenseSeat.toFixed(0)} to $${year3LicenseSeat.toFixed(0)} at ${gUplift}%, usage flat` : "enter uplift to project"} />
          <Tile label="18-mo expansion" value={fmtK(exp18Annual)} sub={gSeats18 > 0 ? `${gSeats18} seats · rate-lock now` : "enter expansion seats"} />
        </div>
      )}

      <section aria-label="How sure" style={panel}>
        <span style={{ ...kicker, display: "flex", alignItems: "center", gap: 4 }}>How sure · {voided ? "Void" : confidence}<InfoDot text={DEFS.confidence} title="Export confidence" /></span>
        <div style={{ ...grid(220), marginTop: 12, alignItems: "end" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: HOUSE.mist, display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>Evidence<InfoDot text={DEFS.evidence} title="Evidence source" align="right" /></div>
            <Select label="Evidence" value={evidence} onChange={v => set("evidence", v)} options={EVIDENCE_OPTS} />
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 10, minHeight: TOUCH, cursor: "pointer" }}>
            <input type="checkbox" checked={confirmed} onChange={e => set("confirmed", e.target.checked)} style={{ width: 18, height: 18, accentColor: HOUSE.electric }} />
            <span style={{ fontSize: 14, color: HOUSE.body, fontWeight: 600 }}>Confirmed in writing</span>
          </label>
        </div>
        {doubles.length > 0 && (
          <label style={{ display: "flex", alignItems: "center", gap: 10, minHeight: TOUCH, cursor: "pointer", marginTop: 8 }}>
            <input type="checkbox" checked={dblAck} onChange={e => set("dblAck", e.target.checked)} style={{ width: 18, height: 18, accentColor: HOUSE.electric }} />
            <span style={{ fontSize: 14, color: HOUSE.body, fontWeight: 600 }}>Possible double counts confirmed as separate charges{!dblAck && <strong style={{ color: HOUSE.mist }}>, required for Finance-grade</strong>}</span>
          </label>
        )}
        <p style={{ ...small, marginTop: 10, color: voided ? HOUSE.mist : HOUSE.muted }}>{voided ? `Output void: ${invariants.join("; ")}. Correct the inputs before using any figure above.` : `Evidence ${evidenceGrade}, model completeness ${completenessCeiling}, ${gradeWhy}.`}</p>
      </section>

      {shelfware.length > 0 && (
        <section aria-label="Shelfware" style={panel}>
          <h2 style={h2}>Shelfware: leverage, not savings<InfoDot text={DEFS.shelfware} title="Shelfware" /></h2>
          <p style={{ ...body, fontSize: 14 }}>Bundled but unused: {shelfware.map(m => m.name).join(", ")}. Use it to challenge tier fit, request credits, secure implementation concessions, or negotiate future module access. Not recoverable cash unless the vendor confirms a reduction in writing.</p>
        </section>
      )}

      <section aria-label="Integrity checks" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h2 style={h2}>Integrity checks</h2>
        {flags.map((f, i) => <Finding key={i} level={f.sev === "warn" ? "high" : "unknown"} title={f.sev === "warn" ? "Check this" : "Note"}>{f.t}</Finding>)}
        {!flags.length && <Finding level="clear" title="Integrity checks passed">Inclusion is known on every needed module, nothing forces a hidden tier upgrade, usage fees are priced with no double counts, and committed seats match active.</Finding>}
      </section>

      <section aria-label="What it means" style={{ ...panel, borderLeft: `3px solid ${PILLARS.diagnostics.fill}` }}>
        <span style={kicker}>What it means · normalized per-seat is not a vendor seat price</span>
        {analyst.map((t, i) => <p key={i} style={{ ...body, margin: i ? "10px 0 0" : "8px 0 0" }}>{t}</p>)}
      </section>

      {/* The report is paper (Brand Guide section 13). */}
      <div style={{ background: HOUSE.paper, color: HOUSE.paperInk, borderRadius: RADIUS.card, padding: "8px 20px 20px" }}>
          <ReportActions
            toolId={TOOL_ID}
            toolName="License Bundle Gap Analysis"
            subtitle={`Quoted vs effective platform seat · ${voided ? "EXPORT VOID, integrity invariant failed" : `${confidence}, bound by ${boundBy}`}`}
            routePath={ROUTE}
            state={scenario}
            defaults={DEFAULTS}
            grades={gradeObj}
            summary={[
              { label: "Quoted seat", value: "$" + quotedSeat.toFixed(0) },
              { label: "Effective license seat", value: "$" + effLicenseSeat.toFixed(0) },
              { label: "Platform seat-equivalent", value: "$" + effPlatformSeat.toFixed(0) },
              { label: "Bundle gap", value: gapPct.toFixed(0) + "%" },
              { label: "Hidden annual", value: fmtK(hiddenAnnual) },
            ]}
            signals={{
              /* Severity is the hidden premium as a share of the seat price the
                 vendor quoted: platform seat-equivalent over quoted seat, minus
                 one. The denominator is the number the vendor printed on the page,
                 which is the only figure a buyer arrives holding, so the band
                 answers the question the tool is for: how far off is the quote.

                 The colour thresholds already in the engine agree with the
                 bands rather than competing with them. Amber at a 40% gap lands in
                 moderate and red at 80% lands in severe, so the page and the
                 published band cannot say different things. Measured: 15% on a
                 high quote with few add-ons reads low, the shipped defaults read
                 moderate at 48%, and usage fees or a thin quote push past 96%
                 into severe.

                 Uncapped on purpose. A 200% gap is not the same finding as an
                 80% gap, but both are severe and the bucket saturates there
                 anyway, so clamping would only hide that the ratio is a real
                 quantity rather than a score.

                 With no billable seats there is no quote to price a premium
                 against and gapPct is a structural zero, not a clean result, so
                 the key is omitted. A void export is omitted for the same reason
                 it is void: the model contradicts itself. */
              ...(voided || billable <= 0 || quotedSeat <= 0 ? {} : { severity: severityBucket(gapPct / 100) }),
              evidence,
              ...(voided ? {} : { evidence_grade: evidenceGrade, completeness_ceiling: completenessCeiling }),
              default_drivers: defaultDrivers.length,
              billable_seats: billable,
              shelfware_modules: shelfware.length,
              integrity_flags: flags.length,
              inputs_corrected: guards.length,
              output_void: voided ? "yes" : "no",
              magnitude_doubt: doubtWhy.length ? doubtWhy.join("; ") : "none",
              commit_exposure_seats: commitExpSeats,
              agents_pulled_from: pulled.from || "none",
              from_scenario_link: fromLink ? "yes" : "no",
            }}
            sections={[
              ...(voided ? [{ title: "\u26A0 Output Void", type: "findings", items: invariants.map(t => `${t}. This report contradicts itself and no figure in it can be used.`) }] : []),
              ...(guards.length ? [{ title: "\u26A0 Inputs Corrected Before Calculation", type: "findings", items: guards.map(g => `${g.label}: entered ${guardVal(g, "entered")}, computed at ${guardVal(g, "used")}.`) }] : []),
              { title: "Commercial Caveats", type: "text", content: confLine },
              { title: "Seat Economics", type: "metrics", items: [
                { label: "Quoted Seat", value: "$" + quotedSeat.toFixed(0), color: ELECTRIC, sub: "vendor headline" },
                { label: "Eff. License Seat", value: "$" + effLicenseSeat.toFixed(0), color: SLATE, sub: "seat+modules+tier" },
                { label: "Platform Seat-Eq", value: "$" + effPlatformSeat.toFixed(0), color: gapColor, sub: "+usage, normalized" },
                { label: "Bundle Gap", value: "+" + gapPct.toFixed(0) + "%", color: gapColor },
              ]},
              { title: "Hidden Annual, decomposed", type: "table", rows: [
                ["Required add-ons", fmtK(decomp.addOns)],
                ["Tier upgrades", fmtK(decomp.tier)],
                ["Usage-based fees", fmtK(decomp.usage)],
                ["Total hidden annual", fmtK(hiddenAnnual)],
              ]},
              { title: "Module Coverage", type: "table", rows: MODULES.filter(m => modules[m.id].need !== "no" || modules[m.id].status === "included" || modules[m.id].status === "limited").map(m => {
                const x = modules[m.id]; const st = STATUS_OPTS.find(s => s.v === x.status)?.l || x.status;
                const sc = COST_STATUS.has(x.status) ? " · " + (SCOPE_OPTS.find(s => s.v === x.scope)?.l || x.scope) : "";
                const tag = x.need === "no" && (x.status === "included" || x.status === "limited") ? "Shelfware" : x.need === "unsure" ? "Unsure" : st + (COST_STATUS.has(x.status) ? " $" + gCost[m.id] + sc : "");
                return [m.name, tag];
              }) },
              ...(commitExpSeats > 0 || gUplift > 0 ? [{ title: "Commercial Exposure", type: "metrics", items: [
                ...(commitExpSeats > 0 ? [{ label: "Commit Exposure", value: commitExpSeats + " seats", color: AMBER, sub: fmtK(commitExpAnnual) + "/yr · " + commitBasis + " basis" }] : []),
                ...(gUplift > 0 ? [{ label: "Year-3 Seat-Eq", value: "$" + year3Seat.toFixed(0), color: RED, sub: gUplift + "% uplift" }] : []),
                ...(gSeats18 > 0 ? [{ label: "18-mo Expansion", value: fmtK(exp18Annual), color: SLATE }] : []),
              ] }] : []),
              ...(shelfware.length ? [{ title: "Shelfware (leverage, not savings)", type: "text", content: `${shelfware.length} module${shelfware.length > 1 ? "s" : ""} bundled but unused: ${shelfware.map(m => m.name).join(", ")}. Challenge tier fit, request credits, secure implementation concessions, or negotiate future module access. Not recoverable unless the vendor confirms a reduction in writing.` }] : []),
              ...(flags.length ? [{ title: "Integrity Checks", type: "findings", items: flags.map(f => f.t) }] : []),
              { title: "Analyst Read", type: "findings", items: analyst },
              { title: "Methodology", type: "text", content: `Three figures, deliberately distinct. Quoted seat = base monthly across seat classes / billable seats. Effective license seat adds required per-seat add-ons and edition (tier) upgrades, each priced only on the seats in its scope, then divided by billable seats. Still a true per-seat figure. Effective platform seat-equivalent adds usage-based fees and normalizes across billable seats for comparison only; it is not a vendor seat price, because usage scales with volume, not seats. Hidden annual is the platform total over the quoted baseline, decomposed into add-ons, tier upgrades, and usage. Tier upgrades may force the whole base onto a higher edition. Confirm scope in writing. Commit exposure prices idle committed seats at the chosen basis (license seat by default, not the usage-loaded equivalent, to avoid overstating). The year-three projection applies the renewal uplift to the contracted license rates only and holds usage flat, because usage scales with volume rather than the contract. Modules are classified by pricing behavior (per-seat add-on, tier upgrade, usage-based, or one-time), not by commercial source, because behavior is what determines the math. Implementation and other one-time costs are shown separately and excluded from the recurring seat economics and hidden annual, because those are monthly and per-seat. Shelfware is leverage only, never recoverable savings. Confidence runs on two axes and takes the lower. The evidence axis grades what the numbers rest on: a document (proposal, order form, SKU schedule, or MSA) confirmed in writing reaches Finance-grade, a document or vendor email alone reaches Planning-grade, an estimate is Directional. The model-completeness axis grades whether the cost picture is whole: unknown inclusion, unresolved Unsure flags, corrected inputs, or an implausible magnitude cap it at Directional, and missing committed seats, missing uplift, unpriced usage, unconfirmed double counts, or an unconfirmed dominant line cap it at Planning-grade. There is deliberately no capacity credit class here, because this prices contract cost, which is cash out the door, not freed capacity. Result: ${confidence}, ${gradeWhy}. Evidence source: ${evLabel}.${guards.length ? ` INPUTS CORRECTED: ${guards.map(g => `${g.label} entered ${guardVal(g, "entered")}, computed at ${guardVal(g, "used")}`).join("; ")}. Every figure above was computed on the corrected values.` : ""}${voided ? ` OUTPUT VOID: ${invariants.join("; ")}.` : ""} The full method, with every formula, constant and a worked example, is published at contactcentercx.com/methodology/license-gap.` },
            ]}
          />

      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Button kind="secondary" href="/tools/contract-risk">Contract Risk Scanner</Button>
      </div>
    </ToolFrame>
  );
}

/* The scenario-link defaults, exported for the live checker and the visual audit. */
export { DEFAULTS };
