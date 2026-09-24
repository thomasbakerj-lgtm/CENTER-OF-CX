/* Forecast Accuracy Tracker, version 1.0. A calculator method (kind "calc").
 *
 * Published at /methodology/forecast-accuracy from this object. The formulas are stated in
 * words, the one threshold is read from the registry, and both worked examples are computed
 * by the same engine the tool runs, so the page cannot drift from the calculator.
 */
import { benchmark, BENCHMARK_SOURCES } from "../benchmarks.js";
import { runForecast } from "../forecast.js";

const P = { tsLimit: benchmark("forecast.ts.limit"), intervalMin: 30 };
/* Two intervals that miss by 20 contacts in opposite directions: the day's total is exact. */
const PAIR = [{ interval: "9:00", forecast: 100, actual: 80 }, { interval: "9:30", forecast: 100, actual: 120 }];
const X = runForecast(PAIR, P, 360);
const pc = (x) => (x * 100).toFixed(1) + "%";

export const FORECAST_MODEL = {
  id: "forecast-accuracy",
  kind: "calc",
  title: "Forecast Accuracy Tracker",
  version: "1.0",
  published: "2026-09-24",
  route: "/tools/forecast-accuracy",
  methodology: "/methodology/forecast-accuracy",
  what: "How the Forecast Accuracy Tracker measures forecast error interval by interval, why it leads with the volume-weighted error, how it tells a leaning forecast from random error, and how it turns contacts missed into workload.",
  claimClasses: "Every accuracy measure is arithmetic on the forecast and actual contacts you enter; they are historical facts about those intervals. The tracking signal limit is a textbook convention, labelled as a threshold. Workload hours and agents busy are conditional on the AHT you enter and ignore service level and shrinkage.",
  formulas: [
    { name: "WAPE", formula: "Sum over intervals of |actual − forecast| ÷ sum of actual contacts", note: "The volume-weighted error: every contact missed counts once, above or below. Staffing is planned on this." },
    { name: "Interval accuracy", formula: "1 − WAPE", note: "The headline. It falls below zero only when contacts missed exceed the contacts that arrived." },
    { name: "MAPE", formula: "Mean over intervals with actual contacts of |actual − forecast| ÷ actual", note: "Shown beside WAPE. A 5-contact interval weighs as much as a 100-contact one, so quiet intervals inflate it." },
    { name: "Total-volume accuracy", formula: "1 − |total actual − total forecast| ÷ total forecast", note: "The day's total. Errors in opposite directions cancel, so it can read high while every interval misses." },
    { name: "Bias", formula: "(total actual − total forecast) ÷ total forecast", note: "A fact about the day's direction." },
    { name: "Tracking signal", formula: "Sum of (actual − forecast) ÷ mean absolute error", note: "Whether the errors lean one way. Read against the limit below." },
    { name: "Workload hours and agents busy", formula: "Contacts × AHT ÷ 3,600; per interval, contacts × AHT ÷ (30 × 60)", note: "The workload the miss represents, before service level and shrinkage, which the Staffing Calculator adds." },
  ],
  bands: [
    { label: "Forecast running low", range: "Tracking signal above +" + P.tsLimit, meaning: "Actual ran above forecast more consistently than random error would." },
    { label: "No consistent lean", range: "Within plus or minus " + P.tsLimit, meaning: "Any bias is not distinguished from random error." },
    { label: "Forecast running high", range: "Tracking signal below -" + P.tsLimit, meaning: "Actual ran below forecast more consistently than random error would." },
  ],
  bandsNote: "The tool grades no accuracy figure. It publishes no excellent or acceptable line for WAPE or MAPE, because no published benchmark sets one for your channel and interval length.",
  constants: () => ["forecast.ts.limit"].map((id) => ({ id, ...BENCHMARK_SOURCES[id] })),
  example: {
    note: "Computed by the tool's own engine on two intervals chosen to show why the tool leads with WAPE: they miss by 20 contacts in opposite directions, so the day's total is exact.",
    inputs: [["9:00", "forecast 100, actual 80"], ["9:30", "forecast 100, actual 120"], ["AHT", "360 seconds"]],
    steps: [
      ["Total-volume accuracy", "200 actual against 200 forecast = " + pc(X.totalAccuracy)],
      ["WAPE", "(20 + 20) ÷ 200 = " + pc(X.wape) + ", interval accuracy " + pc(X.intervalAccuracy)],
      ["MAPE", "(20 ÷ 80 + 20 ÷ 120) ÷ 2 = " + pc(X.mape)],
      ["Tracking signal", "(−20 + 20) ÷ 20 = " + X.trackingSignal.toFixed(1) + ", no consistent lean"],
      ["Workload", "20 contacts × 360 ÷ 3,600 = " + X.underHours.toFixed(1) + " hours unplanned at 9:30 and " + X.overHours.toFixed(1) + " planned with no contacts at 9:00; " + X.perInterval[1].agents.toFixed(1) + " agents busy for the 9:30 interval"],
    ],
    result: X,
  },
  limits: [
    "Accuracy here is measured on the intervals entered. One day is a small sample; the tracking signal is more telling across weeks.",
    "WAPE and MAPE depend on the interval length. A daily forecast always scores better than the same forecast read by half hour.",
    "Agents busy ignore service level and shrinkage, so the agents needed to answer the missed contacts on time are more.",
    "The sample volumes are illustrative. Enter your own forecast and actual contacts for a result about your operation.",
  ],
};
