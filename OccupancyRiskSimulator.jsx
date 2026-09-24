import { useState, useEffect } from "react";
import { ToolNav, ToolHero } from "./src/lib/ToolShell";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";
import { createGuards, guardLine, money } from "./src/lib/guards";
import { BENCH, benchmark, benchmarksForTool, BENCHMARK_SOURCES } from "./src/lib/benchmarks";
import { runOccupancy } from "./src/lib/occupancy";

/* Occupancy Risk Simulator. The arithmetic lives in src/lib/occupancy.js between engine
   markers; every constant it uses is read here from the registry and passed in. */

const TOOL_ID = "occupancy-risk";
const ROUTE = "/tools/occupancy-risk";
const METHOD = "/methodology/occupancy-risk";
/* The opening case: 44 Erlangs over 50 agents, 88% occupancy, in the caution band, so the
   tool opens on the problem it exists for. An example, not a benchmark. */
export const DEFAULTS = { agents: 50, callsPerHour: 440, aht: 360, attritionRate: 35, hiringCost: 6500, trainingWeeks: 6, hourlyRate: benchmark("market.wage.agent"), target: Math.round(BENCH.occupancy.healthyMax * 100) };
/* The registry values the engine runs on. One object, so the page, the PDF and the method
   page can never disagree with the engine. */
export const OCC_PARAMS = {
  bands: BENCH.occupancy,
  mult: { caution: benchmark("occ.attrition.mult.caution"), critical: benchmark("occ.attrition.mult.critical") },
  load: benchmark("load.benefits"),
  hoursWeek: benchmark("occ.hours.week"),
  hoursYear: benchmark("occ.hours.year"),
};

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#5B6E88"; const BORDER = "#D8E3ED";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
const BAND = { healthy: { label: "Healthy", color: "#047857" }, caution: { label: "Caution", color: "#B45309" }, critical: { label: "Critical", color: "#B91C1C" } };
const pct = (x, d = 1) => (x * 100).toFixed(d) + "%";
const k = (x) => "$" + Math.round(x / 1000).toLocaleString("en-US") + "K";
const B = OCC_PARAMS.bands;
const BAND_TEXT = {
  healthy: `At or below ${pct(B.healthyMax, 0)}, the platform's healthy band. Agents keep recovery time between contacts.`,
  caution: `Above ${pct(B.healthyMax, 0)} and up to ${pct(B.cautionMax, 0)}, the caution band. Workable for peaks; as a steady state this model raises attrition ${OCC_PARAMS.mult.caution}x.`,
  critical: `Above ${pct(B.cautionMax, 0)}, the critical band. Recovery time between contacts is minimal; this model raises attrition ${OCC_PARAMS.mult.critical}x.`,
};

function Input({ label, value, onChange, suffix, hint }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: NAVY, display: "block", marginBottom: 4 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <input aria-label={label} type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY }} />
        {suffix && <span style={{ fontSize: 12, color: MUTED, flexShrink: 0 }}>{suffix}</span>}
      </div>
      {hint && <span style={{ fontSize: 12, color: MUTED, marginTop: 2, display: "block" }}>{hint}</span>}
    </div>
  );
}

