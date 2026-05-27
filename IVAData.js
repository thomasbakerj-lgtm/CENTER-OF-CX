// IVA + Conversational AI Intelligence — Phase 1 + Phase 2 Combined
// 7 market categories | 58 vendors scored | 16 use case fit matrix | 100-point scoring model
// Sources: Phase 1 Market Framework + Phase 2 Sprint 1-7 Research

// ═══════════════════════════════════════════════════════
// MARKET TAXONOMY
// ═══════════════════════════════════════════════════════

export const IVA_CATEGORIES = [
  { id: "enterprise", name: "Enterprise IVA / Agentic CX", desc: "Broad conversational automation across customer service, employee service, voice, chat, messaging, knowledge, and workflows.", color: "#0088DD", vendorCount: 23 },
  { id: "voice", name: "Voice-Native IVA", desc: "Real-time voice automation, IVR modernization, and call containment. Evaluated on latency, turn-taking, ASR accuracy, and telephony integration.", color: "#7C3AED", vendorCount: 12 },
  { id: "helpdesk", name: "Helpdesk-Native AI Agents", desc: "AI embedded inside support/helpdesk platforms. Strongest when the buyer already uses or will adopt the helpdesk.", color: "#10B981", vendorCount: 8 },
  { id: "crm-workflow", name: "CRM / Workflow-Native AI", desc: "AI anchored inside CRM, ITSM, employee service, or enterprise workflow systems.", color: "#F59E0B", vendorCount: 6 },
  { id: "ccaas-native", name: "CCaaS-Native Automation", desc: "Embedded in or tightly integrated into contact center platforms. Strongest when routing, reporting, and agent handoff matter most.", color: "#EF4444", vendorCount: 11 },
  { id: "agent-assist", name: "Agent Assist / QA / Copilot", desc: "Improves live-agent performance through coaching, QA, summarization, guidance, and compliance analytics.", color: "#0099CC", vendorCount: 8 },
  { id: "ecommerce", name: "Ecommerce-Native CX AI", desc: "Purpose-built for Shopify, DTC, and ecommerce customer service and revenue support.", color: "#EC4899", vendorCount: 8 },
];

// ═══════════════════════════════════════════════════════
// SCORING MODEL
// ═══════════════════════════════════════════════════════

export const SCORING_MODEL = [
  { name: "Use-Case + Market Fit", weight: 10 },
  { name: "Conversation Quality", weight: 15 },
  { name: "Voice + Channel Execution", weight: 10 },
  { name: "Orchestration + Integrations", weight: 15 },
  { name: "AI Architecture + Governance", weight: 15 },
  { name: "Operational Analytics", weight: 10 },
  { name: "Admin + Lifecycle", weight: 8 },
  { name: "Security + Compliance", weight: 7 },
  { name: "Commercial Model + TCO", weight: 5 },
  { name: "Evidence Strength", weight: 5 },
];

// ═══════════════════════════════════════════════════════
// USE CASE DEFINITIONS
// ═══════════════════════════════════════════════════════

export const USE_CASES = [
  { id: "omnichannel", name: "Enterprise Omnichannel IVA", desc: "Broad voice + digital automation across channels" },
  { id: "voice", name: "Enterprise Voice IVA", desc: "Real-time voice automation and IVR modernization" },
  { id: "digital", name: "Digital Self-Service", desc: "Chat, messaging, web, and mobile automation" },
  { id: "helpdesk", name: "Helpdesk-Native AI Agent", desc: "AI embedded in support/helpdesk platform" },
  { id: "salesforce", name: "Salesforce-Heavy Service Org", desc: "CRM-integrated service automation" },
  { id: "servicenow", name: "ServiceNow-Heavy Workflow", desc: "ITSM and enterprise workflow automation" },
  { id: "ecommerce", name: "Ecommerce CX", desc: "Shopify/DTC customer service and sales" },
  { id: "financial", name: "Regulated Financial Services", desc: "Compliance-heavy BFSI automation" },
  { id: "healthcare", name: "Healthcare Access Center", desc: "HIPAA, EHR, scheduling, and referral management" },
  { id: "publicsector", name: "Public Sector", desc: "Government, FedRAMP, accessibility, procurement" },
  { id: "bpo", name: "BPO Multi-Client", desc: "Multi-tenant, client-specific reporting, margin" },
  { id: "agentassist", name: "Agent Assist / Coaching", desc: "Real-time guidance and performance improvement" },
  { id: "qa", name: "QA Automation", desc: "Quality management and compliance scoring" },
  { id: "developer", name: "Developer-Led Custom Build", desc: "API-first, maximum engineering control" },
  { id: "employee", name: "Employee Service / IT / HR", desc: "Internal service desk and workflow automation" },
  { id: "ccaas", name: "CCaaS-Native Automation", desc: "Contact center platform-native AI" },
];

// ═══════════════════════════════════════════════════════
// VENDOR DATA
// ═══════════════════════════════════════════════════════

