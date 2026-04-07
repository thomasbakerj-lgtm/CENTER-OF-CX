// Digital Engagement Market Intelligence — sourced from New_Digital_Engagement_Matrices_New.xlsx
// 50 vendors | 8 scoring dimensions (1-5) | Weighted total out of ~100
// Segments: Leader, Strong, Mid, Niche, SMB

export const deVendors = [
  // ═══ LEADERS (85–100) ═══
  { name: "NICE·Cognigy", slug: "nice-cognigy-de", score: 94, tier: "Leader", ch: 5, ai: 5, desk: 4, orch: 5, intg: 5, anl: 5, ent: 5, cost: 3, archetype: "CCaaS Native with Digital", strength: "Best AI orchestration + CCaaS ecosystem", weakness: "Requires NICE stack for full value" },
  { name: "Sprinklr Service", slug: "sprinklr-de", score: 90, tier: "Leader", ch: 5, ai: 4, desk: 4, orch: 4, intg: 5, anl: 5, ent: 5, cost: 3, archetype: "Digital Engagement Suite", strength: "#1 social + digital care suite", weakness: "Heavy, complex, expensive" },
  { name: "Ada", slug: "ada-de", score: 88, tier: "Leader", ch: 5, ai: 5, desk: 3, orch: 4, intg: 4, anl: 4, ent: 5, cost: 4, archetype: "AI Automation Layer", strength: "AI-native automation + top deflection", weakness: "Not an agent desktop" },
  { name: "Intercom", slug: "intercom-de", score: 86, tier: "Leader", ch: 4, ai: 4, desk: 5, orch: 4, intg: 4, anl: 4, ent: 4, cost: 4, archetype: "Helpdesk / Support Suite", strength: "Best agent UX + in-app messaging", weakness: "Weak in social + telephony" },
  { name: "Salesforce Digital Engagement", slug: "salesforce-de", score: 86, tier: "Leader", ch: 5, ai: 4, desk: 4, orch: 4, intg: 5, anl: 4, ent: 5, cost: 3, archetype: "CRM / Service Platform", strength: "Unified CRM + channels + automation", weakness: "Dependent on SFDC ecosystem" },
  { name: "Zendesk Messaging", slug: "zendesk-de", score: 85, tier: "Leader", ch: 4, ai: 4, desk: 5, orch: 4, intg: 5, anl: 4, ent: 4, cost: 4, archetype: "Helpdesk / Support Suite", strength: "Scalable messaging + workflows", weakness: "Legacy email-first architecture limits depth" },
  { name: "Infobip Conversations", slug: "infobip-de", score: 85, tier: "Leader", ch: 5, ai: 4, desk: 3, orch: 4, intg: 5, anl: 4, ent: 5, cost: 4, archetype: "CPaaS Plus / Messaging", strength: "Global messaging + WhatsApp scale", weakness: "More infra-led than engagement-led" },
  { name: "Sinch Engage", slug: "sinch-de", score: 84, tier: "Leader", ch: 5, ai: 4, desk: 3, orch: 4, intg: 5, anl: 4, ent: 4, cost: 4, archetype: "CPaaS Plus / Messaging", strength: "Messaging + templates + global reach", weakness: "Needs orchestration partner" },
  { name: "MessageBird Inbox", slug: "messagebird-de", score: 82, tier: "Leader", ch: 5, ai: 3, desk: 3, orch: 4, intg: 4, anl: 4, ent: 4, cost: 4, archetype: "CPaaS Plus / Messaging", strength: "Global messaging + omni-routing", weakness: "Agent experience maturing" },
  { name: "Khoros", slug: "khoros-de", score: 82, tier: "Leader", ch: 5, ai: 3, desk: 4, orch: 3, intg: 4, anl: 5, ent: 5, cost: 3, archetype: "Social Care Suite", strength: "Social + community + digital engagement", weakness: "Heavy platform; slower to evolve" },

  // ═══ STRONG (74–84) ═══
  { name: "Verint Digital-First", slug: "verint-de", score: 80, tier: "Strong", ch: 4, ai: 3, desk: 3, orch: 4, intg: 5, anl: 5, ent: 5, cost: 3, archetype: "CCaaS Native with Digital", strength: "WEM + analytics + digital", weakness: "Best used inside Verint ecosystem" },
  { name: "Gladly", slug: "gladly-de", score: 78, tier: "Strong", ch: 4, ai: 3, desk: 5, orch: 3, intg: 4, anl: 4, ent: 4, cost: 3, archetype: "Helpdesk / Support Suite", strength: "Customer timeline; elite UX", weakness: "Weak WEM/QA; light orchestration" },
  { name: "LivePerson", slug: "liveperson-de", score: 78, tier: "Strong", ch: 5, ai: 4, desk: 3, orch: 4, intg: 4, anl: 4, ent: 4, cost: 2, archetype: "Digital Engagement Suite", strength: "Conversational commerce + AI", weakness: "Execution inconsistency" },
  { name: "eGain", slug: "egain-de", score: 78, tier: "Strong", ch: 4, ai: 3, desk: 3, orch: 3, intg: 4, anl: 5, ent: 5, cost: 4, archetype: "CRM / Service Platform", strength: "Knowledge + chat", weakness: "Legacy UI/UX" },
  { name: "Freshchat (Mid)", slug: "freshchat-de", score: 78, tier: "Strong", ch: 4, ai: 4, desk: 4, orch: 3, intg: 4, anl: 3, ent: 4, cost: 4, archetype: "Helpdesk / Support Suite", strength: "Modern messaging + automation", weakness: "Limited enterprise scale" },
  { name: "RingCentral Engage Digital", slug: "ringcentral-de", score: 77, tier: "Strong", ch: 4, ai: 3, desk: 3, orch: 3, intg: 4, anl: 4, ent: 5, cost: 4, archetype: "CCaaS Native with Digital", strength: "Digital channels in CCaaS", weakness: "Voice-first ecosystem" },
  { name: "Respond.io", slug: "respondio-de", score: 76, tier: "Strong", ch: 5, ai: 3, desk: 3, orch: 3, intg: 4, anl: 3, ent: 4, cost: 4, archetype: "CPaaS Plus / Messaging", strength: "Multi-channel messaging hub", weakness: "Limited analytics + agent tools" },
  { name: "Teneo.ai", slug: "teneo-de", score: 76, tier: "Strong", ch: 3, ai: 5, desk: 2, orch: 4, intg: 4, anl: 4, ent: 4, cost: 3, archetype: "AI Automation Layer", strength: "Deep NLU + automation", weakness: "Limited engagement platform breadth" },
  { name: "HubSpot Service Hub", slug: "hubspot-de", score: 74, tier: "Strong", ch: 4, ai: 3, desk: 4, orch: 3, intg: 4, anl: 3, ent: 3, cost: 5, archetype: "CRM / Service Platform", strength: "Unified CRM + digital", weakness: "Limited high-volume CX depth" },
  { name: "Quiq", slug: "quiq-de", score: 74, tier: "Strong", ch: 4, ai: 3, desk: 3, orch: 3, intg: 4, anl: 3, ent: 4, cost: 4, archetype: "Digital Engagement Suite", strength: "Async messaging focus", weakness: "Mid-market scope" },

  // ═══ MID-MARKET (59–73) ═══
  { name: "Gupshup (Enterprise)", slug: "gupshup-de", score: 72, tier: "Mid", ch: 5, ai: 4, desk: 2, orch: 3, intg: 4, anl: 3, ent: 3, cost: 4, archetype: "CPaaS Plus / Messaging", strength: "WhatsApp automation + AI", weakness: "Weak agent desktop" },
  { name: "Verloop.io (Enterprise)", slug: "verloop-de", score: 71, tier: "Mid", ch: 4, ai: 4, desk: 2, orch: 3, intg: 3, anl: 3, ent: 3, cost: 4, archetype: "AI Automation Layer", strength: "AI-first automation", weakness: "Limited reporting + workflows" },
  { name: "Haptik", slug: "haptik-de", score: 70, tier: "Mid", ch: 4, ai: 4, desk: 2, orch: 3, intg: 3, anl: 3, ent: 3, cost: 4, archetype: "AI Automation Layer", strength: "APAC AI + messaging", weakness: "Regional ecosystem" },
  { name: "Comm100 (Enterprise)", slug: "comm100-de", score: 70, tier: "Mid", ch: 4, ai: 2, desk: 3, orch: 2, intg: 4, anl: 3, ent: 4, cost: 4, archetype: "Digital Engagement Suite", strength: "Reliable enterprise chat", weakness: "AI depth lagging" },
  { name: "Netomi", slug: "netomi-de", score: 68, tier: "Mid", ch: 2, ai: 5, desk: 2, orch: 3, intg: 3, anl: 4, ent: 3, cost: 4, archetype: "AI Automation Layer", strength: "Strong AI for email + chat", weakness: "Narrow channel set" },
  { name: "Pypestream", slug: "pypestream-de", score: 67, tier: "Mid", ch: 2, ai: 4, desk: 2, orch: 4, intg: 3, anl: 4, ent: 3, cost: 3, archetype: "AI Automation Layer", strength: "Structured microapp automation", weakness: "Niche UX; limited channel breadth" },
  { name: "Gorgias", slug: "gorgias-de", score: 64, tier: "Niche", ch: 4, ai: 2, desk: 4, orch: 2, intg: 4, anl: 3, ent: 2, cost: 5, archetype: "Helpdesk / Support Suite", strength: "Best ecommerce support suite", weakness: "Only relevant for retail" },
  { name: "Acquire.io (Mid)", slug: "acquireio-de", score: 63, tier: "Mid", ch: 4, ai: 2, desk: 3, orch: 2, intg: 3, anl: 2, ent: 3, cost: 4, archetype: "Digital Engagement Suite", strength: "Cobrowse + chat + video", weakness: "Limited enterprise scale" },
  { name: "Emplifi", slug: "emplifi-de", score: 61, tier: "Mid", ch: 3, ai: 2, desk: 3, orch: 2, intg: 3, anl: 4, ent: 3, cost: 4, archetype: "Social Care Suite", strength: "Social + CX + commerce", weakness: "Care module limited" },
  { name: "Reputation", slug: "reputation-de", score: 60, tier: "Mid", ch: 3, ai: 2, desk: 2, orch: 2, intg: 3, anl: 4, ent: 3, cost: 4, archetype: "Social Care Suite", strength: "Monitoring + response", weakness: "Limited CX capabilities" },
  { name: "Kustomer", slug: "kustomer-de", score: 59, tier: "Mid", ch: 3, ai: 2, desk: 3, orch: 2, intg: 3, anl: 3, ent: 2, cost: 4, archetype: "Helpdesk / Support Suite", strength: "CRM-style digital support", weakness: "Roadmap uncertainty" },
  { name: "Zenvia", slug: "zenvia-de", score: 59, tier: "Mid", ch: 4, ai: 2, desk: 2, orch: 2, intg: 3, anl: 2, ent: 3, cost: 4, archetype: "CPaaS Plus / Messaging", strength: "LATAM messaging", weakness: "Regional-only strength" },
  { name: "Clickatell Touch", slug: "clickatell-de", score: 59, tier: "Mid", ch: 4, ai: 2, desk: 2, orch: 2, intg: 3, anl: 2, ent: 3, cost: 4, archetype: "CPaaS Plus / Messaging", strength: "Mobile-first + WhatsApp", weakness: "Weak workflow + desktop" },

  // ═══ NICHE / SMB (below 59) ═══
  { name: "Drift", slug: "drift-de", score: 56, tier: "SMB", ch: 3, ai: 2, desk: 3, orch: 2, intg: 3, anl: 2, ent: 2, cost: 4, archetype: "Revenue Conversation", strength: "Revenue chat + GTM use cases", weakness: "Not a CX tool" },
  { name: "Sprout Social Care", slug: "sprout-de", score: 54, tier: "Niche", ch: 2, ai: 1, desk: 2, orch: 1, intg: 3, anl: 4, ent: 3, cost: 4, archetype: "Social Care Suite", strength: "Social response workflows", weakness: "No digital care depth" },
  { name: "Front", slug: "front-de", score: 54, tier: "SMB", ch: 3, ai: 1, desk: 4, orch: 1, intg: 3, anl: 2, ent: 2, cost: 4, archetype: "Collaborative Inbox", strength: "Shared inbox + messaging", weakness: "Not contact-center grade" },
  { name: "Birdeye", slug: "birdeye-de", score: 53, tier: "SMB", ch: 3, ai: 2, desk: 2, orch: 1, intg: 3, anl: 3, ent: 2, cost: 4, archetype: "Social Care Suite", strength: "Reputation + messaging", weakness: "SMB only" },
  { name: "Comm100 (Legacy)", slug: "comm100legacy-de", score: 52, tier: "Niche", ch: 3, ai: 1, desk: 2, orch: 1, intg: 3, anl: 2, ent: 3, cost: 5, archetype: "Digital Engagement Suite", strength: "Reliable legacy chat", weakness: "Outdated architecture" },
  { name: "Clickatell (Platform)", slug: "clickatell-plat-de", score: 52, tier: "Niche", ch: 4, ai: 2, desk: 1, orch: 1, intg: 3, anl: 1, ent: 3, cost: 4, archetype: "CPaaS Plus / Messaging", strength: "Regional messaging pipes", weakness: "Limited CX capability" },
  { name: "Emplifi (care-light)", slug: "emplifi-light-de", score: 51, tier: "SMB", ch: 3, ai: 1, desk: 2, orch: 1, intg: 3, anl: 3, ent: 2, cost: 4, archetype: "Social Care Suite", strength: "Social + light CX", weakness: "Insufficient for CC operations" },
  { name: "Tidio", slug: "tidio-de", score: 50, tier: "SMB", ch: 3, ai: 2, desk: 2, orch: 1, intg: 2, anl: 2, ent: 1, cost: 5, archetype: "SMB Chatbot", strength: "Simple bots + low cost", weakness: "No orchestration" },
  { name: "Help Scout", slug: "helpscout-de", score: 50, tier: "SMB", ch: 3, ai: 1, desk: 3, orch: 1, intg: 2, anl: 2, ent: 2, cost: 5, archetype: "Helpdesk / Support Suite", strength: "Clean helpdesk", weakness: "No omni/messaging depth" },
  { name: "Hootsuite Social Care", slug: "hootsuite-de", score: 50, tier: "Niche", ch: 2, ai: 1, desk: 2, orch: 1, intg: 3, anl: 3, ent: 3, cost: 4, archetype: "Social Care Suite", strength: "Social monitoring", weakness: "Not built for CX operations" },
  { name: "Podium", slug: "podium-de", score: 48, tier: "SMB", ch: 3, ai: 1, desk: 2, orch: 1, intg: 2, anl: 2, ent: 2, cost: 5, archetype: "Local Business Messaging", strength: "Texting + local business reviews", weakness: "Not CX-grade" },
  { name: "LiveChat Inc.", slug: "livechat-de", score: 48, tier: "SMB", ch: 3, ai: 1, desk: 2, orch: 1, intg: 2, anl: 2, ent: 2, cost: 5, archetype: "SMB Chat", strength: "Simple chat", weakness: "No multi-channel depth" },
  { name: "360Dialog", slug: "360dialog-de", score: 45, tier: "Niche", ch: 2, ai: 1, desk: 1, orch: 1, intg: 2, anl: 1, ent: 3, cost: 5, archetype: "WhatsApp Infrastructure", strength: "WhatsApp infra partner", weakness: "Not a digital engagement platform" },
];

