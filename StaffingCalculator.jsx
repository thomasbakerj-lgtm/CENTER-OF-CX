import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };

function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

function factorial(n) { if (n <= 1) return 1; let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }
function erlangC(agents, A) { const N = Math.floor(agents); if (N <= A) return 1; const powAN = Math.pow(A, N) / factorial(N); const rho = A / N; const num = powAN * (1 / (1 - rho)); let sum = 0; for (let k = 0; k < N; k++) sum += Math.pow(A, k) / factorial(k); return num / (sum + num); }

function calc(volume, ahtSec, intMin, slT, slSec, shrink) {
  const A = (volume * ahtSec) / (intMin * 60);
  const minN = Math.ceil(A) + 1;
  let agents = minN, pw = 1, sl = 0, asa = 999, occ = 1;
  for (let n = minN; n < minN + 500; n++) {
    pw = erlangC(n, A); sl = 1 - pw * Math.exp(-(n - A) * slSec / ahtSec); asa = pw * ahtSec / (n - A); occ = A / n;
    if (sl >= slT) { agents = n; break; } agents = n;
  }
  return { raw: agents, sched: Math.ceil(agents / (1 - shrink)), pw, sl, asa, occ, A };
}

const PRESETS = {
  general: { label: "Cross-Industry", volume: 400, aht: 360, slT: 0.80, slS: 20, shrink: 0.30 },
  financial: { label: "Financial Services", volume: 500, aht: 320, slT: 0.80, slS: 20, shrink: 0.28 },
  healthcare: { label: "Healthcare", volume: 350, aht: 420, slT: 0.80, slS: 30, shrink: 0.32 },
  retail: { label: "Retail + eCommerce", volume: 600, aht: 280, slT: 0.80, slS: 20, shrink: 0.32 },
  telecom: { label: "Telecom", volume: 550, aht: 440, slT: 0.80, slS: 20, shrink: 0.30 },
  insurance: { label: "Insurance", volume: 300, aht: 480, slT: 0.80, slS: 30, shrink: 0.28 },
  bpo: { label: "BPO / Outsourcer", volume: 700, aht: 340, slT: 0.80, slS: 20, shrink: 0.34 },
};

const F = ({ label, value, onChange, hint, suffix, min, max, step }) => (
  <div style={{ marginBottom: 12 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: NAVY, display: "block", marginBottom: 4 }}>{label}</label>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input type="number" value={value} min={min} max={max} step={step||1} onChange={e => onChange(parseFloat(e.target.value)||0)}
        style={{ flex: 1, padding: "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, outline: "none", fontFamily: "'DM Sans',sans-serif", color: NAVY }}
        onFocus={e => e.target.style.borderColor=ELECTRIC} onBlur={e => e.target.style.borderColor=BORDER} />
      {suffix && <span style={{ fontSize: 13, color: MUTED, minWidth: 30 }}>{suffix}</span>}
    </div>
    {hint && <span style={{ fontSize: 11, color: MUTED, marginTop: 2, display: "block" }}>{hint}</span>}
  </div>
);

const S = ({ label, value, sub, color }) => (
  <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 18px" }}>
    <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
    <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: color||ELECTRIC, lineHeight: 1.1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: MUTED, marginTop: 4, lineHeight: 1.4 }}>{sub}</div>}
  </div>
);

