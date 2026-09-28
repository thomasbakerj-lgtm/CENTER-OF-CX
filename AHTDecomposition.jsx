import { useState, useEffect } from "react";
import { ToolFrame } from "./src/lib/ToolFrame.jsx";
import { Result } from "./src/lib/ui.jsx";
import { K, Group, Field, Tile, Choice, Corrections, Assumptions, Paper, frameMethod } from "./src/lib/frameKit.jsx";
import { methodStamp } from "./src/lib/methodVersions.js";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT_IMPORT_CSS } from "./src/lib/type";
import { createGuards, guardLine } from "./src/lib/guards";
import { benchmark } from "./src/lib/benchmarks";
import { publishToolResult } from "./src/lib/toolData";
import { runAHT, AHT_COMPONENTS, AHT_LEVERS } from "./src/lib/aht";

/* AHT Decomposition. The arithmetic lives in src/lib/aht.js between engine markers; every
   lever share opens at its registered heuristic and the buyer can change it. */

const TOOL_ID = "aht-decomposition";
const ROUTE = "/tools/aht-decomposition";
const METHOD = "/methodology/aht-decomposition";

/* Example profiles so the tool opens on a runnable case. Illustrative, never benchmarks. */
export const PRESETS = {
  blended: { talk: 210, hold: 55, wrap: 60, transfer: 15, search: 30, admin: 25 },
  billing: { talk: 180, hold: 70, wrap: 45, transfer: 20, search: 25, admin: 20 },
  techSupport: { talk: 240, hold: 80, wrap: 50, transfer: 30, search: 45, admin: 35 },
  sales: { talk: 280, hold: 30, wrap: 70, transfer: 10, search: 15, admin: 20 },
  simple: { talk: 120, hold: 20, wrap: 30, transfer: 5, search: 10, admin: 15 },
};
const PRESET_NAMES = [["blended", "Blended"], ["billing", "Billing"], ["techSupport", "Tech support"], ["sales", "Sales"], ["simple", "Simple"]];
/* Every lever share opens at its registered heuristic, as a whole percent. */
export const LEVER_DEFAULTS = Object.fromEntries(AHT_LEVERS.map((L) => [L.id, { on: true, ...Object.fromEntries(L.targets.map((c) => [c, Math.round(benchmark(`aht.lever.${L.id}.${c}`) * 100)])) }]));
export const DEFAULTS = { values: PRESETS.blended, contactType: "blended", contacts: 20000, levers: LEVER_DEFAULTS };

