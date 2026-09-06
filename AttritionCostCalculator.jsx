import { useState, useEffect } from "react";
import ReportActions from "./ReportActions";
import { COLORS } from "./src/lib/benchmarks";
import { publishToolResult, getPrimitiveWithSource } from "./src/lib/toolData";
import { normalizeForPublish } from "./src/lib/metrics";
import { MECH, MECH_ORDER } from "./src/lib/mech";
import NumField from "./src/lib/NumField";
import InfoDot from "./src/lib/InfoDot";
import { TYPE, FONT, FONT_IMPORT_CSS, NUM, t } from "./src/lib/type";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";

const NAVY = COLORS.navy, ELECTRIC = COLORS.electric, GREEN = COLORS.green, AMBER = COLORS.amber, RED = COLORS.red, MUTED = COLORS.muted;
const DEEP = "#061325", LIGHT = "#00AAFF", WARM = "#F8FAFB", SLATE = "#3A4F6A", BORDER = "#D8E3ED";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };

const DEFS = {
  benefitsLoad: "The percentage added to base wage for employer-paid benefits, payroll taxes, and overhead. The tool loads wage-paid time at this rate because you really do pay salary plus benefits while a new hire trains or ramps, not just base wage.",
  backfill: "The share of departures you actually replace. Replacement cost only exists for seats you refill: no hire means no recruiting, training, ramp, or coverage spend. Backfill therefore scales the entire replacement cycle. Seats you do not refill are a capacity decision, not a replacement cost, and are handled separately below.",
  unbackfill: "What happens to the seats you do not refill. Intended downsizing means the capacity reduction is deliberate, so it is not a turnover cost. Forced under-staffing means you are losing output you still need; that lost capacity is real but is valued in Staffing and Occupancy, not invented here, so this tool routes it rather than guessing a number.",
  marginalCash: "Cash out the door is spend that genuinely disappears when a backfilled departure is avoided: recruiting, training wages, sign-on, and overtime premium. It is credited at 100 percent in savings because you simply stop spending it.",
  capacity: "Capacity is recovered agent and supervisor time, not cash. It only becomes money if you act on it, so it is gated by a realization mechanism. With no mechanism committed, recovered capacity is worth zero in hard savings.",
  denominator: "Attrition here is separations divided by average headcount over the year. Define it before you trust it: voluntary only or total, regrettable or all, and a rolling twelve-month actual rather than a bad month annualized. Annualizing one rough month is the most common way centers accidentally inflate their own rate.",
  early: "The share of new hires who wash out before reaching productive output, usually inside the first ninety days. Their recruiting and training cash is mostly sunk with near-zero return, which makes early attrition the highest-waste and most recoverable segment. It is measured against hires, not all departures, so it can never exceed the replacement cash it is drawn from.",
  nesting: "Nesting is supervised live production right after classroom training, where the new hire handles real contacts at reduced output. The loss is the unproductive share of fully-paid time during that period.",
  ramp: "Ramp is the post-nesting stretch before a new hire reaches tenured-agent parity on AHT, QA, and FCR, not merely the point they finish training. Default to fully-productive parity, which is months not days, and value only the shortfall against full output. Ramp starts after nesting so the two never overlap.",
  vacancyMode: "Incremental to staffed plan charges only the overtime premium, because the empty seat's base wage is not being paid. Gross coverage spend charges the full overtime cost and should be used only when the departed agent's stopped payroll is credited somewhere else, or you will double count.",
  mech: "How recovered capacity converts to money. Not selected means you keep the slack and realize zero. Avoid hiring is the most common honest lever and the defensible default. Headcount reduction realizes the most but is the hardest commitment to make. This table is the shared platform definition, so the same mechanism means the same thing in every tool.",
  confidence: "Confidence is split into three named axes. Evidence asks where the inputs came from: estimated, HR data, or finance-confirmed. Realization asks whether the modelled benefit converts to cash, read from the shared capacity-action table. Completeness asks whether the model is whole and internally consistent: inputs inside possible ranges, cost basis inside the frontline band, and no value routed out of the model. The headline grade is the weakest of the three, and the rationale always names which axis is holding it there.",
  sensitivity: "The all-in figure multiplies six uncertain inputs, and multiplying uncertainty compounds it, so the true cost is a range, not a point. The planning band tightens as you confirm inputs: about plus or minus 25 percent on estimates, 15 percent on HR data, 10 percent on finance-confirmed figures. This exists for CFO alignment: a finance team trusts a defensible range far more than a single exact number, and a lone precise figure invites a vendor or budget owner to attack one input and dismiss the whole model. The band is how the number survives scrutiny.",
  costToAchieve: "Realizable savings are shown gross, before the money you spend to actually cut attrition: pay adjustments, coaching, scheduling tools, better hiring. This exists for CFO alignment because no CFO will book a savings number without the cost to capture it. Enter the annual cost per point of reduction and the tool nets it out and shows the return, turning a scary gross figure into a fundable business case. Real programs cost more per point as you push lower (diminishing returns), so treat deep cuts as the optimistic end.",
};

/* @engine-start
   Everything between these markers is the Attrition Cost engine and the only
   things it closes over. attrition.test.mjs and attrition.report.mjs slice this
   exact region out of this exact file at runtime and evaluate it, so the tested
   engine and the shipped engine cannot drift apart.

   Before this extraction roughly 110 lines of arithmetic sat inline in the
   component body and closed over a twenty-six field state object, so it could not
   be evaluated outside React at all and had never been tested. The move was proven
   behaviour-neutral against a pre-image lifted verbatim from the shipped file
   across thirty scenarios, before any fix landed.

   The local MECH_OPTS table is gone. It carried the six realization factors as a
   private copy of src/lib/mech.js and carried no credit class at all, so this tool
   inferred realization from numeric thresholds instead of reading the shared
   taxonomy. The factors happened to agree. Nothing enforced that they keep
   agreeing, and a shared doctrine reimplemented locally is a divergence waiting
   for its first edit. COLORS is injected from the real benchmarks.js. */

const n = (v) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };
const fmtK = (v) => { const x = n(v), s = x < 0 ? "-" : ""; const a = Math.abs(x); return s + (a >= 1000000 ? "$" + (a / 1000000).toFixed(2) + "M" : a >= 1000 ? "$" + (a / 1000).toFixed(0) + "K" : "$" + Math.round(a)); };
const fmt$ = (v) => { const x = n(v), s = x < 0 ? "-" : ""; return s + "$" + Math.round(Math.abs(x)).toLocaleString(); };

/* Guard and disclose, ported from Channel Shift unchanged.

   This tool had five bare Math.max calls in 561 lines and none of them recorded
   what they changed. Everything else was unclamped, and a scenario link decodes
   straight into the arithmetic. A ramp productivity of 400 percent produced a
   negative $34,620 capacity cost, a negative $23,909 all-in and a cost basis of
   minus 63 percent of salary while raising zero flags, because every implausibility
   check only looked upward. A mechanism value of 900 credited freed capacity at 900
   percent, inflated realizable value nine-fold past the maximum legitimate figure,
   exported Finance-grade on both axes, and printed the mechanism name as "None" in
   the same document. Clamping alone is not the fix: a value the engine had to
   change is a value the report must disclose, or the document shows a number the
   engine never ran. `used` carries what was computed, `entered` what was asked. */
const guardVal = (g, which) => g.unit === "$" ? "$" + g[which] : `${g[which]}${g.unit}`;

const GRADE_RANK = { "Directional": 0, "Planning-grade": 1, "Finance-grade": 2 };
const AXES = ["evidence", "realization", "completeness"];

/* Realization reads the shared credit class, never a numeric threshold.
   none and capacity are planning value; finance is creditable; cash is bookable. */
const CRED_GRADE = { none: "Directional", capacity: "Directional", finance: "Planning-grade", cash: "Finance-grade" };

const MECH_OPTS = MECH_ORDER.map((k) => ({ v: k, label: MECH[k].label }));
/* Scenario links published before this tool imported mech.js encoded the factor as
   an integer. Map them rather than silently dropping the reader to zero. */
const LEGACY_MECH = { 0: "none", 25: "growth", 60: "overtime", 75: "hiring", 90: "vendor", 100: "headcount" };

const BACKFILL_OPTS = [
  { v: 100, label: "Replace all departures" },
  { v: 75, label: "Replace most (75%)" },
  { v: 50, label: "Replace some (50%)" },
  { v: 0, label: "Do not backfill" },
];
const INTENT_OPTS = [
  { v: "forced", label: "Forced under-staffing (lost capacity)" },
  { v: "downsizing", label: "Intended downsizing (deliberate)" },
];
const VACANCY_OPTS = [
  { v: "incremental", label: "Incremental (OT premium)" },
  { v: "gross", label: "Gross coverage spend" },
];
const EVIDENCE_OPTS = [
  { v: "estimate", label: "Estimated / defaults" },
  { v: "hrdata", label: "From our HR data" },
  { v: "finance", label: "Finance-confirmed figures" },
];
const EVIDENCE_GRADE = { estimate: "Directional", hrdata: "Planning-grade", finance: "Finance-grade" };

