import { useState, useEffect } from "react";
import { ToolNav, ToolHero } from "./src/lib/ToolShell";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";
import { createGuards, guardLine, money } from "./src/lib/guards";
import { benchmark, BENCHMARK_SOURCES } from "./src/lib/benchmarks";
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

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#5B6E88"; const BORDER = "#D8E3ED";
const PLANNED_FILL = "#0F766E"; const UNPLANNED_FILL = "#B45309";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
const pc = (x, d = 0) => (x * 100).toFixed(d) + "%";
const usd = (x) => "$" + Math.round(x).toLocaleString("en-US");
const RANGE = SHRINK_PARAMS.range;
const POSITION = { below: "Below the planning range", within: "Within the planning range", above: "Above the planning range" };

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

function Tile({ label, value, note, dark }) {
  return (
    <div style={{ background: dark ? `linear-gradient(135deg, ${NAVY}, ${DEEP})` : WARM, border: dark ? "none" : `1px solid ${BORDER}`, borderRadius: 10, padding: 20, textAlign: "center" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: dark ? LIGHT : MUTED, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 30, color: dark ? "#fff" : NAVY }}>{value}</div>
      <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,0.78)" : MUTED }}>{note}</div>
    </div>
  );
}

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
    `Hourly rate ${wageAtBenchmark ? "is the BLS median for customer service representatives, May 2024." : "entered by you."}`,
  ];

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh" }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:${FONT};background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.sg{grid-template-columns:1fr!important}}`}</style>
      <ToolNav wrap={WRAP} />
      <ToolHero wrap={WRAP} eyebrow="WFM + Staffing" title="Shrinkage Planner"
        intro="Shrinkage is the share of paid agent time that never reaches the queue. Enter each category as a percent of paid hours. The planner totals them, shows how many agents your roster keeps on the queue, how many to schedule to keep the number you need there, and what the time off the queue is worth.">
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", marginTop: 12 }}>Every formula and assumption is in the <a href={METHOD} style={{ color: "#fff", fontWeight: 600, textDecoration: "underline" }}>published method</a>.</p>
      </ToolHero>

      <section style={{ background: WARM, padding: "40px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="sg">
            <div>
              <h2 style={{ fontSize: 12, fontWeight: 700, color: PLANNED_FILL, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Planned, booked ahead</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {SHRINK_PLANNED.map(([key, name]) => <Input key={key} label={name} value={d[key]} onChange={(x) => set(key, x)} suffix="%" />)}
              </div>
            </div>
            <div>
              <h2 style={{ fontSize: 12, fontWeight: 700, color: UNPLANNED_FILL, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Unplanned, on the day</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {SHRINK_UNPLANNED.map(([key, name]) => <Input key={key} label={name} value={d[key]} onChange={(x) => set(key, x)} suffix="%" />)}
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: SLATE, marginTop: 12 }}>Enter every category as a percent of paid hours, so they add.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }} className="sg">
            <Input label="Agents on the roster" value={d.agents} onChange={(x) => set("agents", x)} />
            <Input label="Agents needed on the queue" value={d.needed} onChange={(x) => set("needed", x)} hint="From your forecast or the Staffing Calculator" />
            <Input label="Hourly rate" value={d.hourlyRate} onChange={(x) => set("hourlyRate", x)} suffix="$/hr" hint={wageAtBenchmark ? "BLS median, May 2024" : undefined} />
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "40px 28px" }}>
        <div style={WRAP}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 28 }} className="sg">
            <Tile label="Total shrinkage" value={totalLabel} note={POSITION[R.position]} />
            <Tile label="On the queue" value={String(R.onQueueRounded)} note={"Of " + v.agents + " on the roster"} />
            <Tile label="To schedule" value={String(R.schedule)} note={"To keep " + v.needed + " on the queue"} />
            <Tile dark label="Paid time off the queue" value={usd(R.offQueueValue)} note="A year, at the loaded rate" />
          </div>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Where paid hours go</h2>
            <div style={{ display: "flex", height: 32, borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
              {R.cats.map((c) => c.pct > 0 && (
                <div key={c.key} title={c.name + " " + c.pct + "%"} style={{ width: `${c.pct * (R.totalPct / (R.rawPct || 1))}%`, background: c.type === "planned" ? PLANNED_FILL : UNPLANNED_FILL, borderRight: "1px solid #fff" }} />
              ))}
              <div style={{ flex: 1, background: ELECTRIC, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>On the queue {pc(R.avail)}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, color: SLATE }}>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: PLANNED_FILL, marginRight: 4, verticalAlign: "middle" }} />Planned {R.plannedPct.toFixed(1)}%</span>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: UNPLANNED_FILL, marginRight: 4, verticalAlign: "middle" }} />Unplanned {R.unplannedPct.toFixed(1)}%</span>
              <span>One point of shrinkage: {R.pointAgents.toFixed(1)} agents, {usd(R.pointValue)} a year</span>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 10 }}>What this shows</h2>
            {findings.map((f, i) => <p key={i} style={{ fontSize: 14, color: SLATE, lineHeight: 1.6, marginBottom: 8 }}>{f}</p>)}
          </div>

          <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 20px", marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Planning assumptions on this page</div>
            {assumptions.map((a, i) => <p key={i} style={{ fontSize: 12, color: SLATE, marginBottom: 4 }}>{a}</p>)}
            <p style={{ fontSize: 12, color: SLATE }}>{BENCHMARK_SOURCES["shrinkage.range.low"].rationale}</p>
          </div>

          {guards.length > 0 && (
            <div style={{ background: "#FFF7E6", border: "1px solid #F59E0B", borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 4 }}>Inputs corrected. Every figure above was computed on the corrected values.</div>
              {guards.map((g, i) => <div key={i} style={{ fontSize: 12, color: SLATE }}>{guardLine(g)}</div>)}
            </div>
          )}

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
              { title: "Next Steps", type: "next", items: [
                { tool: "Staffing Calculator", href: "/tools/staffing-calculator", reason: "Size the agents needed on the queue for your service level" },
                { tool: "Schedule Adherence Analyzer", href: "/tools/schedule-adherence", reason: "Break down the late and out-of-adherence share" },
              ]},
            ]}
          />
        </div>
      </section>
    </div>
  );
}
