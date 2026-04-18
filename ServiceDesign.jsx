import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 860, margin: "0 auto", padding: "0 28px" };

function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const JOURNEYS = [
  { name: "New Customer Onboarding", icon: "🏁" },
  { name: "Billing Question / Payment Issue", icon: "💳" },
  { name: "Technical Support / Troubleshooting", icon: "🔧" },
  { name: "Account Change / Profile Update", icon: "📝" },
  { name: "Complaint / Escalation", icon: "⚠️" },
  { name: "Renewal / Retention", icon: "🔄" },
  { name: "Returns / Cancellation", icon: "↩️" },
  { name: "Product Information / Pre-Sales", icon: "📋" },
];

const FRICTION_DIMS = [
  { id: "effort", name: "Customer Effort", desc: "How much work does the customer do to get resolution?", low: "Effortless", high: "Exhausting" },
  { id: "transfers", name: "Transfers & Handoffs", desc: "How many times is the customer passed between people or channels?", low: "Zero/one", high: "3+ transfers" },
  { id: "repeat", name: "Repeat Contact", desc: "How often do customers have to call back about the same issue?", low: "Rarely", high: "Frequently" },
  { id: "wait", name: "Wait Time & Accessibility", desc: "How easy is it to reach the right person or resource?", low: "Instant", high: "Long waits" },
  { id: "resolution", name: "Resolution Quality", desc: "When issues are resolved, does the resolution stick?", low: "Permanent fix", high: "Temporary patch" },
  { id: "emotion", name: "Emotional Impact", desc: "How does the customer feel after the interaction?", low: "Confident", high: "Frustrated" },
];

