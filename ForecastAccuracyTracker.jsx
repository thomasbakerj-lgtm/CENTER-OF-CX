import { useState, useEffect } from "react";
import { ToolNav, ToolHero } from "./src/lib/ToolShell";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";
import { createGuards, guardLine } from "./src/lib/guards";
import { benchmark } from "./src/lib/benchmarks";
import { runForecast } from "./src/lib/forecast";

/* Forecast Accuracy Tracker. The arithmetic lives in src/lib/forecast.js between engine
   markers. The intervals are 30 minutes, which FC_PARAMS states for the agent conversion. */

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#5B6E88"; const BORDER = "#D8E3ED";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
const TOOL_ID = "forecast-accuracy";
const ROUTE = "/tools/forecast-accuracy";
const METHOD = "/methodology/forecast-accuracy";
const pc = (x, d = 1) => (x === null ? "n/a" : (x * 100).toFixed(d) + "%");
const signed = (x) => (x > 0 ? "+" : "") + x.toLocaleString("en-US");
const h1 = (x) => (Math.round(x * 10) / 10).toLocaleString("en-US");

const INTERVALS = ["6:00","6:30","7:00","7:30","8:00","8:30","9:00","9:30","10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00"];

const CHANNEL_DEFAULTS = {
  voice: { label: "Voice", data: [18,22,35,52,68,82,95,98,92,88,85,78,72,75,80,85,78,70,62,55,48,42,38,32,28,24,20,16,12,8,5] },
  chat: { label: "Chat", data: [5,8,12,18,25,30,38,42,40,38,35,32,28,30,32,35,30,25,22,20,18,15,12,10,8,6,5,4,3,2,1] },
  email: { label: "Email", data: [8,10,12,14,16,18,20,20,18,16,15,14,12,12,14,16,14,12,10,8,8,6,5,4,4,3,2,2,1,1,0] },
};

/* Sample actuals are deterministic. They used to be drawn from Math.random on
   every load, so a first visit showed invented volumes that changed on refresh
   and printed in the PDF as if they were the reader's. A fixed pattern within
   the chosen variance keeps the sample reproducible and a scenario link exact. */
const WOBBLE = INTERVALS.map((_, i) => Math.sin(i * 2.399) * 0.5 + Math.sin(i * 0.7) * 0.5);
const sampleRows = (ch, variancePct) => {
  const base = CHANNEL_DEFAULTS[ch].data, v = variancePct / 100;
  return INTERVALS.map((t, i) => ({ interval: t, forecast: base[i], actual: Math.max(0, Math.round(base[i] * (1 + WOBBLE[i] * v))) }));
};

/* An example handle time so the opening case shows workload hours. Replace it with yours. */
export const DEFAULTS = { channel: "voice", variance: 8, rows: sampleRows("voice", 8), aht: 360 };
export const FC_PARAMS = { tsLimit: benchmark("forecast.ts.limit"), intervalMin: 30 };

function Tile({ label, value, note, dark }) {
  return (
    <div style={{ background: dark ? `linear-gradient(135deg, ${NAVY}, ${DEEP})` : WARM, border: dark ? "none" : `1px solid ${BORDER}`, borderRadius: 10, padding: 20, textAlign: "center" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: dark ? LIGHT : MUTED, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 30, color: dark ? "#fff" : NAVY }}>{value}</div>
      <div style={{ fontSize: 12, color: dark ? "rgba(255,255,255,0.78)" : MUTED }}>{note}</div>
    </div>
  );
}

