import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const DEFAULT_DATA = [
  { call: "Call 1", e1: 88, e2: 82, e3: 85, e4: 91 },
  { call: "Call 2", e1: 72, e2: 78, e3: 70, e4: 75 },
  { call: "Call 3", e1: 95, e2: 92, e3: 96, e4: 88 },
  { call: "Call 4", e1: 65, e2: 70, e3: 62, e4: 74 },
  { call: "Call 5", e1: 80, e2: 85, e3: 78, e4: 82 },
  { call: "Call 6", e1: 55, e2: 68, e3: 60, e4: 58 },
  { call: "Call 7", e1: 90, e2: 87, e3: 92, e4: 85 },
  { call: "Call 8", e1: 78, e2: 72, e3: 80, e4: 76 },
];

export default function CalibrationDriftChecker() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [evals, setEvals] = useState(["Evaluator A", "Evaluator B", "Evaluator C", "Evaluator D"]);
  const [data, setData] = useState(DEFAULT_DATA);
  useEffect(() => { window.scrollTo(0, 0); }, [phase]);

  const handleGate = async () => {
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, tool: "Calibration Drift Checker", _subject: "Calibration Drift Checker Access" }) }); } catch (e) {}
    setSending(false); setPhase("calc");
  };

  const updateScore = (ri, field, val) => setData(prev => prev.map((r, i) => i === ri ? { ...r, [field]: Number(val) || 0 } : r));
  const updateCall = (ri, val) => setData(prev => prev.map((r, i) => i === ri ? { ...r, call: val } : r));
  const addRow = () => setData(prev => [...prev, { call: `Call ${prev.length + 1}`, e1: 80, e2: 80, e3: 80, e4: 80 }]);
  const removeRow = (ri) => setData(prev => prev.filter((_, i) => i !== ri));

  const evalKeys = ["e1", "e2", "e3", "e4"];

  // Per-evaluator stats
  const evalStats = evalKeys.map((ek, ei) => {
    const scores = data.map(d => d[ek]);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const min = Math.min(...scores);
    const max = Math.max(...scores);
    return { name: evals[ei], key: ek, avg, min, max, scores };
  });

  // Grand average per call
  const callAvgs = data.map(d => {
    const vals = evalKeys.map(k => d[k]);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  });

  // Overall grand average
  const grandAvg = evalStats.reduce((a, e) => a + e.avg, 0) / evalStats.length;

  // Per-evaluator bias (avg vs grand avg)
  const evalBias = evalStats.map(e => ({ ...e, bias: e.avg - grandAvg }));

  // Per-call range (max - min across evaluators)
  const callRanges = data.map((d, i) => {
    const vals = evalKeys.map(k => d[k]);
    const range = Math.max(...vals) - Math.min(...vals);
    return { call: d.call, range, avg: callAvgs[i], vals };
  });
  const avgRange = callRanges.reduce((a, c) => a + c.range, 0) / callRanges.length;

  // Inter-rater reliability (simplified: 1 - avgRange/100)
  const reliability = Math.max(0, Math.min(100, (1 - avgRange / 50) * 100));
  const reliabilityColor = reliability >= 85 ? GREEN : reliability >= 70 ? AMBER : RED;

  // Worst disagreements
  const worstCalls = [...callRanges].sort((a, b) => b.range - a.range).slice(0, 3);

  // Most biased evaluators
  const mostBiased = [...evalBias].sort((a, b) => Math.abs(b.bias) - Math.abs(a.bias));

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.pg{grid-template-columns:1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "80px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 520 }}>
            <span style={{ color: AMBER, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Performance + Quality</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>Calibration Drift Checker</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 32 }}>Enter QA scores from multiple evaluators on the same set of calls. See inter-rater reliability, evaluator bias, and the calls that generate the most disagreement. Make calibration sessions data-driven.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "14px", fontSize: 15, fontWeight: 600, background: email.includes("@") ? AMBER : SLATE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: email.includes("@") ? 1 : 0.5 }}>{sending ? "Loading..." : "Launch Checker →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "calc" && (<>
        <section style={{ background: WARM, padding: "40px 28px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={WRAP}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>Calibration Drift Checker</h2>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 16 }}>Enter scores (0-100) from each evaluator for the same calls. Edit evaluator names, add or remove rows.</p>

            {/* Evaluator names */}
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 1fr 1fr 40px", gap: 4, marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, padding: "4px 8px" }}>Call</span>
              {evals.map((ev, i) => (
                <input key={i} type="text" value={ev} onChange={e => setEvals(prev => prev.map((v, j) => j === i ? e.target.value : v))}
                  style={{ padding: "4px 8px", fontSize: 11, fontWeight: 600, border: `1px solid ${BORDER}`, borderRadius: 4, textAlign: "center", background: "#fff", color: NAVY }} />
              ))}
              <span />
            </div>

            {/* Data rows */}
            {data.map((d, ri) => {
              const vals = evalKeys.map(k => d[k]);
              const range = Math.max(...vals) - Math.min(...vals);
              return (
                <div key={ri} style={{ display: "grid", gridTemplateColumns: "100px 1fr 1fr 1fr 1fr 40px", gap: 4, marginBottom: 2 }}>
                  <input type="text" value={d.call} onChange={e => updateCall(ri, e.target.value)} style={{ padding: "6px 8px", fontSize: 12, border: `1px solid ${BORDER}`, borderRadius: 4, background: "#fff" }} />
                  {evalKeys.map(ek => (
                    <input key={ek} type="number" value={d[ek]} onChange={e => updateScore(ri, ek, e.target.value)}
                      style={{ padding: "6px 8px", fontSize: 13, border: `1px solid ${range > 15 ? RED + "60" : BORDER}`, borderRadius: 4, textAlign: "center", background: range > 15 ? `${RED}06` : "#fff", fontWeight: 500 }} />
                  ))}
                  <button onClick={() => removeRow(ri)} style={{ fontSize: 14, color: MUTED, background: "none", border: "none", cursor: "pointer" }}>×</button>
                </div>
              );
            })}
            <button onClick={addRow} style={{ fontSize: 12, color: ELECTRIC, background: "none", border: "none", cursor: "pointer", marginTop: 8, fontWeight: 600 }}>+ Add call</button>
          </div>
        </section>

        <section style={{ background: "#fff", padding: "40px 28px" }}>
          <div style={WRAP}>
            {/* Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 28 }} className="pg">
              <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 10, padding: "24px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: reliabilityColor, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Inter-Rater Reliability</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 38, color: "#fff" }}>{reliability.toFixed(0)}%</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{reliability >= 85 ? "Calibrated" : reliability >= 70 ? "Needs attention" : "Significant drift"}</div>
              </div>
              <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Average Score Range</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 38, color: avgRange > 15 ? RED : avgRange > 10 ? AMBER : GREEN }}>{avgRange.toFixed(1)}<span style={{ fontSize: 16, color: MUTED }}>pts</span></div>
                <div style={{ fontSize: 11, color: MUTED }}>Avg max-min spread per call</div>
              </div>
              <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Grand Average</div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 38, color: ELECTRIC }}>{grandAvg.toFixed(1)}</div>
                <div style={{ fontSize: 11, color: MUTED }}>Across all evaluators</div>
              </div>
            </div>

            {/* Evaluator bias */}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Evaluator Bias (vs Grand Average)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 28 }} className="pg">
              {mostBiased.map((e, i) => {
                const biasColor = Math.abs(e.bias) > 5 ? RED : Math.abs(e.bias) > 3 ? AMBER : GREEN;
                return (
                  <div key={i} style={{ background: WARM, border: `1px solid ${biasColor}30`, borderRadius: 10, padding: "16px", textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 6 }}>{e.name}</div>
                    <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: biasColor }}>
                      {e.bias > 0 ? "+" : ""}{e.bias.toFixed(1)}
                    </div>
                    <div style={{ fontSize: 11, color: MUTED }}>Avg: {e.avg.toFixed(1)}</div>
                    <div style={{ fontSize: 11, color: biasColor, marginTop: 4, fontWeight: 600 }}>
                      {Math.abs(e.bias) > 5 ? (e.bias > 0 ? "Scores high" : "Scores low") : Math.abs(e.bias) > 3 ? "Slight bias" : "Well calibrated"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Worst disagreements */}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Biggest Disagreements (Use These for Calibration)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 28 }}>
              {worstCalls.map((c, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr 80px", gap: 12, alignItems: "center", padding: "12px 16px", background: i === 0 ? `${RED}06` : WARM, borderRadius: 8, border: `1px solid ${i === 0 ? RED + "30" : BORDER}` }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{c.call}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {c.vals.map((v, vi) => (
                      <div key={vi} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: MUTED }}>{evals[vi]?.split(" ")[1] || `E${vi + 1}`}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: v === Math.max(...c.vals) ? RED : v === Math.min(...c.vals) ? ELECTRIC : NAVY }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: c.range > 15 ? RED : AMBER }}>{c.range}pt</div>
                    <div style={{ fontSize: 10, color: MUTED }}>spread</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Visual: evaluator comparison */}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Score Distribution by Evaluator</h3>
            <div style={{ marginBottom: 28 }}>
              {evalStats.map((e, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "120px 1fr 60px", gap: 12, alignItems: "center", padding: "8px 0", borderBottom: i < evalStats.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{e.name}</span>
                  <div style={{ position: "relative", height: 20 }}>
                    <div style={{ position: "absolute", left: `${e.min}%`, right: `${100 - e.max}%`, height: 6, top: 7, background: `${ELECTRIC}25`, borderRadius: 3 }} />
                    <div style={{ position: "absolute", left: `${e.avg}%`, top: 2, width: 3, height: 16, background: ELECTRIC, borderRadius: 2, transform: "translateX(-50%)" }} />
                    <div style={{ position: "absolute", left: `${grandAvg}%`, top: 0, width: 1, height: 20, background: MUTED, opacity: 0.4, transform: "translateX(-50%)" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC, textAlign: "right" }}>{e.avg.toFixed(1)}</span>
                </div>
              ))}
              <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Blue bar: score range (min-max). Blue line: evaluator average. Gray line: grand average.</div>
            </div>

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>
                <strong style={{ color: "#fff" }}>Calibration is the foundation of QA credibility.</strong> When evaluators score the same call 15+ points apart, agents lose trust in the QA process. Target: inter-rater reliability above 85% and average score range below 10 points. Use the calls with the highest disagreement as the focus for your next calibration session. Review them together, discuss the scoring rationale, and align on criteria interpretation before evaluating the broader population.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/tools/qa-scorecard" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>QA Scorecard Builder →</a>
              <a href="/tools/agent-experience" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Agent Experience Diagnostic →</a>
              <a href="/how-to-choose" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Explore More Tools</a>
            </div>
          </div>
        </section>
      </>)}
    </div>
  );
}
