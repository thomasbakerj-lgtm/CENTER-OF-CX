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
   the verified engine and the deployed engine cannot drift apart. Do not remove them. */
const n = (v) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const fmt = (v) => (v < 0 ? "-$" : "$") + Math.abs(Math.round(n(v))).toLocaleString();
const fmt2 = (v) => "$" + Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtK = (v) => { const x = n(v), s = x < 0 ? "-" : ""; const a = Math.abs(x); return s + (a >= 1000000 ? "$" + (a / 1000000).toFixed(2) + "M" : a >= 1000 ? "$" + (a / 1000).toFixed(0) + "K" : "$" + Math.round(a)); };

const ORDER = ["Directional", "Planning-grade", "Finance-grade"];
const CRED_RANK = { none: 0, capacity: 1, finance: 2, cash: 3 };

/* Evidence axis. Finance-grade requires a document, exactly as it does in License
   Bundle Gap. A deflection rate is the single most-inflated number in this market,
   so the source of that number is the first thing the report has to name. */
const EVIDENCE = {
  estimate:  { rank: 0, label: "Internal estimate or benchmark" },
  marketing: { rank: 0, label: "Vendor marketing (deck, website, case study)" },
  proposal:  { rank: 1, label: "Vendor proposal or SOW" },
  sla:       { rank: 2, label: "Contracted deflection floor with a remedy" },
  pilot:     { rank: 2, label: "Observed pilot or production data" },
};
const EVIDENCE_ORDER = ["estimate", "marketing", "proposal", "sla", "pilot"];

/* DEFS is the future glossary content. Write once, lift later. */
const DEFS = {
  loadedCPC: { title: "Loaded cost per contact", text: "Fully burdened cost including facilities, licenses, supervision, and overhead. It is the right number to report upward as a unit metric. It is the wrong number to value savings with, because deflecting a contact does not refund a lease. Loaded cost moves the vendor's claim on this page. It does not move your net savings." },
  marginalCPC: { title: "Marginal cost per contact", text: "The cost that actually disappears when one contact goes away: agent wage plus benefits for the handle time it consumed. Every savings figure on this page is valued here. If you leave it blank the tool assumes 60% of loaded cost and caps confidence at Directional, because an assumed savings basis is not a savings basis." },
  grossDeflection: { title: "Gross deflection", text: "The share of total contacts the vendor claims the bot will handle end to end. It is a promise, not a measurement, until something attests to it. This is the number the entire ROI slide rests on and the number least likely to survive contact with your traffic." },
  botLeakage: { title: "Bot leakage", text: "Contacts that enter the bot, abandon it, and arrive at an agent anyway. They were counted as deflected by the containment metric and they were not deflected at all. Leakage is why raw containment and true deflection are different numbers." },
  containmentFailure: { title: "Containment failure", text: "The bot reports the issue resolved and it is not. The customer returns, usually to a human, usually annoyed. This is the most expensive failure mode because it looks like success on the vendor's dashboard and shows up as a repeat contact on yours." },
  escalation: { title: "Escalation premium", text: "Contacts that reach an agent after failing a bot cost more than contacts that reach an agent directly: longer handle time, context rebuilding, higher transfer and escalation rates. This premium is real cash out and is never scaled by your capacity action." },
  mech: { title: "Capacity action", text: "Freed agent handle time is capacity, not cash, until something converts it. Not selected realizes $0, which is the honest answer and the one most vendor business cases quietly skip. Operating cost and escalation premium are cash out regardless, which is why no action shows a loss rather than a zero." },
  evidence: { title: "Evidence source", text: "What backs the deflection rate you entered. Marketing claims and internal estimates cannot exceed Directional confidence. A proposal is a document but not a commitment, so it reaches Planning-grade. Only a contracted floor with a remedy, or deflection you have observed in your own environment, can reach Finance-grade." },
  implOneTime: { title: "One-time implementation cost", text: "Integration, content build, professional services, and the internal hours to stand the bot up. It hits Year 1 and never repeats, so it changes payback without touching steady-state economics. Leaving it at zero does not make it zero. It makes your Year 1 number optimistic by exactly the amount the vendor is charging." },
  confidence: { title: "Confidence, two axes", text: "Evidence asks what attests to the deflection rate and the cost basis. Realization asks whether finance can book the savings given your capacity action. The headline reports the weaker of the two. Any clamped or impossible input forces Directional regardless of the rest." },
  rail: { title: "Rail handoff", text: "This tool is the only producer of the realistic deflection rate the rest of the suite consumes. The panel names exactly what it published, in what unit, and to whom. If it published nothing, it says so, because a downstream tool falling back to a default without telling anyone is how a suite quietly lies." },
  claim: { title: "Vendor claim", text: "Gross deflection times loaded cost per contact. This is the arithmetic on the vendor slide. It is not wrong, it is answering a different question: what would this be worth if nothing leaked, nothing failed, fixed cost fell with volume, and somebody removed the heads." },
};

