import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 900, margin: "0 auto", padding: "0 28px" };

function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const LAYERS = [
  { n: 7, name: "Analytics & Governance", color: "#1a5276", systems: ["WEM / QM", "Speech Analytics", "Text Analytics", "Journey Analytics", "Compliance Recording"] },
  { n: 6, name: "Routing & Orchestration", color: "#1a6b8a", systems: ["ACD / Routing Engine", "Outbound / Proactive", "Agent Desktop", "Workforce Management", "Quality Monitoring"] },
  { n: 5, name: "Conversation Management", color: "#1a7f9e", systems: ["Digital Engagement", "Voice / Telephony", "IVA / Chatbot", "Email Management", "Social / Messaging"] },
  { n: 4, name: "Reasoning & AI", color: "#0e8c7f", systems: ["Virtual Assistant / LLM", "Agent Assist / Copilot", "Knowledge AI", "Intent / NLU Engine", "Generative AI Layer"] },
  { n: 3, name: "Policy & Guardrails", color: "#0e7a5e", systems: ["Payment / PCI Vault", "Fraud / Risk Engine", "Identity / Auth", "Consent Management", "AI Governance Tools"] },
  { n: 2, name: "Workflow Execution", color: "#1a6b4a", systems: ["RPA / Automation", "iPaaS / Integration", "BPM / Workflow Engine", "Case Management", "Notification Engine"] },
  { n: 1, name: "Data Access", color: "#2c5f3f", systems: ["CRM", "ERP / Billing", "Ticketing / Case", "Data Warehouse", "Event Streaming"] },
];

const MATURITY = [
  { value: "none", label: "No system", color: RED },
  { value: "legacy", label: "Legacy / manual", color: AMBER },
  { value: "basic", label: "Basic / partial", color: "#F59E0B" },
  { value: "operational", label: "Operational", color: ELECTRIC },
  { value: "integrated", label: "Fully integrated", color: GREEN },
];

