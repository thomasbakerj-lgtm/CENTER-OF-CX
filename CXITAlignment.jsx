import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 860, margin: "0 auto", padding: "0 28px" };

function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const AREAS = [
  { id: "strategy", name: "Strategy Alignment", color: ELECTRIC, pairs: [
    { cx: "CX has a documented strategy with measurable outcomes.", it: "IT has a technology roadmap that maps to the CX strategy." },
    { cx: "CX priorities are clearly communicated to IT leadership.", it: "IT understands which CX initiatives require technology investment." },
    { cx: "CX leadership participates in technology selection decisions.", it: "IT involves CX stakeholders in architecture and vendor decisions." },
  ]},
  { id: "data", name: "Data & Integration", color: "#10B981", pairs: [
    { cx: "CX teams have access to the customer data they need for decisions.", it: "IT provides reliable, governed data pipelines to CX systems." },
    { cx: "Customer journey data is connected across channels and touchpoints.", it: "Integration architecture supports cross-system data flow." },
    { cx: "CX can measure outcomes (CSAT, FCR, effort) with trusted data.", it: "IT maintains data quality standards and monitoring for CX systems." },
  ]},
  { id: "platforms", name: "Platform & Tooling", color: "#7C3AED", pairs: [
    { cx: "CX teams have the platforms they need to execute their strategy.", it: "IT can support, secure, and maintain the platforms CX depends on." },
    { cx: "New CX tools can be evaluated and deployed without 12-month cycles.", it: "IT has a process for evaluating and onboarding new CX technology." },
    { cx: "Agent-facing tools are effective and reduce friction.", it: "IT provides reliable desktop environments with acceptable performance." },
  ]},
  { id: "ai", name: "AI & Automation", color: "#F59E0B", pairs: [
    { cx: "CX has identified which interactions should be automated.", it: "IT can assess whether the data and infrastructure support AI deployment." },
    { cx: "CX defines the quality and governance standards for AI interactions.", it: "IT implements AI guardrails, testing, and monitoring." },
    { cx: "CX measures AI performance against customer experience outcomes.", it: "IT manages AI model performance, accuracy, and scalability." },
  ]},
  { id: "governance", name: "Governance & Ownership", color: "#EF4444", pairs: [
    { cx: "CX has defined ownership for experience outcomes across channels.", it: "IT has defined ownership for platform reliability and integration health." },
    { cx: "CX and IT have a shared governance model for technology decisions.", it: "IT and CX jointly own the escalation path when systems impact customers." },
    { cx: "Budget decisions for CX technology involve both CX and IT input.", it: "IT can articulate the cost of supporting CX technology requests." },
  ]},
];

const GAP_LEVELS = [
  { min: 0, max: 0.8, label: "Aligned", color: GREEN, desc: "CX vision and IT execution are well matched. Focus on maintaining alignment as both functions evolve." },
  { min: 0.8, max: 1.5, label: "Minor Gaps", color: ELECTRIC, desc: "Small misalignments exist but are manageable. Address them through regular cross-functional planning sessions." },
  { min: 1.5, max: 2.5, label: "Significant Gaps", color: AMBER, desc: "Material disconnects between CX ambition and IT capability. These gaps are creating friction, delays, or suboptimal outcomes." },
  { min: 2.5, max: 5, label: "Critical Misalignment", color: RED, desc: "CX and IT are operating with fundamentally different priorities. Technology is either blocking CX progress or CX is creating ungoverned shadow IT." },
];

const getGapLevel = (gap) => GAP_LEVELS.find(l => gap >= l.min && gap < l.max) || GAP_LEVELS[GAP_LEVELS.length - 1];

