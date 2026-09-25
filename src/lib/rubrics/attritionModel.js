/* Attrition Cost Calculator, version 1.0. A calculator method (kind "calc").
 *
 * Published at /methodology/attrition-cost from this object. The engine lives inside
 * AttritionCostCalculator.jsx, so this page carries its worked example as pins, and
 * methods.test.mjs recomputes every pin from the tool's own engine.
 */
import { benchmark, BENCHMARK_SOURCES, benchmarksForTool } from "../benchmarks.js";
import { MECH, MECH_INITIAL } from "../mech.js";

const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");
const usd2 = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pc = (x, d = 0) => (x * 100).toFixed(d) + "%";
const b = (id) => benchmark(id);
const H = MECH[MECH_INITIAL];

/* The pins, at the tool's opening case. Each is recomputed from the engine. */
export const ATTRITION_PINS = {
  salary: 42827, departures: 70, hires: 70, loadedHourly: 26.766875, recruiting: 2884, training: 7324.05, vacancy: 1482.47,
  cashPerDeparture: 11690.52, nestingLoss: 2141.35, rampLoss: 3533.23, supervisorBurden: 550, capacityPerDeparture: 6224.58,
  allInPerDeparture: 17915.10, pctSalary: 41.83, annualReplBurden: 1254057.04, earlyWashouts: 18, earlyWaste: 183744.9,
  step: 10, avoided: 20, stepCash: 233810.46, stepCap: 93368.66, stepTotal: 327179.12,
};
const P = ATTRITION_PINS;

