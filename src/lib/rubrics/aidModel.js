/* AI Deflection Reality Check, version 1.0. A calculator method (kind "calc").
 *
 * Published at /methodology/ai-deflection from this object. The engine lives inside
 * AIDeflectionRealityCheck.jsx, so this page carries its worked example as pins, and
 * methods.test.mjs recomputes every pin from the tool's own engine.
 */
import { benchmark, BENCHMARK_SOURCES, benchmarksForTool } from "../benchmarks.js";
import { MECH, MECH_INITIAL } from "../mech.js";

const usd = (n) => (n < 0 ? "-$" : "$") + Math.abs(Math.round(n)).toLocaleString("en-US");
const num = (n) => Math.round(n).toLocaleString("en-US");
const pc = (x, d = 1) => (x * 100).toFixed(d) + "%";
const H = MECH[MECH_INITIAL];
const b = (id) => benchmark(id);

/* The pins, at the tool's opening case (assumption set A, a 6-month ramp, the resolution
   rate sourced to an internal estimate). Each is recomputed from the engine. */
export const AID_PINS = {
  marg: 4.2, attempted: 44000, dur: 0.533, durable: 23452, postBotHuman: 20548, botRate: 53.3, netRate: 29.315,
  opex: 13700, escPremium: 21575.4, vendorClaim: 364000, K: 52298.4, net: 38598.4, beRes: 39.529,
  repeatTol: 50.133, year1: 332434.8, payback: 3, verdict: "Run a bounded pilot",
};
const P = AID_PINS;

