// Agent Assist Market Intelligence — sourced from Agent_Assist_Matrix_and_Rubric.xlsx
// 15 vendors | 10 scoring dimensions | Weighted total out of ~100
// Bell Curve: Elite (86-90), Strong (80-85), Solid (76-79), Selective (70-75), Niche (65-69)

export const agentAssistVendors = [
  // ═══ ELITE (86–90) ═══
  { name: "NICE", slug: "nice-aa", score: 89, tier: "Elite", band: "Leader", type: "Suite-native", cf: 5.0, rt: 5.0, kg: 4.5, wf: 5.0, oc: 5.0, gc: 5.0, ia: 4.5, al: 4.5, ax: 4.5, mp: 5.0, momentum: "Stable", strength1: "Broad omnichannel depth", strength2: "Actionability and automation", strength3: "Governance strength", weakness1: "Can feel suite-led", weakness2: "May be more than some buyers need", bestFor: "Large enterprise omnichannel with governance focus", watchout: "May feel suite-led" },
  { name: "Genesys", slug: "genesys-aa", score: 88, tier: "Elite", band: "Leader", type: "Suite-native", cf: 5.0, rt: 4.5, kg: 4.5, wf: 4.5, oc: 5.0, gc: 4.0, ia: 4.5, al: 4.5, ax: 4.0, mp: 5.0, momentum: "Up", strength1: "Enterprise platform fit", strength2: "Strong summary and copilot story", strength3: "Global CCaaS proof", weakness1: "Best inside Genesys ecosystem", weakness2: "Less overlay flexibility", bestFor: "Complex global service operations on Genesys", watchout: "Best when bought into Genesys stack" },
  { name: "Cresta", slug: "cresta-aa", score: 88, tier: "Elite", band: "Leader", type: "Specialist", cf: 5.0, rt: 5.0, kg: 4.5, wf: 4.5, oc: 4.0, gc: 4.0, ia: 4.0, al: 4.0, ax: 4.0, mp: 4.5, momentum: "Up", strength1: "Real-time guidance strength", strength2: "Behavioral and sales performance lift", strength3: "Workflow context", weakness1: "Requires clear program design", weakness2: "Commercial value case must be proven", bestFor: "Performance lift and real-time guidance", watchout: "Requires clear workflow design" },
  { name: "Google Cloud Agent Assist", slug: "google-aa", score: 87, tier: "Elite", band: "Leader", type: "Cloud platform", cf: 5.0, rt: 4.5, kg: 5.0, wf: 4.0, oc: 4.0, gc: 4.0, ia: 4.0, al: 4.0, ax: 3.5, mp: 4.5, momentum: "Stable", strength1: "Excellent grounding", strength2: "AI-native architecture", strength3: "Builder flexibility", weakness1: "Needs data and technical maturity", weakness2: "More platform than turnkey", bestFor: "Customizable AI-native programs", watchout: "Needs data and technical maturity" },

  // ═══ STRONG (80–85) ═══
  { name: "Observe.AI", slug: "observeai-aa", score: 84, tier: "Strong", band: "Contender", type: "Specialist", cf: 4.5, rt: 4.5, kg: 4.0, wf: 3.5, oc: 3.5, gc: 4.5, ia: 3.5, al: 4.5, ax: 4.0, mp: 4.5, momentum: "Up", strength1: "Coaching and QA linkage", strength2: "Compliance guidance", strength3: "Voice-first operational depth", weakness1: "Validate accuracy and setup load", weakness2: "Less broad than top suites", bestFor: "Coaching, QA, compliance plus live guidance", watchout: "Requires operating discipline" },
  { name: "Talkdesk", slug: "talkdesk-aa", score: 82, tier: "Strong", band: "Contender", type: "Suite-native", cf: 4.5, rt: 4.0, kg: 4.0, wf: 4.0, oc: 4.0, gc: 4.0, ia: 4.0, al: 4.0, ax: 4.0, mp: 4.0, momentum: "Up", strength1: "Practical suite fit", strength2: "Good voice plus digital story", strength3: "Agentic direction", weakness1: "Best when on Talkdesk", weakness2: "Less distinct than top 4", bestFor: "Mid-market to enterprise on Talkdesk", watchout: "Best when bought into suite" },
  { name: "Amazon Connect", slug: "amazon-aa", score: 82, tier: "Strong", band: "Contender", type: "Cloud platform", cf: 4.5, rt: 4.5, kg: 4.5, wf: 4.5, oc: 4.0, gc: 4.0, ia: 4.5, al: 3.5, ax: 3.5, mp: 4.0, momentum: "Up", strength1: "Actionability and workflow", strength2: "Builder flexibility", strength3: "AWS ecosystem strength", weakness1: "Technical lift can be high", weakness2: "Packaged buyer experience varies", bestFor: "Builders and AWS-native teams", watchout: "Can shift work to technical team" },

  // ═══ SOLID (76–79) ═══
  { name: "Verint", slug: "verint-aa", score: 79, tier: "Solid", band: "Contender", type: "Suite + bots", cf: 4.0, rt: 4.0, kg: 4.0, wf: 4.5, oc: 3.5, gc: 5.0, ia: 4.0, al: 4.0, ax: 3.5, mp: 4.0, momentum: "Stable", strength1: "Compliance and bot automation", strength2: "Micro-workflow value", strength3: "Strong governance", weakness1: "Story can feel modular and complex", weakness2: "Requires clear use case selection", bestFor: "Compliance and capacity automation", watchout: "Modular story can be complex" },
  { name: "Five9", slug: "five9-aa", score: 78, tier: "Solid", band: "Contender", type: "Suite-native", cf: 4.0, rt: 4.0, kg: 3.5, wf: 3.5, oc: 4.0, gc: 3.5, ia: 4.0, al: 3.5, ax: 3.5, mp: 4.0, momentum: "Stable", strength1: "Established CCaaS fit", strength2: "Practical suite add-on", strength3: "Broad buyer relevance", weakness1: "Differentiation is less sharp", weakness2: "Validate depth versus leaders", bestFor: "Established CCaaS buyers", watchout: "Depth less distinct than leaders" },
  { name: "Cognigy", slug: "cognigy-aa", score: 77, tier: "Solid", band: "Emerging", type: "Open platform", cf: 4.0, rt: 4.0, kg: 4.0, wf: 4.0, oc: 4.0, gc: 3.5, ia: 4.5, al: 3.5, ax: 3.0, mp: 3.5, momentum: "Up", strength1: "Open platform and orchestration", strength2: "Strong customization", strength3: "Voice plus digital flexibility", weakness1: "Needs solutioning maturity", weakness2: "Less category proof than leaders", bestFor: "Custom orchestrated voice and digital flows", watchout: "Needs solutioning maturity" },
  { name: "Glia", slug: "glia-aa", score: 76, tier: "Solid", band: "Niche", type: "Regulated niche", cf: 4.0, rt: 4.0, kg: 4.0, wf: 3.5, oc: 4.0, gc: 4.5, ia: 3.5, al: 3.5, ax: 4.0, mp: 3.5, momentum: "Stable", strength1: "Exceptional BFSI fit", strength2: "High-trust service model", strength3: "Strong regulated workflow match", weakness1: "Narrower horizontal fit", weakness2: "Less relevant for general retail or BPO", bestFor: "BFSI and high-trust service", watchout: "Vertical focus limits horizontal scale" },

  // ═══ SELECTIVE (70–75) ═══
  { name: "Zendesk", slug: "zendesk-aa", score: 73, tier: "Selective", band: "Emerging", type: "Digital service platform", cf: 3.5, rt: 3.5, kg: 4.0, wf: 3.5, oc: 4.0, gc: 3.5, ia: 3.5, al: 3.5, ax: 4.0, mp: 4.0, momentum: "Up", strength1: "Great help center fit", strength2: "Digital service momentum", strength3: "Easier entry for Zendesk bases", weakness1: "Voice assist depth still maturing", weakness2: "Less enterprise CCaaS proof", bestFor: "Digital service teams adding voice", watchout: "Voice assist still maturing" },
  { name: "Zoom", slug: "zoom-aa", score: 71, tier: "Selective", band: "Emerging", type: "UC/CC hybrid", cf: 3.5, rt: 3.5, kg: 3.5, wf: 3.0, oc: 4.0, gc: 3.5, ia: 3.5, al: 3.5, ax: 3.5, mp: 3.5, momentum: "Up", strength1: "Installed base advantage", strength2: "Unified comms synergy", strength3: "Simple adoption story", weakness1: "Assist depth is early stage", weakness2: "Needs more proof in complex ops", bestFor: "Existing Zoom bases and unified comms buyers", watchout: "Assist depth not yet top-tier" },
  { name: "Balto", slug: "balto-aa", score: 70, tier: "Selective", band: "Niche", type: "Specialist", cf: 4.0, rt: 4.5, kg: 3.0, wf: 2.5, oc: 2.5, gc: 4.5, ia: 3.5, al: 3.0, ax: 4.0, mp: 3.5, momentum: "Stable", strength1: "Outstanding live guidance", strength2: "Strong script and compliance fit", strength3: "Overlay flexibility", weakness1: "Narrow breadth", weakness2: "Limited omnichannel depth", bestFor: "Scripted sales, collections, and compliance", watchout: "Platform breadth is narrow" },

  // ═══ NICHE (65–69) ═══
  { name: "Dialpad", slug: "dialpad-aa", score: 67, tier: "Niche", band: "Niche", type: "UC/CC hybrid", cf: 3.5, rt: 3.5, kg: 3.5, wf: 3.0, oc: 3.5, gc: 3.0, ia: 3.5, al: 3.0, ax: 3.5, mp: 3.5, momentum: "Stable", strength1: "Simple AI-native story", strength2: "Easy for existing customers", strength3: "Good basic assist", weakness1: "Lower category depth", weakness2: "Less enterprise control and breadth", bestFor: "SMB/mid-market and existing Dialpad buyers", watchout: "Category depth more limited" },
];

