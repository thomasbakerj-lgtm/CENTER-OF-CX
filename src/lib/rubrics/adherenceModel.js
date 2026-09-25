/* Schedule Adherence Impact Calculator, version 1.0. A calculator method (kind "calc").
 *
 * Published at /methodology/schedule-adherence from this object. The formulas are stated in
 * words, the one constant is read from the registry, and the worked example is computed by
 * the same engine the tool runs, at the tool's own defaults.
 */
import { benchmark, BENCHMARK_SOURCES } from "../benchmarks.js";
import { runAdherence, erlangC } from "../adherence.js";

const EXAMPLE = { agents: 100, currentAdherence: 92, callsPerHour: 820, aht: 360, slaTarget: 80, slaTime: 20, hourlyRate: benchmark("market.wage.agent"), otMultiplier: benchmark("adh.ot.multiplier"), hoursPerDay: 8, daysPerYear: 250 };
const X = runAdherence(EXAMPLE);
const M = X.firstMiss;
const pc = (x) => (x * 100).toFixed(1) + "%";
const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");

export const ADHERENCE_MODEL = {
  id: "schedule-adherence",
  kind: "calc",
  title: "Schedule Adherence Impact Calculator",
  version: "1.0",
  published: "2026-09-24",
  route: "/tools/schedule-adherence",
  methodology: "/methodology/schedule-adherence",
  what: "How the Schedule Adherence Impact Calculator turns adherence into agents on the queue, gives the service level Erlang C predicts at today's adherence and each point of loss, and prices the overtime it takes to hold the target.",
  claimClasses: "Offered load, service level and speed of answer are arithmetic from the Erlang C queueing model on your inputs. That adherence equals the share of agents on the queue is a model assumption. The overtime cost is a conditional forecast at your hourly rate, multiplier, open hours and days.",
  formulas: [
    { name: "Offered load", formula: "Calls per hour × AHT in seconds ÷ 3,600", note: "In Erlangs: the agents busy every moment if calls arrived evenly." },
    { name: "Agents on the queue", formula: "Agents scheduled × adherence, rounded", note: "Adherence taken as the share of scheduled agents available at any moment." },
    { name: "Erlang C", formula: "The probability a call waits, through the Erlang B recurrence B(n) = A × B(n−1) ÷ (n + A × B(n−1)), then C = n × B ÷ (n − A × (1 − B))", note: "The same form the Staffing Calculator uses. It stays finite at any size." },
    { name: "Service level", formula: "1 − C × e^(−(agents − load) × answer-within seconds ÷ AHT)", note: "The share answered within the target time. Zero when agents do not exceed the load." },
    { name: "Speed of answer", formula: "C × AHT ÷ (agents − load)", note: "The average wait across all calls." },
    { name: "Agents to schedule for the target", formula: "The fewest agents on the queue that meet the target ÷ adherence, rounded up", note: "Any agents beyond the roster are the gap." },
    { name: "Overtime to hold the target", formula: "Agents beyond the roster × open hours a day × open days a year × hourly rate × overtime multiplier", note: "Assumes the call rate holds across the open hours; peaks need interval staffing." },
  ],
  bands: [
    { label: "Met", range: "Service level at or above your target", meaning: "The agents on the queue answer the target share within the target time." },
    { label: "Missed", range: "Service level below your target", meaning: "Scheduling more agents, or recovering adherence, is needed to hold the target." },
  ],
  bandsNote: "The only line is your own target. The tool grades nothing else.",
  constants: () => ["adh.ot.multiplier", "market.wage.agent"].map((id) => ({ id, ...BENCHMARK_SOURCES[id] })),
  example: {
    inputs: [["Agents scheduled", "100"], ["Adherence", "92%"], ["Calls per hour", "820"], ["AHT", "360 seconds"], ["Target", "80% within 20 seconds"], ["Hourly rate", "$" + EXAMPLE.hourlyRate + " (BLS median)"], ["Overtime", EXAMPLE.otMultiplier + "x, 8 hours a day, 250 days"]],
    steps: [
      ["Offered load", "820 × 360 ÷ 3,600 = " + X.A.toFixed(0) + " Erlangs"],
      ["Today", "100 × 92% = " + X.base.onQueue + " on the queue: service level " + pc(X.base.sl) + ", speed of answer " + Math.round(X.base.asa) + "s, target met"],
      ["Needed for the target", X.need + " agents on the queue meet 80% within 20 seconds"],
      ["First miss", M.adh + "% adherence: " + M.onQueue + " on the queue, service level " + pc(M.sl)],
      ["To hold the target at " + M.adh + "%", X.need + " ÷ " + M.adh + "% = " + (X.need / (M.adh / 100)).toFixed(2) + ", rounded up to " + M.toSchedule + ", " + M.extra + " beyond the roster"],
      ["Overtime", M.extra + " × 8 × 250 × $" + EXAMPLE.hourlyRate + " × " + EXAMPLE.otMultiplier + " = " + usd(M.otCost) + " a year"],
      ["Erlang C check", "10 Erlangs on 11, 12, 13 and 14 agents: " + [11, 12, 13, 14].map((n) => erlangC(n, 10).toFixed(4)).join(", ") + ", the values in published Erlang C tables"],
    ],
    result: X,
  },
  limits: [
    "Adherence rarely falls evenly across the day. A miss concentrated in the peak costs more service level than the same average.",
    "Erlang C assumes callers wait until answered. With abandonment, measured service level runs higher than it predicts.",
    "Overtime assumes one call rate all day. Use interval staffing for peaks, which the Staffing Calculator sizes.",
    "The overtime cost is a conditional forecast. Hiring, cross-skilling or schedule changes can hold the target instead.",
  ],
};
