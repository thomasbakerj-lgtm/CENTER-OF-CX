/* Transformation Readiness Scorecard rubric, version 1.0.
 *
 * Published at /methodology/transformation-readiness from this object. The statements,
 * dimension order and band cut points are the ones the scorecard has always used, so
 * scores and bands are unchanged by the move into a rubric. The per-dimension flags the
 * results page always showed ("close this gap" below 2.5, "monitor" from 2.5 to 3.5)
 * were unpublished thresholds; they are the band edges, so each band now states the
 * flag it gives a dimension. What is new is the action each statement calls for when it
 * is answered at or below the fail line, and the diagnostic each dimension names when
 * it is the weakest.
 */
export const TRANSFORMATION_READINESS = {
  id: "transformation-readiness",
  title: "Transformation Readiness Scorecard",
  version: "1.0",
  published: "2026-09-23",
  route: "/tools/transformation-readiness",
  methodology: "/methodology/transformation-readiness",
  scale: { min: 1, max: 5, low: "Strongly disagree", high: "Strongly agree" },
  failAt: 2,
  what: "Whether your organization is ready to commit budget to a platform transformation, across leadership, budget, team, vendor selection, technical readiness and change management, and which gaps to close before you do.",
  limits: [
    "It records how the respondent, the person answering, sees the organization's readiness. Nobody audits the plan, the budget or the team, so two people in the same program can score it differently.",
    "The score is a position on this rubric. It does not rank you against other programs or give a percentile, because no sourced distribution of scores exists to compare against.",
    "All six dimensions carry equal weight. A single missing prerequisite, such as no executive sponsor, can matter more than the average suggests, so read the checklist as well as the band.",
    "It recommends actions and a next diagnostic. It never recommends a vendor. A Ready band means the rubric found no blocking gap; the decision to buy stays with you.",
  ],
  bands: [
    { id: "notready", label: "Not Ready", min: 1, max: 1.5, dimFlag: "Close this gap", desc: "Pause. Close the critical gaps before you talk to vendors." },
    { id: "early", label: "Early Stage", min: 1.5, max: 2.5, dimFlag: "Close this gap", desc: "Go only as far as the first phase: write requirements and evaluate vendors. Hold the commitment until the gaps close." },
    { id: "developing", label: "Developing", min: 2.5, max: 3.5, dimFlag: "Monitor", desc: "Proceed with care, and close the flagged gaps alongside the work." },
    { id: "ready", label: "Ready", min: 3.5, max: 4.2, desc: "Proceed, and keep governance as tight as it is now." },
    { id: "strong", label: "Strong", min: 4.2, max: 5.1, desc: "The rubric raises no blocking gap. Keep the governance that got you here." },
  ],
  dims: [
    { id: "leadership", name: "Leadership Alignment", weight: 1, next: "cx-it-alignment", criteria: [
      { text: "A named executive sponsor is active and has authority over the budget and the timeline.", action: "Name one executive sponsor with authority over the budget and the timeline, and put a standing review with them on the calendar." },
      { text: "CX, IT and operations leaders agree on the objectives and on the metrics that will show success.", action: "Get CX, IT and operations leaders to sign one page of objectives and the metrics that will judge them." },
      { text: "The business case is approved, with return expectations built on your own numbers. Vendor projections are kept out of it.", action: "Rebuild the business case on your own baselines and have finance approve it before any vendor projection is quoted." },
      { text: "The organization can tolerate a 6 to 12 month transition, including possible dips in service.", action: "Agree in writing how much service dip is acceptable during transition, for how long, and who can stop the rollout." },
    ]},
    { id: "budget", name: "Budget + Timeline Realism", weight: 1, next: "tco-calculator", criteria: [
      { text: "The budget covers implementation, integration, training, running old and new platforms in parallel, and 6 months of contingency.", action: "Add implementation, integration, training, parallel running and six months of contingency to the budget as separate lines." },
      { text: "The timeline allows for vendor selection (3 to 4 months), implementation (4 to 8 months) and stabilization (3 to 6 months).", action: "Re-plan the timeline with explicit phases for selection, implementation and stabilization, and date each one." },
      { text: "The cost of running two platforms at once during migration is in the budget.", action: "Price the months you will run both platforms and add that cost to the budget. Plans often leave it at zero." },
      { text: "There is budget for backfill or contractors to cover the work of people moved onto the project.", action: "Budget the backfill or contractors that cover the people you move onto the project." },
    ]},
    { id: "team", name: "Team Capacity + Skills", weight: 1, next: "staffing-calculator", criteria: [
      { text: "A named project team gives at least 50% of its time to the project, with its other work covered.", action: "Name the project team and allocate each member at least half time, with their current work reassigned." },
      { text: "Technical people (integration, telephony, data) are available, or their hiring is planned.", action: "List the integration, telephony and data skills the project needs and name who covers each, internally or by hire." },
      { text: "Contact center subject experts (workforce management, quality assurance, training, operations) are on the project team.", action: "Add workforce management (WFM), quality assurance (QA), training and operations experts to the project team, each with a named time commitment." },
      { text: "Someone on the team has been through at least one platform migration or major technology change.", action: "Bring in someone who has run a platform migration, as a team member or an advisor, before selection starts." },
    ]},
    { id: "vendor", name: "Vendor Selection Maturity", weight: 1, next: "vendor-match", criteria: [
      { text: "Requirements are written down, weighted, and drawn from how the operation actually works.", action: "Write and weight the requirements from your operation's real contact types, then have operations sign them off." },
      { text: "At least 3 vendors have given structured demos of your own scenarios, with their standard scripts set aside.", action: "Run structured demos with at least three vendors on your own scenarios and score each against the weighted requirements." },
      { text: "Reference checks are done with organizations of similar size, industry and complexity.", action: "Call references that match your size, industry and complexity, with a written list of questions." },
      { text: "Contract terms are reviewed for rate locks, exit clauses, SLAs (service level agreements) and data portability.", action: "Review rate locks, exit clauses, service levels and data portability before any commercial commitment." },
    ]},
    { id: "technical", name: "Technical Readiness", weight: 1, next: "platform-decision", criteria: [
      { text: "Every system the platform depends on is mapped (CRM, WFM, QA, knowledge, identity, payments, reporting).", action: "Map every system the platform must connect to, with the owner and the integration method for each." },
      { text: "The data migration plan says what moves, what stays and what gets rebuilt.", action: "Decide what data moves, what stays and what gets rebuilt, and who approves each call." },
      { text: "Network and telephony needs are assessed: BYOC (bring your own carrier), SIP trunking, bandwidth and latency.", action: "Assess network and telephony needs, including carrier, SIP, bandwidth and latency, with IT before selection." },
      { text: "Security and compliance requirements are written down and checked against the new platform.", action: "Document the security and compliance requirements and have each shortlisted platform evidence how it meets them." },
    ]},
    { id: "change", name: "Change Management", weight: 1, next: "roadmap-builder", criteria: [
      { text: "A training plan covers agents, supervisors, QA, WFM and IT, and goes beyond the vendor's product certification to your own processes.", action: "Write a training plan for agents, supervisors, QA, WFM and IT that covers your processes as well as the product." },
      { text: "A communication plan reaches every group: frontline, management, executives and customer-facing teams.", action: "Write a communication plan that names what each stakeholder group hears, when and from whom." },
      { text: "The rollout is phased, starting with a pilot group, so the whole operation never switches over on one day.", action: "Plan a phased rollout with a pilot group and an exit test for each phase." },
      { text: "Each phase has success metrics for stabilization, adoption and outcomes.", action: "Set stabilization, adoption and outcome metrics for each phase, with the threshold that allows the next one." },
    ]},
  ],
};
