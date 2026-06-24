import { useState, useRef } from "react";

const NAVY = "#0B1D3A";
const ELECTRIC = "#0088DD";
const LIGHT = "#00AAFF";
const MUTED = "#6B7F99";
const BORDER = "#D8E3ED";
const GREEN = "#10B981";
const SLATE = "#3A4F6A";

/**
 * ReportExport — Reusable report generation component
 *
 * Usage in any tool:
 *
 * <ReportExport
 *   toolName="Staffing Requirement Calculator"
 *   subtitle="Erlang C Staffing Analysis"
 *   userName={name}
 *   userEmail={email}
 *   sections={[
 *     { title: "Inputs", type: "table", rows: [["Volume", "45,000"], ["AHT", "6:35"]] },
 *     { title: "Results", type: "metrics", items: [{ label: "Required FTE", value: "127", color: "#0088DD" }] },
 *     { title: "Key Findings", type: "findings", items: ["Finding 1", "Finding 2"] },
 *     { title: "Recommended Actions", type: "actions", items: [{ action: "Do this", detail: "Because...", priority: "high" }] },
 *     { title: "Next Steps", type: "next", items: [{ tool: "Shrinkage Planner", reason: "Your shrinkage is above benchmark", href: "/tools/shrinkage-planner" }] },
 *   ]}
 * />
 *
 * Next-step items support an optional `href`. When present, the tool renders as a
 * clickable link (absolute URL, so it works in the popup preview and the saved PDF).
 */

