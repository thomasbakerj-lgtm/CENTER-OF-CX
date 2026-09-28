// src/lib/HowOthersReport.jsx
//
// "How others report it": the published figures a reader can hold their own result against, from comparisons.js and the
// BLS state wages. Display only: it reads no tool state and nothing here reaches a tool's arithmetic, flags or grade.
// Each group is a disclosure (closed except the first) so a tool page stays short; each row names what kind of figure it
// is, who published it, when, and links the page it was read on. Tokens only.
import { useState, useId } from "react";
import { HOUSE, RADIUS, alpha, LINE } from "./tokens.js";
import { K, selectStyle, optionCss } from "./frameKit.jsx";
import { groupsFor, rowSource, KIND_LABEL, TOOL_GROUPS, SOURCES } from "./comparisons.js";
import { STATE_WAGES, STATE_WAGE_SOURCE, NATIONAL_WAGE } from "./comparisons/stateWages.js";

const hair = alpha(HOUSE.mist, LINE.hair);
const chip = { display: "inline-block", fontSize: 12, fontWeight: 600, lineHeight: "18px", padding: "1px 8px", borderRadius: RADIUS.field, border: `1px solid ${alpha(HOUSE.mist, LINE.firm)}`, color: HOUSE.mist, whiteSpace: "nowrap" };
const usd = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
const CSS = `.cx-hor summary{cursor:pointer;list-style:none;min-height:44px;display:flex;align-items:center;flex-wrap:wrap;gap:10px}
.cx-hor summary::-webkit-details-marker{display:none}
.cx-hor summary::before{content:"+";display:inline-block;width:16px;font-weight:700;color:${HOUSE.mist}}
.cx-hor details[open] summary::before{content:"\\2212"}
.cx-hor p,.cx-hor span{overflow-wrap:anywhere}
${optionCss("cx-hor-select")}`;

function SourceLine({ s }) {
  return (
    <span style={{ ...K.small, display: "block", marginTop: 4 }}>
      <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ color: HOUSE.sky2, fontWeight: 600 }}>{s.publisher}</a>
      {s.host ? `, read on ${s.host}` : ""}, {s.published}. {s.title}{/[.?!]$/.test(s.title) ? "" : "."}
    </span>
  );
}

function Row({ row, group, shared }) {
  const s = rowSource(row, group);
  const kind = row.kind && row.kind !== group.kind ? row.kind : null;
  return (
    <li style={{ display: "grid", gridTemplateColumns: "minmax(88px, auto) 1fr", gap: "4px 16px", padding: "12px 0", borderTop: `1px solid ${hair}` }}>
      <span style={{ fontSize: 18, fontWeight: 700, lineHeight: "26px", color: HOUSE.mist, fontVariantNumeric: "tabular-nums" }}>{row.value}</span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "baseline" }}>
          <span style={{ fontSize: 15, fontWeight: 600, lineHeight: "22px", color: HOUSE.mist }}>{row.label}</span>
          {kind && <span style={chip}>{KIND_LABEL[kind]}</span>}
        </span>
        {row.detail && <span style={{ ...K.body, display: "block", fontSize: 14, lineHeight: "22px", marginTop: 2 }}>{row.detail}.</span>}
        {!shared && <SourceLine s={s} />}
      </span>
    </li>
  );
}

function WagePicker() {
  const id = useId();
  const [st, setSt] = useState("");
  const row = STATE_WAGES.find((r) => r[0] === st);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <label htmlFor={id} style={{ fontSize: 14, fontWeight: 600, color: HOUSE.mist }}>Where are your agents?</label>
      <select id={id} className="cx-hor-select" value={st} onChange={(e) => setSt(e.target.value)} style={{ ...selectStyle, maxWidth: 360 }}>
        <option value="">United States</option>
        {STATE_WAGES.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
      </select>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        <li style={{ display: "grid", gridTemplateColumns: "minmax(88px, auto) 1fr", gap: "4px 16px", padding: "12px 0", borderTop: `1px solid ${hair}` }}>
          <span style={{ fontSize: 18, fontWeight: 700, lineHeight: "26px", color: HOUSE.mist, fontVariantNumeric: "tabular-nums" }}>{usd(row ? row[2] : NATIONAL_WAGE.hourly)}</span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "baseline" }}>
              <span style={{ fontSize: 15, fontWeight: 600, lineHeight: "22px", color: HOUSE.mist }}>Median hourly wage, customer service representatives, {row ? row[1] : "United States"}</span>
            </span>
            <span style={{ ...K.body, display: "block", fontSize: 14, lineHeight: "22px", marginTop: 2 }}>{usd(row ? row[3] : NATIONAL_WAGE.annual)} a year, before benefits. Half earn more, half less.</span>
            <SourceLine s={{ ...STATE_WAGE_SOURCE, published: STATE_WAGE_SOURCE.period, url: STATE_WAGE_SOURCE.url(row ? row[0] : "") }} />
          </span>
        </li>
      </ul>
    </div>
  );
}

/** The panel for one tool. Renders nothing for a tool with no published comparison. */
export function HowOthersReport({ toolId }) {
  const conf = TOOL_GROUPS[toolId];
  if (!conf) return null;
  const groups = groupsFor(toolId);
  const blocks = groups.map((g) => {
    /* The group's main source is named once under its note; a row names its own only when it cites another page. */
    const main = g.src ? SOURCES[g.src] : rowSource(g.rows[0], g);
    const shared = g.rows.filter((r) => rowSource(r, g).url === main.url).length > 1 ? main : null;
    return { key: g.id, kind: g.kind, title: g.title, note: g.note, shared,
      body: <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>{g.rows.map((r, i) => <Row key={i} row={r} group={g} shared={!!shared && rowSource(r, g).url === main.url} />)}</ul> };
  });
  if (conf.wage) blocks.push({ key: "wage", kind: "official", title: "Agent pay where your agents work", note: "The US Bureau of Labor Statistics median for customer service representatives, May 2025. The tool opens at the national median; if you know your own pay, enter it in the tool.", body: <WagePicker /> });
  return (
    <section className="cx-hor" aria-label="How others report it" style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 4 }}>
      <style>{CSS}</style>
      <h2 style={{ ...K.h2, margin: 0 }}>How others report it</h2>
      <p style={{ ...K.body, marginBottom: 8 }}>Published figures to hold your result against. Each measures something slightly different, so read what it counts before you compare. None of them changes your result or its grade.</p>
      {blocks.map((b, i) => (
        <details key={b.key} open={i === 0} style={{ borderTop: `1px solid ${hair}` }}>
          <summary><span style={{ fontSize: 16, fontWeight: 600, color: HOUSE.mist }}>{b.title}</span><span style={chip}>{KIND_LABEL[b.kind]}</span></summary>
          <div style={{ padding: "0 0 12px 26px" }}>
            <p style={{ ...K.small, marginBottom: 4 }}>{b.note}</p>
            {b.shared && <SourceLine s={b.shared} />}
            {b.body}
          </div>
        </details>
      ))}
    </section>
  );
}
