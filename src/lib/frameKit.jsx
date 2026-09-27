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

/** The dark number input style, for a tool that keeps its own input handler. */
export const numInput = { display: "block", width: "100%", minWidth: 0, boxSizing: "border-box", minHeight: TOUCH, marginTop: 6, padding: "0 12px", fontFamily: FONT, fontSize: 16, fontWeight: 600, border: `1px solid ${firm}`, borderRadius: RADIUS.field, background: HOUSE.navy, color: HOUSE.mist, fontVariantNumeric: "tabular-nums" };

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

/* ------------------------------------------------------------ assessments */

/** One statement answered on a 1 to 5 scale. The chosen answer is filled and bold. */
export function Scale({ label, value, onPick }) {
  return (
    <div role="radiogroup" aria-label={label} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((v) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} onClick={() => onPick(v)}
          style={{ width: TOUCH, height: TOUCH, borderRadius: RADIUS.field, fontFamily: FONT, fontSize: 16, fontWeight: value === v ? 700 : 500, cursor: "pointer", border: `1px solid ${value === v ? HOUSE.electric : firm}`, background: value === v ? alpha(HOUSE.electric, LINE.firm) : "transparent", color: HOUSE.mist }}>{v}</button>
      ))}
      <span style={{ ...K.small, marginLeft: 6 }}>1 = Disagree · 5 = Agree</span>
    </div>
  );
}

/** The question step of an assessment: dimension tabs, the current dimension's statements, and the way on.
 *  `dims` is [{ id, name, qs: [{ q }] }]; `done(id)` says whether a dimension is fully answered. */
export function StatementStep({ dims, current, setCurrent, scores, setScore, done, complete, onResults, prompt }) {
  const dim = dims[current];
  const answered = dims.filter((d) => done(d.id)).length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div role="tablist" aria-label="Dimensions" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {dims.map((d, i) => (
          <button key={d.id} type="button" role="tab" aria-selected={i === current} onClick={() => setCurrent(i)}
            style={{ minHeight: TOUCH, padding: "0 12px", fontFamily: FONT, fontSize: 14, fontWeight: i === current ? 700 : 500, borderRadius: RADIUS.field, cursor: "pointer", border: `1px solid ${i === current ? HOUSE.electric : firm}`, background: i === current ? alpha(HOUSE.electric, LINE.firm) : "transparent", color: HOUSE.mist }}>
            {done(d.id) ? "✓ " : ""}{d.name}
          </button>
        ))}
      </div>
      <Group legend={`Dimension ${current + 1} of ${dims.length} · ${dim.name}`} note={prompt}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {dim.qs.map((q, qi) => {
            const val = scores[`${dim.id}-${qi}`] || 0;
            return (
              <div key={qi} style={{ ...K.box, border: `1px solid ${val ? firm : hair}` }}>
                <p style={{ ...K.body, color: HOUSE.mist, fontWeight: 500, margin: "0 0 12px" }}>{q.q}</p>
                <Scale label={q.q} value={val} onPick={(v) => setScore(dim.id, qi, v)} />
              </div>
            );
          })}
        </div>
      </Group>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <button type="button" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}
          style={{ minHeight: TOUCH, padding: "0 18px", fontFamily: FONT, fontSize: 15, fontWeight: 600, borderRadius: RADIUS.field, border: `1px solid ${firm}`, background: "transparent", color: HOUSE.mist, cursor: current === 0 ? "default" : "pointer", opacity: current === 0 ? 0.5 : 1 }}>Previous</button>
        {current < dims.length - 1 ? (
          <button type="button" onClick={() => setCurrent(current + 1)}
            style={{ minHeight: TOUCH, padding: "0 18px", fontFamily: FONT, fontSize: 15, fontWeight: 600, borderRadius: RADIUS.field, border: "none", background: HOUSE.action, color: HOUSE.paper, cursor: "pointer" }}>Next: {dims[current + 1].name}</button>
        ) : (
          <button type="button" onClick={onResults} disabled={!complete}
            style={{ minHeight: TOUCH, padding: "0 18px", fontFamily: FONT, fontSize: 15, fontWeight: 600, borderRadius: RADIUS.field, border: "none", background: HOUSE.action, color: HOUSE.paper, cursor: complete ? "pointer" : "default", opacity: complete ? 1 : 0.5 }}>
            {complete ? "View my results" : `${answered}/${dims.length} dimensions complete`}
          </button>
        )}
      </div>
    </div>
  );
}

/** Each dimension's score on the rubric's scale, with its band as a word. One hue; the length carries the score. */
export function DimensionBars({ rows, max = 5 }) {
  return (
    <section aria-label="Dimension scores" style={K.panel}>
      <h2 style={K.h2}>Dimension scores</h2>
      {rows.map((d) => (
        <div key={d.id} style={{ padding: "10px 0", borderTop: `1px solid ${hair}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
            <span style={{ ...K.strong, fontSize: 15 }}>{d.name}</span>
            <span style={{ ...K.small, color: HOUSE.body }}>{d.band} · <strong style={{ ...K.strong, ...K.num }}>{d.score.toFixed(1)}</strong></span>
          </div>
          <div role="img" aria-label={`${d.name} ${d.score.toFixed(1)} of ${max}`} style={{ height: 8, background: hair, borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${(d.score / max) * 100}%`, background: ARCS.evidence, borderRadius: 4 }} />
          </div>
        </div>
      ))}
    </section>
  );
}
