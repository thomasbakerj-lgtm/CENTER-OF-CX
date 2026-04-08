import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 860, margin: "0 auto", padding: "0 28px" };

function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const DIMS = [
  { id: "data", name: "Data Quality & Access", color: ELECTRIC, qs: [
    { q: "Customer interaction data (calls, chats, emails) is captured, stored, and accessible in a structured format." },
    { q: "CRM and case data is reliably linked to interaction records so AI can access customer context." },
    { q: "Knowledge base content is current, well-organized, and machine-readable." },
    { q: "Data quality issues (duplicates, missing fields, stale records) are actively managed and measured." },
  ]},
  { id: "workflow", name: "Workflow Readiness", color: "#10B981", qs: [
    { q: "Common interaction types (order status, billing, scheduling) follow documented, repeatable workflows." },
    { q: "Escalation paths and exception handling are clearly defined and consistently followed." },
    { q: "Agent desktop workflows are standardized — agents follow the same steps for the same issue types." },
    { q: "There is a clear view of which interaction types are high-volume, low-complexity candidates for automation." },
  ]},
  { id: "integration", name: "Integration Architecture", color: "#7C3AED", qs: [
    { q: "Core systems (CRM, CCaaS, knowledge base, billing) have documented APIs that are actively maintained." },
    { q: "The CCaaS platform supports real-time event streaming and webhook-based integrations." },
    { q: "Identity and authentication systems can be invoked during automated interactions." },
    { q: "There is an integration owner or team responsible for maintaining cross-system connectivity." },
  ]},
  { id: "governance", name: "AI Governance & Policy", color: "#F59E0B", qs: [
    { q: "There are defined policies for what AI can and cannot do in customer-facing interactions." },
    { q: "AI outputs are subject to review, testing, and approval before production deployment." },
    { q: "There is a named owner for AI quality, model performance, and escalation design." },
    { q: "Compliance, privacy, and consent requirements are documented and applied to AI-driven interactions." },
  ]},
  { id: "talent", name: "Talent & Change Readiness", color: "#EF4444", qs: [
    { q: "The organization has people who can configure, tune, and maintain AI tools (or a plan to hire/train them)." },
    { q: "Frontline agents and supervisors understand how AI will change their roles and workflows." },
    { q: "Leadership has set realistic expectations for AI deployment timelines and outcomes." },
    { q: "There is a change management plan that addresses agent adoption, trust, and feedback loops." },
  ]},
  { id: "measurement", name: "Measurement & Iteration", color: "#3B82F6", qs: [
    { q: "There are defined KPIs for AI performance (containment rate, handoff quality, answer accuracy, resolution time)." },
    { q: "AI interactions are monitored with the same rigor as human interactions (QA scoring, compliance checks)." },
    { q: "There is a feedback loop where AI performance data drives tuning and improvement cycles." },
    { q: "The organization can measure the economic impact of AI (cost per contact change, labor leverage, deflection rate)." },
  ]},
];

const LEVELS = [
  { min: 1, max: 1.8, tier: "Not Ready", color: RED, desc: "Significant gaps exist across data, workflow, and governance foundations. AI deployments attempted now will likely underperform or create risk. Priority: build the data and workflow foundation before investing in AI tooling.", rec: "Start with data quality assessment, workflow documentation, and governance policy creation. Do not purchase AI tools yet." },
  { min: 1.8, max: 2.6, tier: "Early Stage", color: AMBER, desc: "Some foundations are in place but critical gaps remain. Limited AI pilots may be possible in narrow, well-defined use cases. Priority: close the biggest gaps in data access, integration, and governance before expanding.", rec: "Pilot AI in one high-volume, low-complexity use case. Simultaneously invest in data quality, API readiness, and governance policy." },
  { min: 2.6, max: 3.4, tier: "Foundation Set", color: ELECTRIC, desc: "Core readiness exists for structured AI deployments. Data access, workflows, and governance are functional but may lack depth in specific areas. Priority: expand AI coverage methodically while strengthening weak dimensions.", rec: "Deploy agent assist and automated summaries broadly. Begin IVA pilots for top 3 contact types. Invest in the weakest dimension identified." },
  { min: 3.4, max: 4.2, tier: "AI Capable", color: "#7C3AED", desc: "Strong readiness across most dimensions. The organization can support meaningful AI deployments including autonomous resolution, agent assist, and predictive analytics. Priority: optimize and scale.", rec: "Scale autonomous resolution for Tier 1 contacts. Deploy real-time agent assist across voice and digital. Build AI governance into standard operating procedures." },
  { min: 4.2, max: 5.1, tier: "AI Advanced", color: GREEN, desc: "Exceptional readiness. The organization has the data, architecture, governance, and talent to operate AI as a core component of the service model. Priority: push toward agentic AI and experience orchestration.", rec: "Explore agentic workflows, proactive service automation, and AI-driven orchestration. Readiness is no longer your constraint — ambition is." },
];

