import { useState, useEffect } from "react";
import { ToolNav, ToolHero, ToolStart } from "./src/lib/ToolShell";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";
import { createGuards, guardLine } from "./src/lib/guards";

const TOOL_ID = "shrinkage-planner";
const ROUTE = "/tools/shrinkage-planner";
export const DEFAULTS = { agents: 200, hourlyRate: 18, breaks: 8, coaching: 3, training: 4, meetings: 2, systemDown: 1, pto: 8, absenteeism: 5, lateAdherence: 2 };

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#5B6E88"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}
function Input({label,value,onChange,suffix,hint}){return<div><label style={{fontSize:12,fontWeight:600,color:NAVY,display:"block",marginBottom:4}}>{label}</label><div style={{display:"flex",alignItems:"center",gap:4}}><input aria-label={label} type="number" value={value} onChange={e=>onChange(Number(e.target.value))} style={{width:"100%",padding:"10px 12px",fontSize:14,border:`1px solid ${BORDER}`,borderRadius:6,background:"#fff",color:NAVY,outline:"none"}} onFocus={e=>e.target.style.borderColor=ELECTRIC} onBlur={e=>e.target.style.borderColor=BORDER}/>{suffix&&<span style={{fontSize:12,color:MUTED,flexShrink:0}}>{suffix}</span>}</div>{hint&&<span style={{fontSize:12,color:MUTED,marginTop:2,display:"block"}}>{hint}</span>}</div>}

