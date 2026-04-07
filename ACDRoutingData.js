// ACD/Routing Market Intelligence — sourced from Top_50_ACD_Routing_Matrices.xlsx
// 44 scored vendors | 10 dimensions | 1-5 scale | Weighted average (0-5)
// Tiers: Elite (3.5+), Strong (3.0-3.4), Mid-Market (2.7-2.9), Basic (2.4-2.6), Entry (≤2.2)

export const acdVendors = [
  // ═══════════════════════════════════════
  // TIER 1 — ELITE ROUTING ENGINES (3.5–4.2)
  // ═══════════════════════════════════════
  { name: "Genesys Cloud", slug: "genesys-acd", score: 4.2, tier: "Elite", segment: "Global CCaaS", rl: 5, di: 4, lat: 4, qa: 4, fo: 4, obs: 4, ai: 4, int: 5, wem: 4, glo: 5, profile: "Strong omnichannel ACD, intent/policy routing, orchestration leaning.", rmi: "3–4", quadrant: "True Orchestrator" },
  { name: "NICE CXone", slug: "nice-acd", score: 4.0, tier: "Elite", segment: "Global CCaaS", rl: 4, di: 4, lat: 4, qa: 4, fo: 4, obs: 4, ai: 4, int: 4, wem: 4, glo: 5, profile: "Mature skills + behavioral / AI-powered routing, strong WEM tie-in.", rmi: "3–4", quadrant: "True Orchestrator" },
  { name: "Amazon Connect", slug: "amazon-acd", score: 3.9, tier: "Elite", segment: "Hyperscaler CCaaS", rl: 5, di: 5, lat: 4, qa: 4, fo: 3, obs: 3, ai: 4, int: 5, wem: 3, glo: 4, profile: "AI-native routing with deep AWS data/AI hooks. Builder-led architecture.", rmi: "3–4", quadrant: "True Orchestrator" },
  { name: "Five9", slug: "five9-acd", score: 3.8, tier: "Elite", segment: "Global CCaaS", rl: 4, di: 4, lat: 4, qa: 4, fo: 4, obs: 3, ai: 3, int: 4, wem: 4, glo: 4, profile: "Enterprise CCaaS, skills + AI routing, solid outbound + integrations.", rmi: "3–4", quadrant: "True Orchestrator" },
  { name: "Talkdesk", slug: "talkdesk-acd", score: 3.7, tier: "Elite", segment: "Global CCaaS", rl: 4, di: 4, lat: 4, qa: 4, fo: 3, obs: 3, ai: 3, int: 4, wem: 3, glo: 4, profile: "Cloud-native CCaaS, AI-enhanced routing, strong app ecosystem.", rmi: "3–4", quadrant: "True Orchestrator" },
  { name: "UJET", slug: "ujet-acd", score: 3.7, tier: "Elite", segment: "Modern CCaaS", rl: 4, di: 5, lat: 4, qa: 4, fo: 3, obs: 3, ai: 3, int: 5, wem: 3, glo: 4, profile: "Mobile-first, AI-infused CCaaS with heavy CRM + data integration.", rmi: "3–4", quadrant: "True Orchestrator" },
  { name: "Content Guru (storm)", slug: "contentguru-acd", score: 3.6, tier: "Elite", segment: "Enterprise CCaaS", rl: 4, di: 4, lat: 4, qa: 4, fo: 5, obs: 3, ai: 3, int: 4, wem: 3, glo: 5, profile: "High-availability routing, strong in public sector/scale. Best failover score in market.", rmi: "3–4", quadrant: "True Orchestrator" },
  { name: "Odigo", slug: "odigo-acd", score: 3.5, tier: "Elite", segment: "Enterprise CCaaS (EU)", rl: 4, di: 4, lat: 3, qa: 4, fo: 4, obs: 3, ai: 3, int: 4, wem: 3, glo: 4, profile: "Cloud-native CCaaS, AI + routing focus, strong EU/regulatory posture.", rmi: "3–4", quadrant: "True Orchestrator" },
  { name: "Twilio Flex", slug: "twilio-acd", score: 3.5, tier: "Elite", segment: "Programmable CC", rl: 5, di: 5, lat: 3, qa: 3, fo: 3, obs: 2, ai: 3, int: 5, wem: 3, glo: 3, profile: "Fully programmable CC; routing limited only by what you build. Highest integration and data scores but weakest observability.", rmi: "3–4 (DIY)", quadrant: "True Orchestrator" },
  { name: "Kore.ai", slug: "koreai-acd", score: 3.5, tier: "Elite", segment: "Orchestration Layer", rl: 4, di: 4, lat: 3, qa: 3, fo: 3, obs: 4, ai: 4, int: 4, wem: 3, glo: 4, profile: "IVA-first platform with orchestration-layer routing capabilities. Strongest AI and observability scores in tier.", rmi: "3–4", quadrant: "AI Heavy, Routing Light" },

  // ═══════════════════════════════════════
  // TIER 2 — STRONG BUT UNEVEN (3.0–3.4)
  // ═══════════════════════════════════════
  { name: "Cisco Webex CC", slug: "cisco-acd", score: 3.4, tier: "Strong", segment: "Enterprise CCaaS", rl: 4, di: 3, lat: 3, qa: 4, fo: 4, obs: 3, ai: 3, int: 4, wem: 3, glo: 4, profile: "Enterprise routing with strong network pedigree and multi-region options.", rmi: "3–4", quadrant: "Strong Routing, Low AI" },
  { name: "Salesforce Voice", slug: "salesforce-acd", score: 3.4, tier: "Strong", segment: "CRM-Native", rl: 4, di: 5, lat: 3, qa: 4, fo: 3, obs: 3, ai: 3, int: 5, wem: 3, glo: 4, profile: "Voice + routing embedded in CRM, moving toward AI-led orchestration.", rmi: "3–4", quadrant: "Strong" },
  { name: "Avaya Experience Platform", slug: "avaya-acd", score: 3.3, tier: "Strong", segment: "Enterprise CCaaS", rl: 4, di: 3, lat: 3, qa: 4, fo: 3, obs: 3, ai: 2, int: 4, wem: 3, glo: 4, profile: "Deep ACD heritage, omnichannel + cloud pivot. Strong voice routing, weak AI.", rmi: "2–3", quadrant: "Strong Routing, Low AI" },
  { name: "RingCentral CC", slug: "ringcentral-acd", score: 3.3, tier: "Strong", segment: "Global CCaaS", rl: 3, di: 3, lat: 3, qa: 3, fo: 3, obs: 3, ai: 3, int: 4, wem: 3, glo: 3, profile: "Cloud-native, omnichannel routing, strong CRM/UC integration.", rmi: "3–4", quadrant: "Strong" },
  { name: "8x8 Contact Center", slug: "8x8-acd", score: 3.2, tier: "Strong", segment: "UC+CCaaS", rl: 3, di: 3, lat: 3, qa: 3, fo: 3, obs: 2, ai: 2, int: 4, wem: 3, glo: 3, profile: "UC+CC bundle, omnichannel routing, good CRM tie-ins.", rmi: "2–3", quadrant: "Strong" },
  { name: "Bright Pattern", slug: "bright-acd", score: 3.2, tier: "Strong", segment: "CCaaS", rl: 3, di: 3, lat: 3, qa: 3, fo: 3, obs: 3, ai: 2, int: 4, wem: 3, glo: 3, profile: "Omnichannel routing with Teams and CRM integrations.", rmi: "2–3", quadrant: "Strong" },
  { name: "Alvaria", slug: "alvaria-acd", score: 3.1, tier: "Strong", segment: "Enterprise CC", rl: 3, di: 3, lat: 3, qa: 3, fo: 4, obs: 2, ai: 2, int: 3, wem: 3, glo: 4, profile: "Outbound-heavy, enterprise routing & compliance. Legacy Aspect/Noble heritage.", rmi: "2–3", quadrant: "Strong Routing, Low AI" },
  { name: "Puzzel", slug: "puzzel-acd", score: 3.1, tier: "Strong", segment: "CCaaS (EU)", rl: 3, di: 3, lat: 3, qa: 3, fo: 3, obs: 2, ai: 2, int: 3, wem: 3, glo: 3, profile: "Cloud CCaaS with omnichannel and advanced routing. European focus.", rmi: "2–3", quadrant: "Strong Routing, Low AI" },
  { name: "Mitel MiCC", slug: "mitel-acd", score: 3.0, tier: "Strong", segment: "Enterprise CC", rl: 3, di: 3, lat: 3, qa: 3, fo: 3, obs: 2, ai: 2, int: 3, wem: 3, glo: 3, profile: "Omnichannel skills-based routing with strong PBX integration.", rmi: "2–3", quadrant: "Strong Routing, Low AI" },
  { name: "Vonage CC", slug: "vonage-acd", score: 3.0, tier: "Strong", segment: "UC+CCaaS", rl: 3, di: 3, lat: 3, qa: 3, fo: 3, obs: 2, ai: 2, int: 4, wem: 3, glo: 3, profile: "API-friendly CC with Teams/CRM integration and skills routing.", rmi: "2–3", quadrant: "Basic ACD Territory" },
  { name: "Zoom CC", slug: "zoom-acd", score: 3.0, tier: "Strong", segment: "UC+CCaaS", rl: 3, di: 3, lat: 3, qa: 3, fo: 3, obs: 2, ai: 2, int: 4, wem: 3, glo: 3, profile: "Video-first CCaaS with emerging omnichannel routing.", rmi: "2–3", quadrant: "Strong" },
  { name: "CentrePal", slug: "centrepal-acd", score: 3.0, tier: "Strong", segment: "Teams CC", rl: 3, di: 3, lat: 3, qa: 3, fo: 2, obs: 2, ai: 2, int: 3, wem: 3, glo: 3, profile: "Native Teams contact center with integrated routing/agent UI.", rmi: "2–3", quadrant: "Strong" },
  { name: "ComputerTalk", slug: "computertalk-acd", score: 3.0, tier: "Strong", segment: "Teams CC", rl: 3, di: 3, lat: 3, qa: 3, fo: 3, obs: 2, ai: 2, int: 3, wem: 3, glo: 3, profile: "Full-featured contact center on Teams with rich routing options.", rmi: "2–3", quadrant: "Strong" },
  { name: "Anywhere365", slug: "anywhere365-acd", score: 3.0, tier: "Strong", segment: "Teams-centric CC", rl: 3, di: 3, lat: 3, qa: 3, fo: 2, obs: 2, ai: 2, int: 3, wem: 2, glo: 3, profile: "Deep Microsoft-centric routing/orchestration, dialogue-focused.", rmi: "2–3", quadrant: "Strong" },

  // ═══════════════════════════════════════
  // TIER 3 — MID-MARKET / FUNCTIONAL (2.7–2.9)
  // ═══════════════════════════════════════
  { name: "Intermedia CC", slug: "intermedia-acd", score: 2.9, tier: "Mid-Market", segment: "UC+CCaaS (SMB/mid)", rl: 3, di: 2, lat: 3, qa: 3, fo: 2, obs: 2, ai: 2, int: 3, wem: 3, glo: 3, profile: "CC module on UC stack with queue and skills routing.", rmi: "2–3", quadrant: "Mid" },
  { name: "Netcall", slug: "netcall-acd", score: 2.9, tier: "Mid-Market", segment: "CC + Low-code", rl: 3, di: 3, lat: 3, qa: 3, fo: 2, obs: 2, ai: 2, int: 3, wem: 3, glo: 3, profile: "CC with routing plus low-code workflow/orchestration.", rmi: "2–3", quadrant: "Mid" },
  { name: "Luware", slug: "luware-acd", score: 2.9, tier: "Mid-Market", segment: "Teams CC", rl: 3, di: 3, lat: 3, qa: 3, fo: 2, obs: 2, ai: 2, int: 3, wem: 3, glo: 3, profile: "Premium Teams CC with workflow/routing sophistication.", rmi: "2–3", quadrant: "Mid" },
  { name: "Nextiva CC", slug: "nextiva-acd", score: 2.9, tier: "Mid-Market", segment: "UC+CCaaS", rl: 3, di: 3, lat: 3, qa: 3, fo: 2, obs: 2, ai: 2, int: 3, wem: 3, glo: 3, profile: "Intelligent routing on top of UC+CC suite, mid-market focus.", rmi: "2–3", quadrant: "Mid" },
  { name: "Zendesk", slug: "zendesk-acd", score: 2.8, tier: "Mid-Market", segment: "CRM-native", rl: 2, di: 3, lat: 3, qa: 2, fo: 2, obs: 2, ai: 2, int: 4, wem: 2, glo: 3, profile: "Support platform with voice add-on, queue & agent routing.", rmi: "2–3", quadrant: "AI Heavy, Routing Light" },
  { name: "Dixa", slug: "dixa-acd", score: 2.8, tier: "Mid-Market", segment: "CX Platform", rl: 3, di: 3, lat: 3, qa: 2, fo: 2, obs: 2, ai: 2, int: 4, wem: 2, glo: 3, profile: "Omnichannel service with built-in call center and routing.", rmi: "2–3", quadrant: "AI Heavy, Routing Light" },
  { name: "Freshdesk CC", slug: "freshdesk-acd", score: 2.7, tier: "Mid-Market", segment: "CRM-native", rl: 2, di: 2, lat: 3, qa: 2, fo: 2, obs: 2, ai: 2, int: 3, wem: 2, glo: 2, profile: "CC module with routing for SMB/mid; ties to Freshdesk CRM.", rmi: "1–2", quadrant: "Basic ACD Territory" },
  { name: "ROGER365", slug: "roger365-acd", score: 2.7, tier: "Mid-Market", segment: "Teams CC", rl: 2, di: 2, lat: 3, qa: 2, fo: 2, obs: 2, ai: 2, int: 3, wem: 2, glo: 2, profile: "CC built around Teams with omnichannel routing.", rmi: "2–3", quadrant: "Mid" },
  { name: "Sikom", slug: "sikom-acd", score: 2.7, tier: "Mid-Market", segment: "CCaaS (Nordics)", rl: 2, di: 2, lat: 3, qa: 2, fo: 2, obs: 2, ai: 2, int: 3, wem: 2, glo: 2, profile: "Regional contact center with Teams integration and skills routing.", rmi: "2–3", quadrant: "Mid" },

  // ═══════════════════════════════════════
  // TIER 4 — BASIC ROUTING ENGINES (2.4–2.6)
  // ═══════════════════════════════════════
  { name: "IPDynamics", slug: "ipdynamics-acd", score: 2.6, tier: "Basic", segment: "CCaaS (DE)", rl: 2, di: 2, lat: 3, qa: 2, fo: 2, obs: 2, ai: 2, int: 3, wem: 2, glo: 2, profile: "Regional CCaaS with routing & Teams integration.", rmi: "2–3", quadrant: "Basic" },
  { name: "ContactCenter4All", slug: "cc4all-acd", score: 2.6, tier: "Basic", segment: "Teams CC", rl: 2, di: 2, lat: 3, qa: 2, fo: 2, obs: 2, ai: 2, int: 3, wem: 2, glo: 2, profile: "Microsoft-focused contact center with integrated routing.", rmi: "2–3", quadrant: "Basic" },
  { name: "Imagicle", slug: "imagicle-acd", score: 2.5, tier: "Basic", segment: "UC add-on CC", rl: 2, di: 2, lat: 2, qa: 2, fo: 2, obs: 2, ai: 1, int: 3, wem: 2, glo: 2, profile: "Adds call routing / contact center features on top of UC stacks.", rmi: "2–3", quadrant: "Basic" },
  { name: "Landis", slug: "landis-acd", score: 2.5, tier: "Basic", segment: "Teams CC", rl: 2, di: 2, lat: 2, qa: 2, fo: 2, obs: 2, ai: 1, int: 3, wem: 2, glo: 2, profile: "Native Teams contact center with queue and skills logic.", rmi: "2–3", quadrant: "Basic" },
  { name: "Aircall", slug: "aircall-acd", score: 2.5, tier: "Basic", segment: "SMB CCaaS", rl: 2, di: 2, lat: 2, qa: 2, fo: 2, obs: 1, ai: 1, int: 3, wem: 2, glo: 2, profile: "Cloud call center + CTI with basic ACD and good CRM integration.", rmi: "1–2", quadrant: "Basic ACD Territory" },
  { name: "Audiocodes", slug: "audiocodes-acd", score: 2.4, tier: "Basic", segment: "Voice/AI CC", rl: 2, di: 2, lat: 2, qa: 2, fo: 2, obs: 2, ai: 1, int: 3, wem: 2, glo: 2, profile: "Voice AI + contact center for Teams with skills and bot-based routing.", rmi: "2–3", quadrant: "Basic" },
  { name: "LiveAgent", slug: "liveagent-acd", score: 2.4, tier: "Basic", segment: "Helpdesk + CC", rl: 2, di: 2, lat: 2, qa: 2, fo: 2, obs: 1, ai: 1, int: 3, wem: 2, glo: 2, profile: "Helpdesk-first with built-in ACD, IVR, and call routing.", rmi: "1–2", quadrant: "Basic ACD Territory" },
  { name: "Convoso", slug: "convoso-acd", score: 2.4, tier: "Basic", segment: "Outbound CC", rl: 2, di: 2, lat: 2, qa: 2, fo: 2, obs: 1, ai: 1, int: 3, wem: 2, glo: 2, profile: "AI-powered outbound dialer + routing with heavy outbound bias.", rmi: "2–3", quadrant: "Basic ACD Territory" },
  { name: "TCN", slug: "tcn-acd", score: 2.4, tier: "Basic", segment: "Outbound/Blended CC", rl: 2, di: 2, lat: 2, qa: 2, fo: 2, obs: 1, ai: 1, int: 3, wem: 2, glo: 2, profile: "Cloud-based call center platform with strong outbound + compliance.", rmi: "2–3", quadrant: "Basic ACD Territory" },
  { name: "NUSO", slug: "nuso-acd", score: 2.4, tier: "Basic", segment: "UC+CC", rl: 2, di: 2, lat: 2, qa: 2, fo: 2, obs: 1, ai: 1, int: 3, wem: 2, glo: 2, profile: "Cloud communications with contact center/routing add-on.", rmi: "2–3", quadrant: "Basic ACD Territory" },

  // ═══════════════════════════════════════
  // TIER 5 — ENTRY-LEVEL (≤2.2)
  // ═══════════════════════════════════════
  { name: "VICIdial", slug: "vicidial-acd", score: 2.2, tier: "Entry", segment: "Open-source ACD", rl: 2, di: 1, lat: 2, qa: 2, fo: 2, obs: 1, ai: 1, int: 3, wem: 2, glo: 2, profile: "Open-source inbound/outbound ACD. Highly flexible but entirely DIY.", rmi: "1–2", quadrant: "Basic ACD Territory" },
];

