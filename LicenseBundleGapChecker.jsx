import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}
const fmtK = v => v >= 1000000 ? `$${(v/1000000).toFixed(2)}M` : v >= 1000 ? `$${(v/1000).toFixed(0)}K` : `$${v.toFixed(0)}`;

const MODULES = [
  { id: "wem", name: "WEM / WFM", typical: 25, desc: "Forecasting, scheduling, adherence, intraday" },
  { id: "qa", name: "Quality Management", typical: 15, desc: "Evaluation forms, calibration, coaching" },
  { id: "recording", name: "Call Recording", typical: 10, desc: "Voice + screen recording, compliance" },
  { id: "analytics", name: "Speech + Text Analytics", typical: 20, desc: "Interaction analytics, sentiment, trending" },
  { id: "ai", name: "AI / GenAI Features", typical: 25, desc: "Summarization, agent assist, co-pilot" },
  { id: "digital", name: "Digital Channels", typical: 15, desc: "Chat, SMS, social, messaging beyond voice" },
  { id: "outbound", name: "Outbound Dialer", typical: 20, desc: "Preview, progressive, predictive dialing" },
  { id: "reporting", name: "Advanced Reporting", typical: 10, desc: "Custom dashboards, data export, BI connector" },
  { id: "telephony", name: "BYOC / Telephony", typical: 5, desc: "Bring your own carrier, SIP trunking" },
  { id: "storage", name: "Storage / Archival", typical: 8, desc: "Extended recording storage, compliance retention" },
  { id: "support", name: "Premium Support", typical: 12, desc: "24/7 support, dedicated CSM, SLA guarantees" },
  { id: "services", name: "Professional Services", typical: 0, desc: "Implementation, customization, integration" },
];

