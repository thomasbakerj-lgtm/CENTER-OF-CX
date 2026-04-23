import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const INTERVALS = ["6:00","6:30","7:00","7:30","8:00","8:30","9:00","9:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00"];

const CHANNEL_DEFAULTS = {
  voice: { label: "Voice", data: [18,22,35,52,68,82,95,98,92,88,85,78,72,75,80,85,78,70,62,55,48,42,38,32,28,24,20,16,12,8,5] },
  chat: { label: "Chat", data: [5,8,12,18,25,30,38,42,40,38,35,32,28,30,32,35,30,25,22,20,18,15,12,10,8,6,5,4,3,2,1] },
  email: { label: "Email", data: [8,10,12,14,16,18,20,20,18,16,15,14,12,12,14,16,14,12,10,8,8,6,5,4,4,3,2,2,1,1,0] },
};

export default function ForecastAccuracyTracker() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [channel, setChannel] = useState("voice");
  const [variance, setVariance] = useState(8);
  const [rows, setRows] = useState(() => {
    const base = CHANNEL_DEFAULTS.voice.data;
    return INTERVALS.map((t, i) => ({
      interval: t,
      forecast: base[i],
      actual: Math.round(base[i] * (1 + (Math.random() * 0.16 - 0.08))),
    }));
  });

  useEffect(() => { window.scrollTo(0, 0); }, [phase]);

  const applyChannel = (ch) => {
    setChannel(ch);
    const base = CHANNEL_DEFAULTS[ch].data;
    const v = variance / 100;
    setRows(INTERVALS.map((t, i) => ({
      interval: t,
      forecast: base[i],
      actual: Math.max(0, Math.round(base[i] * (1 + (Math.random() * v * 2 - v)))),
    })));
  };

  const randomize = () => {
    const base = CHANNEL_DEFAULTS[channel].data;
    const v = variance / 100;
    setRows(INTERVALS.map((t, i) => ({
      interval: t,
      forecast: base[i],
      actual: Math.max(0, Math.round(base[i] * (1 + (Math.random() * v * 2 - v)))),
    })));
  };

  const updateRow = (i, field, val) => {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: Number(val) || 0 } : r));
  };

  const handleGate = async () => {
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, tool: "Forecast Accuracy Tracker", _subject: "Forecast Accuracy Tracker Access" }) }); } catch (e) {}
    setSending(false); setPhase("calc");
  };

  // Metrics
  const totalForecast = rows.reduce((a, r) => a + r.forecast, 0);
  const totalActual = rows.reduce((a, r) => a + r.actual, 0);
  const overallAccuracy = totalForecast > 0 ? (1 - Math.abs(totalActual - totalForecast) / totalForecast) * 100 : 0;
  const mape = rows.filter(r => r.actual > 0).length > 0
    ? (rows.filter(r => r.actual > 0).reduce((a, r) => a + Math.abs(r.actual - r.forecast) / Math.max(r.actual, 1), 0) / rows.filter(r => r.actual > 0).length) * 100 : 0;
  const bias = totalForecast > 0 ? ((totalActual - totalForecast) / totalForecast) * 100 : 0;

  const worstIntervals = [...rows].filter(r => r.forecast > 0).sort((a, b) => {
    const aErr = Math.abs(a.actual - a.forecast) / Math.max(a.forecast, 1);
    const bErr = Math.abs(b.actual - b.forecast) / Math.max(b.forecast, 1);
    return bErr - aErr;
  }).slice(0, 5);

  const accColor = overallAccuracy >= 95 ? GREEN : overallAccuracy >= 90 ? AMBER : RED;
  const biasLabel = bias > 3 ? "Under-forecasting (actual > forecast)" : bias < -3 ? "Over-forecasting (forecast > actual)" : "Well calibrated";

  // Chart
  const maxVal = Math.max(...rows.map(r => Math.max(r.forecast, r.actual)), 1);
  const chartW = 700; const chartH = 180; const barW = chartW / rows.length;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.fg{grid-template-columns:1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "80px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 520 }}>
            <span style={{ color: AMBER, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>WFM Tool</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>Forecast Accuracy Tracker</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 32 }}>Compare forecast vs actual by interval and channel. Identify where your forecast breaks down and quantify the impact on staffing accuracy.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "14px", fontSize: 15, fontWeight: 600, background: email.includes("@") ? AMBER : SLATE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: email.includes("@") ? 1 : 0.5 }}>{sending ? "Loading..." : "Launch Tracker →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "calc" && (
        <>
          <section style={{ background: WARM, padding: "40px 28px", borderBottom: `1px solid ${BORDER}` }}>
            <div style={WRAP}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: 0 }}>Forecast Accuracy Tracker</h2>
                <div style={{ display: "flex", gap: 4 }}>
                  {Object.entries(CHANNEL_DEFAULTS).map(([k, v]) => (
                    <button key={k} onClick={() => applyChannel(k)} style={{ padding: "6px 14px", fontSize: 11, fontWeight: 600, borderRadius: 4, border: `1px solid ${channel === k ? ELECTRIC : BORDER}`, background: channel === k ? ELECTRIC : "#fff", color: channel === k ? "#fff" : MUTED, cursor: "pointer" }}>{v.label}</button>
                  ))}
                  <button onClick={randomize} style={{ padding: "6px 14px", fontSize: 11, fontWeight: 600, borderRadius: 4, border: `1px solid ${BORDER}`, background: "#fff", color: MUTED, cursor: "pointer", marginLeft: 8 }}>Randomize</button>
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>Simulated variance: {variance}%</label>
                <input type="range" min="2" max="30" value={variance} onChange={e => setVariance(Number(e.target.value))} style={{ width: "100%", marginTop: 4 }} />
              </div>
              <p style={{ fontSize: 12, color: MUTED }}>Enter your own forecast and actual values below, or use the sample data to explore. Click any cell to edit.</p>
            </div>
          </section>

          <section style={{ background: "#fff", padding: "40px 28px" }}>
            <div style={WRAP}>
              {/* Summary cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 28 }} className="fg">
                <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Overall Accuracy</div>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 36, color: accColor }}>{overallAccuracy.toFixed(1)}%</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{overallAccuracy >= 95 ? "Excellent" : overallAccuracy >= 90 ? "Acceptable" : "Needs attention"}</div>
                </div>
                <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>MAPE</div>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 36, color: mape <= 5 ? GREEN : mape <= 10 ? AMBER : RED }}>{mape.toFixed(1)}%</div>
                  <div style={{ fontSize: 11, color: MUTED }}>Mean absolute % error</div>
                </div>
                <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Forecast Bias</div>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 36, color: Math.abs(bias) <= 3 ? GREEN : AMBER }}>{bias > 0 ? "+" : ""}{bias.toFixed(1)}%</div>
                  <div style={{ fontSize: 11, color: MUTED }}>{biasLabel}</div>
                </div>
                <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Volume Delta</div>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 36, color: "#fff" }}>{totalActual - totalForecast > 0 ? "+" : ""}{totalActual - totalForecast}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Contacts vs forecast</div>
                </div>
              </div>

              {/* Visual chart */}
              <div style={{ marginBottom: 28, overflowX: "auto" }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Forecast vs Actual by Interval</h3>
                <svg viewBox={`0 0 ${chartW} ${chartH + 24}`} style={{ width: "100%", maxWidth: chartW }}>
                  {rows.map((r, i) => {
                    const fH = (r.forecast / maxVal) * chartH;
                    const aH = (r.actual / maxVal) * chartH;
                    const x = i * barW;
                    return (
                      <g key={i}>
                        <rect x={x + 2} y={chartH - fH} width={barW * 0.4} height={fH} fill={ELECTRIC} opacity={0.3} rx={2} />
                        <rect x={x + barW * 0.45} y={chartH - aH} width={barW * 0.4} height={aH} fill={Math.abs(r.actual - r.forecast) / Math.max(r.forecast, 1) > 0.1 ? RED : GREEN} opacity={0.7} rx={2} />
                        {i % 4 === 0 && <text x={x + barW / 2} y={chartH + 14} textAnchor="middle" fontSize="7" fill={MUTED}>{r.interval}</text>}
                      </g>
                    );
                  })}
                </svg>
                <div style={{ display: "flex", gap: 16, fontSize: 11, color: MUTED, marginTop: 4 }}>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: ELECTRIC, opacity: 0.3, marginRight: 4, verticalAlign: "middle" }} />Forecast</span>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: GREEN, opacity: 0.7, marginRight: 4, verticalAlign: "middle" }} />Actual (within 10%)</span>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: RED, opacity: 0.7, marginRight: 4, verticalAlign: "middle" }} />Actual (off by 10%+)</span>
                </div>
              </div>

              {/* Worst intervals */}
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Worst 5 Intervals</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {worstIntervals.map((w, i) => {
                    const err = w.forecast > 0 ? ((w.actual - w.forecast) / w.forecast * 100) : 0;
                    return (
                      <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 100px 100px 120px 1fr", gap: 8, padding: "8px 12px", background: i % 2 === 0 ? WARM : "#fff", borderRadius: 4, fontSize: 12, alignItems: "center" }}>
                        <span style={{ fontWeight: 600, color: NAVY }}>{w.interval}</span>
                        <span style={{ color: MUTED }}>Forecast: {w.forecast}</span>
                        <span style={{ color: MUTED }}>Actual: {w.actual}</span>
                        <span style={{ color: err > 0 ? RED : AMBER, fontWeight: 600 }}>{err > 0 ? "+" : ""}{err.toFixed(1)}% error</span>
                        <span style={{ color: MUTED, fontSize: 11 }}>{err > 10 ? "Understaffed this interval" : err < -10 ? "Overstaffed this interval" : "Within tolerance"}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Editable data table */}
              <details style={{ marginBottom: 28 }}>
                <summary style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC, cursor: "pointer", marginBottom: 8 }}>Edit interval data (click to expand)</summary>
                <div style={{ maxHeight: 400, overflowY: "auto", border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead><tr style={{ background: DEEP, color: "#fff" }}>
                      <th style={{ padding: "8px 12px", textAlign: "left" }}>Interval</th>
                      <th style={{ padding: "8px 12px", textAlign: "right" }}>Forecast</th>
                      <th style={{ padding: "8px 12px", textAlign: "right" }}>Actual</th>
                      <th style={{ padding: "8px 12px", textAlign: "right" }}>Variance</th>
                      <th style={{ padding: "8px 12px", textAlign: "right" }}>% Error</th>
                    </tr></thead>
                    <tbody>{rows.map((r, i) => {
                      const err = r.forecast > 0 ? ((r.actual - r.forecast) / r.forecast * 100) : 0;
                      return (
                        <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : WARM }}>
                          <td style={{ padding: "4px 12px", fontWeight: 500 }}>{r.interval}</td>
                          <td style={{ padding: "4px 12px", textAlign: "right" }}><input type="number" value={r.forecast} onChange={e => updateRow(i, "forecast", e.target.value)} style={{ width: 60, padding: "2px 6px", border: `1px solid ${BORDER}`, borderRadius: 4, textAlign: "right", fontSize: 12 }} /></td>
                          <td style={{ padding: "4px 12px", textAlign: "right" }}><input type="number" value={r.actual} onChange={e => updateRow(i, "actual", e.target.value)} style={{ width: 60, padding: "2px 6px", border: `1px solid ${BORDER}`, borderRadius: 4, textAlign: "right", fontSize: 12 }} /></td>
                          <td style={{ padding: "4px 12px", textAlign: "right", color: r.actual - r.forecast > 0 ? RED : GREEN }}>{r.actual - r.forecast > 0 ? "+" : ""}{r.actual - r.forecast}</td>
                          <td style={{ padding: "4px 12px", textAlign: "right", color: Math.abs(err) > 10 ? RED : Math.abs(err) > 5 ? AMBER : GREEN, fontWeight: 600 }}>{err.toFixed(1)}%</td>
                        </tr>
                      );
                    })}</tbody>
                  </table>
                </div>
              </details>

              <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>
                  <strong style={{ color: "#fff" }}>Industry benchmark:</strong> Best-in-class forecast accuracy targets 95%+ at the daily level and 90%+ at the interval level. MAPE under 5% is excellent. Consistent under-forecasting (positive bias) causes understaffing and overtime. Consistent over-forecasting causes idle time and budget waste. The fix is usually not a better algorithm. It is better data hygiene, more granular segmentation, and faster feedback loops between WFM and operations.
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
