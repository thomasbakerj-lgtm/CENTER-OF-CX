// src/lib/CiteLine.jsx
//
// The "How to cite" line under a method or a researched profile. Text only, selectable; tokens only.

import { HOUSE, RADIUS, alpha, LINE } from "./tokens.js";

export function CiteLine({ text }) {
  if (!text) return null;
  return (
    <section aria-label="How to cite" style={{ border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, borderRadius: RADIUS.card, padding: "14px 18px", background: HOUSE.navy }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: HOUSE.mist, marginBottom: 6 }}>How to cite</div>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: HOUSE.body, overflowWrap: "anywhere", userSelect: "all" }}>{text}</p>
    </section>
  );
}
