import { useState, useEffect } from "react";
import { ToolFrame } from "./src/lib/ToolFrame.jsx";
import { Result } from "./src/lib/ui.jsx";
import { K, Group, Field, Tile, Choice, Corrections, Paper, frameMethod } from "./src/lib/frameKit.jsx";
import { methodStamp } from "./src/lib/methodVersions.js";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT_IMPORT_CSS } from "./src/lib/type";
import { createGuards, guardLine } from "./src/lib/guards";
import { benchmark } from "./src/lib/benchmarks";
import { runForecast } from "./src/lib/forecast";

/* Forecast Accuracy Tracker. The arithmetic lives in src/lib/forecast.js between engine
   markers. The intervals are 30 minutes, which FC_PARAMS states for the agent conversion. */

const ELECTRIC = "#0088DD";
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

  const result = (
    <Result label="Interval accuracy" value={pc(R.intervalAccuracy)} change={`1 minus WAPE of ${pc(R.wape)}. Total-volume accuracy ${pc(R.totalAccuracy)}, ${signed(R.delta)} contacts on the day.`} />
  );
  const cellInput = { width: 72, minHeight: 40, padding: "0 8px", border: `1px solid ${K.firm}`, borderRadius: 6, textAlign: "right", fontSize: 14, fontWeight: 600, background: "transparent", color: K.strong.color };

  return (
    <ToolFrame toolId={TOOL_ID} section="Operations + Workforce" name="Forecast Accuracy" title="How far off was the forecast, interval by interval?"
      lede="Compare forecast and actual contacts interval by interval. The tracker reports WAPE, the volume-weighted error staffing is planned on, beside MAPE, total-volume accuracy, bias and the tracking signal, and ranks the intervals by contacts missed. The table opens on a labelled sample; replace it with your own intervals."
      method={frameMethod(methodStamp(TOOL_ID))} result={result} pinned={{ label: "Interval accuracy", value: pc(R.intervalAccuracy) }}>
      <style>{FONT_IMPORT_CSS}</style>
      <p style={K.small}>Every formula and line is in the <a href={METHOD} style={K.link}>published method</a>.</p>

      <Group legend="Question 1 of 2 · Your intervals">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center", marginBottom: 16 }}>
          <Choice label="Sample channel" options={Object.entries(CHANNEL_DEFAULTS).map(([k, v]) => [k, v.label + " sample"])} value={channel} onPick={applyChannel} />
          <button type="button" onClick={anotherSample} style={{ minHeight: 44, padding: "0 14px", fontSize: 14, fontWeight: 500, fontFamily: "inherit", borderRadius: 6, border: `1px solid ${K.firm}`, background: "transparent", color: K.strong.color, cursor: "pointer" }}>Another sample</button>
        </div>
        <div style={K.grid(220)}>
          <label style={{ display: "block" }}>
            <span style={{ ...K.strong, fontSize: 14, display: "block", marginBottom: 6 }}>Sample variance: {variance}%</span>
            <input type="range" aria-label="Sample variance, percent" min="2" max="30" value={variance} onChange={(e) => setVariance(Number(e.target.value))} style={{ width: "100%", accentColor: K.shade(0), minHeight: 44 }} />
            <span style={{ ...K.small, display: "block" }}>Shapes the sample only. Enter your own intervals in the table below.</span>
          </label>
          <Field label="AHT (seconds)" value={ahtIn} onChange={setAht} hint="Optional. Turns contacts missed into workload hours." />
        </div>
        <details style={{ marginTop: 16 }}>
          <summary style={{ ...K.link, cursor: "pointer", minHeight: 44, display: "flex", alignItems: "center" }}>Edit interval data</summary>
          <div style={{ maxHeight: 400, overflow: "auto", border: `1px solid ${K.hair}`, borderRadius: 8, marginTop: 8 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", ...K.small, color: K.body.color, ...K.num }}>
              <thead><tr style={{ ...K.kicker, letterSpacing: "0.08em" }}>
                <th scope="col" style={{ padding: "8px 10px", textAlign: "left", fontWeight: 500 }}>Interval</th>
                <th scope="col" style={{ padding: "8px 10px", textAlign: "right", fontWeight: 500 }}>Forecast</th>
                <th scope="col" style={{ padding: "8px 10px", textAlign: "right", fontWeight: 500 }}>Actual</th>
                <th scope="col" style={{ padding: "8px 10px", textAlign: "right", fontWeight: 500 }}>Difference</th>
                <th scope="col" style={{ padding: "8px 10px", textAlign: "right", fontWeight: 500 }}>% of forecast</th>
              </tr></thead>
              <tbody>{R.perInterval.map((r, i) => (
                <tr key={i} style={{ borderTop: `1px solid ${K.hair}` }}>
                  <td style={{ padding: "4px 10px", fontWeight: 600, color: K.strong.color }}>{r.interval}</td>
                  <td style={{ padding: "4px 10px", textAlign: "right" }}><input type="number" aria-label={`Forecast, ${r.interval}`} value={rawRows[i] ? rawRows[i].forecast : r.forecast} onChange={(e) => updateRow(i, "forecast", e.target.value)} style={cellInput} /></td>
                  <td style={{ padding: "4px 10px", textAlign: "right" }}><input type="number" aria-label={`Actual, ${r.interval}`} value={rawRows[i] ? rawRows[i].actual : r.actual} onChange={(e) => updateRow(i, "actual", e.target.value)} style={cellInput} /></td>
                  <td style={{ padding: "4px 10px", textAlign: "right" }}>{signed(r.err)}</td>
                  <td style={{ padding: "4px 10px", textAlign: "right" }}>{r.pctErr === null ? "no forecast" : pc(r.pctErr)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </details>
        {!edited && <p style={{ ...K.small, marginTop: 12 }}>These are sample volumes. Enter your own forecast and actual volumes by interval in the table above for a result about your operation.</p>}
      </Group>

      <Corrections guards={guards} />

      <div style={K.grid(160)}>
        <Tile label="Interval accuracy" value={pc(R.intervalAccuracy)} note={"1 minus WAPE of " + pc(R.wape)} />
        <Tile label="MAPE" value={pc(R.mape)} note="Mean of interval % errors" />
        <Tile label="Total-volume accuracy" value={pc(R.totalAccuracy)} note={signed(R.delta) + " contacts on the day"} />
        <Tile label="Tracking signal" value={R.trackingSignal.toFixed(1)} note={R.lean === "none" ? `Within plus or minus ${L}` : R.lean === "above" ? "Forecast running low" : "Forecast running high"} />
      </div>

      <section aria-label="Forecast and actual by interval" style={{ ...K.panel, overflowX: "auto" }}>
        <h2 style={K.h2}>Forecast and actual by interval</h2>
        <svg viewBox={`0 0 ${chartW} ${chartH + 24}`} style={{ width: "100%", maxWidth: chartW, minWidth: 320 }} role="img" aria-label="Forecast and actual contacts by interval">
          {rows.map((r, i) => {
            const fH = (r.forecast / maxVal) * chartH, aH = (r.actual / maxVal) * chartH, x = i * barW;
            return (
              <g key={i}>
                <rect x={x + 2} y={chartH - fH} width={barW * 0.4} height={fH} fill={K.shade(3)} rx={2} />
                <rect x={x + barW * 0.45} y={chartH - aH} width={barW * 0.4} height={aH} fill={K.shade(0)} rx={2} />
                {i % 4 === 0 && <text x={x + barW / 2} y={chartH + 18} textAnchor="middle" fontSize="13" fill={K.small.color}>{r.interval}</text>}
              </g>
            );
          })}
        </svg>
        <div style={{ display: "flex", gap: 16, ...K.small, marginTop: 4 }}>
          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: K.shade(3), marginRight: 6, verticalAlign: "middle" }} />Forecast</span>
          <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: K.shade(0), marginRight: 6, verticalAlign: "middle" }} />Actual</span>
        </div>
      </section>

      <section aria-label="Largest misses" style={K.panel}>
        <h2 style={K.h2}>Largest misses, by contacts</h2>
        {R.worst.map((w) => (
          <div key={w.i} style={{ ...K.row, alignItems: "flex-start" }}>
            <span style={{ ...K.strong, flexShrink: 0, width: 56 }}>{w.interval}</span>
            <span style={{ ...K.body, fontSize: 14, flex: 1 }}>{signed(w.err)} contacts ({w.err > 0 ? "above" : "below"} a forecast of {w.forecast})<span style={{ ...K.small, display: "block" }}>{aht > 0 ? `${h1(Math.abs(w.hours))} workload hours, about ${h1(Math.abs(w.agents))} agents busy` : "Enter an AHT for workload hours"}</span></span>
          </div>
        ))}
        {!R.worst.length && <p style={K.small}>Every interval matched its forecast.</p>}
      </section>

      <section aria-label="What it means" style={K.lead}>
        <span style={K.kicker}>What it means</span>
        {findings.map((f, i) => <p key={i} style={{ ...K.body, marginTop: i ? 10 : 8 }}>{f}</p>)}
      </section>

      <Paper>
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
            ]}
          />
      </Paper>
    </ToolFrame>
  );
}
