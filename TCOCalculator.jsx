import { useState, useEffect, useRef } from "react";
import ReportExport from "./ReportExport";
import { COLORS, BENCH } from "./src/lib/benchmarks";
import { publishToolResult, getPrimitive } from "./src/lib/toolData";

const NAVY = COLORS.navy, DEEP = "#061325", ELECTRIC = COLORS.electric, LIGHT = "#00AAFF";
const ICE = "#E8F4FD", WARM = "#F8FAFB", SLATE = "#3A4F6A", MUTED = COLORS.muted, BORDER = "#D8E3ED";
const GREEN = COLORS.green, AMBER = COLORS.amber, RED = COLORS.red;

const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };

const n = (v) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };
const fmt = (v) => "$" + Math.round(n(v)).toLocaleString();
const fmtK = (v) => { const x = n(v); return x >= 1000000 ? "$" + (x / 1000000).toFixed(1) + "M" : x >= 1000 ? "$" + (x / 1000).toFixed(0) + "K" : "$" + Math.round(x).toLocaleString(); };
const pct = (v) => (n(v) * 100).toFixed(1) + "%";
const mmss = (s) => `${Math.floor(n(s) / 60)}:${String(Math.round(n(s) % 60)).padStart(2, "0")}`;

function LogoMark({ size = 34, light = true }) {
  const arcColor = light ? "#fff" : NAVY, xColor = light ? LIGHT : ELECTRIC;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
      <g transform="translate(60,60)">
        <path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={arcColor} strokeWidth="2" strokeLinecap="round" opacity={light ? 0.6 : 0.3}/>
        <path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={arcColor} strokeWidth="3.2" strokeLinecap="round" opacity={light ? 0.8 : 0.5}/>
        <path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={arcColor} strokeWidth="5" strokeLinecap="round"/>
        <line x1="-14" y1="-14" x2="14" y2="14" stroke={xColor} strokeWidth="5.5" strokeLinecap="round"/>
        <line x1="14" y1="-14" x2="-14" y2="14" stroke={xColor} strokeWidth="5.5" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", fn, { passive: true }); return () => window.removeEventListener("scroll", fn); }, []);
  const links = [
    { name: "Vendors", href: "/vendors" },
    { name: "Tools", href: "/how-to-choose" },
    { name: "Research", href: "/research" },
    { name: "The Human Premium", href: "/human-premium" },
  ];
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: #fff; color: ${NAVY}; -webkit-font-smoothing: antialiased; }
        a { text-decoration: none; color: inherit; }
        input:focus, select:focus { outline: none; border-color: ${ELECTRIC} !important; box-shadow: 0 0 0 3px rgba(0,136,221,0.1); }
        input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        @media (max-width: 860px) { .nav-links { display: none !important; } .results-grid { grid-template-columns: 1fr !important; } .kpi-grid { grid-template-columns: 1fr 1fr !important; } .input-row { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: "rgba(6,19,37,0.96)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "12px 0" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LogoMark size={34} />
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 14.5, letterSpacing: 0.4 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span>
          </a>
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {links.map(l => <a key={l.name} href={l.href} style={{ color: "rgba(255,255,255,0.7)", fontSize: 13.5, fontWeight: 500 }}>{l.name}</a>)}
            <a href="/subscribe" style={{ color: "#fff", fontSize: 13, fontWeight: 600, background: ELECTRIC, padding: "9px 20px", borderRadius: 6 }}>Subscribe</a>
          </div>
        </div>
      </nav>
    </>
  );
}

/* Live-committing field with hold-to-accelerate steppers. Module scope = stable
   identity (no remount). Commits on every keystroke so the sidebar, totals, and the
   Channel Mix check update in real time — the old onBlur-only commit is what made the
   total go stale. Local string state keeps typing smooth (partial values like "0.").
   A `factor` lets percent fields store fractions while displaying whole numbers. */
function NumField({ label, value, onChange, hint, prefix, suffix, step = 1, min, max, factor = 1, pulled }) {
  const display = (n(value) * factor);
  const [local, setLocal] = useState(String(display));
  const holdRef = useRef(null), valRef = useRef(display), accRef = useRef(0);
  valRef.current = display;
  useEffect(() => { setLocal(String(Math.round(display * 1000) / 1000)); /* eslint-disable-next-line */ }, [value]);

  const commit = (raw) => { const p = parseFloat(raw); onChange(isNaN(p) ? 0 : p / factor); };
  const clamp = (x) => { if (min != null && x < min) x = min; if (max != null && x > max) x = max; return Math.round(x * 1000) / 1000; };
  const stop = () => { if (holdRef.current) { clearTimeout(holdRef.current); holdRef.current = null; } };
  const start = (dir) => {
    stop(); accRef.current = clamp(n(valRef.current));
    const doStep = () => { accRef.current = clamp(accRef.current + dir * step); setLocal(String(accRef.current)); onChange(accRef.current / factor); };
    doStep(); let delay = 280;
    const tick = () => { doStep(); delay = Math.max(45, delay - 30); holdRef.current = setTimeout(tick, delay); };
    holdRef.current = setTimeout(tick, delay);
  };
  const btn = { width: 22, height: 15, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", color: MUTED, cursor: "pointer", padding: 0, lineHeight: 1, fontSize: 8, userSelect: "none" };

  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: SLATE, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        {label}
        {pulled && <span style={{ fontSize: 9, fontWeight: 700, color: ELECTRIC, background: ICE, padding: "1px 5px", borderRadius: 4, letterSpacing: 0.3 }}>PULLED</span>}
      </label>
      <div style={{ position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: MUTED, pointerEvents: "none" }}>{prefix}</span>}
        <input type="text" inputMode="decimal" value={local}
          onChange={e => { setLocal(e.target.value); commit(e.target.value); }}
          onBlur={() => setLocal(String(Math.round(display * 1000) / 1000))}
          style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, transition: "border-color 0.2s", paddingLeft: prefix ? 28 : 12, paddingRight: 44 }} />
        {suffix && <span style={{ position: "absolute", right: 30, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: MUTED, pointerEvents: "none" }}>{suffix}</span>}
        <div style={{ position: "absolute", right: 4, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 1 }}>
          <button type="button" aria-label="Increase" style={btn} onMouseDown={e => { e.preventDefault(); start(1); }} onMouseUp={stop} onMouseLeave={stop} onTouchStart={e => { e.preventDefault(); start(1); }} onTouchEnd={stop}>▲</button>
          <button type="button" aria-label="Decrease" style={btn} onMouseDown={e => { e.preventDefault(); start(-1); }} onMouseUp={stop} onMouseLeave={stop} onTouchStart={e => { e.preventDefault(); start(-1); }} onTouchEnd={stop}>▼</button>
        </div>
      </div>
      {hint && <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

const INDUSTRY = {
  general: { label: "Cross-Industry Average", agents: 200, agentHourly: 18, monthlyContacts: 120000, aht: 420, fcr: 0.72, containment: 0.25, occupancy: 0.82, shrinkage: 0.30, attrition: 0.35, absenteeism: 0.08, channelMixVoice: 0.55, channelMixChat: 0.25, channelMixEmail: 0.12, channelMixSocial: 0.05, channelMixSelfServe: 0.03, csat: 4.1, nps: 32, transferRate: 0.15, acw: 60, ccaasSeat: 150 },
  financial: { label: "Financial Services", agents: 350, agentHourly: 22, monthlyContacts: 180000, aht: 380, fcr: 0.75, containment: 0.20, occupancy: 0.80, shrinkage: 0.28, attrition: 0.28, absenteeism: 0.07, channelMixVoice: 0.50, channelMixChat: 0.28, channelMixEmail: 0.14, channelMixSocial: 0.04, channelMixSelfServe: 0.04, csat: 4.0, nps: 35, transferRate: 0.12, acw: 75, ccaasSeat: 175 },
  healthcare: { label: "Healthcare", agents: 250, agentHourly: 20, monthlyContacts: 140000, aht: 480, fcr: 0.68, containment: 0.18, occupancy: 0.78, shrinkage: 0.32, attrition: 0.32, absenteeism: 0.09, channelMixVoice: 0.62, channelMixChat: 0.20, channelMixEmail: 0.12, channelMixSocial: 0.03, channelMixSelfServe: 0.03, csat: 3.9, nps: 28, transferRate: 0.18, acw: 90, ccaasSeat: 165 },
  retail: { label: "Retail & eCommerce", agents: 180, agentHourly: 16, monthlyContacts: 150000, aht: 340, fcr: 0.70, containment: 0.30, occupancy: 0.84, shrinkage: 0.32, attrition: 0.42, absenteeism: 0.10, channelMixVoice: 0.40, channelMixChat: 0.32, channelMixEmail: 0.15, channelMixSocial: 0.08, channelMixSelfServe: 0.05, csat: 4.2, nps: 38, transferRate: 0.14, acw: 45, ccaasSeat: 135 },
  telecom: { label: "Telecommunications", agents: 400, agentHourly: 19, monthlyContacts: 250000, aht: 520, fcr: 0.65, containment: 0.22, occupancy: 0.85, shrinkage: 0.30, attrition: 0.38, absenteeism: 0.08, channelMixVoice: 0.52, channelMixChat: 0.26, channelMixEmail: 0.12, channelMixSocial: 0.06, channelMixSelfServe: 0.04, csat: 3.8, nps: 22, transferRate: 0.20, acw: 70, ccaasSeat: 155 },
  insurance: { label: "Insurance", agents: 300, agentHourly: 21, monthlyContacts: 100000, aht: 540, fcr: 0.70, containment: 0.15, occupancy: 0.78, shrinkage: 0.28, attrition: 0.25, absenteeism: 0.06, channelMixVoice: 0.60, channelMixChat: 0.22, channelMixEmail: 0.13, channelMixSocial: 0.03, channelMixSelfServe: 0.02, csat: 4.0, nps: 30, transferRate: 0.16, acw: 95, ccaasSeat: 170 },
  bpo: { label: "BPO / Outsourcer", agents: 500, agentHourly: 14, monthlyContacts: 300000, aht: 400, fcr: 0.68, containment: 0.28, occupancy: 0.86, shrinkage: 0.34, attrition: 0.55, absenteeism: 0.12, channelMixVoice: 0.58, channelMixChat: 0.24, channelMixEmail: 0.10, channelMixSocial: 0.05, channelMixSelfServe: 0.03, csat: 3.9, nps: 25, transferRate: 0.17, acw: 55, ccaasSeat: 120 },
};

const BASE = { supervisors: 20, qaStaff: 5, wfmStaff: 4, trainers: 3, itSupport: 4, sites: 2, agentBenefitsPct: 0.30, supHourly: 30, qaHourly: 28, wfmHourly: 32, trainerHourly: 26, itHourly: 35, scheduleAdherence: 0.90, avgSpeedAnswer: 28, abandonRate: 0.06, avgHoldTime: 45, newHireTrainingDays: 21, qualityScore: 0.82, wemSeat: 45, telephonyPerMin: 0.025, ivaMonthly: 8000, agentAssistMonthly: 5000, rpaMonthly: 3000, analyticsMonthly: 6000, crmSeat: 75, ipaasMonthly: 4000, recordingMonthly: 3500, knowledgeMgmt: 2500, securityCompliance: 3000, cloudInfra: 5000, psAmortized: 8000, recruitingCostPerHire: 3500, facilitiesCost: 12000, implementationOneTime: 0, escalatorPct: 0.04 };

// Optimization realization confidence — how much freed capacity converts to real
// savings. Replaces the old hard-coded 0.3–0.6 fudge factors with a transparent dial.
const STANCE = {
  conservative: { label: "Conservative", f: 0.50, note: "Only savings you can commit to — heavy haircut on freed capacity." },
  expected: { label: "Expected", f: 0.70, note: "Realistic conversion of freed capacity to cash. The defensible default." },
  aggressive: { label: "Aggressive", f: 1.00, note: "Full theoretical capacity value, no haircut — matches vendor ROI tools." },
};

function computeTCO(d) {
  const HRS = 173; // 2080/12
  const loaded = n(d.agentHourly) * (1 + n(d.agentBenefitsPct));
  const agentLabor = n(d.agents) * loaded * HRS;
  const salaried = (rate) => rate * 1.25 * HRS;
  const supLabor = n(d.supervisors) * salaried(n(d.supHourly));
  const qaLabor = n(d.qaStaff) * salaried(n(d.qaHourly));
  const wfmLabor = n(d.wfmStaff) * salaried(n(d.wfmHourly));
  const trainerLabor = n(d.trainers) * salaried(n(d.trainerHourly));
  const itLabor = n(d.itSupport) * salaried(n(d.itHourly));
  const labor = agentLabor + supLabor + qaLabor + wfmLabor + trainerLabor + itLabor;

  const monthlyHires = Math.round(n(d.agents) * n(d.attrition) / 12);
  const perHire = n(d.recruitingCostPerHire) + n(d.newHireTrainingDays) * 8 * loaded;
  const attritionCost = monthlyHires * perHire;

  const contacts = n(d.monthlyContacts) || 1;
  const voiceContacts = contacts * n(d.channelMixVoice);
  const voiceMinutes = voiceContacts * ((n(d.aht) + n(d.avgHoldTime) + n(d.acw)) / 60);
  const telephony = voiceMinutes * n(d.telephonyPerMin);

  const seats = n(d.agents) + n(d.supervisors) + n(d.qaStaff) + n(d.wfmStaff);
  const ccaas = seats * n(d.ccaasSeat), wem = seats * n(d.wemSeat), crm = seats * n(d.crmSeat);
  const ai = n(d.ivaMonthly) + n(d.agentAssistMonthly) + n(d.rpaMonthly);
  const tech = ccaas + wem + crm + ai + n(d.analyticsMonthly) + n(d.ipaasMonthly) + n(d.recordingMonthly) + n(d.knowledgeMgmt) + n(d.securityCompliance) + telephony;
  const overhead = n(d.cloudInfra) + n(d.psAmortized) + n(d.facilitiesCost) + attritionCost;

  const monthly = labor + tech + overhead;
  const annual = monthly * 12;
  const agents = n(d.agents) || 1;
  const costPerContact = monthly / contacts;
  const costPerResolution = monthly / ((contacts * n(d.fcr)) || 1);
  const humanContacts = contacts * (1 - n(d.containment));
  const costPerHuman = monthly / (humanContacts || 1);

  // Marginal (variable) cost of one handled contact = handle-time labor only.
  // This is what deflecting/avoiding a contact actually frees — NOT the fully loaded
  // cost-per-contact (which carries fixed tech, facilities, overhead that don't fall
  // when volume drops). Using marginal cost is the core anti-inflation fix.
  const handleMin = (n(d.aht) + n(d.avgHoldTime) + n(d.acw)) / 60;
  const loadedPerMin = loaded / 60;
  const marginalPerContact = handleMin * loadedPerMin + (n(d.channelMixVoice) * handleMin * n(d.telephonyPerMin));

  // 3-year projection: current operation carried forward with an escalator, plus any
  // one-time implementation. Year 1 = the annual snapshot, so the two views reconcile.
  const e = n(d.escalatorPct);
  const y1 = annual, y2 = annual * (1 + e), y3 = annual * (1 + e) * (1 + e);
  const threeYear = n(d.implementationOneTime) + y1 + y2 + y3;

  return {
    loaded, labor, tech, overhead, monthly, annual, agents, contacts,
    costPerContact, costPerResolution, costPerHuman, marginalPerContact, humanContacts,
    monthlyHires, attritionCost, voiceMinutes, perHire,
    laborPct: labor / (monthly || 1), techPct: tech / (monthly || 1), overheadPct: overhead / (monthly || 1),
    techPerAgent: tech / agents, y1, y2, y3, threeYear,
  };
}

// De-overlapped optimization model. Each lever acts on the pool the prior levers
// leave behind, valued at marginal cost, then scaled by the stance confidence — so
// the levers never sum to a fiction. Returns gross (full capacity) and net (stance).
function buildOptimizations(d, r, stanceKey) {
  const f = STANCE[stanceKey].f;
  const out = [];
  const contacts = r.contacts;
  let pool = contacts; // contacts still handled by humans, shrinks as levers apply

  // 1. Containment — deflect contacts off the human pool entirely.
  const targetCont = Math.max(n(d.containment), 0.30);
  const deflectable = Math.max(0, (targetCont - n(d.containment))) * contacts;
  if (deflectable > 100) {
    const gross = deflectable * r.marginalPerContact;
    out.push({ key: "containment", title: "Increase self-service containment", gross, net: gross * f,
      desc: `Deflect ${Math.round(deflectable).toLocaleString()} contacts/mo by moving containment ${pct(d.containment)} → ${Math.round(targetCont * 100)}%. Valued at marginal handle cost, not fully-loaded.` });
    pool -= deflectable;
  }

  // 2. FCR — remove avoided repeat contacts from the remaining handled pool.
  const targetFcr = Math.max(n(d.fcr), 0.78);
  const repeatDrop = Math.max(0, targetFcr - n(d.fcr)); // fewer repeats as a share of handled
  const avoidedRepeats = repeatDrop * pool;
  if (avoidedRepeats > 100) {
    const gross = avoidedRepeats * r.marginalPerContact;
    out.push({ key: "fcr", title: "Improve first contact resolution", gross, net: gross * f,
      desc: `Lift FCR ${pct(d.fcr)} → ${Math.round(targetFcr * 100)}%, avoiding ${Math.round(avoidedRepeats).toLocaleString()} repeat contacts/mo on the handled pool.` });
    pool -= avoidedRepeats;
  }

  // 3. AHT — reduce handle minutes on the contacts that REMAIN (post-deflect, post-FCR).
  const targetAht = 420;
  if (n(d.aht) > targetAht && pool > 0) {
    const minSaved = (n(d.aht) - targetAht) / 60;
    const gross = minSaved * pool * (r.loaded / 60);
    out.push({ key: "aht", title: "Reduce average handle time", gross, net: gross * f,
      desc: `Bring AHT ${mmss(d.aht)} → 7:00 across ${Math.round(pool).toLocaleString()} remaining contacts/mo. Applied only to contacts still handled, so it doesn't double-count deflected volume.` });
  }

  // 4. Attrition — labor/HR saving, independent of the contact pool (no overlap).
  if (n(d.attrition) > 0.30) {
    const fewerHires = (n(d.attrition) - 0.30) * r.agents / 12;
    const gross = fewerHires * r.perHire;
    out.push({ key: "attrition", title: "Reduce agent attrition", gross, net: gross * f,
      desc: `Cut attrition ${pct(d.attrition)} → 30% (~${fewerHires.toFixed(1)} fewer hires/mo) saving recruiting, training, and ramp. Independent of contact volume.` });
  }

  // Occupancy is a risk flag, not an additive dollar — kept qualitative to avoid inflation.
  const occRisk = n(d.occupancy) > BENCH.occupancy.cautionMax;

  const grossTotal = out.reduce((s, o) => s + o.gross, 0);
  const netTotal = out.reduce((s, o) => s + o.net, 0);
  return { items: out, grossTotal, netTotal, occRisk };
}

function buildAnalystRead(d, r, opt, stanceKey) {
  const out = [];
  // 1. How the cost metrics relate + the outlier.
  const resPremium = r.costPerResolution / r.costPerContact - 1;
  if (resPremium > 0.25)
    out.push(`Cost per resolution ($${r.costPerResolution.toFixed(2)}) runs ${Math.round(resPremium * 100)}% above cost per contact ($${r.costPerContact.toFixed(2)}) — your ${pct(d.fcr)} FCR means you pay to handle the same issue more than once. That gap, not the headline, is where the money leaks.`);
  else
    out.push(`Cost per contact $${r.costPerContact.toFixed(2)} and per resolution $${r.costPerResolution.toFixed(2)} are close, so your ${pct(d.fcr)} FCR isn't inflating rework cost much — the cost story is in volume and labor, not repeats.`);

  // 2. Cost structure read.
  if (r.laborPct > 0.80)
    out.push(`Labor is ${pct(r.laborPct)} of TCO — this is a people-cost operation, so the highest-leverage moves are deflection and AHT (which free agent capacity), not trimming the ${pct(r.techPct)} tech line. Cutting tech here barely moves the total.`);
  else
    out.push(`Labor is ${pct(r.laborPct)} of TCO with tech at ${pct(r.techPct)} — an unusually tech-heavy structure. Worth auditing platform overlap (the License Gap Checker) before adding more tooling.`);

  // 3. Optimization honesty + stance.
  if (opt.items.length)
    out.push(`The ${stanceKey} stance values realistic savings at ${fmtK(opt.netTotal)}/mo (${fmtK(opt.netTotal * 12)}/yr) against a theoretical ${fmtK(opt.grossTotal)}/mo. Levers are de-overlapped — each acts on what the prior one leaves — so this total is defensible, unlike a tool that sums every lever at full loaded cost.`);

  // 4. The marginal-cost point a CFO will probe.
  out.push(`Savings are valued at marginal cost ($${r.marginalPerContact.toFixed(2)}/contact), not fully-loaded ($${r.costPerContact.toFixed(2)}) — deflecting contacts frees agent time but not fixed tech and facilities. Capturing it as cash requires reducing or re-deploying FTE, which is the conversation to have, not assume.`);

  if (opt.occRisk) out.push(`Occupancy at ${pct(d.occupancy)} is in the burnout zone (>${Math.round(BENCH.occupancy.cautionMax * 100)}%). That's a hidden cost: it drives the very attrition inflating your overhead. Model it in the Occupancy Risk Simulator before assuming the savings above are free.`);
  return out;
}
function Calculator() {
  const [d, setD] = useState({ ...BASE, ...INDUSTRY.general, industry: "general" });
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const [activeSection, setActiveSection] = useState(0);
  const [stance, setStance] = useState("expected");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [pulled, setPulled] = useState({});

  const loadIndustry = (key) => setD(prev => ({ ...prev, ...BASE, ...INDUSTRY[key], industry: key }));

  // Auto-fill from upstream tools (Staffing / Business Case / Deflection) via the
  // shared data contract. Every pulled value stays fully editable; a PULLED badge
  // shows the source so nothing is silently overwritten.
  useEffect(() => {
    const map = { aht: "aht", shrinkage: "shrinkage", occupancy: "occupancy", agents: "agents", attrition: "attrition" };
    const next = {}; const got = {};
    for (const [field, key] of Object.entries(map)) {
      const v = getPrimitive(key);
      if (v != null && !isNaN(v)) { next[field] = v; got[field] = true; }
    }
    const annual = getPrimitive("annualContacts");
    if (annual != null && !isNaN(annual)) { next.monthlyContacts = Math.round(annual / 12); got.monthlyContacts = true; }
    const impl = getPrimitive("implementationCost");
    if (impl != null && !isNaN(impl)) { next.implementationOneTime = impl; got.implementationOneTime = true; }
    if (Object.keys(next).length) { setD(prev => ({ ...prev, ...next })); setPulled(got); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const r = computeTCO(d);
  const opt = buildOptimizations(d, r, stance);
  const analyst = buildAnalystRead(d, r, opt, stance);

  const channelTotal = n(d.channelMixVoice) + n(d.channelMixChat) + n(d.channelMixEmail) + n(d.channelMixSocial) + n(d.channelMixSelfServe);
  const channelOK = Math.abs(channelTotal - 1) < 0.005;
  const normalizeChannels = () => {
    if (channelTotal <= 0) return;
    setD(prev => ({ ...prev,
      channelMixVoice: n(prev.channelMixVoice) / channelTotal, channelMixChat: n(prev.channelMixChat) / channelTotal,
      channelMixEmail: n(prev.channelMixEmail) / channelTotal, channelMixSocial: n(prev.channelMixSocial) / channelTotal,
      channelMixSelfServe: n(prev.channelMixSelfServe) / channelTotal }));
  };

  useEffect(() => {
    publishToolResult("tco-calculator", {
      agents: r.agents, monthlyContacts: r.contacts, annualTCO: Math.round(r.annual), monthlyTCO: Math.round(r.monthly),
      tcoPerAgentMonth: Math.round(r.monthly / r.agents), costPerContact: +r.costPerContact.toFixed(2),
      costPerResolution: +r.costPerResolution.toFixed(2), marginalPerContact: +r.marginalPerContact.toFixed(2),
      laborPct: +r.laborPct.toFixed(4), techPct: +r.techPct.toFixed(4), threeYearTCO: Math.round(r.threeYear),
      optimizationNetMonthly: Math.round(opt.netTotal), stance, analystRead: analyst[0],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d, stance]);

  const getBench = (val, low, high, inverse) => {
    if (inverse) return val <= low ? GREEN : val >= high ? RED : AMBER;
    return val >= high ? GREEN : val <= low ? RED : AMBER;
  };

  const sendResults = () => {
    setSending(true);
    const body = new FormData();
    body.append("_subject", "TCO Calculator Results — Center of CX");
    body.append("source", "TCO Calculator");
    body.append("annual_tco", fmtK(r.annual));
    body.append("three_year_tco", fmtK(r.threeYear));
    body.append("per_agent_month", fmt(r.monthly / r.agents));
    body.append("cost_per_contact", "$" + r.costPerContact.toFixed(2));
    body.append("optimization_net_monthly", fmtK(opt.netTotal));
    body.append("stance", stance);
    body.append("agents", String(r.agents));
    body.append("industry", d.industry);
    fetch("https://formspree.io/f/maqlvwne", { method: "POST", body, headers: { Accept: "application/json" } })
      .then(res => { if (res.ok) setSent(true); setSending(false); }).catch(() => setSending(false));
  };

  const sections = ["Organization Profile", "Labor Costs", "Operational KPIs", "Channel Mix", "Technology Costs", "Overhead & Results"];
  const navBtn = (to, label, primary, disabled) => (
    <button onClick={() => !disabled && setActiveSection(to)} disabled={disabled}
      style={{ background: primary ? (disabled ? MUTED : ELECTRIC) : "#fff", border: primary ? "none" : `1px solid ${BORDER}`, color: primary ? "#fff" : SLATE, fontSize: 14, fontWeight: 600, padding: "10px 22px", borderRadius: 6, cursor: disabled ? "not-allowed" : "pointer" }}>{label}</button>
  );

  return (
    <section style={{ background: WARM, padding: "100px 28px 60px", minHeight: "100vh" }}>
      <div style={WRAP}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
            <a href="/" style={{ color: MUTED, fontSize: 13 }}>Home</a><span style={{ color: BORDER, fontSize: 13 }}>/</span>
            <a href="/how-to-choose" style={{ color: MUTED, fontSize: 13 }}>Tools</a><span style={{ color: BORDER, fontSize: 13 }}>/</span>
            <span style={{ color: ELECTRIC, fontSize: 13, fontWeight: 600 }}>TCO Calculator</span>
          </div>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>Contact Center TCO Calculator</h1>
          <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.6, maxWidth: 680 }}>Total cost of ownership across labor, technology, 18 operational KPIs, and overhead — as a current-state X-ray and a 3-year projection. Every number is transparent, benchmarked, and valued at marginal cost so savings are realistic, not inflated.</p>
          {Object.keys(pulled).length > 0 && (
            <div style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 8, background: ICE, border: `1px solid ${ELECTRIC}30`, borderRadius: 8, padding: "8px 14px" }}>
              <span style={{ fontSize: 12, color: NAVY, fontWeight: 600 }}>Prefilled {Object.keys(pulled).length} value{Object.keys(pulled).length > 1 ? "s" : ""} from your recent tools.</span>
              <span style={{ fontSize: 12, color: MUTED }}>Every field is editable.</span>
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 28 }} className="results-grid">
          <div>
            <div style={{ position: "sticky", top: 80 }}>
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
                {sections.map((s, i) => (
                  <button key={i} onClick={() => setActiveSection(i)} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 16px", fontSize: 13, fontWeight: activeSection === i ? 600 : 400, color: activeSection === i ? ELECTRIC : SLATE, background: activeSection === i ? `${ELECTRIC}08` : "transparent", border: "none", borderBottom: i < sections.length - 1 ? `1px solid ${BORDER}` : "none", cursor: "pointer", borderLeft: activeSection === i ? `3px solid ${ELECTRIC}` : "3px solid transparent" }}>{s}</button>
                ))}
              </div>
              <div style={{ background: NAVY, borderRadius: 10, padding: "20px 18px", color: "#fff" }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: LIGHT, marginBottom: 14 }}>Live TCO</div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Annual</div>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, color: LIGHT }}>{fmtK(r.annual)}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>3-yr {fmtK(r.threeYear)}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[{ l: "Agent/Mo", v: fmt(r.monthly / r.agents) }, { l: "Per Contact", v: "$" + r.costPerContact.toFixed(2) }, { l: "Per Resolution", v: "$" + r.costPerResolution.toFixed(2) }, { l: "Labor %", v: pct(r.laborPct) }].map((item, i) => (
                    <div key={i}><div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{item.l}</div><div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{item.v}</div></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            {activeSection === 0 && (
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 24px" }}>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 20px" }}>Organization Profile</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="input-row">
                  <NumField label="Total Agents (FTE)" value={d.agents} onChange={v => set("agents", v)} step={5} min={1} hint="Full-time and FTE-equivalent" pulled={pulled.agents} />
                  <NumField label="Supervisors" value={d.supervisors} onChange={v => set("supervisors", v)} min={0} />
                  <NumField label="QA Analysts" value={d.qaStaff} onChange={v => set("qaStaff", v)} min={0} />
                  <NumField label="WFM Staff" value={d.wfmStaff} onChange={v => set("wfmStaff", v)} min={0} />
                  <NumField label="Trainers" value={d.trainers} onChange={v => set("trainers", v)} min={0} />
                  <NumField label="IT / Tech Support" value={d.itSupport} onChange={v => set("itSupport", v)} min={0} />
                  <NumField label="Sites" value={d.sites} onChange={v => set("sites", v)} min={1} />
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: SLATE, display: "block", marginBottom: 4 }}>Industry</label>
                    <select value={d.industry} onChange={e => loadIndustry(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, cursor: "pointer" }}>
                      {Object.entries(INDUSTRY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <div style={{ fontSize: 10, color: GREEN, marginTop: 3 }}>✓ Prepopulated with {INDUSTRY[d.industry]?.label} benchmarks. Adjust any value.</div>
                  </div>
                  <NumField label="Monthly Contact Volume" value={d.monthlyContacts} onChange={v => set("monthlyContacts", v)} step={1000} min={1} pulled={pulled.monthlyContacts} />
                </div>
                <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>{navBtn(1, "Next: Labor Costs →", true)}</div>
              </div>
            )}

            {activeSection === 1 && (
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 24px" }}>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 20px" }}>Labor Costs</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="input-row">
                  <NumField label="Agent Hourly Rate" value={d.agentHourly} onChange={v => set("agentHourly", v)} prefix="$" step={0.5} min={0} />
                  <NumField label="Benefits & Burden" value={d.agentBenefitsPct} onChange={v => set("agentBenefitsPct", v)} suffix="%" factor={100} min={0} max={100} hint="Typically 25–35%" />
                  <div style={{ background: ICE, borderRadius: 6, padding: "10px 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontSize: 11, color: MUTED }}>Loaded Rate</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: NAVY }}>${r.loaded.toFixed(2)}/hr</div>
                  </div>
                  <NumField label="Supervisor Hourly" value={d.supHourly} onChange={v => set("supHourly", v)} prefix="$" step={0.5} min={0} />
                  <NumField label="QA Analyst Hourly" value={d.qaHourly} onChange={v => set("qaHourly", v)} prefix="$" step={0.5} min={0} />
                  <NumField label="WFM Analyst Hourly" value={d.wfmHourly} onChange={v => set("wfmHourly", v)} prefix="$" step={0.5} min={0} />
                  <NumField label="Trainer Hourly" value={d.trainerHourly} onChange={v => set("trainerHourly", v)} prefix="$" step={0.5} min={0} />
                  <NumField label="IT Support Hourly" value={d.itHourly} onChange={v => set("itHourly", v)} prefix="$" step={0.5} min={0} />
                  <NumField label="Recruiting Cost/Hire" value={d.recruitingCostPerHire} onChange={v => set("recruitingCostPerHire", v)} prefix="$" step={100} min={0} />
                </div>
                <div style={{ marginTop: 16, background: ICE, borderRadius: 8, padding: "14px 18px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div><div style={{ fontSize: 11, color: MUTED }}>Monthly Labor</div><div style={{ fontSize: 18, fontWeight: 600, color: NAVY }}>{fmtK(r.labor)}</div></div>
                  <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: MUTED }}>Attrition Cost/Mo</div><div style={{ fontSize: 18, fontWeight: 600, color: NAVY }}>{fmtK(r.attritionCost)}</div><div style={{ fontSize: 11, color: MUTED }}>{r.monthlyHires} hires/mo</div></div>
                </div>
                <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>{navBtn(0, "← Back", false)}{navBtn(2, "Next: KPIs →", true)}</div>
              </div>
            )}

            {activeSection === 2 && (
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 24px" }}>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 20px" }}>Operational KPIs</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="input-row">
                  <NumField label="AHT (seconds)" value={d.aht} onChange={v => set("aht", v)} step={5} min={1} pulled={pulled.aht} hint={<span style={{ color: getBench(n(d.aht), 300, 600, true) }}>{mmss(d.aht)} — Bench: 5:00–7:00</span>} />
                  <NumField label="ACW (seconds)" value={d.acw} onChange={v => set("acw", v)} step={5} min={0} hint="After-call work" />
                  <NumField label="Hold Time (seconds)" value={d.avgHoldTime} onChange={v => set("avgHoldTime", v)} step={5} min={0} />
                  <NumField label="FCR" value={d.fcr} onChange={v => set("fcr", v)} suffix="%" factor={100} min={0} max={100} hint={<span style={{ color: getBench(n(d.fcr), 0.65, 0.85) }}>Bench: 65–85%</span>} />
                  <NumField label="Containment" value={d.containment} onChange={v => set("containment", v)} suffix="%" factor={100} min={0} max={100} hint={<span style={{ color: getBench(n(d.containment), 0.15, 0.45) }}>Bench: 15–45%</span>} />
                  <NumField label="Occupancy" value={d.occupancy} onChange={v => set("occupancy", v)} suffix="%" factor={100} min={0} max={100} pulled={pulled.occupancy} hint={<span style={{ color: n(d.occupancy) > BENCH.occupancy.cautionMax ? RED : n(d.occupancy) > BENCH.occupancy.healthyMax ? AMBER : GREEN }}>{Math.round(BENCH.occupancy.healthyMax * 100)}–{Math.round(BENCH.occupancy.cautionMax * 100)}% healthy. Above = burnout</span>} />
                  <NumField label="Shrinkage" value={d.shrinkage} onChange={v => set("shrinkage", v)} suffix="%" factor={100} min={0} max={100} pulled={pulled.shrinkage} hint="25–35%" />
                  <NumField label="Annual Attrition" value={d.attrition} onChange={v => set("attrition", v)} suffix="%" factor={100} min={0} max={100} pulled={pulled.attrition} hint={<span style={{ color: getBench(n(d.attrition), 0.20, 0.55, true) }}>Bench: 20–40%</span>} />
                  <NumField label="Absenteeism" value={d.absenteeism} onChange={v => set("absenteeism", v)} suffix="%" factor={100} min={0} max={100} hint="5–10%" />
                  <NumField label="Schedule Adherence" value={d.scheduleAdherence} onChange={v => set("scheduleAdherence", v)} suffix="%" factor={100} min={0} max={100} hint="Target: 88–95%" />
                  <NumField label="ASA (seconds)" value={d.avgSpeedAnswer} onChange={v => set("avgSpeedAnswer", v)} step={5} min={0} hint="Target: under 30s" />
                  <NumField label="Abandon Rate" value={d.abandonRate} onChange={v => set("abandonRate", v)} suffix="%" factor={100} min={0} max={100} hint="Target: under 5%" />
                  <NumField label="Transfer Rate" value={d.transferRate} onChange={v => set("transferRate", v)} suffix="%" factor={100} min={0} max={100} />
                  <NumField label="QA Score" value={d.qualityScore} onChange={v => set("qualityScore", v)} suffix="%" factor={100} min={0} max={100} />
                  <NumField label="CSAT (1–5)" value={d.csat} onChange={v => set("csat", v)} step={0.1} min={1} max={5} hint={<span style={{ color: getBench(n(d.csat), 3.5, 4.5) }}>Bench: 3.8–4.5</span>} />
                  <NumField label="NPS (-100 to 100)" value={d.nps} onChange={v => set("nps", v)} min={-100} max={100} />
                  <NumField label="New Hire Training (days)" value={d.newHireTrainingDays} onChange={v => set("newHireTrainingDays", v)} min={0} />
                </div>
                <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>{navBtn(1, "← Back", false)}{navBtn(3, "Next: Channel Mix →", true)}</div>
              </div>
            )}

            {activeSection === 3 && (
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 24px" }}>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 20px" }}>Channel Mix</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="input-row">
                  <NumField label="Voice" value={d.channelMixVoice} onChange={v => set("channelMixVoice", v)} suffix="%" factor={100} min={0} max={100} />
                  <NumField label="Chat / Messaging" value={d.channelMixChat} onChange={v => set("channelMixChat", v)} suffix="%" factor={100} min={0} max={100} />
                  <NumField label="Email" value={d.channelMixEmail} onChange={v => set("channelMixEmail", v)} suffix="%" factor={100} min={0} max={100} />
                  <NumField label="Social" value={d.channelMixSocial} onChange={v => set("channelMixSocial", v)} suffix="%" factor={100} min={0} max={100} />
                  <NumField label="Self-Service" value={d.channelMixSelfServe} onChange={v => set("channelMixSelfServe", v)} suffix="%" factor={100} min={0} max={100} />
                  <div style={{ background: channelOK ? ICE : "#FEF2F2", borderRadius: 6, padding: "10px 14px", display: "flex", flexDirection: "column", justifyContent: "center", border: channelOK ? "none" : `1px solid ${RED}40` }}>
                    <div style={{ fontSize: 11, color: MUTED }}>Total</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: channelOK ? GREEN : RED }}>{pct(channelTotal)}</div>
                    <div style={{ fontSize: 11, color: channelOK ? MUTED : RED }}>{channelOK ? "Balanced ✓" : "Must equal 100%"}</div>
                  </div>
                </div>
                {!channelOK && (
                  <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12, background: "#FEF2F2", border: `1px solid ${RED}30`, borderRadius: 8, padding: "12px 16px" }}>
                    <span style={{ fontSize: 13, color: NAVY, flex: 1 }}>Channel mix is at {pct(channelTotal)} — the TCO can't be trusted until it sums to 100%.</span>
                    <button onClick={normalizeChannels} style={{ background: ELECTRIC, color: "#fff", fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 6, border: "none", cursor: "pointer" }}>Auto-balance to 100%</button>
                  </div>
                )}
                <div style={{ marginTop: 16, background: ICE, borderRadius: 8, padding: "14px 18px" }}>
                  <div style={{ fontSize: 11, color: MUTED }}>Monthly Voice Minutes</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: NAVY }}>{Math.round(r.voiceMinutes).toLocaleString()}</div>
                </div>
                <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  {navBtn(2, "← Back", false)}
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {!channelOK && <span style={{ fontSize: 12, color: RED }}>Balance the mix to continue</span>}
                    {navBtn(4, "Next: Technology →", true, !channelOK)}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 4 && (
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 24px" }}>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 20px" }}>Technology Costs <span style={{ fontSize: 13, fontWeight: 400, color: MUTED }}>(monthly)</span></h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="input-row">
                  <NumField label="CCaaS Per Seat" value={d.ccaasSeat} onChange={v => set("ccaasSeat", v)} prefix="$" step={5} min={0} />
                  <NumField label="WEM Per Seat" value={d.wemSeat} onChange={v => set("wemSeat", v)} prefix="$" step={5} min={0} />
                  <NumField label="CRM Per Seat" value={d.crmSeat} onChange={v => set("crmSeat", v)} prefix="$" step={5} min={0} />
                  <NumField label="Telephony Per Min" value={d.telephonyPerMin} onChange={v => set("telephonyPerMin", v)} prefix="$" step={0.005} min={0} />
                  <NumField label="IVA / Bot Platform" value={d.ivaMonthly} onChange={v => set("ivaMonthly", v)} prefix="$" step={500} min={0} />
                  <NumField label="Agent Assist" value={d.agentAssistMonthly} onChange={v => set("agentAssistMonthly", v)} prefix="$" step={500} min={0} />
                  <NumField label="RPA / Automation" value={d.rpaMonthly} onChange={v => set("rpaMonthly", v)} prefix="$" step={500} min={0} />
                  <NumField label="Analytics Platform" value={d.analyticsMonthly} onChange={v => set("analyticsMonthly", v)} prefix="$" step={500} min={0} />
                  <NumField label="iPaaS / Integration" value={d.ipaasMonthly} onChange={v => set("ipaasMonthly", v)} prefix="$" step={500} min={0} />
                  <NumField label="Recording & Compliance" value={d.recordingMonthly} onChange={v => set("recordingMonthly", v)} prefix="$" step={500} min={0} />
                  <NumField label="Knowledge Mgmt" value={d.knowledgeMgmt} onChange={v => set("knowledgeMgmt", v)} prefix="$" step={500} min={0} />
                  <NumField label="Security & Compliance" value={d.securityCompliance} onChange={v => set("securityCompliance", v)} prefix="$" step={500} min={0} />
                </div>
                <div style={{ marginTop: 16, background: ICE, borderRadius: 8, padding: "14px 18px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div><div style={{ fontSize: 11, color: MUTED }}>Monthly Tech Cost</div><div style={{ fontSize: 18, fontWeight: 600, color: NAVY }}>{fmtK(r.tech)}</div></div>
                  <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, color: MUTED }}>Tech Per Agent/Mo</div><div style={{ fontSize: 18, fontWeight: 600, color: NAVY }}>{fmt(r.techPerAgent)}</div></div>
                </div>
                <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>{navBtn(3, "← Back", false)}{navBtn(5, "Next: Results →", true)}</div>
              </div>
            )}

            {activeSection === 5 && (
              <div>
                <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 24px", marginBottom: 20 }}>
                  <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 20px" }}>Overhead, Facilities & 3-Year Inputs</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="input-row">
                    <NumField label="Cloud Infrastructure (mo)" value={d.cloudInfra} onChange={v => set("cloudInfra", v)} prefix="$" step={500} min={0} />
                    <NumField label="Prof. Services Amortized (mo)" value={d.psAmortized} onChange={v => set("psAmortized", v)} prefix="$" step={500} min={0} />
                    <NumField label="Facilities (mo)" value={d.facilitiesCost} onChange={v => set("facilitiesCost", v)} prefix="$" step={500} min={0} />
                    <NumField label="Implementation (one-time)" value={d.implementationOneTime} onChange={v => set("implementationOneTime", v)} prefix="$" step={5000} min={0} pulled={pulled.implementationOneTime} hint="For 3-year view. 0 if steady-state" />
                    <NumField label="Annual Cost Escalator" value={d.escalatorPct} onChange={v => set("escalatorPct", v)} suffix="%" factor={100} step={0.5} min={0} max={20} hint="Labor + license inflation/yr" />
                  </div>
                </div>

                {/* Stance selector */}
                <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 22px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                  <div><div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Savings stance</div><div style={{ fontSize: 12, color: MUTED }}>{STANCE[stance].note}</div></div>
                  <div style={{ display: "flex", gap: 6, background: WARM, padding: 4, borderRadius: 8 }}>
                    {Object.entries(STANCE).map(([k, v]) => (
                      <button key={k} onClick={() => setStance(k)} style={{ fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 6, border: "none", cursor: "pointer", background: stance === k ? ELECTRIC : "transparent", color: stance === k ? "#fff" : SLATE }}>{v.label}</button>
                    ))}
                  </div>
                </div>

                <div style={{ background: NAVY, borderRadius: 14, padding: "32px 28px", color: "#fff", marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", color: LIGHT, marginBottom: 20 }}>Complete TCO Results</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }} className="kpi-grid">
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "18px 16px" }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Annual TCO</div>
                      <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: LIGHT }}>{fmtK(r.annual)}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Monthly {fmtK(r.monthly)}</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "18px 16px" }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>3-Year TCO</div>
                      <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: "#fff" }}>{fmtK(r.threeYear)}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{n(d.implementationOneTime) > 0 ? fmtK(n(d.implementationOneTime)) + " impl + " : ""}{Math.round(n(d.escalatorPct) * 100)}%/yr escalator</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "18px 16px" }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Per Agent/Month</div>
                      <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: getBench(r.monthly / r.agents, 4500, 7500, true) }}>{fmt(r.monthly / r.agents)}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Industry: $4.5K–$7.5K loaded</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 24 }} className="kpi-grid">
                    {[{ l: "Cost Per Contact", v: "$" + r.costPerContact.toFixed(2) }, { l: "Cost Per Resolution", v: "$" + r.costPerResolution.toFixed(2) }, { l: "Marginal / Contact", v: "$" + r.marginalPerContact.toFixed(2) }, { l: "Contacts / Agent/Mo", v: Math.round(r.contacts / r.agents).toLocaleString() }].map((item, i) => (
                      <div key={i} style={{ textAlign: "center" }}><div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{item.l}</div><div style={{ fontSize: 20, fontWeight: 600, color: "#fff" }}>{item.v}</div></div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>Cost Distribution</div>
                    <div style={{ display: "flex", height: 24, borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ width: pct(r.laborPct), background: ELECTRIC, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 9, fontWeight: 600, color: "#fff" }}>{pct(r.laborPct)}</span></div>
                      <div style={{ width: pct(r.techPct), background: LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 9, fontWeight: 600, color: NAVY }}>{pct(r.techPct)}</span></div>
                      <div style={{ width: pct(r.overheadPct), background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 9, fontWeight: 600, color: "#fff" }}>{pct(r.overheadPct)}</span></div>
                    </div>
                    <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>■ Labor {fmtK(r.labor)}/mo</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>■ Tech {fmtK(r.tech)}/mo</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>■ Overhead {fmtK(r.overhead)}/mo</span>
                    </div>
                  </div>
                </div>

                {/* Analyst Read */}
                <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderLeft: `3px solid ${ELECTRIC}`, borderRadius: 12, padding: "20px 22px", marginBottom: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: ELECTRIC, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Analyst Read · what these numbers mean</div>
                  {analyst.map((t, i) => <p key={i} style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: i ? "8px 0 0" : 0 }}>{t}</p>)}
                </div>

                {opt.items.length > 0 && (
                  <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 24px", marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                      <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, fontWeight: 400, color: NAVY, margin: 0 }}>Optimization Opportunities</h3>
                      <div style={{ fontSize: 12, color: MUTED }}>Realistic <strong style={{ color: GREEN }}>{fmtK(opt.netTotal)}/mo</strong> ({fmtK(opt.netTotal * 12)}/yr) · theoretical {fmtK(opt.grossTotal)}/mo</div>
                    </div>
                    <p style={{ fontSize: 11, color: MUTED, margin: "0 0 12px", lineHeight: 1.5 }}>De-overlapped: each lever acts on the volume the prior leaves, valued at marginal cost, then scaled by the {STANCE[stance].label.toLowerCase()} stance. They do not double-count.</p>
                    {opt.items.map((o, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16, padding: "12px 0", borderBottom: i < opt.items.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: 14, fontWeight: 600, color: NAVY, margin: "0 0 2px" }}>{o.title}</h4>
                          <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, margin: 0 }}>{o.desc}</p>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ background: `${GREEN}15`, color: GREEN, fontSize: 13, fontWeight: 700, padding: "5px 10px", borderRadius: 6 }}>{fmtK(o.net)}/mo</div>
                          <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>gross {fmtK(o.gross)}</div>
                        </div>
                      </div>
                    ))}
                    {opt.occRisk && <p style={{ fontSize: 12, color: AMBER, margin: "12px 0 0", fontWeight: 600 }}>⚠ Occupancy above {Math.round(BENCH.occupancy.cautionMax * 100)}% — capturing these savings by cutting heads will push occupancy higher and risk attrition. Re-staff to the 83–87% band, don't just trim.</p>}
                  </div>
                )}

                <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "28px 24px", textAlign: "center" }}>
                  {sent ? (
                    <div>
                      <div style={{ fontSize: 22, color: LIGHT, marginBottom: 8 }}>✓</div>
                      <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: "#fff", margin: "0 0 8px" }}>Results sent. We'll be in touch.</h3>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Your full TCO breakdown is with our advisory team.</p>
                    </div>
                  ) : (
                    <div>
                      <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: "#fff", margin: "0 0 8px" }}>Take this to your team</h3>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 20px" }}>Download the board-ready breakdown, or send it to our advisory team to review the highest-impact levers with you.</p>
                      <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                        <ReportExport toolName="Total Cost of Ownership Analysis" subtitle={r.agents + " agents · " + d.industry + " · " + STANCE[stance].label + " stance"} userName="" userEmail="" sections={[
                          { title: "Organization Profile", type: "table", rows: [
                            ["Agents", r.agents.toString()], ["Supervisors", String(d.supervisors)], ["Sites", String(d.sites)],
                            ["Industry", INDUSTRY[d.industry]?.label || d.industry], ["Monthly Contacts", r.contacts.toLocaleString()],
                            ["AHT", mmss(d.aht)], ["FCR", pct(d.fcr)], ["Containment", pct(d.containment)], ["Occupancy", pct(d.occupancy)], ["Attrition", pct(d.attrition)],
                          ]},
                          { title: "TCO Summary", type: "metrics", items: [
                            { label: "Annual TCO", value: fmtK(r.annual), color: ELECTRIC, sub: "Monthly " + fmtK(r.monthly) },
                            { label: "3-Year TCO", value: fmtK(r.threeYear), color: ELECTRIC, sub: Math.round(n(d.escalatorPct) * 100) + "%/yr escalator" },
                            { label: "Per Agent/Month", value: fmt(r.monthly / r.agents), color: getBench(r.monthly / r.agents, 4500, 7500, true) },
                            { label: "Cost per Contact", value: "$" + r.costPerContact.toFixed(2), color: ELECTRIC },
                            { label: "Cost per Resolution", value: "$" + r.costPerResolution.toFixed(2), color: r.costPerResolution > r.costPerContact * 1.25 ? RED : AMBER },
                            { label: "Marginal per Contact", value: "$" + r.marginalPerContact.toFixed(2), color: MUTED, sub: "variable cost" },
                          ]},
                          { title: "3-Year Projection", type: "table", rows: [
                            ["Year 1", fmtK(r.y1)], ["Year 2", fmtK(r.y2) + ` (+${Math.round(n(d.escalatorPct) * 100)}%)`], ["Year 3", fmtK(r.y3)],
                            ...(n(d.implementationOneTime) > 0 ? [["One-time implementation", fmtK(n(d.implementationOneTime))]] : []),
                            ["3-Year Total", fmtK(r.threeYear)],
                          ]},
                          { title: "Cost Distribution", type: "table", rows: [
                            ["Labor", fmtK(r.labor) + "/mo (" + pct(r.laborPct) + ")"],
                            ["Technology", fmtK(r.tech) + "/mo (" + pct(r.techPct) + ")"],
                            ["Overhead", fmtK(r.overhead) + "/mo (" + pct(r.overheadPct) + ")"],
                          ]},
                          { title: "Analyst Read", type: "findings", items: analyst },
                          { title: "Optimization Opportunities", type: "actions", items: opt.items.slice(0, 4).map((o, i) => ({ action: o.title + " — " + fmtK(o.net) + "/mo", detail: o.desc, priority: i === 0 ? "high" : i === 1 ? "medium" : undefined })) },
                          { title: "Methodology", type: "text", content: `TCO covers labor, technology, and overhead at ${173} productive hours/agent/month. The 3-year view carries the current operation forward at a ${Math.round(n(d.escalatorPct) * 100)}% annual escalator plus any one-time implementation; year 1 equals the annual snapshot so the views reconcile. Optimization savings are valued at marginal (variable) cost — handle-time labor freed per contact — not fully-loaded cost per contact, because fixed tech and facilities don't fall when volume drops. Levers are de-overlapped (each acts on the volume the prior leaves) and scaled by a ${STANCE[stance].label} confidence stance, so totals are defensible rather than inflated.` },
                          { title: "Next Steps", type: "next", items: [
                            { tool: "License Bundle Gap Checker", reason: "Audit whether your seat price covers what you actually need", href: "/tools/license-gap" },
                            { tool: "AI Deflection Reality Check", reason: "Pressure-test the containment savings above", href: "/tools/ai-deflection" },
                            { tool: "Business Case Builder", reason: "Turn these savings into a board-ready ROI case", href: "/tools/business-case" },
                          ]},
                        ]} />
                        <button onClick={sendResults} disabled={sending} style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8, border: "none", cursor: sending ? "wait" : "pointer" }}>{sending ? "Sending..." : "Send Results & Request Session"}</button>
                        <a href="/contact" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 14, padding: "12px 24px", borderRadius: 8 }}>Full Contact Form →</a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={WRAP}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LogoMark size={28} />
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span>
          </a>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="/privacy" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Privacy</a>
            <a href="/terms" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function TCOCalculator() {
  return (
    <div>
      <Nav />
      <Calculator />
      <Footer />
    </div>
  );
}
