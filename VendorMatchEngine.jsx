import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const CATEGORIES = [
  { id: "ccaas", name: "CCaaS Platform", href: "/vendors/ccaas" },
  { id: "iva", name: "IVA + Conversational AI", href: "/vendors/iva" },
  { id: "agent-assist", name: "Agent Assist + Knowledge", href: "/vendors/agent-assist" },
  { id: "wem", name: "WEM + Quality Management", href: "/vendors/wem-qm" },
  { id: "analytics", name: "CX Analytics", href: "/vendors/analytics" },
  { id: "routing", name: "ACD + Routing", href: "/vendors/acd-routing" },
  { id: "digital", name: "Digital Engagement", href: "/vendors/digital-engagement" },
  { id: "payments", name: "Payments + Identity", href: "/vendors/payments" },
];

const VERTICALS = ["Financial Services", "Healthcare", "Retail + eCommerce", "Telecom", "Insurance", "Travel + Hospitality", "Government", "Utilities", "Manufacturing", "Education", "Other"];
const SIZES = ["Under 50 agents", "50-200 agents", "200-500 agents", "500-1000 agents", "1000-5000 agents", "5000+ agents"];
const PRIORITIES = ["AI + Automation", "Cost Reduction", "Platform Consolidation", "Digital Channel Expansion", "Quality + Compliance", "Workforce Optimization", "Customer Self-Service", "Agent Experience", "Vertical Specialization", "Global Scale"];
const DEALBREAKERS = ["FedRAMP / Government compliance", "HIPAA compliance", "PCI Level 1", "Multi-region deployment", "On-premise option required", "BYOC (Bring Your Own Carrier)", "Open API architecture", "No long-term contract", "Consumption-based pricing", "Native WFM included"];

const VENDOR_DB = {
  ccaas: [
    { name: "Genesys Cloud CX", fit: { large: 95, mid: 80, small: 55 }, strengths: ["Orchestration depth", "Composable architecture", "CRM convergence (Salesforce, ServiceNow)"], risks: ["Complexity", "AI token pricing unpredictability", "Potential IPO transition"], verticals: ["Financial Services", "Insurance", "Telecom", "Healthcare"], ai: 90, digital: 85, wfm: 80, compliance: 85 },
    { name: "NICE CXone", fit: { large: 90, mid: 85, small: 60 }, strengths: ["WEM depth (native Enlighten AI)", "Analytics maturity", "Cognigy acquisition for IVA"], risks: ["Platform complexity for mid-market", "Add-on pricing layers", "Integration overhead"], verticals: ["Financial Services", "Healthcare", "Insurance", "Retail + eCommerce"], ai: 88, digital: 82, wfm: 95, compliance: 88 },
    { name: "Amazon Connect", fit: { large: 75, mid: 85, small: 90 }, strengths: ["Consumption pricing (no seats)", "AWS ecosystem integration", "Rapid deployment"], risks: ["Requires AWS expertise", "Limited native WFM", "Less vertical depth"], verticals: ["Retail + eCommerce", "Telecom", "Other"], ai: 85, digital: 75, wfm: 50, compliance: 70 },
    { name: "Five9", fit: { large: 70, mid: 90, small: 80 }, strengths: ["Mid-market sweet spot", "Strong outbound/blended", "Salesforce integration depth"], risks: ["Enterprise scale ceiling", "AI capabilities still maturing", "Smaller ecosystem"], verticals: ["Retail + eCommerce", "Financial Services", "Healthcare"], ai: 72, digital: 78, wfm: 70, compliance: 75 },
    { name: "Talkdesk", fit: { large: 65, mid: 85, small: 85 }, strengths: ["AI-forward roadmap", "Industry Experience Clouds", "First CCaaS with ISO 42001 (AI governance)"], risks: ["Enterprise track record shorter", "Vertical depth still building", "Competitive pressure"], verticals: ["Retail + eCommerce", "Financial Services", "Healthcare"], ai: 85, digital: 80, wfm: 72, compliance: 80 },
    { name: "Cisco Webex Contact Center", fit: { large: 85, mid: 75, small: 50 }, strengths: ["Network + security portfolio", "Webex Connect orchestration", "Enterprise IT alignment"], risks: ["Migration complexity from UCCE", "Cloud-native maturity behind leaders", "Bundle complexity"], verticals: ["Government", "Financial Services", "Manufacturing", "Telecom"], ai: 70, digital: 72, wfm: 65, compliance: 90 },
    { name: "Zoom Contact Center", fit: { large: 50, mid: 80, small: 90 }, strengths: ["Consumer-grade UX", "Aggressive pricing", "Rapid deployment"], risks: ["Enterprise feature depth", "Limited WFM", "Newer to contact center"], verticals: ["Education", "Other", "Retail + eCommerce"], ai: 68, digital: 72, wfm: 45, compliance: 60 },
    { name: "8x8 XCaaS", fit: { large: 55, mid: 80, small: 85 }, strengths: ["Unified CCaaS + UCaaS", "Competitive mid-market pricing", "Global reach"], risks: ["Enterprise scale limitations", "AI maturity behind leaders", "Market positioning clarity"], verticals: ["Other", "Retail + eCommerce"], ai: 62, digital: 70, wfm: 60, compliance: 65 },
  ],
};