export const getACDByTier = (tier) => acdVendors.filter(v => v.tier === tier);
export const getAllACD = () => acdVendors;

export const acdTierConfig = {
  "Elite": { color: "#10B981", range: "3.5–4.2", desc: "8–10 vendors that compete at real routing depth. These platforms can anchor enterprise-scale omnichannel routing with AI-enhanced decisioning, orchestration capabilities, and global scale." },
  "Strong": { color: "#0088DD", range: "3.0–3.4", desc: "Serviceable platforms with meaningful routing capability but ceiling-limited in specific dimensions. Strong in defined segments, uneven across the full spectrum." },
  "Mid-Market": { color: "#F59E0B", range: "2.7–2.9", desc: "Functional routing for mid-market operations. Adequate for defined use cases but lacking the depth, AI maturity, or scale for complex enterprise requirements." },
  "Basic": { color: "#EF4444", range: "2.4–2.6", desc: "Basic ACD logic with minimal futureproofing. These platforms run fundamental call routing but lack the architectural depth for modern orchestration." },
  "Entry": { color: "#7C3AED", range: "≤2.2", desc: "Entry-level or legacy platforms that cap out below serious operational routing maturity. DIY or open-source options for specific narrow use cases." },
};

export const acdDimensions = [
  { abbr: "RL", name: "Routing Logic", weight: "Core", desc: "Skills-based, intent-driven, policy-based, and orchestration-level routing maturity." },
  { abbr: "DI", name: "Data Inputs", weight: "Core", desc: "Ability to ingest CRM, CDP, behavioral, and real-time data to inform routing decisions." },
  { abbr: "LAT", name: "Latency Under Load", weight: "Core", desc: "Routing decision speed under production traffic volumes and spike conditions." },
  { abbr: "QA", name: "Queue Architecture", weight: "Core", desc: "Queue design, overflow logic, priority handling, and multi-queue coordination." },
  { abbr: "FO", name: "Failover / Redundancy", weight: "Operations", desc: "Geographic failover, disaster recovery, and routing continuity under outage conditions." },
  { abbr: "OBS", name: "Observability", weight: "Operations", desc: "Real-time routing visibility, decision logging, and diagnostic capabilities." },
  { abbr: "AI", name: "AI/LLM Routing", weight: "Intelligence", desc: "AI-enhanced routing decisions, intent-based distribution, and LLM-informed orchestration." },
  { abbr: "INT", name: "Integrations", weight: "Architecture", desc: "Pre-built and API-level integration with CRM, WEM, telephony, and data platforms." },
  { abbr: "WEM", name: "WEM Alignment", weight: "Architecture", desc: "Routing coordination with workforce management, schedule adherence, and capacity planning." },
  { abbr: "GLO", name: "Global Scale", weight: "Architecture", desc: "Multi-region routing, data residency support, and global traffic distribution." },
];

