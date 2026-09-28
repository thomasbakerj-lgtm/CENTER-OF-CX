import { useState, useEffect } from "react";
import { ToolFrame } from "./src/lib/ToolFrame.jsx";
import { Result, Button } from "./src/lib/ui.jsx";
import { K, Paper, Group, Choice, numInput, selectStyle, optionCss, frameMethod } from "./src/lib/frameKit.jsx";
import { methodStamp } from "./src/lib/methodVersions.js";
import { TOUCH, RADIUS } from "./src/lib/tokens.js";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam, encodeScenario } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";
import { JOURNEY } from "./src/lib/journey";
import { QA_SCORECARD as MODEL } from "./src/lib/rubrics/qaScorecard";
import { qaCriteria, qaFormKey, scoreEvaluation, encodeSubmission, reviewQA, qaThresholdVars } from "./src/lib/qa";

/* A severity or a grade is a word on the page. The PDF's metric tiles keep their one colour. */
const ELECTRIC = "#0088DD";
const SEV_STYLE = { critical: { label: "Critical" }, high: { label: "High" }, medium: { label: "Medium" }, info: { label: "Note" } };
const GRADE = { reliable: { label: "Reliable" }, tentative: { label: "Tentative" }, unreliable: { label: "Not reliable" }, inconclusive: { label: "Inconclusive" }, unanimous: { label: "Unanimous" }, undefined: { label: "Not measurable" } };
const TV = qaThresholdVars(MODEL);
const fill = (t) => t.replace(/\{(\w+)\}/g, (_, k) => (TV[k] === undefined ? "" : String(TV[k])));
const whyOf = (f) => f.title + ": " + fill(MODEL.rules[f.rule].test) + (MODEL.rules[f.rule].heuristic ? " Heuristic threshold." : "");
const gradeOf = (m) => m.grade ? GRADE[m.grade] : { label: "Not graded" };
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

