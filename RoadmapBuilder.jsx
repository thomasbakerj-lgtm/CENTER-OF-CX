import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 900, margin: "0 auto", padding: "0 28px" };

function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const PHASES = [
  { name: "Phase 1: Foundation (Days 1–30)", color: ELECTRIC, desc: "Establish baseline, align stakeholders, define success criteria.", milestones: [
    { id: "m1", text: "Current-state assessment complete", owner: "CX Ops", deps: [] },
    { id: "m2", text: "Stakeholder alignment meeting held", owner: "Executive Sponsor", deps: [] },
    { id: "m3", text: "Success metrics and KPIs defined", owner: "CX Ops + Analytics", deps: ["m1"] },
    { id: "m4", text: "Vendor shortlist finalized (if applicable)", owner: "IT + CX", deps: ["m1"] },
    { id: "m5", text: "Budget and resource allocation confirmed", owner: "Finance + Exec", deps: ["m2", "m3"] },
    { id: "m6", text: "Risk register created", owner: "Program Lead", deps: ["m1"] },
  ]},
  { name: "Phase 2: Design & Pilot (Days 31–60)", color: "#7C3AED", desc: "Design target state, build integrations, pilot with controlled group.", milestones: [
    { id: "m7", text: "Target-state architecture documented", owner: "IT / Arch", deps: ["m4"] },
    { id: "m8", text: "Integration requirements scoped", owner: "IT / Arch", deps: ["m7"] },
    { id: "m9", text: "Pilot group selected and briefed", owner: "CX Ops", deps: ["m7"] },
    { id: "m10", text: "Agent training materials developed", owner: "Training + CX", deps: ["m7"] },
    { id: "m11", text: "Pilot launched with monitoring plan", owner: "Program Lead", deps: ["m8", "m9", "m10"] },
    { id: "m12", text: "First pilot checkpoint and adjustments", owner: "Program Lead", deps: ["m11"] },
  ]},
  { name: "Phase 3: Scale & Optimize (Days 61–90)", color: GREEN, desc: "Expand deployment, measure outcomes, establish ongoing governance.", milestones: [
    { id: "m13", text: "Pilot results reviewed and go/no-go decided", owner: "Exec + Program Lead", deps: ["m12"] },
    { id: "m14", text: "Full deployment plan finalized", owner: "Program Lead", deps: ["m13"] },
    { id: "m15", text: "Agent rollout and training complete", owner: "Training + CX Ops", deps: ["m14"] },
    { id: "m16", text: "Production monitoring and QA active", owner: "CX Ops + Analytics", deps: ["m15"] },
    { id: "m17", text: "30-day post-launch review scheduled", owner: "Program Lead", deps: ["m16"] },
    { id: "m18", text: "Governance model and ongoing ownership confirmed", owner: "Exec Sponsor", deps: ["m16", "m17"] },
  ]},
];

const STATUS_OPTIONS = [
  { value: "not-started", label: "Not Started", color: MUTED },
  { value: "in-progress", label: "In Progress", color: ELECTRIC },
  { value: "at-risk", label: "At Risk", color: AMBER },
  { value: "blocked", label: "Blocked", color: RED },
  { value: "complete", label: "Complete", color: GREEN },
];