export const ATTRITION_MODEL = {
  id: "attrition-cost",
  kind: "calc",
  title: "Attrition Cost Calculator",
  version: "1.0",
  published: "2026-09-25",
  route: "/tools/attrition-cost",
  methodology: "/methodology/attrition-cost",
  what: "How the Attrition Cost Calculator prices each agent departure as cash that leaves and capacity lost while a new hire ramps, what that costs a year, and what a lower attrition rate would avoid.",
  claimClasses: "Every cost is arithmetic on your inputs. The opening case is a set of planning values, labelled as heuristics; the salary is the BLS median wage over a 2,080 hour year, the benefits load the platform's shared load and the overtime premium the FLSA minimum. The avoided cost of a lower rate is a conditional forecast: avoided cash counts in full, recovered capacity only through the capacity action you select.",
  formulas: [
    { name: "Departures and hires", formula: "Departures = round(agents × annual attrition). Hires = round(departures × backfill share)", note: "Seats not refilled are a capacity decision the tool routes to Staffing and Occupancy, never a free saving." },
    { name: "Loaded hourly", formula: "Salary ÷ " + b("time.hours.year") + " × (1 + benefits load)", note: "" },
    { name: "Cash per departure", formula: "Recruiting + screening hours × HR rate + training days × " + b("attrition.time.hoursDay") + " hours × (loaded hourly + trainer rate ÷ class size) + sign-on + vacancy", note: "Training weeks are " + b("attrition.time.daysWeek") + " days." },
    { name: "Vacancy", formula: "Vacancy days × " + b("attrition.time.hoursDay") + " hours × share covered by overtime × wage × overtime premium", note: "Incremental by default: only the premium, because the departed agent's pay has stopped. Gross coverage is offered and flagged as a double-count risk." },
    { name: "Capacity per departure", formula: "Nesting weeks × " + b("attrition.time.daysWeek") + " × " + b("attrition.time.hoursDay") + " × loaded hourly × (1 − nesting productivity) + ramp months × " + b("attrition.time.workdaysMonth") + " × " + b("attrition.time.hoursDay") + " × loaded hourly × (1 − ramp productivity) + supervisor hours × supervisor rate", note: "Time paid for and not yet productive. Recovered only if you act on it." },
    { name: "Annual burden", formula: "Hires × (cash + capacity) per departure", note: "Early-washout waste is washouts × the cash sunk in each hire." },
    { name: "Cost as a share of salary", formula: "All-in per departure ÷ salary", note: "Tested against the frontline planning band below." },
    { name: "Avoided by a lower rate", formula: "Departures avoided × backfill × (cash per departure + capacity per departure × the action's share)", note: "Priced at 5, 10, 15 and 20 points lower. With a cost per point, net and return are shown." },
  ],
  bands: [
    { label: "Frontline planning band", range: b("attrition.band.low") + " to " + b("attrition.band.high") + "% of salary", meaning: "Inside it, completeness can reach Finance-grade. A planning check set by this platform, not a published study." },
    { label: "Plausible range", range: b("attrition.band.floor") + "% to the band's lower edge", meaning: "Completeness Planning-grade." },
    { label: "Outside", range: "Under " + b("attrition.band.floor") + "% or over " + b("attrition.band.high") + "%; over " + b("attrition.band.ceiling") + "% is flagged as manager tier", meaning: "Completeness Directional; validate the inputs." },
    { label: "Range on the cost", range: "Estimates ±" + pc(b("attrition.band.estimate")) + ", HR data ±" + pc(b("attrition.band.hrdata")) + ", finance-confirmed ±" + pc(b("attrition.band.finance")), meaning: "Display only." },
  ],
  bandsNote: "Attrition under " + b("attrition.read.rateLow") + "% or over " + b("attrition.read.rateHigh") + "% is flagged for its denominator; over " + b("attrition.read.rateExtreme") + "% is a high flag. None of these, and no size of burden, caps a confidence axis.",
  constants: () => [
    ...benchmarksForTool("attrition-cost").map((e) => e.id),
    "market.wage.agent", "time.hours.year", "load.benefits", "adh.ot.multiplier",
  ].map((id) => ({ id, ...BENCHMARK_SOURCES[id] })),
  example: {
    note: "Computed by the tool's own engine at its opening case, with the capacity action the tool opens on (" + H.label.toLowerCase() + ", " + pc(H.f) + ").",
    inputs: [["Operation", "200 agents, 35% attrition, full backfill, 25% early washout"], ["Pay", usd(P.salary) + " salary (BLS $" + b("market.wage.agent") + " × 2,080), 30% benefits load"], ["Hiring", "$2,500 recruiting plus 8 screening hours at $48; 6 weeks training at $45 a trainer hour, classes of 12; 4 weeks nesting at 50%, 3 months ramp at 75%; 10 supervisor hours at $55; 30 vacancy days, 60% covered by overtime at a 50% premium"]],
    steps: [
      ["Departures", P.departures + " a year, all refilled; loaded hourly " + usd2(P.loadedHourly)],
      ["Cash per departure", usd(P.recruiting) + " recruiting + " + usd2(P.training) + " training + " + usd2(P.vacancy) + " vacancy = " + usd2(P.cashPerDeparture)],
      ["Capacity per departure", usd2(P.nestingLoss) + " nesting + " + usd2(P.rampLoss) + " ramp + " + usd(P.supervisorBurden) + " coaching = " + usd2(P.capacityPerDeparture)],
      ["All-in", usd2(P.allInPerDeparture) + ", " + P.pctSalary.toFixed(1) + "% of salary, inside the planning band"],
      ["Annual burden", P.hires + " × " + usd2(P.allInPerDeparture) + " = " + usd(P.annualReplBurden) + "; " + P.earlyWashouts + " early washouts waste " + usd(P.earlyWaste)],
      ["10 points lower", P.avoided + " departures avoided: " + usd(P.stepCash) + " cash + " + usd(P.stepCap) + " capacity at " + pc(H.f) + " = " + usd(P.stepTotal) + " a year"],
    ],
  },
  limits: [
    "Capacity lost to nesting and ramp is time you paid for. It becomes cash only if an action converts it; the tool credits it at the selected action's share and never scales cash out the door.",
    "Seats not refilled carry no replacement cost here. Their cost is lost output, overtime and service level, which Staffing and Occupancy model.",
    "The frontline band is a planning check. Your own replacement-cost history is the better test where you have one.",
    "The rate you enter should be separations over average headcount, rolling twelve months. A bad month annualized, or headcount taken at period end, overstates it.",
  ],
};
