import { useState, useEffect } from "react";
import { HowOthersReport } from "./src/lib/HowOthersReport.jsx";
import ReportActions from "./ReportActions";
import { COLORS, benchmark } from "./src/lib/benchmarks";
import { emitGrades, voidResult, isVoid, railEvidence, weakerStream, realizationFromCred, originsFor } from "./src/lib/confidence";
import { publishToolResult, getExternalWithSource } from "./src/lib/toolData";
/* An empty rail read, in the shape the old self-capable getter returned, so a missing or self-published value reads as
   nothing (P6 item 15: every pull is external). */
const NO_RAIL = Object.freeze({ value: null, sourceTool: null, railOrigin: null, derived: false, flag: null, confidenceImpact: null });
import { normalizeForPublish } from "./src/lib/metrics";
import InfoDot from "./src/lib/InfoDot";
import NumField from "./src/lib/NumField";
import { MECH, MECH_ORDER, MECH_INITIAL, isNoActionFlag } from "./src/lib/mech";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { severityBucket } from "./src/lib/track";
import { createGuards, guardVal, guardLine } from "./src/lib/guards";
import { FONT, FONT_IMPORT_CSS, TYPE, W, NUM } from "./src/lib/type";
import { ToolFrame } from "./src/lib/ToolFrame.jsx";
import { Result, Finding, Button, resultHow } from "./src/lib/ui.jsx";
import { HOUSE, PILLARS, ARCS, RADIUS, TOUCH, alpha, LINE } from "./src/lib/tokens.js";
import { methodStamp } from "./src/lib/methodVersions.js";

/* UI-only palette. The engine's colours live inside the engine region below,
   because buildVerdict and TARGETS carry them into the report payload. */
const NAVY = COLORS.navy, DEEP = "#061325", ELECTRIC = COLORS.electric, LIGHT = "#00AAFF";
const ICE = "#E8F4FD", WARM = "#F8FAFB", SLATE = "#3A4F6A", BORDER = "#D8E3ED";
const WRAP = { maxWidth: 960, margin: "0 auto", padding: "0 28px" };

function LogoMark({ size = 30, light = true }) {
  const a = light ? "#fff" : NAVY, x = light ? LIGHT : ELECTRIC;
  return <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light ? .6 : .3} /><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light ? .8 : .5} /><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round" /><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /></g></svg>;
}

/* @engine-start
   Everything between these markers is the Channel Shift engine and the only
   things it closes over. channel.test.mjs and channel.report.mjs slice this
   exact region out of this exact file at runtime and evaluate it, so the tested
   engine and the shipped engine cannot drift apart.

   n, money and fmtK were relocated here from the top of the file, along with the
   five colours the engine itself writes into output (TARGETS carries them, and
   buildVerdict returns one). They are engine dependencies, so they belong inside
   the tested region rather than being rebuilt inside a harness where they could
   drift. Nothing between their old and new positions evaluated them at module
   load, so the move is behaviour-neutral.

   MECH and MECH_INITIAL are injected from the real src/lib/mech.js, COLORS and
   benchmark from the real src/lib/benchmarks.js, and the confidence layer from the
   real src/lib/confidence.js. None is reconstructed. */
const MUTED = COLORS.muted, GREEN = COLORS.green, AMBER = COLORS.amber, RED = COLORS.red, TEAL = "#0E9AA4";

const n = (v) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };
const money = (v) => { const x = n(v); return (x < 0 ? "-$" : "$") + Math.abs(x).toFixed(2); };
const fmtK = (v) => { const x = n(v), s = x < 0 ? "-" : ""; const a = Math.abs(x); return s + (a >= 1000000 ? "$" + (a / 1000000).toFixed(2) + "M" : a >= 1000 ? "$" + (a / 1000).toFixed(0) + "K" : "$" + Math.round(a)); };

/* One renderer for a corrected value. The corrections section, the integrity
   checks and the methodology all print the same fact, and they had already
   drifted: the flag printed $-2 while the corrections section printed -2$.
   The local fix unified the three paths on "$" + value, which made all three
   print $-2, a broken magnitude. Cost per Contact had already fixed that form.
   The renderer and the clamp now come from src/lib/guards.js, shared by every
   guarded tool, so the sign leads the symbol here as it does in money and fmtK
   and the rule cannot drift per tool again. */

const CURVE = { mild: { label: "Mild", c: benchmark("channel.curve.mild"), note: "The easy calls leave, and the average handle time of the voice calls left behind rises slightly." }, moderate: { label: "Moderate", c: benchmark("channel.curve.moderate"), note: "Typical support environment." }, severe: { label: "Severe", c: benchmark("channel.curve.severe"), note: "The voice work left behind gets much harder." } };
const RISKS = [
  { k: "riskComplaint", label: "High complaint sensitivity" },
  { k: "riskRegulated", label: "Regulated or compliance-bound" },
  { k: "riskSave", label: "Cancellation and save attempts" },
  { k: "riskVulnerable", label: "Vulnerable customers" },
  { k: "riskAuth", label: "Complex identity checks" },
  { k: "riskEmotion", label: "High emotion or high stakes" },
];

const DEFS = {
  loadedOH: "The multiplier that turns base wage into a loaded hourly rate by adding benefits and employer payroll taxes. A $20 an hour agent at 1.30x costs about $26 an hour loaded. It is used for the cost view. Savings use the lower marginal multiplier, and pricing a whole seat uses the higher fully loaded multiple.",
  marginalOH: "The multiplier for the cost that goes away when a contact goes away: wage and benefits. Facilities and equipment stay. Savings are valued on this, because one fewer contact does not shrink your building.",
  eligibility: "The share of voice calls that can safely move to another channel: simple, transactional, low-risk contacts. Leave out complex, regulated, emotional or revenue-sensitive contacts. This caps the shift, so the model only moves volume that can realistically go.",
  erf: "When a contact fails in the new channel and comes back to voice, how much longer that recovery call runs than a normal one (1.0 the same, 1.2 a frustrated customer, 1.5 a complex recovery). The customer would have called anyway, so only the extra time counts as new cost.",
  curve: "As the easy calls leave voice, the calls that remain are harder, so average voice handle time rises. Mild, Moderate and Severe set how much. Total voice minutes stay the same, so choosing a curve also fixes how short the departing calls must have been. The tool shows you that figure below.",
  shiftPts: "Percentage points of your total monthly contact volume that you plan to move out of voice into this channel. Shifting 10 points takes voice from 70% to 60% of the mix and this channel up by 10, so the mix still adds to 100.",
  resolution: "The share of shifted contacts that are resolved in the new channel without coming back to voice. Simple transactions resolve at high rates, complex issues at low ones. This is the input that most decides whether a shift pays.",
  displacement: "Of the contacts resolved in the new channel, the share that replace a voice call. The rest is new demand from people who would never have called. It is real work, and it saves no voice time. It is rarely 100%.",
  capacity: "How freed agent time becomes money. Absorbing growth banks little cash. Reducing overtime or avoiding hires is something finance will credit. Reducing headcount turns fully into cash and carries the most risk. Freed time stays capacity until you commit to one of these.",
  botCost: "The per-contact fee your bot or self-service platform charges. It is cash, paid on every attempt, including the ones that fail. A $0 bot is almost never real, and it makes any shift look free.",
};

const TARGETS = [
  { key: "Chat", color: GREEN, shift: "shiftToChat", res: "resChat", disp: "dispChat", eff: (d) => n(d.chatAHT) / Math.max(0.1, n(d.chatConc)), bot: false },
  { key: "Bot", color: TEAL, shift: "shiftToBot", res: "resBot", disp: "dispBot", eff: () => 0, bot: true },
  { key: "Email", color: AMBER, shift: "shiftToEmail", res: "resEmail", disp: "dispEmail", eff: (d) => n(d.emailAHT) / Math.max(0.1, n(d.emailConc)), bot: false },
];

/* Every default is a registry entry under a template id. The operating profile is
   labelled heuristic there, and the wage is the BLS market median. Decision H,
   session 15. */
