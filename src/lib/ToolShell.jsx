import { TYPE } from "./type";

/* ToolShell: the one page frame every tool opens with.
 *
 * The site header comes from the shell (src/lib/Shell.jsx), rendered once by App. ToolHero states what
 * the tool is, in the same place and the same shape on every tool: a category label,
 * the tool name as the page's one h1, a short paragraph on what it computes and from
 * what, and optional actions (a start button, a link to the published method).
 *
 * `compact` is for the working screens of a multi-step tool (answering, results):
 * the label and the name stay, so a reader always knows where they are, and the
 * intro paragraph gives way to the work. `fill` makes a start screen's header take
 * the viewport, so nothing sits empty below it. */

const DEEP = "#061325";
const NAVY = "#0B1D3A";
const LIGHT = "#00AAFF";
const ON_DARK = "rgba(255,255,255,0.78)";
const DEFAULT_WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };

export function ToolHero({ eyebrow, title, intro, compact = false, fill = false, wrap = DEFAULT_WRAP, children }) {
  return (
    <header style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: compact ? "22px 0 20px" : fill ? "72px 0 64px" : "48px 0 34px", minHeight: fill ? "calc(100vh - 64px)" : undefined }}>
      <div style={wrap}>
        {eyebrow && <span style={{ ...TYPE.eyebrow, color: LIGHT, display: "block", marginBottom: compact ? 6 : 12 }}>{eyebrow}</span>}
        <h1 style={{ ...(compact ? TYPE.h1 : TYPE.display), color: "#fff", margin: 0 }}>{title}</h1>
        {!compact && intro && <p style={{ ...TYPE.body, fontSize: 15, color: ON_DARK, maxWidth: 720, margin: "12px 0 0" }}>{intro}</p>}
        {!compact && children && <div style={{ marginTop: 24 }}>{children}</div>}
      </div>
    </header>
  );
}

/* The start action for a multi-step tool, with an optional link to its published method. */
export function ToolStart({ label, onStart, methodHref, methodLabel }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
      <button onClick={onStart} style={{ padding: "14px 26px", borderRadius: 8, border: "none", background: "#0088DD", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>{label}</button>
      {methodHref && <a href={methodHref} style={{ fontSize: 14, color: ON_DARK, textDecoration: "underline", textUnderlineOffset: 3 }}>{methodLabel}</a>}
    </div>
  );
}
