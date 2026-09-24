import { useState, useEffect } from "react";
import { ToolNav, ToolHero } from "./src/lib/ToolShell";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";
import { JOURNEY } from "./src/lib/journey";
import { CONTRACT_RISK as MODEL } from "./src/lib/rubrics/contractRisk";
import { scoreTerms } from "./src/lib/terms";

/* Contract Risk Scanner. The clauses, options, severities and reading rule live in the
   published model (src/lib/rubrics/contractRisk.js) and the engine (src/lib/terms.js);
   this file only presents them. */

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const BORDER = "#D8E3ED";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
const LEVEL = { low: { label: "Low", color: "#047857" }, medium: { label: "Medium", color: "#B45309" }, high: { label: "High", color: "#C2410C" }, critical: { label: "Critical", color: "#B91C1C" }, unknown: { label: "Find it", color: "#3A4F6A" } };
const READING_COLOR = { doNotSign: "#B91C1C", negotiate: "#C2410C", find: "#3A4F6A", notes: "#B45309", clear: "#047857" };
const readingOf = (id) => MODEL.readings.find((r) => r.id === id);
const toolOf = (id) => (JOURNEY[id] ? { name: JOURNEY[id].name, href: JOURNEY[id].route } : null);

const TOOL_ID = "contract-risk";
const ROUTE = "/tools/contract-risk";
export const DEFAULTS = { selections: {} };
/* A complete sample that reaches every severity and a clause not known: the highest-risk
   option on most clauses, a middle option on some, and "don't know" on two. The floor
   harness renders it to prove the reading, the checklist and the PDF build. */
export const SAMPLE = { selections: Object.fromEntries(MODEL.terms.map((t, i) => [t.id, i % 5 === 3 ? MODEL.unknown.val : i % 3 === 1 ? t.options[1].val : t.options[t.options.length - 1].val])) };
/* A selection is kept only if it names a real option on a real clause, or "don't know". */
const cleanSelections = (sel) => Object.fromEntries(MODEL.terms.filter((t) => sel && typeof sel === "object" && Object.prototype.hasOwnProperty.call(sel, t.id) && (t.options.some((o) => o.val === sel[t.id]) || sel[t.id] === MODEL.unknown.val)).map((t) => [t.id, sel[t.id]]));