export default function LicenseBundleGapChecker() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [baseSeat, setBaseSeat] = useState(125);
  const [agents, setAgents] = useState(150);
  const [modules, setModules] = useState(() => {
    const m = {};
    MODULES.forEach(mod => { m[mod.id] = { needed: true, included: mod.typical === 0 || mod.id === "recording", addOnCost: mod.typical }; });
    return m;
  });
  useEffect(() => { window.scrollTo(0, 0); }, [phase]);

  const handleGate = async () => {
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, tool: "License Bundle Gap Checker", _subject: "License Bundle Gap Checker Access" }) }); } catch (e) {}
    setSending(false); setPhase("calc");
  };

  const toggleNeeded = id => setModules(prev => ({ ...prev, [id]: { ...prev[id], needed: !prev[id].needed } }));
  const toggleIncluded = id => setModules(prev => ({ ...prev, [id]: { ...prev[id], included: !prev[id].included } }));
  const setCost = (id, val) => setModules(prev => ({ ...prev, [id]: { ...prev[id], addOnCost: Number(val) || 0 } }));

  const n = v => Number(v) || 0;
  const totalAddOn = MODULES.reduce((sum, mod) => {
    const m = modules[mod.id];
    if (m.needed && !m.included) return sum + m.addOnCost;
    return sum;
  }, 0);
  const effectiveSeat = n(baseSeat) + totalAddOn;
  const gapPct = n(baseSeat) > 0 ? ((effectiveSeat - n(baseSeat)) / n(baseSeat) * 100) : 0;
  const monthlyTotal = effectiveSeat * n(agents);
  const annualTotal = monthlyTotal * 12;
  const baseOnly = n(baseSeat) * n(agents) * 12;
  const annualGap = annualTotal - baseOnly;

  const neededNotIncluded = MODULES.filter(mod => modules[mod.id].needed && !modules[mod.id].included);
  const gapColor = gapPct > 80 ? RED : gapPct > 40 ? AMBER : GREEN;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.cg{grid-template-columns:1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "80px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 520 }}>
            <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Cost + Economics</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>License Bundle Gap Checker</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 32 }}>Compare the vendor's advertised seat price against what you actually need: WEM, QA, analytics, AI, telephony, storage, and support. See the real gap between list price and operating cost.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "14px", fontSize: 15, fontWeight: 600, background: email.includes("@") ? ELECTRIC : SLATE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: email.includes("@") ? 1 : 0.5 }}>{sending ? "Loading..." : "Launch Checker →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "calc" && (<>
        <section style={{ background: WARM, padding: "40px 28px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={WRAP}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 16px" }}>License Bundle Gap Checker</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }} className="cg">
              <div><label style={{ fontSize: 12, fontWeight: 600, color: NAVY, display: "block", marginBottom: 4 }}>Base seat price (quoted)</label><div style={{ display: "flex", alignItems: "center", gap: 4 }}><input type="number" value={baseSeat} onChange={e => setBaseSeat(Number(e.target.value))} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, outline: "none" }} /><span style={{ fontSize: 12, color: MUTED }}>$/agent/mo</span></div></div>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: NAVY, display: "block", marginBottom: 4 }}>Number of agents</label><input type="number" value={agents} onChange={e => setAgents(Number(e.target.value))} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, outline: "none" }} /></div>
            </div>

            <h3 style={{ fontSize: 12, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Module Checklist</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ display: "grid", gridTemplateColumns: "30px 30px 1fr 200px 80px", gap: 8, padding: "6px 8px", background: DEEP, borderRadius: "6px 6px 0 0" }}>
                <span style={{ fontSize: 9, color: "#fff", fontWeight: 700, textAlign: "center" }}>Need</span>
                <span style={{ fontSize: 9, color: "#fff", fontWeight: 700, textAlign: "center" }}>Incl</span>
                <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>Module</span>
                <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>Description</span>
                <span style={{ fontSize: 9, color: "#fff", fontWeight: 700, textAlign: "right" }}>Add-on $/mo</span>
              </div>
              {MODULES.map((mod, i) => {
                const m = modules[mod.id];
                const isGap = m.needed && !m.included;
                return (
                  <div key={mod.id} style={{ display: "grid", gridTemplateColumns: "30px 30px 1fr 200px 80px", gap: 8, padding: "8px 8px", background: isGap ? `${RED}06` : i % 2 === 0 ? "#fff" : WARM, alignItems: "center", borderLeft: isGap ? `3px solid ${RED}` : "3px solid transparent" }}>
                    <div style={{ textAlign: "center" }}><input type="checkbox" checked={m.needed} onChange={() => toggleNeeded(mod.id)} /></div>
                    <div style={{ textAlign: "center" }}><input type="checkbox" checked={m.included} onChange={() => toggleIncluded(mod.id)} /></div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{mod.name}</span>
                    <span style={{ fontSize: 11, color: MUTED }}>{mod.desc}</span>
                    <div>{isGap && <input type="number" value={m.addOnCost} onChange={e => setCost(mod.id, e.target.value)} style={{ width: "100%", padding: "4px 8px", fontSize: 12, border: `1px solid ${BORDER}`, borderRadius: 4, textAlign: "right" }} />}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section style={{ background: "#fff", padding: "40px 28px" }}>
          <div style={WRAP}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 28 }} className="cg">
              <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Quoted Seat Price</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: ELECTRIC }}>${baseSeat}</div>
                <div style={{ fontSize: 11, color: MUTED }}>Per agent per month</div>
              </div>
              <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: gapColor, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Effective Seat Price</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: "#fff" }}>${effectiveSeat}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>+${totalAddOn} in add-ons</div>
              </div>
              <div style={{ background: WARM, border: `1px solid ${gapColor}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Bundle Gap</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: gapColor }}>+{gapPct.toFixed(0)}%</div>
                <div style={{ fontSize: 11, color: MUTED }}>Above quoted price</div>
              </div>
              <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Annual Gap Cost</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: RED }}>{fmtK(annualGap)}</div>
                <div style={{ fontSize: 11, color: MUTED }}>Above base contract</div>
              </div>
            </div>

            {/* Visual: stacked bar */}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>What You Are Actually Paying For</h3>
            <div style={{ display: "flex", height: 40, borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ width: `${(baseSeat / effectiveSeat) * 100}%`, background: ELECTRIC, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>Base ${baseSeat}</span>
              </div>
              {neededNotIncluded.map((mod, i) => {
                const m = modules[mod.id];
                const w = (m.addOnCost / effectiveSeat) * 100;
                return w > 2 && (
                  <div key={mod.id} style={{ width: `${w}%`, background: `hsl(${(i * 35) + 10}, 65%, 55%)`, display: "flex", alignItems: "center", justifyContent: "center", borderLeft: "1px solid rgba(255,255,255,0.3)" }}>
                    {w > 6 && <span style={{ fontSize: 8, color: "#fff", fontWeight: 600 }}>{mod.name.split("/")[0].trim()}</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: MUTED, marginBottom: 28 }}>
              {neededNotIncluded.length} modules needed but not included in base seat = ${totalAddOn}/agent/mo in add-ons
            </div>

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>
                <strong style={{ color: "#fff" }}>What the seat price does not tell you:</strong> The advertised CCaaS seat price typically covers core voice, basic routing, and standard reporting. Everything else is modular. WEM, quality management, speech analytics, AI features, premium support, and extended storage are add-ons on most platforms. Industry data shows the gap between list price and production-ready deployment runs 40-100%. Get every module priced in writing before signing, and negotiate rate locks for add-ons you will need within 18 months.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/tco-calculator" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>TCO Calculator →</a>
              <a href="/research/ccaas-buyer-guide" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>CCaaS Buyer Guide →</a>
              <a href="/how-to-choose" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Explore More Tools</a>
            </div>
          </div>
        </section>
      </>)}
    </div>
  );
}
