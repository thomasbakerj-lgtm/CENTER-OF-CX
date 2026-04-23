import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 960, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const VERTICAL_COMPLIANCE = {
  "Financial Services": ["PCI DSS Level 1", "SOC 2 Type II", "FFIEC compliance", "GLBA data protection", "FINRA recordkeeping", "Multi-region data residency"],
  "Healthcare": ["HIPAA BAA required", "HITRUST certified", "PHI encryption at rest + transit", "Audit trail for patient data", "SOC 2 Type II"],
  "Retail + eCommerce": ["PCI DSS Level 1", "SOC 2 Type II", "GDPR / CCPA compliance", "Payment tokenization", "Seasonal scale (10x)"],
  "Telecom": ["FCC compliance", "CPNI protection", "SOC 2 Type II", "99.999% availability", "Carrier-grade telephony"],
  "Insurance": ["State insurance regulations", "SOC 2 Type II", "PCI for premiums", "Claims data protection", "NAIC compliance"],
  "Travel + Hospitality": ["PCI DSS Level 1", "GDPR compliance", "Multi-currency", "24/7 global coverage", "SOC 2 Type II"],
  "Government": ["FedRAMP High", "ITAR compliance", "CJIS compliance", "Section 508 accessibility", "StateRAMP", "IL4/IL5"],
  "Utilities": ["NERC CIP compliance", "SOC 2 Type II", "PCI for billing", "Emergency response protocols"],
  "Manufacturing": ["ITAR compliance", "SOC 2 Type II", "ISO 27001", "Supply chain data protection"],
  "Education": ["FERPA compliance", "COPPA (K-12)", "SOC 2 Type II", "Section 508 / WCAG accessibility"],
  "Other": ["SOC 2 Type II", "GDPR / CCPA compliance", "Data residency options", "Encryption at rest + transit"],
};

const PRIORITIES = [
  { id: "ai", name: "AI + Automation", desc: "GenAI, agent assist, IVA, autonomous resolution" },
  { id: "cost", name: "Cost Reduction", desc: "Lower TCO, consumption pricing, reduced overhead" },
  { id: "consolidation", name: "Platform Consolidation", desc: "Reduce vendor count, unify stack" },
  { id: "digital", name: "Digital Channel Expansion", desc: "Chat, messaging, social, video, async" },
  { id: "quality", name: "Quality + Compliance", desc: "QA automation, compliance recording, governance" },
  { id: "wfm", name: "Workforce Optimization", desc: "Forecasting, scheduling, adherence, coaching" },
  { id: "selfservice", name: "Customer Self-Service", desc: "IVR, IVA, knowledge, automated resolution" },
  { id: "agentexp", name: "Agent Experience", desc: "Desktop unification, knowledge access, career tooling" },
  { id: "vertical", name: "Vertical Specialization", desc: "Industry-specific workflows and compliance" },
  { id: "global", name: "Global Scale", desc: "Multi-region, multi-language, follow-the-sun" },
  { id: "analytics", name: "Advanced Analytics", desc: "Interaction analytics, journey, predictive insights" },
  { id: "integration", name: "Deep Integration", desc: "CRM, ERP, ITSM, custom API, event-driven" },
];

const SIZES = ["Under 50 agents", "50-200 agents", "200-500 agents", "500-1000 agents", "1000-5000 agents", "5000+ agents"];
const VERTICALS = ["Financial Services", "Healthcare", "Retail + eCommerce", "Telecom", "Insurance", "Travel + Hospitality", "Government", "Utilities", "Manufacturing", "Education", "Other"];

