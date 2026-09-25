import { useState, useEffect } from "react";
import { ToolNav, ToolHero } from "./src/lib/ToolShell";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam, encodeScenario } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";
import { JOURNEY } from "./src/lib/journey";
import { QA_SCORECARD as MODEL } from "./src/lib/rubrics/qaScorecard";
import { qaCriteria, qaFormKey, scoreEvaluation, encodeSubmission, reviewQA, qaThresholdVars } from "./src/lib/qa";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#5B6E88"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
const SEV_STYLE = { critical: { label: "Critical", color: RED }, high: { label: "High", color: "#C2410C" }, medium: { label: "Medium", color: "#B45309" }, info: { label: "Note", color: SLATE } };
const GRADE = { reliable: { label: "Reliable", color: "#047857" }, tentative: { label: "Tentative", color: "#B45309" }, unreliable: { label: "Not reliable", color: "#B91C1C" }, inconclusive: { label: "Inconclusive", color: "#B45309" }, unanimous: { label: "Unanimous", color: "#047857" }, undefined: { label: "Not measurable", color: SLATE } };
const TV = qaThresholdVars(MODEL);
const fill = (t) => t.replace(/\{(\w+)\}/g, (_, k) => (TV[k] === undefined ? "" : String(TV[k])));
const whyOf = (f) => f.title + ": " + fill(MODEL.rules[f.rule].test) + (MODEL.rules[f.rule].heuristic ? " Heuristic threshold." : "");
const gradeOf = (m) => m.grade ? GRADE[m.grade] : { label: "Not graded", color: SLATE };
const num = (v) => (v === null || v === undefined ? "n/a" : v.toFixed(2));

const TEMPLATES = MODEL.templates;
const TOOL_ID = "qa-scorecard";
const ROUTE = "/tools/qa-scorecard";
const FOCI = MODEL.focus.map((f) => f.id);
const REASONS = MODEL.reasons.map((r) => r.id);
const NO_SESSION = { codes: [], reference: "" };
export const DEFAULTS = { template: "general", categories: TEMPLATES.general.categories, evalScores: {}, evaluator: "", call: "", session: NO_SESSION };

/* The sample: a finished blind session on the General Inbound form, three evaluators on
   three calls, so the calibration results render the moment a sample link opens. */
const SAMPLE_MARKS = [["AB", "1001", []], ["CD", "1001", [2]], ["EF", "1001", [2, 4]], ["AB", "1002", [8]], ["CD", "1002", [8, 9]], ["EF", "1002", [8]], ["AB", "1003", [3]], ["CD", "1003", []], ["EF", "1003", [3, 12]]];
const sampleForm = { categories: TEMPLATES.general.categories };
const sampleN = qaCriteria(sampleForm).length;
export const SAMPLE = { ...DEFAULTS, session: { codes: SAMPLE_MARKS.map(([e, c, miss]) => encodeSubmission(sampleForm, { evaluator: e, call: c, marks: Array.from({ length: sampleN }, (_, i) => !miss.includes(i)) })), reference: "" } };

/* A link can carry any shape. Categories keep a name, a whole-number weight from 0 to
   100 and their criteria; a criterion keeps its text, critical flag, definition, and a
   focus and reason only from the published lists. An evaluation mark is kept only as a
   yes or no on a criterion that exists. Session codes are kept as short strings; the
   engine decides which are valid. Anything else falls back to the template. */
