import { useState, useEffect } from "react";
import { ToolNav, ToolHero, ToolStart } from "./src/lib/ToolShell";
import { scorePaired, bandFor } from "./src/lib/rubric";
import { CX_IT_ALIGNMENT as RUBRIC } from "./src/lib/rubrics/cxItAlignment";
import { JOURNEY } from "./src/lib/journey";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#5B6E88"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 860, margin: "0 auto", padding: "0 28px" };

function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const AREA_COLORS = { strategy: ELECTRIC, data: "#10B981", platforms: "#7C3AED", ai: "#F59E0B", governance: "#EF4444" };
const BAND_COLORS = { aligned: GREEN, minor: ELECTRIC, significant: AMBER, critical: RED };
/* The pairs, gap bands, actions and next diagnostics live in the published rubric; this
   file only presents them. See cxItAlignment and RUBRIC.methodology. */
const AREAS = RUBRIC.dims.map(d => ({ id: d.id, name: d.name, color: AREA_COLORS[d.id], pairs: d.pairs.map(p => ({ cx: p.cx, it: p.it })) }));
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

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh" }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:${FONT};background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}`}</style>

      <ToolNav wrap={WRAP} />

      {phase !== "intro" && <ToolHero compact wrap={WRAP} eyebrow="Frameworks + Planning" title="CX + IT Alignment Framework" />}

      {phase === "intro" && (
        <ToolHero fill wrap={WRAP} eyebrow="Frameworks + Planning" title="CX + IT Alignment Framework"
          intro="Rate 15 paired statements, one from the CX side and one from the IT side, across strategy, data, platforms, AI and governance. The result shows where the two sides see the same capability differently, and where both agree it is missing. Best answered by two people: the CX lead fills the CX column, then sends the scenario link to the IT lead to fill the IT column.">
          <ToolStart label="Start Assessment" onStart={handleStart} methodHref={RUBRIC.methodology} methodLabel="See the published rubric: every pair, band and action" />
        </ToolHero>
      )}

      {phase === "assess" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "40px 28px 80px" }}>
          <div style={WRAP}>
            <div style={{ display: "flex", gap: 4, marginBottom: 32 }}>
              {AREAS.map((a, i) => (
                <div key={i} onClick={() => setCurrentArea(i)} style={{ flex: 1, cursor: "pointer" }}>
                  <div style={{ height: 4, borderRadius: 2, background: areaComplete(a.id) ? a.color : i === currentArea ? `${a.color}60` : BORDER }} />
                  <div style={{ fontSize: 12, color: i === currentArea ? a.color : MUTED, fontWeight: i === currentArea ? 700 : 400, marginTop: 6, textAlign: "center" }}>{a.name.split(" ")[0]}</div>
                </div>
              ))}
            </div>

            {(() => {
              const area = AREAS[currentArea];
              return (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 4, height: 24, borderRadius: 2, background: area.color }} />
                    <h2 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 400, color: NAVY, margin: 0 }}>{area.name}</h2>
                    <span style={{ fontSize: 12, color: MUTED }}>({currentArea + 1} of {AREAS.length})</span>
                  </div>
                  <p style={{ fontSize: 13, color: MUTED, marginBottom: 28 }}>Rate each paired statement 1 to 5. The left column is the CX perspective. The right column is the IT perspective. Gaps between scores reveal misalignment.</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {area.pairs.map((pair, pi) => {
                      const cxVal = getScore(area.id, pi, "cx");
                      const itVal = getScore(area.id, pi, "it");
                      const gap = cxVal && itVal ? Math.abs(cxVal - itVal) : null;
                      const gapColor = gap === null ? BORDER : gap <= 1 ? GREEN : gap <= 2 ? AMBER : RED;
                      return (
                        <div key={pi} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px", overflow: "hidden" }}>
                          {gap !== null && <div style={{ height: 3, background: gapColor, margin: "-20px -20px 16px", borderRadius: "10px 10px 0 0" }} />}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: 12 }}>
                            {/* CX side */}
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>CX Perspective</div>
                              <p style={{ fontSize: 12.5, color: NAVY, lineHeight: 1.5, margin: "0 0 10px", fontWeight: 500 }}>{pair.cx}</p>
                              <div style={{ display: "flex", gap: 4 }}>
                                {[1,2,3,4,5].map(v => (
                                  <button key={v} onClick={() => setScore(area.id, pi, "cx", v)} style={{ width: 36, height: 32, borderRadius: 5, border: cxVal === v ? `2px solid ${ELECTRIC}` : `1px solid ${BORDER}`, background: cxVal === v ? `${ELECTRIC}12` : "#fff", color: cxVal === v ? ELECTRIC : MUTED, fontSize: 13, fontWeight: cxVal === v ? 700 : 400, cursor: "pointer" }}>{v}</button>
                                ))}
                              </div>
                            </div>
                            {/* Gap indicator */}
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                              {gap !== null ? (
                                <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${gapColor}15`, border: `2px solid ${gapColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: gapColor }}>{gap}</div>
                              ) : (
                                <div style={{ fontSize: 12, color: MUTED }}>vs</div>
                              )}
                            </div>
                            {/* IT side */}
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: "#7C3AED", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>IT Perspective</div>
                              <p style={{ fontSize: 12.5, color: NAVY, lineHeight: 1.5, margin: "0 0 10px", fontWeight: 500 }}>{pair.it}</p>
                              <div style={{ display: "flex", gap: 4 }}>
                                {[1,2,3,4,5].map(v => (
                                  <button key={v} onClick={() => setScore(area.id, pi, "it", v)} style={{ width: 36, height: 32, borderRadius: 5, border: itVal === v ? `2px solid #7C3AED` : `1px solid ${BORDER}`, background: itVal === v ? `#7C3AED12` : "#fff", color: itVal === v ? "#7C3AED" : MUTED, fontSize: 13, fontWeight: itVal === v ? 700 : 400, cursor: "pointer" }}>{v}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
                    <button onClick={() => setCurrentArea(Math.max(0, currentArea - 1))} disabled={currentArea === 0} style={{ padding: "12px 24px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: currentArea === 0 ? MUTED : NAVY, fontSize: 14, fontWeight: 500, cursor: currentArea === 0 ? "default" : "pointer" }}>← Previous</button>
                    {currentArea < AREAS.length - 1 ? (
                      <button onClick={() => setCurrentArea(currentArea + 1)} style={{ padding: "12px 24px", borderRadius: 8, border: "none", background: area.color, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Next: {AREAS[currentArea + 1].name.split(" &")[0].split(" ")[0]} →</button>
                    ) : (
                      <button onClick={handleResults} disabled={!allComplete} style={{ padding: "12px 28px", borderRadius: 8, border: "none", background: allComplete ? GREEN : MUTED, color: "#fff", fontSize: 14, fontWeight: 600, cursor: allComplete ? "pointer" : "default", opacity: allComplete ? 1 : 0.5 }}>
                        {allComplete ? "View Alignment Results →" : `${AREAS.filter(a => areaComplete(a.id)).length}/${AREAS.length} areas complete`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {phase === "results" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "44px 28px 80px" }}>
          <div style={WRAP}>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "36px 32px", textAlign: "center", marginBottom: 24 }}>
              <span style={{ color: "rgba(255,255,255,0.78)", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>CX + IT alignment</span>
              <h2 style={{ fontFamily: FONT, fontSize: 36, fontWeight: 600, color: gapLevel.color, margin: "8px 0 4px" }}>{gapLevel.label}</h2>
              <div style={{ fontSize: 14, color: "rgba(255,255,255,0.78)", marginBottom: 12 }}>Average gap {overallGap.toFixed(1)} points, where 0 is identical answers and 4 is opposite</div>
              <p style={{ fontSize: 14, color: "#fff", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>{gapLevel.desc}</p>
            </div>

            {shared.length > 0 && (
              <div style={{ background: "#FFF7ED", border: `1px solid ${AMBER}`, borderRadius: 10, padding: "16px 20px", marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#9A3412", marginBottom: 4 }}>{shared.length} shared weakness{shared.length === 1 ? "" : "es"}</div>
                <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>On {shared.length === 1 ? "this pair" : "these pairs"} both sides answered {RUBRIC.failAt} or below. The two sides agree the capability is missing, so the gap does not show it. {shared.length === 1 ? "It is" : "They are"} on the checklist below.</p>
              </div>
            )}

            <h3 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 600, color: NAVY, margin: "0 0 14px" }}>Alignment by area, largest gap first</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              {byGap.map((a) => {
                const cxAvg = areaAvg(a.id, "cx"), itAvg = areaAvg(a.id, "it"), gap = areaGap(a.id);
                const gl = (b => ({ ...b, color: BAND_COLORS[b.id] }))(bandFor(RUBRIC, gap));
                const sh = shared.filter(c => c.dimension === a.id).length;
                return (
                  <div key={a.id} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 22px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 4, height: 20, borderRadius: 2, background: a.color }} />
                        <span style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{a.name}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: NAVY, background: `${gl.color}18`, padding: "3px 8px", borderRadius: 4 }}>{gl.label}, gap {gap.toFixed(1)}{sh ? `, ${sh} shared weakness${sh === 1 ? "" : "es"}` : ""}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: SLATE, marginBottom: 4 }}><span>CX {cxAvg.toFixed(1)}</span><span>IT {itAvg.toFixed(1)}</span></div>
                    <div style={{ position: "relative", height: 8, background: BORDER, borderRadius: 4 }}>
                      <div style={{ position: "absolute", left: `calc(${((cxAvg - 1) / 4) * 100}% - 6px)`, top: -2, width: 12, height: 12, borderRadius: "50%", background: ELECTRIC, border: "2px solid #fff" }} />
                      <div style={{ position: "absolute", left: `calc(${((itAvg - 1) / 4) * 100}% - 6px)`, top: -2, width: 12, height: 12, borderRadius: "50%", background: "#7C3AED", border: "2px solid #fff" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 4 }}><span style={{ color: ELECTRIC, fontWeight: 600 }}>CX average</span><span style={{ color: "#7C3AED", fontWeight: 600 }}>IT average</span></div>
                  </div>
                );
              })}
            </div>

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "28px 28px", marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Your action checklist</h3>
              {R.checklist.length === 0 ? (
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.78)", lineHeight: 1.6 }}>No pair is {RUBRIC.gapAt} or more points apart and none is answered {RUBRIC.failAt} or below on both sides, so the rubric raises no action. The area with the largest gap is still the place to look first.</p>
              ) : R.checklist.map((c, i) => (
                <div key={c.criterion} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: i < R.checklist.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                  <span style={{ fontFamily: FONT, fontSize: 16, color: LIGHT, width: 22, flexShrink: 0 }}>{i + 1}</span>
                  <div>
                    <div style={{ fontSize: 14, color: "#fff", fontWeight: 600, lineHeight: 1.5 }}>{c.action}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", marginTop: 3, lineHeight: 1.5 }}>{c.dimensionName}, {c.kind === "misaligned" ? `misaligned: CX answered ${c.cx} and IT answered ${c.it}` : `shared weakness: CX answered ${c.cx} and IT answered ${c.it}`}, on "{c.texts.cx}"</div>
                  </div>
                </div>
              ))}
              {next && (
                <div style={{ marginTop: 16, fontSize: 14, color: "rgba(255,255,255,0.78)", lineHeight: 1.6 }}>
                  Next diagnostic: <a href={next.href} style={{ color: LIGHT, fontWeight: 600 }}>{next.name}</a>, because {next.because} has the largest gap.
                </div>
              )}
              <p style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.78)", lineHeight: 1.6 }}>
                Scored on the <a href={RUBRIC.methodology} style={{ color: LIGHT }}>published rubric</a>, version {RUBRIC.version}. {RUBRIC.limits[0]} {RUBRIC.limits[1]}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
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
              <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "13px 24px", borderRadius: 8 }}>Talk through the gaps</a>
              <a href="/tools/governance-model" style={{ background: "#fff", border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "13px 24px", borderRadius: 8 }}>Governance & Operating Model</a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
