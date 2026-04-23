import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}
function Input({label,value,onChange,suffix,hint}){return<div><label style={{fontSize:12,fontWeight:600,color:NAVY,display:"block",marginBottom:4}}>{label}</label><div style={{display:"flex",alignItems:"center",gap:4}}><input type="number" value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:"100%",padding:"10px 12px",fontSize:14,border:`1px solid ${BORDER}`,borderRadius:6,background:"#fff",color:NAVY,outline:"none"}} onFocus={e=>e.target.style.borderColor=ELECTRIC} onBlur={e=>e.target.style.borderColor=BORDER}/>{suffix&&<span style={{fontSize:12,color:MUTED,flexShrink:0}}>{suffix}</span>}</div>{hint&&<span style={{fontSize:11,color:MUTED,marginTop:2,display:"block"}}>{hint}</span>}</div>}

export default function ShrinkagePlanner() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState(""); const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [d, setD] = useState({ agents: 200, hourlyRate: 18, breaks: 8, coaching: 3, training: 4, meetings: 2, systemDown: 1, pto: 8, absenteeism: 5, lateAdherence: 2 });
  useEffect(() => { window.scrollTo(0, 0); }, [phase]);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const n = (v) => Number(v) || 0;

  const handleGate = async () => {
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "Shrinkage Planner", _subject: "Shrinkage Planner Access" }) }); } catch (e) {}
    setSending(false); setPhase("calc");
  };

  const planned = [
    { name: "Breaks", pct: n(d.breaks), type: "planned" },
    { name: "Coaching / 1:1s", pct: n(d.coaching), type: "planned" },
    { name: "Training", pct: n(d.training), type: "planned" },
    { name: "Team meetings", pct: n(d.meetings), type: "planned" },
  ];
  const unplanned = [
    { name: "System downtime", pct: n(d.systemDown), type: "unplanned" },
    { name: "PTO / vacation", pct: n(d.pto), type: "unplanned" },
    { name: "Absenteeism", pct: n(d.absenteeism), type: "unplanned" },
    { name: "Late / adherence", pct: n(d.lateAdherence), type: "unplanned" },
  ];
  const all = [...planned, ...unplanned];
  const totalPlanned = planned.reduce((a, c) => a + c.pct, 0);
  const totalUnplanned = unplanned.reduce((a, c) => a + c.pct, 0);
  const totalShrinkage = totalPlanned + totalUnplanned;
  const availablePct = 100 - totalShrinkage;
  const effectiveAgents = Math.round(n(d.agents) * (availablePct / 100));
  const gap = n(d.agents) - effectiveAgents;
  const annualCost = gap * n(d.hourlyRate) * 2080;
  const shrinkColor = totalShrinkage > 35 ? RED : totalShrinkage > 28 ? AMBER : GREEN;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.sg{grid-template-columns:1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "80px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 520 }}>
            <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>WFM Tool</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>Shrinkage Planner</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 32 }}>Model planned vs unplanned shrinkage and see the staffing gap it creates. Quantify the annual cost of every shrinkage category.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "14px", fontSize: 15, fontWeight: 600, background: email.includes("@") ? ELECTRIC : SLATE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: email.includes("@") ? 1 : 0.5 }}>{sending ? "Loading..." : "Launch Planner →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "calc" && (
        <>
          <section style={{ background: WARM, padding: "40px 28px", borderBottom: `1px solid ${BORDER}` }}>
            <div style={WRAP}>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>Shrinkage Planner</h2>
              <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>Adjust each shrinkage category. Results update in real time.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="sg">
                <div>
                  <h3 style={{ fontSize: 12, fontWeight: 700, color: GREEN, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Planned Shrinkage</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Input label="Breaks" value={d.breaks} onChange={v => set("breaks", v)} suffix="%" />
                    <Input label="Coaching / 1:1s" value={d.coaching} onChange={v => set("coaching", v)} suffix="%" />
                    <Input label="Training" value={d.training} onChange={v => set("training", v)} suffix="%" />
                    <Input label="Team meetings" value={d.meetings} onChange={v => set("meetings", v)} suffix="%" />
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: 12, fontWeight: 700, color: RED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Unplanned Shrinkage</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Input label="System downtime" value={d.systemDown} onChange={v => set("systemDown", v)} suffix="%" />
                    <Input label="PTO / vacation" value={d.pto} onChange={v => set("pto", v)} suffix="%" />
                    <Input label="Absenteeism" value={d.absenteeism} onChange={v => set("absenteeism", v)} suffix="%" />
                    <Input label="Late / adherence" value={d.lateAdherence} onChange={v => set("lateAdherence", v)} suffix="%" />
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }} className="sg">
                <Input label="Total roster agents" value={d.agents} onChange={v => set("agents", v)} />
                <Input label="Avg hourly rate" value={d.hourlyRate} onChange={v => set("hourlyRate", v)} suffix="$/hr" />
              </div>
            </div>
          </section>

          <section style={{ background: "#fff", padding: "40px 28px" }}>
            <div style={WRAP}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 28 }} className="sg">
                <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Total Shrinkage</div>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 36, color: shrinkColor }}>{totalShrinkage.toFixed(1)}%</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{totalShrinkage > 35 ? "Above industry norm" : totalShrinkage > 28 ? "Within range" : "Well managed"}</div>
                </div>
                <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Effective Agents</div>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 36, color: ELECTRIC }}>{effectiveAgents}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>Of {d.agents} on roster</div>
                </div>
                <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Staffing Gap</div>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 36, color: RED }}>{gap}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>Agents lost to shrinkage</div>
                </div>
                <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Annual Cost of Gap</div>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: "#fff" }}>${(annualCost / 1000000).toFixed(2)}M</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Labor value of lost capacity</div>
                </div>
              </div>

              {/* Visual breakdown */}
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Shrinkage Breakdown</h3>
                <div style={{ display: "flex", height: 32, borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
                  {all.map((item, i) => item.pct > 0 && (
                    <div key={i} style={{ width: `${item.pct}%`, background: item.type === "planned" ? GREEN : RED, opacity: 0.6 + (i * 0.05), display: "flex", alignItems: "center", justifyContent: "center", transition: "width 0.3s" }}>
                      {item.pct >= 3 && <span style={{ fontSize: 9, color: "#fff", fontWeight: 600 }}>{item.name}</span>}
                    </div>
                  ))}
                  <div style={{ flex: 1, background: ELECTRIC, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 9, color: "#fff", fontWeight: 600 }}>Available ({availablePct.toFixed(0)}%)</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 11, color: MUTED }}>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: GREEN, marginRight: 4, verticalAlign: "middle" }} />Planned: {totalPlanned.toFixed(1)}%</span>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: RED, marginRight: 4, verticalAlign: "middle" }} />Unplanned: {totalUnplanned.toFixed(1)}%</span>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: ELECTRIC, marginRight: 4, verticalAlign: "middle" }} />Available: {availablePct.toFixed(1)}%</span>
                </div>
              </div>

              <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>
                  <strong style={{ color: "#fff" }}>Industry benchmark:</strong> Total shrinkage typically runs 28-35% across most contact center verticals. Planned shrinkage (breaks, training, coaching) is investment in your team. Unplanned shrinkage (absenteeism, late arrivals) is where the controllable cost lives. Reducing unplanned shrinkage by 3-5 points is often the highest-ROI workforce initiative available.
                </p>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href="/tools/staffing-calculator" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Staffing Calculator →</a>
                <a href="/how-to-choose" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Explore More Tools</a>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
