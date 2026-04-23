import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const COMPONENTS = [
  { id: "talk", name: "Talk Time", color: ELECTRIC, icon: "🗣", desc: "Active conversation between agent and customer", benchmark: "55-65% of AHT", reducible: "Low. This is the core work. Reduce only through better knowledge access and agent skill." },
  { id: "hold", name: "Hold Time", color: AMBER, icon: "⏸", desc: "Customer waiting while agent searches, consults, or processes", benchmark: "10-18% of AHT", reducible: "High. Usually caused by system friction, missing knowledge, or authorization delays." },
  { id: "wrap", name: "After-Call Work", color: "#7C3AED", icon: "📝", desc: "Disposition, notes, case updates, follow-up tasks after the call ends", benchmark: "12-20% of AHT", reducible: "High. AI summarization, auto-disposition, and structured templates cut this significantly." },
  { id: "transfer", name: "Transfer / Conference", color: RED, icon: "↗️", desc: "Time spent initiating, waiting for, and executing warm or cold transfers", benchmark: "3-8% of AHT", reducible: "Medium. Better routing and agent skilling reduces transfer need. Warm transfers take longer but improve CX." },
  { id: "search", name: "Knowledge Search", color: "#0EA5E9", icon: "🔍", desc: "Agent searching knowledge base, SOPs, or asking a peer during the interaction", benchmark: "5-12% of AHT", reducible: "Very high. Real-time agent assist and better knowledge architecture cut this dramatically." },
  { id: "admin", name: "System / Admin", color: "#6B7280", icon: "💻", desc: "Navigating between applications, copying data, system latency, compliance steps", benchmark: "5-10% of AHT", reducible: "High. Desktop unification, RPA, and API integration between systems." },
];

