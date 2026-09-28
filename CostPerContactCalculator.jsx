import { useState, useEffect, useRef } from "react";
import ReportActions from "./ReportActions";
import { COLORS, benchmark } from "./src/lib/benchmarks";
import { emitGrades, voidResult, isVoid, railEvidence, weakerStream, realizationFromCred, originsFor } from "./src/lib/confidence";
import { publishToolResult, getExternalWithSource } from "./src/lib/toolData";
/* An empty rail read, in the shape the old self-capable getter returned, so a missing or self-published value reads as
   nothing (P6 item 15: every pull is external). */
const NO_RAIL = Object.freeze({ value: null, sourceTool: null, railOrigin: null, derived: false, flag: null, confidenceImpact: null });
import { normalizeForPublish } from "./src/lib/metrics";
import NumField from "./src/lib/NumField";
import { MECH, MECH_ORDER, MECH_INITIAL, isNoActionFlag } from "./src/lib/mech";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { severityBucket } from "./src/lib/track";
import { createGuards, guardVal, guardLine } from "./src/lib/guards";
import { FONT, FONT_IMPORT_CSS, TYPE, W, NUM } from "./src/lib/type";
import { ToolFrame } from "./src/lib/ToolFrame.jsx";
import { Result, Finding, resultHow } from "./src/lib/ui.jsx";
import { HOUSE, PILLARS, RADIUS, TOUCH, FONT_MONO, alpha, LINE, onFill } from "./src/lib/tokens.js";
import { methodStamp } from "./src/lib/methodVersions.js";

const NAVY = COLORS.navy, DEEP = "#061325", ELECTRIC = COLORS.electric, LIGHT = "#00AAFF";
const ICE = "#E8F4FD", WARM = "#F8FAFB", SLATE = "#3A4F6A", MUTED = COLORS.muted, BORDER = "#D8E3ED";
const GREEN = COLORS.green, AMBER = COLORS.amber, RED = COLORS.red;
const WRAP = { maxWidth: 960, margin: "0 auto", padding: "0 28px" };

function LogoMark({ size = 30, light = true }) {
  const a = light ? "#fff" : NAVY, x = light ? LIGHT : ELECTRIC;
  return <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light ? .6 : .3} /><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light ? .8 : .5} /><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round" /><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /></g></svg>;
}


// Capacity action drives realization. Freed handle time is not cash until you commit to a
// mechanism; "none" credits nothing. Each carries an honest cashability ceiling.


/* @engine-start
   Everything between these markers is the Cost per Contact engine and the only
   things it closes over. cpc.test.mjs and cpc.report.mjs slice this exact region
   out of this exact file at runtime and evaluate it, so the tested engine and the
   shipped engine cannot drift apart.

   n, money and fmtK were relocated here from the top of the file. They are engine
   dependencies (compute and buildAnalystRead both call them, and every figure the
   report prints is formatted by them), so they belong inside the tested region
   rather than being rebuilt inside a harness where they could drift. Nothing
   between their old and new positions evaluated them at module load, so the move
   is behaviour-neutral.

   MECH is injected from the real src/lib/mech.js and ELECTRIC, GREEN and AMBER
   from the real src/lib/benchmarks.js. Neither is reconstructed. */
const n = (v) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };
const money = (v) => { const x = n(v); return (x < 0 ? "-$" : "$") + Math.abs(x).toFixed(2); };
const fmtK = (v) => { const x = n(v), s = x < 0 ? "-" : ""; const a = Math.abs(x); return s + (a >= 1000000 ? "$" + (a / 1000000).toFixed(2) + "M" : a >= 1000 ? "$" + (a / 1000).toFixed(0) + "K" : "$" + Math.round(a)); };

/* One renderer for a guarded value, used by every path that discloses a correction.
   Three paths printed these before: the on-page flag, the Inputs Corrected section of
   the downloaded report, and the methodology paragraph. The flag put the dollar sign
   in front and the other two put it behind, so the same correction read as $-12 on
   screen and -12$ in the PDF. That is the split-rendering defect class, one quantity
   derived twice, and it is why this is a function rather than three template literals.
   The sign leads the symbol, matching money and fmtK above and every other money
   format in the platform. It now lives in src/lib/guards.js with the clamp that fills
   it, shared by every guarded tool, so the rule cannot drift per tool again. */

/* Every default is a registry entry. The operating profile is labelled heuristic
   there, and the wage is the BLS market median. Decision C, session 14. */
const BASE = {
  monthlyContacts: benchmark("cpc.default.volume"), denominator: "handled",
  fcrRate: benchmark("cpc.default.fcr"), contactsPerUnresolved: benchmark("cpc.default.m"),
  loadedCPC: benchmark("cpc.default.loaded"), marginalCPC: benchmark("cpc.default.marginal"), validated: false,
  agentHourly: benchmark("market.wage.agent"), overheadMultiplier: benchmark("load.benefits"),
  productiveHoursPerFTE: benchmark("cpc.default.productiveHours"),
  voicePct: benchmark("cpc.default.mix.voice"), chatPct: benchmark("cpc.default.mix.chat"), emailPct: benchmark("cpc.default.mix.email"),
  voiceAHT: benchmark("cpc.default.aht.voice"), chatAHT: benchmark("cpc.default.aht.chat"), emailAHT: benchmark("cpc.default.aht.email"),
  voiceConcurrency: benchmark("cpc.default.conc.voice"), chatConcurrency: benchmark("cpc.default.conc.chat"), emailConcurrency: benchmark("cpc.default.conc.email"),
};
const MARG_SHARE = benchmark("cpc.derive.marginalShare");
const EFF_AHT_FALLBACK = benchmark("cpc.fallback.effAht");
const CONC_FLOOR = benchmark("cpc.guard.concurrencyFloor");
const REPEAT_SHARE_LINE = benchmark("cpc.read.repeatShare");
const LOW_FCR = benchmark("cpc.read.lowFcr"), SHALLOW_M = benchmark("cpc.read.shallowM");
const FCR_LEAK_LINK = benchmark("cpc.read.fcrLeakLink");
const GAP_AMBER = benchmark("cpc.band.gapAmber"), GAP_RED = benchmark("cpc.band.gapRed");
/* The dividend steps, in order, with the realism tier each is read as. The layers
   table, the math drawer and the analyst read all quote the middle step. */
const DIV_STEPS = [benchmark("cpc.dividend.step1"), benchmark("cpc.dividend.step2"), benchmark("cpc.dividend.step3")];
const DIV_TIERS = ["Operational", "Root-cause work", "Transformation"];
const QUOTED_STEP = DIV_STEPS[1];
const quoted = (r) => r.dividend.find(x => x.p === QUOTED_STEP) || {};

/* Scenario contract. Module scope for stable identity across renders. */
const TOOL_ID = "cost-per-contact";
const ROUTE = "/tools/cost-per-contact";
const clone = (o) => JSON.parse(JSON.stringify(o));
/* The initial capacity action comes from mech.js, never a literal here. Tracker 1-08b
   decides its value for every tool at once. */
