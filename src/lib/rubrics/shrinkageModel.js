/* Shrinkage Planner, version 1.0. A calculator method (kind "calc").
 *
 * Published at /methodology/shrinkage-planner from this object. The formulas are stated in
 * words, the constants are read from the registry, and the worked example is computed by
 * the same engine the tool runs, at the tool's own defaults, so the page cannot drift from
 * the calculator.
 */
import { benchmark, BENCHMARK_SOURCES } from "../benchmarks.js";
import { runShrinkage } from "../shrinkage.js";

const P = {
  range: { low: benchmark("shrinkage.range.low"), high: benchmark("shrinkage.range.high") },
  load: benchmark("load.benefits"),
  hoursYear: benchmark("time.hours.year"),
  maxTotal: 99,
};
const EXAMPLE = { agents: 200, needed: 140, hourlyRate: benchmark("market.wage.agent"), breaks: 8, coaching: 3, training: 4, meetings: 2, pto: 8, systemDown: 1, absenteeism: 5, lateAdherence: 2 };
const X = runShrinkage(EXAMPLE, P);
const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");
const lo = Math.round(P.range.low * 100), hi = Math.round(P.range.high * 100);

export const SHRINKAGE_MODEL = {
  id: "shrinkage-planner",
  kind: "calc",
  title: "Shrinkage Planner",
  version: "1.0",
  published: "2026-09-24",
  route: "/tools/shrinkage-planner",
  methodology: "/methodology/shrinkage-planner",
  what: "How the Shrinkage Planner totals the paid time that never reaches the queue, turns it into agents on the queue and agents to schedule, and prices the paid time off the queue.",
  claimClasses: "Total shrinkage, agents on the queue and agents to schedule are arithmetic on your inputs. The planning range is an assumption, labelled as a heuristic. The value of paid time off the queue is a conditional forecast at the stated wage, hours and load: wages already paid, described as where paid time goes, never as a saving.",
  formulas: [
    { name: "Total shrinkage", formula: "The sum of every category, each entered as a percent of paid hours", note: "Categories on one base add. The total stops at 99%, because scheduling divides by what is left; a larger sum is corrected and disclosed." },
    { name: "Planned and unplanned", formula: "Planned: breaks, coaching, training, team meetings, PTO. Unplanned: system downtime, absenteeism, late and out of adherence", note: "Planned time is booked ahead; unplanned time happens on the day. PTO is planned because it is booked ahead." },
    { name: "Agents on the queue", formula: "Roster × (1 − total shrinkage)", note: "How many of the rostered agents are handling contacts at any moment, on average." },
    { name: "Agents to schedule", formula: "Agents needed on the queue ÷ (1 − total shrinkage), rounded up", note: "The same gross-up the Staffing Calculator applies. Multiplying the need by one plus shrinkage understates it." },
    { name: "Paid time off the queue", formula: "Roster × total shrinkage × hourly rate × paid hours a year × benefits load", note: "Split into planned and unplanned in proportion to their shares." },
    { name: "One point of shrinkage", formula: "Roster × 1% agents, and that times hourly rate × paid hours a year × benefits load", note: "What one point of the total moves, so a change in any category can be sized." },
  ],
  bands: [
    { label: "Below the planning range", range: "Under " + lo + "%", meaning: "Can mean tight control, or coaching and training time being skipped. Check which before treating it as good." },
    { label: "Within the planning range", range: lo + " to " + hi + "%", meaning: "Inside the range most plans start from. It says nothing about whether the mix is right." },
    { label: "Above the planning range", range: "Over " + hi + "%", meaning: "Worth decomposing by category before it is treated as fixed. The Staffing Calculator flags the same line." },
  ],
  bandsNote: "The planning range is a labelled heuristic shared with the Staffing Calculator. No published benchmark sets it, and the tool attaches no judgement to a position against it.",
  constants: () => ["shrinkage.range.low", "shrinkage.range.high", "time.hours.year", "load.benefits", "market.wage.agent"].map((id) => ({ id, ...BENCHMARK_SOURCES[id] })),
  example: {
    inputs: [["Agents on the roster", String(EXAMPLE.agents)], ["Agents needed on the queue", String(EXAMPLE.needed)], ["Hourly rate", "$" + EXAMPLE.hourlyRate + " (BLS median)"], ["Planned", "breaks 8%, coaching 3%, training 4%, meetings 2%, PTO 8%"], ["Unplanned", "system downtime 1%, absenteeism 5%, late and out of adherence 2%"]],
    steps: [
      ["Total shrinkage", "8 + 3 + 4 + 2 + 8 + 1 + 5 + 2 = " + X.totalPct + "% (" + X.plannedPct + "% planned, " + X.unplannedPct + "% unplanned)"],
      ["Agents on the queue", "200 × " + X.avail.toFixed(2) + " = " + X.onQueueRounded],
      ["Agents to schedule", "140 ÷ " + X.avail.toFixed(2) + " = " + (EXAMPLE.needed / X.avail).toFixed(2) + ", rounded up to " + X.schedule + ", " + X.rosterGap + " more than the roster"],
      ["Paid time off the queue", "200 × " + X.totalPct + "% × $" + EXAMPLE.hourlyRate + " × " + P.hoursYear.toLocaleString("en-US") + " × " + P.load + " = " + usd(X.offQueueValue) + " a year (" + usd(X.plannedValue) + " planned, " + usd(X.unplannedValue) + " unplanned)"],
      ["One point of shrinkage", X.pointAgents + " agents, " + usd(X.pointValue) + " a year"],
    ],
    result: X,
  },
  limits: [
    "Shrinkage here is a planning average. It varies by interval, day and season; schedule by interval where your WFM system allows.",
    "Every category must be on the same base, a percent of paid hours. A category measured against hours present has to be converted first, or the total understates shrinkage.",
    "Agents to schedule start from the agents needed on the queue, which this tool takes as given. The Staffing Calculator sizes that number for a service level.",
    "The value of paid time off the queue is wages already paid. Planned time is part of running the operation, so the figure is no budget for cuts.",
  ],
};
