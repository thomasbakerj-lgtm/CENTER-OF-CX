import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const LAYERS = [
  { n: 7, name: "Analytics + Governance", color: "#1a5276", vendorCategory: "/vendors/analytics", categoryLabel: "Analytics + WEM vendors", toolLink: "/tools/forecast-accuracy", toolLabel: "Forecast Accuracy Tracker",
    needs: ["Real-time dashboards beyond canned reports", "AI-powered QA evaluating 100% of interactions", "Closed-loop feedback from analytics to routing + coaching", "Compliance recording with audit trails", "WFM forecast accuracy within 5% at interval level"] },
  { n: 6, name: "Routing + Orchestration", color: "#1a6b8a", vendorCategory: "/vendors/acd-routing", categoryLabel: "ACD + Routing vendors", toolLink: "/tools/staffing-calculator", toolLabel: "Staffing Calculator",
    needs: ["Intent-driven routing (beyond skills-based matching)", "AI-first routing with graceful human escalation", "Cross-system orchestration (CCaaS + CRM + WFM)", "Dynamic priority based on customer value + predicted complexity", "Real-time intraday adjustment without manual intervention"] },
  { n: 5, name: "Conversation Management", color: "#1a7f9e", vendorCategory: "/vendors/digital-engagement", categoryLabel: "Digital Engagement vendors", toolLink: "/tools/aht-decomposition", toolLabel: "AHT Decomposition",
    needs: ["Unified voice + digital from a single platform", "Cross-channel context continuity (chat to phone preserves history)", "Agent desktop consolidation (under 3 applications)", "Messaging channels (WhatsApp, RCS, Apple Business Chat)", "Async conversation support with SLA management"] },
  { n: 4, name: "Reasoning + Planning", color: "#0e8c7f", vendorCategory: "/vendors/iva", categoryLabel: "43 scored IVA vendors", toolLink: "/tools/ai-deflection", toolLabel: "AI Deflection Reality Check",
    needs: ["LLM-native IVA (not purely intent-based architecture)", "Real-time agent assist during conversation (not post-call)", "Knowledge AI with RAG grounding on your enterprise data", "Autonomous task execution (actions, not just text)", "Guardrails preventing hallucination and policy violations"] },
  { n: 3, name: "Policy + Guardrails", color: "#0e7a5e", vendorCategory: "/vendors/payments", categoryLabel: "Payments + Identity vendors", toolLink: "/tools/contract-risk", toolLabel: "Contract Risk Scanner",
    needs: ["PCI fully descoped with tokenization", "AI guardrails for every customer-facing decision", "Identity verification consistent across all channels", "Bias detection and fairness monitoring for AI", "Audit trails for automated decisions"] },
  { n: 2, name: "Workflow Execution", color: "#1a6b4a", vendorCategory: "/platforms-and-tech", categoryLabel: "Platform architecture", toolLink: "/tools/integration-planner", toolLabel: "Integration Planner",
    needs: ["Top 10 workflows automated end-to-end", "API-triggered workflows (not just UI-initiated)", "Exception handling without forcing callbacks", "Cross-system data writes (not just reads)", "Workflow versioning and rollback capability"] },
  { n: 1, name: "Data Access", color: "#2c5f3f", vendorCategory: "/platforms-and-tech", categoryLabel: "Data architecture", toolLink: "/tools/cx-it-alignment", toolLabel: "CX-IT Alignment",
    needs: ["Real-time CRM read/write from agent desktop + IVA", "Event streaming capturing interaction signals", "Clean customer data (deduplicated, current, complete)", "API access to billing, case management, and ERP", "Data governance with documented ownership"] },
];

const RATINGS = [
  { value: 1, label: "Critical gap", color: RED },
  { value: 2, label: "Major gap", color: "#DC6B00" },
  { value: 3, label: "Adequate", color: AMBER },
  { value: 4, label: "Strong", color: "#7CB342" },
  { value: 5, label: "Excellent", color: GREEN },
];

