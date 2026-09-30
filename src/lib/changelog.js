/* changelog.js
 *
 * The public record of method changes: what moved, in which direction and by about how much.
 * Security and crash fixes are not listed here; they change no method. The log starts with
 * the WFM rebuild (Phase D, 24 September 2026). Newest first. Each entry names the methods it
 * touched, so each method page lists its own changes.
 */
export const CHANGELOG = [
  {
    date: "2026-09-30", methods: ["staffing-calculator"], version: "1.2",
    title: "Staffing: the year priced from your hours open",
    changes: [
      "The yearly cost priced the busiest interval's FTE as a year of full-time agents, which fits a center open 40 hours a week with every interval as busy as the busiest, and no other.",
      "Two inputs now set the year: hours open a week and the average interval as a share of the busiest. FTE on payroll is the scheduled FTE for the average interval times hours open divided by 40. The recovery time and pooling costs use the same basis.",
      "They open at 40 hours and 100%, where every figure equals method 1.1. A sourced cost basis grades no higher than Directional while either input is still at its default.",
    ],
  },
  {
    date: "2026-09-30", methods: ["ai-deflection"], version: "1.2",
    title: "AI Deflection: a Proceed needs payback in the year and a Conservative case that breaks even",
    changes: [
      "Positive monthly economics alone used to earn Proceed. A case netting $13,067 a month against $2.5M of implementation, about 192 months to pay back, read Proceed, with a contracted floor.",
      "A Proceed now also needs the program to pay back its implementation inside the 12 months the tool models, and the Conservative scenario shown on the page (eligibility x0.8, resolution x0.85, repeats x1.5, now registered) to break even. A case that fails either reads Run a bounded pilot and says which test it failed.",
      "Figures and grades are unchanged. Against the previous engine on 6,000 random cases, every figure is identical and the only decisions that move are Proceeds that fail a new test.",
    ],
  },
  {
    date: "2026-09-30", methods: ["rfp-builder"], version: "1.1",
    title: "RFP Builder: your own wording, removals and requirements",
    changes: [
      "Any requirement can be reworded, and the report marks it edited so a reader can tell your wording from the published default.",
      "Any requirement can be removed; it leaves every count and score.",
      "Requirements of your own can be added on any layer, up to 20, each scored like any other and starting as a should-have.",
      "Scoring, weights, credits and every rule are unchanged; with no edit, removal or addition every result equals version 1.0.",
    ],
  },
  {
    date: "2026-09-29", methods: ["business-case-builder"], version: "1.3",
    title: "Business Case: savings valued on the shared marginal load",
    changes: [
      "Deflected and repeat contacts, handle time and the trainee time that lower attrition frees are now valued at the wage times the shared marginal load (1.18, never above the loaded rate you enter). They were valued at the fully loaded rate, which counts benefits that stay in place when a contact goes away.",
      "Costs stay on the loaded rate, and recruiting cash avoided is unchanged.",
      "At the opening case with hiring avoidance, net realizable savings move from $1,039,240 to $946,250 a year, the three-year return from 23% to 12%, and payback from month 30 to month 32. With no capacity action the net is unchanged at $31,850.",
      "Grades are unchanged: the load moves figures, never evidence.",
    ],
  },
  {
    date: "2026-09-29", methods: ["tco-calculator"], version: "1.4",
    title: "TCO: handle-time savings valued on the shared marginal load",
    changes: [
      "The handle-time lever now values freed agent minutes at the wage times the shared marginal load (1.18), the same rate as the deflection and repeat levers. It used the fully loaded rate.",
      "At the opening case, modelled savings move from $76,000 to $74,000 a month gross ($54,000 to $52,000 at the expected stance). Costs, unit costs and grades are unchanged.",
    ],
  },
  {
    date: "2026-09-29", methods: ["tco-calculator"], version: "1.3",
    title: "TCO: industry profile wages move to BLS medians where BLS publishes them",
    changes: [
      "The cross-industry profile now opens at the platform's agent wage, the BLS May 2025 median for customer service representatives: $21.53 an hour (was a $19 planning value).",
      "Three industry profiles open at the BLS May 2025 median for customer service representatives in their industry: insurance $22.47 (was $21), retail $17.96 (was $16), and BPO at business support services, which includes telephone call centers, $17.68 (was $15). Financial services, healthcare and telecom have no May 2025 industry figure and keep their labelled planning values.",
      "At the opening case, annual cost moves from $15,291,986 to $16,703,994, cost per contact from $10.62 to $11.60, marginal cost per contact from $2.51 to $2.83, and modelled savings from $68,000 to $76,000 a month gross ($48,000 to $54,000 at the expected stance). Only wage-driven figures move; technology, telephony, seats and hires are unchanged.",
      "Formulas and grades are unchanged. A wage still at its profile grades Directional, sourced or not. Any case where you entered your own wage computes exactly as before.",
    ],
  },
  {
    date: "2026-09-28", methods: ["attrition-cost"], version: "1.3",
    title: "Attrition Cost: recruiter, trainer and supervisor rates from BLS",
    changes: [
      "The recruiter, trainer and supervisor hourly rates now open at the BLS May 2025 national medians (published 15 May 2026) times the shared 30% benefits load: Human Resources Specialists (13-1071) $36.51, so $47.46 loaded (was $48, no source); Training and Development Specialists (13-1151) $33.31, so $43.30 (was $45); First-Line Supervisors of Office and Administrative Support Workers (43-1011) $33.41, so $43.43 (was $55).",
      "At the opening case, all-in cost per departure moves from $18,535 to $18,381, and the annual replacement burden from $1,297,454 to $1,286,673. Any case where you entered your own rates computes exactly as before.",
      "Formulas and grades are unchanged.",
    ],
  },
  {
    date: "2026-09-28", methods: ["ai-deflection"], version: "1.1",
    title: "AI Deflection: no capacity action is chosen for you",
    changes: [
      "The tool now opens with no capacity action (it opened on avoided hiring). Freed agent time counts as $0 until you choose how it becomes cash.",
      "With no action chosen the decision is withheld and says which choice unlocks it; it used to read as a loss verdict. The severity band sent with a review request is withheld the same way.",
      "Formulas are unchanged. With an action chosen, every figure and decision is exactly as before.",
    ],
  },
  {
    date: "2026-09-28", methods: ["channel-shift"], version: "1.2",
    title: "Channel Shift: no capacity action is chosen for you",
    changes: [
      "The tool now opens with no capacity action (it opened on avoided hiring). Freed voice time counts as $0 until you choose how it becomes cash.",
      "With no action chosen the approval call is withheld and says which choice unlocks it; it used to read Do not approve yet.",
      "Formulas are unchanged. With an action chosen, every figure and call is exactly as before.",
    ],
  },
  {
    date: "2026-09-28", methods: ["attrition-cost"], version: "1.2",
    title: "Attrition Cost: a root-cause check on why agents leave",
    changes: [
      "A new section asks six drivers of departures as statements you rate: workload and recovery, schedule control, tools and desktop, knowledge and enablement, supervisor coaching, and career path. Each statement at 2 or below becomes an action, with the tool that measures that driver. It returns the retired Agent Experience Diagnostic in our own words, without its unsourced thresholds or its predicted attrition rates.",
      "It replaces a list that marked drivers High or Medium from the attrition rate alone, with no source for either the cut points or the claims beside them.",
      "No figure or grade changes. The answers are scored apart from the cost calculation and are not averaged into one score.",
    ],
  },
  {
    date: "2026-09-28", methods: ["staffing-calculator", "cost-per-contact", "channel-shift", "attrition-cost", "occupancy-risk", "shrinkage-planner", "schedule-adherence"], version: "1.1",
    title: "The agent wage moves to the BLS May 2025 estimates",
    changes: [
      "The opening wage is the BLS median for customer service representatives (SOC 43-4051) in the May 2025 Occupational Employment and Wage Statistics, published 15 May 2026: $21.53 an hour (was $20.59, the May 2024 median). The BLS mean is $22.40 an hour, $46,590 a year; the tools open on the median.",
      "Figures built on agent time move up by about 4.6%, the wage ratio: at the opening cases Staffing's annual cost moves from $10,502,407 to $10,981,876, Channel Shift's net realizable from $3,022 to $3,344 a month, and Attrition's opening salary from $42,827 to $44,782 with all-in cost per departure from $17,915 to $18,535.",
      "Formulas, thresholds and grades are unchanged. Any case where you entered your own wage computes exactly as before.",
    ],
  },
  {
    date: "2026-09-28", methods: ["business-case-builder"], version: "1.2",
    title: "Business Case: the agent wage moves to the BLS May 2025 estimates",
    changes: [
      "The opening wage is the BLS May 2025 median, $21.53 an hour (was $20.59), published 15 May 2026.",
      "With no capacity action the opening case is unchanged: net $31,850 a year, three-year cost $1,722,000. With hiring avoidance, net moves from $995,257 to $1,039,240 a year and payback from month 31 to month 30.",
      "Formulas and grades are unchanged. Any case where you entered your own wage computes exactly as before.",
    ],
  },
  {
    date: "2026-09-28", methods: ["tco-calculator"], version: "1.2",
    title: "TCO: a validity check for marginal cost above the full cost per contact",
    changes: [
      "When the marginal cost per contact comes out above the full cost per contact, the handle time entered does not fit in the paid hours of the agents entered. The result now says so, names both figures, and holds completeness at Directional.",
      "A corrected input now says the result grades Directional until you correct it, which is what the grade already did.",
      "Every figure is unchanged. On 6,000 random cases grades differ only where the new check fires.",
    ],
  },
  {
    date: "2026-09-25", methods: ["tco-calculator"], version: "1.1",
    title: "TCO: deflection and repeat savings valued at the marginal load",
    changes: [
      "Containment and first contact resolution savings now value agent time at the wage times 1.18, the shared marginal load, instead of the 1.30 benefits load. The marginal rate never exceeds the loaded rate you enter.",
      "At the opening case marginal cost per contact moves from $2.75 to $2.51, and modelled savings from $71,000 to $68,000 a month gross ($51,000 to $48,000 at the expected stance).",
      "Every cost figure, unit cost, grade, and the handle-time and attrition savings are unchanged. One line now states that capturing the saving by not backfilling seats removes benefits too, about 10% more.",
    ],
  },
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