export default function StaffingCalculator() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState(""); const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false); const [preset, setPreset] = useState("general");
  const [vol, setVol] = useState(400); const [aht, setAht] = useState(360); const [slT, setSlT] = useState(80);
  const [slS, setSlS] = useState(20); const [shrink, setShrink] = useState(30); const [intv, setIntv] = useState(30);

  useEffect(() => { window.scrollTo(0,0); }, [phase]);

  const apply = (k) => { const p = PRESETS[k]; setPreset(k); setVol(p.volume); setAht(p.aht); setSlT(Math.round(p.slT*100)); setSlS(p.slS); setShrink(Math.round(p.shrink*100)); };
  const r = calc(vol, aht, intv, slT/100, slS, shrink/100);
  const occC = r.occ > 0.90 ? RED : r.occ > 0.85 ? AMBER : GREEN;
  const occW = r.occ > 0.90 ? "Critical. Burnout and attrition risk is extremely high." : r.occ > 0.85 ? "Caution. Sustained 85%+ correlates with attrition and quality loss." : r.occ > 0.80 ? "Acceptable. Monitor during peaks." : "Healthy. Adequate recovery time.";
  const asaD = r.asa < 1 ? "< 1s" : r.asa > 999 ? "> 15m" : `${Math.round(r.asa)}s`;

  const gate = async () => {
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "Staffing Calculator", _subject: "Staffing Calculator Access" }) }); } catch(e){}
    setSending(false); setPhase("calc");
  };

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", minHeight: "100vh", background: WARM }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}input[type=number]::-webkit-inner-spin-button{opacity:1}@media(max-width:700px){.calc-grid{grid-template-columns:1fr!important}.stat-grid{grid-template-columns:1fr 1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      {phase === "gate" && (
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 28px" }}>
          <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>WFM Tool</span>
          <h1 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "8px 0 12px" }}>Staffing Requirement Calculator</h1>
          <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.65, marginBottom: 28 }}>Convert volume, AHT, service level target, and shrinkage into required FTE using Erlang C methodology. Includes industry presets, real-time occupancy risk, and what-if scenarios.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, outline: "none" }} />
            <input type="text" placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, outline: "none" }} />
            <input type="email" placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, outline: "none" }} />
            <button onClick={gate} disabled={sending||!email.includes("@")} style={{ padding: "14px 24px", fontSize: 15, fontWeight: 600, background: email.includes("@")?ELECTRIC:MUTED, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", marginTop: 4 }}>{sending ? "Opening..." : "Launch Calculator →"}</button>
          </div>
          <p style={{ fontSize: 11, color: MUTED, marginTop: 12 }}>Free. No paywall. Your info stays private.</p>
        </div>
      )}

      {phase === "calc" && (
        <div style={{ ...WRAP, padding: "40px 28px 80px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 28 }}>
            <div>
              <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Erlang C Staffing Model</span>
              <h1 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 26, fontWeight: 400, color: NAVY, margin: "4px 0 0" }}>Staffing Requirement Calculator</h1>
            </div>
            <select value={preset} onChange={e => apply(e.target.value)} style={{ padding: "10px 14px", fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, cursor: "pointer" }}>
              {Object.entries(PRESETS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, alignItems: "start" }} className="calc-grid">
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "22px 18px" }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: NAVY, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 14 }}>Inputs</h3>
              <F label="Contacts per interval" value={vol} onChange={setVol} hint="Inbound contacts per interval" min={1} />
              <F label="Average Handle Time" value={aht} onChange={setAht} hint={`${Math.floor(aht/60)}m ${aht%60}s — talk + hold + ACW`} suffix="sec" min={1} />
              <F label="Interval length" value={intv} onChange={setIntv} suffix="min" min={15} max={60} step={15} />
              <div style={{ height: 1, background: BORDER, margin: "14px 0" }} />
              <F label="Service Level Target" value={slT} onChange={setSlT} suffix="%" min={1} max={100} />
              <F label="Answer Threshold" value={slS} onChange={setSlS} suffix="sec" min={1} />
              <div style={{ height: 1, background: BORDER, margin: "14px 0" }} />
              <F label="Total Shrinkage" value={shrink} onChange={setShrink} hint="Breaks, training, PTO, absenteeism" suffix="%" min={0} max={70} />
              <div style={{ background: WARM, borderRadius: 8, padding: "12px 14px", marginTop: 14 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Traffic Intensity</div>
                <div style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 22, color: ELECTRIC }}>{r.A.toFixed(1)} <span style={{ fontSize: 12, color: MUTED }}>Erlangs</span></div>
              </div>
            </div>

            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }} className="stat-grid">
                <S label="Base Agents" value={r.raw} sub="Before shrinkage" color={ELECTRIC} />
                <S label="Scheduled FTE" value={r.sched} sub={`With ${shrink}% shrinkage`} color={NAVY} />
                <S label="Occupancy" value={`${(r.occ*100).toFixed(1)}%`} sub={occW} color={occC} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }} className="stat-grid">
                <S label="Service Level" value={`${(r.sl*100).toFixed(1)}%`} sub={`Target: ${slT}% in ${slS}s`} color={r.sl >= slT/100 ? GREEN : RED} />
                <S label="Avg Speed of Answer" value={asaD} sub="Estimated wait time" />
                <S label="Prob. of Wait" value={`${(r.pw*100).toFixed(1)}%`} sub="Chance caller waits" />
              </div>

              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 18px 14px", marginBottom: 12 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 }}>Occupancy Risk</h3>
                <div style={{ position: "relative", height: 20, borderRadius: 10, overflow: "hidden", background: `linear-gradient(90deg, ${GREEN} 0%, ${GREEN} 75%, ${AMBER} 82%, ${RED} 92%, ${RED} 100%)` }}>
                  <div style={{ position: "absolute", left: `${Math.min(r.occ*100,98)}%`, top: -1, width: 3, height: 22, background: NAVY, borderRadius: 2, transition: "left 0.3s" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 9, color: MUTED }}>
                  <span>0%</span><span style={{ color: GREEN }}>75% healthy</span><span style={{ color: AMBER }}>85% caution</span><span style={{ color: RED }}>90%+ burnout</span>
                </div>
              </div>

              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 18px" }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 }}>What-If Scenarios</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="stat-grid">
                  {[
                    { label: "+20% volume spike", r2: calc(Math.round(vol*1.2), aht, intv, slT/100, slS, shrink/100), c: AMBER },
                    { label: "+10% AHT increase", r2: calc(vol, Math.round(aht*1.1), intv, slT/100, slS, shrink/100), c: AMBER },
                    { label: "+5pt shrinkage", r2: calc(vol, aht, intv, slT/100, slS, Math.min((shrink+5)/100, 0.70)), c: RED },
                    { label: "Raise SL to 90%", r2: calc(vol, aht, intv, 0.90, slS, shrink/100), c: ELECTRIC },
                  ].map((s,i) => (
                    <div key={i} style={{ background: WARM, borderRadius: 8, padding: "12px 14px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: s.c, letterSpacing: 1, textTransform: "uppercase" }}>{s.label}</div>
                      <div style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 22, color: NAVY, marginTop: 2 }}>{s.r2.sched} <span style={{ fontSize: 12, color: MUTED }}>FTE</span></div>
                      <div style={{ fontSize: 11, color: MUTED }}>+{s.r2.sched - r.sched} agents | Occ: {(s.r2.occ*100).toFixed(0)}%</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: WARM, borderRadius: 10, padding: "14px 16px", marginTop: 14, borderLeft: `3px solid ${ELECTRIC}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: ELECTRIC, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Methodology</div>
                <p style={{ fontSize: 12, color: SLATE, lineHeight: 1.55, margin: 0 }}>Erlang C formula. Industry standard for contact center staffing. Models probability of waiting based on traffic intensity, then iterates to find minimum agents meeting your service level. Shrinkage applied post-calculation. Assumes random arrivals and exponential service times.</p>
              </div>

              <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                <a href="/vendors/wem-qm" style={{ background: ELECTRIC, color: "#fff", fontSize: 13, fontWeight: 600, padding: "11px 20px", borderRadius: 7 }}>Explore WFM Vendors</a>
                <a href="/tco-calculator" style={{ background: "#fff", border: `1px solid ${BORDER}`, color: NAVY, fontSize: 13, fontWeight: 600, padding: "11px 20px", borderRadius: 7 }}>TCO Calculator</a>
                <a href="/how-to-choose" style={{ background: "#fff", border: `1px solid ${BORDER}`, color: NAVY, fontSize: 13, fontWeight: 600, padding: "11px 20px", borderRadius: 7 }}>All Tools</a>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer style={{ background: DEEP, padding: "40px 28px 28px" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={24} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 12 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX</span></div></div></footer>
    </div>
  );
}
