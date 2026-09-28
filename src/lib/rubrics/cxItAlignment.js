/* CX + IT Alignment Framework rubric, version 1.0. A paired rubric.
 *
 * Published at /methodology/cx-it-alignment from this object. Each criterion is a pair:
 * one statement from the CX side and one from the IT side, each answered on the same 1
 * to 5 scale. The score is the gap between the two answers, so it measures agreement,
 * never capability. The areas, pairs and gap bands are the ones the framework has always
 * used, so every gap and band is unchanged by the move into a rubric.
 *
 * New, and published here: a gap alone cannot see two sides that agree the capability is
 * missing (both answer 1 and the gap is 0). Every pair answered at the fail line or below
 * on both sides is raised as a shared weakness with its own action, beside the pairs that
 * are misaligned by the gap line or more.
 */
export const CX_IT_ALIGNMENT = {
  id: "cx-it-alignment",
  kind: "paired",
  title: "CX + IT Alignment Framework",
  version: "1.0",
  published: "2026-09-23",
  route: "/tools/cx-it-alignment",
  methodology: "/methodology/cx-it-alignment",
  scale: { min: 1, max: 5, low: "Strongly disagree", high: "Strongly agree" },
  sides: [{ id: "cx", label: "CX perspective" }, { id: "it", label: "IT perspective" }],
  failAt: 2,
  gapAt: 2,
  what: "Where CX and IT see the same capability differently across strategy, data, platforms, AI and governance, where both sides agree it is missing, and which of those to act on first.",
  limits: [
    "It is only as good as the people who answer. One person rating both columns records their guess at the other side. For a real reading, the CX lead answers the CX column and the IT lead answers the IT column, passing the scenario link between them.",
    "The gap measures disagreement, never capability. An Aligned band means the two sides answered alike, and both can be low. Read the shared weaknesses beside the band.",
    "The score is a position on this rubric. It does not rank you against other organizations or give a percentile, because no sourced distribution of scores exists to compare against.",
    "All five areas carry equal weight. It recommends actions and a next diagnostic. It never recommends a vendor.",
  ],
  bands: [
    { id: "aligned", label: "Aligned", min: 0, max: 0.8, desc: "CX and IT answer these statements alike. Keep the joint planning that got you here, and check the shared weaknesses: agreement can also mean both sides see the same gap." },
    { id: "minor", label: "Minor Gaps", min: 0.8, max: 1.5, desc: "CX and IT see the same capabilities slightly differently. Work through the differences in a regular joint planning session." },
    { id: "significant", label: "Significant Gaps", min: 1.5, max: 2.5, desc: "CX and IT see the same capabilities in materially different ways. Differences this size tend to show up as friction, rework or delay in joint projects." },
    { id: "critical", label: "Critical Misalignment", min: 2.5, max: 5, desc: "CX and IT see these capabilities very differently. Agree on a shared view of where things stand today before you plan joint technology work." },
  ],
  dims: [
    { id: "strategy", name: "Strategy Alignment", weight: 1, next: "governance-model", pairs: [
      { cx: "CX has a documented strategy with measurable outcomes.", it: "IT has a technology roadmap that maps to the CX strategy.",
        align: "Put the CX strategy and the IT roadmap side by side and mark each CX outcome with the roadmap item that delivers it. Resolve every outcome that has no item.",
        build: "Write the CX strategy's measurable outcomes first, then build the technology roadmap items against them together." },
      { cx: "CX priorities are clearly communicated to IT leadership.", it: "IT understands which CX initiatives require technology investment.",
        align: "Hold a joint review where CX states its top five priorities and IT states the technology each needs; record where the two lists differ.",
        build: "Set a standing CX and IT priorities review, monthly or quarterly, with one shared list as its output." },
      { cx: "CX leadership participates in technology selection decisions.", it: "IT involves CX stakeholders in architecture and vendor decisions.",
        align: "Agree in writing which technology decisions require CX sign-off and which require IT sign-off.",
        build: "Add a CX seat to the architecture and vendor selection process, with a named person and decision rights." },
    ]},
    { id: "data", name: "Data & Integration", weight: 1, next: "platform-decision", pairs: [
      { cx: "CX teams have access to the customer data they need for decisions.", it: "IT provides reliable, governed data pipelines to CX systems.",
        align: "List the decisions CX says it cannot make for lack of data and have IT confirm, for each, whether the data exists and where it stops.",
        build: "Pick the three CX decisions with the least data behind them and scope one governed pipeline for each." },
      { cx: "Customer journey data is connected across channels and touchpoints.", it: "The integration architecture lets data flow between systems.",
        align: "Trace one customer journey across every channel together and mark where CX sees a break and where IT sees one.",
        build: "Map the systems one high-volume journey touches and fund the integration for the first break in it." },
      { cx: "CX can measure outcomes such as CSAT (customer satisfaction), FCR (first contact resolution) and customer effort with data it trusts.", it: "IT maintains data quality standards and monitoring for CX systems.",
        align: "Agree the definition, source system and owner for each CX outcome metric, then have IT confirm its data quality checks cover them.",
        build: "Define each outcome metric's source and add data quality monitoring to the systems that feed it." },
    ]},
    { id: "platforms", name: "Platform & Tooling", weight: 1, next: "platform-decision", pairs: [
      { cx: "CX teams have the platforms they need to execute their strategy.", it: "IT can support, secure, and maintain the platforms CX depends on.",
        align: "List the platforms CX depends on and have IT rate how well it can support each. Plan around the ones where the answers differ.",
        build: "Inventory the platform capabilities the CX strategy needs and the support model for each before the next budget cycle." },
      { cx: "New CX tools can be evaluated and deployed in well under 12 months.", it: "IT has a process for evaluating and onboarding new CX technology.",
        align: "Walk one recent CX tool request through the IT onboarding process together and note where it stalled.",
        build: "Agree a written intake and evaluation path for new CX tools, with a target time for each stage." },
      { cx: "The tools agents use work well and make their job easier.", it: "IT provides agent desktops that are reliable and fast enough.",
        align: "Sit with agents for an hour together and record the friction points CX sees and the performance issues IT measures.",
        build: "Measure agent desktop load times and clicks per contact for the top contact types, then fix the worst step." },
    ]},
    { id: "ai", name: "AI & Automation", weight: 1, next: "ai-readiness", pairs: [
      { cx: "CX has identified which interactions should be automated.", it: "IT can assess whether the data and infrastructure support AI deployment.",
        align: "Put CX's automation candidates in front of IT and have IT mark each for data and infrastructure readiness.",
        build: "Rank the interaction types by volume and simplicity, then have IT assess data readiness for the top three." },
      { cx: "CX defines the quality and governance standards for AI interactions.", it: "IT builds the guardrails, testing and monitoring for AI.",
        align: "Write the CX quality standard for AI interactions and map each requirement to the IT guardrail or test that enforces it.",
        build: "Draft an AI interaction standard and a matching test and monitoring plan before the next deployment." },
      { cx: "CX measures AI performance against customer experience outcomes.", it: "IT manages AI model performance, accuracy and scale.",
        align: "Agree one shared scorecard that puts CX outcome measures and IT model measures on the same page.",
        build: "Define the customer outcome and the model measure for each AI use case before it goes live." },
    ]},
    { id: "governance", name: "Governance & Ownership", weight: 1, next: "governance-model", pairs: [
      { cx: "CX has defined ownership for experience outcomes across channels.", it: "IT has defined ownership for platform reliability and integration health.",
        align: "Write down who owns each experience outcome and who owns each platform it depends on, and resolve every mismatch.",
        build: "Name an owner for each channel's experience outcomes and for each supporting platform." },
      { cx: "CX and IT have a shared governance model for technology decisions.", it: "IT and CX jointly own the escalation path when a system problem affects customers.",
        align: "Compare how CX and IT each describe the governance and escalation path, and agree one written version.",
        build: "Set up a joint forum for technology decisions and a written escalation path for customer-impacting incidents." },
      { cx: "Budget decisions for CX technology involve both CX and IT input.", it: "IT can state what it costs to support each CX technology request.",
        align: "Review the last three CX technology budget decisions together and record who had input and what the support cost was.",
        build: "Add a support cost estimate from IT and a business case from CX to every CX technology budget request." },
    ]},
  ],
};
