import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 860, margin: "0 auto", padding: "0 28px" };

function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const DIMS = [
  { id: "strategy", name: "Strategy & Leadership", color: ELECTRIC, qs: [
    { q: "CX has a named executive sponsor with budget authority and cross-functional mandate.", },
    { q: "There is a documented CX strategy that connects to measurable business outcomes.", },
    { q: "CX investment decisions are made using data and frameworks rather than vendor demos.", },
    { q: "The organization treats CX as an operating discipline with defined roles, metrics, and governance.", },
    { q: "Leadership reviews CX performance with the same rigor as financial or sales performance.", },
  ]},
  { id: "operations", name: "Operations & Workforce", color: "#10B981", qs: [
    { q: "Workforce management uses data-driven forecasting and intraday management across all channels.", },
    { q: "Quality assurance covers both human and automated interactions with consistent scoring criteria.", },
    { q: "Agents have clear career paths, coaching programs, and performance visibility.", },
    { q: "Service levels are measured and managed across voice, digital, and async channels independently.", },
    { q: "Escalation paths, exception handling, and fallback logic are documented and governed.", },
  ]},
  { id: "technology", name: "Technology & Architecture", color: "#7C3AED", qs: [
    { q: "The contact center platform (CCaaS) is cloud-native with API extensibility and ecosystem integration.", },
    { q: "CRM, knowledge, identity, and workflow systems are integrated with the agent desktop.", },
    { q: "Digital channels (chat, messaging, social) are routed and managed with the same rigor as voice.", },
    { q: "The technology stack has a defined architecture owner who governs vendor selection and integration.", },
    { q: "There is a technology roadmap aligned to the CX strategy with phased milestones.", },
  ]},
  { id: "analytics", name: "Analytics & Intelligence", color: "#F59E0B", qs: [
    { q: "Interaction analytics (speech, text, sentiment) are used to identify root causes and trends.", },
    { q: "Reporting goes beyond volume and AHT to measure resolution quality, effort, and business outcomes.", },
    { q: "Analytics insights drive operational changes within weeks rather than being trapped in reports.", },
    { q: "AI-generated insights (auto-QA, topic clustering, behavioral analysis) are part of the QA workflow.", },
    { q: "Journey analytics connect contact center data to upstream and downstream customer behavior.", },
  ]},
  { id: "governance", name: "Governance & AI Readiness", color: "#EF4444", qs: [
    { q: "AI and automation deployments have defined governance, testing protocols, and rollback procedures.", },
    { q: "There are clear policies for what AI can and cannot do in customer interactions.", },
    { q: "Data privacy, consent, and compliance requirements are embedded in technology decisions.", },
    { q: "The organization has defined ownership for AI quality, model performance, and escalation design.", },
    { q: "There is a process for evaluating new AI capabilities against operational readiness and risk tolerance.", },
  ]},
];

const LEVELS = [
  { min: 1, max: 1.8, tier: "Foundational", color: RED, desc: "The organization is in early stages. CX efforts are fragmented, reactive, and lack consistent governance. Priority: establish basic measurement, define ownership, and build a strategy before investing in technology." },
  { min: 1.8, max: 2.6, tier: "Developing", color: AMBER, desc: "Some CX discipline exists but it is inconsistent across the organization. Pockets of maturity coexist with significant gaps. Priority: standardize operations, close the biggest gaps, and align technology to strategy." },
  { min: 2.6, max: 3.4, tier: "Operational", color: ELECTRIC, desc: "CX is managed as a real operating discipline with defined metrics and governance. The foundation is solid but advanced capabilities (AI, orchestration, journey analytics) are still emerging. Priority: deepen analytics, expand automation, and strengthen cross-functional alignment." },
  { min: 3.4, max: 4.2, tier: "Advanced", color: "#7C3AED", desc: "The organization has strong CX maturity across most dimensions. AI and analytics are integrated into operations. Priority: optimize orchestration, govern AI at scale, and connect CX outcomes to enterprise strategy." },
  { min: 4.2, max: 5.1, tier: "Leading", color: GREEN, desc: "CX is a genuine competitive advantage. The organization has deep operational discipline, AI governance, and measurable business impact. Priority: sustain excellence, innovate at the edges, and share best practices." },
];

const getTier = (score) => LEVELS.find(l => score >= l.min && score < l.max) || LEVELS[LEVELS.length - 1];

