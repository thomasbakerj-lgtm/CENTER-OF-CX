import { useState, useEffect } from "react";
import { ToolNav, ToolHero } from "./src/lib/ToolShell";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";
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

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#5B6E88"; const BORDER = "#D8E3ED";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
const COMPONENT = {
  talk: { name: "Talk time", color: ELECTRIC, desc: "Conversation between the agent and the customer." },
  hold: { name: "Hold time", color: "#B45309", desc: "The customer waits while the agent looks something up, consults or waits on an approval." },
  wrap: { name: "After-call work", color: "#7C3AED", desc: "Notes, disposition, case updates and follow-up tasks after the contact ends." },
  transfer: { name: "Transfer and conference", color: "#B91C1C", desc: "Starting, waiting on and completing warm or cold transfers." },
  search: { name: "Knowledge search", color: "#0369A1", desc: "Searching the knowledge base or procedures, or asking a peer, during the contact." },
  admin: { name: "System and admin", color: "#4B5563", desc: "Moving between applications, copying data, system latency and compliance steps." },
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
    <div style={{ padding: "14px 16px", background: "#fff", borderRadius: 8, border: `1px solid ${BORDER}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{c.name}</span>
        <span style={{ fontSize: 20, color: NAVY }}>{value}s</span>
      </div>
      <input type="range" aria-label={`${c.name}, seconds`} min={0} max={300} value={Math.min(300, Math.max(0, Number(value) || 0))} onChange={(e) => onChange(Number(e.target.value))} style={{ width: "100%", accentColor: c.color, height: 6, cursor: "pointer" }} />
      <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{c.desc}</div>
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
    `Handle time is ${fmt(R.total)}. Conversation is ${pc(R.talkShare)} of it (${fmt(v.values.talk)}); the other ${fmt(R.nonTalk)} (${pc(R.nonTalkShare)}) is hold, after-call work, transfers, search and system time.`,
    `The largest part outside the conversation is ${COMPONENT[R.largestNonTalk].name.toLowerCase()} at ${fmt(v.values[R.largestNonTalk])}.`,
    ...R.levers.filter((L) => L.on && L.saved > 0).map((L) => `${L.name}, removing ${leverLine(L)}, models ${fmt(L.saved)} a contact (${pc(L.savedPct, 1)}).`),
    selected.length
      ? `With the ${selected.length} lever${selected.length > 1 ? "s" : ""} selected, the model takes handle time from ${fmt(R.total)} to ${fmt(R.combinedNew)}, ${pc(R.combinedSavedPct, 1)} lower, under the shares shown.`
      : `No lever is selected, so no reduction is modelled.`,
    v.contacts > 0 && selected.length
      ? `At ${v.contacts.toLocaleString("en-US")} contacts a month that is about ${hrs(R.combinedHours)} agent hours a year of capacity. Capacity becomes cash only through an action such as fewer hires or less overtime.`
      : `Enter contacts per month to see the agent hours a reduction frees.`,
  ];
  const assumptions = [
    "Every lever share opens at a planning heuristic with no published source. Replace it with a vendor's evidence or your own pilot before relying on it.",
    "A lever counts toward the combined figure only when it is selected. Two levers on the same component combine multiplicatively: each removes its share of what the other leaves.",
    "Agent hours are capacity. The Staffing Calculator turns handle time into agents at your service level.",
    `The ${PRESET_NAMES.map(([, n]) => n.toLowerCase()).join(", ")} profiles are illustrative starting points, never benchmarks.`,
  ];

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh" }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:${FONT};background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.pg{grid-template-columns:1fr!important}.crow{grid-template-columns:1fr 64px!important}.crow .wide{display:none}}`}</style>
      <ToolNav wrap={WRAP} />
      <ToolHero wrap={WRAP} eyebrow="Performance + Quality" title="AHT Decomposition"
        intro="Average handle time is several components added together. Set talk, hold, after-call work, transfer, search and system time to see where the seconds go. Then choose the initiatives you are weighing, set how much of each component they remove, and see the handle time and agent hours that follow.">
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", marginTop: 12 }}>Every formula and assumption is in the <a href={METHOD} style={{ color: "#fff", fontWeight: 600, textDecoration: "underline" }}>published method</a>.</p>
      </ToolHero>

      <section style={{ background: WARM, padding: "40px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: SLATE }}>Example profiles, illustrative only:</span>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {PRESET_NAMES.map(([k, l]) => (
                <button key={k} onClick={() => applyPreset(k)} style={{ minHeight: 44, padding: "6px 14px", fontSize: 13, fontWeight: 600, fontFamily: "inherit", borderRadius: 6, border: `1px solid ${d.contactType === k ? ELECTRIC : BORDER}`, background: d.contactType === k ? ELECTRIC : "#fff", color: d.contactType === k ? "#fff" : SLATE, cursor: "pointer" }}>{l}</button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }} className="pg">
            {AHT_COMPONENTS.map((c) => <Slider key={c} id={c} value={d.values[c]} onChange={(x) => setValue(c, x)} />)}
          </div>
          <div style={{ maxWidth: 320, marginTop: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: NAVY, display: "block", marginBottom: 4 }}>Contacts per month</label>
            <input aria-label="Contacts per month" type="number" value={d.contacts} onChange={(e) => setD((p) => ({ ...p, contacts: Number(e.target.value) }))} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY }} />
            <span style={{ fontSize: 12, color: MUTED, marginTop: 2, display: "block" }}>Optional. Turns seconds into agent hours a year.</span>
          </div>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "40px 28px" }}>
        <div style={WRAP}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 28 }} className="pg">
            <Tile dark label="Handle time" value={fmt(R.total)} note="Sum of the six components" />
            <Tile label="Conversation" value={pc(R.talkShare)} note={fmt(v.values.talk) + " of talk"} />
            <Tile label="Outside the conversation" value={fmt(R.nonTalk)} note={pc(R.nonTalkShare) + " of handle time"} />
            <Tile label="With selected levers" value={fmt(R.combinedNew)} note={selected.length ? pc(R.combinedSavedPct, 1) + " lower, " + selected.length + " selected" : "No lever selected"} />
          </div>

          <h2 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 8 }}>Where the seconds go</h2>
          <div style={{ display: "flex", height: 32, borderRadius: 6, overflow: "hidden", marginBottom: 20 }}>
            {AHT_COMPONENTS.map((c) => R.shares[c] > 0 && <div key={c} title={COMPONENT[c].name} style={{ width: pc(R.shares[c], 2), background: COMPONENT[c].color, borderRight: "1px solid #fff" }} />)}
          </div>
          <div style={{ display: "grid", gap: 6, marginBottom: 28 }}>
            {AHT_COMPONENTS.map((c) => (
              <div key={c} className="crow" style={{ display: "grid", gridTemplateColumns: "180px 64px 1fr", gap: 12, alignItems: "center", padding: "10px 14px", background: WARM, borderRadius: 6, borderLeft: `3px solid ${COMPONENT[c].color}` }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{COMPONENT[c].name} · {fmt(v.values[c])}</span>
                <span style={{ fontSize: 16, color: NAVY }}>{pc(R.shares[c])}</span>
                <span className="wide" style={{ fontSize: 12, color: SLATE }}>{COMPONENT[c].desc}</span>
              </div>
            ))}
          </div>

          <h2 style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 6 }}>Initiatives you are weighing</h2>
          <p style={{ fontSize: 13, color: SLATE, marginBottom: 12 }}>Each share opens at a planning heuristic. Set it to what a vendor can evidence or your own pilot measured, and select the levers you want in the combined figure.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }} className="pg">
            {R.levers.map((L) => (
              <div key={L.id} style={{ background: L.on ? "#fff" : WARM, border: `1px solid ${L.on ? ELECTRIC : BORDER}`, borderRadius: 10, padding: "14px 16px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 44, cursor: "pointer" }}>
                  <input type="checkbox" checked={L.on} onChange={(e) => setLever(L.id, "on", e.target.checked)} style={{ width: 20, height: 20 }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{L.name}</span>
                </label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "6px 0 8px" }}>
                  {L.targets.map((c) => (
                    <label key={c} style={{ fontSize: 12, color: SLATE, display: "flex", alignItems: "center", gap: 6 }}>
                      <input aria-label={`${L.name}: share of ${COMPONENT[c].name.toLowerCase()} removed`} type="number" value={d.levers[L.id][c]} onChange={(e) => setLever(L.id, c, Number(e.target.value))} style={{ width: 64, padding: "8px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6 }} />
                      % of {COMPONENT[c].name.toLowerCase()}
                    </label>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: NAVY, margin: "0 0 4px" }}>{fmt(L.saved)} a contact, handle time {fmt(L.newAHT)}{v.contacts > 0 ? `, about ${hrs(L.hours)} agent hours a year` : ""}</p>
                <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>What it takes: {LEVER_TAKES[L.id]}</p>
              </div>
            ))}
          </div>

          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "22px 26px", marginBottom: 24 }}>
            {findings.slice(-2).map((f, i) => <p key={i} style={{ fontSize: 14, color: "#fff", lineHeight: 1.6, margin: i ? "10px 0 0" : 0 }}>{f}</p>)}
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", lineHeight: 1.6, margin: "12px 0 0" }}>Hold, search, system time and after-call work are where handle time can come out while the conversation stays whole. Talk time is where resolution happens, so protect it while working on the rest.</p>
          </div>

          <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "16px 20px", marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Planning assumptions on this page</div>
            {assumptions.map((a, i) => <p key={i} style={{ fontSize: 12, color: SLATE, marginBottom: 4 }}>{a}</p>)}
          </div>

          {guards.length > 0 && (
            <div style={{ background: "#FFF7E6", border: "1px solid #F59E0B", borderRadius: 8, padding: "12px 16px", marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: NAVY, marginBottom: 4 }}>Inputs corrected. Every figure above was computed on the corrected values.</div>
              {guards.map((g, i) => <div key={i} style={{ fontSize: 12, color: SLATE }}>{guardLine(g)}</div>)}
            </div>
          )}

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
              { title: "Method", type: "text", content: "Handle time is the sum of its six components. Each lever removes its share of the components it targets; selected levers combine multiplicatively on a shared component. Agent hours are seconds saved times contacts a month times 12, over 3,600. Published at contactcentercx.com" + METHOD + "." },
              { title: "Next Steps", type: "next", items: [
                { tool: "Staffing Calculator", href: "/tools/staffing-calculator", reason: "Turn the new handle time into agents at your service level" },
                { tool: "Cost per Contact Calculator", href: "/tools/cost-per-contact", reason: "See what handle time does to cost per contact" },
              ]},
            ]}
          />
        </div>
      </section>
    </div>
  );
}