export const getAllDE = () => deVendors;

export const deTierConfig = {
  "Leader": { color: "#10B981", range: "82–94", desc: "Full orchestration, deep AI, multi-channel mastery, and enterprise scale. These platforms can anchor serious digital engagement programs." },
  "Strong": { color: "#0088DD", range: "74–80", desc: "Meaningful capability with clear strengths but uneven depth across all dimensions. Strong in defined motions." },
  "Mid": { color: "#F59E0B", range: "59–72", desc: "Functional for defined use cases but lacking the breadth or depth for enterprise digital operations." },
  "Niche": { color: "#EF4444", range: "52–64", desc: "Vertical specialists, social-only tools, or legacy platforms. Useful in narrow lanes." },
  "SMB": { color: "#7C3AED", range: "45–56", desc: "Lightweight tools for small teams. Simple onboarding, limited orchestration, minimal enterprise relevance." },
};

export const deDimensions = [
  { abbr: "CH", name: "Channel Breadth & Depth", desc: "Coverage across chat, SMS, WhatsApp, social, email, in-app, and voice — plus depth in each." },
  { abbr: "AI", name: "AI & Automation", desc: "Bot sophistication, intent models, generative AI, knowledge retrieval, and containment quality." },
  { abbr: "DSK", name: "Agent Desktop", desc: "Unified inbox, collaboration, macros, timeline view, and blended digital work execution." },
  { abbr: "ORC", name: "Orchestration", desc: "Routing, prioritization, SLA management, queue balancing, and work assignment across digital contacts." },
  { abbr: "INT", name: "Integrations", desc: "CRM, WEM, telephony, knowledge, identity, and data platform connectivity." },
  { abbr: "ANL", name: "Analytics", desc: "Reporting, backlog visibility, resolution metrics, QA support, and conversation intelligence." },
  { abbr: "ENT", name: "Enterprise Readiness", desc: "Security, compliance, governance, admin controls, scalability, and multi-region support." },
  { abbr: "CST", name: "Cost Model", desc: "Pricing accessibility, TCO predictability, and value relative to capability delivered." },
];
