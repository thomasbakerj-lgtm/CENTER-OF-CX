/* Business Case Builder, version 1.1. A calculator method (kind "calc").
 *
 * Published at /methodology/business-case-builder from this object. The engine lives inside
 * BusinessCaseBuilder.jsx, so this page carries its worked example as pins, and
 * methods.test.mjs recomputes every pin from the tool's own engine.
 */
import { benchmark, BENCHMARK_SOURCES, benchmarksForTool } from "../benchmarks.js";
import { MECH } from "../mech.js";

const usd = (n) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");
const num = (n) => Math.round(n).toLocaleString("en-US");
const b = (id) => benchmark(id);
const st = (k) => ["containment", "handleTime", "fcr", "attrition"].map((x) => Math.round(b(`bcb.stance.${k}.${x}`) * 100) + "%").join(", ");

/* The pins, at the tool's opening case (expected stance, phasing on, no capacity action),
   and the same case with hiring avoidance. Each is recomputed from the engine. */
export const BCB_PINS = {
  loaded: 26.767, marginal: 3.1228, deflected: 216000, handled: 1224000, avoidedRepeats: 76500, avoidedTurnover: 14,
  containment: 674528.4, handleTime: 532395.63, fcr: 238895.47, attrition: 111955.98, gross: 1557775.49,
  capacityNet: 1284542.98, cashNet: 31850, tco3: 1722000,
  none: { net: 31850, benefit3: 65027.08, roi3: -96.22 },
  hiring: { realized: 963407.23, net: 995257.23, benefit3: 2031983.52, roi3: 18.0, payback: 31 },
};
const P = BCB_PINS;

