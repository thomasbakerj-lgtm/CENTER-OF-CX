/* Governance & Operating Model, version 1.0. An ownership model.
 *
 * Published at /methodology/governance-model from this object. Each of the 30 decisions
 * gets one accountable role and, optionally, one contributing role. The model does not
 * score: governance quality does not average, and one unowned decision can matter more
 * than twenty-nine clean ones. It raises findings under six published rules.
 *
 * The roles keep their original order, so a link made before this version still opens
 * with every assignment intact. Risk & Compliance is new and appended, so it starts
 * unassigned on an old link.
 *
 * Each decision states the role that most commonly owns it (`common`), and the roles
 * that must be involved as owner or contributor (`involve`). A plain role id is a medium
 * finding when missing; five decisions carry control or budget risk, and a missing
 * function there is high: AI guardrails, data governance and vendor contracts without
 * Risk & Compliance, CX investment priorities without the CX Leader, and the technology
 * budget without Finance. A different owner is shown
 * as a question to confirm, never as an error: an operating model can be deliberate.
 */
export const GOVERNANCE = {
  id: "governance-model",
  kind: "ownership",
  title: "Governance & Operating Model",
  version: "1.0",
  published: "2026-09-23",
  route: "/tools/governance-model",
  methodology: "/methodology/governance-model",
  minAssigned: 20,
  what: "Who is accountable for each of 30 CX decisions, who contributes, and where the operating model leaves a decision unowned, overloads one function, gives a function influence without authority, or leaves out a function a decision needs.",
  limits: [
    "It records how the respondent sees ownership today. It does not observe how decisions are actually made, and two people in the same organization can map it differently.",
    "The common owner for each decision is the pattern seen most often, stated so a different choice can be confirmed. It is a question to confirm, never a rule, and a deliberate operating model can differ from it.",
    "It does not score. There is no percentile and no comparison with other organizations, because no sourced distribution of operating models exists.",
    "It names findings, actions and a next diagnostic. It never recommends a vendor or an organization chart.",
  ],
  roles: [
    { id: "cx", label: "CX Leader" },
    { id: "ops", label: "CC Ops" },
    { id: "it", label: "IT / Arch" },
    { id: "ai", label: "AI / Data" },
    { id: "fin", label: "Finance" },
    { id: "risk", label: "Risk & Compliance" },
  ],
  rules: {
    unowned: { severity: "critical", title: "Unowned decision", test: "No accountable role is named.",
      action: "Name one accountable role for {item}, and record who contributes." },
    involve: { severity: "medium", title: "Function missing", test: "A function this decision needs is neither accountable nor contributing. High for the five decisions that carry control or budget risk (marked on each), medium otherwise.",
      action: "Add {role} as a contributor to {item}, or record why it is not needed." },
    bottleneck: { severity: "high", title: "Bottleneck", test: "One role is accountable for at least twice an even share of the 30 decisions, rounded up.",
      action: "Move some of the {count} decisions {role} owns to the function closest to the work, starting with the ones it only approves." },
    advisory: { severity: "medium", title: "Influence without authority", test: "A role contributes to 5 or more decisions and is accountable for none.",
      action: "Give {role} accountability for at least one decision it already shapes, or reduce its contributing load." },
    fragmented: { severity: "medium", title: "Fragmented domain", test: "Four or more different roles are accountable inside one five-decision domain.",
      action: "Name one role to coordinate {domain}, or consolidate its decisions under fewer owners." },
    divergence: { severity: "info", title: "Different from the common pattern", test: "The accountable role differs from the role that most commonly owns this decision.",
      action: "Confirm that {role} owning {item} is deliberate; the common owner is {common}." },
  },
  advisoryMin: 5,
  fragmentedMin: 4,
  domains: [
    { id: "strategy", name: "CX Strategy & Vision", items: [
      { text: "Overall CX strategy and roadmap", common: "cx" },
      { text: "Customer journey design and mapping", common: "cx" },
      { text: "Experience standards and brand alignment", common: "cx" },
      { text: "CX investment prioritization", common: "cx", involve: [{ role: "cx", severity: "high" }, "fin"] },
      { text: "Cross-functional CX governance", common: "cx" },
    ]},
    { id: "operations", name: "Contact Center Operations", items: [
      { text: "Service level management and SLAs", common: "ops" },
      { text: "Workforce management and scheduling", common: "ops" },
      { text: "Quality assurance and coaching", common: "ops" },
      { text: "Agent performance and development", common: "ops" },
      { text: "Escalation design and exception handling", common: "ops", involve: ["cx"] },
    ]},
    { id: "technology", name: "Technology & Platforms", items: [
      { text: "CCaaS platform selection and management", common: "it", involve: ["ops"] },
      { text: "Integration architecture and maintenance", common: "it", involve: ["it"] },
      { text: "Agent desktop and tooling", common: "it", involve: ["ops"] },
      { text: "Telephony and channel infrastructure", common: "it" },
      { text: "Technology vendor management", common: "it" },
    ]},
    { id: "ai", name: "AI & Automation", items: [
      { text: "AI strategy and use case prioritization", common: "cx", involve: ["ai"] },
      { text: "Bot and IVA design and performance", common: "ai", involve: ["ops"] },
      { text: "Agent assist deployment and tuning", common: "ai", involve: ["ops"] },
      { text: "AI governance, testing, and guardrails", common: "ai", involve: [{ role: "risk", severity: "high" }] },
      { text: "Automation ROI measurement", common: "fin", involve: ["ai"] },
    ]},
    { id: "analytics", name: "Analytics & Intelligence", items: [
      { text: "Reporting and dashboards", common: "ai" },
      { text: "Interaction analytics (speech, text, sentiment)", common: "ai" },
      { text: "Voice of customer and feedback programs", common: "cx" },
      { text: "Data quality and governance", common: "ai", involve: [{ role: "risk", severity: "high" }] },
      { text: "Insight-to-action process", common: "cx", involve: ["ops"] },
    ]},
    { id: "budget", name: "Budget & Vendor Management", items: [
      { text: "CX technology budget ownership", common: "cx", involve: [{ role: "fin", severity: "high" }] },
      { text: "Vendor contract negotiation and renewal", common: "fin", involve: [{ role: "risk", severity: "high" }] },
      { text: "TCO modeling and cost optimization", common: "fin" },
      { text: "Build vs buy decisions", common: "it", involve: ["cx"] },
      { text: "Professional services oversight", common: "it" },
    ]},
  ],
  /* The next diagnostic. CX Strategy and Technology are where CX and IT decisions meet;
     when at least half of the critical and high findings sit there, the ownership problem
     is a CX and IT problem first. */
  next: { cxIt: "cx-it-alignment", otherwise: "roadmap-builder", domains: ["strategy", "technology"] },
};