const dflt = (f) => benchmark(`channel.default.${f}`);
const BASE = {
  monthlyContacts: dflt("monthlyContacts"), hourlyRate: benchmark("market.wage.agent"), loadedOH: benchmark("load.benefits"), marginalOH: benchmark("load.marginal"),
  voicePct: dflt("voicePct"), voiceAHT: dflt("voiceAHT"), voiceConc: dflt("voiceConc"),
  chatPct: dflt("chatPct"), chatAHT: dflt("chatAHT"), chatConc: dflt("chatConc"),
  emailPct: dflt("emailPct"), emailAHT: dflt("emailAHT"), emailConc: dflt("emailConc"),
  botPct: dflt("botPct"), botCost: dflt("botCost"),
  eligibility: dflt("eligibility"),
  shiftToChat: dflt("shiftToChat"), shiftToBot: dflt("shiftToBot"), shiftToEmail: dflt("shiftToEmail"),
  resChat: dflt("resChat"), resBot: dflt("resBot"), resEmail: dflt("resEmail"),
  dispChat: dflt("dispChat"), dispBot: dflt("dispBot"), dispEmail: dflt("dispEmail"),
  escReturnFactor: dflt("escReturnFactor"), adverseCurve: "moderate",
  trainingPerAgent: dflt("trainingPerAgent"), rampWeeks: dflt("rampWeeks"), validated: false,
  riskComplaint: false, riskRegulated: false, riskSave: false, riskVulnerable: false, riskAuth: false, riskEmotion: false,
};
const WORKDAYS = benchmark("channel.plan.workdays"), HOURS_DAY = benchmark("channel.plan.hoursPerDay");
const PROD_SHARE = benchmark("channel.plan.productiveShare"), DAYS_WEEK = benchmark("channel.plan.daysPerWeek");
const RAMP_LOSS = benchmark("channel.plan.rampLoss");
const IMPLAUSIBLE_DEPT = benchmark("channel.read.implausibleDeptAht");
const BOT_NEAR_FREE = benchmark("channel.guard.botNearFree");
const BE_FLOOR = benchmark("channel.read.breakEvenFloor");

/* Scenario contract. Module scope for stable identity across renders. */
const TOOL_ID = "channel-shift";
const ROUTE = "/tools/channel-shift";
const clone = (o) => JSON.parse(JSON.stringify(o));
/* The initial capacity action comes from mech.js, never a literal here. Tracker 1-08b
   decides its value for every tool at once, and mech.js records why the flip waits
   for the unselected-state rendering. */
const DEFAULTS = { d: BASE, mech: MECH_INITIAL };

/* No grade ladder lives in this file. The local credit ladder that stood here
   indexed grades 1 to 3 against confidence.js's 0 to 2. Realization now reads mech.js
   credit class through realizationFromCred in gradeChannel, and nothing else. */

function compute(d, mechIn) {
  /* Input integrity. Every one of the values below was silently accepted before,
     and a scenario link decodes straight into this function with no field
     validation in between, so an edited URL could print a clean, flag-free
     report off a negative contact volume, a 150% resolution rate, or a 300%
     displacement rate. Clamping alone is not a fix. A value the engine had to
     change is a value the report must disclose, or the document shows a number
     the engine never ran. `used` carries what was computed, `entered` carries
     what was asked for, and they are printed side by side. */
  /* scaled is not taken from createGuards: this engine already names its own
     shift-scaling flag scaled, and the two must not collide. */
  const { guards, guard, pick } = createGuards();
  /* Concurrency divides, so it is the highest-leverage input in the file. A zero
     or negative value used to be swallowed by a bare Math.max(0.1, x), which turned
     a 7 minute voice AHT into 70 effective minutes and inflated net realizable from
     $2K to $137K/mo with no flag anywhere. The old floor was also wrong on the
     physics: an agent cannot handle less than one interaction at a time, so the
     floor is 1, not 0.1. Chat sits above it legitimately; nothing sits below it. */
  const conc = (label, raw) => guard(label, raw, 1, null, "x");

  const monthly = guard("Monthly contacts", d.monthlyContacts, 0, null, "");
  const hourly = guard("Agent hourly rate", d.hourlyRate, 0, null, "$");
  const marginalOH = guard("Marginal overhead", d.marginalOH, 1, null, "x");
  const loadedOH = guard("Loaded overhead", d.loadedOH, 1, null, "x");
  const marginalPerMin = hourly * marginalOH / 60;
  const loadedPerMin = hourly * loadedOH / 60;
  /* Own-key lookup through pick, same as the complexity curve. The raw key used to
     index MECH directly: an unknown value threw on .f and crashed the page, and a
     prototype name (MECH["toString"] is a function) computed NaN with zero
     corrections and still printed an Approve verdict. The fallback is none, which
     realizes $0. A broken link must never credit a realization the user did not
     choose, so it does not fall back to the hiring default. */
  const mechKey = pick("Capacity action", mechIn, MECH, "none");
  const mf = MECH[mechKey].f;

  const voicePct = guard("Voice mix", d.voicePct, 0, 100, "%");
  const voiceVol = monthly * voicePct / 100;
  const eligPct = guard("Eligible voice for shift", d.eligibility, 0, 100, "%");
  const eligible = voiceVol * eligPct / 100;

  const shiftPts = TARGETS.map(t => guard(t.key + " shift", d[t.shift], 0, 100, "pts"));
  const reqShift = monthly * shiftPts.reduce((a, b) => a + b, 0) / 100;
  const scaled = reqShift > eligible && reqShift > 0;
  const scale = scaled ? eligible / reqShift : 1;

  /* Own-key lookup through pick. The old truthy check passed prototype keys:
     CURVE["toString"] is truthy, so a scenario link printed a NaN document with
     zero corrections disclosed. */
  const curveKey = pick("Residual complexity curve", d.adverseCurve, CURVE, "moderate");
  const adverseCoef = CURVE[curveKey].c;
  // A failed deflection re-contact is never cheaper than the original call.
  const erf = guard("Escalation return factor", d.escReturnFactor, 1, null, "x");

  let shifted = 0, Dtot = 0, Etot = 0, targetMin = 0, botFee = 0, chatHandled = 0;
  const botCost = guard("Bot cost per contact", d.botCost, 0, null, "$");
  const chatConc = conc("Chat concurrency", d.chatConc), emailConc = conc("Email concurrency", d.emailConc);
  const chatAHT = guard("Chat AHT", d.chatAHT, 0, null, "m"), emailAHT = guard("Email AHT", d.emailAHT, 0, null, "m");
  const EFF = { Chat: chatAHT / chatConc, Email: emailAHT / emailConc, Bot: 0 };
  const perTarget = TARGETS.map((t, i) => {
    const S = monthly * shiftPts[i] / 100 * scale;
    /* Resolution and displacement are shares. Unclamped, a 150% resolution rate
       produced more displaced voice than volume shifted and a NEGATIVE escalation
       count, and the tool called it "Approve". Third recurrence of this defect
       class after FCR Leakage and Cost per Contact. */
    const resPct = guard(t.key + " resolution", d[t.res], 0, 100, "%");
    const dispPct = guard(t.key + " displacement", d[t.disp], 0, 100, "%");
    const res = resPct / 100, disp = dispPct / 100;
    const E = S * (1 - res), R = S * res, D = R * disp, incremental = R * (1 - disp);
    shifted += S; Dtot += D; Etot += E;
    if (t.bot) botFee += (D + E) * botCost;
    else { targetMin += (D + E) * EFF[t.key]; if (t.key === "Chat") chatHandled += (D + E); }
    return { ...t, S, shiftPts: shiftPts[i], resPct, dispPct, E, R, D, incremental };
  });

  // Adverse selection, anchored on the RESIDUAL, which is what the copy claims and
  // what an operator can verify after launch ("our voice AHT rose 4%").
  //
  // Total voice minutes are conserved: shifting does not change any call's length,
  // only which calls remain. So the residual uplift FIXES the departing AHT:
  //     voiceVol * baseEff  =  Dtot * deptEff  +  (voiceVol - Dtot) * residualEff
  // Setting both independently would double-count the same physical effect, which
  // is exactly what the previous version did, and it inflated savings.
  const shiftShare = voiceVol > 0 ? shifted / voiceVol : 0;
  const residualUplift = adverseCoef * shiftShare;
  const voiceAHT = guard("Voice AHT", d.voiceAHT, 0, null, "m");
  const voiceConc = conc("Voice concurrency", d.voiceConc);
  const baseEff = voiceAHT / voiceConc;
  const residualEff = baseEff * (1 + residualUplift);
  const residCalls = Math.max(0, voiceVol - Dtot);
  const deptEffRaw = Dtot > 0 ? (voiceVol * baseEff - residCalls * residualEff) / Dtot : baseEff;

  // Hard invariant: the calls that left cannot have taken negative time.
  const deptImpossible = Dtot > 0 && deptEffRaw <= 0;
  const deptImplausible = !deptImpossible && Dtot > 0 && deptEffRaw < IMPLAUSIBLE_DEPT;
  const deptEff = Math.max(0, deptEffRaw);

  const voiceFreedMin = Dtot * deptEff;
  const recoveryMin = Etot * deptEff * (erf - 1);     // only the EXTRA friction is new cost
  const netMin = voiceFreedMin - targetMin - recoveryMin;
  const laborCashGross = netMin * marginalPerMin;
  const laborCash = laborCashGross * mf;
  const netRealizable = laborCash - botFee;
  const gross = laborCashGross - botFee;

  const prodMin = WORKDAYS * HOURS_DAY * 60 * PROD_SHARE;
  const fteFreed = netMin / prodMin;
  const chatFTEadd = Math.max(0, chatHandled * EFF.Chat / prodMin);
  /* Transition is an investment, never a rebate. Negative training or ramp inputs
     produced a negative transition cost and a NEGATIVE payback period, which reads
     on the card as paying back before you spend. */
  const trainingPerAgent = guard("Training per agent", d.trainingPerAgent, 0, null, "$");
  const rampWeeks = guard("Ramp weeks", d.rampWeeks, 0, null, "w");
  const training = chatFTEadd * trainingPerAgent;
  const ramp = chatFTEadd * (rampWeeks * DAYS_WEEK * HOURS_DAY * hourly * loadedOH * RAMP_LOSS);
  const transition = training + ramp;
  const payback = netRealizable > 0 ? transition / netRealizable : Infinity;

  return { monthly, voiceVol, eligible, eligPct, voicePct, scaled, marginalPerMin, loadedPerMin, mf, mechKey, cred: MECH[mechKey].cred, shifted, Dtot, Etot, perTarget, shiftShare, residualUplift, baseEff, residualEff, deptEff, deptEffRaw, deptImpossible, deptImplausible, netMin, laborCash, botFee, botCost, erf, curveKey, netRealizable, gross, fteFreed, training, ramp, transition, payback, guards, blocked: guards.length > 0 };
}


