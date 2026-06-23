import { useState, useEffect } from "react";
import ReportExport from "./ReportExport";
import { COLORS, BENCH, classifyOccupancy, classifyShrinkage } from "from "./src/lib/benchmarks";
import { publishToolResult } from "./src/lib/toolData";

const NAVY = COLORS.navy, DEEP = "#061325", ELECTRIC = COLORS.electric, LIGHT = "#00AAFF";
const WARM = "#F8FAFB", SLATE = "#3A4F6A", MUTED = COLORS.muted, BORDER = "#D8E3ED";
const GREEN = COLORS.green, AMBER = COLORS.amber, RED = COLORS.red;
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };

// Lead capture endpoint (existing). When the Resend guidance system ships in the
// final phase, swap this one line for /api/send-guidance.
const CAPTURE_ENDPOINT = "https://formspree.io/f/maqlvwne";

function LogoMark({ size = 34, light = true }) { const a = light ? "#fff" : NAVY, x = light ? LIGHT : ELECTRIC; return <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light ? .6 : .3} /><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light ? .8 : .5} /><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round" /><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /></g></svg>; }

/* ---- Stable Erlang C via the Erlang B recursion (no factorial / no pow;
       overflow-proof to thousands of agents) ---- */
function erlangB(N, A) { let B = 1; for (let n = 1; n <= N; n++) B = (A * B) / (n + A * B); return B; }
function erlangC(N, A) { if (N <= A) return 1; const B = erlangB(N, A); const rho = A / N; return B / (1 - rho * (1 - B)); }

function calc(volume, ahtSec, intMin, slT, slSec, shrink) {
  const A = (volume * ahtSec) / (intMin * 60);
  const minN = Math.ceil(A) + 1;
  let agents = minN, pw = 1, sl = 0, asa = 999, occ = 1;
  for (let n = minN; n < minN + 1000; n++) {
    pw = erlangC(n, A); sl = 1 - pw * Math.exp(-(n - A) * slSec / ahtSec); asa = pw * ahtSec / (n - A); occ = A / n;
    if (sl >= slT) { agents = n; break; } agents = n;
  }
  return { raw: agents, sched: Math.ceil(agents / (1 - shrink)), pw, sl, asa, occ, A };
}

/* ---- Optional Erlang A reality-check: Erlang C assumes infinite patience and
       therefore over-staffs whenever callers actually abandon. Given an average
       patience, estimate abandonment under the current staffing and the
       conservative margin. Labeled as an estimate; Erlang C stays the planning
       number. ---- */
