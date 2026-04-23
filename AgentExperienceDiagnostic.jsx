import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const DIMS = [
  { id: "schedule", name: "Schedule Control + Flexibility", color: ELECTRIC, weight: 20, qs: [
    { q: "Agents can swap shifts with peers through a self-service system without manager approval for routine changes." },
    { q: "Schedule preferences (start times, days off) are collected and meaningfully factored into scheduling." },
    { q: "Split shifts, compressed weeks, or hybrid schedules are available based on tenure or performance." },
    { q: "Overtime is voluntary for at least 80% of overtime hours. Mandatory overtime is rare and announced with notice." },
  ]},
  { id: "tooling", name: "Tooling + Desktop Experience", color: "#7C3AED", weight: 20, qs: [
    { q: "Agents use a single desktop application (or tightly integrated workspace) for the majority of interactions." },
    { q: "Customer context (history, account, prior interactions) is available without the agent needing to search for it." },
    { q: "Knowledge base is searchable, current, and returns useful results within 10 seconds." },
    { q: "System latency, crashes, and forced workarounds are tracked and addressed within SLA." },
  ]},
  { id: "knowledge", name: "Knowledge + Enablement", color: GREEN, weight: 20, qs: [
    { q: "New hires receive at least 4 weeks of training before taking live contacts, with a structured nesting period." },
    { q: "Ongoing training happens at least bi-weekly, covering product updates, policy changes, and skill development." },
    { q: "Agents have a clear path to answer any question within 60 seconds using available knowledge tools." },
    { q: "Knowledge gaps identified in QA or escalation review are fed back to the training team within 2 weeks." },
  ]},
  { id: "supervisor", name: "Supervisor Quality + Coaching", color: AMBER, weight: 20, qs: [
    { q: "Supervisors spend at least 40% of their time on coaching, feedback, and development (not admin or escalations)." },
    { q: "Every agent receives at least one meaningful coaching session per week based on specific interaction review." },
    { q: "Feedback is specific, actionable, and balanced (strengths and development areas), not just score delivery." },
    { q: "Supervisors are trained in coaching methodology, not just promoted from top-performer agent roles." },
  ]},
  { id: "career", name: "Career Visibility + Growth", color: "#EC4899", weight: 20, qs: [
    { q: "There are at least 3 documented career paths available from the agent role (specialist, lead, trainer, QA, WFM, etc)." },
    { q: "Agents know what they need to do (skills, tenure, certifications) to advance to the next level." },
    { q: "Internal promotions fill at least 50% of supervisor and specialist positions." },
    { q: "Skill-based pay increases or role progression are available without requiring a management title." },
  ]},
];

const LEVELS = [
  { min: 0, max: 1.5, tier: "Critical Risk", color: RED, desc: "Agent experience is severely deficient across multiple dimensions. Attrition is likely 40%+ and accelerating. Every departing agent costs $8,000-$15,000 to replace. This is the most expensive problem in your operation." },
  { min: 1.5, max: 2.5, tier: "High Risk", color: "#DC6B00", desc: "Significant gaps in agent experience. Attrition is likely 30-40%. The agents who stay are disengaged, which degrades quality and customer experience even when headcount is stable." },
  { min: 2.5, max: 3.5, tier: "Moderate Risk", color: AMBER, desc: "Foundational elements exist but inconsistency undermines them. Attrition is likely 25-35%. Targeted improvements in 1-2 dimensions can break the cycle." },
  { min: 3.5, max: 4.2, tier: "Managed", color: "#7CB342", desc: "Agent experience is intentionally designed and mostly consistent. Attrition is likely 18-28%. You are competitive for talent. Focus on the weakest dimension." },
  { min: 4.2, max: 5.1, tier: "Strong", color: GREEN, desc: "Agent experience is a competitive advantage. Attrition is likely below 20%. You are retaining and developing talent that other operations are losing." },
];

const getTier = (score) => LEVELS.find(l => score >= l.min && score < l.max) || LEVELS[LEVELS.length - 1];

