// src/lib/ui.jsx
//
// The shared components of Brand Guide 1.0, section 12 (redesign Phase 3). Every colour,
// size and radius comes from tokens.js; tokens.test.mjs refuses a colour literal in this
// file and components.test.mjs renders each component and checks its accessible name,
// its contrast and its rules. Pages and the Phase 4 shells are built from these.

import React, { useRef, useEffect, useState } from "react";
import { HOUSE, PILLARS, LAYERS, ARCS, FINDINGS, TYPE_SCALE, RADIUS, MOTION, TOUCH, alpha, LINE, onFill } from "./tokens.js";
import { Icon } from "./Icon.jsx";

const T = TYPE_SCALE;
const hair = alpha(HOUSE.mist, LINE.hair), soft = alpha(HOUSE.mist, LINE.soft), firm = alpha(HOUSE.mist, LINE.firm);
const ease = `${MOTION.press} ${MOTION.curve}`;
const labelStyle = { fontSize: T.label.size, fontWeight: T.label.weight, letterSpacing: T.label.tracking, textTransform: "uppercase", color: HOUSE.muted };

/* ------------------------------------------------------------------ Button */

/** One primary per screen. kind: primary (action blue, white text), secondary (outline),
 *  text (a link that looks like one), pillar (the pillar fill with its readable text,
 *  only on that pillar's pages). Renders an <a> when href is given. */
export function Button({ kind = "primary", pillar, href, onClick, children, icon, type = "button", disabled, style, ...rest }) {
  const base = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: TOUCH, padding: "0 18px",
    borderRadius: RADIUS.field, fontSize: 16, fontWeight: 600, fontFamily: "inherit", cursor: disabled ? "not-allowed" : "pointer",
    textDecoration: "none", transition: `background ${ease}, border-color ${ease}`, opacity: disabled ? 0.5 : 1, boxSizing: "border-box" };
  const fill = pillar && PILLARS[pillar] ? PILLARS[pillar].fill : null;
  const look = {
    primary: { background: HOUSE.action, color: HOUSE.paper, border: "none" },
    secondary: { background: "transparent", color: HOUSE.mist, border: `1px solid ${firm}` },
    text: { background: "transparent", color: HOUSE.sky2, border: "none", padding: "0 4px" },
    pillar: { background: fill || HOUSE.action, color: fill ? onFill(fill) : HOUSE.paper, border: "none" },
  }[kind] || {};
  const body = <>{icon && <Icon name={icon} size={18} />}{children}</>;
  const s = { ...base, ...look, ...style };
  return href
    ? <a href={href} onClick={onClick} style={s} aria-disabled={disabled || undefined} {...rest}>{body}</a>
    : <button type={type} onClick={onClick} disabled={disabled} style={s} {...rest}>{body}</button>;
}

/* ---------------------------------------------------------- Input with source */

/** Every field starts filled and says where its value came from.
 *  source.kind: "yours" (solid line), "default" (dashed line and the source named),
 *  "pulled" (PULLED tag and the tool it came from), "corrected" (says what was entered). */
