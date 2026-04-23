import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const TERMS = [
  { id: "length", name: "Contract Length", options: [
    { val: "1 year", level: "low", note: "Maximum flexibility. Less pricing leverage but no long-term lock.", negotiate: "" },
    { val: "2 years", level: "low", note: "Standard. Balanced leverage and flexibility.", negotiate: "" },
    { val: "3 years", level: "medium", note: "Common for enterprise. Ensure rate locks cover the full term.", negotiate: "Push for full-term rate lock. Request mid-term review clause at 18 months with renegotiation rights if usage changes by more than 20%." },
    { val: "5 years", level: "high", note: "Locks you through massive technology change. AI capabilities will evolve significantly.", negotiate: "Request a technology refresh clause allowing platform or tier changes at Year 3. Include mid-term rate reset if vendor introduces consumption pricing." },
  ]},
  { id: "renewal", name: "Auto-Renewal Notice Window", options: [
    { val: "30 days", level: "low", note: "Reasonable notice period.", negotiate: "" },
    { val: "60 days", level: "medium", note: "Set a calendar reminder 9 months before expiration.", negotiate: "Push for 30-day notice. If they insist on 60, request that notice can be delivered via email (not certified mail only)." },
    { val: "90 days", level: "high", note: "You must decide a full quarter before expiration.", negotiate: "Negotiate down to 60 days. If they hold at 90, require vendor to send a written renewal reminder 120 days before expiration." },
    { val: "180 days", level: "critical", note: "6 months notice. Start vendor evaluation 12 months before expiration.", negotiate: "This is a dealbreaker for most buyers. Push hard for 60-90 days. If they refuse, add a clause requiring written notice from vendor at 210 days." },
  ]},
  { id: "rateLock", name: "Rate Lock Duration", options: [
    { val: "Full term", level: "low", note: "Ideal. Your price is your price for the contract duration.", negotiate: "" },
    { val: "Year 1 only", level: "high", note: "Exposed to 15-30% increases in Year 2+. Most common vendor tactic.", negotiate: "Negotiate full-term lock. Fallback: cap increases at 3-5% annually. Never accept uncapped Year 2+ pricing." },
    { val: "CPI-linked", level: "medium", note: "Reasonable if capped at 3-5%. Watch for uncapped CPI escalators.", negotiate: "Ensure CPI is capped at 5% maximum per year. Specify which CPI index is used (CPI-U, not industry-specific)." },
    { val: "No rate lock", level: "critical", note: "Vendor can raise prices at any renewal. Walk unless corrected.", negotiate: "This is non-negotiable. Demand at minimum Year 1-2 lock with 5% annual cap thereafter. If vendor refuses, they are telling you something about their pricing trajectory." },
  ]},
  { id: "sla", name: "Uptime SLA + Consequences", options: [
    { val: "99.999% with credits", level: "low", note: "Gold standard. Verify credit calculation and maximum cap.", negotiate: "" },
    { val: "99.99% with credits", level: "low", note: "Standard enterprise. ~52 minutes downtime per year.", negotiate: "Ensure credits are meaningful (10-25% of monthly fee per breach, not 1%). Verify measurement methodology (customer-facing, not infrastructure-only)." },
    { val: "99.9% with credits", level: "medium", note: "8.7 hours downtime per year. Only acceptable for non-critical.", negotiate: "Push for 99.99%. If they hold at 99.9%, demand higher credit percentages (25%+ per incident) to create financial incentive for reliability." },
    { val: "99.9% no credits", level: "high", note: "SLA without financial consequence is not an SLA.", negotiate: "Add credit structure. Minimum: 10% monthly credit for each 0.01% below target. This turns a suggestion into a commitment." },
    { val: "No SLA", level: "critical", note: "Unacceptable for production contact center.", negotiate: "Do not proceed without an SLA. This is non-negotiable. If vendor will not commit to uptime, they are not ready for enterprise." },
  ]},
  { id: "termination", name: "Early Termination Rights", options: [
    { val: "Mutual 90-day notice", level: "low", note: "Either party can exit with notice. Best case.", negotiate: "" },
    { val: "Pay remaining term", level: "critical", note: "Financial trap if platform fails to deliver.", negotiate: "Negotiate to 50% of remaining term maximum. Add performance-based exit: if SLA is breached 3+ times in any 6-month period, termination without penalty." },
    { val: "Pay 50% remaining", level: "high", note: "Painful but survivable.", negotiate: "Push to 25-30% of remaining term. Add declining termination fee: 50% in Year 1, 25% in Year 2, 0% in Year 3. Performance exit clause still applies." },
    { val: "Termination for cause only", level: "high", note: "'Cause' is narrowly defined. Performance failures rarely qualify.", negotiate: "Expand 'cause' definition to include: 3+ SLA breaches in 6 months, failure to deliver contracted features within 6 months of promised date, material security incident." },
  ]},
  { id: "data", name: "Data Portability + Ownership", options: [
    { val: "Full export, standard format, 30 days", level: "low", note: "You own your data and can leave with it.", negotiate: "" },
    { val: "Export available, proprietary format", level: "medium", note: "You can get data but need transformation.", negotiate: "Request standard format options (CSV, JSON, XML). Include API access for data extraction during transition period." },
    { val: "Export on request, additional cost", level: "high", note: "Data hostage increases lock-in.", negotiate: "Remove the cost. Data portability should be a contract right, not a billable service. Include transition support at no charge for 90 days post-termination." },
    { val: "No export clause", level: "critical", note: "Your interaction data stays with vendor. Dealbreaker.", negotiate: "Add explicit clause: all customer data, interaction recordings, analytics, and model training data is customer property. Export in standard format within 30 days of request." },
  ]},
  { id: "addons", name: "Add-On Pricing Commitment", options: [
    { val: "All modules priced in contract", level: "low", note: "You know your full cost. Ideal.", negotiate: "" },
    { val: "Key modules priced, others at list", level: "medium", note: "Acceptable if 'key' covers WEM, QA, analytics, AI.", negotiate: "Define 'key modules' explicitly. Include a most-favored-customer clause: if vendor offers better pricing to a comparable customer, you get the same rate." },
    { val: "List pricing at time of purchase", level: "high", note: "List prices increase. You pay more than new customers.", negotiate: "Lock add-on pricing for modules you anticipate needing within 18 months. Include 15-20% discount guarantee off list for any module added during the term." },
    { val: "No pricing committed", level: "critical", note: "Base seat price is meaningless. The gap runs 40-100%.", negotiate: "Get every module priced before signing. Use our License Bundle Gap Checker to identify the modules you need. If vendor refuses to price them, the base seat price is a marketing number, not a budget number." },
  ]},
];