export default function ReportExport({ toolName, subtitle, userName, userEmail, sections = [] }) {
  const [showModal, setShowModal] = useState(false);
  const [logo, setLogo] = useState(null);
  const [reportName, setReportName] = useState(userName || "");
  const [company, setCompany] = useState("");
  const fileRef = useRef(null);

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  };

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const generateReport = () => {
    const win = window.open("", "_blank");
    if (!win) { alert("Please allow pop-ups to download your report."); return; }

    // Resolve relative next-step links against the live origin so they work in the
    // popup preview (whose own URL is about:blank) and remain clickable in the PDF.
    const origin = (typeof window !== "undefined" && window.location && window.location.origin) ? window.location.origin : "";
    const absUrl = (href) => !href ? null : (/^https?:\/\//i.test(href) ? href : origin + (href.startsWith("/") ? href : "/" + href));

    const renderSection = (s, i) => {
      if (s.type === "table") {
        return `<div class="section">
          <h3>${s.title}</h3>
          <table>${s.rows.map(r => `<tr><td class="label">${r[0]}</td><td class="value">${r[1]}</td></tr>`).join("")}</table>
        </div>`;
      }
      if (s.type === "metrics") {
        return `<div class="section">
          <h3>${s.title}</h3>
          <div class="metrics">${s.items.map(m => `
            <div class="metric">
              <div class="metric-value" style="color:${m.color || ELECTRIC}">${m.value}</div>
              <div class="metric-label">${m.label}</div>
              ${m.sub ? `<div class="metric-sub">${m.sub}</div>` : ""}
            </div>`).join("")}
          </div>
        </div>`;
      }
      if (s.type === "findings") {
        return `<div class="section">
          <h3>${s.title}</h3>
          <div class="findings">${s.items.map((f, fi) => `
            <div class="finding">
              <span class="finding-num">${fi + 1}</span>
              <span>${f}</span>
            </div>`).join("")}
          </div>
        </div>`;
      }
      if (s.type === "actions") {
        return `<div class="section">
          <h3>${s.title}</h3>
          <div class="actions">${s.items.map(a => `
            <div class="action ${a.priority || ""}">
              <div class="action-header">
                ${a.priority === "high" ? '<span class="priority high">High Priority</span>' : a.priority === "medium" ? '<span class="priority medium">Medium</span>' : ""}
                <strong>${a.action}</strong>
              </div>
              <p>${a.detail}</p>
            </div>`).join("")}
          </div>
        </div>`;
      }
      if (s.type === "next") {
        return `<div class="section next-section">
          <h3>${s.title}</h3>
          <div class="next-tools">${s.items.map(nx => {
            const url = absUrl(nx.href);
            const inner = `<strong>${nx.tool}${url ? ' <span class="next-arrow">&rarr;</span>' : ""}</strong><span>${nx.reason}</span>`;
            return url
              ? `<a class="next-tool next-link" href="${url}" target="_blank" rel="noopener">${inner}</a>`
              : `<div class="next-tool">${inner}</div>`;
          }).join("")}
          </div>
        </div>`;
      }
      if (s.type === "text") {
        return `<div class="section"><h3>${s.title}</h3><p class="text-block">${s.content}</p></div>`;
      }
      return "";
    };

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${toolName} — Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  @page { margin: 0.6in 0.7in; size: letter; }

  body {
    font-family: 'DM Sans', -apple-system, sans-serif;
    color: ${NAVY};
    font-size: 10pt;
    line-height: 1.5;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Cover header */
  .cover {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 20px;
    border-bottom: 2px solid ${ELECTRIC};
    margin-bottom: 24px;
  }
  .cover-left { flex: 1; }
  .cover-right { text-align: right; }
  .cover h1 {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 22pt;
    font-weight: 400;
    color: ${NAVY};
    line-height: 1.15;
    margin-bottom: 4px;
  }
  .cover .subtitle {
    font-size: 11pt;
    color: ${MUTED};
    margin-bottom: 12px;
  }
  .cover .meta {
    font-size: 8.5pt;
    color: ${MUTED};
    line-height: 1.6;
  }
  .cover .meta strong { color: ${NAVY}; }
  .company-logo {
    max-width: 160px;
    max-height: 60px;
    object-fit: contain;
    margin-bottom: 8px;
  }
  .site-mark {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
  }
  .site-mark span {
    font-size: 8pt;
    color: ${MUTED};
    font-weight: 600;
    letter-spacing: 0.5px;
  }
  .site-mark .cx { color: ${LIGHT}; }

  /* Sections */
  .section {
    margin-bottom: 22px;
    page-break-inside: avoid;
  }
  .section h3 {
    font-size: 10pt;
    font-weight: 700;
    color: ${ELECTRIC};
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 10px;
    padding-bottom: 4px;
    border-bottom: 1px solid #E8F0F6;
  }

  /* Tables */
  table { width: 100%; border-collapse: collapse; }
  td { padding: 6px 10px; border-bottom: 1px solid #F0F3F7; font-size: 9.5pt; }
  td.label { color: ${SLATE}; width: 45%; }
  td.value { font-weight: 600; color: ${NAVY}; text-align: right; }

  /* Metrics */
  .metrics {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .metric {
    flex: 1;
    min-width: 100px;
    background: #F8FAFB;
    border: 1px solid #E8F0F6;
    border-radius: 6px;
    padding: 12px;
    text-align: center;
  }
  .metric-value {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 22pt;
    line-height: 1.1;
  }
  .metric-label { font-size: 8.5pt; color: ${MUTED}; margin-top: 2px; }
  .metric-sub { font-size: 8pt; color: ${MUTED}; opacity: 0.7; }

  /* Findings */
  .findings { display: flex; flex-direction: column; gap: 6px; }
  .finding {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 8px 10px;
    background: #F8FAFB;
    border-radius: 4px;
    font-size: 9.5pt;
    color: ${SLATE};
    line-height: 1.45;
  }
  .finding-num {
    background: ${ELECTRIC};
    color: #fff;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8pt;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* Actions */
  .actions { display: flex; flex-direction: column; gap: 8px; }
  .action {
    padding: 10px 12px;
    border-left: 3px solid #D8E3ED;
    background: #FAFBFC;
    border-radius: 0 4px 4px 0;
  }
  .action.high { border-left-color: #EF4444; background: #FEF7F7; }
  .action.medium { border-left-color: #F59E0B; background: #FFFCF5; }
  .action-header { margin-bottom: 4px; font-size: 9.5pt; }
  .action p { font-size: 9pt; color: ${SLATE}; line-height: 1.5; }
  .priority {
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    padding: 1px 6px;
    border-radius: 3px;
    margin-right: 6px;
  }
  .priority.high { background: #FEE2E2; color: #DC2626; }
  .priority.medium { background: #FEF3C7; color: #D97706; }

  /* Next tools */
  .next-section { margin-top: 16px; }
  .next-tools { display: flex; flex-direction: column; gap: 6px; }
  .next-tool {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 10px;
    background: #F0F9FF;
    border: 1px solid #DBEAFE;
    border-radius: 4px;
    font-size: 9pt;
  }
  .next-tool strong { color: ${NAVY}; }
  .next-tool span { color: ${MUTED}; }
  .next-link { text-decoration: none; color: inherit; transition: background 0.15s, border-color 0.15s; }
  .next-link strong { color: ${ELECTRIC}; }
  .next-arrow { color: ${ELECTRIC}; font-weight: 700; }
  .next-link:hover { background: #E3F2FD; border-color: ${ELECTRIC}; }

  .text-block { font-size: 9.5pt; color: ${SLATE}; line-height: 1.6; }

  /* Footer */
  .report-footer {
    margin-top: 28px;
    padding-top: 12px;
    border-top: 1px solid #E8F0F6;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 7.5pt;
    color: #A0AEC0;
  }

  /* Print button — hidden on print */
  .print-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: ${NAVY};
    padding: 12px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 100;
  }
  .print-bar span { color: rgba(255,255,255,0.6); font-size: 12px; }
  .print-bar button {
    background: ${ELECTRIC};
    color: #fff;
    border: none;
    padding: 8px 24px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
  }
  @media print {
    .print-bar { display: none !important; }
    body { padding-top: 0 !important; }
    .next-link { background: #F0F9FF !important; }
  }
  @media screen {
    body { padding: 56px 32px 32px; max-width: 800px; margin: 0 auto; }
  }
</style>
</head>
<body>

<div class="print-bar">
  <span>Report preview — save as PDF or print</span>
  <button onclick="window.print()">Download PDF ↓</button>
</div>

<div class="cover">
  <div class="cover-left">
    <h1>${toolName}</h1>
    ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ""}
    <div class="meta">
      ${reportName ? `<div><strong>Prepared for:</strong> ${reportName}</div>` : ""}
      ${company ? `<div><strong>Organization:</strong> ${company}</div>` : ""}
      <div><strong>Date:</strong> ${today}</div>
    </div>
  </div>
  <div class="cover-right">
    ${logo ? `<img src="${logo}" class="company-logo" alt="Company logo" />` : ""}
    <div class="site-mark">
      <svg width="18" height="18" viewBox="0 0 120 120"><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke="${NAVY}" stroke-width="2" opacity="0.3"/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke="${NAVY}" stroke-width="3" opacity="0.5"/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke="${NAVY}" stroke-width="4.5"/><line x1="-14" y1="-14" x2="14" y2="14" stroke="${LIGHT}" stroke-width="5" stroke-linecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke="${LIGHT}" stroke-width="5" stroke-linecap="round"/></g></svg>
      <span>THE CENTER OF <span class="cx">CX</span></span>
    </div>
  </div>
</div>

${sections.map((s, i) => renderSection(s, i)).join("\n")}

<div class="report-footer">
  <span>Generated by The Center of CX — contactcentercx.com</span>
  <span>${today}</span>
</div>

</body>
</html>`;

    win.document.write(html);
    win.document.close();
  };

  return (
    <>
      <button onClick={() => setShowModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", fontSize: 14, fontWeight: 600, background: NAVY, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", transition: "opacity 0.15s" }}
        onMouseOver={e => e.currentTarget.style.opacity = 0.9}
        onMouseOut={e => e.currentTarget.style.opacity = 1}>
        <span style={{ fontSize: 16 }}>↓</span> Download Report
      </button>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(6,19,37,0.7)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={{ background: "#fff", borderRadius: 14, width: "100%", maxWidth: 480, padding: "32px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 4px" }}>Generate Your Report</h3>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 24 }}>Add your branding. We will format everything into a clean, presentation-ready document.</p>

            {/* Logo upload */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: NAVY, display: "block", marginBottom: 6 }}>Company Logo (optional)</label>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {logo ? (
                  <div style={{ position: "relative" }}>
                    <img src={logo} alt="Logo" style={{ maxWidth: 120, maxHeight: 48, objectFit: "contain", border: `1px solid ${BORDER}`, borderRadius: 6, padding: 6 }} />
                    <button onClick={() => { setLogo(null); if (fileRef.current) fileRef.current.value = ""; }} style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: "#EF4444", color: "#fff", border: "none", fontSize: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()} style={{ padding: "10px 20px", fontSize: 13, color: MUTED, border: `1px dashed ${BORDER}`, borderRadius: 8, background: "#FAFBFC", cursor: "pointer", transition: "border-color 0.15s" }}
                    onMouseOver={e => e.currentTarget.style.borderColor = ELECTRIC}
                    onMouseOut={e => e.currentTarget.style.borderColor = BORDER}>
                    Upload logo (PNG, JPG, SVG)
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" onChange={handleLogo} style={{ display: "none" }} />
              </div>
            </div>

            {/* Name */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: NAVY, display: "block", marginBottom: 4 }}>Your Name</label>
              <input type="text" value={reportName} onChange={e => setReportName(e.target.value)} placeholder="Name for the report cover" style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, outline: "none", color: NAVY }} />
            </div>

            {/* Company */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: NAVY, display: "block", marginBottom: 4 }}>Organization</label>
              <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Company name (optional)" style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, outline: "none", color: NAVY }} />
            </div>

            {/* Preview info */}
            <div style={{ background: "#F8FAFB", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 16px", marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>Report Preview</div>
              <div style={{ fontSize: 13, color: NAVY, fontWeight: 600 }}>{toolName}</div>
              {subtitle && <div style={{ fontSize: 12, color: MUTED }}>{subtitle}</div>}
              <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{sections.length} sections · Generated {today}</div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={generateReport} style={{ flex: 1, padding: "12px", fontSize: 14, fontWeight: 600, background: NAVY, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>Generate + Download PDF</button>
              <button onClick={() => setShowModal(false)} style={{ padding: "12px 20px", fontSize: 14, fontWeight: 600, color: MUTED, background: "#F8FAFB", border: `1px solid ${BORDER}`, borderRadius: 8, cursor: "pointer" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