export default function AgentExperienceDiagnostic() {
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
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "Agent Experience Diagnostic", _subject: "Agent Experience Diagnostic Access" }) }); } catch (e) {}
    setSending(false); setPhase("assess");
  };

  const handleResults = async () => {
    const dimResults = DIMS.map(d => `${d.name}: ${dimScore(d.id).toFixed(1)}/5`).join(" | ");
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "Agent Experience Diagnostic", overallScore: overallScore.toFixed(2), tier: tier.tier, dimensions: dimResults, _subject: `Agent Experience: ${tier.tier} (${overallScore.toFixed(1)}/5) — ${company || name || email}` }) }); } catch (e) {}
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
            <span style={{ color: "#EC4899", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Performance + Quality</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>Agent Experience Diagnostic</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 32 }}>Assess the five dimensions that drive agent satisfaction, performance, and retention: schedule control, tooling, knowledge, supervisor quality, and career visibility. Scored output with attrition risk projection.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="text" placeholder="Company (optional)" value={company} onChange={e => setCompany(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "14px", fontSize: 15, fontWeight: 600, background: email.includes("@") ? "#EC4899" : SLATE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: email.includes("@") ? 1 : 0.5 }}>{sending ? "Loading..." : "Start Diagnostic →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "assess" && (
        <section style={{ background: "#fff", padding: "40px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 700 }}>
            {/* Dimension tabs */}
            <div style={{ display: "flex", gap: 4, marginBottom: 32, flexWrap: "wrap" }}>
              {DIMS.map((d, i) => (
                <button key={d.id} onClick={() => setCurrentDim(i)} style={{
                  padding: "8px 16px", fontSize: 12, fontWeight: 600, borderRadius: 6, cursor: "pointer",
                  border: `1px solid ${i === currentDim ? d.color : dimComplete(d.id) ? GREEN : BORDER}`,
                  background: i === currentDim ? `${d.color}12` : dimComplete(d.id) ? `${GREEN}08` : "#fff",
                  color: i === currentDim ? d.color : dimComplete(d.id) ? GREEN : MUTED,
                }}>{dimComplete(d.id) ? "✓ " : ""}{d.name.split("+")[0].trim()}</button>
              ))}
            </div>

            {/* Current dimension questions */}
            {(() => {
              const dim = DIMS[currentDim];
              return (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 4, height: 28, borderRadius: 2, background: dim.color }} />
                    <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: 0 }}>{dim.name}</h2>
                  </div>
                  <p style={{ fontSize: 13, color: MUTED, marginBottom: 24 }}>Rate each statement based on your current operation. Be honest — the diagnostic is only useful if the inputs reflect reality.</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {dim.qs.map((q, qi) => (
                      <div key={qi} style={{ background: WARM, border: `1px solid ${scores[`${dim.id}-${qi}`] ? dim.color + "30" : BORDER}`, borderRadius: 10, padding: "18px 20px" }}>
                        <p style={{ fontSize: 14, color: NAVY, lineHeight: 1.55, margin: "0 0 12px" }}>{q.q}</p>
                        <div style={{ display: "flex", gap: 6 }}>
                          {[1, 2, 3, 4, 5].map(v => (
                            <button key={v} onClick={() => setScore(dim.id, qi, v)} style={{
                              flex: 1, padding: "8px 4px", fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: "pointer",
                              border: `1px solid ${scores[`${dim.id}-${qi}`] === v ? dim.color : BORDER}`,
                              background: scores[`${dim.id}-${qi}`] === v ? dim.color : "#fff",
                              color: scores[`${dim.id}-${qi}`] === v ? "#fff" : MUTED,
                            }}>{labels[v]}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
                    <button onClick={() => setCurrentDim(Math.max(0, currentDim - 1))} disabled={currentDim === 0} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, borderRadius: 6, border: `1px solid ${BORDER}`, background: "#fff", color: currentDim === 0 ? MUTED : NAVY, cursor: "pointer", opacity: currentDim === 0 ? 0.5 : 1 }}>← Previous</button>
                    {currentDim < DIMS.length - 1 ? (
                      <button onClick={() => setCurrentDim(currentDim + 1)} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, borderRadius: 6, border: "none", background: dim.color, color: "#fff", cursor: "pointer" }}>Next: {DIMS[currentDim + 1].name.split("+")[0].trim()} →</button>
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
              <span style={{ fontSize: 11, fontWeight: 700, color: tier.color, letterSpacing: 2, textTransform: "uppercase" }}>Agent Experience Score</span>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 56, color: tier.color, margin: "8px 0" }}>{overallScore.toFixed(1)}<span style={{ fontSize: 24, color: MUTED }}>/5</span></div>
              <div style={{ fontSize: 18, fontWeight: 600, color: NAVY }}>{tier.tier}</div>
              <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.6, maxWidth: 560, margin: "12px auto 0" }}>{tier.desc}</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }} className="pg">
              {DIMS.map((d, i) => {
                const score = dimScore(d.id);
                const pct = (score / 5) * 100;
                return (
                  <div key={d.id} style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 20px", borderLeft: `4px solid ${d.color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{d.name}</span>
                      <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: d.color }}>{score.toFixed(1)}</span>
                    </div>
                    <div style={{ height: 6, background: `${d.color}15`, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: d.color, borderRadius: 3, transition: "width 0.5s" }} />
                    </div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>Weight: {d.weight}% of overall score</div>
                  </div>
                );
              })}
            </div>

            {/* Weakest dimension callout */}
            {(() => {
              const weakest = [...DIMS].sort((a, b) => dimScore(a.id) - dimScore(b.id))[0];
              const strongest = [...DIMS].sort((a, b) => dimScore(b.id) - dimScore(a.id))[0];
              return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }} className="pg">
                  <div style={{ background: `${RED}08`, border: `1px solid ${RED}30`, borderRadius: 10, padding: "18px 20px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: RED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Priority: Biggest Gap</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: NAVY, marginBottom: 4 }}>{weakest.name}</div>
                    <div style={{ fontSize: 13, color: SLATE }}>Score: {dimScore(weakest.id).toFixed(1)}/5. Improving this dimension will have the largest impact on attrition risk and agent performance.</div>
                  </div>
                  <div style={{ background: `${GREEN}08`, border: `1px solid ${GREEN}30`, borderRadius: 10, padding: "18px 20px" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Strength: Protect This</div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: NAVY, marginBottom: 4 }}>{strongest.name}</div>
                    <div style={{ fontSize: 13, color: SLATE }}>Score: {dimScore(strongest.id).toFixed(1)}/5. This is working. Do not deprioritize it in pursuit of fixing gaps.</div>
                  </div>
                </div>
              );
            })()}

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>
                <strong style={{ color: "#fff" }}>The connection most operations miss:</strong> Agent experience drives attrition. Attrition drives cost, quality, and customer experience. A 1-point improvement in agent experience score correlates with 5-8 points of attrition reduction. At $8,000-$15,000 per departure, even a modest improvement in the weakest dimension produces measurable ROI within two quarters.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/tools/attrition-cost" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Calculate Your Attrition Cost →</a>
              <a href="/human-premium" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>The Human Premium →</a>
              <a href="/how-to-choose" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Explore More Tools</a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
