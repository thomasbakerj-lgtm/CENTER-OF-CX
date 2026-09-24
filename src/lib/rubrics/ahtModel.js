/* AHT Decomposition, version 1.0. A calculator method (kind "calc").
 *
 * Published at /methodology/aht-decomposition from this object. The formulas are stated in
 * words, the lever shares are read from the registry, and the worked example is computed by
 * the same engine the tool runs, at the tool's own defaults, so the page cannot drift from
 * the calculator.
 */
import { benchmark, BENCHMARK_SOURCES } from "../benchmarks.js";
import { runAHT, AHT_LEVERS } from "../aht.js";

const VALUES = { talk: 210, hold: 55, wrap: 60, transfer: 15, search: 30, admin: 25 };
const LEVERS = Object.fromEntries(AHT_LEVERS.map((L) => [L.id, { on: true, ...Object.fromEntries(L.targets.map((c) => [c, Math.round(benchmark(`aht.lever.${L.id}.${c}`) * 100)])) }]));
const EXAMPLE = { values: VALUES, contactType: "blended", contacts: 20000, levers: LEVERS };
const X = runAHT(EXAMPLE);
const s1 = (x) => (Math.round(x * 10) / 10).toLocaleString("en-US") + "s";
const ids = AHT_LEVERS.flatMap((L) => L.targets.map((c) => `aht.lever.${L.id}.${c}`));

export const AHT_MODEL = {
  id: "aht-decomposition",
  kind: "calc",
  title: "AHT Decomposition",
  version: "1.0",
  published: "2026-09-24",
  route: "/tools/aht-decomposition",
  methodology: "/methodology/aht-decomposition",
  what: "How AHT Decomposition splits handle time into its components, models the initiatives a buyer is weighing as shares of those components, and turns seconds saved into agent hours of capacity.",
  claimClasses: "Handle time, each component's share and the time outside the conversation are arithmetic on your inputs. Every lever share is an assumption, labelled as a heuristic until you replace it. The handle time after a lever and the agent hours it frees are conditional forecasts under those shares. Agent hours are capacity; they become cash only through an action you choose.",
  formulas: [
    { name: "Handle time", formula: "Talk + hold + after-call work + transfer + knowledge search + system time", note: "Each component in seconds a contact." },
    { name: "Outside the conversation", formula: "Handle time − talk time", note: "A fact about where the seconds go. Whether any of it can come out depends on the initiative and the operation." },
    { name: "One lever", formula: "Seconds saved = the sum over its targets of component × share removed", note: "Each lever alone, against today's handle time." },
    { name: "Selected levers combined", formula: "Each component × the product over selected levers of (1 − share removed)", note: "Two levers on the same component each remove their share of what the other leaves, so no second is counted twice and no component goes below zero." },
    { name: "Agent hours a year", formula: "Seconds saved × contacts a month × 12 ÷ 3,600", note: "Capacity. The Staffing Calculator turns handle time into agents at your service level." },
  ],
  bands: AHT_LEVERS.map((L) => ({ label: L.name, range: L.targets.map((c) => Math.round(benchmark(`aht.lever.${L.id}.${c}`) * 100) + "% of " + (c === "wrap" ? "after-call work" : c === "admin" ? "system time" : c === "search" ? "knowledge search" : c + " time")).join(" and "), meaning: "Opening share, editable, counted only when selected." })),
  bandsNote: "The levers and their opening shares. No published study gives these shares for an operation; each is a planning heuristic to be replaced with a vendor's evidence or your own pilot.",
  constants: () => ids.map((id) => ({ id, ...BENCHMARK_SOURCES[id] })),
  example: {
    inputs: [["Components", "talk 210s, hold 55s, after-call work 60s, transfer 15s, search 30s, system 25s"], ["Contacts per month", "20,000"], ["Levers", "all four selected at their opening shares"]],
    steps: [
      ["Handle time", "210 + 55 + 60 + 15 + 30 + 25 = " + X.total + "s, of which " + X.nonTalk + "s (" + (X.nonTalkShare * 100).toFixed(0) + "%) is outside the conversation"],
      ...X.levers.map((L) => [L.name, L.targets.map((c) => VALUES[c] + "s × " + L.pcts[c] + "%").join(" + ") + " = " + s1(L.saved) + " a contact"]),
      ["Hold time with both hold levers", VALUES.hold + " × (1 − " + LEVERS.knowledge.hold + "%) × (1 − " + LEVERS.desktop.hold + "%) = " + s1(VALUES.hold * X.left.hold) + ", " + s1(VALUES.hold - VALUES.hold * X.left.hold) + " removed, less than the " + s1(VALUES.hold * (LEVERS.knowledge.hold + LEVERS.desktop.hold) / 100) + " the two shares would add to"],
      ["Selected levers combined", X.total + "s falls to " + s1(X.combinedNew) + ", " + s1(X.combinedSaved) + " a contact (" + (X.combinedSavedPct * 100).toFixed(1) + "%)"],
      ["Agent hours a year", s1(X.combinedSaved).replace("s", "") + " × 20,000 × 12 ÷ 3,600 = " + Math.round(X.combinedHours).toLocaleString("en-US") + " hours of capacity"],
    ],
    result: X,
  },
  limits: [
    "Components are averages. Handle time varies by contact type, agent tenure and time of day; decompose by queue where your data allows.",
    "The lever shares are heuristics. A share you cannot evidence from a pilot or a reference site is a hypothesis to test.",
    "Shorter handle time can move other measures. Watch repeat contacts and quality when talk or hold time falls.",
    "Agent hours are capacity. They reduce cost only through an action such as fewer hires, less overtime or absorbed growth.",
  ],
};
