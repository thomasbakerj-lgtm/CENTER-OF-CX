import { useState, useEffect } from "react";
import { ToolFrame } from "./src/lib/ToolFrame.jsx";
import { Result, Button } from "./src/lib/ui.jsx";
import { K, Paper, StatementStep, DimensionBars, Tile, frameMethod } from "./src/lib/frameKit.jsx";
import { methodStamp } from "./src/lib/methodVersions.js";
import { scoreRubric, bandFor } from "./src/lib/rubric";
import { TRANSFORMATION_READINESS as RUBRIC } from "./src/lib/rubrics/transformationReadiness";
import { JOURNEY } from "./src/lib/journey";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT_IMPORT_CSS } from "./src/lib/type";

/* Band colours print in the PDF only; on the page a band is a word. */
const ELECTRIC = "#0088DD"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444"; const MUTED = "#5B6E88";
const BAND_COLORS = { notready: RED, early: "#DC6B00", developing: AMBER, ready: "#7CB342", strong: GREEN };
/* The statements, bands, per-dimension flags and next diagnostics live in the published
   rubric; this file only presents them. See transformationReadiness and RUBRIC.methodology. */
const DIMS = RUBRIC.dims.map(d => ({ id: d.id, name: d.name, next: d.next, qs: d.criteria.map(c => ({ q: c.text })) }));
const toolOf = (id) => JOURNEY[id] ? { name: JOURNEY[id].name, href: JOURNEY[id].route } : null;

const TOOL_ID = "transformation-readiness";
const ROUTE = "/tools/transformation-readiness";
export const DEFAULTS = { scores: {} };
/* A complete set of mid-scale answers. The floor harness renders it to prove the
   results page and its PDF content build without a gate and without a missing field. */
export const SAMPLE = { scores: Object.fromEntries(DIMS.flatMap(d => d.qs.map((_, i) => [`${d.id}-${i}`, 3]))) };
/* An answer is kept only if it is a whole number on the 1 to 5 scale. A link
   carrying anything else opens the unanswered question, never a scored result. */
const cleanScores = (sc) => Object.fromEntries(Object.entries(sc && typeof sc === "object" ? sc : {})
  .filter(([k, v]) => /^[a-z0-9-]+$/i.test(k) && Number.isInteger(v) && v >= 1 && v <= 5));
const isComplete = (scores) => scoreRubric(RUBRIC, scores).complete;