/* ========================================================== engine ========= */
/* Node-verified before any of this UI existed. 54 assertions: waterfall
   reconciliation to 1e-10, closed-form break-even zeros, ten directional sweeps,
   grade reachability, and a 20,480-case hostile domain sweep proving the rate
   cannot leave [0,100]. The V2 engine could leave it. See the guard below. */

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

  const Gp = gc(I.grossDeflection, 0, 100, "Gross deflection");
  const Lp = gc(I.botLeakage, 0, 100, "Bot leakage");
  const Fp = gc(I.containmentFailure, 0, 100, "Containment failure");
  const escP = gc(I.escalationPenalty, 0, 200, "Escalation premium");

  const G = Gp / 100, L = Lp / 100, F = Fp / 100, esc = escP / 100;
  const mechKey = MECH[I.mech] ? I.mech : MECH_DEFAULT;
  const sf = MECH[mechKey].f;

  /* keep and ret are structurally in [0,1] because L and F are. That single fact is
     what makes a negative net deflection rate unreachable, and it is what the V2
     engine did not have, because NumField clamps on blur and on the steppers but
     never on a keystroke, and this tool publishes to the rail on every keystroke. */
  const keep = (1 - L) * (1 - F);
  const ret = 1 - keep;

  const grossDeflected = M * G;
  const netDeflected = M * G * keep;
  const returned = M * G * ret;
  const netDeflectionRate = M > 0 ? (netDeflected / M) * 100 : 0;   // share of TOTAL volume
  const botResolutionRate = keep * 100;                              // share of BOT-ROUTED volume

  const opexMonthly = gc(I.botPlatformCost, 0, 1e9, "Platform cost") + gc(I.qaCost, 0, 1e9, "QA cost")
    + gc(I.tuningHours, 0, 1e5, "Tuning hours") * gc(I.tuningRate, 0, 1e4, "Tuning rate")
    + gc(I.knowledgeMaintHours, 0, 1e5, "Knowledge hours") * gc(I.knowledgeRate, 0, 1e4, "Knowledge rate");
  const implOneTime = gc(I.implOneTime, 0, 1e9, "Implementation cost");

  const escalationPremium = returned * marg * esc;
  const vendorClaim = grossDeflected * cpc;

  const K = marg * M * (keep * sf - ret * esc);
  const netSavings = K * G - opexMonthly;
  const steadyAnnual = 12 * netSavings;

  const realizedDollarsPct = vendorClaim > 0 ? (netSavings / vendorClaim) * 100 : 0;
  const realizedDeflectionPct = Gp > 0 ? (netDeflectionRate / Gp) * 100 : 0;

  const beGrossPct = K > 0 ? (opexMonthly / K) * 100 : Infinity;
  const platformHeadroom = netSavings;

  let leakTolPct = null, leakTolNote = null;
  if (!(marg * M * G > 0)) leakTolNote = "No deflected volume, so there is no leakage tolerance to compute.";
  else if (sf + esc <= 0) leakTolNote = "With no capacity action and no escalation premium, leakage does not move net savings at all. The only cash moving is operating cost.";
  else if (F >= 1) leakTolNote = "Containment failure is 100%. Nothing survives the bot regardless of leakage.";
  else {
    const kStar = (esc + opexMonthly / (marg * M * G)) / (sf + esc);
    const Lstar = 1 - kStar / (1 - F);
    if (Lstar >= 1) { leakTolPct = 100; leakTolNote = "Any leakage rate still breaks even at this volume."; }
    else if (Lstar <= 0) { leakTolPct = 0; leakTolNote = "No leakage is tolerable. This program is already below break-even."; }
    else leakTolPct = Lstar * 100;
  }

  const monthly = [];
  let year1 = -implOneTime, cum = -implOneTime, payback = null;
  for (let m = 1; m <= 12; m++) {
    const gm = G * (I.rampOn ? Math.min(1, m / Math.max(1, I.rampMonths)) : 1);
    const nm = K * gm - opexMonthly;
    monthly.push(nm); year1 += nm; cum += nm;
    if (payback === null && cum >= 0) payback = m;
  }

  const waterfall = [
    { label: "Vendor claim (gross deflection at loaded cost)", value: vendorClaim },
    { label: "Loaded to marginal (fixed cost does not fall)", value: -grossDeflected * (cpc - marg) },
    { label: "Bot leakage (abandons bot, calls in)", value: -M * G * L * marg },
    { label: "Containment failure (bot says resolved, is not)", value: -M * G * (1 - L) * F * marg },
    { label: `Capacity not converted to cash (${MECH[mechKey].label})`, value: -netDeflected * marg * (1 - sf) },
    { label: "Escalation premium (post-bot contacts cost more)", value: -escalationPremium },
    { label: "Operating cost (platform, QA, tuning, knowledge)", value: -opexMonthly },
  ];
  const waterfallSum = waterfall.reduce((a, w) => a + w.value, 0);

  /* Rail handoff. The publish decision is made here, in the open, and rendered. */
  const railRate = netDeflectionRate / 100;
  const railBot = botResolutionRate / 100;
  let railPublished = true, railReason = null;
  if (M <= 0) { railPublished = false; railReason = "Monthly contacts is zero, so there is no volume to express a deflection rate against."; }
  else if (!(railRate >= 0 && railRate <= 1)) { railPublished = false; railReason = `Net deflection rate resolved to ${netDeflectionRate.toFixed(2)}%, which is outside 0 to 100%, and the rail refuses it.`; }

  const flags = [...guards];
  if (margWasDefaulted) flags.push(`Marginal cost was not supplied, so it was assumed at 60% of loaded cost, ${fmt2(cpc * 0.6)} per contact. That single assumption drives every savings figure on this page, and it is why confidence is held at Directional. Run Cost per Contact and return to replace it.`);
  if (margIn > 0 && cpc > 0 && margIn > cpc) flags.push("Marginal cost per contact exceeds loaded cost, which is impossible. It would mean fixed cost is negative. Correct the inputs.");
  else if (margIn > 0 && cpc > 0 && margIn >= 0.85 * cpc) flags.push("Marginal cost is within 15% of loaded cost. You may have entered loaded cost twice. Marginal cost is mostly wage and benefits and usually runs 50% to 75% of loaded.");
  if (Gp === 0) flags.push("Gross deflection is zero. This models a bot that attempts nothing, and every downstream tool will size the human pool at full volume.");
  if (Gp > 0 && Lp + Fp >= 100) flags.push(`Leakage and containment failure together consume ${((1 - keep) * 100).toFixed(0)}% of every contact the bot touches. Confirm these are measured figures and not guesses.`);
  if (implOneTime === 0) flags.push("Implementation cost is zero. If the vendor is charging a one-time build, integration, or professional services fee, the Year 1 figure is optimistic by exactly that amount, and payback is earlier than it will be.");
  if (mechKey === "none") flags.push("No capacity action is selected, so realized savings are $0. Operating cost and escalation premium are still cash out the door, which is why the result is a loss rather than a zero.");
  if (mechKey === "headcount") flags.push("Headcount reduction values freed capacity at 100%. This is the assumption almost every vendor ROI slide makes silently. It is defensible only if a named person has committed to removing the heads.");
  if (!isFinite(beGrossPct)) flags.push("This program never breaks even at any deflection rate. Operating cost and escalation premium exceed the realistic savings the bot can produce at this volume and marginal cost.");
  if (!railPublished) flags.push(`The realistic deflection rate was not published to the suite. ${railReason} Channel Shift Economics will fall back to its own default bot resolution rate of 65% instead of using yours.`);
  const hardFlag = flags.some((f) => /impossible|refuses it|was held at/.test(f));

  const ev = EVIDENCE[I.evidence] || EVIDENCE.estimate;
  let costConf = ORDER[Math.min(2, ev.rank)];
  if (margWasDefaulted) costConf = "Directional";
  else if (!I.costBasisOwned && ORDER.indexOf(costConf) > 1) costConf = "Planning-grade";

  const cr = CRED_RANK[MECH[mechKey].cred];
  let realConf = ORDER[cr === 3 ? 2 : cr === 2 ? 1 : 0];

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
    estimate: "the deflection rate is an internal estimate rather than an attested figure",
    marketing: "the deflection rate comes from vendor marketing, which is the least reliable source of a deflection number that exists",
    proposal: "the deflection rate is drawn from a vendor proposal, which is a document but not a commitment",
    sla: "the deflection rate is a contracted floor with a remedy attached",
    pilot: "the deflection rate was observed in your own environment",
  };
  const weakerIsReal = ORDER.indexOf(realConf) <= ORDER.indexOf(costConf);
  let confReason;
  if (hardFlag) confReason = "an input is physically impossible or had to be clamped, so the result is blocked at Directional.";
  else if (margWasDefaulted) confReason = "the marginal cost basis is an assumed 60% of loaded cost, not a figure you supplied.";
  else if (weakerIsReal) confReason = "realization is " + realConf + " because " + MECH_REASON[mechKey] + ".";
  else confReason = "evidence is " + costConf + " because " + EV_REASON[I.evidence || "estimate"] + ".";

  const band = { estimate: 0.25, marketing: 0.25, proposal: 0.15, sla: 0.10, pilot: 0.10 }[I.evidence || "estimate"];

  return {
    M, cpc, marg, margWasDefaulted, Gp, Lp, Fp, escP, G, L, F, esc, mechKey, sf, keep, ret,
    grossDeflected, netDeflected, returned, netDeflectionRate, botResolutionRate,
    realizedDeflectionPct, realizedDollarsPct, opexMonthly, implOneTime, escalationPremium,
    vendorClaim, K, netSavings, steadyAnnual, beGrossPct, platformHeadroom, leakTolPct, leakTolNote,
    monthly, year1, payback, waterfall, waterfallSum, railRate, railBot, railPublished, railReason,
    flags, hardFlag, costConf, realConf, headlineConf, confReason, band, evidenceLabel: ev.label,
  };
}

