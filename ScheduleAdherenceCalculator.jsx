import { useState, useEffect } from "react";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";
import { createGuards, guardLine } from "./src/lib/guards";

const TOOL_ID = "schedule-adherence";
const ROUTE = "/tools/schedule-adherence";
export const DEFAULTS = { agents: 100, currentAdherence: 92, callsPerHour: 200, aht: 360, slaTarget: 80, slaTime: 20, hourlyRate: 18, otMultiplier: 1.5 };

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#5B6E88"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}
function Input({label,value,onChange,suffix,hint}){return<div><label style={{fontSize:12,fontWeight:600,color:NAVY,display:"block",marginBottom:4}}>{label}</label><div style={{display:"flex",alignItems:"center",gap:4}}><input aria-label={label} type="number" value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:"100%",padding:"10px 12px",fontSize:14,border:`1px solid ${BORDER}`,borderRadius:6,background:"#fff",color:NAVY,outline:"none"}} onFocus={e=>e.target.style.borderColor=ELECTRIC} onBlur={e=>e.target.style.borderColor=BORDER}/>{suffix&&<span style={{fontSize:12,color:MUTED,flexShrink:0}}>{suffix}</span>}</div>{hint&&<span style={{fontSize:12,color:MUTED,marginTop:2,display:"block"}}>{hint}</span>}</div>}

