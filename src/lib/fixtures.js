/* fixtures.js
 *
 * Reference fixtures: cases whose answer is known outside this site, each reproduced by the
 * shipped engine. fixtures.test.mjs computes every one from the tool's own engine and fails
 * the suite if an answer here differs from what the engine gives. The method pages print the
 * fixtures for their method under "Checked against", so a reader can check the arithmetic
 * against a source that is not ours.
 *
 * Kinds:
 *   published   the value appears in the cited source.
 *   derivation  the value follows by hand from the cited formula; the working is shown.
 *   reconciled  an internal case reconciled to the dollar on a live PDF; named as ours.
 */
export const FIXTURES = [
  {
    id: "erlang-c-table", methods: ["staffing-calculator", "schedule-adherence"], kind: "published",
    title: "Erlang C probability of waiting, 10 Erlangs",
    case: "Offered load 10 Erlangs on 11, 12, 13 and 14 agents.",
    expected: "0.6821, 0.4494, 0.2853 and 0.1741",
    source: "Erlang C formula (A. K. Erlang, 1917), as tabulated in standard Erlang C probability-of-wait tables.",
  },
  {
    id: "erlang-c-hand", methods: ["schedule-adherence", "staffing-calculator"], kind: "derivation",
    title: "Erlang C by hand, 1 Erlang on 2 agents",
    case: "Offered load 1 Erlang on 2 agents. The formula gives (1²/2! × 2/(2 − 1)) ÷ (1 + 1 + 1²/2! × 2/(2 − 1)) = 1 ÷ 3.",
    expected: "0.3333",
    source: "Erlang C formula (A. K. Erlang, 1917).",
  },
  {
    id: "erlang-c-80-20", methods: ["staffing-calculator"], kind: "published",
    title: "Agents for 80% in 20 seconds at 10 Erlangs",
    case: "100 calls a half hour at 180 seconds (10 Erlangs), target 80% answered in 20 seconds.",
    expected: "14 agents",
    source: "Standard Erlang C staffing tables for a 10 Erlang load at an 80/20 service level.",
  },
  {
    id: "nextiva-erlang", methods: ["staffing-calculator"], kind: "published",
    title: "Nextiva's worked Erlang C example",
    case: "400 calls a half hour, 257-second handle time, 80% in 20 seconds, 85% maximum occupancy, 30% shrinkage.",
    expected: "68 agents, 98 FTE, 84.0% occupancy",
    source: "Nextiva, Erlang C formula worked example (call center staffing guide).",
  },
  {
    id: "krippendorff-2011", methods: ["qa-scorecard"], kind: "published",
    title: "Krippendorff's alpha, the published reliability example",
    case: "Four observers, twelve units, values 1 to 5 with missing data, as printed in the source.",
    expected: "nominal alpha 0.743, interval alpha 0.849",
    source: "Krippendorff, K. (2011). Computing Krippendorff's Alpha-Reliability. Annenberg School for Communication, University of Pennsylvania.",
  },
  {
    id: "wape-cancel", methods: ["forecast-accuracy"], kind: "derivation",
    title: "Interval errors that cancel in the total",
    case: "Two intervals forecast at 100 each; actuals 120 and 80. Misses 20 + 20 = 40 on 200 actual contacts.",
    expected: "interval accuracy 80.0%, total-volume accuracy 100.0%",
    source: "Weighted absolute percentage error: the absolute misses summed over the actual volume.",
  },
  {
    id: "bcb-tracker", methods: ["business-case-builder"], kind: "reconciled",
    title: "The tracker fixture",
    case: "The tool's opening case at the expected stance, phasing on, no capacity action.",
    expected: "net $31,850 a year, three-year cost $1,722,000",
    source: "ContactCenterCX tracker fixture, reconciled to the dollar on a live PDF. Internal, and named as such.",
  },
];

export const FIXTURE_KIND = { published: "Published value", derivation: "Worked by hand from the formula", reconciled: "Internal reconciliation" };
export const fixturesFor = (methodId) => FIXTURES.filter((f) => f.methods.includes(methodId));
