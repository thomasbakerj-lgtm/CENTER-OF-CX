import { useState, useEffect } from "react";
import ReportActions from "./ReportActions";
import { COLORS } from "./src/lib/benchmarks";
import { publishToolResult, getPrimitiveWithSource, sourcedExternally } from "./src/lib/toolData";
import { normalizeForPublish } from "./src/lib/metrics";
import InfoDot from "./src/lib/InfoDot";
import NumField from "./src/lib/NumField";
import { MECH, MECH_ORDER } from "./src/lib/mech";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS, TYPE, W, NUM } from "./src/lib/type";

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

   MECH is injected from the real src/lib/mech.js and COLORS from the real
   src/lib/benchmarks.js. Neither is reconstructed. */
const MUTED = COLORS.muted, GREEN = COLORS.green, AMBER = COLORS.amber, RED = COLORS.red, TEAL = "#0E9AA4";

const n = (v) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };
const money = (v) => { const x = n(v); return (x < 0 ? "-$" : "$") + Math.abs(x).toFixed(2); };
const fmtK = (v) => { const x = n(v), s = x < 0 ? "-" : ""; const a = Math.abs(x); return s + (a >= 1000000 ? "$" + (a / 1000000).toFixed(2) + "M" : a >= 1000 ? "$" + (a / 1000).toFixed(0) + "K" : "$" + Math.round(a)); };

/* One renderer for a corrected value. The corrections section, the integrity
   checks and the methodology all print the same fact, and they had already
   drifted: the flag printed $-2 while the corrections section printed -2$.
   A document that states the same correction two different ways, one of them
   malformed money, undoes the point of disclosing it. */
const guardVal = (g, which) => g.unit === "$" ? "$" + g[which] : `${g[which]}${g.unit}`;

const CURVE = { mild: { label: "Mild", c: 0.08, note: "Easy volume leaves; residual voice AHT rises slightly." }, moderate: { label: "Moderate", c: 0.15, note: "Typical support environment." }, severe: { label: "Severe", c: 0.30, note: "Remaining voice work becomes materially harder." } };
const RISKS = [
  { k: "riskComplaint", label: "High complaint sensitivity" },
  { k: "riskRegulated", label: "Regulated / compliance" },
  { k: "riskSave", label: "Cancellation / save-risk" },
  { k: "riskVulnerable", label: "Vulnerable customers" },
  { k: "riskAuth", label: "Complex identity / auth" },
  { k: "riskEmotion", label: "High emotion / consequence" },
];

const DEFS = {
  loadedOH: "The multiplier that turns base wage into fully-burdened cost: benefits, payroll tax, facilities, equipment. An $18/hr agent at 1.35x costs about $24/hr loaded. Used for the cost view; savings use the lower marginal multiplier instead.",
  marginalOH: "The multiplier for the cost that actually disappears when a contact goes away: wage plus benefits, but not fixed facilities or equipment. Savings are valued on this, because freeing one contact doesn't shrink your building.",
  eligibility: "The share of voice that is structurally safe to move: simple, transactional, low-risk volume. Exclude complex, regulated, emotional, or revenue-sensitive contacts. This caps the shift so the tool never implies all voice is movable.",
  erf: "When a contact fails in the target channel and returns to voice, how much harder that recovery call is than a normal one (1.0 same, 1.2 frustrated, 1.5 complex). The bounced call always existed, so only the extra friction counts as new cost.",
  curve: "As easy volume leaves voice, the calls that remain are harder, so average voice handle time rises. Mild / Moderate / Severe sets how much. Because total voice minutes are fixed, choosing a curve also fixes how simple the departing calls must have been, which the tool shows you below.",
  shiftPts: "Percentage points of your TOTAL monthly contact volume that you intend to move out of voice into this channel. Shifting 10 points takes voice from 70% to 60% of the mix and this channel up by 10, so the mix still sums to 100.",
  resolution: "The share of shifted contacts that actually resolve in the target channel without bouncing back to voice. Transactional issues resolve high, complex issues low. This is the lever that decides whether a shift saves money.",
  displacement: "Of the contacts that do resolve in the target channel, the share that truly replace a voice call. The rest is new demand from people who'd never have called: real, but not a voice saving. Rarely 100%.",
  capacity: "How freed agent time becomes money. Absorbing growth banks little cash; reducing overtime or avoiding hires is finance-creditable; headcount reduction is fully cashable but riskiest. Freed capacity isn't savings until you commit to one.",
  botCost: "The per-contact fee your bot or self-service platform charges: real cash, paid on every attempt including failures. A $0 bot is almost never real and makes any shift look free.",
};

const TARGETS = [
  { key: "Chat", color: GREEN, shift: "shiftToChat", res: "resChat", disp: "dispChat", eff: (d) => n(d.chatAHT) / Math.max(0.1, n(d.chatConc)), bot: false },
  { key: "Bot", color: TEAL, shift: "shiftToBot", res: "resBot", disp: "dispBot", eff: () => 0, bot: true },
  { key: "Email", color: AMBER, shift: "shiftToEmail", res: "resEmail", disp: "dispEmail", eff: (d) => n(d.emailAHT) / Math.max(0.1, n(d.emailConc)), bot: false },
];

const BASE = {
  monthlyContacts: 100000, hourlyRate: 18, loadedOH: 1.35, marginalOH: 1.18,
  voicePct: 70, voiceAHT: 7, voiceConc: 1,
  chatPct: 15, chatAHT: 10, chatConc: 2.5,
  emailPct: 10, emailAHT: 5, emailConc: 1,
  botPct: 5, botCost: 0.50,
  eligibility: 60,
  shiftToChat: 10, shiftToBot: 10, shiftToEmail: 0,
  resChat: 85, resBot: 65, resEmail: 80,
  dispChat: 80, dispBot: 70, dispEmail: 80,
  escReturnFactor: 1.2, adverseCurve: "moderate",
  trainingPerAgent: 1500, rampWeeks: 4, validated: false,
  riskComplaint: false, riskRegulated: false, riskSave: false, riskVulnerable: false, riskAuth: false, riskEmotion: false,
};

