/* FCR Leakage Diagnostic, version 1.0. A calculator method (kind "calc").
 *
 * Published at /methodology/fcr-leakage from this object. The engine lives inside
 * FCRLeakageDiagnostic.jsx, so this page carries its worked example as pins, and
 * methods.test.mjs recomputes every pin from the tool's own engine.
 */
import { benchmark, BENCHMARK_SOURCES, benchmarksForTool } from "../benchmarks.js";
import { MECH, MECH_INITIAL } from "../mech.js";

const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");
const num = (n) => Math.round(n).toLocaleString("en-US");
const pc = (x, d = 1) => (x * 100).toFixed(d) + "%";
const H = MECH[MECH_INITIAL];
const b = (id) => benchmark(id);

/* The pins: the tool's opening inputs with a declared cross-channel scope, an internal
   7-day window and every diagnostic statement answered at 3. Recomputed from the engine. */
export const FCR_PINS = {
  dScore: 3, repeatShare: 0.21875, repeats: 10937.5, burdenYr: 853125, opp: 0.475, cap: 0.575,
  practicalMax: 0.9, ceilingFCR: 0.7691625, target: 0.7691625, repeatsT: 9377.25, volReduced: 1560.25,
  grossYr: 121699.24, controllableYr: 405234.38, realizableYr: 91274.43, year1Net: -160134.87,
  year2Net: 1274.43, paybackLabel: "beyond 48 months",
};
const P = FCR_PINS;

