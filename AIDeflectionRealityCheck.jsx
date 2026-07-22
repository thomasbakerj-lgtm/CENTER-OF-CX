import { useState, useEffect, useRef } from "react";
import ReportActions from "./ReportActions";
import NumField from "./src/lib/NumField";
import InfoDot from "./src/lib/InfoDot";
import { COLORS } from "./src/lib/benchmarks";
import { publishToolResult, getPrimitive, getExternalPrimitive, sourcedExternally } from "./src/lib/toolData";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { MECH, MECH_ORDER, MECH_DEFAULT } from "./src/lib/mech";

const NAVY = COLORS.navy, DEEP = "#061325", ELECTRIC = COLORS.electric, LIGHT = "#00AAFF";
const ICE = "#E8F4FD", WARM = "#F8FAFB", SLATE = "#3A4F6A", MUTED = COLORS.muted, BORDER = "#D8E3ED";
const GREEN = COLORS.green, AMBER = COLORS.amber, RED = COLORS.red;
const WRAP = { maxWidth: 980, margin: "0 auto", padding: "0 28px" };

const TOOL_ID = "ai-deflection";
const ROUTE = "/tools/ai-deflection";

/* @engine-start  Everything between these markers is pure JS with no JSX and no React.
   aid.test.mjs slices this region out of THIS FILE at runtime and tests it directly, so
   the verified engine and the deployed engine cannot drift apart. Do not remove them.
   V3+ rebuild is denominator-honest: coverage, resolution, and net automation are three
   different rates with three different denominators, and none is ever shown as another. */
const n = (v) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const fmt = (v) => (v < 0 ? "-$" : "$") + Math.abs(Math.round(n(v))).toLocaleString();
const fmt2 = (v) => "$" + Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtK = (v) => { const x = n(v), s = x < 0 ? "-" : ""; const a = Math.abs(x); return s + (a >= 1000000 ? "$" + (a / 1000000).toFixed(2) + "M" : a >= 1000 ? "$" + (a / 1000).toFixed(0) + "K" : "$" + Math.round(a)); };

const ORDER = ["Directional", "Planning-grade", "Finance-grade"];
const CRED_RANK = { none: 0, capacity: 1, finance: 2, cash: 3 };

/* Evidence axis. Finance-grade requires a document, exactly as it does in License
   Bundle Gap. A resolution rate is the single most-inflated number in this market,
   so the source of that number is the first thing the report has to name. */
const EVIDENCE = {
  estimate:  { rank: 0, label: "Internal estimate or benchmark" },
  marketing: { rank: 0, label: "Vendor marketing (deck, website, case study)" },
  proposal:  { rank: 1, label: "Vendor proposal or SOW" },
  sla:       { rank: 2, label: "Contracted resolution floor with a remedy" },
  pilot:     { rank: 2, label: "Observed pilot or production data" },
};
const EVIDENCE_ORDER = ["estimate", "marketing", "proposal", "sla", "pilot"];

/* Methodology and benchmark versioning. Exports carry these so a report can be traced
   back to the model that produced it and the vintage of the constants inside it. */
const METHODOLOGY_VERSION = "3.1";
const BENCHMARK_VINTAGE = "2026-07";

/* Benchmark governance. Every default is sourced, dated, and carries its denominator.
   The reviewer's non-negotiable, and the correct one: a rate without a denominator is
   not a benchmark, it is a rumor. These strings surface in the methodology block. */
const SOURCES = {
  eligible: "AI-eligible share of total demand. Starting estimate 55%. Varies widely, roughly 40% to 65%, by intent mix and knowledge coverage. Denominator: total inbound demand. Source: derived from Gartner 2025 self-service coverage ranges. Editable.",
  resolution: "Apparent resolution rate among AI-involved conversations. Starting estimate 65%. Gartner 2025 puts mature RAG containment at 55% to 65% of involved; rule-based bots at 20% to 35%. Denominator: AI-involved conversations, not total demand. Source: Gartner Customer Service Technology Survey 2025; Forrester Total Economic Impact 2025. Editable.",
  repeat: "Repeat and false-resolution rate among apparent resolutions. Starting estimate 18%. In early 2025, 62% of companies using non-agentic AI reported flat or worsening cost per resolution because deflected tickets still required a human. Gartner reports only 14% of issues are fully resolved in self-service. Denominator: apparent resolutions. Source: industry reporting 2025 to 2026. Editable.",
  escalation: "Escalation premium on post-bot human contacts. Starting estimate 25%. No single published figure exists; failed-bot contacts carry longer handle time and context rebuilding. Directional by nature. Editable.",
};

/* DEFS is the future glossary content. Write once, lift later. Every conceptually-loaded
   field carries its denominator, because the denominator is the whole lesson. */
const DEFS = {
  loadedCPC: { title: "Loaded cost per contact", text: "Fully burdened cost including facilities, licenses, supervision, and overhead. It is the right number to report upward as a unit metric. It is the wrong number to value savings with, because deflecting a contact does not refund a lease. Loaded cost moves the vendor's claim on this page. It does not move your net savings." },
  marginalCPC: { title: "Marginal cost per contact", text: "The cost that actually disappears when one contact goes away: agent wage plus benefits for the handle time it consumed. Every savings figure on this page is valued here. If you leave it blank the tool assumes 60% of loaded cost and caps confidence at Directional, because an assumed savings basis is not a savings basis." },
  eligible: { title: "AI-eligible demand", text: "The share of your total contact volume that is genuinely automatable, meaning the intent is in scope, the knowledge exists, and the bot can access the systems it needs. Denominator: total inbound demand. This is the number vendors quietly skip. A 70% resolution rate on 40% eligible demand is 28% of your volume, not 70%." },
  resolution: { title: "Apparent resolution rate", text: "Of the conversations the bot is involved in, the share it appears to resolve without a human. This is the vendor's headline number. Denominator: AI-involved conversations. It is measured on the traffic the bot touches, never on your total volume. Applying it to total volume is a denominator mismatch, and it is the most common source of overstatement in AI business cases, usually through inconsistent definitions rather than intent." },
  repeat: { title: "Repeat and false resolution", text: "Of the contacts the bot appears to resolve, the share that come back, usually to a human, because the issue was not actually solved. Durable resolution is apparent resolution minus these returns. A resolution that recurs was never a resolution. It was a deferral that looked like success on the vendor's dashboard." },
  escalation: { title: "Escalation premium", text: "Contacts that reach an agent after a bot cost more than contacts that reach an agent directly: longer handle time, context rebuilding, higher transfer rates. No single published figure exists, and the real number varies widely by channel and intent complexity, so treat the default as directional and replace it. The defensible way to measure it is your own handle time after AI escalation compared with your normal handle time. Set it to 0 to remove it from the model entirely and read the sensitivity line beneath the bridge to see what it is worth." },
  mech: { title: "Capacity action", text: "Freed agent handle time is capacity, not cash, until something converts it. Not selected realizes $0, which is the honest answer and the one most vendor business cases quietly skip. Operating cost and escalation premium are cash out regardless, which is why no action shows a loss rather than a zero." },
  evidence: { title: "Evidence source", text: "What backs the resolution rate you entered. Marketing claims and internal estimates cannot exceed Directional confidence. A proposal is a document but not a commitment, so it reaches Planning-grade. Only a contracted floor with a remedy, or resolution you have observed in your own environment, can reach Finance-grade." },
  implOneTime: { title: "One-time implementation cost", text: "Integration, content build, professional services, and the internal hours to stand the bot up. It hits Year 1 and never repeats, so it changes payback without touching steady-state economics. Leaving it at zero does not make it zero. It makes your Year 1 number optimistic by exactly the amount the vendor is charging." },
  confidence: { title: "Confidence, two axes", text: "Evidence asks what attests to the resolution rate and the cost basis. Realization asks whether finance can book the savings given your capacity action. The headline reports the weaker of the two. Any clamped or impossible input forces Directional regardless of the rest. Read the grade carefully: it describes what you have told this tool, not anything this tool has checked. Nobody here has seen your quote, your payroll file, or your pilot data. The grade is a self-declared evidence level, and Finance-grade means your inputs are document-backed by your own account, not that they have been independently validated." },
  rail: { title: "Rail handoff", text: "This tool is the only producer of the realistic deflection rate the rest of the suite consumes. It publishes two different numbers, net automation of total demand and durable resolution of bot-routed traffic, because downstream tools need different denominators. If it published nothing, it says so." },
  durable: { title: "Durable resolution, and its limits", text: "A durable resolution is an interaction that achieved the intended customer outcome without avoidable human escalation, attributable repeat contact, channel switching, or material correction inside your chosen measurement window. Two honest caveats. A repeat contact is not always a failure, because a customer may return with an unrelated issue, and the absence of a repeat does not prove success, because a customer may simply give up. Unless you are supplying observed, intent-matched repeat data, the durable figure here is an estimate of your leakage, not a measured outcome." },
  funnel: { title: "The three rates", text: "Coverage is how much demand is automatable, out of total. Resolution is how much of the bot's traffic it handles, out of AI-involved. Net automation is how much of your total volume durably goes away, out of total. They are not interchangeable, and the gap between apparent resolution and net automation is where most overstatement in AI business cases originates." },
  verdict: { title: "The decision", text: "This tool exists to protect one expensive decision: approving an automation business case or committing to a resolution target. The verdict reads in four states. Proceed when the economics are real and evidenced. Pilot when they are positive but unproven. Fix the foundation first when eligibility is the constraint rather than the vendor. Buy nothing when even the upside is a net cost." },
};

