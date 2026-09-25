/* methods.test.mjs
 *
 * The rail calculators' published method pages. Each rail tool's engine lives inside its
 * JSX file, so its method page carries worked examples as pins. This harness slices each
 * engine the same way the tool's own harness does and recomputes every pin, so a method page
 * cannot drift from its calculator. It also checks each page is registered, routed, in the
 * sitemap, linked from its tool, and reads every constant from the registry.
 */
import { readFileSync } from "node:fs";
const { BENCH, benchmark, BENCHMARK_SOURCES } = await import("./src/lib/benchmarks.js");
const conf = await import("./src/lib/confidence.js");
const { createGuards } = await import("./src/lib/guards.js");
const { RUBRICS } = await import("./src/lib/rubrics/index.js");

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const DASH = new RegExp("[" + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + "]");
const NOISE = /\d\.\d*0000000\d|\d\.\d*9999999\d/;
const APP = readFileSync("./App.jsx", "utf8"), MAP = readFileSync("./public/sitemap.xml", "utf8"), SEO = readFileSync("./src/lib/seo.js", "utf8");

function common(id, toolFile) {
  const M = RUBRICS[id];
  ok(`[${id}] registered as a calc method`, !!M && M.kind === "calc" && M.methodology === "/methodology/" + id);
  ok(`[${id}] routed, in the sitemap and titled`, APP.includes(`<Route path="/methodology/${id}" element={<RubricPage id="${id}" />} />`) && MAP.includes(`/methodology/${id}<`) && SEO.includes(`"/methodology/${id}": {`));
  ok(`[${id}] every constant on the page is a registry entry with its source`, M.constants().length > 0 && M.constants().every((c) => BENCHMARK_SOURCES[c.id] && c.value === BENCHMARK_SOURCES[c.id].value && c.source === BENCHMARK_SOURCES[c.id].source));
  ok(`[${id}] the tool links its published method`, readFileSync("./" + toolFile, "utf8").includes(`/methodology/${id}`));
  const text = JSON.stringify({ ...M, constants: M.constants() });
  ok(`[${id}] no dash, float noise, NaN or undefined on the page`, !DASH.test(text) && !NOISE.test(text) && !/NaN|undefined|Infinity/.test(text));
  return M;
}

section("Staffing Requirement Calculator");
{
  const { STAFFING_PINS: P } = await import("./src/lib/rubrics/staffingModel.js");
  common("staffing-calculator", "StaffingCalculator.jsx");
  const SS = readFileSync("./StaffingCalculator.jsx", "utf8");
  const full = SS.slice(SS.indexOf("function erlangB("), SS.indexOf("const S = ({ label"));
  const G = new Function("benchmark", "BENCH", "emitGrades", "voidResult", "isVoid", "railEvidence", "weakerStream", "createGuards",
    `${full}\nreturn { calc, staffingCost, PRESETS };`)(benchmark, BENCH, conf.emitGrades, conf.voidResult, conf.isVoid, conf.railEvidence, conf.weakerStream, createGuards);
  const d = P.defaults, g = G.PRESETS.general;
  ok("the opening case is the tool's own general profile", g.volume === d.volume && g.aht === d.aht && g.slT === d.slT && g.slS === d.slS && g.shrink === d.shrink && benchmark("staffing.default.intv") === d.interval);
  const r = G.calc(d.volume, d.aht, d.interval, d.slT, d.slS, d.shrink, null), c = G.staffingCost(r.sched, 0, 0);
  ok("opening case: load, base agents and FTE equal the engine", r.A === d.load && r.raw === d.base && r.sched === d.fte);
  ok("opening case: service level, speed of answer and occupancy equal the engine", near(r.sl, d.sl, 5e-6) && near(r.asa, d.asa, 0.005) && near(r.occ, d.occ, 5e-6));
  ok("opening case: cost per agent and annual cost equal the engine to the dollar", near(c.perAgentMonth, d.perAgentMonth, 0.005) && Math.round(c.annual) === d.annual && !c.sourced);
  const n = P.nextiva, x = G.calc(n.volume, n.aht, n.interval, n.slT, n.slS, n.shrink, n.cap);
  ok("published case: 68 base agents, 98 FTE, 84.0% occupancy, set by the ceiling", x.raw === n.base && x.sched === n.fte && (x.occ * 100).toFixed(1) === "84.0" && x.capped === n.capped && near(x.A, n.load, 0.005));
}