export default function ContractRiskScanner() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [selections, setSelections] = useState({});
  useEffect(() => { window.scrollTo(0,0); }, [phase]);
  const setTerm = (id, val) => setSelections(prev => ({...prev,[id]:val}));

  const handleGate = async () => {
    if(!email.includes("@")) return; setSending(true);
    try{await fetch("https://formspree.io/f/maqlvwne",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,name,tool:"Contract Risk Scanner",_subject:"Contract Risk Scanner Access"})});}catch(e){}
    setSending(false); setPhase("calc");
  };

  const analyzed = TERMS.map(t => {
    const opt = t.options.find(o => o.val === selections[t.id]);
    return { ...t, selected: selections[t.id], opt };
  });
  const riskCounts = { low:0, medium:0, high:0, critical:0 };
  analyzed.forEach(a => { if(a.opt) riskCounts[a.opt.level]++; });
  const totalFlags = riskCounts.high + riskCounts.critical;
  const allAnswered = TERMS.every(t => selections[t.id]);
  const flaggedTerms = analyzed.filter(a => a.opt && (a.opt.level === "high" || a.opt.level === "critical"));

  const overallRisk = riskCounts.critical>=2?"High Risk":riskCounts.critical>=1||riskCounts.high>=3?"Elevated Risk":riskCounts.high>=1?"Moderate Risk":"Low Risk";
  const overallColor = riskCounts.critical>=2?RED:riskCounts.critical>=1||riskCounts.high>=3?"#DC6B00":riskCounts.high>=1?AMBER:GREEN;

  const handleSendFlags = async () => {
    const flags = flaggedTerms.map(f => `${f.name}: ${f.selected} (${f.opt.level})`).join(" | ");
    try{await fetch("https://formspree.io/f/maqlvwne",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,name,tool:"Contract Risk Scanner",overallRisk,flaggedTerms:flags,_subject:`Contract Review: ${totalFlags} flags (${overallRisk}) — ${name||email}`})});}catch(e){}
  };

  const riskColors = { low: GREEN, medium: AMBER, high: "#DC6B00", critical: RED };

  return(
    <div style={{fontFamily:"'DM Sans',sans-serif",minHeight:"100vh"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.pg{grid-template-columns:1fr!important}}`}</style>
      <nav style={{background:DEEP,padding:"16px 0"}}><div style={{...WRAP,display:"flex",alignItems:"center",justifyContent:"space-between"}}><a href="/" style={{display:"flex",alignItems:"center",gap:10}}><LogoMark size={30}/><span style={{color:"#fff",fontWeight:600,fontSize:14}}>THE CENTER OF <span style={{color:LIGHT}}>CX</span></span></a><a href="/how-to-choose" style={{color:"rgba(255,255,255,0.5)",fontSize:13}}>← Back to Tools</a></div></nav>

      {phase==="gate"&&(<section style={{background:`linear-gradient(168deg,${DEEP},${NAVY})`,padding:"80px 28px 60px"}}><div style={{...WRAP,maxWidth:520}}>
        <span style={{color:RED,fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:12}}>Vendor Selection</span>
        <h1 style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:32,fontWeight:400,color:"#fff",lineHeight:1.15,margin:"0 0 12px"}}>Contract Risk Scanner</h1>
        <p style={{fontSize:15,color:"rgba(255,255,255,0.5)",lineHeight:1.65,marginBottom:32}}>Select your contract terms across 7 critical areas. Get risk analysis, specific negotiation language, and a checklist you can bring to your next vendor conversation.</p>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <input type="text" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} style={{padding:"12px 14px",fontSize:14,border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,background:"rgba(255,255,255,0.04)",color:"#fff",outline:"none"}}/>
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{padding:"12px 14px",fontSize:14,border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,background:"rgba(255,255,255,0.04)",color:"#fff",outline:"none"}}/>
          <button onClick={handleGate} disabled={sending||!email.includes("@")} style={{padding:"14px",fontSize:15,fontWeight:600,background:email.includes("@")?RED:SLATE,color:"#fff",border:"none",borderRadius:8,cursor:"pointer",opacity:email.includes("@")?1:0.5}}>{sending?"Loading...":"Launch Scanner →"}</button>
        </div>
      </div></section>)}

      {phase==="calc"&&(<section style={{background:"#fff",padding:"40px 28px 60px"}}><div style={WRAP}>
        <h2 style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:24,fontWeight:400,color:NAVY,margin:"0 0 8px"}}>Contract Risk Scanner</h2>
        <p style={{fontSize:13,color:MUTED,marginBottom:24}}>Select your current or proposed terms. Risk assessment and negotiation guidance update in real time.</p>

        {allAnswered&&(<div style={{background:`${overallColor}08`,border:`2px solid ${overallColor}`,borderRadius:12,padding:"20px 24px",marginBottom:24,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
          <div>
            <div style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:28,color:overallColor}}>{overallRisk}</div>
            <div style={{fontSize:13,color:SLATE}}>{totalFlags} terms flagged as high or critical risk</div>
          </div>
          <div style={{display:"flex",gap:12}}>
            {[["Critical",riskCounts.critical,RED],["High",riskCounts.high,"#DC6B00"],["Medium",riskCounts.medium,AMBER],["Low",riskCounts.low,GREEN]].map(([l,c,color])=>(<div key={l} style={{textAlign:"center"}}><div style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:20,color}}>{c}</div><div style={{fontSize:10,color:MUTED}}>{l}</div></div>))}
          </div>
        </div>)}

        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {analyzed.map((term,i) => {
            const rc = term.opt ? riskColors[term.opt.level] : BORDER;
            return(<div key={term.id} style={{background:WARM,border:`1px solid ${term.opt?rc+"40":BORDER}`,borderRadius:10,padding:"18px 20px",borderLeft:term.opt?`4px solid ${rc}`:"4px solid transparent"}}>
              <div style={{fontSize:14,fontWeight:600,color:NAVY,marginBottom:10}}>{term.name}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:term.opt?10:0}}>
                {term.options.map(opt=>{
                  const oc=riskColors[opt.level];
                  const sel=selections[term.id]===opt.val;
                  return(<button key={opt.val} onClick={()=>setTerm(term.id,opt.val)} style={{padding:"8px 14px",fontSize:12,fontWeight:sel?600:400,borderRadius:6,cursor:"pointer",border:`1px solid ${sel?oc:BORDER}`,background:sel?`${oc}12`:"#fff",color:sel?oc:MUTED}}>{opt.val}</button>);
                })}
              </div>
              {term.opt&&(<>
                <div style={{display:"flex",alignItems:"flex-start",gap:8,marginTop:8}}>
                  <span style={{fontSize:10,fontWeight:700,color:rc,letterSpacing:1,textTransform:"uppercase",padding:"2px 6px",borderRadius:3,background:`${rc}12`,flexShrink:0}}>{term.opt.level}</span>
                  <span style={{fontSize:12,color:SLATE,lineHeight:1.5}}>{term.opt.note}</span>
                </div>
                {term.opt.negotiate&&(<div style={{marginTop:8,padding:"10px 14px",background:`${ELECTRIC}04`,border:`1px solid ${ELECTRIC}15`,borderRadius:6}}>
                  <div style={{fontSize:10,fontWeight:700,color:ELECTRIC,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Negotiation Recommendation</div>
                  <p style={{fontSize:12,color:SLATE,lineHeight:1.55,margin:0}}>{term.opt.negotiate}</p>
                </div>)}
              </>)}
            </div>);
          })}
        </div>

        {/* Negotiation checklist for flagged items */}
        {allAnswered&&flaggedTerms.length>0&&(<div style={{marginTop:28,background:`${RED}04`,border:`1px solid ${RED}20`,borderRadius:12,padding:"24px"}}>
          <h3 style={{fontSize:14,fontWeight:700,color:RED,marginBottom:12}}>Your Negotiation Checklist ({flaggedTerms.length} items to address)</h3>
          {flaggedTerms.map((f,i)=>(<div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 0",borderBottom:i<flaggedTerms.length-1?`1px solid ${RED}10`:"none"}}>
            <span style={{fontSize:14,color:RED,flexShrink:0,marginTop:1}}>☐</span>
            <div>
              <span style={{fontSize:13,fontWeight:600,color:NAVY}}>{f.name}: {f.selected}</span>
              {f.opt.negotiate&&<p style={{fontSize:12,color:SLATE,lineHeight:1.5,margin:"4px 0 0"}}>{f.opt.negotiate}</p>}
            </div>
          </div>))}
        </div>)}

        {/* CTAs */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:28,marginBottom:24}} className="pg">
          <a href="/contact" onClick={handleSendFlags} style={{display:"block",background:`linear-gradient(135deg,${NAVY},${DEEP})`,borderRadius:12,padding:"28px 24px",textAlign:"center",textDecoration:"none"}}>
            <div style={{fontSize:11,fontWeight:700,color:RED,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>Get Expert Eyes on This</div>
            <div style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:20,color:"#fff",marginBottom:8}}>Review This Contract with a Consultant</div>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.45)",lineHeight:1.5,margin:"0 0 12px"}}>We will receive your flagged terms and come prepared with specific negotiation strategies for your situation.</p>
            <span style={{display:"inline-block",background:ELECTRIC,color:"#fff",fontSize:13,fontWeight:600,padding:"10px 22px",borderRadius:6}}>Request Contract Review →</span>
          </a>
          <a href="/tools/license-gap" style={{display:"block",background:`${AMBER}06`,border:`1px solid ${AMBER}30`,borderRadius:12,padding:"28px 24px",textAlign:"center",textDecoration:"none"}}>
            <div style={{fontSize:11,fontWeight:700,color:AMBER,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>See the Full Picture</div>
            <div style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:20,color:NAVY,marginBottom:8}}>Check Your License Bundle Gap</div>
            <p style={{fontSize:12,color:SLATE,lineHeight:1.5,margin:"0 0 12px"}}>Compare base seat price against the modules you actually need. The gap runs 40-100%.</p>
            <span style={{display:"inline-block",background:AMBER,color:"#fff",fontSize:13,fontWeight:600,padding:"10px 22px",borderRadius:6}}>Run Gap Checker →</span>
          </a>
        </div>

        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <a href="/tools/vendor-match" style={{background:WARM,border:`1px solid ${BORDER}`,color:NAVY,fontSize:14,fontWeight:600,padding:"12px 24px",borderRadius:8}}>Vendor Match Engine →</a>
          <a href="/tco-calculator" style={{background:WARM,border:`1px solid ${BORDER}`,color:NAVY,fontSize:14,fontWeight:600,padding:"12px 24px",borderRadius:8}}>TCO Calculator →</a>
          <a href="/research/ccaas-buyer-guide" style={{background:WARM,border:`1px solid ${BORDER}`,color:NAVY,fontSize:14,fontWeight:600,padding:"12px 24px",borderRadius:8}}>CCaaS Buyer Guide →</a>
        </div>
      </div></section>)}
    </div>
  );
}