/* Hold environment, claimed deflection, and capacity action fixed. Vary only the two
   failure modes. This is the risk if the bot does not perform as promised. */
function buildSensitivity(I) {
  const bands = [
    { label: "Best case", mult: 0.5, note: "Bot performs above plan" },
    { label: "Likely (your inputs)", mult: 1.0, note: "As entered" },
    { label: "First 12 months", mult: 1.6, note: "Early-life reality" },
  ];
  return bands.map((b) => {
    const r = engine({ ...I, botLeakage: Math.min(100, n(I.botLeakage) * b.mult), containmentFailure: Math.min(100, n(I.containmentFailure) * b.mult) });
    return { ...b, netSavings: r.netSavings, netDeflectionRate: r.netDeflectionRate };
  });
}

/* @engine-end */

function buildAnalystRead(R) {
  const out = [];
  out.push(`Two lenses on the same pitch. Operationally the bot delivers ${R.realizedDeflectionPct.toFixed(0)}% of the deflection promised, ${R.netDeflectionRate.toFixed(1)}% true against ${R.Gp}% claimed. Financially you keep ${R.realizedDollarsPct.toFixed(0)}% of the dollar value. The gap between those two is not the vendor failing twice. It is your decision to value savings at marginal cost, which a CFO should expect you to defend rather than hide.`);

  if (R.margWasDefaulted)
    out.push(`You have not supplied a marginal cost per contact, so the tool assumed ${fmt2(R.marg)}, sixty percent of loaded. Every dollar figure on this page moves proportionally with that number. This is the one input worth thirty minutes with your finance partner before this analysis leaves the building.`);
  else if (R.cpc > 0 && R.marg / R.cpc < 0.85)
    out.push(`Savings are valued at marginal cost, ${fmt2(R.marg)} per contact, not loaded, ${fmt2(R.cpc)}. Deflecting a contact frees agent handle time. It does not refund the platform, the lease, or the supervisor. Note what follows: loaded cost moves the vendor's claim on this page by ${fmt(R.vendorClaim)} a month, and moves your net savings by exactly zero.`);

  if (isFinite(R.beGrossPct)) {
    const headroom = R.Gp - R.beGrossPct;
    out.push(headroom > 20
      ? `This program breaks even at ${R.beGrossPct.toFixed(0)}% gross deflection against a ${R.Gp}% claim, which is wide headroom. The risk is not whether it pays back. The risk is whether anyone captures the freed capacity as cash. Negotiate on price and tuning support, not on whether to proceed.`
      : `Break-even sits at ${R.beGrossPct.toFixed(0)}% gross deflection against your ${R.Gp}% claim. That is a thin margin. If real deflection lands below ${R.beGrossPct.toFixed(0)}% this is a net cost, not a saving. Get the vendor to commit to a deflection floor in the contract, with a remedy.`);
  } else {
    out.push(`At these assumptions the program never breaks even. Operating cost and escalation premium exceed the realistic savings at any deflection rate. Either the platform cost is too high for this volume, or leakage and containment failure are too severe to overcome.`);
  }

  out.push(`Your true deflection rate is ${R.netDeflectionRate.toFixed(1)}%, not the ${R.Gp}% claimed. ${Math.round(R.returned).toLocaleString()} contacts a month leak back or return falsely resolved, and the ones that return cost more than the ones that never left. That gap and the ${fmt2(R.marg)} marginal basis are the two numbers to carry into the negotiation.`);

  out.push(R.mechKey === "none"
    ? `You have selected no capacity action, so realized savings are $0 and the only cash moving is ${fmt(R.opexMonthly)} of operating cost and ${fmt(R.escalationPremium)} of escalation premium, a monthly loss of ${fmt(Math.abs(R.netSavings))}. That is the honest answer and it is the one most business cases quietly skip. Freed handle time becomes money when you reduce overtime, slow hiring, cut vendor volume, or reduce headcount. Pick one, or present this as a capacity story rather than a savings story.`
    : `Freed capacity is valued at ${Math.round(MECH[R.mechKey].f * 100)}% under ${MECH[R.mechKey].label}. Operating cost and escalation premium are cash out and are never scaled by that action, which is why "Not selected" shows a loss rather than a zero. The vendor's own slide implicitly assumes headcount reduction at 100%. If nobody is cutting heads, that slide is not your number.`);

  if (R.implOneTime === 0)
    out.push(`Year 1 net of ${fmt(R.year1)} carries no implementation cost, because you entered none. Bot programs are rarely free to stand up. Whatever the vendor is charging for integration, content build, and professional services comes straight off that figure and pushes payback later than ${R.payback ? "month " + R.payback : "shown"}.`);
  else
    out.push(`Year 1 net of ${fmt(R.year1)} absorbs ${fmt(R.implOneTime)} of one-time implementation cost, which never repeats. Steady state runs ${fmt(R.steadyAnnual)} a year. ${R.payback ? "Payback lands in month " + R.payback + "." : "The program does not pay back within twelve months."} Present both figures. A project can be strongly positive annualized and cash negative in its first year, and finance will find that out with or without you.`);

  return out;
}