const DEFAULTS = { d: BASE, mech: MECH_INITIAL };

function compute(d, mechIn) {
  /* Input integrity. Every one of these was silently accepted before, and a
     scenario link decodes straight into this function with no field validation
     in between: an edited URL could print a clean, flag-free report off a
     negative volume or a 150% FCR. Clamping alone is not enough. A value the
     engine had to change is a value the report must disclose, or the document
     shows a number the engine never ran. `used` carries what was computed;
     `entered` carries what was asked for; they are printed side by side. */
  const { guards, guard, pick } = createGuards();

  const fcrPct = guard("First contact resolution", d.fcrRate, 0, 100, "%");
  const fcr = fcrPct / 100;
  const Mu = guard("Contacts per unresolved issue (M)", d.contactsPerUnresolved, 1, null, "");
  const loaded = guard("Loaded cost per contact", d.loadedCPC, 0, null, "$");
  const margEntered = n(d.marginalCPC);
  const margGuarded = guard("Marginal cost per contact", d.marginalCPC, 0, null, "$");
  const margDerived = margGuarded <= 0;
  const marg = margDerived ? loaded * MARG_SHARE : margGuarded;
  /* Own-key lookup through pick, the same resolution Channel Shift runs. The raw key
     used to index MECH directly: an unknown value threw on .f and crashed the page,
     and a prototype name (MECH["toString"] is a function) computed NaN with zero
     corrections under a Directional ceiling. The fallback is none, which realizes $0.
     A broken link must never credit a realization the user did not choose, so it does
     not fall back to the hiring default. */
  const mechKey = pick("Capacity action", mechIn, MECH, "none");
  const mf = MECH[mechKey].f;

  const C = fcr * 1 + (1 - fcr) * Mu;        // total contacts per resolved issue
  const gapPct = (C - 1) * 100;
  const cprLoaded = loaded * C;

  // Volume denominator: handled contacts (default) or resolved issues. The repeat
  // math differs, so the basis must be explicit. Another place a tool can lie by accident.
  const vol = guard(d.denominator === "issues" ? "Monthly resolved issues" : "Monthly handled contacts", d.monthlyContacts, 0, null, "");
  let handled, resolutions, repeatContacts;
  if (d.denominator === "issues") { resolutions = vol; handled = vol * C; repeatContacts = vol * (C - 1); }
  else { handled = vol; resolutions = vol / C; repeatContacts = vol - resolutions; }
  repeatContacts = Math.max(0, repeatContacts);
  const repeatShare = handled > 0 ? repeatContacts / handled : 0;

  // Baseline pool: the marginal cost of ALL repeat demand. A burden and a ceiling,
  // NOT a savings figure and NOT "created." Realization does not apply here.
  const burden = repeatContacts * marg;
  const burdenLoaded = repeatContacts * loaded;   // accounting view

  // Channel handle economics (labor only) + blended effective minutes for FTE math.
  const agentHourly = guard("Agent hourly rate", d.agentHourly, 0, null, "$");
  const overheadMult = guard("Overhead multiplier", d.overheadMultiplier, 1, null, "x");
  const laborLoadedPerMin = agentHourly * overheadMult / 60;
  const chDefs = [
    { name: "Voice", pct: guard("Voice mix", d.voicePct, 0, 100, "%"), aht: guard("Voice AHT", d.voiceAHT, 0, null, "m"), conc: guard("Voice concurrency", d.voiceConcurrency, CONC_FLOOR, null, ""), color: ELECTRIC },
    { name: "Chat", pct: guard("Chat mix", d.chatPct, 0, 100, "%"), aht: guard("Chat AHT", d.chatAHT, 0, null, "m"), conc: guard("Chat concurrency", d.chatConcurrency, CONC_FLOOR, null, ""), color: GREEN },
    { name: "Email", pct: guard("Email mix", d.emailPct, 0, 100, "%"), aht: guard("Email AHT", d.emailAHT, 0, null, "m"), conc: guard("Email concurrency", d.emailConcurrency, CONC_FLOOR, null, ""), color: AMBER },
  ];
  const channels = chDefs.map(ch => { const effAHT = ch.aht / ch.conc; return { ...ch, effAHT, handleCPC: laborLoadedPerMin * effAHT, volume: Math.round(handled * ch.pct / 100), spend: handled * (ch.pct / 100) * laborLoadedPerMin * effAHT }; });
  /* `|| 100` used to run BEFORE the mix flag read this value, so a 0% mix became
     100 and the guard that exists to catch exactly that never fired: blended handle
     cost printed $0.00 with integrity checks passed. Keep the real total for the
     flag and use the divisor only for the division. */
  const chPctTotal = channels.reduce((s, c) => s + c.pct, 0);
  const chDivisor = chPctTotal > 0 ? chPctTotal : 100;
  const blendedHandle = channels.reduce((s, c) => s + (c.pct / chDivisor) * c.handleCPC, 0);
  const blendedEffMinRaw = channels.reduce((s, c) => s + (c.pct / chDivisor) * c.effAHT, 0);
  const blendedEffMinFallback = !(blendedEffMinRaw > 0);
  const blendedEffMin = blendedEffMinFallback ? EFF_AHT_FALLBACK : blendedEffMinRaw;

  const pHrsRaw = n(d.productiveHoursPerFTE);
  if (!(pHrsRaw > 0)) guards.push({ label: "Productive hours per FTE", entered: pHrsRaw, used: BASE.productiveHoursPerFTE, unit: "h" });
  const pHrs = pHrsRaw > 0 ? pHrsRaw : BASE.productiveHoursPerFTE;
  const fteBurden = (repeatContacts * blendedEffMin / 60) / pHrs;

  // FCR dividend: capacity RELEASED is scenario-incremental; realizable applies the mechanism.
  const dividend = DIV_STEPS.map((p, i) => {
    const f1 = Math.min(1, fcr + p / 100); const C1 = f1 + (1 - f1) * Mu;
    const avoided = Math.max(0, resolutions * (C - C1));
    const released = avoided * marg;
    return { p, newFCR: f1 * 100, avoided, released, realizable: released * mf, fte: (avoided * blendedEffMin / 60) / pHrs, tier: DIV_TIERS[i] };
  });

  const flags = [];
  /* Guard disclosure comes FIRST. If the engine had to change an input, that is the
     most important thing on the page: every figure below it was computed from a
     number the user did not enter. */
  for (const g of guards) flags.push({ sev: "warn", t: `${g.label}: you entered ${guardVal(g, "entered")}, which is outside the possible range. Every figure in this report was computed at ${guardVal(g, "used")}. Correct the input; until then the result grades Directional.` });
  if (margDerived) flags.push({ sev: "info", t: `No usable marginal cost was entered, so marginal was derived at ${Math.round(MARG_SHARE * 100)}% of loaded (${money(marg)}). Marginal cost (the variable cost that goes away when a contact does) drives the repeat-demand burden and every released figure. Enter your own variable cost before you present any of them.` });
  if (loaded > 0 && marg >= loaded) flags.push({ sev: "warn", t: "Marginal cost is not below loaded. Marginal should be the lower figure: the variable cost of one contact. Removing a contact leaves the fixed platform and facilities costs in the loaded figure unchanged. Check the cost basis." });
  if (chPctTotal !== 100) flags.push({ sev: "warn", t: chPctTotal === 0 ? `Channel mix sums to 0%. Blended handle cost and the FTE burden below use a fallback effective handle time of ${EFF_AHT_FALLBACK} minutes because there is no mix to weight. Set the mix before reading either.` : `Channel mix sums to ${chPctTotal}%. Channel spend is scaled to volume. Blended handle cost reads true only when the mix totals 100%.` });
  if (repeatShare > REPEAT_SHARE_LINE) flags.push({ sev: "info", t: `Repeat demand is ${(repeatShare * 100).toFixed(0)}% of all contacts. At this level it is a resolution problem: raising FCR reduces it, while a lower price per contact leaves every repeat in place.` });
  if (fcr < LOW_FCR && Mu < SHALLOW_M) flags.push({ sev: "warn", t: `A low FCR (${n(d.fcrRate)}%) with so few contacts per unresolved issue (M = ${Mu}) likely understates the repeat burden. Check reopened cases, callbacks, transfers and follow-ups in your data. At this FCR, M is usually higher than ${SHALLOW_M}.` });
  if (mechKey === "none") flags.push({ sev: "warn", t: "No capacity action selected: realizable savings are $0. Choose how freed time will be used (less overtime, hiring avoided, vendor reduction or headcount) before you present any savings figure." });
  if (mechKey === "headcount") flags.push({ sev: "info", t: "Headcount reduction converts in full to cash and carries the highest change and CSAT risk (CSAT is customer satisfaction). Confirm the FCR gain holds over time before you commit to it." });

  return { C, gapPct, cprLoaded, loaded, marg, margDerived, margEntered, mf, mechKey, cred: MECH[mechKey].cred, fcrPct, Mu, vol, agentHourly, overheadMult, pHrs, guards, blocked: guards.length > 0, handled: Math.round(handled), resolutions: Math.round(resolutions), repeatContacts: Math.round(repeatContacts), repeatShare, burden, burdenLoaded, channels, blendedHandle, blendedEffMin, blendedEffMinFallback, chPctTotal, fteBurden, dividend, flags };
}