export function engine(I) {
  const guards = [];
  const gc = (raw, lo, hi, what) => {
    const v = n(raw), c = clamp(v, lo, hi);
    if (c !== v) guards.push(`${what} was ${v}, outside the ${lo} to ${hi} range it can occupy, and was held at ${c}.`);
    return c;
  };

  const M = gc(I.M, 0, 1e9, "Monthly contacts");
  const cpc = gc(I.cpc, 0, 1e6, "Loaded cost per contact");
  const margIn = gc(I.marg, 0, 1e6, "Marginal cost per contact");
  const marg = margIn > 0 ? margIn : cpc * 0.6;
  const margWasDefaulted = !(margIn > 0);

  /* Three denominator-explicit rates. e is share of TOTAL demand the bot attempts.
     r is apparent resolution OF AI-INVOLVED. rho is repeat OF APPARENT RESOLUTIONS. */
  const ep = gc(I.eligibleRate, 0, 100, "AI-eligible demand");
  const rp = gc(I.apparentResolutionRate, 0, 100, "Apparent resolution rate");
  const rhop = gc(I.repeatLeakRate, 0, 100, "Repeat and false resolution");
  const escP = gc(I.escalationPenalty, 0, 200, "Escalation premium");
  const E = ep / 100, R = rp / 100, RHO = rhop / 100, esc = escP / 100;

  const mechKey = MECH[I.mech] ? I.mech : MECH_DEFAULT;
  const sf = MECH[mechKey].f;

  const dur = R * (1 - RHO);              // durable fraction OF ROUTED -> bot resolution rate
  const attempted = M * E;               // share of total the bot attempts
  const durable = attempted * dur;       // durable resolutions, share of total = E*dur
  const returnedFalse = attempted * R * RHO;
  const immediateEsc = attempted * (1 - R);
  const postBotHuman = attempted - durable;
  const botResolutionRate = dur * 100;                     // of routed
  const netAutomationRate = M > 0 ? (durable / M) * 100 : 0; // of TOTAL

  const opexMonthly = gc(I.botPlatformCost, 0, 1e9, "Platform cost") + gc(I.qaCost, 0, 1e9, "QA cost")
    + gc(I.tuningHours, 0, 1e5, "Tuning hours") * gc(I.tuningRate, 0, 1e4, "Tuning rate")
    + gc(I.knowledgeMaintHours, 0, 1e5, "Knowledge hours") * gc(I.knowledgeRate, 0, 1e4, "Knowledge rate");
  const implOneTime = gc(I.implOneTime, 0, 1e9, "Implementation cost");

  const escalationPremium = postBotHuman * marg * esc;
  const vendorClaim = M * R * cpc;       // the naive slide: resolution rate on ALL volume at LOADED cost

  const K = marg * M * E * (dur * sf - (1 - dur) * esc);
  const netSavings = K - opexMonthly;
  const steadyAnnual = 12 * netSavings;

  /* The escalation premium is a directional constant. Rather than hide it inside one
     number, expose what the result would be without it and at double it, so the reader
     can see exactly how much of the answer rests on this assumption. */
  const netAtEscZero = marg * M * E * (dur * sf) - opexMonthly;
  const netAtEscDouble = marg * M * E * (dur * sf - (1 - dur) * esc * 2) - opexMonthly;
  const escSwing = Math.abs(netAtEscZero - netAtEscDouble);
  const escShareOfResult = Math.abs(netSavings) > 0 ? (escalationPremium / Math.abs(netSavings)) * 100 : 0;

  const realizedDollarsPct = vendorClaim > 0 ? (netSavings / vendorClaim) * 100 : 0;
  const impliedGrossOfTotal = E * R * 100;
  const realizedDeflectionPct = impliedGrossOfTotal > 0 ? (netAutomationRate / impliedGrossOfTotal) * 100 : 0;

  let beResPct = Infinity, beNote = null;
  if (marg * M * E > 0 && (sf + esc) > 0) {
    const durStar = (esc + opexMonthly / (marg * M * E)) / (sf + esc);
    const rStar = (1 - RHO) > 0 ? durStar / (1 - RHO) : Infinity;
    if (rStar <= 1 && rStar >= 0) beResPct = rStar * 100;
    else if (rStar > 1) { beResPct = Infinity; beNote = "No resolution rate breaks even at this eligibility, cost, and operating spend."; }
    else beResPct = 0;
  } else if (!(sf + esc > 0)) beNote = "With no capacity action and no escalation premium, only operating cost moves.";

  let repeatTolPct = null, repeatNote = null;
  if (!(marg * M * E * R > 0)) repeatNote = "No durable volume to tolerate repeats against.";
  else if (sf + esc <= 0) repeatNote = "No lever converts durable resolutions to cash.";
  else {
    const durStar = (esc + opexMonthly / (marg * M * E)) / (sf + esc);
    const rhoStar = 1 - durStar / R;
    if (rhoStar >= 1) { repeatTolPct = 100; repeatNote = "Any repeat rate still breaks even at this volume."; }
    else if (rhoStar <= 0) { repeatTolPct = 0; repeatNote = "No repeats are tolerable. This program is already below break-even."; }
    else repeatTolPct = rhoStar * 100;
  }

  const monthly = [];
  let year1 = -implOneTime, cum = -implOneTime, payback = null;
  for (let m = 1; m <= 12; m++) {
    const ramp = I.rampOn ? Math.min(1, m / Math.max(1, I.rampMonths)) : 1;
    const nm = K * ramp - opexMonthly;
    monthly.push(nm); year1 += nm; cum += nm;
    if (payback === null && cum >= 0) payback = m;
  }

  const waterfall = [
    { label: "Vendor claim (resolution rate on all volume, loaded cost)", value: vendorClaim },
    { label: "Eligibility gap (only part of demand is automatable)", value: -M * R * cpc * (1 - E) },
    { label: "Repeat and false resolution (apparent resolutions recur)", value: -attempted * R * RHO * cpc },
    { label: "Loaded to marginal (fixed cost does not fall)", value: -durable * (cpc - marg) },
    { label: `Capacity not converted to cash (${MECH[mechKey].label})`, value: -durable * marg * (1 - sf) },
    { label: "Escalation premium (post-bot contacts cost more)", value: -escalationPremium },
    { label: "Operating cost (platform, QA, tuning, knowledge)", value: -opexMonthly },
  ];
  const waterfallSum = waterfall.reduce((a, w) => a + w.value, 0);

  const railRate = netAutomationRate / 100, railBot = botResolutionRate / 100;
  let railPublished = true, railReason = null;
  if (M <= 0) { railPublished = false; railReason = "Monthly contacts is zero, so there is no volume to express a rate against."; }
  else if (!(railRate >= 0 && railRate <= 1)) { railPublished = false; railReason = `Net automation resolved to ${netAutomationRate.toFixed(2)}%, outside 0 to 100%, and the rail refuses it.`; }

  const ev = EVIDENCE[I.evidence] || EVIDENCE.estimate;
  let costConf = ORDER[Math.min(2, ev.rank)];
  if (margWasDefaulted) costConf = "Directional";
  else if (!I.costBasisOwned && ORDER.indexOf(costConf) > 1) costConf = "Planning-grade";
  const cr = CRED_RANK[MECH[mechKey].cred];
  let realConf = ORDER[cr === 3 ? 2 : cr === 2 ? 1 : 0];

  const flags = [...guards];
  if (margWasDefaulted) flags.push(`Marginal cost was not supplied, so it was assumed at 60% of loaded cost, ${fmt2(cpc * 0.6)} per contact. That single assumption drives every savings figure on this page, and it is why confidence is held at Directional. Run Cost per Contact and return to replace it.`);
  if (margIn > 0 && cpc > 0 && margIn > cpc) flags.push("Marginal cost per contact exceeds loaded cost, which is impossible. It would mean fixed cost is negative. Correct the inputs.");
  else if (margIn > 0 && cpc > 0 && margIn >= 0.85 * cpc) flags.push("Marginal cost is within 15% of loaded cost. You may have entered loaded cost twice. Marginal cost is mostly wage and benefits and usually runs 50% to 75% of loaded.");
  if (ep >= 90) flags.push(`AI-eligible demand is set to ${ep}%, meaning almost all of your volume is automatable. That is rare. Most operations have a large tail of complex, emotional, or exception traffic that no bot resolves. Confirm this against your actual intent mix before trusting the headline.`);
  if (rp >= 80) flags.push(`Apparent resolution is set to ${rp}% of AI-involved conversations. Rates above 80% are uncommon outside narrow FAQ or password-reset scopes. Confirm the denominator: this is a share of the traffic the bot touches, not a share of your total volume.`);
  if (rp > 0 && netAutomationRate > 0) flags.push(`Denominator check. The bot resolves ${rp}% of the conversations it is involved in, but that is ${netAutomationRate.toFixed(1)}% of your total demand, because only ${ep}% of demand is eligible and ${(RHO * 100).toFixed(0)}% of apparent resolutions recur. A quoted ${rp}% describes resolution of AI-involved conversations. Your budget responds to net automation of total demand. Confirm which denominator the quoted rate uses before you rely on it.`);
  if (escP > 0 && Math.abs(netSavings) > 0 && escalationPremium > Math.abs(netSavings) * 0.5) flags.push(`The escalation premium of ${escP}% is moving ${fmt(escalationPremium)} a month, which is more than half the size of the net result. That constant is directional, not measured. Replace it with your own post-escalation handle time compared against normal handle time before this figure carries any weight.`);
  if (implOneTime === 0) flags.push("Implementation cost is zero. If the vendor is charging a one-time build, integration, or professional services fee, the Year 1 figure is optimistic by exactly that amount, and payback is earlier than it will be.");
  if (mechKey === "none") flags.push("No capacity action is selected, so realized savings are $0. Operating cost and escalation premium are still cash out the door, which is why the result is a loss rather than a zero.");
  if (mechKey === "headcount") flags.push("Headcount reduction values freed capacity at 100%. This is the assumption almost every vendor ROI slide makes silently. It is defensible only if a named person has committed to removing the heads.");
  if (!isFinite(beResPct) && beNote) flags.push("This program never breaks even at any resolution rate. Operating cost and escalation premium exceed the realistic savings the bot can produce at this eligibility, volume, and marginal cost.");

  const hardFlag = flags.some((f) => /impossible|refuses it|was held at/.test(f));
  if (hardFlag) { costConf = "Directional"; realConf = "Directional"; }
  const headlineConf = ORDER[Math.min(ORDER.indexOf(costConf), ORDER.indexOf(realConf))];

  const MECH_REASON = {
    none: "no capacity action is selected, so freed handle time converts to no cash",
    growth: "absorbing growth or backlog builds capacity, which finance does not credit as savings this cycle",
    overtime: "reducing overtime stops a payment finance already makes, which is creditable, but it is not cash leaving the cost base",
    hiring: "avoiding or slowing hiring is finance-creditable over the cycle, but it is not cash leaving the cost base",
    vendor: "reducing outsourcer volume takes cash off the invoice",
    headcount: "reducing headcount takes cash off the payroll",
  };
  const EV_REASON = {
    estimate: "the resolution rate is an internal estimate rather than an attested figure",
    marketing: "the resolution rate comes from vendor marketing, which is the least reliable source of a resolution number that exists",
    proposal: "the resolution rate is drawn from a vendor proposal, which is a document but not a commitment",
    sla: "the resolution rate is a contracted floor with a remedy attached",
    pilot: "the resolution rate was observed in your own environment",
  };
  /* One sentence, built once, rendered verbatim in the UI and the export. Two things this
     has to get right. It must not claim an axis is "weaker" when the two are tied, because
     that is a comparison the result does not support. And it must read as a complete
     sentence in the report, where no "It is X because" preamble precedes it. */
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const axesTied = costConf === realConf;
  const weakerIsReal = ORDER.indexOf(realConf) < ORDER.indexOf(costConf);
  const evReason = EV_REASON[I.evidence || "estimate"];
  let confReason, confSentence;
  if (hardFlag) {
    confReason = "an input is physically impossible or had to be clamped, so the result is blocked at Directional.";
    confSentence = "An input is physically impossible or had to be clamped, so the result is blocked at Directional regardless of evidence or capacity action.";
  } else if (margWasDefaulted) {
    confReason = "the marginal cost basis is an assumed 60% of loaded cost, not a figure you supplied.";
    confSentence = "The marginal cost basis is an assumed 60% of loaded cost rather than a figure you supplied, which holds the result at Directional.";
  } else if (axesTied) {
    confReason = "both axes land at " + costConf + ".";
    confSentence = "Both axes land at " + costConf + ", so neither is the weaker one. " + cap(evReason) + ", and " + MECH_REASON[mechKey] + ".";
  } else if (weakerIsReal) {
    confReason = "realization is the weaker axis and " + MECH_REASON[mechKey] + ".";
    confSentence = "The headline reports the weaker axis, which is realization at " + realConf + ", because " + MECH_REASON[mechKey] + ".";
  } else {
    confReason = "evidence is the weaker axis and " + evReason + ".";
    confSentence = "The headline reports the weaker axis, which is evidence at " + costConf + ", because " + evReason + ".";
  }

  const band = { estimate: 0.25, marketing: 0.25, proposal: 0.15, sla: 0.10, pilot: 0.10 }[I.evidence || "estimate"];

  /* Four-way decision. Economics and evidence drive it. Readiness detail routes out to
     the AI Readiness Diagnostic; this tool passes the eligibility fact, not a full audit. */
  const bestDur = Math.min(1, R * 1.2) * (1 - RHO * 0.5);
  const bestNet = marg * M * E * (bestDur * sf - (1 - bestDur) * esc) - opexMonthly;
  const strongEvidence = ev.rank >= 1;
  const creditable = cr >= 2;
  let verdict, verdictWhy, verdictRoute, verdictRouteLabel, verdictTone;
  if (netSavings <= 0 && bestNet <= 0) {
    verdict = "Buy nothing, as scoped";
    verdictWhy = "Even the upside case is a net cost at this eligibility, cost basis, and operating spend. The economics do not support this purchase as scoped. Fix the underlying process or the price, or hold.";
    verdictRoute = "/tools/business-case"; verdictRouteLabel = "Frame the hold as a business case"; verdictTone = "red";
  } else if (netSavings <= 0) {
    verdict = "Fix the economics or renegotiate";
    verdictWhy = "As entered this is a net loss, but a better resolution rate or a lower platform cost could turn it positive. Renegotiate the floor and the price, or improve the foundation, before committing.";
    verdictRoute = "/tools/contract-risk"; verdictRouteLabel = "Test the contract for a floor"; verdictTone = "amber";
  } else if (E < 0.35) {
    verdict = "Fix the foundation first";
    verdictWhy = "Eligibility is low, so most of your demand is not automatable yet. Knowledge coverage and intent scope are the constraint, not the vendor. Close that gap before buying capacity you cannot use.";
    verdictRoute = "/tools/ai-readiness"; verdictRouteLabel = "Check AI readiness"; verdictTone = "amber";
  } else if (!strongEvidence || !creditable) {
    verdict = "Run a bounded pilot";
    verdictWhy = "The economics are positive but rest on estimated inputs or capacity you have not committed to converting. A scoped pilot earns the evidence a CFO needs before a full commitment.";
    verdictRoute = "/tools/ai-readiness"; verdictRouteLabel = "Design the readiness check"; verdictTone = "electric";
  } else {
    verdict = "Proceed, with a contracted floor";
    verdictWhy = "Positive economics on creditable capacity and real evidence. Proceed, and put the resolution rate in the contract with a remedy so the number you modeled is the number you are owed.";
    verdictRoute = "/tools/business-case"; verdictRouteLabel = "Build the business case"; verdictTone = "green";
  }

  return {
    M, cpc, marg, margWasDefaulted, ep, rp, rhop, escP, E, R, RHO, esc, mechKey, sf, dur,
    attempted, durable, returnedFalse, immediateEsc, postBotHuman, botResolutionRate, netAutomationRate,
    impliedGrossOfTotal, opexMonthly, implOneTime, escalationPremium, vendorClaim, K, netSavings, steadyAnnual,
    netAtEscZero, netAtEscDouble, escSwing, escShareOfResult,
    realizedDollarsPct, realizedDeflectionPct, beResPct, beNote, repeatTolPct, repeatNote,
    monthly, year1, payback, waterfall, waterfallSum, railRate, railBot, railPublished, railReason,
    bestNet, flags, hardFlag, costConf, realConf, headlineConf, confReason, confSentence, axesTied, band, evidenceLabel: ev.label,
    verdict, verdictWhy, verdictRoute, verdictRouteLabel, verdictTone,
  };
}

