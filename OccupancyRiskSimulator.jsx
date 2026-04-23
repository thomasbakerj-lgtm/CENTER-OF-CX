import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}
function Input({label,value,onChange,suffix,hint}){return<div><label style={{fontSize:12,fontWeight:600,color:NAVY,display:"block",marginBottom:4}}>{label}</label><div style={{display:"flex",alignItems:"center",gap:4}}><input type="number" value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:"100%",padding:"10px 12px",fontSize:14,border:`1px solid ${BORDER}`,borderRadius:6,background:"#fff",color:NAVY,outline:"none"}} onFocus={e=>e.target.style.borderColor=ELECTRIC} onBlur={e=>e.target.style.borderColor=BORDER}/>{suffix&&<span style={{fontSize:12,color:MUTED,flexShrink:0}}>{suffix}</span>}</div>{hint&&<span style={{fontSize:11,color:MUTED,marginTop:2,display:"block"}}>{hint}</span>}</div>}

export default function OccupancyRiskSimulator() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [d, setD] = useState({ agents: 50, callsPerHour: 120, aht: 360, attritionRate: 35, avgTenure: 14, hiringCost: 6500, trainingWeeks: 6, hourlyRate: 18 });
  useEffect(() => { window.scrollTo(0, 0); }, [phase]);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const n = (v) => Number(v) || 0;

  const handleGate = async () => {
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, tool: "Occupancy Risk Simulator", _subject: "Occupancy Risk Simulator Access" }) }); } catch (e) {}
    setSending(false); setPhase("calc");
  };

  const intensity = (n(d.callsPerHour) * n(d.aht)) / 3600;
  const levels = [];
  for (let occ = 70; occ <= 98; occ += 2) {
    const agentsNeeded = Math.ceil(intensity / (occ / 100));
    const idleTime = ((1 - occ / 100) * 60).toFixed(1);
    const burnoutRisk = occ > 92 ? "Critical" : occ > 88 ? "High" : occ > 85 ? "Elevated" : occ > 80 ? "Moderate" : "Low";
    const attritionImpact = occ > 90 ? n(d.attritionRate) * 1.4 : occ > 85 ? n(d.attritionRate) * 1.15 : n(d.attritionRate);
    const annualTurnoverCost = Math.round((attritionImpact / 100) * agentsNeeded * n(d.hiringCost));
    const color = occ > 92 ? RED : occ > 88 ? "#DC6B00" : occ > 85 ? AMBER : occ > 80 ? "#7CB342" : GREEN;
    levels.push({ occ, agentsNeeded, idleTime, burnoutRisk, attritionImpact: attritionImpact.toFixed(0), annualTurnoverCost, color });
  }

  const currentOcc = n(d.agents) > 0 ? (intensity / n(d.agents)) * 100 : 0;
  const currentColor = currentOcc > 92 ? RED : currentOcc > 88 ? "#DC6B00" : currentOcc > 85 ? AMBER : currentOcc > 80 ? "#7CB342" : GREEN;
  const currentRisk = currentOcc > 92 ? "Critical. Agents have less than 5 minutes of idle time per hour. Burnout, errors, and attrition accelerate." : currentOcc > 88 ? "High. Agents are consistently overloaded. Expect quality to degrade and sick days to increase." : currentOcc > 85 ? "Elevated. Sustainable short-term but not as a steady state. Monitor closely." : currentOcc > 80 ? "Moderate. Agents have reasonable breathing room between calls." : "Healthy. Enough idle time for after-call work, knowledge review, and mental reset.";

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.og{grid-template-columns:1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "80px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 520 }}>
            <span style={{ color: RED, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>WFM Tool</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>Occupancy Risk Simulator</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 32 }}>See when "efficiency" becomes burnout. Model how occupancy levels affect agent idle time, attrition risk, and the hidden cost of pushing utilization too high.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "14px", fontSize: 15, fontWeight: 600, background: email.includes("@") ? RED : SLATE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: email.includes("@") ? 1 : 0.5 }}>{sending ? "Loading..." : "Launch Simulator →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "calc" && (
        <>
          <section style={{ background: WARM, padding: "40px 28px", borderBottom: `1px solid ${BORDER}` }}>
            <div style={WRAP}>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 16px" }}>Occupancy Risk Simulator</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }} className="og">
                <Input label="Agents on queue" value={d.agents} onChange={v => set("agents", v)} />
                <Input label="Calls per hour" value={d.callsPerHour} onChange={v => set("callsPerHour", v)} />
                <Input label="AHT" value={d.aht} onChange={v => set("aht", v)} suffix="sec" />
                <Input label="Current attrition" value={d.attritionRate} onChange={v => set("attritionRate", v)} suffix="%" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 12 }} className="og">
                <Input label="Hiring cost per agent" value={d.hiringCost} onChange={v => set("hiringCost", v)} suffix="$" />
                <Input label="Training ramp" value={d.trainingWeeks} onChange={v => set("trainingWeeks", v)} suffix="weeks" />
                <Input label="Hourly rate" value={d.hourlyRate} onChange={v => set("hourlyRate", v)} suffix="$/hr" />
                <Input label="Avg tenure" value={d.avgTenure} onChange={v => set("avgTenure", v)} suffix="months" />
              </div>
            </div>
          </section>

          <section style={{ background: "#fff", padding: "40px 28px" }}>
            <div style={WRAP}>
              {/* Current state */}
              <div style={{ background: `${currentColor}10`, border: `2px solid ${currentColor}`, borderRadius: 12, padding: "24px 28px", marginBottom: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: currentColor, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Your Current Occupancy</div>
                    <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 42, color: currentColor }}>{currentOcc.toFixed(1)}%</div>
                  </div>
                  <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.6, maxWidth: 400, margin: 0 }}>{currentRisk}</p>
                </div>
              </div>

              {/* Occupancy ladder */}
              <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Occupancy Ladder: What Each Level Actually Means</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 28 }}>
                {levels.map((l, i) => {
                  const isCurrent = Math.abs(l.occ - currentOcc) < 2;
                  return (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 80px 80px 80px 100px 1fr", gap: 8, alignItems: "center", padding: "8px 12px", background: isCurrent ? `${l.color}10` : i % 2 === 0 ? WARM : "#fff", borderRadius: 6, border: isCurrent ? `2px solid ${l.color}` : `1px solid transparent`, fontSize: 12 }} className="og">
                      <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: l.color, fontWeight: 400 }}>{l.occ}%</span>
                      <span style={{ color: MUTED }}>{l.agentsNeeded} agents</span>
                      <span style={{ color: MUTED }}>{l.idleTime} min/hr</span>
                      <span style={{ color: l.color, fontWeight: 600 }}>{l.burnoutRisk}</span>
                      <span style={{ color: SLATE }}>{l.attritionImpact}% attrition</span>
                      <span style={{ color: NAVY, fontWeight: 500 }}>${(l.annualTurnoverCost / 1000).toFixed(0)}K/yr turnover</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>
                  <strong style={{ color: "#fff" }}>The hidden math:</strong> Pushing occupancy from 85% to 92% saves staffing in the short term. But research consistently shows that sustained occupancy above 88% drives attrition up by 15-40%. The cost of replacing an agent ($5,000-$12,000 in hiring, training, and ramp time) often exceeds the staffing savings within 6 months. The most efficient occupancy target for sustained operations is 82-86%.
                </p>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href="/tools/staffing-calculator" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Staffing Calculator →</a>
                <a href="/tools/shrinkage-planner" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Shrinkage Planner →</a>
                <a href="/human-premium" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>The Human Premium →</a>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
