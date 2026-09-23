import { useState, useEffect } from "react";
import { ToolNav, ToolHero, ToolStart } from "./src/lib/ToolShell";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#5B6E88"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const DIMS = [
  { id: "leadership", name: "Leadership Alignment", color: ELECTRIC, fixTool: "/tools/cx-it-alignment", fixLabel: "CX-IT Alignment Framework", fixDesc: "Bridge the gap between CX vision and IT execution.",
    qs: [
      { q: "Executive sponsor is named, active, and has authority over budget and timeline." },
      { q: "CX, IT, and operations leadership agree on transformation objectives and success metrics." },
      { q: "The business case has been approved with realistic ROI expectations (not vendor projections)." },
      { q: "There is organizational tolerance for a 6-12 month transition period with potential service dips." },
    ]},
  { id: "budget", name: "Budget + Timeline Realism", color: AMBER, fixTool: "/tco-calculator", fixLabel: "TCO Calculator", fixDesc: "Build the honest budget including hidden costs.",
    qs: [
      { q: "Budget includes implementation, integration, training, parallel-run, and 6 months of contingency." },
      { q: "Timeline accounts for vendor selection (3-4mo), implementation (4-8mo), and stabilization (3-6mo)." },
      { q: "Dual-platform costs during migration are budgeted, not assumed to be zero." },
      { q: "Budget exists for internal backfill or contractors to cover team members dedicated to the project." },
    ]},
  { id: "team", name: "Team Capacity + Skills", color: GREEN, fixTool: "/tools/staffing-calculator", fixLabel: "Staffing Calculator", fixDesc: "Model the FTE impact of dedicating team members to the project.",
    qs: [
      { q: "A dedicated project team is identified with at least 50% allocation (not doing migration on the side)." },
      { q: "Technical resources (integration, telephony, data) are available or planned for hire." },
      { q: "Contact center SMEs (WFM, QA, training, ops) are included in the project team." },
      { q: "The team has experience with at least one prior platform migration or major technology change." },
    ]},
  { id: "vendor", name: "Vendor Selection Maturity", color: "#7C3AED", fixTool: "/tools/vendor-match", fixLabel: "Vendor Match Engine", fixDesc: "Get a ranked shortlist based on your environment and priorities.",
    qs: [
      { q: "Requirements are documented, weighted, and reflect actual operational needs." },
      { q: "At least 3 vendors evaluated with structured demos using your scenarios, not vendor scripts." },
      { q: "Reference checks completed with orgs of similar size, vertical, and complexity." },
      { q: "Contract terms reviewed for rate locks, exit clauses, SLAs, and data portability." },
    ]},
  { id: "technical", name: "Technical Readiness", color: "#0EA5E9", fixTool: "/vendors", fixLabel: "Vendor Intelligence", fixDesc: "Review the integration and architecture notes for the platforms in scope.",
    qs: [
      { q: "Integration dependencies mapped (CRM, WFM, QA, knowledge, identity, payments, reporting)." },
      { q: "Data migration strategy defined (what moves, what stays, what gets rebuilt)." },
      { q: "Network and telephony requirements assessed (BYOC, SIP, bandwidth, latency)." },
      { q: "Security and compliance requirements documented and validated against the new platform." },
    ]},
  { id: "change", name: "Change Management", color: "#EC4899", fixTool: "/tools/roadmap-builder", fixLabel: "Roadmap Builder", fixDesc: "Build a phased plan with milestones and dependencies.",
    qs: [
      { q: "Training plan exists for agents, supervisors, QA, WFM, and IT (not just vendor certification)." },
      { q: "Communication plan addresses all stakeholders: frontline, management, executive, customer-facing." },
      { q: "Phased rollout strategy defined (not a hard cutover for the entire operation)." },
      { q: "Success metrics defined for each phase: stabilization, adoption, and outcome metrics." },
    ]},
];

const LEVELS = [
  { min:0, max:1.5, tier:"Not Ready", color:RED, phase:"Pause. Close critical gaps before engaging vendors." },
  { min:1.5, max:2.5, tier:"Early Stage", color:"#DC6B00", phase:"Phase 1 only: requirements and vendor evaluation." },
  { min:2.5, max:3.5, tier:"Developing", color:AMBER, phase:"Proceed with caution. Address gaps in parallel." },
  { min:3.5, max:4.2, tier:"Ready", color:"#7CB342", phase:"Proceed. Maintain governance rigor." },
  { min:4.2, max:5.1, tier:"Strong", color:GREEN, phase:"Execute with confidence." },
];
const getTier = (s) => LEVELS.find(l=>s>=l.min&&s<l.max)||LEVELS[LEVELS.length-1];

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
const isComplete = (scores) => DIMS.every(d => d.qs.every((_, i) => scores[`${d.id}-${i}`] > 0));

