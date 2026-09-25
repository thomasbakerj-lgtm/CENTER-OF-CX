// src/lib/journey.js
// The Center of CX - canonical journey graph. Tracker 3-01.
//
// WHY THIS EXISTS
//
// Every V3 tool ends in ReportActions, and until this file every V3 tool
// pointed somewhere different by hand. The links were untracked in seven of
// nine tools, so no path a reader took was ever visible. And the journey the
// growth plan exists to prove, Cost per Contact to FCR Leakage to AI
// Deflection to Business Case, was broken at two of its three links: FCR
// Leakage pointed back to Cost per Contact, and AI Deflection never reached the
// Business Case at all.
//
// One graph, one renderer in ReportActions, one tracked event. The graph is
// data, so journey.test.mjs can prove it without a browser.
//
// RULES, each asserted in journey.test.mjs
//
//   1. Nodes are the tools that render ReportActions. Nothing else.
//   2. Targets are V3 nodes only. A first-time reader is never routed from a
//      hardened tool into an unaudited one (direction, 19 Sep 2026).
//   3. Every node's route matches its own ROUTE constant and a live App route.
//      That rule found the Business Case defect: ROUTE was
//      /tools/business-case-builder while the only live route is
//      /tools/business-case, so every shared scenario link 404'd.
//   4. Every node can reach business-case-builder. Every path ends at a decision.
//   5. The proving journey exists edge by edge.
//
// Edges are static on purpose. They are the hypothesis. next_step_click events
// are the test. Conditional routing on result severity waits until observed
// paths say which edges carry readers (tracker 3-02, Doctrine 11.3).

export const PROVING_JOURNEY = ["cost-per-contact", "fcr-leakage", "ai-deflection", "business-case-builder"];

export const DECISION_NODE = "business-case-builder";