/* Scenario contract. Module scope for stable identity across renders. */
const TOOL_ID = "channel-shift";
const ROUTE = "/tools/channel-shift";
const clone = (o) => JSON.parse(JSON.stringify(o));
const DEFAULTS = { d: BASE, mech: "hiring" };

/* The credit-class ladder, identical to the one in FCR Leakage, AI Deflection
   and Cost per Contact. Channel Shift referenced MECH[].cred zero times, so a
   scenario set to "absorb growth" (25% realization, capacity only) could print a
   Finance-grade document. mech.js is the single definition of what finance will
   credit; this tool now reads it instead of deciding for itself. */
const CRED_RANK = { none: 0, capacity: 1, finance: 2, cash: 3 };
const RANK_GRADE = (rank) => rank >= 3 ? "Finance-grade" : rank >= 2 ? "Planning-grade" : "Directional";
const GRADE_RANK = { "Directional": 1, "Planning-grade": 2, "Finance-grade": 3 };

function compute(d, mechKey) {
  /* Input integrity. Every one of the values below was silently accepted before,
     and a scenario link decodes straight into this function with no field
     validation in between, so an edited URL could print a clean, flag-free
     report off a negative contact volume, a 150% resolution rate, or a 300%
     displacement rate. Clamping alone is not a fix. A value the engine had to
     change is a value the report must disclose, or the document shows a number
     the engine never ran. `used` carries what was computed, `entered` carries
     what was asked for, and they are printed side by side. */
  const guards = [];
  const guard = (label, raw, min, max, unit) => {
    const v = n(raw);
    const c = Math.max(min, max === null ? v : Math.min(max, v));
    if (c !== v) guards.push({ label, entered: v, used: c, unit: unit || "" });
    return c;
  };
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
  const mf = MECH[mechKey].f;
  const credRank = CRED_RANK[MECH[mechKey].cred];

  const voicePct = guard("Voice mix", d.voicePct, 0, 100, "%");
  const voiceVol = monthly * voicePct / 100;
  const eligPct = guard("Eligible voice for shift", d.eligibility, 0, 100, "%");
  const eligible = voiceVol * eligPct / 100;

  const shiftPts = TARGETS.map(t => guard(t.key + " shift", d[t.shift], 0, 100, "pts"));
  const reqShift = monthly * shiftPts.reduce((a, b) => a + b, 0) / 100;
  const scaled = reqShift > eligible && reqShift > 0;
  const scale = scaled ? eligible / reqShift : 1;

  const curveKey = CURVE[d.adverseCurve] ? d.adverseCurve : "moderate";
  if (curveKey !== d.adverseCurve) guards.push({ label: "Residual complexity curve", entered: String(d.adverseCurve), used: "moderate", unit: "" });
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
  const deptImplausible = !deptImpossible && Dtot > 0 && deptEffRaw < 2;
  const deptEff = Math.max(0, deptEffRaw);

  const voiceFreedMin = Dtot * deptEff;
  const recoveryMin = Etot * deptEff * (erf - 1);     // only the EXTRA friction is new cost
  const netMin = voiceFreedMin - targetMin - recoveryMin;
  const laborCashGross = netMin * marginalPerMin;
  const laborCash = laborCashGross * mf;
  const netRealizable = laborCash - botFee;
  const gross = laborCashGross - botFee;

  const prodMin = 22 * 8 * 60 * 0.7;
  const fteFreed = netMin / prodMin;
  const chatFTEadd = Math.max(0, chatHandled * EFF.Chat / prodMin);
  /* Transition is an investment, never a rebate. Negative training or ramp inputs
     produced a negative transition cost and a NEGATIVE payback period, which reads
     on the card as paying back before you spend. */
  const trainingPerAgent = guard("Training per agent", d.trainingPerAgent, 0, null, "$");
  const rampWeeks = guard("Ramp weeks", d.rampWeeks, 0, null, "w");
  const training = chatFTEadd * trainingPerAgent;
  const ramp = chatFTEadd * (rampWeeks * 5 * 8 * hourly * loadedOH * 0.3);
  const transition = training + ramp;
  const payback = netRealizable > 0 ? transition / netRealizable : Infinity;

  return { monthly, voiceVol, eligible, eligPct, voicePct, scaled, marginalPerMin, loadedPerMin, mf, credRank, cred: MECH[mechKey].cred, ceilingGrade: RANK_GRADE(credRank), shifted, Dtot, Etot, perTarget, shiftShare, residualUplift, baseEff, residualEff, deptEff, deptEffRaw, deptImpossible, deptImplausible, netMin, laborCash, botFee, botCost, erf, curveKey, netRealizable, gross, fteFreed, training, ramp, transition, payback, guards, blocked: guards.length > 0 };
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

function buildVerdict(d, r, mechKey) {
  const pt = primaryTarget(r);
  const riskAny = RISKS.some(x => d[x.k]);
  if (!pt || r.shifted === 0) return { label: "No shift modeled", color: MUTED, detail: "Add a shift to see the channel-shift economics.", be: null, pt: null };
  const be = solveBreakEven(d, mechKey, pt);
  const curRes = pt.resPct;
  if (r.netRealizable < 0) {
    return { label: "Do not approve yet", color: RED, be, pt, curRes, detail: be == null ? `Net negative, and it never breaks even within range. Even perfect ${pt.key.toLowerCase()} resolution can't offset the bot fees, displacement loss, and transition. Rework the plan.` : `Breaks even at ${be.toFixed(0)}% ${pt.key.toLowerCase()} resolution; you're at ${curRes}% (${(be - curRes).toFixed(0)} pts short). Fix resolution before shifting.` };
  }
  if (riskAny) return { label: "Approve only with pilot", color: AMBER, be, pt, curRes, detail: `Net positive, but you've flagged CX/risk-sensitive volume. Require a pilot to validate resolution and CSAT before full rollout. Cost-positive is not the same as safe.` };
  if (be != null && be < 1) return { label: "Approve", color: GREEN, be, pt, curRes, detail: `Net positive, but break-even resolves to ~0%, which usually means your bot cost or return-factor assumptions are too generous. Verify those before treating this as a clean approval.` };
  return { label: "Approve", color: GREEN, be, pt, curRes, detail: `Net positive at ${curRes}% ${pt.key.toLowerCase()} resolution${be != null ? ` (break-even ${be.toFixed(0)}%)` : ""}. The shift clears its bar.` };
}

function buildAnalystRead(d, r, mechKey, verdict) {
  const out = [];
  out.push(`Of ${Math.round(r.voiceVol).toLocaleString()} voice contacts, only ${Math.round(r.eligible).toLocaleString()} (${r.eligPct}%) are structurally eligible to shift. Within that, ${Math.round(r.shifted).toLocaleString()} are shifted, but the number that matters is ${Math.round(r.Dtot).toLocaleString()}: the contacts that both resolve in the target channel and actually replace a voice call. That's the real shift, not the headline percentage.`);

  out.push(`${Math.round(r.Etot).toLocaleString()} contacts don't resolve and bounce back to voice. Critically, those were always going to be voice calls, so only the extra friction of a frustrated re-contact (your ${r.erf}x return factor) is new cost, not the whole call. And displacement matters: digital adoption that doesn't pull a customer out of the voice queue is new demand, not savings, which is why this nets to ${fmtK(r.netRealizable)}/mo, not the gross.`);

  if (verdict.be != null && verdict.pt) out.push(`Decision threshold: this shift breaks even at ${verdict.be.toFixed(0)}% ${verdict.pt.key.toLowerCase()} resolution. You're modeling ${verdict.curRes}%. ${verdict.curRes >= verdict.be ? "You clear it, but validate that resolution rate against real deflection data before committing." : "You're below it. Fixing resolution comes before shifting, not after."}`);

  out.push(`Freed voice time is capacity, not cash. The realizable figure assumes ${MECH[mechKey].label}${mechKey !== "none" ? ` (${Math.round(r.mf * 100)}%)` : ""}; bot platform fees (${fmtK(r.botFee)}/mo) are real cash and netted in full. Residual voice runs ${(r.residualUplift * 100).toFixed(1)}% harder under your ${CURVE[r.curveKey].label.toLowerCase()} complexity curve: the agents left on voice are working your hardest demand.`);
  if (r.Dtot > 0) out.push(`Check this assumption before you trust the number. Holding total voice minutes constant, a ${(r.residualUplift * 100).toFixed(1)}% residual uplift means the ${Math.round(r.Dtot).toLocaleString()} contacts you displace must average ${r.deptEff.toFixed(1)} minutes against your ${r.baseEff.toFixed(1)} minute voice baseline. If the volume you plan to shift is not meaningfully simpler than that, your complexity curve is set too high and this case is understated. If it is far simpler, the curve is set too low and the case is overstated.`);

  out.push(`This is the operating-capacity question only. It does not value what those interactions are worth to the business. That's Return per Contact. And the full investment case (ramp timing, phasing, approval packaging) belongs in Business Case Builder; this exports the headline.`);
  return out;
}
/* @engine-end */

function Nav() {
  return <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>;
}
export default function ChannelShiftModel() {
  const [d, setD] = useState(() => clone(DEFAULTS.d));
  const [mech, setMech] = useState(DEFAULTS.mech);
  const [pulled, setPulled] = useState({});
  const [pullSources, setPullSources] = useState([]);
  const [extSourced, setExtSourced] = useState(false);
  const [fromLink, setFromLink] = useState(false);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const toggle = (k) => setD(prev => ({ ...prev, [k]: !prev[k] }));
  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    // A scenario link is a deliberate act and outranks the ambient cross-tool pull.
    const sc = readScenario(TOOL_ID, DEFAULTS);
    if (sc) { setD(sc.d); setMech(sc.mech); setFromLink(true); clearScenarioParam(); return; }

    const next = {}, got = {}, srcOf = {};
    /* Keys stay as string literals at the call site. rail-audit.mjs finds pulls by
       matching a literal argument against the accessor name; hiding the key behind
       a variable would remove this tool from the static audit without failing it. */
    const take = (res, field, xform) => {
      if (res.value == null || isNaN(res.value)) return false;
      next[field] = xform(res.value);
      if (res.sourceTool && res.sourceTool !== TOOL_ID) { got[field] = true; srcOf[field] = res.sourceTool; }
      return true;
    };
    if (!take(getPrimitiveWithSource("monthlyContacts"), "monthlyContacts", (v) => Math.round(v)))
      take(getPrimitiveWithSource("annualContacts"), "monthlyContacts", (v) => Math.round(v / 12));
    take(getPrimitiveWithSource("agentHourly"), "hourlyRate", (v) => v);
    // resBot is the share of BOT-ROUTED volume that resolves. That is botResolutionRate,
    // not realisticDeflectionRate (which is a share of TOTAL demand and is always lower).
    // Feeding the total-demand rate here under-credited every shift. Fixed 22 Jul 2026.
    take(getPrimitiveWithSource("botResolutionRate"), "resBot", (v) => Math.round(v <= 1 ? v * 100 : v));
    if (Object.keys(next).length) setD(prev => ({ ...prev, ...next }));
    if (Object.keys(got).length) { setPulled(got); setPullSources([...new Set(Object.values(srcOf))]); }

    /* Captured once, at mount, BEFORE this tool publishes. Calling sourcedExternally
       at render time would always be false, because by then this tool's own publish
       has stamped itself as the source of every key it touches. A value you
       published is not a value you sourced. */
    setExtSourced(sourcedExternally(["monthlyContacts", "agentHourly"], TOOL_ID));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const r = compute(d, mech);
  const verdict = buildVerdict(d, r, mech);
  /* Guarded points, so the copy below cannot describe a shift the engine refused to run. */
  const shiftPts = r.perTarget.reduce((a, t) => a + t.shiftPts, 0);
  const analyst = buildAnalystRead(d, r, mech, verdict);

  /* EVIDENCE is what the inputs earn. The old gate accepted `mechSelected` alone,
     and the mechanism defaults to "avoid hiring" on first paint, so an untouched
     tool full of invented defaults presented as Planning-grade and the Directional
     tier was unreachable in practice. Selecting the default is not rigor.

     CREDIT CLASS is what finance will actually credit, and it comes from mech.js,
     not from here. Absorbing growth is capacity, not cash, and cannot produce a
     Finance-grade document however well sourced the inputs are.

     The report takes the LOWER of the two, and says which one bound it. */
  const sourced = extSourced;
  const mechSelected = mech !== "none";
  const evidenceGrade = (sourced && d.validated) ? "Finance-grade" : (sourced || d.validated) ? "Planning-grade" : "Directional";
  const grade = GRADE_RANK[evidenceGrade] <= GRADE_RANK[r.ceilingGrade] ? evidenceGrade : r.ceilingGrade;
  const boundBy = GRADE_RANK[evidenceGrade] <= GRADE_RANK[r.ceilingGrade] ? "evidence" : "credit class";
  const gradeColor = grade === "Finance-grade" ? GREEN : grade === "Planning-grade" ? AMBER : MUTED;
  const gradeWhy = boundBy === "credit class"
    ? `capped by capacity action: ${MECH[mech].label} is credited as ${r.cred}, not cash`
    : grade === "Finance-grade" ? "volume and rate basis sourced externally, eligibility and resolution validated, action is cash-creditable"
    : grade === "Planning-grade" ? (sourced ? "volume and rate basis sourced externally, assumptions not yet validated" : "assumptions validated, volume and rate basis not sourced externally")
    : (mechSelected ? "default inputs: source the volume and rate basis, or validate eligibility, displacement and resolution" : "no capacity action selected");

  const mixTotal = n(d.voicePct) + n(d.chatPct) + n(d.emailPct) + n(d.botPct);
  const riskAny = RISKS.some(x => d[x.k]);
  const flags = [];
  /* Corrections lead. A reader who scrolls past the first block should not find
     out three sections later that the engine ran on different numbers than the
     ones they typed. */
  for (const g of r.guards) flags.push({ sev: "warn", t: `${g.label}: you entered ${guardVal(g, "entered")}, which is outside the possible range. Every figure in this report was computed at ${guardVal(g, "used")}. Correct the input or treat the output as void.` });
  if (mixTotal !== 100) flags.push({ sev: "warn", t: `Current channel mix sums to ${mixTotal}%, not 100%. Fix the mix or every number is off.` });
  if (r.scaled) flags.push({ sev: "warn", t: `Requested shift exceeds eligible voice (${r.eligPct}% of voice = ${Math.round(r.eligible).toLocaleString()}). Shifts were scaled to fit. You can't move volume that isn't structurally eligible.` });
  if (verdict.be != null && verdict.pt) flags.push({ sev: verdict.curRes >= verdict.be ? "info" : "warn", t: `Break-even ${verdict.pt.key.toLowerCase()} resolution is ${verdict.be.toFixed(0)}%; you're modeling ${verdict.curRes}%${verdict.curRes >= verdict.be ? ", clears it." : `, ${(verdict.be - verdict.curRes).toFixed(0)} pts short.`}` });
  if (r.netRealizable < 0) flags.push({ sev: "warn", t: `Net negative (${fmtK(r.netRealizable)}/mo). Escalations, displacement loss, and bot fees outweigh the freed voice capacity. You're moving the wrong volume or the resolution rate is too low.` });
  if (riskAny && r.netRealizable >= 0) flags.push({ sev: "warn", t: `Cost-positive, but you've flagged CX/risk-sensitive volume (${RISKS.filter(x => d[x.k]).map(x => x.label).join(", ")}). Require pilot validation before approval. This tool prices capacity, not customer harm.` });
  r.perTarget.forEach(t => { if (t.shiftPts > 0 && t.dispPct >= 100) flags.push({ sev: "info", t: `${t.key} displacement at 100% assumes every adopted contact replaces a voice call. Digital channels usually generate some new demand. 70-85% is more defensible.` }); });
  if (n(d.shiftToBot) > 0 && r.botCost <= 0.10) flags.push({ sev: "warn", t: `Bot cost is ${money(r.botCost)}, near-free. Real bots carry per-resolution or platform fees; a $0 bot makes any shift look costless and drives break-even toward 0%. Set a realistic per-contact cost.` });
  if (verdict.be != null && verdict.be < 1 && r.netRealizable > 0 && r.shifted > 0) flags.push({ sev: "warn", t: "Break-even resolves to ~0%. The shift looks profitable at any resolution. That usually means the bot cost or escalation return factor is too generous, not that the shift is risk-free. Sanity-check those before approving." });
  if (mech === "none") flags.push({ sev: "warn", t: "No capacity action selected: freed-labor value is $0. Pick a mechanism before presenting any savings number." });
  if (r.deptImpossible) flags.push({ sev: "warn", t: `Impossible assumption. A ${(r.residualUplift * 100).toFixed(1)}% residual uplift on this much displaced volume implies the departing calls took zero or negative time. Freed minutes were clamped to zero. Lower the complexity curve or reduce the shift.` });
  else if (r.deptImplausible) flags.push({ sev: "warn", t: `Your ${CURVE[r.curveKey].label.toLowerCase()} curve implies the displaced contacts average ${r.deptEffRaw.toFixed(1)} minutes against a ${r.baseEff.toFixed(1)} minute voice baseline. That is close to zero handle time. The curve is almost certainly too severe for the volume being moved.` });
  else if (r.Dtot > 0) flags.push({ sev: "info", t: `Implied assumption: the ${Math.round(r.Dtot).toLocaleString()} displaced contacts average ${r.deptEff.toFixed(1)} minutes against your ${r.baseEff.toFixed(1)} minute voice baseline, and the voice work left behind rises to ${r.residualEff.toFixed(1)} minutes. Total voice minutes are unchanged. If the volume you are shifting is not that much simpler, lower the curve.` });

  useEffect(() => {
    publishToolResult("channel-shift", normalizeForPublish({
      channelShiftNetRealizableMonthly: Math.round(r.netRealizable), channelShiftNetRealizableAnnual: Math.round(r.netRealizable * 12),
      channelShiftGrossMonthly: Math.round(r.gross), channelShiftDisplacedVoice: Math.round(r.Dtot), channelShiftBouncedMonthly: Math.round(r.Etot),
      channelShiftFteFreed: +r.fteFreed.toFixed(1), channelShiftTransition: Math.round(r.transition),
      channelShiftPaybackMonths: isFinite(r.payback) ? +r.payback.toFixed(1) : null, channelShiftBreakEvenRes: verdict.be != null ? +verdict.be.toFixed(0) : null,
      capacityAction: mech, grade, analystRead: analyst[0],
    }, { sourceTool: "channel-shift" }).clean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d, mech]);

  /* Exact input set the scenario link carries. */
  const scenario = { d, mech };


  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh" }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:${FONT};background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}select,input,button{font-family:inherit}@media(max-width:760px){.cg{grid-template-columns:1fr 1fr!important}.s4{grid-template-columns:1fr 1fr!important}.s3{grid-template-columns:1fr!important}}`}</style>
      <Nav />

      <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "52px 28px 32px" }}>
        <div style={WRAP}>
          <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Cost + Economics</span>
          <h1 style={{ ...TYPE.display, color: "#fff", margin: "0 0 12px" }}>Channel Shift Economics</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: 700 }}>Channel shift only creates value when eligible demand resolves in the target channel at a rate high enough to offset failure, escalation, residual voice complexity, transition cost, and capacity realization. This model does not assume digital adoption equals savings. It separates shifted, resolved, displaced, and finance-realizable volume.</p>
          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {Object.keys(pulled).length > 0 && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,136,221,0.12)", border: `1px solid ${ELECTRIC}40`, borderRadius: 8, padding: "8px 14px" }}>
                <span style={{ ...TYPE.caption, fontSize: 12, color: "#fff", fontWeight: W.semibold }}>Prefilled {Object.keys(pulled).length} value{Object.keys(pulled).length > 1 ? "s" : ""} from {pullSources.length ? pullSources.join(", ") : "a previous tool"}.</span>
              </div>
            )}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "8px 14px" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: gradeColor }} />
              <span style={{ ...TYPE.caption, fontSize: 12, color: "#fff", fontWeight: W.semibold }}>{grade}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{gradeWhy}</span>
            </div>
          </div>
        </div>
      </section>

      {/* VERDICT */}
      <section style={{ background: `${verdict.color}0A`, borderBottom: `2px solid ${verdict.color}`, padding: "20px 28px" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <div style={{ flex: "0 0 auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minWidth: 150, padding: "10px 18px", background: "#fff", border: `1px solid ${verdict.color}`, borderRadius: 10 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 1, textTransform: "uppercase" }}>Verdict</span>
            <span style={{ fontSize: 17, fontWeight: 700, color: verdict.color, textAlign: "center", lineHeight: 1.2 }}>{verdict.label}</span>
          </div>
          <div style={{ flex: "1 1 360px" }}>
            <div style={{ fontSize: 13.5, color: SLATE, lineHeight: 1.5 }}>{verdict.detail}</div>
            {verdict.be != null && verdict.pt && (
              <div style={{ display: "flex", gap: 20, marginTop: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: MUTED }}>Current {verdict.pt.key.toLowerCase()} res: <strong style={{ color: NAVY }}>{verdict.curRes}%</strong></span>
                <span style={{ fontSize: 12, color: MUTED }}>Break-even: <strong style={{ color: verdict.color }}>{verdict.be.toFixed(0)}%</strong></span>
                <span style={{ fontSize: 12, color: MUTED }}>Net realizable: <strong style={{ color: r.netRealizable >= 0 ? GREEN : RED }}>{fmtK(r.netRealizable)}/mo</strong></span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section style={{ background: WARM, padding: "28px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <div style={{ fontSize: 12, fontWeight: 700, color: SLATE, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Environment</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }} className="cg">
            <NumField label="Monthly contacts" value={d.monthlyContacts} onChange={v => set("monthlyContacts", v)} step={1000} min={0} pulled={pulled.monthlyContacts} />
            <NumField label="Agent hourly" value={d.hourlyRate} onChange={v => set("hourlyRate", v)} prefix="$" suffix="/hr" step={0.5} min={0} pulled={pulled.hourlyRate} />
            <NumField label="Loaded overhead" value={d.loadedOH} onChange={v => set("loadedOH", v)} suffix="x" step={0.05} min={1} info={DEFS.loadedOH} infoTitle="Loaded overhead" />
            <NumField label="Marginal overhead" value={d.marginalOH} onChange={v => set("marginalOH", v)} suffix="x" step={0.02} min={1} hint="Savings basis" info={DEFS.marginalOH} infoTitle="Marginal overhead" infoAlign="right" />
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: SLATE, letterSpacing: 1, textTransform: "uppercase", margin: "18px 0 12px" }}>Current mix <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0, color: mixTotal === 100 ? MUTED : RED }}>· {mixTotal}%</span> &amp; handle</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }} className="cg">
            <NumField label="Voice %" value={d.voicePct} onChange={v => set("voicePct", v)} suffix="%" step={1} min={0} max={100} />
            <NumField label="Chat %" value={d.chatPct} onChange={v => set("chatPct", v)} suffix="%" step={1} min={0} max={100} />
            <NumField label="Email %" value={d.emailPct} onChange={v => set("emailPct", v)} suffix="%" step={1} min={0} max={100} />
            <NumField label="Bot %" value={d.botPct} onChange={v => set("botPct", v)} suffix="%" step={1} min={0} max={100} />
            <NumField label="Voice AHT" value={d.voiceAHT} onChange={v => set("voiceAHT", v)} suffix="min" step={0.5} min={0} />
            <NumField label="Chat AHT / conc" value={d.chatAHT} onChange={v => set("chatAHT", v)} suffix="min" step={0.5} min={0} hint={`conc ${d.chatConc}x`} />
            <NumField label="Email AHT" value={d.emailAHT} onChange={v => set("emailAHT", v)} suffix="min" step={0.5} min={0} />
            <NumField label="Bot cost / contact" value={d.botCost} onChange={v => set("botCost", v)} prefix="$" step={0.05} min={0} info={DEFS.botCost} infoTitle="Bot cost / contact" infoAlign="right" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, margin: "18px 0 0" }} className="s3">
            <NumField label="Eligible voice for shift" value={d.eligibility} onChange={v => set("eligibility", v)} suffix="%" step={5} min={0} max={100} hint="Structurally shiftable, exclude complex/regulated/emotional volume" info={DEFS.eligibility} infoTitle="Eligible voice for shift" />
            <NumField label="Escalation return factor" value={d.escReturnFactor} onChange={v => set("escReturnFactor", v)} suffix="x" step={0.1} min={1} hint="Re-contact friction: 1.0 same as a direct call, 1.2 frustrated, 1.5 complex recovery" info={DEFS.erf} infoTitle="Escalation return factor" />
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: NAVY, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>Residual complexity curve<InfoDot text={DEFS.curve} title="Residual complexity curve" align="right" /></label>
              <div style={{ display: "flex", gap: 4, background: "#fff", padding: 3, borderRadius: 7, border: `1px solid ${BORDER}` }}>
                {Object.entries(CURVE).map(([k, v]) => <button key={k} onClick={() => set("adverseCurve", k)} style={{ flex: 1, fontSize: 11, fontWeight: 600, padding: "7px 4px", borderRadius: 5, border: "none", cursor: "pointer", background: d.adverseCurve === k ? ELECTRIC : "transparent", color: d.adverseCurve === k ? "#fff" : SLATE }}>{v.label}</button>)}
              </div>
              <span style={{ fontSize: 10.5, color: MUTED, marginTop: 2, display: "block" }}>{CURVE[r.curveKey].note}</span>
            </div>
          </div>

          {r.Dtot > 0 && (
            <div style={{
              marginTop: 14, background: "#fff", borderRadius: 8, padding: "14px 16px",
              border: `1px solid ${r.deptImpossible || r.deptImplausible ? RED : BORDER}`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: r.deptImpossible || r.deptImplausible ? RED : SLATE, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>
                What this curve is actually claiming
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 22, alignItems: "flex-end" }}>
                <div>
                  <div style={{ fontSize: 19, fontWeight: 700, color: NAVY }}>{r.baseEff.toFixed(1)}<span style={{ fontSize: 12, fontWeight: 500, color: MUTED }}> min</span></div>
                  <div style={{ fontSize: 10.5, color: MUTED }}>Voice baseline today</div>
                </div>
                <div style={{ fontSize: 15, color: MUTED, paddingBottom: 4 }}>&rarr;</div>
                <div>
                  <div style={{ fontSize: 19, fontWeight: 700, color: r.deptImpossible || r.deptImplausible ? RED : ELECTRIC }}>
                    {r.deptEffRaw.toFixed(1)}<span style={{ fontSize: 12, fontWeight: 500, color: MUTED }}> min</span>
                  </div>
                  <div style={{ fontSize: 10.5, color: MUTED }}>Implied AHT of the calls you displace</div>
                </div>
                <div>
                  <div style={{ fontSize: 19, fontWeight: 700, color: AMBER }}>{r.residualEff.toFixed(1)}<span style={{ fontSize: 12, fontWeight: 500, color: MUTED }}> min</span></div>
                  <div style={{ fontSize: 10.5, color: MUTED }}>Voice left behind, {(r.residualUplift * 100).toFixed(1)}% harder</div>
                </div>
              </div>
              <p style={{ fontSize: 11, color: SLATE, lineHeight: 1.6, margin: "12px 0 0" }}>
                Total voice minutes do not change when you shift: the same calls take the same time, only fewer of them
                stay. So choosing a residual uplift also decides how simple the departing calls must have been. If the
                volume you plan to move is not around {r.deptEffRaw.toFixed(1)} minutes, this curve is the wrong one.
              </p>
            </div>
          )}

          <div style={{ fontSize: 12, fontWeight: 700, color: GREEN, letterSpacing: 1, textTransform: "uppercase", margin: "20px 0 4px" }}>Shift from voice → target</div>
          <p style={{ fontSize: 11, color: MUTED, marginBottom: 10 }}>Points are the plan. Everything under them is the discount. Resolution = share that resolves without bouncing back to voice. Displacement = share of resolved that truly replace a voice call (not new demand). Both are honest haircuts. Set them to what your data supports.</p>

          <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px", marginBottom: 12, fontSize: 11.5, color: SLATE, lineHeight: 1.6 }}>
            <strong style={{ color: NAVY }}>How to use the points.</strong> A point is one percent of your total monthly contact volume,
            moved out of voice. Voice is currently {r.voicePct}% of the mix. Shifting {shiftPts} points takes it to {Math.max(0, r.voicePct - shiftPts)}%.
            {" "}Start by asking how much voice is <em>structurally eligible</em> to move, set that above, then set points to match.
            {shiftPts > 0 && (
              <> You have requested <strong>{Math.round(r.monthly * shiftPts / 100).toLocaleString()}</strong> contacts against an eligible pool of{" "}
              <strong>{Math.round(r.eligible).toLocaleString()}</strong>.{r.scaled ? " That exceeds the pool, so the shift was scaled down to fit." : " That fits."}</>
            )}
            {shiftPts > r.voicePct && <span style={{ color: RED, fontWeight: 600 }}> You are asking to move more volume than exists in voice.</span>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="s3">
            {TARGETS.map(tc => { const t = tc.key, color = tc.color; return (
              <div key={t} style={{ background: "#fff", border: `1px solid ${color}40`, borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 8 }}>&rarr; {t === "Bot" ? "Bot / Self-Service" : t}</div>
                <NumField compact label="Shift" value={d["shiftTo" + t]} onChange={v => set("shiftTo" + t, v)} suffix="pts" step={1} min={0} max={100} hint="pts of total volume" info={DEFS.shiftPts} infoTitle="Shift points" />
                <div style={{ height: 6 }} />
                <NumField compact label="Resolution rate" value={d["res" + t]} onChange={v => set("res" + t, v)} suffix="%" step={1} min={0} max={100} pulled={t === "Bot" && pulled.resBot} hint={t === "Bot" && pulled.resBot ? "from AI Deflection" : "resolves without bouncing"} info={DEFS.resolution} infoTitle="Resolution rate" />
                <div style={{ height: 6 }} />
                <NumField compact label="Displacement" value={d["disp" + t]} onChange={v => set("disp" + t, v)} suffix="%" step={1} min={0} max={100} hint="% that truly replace a voice call" info={DEFS.displacement} infoTitle="Displacement" />
              </div>
            ); })}
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "32px 28px" }}>
        <div style={WRAP}>
          {/* Capacity action + risk guardrails */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }} className="cg">
            <div style={{ background: WARM, border: `1px solid ${mech === "none" ? AMBER : BORDER}`, borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>Capacity action<InfoDot text={DEFS.capacity} title="Capacity action" /></div>
              <div style={{ fontSize: 12, color: mech === "none" ? AMBER : MUTED, marginBottom: 10 }}>{MECH[mech].note}</div>
              <select value={mech} onChange={e => setMech(e.target.value)} style={{ width: "100%", fontSize: 13, fontWeight: 600, padding: "9px 12px", borderRadius: 7, border: `1px solid ${BORDER}`, background: "#fff", color: NAVY, cursor: "pointer" }}>
                {MECH_ORDER.map(k => <option key={k} value={k}>{MECH[k].label}{k !== "none" ? `  (${Math.round(MECH[k].f * 100)}%)` : ""}</option>)}
              </select>
            </div>
            <div style={{ background: WARM, border: `1px solid ${riskAny ? AMBER : BORDER}`, borderRadius: 10, padding: "14px 18px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Risk guardrails <span style={{ fontWeight: 400, color: MUTED }}>· flags CX-sensitive volume</span></div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {RISKS.map(rk => (
                  <label key={rk.k} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 11.5, color: SLATE }}>
                    <input type="checkbox" checked={d[rk.k]} onChange={() => toggle(rk.k)} style={{ width: 13, height: 13, accentColor: AMBER }} />{rk.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 24 }} className="s4">
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: r.netRealizable >= 0 ? GREEN : RED, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Net Realizable</div>
              <div style={{ ...TYPE.statValue, color: "#fff" }}>{fmtK(r.netRealizable)}<span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>/mo</span></div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)" }}>{r.netRealizable >= 0 ? `${fmtK(r.netRealizable * 12)}/yr` : "net cost"}</div>
            </div>
            <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: MUTED, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Voice Displaced</div>
              <div style={{ ...TYPE.statValue, color: GREEN }}>{Math.round(r.Dtot).toLocaleString()}</div>
              <div style={{ fontSize: 10.5, color: MUTED }}>truly leave voice/mo</div>
            </div>
            <div style={{ background: WARM, border: `1px solid ${AMBER}`, borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: MUTED, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Bounced to Voice</div>
              <div style={{ ...TYPE.statValue, color: AMBER }}>{Math.round(r.Etot).toLocaleString()}</div>
              <div style={{ fontSize: 10.5, color: MUTED }}>failed in channel/mo</div>
            </div>
            <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: MUTED, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Voice FTE Freed</div>
              <div style={{ ...TYPE.statValue, color: r.fteFreed >= 0 ? GREEN : RED }}>{r.fteFreed.toFixed(1)}</div>
              <div style={{ fontSize: 10.5, color: MUTED }}>net capacity</div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: SLATE, marginBottom: 24, background: `${ELECTRIC}06`, border: `1px solid ${ELECTRIC}20`, borderRadius: 8, padding: "10px 14px", lineHeight: 1.5 }}>
            <strong>{Math.round(r.shifted).toLocaleString()} shifted</strong> → {Math.round(r.Dtot).toLocaleString()} displace voice, {Math.round(r.Etot).toLocaleString()} bounce back. Net <strong>{Math.round(r.netMin).toLocaleString()} agent-min/mo</strong> freed → {fmtK(r.laborCash)} realized labor − {fmtK(r.botFee)} bot fees = <strong>{fmtK(r.netRealizable)}/mo</strong>.
          </p>

          {/* Integrity */}
          <div style={{ border: `1px solid ${flags.some(f => f.sev === "warn") ? AMBER : BORDER}`, borderRadius: 12, padding: "16px 20px", marginBottom: 24, background: flags.some(f => f.sev === "warn") ? `${AMBER}06` : WARM }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: flags.some(f => f.sev === "warn") ? AMBER : GREEN, letterSpacing: 1, textTransform: "uppercase", marginBottom: flags.length ? 10 : 0 }}>{flags.length ? "⚠ Integrity checks" : "✓ Integrity checks passed"}</div>
            {flags.map((f, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginTop: i ? 8 : 0 }}>
                <span style={{ color: f.sev === "warn" ? AMBER : ELECTRIC, fontWeight: 700, fontSize: 13 }}>{f.sev === "warn" ? "!" : "i"}</span>
                <span style={{ fontSize: 12.5, color: SLATE, lineHeight: 1.5 }}>{f.t}</span>
              </div>
            ))}
            {!flags.length && <span style={{ fontSize: 12.5, color: SLATE }}>Mix at 100%, shift within eligible volume, above break-even, capacity action set, no risk-sensitive volume flagged.</span>}
          </div>

          {/* Shift detail */}
          <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Shift Detail by Target</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }} className="s3">
            {r.perTarget.filter(t => t.S > 0).map((t, i) => (
              <div key={i} style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.color, marginBottom: 8 }}>{t.key === "Bot" ? "Bot" : t.key}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11 }}>
                  <div><span style={{ color: MUTED }}>Shifted</span><div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{Math.round(t.S).toLocaleString()}</div></div>
                  <div><span style={{ color: MUTED }}>Displaced</span><div style={{ fontSize: 14, fontWeight: 600, color: GREEN }}>{Math.round(t.D).toLocaleString()}</div></div>
                  <div><span style={{ color: MUTED }}>Bounced</span><div style={{ fontSize: 14, fontWeight: 600, color: AMBER }}>{Math.round(t.E).toLocaleString()}</div></div>
                  <div><span style={{ color: MUTED }}>Incremental</span><div style={{ fontSize: 14, fontWeight: 600, color: MUTED }}>{Math.round(t.incremental).toLocaleString()}</div></div>
                </div>
              </div>
            ))}
            {r.perTarget.every(t => t.S === 0) && <div style={{ fontSize: 12, color: MUTED }}>No shift modeled yet.</div>}
          </div>

          {/* Transition */}
          <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Transition Investment</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28 }} className="s3">
            <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px", textAlign: "center" }}><div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Chat reskilling</div><div style={{ fontSize: 20, fontWeight: 600, color: NAVY }}>{fmtK(r.training)}</div></div>
            <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px", textAlign: "center" }}><div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Ramp productivity loss</div><div style={{ fontSize: 20, fontWeight: 600, color: NAVY }}>{fmtK(r.ramp)}</div></div>
            <div style={{ background: WARM, border: `1px solid ${isFinite(r.payback) && r.payback <= 12 ? GREEN : AMBER}`, borderRadius: 10, padding: "16px", textAlign: "center" }}><div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Payback (headline)</div><div style={{ fontSize: 20, fontWeight: 600, color: isFinite(r.payback) && r.payback <= 12 ? GREEN : AMBER }}>{isFinite(r.payback) ? r.payback.toFixed(1) + " mo" : "Never"}</div></div>
          </div>

          {/* Analyst */}
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderLeft: `3px solid ${ELECTRIC}`, borderRadius: 12, padding: "20px 22px", marginBottom: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: ELECTRIC, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Analyst Read · shift resolvable volume, not all volume</div>
            {analyst.map((t, i) => <p key={i} style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: i ? "8px 0 0" : 0 }}>{t}</p>)}
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 8 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={d.validated} onChange={e => set("validated", e.target.checked)} style={{ width: 14, height: 14, accentColor: ELECTRIC }} />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: NAVY }}>Eligibility, displacement &amp; resolution validated from data (required for Finance-grade)</span>
            </label>
          </div>

          <ReportActions
            toolId={TOOL_ID}
            toolName="Channel Shift Economics"
            subtitle={`Voice → digital · ${verdict.label} · ${grade}`}
            routePath={ROUTE}
            state={scenario}
            defaults={DEFAULTS}
            confidence={grade}
            summary={[
              { label: "Net realizable monthly", value: fmtK(r.netRealizable) },
              { label: "Verdict", value: verdict.label },
              { label: "Break-even", value: verdict.be != null ? verdict.be.toFixed(0) + "%" : "n/a" },
            ]}
            signals={{
              capacity_action: MECH[mech].label,
              eligibility_pct: r.eligPct + "%",
              inputs_corrected: r.guards.length,
              grade_bound_by: boundBy,
              cost_validated: d.validated ? "yes" : "no",
              adverse_curve: d.adverseCurve,
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
              { title: "Adverse Selection (implied, not assumed twice)", type: "table", rows: [
                ["Voice AHT baseline", r.baseEff.toFixed(1) + " min"],
                [`Residual voice AHT after shift (${(r.residualUplift * 100).toFixed(1)}% uplift)`, r.residualEff.toFixed(1) + " min"],
                ["Implied AHT of displaced contacts", r.deptEff.toFixed(1) + " min"],
                ["Total voice minutes before and after", Math.round(r.voiceVol * r.baseEff).toLocaleString() + " (conserved)"],
              ]},
              { title: "Economics", type: "table", rows: [
                ["Net agent-minutes freed/mo", Math.round(r.netMin).toLocaleString()],
                [`Realized labor (${MECH[mech].label}, ${Math.round(r.mf * 100)}%)`, fmtK(r.laborCash) + "/mo"],
                ["Bot platform fees (real cash)", fmtK(-r.botFee) + "/mo"],
                ["Net realizable", fmtK(r.netRealizable) + "/mo"],
                ["Transition (one-time)", fmtK(r.transition)],
                ["Payback", isFinite(r.payback) ? r.payback.toFixed(1) + " months" : "Does not pay back"],
              ]},
              ...(r.guards.length ? [{ title: "⚠ Inputs Corrected Before Calculation", type: "findings", items: r.guards.map(g => `${g.label}: entered ${guardVal(g, "entered")}, computed at ${guardVal(g, "used")}.`) }] : []),
              ...(flags.length ? [{ title: "Integrity Checks", type: "findings", items: flags.map(f => f.t) }] : []),
              { title: "Analyst Read", type: "findings", items: analyst },
              { title: "Methodology", type: "text", content: `Only the eligible portion of voice (${r.eligPct}%) can shift. Each shifted contact resolves at the target resolution rate; failures bounce back to voice and add only the extra friction of re-contact (escalation return factor ${r.erf}x minus 1), since the base call always existed. Of resolved contacts, only the displacement share truly replaces a voice call. The rest is new demand, excluded from savings. Economics run on net agent-minutes freed (voice freed minus chat/email consumed minus recovery friction) valued at marginal labor and scaled by the ${MECH[mech].label} capacity action (${Math.round(r.mf * 100)}%); bot platform fees are real cash, netted in full. Adverse selection is anchored on the residual: under the ${CURVE[r.curveKey].label} complexity curve, voice AHT for the calls left behind rises ${(r.residualUplift * 100).toFixed(1)}% to ${r.residualEff.toFixed(1)} minutes. Total voice minutes are conserved, since shifting changes which calls remain, not how long any call takes. That conservation fixes the implied AHT of the displaced contacts at ${r.deptEff.toFixed(1)} minutes against a ${r.baseEff.toFixed(1)} minute baseline. The tool never sets both ends independently, because that would count the same effect twice and overstate freed capacity. Break-even is the target resolution rate at which net realizable crosses zero. Report grade: ${grade}, ${gradeWhy}.${r.guards.length ? ` INPUTS CORRECTED: ${r.guards.map(g => `${g.label} entered ${guardVal(g, "entered")}, computed at ${guardVal(g, "used")}`).join("; ")}. Every figure above was computed on the corrected values.` : ""} This is an operating-capacity model, not a value or full-investment model.` },
              { title: "Next Steps", type: "next", items: [
                { tool: "AI Deflection Reality Check", reason: "Validate the bot resolution rate this decision rests on", href: "/tools/ai-deflection" },
                { tool: "Business Case Builder", reason: "Build the full investment case: ramp, phasing, approval packaging", href: "/tools/business-case" },
                { tool: "Staffing Calculator", reason: "Re-staff voice and chat for the post-shift mix", href: "/tools/staffing-calculator" },
              ]},
            ]}
          />

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginTop: 20 }}>
            <a href="/tools/ai-deflection" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>AI Deflection →</a>
          </div>
        </div>
      </section>
    </div>
  );
}
