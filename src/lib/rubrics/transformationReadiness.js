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
    "It measures how the respondent sees the organization's readiness. It does not audit the plan, the budget or the team, and two people in the same program can score it differently.",
    "The score is a position on this rubric. It is not a percentile and does not compare you with other programs, because no sourced distribution of scores exists.",
    "All six dimensions carry equal weight. A single missing prerequisite, such as no executive sponsor, can matter more than the average suggests, so read the checklist as well as the band.",
    "It recommends actions and a next diagnostic. It never recommends a vendor, and a Ready band is not a recommendation to buy.",
  ],
  bands: [
    { id: "notready", label: "Not Ready", min: 1, max: 1.5, dimFlag: "Close this gap", desc: "Pause. Close critical gaps before engaging vendors." },
    { id: "early", label: "Early Stage", min: 1.5, max: 2.5, dimFlag: "Close this gap", desc: "Phase 1 only: requirements and vendor evaluation." },
    { id: "developing", label: "Developing", min: 2.5, max: 3.5, dimFlag: "Monitor", desc: "Proceed with caution. Address gaps in parallel." },
    { id: "ready", label: "Ready", min: 3.5, max: 4.2, desc: "Proceed. Maintain governance rigor." },
    { id: "strong", label: "Strong", min: 4.2, max: 5.1, desc: "The rubric raises no blocking gap. Keep the governance that got you here." },
  ],
  dims: [
    { id: "leadership", name: "Leadership Alignment", weight: 1, next: "cx-it-alignment", criteria: [
      { text: "Executive sponsor is named, active, and has authority over budget and timeline.", action: "Name one executive sponsor with authority over the budget and the timeline, and put a standing review with them on the calendar." },
      { text: "CX, IT, and operations leadership agree on transformation objectives and success metrics.", action: "Get CX, IT and operations leaders to sign one page of objectives and the metrics that will judge them." },
      { text: "The business case has been approved with realistic ROI expectations (not vendor projections).", action: "Rebuild the business case on your own baselines and have finance approve it before any vendor projection is quoted." },
      { text: "There is organizational tolerance for a 6-12 month transition period with potential service dips.", action: "Agree in writing how much service dip is acceptable during transition, for how long, and who can stop the rollout." },
    ]},
    { id: "budget", name: "Budget + Timeline Realism", weight: 1, next: "tco-calculator", criteria: [
      { text: "Budget includes implementation, integration, training, parallel-run, and 6 months of contingency.", action: "Add implementation, integration, training, parallel running and six months of contingency to the budget as separate lines." },
      { text: "Timeline accounts for vendor selection (3-4mo), implementation (4-8mo), and stabilization (3-6mo).", action: "Re-plan the timeline with explicit phases for selection, implementation and stabilization, and date each one." },
      { text: "Dual-platform costs during migration are budgeted, not assumed to be zero.", action: "Price the months you will run both platforms and add that cost to the budget." },
      { text: "Budget exists for internal backfill or contractors to cover team members dedicated to the project.", action: "Budget the backfill or contractors that cover the people you move onto the project." },
    ]},
    { id: "team", name: "Team Capacity + Skills", weight: 1, next: "staffing-calculator", criteria: [
      { text: "A dedicated project team is identified with at least 50% allocation (not doing migration on the side).", action: "Name the project team and allocate each member at least half time, with their current work reassigned." },
      { text: "Technical resources (integration, telephony, data) are available or planned for hire.", action: "List the integration, telephony and data skills the project needs and name who covers each, internally or by hire." },
      { text: "Contact center SMEs (WFM, QA, training, ops) are included in the project team.", action: "Add WFM, QA, training and operations subject experts to the project team with named time commitments." },
      { text: "The team has experience with at least one prior platform migration or major technology change.", action: "Bring in someone who has run a platform migration, as a team member or an advisor, before selection starts." },
    ]},
    { id: "vendor", name: "Vendor Selection Maturity", weight: 1, next: "vendor-match", criteria: [
      { text: "Requirements are documented, weighted, and reflect actual operational needs.", action: "Write and weight the requirements from your operation's real contact types, then have operations sign them off." },
      { text: "At least 3 vendors evaluated with structured demos using your scenarios, not vendor scripts.", action: "Run structured demos with at least three vendors on your own scenarios and score each against the weighted requirements." },
      { text: "Reference checks completed with orgs of similar size, vertical, and complexity.", action: "Call references that match your size, vertical and complexity, with a written list of questions." },
      { text: "Contract terms reviewed for rate locks, exit clauses, SLAs, and data portability.", action: "Review rate locks, exit clauses, service levels and data portability before any commercial commitment." },
    ]},
    { id: "technical", name: "Technical Readiness", weight: 1, next: "platform-decision", criteria: [
      { text: "Integration dependencies mapped (CRM, WFM, QA, knowledge, identity, payments, reporting).", action: "Map every system the platform must connect to, with the owner and the integration method for each." },
      { text: "Data migration strategy defined (what moves, what stays, what gets rebuilt).", action: "Decide what data moves, what stays and what gets rebuilt, and who approves each call." },
      { text: "Network and telephony requirements assessed (BYOC, SIP, bandwidth, latency).", action: "Assess network and telephony needs, including carrier, SIP, bandwidth and latency, with IT before selection." },
      { text: "Security and compliance requirements documented and validated against the new platform.", action: "Document the security and compliance requirements and have each shortlisted platform evidence how it meets them." },
    ]},
    { id: "change", name: "Change Management", weight: 1, next: "roadmap-builder", criteria: [
      { text: "Training plan exists for agents, supervisors, QA, WFM, and IT (not just vendor certification).", action: "Write a training plan for agents, supervisors, QA, WFM and IT that covers your processes as well as the product." },
      { text: "Communication plan addresses all stakeholders: frontline, management, executive, customer-facing.", action: "Write a communication plan that names what each stakeholder group hears, when and from whom." },
      { text: "Phased rollout strategy defined (not a hard cutover for the entire operation).", action: "Plan a phased rollout with a pilot group and an exit test for each phase." },
      { text: "Success metrics defined for each phase: stabilization, adoption, and outcome metrics.", action: "Set stabilization, adoption and outcome metrics for each phase, with the threshold that allows the next one." },
    ]},
  ],
};
