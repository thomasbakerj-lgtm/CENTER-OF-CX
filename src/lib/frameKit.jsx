// src/lib/frameKit.jsx
//
// The small parts a tool page on ToolFrame is built from (redesign Phase 6): the dark text styles, a panel, a question
// group, a number field, a figure tile, a choice group, the corrections notice and the assumptions list. Tokens only, no
// colour literal and no arithmetic, so a tool that moves onto the frame changes how it looks and nothing it computes.
// The rail tools that moved first carry their own copies of these styles; new moves read them from here.

import { HOUSE, PILLARS, ARCS, RADIUS, TOUCH, alpha, LINE } from "./tokens.js";
import { FONT } from "./type.js";
import { Finding } from "./ui.jsx";
import { guardLine } from "./guards.js";

const hair = alpha(HOUSE.mist, LINE.hair), soft = alpha(HOUSE.mist, LINE.soft), firm = alpha(HOUSE.mist, LINE.firm);

export const K = {
  hair, soft, firm,
  kicker: { fontSize: 12, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: HOUSE.muted },
  h2: { fontSize: 18, fontWeight: 600, lineHeight: "26px", color: HOUSE.mist, margin: "0 0 10px" },
  body: { fontSize: 15, lineHeight: "24px", color: HOUSE.body, margin: 0 },
  small: { fontSize: 13, lineHeight: "20px", color: HOUSE.muted, margin: 0 },
  strong: { color: HOUSE.mist, fontWeight: 600 },
  link: { color: PILLARS.diagnostics.onDark, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 },
  panel: { background: HOUSE.navy, border: `1px solid ${hair}`, borderRadius: RADIUS.card, padding: 20 },
  lead: { background: HOUSE.navy, border: `1px solid ${hair}`, borderLeft: `3px solid ${PILLARS.diagnostics.fill}`, borderRadius: RADIUS.card, padding: 20 },
  box: { border: `1px solid ${hair}`, borderRadius: RADIUS.field, padding: "12px 14px" },
  stat: { fontSize: 26, fontWeight: 700, lineHeight: "32px", color: HOUSE.mist, fontVariantNumeric: "tabular-nums", margin: "4px 0 2px" },
  num: { fontVariantNumeric: "tabular-nums" },
  grid: (min) => ({ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))`, gap: 12 }),
  /* Shades of one hue for a part-of-whole bar: colour separates the parts, the legend names them. */
  shade: (i) => alpha(ARCS.evidence, [LINE.firm * 3, LINE.firm * 2, LINE.firm, LINE.soft * 2, LINE.soft, LINE.hair * 2][i % 6]),
  row: { display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderTop: `1px solid ${hair}` },
};

/** The dark select style, with the option rule the page's style tag adds for its class. */
export const selectStyle = { width: "100%", minHeight: TOUCH, padding: "0 12px", fontFamily: FONT, fontSize: 15, fontWeight: 600, border: `1px solid ${firm}`, borderRadius: RADIUS.field, background: HOUSE.navy, color: HOUSE.mist, cursor: "pointer" };
export const optionCss = (cls) => `.${cls} option{background:${HOUSE.navy};color:${HOUSE.mist}}`;

/** A question group: a fieldset whose legend says which question this is. */
export function Group({ legend, note, children }) {
  return (
    <fieldset style={{ ...K.panel, margin: 0, minWidth: 0 }}>
      <legend style={{ ...K.kicker, padding: "0 6px" }}>{legend}</legend>
      {note && <p style={{ ...K.small, margin: "0 0 14px" }}>{note}</p>}
      {children}
    </fieldset>
  );
}

/** A number field. onChange receives Number(value), the same contract the tools' own inputs had. */
export function Field({ label, value, onChange, suffix, hint }) {
  return (
    <label style={{ display: "block", minWidth: 0 }}>
      <span style={{ fontSize: 14, fontWeight: 600, color: HOUSE.mist, display: "block", marginBottom: 6 }}>{label}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input aria-label={label} type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
          style={{ width: "100%", minWidth: 0, boxSizing: "border-box", minHeight: TOUCH, padding: "0 12px", fontFamily: FONT, fontSize: 16, fontWeight: 600, border: `1px solid ${firm}`, borderRadius: RADIUS.field, background: HOUSE.navy, color: HOUSE.mist, fontVariantNumeric: "tabular-nums" }} />
        {suffix && <span style={{ ...K.small, flexShrink: 0 }}>{suffix}</span>}
      </span>
      {hint && <span style={{ ...K.small, display: "block", marginTop: 4 }}>{hint}</span>}
    </label>
  );
}

/** A figure with its label and a note. The value is text: the tool formats it. */
export function Tile({ label, value, note }) {
  return (
    <div style={K.panel}>
      <div style={K.kicker}>{label}</div>
      <div style={K.stat}>{value}</div>
      {note && <p style={K.small}>{note}</p>}
    </div>
  );
}

/** A segmented choice: the chosen option is filled and bold, the rest outlined. Weight and fill carry the state. */
export function Choice({ label, options, value, onPick }) {
  return (
    <div role="group" aria-label={label} style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map(([k, l]) => (
        <button key={k} type="button" aria-pressed={value === k} onClick={() => onPick(k)}
          style={{ minHeight: TOUCH, padding: "0 14px", fontFamily: FONT, fontSize: 14, fontWeight: value === k ? 700 : 500, borderRadius: RADIUS.field, cursor: "pointer", border: `1px solid ${value === k ? HOUSE.electric : firm}`, background: value === k ? alpha(HOUSE.electric, LINE.firm) : "transparent", color: HOUSE.mist }}>{l}</button>
      ))}
    </div>
  );
}

/** Inputs the guard corrected, each in the shared sentence, before any reading of the figures. */
export function Corrections({ guards }) {
  if (!guards || !guards.length) return null;
  return (
    <Finding level="high" title="Inputs corrected. Every figure on this page was computed on the corrected values.">
      {guards.map((g, i) => <span key={i} style={{ display: "block", marginTop: i ? 4 : 0 }}>{guardLine(g)}</span>)}
    </Finding>
  );
}

/** The planning assumptions a page runs on, stated in the page. */
export function Assumptions({ items, children }) {
  return (
    <section aria-label="Planning assumptions" style={K.panel}>
      <h2 style={K.h2}>Planning assumptions on this page</h2>
      {items.map((a, i) => <p key={i} style={{ ...K.small, marginTop: i ? 6 : 0 }}>{a}</p>)}
      {children}
    </section>
  );
}

/** The report panel is paper (Brand Guide section 13). */
export function Paper({ children }) {
  return <div style={{ background: HOUSE.paper, color: HOUSE.paperInk, borderRadius: RADIUS.card, padding: "8px 20px 20px" }}>{children}</div>;
}

/** ToolFrame's method prop from a methodStamp. */
export const frameMethod = (stamp) => (stamp ? { version: stamp.version, date: stamp.text.replace(/^Method [^,]+, published /, ""), href: stamp.href } : null);
