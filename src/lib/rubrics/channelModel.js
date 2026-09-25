/* Channel Shift Model, version 1.0. A calculator method (kind "calc").
 *
 * Published at /methodology/channel-shift from this object. The engine lives inside
 * ChannelShiftModel.jsx, so this page carries its worked example as pins, and
 * methods.test.mjs recomputes every pin from the tool's own engine.
 */
import { benchmark, BENCHMARK_SOURCES, benchmarksForTool } from "../benchmarks.js";
import { MECH, MECH_INITIAL } from "../mech.js";

const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");
const num = (n) => Math.round(n).toLocaleString("en-US");
const pc = (x, d = 1) => (x * 100).toFixed(d) + "%";
const H = MECH[MECH_INITIAL];

/* The pins, at the tool's opening case. Each is recomputed from the engine. */
export const CHANNEL_PINS = {
  voiceVol: 70000, eligible: 42000, shifted: 20000, displaced: 11350, bounced: 5000,
  uplift: 0.042857, residualEff: 7.3, deptEff: 5.44978, netMin: 23205.22,
  laborCash: 7047.48, botFee: 4025, netRealizable: 3022.48, fteFreed: 3.1392,
  transition: 12507.56, payback: 4.138, verdict: "Approve", breakEven: 71.815,
};
const P = CHANNEL_PINS;
const prodMin = benchmark("channel.plan.workdays") * benchmark("channel.plan.hoursPerDay") * 60 * benchmark("channel.plan.productiveShare");

