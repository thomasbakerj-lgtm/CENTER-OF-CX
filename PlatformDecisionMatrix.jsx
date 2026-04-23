import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const LAYERS = [
  { n: 7, name: "Analytics + Governance", color: "#1a5276", needs: ["Real-time dashboards", "AI-powered QA (100% evaluation)", "Closed-loop feedback to routing + coaching", "Compliance recording + audit trails", "Forecast accuracy + WFM optimization"] },
  { n: 6, name: "Routing + Orchestration", color: "#1a6b8a", needs: ["Intent-driven routing (beyond skills-based)", "AI-first routing with human escalation", "Cross-system orchestration (CCaaS + CRM + WFM)", "Dynamic priority based on customer value + context", "Real-time queue management + intraday adjustment"] },
  { n: 5, name: "Conversation Management", color: "#1a7f9e", needs: ["Unified voice + digital channels", "Cross-channel context continuity", "Agent desktop consolidation (single pane)", "Messaging channels (WhatsApp, RCS, Apple)", "Video + co-browse for complex issues"] },
  { n: 4, name: "Reasoning + Planning", color: "#0e8c7f", needs: ["LLM-native IVA (not just intent-based)", "Real-time agent assist (not post-call)", "Knowledge AI with RAG grounding", "Autonomous task execution (not just text generation)", "Multi-agent orchestration"] },
  { n: 3, name: "Policy + Guardrails", color: "#0e7a5e", needs: ["PCI descoping with tokenization", "AI guardrails for customer-facing decisions", "Identity verification across channels", "Bias detection + fairness monitoring", "Audit trails for AI decisions"] },
  { n: 2, name: "Workflow Execution", color: "#1a6b4a", needs: ["End-to-end workflow automation (top 10 intents)", "API-triggered workflows (not just UI)", "Exception handling without manual intervention", "Cross-system data writes (not just reads)", "Agentic AI workflow execution"] },
  { n: 1, name: "Data Access", color: "#2c5f3f", needs: ["Real-time CRM read/write", "Event streaming for interaction signals", "Clean customer data (deduplicated, current)", "API access to billing, case, and ERP systems", "Data governance + lineage documentation"] },
];

const RATINGS = [
  { value: 1, label: "Critical gap", color: RED, desc: "Not available or fundamentally broken" },
  { value: 2, label: "Major gap", color: "#DC6B00", desc: "Partially available but inadequate" },
  { value: 3, label: "Adequate", color: AMBER, desc: "Functional but will hit limits within 18 months" },
  { value: 4, label: "Strong", color: "#7CB342", desc: "Meets current and near-term needs" },
  { value: 5, label: "Excellent", color: GREEN, desc: "Exceeds needs, competitive advantage" },
];