export const acdQuadrants = [
  { name: "True Orchestrator", position: "High Routing + High AI", vendors: ["Genesys", "NICE", "Amazon Connect", "Five9", "Talkdesk", "UJET", "Content Guru"], desc: "Deep routing foundation with meaningful AI-enhanced decisioning. These vendors can support intent-driven and policy-based routing at enterprise scale." },
  { name: "AI Heavy, Routing Light", position: "High AI + Low Routing Depth", vendors: ["Zendesk", "Dixa", "Kore.ai", "Freshdesk"], desc: "Strong AI capabilities layered on thinner routing infrastructure. The AI is real, but the underlying ACD architecture limits complexity." },
  { name: "Strong Routing, Low AI", position: "High Routing + Low AI", vendors: ["Cisco", "Avaya", "Alvaria", "Mitel", "Netcall", "Puzzel"], desc: "Mature routing engines with deep queue and skills logic, but AI-enhanced decisioning is lagging. Strong operational foundation, weaker innovation trajectory." },
  { name: "Basic ACD Territory", position: "Low Routing + Low AI", vendors: ["Vonage", "Aircall", "LiveAgent", "Convoso", "TCN", "NUSO"], desc: "Fundamental call routing with minimal AI or orchestration capability. Adequate for simple operations, ceiling-limited for anything beyond basic ACD." },
];
