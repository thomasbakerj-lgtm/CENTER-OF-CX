import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}
function Input({label,value,onChange,suffix,hint}){return<div><label style={{fontSize:12,fontWeight:600,color:NAVY,display:"block",marginBottom:4}}>{label}</label><div style={{display:"flex",alignItems:"center",gap:4}}><input type="number" value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:"100%",padding:"10px 12px",fontSize:14,border:`1px solid ${BORDER}`,borderRadius:6,background:"#fff",color:NAVY,outline:"none"}} onFocus={e=>e.target.style.borderColor=ELECTRIC} onBlur={e=>e.target.style.borderColor=BORDER}/>{suffix&&<span style={{fontSize:12,color:MUTED,flexShrink:0}}>{suffix}</span>}</div>{hint&&<span style={{fontSize:11,color:MUTED,marginTop:2,display:"block"}}>{hint}</span>}</div>}

export default function ScheduleAdherenceCalculator() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [d, setD] = useState({ agents: 100, currentAdherence: 92, callsPerHour: 200, aht: 360, slaTarget: 80, slaTime: 20, hourlyRate: 18, otMultiplier: 1.5 });
  useEffect(() => { window.scrollTo(0, 0); }, [phase]);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const n = (v) => Number(v) || 0;

  const handleGate = async () => {
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, tool: "Schedule Adherence Calculator", _subject: "Schedule Adherence Access" }) }); } catch (e) {}
    setSending(false); setPhase("calc");
  };

  // Model: each point of adherence loss = fewer effective agents on queue
  const intensity = (n(d.callsPerHour) * n(d.aht)) / 3600;
  const drops = [0, 1, 2, 3, 4, 5, 7, 10];
  
  // Simple Erlang C approximation
  function erlC(agents, A) {
    if (agents <= A || agents <= 0) return 1;
    const N = Math.floor(agents);
    let aN = 1; for (let i = 0; i < N; i++) aN = aN * A / (i + 1);
    const rho = A / N;
    let sum = 0; let term = 1;
    for (let k = 0; k < N; k++) { if (k > 0) term = term * A / k; sum += term; }
    return Math.max(0, Math.min(1, aN / (sum + aN / (1 - rho))));
  }
  function calcSL(agents, A, targetSec, ahtSec) {
    const pW = erlC(agents, A);
    const N = Math.floor(agents);
    if (N <= A) return 0;
    return Math.max(0, Math.min(1, 1 - pW * Math.exp(-(N - A) * targetSec / ahtSec)));
  }
  function calcASA(agents, A, ahtSec) {
    const pW = erlC(agents, A);
    const N = Math.floor(agents);
    if (N <= A) return 999;
    return (pW * ahtSec) / (N - A);
  }

  const scenarios = drops.map(drop => {
    const adhPct = n(d.currentAdherence) - drop;
    const effectiveAgents = Math.round(n(d.agents) * (adhPct / 100));
    const sl = calcSL(effectiveAgents, intensity, n(d.slaTime), n(d.aht)) * 100;
    const asaVal = calcASA(effectiveAgents, intensity, n(d.aht));
    const occ = effectiveAgents > 0 ? (intensity / effectiveAgents) * 100 : 100;
    
    // Abandonment estimate: rough model based on ASA
    const abandonPct = asaVal > 120 ? 15 : asaVal > 60 ? 8 : asaVal > 30 ? 4 : asaVal > 15 ? 2 : 1;
    
    // OT cost: agents lost * hours to cover * OT rate
    const agentsLost = n(d.agents) - effectiveAgents;
    const dailyOTHours = agentsLost * 8; // full shift equivalent
    const dailyOTCost = dailyOTHours * n(d.hourlyRate) * n(d.otMultiplier);
    const annualOTCost = dailyOTCost * 250;

    return { drop, adhPct, effectiveAgents, sl, asaVal, occ, abandonPct, agentsLost, annualOTCost };
  });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.ag{grid-template-columns:1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "80px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 520 }}>
            <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>WFM Tool</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>Schedule Adherence Impact Calculator</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 32 }}>See exactly how 2-5 points of adherence loss cascades into ASA degradation, SLA misses, higher abandonment, and overtime cost.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "14px", fontSize: 15, fontWeight: 600, background: email.includes("@") ? ELECTRIC : SLATE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: email.includes("@") ? 1 : 0.5 }}>{sending ? "Loading..." : "Launch Calculator →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "calc" && (
        <>
          <section style={{ background: WARM, padding: "40px 28px", borderBottom: `1px solid ${BORDER}` }}>
            <div style={WRAP}>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 16px" }}>Schedule Adherence Impact Calculator</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }} className="ag">
                <Input label="Agents scheduled" value={d.agents} onChange={v => set("agents", v)} />
                <Input label="Current adherence" value={d.currentAdherence} onChange={v => set("currentAdherence", v)} suffix="%" />
                <Input label="Calls per hour" value={d.callsPerHour} onChange={v => set("callsPerHour", v)} />
                <Input label="AHT" value={d.aht} onChange={v => set("aht", v)} suffix="sec" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 12 }} className="ag">
                <Input label="SLA target" value={d.slaTarget} onChange={v => set("slaTarget", v)} suffix="%" />
                <Input label="SLA time" value={d.slaTime} onChange={v => set("slaTime", v)} suffix="sec" />
                <Input label="Hourly rate" value={d.hourlyRate} onChange={v => set("hourlyRate", v)} suffix="$/hr" />
                <Input label="OT multiplier" value={d.otMultiplier} onChange={v => set("otMultiplier", v)} suffix="x" />
              </div>
            </div>
          </section>

          <section style={{ background: "#fff", padding: "40px 28px" }}>
            <div style={WRAP}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Adherence Cascade: What Each Point Costs You</h3>
              <div style={{ overflowX: "auto", marginBottom: 24 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: DEEP, color: "#fff" }}>
                      {["Adherence", "Drop", "Effective Agents", "Service Level", "ASA", "Est. Abandon", "Annual OT Cost"].map(h => (
                        <th key={h} style={{ padding: "10px 12px", textAlign: "right", fontSize: 11, fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map((s, i) => {
                      const slColor = s.sl >= n(d.slaTarget) ? GREEN : s.sl >= n(d.slaTarget) - 5 ? AMBER : RED;
                      return (
                        <tr key={i} style={{ background: i === 0 ? `${GREEN}10` : i % 2 === 0 ? "#fff" : WARM, borderBottom: `1px solid ${BORDER}`, fontWeight: i === 0 ? 600 : 400 }}>
                          <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 16, color: i === 0 ? GREEN : NAVY }}>{s.adhPct}%</td>
                          <td style={{ padding: "10px 12px", textAlign: "right", color: i === 0 ? GREEN : RED }}>{i === 0 ? "Baseline" : `-${s.drop} pts`}</td>
                          <td style={{ padding: "10px 12px", textAlign: "right", color: NAVY }}>{s.effectiveAgents}</td>
                          <td style={{ padding: "10px 12px", textAlign: "right", color: slColor, fontWeight: 600 }}>{s.sl.toFixed(1)}%</td>
                          <td style={{ padding: "10px 12px", textAlign: "right", color: SLATE }}>{s.asaVal < 999 ? s.asaVal.toFixed(0) + "s" : "N/A"}</td>
                          <td style={{ padding: "10px 12px", textAlign: "right", color: s.abandonPct > 5 ? RED : SLATE }}>{s.abandonPct}%</td>
                          <td style={{ padding: "10px 12px", textAlign: "right", color: s.annualOTCost > 500000 ? RED : NAVY, fontWeight: 500 }}>${(s.annualOTCost / 1000).toFixed(0)}K</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>
                  <strong style={{ color: "#fff" }}>Why this matters:</strong> Schedule adherence is the multiplier on every other WFM metric. A 3-point adherence drop during peak does not cost 3% more. It costs disproportionately more because the relationship between staffing and service level is non-linear. Best-in-class operations target 92-95% adherence. Below 88%, the cascade into SLA misses, overtime, and agent burnout becomes self-reinforcing.
                </p>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href="/tools/staffing-calculator" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Staffing Calculator →</a>
                <a href="/tools/occupancy-risk" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Occupancy Risk →</a>
                <a href="/tools/forecast-accuracy" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Forecast Accuracy →</a>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