function abandonmentCheck(N, A, ahtSec, patienceSec) {
  if (!patienceSec || patienceSec <= 0 || N <= A) return null;
  const C = erlangC(N, A);
  const drainRate = (N - A) / ahtSec;     // queue drains at this per-second rate
  const theta = 1 / patienceSec;          // abandonment hazard
  const pAbandonIfDelayed = theta / (theta + drainRate);
  const estAband = C * pAbandonIfDelayed; // overall share abandoning
  return { estAband, pAbandonIfDelayed };
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

const F = ({ label, value, onChange, hint, suffix, min, max, step, placeholder }) => (
  <div style={{ marginBottom: 12 }}>
    <label style={{ fontSize: 12, fontWeight: 600, color: NAVY, display: "block", marginBottom: 4 }}>{label}</label>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input type="number" value={value} placeholder={placeholder} min={min} max={max} step={step || 1} onChange={e => onChange(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
        style={{ flex: 1, padding: "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, outline: "none", fontFamily: "'DM Sans',sans-serif", color: NAVY }}
        onFocus={e => e.target.style.borderColor = ELECTRIC} onBlur={e => e.target.style.borderColor = BORDER} />
      {suffix && <span style={{ fontSize: 13, color: MUTED, minWidth: 30 }}>{suffix}</span>}
    </div>
    {hint && <span style={{ fontSize: 11, color: MUTED, marginTop: 2, display: "block" }}>{hint}</span>}
  </div>
);

const S = ({ label, value, sub, color }) => (
  <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 18px" }}>
    <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
    <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: color || ELECTRIC, lineHeight: 1.1 }}>{value}</div>
    {sub && <div style={{ fontSize: 11, color: MUTED, marginTop: 4, lineHeight: 1.4 }}>{sub}</div>}
  </div>
);

export default function StaffingCalculator() {
  const [preset, setPreset] = useState("general");
  const [vol, setVol] = useState(400), [aht, setAht] = useState(360), [slT, setSlT] = useState(80);
  const [slS, setSlS] = useState(20), [shrink, setShrink] = useState(30), [intv, setIntv] = useState(30);
  const [patience, setPatience] = useState(0); // optional Erlang A input (0 = off)

  // Optional, after-results lead capture (no gate)
  const [capOpen, setCapOpen] = useState(false);
  const [capName, setCapName] = useState(""), [capCompany, setCapCompany] = useState(""), [capEmail, setCapEmail] = useState("");
  const [capState, setCapState] = useState("idle"); // idle | sending | sent | error

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const apply = (k) => { const p = PRESETS[k]; setPreset(k); setVol(p.volume); setAht(p.aht); setSlT(Math.round(p.slT * 100)); setSlS(p.slS); setShrink(Math.round(p.shrink * 100)); };

  const r = calc(vol, aht, intv, slT / 100, slS, shrink / 100);
  const occInfo = classifyOccupancy(r.occ);
  const shrinkInfo = classifyShrinkage(shrink / 100);
  const asaD = r.asa < 1 ? "< 1s" : r.asa > 999 ? "> 15m" : `${Math.round(r.asa)}s`;

  const aband = abandonmentCheck(r.raw, r.A, aht, patience);
  const adjR = aband ? calc(Math.max(1, Math.round(vol * (1 - aband.estAband))), aht, intv, slT / 100, slS, shrink / 100) : null;

  const spike = calc(Math.round(vol * 1.2), aht, intv, slT / 100, slS, shrink / 100);
  const ahtUp = calc(vol, Math.round(aht * 1.1), intv, slT / 100, slS, shrink / 100);
  const ahtDown = calc(vol, Math.round(aht * 0.9), intv, slT / 100, slS, shrink / 100);

  // Publish to the shared data contract whenever results change (write side).
  useEffect(() => {
    publishToolResult("staffing-calculator", {
      volume: vol, intervalMin: intv, aht, shrinkage: shrink / 100,
      serviceLevelTarget: slT / 100, serviceLevel: r.sl, asa: r.asa,
      trafficIntensity: +r.A.toFixed(2), baseAgents: r.raw, fte: r.sched,
      occupancy: +r.occ.toFixed(4), probabilityOfWait: +r.pw.toFixed(4),
      patienceSec: patience || undefined,
      estAbandonment: aband ? +(aband.estAband).toFixed(4) : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vol, intv, aht, shrink, slT, slS, patience]);

  const submitCapture = async () => {
    if (!capEmail.includes("@") || capState === "sending") return;
    setCapState("sending");
    try {
      await fetch(CAPTURE_ENDPOINT, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: capEmail, name: capName, company: capCompany,
          tool: "Staffing Calculator",
          result: `FTE ${r.sched}, base ${r.raw}, occ ${(r.occ * 100).toFixed(1)}%`,
          _subject: "Staffing Calculator — send my analysis",
        }),
      });
      setCapState("sent");
    } catch { setCapState("error"); }
  };

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", minHeight: "100vh", background: WARM }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}input[type=number]::-webkit-inner-spin-button{opacity:1}@media(max-width:700px){.calc-grid{grid-template-columns:1fr!important}.stat-grid{grid-template-columns:1fr 1fr!important}}`}</style>

      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      <div style={{ ...WRAP, padding: "40px 28px 80px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 8 }}>
          <div>
            <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Erlang C Staffing Model</span>
            <h1 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 26, fontWeight: 400, color: NAVY, margin: "4px 0 0" }}>Staffing Requirement Calculator</h1>
          </div>
          <select value={preset} onChange={e => apply(e.target.value)} style={{ padding: "10px 14px", fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, cursor: "pointer" }}>
            {Object.entries(PRESETS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, marginBottom: 26, maxWidth: 640 }}>Volume, AHT, service level, and shrinkage to required FTE — live, no sign-up. Adjust any input and the results below update instantly.</p>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, alignItems: "start" }} className="calc-grid">
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "22px 18px" }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: NAVY, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 14 }}>Inputs</h3>
            <F label="Contacts per interval" value={vol} onChange={setVol} hint="Inbound contacts arriving in one interval" min={1} />
            <F label="Average Handle Time" value={aht} onChange={setAht} hint={`${Math.floor(aht / 60)}m ${aht % 60}s — talk + hold + ACW`} suffix="sec" min={1} />
            <F label="Interval length" value={intv} onChange={setIntv} suffix="min" min={15} max={60} step={15} />
            <div style={{ height: 1, background: BORDER, margin: "14px 0" }} />
            <F label="Service Level Target" value={slT} onChange={setSlT} suffix="%" min={1} max={100} />
            <F label="Answer Threshold" value={slS} onChange={setSlS} suffix="sec" min={1} />
            <div style={{ height: 1, background: BORDER, margin: "14px 0" }} />
            <F label="Total Shrinkage" value={shrink} onChange={setShrink} hint="Breaks, training, PTO, absenteeism" suffix="%" min={0} max={70} />
            <div style={{ height: 1, background: BORDER, margin: "14px 0" }} />
            <F label="Avg caller patience (optional)" value={patience || ""} onChange={setPatience} placeholder="0 = off" hint="Seconds before a caller abandons. Enables the abandonment reality-check." suffix="sec" min={0} max={600} />
            <div style={{ background: WARM, borderRadius: 8, padding: "12px 14px", marginTop: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Traffic Intensity</div>
              <div style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 22, color: ELECTRIC }}>{r.A.toFixed(1)} <span style={{ fontSize: 12, color: MUTED }}>Erlangs</span></div>
            </div>
          </div>

          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }} className="stat-grid">
              <S label="Base Agents" value={r.raw} sub="On the phones, before shrinkage" color={ELECTRIC} />
              <S label="Scheduled FTE" value={r.sched} sub={`With ${shrink}% shrinkage`} color={NAVY} />
              <S label="Occupancy" value={`${(r.occ * 100).toFixed(1)}%`} sub={occInfo.message} color={occInfo.color} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }} className="stat-grid">
              <S label="Service Level" value={`${(r.sl * 100).toFixed(1)}%`} sub={`Target: ${slT}% in ${slS}s`} color={r.sl >= slT / 100 ? GREEN : RED} />
              <S label="Avg Speed of Answer" value={asaD} sub="Estimated wait time" />
              <S label="Prob. of Wait" value={`${(r.pw * 100).toFixed(1)}%`} sub="Chance a caller waits" />
            </div>

            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 18px 14px", marginBottom: 12 }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 }}>Occupancy Risk · target {Math.round(BENCH.occupancy.targetLow * 100)}–{Math.round(BENCH.occupancy.targetHigh * 100)}%</h3>
              <div style={{ position: "relative", height: 20, borderRadius: 10, overflow: "hidden", background: `linear-gradient(90deg, ${GREEN} 0%, ${GREEN} ${BENCH.occupancy.healthyMax * 100}%, ${AMBER} ${BENCH.occupancy.healthyMax * 100}%, ${AMBER} ${BENCH.occupancy.cautionMax * 100}%, ${RED} ${BENCH.occupancy.cautionMax * 100}%, ${RED} 100%)` }}>
                <div style={{ position: "absolute", left: `${Math.min(r.occ * 100, 98)}%`, top: -1, width: 3, height: 22, background: NAVY, borderRadius: 2, transition: "left 0.3s" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 9, color: MUTED }}>
                <span>0%</span><span style={{ color: GREEN }}>&lt;{Math.round(BENCH.occupancy.healthyMax * 100)}% healthy</span><span style={{ color: AMBER }}>{Math.round(BENCH.occupancy.healthyMax * 100)}–{Math.round(BENCH.occupancy.cautionMax * 100)}% caution</span><span style={{ color: RED }}>&gt;{Math.round(BENCH.occupancy.cautionMax * 100)}% critical</span>
              </div>
            </div>

            {aband && adjR && (
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px", marginBottom: 12 }}>
                <h3 style={{ fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }}>Abandonment Reality-Check <span style={{ color: MUTED, fontWeight: 600 }}>· Erlang A estimate</span></h3>
                <p style={{ fontSize: 12.5, color: SLATE, lineHeight: 1.6, margin: "0 0 10px" }}>
                  Erlang C assumes no one ever hangs up, so it over-staffs when callers abandon. At an average patience of {patience}s, roughly <strong style={{ color: NAVY }}>{(aband.estAband * 100).toFixed(1)}%</strong> of contacts would abandon under this staffing. Accounting for that, an estimated <strong style={{ color: NAVY }}>{adjR.raw} base agents</strong> ({adjR.sched} FTE) could hold target — about {Math.max(0, r.raw - adjR.raw)} fewer than Erlang C.
                </p>
                <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.5, margin: 0 }}>This is a planning estimate, not a guarantee. Keep the Erlang C number ({r.raw}) as the conservative baseline; treat the adjusted figure as the floor abandonment makes possible.</p>
              </div>
            )}

            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 18px" }}>
              <h3 style={{ fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10 }}>What-If Scenarios</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="stat-grid">
                {[
                  { label: "+20% volume spike", r2: spike, c: AMBER },
                  { label: "+10% AHT increase", r2: ahtUp, c: AMBER },
                  { label: "+5pt shrinkage", r2: calc(vol, aht, intv, slT / 100, slS, Math.min((shrink + 5) / 100, 0.70)), c: RED },
                  { label: "Raise SL to 90%", r2: calc(vol, aht, intv, 0.90, slS, shrink / 100), c: ELECTRIC },
                ].map((s, i) => (
                  <div key={i} style={{ background: WARM, borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: s.c, letterSpacing: 1, textTransform: "uppercase" }}>{s.label}</div>
                    <div style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 22, color: NAVY, marginTop: 2 }}>{s.r2.sched} <span style={{ fontSize: 12, color: MUTED }}>FTE</span></div>
                    <div style={{ fontSize: 11, color: MUTED }}>{s.r2.sched - r.sched >= 0 ? "+" : ""}{s.r2.sched - r.sched} agents | Occ: {(s.r2.occ * 100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: WARM, borderRadius: 10, padding: "14px 16px", marginTop: 14, borderLeft: `3px solid ${ELECTRIC}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: ELECTRIC, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Methodology</div>
              <p style={{ fontSize: 12, color: SLATE, lineHeight: 1.55, margin: 0 }}>Erlang C — the industry-standard staffing model — solved via the numerically stable Erlang B recursion (accurate from a handful of agents to several thousand). It assumes random Poisson arrivals, exponential handle times, and, importantly, <em>infinite caller patience</em>: no abandonment. Because real callers abandon, Erlang C tends to over-staff — enter an average patience above to see the abandonment-adjusted estimate. Shrinkage is applied after the agent calculation to convert base agents to scheduled FTE.</p>
            </div>

            {/* Optional after-results capture — value first, no gate */}
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 18px", marginTop: 14 }}>
              {capState === "sent" ? (
                <div style={{ fontSize: 13, color: GREEN, fontWeight: 600 }}>✓ On its way — check your inbox for this analysis.</div>
              ) : !capOpen ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13, color: SLATE }}>Want this analysis sent to you?</span>
                  <button onClick={() => setCapOpen(true)} style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC, background: "transparent", border: `1px solid ${ELECTRIC}`, borderRadius: 7, padding: "9px 16px", cursor: "pointer" }}>Email me this analysis</button>
                </div>
              ) : (
                <div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }} className="stat-grid">
                    <input placeholder="Name" value={capName} onChange={e => setCapName(e.target.value)} style={{ padding: "10px 12px", fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6, outline: "none" }} />
                    <input placeholder="Company" value={capCompany} onChange={e => setCapCompany(e.target.value)} style={{ padding: "10px 12px", fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6, outline: "none" }} />
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input type="email" placeholder="you@company.com" value={capEmail} onChange={e => setCapEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submitCapture()} style={{ flex: "1 1 200px", padding: "10px 12px", fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6, outline: "none" }} />
                    <button onClick={submitCapture} disabled={!capEmail.includes("@") || capState === "sending"} style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: capEmail.includes("@") ? ELECTRIC : MUTED, border: "none", borderRadius: 6, padding: "10px 18px", cursor: "pointer" }}>{capState === "sending" ? "Sending…" : "Send"}</button>
                  </div>
                  {capState === "error" && <div style={{ fontSize: 12, color: RED, marginTop: 6 }}>Couldn't send — please try again.</div>}
                  <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>Optional. We send this analysis once. No list, no spam.</div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap", alignItems: "center" }}>
              <ReportExport
                toolName="Staffing Requirement Calculator"
                subtitle="Erlang C Staffing Analysis"
                userName={capName}
                userEmail={capEmail}
                sections={[
                  { title: "Input Parameters", type: "table", rows: [
                    ["Contacts per Interval", vol.toString()],
                    ["Interval Length", `${intv} minutes`],
                    ["Average Handle Time", `${Math.floor(aht / 60)}m ${aht % 60}s (${aht}s)`],
                    ["Service Level Target", `${slT}% in ${slS} seconds`],
                    ["Total Shrinkage", `${shrink}%`],
                    ...(patience ? [["Avg Caller Patience", `${patience}s (Erlang A check on)`]] : []),
                    ["Traffic Intensity", `${r.A.toFixed(1)} Erlangs`],
                    ["Industry Preset", PRESETS[preset]?.label || "Custom"],
                  ]},
                  { title: "Staffing Results", type: "metrics", items: [
                    { label: "Base Agents Required", value: r.raw.toString(), color: ELECTRIC, sub: "Before shrinkage" },
                    { label: "Scheduled FTE", value: r.sched.toString(), color: NAVY, sub: `With ${shrink}% shrinkage` },
                    { label: "Occupancy", value: `${(r.occ * 100).toFixed(1)}%`, color: occInfo.color, sub: occInfo.label },
                    { label: "Service Level", value: `${(r.sl * 100).toFixed(1)}%`, color: r.sl >= slT / 100 ? GREEN : RED },
                    { label: "Avg Speed of Answer", value: asaD, color: ELECTRIC },
                    { label: "Probability of Wait", value: `${(r.pw * 100).toFixed(1)}%`, color: MUTED },
                  ]},
                  { title: "Key Findings", type: "findings", items: [
                    `At ${vol} contacts per ${intv}-minute interval with ${Math.floor(aht / 60)}m ${aht % 60}s AHT, you need ${r.raw} agents on the phones to meet ${slT}/${slS} service level.`,
                    `After applying ${shrink}% shrinkage, that becomes ${r.sched} scheduled FTE.`,
                    `Occupancy is ${(r.occ * 100).toFixed(0)}% — ${occInfo.label.toLowerCase()}. ${occInfo.message}`,
                    shrinkInfo.message,
                    ...(aband && adjR ? [`With ${patience}s average patience, an estimated ${(aband.estAband * 100).toFixed(1)}% of contacts would abandon; the abandonment-adjusted estimate is ${adjR.raw} base agents versus the Erlang C ${r.raw}.`] : []),
                    `A 20% volume spike would require ${spike.sched} FTE (${spike.sched - r.sched >= 0 ? "+" : ""}${spike.sched - r.sched} agents).`,
                  ]},
                  { title: "Recommended Actions", type: "actions", items: [
                    ...(occInfo.band === "critical" ? [{ action: "Address occupancy risk immediately", detail: `At ${(r.occ * 100).toFixed(0)}%, agents have insufficient recovery time. Target the ${Math.round(BENCH.occupancy.targetLow * 100)}–${Math.round(BENCH.occupancy.targetHigh * 100)}% band by adding agents or reducing volume through AI deflection.`, priority: "high" }]
                      : occInfo.band === "caution" ? [{ action: "Monitor occupancy on peaks", detail: `${(r.occ * 100).toFixed(0)}% is in the caution band. It is workable but fragile — a forecast miss pushes it critical. Aim for the ${Math.round(BENCH.occupancy.targetLow * 100)}–${Math.round(BENCH.occupancy.targetHigh * 100)}% target.`, priority: "medium" }] : []),
                    ...(shrinkInfo.elevated ? [{ action: "Decompose shrinkage", detail: `${shrink}% is above the typical ${Math.round(BENCH.shrinkage.typicalLow * 100)}–${Math.round(BENCH.shrinkage.typicalHigh * 100)}% range. Use the Shrinkage Planner to see which categories drive the gap before adding heads.`, priority: "medium" }] : []),
                    { action: "Model AHT reduction", detail: `A 10% AHT cut (${aht}s → ${Math.round(aht * 0.9)}s) lowers base staffing from ${r.raw} to ${ahtDown.raw} agents. Use AHT Decomposition to find reducible components without hurting quality.`, priority: "medium" },
                    { action: "Build spike contingency", detail: `Plan for +20% volume. Identify ${spike.sched - r.sched} agents activatable via overtime, cross-training, or BPO overflow.` },
                  ]},
                  { title: "Next Steps", type: "next", items: [
                    { tool: "Shrinkage Planner", reason: "Break shrinkage into categories and find what drives the gap" },
                    { tool: "AHT Decomposition", reason: "Identify which handle-time components are reducible" },
                    { tool: "Occupancy Risk Simulator", reason: "Stress-test how fragile this plan is to a forecast miss" },
                    { tool: "Attrition Cost Calculator", reason: "Quantify the cost if occupancy-driven burnout raises turnover" },
                  ]},
                  { title: "Methodology", type: "text", content: "Erlang C via the numerically stable Erlang B recursion. Assumes random Poisson arrivals and exponential handle times. Erlang C assumes infinite patience (no abandonment) and therefore tends to over-staff; the optional patience input estimates abandonment and an Erlang A-adjusted requirement. Shrinkage is applied post-calculation to convert base agents to scheduled FTE." },
                ]}
              />
              <a href="/vendors" style={{ background: ELECTRIC, color: "#fff", fontSize: 13, fontWeight: 600, padding: "11px 20px", borderRadius: 7 }}>Explore WFM Vendors</a>
              <a href="/tools/shrinkage-planner" style={{ background: "#fff", border: `1px solid ${BORDER}`, color: NAVY, fontSize: 13, fontWeight: 600, padding: "11px 20px", borderRadius: 7 }}>Shrinkage Planner →</a>
              <a href="/tools/aht-decomposition" style={{ background: "#fff", border: `1px solid ${BORDER}`, color: NAVY, fontSize: 13, fontWeight: 600, padding: "11px 20px", borderRadius: 7 }}>AHT Decomposition →</a>
              <a href="/how-to-choose" style={{ background: "#fff", border: `1px solid ${BORDER}`, color: NAVY, fontSize: 13, fontWeight: 600, padding: "11px 20px", borderRadius: 7 }}>All Tools</a>
            </div>
          </div>
        </div>
      </div>

      <footer style={{ background: DEEP, padding: "40px 28px 28px" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={24} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 12 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX</span>
        <div style={{ display: "flex", gap: 16 }}>
          <a href="/privacy" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Privacy</a>
          <a href="/terms" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Terms</a>
        </div></div></div></footer>
    </div>
  );
}
