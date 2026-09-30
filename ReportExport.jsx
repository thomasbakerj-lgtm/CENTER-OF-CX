import { useState, useRef } from "react";
import { trackTool, toolIdFromPath } from "./src/lib/track";
import { HOUSE, PILLARS, ARCS_PRINT, FINDINGS, FONT_FILES } from "./src/lib/tokens";
import { EVERYDAY, markSvg as markSvg_ } from "./src/lib/mark.js";
import { briefFor, READ_NO_GRADE } from "./src/lib/readerBriefs.js";

/* The paper palette (Brand Guide 1.0, sections 6 and 7): ink on white, the Diagnostics
   on-light blue for labels, the action blue for links, the print finding red only beside
   its word. Colour never marks a figure: a tool's metric colour is not printed. */
const INK = HOUSE.paperInk;
const PANEL = HOUSE.paper2;
const LABEL = PILLARS.diagnostics.onLight;
const LINK = HOUSE.action;
const SLATE = "#3A4F6A";
const QUIET = "#5B6B80";
const RULE = "#E4E9EF";
const HIGH = FINDINGS.high.print;
const NAVY = HOUSE.navy;
const ELECTRIC = HOUSE.electric;
const MUTED = QUIET;
const BORDER = "#D8E3ED";

/**
 * ReportExport: the light paper report every tool downloads (redesign Phase 3).
 *
 * Tools do not render this directly; ReportActions passes the sections, the method stamp
 * and `how` (the headline grade, the axis that holds it and the three axes) for the
 * evidence mark on the cover. Section types: table, metrics, findings, actions, next, text.
 * Next-step items support an optional `href`, resolved against the live origin so it works
 * in the preview window and stays clickable in the saved PDF.
 *
 * The reader chooses who the report is written for before download. The choice changes
 * the order of the sections and one reading line on the cover; it never changes a figure.
 */

/* Who a report is written for, and what they read first. Order lists section types; any
   type not listed keeps its place after the listed ones, in the tool's own order. */
export const AUDIENCES = [
  { id: "finance", label: "Finance", short: "finance", title: "Finance review", read: "Start with the result and how sure it is, then check every input and its source.", order: ["metrics", "confidence", "table", "findings", "actions", "text", "next"] },
  { id: "operations", label: "Operations", short: "operations", title: "Operations", read: "Start with the findings and actions, then the inputs you can change.", order: ["metrics", "findings", "actions", "table", "confidence", "text", "next"] },
  { id: "it", label: "IT and platform", short: "IT and platform", title: "IT and platform", read: "Start with the inputs and the method, then the findings.", order: ["table", "text", "metrics", "findings", "actions", "confidence", "next"] },
  { id: "executive", label: "Executive sponsor", short: "executive", title: "Executive sponsor", read: "The result, how sure it is and the next step come first. The detail follows for whoever checks it.", order: ["metrics", "confidence", "next", "findings", "actions", "table", "text"] },
  { id: "advisor", label: "Advisor or consultant", short: "advisor", title: "Advisor review", read: "Every section in the order the tool produced it, with the method link for your own check.", order: [] },
];

/* Sections in the chosen reader's order. The confidence section is the one ReportActions
   builds (title "Confidence"); it sorts as its own kind. Stable: ties keep the tool's order.
   A tool with a reader brief (src/lib/readerBriefs.js) puts that reader's sections first, in the brief's order, then
   the rest by type. The executive sponsor gets a short front section (the brief's sections, the confidence section and
   the next step) and everything else as an appendix. Every section still prints exactly once. */
