import { useState, useEffect } from "react";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";
import { createGuards, guardLine } from "./src/lib/guards";

const TOOL_ID = "occupancy-risk";
const ROUTE = "/tools/occupancy-risk";
export const DEFAULTS = { agents: 50, callsPerHour: 120, aht: 360, attritionRate: 35, avgTenure: 14, hiringCost: 6500, trainingWeeks: 6, hourlyRate: 18 };

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#5B6E88"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}
function Input({label,value,onChange,suffix,hint}){return<div><label style={{fontSize:12,fontWeight:600,color:NAVY,display:"block",marginBottom:4}}>{label}</label><div style={{display:"flex",alignItems:"center",gap:4}}><input aria-label={label} type="number" value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:"100%",padding:"10px 12px",fontSize:14,border:`1px solid ${BORDER}`,borderRadius:6,background:"#fff",color:NAVY,outline:"none"}} onFocus={e=>e.target.style.borderColor=ELECTRIC} onBlur={e=>e.target.style.borderColor=BORDER}/>{suffix&&<span style={{fontSize:12,color:MUTED,flexShrink:0}}>{suffix}</span>}</div>{hint&&<span style={{fontSize:12,color:MUTED,marginTop:2,display:"block"}}>{hint}</span>}</div>}

export default function OccupancyRiskSimulator() {
  const [d, setD] = useState(() => readScenario(TOOL_ID, DEFAULTS) || DEFAULTS);
  useEffect(() => { window.scrollTo(0, 0); clearScenarioParam(); }, []);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));

  /* Every input is clamped at the engine boundary and every correction is
     disclosed on screen and in the PDF. A scenario link can carry any value. */
  const { guards, guard } = createGuards();
  const v = {
    agents: guard("Agents", d.agents, 1, 100000, ""),
    callsPerHour: guard("Calls per hour", d.callsPerHour, 0, 1000000, ""),
    aht: guard("AHT", d.aht, 1, 36000, " sec"),
    attritionRate: guard("Annual attrition", d.attritionRate, 0, 200, "%"),
    avgTenure: guard("Average tenure", d.avgTenure, 0, 600, " months"),
    hiringCost: guard("Hiring cost", d.hiringCost, 0, 1000000, "$"),
    trainingWeeks: guard("Training weeks", d.trainingWeeks, 0, 104, ""),
    hourlyRate: guard("Hourly rate", d.hourlyRate, 0, 1000, "$"),
  };


  const intensity = (v.callsPerHour * v.aht) / 3600;
  const levels = [];
  for (let occ = 70; occ <= 98; occ += 2) {
    const agentsNeeded = Math.ceil(intensity / (occ / 100));
    const idleTime = ((1 - occ / 100) * 60).toFixed(1);
    const burnoutRisk = occ > 92 ? "Critical" : occ > 88 ? "High" : occ > 85 ? "Elevated" : occ > 80 ? "Moderate" : "Low";
    const attritionImpact = occ > 90 ? v.attritionRate * 1.4 : occ > 85 ? v.attritionRate * 1.15 : v.attritionRate;
    const annualTurnoverCost = Math.round((attritionImpact / 100) * agentsNeeded * v.hiringCost);
    const color = occ > 92 ? RED : occ > 88 ? "#DC6B00" : occ > 85 ? AMBER : occ > 80 ? "#7CB342" : GREEN;
    levels.push({ occ, agentsNeeded, idleTime, burnoutRisk, attritionImpact: attritionImpact.toFixed(0), annualTurnoverCost, color });
  }

  const currentOcc = v.agents > 0 ? (intensity / v.agents) * 100 : 0;
  /* Offered load at or above the staffed agents is not an occupancy level. Agents
     cannot be busier than 100% of the time, so the queue grows without limit. The
     page says so rather than printing an occupancy above 100%. */
  const overloaded = currentOcc >= 100;
  const occLabel = overloaded ? "Over 100%" : currentOcc.toFixed(1) + "%";
  const currentColor = currentOcc > 92 ? RED : currentOcc > 88 ? "#DC6B00" : currentOcc > 85 ? AMBER : currentOcc > 80 ? "#7CB342" : GREEN;
  const currentRisk = currentOcc > 92 ? "Critical. Agents have less than 5 minutes of idle time per hour. Burnout, errors, and attrition accelerate." : currentOcc > 88 ? "High. Agents are consistently overloaded. Expect quality to degrade and sick days to increase." : currentOcc > 85 ? "Elevated. Sustainable short-term but not as a steady state. Monitor closely." : currentOcc > 80 ? "Moderate. Agents have reasonable breathing room between calls." : "Healthy. Enough idle time for after-call work, knowledge review, and mental reset.";

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh" }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:${FONT};background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.og{grid-template-columns:1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.72)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      <>
          <section style={{ background: WARM, padding: "40px 28px", borderBottom: `1px solid ${BORDER}` }}>
            <div style={WRAP}>
              <h1 style={{ fontFamily: FONT, fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 16px" }}>Occupancy Risk Simulator</h1>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }} className="og">
                <Input label="Agents on queue" value={d.agents} onChange={v => set("agents", v)} />
                <Input label="Calls per hour" value={d.callsPerHour} onChange={v => set("callsPerHour", v)} />
                <Input label="AHT" value={d.aht} onChange={v => set("aht", v)} suffix="sec" />
                <Input label="Current attrition" value={d.attritionRate} onChange={v => set("attritionRate", v)} suffix="%" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 12 }} className="og">
                <Input label="Hiring cost per agent" value={d.hiringCost} onChange={v => set("hiringCost", v)} suffix="$" />
                <Input label="Training ramp" value={d.trainingWeeks} onChange={v => set("trainingWeeks", v)} suffix="weeks" />
                <Input label="Hourly rate" value={d.hourlyRate} onChange={v => set("hourlyRate", v)} suffix="$/hr" />
                <Input label="Avg tenure" value={d.avgTenure} onChange={v => set("avgTenure", v)} suffix="months" />
              </div>
            </div>
          </section>

          <section style={{ background: "#fff", padding: "40px 28px" }}>
            <div style={WRAP}>
              {/* Current state */}
              <div style={{ background: `${currentColor}10`, border: `2px solid ${currentColor}`, borderRadius: 12, padding: "24px 28px", marginBottom: 28 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: currentColor, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>Your Current Occupancy</div>
                    <div style={{ fontFamily: FONT, fontSize: 42, color: currentColor }}>{occLabel}</div>{overloaded && <div style={{ fontSize: 12, color: RED, marginTop: 4 }}>Offered load of {intensity.toFixed(1)} Erlangs exceeds the {v.agents} agents staffed. The queue grows without limit.</div>}
                  </div>
                  <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.6, maxWidth: 400, margin: 0 }}>{currentRisk}</p>
                </div>
              </div>

              {/* Occupancy ladder */}
              <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Occupancy Ladder: What Each Level Actually Means</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 28 }}>
                {levels.map((l, i) => {
                  const isCurrent = Math.abs(l.occ - currentOcc) < 2;
                  return (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 80px 80px 80px 100px 1fr", gap: 8, alignItems: "center", padding: "8px 12px", background: isCurrent ? `${l.color}10` : i % 2 === 0 ? WARM : "#fff", borderRadius: 6, border: isCurrent ? `2px solid ${l.color}` : `1px solid transparent`, fontSize: 12 }} className="og">
                      <span style={{ fontFamily: FONT, fontSize: 18, color: l.color, fontWeight: 400 }}>{l.occ}%</span>
                      <span style={{ color: MUTED }}>{l.agentsNeeded} agents</span>
                      <span style={{ color: MUTED }}>{l.idleTime} min/hr</span>
                      <span style={{ color: l.color, fontWeight: 600 }}>{l.burnoutRisk}</span>
                      <span style={{ color: SLATE }}>{l.attritionImpact}% attrition</span>
                      <span style={{ color: NAVY, fontWeight: 500 }}>${(l.annualTurnoverCost / 1000).toFixed(0)}K/yr turnover</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
                {currentOcc > 85 && (
                  <div style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: 12, fontWeight: 700, color: RED, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8 }}>What This Occupancy Costs You</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "10px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)" }}>Extra agents needed for 85%</div>
                        <div style={{ fontFamily: FONT, fontSize: 22, color: "#fff" }}>+{Math.ceil(v.agents * (currentOcc / 85 - 1))}</div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "10px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)" }}>Estimated extra attrition cost</div>
                        <div style={{ fontFamily: FONT, fontSize: 22, color: RED }}>${Math.round(v.agents * 0.15 * v.hiringCost * (currentOcc - 85) / 10 / 1000)}K/yr</div>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "10px", textAlign: "center", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)" }}>Staffing cost to fix</div>
                        <div style={{ fontFamily: FONT, fontSize: 22, color: GREEN }}>${Math.round(Math.ceil(v.agents * (currentOcc / 85 - 1)) * v.hourlyRate * 2080 / 1000)}K/yr</div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", margin: 0, lineHeight: 1.5 }}>If the staffing cost is less than the attrition cost, adding agents is the better investment. It usually is.</p>
                  </div>
                )}
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.55, margin: 0 }}>
                  The most efficient occupancy target for sustained operations is 82-86%. Above 88%, attrition increases 15-40% and the cost of replacement exceeds the staffing savings within 6 months.
                </p>
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <a href="/tools/staffing-calculator" style={{ fontSize: 12, fontWeight: 600, color: LIGHT, padding: "5px 14px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.15)" }}>→ Staffing Calculator: model the FTE for 85%</a>
                  <a href="/tools/attrition-cost" style={{ fontSize: 12, fontWeight: 600, color: LIGHT, padding: "5px 14px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.15)" }}>→ Attrition Cost: quantify the turnover impact</a>
                </div>
              </div>

              {guards.length > 0 && (
                <div style={{ background: "#FFF7E6", border: `1px solid ${AMBER}`, borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 4 }}>Inputs corrected. Every figure above was computed on the corrected values.</div>
                  {guards.map((g, i) => <div key={i} style={{ fontSize: 12, color: SLATE }}>{guardLine(g)}</div>)}
                </div>
              )}
              <ReportActions
                toolId={TOOL_ID}
                toolName="Occupancy Risk Analysis"
                subtitle="Occupancy Threshold and Attrition Impact Model"
                routePath={ROUTE}
                state={d}
                defaults={DEFAULTS}
                summary={[
                  { label: "Current occupancy", value: occLabel },
                  { label: "Calls per hour", value: String(v.callsPerHour) },
                  { label: "Agents", value: String(v.agents) },
                ]}
                sections={[
                    { title: "Occupancy Analysis", type: "metrics", items: [
                      { label: "Current Occupancy", value: occLabel, color: currentColor },
                      { label: "Risk Band", value: currentOcc > 92 ? "Critical" : currentOcc > 88 ? "High" : currentOcc > 85 ? "Elevated" : currentOcc > 80 ? "Moderate" : "Low", color: currentColor },
                    ]},
                    ...(guards.length ? [{ title: "Inputs Corrected", type: "findings", items: guards.map(guardLine) }] : []),
                    { title: "Key Findings", type: "findings", items: [
                      overloaded ? "Offered load of " + intensity.toFixed(1) + " Erlangs exceeds the " + v.agents + " agents staffed. Occupancy cannot exceed 100%; the queue grows without limit until staffing rises." : "At " + currentOcc.toFixed(1) + "% occupancy, agents have about " + ((100 - currentOcc) * 0.6).toFixed(1) + " minutes per hour between contacts.",
                      currentOcc > 85 ? "This model raises attrition by 1.15x above 85% occupancy and by 1.4x above 90%. These multipliers are planning heuristics, not measured values for your operation." : "Occupancy is below the 85% level where this model begins to raise attrition.",
                    ]},
                    { title: "Next Steps", type: "next", items: [
                      { tool: "Staffing Calculator", reason: "Model the FTE needed to bring occupancy to your target" },
                      { tool: "Attrition Cost Calculator", reason: "Price the turnover if high occupancy drives exits" },
                    ]},
                  ]}
              />
            </div>
          </section>
      </>
    </div>
  );
}