export const ivaVendors = {

  // ─── STANDALONE ENTERPRISE IVA / AGENTIC CX ─────────

  "kore-ai": {
    name: "Kore.ai", slug: "kore-ai", category: "enterprise",
    product: 87, enterprise: 86, bpo: 84, confidence: 4.0,
    modality: "Voice & Digital", origin: "Proprietary NLP",
    summary: "Broadest enterprise IVA / agentic CX density. Deep orchestration with low-code builder across voice, digital, CRM, knowledge, and workflows.",
    differentiator: "Deep orchestration + low-code builder",
    verticals: "BFSI, Healthcare, Retail, Public Sector",
    bestUseCase: "Enterprise service automation",
    useCaseFit: { omnichannel: 5, voice: 4, digital: 5, helpdesk: 3, salesforce: 5, servicenow: 3, ecommerce: 4, financial: 5, healthcare: 5, publicsector: 4, bpo: 5, agentassist: 3, qa: 3, developer: 4, employee: 3, ccaas: 4 },
  },

  "nice-cognigy": {
    name: "NICE Cognigy", slug: "nice-cognigy", category: "enterprise",
    product: 86, enterprise: 87, bpo: 86, confidence: 4.0,
    modality: "Voice & Digital", origin: "Proprietary + OpenAI",
    summary: "Strongest contact-center-aligned density. Enterprise conversational and agentic AI now under NICE following September 2025 acquisition.",
    differentiator: "Enterprise orchestration + CCaaS alignment",
    verticals: "Regulated enterprise, BPO, contact center operations",
    bestUseCase: "Enterprise + BPO contact center AI",
    useCaseFit: { omnichannel: 5, voice: 5, digital: 4, helpdesk: 3, salesforce: 4, servicenow: 3, ecommerce: 3, financial: 5, healthcare: 5, publicsector: 4, bpo: 5, agentassist: 4, qa: 4, developer: 3, employee: 3, ccaas: 5 },
  },

  "omilia": {
    name: "Omilia", slug: "omilia", category: "enterprise",
    product: 84, enterprise: 83, bpo: 80, confidence: 4.0,
    modality: "Voice & Digital", origin: "Proprietary",
    summary: "Strong voice/regulated/healthcare density. Named Leader in Forrester 2026 Wave for Conversational AI Platforms for Customer Service.",
    differentiator: "Voice-native with deep regulated-market proof",
    verticals: "BFSI, Healthcare, Insurance, Telecom",
    bestUseCase: "Voice-first regulated enterprise",
    useCaseFit: { omnichannel: 4, voice: 5, digital: 3, helpdesk: 2, salesforce: 3, servicenow: 2, ecommerce: 2, financial: 5, healthcare: 5, publicsector: 4, bpo: 4, agentassist: 3, qa: 4, developer: 3, employee: 1, ccaas: 4 },
  },

  "ada": {
    name: "Ada", slug: "ada", category: "enterprise",
    product: 83, enterprise: 81, bpo: 75, confidence: 3.8,
    modality: "Voice & Digital", origin: "LLM + Proprietary",
    summary: "Strong digital and customer-service-agent density. AI customer service agent platform with omnichannel deployment and enterprise workflows.",
    differentiator: "AI customer service agents + enterprise workflows",
    verticals: "Cross-industry, ecommerce, SaaS, digital-first",
    bestUseCase: "Digital self-service and ecommerce CX",
    useCaseFit: { omnichannel: 5, voice: 3, digital: 5, helpdesk: 4, salesforce: 4, servicenow: 3, ecommerce: 5, financial: 3, healthcare: 3, publicsector: 3, bpo: 3, agentassist: 2, qa: 2, developer: 2, employee: 3, ccaas: 3 },
  },

  "boost-ai": {
    name: "boost.ai", slug: "boost-ai", category: "enterprise",
    product: 82, enterprise: 82, bpo: 78, confidence: 4.0,
    modality: "Digital-first", origin: "Proprietary",
    summary: "Strong regulated-market conversational AI positioning. Scalable with intent analytics and governance depth for banking and public sector.",
    differentiator: "Regulated-market governance + intent analytics",
    verticals: "Banking, Public Sector, Insurance",
    bestUseCase: "Regulated digital self-service",
    useCaseFit: { omnichannel: 4, voice: 3, digital: 5, helpdesk: 3, salesforce: 3, servicenow: 3, ecommerce: 3, financial: 5, healthcare: 3, publicsector: 5, bpo: 4, agentassist: 2, qa: 2, developer: 2, employee: 3, ccaas: 3 },
  },

  "google-dialogflow": {
    name: "Google Dialogflow CX", slug: "google-dialogflow", category: "enterprise",
    product: 82, enterprise: 79, bpo: 79, confidence: 3.9,
    modality: "Voice & Digital", origin: "Google Cloud NLP",
    summary: "Hyperscaler conversational AI platform with strong NLU, global reach, and developer-led extensibility.",
    differentiator: "Strong NLU + global reach + developer control",
    verticals: "Cross-industry, developer-led enterprise",
    bestUseCase: "Developer-led enterprise IVA",
    useCaseFit: { omnichannel: 4, voice: 4, digital: 4, helpdesk: 3, salesforce: 4, servicenow: 3, ecommerce: 3, financial: 4, healthcare: 4, publicsector: 4, bpo: 4, agentassist: 2, qa: 2, developer: 5, employee: 3, ccaas: 3 },
  },

  "microsoft-copilot": {
    name: "Microsoft Copilot Studio", slug: "microsoft-copilot", category: "enterprise",
    product: 81, enterprise: 82, bpo: 78, confidence: 4.0,
    modality: "Voice & Digital", origin: "Azure AI + GPT",
    summary: "Strong Microsoft/workflow/developer/public-sector density. Enterprise LLM orchestration with Teams and Dynamics integration.",
    differentiator: "Enterprise LLM orchestration + Microsoft ecosystem",
    verticals: "Public sector, Microsoft-heavy enterprise, IT/HR",
    bestUseCase: "Microsoft-native enterprise AI",
    useCaseFit: { omnichannel: 4, voice: 3, digital: 4, helpdesk: 4, salesforce: 4, servicenow: 4, ecommerce: 3, financial: 4, healthcare: 4, publicsector: 5, bpo: 4, agentassist: 3, qa: 3, developer: 5, employee: 5, ccaas: 3 },
  },

  "amazon-lex": {
    name: "Amazon Lex / Connect AI", slug: "amazon-lex", category: "enterprise",
    product: 80, enterprise: 79, bpo: 78, confidence: 4.0,
    modality: "Voice & Digital", origin: "AWS",
    summary: "AWS-native conversational AI and CCaaS automation. Developer-friendly with consumption pricing and infinite scalability.",
    differentiator: "AWS integration + consumption pricing + scalability",
    verticals: "Cross-industry, technology-forward, AWS shops",
    bestUseCase: "Amazon Connect + builder-led automation",
    useCaseFit: { omnichannel: 3, voice: 4, digital: 3, helpdesk: 2, salesforce: 2, servicenow: 2, ecommerce: 2, financial: 4, healthcare: 4, publicsector: 4, bpo: 4, agentassist: 3, qa: 3, developer: 5, employee: 3, ccaas: 5 },
  },

  "ibm-watsonx": {
    name: "IBM watsonx Assistant", slug: "ibm-watsonx", category: "enterprise",
    product: 80, enterprise: 82, bpo: 77, confidence: 4.0,
    modality: "Voice & Digital", origin: "IBM watsonx + LLM",
    summary: "Strong regulated/governance/developer density. Enterprise CAIP with governance emphasis and robust analytics.",
    differentiator: "Governance depth + enterprise compliance",
    verticals: "Regulated enterprise, public sector, BFSI",
    bestUseCase: "Regulated enterprise with governance emphasis",
    useCaseFit: { omnichannel: 4, voice: 3, digital: 4, helpdesk: 3, salesforce: 3, servicenow: 4, ecommerce: 2, financial: 5, healthcare: 4, publicsector: 5, bpo: 4, agentassist: 3, qa: 4, developer: 5, employee: 5, ccaas: 3 },
  },

  "teneo-ai": {
    name: "Teneo.ai", slug: "teneo-ai", category: "enterprise",
    product: 80, enterprise: 78, bpo: 76, confidence: 3.8,
    modality: "Voice & Digital", origin: "Proprietary",
    summary: "Linguistic NLU expertise with strong enterprise CX positioning. Deep conversation design for complex regulated environments.",
    differentiator: "Linguistic NLU + enterprise conversation design",
    verticals: "BFSI, Telecom, Enterprise CX",
    bestUseCase: "Complex regulated conversation automation",
    useCaseFit: { omnichannel: 4, voice: 4, digital: 4, helpdesk: 3, salesforce: 4, servicenow: 3, ecommerce: 3, financial: 5, healthcare: 4, publicsector: 4, bpo: 4, agentassist: 3, qa: 4, developer: 4, employee: 3, ccaas: 4 },
  },

  "sierra": {
    name: "Sierra", slug: "sierra", category: "enterprise",
    product: 80, enterprise: 76, bpo: 70, confidence: 3.2,
    modality: "Voice & Digital", origin: "LLM-native",
    summary: "Enterprise CX AI agent platform building across chat, SMS, WhatsApp, email, voice, and ChatGPT-style channels.",
    differentiator: "Modern AI-agent architecture for enterprise CX",
    verticals: "Cross-industry, digital-first enterprise",
    bestUseCase: "Modern enterprise AI agent deployment",
    useCaseFit: { omnichannel: 4, voice: 3, digital: 4, helpdesk: 4, salesforce: 4, servicenow: 3, ecommerce: 4, financial: 3, healthcare: 3, publicsector: 2, bpo: 2, agentassist: 3, qa: 2, developer: 3, employee: 3, ccaas: 2 },
  },

  "sprinklr": {
    name: "Sprinklr", slug: "sprinklr", category: "enterprise",
    product: 79, enterprise: 80, bpo: 73, confidence: 3.9,
    modality: "Voice & Digital", origin: "Proprietary + LLM",
    summary: "Strong digital service and social engagement capabilities. Unified platform spanning marketing, service, and engagement.",
    differentiator: "Unified CX platform + social + digital",
    verticals: "Global brands, digital service, social CX",
    bestUseCase: "Digital + social service for global brands",
    useCaseFit: { omnichannel: 4, voice: 3, digital: 5, helpdesk: 3, salesforce: 4, servicenow: 3, ecommerce: 4, financial: 3, healthcare: 2, publicsector: 3, bpo: 3, agentassist: 4, qa: 4, developer: 3, employee: 3, ccaas: 3 },
  },

  "yellow-ai": {
    name: "Yellow.ai", slug: "yellow-ai", category: "enterprise",
    product: 79, enterprise: 77, bpo: 75, confidence: 3.5,
    modality: "Voice & Digital", origin: "Hybrid AI",
    summary: "Enterprise CX/EX automation platform with global multilingual automation capabilities.",
    differentiator: "Global multilingual automation + CX/EX",
    verticals: "BFSI, eCommerce, Enterprise",
    bestUseCase: "Multilingual enterprise automation",
    useCaseFit: { omnichannel: 4, voice: 4, digital: 5, helpdesk: 3, salesforce: 4, servicenow: 3, ecommerce: 4, financial: 3, healthcare: 3, publicsector: 3, bpo: 3, agentassist: 3, qa: 2, developer: 3, employee: 4, ccaas: 3 },
  },

  "uniphore": {
    name: "Uniphore", slug: "uniphore", category: "enterprise",
    product: 79, enterprise: 78, bpo: 79, confidence: 3.6,
    modality: "Voice & Digital", origin: "Proprietary",
    summary: "Conversation intelligence and automation with strong agent assist, QA, and BPO positioning.",
    differentiator: "Conversation intelligence + agent assist blend",
    verticals: "BPO, Financial Services, Healthcare",
    bestUseCase: "Agent assist + QA + conversation intelligence",
    useCaseFit: { omnichannel: 4, voice: 4, digital: 3, helpdesk: 3, salesforce: 3, servicenow: 3, ecommerce: 2, financial: 4, healthcare: 4, publicsector: 3, bpo: 4, agentassist: 5, qa: 5, developer: 3, employee: 3, ccaas: 4 },
  },

  "decagon": {
    name: "Decagon", slug: "decagon", category: "enterprise",
    product: 78, enterprise: 75, bpo: 70, confidence: 3.2,
    modality: "Digital", origin: "LLM-native",
    summary: "AI customer support agent platform. Modern architecture with strong ecommerce and helpdesk positioning.",
    differentiator: "Modern AI agent for customer support",
    verticals: "SaaS, eCommerce, digital-first",
    bestUseCase: "Digital customer support automation",
    useCaseFit: { omnichannel: 4, voice: 3, digital: 4, helpdesk: 4, salesforce: 4, servicenow: 3, ecommerce: 4, financial: 3, healthcare: 3, publicsector: 2, bpo: 2, agentassist: 2, qa: 2, developer: 3, employee: 2, ccaas: 2 },
  },

  "amelia-soundhound": {
    name: "Amelia / SoundHound", slug: "amelia-soundhound", category: "enterprise",
    product: 78, enterprise: 76, bpo: 74, confidence: 3.5,
    modality: "Voice & Digital", origin: "Proprietary",
    summary: "Enterprise conversational AI and voice AI. Human-like conversation with process automation for banking, insurance, and healthcare.",
    differentiator: "Human-like conversation + process automation",
    verticals: "Banking, Insurance, Healthcare, Telecom",
    bestUseCase: "Enterprise voice + process automation",
    useCaseFit: { omnichannel: 4, voice: 5, digital: 3, helpdesk: 2, salesforce: 3, servicenow: 2, ecommerce: 2, financial: 4, healthcare: 5, publicsector: 3, bpo: 3, agentassist: 3, qa: 3, developer: 3, employee: 2, ccaas: 4 },
  },

  "rasa": {
    name: "Rasa Enterprise", slug: "rasa", category: "enterprise",
    product: 78, enterprise: 77, bpo: 75, confidence: 4.0,
    modality: "Voice & Digital", origin: "Open Source + LLM",
    summary: "Open-source and enterprise conversational AI framework. Maximum developer flexibility with full architecture control.",
    differentiator: "Developer flexibility + full architecture control",
    verticals: "Cross-industry, custom enterprise, developer-led",
    bestUseCase: "Developer-led enterprise custom build",
    useCaseFit: { omnichannel: 3, voice: 2, digital: 3, helpdesk: 2, salesforce: 3, servicenow: 3, ecommerce: 2, financial: 4, healthcare: 3, publicsector: 4, bpo: 4, agentassist: 2, qa: 2, developer: 5, employee: 3, ccaas: 2 },
  },

  "egain": {
    name: "eGain", slug: "egain", category: "enterprise",
    product: 78, enterprise: 81, bpo: 78, confidence: 4.0,
    modality: "Voice & Digital", origin: "Proprietary",
    summary: "Strong knowledge/governance density. Knowledge-led customer service AI with trusted answers and compliance controls.",
    differentiator: "Knowledge governance + trusted answers",
    verticals: "BFSI, Healthcare, Government, Regulated enterprise",
    bestUseCase: "Knowledge-led regulated service",
    useCaseFit: { omnichannel: 3, voice: 2, digital: 4, helpdesk: 4, salesforce: 4, servicenow: 4, ecommerce: 3, financial: 5, healthcare: 5, publicsector: 4, bpo: 4, agentassist: 4, qa: 5, developer: 3, employee: 4, ccaas: 3 },
  },

  "aisera": {
    name: "Aisera", slug: "aisera", category: "enterprise",
    product: 77, enterprise: 79, bpo: 73, confidence: 3.6,
    modality: "Voice & Digital", origin: "Multi-model",
    summary: "ITSM, HR, employee service, and workflow automation. Conversational + workflow automation platform.",
    differentiator: "Conversational + workflow automation for ITSM/HR",
    verticals: "ITSM, Enterprise Service, Employee Service",
    bestUseCase: "Employee service + IT + HR automation",
    useCaseFit: { omnichannel: 3, voice: 2, digital: 4, helpdesk: 4, salesforce: 3, servicenow: 5, ecommerce: 2, financial: 4, healthcare: 3, publicsector: 4, bpo: 3, agentassist: 3, qa: 3, developer: 3, employee: 5, ccaas: 2 },
  },

  "moveworks-servicenow": {
    name: "Moveworks / ServiceNow", slug: "moveworks-servicenow", category: "enterprise",
    product: 76, enterprise: 78, bpo: 66, confidence: 4.0,
    modality: "Digital", origin: "LLM + Proprietary",
    summary: "Employee service and internal support automation. ServiceNow completed Moveworks acquisition December 2025.",
    differentiator: "Employee workflow + ServiceNow-native AI",
    verticals: "IT, HR, Employee Service",
    bestUseCase: "ServiceNow-heavy employee workflow",
    useCaseFit: { omnichannel: 2, voice: 1, digital: 3, helpdesk: 4, salesforce: 2, servicenow: 5, ecommerce: 1, financial: 3, healthcare: 2, publicsector: 3, bpo: 2, agentassist: 2, qa: 2, developer: 2, employee: 5, ccaas: 1 },
  },

  "onereach-ai": {
    name: "OneReach.ai", slug: "onereach-ai", category: "enterprise",
    product: 75, enterprise: 72, bpo: 70, confidence: 3.1,
    modality: "Voice & Digital", origin: "Multi-AI orchestration",
    summary: "Highly configurable workflow-heavy conversational orchestration studio for complex enterprise workflows.",
    differentiator: "Workflow-heavy orchestration studio",
    verticals: "Enterprise, complex workflows",
    bestUseCase: "Complex workflow orchestration",
    useCaseFit: { omnichannel: 3, voice: 4, digital: 3, helpdesk: 2, salesforce: 3, servicenow: 3, ecommerce: 2, financial: 3, healthcare: 3, publicsector: 3, bpo: 3, agentassist: 2, qa: 2, developer: 4, employee: 3, ccaas: 3 },
  },

  "liveperson": {
    name: "LivePerson", slug: "liveperson", category: "enterprise",
    product: 74, enterprise: 70, bpo: 68, confidence: 3.0,
    modality: "Voice & Digital", origin: "Proprietary + GPT",
    summary: "Conversational cloud and messaging automation. Capped due to SoundHound acquisition announcement April 2026 creating roadmap uncertainty.",
    differentiator: "Conversational orchestration + messaging",
    verticals: "Enterprise CX, digital-first",
    bestUseCase: "Digital self-service and messaging",
    useCaseFit: { omnichannel: 3, voice: 3, digital: 5, helpdesk: 3, salesforce: 3, servicenow: 2, ecommerce: 4, financial: 2, healthcare: 2, publicsector: 2, bpo: 2, agentassist: 3, qa: 3, developer: 2, employee: 2, ccaas: 3 },
  },

  "pypestream": {
    name: "Pypestream", slug: "pypestream", category: "enterprise",
    product: 73, enterprise: 70, bpo: 66, confidence: 3.0,
    modality: "Voice & Digital", origin: "Proprietary",
    summary: "Enterprise conversational automation with workflow and transaction capabilities.",
    differentiator: "Enterprise conversational automation",
    verticals: "Healthcare, Insurance, Enterprise",
    bestUseCase: "Enterprise conversational workflows",
    useCaseFit: { omnichannel: 3, voice: 3, digital: 4, helpdesk: 3, salesforce: 3, servicenow: 2, ecommerce: 4, financial: 3, healthcare: 3, publicsector: 2, bpo: 2, agentassist: 2, qa: 2, developer: 2, employee: 2, ccaas: 2 },
  },

  // ─── HELPDESK-NATIVE AI AGENTS ──────────────────────

  "zendesk-ai": {
    name: "Zendesk AI / Ultimate / Forethought", slug: "zendesk-ai", category: "helpdesk",
    product: 84, enterprise: 83, bpo: 77, confidence: 4.0,
    modality: "Voice & Digital", origin: "LLM + Proprietary",
    summary: "Helpdesk-native AI agents and service automation. Completed Forethought acquisition March 2026. Expanded AI agents across ChatGPT, Gemini, voice, messaging.",
    differentiator: "Zendesk-native AI with resolution automation",
    verticals: "SaaS, digital-first, cross-industry",
    bestUseCase: "Zendesk-heavy service orgs",
  },

  "intercom-fin": {
    name: "Intercom Fin", slug: "intercom-fin", category: "helpdesk",
    product: 83, enterprise: 80, bpo: 72, confidence: 4.0,
    modality: "Digital", origin: "LLM-native",
    summary: "AI agent native to Intercom. Resolves complex queries across channels. Outcome-based pricing at $0.99/resolution.",
    differentiator: "Outcome-based pricing + helpdesk-native AI",
    verticals: "SaaS, digital-first, ecommerce",
    bestUseCase: "SaaS and digital-first support",
  },

  "freshworks-freddy": {
    name: "Freshworks Freddy AI Agent", slug: "freshworks-freddy", category: "helpdesk",
    product: 77, enterprise: 75, bpo: 71, confidence: 3.6,
    modality: "Voice & Digital", origin: "LLM + Proprietary",
    summary: "Midmarket helpdesk/service AI with real-time backend actions. Processes refunds, updates orders, verifies details.",
    differentiator: "Midmarket helpdesk + transactional automation",
    verticals: "Midmarket, commerce, service",
    bestUseCase: "Midmarket support / Freshdesk / Freshservice",
  },

  "gorgias": {
    name: "Gorgias AI Agent", slug: "gorgias", category: "helpdesk",
    product: 76, enterprise: 72, bpo: 66, confidence: 3.6,
    modality: "Digital", origin: "LLM + ecommerce-native",
    summary: "Ecommerce-native AI agent and helpdesk. 17,000+ brands. Order tracking, returns, FAQs with shopper-specific replies.",
    differentiator: "Ecommerce-native AI + Shopify integration",
    verticals: "Shopify, DTC, ecommerce",
    bestUseCase: "Shopify / DTC ecommerce support and sales",
  },

  "kustomer": {
    name: "Kustomer AI", slug: "kustomer", category: "helpdesk",
    product: 75, enterprise: 74, bpo: 68, confidence: 3.5,
    modality: "Digital", origin: "LLM + CRM-native",
    summary: "CRM-native customer service AI with unified conversations and automation.",
    differentiator: "CRM-native + unified customer context",
    verticals: "Ecommerce, retail, consumer brands",
    bestUseCase: "Ecommerce CRM + support automation",
  },

  "gladly": {
    name: "Gladly AI", slug: "gladly", category: "helpdesk",
    product: 73, enterprise: 72, bpo: 65, confidence: 3.3,
    modality: "Digital", origin: "Proprietary",
    summary: "Customer-centric service platform with AI. Ticket-free, customer-context-driven CX for relationship-based retail.",
    differentiator: "Ticket-free relationship-based CX",
    verticals: "Retail, consumer brands, luxury",
    bestUseCase: "Retail relationship-based CX",
  },

  "zowie": {
    name: "Zowie", slug: "zowie", category: "helpdesk",
    product: 73, enterprise: 70, bpo: 65, confidence: 3.2,
    modality: "Digital", origin: "LLM-native",
    summary: "AI agent platform for enterprise customer service, conversational commerce, and banking.",
    differentiator: "Ecommerce + commerce workflow automation",
    verticals: "Ecommerce, banking, consumer service",
    bestUseCase: "Ecommerce AI agent with commerce workflows",
  },

  "tidio-lyro": {
    name: "Tidio / Lyro", slug: "tidio-lyro", category: "helpdesk",
    product: 64, enterprise: 60, bpo: 52, confidence: 3.0,
    modality: "Digital", origin: "LLM",
    summary: "SMB ecommerce/chat automation. Friendly and accessible but limited enterprise depth.",
    differentiator: "SMB-friendly AI automation",
    verticals: "SMB ecommerce, small business",
    bestUseCase: "SMB ecommerce automation",
  },

  // ─── AGENT ASSIST / QA / COPILOT ───────────────────

  "nice-copilot": {
    name: "NICE Enlighten Copilot", slug: "nice-copilot", category: "agent-assist",
    product: 84, enterprise: 86, bpo: 86, confidence: 4.0,
    modality: "Voice & Digital", origin: "NICE LLM + NLP",
    summary: "CX-specific agent assist for real-time guidance and workforce performance. NICE CXone-native.",
    differentiator: "CXone-native + Enlighten AI analytics",
    verticals: "Enterprise CCaaS, regulated, BPO",
    bestUseCase: "NICE CXone agent assist and QA",
  },

  "observe-ai": {
    name: "Observe.AI", slug: "observe-ai", category: "agent-assist",
    product: 82, enterprise: 81, bpo: 82, confidence: 4.0,
    modality: "Voice & Digital", origin: "Proprietary",
    summary: "AI agents for customers, frontline teams, and operations. Voice/chat automation, real-time guidance, coaching, analytics. 2026 MetriStar Top Provider.",
    differentiator: "Full-stack agent assist + QA + AI agents",
    verticals: "Enterprise CX, BPO, contact center operations",
    bestUseCase: "Agent assist, QA, coaching, CX operations",
  },

  "genesys-copilot": {
    name: "Genesys Cloud Copilot", slug: "genesys-copilot", category: "agent-assist",
    product: 81, enterprise: 84, bpo: 82, confidence: 4.0,
    modality: "Voice & Digital", origin: "Genesys AI",
    summary: "Real-time next-best action, intent determination, summaries, wrap-up suggestions, and resolution tracking. Genesys Cloud-native.",
    differentiator: "Genesys Cloud-native agent copilot",
    verticals: "Enterprise, Genesys Cloud shops",
    bestUseCase: "Genesys Cloud agent assist",
  },

  "cresta": {
    name: "Cresta", slug: "cresta", category: "agent-assist",
    product: 81, enterprise: 79, bpo: 77, confidence: 4.0,
    modality: "Voice & Chat", origin: "LLM + NLU",
    summary: "Unified platform for human and AI agents across enterprise-scale CX. Real-time coaching + IVA handoff. Strong in financial services.",
    differentiator: "Human + AI agent platform + real-time coaching",
    verticals: "Financial services, enterprise CX",
    bestUseCase: "Sales & service coaching + AI agent",
  },

  "verint": {
    name: "Verint", slug: "verint", category: "agent-assist",
    product: 80, enterprise: 82, bpo: 83, confidence: 4.0,
    modality: "Voice & Digital", origin: "Proprietary",
    summary: "Enterprise/BPO WEM, bots, CX automation. Copilot Bots automate real-time agent tasks. Strong BPO multi-client fit.",
    differentiator: "WEM-adjacent AI + enterprise/BPO depth",
    verticals: "Enterprise, BPO, regulated",
    bestUseCase: "Enterprise/BPO WEM-aligned AI",
  },

  "level-ai": {
    name: "Level AI", slug: "level-ai", category: "agent-assist",
    product: 74, enterprise: 73, bpo: 76, confidence: 3.5,
    modality: "Voice & Digital", origin: "LLM + Proprietary",
    summary: "QA automation and agent intelligence. Conversation scoring and compliance analytics.",
    differentiator: "QA automation + conversation intelligence",
    verticals: "Contact center operations, BPO",
    bestUseCase: "QA automation and agent intelligence",
  },

  "invoca": {
    name: "Invoca", slug: "invoca", category: "agent-assist",
    product: 70, enterprise: 72, bpo: 68, confidence: 3.4,
    modality: "Voice", origin: "Proprietary",
    summary: "Revenue conversation intelligence. Automated QA and marketing/sales/contact center insight from calls.",
    differentiator: "Revenue conversation intelligence",
    verticals: "Sales, marketing, contact center",
    bestUseCase: "Revenue conversation intelligence",
  },

  "balto": {
    name: "Balto", slug: "balto", category: "agent-assist",
    product: 69, enterprise: 68, bpo: 70, confidence: 3.0,
    modality: "Voice", origin: "Proprietary",
    summary: "Real-time call guidance niche. Prompts agents during live calls with compliance and sales guidance.",
    differentiator: "Real-time call guidance",
    verticals: "Sales, compliance-heavy, insurance",
    bestUseCase: "Real-time call guidance niche",
  },

  // ─── CCaaS-NATIVE AUTOMATION ────────────────────────

  "nice-autopilot": {
    name: "NICE Enlighten Autopilot / Cognigy", slug: "nice-autopilot", category: "ccaas-native",
    product: 86, enterprise: 87, bpo: 86, confidence: 4.0,
    modality: "Voice & Digital", origin: "NICE LLM + Cognigy",
    summary: "NICE-native CX automation. CX-specific IVA orchestration following Cognigy acquisition.",
    differentiator: "CXone-native + Cognigy orchestration",
    verticals: "Enterprise CCaaS, regulated, BPO",
    bestUseCase: "NICE CXone / enterprise CCaaS AI",
  },

  "genesys-ai": {
    name: "Genesys AI / Dialog Engine / Copilot", slug: "genesys-ai", category: "ccaas-native",
    product: 84, enterprise: 84, bpo: 82, confidence: 4.0,
    modality: "Voice & Chat", origin: "Genesys AI",
    summary: "Genesys-native AI and automation. Contact center automation with routing, bot flows, and agent assist.",
    differentiator: "Genesys Cloud-native AI across routing and bots",
    verticals: "Enterprise, Genesys Cloud shops",
    bestUseCase: "Genesys Cloud CX automation",
  },

  "amazon-connect-ai": {
    name: "Amazon Connect + Lex", slug: "amazon-connect-ai", category: "ccaas-native",
    product: 80, enterprise: 79, bpo: 78, confidence: 4.0,
    modality: "Voice & Digital", origin: "AWS",
    summary: "AWS-native CCaaS and bot stack. Developer-friendly consumption pricing with Bedrock LLM integration.",
    differentiator: "AWS ecosystem + consumption pricing",
    verticals: "Technology-forward, AWS shops",
    bestUseCase: "AWS / Amazon Connect standardization",
  },

  "five9-iva": {
    name: "Five9 IVA Studio", slug: "five9-iva", category: "ccaas-native",
    product: 79, enterprise: 78, bpo: 78, confidence: 3.8,
    modality: "Voice & Chat", origin: "Google + Proprietary",
    summary: "Five9-native virtual agent. Builder for conversational self-service with escalation to live agents.",
    differentiator: "Five9-native + strong outbound alignment",
    verticals: "Contact center operations, blended service/sales",
    bestUseCase: "Five9 contact centers",
  },

  "talkdesk-autopilot": {
    name: "Talkdesk Autopilot / AI Agents", slug: "talkdesk-autopilot", category: "ccaas-native",
    product: 79, enterprise: 78, bpo: 76, confidence: 3.8,
    modality: "Voice & Chat", origin: "Google Dialogflow",
    summary: "Generative AI virtual agents for voice and digital channels. Seamless CCaaS integration with vertical Experience Clouds.",
    differentiator: "Vertical-specific CCaaS AI",
    verticals: "Financial services, healthcare, retail",
    bestUseCase: "Talkdesk contact centers",
  },

  "zoom-va": {
    name: "Zoom Virtual Agent", slug: "zoom-va", category: "ccaas-native",
    product: 76, enterprise: 74, bpo: 70, confidence: 3.6,
    modality: "Voice & Digital", origin: "Zoom AI",
    summary: "Zoom CX/contact center automation. Virtual Agent 3.0 launched February 2026 for end-to-end resolution.",
    differentiator: "Zoom ecosystem pull + modern UX",
    verticals: "Digital-first, education, media",
    bestUseCase: "Zoom Contact Center / Zoom CX automation",
  },

  "twilio-flex": {
    name: "Twilio Flex + Conversational AI", slug: "twilio-flex", category: "ccaas-native",
    product: 76, enterprise: 74, bpo: 76, confidence: 3.8,
    modality: "Voice & Digital", origin: "API-first",
    summary: "Programmable contact-center and conversational AI layer. Customer brings the AI, Twilio handles voice.",
    differentiator: "API-first programmable contact center",
    verticals: "Developer-led, custom builds",
    bestUseCase: "API-first contact center builds",
  },

  "cisco-cc-ai": {
    name: "Cisco Webex Contact Center AI", slug: "cisco-cc-ai", category: "ccaas-native",
    product: 75, enterprise: 76, bpo: 73, confidence: 3.7,
    modality: "Voice & Digital", origin: "Cisco AI",
    summary: "Cisco-native contact center AI. Webex AI Agent and AI Assistant for customer service teams.",
    differentiator: "Cisco security + collaboration ecosystem",
    verticals: "Government, healthcare, telecom, Cisco estates",
    bestUseCase: "Cisco/Webex estates",
  },

  "ujet-va": {
    name: "UJET Virtual Agent", slug: "ujet-va", category: "ccaas-native",
    product: 72, enterprise: 71, bpo: 68, confidence: 3.3,
    modality: "Voice & Digital", origin: "Proprietary",
    summary: "Mobile-first CCaaS-native automation. Analyzes 10K-100K contacts to prioritize self-service opportunities.",
    differentiator: "Mobile-first + contact analysis",
    verticals: "Digital-native, mobile-first",
    bestUseCase: "Mobile-first CCaaS automation",
  },

  "ringcentral-ai": {
    name: "RingCentral RingCX AI", slug: "ringcentral-ai", category: "ccaas-native",
    product: 70, enterprise: 70, bpo: 66, confidence: 3.3,
    modality: "Voice & Digital", origin: "RingCentral AI",
    summary: "UCaaS + CCaaS midmarket AI with agent assist and real-time suggestions.",
    differentiator: "UC+CC convergence AI",
    verticals: "Midmarket, distributed service",
    bestUseCase: "UCaaS + CCaaS midmarket automation",
  },

  "8x8-ai": {
    name: "8x8 AI Studio / Smart Assist", slug: "8x8-ai", category: "ccaas-native",
    product: 70, enterprise: 70, bpo: 67, confidence: 3.4,
    modality: "Voice & Digital", origin: "8x8 AI",
    summary: "Midmarket CCaaS/UCaaS AI agents with real-time guidance, summaries, and workflow actions.",
    differentiator: "Value-oriented UC+CC AI",
    verticals: "Midmarket, cost-conscious",
    bestUseCase: "Midmarket CCaaS / UCaaS automation",
  },
};

