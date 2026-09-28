import { useState, useEffect, useId } from "react";
import { HowOthersReport } from "./src/lib/HowOthersReport.jsx";
import ReportActions from "./ReportActions";
import { COLORS, benchmark } from "./src/lib/benchmarks";
import { publishToolResult, getExternalWithSource } from "./src/lib/toolData";
/* An empty rail read, in the shape the old self-capable getter returned, so a missing or self-published value reads as
   nothing (P6 item 15: every pull is external). */
const NO_RAIL = Object.freeze({ value: null, sourceTool: null, railOrigin: null, derived: false, flag: null, confidenceImpact: null });
import { normalizeForPublish } from "./src/lib/metrics";
import { MECH, MECH_ORDER, MECH_INITIAL } from "./src/lib/mech";
import NumField from "./src/lib/NumField";
import InfoDot from "./src/lib/InfoDot";
import { TYPE, FONT, FONT_IMPORT_CSS, NUM, t } from "./src/lib/type";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { severityBucket } from "./src/lib/track";
import { gradeConfidence, emitGrades, voidResult, GRADE_RANK, AXES, CRED_GRADE } from "./src/lib/confidence";
import { createGuards, guardVal } from "./src/lib/guards";
import { ToolFrame } from "./src/lib/ToolFrame.jsx";
import { Result, Finding, Button, resultHow } from "./src/lib/ui.jsx";
import { HOUSE, PILLARS, ARCS, RADIUS, TOUCH, alpha, LINE } from "./src/lib/tokens.js";
import { methodStamp } from "./src/lib/methodVersions.js";
import { scoreRubric } from "./src/lib/rubric.js";
import { ATTRITION_DRIVERS, DRIVER_TOOL_NAMES } from "./src/lib/rubrics/attritionDrivers.js";
import { StatementStep } from "./src/lib/frameKit.jsx";

const NAVY = COLORS.navy, ELECTRIC = COLORS.electric, GREEN = COLORS.green, AMBER = COLORS.amber, RED = COLORS.red, MUTED = COLORS.muted;
const DEEP = "#061325", LIGHT = "#00AAFF", WARM = "#F8FAFB", SLATE = "#3A4F6A", BORDER = "#D8E3ED";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };

const DEFS = {
  benefitsLoad: "The percentage added to base wage for employer-paid benefits and payroll taxes. It opens at the platform's shared 30% benefits load. Paid time during training and ramp is costed at this loaded rate, because you pay salary plus benefits while a new hire learns the job.",
  backfill: "The share of departures you replace. Replacement cost exists only for seats you refill: with no hire there is no recruiting, training, ramp or coverage spend. Backfill therefore scales the whole replacement cycle. Seats you do not refill are a capacity decision, handled separately below.",
  unbackfill: "What happens to the seats you do not refill. Intended downsizing means the reduction is deliberate, so it carries no turnover cost. Forced under-staffing means you lose output you still need. That lost capacity is real, and it is valued in Staffing and Occupancy. This tool routes it there and does not guess a number.",
  marginalCash: "Cash out the door is spend that stops when a backfilled departure is avoided: recruiting, training wages, sign-on bonuses and the overtime premium. It counts at 100 percent in savings, because you simply stop spending it.",
  capacity: "Capacity is recovered agent and supervisor time. It becomes money only when you act on it, so it passes through a capacity action (the realization mechanism). With no action committed, recovered capacity counts as zero in hard savings.",
  denominator: "Attrition here is separations divided by average headcount over the year. Define it before you rely on it: voluntary only or total, regrettable or all, and a rolling twelve-month actual. Annualizing one rough month is a common way centers inflate their own rate by accident.",
  early: "Early washout is the share of new hires who leave before reaching productive output, usually inside the first ninety days. Their recruiting and training cash is spent with almost no return, which makes this the most wasteful and most recoverable segment. It is measured against hires, so it can never exceed the replacement cash it is drawn from.",
  nesting: "Nesting is supervised live work right after classroom training: the new hire handles real contacts at reduced output. The loss is the unproductive share of fully paid time during that period.",
  ramp: "Ramp is the stretch after nesting until a new hire matches tenured agents on AHT (average handle time), QA (quality assurance) scores and FCR (first contact resolution). Measure it to full parity, which takes months. Only the shortfall against full output is valued, and ramp starts after nesting so the two never overlap.",
  vacancyMode: "Incremental charges only the overtime premium, because the empty seat's base wage is no longer being paid. Gross coverage spend charges the full overtime cost. Use it only when the departed agent's stopped payroll is credited somewhere else, or you will count it twice.",
  mech: "How recovered capacity turns into money. Not selected means you keep the slack and realize zero. Avoiding hiring is a common and defensible choice. Headcount reduction realizes the most but is the hardest commitment to make. The table is shared across the platform, so each action means the same thing in every tool.",
  confidence: "Confidence is graded on three axes. Evidence: where the inputs came from (estimates, HR data or finance-confirmed figures). Realization: whether the modelled benefit converts to cash, read from the shared capacity-action table. Completeness: whether the model is whole and consistent, with inputs inside possible ranges, the cost basis inside the frontline band and no value routed out of the model. The headline grade is the weakest of the three, and the rationale names the axis holding it there.",
  sensitivity: "The all-in figure multiplies six uncertain inputs, and the uncertainty compounds, so the cost is shown as a range around the point figure. The band narrows as you confirm inputs: about plus or minus 25 percent on estimates, 15 percent on HR data and 10 percent on finance-confirmed figures. Finance teams tend to trust a defensible range more than a single exact number, and a range keeps one disputed input from discrediting the whole model.",
  costToAchieve: "Realizable savings are shown gross, before what you spend to reduce attrition: pay adjustments, coaching, scheduling tools, better hiring. Finance will want the savings net of that spend. Enter the annual cost per point of reduction and the tool nets it out and shows the return. Programs usually cost more per point as you push the rate lower (diminishing returns), so treat the deeper cuts as the optimistic end.",
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
/* The sign leads the symbol, matching fmt$ above and every other money format in the
   platform. This printed $-200 on a negative entry until the Cost per Contact split-
   rendering fix, which is the same divergence in the same helper. The renderer and
   the clamp now live in src/lib/guards.js, shared by every guarded tool. */

/* GRADE_RANK, AXES and CRED_GRADE now come from src/lib/confidence.js. They were
   declared here and in eight other tools, which is how three vocabularies grew.
   Realization reads the shared credit class, never a numeric threshold. */

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
  { v: "incremental", label: "Incremental (overtime premium)" },
  { v: "gross", label: "Gross coverage spend" },
];
const EVIDENCE_OPTS = [
  { v: "estimate", label: "Estimates or defaults" },
  { v: "hrdata", label: "From our HR data" },
  { v: "finance", label: "Finance-confirmed figures" },
];
const EVIDENCE_GRADE = { estimate: "Directional", hrdata: "Planning-grade", finance: "Finance-grade" };

/* Scenario contract. Module scope so state initializers and the URL encoder read
   from one definition, and the identity is stable across renders. */
const TOOL_ID = "attrition-cost";
const ROUTE = "/tools/attrition-cost";
const clone = (o) => JSON.parse(JSON.stringify(o));
/* Every default is a registry entry. The operating profile is labelled heuristic there;
   the salary is the shared BLS median wage over the 2,080 hour year, the benefits load the
   shared load (J10, J11) and the overtime premium the FLSA minimum. */
const at = (k) => benchmark(`attrition.${k}`);
/* A BLS median hourly wage at the shared benefits load, to the cent: the opening rate for the recruiter, trainer and
   supervisor (May 2025, method 1.3). */
