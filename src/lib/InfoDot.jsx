import { useState, useRef } from "react";
import { COLORS } from "./benchmarks";

/**
 * InfoDot — a small "i" affardon next to a field label that reveals a short
 * definition on tap (works on touch) and on hover (desktop bonus).
 *
 * Usage:  <InfoDot title="Loaded overhead" text="Two short sentences..." />
 *
 * Discipline: two sentences max — what it is, and why the tool uses it.
 * Only attach to conceptually loaded fields, never to obvious ones.
 */
const NAVY = COLORS.navy, SLATE = "#3A4F6A", MUTED = COLORS.muted, BORDER = "#D8E3ED", ELECTRIC = COLORS.electric;

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
      <button type="button" aria-label={title ? `What is ${title}?` : "More information"}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPinned(p => !p); }}
        style={{ width: 14, height: 14, borderRadius: "50%", border: `1px solid ${open ? ELECTRIC : MUTED}`, background: open ? ELECTRIC : "transparent", color: open ? "#fff" : MUTED, fontSize: 9.5, fontWeight: 700, fontStyle: "italic", fontFamily: "Georgia, 'Times New Roman', serif", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 0, lineHeight: 1, flexShrink: 0 }}>
        i
      </button>
      {pinned && <span onClick={(e) => { e.stopPropagation(); setPinned(false); }} style={{ position: "fixed", inset: 0, zIndex: 40, background: "transparent" }} />}
      {open && (
        <span onMouseEnter={enter} onMouseLeave={leave}
          style={{ position: "absolute", top: "calc(100% + 6px)", left: popLeft, right: popRight, transform: popTransform, zIndex: 50, width: "min(252px, 76vw)", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, boxShadow: "0 10px 30px rgba(11,29,58,0.18)", padding: "10px 12px", textAlign: "left", cursor: "default", whiteSpace: "normal" }}>
          {title && <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 3 }}>{title}</span>}
          <span style={{ display: "block", fontSize: 11.5, fontWeight: 400, color: SLATE, lineHeight: 1.5 }}>{text}</span>
        </span>
      )}
    </span>
  );
}
