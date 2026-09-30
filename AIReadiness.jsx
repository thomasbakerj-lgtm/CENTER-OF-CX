import { useState, useEffect } from "react";
import { ToolFrame } from "./src/lib/ToolFrame.jsx";
import { Result, Button } from "./src/lib/ui.jsx";
import { K, Paper, StatementStep, DimensionBars, Tile, frameMethod } from "./src/lib/frameKit.jsx";
import { methodStamp } from "./src/lib/methodVersions.js";
import { scoreRubric, bandFor } from "./src/lib/rubric";
import { AI_READINESS as RUBRIC } from "./src/lib/rubrics/aiReadiness";
import { JOURNEY } from "./src/lib/journey";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { useScenarioHash } from "./src/lib/useScenarioHash.js";
import { FONT_IMPORT_CSS } from "./src/lib/type";

/* Band colours print in the PDF only; on the page a band is a word. */
const ELECTRIC = "#0088DD"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444"; const MUTED = "#5B6E88";
const BAND_COLORS = { "not-ready": RED, "early-stage": AMBER, "foundation-set": ELECTRIC, "ai-capable": "#7C3AED", "ai-advanced": GREEN };
/* The questions, weights and bands live in the published rubric; this file only
   presents them. See aiReadiness and {RUBRIC.methodology}. */
const DIMS = RUBRIC.dims.map(d => ({ id: d.id, name: d.name, qs: d.criteria.map(c => ({ q: c.text })) }));

const TOOL_ID = "ai-readiness";
const ROUTE = "/tools/ai-readiness";
export const DEFAULTS = { scores: {} };
/* A complete set of mid-scale answers. The floor harness renders it to prove the
   results page and its PDF content build without a gate and without a missing field. */
export const SAMPLE = { scores: Object.fromEntries(DIMS.flatMap(d => d.qs.map((_, i) => [`${d.id}-${i}`, 3]))) };
/* An answer is kept only if it is a whole number on the 1 to 5 scale. A link
   carrying anything else opens the unanswered question, never a scored result. */
const cleanScores = (sc) => Object.fromEntries(Object.entries(sc && typeof sc === "object" ? sc : {})
  .filter(([k, v]) => /^[a-z0-9-]+$/i.test(k) && Number.isInteger(v) && v >= 1 && v <= 5));
const isComplete = (scores) => scoreRubric(RUBRIC, scores).complete;

