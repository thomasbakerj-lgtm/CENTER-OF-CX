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
import { benchmark, BLS_WAGE_VINTAGE } from "./src/lib/benchmarks";
import { runAdherence } from "./src/lib/adherence";

/* Schedule Adherence Impact Calculator. The arithmetic lives in src/lib/adherence.js between
   engine markers. */

const TOOL_ID = "schedule-adherence";
const ROUTE = "/tools/schedule-adherence";
const METHOD = "/methodology/schedule-adherence";
/* The opening case: 820 calls an hour at 6 minutes on 100 scheduled agents at 92%
   adherence, a queue that meets 80% in 20 seconds with little room, so each point of loss
   shows. An example, not a benchmark. The open hours and days are the previous tool's
   fixed 8 and 250, now inputs. */
export const DEFAULTS = { agents: 100, currentAdherence: 92, callsPerHour: 820, aht: 360, slaTarget: 80, slaTime: 20, hourlyRate: benchmark("market.wage.agent"), otMultiplier: benchmark("adh.ot.multiplier"), hoursPerDay: 8, daysPerYear: 250 };

const NAVY = "#0B1D3A";
const pc = (x, d = 1) => (x * 100).toFixed(d) + "%";
const usd = (x) => "$" + Math.round(x).toLocaleString("en-US");
const secs = (x) => (x === null ? "no answer (queue overloaded)" : Math.round(x) + "s");