export const AID_MODEL = {
  id: "ai-deflection",
  kind: "calc",
  title: "AI Deflection Reality Check",
  version: "1.0",
  published: "2026-09-25",
  route: "/tools/ai-deflection",
  methodology: "/methodology/ai-deflection",
  what: "How the AI Deflection Reality Check turns a vendor's resolution rate into the share of your total demand that durably goes away, what that is worth after operating cost and the escalation premium, and the resolution rate at which the program breaks even.",
  claimClasses: "Coverage, durable resolution, net automation and the bridge from the vendor claim are arithmetic on your inputs. Eligibility, resolution, repeat rate and the escalation premium are assumptions about the bot; the opening profile is labelled heuristic and none reaches Planning-grade until a document or observed data backs it. Net savings are a conditional forecast: freed capacity becomes cash only through the capacity action you select, while operating cost and the escalation premium are cash out in full.",
  formulas: [
    { name: "Three rates, three denominators", formula: "Coverage = eligible demand ÷ total demand. Apparent resolution = resolved ÷ AI-involved conversations. Net automation = durable resolutions ÷ total demand", note: "They are never shown as one another. The gap between apparent resolution and net automation is where most overstatement starts." },
    { name: "Durable resolution", formula: "Apparent resolution × (1 − repeat and false resolution rate)", note: "A resolution that comes back was a deferral." },
    { name: "Durable resolutions", formula: "Contacts × eligible share × durable resolution", note: "Everything else the bot touched reaches a human: immediate escalations and returns." },
    { name: "Net savings a month", formula: "Marginal cost × contacts × eligible × (durable × action share − (1 − durable) × escalation premium) − operating cost", note: "Operating cost is platform, QA, tuning hours × rate and knowledge hours × rate. Marginal cost, when not supplied, is " + pc(b("aid.derive.marginalShare"), 0) + " of loaded and disclosed." },
    { name: "Vendor claim", formula: "Contacts × apparent resolution × loaded cost", note: "The naive slide. The bridge walks from it to net savings in six steps that sum exactly: eligibility gap, repeats, loaded to marginal, capacity not converted, escalation premium, operating cost." },
    { name: "Break-even resolution", formula: "(premium + operating cost ÷ (marginal × contacts × eligible)) ÷ (action share + premium) ÷ (1 − repeat rate)", note: "The apparent resolution at which net savings reach zero. Above 100% it never breaks even." },
    { name: "Repeat tolerance", formula: "1 − durable resolution at break-even ÷ apparent resolution", note: "The highest repeat rate the program can carry and still break even." },
    { name: "Year one and payback", formula: "Month m earns steady savings × min(1, m ÷ ramp months) − operating cost; year one starts at minus the one-time cost", note: "Payback is the first month cumulative net turns positive. Year one at full run rate is shown beside it, so the cost of the ramp is visible." },
  ],
  bands: [
    { label: "Buy nothing, as scoped", range: "Net savings and the upside case both at or below zero", meaning: "The upside case lifts resolution " + b("aid.upside.resolutionLift") + " times (capped at 100%) and halves repeats (" + b("aid.upside.repeatCut") + ")." },
    { label: "Fix the economics or renegotiate", range: "Net at or below zero, upside positive", meaning: "A better floor or a lower price could turn it." },
    { label: "Fix the foundation first", range: "Net positive, eligible share under " + pc(b("aid.read.foundationFloor"), 0), meaning: "Knowledge coverage and intent scope are the constraint." },
    { label: "Run a bounded pilot", range: "Net positive on an estimate or marketing figure, or on capacity no action converts to cash", meaning: "A pilot earns the evidence." },
    { label: "Proceed, with a contracted floor", range: "Net positive, a proposal, floor or observed data, and a finance-creditable action", meaning: "Put the resolution rate in the contract with a remedy." },
    { label: "Sensitivity band on net savings", range: "Estimate or marketing ±" + pc(b("aid.band.estimate"), 0) + ", proposal ±" + pc(b("aid.band.proposal"), 0) + ", contracted floor or pilot ±" + pc(b("aid.band.sla"), 0), meaning: "Display only." },
  ],
  bandsNote: "The verdict is a property of the answer and never caps a confidence axis. A bot at or under $" + b("aid.guard.botNearFree").toFixed(2) + " of operating cost per attempted conversation holds completeness Directional.",
  constants: () => [
    ...benchmarksForTool("ai-deflection").map((e) => e.id),
  ].map((id) => ({ id, ...BENCHMARK_SOURCES[id] })),
  example: {
    note: "Computed by the tool's own engine at its opening case: assumption set A, a 6-month ramp, the resolution rate sourced to an internal estimate, no marginal cost supplied, and the capacity action the tool opens on (" + H.label.toLowerCase() + ", " + pc(H.f, 0) + ").",
    inputs: [["Demand and cost", "80,000 contacts a month, $7.00 loaded; marginal not supplied"], ["Bot", "55% eligible, 65% apparent resolution, 18% repeat, 25% escalation premium"], ["Operating cost", "$8,000 platform, $2,000 QA, 40 tuning hours at $65, 20 knowledge hours at $55; no one-time cost"]],
    steps: [
      ["Marginal cost", "60% of $7.00 = $" + P.marg.toFixed(2) + ", disclosed"],
      ["Durable resolution", "65% × (1 − 18%) = " + pc(P.dur) + " of " + num(P.attempted) + " attempted = " + num(P.durable) + " durable; " + num(P.postBotHuman) + " reach a human"],
      ["Three rates", "coverage 55%, apparent 65%, net automation " + P.netRate.toFixed(1) + "% of total demand"],
      ["Net savings", usd(P.K) + " converted less " + usd(P.opex) + " operating cost = " + usd(P.net) + " a month; the escalation premium takes " + usd(P.escPremium)],
      ["Against the vendor claim", usd(P.vendorClaim) + " a month on the slide; " + usd(P.net) + " modelled"],
      ["Break-even", P.beRes.toFixed(1) + "% apparent resolution; repeats tolerable to " + P.repeatTol.toFixed(1) + "%"],
      ["Year one", usd(P.year1) + " over the 6-month ramp; payback month " + P.payback],
      ["Verdict", P.verdict + ": positive on an internal estimate"],
    ],
  },
  limits: [
    "Every bot rate is usually a claim until your own pilot measures it. The evidence source you pick decides how far the grade can go, and nothing here reaches Finance-grade because no document is inspected.",
    "The escalation premium has no single published figure. The page shows net savings with it at zero and at double, so you can see how much of the answer rests on it.",
    "Eligibility is a property of your demand, not the vendor. The AI Readiness Diagnostic looks at what limits it.",
    "Savings are valued at marginal cost. Loaded cost appears only in the vendor claim, because a deflected contact does not refund fixed cost.",
  ],
};