export default function CXMaturity() {
  const [phase, setPhase] = useState("gate"); // gate | assess | results
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [currentDim, setCurrentDim] = useState(0);
  const [scores, setScores] = useState({});

  useEffect(() => { window.scrollTo(0, 0); }, [phase]);

  const setScore = (dimId, qIdx, val) => {
    setScores(prev => ({ ...prev, [`${dimId}-${qIdx}`]: val }));
  };

  const dimScore = (dimId) => {
    const dim = DIMS.find(d => d.id === dimId);
    const vals = dim.qs.map((_, i) => scores[`${dimId}-${i}`] || 0).filter(v => v > 0);
    return vals.length === 0 ? 0 : vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const dimComplete = (dimId) => {
    const dim = DIMS.find(d => d.id === dimId);
    return dim.qs.every((_, i) => scores[`${dimId}-${i}`] > 0);
  };

  const allComplete = DIMS.every(d => dimComplete(d.id));
  const overallScore = DIMS.reduce((a, d) => a + dimScore(d.id), 0) / DIMS.length;
  const tier = getTier(overallScore);

  const handleGate = async () => {
    if (!email.includes("@")) return;
    setSending(true);
    try {
      await fetch("https://formspree.io/f/xdaygjev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, company, tool: "CX Maturity Assessment", _subject: "CX Maturity Assessment Access" }),
      });
    } catch (e) {}
    setSending(false);
    setPhase("assess");
  };

  const handleResults = async () => {
    const dimResults = DIMS.map(d => `${d.name}: ${dimScore(d.id).toFixed(1)}/5`).join(" | ");
    try {
      await fetch("https://formspree.io/f/xdaygjev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, company, tool: "CX Maturity Assessment", overallScore: overallScore.toFixed(2), tier: tier.tier, dimensions: dimResults, _subject: `CX Maturity: ${tier.tier} (${overallScore.toFixed(1)}/5) — ${company || name || email}` }),
      });
    } catch (e) {}
    setPhase("results");
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}`}</style>

      <nav style={{ background: DEEP, padding: "16px 0" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14, letterSpacing: 0.4 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
          <a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a>
        </div>
      </nav>

      {/* ═══ GATE ═══ */}
      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", padding: "80px 28px" }}>
          <div style={{ ...WRAP, textAlign: "center" }}>
            <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Calculator & Diagnostic</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "12px 0 16px" }}>CX Maturity Assessment</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 36px", maxWidth: 500, marginLeft: "auto", marginRight: "auto" }}>Score your organization across 5 dimensions — strategy, operations, technology, analytics, and governance. 25 questions. Takes about 5 minutes. You'll get a maturity tier, dimension-by-dimension profile, and specific recommendations.</p>
            <div style={{ maxWidth: 400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Work email *" style={{ padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, outline: "none" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={{ flex: 1, padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none" }} />
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company" style={{ flex: 1, padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none" }} />
              </div>
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "16px", borderRadius: 8, border: "none", background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: sending ? 0.6 : 1, marginTop: 4 }}>{sending ? "Starting..." : "Start Assessment →"}</button>
            </div>
          </div>
        </section>
      )}

      {/* ═══ ASSESSMENT ═══ */}
      {phase === "assess" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "40px 28px 80px" }}>
          <div style={WRAP}>
            {/* Progress */}
            <div style={{ display: "flex", gap: 4, marginBottom: 32 }}>
              {DIMS.map((d, i) => (
                <div key={i} onClick={() => setCurrentDim(i)} style={{ flex: 1, cursor: "pointer" }}>
                  <div style={{ height: 4, borderRadius: 2, background: dimComplete(d.id) ? d.color : i === currentDim ? `${d.color}60` : BORDER, transition: "background 0.3s" }} />
                  <div style={{ fontSize: 10, color: i === currentDim ? d.color : MUTED, fontWeight: i === currentDim ? 700 : 400, marginTop: 6, textAlign: "center" }}>{d.name.split(" ")[0]}</div>
                </div>
              ))}
            </div>

            {/* Current dimension */}
            {(() => {
              const dim = DIMS[currentDim];
              return (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 4, height: 24, borderRadius: 2, background: dim.color }} />
                    <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: NAVY, margin: 0 }}>{dim.name}</h2>
                    <span style={{ fontSize: 11, color: MUTED }}>({currentDim + 1} of {DIMS.length})</span>
                  </div>
                  <p style={{ fontSize: 13, color: MUTED, marginBottom: 28 }}>Rate each statement from 1 (strongly disagree) to 5 (strongly agree) based on your organization's current reality.</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {dim.qs.map((q, qi) => {
                      const val = scores[`${dim.id}-${qi}`] || 0;
                      return (
                        <div key={qi} style={{ background: "#fff", border: `1px solid ${val > 0 ? dim.color + "30" : BORDER}`, borderRadius: 10, padding: "20px 22px", transition: "border-color 0.2s" }}>
                          <p style={{ fontSize: 14, color: NAVY, lineHeight: 1.5, margin: "0 0 14px", fontWeight: 500 }}>{q.q}</p>
                          <div style={{ display: "flex", gap: 8 }}>
                            {[1, 2, 3, 4, 5].map(v => (
                              <button key={v} onClick={() => setScore(dim.id, qi, v)}
                                style={{ width: 44, height: 40, borderRadius: 6, border: val === v ? `2px solid ${dim.color}` : `1px solid ${BORDER}`, background: val === v ? `${dim.color}12` : "#fff", color: val === v ? dim.color : MUTED, fontSize: 15, fontWeight: val === v ? 700 : 400, cursor: "pointer", transition: "all 0.15s" }}>
                                {v}
                              </button>
                            ))}
                            <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: 12 }}>
                              <span style={{ fontSize: 10, color: MUTED }}>1 = Disagree</span>
                              <span style={{ fontSize: 10, color: MUTED }}>5 = Agree</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
                    <button onClick={() => setCurrentDim(Math.max(0, currentDim - 1))} disabled={currentDim === 0}
                      style={{ padding: "12px 24px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: currentDim === 0 ? MUTED : NAVY, fontSize: 14, fontWeight: 500, cursor: currentDim === 0 ? "default" : "pointer" }}>← Previous</button>
                    {currentDim < DIMS.length - 1 ? (
                      <button onClick={() => setCurrentDim(currentDim + 1)}
                        style={{ padding: "12px 24px", borderRadius: 8, border: "none", background: dim.color, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Next: {DIMS[currentDim + 1].name.split(" &")[0]} →</button>
                    ) : (
                      <button onClick={handleResults} disabled={!allComplete}
                        style={{ padding: "12px 28px", borderRadius: 8, border: "none", background: allComplete ? GREEN : MUTED, color: "#fff", fontSize: 14, fontWeight: 600, cursor: allComplete ? "pointer" : "default", opacity: allComplete ? 1 : 0.5 }}>
                        {allComplete ? "View My Results →" : `${DIMS.filter(d => dimComplete(d.id)).length}/${DIMS.length} dimensions complete`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {/* ═══ RESULTS ═══ */}
      {phase === "results" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "48px 28px 80px" }}>
          <div style={WRAP}>
            {/* Overall tier */}
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "40px 32px", textAlign: "center", marginBottom: 32 }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Your CX Maturity Tier</span>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 42, fontWeight: 400, color: tier.color, margin: "8px 0 4px" }}>{tier.tier}</h2>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: "#fff", marginBottom: 16 }}>{overallScore.toFixed(1)} <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>/ 5.0</span></div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>{tier.desc}</p>
            </div>

            {/* Dimension breakdown */}
            <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 20px" }}>Dimension Scores</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {DIMS.map((d, i) => {
                const s = dimScore(d.id);
                const dt = getTier(s);
                return (
                  <div key={i} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 22px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 4, height: 20, borderRadius: 2, background: d.color }} />
                        <span style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{d.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 11, color: dt.color, fontWeight: 600 }}>{dt.tier}</span>
                        <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: dt.color }}>{s.toFixed(1)}</span>
                      </div>
                    </div>
                    <div style={{ height: 8, background: `${d.color}15`, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(s / 5) * 100}%`, background: d.color, borderRadius: 4, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Strongest / Weakest */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
              {(() => {
                const sorted = [...DIMS].sort((a, b) => dimScore(b.id) - dimScore(a.id));
                const strongest = sorted[0];
                const weakest = sorted[sorted.length - 1];
                return (<>
                  <div style={{ background: `${GREEN}08`, border: `1px solid ${GREEN}20`, borderRadius: 10, padding: "20px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: GREEN, letterSpacing: 1, textTransform: "uppercase" }}>Strongest Dimension</span>
                    <h4 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "6px 0 2px" }}>{strongest.name}</h4>
                    <span style={{ fontSize: 13, color: MUTED }}>{dimScore(strongest.id).toFixed(1)} / 5.0</span>
                  </div>
                  <div style={{ background: `${AMBER}08`, border: `1px solid ${AMBER}20`, borderRadius: 10, padding: "20px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: AMBER, letterSpacing: 1, textTransform: "uppercase" }}>Biggest Opportunity</span>
                    <h4 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "6px 0 2px" }}>{weakest.name}</h4>
                    <span style={{ fontSize: 13, color: MUTED }}>{dimScore(weakest.id).toFixed(1)} / 5.0</span>
                  </div>
                </>);
              })()}
            </div>

            {/* CTA */}
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "36px 28px", textAlign: "center" }}>
              <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: "#fff", margin: "0 0 10px" }}>Want help closing the gaps?</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: "0 0 24px", maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>Your maturity profile has been saved. Request a working session and we'll arrive with specific recommendations for your weakest dimensions — drawn from our vendor intelligence and operational frameworks.</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "13px 24px", borderRadius: 8 }}>Request a Working Session</a>
                <a href="/vendors" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 14, fontWeight: 500, padding: "13px 24px", borderRadius: 8 }}>Browse Vendor Intelligence →</a>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