/* Three named scenarios. The reviewer's non-negotiable: name the assumptions that move
   each one, never relabel low, medium, high. Each scenario states its own deltas. */
function buildScenarios(I) {
  const specs = [
    { label: "Conservative", note: "lower eligibility and resolution, more repeats, slower ramp",
      m: { eligibleRate: 0.8, apparentResolutionRate: 0.85, repeatLeakRate: 1.5 } },
    { label: "Expected", note: "your inputs as entered", m: { eligibleRate: 1, apparentResolutionRate: 1, repeatLeakRate: 1 } },
    { label: "Stretch", note: "better eligibility and resolution, fewer repeats, and what must be true to get there",
      m: { eligibleRate: 1.1, apparentResolutionRate: 1.15, repeatLeakRate: 0.5 } },
  ];
  return specs.map((s) => {
    /* Round the scenario inputs BEFORE the engine consumes them. The label a reader
       recomputes from must be the exact figure the model used, or the scenario block
       quietly fails the same reconciliation standard the bridge is held to. */
    const inp = {
      ...I,
      eligibleRate: Math.round(Math.min(100, n(I.eligibleRate) * s.m.eligibleRate)),
      apparentResolutionRate: Math.round(Math.min(100, n(I.apparentResolutionRate) * s.m.apparentResolutionRate)),
      repeatLeakRate: Math.round(Math.min(100, n(I.repeatLeakRate) * s.m.repeatLeakRate)),
    };
    const r = engine(inp);
    return {
      label: s.label, note: s.note, netSavings: r.netSavings, netAutomationRate: r.netAutomationRate,
      eligibleRate: inp.eligibleRate, apparentResolutionRate: inp.apparentResolutionRate, repeatLeakRate: inp.repeatLeakRate,
    };
  });
}