/* Scenario contract. DEFAULTS are static on purpose: the state initializer seeds from
   cross-tool pulls, but the URL diff must be taken against a fixed baseline or the same
   link would decode differently in another session. Marginal cost defaults to 0, meaning
   "not supplied," which forces Directional. Never pre-load a savings basis. */
const V_A = { grossDeflection: 40, botLeakage: 15, containmentFailure: 12, escalationPenalty: 25, botPlatformCost: 8000, qaCost: 2000, tuningHours: 40, tuningRate: 65, knowledgeMaintHours: 20, knowledgeRate: 55 };
const V_B = { grossDeflection: 32, botLeakage: 9, containmentFailure: 9, escalationPenalty: 18, botPlatformCost: 5000, qaCost: 1200, tuningHours: 25, tuningRate: 65, knowledgeMaintHours: 12, knowledgeRate: 55 };

const DEFAULTS = {
  M: 80000, cpc: 7, marg: 0, implOneTime: 0,
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
    <div style={{ display: "grid", gridTemplateColumns: compact ? "1fr 1fr" : "1fr 1fr 1fr 1fr", gap: 10 }} className="cg">
      <NumField compact={compact} label="Gross deflection" value={v.grossDeflection} onChange={f("grossDeflection")} suffix="%" step={1} min={0} max={100} hint="Vendor promise" info={DEFS.grossDeflection.text} infoTitle={DEFS.grossDeflection.title} />
      <NumField compact={compact} label="Bot leakage" value={v.botLeakage} onChange={f("botLeakage")} suffix="%" step={1} min={0} max={100} hint="Abandons bot, calls in" info={DEFS.botLeakage.text} infoTitle={DEFS.botLeakage.title} />
      <NumField compact={compact} label="Containment failure" value={v.containmentFailure} onChange={f("containmentFailure")} suffix="%" step={1} min={0} max={100} hint="Bot says resolved, is not" info={DEFS.containmentFailure.text} infoTitle={DEFS.containmentFailure.title} />
      <NumField compact={compact} label="Escalation premium" value={v.escalationPenalty} onChange={f("escalationPenalty")} suffix="%" step={1} min={0} max={200} hint="Post-bot contacts cost more" info={DEFS.escalation.text} infoTitle={DEFS.escalation.title} infoAlign="right" />
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
     re-parses sessionStorage on every render would re-read a store it just wrote, on the
     way to writing it again. Consistency, never evidence: none of these three raise a
     grade here. They are reported, not credited. */
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

  const inputA = { M: s.M, cpc: s.cpc, marg: s.marg, implOneTime: s.implOneTime, mech: s.mech, rampOn: s.rampOn, rampMonths: s.rampMonths, evidence: s.evidence, costBasisOwned: s.costConfirmed, ...s.vA };
  const inputB = { ...inputA, ...s.vB };
  const R = engine(inputA);
  const RB = engine(inputB);
  const sens = buildSensitivity(inputA);
  const analyst = buildAnalystRead(R);
  const winner = R.netSavings >= RB.netSavings ? "A" : "B";

  useEffect(() => {
    /* This tool publishes what it OWNS and nothing else. It does not republish the volume
       or cost basis it pulled: laundering another tool's typed number through this one's
       provenance record is how a confidence gate gets credentialed by nobody. */
    publishToolResult(TOOL_ID, {
      realisticDeflectionRate: R.railPublished ? +R.railRate.toFixed(4) : undefined,
      botResolutionRate: R.railPublished ? +R.railBot.toFixed(4) : undefined,
      grossDeflectionClaimed: R.Gp,
      deflectionNetSavingsMonthly: Math.round(R.netSavings),
      deflectionNetSavingsAnnual: Math.round(R.steadyAnnual),
      deflectionYear1Net: Math.round(R.year1),
      deflectionImplementationOneTime: R.implOneTime,
      deflectionOpexMonthly: Math.round(R.opexMonthly),
      realizedDollarsPct: Math.round(R.realizedDollarsPct),
      realizedDeflectionPct: Math.round(R.realizedDeflectionPct),
      breakEvenDeflectionPct: isFinite(R.beGrossPct) ? +R.beGrossPct.toFixed(1) : undefined,
      capacityAction: R.mechKey,
      analystRead: analyst[0],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s]);

  const confColor = (c) => (c === "Finance-grade" ? GREEN : c === "Planning-grade" ? AMBER : MUTED);
  const realColor = (p) => (p >= 60 ? GREEN : p >= 35 ? AMBER : RED);
  const sensLow = R.netSavings * (1 - R.band), sensHigh = R.netSavings * (1 + R.band);

  const card = (label, value, sub, color, dark) => (
    <div style={{ background: dark ? `linear-gradient(135deg, ${NAVY}, ${DEEP})` : WARM, border: dark ? "none" : `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, color: dark ? color : MUTED, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: dark ? "#fff" : color }}>{value}</div>
      <div style={{ fontSize: 10.5, color: dark ? "rgba(255,255,255,0.4)" : MUTED }}>{sub}</div>
    </div>
  );

  const reportSections = [
    { title: "Confidence and Evidence", type: "table", rows: [
      ["Headline confidence", R.headlineConf],
      ["Evidence axis", R.costConf + " (" + R.evidenceLabel + ")"],
      ["Realization axis", R.realConf + " (" + MECH[R.mechKey].label + ")"],
      ["Why", "The headline reports the weaker axis. " + R.confReason],
      ["Sensitivity band", "+/- " + Math.round(R.band * 100) + "% on net savings, " + fmtK(sensLow) + " to " + fmtK(sensHigh) + " per month"],
      ["Open issues", R.flags.length === 0 ? "none" : R.flags.length + (R.flags.length === 1 ? " issue, listed below" : " issues, listed below")],
      ["Cross-tool consistency", consistent ? "Volume and both cost figures arrived from other tools this session. Consistency, not evidence." : "Inputs were entered here or defaulted."],
    ]},
    { title: "Deflection Reality", type: "metrics", items: [
      { label: "Vendor Claim", value: fmtK(R.vendorClaim) + "/mo", color: ELECTRIC, sub: R.Gp + "% at " + fmt2(R.cpc) + " loaded" },
      { label: "Net Savings", value: fmtK(R.netSavings) + "/mo", color: R.netSavings > 0 ? GREEN : RED, sub: R.netSavings > 0 ? fmtK(R.steadyAnnual) + "/yr steady" : "net cost" },
      { label: "Deflection Realized", value: R.realizedDeflectionPct.toFixed(0) + "%", color: realColor(R.realizedDeflectionPct), sub: "operational lens" },
      { label: "Dollars Realized", value: R.realizedDollarsPct.toFixed(0) + "%", color: realColor(R.realizedDollarsPct), sub: "financial lens" },
    ]},
    { title: "Vendor Claim to Reality Bridge", type: "table", rows: R.waterfall.map((w) => [w.label, (w.value >= 0 ? "+" : "") + fmt(w.value)]).concat([["Net monthly savings", fmt(R.netSavings)]]) },
    { title: "Rail Handoff to Downstream Tools", type: "table", rows: R.railPublished ? [
      ["realisticDeflectionRate", (R.railRate * 100).toFixed(1) + "% of total contact volume, published"],
      ["botResolutionRate", (R.railBot * 100).toFixed(1) + "% of bot-routed contacts, published"],
      ["Consumed by", "Channel Shift Economics, to size the human pool"],
      ["Status", "Published. Downstream tools will use your figures, not their defaults."],
    ] : [
      ["realisticDeflectionRate", "NOT PUBLISHED"],
      ["botResolutionRate", "NOT PUBLISHED"],
      ["Reason", R.railReason || "The value did not satisfy the rail's unit contract."],
      ["Consequence", "Channel Shift Economics will fall back to its own default bot resolution rate of 65%. Nothing downstream will warn you. This report is the warning."],
    ]},
    { title: "Break-Even Thresholds", type: "table", rows: [
      ["Break-even gross deflection", isFinite(R.beGrossPct) ? R.beGrossPct.toFixed(1) + "% against a " + R.Gp + "% claim" : "never breaks even at any deflection rate"],
      ["Maximum tolerable leakage", R.leakTolPct != null ? R.leakTolPct.toFixed(0) + "% against " + R.Lp + "% entered" : (R.leakTolNote || "not computable")],
      ["Operating-cost headroom", fmtK(R.platformHeadroom) + "/mo before net reaches $0"],
      ["Year 1 net", fmt(R.year1) + (s.rampOn ? " (ramped over " + s.rampMonths + " months)" : " (no ramp)") + (R.implOneTime > 0 ? ", after " + fmt(R.implOneTime) + " one-time implementation" : ", no implementation cost entered")],
      ["Steady-state annual", fmt(R.steadyAnnual)],
      ["Payback", R.payback ? "month " + R.payback : "not within 12 months"],
    ]},
    { title: "Bot-Performance Sensitivity", type: "table", rows: sens.map((x) => [x.label + " (" + x.note + ")", fmtK(x.netSavings) + "/mo at " + x.netDeflectionRate.toFixed(1) + "% true deflection"]) },
    ...(s.compareMode ? [{ title: "Vendor A vs Vendor B", type: "table", rows: [
      ["Vendor A, claims " + R.Gp + "%", fmtK(R.netSavings) + "/mo, " + R.realizedDollarsPct.toFixed(0) + "% of claim realized"],
      ["Vendor B, claims " + RB.Gp + "%", fmtK(RB.netSavings) + "/mo, " + RB.realizedDollarsPct.toFixed(0) + "% of claim realized"],
      ["Higher net", "Vendor " + winner + ", by " + fmtK(Math.abs(R.netSavings - RB.netSavings)) + "/mo"],
    ]}] : []),
    ...(R.flags.length ? [{ title: "Integrity Flags (" + R.flags.length + ")", type: "findings", items: R.flags }] : []),
    { title: "Analyst Read", type: "findings", items: analyst },
    { title: "Methodology", type: "text", content: `Truly deflected contacts, meaning gross deflection less bot leakage less containment failure, are valued at marginal cost, the variable handle-time labor that deflection actually frees. They are not valued at the fully loaded cost per contact the vendor uses, because fixed platform, facilities, and supervision cost do not fall with volume. Loaded cost therefore moves the vendor's claim on this page and moves net savings by exactly zero. Freed handle time is capacity, not cash, until an action converts it. Realized capacity is scaled by the selected capacity action, ${MECH[R.mechKey].label} at ${Math.round(MECH[R.mechKey].f * 100)}%, and "Not selected" realizes $0. Operating cost and escalation premium are cash out the door and are never scaled by that action, which is why no action still shows a loss rather than a zero. Valuing deflection at 100% is headcount reduction, the assumption most vendor ROI slides make silently. Deflection Realized is the operational lens, true rate divided by claimed rate. Dollars Realized is the financial lens, net cash divided by the vendor's loaded-cost claim. Break-even thresholds are solved in closed form and verified against the engine's own zero crossings. The bridge reconciles exactly to net monthly savings. Every rate input is clamped to its physical domain before any arithmetic runs, so this engine cannot produce a net deflection rate outside 0 to 100%, and cannot hand the rest of the suite a value that would be silently dropped or silently rescaled. Confidence is two-axis: evidence for what attests to the deflection rate and the cost basis, realization for whether finance can book the result. The headline is the weaker of the two.` },
    { title: "Next Steps", type: "next", items: [
      ...(R.margWasDefaulted ? [{ tool: "Cost per Contact", reason: "Replace the assumed marginal cost basis. It drives every dollar on this page", href: "/tools/cost-per-contact" }] : []),
      { tool: "Channel Shift Economics", reason: "Size the human pool using the bot resolution rate published above", href: "/tools/channel-shift" },
      { tool: "TCO Calculator", reason: "Fold the platform and operating cost into your total stack cost", href: "/tools/tco-calculator" },
      { tool: "Business Case Builder", reason: "Turn a realistic net into a board-ready case", href: "/tools/business-case" },
      { tool: "Contract Risk Scanner", reason: "Test whether the deflection floor is contractually enforceable", href: "/tools/contract-risk" },
    ]},
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: WARM, minHeight: "100vh" }}>
      <style>{`@media(max-width:720px){.cg{grid-template-columns:1fr 1fr !important}.s4{grid-template-columns:1fr 1fr !important}.s3{grid-template-columns:1fr !important}.env{grid-template-columns:1fr !important}}`}</style>
      <Nav />

      <section style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, padding: "48px 0 40px" }}>
        <div style={WRAP}>
          <div style={{ fontSize: 11, fontWeight: 700, color: LIGHT, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 10 }}>Cost and Economics</div>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 42, fontWeight: 400, color: "#fff", margin: "0 0 12px", lineHeight: 1.1 }}>AI Deflection Reality Check</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", maxWidth: 660, lineHeight: 1.65, margin: 0 }}>
            The vendor multiplies claimed deflection by your loaded cost per contact. This tool subtracts leakage, containment failure, the escalation premium, the operating cost of running a bot, and the capacity you never convert to cash. What is left is the number a CFO will accept.
          </p>
          {fromLink && <div style={{ marginTop: 18, display: "inline-block", background: "rgba(0,170,255,0.12)", border: "1px solid rgba(0,170,255,0.3)", borderRadius: 6, padding: "8px 14px", fontSize: 12.5, color: LIGHT }}>Loaded from a scenario link. These are the sender's inputs, not this session's.</div>}
        </div>
      </section>

      <section style={{ padding: "36px 0 72px" }}>
        <div style={WRAP}>

          {/* environment */}
          <div style={cardStyle}>
            <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: NAVY, margin: "0 0 4px" }}>Your environment</h3>
            <p style={{ fontSize: 12.5, color: MUTED, margin: "0 0 16px", lineHeight: 1.6 }}>Volume and cost are shared across both vendors below. Marginal cost is the savings basis for everything on this page.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }} className="env">
              <NumField label="Monthly contacts" value={s.M} onChange={(v) => set("M", v)} step={1000} min={0} pulled={pulled.M} />
              <NumField label="Loaded cost per contact" value={s.cpc} onChange={(v) => set("cpc", v)} prefix="$" step={0.25} min={0} pulled={pulled.cpc} info={DEFS.loadedCPC.text} infoTitle={DEFS.loadedCPC.title} />
              <NumField label="Marginal cost per contact" value={s.marg} onChange={(v) => set("marg", v)} prefix="$" step={0.25} min={0} pulled={pulled.marg} hint={R.margWasDefaulted ? "0 assumes 60% of loaded, " + fmt2(R.marg) : "the savings basis"} info={DEFS.marginalCPC.text} infoTitle={DEFS.marginalCPC.title} />
              <NumField label="One-time implementation" value={s.implOneTime} onChange={(v) => set("implOneTime", v)} prefix="$" step={5000} min={0} hint="hits Year 1 only" info={DEFS.implOneTime.text} infoTitle={DEFS.implOneTime.title} infoAlign="right" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }} className="env">
              <div>
                <label style={lbl}>Where does the deflection rate come from<InfoDot text={DEFS.evidence.text} title={DEFS.evidence.title} /></label>
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
              <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: NAVY, margin: 0 }}>{s.compareMode ? "Vendor A" : "The vendor's claim"}</h3>
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, color: SLATE, cursor: "pointer" }}>
                <input type="checkbox" checked={s.compareMode} onChange={(e) => set("compareMode", e.target.checked)} />
                Compare two vendors
              </label>
            </div>
            <VendorInputs v={s.vA} onChange={setVA} compact={s.compareMode} />
            {s.compareMode && (
              <div style={{ marginTop: 22, paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
                <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: NAVY, margin: "0 0 14px" }}>Vendor B</h3>
                <VendorInputs v={s.vB} onChange={setVB} compact />
              </div>
            )}
            <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", marginTop: 16, paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
              <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, color: SLATE, cursor: "pointer" }}>
                <input type="checkbox" checked={s.rampOn} onChange={(e) => set("rampOn", e.target.checked)} />
                Deflection ramps over time
              </label>
              {s.rampOn && <div style={{ width: 150 }}><NumField compact label="Ramp to full (months)" value={s.rampMonths} onChange={(v) => set("rampMonths", v)} min={1} max={12} step={1} /></div>}
            </div>
          </div>

          {/* headline */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 20 }} className="s4">
            {card("Vendor Claim", fmtK(R.vendorClaim), R.Gp + "% at " + fmt2(R.cpc), LIGHT, true)}
            {card("Net Savings / mo", fmtK(R.netSavings), R.netSavings > 0 ? fmtK(R.steadyAnnual) + "/yr steady" : "net cost", R.netSavings > 0 ? GREEN : RED)}
            {card("Deflection Realized", R.realizedDeflectionPct.toFixed(0) + "%", R.netDeflectionRate.toFixed(1) + "% true vs " + R.Gp + "% claimed", realColor(R.realizedDeflectionPct))}
            {card("Dollars Realized", R.realizedDollarsPct.toFixed(0) + "%", "of the vendor's claim", realColor(R.realizedDollarsPct))}
          </div>

          {/* confidence */}
          <div style={{ ...cardStyle, borderLeft: `3px solid ${confColor(R.headlineConf)}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 1, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>Confidence<InfoDot text={DEFS.confidence.text} title={DEFS.confidence.title} /></div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: confColor(R.headlineConf) }}>{R.headlineConf}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "14px 0" }} className="env">
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
            <p style={{ fontSize: 12.5, color: SLATE, lineHeight: 1.6, margin: 0 }}>The headline reports the weaker axis. It is {R.headlineConf} because {R.confReason} Net savings carry a plus or minus {Math.round(R.band * 100)}% band at this evidence level, {fmtK(sensLow)} to {fmtK(sensHigh)} per month.</p>
          </div>

          {/* rail handoff. Visible, never silent. */}
          <div style={{ ...cardStyle, borderLeft: `3px solid ${R.railPublished ? ELECTRIC : RED}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: R.railPublished ? ELECTRIC : RED, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              Rail handoff<InfoDot text={DEFS.rail.text} title={DEFS.rail.title} />
            </div>
            {R.railPublished ? (
              <>
                <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.65, margin: "0 0 12px" }}>
                  This is the only tool on the site that produces a realistic deflection rate. Two figures are now available to the rest of the suite, and they are not the same number.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="env">
                  <div style={{ background: ICE, borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: NAVY }}>{(R.railRate * 100).toFixed(1)}% net deflection</div>
                    <div style={{ fontSize: 11.5, color: SLATE, marginTop: 3, lineHeight: 1.5 }}>Share of your <strong>total</strong> contact volume the bot removes. This is the honest headline deflection number.</div>
                  </div>
                  <div style={{ background: ICE, borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: NAVY }}>{(R.railBot * 100).toFixed(1)}% bot resolution</div>
                    <div style={{ fontSize: 11.5, color: SLATE, marginTop: 3, lineHeight: 1.5 }}>Share of the volume you <strong>route to the bot</strong> that resolves there. This is what Channel Shift needs to size the human pool.</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.65, margin: "0 0 8px" }}><strong style={{ color: RED }}>Nothing was published to the rest of the suite.</strong> {R.railReason}</p>
                <p style={{ fontSize: 12.5, color: SLATE, lineHeight: 1.6, margin: 0 }}>Channel Shift Economics will fall back to its own default bot resolution rate of 65%. That fallback is correct behavior, because a rate the rail cannot trust should never travel. It is also completely silent downstream. This panel is the only place it is visible.</p>
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
            <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: NAVY, margin: "0 0 4px", display: "flex", alignItems: "center", gap: 6 }}>Vendor claim to reality<InfoDot text={DEFS.claim.text} title={DEFS.claim.title} /></h3>
            <p style={{ fontSize: 12.5, color: MUTED, margin: "0 0 16px" }}>Every subtraction, in order. This reconciles exactly to net monthly savings.</p>
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 18 }} className="s3">
              <div style={{ background: WARM, borderRadius: 8, padding: "12px 14px" }}><div style={{ fontSize: 10.5, color: MUTED }}>Break-even deflection</div><div style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{isFinite(R.beGrossPct) ? R.beGrossPct.toFixed(1) + "%" : "never"}</div><div style={{ fontSize: 10.5, color: MUTED }}>claim is {R.Gp}%</div></div>
              <div style={{ background: WARM, borderRadius: 8, padding: "12px 14px" }}><div style={{ fontSize: 10.5, color: MUTED }}>Max tolerable leakage</div><div style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{R.leakTolPct != null ? R.leakTolPct.toFixed(0) + "%" : "n/a"}</div><div style={{ fontSize: 10.5, color: MUTED }}>{R.leakTolPct != null ? "you entered " + R.Lp + "%" : R.leakTolNote}</div></div>
              <div style={{ background: WARM, borderRadius: 8, padding: "12px 14px" }}><div style={{ fontSize: 10.5, color: MUTED }}>Operating-cost headroom</div><div style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{fmtK(R.platformHeadroom)}/mo</div><div style={{ fontSize: 10.5, color: MUTED }}>before net $0</div></div>
            </div>
          </div>

          {/* compare */}
          {s.compareMode && (
            <div style={cardStyle}>
              <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: NAVY, margin: "0 0 4px" }}>Vendor A vs Vendor B</h3>
              <p style={{ fontSize: 12.5, color: MUTED, margin: "0 0 14px" }}>Same volume, same cost basis, same capacity action. Only the bot differs.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="env">
                {[["A", R], ["B", RB]].map(([k, r]) => (
                  <div key={k} style={{ background: winner === k ? ICE : WARM, border: `1px solid ${winner === k ? ELECTRIC : BORDER}`, borderRadius: 8, padding: "14px 16px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1, textTransform: "uppercase" }}>Vendor {k} {winner === k && <span style={{ color: ELECTRIC }}>· higher net</span>}</div>
                    <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, color: r.netSavings >= 0 ? GREEN : RED, margin: "4px 0" }}>{fmtK(r.netSavings)}<span style={{ fontSize: 12, color: MUTED }}>/mo</span></div>
                    <div style={{ fontSize: 11.5, color: SLATE }}>Claims {r.Gp}%, delivers {r.netDeflectionRate.toFixed(1)}% true. Keeps {r.realizedDollarsPct.toFixed(0)}% of the claimed dollars. Operating cost {fmtK(r.opexMonthly)}/mo.</div>
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

          {/* sensitivity */}
          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 4 }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: LIGHT, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Bot-performance sensitivity</h3>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>Your volume, cost, claimed deflection, and capacity action held fixed. Only leakage and containment failure vary. This is the risk if the bot does not perform as promised.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }} className="s3">
              {sens.map((x, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "12px 14px", border: `1px solid ${i === 1 ? "rgba(0,170,255,0.4)" : "rgba(255,255,255,0.06)"}` }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>{x.label}</div>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: x.netSavings >= 0 ? "#fff" : RED }}>{fmtK(x.netSavings)}<span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>/mo</span></div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{x.netDeflectionRate.toFixed(1)}% true deflection · {x.note}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <a href="/vendors/iva" style={{ fontSize: 12, fontWeight: 600, color: LIGHT, padding: "5px 14px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.15)", textDecoration: "none" }}>50 scored IVA vendors</a>
              <a href="/tools/channel-shift" style={{ fontSize: 12, fontWeight: 600, color: LIGHT, padding: "5px 14px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.15)", textDecoration: "none" }}>Channel Shift Economics</a>
              <a href="/tools/cost-per-contact" style={{ fontSize: 12, fontWeight: 600, color: LIGHT, padding: "5px 14px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.15)", textDecoration: "none" }}>Cost per Contact</a>
            </div>
          </div>

          <ReportActions
            toolId={TOOL_ID}
            toolName="AI Deflection Reality Check"
            subtitle={`${R.headlineConf} · ${R.netDeflectionRate.toFixed(1)}% true deflection vs ${R.Gp}% claimed · net ${fmtK(R.netSavings)}/mo`}
            routePath={ROUTE}
            state={s}
            defaults={DEFAULTS}
            confidence={R.headlineConf}
            summary={[
              { label: "Vendor claim monthly", value: fmt(R.vendorClaim) },
              { label: "Net savings monthly", value: fmt(R.netSavings) },
              { label: "Steady-state annual", value: fmt(R.steadyAnnual) },
              { label: "Year 1 net", value: fmt(R.year1) },
              { label: "True deflection rate", value: R.netDeflectionRate.toFixed(1) + "%" },
              { label: "Bot resolution rate", value: R.botResolutionRate.toFixed(1) + "%" },
              { label: "Dollars realized", value: Math.round(R.realizedDollarsPct) + "%" },
              { label: "Break-even deflection", value: isFinite(R.beGrossPct) ? R.beGrossPct.toFixed(1) + "%" : "never" },
              { label: "Payback", value: R.payback ? "month " + R.payback : "not within 12 months" },
            ]}
            signals={{
              severity: R.netSavings <= 0 ? "high" : R.realizedDollarsPct < 35 ? "elevated" : "normal",
              mechanism: MECH[R.mechKey].label,
              evidence: s.evidence,
              railPublished: R.railPublished,
              openIssues: R.flags.length,
            }}
            sections={reportSections}
          />

        </div>
      </section>
    </div>
  );
}