const inputStyle = { ...numInput, marginTop: 0, fontVariantNumeric: "normal", fontWeight: 500, fontSize: 15 };
const textLink = { ...K.link, background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit" };
const chip = (sv) => ({ display: "inline-block", fontFamily: FONT, fontSize: 13, fontWeight: 700, padding: "3px 10px", borderRadius: RADIUS.chip, border: `${sv === "critical" ? 2 : 1}px ${sv === "info" ? "dashed" : "solid"} ${sv === "critical" || sv === "high" ? K.strong.color : K.firm}`, color: K.strong.color, flexShrink: 0, minWidth: 72, textAlign: "center" });

function Finding({ f }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderTop: `1px solid ${K.hair}` }}>
      <span style={chip(f.severity)}>{SEV_STYLE[f.severity].label}</span>
      <div>
        <div style={{ ...K.strong, fontSize: 15, lineHeight: "22px" }}>{f.action}</div>
        <div style={{ ...K.small, marginTop: 3 }}>{whyOf(f)}</div>
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
    form: "Fix the critical and high form findings first. Until the form passes these checks, its scores are hard to defend, however well evaluators agree.",
    calibrate: "Run a blind calibration session: have at least two evaluators score the same calls with this form, then paste their codes below.",
    recalibrate: "Reword the flagged criteria, brief evaluators on the definitions and run another blind session before scores feed coaching or pay.",
    outcome: "The form passes its checks and evaluators agree. The next test is whether the scores move with customer outcomes, such as repeat contacts.",
  };
  const STEP_LABEL = { form: "Fix the form", calibrate: "Calibrate", recalibrate: "Calibrate again", outcome: "Test against outcomes" };
  const sevCount = (s) => R.bySeverity[s];
  const pct = (w) => (L.total > 0 ? Math.round((w / L.total) * 100) : 0) + "%";

  const result = <Result label="Next step" value={STEP_LABEL[R.next.step]} change={`${L.criteria} criteria, ${L.findings.length} form finding${L.findings.length === 1 ? "" : "s"}. Calibration: ${CR ? CR.measures.map(m => gradeOf(m).label).join(", ") : C.calls ? "sealed" : "not run"}.`} />;

  return (
    <ToolFrame toolId={TOOL_ID} choice={R.next.tool || null} section="Performance + Quality" name="QA Scorecard Builder" title="Does your QA form produce scores you can defend?"
      lede="Build a weighted QA (quality assurance) form for one contact type, check that it produces scores you can defend, and calibrate your evaluators blind: each scores the same calls alone, and nothing is compared until everyone has scored."
      method={frameMethod(methodStamp(TOOL_ID))} result={result} pinned={{ label: "Next step", value: STEP_LABEL[R.next.step] }}>
      <style>{FONT_IMPORT_CSS + optionCss("qa-sel")}</style>
      <p style={K.small}>Every rule, cut point and source is published in the <a href={MODEL.methodology} style={K.link}>QA method</a>.</p>

      <Group legend="Start from a contact type">
        <Choice label="Form template" options={Object.entries(TEMPLATES).map(([k, v]) => [k, v.name])} value={template} onPick={applyTemplate} />
        <p style={{ ...K.strong, fontSize: 14, marginTop: 12 }}>Total weight: {L.total}%{L.total !== 100 ? ". Must equal 100%." : ""}</p>
      </Group>

      <section aria-label="1. The form" style={K.panel}>
        <h2 style={K.h2}>1. The form</h2>
        <p style={{ ...K.body, marginBottom: 14 }}>Each criterion needs a definition of what earns a yes and a tag for what it measures. An auto-fail criterion, one whose miss fails the whole evaluation, also needs the reason it must be one.</p>
        {categories.map((cat, ci) => (
          <div key={ci} style={{ ...K.box, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", paddingBottom: 10, borderBottom: `1px solid ${K.hair}` }}>
              <input type="text" aria-label={`Category ${ci + 1} name`} value={cat.name} onChange={e => updateCatName(ci, e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 180, fontWeight: 600 }} />
              <label style={{ ...K.small, display: "flex", alignItems: "center", gap: 6 }}>Weight
                <input type="number" aria-label={`${cat.name} weight, percent`} value={cat.weight} onChange={e => updateWeight(ci, e.target.value)} style={{ ...inputStyle, width: 76, textAlign: "center", fontVariantNumeric: "tabular-nums" }} /> %
              </label>
              <button type="button" aria-label={`Remove category ${cat.name}`} onClick={() => removeCategory(ci)} style={{ ...textLink, minHeight: TOUCH }}>Remove</button>
            </div>
            {cat.criteria.map((cr, cri) => (
              <div key={cri} style={{ padding: "10px 0", borderBottom: cri < cat.criteria.length - 1 ? `1px solid ${K.hair}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <input type="text" aria-label={`${cat.name} criterion ${cri + 1}`} value={cr.text} onChange={e => updateCriterion(ci, cri, "text", e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 180 }} />
                  <label style={{ ...K.small, color: K.strong.color, fontWeight: cr.critical ? 700 : 500, display: "flex", alignItems: "center", gap: 6, cursor: "pointer", minHeight: TOUCH, flexShrink: 0 }}>
                    <input type="checkbox" checked={cr.critical} onChange={e => updateCriterion(ci, cri, "critical", e.target.checked)} style={{ width: 18, height: 18 }} /> Auto-fail
                  </label>
                  <button type="button" aria-label={`Remove ${cat.name} criterion ${cri + 1}`} onClick={() => removeCriterion(ci, cri)} style={{ ...textLink, minWidth: TOUCH, minHeight: TOUCH, fontSize: 18 }}>×</button>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                  <input type="text" aria-label={`${cat.name} criterion ${cri + 1} definition`} placeholder="What earns a yes" value={cr.def} onChange={e => updateCriterion(ci, cri, "def", e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 200, fontSize: 14 }} />
                  <select className="qa-sel" aria-label={`${cat.name} criterion ${cri + 1} measures`} value={cr.focus} onChange={e => updateCriterion(ci, cri, "focus", e.target.value)} style={{ ...selectStyle, width: "auto", fontSize: 14 }}>
                    <option value="">Measures...</option>
                    {MODEL.focus.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                  {cr.critical && (
                    <select className="qa-sel" aria-label={`${cat.name} criterion ${cri + 1} auto-fail reason`} value={cr.reason} onChange={e => updateCriterion(ci, cri, "reason", e.target.value)} style={{ ...selectStyle, width: "auto", fontSize: 14 }}>
                      <option value="">Auto-fail reason...</option>
                      {MODEL.reasons.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                    </select>
                  )}
                </div>
              </div>
            ))}
            <button type="button" onClick={() => addCriterion(ci)} style={{ ...textLink, minHeight: TOUCH, marginTop: 4 }}>+ Add criterion</button>
          </div>
        ))}
        <Button kind="secondary" onClick={addCategory} style={{ width: "100%" }}>+ Add Category</Button>
      </section>

      <section aria-label="2. Form check" style={K.panel}>
        <h2 style={K.h2}>2. Form check</h2>
        <p style={{ ...K.body, marginBottom: 12 }}>What this form measures, by share of its weight. It is shown as a fact only, because no source sets a right mix.</p>
        <div style={{ ...K.grid(150), marginBottom: 14 }}>
          {L.mix.map(m => (
            <div key={m.focus} style={K.box}>
              <div style={{ ...K.strong, ...K.num, fontSize: 24 }}>{pct(m.weight)}</div>
              <div style={K.small}>{m.label}</div>
            </div>
          ))}
        </div>
        {L.findings.length ? L.findings.map((f, i) => <Finding key={i} f={f} />) : <p style={{ ...K.body, color: K.strong.color, fontWeight: 600 }}>The form passes every published check.</p>}
      </section>

      <section aria-label="3. Score a call" style={K.panel}>
        <h2 id="score" style={K.h2}>3. Score a call</h2>
        <p style={{ ...K.body, marginBottom: 12 }}>For each evaluator in a calibration session: enter your initials and the call ID, mark every criterion, then send your submission code to your QA lead. You see only your own score. Nobody sees how it compares until every evaluator has scored every call.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <input type="text" aria-label="Your initials" placeholder="Your initials" value={evaluator} onChange={e => setEvaluator(e.target.value.replace(/[^A-Za-z0-9 ._-]/g, "").slice(0, 24))} style={{ ...inputStyle, width: 170 }} />
          <input type="text" aria-label="Call ID" placeholder="Call ID" value={call} onChange={e => setCall(e.target.value.replace(/[^A-Za-z0-9 ._-]/g, "").slice(0, 24))} style={{ ...inputStyle, width: 170 }} />
        </div>
        {categories.map((cat, ci) => (
          <div key={ci} style={{ marginBottom: 14 }}>
            <div style={{ ...K.kicker, marginBottom: 6 }}>{cat.name} ({cat.weight}%)</div>
            {cat.criteria.map((cr, cri) => {
              const v = evalScores[`${ci}-${cri}`];
              return (
                <div key={cri} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", flexWrap: "wrap" }}>
                  <span style={{ ...K.body, color: K.strong.color, flex: 1, minWidth: 200 }}>{cr.critical && <strong title="Auto-fail" style={{ marginRight: 4 }}>Auto-fail:</strong>}{cr.text}{cr.def && <span style={{ ...K.small, display: "block" }}>{cr.def}</span>}</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[[true, "Yes"], [false, "No"]].map(([val, l]) => (
                      <button key={l} type="button" aria-pressed={v === val} aria-label={`${cr.text}: ${l.toLowerCase()}`} onClick={() => setEval(ci, cri, val)} style={{ minHeight: TOUCH, minWidth: 64, padding: "0 12px", fontFamily: FONT, fontSize: 14, fontWeight: v === val ? 700 : 500, borderRadius: RADIUS.field, border: `${v === val ? 2 : 1}px solid ${v === val ? K.strong.color : K.firm}`, background: v === val ? K.shade(0) : "transparent", color: K.strong.color, cursor: "pointer" }}>{v === val ? "\u2713 " : ""}{l}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        {!own && <p style={K.small}>{markedCount} of {crit.length} criteria marked. Your score and submission code appear once every criterion is marked.</p>}
        {own && (
          <div style={{ ...K.box, border: `${own.autoFail ? 2 : 1}px solid ${own.autoFail ? K.strong.color : K.hair}`, marginTop: 8 }}>
            <div style={{ ...K.stat }}>{own.autoFail ? "Auto-fail" : `${own.score.toFixed(0)}%`}</div>
            <div style={K.small}>{own.autoFail ? `An auto-fail criterion was missed. Weighted score before the auto-fail: ${own.score.toFixed(0)}%.` : "Weighted score."} Any pass mark is your program's own; this tool sets none.</div>
            {code ? (
              <div style={{ marginTop: 12 }}>
                <label style={{ ...K.strong, fontSize: 14, display: "block", marginBottom: 6 }} htmlFor="qa-code">Your submission code. Send it to your QA lead.</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input id="qa-code" readOnly value={code} onFocus={e => e.target.select()} style={{ ...inputStyle, flex: 1, minWidth: 200, fontFamily: "monospace", fontSize: 13 }} />
                  <Button kind="secondary" onClick={copy}>{copied ? "Copied" : "Copy"}</Button>
                </div>
                <p style={{ ...K.small, marginTop: 8 }}>One code per call. To score another call, change the call ID and mark the criteria again. If you are also the QA lead, <button type="button" onClick={addMine} style={textLink}>{added ? "added to your session in step 4" : "add this code to your session in step 4"}</button>.</p>
              </div>
            ) : <p style={{ ...K.small, marginTop: 10 }}>Enter your initials and the call ID to get your submission code.</p>}
          </div>
        )}
      </section>

      <section aria-label="4. Calibration session" style={K.panel}>
        <h2 style={K.h2}>4. Calibration session</h2>
        <p style={K.body}>For the QA lead. A session runs in four steps:</p>
        <ol style={{ ...K.body, paddingLeft: 22, margin: "8px 0 12px" }}>
          <li>Pick 3 or more calls that range from weak to strong. The method measures whether evaluators tell good calls from weak ones, so a set of similar calls reads as low agreement.</li>
          <li>Send each evaluator this form: <button type="button" onClick={copyLink} style={textLink}>{linkCopied ? "evaluator link copied" : "copy the evaluator link"}</button>. It opens this form at step 3, with nothing marked.</li>
          <li>Each evaluator enters their initials and the call ID, marks every criterion, and sends you the code that appears. One code per evaluator per call.</li>
          <li>Paste every code below, one per line. Results stay sealed until every evaluator has scored every call.</li>
        </ol>
        <p style={{ ...K.small, marginBottom: 10 }}>To see how results read first, <button type="button" onClick={loadSample} style={textLink}>load a sample session</button>: three evaluators on three calls, on the General Inbound form.</p>
        <textarea aria-label="Submission codes, one per line" value={session.codes.join("\n")} onChange={e => setSession(s => ({ ...s, codes: e.target.value.split("\n").slice(0, 400) }))} rows={5} style={{ ...inputStyle, width: "100%", padding: "10px 12px", fontFamily: "monospace", fontSize: 13, marginBottom: 10 }} placeholder={"One code per line. Each looks like:\n" + example} />
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
          <label htmlFor="qa-ref" style={K.small}>Reference evaluator (optional, measures accuracy):</label>
          <select id="qa-ref" className="qa-sel" value={session.reference} onChange={e => setSession(s => ({ ...s, reference: e.target.value }))} style={{ ...selectStyle, width: "auto", fontSize: 14 }}>
            <option value="">None</option>
            {C.names.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <p style={{ ...K.small, marginBottom: 8 }}>{C.accepted} codes accepted from {C.evaluators} evaluators on {C.calls} calls{C.rejected.length ? `; ${C.rejected.length} set aside` : ""}.</p>
        {C.rejected.map((r, i) => <p key={i} style={{ ...K.small, color: K.strong.color }}><strong>Set aside.</strong> Line {r.index + 1}: {r.reason}.</p>)}
        {C.rejected.length > 0 && <p style={{ ...K.small, marginBottom: 8 }}>Codes come from step 3: an evaluator marks every criterion for one call and the code appears under their score. A code starts with QA1 and carries this form's fingerprint, {qaFormKey(form)}, so a code scored on a different form is set aside.</p>}
        {!CR && C.calls > 0 && (
          <div style={{ ...K.box, margin: "10px 0 0" }}>
            <p style={{ ...K.strong, fontSize: 14, marginBottom: 6 }}>Sealed. Results appear once every evaluator has scored every call{C.raters < MODEL.thresholds.minEvaluators.value ? `, with at least ${MODEL.thresholds.minEvaluators.value} evaluators besides any reference` : ""}.</p>
            {C.status.map(st => <p key={st.call} style={K.small}>Call {st.call}: {st.scored} of {st.of} evaluators.</p>)}
          </div>
        )}
        {CR && (
          <div style={{ marginTop: 10 }}>
            <p style={{ ...K.small, marginBottom: 10 }}>{MODEL.method.name} {MODEL.method.version}. Intervals are {Math.round(MODEL.bootstrap.level * 100)}% bootstrap intervals over calls.{CR.graded ? "" : ` Fewer than ${MODEL.thresholds.minCalls.value} calls, so the measures are shown but not graded.`}</p>
            <div style={{ ...K.grid(180), marginBottom: 14 }}>
              {CR.measures.map(m => (
                <div key={m.id} style={K.box}>
                  <div style={{ ...K.strong, fontSize: 13 }}>{m.label}</div>
                  <div style={{ ...K.strong, ...K.num, fontSize: 24 }}>{num(m.value)}</div>
                  <div style={{ ...K.strong, fontSize: 13 }}>{gradeOf(m).label}</div>
                  <div style={{ ...K.small, marginTop: 4 }}>{m.interval ? `Interval ${num(m.interval.low)} to ${num(m.interval.high)}. ` : ""}Percent agreement {m.agreement === null ? "n/a" : Math.round(m.agreement * 100) + "%"}{m.id === "score" ? " (identical totals)" : ""}.</div>
                </div>
              ))}
            </div>
            <div style={K.grid(240)}>
              <div style={K.box}>
                <div style={{ ...K.strong, fontSize: 13, marginBottom: 6 }}>Evaluator bias, points against the others</div>
                {CR.bias.map(b => <p key={b.evaluator} style={K.body}>{b.evaluator}: {b.bias >= 0 ? "+" : ""}{b.bias.toFixed(1)}</p>)}
                {CR.accuracy.map(a => <p key={a.evaluator} style={K.small}>{a.evaluator} matches the reference on {Math.round(a.match * 100)}% of marks.</p>)}
              </div>
              <div style={K.box}>
                <div style={{ ...K.strong, fontSize: 13, marginBottom: 6 }}>Score range by call</div>
                {CR.spread.map(sp => <p key={sp.call} style={{ ...K.body, fontWeight: sp.wide ? 700 : 400 }}>Call {sp.call}: {Math.round(sp.low)} to {Math.round(sp.high)}{sp.wide ? ", wide" : ""}</p>)}
              </div>
            </div>
          </div>
        )}
      </section>

      <section aria-label="5. Findings and next step" style={K.panel}>
        <h2 style={K.h2}>5. Findings and next step</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          {Object.keys(SEV_STYLE).map(sv => <span key={sv} style={chip(sv)}>{sevCount(sv)} {SEV_STYLE[sv].label.toLowerCase()}</span>)}
        </div>
        {R.findings.map((f, i) => <Finding key={i} f={f} />)}
        <p style={{ ...K.body, marginTop: 14, fontWeight: 600, color: K.strong.color }}>Next step: {NEXT_TEXT[R.next.step]}{nextTool && <> <a href={nextTool.href} style={K.link}>Open {nextTool.name}</a>.</>}</p>
      </section>

      <section aria-label="One form per contact type" style={K.lead}>
        <p style={K.body}><strong style={{ color: K.strong.color }}>One form per contact type.</strong> A password reset and a billing dispute call for different criteria. A single form for every contact type ends up too generic for complex calls, or it marks simple calls down for criteria that do not apply. Build a form for each contact type, complexity or risk level, and weight what matters for each.</p>
      </section>

      <Paper>
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
              { title: "Findings", type: "actions", items: R.findings.length ? R.findings.map(f => ({ action: f.action, detail: SEV_STYLE[f.severity].label + ". " + whyOf(f), priority: f.severity === "critical" || f.severity === "high" ? "high" : "medium" })) : [{ action: "No published rule raises a finding.", detail: "Keep calibrating on a regular cycle. Agreement drifts over time.", priority: "medium" }] },
              { title: "Next Step", type: "text", content: NEXT_TEXT[R.next.step] },
              { title: "What This Tool Cannot Tell You", type: "findings", items: MODEL.limits },
              { title: "Method", type: "text", content: MODEL.method.name + " " + MODEL.method.version + ". " + MODEL.method.summary + " Published at contactcentercx.com" + MODEL.methodology + "." },
            ]}
          />
      </Paper>
    </ToolFrame>
  );
}