function buildAnalystRead(d, r, mechKey) {
  const out = [];
  const unit = d.denominator === "issues" ? "resolved issue" : "handled contact";
  out.push(`Each contact costs ${money(r.loaded)} fully loaded, and each resolved issue costs ${money(r.cprLoaded)}, ${r.gapPct.toFixed(0)}% more. The difference is repeat demand: ${(r.repeatShare * 100).toFixed(0)}% of handled contacts are repeats about an issue that was not resolved the first time. The repeat rate drives the cost of a resolution, so that is the lever to study first.`);

  out.push(`The repeat-demand burden is ${fmtK(r.burden)}/mo, the marginal cost of handling every repeat contact, or ${r.fteBurden.toFixed(1)} FTE (full-time equivalents) of agent time. Read it as a ceiling. You will not release all of it, because FCR never reaches 100%, and none of it is a saving on its own. The FCR steps below show what a realistic improvement releases.`);

  const d10 = r.dividend.find(x => x.p === QUOTED_STEP);
  if (d10) out.push(`Lifting FCR ${QUOTED_STEP} points to ${d10.newFCR.toFixed(0)}% releases ${fmtK(d10.released)}/mo of that burden as agent capacity, which becomes cash only through the capacity action you choose. With ${MECH[r.mechKey].label}${r.mechKey !== "none" ? ` (${Math.round(r.mf * 100)}%)` : ""}, ${fmtK(d10.realizable)}/mo is realizable this cycle. ${r.mechKey === "none" ? "That is $0 for now because no capacity action is selected." : "The realizable figure moves with that action alone. Change the action and it changes."} A ${QUOTED_STEP} point FCR gain usually takes root-cause work on processes, knowledge and systems. Treat +${DIV_STEPS[2]} as a transformation case and plan on smaller steps.`);

  out.push(`Cost per contact and cost per resolution use the fully loaded cost, which is the right basis for unit costs. The burden and the released figures use the marginal cost. Realizable is the released figure scaled by the capacity action. These are four different numbers, and the report keeps them apart so that a saving is never read off a unit cost.`);
  return out;
}

/* CONFIDENCE. Three applicable axes through confidence.js, and the report names the
   one that bound it. No grade ladder lives in this file.

   Evidence has two streams, and the weaker binds. Each graded field carries an origin:
   a tool default, the user's own entry, a value restored from this tool's own last
   run, or a value another tool published on the rail.
     Operating stream: volume, FCR and M. A default grades Directional. FCR and M stand
     at Planning-grade only when both are the user's own AND the checkbox attests them
     from data (decision D). The checkbox is self-attestation, so this tool never
     reaches Finance-grade on evidence: it has no document attestation path.
     Cost stream: loaded and marginal cost. A default, or a marginal derived from
     loaded, grades Directional. The user's own entry stands at Planning-grade.
   A rail value confers consistency, and evidence only as far as the origin grade its
   publisher recorded, capped by railEvidence. The rail carries no origin grade today,
   so a rail value grades Directional. That closed defect class 2 here: a rail cost
   basis with no origin grade used to lift this tool to Planning-grade, and to
   Finance-grade with the checkbox ticked. A value restored from this tool's own last
   run grades Directional too, because a tool never credentials itself.

   Realization reads mech.js credit class through realizationFromCred, and nothing else.

   Completeness holds Directional on every disclosed failure of the model: a corrected
   input, marginal at or above loaded, a channel mix off 100 percent, the effective
   handle time fallback, a low FCR with an implausibly shallow M, or no handled volume.
   That closed defect class 3: each was disclosed and none reached the grade, so the
   page said "treat the output as void" over a Finance-grade export.

   Invariants void the export. Each is unreachable through the guards, and the harness
   proves it across the scenario set. */
const OPS_FIELDS = [["monthlyContacts", "contact volume"], ["fcrRate", "FCR"], ["contactsPerUnresolved", "M"]];
const COST_FIELDS = [["loadedCPC", "loaded cost"], ["marginalCPC", "marginal cost"]];

/* Where a graded field's value came from. `pre` holds what the mount prefill wrote,
   field by field, with the tool that published it. A prefilled value the user has
   since changed is the user's own. */
function fieldOrigin(d, pre, f) {
  const v = n(d[f]);
  const p = pre && Object.prototype.hasOwnProperty.call(pre, f) ? pre[f] : null;
  if (p && n(p.value) === v) return p.src === TOOL_ID ? "self" : "rail";
  if (v === BASE[f]) return "default";
  return "entered";
}

