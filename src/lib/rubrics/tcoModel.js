/* TCO Calculator, version 1.0. A calculator method (kind "calc").
 *
 * Published at /methodology/tco-calculator from this object. The engine lives inside
 * TCOCalculator.jsx, so this page carries its worked example as pins, and
 * methods.test.mjs recomputes every pin from the tool's own engine.
 */
import { BENCH, benchmark, BENCHMARK_SOURCES, benchmarksForTool } from "../benchmarks.js";

const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");
const usd2 = (n) => "$" + n.toFixed(2);
const num = (n) => Math.round(n).toLocaleString("en-US");
const pc = (x, d = 1) => (x * 100).toFixed(d) + "%";
const b = (id) => benchmark(id);

/* The pins, at the tool's opening case (the cross-industry profile, expected stance,
   costs as estimates). Each is recomputed from the engine. */
export const TCO_PINS = {
  loaded: 24.7, agentLabor: 854620, labor: 1089467.5, tech: 106317.5, overhead: 78547.2, monthly: 1274332.2,
  annual: 15291986.4, costPerContact: 10.6194, costPerResolution: 13.8053, marginalPerContact: 2.7549,
  monthlyHires: 7, perHire: 7649.6, attritionCost: 53547.2, telephony: 9487.5, seats: 229,
  y2: 15851130.17, y3: 16431820.92, threeYear: 47574937.49, perAgentMonth: 6371.66,
  optGross: 71000, optNet: 51000,
};
const P = TCO_PINS;
const STANCES = "none 0%, conservative 50%, expected 70%, aggressive 100%";