export function planSections(sections, audience, toolId) {
  const a = AUDIENCES.find((x) => x.id === audience) || AUDIENCES[AUDIENCES.length - 1];
  const brief = briefFor(toolId, a.id);
  const kind = (s) => (s && s.title === "Confidence" ? "confidence" : s && s.type);
  const leadRank = (s) => { if (!brief || !s || typeof s.title !== "string") return -1; return brief.lead.findIndex((re) => re.test(s.title)); };
  const rank = (s) => { const i = a.order.indexOf(kind(s)); return i < 0 ? a.order.length : i; };
  const indexed = sections.map((s, i) => [s, i]);
  const led = indexed.filter(([s]) => leadRank(s) >= 0).sort((x, y) => leadRank(x[0]) - leadRank(y[0]) || x[1] - y[1]);
  const rest = indexed.filter(([s]) => leadRank(s) < 0).sort((x, y) => rank(x[0]) - rank(y[0]) || x[1] - y[1]);
  if (a.id === "executive" && brief) {
    /* A front page with none of the brief's sections (a tool at an early step) takes the tool's first summary. */
    const summary = rest.find(([s]) => kind(s) === "metrics") || rest.find(([s]) => kind(s) !== "confidence" && kind(s) !== "next");
    const lead0 = led.length ? led : summary ? [summary] : [];
    const front = [...lead0, ...rest.filter(([s]) => (kind(s) === "confidence" || kind(s) === "next") && !lead0.includes(s))];
    const frontSet = new Set(front);
    const back = [...led, ...rest].filter((x) => !frontSet.has(x)).sort((x, y) => x[1] - y[1]);
    return { lead: front.map(([s]) => s), appendix: back.map(([s]) => s), brief };
  }
  return { lead: [...led, ...rest].map(([s]) => s), appendix: [], brief };
}
export function orderSections(sections, audience, toolId) {
  const p = planSections(sections, audience, toolId);
  return [...p.lead, ...p.appendix];
}

/* The report as one HTML document. Every string a tool, a user or a scenario link can
   set is escaped here, so section text always renders as text: a criterion name or a
   roadmap item carrying markup cannot run in the report window. Pure, so the harness
   can build it without a browser. */
