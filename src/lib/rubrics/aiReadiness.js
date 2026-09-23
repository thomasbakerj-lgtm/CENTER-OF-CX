/* AI Readiness Diagnostic rubric, version 1.0.
 *
 * Published at /methodology/ai-readiness from this object. The statements, dimension
 * order and band cut points are the ones the diagnostic has always used, so scores
 * and bands are unchanged. The automation pattern the results page has always shown
 * ("Era 1" to "Era 4") used its own unpublished thresholds; it is now published here
 * as a second band set, with its wording stated as what the rubric maps to rather
 * than as a readiness verdict.
 */
export const AI_READINESS = {
  id: "ai-readiness",
  title: "AI Readiness Diagnostic",
  version: "1.0",
  published: "2026-09-23",
  route: "/tools/ai-readiness",
  methodology: "/methodology/ai-readiness",
  scale: { min: 1, max: 5, low: "Strongly disagree", high: "Strongly agree" },
  failAt: 2,
  what: "How ready your data, workflows, integrations, governance, people and measurement are to support AI in customer service, and which gaps to close before you buy.",
  limits: [
    "It measures how the respondent sees the organization. It does not test your data, your APIs or your models.",
    "The score is a position on this rubric. It is not a percentile and does not compare you with other organizations, because no sourced distribution of scores exists.",
    "All six dimensions carry equal weight. A single critical gap, such as no consent handling, can matter more than the average suggests.",
    "It recommends actions and a next diagnostic. It never recommends a vendor or a product.",
  ],
  dims: [
    { id: "data", name: "Data Quality & Access", weight: 1, next: "cx-it-alignment", criteria: [
      { text: "Customer interaction data (calls, chats, emails) is captured, stored, and accessible in a structured format.", action: "Confirm every channel's interactions are recorded or logged, retained and retrievable in a structured, queryable form." },
      { text: "CRM and case data is reliably linked to interaction records so AI can access customer context.", action: "Link each interaction record to its customer and case ID, and measure the share of interactions that link." },
      { text: "Knowledge base content is current, well-organized, and machine-readable.", action: "Audit the knowledge base for stale and duplicate articles, assign article owners, and set a review date on each article." },
      { text: "Data quality issues (duplicates, missing fields, stale records) are actively managed and measured.", action: "Pick three data quality measures, such as duplicate rate, missing fields and record age, and report them monthly with an owner." },
    ]},
    { id: "workflow", name: "Workflow Readiness", weight: 1, next: "aht-decomposition", criteria: [
      { text: "Common interaction types (order status, billing, scheduling) follow documented, repeatable workflows.", action: "Document the step-by-step workflow for your five highest-volume contact types." },
      { text: "Escalation paths and exception handling are clearly defined and consistently followed.", action: "Write down each escalation path and exception rule, and check adherence in QA." },
      { text: "Agent desktop workflows are standardized, agents follow the same steps for the same issue types.", action: "Standardize the desktop steps for each common issue type and remove local workarounds." },
      { text: "There is a clear view of which interaction types are high-volume, low-complexity candidates for automation.", action: "Rank contact types by volume and complexity to produce a short list of automation candidates." },
    ]},
    { id: "integration", name: "Integration Architecture", weight: 1, next: "platform-decision", criteria: [
      { text: "Core systems (CRM, CCaaS, knowledge base, billing) have documented APIs that are actively maintained.", action: "List the APIs of each core system, confirm which are documented and supported, and flag the gaps." },
      { text: "The CCaaS platform supports real-time event streaming and webhook-based integrations.", action: "Confirm in writing which real-time events and webhooks your contact center platform exposes." },
      { text: "Identity and authentication systems can be invoked during automated interactions.", action: "Test whether an automated interaction can verify a customer's identity without handing off to an agent." },
      { text: "There is an integration owner or team responsible for maintaining cross-system connectivity.", action: "Name an owner for cross-system integrations and give them a monitored list of every connection." },
    ]},
    { id: "governance", name: "AI Governance & Policy", weight: 1, next: "governance-model", criteria: [
      { text: "There are defined policies for what AI can and cannot do in customer-facing interactions.", action: "Write a policy that lists what AI may and may not do with customers, and require it for every deployment." },
      { text: "AI outputs are subject to review, testing, and approval before production deployment.", action: "Add a test and approval gate before any AI output reaches customers, with a named approver." },
      { text: "There is a named owner for AI quality, model performance, and escalation design.", action: "Name an owner for AI quality, model performance and escalation design." },
      { text: "Compliance, privacy, and consent requirements are documented and applied to AI-driven interactions.", action: "Document the consent, privacy and compliance rules that apply to AI interactions and test each deployment against them." },
    ]},
    { id: "talent", name: "Talent & Change Readiness", weight: 1, next: "attrition-cost", criteria: [
      { text: "The organization has people who can configure, tune, and maintain AI tools (or a plan to hire/train them).", action: "Identify who will configure and tune AI tools, and fund training or hiring before deployment." },
      { text: "Frontline agents and supervisors understand how AI will change their roles and workflows.", action: "Brief agents and supervisors on how their work changes, and collect their questions before launch." },
      { text: "Leadership has set realistic expectations for AI deployment timelines and outcomes.", action: "Set written targets for AI timelines and outcomes with a baseline, and agree how they will be measured." },
      { text: "There is a change management plan that addresses agent adoption, trust, and feedback loops.", action: "Write a change plan that covers adoption measures, agent feedback channels and how feedback changes the tool." },
    ]},
    { id: "measurement", name: "Measurement & Iteration", weight: 1, next: "ai-deflection", criteria: [
      { text: "There are defined KPIs for AI performance (containment rate, handoff quality, answer accuracy, resolution time).", action: "Define AI KPIs, including resolution after automation and repeat contacts, before the pilot starts." },
      { text: "AI interactions are monitored with the same rigor as human interactions (QA scoring, compliance checks).", action: "Sample AI interactions into QA and score them against the same criteria as human interactions." },
      { text: "There is a feedback loop where AI performance data drives tuning and improvement cycles.", action: "Schedule a recurring tuning review where AI performance data leads to specific changes." },
      { text: "The organization can measure the economic impact of AI (cost per contact change, labor leverage, deflection rate).", action: "Set up the baseline cost per contact and resolution rate now, so the economic effect of AI can be measured later." },
    ]},
  ],
  bands: [
    { id: "not-ready", label: "Not Ready", min: 1, max: 1.8, desc: "Significant gaps exist across data, workflow, and governance foundations. AI deployments attempted now will likely underperform or create risk. Priority: build the data and workflow foundation before investing in AI tooling.", rec: "Start with data quality assessment, workflow documentation, and governance policy creation. Do not purchase AI tools yet." },
    { id: "early-stage", label: "Early Stage", min: 1.8, max: 2.6, desc: "Some foundations are in place but critical gaps remain. Limited AI pilots may be possible in narrow, well-defined use cases. Priority: close the biggest gaps in data access, integration, and governance before expanding.", rec: "Pilot AI in one high-volume, low-complexity use case. Simultaneously invest in data quality, API readiness, and governance policy." },
    { id: "foundation-set", label: "Foundation Set", min: 2.6, max: 3.4, desc: "Core readiness exists for structured AI deployments. Data access, workflows, and governance are functional but may lack depth in specific areas. Priority: expand AI coverage methodically while strengthening weak dimensions.", rec: "Deploy agent assist and automated summaries broadly. Begin IVA pilots for your top 3 contact types. Invest in the weakest dimension identified." },
    { id: "ai-capable", label: "AI Capable", min: 3.4, max: 4.2, desc: "Strong readiness across most dimensions. The organization can support meaningful AI deployments including autonomous resolution, agent assist, and predictive analytics. Priority: optimize and scale.", rec: "Scale autonomous resolution for Tier 1 contacts. Deploy real-time agent assist across voice and digital. Build AI governance into standard operating procedures." },
    { id: "ai-advanced", label: "AI Advanced", min: 4.2, max: 5.1, desc: "Strong readiness on every dimension of this rubric: data, architecture, governance and talent are in place to operate AI as a core part of the service model. Priority: move toward agentic AI and experience orchestration.", rec: "Test agentic workflows, proactive service automation and AI-driven orchestration on well-governed contact types first, and measure each against its baseline." },
  ],
  secondaryBands: {
    title: "Automation pattern the rubric maps to",
    bands: [
      { id: "era-1", label: "Era 1: Rules-Based", min: 1, max: 2, desc: "Start with rules-based automation (IVR optimization, simple chatbot). Build data and workflow foundations before AI investment." },
      { id: "era-2", label: "Era 2: Intent-Based", min: 2, max: 3, desc: "Focus on structured intent-based automation first. LLM deployment requires data quality and governance foundations." },
      { id: "era-3", label: "Era 3: Hybrid (Intent + LLM)", min: 3, max: 4, desc: "Hybrid IVA with intent matching and LLM fallback fits these answers. Fully autonomous AI requires closing the data and governance gaps first." },
      { id: "era-4", label: "Era 4: LLM-Native", min: 4, max: 5.1, desc: "On these answers the rubric maps to LLM-native automation, including autonomous agents on well-governed contact types, measured against a baseline." },
    ],
  },
};
