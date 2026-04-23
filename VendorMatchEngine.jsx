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
  { name:"Genesys Cloud CX",slug:"genesys",tier:"Top Tier Core",
    fit:{large:95,mid:60,small:95},
    strengths:["Broad suite depth strong orchestration native WEM marketplace global enterprise "],
    risks:["Fails value test if customer is midmarket low-complexity or speed-first"],
    verticals:["Financial Services", "Healthcare", "Insurance", "Retail + eCommerce", "Telecom", "Utilities", "Manufacturing", "Travel + Hospitality", "Other", "Government"],
    dims:{ai:90,cost:80,consolidation:100,digital:100,quality:100,wfm:90,selfservice:100,agentexp:100,vertical:76,global:100,analytics:100,integration:100},
    integrations:["Healthcare: Epic", "Insurance: Guidewire (ClaimCenter / PolicyCenter / BillingCenter)"],
    addOns:"Win themes: Enterprise standardization complex routing journey orchestration global operating model | Watch: Over-scoped for smaller buyers or loses on simplicity/cost | Best for: Default benchmark in serious enterprise evaluations" },
  { name:"CXone / CXone Mpower",slug:"nice-cxone",tier:"Top Tier Core",
    fit:{large:95,mid:60,small:95},
    strengths:["Elite WEM QA analytics compliance", "regulated-enterprise posture"],
    risks:["Gets cut when buyer wants simpler commercials or lighter transformation path"],
    verticals:["Financial Services", "Healthcare", "Insurance", "Retail + eCommerce", "Telecom", "Utilities", "Manufacturing", "Travel + Hospitality", "Other", "Government"],
    dims:{ai:90,cost:70,consolidation:100,digital:80,quality:100,wfm:90,selfservice:100,agentexp:100,vertical:74,global:100,analytics:90,integration:90},
    integrations:["Healthcare: Epic"],
    addOns:"Win themes: Ops transformation QA-heavy environments regulated sectors enterprise automation | Watch: Can lose on perceived heaviness or transformation burden | Best for: Default benchmark for regulated and QA-heavy environments" },
  { name:"Five9 Intelligent CX Platform",slug:"five9",tier:"Top Tier Core",
    fit:{large:76,mid:80,small:95},
    strengths:["Pragmatic enterprise credibility strong outbound partner accessibility"],
    risks:["Gets cut when buyer wants top-tier all-stack depth or stronger sovereignty story"],
    verticals:["Financial Services", "Healthcare", "Insurance", "Retail + eCommerce", "Telecom", "Travel + Hospitality", "Other"],
    dims:{ai:70,cost:90,consolidation:80,digital:80,quality:80,wfm:70,selfservice:80,agentexp:80,vertical:72,global:80,analytics:80,integration:80},
    integrations:["Healthcare: Epic", "Healthcare: Oracle Health / Cerner", "Healthcare: athenahealth", "Financial services / credit union: Jack Henry (Symitar / Quest / related products)"],
    addOns:"Win themes: Blended service-sales practical modernization BPO and outbound strength | Watch: Can lose when buyers want the broadest enterprise control plane | Best for: Benchmark for pragmatic modernization and blended service/sales" },
  { name:"Talkdesk CX Cloud / CXA",slug:"talkdesk",tier:"Upper Mid Core",
    fit:{large:76,mid:80,small:76},
    strengths:["Clear business packaging strong vertical story good partner carryability"],
    risks:["Gets cut when extreme custom telecom industrial or multinational complexity appears"],
    verticals:["Financial Services", "Healthcare", "Insurance", "Retail + eCommerce", "Travel + Hospitality"],
    dims:{ai:70,cost:90,consolidation:80,digital:100,quality:60,wfm:60,selfservice:80,agentexp:80,vertical:73,global:80,analytics:70,integration:80},
    integrations:["Healthcare: Epic", "Healthcare: Oracle Health / Cerner", "Healthcare: athenahealth", "Insurance: Guidewire (ClaimCenter / PolicyCenter / BillingCenter)"],
    addOns:"Win themes: Vertical modernization fast business framing healthcare BFSI insurance travel | Watch: Can lose when packaging looks stronger than operating depth | Best for: Use in vertical-led modernization and experience transformation" },
  { name:"Webex Contact Center",slug:"cisco-webex-cc",tier:"Upper Mid Core",
    fit:{large:76,mid:60,small:76},
    strengths:["Security enterprise trust collaboration adjacency telecom/government relevance"],
    risks:["Gets cut in pure greenfield CX beauty contests with no Cisco estate advantage"],
    verticals:["Financial Services", "Healthcare", "Insurance", "Telecom", "Utilities", "Manufacturing", "Government"],
    dims:{ai:70,cost:70,consolidation:80,digital:80,quality:60,wfm:60,selfservice:80,agentexp:80,vertical:73,global:100,analytics:70,integration:80},
    integrations:[],
    addOns:"Win themes: Secure enterprise consolidation healthcare telecom public sector | Watch: Can lose when brand pull is weaker than specialist CCaaS leaders | Best for: Use in Cisco-heavy estates and security-sensitive enterprise deals" },
  { name:"Amazon Connect",slug:"amazon-connect",tier:"Mid Core",
    fit:{large:57,mid:60,small:76},
    strengths:["Programmable architecture scale API depth resilience", "AWS ecosystem"],
    risks:["Gets cut when buyer lacks cloud engineering discipline or needs more opinionated out-of-box ops"],
    verticals:["Financial Services", "Healthcare", "Insurance", "Retail + eCommerce", "Telecom", "Utilities", "Travel + Hospitality", "Other"],
    dims:{ai:70,cost:60,consolidation:100,digital:80,quality:60,wfm:40,selfservice:80,agentexp:60,vertical:63,global:90,analytics:70,integration:100},
    integrations:["Healthcare: Epic", "Retail / Ecommerce: Shopify"],
    addOns:"Win themes: Builder-led transformation cloud-native operating model global resilience | Watch: Can lose when customer needs turnkey WEM-rich packaged operation" },
  { name:"storm / storm CONTACT",slug:"content-guru",tier:"Upper Mid Core",
    fit:{large:76,mid:40,small:38},
    strengths:["Mission-critical resilience compliance public-sector strength"],
    risks:["Gets cut when broad commercial-market awareness or ecosystem breadth matter"],
    verticals:["Financial Services", "Healthcare", "Insurance", "Telecom", "Utilities", "Government"],
    dims:{ai:70,cost:40,consolidation:70,digital:80,quality:80,wfm:70,selfservice:80,agentexp:60,vertical:72,global:90,analytics:80,integration:60},
    integrations:["Retail / Ecommerce: Magento / Adobe Commerce", "Hospitality: Micros Fidelio / hotel booking stack", "Hospitality: HORECA", "Financial services / credit union: Jack Henry (Symitar / Quest / related products)"],
    addOns:"Win themes: High-availability environments government emergency and regulated service | Watch: Can lose on mindshare and ecosystem familiarity | Best for: Use in public-sector and high-availability environments" },
  { name:"RingCX",slug:"ringcentral",tier:"Mid Core",
    fit:{large:57,mid:80,small:95},
    strengths:["UC+CC simplification strong channel leverage accessible commercial story"],
    risks:["Gets cut when deep WEM/QM/routing complexity is required"],
    verticals:["Retail + eCommerce", "Travel + Hospitality", "Other"],
    dims:{ai:55,cost:80,consolidation:80,digital:80,quality:60,wfm:60,selfservice:60,agentexp:60,vertical:60,global:70,analytics:60,integration:70},
    integrations:["Healthcare: Epic", "Healthcare: Oracle Health / Cerner", "Healthcare: athenahealth", "Financial services / credit union: Jack Henry (Symitar / Quest / related products)"],
    addOns:"Win themes: Distributed service teams branch service UC consolidation | Watch: Can lose when buyer realizes complexity exceeds platform sweet spot | Best for: Use in distributed-service and simplification-led deals" },
  { name:"Zoom Contact Center",slug:"zoom-contact-center",tier:"Mid Core",
    fit:{large:57,mid:80,small:76},
    strengths:["Familiar brand easy expansion from Zoom estate strong user adoption"],
    risks:["Gets cut when enterprise workforce and compliance demands get serious"],
    verticals:["Retail + eCommerce", "Travel + Hospitality", "Other"],
    dims:{ai:60,cost:80,consolidation:70,digital:80,quality:60,wfm:50,selfservice:60,agentexp:60,vertical:60,global:70,analytics:60,integration:70},
    integrations:["Healthcare: Epic", "Healthcare: Oracle Health / Cerner"],
    addOns:"Win themes: Digital-first support internal help desks media/hospitality and Zoom-base expansion | Watch: Can lose when friendliness masks lighter ops depth | Best for: Use in digital-first and Zoom-estate service expansion" },
  { name:"8x8 Contact Center / 8x8 Engage",slug:"8x8",tier:"Mid Core",
    fit:{large:57,mid:80,small:95},
    strengths:["Unified value cost-conscious consolidation global SMB-midmarket reach"],
    risks:["Gets cut when enterprise gravity or advanced WEM depth are required"],
    verticals:["Retail + eCommerce"],
    dims:{ai:50,cost:80,consolidation:70,digital:80,quality:60,wfm:50,selfservice:60,agentexp:60,vertical:57,global:80,analytics:60,integration:60},
    integrations:[],
    addOns:"Win themes: SMB-midmarket consolidation practical omnichannel value | Watch: Can lose when enterprise buyers want more depth and ecosystem pull | Best for: Use in cost-conscious consolidation plays" },
  { name:"Bright Pattern CCaaS",slug:"bright-pattern",tier:"Mid Core",
    fit:{large:57,mid:80,small:76},
    strengths:["Practical feature breadth simpler deployment midmarket usability"],
    risks:["Gets cut when ecosystem gravity or top-tier proof is required"],
    verticals:["Retail + eCommerce"],
    dims:{ai:50,cost:70,consolidation:60,digital:80,quality:70,wfm:60,selfservice:80,agentexp:60,vertical:56,global:60,analytics:60,integration:50},
    integrations:[],
    addOns:"Win themes: Midmarket omnichannel deployments where functionality matters more than brand power | Watch: Can lose due to lower market presence and weaker strategic confidence | Best for: Use as a practical midmarket comparator" },
  { name:"Odigo CCaaS",slug:"odigo",tier:"Upper Mid Core",
    fit:{large:57,mid:60,small:38},
    strengths:["European sovereignty fit regulated-sector relevance strong regional logic"],
    risks:["Gets cut outside Europe-first or sovereignty-led requirements"],
    verticals:["Financial Services", "Insurance", "Telecom", "Utilities", "Government"],
    dims:{ai:50,cost:60,consolidation:60,digital:80,quality:60,wfm:50,selfservice:80,agentexp:60,vertical:74,global:70,analytics:60,integration:50},
    integrations:[],
    addOns:"Win themes: Europe BFSI utilities government insurance with data-sovereignty needs | Watch: Can lose when global-scale expectations exceed regional strength | Best for: Use in Europe-first regulated-sector pursuits" },
  { name:"Dialpad Support",slug:"dialpad",tier:"AI-Native Challenger",
    fit:{large:38,mid:80,small:95},
    strengths:["AI-native messaging fast simplicity", "lean operations appeal"],
    risks:["Gets cut when enterprise governance routing and WEM depth are tested"],
    verticals:[],
    dims:{ai:55,cost:90,consolidation:70,digital:80,quality:50,wfm:50,selfservice:60,agentexp:60,vertical:43,global:60,analytics:60,integration:60},
    integrations:[],
    addOns:"Win themes: Lean support teams growth-stage organizations AI-forward buyers | Watch: Can lose when \u201cAI-native\u201d does not equal enterprise maturity | Best for: Use for lean AI-centric SMB/midmarket comparisons" },
  { name:"Puzzel Contact Centre",slug:"puzzel",tier:"Regional Core",
    fit:{large:38,mid:80,small:76},
    strengths:["Practical regional platform usable omni service", "partner accessibility"],
    risks:["Gets cut when global scale or enterprise governance depth is needed"],
    verticals:["Travel + Hospitality"],
    dims:{ai:50,cost:80,consolidation:60,digital:80,quality:70,wfm:50,selfservice:60,agentexp:60,vertical:45,global:50,analytics:60,integration:50},
    integrations:[],
    addOns:"Win themes: Regional service organizations hospitality and practical support ops | Watch: Can lose when buyer wants more strategic depth or global capability | Best for: Use in Nordic UK and regional service organizations" },
  { name:"UJET",slug:"ujet",tier:"Mid Core",
    fit:{large:57,mid:80,small:76},
    strengths:["Modern mobile-first", "digital-native CX design"],
    risks:["Gets cut when deep enterprise breadth or scale proof is demanded"],
    verticals:["Healthcare", "Retail + eCommerce"],
    dims:{ai:55,cost:70,consolidation:60,digital:80,quality:40,wfm:60,selfservice:60,agentexp:60,vertical:57,global:70,analytics:50,integration:50},
    integrations:[],
    addOns:"Win themes: App-centric support digital-native customer journeys | Watch: Can lose when modern story outruns field proof | Best for: Use where customer wants modern CX rework more than legacy migration support" },
  { name:"Nextiva Contact Center / CX Platform",slug:"nextiva",tier:"SMB Challenger",
    fit:{large:19,mid:99,small:95},
    strengths:["All-in-one communications", "service simplicity"],
    risks:["Gets cut in high-complexity or enterprise-governed contact center reviews"],
    verticals:[],
    dims:{ai:50,cost:100,consolidation:70,digital:80,quality:70,wfm:50,selfservice:40,agentexp:40,vertical:31,global:50,analytics:50,integration:60},
    integrations:[],
    addOns:"Win themes: SMB-midmarket simplification and bundled CX | Watch: Can lose when buyer needs deeper routing and workforce controls | Best for: Use in smaller all-in-one CX evaluations" },
  { name:"Vonage Contact Center",slug:"vonage",tier:"Regional / Midmarket Core",
    fit:{large:38,mid:80,small:76},
    strengths:["Integration flexibility communications adjacency CRM-friendly motion"],
    risks:["Gets cut when enterprise control-plane depth is scrutinized"],
    verticals:[],
    dims:{ai:45,cost:80,consolidation:70,digital:80,quality:40,wfm:40,selfservice:60,agentexp:60,vertical:44,global:60,analytics:40,integration:70},
    integrations:[],
    addOns:"Win themes: Midmarket CRM-led and comms-adjacent use cases | Watch: Can lose because buyers view it as situational not foundational | Best for: Use in CRM-led midmarket and blended comms environments" },
  { name:"Enghouse Interactive / CCaaS",slug:"enghouse",tier:"Legacy Bridge Core",
    fit:{large:57,mid:60,small:57},
    strengths:["Flexible migration story broad installed-base utility mixed-estate coexistence"],
    risks:["Gets cut in clean-sheet cloud transformation contests"],
    verticals:["Telecom", "Manufacturing"],
    dims:{ai:40,cost:40,consolidation:50,digital:80,quality:60,wfm:60,selfservice:60,agentexp:60,vertical:59,global:70,analytics:50,integration:50},
    integrations:[],
    addOns:"Win themes: Incumbent transitions coexistence and gradual cloud movement | Watch: Can lose when portfolio complexity weakens narrative clarity | Best for: Use in installed-base and coexistence programs" },
  { name:"Dialogue Cloud",slug:"anywherenow",tier:"Mid Core",
    fit:{large:57,mid:60,small:57},
    strengths:["Teams-native fit Microsoft estate alignment Azure relevance"],
    risks:["Gets cut when Microsoft centrality is weak"],
    verticals:[],
    dims:{ai:60,cost:60,consolidation:60,digital:80,quality:40,wfm:40,selfservice:60,agentexp:60,vertical:55,global:60,analytics:50,integration:50},
    integrations:[],
    addOns:"Win themes: Teams-standardized enterprise service environments | Watch: Can lose because ecosystem dependence narrows appeal | Best for: Use in Teams-first enterprise evaluations" },
  { name:"Avaya Experience Platform",slug:"avaya",tier:"Legacy Bridge Core",
    fit:{large:76,mid:40,small:38},
    strengths:["Installed-base relevance hybrid transition familiarity in incumbent estates"],
    risks:["Gets cut when buyer wants a clean future-state cloud bet"],
    verticals:["Financial Services", "Insurance", "Telecom", "Manufacturing", "Government"],
    dims:{ai:50,cost:30,consolidation:50,digital:80,quality:40,wfm:50,selfservice:60,agentexp:60,vertical:71,global:80,analytics:50,integration:50},
    integrations:[],
    addOns:"Win themes: Incumbent defense and staged modernization telecom/government legacy accounts | Watch: Can lose when legacy baggage overwhelms product discussion | Best for: Use in incumbent transition strategy not default greenfield ranking" },
  { name:"Aircall",slug:"aircall",tier:"SMB Challenger",
    fit:{large:19,mid:99,small:95},
    strengths:["Easy SMB sale modern integrations speed", "usability"],
    risks:["Gets cut immediately in serious enterprise CCaaS evaluations"],
    verticals:[],
    dims:{ai:35,cost:100,consolidation:90,digital:60,quality:30,wfm:20,selfservice:40,agentexp:40,vertical:25,global:60,analytics:40,integration:90},
    integrations:[],
    addOns:"Win themes: SMB sales/support teams and lower-midmarket environments | Watch: Can lose when buyer matures beyond SMB complexity | Best for: Use only for SMB/lower-midmarket comparison set" },
  { name:"Luware Nimbus / Nimbus Power",slug:"luware",tier:"Mid Core",
    fit:{large:57,mid:60,small:57},
    strengths:["Teams-centric service fit especially in Microsoft-heavy Europe accounts"],
    risks:["Gets cut when Teams is not central or broader control-plane needs dominate"],
    verticals:[],
    dims:{ai:45,cost:60,consolidation:60,digital:60,quality:40,wfm:40,selfservice:60,agentexp:60,vertical:54,global:60,analytics:40,integration:50},
    integrations:[],
    addOns:"Win themes: Microsoft-native service environments and managed service models | Watch: Can lose when buyers want broader vendor-agnostic platform power | Best for: Use in Teams-mandated and Europe-led accounts" },
  { name:"Alvaria Contact Center CX / Outreach",slug:"alvaria",tier:"Legacy / Outbound Specialist",
    fit:{large:57,mid:40,small:19},
    strengths:["Legacy outreach", "compliant outbound relevance"],
    risks:["Gets cut in modern broad CCaaS foundation selections"],
    verticals:["Telecom"],
    dims:{ai:35,cost:20,consolidation:30,digital:40,quality:80,wfm:70,selfservice:60,agentexp:60,vertical:51,global:70,analytics:60,integration:30},
    integrations:[],
    addOns:"Win themes: Collections outreach and legacy enterprise operations | Watch: Can lose because market sees it as specialist not broad platform | Best for: Use selectively in outbound-heavy legacy cases" },
  { name:"GoTo Connect Contact Center",slug:"goto",tier:"SMB Challenger",
    fit:{large:19,mid:99,small:95},
    strengths:["Simple all-in-one value for SMB buyers"],
    risks:["Gets cut when enterprise depth and governance matter"],
    verticals:[],
    dims:{ai:35,cost:100,consolidation:50,digital:60,quality:40,wfm:20,selfservice:40,agentexp:40,vertical:24,global:50,analytics:40,integration:40},
    integrations:[],
    addOns:"Win themes: Fast SMB-midmarket consolidation and cost control | Watch: Can lose once buyers compare to stronger midmarket-enterprise platforms | Best for: Use in SMB cost-sensitive reviews" },
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
                <details style={{marginTop:10}}><summary style={{fontSize:12,fontWeight:600,color:ELECTRIC,cursor:"pointer"}}>Market intelligence + competitive positioning</summary>
                  <p style={{fontSize:12,color:SLATE,lineHeight:1.6,marginTop:6,padding:"10px 14px",background:WARM,borderRadius:6}}>{v.addOns}</p>
                </details>
                {v.integrations&&v.integrations.length>0&&(
                  <div style={{marginTop:8,padding:"8px 14px",background:`${GREEN}04`,border:`1px solid ${GREEN}15`,borderRadius:6}}>
                    <div style={{fontSize:10,fontWeight:700,color:GREEN,letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>Verified Integrations</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                      {v.integrations.map((ig,igi)=><span key={igi} style={{fontSize:11,padding:"2px 8px",borderRadius:4,background:`${GREEN}10`,color:GREEN}}>{ig}</span>)}
                    </div>
                  </div>
                )}
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
