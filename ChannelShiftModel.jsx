import { useState, useEffect, useRef } from "react";
import ReportExport from "./ReportExport";
import { COLORS } from "./src/lib/benchmarks";
import { publishToolResult, getPrimitive } from "./src/lib/toolData";
import { normalizeForPublish } from "./src/lib/metrics";
import InfoDot from "./src/lib/InfoDot";

const NAVY = COLORS.navy, DEEP = "#061325", ELECTRIC = COLORS.electric, LIGHT = "#00AAFF";
const ICE = "#E8F4FD", WARM = "#F8FAFB", SLATE = "#3A4F6A", MUTED = COLORS.muted, BORDER = "#D8E3ED";
const GREEN = COLORS.green, AMBER = COLORS.amber, RED = COLORS.red, TEAL = "#0E9AA4";
const WRAP = { maxWidth: 960, margin: "0 auto", padding: "0 28px" };

const n = (v) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };
const money = (v) => { const x = n(v); return (x < 0 ? "-$" : "$") + Math.abs(x).toFixed(2); };
const fmtK = (v) => { const x = n(v), s = x < 0 ? "-" : ""; const a = Math.abs(x); return s + (a >= 1000000 ? "$" + (a / 1000000).toFixed(2) + "M" : a >= 1000 ? "$" + (a / 1000).toFixed(0) + "K" : "$" + Math.round(a)); };

function LogoMark({ size = 30, light = true }) {
  const a = light ? "#fff" : NAVY, x = light ? LIGHT : ELECTRIC;
  return <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light ? .6 : .3} /><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light ? .8 : .5} /><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round" /><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /></g></svg>;
}