export default function TransformationReadiness() {
  const [init] = useState(() => { const sc = readScenario(TOOL_ID, DEFAULTS); return { scores: cleanScores(sc && sc.scores) }; });
  const [phase, setPhase] = useState(() => (isComplete(init.scores) ? "results" : "intro"));
  const [currentDim, setCurrentDim] = useState(0);
  const [scores, setScores] = useState(init.scores);
  useEffect(() => { window.scrollTo(0, 0); }, [phase]);
  useEffect(() => { clearScenarioParam(); }, []);

  const setScore = (id,qi,v) => setScores(prev=>({...prev,[`${id}-${qi}`]:v}));
  const dimScore = (id) => { const d=DIMS.find(x=>x.id===id); const v=d.qs.map((_,i)=>scores[`${id}-${i}`]||0).filter(x=>x>0); return v.length===0?0:v.reduce((a,b)=>a+b,0)/v.length; };
  const dimComplete = (id) => DIMS.find(x=>x.id===id).qs.every((_,i)=>scores[`${id}-${i}`]>0);
  const allComplete = DIMS.every(d=>dimComplete(d.id));
  const overallScore = DIMS.reduce((a,d)=>a+dimScore(d.id),0)/DIMS.length;
  const tier = getTier(overallScore);
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
          <ToolStart label="Start Assessment" onStart={handleStart} />
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

      {phase === "results"&&(<section style={{background:"#fff",padding:"40px 28px 60px"}}><div style={WRAP}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <span style={{fontSize:11,fontWeight:700,color:tier.color,letterSpacing:2,textTransform:"uppercase"}}>Transformation Readiness</span>
          <div style={{fontFamily:FONT,fontSize:56,color:tier.color,margin:"8px 0"}}>{overallScore.toFixed(1)}<span style={{fontSize:24,color:MUTED}}>/5</span></div>
          <div style={{fontSize:18,fontWeight:600,color:NAVY,marginBottom:4}}>{tier.tier}</div>
          <div style={{background:`${tier.color}08`,border:`2px solid ${tier.color}`,borderRadius:8,padding:"12px 20px",display:"inline-block",marginTop:8}}>
            <span style={{fontSize:14,fontWeight:600,color:NAVY}}>{tier.phase}</span>
          </div>
        </div>

        {/* Dimension results with tool chaining */}
        <h3 style={{fontSize:14,fontWeight:600,color:NAVY,marginBottom:12}}>Dimension Scores + Recommended Actions</h3>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
          {[...DIMS].sort((a,b)=>dimScore(a.id)-dimScore(b.id)).map(d=>{
            const sc=dimScore(d.id);
            const isWeak=sc<2.5;
            const isModerate=sc>=2.5&&sc<3.5;
            return(<div key={d.id} style={{background:isWeak?`${RED}04`:WARM,border:`1px solid ${isWeak?RED+"30":BORDER}`,borderRadius:10,padding:"18px 20px",borderLeft:`4px solid ${d.color}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:200}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{fontSize:14,fontWeight:600,color:NAVY}}>{d.name}</span>
                    {isWeak&&<span style={{fontSize:12,fontWeight:700,color:RED,padding:"2px 8px",borderRadius:4,background:`${RED}10`}}>CLOSE THIS GAP</span>}
                    {isModerate&&<span style={{fontSize:12,fontWeight:700,color:AMBER,padding:"2px 8px",borderRadius:4,background:`${AMBER}10`}}>MONITOR</span>}
                  </div>
                  <div style={{height:5,background:`${d.color}15`,borderRadius:3,overflow:"hidden",marginBottom:8,maxWidth:300}}>
                    <div style={{height:"100%",width:`${(sc/5)*100}%`,background:d.color,borderRadius:3}}/>
                  </div>
                  {(isWeak||isModerate)&&(<a href={d.fixTool} style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:12,fontWeight:600,color:ELECTRIC,padding:"6px 14px",borderRadius:5,border:`1px solid ${ELECTRIC}30`,background:`${ELECTRIC}06`,marginTop:4}}>
                    Use: {d.fixLabel} →
                  </a>)}
                  {(isWeak||isModerate)&&<p style={{fontSize:12,color:MUTED,margin:"6px 0 0"}}>{d.fixDesc}</p>}
                </div>
                <div style={{textAlign:"center",flexShrink:0}}>
                  <div style={{fontFamily:FONT,fontSize:28,color:sc>=3.5?GREEN:sc>=2.5?AMBER:RED}}>{sc.toFixed(1)}</div>
                  <div style={{fontSize:12,color:MUTED}}>/5</div>
                </div>
              </div>
            </div>);
          })}
        </div>

        {/* Personalized tool roadmap */}
        {(()=>{
          const gaps=DIMS.filter(d=>dimScore(d.id)<3.5).sort((a,b)=>dimScore(a.id)-dimScore(b.id));
          if(gaps.length===0) return null;
          return(<div style={{background:`linear-gradient(135deg,${NAVY},${DEEP})`,borderRadius:12,padding:"24px 28px",marginBottom:24}}>
            <h3 style={{fontSize:13,fontWeight:700,color:LIGHT,letterSpacing:1.5,textTransform:"uppercase",marginBottom:12}}>Your Readiness Roadmap</h3>
            <p style={{fontSize:13,color:"rgba(255,255,255,0.45)",lineHeight:1.6,margin:"0 0 16px"}}>Close these gaps in order before committing to a transformation timeline:</p>
            {gaps.map((d,i)=>(<div key={d.id} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:i<gaps.length-1?"1px solid rgba(255,255,255,0.06)":"none"}}>
              <span style={{fontFamily:FONT,fontSize:18,color:LIGHT,width:24}}>{i+1}</span>
              <span style={{fontSize:13,color:"#fff",flex:1}}>{d.name} <span style={{color:"rgba(255,255,255,0.35)"}}>({dimScore(d.id).toFixed(1)}/5)</span></span>
              <a href={d.fixTool} style={{fontSize:12,fontWeight:600,color:LIGHT,padding:"4px 10px",borderRadius:4,border:"1px solid rgba(255,255,255,0.15)"}}>{d.fixLabel} →</a>
            </div>))}
          </div>);
        })()}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}} className="pg">
          <a href="/contact" style={{display:"block",background:`linear-gradient(135deg,${NAVY},${DEEP})`,borderRadius:12,padding:"28px 24px",textAlign:"center",textDecoration:"none"}}>
            <div style={{fontFamily:FONT,fontSize:20,color:"#fff",marginBottom:8}}>Build Your Readiness Plan</div>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.45)",lineHeight:1.5,margin:"0 0 12px"}}>A working session to sequence gap closure and build the readiness plan before you commit budget.</p>
            <span style={{display:"inline-block",background:ELECTRIC,color:"#fff",fontSize:13,fontWeight:600,padding:"10px 22px",borderRadius:6}}>Request Working Session →</span>
          </a>
          <a href="/tools/vendor-match" style={{display:"block",background:`${ELECTRIC}06`,border:`1px solid ${ELECTRIC}30`,borderRadius:12,padding:"28px 24px",textAlign:"center",textDecoration:"none"}}>
            <div style={{fontFamily:FONT,fontSize:20,color:NAVY,marginBottom:8}}>Ready to Evaluate Vendors?</div>
            <p style={{fontSize:12,color:SLATE,lineHeight:1.5,margin:"0 0 12px"}}>If your score is 3.5+, the Vendor Match Engine produces a ranked shortlist based on your environment.</p>
            <span style={{display:"inline-block",background:ELECTRIC,color:"#fff",fontSize:13,fontWeight:600,padding:"10px 22px",borderRadius:6}}>Match Me to Vendors →</span>
          </a>
        </div>

        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          
                <ReportActions toolId={TOOL_ID} toolName="Transformation Readiness" subtitle={"Score: " + overallScore.toFixed(1) + "/5, " + tier.tier} routePath={ROUTE} state={{ scores }} defaults={DEFAULTS} summary={[{ label: "Readiness score", value: overallScore.toFixed(1) + "/5" }, { label: "Readiness tier", value: tier.tier }]} sections={[
                    { title: "Dimension Scores", type: "table", rows: DIMS.map(d => [d.name, dimScore(d.id).toFixed(1) + "/5"]) },
                    { title: "Assessment", type: "metrics", items: [
                      { label: "Readiness", value: overallScore.toFixed(1) + "/5", color: tier.color },
                      { label: "Status", value: tier.tier, color: tier.color },
                    ]},
                    { title: "Recommendation", type: "text", content: tier.phase },
                    { title: "Gaps to Close", type: "findings", items: DIMS.filter(d => dimScore(d.id) < 3.5).sort((a,b) => dimScore(a.id) - dimScore(b.id)).map(d => d.name + " (" + dimScore(d.id).toFixed(1) + "): Use " + d.fixLabel).concat(DIMS.filter(d => dimScore(d.id) < 3.5).length === 0 ? ["Ready to proceed."] : []) },
                    { title: "Next Steps", type: "next", items: [
                      { tool: "Vendor Match Engine", reason: "Get ranked shortlist if score is 3.5+" },
                      { tool: "Platform Decision Matrix", reason: "Assess current platform before committing" },
                    ]},
                  ]} />
                <a href="/tools/platform-decision" style={{background:WARM,border:`1px solid ${BORDER}`,color:NAVY,fontSize:14,fontWeight:600,padding:"12px 24px",borderRadius:8}}>Platform Decision Matrix →</a>
          <a href="/tools/contract-risk" style={{background:WARM,border:`1px solid ${BORDER}`,color:NAVY,fontSize:14,fontWeight:600,padding:"12px 24px",borderRadius:8}}>Contract Risk Scanner →</a>
          <a href="/how-to-choose" style={{background:WARM,border:`1px solid ${BORDER}`,color:NAVY,fontSize:14,fontWeight:600,padding:"12px 24px",borderRadius:8}}>Explore All 29 Tools</a>
        </div>
      </div></section>)}
    </div>
  );
}
