/* Staffing Requirement Calculator, version 1.2. A calculator method (kind "calc").
 *
 * Published at /methodology/staffing-calculator from this object. The engine lives inside
 * StaffingCalculator.jsx, so this page carries its worked examples as pins, and
 * methods.test.mjs recomputes every pin from the tool's own engine: the page cannot drift
 * from the calculator without failing the suite.
 */
import { BENCH, benchmark, BENCHMARK_SOURCES, benchmarksForTool } from "../benchmarks.js";

const pc = (x, d = 1) => (x * 100).toFixed(d) + "%";
const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");
const WAGE = benchmark("market.wage.agent"), LOAD = benchmark("load.fullyLoaded"), HOURS = benchmark("staffing.hours.month");
const RATIO = benchmark("staffing.validity.ratio");

/* The pins. Each is recomputed from the engine by methods.test.mjs. */
export const STAFFING_PINS = {
  defaults: { volume: 400, aht: 360, interval: 30, slT: 0.8, slS: 20, shrink: 0.3, load: 80, base: 88, fte: 126, sl: 0.81804, asa: 12.77, occ: 0.90909, perAgentMonth: 7263.15, annual: 10981876 },
  year: { volume: 400, aht: 360, interval: 30, slT: 0.8, slS: 20, shrink: 0.3, hoursOpen: 168, avgShare: 60, avgVolume: 240, avgBase: 55, avgFte: 79, factor: 4.2, fte: 331.8, annual: 28918940 },
  nextiva: { volume: 400, aht: 257, interval: 30, slT: 0.8, slS: 20, shrink: 0.3, cap: 0.85, load: 57.11, base: 68, fte: 98, occ: 0.84, capped: true },
};
const D = STAFFING_PINS.defaults, N = STAFFING_PINS.nextiva, Y = STAFFING_PINS.year;

