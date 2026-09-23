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
    ],
  },
  "attrition-cost": {
    name: "Attrition Cost",
    route: "/tools/attrition-cost",
    next: [
      { to: "staffing-calculator", why: "Size the backfill capacity turnover forces you to carry." },
      { to: "business-case-builder", why: "Test whether a retention fix pays back before any technology does." },
    ],
  },
  "license-gap": {
    name: "License Bundle Gap",
    route: "/tools/license-gap",
    next: [
      { to: "tco-calculator", why: "Carry the effective seat cost into the full cost of ownership." },
      { to: "business-case-builder", why: "Decide whether the gap justifies a change or a renegotiation." },
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
};

/* Resolved edges for one tool, in display order. Unknown tool or unknown
   target returns nothing, so a bad id renders no card rather than a dead link. */
export function nextFor(toolId) {
  const node = Object.prototype.hasOwnProperty.call(JOURNEY, toolId) ? JOURNEY[toolId] : null;
  if (!node) return [];
  return node.next
    .filter((e) => Object.prototype.hasOwnProperty.call(JOURNEY, e.to) && e.to !== toolId)
    .map((e) => ({ to: e.to, name: JOURNEY[e.to].name, href: JOURNEY[e.to].route, why: e.why }));
}
