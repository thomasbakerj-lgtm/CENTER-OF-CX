/* Cost per Contact Calculator, version 1.0. A calculator method (kind "calc").
 *
 * Published at /methodology/cost-per-contact from this object. The engine lives inside
 * CostPerContactCalculator.jsx, so this page carries its worked example as pins, and
 * methods.test.mjs recomputes every pin from the tool's own engine.
 */
import { benchmark, BENCHMARK_SOURCES, benchmarksForTool } from "../benchmarks.js";
import { MECH, MECH_INITIAL } from "../mech.js";

const usd2 = (n) => "$" + n.toFixed(2);
const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");
const pc = (x, d = 1) => (x * 100).toFixed(d) + "%";

/* The pins, at the tool's opening case. Each is recomputed from the engine. */
export const CPC_PINS = {
  C: 1.392, cpr: 9.744, handled: 50000, resolutions: 35920, repeats: 14080, repeatShare: 0.28161,
  burden: 59137.93, blendedHandle: 2.6098, blendedEffMin: 5.85, fteBurden: 9.806,
  step: 10, newFCR: 82, released: 21120.69, realizable: 15840.52, fte: 3.502,
};
const P = CPC_PINS;
const H = MECH[MECH_INITIAL];

export const CPC_MODEL = {
  id: "cost-per-contact",
  kind: "calc",
  title: "Cost per Contact Calculator",
  version: "1.0",
  published: "2026-09-25",
  route: "/tools/cost-per-contact",
  methodology: "/methodology/cost-per-contact",
  what: "How the Cost per Contact Calculator turns cost per contact, first contact resolution and repeat depth into cost per resolution, the repeat-demand burden and the capacity an FCR improvement releases.",
  claimClasses: "Contacts per resolution, cost per resolution, repeat contacts and the burden are arithmetic on your inputs. The opening profile is an assumption, labelled heuristic, and a driver still at it grades Directional. Capacity released by an FCR improvement is a conditional forecast; it becomes cash only through the capacity action you select, at that action's realization share.",
  formulas: [
    { name: "Contacts per resolution (C)", formula: "FCR + (1 − FCR) × M", note: "M is the total contacts an issue takes when it is not resolved first time, the first one included." },
    { name: "Cost per resolution", formula: "Loaded cost per contact × C", note: "The premium over cost per contact is (C − 1), the cost of repeat demand." },
    { name: "Resolutions and repeats", formula: "Handled basis: resolutions = contacts ÷ C, repeats = contacts − resolutions. Issues basis: contacts = issues × C, repeats = issues × (C − 1)", note: "The basis is stated on the page because the repeat arithmetic differs." },
    { name: "Repeat-demand burden", formula: "Repeat contacts × marginal cost per contact", note: "A ceiling, never a saving: FCR never reaches 100%. Marginal is the variable cost; when none is entered it is derived at " + pc(benchmark("cpc.derive.marginalShare"), 0) + " of loaded and disclosed." },
    { name: "Channel handle cost", formula: "Hourly wage × overhead multiplier ÷ 60 × AHT ÷ concurrency", note: "Labor only, per channel; blended by the channel mix." },
    { name: "FTE burden", formula: "Repeat contacts × blended effective minutes ÷ 60 ÷ productive hours per FTE", note: "A capacity equivalent, never a headcount cut." },
    { name: "Capacity released", formula: "Resolutions × (C − C at the improved FCR) × marginal cost", note: "Priced at +" + benchmark("cpc.dividend.step1") + ", +" + benchmark("cpc.dividend.step2") + " and +" + benchmark("cpc.dividend.step3") + " FCR points; the page quotes the middle step." },
    { name: "Realizable", formula: "Released × the realization share of the capacity action you select", note: "No action selected realizes $0. Hiring avoidance is " + pc(H.f, 0) + ", overtime " + pc(MECH.overtime.f, 0) + ", vendor reduction " + pc(MECH.vendor.f, 0) + ", headcount " + pc(MECH.headcount.f, 0) + "." },
  ],
  bands: [
    { label: "Repeat demand read", range: "Above " + pc(benchmark("cpc.read.repeatShare"), 0) + " of handled contacts", meaning: "Read as a resolution problem; the shared moderate severity line." },
    { label: "Resolution premium colour", range: "Amber above " + benchmark("cpc.band.gapAmber") + "%, red above " + benchmark("cpc.band.gapRed") + "%", meaning: "Colour only. It reaches no confidence axis." },
    { label: "Shallow repeat check", range: "FCR under " + pc(benchmark("cpc.read.lowFcr"), 0) + " with M under " + benchmark("cpc.read.shallowM"), meaning: "The repeat path is likely understated; completeness holds Directional until M is checked." },
  ],
  bandsNote: "Every line is a threshold in the registry with its rationale. The vertical planning ranges on the tool page are context only and feed no figure.",
  constants: () => [
    ...benchmarksForTool("cost-per-contact").map((e) => e.id).filter((id) => !id.startsWith("cpc.vert.")),
    "market.wage.agent", "load.benefits",
  ].map((id) => ({ id, ...BENCHMARK_SOURCES[id] })),
  example: {
    note: "Computed by the tool's own engine at its opening profile, with the capacity action the tool opens on (" + H.label.toLowerCase() + ").",
    inputs: [["Volume", "50,000 handled contacts a month"], ["Resolution", "FCR 72%, M 2.4 contacts per unresolved issue"], ["Cost", "$7.00 loaded, $4.20 marginal per contact"], ["Channels", "voice 60% at 7 minutes, chat 25% at 9 minutes and 2.5 concurrent, email 15% at 5 minutes; $" + benchmark("market.wage.agent") + " an hour × " + benchmark("load.benefits") + "; 140 productive hours per FTE"]],
    steps: [
      ["Contacts per resolution", "0.72 + 0.28 × 2.4 = " + P.C],
      ["Cost per resolution", "$7.00 × " + P.C + " = " + usd2(P.cpr) + ", a " + ((P.C - 1) * 100).toFixed(1) + "% premium"],
      ["Resolutions and repeats", "50,000 ÷ " + P.C + " = " + P.resolutions.toLocaleString("en-US") + " resolutions; " + P.repeats.toLocaleString("en-US") + " repeats, " + pc(P.repeatShare) + " of contacts"],
      ["Repeat-demand burden", P.repeats.toLocaleString("en-US") + " × $4.20 = " + usd(P.burden) + " a month (a ceiling)"],
      ["Blended handle cost", usd2(P.blendedHandle) + " per contact at " + P.blendedEffMin.toFixed(2) + " effective minutes"],
      ["FTE burden", P.repeats.toLocaleString("en-US") + " × " + P.blendedEffMin.toFixed(2) + " ÷ 60 ÷ 140 = " + P.fteBurden.toFixed(1) + " FTE"],
      ["+" + P.step + " FCR points", "FCR " + P.newFCR + "% releases " + usd(P.released) + " a month (" + P.fte.toFixed(1) + " FTE); realizable at " + pc(H.f, 0) + " is " + usd(P.realizable)],
    ],
  },
  limits: [
    "M is the depth of the repeat path. It is rarely measured directly; a shallow M understates every repeat figure, which is why the tool checks it against FCR.",
    "Marginal cost is the variable cost of one more contact. A marginal derived from loaded is a placeholder and grades cost evidence Directional.",
    "Capacity released is a model of an FCR improvement you have not yet made. The tool does not say how to reach it; the FCR Leakage Diagnostic looks for where resolution fails.",
    "Channel handle cost is labor only. Platform, telephony and facilities sit in your loaded figure.",
  ],
};