section("Cost per Contact Calculator");
{
  const { CPC_PINS: P } = await import("./src/lib/rubrics/cpcModel.js");
  common("cost-per-contact", "CostPerContactCalculator.jsx");
  const { MECH, MECH_INITIAL } = await import("./src/lib/mech.js");
  const { COLORS } = await import("./src/lib/benchmarks.js");
  const { guardVal, guardLine } = await import("./src/lib/guards.js");
  const SRC = readFileSync("./CostPerContactCalculator.jsx", "utf8");
  const region = SRC.slice(SRC.indexOf("/* @engine-start"), SRC.indexOf("/* @engine-end */")).replace(/^export /gm, "");
  const E = new Function("MECH", "MECH_INITIAL", "ELECTRIC", "GREEN", "AMBER", "createGuards", "guardVal", "guardLine", "benchmark", "emitGrades", "voidResult", "isVoid", "railEvidence", "weakerStream", "realizationFromCred",
    region + "\nreturn { compute, BASE, DEFAULTS };")(MECH, MECH_INITIAL, COLORS.electric, COLORS.green, COLORS.amber, createGuards, guardVal, guardLine, benchmark, conf.emitGrades, conf.voidResult, conf.isVoid, conf.railEvidence, conf.weakerStream, conf.realizationFromCred);
  const r = E.compute(E.DEFAULTS.d, E.DEFAULTS.mech), q = r.dividend.find((x) => x.p === P.step);
  ok("the example runs at the tool's opening case with no correction", r.guards.length === 0 && E.DEFAULTS.mech === MECH_INITIAL);
  ok("contacts per resolution and cost per resolution equal the engine", near(r.C, P.C, 5e-7) && near(r.cprLoaded, P.cpr, 5e-7));
  ok("resolutions, repeats and repeat share equal the engine", r.handled === P.handled && r.resolutions === P.resolutions && r.repeatContacts === P.repeats && near(r.repeatShare, P.repeatShare, 5e-6));
  ok("burden, blended handle cost and FTE burden equal the engine", near(r.burden, P.burden, 0.005) && near(r.blendedHandle, P.blendedHandle, 5e-5) && near(r.blendedEffMin, P.blendedEffMin, 5e-9) && near(r.fteBurden, P.fteBurden, 5e-4));
  ok("the quoted FCR step: new FCR, released, realizable and FTE equal the engine", !!q && near(q.newFCR, P.newFCR, 1e-9) && near(q.released, P.released, 0.005) && near(q.realizable, P.realizable, 0.005) && near(q.fte, P.fte, 5e-4));
}

