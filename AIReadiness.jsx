import { useState, useEffect } from "react";
import { ToolNav, ToolHero, ToolStart } from "./src/lib/ToolShell";
import { scoreRubric, bandFor } from "./src/lib/rubric";
import { AI_READINESS as RUBRIC } from "./src/lib/rubrics/aiReadiness";
import { JOURNEY } from "./src/lib/journey";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#5B6E88"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 860, margin: "0 auto", padding: "0 28px" };

function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const DIM_COLORS = { data: ELECTRIC, workflow: "#10B981", integration: "#7C3AED", governance: "#F59E0B", talent: "#EF4444", measurement: "#3B82F6" };
const BAND_COLORS = { "not-ready": RED, "early-stage": AMBER, "foundation-set": ELECTRIC, "ai-capable": "#7C3AED", "ai-advanced": GREEN };
/* The questions, weights and bands live in the published rubric; this file only
   presents them. See aiReadiness and {RUBRIC.methodology}. */
const DIMS = RUBRIC.dims.map(d => ({ id: d.id, name: d.name, color: DIM_COLORS[d.id], qs: d.criteria.map(c => ({ q: c.text })) }));

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

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh" }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:${FONT};background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}`}</style>

      <ToolNav wrap={WRAP} />

      {phase !== "intro" && <ToolHero compact wrap={WRAP} eyebrow="Assessments + Scorecards" title="AI Readiness Diagnostic" />}

      {phase === "intro" && (
        <ToolHero fill wrap={WRAP} eyebrow="Assessments + Scorecards" title="AI Readiness Diagnostic"
          intro="Evaluate whether your data quality, workflow design, integration architecture, governance, talent, and measurement capabilities can support AI-driven automation and agent assist. 24 questions across 6 dimensions. Takes about 5 minutes.">
          <ToolStart label="Start Diagnostic" onStart={handleStart} methodHref={RUBRIC.methodology} methodLabel="See the published rubric: every statement, weight and band" />
        </ToolHero>
      )}

      {phase === "assess" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "40px 28px 80px" }}>
          <div style={WRAP}>
            <div style={{ display: "flex", gap: 4, marginBottom: 32 }}>
              {DIMS.map((d, i) => (
                <div key={i} onClick={() => setCurrentDim(i)} style={{ flex: 1, cursor: "pointer" }}>
                  <div style={{ height: 4, borderRadius: 2, background: dimComplete(d.id) ? d.color : i === currentDim ? `${d.color}60` : BORDER, transition: "background 0.3s" }} />
                  <div style={{ fontSize: 12, color: i === currentDim ? d.color : MUTED, fontWeight: i === currentDim ? 700 : 400, marginTop: 6, textAlign: "center" }}>{d.name.split(" ")[0]}</div>
                </div>
              ))}
            </div>
            {(() => {
              const dim = DIMS[currentDim];
              return (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 4, height: 24, borderRadius: 2, background: dim.color }} />
                    <h2 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 400, color: NAVY, margin: 0 }}>{dim.name}</h2>
                    <span style={{ fontSize: 12, color: MUTED }}>({currentDim + 1} of {DIMS.length})</span>
                  </div>
                  <p style={{ fontSize: 13, color: MUTED, marginBottom: 28 }}>Rate each statement from 1 (strongly disagree) to 5 (strongly agree) based on your current reality.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {dim.qs.map((q, qi) => {
                      const val = scores[`${dim.id}-${qi}`] || 0;
                      return (
                        <div key={qi} style={{ background: "#fff", border: `1px solid ${val > 0 ? dim.color + "30" : BORDER}`, borderRadius: 10, padding: "20px 22px" }}>
                          <p style={{ fontSize: 14, color: NAVY, lineHeight: 1.5, margin: "0 0 14px", fontWeight: 500 }}>{q.q}</p>
                          <div style={{ display: "flex", gap: 8 }}>
                            {[1, 2, 3, 4, 5].map(v => (
                              <button key={v} onClick={() => setScore(dim.id, qi, v)} style={{ width: 44, height: 40, borderRadius: 6, border: val === v ? `2px solid ${dim.color}` : `1px solid ${BORDER}`, background: val === v ? `${dim.color}12` : "#fff", color: val === v ? dim.color : MUTED, fontSize: 15, fontWeight: val === v ? 700 : 400, cursor: "pointer" }}>{v}</button>
                            ))}
                            <div style={{ display: "flex", alignItems: "center", gap: 16, marginLeft: 12 }}>
                              <span style={{ fontSize: 12, color: MUTED }}>1 = Disagree</span>
                              <span style={{ fontSize: 12, color: MUTED }}>5 = Agree</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
                    <button onClick={() => setCurrentDim(Math.max(0, currentDim - 1))} disabled={currentDim === 0} style={{ padding: "12px 24px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: currentDim === 0 ? MUTED : NAVY, fontSize: 14, fontWeight: 500, cursor: currentDim === 0 ? "default" : "pointer" }}>← Previous</button>
                    {currentDim < DIMS.length - 1 ? (
                      <button onClick={() => setCurrentDim(currentDim + 1)} style={{ padding: "12px 24px", borderRadius: 8, border: "none", background: dim.color, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Next: {DIMS[currentDim + 1].name.split(" &")[0].split(" ")[0]} →</button>
                    ) : (
                      <button onClick={handleResults} disabled={!allComplete} style={{ padding: "12px 28px", borderRadius: 8, border: "none", background: allComplete ? GREEN : MUTED, color: "#fff", fontSize: 14, fontWeight: 600, cursor: allComplete ? "pointer" : "default", opacity: allComplete ? 1 : 0.5 }}>
                        {allComplete ? "View My Results →" : `${DIMS.filter(d => dimComplete(d.id)).length}/${DIMS.length} dimensions complete`}
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
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "48px 28px 80px" }}>
          <div style={WRAP}>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "40px 32px", textAlign: "center", marginBottom: 32 }}>
              <span style={{ color: "rgba(255,255,255,0.72)", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Your AI Readiness Level</span>
              <h2 style={{ fontFamily: FONT, fontSize: 42, fontWeight: 400, color: tier.color, margin: "8px 0 4px" }}>{tier.tier}</h2>
              <div style={{ fontFamily: FONT, fontSize: 24, color: "#fff", marginBottom: 16 }}>{overallScore.toFixed(1)} <span style={{ fontSize: 14, color: "rgba(255,255,255,0.72)" }}>/ 5.0</span></div>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto" }}>{tier.desc}</p>
            </div>

            {/* Recommendation */}
            <div style={{ background: `${tier.color}08`, border: `1px solid ${tier.color}20`, borderRadius: 10, padding: "20px 22px", marginBottom: 32 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: tier.color, letterSpacing: 1, textTransform: "uppercase" }}>Recommended Next Step</span>
              <p style={{ fontSize: 14, color: NAVY, lineHeight: 1.6, margin: "6px 0 0", fontWeight: 500 }}>{tier.rec}</p>
            </div>

            <h3 style={{ fontFamily: FONT, fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 20px" }}>Dimension Scores</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {DIMS.map((d, i) => {
                const s = dimScore(d.id); const dt = (b => ({ ...b, tier: b.label, color: BAND_COLORS[b.id] }))(bandFor(RUBRIC, s));
                return (
                  <div key={i} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 22px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 4, height: 20, borderRadius: 2, background: d.color }} />
                        <span style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{d.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 12, color: dt.color, fontWeight: 600 }}>{dt.tier}</span>
                        <span style={{ fontFamily: FONT, fontSize: 20, color: dt.color }}>{s.toFixed(1)}</span>
                      </div>
                    </div>
                    <div style={{ height: 8, background: `${d.color}15`, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(s / 5) * 100}%`, background: d.color, borderRadius: 4, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
              {(() => {
                const sorted = [...DIMS].sort((a, b) => dimScore(b.id) - dimScore(a.id));
                return (<>
                  <div style={{ background: `${GREEN}08`, border: `1px solid ${GREEN}20`, borderRadius: 10, padding: "20px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 1, textTransform: "uppercase" }}>Most Ready</span>
                    <h4 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "6px 0 2px" }}>{sorted[0].name}</h4>
                    <span style={{ fontSize: 13, color: MUTED }}>{dimScore(sorted[0].id).toFixed(1)} / 5.0</span>
                  </div>
                  <div style={{ background: `${RED}08`, border: `1px solid ${RED}20`, borderRadius: 10, padding: "20px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: RED, letterSpacing: 1, textTransform: "uppercase" }}>Biggest Gap</span>
                    <h4 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "6px 0 2px" }}>{sorted[sorted.length - 1].name}</h4>
                    <span style={{ fontSize: 13, color: MUTED }}>{dimScore(sorted[sorted.length - 1].id).toFixed(1)} / 5.0</span>
                  </div>
                </>);
              })()}
            </div>

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "36px 28px", textAlign: "center" }}>
              <h3 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 400, color: "#fff", margin: "0 0 10px" }}>Ready to close the gaps?</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", lineHeight: 1.6, margin: "0 auto 24px", maxWidth: 440 }}>Your AI readiness profile is below.</p>
              <div style={{ textAlign: "left", maxWidth: 600, margin: "0 auto 24px" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>{RUBRIC.secondaryBands.title}</h3>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "12px 16px", marginBottom: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{R.secondary ? R.secondary.label : ""}</span>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", margin: "4px 0 0" }}>{R.secondary ? R.secondary.desc : ""}</p>
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Your Action Checklist</h3>
                {R.checklist.length === 0 ? (
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.72)", lineHeight: 1.6 }}>No statement was answered at {RUBRIC.failAt} or below, so the rubric raises no action. Your lowest dimension is still the place to look first.</p>
                ) : R.checklist.map((c, i) => (
                  <div key={c.criterion} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: i < R.checklist.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                    <span style={{ fontFamily: FONT, fontSize: 16, color: LIGHT, width: 22, flexShrink: 0 }}>{i + 1}</span>
                    <div>
                      <div style={{ fontSize: 13, color: "#fff", fontWeight: 600, lineHeight: 1.5 }}>{c.action}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", marginTop: 3, lineHeight: 1.5 }}>{c.dimensionName}: you answered {c.score} of 5 to "{c.text}"</div>
                    </div>
                  </div>
                ))}
                {next && (
                  <div style={{ marginTop: 16, fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
                    Next diagnostic: <a href={next.href} style={{ color: LIGHT, fontWeight: 600 }}>{next.name}</a>, because {next.because} is your lowest-scoring dimension.
                  </div>
                )}
                <p style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.6 }}>
                  Scored on the <a href={RUBRIC.methodology} style={{ color: LIGHT }}>published rubric</a>, version {RUBRIC.version}. {RUBRIC.limits[0]} {RUBRIC.limits[1]}
                </p>
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                
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
                    { title: "Action Checklist", type: "actions", items: R.checklist.length ? R.checklist.map((c, i) => ({ action: c.action, detail: c.dimensionName + ": answered " + c.score + " of 5 to \"" + c.text + "\"", priority: i < 3 ? "high" : "medium" })) : [{ action: "No statement was answered at " + RUBRIC.failAt + " or below.", detail: "The rubric raises no action. Start with the lowest-scoring dimension." }] },
                    { title: "What This Assessment Cannot Tell You", type: "findings", items: RUBRIC.limits },
                    { title: "Method", type: "text", content: RUBRIC.title + " rubric version " + RUBRIC.version + ", published at contactcentercx.com" + RUBRIC.methodology + ". Each dimension scores the mean of its statements on a 1 to 5 scale; the overall score is the equally weighted mean of the dimensions; the band is read from the published cut points. Every statement answered at " + RUBRIC.failAt + " or below adds its action to the checklist, weakest dimension first. The next diagnostic is the one the rubric names for your lowest dimension." },
                  ]} />
                <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "13px 24px", borderRadius: 8 }}>Connect with a Consultant →</a>
                <a href="/vendors/agent-assist" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 14, fontWeight: 500, padding: "13px 24px", borderRadius: 8 }}>Browse Agent Assist Vendors →</a>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
