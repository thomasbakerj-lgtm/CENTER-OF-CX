import { useState, useEffect } from "react";
import { ToolFrame } from "./src/lib/ToolFrame.jsx";
import { Result, Button } from "./src/lib/ui.jsx";
import { K, Paper, Group, selectStyle, optionCss } from "./src/lib/frameKit.jsx";
import { TOUCH, RADIUS } from "./src/lib/tokens.js";
import { VendorIntro } from "./src/lib/VendorIntro.jsx";
import { DemoRequest } from "./src/lib/DemoRequest.jsx";
import ReportActions from "./ReportActions";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { useScenarioHash } from "./src/lib/useScenarioHash.js";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";
import { getVendor } from "./VendorData";

/* A fit band is a word on the page. The PDF's fit tiles keep the colours they printed. */
const GREEN = "#10B981"; const AMBER = "#F59E0B"; const MUTED = "#5B6E88";

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
  /* Phase 1 migration notes stay here for lineage; they carry unsourced figures, so the page no longer shows them (audit 30 Sep). */
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
  { name:"Webex Contact Center",slug:"cisco",tier:"Upper Mid Core",
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
  { name:"Zoom Contact Center",slug:"zoom",tier:"Mid Core",
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
  { name:"Dialogue Cloud",slug:"anywhere-now",tier:"Mid Core",
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

function Select({label,value,onChange,options,hint}){return<label style={{display:"block",minWidth:0,...K.strong,fontSize:14}}>{label}<select className="vm-sel" value={value} onChange={e=>onChange(e.target.value)} style={{...selectStyle,marginTop:6}}><option value="">Select...</option>{options.map(o=>typeof o==="string"?<option key={o} value={o}>{o}</option>:<option key={o.value} value={o.value}>{o.label}</option>)}</select>{hint&&<span style={{...K.small,display:"block",marginTop:4,fontWeight:400}}>{hint}</span>}</label>}
const tabStyle = (on) => ({ minHeight: TOUCH, padding: "0 12px", fontFamily: FONT, fontSize: 14, fontWeight: on ? 700 : 500, borderRadius: RADIUS.field, cursor: "pointer", border: `1px solid ${on ? K.strong.color : K.firm}`, background: "transparent", color: K.strong.color });
const pickStyle = (on) => ({ ...K.box, textAlign: "left", cursor: "pointer", fontFamily: FONT, border: `${on ? 2 : 1}px solid ${on ? K.strong.color : K.hair}` });

const TOOL_ID = "vendor-match";
const ROUTE = "/tools/vendor-match";
export const DEFAULTS = { vertical: "", size: "", currentPlatform: "", priorities: [], compliance: [], importance: {}, budgetSensitivity: "moderate", billingPreference: "monthly", termLength: "3 years" };
/* A mid-market healthcare buyer with two priorities, so the harness renders the
   shortlist and its PDF content. */
export const SAMPLE = { ...DEFAULTS, vertical: "Healthcare", size: "200-500 agents", priorities: PRIORITIES.slice(0, 2).map(p => p.id) };
/* A link keeps only known options. Importance is a whole number from 1 to 5. */
const pick = (v, list, fallback) => (list.includes(v) ? v : fallback);
const cleanState = (sc) => {
  const x = sc && typeof sc === "object" ? sc : {};
  return {
    vertical: pick(x.vertical, VERTICALS, ""),
    size: pick(x.size, SIZES, ""),
    currentPlatform: pick(x.currentPlatform, PLATFORMS.map(p => p.name), ""),
    priorities: Array.isArray(x.priorities) ? x.priorities.filter(id => PRIORITIES.some(p => p.id === id)) : [],
    compliance: Array.isArray(x.compliance) ? x.compliance.filter(c => typeof c === "string").map(c => c.slice(0, 80)) : [],
    importance: Object.fromEntries(Object.entries(x.importance && typeof x.importance === "object" ? x.importance : {}).filter(([k, v]) => /^[a-z]+$/i.test(k) && Number.isInteger(v) && v >= 1 && v <= 5)),
    budgetSensitivity: pick(x.budgetSensitivity, ["low", "moderate", "high"], "moderate"),
    billingPreference: pick(x.billingPreference, ["monthly", "annual"], "monthly"),
    termLength: pick(x.termLength, ["1 year", "3 years", "5 years"], "3 years"),
  };
};

/* Ceiling cap (interim Phase 1 fix, CLAUDE.md section 7; TB agreed 29 Sep). Measured on 20,000 random buyer profiles:
   the top vendor sat at the old 99 ceiling in 67% of them, two or more vendors shared 99 in 63% (their order then came
   from list position), and the top two were within 5 points in 97%. So the order now follows the unclipped score, no
   score shows above SCORE_CAP, and every vendor within LEAD_GAP points of the top forms one leading group. Both are
   heuristics, disclosed in METHOD_NOTE. Presentation only: the Phase 1 data and weights are unchanged. */
/* The same starting point for every vendor while size is out of the score; 70 is the value the Phase 1 lines already
   measure every dimension against. */
export const SIZE_NEUTRAL_BASE = 70;
export const SCORE_CAP = 90;
export const LEAD_GAP = 5;
export const shownScore = (v) => (v.raw >= SCORE_CAP ? `${SCORE_CAP}+` : String(v.score));

/* Interim disclosure (CLAUDE.md sections 12 and 13). This engine still scores a
   24-vendor CCaaS set from the Phase 1 model. The class-scoped rebuild on current
   research is Stage 4. Until then the page says so. */
const METHOD_NOTE = `These fit scores come from the Phase 1 CCaaS (contact center as a service) model: 24 vendors, each scored on 27 dimensions, then adjusted for your vertical, priorities, weightings, budget sensitivity and contract term. Operation size does not change the list yet: the Phase 1 size ratings have no source and contradict themselves, so every vendor starts from the same point until this engine is rebuilt on current research, which records the sizes each researched vendor is sold to. Use them as a starting shortlist. They do not rank vendors on current research. Current research on CCaaS vendors is under way, and this engine will be rebuilt on it, ranking only within comparable classes of vendor. Scores near the top of the scale are too close to tell apart in any meaningful way. So no score shows above ${SCORE_CAP}: in almost half of buyer profiles this model puts its top vendor at or above it, and in about a quarter several vendors reach it, so a higher number would claim a precision the model does not have. Vendors within ${LEAD_GAP} points of the top vendor are shown as one leading group, too close to separate.`;

export default function VendorMatchEngine() {
  const [init] = useState(() => { const sc = readScenario(TOOL_ID, DEFAULTS); return { fromLink: !!sc, d: cleanState(sc) }; });
  const [phase, setPhase] = useState(() => (init.fromLink && init.d.vertical && init.d.size && init.d.priorities.length ? "results" : "input"));
  const [step, setStep] = useState(0);
  const [d, setD] = useState(init.d);
  /* A refresh or Back reopens the answers given so far (the report sits on a later step). */
  useScenarioHash(TOOL_ID, d, DEFAULTS);
  useEffect(() => { window.scrollTo(0, 0); }, [phase]);
  useEffect(() => { clearScenarioParam(); }, []);
  const set = (k,v) => setD(prev => ({...prev,[k]:v}));
  const toggleArr = (k,v) => setD(prev => ({...prev,[k]:prev[k].includes(v)?prev[k].filter(x=>x!==v):[...prev[k],v]}));
  const setImp = (id,val) => setD(prev => ({...prev,importance:{...prev.importance,[id]:val}}));
  const vertComp = VERTICAL_COMPLIANCE[d.vertical] || VERTICAL_COMPLIANCE["Other"];
  const selPriorities = PRIORITIES.filter(p => d.priorities.includes(p.id));



  const getResults = () => {
    /* Size is out of the score until Vendor Match V3 (TB, 30 Sep 2026): the Phase 1 size table has no source and
       contradicts itself (Genesys and NICE rate 95 for under 50 agents and 60 for 200 to 500), so every vendor starts
       from the same base and size changes nothing. The Phase 1 size values stay in the data for lineage. */
    return VENDORS.map(v => {
      let s = SIZE_NEUTRAL_BASE;
      if(d.vertical&&v.verticals.includes(d.vertical)) s+=8; else if(d.vertical) s-=5;
      d.priorities.forEach(pId => { if(v.dims[pId]) s+=(v.dims[pId]-70)*0.12; });
      Object.entries(d.importance).forEach(([k,imp]) => { if(v.dims[k]) s+=(v.dims[k]-70)*(imp-3)*0.06; });
      if(d.budgetSensitivity==="high"&&v.dims.cost) s+=(v.dims.cost-70)*0.15;
      if(d.termLength==="1 year"&&v.name.includes("Amazon")) s+=8;
      /* Name and tier come from the profile the result links to, so the shortlist
         can never contradict the category page or the vendor profile. */
      const p = getVendor(v.slug);
      return {...v, name: p ? p.name : v.name, tier: p ? p.tier : v.tier, raw: s, score: Math.min(SCORE_CAP,Math.max(25,Math.round(s)))};
    }).sort((a,b) => b.raw-a.raw).map((v, i, all) => ({ ...v, lead: v.raw >= all[0].raw - LEAD_GAP }));
  };

  const handleResults = () => setPhase("results");


  const results = getResults();

  const result = phase === "results"
    ? <Result label="Vendors on the starting list" value={String(results.length)} change="Phase 1 CCaaS model, a starting list. How the scores are made is stated above the list." />
    : <Result label="Steps answered" value={`${[d.vertical && d.size, d.priorities.length > 0].filter(Boolean).length} of 2`} change="Your environment and at least one priority build the shortlist." />;

  return (
    <ToolFrame toolId={TOOL_ID} section="Vendor Selection" name="Vendor Match" title="Which CCaaS vendors belong on your starting list?"
      lede="Describe your environment, priorities and compliance needs, and get a shortlist with the reasoning behind each fit. The ranking runs on the Phase 1 vendor model, and its method is stated with the results."
      result={result} pinned={phase === "results" ? { label: "Vendors on the list", value: String(results.length) } : null}>
      <style>{FONT_IMPORT_CSS + optionCss("vm-sel")}</style>

      {phase==="input"&&(<>
        <div role="tablist" aria-label="Steps" style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["Your Environment","What Matters","Compliance","Dimension Weighting"].map((s,i)=>(
            <button key={i} type="button" role="tab" aria-selected={step===i} onClick={()=>setStep(i)} style={tabStyle(step===i)}>{i+1}. {s}</button>
          ))}
        </div>

        {step===0&&(<Group legend="Tell us about your environment">
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <Select label="Industry vertical" value={d.vertical} onChange={v=>{set("vertical",v);set("compliance",[]);}} options={VERTICALS}/>
            <Select label="Operation size" value={d.size} onChange={v=>set("size",v)} options={SIZES} hint="Noted in your report; it does not change the list yet"/>
            <Select label="Current platform" value={d.currentPlatform} onChange={v=>set("currentPlatform",v)} options={PLATFORMS.map(p=>p.name)} hint="Noted in your report; it does not change the list"/>
          </div>
          <div style={{marginTop:18}}><Button onClick={()=>setStep(1)} disabled={!d.vertical||!d.size}>Next: what matters</Button></div>
        </Group>)}

        {step===1&&(<Group legend="What matters to your operation?" note="Select all that apply. Each one you select shapes the match.">
          <div style={K.grid(240)}>
            {PRIORITIES.map(p=>{const on=d.priorities.includes(p.id);return(<button key={p.id} type="button" aria-pressed={on} onClick={()=>toggleArr("priorities",p.id)} style={pickStyle(on)}>
              <div style={{...K.strong,fontSize:14}}>{on?"\u2713 ":""}{p.name}</div>
              <div style={{...K.small,marginTop:2}}>{p.desc}</div>
            </button>);})}
          </div>
          <div style={{display:"flex",gap:10,marginTop:18,flexWrap:"wrap"}}>
            <Button kind="secondary" onClick={()=>setStep(0)}>Back</Button>
            <Button onClick={()=>setStep(2)} disabled={d.priorities.length===0}>Next: compliance</Button>
          </div>
        </Group>)}

        {step===2&&(<Group legend="Compliance Requirements" note={`Based on your ${d.vertical||"selected"} vertical. These do not change the list or its order: the Phase 1 model holds no verified compliance data. They print in your report as requirements to confirm with each vendor.`}>
          <div style={K.grid(240)}>
            {vertComp.map(req=>{const on=d.compliance.includes(req);return(<button key={req} type="button" aria-pressed={on} onClick={()=>toggleArr("compliance",req)} style={{...pickStyle(on),...K.strong,fontSize:14,fontWeight:on?700:500}}>{on?"\u2713 ":""}{req}</button>);})}
          </div>
          <div style={{display:"flex",gap:10,marginTop:18,flexWrap:"wrap"}}>
            <Button kind="secondary" onClick={()=>setStep(1)}>Back</Button>
            <Button onClick={()=>setStep(3)}>Next: weighting</Button>
          </div>
        </Group>)}

        {step===3&&(<Group legend="How important is each dimension?" note="Rate your selected priorities: 1 = nice to have, 5 = critical.">
          {selPriorities.map(dim=>(<div key={dim.id} style={{...K.box,marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,marginBottom:6}}>
              <div><span style={{...K.strong,fontSize:14}}>{dim.name}</span><span style={{...K.small,display:"block"}}>{dim.desc}</span></div>
              <span style={{...K.strong,...K.num,fontSize:22}}>{d.importance[dim.id]||3}</span>
            </div>
            <input type="range" aria-label={`${dim.name} importance, 1 to 5`} min={1} max={5} value={d.importance[dim.id]||3} onChange={e=>setImp(dim.id,Number(e.target.value))} style={{width:"100%",minHeight:TOUCH,accentColor:K.strong.color}}/>
          </div>))}
          <h3 style={{...K.strong,fontSize:15,margin:"18px 0 10px"}}>Commercial Preferences</h3>
          <div style={K.grid(200)}>
            <Select label="Budget sensitivity" value={d.budgetSensitivity} onChange={v=>set("budgetSensitivity",v)} options={[{value:"low",label:"Low (best platform wins)"},{value:"moderate",label:"Moderate (value matters)"},{value:"high",label:"High (cost-driven)"}]}/>
            <Select label="Billing preference" value={d.billingPreference} onChange={v=>set("billingPreference",v)} options={[{value:"monthly",label:"Monthly"},{value:"annual",label:"Annual (discount)"},{value:"consumption",label:"Consumption-based"}]}/>
            <Select label="Contract term" value={d.termLength} onChange={v=>set("termLength",v)} options={["1 year","3 years","5 years"]}/>
          </div>
          <div style={{display:"flex",gap:10,marginTop:18,flexWrap:"wrap"}}>
            <Button kind="secondary" onClick={()=>setStep(2)}>Back</Button>
            <Button onClick={handleResults}>See my matches</Button>
          </div>
        </Group>)}
      </>)}

      {phase==="results"&&(<>
        <section aria-label="How these scores are made" style={K.lead}>
          <p style={K.body}><strong style={{color:K.strong.color}}>How these scores are made. </strong>{METHOD_NOTE}</p>
        </section>
        <section aria-label="Your vendor shortlist" style={K.panel}>
          <span style={K.kicker}>Your Vendor Shortlist</span>
          <h2 style={{...K.h2,marginTop:6}}>A Phase 1 starting list, ordered by fit on that model</h2>
          <p style={K.small}>{d.size} in {d.vertical||"your vertical"}{d.currentPlatform&&d.currentPlatform!=="None / Greenfield"?`, migrating from ${d.currentPlatform}`:""}. {d.priorities.length} priorities. {d.compliance.length} compliance requirements.</p>
        </section>

        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {results.map((v,i)=>{
            const isTop=i<3;
            return(<div key={v.name} style={{...(isTop?K.panel:K.box),border:`${isTop?2:1}px solid ${isTop?K.firm:K.hair}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                <div style={{flex:1,minWidth:200}}>
                  <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:4}}>
                    <span style={K.small}>{v.lead?"Leading group":`#${i+1}`}</span>
                    <a href={`/vendors/${v.slug}`} style={{...K.link,fontSize:isTop?20:16}}>{v.name}</a>
                  </div>
                  {isTop&&(<>
                    <ul style={{listStyle:"none",padding:0,margin:"8px 0 4px"}}>
                      {v.strengths.map((st,si)=><li key={si} style={K.body}><strong style={{color:K.strong.color}}>Strength:</strong> {st}</li>)}
                    </ul>
                    <ul style={{listStyle:"none",padding:0,margin:"0 0 6px"}}>
                      {v.risks.map((r,ri)=><li key={ri} style={K.body}><strong style={{color:K.strong.color}}>Risk:</strong> {r}</li>)}
                    </ul>
                  </>)}
                </div>
                <div style={{textAlign:"center",flexShrink:0}}>
                  <div style={{...K.strong,...K.num,fontSize:isTop?32:22}}>{shownScore(v)}</div>
                  <div style={{...K.small,fontWeight:600,color:K.strong.color}}>{v.lead?"Leading group":"Phase 1 fit"}</div>
                </div>
              </div>
              {v.lead&&<p style={{...K.small,marginTop:6}}>Within {LEAD_GAP} points of the top vendor on this model: too close to separate.</p>}
              {isTop&&(<>
                <div style={{display:"flex",gap:14,flexWrap:"wrap",marginTop:10,paddingTop:10,borderTop:`1px solid ${K.hair}`}}>
                  {selPriorities.slice(0,6).map(p=>(<div key={p.id} style={{minWidth:80}}>
                    <div style={K.small}>{p.name.split("+")[0].trim()}</div>
                    <div role="img" aria-label={`${p.name}: ${v.dims[p.id]||"n/a"}`} style={{height:4,background:K.hair,borderRadius:2,overflow:"hidden",width:70,margin:"3px 0"}}>
                      <div style={{height:"100%",width:`${v.dims[p.id]||50}%`,background:K.shade(0),borderRadius:2}}/>
                    </div>
                    <div style={{...K.strong,fontSize:13}}>{v.dims[p.id]||"n/a"}</div>
                  </div>))}
                </div>
                <details style={{marginTop:10}}><summary style={{...K.link,cursor:"pointer",minHeight:TOUCH,display:"flex",alignItems:"center"}}>Market intelligence + competitive positioning</summary>
                  <p style={{...K.body,...K.box,marginTop:6}}>{v.addOns}</p>
                </details>
                {v.integrations&&v.integrations.length>0&&(
                  <div style={{...K.box,marginTop:8}}>
                    <div style={{...K.kicker,marginBottom:4}}>Integrations named in the Phase 1 data</div>
                    <p style={K.body}>{v.integrations.join(", ")}</p>
                  </div>
                )}
                <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:10}}>
                  <VendorIntro slug={v.slug} name={v.name} from={TOOL_ID} surface="tool"/>
                  <Button kind="secondary" href={`/vendors/${v.slug}`}>View the full profile</Button>
                </div>
              </>)}
              {!isTop&&(<div style={{marginTop:8}}><VendorIntro slug={v.slug} name={v.name} from={TOOL_ID} surface="tool" kind="text"/></div>)}
            </div>);
          })}
        </div>

        <Paper>
          <ReportActions
            toolId={TOOL_ID}
            routePath={ROUTE}
            state={d}
            defaults={DEFAULTS}
            summary={results.slice(0, 5).map((v, i) => ({ label: "Match " + (i + 1), value: v.name }))}
            toolName="Vendor Match Analysis"
            subtitle={`${d.size} · ${d.vertical} · ${d.priorities.length} priorities weighted`}
            sections={[
              { title: "How These Scores Are Made", type: "text", content: METHOD_NOTE },
              { title: "Environment", type: "table", rows: [
                ["Vertical", d.vertical || "Not specified"],
                ["Operation Size", d.size || "Not specified"],
                ["Current Platform", d.currentPlatform && d.currentPlatform !== "None / Greenfield" ? d.currentPlatform : "Greenfield / not specified"],
                ["Priorities", d.priorities.map(p => PRIORITIES.find(pr => pr.id === p)?.name || p).join(", ") || "None selected"],
                ["Compliance Requirements", d.compliance.join(", ") || "None selected"],
                ["Budget Sensitivity", d.budgetSensitivity],
                ["Billing Preference", d.billingPreference],
                ["Contract Term", d.termLength],
              ]},
              { title: "Vendor Shortlist: Top 5", type: "findings", items: results.slice(0, 5).map((v, i) => `${v.lead ? "Leading group" : `#${i+1}`} ${v.name} (Fit Score: ${shownScore(v)}), ${v.tier}. ${v.strengths[0] || ""}`) },
              { title: "Fit Scores", type: "metrics", items: results.slice(0, 4).map(v => ({
                label: v.name.split(" ")[0],
                value: shownScore(v),
                color: v.score >= 85 ? GREEN : v.score >= 70 ? AMBER : MUTED,
                sub: v.lead ? "Leading group" : "Phase 1 fit",
              })) },
              { title: "Top Match Intelligence", type: "actions", items: results.slice(0, 3).map((v, i) => ({
                action: `${v.name}`,
                detail: `Strengths: ${v.strengths.join("; ")}. Risk: ${v.risks[0] || "N/A"}.${v.integrations && v.integrations.length > 0 ? ` Integrations named in the Phase 1 data: ${v.integrations.join(", ")}.` : ""}`,
                priority: i === 0 ? "high" : undefined,
              })) },
              { title: "Important Note", type: "text", content: "This shortlist comes from independently scored Phase 1 vendor data across 27 weighted dimensions. Fit also depends on details this tool cannot capture: integration complexity, contract terms, implementation timelines and how ready your organization is. Use it as the starting point for a deeper evaluation. The final decision belongs to that evaluation." },
            ]}
          />
        </Paper>

        {/* The demo request (TB, 29 Sep 2026): a button that opens a short form posting to the contact inbox, with the
            reader's own answers attached only if they choose. It reads the list; it never changes it. */}
        <DemoRequest vendor={{name:results[0].name,slug:results[0].slug}} from={TOOL_ID} context={[
          ["Industry",d.vertical],["Operation size",d.size],["Current platform",d.currentPlatform],
          ["Priorities",d.priorities.map(p=>PRIORITIES.find(pr=>pr.id===p)?.name||p).join(", ")],["Compliance",d.compliance.join(", ")],
        ]}/>

        <div style={K.grid(260)}>
          <a href="/contact" style={{...K.panel,display:"block",textDecoration:"none"}}>
            <div style={{...K.kicker,marginBottom:8}}>Refine Your Shortlist</div>
            <div style={{...K.strong,fontSize:18,marginBottom:8}}>Speak with a CX consultant</div>
            <p style={{...K.small,margin:"0 0 12px"}}>30 minutes to refine this shortlist for integration complexity, contract terms and organizational readiness.</p>
            <span style={K.link}>Request a working session</span>
          </a>
        </div>

        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          <Button kind="secondary" href="/tools/platform-decision">Platform Decision</Button>
          <Button kind="secondary" href="/tools/contract-risk">Contract Risk Scanner</Button>
          <Button kind="secondary" href="/tools/transformation-readiness">Transformation Readiness</Button>
          <Button kind="secondary" href="/how-to-choose">Explore all the tools</Button>
        </div>
      </>)}
    </ToolFrame>
  );
}