const cleanState = (sc) => {
  const template = sc && Object.prototype.hasOwnProperty.call(TEMPLATES, sc.template) ? sc.template : "general";
  const cats = Array.isArray(sc && sc.categories) ? sc.categories : TEMPLATES[template].categories;
  const categories = cats.filter(c => c && typeof c === "object").slice(0, 30).map(c => ({
    name: typeof c.name === "string" ? c.name.slice(0, 120) : "Category",
    weight: Number.isFinite(c.weight) ? Math.max(0, Math.min(100, Math.round(c.weight))) : 0,
    criteria: (Array.isArray(c.criteria) ? c.criteria : []).filter(cr => cr && typeof cr.text === "string").slice(0, 40).map(cr => ({
      text: cr.text.slice(0, 300), critical: cr.critical === true,
      def: typeof cr.def === "string" ? cr.def.slice(0, 400) : "",
      focus: FOCI.includes(cr.focus) ? cr.focus : "",
      reason: cr.critical === true && REASONS.includes(cr.reason) ? cr.reason : "",
    })),
  }));
  const evalScores = Object.fromEntries(Object.entries((sc && sc.evalScores) || {}).filter(([k, v]) => {
    const m = /^(\d+)-(\d+)$/.exec(k); return !!m && typeof v === "boolean" && !!categories[+m[1]] && +m[2] < categories[+m[1]].criteria.length;
  }));
  const label = (x) => (typeof x === "string" ? x.replace(/[^A-Za-z0-9 ._-]/g, "").slice(0, 24) : "");
  const s = sc && sc.session && typeof sc.session === "object" ? sc.session : NO_SESSION;
  const session = { codes: (Array.isArray(s.codes) ? s.codes : []).filter(c => typeof c === "string").slice(0, 400).map(c => c.slice(0, 400)), reference: label(s.reference) };
  return { template, categories, evalScores, evaluator: label(sc && sc.evaluator), call: label(sc && sc.call), session };
};

const inputStyle = { padding: "6px 10px", fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 4, background: "#fff", color: NAVY };
const H2 = { fontSize: 20, fontWeight: 700, color: NAVY, marginBottom: 8 };
const P = { fontSize: 14, color: SLATE, lineHeight: 1.6, marginBottom: 12 };

function Finding({ f }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: `1px solid ${BORDER}` }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: SEV_STYLE[f.severity].color, padding: "2px 8px", borderRadius: 4, flexShrink: 0, minWidth: 64, textAlign: "center" }}>{SEV_STYLE[f.severity].label}</span>
      <div>
        <div style={{ fontSize: 14, color: NAVY, fontWeight: 600 }}>{f.action}</div>
        <div style={{ fontSize: 12, color: SLATE, marginTop: 2 }}>{whyOf(f)}</div>
      </div>
    </div>
  );
}