section("Channel Shift Model");
{
  const { CHANNEL_PINS: P } = await import("./src/lib/rubrics/channelModel.js");
  common("channel-shift", "ChannelShiftModel.jsx");
  const { MECH, MECH_INITIAL } = await import("./src/lib/mech.js");
  const { COLORS } = await import("./src/lib/benchmarks.js");
  const { guardVal, guardLine } = await import("./src/lib/guards.js");
  const SRC = readFileSync("./ChannelShiftModel.jsx", "utf8");
  const region = SRC.slice(SRC.indexOf("/* @engine-start"), SRC.indexOf("/* @engine-end */")).replace(/^export /gm, "");
  const E = new Function("MECH", "MECH_INITIAL", "COLORS", "createGuards", "guardVal", "guardLine", "benchmark", "emitGrades", "voidResult", "isVoid", "railEvidence", "weakerStream", "realizationFromCred",
    region + "\nreturn { compute, buildVerdict, DEFAULTS };")(MECH, MECH_INITIAL, COLORS, createGuards, guardVal, guardLine, benchmark, conf.emitGrades, conf.voidResult, conf.isVoid, conf.railEvidence, conf.weakerStream, conf.realizationFromCred);
  const r = E.compute(E.DEFAULTS.d, E.DEFAULTS.mech), v = E.buildVerdict(E.DEFAULTS.d, r, E.DEFAULTS.mech);
  ok("the example runs at the tool's opening case with no correction and no scaling", r.guards.length === 0 && !r.scaled && E.DEFAULTS.mech === MECH_INITIAL);
  ok("voice, eligible, shifted, displaced and bounced equal the engine", r.voiceVol === P.voiceVol && r.eligible === P.eligible && r.shifted === P.shifted && near(r.Dtot, P.displaced, 1e-6) && near(r.Etot, P.bounced, 1e-6));
  ok("residual uplift, residual and departing handle time equal the engine", near(r.residualUplift, P.uplift, 5e-7) && near(r.residualEff, P.residualEff, 1e-9) && near(r.deptEff, P.deptEff, 5e-6));
  ok("net minutes, labor, bot fees and net realizable equal the engine", near(r.netMin, P.netMin, 0.005) && near(r.laborCash, P.laborCash, 0.005) && near(r.botFee, P.botFee, 1e-9) && near(r.netRealizable, P.netRealizable, 0.005));
  ok("FTE freed, transition and payback equal the engine", near(r.fteFreed, P.fteFreed, 5e-5) && near(r.transition, P.transition, 0.005) && near(r.payback, P.payback, 5e-4));
  ok("the verdict and break-even equal the engine", v.label === P.verdict && near(v.be, P.breakEven, 5e-4));
}

section("FCR Leakage Diagnostic");
{
  const { FCR_PINS: P } = await import("./src/lib/rubrics/fcrModel.js");
  common("fcr-leakage", "FCRLeakageDiagnostic.jsx");
  const { MECH, MECH_ORDER, MECH_INITIAL } = await import("./src/lib/mech.js");
  const SRC = readFileSync("./FCRLeakageDiagnostic.jsx", "utf8");
  const region = SRC.slice(SRC.indexOf("/* @engine-start"), SRC.indexOf("/* @engine-end */")).replace(/^export /gm, "");
  const E = new Function("MECH", "MECH_ORDER", "createGuards", "benchmark", "emitGrades", "voidResult", "railEvidence", "weakerStream", "realizationFromCred",
    region + "\nreturn { engine, gradeFCR };")(MECH, MECH_ORDER, createGuards, benchmark, conf.emitGrades, conf.voidResult, conf.railEvidence, conf.weakerStream, conf.realizationFromCred);
  const d = (f) => benchmark("fcr.default." + f);
  /* The shipped engineInput line at the tool's opening values, scope and method declared. */
  const I = { M: d("M"), fcr: d("fcrPct") / 100, mCPC: d("mCPC"), lCPC: d("lCPC"), repeatModel: "one", measuredRate: d("measuredPct") / 100, measuredTargetRate: null, pathModel: "one", repeatMult: d("repeatMult"), dScore: P.dScore, askTarget: d("targetPct") / 100, mech: MECH_INITIAL, sourcing: "inhouse", investOneTime: d("investOneTime"), investRecurring: d("investRecurring"), costBasis: "estimate", defDeclared: true, fcrPulledDirty: false, scope: "cc", method: "internal", windowDays: d("windowDays"), numericCorrections: [], diagComplete: true };
  const r = E.engine(I);
  ok("the example runs at the tool's opening values with no correction", r.enumCorrections.length + r.numericCorrections.length + r.measuredCorrections.length === 0 && !r.fcrImpossible && !r.negImpossible && I.M === 50000 && I.fcr === 0.72 && I.askTarget === 0.8);
  ok("repeat share, repeats and the yearly burden equal the engine", near(r.repeatShare, P.repeatShare, 1e-12) && near(r.repeats, P.repeats, 1e-9) && near(r.burdenYr, P.burdenYr, 1e-6));
  ok("opportunity, capture, ceiling and the capped target equal the engine", near(r.opp, P.opp, 1e-12) && near(r.cap, P.cap, 1e-12) && r.practicalMax === P.practicalMax && near(r.ceilingFCR, P.ceilingFCR, 1e-12) && near(r.target, P.target, 1e-12) && r.overCeiling);
  ok("contacts avoided, gross, controllable and realizable equal the engine", near(r.repeatsT, P.repeatsT, 0.005) && near(r.volReduced, P.volReduced, 0.005) && near(r.grossYr, P.grossYr, 0.005) && near(r.controllableBurdenYr, P.controllableYr, 0.005) && near(r.realizableYr, P.realizableYr, 0.005));
  ok("year one, year two and payback equal the engine", near(r.year1Net, P.year1Net, 0.005) && near(r.year2Net, P.year2Net, 0.005) && r.paybackLabel === P.paybackLabel);
}

