import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { getInsuranceSubVertical } from "./InsuranceSubVerticalData";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 1000, margin: "0 auto", padding: "0 28px" };
const LAYER_COLORS = ["#2c5f3f", "#1a6b4a", "#0e7a5e", "#0e8c7f", "#1a7f9e", "#1a6b8a", "#1a5276"];

function useInView(t=.1){const ref=useRef(null);const[v,setV]=useState(false);useEffect(()=>{const el=ref.current;if(!el)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.unobserve(el)}},{threshold:t});o.observe(el);return()=>o.disconnect()},[]);return[ref,v]}
function FadeIn({children,delay=0}){const[ref,v]=useInView();return<div ref={ref} style={{opacity:v?1:0,transform:v?"translateY(0)":"translateY(22px)",transition:`opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`}}>{children}</div>}
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const STATUS_OPTS = [
  { label: "Have", color: GREEN, icon: "✓" },
  { label: "Need", color: RED, icon: "✗" },
  { label: "Planned", color: AMBER, icon: "◐" },
];

export default function FSSubVerticalPage() {
  const { slug } = useParams();
  const sv = getInsuranceSubVertical(slug);
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState(""); const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [statuses, setStatuses] = useState({});
  const [expandedLayers, setExpandedLayers] = useState({});
  const toggleLayer = (li) => setExpandedLayers(prev => ({ ...prev, [li]: !prev[li] }));

  useEffect(() => { window.scrollTo(0, 0); }, [phase]);

  if (!sv) return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#fff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}><h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: NAVY }}>Sub-vertical not found</h1><a href="/industries/insurance" style={{ color: ELECTRIC, fontSize: 14, fontWeight: 600 }}>← Back to Insurance</a></div>
    </div>
  );

  const setStatus = (layerIdx, capIdx, status) => setStatuses(prev => ({ ...prev, [`${layerIdx}-${capIdx}`]: status }));
  const getStatus = (layerIdx, capIdx) => statuses[`${layerIdx}-${capIdx}`];

  const totalCaps = sv.layers.reduce((a, l) => a + l.capabilities.length, 0);
  const assessed = Object.keys(statuses).length;
  const haveCount = Object.values(statuses).filter(s => s === "Have").length;
  const needCount = Object.values(statuses).filter(s => s === "Need").length;
  const plannedCount = Object.values(statuses).filter(s => s === "Planned").length;
  const maturityPct = totalCaps > 0 ? Math.round((haveCount / totalCaps) * 100) : 0;

  const handleGate = async () => {
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/xnjolywk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: `CX Stack Framework: ${sv.name}`, _subject: `Stack Framework: ${sv.name}` }) }); } catch (e) {}
    setSending(false); setPhase("framework");
  };

  const handleResults = async () => {
    const layerSummary = sv.layers.map(l => {
      const li = sv.layers.indexOf(l);
      const have = l.capabilities.filter((_, ci) => getStatus(li, ci) === "Have").length;
      return `L${l.layer} ${l.name}: ${have}/${l.capabilities.length}`;
    }).join(" | ");
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: `Stack Framework: ${sv.name}`, maturity: `${maturityPct}%`, have: haveCount, need: needCount, planned: plannedCount, layers: layerSummary, _subject: `Stack: ${sv.name} ${maturityPct}% mature — ${company || name || email}` }) }); } catch (e) {}
    setPhase("results");
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}`}</style>

      <nav style={{ background: DEEP, padding: "16px 0" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
          <a href="/industries/insurance" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Insurance</a>
        </div>
      </nav>

      {/* GATE */}
      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", padding: "80px 28px" }}>
          <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
            <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>{sv.parent} — {sv.name}</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "12px 0 16px" }}>{sv.name} CX Stack Framework</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 auto 16px", maxWidth: 520 }}>{sv.intro}</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 32 }}>Map your current capabilities across all 7 orchestration layers. {totalCaps} checkpoints. Identify what you have, what you need, and where the gaps create the most risk.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 28 }}>
              {sv.kpis.map((k, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "12px 8px", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: LIGHT }}>{k.avg}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{k.metric}</div>
                </div>
              ))}
            </div>

            <div style={{ maxWidth: 400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Work email *" style={{ padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, outline: "none" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={{ flex: 1, padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none" }} />
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company" style={{ flex: 1, padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none" }} />
              </div>
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "16px", borderRadius: 8, border: "none", background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: sending ? 0.6 : 1, marginTop: 4 }}>{sending ? "Loading..." : "Access the Framework →"}</button>
            </div>
          </div>
        </section>
      )}

      {/* FRAMEWORK */}
      {phase === "framework" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "40px 28px 80px" }}>
          <div style={WRAP}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: NAVY, margin: 0 }}>{sv.name} — 7-Layer CX Stack</h2>
                <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>For each capability, mark whether you <strong style={{ color: GREEN }}>Have</strong> it, <strong style={{ color: RED }}>Need</strong> it, or have it <strong style={{ color: AMBER }}>Planned</strong>.</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 12, color: MUTED }}>{assessed}/{totalCaps} assessed</span>
                {assessed >= totalCaps * 0.7 && (
                  <button onClick={handleResults} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: ELECTRIC, color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>View Stack Profile →</button>
                )}
              </div>
            </div>

            {sv.layers.map((layer, li) => {
              const lc = LAYER_COLORS[li];
              const layerHave = layer.capabilities.filter((_, ci) => getStatus(li, ci) === "Have").length;
              const layerPct = Math.round((layerHave / layer.capabilities.length) * 100);
              return (
                <FadeIn key={li} delay={li * 0.03}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", background: lc, borderRadius: "10px 10px 0 0" }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 14, color: "#fff" }}>{layer.layer}</span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: 0 }}>Layer {layer.layer}: {layer.name}</h3>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>Vendors: {layer.vendors}</div>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "rgba(255,255,255,0.15)", padding: "2px 8px", borderRadius: 4 }}>{layerPct}%</span>
                    </div>

                    <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderTop: "none", borderRadius: "0 0 10px 10px", padding: "4px 0" }}>
                      {layer.capabilities.map((cap, ci) => {
                        const status = getStatus(li, ci);
                        const sc = STATUS_OPTS.find(s => s.label === status);
                        return (
                          <div key={ci} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderBottom: ci < layer.capabilities.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                            <div style={{ flex: 1 }}>
                              <span style={{ fontSize: 13, color: status === "Have" ? GREEN : status === "Need" ? RED : status === "Planned" ? AMBER : NAVY, fontWeight: status ? 500 : 400 }}>{cap}</span>
                            </div>
                            <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                              {STATUS_OPTS.map(opt => (
                                <button key={opt.label} onClick={() => setStatus(li, ci, opt.label)}
                                  style={{ width: 56, padding: "4px 0", fontSize: 10, fontWeight: status === opt.label ? 700 : 400, borderRadius: 4, border: status === opt.label ? `2px solid ${opt.color}` : `1px solid ${BORDER}`, background: status === opt.label ? `${opt.color}12` : "#fff", color: status === opt.label ? opt.color : MUTED, cursor: "pointer" }}>
                                  {opt.icon} {opt.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Vendor Stack */}
                    {layer.stack && layer.stack.length > 0 && (
                      <div style={{ background: "#fff", borderLeft: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}` }}>
                        <button onClick={() => toggleLayer(li)} style={{ width: "100%", padding: "10px 18px", background: `${ELECTRIC}04`, border: "none", borderTop: `1px solid ${BORDER}`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: ELECTRIC }}>Recommended Technology Stack ({layer.stack.length} providers)</span>
                          <span style={{ fontSize: 11, color: MUTED }}>{expandedLayers[li] ? "▾ Hide" : "▸ Show"}</span>
                        </button>
                        {expandedLayers[li] && (
                          <div style={{ padding: "12px 18px 16px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {layer.stack.map((v, vi) => (
                                <div key={vi} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 12px", background: WARM, borderRadius: 6, border: `1px solid ${BORDER}` }}>
                                  <div style={{ width: 4, height: "100%", minHeight: 40, borderRadius: 2, background: ELECTRIC, flexShrink: 0 }} />
                                  <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                                      {v.href ? <a href={v.href} style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{v.name}</a> : <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{v.name}</span>}
                                      <span style={{ fontSize: 9, fontWeight: 600, color: MUTED, background: "#fff", padding: "1px 6px", borderRadius: 3, border: `1px solid ${BORDER}` }}>{v.role}</span>
                                    </div>
                                    <p style={{ fontSize: 12, color: SLATE, margin: "2px 0 0", lineHeight: 1.5 }}>{v.why}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {layer.pitfall && (
                              <div style={{ marginTop: 10, padding: "10px 12px", background: `${AMBER}06`, border: `1px solid ${AMBER}18`, borderRadius: 6 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: AMBER, letterSpacing: 0.5, textTransform: "uppercase" }}>Integration pitfall</span>
                                <p style={{ fontSize: 12, color: SLATE, margin: "3px 0 0", lineHeight: 1.5 }}>{layer.pitfall}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {layer.risk && (
                      <div style={{ fontSize: 11, color: RED, padding: "6px 18px", background: `${RED}06`, borderRadius: "0 0 6px 6px", border: `1px solid ${RED}15`, borderTop: "none" }}>
                        ⚠ Key risk: {layer.risk}
                      </div>
                    )}
                  </div>
                </FadeIn>
              );
            })}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={handleResults} disabled={assessed < totalCaps * 0.5} style={{ padding: "14px 28px", borderRadius: 8, border: "none", background: assessed >= totalCaps * 0.5 ? ELECTRIC : MUTED, color: "#fff", fontSize: 15, fontWeight: 600, cursor: assessed >= totalCaps * 0.5 ? "pointer" : "default", opacity: assessed >= totalCaps * 0.5 ? 1 : 0.5 }}>
                {assessed >= totalCaps * 0.5 ? `View My Stack Profile (${assessed}/${totalCaps}) →` : `Assess at least ${Math.ceil(totalCaps * 0.5)} capabilities (${assessed}/${totalCaps})`}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* RESULTS */}
      {phase === "results" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "48px 28px 80px" }}>
          <div style={WRAP}>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "40px 32px", textAlign: "center", marginBottom: 32 }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>{sv.name} CX Stack Maturity</span>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 48, fontWeight: 400, color: maturityPct >= 70 ? GREEN : maturityPct >= 40 ? AMBER : RED, margin: "8px 0 4px" }}>{maturityPct}%</h2>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>of {totalCaps} capabilities in place</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 20 }}>
                <div><span style={{ fontSize: 22, fontWeight: 700, color: GREEN }}>{haveCount}</span><div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Have</div></div>
                <div><span style={{ fontSize: 22, fontWeight: 700, color: AMBER }}>{plannedCount}</span><div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Planned</div></div>
                <div><span style={{ fontSize: 22, fontWeight: 700, color: RED }}>{needCount}</span><div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Need</div></div>
              </div>
            </div>

            {/* Per-layer results */}
            <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 16px" }}>Layer-by-Layer Maturity</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
              {sv.layers.map((layer, li) => {
                const have = layer.capabilities.filter((_, ci) => getStatus(li, ci) === "Have").length;
                const need = layer.capabilities.filter((_, ci) => getStatus(li, ci) === "Need").length;
                const pct = Math.round((have / layer.capabilities.length) * 100);
                return (
                  <div key={li} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>L{layer.layer}: {layer.name}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {need > 0 && <span style={{ fontSize: 10, color: RED, fontWeight: 600 }}>{need} gaps</span>}
                        <span style={{ fontSize: 13, fontWeight: 700, color: pct >= 80 ? GREEN : pct >= 50 ? AMBER : RED }}>{pct}%</span>
                      </div>
                    </div>
                    <div style={{ height: 6, background: `${BORDER}`, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: pct >= 80 ? GREEN : pct >= 50 ? AMBER : RED, borderRadius: 3 }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Critical gaps */}
            {needCount > 0 && (
              <div style={{ background: `${RED}08`, border: `1px solid ${RED}20`, borderRadius: 10, padding: "20px 22px", marginBottom: 32 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: RED, letterSpacing: 1, textTransform: "uppercase" }}>Critical Gaps ({needCount})</span>
                <p style={{ fontSize: 11, color: MUTED, margin: "4px 0 10px" }}>Capabilities marked as "Need" — these are the highest-priority investments for your {sv.name} CX stack.</p>
                {sv.layers.map((layer, li) => layer.capabilities.map((cap, ci) => getStatus(li, ci) === "Need" ? (
                  <p key={`${li}-${ci}`} style={{ fontSize: 12, color: NAVY, margin: "4px 0", paddingLeft: 12, borderLeft: `2px solid ${RED}30` }}><strong>L{layer.layer}:</strong> {cap}</p>
                ) : null))}
              </div>
            )}

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "36px 28px", textAlign: "center" }}>
              <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: "#fff", margin: "0 0 10px" }}>Ready to close the gaps?</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: "0 auto 24px", maxWidth: 440 }}>Your {sv.name} stack profile has been saved. Request a working session and we'll map your gaps to specific vendor capabilities, build an implementation sequence, and help you prioritize based on operational impact.</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "13px 24px", borderRadius: 8 }}>Request a Working Session</a>
                <a href="/vendors/ccaas" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 14, fontWeight: 500, padding: "13px 24px", borderRadius: 8 }}>Browse CCaaS Platforms →</a>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