const ELECTRIC = "#0088DD";
const COMPONENT = {
  talk: { name: "Talk time", shade: 0, desc: "Conversation between the agent and the customer." },
  hold: { name: "Hold time", shade: 1, desc: "The customer waits while the agent looks something up, consults or waits on an approval." },
  wrap: { name: "After-call work", shade: 2, desc: "Notes, disposition, case updates and follow-up tasks after the contact ends." },
  transfer: { name: "Transfer and conference", shade: 3, desc: "Starting, waiting on and completing warm or cold transfers." },
  search: { name: "Knowledge search", shade: 4, desc: "Searching the knowledge base or procedures, or asking a peer, during the contact." },
  admin: { name: "System and admin", shade: 5, desc: "Moving between applications, copying data, system latency and compliance steps." },
};
const LEVER_TAKES = {
  summarization: "Automatic summaries and disposition in the agent desktop.",
  knowledge: "Answers surfaced to the agent during the contact from a maintained knowledge base.",
  desktop: "The agent's applications brought into one desktop or linked by integration.",
  routing: "Routing on intent and skill so the first agent reached can resolve.",
};
const pc = (x, d = 0) => (x * 100).toFixed(d) + "%";
const fmt = (sec) => { const s = Math.round(sec); return s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`; };
const hrs = (h) => Math.round(h).toLocaleString("en-US");

function Slider({ id, value, onChange }) {
  const c = COMPONENT[id];
  return (
    <div style={K.box}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ ...K.strong, fontSize: 14 }}>{c.name}</span>
        <span style={{ ...K.strong, fontSize: 18, ...K.num }}>{value}s</span>
      </div>
      <input type="range" aria-label={`${c.name}, seconds`} min={0} max={300} value={Math.min(300, Math.max(0, Number(value) || 0))} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%", accentColor: K.shade(0), height: 6, cursor: "pointer" }} />
      <div style={{ ...K.small, marginTop: 4 }}>{c.desc}</div>
    </div>
  );
}

/* A link may carry only part of the state (an old link has components and no levers), so
   every missing part falls back to its default. */
const restore = (s) => {
  const x = s || {};
  return { ...DEFAULTS, ...x, values: { ...DEFAULTS.values, ...(x.values || {}) }, levers: Object.fromEntries(AHT_LEVERS.map((L) => [L.id, { ...LEVER_DEFAULTS[L.id], ...((x.levers || {})[L.id] || {}) }])) };
};

export default function AHTDecomposition() {
  const [d, setD] = useState(() => restore(readScenario(TOOL_ID, DEFAULTS)));
  useEffect(() => { window.scrollTo(0, 0); clearScenarioParam(); }, []);
  const setValue = (id, x) => setD((p) => ({ ...p, values: { ...p.values, [id]: x } }));
  const setLever = (id, key, x) => setD((p) => ({ ...p, levers: { ...p.levers, [id]: { ...p.levers[id], [key]: x } } }));
  const applyPreset = (key) => setD((p) => ({ ...p, contactType: key, values: PRESETS[key] }));

  /* Every input is clamped at the engine boundary and every correction is disclosed on
     screen and in the PDF. Talk time is at least 1 second so a total of zero cannot divide. */
  const { guards, guard } = createGuards();
  const v = {
    values: Object.fromEntries(AHT_COMPONENTS.map((c) => [c, guard(COMPONENT[c].name, d.values[c], c === "talk" ? 1 : 0, 3600, " sec")])),
    contacts: guard("Contacts per month", d.contacts, 0, 100000000, ""),
    levers: Object.fromEntries(AHT_LEVERS.map((L) => [L.id, { on: d.levers[L.id].on === true, ...Object.fromEntries(L.targets.map((c) => [c, guard(`${L.name}, ${COMPONENT[c].name.toLowerCase()} removed`, d.levers[L.id][c], 0, 100, "%")])) }])),
  };
  const R = runAHT(v);
  /* Handle time goes to the rail for the Staffing Calculator. It grades Directional while the
     components are still an example profile or were corrected, and Planning-grade once they
     are the reader's own: this tool has no document attestation path. */
  const ahtOrigin = guards.length || Object.values(PRESETS).some((p) => AHT_COMPONENTS.every((c) => p[c] === v.values[c])) ? "Directional" : "Planning-grade";
  useEffect(() => { publishToolResult("aht-decomposition", { aht: R.total }, { aht: ahtOrigin }); }, [R.total, ahtOrigin]);
  const selected = R.levers.filter((L) => L.on);
  const leverLine = (L) => L.targets.map((c) => `${L.pcts[c]}% of ${COMPONENT[c].name.toLowerCase()}`).join(" and ");

  const findings = [
    `Average handle time (AHT, the time an agent spends on one contact from start to finish) is ${fmt(R.total)}. Conversation is ${pc(R.talkShare)} of it (${fmt(v.values.talk)}); the other ${fmt(R.nonTalk)} (${pc(R.nonTalkShare)}) is hold, after-call work, transfers, search and system time.`,
    `The largest part outside the conversation is ${COMPONENT[R.largestNonTalk].name.toLowerCase()} at ${fmt(v.values[R.largestNonTalk])}. Look there first: it is the time you can cut without shortening the conversation.`,
    ...R.levers.filter((L) => L.on && L.saved > 0).map((L) => `${L.name}, removing ${leverLine(L)}, models ${fmt(L.saved)} a contact (${pc(L.savedPct, 1)}).`),
    selected.length
      ? `With the ${selected.length} lever${selected.length > 1 ? "s" : ""} selected, the model takes handle time from ${fmt(R.total)} to ${fmt(R.combinedNew)}, ${pc(R.combinedSavedPct, 1)} lower, under the shares shown.`
      : `No lever is selected, so no reduction is modelled. Tick the initiatives you are weighing to see their combined effect.`,
    v.contacts > 0 && selected.length
      ? `At ${v.contacts.toLocaleString("en-US")} contacts a month that is about ${hrs(R.combinedHours)} agent hours a year of capacity. That is time freed for agents. Capacity becomes cash only through an action such as fewer hires or less overtime, so decide which one before counting it as a saving.`
      : `Enter contacts per month to see the agent hours a reduction frees.`,
  ];
  const assumptions = [
    "Every lever share opens at a planning heuristic with no published source. Replace it with a vendor's evidence or your own pilot before relying on it.",
    "A lever counts toward the combined figure only when it is selected. Two levers on the same component combine multiplicatively: each removes its share of what the other leaves.",
    "Agent hours are capacity. The Staffing Calculator turns handle time into agents at your service level.",
    `The ${PRESET_NAMES.map(([, n]) => n.toLowerCase()).join(", ")} profiles are illustrative starting points. They are examples of our own and carry no benchmark weight.`,
  ];

  const result = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Result label="Handle time" value={fmt(R.total)} change={`Conversation is ${pc(R.talkShare)} of it; ${fmt(R.nonTalk)} is outside the conversation.`} />
      <div style={K.panel}>
        <div style={{ ...K.row, borderTop: "none", paddingTop: 0 }}><span style={K.small}>With selected levers</span><span style={{ ...K.strong, ...K.num }}>{fmt(R.combinedNew)}</span></div>
        <p style={K.small}>{selected.length ? pc(R.combinedSavedPct, 1) + " lower, " + selected.length + " selected" : "No lever selected"}</p>
      </div>
    </div>
  );

  return (
    <ToolFrame toolId={TOOL_ID} section="Performance + Quality" name="AHT Decomposition" title="Where do the seconds of handle time go?"
      lede="Average handle time (AHT) is how long an agent spends on one contact, and it is several parts added together. Set talk, hold, after-call work, transfer, search and system time to see where the seconds go. Then pick the initiatives you are weighing, set how much of each part they remove, and see the handle time and agent hours that follow."
      method={frameMethod(methodStamp(TOOL_ID))} result={result} pinned={{ label: "Handle time", value: fmt(R.total) }}>
      <style>{FONT_IMPORT_CSS}</style>
      <p style={K.small}>Every formula and assumption is in the <a href={METHOD} style={K.link}>published method</a>.</p>

      <Group legend="Question 1 of 2 · Your handle time">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <span style={K.small}>Example profiles, illustrative only:</span>
          <Choice label="Example profiles" options={PRESET_NAMES} value={d.contactType} onPick={applyPreset} />
        </div>
        <div style={K.grid(240)}>
          {AHT_COMPONENTS.map((c) => <Slider key={c} id={c} value={d.values[c]} onChange={(x) => setValue(c, x)} />)}
        </div>
        <div style={{ maxWidth: 320, marginTop: 16 }}>
          <Field label="Contacts per month" value={d.contacts} onChange={(x) => setD((p) => ({ ...p, contacts: x }))} hint="Optional. Turns seconds saved into agent hours a year." />
        </div>
      </Group>

      <Corrections guards={guards} />

      <div style={K.grid(160)}>
        <Tile label="Handle time" value={fmt(R.total)} note="Sum of the six components" />
        <Tile label="Conversation" value={pc(R.talkShare)} note={fmt(v.values.talk) + " of talk"} />
        <Tile label="Outside the conversation" value={fmt(R.nonTalk)} note={pc(R.nonTalkShare) + " of handle time"} />
        <Tile label="With selected levers" value={fmt(R.combinedNew)} note={selected.length ? pc(R.combinedSavedPct, 1) + " lower, " + selected.length + " selected" : "No lever selected"} />
      </div>

      <section aria-label="Where the seconds go" style={K.panel}>
        <h2 style={K.h2}>Where the seconds go</h2>
        <div role="img" aria-label={AHT_COMPONENTS.map((c) => `${COMPONENT[c].name} ${pc(R.shares[c])}`).join(", ")} style={{ display: "flex", height: 28, borderRadius: 4, overflow: "hidden", border: `1px solid ${K.hair}`, marginBottom: 14 }}>
          {AHT_COMPONENTS.map((c) => R.shares[c] > 0 && <div key={c} title={COMPONENT[c].name} style={{ width: pc(R.shares[c], 2), background: K.shade(COMPONENT[c].shade), borderRight: `1px solid ${K.firm}` }} />)}
        </div>
        {AHT_COMPONENTS.map((c) => (
          <div key={c} style={{ ...K.row, alignItems: "flex-start" }}>
            <span style={{ display: "flex", gap: 10, minWidth: 0 }}>
              <span aria-hidden="true" style={{ flexShrink: 0, width: 10, height: 10, marginTop: 6, borderRadius: 2, background: K.shade(COMPONENT[c].shade) }} />
              <span style={{ minWidth: 0 }}>
                <span style={{ ...K.strong, fontSize: 14 }}>{COMPONENT[c].name} · {fmt(v.values[c])}</span>
                <span style={{ ...K.small, display: "block" }}>{COMPONENT[c].desc}</span>
              </span>
            </span>
            <span style={{ ...K.strong, ...K.num, flexShrink: 0 }}>{pc(R.shares[c])}</span>
          </div>
        ))}
      </section>

      <Group legend="Question 2 of 2 · Initiatives you are weighing" note="Each share opens at a planning heuristic, our estimate with no published source. Replace it with what a vendor can evidence or what your own pilot measured, and tick the levers you want in the combined figure.">
        <div style={K.grid(260)}>
          {R.levers.map((L) => (
            <div key={L.id} style={{ ...K.box, border: `1px solid ${L.on ? K.firm : K.hair}` }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 44, cursor: "pointer" }}>
                <input type="checkbox" checked={L.on} onChange={(e) => setLever(L.id, "on", e.target.checked)} style={{ width: 20, height: 20 }} />
                <span style={{ ...K.strong, fontSize: 15, fontWeight: 700 }}>{L.name}</span>
              </label>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "6px 0 8px" }}>
                {L.targets.map((c) => (
                  <label key={c} style={{ ...K.small, display: "flex", alignItems: "center", gap: 6 }}>
                    <input aria-label={`${L.name}: share of ${COMPONENT[c].name.toLowerCase()} removed`} type="number" value={d.levers[L.id][c]} onChange={(e) => setLever(L.id, c, Number(e.target.value))} style={{ width: 72, minHeight: 44, padding: "0 8px", fontSize: 15, fontWeight: 600, border: `1px solid ${K.firm}`, borderRadius: 6, background: "transparent", color: K.strong.color }} />
                    % of {COMPONENT[c].name.toLowerCase()}
                  </label>
                ))}
              </div>
              <p style={{ ...K.body, fontSize: 14, margin: "0 0 4px" }}>{fmt(L.saved)} a contact, handle time {fmt(L.newAHT)}{v.contacts > 0 ? `, about ${hrs(L.hours)} agent hours a year` : ""}</p>
              <p style={K.small}>What it takes: {LEVER_TAKES[L.id]}</p>
            </div>
          ))}
        </div>
      </Group>

      <section aria-label="What it means" style={K.lead}>
        {findings.slice(-2).map((f, i) => <p key={i} style={{ ...K.body, marginTop: i ? 10 : 0 }}>{f}</p>)}
        <p style={{ ...K.small, marginTop: 12 }}>Hold, search, system time and after-call work are where handle time can come out while the conversation stays whole. Talk time is where the customer's issue gets resolved, so protect it while you work on the rest. The Staffing Calculator shows what a new handle time means for headcount.</p>
      </section>

      <Assumptions items={assumptions} />

      <Paper>
          <ReportActions
            toolId={TOOL_ID}
            toolName="AHT Decomposition Analysis"
            subtitle={`${fmt(R.total)} handle time across ${AHT_COMPONENTS.length} components`}
            routePath={ROUTE}
            state={d}
            defaults={DEFAULTS}
            summary={[
              { label: "Handle time", value: fmt(R.total) },
              { label: "Conversation share", value: pc(R.talkShare) },
              { label: "Outside the conversation", value: fmt(R.nonTalk) },
              { label: "With selected levers", value: fmt(R.combinedNew) },
            ]}
            sections={[
              { title: "AHT Components", type: "table", rows: AHT_COMPONENTS.map((c) => [COMPONENT[c].name, `${fmt(v.values[c])} (${pc(R.shares[c])})`]).concat([["Handle time", fmt(R.total)]]) },
              { title: "Summary Metrics", type: "metrics", items: [
                { label: "Handle Time", value: fmt(R.total), color: ELECTRIC },
                { label: "Conversation", value: pc(R.talkShare), color: ELECTRIC, sub: fmt(v.values.talk) },
                { label: "Outside the Conversation", value: fmt(R.nonTalk), color: ELECTRIC, sub: pc(R.nonTalkShare) },
                { label: "With Selected Levers", value: fmt(R.combinedNew), color: ELECTRIC, sub: selected.length + " selected" },
              ]},
              ...(guards.length ? [{ title: "Inputs Corrected", type: "findings", items: guards.map(guardLine) }] : []),
              { title: "Key Findings", type: "findings", items: findings },
              { title: "Levers", type: "table", rows: R.levers.map((L) => [L.name + (L.on ? " (selected)" : " (not selected)"), `${leverLine(L)}: ${fmt(L.saved)} a contact, handle time ${fmt(L.newAHT)}${v.contacts > 0 ? `, ${hrs(L.hours)} agent hours a year` : ""}`]) },
              { title: "Planning Assumptions", type: "findings", items: assumptions },
              { title: "Method", type: "text", content: "Average handle time (AHT) is the sum of its six components. Each lever removes its share of the components it targets; selected levers combine multiplicatively on a shared component. Agent hours are seconds saved times contacts a month times 12, over 3,600. Published at contactcentercx.com" + METHOD + "." },
            ]}
          />
      </Paper>
    </ToolFrame>
  );
}