export const JOURNEY = {
  "cost-per-contact": {
    name: "Cost per Contact",
    route: "/tools/cost-per-contact",
    next: [
      { to: "fcr-leakage", why: "Repeat contacts inflate cost per resolution. Find out how much of it is controllable." },
      { to: "channel-shift", why: "Test whether moving volume to digital changes the unit cost or just moves it." },
      { to: "aht-decomposition", why: "Break handle time into its parts before you price any reduction." },
    ],
  },
  "fcr-leakage": {
    name: "FCR Leakage",
    route: "/tools/fcr-leakage",
    next: [
      { to: "ai-deflection", why: "Test whether automation can absorb the repeat demand before anyone buys it." },
      { to: "business-case-builder", why: "Put the recoverable repeat burden into a case finance can challenge." },
    ],
  },
  "ai-deflection": {
    name: "AI Deflection Reality Check",
    route: "/tools/ai-deflection",
    next: [
      { to: "business-case-builder", why: "Carry the net automation number into a case with payback and risk." },
      { to: "tco-calculator", why: "Price the platform the deflection depends on over its full term." },
      { to: "ai-readiness", why: "Check the data and governance readiness the automation depends on." },
      { to: "contract-risk", why: "Test the contract for a price or volume floor before counting the saving." },
    ],
  },
  "channel-shift": {
    name: "Channel Shift Economics",
    route: "/tools/channel-shift",
    next: [
      { to: "ai-deflection", why: "Check how much shifted demand a bot resolves, net of repeats and escalations." },
      { to: "cost-per-contact", why: "Confirm the voice unit cost the shift is measured against." },
    ],
  },
  "staffing-calculator": {
    name: "Staffing Requirement",
    route: "/tools/staffing-calculator",
    next: [
      { to: "attrition-cost", why: "Turnover drains the capacity you just sized. Price the leak." },
      { to: "cost-per-contact", why: "Turn the FTE requirement into a cost per contact and per resolution." },
      { to: "shrinkage-planner", why: "Check the shrinkage factor the requirement is sized on." },
    ],
  },
  "attrition-cost": {
    name: "Attrition Cost",
    route: "/tools/attrition-cost",
    next: [
      { to: "staffing-calculator", why: "Size the backfill capacity turnover forces you to carry." },
      { to: "business-case-builder", why: "Test whether a retention fix pays back before any technology does." },
      { to: "occupancy-risk", why: "Test whether sustained occupancy is driving the exits you priced." },
    ],
  },
  "license-gap": {
    name: "License Bundle Gap",
    route: "/tools/license-gap",
    next: [
      { to: "tco-calculator", why: "Carry the effective seat cost into the full cost of ownership." },
      { to: "business-case-builder", why: "Decide whether the gap justifies a change or a renegotiation." },
      { to: "contract-risk", why: "Review the contract terms that come with the seat price." },
    ],
  },
  "tco-calculator": {
    name: "TCO Calculator",
    route: "/tools/tco-calculator",
    next: [
      { to: "license-gap", why: "Check the quoted seat against what you will actually pay per seat." },
      { to: "ai-deflection", why: "Pressure-test the containment savings this model prices." },
      { to: "business-case-builder", why: "Set the ownership cost against the benefit it has to earn." },
    ],
  },
  "business-case-builder": {
    name: "Business Case",
    route: "/tools/business-case",
    next: [
      { to: "tco-calculator", why: "Pressure test the cost side of the case over the full term." },
      { to: "fcr-leakage", why: "Confirm the benefit is recoverable repeat demand before you commit to it." },
    ],
  },
  "aht-decomposition": {
    name: "AHT Decomposition",
    route: "/tools/aht-decomposition",
    next: [
      { to: "staffing-calculator", why: "Carry the reduced handle time into the FTE requirement." },
      { to: "cost-per-contact", why: "See what the handle time reduction does to unit cost." },
      { to: "qa-scorecard", why: "Check whether the QA scorecard rewards the handle time behavior you want." },
    ],
  },
  "shrinkage-planner": {
    name: "Shrinkage Planner",
    route: "/tools/shrinkage-planner",
    next: [
      { to: "staffing-calculator", why: "Size the requirement on the shrinkage you just measured." },
      { to: "occupancy-risk", why: "Check whether lost time is pushing occupancy up." },
    ],
  },
  "occupancy-risk": {
    name: "Occupancy Risk",
    route: "/tools/occupancy-risk",
    next: [
      { to: "staffing-calculator", why: "Model the staffing that brings occupancy to target." },
      { to: "attrition-cost", why: "Price the turnover sustained occupancy drives." },
      { to: "schedule-adherence", why: "Check whether adherence gaps are creating the occupancy spikes." },
    ],
  },
  "forecast-accuracy": {
    name: "Forecast Accuracy",
    route: "/tools/forecast-accuracy",
    next: [
      { to: "staffing-calculator", why: "Model the staffing cost of the forecast error." },
      { to: "schedule-adherence", why: "Check whether adherence gaps compound forecast error." },
    ],
  },
  "schedule-adherence": {
    name: "Schedule Adherence",
    route: "/tools/schedule-adherence",
    next: [
      { to: "staffing-calculator", why: "Size the buffer needed to absorb adherence variance." },
      { to: "forecast-accuracy", why: "Separate forecast error from adherence loss." },
      { to: "occupancy-risk", why: "Check the occupancy load that adherence loss creates." },
    ],
  },
  "qa-scorecard": {
    name: "QA Scorecard",
    route: "/tools/qa-scorecard",
    next: [
      { to: "fcr-leakage", why: "Test whether the scores track the repeat contacts they should prevent." },
      { to: "attrition-cost", why: "Price the turnover that weak coaching and QA feedback drive." },
    ],
  },
  "contract-risk": {
    name: "Contract Risk Scanner",
    route: "/tools/contract-risk",
    next: [
      { to: "license-gap", why: "Check add-on and usage pricing behind the flagged terms." },
      { to: "tco-calculator", why: "Price the contract over its full term." },
      { to: "platform-decision", why: "Decide whether to renew, renew with conditions or evaluate." },
    ],
  },
  "platform-decision": {
    name: "Platform Decision",
    route: "/tools/platform-decision",
    next: [
      { to: "contract-risk", why: "Check the exit, data and renewal terms the negotiation depends on." },
      { to: "tco-calculator", why: "Price renewing against the alternative over the full term." },
      { to: "rfp-builder", why: "Turn the layer gaps into requirements when the gate says evaluate." },
    ],
  },
  "rfp-builder": {
    name: "RFP Requirement Builder",
    route: "/tools/rfp-builder",
    next: [
      { to: "vendor-match", why: "Build a starting list of vendors to send the RFP to." },
      { to: "contract-risk", why: "Know the contract terms to negotiate before responses arrive." },
      { to: "license-gap", why: "Price the add-ons vendors need to meet your requirements." },
      { to: "tco-calculator", why: "Price the vendors' offers over the full term." },
      { to: "platform-decision", why: "Test the incumbent against the same requirements." },
    ],
  },
  "vendor-match": {
    name: "Vendor Match",
    route: "/tools/vendor-match",
    next: [
      { to: "contract-risk", why: "Scan the terms each shortlisted vendor will propose." },
      { to: "tco-calculator", why: "Price the shortlisted platforms over the full term." },
      { to: "rfp-builder", why: "Turn your priorities into RFP requirements." },
    ],
  },
  "cx-maturity": {
    name: "CX Maturity Assessment",
    route: "/tools/cx-maturity",
    next: [
      { to: "ai-readiness", why: "Assess AI-specific readiness on the weakest dimensions." },
      { to: "transformation-readiness", why: "Test whether the organization can act on the gaps now." },
      { to: "qa-scorecard", why: "Operations is your weakest area; check that quality scores measure what customers experience." },
      { to: "platform-decision", why: "Technology is your weakest area; test the platform against the needs it must meet." },
      { to: "fcr-leakage", why: "Analytics is your weakest area; measure the repeat demand your data should be catching." },
    ],
  },
  "ai-readiness": {
    name: "AI Readiness Diagnostic",
    route: "/tools/ai-readiness",
    next: [
      { to: "ai-deflection", why: "Test how much demand automation can really absorb." },
      { to: "governance-model", why: "Define who owns AI decisions and guardrails." },
      { to: "cx-it-alignment", why: "Check that CX and IT agree on the foundations automation needs." },
      { to: "aht-decomposition", why: "Break handle time into its parts before automating any of it." },
      { to: "platform-decision", why: "Test whether the platform can carry the automation you plan." },
      { to: "attrition-cost", why: "Price the people side of the change before the technology side." },
    ],
  },
  "transformation-readiness": {
    name: "Transformation Readiness",
    route: "/tools/transformation-readiness",
    next: [
      { to: "roadmap-builder", why: "Sequence the program around the gaps you found." },
      { to: "governance-model", why: "Settle decision rights before the program starts." },
      { to: "cx-it-alignment", why: "Check that CX and IT agree before committing budget." },
      { to: "tco-calculator", why: "Price the full cost of the change before approval." },
      { to: "staffing-calculator", why: "Size the people the change needs at your service level." },
      { to: "vendor-match", why: "Build a starting list of platforms for the change." },
      { to: "platform-decision", why: "Test whether the current platform can carry the change." },
    ],
  },
  "cx-it-alignment": {
    name: "CX IT Alignment",
    route: "/tools/cx-it-alignment",
    next: [
      { to: "governance-model", why: "Assign ownership where CX and IT disagree." },
      { to: "platform-decision", why: "Test the platform against the gaps CX and IT agree on." },
      { to: "cx-maturity", why: "Place the alignment gaps in the wider maturity picture." },
      { to: "ai-readiness", why: "Check the readiness automation depends on where CX and IT diverge." },
    ],
  },
  "governance-model": {
    name: "Governance Model",
    route: "/tools/governance-model",
    next: [
      { to: "roadmap-builder", why: "Build a phased plan around the ownership gaps." },
      { to: "cx-it-alignment", why: "Check whether CX and IT agree on the owners you chose." },
    ],
  },
  "roadmap-builder": {
    name: "Roadmap Builder",
    route: "/tools/roadmap-builder",
    next: [
      { to: "business-case-builder", why: "Build the case the roadmap initiatives have to earn." },
      { to: "governance-model", why: "Name who owns each phase of the roadmap." },
    ],
  },
};