export function SourceInput({ id, label, value, onChange, source = { kind: "yours" }, suffix, prefix, inputMode = "decimal", hint }) {
  const k = source.kind;
  const border = k === "default" ? `1.5px dashed ${firm}` : `1.5px solid ${k === "yours" ? HOUSE.sky2 : firm}`;
  const note = k === "default" ? `Our default: ${source.text || "a planning assumption"}`
    : k === "pulled" ? `From ${source.text || "another tool"}`
    : k === "corrected" ? `You entered ${source.entered}; corrected to ${value}. ${source.text || ""}`.trim()
    : "Yours";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label htmlFor={id} style={{ fontSize: 15, fontWeight: 600, color: HOUSE.mist }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 52, padding: "0 14px", borderRadius: RADIUS.field, border, background: HOUSE.navy }}>
        {prefix && <span aria-hidden="true" style={{ color: HOUSE.muted }}>{prefix}</span>}
        <input id={id} value={value} onChange={(e) => onChange && onChange(e.target.value)} inputMode={inputMode}
          aria-describedby={`${id}-src`}
          style={{ flex: 1, minWidth: 0, background: "none", border: "none", outline: "none", color: HOUSE.mist, fontSize: 19, fontWeight: 600, fontFamily: "inherit", fontVariantNumeric: "tabular-nums" }} />
        {suffix && <span aria-hidden="true" style={{ color: HOUSE.muted }}>{suffix}</span>}
      </div>
      <span id={`${id}-src`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: HOUSE.muted }}>
        {k === "pulled" && <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", padding: "1px 6px", borderRadius: RADIUS.chip, border: `1px solid ${HOUSE.sky2}`, color: HOUSE.sky2 }}>PULLED</span>}
        {note}{hint ? `. ${hint}` : ""}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ Stepper */

/** Hold to speed up: the pause between repeats shrinks from 400 ms towards 60 ms, and
 *  after 20 repeats each step counts ten. Pure, so the harness can pin the curve. */
export function holdCurve(n) {
  return { delay: Math.max(60, Math.round(400 * Math.pow(0.85, n))), multiplier: n >= 20 ? 10 : 1 };
}

/** A 48 pixel minus and plus beside a value. Keyboard safe: each is a real button, and
 *  a key press steps once. */
export function Stepper({ label, value, step = 1, min = -Infinity, max = Infinity, onChange, format = (v) => String(v) }) {
  const timer = useRef(null), count = useRef(0), cur = useRef(value);
  cur.current = value;
  const clamp = (v) => Math.min(max, Math.max(min, v));
  const stop = () => { clearTimeout(timer.current); timer.current = null; count.current = 0; };
  useEffect(() => stop, []);
  const bump = (dir) => { const { multiplier } = holdCurve(count.current); onChange && onChange(clamp(cur.current + dir * step * multiplier)); };
  const hold = (dir) => { bump(dir); const tick = () => { count.current++; bump(dir); timer.current = setTimeout(tick, holdCurve(count.current).delay); }; timer.current = setTimeout(tick, holdCurve(0).delay); };
  const btn = (dir, name) => (
    <button type="button" aria-label={`${dir < 0 ? "Less" : "More"} ${label}`}
      onPointerDown={(e) => { e.preventDefault(); hold(dir); }} onPointerUp={stop} onPointerLeave={stop}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); bump(dir); } }}
      style={{ width: 48, height: 48, borderRadius: RADIUS.field, border: "none", background: "transparent", color: HOUSE.body, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon name={name} size={20} />
    </button>
  );
  return (
    <div role="group" aria-label={label} style={{ display: "inline-flex", alignItems: "center", gap: 4, borderRadius: RADIUS.field, background: HOUSE.navy, border: `1px solid ${soft}` }}>
      {btn(-1, "less")}
      <output aria-live="polite" style={{ minWidth: 72, textAlign: "center", fontSize: 19, fontWeight: 600, color: HOUSE.mist, fontVariantNumeric: "tabular-nums" }}>{format(value)}</output>
      {btn(1, "add")}
    </div>
  );
}

/* ----------------------------------------------------------- Evidence mark */

const FILL = { "Directional": 1 / 3, "Planning-grade": 2 / 3, "Finance-grade": 1 };
export const GRADES = Object.keys(FILL);

/** How sure: three 240 degree arcs, filled by grade, in fixed colours that name the
 *  question. A not applicable axis is a dotted ring. A void result shows no mark. */