section("AI Deflection Reality Check");
{
  const { AID_PINS: P } = await import("./src/lib/rubrics/aidModel.js");
  common("ai-deflection", "AIDeflectionRealityCheck.jsx");
  const { MECH, MECH_INITIAL } = await import("./src/lib/mech.js");
  const SRC = readFileSync("./AIDeflectionRealityCheck.jsx", "utf8");
  const region = SRC.slice(SRC.indexOf("/* @engine-start"), SRC.indexOf("/* @engine-end */")).replace(/^export /gm, "");
  const E = new Function("MECH", "MECH_INITIAL", "createGuards", "benchmark", "emitGrades", "voidResult", "isVoid", "railEvidence", "weakerStream", "realizationFromCred",
    region + "\nreturn { engine, BASE, V_A };")(MECH, MECH_INITIAL, createGuards, benchmark, conf.emitGrades, conf.voidResult, conf.isVoid, conf.railEvidence, conf.weakerStream, conf.realizationFromCred);
  /* The shipped inputA line at the tool's DEFAULTS. */
  const B = E.BASE, I = { M: B.M, cpc: B.cpc, marg: B.marg, eligibleRate: B.eligibleRate, mech: MECH_INITIAL, rampOn: true, rampMonths: B.rampMonths, evidence: "estimate", costBasisOwned: false, ...E.V_A };
  ok("the tool opens with the ramp on at the registry's ramp, sourced to an estimate", /mech: MECH_INITIAL, rampOn: true, rampMonths: BASE\.rampMonths/.test(SRC) && /evidence: "estimate", costConfirmed: false/.test(SRC) && B.rampMonths === 6);
  const r = E.engine(I);
  ok("the example runs with no correction and a disclosed marginal cost", r.guards.length === 0 && r.margWasDefaulted && near(r.marg, P.marg, 1e-12));
  ok("attempted, durable resolution and the humans reached equal the engine", r.attempted === P.attempted && near(r.dur, P.dur, 1e-12) && near(r.durable, P.durable, 1e-6) && near(r.postBotHuman, P.postBotHuman, 1e-6));
  ok("bot resolution and net automation rates equal the engine", near(r.botResolutionRate, P.botRate, 1e-9) && near(r.netAutomationRate, P.netRate, 1e-9));
  ok("operating cost, escalation premium, vendor claim, converted and net equal the engine", near(r.opexMonthly, P.opex, 1e-9) && near(r.escalationPremium, P.escPremium, 0.005) && near(r.vendorClaim, P.vendorClaim, 1e-6) && near(r.K, P.K, 0.005) && near(r.netSavings, P.net, 0.005));
  ok("the bridge sums exactly to net savings", near(r.waterfallSum, r.netSavings, 1e-6));
  ok("break-even, repeat tolerance, year one, payback and verdict equal the engine", near(r.beResPct, P.beRes, 5e-4) && near(r.repeatTolPct, P.repeatTol, 5e-4) && near(r.year1, P.year1, 0.005) && r.payback === P.payback && r.verdict === P.verdict);
}