const loadedBls = (id) => Math.round(benchmark(id) * benchmark("load.benefits") * 100) / 100;
const HOURS_YEAR = benchmark("time.hours.year");
const HOURS_DAY = at("time.hoursDay"), DAYS_WEEK = at("time.daysWeek"), WORKDAYS_MONTH = at("time.workdaysMonth");
const BAND = { low: at("band.low"), high: at("band.high"), floor: at("band.floor"), ceiling: at("band.ceiling") };
const BASE = {
  agents: at("default.agents"), attritionRate: at("default.rate"),
  avgSalary: Math.round(benchmark("market.wage.agent") * HOURS_YEAR), benefitsLoadPct: Math.round((benchmark("load.benefits") - 1) * 100),
  backfillRate: at("default.backfill"), unbackfillIntent: "forced", earlyWashoutRate: at("default.washout"),
  recruitingCost: at("default.recruiting"), screeningHours: at("default.screeningHours"), hrLoadedRate: loadedBls("market.wage.hr"),
  trainingWeeks: at("default.trainingWeeks"), trainerLoadedRate: loadedBls("market.wage.trainer"), classSize: at("default.classSize"), signOnBonus: 0,
  nestingWeeks: at("default.nestingWeeks"), nestingProductivity: at("default.nestingProductivity"),
  rampMonths: at("default.rampMonths"), rampProductivity: at("default.rampProductivity"),
  supervisorHoursPerNew: at("default.supervisorHours"), supLoadedRate: loadedBls("market.wage.supervisor"),
  overtimePremium: Math.round((benchmark("adh.ot.multiplier") - 1) * 100), vacancyDays: at("default.vacancyDays"), vacancyCoverageFraction: at("default.vacancyCoverage"), vacancyMode: "incremental",
  mech: MECH_INITIAL, evidence: "estimate", costPerPoint: 0,
};
const DEFAULTS = { d: BASE };

