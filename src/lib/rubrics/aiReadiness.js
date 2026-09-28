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
  what: "How ready your data, workflows, integrations, governance, people and measurement are to support AI in customer service, and which gaps to close before you buy anything.",
  limits: [
    "It records how the respondent, the person answering, sees the organization. Nothing here tests your data, your APIs or your models.",
    "The score is a position on this rubric. It does not rank you against other organizations or give a percentile, because no sourced distribution of scores exists to compare against.",
    "All six dimensions carry equal weight. A single critical gap, such as no consent handling, can matter more than the average suggests.",
    "It recommends actions and a next diagnostic. It never recommends a vendor or a product.",
  ],
  dims: [
    { id: "data", name: "Data Quality & Access", weight: 1, next: "cx-it-alignment", criteria: [
      { text: "Customer interaction data (calls, chats, emails) is captured, stored and retrievable in a structured format.", action: "Confirm every channel's interactions are recorded or logged, retained and retrievable in a structured, queryable form." },
      { text: "CRM (customer relationship management) and case data is reliably linked to interaction records, so AI can see the customer's context.", action: "Link each interaction record to its customer and case ID, and measure the share of interactions that link." },
      { text: "Knowledge base content is current, well organized and readable by software as well as people.", action: "Audit the knowledge base for stale and duplicate articles, assign article owners, and set a review date on each article." },
      { text: "Data quality problems (duplicates, missing fields, stale records) are measured and someone works them down.", action: "Pick three data quality measures, such as duplicate rate, missing fields and record age, and report them monthly with an owner." },
    ]},
    { id: "workflow", name: "Workflow Readiness", weight: 1, next: "aht-decomposition", criteria: [
      { text: "Common contact types (order status, billing, scheduling) follow written, repeatable workflows.", action: "Document the step-by-step workflow for your five highest-volume contact types." },
      { text: "Escalation paths and exception handling are clearly defined and followed the same way every time.", action: "Write down each escalation path and exception rule, and check that agents follow them in QA (quality assurance) reviews." },
      { text: "Agent desktop workflows are standardized: agents follow the same steps for the same type of issue.", action: "Standardize the desktop steps for each common issue type and remove local workarounds." },
      { text: "You know which contact types are high in volume and low in complexity, the usual first candidates for automation.", action: "Rank contact types by volume and complexity to produce a short list of automation candidates." },
    ]},
    { id: "integration", name: "Integration Architecture", weight: 1, next: "platform-decision", criteria: [
      { text: "Core systems (CRM, the contact center platform, knowledge base, billing) have documented APIs that are actively maintained.", action: "List the APIs of each core system, confirm which are documented and supported, and flag the gaps." },
      { text: "The CCaaS (contact center as a service) platform can send events as they happen, through event streams or webhooks, to other systems.", action: "Confirm in writing which real-time events and webhooks your contact center platform exposes." },
      { text: "An automated interaction can call your identity and authentication systems to verify a customer.", action: "Test whether an automated interaction can verify a customer's identity without handing off to an agent." },
      { text: "A named owner or team keeps the connections between systems working.", action: "Name an owner for cross-system integrations and give them a monitored list of every connection." },
    ]},
    { id: "governance", name: "AI Governance & Policy", weight: 1, next: "governance-model", criteria: [
      { text: "A written policy says what AI may and may not do when it deals with customers.", action: "Write a policy that lists what AI may and may not do with customers, and require it for every deployment." },
      { text: "AI outputs are reviewed, tested and approved before they reach customers.", action: "Add a test and approval gate before any AI output reaches customers, with a named approver." },
      { text: "A named person owns AI quality, model performance and the design of escalations from AI to people.", action: "Name an owner for AI quality, model performance and escalation design." },
      { text: "Compliance, privacy and consent requirements are written down and applied to interactions that AI handles.", action: "Document the consent, privacy and compliance rules that apply to AI interactions and test each deployment against them." },
    ]},
    { id: "talent", name: "Talent & Change Readiness", weight: 1, next: "attrition-cost", criteria: [
      { text: "You have people who can configure, tune and maintain AI tools, or a plan to hire or train them.", action: "Identify who will configure and tune AI tools, and fund training or hiring before deployment." },
      { text: "Frontline agents and supervisors understand how AI will change their roles and daily work.", action: "Brief agents and supervisors on how their work changes, and collect their questions before launch." },
      { text: "Leadership has realistic expectations for how long AI takes to deploy and what it will deliver.", action: "Set written targets for AI timelines and outcomes with a baseline, and agree how they will be measured." },
      { text: "A change management plan covers how agents adopt the tools, whether they trust them, and how their feedback gets back to the team tuning them.", action: "Write a change plan that covers adoption measures, agent feedback channels and how feedback changes the tool." },
    ]},
    { id: "measurement", name: "Measurement & Iteration", weight: 1, next: "ai-deflection", criteria: [
      { text: "AI performance has defined KPIs (key performance indicators), such as containment rate (the share of contacts the AI finishes without a person), handoff quality, answer accuracy and resolution time.", action: "Define AI KPIs before the pilot starts, including whether the issue was resolved after automation and whether the customer contacted you again." },
      { text: "AI interactions are monitored as closely as human ones, with QA scoring and compliance checks.", action: "Sample AI interactions into QA and score them against the same criteria as human interactions." },
      { text: "AI performance data feeds a regular cycle of tuning and improvement.", action: "Schedule a recurring tuning review where AI performance data leads to specific changes." },
      { text: "You can measure the economic effect of AI: the change in cost per contact, agent time freed, and deflection rate (the share of contacts that never reach an agent).", action: "Set up the baseline cost per contact and resolution rate now, so the economic effect of AI can be measured later." },
    ]},
  ],
  bands: [
    { id: "not-ready", label: "Not Ready", min: 1, max: 1.8, desc: "Your answers show significant gaps in data, workflows and governance. AI deployed on this foundation is likely to underperform or create risk. Priority: build the data and workflow foundation before investing in AI tools.", rec: "Start by assessing data quality, documenting workflows and writing the governance policy. Hold off on buying AI tools until those are in place." },
    { id: "early-stage", label: "Early Stage", min: 1.8, max: 2.6, desc: "Some foundations are in place, but critical gaps remain. A small AI pilot may work in a narrow, well-defined use case. Priority: close the biggest gaps in data access, integration and governance before expanding.", rec: "Pilot AI in one high-volume, low-complexity use case. At the same time, invest in data quality, API readiness and governance policy." },
    { id: "foundation-set", label: "Foundation Set", min: 2.6, max: 3.4, desc: "The core is ready for structured AI deployments. Data access, workflows and governance work, though some areas lack depth. Priority: expand AI one use case at a time while you strengthen the weak dimensions.", rec: "Roll out agent assist (AI that suggests answers and steps to agents during the contact) and automated summaries broadly. Start IVA (intelligent virtual agent) pilots for your top 3 contact types. Invest in your weakest dimension." },
    { id: "ai-capable", label: "AI Capable", min: 3.4, max: 4.2, desc: "Readiness is strong on most dimensions. The organization can support substantial AI deployments, including AI that resolves contacts on its own, agent assist and predictive analytics. Priority: refine and scale.", rec: "Scale AI resolution for Tier 1 contacts (the simplest, most common requests). Roll out real-time agent assist across voice and digital. Build AI governance into standard operating procedures." },
    { id: "ai-advanced", label: "AI Advanced", min: 4.2, max: 5.1, desc: "Strong readiness on every dimension of this rubric: data, architecture, governance and talent are in place to operate AI as a core part of the service model. Priority: move toward agentic AI (AI that carries out multi-step tasks across systems) and orchestration of the whole customer journey.", rec: "Test agentic workflows, proactive service automation and AI-driven orchestration on well-governed contact types first, and measure each against its baseline." },
  ],
  secondaryBands: {
    title: "Automation pattern the rubric maps to",
    bands: [
      { id: "era-1", label: "Era 1: Rules-Based", min: 1, max: 2, desc: "Start with rules-based automation, such as a better IVR (the phone menu) or a simple chatbot. Build the data and workflow foundations before investing in AI." },
      { id: "era-2", label: "Era 2: Intent-Based", min: 2, max: 3, desc: "Start with intent-based automation, which recognizes a set list of customer requests. Large language models (LLMs) need data quality and governance in place first." },
      { id: "era-3", label: "Era 3: Hybrid (Intent + LLM)", min: 3, max: 4, desc: "These answers fit a hybrid virtual agent: intent matching first, with an LLM behind it for what the intents miss. Fully autonomous AI needs the data and governance gaps closed first." },
      { id: "era-4", label: "Era 4: LLM-Native", min: 4, max: 5.1, desc: "On these answers the rubric maps to LLM-native automation, including autonomous agents on well-governed contact types, measured against a baseline." },
    ],
  },
};