export default function TransformationReadiness() {
  const [init] = useState(() => { const sc = readScenario(TOOL_ID, DEFAULTS); return { scores: cleanScores(sc && sc.scores) }; });
  const [phase, setPhase] = useState(() => (isComplete(init.scores) ? "results" : "intro"));
  const [currentDim, setCurrentDim] = useState(0);
  const [scores, setScores] = useState(init.scores);
  useEffect(() => { window.scrollTo(0, 0); }, [phase]);
  useEffect(() => { clearScenarioParam(); }, []);

  const setScore = (id,qi,v) => setScores(prev=>({...prev,[`${id}-${qi}`]:v}));
  /* Every score, band, flag, checklist action and the next diagnostic come from the one
     rubric engine, so the page, the PDF and the published rubric cannot disagree. */
  const R = scoreRubric(RUBRIC, scores);
  const dimOf = (id) => R.dims.find(d => d.id === id);
  const dimScore = (id) => dimOf(id).score || 0;
  const dimComplete = (id) => dimOf(id).complete;
  const allComplete = R.complete;
  const overallScore = R.overall || 0;
  const tier = R.band ? { ...R.band, tier: R.band.label, color: BAND_COLORS[R.band.id] } : { tier: "", color: MUTED, desc: "" };
  const flagOf = (id) => bandFor(RUBRIC, dimScore(id)).dimFlag || null;
  const byWeakest = [...DIMS].sort((a, b) => dimScore(a.id) - dimScore(b.id) || DIMS.indexOf(a) - DIMS.indexOf(b));
  const gaps = byWeakest.filter(d => flagOf(d.id));
  const next = R.nextDiagnostic && toolOf(R.nextDiagnostic.tool) ? { ...toolOf(R.nextDiagnostic.tool), because: dimOf(R.nextDiagnostic.because).name } : null;
  const labels = ["","Strongly Disagree","Disagree","Neutral","Agree","Strongly Agree"];

  const handleStart = () => setPhase("assess");
  const handleResults = () => setPhase("results");

  const sorted = [...DIMS].sort((a, b) => dimScore(b.id) - dimScore(a.id));
  const answered = Object.keys(scores).length, total = DIMS.reduce((n, d) => n + d.qs.length, 0);
  const result = phase === "results"
    ? <Result label="Readiness" value={overallScore.toFixed(1) + " / 5"} change={`${tier.tier}. ${tier.desc}`} />
    : <Result label="Statements answered" value={`${answered} of ${total}`} change="The score, band and checklist appear once every statement is answered." />;
  return (
    <ToolFrame toolId={TOOL_ID} choice={R.nextDiagnostic ? R.nextDiagnostic.tool : null} section="Assessments + Scorecards" name="Transformation Readiness Scorecard" title="Is your organization ready to commit to this transformation?"
      lede="Decide whether to commit budget to a platform change. Rate 6 dimensions, from leadership to change management, and get a phased recommendation plus the tool to use for each gap you need to close first."
      method={frameMethod(methodStamp(TOOL_ID))} result={result} pinned={phase === "results" ? { label: "Readiness", value: overallScore.toFixed(1) + " / 5" } : null}>
      <style>{FONT_IMPORT_CSS}</style>

      {phase === "intro" && (
        <section aria-label="Start" style={K.lead}>
          <p style={K.body}>Rate each statement from 1 (strongly disagree) to 5 (strongly agree). Nothing is scored until every statement is answered.</p>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginTop: 16 }}>
            <Button onClick={handleStart}>Start the assessment</Button>
            <a href={RUBRIC.methodology} style={K.link}>See the published rubric: every statement, band and action</a>
          </div>
        </section>
      )}

      {phase === "assess" && (
        <StatementStep dims={DIMS} current={currentDim} setCurrent={setCurrentDim} scores={scores} setScore={setScore} done={dimComplete} complete={allComplete} onResults={handleResults}
          prompt="Rate each statement from 1 (strongly disagree) to 5 (strongly agree) for how your organization works today." />
      )}

      {phase === "results" && (<>
        <section aria-label="Your readiness band" style={K.lead}>
          <span style={K.kicker}>Your readiness band</span>
          <div style={K.stat}>{tier.tier} · {overallScore.toFixed(1)} / 5.0</div>
          <p style={{ ...K.body, color: K.strong.color, fontWeight: 600, marginTop: 8 }}>{tier.desc}</p>
        </section>

        <section aria-label="Dimension scores, weakest first" style={K.panel}>
          <h2 style={K.h2}>Dimension scores, weakest first</h2>
          {byWeakest.map(d => {
            const sc = dimScore(d.id); const flag = flagOf(d.id); const close = flag === "Close this gap"; const tool = toolOf(d.next);
            return (<div key={d.id} style={{ padding: "12px 0", borderTop: `1px solid ${K.hair}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ ...K.strong, fontSize: 15 }}>{d.name}</span>
                  {flag && <span style={{ fontSize: 12, fontWeight: 700, color: K.strong.color, padding: "2px 8px", borderRadius: 4, border: close ? `1.5px solid ${K.strong.color}` : `1px dashed ${K.soft}` }}>{flag}</span>}
                </span>
                <span style={{ ...K.strong, fontSize: 18, ...K.num }}>{sc.toFixed(1)}<span style={K.small}> / 5</span></span>
              </div>
              <div role="img" aria-label={`${d.name} ${sc.toFixed(1)} of 5`} style={{ height: 6, background: K.hair, borderRadius: 3, overflow: "hidden", maxWidth: 360 }}>
                <div style={{ height: "100%", width: `${(sc / 5) * 100}%`, background: K.shade(0), borderRadius: 3 }} />
              </div>
              {flag && tool && <a href={tool.href} style={{ ...K.link, display: "inline-block", marginTop: 10 }}>Next for this gap: {tool.name}</a>}
            </div>);
          })}
        </section>

        <section aria-label="Your action checklist" style={K.panel}>
          <h2 style={K.h2}>Your action checklist</h2>
          {R.checklist.length === 0 ? (
            <p style={K.body}>No statement was answered at {RUBRIC.failAt} or below, so the rubric raises no action. Your lowest-scoring dimension is still the place to look first.</p>
          ) : R.checklist.map((c, i) => (
            <div key={c.criterion} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderTop: `1px solid ${K.hair}` }}>
              <span style={{ ...K.strong, ...K.num, width: 22, flexShrink: 0 }}>{i + 1}</span>
              <div>
                <div style={{ ...K.strong, fontSize: 15, lineHeight: "22px" }}>{c.action}</div>
                <div style={{ ...K.small, marginTop: 3 }}>{c.dimensionName}: you answered {c.score} of 5 to "{c.text}"</div>
              </div>
            </div>
          ))}
          {next && (
            <p style={{ ...K.body, marginTop: 14 }}>Next diagnostic: <a href={next.href} style={K.link}>{next.name}</a>, because {next.because} is your lowest-scoring dimension.</p>
          )}
          <p style={{ ...K.small, marginTop: 14 }}>Scored on the <a href={RUBRIC.methodology} style={K.link}>published rubric</a>, version {RUBRIC.version}. {RUBRIC.limits[0]} {RUBRIC.limits[2]}</p>
        </section>

        <div style={K.grid(240)}>
          <section aria-label="Sequence the gap closure" style={K.panel}>
            <h2 style={K.h2}>Sequence the gap closure</h2>
            <p style={{ ...K.small, marginBottom: 12 }}>A working session with a consultant to put these gaps in order and build the readiness plan before you commit budget.</p>
            <Button href="/contact">Request a working session</Button>
          </section>
          <section aria-label="Starting vendor evaluation" style={K.panel}>
            <h2 style={K.h2}>Starting vendor evaluation?</h2>
            <p style={{ ...K.small, marginBottom: 12 }}>Once you reach the Ready band, Vendor Match can build a starting shortlist from your environment and priorities. Its method is published with the result.</p>
            <Button kind="secondary" href="/tools/vendor-match">Open Vendor Match</Button>
          </section>
        </div>
        <Paper>
          <ReportActions next={R.nextDiagnostic ? { to: R.nextDiagnostic.tool, because: next ? next.because + " is your lowest-scoring dimension." : null } : null} toolId={TOOL_ID} toolName="Transformation Readiness Scorecard" subtitle={"Score: " + overallScore.toFixed(1) + "/5, " + tier.tier} routePath={ROUTE} state={{ scores }} defaults={DEFAULTS}
            summary={[{ label: "Readiness score", value: overallScore.toFixed(1) + "/5" }, { label: "Readiness band", value: tier.tier }, { label: "Gaps flagged", value: String(gaps.length) }]}
            sections={[
              { title: "Dimension Scores", type: "table", rows: byWeakest.map(d => [d.name, dimScore(d.id).toFixed(1) + "/5" + (flagOf(d.id) ? " (" + flagOf(d.id) + ")" : "")]) },
              { title: "Assessment", type: "metrics", items: [
                { label: "Readiness", value: overallScore.toFixed(1) + "/5", color: tier.color },
                { label: "Band", value: tier.tier, color: tier.color },
              ]},
              { title: "Recommendation", type: "text", content: tier.desc },
              { title: "Action Checklist", type: "actions", items: R.checklist.length ? R.checklist.map((c, i) => ({ action: c.action, detail: c.dimensionName + ": answered " + c.score + " of 5 to \"" + c.text + "\"", priority: i < 3 ? "high" : "medium" })) : [{ action: "No statement was answered at " + RUBRIC.failAt + " or below, so the rubric raises no action.", detail: "Your lowest-scoring dimension is still the place to look first.", priority: "medium" }] },
              { title: "Gaps to Close", type: "findings", items: gaps.length ? gaps.map(d => d.name + " (" + dimScore(d.id).toFixed(1) + "/5, " + flagOf(d.id).toLowerCase() + ")" + (toolOf(d.next) ? ": next, " + toolOf(d.next).name : "")) : ["No dimension scores below the Ready band."] },
              { title: "What This Assessment Cannot Tell You", type: "findings", items: RUBRIC.limits },
              { title: "Method", type: "text", content: RUBRIC.title + " rubric version " + RUBRIC.version + ", published at contactcentercx.com" + RUBRIC.methodology + ". Each dimension scores the average of its statements on a 1 to 5 scale. The overall score is the average of the six dimensions, weighted equally. A dimension below 2.5 is marked Close this gap and one from 2.5 to below 3.5 is marked Monitor. Every statement answered at " + RUBRIC.failAt + " or below adds its action to the checklist, weakest dimension first." },
            ]} />
        </Paper>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button kind="secondary" href="/tools/platform-decision">Platform Decision</Button>
          <Button kind="secondary" href="/tools/contract-risk">Contract Risk Scanner</Button>
        </div>
      </>)}
    </ToolFrame>
  );
}
