/* RFP Requirement Builder, version 1.0. An RFP model (kind "rfp").
 *
 * Published at /methodology/rfp-builder from this object, and read by the engine in
 * src/lib/rfp.js. Truth type: the buyer's own requirements and the responses the buyer's
 * vendors gave to them. It reads no vendor research, no vendor score and no other tool's
 * verdict. Any vendor can be scored, including vendors this site does not cover.
 *
 * Requirements carry a default priority the buyer can change. Scoring follows the rules
 * the research program uses for evidence: only a generally available capability earns
 * full credit; preview, beta, early access and roadmap earn none; a requirement a vendor
 * left unanswered is a clarification to close, never a zero; and a must-have claim is
 * not settled until it is seen working in the demo. Weights and the partner credit are
 * defaults with no published source; the buyer sets their own.
 *
 * The layers, requirements, focus areas and vertical requirements are the ones the
 * builder has always used, so old links keep every priority.
 */
export const RFP_BUILDER = {
  id: "rfp-builder",
  kind: "rfp",
  title: "RFP Requirement Builder",
  version: "1.0",
  published: "2026-09-24",
  route: "/tools/rfp-builder",
  methodology: "/methodology/rfp-builder",
  truthType: "The buyer's own requirements and their vendors' responses. Reads no vendor research or score; any vendor can be scored.",
  what: "Build weighted requirements for a contact center platform RFP by layer, then score each vendor's response under published rules: which vendors meet every must-have, where the choice is actually decided, what to script in each demo, and which claims still need proof.",
  priorities: [
    { id: "must", label: "Must Have" },
    { id: "should", label: "Should Have" },
    { id: "nice", label: "Nice to Have" },
  ],
  weights: { must: 3, should: 1, nice: 0 },
  weightsNote: "Default weights: a must-have counts three times a should-have, and a nice-to-have is scored but not weighted. They have no published source; set your own.",
  responses: [
    { id: "ga", label: "Native, generally available", credit: 1, meets: true },
    { id: "addon", label: "Add-on, generally available", credit: 1, meets: true },
    { id: "partner", label: "Through a partner", credit: 0.5, meets: true, heuristic: true },
    { id: "preview", label: "Preview, beta or early access", credit: 0, meets: false },
    { id: "roadmap", label: "Roadmap", credit: 0, meets: false },
    { id: "no", label: "Not available", credit: 0, meets: false },
  ],
  thresholds: {
    tieMargin: { value: 5, kind: "heuristic", text: "points of weighted coverage within which two vendors are too close to call" },
    maxVendors: { value: 6, kind: "rule", text: "vendors one scoring session holds" },
  },
  rules: {
    unmet: { severity: "critical", title: "Must-have not available", test: "A vendor answered not available on a must-have.",
      action: "{vendor} does not offer {req}, a must-have. Keep them in only if you are ready to drop or change the requirement." },
    notGA: { severity: "high", title: "Must-have not generally available", test: "A vendor answered preview, beta, early access or roadmap on a must-have. It earns no credit until it is generally available.",
      action: "Ask {vendor} for a dated general availability commitment for {req}, written into the contract with a remedy, or treat it as unmet." },
    dependent: { severity: "medium", title: "Must-have met through a partner", test: "A vendor meets a must-have only through a partner.",
      action: "Ask {vendor} who owns {req} after go-live, who supports it, and what it adds to the price." },
    clarify: { severity: "medium", title: "Response to clarify", test: "A vendor left a requirement unanswered. It is left out of the score until answered, never counted as a zero.",
      action: "Ask {vendor} to answer {count} open requirements, starting with {req}." },
    verify: { severity: "medium", title: "Must-have claim to verify", test: "A vendor claims a must-have is generally available and it has not been seen working in a demo.",
      action: "Script {count} must-have claims into the {vendor} demo, starting with {req}, using your own scenarios." },
    addons: { severity: "info", title: "Add-ons to price", test: "A vendor meets requirements through paid add-ons.",
      action: "Price the {count} add-ons {vendor} needs before comparing cost; the License Bundle Gap Checker lists what to ask for." },
    tie: { severity: "info", title: "Too close to call", test: "Two vendors' weighted coverage is within {tieMargin} points.",
      action: "{a} and {b} are within {gap} points: the score will not decide between them. Decide on the must-haves that separate them, the demo and the contract." },
    commonGap: { severity: "medium", title: "No vendor covers a layer", test: "No vendor meets every must-have in a layer with a generally available capability.",
      action: "No vendor fully covers {layer}. Decide whether a specialist product belongs beside the platform before shortlisting." },
    decider: { severity: "info", title: "Where the choice is decided", test: "Must-haves that some vendors meet and others do not.",
      action: "{count} must-haves separate your vendors, starting with {req}. Build the demo and the reference calls around them." },
  },
  limits: [
    "Scores come from what vendors answered in your RFP. A claim is only a claim until it is seen working in your scenarios; the demo and reference calls are where it is settled.",
    "Coverage is weighted by your priorities. It measures fit to your requirements, not the quality of a platform in general.",
    "The weights, the partner credit and the tie margin are defaults with no published source. Set your own if your evaluation differs.",
    "It orders only the vendors you entered, on your data. It never adds, removes or ranks a vendor on its own.",
  ],
  next: { contract: "contract-risk", price: "tco-calculator", addons: "license-gap", specialist: "platform-decision", match: "vendor-match" },
  verticals: ["Financial Services","Healthcare","Retail + eCommerce","Telecom","Insurance","Travel + Hospitality","Government","Utilities","Manufacturing","Education","Other"],
  sizes: ["Under 50 agents","50-200 agents","200-500 agents","500-1000 agents","1000-5000 agents","5000+ agents"],
  tags: [
  { id: "all", label: "Core Requirements", desc: "Applies to all evaluations" },
  { id: "enterprise", label: "Enterprise", desc: "500+ agents, complex environments" },
  { id: "ai", label: "AI + Automation", desc: "IVA, agent assist, autonomous" },
  { id: "digital", label: "Digital Channels", desc: "Chat, messaging, async" },
  { id: "wfm", label: "Workforce", desc: "Forecasting, scheduling, QA" },
  { id: "regulated", label: "Regulated", desc: "PCI, HIPAA, GDPR" },
  { id: "quality", label: "Quality Focus", desc: "QA automation, coaching" },
],
  verticalReqs: {
  "Healthcare": ["HIPAA BAA with PHI encryption", "EHR integration (Epic, Oracle Health, athenahealth)", "Patient identity verification across channels", "Appointment scheduling and referral management workflows"],
  "Financial Services": ["PCI DSS Level 1 with tokenization", "Core banking integration (FIS, Fiserv, Jack Henry)", "Identity verification with multi-factor authentication", "FFIEC and GLBA compliance documentation"],
  "Government": ["FedRAMP High authorization", "Section 508 / WCAG 2.1 AA accessibility", "CJIS compliance for law enforcement use cases", "StateRAMP authorization for state/local agencies"],
  "Retail + eCommerce": ["Commerce platform integration (Shopify, BigCommerce, commercetools)", "Seasonal elastic scaling (8-10x volume without pre-provisioning)", "Order management system integration for real-time status", "Returns automation workflow"],
  "Insurance": ["Policy admin integration (Guidewire, Duck Creek)", "Claims FNOL automation through IVA", "State insurance regulation compliance", "Separate routing for service vs claims tracks"],
  "Telecom": ["BSS/OSS platform integration", "Carrier-grade 99.999% availability", "CPNI protection compliance", "Complex IVR support (100+ nodes)"],
},
  layers: [
  { n: 7, name: "Analytics + Governance", color: "#1a5276", reqs: [
    { text: "Real-time operational dashboards with customizable KPIs", priority: "must", tags: ["all"] },
    { text: "AI-powered quality management evaluating 100% of interactions", priority: "must", tags: ["enterprise","quality"] },
    { text: "Speech and text analytics with sentiment and topic detection", priority: "should", tags: ["all"] },
    { text: "Compliance recording with role-based access and audit trails", priority: "must", tags: ["regulated"] },
    { text: "WFM forecasting within 5% accuracy at interval level", priority: "must", tags: ["wfm"] },
    { text: "Closed-loop feedback from analytics into routing and coaching", priority: "should", tags: ["enterprise"] },
    { text: "Custom reporting API with data export in standard formats", priority: "should", tags: ["all"] },
    { text: "AI model performance monitoring and drift detection", priority: "nice", tags: ["ai"] },
  ]},
  { n: 6, name: "Routing + Orchestration", color: "#1a6b8a", reqs: [
    { text: "Skills-based routing with weighted multi-attribute matching", priority: "must", tags: ["all"] },
    { text: "Intent-driven routing using AI classification of customer need", priority: "should", tags: ["ai","enterprise"] },
    { text: "Dynamic priority based on customer value, wait time, and predicted complexity", priority: "should", tags: ["enterprise"] },
    { text: "Cross-channel routing preserving context between voice and digital", priority: "must", tags: ["digital"] },
    { text: "Real-time queue management with intraday adjustment without admin intervention", priority: "should", tags: ["wfm"] },
    { text: "Callback scheduling with estimated wait time communication", priority: "must", tags: ["all"] },
    { text: "Overflow and failover routing with configurable business rules", priority: "must", tags: ["all"] },
  ]},
  { n: 5, name: "Conversation Management", color: "#1a7f9e", reqs: [
    { text: "Unified voice and digital channels from a single platform", priority: "must", tags: ["all"] },
    { text: "Agent desktop consolidation, under 3 applications for full interaction handling", priority: "should", tags: ["all"] },
    { text: "Cross-channel context continuity (chat-to-phone preserves full history)", priority: "must", tags: ["digital"] },
    { text: "WhatsApp, Apple Business Chat, RCS, and SMS messaging channels", priority: "should", tags: ["digital"] },
    { text: "Co-browse and screen sharing for complex issue resolution", priority: "nice", tags: ["enterprise"] },
    { text: "Async conversation management with SLA tracking", priority: "should", tags: ["digital"] },
    { text: "Video support for high-value or complex interactions", priority: "nice", tags: ["enterprise"] },
  ]},
  { n: 4, name: "Reasoning + AI", color: "#0e8c7f", reqs: [
    { text: "IVA/chatbot with natural language understanding across voice and digital", priority: "must", tags: ["ai"] },
    { text: "Real-time agent assist with suggested responses during live interactions", priority: "should", tags: ["ai"] },
    { text: "Knowledge AI with RAG grounding on enterprise data sources", priority: "should", tags: ["ai","enterprise"] },
    { text: "AI-generated interaction summaries and auto-disposition", priority: "should", tags: ["ai"] },
    { text: "Autonomous task execution (booking, cancellation, status change) not just text generation", priority: "nice", tags: ["ai"] },
    { text: "Guardrails preventing hallucination, off-topic responses, and policy violations", priority: "must", tags: ["ai"] },
    { text: "Human escalation with full AI conversation context transferred to agent", priority: "must", tags: ["ai"] },
  ]},
  { n: 3, name: "Policy + Guardrails", color: "#0e7a5e", reqs: [
    { text: "PCI DSS compliance with payment tokenization or pause/resume recording", priority: "must", tags: ["regulated","payments"] },
    { text: "HIPAA BAA with PHI encryption at rest and in transit", priority: "must", tags: ["healthcare"] },
    { text: "FedRAMP High authorization", priority: "must", tags: ["government"] },
    { text: "SOC 2 Type II certification current within 12 months", priority: "must", tags: ["all"] },
    { text: "GDPR and CCPA compliance with data subject request handling", priority: "must", tags: ["regulated"] },
    { text: "Role-based access control with SSO/SAML integration", priority: "must", tags: ["enterprise"] },
    { text: "Data residency options for geographic compliance requirements", priority: "should", tags: ["enterprise","regulated"] },
    { text: "AI decision audit trails for customer-facing automated actions", priority: "should", tags: ["ai","regulated"] },
  ]},
  { n: 2, name: "Workflow Execution", color: "#1a6b4a", reqs: [
    { text: "End-to-end workflow automation for top 10 contact types", priority: "should", tags: ["all"] },
    { text: "CRM integration with real-time read/write (Salesforce, ServiceNow, Dynamics, HubSpot)", priority: "must", tags: ["all"] },
    { text: "API-triggered workflows from external events (not just UI-initiated)", priority: "should", tags: ["enterprise"] },
    { text: "Cross-system data writes, agent actions update billing, CRM, and case systems simultaneously", priority: "should", tags: ["enterprise"] },
    { text: "Workflow versioning and rollback capability", priority: "nice", tags: ["enterprise"] },
    { text: "Low-code workflow builder for business users (not developer-only)", priority: "should", tags: ["all"] },
  ]},
  { n: 1, name: "Data Access + Infrastructure", color: "#2c5f3f", reqs: [
    { text: "99.99% uptime SLA with financial credits for breaches", priority: "must", tags: ["all"] },
    { text: "BYOC (Bring Your Own Carrier) support for existing telephony relationships", priority: "should", tags: ["enterprise"] },
    { text: "Open API architecture with rate limits sufficient for production integration", priority: "must", tags: ["all"] },
    { text: "Event streaming / webhooks for real-time interaction signals", priority: "should", tags: ["enterprise"] },
    { text: "CDR and interaction data export in standard formats (CSV, JSON, API)", priority: "must", tags: ["all"] },
    { text: "Multi-region deployment for disaster recovery and data residency", priority: "should", tags: ["enterprise","regulated"] },
    { text: "SSO, SCIM provisioning, and directory integration", priority: "must", tags: ["enterprise"] },
  ]},
],
};