section("TCO Calculator");
{
  const { TCO_PINS: P } = await import("./src/lib/rubrics/tcoModel.js");
  common("tco-calculator", "TCOCalculator.jsx");
  const { benchmarksForTool } = await import("./src/lib/benchmarks.js");
  const { guardVal, guardLine } = await import("./src/lib/guards.js");
  const SRC = readFileSync("./TCOCalculator.jsx", "utf8");
  const region = SRC.slice(SRC.indexOf("/* @engine-start"), SRC.indexOf("/* @engine-end */"));
  const E = new Function("BENCH", "benchmark", "benchmarksForTool", "createGuards", "guardVal", "guardLine", "emitGrades", "voidResult", "railEvidence", "weakerStream", "TOOL_ID",
    region + "\nreturn { computeTCO, buildOptimizations, BASE, INDUSTRY };")(BENCH, benchmark, benchmarksForTool, createGuards, guardVal, guardLine, conf.emitGrades, conf.voidResult, conf.railEvidence, conf.weakerStream, "tco-calculator");
  ok("the tool opens on the cross-industry profile at the expected stance", SRC.includes('useState({ ...BASE, ...INDUSTRY.general, industry: "general" })') && SRC.includes('useState("expected")'));
  const d = { ...E.BASE, ...E.INDUSTRY.general, industry: "general" }, r = E.computeTCO(d, "expected"), o = E.buildOptimizations(d, r, "expected");
  ok("the example runs with no correction and no plausibility flag", r.guards.length === 0 && !r.hasBlock && !r.hasFlag);
  ok("loaded wage, labor, technology, overhead and seats equal the engine", near(r.loaded, P.loaded, 1e-9) && near(r.breakdown.agentLabor, P.agentLabor, 1e-6) && near(r.labor, P.labor, 1e-6) && near(r.tech, P.tech, 1e-6) && near(r.overhead, P.overhead, 1e-6) && r.breakdown.seats === P.seats && near(r.breakdown.telephony, P.telephony, 1e-9));
  ok("hires, cost per hire and attrition equal the engine", r.monthlyHires === P.monthlyHires && near(r.perHire, P.perHire, 1e-9) && near(r.attritionCost, P.attritionCost, 1e-6));
  ok("monthly, annual and per agent equal the engine", near(r.monthly, P.monthly, 1e-6) && near(r.annual, P.annual, 1e-4) && near(r.perAgentMonth, P.perAgentMonth, 0.005));
  ok("cost per contact, per resolution and marginal equal the engine", near(r.costPerContact, P.costPerContact, 5e-5) && near(r.costPerResolution, P.costPerResolution, 5e-5) && near(r.marginalPerContact, P.marginalPerContact, 5e-5));
  ok("years two and three and the three-year total equal the engine", near(r.y2, P.y2, 0.005) && near(r.y3, P.y3, 0.005) && near(r.threeYear, P.threeYear, 0.005));
  ok("the optimization totals equal the engine", o.grossTotal === P.optGross && o.netTotal === P.optNet);
  ok("the published sensitivity bands equal the engine by cost basis", ["estimate", "quoted", "invoiced"].map((c) => E.computeTCO({ ...d, costBasis: c }, "expected").sensitivity.pct).join() === "0.25,0.15,0.1");
}

section("License Bundle Gap Checker");
{
  const { LICENSE_PINS: P } = await import("./src/lib/rubrics/licenseGapModel.js");
  common("license-gap", "LicenseBundleGapChecker.jsx");
  const { COLORS } = await import("./src/lib/benchmarks.js");
  const SRC = readFileSync("./LicenseBundleGapChecker.jsx", "utf8");
  const region = SRC.slice(SRC.indexOf("/* @engine-start"), SRC.indexOf("/* @engine-end */")).replace(/^export /gm, "");
  const E = new Function("COLORS", "GREEN", "AMBER", "RED", "ELECTRIC", "createGuards", "benchmark", "emitGrades", "voidResult",
    region + "\nreturn { compute, DEFAULTS };")(COLORS, COLORS.green, COLORS.amber, COLORS.red, COLORS.electric, createGuards, benchmark, conf.emitGrades, conf.voidResult);
  const d = { ...JSON.parse(JSON.stringify(E.DEFAULTS)), committedSeats: P.committedSeats, uplift: P.uplift, seats18mo: P.seats18mo };
  const r = E.compute(d);
  ok("the example is the opening quote plus the three contract terms, with no correction", r.guards.length === 0 && !r.voided && r.billable === P.billable);
  ok("base, add-ons, license monthly, quoted and effective seat equal the engine", r.baseMonthly === P.baseMonthly && r.addOnMonthly === P.addOnMonthly && r.licenseMonthly === P.licenseMonthly && r.quotedSeat === P.quotedSeat && r.effLicenseSeat === P.effSeat && r.effPlatformSeat === P.effSeat);
  ok("the bundle gap, hidden annual and annual platform equal the engine", near(r.gapPct, P.gapPct, 1e-9) && r.hiddenAnnual === P.hiddenAnnual && r.annualPlatform === P.annualPlatform);
  ok("commit exposure, year three seat and growth equal the engine", r.commitExpSeats === P.commitExpSeats && near(r.commitExpAnnual, P.commitExpAnnual, 1e-6) && near(r.year3Seat, P.year3Seat, 5e-5) && near(r.exp18Annual, P.exp18Annual, 1e-6));
}