export default function ScheduleAdherenceCalculator() {
  const [d, setD] = useState(() => readScenario(TOOL_ID, DEFAULTS) || DEFAULTS);
  useEffect(() => { window.scrollTo(0, 0); clearScenarioParam(); }, []);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));

  /* Every input is clamped at the engine boundary and every correction is
     disclosed on screen and in the PDF. A scenario link can carry any value. */
  const { guards, guard } = createGuards();
  const v = {
    agents: guard("Agents scheduled", d.agents, 1, 100000, ""),
    currentAdherence: guard("Current adherence", d.currentAdherence, 1, 100, "%"),
    callsPerHour: guard("Calls per hour", d.callsPerHour, 0, 1000000, ""),
    aht: guard("AHT", d.aht, 1, 36000, " sec"),
    slaTarget: guard("SLA target", d.slaTarget, 1, 100, "%"),
    slaTime: guard("SLA time", d.slaTime, 1, 3600, " sec"),
    hourlyRate: guard("Hourly rate", d.hourlyRate, 0, 1000, "$"),
    otMultiplier: guard("OT multiplier", d.otMultiplier, 1, 5, "x"),
  };

  // Model: each point of adherence loss = fewer effective agents on queue
  const intensity = (v.callsPerHour * v.aht) / 3600;
  const drops = [0, 1, 2, 3, 4, 5, 7, 10];
  
  // Simple Erlang C approximation
  /* Erlang C through the Erlang B recurrence. The previous form built A^N / N!
     directly, which overflows to NaN above roughly 170 agents; the recurrence is
     the same quantity and stays finite at any size. */
  function erlC(agents, A) {
    const N = Math.floor(agents);
    if (N <= A || N <= 0) return 1;
    let B = 1;
    for (let k = 1; k <= N; k++) B = (A * B) / (k + A * B);
    return Math.max(0, Math.min(1, (N * B) / (N - A * (1 - B))));
  }
  function calcSL(agents, A, targetSec, ahtSec) {
    const pW = erlC(agents, A);
    const N = Math.floor(agents);
    if (N <= A) return 0;
    return Math.max(0, Math.min(1, 1 - pW * Math.exp(-(N - A) * targetSec / ahtSec)));
  }
  function calcASA(agents, A, ahtSec) {
    const pW = erlC(agents, A);
    const N = Math.floor(agents);
    if (N <= A) return 999;
    return (pW * ahtSec) / (N - A);
  }

  const scenarios = drops.map(drop => {
    const adhPct = Math.max(0, v.currentAdherence - drop);
    const effectiveAgents = Math.round(v.agents * (adhPct / 100));
    const sl = calcSL(effectiveAgents, intensity, v.slaTime, v.aht) * 100;
    const asaVal = calcASA(effectiveAgents, intensity, v.aht);
    const occ = effectiveAgents > 0 ? (intensity / effectiveAgents) * 100 : 100;
    
    // Abandonment estimate: rough model based on ASA
    const abandonPct = asaVal > 120 ? 15 : asaVal > 60 ? 8 : asaVal > 30 ? 4 : asaVal > 15 ? 2 : 1;
    
    // OT cost: agents lost * hours to cover * OT rate
    const agentsLost = v.agents - effectiveAgents;
    const dailyOTHours = agentsLost * 8; // full shift equivalent
    const dailyOTCost = dailyOTHours * v.hourlyRate * v.otMultiplier;
    const annualOTCost = dailyOTCost * 250;

    return { drop, adhPct, effectiveAgents, sl, asaVal, occ, abandonPct, agentsLost, annualOTCost };
  });

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh" }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:${FONT};background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.ag{grid-template-columns:1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.72)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      <>
          <section style={{ background: WARM, padding: "40px 28px", borderBottom: `1px solid ${BORDER}` }}>
            <div style={WRAP}>
              <h1 style={{ fontFamily: FONT, fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 16px" }}>Schedule Adherence Impact Calculator</h1>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }} className="ag">
                <Input label="Agents scheduled" value={d.agents} onChange={v => set("agents", v)} />
                <Input label="Current adherence" value={d.currentAdherence} onChange={v => set("currentAdherence", v)} suffix="%" />
                <Input label="Calls per hour" value={d.callsPerHour} onChange={v => set("callsPerHour", v)} />
                <Input label="AHT" value={d.aht} onChange={v => set("aht", v)} suffix="sec" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 12 }} className="ag">
                <Input label="SLA target" value={d.slaTarget} onChange={v => set("slaTarget", v)} suffix="%" />
                <Input label="SLA time" value={d.slaTime} onChange={v => set("slaTime", v)} suffix="sec" />
                <Input label="Hourly rate" value={d.hourlyRate} onChange={v => set("hourlyRate", v)} suffix="$/hr" />
                <Input label="OT multiplier" value={d.otMultiplier} onChange={v => set("otMultiplier", v)} suffix="x" />
              </div>
            </div>
          </section>

          <section style={{ background: "#fff", padding: "40px 28px" }}>
            <div style={WRAP}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Adherence Cascade: What Each Point Costs You</h3>
              <div style={{ overflowX: "auto", marginBottom: 24 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: DEEP, color: "#fff" }}>
                      {["Adherence", "Drop", "Effective Agents", "Service Level", "ASA", "Est. Abandon", "Annual OT Cost"].map(h => (
                        <th key={h} style={{ padding: "10px 12px", textAlign: "right", fontSize: 12, fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map((s, i) => {
                      const slColor = s.sl >= v.slaTarget ? GREEN : s.sl >= v.slaTarget - 5 ? AMBER : RED;
                      return (
                        <tr key={i} style={{ background: i === 0 ? `${GREEN}10` : i % 2 === 0 ? "#fff" : WARM, borderBottom: `1px solid ${BORDER}`, fontWeight: i === 0 ? 600 : 400 }}>
                          <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: FONT, fontSize: 16, color: i === 0 ? GREEN : NAVY }}>{s.adhPct}%</td>
                          <td style={{ padding: "10px 12px", textAlign: "right", color: i === 0 ? GREEN : RED }}>{i === 0 ? "Baseline" : `-${s.drop} pts`}</td>
                          <td style={{ padding: "10px 12px", textAlign: "right", color: NAVY }}>{s.effectiveAgents}</td>
                          <td style={{ padding: "10px 12px", textAlign: "right", color: slColor, fontWeight: 600 }}>{s.sl.toFixed(1)}%</td>
                          <td style={{ padding: "10px 12px", textAlign: "right", color: SLATE }}>{s.asaVal < 999 ? s.asaVal.toFixed(0) + "s" : "N/A"}</td>
                          <td style={{ padding: "10px 12px", textAlign: "right", color: s.abandonPct > 5 ? RED : SLATE }}>{s.abandonPct}%</td>
                          <td style={{ padding: "10px 12px", textAlign: "right", color: s.annualOTCost > 500000 ? RED : NAVY, fontWeight: 500 }}>${(s.annualOTCost / 1000).toFixed(0)}K</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.65, margin: 0 }}>
                  <strong style={{ color: "#fff" }}>Why this matters:</strong> Schedule adherence is the multiplier on every other WFM metric. A 3-point adherence drop during peak does not cost 3% more. It costs disproportionately more because the relationship between staffing and service level is non-linear. Best-in-class operations target 92-95% adherence. Below 88%, the cascade into SLA misses, overtime, and agent burnout becomes self-reinforcing.
                </p>
              </div>

              {guards.length > 0 && (
                <div style={{ background: "#FFF7E6", border: `1px solid ${AMBER}`, borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 4 }}>Inputs corrected. Every figure above was computed on the corrected values.</div>
                  {guards.map((g, i) => <div key={i} style={{ fontSize: 12, color: SLATE }}>{guardLine(g)}</div>)}
                </div>
              )}
              <ReportActions
                toolId={TOOL_ID}
                toolName="Schedule Adherence Impact Analysis"
                subtitle="Adherence Cascade Model"
                routePath={ROUTE}
                state={d}
                defaults={DEFAULTS}
                summary={[
                  { label: "Baseline adherence", value: scenarios[0].adhPct + "%" },
                  { label: "Service level at baseline", value: scenarios[0].sl.toFixed(1) + "%" },
                  { label: "Service level at 3 points of loss", value: scenarios[3].sl.toFixed(1) + "%" },
                  { label: "Annual OT at 3 points of loss", value: "$" + Math.round(scenarios[3].annualOTCost).toLocaleString() },
                ]}
                sections={[
                    { title: "Adherence Cascade", type: "table", rows: scenarios.map(s => [s.adhPct + "% adherence" + (s.drop ? " (-" + s.drop + " pts)" : " (baseline)"), "SL " + s.sl.toFixed(1) + "%, ASA " + (s.asaVal < 999 ? s.asaVal.toFixed(0) + "s" : "N/A") + ", OT $" + Math.round(s.annualOTCost).toLocaleString()]) },
                    { title: "Cascade Impact at 3 Points of Loss", type: "metrics", items: [
                      { label: "Service Level", value: scenarios[3].sl.toFixed(1) + "%", color: scenarios[3].sl >= v.slaTarget ? GREEN : RED, sub: "baseline " + scenarios[0].sl.toFixed(1) + "%" },
                      { label: "Est. Abandon", value: scenarios[3].abandonPct + "%", color: AMBER, sub: "baseline " + scenarios[0].abandonPct + "%" },
                      { label: "Annual OT Cost", value: "$" + Math.round(scenarios[3].annualOTCost).toLocaleString(), color: RED },
                    ]},
                    ...(guards.length ? [{ title: "Inputs Corrected", type: "findings", items: guards.map(guardLine) }] : []),
                    { title: "Key Findings", type: "findings", items: [
                      "At " + scenarios[0].adhPct + "% adherence the model gives a " + scenarios[0].sl.toFixed(1) + "% service level. Losing 3 points takes it to " + scenarios[3].sl.toFixed(1) + "%.",
                      "Covering 3 points of lost adherence with overtime costs about $" + Math.round(scenarios[3].annualOTCost).toLocaleString() + " a year at " + v.otMultiplier + "x, assuming a full 8-hour shift equivalent per lost agent over 250 days.",
                      "Abandonment here is a stepped planning heuristic keyed to ASA, not a measured rate.",
                    ]},
                    { title: "Next Steps", type: "next", items: [
                      { tool: "Staffing Calculator", reason: "Model the FTE buffer needed to absorb adherence variance" },
                      { tool: "Occupancy Risk Simulator", reason: "Check whether adherence gaps are creating occupancy spikes" },
                    ]},
                  ]}
              />
            </div>
          </section>
      </>
    </div>
  );
}