export function EvidenceMark({ axes = {}, size = 88, isVoid = false }) {
  if (isVoid) return null;
  const ring = (r, grade, color, key) => {
    const c = 2 * Math.PI * r, arc = c * 240 / 360, f = FILL[grade];
    if (f === undefined) return <circle key={key} r={r} fill="none" stroke={HOUSE.muted} strokeWidth="2" strokeDasharray="2 5" />;
    return (
      <g key={key}>
        <circle r={r} fill="none" stroke={alpha(HOUSE.mist, LINE.hair)} strokeWidth="7" strokeDasharray={`${arc.toFixed(2)} ${c.toFixed(2)}`} strokeLinecap="round" />
        <circle r={r} fill="none" stroke={color} strokeWidth="7" strokeDasharray={`${(arc * f).toFixed(2)} ${c.toFixed(2)}`} strokeLinecap="round" style={{ transition: `stroke-dasharray ${MOTION.draw} ${MOTION.curve}` }} />
      </g>
    );
  };
  const text = ["evidence", "realization", "completeness"].map((a) => `${a} ${axes[a] || "not applicable"}`).join(", ");
  return (
    <svg width={size} height={size} viewBox="-64 -64 128 128" role="img" aria-label={`How sure: ${text}`}>
      <g transform="rotate(60)">
        {ring(56, axes.evidence, ARCS.evidence, "e")}
        {ring(42, axes.realization, ARCS.realization, "r")}
        {ring(28, axes.completeness, ARCS.completeness, "c")}
      </g>
    </svg>
  );
}

/* -------------------------------------------------------------- Grade badge */

/** Weight and fill only, never colour. Travels with the axis that holds it and the one
 *  input that would lift it. */
export function GradeBadge({ grade, heldBy, lift }) {
  if (!grade) return null;
  const weight = grade === "Finance-grade" ? 700 : grade === "Planning-grade" ? 600 : 500;
  const filled = grade === "Finance-grade";
  return (
    <span style={{ display: "inline-flex", flexDirection: "column", gap: 2 }}>
      <span style={{ alignSelf: "flex-start", fontSize: 15, fontWeight: weight, padding: "3px 10px", borderRadius: RADIUS.chip,
        background: filled ? HOUSE.mist : "transparent", color: filled ? HOUSE.ink : HOUSE.mist, border: `1.5px ${grade === "Directional" ? "dashed" : "solid"} ${HOUSE.mist}` }}>{grade}</span>
      {heldBy && <span style={{ fontSize: 13, color: HOUSE.muted }}>Held by {heldBy}</span>}
      {lift && <span style={{ fontSize: 13, color: HOUSE.body }}>To raise it: {lift}</span>}
    </span>
  );
}

/* ------------------------------------------------------------------- Result */

/** What Result shows for a tool's emitted grade object (src/lib/confidence.js): the three axes, the headline and the
 *  axis holding it down, or, on a void, the failed invariant and its remedy and no grade at all. */
export function resultHow(g) {
  if (!g) return { how: null, voidReason: null };
  if (g.void) return { how: null, voidReason: `${g.invariant} ${g.remedy}`.trim() };
  return { how: { axes: { evidence: g.evidence, realization: g.realization, completeness: g.completeness }, headline: g.headline, heldBy: g.boundBy || null }, voidReason: null };
}

/** The figure counts to its value; one line under it states the change; the evidence
 *  mark sits beside it, or below it in a narrow column. A void result shows no figure and says which input made it
 *  impossible. */
/* Decimal places a figure carries, so a count-up never shows float noise ("129.2584297154897" once overflowed the
   Staffing page mid-animation). */
const SR_ONLY = { position: "absolute", width: 1, height: 1, padding: 0, margin: -1, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 };
const placesOf = (v) => { if (typeof v !== "number" || !isFinite(v)) return 0; const t = String(v); return t.includes("e") ? 0 : (t.split(".")[1] || "").length; };

