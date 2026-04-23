import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const DIMS = [
  { id: "leadership", name: "Leadership Alignment", color: ELECTRIC, qs: [
    { q: "Executive sponsor is named, active, and has authority over budget and timeline." },
    { q: "CX, IT, and operations leadership agree on the transformation objectives and success metrics." },
    { q: "The business case has been approved with realistic ROI expectations (not vendor projections)." },
    { q: "There is organizational tolerance for a 6-12 month transition period with potential service level dips." },
  ]},
  { id: "budget", name: "Budget + Timeline Realism", color: AMBER, qs: [
    { q: "Budget includes implementation, integration, training, parallel-run, and 6 months of contingency." },
    { q: "Timeline accounts for vendor selection (3-4 months), implementation (4-8 months), and stabilization (3-6 months)." },
    { q: "Dual-platform costs during migration are budgeted, not assumed to be zero." },
    { q: "There is budget for internal backfill or contractors to cover team members dedicated to the project." },
  ]},
  { id: "team", name: "Team Capacity + Skills", color: GREEN, qs: [
    { q: "A dedicated project team is identified with at least 50% allocation (not doing migration 'on the side')." },
    { q: "Technical resources (integration, telephony, data) are available or planned for hire." },
    { q: "Contact center SMEs (WFM, QA, training, ops) are included in the project team." },
    { q: "The team has experience with at least one prior platform migration or major technology implementation." },
  ]},
  { id: "vendor", name: "Vendor Selection Maturity", color: "#7C3AED", qs: [
    { q: "Requirements are documented, weighted, and reflect actual operational needs (not vendor wish lists)." },
    { q: "At least 3 vendors have been evaluated with structured demos using your scenarios, not vendor scripts." },
    { q: "Reference checks have been completed with organizations of similar size, vertical, and complexity." },
    { q: "Contract terms have been reviewed for rate locks, exit clauses, SLAs, and data portability." },
  ]},
  { id: "technical", name: "Technical Readiness", color: "#0EA5E9", qs: [
    { q: "Integration dependencies are mapped (CRM, WFM, QA, knowledge, identity, payments, reporting)." },
    { q: "Data migration strategy is defined (what moves, what stays, what gets rebuilt)." },
    { q: "Network and telephony requirements are assessed (BYOC, SIP, PSTN, bandwidth, latency)." },
    { q: "Security and compliance requirements are documented and the new platform has been validated against them." },
  ]},
  { id: "change", name: "Change Management Capacity", color: "#EC4899", qs: [
    { q: "A training plan exists for agents, supervisors, QA, WFM, and IT — not just vendor certification." },
    { q: "Communication plan addresses all stakeholders: frontline, management, executive, and customer-facing messaging." },
    { q: "Parallel-run or phased rollout strategy is defined (not a hard cutover for the entire operation)." },
    { q: "Success metrics are defined for each phase, not just go-live: stabilization metrics, adoption metrics, and outcome metrics." },
  ]},
];

const LEVELS = [
  { min: 0, max: 1.5, tier: "Not Ready", color: RED, phase: "Pause. Close critical gaps before engaging vendors.", desc: "Multiple foundational gaps will cause the transformation to fail or dramatically exceed budget and timeline." },
  { min: 1.5, max: 2.5, tier: "Early Stage", color: "#DC6B00", phase: "Phase 1 only: requirements and vendor evaluation.", desc: "You can begin vendor evaluation but should not commit to an implementation timeline until gaps in budget, team, or technical readiness are closed." },
  { min: 2.5, max: 3.5, tier: "Developing", color: AMBER, phase: "Proceed with caution. Address gaps in parallel.", desc: "Foundation exists but specific dimensions need attention. Identify your 2 weakest areas and close them before signing a contract." },
  { min: 3.5, max: 4.2, tier: "Ready", color: "#7CB342", phase: "Proceed. Maintain governance rigor.", desc: "Organization is prepared for transformation. The risk is execution, not readiness. Maintain discipline on timeline and scope management." },
  { min: 4.2, max: 5.1, tier: "Strong", color: GREEN, phase: "Execute with confidence.", desc: "All dimensions are at or above threshold. This is rare. Move forward and focus on execution excellence." },
];

const getTier = (score) => LEVELS.find(l => score >= l.min && score < l.max) || LEVELS[LEVELS.length - 1];