/* @engine-end */

function buildAnalystRead(R) {
  const out = [];
  out.push(`The denominator is the whole game. The vendor quotes ${R.rp}% resolution, and that number is real, but it is measured on the conversations the bot is involved in. Against your total demand the bot durably removes ${R.netAutomationRate.toFixed(1)}%, because only ${R.ep}% of your volume is eligible and ${(R.RHO * 100).toFixed(0)}% of apparent resolutions come back. A CFO who signs against ${R.rp}% and is billed against ${R.netAutomationRate.toFixed(1)}% will notice the gap in the first quarter.`);

  if (R.margWasDefaulted)
    out.push(`You have not supplied a marginal cost per contact, so the tool assumed ${fmt2(R.marg)}, sixty percent of loaded. Every dollar figure on this page moves proportionally with that number. This is the one input worth thirty minutes with your finance partner before this analysis leaves the building.`);
  else if (R.cpc > 0 && R.marg / R.cpc < 0.85)
    out.push(`Savings are valued at marginal cost, ${fmt2(R.marg)} per contact, not loaded, ${fmt2(R.cpc)}. Resolving a contact frees agent handle time. It does not refund the platform, the lease, or the supervisor. Loaded cost moves the vendor's claim on this page by ${fmt(R.vendorClaim)} a month, and moves your net savings by exactly zero.`);

  if (isFinite(R.beResPct)) {
    const headroom = R.rp - R.beResPct;
    out.push(headroom > 20
      ? `The program breaks even at ${R.beResPct.toFixed(1)}% resolution of AI-involved traffic against your ${R.rp}% figure, which is wide headroom. The risk is not whether it pays back. The risk is whether anyone captures the freed capacity as cash, and whether the ${R.ep}% eligibility holds once the easy intents are exhausted.`
      : `Break-even sits at ${R.beResPct.toFixed(1)}% resolution of AI-involved traffic against your ${R.rp}% figure. That is a thin margin. If real resolution lands below ${R.beResPct.toFixed(1)}% of involved traffic this is a net cost, not a saving. Get the vendor to commit to a resolution floor in the contract, with a remedy.`);
  } else {
    out.push(`At these assumptions the program never breaks even. Operating cost and escalation premium exceed the realistic savings at any resolution rate. Either the platform cost is too high for this volume, or eligibility and repeat leakage are too severe to overcome.`);
  }

  out.push(R.mechKey === "none"
    ? `You have selected no capacity action, so realized savings are $0 and the only cash moving is ${fmt(R.opexMonthly)} of operating cost and ${fmt(R.escalationPremium)} of escalation premium, a monthly loss of ${fmt(Math.abs(R.netSavings))}. Freed handle time becomes money when you reduce overtime, slow hiring, cut vendor volume, or reduce headcount. Pick one, or present this as a capacity story rather than a savings story.`
    : `Freed capacity is valued at ${Math.round(MECH[R.mechKey].f * 100)}% under ${MECH[R.mechKey].label}. Operating cost and escalation premium are cash out and are never scaled by that action, which is why "Not selected" shows a loss rather than a zero. The vendor's own slide implicitly assumes headcount reduction at 100%. If nobody is cutting heads, that slide is not your number.`);

  if (R.implOneTime === 0)
    out.push(`Year 1 net of ${fmt(R.year1)} carries no implementation cost, because you entered none. Bot programs are rarely free to stand up. Whatever the vendor is charging for integration, content build, and professional services comes straight off that figure and pushes payback later than ${R.payback ? "month " + R.payback : "shown"}.`);
  else
    out.push(`Year 1 net of ${fmt(R.year1)} absorbs ${fmt(R.implOneTime)} of one-time implementation cost, which never repeats. Steady state runs ${fmt(R.steadyAnnual)} a year. ${R.payback ? "Payback lands in month " + R.payback + "." : "The program does not pay back within twelve months."} Present both figures. A project can be strongly positive annualized and cash negative in its first year, and finance will find that out with or without you.`);

  out.push(`Decision: ${R.verdict}. ${R.verdictWhy}`);
  return out;
}

/* Scenario contract. DEFAULTS are static on purpose: the state initializer seeds from
   cross-tool pulls, but the URL diff must be taken against a fixed baseline. Marginal
   cost defaults to 0, meaning "not supplied," which forces Directional. */
const V_A = { apparentResolutionRate: 65, repeatLeakRate: 18, escalationPenalty: 25, implOneTime: 0, botPlatformCost: 8000, qaCost: 2000, tuningHours: 40, tuningRate: 65, knowledgeMaintHours: 20, knowledgeRate: 55 };
const V_B = { apparentResolutionRate: 58, repeatLeakRate: 14, escalationPenalty: 18, implOneTime: 0, botPlatformCost: 5000, qaCost: 1200, tuningHours: 25, tuningRate: 65, knowledgeMaintHours: 12, knowledgeRate: 55 };

const DEFAULTS = {
  M: 80000, cpc: 7, marg: 0, eligibleRate: 55,
  mech: MECH_DEFAULT, rampOn: true, rampMonths: 6, compareMode: false,
  evidence: "estimate", costConfirmed: false,
  vA: { ...V_A }, vB: { ...V_B },
};

function LogoMark({ size = 30 }) {
  return <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity={0.6} /><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity={0.8} /><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" /><line x1="-14" y1="-14" x2="14" y2="14" stroke={LIGHT} strokeWidth="5.5" strokeLinecap="round" /><line x1="14" y1="-14" x2="-14" y2="14" stroke={LIGHT} strokeWidth="5.5" strokeLinecap="round" /></g></svg>;
}

function Nav() {
  return <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>Back to Tools</a></div></nav>;
}