const PLATFORMS = [
  { name: "None / Greenfield", notes: "" },
  { name: "Avaya (on-prem)", notes: "End-of-support timelines accelerating. Migration urgency depends on product line (Aura, Elite, IX). Most migrations: 8-14 months. Workforce familiarity and telephony infrastructure are your biggest transition costs." },
  { name: "Cisco UCCE / UCCX", notes: "Deep IT ecosystem integration. Migration to Webex CC preserves some investment. Third-party CCaaS requires telephony re-architecture and significant integration rework." },
  { name: "Genesys PureConnect", notes: "End-of-support. Migration to Genesys Cloud CX is the natural path with migration tools. Third-party migration viable but loses Genesys-specific customizations." },
  { name: "Genesys Cloud CX", notes: "Already cloud-native. Focus: AI token optimization, orchestration depth, whether native WEM meets needs or best-of-breed WEM is worth the integration cost." },
  { name: "NICE CXone", notes: "Strong WEM ecosystem. Evaluate add-on pricing for analytics and AI. Cognigy IVA acquisition strengthens self-service but integration is still maturing." },
  { name: "Five9", notes: "Strong mid-market. If hitting enterprise scale limits, evaluate Genesys or NICE. If satisfied with scale, focus on AI maturity and WEM depth." },
  { name: "Amazon Connect", notes: "Consumption-based, AWS-native. No seat licensing, elastic scale. Gaps: limited native WFM, requires AWS expertise, less turnkey than traditional CCaaS." },
  { name: "Talkdesk", notes: "AI-forward roadmap. Industry Experience Clouds. First CCaaS with ISO 42001. Evaluate enterprise track record for your scale and complexity." },
  { name: "Other / Legacy", notes: "Document integration landscape, telephony infrastructure, and customizations before evaluating. These determine migration complexity more than platform choice." },
];