// Solve the resolution rate (for a given target) at which net realizable crosses zero.
function solveBreakEven(d, mechKey, target) {
  let prev = compute({ ...d, [target.res]: 0 }, mechKey).netRealizable;
  for (let res = 1; res <= 100; res++) {
    const cur = compute({ ...d, [target.res]: res }, mechKey).netRealizable;
    if (cur >= 0 && prev < 0) return res - (cur / (cur - prev)); // linear interp
    if (cur >= 0 && res === 1) return 0;
    prev = cur;
  }
  return null; // never breaks even within 0-100
}

/* Reads the GUARDED shift points off compute, not the raw input. A -10pt shift
   used to clear this filter as "no shift modeled" while compute happily ran a
   negative displacement through the economics and printed a net loss. */
function primaryTarget(r) {
  return [...r.perTarget].filter(t => t.shiftPts > 0).sort((a, b) => b.shiftPts - a.shiftPts)[0] || null;
}

/* The verdict and the analyst read take the capacity action off r, which carries
   the key compute resolved. The third argument stays for call-site stability and
   is never used to index MECH. */
function buildVerdict(d, r, mechKey) {
  const pt = primaryTarget(r);
  const riskAny = RISKS.some(x => d[x.k]);
  if (!pt || r.shifted === 0) return { label: "No shift modeled", color: MUTED, detail: "Add a shift in question 2 to see the economics.", be: null, pt: null };
  /* F2 (TB, S24): with no capacity action chosen, freed labor realizes $0 while bot fees stay cash, so the net is
     negative by construction. Withhold the approval call until the reader chooses; the figures still show. */
  if (r.mechKey === "none") return { label: "Choose a capacity action first", color: MUTED, be: null, pt, curRes: pt.resPct, detail: "Freed voice time counts as $0 until you say how it becomes cash. Bot fees are cash either way and are already counted. Choose the capacity action in question 3 to see whether the shift clears its break-even." };
  const be = solveBreakEven(d, r.mechKey, pt);
  const curRes = pt.resPct;
  if (r.netRealizable < 0) {
    return { label: "Do not approve yet", color: RED, be, pt, curRes, detail: be == null ? `Net negative, and it never breaks even between 0% and 100% resolution. Even perfect ${pt.key.toLowerCase()} resolution cannot cover the bot fees, the new demand and the transition cost. Rework the plan.` : `Breaks even at ${be.toFixed(0)}% ${pt.key.toLowerCase()} resolution. You are at ${curRes}%, ${(be - curRes).toFixed(0)} points short. Raise resolution first, then shift.` };
  }
  if (riskAny) return { label: "Approve only with pilot", color: AMBER, be, pt, curRes, detail: `Net positive, and you have flagged customer-sensitive or risk-sensitive volume. Run a pilot that confirms resolution and CSAT (customer satisfaction) before a full rollout. This model prices capacity; it cannot see harm to customers.` };
  if (be != null && be < BE_FLOOR) return { label: "Approve", color: GREEN, be, pt, curRes, detail: `Net positive, with break-even near 0%. That usually means the bot cost or the escalation return factor is too generous. Check both before treating this as a clean approval.` };
  return { label: "Approve", color: GREEN, be, pt, curRes, detail: `Net positive at ${curRes}% ${pt.key.toLowerCase()} resolution${be != null ? ` (break-even ${be.toFixed(0)}%)` : ""}. The shift clears its break-even.` };
}

function buildAnalystRead(d, r, mechKey, verdict) {
  const out = [];
  out.push(`Of ${Math.round(r.voiceVol).toLocaleString()} voice contacts, ${Math.round(r.eligible).toLocaleString()} (${r.eligPct}%) are eligible to shift. ${Math.round(r.shifted).toLocaleString()} of those are shifted. The number to watch is ${Math.round(r.Dtot).toLocaleString()}: the contacts that both resolve in the new channel and replace a voice call. That is the real shift, and it is smaller than the headline percentage.`);

  out.push(`${Math.round(r.Etot).toLocaleString()} contacts do not resolve and come back to voice. Those customers would have called anyway, so the new cost is only the extra time a frustrated repeat call takes (your ${r.erf}x return factor). Displacement matters too: a digital contact that does not take a call out of the voice queue is new demand and saves nothing. Together these bring the result down to ${fmtK(r.netRealizable)} a month net.`);

  if (verdict.be != null && verdict.pt) out.push(`Decision threshold: this shift breaks even at ${verdict.be.toFixed(0)}% ${verdict.pt.key.toLowerCase()} resolution. You are modeling ${verdict.curRes}%. ${verdict.curRes >= verdict.be ? "You clear it. Check that resolution rate against real deflection data before committing." : "You are below it. Raise resolution first, then shift."}`);

  out.push(`Freed voice time is capacity until a capacity action turns it into cash. The realizable figure assumes ${MECH[r.mechKey].label}${r.mechKey !== "none" ? ` (${Math.round(r.mf * 100)}%)` : ""}. Bot platform fees (${fmtK(r.botFee)} a month) are cash and are netted in full. Under your ${CURVE[r.curveKey].label.toLowerCase()} complexity curve the voice work left behind runs ${(r.residualUplift * 100).toFixed(1)}% longer: the agents still on voice handle your hardest demand.`);
  if (r.Dtot > 0) out.push(`Check this assumption before you rely on the number. With total voice minutes held constant, a ${(r.residualUplift * 100).toFixed(1)}% residual uplift means the ${Math.round(r.Dtot).toLocaleString()} contacts you displace must average ${r.deptEff.toFixed(1)} minutes, against your ${r.baseEff.toFixed(1)} minute voice baseline. If the volume you plan to shift is about as long as your baseline, the curve is set too high and this case is understated. If it is far shorter, the curve is set too low and the case is overstated.`);

  out.push(`This answers the operating-capacity question only. What those interactions are worth to the business is a separate question for Return per Contact. The full investment case (ramp timing, phasing, the approval pack) belongs in Business Case Builder, which can take the headline from here.`);
  return out;
}
/* CONFIDENCE. Three applicable axes through confidence.js, and the report names the
   one that bound it. No grade ladder lives in this file.

   Evidence has two streams, and the weaker binds. Each graded field carries an origin:
   a tool default, the user's own entry, a value restored from this tool's own last
   run, or a value another tool published on the rail.
     Operating stream: volume and voice handle time stand at Planning-grade as the
     user's own entries. Eligibility, and the resolution and displacement of every
     target carrying a shift, stand at Planning-grade only when they are the user's own
     AND the checkbox attests them from data (decision G). The checkbox is
     self-attestation, so this tool never reaches Finance-grade on evidence: it has no
     document attestation path. The old gate reached Finance-grade on the checkbox.
     Cost stream: wage, marginal overhead, and the bot fee when the bot carries a
     shift. A default grades Directional; the user's own entry, Planning-grade.
   A rail value confers consistency, and evidence only as far as the origin grade its
   publisher recorded, capped by railEvidence. The rail carries no origin grade today,
   so a rail value grades Directional. That closes defect class 2 here: a rail volume
   or wage with no origin grade used to lift this tool to Planning-grade through
   sourcedExternally, and to Finance-grade with the checkbox ticked.

   Realization reads mech.js credit class through realizationFromCred, and nothing else.

   Completeness holds Directional on every disclosed failure of the model: a corrected
   input, a channel mix off 100 percent, a shift scaled to the eligible pool, an
   impossible or implausible departing handle time, a near-free bot carrying volume,
   or no volume shifted. That closes defect class 3: each was disclosed and none
   reached the grade. Net negative, break-even and the risk flags are properties of
   the answer and reach no axis, doctrine 5.5.

   Invariants void the export. Each is unreachable through the guards, and the harness
   proves it across the scenario set. */