/* NextDiagnostic (tracker 3-02, P2 task 8). One next step per result, from this graph only. A tool whose engine
   chooses among its edges from the result (the weakest dimension, the renewal gate, the verdict) passes that choice,
   `{ to, because }` or a tool id; every other tool gets its first edge. A choice outside the tool's edges is ignored,
   so a page can never name a tool the graph does not route to, and journey.test.mjs proves every choice an engine
   can make is an edge. ReportActions renders the one step on the page and in the PDF. */
export function nextDiagnostic(toolId, choice = null) {
  const edges = nextFor(toolId);
  if (!edges.length) return null;
  const to = choice && typeof choice === "object" ? choice.to : choice;
  const picked = (to && edges.find((e) => e.to === to)) || edges[0];
  const because = choice && typeof choice === "object" && typeof choice.because === "string" && choice.because ? choice.because : null;
  return { ...picked, why: because || picked.why };
}

/* The PDF section for that one step. */
export function nextSection(toolId, choice = null) {
  const n = nextDiagnostic(toolId, choice);
  return n ? { title: "Next Step", type: "next", items: [{ tool: n.name, href: n.href, reason: n.why }] } : null;
}

/* The sections a report exports: the tool's own, less any next-step section, plus the one step. ReportActions builds
   the PDF with this, and the report harnesses read the same, so they check what the reader gets. */
export function withNextStep(toolId, sections, choice = null) {
  const s = nextSection(toolId, choice);
  return [...(sections || []).filter((x) => x && x.type !== "next"), ...(s ? [s] : [])];
}

/* Tool id for a live route, for engines that chose by route. */
export function toolAt(route) {
  const hit = Object.entries(JOURNEY).find(([, n]) => n.route === route);
  return hit ? hit[0] : null;
}

/* Resolved edges for one tool, in display order. Unknown tool or unknown
   target returns nothing, so a bad id renders no card rather than a dead link. */
export function nextFor(toolId) {
  const node = Object.prototype.hasOwnProperty.call(JOURNEY, toolId) ? JOURNEY[toolId] : null;
  if (!node) return [];
  return node.next
    .filter((e) => Object.prototype.hasOwnProperty.call(JOURNEY, e.to) && e.to !== toolId)
    .map((e) => ({ to: e.to, name: JOURNEY[e.to].name, href: JOURNEY[e.to].route, why: e.why }));
}