export default function ServiceDesign() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [selected, setSelected] = useState([]);
  const [scores, setScores] = useState({});
  const [volumes, setVolumes] = useState({});

  useEffect(() => { window.scrollTo(0, 0); }, [phase]);

  const toggleJourney = (idx) => setSelected(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : prev.length < 5 ? [...prev, idx] : prev);
  const setScore = (jIdx, dimId, val) => setScores(prev => ({ ...prev, [`${jIdx}-${dimId}`]: val }));
  const getScore = (jIdx, dimId) => scores[`${jIdx}-${dimId}`] || 0;
  const setVol = (jIdx, val) => setVolumes(prev => ({ ...prev, [jIdx]: val }));

  const journeyFriction = (jIdx) => {
    const vals = FRICTION_DIMS.map(d => getScore(jIdx, d.id)).filter(v => v > 0);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };
  const journeyComplete = (jIdx) => FRICTION_DIMS.every(d => getScore(jIdx, d.id) > 0);
  const allComplete = selected.every(jIdx => journeyComplete(jIdx));
  const overallFriction = selected.length ? selected.reduce((a, j) => a + journeyFriction(j), 0) / selected.length : 0;

  const frictionColor = (f) => f <= 2 ? GREEN : f <= 3 ? ELECTRIC : f <= 4 ? AMBER : RED;
  const frictionLabel = (f) => f <= 2 ? "Low Friction" : f <= 3 ? "Moderate" : f <= 4 ? "High Friction" : "Critical";

  const handleGate = async () => {
    if (!email.includes("@")) return;
    setSending(true);
    try { await fetch("https://formspree.io/f/xgorkqkk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "Service Design Toolkit", _subject: "Service Design Toolkit Access" }) }); } catch (e) {}
    setSending(false);
    setPhase("select");
  };

  const handleResults = async () => {
    const results = selected.map(j => `${JOURNEYS[j].name}: ${journeyFriction(j).toFixed(1)}/5 friction`).join(" | ");
    try { await fetch("https://formspree.io/f/xgorkqkk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "Service Design Toolkit", overallFriction: overallFriction.toFixed(2), journeysScored: selected.length, results, _subject: `Service Design: ${frictionLabel(overallFriction)} (${overallFriction.toFixed(1)}/5) — ${company || name || email}` }) }); } catch (e) {}
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
            <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Framework & Template</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "12px 0 16px" }}>Service Design Toolkit</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 auto 36px", maxWidth: 520 }}>Select your top customer journeys. Score each one on 6 friction dimensions — effort, transfers, repeat contact, wait time, resolution quality, and emotional impact. Get a prioritized friction map that shows where to invest in service design improvements.</p>
            <div style={{ maxWidth: 400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Work email *" style={{ padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, outline: "none" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={{ flex: 1, padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none" }} />
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company" style={{ flex: 1, padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none" }} />
              </div>
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "16px", borderRadius: 8, border: "none", background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: sending ? 0.6 : 1, marginTop: 4 }}>{sending ? "Starting..." : "Start Mapping →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "select" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "48px 28px 80px" }}>
          <div style={WRAP}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>Select your journeys</h2>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 28 }}>Choose 3–5 customer journeys that matter most to your operation. These are the journeys you'll score for friction.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
              {JOURNEYS.map((j, i) => {
                const isSel = selected.includes(i);
                return (
                  <div key={i} onClick={() => toggleJourney(i)} style={{ background: isSel ? `${ELECTRIC}08` : "#fff", border: `1px solid ${isSel ? ELECTRIC : BORDER}`, borderRadius: 10, padding: "18px 16px", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 22 }}>{j.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: isSel ? 600 : 500, color: isSel ? NAVY : SLATE }}>{j.name}</span>
                    {isSel && <span style={{ marginLeft: "auto", color: ELECTRIC, fontWeight: 700 }}>✓</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setPhase("score")} disabled={selected.length < 3} style={{ padding: "14px 28px", borderRadius: 8, border: "none", background: selected.length >= 3 ? ELECTRIC : MUTED, color: "#fff", fontSize: 15, fontWeight: 600, cursor: selected.length >= 3 ? "pointer" : "default" }}>
                {selected.length >= 3 ? `Score ${selected.length} Journeys →` : `Select at least 3 (${selected.length}/3)`}
              </button>
            </div>
          </div>
        </section>
      )}

      {phase === "score" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "40px 28px 80px" }}>
          <div style={WRAP}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>Score friction for each journey</h2>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 28 }}>Rate each dimension 1 (low friction) to 5 (high friction) based on your current customer experience.</p>

            {selected.map((jIdx, si) => {
              const j = JOURNEYS[jIdx];
              const f = journeyFriction(jIdx);
              const complete = journeyComplete(jIdx);
              return (
                <div key={jIdx} style={{ background: "#fff", border: `1px solid ${complete ? frictionColor(f) + "30" : BORDER}`, borderRadius: 12, padding: "24px 22px", marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: 0 }}>{j.icon} {j.name}</h3>
                    {complete && <span style={{ fontSize: 11, fontWeight: 600, color: frictionColor(f), background: `${frictionColor(f)}12`, padding: "3px 8px", borderRadius: 4 }}>{frictionLabel(f)} ({f.toFixed(1)})</span>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {FRICTION_DIMS.map(d => {
                      const val = getScore(jIdx, d.id);
                      return (
                        <div key={d.id} style={{ padding: "8px 0" }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 2 }}>{d.name}</div>
                          <div style={{ fontSize: 10, color: MUTED, marginBottom: 6 }}>{d.desc}</div>
                          <div style={{ display: "flex", gap: 4 }}>
                            {[1,2,3,4,5].map(v => (
                              <button key={v} onClick={() => setScore(jIdx, d.id, v)} style={{ width: 36, height: 30, borderRadius: 5, border: val === v ? `2px solid ${frictionColor(v)}` : `1px solid ${BORDER}`, background: val === v ? `${frictionColor(v)}12` : "#fff", color: val === v ? frictionColor(v) : MUTED, fontSize: 12, fontWeight: val === v ? 700 : 400, cursor: "pointer" }}>{v}</button>
                            ))}
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: MUTED, marginTop: 2 }}>
                            <span>{d.low}</span><span>{d.high}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
              <button onClick={() => setPhase("select")} style={{ padding: "12px 24px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: NAVY, fontSize: 14, cursor: "pointer" }}>← Change Journeys</button>
              <button onClick={handleResults} disabled={!allComplete} style={{ padding: "14px 28px", borderRadius: 8, border: "none", background: allComplete ? GREEN : MUTED, color: "#fff", fontSize: 15, fontWeight: 600, cursor: allComplete ? "pointer" : "default", opacity: allComplete ? 1 : 0.5 }}>
                {allComplete ? "View Friction Map →" : "Complete all journeys to continue"}
              </button>
            </div>
          </div>
        </section>
      )}

      {phase === "results" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "48px 28px 80px" }}>
          <div style={WRAP}>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "40px 32px", textAlign: "center", marginBottom: 32 }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Service Friction Summary</span>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 36, fontWeight: 400, color: frictionColor(overallFriction), margin: "8px 0 4px" }}>{frictionLabel(overallFriction)}</h2>
              <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: "#fff" }}>{overallFriction.toFixed(1)} <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>/ 5.0 average friction</span></div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>{selected.length} journeys scored across 6 friction dimensions</p>
            </div>

            {/* Ranked journeys */}
            <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 20px" }}>Journey Friction Ranking</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {[...selected].sort((a, b) => journeyFriction(b) - journeyFriction(a)).map((jIdx, i) => {
                const j = JOURNEYS[jIdx];
                const f = journeyFriction(jIdx);
                return (
                  <div key={jIdx} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{i === 0 ? "🔴" : i === 1 ? "🟠" : "🟢"} {j.name}</span>
                      <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: frictionColor(f) }}>{f.toFixed(1)}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {FRICTION_DIMS.map(d => {
                        const v = getScore(jIdx, d.id);
                        return <span key={d.id} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: `${frictionColor(v)}12`, color: frictionColor(v), fontWeight: 600 }}>{d.name.split(" ")[0]}: {v}</span>;
                      })}
                    </div>
                    {i === 0 && <p style={{ fontSize: 12, color: RED, fontWeight: 500, marginTop: 8 }}>Highest friction journey — prioritize service design improvements here for maximum customer impact.</p>}
                  </div>
                );
              })}
            </div>

            {/* Worst friction dimensions across all journeys */}
            <div style={{ background: `${AMBER}08`, border: `1px solid ${AMBER}20`, borderRadius: 10, padding: "20px 22px", marginBottom: 32 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: AMBER, letterSpacing: 1, textTransform: "uppercase" }}>Systemic Friction Patterns</span>
              <p style={{ fontSize: 13, color: MUTED, margin: "6px 0 8px" }}>Friction dimensions that score high across multiple journeys indicate systemic issues rather than journey-specific problems.</p>
              {FRICTION_DIMS.map(d => {
                const avg = selected.reduce((a, j) => a + getScore(j, d.id), 0) / selected.length;
                return avg >= 3.5 ? <p key={d.id} style={{ fontSize: 13, color: NAVY, margin: "4px 0" }}><strong>{d.name}</strong> averages {avg.toFixed(1)}/5 across all journeys — this is a systemic friction source.</p> : null;
              }).filter(Boolean)}
              {FRICTION_DIMS.every(d => (selected.reduce((a, j) => a + getScore(j, d.id), 0) / selected.length) < 3.5) && <p style={{ fontSize: 13, color: GREEN }}>No systemic friction patterns detected. Friction is journey-specific.</p>}
            </div>

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "36px 28px", textAlign: "center" }}>
              <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: "#fff", margin: "0 0 10px" }}>Ready to redesign your highest-friction journeys?</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: "0 auto 24px", maxWidth: 440 }}>Your friction map has been saved. Request a working session and we'll help you identify root causes, map improvement opportunities to specific technology capabilities, and build a prioritized service design roadmap.</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "13px 24px", borderRadius: 8 }}>Request a Working Session</a>
                <a href="/tools/experience-scorecard" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 14, fontWeight: 500, padding: "13px 24px", borderRadius: 8 }}>Try the Experience Scorecard →</a>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