export default function RoadmapBuilder() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState(""); const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [statuses, setStatuses] = useState({});
  const [notes, setNotes] = useState({});
  const [initiative, setInitiative] = useState("");

  useEffect(() => { window.scrollTo(0, 0); }, [phase]);

  const setStatus = (id, val) => setStatuses(prev => ({ ...prev, [id]: val }));
  const getStatus = (id) => statuses[id] || "not-started";
  const getStatusObj = (id) => STATUS_OPTIONS.find(s => s.value === getStatus(id));

  const allMilestones = PHASES.flatMap(p => p.milestones);
  const completedCount = allMilestones.filter(m => getStatus(m.id) === "complete").length;
  const atRiskCount = allMilestones.filter(m => getStatus(m.id) === "at-risk" || getStatus(m.id) === "blocked").length;

  const handleGate = async () => {
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/xwvaozor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "Transformation Roadmap Builder", _subject: "Roadmap Builder Access" }) }); } catch (e) {}
    setSending(false); setPhase("build");
  };

  const handleSave = async () => {
    const summary = PHASES.map(p => `${p.name}: ${p.milestones.filter(m => getStatus(m.id) === "complete").length}/${p.milestones.length} complete`).join(" | ");
    try { await fetch("https://formspree.io/f/xwvaozor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "Roadmap Builder", initiative, completed: completedCount, atRisk: atRiskCount, total: allMilestones.length, summary, _subject: `Roadmap: ${completedCount}/${allMilestones.length} complete, ${atRiskCount} at risk — ${company || name || email}` }) }); } catch (e) {}
    setPhase("saved");
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
          <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
            <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Planning Tool</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "12px 0 16px" }}>Transformation Roadmap Builder</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 auto 36px", maxWidth: 520 }}>A structured 90-day plan with 18 milestones across three phases — Foundation, Design & Pilot, and Scale & Optimize. Track status, identify dependencies, flag risks, and build the plan you can put in front of leadership.</p>
            <div style={{ maxWidth: 400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Work email *" style={{ padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, outline: "none" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={{ flex: 1, padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none" }} />
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company" style={{ flex: 1, padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none" }} />
              </div>
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "16px", borderRadius: 8, border: "none", background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: sending ? 0.6 : 1, marginTop: 4 }}>{sending ? "Starting..." : "Start Building →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "build" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "40px 28px 80px" }}>
          <div style={WRAP}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: NAVY, margin: "0 0 6px" }}>90-Day Transformation Roadmap</h2>
                <input value={initiative} onChange={e => setInitiative(e.target.value)} placeholder="Name your initiative (e.g., CCaaS Migration, AI Deployment)" style={{ padding: "8px 12px", fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, width: 380, outline: "none" }} />
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {STATUS_OPTIONS.map(s => {
                  const count = allMilestones.filter(m => getStatus(m.id) === s.value).length;
                  return count > 0 ? <span key={s.value} style={{ fontSize: 10, fontWeight: 600, color: s.color, background: `${s.color}12`, padding: "3px 8px", borderRadius: 4 }}>{count} {s.label}</span> : null;
                })}
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: 8, background: BORDER, borderRadius: 4, marginBottom: 32, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${(completedCount / allMilestones.length) * 100}%`, background: GREEN, borderRadius: 4, transition: "width 0.4s ease" }} />
            </div>

            {PHASES.map((p, pi) => {
              const phaseComplete = p.milestones.filter(m => getStatus(m.id) === "complete").length;
              return (
                <div key={pi} style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 4, height: 24, borderRadius: 2, background: p.color }} />
                    <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, fontWeight: 400, color: NAVY, margin: 0 }}>{p.name}</h3>
                    <span style={{ fontSize: 10, color: MUTED }}>{phaseComplete}/{p.milestones.length}</span>
                  </div>
                  <p style={{ fontSize: 12, color: MUTED, marginBottom: 12, paddingLeft: 14 }}>{p.desc}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {p.milestones.map(m => {
                      const st = getStatusObj(m.id);
                      const depsMet = m.deps.every(d => getStatus(d) === "complete");
                      return (
                        <div key={m.id} style={{ background: "#fff", border: `1px solid ${st.color}25`, borderLeft: `3px solid ${st.color}`, borderRadius: "0 8px 8px 0", padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: NAVY, flex: 1, minWidth: 200 }}>{m.text}</span>
                            <span style={{ fontSize: 10, color: MUTED }}>{m.owner}</span>
                            <select value={getStatus(m.id)} onChange={e => setStatus(m.id, e.target.value)} style={{ fontSize: 10, padding: "4px 8px", borderRadius: 4, border: `1px solid ${st.color}40`, background: `${st.color}08`, color: st.color, fontWeight: 600, cursor: "pointer", outline: "none" }}>
                              {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                          </div>
                          {m.deps.length > 0 && !depsMet && getStatus(m.id) !== "complete" && (
                            <div style={{ fontSize: 10, color: AMBER, marginTop: 6 }}>⚠ Depends on: {m.deps.map(d => allMilestones.find(am => am.id === d)?.text?.split(" ").slice(0, 4).join(" ")).join(", ")}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button onClick={handleSave} style={{ padding: "14px 28px", borderRadius: 8, border: "none", background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>Save & Send Roadmap →</button>
            </div>
          </div>
        </section>
      )}

      {phase === "saved" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", padding: "80px 28px" }}>
          <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 32px" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✓</div>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: GREEN, margin: "0 0 12px" }}>Roadmap saved.</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 24 }}>{completedCount}/{allMilestones.length} milestones complete. {atRiskCount > 0 ? `${atRiskCount} at risk or blocked.` : "No items at risk."} Your roadmap status has been sent to your email.</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "13px 24px", borderRadius: 8 }}>Request a Working Session</a>
                <a href="/tools/governance-model" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 14, fontWeight: 500, padding: "13px 24px", borderRadius: 8 }}>Map Governance →</a>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