const VENDORS = [
  { name: "Genesys Cloud CX", slug: "genesys", fit: { large: 95, mid: 80, small: 55 }, strengths: ["Orchestration depth + composable architecture", "CRM convergence ($1.5B Salesforce/ServiceNow investment)", "Largest on-prem migration playbook"], risks: ["Complexity for mid-market", "AI token pricing unpredictability", "Potential IPO transition"], verticals: ["Financial Services","Insurance","Telecom","Healthcare","Manufacturing"], dims: { ai:90,cost:60,consolidation:85,digital:85,quality:82,wfm:80,selfservice:88,agentexp:82,vertical:80,global:92,analytics:85,integration:90 }, addOns: "WEM in higher tiers. AI features (copilot, predictive routing, sentiment) are token-based. Speech/text analytics natively available. Outbound dialer included." },
  { name: "NICE CXone", slug: "nice-cxone", fit: { large: 90, mid: 85, small: 60 }, strengths: ["Deepest native WEM (Enlighten AI for QA + coaching)", "Analytics maturity (interaction, sentiment)", "Cognigy IVA acquisition"], risks: ["Platform complexity for mid-market", "Add-on pricing layers", "Integration overhead"], verticals: ["Financial Services","Healthcare","Insurance","Retail + eCommerce","Government"], dims: { ai:88,cost:55,consolidation:90,digital:82,quality:95,wfm:95,selfservice:85,agentexp:78,vertical:82,global:85,analytics:92,integration:80 }, addOns: "WEM is core strength, bundled in enterprise tiers. Enlighten AI may require separate licensing. Recording included. Advanced analytics tier-dependent." },
  { name: "Amazon Connect", slug: "amazon-connect", fit: { large: 75, mid: 85, small: 90 }, strengths: ["No seat licensing (consumption-based)", "AWS ecosystem (Lambda, Lex, Bedrock)", "Elastic scale, no capacity planning"], risks: ["Requires AWS expertise", "Limited native WFM", "Less vertical specialization"], verticals: ["Retail + eCommerce","Telecom","Other"], dims: { ai:85,cost:95,consolidation:50,digital:75,quality:55,wfm:45,selfservice:82,agentexp:65,vertical:50,global:80,analytics:70,integration:88 }, addOns: "All consumption-based. Unlimited AI: $0.038/min voice, $0.01/msg chat. No native WFM (partner required). QA via Contact Lens add-on." },
  { name: "Five9", slug: "five9", fit: { large: 70, mid: 90, small: 80 }, strengths: ["Mid-market sweet spot", "Strong outbound + blended", "Deep Salesforce integration"], risks: ["Enterprise scale ceiling 2000+ agents", "AI maturity behind leaders", "Smaller ecosystem"], verticals: ["Retail + eCommerce","Financial Services","Healthcare"], dims: { ai:72,cost:75,consolidation:70,digital:78,quality:70,wfm:70,selfservice:72,agentexp:75,vertical:68,global:65,analytics:72,integration:78 }, addOns: "Base includes voice + digital. WFM add-on. AI features tiered. Outbound in higher tiers." },
  { name: "Talkdesk", slug: "talkdesk", fit: { large: 65, mid: 85, small: 85 }, strengths: ["AI-forward roadmap", "Industry Experience Clouds", "First CCaaS with ISO 42001"], risks: ["Shorter enterprise track record", "Vertical depth still building", "Competitive pressure"], verticals: ["Retail + eCommerce","Financial Services","Healthcare"], dims: { ai:85,cost:70,consolidation:68,digital:80,quality:72,wfm:72,selfservice:80,agentexp:78,vertical:75,global:70,analytics:75,integration:72 }, addOns: "Three tiers $85-$165/agent/mo. AI in higher tiers. WFM and QA add-ons. Industry Clouds may require specific tier." },
  { name: "Cisco Webex CC", slug: "cisco-webex-cc", fit: { large: 85, mid: 75, small: 50 }, strengths: ["Network + security portfolio", "Webex Connect orchestration", "Enterprise IT familiarity"], risks: ["Cloud-native maturity behind leaders", "UCCE migration underestimated", "Bundle complexity"], verticals: ["Government","Financial Services","Manufacturing","Telecom"], dims: { ai:70,cost:60,consolidation:80,digital:72,quality:65,wfm:65,selfservice:68,agentexp:68,vertical:72,global:82,analytics:68,integration:78 }, addOns: "Quote-based pricing. WEM limited vs NICE/Verint. Webex Connect for digital may be separate. Security bundle discounts for Cisco customers." },
  { name: "Zoom Contact Center", slug: "zoom-contact-center", fit: { large: 50, mid: 80, small: 90 }, strengths: ["Consumer-grade UX", "Aggressive pricing (from $69/mo)", "Rapid deployment"], risks: ["Enterprise depth developing", "Limited WFM", "Newer to CC market"], verticals: ["Education","Other","Retail + eCommerce"], dims: { ai:68,cost:90,consolidation:60,digital:72,quality:55,wfm:45,selfservice:65,agentexp:82,vertical:45,global:60,analytics:58,integration:60 }, addOns: "Essentials $69, Premium $99, Elite $149. WFM and advanced QA limited. UCaaS bundle pricing available." },
  { name: "8x8 XCaaS", slug: "8x8", fit: { large: 55, mid: 80, small: 85 }, strengths: ["Unified CCaaS + UCaaS", "Competitive mid-market pricing", "Global reach (35+ countries)"], risks: ["Enterprise scale limits", "AI maturity behind leaders", "Market positioning"], verticals: ["Other","Retail + eCommerce","Manufacturing"], dims: { ai:62,cost:80,consolidation:85,digital:70,quality:60,wfm:60,selfservice:60,agentexp:70,vertical:50,global:75,analytics:62,integration:65 }, addOns: "Unified UC+CC license. WFM and QA more basic than specialists. Value: one vendor for UC + CC." },
];