export default function ShrinkagePlanner() {
  const [d, setD] = useState(() => readScenario(TOOL_ID, DEFAULTS) || DEFAULTS);
  useEffect(() => { window.scrollTo(0, 0); clearScenarioParam(); }, []);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));

  /* Every input is clamped at the engine boundary and every correction is
     disclosed on screen and in the PDF. A scenario link can carry any value. */
  const { guards, guard } = createGuards();
  const v = {
    agents: guard("Scheduled agents", d.agents, 1, 100000, ""),
    hourlyRate: guard("Hourly rate", d.hourlyRate, 0, 1000, "$"),
    breaks: guard("Breaks", d.breaks, 0, 100, "%"),
    coaching: guard("Coaching / 1:1s", d.coaching, 0, 100, "%"),
    training: guard("Training", d.training, 0, 100, "%"),
    meetings: guard("Team meetings", d.meetings, 0, 100, "%"),
    systemDown: guard("System downtime", d.systemDown, 0, 100, "%"),
    pto: guard("PTO / vacation", d.pto, 0, 100, "%"),
    absenteeism: guard("Absenteeism", d.absenteeism, 0, 100, "%"),
    lateAdherence: guard("Late / adherence", d.lateAdherence, 0, 100, "%"),
  };


  const planned = [
    { name: "Breaks", pct: v.breaks, type: "planned" },
    { name: "Coaching / 1:1s", pct: v.coaching, type: "planned" },
    { name: "Training", pct: v.training, type: "planned" },
    { name: "Team meetings", pct: v.meetings, type: "planned" },
  ];
  const unplanned = [
    { name: "System downtime", pct: v.systemDown, type: "unplanned" },
    { name: "PTO / vacation", pct: v.pto, type: "unplanned" },
    { name: "Absenteeism", pct: v.absenteeism, type: "unplanned" },
    { name: "Late / adherence", pct: v.lateAdherence, type: "unplanned" },
  ];
  const all = [...planned, ...unplanned];
  const totalPlanned = planned.reduce((a, c) => a + c.pct, 0);
  const totalUnplanned = unplanned.reduce((a, c) => a + c.pct, 0);
  /* Categories are clamped one by one, so their sum can still pass 100%. No
     operation loses more than all of its scheduled time, so the total is capped
     at 100% and the correction is disclosed like any other. */
  const rawShrinkage = totalPlanned + totalUnplanned;
  if (rawShrinkage > 100) guards.push({ label: "Total shrinkage (sum of categories)", entered: rawShrinkage, used: 100, unit: "%" });
  const totalShrinkage = Math.min(100, rawShrinkage);
  const availablePct = 100 - totalShrinkage;
  const effectiveAgents = Math.round(v.agents * (availablePct / 100));
  const gap = v.agents - effectiveAgents;
  const annualCost = gap * v.hourlyRate * 2080;
  const shrinkColor = totalShrinkage > 35 ? RED : totalShrinkage > 28 ? AMBER : GREEN;

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh" }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:${FONT};background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.sg{grid-template-columns:1fr!important}}`}</style>
      <ToolNav wrap={WRAP} />
      <ToolHero wrap={WRAP} eyebrow="WFM + Staffing" title="Shrinkage Planner"
        intro="Shrinkage is the share of paid agent time that never reaches the queue. Enter each planned and unplanned category as a percent of paid hours. The planner totals them and shows the extra staff and annual cost that total implies at your inputs." />

      <>
          <section style={{ background: WARM, padding: "40px 28px", borderBottom: `1px solid ${BORDER}` }}>
            <div style={WRAP}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="sg">
                <div>
                  <h3 style={{ fontSize: 12, fontWeight: 700, color: GREEN, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Planned Shrinkage</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Input label="Breaks" value={d.breaks} onChange={v => set("breaks", v)} suffix="%" />
                    <Input label="Coaching / 1:1s" value={d.coaching} onChange={v => set("coaching", v)} suffix="%" />
                    <Input label="Training" value={d.training} onChange={v => set("training", v)} suffix="%" />
                    <Input label="Team meetings" value={d.meetings} onChange={v => set("meetings", v)} suffix="%" />
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: 12, fontWeight: 700, color: RED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Unplanned Shrinkage</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <Input label="System downtime" value={d.systemDown} onChange={v => set("systemDown", v)} suffix="%" />
                    <Input label="PTO / vacation" value={d.pto} onChange={v => set("pto", v)} suffix="%" />
                    <Input label="Absenteeism" value={d.absenteeism} onChange={v => set("absenteeism", v)} suffix="%" />
                    <Input label="Late / adherence" value={d.lateAdherence} onChange={v => set("lateAdherence", v)} suffix="%" />
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }} className="sg">
                <Input label="Total roster agents" value={d.agents} onChange={v => set("agents", v)} />
                <Input label="Avg hourly rate" value={d.hourlyRate} onChange={v => set("hourlyRate", v)} suffix="$/hr" />
              </div>
            </div>
          </section>

          <section style={{ background: "#fff", padding: "40px 28px" }}>
            <div style={WRAP}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 28 }} className="sg">
                <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Total Shrinkage</div>
                  <div style={{ fontFamily: FONT, fontSize: 36, color: shrinkColor }}>{totalShrinkage.toFixed(1)}%</div>
                  <div style={{ fontSize: 12, color: MUTED }}>{totalShrinkage > 35 ? "Above industry norm" : totalShrinkage > 28 ? "Within range" : "Well managed"}</div>
                </div>
                <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Effective Agents</div>
                  <div style={{ fontFamily: FONT, fontSize: 36, color: ELECTRIC }}>{effectiveAgents}</div>
                  <div style={{ fontSize: 12, color: MUTED }}>Of {d.agents} on roster</div>
                </div>
                <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Staffing Gap</div>
                  <div style={{ fontFamily: FONT, fontSize: 36, color: RED }}>{gap}</div>
                  <div style={{ fontSize: 12, color: MUTED }}>Agents lost to shrinkage</div>
                </div>
                <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Annual Cost of Gap</div>
                  <div style={{ fontFamily: FONT, fontSize: 30, color: "#fff" }}>${(annualCost / 1000000).toFixed(2)}M</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)" }}>Labor value of lost capacity</div>
                </div>
              </div>

              {/* Visual breakdown */}
              <div style={{ marginBottom: 28 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Shrinkage Breakdown</h3>
                <div style={{ display: "flex", height: 32, borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
                  {all.map((item, i) => item.pct > 0 && (
                    <div key={i} style={{ width: `${item.pct}%`, background: item.type === "planned" ? GREEN : RED, opacity: 0.6 + (i * 0.05), display: "flex", alignItems: "center", justifyContent: "center", transition: "width 0.3s" }}>
                      {item.pct >= 3 && <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{item.name}</span>}
                    </div>
                  ))}
                  <div style={{ flex: 1, background: ELECTRIC, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>Available ({availablePct.toFixed(0)}%)</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 12, color: MUTED }}>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: GREEN, marginRight: 4, verticalAlign: "middle" }} />Planned: {totalPlanned.toFixed(1)}%</span>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: RED, marginRight: 4, verticalAlign: "middle" }} />Unplanned: {totalUnplanned.toFixed(1)}%</span>
                  <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: ELECTRIC, marginRight: 4, verticalAlign: "middle" }} />Available: {availablePct.toFixed(1)}%</span>
                </div>
              </div>

              <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.65, margin: 0 }}>
                  <strong style={{ color: "#fff" }}>Industry benchmark:</strong> Total shrinkage typically runs 28-35% across most contact center verticals. Planned shrinkage (breaks, training, coaching) is investment in your team. Unplanned shrinkage (absenteeism, late arrivals) is where the controllable cost lives. Reducing unplanned shrinkage by 3-5 points is often the highest-ROI workforce initiative available.
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
                toolName="Shrinkage Analysis"
                subtitle="8-Category Shrinkage Model"
                routePath={ROUTE}
                state={d}
                defaults={DEFAULTS}
                summary={[
                  { label: "Total shrinkage", value: totalShrinkage.toFixed(1) + "%" },
                  { label: "Agents available", value: String(effectiveAgents) },
                  { label: "Annual cost impact", value: "$" + Math.round(annualCost).toLocaleString() },
                ]}
                sections={[
                    { title: "Shrinkage Breakdown", type: "table", rows: all.map(c => [c.name + " (" + c.type + ")", c.pct.toFixed(1) + "%"]).concat([["Total Shrinkage", totalShrinkage.toFixed(1) + "%"]]) },
                    { title: "Key Metrics", type: "metrics", items: [
                      { label: "Total Shrinkage", value: totalShrinkage.toFixed(1) + "%", color: shrinkColor },
                      { label: "Annual Cost Impact", value: "$" + Math.round(annualCost).toLocaleString(), color: RED },
                      { label: "Planned vs Unplanned", value: totalPlanned.toFixed(1) + "% / " + totalUnplanned.toFixed(1) + "%", color: ELECTRIC },
                    ]},
                    ...(guards.length ? [{ title: "Inputs Corrected", type: "findings", items: guards.map(guardLine) }] : []),
                    { title: "Key Findings", type: "findings", items: [
                      "Total shrinkage of " + totalShrinkage.toFixed(1) + "% means that of " + v.agents + " scheduled agents, about " + effectiveAgents + " are available to handle contacts.",
                      totalUnplanned > totalPlanned ? "Unplanned shrinkage (" + totalUnplanned.toFixed(1) + "%) exceeds planned (" + totalPlanned.toFixed(1) + "%). Start with the largest unplanned category." : "Planned shrinkage (" + totalPlanned.toFixed(1) + "%) is the larger share. Check whether coaching and training time is protected or absorbed.",
                      "Annual cost of the " + gap + " unavailable agent equivalents at $" + v.hourlyRate + " per hour over 2,080 hours: $" + Math.round(annualCost).toLocaleString() + ".",
                    ]},
                    { title: "Next Steps", type: "next", items: [
                      { tool: "Staffing Calculator", reason: "Model required FTE with this shrinkage factor" },
                      { tool: "Occupancy Risk Simulator", reason: "Check whether shrinkage is pushing occupancy up" },
                    ]},
                  ]}
              />
            </div>
          </section>
      </>
    </div>
  );
}