section("Attrition Cost Calculator");
{
  const { ATTRITION_PINS: P } = await import("./src/lib/rubrics/attritionModel.js");
  common("attrition-cost", "AttritionCostCalculator.jsx");
  const { MECH, MECH_ORDER, MECH_INITIAL } = await import("./src/lib/mech.js");
  const { COLORS } = await import("./src/lib/benchmarks.js");
  const { guardVal } = await import("./src/lib/guards.js");
  const SRC = readFileSync("./AttritionCostCalculator.jsx", "utf8");
  const region = SRC.slice(SRC.indexOf("/* @engine-start"), SRC.indexOf("/* @engine-end */")).replace(/^export /gm, "");
  const E = new Function("COLORS", "MECH", "MECH_ORDER", "MECH_INITIAL", "createGuards", "guardVal", "gradeConfidence", "emitGrades", "voidResult", "GRADE_RANK", "AXES", "CRED_GRADE", "benchmark",
    region + "\nreturn { compute, DEFAULTS };")(COLORS, MECH, MECH_ORDER, MECH_INITIAL, createGuards, guardVal, conf.gradeConfidence, conf.emitGrades, conf.voidResult, conf.GRADE_RANK, conf.AXES, conf.CRED_GRADE, benchmark);
  const r = E.compute(E.DEFAULTS.d), q = r.scenarios.find((x) => x.redPts === P.step);
  ok("the example is the tool's opening case, with no correction", r.guards.length === 0 && !r.voided && E.DEFAULTS.d.avgSalary === P.salary && r.mechKey === MECH_INITIAL);
  ok("departures, hires and loaded hourly equal the engine", r.departures === P.departures && r.hires === P.hires && near(r.loadedHourly, P.loadedHourly, 1e-9));
  ok("cash per departure and its parts equal the engine", r.recruiting === P.recruiting && near(r.training, P.training, 0.005) && near(r.vacancy, P.vacancy, 0.005) && near(r.cashPerDeparture, P.cashPerDeparture, 0.005));
  ok("capacity per departure and its parts equal the engine", near(r.nestingLoss, P.nestingLoss, 0.005) && near(r.rampLoss, P.rampLoss, 0.005) && r.supervisorBurden === P.supervisorBurden && near(r.capacityPerDeparture, P.capacityPerDeparture, 0.005));
  ok("all-in, share of salary and the band verdict equal the engine", near(r.allInPerDeparture, P.allInPerDeparture, 0.005) && near(r.pctSalary, P.pctSalary, 0.005) && r.inBand);
  ok("annual burden and early-washout waste equal the engine", near(r.annualReplBurden, P.annualReplBurden, 0.005) && r.earlyWashouts === P.earlyWashouts && near(r.earlyWaste, P.earlyWaste, 0.005));
  ok("the 10-point case equals the engine", !!q && q.avoided === P.avoided && near(q.cash, P.stepCash, 0.005) && near(q.cap, P.stepCap, 0.005) && near(q.total, P.stepTotal, 0.005));
}

