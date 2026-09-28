import { useState, useEffect } from "react";
import { ToolFrame } from "./src/lib/ToolFrame.jsx";
import { Result } from "./src/lib/ui.jsx";
import { K, Group, Field, Tile, Corrections, Assumptions, Paper, frameMethod } from "./src/lib/frameKit.jsx";
import { methodStamp } from "./src/lib/methodVersions.js";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT_IMPORT_CSS } from "./src/lib/type";
import { createGuards, guardLine, money } from "./src/lib/guards";
import { benchmark, BENCHMARK_SOURCES, BLS_WAGE_VINTAGE } from "./src/lib/benchmarks";
import { publishToolResult } from "./src/lib/toolData";
import { runShrinkage, SHRINK_PLANNED, SHRINK_UNPLANNED } from "./src/lib/shrinkage";

/* Shrinkage Planner. The arithmetic lives in src/lib/shrinkage.js between engine markers;
   every constant it uses is read here from the registry and passed in. */

const TOOL_ID = "shrinkage-planner";
const ROUTE = "/tools/shrinkage-planner";
const METHOD = "/methodology/shrinkage-planner";
/* The opening case: a 200-agent roster at 33% total shrinkage that must keep 140 agents on
   the queue. An example, not a benchmark. */
export const DEFAULTS = { agents: 200, needed: 140, hourlyRate: benchmark("market.wage.agent"), breaks: 8, coaching: 3, training: 4, meetings: 2, pto: 8, systemDown: 1, absenteeism: 5, lateAdherence: 2 };
/* The registry values the engine runs on. maxTotal is a domain bound, the same as the
   Staffing Calculator's shrinkage field: scheduling divides by what is left. */
export const SHRINK_PARAMS = {
  range: { low: benchmark("shrinkage.range.low"), high: benchmark("shrinkage.range.high") },
  load: benchmark("load.benefits"),
  hoursYear: benchmark("time.hours.year"),
  maxTotal: 99,
};

const ELECTRIC = "#0088DD";
const pc = (x, d = 0) => (x * 100).toFixed(d) + "%";
const usd = (x) => "$" + Math.round(x).toLocaleString("en-US");
const RANGE = SHRINK_PARAMS.range;
const POSITION = { below: "Below the planning range", within: "Within the planning range", above: "Above the planning range" };

