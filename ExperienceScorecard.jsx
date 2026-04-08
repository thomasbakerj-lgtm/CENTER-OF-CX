import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 860, margin: "0 auto", padding: "0 28px" };

function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

// Industry benchmarks — sourced from SQM Group, ICMI, Contact Babel, MetricNet
const METRICS = [
  { id: "csat", name: "CSAT Score", unit: "%", benchmark: 78, top: 88, direction: "higher", category: "Experience", hint: "Industry median 78%. Top quartile 88%+.", desc: "Customer satisfaction with resolved interactions" },
  { id: "nps", name: "Net Promoter Score", unit: "", benchmark: 32, top: 55, direction: "higher", category: "Experience", hint: "Industry median 32. Top quartile 55+.", desc: "Willingness to recommend based on service experience" },
  { id: "ces", name: "Customer Effort Score", unit: "/7", benchmark: 5.2, top: 6.1, direction: "higher", category: "Experience", hint: "Industry median 5.2/7. Top quartile 6.1+.", desc: "How easy the customer found the interaction" },
  { id: "fcr", name: "First Contact Resolution", unit: "%", benchmark: 72, top: 82, direction: "higher", category: "Efficiency", hint: "Industry median 72%. Top quartile 82%+.", desc: "Percentage of issues resolved on first contact" },
  { id: "aht", name: "Average Handle Time", unit: "sec", benchmark: 420, top: 340, direction: "lower", category: "Efficiency", hint: "Industry median 420s (7:00). Top quartile 340s (5:40).", desc: "Average duration of agent-handled interactions" },
  { id: "acw", name: "After-Call Work", unit: "sec", benchmark: 60, top: 35, direction: "lower", category: "Efficiency", hint: "Industry median 60s. Top quartile 35s.", desc: "Time spent on post-interaction wrap-up" },
  { id: "containment", name: "Self-Service Containment", unit: "%", benchmark: 25, top: 40, direction: "higher", category: "Automation", hint: "Industry median 25%. Top quartile 40%+.", desc: "Percentage of contacts fully resolved by automation" },
  { id: "transferRate", name: "Transfer Rate", unit: "%", benchmark: 15, top: 8, direction: "lower", category: "Efficiency", hint: "Industry median 15%. Top quartile 8%.", desc: "Percentage of interactions transferred to another agent" },
  { id: "abandonRate", name: "Abandon Rate", unit: "%", benchmark: 6, top: 3, direction: "lower", category: "Accessibility", hint: "Industry median 6%. Top quartile 3%.", desc: "Percentage of customers who hang up before reaching an agent" },
  { id: "costPerContact", name: "Cost per Contact", unit: "$", benchmark: 7.16, top: 4.50, direction: "lower", category: "Economics", hint: "Industry median $7.16. Top quartile $4.50.", desc: "Fully loaded cost per customer interaction" },
  { id: "attrition", name: "Agent Attrition Rate", unit: "%", benchmark: 35, top: 20, direction: "lower", category: "Workforce", hint: "Industry median 35%. Top quartile 20%.", desc: "Annual agent turnover rate" },
  { id: "occupancy", name: "Agent Occupancy", unit: "%", benchmark: 82, top: 78, direction: "lower", category: "Workforce", hint: "Industry median 82%. Optimal 78–82% (higher burns out agents).", desc: "Percentage of time agents spend handling contacts" },
];

const scoreMetric = (m, val) => {
  if (val === "" || val === null || val === undefined) return null;
  const v = parseFloat(val);
  if (isNaN(v)) return null;
  if (m.direction === "higher") {
    if (v >= m.top) return { grade: "A", color: GREEN, label: "Top Quartile", pct: 100 };
    if (v >= m.benchmark) { const pct = 50 + ((v - m.benchmark) / (m.top - m.benchmark)) * 50; return { grade: "B", color: ELECTRIC, label: "Above Median", pct: Math.min(90, pct) }; }
    const floor = m.benchmark * 0.6;
    if (v >= floor) { const pct = ((v - floor) / (m.benchmark - floor)) * 50; return { grade: "C", color: AMBER, label: "Below Median", pct: Math.max(10, pct) }; }
    return { grade: "D", color: RED, label: "Needs Attention", pct: 10 };
  } else {
    if (v <= m.top) return { grade: "A", color: GREEN, label: "Top Quartile", pct: 100 };
    if (v <= m.benchmark) { const pct = 50 + ((m.benchmark - v) / (m.benchmark - m.top)) * 50; return { grade: "B", color: ELECTRIC, label: "Above Median", pct: Math.min(90, pct) }; }
    const ceil = m.benchmark * 1.5;
    if (v <= ceil) { const pct = 50 - ((v - m.benchmark) / (ceil - m.benchmark)) * 40; return { grade: "C", color: AMBER, label: "Below Median", pct: Math.max(10, pct) }; }
    return { grade: "D", color: RED, label: "Needs Attention", pct: 10 };
  }
};