export const CHANNEL_MODEL = {
  id: "channel-shift",
  kind: "calc",
  title: "Channel Shift Model",
  version: "1.0",
  published: "2026-09-25",
  route: "/tools/channel-shift",
  methodology: "/methodology/channel-shift",
  what: "How the Channel Shift Model turns a planned move of voice contacts into chat, bot or email into net agent minutes freed, what those minutes are worth after bot fees, the cost of the transition and the resolution rate at which the shift breaks even.",
  claimClasses: "Volumes shifted, displaced and bounced back are arithmetic on your inputs. Resolution, displacement, eligibility and the residual complexity curve are assumptions; the opening profile is labelled heuristic and a driver still at it grades Directional. Net realizable is a conditional forecast: freed minutes become cash only through the capacity action you select, while bot fees are cash and netted in full.",
  formulas: [
    { name: "Eligible voice", formula: "Monthly contacts × voice share × eligible share", note: "The shift is capped at this pool; a larger request is scaled down and disclosed." },
    { name: "Per target channel", formula: "Shifted = contacts × shift points; resolved = shifted × resolution; displaced = resolved × displacement; bounced back = shifted − resolved", note: "Resolved contacts that do not replace a voice call are new demand and earn no saving." },
    { name: "Residual voice handle time", formula: "Voice effective minutes × (1 + curve × shifted ÷ voice contacts)", note: "The calls left behind are harder. The curve is mild, moderate or severe." },
    { name: "Departing handle time", formula: "(Voice contacts × voice minutes − remaining calls × residual minutes) ÷ displaced", note: "Total voice minutes are conserved, so the curve fixes how simple the departing calls must be. The tool shows it so the curve can be checked." },
    { name: "Net minutes freed", formula: "Displaced × departing minutes − target channel minutes − bounced × departing minutes × (return factor − 1)", note: "A bounced call always existed; only its extra friction is new cost. Chat and email minutes are handle time ÷ concurrency." },
    { name: "Net realizable", formula: "Net minutes × hourly wage × marginal load ÷ 60 × the capacity action's share − bot fees", note: "Bot fees are paid on every bot attempt, resolved or bounced." },
    { name: "FTE freed", formula: "Net minutes ÷ (" + benchmark("channel.plan.workdays") + " days × " + benchmark("channel.plan.hoursPerDay") + " hours × 60 × " + pc(benchmark("channel.plan.productiveShare"), 0) + " productive)", note: "A capacity equivalent of " + num(prodMin) + " productive minutes per FTE a month." },
    { name: "Transition", formula: "Chat FTE added × (training per agent + ramp weeks × " + benchmark("channel.plan.daysPerWeek") + " days × " + benchmark("channel.plan.hoursPerDay") + " hours × loaded wage × " + pc(benchmark("channel.plan.rampLoss"), 0) + " ramp loss)", note: "Payback is transition ÷ monthly net realizable." },
    { name: "Break-even", formula: "The resolution rate of the largest shift at which net realizable crosses zero", note: "Solved on whole points and interpolated between them." },
  ],
  bands: [
    { label: "Do not approve yet", range: "Net realizable below zero", meaning: "The read gives the break-even resolution and the gap to it." },
    { label: "Approve only with pilot", range: "Net positive with any risk flag ticked", meaning: "Complaint, regulated, save-risk, vulnerable, identity or high-emotion volume needs a pilot before rollout." },
    { label: "Approve", range: "Net positive, no risk flag", meaning: "If break-even is under " + benchmark("channel.read.breakEvenFloor") + "%, the read says to check the bot fee and return factor first." },
    { label: "Implausible departing time", range: "Under " + benchmark("channel.read.implausibleDeptAht") + " minutes, or at or below zero", meaning: "The curve is set too high for this shift; completeness holds Directional." },
  ],
  bandsNote: "The verdict is a property of the answer and never caps a confidence axis. A bot under $" + benchmark("channel.guard.botNearFree").toFixed(2) + " a contact carrying volume is flagged as near-free and holds completeness Directional.",
  constants: () => [
    ...benchmarksForTool("channel-shift").map((e) => e.id),
    "market.wage.agent", "load.benefits", "load.marginal",
  ].map((id) => ({ id, ...BENCHMARK_SOURCES[id] })),
  example: {
    note: "Computed by the tool's own engine at its opening profile, with the capacity action the tool opens on (" + H.label.toLowerCase() + ", " + pc(H.f, 0) + ").",
    inputs: [["Volume", "100,000 contacts a month, voice 70% at 7 minutes, 60% of voice eligible"], ["Shift", "10 points to chat (85% resolve, 80% displace, 10 minutes at 2.5 concurrent) and 10 points to bot (65% resolve, 70% displace, $0.50 a contact)"], ["Cost", "$" + benchmark("market.wage.agent") + " an hour, marginal load " + benchmark("load.marginal") + ", loaded " + benchmark("load.benefits") + "; return factor 1.2; moderate curve; $1,500 training and 4 ramp weeks"]],
    steps: [
      ["Eligible voice", num(P.voiceVol) + " voice × 60% = " + num(P.eligible) + "; " + num(P.shifted) + " shifted, within the pool"],
      ["Displaced and bounced", "chat 6,800 and bot 4,550 displace " + num(P.displaced) + " voice calls; " + num(P.bounced) + " bounce back"],
      ["Residual and departing time", "voice rises " + pc(P.uplift) + " to " + P.residualEff.toFixed(2) + " minutes, so the departing calls average " + P.deptEff.toFixed(2) + " minutes"],
      ["Net minutes freed", num(P.netMin) + " a month (" + P.fteFreed.toFixed(2) + " FTE)"],
      ["Net realizable", usd(P.laborCash) + " labor at " + pc(H.f, 0) + " less " + usd(P.botFee) + " bot fees = " + usd(P.netRealizable) + " a month"],
      ["Transition and payback", usd(P.transition) + ", paid back in " + P.payback.toFixed(1) + " months"],
      ["Verdict", P.verdict + "; break-even at " + P.breakEven.toFixed(0) + "% chat resolution against 85% modelled"],
    ],
  },
  limits: [
    "Resolution and displacement decide the answer, and both are usually estimated before a pilot. The break-even line shows how much room the plan has.",
    "The residual curve is a planning assumption. The departing handle time it implies is shown so it can be checked against the calls you plan to move.",
    "This is an operating-capacity model. It does not value what an interaction is worth to the business, and the full investment case belongs in the Business Case Builder.",
    "Chat and email minutes are handle time divided by concurrency; a queue that does not reach that concurrency costs more.",
  ],
};
