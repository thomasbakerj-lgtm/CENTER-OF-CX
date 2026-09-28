/* Attrition Cost Calculator, version 1.0. A calculator method (kind "calc").
 *
 * Published at /methodology/attrition-cost from this object. The engine lives inside
 * AttritionCostCalculator.jsx, so this page carries its worked example as pins, and
 * methods.test.mjs recomputes every pin from the tool's own engine.
 */
import { benchmark, BENCHMARK_SOURCES, benchmarksForTool } from "../benchmarks.js";
import { MECH } from "../mech.js";

const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");
const usd2 = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pc = (x, d = 0) => (x * 100).toFixed(d) + "%";
const b = (id) => benchmark(id);
/* The worked example runs at avoided hiring. The tool opens with no capacity action (F2), which realizes $0, so the
   example names the action it uses. */
const H = MECH.hiring;

/* The pins, at the tool's opening case. Each is recomputed from the engine. */
import { ATTRITION_DRIVERS } from "./attritionDrivers.js";

export const ATTRITION_PINS = {
  salary: 44782, departures: 70, hires: 70, loadedHourly: 27.98875, recruiting: 2879.68, training: 7583.3, vacancy: 1550.15,
  cashPerDeparture: 12013.13, nestingLoss: 2239.1, rampLoss: 3694.515, supervisorBurden: 434.3, capacityPerDeparture: 6367.915,
  allInPerDeparture: 18381.04, pctSalary: 41.05, annualReplBurden: 1286672.88, earlyWashouts: 18, earlyWaste: 188333.64,
  step: 10, avoided: 20, stepCash: 240262.52, stepCap: 95518.725, stepTotal: 335781.25,
};
const P = ATTRITION_PINS;
/* A BLS median at the shared benefits load, as the tool opens on it: "$47.46 (BLS $36.51 median, loaded)". */
const lb = (id) => "$" + (Math.round(b(id) * b("load.benefits") * 100) / 100).toFixed(2) + " (BLS $" + b(id).toFixed(2) + " median, loaded)";

export const ATTRITION_MODEL = {
  id: "attrition-cost",
  kind: "calc",
  title: "Attrition Cost Calculator",
  version: "1.3",
  published: "2026-09-28",
  /* The root-cause check (method 1.2), published on the method page from the object the tool scores. */
  checks: ATTRITION_DRIVERS,
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
    note: "Computed by the tool's own engine at its opening case, with avoided hiring as the capacity action (" + pc(H.f) + " of freed capacity). The tool itself opens with no action chosen, which realizes $0.",
    inputs: [["Operation", "200 agents, 35% attrition, full backfill, 25% early washout"], ["Pay", usd(P.salary) + " salary (BLS $" + b("market.wage.agent") + " × 2,080), 30% benefits load"], ["Hiring", "$2,500 recruiting plus 8 screening hours at " + lb("market.wage.hr") + "; 6 weeks training at " + lb("market.wage.trainer") + " a trainer hour, classes of 12; 4 weeks nesting at 50%, 3 months ramp at 75%; 10 supervisor hours at " + lb("market.wage.supervisor") + "; 30 vacancy days, 60% covered by overtime at a 50% premium"]],
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