/* Scenario contract. Module scope so state initializers and the URL encoder read
   from one definition, and the identity is stable across renders. */
const TOOL_ID = "attrition-cost";
const ROUTE = "/tools/attrition-cost";
const clone = (o) => JSON.parse(JSON.stringify(o));
const BASE = {
  agents: 200, attritionRate: 35, avgSalary: 38000, benefitsLoadPct: 28,
  backfillRate: 100, unbackfillIntent: "forced", earlyWashoutRate: 25,
  recruitingCost: 2500, screeningHours: 8, hrLoadedRate: 48,
  trainingWeeks: 6, trainerLoadedRate: 45, classSize: 12, signOnBonus: 0,
  nestingWeeks: 4, nestingProductivity: 50,
  rampMonths: 3, rampProductivity: 75,
  supervisorHoursPerNew: 10, supLoadedRate: 55,
  overtimePremium: 50, vacancyDays: 30, vacancyCoverageFraction: 60, vacancyMode: "incremental",
  mech: "hiring", evidence: "estimate", costPerPoint: 0,
};
const DEFAULTS = { d: BASE };

export function compute(d) {
  const guards = [];
  const guard = (label, raw, min, max, unit) => {
    const v = n(raw);
    const c = Math.max(min, max === null ? v : Math.min(max, v));
    if (c !== v) guards.push({ label, entered: v, used: c, unit: unit || "" });
    return c;
  };
  const pick = (label, raw, table, fallback) => {
    if (Object.prototype.hasOwnProperty.call(table, raw)) return raw;
    guards.push({ label, entered: String(raw), used: fallback, unit: "" });
    return fallback;
  };

  /* Mechanism is the highest-leverage input in the file: it multiplies every
     capacity credit and it sets the realization axis. An out-of-range value used to
     pass straight into the arithmetic as a percentage. */
  let mechKey = d.mech;
  if (!MECH[mechKey]) {
    const legacy = LEGACY_MECH[n(d.mech)];
    if (legacy && String(n(d.mech)) === String(d.mech)) {
      guards.push({ label: "Capacity mechanism (legacy numeric link)", entered: String(d.mech), used: legacy, unit: "" });
      mechKey = legacy;
    } else {
      guards.push({ label: "Capacity mechanism", entered: String(d.mech), used: "none", unit: "" });
      mechKey = "none";
    }
  }
  const mech = MECH[mechKey].f;
  const cred = MECH[mechKey].cred;
  const mechName = MECH[mechKey].label;
  const mechLabel = mechName.toLowerCase();

  const vacancyMode = pick("Vacancy costing mode", d.vacancyMode, { incremental: 1, gross: 1 }, "incremental");
  const unbackfillIntent = pick("Un-backfilled seat treatment", d.unbackfillIntent, { forced: 1, downsizing: 1 }, "forced");
  const evidence = pick("Input basis", d.evidence, EVIDENCE_GRADE, "estimate");
  const downsizing = unbackfillIntent === "downsizing";

  const agents = guard("Total agents", d.agents, 0, null, "");
  /* Separations over average headcount genuinely exceeds 100 percent in high-churn
     centers, so the ceiling sits where the figure stops being a rate and starts
     being a data-entry error, not at 100. */
  const attritionRate = guard("Annual attrition", d.attritionRate, 0, 300, "%");
  const avgSalary = guard("Avg agent salary", d.avgSalary, 0, null, "$");
  const benefitsLoadPct = guard("Benefits + overhead", d.benefitsLoadPct, 0, null, "%");
  const backfillRate = guard("Backfill basis", d.backfillRate, 0, 100, "%");
  const earlyWashoutRate = guard("Early washout", d.earlyWashoutRate, 0, 100, "%");

  const departures = Math.round(agents * (attritionRate / 100));
  const bf = backfillRate / 100;
  const wageHourly = avgSalary / 2080;
  const loadedHourly = wageHourly * (1 + benefitsLoadPct / 100);

  // ---- PER REPLACED DEPARTURE (the replacement cycle) ----
  const recruiting = guard("Recruiting cost", d.recruitingCost, 0, null, "$")
    + guard("Screening hours", d.screeningHours, 0, null, "hrs") * guard("HR loaded rate", d.hrLoadedRate, 0, null, "$");
  const trainingWeeks = guard("Training duration", d.trainingWeeks, 0, null, "wks");
  const trDays = trainingWeeks * 5;
  /* Class size divides, so it cannot be zero. The shipped Math.max(1, x) silently
     substituted 1 and tripled trainer cost with nothing recorded anywhere. */
  const classSize = guard("Class size", d.classSize, 1, null, "");
  const training = trDays * 8 * loadedHourly + trDays * 8 * guard("Trainer loaded rate", d.trainerLoadedRate, 0, null, "$") / classSize;
  const signOn = guard("Sign-on bonus", d.signOnBonus, 0, null, "$");
  const overtimePremium = guard("Overtime premium", d.overtimePremium, 0, null, "%");
  const vacHours = guard("Vacancy days", d.vacancyDays, 0, null, "days") * 8 * (guard("Vacancy covered by OT", d.vacancyCoverageFraction, 0, 100, "%") / 100);
  const vacancy = vacancyMode === "gross" ? vacHours * wageHourly * (1 + overtimePremium / 100) : vacHours * wageHourly * (overtimePremium / 100);
  const hireCash = recruiting + training + signOn; // sunk on every hire, recoverable on early washout
  const cashPerDeparture = hireCash + vacancy;

  /* Productivity above 100 percent inverts the loss into a negative cost. Nothing
     stopped it, and the sanity band only looked upward, so the result printed a
     negative all-in with no flag at all. */
  const nestingLoss = guard("Nesting duration", d.nestingWeeks, 0, null, "wks") * 5 * 8 * loadedHourly * (1 - guard("Nesting productivity", d.nestingProductivity, 0, 100, "%") / 100);
  const rampLoss = guard("Ramp (after nesting)", d.rampMonths, 0, null, "mo") * 22 * 8 * loadedHourly * (1 - guard("Ramp productivity", d.rampProductivity, 0, 100, "%") / 100);
  const supervisorBurden = guard("Supervisor hrs / new hire", d.supervisorHoursPerNew, 0, null, "hrs") * guard("Supervisor loaded rate", d.supLoadedRate, 0, null, "$");
  const capacityPerDeparture = nestingLoss + rampLoss + supervisorBurden;

  const allInPerDeparture = cashPerDeparture + capacityPerDeparture;
  const pctSalary = avgSalary > 0 ? allInPerDeparture / avgSalary * 100 : 0;
  const salaryUnknown = avgSalary <= 0;
  /* One renderer for the percent-of-salary claim. It used to be written out at three
     prose sites, and only the band clause was guarded, so an unknown salary printed
     "roughly 0% of annual salary, which sits against an unknown salary" inside a
     single sentence. A figure and its own disclaimer must not be built separately. */
  const pctClaim = salaryUnknown ? "an unknown share of annual salary, because no salary was entered" : `roughly ${Math.round(pctSalary)}% of annual salary`;
  const pctShort = salaryUnknown ? "an unknown share of salary" : `${Math.round(pctSalary)}% of salary`;

  // ---- ANNUAL: backfill scales HIRES; everything keys off hires (consistent) ----
  const hires = Math.round(departures * bf);
  const unbackfilled = departures - hires;
  const annualCashBurden = hires * cashPerDeparture;
  const annualCapBurden = hires * capacityPerDeparture;
  const annualReplBurden = annualCashBurden + annualCapBurden;

  // ---- EARLY WASHOUT: measured against HIRES -> always a subset of cash burden ----
  const earlyWashouts = Math.round(hires * (earlyWashoutRate / 100));
  const earlyWaste = earlyWashouts * hireCash;

  // ---- UNCERTAINTY BAND: a point estimate of six multiplied inputs is a range ----
  const uncPct = evidence === "finance" ? 0.10 : evidence === "hrdata" ? 0.15 : 0.25;
  const allInLow = allInPerDeparture * (1 - uncPct), allInHigh = allInPerDeparture * (1 + uncPct);
  const annLow = annualReplBurden * (1 - uncPct), annHigh = annualReplBurden * (1 + uncPct);

  // ---- REDUCTION SCENARIOS: realizable = avoided hires x (cash + capacity*mech) ----
  const costPerPoint = guard("Cost to achieve", d.costPerPoint, 0, null, "$");
  const scenarios = [5, 10, 15, 20].map((redPts) => {
    const newRate = Math.max(0, attritionRate - redPts);
    const avoided = departures - Math.round(agents * (newRate / 100));
    const cash = avoided * bf * cashPerDeparture;
    const cap = avoided * bf * capacityPerDeparture * mech;
    const gross = cash + cap;
    const achieveCost = redPts * costPerPoint;
    const net = gross - achieveCost;
    const roi = achieveCost > 0 ? gross / achieveCost : null;
    return { redPts, newRate, avoided, cash, cap, total: gross, achieveCost, net, roi };
  });

  // ---- INTEGRITY FLAGS ----
  const flags = [];
  if (guards.length) flags.push({ t: `${guards.length} input${guards.length > 1 ? "s were" : " was"} outside the possible range and ${guards.length > 1 ? "were" : "was"} corrected before calculation. Every figure in this report was computed on the corrected values, listed in full above. Correct the input or treat the output as void.`, sev: "high" });
  if (salaryUnknown) flags.push({ t: "Average salary is zero, so the cost basis cannot be tested against the 40-60% frontline band. That band is the check that lets a CFO trust the rest of the model, so without it this export is a structure, not a validated figure.", sev: "high" });
  else if (pctSalary > 100) flags.push({ t: "All-in exceeds 100% of salary. That is manager-tier territory, implausible for a frontline agent. Re-check ramp loss, vacancy coverage, and double counting.", sev: "high" });
  else if (pctSalary > 60) flags.push({ t: `All-in is ${Math.round(pctSalary)}% of salary, above the typical frontline sanity band of about 40-60%. Defensible for complex or regulated centers, but validate role type and inputs.`, sev: "med" });
  else if (pctSalary > 0 && pctSalary < 30) flags.push({ t: `All-in is only ${Math.round(pctSalary)}% of salary, below the 40-60% frontline band. Plausible for offshore or BPO, but for a US onshore center it usually signals understated training, ramp, or vacancy inputs. Validate before citing.`, sev: "med" });
  const compNames = [["Recruiting + screening", recruiting], ["Training", training], ["Vacancy coverage", vacancy], ["Nesting loss", nestingLoss], ["Ramp loss", rampLoss], ["Supervisor coaching", supervisorBurden]];
  const topComp = compNames.reduce((a, b) => b[1] > a[1] ? b : a, compNames[0]);
  const trainShare = allInPerDeparture > 0 ? training / allInPerDeparture : 0;
  if (topComp[0] === "Training" && trainShare > 0.40) flags.push({ t: `Training is the dominant cost driver (${Math.round(trainShare * 100)}% of all-in, ${fmt$(training)}). ${trainShare > 0.55 ? "That is high, so " : "That can be valid for a long program, but "}validate training duration, paid hours, class size, and trainer allocation before citing.`, sev: "med" });
  else if (allInPerDeparture > 0 && topComp[1] / allInPerDeparture > 0.55) flags.push({ t: `${topComp[0]} is over 55% of all-in cost (${fmt$(topComp[1])}). A single line dominating this hard usually means an overstated duration or rate. Verify before citing.`, sev: "med" });
  if (attritionRate < 10) flags.push({ t: "Attrition under 10% is low for a contact center. Validate the denominator (separations divided by average headcount, rolling 12 months).", sev: "med" });
  else if (attritionRate > 100) flags.push({ t: `Attrition of ${Math.round(attritionRate)}% means you replace the entire floor more than once a year. That happens, but it is far more often a denominator error: a bad month annualized, or headcount taken at period end rather than as an average. Confirm the definition before citing this.`, sev: "high" });
  else if (attritionRate > 50) flags.push({ t: "Attrition over 50% is severe churn. The early-washout share is usually where the recoverable waste sits. Confirm it.", sev: "med" });
  if (unbackfilled > 0 && !downsizing) flags.push({ t: `${unbackfilled} of ${departures} departures/yr are not replaced under forced under-staffing. That lost capacity is a real cost, but it is an output and service-level question. Quantify it in Staffing and Occupancy, not here. This tool does not zero it out as free.`, sev: "high" });
  if (unbackfilled > 0 && downsizing) flags.push({ t: `${unbackfilled} of ${departures} departures/yr are a deliberate headcount reduction, so they carry no replacement cost. Confirm this is truly intended and not a hiring freeze in disguise.`, sev: "med" });
  if (mech === 0) flags.push({ t: "No capacity action is selected, so recovered capacity is credited at $0. The savings shown are avoided cash only, the honest floor.", sev: "med" });
  if (mech === 1) flags.push({ t: "Headcount reduction realizes 100% of capacity but is the hardest lever to commit. Confirm leadership will hold the seats out.", sev: "med" });
  if (vacancyMode === "gross") flags.push({ t: "Vacancy costing is Gross coverage spend (full OT). This counts base wage you would have paid anyway and overstates incremental attrition cost unless the departed agent's stopped payroll is credited elsewhere. Use Incremental for a clean business case.", sev: "med" });

  /* ---- INVARIANTS: a completeness failure voids the export rather than grading it down ----
     Impossible-output blocking. Every published figure is checked for finiteness and
     for a sign the arithmetic cannot legitimately produce. The guards above should
     make all of these unreachable; they are asserted anyway so a future refactor that
     removes a guard self-reports instead of shipping a contradictory PDF, which is
     exactly how the License Gap negative-seat defect survived. */
  const invariants = [];
  const published = { cashPerDeparture, capacityPerDeparture, allInPerDeparture, annualCashBurden, annualCapBurden, annualReplBurden, earlyWaste, hires, departures, unbackfilled, pctSalary };
  for (const [k, v] of Object.entries(published)) {
    if (!Number.isFinite(v)) invariants.push(`${k} is not a finite number (${String(v)}). The model cannot be exported.`);
    else if (v < 0) invariants.push(`${k} is negative (${fmt$(v)}). No component of a replacement cost can be below zero. The model cannot be exported.`);
  }
  for (const s of scenarios) {
    if (!Number.isFinite(s.total)) invariants.push(`Realizable value at -${s.redPts} points is not a finite number.`);
    else if (s.cash < 0 || s.cap < 0) invariants.push(`Realizable value at -${s.redPts} points has a negative component. Avoided cost cannot be below zero.`);
  }
  if (earlyWaste > annualCashBurden + 0.5) invariants.push(`Early-washout waste (${fmt$(earlyWaste)}) exceeds annual cash burden (${fmt$(annualCashBurden)}). A subset cannot exceed its parent.`);
  if (mech < 0 || mech > 1) invariants.push(`Capacity realization factor is ${mech}, outside 0 to 1. Capacity cannot be credited above the amount freed.`);
  const voided = invariants.length > 0;
  if (voided) flags.push({ t: `Export blocked. ${invariants.join(" ")} Do not cite this output.`, sev: "high" });

  /* ---- THREE-AXIS CONFIDENCE, doctrine v1.1 section 5.1 ----
     Evidence: where the inputs came from. Never N/A.
     Realization: whether modelled benefit converts to cash, from the shared credit class.
     Completeness: whether the model is whole and internally consistent.
     The headline is the minimum. The rationale names the binding axis.

     The 40-60% band moved off the evidence axis, where it used to sit as a
     precondition on Finance-grade inputs. Where a number came from and whether the
     model built from it is coherent are different questions, and answering them on
     one axis is why the old grade could not say which one was failing. */
  const bandLo = avgSalary * 0.40, bandHi = avgSalary * 0.60;
  const inBand = !salaryUnknown && pctSalary >= 40 && pctSalary <= 60;
  const guardrailOk = !salaryUnknown && pctSalary >= 30 && pctSalary <= 60;
  const hardFlag = flags.some((f) => f.sev === "high");

  const evidenceGrade = EVIDENCE_GRADE[evidence];
  const realization = CRED_GRADE[cred];

  let completeness = "Finance-grade";
  const completenessNotes = [];
  if (hardFlag) { completeness = "Directional"; }
  else if (!guardrailOk) { completeness = "Directional"; completenessNotes.push("cost basis sits outside the 30-60% plausible range"); }
  else if (!inBand) { completeness = "Planning-grade"; completenessNotes.push("cost basis is inside the plausible range but outside the published 40-60% frontline band"); }
  if (!hardFlag && vacancyMode === "gross" && GRADE_RANK[completeness] > GRADE_RANK["Planning-grade"]) { completeness = "Planning-grade"; completenessNotes.push("gross vacancy costing carries a known double-count risk"); }

  const grades = { evidence: evidenceGrade, realization, completeness };
  const minRank = Math.min(...AXES.map((a) => GRADE_RANK[grades[a]]));
  const confidence = Object.keys(GRADE_RANK).find((k) => GRADE_RANK[k] === minRank);
  const boundAxes = AXES.filter((a) => GRADE_RANK[grades[a]] === minRank);
  const boundBy = boundAxes.join(" and ");

  const evidenceReason = evidence === "finance" ? "Finance-confirmed figures."
    : evidence === "hrdata" ? "Real HR figures, but not finance-confirmed."
    : "Inputs are estimated or default. Replace with real figures to raise this.";
  const realizationReason = realization === "Finance-grade" ? `"${mechName}" is a hard cash lever, so savings are bookable once committed in budget.`
    : realization === "Planning-grade" ? `"${mechName}" is finance-creditable over the cycle, so tie it to a budget action to book it.`
    : mech === 0 ? "No capacity action selected, so recovered capacity is worth $0 and only avoided cash applies."
    : `"${mechName}" absorbs freed capacity into growth rather than booking cash, so this is planning value only.`;
  const completenessReason = voided ? "The model failed an integrity invariant, so the export is void rather than graded."
    : hardFlag ? "An active hard flag means part of this model is corrected, untestable, or routed to another tool. Resolve it first."
    : completenessNotes.length ? `Model is internally consistent, but ${completenessNotes.join(", and ")}.`
    : "Model is whole and internally consistent: every input inside its possible range, cost basis inside the published frontline band, and no value routed out of the model.";
  const AXIS_REASON = { evidence: evidenceReason, realization: realizationReason, completeness: completenessReason };
  const why = `${confidence}, bound by ${boundBy}. ${boundAxes.map((a) => AXIS_REASON[a]).join(" ")}`;

  const bookLabel = realization === "Finance-grade" ? "Bookable if committed" : realization === "Planning-grade" ? "Soft lever, tie to budget" : "Planning only";

  const cashRows = [
    { name: "Recruiting + screening", cost: recruiting, color: "#3B82F6" },
    { name: "Training (wages + trainer)", cost: training, color: "#8B5CF6" },
    ...(signOn > 0 ? [{ name: "Sign-on bonus", cost: signOn, color: "#0EA5E9" }] : []),
    { name: "Vacancy backfill (OT)", cost: vacancy, color: "#F97316" },
  ];
  const capRows = [
    { name: "Nesting productivity loss", cost: nestingLoss, color: "#EC4899" },
    { name: "Ramp-to-proficiency loss", cost: rampLoss, color: COLORS.red },
    { name: "Supervisor coaching burden", cost: supervisorBurden, color: COLORS.amber },
  ];

  const unbackfillSentence = unbackfilled <= 0
    ? `Every departure is replaced, so the full replacement cycle applies.`
    : downsizing
      ? `${unbackfilled} of your ${departures} departures a year are a deliberate reduction, so they carry no replacement cost. Confirm that is intended and not a quiet hiring freeze.`
      : `${unbackfilled} of your ${departures} departures a year are not replaced under forced under-staffing. That is not free: you are losing output you still need. This tool does not pretend that is $0. It routes the lost-capacity value to Staffing and Occupancy, where service-level and overtime effects can be modeled honestly.`;

  const analystRead = voided
    ? `This export is void. ${invariants.join(" ")}\n\nA model that produced an impossible figure has not produced a small error, it has produced a number with no meaning, and grading it down would imply it is merely uncertain. Correct the inputs listed in the corrections section and run it again. Nothing on this page should be quoted until it clears.`
    : (hires === 0)
    ? (downsizing
        ? `At 0% backfill, this model does not generate replacement cost, because the center is not refilling departures. Here that is intended downsizing: ${departures} seats a year are being shed on purpose, so there is no recruiting, training, or ramp spend to recover, and early-washout waste is correctly $0, because there are no new hires to wash out.\n\nWhat this tool will not do is call that a $0 problem and move on. Confirm the reduction is genuinely planned and not a hiring freeze wearing downsizing's clothes. If the demand those seats carried has not gone away, the exposure has simply moved from replacement cost to capacity, and that belongs in Staffing and Occupancy.\n\nThe per-refill economics above still stand as the cost you would re-incur the moment you start backfilling again: about ${fmt$(allInPerDeparture)} all-in per replaced agent, ${pctShort}. Treat that as the price of reversing the reduction, not as a current burden.`
        : `At 0% backfill, this model does not generate replacement cost, because the center is not replacing departures. That does not mean attrition is harmless. With no hires, there is no recruiting, training, or ramp spend, so replacement burden and early-washout waste are both correctly $0, but the economic exposure has not vanished, it has shifted.\n\nUnder forced under-staffing it moves to understaffing, occupancy, service level, backlog, burnout, and customer-impact risk. None of that is a replacement cost, so this tool deliberately does not invent a dollar for it; it routes the case to Staffing and Occupancy, where lost output, overtime on the remaining team, and SLA breach can be modeled honestly. That is also why this export is held at Directional on the completeness axis: the real cost lives in a model this calculator is not.\n\nThe per-refill economics above remain valid as the cost you re-incur the moment you resume hiring: about ${fmt$(allInPerDeparture)} all-in per replaced agent, ${pctShort}. Do not read the $0 replacement burden as "attrition is free."`)
    : `Attrition cost is not one number, and the honest version refuses to pretend it is. Replacing one frontline agent here runs about ${fmt$(allInPerDeparture)} all-in, ${pctClaim}, which sits ${salaryUnknown ? "outside the reach of the frontline band entirely, so the band cannot test it" : inBand ? "inside the published frontline band of 40 to 60 percent, the test that lets a CFO trust the rest of the model" : pctSalary > 60 ? "above the published frontline band of 40 to 60 percent, so validate the ramp, vacancy, and training inputs before a CFO sees it; complex or regulated centers can justify it, but it is not automatically defensible" : "below the published frontline band of 40 to 60 percent, which reads as either an efficient or offshore model or understated inputs, so confirm which before relying on it"}.\n\nThat figure is a burden, not a savings cheque. About ${fmt$(cashPerDeparture)} is cash out the door: recruiting, training wages, sign-on, and the overtime premium to cover the empty seat. The other ${fmt$(capacityPerDeparture)} is recovered capacity: nesting and ramp time you pay full wage for at partial output, plus supervisor coaching. Cash disappears when a backfilled departure is avoided; capacity becomes money only when leadership commits a mechanism. At ${backfillRate}% backfill and a "${mechLabel}" mechanism, that is why the realizable column is smaller than the burden.\n\nBackfill is the assumption most attrition models get wrong. Replacement cost only exists for seats you refill. ${unbackfillSentence}\n\nThe sharpest recoverable line is early washout. ${earlyWashoutRate}% of your replacement hires, about ${earlyWashouts} a year, leave before reaching productive output, and the ${fmt$(earlyWaste)} of recruiting, screening, ${signOn > 0 ? "sign-on, " : ""}and training cash spent on them returns almost nothing. Because it is measured against hires, it can never exceed your replacement cash; it is the cleanest target on the page. The defensible business case is not "attrition costs us everything." It is "this much is cash, this much is capacity, this much we can actually realize, and this slice is near-pure waste we can attack first."`;

  const railRead = voided
    ? `Attrition: export void, integrity invariant failed. Do not consume downstream.`
    : `Attrition: ${fmt$(allInPerDeparture)}/replaced departure (${Math.round(pctSalary)}% salary); ${fmt$(annualReplBurden)} annual replacement burden at ${backfillRate}% backfill; ${unbackfilled} seats/yr ${downsizing ? "shed deliberately" : "lost (route to Staffing)"}.`;

  return {
    guards, invariants, voided, flags,
    mechKey, mech, cred, mechName, mechLabel, vacancyMode, unbackfillIntent, evidence, downsizing,
    agents, attritionRate, avgSalary, benefitsLoadPct, backfillRate, earlyWashoutRate, classSize, costPerPoint,
    departures, bf, wageHourly, loadedHourly,
    recruiting, trainingWeeks, trDays, training, signOn, overtimePremium, vacHours, vacancy, hireCash, cashPerDeparture,
    nestingLoss, rampLoss, supervisorBurden, capacityPerDeparture,
    allInPerDeparture, pctSalary, salaryUnknown,
    hires, unbackfilled, annualCashBurden, annualCapBurden, annualReplBurden,
    earlyWashouts, earlyWaste,
    uncPct, allInLow, allInHigh, annLow, annHigh,
    scenarios, compNames, topComp, trainShare, pctClaim, pctShort,
    bandLo, bandHi, inBand, guardrailOk, hardFlag,
    grades, confidence, boundAxes, boundBy,
    evidenceReason, realizationReason, completenessReason, completenessNotes, why,
    bookLabel, cashRows, capRows, unbackfillSentence, analystRead, railRead,
  };
}
/* @engine-end */