function gradeCPC({ d, r, pre, railOrigin }) {
  const invariants = [];
  const figs = [r.C, r.cprLoaded, r.burden, r.burdenLoaded, r.fteBurden, r.repeatShare, r.blendedHandle,
    ...r.dividend.flatMap(x => [x.released, x.realizable, x.fte])];
  if (!figs.every(Number.isFinite)) invariants.push("an output is not a finite number");
  if (r.C < 1) invariants.push("contacts per resolution is below one");
  if (r.repeatShare < 0 || r.repeatShare > 1) invariants.push("repeat share is outside 0 to 100 percent");
  if (r.burden < 0 || r.burdenLoaded < 0) invariants.push("the repeat-demand burden is below zero");
  if (r.dividend.some(x => x.released < 0 || x.realizable < 0 || x.realizable > x.released + 1e-9)) invariants.push("a realizable figure exceeds the capacity it was drawn from");

  const origins = Object.fromEntries([...OPS_FIELDS, ...COST_FIELDS].map(([f]) => [f, fieldOrigin(d, pre, f)]));
  /* Origin grades are per field. A pulled value grades no higher than the grade its
     publisher recorded for it, so one weak pull no longer drags every pull down and one
     strong pull no longer lifts them. `railOrigin` is the blanket fallback for a field the
     rail carries with no recorded origin. */
  const railGradeOf = (f) => railEvidence((pre && pre[f] && pre[f].origin) || railOrigin);
  const fieldGrade = (f, entered) => ({ default: "Directional", self: "Directional", rail: railGradeOf(f), entered })[origins[f]];
  const attested = !!d.validated;
  const opsGrade = OPS_FIELDS.map(([f]) => fieldGrade(f, f === "monthlyContacts" || attested ? "Planning-grade" : "Directional")).reduce(weakerStream);
  const costGrade = COST_FIELDS.map(([f]) => f === "marginalCPC" && r.margDerived ? "Directional" : fieldGrade(f, "Planning-grade")).reduce(weakerStream);
  const evidence = weakerStream(opsGrade, costGrade);

  const named = (list, o) => list.filter(([f]) => origins[f] === o).map(([, l]) => l);
  const say = (list) => list.length > 1 ? list.slice(0, -1).join(", ") + " and " + list[list.length - 1] : list[0];
  const why = (list) => {
    const parts = [];
    const def = named(list, "default"), self = named(list, "self"), rail = named(list, "rail");
    if (def.length) parts.push(`${say(def)} ${def.length > 1 ? "are" : "is"} still at the tool default`);
    if (self.length) parts.push(`${say(self)} ${self.length > 1 ? "were" : "was"} restored from this tool's own last run, and a tool never credentials itself`);
    if (rail.length) {
      const seen = [...new Set(list.filter(([f]) => origins[f] === "rail").map(([f]) => (pre && pre[f] && pre[f].origin) || railOrigin).map((g) => g || "none"))];
      const noted = seen.length === 1 && seen[0] === "none" ? "with no recorded origin grade" : `with an origin grade of ${say(seen)}`;
      parts.push(`${say(rail)} arrived over the rail ${noted}, which confers consistency and evidence only as far as its origin`);
    }
    return parts;
  };
  const opsParts = why(OPS_FIELDS);
  if (!opsParts.length && !attested) opsParts.push("FCR and M are your own entries but are not attested from data. Tick the validation box once they come from your reporting");
  if (!opsParts.length) opsParts.push("Volume, FCR and M are your own entries, attested from data. Self-attestation stands at Planning-grade at most");
  const costParts = why(COST_FIELDS);
  if (r.margDerived) costParts.push(`marginal cost was derived at ${Math.round(MARG_SHARE * 100)} percent of loaded rather than entered`);
  if (!costParts.length) costParts.push("Loaded and marginal cost are your own entries. With no document attestation path they stand at Planning-grade at most");
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const evParts = [...(opsGrade === evidence ? opsParts : []), ...(costGrade === evidence ? costParts : [])];

  const realization = realizationFromCred(r.cred);
  const realWhy = r.mechKey === "none"
    ? "No capacity action is selected, so no released capacity converts to cash"
    : `${MECH[r.mechKey].label} is credited as ${r.cred} in mech.js`;

  const blockers = [];
  if (r.guards.length) blockers.push(`${r.guards.length} input${r.guards.length > 1 ? "s were" : " was"} outside the possible range and corrected before calculation`);
  if (r.loaded > 0 && r.marg >= r.loaded) blockers.push("marginal cost is not below loaded cost, so the cost basis contradicts itself");
  if (r.chPctTotal !== 100) blockers.push(`the channel mix sums to ${r.chPctTotal} percent`);
  if (r.blendedEffMinFallback) blockers.push(`effective handle time fell back to ${EFF_AHT_FALLBACK} minutes`);
  if (r.fcrPct / 100 < LOW_FCR && r.Mu < SHALLOW_M) blockers.push("a low FCR with an M this shallow likely understates the repeat burden");
  if (!(r.handled > 0)) blockers.push("no volume was handled, so the model measured nothing");
  const completeness = blockers.length ? "Directional" : "Finance-grade";
  const modelWhy = blockers.length ? blockers.join("; ")
    : "The model is whole: no input was corrected, marginal sits below loaded, the channel mix is 100 percent and M is consistent with FCR";

  const voided = invariants.length > 0;
  const gradeObj = voided
    ? voidResult({
        invariant: invariants.join("; "),
        remedy: "Correct the inputs behind the failed check and re-run before citing any figure in this report.",
      })
    : emitGrades({
        evidence, realization, completeness,
        reasons: { evidence: `${evParts.map(cap).join(". ")}.`, realization: `${realWhy}.`, completeness: `${cap(modelWhy)}.` },
      });
  const confidence = voided ? "Void" : gradeObj.headline;
  const gradeWhy = voided
    ? `export void: ${invariants.join("; ")}`
    : `bound by ${gradeObj.boundBy}. ${gradeObj.boundAxes.map(a => gradeObj.reasons[a]).join(" ")}`;
  return { gradeObj, confidence, gradeWhy, voided, invariants, evidence, opsGrade, costGrade, realization, completeness, blockers, origins };
}

/* @engine-end */

