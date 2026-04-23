import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const DIMS = [
  { id: "policy", name: "Policy + Process Gaps", color: RED, icon: "📋",
    desc: "Policies that force callbacks: verification steps that cannot be completed in one contact, approval chains that require follow-up, processes that span departments.",
    qs: [
      { q: "Agents can resolve the top 10 contact types without escalation or manager approval." },
      { q: "Policy exceptions have clear, documented authority levels that agents can apply in real time." },
      { q: "Multi-step processes (claims, disputes, changes) can be completed in a single interaction." },
      { q: "Customers do not need to call back to confirm that an action was completed." },
    ]},
  { id: "handoff", name: "Handoff + Transfer Failures", color: AMBER, icon: "↗️",
    desc: "Context lost during transfers, departments that do not share information, warm transfers that go cold.",
    qs: [
      { q: "When agents transfer a call, full context (reason, steps taken, customer mood) transfers with it." },
      { q: "Transferred customers do not need to re-explain their issue to the receiving agent." },
      { q: "Cross-department handoffs have SLAs for response and resolution." },
      { q: "Transfer rates are tracked by reason code and used to improve routing." },
    ]},
  { id: "channel", name: "Channel Mismatch", color: ELECTRIC, icon: "📱",
    desc: "Customers forced into the wrong channel for their issue type, or channel switches that lose context.",
    qs: [
      { q: "Complex issues are routed to the channel best suited for resolution (not forced through chat or IVR)." },
      { q: "When a customer switches channels (chat to phone), prior conversation context is available to the agent." },
      { q: "Self-service handles the issue types customers actually want to self-serve (not just the ones that are easy to automate)." },
      { q: "Channel containment is measured by resolution, not just deflection." },
    ]},
  { id: "knowledge", name: "Knowledge + Information Gaps", color: "#7C3AED", icon: "📚",
    desc: "Outdated articles, missing procedures, conflicting information between sources, knowledge that exists but cannot be found.",
    qs: [
      { q: "Knowledge articles are reviewed and updated at least quarterly." },
      { q: "Agents report knowledge gaps and those reports are actioned within 2 weeks." },
      { q: "There is a single source of truth (not conflicting information across wikis, SharePoint, and tribal knowledge)." },
      { q: "New product launches, policy changes, and system updates are reflected in the knowledge base before going live." },
    ]},
  { id: "skill", name: "Agent Skill + Training Gaps", color: "#EC4899", icon: "🎯",
    desc: "Agents who lack the skill, confidence, or authorization to resolve on first contact.",
    qs: [
      { q: "Agents are assessed on specific skill gaps (not just overall QA scores) and training targets those gaps." },
      { q: "New agents can identify when they are out of their depth and escalate gracefully." },
      { q: "Tenured agents have skills and authority that grow with experience." },
      { q: "Call types with the lowest FCR are analyzed for skill or training root causes." },
    ]},
  { id: "workflow", name: "Broken Workflows + Systems", color: "#0EA5E9", icon: "⚙️",
    desc: "Systems that do not talk to each other, manual steps that introduce errors, processes that require follow-up by design.",
    qs: [
      { q: "The top 10 workflows can be completed end-to-end in a single system or tightly integrated set of systems." },
      { q: "Agents do not need to manually copy data between applications to complete a task." },
      { q: "System errors and timeouts are rare and do not force the agent to ask the customer to call back." },
      { q: "Automated follow-up notifications (confirmation emails, status updates) are triggered by the system, not the agent." },
    ]},
];

const LEVELS = [
  { min: 0, max: 1.5, tier: "Severe Leakage", color: RED, desc: "Your repeat contact rate is likely above 35%. Every FCR point you gain saves significant volume, staffing, and cost." },
  { min: 1.5, max: 2.5, tier: "High Leakage", color: "#DC6B00", desc: "Repeat contacts are a top-3 cost driver. Focus on the 1-2 weakest dimensions for the fastest ROI." },
  { min: 2.5, max: 3.5, tier: "Moderate Leakage", color: AMBER, desc: "FCR is likely 70-78%. Targeted improvements in specific dimensions can push you into the top quartile." },
  { min: 3.5, max: 4.2, tier: "Controlled", color: "#7CB342", desc: "FCR is likely 78-85%. You are managing the controllable drivers. Focus on the remaining systemic gaps." },
  { min: 4.2, max: 5.1, tier: "Minimal Leakage", color: GREEN, desc: "FCR is likely 85%+. Remaining repeat contacts are driven by genuine complexity, not controllable failure." },
];

const getTier = (score) => LEVELS.find(l => score >= l.min && score < l.max) || LEVELS[LEVELS.length - 1];