const OPS_OWN = [["monthlyContacts", "contact volume"], ["voiceAHT", "voice handle time"]];
const OPS_ATTEST = [["eligibility", "eligibility"]];
const COST_FIELDS = [["hourlyRate", "agent wage"], ["marginalOH", "marginal overhead"]];

/* Where a graded field's value came from. `pre` holds what the mount prefill wrote,
   field by field, with the tool that published it. A prefilled value the user has
   since changed is the user's own. */
function fieldOrigin(d, pre, f) {
  const v = n(d[f]);
  const p = pre && Object.prototype.hasOwnProperty.call(pre, f) ? pre[f] : null;
  if (p && n(p.value) === v) return p.src === TOOL_ID ? "self" : "rail";
  if (v === BASE[f]) return "default";
  return "entered";
}

function gradeChannel({ d, r, pre, railOrigin }) {
  const invariants = [];
  const figs = [r.netRealizable, r.gross, r.netMin, r.laborCash, r.botFee, r.shifted, r.Dtot, r.Etot, r.transition, r.fteFreed, r.residualEff, r.deptEff];
  if (!figs.every(Number.isFinite)) invariants.push("an output is not a finite number");
  if (r.shifted > r.eligible * (1 + 1e-9) + 1e-9) invariants.push("more volume shifted than the eligible voice pool holds");
  if (r.Dtot > r.shifted * (1 + 1e-9) + 1e-9) invariants.push("more voice displaced than volume shifted");
  if (r.Dtot < 0 || r.Etot < 0 || r.botFee < 0 || r.transition < 0) invariants.push("a volume, fee or transition cost is below zero");
  if (r.deptEff < 0) invariants.push("the departing contacts carry negative handle time");

  const active = r.perTarget.filter(t => t.shiftPts > 0);
  const opsAttest = [...OPS_ATTEST, ...active.flatMap(t => [[t.res, `${t.key.toLowerCase()} resolution`], [t.disp, `${t.key.toLowerCase()} displacement`]])];
  const costList = [...COST_FIELDS, ...(active.some(t => t.bot) ? [["botCost", "bot fee"]] : [])];
  const all = [...OPS_OWN, ...opsAttest, ...costList];
  const origins = Object.fromEntries(all.map(([f]) => [f, fieldOrigin(d, pre, f)]));
  /* Origin grades are per field. A pulled value grades no higher than the grade its
     publisher recorded for it, so one weak pull no longer drags every pull down and one
     strong pull no longer lifts them. `railOrigin` is the blanket fallback for a field the
     rail carries with no recorded origin. */
  const railGradeOf = (f) => railEvidence((pre && pre[f] && pre[f].origin) || railOrigin);
  const attested = !!d.validated;
  const fieldGrade = (f, entered) => ({ default: "Directional", self: "Directional", rail: railGradeOf(f), entered })[origins[f]];
  const opsGrade = [...OPS_OWN.map(([f]) => fieldGrade(f, "Planning-grade")), ...opsAttest.map(([f]) => fieldGrade(f, attested ? "Planning-grade" : "Directional"))].reduce(weakerStream);
  const costGrade = costList.map(([f]) => fieldGrade(f, "Planning-grade")).reduce(weakerStream);
  const evidence = weakerStream(opsGrade, costGrade);

  const named = (list, o) => list.filter(([f]) => origins[f] === o).map(([, l]) => l);
  const say = (list) => list.length > 1 ? list.slice(0, -1).join(", ") + " and " + list[list.length - 1] : list[0];
  const why = (list) => {
    const parts = [];
    const def = named(list, "default"), self = named(list, "self"), rail = named(list, "rail");
    if (def.length) parts.push(`${say(def)} ${def.length > 1 ? "are" : "is"} still at the tool default`);
    if (self.length) parts.push(`${say(self)} ${self.length > 1 ? "were" : "was"} restored from this tool's own last run, and a tool never credentials itself, so it counts as unverified`);
    if (rail.length) {
      const seen = [...new Set(list.filter(([f]) => origins[f] === "rail").map(([f]) => (pre && pre[f] && pre[f].origin) || railOrigin).map((g) => g || "none"))];
      const noted = seen.length === 1 && seen[0] === "none" ? "with no recorded origin grade" : `with an origin grade of ${say(seen)}`;
      parts.push(`${say(rail)} arrived over the rail ${noted}. A value from another tool keeps your tools consistent, and its evidence goes only as far as where it came from`);
    }
    return parts;
  };
  const opsParts = why([...OPS_OWN, ...opsAttest]);
  if (!opsParts.length && !attested) opsParts.push("Eligibility, resolution and displacement are your own entries and are not yet attested from data. Tick the validation box once they come from your reporting");
  if (!opsParts.length) opsParts.push("Volume, handle time, eligibility, resolution and displacement are your own entries, attested from data. An attestation you make yourself stands at Planning-grade at most");
  const costParts = why(costList);
  if (!costParts.length) costParts.push("The wage and cost basis are your own entries. This tool inspects no documents, so they stand at Planning-grade at most");
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const evParts = [...(opsGrade === evidence ? opsParts : []), ...(costGrade === evidence ? costParts : [])];

  const realization = realizationFromCred(r.cred);
  const realWhy = r.mechKey === "none"
    ? "No capacity action is selected, so none of the freed time converts to cash"
    : `${MECH[r.mechKey].label} is credited as ${r.cred} in mech.js`;

  const mixSum = n(d.voicePct) + n(d.chatPct) + n(d.emailPct) + n(d.botPct);
  const blockers = [];
  if (r.guards.length) blockers.push(`${r.guards.length} input${r.guards.length > 1 ? "s were" : " was"} outside the possible range and corrected before calculation`);
  if (mixSum !== 100) blockers.push(`the channel mix sums to ${mixSum} percent`);
  if (r.scaled) blockers.push("the requested shift exceeded the eligible voice pool and was scaled to fit");
  if (r.deptImpossible) blockers.push("the complexity curve implies the departing contacts took zero or negative time, so freed minutes were clamped");
  else if (r.deptImplausible) blockers.push(`the complexity curve implies the departing contacts average under ${IMPLAUSIBLE_DEPT} minutes`);
  if (active.some(t => t.bot) && r.botCost <= BOT_NEAR_FREE) blockers.push("the bot carries volume at a near-free fee");
  if (!(r.shifted > 0)) blockers.push("no volume shifts, so the model measured nothing");
  const completeness = blockers.length ? "Directional" : "Finance-grade";
  const modelWhy = blockers.length ? blockers.join("; ")
    : "The model is whole: no input was corrected, the mix is 100 percent, the shift fits the eligible pool and the implied departing handle time is plausible";

  const voided = invariants.length > 0;
  const gradeObj = voided
    ? voidResult({
        invariant: invariants.join("; "),
        remedy: "Correct the inputs behind the failed check and run it again before citing any figure in this report.",
      })
    : emitGrades({
        evidence, realization, completeness,
        reasons: { evidence: `${evParts.map(cap).join(". ")}.`, realization: `${realWhy}.`, completeness: `${cap(modelWhy)}.` },
      });
  const confidence = voided ? "Void" : gradeObj.headline;
  const gradeWhy = voided
    ? `export void: ${invariants.join("; ")}`
    : `bound by ${gradeObj.boundBy}. ${gradeObj.boundAxes.map(a => gradeObj.reasons[a]).join(" ")}`;
  return { gradeObj, confidence, gradeWhy, voided, invariants, evidence, opsGrade, costGrade, realization, completeness, blockers, origins };
}

/* @engine-end */