export default function AIReadiness() {
  const [init] = useState(() => { const sc = readScenario(TOOL_ID, DEFAULTS); return { scores: cleanScores(sc && sc.scores) }; });
  const [phase, setPhase] = useState(() => (isComplete(init.scores) ? "results" : "intro"));
  const [currentDim, setCurrentDim] = useState(0);
  const [scores, setScores] = useState(init.scores);
  /* A refresh or Back reopens the answers given so far (the report sits on a later step). */
  useScenarioHash(TOOL_ID, { scores }, DEFAULTS);

  useEffect(() => { window.scrollTo(0, 0); }, [phase]);
  useEffect(() => { clearScenarioParam(); }, []);

  const setScore = (dimId, qIdx, val) => setScores(prev => ({ ...prev, [`${dimId}-${qIdx}`]: val }));
  /* Every score, band, checklist action and the next diagnostic come from the one
     rubric engine, so the page, the PDF and the published rubric cannot disagree. */
  const R = scoreRubric(RUBRIC, scores);
  const dimOf = (dimId) => R.dims.find(d => d.id === dimId);
  const dimScore = (dimId) => dimOf(dimId).score || 0;
  const dimComplete = (dimId) => dimOf(dimId).complete;
  const allComplete = R.complete;
  const overallScore = R.overall || 0;
  const tier = R.band ? { ...R.band, tier: R.band.label, color: BAND_COLORS[R.band.id] } : { tier: "", color: MUTED, desc: "" };
  const next = R.nextDiagnostic && JOURNEY[R.nextDiagnostic.tool] ? { name: JOURNEY[R.nextDiagnostic.tool].name, href: JOURNEY[R.nextDiagnostic.tool].route, because: dimOf(R.nextDiagnostic.because).name } : null;

  const handleStart = () => setPhase("assess");

  const handleResults = () => setPhase("results");

  const sorted = [...DIMS].sort((a, b) => dimScore(b.id) - dimScore(a.id));
  const answered = Object.keys(scores).length, total = DIMS.reduce((n, d) => n + d.qs.length, 0);
  const result = phase === "results"
    ? <Result label="AI readiness" value={overallScore.toFixed(1) + " / 5"} change={`${tier.tier}. ${tier.desc}`} />
    : <Result label="Statements answered" value={`${answered} of ${total}`} change="The score, band and checklist appear once every statement is answered." />;
  return (
    <ToolFrame toolId={TOOL_ID} choice={R.nextDiagnostic ? R.nextDiagnostic.tool : null} section="Assessments + Scorecards" name="AI Readiness Diagnostic" title="Is your operation ready for AI automation and agent assist?"
      lede="Check whether your data, workflows, integrations, governance, people and measurement can support AI automation and agent assist (AI that helps agents during a contact). 24 statements across 6 dimensions, about 5 minutes."
      method={frameMethod(methodStamp(TOOL_ID))} result={result} pinned={phase === "results" ? { label: "AI readiness", value: overallScore.toFixed(1) + " / 5" } : null}>
      <style>{FONT_IMPORT_CSS}</style>

      {phase === "intro" && (
        <section aria-label="Start" style={K.lead}>
          <p style={K.body}>Rate 24 statements from 1 (strongly disagree) to 5 (strongly agree). Nothing is scored until every statement is answered.</p>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginTop: 16 }}>
            <Button onClick={handleStart}>Start the diagnostic</Button>
            <a href={RUBRIC.methodology} style={K.link}>See the published rubric: every statement, weight and band</a>
          </div>
        </section>
      )}

      {phase === "assess" && (
        <StatementStep dims={DIMS} current={currentDim} setCurrent={setCurrentDim} scores={scores} setScore={setScore} done={dimComplete} complete={allComplete} onResults={handleResults}
          prompt="Rate each statement from 1 (strongly disagree) to 5 (strongly agree) for how your operation works today." />
      )}

      {phase === "results" && (<>
        <section aria-label="Your AI readiness level" style={K.lead}>
          <span style={K.kicker}>Your AI readiness level</span>
          <div style={K.stat}>{tier.tier} · {overallScore.toFixed(1)} / 5.0</div>
          <p style={{ ...K.body, marginTop: 8 }}>{tier.desc}</p>
        </section>

        <section aria-label="Recommended next step" style={K.panel}>
          <span style={K.kicker}>Recommended next step</span>
          <p style={{ ...K.body, color: K.strong.color, fontWeight: 500, marginTop: 8 }}>{tier.rec}</p>
        </section>

        <DimensionBars rows={DIMS.map((d) => ({ id: d.id, name: d.name, score: dimScore(d.id), band: bandFor(RUBRIC, dimScore(d.id)).label }))} />

        <div style={K.grid(200)}>
          <Tile label="Most ready" value={sorted[0].name} note={dimScore(sorted[0].id).toFixed(1) + " / 5.0"} />
          <Tile label="Biggest gap" value={sorted[sorted.length - 1].name} note={dimScore(sorted[sorted.length - 1].id).toFixed(1) + " / 5.0"} />
        </div>

        <section aria-label={RUBRIC.secondaryBands.title} style={K.panel}>
          <span style={K.kicker}>{RUBRIC.secondaryBands.title}</span>
          <div style={{ ...K.strong, fontSize: 17, marginTop: 8 }}>{R.secondary ? R.secondary.label : ""}</div>
          <p style={{ ...K.small, marginTop: 4 }}>{R.secondary ? R.secondary.desc : ""}</p>
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
          <p style={{ ...K.small, marginTop: 14 }}>Scored on the <a href={RUBRIC.methodology} style={K.link}>published rubric</a>, version {RUBRIC.version}. {RUBRIC.limits[0]} {RUBRIC.limits[1]}</p>
        </section>
        <Paper>
                <ReportActions next={R.nextDiagnostic ? { to: R.nextDiagnostic.tool, because: next ? next.because + " is your lowest-scoring dimension." : null } : null} toolId={TOOL_ID} toolName="AI Readiness Diagnostic" subtitle={"Score: " + overallScore.toFixed(1) + "/5, " + tier.tier} routePath={ROUTE} state={{ scores }} defaults={DEFAULTS} summary={[{ label: "AI readiness score", value: overallScore.toFixed(1) + "/5" }, { label: "Classification", value: tier.tier }]} sections={[
                    { title: "Dimension Scores", type: "table", rows: DIMS.map(d => [d.name, dimScore(d.id).toFixed(1) + "/5"]) },
                    { title: "Assessment", type: "metrics", items: [
                      { label: "AI Readiness", value: overallScore.toFixed(1) + "/5", color: tier.color },
                      { label: "Classification", value: tier.tier, color: tier.color },
                    ]},
                    { title: "Key Findings", type: "findings", items: [
                      "AI readiness score: " + overallScore.toFixed(1) + "/5 (" + tier.tier + ").",
                      "Weakest dimension: " + [...DIMS].sort((a,b) => dimScore(a.id) - dimScore(b.id))[0].name + ".",
                    ]},
                    { title: "Action Checklist", type: "actions", items: R.checklist.length ? R.checklist.map((c, i) => ({ action: c.action, detail: c.dimensionName + ": answered " + c.score + " of 5 to \"" + c.text + "\"", priority: i < 3 ? "high" : "medium" })) : [{ action: "No statement was answered at " + RUBRIC.failAt + " or below.", detail: "The rubric raises no action. Start with your lowest-scoring dimension." }] },
                    { title: "What This Assessment Cannot Tell You", type: "findings", items: RUBRIC.limits },
                    { title: "Method", type: "text", content: RUBRIC.title + " rubric version " + RUBRIC.version + ", published at contactcentercx.com" + RUBRIC.methodology + ". Each dimension scores the average of its statements on a 1 to 5 scale. The overall score is the average of the six dimensions, weighted equally, and the band is read from the published cut points. Every statement answered at " + RUBRIC.failAt + " or below adds its action to the checklist, weakest dimension first. The next diagnostic is the one the rubric names for your lowest dimension." },
                  ]} />
        </Paper>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button href="/contact">Talk to a consultant</Button>
          <Button kind="secondary" href="/vendors/agent-assist">Browse agent assist vendors</Button>
        </div>
      </>)}
    </ToolFrame>
  );
}