export default function FCRLeakageDiagnostic() {
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
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "FCR Leakage Diagnostic", _subject: "FCR Leakage Diagnostic Access" }) }); } catch (e) {}
    setSending(false); setPhase("assess");
  };

  const handleResults = async () => {
    const dimResults = DIMS.map(d => `${d.name}: ${dimScore(d.id).toFixed(1)}/5`).join(" | ");
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "FCR Leakage Diagnostic", overallScore: overallScore.toFixed(2), tier: tier.tier, dimensions: dimResults, _subject: `FCR Leakage: ${tier.tier} (${overallScore.toFixed(1)}/5) — ${company || name || email}` }) }); } catch (e) {}
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
            <span style={{ color: RED, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Performance + Quality</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>FCR Leakage Diagnostic</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 32 }}>Low FCR is a symptom, not a diagnosis. This tool identifies the root cause across six dimensions: policy gaps, handoff failures, channel mismatch, knowledge issues, skill gaps, and broken workflows.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="text" placeholder="Company (optional)" value={company} onChange={e => setCompany(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "14px", fontSize: 15, fontWeight: 600, background: email.includes("@") ? RED : SLATE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: email.includes("@") ? 1 : 0.5 }}>{sending ? "Loading..." : "Start Diagnostic →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "assess" && (
        <section style={{ background: "#fff", padding: "40px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 700 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 32, flexWrap: "wrap" }}>
              {DIMS.map((d, i) => (
                <button key={d.id} onClick={() => setCurrentDim(i)} style={{ padding: "8px 14px", fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: "pointer", border: `1px solid ${i === currentDim ? d.color : dimComplete(d.id) ? GREEN : BORDER}`, background: i === currentDim ? `${d.color}12` : dimComplete(d.id) ? `${GREEN}08` : "#fff", color: i === currentDim ? d.color : dimComplete(d.id) ? GREEN : MUTED }}>{dimComplete(d.id) ? "✓ " : ""}{d.icon} {d.name.split("+")[0].trim()}</button>
              ))}
            </div>
            {(() => {
              const dim = DIMS[currentDim];
              return (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 22 }}>{dim.icon}</span>
                    <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: 0 }}>{dim.name}</h2>
                  </div>
                  <p style={{ fontSize: 13, color: MUTED, marginBottom: 24, maxWidth: 560 }}>{dim.desc}</p>
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
              <span style={{ fontSize: 11, fontWeight: 700, color: tier.color, letterSpacing: 2, textTransform: "uppercase" }}>FCR Leakage Score</span>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 56, color: tier.color, margin: "8px 0" }}>{overallScore.toFixed(1)}<span style={{ fontSize: 24, color: MUTED }}>/5</span></div>
              <div style={{ fontSize: 18, fontWeight: 600, color: NAVY }}>{tier.tier}</div>
              <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.6, maxWidth: 560, margin: "12px auto 0" }}>{tier.desc}</p>
            </div>

            {/* Dimension scores */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }} className="pg">
              {DIMS.map(d => {
                const score = dimScore(d.id);
                return (
                  <div key={d.id} style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px", borderLeft: `4px solid ${d.color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>{d.icon} {d.name.split("+")[0].trim()}</span>
                      <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: d.color }}>{score.toFixed(1)}</span>
                    </div>
                    <div style={{ height: 5, background: `${d.color}15`, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(score / 5) * 100}%`, background: d.color, borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Top leakage sources */}
            {(() => {
              const sorted = [...DIMS].sort((a, b) => dimScore(a.id) - dimScore(b.id));
              return (
                <div style={{ background: `${RED}06`, border: `1px solid ${RED}20`, borderRadius: 12, padding: "24px", marginBottom: 28 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: RED, marginBottom: 12 }}>Top FCR Leakage Sources (Lowest Scores)</h3>
                  {sorted.slice(0, 3).map((d, i) => (
                    <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < 2 ? `1px solid ${RED}15` : "none" }}>
                      <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: RED, width: 24 }}>{i + 1}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: NAVY, flex: 1 }}>{d.icon} {d.name}</span>
                      <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: RED }}>{dimScore(d.id).toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              );
            })()}

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>
                <strong style={{ color: "#fff" }}>FCR is not an agent problem. It is a system problem.</strong> Most repeat contacts are caused by policy constraints, knowledge gaps, and broken workflows. Agents cannot resolve what the system does not let them resolve. The highest-ROI FCR improvements come from fixing the top leakage source identified above. Every 1% improvement in FCR reduces total contact volume by 1-3%, which directly reduces staffing, overtime, and customer effort.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/tools/cost-per-contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Calculate Cost per Resolution →</a>
              <a href="/tools/aht-decomposition" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>AHT Decomposition →</a>
              <a href="/how-to-choose" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Explore More Tools</a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