export default function ShrinkagePlanner() {
  const [d, setD] = useState(() => ({ ...DEFAULTS, ...(readScenario(TOOL_ID, DEFAULTS) || {}) }));
  useEffect(() => { window.scrollTo(0, 0); clearScenarioParam(); }, []);
  const set = (key, val) => setD((prev) => ({ ...prev, [key]: val }));

  /* Every input is clamped at the engine boundary and every correction is disclosed on
     screen and in the PDF. A scenario link can carry any value. */
  const { guards, guard } = createGuards();
  const v = {
    agents: guard("Agents on the roster", d.agents, 1, 100000, ""),
    needed: guard("Agents needed on the queue", d.needed, 0, 100000, ""),
    hourlyRate: guard("Hourly rate", d.hourlyRate, 0, 1000, "$"),
  };
  for (const [key, name] of [...SHRINK_PLANNED, ...SHRINK_UNPLANNED]) v[key] = guard(name, d[key], 0, 100, "%");
  const R = runShrinkage(v, SHRINK_PARAMS);
  if (R.capped) guards.push({ label: "Total shrinkage (sum of categories)", entered: R.rawPct, used: R.totalPct, unit: "%" });
  const wageAtBenchmark = v.hourlyRate === benchmark("market.wage.agent");
  /* Total shrinkage goes to the rail for the Staffing Calculator. It grades Directional while
     every category is still the example or an input was corrected, and Planning-grade once
     the categories are the reader's own: this tool has no document attestation path. */
  const shrinkOrigin = guards.length || [...SHRINK_PLANNED, ...SHRINK_UNPLANNED].every(([k]) => v[k] === DEFAULTS[k]) ? "Directional" : "Planning-grade";
  useEffect(() => { publishToolResult("shrinkage-planner", { shrinkage: R.totalPct / 100 }, { shrinkage: shrinkOrigin }); }, [R.totalPct, shrinkOrigin]);
  const totalLabel = R.totalPct.toFixed(1) + "%";
  const gapText = R.rosterGap > 0 ? `Your roster of ${v.agents} is ${R.rosterGap} short of that.` : R.rosterGap < 0 ? `Your roster of ${v.agents} is ${-R.rosterGap} above that.` : `Your roster of ${v.agents} is exactly that.`;
  const rangeText = `${Math.round(RANGE.low * 100)} to ${Math.round(RANGE.high * 100)}%`;

  const findings = [
    `Total shrinkage is ${totalLabel} of paid hours: ${R.plannedPct.toFixed(1)}% planned and ${R.unplannedPct.toFixed(1)}% unplanned. Of ${v.agents} agents on the roster, about ${R.onQueueRounded} are on the queue at any moment.`,
    v.needed > 0
      ? `To keep ${v.needed} agents on the queue at ${totalLabel} shrinkage, schedule ${R.schedule}: ${v.needed} divided by ${pc(R.avail, 1)}, rounded up. ${gapText}`
      : `No agents needed on the queue were entered, so nothing is scheduled against a need.`,
    `Paid time off the queue comes to about ${usd(R.offQueueValue)} a year at the loaded rate (${usd(R.plannedValue)} planned, ${usd(R.unplannedValue)} unplanned). These are wages already paid. Breaks, PTO, coaching and training are part of running the operation, so this figure is where paid time goes and is no saving.`,
    `Each point of shrinkage takes ${R.pointAgents.toFixed(1)} agents off the queue, about ${usd(R.pointValue)} a year of paid time.`,
    `${totalLabel} is ${R.position === "within" ? "within" : R.position} the ${rangeText} planning range, a labelled heuristic. The range says nothing about whether your total is right for your operation. The largest category is ${R.largest.name} at ${R.largest.pct}%.`,
  ];
  const assumptions = [
    `Every category is a percent of paid hours, so the categories add. If you measure a category against hours present instead, convert it first: multiply it by one minus your out-of-office shrinkage.`,
    `Paid hours ${SHRINK_PARAMS.hoursYear.toLocaleString("en-US")} a year: the full-time definition.`,
    `Benefits load ${SHRINK_PARAMS.load}x, the platform's shared heuristic.`,
    `Planning range ${rangeText}: heuristic, no published source.`,
    `Hourly rate ${wageAtBenchmark ? `is the BLS median for customer service representatives, ${BLS_WAGE_VINTAGE}.` : "entered by you."}`,
  ];

  const result = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Result label="Total shrinkage" value={totalLabel} change={`${POSITION[R.position]}. About ${R.onQueueRounded} of ${v.agents} agents on the queue at any moment.`} />
      <div style={K.panel}>
        <div style={{ ...K.row, borderTop: "none", paddingTop: 0 }}><span style={K.small}>To schedule for {v.needed}</span><span style={{ ...K.strong, ...K.num }}>{R.schedule}</span></div>
        <div style={K.row}><span style={K.small}>Paid time off the queue, a year</span><span style={{ ...K.strong, ...K.num }}>{usd(R.offQueueValue)}</span></div>
      </div>
    </div>
  );
  const parts = [...R.cats.filter((c) => c.pct > 0)];

  return (
    <ToolFrame toolId={TOOL_ID} section="Operations + Workforce" name="Shrinkage Planner" title="How much paid time never reaches the queue?"
      lede="Shrinkage is the share of paid agent time that never reaches the queue. Enter each category as a percent of paid hours. The planner totals them, shows how many agents your roster keeps on the queue, how many to schedule to keep the number you need there, and what the time off the queue is worth."
      method={frameMethod(methodStamp(TOOL_ID))} result={result} pinned={{ label: "Total shrinkage", value: totalLabel }}>
      <style>{FONT_IMPORT_CSS}</style>
      <p style={K.small}>Every formula and assumption is in the <a href={METHOD} style={K.link}>published method</a>.</p>

      <Group legend="Question 1 of 2 · Where paid time goes" note="Enter every category as a percent of paid hours, so they add.">
        <div style={K.grid(260)}>
          <div>
            <h2 style={{ ...K.h2, fontSize: 16 }}>Planned, booked ahead</h2>
            <div style={K.grid(140)}>
              {SHRINK_PLANNED.map(([key, name]) => <Field key={key} label={name} value={d[key]} onChange={(x) => set(key, x)} suffix="%" />)}
            </div>
          </div>
          <div>
            <h2 style={{ ...K.h2, fontSize: 16 }}>Unplanned, on the day</h2>
            <div style={K.grid(140)}>
              {SHRINK_UNPLANNED.map(([key, name]) => <Field key={key} label={name} value={d[key]} onChange={(x) => set(key, x)} suffix="%" />)}
            </div>
          </div>
        </div>
      </Group>

      <Group legend="Question 2 of 2 · Your roster">
        <div style={K.grid(180)}>
          <Field label="Agents on the roster" value={d.agents} onChange={(x) => set("agents", x)} />
          <Field label="Agents needed on the queue" value={d.needed} onChange={(x) => set("needed", x)} hint="From your forecast or the Staffing Calculator" />
          <Field label="Hourly rate" value={d.hourlyRate} onChange={(x) => set("hourlyRate", x)} suffix="$/hr" hint={wageAtBenchmark ? `BLS median, ${BLS_WAGE_VINTAGE}` : undefined} />
        </div>
      </Group>

      <Corrections guards={guards} />

      <div style={K.grid(160)}>
        <Tile label="Total shrinkage" value={totalLabel} note={POSITION[R.position]} />
        <Tile label="On the queue" value={String(R.onQueueRounded)} note={"Of " + v.agents + " on the roster"} />
        <Tile label="To schedule" value={String(R.schedule)} note={"To keep " + v.needed + " on the queue"} />
        <Tile label="Paid time off the queue" value={usd(R.offQueueValue)} note="A year, at the loaded rate" />
      </div>

      <section aria-label="Where paid hours go" style={K.panel}>
        <h2 style={K.h2}>Where paid hours go</h2>
        <div role="img" aria-label={`Planned ${R.plannedPct.toFixed(1)}%, unplanned ${R.unplannedPct.toFixed(1)}%, on the queue ${pc(R.avail)}`} style={{ display: "flex", height: 28, borderRadius: 4, overflow: "hidden", border: `1px solid ${K.hair}`, marginBottom: 10 }}>
          {parts.map((c) => (
            <div key={c.key} title={c.name + " " + c.pct + "%"} style={{ width: `${c.pct * (R.totalPct / (R.rawPct || 1))}%`, background: K.shade(c.type === "planned" ? 0 : 2), borderRight: `1px solid ${K.firm}` }} />
          ))}
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ ...K.small, color: K.strong.color, fontWeight: 600 }}>On the queue {pc(R.avail)}</span>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, ...K.small }}>
          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: K.shade(0), marginRight: 6, verticalAlign: "middle" }} />Planned {R.plannedPct.toFixed(1)}%</span>
          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: K.shade(2), marginRight: 6, verticalAlign: "middle" }} />Unplanned {R.unplannedPct.toFixed(1)}%</span>
          <span>One point of shrinkage: {R.pointAgents.toFixed(1)} agents, {usd(R.pointValue)} a year</span>
        </div>
      </section>

      <section aria-label="What it means" style={K.lead}>
        <span style={K.kicker}>What this shows</span>
        {findings.map((f, i) => <p key={i} style={{ ...K.body, marginTop: i ? 10 : 8 }}>{f}</p>)}
      </section>

      <Assumptions items={assumptions}>
        <p style={{ ...K.small, marginTop: 6 }}>{BENCHMARK_SOURCES["shrinkage.range.low"].rationale}</p>
      </Assumptions>

      <Paper>
          <ReportActions
            toolId={TOOL_ID}
            toolName="Shrinkage Analysis"
            subtitle="Shrinkage, Scheduling and Paid Time Off the Queue"
            routePath={ROUTE}
            state={d}
            defaults={DEFAULTS}
            summary={[
              { label: "Total shrinkage", value: totalLabel },
              { label: "On the queue", value: String(R.onQueueRounded) },
              { label: "To schedule", value: String(R.schedule) },
              { label: "Paid time off the queue", value: usd(R.offQueueValue) },
            ]}
            sections={[
              { title: "Shrinkage Analysis", type: "metrics", items: [
                { label: "Total Shrinkage", value: totalLabel, color: ELECTRIC },
                { label: "On the Queue", value: String(R.onQueueRounded), color: ELECTRIC },
                { label: "To Schedule for " + v.needed, value: String(R.schedule), color: ELECTRIC },
                { label: "Planned / Unplanned", value: R.plannedPct.toFixed(1) + "% / " + R.unplannedPct.toFixed(1) + "%", color: ELECTRIC },
              ]},
              ...(guards.length ? [{ title: "Inputs Corrected", type: "findings", items: guards.map(guardLine) }] : []),
              { title: "Key Findings", type: "findings", items: findings },
              { title: "Shrinkage Breakdown", type: "table", rows: R.cats.map((c) => [c.name + " (" + c.type + ")", c.pct.toFixed(1) + "%"]).concat([["Total shrinkage", totalLabel]]) },
              { title: "Planning Assumptions", type: "findings", items: assumptions },
              { title: "Method", type: "text", content: "Total shrinkage is the sum of the categories, each a percent of paid hours. Agents on the queue are the roster times one minus shrinkage; agents to schedule are the need divided by one minus shrinkage, rounded up. Paid time off the queue is priced at the hourly rate, the full-time year and the benefits load. Published at contactcentercx.com" + METHOD + "." },
            ]}
          />
      </Paper>
    </ToolFrame>
  );
}
