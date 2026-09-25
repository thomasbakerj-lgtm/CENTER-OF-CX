import { useState, useEffect } from "react";
import { ToolNav, ToolHero } from "./src/lib/ToolShell";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";
import { createGuards, guardLine, money } from "./src/lib/guards";
import { benchmark } from "./src/lib/benchmarks";
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

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#5B6E88"; const BORDER = "#D8E3ED";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
const pc = (x, d = 1) => (x * 100).toFixed(d) + "%";
const usd = (x) => "$" + Math.round(x).toLocaleString("en-US");
const secs = (x) => (x === null ? "no answer (queue overloaded)" : Math.round(x) + "s");

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
    `At ${B.adh}% adherence, ${B.onQueue} of ${v.agents} scheduled agents are on the queue. Erlang C gives ${pc(B.sl)} answered within ${v.slaTime} seconds (target ${v.slaTarget}%, ${B.meets ? "met" : "missed"}) and an average speed of answer of ${secs(B.asa)}.`,
    R.need === null
      ? `Holding ${tgt} cannot be reached within the search range at this load.`
      : `Holding ${tgt} takes ${R.need} agents on the queue. ` + (!B.meets ? "The target is already missed at today's adherence." : M ? `Service level first falls below target at ${M.adh}% adherence (${M.drop} points lower), where it is ${pc(M.sl)}.` : "Service level stays at or above target through 10 points of loss."),
    ...(M && M.extra ? [`At ${M.adh}% adherence, holding the target means scheduling ${M.toSchedule} agents, ${M.extra} more than the roster: about ${Math.round(M.otHours).toLocaleString("en-US")} overtime hours, ${usd(M.otCost)} a year at ${v.otMultiplier} × ${money(v.hourlyRate)} an hour.`] : []),
    `Overtime assumes the ${v.callsPerHour.toLocaleString("en-US")} calls an hour hold across ${v.hoursPerDay} open hours a day and ${v.daysPerYear} days a year. Erlang C assumes every caller waits until answered; with abandonment, measured service level runs higher than this model shows.`,
  ];

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh" }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:${FONT};background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.ag{grid-template-columns:1fr 1fr!important}.tiles{grid-template-columns:1fr!important}}`}</style>
      <ToolNav wrap={WRAP} />
      <ToolHero wrap={WRAP} eyebrow="WFM + Staffing" title="Schedule Adherence Impact Calculator"
        intro="Adherence is the share of scheduled time agents spend doing what the schedule says. Enter your queue to see the service level an Erlang C model gives at today's adherence and at each point of loss, the agents it takes to hold your target, and the overtime that costs.">
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", marginTop: 12 }}>Every formula and assumption is in the <a href={METHOD} style={{ color: "#fff", fontWeight: 600, textDecoration: "underline" }}>published method</a>.</p>
      </ToolHero>

      <section style={{ background: WARM, padding: "40px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }} className="ag">
            <Input label="Agents scheduled" value={d.agents} onChange={(x) => set("agents", x)} />
            <Input label="Current adherence" value={d.currentAdherence} onChange={(x) => set("currentAdherence", x)} suffix="%" />
            <Input label="Calls per hour" value={d.callsPerHour} onChange={(x) => set("callsPerHour", x)} />
            <Input label="AHT" value={d.aht} onChange={(x) => set("aht", x)} suffix="sec" />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 12 }} className="ag">
            <Input label="Service level target" value={d.slaTarget} onChange={(x) => set("slaTarget", x)} suffix="%" />
            <Input label="Answer within" value={d.slaTime} onChange={(x) => set("slaTime", x)} suffix="sec" />
            <Input label="Hourly rate" value={d.hourlyRate} onChange={(x) => set("hourlyRate", x)} suffix="$/hr" hint={wageAtBenchmark ? "BLS median, May 2024" : undefined} />
            <Input label="Overtime multiplier" value={d.otMultiplier} onChange={(x) => set("otMultiplier", x)} suffix="x" hint={v.otMultiplier === benchmark("adh.ot.multiplier") ? "US FLSA minimum" : undefined} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginTop: 12 }} className="ag">
            <Input label="Open hours a day" value={d.hoursPerDay} onChange={(x) => set("hoursPerDay", x)} />
            <Input label="Open days a year" value={d.daysPerYear} onChange={(x) => set("daysPerYear", x)} />
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "40px 28px" }}>
        <div style={WRAP}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 28 }} className="tiles">
            <Tile dark label="Service level today" value={pc(B.sl)} note={`Target ${v.slaTarget}%, ${B.meets ? "met" : "missed"}`} />
            <Tile label="On the queue" value={String(B.onQueue)} note={`Of ${v.agents} at ${B.adh}% adherence`} />
            <Tile label="Needed for target" value={R.need === null ? "n/a" : String(R.need)} note="Agents on the queue" />
            <Tile label="At 3 points lower" value={pc(R.row3.sl)} note={R.row3.extra ? `${usd(R.row3.otCost)} a year to hold target` : "No overtime to hold target"} />
          </div>

          <h2 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Each point of adherence</h2>
          <div style={{ overflowX: "auto", marginBottom: 24 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: DEEP, color: "#fff" }}>
                  {["Adherence", "On the queue", "Service level", "Speed of answer", "Target", "To schedule", "Overtime to hold target"].map((h) => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "right", fontSize: 12, fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {R.rows.map((r, i) => (
                  <tr key={r.drop} style={{ background: i % 2 === 0 ? "#fff" : WARM, borderBottom: `1px solid ${BORDER}`, fontWeight: i === 0 ? 600 : 400 }}>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: NAVY }}>{r.adh}%{i === 0 ? " (today)" : ` (-${r.drop})`}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: NAVY }}>{r.onQueue}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: NAVY }}>{pc(r.sl)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: SLATE }}>{r.asa === null ? "overloaded" : Math.round(r.asa) + "s"}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: NAVY }}>{r.meets ? "Met" : "Missed"}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: NAVY }}>{r.toSchedule === null ? "n/a" : r.toSchedule}</td>
                    <td style={{ padding: "10px 12px", textAlign: "right", color: NAVY }}>{r.otCost === null ? "n/a" : r.otCost === 0 ? "None" : usd(r.otCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "22px 26px", marginBottom: 24 }}>
            {findings.map((f, i) => <p key={i} style={{ fontSize: 14, color: i < 3 ? "#fff" : "rgba(255,255,255,0.8)", lineHeight: 1.6, margin: i ? "10px 0 0" : 0 }}>{f}</p>)}
          </div>

          {guards.length > 0 && (
            <div style={{ background: "#FFF7E6", border: "1px solid #F59E0B", borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 4 }}>Inputs corrected. Every figure above was computed on the corrected values.</div>
              {guards.map((g, i) => <div key={i} style={{ fontSize: 12, color: SLATE }}>{guardLine(g)}</div>)}
            </div>
          )}
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
                `Overtime multiplier ${v.otMultiplier}x${v.otMultiplier === benchmark("adh.ot.multiplier") ? ", the US Fair Labor Standards Act minimum" : ", entered by you"}; hourly rate ${wageAtBenchmark ? "is the BLS median for customer service representatives, May 2024" : "entered by you"}.`,
                `The call rate is taken to hold across ${v.hoursPerDay} open hours a day and ${v.daysPerYear} days a year.`,
                "Erlang C assumes no caller abandons, so the service level it gives sits below what abandonment would produce.",
              ]},
              { title: "Method", type: "text", content: "Erlang C through the Erlang B recurrence gives service level and speed of answer for the agents on the queue at each adherence. Agents needed on the queue are the fewest that meet the target; agents to schedule are that number divided by adherence, rounded up; overtime prices any agents beyond the roster for the open hours and days entered. Published at contactcentercx.com" + METHOD + "." },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