// ═══════════════════════════════════════════════════════
// SHORTLISTS BY USE CASE
// ═══════════════════════════════════════════════════════

export const USE_CASE_SHORTLISTS = {
  omnichannel: ["kore-ai", "nice-cognigy", "ada", "google-dialogflow", "microsoft-copilot", "ibm-watsonx", "boost-ai"],
  voice: ["nice-cognigy", "omilia", "amelia-soundhound", "kore-ai", "amazon-lex", "teneo-ai", "onereach-ai"],
  digital: ["ada", "kore-ai", "boost-ai", "sprinklr", "yellow-ai", "zendesk-ai", "intercom-fin", "liveperson"],
  helpdesk: ["zendesk-ai", "intercom-fin", "freshworks-freddy", "gorgias", "kustomer"],
  salesforce: ["kore-ai", "nice-cognigy", "ada", "google-dialogflow", "decagon", "egain"],
  servicenow: ["moveworks-servicenow", "aisera", "microsoft-copilot", "ibm-watsonx", "egain"],
  ecommerce: ["gorgias", "intercom-fin", "ada", "kustomer", "zowie", "gladly", "freshworks-freddy", "tidio-lyro"],
  financial: ["kore-ai", "nice-cognigy", "omilia", "boost-ai", "ibm-watsonx", "teneo-ai", "egain", "rasa"],
  healthcare: ["kore-ai", "nice-cognigy", "omilia", "amelia-soundhound", "egain", "google-dialogflow", "amazon-lex"],
  publicsector: ["microsoft-copilot", "ibm-watsonx", "boost-ai", "google-dialogflow", "amazon-lex", "rasa", "kore-ai"],
  bpo: ["nice-cognigy", "kore-ai", "genesys-ai", "amazon-connect-ai", "google-dialogflow", "microsoft-copilot", "uniphore", "verint", "egain", "omilia"],
  agentassist: ["nice-copilot", "observe-ai", "genesys-copilot", "cresta", "verint", "uniphore"],
  qa: ["observe-ai", "verint", "level-ai", "egain", "uniphore"],
  developer: ["google-dialogflow", "amazon-lex", "microsoft-copilot", "rasa", "twilio-flex", "ibm-watsonx"],
  employee: ["moveworks-servicenow", "aisera", "microsoft-copilot", "ibm-watsonx", "freshworks-freddy", "egain"],
  ccaas: ["nice-autopilot", "genesys-ai", "amazon-connect-ai", "five9-iva", "talkdesk-autopilot", "zoom-va", "twilio-flex"],
};

// ═══════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════

export const getIVAVendor = (slug) => ivaVendors[slug] || null;
export const getIVAVendorsByCategory = (cat) => Object.values(ivaVendors).filter(v => v.category === cat).sort((a, b) => b.product - a.product);
export const getAllIVAVendors = () => Object.values(ivaVendors).sort((a, b) => b.product - a.product);
export const getAllIVASlugs = () => Object.keys(ivaVendors);
export const getIVAShortlist = (useCaseId) => (USE_CASE_SHORTLISTS[useCaseId] || []).map(slug => ivaVendors[slug]).filter(Boolean);

// ═══════════════════════════════════════════════════════
// BACKWARD-COMPATIBLE EXPORTS (for VendorProfile.jsx)
// ═══════════════════════════════════════════════════════

export const ivaTierConfig = [
  { min: 85, label: "Leader", color: "#10B981" },
  { min: 78, label: "Strong Contender", color: "#7CB342" },
  { min: 70, label: "Contender", color: "#F59E0B" },
  { min: 60, label: "Emerging", color: "#DC6B00" },
  { min: 0, label: "Watchlist", color: "#6B7F99" },
];
export const ivaScoringDimensions = SCORING_MODEL;
