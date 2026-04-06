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
        input[type="number"]::-webkit-inner-spin-button { opacity: 1; }
        input:focus, select:focus { outline: none; border-color: ${ELECTRIC} !important; box-shadow: 0 0 0 3px rgba(0,136,221,0.1); }
        @media (max-width: 860px) { .nav-links { display: none !important; } .results-grid { grid-template-columns: 1fr !important; } .kpi-grid { grid-template-columns: 1fr !important; } .input-row { grid-template-columns: 1fr !important; } }
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

const fmt = (n) => n === undefined || isNaN(n) ? "$0" : "$" + Math.round(n).toLocaleString();
const fmtK = (n) => n === undefined || isNaN(n) ? "$0" : n >= 1000000 ? "$" + (n / 1000000).toFixed(1) + "M" : n >= 1000 ? "$" + (n / 1000).toFixed(0) + "K" : "$" + Math.round(n).toLocaleString();
const pct = (n) => (n * 100).toFixed(1) + "%";

function Calculator() {
  // ─── ORG PROFILE ───
  const [agents, setAgents] = useState(200);
  const [supervisors, setSupervisors] = useState(20);
  const [qaStaff, setQaStaff] = useState(5);
  const [wfmStaff, setWfmStaff] = useState(4);
  const [trainers, setTrainers] = useState(3);
  const [itSupport, setItSupport] = useState(4);
  const [sites, setSites] = useState(2);
  const [industry, setIndustry] = useState("general");

  // ─── LABOR COSTS ───
  const [agentHourly, setAgentHourly] = useState(18);
  const [agentBenefitsPct, setAgentBenefitsPct] = useState(0.30);
  const [supHourly, setSupHourly] = useState(30);
  const [qaHourly, setQaHourly] = useState(28);
  const [wfmHourly, setWfmHourly] = useState(32);
  const [trainerHourly, setTrainerHourly] = useState(26);
  const [itHourly, setItHourly] = useState(35);

  // ─── OPERATIONAL KPIs ───
  const [monthlyContacts, setMonthlyContacts] = useState(120000);
  const [aht, setAht] = useState(420); // seconds
  const [fcr, setFcr] = useState(0.72);
  const [containment, setContainment] = useState(0.25);
  const [occupancy, setOccupancy] = useState(0.82);
  const [shrinkage, setShrinkage] = useState(0.30);
  const [attrition, setAttrition] = useState(0.35);
  const [absenteeism, setAbsenteeism] = useState(0.08);
  const [scheduleAdherence, setScheduleAdherence] = useState(0.90);
  const [avgSpeedAnswer, setAvgSpeedAnswer] = useState(28); // seconds
  const [abandonRate, setAbandonRate] = useState(0.06);
  const [transferRate, setTransferRate] = useState(0.15);
  const [avgHoldTime, setAvgHoldTime] = useState(45); // seconds
  const [acw, setAcw] = useState(60); // seconds
  const [newHireTrainingDays, setNewHireTrainingDays] = useState(21);
  const [qualityScore, setQualityScore] = useState(0.82);
  const [csat, setCsat] = useState(4.1);
  const [nps, setNps] = useState(32);
  const [channelMixVoice, setChannelMixVoice] = useState(0.55);
  const [channelMixChat, setChannelMixChat] = useState(0.25);
  const [channelMixEmail, setChannelMixEmail] = useState(0.12);
  const [channelMixSocial, setChannelMixSocial] = useState(0.05);
  const [channelMixSelfServe, setChannelMixSelfServe] = useState(0.03);

  // ─── TECHNOLOGY COSTS (monthly) ───
  const [ccaasSeat, setCcaasSeat] = useState(150);
  const [wemSeat, setWemSeat] = useState(45);
  const [telephonyPerMin, setTelephonyPerMin] = useState(0.025);
  const [ivaMonthly, setIvaMonthly] = useState(8000);
  const [agentAssistMonthly, setAgentAssistMonthly] = useState(5000);
  const [rpaMonthly, setRpaMonthly] = useState(3000);
  const [analyticsMonthly, setAnalyticsMonthly] = useState(6000);
  const [crmSeat, setCrmSeat] = useState(75);
  const [ipaasMonthly, setIpaasMonthly] = useState(4000);
  const [recordingMonthly, setRecordingMonthly] = useState(3500);
  const [knowledgeMgmt, setKnowledgeMgmt] = useState(2500);
  const [securityCompliance, setSecurityCompliance] = useState(3000);

  // ─── OVERHEAD COSTS (monthly) ───
  const [cloudInfra, setCloudInfra] = useState(5000);
  const [psAmortized, setPsAmortized] = useState(8000);
  const [recruitingCostPerHire, setRecruitingCostPerHire] = useState(3500);
  const [facilitiesCost, setFacilitiesCost] = useState(12000);

  // ─── ACTIVE SECTION ───
  const [activeSection, setActiveSection] = useState(0);

  // ─── CALCULATIONS ───
  const hoursPerMonth = 173;
  const totalAgentFTE = agents;

  // Labor
  const agentLoadedHourly = agentHourly * (1 + agentBenefitsPct);
  const monthlyAgentLabor = totalAgentFTE * agentLoadedHourly * hoursPerMonth;
  const monthlySupLabor = supervisors * supHourly * (1 + 0.25) * hoursPerMonth;
  const monthlyQaLabor = qaStaff * qaHourly * (1 + 0.25) * hoursPerMonth;
  const monthlyWfmLabor = wfmStaff * wfmHourly * (1 + 0.25) * hoursPerMonth;
  const monthlyTrainerLabor = trainers * trainerHourly * (1 + 0.25) * hoursPerMonth;
  const monthlyItLabor = itSupport * itHourly * (1 + 0.25) * hoursPerMonth;
  const totalMonthlyLabor = monthlyAgentLabor + monthlySupLabor + monthlyQaLabor + monthlyWfmLabor + monthlyTrainerLabor + monthlyItLabor;

  // Attrition cost
  const monthlyAttritionHires = Math.round(agents * attrition / 12);
  const monthlyAttritionCost = monthlyAttritionHires * (recruitingCostPerHire + (newHireTrainingDays * 8 * agentLoadedHourly));

  // Telephony
  const voiceContacts = monthlyContacts * channelMixVoice;
  const totalVoiceMinutes = voiceContacts * ((aht + avgHoldTime + acw) / 60);
  const monthlyTelephony = totalVoiceMinutes * telephonyPerMin;

  // Platform costs
  const totalPlatformSeats = agents + supervisors + qaStaff + wfmStaff;
  const monthlyCcaas = totalPlatformSeats * ccaasSeat;
  const monthlyWem = totalPlatformSeats * wemSeat;
  const monthlyCrm = totalPlatformSeats * crmSeat;
  const monthlyAI = ivaMonthly + agentAssistMonthly + rpaMonthly;
  const monthlyAnalytics = analyticsMonthly;
  const monthlyIntegration = ipaasMonthly;
  const monthlyRecording = recordingMonthly;
  const monthlyKnowledge = knowledgeMgmt;
  const monthlySecurity = securityCompliance;
  const totalMonthlyTech = monthlyCcaas + monthlyWem + monthlyCrm + monthlyAI + monthlyAnalytics + monthlyIntegration + monthlyRecording + monthlyKnowledge + monthlySecurity + monthlyTelephony;

  // Overhead
  const totalMonthlyOverhead = cloudInfra + psAmortized + facilitiesCost + monthlyAttritionCost;

  // Totals
  const totalMonthlyTCO = totalMonthlyLabor + totalMonthlyTech + totalMonthlyOverhead;
  const annualTCO = totalMonthlyTCO * 12;
  const tcoPerAgent = totalMonthlyTCO / agents;
  const costPerContact = totalMonthlyTCO / monthlyContacts;
  const resolvedContacts = monthlyContacts * fcr;
  const costPerResolution = totalMonthlyTCO / resolvedContacts;
  const humanHandledContacts = monthlyContacts * (1 - containment);
  const costPerHumanContact = totalMonthlyTCO / humanHandledContacts;

  // Benchmarks (from architecture spreadsheet)
  const benchmarks = {
    tcoPerAgent: { low: 305, mid: 422, high: 540, label: "Industry range: $305–$540 AAPM" },
    costPerContact: { low: 3.50, mid: 6.00, high: 9.50 },
    aht: { low: 300, mid: 420, high: 600 },
    fcr: { low: 0.65, mid: 0.74, high: 0.85 },
    containment: { low: 0.15, mid: 0.30, high: 0.45 },
    occupancy: { low: 0.75, mid: 0.83, high: 0.90 },
    attrition: { low: 0.20, mid: 0.35, high: 0.55 },
    csat: { low: 3.5, mid: 4.0, high: 4.5 },
  };

  const getBenchColor = (val, bench, inverse = false) => {
    if (inverse) {
      if (val <= bench.low) return GREEN;
      if (val >= bench.high) return RED;
      return AMBER;
    }
    if (val >= bench.high) return GREEN;
    if (val <= bench.low) return RED;
    return AMBER;
  };

  // Cost breakdown percentages
  const laborPct = totalMonthlyLabor / totalMonthlyTCO;
  const techPct = totalMonthlyTech / totalMonthlyTCO;
  const overheadPct = totalMonthlyOverhead / totalMonthlyTCO;

  // Optimization opportunities
  const optimizations = [];
  if (containment < 0.30) optimizations.push({ title: "Increase self-service containment", impact: fmtK((0.30 - containment) * monthlyContacts * costPerContact * 0.6), desc: `Moving containment from ${pct(containment)} to 30% could deflect ${Math.round((0.30 - containment) * monthlyContacts).toLocaleString()} contacts monthly.` });
  if (fcr < 0.75) optimizations.push({ title: "Improve first contact resolution", impact: fmtK((0.75 - fcr) * monthlyContacts * costPerContact * 0.4), desc: `Improving FCR from ${pct(fcr)} to 75% reduces repeat contacts and rework.` });
  if (aht > 420) optimizations.push({ title: "Reduce average handle time", impact: fmtK(((aht - 420) / 60) * humanHandledContacts * (agentLoadedHourly / 60)), desc: `Bringing AHT from ${Math.round(aht / 60)}:${String(aht % 60).padStart(2, "0")} to 7:00 saves agent hours without cutting quality.` });
  if (attrition > 0.30) optimizations.push({ title: "Reduce agent attrition", impact: fmtK(((attrition - 0.30) * agents / 12) * (recruitingCostPerHire + newHireTrainingDays * 8 * agentLoadedHourly)), desc: `Reducing attrition from ${pct(attrition)} to 30% saves recruiting, training, and ramp-up costs.` });
  if (transferRate > 0.10) optimizations.push({ title: "Reduce unnecessary transfers", impact: fmtK((transferRate - 0.10) * monthlyContacts * costPerContact * 0.3), desc: `Each transfer adds handle time, frustrates customers, and inflates cost per resolution.` });
  if (occupancy > 0.87) optimizations.push({ title: "Address burnout risk from high occupancy", impact: "Risk mitigation", desc: `Occupancy at ${pct(occupancy)} signals agents have minimal recovery time between contacts, driving attrition higher.` });

  const inputStyle = {
    width: "100%", padding: "10px 12px", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY,
    transition: "border-color 0.2s",
  };
  const labelStyle = { fontSize: 12, fontWeight: 600, color: SLATE, display: "block", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" };
  const hintStyle = { fontSize: 11, color: MUTED, marginTop: 2, fontFamily: "'DM Sans', sans-serif" };

  const sections = [
    "Organization Profile",
    "Labor Costs",
    "Operational KPIs",
    "Channel Mix",
    "Technology Costs",
    "Overhead & Facilities",
  ];

  const InputField = ({ label, value, onChange, hint, prefix, suffix, step, min, max }) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: MUTED }}>{prefix}</span>}
        <input type="number" value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)} step={step || 1} min={min} max={max}
          style={{ ...inputStyle, paddingLeft: prefix ? 28 : 12, paddingRight: suffix ? 36 : 12 }} />
        {suffix && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: MUTED }}>{suffix}</span>}
      </div>
      {hint && <div style={hintStyle}>{hint}</div>}
    </div>
  );

  const PctField = ({ label, value, onChange, hint }) => (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: "relative" }}>
        <input type="number" value={Math.round(value * 100)} onChange={e => onChange((parseFloat(e.target.value) || 0) / 100)} step={1} min={0} max={100}
          style={{ ...inputStyle, paddingRight: 32 }} />
        <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: MUTED }}>%</span>
      </div>
      {hint && <div style={hintStyle}>{hint}</div>}
    </div>
  );

  return (
    <section style={{ background: WARM, padding: "100px 28px 60px", minHeight: "100vh" }}>
      <div style={WRAP}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
            <a href="/" style={{ color: MUTED, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Home</a>
            <span style={{ color: BORDER, fontSize: 13 }}>/</span>
            <a href="/how-to-choose" style={{ color: MUTED, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Tools</a>
            <span style={{ color: BORDER, fontSize: 13 }}>/</span>
            <span style={{ color: ELECTRIC, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>TCO Calculator</span>
          </div>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>
            Contact Center TCO Calculator
          </h1>
          <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.6, maxWidth: 640, fontFamily: "'DM Sans', sans-serif" }}>
            A comprehensive total cost of ownership model covering labor, technology, operational KPIs, and overhead. Input your real numbers — every calculation is transparent and benchmarked against industry data.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 28 }} className="results-grid">
          {/* Left sidebar - section nav */}
          <div>
            <div style={{ position: "sticky", top: 80 }}>
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden", marginBottom: 20 }}>
                {sections.map((s, i) => (
                  <button key={i} onClick={() => setActiveSection(i)} style={{
                    display: "block", width: "100%", textAlign: "left", padding: "13px 18px",
                    fontSize: 13, fontWeight: activeSection === i ? 600 : 400,
                    color: activeSection === i ? ELECTRIC : SLATE,
                    background: activeSection === i ? `${ELECTRIC}08` : "transparent",
                    border: "none", borderBottom: i < sections.length - 1 ? `1px solid ${BORDER}` : "none",
                    cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                    borderLeft: activeSection === i ? `3px solid ${ELECTRIC}` : "3px solid transparent",
                    transition: "all 0.15s",
                  }}>{s}</button>
                ))}
              </div>

              {/* Live summary */}
              <div style={{ background: NAVY, borderRadius: 10, padding: "24px 20px", color: "#fff" }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: LIGHT, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>Live TCO Summary</div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>Annual TCO</div>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: LIGHT }}>{fmtK(annualTCO)}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>Per Agent/Month</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>{fmt(tcoPerAgent)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>Per Contact</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>${costPerContact.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>Per Resolution</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>${costPerResolution.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>Labor %</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>{pct(laborPct)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right content */}
          <div>
            {/* SECTION 0: Org Profile */}
            {activeSection === 0 && (
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "32px 28px" }}>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 4px" }}>Organization Profile</h2>
                <p style={{ fontSize: 13, color: MUTED, margin: "0 0 24px", fontFamily: "'DM Sans', sans-serif" }}>Basic structure of your contact center operation.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }} className="input-row">
                  <InputField label="Total Agents (FTE)" value={agents} onChange={setAgents} hint="Includes full-time and FTE-equivalent" />
                  <InputField label="Supervisors" value={supervisors} onChange={setSupervisors} hint="Team leads and direct supervisors" />
                  <InputField label="QA Analysts" value={qaStaff} onChange={setQaStaff} hint="Dedicated quality staff" />
                  <InputField label="WFM Staff" value={wfmStaff} onChange={setWfmStaff} hint="Forecasting and scheduling" />
                  <InputField label="Trainers" value={trainers} onChange={setTrainers} hint="Onboarding and ongoing training" />
                  <InputField label="IT / Tech Support" value={itSupport} onChange={setItSupport} hint="Supporting contact center systems" />
                  <InputField label="Number of Sites" value={sites} onChange={setSites} hint="Physical or virtual sites" />
                  <div>
                    <label style={labelStyle}>Industry</label>
                    <select value={industry} onChange={e => setIndustry(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                      <option value="general">General / Multi-industry</option>
                      <option value="financial">Financial Services</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="retail">Retail & eCommerce</option>
                      <option value="telecom">Telecom & Technology</option>
                      <option value="insurance">Insurance</option>
                      <option value="utilities">Utilities & Energy</option>
                      <option value="government">Government</option>
                      <option value="travel">Travel & Hospitality</option>
                    </select>
                  </div>
                  <InputField label="Monthly Contact Volume" value={monthlyContacts} onChange={setMonthlyContacts} hint="Total inbound + outbound contacts" />
                </div>
                <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
                  <button onClick={() => setActiveSection(1)} style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "11px 24px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Next: Labor Costs →</button>
                </div>
              </div>
            )}

            {/* SECTION 1: Labor Costs */}
            {activeSection === 1 && (
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "32px 28px" }}>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 4px" }}>Labor Costs</h2>
                <p style={{ fontSize: 13, color: MUTED, margin: "0 0 24px", fontFamily: "'DM Sans', sans-serif" }}>Hourly rates and benefits. Labor is typically 60–70% of total TCO.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }} className="input-row">
                  <InputField label="Agent Hourly Rate" value={agentHourly} onChange={setAgentHourly} prefix="$" hint="Base wage before benefits" step={0.5} />
                  <PctField label="Benefits & Burden %" value={agentBenefitsPct} onChange={setAgentBenefitsPct} hint="Health, taxes, PTO (typically 25–35%)" />
                  <div style={{ background: ICE, borderRadius: 6, padding: "10px 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontSize: 11, color: MUTED, fontFamily: "'DM Sans', sans-serif" }}>Loaded Agent Rate</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>${agentLoadedHourly.toFixed(2)}/hr</div>
                  </div>
                  <InputField label="Supervisor Hourly" value={supHourly} onChange={setSupHourly} prefix="$" step={0.5} />
                  <InputField label="QA Analyst Hourly" value={qaHourly} onChange={setQaHourly} prefix="$" step={0.5} />
                  <InputField label="WFM Analyst Hourly" value={wfmHourly} onChange={setWfmHourly} prefix="$" step={0.5} />
                  <InputField label="Trainer Hourly" value={trainerHourly} onChange={setTrainerHourly} prefix="$" step={0.5} />
                  <InputField label="IT Support Hourly" value={itHourly} onChange={setItHourly} prefix="$" step={0.5} />
                  <InputField label="Recruiting Cost Per Hire" value={recruitingCostPerHire} onChange={setRecruitingCostPerHire} prefix="$" hint="Sourcing, interviewing, onboarding admin" />
                </div>
                <div style={{ marginTop: 20, background: ICE, borderRadius: 8, padding: "16px 20px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: MUTED, fontFamily: "'DM Sans', sans-serif" }}>Monthly Labor Cost</div>
                    <div style={{ fontSize: 20, fontWeight: 600, color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{fmtK(totalMonthlyLabor)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: MUTED, fontFamily: "'DM Sans', sans-serif" }}>Monthly Attrition Cost</div>
                    <div style={{ fontSize: 20, fontWeight: 600, color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{fmtK(monthlyAttritionCost)}</div>
                    <div style={{ fontSize: 11, color: MUTED, fontFamily: "'DM Sans', sans-serif" }}>{monthlyAttritionHires} new hires/month at {pct(attrition)} annual attrition</div>
                  </div>
                </div>
                <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setActiveSection(0)} style={{ background: "#fff", border: `1px solid ${BORDER}`, color: SLATE, fontSize: 14, fontWeight: 500, padding: "11px 24px", borderRadius: 6, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
                  <button onClick={() => setActiveSection(2)} style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "11px 24px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Next: Operational KPIs →</button>
                </div>
              </div>
            )}

            {/* SECTION 2: KPIs */}
            {activeSection === 2 && (
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "32px 28px" }}>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 4px" }}>Operational KPIs</h2>
                <p style={{ fontSize: 13, color: MUTED, margin: "0 0 24px", fontFamily: "'DM Sans', sans-serif" }}>These metrics directly drive your cost structure. Each one has a benchmark indicator.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }} className="input-row">
                  <div>
                    <label style={labelStyle}>AHT (seconds)</label>
                    <input type="number" value={aht} onChange={e => setAht(parseFloat(e.target.value) || 0)} style={inputStyle} />
                    <div style={{ fontSize: 11, color: getBenchColor(aht, benchmarks.aht, true), marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>
                      {Math.floor(aht / 60)}:{String(aht % 60).padStart(2, "0")} — Benchmark: 5:00–7:00
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>ACW (seconds)</label>
                    <input type="number" value={acw} onChange={e => setAcw(parseFloat(e.target.value) || 0)} style={inputStyle} />
                    <div style={hintStyle}>After-call work time</div>
                  </div>
                  <div>
                    <label style={labelStyle}>Avg Hold Time (seconds)</label>
                    <input type="number" value={avgHoldTime} onChange={e => setAvgHoldTime(parseFloat(e.target.value) || 0)} style={inputStyle} />
                    <div style={hintStyle}>Average time on hold during call</div>
                  </div>
                  <PctField label="First Contact Resolution (FCR)" value={fcr} onChange={setFcr} hint={<span style={{ color: getBenchColor(fcr, benchmarks.fcr) }}>Benchmark: 65%–85%</span>} />
                  <PctField label="IVR/IVA Containment" value={containment} onChange={setContainment} hint={<span style={{ color: getBenchColor(containment, benchmarks.containment) }}>Benchmark: 15%–45%</span>} />
                  <PctField label="Agent Occupancy" value={occupancy} onChange={setOccupancy} hint={<span style={{ color: getBenchColor(occupancy, { low: 0.90, mid: 0.83, high: 0.75 }, true) }}>Benchmark: 75%–87%. Above 87% = burnout risk</span>} />
                  <PctField label="Shrinkage" value={shrinkage} onChange={setShrinkage} hint="PTO, breaks, training, meetings (25–35%)" />
                  <PctField label="Annual Attrition" value={attrition} onChange={setAttrition} hint={<span style={{ color: getBenchColor(attrition, benchmarks.attrition, true) }}>Benchmark: 20%–40%</span>} />
                  <PctField label="Absenteeism" value={absenteeism} onChange={setAbsenteeism} hint="Unplanned absence rate (5–10%)" />
                  <PctField label="Schedule Adherence" value={scheduleAdherence} onChange={setScheduleAdherence} hint="Target: 88%–95%" />
                  <div>
                    <label style={labelStyle}>Avg Speed of Answer (sec)</label>
                    <input type="number" value={avgSpeedAnswer} onChange={e => setAvgSpeedAnswer(parseFloat(e.target.value) || 0)} style={inputStyle} />
                    <div style={hintStyle}>Target: under 30 seconds</div>
                  </div>
                  <PctField label="Abandon Rate" value={abandonRate} onChange={setAbandonRate} hint="Target: under 5%" />
                  <PctField label="Transfer Rate" value={transferRate} onChange={setTransferRate} hint="Lower = better routing and training" />
                  <PctField label="Quality Score (QA)" value={qualityScore} onChange={setQualityScore} hint="Internal QA evaluation score" />
                  <div>
                    <label style={labelStyle}>CSAT (1–5 scale)</label>
                    <input type="number" value={csat} onChange={e => setCsat(parseFloat(e.target.value) || 0)} step={0.1} min={1} max={5} style={inputStyle} />
                    <div style={{ fontSize: 11, color: getBenchColor(csat, benchmarks.csat), marginTop: 2, fontFamily: "'DM Sans', sans-serif" }}>Benchmark: 3.8–4.5</div>
                  </div>
                  <div>
                    <label style={labelStyle}>NPS</label>
                    <input type="number" value={nps} onChange={e => setNps(parseFloat(e.target.value) || 0)} min={-100} max={100} style={inputStyle} />
                    <div style={hintStyle}>-100 to +100</div>
                  </div>
                  <InputField label="New Hire Training (days)" value={newHireTrainingDays} onChange={setNewHireTrainingDays} hint="Calendar days to production-ready" />
                </div>
                <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setActiveSection(1)} style={{ background: "#fff", border: `1px solid ${BORDER}`, color: SLATE, fontSize: 14, fontWeight: 500, padding: "11px 24px", borderRadius: 6, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
                  <button onClick={() => setActiveSection(3)} style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "11px 24px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Next: Channel Mix →</button>
                </div>
              </div>
            )}

            {/* SECTION 3: Channel Mix */}
            {activeSection === 3 && (
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "32px 28px" }}>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 4px" }}>Channel Mix</h2>
                <p style={{ fontSize: 13, color: MUTED, margin: "0 0 24px", fontFamily: "'DM Sans', sans-serif" }}>Distribution of contacts across channels. This directly affects telephony costs and staffing models.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }} className="input-row">
                  <PctField label="Voice" value={channelMixVoice} onChange={setChannelMixVoice} />
                  <PctField label="Chat / Messaging" value={channelMixChat} onChange={setChannelMixChat} />
                  <PctField label="Email" value={channelMixEmail} onChange={setChannelMixEmail} />
                  <PctField label="Social" value={channelMixSocial} onChange={setChannelMixSocial} />
                  <PctField label="Self-Service (web/app)" value={channelMixSelfServe} onChange={setChannelMixSelfServe} />
                  <div style={{ background: ICE, borderRadius: 6, padding: "10px 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontSize: 11, color: MUTED, fontFamily: "'DM Sans', sans-serif" }}>Channel Total</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: (channelMixVoice + channelMixChat + channelMixEmail + channelMixSocial + channelMixSelfServe) === 1 ? GREEN : RED, fontFamily: "'DM Sans', sans-serif" }}>
                      {pct(channelMixVoice + channelMixChat + channelMixEmail + channelMixSocial + channelMixSelfServe)}
                    </div>
                    <div style={{ fontSize: 11, color: MUTED, fontFamily: "'DM Sans', sans-serif" }}>Must equal 100%</div>
                  </div>
                </div>
                <div style={{ marginTop: 20, background: ICE, borderRadius: 8, padding: "16px 20px" }}>
                  <div style={{ fontSize: 11, color: MUTED, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>Monthly Voice Minutes</div>
                  <div style={{ fontSize: 18, fontWeight: 600, color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{Math.round(totalVoiceMinutes).toLocaleString()} min</div>
                  <div style={{ fontSize: 11, color: MUTED, fontFamily: "'DM Sans', sans-serif" }}>{Math.round(voiceContacts).toLocaleString()} voice contacts × {((aht + avgHoldTime + acw) / 60).toFixed(1)} min avg</div>
                </div>
                <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setActiveSection(2)} style={{ background: "#fff", border: `1px solid ${BORDER}`, color: SLATE, fontSize: 14, fontWeight: 500, padding: "11px 24px", borderRadius: 6, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
                  <button onClick={() => setActiveSection(4)} style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "11px 24px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Next: Technology Costs →</button>
                </div>
              </div>
            )}

            {/* SECTION 4: Technology */}
            {activeSection === 4 && (
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "32px 28px" }}>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 4px" }}>Technology Costs</h2>
                <p style={{ fontSize: 13, color: MUTED, margin: "0 0 24px", fontFamily: "'DM Sans', sans-serif" }}>Monthly platform, tooling, and per-seat costs across your technology stack.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }} className="input-row">
                  <InputField label="CCaaS Per Seat/Month" value={ccaasSeat} onChange={setCcaasSeat} prefix="$" hint="Platform license per user" />
                  <InputField label="WEM Suite Per Seat/Month" value={wemSeat} onChange={setWemSeat} prefix="$" hint="WFM + QM + recording bundle" />
                  <InputField label="CRM Per Seat/Month" value={crmSeat} onChange={setCrmSeat} prefix="$" hint="Salesforce, Dynamics, Zendesk, etc." />
                  <InputField label="Telephony Per Minute" value={telephonyPerMin} onChange={setTelephonyPerMin} prefix="$" hint="Voice termination cost" step={0.001} />
                  <InputField label="IVA / Bot Platform (monthly)" value={ivaMonthly} onChange={setIvaMonthly} prefix="$" hint="Self-service automation" />
                  <InputField label="Agent Assist (monthly)" value={agentAssistMonthly} onChange={setAgentAssistMonthly} prefix="$" hint="Real-time agent guidance" />
                  <InputField label="RPA / Automation (monthly)" value={rpaMonthly} onChange={setRpaMonthly} prefix="$" hint="UiPath, Power Automate, etc." />
                  <InputField label="Analytics Platform (monthly)" value={analyticsMonthly} onChange={setAnalyticsMonthly} prefix="$" hint="Speech, text, journey analytics" />
                  <InputField label="iPaaS / Integration (monthly)" value={ipaasMonthly} onChange={setIpaasMonthly} prefix="$" hint="MuleSoft, Workato, etc." />
                  <InputField label="Recording & Compliance (monthly)" value={recordingMonthly} onChange={setRecordingMonthly} prefix="$" hint="Call recording, screen capture, storage" />
                  <InputField label="Knowledge Management (monthly)" value={knowledgeMgmt} onChange={setKnowledgeMgmt} prefix="$" hint="Guru, Shelf, Coveo, etc." />
                  <InputField label="Security & Compliance (monthly)" value={securityCompliance} onChange={setSecurityCompliance} prefix="$" hint="PCI, HIPAA, audit tools" />
                </div>
                <div style={{ marginTop: 20, background: ICE, borderRadius: 8, padding: "16px 20px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: MUTED, fontFamily: "'DM Sans', sans-serif" }}>Monthly Technology Cost</div>
                    <div style={{ fontSize: 20, fontWeight: 600, color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{fmtK(totalMonthlyTech)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: MUTED, fontFamily: "'DM Sans', sans-serif" }}>Tech Per Agent/Month</div>
                    <div style={{ fontSize: 20, fontWeight: 600, color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{fmt(totalMonthlyTech / agents)}</div>
                  </div>
                </div>
                <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between" }}>
                  <button onClick={() => setActiveSection(3)} style={{ background: "#fff", border: `1px solid ${BORDER}`, color: SLATE, fontSize: 14, fontWeight: 500, padding: "11px 24px", borderRadius: 6, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
                  <button onClick={() => setActiveSection(5)} style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "11px 24px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Next: Overhead →</button>
                </div>
              </div>
            )}

            {/* SECTION 5: Overhead */}
            {activeSection === 5 && (
              <div>
                <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "32px 28px", marginBottom: 24 }}>
                  <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 4px" }}>Overhead & Facilities</h2>
                  <p style={{ fontSize: 13, color: MUTED, margin: "0 0 24px", fontFamily: "'DM Sans', sans-serif" }}>Infrastructure, professional services, and physical space costs.</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }} className="input-row">
                    <InputField label="Cloud Infrastructure (monthly)" value={cloudInfra} onChange={setCloudInfra} prefix="$" hint="AWS, Azure, GCP hosting" />
                    <InputField label="Prof. Services Amortized (monthly)" value={psAmortized} onChange={setPsAmortized} prefix="$" hint="Implementation costs spread monthly" />
                    <InputField label="Facilities (monthly)" value={facilitiesCost} onChange={setFacilitiesCost} prefix="$" hint="Rent, utilities, equipment across all sites" />
                  </div>
                </div>

                {/* RESULTS */}
                <div style={{ background: NAVY, borderRadius: 14, padding: "36px 32px", color: "#fff", marginBottom: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase", color: LIGHT, marginBottom: 24, fontFamily: "'DM Sans', sans-serif" }}>Complete TCO Results</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 28 }} className="kpi-grid">
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "20px 18px" }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>Annual TCO</div>
                      <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: LIGHT }}>{fmtK(annualTCO)}</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "20px 18px" }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>Monthly TCO</div>
                      <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: "#fff" }}>{fmtK(totalMonthlyTCO)}</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "20px 18px" }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>All-in Per Agent/Month</div>
                      <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: getBenchColor(tcoPerAgent, { low: 540, mid: 422, high: 305 }, true) }}>{fmt(tcoPerAgent)}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>{benchmarks.tcoPerAgent.label}</div>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 28 }} className="kpi-grid">
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>Cost Per Contact</div>
                      <div style={{ fontSize: 22, fontWeight: 600, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>${costPerContact.toFixed(2)}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>Cost Per Resolution</div>
                      <div style={{ fontSize: 22, fontWeight: 600, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>${costPerResolution.toFixed(2)}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>Cost Per Human Contact</div>
                      <div style={{ fontSize: 22, fontWeight: 600, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>${costPerHumanContact.toFixed(2)}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>Contacts Per Agent/Month</div>
                      <div style={{ fontSize: 22, fontWeight: 600, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>{Math.round(monthlyContacts / agents)}</div>
                    </div>
                  </div>

                  {/* Cost breakdown bar */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>Cost Distribution</div>
                    <div style={{ display: "flex", height: 28, borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ width: pct(laborPct), background: ELECTRIC, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>{pct(laborPct)}</span>
                      </div>
                      <div style={{ width: pct(techPct), background: LIGHT, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: NAVY, fontFamily: "'DM Sans', sans-serif" }}>{pct(techPct)}</span>
                      </div>
                      <div style={{ width: pct(overheadPct), background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>{pct(overheadPct)}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: ELECTRIC }} />
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}>Labor {fmtK(totalMonthlyLabor)}/mo</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: LIGHT }} />
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}>Technology {fmtK(totalMonthlyTech)}/mo</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif" }}>Overhead {fmtK(totalMonthlyOverhead)}/mo</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optimization opportunities */}
                {optimizations.length > 0 && (
                  <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "32px 28px", marginBottom: 24 }}>
                    <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, fontWeight: 400, color: NAVY, margin: "0 0 4px" }}>Optimization Opportunities</h3>
                    <p style={{ fontSize: 13, color: MUTED, margin: "0 0 20px", fontFamily: "'DM Sans', sans-serif" }}>Based on your inputs, these are the highest-impact areas to investigate.</p>
                    {optimizations.map((opt, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16, padding: "14px 0", borderBottom: i < optimizations.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: 14, fontWeight: 600, color: NAVY, margin: "0 0 3px", fontFamily: "'DM Sans', sans-serif" }}>{opt.title}</h4>
                          <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{opt.desc}</p>
                        </div>
                        <div style={{ background: `${GREEN}15`, color: GREEN, fontSize: 13, fontWeight: 700, padding: "6px 12px", borderRadius: 6, flexShrink: 0, fontFamily: "'DM Sans', sans-serif" }}>
                          {opt.impact}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "32px 28px", textAlign: "center" }}>
                  <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: "#fff", margin: "0 0 8px" }}>Want help interpreting these numbers?</h3>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 20px", fontFamily: "'DM Sans', sans-serif" }}>A working session can identify which optimization levers will have the highest impact for your specific operating model.</p>
                  <a href="/contact" style={{ display: "inline-block", background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 28px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif" }}>Request a Working Session</a>
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
