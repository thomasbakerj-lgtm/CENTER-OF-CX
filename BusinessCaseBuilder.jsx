import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 860, margin: "0 auto", padding: "0 28px" };
const fmt = (v) => "$" + Math.round(v).toLocaleString();
const fmtK = (v) => v >= 1000000 ? "$" + (v / 1000000).toFixed(1) + "M" : v >= 1000 ? "$" + (v / 1000).toFixed(0) + "K" : "$" + Math.round(v).toLocaleString();

function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const n = (v) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };

export default function BusinessCaseBuilder() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState(""); const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [d, setD] = useState({
    agents: 200, avgHourly: 18, benefitsPct: 30, monthlyContacts: 120000, currentAHT: 420, currentFCR: 72, currentAttrition: 35,
    currentCostPerContact: 7, recruitCostPerHire: 3500, trainingDays: 21, currentPlatformCost: 150,
    targetAHTReduction: 12, targetFCRImprovement: 8, targetAttritionReduction: 20, targetContainment: 15, targetACWReduction: 30,
    implementationCost: 250000, annualLicenseCost: 0, migrationMonths: 9,
  });
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));

  useEffect(() => { window.scrollTo(0, 0); }, [phase]);

  // Calculations
  const agentLoadedHourly = n(d.avgHourly) * (1 + n(d.benefitsPct) / 100);
  const agentAnnualCost = agentLoadedHourly * 2080;
  const totalAgentLabor = agentAnnualCost * n(d.agents);

  // AHT savings
  const currentAHTMin = n(d.currentAHT) / 60;
  const newAHTMin = currentAHTMin * (1 - n(d.targetAHTReduction) / 100);
  const minutesSavedPerContact = currentAHTMin - newAHTMin;
  const annualContacts = n(d.monthlyContacts) * 12;
  const totalMinutesSaved = minutesSavedPerContact * annualContacts;
  const ahtSavings = (totalMinutesSaved / 60) * agentLoadedHourly;

  // Containment savings
  const deflectedContacts = annualContacts * (n(d.targetContainment) / 100);
  const costPerContact = n(d.currentCostPerContact);
  const containmentSavings = deflectedContacts * costPerContact;

  // ACW savings
  const currentACWSec = 60; // industry avg
  const acwReduction = currentACWSec * (n(d.targetACWReduction) / 100);
  const acwMinutesSaved = (acwReduction / 60) * annualContacts;
  const acwSavings = (acwMinutesSaved / 60) * agentLoadedHourly;

  // Attrition savings
  const currentAttritionAgents = n(d.agents) * (n(d.currentAttrition) / 100);
  const reducedAttritionAgents = n(d.agents) * ((n(d.currentAttrition) - n(d.currentAttrition) * n(d.targetAttritionReduction) / 100) / 100);
  const avoidedTurnover = currentAttritionAgents - reducedAttritionAgents;
  const perHireCost = n(d.recruitCostPerHire) + (n(d.trainingDays) * 8 * agentLoadedHourly);
  const attritionSavings = avoidedTurnover * perHireCost;

  // FCR improvement (reduced repeat contacts)
  const currentRepeatRate = 1 - n(d.currentFCR) / 100;
  const newRepeatRate = 1 - (n(d.currentFCR) + n(d.targetFCRImprovement)) / 100;
  const avoidedRepeats = annualContacts * (currentRepeatRate - newRepeatRate);
  const fcrSavings = avoidedRepeats * costPerContact;

  const totalAnnualSavings = ahtSavings + containmentSavings + acwSavings + attritionSavings + fcrSavings;
  const totalInvestment = n(d.implementationCost) + (n(d.annualLicenseCost) || n(d.currentPlatformCost) * n(d.agents) * 12);
  const netYear1 = totalAnnualSavings - totalInvestment;
  const paybackMonths = totalAnnualSavings > 0 ? Math.ceil(totalInvestment / (totalAnnualSavings / 12)) : 0;
  const threeYearROI = totalAnnualSavings > 0 ? (((totalAnnualSavings * 3) - totalInvestment) / totalInvestment * 100) : 0;

  const handleGate = async () => {
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/xnjolywk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "Business Case Builder", _subject: "Business Case Builder Access" }) }); } catch (e) {}
    setSending(false); setPhase("build");
  };

  const handleSave = async () => {
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "Business Case", annualSavings: fmtK(totalAnnualSavings), investment: fmtK(totalInvestment), paybackMonths, threeYearROI: threeYearROI.toFixed(0) + "%", ahtSavings: fmtK(ahtSavings), containmentSavings: fmtK(containmentSavings), attritionSavings: fmtK(attritionSavings), _subject: `Business Case: ${fmtK(totalAnnualSavings)}/yr savings — ${company || name || email}` }) }); } catch (e) {}
    setPhase("saved");
  };

  const Field = ({ label, k: key, prefix, suffix, hint }) => (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: SLATE, display: "block", marginBottom: 3 }}>{label}</label>
      <div style={{ position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: MUTED }}>{prefix}</span>}
        <input type="number" value={d[key]} onChange={e => set(key, e.target.value)} style={{ width: "100%", padding: "9px 12px", paddingLeft: prefix ? 22 : 12, paddingRight: suffix ? 32 : 12, fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, outline: "none" }} />
        {suffix && <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: MUTED }}>{suffix}</span>}
      </div>
      {hint && <div style={{ fontSize: 10, color: MUTED, marginTop: 2 }}>{hint}</div>}
    </div>
  );

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}@media(max-width:700px){.bc-grid{grid-template-columns:1fr!important}}`}</style>

      <nav style={{ background: DEEP, padding: "16px 0" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
          <a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a>
        </div>
      </nav>

      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", padding: "80px 28px" }}>
          <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
            <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Planning Tool</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "12px 0 16px" }}>Business Case Builder</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 auto 36px", maxWidth: 520 }}>Model the ROI of your CX transformation using your real numbers. Calculate savings from AHT reduction, self-service containment, attrition improvement, ACW automation, and FCR gains. Build the narrative your board needs to approve investment.</p>
            <div style={{ maxWidth: 400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Work email *" style={{ padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, outline: "none" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={{ flex: 1, padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none" }} />
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company" style={{ flex: 1, padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none" }} />
              </div>
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "16px", borderRadius: 8, border: "none", background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: sending ? 0.6 : 1, marginTop: 4 }}>{sending ? "Starting..." : "Build Business Case →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "build" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "40px 28px 80px" }}>
          <div style={WRAP}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: NAVY, margin: "0 0 24px" }}>Build your business case</h2>

            {/* Current State */}
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>Current State</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="bc-grid">
                <Field label="Agent Count" k="agents" />
                <Field label="Avg Agent Hourly Rate" k="avgHourly" prefix="$" />
                <Field label="Benefits & Burden" k="benefitsPct" suffix="%" hint="Typically 25-35%" />
                <Field label="Monthly Contact Volume" k="monthlyContacts" />
                <Field label="Current AHT (seconds)" k="currentAHT" hint={`${(n(d.currentAHT)/60).toFixed(1)} minutes`} />
                <Field label="Current FCR" k="currentFCR" suffix="%" />
                <Field label="Annual Attrition" k="currentAttrition" suffix="%" />
                <Field label="Cost per Contact" k="currentCostPerContact" prefix="$" />
                <Field label="Recruiting Cost / Hire" k="recruitCostPerHire" prefix="$" />
                <Field label="New Hire Training Days" k="trainingDays" />
                <Field label="Current Platform Cost/Agent/Mo" k="currentPlatformCost" prefix="$" />
              </div>
            </div>

            {/* Target Improvements */}
            <div style={{ background: "#fff", border: `1px solid ${GREEN}30`, borderRadius: 10, padding: "24px 22px", marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: GREEN, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>Target Improvements</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="bc-grid">
                <Field label="AHT Reduction" k="targetAHTReduction" suffix="%" hint="Industry: 8-15% with AI assist" />
                <Field label="FCR Improvement" k="targetFCRImprovement" suffix="pts" hint="Industry: 5-10 point lift" />
                <Field label="Attrition Reduction" k="targetAttritionReduction" suffix="%" hint="Industry: 15-25% with better tools" />
                <Field label="Self-Service Containment" k="targetContainment" suffix="%" hint="Industry: 10-25% achievable" />
                <Field label="ACW Reduction" k="targetACWReduction" suffix="%" hint="Industry: 20-40% with auto-summary" />
              </div>
            </div>

            {/* Investment */}
            <div style={{ background: "#fff", border: `1px solid ${AMBER}30`, borderRadius: 10, padding: "24px 22px", marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: AMBER, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>Investment Required</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="bc-grid">
                <Field label="Implementation + Migration Cost" k="implementationCost" prefix="$" hint="PS, training, integration build" />
                <Field label="Migration Timeline" k="migrationMonths" suffix="months" />
              </div>
            </div>

            {/* Live Results */}
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "32px 28px", marginBottom: 16 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20 }}>Business Case Summary</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }} className="bc-grid">
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: GREEN }}>{fmtK(totalAnnualSavings)}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Annual Savings</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: paybackMonths <= 12 ? GREEN : paybackMonths <= 18 ? AMBER : RED }}>{paybackMonths} mo</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Payback Period</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: threeYearROI > 100 ? GREEN : threeYearROI > 0 ? AMBER : RED }}>{threeYearROI.toFixed(0)}%</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>3-Year ROI</div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { label: "AHT reduction savings", value: ahtSavings, pct: totalAnnualSavings > 0 ? (ahtSavings / totalAnnualSavings * 100) : 0 },
                  { label: "Self-service containment", value: containmentSavings, pct: totalAnnualSavings > 0 ? (containmentSavings / totalAnnualSavings * 100) : 0 },
                  { label: "ACW automation savings", value: acwSavings, pct: totalAnnualSavings > 0 ? (acwSavings / totalAnnualSavings * 100) : 0 },
                  { label: "Attrition reduction", value: attritionSavings, pct: totalAnnualSavings > 0 ? (attritionSavings / totalAnnualSavings * 100) : 0 },
                  { label: "FCR improvement (avoided repeats)", value: fcrSavings, pct: totalAnnualSavings > 0 ? (fcrSavings / totalAnnualSavings * 100) : 0 },
                ].sort((a, b) => b.value - a.value).map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", flex: 1 }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: GREEN, minWidth: 80, textAlign: "right" }}>{fmtK(item.value)}</span>
                    <div style={{ width: 80, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${item.pct}%`, height: "100%", background: GREEN, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", minWidth: 30 }}>{item.pct.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={handleSave} style={{ padding: "14px 28px", borderRadius: 8, border: "none", background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Save & Send Business Case →</button>
            </div>
          </div>
        </section>
      )}

      {phase === "saved" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", padding: "80px 28px" }}>
          <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 32px" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: GREEN, margin: "0 0 12px" }}>Business case saved.</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 6 }}>{fmtK(totalAnnualSavings)} annual savings. {paybackMonths}-month payback. {threeYearROI.toFixed(0)}% 3-year ROI.</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 24 }}>Your business case has been sent to your email with full breakdowns.</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "13px 24px", borderRadius: 8 }}>Request a Working Session</a>
                <a href="/tco-calculator" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 14, fontWeight: 500, padding: "13px 24px", borderRadius: 8 }}>Try the TCO Calculator →</a>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
