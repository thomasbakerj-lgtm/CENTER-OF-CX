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
  what: "Where your organization sits on a five-level maturity rubric across strategy, operations, technology, analytics and governance, and which gaps to close first.",
  limits: [
    "It records how the respondent, the person answering, sees the organization. Nobody observes the operation, so two people in the same organization can score it differently.",
    "The score is a position on this rubric. It does not rank you against other organizations or give a percentile, because no sourced distribution of scores exists to compare against.",
    "All five dimensions carry equal weight. The rubric cannot know which one matters most to your business; you can.",
    "It recommends actions and a next diagnostic. It never recommends a vendor.",
  ],
  dims: [
    { id: "strategy", name: "Strategy & Leadership", weight: 1, next: "transformation-readiness", criteria: [
      { text: "CX has a named executive sponsor with budget authority and a mandate that crosses departments.", action: "Name one executive sponsor for CX, give them budget authority, and write down the cross-functional mandate they hold." },
      { text: "A written CX strategy ties CX work to business outcomes you can measure.", action: "Write a one-page CX strategy that ties each initiative to a business outcome you already measure, such as retention, cost to serve or revenue." },
      { text: "CX investment decisions start from your own data and a written decision framework, before any vendor demo.", action: "Adopt a written decision framework for CX investments and require a baseline, a target and a cost model before any vendor demo." },
      { text: "CX is run as an operating discipline, with defined roles, metrics and governance.", action: "Define the CX operating roles, the five metrics they own and the forum where those metrics are reviewed." },
      { text: "Leadership reviews CX performance as closely as it reviews financial or sales performance.", action: "Put CX metrics on the leadership agenda on the same cadence as the financial review, with owners and variance explanations." },
    ]},
    { id: "operations", name: "Operations & Workforce", weight: 1, next: "qa-scorecard", criteria: [
      { text: "Workforce management (WFM) forecasts every channel from data and manages the day as it runs (intraday).", action: "Forecast every channel from interval history and run an intraday review against that forecast each day." },
      { text: "Quality assurance (QA) covers both human and automated interactions, scored against the same criteria.", action: "Extend the QA scorecard to automated interactions, such as bots and self-service, and score both against the same criteria." },
      { text: "Agents have a clear career path, regular coaching and a view of their own performance.", action: "Publish the agent career path, schedule recurring coaching, and give each agent a view of their own performance data." },
      { text: "Each channel, voice, digital and asynchronous (email, messaging), has its own service level that is measured and managed.", action: "Set and report a separate service level for each channel, including asynchronous ones. A single blended figure hides the channel that is struggling." },
      { text: "Escalation paths, exception handling and fallbacks are written down and have owners.", action: "Document each escalation path and fallback, name an owner for each, and review them when processes change." },
    ]},
    { id: "technology", name: "Technology & Architecture", weight: 1, next: "platform-decision", criteria: [
      { text: "The contact center platform is cloud-based CCaaS (contact center as a service), with APIs to extend it and integrations into the rest of your systems.", action: "Inventory which platform functions are reachable by API and list the integrations you need that the platform cannot support." },
      { text: "CRM (customer relationship management), knowledge, identity and workflow systems are integrated into the agent desktop.", action: "Map the systems an agent opens for your top five contact types and integrate the most-used one into the desktop first." },
      { text: "Digital channels (chat, messaging, social) are routed and managed as carefully as voice.", action: "Route digital channels through the same skills, queues and reporting as voice, with their own service levels." },
      { text: "One named architecture owner governs vendor selection and integration across the CX technology stack.", action: "Name an architecture owner for the CX stack and route every vendor selection and integration decision through them." },
      { text: "A phased technology roadmap follows from the CX strategy.", action: "Build a phased technology roadmap where each milestone traces to an objective in the CX strategy." },
    ]},
    { id: "analytics", name: "Analytics & Intelligence", weight: 1, next: "fcr-leakage", criteria: [
      { text: "Interaction analytics (speech, text and sentiment analysis) are used to find root causes and trends.", action: "Use interaction analytics to find the top three contact drivers and assign each an owner to address the root cause." },
      { text: "Reporting goes beyond volume and AHT (average handle time) to measure resolution, customer effort and business outcomes.", action: "Add resolution rate, repeat contact rate and customer effort to the standard report alongside volume and handle time." },
      { text: "What analytics finds turns into an operational change within weeks.", action: "Set a monthly review where each analytics finding either becomes an operational change with an owner or is closed with a reason." },
      { text: "AI-generated insights (automated QA scoring, topic clustering, behavioral analysis) feed the QA workflow.", action: "Feed automated QA scores and topic clusters into QA calibration, the sessions where reviewers agree how to score, so reviewers act on them." },
      { text: "Journey analytics connect contact center data to what customers did before and after they contacted you.", action: "Join contact records to the customer events before and after the contact, starting with one journey that drives high volume." },
    ]},
    { id: "governance", name: "Governance & AI Readiness", weight: 1, next: "ai-readiness", criteria: [
      { text: "Every AI or automation deployment has an owner, a test plan and a way to roll it back.", action: "Require a test plan, an approval step and a written rollback procedure before any automation goes live." },
      { text: "A written policy says what AI may and may not do in customer interactions.", action: "Write a policy that lists what AI may and may not do in customer interactions, and publish it to the teams that deploy it." },
      { text: "Privacy, consent and compliance requirements are checked in every technology decision.", action: "Add a privacy, consent and compliance check to the technology decision process, with sign-off by the named owner." },
      { text: "Someone owns AI quality, model performance and the design of escalations from AI to people.", action: "Name owners for AI quality, model performance and escalation design, and give each a metric they report on." },
      { text: "New AI capabilities are checked against operational readiness and your tolerance for risk before a pilot.", action: "Define a readiness and risk checklist that every new AI capability passes before a pilot is approved." },
    ]},
  ],
  bands: [
    { id: "foundational", label: "Foundational", min: 1, max: 1.8, desc: "CX work is at an early stage: efforts are scattered, mostly reactive, and governed differently from team to team. Priority: put basic measurement in place, name owners, and write a strategy before investing in technology." },
    { id: "developing", label: "Developing", min: 1.8, max: 2.6, desc: "Some CX discipline exists, but it varies across the organization: strong pockets sit beside significant gaps. Priority: standardize operations, close the biggest gaps, and tie technology choices to the strategy." },
    { id: "operational", label: "Operational", min: 2.6, max: 3.4, desc: "CX is managed as an operating discipline with defined metrics and governance. The foundation is solid; advanced capabilities (AI, orchestration of work across channels and systems, journey analytics) are still emerging. Priority: deepen analytics, expand automation, and tighten alignment between departments." },
    { id: "advanced", label: "Advanced", min: 3.4, max: 4.2, desc: "CX maturity is strong on most dimensions, and AI and analytics are part of daily operations. Priority: refine orchestration, govern AI at scale, and connect CX outcomes to company strategy." },
    { id: "leading", label: "Leading", min: 4.2, max: 5.1, desc: "CX is a mature operating discipline on all five dimensions, with AI governance and measured business outcomes. Priority: keep the discipline, test new capabilities in small, contained trials, and keep the measures honest." },
  ],
};