export function compute(d) {
  const { guards, guard, pick } = createGuards();

  /* Mechanism is the highest-leverage input in the file: it multiplies every
     capacity credit and it sets the realization axis. An out-of-range value used to
     pass straight into the arithmetic as a percentage. */
  let mechKey = d.mech;
  /* Own-key test, not truthiness: "constructor", "toString" and "__proto__" are truthy
     on any object literal, skipped this branch, and threw at mechName.toLowerCase(),
     white-screening the tool on a crafted scenario link. */
  if (!Object.prototype.hasOwnProperty.call(MECH, mechKey)) {
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
  const benefitsLoadPct = guard("Benefits load", d.benefitsLoadPct, 0, null, "%");
  const backfillRate = guard("Backfill basis", d.backfillRate, 0, 100, "%");
  const earlyWashoutRate = guard("Early washout", d.earlyWashoutRate, 0, 100, "%");

  const departures = Math.round(agents * (attritionRate / 100));
  const bf = backfillRate / 100;
  const wageHourly = avgSalary / HOURS_YEAR;
  const loadedHourly = wageHourly * (1 + benefitsLoadPct / 100);

  // ---- PER REPLACED DEPARTURE (the replacement cycle) ----
  const recruiting = guard("Recruiting cost", d.recruitingCost, 0, null, "$")
    + guard("Screening hours", d.screeningHours, 0, null, "hrs") * guard("HR loaded rate", d.hrLoadedRate, 0, null, "$");
  const trainingWeeks = guard("Training duration", d.trainingWeeks, 0, null, "wks");
  const trDays = trainingWeeks * DAYS_WEEK;
  /* Class size divides, so it cannot be zero. The shipped Math.max(1, x) silently
     substituted 1 and tripled trainer cost with nothing recorded anywhere. */
  const classSize = guard("Class size", d.classSize, 1, null, "");
  const training = trDays * HOURS_DAY * loadedHourly + trDays * HOURS_DAY * guard("Trainer loaded rate", d.trainerLoadedRate, 0, null, "$") / classSize;
  const signOn = guard("Sign-on bonus", d.signOnBonus, 0, null, "$");
  const overtimePremium = guard("Overtime premium", d.overtimePremium, 0, null, "%");
  const vacHours = guard("Vacancy days", d.vacancyDays, 0, null, "days") * HOURS_DAY * (guard("Vacancy covered by OT", d.vacancyCoverageFraction, 0, 100, "%") / 100);
  const vacancy = vacancyMode === "gross" ? vacHours * wageHourly * (1 + overtimePremium / 100) : vacHours * wageHourly * (overtimePremium / 100);
  const hireCash = recruiting + training + signOn; // sunk on every hire, recoverable on early washout
  const cashPerDeparture = hireCash + vacancy;

  /* Productivity above 100 percent inverts the loss into a negative cost. Nothing
     stopped it, and the sanity band only looked upward, so the result printed a
     negative all-in with no flag at all. */
  const nestingLoss = guard("Nesting duration", d.nestingWeeks, 0, null, "wks") * DAYS_WEEK * HOURS_DAY * loadedHourly * (1 - guard("Nesting productivity", d.nestingProductivity, 0, 100, "%") / 100);
  const rampLoss = guard("Ramp (after nesting)", d.rampMonths, 0, null, "mo") * WORKDAYS_MONTH * HOURS_DAY * loadedHourly * (1 - guard("Ramp productivity", d.rampProductivity, 0, 100, "%") / 100);
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
  const uncPct = at(`band.${evidence}`);
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
  if (guards.length) flags.push({ t: `${guards.length} input${guards.length > 1 ? "s were" : " was"} outside the possible range and ${guards.length > 1 ? "were" : "was"} corrected before calculation. Every figure in this report was computed on the corrected values, listed in full above. Correct the input. Until you do, completeness grades Directional.`, sev: "high" });
  if (salaryUnknown) flags.push({ t: `Average salary is zero, so the cost basis cannot be tested against the ${BAND.low} to ${BAND.high}% frontline planning band. That band is the plausibility check on the rest of the model. Until a salary is entered, read this export as a structure without a validated figure.`, sev: "high" });
  else if (pctSalary > BAND.ceiling) flags.push({ t: `All-in exceeds ${BAND.ceiling}% of salary. That is a manager-level cost and implausible for a frontline agent. Check ramp loss, vacancy coverage and double counting.`, sev: "high" });
  else if (pctSalary > BAND.high) flags.push({ t: `All-in is ${Math.round(pctSalary)}% of salary, above the ${BAND.low} to ${BAND.high}% frontline planning band. Complex or regulated centers can justify that, but validate the role type and inputs.`, sev: "med" });
  else if (pctSalary > 0 && pctSalary < BAND.floor) flags.push({ t: `All-in is only ${Math.round(pctSalary)}% of salary, below the ${BAND.low} to ${BAND.high}% frontline planning band. That is plausible offshore or at a BPO (business process outsourcer). For a US onshore center it usually means the training, ramp or vacancy inputs are understated. Validate before citing.`, sev: "med" });
  const compNames = [["Recruiting and screening", recruiting], ["Training", training], ["Vacancy coverage", vacancy], ["Nesting loss", nestingLoss], ["Ramp loss", rampLoss], ["Supervisor coaching", supervisorBurden]];
  const topComp = compNames.reduce((a, b) => b[1] > a[1] ? b : a, compNames[0]);
  const trainShare = allInPerDeparture > 0 ? training / allInPerDeparture : 0;
  if (topComp[0] === "Training" && trainShare > at("read.trainingShare")) flags.push({ t: `Training is the dominant cost driver (${Math.round(trainShare * 100)}% of all-in, ${fmt$(training)}). ${trainShare > at("read.trainingHigh") ? "That is high, so " : "That can be valid for a long program, but "}validate training duration, paid hours, class size and trainer allocation before citing.`, sev: "med" });
  else if (allInPerDeparture > 0 && topComp[1] / allInPerDeparture > at("read.dominance")) flags.push({ t: `${topComp[0]} is over ${Math.round(at("read.dominance") * 100)}% of all-in cost (${fmt$(topComp[1])}). One line dominating this much usually means an overstated duration or rate. Verify it before citing.`, sev: "med" });
  if (attritionRate < at("read.rateLow")) flags.push({ t: "Attrition under " + at("read.rateLow") + "% is low for a contact center. Check the denominator: separations divided by average headcount over a rolling 12 months.", sev: "med" });
  else if (attritionRate > at("read.rateExtreme")) flags.push({ t: `Attrition of ${Math.round(attritionRate)}% means you replace the entire floor more than once a year. That does happen, but a denominator error is far more often the cause: one bad month annualized, or headcount taken at period end instead of as an average. Confirm the definition before citing this.`, sev: "high" });
  else if (attritionRate > at("read.rateHigh")) flags.push({ t: "Attrition over " + at("read.rateHigh") + "% is severe churn. The recoverable waste usually sits in early washout, so confirm that figure.", sev: "med" });
  if (unbackfilled > 0 && !downsizing) flags.push({ t: `${unbackfilled} of ${departures} departures a year are not replaced under forced under-staffing. That lost capacity is a real cost, and it shows up in output and service level. Quantify it in Staffing and Occupancy. This tool does not count it as zero.`, sev: "high" });
  if (unbackfilled > 0 && downsizing) flags.push({ t: `${unbackfilled} of ${departures} departures a year are a deliberate headcount reduction, so they carry no replacement cost. Confirm the reduction is intended and is not a hiring freeze under another name.`, sev: "med" });
  if (mech === 0) flags.push({ t: "No capacity action is selected, so recovered capacity is credited at $0. The savings shown are avoided cash only.", sev: "med" });
  if (mech === 1) flags.push({ t: "Headcount reduction realizes 100% of capacity and is the hardest lever to commit. Confirm leadership will keep those seats unfilled.", sev: "med" });
  if (vacancyMode === "gross") flags.push({ t: "Vacancy costing is set to Gross coverage spend (full overtime cost). This counts base wage you would have paid anyway, so it overstates incremental attrition cost unless the departed agent's stopped payroll is credited elsewhere. Use Incremental for a clean business case.", sev: "med" });

  /* ---- INVARIANTS: a completeness failure voids the export rather than grading it down ----
     Impossible-output blocking. Every published figure is checked for finiteness and
     for a sign the arithmetic cannot legitimately produce. The guards above should
     make all of these unreachable; they are asserted anyway so a future refactor that
     removes a guard self-reports instead of shipping a contradictory PDF, which is
     exactly how the License Gap negative-seat defect survived. */
  const invariants = [];
  const published = { cashPerDeparture, capacityPerDeparture, allInPerDeparture, annualCashBurden, annualCapBurden, annualReplBurden, earlyWaste, hires, departures, unbackfilled, pctSalary };
  /* The reader sees the figure's name, never the variable behind it. */
  const OUTPUT_NAME = { cashPerDeparture: "Cash per departure", capacityPerDeparture: "Capacity per departure", allInPerDeparture: "All-in per departure",
    annualCashBurden: "Annual cash burden", annualCapBurden: "Annual capacity burden", annualReplBurden: "Annual replacement burden",
    earlyWaste: "Early-washout waste", hires: "Hires", departures: "Departures", unbackfilled: "Unbackfilled departures", pctSalary: "Cost as a share of salary" };
  for (const [k, v] of Object.entries(published)) {
    if (!Number.isFinite(v)) invariants.push(`${OUTPUT_NAME[k]} does not compute to a finite number at these inputs. The model cannot be exported.`);
    else if (v < 0) invariants.push(`${OUTPUT_NAME[k]} is negative (${fmt$(v)}). No component of a replacement cost can be below zero. The model cannot be exported.`);
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

     The frontline band moved off the evidence axis, where it used to sit as a
     precondition on Finance-grade inputs. Where a number came from and whether the
     model built from it is coherent are different questions, and answering them on
     one axis is why the old grade could not say which one was failing. */
  const bandLo = avgSalary * BAND.low / 100, bandHi = avgSalary * BAND.high / 100;
  const inBand = !salaryUnknown && pctSalary >= BAND.low && pctSalary <= BAND.high;
  const guardrailOk = !salaryUnknown && pctSalary >= BAND.floor && pctSalary <= BAND.high;
  const hardFlag = flags.some((f) => f.sev === "high");

  const evidenceGrade = EVIDENCE_GRADE[evidence];
  const realization = CRED_GRADE[cred];

  let completeness = "Finance-grade";
  const completenessNotes = [];
  if (hardFlag) { completeness = "Directional"; }
  else if (!guardrailOk) { completeness = "Directional"; completenessNotes.push(`cost basis sits outside the ${BAND.floor} to ${BAND.high}% plausible range`); }
  else if (!inBand) { completeness = "Planning-grade"; completenessNotes.push(`cost basis is inside the plausible range but outside the ${BAND.low} to ${BAND.high}% frontline planning band`); }
  if (!hardFlag && vacancyMode === "gross" && GRADE_RANK[completeness] > GRADE_RANK["Planning-grade"]) { completeness = "Planning-grade"; completenessNotes.push("gross vacancy costing carries a known double-count risk"); }

  /* The headline and the binding axis are computed by the shared grading layer and
     never here. gradeConfidence accepts an axes object only, so no property of the
     result can reach a grade. That is doctrine 5.5 enforced by construction rather
     than by review, and it is why a zero payback can no longer cap a grade. */
  const grades = { evidence: evidenceGrade, realization, completeness };
  const { headline: confidence, boundBy, boundAxes } = gradeConfidence(grades);

  const evidenceReason = evidence === "finance" ? "Finance-confirmed figures."
    : evidence === "hrdata" ? "Real HR figures, not yet confirmed by finance."
    : "Inputs are estimates or defaults. Replace them with real figures to raise this axis.";
  const realizationReason = realization === "Finance-grade" ? `"${mechName}" turns freed capacity into cash, so the savings can be booked once they are committed in the budget.`
    : realization === "Planning-grade" ? `"${mechName}" can be credited by finance over the budget cycle. Tie it to a budget action to book it.`
    : mech === 0 ? "No capacity action selected, so recovered capacity is worth $0 and only avoided cash applies."
    : `"${mechName}" absorbs freed capacity into growth and books no cash, so this is planning value only.`;
  const completenessReason = voided ? "The model failed an integrity check, so the export is void and carries no grade."
    : hardFlag ? "A high-severity flag is open: part of this model is corrected, untestable or routed to another tool. Resolve it first."
    : completenessNotes.length ? `Model is internally consistent, but ${completenessNotes.join(", and ")}.`
    : "The model is whole and internally consistent: every input is inside its possible range, the cost basis is inside the frontline planning band, and no value is routed out of the model.";
  const AXIS_REASON = { evidence: evidenceReason, realization: realizationReason, completeness: completenessReason };
  const why = `${confidence}, bound by ${boundBy}. ${boundAxes.map((a) => AXIS_REASON[a]).join(" ")}`;

  /* The object the report layer renders. A failed invariant voids the export and
     claims no grade at all, rather than grading it down: a document that
     contradicts itself is not a weakly evidenced document, it is not a document. */
  const gradeObj = voided
    ? voidResult({
        invariant: invariants.join(" "),
        remedy: "Correct the inputs named above and re-run before citing any figure on this page.",
      })
    : emitGrades({ evidence: evidenceGrade, realization, completeness, reasons: AXIS_REASON });

  const bookLabel = realization === "Finance-grade" ? "Bookable if committed" : realization === "Planning-grade" ? "Soft lever, tie it to a budget" : "Planning only";

  const cashRows = [
    { name: "Recruiting and screening", cost: recruiting, color: "#3B82F6" },
    { name: "Training (wages and trainer)", cost: training, color: "#8B5CF6" },
    ...(signOn > 0 ? [{ name: "Sign-on bonus", cost: signOn, color: "#0EA5E9" }] : []),
    { name: "Vacancy cover (overtime)", cost: vacancy, color: "#F97316" },
  ];
  const capRows = [
    { name: "Nesting productivity loss", cost: nestingLoss, color: "#EC4899" },
    { name: "Ramp-to-proficiency loss", cost: rampLoss, color: COLORS.red },
    { name: "Supervisor coaching burden", cost: supervisorBurden, color: COLORS.amber },
  ];

  const unbackfillSentence = unbackfilled <= 0
    ? `Every departure is replaced, so the full replacement cycle applies.`
    : downsizing
      ? `${unbackfilled} of your ${departures} departures a year are a deliberate reduction, so they carry no replacement cost. Confirm that is intended and is not a quiet hiring freeze.`
      : `${unbackfilled} of your ${departures} departures a year are not replaced under forced under-staffing. That has a real cost: you lose output you still need. This tool routes the value of that lost capacity to Staffing and Occupancy, where service-level and overtime effects can be modelled.`;

  const analystRead = voided
    ? `This export is void. ${invariants.join(" ")}\n\nAn impossible figure has no meaning, and grading it down would suggest it is merely uncertain. Correct the inputs listed in the corrections section and run it again. Quote nothing on this page until it clears.`
    : (hires === 0)
    ? (downsizing
        ? `At 0% backfill this model produces no replacement cost, because the center is not refilling departures. Here that is intended downsizing: ${departures} seats a year are shed on purpose, so there is no recruiting, training or ramp spend to recover, and early-washout waste is $0 because there are no new hires to wash out.\n\nConfirm the reduction is planned and is not a hiring freeze described as downsizing. If the demand those seats carried is still there, the exposure has moved from replacement cost to capacity, and that belongs in Staffing and Occupancy.\n\nThe per-refill economics above still hold as the cost you take on again the moment you resume backfilling: about ${fmt$(allInPerDeparture)} all-in per replaced agent, ${pctShort}. Read that as the price of reversing the reduction. It is not a current burden.`
        : `At 0% backfill this model produces no replacement cost, because the center is not replacing departures. Attrition still costs you here. With no hires there is no recruiting, training or ramp spend, so replacement burden and early-washout waste are both $0, but the economic exposure has not vanished. It has shifted.\n\nUnder forced under-staffing it moves to occupancy (the share of paid time agents spend handling contacts), service level, backlog, burnout and customer impact. None of that is a replacement cost, so this tool does not invent a dollar for it. It routes the case to Staffing and Occupancy, where lost output, overtime on the remaining team and SLA (service level agreement) breaches can be modelled. For the same reason completeness is held at Directional: the real cost sits in a model this calculator does not run.\n\nThe per-refill economics above remain valid as the cost you take on again the moment you resume hiring: about ${fmt$(allInPerDeparture)} all-in per replaced agent, ${pctShort}. A $0 replacement burden does not mean attrition is free.`)
    : `Attrition cost has several parts, and this read separates them. Replacing one frontline agent here costs about ${fmt$(allInPerDeparture)} all-in, ${pctClaim}, which sits ${salaryUnknown ? "outside the reach of the frontline band entirely, so the band cannot test it" : inBand ? `inside the frontline planning band of ${BAND.low} to ${BAND.high} percent, the plausibility check on the rest of the model` : pctSalary > 60 ? `above the frontline planning band of ${BAND.low} to ${BAND.high} percent. Complex or regulated centers can justify that, but validate the ramp, vacancy and training inputs before finance reviews it` : `below the frontline planning band of ${BAND.low} to ${BAND.high} percent. That points either to an efficient or offshore model or to understated inputs, so confirm which before relying on it`}.\n\nThat figure is today's cost burden. What you could save is modelled separately, below. About ${fmt$(cashPerDeparture)} is cash out the door: recruiting, training wages, sign-on and the overtime premium to cover the empty seat. The other ${fmt$(capacityPerDeparture)} is recovered capacity: nesting and ramp time you pay full wage for at partial output, plus supervisor coaching. Cash stops when a backfilled departure is avoided. Capacity becomes money only when leadership commits a capacity action. At ${backfillRate}% backfill, with the capacity action set to "${mechLabel}", that is why the realizable figures are smaller than the burden.\n\nBackfill matters here, because replacement cost exists only for seats you refill. ${unbackfillSentence}\n\nThe clearest recoverable line is early washout. ${earlyWashoutRate}% of your replacement hires, about ${earlyWashouts} a year, leave before reaching productive output, and the ${fmt$(earlyWaste)} of recruiting, screening, ${signOn > 0 ? "sign-on, " : ""}and training cash spent on them returns almost nothing. Because it is measured against hires, it can never exceed your replacement cash, which makes it a good place to start. A business case built on this keeps four things apart: what is cash, what is capacity, what you can realize, and the early-washout waste you can address first.`;

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
    bandLo, bandHi, band: BAND, inBand, guardrailOk, hardFlag,
    grades, gradeObj, confidence, boundAxes, boundBy,
    evidenceReason, realizationReason, completenessReason, completenessNotes, why,
    bookLabel, cashRows, capRows, unbackfillSentence, analystRead, railRead,
  };
}
/* @engine-end */

function Select({ label, value, onChange, opts, info, infoTitle, align }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} style={{ fontSize: 14, fontWeight: 600, color: HOUSE.mist, display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>{label}{info && <InfoDot text={info} title={infoTitle || label} align={align} />}</label>
      <select id={id} aria-label={typeof label === "string" ? label : undefined} value={value} onChange={e => onChange(e.target.value)} className="at-sel" style={{ width: "100%", minHeight: TOUCH, padding: "0 12px", fontSize: 15, fontWeight: 600, fontFamily: FONT, border: `1px solid ${alpha(HOUSE.mist, LINE.firm)}`, borderRadius: RADIUS.field, background: HOUSE.navy, color: HOUSE.mist }}>
        {opts.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
      </select>
    </div>
  );
}
const hair = alpha(HOUSE.mist, LINE.hair), soft = alpha(HOUSE.mist, LINE.soft);
const kicker = { fontSize: 12, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: HOUSE.muted };
const h2 = { fontSize: 18, fontWeight: 600, lineHeight: 1.3, color: HOUSE.mist, margin: "0 0 8px" };
const body = { fontSize: 15, lineHeight: 1.6, color: HOUSE.body, margin: 0 };
const small = { fontSize: 13, lineHeight: 1.5, color: HOUSE.muted, margin: 0 };
const link = { color: PILLARS.diagnostics.onDark, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 };
const grid = (min) => ({ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))`, gap: 12 });
const panel = { background: HOUSE.navy, border: `1px solid ${hair}`, borderRadius: RADIUS.card, padding: 20 };
const stat = { ...TYPE.statValue, fontSize: 24, color: HOUSE.mist, margin: "4px 0 2px" };
function LogoMark({ size = 34 }) {
  return <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity={.6} /><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity={.8} /><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" /><line x1="-14" y1="-14" x2="14" y2="14" stroke={LIGHT} strokeWidth="5.5" strokeLinecap="round" /><line x1="14" y1="-14" x2="-14" y2="14" stroke={LIGHT} strokeWidth="5.5" strokeLinecap="round" /></g></svg>;
}

/* The root-cause check (method 1.2): why agents leave, rated by the reader. It reads only its own answers, scores
   them with the one rubric engine and never touches the cost engine: no figure or grade above moves with it. It
   reports each driver's low answers as actions, with the tool that measures that driver, and no overall score. */
/* Scenario links carry the cost inputs and the root-cause answers; an older link without answers opens with none. */
const LINK_DEFAULTS = { ...DEFAULTS, drivers: {} };
const DRIVER_STEPS = ATTRITION_DRIVERS.dims.map((dm) => ({ id: dm.id, name: dm.name, qs: dm.criteria.map((c) => ({ q: c.text })) }));

export function DriverCheck({ answers, setAnswer, scored }) {
  const [current, setCurrent] = useState(0);
  const done = (id) => scored.dims.find((x) => x.id === id).complete;
  const finished = scored.dims.filter((x) => x.complete);
  return (
    <section aria-label="Why agents leave" style={{ ...panel, display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={h2}>Why are agents leaving?</h2>
        <p style={body}>Rate each statement for your operation, 1 if you disagree and 5 if you agree. A statement at 2 or below becomes an action, with the tool that measures that driver. Your answers change no figure and no grade above, and the check predicts no attrition rate.</p>
      </div>
      <StatementStep dims={DRIVER_STEPS} current={current} setCurrent={setCurrent} scores={answers}
        setScore={(dim, qi, v) => setAnswer(`${dim}-${qi}`, v)} done={done} complete={scored.complete}
        onResults={() => { try { document.getElementById("driver-results").scrollIntoView({ behavior: "smooth" }); } catch { /* no DOM */ } }}
        prompt="Answer for how the operation runs today." />
      <div id="driver-results" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <h3 style={{ ...h2, fontSize: 16 }}>What your answers point to</h3>
        {finished.length === 0 && <p style={small}>Answer every statement for a driver to see what it points to. Drivers are read one at a time and never averaged.</p>}
        {finished.map((x) => {
          const spec = ATTRITION_DRIVERS.dims.find((dm) => dm.id === x.id);
          const low = scored.checklist.filter((c) => c.dimension === x.id);
          return (
            <div key={x.id} style={{ padding: "12px 0", borderTop: `1px solid ${hair}` }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: HOUSE.mist }}>{x.name}</span>
              <p style={{ ...small, margin: "2px 0 6px" }}>{low.length ? `${low.length} of ${x.criteria.length} statements at 2 or below.` : `No statement at 2 or below.`}</p>
              {low.map((c) => <p key={c.criterion} style={{ ...body, margin: "4px 0" }}>{c.action}</p>)}
              {spec.next
                ? <a href={`/tools/${spec.next}`} style={link}>Measure it: {DRIVER_TOOL_NAMES[spec.next]}</a>
                : <p style={small}>{spec.nextNote} <a href={spec.read.href} style={link}>{spec.read.label}</a></p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

const AXIS_LABEL = { evidence: "Evidence", realization: "Realization", completeness: "Completeness" };

export default function AttritionCostCalculator() {
  const [d, setD] = useState(() => clone(DEFAULTS.d));
  const [pulled, setPulled] = useState({});
  const [fromLink, setFromLink] = useState(false);
  const [drivers, setDrivers] = useState({});
  const set = (k, v) => setD(p => ({ ...p, [k]: v }));

  useEffect(() => {
    // A scenario link is a deliberate act and outranks the ambient cross-tool pull.
    const sc = readScenario(TOOL_ID, LINK_DEFAULTS);
    if (sc) { setD(sc.d); setDrivers(sc.drivers && typeof sc.drivers === "object" ? sc.drivers : {}); setFromLink(true); clearScenarioParam(); return; }

    /* The external getter, which refuses this tool's own value. This tool publishes `agents`, so on a
       remount inside one session the plain read hands back this tool's own value and
       the PULLED badge asserts a provenance that does not exist. A value you published
       is not a value you sourced. Nothing here lifts a confidence axis either: a value
       arriving over the rail confers consistency, never evidence. */
    const pa = (getExternalWithSource("agents", TOOL_ID) || NO_RAIL);
    const ph = (getExternalWithSource("agentHourly", TOOL_ID) || NO_RAIL);
    const next = {}, badge = {};
    if (pa.value != null && !isNaN(pa.value) && pa.sourceTool && pa.sourceTool !== TOOL_ID) { next.agents = Math.round(pa.value); badge.agents = pa.sourceTool; }
    if (ph.value != null && !isNaN(ph.value) && ph.sourceTool && ph.sourceTool !== TOOL_ID) { next.avgSalary = Math.round(ph.value * 2080); badge.avgSalary = ph.sourceTool; }
    if (Object.keys(next).length) { setD(p => ({ ...p, ...next })); setPulled(badge); }
  }, []);

  const r = compute(d);
  const driverScore = scoreRubric(ATTRITION_DRIVERS, drivers);

  useEffect(() => {
    publishToolResult(TOOL_ID, normalizeForPublish({
      agents: r.agents, attritionRate: r.attritionRate / 100,
      attritionCashPerDeparture: Math.round(r.cashPerDeparture),
      attritionAllInPerDeparture: Math.round(r.allInPerDeparture),
      attritionAnnualReplBurden: Math.round(r.annualReplBurden),
      attritionUnbackfilled: r.unbackfilled,
      attritionVoided: r.voided,
      capacityAction: r.mechKey,
    }, { sourceTool: TOOL_ID }).clean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d]);

  const maxCost = Math.max(...r.cashRows.map(b => b.cost), ...r.capRows.map(b => b.cost), 1);
  const Bar = ({ b }) => (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr) 78px", gap: 12, alignItems: "center" }}>
      <span style={{ ...small, color: HOUSE.body }}>{b.name}</span>
      <div style={{ height: 16, background: hair, borderRadius: RADIUS.chip, overflow: "hidden" }}><div style={{ height: "100%", width: `${(Math.max(0, b.cost) / maxCost) * 100}%`, background: ARCS.evidence, borderRadius: RADIUS.chip, transition: "width 0.3s" }} /></div>
      <span style={{ fontSize: 14, fontWeight: 600, color: HOUSE.mist, textAlign: "right", ...NUM }}>{fmtK(b.cost)}</span>
    </div>
  );

  const statLg = { ...TYPE.statValueLg, color: "#fff" };
  const corrections = r.guards.map(g => `${g.label}: entered ${guardVal(g, "entered")}, computed at ${guardVal(g, "used")}.`);

  const stamp = methodStamp(TOOL_ID);
  const { how, voidReason } = resultHow(r.gradeObj);
  const result = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Result label="All-in cost per departure" value={voidReason ? null : r.allInPerDeparture} format={fmtK}
        change={voidReason ? null : `${fmtK(r.cashPerDeparture)} cash plus ${fmtK(r.capacityPerDeparture)} capacity, per refill. Range ${fmtK(r.allInLow)} to ${fmtK(r.allInHigh)}.`}
        how={how} voidReason={voidReason} />
      {!voidReason && (
        <div style={panel}>
          <span style={kicker}>Annual replacement burden</span>
          <div style={{ ...TYPE.statValueLg, fontSize: 29, color: HOUSE.mist, marginTop: 4 }}>{fmtK(r.annualReplBurden)}</div>
          <p style={{ ...small, marginTop: 4 }}>{fmtK(r.annualCashBurden)} cash + {fmtK(r.annualCapBurden)} capacity. {r.hires} of {r.departures} departures refilled. This is today's cost; only part of it is recoverable.</p>
        </div>
      )}
    </div>
  );

  return (
    <ToolFrame toolId={TOOL_ID} section="Cost + Economics" name="Attrition Cost" title="What does each agent departure cost you?"
      choice={r.unbackfilled > 0 && !r.downsizing ? "occupancy-risk" : null}
      lede={`The full cost of each agent departure, split into cash that leaves the business and capacity you recover only if you act on it. Replacement cost scales with how many departures you refill (backfill). Seats you do not refill are a capacity decision, and the tool never counts them as free. Results are checked against a ${BAND.low} to ${BAND.high}% of salary planning band for frontline roles, set by this platform.`}
      method={stamp ? { version: stamp.version, date: stamp.text.replace(/^Method [^,]+, published /, ""), href: stamp.href } : null}
      result={result} pinned={voidReason ? null : { label: "All-in per departure", value: fmtK(r.allInPerDeparture) }}>
      <style>{`${FONT_IMPORT_CSS}.at-sel option{background:${HOUSE.navy};color:${HOUSE.mist}}`}</style>
      <p style={small}>Every formula, constant and a worked example are in the <a href="/methodology/attrition-cost" style={link}>published method</a>.</p>

      <fieldset style={{ ...panel, margin: 0 }}>
        <legend style={{ ...kicker, padding: "0 6px" }}>Question 1 of 3 · Your operation</legend>
        <div style={grid(190)}>
          <NumField tone="dark" label="Total agents" value={d.agents} onChange={v => set("agents", v)} step={5} min={0} pulled={!!pulled.agents} />
          <NumField tone="dark" label="Annual attrition" value={d.attritionRate} onChange={v => set("attritionRate", v)} suffix="%" min={0} max={300} info={DEFS.denominator} infoTitle="Attrition denominator" hint="Separations over average headcount" />
          <NumField tone="dark" label="Average agent salary" value={d.avgSalary} onChange={v => set("avgSalary", v)} suffix="$/yr" step={1000} min={0} pulled={!!pulled.avgSalary} />
          <NumField tone="dark" label="Benefits load" value={d.benefitsLoadPct} onChange={v => set("benefitsLoadPct", v)} suffix="%" min={0} info={DEFS.benefitsLoad} infoTitle="Benefits load" />
        </div>
        <div style={{ ...grid(220), marginTop: 14 }}>
          <Select label="Backfill basis" value={d.backfillRate} onChange={v => set("backfillRate", Number(v))} opts={BACKFILL_OPTS} info={DEFS.backfill} infoTitle="Backfill basis" />
          <Select label="Seats not refilled are" value={r.unbackfillIntent} onChange={v => set("unbackfillIntent", v)} opts={INTENT_OPTS} info={DEFS.unbackfill} infoTitle="Seats not refilled" />
          <NumField tone="dark" label="Early washout (new hires)" value={d.earlyWashoutRate} onChange={v => set("earlyWashoutRate", v)} suffix="%" min={0} max={100} info={DEFS.early} infoTitle="Early washout rate" hint="Leave before reaching full output" />
        </div>
      </fieldset>

      <fieldset style={{ ...panel, margin: 0 }}>
        <legend style={{ ...kicker, padding: "0 6px", display: "flex", alignItems: "center", gap: 4 }}>Question 2 of 3 · Cash out the door<InfoDot text={DEFS.marginalCash} title="Cash out the door" /></legend>
        <div style={grid(190)}>
          <NumField tone="dark" label="Recruiting cost" value={d.recruitingCost} onChange={v => set("recruitingCost", v)} suffix="$" step={250} min={0} hint="Postings, agency, referral" />
          <NumField tone="dark" label="Screening hours" value={d.screeningHours} onChange={v => set("screeningHours", v)} suffix="hrs" min={0} />
          <NumField tone="dark" label="HR loaded rate" value={d.hrLoadedRate} onChange={v => set("hrLoadedRate", v)} suffix="$/hr" min={0} />
          <NumField tone="dark" label="Sign-on bonus" value={d.signOnBonus} onChange={v => set("signOnBonus", v)} suffix="$" step={250} min={0} hint="0 if none" />
          <NumField tone="dark" label="Training duration" value={d.trainingWeeks} onChange={v => set("trainingWeeks", v)} suffix="wks" min={0} />
          <NumField tone="dark" label="Trainer loaded rate" value={d.trainerLoadedRate} onChange={v => set("trainerLoadedRate", v)} suffix="$/hr" min={0} />
          <NumField tone="dark" label="Class size" value={d.classSize} onChange={v => set("classSize", v)} min={1} hint="Trainer cost is shared across the class" />
          <NumField tone="dark" label="Overtime premium" value={d.overtimePremium} onChange={v => set("overtimePremium", v)} suffix="%" min={0} hint="Above base wage" />
          <NumField tone="dark" label="Vacancy days" value={d.vacancyDays} onChange={v => set("vacancyDays", v)} suffix="days" min={0} />
          <NumField tone="dark" label="Vacancy covered by overtime" value={d.vacancyCoverageFraction} onChange={v => set("vacancyCoverageFraction", v)} suffix="%" min={0} max={100} />
          <Select label="Vacancy costing mode" value={r.vacancyMode} onChange={v => set("vacancyMode", v)} opts={VACANCY_OPTS} info={DEFS.vacancyMode} infoTitle="Vacancy costing mode" align="right" />
        </div>
      </fieldset>

      <fieldset style={{ ...panel, margin: 0 }}>
        <legend style={{ ...kicker, padding: "0 6px", display: "flex", alignItems: "center", gap: 4 }}>Question 3 of 3 · Capacity and opportunity<InfoDot text={DEFS.capacity} title="Capacity and cash" /></legend>
        <div style={grid(190)}>
          <NumField tone="dark" label="Nesting duration" value={d.nestingWeeks} onChange={v => set("nestingWeeks", v)} suffix="wks" min={0} info={DEFS.nesting} infoTitle="Nesting" />
          <NumField tone="dark" label="Nesting productivity" value={d.nestingProductivity} onChange={v => set("nestingProductivity", v)} suffix="%" min={0} max={100} hint="Of full output" />
          <NumField tone="dark" label="Ramp (after nesting)" value={d.rampMonths} onChange={v => set("rampMonths", v)} suffix="mo" min={0} info={DEFS.ramp} infoTitle="Ramp-to-proficiency" />
          <NumField tone="dark" label="Ramp productivity" value={d.rampProductivity} onChange={v => set("rampProductivity", v)} suffix="%" min={0} max={100} hint="Average, against a tenured agent" />
          <NumField tone="dark" label="Supervisor hours per new hire" value={d.supervisorHoursPerNew} onChange={v => set("supervisorHoursPerNew", v)} suffix="hrs" min={0} />
          <NumField tone="dark" label="Supervisor loaded rate" value={d.supLoadedRate} onChange={v => set("supLoadedRate", v)} suffix="$/hr" min={0} />
        </div>
        <div style={{ ...grid(240), marginTop: 14 }}>
          <Select label="Capacity action" value={r.mechKey} onChange={v => set("mech", v)} opts={MECH_OPTS} info={DEFS.mech} infoTitle="Capacity action" />
          <Select label="Input basis" value={r.evidence} onChange={v => set("evidence", v)} opts={EVIDENCE_OPTS} info={DEFS.confidence} infoTitle="Export confidence" align="right" />
        </div>
      </fieldset>

      {r.voided && (
        <Finding level="critical" title="Export void">{r.invariants.join(" ")} An impossible figure has no meaning. Correct the inputs and run it again, and quote nothing on this page until it clears.</Finding>
      )}

      {/* A void renders no figure: the notice above, the corrections and the inputs stay; every result is withheld. */}
      {!r.voided && (<>
      <div style={grid(170)}>
        <div style={panel}>
          <span style={kicker}>Cash per departure</span>
          <div style={stat}>{fmtK(r.cashPerDeparture)}</div>
          <p style={small}>Avoided when a refill is prevented</p>
        </div>
        <div style={panel}>
          <span style={kicker}>Capacity per departure</span>
          <div style={stat}>{fmtK(r.capacityPerDeparture)}</div>
          <p style={small}>Recovered only if you act</p>
        </div>
        <div style={panel}>
          <span style={{ ...kicker, display: "flex", alignItems: "center", gap: 4 }}>All-in per departure<InfoDot text={DEFS.sensitivity} title="Why a range" align="right" /></span>
          <div style={stat}>{fmtK(r.allInPerDeparture)}</div>
          <p style={{ ...small, ...NUM }}>range {fmtK(r.allInLow)} to {fmtK(r.allInHigh)} (+/-{Math.round(r.uncPct * 100)}%)</p>
          <p style={{ ...small, ...NUM }}>{r.salaryUnknown ? "salary not entered" : `${Math.round(r.pctSalary)}% of salary`} · per refill</p>
        </div>
      </div>

      <div style={grid(170)}>
        <div style={panel}>
          <span style={kicker}>Annual replacement burden</span>
          <div style={stat}>{fmtK(r.annualReplBurden)}</div>
          <p style={{ ...small, ...NUM }}>range {fmtK(r.annLow)} to {fmtK(r.annHigh)} (+/-{Math.round(r.uncPct * 100)}%)</p>
          <p style={{ ...small, ...NUM }}>{fmtK(r.annualCashBurden)} cash + {fmtK(r.annualCapBurden)} capacity · {r.hires} of {r.departures} departures refilled</p>
          <p style={{ ...small, marginTop: 4 }}>Today's cost. Only part of it is recoverable.</p>
        </div>
        <div style={{ ...panel, ...(r.unbackfilled > 0 && !r.downsizing ? { border: `1.5px solid ${HOUSE.mist}` } : {}) }}>
          <span style={kicker}>Seats not refilled</span>
          <div style={stat}>{r.unbackfilled}/yr</div>
          <p style={{ ...small, color: HOUSE.body }}>{r.unbackfilled === 0 ? "All departures refilled" : r.downsizing ? "Deliberate reduction, no replacement cost" : "Lost capacity, with a real cost"}</p>
          <p style={{ ...small, marginTop: 4 }}>{r.unbackfilled === 0 ? "Full replacement cycle applies." : r.downsizing ? "Confirm this is intended." : "Value the lost output in Staffing and Occupancy."}</p>
        </div>
        <div style={panel}>
          <span style={kicker}>Early-washout waste</span>
          <div style={stat}>{fmtK(r.earlyWaste)}</div>
          <p style={{ ...small, color: HOUSE.body }}>{r.earlyWashoutRate}% of replacement hires ({r.earlyWashouts}/yr) leave before reaching full output</p>
          <p style={{ ...small, marginTop: 4 }}>Part of the cash burden, and the most recoverable part.</p>
        </div>
      </div>
      </>)}

      {r.guards.length > 0 && (
        <Finding level="critical" title="Inputs corrected before calculation">
          {corrections.map((c, i) => <span key={i} style={{ display: "block", ...NUM }}>{c}</span>)}
          <span style={{ display: "block", marginTop: 6 }}>Every figure in this report was computed on the corrected values.</span>
        </Finding>
      )}

      <section aria-label="How sure" style={panel}>
        <span style={kicker}>How sure</span>
        <div style={{ ...grid(150), margin: "12px 0" }}>
          {AXES.map((a) => (
            <div key={a} style={{ borderRadius: RADIUS.field, border: `1px solid ${hair}`, padding: "10px 12px" }}>
              <div style={kicker}>{AXIS_LABEL[a]}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: HOUSE.mist }}>{r.voided ? "Void" : r.grades[a]}</div>
            </div>
          ))}
        </div>
        <p style={{ ...body, fontSize: 14 }}>The headline is the weakest of the three axes: {r.voided ? "Void" : r.confidence}. <strong style={{ color: HOUSE.mist }}>Bound by {r.boundBy}.</strong> <strong style={{ color: HOUSE.mist }}>Evidence:</strong> {r.evidenceReason} <strong style={{ color: HOUSE.mist }}>Realization:</strong> {r.realizationReason} <strong style={{ color: HOUSE.mist }}>Completeness:</strong> {r.completenessReason}</p>
        <p style={{ ...small, ...NUM, marginTop: 8 }}>Frontline planning band is {r.band.low} to {r.band.high}% of salary ({fmtK(r.bandLo)} to {fmtK(r.bandHi)} here), a check set by this platform. This result is {r.voided ? "void, so it is not tested against the band" : r.salaryUnknown ? "untestable, because no salary was entered" : `${Math.round(r.pctSalary)}%, ${fmtK(r.allInPerDeparture)}, ${r.guardrailOk ? "within the band" : r.pctSalary > r.band.high ? "above the band, so validate the inputs" : "below the band, so validate the inputs"}`}.</p>
      </section>

      {!r.voided && (<>
      <section aria-label="Where the cost comes from" style={panel}>
        <div style={grid(260)}>
          <div><h2 style={h2}>Cash out the door</h2><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{r.cashRows.map((b, i) => <Bar key={i} b={b} />)}</div></div>
          <div><h2 style={h2}>Capacity and opportunity</h2><div style={{ display: "flex", flexDirection: "column", gap: 8 }}>{r.capRows.map((b, i) => <Bar key={i} b={b} />)}</div></div>
        </div>
      </section>

      <section aria-label="Realizable value" style={panel}>
        <h2 style={h2}>Realizable value if you reduce attrition</h2>
        <p style={{ ...small, marginBottom: 12 }}>Cash counts in full and capacity at {Math.round(r.mech * 100)}% under the chosen capacity action, both scaled to {r.backfillRate}% backfill. These are the figures you could realize; the burden above is today's cost.{!r.downsizing && r.unbackfilled > 0 ? " Under forced under-staffing, agents you keep also carry capacity value; see Staffing." : ""}{r.downsizing ? " Under intended downsizing, keeping agents slows your planned reduction, so this credits only the replacement cost avoided on seats you would refill. It is not a net headcount saving." : ""}</p>
      </section>
      </>)}
      <div style={{ maxWidth: 320 }}>
        <NumField tone="dark" label="Cost to achieve (per point, a year)" value={d.costPerPoint} onChange={v => set("costPerPoint", v)} suffix="$" step={5000} min={0} info={DEFS.costToAchieve} infoTitle="Cost to achieve: the net view" hint={r.costPerPoint > 0 ? "Cards show savings net of this spend" : "At 0 the cards show gross"} />
      </div>
      {!r.voided && (<>
      <div style={grid(160)}>
        {r.scenarios.map((s, i) => (
          <div key={i} style={{ ...panel, ...(r.costPerPoint > 0 && s.net < 0 ? { border: `1.5px solid ${HOUSE.mist}` } : {}) }}>
            <span style={kicker}>-{s.redPts} pts to {s.newRate}%</span>
            {r.costPerPoint > 0 ? (<>
              <div style={stat}>{fmtK(s.net)}</div>
              <p style={small}>net a year{s.net < 0 ? ", a loss" : ""}</p>
              <p style={{ ...small, ...NUM, marginTop: 4 }}>{fmtK(s.total)} gross less {fmtK(s.achieveCost)} cost<br />{s.roi != null ? `${s.roi.toFixed(1)}x return · ` : ""}{s.avoided} fewer departures</p>
            </>) : (<>
              <div style={stat}>{fmtK(s.total)}</div>
              <p style={small}>realizable a year</p>
              <p style={{ ...small, ...NUM, marginTop: 4 }}>{fmtK(s.cash)} cash avoided + {fmtK(s.cap)} capacity value<br />{s.avoided} fewer departures</p>
            </>)}
            <p style={{ ...small, fontWeight: 600, color: HOUSE.mist, marginTop: 6 }}>{r.bookLabel}</p>
          </div>
        ))}
      </div>

      {r.flags.length > 0 && (
        <section aria-label="Integrity checks" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={h2}>Integrity checks</h2>
          {r.flags.map((f, i) => <Finding key={i} level={f.sev === "high" ? "high" : "unknown"} title={f.sev === "high" ? "Check this" : "Note"}>{f.t}</Finding>)}
        </section>
      )}

      <section aria-label="What it means" style={{ ...panel, borderLeft: `3px solid ${PILLARS.diagnostics.fill}` }}>
        <span style={kicker}>What it means</span>
        {r.analystRead.split("\n\n").map((para, i) => <p key={i} style={{ ...body, margin: i ? "10px 0 0" : "8px 0 0" }}>{para}</p>)}
      </section>
      </>)}

      <DriverCheck answers={drivers} setAnswer={(k, v) => setDrivers((p) => ({ ...p, [k]: v }))} scored={driverScore} />

      <HowOthersReport toolId={TOOL_ID} />
      {/* The report is paper (Brand Guide section 13). */}
      <div style={{ background: HOUSE.paper, color: HOUSE.paperInk, borderRadius: RADIUS.card, padding: "8px 20px 20px" }}>
          <ReportActions
            next={r.unbackfilled > 0 && !r.downsizing ? { to: "occupancy-risk", because: "Seats you do not refill under forced under-staffing are lost capacity that this tool does not price. Occupancy Risk shows what the extra load does to the agents who remain." } : null}
            toolId={TOOL_ID}
            toolName="Attrition Cost Analysis"
            subtitle={`Total Cost of Agent Turnover. ${r.voided ? "Void: an integrity check failed" : `${r.confidence}, bound by ${r.boundBy}`}`}
            routePath={ROUTE}
            state={{ d, drivers }}
            defaults={LINK_DEFAULTS}
            grades={r.gradeObj}
            summary={r.voided ? [{ label: "Export", value: "Void: an integrity check failed, so no figure is reported" }] : [
              { label: "Cash per departure", value: fmt$(r.cashPerDeparture) },
              { label: "All-in per departure", value: fmt$(r.allInPerDeparture) },
              { label: "Annual replacement burden", value: fmt$(r.annualReplBurden) },
              { label: "Early-washout waste", value: fmt$(r.earlyWaste) },
            ]}
            signals={{
              /* Severity is the annual separation rate read against a full
                 turnover of the frontline: 35% lands moderate, 50 to 70% high,
                 75% and above severe. The denominator is 100% of headcount, a
                 real quantity rather than a chosen anchor.

                 The dollar burden was measured as the numerator first and
                 rejected. Annual replacement burden over loaded frontline
                 payroll runs 0.027 at 8% attrition and 0.317 at 95%, so it never
                 leaves the bottom two bands: a center replacing its whole staff
                 twice a year would publish the same word as a healthy one, and
                 three of five bands would be unreachable in practice. It also
                 reads exactly zero at 0% backfill, which is the case where the
                 center is emptying fastest and this model deliberately routes
                 the cost to Staffing rather than pricing it. A band that goes
                 quiet there would be worse than no band.

                 A void export has produced an impossible figure, not a mild one,
                 so the key is omitted rather than published as a confident
                 reading of a model that failed its own invariant. */
              ...(r.voided ? {} : { severity: severityBucket(r.attritionRate / 100) }),
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
            /* A void publishes no figure (doctrine 5.4): the document keeps the void notice,
               the corrected inputs, the method and the next steps, and nothing computed. */
            sections={[
              ...(r.voided ? [{ title: "Export Void", type: "findings", items: [...r.invariants, "An impossible figure has no meaning. Correct the inputs and run it again. Cite nothing in this document until it clears."] }] : []),
              ...(r.guards.length ? [{ title: "Inputs Corrected Before Calculation", type: "findings", items: [...corrections, "Every figure in this document was computed on the corrected values."] }] : []),
              /* The three axes are NOT restated here. ReportActions injects one standard
                 Confidence section from the `grades` prop, so nine tools cannot drift into
                 nine wordings of the same idea. What stays here is the evidence detail only
                 this tool can supply. */
              { title: "Evidence Detail", type: "findings", items: [
                `Backfill basis: ${r.backfillRate}% of departures replaced (${r.hires} of ${r.departures}). Replacement cost scales with this. ${r.unbackfilled} un-backfilled seats are ${r.downsizing ? "a deliberate reduction with no replacement cost" : "lost capacity with a real cost, routed to Staffing and Occupancy and never priced at zero"}.`,
                `Vacancy costing: ${r.vacancyMode === "gross" ? "Gross coverage spend (full overtime cost), which overstates incremental cost unless the vacant seat's stopped payroll is credited elsewhere. Incremental (overtime premium only) is the default." : "Incremental, overtime premium only (the default)."}`,
                r.salaryUnknown
                  ? `Cost basis: ${fmt$(r.allInPerDeparture)} all-in, but average salary was not entered, so the ${r.band.low} to ${r.band.high}% frontline planning band cannot test it. That band is the plausibility check on the rest of the model.`
                  : `Cost basis: ${Math.round(r.pctSalary)}% of salary (${fmt$(r.allInPerDeparture)}, planning range ${fmt$(r.allInLow)} to ${fmt$(r.allInHigh)} at +/-${Math.round(r.uncPct * 100)}%) versus the ${r.band.low} to ${r.band.high}% frontline planning band of ${fmt$(r.bandLo)} to ${fmt$(r.bandHi)}. ${r.guardrailOk ? "Within the plausible range." : "Outside the plausible range. Verify inputs before citing."}`,
              ]},
              ...(r.flags.length > 0 ? [{ title: "Integrity Flags", type: "findings", items: r.flags.map(f => `${f.sev === "high" ? "[FLAG] " : "[NOTE] "}${f.t}`) }] : []),
              { title: "Cost Per Replaced Departure", type: "table", rows: [
                ["Recruiting and screening (cash)", fmt$(r.recruiting)],
                ["Training: wages and trainer (cash)", fmt$(r.training)],
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
                `At ${r.backfillRate}% backfill, ${r.hires} of ${r.departures} departures are refilled, for an annual replacement burden of ${fmt$(r.annualReplBurden)} (${fmt$(r.annualCashBurden)} cash). This is today's cost. The recoverable share is in the realizable figures.`,
                r.unbackfilled > 0 ? `${r.unbackfilled} departures a year are not refilled. ${r.downsizing ? "They are treated as a deliberate reduction with no replacement cost." : "This is lost capacity and it has a real cost. Quantify the output and service-level impact in Staffing and Occupancy."}` : `All departures are refilled, so the full replacement cycle applies.`,
                `${r.earlyWashoutRate}% of replacement hires leave before reaching full output, wasting about ${fmt$(r.earlyWaste)} of recruiting, screening, ${r.signOn > 0 ? "sign-on, " : ""}and training cash. This is part of the cash burden and the most recoverable part.`,
                r.costPerPoint > 0
                  ? `Cutting attrition by 5 points models ${fmt$(r.scenarios[0].total)} gross. Net of the ${fmt$(r.scenarios[0].achieveCost)} it costs to achieve, that is ${fmt$(r.scenarios[0].net)}${r.scenarios[0].roi != null ? ` (${r.scenarios[0].roi.toFixed(1)}x return)` : ""}. Bookability: ${r.bookLabel.toLowerCase()}. Take the net figure to budget.`
                  : `Cutting attrition by 5 points models ${fmt$(r.scenarios[0].total)} realizable gross (${fmt$(r.scenarios[0].cash)} cash avoided plus ${fmt$(r.scenarios[0].cap)} capacity value), limited by backfill and the capacity action. Bookability: ${r.bookLabel.toLowerCase()}. It counts toward EBITDA (earnings before interest, taxes, depreciation and amortization) only when tied to a budget action, and it is shown before the cost of achieving the reduction.`,
              ]},
              ...(driverScore.dims.some((x) => x.complete) ? [{ title: "Why Agents Leave: Your Answers", type: "findings", items: [
                ...driverScore.dims.filter((x) => x.complete).flatMap((x) => {
                  const spec = ATTRITION_DRIVERS.dims.find((dm) => dm.id === x.id);
                  const low = driverScore.checklist.filter((c) => c.dimension === x.id);
                  return [
                    `${x.name}: ${low.length ? `${low.length} of ${x.criteria.length} statements at 2 or below` : "no statement at 2 or below"}. ${spec.next ? `Measure it with the ${DRIVER_TOOL_NAMES[spec.next]}.` : spec.nextNote}`,
                    ...low.map((c) => `Action (${x.name}): ${c.action}`),
                  ];
                }),
                "These answers are how the person answering sees the operation. They change no figure or grade in this report and predict no attrition rate.",
              ]}] : []),
              { title: "Methodology", type: "findings", items: [
                `Cost model: each replaced departure = cash (recruiting, screening, ${r.signOn > 0 ? "sign-on, " : ""}training wages, trainer, vacancy overtime) + capacity (nesting and ramp productivity loss, supervisor coaching). Capacity is recovered time, credited only through a capacity action (the realization mechanism).`,
                `Capacity realization: "${r.mechName}" credits ${Math.round(r.mech * 100)}% of freed capacity, read from the shared platform capacity-action table, so each action means the same thing in every tool. Credit class ${r.cred}${r.voided ? "" : `, which sets the realization axis at ${r.grades.realization}`}. Cash out the door is never scaled by this factor.`,
                `Plausibility check: the ${r.band.low} to ${r.band.high}% of salary frontline band is a planning check set by this platform. No published study sets it. Where you have your own replacement-cost history, use that instead. The full method, with every formula, constant and a worked example, is published at contactcentercx.com/methodology/attrition-cost.`,
                `Confidence: three named axes. Evidence is where the inputs came from. Realization is whether the modelled benefit converts to cash, read from the shared credit class. Completeness is whether the model is whole and internally consistent. The headline is the weakest of the three, and the rationale names the binding axis. A failed integrity check voids the export and assigns no grade, because an impossible figure carries no meaning.${r.guards.length ? ` INPUTS CORRECTED: ${corrections.join(" ")} Every figure above was computed on the corrected values.` : ""}`,
              ]},
            ].filter((sec) => !r.voided || ["Export Void", "Inputs Corrected Before Calculation", "Methodology", "Next Steps"].includes(sec.title))}
          />

      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Button kind="secondary" href="/tools/occupancy-risk">Occupancy Risk Simulator</Button>
      </div>
    </ToolFrame>
  );
}

/* The scenario-link defaults, exported for the live checker and the visual audit. */
export { LINK_DEFAULTS as DEFAULTS };
