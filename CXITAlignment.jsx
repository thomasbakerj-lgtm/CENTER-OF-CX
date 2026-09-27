import { useState, useEffect } from "react";
import { ToolFrame } from "./src/lib/ToolFrame.jsx";
import { Result, Button } from "./src/lib/ui.jsx";
import { K, Paper, Group, Scale, frameMethod } from "./src/lib/frameKit.jsx";
import { methodStamp } from "./src/lib/methodVersions.js";
import { scorePaired, bandFor } from "./src/lib/rubric";
import { CX_IT_ALIGNMENT as RUBRIC } from "./src/lib/rubrics/cxItAlignment";
import { JOURNEY } from "./src/lib/journey";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";
import { TOUCH, RADIUS } from "./src/lib/tokens.js";

/* Band colours print in the PDF only; on the page a band is a word. */
const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444"; const ELECTRIC = "#0088DD"; const MUTED = "#5B6E88";
const BAND_COLORS = { aligned: GREEN, minor: ELECTRIC, significant: AMBER, critical: RED };
/* The pairs, gap bands, actions and next diagnostics live in the published rubric; this
   file only presents them. See cxItAlignment and RUBRIC.methodology. */
const AREAS = RUBRIC.dims.map(d => ({ id: d.id, name: d.name, pairs: d.pairs.map(p => ({ cx: p.cx, it: p.it })) }));
const toolOf = (id) => JOURNEY[id] ? { name: JOURNEY[id].name, href: JOURNEY[id].route } : null;

const TOOL_ID = "cx-it-alignment";
const ROUTE = "/tools/cx-it-alignment";
export const DEFAULTS = { scores: {} };
/* A complete set of mid-scale answers. The floor harness renders it to prove the
   results page and its PDF content build without a gate and without a missing field. */
export const SAMPLE = { scores: Object.fromEntries(AREAS.flatMap(a => a.pairs.flatMap((_, i) => [[`${a.id}-${i}-cx`, 4], [`${a.id}-${i}-it`, 3]]))) };
/* An answer is kept only if it is a whole number on the 1 to 5 scale. A link
   carrying anything else opens the unanswered question, never a scored result. */
const cleanScores = (sc) => Object.fromEntries(Object.entries(sc && typeof sc === "object" ? sc : {})
  .filter(([k, v]) => /^[a-z0-9-]+$/i.test(k) && Number.isInteger(v) && v >= 1 && v <= 5));
const isComplete = (scores) => scorePaired(RUBRIC, scores).complete;