export default function ForecastAccuracyTracker() {
  const [init] = useState(() => ({ ...DEFAULTS, ...(readScenario(TOOL_ID, DEFAULTS) || {}) }));
  const [channel, setChannel] = useState(init.channel);
  const [variance, setVariance] = useState(init.variance);
  const [rawRows, setRows] = useState(init.rows);
  const [ahtIn, setAht] = useState(init.aht);
  useEffect(() => { window.scrollTo(0, 0); clearScenarioParam(); }, []);
  /* Sample until the reader enters a volume. A link that carries rows other than
     the sample for its channel is treated as entered data. */
  const [edited, setEdited] = useState(() => JSON.stringify(init.rows) !== JSON.stringify(sampleRows(init.channel, init.variance)));

  const applyChannel = (ch) => { setChannel(ch); setRows(sampleRows(ch, variance)); setEdited(false); };
  /* Another sample at the chosen variance, still deterministic: the pattern is shifted
     by a counter, never drawn at random. */
  const [shift, setShift] = useState(0);
  const anotherSample = () => {
    const next = shift + 1; setShift(next); setEdited(false);
    const base = CHANNEL_DEFAULTS[channel].data, v = variance / 100;
    setRows(INTERVALS.map((t, i) => ({ interval: t, forecast: base[i], actual: Math.max(0, Math.round(base[i] * (1 + WOBBLE[(i + next * 7) % WOBBLE.length] * v))) })));
  };
  const updateRow = (i, field, val) => {
    setEdited(true);
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: Number(val) || 0 } : r)));
  };

  /* Every cell is clamped at the engine boundary and every correction disclosed. */
  const { guards, guard } = createGuards();
  const rows = (Array.isArray(rawRows) ? rawRows : DEFAULTS.rows).map((r) => ({
    interval: String(r.interval),
    forecast: guard(`${r.interval} forecast`, r.forecast, 0, 10000000, ""),
    actual: guard(`${r.interval} actual`, r.actual, 0, 10000000, ""),
  }));
  const aht = guard("AHT", ahtIn, 0, 36000, " sec");
  const R = runForecast(rows, FC_PARAMS, aht);
  const L = FC_PARAMS.tsLimit;
  const cancelled = R.absErr - Math.abs(R.delta);

  const worstLine = (w) => `${w.interval}: forecast ${w.forecast.toLocaleString("en-US")}, actual ${w.actual.toLocaleString("en-US")}, ${signed(w.err)} contacts` + (aht > 0 ? `, ${h1(Math.abs(w.hours))} workload hours, about ${h1(Math.abs(w.agents))} agents busy for the interval` : "");
  const findings = [
    R.wape === null
      ? "No actual contacts were entered, so no interval error can be measured."
      : `Across ${R.n} intervals the forecast missed ${R.absErr.toLocaleString("en-US")} contacts, above or below: WAPE ${pc(R.wape)} of the ${R.totalA.toLocaleString("en-US")} actual contacts, interval accuracy ${pc(R.intervalAccuracy)}.`,
    R.totalAccuracy === null
      ? "No forecast volume was entered, so total-volume accuracy cannot be measured."
      : `The day's total came in at ${R.totalA.toLocaleString("en-US")} against a forecast of ${R.totalF.toLocaleString("en-US")} (${signed(R.delta)}), total-volume accuracy ${pc(R.totalAccuracy)}.` + (cancelled > 0 ? ` ${cancelled.toLocaleString("en-US")} contacts of interval error cancelled out in that total, which is why it can read high while intervals miss.` : ""),
    R.mape === null
      ? "MAPE needs at least one interval with actual contacts."
      : `MAPE is ${pc(R.mape)} across the ${R.n - R.mapeExcluded} intervals with actual contacts${R.mapeExcluded ? ` (${R.mapeExcluded} with none are left out)` : ""}. It weighs a quiet interval as much as a busy one, so plan staffing on WAPE.`,
    R.bias === null
      ? "Bias needs a forecast volume."
      : `Actual ran ${pc(Math.abs(R.bias))} ${R.bias >= 0 ? "above" : "below"} forecast for the day. The tracking signal is ${R.trackingSignal.toFixed(1)}: ` + (R.lean === "above" ? `above +${L}, so actual ran above forecast more consistently than random error would (the forecast is running low).` : R.lean === "below" ? `below -${L}, so actual ran below forecast more consistently than random error would (the forecast is running high).` : `within plus or minus ${L}, so any bias is not distinguished from random error.`),
    ...(R.worst.length ? [`The largest miss is ${worstLine(R.worst[0])}.`] : []),
    aht > 0
      ? `At ${aht} seconds a contact, intervals that ran above forecast left ${h1(R.underHours)} workload hours unplanned and intervals below forecast planned ${h1(R.overHours)} hours with no contacts, before service level and shrinkage.`
      : "Enter an AHT to turn contacts missed into workload hours.",
  ];

  const maxVal = Math.max(...rows.map((r) => Math.max(r.forecast, r.actual)), 1);
  const chartW = 700; const chartH = 180; const barW = chartW / Math.max(rows.length, 1);

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh" }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:${FONT};background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.fg{grid-template-columns:1fr!important}.wrow{grid-template-columns:64px 1fr!important}.wrow .wide{display:none}}`}</style>
      <ToolNav wrap={WRAP} />
      <ToolHero wrap={WRAP} eyebrow="WFM + Staffing" title="Forecast Accuracy Tracker"
        intro="Compare forecast and actual contacts interval by interval. The tracker reports WAPE, the volume-weighted error staffing is planned on, beside MAPE, total-volume accuracy, bias and the tracking signal, and ranks the intervals by contacts missed. The table opens on a labelled sample; replace it with your own intervals.">
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", marginTop: 12 }}>Every formula and line is in the <a href={METHOD} style={{ color: "#fff", fontWeight: 600, textDecoration: "underline" }}>published method</a>.</p>
      </ToolHero>

      <section style={{ background: WARM, padding: "40px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {Object.entries(CHANNEL_DEFAULTS).map(([k, v]) => (
              <button key={k} onClick={() => applyChannel(k)} style={{ minHeight: 44, padding: "6px 14px", fontSize: 13, fontWeight: 600, fontFamily: "inherit", borderRadius: 6, border: `1px solid ${channel === k ? ELECTRIC : BORDER}`, background: channel === k ? ELECTRIC : "#fff", color: channel === k ? "#fff" : SLATE, cursor: "pointer" }}>{v.label} sample</button>
            ))}
            <button onClick={anotherSample} style={{ minHeight: 44, padding: "6px 14px", fontSize: 13, fontWeight: 600, fontFamily: "inherit", borderRadius: 6, border: `1px solid ${BORDER}`, background: "#fff", color: SLATE, cursor: "pointer" }}>Another sample</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }} className="fg">
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>Sample variance: {variance}%</label>
              <input type="range" aria-label="Sample variance, percent" min="2" max="30" value={variance} onChange={(e) => setVariance(Number(e.target.value))} style={{ width: "100%", marginTop: 4 }} />
              <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>Shapes the sample only. Enter your own intervals in the table below.</p>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: NAVY, display: "block", marginBottom: 4 }}>AHT (seconds)</label>
              <input aria-label="AHT, seconds" type="number" value={ahtIn} onChange={(e) => setAht(Number(e.target.value))} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY }} />
              <span style={{ fontSize: 12, color: MUTED, marginTop: 2, display: "block" }}>Optional. Turns contacts missed into workload hours.</span>
            </div>
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "40px 28px" }}>
        <div style={WRAP}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 28 }} className="fg">
            <Tile dark label="Interval accuracy" value={pc(R.intervalAccuracy)} note={"1 minus WAPE of " + pc(R.wape)} />
            <Tile label="MAPE" value={pc(R.mape)} note="Mean of interval % errors" />
            <Tile label="Total-volume accuracy" value={pc(R.totalAccuracy)} note={signed(R.delta) + " contacts on the day"} />
            <Tile label="Tracking signal" value={R.trackingSignal.toFixed(1)} note={R.lean === "none" ? `Within plus or minus ${L}` : R.lean === "above" ? "Forecast running low" : "Forecast running high"} />
          </div>

          <div style={{ marginBottom: 28, overflowX: "auto" }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Forecast and actual by interval</h2>
            <svg viewBox={`0 0 ${chartW} ${chartH + 24}`} style={{ width: "100%", maxWidth: chartW }} role="img" aria-label="Forecast and actual contacts by interval">
              {rows.map((r, i) => {
                const fH = (r.forecast / maxVal) * chartH, aH = (r.actual / maxVal) * chartH, x = i * barW;
                return (
                  <g key={i}>
                    <rect x={x + 2} y={chartH - fH} width={barW * 0.4} height={fH} fill="#9CC9EC" rx={2} />
                    <rect x={x + barW * 0.45} y={chartH - aH} width={barW * 0.4} height={aH} fill={NAVY} rx={2} />
                    {i % 4 === 0 && <text x={x + barW / 2} y={chartH + 18} textAnchor="middle" fontSize="13" fill={MUTED}>{r.interval}</text>}
                  </g>
                );
              })}
            </svg>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: SLATE, marginTop: 4 }}>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: "#9CC9EC", marginRight: 4, verticalAlign: "middle" }} />Forecast</span>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: NAVY, marginRight: 4, verticalAlign: "middle" }} />Actual</span>
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 12 }}>Largest misses, by contacts</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {R.worst.map((w, i) => (
                <div key={w.i} className="wrow" style={{ display: "grid", gridTemplateColumns: "64px 1fr 1fr", gap: 8, padding: "10px 12px", background: i % 2 === 0 ? WARM : "#fff", borderRadius: 4, fontSize: 13, alignItems: "center" }}>
                  <span style={{ fontWeight: 600, color: NAVY }}>{w.interval}</span>
                  <span style={{ color: NAVY }}>{signed(w.err)} contacts ({w.err > 0 ? "above" : "below"} a forecast of {w.forecast})</span>
                  <span className="wide" style={{ color: SLATE }}>{aht > 0 ? `${h1(Math.abs(w.hours))} workload hours, about ${h1(Math.abs(w.agents))} agents busy` : "Enter an AHT for workload hours"}</span>
                </div>
              ))}
              {!R.worst.length && <p style={{ fontSize: 13, color: SLATE }}>Every interval matched its forecast.</p>}
            </div>
          </div>

          <details style={{ marginBottom: 28 }}>
            <summary style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC, cursor: "pointer", marginBottom: 8, minHeight: 44 }}>Edit interval data</summary>
            <div style={{ maxHeight: 400, overflowY: "auto", border: `1px solid ${BORDER}`, borderRadius: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr style={{ background: DEEP, color: "#fff" }}>
                  <th style={{ padding: "8px 12px", textAlign: "left" }}>Interval</th>
                  <th style={{ padding: "8px 12px", textAlign: "right" }}>Forecast</th>
                  <th style={{ padding: "8px 12px", textAlign: "right" }}>Actual</th>
                  <th style={{ padding: "8px 12px", textAlign: "right" }}>Difference</th>
                  <th style={{ padding: "8px 12px", textAlign: "right" }}>% of forecast</th>
                </tr></thead>
                <tbody>{R.perInterval.map((r, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : WARM }}>
                    <td style={{ padding: "4px 12px", fontWeight: 500 }}>{r.interval}</td>
                    <td style={{ padding: "4px 12px", textAlign: "right" }}><input type="number" aria-label={`Forecast, ${r.interval}`} value={rawRows[i] ? rawRows[i].forecast : r.forecast} onChange={(e) => updateRow(i, "forecast", e.target.value)} style={{ width: 64, padding: "6px", border: `1px solid ${BORDER}`, borderRadius: 4, textAlign: "right", fontSize: 12 }} /></td>
                    <td style={{ padding: "4px 12px", textAlign: "right" }}><input type="number" aria-label={`Actual, ${r.interval}`} value={rawRows[i] ? rawRows[i].actual : r.actual} onChange={(e) => updateRow(i, "actual", e.target.value)} style={{ width: 64, padding: "6px", border: `1px solid ${BORDER}`, borderRadius: 4, textAlign: "right", fontSize: 12 }} /></td>
                    <td style={{ padding: "4px 12px", textAlign: "right" }}>{signed(r.err)}</td>
                    <td style={{ padding: "4px 12px", textAlign: "right" }}>{r.pctErr === null ? "no forecast" : pc(r.pctErr)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </details>

          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "22px 26px", marginBottom: 24 }}>
            {findings.map((f, i) => <p key={i} style={{ fontSize: 14, color: i < 2 ? "#fff" : "rgba(255,255,255,0.85)", lineHeight: 1.6, margin: i ? "10px 0 0" : 0 }}>{f}</p>)}
          </div>

          {!edited && (
            <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 16px", marginBottom: 16, fontSize: 12, color: SLATE }}>
              These are sample volumes. Enter your own forecast and actual volumes by interval in the table above for a result about your operation.
            </div>
          )}
          {guards.length > 0 && (
            <div style={{ background: "#FFF7E6", border: "1px solid #F59E0B", borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 4 }}>Inputs corrected. Every figure above was computed on the corrected values.</div>
              {guards.map((g, i) => <div key={i} style={{ fontSize: 12, color: SLATE }}>{guardLine(g)}</div>)}
            </div>
          )}
          <ReportActions
            toolId={TOOL_ID}
            toolName="Forecast Accuracy Analysis"
            subtitle="Forecast and Actual by Interval"
            routePath={ROUTE}
            state={{ channel, variance, rows: rawRows, aht: ahtIn }}
            defaults={DEFAULTS}
            summary={[
              { label: "Interval accuracy", value: pc(R.intervalAccuracy) },
              { label: "WAPE", value: pc(R.wape) },
              { label: "MAPE", value: pc(R.mape) },
              { label: "Tracking signal", value: R.trackingSignal.toFixed(1) },
            ]}
            sections={[
              { title: "Accuracy Metrics", type: "metrics", items: [
                { label: "Interval Accuracy", value: pc(R.intervalAccuracy), color: ELECTRIC, sub: "WAPE " + pc(R.wape) },
                { label: "MAPE", value: pc(R.mape), color: ELECTRIC },
                { label: "Total-Volume Accuracy", value: pc(R.totalAccuracy), color: ELECTRIC, sub: signed(R.delta) + " contacts" },
                { label: "Tracking Signal", value: R.trackingSignal.toFixed(1), color: ELECTRIC, sub: "Limit plus or minus " + L },
              ]},
              ...(guards.length ? [{ title: "Inputs Corrected", type: "findings", items: guards.map(guardLine) }] : []),
              { title: "Key Findings", type: "findings", items: findings },
              { title: "Largest Misses", type: "table", rows: R.worst.map((w) => [w.interval, worstLine(w).slice(w.interval.length + 2)]) },
              { title: "Forecast Data", type: "table", rows: R.perInterval.map((r) => [r.interval, "Forecast " + r.forecast + ", actual " + r.actual + ", " + signed(r.err) + (r.pctErr === null ? " (no forecast)" : " (" + pc(r.pctErr) + " of forecast)")]) },
              { title: "Data", type: "text", content: edited ? "Forecast and actual volumes as entered." : "These are sample volumes. Enter your own forecast and actual volumes by interval for a result about your operation." },
              { title: "Method", type: "text", content: "WAPE is the contacts missed in every interval over the actual contacts; interval accuracy is 1 minus WAPE. MAPE is the mean of interval percent errors over intervals with actual contacts. The tracking signal is the sum of errors over the mean absolute error, read against plus or minus " + L + ", a textbook control limit. Workload hours are contacts times AHT over 3,600; agents busy are that workload over the 30-minute interval. Published at contactcentercx.com" + METHOD + "." },
              { title: "Next Steps", type: "next", items: [
                { tool: "Staffing Calculator", href: "/tools/staffing-calculator", reason: "Staff the intervals that ran above forecast at your service level" },
                { tool: "Schedule Adherence", href: "/tools/schedule-adherence", reason: "Check whether adherence gaps compound the forecast error" },
              ]},
            ]}
          />
        </div>
      </section>
    </div>
  );
}