export default function QAScorecardBuilder() {
  const [init] = useState(() => cleanState(readScenario(TOOL_ID, DEFAULTS)));
  const [template, setTemplate] = useState(init.template);
  const [categories, setCategories] = useState(init.categories);
  const [evalScores, setEvalScores] = useState(init.evalScores);
  const [evaluator, setEvaluator] = useState(init.evaluator);
  const [call, setCall] = useState(init.call);
  const [session, setSession] = useState(init.session);
  const [copied, setCopied] = useState(false);
  /* An evaluator link ends in #score, so it opens at step 3, where the code is made. */
  useEffect(() => {
    const toScore = window.location.hash === "#score";
    clearScenarioParam();
    const el = toScore && document.getElementById && document.getElementById("score");
    if (el && el.scrollIntoView) el.scrollIntoView(); else window.scrollTo(0, 0);
  }, []);

  const applyTemplate = (key) => { setTemplate(key); setCategories(TEMPLATES[key].categories); setEvalScores({}); };
  const updateWeight = (ci, val) => setCategories(prev => prev.map((c, i) => i === ci ? { ...c, weight: Math.max(0, Math.min(100, Math.round(Number(val) || 0))) } : c));
  const updateCriterion = (ci, cri, field, val) => setCategories(prev => prev.map((c, i) => i === ci ? { ...c, criteria: c.criteria.map((cr, j) => j === cri ? { ...cr, [field]: val, ...(field === "critical" && !val ? { reason: "" } : {}) } : cr) } : c));
  const addCriterion = (ci) => setCategories(prev => prev.map((c, i) => i === ci ? { ...c, criteria: [...c.criteria, { text: "New criterion", critical: false, def: "", focus: "", reason: "" }] } : c));
  const removeCriterion = (ci, cri) => { setCategories(prev => prev.map((c, i) => i === ci ? { ...c, criteria: c.criteria.filter((_, j) => j !== cri) } : c)); setEvalScores({}); };
  const addCategory = () => setCategories(prev => [...prev, { name: "New Category", weight: 10, criteria: [{ text: "Criterion 1", critical: false, def: "", focus: "", reason: "" }] }]);
  const removeCategory = (ci) => { setCategories(prev => prev.filter((_, i) => i !== ci)); setEvalScores({}); };
  const updateCatName = (ci, val) => setCategories(prev => prev.map((c, i) => i === ci ? { ...c, name: val } : c));
  const setEval = (ci, cri, val) => setEvalScores(prev => ({ ...prev, [`${ci}-${cri}`]: val }));

  const form = { categories };
  const R = reviewQA(MODEL, form, session);
  const L = R.lint, C = R.calibration, CR = C.result;
  const crit = qaCriteria(form);

  /* The evaluator's own score: only once every criterion is marked. An unmarked criterion
     used to count as a miss, so a half-marked form printed a score nobody had given. */
  const marks = crit.map((c) => evalScores[c.key]);
  const markedCount = marks.filter((m) => m !== undefined).length;
  const own = scoreEvaluation(form, marks);
  const code = own && evaluator && call ? encodeSubmission(form, { evaluator, call, marks }) : "";
  const copy = () => { try { navigator.clipboard.writeText(code); setCopied(true); } catch (e) { setCopied(false); } };
  const [added, setAdded] = useState(false);
  const addMine = () => { setSession(s => ({ ...s, codes: [...s.codes.filter(c => c.trim() && c.trim() !== code), code] })); setAdded(true); };
  /* The link a QA lead sends evaluators: this form only, with no marks, names or session,
     opening at step 3. */
  const [linkCopied, setLinkCopied] = useState(false);
  const evaluatorLink = () => (typeof window !== "undefined" && window.location ? window.location.origin : "") + ROUTE + "?s=" + encodeScenario(TOOL_ID, { template, categories, evalScores: {}, evaluator: "", call: "", session: NO_SESSION }, DEFAULTS) + "#score";
  const copyLink = () => { try { navigator.clipboard.writeText(evaluatorLink()); setLinkCopied(true); } catch (e) { setLinkCopied(false); } };
  const sampleForm = qaFormKey({ categories: TEMPLATES.general.categories }) === qaFormKey(form);
  const loadSample = () => {
    if (!sampleForm && typeof window !== "undefined" && window.confirm && !window.confirm("The sample session was scored on the General Inbound form. Switch the form to General Inbound? Your edits to this form will be replaced.")) return;
    if (!sampleForm) { setTemplate("general"); setCategories(TEMPLATES.general.categories); setEvalScores({}); }
    setSession(SAMPLE.session);
  };
  const example = "QA1|" + qaFormKey(form) + "|AB|1001|" + "Y".repeat(Math.max(1, crit.length));

  const nextTool = R.next.tool && JOURNEY[R.next.tool] ? { name: JOURNEY[R.next.tool].name, href: JOURNEY[R.next.tool].route } : null;
  const NEXT_TEXT = {
    form: "Fix the critical and high form findings first. Scores from a form that fails these checks cannot be defended, however well evaluators agree.",
    calibrate: "Run a blind calibration session: have at least two evaluators score the same calls with this form, then paste their codes below.",
    recalibrate: "Reword the flagged criteria, brief evaluators on the definitions and run another blind session before scores drive coaching or pay.",
    outcome: "The form passes its checks and evaluators agree. The next test is whether the scores track customer outcomes.",
  };
  const STEP_LABEL = { form: "Fix the form", calibrate: "Calibrate", recalibrate: "Calibrate again", outcome: "Test against outcomes" };
  const sevCount = (s) => R.bySeverity[s];
  const pct = (w) => (L.total > 0 ? Math.round((w / L.total) * 100) : 0) + "%";

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh" }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:${FONT};background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.pg{grid-template-columns:1fr!important}}`}</style>
      <ToolNav wrap={WRAP} />
      <ToolHero wrap={WRAP} eyebrow="Performance + Quality" title="QA Scorecard Builder"
        intro="Build a weighted QA form for a contact type, check that it produces scores you can defend, and calibrate your evaluators blind: each scores the same calls alone, and nothing is compared until everyone has scored.">
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", marginTop: 12 }}>Every rule, cut point and source is published in the <a href={MODEL.methodology} style={{ color: "#fff", fontWeight: 600, textDecoration: "underline" }}>QA method</a>.</p>
      </ToolHero>

      <section style={{ background: WARM, padding: "32px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 14 }}>
            {Object.entries(TEMPLATES).map(([k, v]) => (
              <button key={k} aria-pressed={template === k} onClick={() => applyTemplate(k)} style={{ padding: "6px 14px", fontSize: 12, fontWeight: 600, borderRadius: 4, border: `1px solid ${template === k ? GREEN : BORDER}`, background: template === k ? GREEN : "#fff", color: template === k ? "#fff" : MUTED, cursor: "pointer" }}>{v.name}</button>
            ))}
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: L.total === 100 ? "#047857" : RED }}>Total weight: {L.total}%{L.total !== 100 ? ". Must equal 100%." : ""}</span>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "36px 28px" }}>
        <div style={WRAP}>
          <h2 style={H2}>1. The form</h2>
          <p style={P}>Each criterion needs a definition of what earns a yes, a tag for what it measures, and, if it is an auto-fail, the reason it must be one.</p>
          {categories.map((cat, ci) => (
            <div key={ci} style={{ marginBottom: 20, background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <input type="text" aria-label={`Category ${ci + 1} name`} value={cat.name} onChange={e => updateCatName(ci, e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 200, fontSize: 14, fontWeight: 600 }} />
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 12, color: MUTED }}>Weight:</span>
                  <input type="number" aria-label={`${cat.name} weight, percent`} value={cat.weight} onChange={e => updateWeight(ci, e.target.value)} style={{ ...inputStyle, width: 56, textAlign: "center" }} />
                  <span style={{ fontSize: 12, color: MUTED }}>%</span>
                </div>
                <button aria-label={`Remove category ${cat.name}`} onClick={() => removeCategory(ci)} style={{ fontSize: 12, color: "#B91C1C", background: "none", border: "none", cursor: "pointer" }}>Remove</button>
              </div>
              <div style={{ padding: "8px 18px 14px" }}>
                {cat.criteria.map((cr, cri) => (
                  <div key={cri} style={{ padding: "10px 0", borderBottom: cri < cat.criteria.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <input type="text" aria-label={`${cat.name} criterion ${cri + 1}`} value={cr.text} onChange={e => updateCriterion(ci, cri, "text", e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                      <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: cr.critical ? "#B91C1C" : MUTED, cursor: "pointer", flexShrink: 0 }}>
                        <input type="checkbox" checked={cr.critical} onChange={e => updateCriterion(ci, cri, "critical", e.target.checked)} /> Auto-fail
                      </label>
                      <button aria-label={`Remove ${cat.name} criterion ${cri + 1}`} onClick={() => removeCriterion(ci, cri)} style={{ fontSize: 14, color: MUTED, background: "none", border: "none", cursor: "pointer", padding: "0 4px" }}>×</button>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                      <input type="text" aria-label={`${cat.name} criterion ${cri + 1} definition`} placeholder="What earns a yes" value={cr.def} onChange={e => updateCriterion(ci, cri, "def", e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 220, fontSize: 12, color: SLATE }} />
                      <select aria-label={`${cat.name} criterion ${cri + 1} measures`} value={cr.focus} onChange={e => updateCriterion(ci, cri, "focus", e.target.value)} style={{ ...inputStyle, fontSize: 12 }}>
                        <option value="">Measures...</option>
                        {MODEL.focus.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                      </select>
                      {cr.critical && (
                        <select aria-label={`${cat.name} criterion ${cri + 1} auto-fail reason`} value={cr.reason} onChange={e => updateCriterion(ci, cri, "reason", e.target.value)} style={{ ...inputStyle, fontSize: 12 }}>
                          <option value="">Auto-fail reason...</option>
                          {MODEL.reasons.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
                <button onClick={() => addCriterion(ci)} style={{ fontSize: 12, color: ELECTRIC, background: "none", border: "none", cursor: "pointer", marginTop: 6, fontWeight: 600 }}>+ Add criterion</button>
              </div>
            </div>
          ))}
          <button onClick={addCategory} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, borderRadius: 6, border: `1px dashed ${ELECTRIC}`, background: "transparent", color: ELECTRIC, cursor: "pointer", width: "100%", marginBottom: 32 }}>+ Add Category</button>

          <h2 style={H2}>2. Form check</h2>
          <p style={P}>What this form measures, by share of its weight. This is shown as a fact: no source says what the right mix is.</p>
          <div className="pg" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
            {L.mix.map(m => (
              <div key={m.focus} style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: NAVY }}>{pct(m.weight)}</div>
                <div style={{ fontSize: 12, color: SLATE }}>{m.label}</div>
              </div>
            ))}
          </div>
          {L.findings.length ? L.findings.map((f, i) => <Finding key={i} f={f} />) : <p style={{ ...P, color: "#047857", fontWeight: 600 }}>The form passes every published check.</p>}

          <h2 id="score" style={{ ...H2, marginTop: 36 }}>3. Score a call</h2>
          <p style={P}>For each evaluator in a calibration session: enter your initials and the call ID, mark every criterion, then send your submission code to your QA lead. You see only your own score. Nobody sees how it compares until every evaluator has scored every call.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
            <input type="text" aria-label="Your initials" placeholder="Your initials" value={evaluator} onChange={e => setEvaluator(e.target.value.replace(/[^A-Za-z0-9 ._-]/g, "").slice(0, 24))} style={{ ...inputStyle, width: 160 }} />
            <input type="text" aria-label="Call ID" placeholder="Call ID" value={call} onChange={e => setCall(e.target.value.replace(/[^A-Za-z0-9 ._-]/g, "").slice(0, 24))} style={{ ...inputStyle, width: 160 }} />
          </div>
          <div style={{ background: `${GREEN}05`, border: `1px solid ${GREEN}30`, borderRadius: 12, padding: "20px 24px", marginBottom: 28 }}>
            {categories.map((cat, ci) => (
              <div key={ci} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: ELECTRIC, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{cat.name} ({cat.weight}%)</div>
                {cat.criteria.map((cr, cri) => {
                  const v = evalScores[`${ci}-${cri}`];
                  return (
                    <div key={cri} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                      <span style={{ flex: 1, fontSize: 13, color: NAVY }}>{cr.critical && <span style={{ color: "#B91C1C", fontWeight: 700, marginRight: 4 }} title="Auto-fail">*</span>}{cr.text}{cr.def && <span style={{ display: "block", fontSize: 12, color: MUTED }}>{cr.def}</span>}</span>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button aria-pressed={v === true} aria-label={`${cr.text}: yes`} onClick={() => setEval(ci, cri, true)} style={{ padding: "4px 12px", fontSize: 12, fontWeight: 600, borderRadius: 4, border: `1px solid ${v === true ? GREEN : BORDER}`, background: v === true ? GREEN : "#fff", color: v === true ? "#fff" : SLATE, cursor: "pointer" }}>Yes</button>
                        <button aria-pressed={v === false} aria-label={`${cr.text}: no`} onClick={() => setEval(ci, cri, false)} style={{ padding: "4px 12px", fontSize: 12, fontWeight: 600, borderRadius: 4, border: `1px solid ${v === false ? RED : BORDER}`, background: v === false ? RED : "#fff", color: v === false ? "#fff" : SLATE, cursor: "pointer" }}>No</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            {!own && <p style={{ fontSize: 13, color: SLATE }}>{markedCount} of {crit.length} criteria marked. Your score and submission code appear once every criterion is marked.</p>}
            {own && (
              <div style={{ background: "#fff", border: `1px solid ${own.autoFail ? RED : BORDER}`, borderRadius: 8, padding: "16px", marginTop: 8 }}>
                <div style={{ fontSize: 30, fontWeight: 700, color: own.autoFail ? "#B91C1C" : NAVY }}>{own.autoFail ? "Auto-fail" : `${own.score.toFixed(0)}%`}</div>
                <div style={{ fontSize: 12, color: SLATE }}>{own.autoFail ? `An auto-fail criterion was missed. Weighted score before the auto-fail: ${own.score.toFixed(0)}%.` : "Weighted score."} Any pass mark is your program's own; this tool sets none.</div>
                {code ? (
                  <div style={{ marginTop: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: NAVY, display: "block", marginBottom: 4 }} htmlFor="qa-code">Your submission code. Send it to your QA lead.</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input id="qa-code" readOnly value={code} onFocus={e => e.target.select()} style={{ ...inputStyle, flex: 1, fontFamily: "monospace", fontSize: 12 }} />
                      <button onClick={copy} style={{ padding: "6px 14px", fontSize: 12, fontWeight: 600, borderRadius: 4, border: "none", background: NAVY, color: "#fff", cursor: "pointer" }}>{copied ? "Copied" : "Copy"}</button>
                    </div>
                    <p style={{ fontSize: 12, color: SLATE, marginTop: 8 }}>One code per call. To score another call, change the call ID and mark the criteria again. If you are also the QA lead, <button onClick={addMine} style={{ fontSize: 12, fontWeight: 600, color: ELECTRIC, background: "none", border: "none", cursor: "pointer", padding: 0 }}>{added ? "added to your session in step 4" : "add this code to your session in step 4"}</button>.</p>
                  </div>
                ) : <p style={{ fontSize: 12, color: SLATE, marginTop: 10 }}>Enter your initials and the call ID to get your submission code.</p>}
              </div>
            )}
          </div>

          <h2 style={H2}>4. Calibration session</h2>
          <p style={P}>For the QA lead. A session runs in four steps:</p>
          <ol style={{ ...P, paddingLeft: 22 }}>
            <li>Pick 3 or more calls that range from weak to strong. The method measures whether evaluators separate good calls from weak ones, so a set of similar calls reads as low agreement.</li>
            <li>Send each evaluator this form: <button onClick={copyLink} style={{ fontSize: 14, fontWeight: 600, color: ELECTRIC, background: "none", border: "none", cursor: "pointer", padding: 0 }}>{linkCopied ? "evaluator link copied" : "copy the evaluator link"}</button>. It opens this form at step 3, with nothing marked.</li>
            <li>Each evaluator enters their initials and the call ID, marks every criterion, and sends you the code that appears. One code per evaluator per call.</li>
            <li>Paste every code below, one per line. Results stay sealed until every evaluator has scored every call.</li>
          </ol>
          <p style={{ fontSize: 13, color: SLATE, marginBottom: 10 }}>To see how results read first, <button onClick={loadSample} style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC, background: "none", border: "none", cursor: "pointer", padding: 0 }}>load a sample session</button>: three evaluators on three calls, on the General Inbound form.</p>
          <textarea aria-label="Submission codes, one per line" value={session.codes.join("\n")} onChange={e => setSession(s => ({ ...s, codes: e.target.value.split("\n").slice(0, 400) }))} rows={5} style={{ ...inputStyle, width: "100%", fontFamily: "monospace", fontSize: 12, marginBottom: 10 }} placeholder={"One code per line. Each looks like:\n" + example} />
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
            <label htmlFor="qa-ref" style={{ fontSize: 13, color: SLATE }}>Reference evaluator (optional, measures accuracy):</label>
            <select id="qa-ref" value={session.reference} onChange={e => setSession(s => ({ ...s, reference: e.target.value }))} style={{ ...inputStyle, fontSize: 12 }}>
              <option value="">None</option>
              {C.names.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <p style={{ fontSize: 13, color: SLATE, marginBottom: 8 }}>{C.accepted} codes accepted from {C.evaluators} evaluators on {C.calls} calls{C.rejected.length ? `; ${C.rejected.length} set aside` : ""}.</p>
          {C.rejected.map((r, i) => <p key={i} style={{ fontSize: 12, color: "#B91C1C" }}>Line {r.index + 1}: {r.reason}.</p>)}
          {C.rejected.length > 0 && <p style={{ fontSize: 12, color: SLATE, marginBottom: 8 }}>Codes come from step 3: an evaluator marks every criterion for one call and the code appears under their score. A code starts with QA1 and carries this form's fingerprint, {qaFormKey(form)}, so a code scored on a different form is set aside.</p>}
          {!CR && C.calls > 0 && (
            <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 16px", margin: "10px 0 24px" }}>
              <p style={{ fontSize: 13, color: NAVY, fontWeight: 600, marginBottom: 6 }}>Sealed. Results appear once every evaluator has scored every call{C.raters < MODEL.thresholds.minEvaluators.value ? `, with at least ${MODEL.thresholds.minEvaluators.value} evaluators besides any reference` : ""}.</p>
              {C.status.map(s => <p key={s.call} style={{ fontSize: 12, color: SLATE }}>Call {s.call}: {s.scored} of {s.of} evaluators.</p>)}
            </div>
          )}
          {CR && (
            <div style={{ margin: "10px 0 24px" }}>
              <p style={{ fontSize: 12, color: SLATE, marginBottom: 10 }}>{MODEL.method.name} {MODEL.method.version}. Intervals are {Math.round(MODEL.bootstrap.level * 100)}% bootstrap intervals over calls.{CR.graded ? "" : ` Fewer than ${MODEL.thresholds.minCalls.value} calls: shown, not graded.`}</p>
              <div className="pg" style={{ display: "grid", gridTemplateColumns: `repeat(${CR.measures.length}, 1fr)`, gap: 10, marginBottom: 14 }}>
                {CR.measures.map(m => (
                  <div key={m.id} style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>{m.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: gradeOf(m).color }}>{num(m.value)}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: gradeOf(m).color }}>{gradeOf(m).label}</div>
                    <div style={{ fontSize: 12, color: SLATE, marginTop: 4 }}>{m.interval ? `Interval ${num(m.interval.low)} to ${num(m.interval.high)}. ` : ""}Percent agreement {m.agreement === null ? "n/a" : Math.round(m.agreement * 100) + "%"}{m.id === "score" ? " (identical totals)" : ""}.</div>
                  </div>
                ))}
              </div>
              <div className="pg" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Evaluator bias, points against the others</div>
                  {CR.bias.map(b => <p key={b.evaluator} style={{ fontSize: 13, color: SLATE }}>{b.evaluator}: {b.bias >= 0 ? "+" : ""}{b.bias.toFixed(1)}</p>)}
                  {CR.accuracy.map(a => <p key={a.evaluator} style={{ fontSize: 12, color: SLATE }}>{a.evaluator} matches the reference on {Math.round(a.match * 100)}% of marks.</p>)}
                </div>
                <div style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "12px 14px" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Score range by call</div>
                  {CR.spread.map(s => <p key={s.call} style={{ fontSize: 13, color: s.wide ? "#B45309" : SLATE }}>Call {s.call}: {Math.round(s.low)} to {Math.round(s.high)}</p>)}
                </div>
              </div>
            </div>
          )}

          <h2 style={H2}>5. Findings and next step</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
            {Object.keys(SEV_STYLE).map(sv => <span key={sv} style={{ fontSize: 12, fontWeight: 700, color: sevCount(sv) ? "#fff" : SLATE, background: sevCount(sv) ? SEV_STYLE[sv].color : WARM, border: `1px solid ${BORDER}`, padding: "4px 10px", borderRadius: 6 }}>{sevCount(sv)} {SEV_STYLE[sv].label.toLowerCase()}</span>)}
          </div>
          {R.findings.map((f, i) => <Finding key={i} f={f} />)}
          <p style={{ ...P, marginTop: 14, fontWeight: 600, color: NAVY }}>Next step: {NEXT_TEXT[R.next.step]}{nextTool && <> <a href={nextTool.href} style={{ color: ELECTRIC }}>Open {nextTool.name}</a>.</>}</p>

          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "24px 28px", margin: "24px 0" }}>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", lineHeight: 1.65, margin: 0 }}>
              <strong style={{ color: "#fff" }}>One form per contact type.</strong> A password reset and a billing dispute call for different criteria. One form for every contact type is either too generic for complex calls or penalizes simple calls for criteria that do not apply. Build a form for each contact type, complexity or risk level, and weight what matters for each.
            </p>
          </div>

          <ReportActions next={R.next && R.next.tool ? { to: R.next.tool, because: "Test whether the scores track the repeat contacts they should prevent." } : null}
            toolId={TOOL_ID}
            toolName="QA Scorecard"
            subtitle={TEMPLATES[template].name + " Contact Type"}
            routePath={ROUTE}
            state={{ template, categories, evalScores, evaluator, call, session }}
            defaults={DEFAULTS}
            summary={[
              { label: "Criteria", value: String(L.criteria) },
              { label: "Form findings", value: String(L.findings.length) },
              { label: "Calibration", value: CR ? CR.measures.map(m => gradeOf(m).label).join(", ") : C.calls ? "Sealed" : "Not run" },
              { label: "Next step", value: STEP_LABEL[R.next.step] },
            ]}
            sections={[
              { title: "Scorecard Structure", type: "table", rows: categories.map(c => [c.name, "Weight " + c.weight + "%, " + c.criteria.length + " criteria (" + c.criteria.filter(cr => cr.critical).length + " auto-fail)"]) },
              { title: "Criteria and Definitions", type: "findings", items: crit.length ? crit.map(c => c.category + ": " + c.text + (c.critical ? " [auto-fail" + (c.reason ? ", " + MODEL.reasons.find(r => r.id === c.reason).label.toLowerCase() : "") + "]" : "") + ". " + (c.def ? c.def : "No definition.")) : ["No criteria."] },
              { title: "What the Form Measures", type: "metrics", items: L.mix.map(m => ({ label: m.label, value: pct(m.weight), color: ELECTRIC })) },
              ...(CR ? [{ title: "Calibration", type: "table", rows: [
                ...CR.measures.map(m => [m.label, num(m.value) + ", " + gradeOf(m).label + (m.interval ? ", interval " + num(m.interval.low) + " to " + num(m.interval.high) : "") + ", percent agreement " + (m.agreement === null ? "n/a" : Math.round(m.agreement * 100) + "%")]),
                ...CR.bias.map(b => ["Bias, " + b.evaluator, (b.bias >= 0 ? "+" : "") + b.bias.toFixed(1) + " points against the others"]),
                ["Session", C.raters + " evaluators on " + C.calls + " calls" + (C.reference ? ", reference " + C.reference : "")],
              ] }] : []),
              ...(own ? [{ title: "Your Evaluation", type: "findings", items: [(own.autoFail ? "Auto-fail. Weighted score before the auto-fail: " : "Weighted score: ") + own.score.toFixed(1) + "%" + (L.total === 100 ? "." : ". Weights do not total 100%, so this score cannot be compared with another form's.")] }] : []),
              { title: "Findings", type: "actions", items: R.findings.length ? R.findings.map(f => ({ action: f.action, detail: SEV_STYLE[f.severity].label + ". " + whyOf(f), priority: f.severity === "critical" || f.severity === "high" ? "high" : "medium" })) : [{ action: "No published rule raises a finding.", detail: "Keep calibrating on a regular cycle; agreement drifts.", priority: "medium" }] },
              { title: "Next Step", type: "text", content: NEXT_TEXT[R.next.step] },
              { title: "What This Tool Cannot Tell You", type: "findings", items: MODEL.limits },
              { title: "Method", type: "text", content: MODEL.method.name + " " + MODEL.method.version + ". " + MODEL.method.summary + " Published at contactcentercx.com" + MODEL.methodology + "." },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