export default function CXITAlignment() {
  const [init] = useState(() => { const sc = readScenario(TOOL_ID, DEFAULTS); return { scores: cleanScores(sc && sc.scores) }; });
  const [phase, setPhase] = useState(() => (isComplete(init.scores) ? "results" : "intro"));
  const [currentArea, setCurrentArea] = useState(0);
  const [scores, setScores] = useState(init.scores);

  useEffect(() => { window.scrollTo(0, 0); }, [phase]);
  useEffect(() => { clearScenarioParam(); }, []);

  const setScore = (areaId, pairIdx, side, val) => setScores(prev => ({ ...prev, [`${areaId}-${pairIdx}-${side}`]: val }));
  const getScore = (areaId, pairIdx, side) => scores[`${areaId}-${pairIdx}-${side}`] || 0;

  /* Every gap, band, checklist action and the next diagnostic come from the one rubric
     engine, so the page, the PDF and the published rubric cannot disagree. */
  const R = scorePaired(RUBRIC, scores);
  const areaOf = (id) => R.dims.find(d => d.id === id);
  const areaGap = (id) => areaOf(id).gap || 0;
  const areaAvg = (id, side) => areaOf(id)[side] || 0;
  const areaComplete = (id) => areaOf(id).complete;
  const allComplete = R.complete;
  const overallGap = R.overall || 0;
  const gapLevel = R.band ? { ...R.band, color: BAND_COLORS[R.band.id] } : { label: "", color: MUTED, desc: "" };
  const byGap = [...AREAS].sort((a, b) => areaGap(b.id) - areaGap(a.id) || AREAS.indexOf(a) - AREAS.indexOf(b));
  const misaligned = R.checklist.filter(c => c.kind === "misaligned");
  const shared = R.checklist.filter(c => c.kind === "shared");
  const next = R.nextDiagnostic && toolOf(R.nextDiagnostic.tool) ? { ...toolOf(R.nextDiagnostic.tool), because: areaOf(R.nextDiagnostic.because).name } : null;

  const handleStart = () => setPhase("assess");

  const handleResults = () => setPhase("results");

  const answered = Object.keys(scores).length, total = AREAS.reduce((n, a) => n + a.pairs.length * 2, 0);
  const result = phase === "results"
    ? <Result label="Average CX to IT gap" value={overallGap.toFixed(1) + " pts"} change={`${gapLevel.label}. 0 is identical answers and 4 is opposite.`} />
    : <Result label="Answers given" value={`${answered} of ${total}`} change="The gap, band and checklist appear once every pair is answered on both sides." />;
  const tabStyle = (on) => ({ minHeight: TOUCH, padding: "0 12px", fontFamily: FONT, fontSize: 14, fontWeight: on ? 700 : 500, borderRadius: RADIUS.field, cursor: "pointer", border: `1px solid ${on ? K.strong.color : K.firm}`, background: "transparent", color: K.strong.color });
  const navBtn = { minHeight: TOUCH, padding: "0 18px", fontFamily: FONT, fontSize: 15, fontWeight: 600, borderRadius: RADIUS.field, border: `1px solid ${K.firm}`, background: "transparent", color: K.strong.color, cursor: "pointer" };

  return (
    <ToolFrame toolId={TOOL_ID} choice={R.nextDiagnostic ? R.nextDiagnostic.tool : null} section="Frameworks + Planning" name="CX + IT Alignment Framework" title="Do your CX and IT teams see the same capabilities?"
      lede="Rate 15 paired statements, one from the CX side and one from the IT side, across strategy, data, platforms, AI and governance. The result shows where the two sides see the same capability differently, and where both agree it is missing. Best answered by two people: the CX lead fills the CX side, sends the scenario link, and the IT lead fills the IT side."
      method={frameMethod(methodStamp(TOOL_ID))} result={result} pinned={phase === "results" ? { label: "Average gap", value: overallGap.toFixed(1) + " pts" } : null}>
      <style>{FONT_IMPORT_CSS}</style>

      {phase === "intro" && (
        <section aria-label="Start" style={K.lead}>
          <p style={K.body}>Each pair is rated twice, once from each side, from 1 (strongly disagree) to 5 (strongly agree). Nothing is scored until every pair is answered on both sides.</p>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginTop: 16 }}>
            <Button onClick={handleStart}>Start Assessment</Button>
            <a href={RUBRIC.methodology} style={K.link}>See the published rubric: every pair, band and action</a>
          </div>
        </section>
      )}

      {phase === "assess" && (() => {
        const area = AREAS[currentArea];
        return (<>
          <div role="tablist" aria-label="Areas" style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {AREAS.map((a, i) => (
              <button key={a.id} type="button" role="tab" aria-selected={i === currentArea} onClick={() => setCurrentArea(i)} style={tabStyle(i === currentArea)}>{areaComplete(a.id) ? "\u2713 " : ""}{a.name}</button>
            ))}
          </div>
          <Group legend={`Area ${currentArea + 1} of ${AREAS.length} · ${area.name}`} note="Rate each paired statement 1 to 5. The first is the CX perspective, the second the IT perspective. Gaps between scores reveal misalignment.">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {area.pairs.map((pair, pi) => {
                const cxVal = getScore(area.id, pi, "cx");
                const itVal = getScore(area.id, pi, "it");
                const gap = cxVal && itVal ? Math.abs(cxVal - itVal) : null;
                return (
                  <div key={pi} style={K.box}>
                    <div style={K.grid(240)}>
                      <div>
                        <div style={{ ...K.kicker, marginBottom: 6 }}>CX perspective</div>
                        <p style={{ ...K.body, color: K.strong.color, fontWeight: 500, margin: "0 0 10px" }}>{pair.cx}</p>
                        <Scale label={"CX: " + pair.cx} value={cxVal} onPick={(v) => setScore(area.id, pi, "cx", v)} />
                      </div>
                      <div>
                        <div style={{ ...K.kicker, marginBottom: 6 }}>IT perspective</div>
                        <p style={{ ...K.body, color: K.strong.color, fontWeight: 500, margin: "0 0 10px" }}>{pair.it}</p>
                        <Scale label={"IT: " + pair.it} value={itVal} onPick={(v) => setScore(area.id, pi, "it", v)} />
                      </div>
                    </div>
                    <p style={{ ...K.small, marginTop: 10 }}>{gap === null ? "Answer both sides to see the gap." : `Gap ${gap} point${gap === 1 ? "" : "s"}${gap >= RUBRIC.gapAt ? ", misaligned" : ""}.`}</p>
                  </div>
                );
              })}
            </div>
          </Group>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={() => setCurrentArea(Math.max(0, currentArea - 1))} disabled={currentArea === 0} style={{ ...navBtn, opacity: currentArea === 0 ? 0.5 : 1 }}>Previous</button>
            {currentArea < AREAS.length - 1 ? (
              <Button onClick={() => setCurrentArea(currentArea + 1)}>Next: {AREAS[currentArea + 1].name}</Button>
            ) : (
              <Button onClick={handleResults} disabled={!allComplete}>{allComplete ? "View alignment results" : `${AREAS.filter(a => areaComplete(a.id)).length}/${AREAS.length} areas complete`}</Button>
            )}
          </div>
        </>);
      })()}

      {phase === "results" && (<>
        <section aria-label="CX and IT alignment" style={K.lead}>
          <span style={K.kicker}>CX + IT alignment</span>
          <div style={K.stat}>{gapLevel.label}</div>
          <p style={K.small}>Average gap {overallGap.toFixed(1)} points, where 0 is identical answers and 4 is opposite</p>
          <p style={{ ...K.body, marginTop: 8 }}>{gapLevel.desc}</p>
        </section>

        {shared.length > 0 && (
          <section aria-label="Shared weaknesses" style={{ ...K.panel, border: `1.5px solid ${K.strong.color}` }}>
            <h2 style={K.h2}>{shared.length} shared weakness{shared.length === 1 ? "" : "es"}</h2>
            <p style={K.body}>On {shared.length === 1 ? "this pair" : "these pairs"} both sides answered {RUBRIC.failAt} or below. The two sides agree the capability is missing, so the gap does not show it. {shared.length === 1 ? "It is" : "They are"} on the checklist below.</p>
          </section>
        )}

        <section aria-label="Alignment by area" style={K.panel}>
          <h2 style={K.h2}>Alignment by area, largest gap first</h2>
          {byGap.map((a) => {
            const cxAvg = areaAvg(a.id, "cx"), itAvg = areaAvg(a.id, "it"), gap = areaGap(a.id);
            const gl = bandFor(RUBRIC, gap);
            const sh = shared.filter(c => c.dimension === a.id).length;
            return (
              <div key={a.id} style={{ padding: "12px 0", borderTop: `1px solid ${K.hair}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
                  <span style={{ ...K.strong, fontSize: 15 }}>{a.name}</span>
                  <span style={{ ...K.small, color: K.body.color }}>{gl.label}, gap {gap.toFixed(1)}{sh ? `, ${sh} shared weakness${sh === 1 ? "" : "es"}` : ""}</span>
                </div>
                <div role="img" aria-label={`${a.name}: CX ${cxAvg.toFixed(1)}, IT ${itAvg.toFixed(1)}`} style={{ position: "relative", height: 8, background: K.hair, borderRadius: 4, margin: "0 6px" }}>
                  <div style={{ position: "absolute", left: `calc(${((cxAvg - 1) / 4) * 100}% - 7px)`, top: -3, width: 14, height: 14, borderRadius: "50%", background: K.strong.color }} />
                  <div style={{ position: "absolute", left: `calc(${((itAvg - 1) / 4) * 100}% - 7px)`, top: -3, width: 14, height: 14, borderRadius: "50%", border: `3px solid ${K.shade(0)}`, boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", ...K.small, marginTop: 8 }}><span>CX average {cxAvg.toFixed(1)} (filled)</span><span>IT average {itAvg.toFixed(1)} (ring)</span></div>
              </div>
            );
          })}
        </section>

        <section aria-label="Your action checklist" style={K.panel}>
          <h2 style={K.h2}>Your action checklist</h2>
          {R.checklist.length === 0 ? (
            <p style={K.body}>No pair is {RUBRIC.gapAt} or more points apart and none is answered {RUBRIC.failAt} or below on both sides, so the rubric raises no action. The area with the largest gap is still the place to look first.</p>
          ) : R.checklist.map((c, i) => (
            <div key={c.criterion} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderTop: `1px solid ${K.hair}` }}>
              <span style={{ ...K.strong, ...K.num, width: 22, flexShrink: 0 }}>{i + 1}</span>
              <div>
                <div style={{ ...K.strong, fontSize: 15, lineHeight: "22px" }}>{c.action}</div>
                <div style={{ ...K.small, marginTop: 3 }}>{c.dimensionName}, {c.kind === "misaligned" ? `misaligned: CX answered ${c.cx} and IT answered ${c.it}` : `shared weakness: CX answered ${c.cx} and IT answered ${c.it}`}, on "{c.texts.cx}"</div>
              </div>
            </div>
          ))}
          {next && (
            <p style={{ ...K.body, marginTop: 14 }}>Next diagnostic: <a href={next.href} style={K.link}>{next.name}</a>, because {next.because} has the largest gap.</p>
          )}
          <p style={{ ...K.small, marginTop: 14 }}>Scored on the <a href={RUBRIC.methodology} style={K.link}>published rubric</a>, version {RUBRIC.version}. {RUBRIC.limits[0]} {RUBRIC.limits[1]}</p>
        </section>

        <Paper>
              <ReportActions next={R.nextDiagnostic ? { to: R.nextDiagnostic.tool, because: next ? next.because + " has the largest gap." : null } : null} toolId={TOOL_ID} toolName="CX + IT Alignment Framework" subtitle={"Average CX to IT gap " + overallGap.toFixed(1) + " points, " + gapLevel.label} routePath={ROUTE} state={{ scores }} defaults={DEFAULTS}
                summary={[{ label: "Average CX to IT gap", value: overallGap.toFixed(1) + " pts" }, { label: "Alignment band", value: gapLevel.label }, { label: "Misaligned pairs", value: String(misaligned.length) }, { label: "Shared weaknesses", value: String(shared.length) }]}
                sections={[
                  { title: "Alignment by Area", type: "table", rows: byGap.map(a => [a.name, "CX " + areaAvg(a.id, "cx").toFixed(1) + " / IT " + areaAvg(a.id, "it").toFixed(1) + ", gap " + areaGap(a.id).toFixed(1)]) },
                  { title: "Assessment", type: "metrics", items: [
                    { label: "Average Gap", value: overallGap.toFixed(1) + " pts", color: gapLevel.color, sub: "0 is identical answers, 4 is opposite" },
                    { label: "Alignment Band", value: gapLevel.label, color: gapLevel.color },
                    { label: "Shared Weaknesses", value: String(shared.length), color: shared.length ? AMBER : GREEN, sub: "both sides at " + RUBRIC.failAt + " or below" },
                  ]},
                  { title: "Key Findings", type: "findings", items: [
                    gapLevel.label + ": " + gapLevel.desc,
                    "Largest gap: " + byGap[0].name + " (" + areaGap(byGap[0].id).toFixed(1) + " points).",
                    shared.length ? shared.length + " pair" + (shared.length === 1 ? " was" : "s were") + " answered " + RUBRIC.failAt + " or below by both sides: agreement that the capability is missing, which the gap does not show." : "No pair was answered " + RUBRIC.failAt + " or below by both sides.",
                    "A gap is the distance between how CX and IT rate the same capability. It measures agreement, never capability.",
                  ]},
                  { title: "Action Checklist", type: "actions", items: R.checklist.length ? R.checklist.map((c, i) => ({ action: c.action, detail: c.dimensionName + ", " + (c.kind === "misaligned" ? "misaligned" : "shared weakness") + ": CX " + c.cx + ", IT " + c.it + " on \"" + c.texts.cx + "\"", priority: i < 3 ? "high" : "medium" })) : [{ action: "No pair reaches the gap line or the shared-weakness line, so the rubric raises no action.", detail: "The area with the largest gap is still the place to look first.", priority: "medium" }] },
                  { title: "What This Assessment Cannot Tell You", type: "findings", items: RUBRIC.limits },
                  { title: "Method", type: "text", content: RUBRIC.title + " rubric version " + RUBRIC.version + ", published at contactcentercx.com" + RUBRIC.methodology + ". Each pair scores the gap between its CX and IT answers on a 1 to 5 scale; an area scores the average gap of its pairs and the overall score is the equally weighted average of the five areas. A pair " + RUBRIC.gapAt + " or more points apart is misaligned; a pair answered " + RUBRIC.failAt + " or below on both sides is a shared weakness. Both add their action to the checklist, largest area gap first." },
                ]} />
        </Paper>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Button href="/contact">Talk through the gaps</Button>
          <Button kind="secondary" href="/tools/governance-model">Governance & Operating Model</Button>
        </div>
      </>)}
    </ToolFrame>
  );
}