export default function OccupancyRiskSimulator() {
  const [d, setD] = useState(() => ({ ...DEFAULTS, ...(readScenario(TOOL_ID, DEFAULTS) || {}) }));
  useEffect(() => { window.scrollTo(0, 0); clearScenarioParam(); }, []);
  const set = (key, val) => setD((prev) => ({ ...prev, [key]: val }));

  /* Every input is clamped at the engine boundary and every correction is disclosed on
     screen and in the PDF. A scenario link can carry any value. */
  const { guards, guard } = createGuards();
  const v = {
    agents: guard("Agents", d.agents, 1, 100000, ""),
    callsPerHour: guard("Calls per hour", d.callsPerHour, 0, 1000000, ""),
    aht: guard("AHT", d.aht, 1, 36000, " sec"),
    attritionRate: guard("Annual attrition", d.attritionRate, 0, 200, "%"),
    hiringCost: guard("Hiring cost", d.hiringCost, 0, 1000000, "$"),
    trainingWeeks: guard("Training weeks", d.trainingWeeks, 0, 104, ""),
    hourlyRate: guard("Hourly rate", d.hourlyRate, 0, 1000, "$"),
    target: guard("Target occupancy", d.target, 50, 99, "%"),
  };
  const R = runOccupancy(v, OCC_PARAMS);
  const band = BAND[R.band];
  const occLabel = R.overloaded ? "Over 100%" : pct(R.occ);
  const wageAtBenchmark = v.hourlyRate === benchmark("market.wage.agent");
  const heuristics = benchmarksForTool(TOOL_ID).filter((e) => e.kind === "heuristic");

  const findings = [
    R.overloaded
      ? `Offered load of ${R.intensity.toFixed(1)} Erlangs exceeds the ${v.agents} agents staffed. Occupancy cannot exceed 100%; the queue grows without limit until staffing rises.`
      : `At ${pct(R.occ)} occupancy, agents have about ${R.idleMin.toFixed(1)} minutes an hour between contacts. ${BAND_TEXT[R.band]}`,
    R.aboveTarget
      ? `Bringing occupancy to your ${v.target}% target takes ${R.extraAgents} more agents, about ${k(R.staffingCost)} a year loaded. The attrition this model attaches to today's occupancy over the target is about ${k(R.excessAttritionCost)} a year.`
      : `Occupancy is at or below your ${v.target}% target.`,
    `Replacing one agent costs ${money(R.replacementCost)} in this model: ${money(v.hiringCost)} to hire plus ${money(R.rampWages)} of loaded wages over a ${v.trainingWeeks}-week ramp.`,
    `The attrition multipliers (${OCC_PARAMS.mult.caution}x in the caution band, ${OCC_PARAMS.mult.critical}x in the critical band) are planning heuristics, not measured values for your operation. Your entered attrition is taken as the rate at or below the healthy band.`,
  ];

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh" }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:${FONT};background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.og{grid-template-columns:1fr!important}.ladder{grid-template-columns:48px 1fr 1fr!important}.ladder .wide{display:none}}`}</style>
      <ToolNav wrap={WRAP} />
      <ToolHero wrap={WRAP} eyebrow="WFM + Staffing" title="Occupancy Risk Simulator"
        intro="Occupancy is the share of logged-in time agents spend handling contacts. Enter your queue, attrition and cost inputs to see the occupancy they produce, the staffing it takes to reach your target, and the attrition cost a labelled planning model attaches to running above it.">
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", marginTop: 12 }}>Every formula, band and assumption is in the <a href={METHOD} style={{ color: "#fff", fontWeight: 600, textDecoration: "underline" }}>published method</a>.</p>
      </ToolHero>

      <section style={{ background: WARM, padding: "40px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <div className="og" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
            <Input label="Agents on queue" value={d.agents} onChange={(x) => set("agents", x)} />
            <Input label="Calls per hour" value={d.callsPerHour} onChange={(x) => set("callsPerHour", x)} />
            <Input label="AHT" value={d.aht} onChange={(x) => set("aht", x)} suffix="sec" />
            <Input label="Target occupancy" value={d.target} onChange={(x) => set("target", x)} suffix="%" hint={`Default ${Math.round(B.healthyMax * 100)}%, the healthy band's ceiling`} />
            <Input label="Current attrition" value={d.attritionRate} onChange={(x) => set("attritionRate", x)} suffix="%/yr" />
            <Input label="Hiring cost per agent" value={d.hiringCost} onChange={(x) => set("hiringCost", x)} suffix="$" />
            <Input label="Training ramp" value={d.trainingWeeks} onChange={(x) => set("trainingWeeks", x)} suffix="weeks" />
            <Input label="Hourly rate" value={d.hourlyRate} onChange={(x) => set("hourlyRate", x)} suffix="$/hr" hint={wageAtBenchmark ? "BLS median, May 2024. Enter yours." : "Your figure"} />
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "40px 28px" }}>
        <div style={WRAP}>
          <div style={{ background: WARM, border: `2px solid ${band.color}`, borderRadius: 12, padding: "24px 28px", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: band.color, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>Your current occupancy · {band.label}</div>
              <div style={{ fontFamily: FONT, fontSize: 42, fontWeight: 700, color: band.color }}>{occLabel}</div>
              <div style={{ fontSize: 12, color: SLATE }}>{R.intensity.toFixed(1)} Erlangs of workload over {v.agents} agents</div>
            </div>
            <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.6, maxWidth: 420, margin: 0 }}>{R.overloaded ? "The offered load exceeds the agents staffed, so the queue grows without limit." : BAND_TEXT[R.band]}</p>
          </div>

          {R.aboveTarget && (
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 28 }}>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: LIGHT, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12 }}>Reaching your {v.target}% target</h2>
              <div className="og" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
                {[["Agents to add", "+" + R.extraAgents, "#fff"], ["Staffing cost, loaded", k(R.staffingCost) + "/yr", "#fff"], ["Attrition cost of today's occupancy", k(R.excessAttritionCost) + "/yr", "#fff"]].map(([l, x, c]) => (
                  <div key={l} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "12px", textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.78)" }}>{l}</div>
                    <div style={{ fontFamily: FONT, fontSize: 24, fontWeight: 700, color: c }}>{x}</div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", lineHeight: 1.55 }}>Staffing cost is the added agents at your hourly rate for a {OCC_PARAMS.hoursYear.toLocaleString("en-US")}-hour year with a {OCC_PARAMS.load}x benefits load. The attrition cost is a planning model, labelled below. Set them side by side with your own figures before you decide.</p>
              <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a href="/tools/staffing-calculator" style={{ fontSize: 12, fontWeight: 600, color: LIGHT, padding: "6px 14px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.2)" }}>Staffing Calculator: staff to your target with service level</a>
                <a href="/tools/attrition-cost" style={{ fontSize: 12, fontWeight: 600, color: LIGHT, padding: "6px 14px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.2)" }}>Attrition Cost: price turnover in full</a>
              </div>
            </div>
          )}

          <h2 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 12 }}>The occupancy ladder</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
            {R.ladder.map((l) => {
              const isCurrent = !R.overloaded && Math.abs(l.occ - R.occ * 100) < 1;
              const c = BAND[l.band].color;
              return (
                <div key={l.occ} className="ladder" style={{ display: "grid", gridTemplateColumns: "56px 90px 90px 90px 110px 1fr", gap: 8, alignItems: "center", padding: "8px 12px", borderRadius: 6, border: `${isCurrent ? 2 : 1}px solid ${isCurrent ? c : BORDER}`, fontSize: 13 }}>
                  <span style={{ fontWeight: 700, color: c }}>{l.occ}%</span>
                  <span style={{ color: SLATE }}>{l.agents} agents</span>
                  <span className="wide" style={{ color: SLATE }}>{l.idleMin.toFixed(1)} min/hr idle</span>
                  <span style={{ color: c, fontWeight: 600 }}>{BAND[l.band].label}</span>
                  <span className="wide" style={{ color: SLATE }}>{l.attrition.toFixed(0)}% attrition</span>
                  <span className="wide" style={{ color: NAVY, fontWeight: 600 }}>{k(l.turnoverCost)}/yr turnover</span>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 12, color: SLATE, marginBottom: 28 }}>Agents are the fewest that keep occupancy at or below each level; service level is the Staffing Calculator's job. Attrition and turnover cost use the planning multipliers below.</p>

          <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 20px", marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Planning assumptions on this page</div>
            {heuristics.map((e) => <p key={e.id} style={{ fontSize: 12, color: SLATE, marginBottom: 4 }}>{e.value.toLocaleString("en-US")} {e.unit}: {e.rationale} Heuristic, no published source.</p>)}
            <p style={{ fontSize: 12, color: SLATE }}>Benefits load {OCC_PARAMS.load}x: {BENCHMARK_SOURCES["load.benefits"].rationale} Bands: healthy to {pct(B.healthyMax, 0)}, caution to {pct(B.cautionMax, 0)}, the platform's shared occupancy bands.</p>
          </div>

          {guards.length > 0 && (
            <div style={{ background: "#FFF7E6", border: "1px solid #F59E0B", borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 4 }}>Inputs corrected. Every figure above was computed on the corrected values.</div>
              {guards.map((g, i) => <div key={i} style={{ fontSize: 12, color: SLATE }}>{guardLine(g)}</div>)}
            </div>
          )}

          <ReportActions
            toolId={TOOL_ID}
            toolName="Occupancy Risk Analysis"
            subtitle="Occupancy, Target Staffing and Attrition Model"
            routePath={ROUTE}
            state={d}
            defaults={DEFAULTS}
            summary={[
              { label: "Current occupancy", value: occLabel },
              { label: "Band", value: band.label },
              { label: "Agents to reach target", value: "+" + R.extraAgents },
              { label: "Calls per hour", value: String(v.callsPerHour) },
            ]}
            sections={[
              { title: "Occupancy Analysis", type: "metrics", items: [
                { label: "Current Occupancy", value: occLabel, color: band.color },
                { label: "Band", value: band.label, color: band.color },
                { label: "Workload", value: R.intensity.toFixed(1) + " Erl", color: ELECTRIC },
                { label: "Agents at " + v.target + "%", value: String(R.agentsAtTarget), color: ELECTRIC },
              ]},
              ...(guards.length ? [{ title: "Inputs Corrected", type: "findings", items: guards.map(guardLine) }] : []),
              { title: "Key Findings", type: "findings", items: findings },
              { title: "Occupancy Ladder", type: "table", rows: R.ladder.map((l) => [l.occ + "% (" + BAND[l.band].label + ")", l.agents + " agents, " + l.attrition.toFixed(0) + "% attrition, " + k(l.turnoverCost) + "/yr turnover"]) },
              { title: "Planning Assumptions", type: "findings", items: heuristics.map((e) => e.value + " " + e.unit + ": heuristic, no published source.").concat(["Benefits load " + OCC_PARAMS.load + "x, the platform's shared heuristic.", "Hourly rate " + (wageAtBenchmark ? "is the BLS median for customer service representatives, May 2024." : "entered by you.")]) },
              { title: "Method", type: "text", content: "Occupancy is offered load in Erlangs (calls per hour times AHT in hours) divided by agents. Bands are the platform's shared occupancy bands. Attrition multipliers are labelled planning heuristics. Published at contactcentercx.com" + METHOD + "." },
              { title: "Next Steps", type: "next", items: [
                { tool: "Staffing Calculator", href: "/tools/staffing-calculator", reason: "Staff to your target occupancy and your service level together" },
                { tool: "Attrition Cost Calculator", href: "/tools/attrition-cost", reason: "Price the turnover in full, beyond this planning model" },
              ]},
            ]}
          />
        </div>
      </section>
    </div>
  );
}
