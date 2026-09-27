import { useState, useRef } from "react";
import { HOUSE, RADIUS, alpha, LINE, onFill } from "./tokens.js";
import { FONT } from "./type";

/**
 * InfoDot: a small "i" affardon next to a field label that reveals a short
 * definition on tap (works on touch) and on hover (desktop bonus).
 *
 * Usage:  <InfoDot title="Loaded overhead" text="Two short sentences..." />
 *
 * Discipline: two sentences max: what it is, and why the tool uses it.
 * Only attach to conceptually loaded fields, never to obvious ones.
 *
 * Tokens only (Phase 11): the tools are dark, so the dot is body text on the house and the note is a navy panel. The
 * visible dot stays 16px beside a label; the button around it is 32px, with negative margins so the label does not move.
 */
const MUTED = HOUSE.body, ELECTRIC = HOUSE.electric, BORDER = alpha(HOUSE.mist, LINE.soft);

export default function InfoDot({ text, title, align = "center" }) {
  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const timer = useRef(null);
  const open = pinned || hovered;
  const enter = () => { if (timer.current) clearTimeout(timer.current); setHovered(true); };
  const leave = () => { timer.current = setTimeout(() => setHovered(false), 140); };

  const popLeft = align === "left" ? 0 : align === "right" ? "auto" : "50%";
  const popRight = align === "right" ? 0 : "auto";
  const popTransform = align === "center" ? "translateX(-50%)" : "none";

  return (
    <span style={{ position: "relative", display: "inline-flex", verticalAlign: "middle" }} onMouseEnter={enter} onMouseLeave={leave}>
      <button type="button" className="infodot" aria-label={title ? `What is ${title}?` : "More information"}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPinned(p => !p); }}
        style={{ width: 32, height: 32, margin: -8, background: "transparent", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0, flexShrink: 0 }}>
        <span aria-hidden="true" style={{ width: 16, height: 16, borderRadius: "50%", border: `1px solid ${open ? ELECTRIC : MUTED}`, background: open ? ELECTRIC : "transparent", color: open ? onFill(ELECTRIC) : MUTED, fontSize: 11, fontWeight: 700, fontFamily: FONT, display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>i</span>
      </button>
      {pinned && <span onClick={(e) => { e.stopPropagation(); setPinned(false); }} style={{ position: "fixed", inset: 0, zIndex: 40, background: "transparent" }} />}
      {open && (
        <span onMouseEnter={enter} onMouseLeave={leave}
          style={{ position: "absolute", top: "calc(100% + 6px)", left: popLeft, right: popRight, transform: popTransform, zIndex: 50, width: "min(252px, 76vw)", background: HOUSE.navy, border: `1px solid ${BORDER}`, borderRadius: RADIUS.field, boxShadow: `0 10px 30px ${alpha(HOUSE.ink, 0.5)}`, padding: "10px 12px", textAlign: "left", cursor: "default", whiteSpace: "normal" }}>
          {title && <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: HOUSE.mist, marginBottom: 3 }}>{title}</span>}
          <span style={{ display: "block", fontSize: 13, fontWeight: 400, color: HOUSE.body, lineHeight: 1.5 }}>{text}</span>
        </span>
      )}
    </span>
  );
}
