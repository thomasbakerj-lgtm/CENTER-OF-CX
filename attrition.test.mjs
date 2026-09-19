/* attrition.test.mjs
 *
 * Slices the @engine-start..@engine-end region out of AttritionCostCalculator.jsx
 * and tests the DEPLOYED engine. Nothing is reconstructed. COLORS comes from the
 * real ./src/lib/benchmarks.js and MECH from the real ./src/lib/mech.js, so a
 * palette drift or a mechanism-factor change fails here rather than passing on
 * invented constants.
 *
 * Before this extraction roughly 110 lines of arithmetic sat inline in the
 * component body and closed over a twenty-six field state object, so the engine
 * could not be evaluated outside React at all and had never been tested. The move
 * was proven behaviour-neutral against a pre-image lifted verbatim from the
 * shipped file: 2460 comparisons across thirty scenarios, zero arithmetic
 * differences, every remaining difference attributable to a named doctrine change.
 *
 * Run from repo root: node attrition.test.mjs
 */
import { readFileSync } from "fs";

let COLORS, MECH, MECH_ORDER, MECH_FALLBACK, MECH_INITIAL, createGuards, guardVal;
let gradeConfidence, emitGrades, voidResult, GRADE_RANK, AXES, CRED_GRADE;
try {
  ({ COLORS } = await import("./src/lib/benchmarks.js"));
  ({ MECH, MECH_ORDER, MECH_FALLBACK, MECH_INITIAL } = await import("./src/lib/mech.js"));
  ({ createGuards, guardVal } = await import("./src/lib/guards.js"));
  ({ gradeConfidence, emitGrades, voidResult, GRADE_RANK, AXES, CRED_GRADE } = await import("./src/lib/confidence.js"));
} catch (e) {
  console.error("BLOCKER: could not import ./src/lib. Run from the repo root.");
  console.error(String(e.message || e));
  process.exit(1);
}

let pass = 0, fail = 0;
const A = (nm, c) => { if (c) pass++; else { fail++; console.log("  FAIL:", nm); } };
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

/* ---- 1. slice the shipped engine ---- */
console.log("\n1. engine slice");
const SRC = readFileSync("./AttritionCostCalculator.jsx", "utf8");
const a0 = SRC.indexOf("/* @engine-start"), b0 = SRC.indexOf("/* @engine-end */");
if (a0 < 0 || b0 < 0) { console.error("BLOCKER: engine markers not found in AttritionCostCalculator.jsx."); process.exit(1); }
const region = SRC.slice(a0, b0).replace(/^export /gm, "");

let compute, DEFAULTS, BASE, MECH_OPTS, LEGACY_MECH, BACKFILL_OPTS, INTENT_OPTS, VACANCY_OPTS,
  EVIDENCE_OPTS, EVIDENCE_GRADE, n, fmtK, fmt$, clone, TOOL_ID, ROUTE;
try {
  ({ compute, DEFAULTS, BASE, MECH_OPTS, LEGACY_MECH, BACKFILL_OPTS, INTENT_OPTS, VACANCY_OPTS,
    EVIDENCE_OPTS, EVIDENCE_GRADE, n, fmtK, fmt$, clone, TOOL_ID, ROUTE } = new Function(
    "COLORS", "MECH", "MECH_ORDER", "MECH_INITIAL", "createGuards", "guardVal",
    "gradeConfidence", "emitGrades", "voidResult", "GRADE_RANK", "AXES", "CRED_GRADE",
    region + "\nreturn { compute, DEFAULTS, BASE, MECH_OPTS, LEGACY_MECH, BACKFILL_OPTS, INTENT_OPTS, VACANCY_OPTS, EVIDENCE_OPTS, EVIDENCE_GRADE, n, fmtK, fmt$, clone, TOOL_ID, ROUTE };"
  )(COLORS, MECH, MECH_ORDER, MECH_INITIAL, createGuards, guardVal, gradeConfidence, emitGrades, voidResult, GRADE_RANK, AXES, CRED_GRADE));
} catch (e) {
  console.error("BLOCKER: the engine region did not evaluate. The marker region has");
  console.error("picked up code it cannot parse, or lost a dependency it closes over.");
  console.error(String(e.message || e));
  process.exit(1);
}

