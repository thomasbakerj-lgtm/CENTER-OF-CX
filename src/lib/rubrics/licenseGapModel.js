/* License Bundle Gap Checker, version 1.0. A calculator method (kind "calc").
 *
 * Published at /methodology/license-gap from this object. The engine lives inside
 * LicenseBundleGapChecker.jsx, so this page carries its worked example as pins, and
 * methods.test.mjs recomputes every pin from the tool's own engine.
 */
import { benchmark, BENCHMARK_SOURCES, benchmarksForTool } from "../benchmarks.js";

const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");
const usd2 = (n) => "$" + n.toFixed(2);
const b = (id) => benchmark(id);

/* The pins: the tool's opening quote plus a 180-seat commit, a 7% renewal uplift and 20
   seats added within 18 months. Each is recomputed from the engine. */
export const LICENSE_PINS = {
  committedSeats: 180, uplift: 7, seats18mo: 20,
  billable: 150, baseMonthly: 18750, addOnMonthly: 9000, licenseMonthly: 27750, quotedSeat: 125, effSeat: 185,
  gapPct: 48, hiddenAnnual: 108000, annualPlatform: 333000, commitExpSeats: 30, commitExpAnnual: 66600,
  year3Seat: 211.8065, exp18Annual: 44400,
};
const P = LICENSE_PINS;

export const LICENSE_MODEL = {
  id: "license-gap",
  kind: "calc",
  title: "License Bundle Gap Checker",
  version: "1.0",
  published: "2026-09-25",
  route: "/tools/license-gap",
  methodology: "/methodology/license-gap",
  what: "How the License Bundle Gap Checker reconciles a quoted seat price with what the platform costs once required add-ons, edition upgrades and usage fees are in, and what commits, renewal uplift and growth add.",
  claimClasses: "Every figure is arithmetic on the prices and seat counts you enter. The default seat and module prices are planning values, labelled as heuristics; a priced driver still at its default grades evidence Directional. This tool prices contract cost, which is cash out the door, so there is no realization to grade.",
  formulas: [
    { name: "Quoted seat", formula: "Sum of seat count × seat price across classes ÷ billable seats", note: "The vendor's headline, blended across agent, supervisor, admin and analyst seats." },
    { name: "Effective license seat", formula: "(Base + required per-seat add-ons + edition upgrades) ÷ billable seats", note: "Each add-on is priced on the seats it applies to: all, agents, agents and supervisors, and so on." },
    { name: "Platform seat-equivalent", formula: "(License monthly + usage fees) ÷ billable seats", note: "Usage fees scale with volume; they are spread across seats for comparison only." },
    { name: "Bundle gap", formula: "(Platform seat-equivalent − quoted seat) ÷ quoted seat", note: "The hidden annual is (platform monthly − base monthly) × 12, split into add-ons, edition upgrades and usage." },
    { name: "Commit exposure", formula: "max(0, committed seats − billable seats) × commit price × 12", note: "Priced at the license seat, the quoted seat or a custom rate, as you choose." },
    { name: "Year three seat", formula: "Effective license seat × (1 + renewal uplift)² + usage per seat", note: "Uplift applies to contracted license rates; usage is held flat." },
    { name: "Growth", formula: "Seats added within 18 months × platform seat-equivalent × 12", note: "What rate-locking those seats now protects." },
  ],
  bands: [
    { label: "Gap card colour", range: "Amber above " + b("lbg.band.gapAmber") + "%, red above " + b("lbg.band.gapRed") + "%", meaning: "Colour only; the shared severity bands." },
    { label: "Plausibility guards", range: "Gap above " + b("lbg.guard.gapPct") + "%, or an effective seat above " + b("lbg.guard.seatMultiple") + " times the quote", meaning: "Almost always a miscoded line; confidence holds Directional." },
    { label: "One line dominates", range: "A single recurring line above " + (b("lbg.guard.recurDominance") * 100).toFixed(0) + "% of recurring cost, with two or more lines", meaning: "The sign of a one-time fee coded as recurring; confidence holds below Finance-grade until confirmed." },
    { label: "Evidence", range: "Estimate, vendor email, proposal, order form, SKU schedule, contract", meaning: "A document reaches Planning-grade; confirmed in writing, Finance-grade. Any default price keeps it Directional." },
  ],
  bandsNote: "Bundled-but-unused modules are listed as negotiation leverage, never as recoverable savings.",
  constants: () => [
    ...benchmarksForTool("license-gap").map((e) => e.id),
  ].map((id) => ({ id, ...BENCHMARK_SOURCES[id] })),
  example: {
    note: "Computed by the tool's own engine at its opening quote (150 agents at the default seat price, WEM, QA and analytics as per-seat add-ons, recording included), plus a " + P.committedSeats + "-seat commit, a " + P.uplift + "% renewal uplift and " + P.seats18mo + " seats added within 18 months.",
    inputs: [["Seats", "150 agents at $125"], ["Add-ons", "WEM $25 and QA $15 on agents and supervisors, analytics $20 on all seats"], ["Contract", P.committedSeats + " committed seats at the license rate, " + P.uplift + "% annual uplift, " + P.seats18mo + " seats within 18 months"]],
    steps: [
      ["Quoted seat", usd(P.baseMonthly) + " ÷ " + P.billable + " = " + usd(P.quotedSeat)],
      ["Effective seat", "(" + usd(P.baseMonthly) + " + " + usd(P.addOnMonthly) + ") ÷ " + P.billable + " = " + usd(P.effSeat) + "; no usage, so the platform seat-equivalent is the same"],
      ["Bundle gap", "(" + usd(P.effSeat) + " − " + usd(P.quotedSeat) + ") ÷ " + usd(P.quotedSeat) + " = " + P.gapPct + "%, " + usd(P.hiddenAnnual) + " a year hidden; " + usd(P.annualPlatform) + " a year in all"],
      ["Commit exposure", P.commitExpSeats + " idle seats × " + usd(P.effSeat) + " × 12 = " + usd(P.commitExpAnnual) + " a year"],
      ["Year three seat", usd(P.effSeat) + " × 1.07² = " + usd2(P.year3Seat)],
      ["Growth", P.seats18mo + " × " + usd(P.effSeat) + " × 12 = " + usd(P.exp18Annual) + " a year"],
    ],
  },
  limits: [
    "The default prices exist so the tool opens on a runnable case. Replace them with the figures from your quote; until you do, evidence stays Directional.",
    "Usage fees are normalized across seats for comparison only. They move with volume, so cap or commit them in the contract.",
    "The tool prices what you would pay. It does not judge whether a module is worth buying; Platform Decision and TCO take that up.",
  ],
};