function NumField({ label, value, onChange, hint, prefix, suffix, step = 1, min, max, factor = 1, pulled, compact, info, infoTitle, infoAlign }) {
  const fac = factor || 1;
  const toDisp = (v) => Math.round(n(v) * fac * 1000) / 1000;
  const [local, setLocal] = useState(String(toDisp(value)));
  const focusedRef = useRef(false), holdRef = useRef(null), valRef = useRef(n(value));
  valRef.current = n(value);
  useEffect(() => { if (!focusedRef.current) setLocal(String(toDisp(value))); /* eslint-disable-next-line */ }, [value]);
  const clampN = (x) => { if (min != null && x < min) x = min; if (max != null && x > max) x = max; return Math.round(x * 1000) / 1000; };
  const onType = (e) => {
    const raw = e.target.value;
    setLocal(raw);
    if (raw.trim() === "" || raw === "-" || raw === "." || raw === "-.") return;
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) onChange(parsed / fac);
  };
  const onBlurField = () => {
    focusedRef.current = false;
    const parsed = parseFloat(local);
    const clean = isNaN(parsed) ? n(value) : clampN(parsed);
    onChange(clean / fac);
    setLocal(String(clean));
  };
  const stop = () => { if (holdRef.current) { clearTimeout(holdRef.current); holdRef.current = null; } };
  const start = (dir) => {
    stop();
    const stepOnce = () => { const next = clampN(n(valRef.current) * fac + dir * step); valRef.current = next / fac; setLocal(String(next)); onChange(next / fac); };
    stepOnce();
    let delay = 300;
    const tick = () => { stepOnce(); delay = Math.max(60, delay - 25); holdRef.current = setTimeout(tick, delay); };
    holdRef.current = setTimeout(tick, delay);
  };
  const btn = { width: 20, height: 14, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", color: MUTED, cursor: "pointer", padding: 0, fontSize: 7, userSelect: "none" };
  return (
    <div>
      <label style={{ fontSize: compact ? 11 : 12, fontWeight: 600, color: NAVY, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        {label}{info && <InfoDot text={info} title={infoTitle || label} align={infoAlign} />}{pulled && <span style={{ fontSize: 9, fontWeight: 700, color: ELECTRIC, background: ICE, padding: "1px 5px", borderRadius: 4 }}>PULLED</span>}
      </label>
      <div style={{ position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: MUTED, pointerEvents: "none" }}>{prefix}</span>}
        <input type="text" inputMode="decimal" value={local}
          onFocus={e => { focusedRef.current = true; e.target.style.borderColor = ELECTRIC; }}
          onChange={onType}
          onBlur={e => { e.target.style.borderColor = BORDER; onBlurField(); }}
          style={{ width: "100%", padding: compact ? "8px 10px" : "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, paddingLeft: prefix ? 24 : (compact ? 10 : 12), paddingRight: 40, outline: "none" }} />
        {suffix && <span style={{ position: "absolute", right: 28, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: MUTED, pointerEvents: "none" }}>{suffix}</span>}
        <div style={{ position: "absolute", right: 3, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 1 }}>
          <button type="button" style={btn} onMouseDown={e => { e.preventDefault(); start(1); }} onMouseUp={stop} onMouseLeave={stop} onTouchStart={e => { e.preventDefault(); start(1); }} onTouchEnd={stop}>▲</button>
          <button type="button" style={btn} onMouseDown={e => { e.preventDefault(); start(-1); }} onMouseUp={stop} onMouseLeave={stop} onTouchStart={e => { e.preventDefault(); start(-1); }} onTouchEnd={stop}>▼</button>
        </div>
      </div>
      {hint && <span style={{ fontSize: 10.5, color: MUTED, marginTop: 2, display: "block" }}>{hint}</span>}
    </div>
  );
}

const MECH = {
  none: { label: "Not selected", f: 0.00, note: "No capacity action: freed-labor value stays $0 until you commit to one." },
  growth: { label: "Absorb growth / backlog", f: 0.25, note: "Capacity value, not cash this cycle." },
  overtime: { label: "Reduce overtime", f: 0.60, note: "Finance-creditable." },
  hiring: { label: "Avoid hiring / attrition freeze", f: 0.75, note: "Finance-creditable over the cycle. The defensible default." },
  vendor: { label: "Vendor / BPO volume reduction", f: 0.90, note: "Often highly cashable." },
  headcount: { label: "Headcount reduction", f: 1.00, note: "Fully cashable, but the highest change and CSAT risk." },
};
const MECH_ORDER = ["none", "growth", "overtime", "hiring", "vendor", "headcount"];
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
  curve: "As easy volume leaves voice, the calls that remain are harder, so average voice handle time rises. Mild / Moderate / Severe sets how much. It stops the tool assuming leftover voice work is as quick as today's blended average.",
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

function compute(d, mechKey) {
  const monthly = n(d.monthlyContacts);
  const marginalPerMin = n(d.hourlyRate) * n(d.marginalOH) / 60;
  const loadedPerMin = n(d.hourlyRate) * n(d.loadedOH) / 60;
  const mf = MECH[mechKey].f;
  const voiceVol = monthly * n(d.voicePct) / 100;
  const eligible = voiceVol * n(d.eligibility) / 100;

  const reqShift = monthly * (n(d.shiftToChat) + n(d.shiftToBot) + n(d.shiftToEmail)) / 100;
  const scaled = reqShift > eligible && reqShift > 0;
  const scale = scaled ? eligible / reqShift : 1;

  const adverseCoef = (CURVE[d.adverseCurve] || CURVE.moderate).c;
  const erf = Math.max(1, n(d.escReturnFactor)); // a failed deflection re-contact is never cheaper than the original call

  let shifted = 0, Dtot = 0, Etot = 0, targetMin = 0, botFee = 0, chatHandled = 0;
  const perTarget = TARGETS.map(t => {
    const S = monthly * n(d[t.shift]) / 100 * scale;
    const res = n(d[t.res]) / 100, disp = n(d[t.disp]) / 100;
    const E = S * (1 - res), R = S * res, D = R * disp, incremental = R * (1 - disp);
    shifted += S; Dtot += D; Etot += E;
    if (t.bot) botFee += (D + E) * n(d.botCost);
    else { targetMin += (D + E) * t.eff(d); if (t.key === "Chat") chatHandled += (D + E); }
    return { ...t, S, res: n(d[t.res]), disp: n(d[t.disp]), E, R, D, incremental };
  });

  const adverseMult = 1 + adverseCoef * (voiceVol > 0 ? shifted / voiceVol : 0);
  const voiceEff = n(d.voiceAHT) / Math.max(0.1, n(d.voiceConc)) * adverseMult;
  const voiceFreedMin = Dtot * voiceEff;
  const recoveryMin = Etot * voiceEff * (erf - 1);     // only the EXTRA friction is new cost
  const netMin = voiceFreedMin - targetMin - recoveryMin;
  const laborCashGross = netMin * marginalPerMin;
  const laborCash = laborCashGross * mf;
  const netRealizable = laborCash - botFee;
  const gross = laborCashGross - botFee;

  const prodMin = 22 * 8 * 60 * 0.7;
  const fteFreed = netMin / prodMin;
  const chatFTEadd = Math.max(0, chatHandled * (n(d.chatAHT) / Math.max(0.1, n(d.chatConc))) / prodMin);
  const training = chatFTEadd * n(d.trainingPerAgent);
  const ramp = chatFTEadd * (n(d.rampWeeks) * 5 * 8 * n(d.hourlyRate) * n(d.loadedOH) * 0.3);
  const transition = training + ramp;
  const payback = netRealizable > 0 ? transition / netRealizable : Infinity;

  return { monthly, voiceVol, eligible, scaled, marginalPerMin, loadedPerMin, mf, shifted, Dtot, Etot, perTarget, adverseMult, voiceEff, netMin, laborCash, botFee, netRealizable, gross, fteFreed, training, ramp, transition, payback };
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

function primaryTarget(d) {
  return [...TARGETS].filter(t => n(d[t.shift]) > 0).sort((a, b) => n(d[b.shift]) - n(d[a.shift]))[0] || null;
}

function buildVerdict(d, r, mechKey) {
  const pt = primaryTarget(d);
  const riskAny = RISKS.some(x => d[x.k]);
  if (!pt || r.shifted === 0) return { label: "No shift modeled", color: MUTED, detail: "Add a shift to see the channel-shift economics.", be: null, pt: null };
  const be = solveBreakEven(d, mechKey, pt);
  const curRes = n(d[pt.res]);
  if (r.netRealizable < 0) {
    return { label: "Do not approve yet", color: RED, be, pt, curRes, detail: be == null ? `Net negative, and it never breaks even within range. Even perfect ${pt.key.toLowerCase()} resolution can't offset the bot fees, displacement loss, and transition. Rework the plan.` : `Breaks even at ${be.toFixed(0)}% ${pt.key.toLowerCase()} resolution; you're at ${curRes}% (${(be - curRes).toFixed(0)} pts short). Fix resolution before shifting.` };
  }
  if (riskAny) return { label: "Approve only with pilot", color: AMBER, be, pt, curRes, detail: `Net positive, but you've flagged CX/risk-sensitive volume. Require a pilot to validate resolution and CSAT before full rollout. Cost-positive is not the same as safe.` };
  if (be != null && be < 1) return { label: "Approve", color: GREEN, be, pt, curRes, detail: `Net positive, but break-even resolves to ~0%, which usually means your bot cost or return-factor assumptions are too generous. Verify those before treating this as a clean approval.` };
  return { label: "Approve", color: GREEN, be, pt, curRes, detail: `Net positive at ${curRes}% ${pt.key.toLowerCase()} resolution${be != null ? ` (break-even ${be.toFixed(0)}%)` : ""}. The shift clears its bar.` };
}

function buildAnalystRead(d, r, mechKey, verdict) {
  const out = [];
  out.push(`Of ${Math.round(r.voiceVol).toLocaleString()} voice contacts, only ${Math.round(r.eligible).toLocaleString()} (${n(d.eligibility)}%) are structurally eligible to shift. Within that, ${Math.round(r.shifted).toLocaleString()} are shifted, but the number that matters is ${Math.round(r.Dtot).toLocaleString()}: the contacts that both resolve in the target channel and actually replace a voice call. That's the real shift, not the headline percentage.`);

  out.push(`${Math.round(r.Etot).toLocaleString()} contacts don't resolve and bounce back to voice. Critically, those were always going to be voice calls, so only the extra friction of a frustrated re-contact (your ${n(d.escReturnFactor)}x return factor) is new cost, not the whole call. And displacement matters: digital adoption that doesn't pull a customer out of the voice queue is new demand, not savings, which is why this nets to ${fmtK(r.netRealizable)}/mo, not the gross.`);

  if (verdict.be != null && verdict.pt) out.push(`Decision threshold: this shift breaks even at ${verdict.be.toFixed(0)}% ${verdict.pt.key.toLowerCase()} resolution. You're modeling ${verdict.curRes}%. ${verdict.curRes >= verdict.be ? "You clear it, but validate that resolution rate against real deflection data before committing." : "You're below it. Fixing resolution comes before shifting, not after."}`);

  out.push(`Freed voice time is capacity, not cash. The realizable figure assumes ${MECH[mechKey].label}${mechKey !== "none" ? ` (${Math.round(r.mf * 100)}%)` : ""}; bot platform fees (${fmtK(r.botFee)}/mo) are real cash and netted in full. Residual voice runs ${((r.adverseMult - 1) * 100).toFixed(0)}% harder under your ${(CURVE[d.adverseCurve] || CURVE.moderate).label.toLowerCase()} complexity curve: the agents left on voice are working your hardest demand.`);

  out.push(`This is the operating-capacity question only. It does not value what those interactions are worth to the business. That's Return per Contact. And the full investment case (ramp timing, phasing, approval packaging) belongs in Business Case Builder; this exports the headline.`);
  return out;
}

function Nav() {
  return <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>;
}
export default function ChannelShiftModel() {
  const [d, setD] = useState(BASE);
  const [mech, setMech] = useState("hiring");
  const [pulled, setPulled] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const toggle = (k) => setD(prev => ({ ...prev, [k]: !prev[k] }));
  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const next = {}, got = {};
    const mc = getPrimitive("monthlyContacts"), ac = getPrimitive("annualContacts");
    if (mc != null && !isNaN(mc)) { next.monthlyContacts = Math.round(mc); got.monthlyContacts = true; }
    else if (ac != null && !isNaN(ac)) { next.monthlyContacts = Math.round(ac / 12); got.monthlyContacts = true; }
    const ah = getPrimitive("agentHourly");
    if (ah != null && !isNaN(ah)) { next.hourlyRate = ah; got.hourlyRate = true; }
    const defl = getPrimitive("realisticDeflectionRate");
    if (defl != null && !isNaN(defl)) { next.resBot = Math.round(defl <= 1 ? defl * 100 : defl); got.resBot = true; }
    if (Object.keys(next).length) { setD(prev => ({ ...prev, ...next })); setPulled(got); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const r = compute(d, mech);
  const verdict = buildVerdict(d, r, mech);
  const analyst = buildAnalystRead(d, r, mech, verdict);

  const sourced = pulled.monthlyContacts && pulled.hourlyRate;
  const mechSelected = mech !== "none";
  const grade = (sourced && mechSelected && d.validated) ? "Finance-grade" : (sourced || mechSelected) ? "Planning-grade" : "Directional";
  const gradeColor = grade === "Finance-grade" ? GREEN : grade === "Planning-grade" ? AMBER : MUTED;

  const mixTotal = n(d.voicePct) + n(d.chatPct) + n(d.emailPct) + n(d.botPct);
  const riskAny = RISKS.some(x => d[x.k]);
  const flags = [];
  if (mixTotal !== 100) flags.push({ sev: "warn", t: `Current channel mix sums to ${mixTotal}%, not 100%. Fix the mix or every number is off.` });
  if (r.scaled) flags.push({ sev: "warn", t: `Requested shift exceeds eligible voice (${n(d.eligibility)}% of voice = ${Math.round(r.eligible).toLocaleString()}). Shifts were scaled to fit. You can't move volume that isn't structurally eligible.` });
  if (verdict.be != null && verdict.pt) flags.push({ sev: verdict.curRes >= verdict.be ? "info" : "warn", t: `Break-even ${verdict.pt.key.toLowerCase()} resolution is ${verdict.be.toFixed(0)}%; you're modeling ${verdict.curRes}%${verdict.curRes >= verdict.be ? ", clears it." : `, ${(verdict.be - verdict.curRes).toFixed(0)} pts short.`}` });
  if (r.netRealizable < 0) flags.push({ sev: "warn", t: `Net negative (${fmtK(r.netRealizable)}/mo). Escalations, displacement loss, and bot fees outweigh the freed voice capacity. You're moving the wrong volume or the resolution rate is too low.` });
  if (riskAny && r.netRealizable >= 0) flags.push({ sev: "warn", t: `Cost-positive, but you've flagged CX/risk-sensitive volume (${RISKS.filter(x => d[x.k]).map(x => x.label).join(", ")}). Require pilot validation before approval. This tool prices capacity, not customer harm.` });
  TARGETS.forEach(t => { if (n(d[t.shift]) > 0 && n(d[t.disp]) >= 100) flags.push({ sev: "info", t: `${t.key} displacement at 100% assumes every adopted contact replaces a voice call. Digital channels usually generate some new demand. 70-85% is more defensible.` }); });
  if (n(d.shiftToBot) > 0 && n(d.botCost) <= 0.10) flags.push({ sev: "warn", t: `Bot cost is ${money(n(d.botCost))}, near-free. Real bots carry per-resolution or platform fees; a $0 bot makes any shift look costless and drives break-even toward 0%. Set a realistic per-contact cost.` });
  if (verdict.be != null && verdict.be < 1 && r.netRealizable > 0 && r.shifted > 0) flags.push({ sev: "warn", t: "Break-even resolves to ~0%. The shift looks profitable at any resolution. That usually means the bot cost or escalation return factor is too generous, not that the shift is risk-free. Sanity-check those before approving." });
  if (mech === "none") flags.push({ sev: "warn", t: "No capacity action selected: freed-labor value is $0. Pick a mechanism before presenting any savings number." });

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

  const sendResults = () => {
    setSending(true);
    const body = new FormData();
    body.append("_subject", "Channel Shift Economics, Center of CX");
    body.append("source", "Channel Shift Economics");
    body.append("net_realizable_monthly", fmtK(r.netRealizable));
    body.append("verdict", verdict.label);
    body.append("break_even", verdict.be != null ? verdict.be.toFixed(0) + "%" : "n/a");
    body.append("grade", grade);
    fetch("https://formspree.io/f/maqlvwne", { method: "POST", body, headers: { Accept: "application/json" } })
      .then(res => { if (res.ok) setSent(true); setSending(false); }).catch(() => setSending(false));
  };

  const ShiftCard = ({ t, color }) => (
    <div style={{ background: "#fff", border: `1px solid ${color}40`, borderRadius: 8, padding: "12px 14px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color, marginBottom: 8 }}>→ {t === "Bot" ? "Bot / Self-Service" : t}</div>
      <NumField compact label="Shift" value={d["shiftTo" + t]} onChange={v => set("shiftTo" + t, v)} suffix="pts" step={1} min={0} max={100} />
      <div style={{ height: 6 }} />
      <NumField compact label="Resolution rate" value={d["res" + t]} onChange={v => set("res" + t, v)} suffix="%" step={1} min={0} max={100} pulled={t === "Bot" && pulled.resBot} hint={t === "Bot" && pulled.resBot ? "from AI Deflection" : "resolves without bouncing"} info={DEFS.resolution} infoTitle="Resolution rate" />
      <div style={{ height: 6 }} />
      <NumField compact label="Displacement" value={d["disp" + t]} onChange={v => set("disp" + t, v)} suffix="%" step={1} min={0} max={100} hint="% that truly replace a voice call" info={DEFS.displacement} infoTitle="Displacement" />
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:760px){.cg{grid-template-columns:1fr 1fr!important}.s4{grid-template-columns:1fr 1fr!important}.s3{grid-template-columns:1fr!important}}`}</style>
      <Nav />

      <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "52px 28px 32px" }}>
        <div style={WRAP}>
          <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Cost + Economics</span>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>Channel Shift Economics</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, maxWidth: 700 }}>Channel shift only creates value when eligible demand resolves in the target channel at a rate high enough to offset failure, escalation, residual voice complexity, transition cost, and capacity realization. This model does not assume digital adoption equals savings. It separates shifted, resolved, displaced, and finance-realizable volume.</p>
          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            {Object.keys(pulled).length > 0 && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,136,221,0.12)", border: `1px solid ${ELECTRIC}40`, borderRadius: 8, padding: "8px 14px" }}>
                <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>Prefilled {Object.keys(pulled).length} from TCO / AI Deflection.</span>
              </div>
            )}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "8px 14px" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: gradeColor }} />
              <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{grade}</span>
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
              <span style={{ fontSize: 10.5, color: MUTED, marginTop: 2, display: "block" }}>{(CURVE[d.adverseCurve] || CURVE.moderate).note}</span>
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: GREEN, letterSpacing: 1, textTransform: "uppercase", margin: "20px 0 4px" }}>Shift from voice → target</div>
          <p style={{ fontSize: 11, color: MUTED, marginBottom: 10 }}>Resolution = share that resolves without bouncing back to voice. Displacement = share of resolved that truly replace a voice call (not new demand). Both are honest haircuts. Set them to what your data supports.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="s3">
            {TARGETS.map(t => <ShiftCard key={t.key} t={t.key} color={t.color} />)}
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
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: "#fff" }}>{fmtK(r.netRealizable)}<span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>/mo</span></div>
              <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)" }}>{r.netRealizable >= 0 ? `${fmtK(r.netRealizable * 12)}/yr` : "net cost"}</div>
            </div>
            <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: MUTED, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Voice Displaced</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: GREEN }}>{Math.round(r.Dtot).toLocaleString()}</div>
              <div style={{ fontSize: 10.5, color: MUTED }}>truly leave voice/mo</div>
            </div>
            <div style={{ background: WARM, border: `1px solid ${AMBER}`, borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: MUTED, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Bounced to Voice</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: AMBER }}>{Math.round(r.Etot).toLocaleString()}</div>
              <div style={{ fontSize: 10.5, color: MUTED }}>failed in channel/mo</div>
            </div>
            <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: MUTED, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Voice FTE Freed</div>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: r.fteFreed >= 0 ? GREEN : RED }}>{r.fteFreed.toFixed(1)}</div>
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
            <div style={{ background: WARM, border: `1px solid ${isFinite(r.payback) && r.payback <= 12 ? GREEN : AMBER}`, borderRadius: 10, padding: "16px", textAlign: "center" }}><div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Payback (headline)</div><div style={{ fontSize: 20, fontWeight: 600, color: isFinite(r.payback) && r.payback <= 12 ? GREEN : AMBER }}>{isFinite(r.payback) ? r.payback.toFixed(1) + " mo" : "never"}</div></div>
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

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <ReportExport toolName="Channel Shift Economics" subtitle={`Voice → digital · ${verdict.label} · ${grade}`} userName="" userEmail="" sections={[
              { title: "Decision", type: "metrics", items: [
                { label: "Verdict", value: verdict.label, color: verdict.color },
                { label: "Net Realizable", value: fmtK(r.netRealizable) + "/mo", color: r.netRealizable > 0 ? GREEN : RED, sub: r.netRealizable > 0 ? fmtK(r.netRealizable * 12) + "/yr" : "net cost" },
                { label: verdict.pt ? "Break-even " + verdict.pt.key + " res" : "Break-even", value: verdict.be != null ? verdict.be.toFixed(0) + "%" : "n/a", color: AMBER, sub: verdict.pt ? "current " + verdict.curRes + "%" : "" },
                { label: "Voice FTE Freed", value: r.fteFreed.toFixed(1), color: GREEN, sub: "capacity, not headcount" },
              ]},
              { title: "Volume Bridge", type: "table", rows: [
                ["Voice volume", Math.round(r.voiceVol).toLocaleString()],
                [`Eligible to shift (${n(d.eligibility)}%)`, Math.round(r.eligible).toLocaleString()],
                ["Shifted", Math.round(r.shifted).toLocaleString()],
                ["Displaced voice (resolved x displacement)", Math.round(r.Dtot).toLocaleString()],
                ["Bounced back to voice", Math.round(r.Etot).toLocaleString()],
              ]},
              { title: "Economics", type: "table", rows: [
                ["Net agent-minutes freed/mo", Math.round(r.netMin).toLocaleString()],
                [`Realized labor (${MECH[mech].label}, ${Math.round(r.mf * 100)}%)`, fmtK(r.laborCash) + "/mo"],
                ["Bot platform fees (real cash)", fmtK(-r.botFee) + "/mo"],
                ["Net realizable", fmtK(r.netRealizable) + "/mo"],
                ["Transition (one-time)", fmtK(r.transition)],
                ["Payback", isFinite(r.payback) ? r.payback.toFixed(1) + " months" : "does not pay back"],
              ]},
              ...(flags.length ? [{ title: "Integrity Checks", type: "findings", items: flags.map(f => f.t) }] : []),
              { title: "Analyst Read", type: "findings", items: analyst },
              { title: "Methodology", type: "text", content: `Only the eligible portion of voice (${n(d.eligibility)}%) can shift. Each shifted contact resolves at the target resolution rate; failures bounce back to voice and add only the extra friction of re-contact (escalation return factor ${n(d.escReturnFactor)}x minus 1), since the base call always existed. Of resolved contacts, only the displacement share truly replaces a voice call. The rest is new demand, excluded from savings. Economics run on net agent-minutes freed (voice freed minus chat/email consumed minus recovery friction) valued at marginal labor and scaled by the ${MECH[mech].label} capacity action (${Math.round(r.mf * 100)}%); bot platform fees are real cash, netted in full. Residual voice AHT rises under the ${(CURVE[d.adverseCurve] || CURVE.moderate).label} complexity curve. Break-even is the target resolution rate at which net realizable crosses zero. Grade: ${grade}. This is an operating-capacity model, not a value or full-investment model.` },
              { title: "Next Steps", type: "next", items: [
                { tool: "AI Deflection Reality Check", reason: "Validate the bot resolution rate this decision rests on", href: "/tools/ai-deflection" },
                { tool: "Business Case Builder", reason: "Build the full investment case: ramp, phasing, approval packaging", href: "/tools/business-case" },
                { tool: "Staffing Calculator", reason: "Re-staff voice and chat for the post-shift mix", href: "/tools/staffing-calculator" },
              ]},
            ]} />
            <button onClick={sendResults} disabled={sending} style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8, border: "none", cursor: sending ? "wait" : "pointer" }}>{sent ? "Sent ✓" : sending ? "Sending..." : "Send Results & Request Review"}</button>
            <a href="/tools/ai-deflection" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>AI Deflection →</a>
          </div>
        </div>
      </section>
    </div>
  );
}