export default function CostPerContactCalculator() {
  const [d, setD] = useState(() => clone(DEFAULTS.d));
  const [mech, setMech] = useState(DEFAULTS.mech);
  const [pulled, setPulled] = useState({});
  const [pullSources, setPullSources] = useState([]);
  const [pre, setPre] = useState({});
  const [showMath, setShowMath] = useState(false);
  const [fromLink, setFromLink] = useState(false);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    // A scenario link is a deliberate act and outranks the ambient cross-tool pull.
    const s = readScenario(TOOL_ID, DEFAULTS);
    if (s) { setD(s.d); setMech(s.mech); setFromLink(true); clearScenarioParam(); return; }

    /* Prefill and credentialing are two different things and this tool used to
       conflate them. Prefill may read anything on the rail, including this tool's
       own prior run: pre-populating a field from your last visit is a convenience.
       The confidence gate may only read values ANOTHER tool produced, because
       Cost per Contact is the sole publisher of costPerContact and
       marginalPerContact, and reading its own defaults back was letting it
       credential itself to Finance-grade from numbers it invented one navigation
       earlier. `got` records only externally sourced keys and drives both the
       badge and the grade. `next` records everything and drives the fields. */
    const next = {}, got = {}, srcOf = {}, seen = {};
    /* Keys stay as string literals at the call site. rail-audit.mjs finds pulls by
       matching a literal argument against the accessor name; hiding the key behind
       a variable would remove this tool from the static audit without failing it. */
    const take = (res, field, xform) => {
      if (res.value == null || isNaN(res.value)) return false;
      next[field] = xform(res.value);
      seen[field] = { value: next[field], src: res.sourceTool || "", origin: res.railOrigin || null };
      if (res.sourceTool && res.sourceTool !== TOOL_ID) { got[field] = true; srcOf[field] = res.sourceTool; }
      return true;
    };
    if (!take((getExternalWithSource("monthlyContacts", TOOL_ID) || NO_RAIL), "monthlyContacts", (v) => Math.round(v)))
      take((getExternalWithSource("annualContacts", TOOL_ID) || NO_RAIL), "monthlyContacts", (v) => Math.round(v / 12));
    take((getExternalWithSource("fcr", TOOL_ID) || NO_RAIL), "fcrRate", (v) => (v <= 1 ? Math.round(v * 100) : Math.round(v)));
    take((getExternalWithSource("costPerContact", TOOL_ID) || NO_RAIL), "loadedCPC", (v) => +v.toFixed(2));
    take((getExternalWithSource("marginalPerContact", TOOL_ID) || NO_RAIL), "marginalCPC", (v) => +v.toFixed(2));
    take((getExternalWithSource("agentHourly", TOOL_ID) || NO_RAIL), "agentHourly", (v) => v);
    if (Object.keys(next).length) setD(prev => ({ ...prev, ...next }));
    if (Object.keys(got).length) { setPulled(got); setPullSources([...new Set(Object.values(srcOf))]); }
    /* Captured once, at mount, BEFORE this tool publishes, with the tool that wrote
       each value. gradeCPC reads it field by field: a restored own value and a rail
       value with no origin grade both grade Directional. */
    setPre(seen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const r = compute(d, mech);
  /* mech is what the page or a scenario link supplied. mechKey is what compute
     resolved and ran. Everything below reads mechKey; only the selector's setter,
     the effect dependencies and the shareable scenario keep the entered value. */
  const mechKey = r.mechKey;
  const analyst = buildAnalystRead(d, r, mechKey);

  /* railOrigin is null because the rail carries no origin grade yet. See gradeCPC. */
  const graded = gradeCPC({ d, r, pre, railOrigin: null });
  const { gradeObj, confidence, gradeWhy } = graded;

  useEffect(() => {
    const published = normalizeForPublish({
      costPerContact: +r.loaded.toFixed(2), costPerResolution: +r.cprLoaded.toFixed(2),
      contactsPerResolution: +r.C.toFixed(2), repeatDemandSharePct: +(r.repeatShare * 100).toFixed(1), fcr: r.fcrPct / 100,
      repeatContactsMonthly: r.repeatContacts, repeatDemandBurdenMonthly: Math.round(r.burden), fteBurden: +r.fteBurden.toFixed(1),
      capacityAction: mechKey, capacityRealizationPct: Math.round(r.mf * 100),
    }, { sourceTool: "cost-per-contact" }).clean;
    publishToolResult("cost-per-contact", published, originsFor(gradeObj, published));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d, mech]);

  /* Exact input set the scenario link carries. */
  const scenario = { d, mech };

  const cprColor = r.gapPct > GAP_RED ? RED : r.gapPct > GAP_AMBER ? AMBER : GREEN;
  const tierColor = (t) => t === "Operational" ? GREEN : t === "Root-cause work" ? AMBER : RED;
  const volLabel = d.denominator === "issues" ? "Monthly resolved issues" : "Monthly handled contacts";
  const stamp = methodStamp(TOOL_ID);
  const { how, voidReason } = resultHow(gradeObj);
  const hair = alpha(HOUSE.mist, LINE.hair), soft = alpha(HOUSE.mist, LINE.soft);
  const card = { background: HOUSE.navy, border: `1px solid ${hair}`, borderRadius: RADIUS.card, padding: 20 };
  const kicker = { fontSize: 12, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: HOUSE.muted };
  const h2 = { fontSize: 20, fontWeight: 600, lineHeight: 1.3, color: HOUSE.mist, margin: "0 0 6px" };
  const body = { fontSize: 15, lineHeight: 1.6, color: HOUSE.body, margin: 0 };
  const small = { fontSize: 13, lineHeight: 1.5, color: HOUSE.muted };
  const fig = { fontSize: 28, fontWeight: 700, lineHeight: 1.1, color: HOUSE.mist, fontVariantNumeric: "tabular-nums" };
  const grid = (min) => ({ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))`, gap: 14 });
  const seg = (active) => ({ flex: 1, minHeight: TOUCH, fontSize: 14, fontWeight: 600, padding: "0 12px", borderRadius: RADIUS.chip, border: "none", cursor: "pointer",
    background: active ? PILLARS.diagnostics.fill : "transparent", color: active ? onFill(PILLARS.diagnostics.fill) : HOUSE.body });
  const mathRow = (label, val) => <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: `1px solid ${hair}`, fontSize: 13 }}><span style={{ color: HOUSE.body, fontFamily: FONT_MONO }}>{label}</span><span style={{ color: HOUSE.mist, fontWeight: 600, textAlign: "right" }}>{val}</span></div>;
  const row = (k, v, sub) => <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: `1px solid ${hair}` }}><span style={small}>{k}{sub && <span style={{ display: "block" }}>{sub}</span>}</span><span style={{ fontSize: 16, fontWeight: 600, color: HOUSE.mist, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{v}</span></div>;

  const result = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Result label="Cost per resolution" value={r.cprLoaded} format={money} change={`${money(r.loaded)} per contact, ${r.C.toFixed(2)} contacts per issue`} how={how} voidReason={voidReason} />
      {!voidReason && <p style={{ ...small, margin: 0 }}>{String(gradeWhy).replace(/^bound by [^.]*\.\s*/i, "")}</p>}
      {!voidReason && (
        <div style={card}>
          <span style={kicker}>The four numbers</span>
          <div style={{ marginTop: 8 }}>
            {row("Cost per contact, fully loaded", money(r.loaded))}
            {row("Cost per resolution", money(r.cprLoaded), `${r.C.toFixed(2)} contacts per issue, ${r.gapPct.toFixed(0)}% above`)}
            {row("Repeat demand share", (r.repeatShare * 100).toFixed(0) + "%", `${r.repeatContacts.toLocaleString()} repeats a month`)}
            {row("Repeat-demand burden", fmtK(r.burden) + "/mo", `Marginal ceiling, ${r.fteBurden.toFixed(1)} FTE`)}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <ToolFrame toolId={TOOL_ID} section="Cost + Economics" name="Cost per Contact" title="What does a contact cost, and what does a resolution cost?"
      lede="A $7 call that takes three contacts to resolve is a $21 resolution. This tool separates the cost of handling a contact from the cost of resolving an issue, and keeps four figures apart: the cost you report, the repeat-demand burden, the capacity an FCR gain releases, and the savings you can realize."
      method={stamp ? { version: stamp.version, date: stamp.text.replace(/^Method [^,]+, published /, ""), href: stamp.href } : null}
      result={result} pinned={voidReason ? null : { label: "Cost per resolution", value: money(r.cprLoaded) }}>
      <style>{`${FONT_IMPORT_CSS}.cpc-sel option{background:${HOUSE.navy};color:${HOUSE.mist}}`}</style>

      {Object.keys(pulled).length > 0 && (
        <p style={{ ...card, ...body, padding: "12px 16px" }}>Prefilled {Object.keys(pulled).length} value{Object.keys(pulled).length > 1 ? "s" : ""} from {pullSources.length ? pullSources.join(", ") : "a previous tool"}. You can edit every field.</p>
      )}

      <fieldset style={{ ...card, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
        <legend style={{ ...kicker, padding: "0 6px" }}>Question 1 of 3 · Volume and resolution</legend>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={small}>Volume is</span>
          <div role="group" aria-label="Volume basis" style={{ display: "flex", gap: 4, padding: 4, borderRadius: RADIUS.field, border: `1px solid ${soft}`, minWidth: 260 }}>
            <button type="button" aria-pressed={d.denominator === "handled"} onClick={() => set("denominator", "handled")} style={seg(d.denominator === "handled")}>Handled contacts</button>
            <button type="button" aria-pressed={d.denominator === "issues"} onClick={() => set("denominator", "issues")} style={seg(d.denominator === "issues")}>Resolved issues</button>
          </div>
        </div>
        <div style={grid(190)}>
          <NumField tone="dark" label={volLabel} value={d.monthlyContacts} onChange={v => set("monthlyContacts", v)} step={1000} min={0} pulled={pulled.monthlyContacts} />
          <NumField tone="dark" label="FCR rate" value={d.fcrRate} onChange={v => set("fcrRate", v)} suffix="%" step={1} min={0} max={100} pulled={pulled.fcrRate} hint="First contact resolution: the share of issues solved on the first contact" />
          <NumField tone="dark" label="Non-FCR contacts to resolution (M)" value={d.contactsPerUnresolved} onChange={v => set("contactsPerUnresolved", v)} step={0.1} min={1} hint="Total contacts an issue takes when the first contact does not resolve it, counting the first. One contact plus two follow-ups is 3.0" />
        </div>
      </fieldset>

      <fieldset style={{ ...card, margin: 0, display: "flex", flexDirection: "column", gap: 16 }}>
        <legend style={{ ...kicker, padding: "0 6px" }}>Question 2 of 3 · Cost basis</legend>
        <p style={{ ...small, margin: 0 }}>Filled from your TCO (total cost of ownership) run when you have one.</p>
        <div style={grid(160)}>
          <NumField tone="dark" label="Loaded cost per contact" value={d.loadedCPC} onChange={v => set("loadedCPC", v)} prefix="$" step={0.25} min={0} pulled={pulled.loadedCPC} hint="Full cost of one contact: labor, benefits, platform and facilities" />
          <NumField tone="dark" label="Marginal cost per contact" value={d.marginalCPC} onChange={v => set("marginalCPC", v)} prefix="$" step={0.25} min={0} pulled={pulled.marginalCPC} hint="The variable cost that goes away when one contact does" />
          <NumField tone="dark" label="Agent hourly" value={d.agentHourly} onChange={v => set("agentHourly", v)} prefix="$" suffix="/hr" step={0.5} min={0} pulled={pulled.agentHourly} hint="Used for the channel costs below" />
          <NumField tone="dark" label="Productive hours per FTE a month" value={d.productiveHoursPerFTE} onChange={v => set("productiveHoursPerFTE", v)} suffix="hrs" step={5} min={1} hint={`Hours a full-time agent spends handling work after breaks, training and absence (about ${BASE.productiveHoursPerFTE})`} />
        </div>
      </fieldset>

      <fieldset style={{ ...card, margin: 0, display: "flex", flexDirection: "column", gap: 12, borderColor: mechKey === "none" ? HOUSE.electric : hair }}>
        <legend style={{ ...kicker, padding: "0 6px" }}>Question 3 of 3 · Capacity action</legend>
        <p style={{ ...body, margin: 0 }}>What you will do with the agent time an FCR gain frees up. Freed time turns into money only through one of these actions. {MECH[mechKey].note}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <select aria-label="Realization mechanism" value={mechKey} className="cpc-sel" onChange={e => setMech(e.target.value)} style={{ minHeight: TOUCH, fontSize: 15, fontWeight: 600, padding: "0 12px", borderRadius: RADIUS.field, border: `1px solid ${alpha(HOUSE.mist, LINE.firm)}`, background: HOUSE.navy, color: HOUSE.mist, cursor: "pointer" }}>
            {MECH_ORDER.map(k => <option key={k} value={k}>{MECH[k].label}{k !== "none" ? `  (${Math.round(MECH[k].f * 100)}%)` : ""}</option>)}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 8, minHeight: TOUCH, cursor: "pointer" }}>
            <input type="checkbox" checked={d.validated} onChange={e => set("validated", e.target.checked)} style={{ width: 18, height: 18, accentColor: HOUSE.electric }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: HOUSE.mist }}>FCR and M come from my reporting data</span>
          </label>
        </div>
      </fieldset>

      <p style={{ ...card, ...body, padding: "14px 16px" }}>
        The <strong style={{ color: HOUSE.mist }}>burden</strong> is the marginal cost of all repeat demand. Read it as a ceiling: FCR never reaches 100%, so you will never release all of it. Below are the capacity a realistic FCR gain releases and the part your capacity action can turn into savings.
      </p>

      <section aria-label="Integrity checks" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h2 style={h2}>Integrity checks</h2>
        {r.flags.length === 0 && <Finding level="clear" title="Integrity checks passed">Marginal cost sits below loaded, the channel mix totals 100%, M fits the FCR you entered and a capacity action is chosen. The figures agree with each other.</Finding>}
        {r.flags.map((f, i) => isNoActionFlag(f)
          ? <Finding key={i} level="unknown" title="Your choice is still open">{f.t}</Finding>
          : f.sev === "warn"
          ? <Finding key={i} level="high" title="Check this input">{f.t}</Finding>
          : <p key={i} style={{ ...card, ...body, padding: "12px 16px" }}>{f.t}</p>)}
      </section>

      <section aria-label="FCR improvement" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={h2}>What an FCR gain releases, and what you can realize</h2>
        <p style={body}>Released is the agent time the gain frees, valued at marginal cost ({money(r.marg)} a contact). Realizable is the part your capacity action turns into savings ({MECH[mechKey].label}{mechKey !== "none" ? `, ${Math.round(r.mf * 100)}%` : ""}).</p>
        <div style={grid(180)}>
          {r.dividend.map((s, i) => (
            <div key={i} style={card}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, marginBottom: 10 }}>
                <span style={{ ...kicker, color: HOUSE.mist, whiteSpace: "nowrap" }}>FCR +{s.p} to {s.newFCR.toFixed(0)}%</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: HOUSE.body, border: `1px solid ${soft}`, padding: "2px 8px", borderRadius: RADIUS.chip, whiteSpace: "nowrap" }}>{s.tier}</span>
              </div>
              <div style={small}>Released</div>
              <div style={{ ...fig, fontSize: 22, color: HOUSE.body }}>{fmtK(s.released * 12)}/yr</div>
              <div style={{ ...small, marginTop: 8 }}>Realizable ({Math.round(r.mf * 100)}%)</div>
              <div style={fig}>{fmtK(s.realizable * 12)}/yr</div>
              <div style={{ ...small, marginTop: 6 }}>{Math.round(s.avoided).toLocaleString()} contacts avoided a month · {s.fte.toFixed(1)} FTE</div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Channel handle economics" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h2 style={h2}>Channel handle economics</h2>
        <p style={body}>Agent labor only. Chat costs less per contact than voice because an agent can handle several chats at once (concurrency). Blended across your mix: <strong style={{ color: HOUSE.mist }}>{money(r.blendedHandle)}</strong> a contact. An average hides complexity, so move only simple contacts that the new channel can resolve. Model a move in <a href="/tools/channel-shift" style={{ color: PILLARS.diagnostics.onDark, fontWeight: 600 }}>Channel Shift</a>.</p>
        <div style={grid(180)}>
          {r.channels.map((ch, i) => (
            <div key={i} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: HOUSE.mist }}>{ch.name}</span>
                <span style={small}>{ch.pct}% of volume</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div><div style={small}>AHT (average handle time)</div><div style={{ fontSize: 16, fontWeight: 600, color: HOUSE.mist }}>{ch.aht}m</div></div>
                <div><div style={small}>Per contact at {ch.conc} at once</div><div style={{ fontSize: 16, fontWeight: 600, color: HOUSE.mist }}>{ch.effAHT.toFixed(1)}m</div></div>
                <div><div style={small}>Handle cost</div><div style={{ fontSize: 16, fontWeight: 600, color: HOUSE.mist }}>{money(ch.handleCPC)}</div></div>
                <div><div style={small}>Handle spend</div><div style={{ fontSize: 16, fontWeight: 600, color: HOUSE.mist }}>{fmtK(ch.spend)}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="What it means" style={{ ...card, borderLeft: `3px solid ${PILLARS.diagnostics.fill}` }}>
        <h2 style={h2}>What it means</h2>
        <span style={{ ...small, display: "block", marginBottom: 8 }}>The cost you report, the capacity you release and the savings you realize are separate figures.</span>
        {analyst.map((t, i) => <p key={i} style={{ ...body, margin: i ? "8px 0 0" : 0 }}>{t}</p>)}
      </section>

      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <button type="button" aria-expanded={showMath} onClick={() => setShowMath(s => !s)} style={{ width: "100%", minHeight: TOUCH, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", background: "transparent", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 600, color: HOUSE.mist, fontFamily: FONT }}>
          <span>Show the math: every formula and every value</span><span style={{ color: HOUSE.muted }}>{showMath ? "−" : "+"}</span>
        </button>
        {showMath && (
          <div style={{ padding: "4px 20px 16px" }}>
            {mathRow("Contacts per resolution  C = FCR + (1−FCR) × M", `${(r.C - (1 - n(d.fcrRate) / 100) * n(d.contactsPerUnresolved)).toFixed(2)} + ${(1 - n(d.fcrRate) / 100).toFixed(2)}×${n(d.contactsPerUnresolved)} = ${r.C.toFixed(3)}`)}
            {mathRow(`Denominator = ${d.denominator}`, d.denominator === "issues" ? `handled = issues × C = ${r.handled.toLocaleString()}` : `resolutions = contacts / C = ${r.resolutions.toLocaleString()}`)}
            {mathRow("Repeat contacts = handled − resolutions", `${r.handled.toLocaleString()} − ${r.resolutions.toLocaleString()} = ${r.repeatContacts.toLocaleString()}`)}
            {mathRow("Repeat demand share = repeats / handled", `${(r.repeatShare * 100).toFixed(1)}%`)}
            {mathRow("Cost per resolution = loaded × C", `${money(r.loaded)} × ${r.C.toFixed(3)} = ${money(r.cprLoaded)}`)}
            {mathRow("Repeat-demand burden = repeats × marginal", `${r.repeatContacts.toLocaleString()} × ${money(r.marg)} = ${fmtK(r.burden)}/mo (ceiling)`)}
            {mathRow(`Released (+${QUOTED_STEP} FCR) = issues × (C − C₁) × marginal`, `${fmtK(quoted(r).released)}/mo`)}
            {mathRow(`Realizable = released × ${Math.round(r.mf * 100)}% (${MECH[mechKey].label})`, `${fmtK(quoted(r).realizable)}/mo`)}
            {mathRow("FTE burden = repeats × blended eff. min / 60 / prod hrs", `${r.fteBurden.toFixed(1)}`)}
            <p style={{ ...small, marginTop: 12 }}>M is the total number of contacts an unresolved issue takes, counting the first. Cost per contact and cost per resolution use the loaded cost. The burden and the released figures use the marginal cost. Realizable applies the capacity action. FTE measures agent time as full-time equivalents; it describes capacity, and cutting heads is a separate decision. Every formula, constant and a worked example are in the <a href="/methodology/cost-per-contact" style={{ color: PILLARS.diagnostics.onDark, fontWeight: 600, textDecoration: "underline" }}>published method</a>.</p>
          </div>
        )}
      </div>

      {/* The vertical planning ranges (internal heuristics for three industries, with an "average FCR" that read as a
          measured figure) were retired on 28 Sep 2026 (TB). Published figures by industry, where any exist, live on the
          industry pages with their sources. */}
      <section aria-label="Compare with your industry" style={card}>
        <h2 style={h2}>How does yours compare?</h2>
        <p style={{ ...body, margin: 0 }}>There is no reliable public benchmark for cost per contact by industry: published figures mix channels, cost definitions and company sizes. The industry pages show the figures that are published, such as first contact resolution, each with its source, and say where none exists.</p>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginTop: 8 }}>
          <a href="/industries" style={{ display: "inline-flex", alignItems: "center", minHeight: TOUCH, fontSize: 14, fontWeight: 600, color: PILLARS.diagnostics.onDark }}>See your industry</a>
          {r.fcrPct < FCR_LEAK_LINK && <a href="/tools/fcr-leakage" style={{ display: "inline-flex", alignItems: "center", minHeight: TOUCH, fontSize: 14, fontWeight: 600, color: PILLARS.diagnostics.onDark }}>Run FCR Leakage to find why resolution fails</a>}
        </div>
      </section>

      {/* The report is paper (Brand Guide section 13): the actions sit on a paper panel until ReportActions moves onto the house in a later batch. */}
      <div style={{ background: HOUSE.paper, color: HOUSE.paperInk, borderRadius: RADIUS.card, padding: "8px 20px 20px" }}>
          <ReportActions
            toolId={TOOL_ID}
            toolName="Cost per Contact / Resolution"
            subtitle={`Handle vs resolution cost · ${isVoid(gradeObj) ? "EXPORT VOID, integrity invariant failed" : `${confidence}, bound by ${gradeObj.boundBy}`} · action: ${MECH[mechKey].label}`}
            routePath={ROUTE}
            state={scenario}
            defaults={DEFAULTS}
            grades={gradeObj}
            summary={[
              { label: "Cost per contact", value: money(r.loaded) },
              { label: "Cost per resolution", value: money(r.cprLoaded) },
              { label: "Repeat demand share", value: (r.repeatShare * 100).toFixed(0) + "%" },
              { label: "Repeat burden", value: fmtK(r.burden) + "/mo" },
            ]}
            signals={{
              /* Severity is the share of handled contacts that are repeats, the
                 exact quantity this tool exists to expose. The denominator is
                 handled volume, so the ratio is bounded by construction and
                 needs no anchor. It spans the whole scale on real inputs: 1% of
                 contacts at 95% FCR and M 1.2, 28% at the shipped defaults, 50%
                 at 50% FCR and M 3, 80% at 20% FCR and M 6.

                 The 0.25 boundary is not chosen here. The engine already raises
                 a flag above a 25% repeat share saying this is a resolution
                 problem rather than a price problem, and 0.25 is exactly where
                 the shared bucket turns moderate, so the published band and the
                 flag on the page agree by construction rather than by luck.

                 With no volume nothing was measured. repeatShare would compute
                 to a clean zero and publish "none", which asserts a healthy
                 center on an empty model, so the key is omitted instead. */
              ...(r.handled > 0 ? { severity: severityBucket(r.repeatShare) } : {}),
              capacity_action: MECH[mechKey].label,
              fcr_rate: r.fcrPct + "%",
              ...(r.fcrPct !== n(d.fcrRate) ? { fcr_rate_entered: n(d.fcrRate) + "%" } : {}),
              inputs_corrected: r.guards.length,
              volume_basis: d.denominator,
              cost_validated: d.validated ? "yes" : "no",
              integrity_flags: r.flags.length,
              from_scenario_link: fromLink ? "yes" : "no",
            }}
            sections={[
              { title: "Cost Metrics", type: "metrics", items: [
                { label: "Cost per Contact", value: money(r.loaded), color: ELECTRIC, sub: "loaded" },
                { label: "Cost per Resolution", value: money(r.cprLoaded), color: cprColor, sub: `${r.C.toFixed(2)} contacts/issue` },
                { label: "Repeat Demand Share", value: (r.repeatShare * 100).toFixed(0) + "%", color: AMBER, sub: `${r.repeatContacts.toLocaleString()}/mo` },
                { label: "Repeat-Demand Burden", value: fmtK(r.burden) + "/mo", color: RED, sub: `ceiling · ${r.fteBurden.toFixed(1)} FTE` },
              ]},
              { title: "Three Value Layers, kept apart", type: "table", rows: [
                ["Repeat-demand burden (the ceiling, at marginal cost)", fmtK(r.burden) + "/mo"],
                [`Capacity released by FCR +${QUOTED_STEP} points (at marginal cost)`, fmtK(quoted(r).released) + "/mo"],
                [`Realizable this cycle (${MECH[mechKey].label}, ${Math.round(r.mf * 100)}%)`, fmtK(quoted(r).realizable) + "/mo"],
                ["Burden at loaded cost (accounting view only, no saving)", fmtK(r.burdenLoaded) + "/mo"],
              ]},
              { title: "FCR Dividend: Released → Realizable", type: "table", rows: r.dividend.map(s => ["FCR +" + s.p + " → " + s.newFCR.toFixed(0) + "% (" + s.tier + ")", "released " + fmtK(s.released * 12) + "/yr · realizable " + fmtK(s.realizable * 12) + "/yr"]) },
              ...(r.guards.length ? [{ title: "⚠ Inputs Corrected Before Calculation", type: "findings", items: r.guards.map(guardLine) }] : []),
              ...(r.flags.length ? [{ title: "Integrity Checks", type: "findings", items: r.flags.map(f => f.t) }] : []),
              { title: "Analyst Read", type: "findings", items: analyst },
              { title: "Methodology", type: "text", content: `A resolved issue averages C = FCR + (1 - FCR) x M contacts, where FCR is first contact resolution and M is the total number of contacts an issue takes when the first contact does not resolve it, counting the first. Volume basis: ${d.denominator === "issues" ? "resolved issues (handled contacts derived as issues x C)" : "handled contacts (resolutions derived as contacts / C)"}. Cost per resolution = loaded x C. Cost per contact and cost per resolution are fully loaded, the right basis for unit costs. The repeat-demand burden is the marginal cost of all repeat contacts. It is a baseline ceiling, and it counts as neither a saving nor capacity created. Capacity released is the marginal value of the contacts a specific FCR improvement avoids. Realizable applies the selected capacity action (${MECH[mechKey].label}, ${Math.round(r.mf * 100)}%), because freed capacity becomes cash only when it is taken as less overtime, hiring avoided, vendor reduction or headcount. The full method, with every formula, constant and a worked example, is published at contactcentercx.com/methodology/cost-per-contact. Report grade: ${confidence}, ${gradeWhy}${r.guards.length ? ` INPUTS CORRECTED: ${r.guards.map(g => `${g.label} entered ${guardVal(g, "entered")}, computed at ${guardVal(g, "used")}`).join("; ")}. Every figure above was computed on the corrected values.` : ""}${r.margDerived ? ` Marginal cost was not entered and was derived at ${Math.round(MARG_SHARE * 100)}% of loaded (${money(r.marg)}).` : ""}` },
            ]}
          />
      </div>
    </ToolFrame>
  );
}

/* The scenario-link defaults, exported for the live checker and the visual audit. */
export { DEFAULTS };