export const getAllAgentAssist = () => agentAssistVendors;
export const getAgentAssistVendor = (slug) => agentAssistVendors.find(v => v.slug === slug) || null;

export const aaTierConfig = {
  "Elite": { color: "#10B981", range: "86–90", desc: "Default shortlist leaders. Full orchestration, deep real-time guidance, grounded knowledge, workflow execution, and enterprise-grade governance." },
  "Strong": { color: "#0088DD", range: "80–85", desc: "Credible finalist pool. Strong in defined motions with clear differentiation, but narrower than the Elite tier in specific dimensions." },
  "Solid": { color: "#3B82F6", range: "76–79", desc: "Selective shortlist based on fit. Genuine capability that earns consideration when use case, vertical, or installed base align." },
  "Selective": { color: "#F59E0B", range: "70–75", desc: "Use-case or installed-base led. Relevant in specific contexts where buyer priorities match vendor strengths." },
  "Niche": { color: "#EF4444", range: "65–69", desc: "Narrow fit or lower category depth. Useful in defined lanes but should be qualified carefully against broader alternatives." },
};

export const aaDimensions = [
  { abbr: "CF", name: "Category Fit", weight: 8, desc: "Is this truly an agent assist platform today." },
  { abbr: "RT", name: "Real-Time Assist Depth", weight: 14, desc: "Live guidance, prompts, context, and next-best action during the interaction." },
  { abbr: "KG", name: "Knowledge & Grounding", weight: 12, desc: "Relevance, grounding precision, and answer trustworthiness." },
  { abbr: "WF", name: "Workflow & Actionability", weight: 12, desc: "Can it trigger or complete work during the interaction." },
  { abbr: "OC", name: "Omnichannel & Desktop", weight: 8, desc: "Voice, digital, desktop embed, and overlay flexibility." },
  { abbr: "GC", name: "Coaching & Compliance", weight: 12, desc: "Live coaching, policy controls, risk management, and guardrails." },
  { abbr: "IA", name: "Integration Architecture", weight: 10, desc: "CRM, knowledge base, CCaaS, workflow, and identity connectivity." },
  { abbr: "AL", name: "Analytics & Closed Loop", weight: 8, desc: "Reporting, improvement loops, and performance measurement." },
  { abbr: "AX", name: "Adoption & Admin UX", weight: 8, desc: "Agent learning curve, supervisor buy-in, and administrative ease." },
  { abbr: "MP", name: "Market Proof", weight: 8, desc: "Production references, deployment scale, and validation confidence." },
];
