import { useState, useEffect, useRef } from "react";

const NAVY = "#0B1D3A";
const DEEP = "#061325";
const ELECTRIC = "#0088DD";
const LIGHT = "#00AAFF";
const ICE = "#E8F4FD";
const WARM = "#F8FAFB";
const SLATE = "#3A4F6A";
const MUTED = "#6B7F99";
const BORDER = "#D8E3ED";
const GREEN = "#10B981";
const AMBER = "#F59E0B";
const RED = "#EF4444";

const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };

const n = (v) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };
const fmt = (v) => "$" + Math.round(n(v)).toLocaleString();
const fmtK = (v) => { const x = n(v); return x >= 1000000 ? "$" + (x / 1000000).toFixed(1) + "M" : x >= 1000 ? "$" + (x / 1000).toFixed(0) + "K" : "$" + Math.round(x).toLocaleString(); };
const pct = (v) => (n(v) * 100).toFixed(1) + "%";

function LogoMark({ size = 34, light = true }) {
  const arcColor = light ? "#fff" : NAVY;
  const xColor = light ? LIGHT : ELECTRIC;
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
    { name: "Platforms & Tech", href: "/platforms-and-tech" },
    { name: "How to Choose", href: "/how-to-choose" },
    { name: "Research", href: "/research" },
    { name: "Vendors", href: "/vendors" },
    { name: "Advisory", href: "/advisory" },
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
        @media (max-width: 860px) { .nav-links { display: none !important; } .results-grid { grid-template-columns: 1fr !important; } .kpi-grid { grid-template-columns: 1fr 1fr !important; } .input-row { grid-template-columns: 1fr 1fr !important; } }
      `}</style>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: "rgba(6,19,37,0.96)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "12px 0" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LogoMark size={34} />
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 14.5, letterSpacing: 0.4, fontFamily: "'DM Sans', sans-serif" }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span>
          </a>
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {links.map(l => <a key={l.name} href={l.href} style={{ color: "rgba(255,255,255,0.7)", fontSize: 13.5, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>{l.name}</a>)}
            <a href="/contact" style={{ color: "#fff", fontSize: 13, fontWeight: 600, background: ELECTRIC, padding: "9px 20px", borderRadius: 6, fontFamily: "'DM Sans', sans-serif" }}>Request Briefing</a>
          </div>
        </div>
      </nav>
    </>
  );
}

function InputField({ label, value, onChange, hint, prefix, suffix, step }) {
  const [local, setLocal] = useState(String(value));
  useEffect(() => { setLocal(String(value)); }, [value]);
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: SLATE, display: "block", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>{label}</label>
      <div style={{ position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: MUTED }}>{prefix}</span>}
        <input
          type="text"
          inputMode="decimal"
          value={local}
          onChange={e => setLocal(e.target.value)}
          onBlur={() => { const parsed = parseFloat(local); onChange(isNaN(parsed) ? 0 : parsed); }}
          style={{ width: "100%", padding: "10px 12px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, transition: "border-color 0.2s", paddingLeft: prefix ? 28 : 12, paddingRight: suffix ? 36 : 12 }}
        />
        {suffix && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: MUTED }}>{suffix}</span>}
      </div>
      {hint && <div style={{ fontSize: 11, color: MUTED, marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>{hint}</div>}
    </div>
  );
}

function PctField({ label, value, onChange, hint }) {
  const displayVal = Math.round(n(value) * 100);
  const [local, setLocal] = useState(String(displayVal));
  useEffect(() => { setLocal(String(Math.round(n(value) * 100))); }, [value]);
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: SLATE, display: "block", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type="text"
          inputMode="decimal"
          value={local}
          onChange={e => setLocal(e.target.value)}
          onBlur={() => { const parsed = parseFloat(local); onChange(isNaN(parsed) ? 0 : parsed / 100); }}
          style={{ width: "100%", padding: "10px 12px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, transition: "border-color 0.2s", paddingRight: 32 }}
        />
        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: MUTED }}>%</span>
      </div>
      {hint && <div style={{ fontSize: 11, color: typeof hint === "string" ? MUTED : undefined, marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>{hint}</div>}
    </div>
  );
}

function Calculator() {
  const industryDefaults = {
    general: { label: "Cross-Industry Average", agents: 200, agentHourly: 18, monthlyContacts: 120000, aht: 420, fcr: 0.72, containment: 0.25, occupancy: 0.82, shrinkage: 0.30, attrition: 0.35, absenteeism: 0.08, channelMixVoice: 0.55, channelMixChat: 0.25, channelMixEmail: 0.12, channelMixSocial: 0.05, channelMixSelfServe: 0.03, csat: 4.1, nps: 32, transferRate: 0.15, acw: 60, ccaasSeat: 150 },
    financial: { label: "Financial Services", agents: 350, agentHourly: 22, monthlyContacts: 180000, aht: 380, fcr: 0.75, containment: 0.20, occupancy: 0.80, shrinkage: 0.28, attrition: 0.28, absenteeism: 0.07, channelMixVoice: 0.50, channelMixChat: 0.28, channelMixEmail: 0.14, channelMixSocial: 0.04, channelMixSelfServe: 0.04, csat: 4.0, nps: 35, transferRate: 0.12, acw: 75, ccaasSeat: 175 },
    healthcare: { label: "Healthcare", agents: 250, agentHourly: 20, monthlyContacts: 140000, aht: 480, fcr: 0.68, containment: 0.18, occupancy: 0.78, shrinkage: 0.32, attrition: 0.32, absenteeism: 0.09, channelMixVoice: 0.62, channelMixChat: 0.20, channelMixEmail: 0.12, channelMixSocial: 0.03, channelMixSelfServe: 0.03, csat: 3.9, nps: 28, transferRate: 0.18, acw: 90, ccaasSeat: 165 },
    retail: { label: "Retail & eCommerce", agents: 180, agentHourly: 16, monthlyContacts: 150000, aht: 340, fcr: 0.70, containment: 0.30, occupancy: 0.84, shrinkage: 0.32, attrition: 0.42, absenteeism: 0.10, channelMixVoice: 0.40, channelMixChat: 0.32, channelMixEmail: 0.15, channelMixSocial: 0.08, channelMixSelfServe: 0.05, csat: 4.2, nps: 38, transferRate: 0.14, acw: 45, ccaasSeat: 135 },
    telecom: { label: "Telecommunications", agents: 400, agentHourly: 19, monthlyContacts: 250000, aht: 520, fcr: 0.65, containment: 0.22, occupancy: 0.85, shrinkage: 0.30, attrition: 0.38, absenteeism: 0.08, channelMixVoice: 0.52, channelMixChat: 0.26, channelMixEmail: 0.12, channelMixSocial: 0.06, channelMixSelfServe: 0.04, csat: 3.8, nps: 22, transferRate: 0.20, acw: 70, ccaasSeat: 155 },
    insurance: { label: "Insurance", agents: 300, agentHourly: 21, monthlyContacts: 100000, aht: 540, fcr: 0.70, containment: 0.15, occupancy: 0.78, shrinkage: 0.28, attrition: 0.25, absenteeism: 0.06, channelMixVoice: 0.60, channelMixChat: 0.22, channelMixEmail: 0.13, channelMixSocial: 0.03, channelMixSelfServe: 0.02, csat: 4.0, nps: 30, transferRate: 0.16, acw: 95, ccaasSeat: 170 },
    bpo: { label: "BPO / Outsourcer", agents: 500, agentHourly: 14, monthlyContacts: 300000, aht: 400, fcr: 0.68, containment: 0.28, occupancy: 0.86, shrinkage: 0.34, attrition: 0.55, absenteeism: 0.12, channelMixVoice: 0.58, channelMixChat: 0.24, channelMixEmail: 0.10, channelMixSocial: 0.05, channelMixSelfServe: 0.03, csat: 3.9, nps: 25, transferRate: 0.17, acw: 55, ccaasSeat: 120 },
  };

  const baseDefaults = { supervisors: 20, qaStaff: 5, wfmStaff: 4, trainers: 3, itSupport: 4, sites: 2, agentBenefitsPct: 0.30, supHourly: 30, qaHourly: 28, wfmHourly: 32, trainerHourly: 26, itHourly: 35, scheduleAdherence: 0.90, avgSpeedAnswer: 28, abandonRate: 0.06, avgHoldTime: 45, newHireTrainingDays: 21, qualityScore: 0.82, wemSeat: 45, telephonyPerMin: 0.025, ivaMonthly: 8000, agentAssistMonthly: 5000, rpaMonthly: 3000, analyticsMonthly: 6000, crmSeat: 75, ipaasMonthly: 4000, recordingMonthly: 3500, knowledgeMgmt: 2500, securityCompliance: 3000, cloudInfra: 5000, psAmortized: 8000, recruitingCostPerHire: 3500, facilitiesCost: 12000 };

  const loadIndustry = (key) => {
    const ind = industryDefaults[key];
    setD(prev => ({ ...prev, ...baseDefaults, ...ind, industry: key }));
  };

  const [d, setD] = useState({ ...baseDefaults, ...industryDefaults.general, industry: "general" });
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const [activeSection, setActiveSection] = useState(0);
  const [sendingResults, setSendingResults] = useState(false);
  const [resultsSent, setResultsSent] = useState(false);

  const hoursPerMonth = 173;
  const agentLoadedHourly = n(d.agentHourly) * (1 + n(d.agentBenefitsPct));
  const monthlyAgentLabor = n(d.agents) * agentLoadedHourly * hoursPerMonth;
  const monthlySupLabor = n(d.supervisors) * n(d.supHourly) * 1.25 * hoursPerMonth;
  const monthlyQaLabor = n(d.qaStaff) * n(d.qaHourly) * 1.25 * hoursPerMonth;
  const monthlyWfmLabor = n(d.wfmStaff) * n(d.wfmHourly) * 1.25 * hoursPerMonth;
  const monthlyTrainerLabor = n(d.trainers) * n(d.trainerHourly) * 1.25 * hoursPerMonth;
  const monthlyItLabor = n(d.itSupport) * n(d.itHourly) * 1.25 * hoursPerMonth;
  const totalMonthlyLabor = monthlyAgentLabor + monthlySupLabor + monthlyQaLabor + monthlyWfmLabor + monthlyTrainerLabor + monthlyItLabor;

  const monthlyAttritionHires = Math.round(n(d.agents) * n(d.attrition) / 12);
  const monthlyAttritionCost = monthlyAttritionHires * (n(d.recruitingCostPerHire) + (n(d.newHireTrainingDays) * 8 * agentLoadedHourly));

  const voiceContacts = n(d.monthlyContacts) * n(d.channelMixVoice);
  const totalVoiceMinutes = voiceContacts * ((n(d.aht) + n(d.avgHoldTime) + n(d.acw)) / 60);
  const monthlyTelephony = totalVoiceMinutes * n(d.telephonyPerMin);

  const totalPlatformSeats = n(d.agents) + n(d.supervisors) + n(d.qaStaff) + n(d.wfmStaff);
  const monthlyCcaas = totalPlatformSeats * n(d.ccaasSeat);
  const monthlyWem = totalPlatformSeats * n(d.wemSeat);
  const monthlyCrm = totalPlatformSeats * n(d.crmSeat);
  const monthlyAI = n(d.ivaMonthly) + n(d.agentAssistMonthly) + n(d.rpaMonthly);
  const totalMonthlyTech = monthlyCcaas + monthlyWem + monthlyCrm + monthlyAI + n(d.analyticsMonthly) + n(d.ipaasMonthly) + n(d.recordingMonthly) + n(d.knowledgeMgmt) + n(d.securityCompliance) + monthlyTelephony;
  const totalMonthlyOverhead = n(d.cloudInfra) + n(d.psAmortized) + n(d.facilitiesCost) + monthlyAttritionCost;
  const totalMonthlyTCO = totalMonthlyLabor + totalMonthlyTech + totalMonthlyOverhead;
  const annualTCO = totalMonthlyTCO * 12;
  const agents = n(d.agents) || 1;
  const contacts = n(d.monthlyContacts) || 1;
  const tcoPerAgent = totalMonthlyTCO / agents;
  const costPerContact = totalMonthlyTCO / contacts;
  const resolvedContacts = contacts * n(d.fcr);
  const costPerResolution = totalMonthlyTCO / (resolvedContacts || 1);
  const humanContacts = contacts * (1 - n(d.containment));
  const costPerHuman = totalMonthlyTCO / (humanContacts || 1);
  const laborPct = totalMonthlyLabor / (totalMonthlyTCO || 1);
  const techPct = totalMonthlyTech / (totalMonthlyTCO || 1);
  const overheadPct = totalMonthlyOverhead / (totalMonthlyTCO || 1);

  const getBench = (val, low, high, inverse) => {
    if (inverse) return val <= low ? GREEN : val >= high ? RED : AMBER;
    return val >= high ? GREEN : val <= low ? RED : AMBER;
  };

  const optimizations = [];
  if (n(d.containment) < 0.30) optimizations.push({ title: "Increase self-service containment", impact: fmtK((0.30 - n(d.containment)) * contacts * costPerContact * 0.6), desc: `Moving containment from ${pct(d.containment)} to 30% could deflect ${Math.round((0.30 - n(d.containment)) * contacts).toLocaleString()} contacts monthly.` });
  if (n(d.fcr) < 0.75) optimizations.push({ title: "Improve first contact resolution", impact: fmtK((0.75 - n(d.fcr)) * contacts * costPerContact * 0.4), desc: `Improving FCR from ${pct(d.fcr)} to 75% reduces repeat contacts and rework cost.` });
  if (n(d.aht) > 420) optimizations.push({ title: "Reduce average handle time", impact: fmtK(((n(d.aht) - 420) / 60) * humanContacts * (agentLoadedHourly / 60)), desc: `Bringing AHT from ${Math.floor(n(d.aht) / 60)}:${String(n(d.aht) % 60).padStart(2, "0")} to 7:00 saves agent hours.` });
  if (n(d.attrition) > 0.30) optimizations.push({ title: "Reduce agent attrition", impact: fmtK(((n(d.attrition) - 0.30) * agents / 12) * (n(d.recruitingCostPerHire) + n(d.newHireTrainingDays) * 8 * agentLoadedHourly)), desc: `Reducing attrition from ${pct(d.attrition)} to 30% saves recruiting, training, and ramp-up costs.` });
  if (n(d.transferRate) > 0.10) optimizations.push({ title: "Reduce unnecessary transfers", impact: fmtK((n(d.transferRate) - 0.10) * contacts * costPerContact * 0.3), desc: "Each transfer adds handle time, frustrates customers, and inflates cost per resolution." });
  if (n(d.occupancy) > 0.87) optimizations.push({ title: "Address burnout risk from high occupancy", impact: "Risk mitigation", desc: `Occupancy at ${pct(d.occupancy)} means agents have minimal recovery time between contacts, driving attrition.` });

  const resultsSummary = `TCO Calculator Results\n\nAnnual TCO: ${fmtK(annualTCO)}\nMonthly TCO: ${fmtK(totalMonthlyTCO)}\nPer Agent/Month: ${fmt(tcoPerAgent)}\nCost Per Contact: $${costPerContact.toFixed(2)}\nCost Per Resolution: $${costPerResolution.toFixed(2)}\n\nOrg: ${agents} agents, ${n(d.supervisors)} supervisors, ${n(d.sites)} sites\nIndustry: ${d.industry}\nMonthly Contacts: ${contacts.toLocaleString()}\n\nLabor: ${fmtK(totalMonthlyLabor)}/mo (${pct(laborPct)})\nTechnology: ${fmtK(totalMonthlyTech)}/mo (${pct(techPct)})\nOverhead: ${fmtK(totalMonthlyOverhead)}/mo (${pct(overheadPct)})\n\nKey KPIs:\nAHT: ${Math.floor(n(d.aht)/60)}:${String(n(d.aht)%60).padStart(2,"0")} | FCR: ${pct(d.fcr)} | Containment: ${pct(d.containment)}\nOccupancy: ${pct(d.occupancy)} | Attrition: ${pct(d.attrition)} | CSAT: ${d.csat}\nChannel Mix: Voice ${pct(d.channelMixVoice)} | Chat ${pct(d.channelMixChat)} | Email ${pct(d.channelMixEmail)}\n\nOptimization Opportunities:\n${optimizations.map(o => `- ${o.title}: ${o.impact}`).join("\n")}`;

  const sendResults = () => {
    setSendingResults(true);
    const formData = new FormData();
    formData.append("_subject", "TCO Calculator Results — Center of CX");
    formData.append("source", "TCO Calculator");
    formData.append("tco_results", resultsSummary);
    formData.append("annual_tco", fmtK(annualTCO));
    formData.append("per_agent_month", fmt(tcoPerAgent));
    formData.append("cost_per_contact", "$" + costPerContact.toFixed(2));
    formData.append("agents", String(agents));
    formData.append("industry", d.industry);
    formData.append("monthly_contacts", contacts.toLocaleString());

    fetch("https://formspree.io/f/maqlvwne", {
      method: "POST", body: formData, headers: { Accept: "application/json" },
    }).then(res => { if (res.ok) setResultsSent(true); setSendingResults(false); })
    .catch(() => setSendingResults(false));
  };

  const sections = ["Organization Profile", "Labor Costs", "Operational KPIs", "Channel Mix", "Technology Costs", "Overhead & Results"];

  return (
    <section style={{ background: WARM, padding: "100px 28px 60px", minHeight: "100vh" }}>
      <div style={WRAP}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
            <a href="/" style={{ color: MUTED, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Home</a>
            <span style={{ color: BORDER, fontSize: 13 }}>/</span>
            <a href="/how-to-choose" style={{ color: MUTED, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Tools</a>
            <span style={{ color: BORDER, fontSize: 13 }}>/</span>
            <span style={{ color: ELECTRIC, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>TCO Calculator</span>
          </div>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>Contact Center TCO Calculator</h1>
          <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.6, maxWidth: 640, fontFamily: "'DM Sans', sans-serif" }}>
            Comprehensive total cost of ownership covering labor, technology, 18 operational KPIs, and overhead. Every calculation is transparent and benchmarked against industry data.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 28 }} className="results-grid">
          <div>
            <div style={{ position: "sticky", top: 80 }}>
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
                {sections.map((s, i) => (
                  <button key={i} onClick={() => setActiveSection(i)} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 16px", fontSize: 13, fontWeight: activeSection === i ? 600 : 400, color: activeSection === i ? ELECTRIC : SLATE, background: activeSection === i ? `${ELECTRIC}08` : "transparent", border: "none", borderBottom: i < sections.length - 1 ? `1px solid ${BORDER}` : "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", borderLeft: activeSection === i ? `3px solid ${ELECTRIC}` : "3px solid transparent" }}>{s}</button>
                ))}
              </div>
              <div style={{ background: NAVY, borderRadius: 10, padding: "20px 18px", color: "#fff" }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: LIGHT, marginBottom: 14, fontFamily: "'DM Sans', sans-serif" }}>Live TCO</div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>Annual</div>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, color: LIGHT }}>{fmtK(annualTCO)}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { l: "Agent/Mo", v: fmt(tcoPerAgent) },
                    { l: "Per Contact", v: "$" + costPerContact.toFixed(2) },
                    { l: "Per Resolution", v: "$" + costPerResolution.toFixed(2) },
                    { l: "Labor %", v: pct(laborPct) },
                  ].map((item, i) => (
                    <div key={i}>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "'DM Sans', sans-serif" }}>{item.l}</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>{item.v}</div>
                    </div>
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
                  <InputField label="Total Agents (FTE)" value={d.agents} onChange={v => set("agents", v)} hint="Full-time and FTE-equivalent" />
                  <InputField label="Supervisors" value={d.supervisors} onChange={v => set("supervisors", v)} />
                  <InputField label="QA Analysts" value={d.qaStaff} onChange={v => set("qaStaff", v)} />
                  <InputField label="WFM Staff" value={d.wfmStaff} onChange={v => set("wfmStaff", v)} />
                  <InputField label="Trainers" value={d.trainers} onChange={v => set("trainers", v)} />
                  <InputField label="IT / Tech Support" value={d.itSupport} onChange={v => set("itSupport", v)} />
                  <InputField label="Sites" value={d.sites} onChange={v => set("sites", v)} />
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: SLATE, display: "block", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>Industry</label>
                    <select value={d.industry} onChange={e => loadIndustry(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, cursor: "pointer" }}>
                      <option value="general">Cross-Industry Average</option><option value="financial">Financial Services</option><option value="healthcare">Healthcare</option><option value="retail">Retail & eCommerce</option><option value="telecom">Telecommunications</option><option value="insurance">Insurance</option><option value="bpo">BPO / Outsourcer</option>
                    </select>
                    <div style={{ fontSize: 10, color: GREEN, marginTop: 3, fontFamily: "'DM Sans', sans-serif" }}>✓ All fields prepopulated with {industryDefaults[d.industry]?.label || "industry"} benchmarks. Adjust any value to match your operation.</div>
                  </div>
                  <InputField label="Monthly Contact Volume" value={d.monthlyContacts} onChange={v => set("monthlyContacts", v)} />
                </div>
                <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={() => setActiveSection(1)} style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "10px 22px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Next: Labor Costs →</button>
                </div>
              </div>
            )}

            {activeSection === 1 && (
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 24px" }}>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 20px" }}>Labor Costs</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="input-row">
                  <InputField label="Agent Hourly Rate" value={d.agentHourly} onChange={v => set("agentHourly", v)} prefix="$" />
                  <PctField label="Benefits & Burden %" value={d.agentBenefitsPct} onChange={v => set("agentBenefitsPct", v)} hint="Typically 25–35%" />
                  <div style={{ background: ICE, borderRadius: 6, padding: "10px 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontSize: 11, color: MUTED }}>Loaded Rate</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: NAVY }}>${agentLoadedHourly.toFixed(2)}/hr</div>
                  </div>
                  <InputField label="Supervisor Hourly" value={d.supHourly} onChange={v => set("supHourly", v)} prefix="$" />
                  <InputField label="QA Analyst Hourly" value={d.qaHourly} onChange={v => set("qaHourly", v)} prefix="$" />
                  <InputField label="WFM Analyst Hourly" value={d.wfmHourly} onChange={v => set("wfmHourly", v)} prefix="$" />
                  <InputField label="Trainer Hourly" value={d.trainerHourly} onChange={v => set("trainerHourly", v)} prefix="$" />
                  <InputField label="IT Support Hourly" value={d.itHourly} onChange={v => set("itHourly", v)} prefix="$" />
                  <InputField label="Recruiting Cost/Hire" value={d.recruitingCostPerHire} onChange={v => set("recruitingCostPerHire", v)} prefix="$" />
                </div>
                <div style={{ marginTop: 16, background: ICE, borderRadius: 8, padding: "14px 18px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div><div style={{ fontSize: 11, color: MUTED }}>Monthly Labor</div><div style={{ fontSize: 18, fontWeight: 600, color: NAVY }}>{fmtK(totalMonthlyLabor)}</div></div>
                  <div><div style={{ fontSize: 11, color: MUTED }}>Attrition Cost/Mo</div><div style={{ fontSize: 18, fontWeight: 600, color: NAVY }}>{fmtK(monthlyAttritionCost)}</div><div style={{ fontSize: 11, color: MUTED }}>{monthlyAttritionHires} hires/mo</div></div>
                </div>
                <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setActiveSection(0)} style={{ background: "#fff", border: `1px solid ${BORDER}`, color: SLATE, fontSize: 14, padding: "10px 22px", borderRadius: 6, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
                  <button onClick={() => setActiveSection(2)} style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "10px 22px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Next: KPIs →</button>
                </div>
              </div>
            )}

            {activeSection === 2 && (
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 24px" }}>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 20px" }}>Operational KPIs</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="input-row">
                  <InputField label="AHT (seconds)" value={d.aht} onChange={v => set("aht", v)} hint={<span style={{ color: getBench(n(d.aht), 300, 600, true) }}>{Math.floor(n(d.aht)/60)}:{String(n(d.aht)%60).padStart(2,"0")} — Bench: 5:00–7:00</span>} />
                  <InputField label="ACW (seconds)" value={d.acw} onChange={v => set("acw", v)} hint="After-call work" />
                  <InputField label="Hold Time (seconds)" value={d.avgHoldTime} onChange={v => set("avgHoldTime", v)} />
                  <PctField label="FCR" value={d.fcr} onChange={v => set("fcr", v)} hint={<span style={{ color: getBench(n(d.fcr), 0.65, 0.85) }}>Bench: 65–85%</span>} />
                  <PctField label="Containment" value={d.containment} onChange={v => set("containment", v)} hint={<span style={{ color: getBench(n(d.containment), 0.15, 0.45) }}>Bench: 15–45%</span>} />
                  <PctField label="Occupancy" value={d.occupancy} onChange={v => set("occupancy", v)} hint={<span style={{ color: getBench(n(d.occupancy), 0.90, 0.75, true) }}>75–87%. Above 87% = burnout</span>} />
                  <PctField label="Shrinkage" value={d.shrinkage} onChange={v => set("shrinkage", v)} hint="25–35%" />
                  <PctField label="Annual Attrition" value={d.attrition} onChange={v => set("attrition", v)} hint={<span style={{ color: getBench(n(d.attrition), 0.20, 0.55, true) }}>Bench: 20–40%</span>} />
                  <PctField label="Absenteeism" value={d.absenteeism} onChange={v => set("absenteeism", v)} hint="5–10%" />
                  <PctField label="Schedule Adherence" value={d.scheduleAdherence} onChange={v => set("scheduleAdherence", v)} hint="Target: 88–95%" />
                  <InputField label="ASA (seconds)" value={d.avgSpeedAnswer} onChange={v => set("avgSpeedAnswer", v)} hint="Target: under 30s" />
                  <PctField label="Abandon Rate" value={d.abandonRate} onChange={v => set("abandonRate", v)} hint="Target: under 5%" />
                  <PctField label="Transfer Rate" value={d.transferRate} onChange={v => set("transferRate", v)} />
                  <PctField label="QA Score" value={d.qualityScore} onChange={v => set("qualityScore", v)} />
                  <InputField label="CSAT (1–5)" value={d.csat} onChange={v => set("csat", v)} hint={<span style={{ color: getBench(n(d.csat), 3.5, 4.5) }}>Bench: 3.8–4.5</span>} />
                  <InputField label="NPS (-100 to 100)" value={d.nps} onChange={v => set("nps", v)} />
                  <InputField label="New Hire Training (days)" value={d.newHireTrainingDays} onChange={v => set("newHireTrainingDays", v)} />
                </div>
                <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setActiveSection(1)} style={{ background: "#fff", border: `1px solid ${BORDER}`, color: SLATE, fontSize: 14, padding: "10px 22px", borderRadius: 6, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
                  <button onClick={() => setActiveSection(3)} style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "10px 22px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Next: Channel Mix →</button>
                </div>
              </div>
            )}

            {activeSection === 3 && (
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 24px" }}>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 20px" }}>Channel Mix</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="input-row">
                  <PctField label="Voice" value={d.channelMixVoice} onChange={v => set("channelMixVoice", v)} />
                  <PctField label="Chat / Messaging" value={d.channelMixChat} onChange={v => set("channelMixChat", v)} />
                  <PctField label="Email" value={d.channelMixEmail} onChange={v => set("channelMixEmail", v)} />
                  <PctField label="Social" value={d.channelMixSocial} onChange={v => set("channelMixSocial", v)} />
                  <PctField label="Self-Service" value={d.channelMixSelfServe} onChange={v => set("channelMixSelfServe", v)} />
                  <div style={{ background: ICE, borderRadius: 6, padding: "10px 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontSize: 11, color: MUTED }}>Total</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: Math.abs((n(d.channelMixVoice) + n(d.channelMixChat) + n(d.channelMixEmail) + n(d.channelMixSocial) + n(d.channelMixSelfServe)) - 1) < 0.01 ? GREEN : RED }}>{pct(n(d.channelMixVoice) + n(d.channelMixChat) + n(d.channelMixEmail) + n(d.channelMixSocial) + n(d.channelMixSelfServe))}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>Must equal 100%</div>
                  </div>
                </div>
                <div style={{ marginTop: 16, background: ICE, borderRadius: 8, padding: "14px 18px" }}>
                  <div style={{ fontSize: 11, color: MUTED }}>Monthly Voice Minutes</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: NAVY }}>{Math.round(totalVoiceMinutes).toLocaleString()}</div>
                </div>
                <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setActiveSection(2)} style={{ background: "#fff", border: `1px solid ${BORDER}`, color: SLATE, fontSize: 14, padding: "10px 22px", borderRadius: 6, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
                  <button onClick={() => setActiveSection(4)} style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "10px 22px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Next: Technology →</button>
                </div>
              </div>
            )}

            {activeSection === 4 && (
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 24px" }}>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 20px" }}>Technology Costs <span style={{ fontSize: 13, fontWeight: 400, color: MUTED }}>(monthly)</span></h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="input-row">
                  <InputField label="CCaaS Per Seat" value={d.ccaasSeat} onChange={v => set("ccaasSeat", v)} prefix="$" />
                  <InputField label="WEM Per Seat" value={d.wemSeat} onChange={v => set("wemSeat", v)} prefix="$" />
                  <InputField label="CRM Per Seat" value={d.crmSeat} onChange={v => set("crmSeat", v)} prefix="$" />
                  <InputField label="Telephony Per Min" value={d.telephonyPerMin} onChange={v => set("telephonyPerMin", v)} prefix="$" />
                  <InputField label="IVA / Bot Platform" value={d.ivaMonthly} onChange={v => set("ivaMonthly", v)} prefix="$" />
                  <InputField label="Agent Assist" value={d.agentAssistMonthly} onChange={v => set("agentAssistMonthly", v)} prefix="$" />
                  <InputField label="RPA / Automation" value={d.rpaMonthly} onChange={v => set("rpaMonthly", v)} prefix="$" />
                  <InputField label="Analytics Platform" value={d.analyticsMonthly} onChange={v => set("analyticsMonthly", v)} prefix="$" />
                  <InputField label="iPaaS / Integration" value={d.ipaasMonthly} onChange={v => set("ipaasMonthly", v)} prefix="$" />
                  <InputField label="Recording & Compliance" value={d.recordingMonthly} onChange={v => set("recordingMonthly", v)} prefix="$" />
                  <InputField label="Knowledge Mgmt" value={d.knowledgeMgmt} onChange={v => set("knowledgeMgmt", v)} prefix="$" />
                  <InputField label="Security & Compliance" value={d.securityCompliance} onChange={v => set("securityCompliance", v)} prefix="$" />
                </div>
                <div style={{ marginTop: 16, background: ICE, borderRadius: 8, padding: "14px 18px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div><div style={{ fontSize: 11, color: MUTED }}>Monthly Tech Cost</div><div style={{ fontSize: 18, fontWeight: 600, color: NAVY }}>{fmtK(totalMonthlyTech)}</div></div>
                  <div><div style={{ fontSize: 11, color: MUTED }}>Tech Per Agent/Mo</div><div style={{ fontSize: 18, fontWeight: 600, color: NAVY }}>{fmt(totalMonthlyTech / agents)}</div></div>
                </div>
                <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setActiveSection(3)} style={{ background: "#fff", border: `1px solid ${BORDER}`, color: SLATE, fontSize: 14, padding: "10px 22px", borderRadius: 6, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
                  <button onClick={() => setActiveSection(5)} style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "10px 22px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Next: Results →</button>
                </div>
              </div>
            )}

            {activeSection === 5 && (
              <div>
                <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 24px", marginBottom: 20 }}>
                  <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 20px" }}>Overhead & Facilities</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="input-row">
                    <InputField label="Cloud Infrastructure (mo)" value={d.cloudInfra} onChange={v => set("cloudInfra", v)} prefix="$" />
                    <InputField label="Prof. Services Amortized (mo)" value={d.psAmortized} onChange={v => set("psAmortized", v)} prefix="$" />
                    <InputField label="Facilities (mo)" value={d.facilitiesCost} onChange={v => set("facilitiesCost", v)} prefix="$" />
                  </div>
                </div>

                <div style={{ background: NAVY, borderRadius: 14, padding: "32px 28px", color: "#fff", marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", color: LIGHT, marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>Complete TCO Results</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }} className="kpi-grid">
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "18px 16px" }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Annual TCO</div>
                      <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: LIGHT }}>{fmtK(annualTCO)}</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "18px 16px" }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Monthly TCO</div>
                      <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: "#fff" }}>{fmtK(totalMonthlyTCO)}</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "18px 16px" }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Per Agent/Month</div>
                      <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: getBench(tcoPerAgent, 540, 305, true) }}>{fmt(tcoPerAgent)}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Industry: $305–$540</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 24 }} className="kpi-grid">
                    {[
                      { l: "Cost Per Contact", v: "$" + costPerContact.toFixed(2) },
                      { l: "Cost Per Resolution", v: "$" + costPerResolution.toFixed(2) },
                      { l: "Cost Per Human Contact", v: "$" + costPerHuman.toFixed(2) },
                      { l: "Contacts Per Agent/Mo", v: Math.round(contacts / agents).toLocaleString() },
                    ].map((item, i) => (
                      <div key={i} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{item.l}</div>
                        <div style={{ fontSize: 20, fontWeight: 600, color: "#fff" }}>{item.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 6 }}>Cost Distribution</div>
                    <div style={{ display: "flex", height: 24, borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ width: pct(laborPct), background: ELECTRIC, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 9, fontWeight: 600, color: "#fff" }}>{pct(laborPct)}</span></div>
                      <div style={{ width: pct(techPct), background: LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 9, fontWeight: 600, color: NAVY }}>{pct(techPct)}</span></div>
                      <div style={{ width: pct(overheadPct), background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 9, fontWeight: 600, color: "#fff" }}>{pct(overheadPct)}</span></div>
                    </div>
                    <div style={{ display: "flex", gap: 16, marginTop: 6 }}>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>■ Labor {fmtK(totalMonthlyLabor)}/mo</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>■ Tech {fmtK(totalMonthlyTech)}/mo</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>■ Overhead {fmtK(totalMonthlyOverhead)}/mo</span>
                    </div>
                  </div>
                </div>

                {optimizations.length > 0 && (
                  <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 24px", marginBottom: 20 }}>
                    <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, fontWeight: 400, color: NAVY, margin: "0 0 16px" }}>Optimization Opportunities</h3>
                    {optimizations.map((opt, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16, padding: "12px 0", borderBottom: i < optimizations.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: 14, fontWeight: 600, color: NAVY, margin: "0 0 2px" }}>{opt.title}</h4>
                          <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, margin: 0 }}>{opt.desc}</p>
                        </div>
                        <div style={{ background: `${GREEN}15`, color: GREEN, fontSize: 13, fontWeight: 700, padding: "5px 10px", borderRadius: 6, flexShrink: 0 }}>{opt.impact}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "28px 24px", textAlign: "center" }}>
                  {resultsSent ? (
                    <div>
                      <div style={{ fontSize: 22, color: LIGHT, marginBottom: 8 }}>✓</div>
                      <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: "#fff", margin: "0 0 8px" }}>Results sent. We'll be in touch.</h3>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Your full TCO breakdown has been sent to our advisory team. We'll review your numbers and come prepared.</p>
                    </div>
                  ) : (
                    <div>
                      <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: "#fff", margin: "0 0 8px" }}>Want help interpreting these numbers?</h3>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: "0 0 20px" }}>Send your results to our advisory team. We'll review your TCO breakdown, identify the highest-impact levers, and come to the working session prepared.</p>
                      <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                        <button onClick={sendResults} disabled={sendingResults} style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8, border: "none", cursor: sendingResults ? "wait" : "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                          {sendingResults ? "Sending..." : "Send Results & Request Session"}
                        </button>
                        <a href="/contact" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 14, padding: "12px 24px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif" }}>Go to Full Contact Form →</a>
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
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span>
          </a>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif" }}>© 2026 The Center of CX. All rights reserved.</span>
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