export default function IntegrationPlanner() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState(""); const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [mapping, setMapping] = useState({});
  const [vendors, setVendors] = useState({});

  useEffect(() => { window.scrollTo(0, 0); }, [phase]);

  const k = (li, si) => `${li}-${si}`;
  const setMat = (li, si, val) => setMapping(prev => ({ ...prev, [k(li, si)]: val }));
  const getMat = (li, si) => mapping[k(li, si)] || "none";
  const setVendor = (li, si, val) => setVendors(prev => ({ ...prev, [k(li, si)]: val }));
  const getVendor = (li, si) => vendors[k(li, si)] || "";

  const totalSystems = LAYERS.reduce((a, l) => a + l.systems.length, 0);
  const mappedCount = Object.values(mapping).filter(v => v !== "none").length;
  const gapCount = Object.values(mapping).filter(v => v === "none").length + (totalSystems - Object.keys(mapping).length);
  const legacyCount = Object.values(mapping).filter(v => v === "legacy").length;
  const integratedCount = Object.values(mapping).filter(v => v === "integrated").length;

  const layerHealth = (li) => {
    const layer = LAYERS[li];
    const mats = layer.systems.map((_, si) => getMat(li, si));
    const scores = mats.map(m => m === "integrated" ? 4 : m === "operational" ? 3 : m === "basic" ? 2 : m === "legacy" ? 1 : 0);
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  };

  const handleGate = async () => {
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/xrerqdqo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "Integration Strategy Planner", _subject: "Integration Planner Access" }) }); } catch (e) {}
    setSending(false); setPhase("map");
  };

  const handleResults = async () => {
    const summary = LAYERS.map((l, li) => `L${l.n} ${l.name}: ${layerHealth(li).toFixed(1)}/4`).join(" | ");
    try { await fetch("https://formspree.io/f/xrerqdqo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "Integration Planner", mapped: mappedCount, gaps: gapCount, legacy: legacyCount, summary, _subject: `Integration Map: ${gapCount} gaps, ${legacyCount} legacy — ${company || name || email}` }) }); } catch (e) {}
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
          <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
            <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Planning Tool</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "12px 0 16px" }}>Integration Strategy Planner</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 auto 36px", maxWidth: 520 }}>Map your current technology stack across the seven CX orchestration layers. For each system, set its maturity level and vendor. Identify integration gaps, legacy dependencies, and consolidation opportunities.</p>
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

      {phase === "map" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "40px 28px 80px" }}>
          <div style={WRAP}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>Map your stack</h2>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 24 }}>For each system in each layer, select the maturity level and optionally name the vendor. {mappedCount}/{totalSystems} mapped.</p>

            {LAYERS.map((layer, li) => (
              <div key={li} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: layer.color, borderRadius: "8px 8px 0 0" }}>
                  <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 700 }}>L{layer.n}</span>
                  <span style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{layer.name}</span>
                </div>
                <div style={{ border: `1px solid ${BORDER}`, borderTop: "none", borderRadius: "0 0 8px 8px", overflow: "hidden" }}>
                  {layer.systems.map((sys, si) => {
                    const mat = getMat(li, si);
                    const matObj = MATURITY.find(m => m.value === mat);
                    return (
                      <div key={si} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: si < layer.systems.length - 1 ? `1px solid ${BORDER}` : "none", background: "#fff" }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: NAVY, flex: 1, minWidth: 140 }}>{sys}</span>
                        <input value={getVendor(li, si)} onChange={e => setVendor(li, si, e.target.value)} placeholder="Vendor" style={{ width: 120, padding: "5px 8px", fontSize: 11, border: `1px solid ${BORDER}`, borderRadius: 4, background: WARM, color: NAVY, outline: "none" }} />
                        <select value={mat} onChange={e => setMat(li, si, e.target.value)} style={{ padding: "5px 8px", fontSize: 10, borderRadius: 4, border: `1px solid ${matObj.color}40`, background: `${matObj.color}08`, color: matObj.color, fontWeight: 600, cursor: "pointer", outline: "none" }}>
                          {MATURITY.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={handleResults} disabled={mappedCount < 10} style={{ padding: "14px 28px", borderRadius: 8, border: "none", background: mappedCount >= 10 ? ELECTRIC : MUTED, color: "#fff", fontSize: 15, fontWeight: 600, cursor: mappedCount >= 10 ? "pointer" : "default", opacity: mappedCount >= 10 ? 1 : 0.5 }}>
                {mappedCount >= 10 ? `Analyze Stack (${mappedCount}/${totalSystems}) →` : `Map at least 10 systems (${mappedCount}/10)`}
              </button>
            </div>
          </div>
        </section>
      )}

      {phase === "results" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "48px 28px 80px" }}>
          <div style={WRAP}>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "40px 32px", textAlign: "center", marginBottom: 32 }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Stack Analysis</span>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", margin: "8px 0 16px" }}>{mappedCount} systems mapped across 7 layers</h2>
              <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
                <div><div style={{ fontSize: 24, fontWeight: 700, color: GREEN }}>{integratedCount}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Fully integrated</div></div>
                <div><div style={{ fontSize: 24, fontWeight: 700, color: AMBER }}>{legacyCount}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Legacy</div></div>
                <div><div style={{ fontSize: 24, fontWeight: 700, color: RED }}>{totalSystems - mappedCount}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>No system</div></div>
              </div>
            </div>

            <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 20px" }}>Layer-by-Layer Health</h3>
            {LAYERS.map((layer, li) => {
              const health = layerHealth(li);
              const healthColor = health >= 3 ? GREEN : health >= 2 ? ELECTRIC : health >= 1 ? AMBER : RED;
              const healthLabel = health >= 3 ? "Strong" : health >= 2 ? "Functional" : health >= 1 ? "Weak" : "Critical Gap";
              return (
                <div key={li} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 20px", marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 4, background: layer.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>L{layer.n}</div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{layer.name}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: healthColor, background: `${healthColor}12`, padding: "3px 8px", borderRadius: 4 }}>{healthLabel}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {layer.systems.map((sys, si) => {
                      const mat = getMat(li, si);
                      const matObj = MATURITY.find(m => m.value === mat);
                      const vendor = getVendor(li, si);
                      return (
                        <span key={si} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, background: `${matObj.color}12`, color: matObj.color, fontWeight: 600, border: `1px solid ${matObj.color}25` }}>
                          {sys}{vendor ? `: ${vendor}` : ""} ({matObj.label})
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Risks */}
            {(legacyCount > 0 || (totalSystems - mappedCount) > 5) && (
              <div style={{ background: `${RED}08`, border: `1px solid ${RED}20`, borderRadius: 10, padding: "20px 22px", margin: "24px 0" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: RED, letterSpacing: 1, textTransform: "uppercase" }}>Integration Risks</span>
                {legacyCount > 0 && <p style={{ fontSize: 13, color: NAVY, margin: "8px 0 0" }}><strong>{legacyCount} legacy systems</strong> create integration fragility. Each one is a point of failure during platform migration or AI deployment.</p>}
                {(totalSystems - mappedCount) > 5 && <p style={{ fontSize: 13, color: NAVY, margin: "8px 0 0" }}><strong>{totalSystems - mappedCount} unmapped systems</strong> represent blind spots in your architecture. These gaps become visible during implementation.</p>}
              </div>
            )}

            {/* Vendor count */}
            {(() => {
              const uniqueVendors = [...new Set(Object.values(vendors).filter(v => v.trim()))];
              return uniqueVendors.length > 0 ? (
                <div style={{ background: `${ELECTRIC}08`, border: `1px solid ${ELECTRIC}20`, borderRadius: 10, padding: "20px 22px", marginBottom: 24 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: ELECTRIC, letterSpacing: 1, textTransform: "uppercase" }}>Vendor Landscape</span>
                  <p style={{ fontSize: 13, color: NAVY, margin: "8px 0 4px" }}><strong>{uniqueVendors.length} unique vendors</strong> across your stack: {uniqueVendors.join(", ")}</p>
                  {uniqueVendors.length > 8 && <p style={{ fontSize: 12, color: AMBER }}>High vendor count increases integration maintenance burden and contract management complexity.</p>}
                </div>
              ) : null;
            })()}

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "36px 28px", textAlign: "center" }}>
              <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: "#fff", margin: "0 0 10px" }}>Ready to optimize your stack?</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: "0 auto 24px", maxWidth: 440 }}>Your integration map has been saved. Request a working session and we'll identify consolidation opportunities, migration sequencing, and vendor recommendations for your weakest layers.</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "13px 24px", borderRadius: 8 }}>Request a Working Session</a>
                <a href="/platforms-and-tech" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 14, fontWeight: 500, padding: "13px 24px", borderRadius: 8 }}>Explore Platforms & Tech →</a>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