export const STAFFING_MODEL = {
  id: "staffing-calculator",
  kind: "calc",
  title: "Staffing Requirement Calculator",
  version: "1.2",
  published: "2026-09-30",
  route: "/tools/staffing-calculator",
  methodology: "/methodology/staffing-calculator",
  what: "How the Staffing Requirement Calculator turns contacts, handle time and a service level target into agents on the phones and scheduled FTE for your busiest interval through Erlang C, then prices a year from the hours you are open and your average interval.",
  claimClasses: "Offered load, service level, speed of answer and the agents that meet the target are arithmetic from the Erlang C queueing model on your inputs. The operating profiles are assumptions, labelled as heuristics, and a driver still at a profile grades Directional. The annual cost is a conditional forecast at the cost basis shown: your TCO figure when one arrives over the rail, otherwise the BLS median wage fully loaded. The hours open and the average interval open at 40 hours and 100% of the busiest interval, our defaults, and a yearly cost that still rests on either grades Directional.",
  formulas: [
    { name: "Offered load", formula: "Contacts per interval × AHT in seconds ÷ (interval minutes × 60)", note: "In Erlangs: the agents busy every moment if contacts arrived evenly." },
    { name: "Erlang C", formula: "Erlang B by recurrence, B(n) = A × B(n−1) ÷ (n + A × B(n−1)); then C = B ÷ (1 − (A ÷ n) × (1 − B))", note: "The probability a contact waits. The recurrence stays finite at any size." },
    { name: "Service level", formula: "1 − C × e^(−(agents − load) × threshold seconds ÷ AHT)", note: "The share answered within the threshold." },
    { name: "Base agents", formula: "The fewest agents above the load that meet the target, searched upward from the first whole count above the load", note: "Agents on the phones, before shrinkage." },
    { name: "Occupancy ceiling", formula: "Agents at least load ÷ ceiling, when a ceiling is set", note: "The larger of the target's agents and the ceiling's agents is used, and the tool says which one set headcount." },
    { name: "Scheduled FTE", formula: "Base agents ÷ (1 − shrinkage), rounded up", note: "Paid staff needed to keep the base agents on the phones." },
    { name: "Average interval", formula: "Busiest interval contacts × your average interval share, then Erlang C and shrinkage as above", note: "The FTE an average open interval needs. At 100% it is the busiest interval itself." },
    { name: "FTE on payroll", formula: "Scheduled FTE for the average interval × hours open a week ÷ 40", note: "A full-time agent covers 40 hours a week, so a center open 168 hours needs 4.2 times the seats of one interval. A planning ceiling: it takes no credit for part-time shifts fitted to the day." },
    { name: "Annual cost", formula: "FTE on payroll × cost per agent per month × 12", note: "Per agent per month is your TCO figure, or your TCO wage × " + LOAD + " × " + HOURS + " hours, or the BLS median $" + WAGE + " × " + LOAD + " × " + HOURS + " hours." },
    { name: "Pooling penalty", formula: "Queues × FTE for one queue's share of volume − FTE for the pooled volume", note: "An upper bound: it assumes independent queues with no overflow between them. Priced for the year at the average interval across your hours open, like the recovery time cost." },
    { name: "Abandonment check", formula: "C × θ ÷ (θ + (agents − load) ÷ AHT), with θ = 1 ÷ average patience", note: "An Erlang A approximation, shown only when you enter patience and the effect is material." },
  ],
  bands: [
    { label: "Healthy occupancy", range: "At or below " + pc(BENCH.occupancy.healthyMax, 0), meaning: "The platform's shared occupancy bands, the same in every tool." },
    { label: "Caution", range: "Above " + pc(BENCH.occupancy.healthyMax, 0) + " to " + pc(BENCH.occupancy.cautionMax, 0), meaning: "Workable for peaks; the read names the recovery-time trade." },
    { label: "Critical", range: "Above " + pc(BENCH.occupancy.cautionMax, 0), meaning: "The read shows the sustainable pair: the agents a " + pc(BENCH.occupancy.targetHigh, 0) + " ceiling would add." },
    { label: "Model validity", range: "Interval at least " + RATIO + " times AHT", meaning: "Below it, contacts carry across intervals and Erlang C understates staffing; the tool says so and grades completeness Directional." },
  ],
  bandsNote: "Shrinkage above the " + pc(BENCH.shrinkage.typicalLow, 0) + " to " + pc(BENCH.shrinkage.typicalHigh, 0) + " planning range, a labelled heuristic, is flagged as worth decomposing. Every other line is a threshold in the registry with its rationale.",
  constants: () => [
    ...["staffing.preset.general.vol", "staffing.preset.general.aht", "staffing.preset.general.slT", "staffing.preset.general.slS", "staffing.preset.general.shrink"],
    ...benchmarksForTool("staffing-calculator").map((e) => e.id).filter((id) => !id.startsWith("staffing.preset.")),
    "market.wage.agent", "load.fullyLoaded", "shrinkage.range.low", "shrinkage.range.high",
  ].map((id) => ({ id, ...BENCHMARK_SOURCES[id] })),
  example: {
    note: "Computed by the tool's own engine. The first case is the tool's opening profile; the second reproduces a published staffing example (Nextiva's worked Erlang C case: 400 calls, 257-second handle time, 80% in 20 seconds, 85% occupancy cap), so the arithmetic can be checked against a source outside this site.",
    inputs: [["Opening case", "400 contacts per 30 minutes, 360-second AHT, 80% in 20 seconds, 30% shrinkage, open 40 hours a week with every interval as busy as the busiest"], ["Open all week", "The same busiest interval, open " + Y.hoursOpen + " hours a week, the average interval at " + Y.avgShare + "% of the busiest"], ["Published case", "400 contacts per 30 minutes, 257-second AHT, 80% in 20 seconds, 85% occupancy ceiling"]],
    steps: [
      ["Offered load, opening case", "400 × 360 ÷ 1,800 = " + D.load + " Erlangs"],
      ["Base agents", D.base + " agents give " + pc(D.sl) + " in 20 seconds, speed of answer " + D.asa.toFixed(0) + "s, occupancy " + pc(D.occ)],
      ["Scheduled FTE", D.base + " ÷ (1 − 30%) = " + (D.base / 0.7).toFixed(2) + ", rounded up to " + D.fte],
      ["Annual cost at the benchmark basis", D.fte + " × $" + D.perAgentMonth.toLocaleString("en-US", { minimumFractionDigits: 2 }) + " a month × 12 = " + usd(D.annual) + " ($" + WAGE + " × " + LOAD + " × " + HOURS + " hours = $" + D.perAgentMonth.toLocaleString("en-US", { minimumFractionDigits: 2 }) + " a month)"],
      ["Open all week", "average interval " + Y.avgVolume + " contacts, " + Y.avgBase + " base agents, " + Y.avgFte + " FTE; × " + Y.hoursOpen + " ÷ 40 = " + Y.factor + ", so " + Y.fte.toLocaleString("en-US") + " FTE on payroll and " + usd(Y.annual) + " a year at the same basis"],
      ["Published case", "load " + N.load.toFixed(2) + " Erlangs; the 85% ceiling sets headcount at " + N.base + " base agents, " + N.fte + " FTE at 30% shrinkage, occupancy " + pc(N.occ) + ", the published result"],
    ],
  },
  limits: [
    "Erlang C assumes callers wait until answered. With abandonment, measured service level runs higher than it predicts; enter patience for the Erlang A check.",
    "It models one contact per agent at a time, which fits voice. Chat and messaging agents handle several at once and need a different model.",
    "One interval is one steady state. The year uses one average interval across your hours open, a planning ceiling; peaks, intraday patterns and schedule fit need interval staffing across the day.",
    "The cost basis is the benchmark wage unless your TCO run supplies one; the grade says which.",
  ],
};