export const FCR_MODEL = {
  id: "fcr-leakage",
  kind: "calc",
  title: "FCR Leakage Diagnostic",
  version: "1.0",
  published: "2026-09-25",
  route: "/tools/fcr-leakage",
  methodology: "/methodology/fcr-leakage",
  what: "How the FCR Leakage Diagnostic turns first contact resolution into repeat contacts and their yearly cost, how the root-cause diagnostic caps the improvement you can plan on, and what an improvement realizes and pays back.",
  claimClasses: "Repeat contacts and their cost are arithmetic on your inputs and the repeat model you choose. The practical ceilings, the opportunity and capture curves and the opening profile are assumptions, labelled as heuristics. Realizable savings and payback are a conditional forecast: freed capacity becomes cash only through the mechanism you select.",
  formulas: [
    { name: "Repeat share", formula: "One-callback model: (1 − FCR) ÷ (2 − FCR). Geometric model: 1 − FCR. Measured: your repeat share", note: "The same FCR leaks differently depending on how an unresolved issue behaves, so the model is a choice you make and the page names it." },
    { name: "Repeat burden", formula: "Contacts × repeat share × marginal cost × repeat multiplier × 12", note: "Marginal cost, never loaded: a removed contact does not shrink the building." },
    { name: "Opportunity", formula: pc(b("fcr.curve.oppFloor"), 0) + " + (5 − diagnostic score) ÷ 4 × " + pc(b("fcr.curve.oppSpan"), 0) + ", held between " + pc(b("fcr.curve.oppFloor"), 0) + " and " + pc(b("fcr.curve.oppCeil"), 0), note: "How much of the leakage is controllable. A weak diagnostic means more room." },
    { name: "Capture", formula: pc(b("fcr.curve.capFloor"), 0) + " + (diagnostic score − 1) ÷ 4 × " + pc(b("fcr.curve.capSpan"), 0) + ", held between " + pc(b("fcr.curve.capFloor"), 0) + " and " + pc(b("fcr.curve.capCeil"), 0), note: "How much of that room the operation can take this year. A strong diagnostic means better execution." },
    { name: "Ceiling FCR", formula: "Current FCR + (practical maximum for the scope − current FCR) × opportunity × capture", note: "A target above it is capped and the page says so. The practical maximum falls as the scope gets stricter." },
    { name: "Contacts avoided", formula: "Contacts × (repeat share now − repeat share at the target)", note: "On a measured base with no measured target, the share scales with (1 − target) ÷ (1 − current)." },
    { name: "Realizable", formula: "Contacts avoided × repeat cost × 12 × the mechanism's realization share", note: "Outsourced per-contact billing converts at 100%, with no minimum volume commitment assumed." },
    { name: "Payback", formula: "Monthly realizable ramps in over " + b("fcr.ramp.months") + " months, less recurring cost; payback is the first month cumulative net covers the one-time cost", note: "Searched to " + b("fcr.guard.horizon") + " months. Recurring cost at or above realizable never pays back." },
  ],
  bands: [
    { label: "Practical maximum FCR by scope", range: "Voice only " + pc(b("fcr.scope.voice"), 0) + ", cross-channel " + pc(b("fcr.scope.cc"), 0) + ", digital plus assisted " + pc(b("fcr.scope.digital"), 0) + ", enterprise " + pc(b("fcr.scope.enterprise"), 0), meaning: "Broader scope means more ways to count as unresolved, so the ceiling falls. Undeclared uses " + pc(b("fcr.scope.undeclared"), 0) + " and holds completeness Directional." },
    { label: "Burden range by cost basis", range: "Estimate ±" + pc(b("fcr.band.estimate"), 0) + ", operations data ±" + pc(b("fcr.band.ops"), 0) + ", finance-confirmed ±" + pc(b("fcr.band.finance"), 0), meaning: "The range printed around the burden." },
    { label: "Validity checks", range: "Marginal at or above " + pc(b("fcr.read.margNearLoaded"), 0) + " or at or below " + pc(b("fcr.read.margFarBelow"), 0) + " of loaded; multiplier above " + b("fcr.read.multHigh") + "x; measured share above " + pc(b("fcr.read.measuredMax"), 0) + "; internal window under " + b("fcr.read.windowShort") + " days", meaning: "Each is disclosed and holds completeness Directional." },
  ],
  bandsNote: "Payback and whether the case pays back are properties of the answer and never cap a confidence axis.",
  constants: () => [
    ...benchmarksForTool("fcr-leakage").map((e) => e.id),
  ].map((id) => ({ id, ...BENCHMARK_SOURCES[id] })),
  example: {
    note: "Computed by the tool's own engine at its opening inputs, with a declared cross-channel scope, an internal 7-day callback window, every diagnostic statement answered at 3 and the capacity action the tool opens on (" + H.label.toLowerCase() + ", " + pc(H.f, 0) + "). It does not pay back: the example shows a case the tool reports honestly as a loss.",
    inputs: [["Volume and resolution", "50,000 contacts a month, FCR 72%, target 80%, one-callback model"], ["Cost", "$6.50 marginal, $11 loaded per contact, repeat multiplier 1.0"], ["Investment", "$150,000 one-time, $90,000 a year recurring"]],
    steps: [
      ["Repeat share", "(1 − 0.72) ÷ (2 − 0.72) = " + pc(P.repeatShare, 2) + ", " + num(P.repeats) + " repeats a month"],
      ["Repeat burden", num(P.repeats) + " × $6.50 × 12 = " + usd(P.burdenYr) + " a year; " + usd(P.controllableYr) + " of it controllable at " + pc(P.opp) + " opportunity"],
      ["Ceiling", "72% + (" + pc(P.practicalMax, 0) + " − 72%) × " + pc(P.opp) + " × " + pc(P.cap) + " = " + pc(P.ceilingFCR, 2) + "; the 80% target is capped there"],
      ["Contacts avoided", num(P.repeats) + " − " + num(P.repeatsT) + " = " + num(P.volReduced) + " a month"],
      ["Realizable", usd(P.grossYr) + " a year gross × " + pc(H.f, 0) + " = " + usd(P.realizableYr)],
      ["Payback", "year one " + usd(P.year1Net) + " after ramp and one-time cost; year two " + usd(P.year2Net) + "; payback " + P.paybackLabel],
    ],
  },
  limits: [
    "FCR has no industry standard. A figure measured on a narrower scope or a shorter window reads higher, so the result is comparable only with the definition declared.",
    "The repeat model shapes the burden. The page shows the same case under the one-callback and a heavier geometric model so the range is visible.",
    "The diagnostic score is your own read of the operation. It sets how much improvement the tool lets you plan on, never whether the case is worth doing.",
    "Balancing metrics (reopen, transfer, escalation, handle time, satisfaction) must hold, or an FCR gain is not real.",
  ],
};
