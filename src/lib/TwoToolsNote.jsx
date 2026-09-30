// src/lib/TwoToolsNote.jsx
//
// "Why another tool gives a different figure": two tools on this site answer one question with different models
// (enterprise audit, 30 September 2026; TB: side by side and why). The page passes rows computed by crossTool.js from the
// reader's own inputs, one of them the page's own figure, and the reasons they differ. Display only: it reads no tool
// state and nothing here reaches a tool's arithmetic, flags or grade. Tokens only.
import { HOUSE, RADIUS, alpha, LINE } from "./tokens.js";
import { K } from "./frameKit.jsx";

const hair = alpha(HOUSE.mist, LINE.hair);
const chip = { display: "inline-block", fontSize: 12, fontWeight: 600, lineHeight: "18px", padding: "1px 8px", borderRadius: RADIUS.field, border: `1px solid ${alpha(HOUSE.mist, LINE.firm)}`, color: HOUSE.mist };
const CSS = `.cx-two summary{cursor:pointer;list-style:none;min-height:44px;display:flex;align-items:center;gap:10px}
.cx-two summary::-webkit-details-marker{display:none}
.cx-two summary::before{content:"+";display:inline-block;width:16px;font-weight:700;color:${HOUSE.mist}}
.cx-two details[open] summary::before{content:"\\2212"}
.cx-two p,.cx-two span{overflow-wrap:anywhere}`;

export function TwoToolsNote({ title, intro, rows, reasons, links = [] }) {
  if (!rows || !rows.length) return null;
  return (
    <section className="cx-two" aria-label={title} style={{ ...K.panel }}>
      <style>{CSS}</style>
      <details>
        <summary><span style={{ ...K.h2, margin: 0, fontSize: 18 }}>{title}</span></summary>
        {intro && <p style={{ ...K.body, marginTop: 8 }}>{intro}</p>}
        <ul style={{ listStyle: "none", margin: "8px 0 0", padding: 0 }}>
          {rows.map((r, i) => (
            <li key={i} style={{ display: "grid", gridTemplateColumns: "fit-content(40%) minmax(0, 1fr)", gap: "4px 16px", padding: "12px 0", borderTop: `1px solid ${hair}` }}>
              <span style={{ fontSize: 18, fontWeight: 700, lineHeight: "26px", color: HOUSE.mist, fontVariantNumeric: "tabular-nums" }}>{r.value}</span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "baseline" }}>
                  <span style={{ fontSize: 15, fontWeight: 600, lineHeight: "22px", color: HOUSE.mist }}>{r.tool}</span>
                  {r.own && <span style={chip}>This page</span>}
                </span>
                <span style={{ ...K.body, display: "block", fontSize: 14, lineHeight: "22px", marginTop: 2 }}>{r.label}</span>
              </span>
            </li>
          ))}
        </ul>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: HOUSE.mist, margin: "12px 0 6px" }}>Why they differ</h3>
        <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
          {reasons.map((t, i) => <li key={i} style={{ ...K.body, fontSize: 14, lineHeight: "22px" }}>{t}</li>)}
        </ul>
        {links.length > 0 && (
          <p style={{ ...K.small, marginTop: 10 }}>
            {links.map(([label, href], i) => <span key={href}>{i ? " · " : ""}<a href={href} style={{ color: HOUSE.sky2, fontWeight: 600 }}>{label}</a></span>)}
          </p>
        )}
      </details>
    </section>
  );
}
