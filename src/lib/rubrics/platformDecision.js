/* Platform Decision: the renewal gate, version 1.0. A renewal model (kind "renewal").
 *
 * Published at /methodology/platform-decision from this object, and read by the engine in
 * src/lib/renewal.js. Truth type: the buyer's own view of their current platform. It reads
 * no vendor research, no vendor score and no other tool's verdict.
 *
 * For each of the 35 needs across seven layers the buyer records three things: how well
 * the current platform does it (1 to 5, or "don't know"), how they know (seen in their own
 * production, or the vendor says so), and whether it matters for the next contract term
 * (must-have, nice-to-have, not needed). Only needs that matter count. A must-have rated 1
 * or 2 is a blocker whatever the average says. A "don't know" is never scored as weak: it
 * becomes a proof request for the vendor. The renewal clock (months to the notice date,
 * the term offered, whether exit and data terms are known) decides whether there is time
 * to act on the answer.
 *
 * The previous version averaged the ratings and mapped the average to Stay, Extend,
 * Evaluate or Replace on unpublished cut points; one critical gap among strong answers
 * could read as Stay. Old links keep every rating; each need reads as a must-have seen in
 * production until the buyer changes it.
 */
export const PLATFORM_DECISION = {
  id: "platform-decision",
  kind: "renewal",
  title: "Platform Decision",
  version: "1.0",
  published: "2026-09-24",
  route: "/tools/platform-decision",
  methodology: "/methodology/platform-decision",
  truthType: "Buyer's own view of the current platform. Reads no vendor research, score or other tool's verdict.",
  what: "Whether to renew your current contact center platform as it is, renew with conditions written into the contract, add a specialist for a layer, or run an evaluation, and whether there is time before the notice date to do it.",
  ratings: [
    { value: 1, label: "Critical gap" },
    { value: 2, label: "Major gap" },
    { value: 3, label: "Adequate" },
    { value: 4, label: "Strong" },
    { value: 5, label: "Excellent" },
  ],
  unknown: { value: "unknown", label: "Don't know" },
  needLevels: [
    { id: "must", label: "Must-have" },
    { id: "nice", label: "Nice-to-have" },
    { id: "none", label: "Not needed" },
  ],
  evidence: [
    { id: "production", label: "Seen in our production" },
    { id: "vendor", label: "Vendor says so" },
  ],
  thresholds: {
    gapAt: { value: 2, kind: "rule", text: "rating at or below which a need is a gap" },
    specialistShare: { value: 0.5, kind: "heuristic", text: "share of a layer's must-haves that are gaps before the layer needs more than a contract fix" },
    sprawlLayers: { value: 3, kind: "heuristic", text: "layers needing a specialist before the stack itself should be evaluated" },
    evaluationMonths: { value: 6, kind: "heuristic", text: "months to run an evaluation before the notice date" },
    negotiationMonths: { value: 3, kind: "heuristic", text: "months to negotiate conditions before the notice date" },
    longTermYears: { value: 3, kind: "heuristic", text: "term length, in years, that locks conditions in for too long without a remedy" },
  },
  /* Layer outcomes, most serious last. A core layer is what the contact center platform
     itself is; a gap there is not closed by adding a product beside it. */
  outcomes: [
    { id: "renew", label: "Renew as is", test: "No must-have is a gap and none needs proof." },
    { id: "conditions", label: "Renew with conditions", test: "Some must-haves need proof, or fewer than half of the layer's must-haves are gaps. Write the proof, the fix or a dated roadmap commitment with a remedy into the renewal." },
    { id: "specialist", label: "Add a specialist", test: "Half or more of the layer's must-haves are gaps, on a layer a specialist product can serve beside the platform." },
    { id: "market", label: "Test the market", test: "Half or more of the layer's must-haves are gaps, on a core layer of the platform itself." },
  ],
  gates: [
    { id: "renew", label: "Renew", test: "Every layer can renew as is." },
    { id: "conditions", label: "Renew with conditions", test: "At least one layer needs conditions or a specialist, and no evaluation trigger fires." },
    { id: "evaluate", label: "Run an evaluation", test: "A core layer needs a market test, or {sprawlLayers} or more layers need a specialist." },
  ],
  rules: {
    blocker: { severity: "high", title: "Must-have gap", test: "A must-have is rated {gapAt} or below.",
      action: "Close {need} before renewal: get the fix, or a dated roadmap commitment with a remedy if it slips, written into the contract." },
    proof: { severity: "medium", title: "Proof needed", test: "A must-have is rated 3 or above on the vendor's word, or its rating is not known.",
      action: "Ask the vendor to show {need} working in production, at a customer like you or in your own environment, before you sign." },
    niceGap: { severity: "info", title: "Nice-to-have gap", test: "A nice-to-have is rated {gapAt} or below. It changes no outcome.",
      action: "Note {need} for the next roadmap review; it does not decide this renewal." },
    specialist: { severity: "high", title: "Layer needs a specialist", test: "Half or more of a non-core layer's must-haves are gaps. Heuristic share.",
      action: "Price a specialist for {layer} and check how it integrates before you renew the platform around it." },
    market: { severity: "critical", title: "Core layer needs a market test", test: "Half or more of a core layer's must-haves are gaps. Heuristic share.",
      action: "Test the market for {layer}: the platform itself does not do what you need, and a product beside it will not close that." },
    sprawl: { severity: "critical", title: "Too many layers need specialists", test: "{sprawlLayers} or more layers need a specialist. Heuristic count.",
      action: "Evaluate the stack as a whole: {count} layers need products beside the platform, which is a re-platform decision in pieces." },
    noTimeEvaluate: { severity: "critical", title: "No time to evaluate", test: "The gate is Run an evaluation and fewer than {evaluationMonths} months remain to the notice date. Heuristic months.",
      action: "Negotiate a short extension instead of a full term: {months} months is too little to run an evaluation." },
    noTimeNegotiate: { severity: "high", title: "Little time to negotiate", test: "The gate needs conditions and fewer than {negotiationMonths} months remain to the notice date. Heuristic months.",
      action: "Start the renewal negotiation now: {months} months is little time to get conditions written in." },
    exitUnknown: { severity: "high", title: "Exit and data terms unknown", test: "The exit, data-export and transition terms of the current contract are not known.",
      action: "Get the exit, data-export and transition-assistance terms in front of you before the negotiation; run them through the Contract Risk Scanner." },
    longTerm: { severity: "medium", title: "Long term with open conditions", test: "The term offered is {longTermYears} years or more while the gate needs conditions or an evaluation. Heuristic years.",
      action: "Tie the {years}-year term to the conditions: an exit right or a price step if a committed fix slips, or a shorter term." },
    clockMissing: { severity: "info", title: "Renewal clock not entered", test: "Months to the notice date are not entered, so timing is not checked.",
      action: "Enter the months left to your notice date to check whether there is time to act." },
  },
  limits: [
    "It records how you see your current platform. It does not test the platform, and two people in the same operation can rate it differently; a rating seen in production carries more weight than one on the vendor's word, which is why the tool asks.",
    "The layers and needs describe a modern contact center stack. They are a checklist to rate against: mark anything you do not need as not needed, and it drops out of every outcome.",
    "The share, count and month thresholds are heuristics with no published source. They are shown as such; set your own if your procurement cycle differs.",
    "It never names or ranks a vendor. A market test starts from your requirements, which the RFP Builder turns into a structured request.",
  ],
  next: { contract: "contract-risk", price: "tco-calculator", market: "rfp-builder" },
  layers: [
    { n: 7, name: "Analytics + Governance", core: false, tool: "forecast-accuracy", category: "/vendors/analytics", categoryLabel: "Analytics and WEM vendors",
      needs: ["Real-time dashboards beyond canned reports", "AI-powered QA evaluating 100% of interactions", "Closed-loop feedback from analytics to routing + coaching", "Compliance recording with audit trails", "WFM forecast accuracy within 5% at interval level"] },
    { n: 6, name: "Routing + Orchestration", core: true, tool: "staffing-calculator", category: "/vendors/acd-routing", categoryLabel: "ACD and routing vendors",
      needs: ["Intent-driven routing (beyond skills-based matching)", "AI-first routing with graceful human escalation", "Cross-system orchestration (CCaaS + CRM + WFM)", "Dynamic priority based on customer value + predicted complexity", "Real-time intraday adjustment without manual intervention"] },
    { n: 5, name: "Conversation Management", core: true, tool: "aht-decomposition", category: "/vendors/digital-engagement", categoryLabel: "Digital engagement vendors",
      needs: ["Unified voice + digital from a single platform", "Cross-channel context continuity (chat to phone preserves history)", "Agent desktop consolidation (under 3 applications)", "Messaging channels (WhatsApp, RCS, Apple Business Chat)", "Async conversation support with SLA management"] },
    { n: 4, name: "Reasoning + Planning", core: false, tool: "ai-deflection", category: "/vendors/iva", categoryLabel: "IVA vendors",
      needs: ["LLM-native IVA (not purely intent-based architecture)", "Real-time agent assist during conversation (not post-call)", "Knowledge AI with RAG grounding on your enterprise data", "Autonomous task execution (actions, not just text)", "Guardrails preventing hallucination and policy violations"] },
    { n: 3, name: "Policy + Guardrails", core: false, tool: "contract-risk", category: "/vendors/payments", categoryLabel: "Payments and identity vendors",
      needs: ["PCI fully descoped with tokenization", "AI guardrails for every customer-facing decision", "Identity verification consistent across all channels", "Bias detection and fairness monitoring for AI", "Audit trails for automated decisions"] },
    { n: 2, name: "Workflow Execution", core: false, tool: "tco-calculator", category: "/platforms-and-tech", categoryLabel: "Platform architecture",
      needs: ["Top 10 workflows automated end-to-end", "API-triggered workflows (not just UI-initiated)", "Exception handling without forcing callbacks", "Cross-system data writes (not just reads)", "Workflow versioning and rollback capability"] },
    { n: 1, name: "Data Access", core: false, tool: "cx-it-alignment", category: "/platforms-and-tech", categoryLabel: "Data architecture",
      needs: ["Real-time CRM read/write from agent desktop + IVA", "Event streaming capturing interaction signals", "Clean customer data (deduplicated, current, complete)", "API access to billing, case management, and ERP", "Data governance with documented ownership"] },
  ],
};