export default function PlatformDecisionMatrix() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState(""); const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [scores, setScores] = useState({});
  const [currentLayer, setCurrentLayer] = useState(0);
  useEffect(() => { window.scrollTo(0, 0); }, [phase]);

  const setScore = (layerN, needIdx, val) => setScores(prev => ({ ...prev, [`${layerN}-${needIdx}`]: val }));
  const layerAvg = (layerN) => {
    const layer = LAYERS.find(l => l.n === layerN);
    const vals = layer.needs.map((_, i) => scores[`${layerN}-${i}`] || 0).filter(v => v > 0);
    return vals.length === 0 ? 0 : vals.reduce((a, b) => a + b, 0) / vals.length;
  };
  const layerComplete = (layerN) => LAYERS.find(l => l.n === layerN).needs.every((_, i) => scores[`${layerN}-${i}`] > 0);
  const allComplete = LAYERS.every(l => layerComplete(l.n));

  const handleGate = async () => {
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "Platform Decision Matrix", _subject: "Platform Decision Matrix Access" }) }); } catch (e) {}
    setSending(false); setPhase("assess");
  };

  const handleResults = async () => {
    const layerResults = LAYERS.map(l => `L${l.n} ${l.name}: ${layerAvg(l.n).toFixed(1)}`).join(" | ");
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "Platform Decision Matrix", layers: layerResults, _subject: `Platform Matrix: ${LAYERS.filter(l => layerAvg(l.n) < 2.5).length} critical gaps — ${company || name || email}` }) }); } catch (e) {}
    setPhase("results");
  };

  const getRecommendation = (avg) => {
    if (avg >= 4) return { action: "Stay", color: GREEN, desc: "Current platform serves this layer well. Optimize, do not replace." };
    if (avg >= 3) return { action: "Extend", color: AMBER, desc: "Functional but approaching limits. Evaluate add-ons or integrations to close gaps." };
    if (avg >= 2) return { action: "Evaluate", color: "#DC6B00", desc: "Significant gaps. Evaluate whether current platform can close them or if a specialist solution is needed." };
    return { action: "Replace", color: RED, desc: "Critical gap. Current platform cannot serve this layer. Prioritize vendor evaluation." };
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.pg{grid-template-columns:1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "80px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 520 }}>
            <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Vendor Selection</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>Platform Decision Matrix</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 32 }}>For each of the 7 orchestration layers, assess whether your current platform meets your needs. Get a layer-by-layer recommendation: stay, extend, evaluate, or replace.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="text" placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "14px", fontSize: 15, fontWeight: 600, background: email.includes("@") ? ELECTRIC : SLATE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: email.includes("@") ? 1 : 0.5 }}>{sending ? "Loading..." : "Start Assessment →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "assess" && (
        <section style={{ background: "#fff", padding: "40px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 700 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
              {LAYERS.map((l, i) => (
                <button key={l.n} onClick={() => setCurrentLayer(i)} style={{ padding: "6px 12px", fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: "pointer", border: `1px solid ${i === currentLayer ? l.color : layerComplete(l.n) ? GREEN : BORDER}`, background: i === currentLayer ? l.color : layerComplete(l.n) ? `${GREEN}08` : "#fff", color: i === currentLayer ? "#fff" : layerComplete(l.n) ? GREEN : MUTED }}>{layerComplete(l.n) ? "✓ " : ""}L{l.n}</button>
              ))}
            </div>
            {(() => {
              const layer = LAYERS[currentLayer];
              return (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 6, background: layer.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 16 }}>{layer.n}</div>
                    <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: 0 }}>{layer.name}</h2>
                  </div>
                  <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>Rate your current platform's capability for each need at this layer.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {layer.needs.map((need, ni) => (
                      <div key={ni} style={{ background: WARM, border: `1px solid ${scores[`${layer.n}-${ni}`] ? layer.color + "30" : BORDER}`, borderRadius: 8, padding: "14px 16px" }}>
                        <p style={{ fontSize: 13, color: NAVY, margin: "0 0 10px", fontWeight: 500 }}>{need}</p>
                        <div style={{ display: "flex", gap: 4 }}>
                          {RATINGS.map(r => (
                            <button key={r.value} onClick={() => setScore(layer.n, ni, r.value)} style={{ flex: 1, padding: "6px 4px", fontSize: 10, fontWeight: 600, borderRadius: 4, cursor: "pointer", border: `1px solid ${scores[`${layer.n}-${ni}`] === r.value ? r.color : BORDER}`, background: scores[`${layer.n}-${ni}`] === r.value ? r.color : "#fff", color: scores[`${layer.n}-${ni}`] === r.value ? "#fff" : MUTED }}>{r.label}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
                    <button onClick={() => setCurrentLayer(Math.max(0, currentLayer - 1))} disabled={currentLayer === 0} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, borderRadius: 6, border: `1px solid ${BORDER}`, background: "#fff", color: currentLayer === 0 ? MUTED : NAVY, cursor: "pointer", opacity: currentLayer === 0 ? 0.5 : 1 }}>← Previous</button>
                    {currentLayer < LAYERS.length - 1 ? (
                      <button onClick={() => setCurrentLayer(currentLayer + 1)} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, borderRadius: 6, border: "none", background: layer.color, color: "#fff", cursor: "pointer" }}>Next: L{LAYERS[currentLayer + 1].n} →</button>
                    ) : (
                      <button onClick={handleResults} disabled={!allComplete} style={{ padding: "10px 24px", fontSize: 13, fontWeight: 600, borderRadius: 6, border: "none", background: allComplete ? GREEN : MUTED, color: "#fff", cursor: "pointer", opacity: allComplete ? 1 : 0.5 }}>{allComplete ? "See Recommendations →" : "Complete all layers"}</button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {phase === "results" && (
        <section style={{ background: "#fff", padding: "40px 28px 60px" }}>
          <div style={WRAP}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: NAVY, margin: "0 0 8px", textAlign: "center" }}>Platform Recommendations by Layer</h2>
            <p style={{ fontSize: 13, color: MUTED, textAlign: "center", marginBottom: 32 }}>Based on your assessment of current platform capabilities across all 7 orchestration layers.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
              {LAYERS.map(layer => {
                const avg = layerAvg(layer.n);
                const rec = getRecommendation(avg);
                return (
                  <div key={layer.n} style={{ display: "grid", gridTemplateColumns: "40px 1fr 100px 120px", gap: 16, alignItems: "center", padding: "16px 20px", background: WARM, borderRadius: 10, border: `1px solid ${BORDER}`, borderLeft: `4px solid ${layer.color}` }} className="pg">
                    <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: layer.color, textAlign: "center" }}>{layer.n}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{layer.name}</div>
                      <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{rec.desc}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: avg >= 3.5 ? GREEN : avg >= 2.5 ? AMBER : RED }}>{avg.toFixed(1)}</div>
                      <div style={{ fontSize: 10, color: MUTED }}>avg score</div>
                    </div>
                    <div style={{ textAlign: "center", padding: "6px 12px", borderRadius: 6, background: `${rec.color}12`, color: rec.color, fontSize: 13, fontWeight: 700 }}>{rec.action}</div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 28 }} className="pg">
              {[
                { label: "Stay", count: LAYERS.filter(l => getRecommendation(layerAvg(l.n)).action === "Stay").length, color: GREEN },
                { label: "Extend", count: LAYERS.filter(l => getRecommendation(layerAvg(l.n)).action === "Extend").length, color: AMBER },
                { label: "Evaluate", count: LAYERS.filter(l => getRecommendation(layerAvg(l.n)).action === "Evaluate").length, color: "#DC6B00" },
                { label: "Replace", count: LAYERS.filter(l => getRecommendation(layerAvg(l.n)).action === "Replace").length, color: RED },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center", padding: "16px", background: `${s.color}08`, border: `1px solid ${s.color}20`, borderRadius: 10 }}>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: s.color }}>{s.count}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "32px", textAlign: "center", marginBottom: 24 }}>
              <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: "#fff", margin: "0 0 8px" }}>Layer-by-layer is how smart migrations work.</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 480, margin: "0 auto 20px" }}>
                Most migrations try to move all 7 layers at once. The ones that succeed prioritize the layers with critical gaps and leave the functional layers alone. A working session can help you sequence this correctly.
              </p>
              <a href="/contact" style={{ display: "inline-block", background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 32px", borderRadius: 8, boxShadow: "0 4px 18px rgba(0,136,221,0.3)" }}>Request a Working Session →</a>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/tools/vendor-match" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Vendor Match Engine →</a>
              <a href="/platforms-and-tech" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>7-Layer Framework →</a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
