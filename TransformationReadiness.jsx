import { useState, useEffect } from "react";
import { ToolNav, ToolHero, ToolStart } from "./src/lib/ToolShell";
import { scoreRubric, bandFor } from "./src/lib/rubric";
import { TRANSFORMATION_READINESS as RUBRIC } from "./src/lib/rubrics/transformationReadiness";
import { JOURNEY } from "./src/lib/journey";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#5B6E88"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const DIM_COLORS = { leadership: ELECTRIC, budget: AMBER, team: GREEN, vendor: "#7C3AED", technical: "#0EA5E9", change: "#EC4899" };
const BAND_COLORS = { notready: RED, early: "#DC6B00", developing: AMBER, ready: "#7CB342", strong: GREEN };
/* The statements, bands, per-dimension flags and next diagnostics live in the published
   rubric; this file only presents them. See transformationReadiness and RUBRIC.methodology. */
const DIMS = RUBRIC.dims.map(d => ({ id: d.id, name: d.name, color: DIM_COLORS[d.id], next: d.next, qs: d.criteria.map(c => ({ q: c.text })) }));
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

  return(
    <div style={{fontFamily:FONT,minHeight:"100vh"}}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:${FONT};background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.pg{grid-template-columns:1fr!important}}`}</style>
      <ToolNav wrap={WRAP} />

      {phase !== "intro" && <ToolHero compact wrap={WRAP} eyebrow="Assessments + Scorecards" title="Transformation Readiness Scorecard" />}

      {phase === "intro" && (
        <ToolHero fill wrap={WRAP} eyebrow="Assessments + Scorecards" title="Transformation Readiness Scorecard"
          intro="The go/no-go assessment. Score 6 dimensions, get a phased recommendation, and see exactly which tools to use to close each gap before committing budget.">
          <ToolStart label="Start Assessment" onStart={handleStart} methodHref={RUBRIC.methodology} methodLabel="See the published rubric: every statement, band and action" />
        </ToolHero>
      )}


      {phase === "assess"&&(<section style={{background:"#fff",padding:"40px 28px 60px"}}><div style={{...WRAP,maxWidth:700}}>
        <div style={{display:"flex",gap:4,marginBottom:32,flexWrap:"wrap"}}>
          {DIMS.map((d,i)=>(<button key={d.id} onClick={()=>setCurrentDim(i)} style={{padding:"8px 14px",fontSize:12,fontWeight:600,borderRadius:6,cursor:"pointer",border:`1px solid ${i===currentDim?d.color:dimComplete(d.id)?GREEN:BORDER}`,background:i===currentDim?`${d.color}12`:dimComplete(d.id)?`${GREEN}08`:"#fff",color:i===currentDim?d.color:dimComplete(d.id)?GREEN:MUTED}}>{dimComplete(d.id)?"✓ ":""}{d.name.split("+")[0].trim()}</button>))}
        </div>
        {(()=>{const dim=DIMS[currentDim]; return(<div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
            <div style={{width:4,height:28,borderRadius:2,background:dim.color}}/>
            <h2 style={{fontFamily:FONT,fontSize:22,fontWeight:400,color:NAVY,margin:0}}>{dim.name}</h2>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {dim.qs.map((q,qi)=>(<div key={qi} style={{background:WARM,border:`1px solid ${scores[`${dim.id}-${qi}`]?dim.color+"30":BORDER}`,borderRadius:10,padding:"18px 20px"}}>
              <p style={{fontSize:14,color:NAVY,lineHeight:1.55,margin:"0 0 12px"}}>{q.q}</p>
              <div style={{display:"flex",gap:6}}>
                {[1,2,3,4,5].map(v=>(<button key={v} onClick={()=>setScore(dim.id,qi,v)} style={{flex:1,padding:"8px 4px",fontSize:12,fontWeight:600,borderRadius:6,cursor:"pointer",border:`1px solid ${scores[`${dim.id}-${qi}`]===v?dim.color:BORDER}`,background:scores[`${dim.id}-${qi}`]===v?dim.color:"#fff",color:scores[`${dim.id}-${qi}`]===v?"#fff":MUTED}}>{labels[v]}</button>))}
              </div>
            </div>))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:24}}>
            <button onClick={()=>setCurrentDim(Math.max(0,currentDim-1))} disabled={currentDim===0} style={{padding:"10px 20px",fontSize:13,fontWeight:600,borderRadius:6,border:`1px solid ${BORDER}`,background:"#fff",color:currentDim===0?MUTED:NAVY,cursor:"pointer",opacity:currentDim===0?0.5:1}}>← Previous</button>
            {currentDim<DIMS.length-1?
              <button onClick={()=>setCurrentDim(currentDim+1)} style={{padding:"10px 20px",fontSize:13,fontWeight:600,borderRadius:6,border:"none",background:dim.color,color:"#fff",cursor:"pointer"}}>Next →</button>:
              <button onClick={handleResults} disabled={!allComplete} style={{padding:"10px 24px",fontSize:13,fontWeight:600,borderRadius:6,border:"none",background:allComplete?GREEN:MUTED,color:"#fff",cursor:"pointer",opacity:allComplete?1:0.5}}>{allComplete?"See Results →":"Complete all dimensions"}</button>
            }
          </div>
        </div>);})()}
      </div></section>)}

      {phase === "results" && (<section style={{ background: "#fff", padding: "40px 28px 60px" }}><div style={WRAP}>
        <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "36px 32px", textAlign: "center", marginBottom: 28 }}>
          <span style={{ color: "rgba(255,255,255,0.78)", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Your readiness band</span>
          <h2 style={{ fontFamily: FONT, fontSize: 40, fontWeight: 600, color: tier.color, margin: "8px 0 4px" }}>{tier.tier}</h2>
          <div style={{ fontFamily: FONT, fontSize: 24, color: "#fff", marginBottom: 14 }}>{overallScore.toFixed(1)} <span style={{ fontSize: 14, color: "rgba(255,255,255,0.78)" }}>/ 5.0</span></div>
          <p style={{ fontSize: 15, color: "#fff", fontWeight: 600, lineHeight: 1.6, maxWidth: 560, margin: "0 auto" }}>{tier.desc}</p>
        </div>

        <h3 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 600, color: NAVY, margin: "0 0 14px" }}>Dimension scores, weakest first</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {byWeakest.map(d => {
            const sc = dimScore(d.id); const flag = flagOf(d.id); const close = flag === "Close this gap"; const tool = toolOf(d.next);
            return (<div key={d.id} style={{ background: close ? `${RED}05` : WARM, border: `1px solid ${close ? RED + "40" : BORDER}`, borderRadius: 10, padding: "16px 20px", borderLeft: `4px solid ${d.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{d.name}</span>
                    {flag && <span style={{ fontSize: 12, fontWeight: 700, color: close ? RED : "#B45309", padding: "2px 8px", borderRadius: 4, background: close ? `${RED}10` : `${AMBER}18` }}>{flag}</span>}
                  </div>
                  <div style={{ height: 6, background: `${d.color}18`, borderRadius: 3, overflow: "hidden", maxWidth: 320 }}>
                    <div style={{ height: "100%", width: `${(sc / 5) * 100}%`, background: d.color, borderRadius: 3 }} />
                  </div>
                  {flag && tool && <a href={tool.href} style={{ display: "inline-block", fontSize: 13, fontWeight: 600, color: ELECTRIC, marginTop: 10 }}>Next for this gap: {tool.name}</a>}
                </div>
                <div style={{ fontFamily: FONT, fontSize: 26, fontWeight: 600, color: NAVY, flexShrink: 0 }}>{sc.toFixed(1)}<span style={{ fontSize: 13, color: MUTED, fontWeight: 400 }}> / 5</span></div>
              </div>
            </div>);
          })}
        </div>

        <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "28px 28px", marginBottom: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Your action checklist</h3>
          {R.checklist.length === 0 ? (
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.78)", lineHeight: 1.6 }}>No statement was answered at {RUBRIC.failAt} or below, so the rubric raises no action. Your lowest dimension is still the place to look first.</p>
          ) : R.checklist.map((c, i) => (
            <div key={c.criterion} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "10px 0", borderBottom: i < R.checklist.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
              <span style={{ fontFamily: FONT, fontSize: 16, color: LIGHT, width: 22, flexShrink: 0 }}>{i + 1}</span>
              <div>
                <div style={{ fontSize: 14, color: "#fff", fontWeight: 600, lineHeight: 1.5 }}>{c.action}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", marginTop: 3, lineHeight: 1.5 }}>{c.dimensionName}: you answered {c.score} of 5 to "{c.text}"</div>
              </div>
            </div>
          ))}
          {next && (
            <div style={{ marginTop: 16, fontSize: 14, color: "rgba(255,255,255,0.78)", lineHeight: 1.6 }}>
              Next diagnostic: <a href={next.href} style={{ color: LIGHT, fontWeight: 600 }}>{next.name}</a>, because {next.because} is your lowest-scoring dimension.
            </div>
          )}
          <p style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,0.78)", lineHeight: 1.6 }}>
            Scored on the <a href={RUBRIC.methodology} style={{ color: LIGHT }}>published rubric</a>, version {RUBRIC.version}. {RUBRIC.limits[0]} {RUBRIC.limits[2]}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }} className="pg">
          <a href="/contact" style={{ display: "block", background: `linear-gradient(135deg,${NAVY},${DEEP})`, borderRadius: 12, padding: "26px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: FONT, fontSize: 19, fontWeight: 600, color: "#fff", marginBottom: 8 }}>Sequence the gap closure</div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", lineHeight: 1.5, margin: "0 0 12px" }}>A working session to order these gaps and build the readiness plan before you commit budget.</p>
            <span style={{ display: "inline-block", background: ELECTRIC, color: "#fff", fontSize: 13, fontWeight: 600, padding: "10px 22px", borderRadius: 6 }}>Request a working session</span>
          </a>
          <a href="/tools/vendor-match" style={{ display: "block", background: `${ELECTRIC}06`, border: `1px solid ${ELECTRIC}30`, borderRadius: 12, padding: "26px 24px", textAlign: "center" }}>
            <div style={{ fontFamily: FONT, fontSize: 19, fontWeight: 600, color: NAVY, marginBottom: 8 }}>Starting vendor evaluation?</div>
            <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.5, margin: "0 0 12px" }}>From the Ready band up, Vendor Match builds a starting shortlist from your environment and priorities, with its method disclosed.</p>
            <span style={{ display: "inline-block", background: ELECTRIC, color: "#fff", fontSize: 13, fontWeight: 600, padding: "10px 22px", borderRadius: 6 }}>Open Vendor Match</span>
          </a>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <ReportActions toolId={TOOL_ID} toolName="Transformation Readiness Scorecard" subtitle={"Score: " + overallScore.toFixed(1) + "/5, " + tier.tier} routePath={ROUTE} state={{ scores }} defaults={DEFAULTS}
            summary={[{ label: "Readiness score", value: overallScore.toFixed(1) + "/5" }, { label: "Readiness band", value: tier.tier }, { label: "Gaps flagged", value: String(gaps.length) }]}
            sections={[
              { title: "Dimension Scores", type: "table", rows: byWeakest.map(d => [d.name, dimScore(d.id).toFixed(1) + "/5" + (flagOf(d.id) ? " (" + flagOf(d.id) + ")" : "")]) },
              { title: "Assessment", type: "metrics", items: [
                { label: "Readiness", value: overallScore.toFixed(1) + "/5", color: tier.color },
                { label: "Band", value: tier.tier, color: tier.color },
              ]},
              { title: "Recommendation", type: "text", content: tier.desc },
              { title: "Action Checklist", type: "actions", items: R.checklist.length ? R.checklist.map((c, i) => ({ action: c.action, detail: c.dimensionName + ": answered " + c.score + " of 5 to \"" + c.text + "\"", priority: i < 3 ? "high" : "medium" })) : [{ action: "No statement was answered at " + RUBRIC.failAt + " or below, so the rubric raises no action.", detail: "Your lowest dimension is still the place to look first.", priority: "medium" }] },
              { title: "Gaps to Close", type: "findings", items: gaps.length ? gaps.map(d => d.name + " (" + dimScore(d.id).toFixed(1) + "/5, " + flagOf(d.id).toLowerCase() + ")" + (toolOf(d.next) ? ": next, " + toolOf(d.next).name : "")) : ["No dimension scores below the Ready band."] },
              { title: "Next Steps", type: "next", items: next ? [{ tool: next.name, href: next.href, reason: next.because + " is your lowest-scoring dimension." }] : [] },
              { title: "What This Assessment Cannot Tell You", type: "findings", items: RUBRIC.limits },
              { title: "Method", type: "text", content: RUBRIC.title + " rubric version " + RUBRIC.version + ", published at contactcentercx.com" + RUBRIC.methodology + ". Each dimension scores the mean of its statements on a 1 to 5 scale; the overall score is the equally weighted mean of the six dimensions. A dimension below 2.5 is marked Close this gap and one from 2.5 to below 3.5 is marked Monitor. Every statement answered at " + RUBRIC.failAt + " or below adds its action to the checklist, weakest dimension first." },
            ]} />
          <a href="/tools/platform-decision" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Platform Decision Matrix</a>
          <a href="/tools/contract-risk" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Contract Risk Scanner</a>
          <a href="/how-to-choose" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>All tools</a>
        </div>
      </div></section>)}
    </div>
  );
}