export default function ContractRiskScanner() {
  const [init] = useState(() => { const sc = readScenario(TOOL_ID, DEFAULTS); return { selections: cleanSelections(sc && sc.selections) }; });
  const [selections, setSelections] = useState(init.selections);
  useEffect(() => { window.scrollTo(0, 0); clearScenarioParam(); }, []);
  const setTerm = (id, val) => setSelections((prev) => ({ ...prev, [id]: val }));
  const R = scoreTerms(MODEL, { selections });
  const reading = R.reading ? readingOf(R.reading) : null;
  const next = R.next ? toolOf(R.next) : null;
  const NEXT_WHY = { "license-gap": "add-on pricing is unpriced or not known, and it changes what the contract costs", "platform-decision": "the renewal terms are the problem, and the renewal gate decides what to do about them", "tco-calculator": "the next question is what the contract costs over its full term" };

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh" }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:${FONT};background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.pg{grid-template-columns:1fr!important}}`}</style>
      <ToolNav wrap={WRAP} />
      <ToolHero wrap={WRAP} eyebrow="Vendor Selection" title="Contract Risk Scanner"
        intro={`Read ${MODEL.terms.length} clauses of a contact center platform contract against published severities. Pick the option that matches your contract, or "don't know"; every flagged clause comes with the reason and the position to ask for instead.`}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", marginTop: 12 }}>Every clause, severity and rule is in the <a href={MODEL.methodology} style={{ color: "#fff", fontWeight: 600, textDecoration: "underline" }}>published method</a>. Not legal advice.</p>
      </ToolHero>

      <section style={{ background: "#fff", padding: "40px 28px 60px" }}><div style={WRAP}>
        {reading && (
          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", marginBottom: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase" }}>Reading{R.complete ? "" : `, ${R.answered} of ${R.total} clauses answered`}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", margin: "6px 0" }}>{reading.label}</div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{reading.test}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
              {["critical", "high", "medium", "unknown", "low"].map((k) => <span key={k} style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: R.counts[k] ? LEVEL[k].color : "rgba(255,255,255,0.14)", padding: "4px 10px", borderRadius: 6 }}>{R.counts[k]} {k === "unknown" ? "to find" : LEVEL[k].label.toLowerCase()}</span>)}
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {R.clauses.map((c) => {
            const term = MODEL.terms.find((t) => t.id === c.id);
            const lv = c.status === "unanswered" ? null : LEVEL[c.status];
            return (
              <div key={c.id} style={{ background: WARM, border: `1px solid ${lv ? lv.color + "40" : BORDER}`, borderLeft: `4px solid ${lv ? lv.color : "transparent"}`, borderRadius: 10, padding: "18px 20px" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: NAVY }}>{c.name}</div>
                <p style={{ fontSize: 12, color: SLATE, margin: "4px 0 10px" }}>{c.why}</p>
                <div role="group" aria-label={c.name} style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[...term.options.map((o) => ({ val: o.val, color: LEVEL[o.level].color })), { val: MODEL.unknown.val, color: LEVEL.unknown.color }].map((o) => {
                    const sel = selections[c.id] === o.val;
                    return <button key={o.val} aria-pressed={sel} onClick={() => setTerm(c.id, o.val)} style={{ padding: "8px 14px", fontSize: 12, fontWeight: sel ? 700 : 500, borderRadius: 6, cursor: "pointer", border: `1px solid ${sel ? o.color : BORDER}`, background: sel ? o.color : "#fff", color: sel ? "#fff" : SLATE }}>{o.val}</button>;
                  })}
                </div>
                {lv && (
                  <div style={{ marginTop: 10 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: lv.color, marginRight: 8 }}>{lv.label}.</span>
                    <span style={{ fontSize: 13, color: SLATE }}>{c.status === "unknown" ? "Find this clause in the contract before signing. A clause you do not know is not rated either way." : c.note}</span>
                    {c.negotiate && <p style={{ fontSize: 13, color: NAVY, marginTop: 6 }}><strong>Ask for:</strong> {c.negotiate}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {R.checklist.length > 0 && (
          <div style={{ marginTop: 28, background: WARM, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "24px" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 8 }}>Negotiation checklist</h2>
            <p style={{ fontSize: 12, color: SLATE, marginBottom: 10 }}>{MODEL.positionsNote}</p>
            {R.checklist.map((f, i) => (
              <div key={f.clause} style={{ display: "flex", gap: 10, padding: "10px 0", borderTop: i ? `1px solid ${BORDER}` : "none" }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: LEVEL[f.severity].color, padding: "2px 8px", borderRadius: 4, flexShrink: 0, minWidth: 64, textAlign: "center", alignSelf: "flex-start" }}>{LEVEL[f.severity].label}</span>
                <div><div style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{f.name}{f.severity === "unknown" ? "" : ": " + f.selected}</div><div style={{ fontSize: 13, color: SLATE, marginTop: 2 }}>{f.action}</div></div>
              </div>
            ))}
          </div>
        )}
        {next && <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.6, margin: "20px 0" }}>Next diagnostic: <a href={next.href} style={{ color: ELECTRIC, fontWeight: 600 }}>{next.name}</a>, because {NEXT_WHY[R.next]}.</p>}
        <p style={{ fontSize: 13, color: SLATE, margin: "0 0 24px" }}>Want a second pair of eyes before you sign? Use the review request below: your answers travel with it.</p>

        <ReportActions
          toolId={TOOL_ID}
          toolName="Contract Risk Scanner"
          subtitle={reading ? reading.label : "Not started"}
          routePath={ROUTE}
          state={{ selections }}
          defaults={DEFAULTS}
          summary={[
            { label: "Reading", value: reading ? reading.label : "No clause answered" },
            { label: "Clauses answered", value: R.answered + " of " + R.total },
            { label: "Critical or high", value: String(R.counts.critical + R.counts.high) },
            { label: "Clauses to find", value: String(R.counts.unknown + R.total - R.answered) },
          ]}
          sections={[
            { title: "Reading", type: "text", content: reading ? reading.label + ". " + reading.test + (R.complete ? "" : " " + (R.total - R.answered) + " clauses are not answered yet.") : "No clause answered yet." },
            { title: "Every Clause", type: "table", rows: R.clauses.map((c) => [c.name, c.status === "unanswered" ? "Not answered" : c.selected + " (" + LEVEL[c.status].label.toLowerCase() + ")"]) },
            { title: "Negotiation Checklist", type: "actions", items: R.checklist.length ? R.checklist.map((f) => ({ action: f.name + (f.severity === "unknown" ? "" : ": " + f.selected), detail: LEVEL[f.severity].label + ". " + f.action + " Why it matters: " + f.why, priority: f.severity === "critical" || f.severity === "high" ? "high" : "medium" })) : [{ action: "No clause is critical, high or unknown.", detail: "Have counsel review the final contract before signing.", priority: "medium" }] },
            { title: "Negotiation Positions", type: "text", content: MODEL.positionsNote },
            { title: "What This Tool Cannot Tell You", type: "findings", items: MODEL.limits },
            { title: "Method", type: "text", content: MODEL.title + " " + MODEL.version + ". Each clause option carries a published severity; the reading is the most serious one present, and a clause you do not know is an item to find, never a pass. Published at contactcentercx.com" + MODEL.methodology + "." },
            { title: "Next Steps", type: "next", items: next ? [{ tool: next.name, href: next.href, reason: "Because " + NEXT_WHY[R.next] + "." }] : [] },
          ]}
        />
      </div></section>
    </div>
  );
}