export const BCB_MODEL = {
  id: "business-case-builder",
  kind: "calc",
  title: "Business Case Builder",
  version: "1.1",
  published: "2026-09-25",
  route: "/tools/business-case",
  methodology: "/methodology/business-case-builder",
  what: "How the Business Case Builder turns four improvement levers into a three-year case: what each lever frees, how much of it the stance attributes to the program, how much becomes cash through the capacity action you choose, and how that compares with the investment over a phased timeline.",
  claimClasses: "Every figure is arithmetic on your inputs. The opening case, the attribution stances and the target planning ranges are planning values, labelled as heuristics; the wage is the BLS median and the benefits load the shared load. The return, payback and three-year value are a conditional forecast: freed capacity becomes cash only through the capacity action you select, and no action selected realizes $0.",
  formulas: [
    { name: "Loaded wage and marginal cost", formula: "Loaded = hourly × (1 + benefits). Marginal per contact = AHT ÷ 3,600 × loaded, unless one is entered", note: "A pulled marginal more than " + Math.round(b("bcb.read.marginalStale") * 100) + "% from the derived one is flagged as from a different operation." },
    { name: "Containment", formula: "Contacts × 12 × containment × marginal", note: "Deflected contacts leave the handled pool before any per-contact saving." },
    { name: "Handle time", formula: "Handled contacts × (talk and hold × reduction + after-call work × ACW reduction) ÷ 3,600 × loaded", note: "After-call work is a slice of AHT, so the two reductions never count the same seconds." },
    { name: "First contact resolution", formula: "Repeat contacts × (1 − new failure rate ÷ old failure rate) × marginal", note: "Repeats are your measured same-reason share, or (1 − FCR) ÷ (2 − FCR) on the handled pool." },
    { name: "Attrition", formula: "Agents × attrition × reduction × (recruiting + training days × " + b("bcb.time.trainingHoursDay") + " hours × loaded)", note: "Recruiting is cash; training time is capacity." },
    { name: "Attribution", formula: "Each lever × its stance share. Expected: " + st("expected") + "; conservative: " + st("conservative") + "; aggressive: " + st("aggressive"), note: "Order: containment, handle time, FCR, attrition." },
    { name: "Realization", formula: "Attributed capacity × the capacity action's share + attributed attrition cash", note: "Cash out the door is never scaled. No action realizes $0 of capacity." },
    { name: "Three years", formula: "Month t earns the net × a ramp factor (0 through migration, then linear over the ramp), plus any displaced spend, less the platform fee; one-time cost at month 0", note: "Payback is the first month cumulative cash turns positive." },
    { name: "Return", formula: "(Three-year benefit − three-year cost) ÷ three-year cost, where cost = implementation + exit + backfill + platform fee × agents × 36", note: "Displaced spend counts as a benefit, never netted from the cost." },
  ],
  bands: [
    { label: "Target planning ranges", range: "Containment to " + b("bcb.target.containmentMax") + "%, handle time to " + b("bcb.target.handleTimeMax") + "%, FCR to " + b("bcb.target.fcrMax") + " points, attrition reduction to " + b("bcb.target.attritionMax") + "%", meaning: "Above any, the benefit stream caps at Planning-grade. Internal planning ranges, labelled." },
    { label: "Aggressive stance", range: "No attribution haircut", meaning: "The benefit stream caps at Planning-grade." },
    { label: "Baseline evidence", range: "Handle time, FCR, contact volume and wage: our defaults; your estimate or an unattested system report; a system report you attest", meaning: "The benefit stream grades Directional, Planning-grade or Finance-grade. A baseline pulled from another tool grades by the origin grade it carries, never above Planning-grade. An unanswered question with a baseline edited reads as your estimate." },
    { label: "Fragile case", range: "Pays back, with three-year net under " + Math.round(b("bcb.read.fragileSlack") * 100) + "% of benefit", meaning: "A finding in the read. It never caps a confidence axis." },
  ],
  bandsNote: "The return, payback and whether the case pays back never cap a confidence axis. Evidence is the weaker of the cost stream (the investment's evidence) and the benefit stream (stance, target ambition and where the baselines come from).",
  constants: () => [
    ...benchmarksForTool("business-case-builder").map((e) => e.id),
    "market.wage.agent", "load.benefits",
  ].map((id) => ({ id, ...BENCHMARK_SOURCES[id] })),
  example: {
    note: "Computed by the tool's own engine at its opening case: the expected stance, phasing on (9 months migration, 6 months ramp) and no capacity action, which is how the tool opens. The last step turns on hiring avoidance (" + Math.round(MECH.hiring.f * 100) + "%) to show what realization does.",
    inputs: [["Operation", "200 agents at $" + b("market.wage.agent") + " an hour with 30% benefits, 120,000 contacts a month, AHT 420 seconds with 45 after-call, FCR 72%, attrition 35%"], ["Targets", "containment 15%, handle time 12%, ACW 30%, FCR +8 points, attrition down 20%"], ["Investment", "$750,000 implementation, $135 per agent a month"]],
    steps: [
      ["Loaded and marginal", "$" + P.loaded.toFixed(2) + " an hour; $" + P.marginal.toFixed(2) + " per contact"],
      ["Levers, gross a year", "containment " + usd(P.containment) + ", handle time " + usd(P.handleTime) + ", FCR " + usd(P.fcr) + " (" + num(P.avoidedRepeats) + " repeats), attrition " + usd(P.attrition) + " (" + P.avoidedTurnover + " hires); " + usd(P.gross) + " in all"],
      ["Attributed", usd(P.capacityNet) + " capacity and " + usd(P.cashNet) + " cash at the expected stance"],
      ["No action selected", "net " + usd(P.none.net) + " a year, the attrition cash only; three-year cost " + usd(P.tco3) + "; return " + P.none.roi3.toFixed(0) + "%"],
      ["With hiring avoidance", usd(P.hiring.realized) + " capacity realized, net " + usd(P.hiring.net) + " a year; three-year benefit " + usd(P.hiring.benefit3) + ", return " + P.hiring.roi3.toFixed(0) + "%, payback month " + P.hiring.payback],
    ],
  },
  limits: [
    "The baseline answer is one question for four figures. A single baseline from a weaker source should be answered at that source's level; the tool cannot tell which figure came from where unless it was pulled from another tool.",
    "Freed agent time is not cash. The case shows it three ways: gross, attributed and realized, so the gap is visible.",
    "The ramp is linear after migration. A program that lands in steps pays back later than it shows.",
    "Each lever's target is yours. The planning ranges flag ambition; they do not say a target is wrong.",
  ],
};
