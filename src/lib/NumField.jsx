// src/lib/NumField.jsx
// The Center of CX - single shared numeric input for the whole suite.
//
// Why this exists: the same NumField was copy-pasted into every tool and every copy
// carried the same two defects. It shipped a zero-injection on clear (typing one digit
// then losing the field) and an accelerating stepper whose stop relied on the button's
// own mouseup, which a heavy re-render can drop, so a single click ran to the min or max.
// This is the one corrected implementation. Fix an input bug here, it is fixed everywhere.
//
// Props are a superset of every tool's usage, all optional:
//   label, value, onChange (required-ish), hint, prefix, suffix, step, min, max,
//   factor (display multiplier), pulled (badge), compact, info/infoTitle/infoAlign (InfoDot).

import { useState, useEffect, useRef } from "react";
import InfoDot from "./InfoDot";
import { COLORS } from "./benchmarks";

const NAVY = COLORS.navy, ELECTRIC = COLORS.electric, MUTED = COLORS.muted;
const BORDER = "#D8E3ED", ICE = "#E8F4FD";
const n = (v) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };

export default function NumField({ label, value, onChange, hint, prefix, suffix, step = 1, min, max, factor = 1, pulled, compact, info, infoTitle, infoAlign }) {
  const fac = factor || 1;
  const toDisp = (v) => Math.round(n(v) * fac * 1000) / 1000;
  const [local, setLocal] = useState(String(toDisp(value)));
  const focusedRef = useRef(false), holdRef = useRef(null), valRef = useRef(n(value)), pressingRef = useRef(false), stopRef = useRef(null);
  valRef.current = n(value);

  // Sync the display from the prop only when the field is not being edited, so external
  // pulls update it but the user's own typing is never interrupted mid-keystroke.
  useEffect(() => { if (!focusedRef.current) setLocal(String(toDisp(value))); /* eslint-disable-next-line */ }, [value]);

  const clampN = (x) => { if (min != null && x < min) x = min; if (max != null && x > max) x = max; return Math.round(x * 1000) / 1000; };

  // Typing never fights the user and never injects a 0 on empty or partial input.
  const onType = (e) => {
    const raw = e.target.value;
    setLocal(raw);
    if (raw.trim() === "" || raw === "-" || raw === "." || raw === "-.") return;
    const parsed = parseFloat(raw);
    if (!isNaN(parsed)) onChange(parsed / fac);
  };
  const onBlurField = () => {
    focusedRef.current = false;
    const parsed = parseFloat(local);
    const clean = isNaN(parsed) ? n(value) : clampN(parsed);
    onChange(clean / fac);
    setLocal(String(clean));
  };

  // Stepper stop does NOT rely on the button's own mouseup. It arms window-level release
  // listeners and a pressing guard, so release always terminates the loop, re-render or not.
  if (!stopRef.current) stopRef.current = () => {
    pressingRef.current = false;
    if (holdRef.current) { clearTimeout(holdRef.current); holdRef.current = null; }
    window.removeEventListener("mouseup", stopRef.current);
    window.removeEventListener("touchend", stopRef.current);
    window.removeEventListener("pointerup", stopRef.current);
    window.removeEventListener("pointercancel", stopRef.current);
  };
  const stop = stopRef.current;
  useEffect(() => stop, []); // clear any running hold on unmount

  const stepValue = (dir) => { const next = clampN(n(valRef.current) * fac + dir * step); valRef.current = next / fac; setLocal(String(next)); onChange(next / fac); };
  const start = (dir) => {
    if (pressingRef.current) return;
    pressingRef.current = true;
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchend", stop);
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    stepValue(dir); // one guaranteed step per press
    let delay = 320;
    const tick = () => { if (!pressingRef.current) { holdRef.current = null; return; } stepValue(dir); delay = Math.max(60, delay - 25); holdRef.current = setTimeout(tick, delay); };
    holdRef.current = setTimeout(tick, delay); // acceleration begins only after the hold delay
  };

  const btn = { width: 20, height: 14, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", color: MUTED, cursor: "pointer", padding: 0, fontSize: 7, userSelect: "none", touchAction: "none" };
  return (
    <div>
      <label style={{ fontSize: compact ? 11 : 12, fontWeight: 600, color: NAVY, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        {label}{info && <InfoDot text={info} title={infoTitle || label} align={infoAlign} />}{pulled && <span style={{ fontSize: 9, fontWeight: 700, color: ELECTRIC, background: ICE, padding: "1px 5px", borderRadius: 4 }}>PULLED</span>}
      </label>
      <div style={{ position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: MUTED, pointerEvents: "none" }}>{prefix}</span>}
        <input type="text" inputMode="decimal" value={local}
          onFocus={e => { focusedRef.current = true; e.target.style.borderColor = ELECTRIC; }}
          onChange={onType}
          onBlur={e => { e.target.style.borderColor = BORDER; onBlurField(); }}
          style={{ width: "100%", padding: compact ? "8px 10px" : "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, paddingLeft: prefix ? 24 : (compact ? 10 : 12), paddingRight: 40, outline: "none" }} />
        {suffix && <span style={{ position: "absolute", right: 28, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: MUTED, pointerEvents: "none" }}>{suffix}</span>}
        <div style={{ position: "absolute", right: 3, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 1 }}>
          <button type="button" style={btn} onPointerDown={e => { e.preventDefault(); start(1); }}>▲</button>
          <button type="button" style={btn} onPointerDown={e => { e.preventDefault(); start(-1); }}>▼</button>
        </div>
      </div>
      {hint && <span style={{ fontSize: 10.5, color: MUTED, marginTop: 2, display: "block" }}>{hint}</span>}
    </div>
  );
}