export default function CXITAlignment() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [currentArea, setCurrentArea] = useState(0);
  const [scores, setScores] = useState({});

  useEffect(() => { window.scrollTo(0, 0); }, [phase]);

  const setScore = (areaId, pairIdx, side, val) => setScores(prev => ({ ...prev, [`${areaId}-${pairIdx}-${side}`]: val }));
  const getScore = (areaId, pairIdx, side) => scores[`${areaId}-${pairIdx}-${side}`] || 0;

  const areaGap = (areaId) => {
    const area = AREAS.find(a => a.id === areaId);
    const gaps = area.pairs.map((_, i) => {
      const cx = getScore(areaId, i, "cx");
      const it = getScore(areaId, i, "it");
      return cx && it ? Math.abs(cx - it) : null;
    }).filter(g => g !== null);
    return gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
  };

  const areaAvg = (areaId, side) => {
    const area = AREAS.find(a => a.id === areaId);
    const vals = area.pairs.map((_, i) => getScore(areaId, i, side)).filter(v => v > 0);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const areaComplete = (areaId) => {
    const area = AREAS.find(a => a.id === areaId);
    return area.pairs.every((_, i) => getScore(areaId, i, "cx") > 0 && getScore(areaId, i, "it") > 0);
  };

  const allComplete = AREAS.every(a => areaComplete(a.id));
  const overallGap = AREAS.reduce((a, ar) => a + areaGap(ar.id), 0) / AREAS.length;
  const gapLevel = getGapLevel(overallGap);

  const handleGate = async () => {
    if (!email.includes("@")) return;
    setSending(true);
    try { await fetch("https://formspree.io/f/xeevgdge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "CX + IT Alignment Framework", _subject: "CX+IT Alignment Access" }) }); } catch (e) {}
    setSending(false);
    setPhase("assess");
  };

  const handleResults = async () => {
    const dimResults = AREAS.map(a => `${a.name}: CX=${areaAvg(a.id,"cx").toFixed(1)} IT=${areaAvg(a.id,"it").toFixed(1)} Gap=${areaGap(a.id).toFixed(1)}`).join(" | ");
    try { await fetch("https://formspree.io/f/xeevgdge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "CX + IT Alignment", overallGap: overallGap.toFixed(2), gapLevel: gapLevel.label, dimensions: dimResults, _subject: `CX+IT Alignment: ${gapLevel.label} (Gap ${overallGap.toFixed(1)}) — ${company || name || email}` }) }); } catch (e) {}
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
          <div style={{ ...WRAP, textAlign: "center" }}>
            <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Framework & Template</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "12px 0 16px" }}>CX + IT Alignment Framework</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 auto 36px", maxWidth: 520 }}>Rate 15 paired statements — one from the CX perspective, one from IT — across strategy, data, platforms, AI, and governance. The gap between scores reveals where misalignment creates friction, delays, and wasted spend.</p>
            <div style={{ maxWidth: 400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Work email *" style={{ padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, outline: "none" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={{ flex: 1, padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none" }} />
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company" style={{ flex: 1, padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none" }} />
              </div>
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "16px", borderRadius: 8, border: "none", background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: sending ? 0.6 : 1, marginTop: 4 }}>{sending ? "Starting..." : "Start Assessment →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "assess" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "40px 28px 80px" }}>
          <div style={WRAP}>
            <div style={{ display: "flex", gap: 4, marginBottom: 32 }}>
              {AREAS.map((a, i) => (
                <div key={i} onClick={() => setCurrentArea(i)} style={{ flex: 1, cursor: "pointer" }}>
                  <div style={{ height: 4, borderRadius: 2, background: areaComplete(a.id) ? a.color : i === currentArea ? `${a.color}60` : BORDER }} />
                  <div style={{ fontSize: 9, color: i === currentArea ? a.color : MUTED, fontWeight: i === currentArea ? 700 : 400, marginTop: 6, textAlign: "center" }}>{a.name.split(" ")[0]}</div>
                </div>
              ))}
            </div>

            {(() => {
              const area = AREAS[currentArea];
              return (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 4, height: 24, borderRadius: 2, background: area.color }} />
                    <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: NAVY, margin: 0 }}>{area.name}</h2>
                    <span style={{ fontSize: 11, color: MUTED }}>({currentArea + 1} of {AREAS.length})</span>
                  </div>
                  <p style={{ fontSize: 13, color: MUTED, marginBottom: 28 }}>Rate each paired statement 1–5. The left column is the CX perspective. The right column is the IT perspective. Gaps between scores reveal misalignment.</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {area.pairs.map((pair, pi) => {
                      const cxVal = getScore(area.id, pi, "cx");
                      const itVal = getScore(area.id, pi, "it");
                      const gap = cxVal && itVal ? Math.abs(cxVal - itVal) : null;
                      const gapColor = gap === null ? BORDER : gap <= 1 ? GREEN : gap <= 2 ? AMBER : RED;
                      return (
                        <div key={pi} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", overflow: "hidden" }}>
                          {gap !== null && <div style={{ height: 3, background: gapColor, margin: "-20px -20px 16px", borderRadius: "10px 10px 0 0" }} />}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: 12 }}>
                            {/* CX side */}
                            <div>
                              <div style={{ fontSize: 9, fontWeight: 700, color: ELECTRIC, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>CX Perspective</div>
                              <p style={{ fontSize: 12.5, color: NAVY, lineHeight: 1.5, margin: "0 0 10px", fontWeight: 500 }}>{pair.cx}</p>
                              <div style={{ display: "flex", gap: 4 }}>
                                {[1,2,3,4,5].map(v => (
                                  <button key={v} onClick={() => setScore(area.id, pi, "cx", v)} style={{ width: 36, height: 32, borderRadius: 5, border: cxVal === v ? `2px solid ${ELECTRIC}` : `1px solid ${BORDER}`, background: cxVal === v ? `${ELECTRIC}12` : "#fff", color: cxVal === v ? ELECTRIC : MUTED, fontSize: 13, fontWeight: cxVal === v ? 700 : 400, cursor: "pointer" }}>{v}</button>
                                ))}
                              </div>
                            </div>
                            {/* Gap indicator */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {gap !== null ? (
                                <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${gapColor}15`, border: `2px solid ${gapColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: gapColor }}>{gap}</div>
                              ) : (
                                <div style={{ fontSize: 10, color: MUTED }}>vs</div>
                              )}
                            </div>
                            {/* IT side */}
                            <div>
                              <div style={{ fontSize: 9, fontWeight: 700, color: "#7C3AED", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>IT Perspective</div>
                              <p style={{ fontSize: 12.5, color: NAVY, lineHeight: 1.5, margin: "0 0 10px", fontWeight: 500 }}>{pair.it}</p>
                              <div style={{ display: "flex", gap: 4 }}>
                                {[1,2,3,4,5].map(v => (
                                  <button key={v} onClick={() => setScore(area.id, pi, "it", v)} style={{ width: 36, height: 32, borderRadius: 5, border: itVal === v ? `2px solid #7C3AED` : `1px solid ${BORDER}`, background: itVal === v ? `#7C3AED12` : "#fff", color: itVal === v ? "#7C3AED" : MUTED, fontSize: 13, fontWeight: itVal === v ? 700 : 400, cursor: "pointer" }}>{v}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
                    <button onClick={() => setCurrentArea(Math.max(0, currentArea - 1))} disabled={currentArea === 0} style={{ padding: "12px 24px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: currentArea === 0 ? MUTED : NAVY, fontSize: 14, fontWeight: 500, cursor: currentArea === 0 ? "default" : "pointer" }}>← Previous</button>
                    {currentArea < AREAS.length - 1 ? (
                      <button onClick={() => setCurrentArea(currentArea + 1)} style={{ padding: "12px 24px", borderRadius: 8, border: "none", background: area.color, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Next: {AREAS[currentArea + 1].name.split(" &")[0].split(" ")[0]} →</button>
                    ) : (
                      <button onClick={handleResults} disabled={!allComplete} style={{ padding: "12px 28px", borderRadius: 8, border: "none", background: allComplete ? GREEN : MUTED, color: "#fff", fontSize: 14, fontWeight: 600, cursor: allComplete ? "pointer" : "default", opacity: allComplete ? 1 : 0.5 }}>
                        {allComplete ? "View Alignment Results →" : `${AREAS.filter(a => areaComplete(a.id)).length}/${AREAS.length} areas complete`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {phase === "results" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "48px 28px 80px" }}>
          <div style={WRAP}>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "40px 32px", textAlign: "center", marginBottom: 32 }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>CX + IT Alignment Status</span>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 36, fontWeight: 400, color: gapLevel.color, margin: "8px 0 4px" }}>{gapLevel.label}</h2>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>Average alignment gap: {overallGap.toFixed(1)} points</div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>{gapLevel.desc}</p>
            </div>

            <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 20px" }}>Alignment by Area</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {AREAS.map((a, i) => {
                const cxAvg = areaAvg(a.id, "cx");
                const itAvg = areaAvg(a.id, "it");
                const gap = areaGap(a.id);
                const gl = getGapLevel(gap);
                return (
                  <div key={i} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 22px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 4, height: 20, borderRadius: 2, background: a.color }} />
                        <span style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{a.name}</span>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: gl.color, background: `${gl.color}12`, padding: "2px 8px", borderRadius: 4 }}>{gl.label} (gap {gap.toFixed(1)})</span>
                    </div>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: MUTED, marginBottom: 3 }}>
                          <span>CX: {cxAvg.toFixed(1)}</span><span>IT: {itAvg.toFixed(1)}</span>
                        </div>
                        <div style={{ position: "relative", height: 8, background: `${BORDER}`, borderRadius: 4 }}>
                          <div style={{ position: "absolute", left: `${((cxAvg - 1) / 4) * 100}%`, top: -2, width: 12, height: 12, borderRadius: "50%", background: ELECTRIC, border: "2px solid #fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                          <div style={{ position: "absolute", left: `${((itAvg - 1) / 4) * 100}%`, top: -2, width: 12, height: 12, borderRadius: "50%", background: "#7C3AED", border: "2px solid #fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: MUTED, marginTop: 4 }}>
                          <span style={{ color: ELECTRIC, fontWeight: 600 }}>● CX</span><span style={{ color: "#7C3AED", fontWeight: 600 }}>● IT</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Biggest gaps */}
            {(() => {
              const sorted = [...AREAS].sort((a, b) => areaGap(b.id) - areaGap(a.id));
              const worst = sorted[0];
              const best = sorted[sorted.length - 1];
              return (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
                  <div style={{ background: `${RED}08`, border: `1px solid ${RED}20`, borderRadius: 10, padding: "20px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: RED, letterSpacing: 1, textTransform: "uppercase" }}>Largest Gap</span>
                    <h4 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "6px 0 2px" }}>{worst.name}</h4>
                    <span style={{ fontSize: 13, color: MUTED }}>Gap: {areaGap(worst.id).toFixed(1)} — CX {areaAvg(worst.id, "cx").toFixed(1)} vs IT {areaAvg(worst.id, "it").toFixed(1)}</span>
                  </div>
                  <div style={{ background: `${GREEN}08`, border: `1px solid ${GREEN}20`, borderRadius: 10, padding: "20px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: GREEN, letterSpacing: 1, textTransform: "uppercase" }}>Most Aligned</span>
                    <h4 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "6px 0 2px" }}>{best.name}</h4>
                    <span style={{ fontSize: 13, color: MUTED }}>Gap: {areaGap(best.id).toFixed(1)} — CX {areaAvg(best.id, "cx").toFixed(1)} vs IT {areaAvg(best.id, "it").toFixed(1)}</span>
                  </div>
                </div>
              );
            })()}

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "36px 28px", textAlign: "center" }}>
              <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: "#fff", margin: "0 0 10px" }}>Ready to close the alignment gaps?</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: "0 auto 24px", maxWidth: 440 }}>Your alignment profile has been saved. Request a working session and we'll help you build a joint CX-IT governance model, prioritize the gaps, and map technology decisions to shared outcomes.</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "13px 24px", borderRadius: 8 }}>Request a Working Session</a>
                <a href="/tools/governance-model" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 14, fontWeight: 500, padding: "13px 24px", borderRadius: 8 }}>Governance & Operating Model →</a>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
