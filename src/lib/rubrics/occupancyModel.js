/* Occupancy Risk Simulator, version 1.0. A calculator method (kind "calc").
 *
 * Published at /methodology/occupancy-risk from this object. The formulas are stated in
 * words, the constants are read from the registry, and the worked example is computed by
 * the same engine the tool runs, at the tool's own defaults, so the page cannot drift from
 * the calculator.
 */
import { BENCH, benchmark, benchmarksForTool, BENCHMARK_SOURCES } from "../benchmarks.js";
import { runOccupancy } from "../occupancy.js";

const P = {
  bands: BENCH.occupancy,
  mult: { caution: benchmark("occ.attrition.mult.caution"), critical: benchmark("occ.attrition.mult.critical") },
  load: benchmark("load.benefits"),
  hoursWeek: benchmark("time.hours.week"),
  hoursYear: benchmark("time.hours.year"),
};
const EXAMPLE = { agents: 50, callsPerHour: 440, aht: 360, attritionRate: 35, hiringCost: 6500, trainingWeeks: 6, hourlyRate: benchmark("market.wage.agent"), target: 85 };
const X = runOccupancy(EXAMPLE, P);
const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");
const pc = (n, d = 1) => (n * 100).toFixed(d) + "%";

export const OCCUPANCY_MODEL = {
  id: "occupancy-risk",
  kind: "calc",
  title: "Occupancy Risk Simulator",
  version: "1.0",
  published: "2026-09-24",
  route: "/tools/occupancy-risk",
  methodology: "/methodology/occupancy-risk",
  what: "How the Occupancy Risk Simulator turns your queue into an occupancy figure, places it in the platform's shared bands, sizes the staffing to reach your target, and attaches a labelled planning cost to running above it.",
  claimClasses: "Occupancy and the agents needed at each level are arithmetic on your inputs. The bands are the platform's shared operating bands. The attrition multipliers are assumptions, labelled as planning heuristics. Every cost is a conditional forecast: under these assumptions, this is what the model computes.",
  formulas: [
    { name: "Workload", formula: "Calls per hour × AHT in seconds ÷ 3,600", note: "The offered load in Erlangs: how many agents would be busy every moment if work arrived perfectly evenly." },
    { name: "Occupancy", formula: "Workload ÷ agents on queue", note: "At or above 100% the queue grows without limit; the tool says so instead of printing an occupancy above 100%." },
    { name: "Agents at a level", formula: "Workload ÷ occupancy level, rounded up", note: "The fewest agents that keep occupancy at or below that level. It ignores service level, which the Staffing Calculator sizes." },
    { name: "Replacement cost", formula: "Hiring cost + training weeks × hours per week × hourly rate × benefits load", note: "The cost of replacing one agent who leaves: hiring, plus the loaded wages paid while the new hire ramps." },
    { name: "Attrition at a level", formula: "Your attrition × the band's multiplier", note: "Your entered attrition is taken as the rate at or below the healthy band; the caution and critical bands raise it by a labelled multiplier." },
    { name: "Staffing cost to target", formula: "Agents to add × hourly rate × hours per year × benefits load", note: "Cash out the door, never scaled by any realization factor." },
    { name: "Attrition cost of today's occupancy", formula: "(today's multiplier − the target's multiplier) × your attrition × agents × replacement cost", note: "The extra turnover cost the model attaches to running at today's occupancy instead of the target." },
  ],
  bands: [
    { label: "Healthy", range: "At or below " + pc(BENCH.occupancy.healthyMax, 0), meaning: "Agents keep recovery time between contacts. No attrition multiplier." },
    { label: "Caution", range: "Above " + pc(BENCH.occupancy.healthyMax, 0) + " to " + pc(BENCH.occupancy.cautionMax, 0), meaning: "Workable for peaks. The model raises attrition " + P.mult.caution + "x." },
    { label: "Critical", range: "Above " + pc(BENCH.occupancy.cautionMax, 0), meaning: "Minimal recovery time. The model raises attrition " + P.mult.critical + "x, and applies the same when the queue is overloaded." },
  ],
  bandsNote: "These are the platform's shared occupancy bands, the same ones the Staffing Calculator uses, so an occupancy gets the same label in every tool.",
  constants: () => [
    ...benchmarksForTool("occupancy-risk").map((e) => ({ id: e.id, value: e.value, unit: e.unit, kind: e.kind, source: e.source, rationale: e.rationale })),
    ...["time.hours.week", "time.hours.year", "load.benefits", "market.wage.agent"].map((id) => ({ id, ...BENCHMARK_SOURCES[id] })),
  ],
  example: {
    inputs: [["Agents on queue", String(EXAMPLE.agents)], ["Calls per hour", String(EXAMPLE.callsPerHour)], ["AHT", EXAMPLE.aht + " seconds"], ["Attrition", EXAMPLE.attritionRate + "% a year"], ["Hiring cost", usd(EXAMPLE.hiringCost)], ["Training ramp", EXAMPLE.trainingWeeks + " weeks"], ["Hourly rate", "$" + EXAMPLE.hourlyRate + " (BLS median)"], ["Target occupancy", EXAMPLE.target + "%"]],
    steps: [
      ["Workload", "440 × 360 ÷ 3,600 = " + X.intensity.toFixed(1) + " Erlangs"],
      ["Occupancy", X.intensity.toFixed(1) + " ÷ 50 = " + pc(X.occ) + " (" + X.band + ")"],
      ["Agents at 85%", X.intensity.toFixed(1) + " ÷ 0.85 = " + (X.intensity / 0.85).toFixed(2) + ", rounded up to " + X.agentsAtTarget],
      ["Agents to add", "the greater of 0 and " + X.agentsAtTarget + " − 50 = " + X.extraAgents],
      ["Replacement cost", usd(EXAMPLE.hiringCost) + " + 6 × " + P.hoursWeek + " × $" + EXAMPLE.hourlyRate + " × " + P.load + " = " + usd(X.replacementCost)],
      ["Staffing cost to target", X.extraAgents + " × $" + EXAMPLE.hourlyRate + " × " + P.hoursYear.toLocaleString("en-US") + " × " + P.load + " = " + usd(X.staffingCost) + " a year"],
      ["Attrition cost of today's occupancy", "(" + X.curMult + " − " + X.targetMult + ") × 35% × 50 × " + usd(X.replacementCost) + " = " + usd(X.excessAttritionCost) + " a year"],
    ],
    result: X,
  },
  limits: [
    "Occupancy here is an hourly average. Real queues vary within the hour, so occupancy at peak intervals runs higher than this figure.",
    "The attrition multipliers are planning heuristics. No published study gives the attrition rise at a given occupancy for your operation; use your own exit data where you have it.",
    "Agents at each level ignore service level and shrinkage. The Staffing Calculator sizes both.",
    "Costs are conditional forecasts under the stated assumptions, not savings or budgets.",
  ],
};