export default function TransformationReadiness() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState(""); const [company, setCompany] = useState("");
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
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "Transformation Readiness", _subject: "Transformation Readiness Access" }) }); } catch (e) {}
    setSending(false); setPhase("assess");
  };

  const handleResults = async () => {
    const dimResults = DIMS.map(d => `${d.name}: ${dimScore(d.id).toFixed(1)}/5`).join(" | ");
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "Transformation Readiness", overallScore: overallScore.toFixed(2), tier: tier.tier, dimensions: dimResults, _subject: `Transformation: ${tier.tier} (${overallScore.toFixed(1)}/5) — ${company || name || email}` }) }); } catch (e) {}
    setPhase("results");
  };

  const labels = ["", "Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.pg{grid-template-columns:1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "80px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 520 }}>
            <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Vendor Selection</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>Transformation Readiness Scorecard</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 32 }}>The go/no-go assessment. Score your organization across leadership, budget, team, vendor maturity, technical readiness, and change management. Get a phased recommendation.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="text" placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "14px", fontSize: 15, fontWeight: 600, background: email.includes("@") ? ELECTRIC : SLATE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: email.includes("@") ? 1 : 0.5 }}>{sending ? "Loading..." : "Start Assessment →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "assess" && (
        <section style={{ background: "#fff", padding: "40px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 700 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 32, flexWrap: "wrap" }}>
              {DIMS.map((d, i) => (
                <button key={d.id} onClick={() => setCurrentDim(i)} style={{ padding: "8px 14px", fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: "pointer", border: `1px solid ${i === currentDim ? d.color : dimComplete(d.id) ? GREEN : BORDER}`, background: i === currentDim ? `${d.color}12` : dimComplete(d.id) ? `${GREEN}08` : "#fff", color: i === currentDim ? d.color : dimComplete(d.id) ? GREEN : MUTED }}>{dimComplete(d.id) ? "✓ " : ""}{d.name.split("+")[0].trim()}</button>
              ))}
            </div>
            {(() => {
              const dim = DIMS[currentDim];
              return (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <div style={{ width: 4, height: 28, borderRadius: 2, background: dim.color }} />
                    <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: 0 }}>{dim.name}</h2>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {dim.qs.map((q, qi) => (
                      <div key={qi} style={{ background: WARM, border: `1px solid ${scores[`${dim.id}-${qi}`] ? dim.color + "30" : BORDER}`, borderRadius: 10, padding: "18px 20px" }}>
                        <p style={{ fontSize: 14, color: NAVY, lineHeight: 1.55, margin: "0 0 12px" }}>{q.q}</p>
                        <div style={{ display: "flex", gap: 6 }}>
                          {[1, 2, 3, 4, 5].map(v => (
                            <button key={v} onClick={() => setScore(dim.id, qi, v)} style={{ flex: 1, padding: "8px 4px", fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: "pointer", border: `1px solid ${scores[`${dim.id}-${qi}`] === v ? dim.color : BORDER}`, background: scores[`${dim.id}-${qi}`] === v ? dim.color : "#fff", color: scores[`${dim.id}-${qi}`] === v ? "#fff" : MUTED }}>{labels[v]}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                    <button onClick={() => setCurrentDim(Math.max(0, currentDim - 1))} disabled={currentDim === 0} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, borderRadius: 6, border: `1px solid ${BORDER}`, background: "#fff", color: currentDim === 0 ? MUTED : NAVY, cursor: "pointer", opacity: currentDim === 0 ? 0.5 : 1 }}>← Previous</button>
                    {currentDim < DIMS.length - 1 ? (
                      <button onClick={() => setCurrentDim(currentDim + 1)} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, borderRadius: 6, border: "none", background: dim.color, color: "#fff", cursor: "pointer" }}>Next →</button>
                    ) : (
                      <button onClick={handleResults} disabled={!allComplete} style={{ padding: "10px 24px", fontSize: 13, fontWeight: 600, borderRadius: 6, border: "none", background: allComplete ? GREEN : MUTED, color: "#fff", cursor: "pointer", opacity: allComplete ? 1 : 0.5 }}>{allComplete ? "See Results →" : "Complete all dimensions"}</button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {phase === "results" && (
        <section style={{ background: "#fff", padding: "40px 28px 60px" }}>
          <div style={WRAP}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: tier.color, letterSpacing: 2, textTransform: "uppercase" }}>Transformation Readiness</span>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 56, color: tier.color, margin: "8px 0" }}>{overallScore.toFixed(1)}<span style={{ fontSize: 24, color: MUTED }}>/5</span></div>
              <div style={{ fontSize: 18, fontWeight: 600, color: NAVY, marginBottom: 4 }}>{tier.tier}</div>
              <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.6, maxWidth: 560, margin: "0 auto" }}>{tier.desc}</p>
            </div>

            {/* Phase recommendation */}
            <div style={{ background: `${tier.color}08`, border: `2px solid ${tier.color}`, borderRadius: 12, padding: "20px 24px", marginBottom: 24, textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: tier.color, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Recommendation</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: NAVY }}>{tier.phase}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }} className="pg">
              {DIMS.map(d => {
                const score = dimScore(d.id);
                const isWeak = score < 2.5;
                return (
                  <div key={d.id} style={{ background: isWeak ? `${RED}06` : WARM, border: `1px solid ${isWeak ? RED + "30" : BORDER}`, borderRadius: 10, padding: "16px", borderLeft: `4px solid ${d.color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>{d.name}</span>
                      <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: d.color }}>{score.toFixed(1)}</span>
                    </div>
                    <div style={{ height: 5, background: `${d.color}15`, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(score / 5) * 100}%`, background: d.color, borderRadius: 3 }} />
                    </div>
                    {isWeak && <div style={{ fontSize: 11, color: RED, fontWeight: 600, marginTop: 6 }}>Close this gap before proceeding</div>}
                  </div>
                );
              })}
            </div>

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "32px", textAlign: "center", marginBottom: 24 }}>
              <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: "#fff", margin: "0 0 8px" }}>Readiness is not a vendor problem. It is an organizational one.</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 20px" }}>
                Most transformations fail not because the technology was wrong, but because the organization was not ready to absorb the change. A working session can help you build the readiness plan before you commit the budget.
              </p>
              <a href="/contact" style={{ display: "inline-block", background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 32px", borderRadius: 8, boxShadow: "0 4px 18px rgba(0,136,221,0.3)" }}>Request a Working Session →</a>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/tools/vendor-match" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Vendor Match Engine →</a>
              <a href="/tools/platform-decision" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Platform Decision Matrix →</a>
              <a href="/how-to-choose" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Explore More Tools</a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