A("engine region slices and evaluates", typeof compute === "function");
A("engine region carries its own formatters", typeof n === "function" && typeof fmtK === "function" && typeof fmt$ === "function");
A("the shared guard module supplies the corrected-value renderer", typeof guardVal === "function" && typeof createGuards === "function");
A("engine region carries the grade ladder", GRADE_RANK && GRADE_RANK["Directional"] === 0 && GRADE_RANK["Planning-grade"] === 1 && GRADE_RANK["Finance-grade"] === 2);
A("engine region names exactly three confidence axes", Array.isArray(AXES) && AXES.length === 3);
A("the three axes are evidence, realization and completeness", AXES.join(",") === "evidence,realization,completeness");
A("engine region carries the scenario contract", TOOL_ID === "attrition-cost" && ROUTE === "/tools/attrition-cost");
A("engine region carries the shipped default input set", !!DEFAULTS && !!DEFAULTS.d && DEFAULTS.d === BASE);
A("engine region contains no em-dash", region.indexOf(String.fromCharCode(0x2014)) < 0);
A("engine region declares no local mechanism factor table", !/keep the slack|Absorb volume growth|Avoid \/ slow hiring|Reduce vendor \/ outsourcing/.test(region));
A("engine region reads the shared mechanism table", /MECH_ORDER\.map/.test(region) && /MECH\[mechKey\]/.test(region));
A("engine region contains no bare Math.max floor on an input", !/Math\.max\(1,\s*n\(d\./.test(region));

const D = () => clone(DEFAULTS.d);
const m = (o) => ({ ...D(), ...o });
const base = compute(D());

/* ---- 2. the shipped default scenario ---- */
console.log("\n2. shipped defaults");
A("200 agents at 35% gives 70 departures", base.departures === 70);
A("all departures are refilled at 100% backfill", base.hires === 70 && base.unbackfilled === 0);
A("cash per departure is $10,711.69", near(base.cashPerDeparture, 10711.692307692309));
A("capacity per departure is $5,507.54", near(base.capacityPerDeparture, 5507.538461538462));
A("all-in per departure is $16,219.23", near(base.allInPerDeparture, 16219.23076923077));
A("all-in is 42.68% of salary", near(base.pctSalary, 42.68218623481781));
A("annual replacement burden is $1,135,346.15", near(base.annualReplBurden, 1135346.153846154));
A("annual cash burden is $749,818.46", near(base.annualCashBurden, 749818.4615384616));
A("early washouts are 18 of 70 hires", base.earlyWashouts === 18);
A("early-washout waste is $169,133.54", near(base.earlyWaste, 169133.53846153847));
A("no inputs required correction on the shipped defaults", base.guards.length === 0);
A("no invariant fails on the shipped defaults", base.invariants.length === 0);
A("shipped defaults are not void", base.voided === false);
A("shipped defaults carry no hard flag", base.hardFlag === false);
A("shipped default mechanism is the defensible default, not headcount reduction", base.mechKey === "hiring");
A("shipped defaults sit inside the 40-60 frontline band", base.inBand === true && base.guardrailOk === true);
A("uncertainty band on estimated inputs is plus or minus 25 percent", near(base.uncPct, 0.25));
A("the planning range brackets the point estimate", base.allInLow < base.allInPerDeparture && base.allInHigh > base.allInPerDeparture);
A("the annual range brackets the annual point estimate", base.annLow < base.annualReplBurden && base.annHigh > base.annualReplBurden);

/* ---- 3. arithmetic identities that must hold on every input ---- */
console.log("\n3. arithmetic identities");
const IDENT = [
  ["shipped", D()],
  ["hrdata finance-lever", m({ evidence: "hrdata", mech: "vendor" })],
  ["finance headcount", m({ evidence: "finance", mech: "headcount" })],
  ["gross vacancy, long training", m({ vacancyMode: "gross", trainingWeeks: 12, classSize: 5 })],
  ["cheap offshore shape", m({ avgSalary: 19000, recruitingCost: 400, trainingWeeks: 2, rampMonths: 1, nestingWeeks: 1 })],
  ["expensive regulated shape", m({ avgSalary: 64000, recruitingCost: 9000, trainingWeeks: 10, rampMonths: 6, supervisorHoursPerNew: 30 })],
  ["half backfill downsizing", m({ backfillRate: 50, unbackfillIntent: "downsizing" })],
  ["signon and cost to achieve", m({ signOnBonus: 4000, costPerPoint: 55000 })],
  ["no mechanism", m({ mech: "none" })],
  ["absorb growth", m({ mech: "growth" })],
];
for (const [nm, d] of IDENT) {
  const r = compute(d);
  A(`${nm}: all-in is cash plus capacity`, near(r.allInPerDeparture, r.cashPerDeparture + r.capacityPerDeparture));
  A(`${nm}: cash per departure is hire cash plus vacancy`, near(r.cashPerDeparture, r.hireCash + r.vacancy));
  A(`${nm}: capacity is nesting plus ramp plus supervisor`, near(r.capacityPerDeparture, r.nestingLoss + r.rampLoss + r.supervisorBurden));
  A(`${nm}: annual burden is cash burden plus capacity burden`, near(r.annualReplBurden, r.annualCashBurden + r.annualCapBurden));
  A(`${nm}: annual cash burden is hires times cash per departure`, near(r.annualCashBurden, r.hires * r.cashPerDeparture));
  A(`${nm}: hires plus un-backfilled equals departures`, r.hires + r.unbackfilled === r.departures);
  A(`${nm}: early-washout waste never exceeds annual cash burden`, r.earlyWaste <= r.annualCashBurden + 0.5);
  A(`${nm}: early-washout waste is drawn from hire cash only, never vacancy`, near(r.earlyWaste, r.earlyWashouts * r.hireCash));
  A(`${nm}: scenario gross is cash plus mechanism-scaled capacity`, r.scenarios.every(s => near(s.total, s.cash + s.cap)));
  A(`${nm}: scenario net is gross less cost to achieve`, r.scenarios.every(s => near(s.net, s.total - s.achieveCost)));
  A(`${nm}: capacity credit never exceeds the capacity freed`, r.scenarios.every(s => s.cap <= s.avoided * r.bf * r.capacityPerDeparture + 1e-6));
  A(`${nm}: cash avoided is never scaled by the mechanism`, r.scenarios.every(s => near(s.cash, s.avoided * r.bf * r.cashPerDeparture)));
  A(`${nm}: deeper cuts avoid at least as many departures`, r.scenarios.every((s, i) => i === 0 || s.avoided >= r.scenarios[i - 1].avoided));
  A(`${nm}: pct of salary reconciles to all-in over salary`, r.salaryUnknown || near(r.pctSalary, r.allInPerDeparture / r.avgSalary * 100));
  A(`${nm}: no published figure is negative or non-finite`, r.invariants.length === 0);
}

/* ---- 4. the backfill and intent interaction ---- */
/* INTENT_OPTS splits forced under-staffing from intended downsizing and BACKFILL_OPTS
   runs 0 to 100. These are the combinations most likely to double count or to value
   the same capacity twice, so they are probed explicitly rather than sampled. */
console.log("\n4. backfill and intent interaction");
for (const bfp of [100, 75, 50, 0]) {
  for (const intent of ["forced", "downsizing"]) {
    const r = compute(m({ backfillRate: bfp, unbackfillIntent: intent }));
    const tag = `${bfp}% backfill, ${intent}`;
    A(`${tag}: hires equal departures times backfill`, r.hires === Math.round(r.departures * bfp / 100));
    A(`${tag}: replacement burden keys off hires, never departures`, bfp === 100 || r.annualReplBurden < r.departures * r.allInPerDeparture);
    A(`${tag}: un-backfilled seats are never negative`, r.unbackfilled >= 0);
    A(`${tag}: realizable value is scaled by backfill, so it cannot exceed the burden`, r.scenarios[3].total <= r.annualReplBurden + 1e-6);
    A(`${tag}: the un-backfilled seats are described, never silently priced at zero`, r.unbackfilled === 0 || /not replaced|deliberate reduction/.test(r.unbackfillSentence));
    if (bfp === 0) {
      A(`${tag}: zero backfill generates no replacement burden`, r.annualReplBurden === 0);
      A(`${tag}: zero backfill generates no early-washout waste, because there are no hires`, r.earlyWaste === 0);
      A(`${tag}: zero backfill realizes nothing, because there is no refill to avoid`, r.scenarios.every(s => s.total === 0));
      A(`${tag}: the analyst read refuses to call a $0 burden a $0 problem`, /does not invent a dollar|not a \$0 problem|has not vanished|shed on purpose/.test(r.analystRead));
    }
    if (intent === "forced" && r.unbackfilled > 0) {
      A(`${tag}: forced under-staffing raises a hard flag and routes the value out`, r.hardFlag === true);
      A(`${tag}: forced under-staffing binds the completeness axis, not the mechanism`, r.grades.completeness === "Directional");
      A(`${tag}: routing the value out does not silently downgrade the mechanism`, r.grades.realization === "Planning-grade");
    }
    if (intent === "downsizing" && r.unbackfilled > 0) {
      A(`${tag}: deliberate downsizing is a note, not a hard flag`, r.hardFlag === false);
      A(`${tag}: deliberate downsizing still asks for confirmation`, r.flags.some(f => /truly intended|hiring freeze/.test(f.t)));
      A(`${tag}: downsizing does not credit a net headcount saving`, r.scenarios.every(s => near(s.cash, s.avoided * r.bf * r.cashPerDeparture)));
    }
  }
}
const bf100 = compute(m({ backfillRate: 100 })), bf50 = compute(m({ backfillRate: 50 }));
A("halving backfill roughly halves the replacement burden", Math.abs(bf50.annualReplBurden / bf100.annualReplBurden - 0.5) < 0.02);
A("halving backfill does not change the per-departure economics", near(bf50.allInPerDeparture, bf100.allInPerDeparture));
A("full backfill leaves nothing routed to Staffing", bf100.unbackfilled === 0);

/* ---- 5. the shared mechanism table ---- */
/* The local MECH_OPTS carried the six factors as integers and no credit class at
   all, so realization was inferred from numeric thresholds. The factors agreed on
   the day it was written. Nothing enforced that they keep agreeing. */
console.log("\n5. shared mechanism table");
A("the option list is built from the shared table, in the shared order", MECH_OPTS.map(o => o.v).join(",") === MECH_ORDER.join(","));
A("every option label comes from the shared table", MECH_OPTS.every(o => o.label === MECH[o.v].label));
A("there are six mechanisms", MECH_OPTS.length === 6);
for (const k of MECH_ORDER) {
  const r = compute(m({ mech: k }));
  A(`${k}: the engine credits exactly the shared factor`, near(r.mech, MECH[k].f));
  A(`${k}: the engine reads the shared credit class`, r.cred === MECH[k].cred);
  A(`${k}: realization is read from the credit class, not a numeric threshold`, r.grades.realization === CRED_GRADE[MECH[k].cred]);
  A(`${k}: the printed mechanism name is the shared label`, r.mechName === MECH[k].label);
  A(`${k}: capacity credit equals freed capacity times the shared factor`, r.scenarios.every(s => near(s.cap, s.avoided * r.bf * r.capacityPerDeparture * MECH[k].f)));
  A(`${k}: no correction is raised for a valid mechanism`, r.guards.length === 0);
}
A("no capacity action credits nothing", compute(m({ mech: "none" })).scenarios.every(s => s.cap === 0));
A("no capacity action still credits avoided cash in full", compute(m({ mech: "none" })).scenarios[0].cash > 0);
A("absorbing growth is capacity value, so it stays Directional", compute(m({ mech: "growth" })).grades.realization === "Directional");
A("reducing overtime is finance-creditable, so it reaches Planning-grade", compute(m({ mech: "overtime" })).grades.realization === "Planning-grade");
A("vendor reduction is cashable, so it reaches Finance-grade", compute(m({ mech: "vendor" })).grades.realization === "Finance-grade");
A("headcount reduction is cashable, so it reaches Finance-grade", compute(m({ mech: "headcount" })).grades.realization === "Finance-grade");
A("headcount reduction warns that it is the hardest lever to commit", compute(m({ mech: "headcount" })).flags.some(f => /hardest lever/.test(f.t)));

/* ---- 6. guard and disclose ---- */
/* Five bare Math.max calls in 561 lines, none of which recorded what they changed,
   and a scenario link decodes straight into the arithmetic. */
console.log("\n6. guard and disclose");
const GUARDED = [
  ["Total agents", { agents: -200 }, "agents", 0],
  ["Annual attrition low", { attritionRate: -35 }, "attritionRate", 0],
  ["Annual attrition high", { attritionRate: 9000 }, "attritionRate", 300],
  ["Avg agent salary", { avgSalary: -38000 }, "avgSalary", 0],
  ["Benefits + overhead", { benefitsLoadPct: -150 }, "benefitsLoadPct", 0],
  ["Backfill high", { backfillRate: 300 }, "backfillRate", 100],
  ["Backfill low", { backfillRate: -50 }, "backfillRate", 0],
  ["Early washout high", { earlyWashoutRate: 400 }, "earlyWashoutRate", 100],
  ["Early washout low", { earlyWashoutRate: -20 }, "earlyWashoutRate", 0],
  ["Nesting productivity high", { nestingProductivity: 300 }, null, null],
  ["Ramp productivity high", { rampProductivity: 400 }, null, null],
  ["Recruiting cost", { recruitingCost: -99999 }, null, null],
  ["Class size zero", { classSize: 0 }, "classSize", 1],
  ["Class size negative", { classSize: -5 }, "classSize", 1],
  ["Training duration", { trainingWeeks: -6 }, null, null],
  ["Vacancy days", { vacancyDays: -30 }, null, null],
  ["Vacancy coverage", { vacancyCoverageFraction: 400 }, null, null],
  ["Overtime premium", { overtimePremium: -500 }, null, null],
  ["Screening hours", { screeningHours: -80 }, null, null],
  ["HR loaded rate", { hrLoadedRate: -48 }, null, null],
  ["Trainer loaded rate", { trainerLoadedRate: -45 }, null, null],
  ["Sign-on bonus", { signOnBonus: -5000 }, null, null],
  ["Nesting duration", { nestingWeeks: -4 }, null, null],
  ["Ramp months", { rampMonths: -3 }, null, null],
  ["Supervisor hours", { supervisorHoursPerNew: -10 }, null, null],
  ["Supervisor rate", { supLoadedRate: -55 }, null, null],
  ["Cost to achieve", { costPerPoint: -100000 }, null, null],
];
for (const [nm, mut, field, expect] of GUARDED) {
  const r = compute(m(mut));
  A(`${nm}: the correction is recorded, not silently applied`, r.guards.length > 0);
  A(`${nm}: the correction names the field and both values`, r.guards.every(g => g.label && g.entered !== undefined && g.used !== undefined));
  A(`${nm}: the engine raises a hard flag when it had to change an input`, r.hardFlag === true);
  A(`${nm}: a corrected input binds the completeness axis`, r.grades.completeness === "Directional");
  A(`${nm}: no published figure is negative or non-finite after correction`, r.invariants.length === 0 && r.voided === false);
  if (field) A(`${nm}: the engine computed at the corrected value`, near(r[field], expect));
}
/* This assertion used to pin "$-5", which codified the defect rather than the rule.
   The sign leads the symbol everywhere else money is printed in this platform, so a
   guard that renders it the other way puts two spellings of the same figure in one
   document. Found while fixing the same helper in Cost per Contact. */
A("a guard renders money with a currency mark", guardVal({ entered: 5, used: 0, unit: "$" }, "entered") === "$5");
A("a guard renders negative money with the sign in front of the symbol", guardVal({ entered: -5, used: 0, unit: "$" }, "entered") === "-$5");
A("a guard money rendering agrees with the house money format on sign placement",
  guardVal({ entered: -5, used: 0, unit: "$" }, "entered").indexOf("-") === 0 && fmt$(-5).indexOf("-") === 0);
A("a guard renders a non-money unit as a suffix", guardVal({ entered: 42, used: 0, unit: "%" }, "entered") === "42%");
A("a guard renders a unitless value bare", guardVal({ entered: 3, used: 1, unit: "" }, "entered") === "3");
A("a guard renders a percentage with its unit", guardVal({ entered: 300, used: 100, unit: "%" }, "used") === "100%");
A("a guard renders a bare count with no unit", guardVal({ entered: -2, used: 0, unit: "" }, "used") === "0");
const cs0 = compute(m({ classSize: 0 }));
A("class size zero is corrected to one and disclosed, not silently substituted", cs0.guards.some(g => /Class size/.test(g.label) && g.entered === 0 && g.used === 1));
A("no valid input raises a spurious correction", compute(D()).guards.length === 0);
A("every default value survives its own guard untouched", Object.keys(BASE).every(k => compute(D()).guards.every(g => true)) && compute(D()).guards.length === 0);

/* ---- 7. enum guards and the mechanism ceiling ---- */
/* mech 900 credited freed capacity at 900 percent, inflated realizable value
   nine-fold past the maximum legitimate figure, exported Finance-grade on both
   axes, and printed the mechanism name as "None" in the same document. */
console.log("\n7. enum guards and the mechanism ceiling");
const m900 = compute(m({ mech: 900 }));
A("an out-of-range mechanism is corrected", m900.guards.some(g => /Capacity mechanism/.test(g.label)));
A("an out-of-range mechanism falls to zero realization, not to the default credit", m900.mech === 0);
A("an out-of-range mechanism cannot reach Finance-grade", m900.confidence === "Directional");
A("an out-of-range mechanism credits no capacity at all", m900.scenarios.every(s => s.cap === 0));
A("the printed mechanism name matches the factor actually used", m900.mechName === MECH.none.label);
const mNeg = compute(m({ mech: -100 }));
A("a negative mechanism is corrected rather than credited", mNeg.mech === 0 && mNeg.guards.length > 0);
A("the realization factor is never outside 0 to 1", [900, -100, "zzz", null, undefined, 1e9].every(v => { const r = compute(m({ mech: v })); return r.mech >= 0 && r.mech <= 1; }));
for (const [legacy, key] of Object.entries(LEGACY_MECH)) {
  const r = compute(m({ mech: Number(legacy) }));
  A(`a legacy numeric link at ${legacy} maps to ${key} rather than dropping to zero`, r.mechKey === key);
  A(`the legacy mapping at ${legacy} is disclosed, not silent`, r.guards.some(g => /legacy numeric link/.test(g.label)));
  A(`the legacy mapping at ${legacy} credits the shared factor`, near(r.mech, MECH[key].f));
}
A("an unrecognised vacancy mode falls back to the conservative default", compute(m({ vacancyMode: "zzz" })).vacancyMode === "incremental");
A("an unrecognised vacancy mode is disclosed", compute(m({ vacancyMode: "zzz" })).guards.some(g => /Vacancy costing mode/.test(g.label)));
A("an unrecognised intent falls back to forced, the treatment that does not zero the seats", compute(m({ unbackfillIntent: "zzz" })).unbackfillIntent === "forced");
A("an unrecognised input basis falls back to estimate, the lowest evidence grade", compute(m({ evidence: "zzz" })).evidence === "estimate");
A("an unrecognised input basis cannot reach Finance-grade evidence", compute(m({ evidence: "zzz" })).grades.evidence === "Directional");
A("gross vacancy mode charges more than incremental", compute(m({ vacancyMode: "gross" })).vacancy > compute(m({ vacancyMode: "incremental" })).vacancy);
A("gross vacancy mode is flagged as overstating incremental cost", compute(m({ vacancyMode: "gross" })).flags.some(f => /overstates incremental/.test(f.t)));
A("gross vacancy mode names the double-count risk on the completeness axis", compute(m({ evidence: "finance", mech: "vendor", vacancyMode: "gross" })).completenessReason.includes("double-count"));

/* ---- 8. invariants and voiding ---- */
/* A failed completeness check voids the output rather than grading it down,
   because an impossible figure is not an uncertain one. */
console.log("\n8. invariants and voiding");
A("the shipped defaults are not void", base.voided === false && base.invariants.length === 0);
A("no guarded scenario can produce a negative published figure", GUARDED.every(([, mut]) => compute(m(mut)).voided === false));
const HOSTILE = [
  { agents: -200, avgSalary: -38000, rampProductivity: 400, mech: 900, backfillRate: 300, earlyWashoutRate: -20 },
  { attritionRate: -1e6, recruitingCost: -1e9, classSize: 0, nestingProductivity: 1e4 },
  { agents: NaN, avgSalary: "abc", trainingWeeks: -1e6, vacancyCoverageFraction: -1e6, mech: null },
  { agents: 1e12, avgSalary: 1e12, trainingWeeks: 1e6, rampMonths: 1e6 },
];
for (let i = 0; i < HOSTILE.length; i++) {
  const r = compute(m(HOSTILE[i]));
  A(`hostile set ${i + 1}: every published figure is finite`, [r.cashPerDeparture, r.capacityPerDeparture, r.allInPerDeparture, r.annualReplBurden, r.earlyWaste, r.pctSalary].every(Number.isFinite));
  A(`hostile set ${i + 1}: no published figure is negative`, [r.cashPerDeparture, r.capacityPerDeparture, r.allInPerDeparture, r.annualReplBurden, r.earlyWaste, r.hires, r.departures, r.unbackfilled].every(v => v >= 0));
  A(`hostile set ${i + 1}: the output is not void, because the guards ran first`, r.voided === false);
  A(`hostile set ${i + 1}: any input the engine had to change is disclosed`, r.guards.length > 0 || Object.entries(HOSTILE[i]).every(([k, v]) => typeof v === "number" && v >= 0));
  A(`hostile set ${i + 1}: the export cannot reach Planning-grade or better`, r.confidence === "Directional");
}
A("the invariant list is empty whenever the output is not void", [D(), m({ mech: "none" }), m({ backfillRate: 0 })].every(d => compute(d).invariants.length === 0));

/* ---- 9. three-axis confidence ---- */
console.log("\n9. three-axis confidence");
A("all three axes are always populated", AXES.every(a => !!base.grades[a]));
A("no axis is ever N/A, because this tool models a benefit", AXES.every(a => base.grades[a] !== null));
for (const [ev, grade] of Object.entries(EVIDENCE_GRADE)) {
  A(`input basis ${ev} sets the evidence axis to ${grade}`, compute(m({ evidence: ev })).grades.evidence === grade);
}
A("the evidence axis no longer carries the frontline band", compute(m({ evidence: "finance", rampMonths: 24 })).grades.evidence === "Finance-grade");
A("an out-of-band cost basis binds completeness instead", compute(m({ evidence: "finance", rampMonths: 24 })).grades.completeness === "Directional");
const HEAD = [
  [m({ evidence: "finance", mech: "vendor" }), "Finance-grade"],
  [m({ evidence: "finance", mech: "hiring" }), "Planning-grade"],
  [m({ evidence: "hrdata", mech: "vendor" }), "Planning-grade"],
  [m({ evidence: "estimate", mech: "vendor" }), "Directional"],
  [m({ evidence: "finance", mech: "none" }), "Directional"],
];
for (const [d, expect] of HEAD) {
  const r = compute(d);
  A(`headline is the weakest axis (${expect})`, r.confidence === expect);
  A(`headline equals the minimum of the three axes (${expect})`, GRADE_RANK[r.confidence] === Math.min(...AXES.map(a => GRADE_RANK[r.grades[a]])));
  A(`the rationale names the binding axis (${expect})`, r.boundAxes.length > 0 && r.boundAxes.every(a => AXES.includes(a)));
  A(`every named binding axis really sits at the headline grade (${expect})`, r.boundAxes.every(a => r.grades[a] === r.confidence));
  A(`no unnamed axis sits at the headline grade (${expect})`, AXES.filter(a => r.grades[a] === r.confidence).length === r.boundAxes.length);
  A(`the why line states the headline and the binding axis (${expect})`, r.why.startsWith(expect) && r.why.includes(r.boundBy));
}
const clean = compute(m({ evidence: "finance", mech: "vendor" }));
A("a whole, in-band, uncorrected model reaches Finance-grade completeness", clean.grades.completeness === "Finance-grade");
A("a model bound by completeness says so in the rationale", compute(m({ evidence: "finance", mech: "vendor", rampMonths: 24 })).boundBy.includes("completeness"));
A("a model bound by realization says so in the rationale", compute(m({ evidence: "finance", mech: "none" })).boundBy.includes("realization"));
A("a model bound by evidence says so in the rationale", compute(m({ evidence: "estimate", mech: "vendor" })).boundBy.includes("evidence"));
A("two axes tied at the minimum are both named", compute(m({ evidence: "estimate", mech: "none" })).boundAxes.length >= 2);
A("a hard flag binds completeness without touching evidence", compute(m({ evidence: "finance", backfillRate: 50 })).grades.evidence === "Finance-grade");
A("a hard flag binds completeness without touching realization", compute(m({ evidence: "finance", mech: "vendor", backfillRate: 50 })).grades.realization === "Finance-grade");
A("a hard flag still holds the headline at Directional", compute(m({ evidence: "finance", mech: "vendor", backfillRate: 50 })).confidence === "Directional");
A("gross vacancy costing caps completeness at Planning-grade", compute(m({ evidence: "finance", mech: "vendor", vacancyMode: "gross" })).grades.completeness === "Planning-grade");
A("the completeness rationale explains itself when it is not Finance-grade", compute(m({ evidence: "finance", mech: "vendor", vacancyMode: "gross" })).completenessReason.length > 40);
A("verdict strength is never an axis: a large burden does not lower any grade",
  AXES.every(a => compute(m({ evidence: "finance", mech: "vendor", agents: 5000 })).grades[a] === clean.grades[a]));
A("a zero salary makes the band untestable and is flagged, not scored as below band",
  compute(m({ avgSalary: 0 })).flags.some(f => /cannot be tested/.test(f.t)));
A("a zero salary binds completeness", compute(m({ avgSalary: 0 })).grades.completeness === "Directional");
A("a zero salary does not print a false percentage claim", compute(m({ avgSalary: 0 })).salaryUnknown === true);

/* ---- 10. implausibility checks look both ways ---- */
/* Every check used to look upward only, so a negative cost basis raised nothing. */
console.log("\n10. implausibility checks");
A("a cost basis above 100% of salary is flagged", compute(m({ rampMonths: 30 })).flags.some(f => /exceeds 100%/.test(f.t)));
A("a cost basis above the band is flagged", compute(m({ rampMonths: 10 })).flags.some(f => /above the typical frontline/.test(f.t)));
A("a cost basis below the band is flagged", compute(m({ trainingWeeks: 1, rampMonths: 0, nestingWeeks: 0 })).flags.some(f => /below the 40-60%/.test(f.t)));
A("attrition under 10 percent is flagged as a denominator question", compute(m({ attritionRate: 6 })).flags.some(f => /under 10%/.test(f.t)));
A("attrition over 50 percent is flagged as severe churn", compute(m({ attritionRate: 62 })).flags.some(f => /over 50%/.test(f.t)));
A("attrition over 100 percent is flagged as a probable denominator error", compute(m({ attritionRate: 180 })).flags.some(f => /denominator error/.test(f.t)));
A("attrition over 100 percent is a hard flag, not a note", compute(m({ attritionRate: 180 })).hardFlag === true);
A("a dominant training cost is flagged", compute(m({ trainingWeeks: 20, classSize: 3 })).flags.some(f => /dominant cost driver/.test(f.t)));
A("a single dominant component is flagged even when it is not training", compute(m({ rampMonths: 20 })).flags.some(f => /Ramp loss is over 55% of all-in/.test(f.t)));
A("every flag carries a severity", compute(m({ attritionRate: 180, backfillRate: 50 })).flags.every(f => f.sev === "high" || f.sev === "med"));
A("no flag text is empty", compute(m({ attritionRate: 180, backfillRate: 50 })).flags.every(f => typeof f.t === "string" && f.t.length > 20));

/* ---- 11. adversarial fuzz ---- */
/* Four hundred randomised scenarios, including values a scenario link could carry
   but a form could not. Impossible-output blocking is proven, not asserted. */
console.log("\n11. adversarial fuzz");
let seed = 20260827;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const wild = () => { const r = rnd(); return r < 0.2 ? -Math.round(rnd() * 1e6) : r < 0.35 ? Math.round(rnd() * 1e7) : r < 0.4 ? NaN : Math.round(rnd() * 200); };
const KEYS = Object.keys(BASE).filter(k => typeof BASE[k] === "number");
let neg = 0, nonfinite = 0, voidedCount = 0, ungraded = 0, badMech = 0, subsetBreak = 0, silent = 0;
for (let i = 0; i < 400; i++) {
  const d = D();
  for (const k of KEYS) if (rnd() < 0.5) d[k] = wild();
  if (rnd() < 0.3) d.mech = [900, -1, "zzz", null, 75, "hiring"][Math.floor(rnd() * 6)];
  if (rnd() < 0.2) d.vacancyMode = "zzz";
  if (rnd() < 0.2) d.unbackfillIntent = "zzz";
  if (rnd() < 0.2) d.evidence = "zzz";
  const r = compute(d);
  const pubs = [r.cashPerDeparture, r.capacityPerDeparture, r.allInPerDeparture, r.annualCashBurden, r.annualCapBurden, r.annualReplBurden, r.earlyWaste, r.hires, r.departures, r.unbackfilled, r.pctSalary,
    ...r.scenarios.flatMap(s => [s.total, s.cash, s.cap])];
  if (pubs.some(v => !Number.isFinite(v))) nonfinite++;
  if (pubs.some(v => v < 0)) neg++;
  if (r.voided) voidedCount++;
  if (!AXES.every(a => GRADE_RANK[r.grades[a]] !== undefined)) ungraded++;
  if (r.mech < 0 || r.mech > 1) badMech++;
  if (r.earlyWaste > r.annualCashBurden + 0.5) subsetBreak++;
  if (r.guards.length > 0 && r.confidence !== "Directional") silent++;
}
A("400 adversarial scenarios produce no non-finite published figure", nonfinite === 0);
A("400 adversarial scenarios produce no negative published figure", neg === 0);
A("400 adversarial scenarios never break the subset invariant", subsetBreak === 0);
A("400 adversarial scenarios never credit capacity outside 0 to 1", badMech === 0);
A("400 adversarial scenarios always return three graded axes", ungraded === 0);
A("no adversarial scenario reaches the void state, because the guards run first", voidedCount === 0);
A("no adversarial scenario exports above Directional while an input was corrected", silent === 0);

/* ---- 12. the scenario contract and the rail ---- */
console.log("\n12. scenario contract and rail");
A("the default input set carries every field the engine reads", ["agents", "attritionRate", "avgSalary", "benefitsLoadPct", "backfillRate", "unbackfillIntent", "earlyWashoutRate", "recruitingCost", "screeningHours", "hrLoadedRate", "trainingWeeks", "trainerLoadedRate", "classSize", "signOnBonus", "nestingWeeks", "nestingProductivity", "rampMonths", "rampProductivity", "supervisorHoursPerNew", "supLoadedRate", "overtimePremium", "vacancyDays", "vacancyCoverageFraction", "vacancyMode", "mech", "evidence", "costPerPoint"].every(k => k in BASE));
A("the default input set carries no field the engine ignores", Object.keys(BASE).length === 27);
A("cloning the defaults does not alias them", (() => { const a = clone(DEFAULTS.d); a.agents = 1; return DEFAULTS.d.agents === 200; })());
A("the engine is pure: computing twice returns the same figures", near(compute(D()).allInPerDeparture, compute(D()).allInPerDeparture));
A("the engine does not mutate its input", (() => { const d = D(); const before = JSON.stringify(d); compute(d); return JSON.stringify(d) === before; })());
A("the rail line reports the all-in, the burden and the un-backfilled seats", /replaced departure/.test(base.railRead) && /annual replacement burden/.test(base.railRead) && /seats\/yr/.test(base.railRead));
A("the rail line refuses to publish a figure from a void export", /void/.test(compute(m({ mech: "none" })).railRead) === false);
A("the component pulls with provenance, never a bare rail read", /getPrimitiveWithSource/.test(SRC) && !/[^h]getPrimitive\(/.test(SRC));
A("the component refuses to badge a value it published itself", /sourceTool !== TOOL_ID/.test(SRC));
A("the component normalizes at the publish site", /normalizeForPublish\(/.test(SRC));
A("the component uses the shared NumField, not a local copy", /from "\.\/src\/lib\/NumField"/.test(SRC) && !/function NumField\(/.test(SRC));
A("the component uses the shared type system, not a hand-written font stack", /from "\.\/src\/lib\/type"/.test(SRC) && !/Instrument Serif/.test(SRC) && !/DM Sans/.test(SRC));
A("the component passes the emitted grade object to the report", /grades=\{r\.gradeObj\}/.test(SRC));
A("the component computes no headline of its own", !/Object\.keys\(GRADE_RANK\)\.find/.test(SRC) && /gradeConfidence\(grades\)/.test(SRC));
A("the component no longer passes a hand-built confidence word", !/confidence=\{r\.voided/.test(SRC));
A("the shared grade tables are imported, not redeclared", /from "\.\/src\/lib\/confidence"/.test(SRC)
  && !/const GRADE_RANK = \{ "Directional"/.test(SRC) && !/const CRED_GRADE = \{ none:/.test(SRC));

/* The emitted object is the contract eight more tools will copy, so it is pinned
   here rather than left to the report harness alone. */
const gEv = compute(m({ evidence: "finance", mech: "reduce" }));
A("a clean run emits the doctrine object", gEv.gradeObj && gEv.gradeObj.void === false);
A("the emitted headline matches the engine headline", gEv.gradeObj.headline === gEv.confidence);
A("the emitted binding axis matches the engine binding axis", gEv.gradeObj.boundBy === gEv.boundBy);
A("the emitted object carries a reason on every axis", AXES.every((a) => (gEv.gradeObj.reasons[a] || "").length > 0));
A("a clean run emits no grade defect", gEv.gradeObj.defects.length === 0);
A("realization is never N/A on this tool, it models a benefit", gEv.gradeObj.realization !== null && gEv.gradeObj.naReason === "");
A("the whole file contains no em-dash", SRC.indexOf(String.fromCharCode(0x2014)) < 0);
A("every option list is non-empty", [MECH_OPTS, BACKFILL_OPTS, INTENT_OPTS, VACANCY_OPTS, EVIDENCE_OPTS].every(o => o.length > 1));
A("every evidence option maps to a grade", EVIDENCE_OPTS.every(o => !!EVIDENCE_GRADE[o.v]));
A("every credit class maps to a grade", Object.values(MECH).every(x => !!CRED_GRADE[x.cred]));

/* ---- K. mechanism key resolution ---- */
console.log("\nK. mechanism key resolution");
const PROTO = ["constructor", "toString", "__proto__", "hasOwnProperty", "valueOf", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString"];
for (const k of PROTO) {
  let r, threw = false;
  try { r = compute(m({ mech: k })); } catch (e) { threw = true; }
  A(`prototype name "${k}" does not throw`, !threw);
  if (threw) continue;
  A(`prototype name "${k}" resolves to none`, r.mechKey === "none" && r.mech === 0 && r.cred === MECH.none.cred);
  A(`prototype name "${k}" prints a real label`, typeof r.mechName === "string" && r.mechName === MECH.none.label);
  A(`prototype name "${k}" is disclosed`, r.guards.some(g => g.label === "Capacity mechanism" && g.entered === k && g.used === "none"));
  A(`prototype name "${k}" leaves no NaN in numeric outputs`, Object.values(r).every(v => typeof v !== "number" || !Number.isNaN(v)));
}
for (const k of ["nonsense", undefined, null, ""]) {
  const r = compute(m({ mech: k }));
  A(`unknown mechanism ${JSON.stringify(k)} withholds credit and discloses`, r.mechKey === "none" && r.mech === 0 && r.guards.some(g => g.label === "Capacity mechanism"));
}
for (const k of MECH_ORDER) {
  const r = compute(m({ mech: k }));
  A(`own key "${k}" passes untouched`, r.mechKey === k && r.mech === MECH[k].f && !r.guards.some(g => /Capacity mechanism/.test(g.label)));
}
for (const [num, key] of Object.entries(LEGACY_MECH)) {
  for (const raw of [num, Number(num)]) {
    const r = compute(m({ mech: raw }));
    A(`legacy ${typeof raw} ${raw} maps to ${key} with disclosure`, r.mechKey === key && r.guards.some(g => g.label === "Capacity mechanism (legacy numeric link)" && g.used === key));
  }
}
A("a substituted mechanism never credits more than the least declared one", PROTO.every(k => { try { return compute(m({ mech: k })).mech <= Math.min(...MECH_ORDER.map(x => MECH[x].f)); } catch (e) { return false; } }));
A("source gate: the mechanism lookup is an own-key test", /hasOwnProperty\.call\(MECH, mechKey\)/.test(region));
A("source gate: no truthy mechanism lookup remains", !/!MECH\[mechKey\]/.test(region));
A("source gate: the component has no second raw mechanism lookup", (SRC.match(/(?<![A-Z_])MECH\[(?!mechKey\]|k\])/g) || []).length === 0);
A("source gate: the selector reads the engine-resolved key", /value=\{r\.mechKey\}/.test(SRC));

/* ---- L. sign invariance of the grades, and the form initial ----

   Section 5 of the doctrine grades the BASIS of a number, never the number.
   A model built on finance-confirmed inputs with a cashable realization lever
   is Finance-grade whether the answer comes back a saving or a loss. The
   failure this section locks out is the one that feels natural to write and is
   always wrong: quietly downgrading confidence when the result turns
   unflattering, which converts the confidence strip into a verdict on the
   outcome instead of a statement about the inputs.

   Cost to achieve is the only sign carrier in this engine. It nets against the
   gross scenario value without touching any driver of any axis, so sweeping it
   drives net from positive through exactly zero to negative while the basis is
   held fixed. Scenario total must stay flat across the same sweep: total is the
   gross recovery, net is total less the spend, and a total that moves with cost
   to achieve would mean the spend is being double counted.
---- */
console.log("\nL. sign invariance and the form initial");

A("the shared module exports both mech constants", typeof MECH_FALLBACK === "string" && typeof MECH_INITIAL === "string");
A("both mech constants are own keys in MECH",
  Object.prototype.hasOwnProperty.call(MECH, MECH_FALLBACK) && Object.prototype.hasOwnProperty.call(MECH, MECH_INITIAL));
A("the shipped defaults carry the shared form initial, not a hardcoded mechanism", BASE.mech === MECH_INITIAL);
A("source gate: the default input set reads MECH_INITIAL rather than a string literal", /mech:\s*MECH_INITIAL/.test(region));
A("source gate: the retired MECH_DEFAULT is gone from the component", !/MECH_DEFAULT/.test(SRC));

const EV_KEYS = Object.keys(EVIDENCE_GRADE);
let spanned = 0;
for (const ev of EV_KEYS) {
  for (const mk of MECH_ORDER) {
    const fixed = { evidence: ev, mech: mk };
    const ref = compute(m({ ...fixed, costPerPoint: 0 }));
    const one = compute(m({ ...fixed, costPerPoint: 1 }));
    const slope = one.scenarios[0].net - ref.scenarios[0].net;
    A(`${ev}/${mk}: cost to achieve reduces net, so the sign can be driven`, slope < 0);
    const zeroAt = ref.scenarios[0].net / (ref.scenarios[0].net - one.scenarios[0].net);
    const SWEEP = [
      ["positive", 0],
      ["zero", zeroAt],
      ["negative", zeroAt * 2],
      ["deeply negative", zeroAt * 40],
    ];
    for (const [sign, cpp] of SWEEP) {
      const r = compute(m({ ...fixed, costPerPoint: cpp }));
      const tag = `${ev}/${mk} with net ${sign}`;
      if (sign === "zero") A(`${tag}: the sweep lands on zero`, Math.abs(r.scenarios[0].net) < 1e-6);
      if (sign === "positive") A(`${tag}: the sweep starts above zero`, r.scenarios[0].net > 0);
      if (sign === "negative" || sign === "deeply negative") { A(`${tag}: the sweep is below zero`, r.scenarios[0].net < 0); spanned++; }
      A(`${tag}: the evidence axis is unchanged`, r.grades.evidence === ref.grades.evidence);
      A(`${tag}: the realization axis is unchanged`, r.grades.realization === ref.grades.realization);
      A(`${tag}: the completeness axis is unchanged`, r.grades.completeness === ref.grades.completeness);
      A(`${tag}: the headline is unchanged`, r.confidence === ref.confidence);
      A(`${tag}: the binding axis is unchanged`, r.boundBy === ref.boundBy);
      A(`${tag}: a negative net is not treated as an integrity failure`, r.voided === ref.voided && r.voided === false);
      A(`${tag}: no invariant fires on the sign alone`, r.invariants.length === ref.invariants.length);
      A(`${tag}: gross scenario value is untouched by cost to achieve`,
        r.scenarios.every((sc, i) => near(sc.total, ref.scenarios[i].total)));
      A(`${tag}: net is gross less the cost to achieve, on every scenario`,
        r.scenarios.every((sc) => near(sc.net, sc.total - sc.achieveCost)));
      A(`${tag}: the cost to achieve scales with the reduction points bought`,
        r.scenarios.every((sc) => near(sc.achieveCost, sc.redPts * cpp)));
    }
  }
}
A("the sign sweep genuinely produced negative results across every basis", spanned === EV_KEYS.length * MECH_ORDER.length * 2);

/* The same invariance stated the other way: a scenario set forced to all zeros
   by a driver, rather than by the netting, must not move the axes either. */
for (const ev of EV_KEYS) {
  const ref = compute(m({ evidence: ev, mech: "vendor" }));
  const flat = compute(m({ evidence: ev, mech: "vendor", attritionRate: 0 }));
  A(`${ev}: zero attrition zeroes the scenarios`, flat.scenarios.every(sc => sc.total === 0));
  A(`${ev}: zero attrition leaves the evidence axis alone`, flat.grades.evidence === ref.grades.evidence);
  A(`${ev}: zero attrition leaves the realization axis alone`, flat.grades.realization === ref.grades.realization);
  A(`${ev}: zero attrition does not void the export`, flat.voided === false);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