const hair = alpha(HOUSE.mist, LINE.hair), soft = alpha(HOUSE.mist, LINE.soft);
const kicker = { fontSize: 12, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: HOUSE.muted };
const h2 = { fontSize: 18, fontWeight: 600, lineHeight: 1.3, color: HOUSE.mist, margin: "0 0 8px" };
const body = { fontSize: 15, lineHeight: 1.6, color: HOUSE.body, margin: 0 };
const small = { fontSize: 13, lineHeight: 1.5, color: HOUSE.muted, margin: 0 };
const link = { color: PILLARS.diagnostics.onDark, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 };
const grid = (min) => ({ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))`, gap: 12 });
const panel = { background: HOUSE.navy, border: `1px solid ${hair}`, borderRadius: RADIUS.card, padding: 20 };
const stat = { ...TYPE.statValue, fontSize: 24, color: HOUSE.mist, margin: "4px 0 2px" };
const Tile = ({ label, value, sub }) => (
  <div style={panel}><span style={kicker}>{label}</span><div style={stat}>{value}</div>{sub && <p style={small}>{sub}</p>}</div>
);
export default function ChannelShiftModel() {
  const [d, setD] = useState(() => clone(DEFAULTS.d));
  const [mech, setMech] = useState(DEFAULTS.mech);
  const [pulled, setPulled] = useState({});
  const [pullSources, setPullSources] = useState([]);
  const [pre, setPre] = useState({});
  const [fromLink, setFromLink] = useState(false);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const toggle = (k) => setD(prev => ({ ...prev, [k]: !prev[k] }));
  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    // A scenario link is a deliberate act and outranks the ambient cross-tool pull.
    const sc = readScenario(TOOL_ID, DEFAULTS);
    if (sc) { setD(sc.d); setMech(sc.mech); setFromLink(true); clearScenarioParam(); return; }

    const next = {}, got = {}, srcOf = {}, seen = {};
    /* Keys stay as string literals at the call site. rail-audit.mjs finds pulls by
       matching a literal argument against the accessor name; hiding the key behind
       a variable would remove this tool from the static audit without failing it. */
    const take = (res, field, xform) => {
      if (res.value == null || isNaN(res.value)) return false;
      next[field] = xform(res.value);
      seen[field] = { value: next[field], src: res.sourceTool || "", origin: res.railOrigin || null };
      if (res.sourceTool && res.sourceTool !== TOOL_ID) { got[field] = true; srcOf[field] = res.sourceTool; }
      return true;
    };
    if (!take((getExternalWithSource("monthlyContacts", TOOL_ID) || NO_RAIL), "monthlyContacts", (v) => Math.round(v)))
      take((getExternalWithSource("annualContacts", TOOL_ID) || NO_RAIL), "monthlyContacts", (v) => Math.round(v / 12));
    take((getExternalWithSource("agentHourly", TOOL_ID) || NO_RAIL), "hourlyRate", (v) => v);
    // resBot is the share of BOT-ROUTED volume that resolves. That is botResolutionRate,
    // not realisticDeflectionRate (which is a share of TOTAL demand and is always lower).
    // Feeding the total-demand rate here under-credited every shift. Fixed 22 Jul 2026.
    take((getExternalWithSource("botResolutionRate", TOOL_ID) || NO_RAIL), "resBot", (v) => Math.round(v <= 1 ? v * 100 : v));
    if (Object.keys(next).length) setD(prev => ({ ...prev, ...next }));
    if (Object.keys(got).length) { setPulled(got); setPullSources([...new Set(Object.values(srcOf))]); }

    /* Captured once, at mount, BEFORE this tool publishes, with the tool that wrote
       each value. gradeChannel reads it field by field: a restored own value and a
       rail value with no origin grade both grade Directional. */
    setPre(seen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const r = compute(d, mech);
  /* mech is what the page or a scenario link supplied. mechKey is what compute
     resolved and ran. Everything below reads mechKey; only the selector's setter,
     the effect dependencies and the shareable scenario keep the entered value. */
  const mechKey = r.mechKey;
  const verdict = buildVerdict(d, r, mechKey);
  /* Guarded points, so the copy below cannot describe a shift the engine refused to run. */
  const shiftPts = r.perTarget.reduce((a, t) => a + t.shiftPts, 0);
  const analyst = buildAnalystRead(d, r, mechKey, verdict);

  /* railOrigin is null because the rail carries no origin grade yet. See gradeChannel. */
  const graded = gradeChannel({ d, r, pre, railOrigin: null });
  const { gradeObj, confidence, gradeWhy } = graded;

  const mixTotal = n(d.voicePct) + n(d.chatPct) + n(d.emailPct) + n(d.botPct);
  const riskAny = RISKS.some(x => d[x.k]);
  const flags = [];
  /* Corrections lead. A reader who scrolls past the first block should not find
     out three sections later that the engine ran on different numbers than the
     ones they typed. */
  for (const g of r.guards) flags.push({ sev: "warn", t: `${g.label}: you entered ${guardVal(g, "entered")}, which is outside the possible range. Every figure in this report was computed at ${guardVal(g, "used")}. Correct the input; until you do, the result grades Directional.` });
  if (mixTotal !== 100) flags.push({ sev: "warn", t: `Current channel mix sums to ${mixTotal}%. It has to sum to 100% for the figures to hold. Correct the mix in question 1.` });
  if (r.scaled) flags.push({ sev: "warn", t: `The requested shift is larger than the eligible voice pool (${r.eligPct}% of voice, ${Math.round(r.eligible).toLocaleString()} contacts), so the shifts were scaled to fit. Only eligible volume can move.` });
  if (verdict.be != null && verdict.pt) flags.push({ sev: verdict.curRes >= verdict.be ? "info" : "warn", t: `Break-even ${verdict.pt.key.toLowerCase()} resolution is ${verdict.be.toFixed(0)}%. You are modeling ${verdict.curRes}%${verdict.curRes >= verdict.be ? ", which clears it." : `, ${(verdict.be - verdict.curRes).toFixed(0)} points short.`}` });
  if (r.netRealizable < 0) flags.push({ sev: "warn", t: `Net negative (${fmtK(r.netRealizable)} a month). Repeat calls back to voice, new demand and bot fees outweigh the voice time freed. Either the volume being moved is the wrong volume, or the resolution rate is too low.` });
  if (riskAny && r.netRealizable >= 0) flags.push({ sev: "warn", t: `The cost case is positive, and you have flagged sensitive volume (${RISKS.filter(x => d[x.k]).map(x => x.label).join(", ")}). Confirm it in a pilot before approval. This tool prices capacity. It cannot measure harm to customers.` });
  r.perTarget.forEach(t => { if (t.shiftPts > 0 && t.dispPct >= 100) flags.push({ sev: "info", t: `${t.key} displacement at 100% assumes every contact in the new channel replaces a voice call. Digital channels usually create some new demand as well. 70 to 85% is easier to defend.` }); });
  if (n(d.shiftToBot) > 0 && r.botCost <= BOT_NEAR_FREE) flags.push({ sev: "warn", t: `Bot cost is ${money(r.botCost)}, near-free. Real bots carry per-resolution or platform fees. A $0 bot makes any shift look free and pushes break-even toward 0%. Enter a realistic per-contact cost.` });
  if (verdict.be != null && verdict.be < BE_FLOOR && r.netRealizable > 0 && r.shifted > 0) flags.push({ sev: "warn", t: "Break-even is near 0%, so the shift looks profitable at any resolution rate. That usually means the bot cost or the escalation return factor is too generous. Check both before approving." });
  if (mechKey === "none") flags.push({ sev: "warn", t: "No capacity action selected, so the freed agent time is valued at $0. Choose one in question 3 before presenting any savings figure." });
  if (r.deptImpossible) flags.push({ sev: "warn", t: `Impossible assumption. A ${(r.residualUplift * 100).toFixed(1)}% residual uplift on this much displaced volume means the departing calls took zero or negative time. Freed minutes were clamped to zero. Lower the complexity curve or reduce the shift.` });
  else if (r.deptImplausible) flags.push({ sev: "warn", t: `Your ${CURVE[r.curveKey].label.toLowerCase()} curve implies the displaced contacts average ${r.deptEffRaw.toFixed(1)} minutes against a ${r.baseEff.toFixed(1)} minute voice baseline. That is close to zero handle time, so the curve is very likely too severe for the volume being moved.` });
  else if (r.Dtot > 0) flags.push({ sev: "info", t: `Implied assumption: the ${Math.round(r.Dtot).toLocaleString()} displaced contacts average ${r.deptEff.toFixed(1)} minutes against your ${r.baseEff.toFixed(1)} minute voice baseline, and the voice work left behind rises to ${r.residualEff.toFixed(1)} minutes. Total voice minutes are unchanged. If the volume you are shifting runs longer than that, lower the curve.` });

  useEffect(() => {
    const published = normalizeForPublish({
      channelShiftNetRealizableMonthly: Math.round(r.netRealizable), channelShiftNetRealizableAnnual: Math.round(r.netRealizable * 12),
      channelShiftGrossMonthly: Math.round(r.gross), channelShiftDisplacedVoice: Math.round(r.Dtot), channelShiftBouncedMonthly: Math.round(r.Etot),
      channelShiftFteFreed: +r.fteFreed.toFixed(1), channelShiftTransition: Math.round(r.transition),
      channelShiftPaybackMonths: isFinite(r.payback) ? +r.payback.toFixed(1) : null, channelShiftBreakEvenRes: verdict.be != null ? +verdict.be.toFixed(0) : null,
      capacityAction: mechKey,
    }, { sourceTool: "channel-shift" }).clean;
    publishToolResult("channel-shift", published, originsFor(gradeObj, published));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d, mech]);

  /* Exact input set the scenario link carries. */
  const scenario = { d, mech };


  const stamp = methodStamp(TOOL_ID);
  const { how, voidReason } = resultHow(gradeObj);
  const result = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Result label="Net realizable a month" value={voidReason ? null : r.netRealizable} format={fmtK}
        change={voidReason ? null : (r.mechKey === "none" ? "No capacity action chosen yet, so freed time counts as $0 and only the bot fees show. " : r.netRealizable >= 0 ? `${fmtK(r.netRealizable * 12)} a year. ` : "A net cost. ") + `${Math.round(r.Dtot).toLocaleString()} contacts a month leave voice for good.`}
        how={how} voidReason={voidReason} />
      {!voidReason && (
        <div style={panel}>
          <span style={kicker}>The decision</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: HOUSE.mist, margin: "6px 0" }}>{verdict.label}</div>
          <p style={small}>{verdict.detail}</p>
          {verdict.be != null && verdict.pt && (
            <p style={{ ...small, marginTop: 8 }}>Current {verdict.pt.key.toLowerCase()} resolution <strong style={{ color: HOUSE.mist }}>{verdict.curRes}%</strong>, break-even <strong style={{ color: HOUSE.mist }}>{verdict.be.toFixed(0)}%</strong>.</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <ToolFrame toolId={TOOL_ID} section="Cost + Economics" name="Channel Shift" title="What does moving contacts out of voice actually save?"
      lede="Moving contacts from voice to chat, email or a bot pays only when enough of them resolve in the new channel to cover the ones that fail and call back, the harder calls left on voice, the cost of the change, and how much freed time you can turn into cash. This model counts each stage separately: contacts shifted, contacts resolved, voice calls actually replaced, and the money finance can book."
      method={stamp ? { version: stamp.version, date: stamp.text.replace(/^Method [^,]+, published /, ""), href: stamp.href } : null}
      result={result} pinned={voidReason ? null : { label: "Net realizable a month", value: fmtK(r.netRealizable) }}>
      <style>{`${FONT_IMPORT_CSS}.cs-sel option{background:${HOUSE.navy};color:${HOUSE.mist}}`}</style>
      <p style={small}>Every formula, constant and a worked example are in the <a href="/methodology/channel-shift" style={link}>published method</a>. AHT is average handle time.{Object.keys(pulled).length > 0 && ` Prefilled ${Object.keys(pulled).length} value${Object.keys(pulled).length > 1 ? "s" : ""} from ${pullSources.length ? pullSources.join(", ") : "a previous tool"}.`}</p>

      <fieldset style={{ ...panel, margin: 0 }}>
        <legend style={{ ...kicker, padding: "0 6px" }}>Question 1 of 3 · Your environment</legend>
        <div style={grid(180)}>
          <NumField tone="dark" label="Monthly contacts" value={d.monthlyContacts} onChange={v => set("monthlyContacts", v)} step={1000} min={0} pulled={pulled.monthlyContacts} />
          <NumField tone="dark" label="Agent hourly wage" value={d.hourlyRate} onChange={v => set("hourlyRate", v)} prefix="$" suffix="/hr" step={0.5} min={0} pulled={pulled.hourlyRate} />
          <NumField tone="dark" label="Loaded overhead" value={d.loadedOH} onChange={v => set("loadedOH", v)} suffix="x" step={0.05} min={1} info={DEFS.loadedOH} infoTitle="Loaded overhead" />
          <NumField tone="dark" label="Marginal overhead" value={d.marginalOH} onChange={v => set("marginalOH", v)} suffix="x" step={0.02} min={1} hint="Savings basis" info={DEFS.marginalOH} infoTitle="Marginal overhead" infoAlign="right" />
        </div>
        <h2 style={{ ...h2, fontSize: 16, margin: "18px 0 10px" }}>Current mix and handle time <span style={{ ...small, fontWeight: 500, color: mixTotal === 100 ? HOUSE.muted : HOUSE.mist }}>· mix adds to {mixTotal}%{mixTotal === 100 ? "" : ", correct it to 100"}</span></h2>
        <div style={grid(150)}>
          <NumField tone="dark" label="Voice %" value={d.voicePct} onChange={v => set("voicePct", v)} suffix="%" step={1} min={0} max={100} />
          <NumField tone="dark" label="Chat %" value={d.chatPct} onChange={v => set("chatPct", v)} suffix="%" step={1} min={0} max={100} />
          <NumField tone="dark" label="Email %" value={d.emailPct} onChange={v => set("emailPct", v)} suffix="%" step={1} min={0} max={100} />
          <NumField tone="dark" label="Bot %" value={d.botPct} onChange={v => set("botPct", v)} suffix="%" step={1} min={0} max={100} />
          <NumField tone="dark" label="Voice AHT" value={d.voiceAHT} onChange={v => set("voiceAHT", v)} suffix="min" step={0.5} min={0} />
          <NumField tone="dark" label="Chat AHT" value={d.chatAHT} onChange={v => set("chatAHT", v)} suffix="min" step={0.5} min={0} hint={`${d.chatConc} chats at once`} />
          <NumField tone="dark" label="Email AHT" value={d.emailAHT} onChange={v => set("emailAHT", v)} suffix="min" step={0.5} min={0} />
          <NumField tone="dark" label="Bot cost per contact" value={d.botCost} onChange={v => set("botCost", v)} prefix="$" step={0.05} min={0} info={DEFS.botCost} infoTitle="Bot cost per contact" infoAlign="right" />
        </div>
        <div style={{ ...grid(220), marginTop: 18 }}>
          <NumField tone="dark" label="Eligible voice for shift" value={d.eligibility} onChange={v => set("eligibility", v)} suffix="%" step={5} min={0} max={100} hint="Safe to move. Leave out complex, regulated and emotional contacts" info={DEFS.eligibility} infoTitle="Eligible voice for shift" />
          <NumField tone="dark" label="Escalation return factor" value={d.escReturnFactor} onChange={v => set("escReturnFactor", v)} suffix="x" step={0.1} min={1} hint="Extra time on a call back: 1.0 same as a direct call, 1.2 frustrated, 1.5 complex recovery" info={DEFS.erf} infoTitle="Escalation return factor" />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: HOUSE.mist, display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>Residual complexity curve<InfoDot text={DEFS.curve} title="Residual complexity curve" align="right" /></div>
            <div role="group" aria-label="Residual complexity curve" style={{ display: "flex", gap: 6 }}>
              {Object.entries(CURVE).map(([k, v]) => <button key={k} type="button" aria-pressed={d.adverseCurve === k} onClick={() => set("adverseCurve", k)} style={{ flex: 1, minHeight: TOUCH, fontFamily: FONT, fontSize: 14, fontWeight: d.adverseCurve === k ? 700 : 500, borderRadius: RADIUS.field, cursor: "pointer", border: `1px solid ${d.adverseCurve === k ? HOUSE.electric : alpha(HOUSE.mist, LINE.firm)}`, background: d.adverseCurve === k ? alpha(HOUSE.electric, 0.22) : "transparent", color: HOUSE.mist }}>{v.label}</button>)}
            </div>
            <span style={{ ...small, marginTop: 4, display: "block" }}>{CURVE[r.curveKey].note}</span>
          </div>
        </div>

        {r.Dtot > 0 && (
          <div style={{ marginTop: 16, borderRadius: RADIUS.field, padding: "14px 16px", border: r.deptImpossible || r.deptImplausible ? `1.5px solid ${HOUSE.mist}` : `1px solid ${hair}` }}>
            <div style={{ ...kicker, marginBottom: 8 }}>What this curve assumes{r.deptImpossible || r.deptImplausible ? ": check it" : ""}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "flex-end" }}>
              <div>
                <div style={{ fontSize: 19, fontWeight: 700, color: HOUSE.mist }}>{r.baseEff.toFixed(1)}<span style={small}> min</span></div>
                <div style={small}>Voice baseline today</div>
              </div>
              <div aria-hidden="true" style={{ fontSize: 15, color: HOUSE.muted, paddingBottom: 4 }}>&rarr;</div>
              <div>
                <div style={{ fontSize: 19, fontWeight: 700, color: HOUSE.mist }}>{r.deptEffRaw.toFixed(1)}<span style={small}> min</span></div>
                <div style={small}>Implied AHT of the calls you displace</div>
              </div>
              <div>
                <div style={{ fontSize: 19, fontWeight: 700, color: HOUSE.mist }}>{r.residualEff.toFixed(1)}<span style={small}> min</span></div>
                <div style={small}>Voice left behind, {(r.residualUplift * 100).toFixed(1)}% harder</div>
              </div>
            </div>
            <p style={{ ...small, marginTop: 12 }}>
              Total voice minutes do not change when you shift. Each call takes as long as it did; fewer of them stay on
              voice. So choosing a residual uplift also sets how short the departing calls must have been. If the
              volume you plan to move does not run about {r.deptEffRaw.toFixed(1)} minutes, choose a different curve.
            </p>
          </div>
        )}
      </fieldset>

      <fieldset style={{ ...panel, margin: 0 }}>
        <legend style={{ ...kicker, padding: "0 6px" }}>Question 2 of 3 · Shift from voice to a target</legend>
        <p style={{ ...small, marginBottom: 10 }}>Points are the plan. The two rates under them reduce it to what really happens. Resolution is the share that resolves without coming back to voice. Displacement is the share of resolved contacts that replace a voice call; the rest is new demand. Set both to what your data supports.</p>
        <p style={{ ...body, fontSize: 14, marginBottom: 14, padding: "12px 14px", border: `1px solid ${hair}`, borderRadius: RADIUS.field }}>
          <strong style={{ color: HOUSE.mist }}>How to use the points.</strong> A point is one percent of your total monthly contact volume,
          moved out of voice. Voice is currently {r.voicePct}% of the mix. Shifting {shiftPts} points takes it to {Math.max(0, r.voicePct - shiftPts)}%.
          {" "}Start with how much voice is <em>eligible</em> to move, set that in question 1, then set points to match.
          {shiftPts > 0 && (
            <> You have requested <strong style={{ color: HOUSE.mist }}>{Math.round(r.monthly * shiftPts / 100).toLocaleString()}</strong> contacts against an eligible pool of{" "}
            <strong style={{ color: HOUSE.mist }}>{Math.round(r.eligible).toLocaleString()}</strong>.{r.scaled ? " That is more than the pool, so the shift was scaled down to fit." : " That fits."}</>
          )}
          {shiftPts > r.voicePct && <strong style={{ color: HOUSE.mist }}> That is more volume than voice carries today.</strong>}
        </p>
        <div style={grid(200)}>
          {TARGETS.map(tc => { const t = tc.key; return (
            <div key={t} style={{ border: `1px solid ${hair}`, borderRadius: RADIUS.field, padding: "12px 14px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: HOUSE.mist, marginBottom: 8 }}>To {t === "Bot" ? "Bot or self-service" : t}</div>
              <NumField tone="dark" compact label="Shift" value={d["shiftTo" + t]} onChange={v => set("shiftTo" + t, v)} suffix="pts" step={1} min={0} max={100} hint="points of total volume" info={DEFS.shiftPts} infoTitle="Shift points" />
              <div style={{ height: 6 }} />
              <NumField tone="dark" compact label="Resolution rate" value={d["res" + t]} onChange={v => set("res" + t, v)} suffix="%" step={1} min={0} max={100} pulled={t === "Bot" && pulled.resBot} hint={t === "Bot" && pulled.resBot ? "from AI Deflection" : "resolved without a call back"} info={DEFS.resolution} infoTitle="Resolution rate" />
              <div style={{ height: 6 }} />
              <NumField tone="dark" compact label="Displacement" value={d["disp" + t]} onChange={v => set("disp" + t, v)} suffix="%" step={1} min={0} max={100} hint="% that replace a voice call" info={DEFS.displacement} infoTitle="Displacement" />
            </div>
          ); })}
        </div>
      </fieldset>

      <fieldset style={{ ...panel, margin: 0 }}>
        <legend style={{ ...kicker, padding: "0 6px" }}>Question 3 of 3 · Capacity action and guardrails</legend>
        <div style={grid(260)}>
          <div>
            <label htmlFor="cs-mech" style={{ fontSize: 14, fontWeight: 600, color: HOUSE.mist, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>Capacity action<InfoDot text={DEFS.capacity} title="Capacity action" /></label>
            <p style={{ ...small, color: mechKey === "none" ? HOUSE.mist : HOUSE.muted, marginBottom: 10 }}>{MECH[mechKey].note}</p>
            <select id="cs-mech" aria-label="Realization mechanism" value={mechKey} onChange={e => setMech(e.target.value)} className="cs-sel" style={{ width: "100%", minHeight: TOUCH, fontFamily: FONT, fontSize: 15, fontWeight: 600, padding: "0 12px", borderRadius: RADIUS.field, border: `1px solid ${alpha(HOUSE.mist, LINE.firm)}`, background: HOUSE.navy, color: HOUSE.mist, cursor: "pointer" }}>
              {MECH_ORDER.map(k => <option key={k} value={k}>{MECH[k].label}{k !== "none" ? `  (${Math.round(MECH[k].f * 100)}%)` : ""}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: HOUSE.mist, marginBottom: 8 }}>Risk guardrails <span style={{ ...small, fontWeight: 400 }}>· mark volume that needs care</span></div>
            <div style={grid(150)}>
              {RISKS.map(rk => (
                <label key={rk.k} style={{ display: "flex", alignItems: "center", gap: 8, minHeight: TOUCH, cursor: "pointer", fontSize: 14, color: HOUSE.body }}>
                  <input type="checkbox" checked={d[rk.k]} onChange={() => toggle(rk.k)} style={{ width: 18, height: 18, accentColor: HOUSE.electric }} />{rk.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </fieldset>

      <div style={grid(150)}>
        <Tile label="Net realizable" value={`${fmtK(r.netRealizable)}/mo`} sub={r.netRealizable >= 0 ? `${fmtK(r.netRealizable * 12)} a year` : "net cost"} />
        <Tile label="Voice displaced" value={Math.round(r.Dtot).toLocaleString()} sub="leave voice each month" />
        <Tile label="Bounced to voice" value={Math.round(r.Etot).toLocaleString()} sub="failed in the new channel each month" />
        <Tile label="Voice FTE freed" value={r.fteFreed.toFixed(1)} sub={r.fteFreed >= 0 ? "net capacity, in full-time agents" : "net capacity lost, in full-time agents"} />
      </div>
      <p style={{ ...body, fontSize: 14, padding: "12px 14px", border: `1px solid ${hair}`, borderRadius: RADIUS.field }}>
        <strong style={{ color: HOUSE.mist }}>{Math.round(r.shifted).toLocaleString()} shifted</strong>: {Math.round(r.Dtot).toLocaleString()} displace voice, {Math.round(r.Etot).toLocaleString()} come back. Net <strong style={{ color: HOUSE.mist }}>{Math.round(r.netMin).toLocaleString()} agent minutes a month</strong> freed: {fmtK(r.laborCash)} of realized labor less {fmtK(r.botFee)} of bot fees gives <strong style={{ color: HOUSE.mist }}>{fmtK(r.netRealizable)}/mo</strong>.
      </p>

      <section aria-label="Integrity checks" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <h2 style={h2}>Integrity checks</h2>
        {flags.map((f, i) => isNoActionFlag(f) ? <Finding key={i} level="unknown" title="Your choice is still open">{f.t}</Finding> : <Finding key={i} level={f.sev === "warn" ? "high" : "unknown"} title={f.sev === "warn" ? "Check this" : "Note"}>{f.t}</Finding>)}
        {!flags.length && <Finding level="clear" title="Integrity checks passed">The mix adds to 100%, the shift fits the eligible volume, resolution is above break-even, a capacity action is chosen, and no sensitive volume is flagged.</Finding>}
      </section>

      <section aria-label="Shift detail by target" style={panel}>
        <h2 style={h2}>Shift detail by target</h2>
        <div style={grid(180)}>
          {r.perTarget.filter(t => t.S > 0).map((t, i) => (
            <div key={i} style={{ border: `1px solid ${hair}`, borderRadius: RADIUS.field, padding: 14 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: HOUSE.mist, marginBottom: 8 }}>{t.key}</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["Shifted", t.S], ["Displaced", t.D], ["Bounced", t.E], ["Incremental", t.incremental]].map(([k, v]) => (
                  <div key={k}><span style={small}>{k}</span><div style={{ fontSize: 15, fontWeight: 600, color: HOUSE.mist, ...NUM }}>{Math.round(v).toLocaleString()}</div></div>
                ))}
              </div>
            </div>
          ))}
          {r.perTarget.every(t => t.S === 0) && <p style={small}>No shift modeled yet.</p>}
        </div>
      </section>

      <section aria-label="Transition investment" style={panel}>
        <h2 style={h2}>Transition investment</h2>
        <div style={grid(160)}>
          <div><span style={small}>Chat reskilling</span><div style={stat}>{fmtK(r.training)}</div></div>
          <div><span style={small}>Ramp productivity loss</span><div style={stat}>{fmtK(r.ramp)}</div></div>
          <div><span style={small}>Payback (headline)</span><div style={stat}>{isFinite(r.payback) ? r.payback.toFixed(1) + " mo" : "Never"}</div></div>
        </div>
      </section>

      <section aria-label="What it means" style={{ ...panel, borderLeft: `3px solid ${PILLARS.diagnostics.fill}` }}>
        <span style={kicker}>What it means · shift the volume that can resolve</span>
        {analyst.map((t, i) => <p key={i} style={{ ...body, margin: i ? "10px 0 0" : "8px 0 0" }}>{t}</p>)}
      </section>

      <section aria-label="How sure" style={panel}>
        <span style={kicker}>How sure the result is · {confidence}</span>
        <p style={{ ...body, fontSize: 14, margin: "8px 0 12px" }}>{gradeWhy}</p>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
          <input type="checkbox" checked={d.validated} onChange={e => set("validated", e.target.checked)} style={{ width: 18, height: 18, marginTop: 3, accentColor: HOUSE.electric }} />
          <span style={{ ...body, fontSize: 14 }}>Eligibility, displacement and resolution come from our own data. This is self-attested, so it lifts them to Planning-grade at most.</span>
        </label>
      </section>

      <HowOthersReport toolId={TOOL_ID} />
      {/* The report is paper (Brand Guide section 13). */}
      <div style={{ background: HOUSE.paper, color: HOUSE.paperInk, borderRadius: RADIUS.card, padding: "8px 20px 20px" }}>
          <ReportActions
            toolId={TOOL_ID}
            toolName="Channel Shift Economics"
            subtitle={`Voice → digital · ${verdict.label} · ${isVoid(gradeObj) ? "EXPORT VOID, integrity invariant failed" : `${confidence}, bound by ${gradeObj.boundBy}`}`}
            routePath={ROUTE}
            state={scenario}
            defaults={DEFAULTS}
            grades={gradeObj}
            summary={[
              { label: "Net realizable monthly", value: fmtK(r.netRealizable) },
              { label: "Verdict", value: verdict.label },
              { label: "Break-even", value: verdict.be != null ? verdict.be.toFixed(0) + "%" : "n/a" },
            ]}
            signals={{
              /* This tool does not measure a standing operational burden, it
                 judges a proposed plan, so severity is decision risk rather than
                 pain: how far the plan sits below its own break-even resolution
                 rate. The denominator is the break-even the engine solves for on
                 these exact inputs, not an anchor chosen here, which is why the
                 band moves when bot fees, displacement or the return factor
                 move even though the resolution rate has not.

                 Measured: the shipped defaults clear the bar and read none, 40%
                 chat resolution against a 74% break-even reads moderate, 20%
                 reads high, and a plan that never breaks even inside 0 to 100
                 while netting negative reads severe.

                 A break-even at or below zero is the case the verdict already
                 warns is built on too-generous cost assumptions. It is not a
                 clean result, but it is also not a measured shortfall, so it
                 falls back to the sign of the net rather than dividing by it.

                 With nothing shifted there is no plan to judge. Publishing none
                 would report a clean decision where no decision was modeled, so
                 the key is omitted. */
              ...(verdict.pt == null || r.shifted === 0 ? {} : {
                severity: severityBucket(
                  verdict.be == null || verdict.be <= 0
                    ? (r.netRealizable < 0 ? 1 : 0)
                    : Math.max(0, Math.min(1, (verdict.be - verdict.curRes) / verdict.be))
                ),
              }),
              capacity_action: MECH[mechKey].label,
              eligibility_pct: r.eligPct + "%",
              inputs_corrected: r.guards.length,
              grade_bound_by: isVoid(gradeObj) ? "void" : gradeObj.boundBy,
              cost_validated: d.validated ? "yes" : "no",
              adverse_curve: r.curveKey,
              from_scenario_link: fromLink ? "yes" : "no",
            }}
            sections={[
              { title: "Decision", type: "metrics", items: [
                { label: "Verdict", value: verdict.label, color: verdict.color },
                { label: "Net Realizable", value: fmtK(r.netRealizable) + "/mo", color: r.netRealizable > 0 ? GREEN : RED, sub: r.netRealizable > 0 ? fmtK(r.netRealizable * 12) + "/yr" : "net cost" },
                { label: verdict.pt ? "Break-even " + verdict.pt.key + " res" : "Break-even", value: verdict.be != null ? verdict.be.toFixed(0) + "%" : "n/a", color: AMBER, sub: verdict.pt ? "current " + verdict.curRes + "%" : "" },
                { label: "Voice FTE Freed", value: r.fteFreed.toFixed(1), color: GREEN, sub: "capacity, not headcount" },
              ]},
              { title: "Volume Bridge", type: "table", rows: [
                ["Voice volume", Math.round(r.voiceVol).toLocaleString()],
                [`Eligible to shift (${r.eligPct}%)`, Math.round(r.eligible).toLocaleString()],
                ["Shifted", Math.round(r.shifted).toLocaleString()],
                ["Displaced voice (resolved x displacement)", Math.round(r.Dtot).toLocaleString()],
                ["Bounced back to voice", Math.round(r.Etot).toLocaleString()],
              ]},
              { title: "Adverse Selection (implied once, from total voice minutes)", type: "table", rows: [
                ["Voice AHT baseline", r.baseEff.toFixed(1) + " min"],
                [`Residual voice AHT after shift (${(r.residualUplift * 100).toFixed(1)}% uplift)`, r.residualEff.toFixed(1) + " min"],
                ["Implied AHT of displaced contacts", r.deptEff.toFixed(1) + " min"],
                ["Total voice minutes before and after", Math.round(r.voiceVol * r.baseEff).toLocaleString() + " (conserved)"],
              ]},
              { title: "Economics", type: "table", rows: [
                ["Net agent-minutes freed/mo", Math.round(r.netMin).toLocaleString()],
                [`Realized labor (${MECH[mechKey].label}, ${Math.round(r.mf * 100)}%)`, fmtK(r.laborCash) + "/mo"],
                ["Bot platform fees (cash)", fmtK(-r.botFee) + "/mo"],
                ["Net realizable", fmtK(r.netRealizable) + "/mo"],
                ["Transition (one-time)", fmtK(r.transition)],
                ["Payback", isFinite(r.payback) ? r.payback.toFixed(1) + " months" : "Does not pay back"],
              ]},
              ...(r.guards.length ? [{ title: "⚠ Inputs Corrected Before Calculation", type: "findings", items: r.guards.map(guardLine) }] : []),
              ...(flags.length ? [{ title: "Integrity Checks", type: "findings", items: flags.map(f => f.t) }] : []),
              { title: "Analyst Read", type: "findings", items: analyst },
              { title: "Methodology", type: "text", content: `Only the eligible share of voice (${r.eligPct}%) can shift. Each shifted contact resolves at the target resolution rate. Failures come back to voice and add only the extra time of the repeat call (escalation return factor ${r.erf}x minus 1), because the customer would have called anyway. Of resolved contacts, only the displacement share replaces a voice call. The rest is new demand, left out of savings. The economics run on net agent minutes freed (voice minutes freed, less chat and email minutes used, less recovery time), valued at marginal labor cost and scaled by the ${MECH[mechKey].label} capacity action (${Math.round(r.mf * 100)}%). Bot platform fees are cash and are netted in full. Adverse selection is anchored on the residual: under the ${CURVE[r.curveKey].label} complexity curve, voice AHT for the calls left behind rises ${(r.residualUplift * 100).toFixed(1)}% to ${r.residualEff.toFixed(1)} minutes. Total voice minutes stay the same: shifting changes which calls remain, and each call takes as long as it did. That fixes the implied AHT of the displaced contacts at ${r.deptEff.toFixed(1)} minutes against a ${r.baseEff.toFixed(1)} minute baseline. The tool never sets both ends on their own, because that would count the same effect twice and overstate freed capacity. Break-even is the target resolution rate at which net realizable crosses zero. The full method, with every formula, constant and a worked example, is published at contactcentercx.com/methodology/channel-shift. Report grade: ${confidence}, ${gradeWhy}${r.guards.length ? ` INPUTS CORRECTED: ${r.guards.map(g => `${g.label} entered ${guardVal(g, "entered")}, computed at ${guardVal(g, "used")}`).join("; ")}. Every figure above was computed on the corrected values.` : ""} This is an operating-capacity model. It does not value the interactions or build the full investment case.` },
            ]}
          />

      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Button kind="secondary" href="/tools/ai-deflection">AI Deflection</Button>
      </div>
    </ToolFrame>
  );
}

/* The scenario-link defaults, exported for the live checker and the visual audit. */
export { DEFAULTS };