const sel = { width: "100%", padding: "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, fontFamily: "'DM Sans', sans-serif" };
const lbl = { fontSize: 12, fontWeight: 600, color: NAVY, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 };
const cardStyle = { background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "20px 22px", marginBottom: 20 };

function VendorInputs({ v, onChange, compact }) {
  const f = (k) => (val) => onChange(k, val);
  return (
    <div style={{ display: "grid", gridTemplateColumns: compact ? "minmax(0,1fr) minmax(0,1fr)" : "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)", gap: 10 }} className="cg">
      <NumField compact={compact} label="Apparent resolution" value={v.apparentResolutionRate} onChange={f("apparentResolutionRate")} suffix="%" step={1} min={0} max={100} hint="of AI-involved" info={DEFS.resolution.text} infoTitle={DEFS.resolution.title} />
      <NumField compact={compact} label="Repeat / false resolution" value={v.repeatLeakRate} onChange={f("repeatLeakRate")} suffix="%" step={1} min={0} max={100} hint="of apparent resolutions" info={DEFS.repeat.text} infoTitle={DEFS.repeat.title} />
      <NumField compact={compact} label="Escalation premium" value={v.escalationPenalty} onChange={f("escalationPenalty")} suffix="%" step={1} min={0} max={200} hint="post-bot contacts cost more" info={DEFS.escalation.text} infoTitle={DEFS.escalation.title} infoAlign="right" />
      <NumField compact={compact} label="One-time implementation" value={v.implOneTime} onChange={f("implOneTime")} prefix="$" step={5000} min={0} hint="hits Year 1 only" info={DEFS.implOneTime.text} infoTitle={DEFS.implOneTime.title} infoAlign="right" />
      <NumField compact={compact} label="Bot platform cost" value={v.botPlatformCost} onChange={f("botPlatformCost")} prefix="$" suffix="/mo" step={500} min={0} />
      <NumField compact={compact} label="QA and monitoring" value={v.qaCost} onChange={f("qaCost")} prefix="$" suffix="/mo" step={250} min={0} />
      <NumField compact={compact} label="Tuning hrs/mo" value={v.tuningHours} onChange={f("tuningHours")} suffix="hrs" step={5} min={0} />
      <NumField compact={compact} label="Tuning rate" value={v.tuningRate} onChange={f("tuningRate")} prefix="$" suffix="/hr" step={5} min={0} />
      <NumField compact={compact} label="Knowledge maint" value={v.knowledgeMaintHours} onChange={f("knowledgeMaintHours")} suffix="hrs/mo" step={5} min={0} />
      <NumField compact={compact} label="Knowledge rate" value={v.knowledgeRate} onChange={f("knowledgeRate")} prefix="$" suffix="/hr" step={5} min={0} />
    </div>
  );
}

export default function AIDeflectionRealityCheck() {
  const [s, setS] = useState(() => ({
    ...DEFAULTS,
    M: getPrimitive("monthlyContacts") != null ? Math.round(getPrimitive("monthlyContacts")) : DEFAULTS.M,
    cpc: getPrimitive("costPerContact") != null ? getPrimitive("costPerContact") : DEFAULTS.cpc,
    marg: getPrimitive("marginalPerContact") != null ? getPrimitive("marginalPerContact") : DEFAULTS.marg,
    vA: { ...V_A }, vB: { ...V_B },
  }));
  const [fromLink, setFromLink] = useState(false);

  const set = (k, v) => setS((p) => ({ ...p, [k]: v }));
  const setVA = (k, v) => setS((p) => ({ ...p, vA: { ...p.vA, [k]: v } }));
  const setVB = (k, v) => setS((p) => ({ ...p, vB: { ...p.vB, [k]: v } }));

  useEffect(() => { window.scrollTo(0, 0); }, []);

  /* A scenario link is a deliberate act. It outranks the ambient rail, and it suppresses
     the PULLED badges, which would otherwise describe someone else's session. */
  useEffect(() => {
    const sc = readScenario(TOOL_ID, DEFAULTS);
    if (!sc) return;
    setS(sc); setFromLink(true); clearScenarioParam();
  }, []);

  /* Read the rail exactly once. This tool publishes on every keystroke, so a pull that
     re-parses sessionStorage on every render would re-read a store it just wrote.
     Consistency, never evidence: none of these three raise a grade here. */
  const rail = useRef(null);
  if (rail.current === null) rail.current = {
    M: getPrimitive("monthlyContacts"),
    cpc: getPrimitive("costPerContact"),
    marg: getPrimitive("marginalPerContact"),
    consistent: sourcedExternally(["monthlyContacts", "costPerContact", "marginalPerContact"], TOOL_ID),
    margExternal: getExternalPrimitive("marginalPerContact", TOOL_ID) != null,
  };
  const pulled = {
    M: !fromLink && rail.current.M != null,
    cpc: !fromLink && rail.current.cpc != null,
    marg: !fromLink && rail.current.marg != null,
  };
  const consistent = !fromLink && rail.current.consistent;
  const margSource = !fromLink && rail.current.margExternal;

  const inputA = { M: s.M, cpc: s.cpc, marg: s.marg, eligibleRate: s.eligibleRate, mech: s.mech, rampOn: s.rampOn, rampMonths: s.rampMonths, evidence: s.evidence, costBasisOwned: s.costConfirmed, ...s.vA };
  const inputB = { ...inputA, ...s.vB };
  const R = engine(inputA);
  const RB = engine(inputB);
  const scenarios = buildScenarios(inputA);
  const analyst = buildAnalystRead(R);
  const winner = R.netSavings >= RB.netSavings ? "A" : "B";

  useEffect(() => {
    /* This tool publishes what it OWNS and nothing else. It does not republish the volume
       or cost basis it pulled: laundering another tool's typed number through this one's
       provenance record is how a confidence gate gets credentialed by nobody. */
    publishToolResult(TOOL_ID, {
      realisticDeflectionRate: R.railPublished ? +R.railRate.toFixed(4) : undefined,
      botResolutionRate: R.railPublished ? +R.railBot.toFixed(4) : undefined,
      aiEligibleRate: +R.E.toFixed(4),
      apparentResolutionRate: +R.R.toFixed(4),
      durableResolutionRate: +R.dur.toFixed(4),
      deflectionNetSavingsMonthly: Math.round(R.netSavings),
      deflectionNetSavingsAnnual: Math.round(R.steadyAnnual),
      deflectionYear1Net: Math.round(R.year1),
      deflectionImplementationOneTime: R.implOneTime,
      deflectionOpexMonthly: Math.round(R.opexMonthly),
      realizedDollarsPct: Math.round(R.realizedDollarsPct),
      breakEvenResolutionPct: isFinite(R.beResPct) ? +R.beResPct.toFixed(1) : undefined,
      capacityAction: R.mechKey,
      deflectionVerdict: R.verdict,
      analystRead: analyst[0],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s]);

  const confColor = (c) => (c === "Finance-grade" ? GREEN : c === "Planning-grade" ? AMBER : MUTED);
  const realColor = (p) => (p >= 60 ? GREEN : p >= 35 ? AMBER : RED);
  const toneColor = (t) => (t === "green" ? GREEN : t === "electric" ? ELECTRIC : t === "amber" ? AMBER : RED);
  const sensLow = R.netSavings * (1 - R.band), sensHigh = R.netSavings * (1 + R.band);

  const card = (label, value, sub, color, dark) => (
    <div style={{ background: dark ? `linear-gradient(135deg, ${NAVY}, ${DEEP})` : WARM, border: dark ? "none" : `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: dark ? color : MUTED, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: dark ? "#fff" : color }}>{value}</div>
      <div style={{ fontSize: 10.5, color: dark ? "rgba(255,255,255,0.4)" : MUTED }}>{sub}</div>
    </div>
  );

  const funnelRows = [
    { label: "Total demand", of: "everything that reaches you", pct: 100, val: R.M, color: SLATE },
    { label: "AI-eligible and routed", of: R.ep + "% of total demand", pct: R.E * 100, val: R.attempted, color: ELECTRIC },
    { label: "Apparent resolutions", of: R.rp + "% of AI-involved", pct: R.E * R.R * 100, val: R.attempted * R.R, color: LIGHT },
    { label: "Durable net automation", of: R.netAutomationRate.toFixed(1) + "% of total demand", pct: R.netAutomationRate, val: R.durable, color: GREEN },
  ];

  const reportSections = [
    { title: "Decision", type: "table", rows: [
      ["Recommended action", R.verdict],
      ["Why", R.verdictWhy],
      ["Net savings monthly", fmt(R.netSavings)],
      ["Upside-case net monthly", fmt(R.bestNet)],
      ["Confidence", R.headlineConf],
    ]},
    { title: "The Three Rates (denominator-explicit)", type: "table", rows: [
      ["Coverage", R.ep + "% of total demand is AI-eligible"],
      ["Apparent resolution", R.rp + "% of AI-involved conversations, the vendor's headline"],
      ["Durable resolution of routed", R.botResolutionRate.toFixed(1) + "% of bot-routed traffic"],
      ["Net automation of total", R.netAutomationRate.toFixed(1) + "% of your total demand"],
      ["Note", "These are not interchangeable. Quoted rates usually describe apparent resolution. Your budget responds to net automation of total demand."],
    ]},
    { title: "Confidence and Evidence", type: "table", rows: [
      ["Headline confidence", R.headlineConf],
      ["Evidence axis", R.costConf + " (" + R.evidenceLabel + ")"],
      ["Realization axis", R.realConf + " (" + MECH[R.mechKey].label + ")"],
      ["Why", R.confSentence],
      ["Sensitivity band", "+/- " + Math.round(R.band * 100) + "% on net savings, " + fmtK(sensLow) + " to " + fmtK(sensHigh) + " per month"],
      ["Open issues", R.flags.length === 0 ? "none" : R.flags.length + (R.flags.length === 1 ? " issue, listed below" : " issues, listed below")],
      ["Cross-tool consistency", consistent ? "Volume and both cost figures arrived from other tools this session. Consistency, not evidence." : "Inputs were entered here or defaulted."],
      ["What this grade is not", "Self-declared. It reflects the sources you named, not sources this tool inspected. No document, payroll file, or pilot dataset was reviewed in producing this report."],
      ["Methodology version", METHODOLOGY_VERSION + ", benchmark vintage " + BENCHMARK_VINTAGE],
    ]},
    { title: "Vendor Claim to Reality Bridge", type: "table", rows: R.waterfall.map((w) => [w.label, (w.value >= 0 ? "+" : "") + fmt(w.value)]).concat([["Net monthly savings", fmt(R.netSavings)]]) },
    { title: "Rail Handoff to Downstream Tools", type: "table", rows: R.railPublished ? [
      ["realisticDeflectionRate", R.netAutomationRate.toFixed(1) + "% of total demand, published"],
      ["botResolutionRate", R.botResolutionRate.toFixed(1) + "% of bot-routed traffic, published"],
      ["Consumed by", "Channel Shift Economics, to size the human pool"],
      ["Status", "Published. Downstream tools will use your figures, not their defaults."],
    ] : [
      ["realisticDeflectionRate", "NOT PUBLISHED"],
      ["botResolutionRate", "NOT PUBLISHED"],
      ["Reason", R.railReason || "The value did not satisfy the rail's unit contract."],
      ["Consequence", "Channel Shift Economics will fall back to its own default. Nothing downstream will warn you. This report is the warning."],
    ]},
    { title: "Break-Even Thresholds", type: "table", rows: [
      ["Break-even resolution rate", isFinite(R.beResPct) ? R.beResPct.toFixed(1) + "% of involved against a " + R.rp + "% figure" : (R.beNote || "never breaks even at any resolution rate")],
      ["Maximum tolerable repeat rate", R.repeatTolPct != null ? R.repeatTolPct.toFixed(0) + "% against " + R.rhop + "% entered" : (R.repeatNote || "not computable")],
      ["Year 1 net", fmt(R.year1) + (s.rampOn ? " (ramped over " + s.rampMonths + " months)" : " (no ramp)") + (R.implOneTime > 0 ? ", after " + fmt(R.implOneTime) + " one-time implementation" : ", no implementation cost entered")],
      ["Steady-state annual", fmt(R.steadyAnnual)],
      ["Payback", R.payback ? "month " + R.payback : "not within 12 months"],
    ]},
    { title: "Scenarios (assumptions named)", type: "table", rows: scenarios.map((x) => [x.label + ", " + x.note, fmtK(x.netSavings) + "/mo at " + x.netAutomationRate.toFixed(1) + "% net automation. Eligible " + x.eligibleRate + "%, resolution " + x.apparentResolutionRate + "%, repeat " + x.repeatLeakRate + "%"]) },
    ...(s.compareMode ? [{ title: "Assumption set A vs B", type: "table", rows: [
      ["Set A, resolves " + R.rp + "% of involved", fmtK(R.netSavings) + "/mo, " + R.netAutomationRate.toFixed(1) + "% net automation of total"],
      ["Set B, resolves " + RB.rp + "% of involved", fmtK(RB.netSavings) + "/mo, " + RB.netAutomationRate.toFixed(1) + "% net automation of total"],
      ["Higher net", "Set " + winner + ", by " + fmtK(Math.abs(R.netSavings - RB.netSavings)) + "/mo"],
    ]}] : []),
    ...(R.flags.length ? [{ title: "Integrity Flags (" + R.flags.length + ")", type: "findings", items: R.flags }] : []),
    { title: "Analyst Read", type: "findings", items: analyst },
    { title: "Methodology", type: "text", content: `Three rates, three denominators, never interchanged. Coverage is AI-eligible demand over total demand. Apparent resolution is the vendor's headline, measured over AI-involved conversations. Net automation is durable resolutions over total demand, and it is the only one that maps to a budget. Durable resolutions, meaning apparent resolutions that do not recur, are valued at marginal cost, the variable handle-time labor that resolution actually frees, not at the fully loaded cost the vendor uses, because fixed platform, facilities, and supervision cost do not fall with volume. Loaded cost therefore moves the vendor's claim and moves net savings by exactly zero. Freed handle time is capacity, not cash, until an action converts it. Realized capacity is scaled by the selected capacity action, ${MECH[R.mechKey].label} at ${Math.round(MECH[R.mechKey].f * 100)}%, and "Not selected" realizes $0. Operating cost and the escalation premium are cash out the door and are never scaled by that action, which is why no action still shows a loss rather than a zero. The escalation premium applies to every post-bot human contact, both immediate escalations and false-resolution returns. Valuing resolution at 100% is headcount reduction, the assumption most vendor ROI slides make silently. Break-even thresholds are solved in closed form and verified against the engine's own zero crossings. The bridge reconciles exactly to net monthly savings. Every rate input is clamped to its physical domain before any arithmetic runs, so this engine cannot produce a net automation rate outside 0 to 100%, and cannot hand the rest of the suite a value that would be silently dropped or rescaled. Confidence is two-axis: evidence for what attests to the resolution rate and the cost basis, realization for whether finance can book the result. The headline is the weaker of the two. Benchmark defaults, all editable: ${SOURCES.eligible} ${SOURCES.resolution} ${SOURCES.repeat} ${SOURCES.escalation}` },
    { title: "Next Steps", type: "next", items: [
      ...(R.margWasDefaulted ? [{ tool: "Cost per Contact", reason: "Replace the assumed marginal cost basis. It drives every dollar on this page", href: "/tools/cost-per-contact" }] : []),
      { tool: R.verdictRouteLabel, reason: R.verdictWhy, href: R.verdictRoute },
      { tool: "Channel Shift Economics", reason: "Size the human pool using the bot resolution rate published above", href: "/tools/channel-shift" },
      { tool: "Staffing Calculator", reason: "Convert avoided workload into a real schedule reduction using Erlang C, because volume off the queue is not headcount off the roster", href: "/tools/staffing-calculator" },
      { tool: "Contract Risk Scanner", reason: "Test whether the resolution floor is contractually enforceable", href: "/tools/contract-risk" },
    ]},
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: WARM, minHeight: "100vh" }}>
      <style>{`@media(max-width:720px){.cg{grid-template-columns:1fr 1fr !important}.s4{grid-template-columns:1fr 1fr !important}.s3{grid-template-columns:1fr !important}.env{grid-template-columns:1fr !important}}`}</style>
      <Nav />

      <section style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, padding: "48px 0 40px" }}>
        <div style={WRAP}>
          <div style={{ fontSize: 11, fontWeight: 700, color: LIGHT, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 10 }}>Cost and Economics · Diagnose before you buy</div>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 42, fontWeight: 400, color: "#fff", margin: "0 0 12px", lineHeight: 1.1 }}>AI Deflection Reality Check</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", maxWidth: 680, lineHeight: 1.65, margin: 0 }}>
            A 70% AI resolution rate does not mean 70% of total customer demand disappeared. The denominator determines the truth. This tool separates coverage, resolution, and durable automation into three honest rates, then values what is left at the cost that actually leaves your budget. Run it before you approve an automation business case or commit to a resolution target. Sometimes the answer is that the program pays. Sometimes it is that the slide is inflated and the move is to renegotiate, fix the foundation first, or buy nothing.
          </p>
          {fromLink && <div style={{ marginTop: 18, display: "inline-block", background: "rgba(0,170,255,0.12)", border: "1px solid rgba(0,170,255,0.3)", borderRadius: 6, padding: "8px 14px", fontSize: 12.5, color: LIGHT }}>Loaded from a scenario link. These are the sender's inputs, not this session's.</div>}
        </div>
      </section>

      <section style={{ padding: "36px 0 72px" }}>
        <div style={WRAP}>

          {/* environment */}
          <div style={cardStyle}>
            <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: NAVY, margin: "0 0 4px" }}>Your environment</h3>
            <p style={{ fontSize: 12.5, color: MUTED, margin: "0 0 16px", lineHeight: 1.6 }}>This tool is strongest after Cost per Contact, which supplies the cost basis. Eligibility is a property of your demand, not of the vendor, so it is shared across both assumption sets below. Marginal cost is the savings basis for everything on this page.</p>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)", gap: 12 }} className="env">
              <NumField label="Monthly contacts" value={s.M} onChange={(v) => set("M", v)} step={1000} min={0} pulled={pulled.M} />
              <NumField label="Loaded cost per contact" value={s.cpc} onChange={(v) => set("cpc", v)} prefix="$" step={0.25} min={0} pulled={pulled.cpc} info={DEFS.loadedCPC.text} infoTitle={DEFS.loadedCPC.title} />
              <NumField label="Marginal cost per contact" value={s.marg} onChange={(v) => set("marg", v)} prefix="$" step={0.25} min={0} pulled={pulled.marg} hint={R.margWasDefaulted ? "0 assumes 60% of loaded, " + fmt2(R.marg) : "the savings basis"} info={DEFS.marginalCPC.text} infoTitle={DEFS.marginalCPC.title} />
              <NumField label="AI-eligible demand" value={s.eligibleRate} onChange={(v) => set("eligibleRate", v)} suffix="%" step={1} min={0} max={100} hint="of total, automatable" info={DEFS.eligible.text} infoTitle={DEFS.eligible.title} infoAlign="right" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12, marginTop: 16 }} className="env">
              <div>
                <label style={lbl}>Where does the resolution rate come from<InfoDot text={DEFS.evidence.text} title={DEFS.evidence.title} /></label>
                <select value={s.evidence} onChange={(e) => set("evidence", e.target.value)} style={sel}>
                  {EVIDENCE_ORDER.map((k) => <option key={k} value={k}>{EVIDENCE[k].label}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Capacity action<InfoDot text={DEFS.mech.text} title={DEFS.mech.title} align="right" /></label>
                <select value={s.mech} onChange={(e) => set("mech", e.target.value)} style={sel}>
                  {MECH_ORDER.map((k) => <option key={k} value={k}>{MECH[k].label}{k === "none" ? " ($0)" : "  (" + Math.round(MECH[k].f * 100) + "%)"}</option>)}
                </select>
              </div>
            </div>

            <label style={{ display: "flex", gap: 9, alignItems: "flex-start", marginTop: 16, cursor: R.margWasDefaulted ? "not-allowed" : "pointer", opacity: R.margWasDefaulted ? 0.5 : 1 }}>
              <input type="checkbox" checked={s.costConfirmed && !R.margWasDefaulted} disabled={R.margWasDefaulted} onChange={(e) => set("costConfirmed", e.target.checked)} style={{ marginTop: 3 }} />
              <span style={{ fontSize: 12.5, color: SLATE, lineHeight: 1.55 }}>
                Marginal cost confirmed against payroll or finance data.
                <span style={{ display: "block", fontSize: 11.5, color: MUTED, marginTop: 2 }}>
                  {R.margWasDefaulted
                    ? "Disabled. There is nothing to confirm while the marginal cost is an assumed 60% of loaded."
                    : margSource
                      ? "This figure arrived from another tool on this site. That confers consistency, not evidence. Finance-grade requires that a person confirmed it against a document."
                      : "Required for Finance-grade. A number typed into a calculator is an estimate until something attests to it."}
                </span>
              </span>
            </label>
          </div>

          {/* vendors */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
              <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: NAVY, margin: 0 }}>{s.compareMode ? "Assumption set A" : "The claim being tested"}</h3>
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, color: SLATE, cursor: "pointer" }}>
                <input type="checkbox" checked={s.compareMode} onChange={(e) => set("compareMode", e.target.checked)} />
                Compare two assumption sets
              </label>
            </div>
            <VendorInputs v={s.vA} onChange={setVA} compact={s.compareMode} />
            {s.compareMode && (
              <div style={{ marginTop: 22, paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
                <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: NAVY, margin: "0 0 14px" }}>Assumption set B</h3>
                <VendorInputs v={s.vB} onChange={setVB} compact />
              </div>
            )}
            <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", marginTop: 16, paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, color: SLATE, cursor: "pointer" }}>
                <input type="checkbox" checked={s.rampOn} onChange={(e) => set("rampOn", e.target.checked)} />
                Resolution ramps over time
              </label>
              {s.rampOn && <div style={{ width: 150 }}><NumField compact label="Ramp to full (months)" value={s.rampMonths} onChange={(v) => set("rampMonths", v)} min={1} max={12} step={1} /></div>}
            </div>
          </div>

          {/* the three rates */}
          <div style={cardStyle}>
            <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: NAVY, margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6 }}>Coverage, resolution, and net automation<InfoDot text={DEFS.funnel.text} title={DEFS.funnel.title} /></h3>
            <p style={{ fontSize: 12.5, color: MUTED, margin: "0 0 18px" }}>Three different rates with three different denominators. The vendor's headline is apparent resolution. Your budget responds to durable net automation. Starting values are illustrative benchmarks, not a claim about your operation or any particular vendor. Replace them with your own figures.</p>
            {funnelRows.map((f, i) => (
              <div key={i} style={{ marginBottom: i === funnelRows.length - 1 ? 0 : 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: NAVY }}>{f.label}</span>
                  <span style={{ fontSize: 11.5, color: MUTED, textAlign: "right" }}>{Math.round(f.val).toLocaleString()} / mo · {f.of}</span>
                </div>
                <div style={{ height: 22, background: WARM, borderRadius: 5, overflow: "hidden", border: `1px solid ${BORDER}` }}>
                  <div style={{ width: Math.max(1, Math.min(100, f.pct)) + "%", height: "100%", background: f.color, opacity: i === 0 ? 0.35 : 0.85 }} />
                </div>
              </div>
            ))}
            <div style={{ marginTop: 16, background: ICE, borderRadius: 8, padding: "11px 14px", fontSize: 12, color: SLATE, lineHeight: 1.55 }}>
              The vendor's <strong>{R.rp}% resolution</strong> is a share of AI-involved conversations. Against your total demand it is <strong>{R.netAutomationRate.toFixed(1)}%</strong>. A resolution rate is only meaningful with its denominator attached.
            </div>
          </div>

          {/* headline */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)", gap: 12, marginBottom: 20 }} className="s4">
            {card("Vendor Claim", fmtK(R.vendorClaim), R.rp + "% at " + fmt2(R.cpc) + " loaded", LIGHT, true)}
            {card("Net Savings / mo", fmtK(R.netSavings), R.netSavings > 0 ? fmtK(R.steadyAnnual) + "/yr steady" : "net cost", R.netSavings > 0 ? GREEN : RED)}
            {card("Net Automation", R.netAutomationRate.toFixed(1) + "%", "of total demand", realColor(R.netAutomationRate >= 25 ? 60 : R.netAutomationRate >= 15 ? 40 : 20))}
            {card("Dollars Realized", R.realizedDollarsPct.toFixed(0) + "%", "of the vendor's claim", realColor(R.realizedDollarsPct))}
          </div>

          {/* decision */}
          <div style={{ ...cardStyle, borderLeft: `4px solid ${toneColor(R.verdictTone)}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>The decision this protects<InfoDot text={DEFS.verdict.text} title={DEFS.verdict.title} /></div>
            <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: toneColor(R.verdictTone), margin: "0 0 8px" }}>{R.verdict}</div>
            <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.65, margin: "0 0 10px" }}>{R.verdictWhy}</p>
            <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.6, marginBottom: 14, background: WARM, borderRadius: 8, padding: "10px 13px" }}>
              What selected this: net {fmt(R.netSavings)}/mo, upside case {fmt(R.bestNet)}/mo, eligibility {R.ep}%, evidence {R.evidenceLabel.toLowerCase()}, capacity action {MECH[R.mechKey].label.toLowerCase()}. Change any of those and the verdict can change.
            </div>
            <a href={R.verdictRoute} style={{ display: "inline-block", fontSize: 12.5, fontWeight: 600, color: "#fff", background: toneColor(R.verdictTone), padding: "8px 16px", borderRadius: 6, textDecoration: "none" }}>{R.verdictRouteLabel}</a>
          </div>

          {/* confidence */}
          <div style={{ ...cardStyle, borderLeft: `3px solid ${confColor(R.headlineConf)}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 1, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>Confidence<InfoDot text={DEFS.confidence.text} title={DEFS.confidence.title} /></div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: confColor(R.headlineConf) }}>{R.headlineConf}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12, margin: "14px 0" }} className="env">
              <div style={{ background: WARM, borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 10.5, color: MUTED, textTransform: "uppercase", letterSpacing: 1 }}>Evidence</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: confColor(R.costConf) }}>{R.costConf}</div>
                <div style={{ fontSize: 11.5, color: MUTED, marginTop: 2 }}>{R.evidenceLabel}</div>
              </div>
              <div style={{ background: WARM, borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 10.5, color: MUTED, textTransform: "uppercase", letterSpacing: 1 }}>Realization</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: confColor(R.realConf) }}>{R.realConf}</div>
                <div style={{ fontSize: 11.5, color: MUTED, marginTop: 2 }}>{MECH[R.mechKey].label}</div>
              </div>
            </div>
            <p style={{ fontSize: 12.5, color: SLATE, lineHeight: 1.6, margin: "0 0 10px" }}>{R.confSentence} Net savings carry a plus or minus {Math.round(R.band * 100)}% band at this evidence level, {fmtK(sensLow)} to {fmtK(sensHigh)} per month.</p>
            <div style={{ background: WARM, borderRadius: 8, padding: "10px 13px", fontSize: 11.5, color: MUTED, lineHeight: 1.55 }}>
              This grade is self-declared. It reflects what you have told this tool about your sources, not anything this tool has inspected. No document, payroll file, or pilot dataset has been reviewed here. Independent validation of the underlying inputs is a separate exercise.
            </div>
          </div>

          {/* rail handoff */}
          <div style={{ ...cardStyle, borderLeft: `3px solid ${R.railPublished ? ELECTRIC : RED}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: R.railPublished ? ELECTRIC : RED, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              Rail handoff<InfoDot text={DEFS.rail.text} title={DEFS.rail.title} />
            </div>
            {R.railPublished ? (
              <>
                <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.65, margin: "0 0 12px" }}>
                  This is the only tool on the site that produces a realistic deflection rate. Two figures are now available to the rest of the suite, and they are not the same number.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12 }} className="env">
                  <div style={{ background: ICE, borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: NAVY }}>{R.netAutomationRate.toFixed(1)}% net automation</div>
                    <div style={{ fontSize: 11.5, color: SLATE, marginTop: 3, lineHeight: 1.5 }}>Share of your <strong>total</strong> contact volume the bot durably removes. The honest headline deflection number.</div>
                  </div>
                  <div style={{ background: ICE, borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: NAVY }}>{R.botResolutionRate.toFixed(1)}% bot resolution</div>
                    <div style={{ fontSize: 11.5, color: SLATE, marginTop: 3, lineHeight: 1.5 }}>Share of the volume you <strong>route to the bot</strong> that durably resolves. This is what Channel Shift needs to size the human pool.</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.65, margin: "0 0 8px" }}><strong style={{ color: RED }}>Nothing was published to the rest of the suite.</strong> {R.railReason}</p>
                <p style={{ fontSize: 12.5, color: SLATE, lineHeight: 1.6, margin: 0 }}>Channel Shift Economics will fall back to its own default bot resolution rate. That fallback is correct behavior, because a rate the rail cannot trust should never travel. It is also completely silent downstream. This panel is the only place it is visible.</p>
              </>
            )}
          </div>

          {/* integrity */}
          {R.flags.length > 0 && (
            <div style={{ ...cardStyle, borderLeft: `3px solid ${R.hardFlag ? RED : AMBER}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: R.hardFlag ? RED : AMBER, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>
                Integrity flags · {R.flags.length} {R.flags.length === 1 ? "issue" : "issues"}
              </div>
              {R.flags.map((f, i) => <p key={i} style={{ fontSize: 12.5, color: SLATE, lineHeight: 1.6, margin: i ? "10px 0 0" : 0 }}>{f}</p>)}
            </div>
          )}

          {/* bridge */}
          <div style={cardStyle}>
            <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: NAVY, margin: "0 0 4px" }}>Vendor claim to reality</h3>
            <p style={{ fontSize: 12.5, color: MUTED, margin: "0 0 16px" }}>Every subtraction, in order, starting from the resolution rate applied to all volume at loaded cost. This reconciles exactly to net monthly savings.</p>
            {R.waterfall.map((w, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "9px 0", borderBottom: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 12.5, color: i === 0 ? NAVY : SLATE, fontWeight: i === 0 ? 600 : 400 }}>{w.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: w.value >= 0 ? NAVY : RED, whiteSpace: "nowrap" }}>{(w.value >= 0 ? "+" : "") + fmt(w.value)}</span>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "14px 0 0" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>Net monthly savings</span>
              <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: R.netSavings >= 0 ? GREEN : RED }}>{fmt(R.netSavings)}</span>
            </div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${BORDER}`, fontSize: 11.5, color: MUTED, lineHeight: 1.6 }}>
              The escalation premium is a directional constant, not a measured figure. At 0% it would be {fmt(R.netAtEscZero)} a month. At {R.escP * 2}%, double what you entered, it would be {fmt(R.netAtEscDouble)}. That is a {fmt(R.escSwing)} swing across the plausible range, so measure your own post-escalation handle time before leaning on this line.
            </div>
          </div>

          {/* year one */}
          <div style={cardStyle}>
            <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: NAVY, margin: "0 0 16px" }}>Year one, month by month</h3>
            <div style={{ display: "flex", gap: 24, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div><div style={{ fontSize: 11, color: MUTED }}>Year 1 {s.rampOn ? "(ramped " + s.rampMonths + "mo)" : "(full)"}</div><div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, color: R.year1 >= 0 ? GREEN : RED }}>{fmtK(R.year1)}</div></div>
              <div><div style={{ fontSize: 11, color: MUTED }}>Steady-state annual</div><div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, color: NAVY }}>{fmtK(R.steadyAnnual)}</div></div>
              <div><div style={{ fontSize: 11, color: MUTED }}>Payback</div><div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, color: R.payback ? NAVY : RED }}>{R.payback ? "Mo " + R.payback : "None"}</div></div>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 48 }}>
                  {R.monthly.map((m, i) => { const mx = Math.max(...R.monthly.map(Math.abs), 1); return <div key={i} title={"Mo " + (i + 1) + ": " + fmtK(m)} style={{ flex: 1, height: Math.max(4, (Math.abs(m) / mx) * 100) + "%", background: m >= 0 ? GREEN : RED, opacity: 0.35 + 0.65 * (i / 11), borderRadius: 2 }} />; })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: MUTED, marginTop: 3 }}><span>Mo 1</span><span>net savings per month</span><span>Mo 12</span></div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)", gap: 12, marginTop: 18 }} className="s3">
              <div style={{ background: WARM, borderRadius: 8, padding: "12px 14px" }}><div style={{ fontSize: 10.5, color: MUTED }}>Break-even resolution</div><div style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{isFinite(R.beResPct) ? R.beResPct.toFixed(1) + "%" : "never"}</div><div style={{ fontSize: 10.5, color: MUTED }}>your figure is {R.rp}%</div></div>
              <div style={{ background: WARM, borderRadius: 8, padding: "12px 14px" }}><div style={{ fontSize: 10.5, color: MUTED }}>Max tolerable repeat</div><div style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{R.repeatTolPct != null ? R.repeatTolPct.toFixed(0) + "%" : "n/a"}</div><div style={{ fontSize: 10.5, color: MUTED }}>{R.repeatTolPct != null ? "you entered " + R.rhop + "%" : R.repeatNote}</div></div>
              <div style={{ background: WARM, borderRadius: 8, padding: "12px 14px" }}><div style={{ fontSize: 10.5, color: MUTED }}>Upside-case net</div><div style={{ fontSize: 15, fontWeight: 600, color: R.bestNet >= 0 ? GREEN : RED }}>{fmtK(R.bestNet)}/mo</div><div style={{ fontSize: 10.5, color: MUTED }}>better resolution, fewer repeats</div></div>
            </div>
          </div>

          {/* scenarios */}
          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 20 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: LIGHT, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Three scenarios, named assumptions</h3>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>Not low, medium, and high with the same story. Each scenario states the eligibility, resolution, and repeat assumptions that move it, so you can see exactly what has to be true to reach it.</p>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)", gap: 10 }} className="s3">
              {scenarios.map((x, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "13px 15px", border: `1px solid ${i === 1 ? "rgba(0,170,255,0.4)" : "rgba(255,255,255,0.06)"}` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.6 }}>{x.label}</div>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: x.netSavings >= 0 ? "#fff" : RED }}>{fmtK(x.netSavings)}<span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>/mo</span></div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>{x.netAutomationRate.toFixed(1)}% net automation of total</div>
                  <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>eligible {x.eligibleRate}% · resolution {x.apparentResolutionRate}% · repeat {x.repeatLeakRate}%</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <a href="/vendors/iva" style={{ fontSize: 12, fontWeight: 600, color: LIGHT, padding: "5px 14px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.15)", textDecoration: "none" }}>50 scored IVA vendors</a>
              <a href="/tools/channel-shift" style={{ fontSize: 12, fontWeight: 600, color: LIGHT, padding: "5px 14px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.15)", textDecoration: "none" }}>Channel Shift Economics</a>
              <a href="/tools/cost-per-contact" style={{ fontSize: 12, fontWeight: 600, color: LIGHT, padding: "5px 14px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.15)", textDecoration: "none" }}>Cost per Contact</a>
            </div>
          </div>

          {/* compare */}
          {s.compareMode && (
            <div style={cardStyle}>
              <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: NAVY, margin: "0 0 4px" }}>Assumption set A vs B</h3>
              <p style={{ fontSize: 12.5, color: MUTED, margin: "0 0 14px" }}>Same volume, same cost basis, same eligibility and capacity action. Only the performance assumptions differ. This compares assumptions, not commercial proposals: pricing structures, committed volumes, overage terms, and contract exposure belong in Contract Risk Scanner.</p>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 12 }} className="env">
                {[["A", R], ["B", RB]].map(([k, r]) => (
                  <div key={k} style={{ background: winner === k ? ICE : WARM, border: `1px solid ${winner === k ? ELECTRIC : BORDER}`, borderRadius: 8, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1, textTransform: "uppercase" }}>Set {k} {winner === k && <span style={{ color: ELECTRIC }}>· higher net</span>}</div>
                    <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, color: r.netSavings >= 0 ? GREEN : RED, margin: "4px 0" }}>{fmtK(r.netSavings)}<span style={{ fontSize: 12, color: MUTED }}>/mo</span></div>
                    <div style={{ fontSize: 11.5, color: SLATE, lineHeight: 1.55 }}>Resolves {r.rp}% of involved, which is {r.netAutomationRate.toFixed(1)}% of total demand. Operating cost {fmtK(r.opexMonthly)}/mo. Verdict: {r.verdict}.</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* analyst read */}
          <div style={{ ...cardStyle, borderLeft: `3px solid ${ELECTRIC}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: ELECTRIC, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Analyst read · what the vendor slide skips</div>
            {analyst.map((t, i) => <p key={i} style={{ fontSize: 13, color: SLATE, lineHeight: 1.65, margin: i ? "10px 0 0" : 0 }}>{t}</p>)}
          </div>

          <ReportActions
            toolId={TOOL_ID}
            toolName="AI Deflection Reality Check"
            subtitle={`${R.verdict} · ${R.headlineConf} · ${R.netAutomationRate.toFixed(1)}% net automation of total vs ${R.rp}% resolution claimed · net ${fmtK(R.netSavings)}/mo`}
            routePath={ROUTE}
            state={s}
            defaults={DEFAULTS}
            confidence={R.headlineConf}
            summary={[
              { label: "Recommended action", value: R.verdict },
              { label: "Vendor claim monthly", value: fmt(R.vendorClaim) },
              { label: "Net savings monthly", value: fmt(R.netSavings) },
              { label: "Steady-state annual", value: fmt(R.steadyAnnual) },
              { label: "Year 1 net", value: fmt(R.year1) },
              { label: "Coverage, eligible of total", value: R.ep + "%" },
              { label: "Apparent resolution, of involved", value: R.rp + "%" },
              { label: "Net automation, of total", value: R.netAutomationRate.toFixed(1) + "%" },
              { label: "Bot resolution, of routed", value: R.botResolutionRate.toFixed(1) + "%" },
              { label: "Dollars realized", value: Math.round(R.realizedDollarsPct) + "%" },
              { label: "Break-even resolution", value: isFinite(R.beResPct) ? R.beResPct.toFixed(1) + "%" : "never" },
              { label: "Payback", value: R.payback ? "month " + R.payback : "not within 12 months" },
            ]}
            signals={{
              /* Derived signals only. No vendor name, contact volume, agent cost, quote
                 amount, implementation budget, or contract date leaves this block. Bands
                 and booleans carry the commercial meaning; the raw operating data stays
                 in the user's browser and in the report they download. */
              methodology_version: METHODOLOGY_VERSION,
              severity: R.netSavings <= 0 ? "high" : R.realizedDollarsPct < 20 ? "elevated" : "normal",
              verdict_class: R.verdict,
              has_real_cost_basis: !R.margWasDefaulted,
              has_document_evidence: ["proposal", "sla", "pilot"].indexOf(s.evidence) >= 0,
              has_cash_action: CRED_RANK[MECH[R.mechKey].cred] >= 3,
              evaluating_active_proposal: ["proposal", "sla"].indexOf(s.evidence) >= 0,
              overrode_defaults: s.eligibleRate !== DEFAULTS.eligibleRate || s.vA.apparentResolutionRate !== V_A.apparentResolutionRate || s.vA.repeatLeakRate !== V_A.repeatLeakRate,
              compared_scenarios: !!s.compareMode,
              volume_band: R.M >= 500000 ? "very_high" : R.M >= 150000 ? "high" : R.M >= 40000 ? "mid" : "low",
              automation_band: R.netAutomationRate >= 30 ? "high" : R.netAutomationRate >= 15 ? "mid" : "low",
              confidence_class: R.headlineConf,
              rail_published: R.railPublished,
              open_issues: R.flags.length,
              /* Terminal intent signal, zero infrastructure. Real cost basis, a cash-creditable
                 action, and document-backed evidence together mean this person is evaluating a
                 live investment rather than browsing. Watchable in existing free analytics. */
              decision_ready_signal: !R.margWasDefaulted && CRED_RANK[MECH[R.mechKey].cred] >= 3 && ["proposal", "sla", "pilot"].indexOf(s.evidence) >= 0,
            }}
            sections={reportSections}
          />

        </div>
      </section>
    </div>
  );
}