function Select({ label, value, onChange, opts, info, infoTitle, align }) {
  return (
    <div>
      <label style={{ ...TYPE.label, color: NAVY, display: "flex", alignItems: "center", gap: 4, marginBottom: 4 }}>{label}{info && <InfoDot text={info} title={infoTitle || label} align={align} />}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "9px 12px", fontSize: 14, fontFamily: FONT, border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY }}>
        {opts.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
      </select>
    </div>
  );
}
function LogoMark({ size = 34 }) {
  return <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity={.6} /><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity={.8} /><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" /><line x1="-14" y1="-14" x2="14" y2="14" stroke={LIGHT} strokeWidth="5.5" strokeLinecap="round" /><line x1="14" y1="-14" x2="-14" y2="14" stroke={LIGHT} strokeWidth="5.5" strokeLinecap="round" /></g></svg>;
}

const tierColor = (g) => g === "Finance-grade" ? GREEN : g === "Planning-grade" ? ELECTRIC : AMBER;
const AXIS_LABEL = { evidence: "Evidence", realization: "Realization", completeness: "Completeness" };

export default function AttritionCostCalculator() {
  const [d, setD] = useState(() => clone(DEFAULTS.d));
  const [pulled, setPulled] = useState({});
  const [fromLink, setFromLink] = useState(false);
  const set = (k, v) => setD(p => ({ ...p, [k]: v }));

  useEffect(() => {
    // A scenario link is a deliberate act and outranks the ambient cross-tool pull.
    const sc = readScenario(TOOL_ID, DEFAULTS);
    if (sc) { setD(sc.d); setFromLink(true); clearScenarioParam(); return; }

    /* getPrimitiveWithSource, not getPrimitive. This tool publishes `agents`, so on a
       remount inside one session the plain read hands back this tool's own value and
       the PULLED badge asserts a provenance that does not exist. A value you published
       is not a value you sourced. Nothing here lifts a confidence axis either: a value
       arriving over the rail confers consistency, never evidence. */
    const pa = getPrimitiveWithSource("agents");
    const ph = getPrimitiveWithSource("agentHourly");
    const next = {}, badge = {};
    if (pa.value != null && !isNaN(pa.value) && pa.sourceTool && pa.sourceTool !== TOOL_ID) { next.agents = Math.round(pa.value); badge.agents = pa.sourceTool; }
    if (ph.value != null && !isNaN(ph.value) && ph.sourceTool && ph.sourceTool !== TOOL_ID) { next.avgSalary = Math.round(ph.value * 2080); badge.avgSalary = ph.sourceTool; }
    if (Object.keys(next).length) { setD(p => ({ ...p, ...next })); setPulled(badge); }
  }, []);

  const r = compute(d);

  useEffect(() => {
    publishToolResult(TOOL_ID, normalizeForPublish({
      agents: r.agents, attritionRate: r.attritionRate / 100,
      attritionCashPerDeparture: Math.round(r.cashPerDeparture),
      attritionAllInPerDeparture: Math.round(r.allInPerDeparture),
      attritionAnnualReplBurden: Math.round(r.annualReplBurden),
      attritionUnbackfilled: r.unbackfilled,
      attritionConfidence: r.confidence,
      attritionVoided: r.voided,
      capacityAction: r.mechKey,
      analystRead: r.railRead,
    }, { sourceTool: TOOL_ID }).clean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d]);

  const maxCost = Math.max(...r.cashRows.map(b => b.cost), ...r.capRows.map(b => b.cost), 1);
  const Bar = ({ b }) => (
    <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 78px", gap: 12, alignItems: "center" }}>
      <span style={{ ...TYPE.cell, color: SLATE }}>{b.name}</span>
      <div style={{ height: 20, background: WARM, borderRadius: 4, overflow: "hidden" }}><div style={{ height: "100%", width: `${(Math.max(0, b.cost) / maxCost) * 100}%`, background: b.color, borderRadius: 4, transition: "width 0.3s" }} /></div>
      <span style={{ ...TYPE.cellNum, fontWeight: 600, color: NAVY, textAlign: "right" }}>{fmtK(b.cost)}</span>
    </div>
  );

  const statLg = { ...TYPE.statValueLg, color: "#fff" };
  const corrections = r.guards.map(g => `${g.label}: entered ${guardVal(g, "entered")}, computed at ${guardVal(g, "used")}.`);

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh" }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:${FONT};background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.cg{grid-template-columns:1fr 1fr!important}.cg3{grid-template-columns:1fr!important}}`}</style>

      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Back to Tools</a></div></nav>

      <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "48px 28px 36px" }}>
        <div style={WRAP}>
          <span style={{ ...TYPE.eyebrow, color: RED, display: "block", marginBottom: 10 }}>Cost + Economics</span>
          <h1 style={t("display", { color: "#fff", margin: "0 0 10px" })}>Attrition Cost Calculator</h1>
          <p style={{ ...TYPE.body, color: "rgba(255,255,255,0.55)", maxWidth: 700 }}>The full cost of every agent departure, split into cash that actually leaves and capacity you only recover if you act. Replacement cost scales with how much you backfill; seats you do not refill are treated as a capacity decision, never as free. Benchmarked against the published 40-60% of salary band for frontline roles.</p>
        </div>
      </section>

      <section style={{ background: WARM, padding: "32px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <h2 style={{ ...TYPE.eyebrow, fontSize: 11, color: NAVY, margin: "0 0 14px" }}>Your Operation</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }} className="cg">
            <NumField label="Total agents" value={d.agents} onChange={v => set("agents", v)} step={5} min={0} pulled={!!pulled.agents} />
            <NumField label="Annual attrition" value={d.attritionRate} onChange={v => set("attritionRate", v)} suffix="%" min={0} max={300} info={DEFS.denominator} infoTitle="Attrition denominator" hint="Sep / avg headcount" />
            <NumField label="Avg agent salary" value={d.avgSalary} onChange={v => set("avgSalary", v)} suffix="$/yr" step={1000} min={0} pulled={!!pulled.avgSalary} />
            <NumField label="Benefits + overhead" value={d.benefitsLoadPct} onChange={v => set("benefitsLoadPct", v)} suffix="%" min={0} info={DEFS.benefitsLoad} infoTitle="Benefits + overhead load" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 12 }} className="cg">
            <Select label="Backfill basis" value={d.backfillRate} onChange={v => set("backfillRate", Number(v))} opts={BACKFILL_OPTS} info={DEFS.backfill} infoTitle="Backfill basis" />
            <Select label="Un-backfilled seats are" value={r.unbackfillIntent} onChange={v => set("unbackfillIntent", v)} opts={INTENT_OPTS} info={DEFS.unbackfill} infoTitle="Un-backfilled seats" />
            <NumField label="Early washout (new hires)" value={d.earlyWashoutRate} onChange={v => set("earlyWashoutRate", v)} suffix="%" min={0} max={100} info={DEFS.early} infoTitle="Early washout rate" hint="Leave before productivity" />
          </div>

          <h2 style={{ ...TYPE.eyebrow, fontSize: 11, color: NAVY, margin: "22px 0 14px", display: "flex", alignItems: "center", gap: 4 }}>Cash Out The Door<InfoDot text={DEFS.marginalCash} title="Cash out the door" /></h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }} className="cg">
            <NumField label="Recruiting cost" value={d.recruitingCost} onChange={v => set("recruitingCost", v)} suffix="$" step={250} min={0} hint="Postings, agency, referral" />
            <NumField label="Screening hours" value={d.screeningHours} onChange={v => set("screeningHours", v)} suffix="hrs" min={0} />
            <NumField label="HR loaded rate" value={d.hrLoadedRate} onChange={v => set("hrLoadedRate", v)} suffix="$/hr" min={0} />
            <NumField label="Sign-on bonus" value={d.signOnBonus} onChange={v => set("signOnBonus", v)} suffix="$" step={250} min={0} hint="0 if none" />
            <NumField label="Training duration" value={d.trainingWeeks} onChange={v => set("trainingWeeks", v)} suffix="wks" min={0} />
            <NumField label="Trainer loaded rate" value={d.trainerLoadedRate} onChange={v => set("trainerLoadedRate", v)} suffix="$/hr" min={0} />
            <NumField label="Class size" value={d.classSize} onChange={v => set("classSize", v)} min={1} hint="Trainer cost / class" />
            <NumField label="Overtime premium" value={d.overtimePremium} onChange={v => set("overtimePremium", v)} suffix="%" min={0} hint="Above base wage" />
            <NumField label="Vacancy days" value={d.vacancyDays} onChange={v => set("vacancyDays", v)} suffix="days" min={0} />
            <NumField label="Vacancy covered by OT" value={d.vacancyCoverageFraction} onChange={v => set("vacancyCoverageFraction", v)} suffix="%" min={0} max={100} />
            <Select label="Vacancy costing mode" value={r.vacancyMode} onChange={v => set("vacancyMode", v)} opts={VACANCY_OPTS} info={DEFS.vacancyMode} infoTitle="Vacancy costing mode" align="right" />
          </div>

          <h2 style={{ ...TYPE.eyebrow, fontSize: 11, color: NAVY, margin: "22px 0 14px", display: "flex", alignItems: "center", gap: 4 }}>Capacity / Opportunity<InfoDot text={DEFS.capacity} title="Capacity vs cash" /></h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }} className="cg">
            <NumField label="Nesting duration" value={d.nestingWeeks} onChange={v => set("nestingWeeks", v)} suffix="wks" min={0} info={DEFS.nesting} infoTitle="Nesting" />
            <NumField label="Nesting productivity" value={d.nestingProductivity} onChange={v => set("nestingProductivity", v)} suffix="%" min={0} max={100} hint="Of full output" />
            <NumField label="Ramp (after nesting)" value={d.rampMonths} onChange={v => set("rampMonths", v)} suffix="mo" min={0} info={DEFS.ramp} infoTitle="Ramp-to-proficiency" />
            <NumField label="Ramp productivity" value={d.rampProductivity} onChange={v => set("rampProductivity", v)} suffix="%" min={0} max={100} hint="Avg vs tenured parity" />
            <NumField label="Supervisor hrs / new hire" value={d.supervisorHoursPerNew} onChange={v => set("supervisorHoursPerNew", v)} suffix="hrs" min={0} />
            <NumField label="Supervisor loaded rate" value={d.supLoadedRate} onChange={v => set("supLoadedRate", v)} suffix="$/hr" min={0} />
          </div>

          <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="cg">
            <Select label="Capacity realization mechanism" value={r.mechKey} onChange={v => set("mech", v)} opts={MECH_OPTS} info={DEFS.mech} infoTitle="Realization mechanism" />
            <Select label="Input basis" value={r.evidence} onChange={v => set("evidence", v)} opts={EVIDENCE_OPTS} info={DEFS.confidence} infoTitle="Export confidence" align="right" />
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "36px 28px" }}>
        <div style={WRAP}>
          {r.voided && (
            <div style={{ background: "#FEF2F2", border: `2px solid ${RED}`, borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
              <div style={{ ...TYPE.eyebrow, color: RED, marginBottom: 6 }}>Export Void</div>
              <div style={{ ...TYPE.bodySm, color: SLATE }}>{r.invariants.join(" ")} A model that produced an impossible figure has not produced a small error. Correct the inputs and run it again; nothing on this page should be quoted until it clears.</div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }} className="cg3">
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 10, padding: 22, textAlign: "center" }}>
              <div style={{ ...TYPE.eyebrow, color: LIGHT, marginBottom: 6 }}>Cash Per Departure</div>
              <div style={statLg}>{fmtK(r.cashPerDeparture)}</div>
              <div style={{ ...TYPE.caption, color: "rgba(255,255,255,0.45)" }}>Avoided when a refill is prevented</div>
            </div>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 10, padding: 22, textAlign: "center" }}>
              <div style={{ ...TYPE.eyebrow, color: AMBER, marginBottom: 6 }}>Capacity Per Departure</div>
              <div style={statLg}>{fmtK(r.capacityPerDeparture)}</div>
              <div style={{ ...TYPE.caption, color: "rgba(255,255,255,0.45)" }}>Recovered only if you act</div>
            </div>
            <div style={{ background: `linear-gradient(135deg, #7F1D1D, #991B1B)`, borderRadius: 10, padding: 22, textAlign: "center" }}>
              <div style={{ ...TYPE.eyebrow, color: "#FCA5A5", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>All-In Per Departure<InfoDot text={DEFS.sensitivity} title="Why a range, not a point" align="right" /></div>
              <div style={statLg}>{fmtK(r.allInPerDeparture)}</div>
              <div style={{ ...TYPE.caption, ...NUM, color: "rgba(255,255,255,0.7)" }}>range {fmtK(r.allInLow)} to {fmtK(r.allInHigh)} (+/-{Math.round(r.uncPct * 100)}%)</div>
              <div style={{ ...TYPE.caption, ...NUM, color: "rgba(255,255,255,0.45)" }}>{r.salaryUnknown ? "salary not entered" : `${Math.round(r.pctSalary)}% of salary`} · per refill</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }} className="cg3">
            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ ...TYPE.eyebrow, color: SLATE, marginBottom: 4 }}>Annual Replacement Burden</div>
              <div style={{ ...TYPE.statValue, color: NAVY }}>{fmtK(r.annualReplBurden)}</div>
              <div style={{ ...TYPE.caption, ...NUM, color: MUTED }}>range {fmtK(r.annLow)} to {fmtK(r.annHigh)} (+/-{Math.round(r.uncPct * 100)}%)</div>
              <div style={{ ...TYPE.caption, ...NUM, color: MUTED }}>{fmtK(r.annualCashBurden)} cash + {fmtK(r.annualCapBurden)} capacity · {r.hires} of {r.departures} departures refilled</div>
              <div style={{ ...TYPE.caption, color: MUTED, marginTop: 4 }}>Current-state diagnosis, not automatically recoverable.</div>
            </div>
            <div style={{ border: `1px solid ${r.unbackfilled > 0 && !r.downsizing ? RED : BORDER}`, background: r.unbackfilled > 0 && !r.downsizing ? "#FEF6F6" : "#fff", borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ ...TYPE.eyebrow, color: r.unbackfilled > 0 && !r.downsizing ? RED : SLATE, marginBottom: 4 }}>Un-backfilled Seats</div>
              <div style={{ ...TYPE.statValue, color: r.unbackfilled > 0 && !r.downsizing ? RED : NAVY }}>{r.unbackfilled}/yr</div>
              <div style={{ ...TYPE.cell, color: SLATE }}>{r.unbackfilled === 0 ? "All departures refilled" : r.downsizing ? "Deliberate reduction, no replacement cost" : "Lost capacity, not free"}</div>
              <div style={{ ...TYPE.caption, color: MUTED, marginTop: 4 }}>{r.unbackfilled === 0 ? "Full replacement cycle applies." : r.downsizing ? "Confirm this is intended." : "Value the output loss in Staffing / Occupancy."}</div>
            </div>
            <div style={{ border: `1px solid ${AMBER}`, background: "#FFFBF4", borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ ...TYPE.eyebrow, color: "#92400E", marginBottom: 4 }}>Early-Washout Waste</div>
              <div style={{ ...TYPE.statValue, color: "#92400E" }}>{fmtK(r.earlyWaste)}</div>
              <div style={{ ...TYPE.cell, color: SLATE }}>{r.earlyWashoutRate}% of replacement hires ({r.earlyWashouts}/yr) leave pre-productivity</div>
              <div style={{ ...TYPE.caption, color: MUTED, marginTop: 4 }}>Subset of cash burden, the most recoverable slice.</div>
            </div>
          </div>

          {r.guards.length > 0 && (
            <div style={{ background: "#FFF8F0", border: `1px solid ${RED}`, borderRadius: 10, padding: "16px 18px", marginBottom: 20 }}>
              <div style={{ ...TYPE.eyebrow, color: RED, marginBottom: 8 }}>Inputs Corrected Before Calculation</div>
              {corrections.map((c, i) => <div key={i} style={{ ...TYPE.bodySm, ...NUM, color: SLATE }}>{c}</div>)}
              <div style={{ ...TYPE.caption, color: SLATE, marginTop: 6 }}>Every figure in this report was computed on the corrected values, not on what was entered.</div>
            </div>
          )}

          <div style={{ marginBottom: 22, padding: "12px 14px", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
              {AXES.map((a) => (
                <div key={a} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ ...TYPE.eyebrow, fontSize: 10, letterSpacing: "0.5px", color: MUTED }}>{AXIS_LABEL[a]}</span>
                  <span style={{ ...TYPE.eyebrow, fontSize: 11, letterSpacing: "1px", color: tierColor(r.grades[a]), padding: "3px 8px", borderRadius: 4, background: `${tierColor(r.grades[a])}1a` }}>{r.grades[a]}</span>
                </div>
              ))}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ ...TYPE.eyebrow, fontSize: 10, letterSpacing: "0.5px", color: MUTED }}>Headline</span>
                <span style={{ ...TYPE.eyebrow, fontSize: 11, letterSpacing: "1px", color: "#fff", padding: "3px 8px", borderRadius: 4, background: r.voided ? RED : tierColor(r.confidence) }}>{r.voided ? "Void" : r.confidence}</span>
              </div>
            </div>
            <div style={{ ...TYPE.caption, color: SLATE }}>The headline is the weakest of the three axes. <strong style={{ color: NAVY }}>Bound by {r.boundBy}.</strong> <strong style={{ color: NAVY }}>Evidence:</strong> {r.evidenceReason} <strong style={{ color: NAVY }}>Realization:</strong> {r.realizationReason} <strong style={{ color: NAVY }}>Completeness:</strong> {r.completenessReason}</div>
            <div style={{ ...TYPE.cell, ...NUM, color: SLATE, marginTop: 6 }}>Frontline band is 40-60% of salary ({fmtK(r.bandLo)} to {fmtK(r.bandHi)} here); the published $10-20K all-in reference assumes typical frontline wages. This result is {r.salaryUnknown ? "untestable, because no salary was entered" : `${Math.round(r.pctSalary)}% / ${fmtK(r.allInPerDeparture)}, ${r.guardrailOk ? "within band" : r.pctSalary > 60 ? "above band, validate" : "below band, validate"}`}.</div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 26 }} className="cg3">
            <div><h3 style={t("h3", { color: NAVY, marginBottom: 10 })}>Cash out the door</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{r.cashRows.map((b, i) => <Bar key={i} b={b} />)}</div></div>
            <div><h3 style={t("h3", { color: NAVY, marginBottom: 10 })}>Capacity / opportunity</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{r.capRows.map((b, i) => <Bar key={i} b={b} />)}</div></div>
          </div>

          <h3 style={t("h3", { color: NAVY, marginBottom: 4 })}>Realizable value if you reduce attrition</h3>
          <p style={{ ...TYPE.caption, color: MUTED, marginBottom: 12 }}>Cash in full; capacity at {Math.round(r.mech * 100)}% per mechanism; both scaled to {r.backfillRate}% backfill. Realizable value, not the burden above.{!r.downsizing && r.unbackfilled > 0 ? " Under forced under-staffing, retained capacity carries additional value. See Staffing." : ""}{r.downsizing ? " Note: under intended downsizing, retaining agents slows your planned reduction, so this credits only replacement cost avoided on the seats you would refill, not a net headcount saving." : ""}</p>
          <div style={{ maxWidth: 300, marginBottom: 14 }}>
            <NumField label="Cost to achieve (per point / yr)" value={d.costPerPoint} onChange={v => set("costPerPoint", v)} suffix="$" step={5000} min={0} info={DEFS.costToAchieve} infoTitle="Cost to achieve: CFO net view" hint={r.costPerPoint > 0 ? "Cards show net of this spend" : "0 = show gross only"} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 26 }} className="cg">
            {r.scenarios.map((s, i) => (
              <div key={i} style={{ background: WARM, border: `1px solid ${r.costPerPoint > 0 && s.net < 0 ? RED : BORDER}`, borderRadius: 10, padding: 16, textAlign: "center" }}>
                <div style={{ ...TYPE.eyebrow, fontSize: 10, color: GREEN, marginBottom: 4 }}>-{s.redPts} pts to {s.newRate}%</div>
                {r.costPerPoint > 0 ? (<>
                  <div style={{ ...TYPE.statValue, fontSize: 22, color: s.net < 0 ? RED : GREEN }}>{fmtK(s.net)}</div>
                  <div style={{ ...TYPE.caption, color: MUTED }}>net / yr</div>
                  <div style={{ ...TYPE.caption, ...NUM, fontSize: 10, color: MUTED, marginTop: 4 }}>{fmtK(s.total)} gross less {fmtK(s.achieveCost)} cost<br />{s.roi != null ? `${s.roi.toFixed(1)}x return · ` : ""}{s.avoided} fewer</div>
                </>) : (<>
                  <div style={{ ...TYPE.statValue, fontSize: 22, color: GREEN }}>{fmtK(s.total)}</div>
                  <div style={{ ...TYPE.caption, color: MUTED }}>realizable / yr</div>
                  <div style={{ ...TYPE.caption, ...NUM, fontSize: 10, color: MUTED, marginTop: 4 }}>{fmtK(s.cash)} cash avoided + {fmtK(s.cap)} capacity value<br />{s.avoided} fewer departures</div>
                </>)}
                <div style={{ ...TYPE.eyebrow, fontSize: 9, letterSpacing: "0.3px", color: tierColor(r.grades.realization), marginTop: 6, padding: "2px 6px", borderRadius: 3, background: `${tierColor(r.grades.realization)}14`, display: "inline-block" }}>{r.bookLabel}</div>
              </div>
            ))}
          </div>

          {r.flags.length > 0 && (
            <div style={{ background: "#FFF8F0", border: `1px solid ${AMBER}`, borderRadius: 10, padding: "16px 18px", marginBottom: 22 }}>
              <h3 style={{ ...TYPE.eyebrow, fontSize: 11, color: "#92400E", marginBottom: 8 }}>Integrity Checks</h3>
              {r.flags.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 8, padding: "4px 0" }}>
                  <span style={{ ...TYPE.eyebrow, fontSize: 10, letterSpacing: "0.5px", color: f.sev === "high" ? RED : AMBER, flexShrink: 0, marginTop: 2, width: 32 }}>{f.sev === "high" ? "FLAG" : "NOTE"}</span>
                  <span style={{ ...TYPE.bodySm, color: SLATE }}>{f.t}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "22px 26px", marginBottom: 24 }}>
            <h3 style={{ ...TYPE.eyebrow, fontSize: 11, color: GREEN, marginBottom: 12 }}>Analyst Read</h3>
            {r.analystRead.split("\n\n").map((para, i) => <p key={i} style={{ ...TYPE.bodySm, color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>{para}</p>)}
          </div>

          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "22px 26px", marginBottom: 24 }}>
            <h3 style={{ ...TYPE.eyebrow, fontSize: 11, color: GREEN, marginBottom: 8 }}>What Is Driving This Attrition?</h3>
            <p style={{ ...TYPE.caption, color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>At {r.attritionRate}% one or more of these is active. The rate gets fixed in these tools, not in this calculator.</p>
            {[
              { driver: "Occupancy above 85%", likelihood: r.attritionRate > 35 ? "High" : "Medium", tool: "/tools/occupancy-risk", toolName: "Occupancy Risk Simulator", why: "Insufficient recovery time between contacts burns agents out. The most controllable attrition driver." },
              { driver: "Repeat contacts / rework load", likelihood: "Medium", tool: "/tools/fcr-leakage", toolName: "FCR Leakage Diagnostic", why: "New-hire error and repeat-contact cost lives here, not in this tool. Quantify the rework that frustrates agents and customers alike." },
              { driver: "Weak coaching or agent experience", likelihood: "Medium", tool: "/tools/agent-experience", toolName: "Agent Experience Diagnostic", why: "Agents who feel unsupported leave faster than agents who feel underpaid. Assess the five retention dimensions." },
              { driver: "No visible career path", likelihood: r.attritionRate > 40 ? "High" : "Medium", tool: "/human-premium", toolName: "The Human Premium", why: "When agents cannot see what comes after this role, they leave to find it. New CX roles are emerging." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <span style={{ ...TYPE.eyebrow, fontSize: 10, letterSpacing: "0.5px", color: item.likelihood === "High" ? RED : AMBER, padding: "2px 6px", borderRadius: 3, background: item.likelihood === "High" ? "rgba(239,68,68,0.15)" : "rgba(245,158,11,0.15)", flexShrink: 0, marginTop: 2 }}>{item.likelihood}</span>
                <div>
                  <span style={{ ...TYPE.h3, fontSize: 13, color: "#fff" }}>{item.driver}</span>
                  <p style={{ ...TYPE.caption, color: "rgba(255,255,255,0.35)", margin: "2px 0 4px" }}>{item.why}</p>
                  <a href={item.tool} style={{ ...TYPE.caption, fontWeight: 600, color: LIGHT, padding: "2px 8px", borderRadius: 3, border: "1px solid rgba(255,255,255,0.12)" }}>{item.toolName}</a>
                </div>
              </div>
            ))}
          </div>

          <ReportActions
            toolId={TOOL_ID}
            toolName="Attrition Cost Analysis"
            subtitle={`Total Cost of Agent Turnover. ${r.voided ? "EXPORT VOID, integrity invariant failed" : `${r.confidence}, bound by ${r.boundBy}`}`}
            routePath={ROUTE}
            state={{ d }}
            defaults={DEFAULTS}
            confidence={r.voided ? "Void" : r.confidence}
            grades={{ ...r.grades, naReason: null, boundBy: r.boundBy, why: r.why,
              reasons: { evidence: r.evidenceReason, realization: r.realizationReason, completeness: r.completenessReason } }}
            summary={[
              { label: "Cash per departure", value: fmt$(r.cashPerDeparture) },
              { label: "All-in per departure", value: fmt$(r.allInPerDeparture) },
              { label: "Annual replacement burden", value: fmt$(r.annualReplBurden) },
              { label: "Early-washout waste", value: fmt$(r.earlyWaste) },
            ]}
            signals={{
              headline_confidence: r.voided ? "void" : r.confidence,
              evidence_axis: r.grades.evidence,
              realization_axis: r.grades.realization,
              completeness_axis: r.grades.completeness,
              bound_by: r.boundBy,
              capacity_action: r.mechKey,
              attrition_rate: r.attritionRate + "%",
              agents: r.agents,
              evidence: r.evidence,
              hard_flag: r.hardFlag ? "yes" : "no",
              integrity_flags: r.flags.length,
              inputs_corrected: r.guards.length,
              export_voided: r.voided ? "yes" : "no",
              from_scenario_link: fromLink ? "yes" : "no",
            }}
            sections={[
              ...(r.voided ? [{ title: "Export Void", type: "findings", items: [...r.invariants, "A model that produced an impossible figure has not produced a small error. Correct the inputs and run it again. Nothing in this document should be cited until it clears."] }] : []),
              ...(r.guards.length ? [{ title: "Inputs Corrected Before Calculation", type: "findings", items: [...corrections, "Every figure in this document was computed on the corrected values, not on what was entered."] }] : []),
              /* The three axes are NOT restated here. ReportActions injects one standard
                 Confidence section from the `grades` prop, so nine tools cannot drift into
                 nine wordings of the same idea. What stays here is the evidence detail only
                 this tool can supply. */
              { title: "Evidence Detail", type: "findings", items: [
                `Backfill basis: ${r.backfillRate}% of departures replaced (${r.hires} of ${r.departures}). Replacement cost scales with this; ${r.unbackfilled} un-backfilled seats are ${r.downsizing ? "a deliberate reduction with no replacement cost" : "lost capacity routed to Staffing/Occupancy, not zeroed out as free"}.`,
                `Vacancy costing: ${r.vacancyMode === "gross" ? "Gross coverage spend (full OT) that overstates incremental cost unless the vacant seat's stopped payroll is credited elsewhere. Incremental (OT premium only) is the conservative default." : "Incremental, OT premium only (the conservative default)."}`,
                r.salaryUnknown
                  ? `Cost basis: ${fmt$(r.allInPerDeparture)} all-in, but average salary was not entered, so the 40-60% frontline band cannot test it. That band is the check that lets a CFO trust the rest of the model.`
                  : `Cost basis: ${Math.round(r.pctSalary)}% of salary (${fmt$(r.allInPerDeparture)}, planning range ${fmt$(r.allInLow)} to ${fmt$(r.allInHigh)} at +/-${Math.round(r.uncPct * 100)}%) versus the 40-60% frontline band of ${fmt$(r.bandLo)} to ${fmt$(r.bandHi)}. ${r.guardrailOk ? "Within the plausible range." : "Outside the plausible range. Verify inputs before citing."} The $10-20K all-in reference assumes typical frontline wages and is not salary-adjusted.`,
              ]},
              ...(r.flags.length > 0 ? [{ title: "Integrity Flags", type: "findings", items: r.flags.map(f => `${f.sev === "high" ? "[FLAG] " : "[NOTE] "}${f.t}`) }] : []),
              { title: "Cost Per Replaced Departure", type: "table", rows: [
                ["Recruiting + screening (cash)", fmt$(r.recruiting)],
                ["Training: wages + trainer (cash)", fmt$(r.training)],
                ...(r.signOn > 0 ? [["Sign-on bonus (cash)", fmt$(r.signOn)]] : []),
                [`Vacancy backfill: ${r.vacancyMode === "gross" ? "gross" : "OT premium"} (cash)`, fmt$(r.vacancy)],
                ["Nesting productivity loss (capacity)", fmt$(r.nestingLoss)],
                ["Ramp-to-proficiency loss (capacity)", fmt$(r.rampLoss)],
                ["Supervisor coaching (capacity)", fmt$(r.supervisorBurden)],
              ]},
              { title: "Burden vs Realizable", type: "metrics", items: [
                { label: "Cash per departure", value: fmt$(r.cashPerDeparture), color: ELECTRIC },
                { label: "Capacity per departure", value: fmt$(r.capacityPerDeparture), color: AMBER },
                { label: "All-in per departure", value: fmt$(r.allInPerDeparture), color: RED },
                { label: "Annual replacement burden", value: fmt$(r.annualReplBurden), color: RED },
                { label: "Early-washout waste", value: fmt$(r.earlyWaste), color: AMBER },
                { label: `Realizable -5 pts (${r.bookLabel})`, value: fmt$(r.scenarios[0].total), color: GREEN },
              ]},
              { title: "Key Findings", type: "findings", items: [
                `Each replaced departure costs ${fmt$(r.cashPerDeparture)} cash plus ${fmt$(r.capacityPerDeparture)} recovered capacity, for ${fmt$(r.allInPerDeparture)} all-in${r.salaryUnknown ? "" : `, about ${Math.round(r.pctSalary)}% of salary`}.`,
                `At ${r.backfillRate}% backfill, ${r.hires} of ${r.departures} departures are refilled, for an annual replacement burden of ${fmt$(r.annualReplBurden)} (${fmt$(r.annualCashBurden)} cash). This is a current-state diagnosis, not recoverable savings.`,
                r.unbackfilled > 0 ? `${r.unbackfilled} departures/yr are not refilled. ${r.downsizing ? "Treated as a deliberate reduction with no replacement cost." : "This is lost capacity, not zero cost. Quantify the output and service-level impact in Staffing/Occupancy."}` : `All departures are refilled, so the full replacement cycle applies.`,
                `${r.earlyWashoutRate}% of replacement hires wash out before productivity, wasting about ${fmt$(r.earlyWaste)} of recruiting, screening, ${r.signOn > 0 ? "sign-on, " : ""}and training cash, a subset of cash burden and the most recoverable slice.`,
                r.costPerPoint > 0
                  ? `Cutting attrition 5 points yields ${fmt$(r.scenarios[0].total)} gross; net of ${fmt$(r.scenarios[0].achieveCost)} to achieve it is ${fmt$(r.scenarios[0].net)}${r.scenarios[0].roi != null ? ` (${r.scenarios[0].roi.toFixed(1)}x return)` : ""}. Bookability: ${r.bookLabel.toLowerCase()}. Net is the figure to take to budget.`
                  : `Cutting attrition 5 points realizes ${fmt$(r.scenarios[0].total)} gross (${fmt$(r.scenarios[0].cash)} cash avoided + ${fmt$(r.scenarios[0].cap)} capacity value), gated by backfill and mechanism. Bookability: ${r.bookLabel.toLowerCase()}. Not booked EBITDA unless tied to a budget action, and this is before the cost to achieve the reduction.`,
              ]},
              { title: "Methodology", type: "findings", items: [
                `Cost model: per replaced departure = cash (recruiting, screening, ${r.signOn > 0 ? "sign-on, " : ""}training wages, trainer, vacancy OT) + capacity (nesting and ramp productivity loss, supervisor coaching). Capacity is recovered time, credited only through a realization mechanism.`,
                `Capacity realization: "${r.mechName}" credits ${Math.round(r.mech * 100)}% of freed capacity, read from the shared platform capacity-action table so the same mechanism means the same thing in every tool. Credit class ${r.cred}, which sets the realization axis at ${r.grades.realization}. Cash out the door is never scaled by this factor.`,
                `Benchmark guardrail: the 40-60%-of-salary frontline sanity band is based on role-specific replacement-cost estimates (frontline about 40% of salary, well below the generic 50-200% turnover figure). The $10-20K all-in reference is the published contact-center agent replacement estimate and is not salary-adjusted.`,
                `Confidence: three named axes. Evidence is input provenance. Realization is whether modelled benefit converts to cash, read from the shared credit class. Completeness is whether the model is whole and internally consistent. The headline is the weakest of the three and the rationale names the binding axis. A failed integrity invariant voids the export rather than grading it down, because an impossible figure is not an uncertain one.${r.guards.length ? ` INPUTS CORRECTED: ${corrections.join(" ")} Every figure above was computed on the corrected values.` : ""}`,
              ]},
              { title: "Next Steps", type: "next", items: [
                { tool: "Occupancy Risk Simulator", href: "/tools/occupancy-risk", reason: "Check whether occupancy is driving burnout-led exits" },
                { tool: "Agent Experience Diagnostic", href: "/tools/agent-experience", reason: "Identify which retention dimensions are failing" },
                { tool: "FCR Leakage Diagnostic", href: "/tools/fcr-leakage", reason: "Quantify the new-hire rework and repeat-contact cost" },
              ]},
            ]}
          />

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
            <a href="/tools/occupancy-risk" style={{ ...TYPE.h3, fontSize: 14, background: ELECTRIC, color: "#fff", padding: "12px 24px", borderRadius: 8 }}>Occupancy Risk Simulator</a>
            <a href="/how-to-choose" style={{ ...TYPE.h3, fontSize: 14, background: WARM, border: `1px solid ${BORDER}`, color: NAVY, padding: "12px 24px", borderRadius: 8 }}>Explore More Tools</a>
          </div>
        </div>
      </section>
    </div>
  );
}
