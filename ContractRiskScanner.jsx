import { useState, useEffect } from "react";
import { ToolFrame } from "./src/lib/ToolFrame.jsx";
import { Result } from "./src/lib/ui.jsx";
import { K, Paper, Group, frameMethod } from "./src/lib/frameKit.jsx";
import { methodStamp } from "./src/lib/methodVersions.js";
import { TOUCH, RADIUS } from "./src/lib/tokens.js";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";
import { JOURNEY } from "./src/lib/journey";
import { CONTRACT_RISK as MODEL } from "./src/lib/rubrics/contractRisk";
import { scoreTerms } from "./src/lib/terms";

/* Contract Risk Scanner. The clauses, options, severities and reading rule live in the
   published model (src/lib/rubrics/contractRisk.js) and the engine (src/lib/terms.js);
   this file only presents them. */

/* A severity is a word on the page; the PDF prints its label. */
const LEVEL = { low: { label: "Low" }, medium: { label: "Medium" }, high: { label: "High" }, critical: { label: "Critical" }, unknown: { label: "Find it" } };
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

  const result = reading
    ? <Result label={R.complete ? "Reading" : `Reading, ${R.answered} of ${R.total} clauses answered`} value={reading.label} change={reading.test} />
    : <Result label="Clauses answered" value={`0 of ${R.total}`} change="The reading appears with your first answer. A clause you do not know is an item to find, never a pass." />;
  const chip = (lv) => ({ display: "inline-block", fontFamily: FONT, fontSize: 13, fontWeight: 700, padding: "3px 10px", borderRadius: RADIUS.chip, border: `${lv === "critical" ? 2 : 1}px ${lv === "unknown" ? "dashed" : "solid"} ${lv === "critical" || lv === "high" ? K.strong.color : K.firm}`, color: K.strong.color, flexShrink: 0, minWidth: 72, textAlign: "center" });
  const optBtn = (on) => ({ minHeight: TOUCH, padding: "0 14px", fontFamily: FONT, fontSize: 14, fontWeight: on ? 700 : 500, borderRadius: RADIUS.field, cursor: "pointer", border: `${on ? 2 : 1}px solid ${on ? K.strong.color : K.firm}`, background: on ? K.shade(0) : "transparent", color: K.strong.color, textAlign: "left" });

  return (
    <ToolFrame toolId={TOOL_ID} choice={R.next || null} section="Vendor Selection" name="Contract Risk Scanner" title="What in this contract should you change before you sign?"
      lede={`Read ${MODEL.terms.length} clauses of a contact center platform contract against published severities. Pick the option that matches your contract, or "don't know"; every flagged clause comes with the reason and the position to ask for instead. Not legal advice.`}
      method={frameMethod(methodStamp(TOOL_ID))} result={result} pinned={reading ? { label: "Reading", value: reading.label } : null}>
      <style>{FONT_IMPORT_CSS}</style>

      {reading && (
        <section aria-label="Reading" style={K.lead}>
          <span style={K.kicker}>Reading{R.complete ? "" : `, ${R.answered} of ${R.total} clauses answered`}</span>
          <div style={K.stat}>{reading.label}</div>
          <p style={{ ...K.body, marginTop: 6 }}>{reading.test}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {["critical", "high", "medium", "unknown", "low"].map((k) => <span key={k} style={chip(k)}>{R.counts[k]} {k === "unknown" ? "to find" : LEVEL[k].label.toLowerCase()}</span>)}
          </div>
        </section>
      )}

      <Group legend="The clauses" note={<>Every clause, severity and rule is in the <a href={MODEL.methodology} style={K.link}>published method</a>.</>}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {R.clauses.map((c) => {
            const term = MODEL.terms.find((t) => t.id === c.id);
            const lv = c.status === "unanswered" ? null : LEVEL[c.status];
            return (
              <div key={c.id} style={{ ...K.box, border: `${lv && (c.status === "critical" || c.status === "high") ? 2 : 1}px solid ${lv && (c.status === "critical" || c.status === "high") ? K.strong.color : K.hair}` }}>
                <div style={{ ...K.strong, fontSize: 16 }}>{c.name}</div>
                <p style={{ ...K.small, margin: "4px 0 10px" }}>{c.why}</p>
                <div role="group" aria-label={c.name} style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[...term.options.map((o) => o.val), MODEL.unknown.val].map((val) => {
                    const sel = selections[c.id] === val;
                    return <button key={val} type="button" aria-pressed={sel} onClick={() => setTerm(c.id, val)} style={optBtn(sel)}>{sel ? "\u2713 " : ""}{val}</button>;
                  })}
                </div>
                {lv && (
                  <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={chip(c.status)}>{lv.label}</span>
                    <div>
                      <span style={K.body}>{c.status === "unknown" ? "Find this clause in the contract before signing. A clause you do not know is not rated either way." : c.note}</span>
                      {c.negotiate && <p style={{ ...K.body, color: K.strong.color, marginTop: 6 }}><strong>Ask for:</strong> {c.negotiate}</p>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Group>

      {R.checklist.length > 0 && (
        <section aria-label="Negotiation checklist" style={K.panel}>
          <h2 style={K.h2}>Negotiation checklist</h2>
          <p style={{ ...K.small, marginBottom: 10 }}>{MODEL.positionsNote}</p>
          {R.checklist.map((f) => (
            <div key={f.clause} style={{ display: "flex", gap: 12, padding: "10px 0", borderTop: `1px solid ${K.hair}`, alignItems: "flex-start" }}>
              <span style={chip(f.severity)}>{LEVEL[f.severity].label}</span>
              <div><div style={{ ...K.strong, fontSize: 15 }}>{f.name}{f.severity === "unknown" ? "" : ": " + f.selected}</div><div style={{ ...K.small, marginTop: 3 }}>{f.action}</div></div>
            </div>
          ))}
        </section>
      )}
      {next && <p style={K.body}>Next diagnostic: <a href={next.href} style={K.link}>{next.name}</a>, because {NEXT_WHY[R.next]}.</p>}
      <p style={K.small}>Want a second pair of eyes before you sign? Use the review request below: your answers travel with it.</p>

      <Paper>
        <ReportActions next={R.next ? { to: R.next, because: "Because " + NEXT_WHY[R.next] + "." } : null}
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
          ]}
        />
      </Paper>
    </ToolFrame>
  );
}