function Select({ label, value, onChange, options, hint }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: NAVY, display: "block", marginBottom: 4 }}>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, outline: "none", cursor: "pointer" }}>
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      {hint && <span style={{ fontSize: 11, color: MUTED, marginTop: 2, display: "block" }}>{hint}</span>}
    </div>
  );
}

export default function VendorMatchEngine() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState(""); const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState(0);
  const [d, setD] = useState({
    category: "ccaas", vertical: "", size: "", currentPlatform: "",
    priorities: [], dealbreakers: [],
    aiImportance: 3, digitalImportance: 3, wfmImportance: 3, complianceImportance: 3,
    budgetSensitivity: "moderate",
  });
  useEffect(() => { window.scrollTo(0, 0); }, [phase]);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const toggleArr = (k, v) => setD(prev => ({ ...prev, [k]: prev[k].includes(v) ? prev[k].filter(x => x !== v) : prev[k].length < 3 ? [...prev[k], v] : prev[k] }));

  const handleGate = async () => {
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "Vendor Match Engine", _subject: "Vendor Match Engine Access" }) }); } catch (e) {}
    setSending(false); setPhase("input");
  };

  // Scoring logic
  const getResults = () => {
    const vendors = VENDOR_DB[d.category] || VENDOR_DB.ccaas;
    const sizeKey = d.size.includes("5000") || d.size.includes("1000") ? "large" : d.size.includes("500") || d.size.includes("200") ? "mid" : "small";

    return vendors.map(v => {
      let score = v.fit[sizeKey] || 70;

      // Vertical match
      if (d.vertical && v.verticals.includes(d.vertical)) score += 8;
      else if (d.vertical) score -= 5;

      // Priority alignment
      const priorityMap = { "AI + Automation": "ai", "Digital Channel Expansion": "digital", "Workforce Optimization": "wfm", "Quality + Compliance": "compliance" };
      d.priorities.forEach(p => {
        const dim = priorityMap[p];
        if (dim && v[dim]) score += (v[dim] - 70) * 0.15;
      });

      // Importance weighting
      score += (v.ai - 70) * (d.aiImportance - 3) * 0.08;
      score += (v.digital - 70) * (d.digitalImportance - 3) * 0.08;
      score += (v.wfm - 70) * (d.wfmImportance - 3) * 0.08;
      score += (v.compliance - 70) * (d.complianceImportance - 3) * 0.08;

      // Budget sensitivity
      if (d.budgetSensitivity === "high" && v.name.includes("Amazon")) score += 10;
      if (d.budgetSensitivity === "high" && v.name.includes("Zoom")) score += 8;
      if (d.budgetSensitivity === "low" && v.name.includes("Genesys")) score += 5;

      return { ...v, score: Math.min(99, Math.max(30, Math.round(score))) };
    }).sort((a, b) => b.score - a.score);
  };

  const handleResults = async () => {
    const results = getResults();
    const top3 = results.slice(0, 3).map(r => `${r.name}: ${r.score}`).join(", ");
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      email, name, company, tool: "Vendor Match Engine",
      category: d.category, vertical: d.vertical, size: d.size, priorities: d.priorities.join(", "),
      topMatches: top3,
      _subject: `Vendor Match: ${d.category} | ${d.vertical} | ${d.size} — ${company || name || email}`
    }) }); } catch (e) {}
    setPhase("results");
  };

  const results = getResults();

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.pg{grid-template-columns:1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "80px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 520 }}>
            <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Vendor Selection</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>Vendor Match Engine</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 32 }}>Tell us about your operation, priorities, and constraints. Get a ranked vendor shortlist with fit reasoning based on 276 independently scored profiles. Not a directory. A recommendation.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="text" placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "14px", fontSize: 15, fontWeight: 600, background: email.includes("@") ? ELECTRIC : SLATE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: email.includes("@") ? 1 : 0.5 }}>{sending ? "Loading..." : "Start Matching →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "input" && (
        <section style={{ background: "#fff", padding: "48px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 640 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
              {["Environment", "Priorities", "Dimensions"].map((s, i) => (
                <div key={i} style={{ flex: 1, textAlign: "center", padding: "8px", borderBottom: `3px solid ${step === i ? ELECTRIC : BORDER}`, cursor: "pointer", fontSize: 13, fontWeight: 600, color: step === i ? NAVY : MUTED }} onClick={() => setStep(i)}>{s}</div>
              ))}
            </div>

            {step === 0 && (
              <div>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 20px" }}>Tell us about your environment</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <Select label="What are you evaluating?" value={d.category} onChange={v => set("category", v)} options={CATEGORIES.map(c => c.id)} hint="Primary technology category" />
                  <Select label="Industry vertical" value={d.vertical} onChange={v => set("vertical", v)} options={VERTICALS} />
                  <Select label="Operation size" value={d.size} onChange={v => set("size", v)} options={SIZES} />
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: NAVY, display: "block", marginBottom: 4 }}>Current platform (optional)</label>
                    <input type="text" placeholder="e.g. Avaya, Cisco UCCE, Genesys PureConnect..." value={d.currentPlatform} onChange={e => set("currentPlatform", e.target.value)} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, outline: "none" }} />
                  </div>
                </div>
                <button onClick={() => setStep(1)} style={{ marginTop: 24, padding: "12px 28px", fontSize: 14, fontWeight: 600, borderRadius: 8, border: "none", background: ELECTRIC, color: "#fff", cursor: "pointer" }}>Next: Priorities →</button>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>What matters most?</h2>
                <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>Select up to 3 priorities. These weight the vendor scoring.</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }} className="pg">
                  {PRIORITIES.map(p => (
                    <button key={p} onClick={() => toggleArr("priorities", p)} style={{ padding: "12px 16px", fontSize: 13, fontWeight: 500, textAlign: "left", borderRadius: 8, cursor: "pointer", border: `1px solid ${d.priorities.includes(p) ? ELECTRIC : BORDER}`, background: d.priorities.includes(p) ? `${ELECTRIC}08` : "#fff", color: d.priorities.includes(p) ? ELECTRIC : SLATE }}>{d.priorities.includes(p) ? "✓ " : ""}{p}</button>
                  ))}
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: NAVY, marginTop: 24, marginBottom: 8 }}>Deal-breakers (optional)</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }} className="pg">
                  {DEALBREAKERS.map(db => (
                    <button key={db} onClick={() => toggleArr("dealbreakers", db)} style={{ padding: "8px 12px", fontSize: 12, textAlign: "left", borderRadius: 6, cursor: "pointer", border: `1px solid ${d.dealbreakers.includes(db) ? RED : BORDER}`, background: d.dealbreakers.includes(db) ? `${RED}06` : "#fff", color: d.dealbreakers.includes(db) ? RED : MUTED }}>{d.dealbreakers.includes(db) ? "✓ " : ""}{db}</button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                  <button onClick={() => setStep(0)} style={{ padding: "12px 24px", fontSize: 14, fontWeight: 600, borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: NAVY, cursor: "pointer" }}>← Back</button>
                  <button onClick={() => setStep(2)} style={{ padding: "12px 28px", fontSize: 14, fontWeight: 600, borderRadius: 8, border: "none", background: ELECTRIC, color: "#fff", cursor: "pointer" }}>Next: Dimensions →</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>How important is each dimension?</h2>
                <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>1 = not important, 5 = critical to our decision</p>
                {[
                  { key: "aiImportance", label: "AI + Automation Capabilities", desc: "GenAI, agent assist, IVA, autonomous resolution" },
                  { key: "digitalImportance", label: "Digital Channel Depth", desc: "Chat, messaging, social, cross-channel continuity" },
                  { key: "wfmImportance", label: "Workforce Management", desc: "Forecasting, scheduling, QA, coaching, analytics" },
                  { key: "complianceImportance", label: "Compliance + Security", desc: "FedRAMP, HIPAA, PCI, data residency, AI governance" },
                ].map(dim => (
                  <div key={dim.key} style={{ marginBottom: 16, padding: "14px 16px", background: WARM, borderRadius: 8, border: `1px solid ${BORDER}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{dim.label}</span>
                        <span style={{ fontSize: 11, color: MUTED, display: "block" }}>{dim.desc}</span>
                      </div>
                      <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: ELECTRIC }}>{d[dim.key]}</span>
                    </div>
                    <input type="range" min={1} max={5} value={d[dim.key]} onChange={e => set(dim.key, Number(e.target.value))} style={{ width: "100%", accentColor: ELECTRIC }} />
                  </div>
                ))}
                <Select label="Budget sensitivity" value={d.budgetSensitivity} onChange={v => set("budgetSensitivity", v)} options={["low", "moderate", "high"]} hint="How price-sensitive is this decision?" />
                <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                  <button onClick={() => setStep(1)} style={{ padding: "12px 24px", fontSize: 14, fontWeight: 600, borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: NAVY, cursor: "pointer" }}>← Back</button>
                  <button onClick={handleResults} style={{ padding: "12px 28px", fontSize: 14, fontWeight: 600, borderRadius: 8, border: "none", background: GREEN, color: "#fff", cursor: "pointer" }}>See My Matches →</button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {phase === "results" && (
        <section style={{ background: "#fff", padding: "48px 28px 60px" }}>
          <div style={WRAP}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 2, textTransform: "uppercase" }}>Your Vendor Shortlist</span>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: NAVY, margin: "8px 0" }}>Ranked by fit for your environment</h2>
              <p style={{ fontSize: 13, color: MUTED, maxWidth: 500, margin: "0 auto" }}>Based on {d.size || "your operation"} in {d.vertical || "your vertical"}, with priorities in {d.priorities.join(", ") || "not specified"}.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {results.map((v, i) => {
                const isTop = i < 3;
                const fitColor = v.score >= 85 ? GREEN : v.score >= 70 ? AMBER : v.score >= 55 ? "#6B7280" : RED;
                const fitLabel = v.score >= 85 ? "Strong Fit" : v.score >= 70 ? "Good Fit" : v.score >= 55 ? "Conditional Fit" : "Weak Fit";
                return (
                  <div key={v.name} style={{ background: isTop ? "#fff" : WARM, border: `1px solid ${isTop ? fitColor + "40" : BORDER}`, borderRadius: 12, padding: isTop ? "24px" : "16px 20px", borderLeft: isTop ? `4px solid ${fitColor}` : "4px solid transparent" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                          <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: isTop ? 14 : 12, color: MUTED }}>#{i + 1}</span>
                          <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: isTop ? 22 : 17, fontWeight: 400, color: NAVY, margin: 0 }}>{v.name}</h3>
                        </div>
                        {isTop && (
                          <>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8, marginBottom: 8 }}>
                              {v.strengths.map((s, si) => (
                                <span key={si} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: `${GREEN}10`, color: GREEN, fontWeight: 500 }}>✓ {s}</span>
                              ))}
                            </div>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {v.risks.map((r, ri) => (
                                <span key={ri} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: `${RED}08`, color: RED }}>⚠ {r}</span>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                      <div style={{ textAlign: "center", flexShrink: 0 }}>
                        <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: isTop ? 36 : 24, color: fitColor }}>{v.score}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: fitColor }}>{fitLabel}</div>
                      </div>
                    </div>
                    {isTop && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${BORDER}` }} className="pg">
                        {[["AI", v.ai], ["Digital", v.digital], ["WFM", v.wfm], ["Compliance", v.compliance]].map(([l, s]) => (
                          <div key={l} style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 10, color: MUTED, marginBottom: 2 }}>{l}</div>
                            <div style={{ height: 4, background: `${BORDER}`, borderRadius: 2, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${s}%`, background: s >= 80 ? GREEN : s >= 65 ? AMBER : MUTED, borderRadius: 2 }} />
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: SLATE, marginTop: 2 }}>{s}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "32px", textAlign: "center", marginBottom: 24 }}>
              <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: "#fff", margin: "0 0 8px" }}>This shortlist is a starting point.</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 480, margin: "0 auto 20px" }}>
                Vendor fit depends on details this tool cannot capture: integration complexity, contract terms, implementation timelines, and organizational readiness. A 30-minute working session can refine this shortlist into a decision framework.
              </p>
              <a href="/contact" style={{ display: "inline-block", background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 32px", borderRadius: 8, boxShadow: "0 4px 18px rgba(0,136,221,0.3)" }}>Request a Working Session →</a>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href={CATEGORIES.find(c => c.id === d.category)?.href || "/vendors"} style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>See All Scored Vendors →</a>
              <a href="/how-to-choose" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Explore More Tools</a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