function Slider({ component, value, onChange }) {
  return (
    <div style={{ padding: "14px 16px", background: WARM, borderRadius: 8, border: `1px solid ${BORDER}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>{component.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{component.name}</span>
        </div>
        <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: component.color, fontWeight: 400 }}>{value}s</span>
      </div>
      <input type="range" min={0} max={300} value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: component.color, height: 6, cursor: "pointer" }} />
      <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{component.desc}</div>
    </div>
  );
}

export default function AHTDecomposition() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState(""); const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [values, setValues] = useState({ talk: 210, hold: 55, wrap: 60, transfer: 15, search: 30, admin: 25 });
  const [contactType, setContactType] = useState("blended");
  useEffect(() => { window.scrollTo(0, 0); }, [phase]);

  const PRESETS = {
    blended: { talk: 210, hold: 55, wrap: 60, transfer: 15, search: 30, admin: 25 },
    billing: { talk: 180, hold: 70, wrap: 45, transfer: 20, search: 25, admin: 20 },
    techSupport: { talk: 240, hold: 80, wrap: 50, transfer: 30, search: 45, admin: 35 },
    sales: { talk: 280, hold: 30, wrap: 70, transfer: 10, search: 15, admin: 20 },
    simple: { talk: 120, hold: 20, wrap: 30, transfer: 5, search: 10, admin: 15 },
  };

  const applyPreset = (key) => { setContactType(key); setValues(PRESETS[key]); };
  const set = (id, val) => setValues(prev => ({ ...prev, [id]: val }));

  const handleGate = async () => {
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "AHT Decomposition", _subject: "AHT Decomposition Tool Access" }) }); } catch (e) {}
    setSending(false); setPhase("calc");
  };

  const totalAHT = Object.values(values).reduce((a, b) => a + b, 0);
  const talkPct = totalAHT > 0 ? (values.talk / totalAHT) * 100 : 0;
  const nonTalkPct = 100 - talkPct;
  const reducibleTime = values.hold + values.wrap + values.search + values.admin;
  const reduciblePct = totalAHT > 0 ? (reducibleTime / totalAHT) * 100 : 0;

  // Optimization scenarios
  const scenarios = [
    { name: "AI Summarization", targets: { wrap: 0.5 }, desc: "Auto-generate call summaries and disposition", investment: "Agent assist platform" },
    { name: "Knowledge AI", targets: { search: 0.4, hold: 0.15 }, desc: "Real-time knowledge surfacing reduces search and hold", investment: "Knowledge AI + RAG" },
    { name: "Desktop Unification", targets: { admin: 0.5, hold: 0.1 }, desc: "Single pane of glass eliminates app-switching", investment: "Agent desktop consolidation" },
    { name: "Better Routing", targets: { transfer: 0.5, talk: 0.05 }, desc: "Right agent first time reduces transfers and talk time", investment: "Intent-driven routing" },
  ].map(s => {
    let newTotal = totalAHT;
    Object.entries(s.targets).forEach(([k, reduction]) => { newTotal -= values[k] * reduction; });
    const saved = totalAHT - newTotal;
    return { ...s, newAHT: Math.round(newTotal), savedSec: Math.round(saved), savedPct: ((saved / totalAHT) * 100).toFixed(1) };
  });

  // All optimizations combined
  const combinedSaved = scenarios.reduce((a, s) => a + s.savedSec, 0);
  const combinedNew = Math.max(values.talk * 0.9, totalAHT - combinedSaved); // floor at ~90% talk time

  const fmtTime = (s) => s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.pg{grid-template-columns:1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "80px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 520 }}>
            <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Performance + Quality</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>AHT Decomposition Tool</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 32 }}>Stop trying to reduce AHT generically. Break it into six components, identify where time actually goes, and target the segments that are reducible without hurting quality.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="text" placeholder="Company (optional)" value={company} onChange={e => setCompany(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "14px", fontSize: 15, fontWeight: 600, background: email.includes("@") ? ELECTRIC : SLATE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: email.includes("@") ? 1 : 0.5 }}>{sending ? "Loading..." : "Launch Tool →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "calc" && (<>
        <section style={{ background: WARM, padding: "40px 28px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={WRAP}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: 0 }}>AHT Decomposition</h2>
                <p style={{ fontSize: 13, color: MUTED, margin: "4px 0 0" }}>Adjust each component. See where time goes and what is reducible.</p>
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {[["blended","Blended"],["billing","Billing"],["techSupport","Tech Support"],["sales","Sales"],["simple","Simple"]].map(([k,l]) => (
                  <button key={k} onClick={() => applyPreset(k)} style={{ padding: "6px 12px", fontSize: 11, fontWeight: 600, borderRadius: 4, border: `1px solid ${contactType === k ? ELECTRIC : BORDER}`, background: contactType === k ? ELECTRIC : "#fff", color: contactType === k ? "#fff" : MUTED, cursor: "pointer" }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="pg">
              {COMPONENTS.map(c => <Slider key={c.id} component={c} value={values[c.id]} onChange={v => set(c.id, v)} />)}
            </div>
          </div>
        </section>

        <section style={{ background: "#fff", padding: "40px 28px" }}>
          <div style={WRAP}>
            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 28 }} className="pg">
              <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Total AHT</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: "#fff" }}>{fmtTime(totalAHT)}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{(totalAHT / 60).toFixed(1)} minutes</div>
              </div>
              <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Actual Talk</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: ELECTRIC }}>{talkPct.toFixed(0)}%</div>
                <div style={{ fontSize: 11, color: MUTED }}>{fmtTime(values.talk)} of conversation</div>
              </div>
              <div style={{ background: WARM, border: `1px solid ${nonTalkPct > 45 ? RED : nonTalkPct > 38 ? AMBER : GREEN}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Non-Talk Time</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: nonTalkPct > 45 ? RED : nonTalkPct > 38 ? AMBER : GREEN }}>{nonTalkPct.toFixed(0)}%</div>
                <div style={{ fontSize: 11, color: MUTED }}>{nonTalkPct > 45 ? "Significant friction" : nonTalkPct > 38 ? "Room for improvement" : "Well optimized"}</div>
              </div>
              <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Reducible Time</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: AMBER }}>{fmtTime(reducibleTime)}</div>
                <div style={{ fontSize: 11, color: MUTED }}>{reduciblePct.toFixed(0)}% of total AHT</div>
              </div>
            </div>

            {/* Visual decomposition bar */}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 8 }}>Time Composition</h3>
            <div style={{ display: "flex", height: 44, borderRadius: 8, overflow: "hidden", marginBottom: 6 }}>
              {COMPONENTS.map(c => {
                const pct = totalAHT > 0 ? (values[c.id] / totalAHT) * 100 : 0;
                return pct > 0 && (
                  <div key={c.id} style={{ width: `${pct}%`, background: c.color, display: "flex", alignItems: "center", justifyContent: "center", transition: "width 0.3s", minWidth: pct > 5 ? 0 : 0 }}>
                    {pct >= 8 && <span style={{ fontSize: 10, color: "#fff", fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>{c.icon} {pct.toFixed(0)}%</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
              {COMPONENTS.map(c => (
                <span key={c.id} style={{ fontSize: 11, color: MUTED, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: c.color, flexShrink: 0 }} />{c.name}: {fmtTime(values[c.id])}
                </span>
              ))}
            </div>

            {/* Component deep-dive */}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Component Analysis</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 28 }}>
              {COMPONENTS.map((c, i) => {
                const pct = totalAHT > 0 ? (values[c.id] / totalAHT) * 100 : 0;
                return (
                  <div key={c.id} style={{ display: "grid", gridTemplateColumns: "140px 60px 1fr 140px", gap: 12, alignItems: "center", padding: "10px 14px", background: i % 2 === 0 ? WARM : "#fff", borderRadius: 6, borderLeft: `3px solid ${c.color}` }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{c.icon} {c.name}</span>
                    <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: c.color }}>{pct.toFixed(0)}%</span>
                    <div>
                      <div style={{ fontSize: 11, color: MUTED }}>Benchmark: {c.benchmark}</div>
                    </div>
                    <div style={{ fontSize: 11, color: c.reducible.startsWith("Very high") || c.reducible.startsWith("High") ? GREEN : c.reducible.startsWith("Medium") ? AMBER : MUTED, fontWeight: 600 }}>
                      {c.reducible.split(".")[0]}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Optimization scenarios */}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Targeted Optimization Scenarios</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }} className="pg">
              {scenarios.map((s, i) => (
                <div key={i} style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{s.name}</span>
                    <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: GREEN }}>-{s.savedSec}s</span>
                  </div>
                  <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, margin: "0 0 6px" }}>{s.desc}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <span style={{ color: MUTED }}>New AHT: {fmtTime(s.newAHT)}</span>
                    <span style={{ color: GREEN, fontWeight: 600 }}>-{s.savedPct}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Combined impact */}
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>If you implemented all four</div>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: "#fff" }}>{fmtTime(totalAHT)} → {fmtTime(Math.round(combinedNew))}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: GREEN }}>-{((1 - combinedNew / totalAHT) * 100).toFixed(0)}%</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>AHT reduction without cutting talk time</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, margin: "16px 0 0" }}>
                The goal is not shorter calls. The goal is less time spent on activities that are not conversation. Hold, search, admin, and wrap are where AHT reduction lives. Talk time is where resolution quality lives. Protect the latter while attacking the former.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/tools/staffing-calculator" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Staffing Calculator →</a>
              <a href="/tools/cost-per-contact" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Cost per Contact →</a>
              <a href="/how-to-choose" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Explore More Tools</a>
            </div>
          </div>
        </section>
      </>)}
    </div>
  );
}