const e = (v) => String(v === undefined || v === null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
export function reportHtml({ toolName, subtitle, reportName, company, logo, today, sections = [], origin = "", method = "", audience = "advisor", how = null, toolId = "" }) {
  // Resolve relative next-step links against the live origin so they work in the
  // popup preview (whose own URL is about:blank) and remain clickable in the PDF.
  const absUrl = (href) => !href ? null : (/^https?:\/\//i.test(href) ? href : origin + (href.startsWith("/") ? href : "/" + href));
  const reader = AUDIENCES.find((x) => x.id === audience) || AUDIENCES[AUDIENCES.length - 1];
  const plan = planSections(sections, reader.id, toolId);
  const fontFaces = FONT_FILES.filter((f) => f.family !== "IBM Plex Sans Condensed").map((f) => `@font-face{font-family:'${e(f.family)}';font-style:${e(f.style)};font-weight:${e(f.weight)};font-display:swap;src:url(${e(origin)}/fonts/${e(f.file)}) format('woff2')}`).join("");
  const fontSrc = origin ? `'self' ${e(origin)}` : "'self'";

  const renderSection = (s) => {
    if (s.type === "table") {
      return `<div class="section">
        <h3>${e(s.title)}</h3>
        <table>${s.rows.map(r => `<tr><td class="label">${e(r[0])}</td><td class="value">${e(r[1])}</td></tr>`).join("")}</table>
      </div>`;
    }
    if (s.type === "metrics") {
      // Wrap by count so the last row is never a lone card (9 items become 3x3), and size
      // each card to its own value so one long figure does not shrink the others.
      const nItems = s.items.length;
      const cols = nItems <= 4 ? nItems
        : nItems % 3 === 0 ? 3
        : nItems % 4 === 0 ? 4
        : nItems <= 6 ? 3 : 4;
      const sizeOf = (v) => { const len = String(v).length;
        return len <= 8 ? "sz-l" : len <= 12 ? "sz-m" : len <= 18 ? "sz-s" : "sz-xs"; };
      return `<div class="section">
        <h3>${e(s.title)}</h3>
        <div class="metrics cols-${cols}">${s.items.map(m => `
          <div class="metric">
            <div class="metric-value ${sizeOf(m.value)}">${e(m.value)}</div>
            <div class="metric-label">${e(m.label)}</div>
            ${m.sub ? `<div class="metric-sub">${e(m.sub)}</div>` : ""}
          </div>`).join("")}
        </div>
      </div>`;
    }
    if (s.type === "findings") {
      return `<div class="section">
        <h3>${e(s.title)}</h3>
        <ol class="findings">${s.items.map((f, fi) => `
          <li class="finding"><span class="finding-num">${fi + 1}</span><span>${e(f)}</span></li>`).join("")}
        </ol>
      </div>`;
    }
    if (s.type === "actions") {
      return `<div class="section">
        <h3>${e(s.title)}</h3>
        <div class="actions">${s.items.map(a => `
          <div class="action ${a.priority === "high" ? "high" : a.priority === "medium" ? "medium" : ""}">
            <div class="action-header">${a.priority === "high" ? '<span class="priority high">High priority</span>' : a.priority === "medium" ? '<span class="priority medium">Medium priority</span>' : ""}<strong>${e(a.action)}</strong></div>
            <p>${e(a.detail)}</p>
          </div>`).join("")}
        </div>
      </div>`;
    }
    if (s.type === "next") {
      return `<div class="section next-section">
        <h3>${e(s.title)}</h3>
        <div class="next-tools">${s.items.map(nx => {
          const url = absUrl(nx.href);
          const inner = `<strong>${e(nx.tool)}${url ? ' <span class="next-arrow">&rarr;</span>' : ""}</strong><span>${e(nx.reason)}</span>`;
          return url
            ? `<a class="next-tool next-link" href="${e(url)}" target="_blank" rel="noopener">${inner}</a>`
            : `<div class="next-tool">${inner}</div>`;
        }).join("")}
        </div>
      </div>`;
    }
    if (s.type === "text") {
      return `<div class="section"><h3>${e(s.title)}</h3><p class="text-block">${e(s.content)}</p></div>`;
    }
    return "";
  };

  const markSvg = markSvg_(EVERYDAY.paper, { size: 28, trim: true, attrs: 'class="mark" aria-hidden="true"' });
  const howBlock = !how ? "" : how.void
    ? `<div class="how void"><div class="how-label">How sure</div><div class="how-grade">No figure</div><div class="how-line">${e(how.reason || "The inputs made a figure impossible, so none is printed.")}</div></div>`
    : `<div class="how">${evidenceMark(how.axes || {})}<div class="how-text"><div class="how-label">How sure${how.label ? `, ${e(how.label)}` : ""}</div><div class="how-grade">${e(how.headline || "Not stated")}</div>${how.boundBy ? `<div class="how-line">Held by ${e(how.boundBy)}</div>` : ""}</div></div>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; font-src ${fontSrc}; img-src data:; base-uri 'none'; form-action 'none'">
<title>${e(toolName)}, Report</title>
<style>
${fontFaces}
* { margin: 0; padding: 0; box-sizing: border-box; }
@page { margin: 0.6in 0.7in; size: letter; }
body { font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-variant-numeric: tabular-nums; color: ${INK}; background: #fff; font-size: 10pt; line-height: 1.5; -webkit-print-color-adjust: exact; print-color-adjust: exact; }

.masthead { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid ${RULE}; margin-bottom: 20px; font-size: 8.5pt; color: ${QUIET}; }
.brand { display: flex; align-items: center; gap: 8px; font-weight: 600; color: ${INK}; font-size: 9.5pt; }
.cover { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; margin-bottom: 18px; }
.cover-left { flex: 1; min-width: 0; }
.cover h1 { font-size: 22pt; font-weight: 700; letter-spacing: -0.02em; line-height: 1.12; margin-bottom: 4px; }
.cover .subtitle { font-size: 11pt; color: ${SLATE}; margin-bottom: 10px; }
.cover .meta { font-size: 8.5pt; color: ${QUIET}; line-height: 1.6; }
.cover .meta strong { color: ${INK}; font-weight: 600; }
.company-logo { max-width: 150px; max-height: 56px; object-fit: contain; display: block; margin-bottom: 10px; }
.reader { display: flex; gap: 14px; align-items: baseline; padding: 10px 14px; background: ${PANEL}; border-radius: 8px; margin-bottom: 22px; }
.reader .who { font-size: 7.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.16em; color: ${LABEL}; white-space: nowrap; }
.reader .who strong { display: block; font-size: 10pt; letter-spacing: 0; text-transform: none; color: ${INK}; }
.reader p { font-size: 9pt; color: ${SLATE}; }

.how { display: flex; align-items: center; gap: 12px; min-width: 210px; }
.how.void { flex-direction: column; align-items: flex-start; gap: 2px; padding: 10px 12px; border: 1.5px dashed ${INK}; border-radius: 8px; max-width: 240px; }
.how-label { font-size: 7.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.16em; color: ${QUIET}; }
.how-grade { font-size: 13pt; font-weight: 700; }
.how-line { font-size: 8.5pt; color: ${SLATE}; }
.arcs { flex-shrink: 0; }

.section { margin-bottom: 20px; page-break-inside: avoid; }
.section h3 { font-size: 8pt; font-weight: 600; color: ${LABEL}; text-transform: uppercase; letter-spacing: 0.16em; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px solid ${RULE}; }

table { width: 100%; border-collapse: collapse; }
td { padding: 6px 8px; border-bottom: 1px solid ${RULE}; font-size: 9.5pt; vertical-align: top; }
td.label { color: ${SLATE}; width: 48%; }
td.value { font-weight: 600; text-align: right; }

.metrics { display: grid; gap: 10px; }
.metrics.cols-1 { grid-template-columns: 1fr; }
.metrics.cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.metrics.cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.metrics.cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.metric { min-width: 0; background: ${PANEL}; border-radius: 10px; padding: 12px; overflow: hidden; }
.metric-value { font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; overflow-wrap: anywhere; }
.metric-value.sz-l { font-size: 22pt; }
.metric-value.sz-m { font-size: 17pt; }
.metric-value.sz-s { font-size: 13.5pt; }
.metric-value.sz-xs { font-size: 11.5pt; }
.metric-label { font-size: 8.5pt; color: ${SLATE}; margin-top: 4px; }
.metric-sub { font-size: 8pt; color: ${QUIET}; }

.findings { list-style: none; display: flex; flex-direction: column; gap: 6px; }
.finding { display: flex; align-items: flex-start; gap: 10px; font-size: 9.5pt; color: ${INK}; line-height: 1.45; padding: 2px 0; }
.finding-num { width: 20px; height: 20px; border-radius: 50%; border: 1.5px solid ${INK}; display: flex; align-items: center; justify-content: center; font-size: 8pt; font-weight: 600; flex-shrink: 0; }

.actions { display: flex; flex-direction: column; gap: 8px; }
.action { padding: 8px 12px; border-left: 3px solid ${RULE}; }
.action.high { border-left-color: ${HIGH}; }
.action.medium { border-left-color: ${QUIET}; }
.action-header { margin-bottom: 3px; font-size: 9.5pt; }
.action p { font-size: 9pt; color: ${SLATE}; line-height: 1.5; }
.priority { font-size: 7.5pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-right: 8px; }
.priority.high { color: ${HIGH}; }
.priority.medium { color: ${QUIET}; }

.next-section { margin-top: 14px; }
.appendix { page-break-before: always; margin: 8px 0 18px; }
.appendix h2 { font-size: 15pt; color: ${INK}; margin-bottom: 4px; }
.appendix p { font-size: 9pt; color: ${SLATE}; }
.next-tools { display: flex; flex-direction: column; gap: 6px; }
.next-tool { display: flex; flex-direction: column; gap: 2px; padding: 10px 12px; border: 1.5px solid ${LINK}; border-radius: 10px; font-size: 9pt; }
.next-tool strong { font-size: 10.5pt; }
.next-tool span { color: ${SLATE}; }
.next-link { text-decoration: none; color: ${INK}; }
.next-link strong, .next-arrow { color: ${LINK}; }

.text-block { font-size: 9.5pt; color: ${SLATE}; line-height: 1.6; }

.report-footer { margin-top: 26px; padding-top: 10px; border-top: 1px solid ${RULE}; font-size: 7.5pt; color: ${QUIET}; display: flex; flex-direction: column; gap: 3px; }
.report-footer .row { display: flex; justify-content: space-between; gap: 12px; }

.print-bar { position: fixed; top: 0; left: 0; right: 0; background: ${NAVY}; padding: 10px 24px; display: flex; justify-content: space-between; align-items: center; z-index: 100; }
.print-bar span { color: #C5D2E2; font-size: 12px; }
.print-bar button { background: ${LINK}; color: #fff; border: none; padding: 9px 22px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; min-height: 40px; }
@media print { .print-bar { display: none !important; } body { padding-top: 0 !important; } }
@media screen { body { padding: 64px 32px 40px; max-width: 820px; margin: 0 auto; } }
</style>
</head>
<body>

<div class="print-bar">
<span>Report preview. Save as PDF or print.</span>
<button id="print-report" type="button">Download PDF</button>
</div>

<div class="masthead">
<span class="brand">${markSvg}The Center of CX</span>
<span>contactcentercx.com</span>
</div>

<div class="cover">
<div class="cover-left">
  ${logo ? `<img src="${e(logo)}" class="company-logo" alt="Company logo" />` : ""}
  <h1>${e(toolName)}</h1>
  ${subtitle ? `<div class="subtitle">${e(subtitle)}</div>` : ""}
  <div class="meta">
    ${reportName ? `<div><strong>Prepared for:</strong> ${e(reportName)}</div>` : ""}
    ${company ? `<div><strong>Organization:</strong> ${e(company)}</div>` : ""}
    <div><strong>Date:</strong> ${e(today)}</div>
    ${method ? `<div><strong>Method:</strong> ${e(method)}</div>` : ""}
  </div>
</div>
${howBlock}
</div>

<div class="reader"><div class="who">Written for<strong>${e(reader.title)}</strong></div><p>${e(how ? reader.read : READ_NO_GRADE[reader.id] || reader.read)}</p></div>
${plan.brief && plan.brief.ask.length ? `<div class="section ask"><h3>What to check first</h3><ol class="findings">${plan.brief.ask.map((q, qi) => `<li class="finding"><span class="finding-num">${qi + 1}</span><span>${e(q)}</span></li>`).join("")}</ol></div>` : ""}
${plan.lead.map((s) => renderSection(s)).join("\n")}
${plan.appendix.length ? `<div class="appendix"><h2>Appendix: the detail</h2><p>The inputs, workings and method behind the summary, for whoever checks it.</p></div>\n${plan.appendix.map((s) => renderSection(s)).join("\n")}` : ""}

<div class="report-footer">
<div class="row"><span>The Center of CX. Diagnose before you buy.</span><span>${e(today)}</span></div>
<div>Every figure is computed from the inputs listed, under the assumptions stated. Change an input and the figure moves with it.</div>
</div>

</body>
</html>`;
}

/* The evidence mark on paper: three 240 degree arcs, filled by grade (Directional a third,
   Planning-grade two thirds, Finance-grade whole); a not applicable axis is a dotted ring.
   The grade words are fixed, so every number drawn here comes from this table. */
const FILL = { "Directional": 1 / 3, "Planning-grade": 2 / 3, "Finance-grade": 1 };
function evidenceMark(axes) {
  const ring = (r, grade, color) => {
    const c = 2 * Math.PI * r, arc = c * 240 / 360;
    const f = FILL[grade];
    const base = `<circle r="${r}" fill="none" stroke="${ARCS_PRINT.track}" stroke-width="7" stroke-dasharray="${arc.toFixed(2)} ${c.toFixed(2)}" stroke-linecap="round"/>`;
    if (f === undefined) return `<circle r="${r}" fill="none" stroke="${ARCS_PRINT.na}" stroke-width="2" stroke-dasharray="2 5" />`;
    return base + `<circle r="${r}" fill="none" stroke="${color}" stroke-width="7" stroke-dasharray="${(arc * f).toFixed(2)} ${c.toFixed(2)}" stroke-linecap="round"/>`;
  };
  return `<svg class="arcs" width="64" height="64" viewBox="-64 -64 128 128" role="img" aria-label="Evidence mark"><g transform="rotate(60)">${ring(56, axes.evidence, ARCS_PRINT.evidence)}${ring(42, axes.realization, ARCS_PRINT.realization)}${ring(28, axes.completeness, ARCS_PRINT.completeness)}</g></svg>`;
}

export default function ReportExport({ toolId, grade, toolName, subtitle, userName, userEmail, sections = [], method = "", how = null }) {
  const [showModal, setShowModal] = useState(false);
  const [logo, setLogo] = useState(null);
  const [reportName, setReportName] = useState(userName || "");
  const [company, setCompany] = useState("");
  const [audience, setAudience] = useState("finance");
  const fileRef = useRef(null);
  const reader = AUDIENCES.find((a) => a.id === audience) || AUDIENCES[0];

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  };

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const generateReport = () => {
    /* The single highest-intent action on the platform. A reader who downloads
       a completed diagnostic with their own numbers in it is not browsing. This
       was the most valuable uninstrumented event on the site.

       Fired before the popup opens, because the popup can steal focus and the
       beacon transport is what survives that. The tool id falls back to the
       route slug, so the twenty-two tools that render this component directly
       and pass no id are covered without touching twenty-two files. The reader
       choice joins the event with taxonomy 1.1 (redesign Phase 5). */
    trackTool.pdf(
      toolId || toolIdFromPath(typeof window !== "undefined" && window.location ? window.location.pathname : ""),
      { grade, audience }
    );

    const win = window.open("", "_blank");
    if (!win) { alert("Please allow pop-ups to download your report."); return; }

    const origin = (typeof window !== "undefined" && window.location && window.location.origin) ? window.location.origin : "";
    const html = reportHtml({ toolName, subtitle, reportName, company, logo, today, sections, origin, method, audience, how, toolId });

    win.document.write(html);
    win.document.close();
    /* The report window runs no script of its own (its policy is script-src 'none'), so
       the print button is wired from here, and the window loses its handle back to the
       site. */
    const btn = win.document.getElementById("print-report");
    if (btn) btn.addEventListener("click", () => win.print());
    try { win.opener = null; } catch (err) { /* already detached */ }
  };

  const field = { width: "100%", boxSizing: "border-box", minHeight: 44, padding: "10px 12px", fontSize: 15, border: `1px solid ${BORDER}`, borderRadius: 12, color: INK, fontFamily: "inherit" };
  const label = { fontSize: 13, fontWeight: 600, color: INK, display: "block", marginBottom: 6 };

  return (
    <>
      <button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 44, padding: "12px 22px", fontSize: 15, fontWeight: 600, background: LINK, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontFamily: "inherit" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11 M7 10l5 5 5-5 M5 20h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Download Report
      </button>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(7,17,31,0.72)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="report-dialog-title" style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 520, maxHeight: "92vh", overflowY: "auto", padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.35)", color: INK }}>
            <h3 id="report-dialog-title" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em", margin: "0 0 4px" }}>Who is this report for?</h3>
            <p style={{ fontSize: 14, color: SLATE, margin: "0 0 16px", lineHeight: 1.5 }}>The order and the reading line follow your choice. Every figure stays the same.</p>

            <div role="radiogroup" aria-label="Who is this report for" style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              {AUDIENCES.map((a) => {
                const on = a.id === audience;
                return (
                  <button key={a.id} type="button" role="radio" aria-checked={on} onClick={() => setAudience(a.id)}
                    style={{ textAlign: "left", minHeight: 44, padding: "10px 14px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit", color: INK,
                      background: on ? PANEL : "#fff", border: on ? `2px solid ${LINK}` : `1px solid ${BORDER}` }}>
                    <span style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{a.label}</span>
                    <span style={{ display: "block", fontSize: 13, color: SLATE, lineHeight: 1.45 }}>{a.read}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ marginBottom: 14 }}>
              <span style={label}>Company logo (optional)</span>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {logo ? (
                  <>
                    <img src={logo} alt="Your logo" style={{ maxWidth: 120, maxHeight: 48, objectFit: "contain", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 6 }} />
                    <button type="button" onClick={() => { setLogo(null); if (fileRef.current) fileRef.current.value = ""; }} style={{ minHeight: 44, padding: "0 14px", fontSize: 14, color: INK, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, cursor: "pointer", fontFamily: "inherit" }}>Remove logo</button>
                  </>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()} style={{ minHeight: 44, padding: "0 18px", fontSize: 14, color: SLATE, border: `1.5px dashed ${BORDER}`, borderRadius: 12, background: PANEL, cursor: "pointer", fontFamily: "inherit" }}>
                    Upload a logo (PNG, JPG or SVG)
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} aria-label="Company logo file" style={{ display: "none" }} />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label htmlFor="report-name" style={label}>Your name</label>
              <input id="report-name" type="text" value={reportName} onChange={e => setReportName(e.target.value)} placeholder="Name for the report cover" style={field} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label htmlFor="report-org" style={label}>Organization</label>
              <input id="report-org" type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name (optional)" style={field} />
            </div>

            <p style={{ fontSize: 13, color: QUIET, margin: "0 0 16px" }}>{toolName}{subtitle ? `, ${subtitle}` : ""}. {sections.length} sections, dated {today}. The report opens in a new window for you to save; its contents stay in your browser.</p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button type="button" onClick={generateReport} style={{ flex: "1 1 240px", minHeight: 48, padding: "12px", fontSize: 15, fontWeight: 600, background: LINK, color: "#fff", border: "none", borderRadius: 12, cursor: "pointer", fontFamily: "inherit" }}>Generate the {reader.short} report</button>
              <button type="button" onClick={() => setShowModal(false)} style={{ minHeight: 48, padding: "12px 20px", fontSize: 15, fontWeight: 600, color: INK, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
