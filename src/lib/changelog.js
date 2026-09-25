/* changelog.js
 *
 * The public record of method changes: what moved, in which direction and by about how much.
 * Security and crash fixes are not listed here; they change no method. The log starts with
 * the WFM rebuild (Phase D, 24 September 2026). Newest first. Each entry names the methods it
 * touched, so each method page lists its own changes.
 */
export const CHANGELOG = [
  {
    date: "2026-09-25", methods: ["business-case-builder"], version: "1.1",
    title: "Business Case: the benefit stream grades where the baselines come from",
    changes: [
      "A new question asks where handle time, FCR, contact volume and wage come from. Our example defaults grade the benefit stream Directional; your estimate or an unattested system report, Planning-grade; a system report you attest, Finance-grade.",
      "Before this change the benefit stream could grade Finance-grade on the tool's own example baselines. A baseline pulled from another tool now grades by the origin grade it carries.",
      "No figure changes. Only the evidence axis moves, and only downward where the baselines are ours or unattested.",
    ],
  },
  {
    date: "2026-09-25", methods: ["attrition-cost"], version: "1.0",
    title: "Attrition Cost: method 1.0 published; opens on the BLS wage",
    changes: [
      "The opening salary is the BLS median agent wage over a 2,080 hour year, $42,827 (was $38,000), and the benefits load the platform's shared 30% (was 28%).",
      "At the opening case, all-in cost per departure moves from $16,219 to $17,915. Any case you enter yourself computes exactly as before.",
      "The 40 to 60% of salary band is now stated as a planning check set by this platform; the unsourced $10,000 to $20,000 reference is removed.",
    ],
  },
  {
    date: "2026-09-25", methods: ["business-case-builder"], version: "1.0",
    title: "Business Case: method 1.0 published; opens on the BLS wage",
    changes: [
      "The opening wage is the BLS median, $20.59 an hour (was $18.00).",
      "The opening case with no capacity action is unchanged: net $31,850 a year, three-year cost $1,722,000. With hiring avoidance, net moves from $874,071 to $995,257 a year and payback from month 35 to month 31.",
      "Target ranges are stated as internal planning ranges. Any case you enter yourself computes exactly as before.",
    ],
  },
  {
    date: "2026-09-25", methods: ["staffing-calculator", "cost-per-contact", "channel-shift", "fcr-leakage", "ai-deflection", "tco-calculator", "license-gap"], version: "1.0",
    title: "Seven calculators: method 1.0 published",
    changes: [
      "Staffing, Cost per Contact, Channel Shift, FCR Leakage, AI Deflection, TCO and License Gap publish their formulas, constants and a worked example. No figure changes.",
    ],
  },
  {
    date: "2026-09-25", methods: ["staffing-calculator"], version: "1.0",
    title: "Staffing: solver and the WFM rail",
    changes: [
      "The agent search starts at the first whole count above the load. On a fractional load the tool had reported one agent more than needed: 1,297 of 20,000 random queues now need one agent fewer, about 0.2% at 70 to 90% occupancy targets.",
      "Staffing reads handle time from AHT Decomposition, shrinkage from the Shrinkage Planner and an occupancy ceiling from Occupancy Risk, each badged with its source and graded by where it came from.",
    ],
  },
  {
    date: "2026-09-25", methods: ["schedule-adherence"], version: "1.0",
    title: "Schedule Adherence: method 1.0",
    changes: [
      "The opening case is 820 calls an hour; the previous one showed a 100% service level at every adherence level.",
      "The stepped abandonment figures are retired. Overtime now prices the agents needed to hold the target over the hours and days you enter, at the FLSA multiplier of 1.5.",
    ],
  },
  {
    date: "2026-09-24", methods: ["forecast-accuracy"], version: "1.0",
    title: "Forecast Accuracy: method 1.0",
    changes: [
      "The headline is interval accuracy (1 minus WAPE). Total-volume accuracy lets interval errors cancel: a 20% miss every interval could score 99.8%.",
      "MAPE is shown beside it, misses are ranked by contacts, and the tracking signal is read against plus or minus 4. The unsourced grades are retired.",
    ],
  },
  {
    date: "2026-09-24", methods: ["aht-decomposition"], version: "1.0",
    title: "AHT Decomposition: method 1.0",
    changes: [
      "Time outside the conversation is shown as a fact, never as reducible. The share ranges and reducibility ratings are retired.",
      "Lever shares are editable, count only when selected, and compound on a shared component so no second is counted twice.",
    ],
  },
  {
    date: "2026-09-24", methods: ["shrinkage-planner"], version: "1.0",
    title: "Shrinkage Planner: method 1.0",
    changes: [
      "PTO is planned shrinkage. Agents to schedule are rounded up.",
      "Paid time off the queue is priced at the loaded BLS wage as a fact about where paid hours go, replacing the annual cost of gap; it is never a saving.",
    ],
  },
  {
    date: "2026-09-24", methods: ["occupancy-risk"], version: "1.0",
    title: "Occupancy Risk: method 1.0",
    changes: [
      "One attrition model replaces two that disagreed; the occupancy bands are the platform's shared bands.",
      "Target occupancy is an input (85% to start), staffing cost carries the 1.30 benefits load at the BLS wage, and training weeks price the ramp.",
      "The opening case is 440 calls an hour, in the caution band; the previous one opened at 24% occupancy.",
    ],
  },
];

export const changesFor = (methodId) => CHANGELOG.filter((c) => c.methods.includes(methodId));
