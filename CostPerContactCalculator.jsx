import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}
function Input({label,value,onChange,suffix,hint}){return<div><label style={{fontSize:12,fontWeight:600,color:NAVY,display:"block",marginBottom:4}}>{label}</label><div style={{display:"flex",alignItems:"center",gap:4}}><input type="number" value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:"100%",padding:"10px 12px",fontSize:14,border:`1px solid ${BORDER}`,borderRadius:6,background:"#fff",color:NAVY,outline:"none"}} onFocus={e=>e.target.style.borderColor=ELECTRIC} onBlur={e=>e.target.style.borderColor=BORDER}/>{suffix&&<span style={{fontSize:12,color:MUTED,flexShrink:0}}>{suffix}</span>}</div>{hint&&<span style={{fontSize:11,color:MUTED,marginTop:2,display:"block"}}>{hint}</span>}</div>}
const fmt = v => v >= 100 ? `$${v.toFixed(0)}` : `$${v.toFixed(2)}`;

export default function CostPerContactCalculator() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [d, setD] = useState({
    monthlyContacts: 50000, fcrRate: 72, avgContactsToResolve: 1.4,
    agentHourlyRate: 18, ahtMinutes: 6, overheadMultiplier: 1.35,
    platformCostPerAgent: 150, agents: 100,
    voicePct: 60, chatPct: 25, emailPct: 15,
    voiceAHT: 7, chatAHT: 9, emailAHT: 5,
    voiceConcurrency: 1, chatConcurrency: 2.5, emailConcurrency: 1,
  });
  useEffect(() => { window.scrollTo(0, 0); }, [phase]);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const n = v => Number(v) || 0;

  const handleGate = async () => {
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, tool: "Cost per Contact Calculator", _subject: "Cost per Contact Calculator Access" }) }); } catch (e) {}
    setSending(false); setPhase("calc");
  };

  // Blended cost per contact
  const laborPerMinute = n(d.agentHourlyRate) * n(d.overheadMultiplier) / 60;
  const blendedCPC = laborPerMinute * n(d.ahtMinutes);
  const techCostPerContact = (n(d.platformCostPerAgent) * n(d.agents)) / n(d.monthlyContacts);
  const totalCPC = blendedCPC + techCostPerContact;

  // Cost per resolution
  const costPerResolution = totalCPC * n(d.avgContactsToResolve);
  const fcrCPR = totalCPC; // FCR = 1 contact
  const nonFcrContacts = n(d.avgContactsToResolve);
  const nonFcrCPR = totalCPC * nonFcrContacts;

  // FCR impact
  const fcrPct = n(d.fcrRate) / 100;
  const totalIssues = n(d.monthlyContacts) / n(d.avgContactsToResolve);
  const repeatContacts = n(d.monthlyContacts) - totalIssues;
  const repeatCost = repeatContacts * totalCPC;

  // By channel
  const channels = [
    { name: "Voice", pct: n(d.voicePct), aht: n(d.voiceAHT), conc: n(d.voiceConcurrency), color: ELECTRIC },
    { name: "Chat", pct: n(d.chatPct), aht: n(d.chatAHT), conc: n(d.chatConcurrency), color: GREEN },
    { name: "Email", pct: n(d.emailPct), aht: n(d.emailAHT), conc: n(d.emailConcurrency), color: AMBER },
  ].map(ch => {
    const effectiveAHT = ch.aht / ch.conc;
    const cpc = laborPerMinute * effectiveAHT + techCostPerContact;
    const volume = n(d.monthlyContacts) * (ch.pct / 100);
    const monthlySpend = volume * cpc;
    return { ...ch, effectiveAHT, cpc, volume: Math.round(volume), monthlySpend };
  });

  // FCR improvement scenarios
  const fcrScenarios = [5, 10, 15].map(improvement => {
    const newFCR = Math.min(100, n(d.fcrRate) + improvement);
    const newAvgContacts = 1 / (newFCR / 100 + (1 - newFCR / 100) * 0.4); // simplified
    const newMonthlyContacts = totalIssues * newAvgContacts;
    const saved = (n(d.monthlyContacts) - newMonthlyContacts) * totalCPC;
    return { improvement, newFCR, savedMonthly: saved, savedAnnual: saved * 12 };
  });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.cg{grid-template-columns:1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "80px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 520 }}>
            <span style={{ color: AMBER, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Cost + Economics</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>Cost per Contact vs Cost per Resolution</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 32 }}>A $7 call that takes 3 contacts to resolve costs $21. Most teams report the $7 and wonder why the budget grows. This tool separates handle cost from resolution cost and shows the real price of low FCR.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "14px", fontSize: 15, fontWeight: 600, background: email.includes("@") ? AMBER : SLATE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: email.includes("@") ? 1 : 0.5 }}>{sending ? "Loading..." : "Launch Calculator →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "calc" && (<>
        <section style={{ background: WARM, padding: "40px 28px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={WRAP}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 16px" }}>Cost per Contact vs Cost per Resolution</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }} className="cg">
              <Input label="Monthly contacts" value={d.monthlyContacts} onChange={v => set("monthlyContacts", v)} />
              <Input label="FCR rate" value={d.fcrRate} onChange={v => set("fcrRate", v)} suffix="%" hint="First contact resolution" />
              <Input label="Avg contacts to resolve" value={d.avgContactsToResolve} onChange={v => set("avgContactsToResolve", v)} hint="1.0 = perfect FCR" />
              <Input label="Blended AHT" value={d.ahtMinutes} onChange={v => set("ahtMinutes", v)} suffix="min" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 12 }} className="cg">
              <Input label="Agent hourly rate" value={d.agentHourlyRate} onChange={v => set("agentHourlyRate", v)} suffix="$/hr" />
              <Input label="Overhead multiplier" value={d.overheadMultiplier} onChange={v => set("overheadMultiplier", v)} suffix="x" hint="Benefits, facilities (1.3-1.5)" />
              <Input label="Platform cost/agent" value={d.platformCostPerAgent} onChange={v => set("platformCostPerAgent", v)} suffix="$/mo" />
              <Input label="Total agents" value={d.agents} onChange={v => set("agents", v)} />
            </div>
          </div>
        </section>

        <section style={{ background: "#fff", padding: "40px 28px" }}>
          <div style={WRAP}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 28 }} className="cg">
              <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Cost per Contact</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 36, color: ELECTRIC }}>{fmt(totalCPC)}</div>
                <div style={{ fontSize: 11, color: MUTED }}>Labor + tech per interaction</div>
              </div>
              <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: RED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Cost per Resolution</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 36, color: "#fff" }}>{fmt(costPerResolution)}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{n(d.avgContactsToResolve).toFixed(1)}x contacts per issue</div>
              </div>
              <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Repeat Contacts/mo</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 36, color: AMBER }}>{Math.round(repeatContacts).toLocaleString()}</div>
                <div style={{ fontSize: 11, color: MUTED }}>Contacts that should not exist</div>
              </div>
              <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Monthly Repeat Cost</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: RED }}>${(repeatCost / 1000).toFixed(0)}K</div>
                <div style={{ fontSize: 11, color: MUTED }}>${(repeatCost * 12 / 1000000).toFixed(2)}M annually</div>
              </div>
            </div>

            {/* By channel */}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Cost by Channel</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }} className="cg">
              {channels.map((ch, i) => (
                <div key={i} style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: ch.color }}>{ch.name}</span>
                    <span style={{ fontSize: 11, color: MUTED }}>{ch.pct}% of volume</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div><div style={{ fontSize: 10, color: MUTED }}>AHT</div><div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{ch.aht}m</div></div>
                    <div><div style={{ fontSize: 10, color: MUTED }}>Effective AHT</div><div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{ch.effectiveAHT.toFixed(1)}m</div></div>
                    <div><div style={{ fontSize: 10, color: MUTED }}>Cost/contact</div><div style={{ fontSize: 14, fontWeight: 600, color: ch.color }}>{fmt(ch.cpc)}</div></div>
                    <div><div style={{ fontSize: 10, color: MUTED }}>Monthly spend</div><div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>${(ch.monthlySpend / 1000).toFixed(0)}K</div></div>
                  </div>
                </div>
              ))}
            </div>

            {/* FCR improvement scenarios */}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>The FCR Dividend: What Better Resolution Saves</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }} className="cg">
              {fcrScenarios.map((s, i) => (
                <div key={i} style={{ background: `${GREEN}08`, border: `1px solid ${GREEN}30`, borderRadius: 10, padding: "16px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>FCR +{s.improvement}pts → {s.newFCR}%</div>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, color: GREEN }}>${(s.savedAnnual / 1000).toFixed(0)}K/yr</div>
                  <div style={{ fontSize: 11, color: MUTED }}>${(s.savedMonthly / 1000).toFixed(0)}K/month saved</div>
                </div>
              ))}
            </div>

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>
                <strong style={{ color: "#fff" }}>Why this distinction matters:</strong> Most contact centers report cost per contact and treat it as cost per resolution. They are not the same number. A center with a $7 cost per contact and 72% FCR has a real cost per resolution of $9.80. Every point of FCR improvement reduces total contact volume, which reduces staffing, overtime, and platform usage. FCR improvement is the single highest-ROI operational lever available because it attacks cost, customer effort, and agent workload simultaneously.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/tools/attrition-cost" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Attrition Cost Calculator →</a>
              <a href="/tco-calculator" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>TCO Calculator →</a>
              <a href="/how-to-choose" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Explore More Tools</a>
            </div>
          </div>
        </section>
      </>)}
    </div>
  );
}
