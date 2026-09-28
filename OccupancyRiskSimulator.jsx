import { useState, useEffect } from "react";
import { HowOthersReport } from "./src/lib/HowOthersReport.jsx";
import { ToolFrame } from "./src/lib/ToolFrame.jsx";
import { Result } from "./src/lib/ui.jsx";
import { K, Group, Field, Tile, Corrections, Assumptions, Paper, frameMethod } from "./src/lib/frameKit.jsx";
import { methodStamp } from "./src/lib/methodVersions.js";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT_IMPORT_CSS } from "./src/lib/type";
import { createGuards, guardLine, money } from "./src/lib/guards";
import { BENCH, benchmark, benchmarksForTool, BENCHMARK_SOURCES, BLS_WAGE_VINTAGE } from "./src/lib/benchmarks";
import { runOccupancy } from "./src/lib/occupancy";
import { publishToolResult } from "./src/lib/toolData";

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
  hoursWeek: benchmark("time.hours.week"),
  hoursYear: benchmark("time.hours.year"),
};

const ELECTRIC = "#0088DD";
/* Band colours print in the PDF only; on the page the band is a word. */
const BAND = { healthy: { label: "Healthy", color: "#047857" }, caution: { label: "Caution", color: "#B45309" }, critical: { label: "Critical", color: "#B91C1C" } };
const pct = (x, d = 1) => (x * 100).toFixed(d) + "%";
const k = (x) => "$" + Math.round(x / 1000).toLocaleString("en-US") + "K";
const B = OCC_PARAMS.bands;
const BAND_TEXT = {
  healthy: `At or below ${pct(B.healthyMax, 0)}, the platform's healthy band. Agents still get a short breather between contacts. Hold here and watch it through your peaks.`,
  caution: `Above ${pct(B.healthyMax, 0)} and up to ${pct(B.cautionMax, 0)}, the caution band. Fine for a busy hour or a seasonal peak. Run it every day and this model raises attrition ${OCC_PARAMS.mult.caution}x, so plan staffing back toward your target.`,
  critical: `Above ${pct(B.cautionMax, 0)}, the critical band. Agents go straight from one contact to the next with almost no recovery time, and this model raises attrition ${OCC_PARAMS.mult.critical}x. Add staff or cut workload before anything else.`,
};

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
  /* The target occupancy goes to the rail as the Staffing Calculator's occupancy ceiling, the
     same fact: the most occupancy the operation plans to run. It grades Directional while it
     is the tool's default or was corrected, and Planning-grade once it is the reader's own. */
  const capOrigin = guards.some((g) => /Target occupancy/.test(g.label)) || v.target === DEFAULTS.target ? "Directional" : "Planning-grade";
  useEffect(() => { publishToolResult("occupancy-risk", { occupancyCap: v.target / 100 }, { occupancyCap: capOrigin }); }, [v.target, capOrigin]);
  const band = BAND[R.band];
  const occLabel = R.overloaded ? "Over 100%" : pct(R.occ);
  const wageAtBenchmark = v.hourlyRate === benchmark("market.wage.agent");
  const heuristics = benchmarksForTool(TOOL_ID).filter((e) => e.kind === "heuristic");

  const findings = [
    R.overloaded
      ? `Offered load of ${R.intensity.toFixed(1)} Erlangs exceeds the ${v.agents} agents staffed. Occupancy cannot go past 100%, so the queue keeps growing until you add agents or reduce the workload.`
      : `At ${pct(R.occ)} occupancy, agents have about ${R.idleMin.toFixed(1)} minutes an hour between contacts. ${BAND_TEXT[R.band]}`,
    R.aboveTarget
      ? `Bringing occupancy to your ${v.target}% target takes ${R.extraAgents} more agents, about ${k(R.staffingCost)} a year loaded. This model puts the extra attrition from running above target at about ${k(R.excessAttritionCost)} a year. Compare the two before you decide.`
      : `Occupancy is at or below your ${v.target}% target, so there is no staffing gap to close here.`,
    `Replacing one agent costs ${money(R.replacementCost)} in this model: ${money(v.hiringCost)} to hire plus ${money(R.rampWages)} of loaded wages over a ${v.trainingWeeks}-week ramp.`,
    `The attrition multipliers (${OCC_PARAMS.mult.caution}x in the caution band, ${OCC_PARAMS.mult.critical}x in the critical band) are planning heuristics with no published source. They are our estimate, and your own exit data should replace them. The attrition you enter is treated as your rate at or below the healthy band.`,
  ];

  const result = (
    <Result label="Current occupancy" value={occLabel} change={`${band.label} band. ${R.intensity.toFixed(1)} Erlangs of workload over ${v.agents} agents.`} />
  );

  return (
    <ToolFrame toolId={TOOL_ID} section="Operations + Workforce" name="Occupancy Risk" title="How hard are your agents running, and what does it cost?"
      lede="Occupancy is the share of logged-in time agents spend handling contacts; the rest is the gap between one contact and the next. Enter your queue, attrition and costs to see your occupancy, the staff it takes to reach your target, and what a labelled planning model says running above target costs in turnover."
      method={frameMethod(methodStamp(TOOL_ID))} result={result} pinned={{ label: "Occupancy", value: occLabel }}>
      <style>{FONT_IMPORT_CSS}</style>
      <p style={K.small}>Every formula, band and assumption is in the <a href={METHOD} style={K.link}>published method</a>.</p>

      <Group legend="Question 1 of 2 · Your queue">
        <div style={K.grid(170)}>
          <Field label="Agents on queue" value={d.agents} onChange={(x) => set("agents", x)} />
          <Field label="Calls per hour" value={d.callsPerHour} onChange={(x) => set("callsPerHour", x)} />
          <Field label="AHT (average handle time)" value={d.aht} onChange={(x) => set("aht", x)} suffix="sec" />
          <Field label="Target occupancy" value={d.target} onChange={(x) => set("target", x)} suffix="%" hint={`Default ${Math.round(B.healthyMax * 100)}%, the top of the healthy band`} />
        </div>
      </Group>

      <Group legend="Question 2 of 2 · Attrition and cost">
        <div style={K.grid(170)}>
          <Field label="Current attrition" hint="Agents who leave in a year, as a share of headcount" value={d.attritionRate} onChange={(x) => set("attritionRate", x)} suffix="%/yr" />
          <Field label="Hiring cost per agent" value={d.hiringCost} onChange={(x) => set("hiringCost", x)} suffix="$" />
          <Field label="Training ramp" value={d.trainingWeeks} onChange={(x) => set("trainingWeeks", x)} suffix="weeks" />
          <Field label="Hourly rate" value={d.hourlyRate} onChange={(x) => set("hourlyRate", x)} suffix="$/hr" hint={wageAtBenchmark ? `BLS median, ${BLS_WAGE_VINTAGE}. Enter yours.` : "Your figure"} />
        </div>
      </Group>

      <Corrections guards={guards} />

      <section aria-label="Your current occupancy" style={K.lead}>
        <span style={K.kicker}>Your current occupancy · {band.label}</span>
        <div style={K.stat}>{occLabel}</div>
        <p style={K.small}>{R.intensity.toFixed(1)} Erlangs of workload over {v.agents} agents. An Erlang is one hour of handling work arriving each hour, so it equals the agents needed at 100% busy.</p>
        <p style={{ ...K.body, marginTop: 10 }}>{R.overloaded ? "More work arrives than your agents can handle, so the queue keeps growing. Add agents or cut workload first." : BAND_TEXT[R.band]}</p>
      </section>

      {R.aboveTarget && (
        <section aria-label="Reaching your target" style={K.panel}>
          <h2 style={K.h2}>Reaching your {v.target}% target</h2>
          <div style={K.grid(170)}>
            <Tile label="Agents to add" value={"+" + R.extraAgents} />
            <Tile label="Staffing cost, loaded" value={k(R.staffingCost) + "/yr"} />
            <Tile label="Attrition cost of today's occupancy" value={k(R.excessAttritionCost) + "/yr"} />
          </div>
          <p style={{ ...K.small, marginTop: 12 }}>Staffing cost is the added agents at your hourly rate for a {OCC_PARAMS.hoursYear.toLocaleString("en-US")}-hour year with a {OCC_PARAMS.load}x benefits load. The attrition cost comes from a planning model, labelled below. Check both against your own figures before you decide.</p>
          <p style={{ ...K.small, marginTop: 10 }}><a href="/tools/staffing-calculator" style={K.link}>Staffing Calculator: staff to your target and service level</a> · <a href="/tools/attrition-cost" style={K.link}>Attrition Cost: price turnover in full</a></p>
        </section>
      )}

      <section aria-label="The occupancy ladder" style={K.panel}>
        <h2 style={K.h2}>The occupancy ladder</h2>
        <div role="region" aria-label="Occupancy table, scrolls sideways" tabIndex={0} style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", ...K.small, color: K.body.color, ...K.num }}>
            <thead><tr style={{ ...K.kicker, textAlign: "left" }}>
              {["Occupancy", "Agents", "Idle a hour", "Band", "Attrition", "Turnover a year"].map((h) => <th key={h} scope="col" style={{ padding: "6px 8px 6px 0", fontWeight: 500 }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {R.ladder.map((l) => {
                const isCurrent = !R.overloaded && Math.abs(l.occ - R.occ * 100) < 1;
                return (
                  <tr key={l.occ} aria-current={isCurrent ? "true" : undefined} style={{ borderTop: `1px solid ${K.hair}`, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? K.strong.color : undefined }}>
                    <td style={{ padding: "8px 8px 8px 0" }}>{l.occ}%{isCurrent ? " (you)" : ""}</td>
                    <td style={{ padding: "8px 8px 8px 0" }}>{l.agents} agents</td>
                    <td style={{ padding: "8px 8px 8px 0" }}>{l.idleMin.toFixed(1)} min/hr idle</td>
                    <td style={{ padding: "8px 8px 8px 0" }}>{BAND[l.band].label}</td>
                    <td style={{ padding: "8px 8px 8px 0" }}>{l.attrition.toFixed(0)}% attrition</td>
                    <td style={{ padding: "8px 0" }}>{k(l.turnoverCost)}/yr turnover</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p style={{ ...K.small, marginTop: 10 }}>Each row shows the fewest agents that keep occupancy at or below that level. It does not check service level (the share of calls answered within a target time); the Staffing Calculator does that. Attrition and turnover cost use the planning multipliers below.</p>
      </section>

      <Assumptions items={[
        ...heuristics.map((e) => `${e.value.toLocaleString("en-US")} ${e.unit}: ${e.rationale} Heuristic, no published source.`),
        `Paid hours: ${OCC_PARAMS.hoursWeek} a week and ${OCC_PARAMS.hoursYear.toLocaleString("en-US")} a year, the full-time definition.`,
        `Benefits load ${OCC_PARAMS.load}x: ${BENCHMARK_SOURCES["load.benefits"].rationale} Bands: healthy to ${pct(B.healthyMax, 0)}, caution to ${pct(B.cautionMax, 0)}, the platform's shared occupancy bands.`,
      ]} />

      <HowOthersReport toolId={TOOL_ID} />

      <Paper>
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
              { title: "Planning Assumptions", type: "findings", items: heuristics.map((e) => e.value + " " + e.unit + ": heuristic, no published source.").concat(["Paid hours " + OCC_PARAMS.hoursWeek + " a week and " + OCC_PARAMS.hoursYear.toLocaleString("en-US") + " a year: the full-time definition.", "Benefits load " + OCC_PARAMS.load + "x, the platform's shared heuristic.", "Hourly rate " + (wageAtBenchmark ? `is the BLS median for customer service representatives, ${BLS_WAGE_VINTAGE}.` : "entered by you.")]) },
              { title: "Method", type: "text", content: "Occupancy is offered load in Erlangs (calls per hour times AHT, average handle time, in hours) divided by agents. Bands are the platform's shared occupancy bands. Attrition multipliers are labelled planning heuristics. Published at contactcentercx.com" + METHOD + "." },
            ]}
          />
      </Paper>
    </ToolFrame>
  );
}
