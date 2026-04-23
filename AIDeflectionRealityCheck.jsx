import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}
function Input({label,value,onChange,suffix,hint}){return<div><label style={{fontSize:12,fontWeight:600,color:NAVY,display:"block",marginBottom:4}}>{label}</label><div style={{display:"flex",alignItems:"center",gap:4}}><input type="number" value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:"100%",padding:"10px 12px",fontSize:14,border:`1px solid ${BORDER}`,borderRadius:6,background:"#fff",color:NAVY,outline:"none"}} onFocus={e=>e.target.style.borderColor=ELECTRIC} onBlur={e=>e.target.style.borderColor=BORDER}/>{suffix&&<span style={{fontSize:12,color:MUTED,flexShrink:0}}>{suffix}</span>}</div>{hint&&<span style={{fontSize:11,color:MUTED,marginTop:2,display:"block"}}>{hint}</span>}</div>}
const fmtK = v => v >= 1000000 ? `$${(v/1000000).toFixed(2)}M` : v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${v.toFixed(0)}`;

export default function AIDeflectionRealityCheck() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [d, setD] = useState({
    monthlyContacts: 80000, costPerContact: 7, grossDeflection: 40,
    botLeakage: 15, containmentFailure: 12, escalationPenalty: 25,
    qaCost: 2000, botPlatformCost: 8000, tuningHours: 40, tuningRate: 65,
    knowledgeMaintHours: 20, knowledgeRate: 55,
  });
  useEffect(() => { window.scrollTo(0, 0); }, [phase]);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));
  const n = v => Number(v) || 0;

  const handleGate = async () => {
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, tool: "AI Deflection Reality Check", _subject: "AI Deflection Reality Check Access" }) }); } catch (e) {}
    setSending(false); setPhase("calc");
  };

  const monthly = n(d.monthlyContacts);
  const cpc = n(d.costPerContact);
  const grossPct = n(d.grossDeflection) / 100;
  const leakPct = n(d.botLeakage) / 100;
  const failPct = n(d.containmentFailure) / 100;
  const escPenalty = n(d.escalationPenalty) / 100;

  // Waterfall
  const grossDeflected = Math.round(monthly * grossPct);
  const grossSavings = grossDeflected * cpc;

  const leakedBack = Math.round(grossDeflected * leakPct);
  const leakCost = leakedBack * cpc;

  const containmentFails = Math.round((grossDeflected - leakedBack) * failPct);
  const containmentCost = containmentFails * cpc; // customer calls back

  const escalated = leakedBack + containmentFails;
  const escalationExtra = escalated * cpc * escPenalty; // escalated calls cost more

  const monthlyQA = n(d.qaCost);
  const monthlyPlatform = n(d.botPlatformCost);
  const monthlyTuning = n(d.tuningHours) * n(d.tuningRate);
  const monthlyKnowledge = n(d.knowledgeMaintHours) * n(d.knowledgeRate);
  const monthlyOperating = monthlyQA + monthlyPlatform + monthlyTuning + monthlyKnowledge;

  const totalDeductions = leakCost + containmentCost + escalationExtra + monthlyOperating;
  const netSavings = grossSavings - totalDeductions;
  const netDeflectionRate = monthly > 0 ? ((grossDeflected - leakedBack - containmentFails) / monthly) * 100 : 0;
  const vendorVsReality = grossSavings > 0 ? (netSavings / grossSavings) * 100 : 0;

  const waterfall = [
    { label: "Gross deflection savings", value: grossSavings, type: "positive" },
    { label: "Bot leakage (abandon bot, call in)", value: -leakCost, type: "negative" },
    { label: "Containment failure (false resolution)", value: -containmentCost, type: "negative" },
    { label: "Escalation cost premium", value: -escalationExtra, type: "negative" },
    { label: "Bot platform cost", value: -monthlyPlatform, type: "negative" },
    { label: "QA + monitoring", value: -monthlyQA, type: "negative" },
    { label: "Tuning + optimization", value: -monthlyTuning, type: "negative" },
    { label: "Knowledge maintenance", value: -monthlyKnowledge, type: "negative" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.cg{grid-template-columns:1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "80px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 520 }}>
            <span style={{ color: "#7C3AED", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Cost + Economics</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>AI Deflection Reality Check</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 32 }}>Your vendor says 40% deflection. What does net savings actually look like after bot leakage, containment failure, escalation premiums, QA, platform cost, and ongoing tuning? This tool does the math the vendor slide skips.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "14px", fontSize: 15, fontWeight: 600, background: email.includes("@") ? "#7C3AED" : SLATE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: email.includes("@") ? 1 : 0.5 }}>{sending ? "Loading..." : "Launch Reality Check →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "calc" && (<>
        <section style={{ background: WARM, padding: "40px 28px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={WRAP}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 16px" }}>AI Deflection Reality Check</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }} className="cg">
              <Input label="Monthly contacts" value={d.monthlyContacts} onChange={v => set("monthlyContacts", v)} />
              <Input label="Cost per contact" value={d.costPerContact} onChange={v => set("costPerContact", v)} suffix="$" />
              <Input label="Gross deflection rate" value={d.grossDeflection} onChange={v => set("grossDeflection", v)} suffix="%" hint="What vendor promises" />
              <Input label="Bot leakage rate" value={d.botLeakage} onChange={v => set("botLeakage", v)} suffix="%" hint="Abandon bot, call in" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 12 }} className="cg">
              <Input label="Containment failure" value={d.containmentFailure} onChange={v => set("containmentFailure", v)} suffix="%" hint="Bot says resolved, isn't" />
              <Input label="Escalation cost premium" value={d.escalationPenalty} onChange={v => set("escalationPenalty", v)} suffix="%" hint="Post-bot calls cost more" />
              <Input label="Bot platform cost" value={d.botPlatformCost} onChange={v => set("botPlatformCost", v)} suffix="$/mo" />
              <Input label="QA + monitoring" value={d.qaCost} onChange={v => set("qaCost", v)} suffix="$/mo" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 12 }} className="cg">
              <Input label="Monthly tuning hours" value={d.tuningHours} onChange={v => set("tuningHours", v)} suffix="hrs" />
              <Input label="Tuning labor rate" value={d.tuningRate} onChange={v => set("tuningRate", v)} suffix="$/hr" />
              <Input label="Knowledge maint hours" value={d.knowledgeMaintHours} onChange={v => set("knowledgeMaintHours", v)} suffix="hrs/mo" />
              <Input label="Knowledge labor rate" value={d.knowledgeRate} onChange={v => set("knowledgeRate", v)} suffix="$/hr" />
            </div>
          </div>
        </section>

        <section style={{ background: "#fff", padding: "40px 28px" }}>
          <div style={WRAP}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28 }} className="cg">
              <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Vendor Claims</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: ELECTRIC }}>{fmtK(grossSavings)}<span style={{ fontSize: 14, color: MUTED }}>/mo</span></div>
                <div style={{ fontSize: 11, color: MUTED }}>{d.grossDeflection}% deflection at ${d.costPerContact}/contact</div>
              </div>
              <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: netSavings > 0 ? GREEN : RED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Net Savings (Reality)</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: "#fff" }}>{fmtK(Math.abs(netSavings))}<span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>/mo</span></div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{netSavings < 0 ? "Net cost, not savings" : `${fmtK(netSavings * 12)}/year`}</div>
              </div>
              <div style={{ background: WARM, border: `1px solid ${vendorVsReality >= 60 ? GREEN : vendorVsReality >= 40 ? AMBER : RED}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Reality vs Vendor Claim</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: vendorVsReality >= 60 ? GREEN : vendorVsReality >= 40 ? AMBER : RED }}>{vendorVsReality.toFixed(0)}%</div>
                <div style={{ fontSize: 11, color: MUTED }}>of projected savings actually realized</div>
              </div>
            </div>

            {/* Waterfall */}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Savings Waterfall: Where the Money Goes</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 28 }}>
              {waterfall.map((w, i) => {
                const maxAbs = Math.max(...waterfall.map(x => Math.abs(x.value)), 1);
                const width = Math.abs(w.value) / maxAbs * 100;
                return (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "220px 1fr 80px", gap: 12, alignItems: "center", padding: "6px 0" }}>
                    <span style={{ fontSize: 12, color: SLATE }}>{w.label}</span>
                    <div style={{ height: 18, background: WARM, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${width}%`, background: w.type === "positive" ? GREEN : RED, borderRadius: 4, opacity: 0.7, transition: "width 0.3s" }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: w.type === "positive" ? GREEN : RED, textAlign: "right" }}>{w.value >= 0 ? "+" : ""}{fmtK(w.value)}</span>
                  </div>
                );
              })}
              <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 80px", gap: 12, alignItems: "center", padding: "10px 0", borderTop: `2px solid ${NAVY}`, marginTop: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Net monthly savings</span>
                <div />
                <span style={{ fontSize: 15, fontWeight: 700, color: netSavings >= 0 ? GREEN : RED, textAlign: "right" }}>{fmtK(netSavings)}</span>
              </div>
            </div>

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>
                <strong style={{ color: "#fff" }}>The gap between the slide and the spreadsheet:</strong> Most AI deflection business cases show gross savings and stop. The reality includes four cost categories vendors rarely surface: bot leakage (customers who abandon the bot and call anyway, costing you the bot interaction AND the call), containment failure (the bot marks it resolved but the customer calls back), the escalation premium (post-bot calls run 20-30% longer because the customer is already frustrated), and ongoing operating costs (platform, QA, tuning, and knowledge maintenance). Net savings typically run 40-65% of the vendor projection.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/tools/cost-per-contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Cost per Contact Calculator →</a>
              <a href="/research/iva-buyer-guide" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>IVA Buyer Guide →</a>
              <a href="/how-to-choose" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Explore More Tools</a>
            </div>
          </div>
        </section>
      </>)}
    </div>
  );
}