section("Business Case Builder");
{
  const { BCB_PINS: P } = await import("./src/lib/rubrics/bcbModel.js");
  common("business-case-builder", "BusinessCaseBuilder.jsx");
  const { MECH, MECH_ORDER, MECH_FALLBACK } = await import("./src/lib/mech.js");
  const SRC = readFileSync("./BusinessCaseBuilder.jsx", "utf8");
  const sl = (a, b) => { const i = SRC.indexOf(a); return SRC.slice(i, SRC.indexOf(b, i)); };
  const E = new Function("MECH", "MECH_ORDER", "MECH_FALLBACK", "createGuards", "emitGrades", "voidResult", "weakerStream", "realizationFromCred", "GRADE_RANK", "benchmark",
    sl("const STATUS = {", "function LogoMark") + "\n" + sl("const STANCE = {", "/* De-overlapped model") + "\n" + sl("function computeCase(", "export default function") + "\nreturn { computeCase, DEFAULTS };")(MECH, MECH_ORDER, MECH_FALLBACK, createGuards, conf.emitGrades, conf.voidResult, conf.weakerStream, conf.realizationFromCred, conf.GRADE_RANK, benchmark);
  ok("the tool opens at the expected stance, phasing on, no capacity action", SRC.includes('SCENARIO_DEFAULTS = { d: DEFAULTS, stance: "expected", rampOn: true, mech: "none" }') && MECH_FALLBACK === "none");
  const r = E.computeCase(E.DEFAULTS, "expected", true, "none"), h = E.computeCase(E.DEFAULTS, "expected", true, "hiring");
  ok("loaded wage, marginal, deflected and handled equal the engine", near(r.loaded, P.loaded, 1e-9) && near(r.marginal, P.marginal, 5e-5) && r.deflected === P.deflected && r.handled === P.handled);
  ok("the four levers and gross equal the engine", near(r.buckets.containment, P.containment, 0.005) && near(r.buckets.handleTime, P.handleTime, 0.005) && near(r.buckets.fcr, P.fcr, 0.005) && near(r.buckets.attrition, P.attrition, 0.005) && near(r.gross, P.gross, 0.005) && near(r.avoidedRepeats, P.avoidedRepeats, 1e-6) && near(r.avoidedTurnover, P.avoidedTurnover, 1e-9));
  ok("attributed capacity and cash equal the engine", near(r.capacityNet, P.capacityNet, 0.005) && near(r.cashNet, P.cashNet, 1e-6));
  ok("no action: net, three-year cost, benefit and return equal the engine (the tracker fixture)", near(r.net, P.none.net, 1e-6) && r.tco3 === P.tco3 && near(r.benefit3, P.none.benefit3, 0.005) && near(r.roi3, P.none.roi3, 0.005));
  ok("hiring avoidance: realized, net, benefit, return and payback equal the engine", near(h.capacityRealized, P.hiring.realized, 0.005) && near(h.net, P.hiring.net, 0.005) && near(h.benefit3, P.hiring.benefit3, 0.005) && near(h.roi3, P.hiring.roi3, 0.005) && h.payback === P.hiring.payback);
}

section("Coverage");
{
  const RAIL = { "staffing-calculator": "StaffingCalculator.jsx", "cost-per-contact": "CostPerContactCalculator.jsx", "channel-shift": "ChannelShiftModel.jsx", "fcr-leakage": "FCRLeakageDiagnostic.jsx", "ai-deflection": "AIDeflectionRealityCheck.jsx", "tco-calculator": "TCOCalculator.jsx", "license-gap": "LicenseBundleGapChecker.jsx", "attrition-cost": "AttritionCostCalculator.jsx", "business-case-builder": "BusinessCaseBuilder.jsx" };
  ok("all nine rail calculators carry a published method page", Object.keys(RAIL).every((id) => RUBRICS[id] && RUBRICS[id].kind === "calc"));
  ok("every rail PDF names its published method", Object.entries(RAIL).every(([id, f]) => readFileSync("./" + f, "utf8").includes("contactcentercx.com/methodology/" + id)));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