export default function ScheduleAdherenceCalculator() {
  const [d, setD] = useState(() => ({ ...DEFAULTS, ...(readScenario(TOOL_ID, DEFAULTS) || {}) }));
  useEffect(() => { window.scrollTo(0, 0); clearScenarioParam(); }, []);
  const set = (k, x) => setD((prev) => ({ ...prev, [k]: x }));

  /* Every input is clamped at the engine boundary and every correction is disclosed on
     screen and in the PDF. A scenario link can carry any value. */
  const { guards, guard } = createGuards();
  const v = {
    agents: guard("Agents scheduled", d.agents, 1, 100000, ""),
    currentAdherence: guard("Current adherence", d.currentAdherence, 1, 100, "%"),
    callsPerHour: guard("Calls per hour", d.callsPerHour, 0, 1000000, ""),
    aht: guard("AHT", d.aht, 1, 36000, " sec"),
    slaTarget: guard("Service level target", d.slaTarget, 1, 99, "%"),
    slaTime: guard("Answer within", d.slaTime, 1, 3600, " sec"),
    hourlyRate: guard("Hourly rate", d.hourlyRate, 0, 1000, "$"),
    otMultiplier: guard("Overtime multiplier", d.otMultiplier, 1, 5, "x"),
    hoursPerDay: guard("Open hours a day", d.hoursPerDay, 1, 24, ""),
    daysPerYear: guard("Open days a year", d.daysPerYear, 1, 366, ""),
  };
  const R = runAdherence(v);
  const B = R.base, M = R.firstMiss;
  const wageAtBenchmark = v.hourlyRate === benchmark("market.wage.agent");
  const tgt = `${v.slaTarget}% within ${v.slaTime} seconds`;
  const otLine = (r) => (r.extra === null ? "the target cannot be held by scheduling" : r.extra === 0 ? "no overtime" : `${r.extra} more agents, ${Math.round(r.otHours).toLocaleString("en-US")} overtime hours, ${usd(r.otCost)} a year`);

  const findings = [
    `At ${B.adh}% adherence, ${B.onQueue} of ${v.agents} scheduled agents are on the queue. Erlang C (the standard queueing formula for how many callers wait, given calls, handle time and agents) gives ${pc(B.sl)} answered within ${v.slaTime} seconds (target ${v.slaTarget}%, ${B.meets ? "met" : "missed"}) and an average speed of answer (how long a caller waits before an agent picks up) of ${secs(B.asa)}.`,
    R.need === null
      ? `Holding ${tgt} cannot be reached within the search range at this load. Check the calls per hour and handle time before anything else.`
      : `Holding ${tgt} takes ${R.need} agents on the queue. ` + (!B.meets ? "The target is already missed at today's adherence, so the first step is more agents on the queue or better adherence." : M ? `Service level first falls below target at ${M.adh}% adherence (${M.drop} points lower), where it is ${pc(M.sl)}. That is how much adherence slack you have before callers start to feel it.` : "Service level stays at or above target through 10 points of loss, so this queue has room to absorb slippage."),
    ...(M && M.extra ? [`At ${M.adh}% adherence, holding the target means scheduling ${M.toSchedule} agents, ${M.extra} more than the roster: about ${Math.round(M.otHours).toLocaleString("en-US")} overtime hours, ${usd(M.otCost)} a year at ${v.otMultiplier} × ${money(v.hourlyRate)} an hour.`] : []),
    `Overtime assumes the ${v.callsPerHour.toLocaleString("en-US")} calls an hour hold across ${v.hoursPerDay} open hours a day and ${v.daysPerYear} days a year. Erlang C assumes every caller waits until answered. In practice some callers hang up, which removes them from the queue, so the service level you measure will run higher than this model shows.`,
  ];

  const planning = [
    "Adherence is taken as the share of scheduled agents on the queue at any moment.",
    `Overtime multiplier ${v.otMultiplier}x${v.otMultiplier === benchmark("adh.ot.multiplier") ? ", the US Fair Labor Standards Act minimum" : ", entered by you"}; hourly rate ${wageAtBenchmark ? `is the BLS median for customer service representatives, ${BLS_WAGE_VINTAGE}` : "entered by you"}.`,
    `The call rate is taken to hold across ${v.hoursPerDay} open hours a day and ${v.daysPerYear} days a year.`,
  ];
  const result = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Result label="Service level today" value={pc(B.sl)} change={`Target ${v.slaTarget}% within ${v.slaTime} seconds, ${B.meets ? "met" : "missed"}. ${B.onQueue} of ${v.agents} on the queue at ${B.adh}% adherence.`} />
      <div style={K.panel}>
        <div style={{ ...K.row, borderTop: "none", paddingTop: 0 }}><span style={K.small}>At 3 points lower</span><span style={{ ...K.strong, ...K.num }}>{pc(R.row3.sl)}</span></div>
        <p style={K.small}>{R.row3.extra ? `${usd(R.row3.otCost)} a year to hold target` : "No overtime to hold target"}</p>
      </div>
    </div>
  );
  const th = { padding: "8px 10px", textAlign: "right", fontWeight: 500 };
  const td = { padding: "8px 10px", textAlign: "right" };

  return (
    <ToolFrame toolId={TOOL_ID} section="Operations + Workforce" name="Schedule Adherence" title="What does each point of adherence do to service level?"
      lede="Adherence is the share of scheduled time agents spend doing what the schedule says, such as being on the phones when planned. Service level is the share of calls answered within a set time, for example 80% in 20 seconds. Enter your queue to see the service level an Erlang C queueing model gives at today's adherence and at each point lost, the agents it takes to hold your target, and what the overtime costs."
      method={frameMethod(methodStamp(TOOL_ID))} result={result} pinned={{ label: "Service level today", value: pc(B.sl) }}>
      <style>{FONT_IMPORT_CSS}</style>
      <p style={K.small}>Every formula and assumption is in the <a href={METHOD} style={K.link}>published method</a>.</p>

      <Group legend="Question 1 of 2 · Your queue and target">
        <div style={K.grid(170)}>
          <Field label="Agents scheduled" value={d.agents} onChange={(x) => set("agents", x)} />
          <Field label="Current adherence" value={d.currentAdherence} onChange={(x) => set("currentAdherence", x)} suffix="%" />
          <Field label="Calls per hour" value={d.callsPerHour} onChange={(x) => set("callsPerHour", x)} />
          <Field label="AHT (average handle time)" value={d.aht} onChange={(x) => set("aht", x)} suffix="sec" />
          <Field label="Service level target" value={d.slaTarget} onChange={(x) => set("slaTarget", x)} suffix="%" hint="Share of calls answered within the time below" />
          <Field label="Answer within" value={d.slaTime} onChange={(x) => set("slaTime", x)} suffix="sec" />
        </div>
      </Group>

      <Group legend="Question 2 of 2 · Overtime cost">
        <div style={K.grid(170)}>
          <Field label="Hourly rate" value={d.hourlyRate} onChange={(x) => set("hourlyRate", x)} suffix="$/hr" hint={wageAtBenchmark ? `BLS median, ${BLS_WAGE_VINTAGE}. Enter yours.` : undefined} />
          <Field label="Overtime multiplier" value={d.otMultiplier} onChange={(x) => set("otMultiplier", x)} suffix="x" hint={v.otMultiplier === benchmark("adh.ot.multiplier") ? "US FLSA (Fair Labor Standards Act) minimum" : undefined} />
          <Field label="Open hours a day" value={d.hoursPerDay} onChange={(x) => set("hoursPerDay", x)} />
          <Field label="Open days a year" value={d.daysPerYear} onChange={(x) => set("daysPerYear", x)} />
        </div>
      </Group>

      <Corrections guards={guards} />

      <div style={K.grid(160)}>
        <Tile label="Service level today" value={pc(B.sl)} note={`Target ${v.slaTarget}%, ${B.meets ? "met" : "missed"}`} />
        <Tile label="On the queue" value={String(B.onQueue)} note={`Of ${v.agents} at ${B.adh}% adherence`} />
        <Tile label="Needed for target" value={R.need === null ? "n/a" : String(R.need)} note="Agents on the queue" />
        <Tile label="At 3 points lower" value={pc(R.row3.sl)} note={R.row3.extra ? `${usd(R.row3.otCost)} a year to hold target` : "No overtime to hold target"} />
      </div>

      <section aria-label="Each point of adherence" style={K.panel}>
        <h2 style={K.h2}>Each point of adherence</h2>
        <div role="region" aria-label="Adherence table, scrolls sideways" tabIndex={0} style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", ...K.small, color: K.body.color, ...K.num }}>
            <thead>
              <tr style={{ ...K.kicker, letterSpacing: "0.08em" }}>
                {["Adherence", "On the queue", "Service level", "Speed of answer", "Target", "To schedule", "Overtime to hold target"].map((h) => (
                  <th key={h} scope="col" style={th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {R.rows.map((r, i) => (
                <tr key={r.drop} style={{ borderTop: `1px solid ${K.hair}`, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? K.strong.color : undefined }}>
                  <td style={td}>{r.adh}%{i === 0 ? " (today)" : ` (-${r.drop})`}</td>
                  <td style={td}>{r.onQueue}</td>
                  <td style={td}>{pc(r.sl)}</td>
                  <td style={td}>{r.asa === null ? "overloaded" : Math.round(r.asa) + "s"}</td>
                  <td style={td}>{r.meets ? "Met" : "Missed"}</td>
                  <td style={td}>{r.toSchedule === null ? "n/a" : r.toSchedule}</td>
                  <td style={td}>{r.otCost === null ? "n/a" : r.otCost === 0 ? "None" : usd(r.otCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-label="What it means" style={K.lead}>
        <span style={K.kicker}>What it means</span>
        {findings.map((f, i) => <p key={i} style={{ ...K.body, marginTop: i ? 10 : 8 }}>{f}</p>)}
      </section>

      <Assumptions items={planning} />

      <HowOthersReport toolId={TOOL_ID} />

      <Paper>
          <ReportActions
            toolId={TOOL_ID}
            toolName="Schedule Adherence Impact Analysis"
            subtitle="Service Level and Overtime by Point of Adherence"
            routePath={ROUTE}
            state={d}
            defaults={DEFAULTS}
            summary={[
              { label: "Service level today", value: pc(B.sl) },
              { label: "Agents needed on the queue", value: R.need === null ? "n/a" : String(R.need) },
              { label: "Service level at 3 points lower", value: pc(R.row3.sl) },
              { label: "Overtime at 3 points lower", value: R.row3.otCost === null ? "n/a" : usd(R.row3.otCost) },
            ]}
            sections={[
              { title: "Adherence Impact", type: "metrics", items: [
                { label: "Service Level Today", value: pc(B.sl), color: NAVY, sub: `target ${v.slaTarget}%, ${B.meets ? "met" : "missed"}` },
                { label: "On the Queue", value: String(B.onQueue), color: NAVY, sub: `of ${v.agents}` },
                { label: "Needed for Target", value: R.need === null ? "n/a" : String(R.need), color: NAVY },
                { label: "At 3 Points Lower", value: pc(R.row3.sl), color: NAVY, sub: otLine(R.row3) },
              ]},
              ...(guards.length ? [{ title: "Inputs Corrected", type: "findings", items: guards.map(guardLine) }] : []),
              { title: "Key Findings", type: "findings", items: findings },
              { title: "Each Point of Adherence", type: "table", rows: R.rows.map((r) => [r.adh + "% adherence" + (r.drop ? " (-" + r.drop + ")" : " (today)"), `${r.onQueue} on the queue, service level ${pc(r.sl)} (${r.meets ? "met" : "missed"}), speed of answer ${r.asa === null ? "overloaded" : Math.round(r.asa) + "s"}, ${otLine(r)}`]) },
              { title: "Planning Assumptions", type: "findings", items: [
                "Adherence is taken as the share of scheduled agents on the queue at any moment.",
                `Overtime multiplier ${v.otMultiplier}x${v.otMultiplier === benchmark("adh.ot.multiplier") ? ", the US Fair Labor Standards Act minimum" : ", entered by you"}; hourly rate ${wageAtBenchmark ? `is the BLS median for customer service representatives, ${BLS_WAGE_VINTAGE}` : "entered by you"}.`,
                `The call rate is taken to hold across ${v.hoursPerDay} open hours a day and ${v.daysPerYear} days a year.`,
                "Erlang C assumes every caller waits to be answered. Callers who hang up leave the queue, so measured service level will sit above what this model gives.",
              ]},
              { title: "Method", type: "text", content: "Erlang C through the Erlang B recurrence gives service level and speed of answer for the agents on the queue at each adherence. Agents needed on the queue are the fewest that meet the target; agents to schedule are that number divided by adherence, rounded up; overtime prices any agents beyond the roster for the open hours and days entered. Published at contactcentercx.com" + METHOD + "." },
            ]}
          />
      </Paper>
    </ToolFrame>
  );
}
