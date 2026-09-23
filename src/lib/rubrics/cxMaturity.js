/* CX Maturity Assessment rubric, version 1.0.
 *
 * Published at /methodology/cx-maturity from this object. The statements, dimension
 * order and band cut points are the ones the assessment has always used, so scores
 * and bands are unchanged by the move into a rubric. What is new is that each
 * statement now names the action it calls for when it is answered at or below the
 * fail line, and each dimension names the diagnostic to run when it is the weakest.
 */
export const CX_MATURITY = {
  id: "cx-maturity",
  title: "CX Maturity Assessment",
  version: "1.0",
  published: "2026-09-23",
  route: "/tools/cx-maturity",
  methodology: "/methodology/cx-maturity",
  scale: { min: 1, max: 5, low: "Strongly disagree", high: "Strongly agree" },
  failAt: 2,
  what: "Where your organization sits on a five-level maturity rubric across strategy, operations, technology, analytics and governance, and which specific gaps to close first.",
  limits: [
    "It measures how the respondent sees the organization. It does not observe the operation, and two people in the same organization can score it differently.",
    "The score is a position on this rubric. It is not a percentile and does not compare you with other organizations, because no sourced distribution of scores exists.",
    "All five dimensions carry equal weight. The rubric does not know which dimension matters most to your business.",
    "It recommends actions and a next diagnostic. It never recommends a vendor.",
  ],
  dims: [
    { id: "strategy", name: "Strategy & Leadership", weight: 1, next: "transformation-readiness", criteria: [
      { text: "CX has a named executive sponsor with budget authority and cross-functional mandate.", action: "Name one executive sponsor for CX, give them budget authority, and write down the cross-functional mandate they hold." },
      { text: "There is a documented CX strategy that connects to measurable business outcomes.", action: "Write a one-page CX strategy that ties each initiative to a business outcome you already measure, such as retention, cost to serve or revenue." },
      { text: "CX investment decisions are made using data and frameworks rather than vendor demos.", action: "Adopt a written decision framework for CX investments and require a baseline, a target and a cost model before any vendor demo." },
      { text: "The organization treats CX as an operating discipline with defined roles, metrics, and governance.", action: "Define the CX operating roles, the five metrics they own and the forum where those metrics are reviewed." },
      { text: "Leadership reviews CX performance with the same rigor as financial or sales performance.", action: "Put CX metrics on the leadership agenda on the same cadence as the financial review, with owners and variance explanations." },
    ]},
    { id: "operations", name: "Operations & Workforce", weight: 1, next: "qa-scorecard", criteria: [
      { text: "Workforce management uses data-driven forecasting and intraday management across all channels.", action: "Forecast every channel from interval history and run an intraday review against that forecast each day." },
      { text: "Quality assurance covers both human and automated interactions with consistent scoring criteria.", action: "Extend the QA scorecard to automated interactions and score both against the same criteria." },
      { text: "Agents have clear career paths, coaching programs, and performance visibility.", action: "Publish the agent career path, schedule recurring coaching, and give each agent a view of their own performance data." },
      { text: "Service levels are measured and managed across voice, digital, and async channels independently.", action: "Set and report a separate service level for each channel, including asynchronous ones, instead of one blended figure." },
      { text: "Escalation paths, exception handling, and fallback logic are documented and governed.", action: "Document each escalation path and fallback, name an owner for each, and review them when processes change." },
    ]},
    { id: "technology", name: "Technology & Architecture", weight: 1, next: "platform-decision", criteria: [
      { text: "The contact center platform (CCaaS) is cloud-native with API extensibility and ecosystem integration.", action: "Inventory which platform functions are reachable by API and list the integrations you need that the platform cannot support." },
      { text: "CRM, knowledge, identity, and workflow systems are integrated with the agent desktop.", action: "Map the systems an agent opens for your top five contact types and integrate the most-used one into the desktop first." },
      { text: "Digital channels (chat, messaging, social) are routed and managed with the same rigor as voice.", action: "Route digital channels through the same skills, queues and reporting as voice, with their own service levels." },
      { text: "The technology stack has a defined architecture owner who governs vendor selection and integration.", action: "Name an architecture owner for the CX stack and route every vendor selection and integration decision through them." },
      { text: "There is a technology roadmap aligned to the CX strategy with phased milestones.", action: "Build a phased technology roadmap where each milestone traces to an objective in the CX strategy." },
    ]},
    { id: "analytics", name: "Analytics & Intelligence", weight: 1, next: "fcr-leakage", criteria: [
      { text: "Interaction analytics (speech, text, sentiment) are used to identify root causes and trends.", action: "Use interaction analytics to find the top three contact drivers and assign each an owner to address the root cause." },
      { text: "Reporting goes beyond volume and AHT to measure resolution quality, effort, and business outcomes.", action: "Add resolution rate, repeat contact rate and customer effort to the standard report alongside volume and handle time." },
      { text: "Analytics insights drive operational changes within weeks rather than being trapped in reports.", action: "Set a monthly review where each analytics finding either becomes an operational change with an owner or is closed with a reason." },
      { text: "AI-generated insights (auto-QA, topic clustering, behavioral analysis) are part of the QA workflow.", action: "Feed automated QA and topic clustering into the QA calibration process so reviewers act on them." },
      { text: "Journey analytics connect contact center data to upstream and downstream customer behavior.", action: "Join contact records to the customer events before and after the contact, starting with one journey that drives high volume." },
    ]},
    { id: "governance", name: "Governance & AI Readiness", weight: 1, next: "ai-readiness", criteria: [
      { text: "AI and automation deployments have defined governance, testing protocols, and rollback procedures.", action: "Require a test plan, an approval step and a written rollback procedure before any automation goes live." },
      { text: "There are clear policies for what AI can and cannot do in customer interactions.", action: "Write a policy that lists what AI may and may not do in customer interactions, and publish it to the teams that deploy it." },
      { text: "Data privacy, consent, and compliance requirements are embedded in technology decisions.", action: "Add a privacy, consent and compliance check to the technology decision process, with sign-off by the named owner." },
      { text: "The organization has defined ownership for AI quality, model performance, and escalation design.", action: "Name owners for AI quality, model performance and escalation design, and give each a metric they report on." },
      { text: "There is a process for evaluating new AI capabilities against operational readiness and risk tolerance.", action: "Define a readiness and risk checklist that every new AI capability passes before a pilot is approved." },
    ]},
  ],
  bands: [
    { id: "foundational", label: "Foundational", min: 1, max: 1.8, desc: "The organization is in early stages. CX efforts are fragmented, reactive, and lack consistent governance. Priority: establish basic measurement, define ownership, and build a strategy before investing in technology." },
    { id: "developing", label: "Developing", min: 1.8, max: 2.6, desc: "Some CX discipline exists but it is inconsistent across the organization. Pockets of maturity coexist with significant gaps. Priority: standardize operations, close the biggest gaps, and align technology to strategy." },
    { id: "operational", label: "Operational", min: 2.6, max: 3.4, desc: "CX is managed as a real operating discipline with defined metrics and governance. The foundation is solid but advanced capabilities (AI, orchestration, journey analytics) are still emerging. Priority: deepen analytics, expand automation, and strengthen cross-functional alignment." },
    { id: "advanced", label: "Advanced", min: 3.4, max: 4.2, desc: "The organization has strong CX maturity across most dimensions. AI and analytics are integrated into operations. Priority: optimize orchestration, govern AI at scale, and connect CX outcomes to enterprise strategy." },
    { id: "leading", label: "Leading", min: 4.2, max: 5.1, desc: "CX is a mature operating discipline across all five dimensions, with AI governance and measured business outcomes. Priority: sustain the discipline, test new capabilities at the edges, and keep the measures honest." },
  ],
};