export const TCO_MODEL = {
  id: "tco-calculator",
  kind: "calc",
  title: "TCO Calculator",
  version: "1.0",
  published: "2026-09-25",
  route: "/tools/tco-calculator",
  methodology: "/methodology/tco-calculator",
  what: "How the TCO Calculator builds the monthly, annual and three-year cost of a contact center from labor, technology and overhead, what that means per contact and per resolution, and what four improvement levers are worth at the realization stance you choose.",
  claimClasses: "Every cost line and total is arithmetic on your inputs. The seven industry profiles, the salaried load and the license uplift are internal planning values, labelled as heuristics; a field still at its profile grades Directional, and Planning-grade needs every graded field set off the profile. The wage escalator is a sourced market figure. The optimization figures are a conditional forecast at the realization stance you pick.",
  formulas: [
    { name: "Agent labor", formula: "Agents × hourly wage × (1 + benefits load) × " + b("tco.hours.month") + " paid hours", note: "Paid hours, because you pay for shrinkage. The benefits load opens at the shared " + b("load.benefits") + "." },
    { name: "Salaried labor", formula: "Headcount × hourly rate × " + b("tco.load.salaried") + " × " + b("tco.hours.month") + " hours, for supervisors, QA, WFM, trainers and IT", note: "The salaried load is this tool's own planning value." },
    { name: "Attrition", formula: "round(agents × annual attrition ÷ 12) hires × (recruiting cost + training days × 8 hours × loaded wage)", note: "Carried in overhead." },
    { name: "Telephony", formula: "Contacts × voice share × (AHT − after-call work) ÷ 60 × price per minute", note: "Billed on line-open minutes; the agent is still paid for after-call work." },
    { name: "Technology", formula: "Seats × (CCaaS + WEM + CRM seat prices) + AI usage + analytics + iPaaS + recording + knowledge + security + telephony", note: "Seats are agents, supervisors, QA and WFM." },
    { name: "Overhead", formula: "Cloud infrastructure + amortized professional services + facilities + attrition", note: "" },
    { name: "Unit costs", formula: "Cost per contact = monthly TCO ÷ contacts. Cost per resolution = cost per contact × (2 − FCR). Marginal per contact = AHT minutes × loaded wage per minute + voice share × line-open minutes × telephony price", note: "Cost per resolution uses the one-plus-repeat model. Savings are valued at the marginal cost." },
    { name: "Three years", formula: "Year one = annual. Years two and three escalate labor and attrition at the wage rate and contracted software at the license rate; telephony and facilities stay flat. Plus any one-time implementation, once", note: "A single blended rate is offered but misstates a labor-heavy base." },
    { name: "Optimizations", formula: "Containment: deflected contacts × marginal. FCR: avoided repeats on the handled pool × marginal. AHT: seconds saved × remaining handled contacts × loaded per minute. Attrition: fewer hires × cost per hire. Each × the stance", note: "Applied in order so no contact is counted twice; rounded to the nearest $1,000. Stances: " + STANCES + "." },
  ],
  bands: [
    { label: "Sensitivity on totals", range: "Estimates ±25%, quotes ±15%, invoices ±10%", meaning: "The range printed around annual and three-year cost by cost basis." },
    { label: "Plausibility checks", range: "Cost per agent over $" + num(b("tco.check.perAgentCeiling")) + " a month; one software line over " + pc(b("tco.check.domShareMax"), 0) + " of the bucket; span over " + b("tco.check.spanMax") + " agents per supervisor; channel mix off 100% by more than " + pc(b("tco.check.mixTol")), meaning: "Each is disclosed and holds completeness Directional; AI usage is exempt from the software share check." },
    { label: "Occupancy note", range: "Above " + pc(BENCH.occupancy.cautionMax, 0), meaning: "The read points to the Occupancy Risk Simulator before assuming a saving is free." },
  ],
  bandsNote: "The optimization total and the stance never cap a confidence axis.",
  constants: () => [
    ...benchmarksForTool("tco-calculator").map((e) => e.id),
    "load.benefits",
  ].map((id) => ({ id, ...BENCHMARK_SOURCES[id] })),
  example: {
    note: "Computed by the tool's own engine at its opening case: the cross-industry profile, the expected stance and costs as estimates.",
    inputs: [["Operation", "200 agents at $" + b("tco.wage.general") + " an hour, 120,000 contacts a month, AHT 6:30 with 45 seconds after-call work, FCR 70%, containment 28%, attrition 40%"], ["Staff", "20 supervisors, 5 QA, 4 WFM, 3 trainers, 4 IT"], ["Technology", "$150 CCaaS, $45 WEM and $75 CRM a seat; voice 55% at $0.025 a minute; AI, analytics and platform lines at the profile"]],
    steps: [
      ["Loaded wage", "$19 × " + b("load.benefits") + " = " + usd2(P.loaded) + " an hour; agent labor " + usd(P.agentLabor) + " a month"],
      ["Labor", usd(P.labor) + " with salaried staff"],
      ["Technology", P.seats + " seats; telephony " + usd(P.telephony) + "; technology " + usd(P.tech)],
      ["Overhead", P.monthlyHires + " hires a month at " + usd2(P.perHire) + " = " + usd(P.attritionCost) + "; overhead " + usd(P.overhead)],
      ["Monthly and annual", usd(P.monthly) + " a month, " + usd(P.annual) + " a year, " + usd(P.perAgentMonth) + " per agent a month"],
      ["Unit costs", usd2(P.costPerContact) + " per contact, " + usd2(P.costPerResolution) + " per resolution, " + usd2(P.marginalPerContact) + " marginal"],
      ["Three years", usd(P.annual) + " + " + usd(P.y2) + " + " + usd(P.y3) + " = " + usd(P.threeYear)],
      ["Optimizations", usd(P.optGross) + " a month gross, " + usd(P.optNet) + " at the expected 70%"],
    ],
  },
  limits: [
    "The industry profiles are planning values that let the tool open on a runnable case. Replace every graded field with your own before relying on a total; the grade says how many remain.",
    "Cost per resolution uses the one-plus-repeat model (2 − FCR). An observed recontact rate is more precise.",
    "The optimization levers are sized against your targets. They show what a lever is worth, never how to reach it.",
    "Freed capacity is not cash until an action converts it; the stance is the haircut you choose, and none books $0.",
  ],
};
