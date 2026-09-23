import { useState, useEffect } from "react";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";
import { createGuards, guardLine } from "./src/lib/guards";

const TOOL_ID = "aht-decomposition";
const ROUTE = "/tools/aht-decomposition";
export const DEFAULTS = { values: { talk: 210, hold: 55, wrap: 60, transfer: 15, search: 30, admin: 25 }, contactType: "blended" };

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#5B6E88"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const COMPONENTS = [
  { id: "talk", name: "Talk Time", color: ELECTRIC, icon: "🗣", desc: "Active conversation between agent and customer", benchmark: "55-65% of AHT", reducible: "Low. This is the core work. Reduce only through better knowledge access and agent skill." },
  { id: "hold", name: "Hold Time", color: AMBER, icon: "⏸", desc: "Customer waiting while agent searches, consults, or processes", benchmark: "10-18% of AHT", reducible: "High. Usually caused by system friction, missing knowledge, or authorization delays." },
  { id: "wrap", name: "After-Call Work", color: "#7C3AED", icon: "📝", desc: "Disposition, notes, case updates, follow-up tasks after the call ends", benchmark: "12-20% of AHT", reducible: "High. AI summarization, auto-disposition, and structured templates cut this significantly." },
  { id: "transfer", name: "Transfer / Conference", color: RED, icon: "↗️", desc: "Time spent initiating, waiting for, and executing warm or cold transfers", benchmark: "3-8% of AHT", reducible: "Medium. Better routing and agent skilling reduces transfer need. Warm transfers take longer but improve CX." },
  { id: "search", name: "Knowledge Search", color: "#0EA5E9", icon: "🔍", desc: "Agent searching knowledge base, SOPs, or asking a peer during the interaction", benchmark: "5-12% of AHT", reducible: "Very high. Real-time agent assist and better knowledge architecture cut this dramatically." },
  { id: "admin", name: "System / Admin", color: "#6B7280", icon: "💻", desc: "Navigating between applications, copying data, system latency, compliance steps", benchmark: "5-10% of AHT", reducible: "High. Desktop unification, RPA, and API integration between systems." },
];