function Select({label,value,onChange,options,hint}){return<div><label style={{fontSize:12,fontWeight:600,color:NAVY,display:"block",marginBottom:4}}>{label}</label><select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",padding:"10px 12px",fontSize:14,border:`1px solid ${BORDER}`,borderRadius:6,background:"#fff",color:NAVY,outline:"none",cursor:"pointer"}}><option value="">Select...</option>{options.map(o=>typeof o==="string"?<option key={o} value={o}>{o}</option>:<option key={o.value} value={o.value}>{o.label}</option>)}</select>{hint&&<span style={{fontSize:11,color:MUTED,marginTop:2,display:"block"}}>{hint}</span>}</div>}

export default function VendorMatchEngine() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState(""); const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState(0);
  const [d, setD] = useState({ vertical:"", size:"", currentPlatform:"", priorities:[], compliance:[], importance:{}, budgetSensitivity:"moderate", billingPreference:"monthly", termLength:"3 years" });
  useEffect(() => { window.scrollTo(0,0); }, [phase]);
  const set = (k,v) => setD(prev => ({...prev,[k]:v}));
  const toggleArr = (k,v) => setD(prev => ({...prev,[k]:prev[k].includes(v)?prev[k].filter(x=>x!==v):[...prev[k],v]}));
  const setImp = (id,val) => setD(prev => ({...prev,importance:{...prev.importance,[id]:val}}));
  const platformData = PLATFORMS.find(p => p.name === d.currentPlatform);
  const vertComp = VERTICAL_COMPLIANCE[d.vertical] || VERTICAL_COMPLIANCE["Other"];
  const selPriorities = PRIORITIES.filter(p => d.priorities.includes(p.id));

  const handleGate = async () => {
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/maqlvwne", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,name,company,tool:"Vendor Match Engine",_subject:"Vendor Match Engine Access"})}); } catch(e){}
    setSending(false); setPhase("input");
  };

  const getResults = () => {
    const sk = (d.size.includes("5000")||d.size.includes("1000"))?"large":(d.size.includes("500")||d.size.includes("200"))?"mid":"small";
    return VENDORS.map(v => {
      let s = v.fit[sk]||70;
      if(d.vertical&&v.verticals.includes(d.vertical)) s+=8; else if(d.vertical) s-=5;
      d.priorities.forEach(pId => { if(v.dims[pId]) s+=(v.dims[pId]-70)*0.12; });
      Object.entries(d.importance).forEach(([k,imp]) => { if(v.dims[k]) s+=(v.dims[k]-70)*(imp-3)*0.06; });
      if(d.budgetSensitivity==="high"&&v.dims.cost) s+=(v.dims.cost-70)*0.15;
      if(d.termLength==="1 year"&&v.name.includes("Amazon")) s+=8;
      return {...v, score: Math.min(99,Math.max(25,Math.round(s)))};
    }).sort((a,b) => b.score-a.score);
  };

  const handleResults = async () => {
    const res = getResults();
    try { await fetch("https://formspree.io/f/maqlvwne", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,name,company,tool:"Vendor Match Engine",vertical:d.vertical,size:d.size,platform:d.currentPlatform,priorities:d.priorities.join(", "),top3:res.slice(0,3).map(r=>`${r.name}:${r.score}`).join(", "),_subject:`Vendor Match: ${d.vertical}|${d.size}|Top:${res[0]?.name} — ${company||name||email}`})}); } catch(e){}
    setPhase("results");
  };

  const results = getResults();

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",minHeight:"100vh"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.pg{grid-template-columns:1fr!important}}`}</style>
      <nav style={{background:DEEP,padding:"16px 0"}}><div style={{...WRAP,display:"flex",alignItems:"center",justifyContent:"space-between"}}><a href="/" style={{display:"flex",alignItems:"center",gap:10}}><LogoMark size={30}/><span style={{color:"#fff",fontWeight:600,fontSize:14}}>THE CENTER OF <span style={{color:LIGHT}}>CX</span></span></a><a href="/how-to-choose" style={{color:"rgba(255,255,255,0.5)",fontSize:13}}>← Back to Tools</a></div></nav>

      {phase==="gate"&&(<section style={{background:`linear-gradient(168deg,${DEEP},${NAVY})`,padding:"80px 28px 60px"}}><div style={{...WRAP,maxWidth:540}}>
        <span style={{color:ELECTRIC,fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:12}}>Vendor Selection</span>
        <h1 style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:32,fontWeight:400,color:"#fff",lineHeight:1.15,margin:"0 0 12px"}}>Vendor Match Engine</h1>
        <p style={{fontSize:15,color:"rgba(255,255,255,0.5)",lineHeight:1.65,marginBottom:32}}>Describe your operation, priorities, and compliance requirements. Get a ranked vendor shortlist with fit reasoning, add-on intelligence, and direct paths to demos and advisory.</p>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <input type="text" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} style={{padding:"12px 14px",fontSize:14,border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,background:"rgba(255,255,255,0.04)",color:"#fff",outline:"none"}}/>
          <input type="text" placeholder="Company" value={company} onChange={e=>setCompany(e.target.value)} style={{padding:"12px 14px",fontSize:14,border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,background:"rgba(255,255,255,0.04)",color:"#fff",outline:"none"}}/>
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{padding:"12px 14px",fontSize:14,border:"1px solid rgba(255,255,255,0.12)",borderRadius:6,background:"rgba(255,255,255,0.04)",color:"#fff",outline:"none"}}/>
          <button onClick={handleGate} disabled={sending||!email.includes("@")} style={{padding:"14px",fontSize:15,fontWeight:600,background:email.includes("@")?ELECTRIC:SLATE,color:"#fff",border:"none",borderRadius:8,cursor:"pointer",opacity:email.includes("@")?1:0.5}}>{sending?"Loading...":"Start Matching →"}</button>
        </div>
      </div></section>)}

      {phase==="input"&&(<section style={{background:"#fff",padding:"48px 28px 60px"}}><div style={{...WRAP,maxWidth:700}}>
        <div style={{display:"flex",gap:4,marginBottom:32,flexWrap:"wrap"}}>
          {["Your Environment","What Matters","Compliance","Dimension Weighting"].map((s,i)=>(
            <div key={i} style={{flex:1,textAlign:"center",padding:"10px 8px",borderBottom:`3px solid ${step===i?ELECTRIC:BORDER}`,cursor:"pointer",fontSize:12,fontWeight:600,color:step===i?NAVY:MUTED,minWidth:110}} onClick={()=>setStep(i)}>{s}</div>
          ))}
        </div>

        {step===0&&(<div>
          <h2 style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:24,fontWeight:400,color:NAVY,margin:"0 0 20px"}}>Tell us about your environment</h2>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <Select label="Industry vertical" value={d.vertical} onChange={v=>{set("vertical",v);set("compliance",[]);}} options={VERTICALS}/>
            <Select label="Operation size" value={d.size} onChange={v=>set("size",v)} options={SIZES}/>
            <Select label="Current platform" value={d.currentPlatform} onChange={v=>set("currentPlatform",v)} options={PLATFORMS.map(p=>p.name)} hint="Helps identify migration-specific considerations"/>
          </div>
          {platformData&&platformData.notes&&(<div style={{marginTop:20,background:`${ELECTRIC}06`,border:`1px solid ${ELECTRIC}20`,borderRadius:10,padding:"18px 20px"}}>
            <div style={{fontSize:11,fontWeight:700,color:ELECTRIC,letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>Platform Context: {platformData.name}</div>
            <p style={{fontSize:13,color:SLATE,lineHeight:1.6,margin:0}}>{platformData.notes}</p>
          </div>)}
          <button onClick={()=>setStep(1)} disabled={!d.vertical||!d.size} style={{marginTop:24,padding:"12px 28px",fontSize:14,fontWeight:600,borderRadius:8,border:"none",background:d.vertical&&d.size?ELECTRIC:MUTED,color:"#fff",cursor:"pointer",opacity:d.vertical&&d.size?1:0.5}}>Next: What Matters →</button>
        </div>)}

        {step===1&&(<div>
          <h2 style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:24,fontWeight:400,color:NAVY,margin:"0 0 8px"}}>What matters to your operation?</h2>
          <p style={{fontSize:13,color:MUTED,marginBottom:20}}>Select all that apply. The more you select, the more nuanced the match.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}} className="pg">
            {PRIORITIES.map(p=>(<button key={p.id} onClick={()=>toggleArr("priorities",p.id)} style={{padding:"14px 16px",textAlign:"left",borderRadius:8,cursor:"pointer",border:`1px solid ${d.priorities.includes(p.id)?ELECTRIC:BORDER}`,background:d.priorities.includes(p.id)?`${ELECTRIC}06`:"#fff",color:"inherit"}}>
              <div style={{fontSize:13,fontWeight:600,color:d.priorities.includes(p.id)?ELECTRIC:NAVY}}>{d.priorities.includes(p.id)?"✓ ":""}{p.name}</div>
              <div style={{fontSize:11,color:MUTED,marginTop:2}}>{p.desc}</div>
            </button>))}
          </div>
          <div style={{display:"flex",gap:12,marginTop:24}}>
            <button onClick={()=>setStep(0)} style={{padding:"12px 24px",fontSize:14,fontWeight:600,borderRadius:8,border:`1px solid ${BORDER}`,background:"#fff",color:NAVY,cursor:"pointer"}}>← Back</button>
            <button onClick={()=>setStep(2)} disabled={d.priorities.length===0} style={{padding:"12px 28px",fontSize:14,fontWeight:600,borderRadius:8,border:"none",background:d.priorities.length>0?ELECTRIC:MUTED,color:"#fff",cursor:"pointer",opacity:d.priorities.length>0?1:0.5}}>Next: Compliance →</button>
          </div>
        </div>)}

        {step===2&&(<div>
          <h2 style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:24,fontWeight:400,color:NAVY,margin:"0 0 8px"}}>Compliance Requirements</h2>
          <p style={{fontSize:13,color:MUTED,marginBottom:20}}>Based on your {d.vertical||"selected"} vertical. Select requirements that apply.</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}} className="pg">
            {vertComp.map(req=>(<button key={req} onClick={()=>toggleArr("compliance",req)} style={{padding:"12px 16px",fontSize:13,textAlign:"left",borderRadius:8,cursor:"pointer",border:`1px solid ${d.compliance.includes(req)?RED:BORDER}`,background:d.compliance.includes(req)?`${RED}06`:"#fff",color:d.compliance.includes(req)?RED:SLATE,fontWeight:d.compliance.includes(req)?600:400}}>{d.compliance.includes(req)?"✓ ":""}{req}</button>))}
          </div>
          <div style={{display:"flex",gap:12,marginTop:24}}>
            <button onClick={()=>setStep(1)} style={{padding:"12px 24px",fontSize:14,fontWeight:600,borderRadius:8,border:`1px solid ${BORDER}`,background:"#fff",color:NAVY,cursor:"pointer"}}>← Back</button>
            <button onClick={()=>setStep(3)} style={{padding:"12px 28px",fontSize:14,fontWeight:600,borderRadius:8,border:"none",background:ELECTRIC,color:"#fff",cursor:"pointer"}}>Next: Weighting →</button>
          </div>
        </div>)}

        {step===3&&(<div>
          <h2 style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:24,fontWeight:400,color:NAVY,margin:"0 0 8px"}}>How important is each dimension?</h2>
          <p style={{fontSize:13,color:MUTED,marginBottom:20}}>Rate your selected priorities: 1 = nice to have, 5 = critical.</p>
          {selPriorities.map(dim=>(<div key={dim.id} style={{marginBottom:14,padding:"14px 16px",background:WARM,borderRadius:8,border:`1px solid ${BORDER}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div><span style={{fontSize:13,fontWeight:600,color:NAVY}}>{dim.name}</span><span style={{fontSize:11,color:MUTED,display:"block"}}>{dim.desc}</span></div>
              <span style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:22,color:ELECTRIC}}>{d.importance[dim.id]||3}</span>
            </div>
            <input type="range" min={1} max={5} value={d.importance[dim.id]||3} onChange={e=>setImp(dim.id,Number(e.target.value))} style={{width:"100%",accentColor:ELECTRIC}}/>
          </div>))}
          <h3 style={{fontSize:14,fontWeight:600,color:NAVY,marginTop:28,marginBottom:12}}>Commercial Preferences</h3>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}} className="pg">
            <Select label="Budget sensitivity" value={d.budgetSensitivity} onChange={v=>set("budgetSensitivity",v)} options={[{value:"low",label:"Low (best platform wins)"},{value:"moderate",label:"Moderate (value matters)"},{value:"high",label:"High (cost-driven)"}]}/>
            <Select label="Billing preference" value={d.billingPreference} onChange={v=>set("billingPreference",v)} options={[{value:"monthly",label:"Monthly"},{value:"annual",label:"Annual (discount)"},{value:"consumption",label:"Consumption-based"}]}/>
            <Select label="Contract term" value={d.termLength} onChange={v=>set("termLength",v)} options={["1 year","3 years","5 years"]}/>
          </div>
          <div style={{display:"flex",gap:12,marginTop:24}}>
            <button onClick={()=>setStep(2)} style={{padding:"12px 24px",fontSize:14,fontWeight:600,borderRadius:8,border:`1px solid ${BORDER}`,background:"#fff",color:NAVY,cursor:"pointer"}}>← Back</button>
            <button onClick={handleResults} style={{padding:"12px 28px",fontSize:14,fontWeight:600,borderRadius:8,border:"none",background:GREEN,color:"#fff",cursor:"pointer"}}>See My Matches →</button>
          </div>
        </div>)}
      </div></section>)}

      {phase==="results"&&(<section style={{background:"#fff",padding:"48px 28px 60px"}}><div style={WRAP}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <span style={{fontSize:11,fontWeight:700,color:ELECTRIC,letterSpacing:2,textTransform:"uppercase"}}>Your Vendor Shortlist</span>
          <h2 style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:28,fontWeight:400,color:NAVY,margin:"8px 0"}}>Ranked by fit for your environment</h2>
          <p style={{fontSize:13,color:MUTED,maxWidth:560,margin:"0 auto"}}>{d.size} in {d.vertical||"your vertical"}{d.currentPlatform&&d.currentPlatform!=="None / Greenfield"?`, migrating from ${d.currentPlatform}`:""}. {d.priorities.length} priorities. {d.compliance.length} compliance requirements.</p>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:32}}>
          {results.map((v,i)=>{
            const isTop=i<3;
            const fc=v.score>=85?GREEN:v.score>=70?AMBER:v.score>=55?"#6B7280":RED;
            const fl=v.score>=85?"Strong Fit":v.score>=70?"Good Fit":v.score>=55?"Conditional Fit":"Weak Fit";
            return(<div key={v.name} style={{background:isTop?"#fff":WARM,border:`1px solid ${isTop?fc+"40":BORDER}`,borderRadius:12,padding:isTop?"24px":"16px 20px",borderLeft:isTop?`4px solid ${fc}`:"4px solid transparent"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:200}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:4}}>
                    <span style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:isTop?14:12,color:MUTED}}>#{i+1}</span>
                    <a href={`/vendors/${v.slug}`} style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:isTop?22:17,fontWeight:400,color:NAVY,borderBottom:`1px solid ${ELECTRIC}30`}}>{v.name}</a>
                  </div>
                  {isTop&&(<>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginTop:8,marginBottom:6}}>
                      {v.strengths.map((s,si)=><span key={si} style={{fontSize:11,padding:"3px 8px",borderRadius:4,background:`${GREEN}10`,color:GREEN,fontWeight:500}}>✓ {s}</span>)}
                    </div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                      {v.risks.map((r,ri)=><span key={ri} style={{fontSize:11,padding:"3px 8px",borderRadius:4,background:`${RED}08`,color:RED}}>⚠ {r}</span>)}
                    </div>
                  </>)}
                </div>
                <div style={{textAlign:"center",flexShrink:0}}>
                  <div style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:isTop?36:24,color:fc}}>{v.score}</div>
                  <div style={{fontSize:11,fontWeight:600,color:fc}}>{fl}</div>
                </div>
              </div>
              {isTop&&(<>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:10,paddingTop:10,borderTop:`1px solid ${BORDER}`}}>
                  {selPriorities.slice(0,6).map(p=>(<div key={p.id} style={{textAlign:"center",minWidth:70}}>
                    <div style={{fontSize:9,color:MUTED,marginBottom:2}}>{p.name.split("+")[0].trim()}</div>
                    <div style={{height:4,background:BORDER,borderRadius:2,overflow:"hidden",width:60}}>
                      <div style={{height:"100%",width:`${v.dims[p.id]||50}%`,background:(v.dims[p.id]||50)>=80?GREEN:(v.dims[p.id]||50)>=65?AMBER:MUTED,borderRadius:2}}/>
                    </div>
                    <div style={{fontSize:11,fontWeight:600,color:SLATE,marginTop:1}}>{v.dims[p.id]||"—"}</div>
                  </div>))}
                </div>
                <details style={{marginTop:10}}><summary style={{fontSize:12,fontWeight:600,color:ELECTRIC,cursor:"pointer"}}>Add-on + pricing intelligence</summary>
                  <p style={{fontSize:12,color:SLATE,lineHeight:1.6,marginTop:6,padding:"10px 14px",background:WARM,borderRadius:6}}>{v.addOns}</p>
                </details>
                <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
                  <a href={`/vendors/${v.slug}`} style={{fontSize:12,fontWeight:600,color:ELECTRIC,padding:"6px 14px",borderRadius:5,border:`1px solid ${ELECTRIC}30`,background:`${ELECTRIC}06`}}>View Full Profile →</a>
                </div>
              </>)}
            </div>);
          })}
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}} className="pg">
          <a href="/contact" style={{display:"block",background:`linear-gradient(135deg,${NAVY},${DEEP})`,borderRadius:12,padding:"28px 24px",textAlign:"center",textDecoration:"none"}}>
            <div style={{fontSize:11,fontWeight:700,color:LIGHT,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>Refine Your Shortlist</div>
            <div style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:20,color:"#fff",marginBottom:8}}>Speak with a CX Consultant</div>
            <p style={{fontSize:12,color:"rgba(255,255,255,0.45)",lineHeight:1.5,margin:"0 0 12px"}}>30 minutes to refine this shortlist based on integration complexity, contract terms, and organizational readiness.</p>
            <span style={{display:"inline-block",background:ELECTRIC,color:"#fff",fontSize:13,fontWeight:600,padding:"10px 22px",borderRadius:6}}>Request Working Session →</span>
          </a>
          <a href="/contact" style={{display:"block",background:`${GREEN}06`,border:`1px solid ${GREEN}30`,borderRadius:12,padding:"28px 24px",textAlign:"center",textDecoration:"none"}}>
            <div style={{fontSize:11,fontWeight:700,color:GREEN,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>See It In Action</div>
            <div style={{fontFamily:"'Instrument Serif',Georgia,serif",fontSize:20,color:NAVY,marginBottom:8}}>Request a Vendor Introduction</div>
            <p style={{fontSize:12,color:SLATE,lineHeight:1.5,margin:"0 0 12px"}}>We coordinate a tailored demo with your top match using your scenarios, not their standard pitch.</p>
            <span style={{display:"inline-block",background:GREEN,color:"#fff",fontSize:13,fontWeight:600,padding:"10px 22px",borderRadius:6}}>Request Introduction + Demo →</span>
          </a>
        </div>

        <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
          <a href="/tools/platform-decision" style={{background:WARM,border:`1px solid ${BORDER}`,color:NAVY,fontSize:14,fontWeight:600,padding:"12px 24px",borderRadius:8}}>Platform Decision Matrix →</a>
          <a href="/tools/contract-risk" style={{background:WARM,border:`1px solid ${BORDER}`,color:NAVY,fontSize:14,fontWeight:600,padding:"12px 24px",borderRadius:8}}>Contract Risk Scanner →</a>
          <a href="/tools/transformation-readiness" style={{background:WARM,border:`1px solid ${BORDER}`,color:NAVY,fontSize:14,fontWeight:600,padding:"12px 24px",borderRadius:8}}>Transformation Readiness →</a>
          <a href="/how-to-choose" style={{background:WARM,border:`1px solid ${BORDER}`,color:NAVY,fontSize:14,fontWeight:600,padding:"12px 24px",borderRadius:8}}>Explore All 29 Tools</a>
        </div>
      </div></section>)}
    </div>
  );
}