export default function ExperienceScorecard() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [values, setValues] = useState({});

  useEffect(() => { window.scrollTo(0, 0); }, [phase]);

  const setVal = (id, v) => setValues(prev => ({ ...prev, [id]: v }));
  const filledCount = METRICS.filter(m => values[m.id] !== undefined && values[m.id] !== "").length;
  const scored = METRICS.map(m => ({ ...m, val: values[m.id], result: scoreMetric(m, values[m.id]) })).filter(m => m.result);
  const gradePoints = { A: 4, B: 3, C: 2, D: 1 };
  const overallGPA = scored.length > 0 ? scored.reduce((a, m) => a + gradePoints[m.result.grade], 0) / scored.length : 0;
  const overallGrade = overallGPA >= 3.5 ? "A" : overallGPA >= 2.5 ? "B" : overallGPA >= 1.5 ? "C" : "D";
  const gradeColor = { A: GREEN, B: ELECTRIC, C: AMBER, D: RED };

  const handleGate = async () => {
    if (!email.includes("@")) return;
    setSending(true);
    try { await fetch("https://formspree.io/f/xnjolywk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "Experience Scorecard", _subject: "Experience Scorecard Access" }) }); } catch (e) {}
    setSending(false);
    setPhase("input");
  };

  const handleResults = async () => {
    const metricResults = scored.map(m => `${m.name}: ${m.val} (${m.result.grade})`).join(" | ");
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "Experience Scorecard", overallGrade, metricsScored: scored.length, results: metricResults, _subject: `Experience Scorecard: Grade ${overallGrade} — ${company || name || email}` }) }); } catch (e) {}
    setPhase("results");
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}@media(max-width:700px){.metric-grid{grid-template-columns:1fr!important}}`}</style>

      <nav style={{ background: DEEP, padding: "16px 0" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
          <a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a>
        </div>
      </nav>

      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", padding: "80px 28px" }}>
          <div style={{ ...WRAP, textAlign: "center" }}>
            <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Framework & Benchmark</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "12px 0 16px" }}>Experience Scorecard</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 auto 36px", maxWidth: 500 }}>Enter your contact center metrics and instantly see how you compare against industry benchmarks. 12 metrics across experience, efficiency, automation, economics, and workforce. Every metric graded A through D against validated industry medians.</p>
            <div style={{ maxWidth: 400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Work email *" style={{ padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, outline: "none" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={{ flex: 1, padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none" }} />
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company" style={{ flex: 1, padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none" }} />
              </div>
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "16px", borderRadius: 8, border: "none", background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: sending ? 0.6 : 1, marginTop: 4 }}>{sending ? "Starting..." : "Start Scorecard →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "input" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "48px 28px 80px" }}>
          <div style={WRAP}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>Enter your metrics</h2>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 32 }}>Fill in what you know. Leave blank any metrics you don't track — we'll score what you provide. The more you enter, the more complete your scorecard.</p>

            {["Experience", "Efficiency", "Automation", "Accessibility", "Economics", "Workforce"].map(cat => {
              const catMetrics = METRICS.filter(m => m.category === cat);
              if (catMetrics.length === 0) return null;
              return (
                <div key={cat} style={{ marginBottom: 28 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>{cat}</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="metric-grid">
                    {catMetrics.map(m => (
                      <div key={m.id} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "16px 18px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <label style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{m.name}</label>
                          <span style={{ fontSize: 10, color: MUTED }}>{m.unit}</span>
                        </div>
                        <p style={{ fontSize: 11, color: MUTED, margin: "0 0 8px" }}>{m.desc}</p>
                        <input type="number" step="any" value={values[m.id] || ""} onChange={e => setVal(m.id, e.target.value)} placeholder={`Benchmark: ${m.benchmark}${m.unit}`}
                          style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, background: WARM, color: NAVY, outline: "none" }} />
                        <div style={{ fontSize: 10, color: MUTED, marginTop: 4 }}>{m.hint}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={handleResults} disabled={filledCount < 3} style={{ padding: "14px 28px", borderRadius: 8, border: "none", background: filledCount >= 3 ? ELECTRIC : MUTED, color: "#fff", fontSize: 15, fontWeight: 600, cursor: filledCount >= 3 ? "pointer" : "default", opacity: filledCount >= 3 ? 1 : 0.5 }}>
                {filledCount >= 3 ? `Score My ${filledCount} Metrics →` : `Enter at least 3 metrics (${filledCount}/3)`}
              </button>
            </div>
          </div>
        </section>
      )}

      {phase === "results" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "48px 28px 80px" }}>
          <div style={WRAP}>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "40px 32px", textAlign: "center", marginBottom: 32 }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Your Overall Performance Grade</span>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 64, fontWeight: 400, color: gradeColor[overallGrade], margin: "8px 0 4px" }}>{overallGrade}</h2>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{scored.length} metrics scored against industry benchmarks</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 16 }}>
                {["A", "B", "C", "D"].map(g => {
                  const count = scored.filter(m => m.result.grade === g).length;
                  return count > 0 ? <div key={g} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: gradeColor[g] }}>{count}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Grade {g}</div>
                  </div> : null;
                })}
              </div>
            </div>

            <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 20px" }}>Metric-by-Metric Results</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {scored.sort((a, b) => gradePoints[a.result.grade] - gradePoints[b.result.grade]).map((m, i) => (
                <div key={i} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{m.name}</span>
                      <span style={{ fontSize: 11, color: MUTED, marginLeft: 8 }}>{m.category}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 13, color: SLATE }}>You: <strong>{m.val}{m.unit}</strong></span>
                      <span style={{ fontSize: 11, color: MUTED }}>Median: {m.benchmark}{m.unit}</span>
                      <span style={{ fontSize: 16, fontWeight: 700, color: m.result.color, background: `${m.result.color}12`, width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>{m.result.grade}</span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: `${m.result.color}15`, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${m.result.pct}%`, background: m.result.color, borderRadius: 3, transition: "width 0.8s ease" }} />
                  </div>
                  <div style={{ fontSize: 11, color: m.result.color, fontWeight: 600, marginTop: 4 }}>{m.result.label}</div>
                </div>
              ))}
            </div>

            {scored.filter(m => m.result.grade === "D" || m.result.grade === "C").length > 0 && (
              <div style={{ background: `${AMBER}08`, border: `1px solid ${AMBER}20`, borderRadius: 10, padding: "20px 22px", marginBottom: 32 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: AMBER, letterSpacing: 1, textTransform: "uppercase" }}>Improvement Priorities</span>
                <div style={{ marginTop: 8 }}>
                  {scored.filter(m => m.result.grade === "D" || m.result.grade === "C").map((m, i) => (
                    <p key={i} style={{ fontSize: 13, color: NAVY, margin: "4px 0", lineHeight: 1.5 }}>
                      <strong>{m.name}</strong> ({m.val}{m.unit} vs {m.benchmark}{m.unit} median) — closing this gap to median would represent measurable improvement in {m.category.toLowerCase()}.
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "36px 28px", textAlign: "center" }}>
              <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: "#fff", margin: "0 0 10px" }}>Want deeper analysis?</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: "0 auto 24px", maxWidth: 440 }}>Your scorecard has been saved. Request a working session and we'll benchmark your metrics against your specific vertical, identify the highest-leverage improvements, and connect them to vendor capabilities.</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "13px 24px", borderRadius: 8 }}>Request a Working Session</a>
                <a href="/tco-calculator" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 14, fontWeight: 500, padding: "13px 24px", borderRadius: 8 }}>Try the TCO Calculator →</a>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
