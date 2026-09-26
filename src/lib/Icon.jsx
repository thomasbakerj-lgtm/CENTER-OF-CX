// src/lib/Icon.jsx
//
// The 32 icons of Brand Guide 1.0, section 10. Drawn like the mark: 24 pixel grid,
// 2 pixel stroke, round caps and joins, no fills, one colour that follows the text.
// Inline SVG built here: no icon font, no outside host, no emoji. Every icon sits
// beside a word except close, menu and search; give those three a label.

import React from "react";

const C = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

export const ICONS = {
  diagnostics: "M3 12h4l3-7 4 14 3-7h4",
  vendors: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
  industries: "M3 20V9l6 4V9l6 4V5h6v15z M3 20h18",
  research: "M9 3h6 M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3 M7.5 15h9",
  "market-watch": `${C(12, 12, 2)} M7.8 7.8a6 6 0 0 0 0 8.4 M16.2 7.8a6 6 0 0 1 0 8.4 M5 5a10 10 0 0 0 0 14 M19 5a10 10 0 0 1 0 14`,
  evidence: "M17.5 5.5A9 9 0 1 0 17.5 18.5 M15 8.5a5 5 0 1 0 0 7",
  layers: "M12 3l9 4.5-9 4.5-9-4.5z M3 12l9 4.5 9-4.5 M3 16.5l9 4.5 9-4.5",
  method: "M6 3h9l4 4v14H6z M15 3v4h4 M9 12h7 M9 16h7",
  search: `${C(11, 11, 7)} M16 16l5 5`,
  next: "M5 12h14 M13 6l6 6-6 6",
  download: "M12 4v11 M7 10l5 5 5-5 M5 20h14",
  print: "M7 9V3h10v6 M7 17H4v-7h16v7h-3 M7 14h10v7H7z",
  link: "M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1 M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1",
  share: `${C(18, 5, 2)} ${C(6, 12, 2)} ${C(18, 19, 2)} M8 11l8-5 M8 13l8 5`,
  external: "M14 4h6v6 M20 4l-9 9 M18 14v6H4V6h6",
  pulled: "M3 12h11 M10 8l4 4-4 4 M14 4h6v16h-6",
  info: `${C(12, 12, 9)} M12 11v6 M12 7.5v.5`,
  unknown: `${C(12, 12, 9)} M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6 M12 17.5v.5`,
  critical: "M12 3l10 18H2z M12 10v5 M12 18v.5",
  clear: `${C(12, 12, 9)} M8 12.5l3 3 5-6`,
  exit: "M10 4H5v16h5 M15 8l4 4-4 4 M19 12H9",
  contributor: "M4 20l4-1 11-11-3-3L5 16z M14 7l3 3",
  person: `${C(12, 8, 4)} M4 21a8 8 0 0 1 16 0`,
  lock: "M5 11h14v10H5z M8 11V7a4 4 0 0 1 8 0v4",
  calendar: "M4 5h16v16H4z M4 10h16 M8 3v4 M16 3v4",
  time: `${C(12, 12, 9)} M12 7v5l3 2`,
  filter: "M4 5h16l-6 8v6l-4 2v-8z",
  add: "M12 5v14 M5 12h14",
  less: "M5 12h14",
  close: "M6 6l12 12 M18 6L6 18",
  menu: "M4 7h16 M4 12h16 M4 17h16",
  check: "M5 12.5l4.5 4.5L19 7",
};

/** `<Icon name="download" />` beside a word; `<Icon name="close" label="Close" />` alone. */
export function Icon({ name, size = 20, label, style }) {
  const d = ICONS[name];
  if (!d) throw new Error("unknown icon: " + name);
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": "true", focusable: "false" };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...a11y}
      style={{ flexShrink: 0, verticalAlign: "middle", ...style }}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default Icon;