function Slider({ component, value, onChange }) {
  return (
    <div style={{ padding: "14px 16px", background: WARM, borderRadius: 8, border: `1px solid ${BORDER}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>{component.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{component.name}</span>
        </div>
        <span style={{ fontFamily: FONT, fontSize: 20, color: component.color, fontWeight: 400 }}>{value}s</span>
      </div>
      <input type="range" aria-label={`${component.name}, seconds`} min={0} max={300} value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: component.color, height: 6, cursor: "pointer" }} />
      <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{component.desc}</div>
    </div>
  );
}

export default function AHTDecomposition() {
  const [init] = useState(() => readScenario(TOOL_ID, DEFAULTS) || DEFAULTS);
  const [raw, setValues] = useState(init.values);
  const [contactType, setContactType] = useState(init.contactType);
  useEffect(() => { window.scrollTo(0, 0); clearScenarioParam(); }, []);

  const PRESETS = {
    blended: { talk: 210, hold: 55, wrap: 60, transfer: 15, search: 30, admin: 25 },
    billing: { talk: 180, hold: 70, wrap: 45, transfer: 20, search: 25, admin: 20 },
    techSupport: { talk: 240, hold: 80, wrap: 50, transfer: 30, search: 45, admin: 35 },
    sales: { talk: 280, hold: 30, wrap: 70, transfer: 10, search: 15, admin: 20 },
    simple: { talk: 120, hold: 20, wrap: 30, transfer: 5, search: 10, admin: 15 },
  };

  const applyPreset = (key) => { setContactType(key); setValues(PRESETS[key]); };
  const set = (id, val) => setValues(prev => ({ ...prev, [id]: val }));

  /* Every component is clamped to 0 to 3,600 seconds at the engine boundary, and
     talk time to at least 1 second so a total of zero cannot divide. Every
     correction is disclosed on screen and in the PDF. */
  const { guards, guard } = createGuards();
  const values = Object.fromEntries(COMPONENTS.map(c => [c.id, guard(c.name, raw[c.id], c.id === "talk" ? 1 : 0, 3600, " sec")]));

  const totalAHT = Object.values(values).reduce((a, b) => a + b, 0);
  const talkPct = totalAHT > 0 ? (values.talk / totalAHT) * 100 : 0;
  const nonTalkPct = 100 - talkPct;
  const reducibleTime = values.hold + values.wrap + values.search + values.admin;
  const reduciblePct = totalAHT > 0 ? (reducibleTime / totalAHT) * 100 : 0;

  // Optimization scenarios
  const scenarios = [
    { name: "AI Summarization", targets: { wrap: 0.5 }, desc: "Auto-generate call summaries and disposition", investment: "Agent assist platform" },
    { name: "Knowledge AI", targets: { search: 0.4, hold: 0.15 }, desc: "Real-time knowledge surfacing reduces search and hold", investment: "Knowledge AI + RAG" },
    { name: "Desktop Unification", targets: { admin: 0.5, hold: 0.1 }, desc: "Single pane of glass eliminates app-switching", investment: "Agent desktop consolidation" },
    { name: "Better Routing", targets: { transfer: 0.5, talk: 0.05 }, desc: "Right agent first time reduces transfers and talk time", investment: "Intent-driven routing" },
  ].map(s => {
    let newTotal = totalAHT;
    Object.entries(s.targets).forEach(([k, reduction]) => { newTotal -= values[k] * reduction; });
    const saved = totalAHT - newTotal;
    return { ...s, newAHT: Math.round(newTotal), savedSec: Math.round(saved), savedPct: ((saved / totalAHT) * 100).toFixed(1) };
  });

  // All optimizations combined
  const combinedSaved = scenarios.reduce((a, s) => a + s.savedSec, 0);
  const combinedNew = Math.max(values.talk * 0.9, totalAHT - combinedSaved); // floor at ~90% talk time

  const fmtTime = (s) => s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh" }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:${FONT};background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.pg{grid-template-columns:1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.72)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      <>
        <section style={{ background: WARM, padding: "40px 28px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={WRAP}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
              <div>
                <h1 style={{ fontFamily: FONT, fontSize: 24, fontWeight: 400, color: NAVY, margin: 0 }}>AHT Decomposition</h1>
                <p style={{ fontSize: 13, color: MUTED, margin: "4px 0 0" }}>Adjust each component. See where time goes and what is reducible.</p>
              </div>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {[["blended","Blended"],["billing","Billing"],["techSupport","Tech Support"],["sales","Sales"],["simple","Simple"]].map(([k,l]) => (
                  <button key={k} onClick={() => applyPreset(k)} style={{ padding: "6px 12px", fontSize: 12, fontWeight: 600, borderRadius: 4, border: `1px solid ${contactType === k ? ELECTRIC : BORDER}`, background: contactType === k ? ELECTRIC : "#fff", color: contactType === k ? "#fff" : MUTED, cursor: "pointer" }}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="pg">
              {COMPONENTS.map(c => <Slider key={c.id} component={c} value={raw[c.id]} onChange={v => set(c.id, v)} />)}
            </div>
          </div>
        </section>

        <section style={{ background: "#fff", padding: "40px 28px" }}>
          <div style={WRAP}>
            {/* Summary cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 28 }} className="pg">
              <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Total AHT</div>
                <div style={{ fontFamily: FONT, fontSize: 32, color: "#fff" }}>{fmtTime(totalAHT)}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)" }}>{(totalAHT / 60).toFixed(1)} minutes</div>
              </div>
              <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Actual Talk</div>
                <div style={{ fontFamily: FONT, fontSize: 32, color: ELECTRIC }}>{talkPct.toFixed(0)}%</div>
                <div style={{ fontSize: 12, color: MUTED }}>{fmtTime(values.talk)} of conversation</div>
              </div>
              <div style={{ background: WARM, border: `1px solid ${nonTalkPct > 45 ? RED : nonTalkPct > 38 ? AMBER : GREEN}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Non-Talk Time</div>
                <div style={{ fontFamily: FONT, fontSize: 32, color: nonTalkPct > 45 ? RED : nonTalkPct > 38 ? AMBER : GREEN }}>{nonTalkPct.toFixed(0)}%</div>
                <div style={{ fontSize: 12, color: MUTED }}>{nonTalkPct > 45 ? "Significant friction" : nonTalkPct > 38 ? "Room for improvement" : "Well optimized"}</div>
              </div>
              <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", textAlign: "center" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6 }}>Reducible Time</div>
                <div style={{ fontFamily: FONT, fontSize: 32, color: AMBER }}>{fmtTime(reducibleTime)}</div>
                <div style={{ fontSize: 12, color: MUTED }}>{reduciblePct.toFixed(0)}% of total AHT</div>
              </div>
            </div>

            {/* Visual decomposition bar */}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 8 }}>Time Composition</h3>
            <div style={{ display: "flex", height: 44, borderRadius: 8, overflow: "hidden", marginBottom: 6 }}>
              {COMPONENTS.map(c => {
                const pct = totalAHT > 0 ? (values[c.id] / totalAHT) * 100 : 0;
                return pct > 0 && (
                  <div key={c.id} style={{ width: `${pct}%`, background: c.color, display: "flex", alignItems: "center", justifyContent: "center", transition: "width 0.3s", minWidth: pct > 5 ? 0 : 0 }}>
                    {pct >= 8 && <span style={{ fontSize: 12, color: "#fff", fontWeight: 600, textAlign: "center", lineHeight: 1.2 }}>{c.icon} {pct.toFixed(0)}%</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
              {COMPONENTS.map(c => (
                <span key={c.id} style={{ fontSize: 12, color: MUTED, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: c.color, flexShrink: 0 }} />{c.name}: {fmtTime(values[c.id])}
                </span>
              ))}
            </div>

            {/* Component deep-dive */}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Component Analysis</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 28 }}>
              {COMPONENTS.map((c, i) => {
                const pct = totalAHT > 0 ? (values[c.id] / totalAHT) * 100 : 0;
                return (
                  <div key={c.id} style={{ display: "grid", gridTemplateColumns: "140px 60px 1fr 140px", gap: 12, alignItems: "center", padding: "10px 14px", background: i % 2 === 0 ? WARM : "#fff", borderRadius: 6, borderLeft: `3px solid ${c.color}` }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{c.icon} {c.name}</span>
                    <span style={{ fontFamily: FONT, fontSize: 18, color: c.color }}>{pct.toFixed(0)}%</span>
                    <div>
                      <div style={{ fontSize: 12, color: MUTED }}>Benchmark: {c.benchmark}</div>
                    </div>
                    <div style={{ fontSize: 12, color: c.reducible.startsWith("Very high") || c.reducible.startsWith("High") ? GREEN : c.reducible.startsWith("Medium") ? AMBER : MUTED, fontWeight: 600 }}>
                      {c.reducible.split(".")[0]}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Optimization scenarios */}
            <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Targeted Optimization Scenarios</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }} className="pg">
              {scenarios.map((s, i) => (
                <div key={i} style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{s.name}</span>
                    <span style={{ fontFamily: FONT, fontSize: 20, color: GREEN }}>-{s.savedSec}s</span>
                  </div>
                  <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, margin: "0 0 6px" }}>{s.desc}</p>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ color: MUTED }}>New AHT: {fmtTime(s.newAHT)}</span>
                    <span style={{ color: GREEN, fontWeight: 600 }}>-{s.savedPct}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Combined impact */}
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>If you implemented all four</div>
                  <div style={{ fontFamily: FONT, fontSize: 28, color: "#fff" }}>{fmtTime(totalAHT)} → {fmtTime(Math.round(combinedNew))}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: FONT, fontSize: 28, color: GREEN }}>-{((1 - combinedNew / totalAHT) * 100).toFixed(0)}%</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)" }}>AHT reduction without cutting talk time</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.65, margin: "16px 0 0" }}>
                The goal is not shorter calls. The goal is less time spent on activities that are not conversation. Hold, search, admin, and wrap are where AHT reduction lives. Talk time is where resolution quality lives. Protect the latter while attacking the former.
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
              toolName="AHT Decomposition Analysis"
              subtitle={`${fmtTime(totalAHT)} total handle time, ${COMPONENTS.length} components analyzed`}
              routePath={ROUTE}
              state={{ values: raw, contactType }}
              defaults={DEFAULTS}
              summary={[
                { label: "Total AHT", value: fmtTime(totalAHT) },
                { label: "Talk share", value: `${talkPct.toFixed(0)}%` },
                { label: "Reducible time", value: fmtTime(reducibleTime) },
              ]}
              sections={[
                  { title: "AHT Component Breakdown", type: "table", rows: COMPONENTS.map(c => [c.name, `${fmtTime(values[c.id])} (${(totalAHT > 0 ? (values[c.id] / totalAHT) * 100 : 0).toFixed(0)}%)`]) },
                  { title: "Summary Metrics", type: "metrics", items: [
                    { label: "Total AHT", value: fmtTime(totalAHT), color: ELECTRIC },
                    { label: "Actual Talk Time", value: `${talkPct.toFixed(0)}%`, color: ELECTRIC, sub: fmtTime(values.talk) },
                    { label: "Non-Talk Time", value: `${nonTalkPct.toFixed(0)}%`, color: nonTalkPct > 45 ? RED : nonTalkPct > 38 ? AMBER : GREEN },
                    { label: "Reducible Time", value: fmtTime(reducibleTime), color: AMBER, sub: `${reduciblePct.toFixed(0)}% of AHT` },
                  ]},
                  ...(guards.length ? [{ title: "Inputs Corrected", type: "findings", items: guards.map(guardLine) }] : []),
                  { title: "Key Findings", type: "findings", items: [
                    `Your total AHT is ${fmtTime(totalAHT)}. Only ${talkPct.toFixed(0)}% is actual customer conversation.`,
                    `${fmtTime(reducibleTime)} (${reduciblePct.toFixed(0)}%) is spent on hold, wrap, search, and admin, all reducible without cutting talk time.`,
                    ...scenarios.filter(s => s.savedSec > 10).map(s => `${s.name} is modelled to save ${s.savedSec}s per contact (${s.savedPct}% reduction): ${s.desc}.`),
                    `Under these reduction assumptions, combined optimizations model AHT falling from ${fmtTime(totalAHT)} to ${fmtTime(Math.round(combinedNew))}, a ${((1 - combinedNew / totalAHT) * 100).toFixed(0)}% improvement.`,
                  ]},
                  { title: "Optimization Priorities", type: "actions", items: scenarios.sort((a, b) => b.savedSec - a.savedSec).map((s, i) => ({
                    action: `${s.name}: -${s.savedSec}s per contact`,
                    detail: `${s.desc}. New AHT: ${fmtTime(s.newAHT)}. Investment required: ${s.investment}.`,
                    priority: i === 0 ? "high" : i === 1 ? "medium" : undefined,
                  })) },
                  { title: "Next Steps", type: "next", items: [
                    { tool: "Staffing Calculator", reason: "Model how AHT reduction changes your FTE requirement" },
                    { tool: "Cost per Contact Calculator", reason: "See how AHT reduction impacts per-contact economics" },
                    { tool: "Attrition Cost Calculator", reason: "Price the turnover that tooling friction and new-hire ramp drive" },
                  ]},
                  { title: "Method", type: "text", content: "Reduction factors per initiative (for example AI summarization removing half of after-call work) are planning heuristics, not measured results for your operation. Combined savings floor at 90% of talk time. " + "The goal is not shorter calls. The goal is less time spent on activities that are not conversation. Hold, search, admin, and wrap are where AHT reduction lives. Talk time is where resolution quality lives. Protect the latter while attacking the former." },
                ]}
            />
          </div>
        </section>
      </>
    </div>
  );
}