export default function PlatformDecisionMatrix() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState(""); const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [scores, setScores] = useState({});
  const [currentLayer, setCurrentLayer] = useState(0);
  useEffect(() => { window.scrollTo(0,0); }, [phase]);

  const setScore = (n, i, v) => setScores(prev => ({...prev,[`${n}-${i}`]:v}));
  const layerAvg = (n) => { const l=LAYERS.find(x=>x.n===n); const v=l.needs.map((_,i)=>scores[`${n}-${i}`]||0).filter(x=>x>0); return v.length===0?0:v.reduce((a,b)=>a+b,0)/v.length; };
  const layerComplete = (n) => LAYERS.find(x=>x.n===n).needs.every((_,i)=>scores[`${n}-${i}`]>0);
  const allComplete = LAYERS.every(l=>layerComplete(l.n));

  const handleGate = async () => {
    if(!email.includes("@")) return; setSending(true);
    try{await fetch("https://formspree.io/f/maqlvwne",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,name,company,tool:"Platform Decision Matrix",_subject:"Platform Decision Matrix Access"})});}catch(e){}
    setSending(false); setPhase("assess");
  };
  const handleResults = async () => {
    const lr=LAYERS.map(l=>`L${l.n}:${layerAvg(l.n).toFixed(1)}`).join("|");
    const gaps=LAYERS.filter(l=>layerAvg(l.n)<2.5).map(l=>`L${l.n} ${l.name}`).join(", ");
    try{await fetch("https://formspree.io/f/maqlvwne",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,name,company,tool:"Platform Decision Matrix",layers:lr,criticalGaps:gaps||"None",_subject:`Platform Matrix: ${LAYERS.filter(l=>layerAvg(l.n)<2.5).length} critical gaps — ${company||name||email}`})});}catch(e){}
    setPhase("results");
  };

  const getRec = (avg) => {
    if(avg>=4) return{action:"Stay",color:GREEN,desc:"Current platform serves this layer. Optimize, do not replace."};
    if(avg>=3) return{action:"Extend",color:AMBER,desc:"Approaching limits. Evaluate add-ons or integrations to close gaps before next renewal."};
    if(avg>=2) return{action:"Evaluate",color:"#DC6B00",desc:"Significant gap. Determine whether current vendor roadmap closes it or a specialist is needed."};
    return{action:"Replace",color:RED,desc:"Critical gap. Current platform cannot serve this layer. Begin vendor evaluation."};
  };

  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",minHeight:"100vh"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.pg{grid-template-columns:1fr!important}}`}</style>
      <nav style={{background:DEEP,padding:"16px 0"}}><div style={{...WRAP,display:"flex",alignItems:"center",justifyContent:"space-between"}}><a href="/" style={{display:"flex",alignItems:"center",gap:10}}><LogoMark size={30}/><span style={{color:"#fff",fontWeight:600,fontSize:14}}>THE CENTER OF <span style={{color:LIGHT}}>CX</span></span></a><a href="/how-to-choose" style={{color:"rgba(255,255,255,0.5)",fontSize:13}}>← Back to Tools</a></div></nav>

      {phase==="gate"&&(<section style={{background:`linear-gradient(168deg,${DEEP},${NAVY})`,padding:"80px 28px 60px"}}><div style={{...WRAP,maxWidth:520}}>
        <span style={{color:LIGHT,fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:12}}>Vendor Selection</span>
        <h1 style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:32,fontWeight:400,color:"#fff",lineHeight:1.15,margin:"0 0 12px"}}>Platform Decision Matrix</h1>
        <p style={{fontSize:15,color:"rgba(255,255,255,0.5)",lineHeight:1.65,marginBottom:32}}>Assess your current platform across all 7 orchestration layers. Get a layer-by-layer recommendation with direct paths to scored vendors and diagnostic tools for every gap identified.</p>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <input type="text" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} style={{padding:"12px 14px",fontSize:14,border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,background:"rgba(255,255,255,0.04)",color:"#fff",outline:"none"}}/>
          <input type="text" placeholder="Company" value={company} onChange={e=>setCompany(e.target.value)} style={{padding:"12px 14px",fontSize:14,border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,background:"rgba(255,255,255,0.04)",color:"#fff",outline:"none"}}/>
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{padding:"12px 14px",fontSize:14,border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,background:"rgba(255,255,255,0.04)",color:"#fff",outline:"none"}}/>
          <button onClick={handleGate} disabled={sending||!email.includes("@")} style={{padding:"14px",fontSize:15,fontWeight:600,background:email.includes("@")?ELECTRIC:SLATE,color:"#fff",border:"none",borderRadius:8,cursor:"pointer",opacity:email.includes("@")?1:0.5}}>{sending?"Loading...":"Start Assessment →"}</button>
        </div>
      </div></section>)}

      {phase==="assess"&&(<section style={{background:"#fff",padding:"40px 28px 60px"}}><div style={{...WRAP,maxWidth:700}}>
        <div style={{display:"flex",gap:4,marginBottom:24,flexWrap:"wrap"}}>
          {LAYERS.map((l,i)=>(<button key={l.n} onClick={()=>setCurrentLayer(i)} style={{padding:"6px 12px",fontSize:11,fontWeight:600,borderRadius:6,cursor:"pointer",border:`1px solid ${i===currentLayer?l.color:layerComplete(l.n)?GREEN:BORDER}`,background:i===currentLayer?l.color:layerComplete(l.n)?`${GREEN}08`:"#fff",color:i===currentLayer?"#fff":layerComplete(l.n)?GREEN:MUTED}}>{layerComplete(l.n)?"✓ ":""}L{l.n}</button>))}
        </div>
        {(()=>{const layer=LAYERS[currentLayer]; return(<div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
            <div style={{width:32,height:32,borderRadius:6,background:layer.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontFamily:"'Instrument Serif',Georgia,serif",fontSize:16}}>{layer.n}</div>
            <h2 style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:22,fontWeight:400,color:NAVY,margin:0}}>{layer.name}</h2>
          </div>
          <p style={{fontSize:13,color:MUTED,marginBottom:20}}>Rate your current platform for each capability at this layer.</p>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {layer.needs.map((need,ni)=>(<div key={ni} style={{background:WARM,border:`1px solid ${scores[`${layer.n}-${ni}`]?layer.color+"30":BORDER}`,borderRadius:8,padding:"14px 16px"}}>
              <p style={{fontSize:13,color:NAVY,margin:"0 0 10px",fontWeight:500}}>{need}</p>
              <div style={{display:"flex",gap:4}}>
                {RATINGS.map(r=>(<button key={r.value} onClick={()=>setScore(layer.n,ni,r.value)} style={{flex:1,padding:"6px 4px",fontSize:10,fontWeight:600,borderRadius:4,cursor:"pointer",border:`1px solid ${scores[`${layer.n}-${ni}`]===r.value?r.color:BORDER}`,background:scores[`${layer.n}-${ni}`]===r.value?r.color:"#fff",color:scores[`${layer.n}-${ni}`]===r.value?"#fff":MUTED}}>{r.label}</button>))}
              </div>
            </div>))}
          </div>
          <div style={{display:"flex",justifyContent:"space-between",marginTop:20}}>
            <button onClick={()=>setCurrentLayer(Math.max(0,currentLayer-1))} disabled={currentLayer===0} style={{padding:"10px 20px",fontSize:13,fontWeight:600,borderRadius:6,border:`1px solid ${BORDER}`,background:"#fff",color:currentLayer===0?MUTED:NAVY,cursor:"pointer",opacity:currentLayer===0?0.5:1}}>← Previous</button>
            {currentLayer<LAYERS.length-1?
              <button onClick={()=>setCurrentLayer(currentLayer+1)} style={{padding:"10px 20px",fontSize:13,fontWeight:600,borderRadius:6,border:"none",background:layer.color,color:"#fff",cursor:"pointer"}}>Next: L{LAYERS[currentLayer+1].n} →</button>:
              <button onClick={handleResults} disabled={!allComplete} style={{padding:"10px 24px",fontSize:13,fontWeight:600,borderRadius:6,border:"none",background:allComplete?GREEN:MUTED,color:"#fff",cursor:"pointer",opacity:allComplete?1:0.5}}>{allComplete?"See Recommendations →":"Complete all layers"}</button>
            }
          </div>
        </div>);})()}
      </div></section>)}

      {phase==="results"&&(<section style={{background:"#fff",padding:"40px 28px 60px"}}><div style={WRAP}>
        <h2 style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:28,fontWeight:400,color:NAVY,margin:"0 0 8px",textAlign:"center"}}>Your Platform Recommendations</h2>
        <p style={{fontSize:13,color:MUTED,textAlign:"center",marginBottom:32}}>Layer-by-layer assessment with specific next steps for every gap.</p>

        {/* Summary counts */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:28}} className="pg">
          {[["Stay",GREEN],["Extend",AMBER],["Evaluate","#DC6B00"],["Replace",RED]].map(([label,color])=>{
            const count=LAYERS.filter(l=>getRec(layerAvg(l.n)).action===label).length;
            return(<div key={label} style={{textAlign:"center",padding:"16px",background:`${color}08`,border:`1px solid ${color}20`,borderRadius:10}}>
              <div style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:32,color}}>{count}</div>
              <div style={{fontSize:12,fontWeight:600,color}}>{label}</div>
            </div>);
          })}
        </div>

        {/* Layer-by-layer results with contextual links */}
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:32}}>
          {LAYERS.map(layer=>{
            const avg=layerAvg(layer.n);
            const rec=getRec(avg);
            const needsAction=rec.action==="Replace"||rec.action==="Evaluate";
            return(<div key={layer.n} style={{background:needsAction?`${rec.color}04`:WARM,border:`1px solid ${needsAction?rec.color+"30":BORDER}`,borderRadius:12,padding:"20px",borderLeft:`4px solid ${layer.color}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:240}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                    <span style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:20,color:layer.color}}>L{layer.n}</span>
                    <span style={{fontSize:14,fontWeight:600,color:NAVY}}>{layer.name}</span>
                  </div>
                  <p style={{fontSize:12,color:MUTED,margin:"0 0 8px"}}>{rec.desc}</p>

                  {/* Contextual next steps for gaps */}
                  {needsAction&&(<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
                    <a href={layer.vendorCategory} style={{fontSize:11,fontWeight:600,color:"#fff",padding:"5px 12px",borderRadius:5,background:rec.color}}>See {layer.categoryLabel} →</a>
                    <a href={layer.toolLink} style={{fontSize:11,fontWeight:600,color:rec.color,padding:"5px 12px",borderRadius:5,border:`1px solid ${rec.color}30`,background:`${rec.color}06`}}>{layer.toolLabel} →</a>
                    <a href="/tools/vendor-match" style={{fontSize:11,fontWeight:600,color:ELECTRIC,padding:"5px 12px",borderRadius:5,border:`1px solid ${ELECTRIC}30`,background:`${ELECTRIC}06`}}>Find matching vendors →</a>
                  </div>)}

                  {rec.action==="Extend"&&(<div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>
                    <a href={layer.toolLink} style={{fontSize:11,fontWeight:600,color:AMBER,padding:"5px 12px",borderRadius:5,border:`1px solid ${AMBER}30`,background:`${AMBER}06`}}>Diagnose with {layer.toolLabel} →</a>
                  </div>)}
                </div>
                <div style={{textAlign:"center",flexShrink:0}}>
                  <div style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:28,color:avg>=3.5?GREEN:avg>=2.5?AMBER:RED}}>{avg.toFixed(1)}</div>
                  <div style={{padding:"4px 12px",borderRadius:6,background:`${rec.color}12`,color:rec.color,fontSize:12,fontWeight:700,marginTop:4}}>{rec.action}</div>
                </div>
              </div>
            </div>);
          })}
        </div>

        {/* CTA */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}} className="pg">
          <a href="/contact" style={{display:"block",background:`linear-gradient(135deg,${NAVY},${DEEP})`,borderRadius:12,padding:"28px 24px",textAlign:"center",textDecoration:"none"}}>
            <div style={{fontSize:11,fontWeight:700,color:LIGHT,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>Build Your Migration Plan</div>
            <div style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:20,color:"#fff",marginBottom:8}}>Speak with a CX Consultant</div>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.45)",lineHeight:1.5,margin:"0 0 12px"}}>Prioritize which layers to address first based on your risk, budget, and timeline.</p>
            <span style={{display:"inline-block",background:ELECTRIC,color:"#fff",fontSize:13,fontWeight:600,padding:"10px 22px",borderRadius:6}}>Request Working Session →</span>
          </a>
          <a href="/tools/vendor-match" style={{display:"block",background:`${ELECTRIC}06`,border:`1px solid ${ELECTRIC}30`,borderRadius:12,padding:"28px 24px",textAlign:"center",textDecoration:"none"}}>
            <div style={{fontSize:11,fontWeight:700,color:ELECTRIC,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>Find the Right Vendors</div>
            <div style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:20,color:NAVY,marginBottom:8}}>Run the Vendor Match Engine</div>
            <p style={{fontSize:12,color:SLATE,lineHeight:1.5,margin:"0 0 12px"}}>Get a ranked vendor shortlist based on your operation, priorities, and the gaps identified here.</p>
            <span style={{display:"inline-block",background:ELECTRIC,color:"#fff",fontSize:13,fontWeight:600,padding:"10px 22px",borderRadius:6}}>Match Me to Vendors →</span>
          </a>
        </div>

        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <a href="/tools/contract-risk" style={{background:WARM,border:`1px solid ${BORDER}`,color:NAVY,fontSize:14,fontWeight:600,padding:"12px 24px",borderRadius:8}}>Contract Risk Scanner →</a>
          <a href="/tools/transformation-readiness" style={{background:WARM,border:`1px solid ${BORDER}`,color:NAVY,fontSize:14,fontWeight:600,padding:"12px 24px",borderRadius:8}}>Transformation Readiness →</a>
          <a href="/research/orchestration-framework" style={{background:WARM,border:`1px solid ${BORDER}`,color:NAVY,fontSize:14,fontWeight:600,padding:"12px 24px",borderRadius:8}}>Download Framework PDF →</a>
        </div>
      </div></section>)}
    </div>
  );
}