export function Result({ label, value, format = (v) => String(v), change, how, voidReason }) {
  const [shown, setShown] = useState(value);
  const dp = Math.min(placesOf(value), 6);
  const from = useRef(value);
  useEffect(() => {
    if (typeof value !== "number" || typeof from.current !== "number") { setShown(value); from.current = value; return; }
    const a = from.current, b = value, t0 = typeof performance !== "undefined" ? performance.now() : 0, dur = parseInt(MOTION.count, 10);
    if (typeof window === "undefined" || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) { setShown(b); from.current = b; return; }
    let raf;
    const step = (t) => { const k = Math.min(1, (t - t0) / dur), ez = 1 - Math.pow(1 - k, 3); setShown(k < 1 ? +(a + (b - a) * ez).toFixed(dp) : b); if (k < 1) raf = requestAnimationFrame(step); else from.current = b; };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  if (voidReason) {
    return (
      <section aria-label={label} style={{ padding: 24, borderRadius: RADIUS.card, border: `1.5px dashed ${HOUSE.mist}`, background: HOUSE.navy }}>
        <div style={labelStyle}>{label}</div>
        <div style={{ fontSize: T.h3.size, fontWeight: 600, color: HOUSE.mist, marginTop: 8 }}>No figure</div>
        <p style={{ margin: "6px 0 0", fontSize: 15, lineHeight: 1.5, color: HOUSE.body }}>{voidReason}</p>
      </section>
    );
  }
  return (
    <section aria-label={label} style={{ padding: 24, borderRadius: RADIUS.card, background: HOUSE.navy, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center", boxShadow: `0 24px 60px ${alpha(HOUSE.ink, 0.5)}` }}>
      <div style={{ flex: "1 1 220px", minWidth: 0 }}>
        <div style={labelStyle}>{label}</div>
        {/* The figure animates for sight; the live region announces only the settled value, once. */}
        <div aria-hidden="true" style={{ fontSize: 64, fontWeight: 700, letterSpacing: T.figure.tracking, lineHeight: 1, color: HOUSE.mist, fontVariantNumeric: "tabular-nums", marginTop: 8, overflowWrap: "anywhere" }}>{format(typeof value === "number" ? shown : value)}</div>
        <span aria-live="polite" style={SR_ONLY}>{format(value)}</span>
        {change && <div style={{ fontSize: 15, color: HOUSE.body, marginTop: 8 }}>{change}</div>}
      </div>
      {how && (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <EvidenceMark axes={how.axes} size={80} />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={labelStyle}>How sure</span>
            <GradeBadge grade={how.headline} heldBy={how.heldBy} />
          </div>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ Readout */

/** Your result, for assessments: one thin arc per part in its layer's colour, the score
 *  at the center, no score until every part is answered. parts: [{ name, layer, score }]
 *  with score 0 to 1 or null while unanswered. */
export function Readout({ parts = [], score, max = 100, size = 180 }) {
  const done = parts.length > 0 && parts.every((p) => typeof p.score === "number");
  const n = parts.length || 1, gap = 10, span = (360 - gap * n) / n;
  const r = 70, c = 2 * Math.PI * r;
  const color = (p) => (LAYERS.find((l) => l.id === p.layer) || { color: HOUSE.sky2 }).color;
  return (
    <figure style={{ margin: 0, display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} viewBox="-90 -90 180 180" role="img"
        aria-label={done ? `Your result: ${score} of ${max}. ${parts.map((p) => `${p.name} ${Math.round(p.score * 100)} percent`).join(", ")}` : `Your result appears when all ${parts.length} parts are answered`}>
        {parts.map((p, i) => {
          const len = c * span / 360, rot = -90 + i * (span + gap);
          return (
            <g key={p.name} transform={`rotate(${rot})`}>
              <circle r={r} fill="none" stroke={alpha(HOUSE.mist, LINE.hair)} strokeWidth="6" strokeDasharray={`${len.toFixed(2)} ${c.toFixed(2)}`} strokeLinecap="round" />
              {typeof p.score === "number" && <circle r={r} fill="none" stroke={color(p)} strokeWidth="6" strokeDasharray={`${(len * p.score).toFixed(2)} ${c.toFixed(2)}`} strokeLinecap="round" />}
            </g>
          );
        })}
        <text x="0" y="12" textAnchor="middle" fill={HOUSE.mist} style={{ fontSize: 40, fontWeight: 700 }}>{done ? score : ""}</text>
      </svg>
      <figcaption style={labelStyle}>Your result</figcaption>
    </figure>
  );
}

/* -------------------------------------------------------------------- Stack */

/** The seven layers, top first. The chosen layer lifts and glows; the others part. */
export function Stack({ active = null, onSelect, width = 300 }) {
  const plate = width * 0.55;
  return (
    <div role="group" aria-label="The seven layer stack" style={{ position: "relative", width, height: width * 0.82 }}>
      {LAYERS.map((l, i) => {
        const idx = LAYERS.findIndex((x) => x.id === active);
        const on = l.id === active;
        let top = 8 + i * (width * 0.085);
        if (idx >= 0) { if (i < idx) top -= 10; if (i > idx) top += 10; }
        return (
          <button key={l.id} type="button" aria-label={`L${l.n} ${l.name}`} aria-pressed={on} onClick={() => onSelect && onSelect(on ? null : l.id)}
            style={{ position: "absolute", left: (width - plate) / 2, top, width: plate, height: plate, padding: 0, borderRadius: RADIUS.card, cursor: "pointer",
              transform: "rotateX(60deg) rotateZ(45deg)", transition: `top ${MOTION.count} ${MOTION.curve}, background ${MOTION.count} ${MOTION.curve}`,
              background: alpha(l.color, on ? 0.42 : 0.16), border: `${on ? 2 : 1}px solid ${on ? l.color : alpha(l.color, 0.55)}`,
              boxShadow: on ? `0 0 60px ${alpha(l.color, 0.55)}` : "none", opacity: idx >= 0 && !on ? 0.7 : 1 }} />
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------ Claim marker */

/** How a figure on a content page is known. kind: published (solid outline and the source
 *  link), assumption (dashed, "Test yours"), example (a filled tag), none (no public
 *  benchmark, and a link to measure yours). */
export function ClaimMarker({ kind, source, href, testHref }) {
  const chip = { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: RADIUS.chip, color: HOUSE.mist, textDecoration: "none" };
  if (kind === "published") return <a href={href} style={{ ...chip, border: `1px solid ${firm}` }}>{source || "Source"}<Icon name="external" size={12} /></a>;
  if (kind === "assumption") return <a href={testHref} style={{ ...chip, border: `1px dashed ${firm}` }}>Planning assumption. Test yours</a>;
  if (kind === "example") return <span style={{ ...chip, background: soft }}>Worked example</span>;
  return <a href={testHref} style={{ ...chip, border: `1px dashed ${firm}`, color: HOUSE.body }}>No public benchmark. Measure yours</a>;
}

/* ------------------------------------------------------------------ Finding */

const FINDING = {
  critical: { word: "Critical", icon: "critical" },
  high: { word: "High", icon: "critical" },
  unknown: { word: "Unknown", icon: "unknown" },
  clear: { word: "Clear", icon: "clear" },
};

/** Always a word and an icon; colour only inside tools and reports. Critical and clear
 *  are fills with ink text; high is an outline; unknown is dashed and never red. */
export function Finding({ level, title, children }) {
  const f = FINDING[level] || FINDING.unknown, c = FINDINGS[level] || FINDINGS.unknown;
  const tag = c.form === "fill"
    ? { background: c.dark, color: HOUSE.ink, border: "none", boxShadow: `0 0 18px ${alpha(c.dark, 0.35)}` }
    : c.form === "outline" ? { background: "transparent", color: c.dark, border: `1.5px solid ${c.dark}` }
    : { background: "transparent", color: HOUSE.mist, border: `1.5px dashed ${HOUSE.mist}` };
  return (
    <div role="note" aria-label={`${f.word}: ${title}`} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, padding: 16, borderRadius: RADIUS.card, background: HOUSE.navy }}>
      <span style={{ alignSelf: "flex-start", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, padding: "4px 10px", borderRadius: RADIUS.chip, ...tag }}>
        <Icon name={f.icon} size={16} />{f.word}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: HOUSE.mist }}>{title}</span>
        {children && <span style={{ fontSize: 15, lineHeight: 1.55, color: HOUSE.body }}>{children}</span>}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Next step */

/** One next test, carrying the reader's numbers, always paired with the exit. */
export function NextStep({ tool, reason, minutes, href, stopHref, carries = true }) {
  return (
    <section aria-label="Next step" style={{ display: "flex", flexDirection: "column", gap: 12, padding: 20, borderRadius: RADIUS.card, border: `1.5px solid ${HOUSE.electric}`, background: HOUSE.navy }}>
      <span style={labelStyle}>Next test{minutes ? `, about ${minutes} minutes` : ""}</span>
      <a href={href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: TOUCH, color: HOUSE.mist, textDecoration: "none" }}>
        <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: T.h3.size, fontWeight: 600 }}>{tool}</span>
          <span style={{ fontSize: 15, color: HOUSE.body }}>{reason}{carries ? " Your figures carry over." : ""}</span>
        </span>
        <Icon name="next" size={24} />
      </a>
      <a href={stopHref || "#report"} style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: TOUCH, fontSize: 15, color: HOUSE.sky2, textDecoration: "none" }}>
        <Icon name="exit" size={18} />Stop here and keep the report
      </a>
    </section>
  );
}

/* ------------------------------------------------------------------- Byline */

/** A contributor: initials or photo, name, role, organisation, since; the perspective
 *  tag; any vendor tie disclosed. */
export function Byline({ name, role, org, since, tie, photo }) {
  const initials = String(name || "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
      {photo
        ? <img src={photo} alt="" width="48" height="48" style={{ borderRadius: "50%", objectFit: "cover" }} />
        : <span aria-hidden="true" style={{ width: 48, height: 48, borderRadius: "50%", background: HOUSE.surface, color: HOUSE.mist, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{initials}</span>}
      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: HOUSE.mist }}>{name}</span>
        <span style={{ fontSize: 13, color: HOUSE.body }}>{[role, org].filter(Boolean).join(", ")}{since ? `. Contributor since ${since}` : ""}</span>
        <span style={{ fontSize: 12, color: HOUSE.muted }}><span style={{ fontWeight: 700, letterSpacing: "0.08em" }}>CONTRIBUTOR PERSPECTIVE</span>. {tie ? `Vendor tie: ${tie}` : "No vendor tie declared"}</span>
      </span>
    </div>
  );
}

/* --------------------------------------------------------------------- Door */

/** A pillar entry on the homepage. Selected takes the pillar fill; a soon pillar is
 *  hatched and says so. */
export function Door({ pillar, number, line, meta, selected, onSelect }) {
  const p = PILLARS[pillar] || PILLARS.diagnostics;
  const ink = selected ? onFill(p.fill) : HOUSE.mist;
  return (
    <button type="button" role="radio" aria-checked={!!selected} onClick={onSelect}
      style={{ minHeight: 200, padding: 20, borderRadius: RADIUS.card, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10, textAlign: "left", fontFamily: "inherit",
        background: selected ? p.fill : alpha(HOUSE.navy, 0.7), border: `1px solid ${selected ? p.fill : alpha(p.fill, 0.35)}`, transition: `background ${ease}, transform ${ease}`,
        backgroundImage: !selected && p.soon ? `repeating-linear-gradient(135deg, ${alpha(p.fill, 0.07)} 0 2px, transparent 2px 10px)` : "none" }}>
      <span style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: selected ? ink : p.onDark }}>{number}</span>
        {p.soon && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", padding: "2px 6px", borderRadius: RADIUS.chip, color: selected ? ink : p.onDark, border: `1px solid ${selected ? ink : p.onDark}`, whiteSpace: "nowrap" }}>Coming soon</span>}
      </span>
      <span style={{ fontSize: 20, fontWeight: 700, color: ink }}>{p.name}</span>
      <span style={{ fontSize: 14, lineHeight: 1.5, color: selected ? ink : HOUSE.body, flexGrow: 1 }}>{line}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: selected ? ink : HOUSE.muted }}>{meta}</span>
    </button>
  );
}

/* --------------------------------------------------------------- Route card */

/** Up to three steps and a possible ending, with one start button. `children` sits under the title (an industry's
 *  sourced figure); `onStart` fires as the start button is followed. */
export function RouteCard({ kicker, time, title, steps = [], ending, cta, href, pillar = "diagnostics", onStart, children }) {
  const p = PILLARS[pillar] || PILLARS.diagnostics;
  const shown = steps.slice(0, 3);
  return (
    <section aria-label={`Your route: ${title}`} style={{ padding: 24, borderRadius: RADIUS.card, background: HOUSE.ink, border: `1px solid ${soft}`, display: "flex", flexDirection: "column", gap: 16, boxShadow: `0 24px 60px ${alpha(HOUSE.ink, 0.6)}` }}>
      <span style={{ display: "flex", justifyContent: "space-between" }}><span style={{ ...labelStyle, color: p.onDark }}>{kicker}</span><span style={{ fontSize: 12, color: HOUSE.muted }}>{time}</span></span>
      <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.25, color: HOUSE.mist }}>{title}</span>
      {children}
      <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
        {shown.map((s, i) => (
          <li key={s.name} style={{ display: "grid", gridTemplateColumns: "28px 1fr", gap: 12 }}>
            <span aria-hidden="true" style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${i === 0 ? p.onDark : firm}`, boxSizing: "border-box", fontSize: 12, fontWeight: 700, color: HOUSE.mist, display: "flex", alignItems: "center", justifyContent: "center" }}>{i + 1}</span>
            <span style={{ display: "flex", flexDirection: "column", gap: 2 }}><span style={{ fontSize: 15, fontWeight: 600, color: HOUSE.mist }}>{s.name}</span>{s.why && <span style={{ fontSize: 13, color: HOUSE.muted }}>{s.why}</span>}</span>
          </li>
        ))}
      </ol>
      {ending && <span style={{ fontSize: 13, lineHeight: 1.5, color: HOUSE.body, paddingTop: 12, borderTop: `1px solid ${hair}` }}><strong style={{ color: HOUSE.mist, marginRight: 5 }}>Possible endings.</strong>{ending}</span>}
      <Button kind="pillar" pillar={pillar} href={href} onClick={onStart} style={{ minHeight: 50 }}>{cta}</Button>
    </section>
  );
}

/* ------------------------------------------------------------------- States */

/** Loading keeps the final shape; a failure offers one way on; empty suggests where to go;
 *  a shared scenario says whose numbers they are. */
export function Loading({ label = "Loading", height = 160 }) {
  return <div role="status" aria-label={label} style={{ height, borderRadius: RADIUS.card, background: HOUSE.navy, border: `1px solid ${hair}` }} />;
}

export function Failure({ message, action, href }) {
  return (
    <div role="alert" style={{ padding: 20, borderRadius: RADIUS.card, border: `1.5px dashed ${HOUSE.mist}`, background: HOUSE.navy, display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{ fontSize: 16, fontWeight: 600, color: HOUSE.mist }}>{message}</span>
      <Button kind="secondary" href={href}>{action}</Button>
    </div>
  );
}

export function Empty({ message, suggestions = [] }) {
  return (
    <div role="status" style={{ padding: 20, borderRadius: RADIUS.card, background: HOUSE.navy, display: "flex", flexDirection: "column", gap: 10 }}>
      <span style={{ fontSize: 16, color: HOUSE.mist }}>{message}</span>
      <span style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{suggestions.map((s) => <Button key={s.label} kind="secondary" href={s.href}>{s.label}</Button>)}</span>
    </div>
  );
}

export function SharedScenario({ from }) {
  return (
    <div role="note" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: RADIUS.field, border: `1px dashed ${firm}`, color: HOUSE.body, fontSize: 14 }}>
      <Icon name="link" size={16} />These are {from ? `${from}'s` : "the sender's"} numbers from a shared link. Values from a link count as entered by the sender; no attestation carries over.
    </div>
  );
}