const getTier = (score) => LEVELS.find(l => score >= l.min && score < l.max) || LEVELS[LEVELS.length - 1];

export default function AIReadiness() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [currentDim, setCurrentDim] = useState(0);
  const [scores, setScores] = useState({});

  useEffect(() => { window.scrollTo(0, 0); }, [phase]);

  const setScore = (dimId, qIdx, val) => setScores(prev => ({ ...prev, [`${dimId}-${qIdx}`]: val }));
  const dimScore = (dimId) => { const dim = DIMS.find(d => d.id === dimId); const vals = dim.qs.map((_, i) => scores[`${dimId}-${i}`] || 0).filter(v => v > 0); return vals.length === 0 ? 0 : vals.reduce((a, b) => a + b, 0) / vals.length; };
  const dimComplete = (dimId) => DIMS.find(d => d.id === dimId).qs.every((_, i) => scores[`${dimId}-${i}`] > 0);
  const allComplete = DIMS.every(d => dimComplete(d.id));
  const overallScore = DIMS.reduce((a, d) => a + dimScore(d.id), 0) / DIMS.length;
  const tier = getTier(overallScore);

  const handleGate = async () => {
    if (!email.includes("@")) return;
    setSending(true);
    try { await fetch("https://formspree.io/f/xnjolywk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "AI Readiness Diagnostic", _subject: "AI Readiness Diagnostic Access" }) }); } catch (e) {}
    setSending(false);
    setPhase("assess");
  };

  const handleResults = async () => {
    const dimResults = DIMS.map(d => `${d.name}: ${dimScore(d.id).toFixed(1)}/5`).join(" | ");
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "AI Readiness Diagnostic", overallScore: overallScore.toFixed(2), tier: tier.tier, dimensions: dimResults, _subject: `AI Readiness: ${tier.tier} (${overallScore.toFixed(1)}/5) — ${company || name || email}` }) }); } catch (e) {}
    setPhase("results");
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}`}</style>

      <nav style={{ background: DEEP, padding: "16px 0" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
          <a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a>
        </div>
      </nav>

      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", padding: "80px 28px" }}>
          <div style={{ ...WRAP, textAlign: "center" }}>
            <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Calculator & Diagnostic</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "12px 0 16px" }}>AI Readiness Diagnostic</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 auto 36px", maxWidth: 500 }}>Evaluate whether your data quality, workflow design, integration architecture, governance, talent, and measurement capabilities can support AI-driven automation and agent assist. 24 questions across 6 dimensions. Takes about 5 minutes.</p>
            <div style={{ maxWidth: 400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Work email *" style={{ padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, outline: "none" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={{ flex: 1, padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none" }} />
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company" style={{ flex: 1, padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none" }} />
              </div>
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "16px", borderRadius: 8, border: "none", background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: sending ? 0.6 : 1, marginTop: 4 }}>{sending ? "Starting..." : "Start Diagnostic →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "assess" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "40px 28px 80px" }}>
          <div style={WRAP}>
            <div style={{ display: "flex", gap: 4, marginBottom: 32 }}>
              {DIMS.map((d, i) => (
                <div key={i} onClick={() => setCurrentDim(i)} style={{ flex: 1, cursor: "pointer" }}>
                  <div style={{ height: 4, borderRadius: 2, background: dimComplete(d.id) ? d.color : i === currentDim ? `${d.color}60` : BORDER, transition: "background 0.3s" }} />
                  <div style={{ fontSize: 9, color: i === currentDim ? d.color : MUTED, fontWeight: i === currentDim ? 700 : 400, marginTop: 6, textAlign: "center" }}>{d.name.split(" ")[0]}</div>
                </div>
              ))}
            </div>
            {(() => {
              const dim = DIMS[currentDim];
              return (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 4, height: 24, borderRadius: 2, background: dim.color }} />
                    <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: NAVY, margin: 0 }}>{dim.name}</h2>
                    <span style={{ fontSize: 11, color: MUTED }}>({currentDim + 1} of {DIMS.length})</span>
                  </div>
                  <p style={{ fontSize: 13, color: MUTED, marginBottom: 28 }}>Rate each statement from 1 (strongly disagree) to 5 (strongly agree) based on your current reality.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {dim.qs.map((q, qi) => {
                      const val = scores[`${dim.id}-${qi}`] || 0;
                      return (
                        <div key={qi} style={{ background: "#fff", border: `1px solid ${val > 0 ? dim.color + "30" : BORDER}`, borderRadius: 10, padding: "20px 22px" }}>
                          <p style={{ fontSize: 14, color: NAVY, lineHeight: 1.5, margin: "0 0 14px", fontWeight: 500 }}>{q.q}</p>
                          <div style={{ display: "flex", gap: 8 }}>
                            {[1, 2, 3, 4, 5].map(v => (
                              <button key={v} onClick={() => setScore(dim.id, qi, v)} style={{ width: 44, height: 40, borderRadius: 6, border: val === v ? `2px solid ${dim.color}` : `1px solid ${BORDER}`, background: val === v ? `${dim.color}12` : "#fff", color: val === v ? dim.color : MUTED, fontSize: 15, fontWeight: val === v ? 700 : 400, cursor: "pointer" }}>{v}</button>
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
                    <button onClick={() => setCurrentDim(Math.max(0, currentDim - 1))} disabled={currentDim === 0} style={{ padding: "12px 24px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: currentDim === 0 ? MUTED : NAVY, fontSize: 14, fontWeight: 500, cursor: currentDim === 0 ? "default" : "pointer" }}>← Previous</button>
                    {currentDim < DIMS.length - 1 ? (
                      <button onClick={() => setCurrentDim(currentDim + 1)} style={{ padding: "12px 24px", borderRadius: 8, border: "none", background: dim.color, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Next: {DIMS[currentDim + 1].name.split(" &")[0].split(" ")[0]} →</button>
                    ) : (
                      <button onClick={handleResults} disabled={!allComplete} style={{ padding: "12px 28px", borderRadius: 8, border: "none", background: allComplete ? GREEN : MUTED, color: "#fff", fontSize: 14, fontWeight: 600, cursor: allComplete ? "pointer" : "default", opacity: allComplete ? 1 : 0.5 }}>
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

      {phase === "results" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "48px 28px 80px" }}>
          <div style={WRAP}>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "40px 32px", textAlign: "center", marginBottom: 32 }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Your AI Readiness Level</span>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 42, fontWeight: 400, color: tier.color, margin: "8px 0 4px" }}>{tier.tier}</h2>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: "#fff", marginBottom: 16 }}>{overallScore.toFixed(1)} <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>/ 5.0</span></div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>{tier.desc}</p>
            </div>

            {/* Recommendation */}
            <div style={{ background: `${tier.color}08`, border: `1px solid ${tier.color}20`, borderRadius: 10, padding: "20px 22px", marginBottom: 32 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: tier.color, letterSpacing: 1, textTransform: "uppercase" }}>Recommended Next Step</span>
              <p style={{ fontSize: 14, color: NAVY, lineHeight: 1.6, margin: "6px 0 0", fontWeight: 500 }}>{tier.rec}</p>
            </div>

            <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 20px" }}>Dimension Scores</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {DIMS.map((d, i) => {
                const s = dimScore(d.id); const dt = getTier(s);
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

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
              {(() => {
                const sorted = [...DIMS].sort((a, b) => dimScore(b.id) - dimScore(a.id));
                return (<>
                  <div style={{ background: `${GREEN}08`, border: `1px solid ${GREEN}20`, borderRadius: 10, padding: "20px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: GREEN, letterSpacing: 1, textTransform: "uppercase" }}>Most Ready</span>
                    <h4 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "6px 0 2px" }}>{sorted[0].name}</h4>
                    <span style={{ fontSize: 13, color: MUTED }}>{dimScore(sorted[0].id).toFixed(1)} / 5.0</span>
                  </div>
                  <div style={{ background: `${RED}08`, border: `1px solid ${RED}20`, borderRadius: 10, padding: "20px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: RED, letterSpacing: 1, textTransform: "uppercase" }}>Biggest Gap</span>
                    <h4 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "6px 0 2px" }}>{sorted[sorted.length - 1].name}</h4>
                    <span style={{ fontSize: 13, color: MUTED }}>{dimScore(sorted[sorted.length - 1].id).toFixed(1)} / 5.0</span>
                  </div>
                </>);
              })()}
            </div>

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "36px 28px", textAlign: "center" }}>
              <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: "#fff", margin: "0 0 10px" }}>Ready to close the gaps?</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: "0 auto 24px", maxWidth: 440 }}>Your AI readiness profile has been saved. Request a working session and we'll arrive with a specific plan for your weakest dimensions — including vendor recommendations and implementation sequencing.</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "13px 24px", borderRadius: 8 }}>Request a Working Session</a>
                <a href="/vendors/agent-assist" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 14, fontWeight: 500, padding: "13px 24px", borderRadius: 8 }}>Browse Agent Assist Vendors →</a>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
