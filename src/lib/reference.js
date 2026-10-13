/* reference.js
 *
 * The reference library (TB, 13 Oct 2026, open item 2: metric pages, a glossary and an Erlang C explainer, from the
 * registry and the methods). Content as data, rendered by Reference.jsx at /reference, /reference/<metric>,
 * /reference/glossary and /reference/erlang-c.
 *
 * Rules, each gated by reference.test.mjs:
 *   - A formula is never typed here. Each metric names the published method and formula it uses ([method id, formula
 *     name]); the page reads the formula from that method's model, so the reference cannot drift from the tools.
 *   - Published figures come only from comparisons.js groups, the same sourced rows the tools show. No figure is typed
 *     in this file: definitions and cautions are words.
 *   - Every tool, method, metric and glossary link resolves to a live page.
 *   - Written in our own words, no dashes, no sales language.
 */

/* One entry per measure. formulas: [method id, formula name] pairs read from the method models. groups: comparison
   group ids. related: other metric ids. */
export const METRICS = [
  {
    id: "average-handle-time", name: "Average handle time", short: "AHT", also: ["handle time", "AHT"],
    what: "The average time an agent spends on one contact from the moment it is answered to the moment the agent is free for the next: talk, hold and the work after the conversation.",
    why: "Handle time sets how much work arrives each interval, so it drives how many agents a service level needs. A few seconds across a year of contacts is a large number of paid hours.",
    careful: [
      "Publishers and platforms count it differently: some leave out after-contact work, some leave out hold. Check what yours includes before you compare.",
      "A lower handle time is not always better. Rushing a contact can create a repeat contact that costs more than the seconds saved.",
      "Time outside the conversation (searching, switching systems, writing up) is often the part an operation can change.",
    ],
    formulas: [["aht-decomposition", "Handle time"], ["aht-decomposition", "Outside the conversation"]],
    tools: ["aht-decomposition", "staffing-calculator"], groups: ["aht"], related: ["offered-load", "first-contact-resolution", "occupancy"],
  },
  {
    id: "first-contact-resolution", name: "First contact resolution", short: "FCR", also: ["first call resolution", "FCR"],
    what: "The share of customer issues resolved on the first contact, with no need for the customer to come back about the same thing.",
    why: "Every unresolved issue comes back as more contacts, so resolution rate decides how much of the workload is repeat demand.",
    careful: [
      "It can be measured by asking customers, by tracking repeat contacts in a window, or by agents marking a case closed. The three give different numbers.",
      "Repeat contacts can arrive on another channel. A phone-only count misses them.",
      "Compare like with like: published averages differ by industry and by how the survey was run.",
    ],
    formulas: [["cost-per-contact", "Contacts per resolution (C)"], ["fcr-leakage", "Repeat share"]],
    tools: ["fcr-leakage", "cost-per-contact"], groups: ["fcr"], related: ["cost-per-contact", "average-handle-time"],
  },
  {
    id: "service-level", name: "Service level", short: "SL", also: ["SLA", "service level target"],
    what: "The share of contacts answered within a set time, written as a pair: the share to answer and the time limit in seconds.",
    why: "It is the usual staffing target: the number of agents a center schedules is the number that meets it.",
    careful: [
      "Centers count abandoned contacts differently (left out, counted as missed, or excluded under a few seconds). State which rule you use.",
      "A service level met over a day can hide intervals that missed badly. Read it by interval.",
      "The common targets are conventions. A few regulators set their own for the centers they oversee.",
    ],
    formulas: [["staffing-calculator", "Service level"]],
    tools: ["staffing-calculator", "schedule-adherence"], groups: ["service"], related: ["average-speed-of-answer", "abandonment-rate", "offered-load"],
  },
  {
    id: "average-speed-of-answer", name: "Average speed of answer", short: "ASA", also: ["speed of answer", "ASA"],
    what: "The average time callers wait in the queue before an agent answers.",
    why: "It is how the wait feels to the caller on average, and it moves sharply when a queue runs close to its capacity.",
    careful: [
      "An average hides the long waits. A few callers waiting many minutes can sit behind a short average.",
      "Some systems include calls answered at once (zero seconds) and some do not.",
    ],
    formulas: [["schedule-adherence", "Speed of answer"]],
    tools: ["schedule-adherence", "staffing-calculator"], groups: ["service"], related: ["service-level", "abandonment-rate"],
  },
  {
    id: "abandonment-rate", name: "Abandonment rate", short: "", also: ["abandon rate", "abandoned calls"],
    what: "The share of callers who hang up in the queue before an agent answers.",
    why: "Each abandoned call is a customer who did not get help, and many call again, which adds to the load.",
    careful: [
      "Most centers leave out calls abandoned within the first few seconds. State the threshold you use.",
      "Erlang C assumes nobody hangs up, so it slightly overstates the agents a queue needs when callers do.",
    ],
    formulas: [["staffing-calculator", "Abandonment check"]],
    tools: ["staffing-calculator"], groups: ["service"], related: ["service-level", "average-speed-of-answer", "erlang-c"],
  },
  {
    id: "offered-load", name: "Offered load (Erlangs)", short: "", also: ["workload", "Erlangs", "traffic intensity"],
    what: "The work arriving in an interval, counted in Erlangs: the number of agents who would be busy every moment if contacts arrived perfectly evenly.",
    why: "It is the starting point of every staffing calculation. A center always needs more agents than its load, because contacts arrive in bunches.",
    careful: [
      "Use the busiest interval you plan for. Load changes hour by hour, and a daily average hides the peak.",
      "One Erlang is one hour of handle time in one hour, whatever the interval length.",
    ],
    formulas: [["staffing-calculator", "Offered load"], ["occupancy-risk", "Workload"]],
    tools: ["staffing-calculator", "occupancy-risk"], groups: [], related: ["erlang-c", "occupancy", "average-handle-time"],
  },
  {
    id: "occupancy", name: "Occupancy", short: "", also: ["agent occupancy", "utilization"],
    what: "The share of time agents logged in to the queue spend handling contacts, against waiting for the next one.",
    why: "High occupancy means little recovery time between contacts. Run too high for long, it wears agents out; too low, and paid time sits idle.",
    careful: [
      "Occupancy and utilization are sometimes used for the same thing and sometimes not: utilization may count all paid time, including time off the queue.",
      "It is an outcome of staffing and demand. Targeting it directly can mean cutting agents until service suffers.",
      "Small teams run lower occupancy at the same service level than large ones.",
    ],
    formulas: [["occupancy-risk", "Occupancy"]],
    tools: ["occupancy-risk", "staffing-calculator"], groups: ["occupancy"], related: ["offered-load", "shrinkage", "agent-attrition"],
  },
  {
    id: "shrinkage", name: "Shrinkage", short: "", also: ["agent shrinkage"],
    what: "The share of paid time agents are not available to take contacts: breaks, meetings, coaching, training, time off, absence and system downtime.",
    why: "It turns the agents a queue needs into the agents you schedule and pay. Underestimate it and the schedule misses service every day.",
    careful: [
      "Some count it as a share of paid hours and some as a share of scheduled hours; the two give different figures.",
      "Planned shrinkage (breaks, training, time off) can be scheduled; unplanned (absence, outages) has to be allowed for.",
    ],
    formulas: [["shrinkage-planner", "Total shrinkage"], ["shrinkage-planner", "Agents to schedule"]],
    tools: ["shrinkage-planner", "staffing-calculator"], groups: ["shrinkage"], related: ["schedule-adherence", "occupancy"],
  },
  {
    id: "schedule-adherence", name: "Schedule adherence", short: "", also: ["adherence"],
    what: "The share of scheduled time agents spend doing what the schedule says, at the times it says.",
    why: "A schedule built to meet service only works if agents are on the queue when it puts them there. Small losses at busy times cost more than they look.",
    careful: [
      "Adherence measures timing; conformance measures total time worked against total time scheduled. They are different measures.",
      "Low adherence often comes from the schedule itself (meetings at peak, no slack for long calls) more than from agents.",
    ],
    formulas: [["schedule-adherence", "Agents on the queue"], ["schedule-adherence", "Agents to schedule for the target"]],
    tools: ["schedule-adherence"], groups: ["adherence"], related: ["shrinkage", "service-level"],
  },
  {
    id: "cost-per-contact", name: "Cost per contact", short: "CPC", also: ["cost per call", "CPC"],
    what: "The full cost of running the contact center over a period divided by the contacts it handled.",
    why: "It turns a budget into a unit a business can compare across channels, periods and options. Cost per resolution adds the repeat contacts an issue takes.",
    careful: [
      "What goes into the cost (technology, facilities, management, overhead) changes the figure more than anything the agents do. Say what you included.",
      "Cutting cost per contact by adding contacts (for example through repeat calls) makes the center look cheaper and the customer's issue dearer.",
      "The marginal cost of one more or one fewer contact is lower than the average: fixed costs do not move with volume.",
    ],
    formulas: [["tco-calculator", "Unit costs"], ["cost-per-contact", "Cost per resolution"]],
    tools: ["cost-per-contact", "tco-calculator"], groups: ["cost"], related: ["first-contact-resolution", "average-handle-time"],
  },
  {
    id: "agent-attrition", name: "Agent attrition", short: "", also: ["agent turnover", "attrition rate"],
    what: "The share of agents who leave in a year, usually departures over average headcount.",
    why: "Each departure costs recruiting, training and the months a new agent takes to reach full speed, and the gap is often covered with overtime.",
    careful: [
      "Some publishers count every departure; some count only agents the center did not plan to lose. Read the definition before you compare.",
      "Attrition in the first months is often much higher than the annual figure suggests.",
    ],
    formulas: [["attrition-cost", "Departures and hires"], ["attrition-cost", "Cost as a share of salary"]],
    tools: ["attrition-cost", "occupancy-risk"], groups: ["attrition", "hiring"], related: ["occupancy", "shrinkage"],
  },
  {
    id: "forecast-accuracy", name: "Forecast accuracy", short: "", also: ["WAPE", "MAPE", "forecast error"],
    what: "How close the contact volume forecast came to what arrived, measured interval by interval.",
    why: "Every schedule is built on the forecast. A miss in a busy interval shows up as long waits or idle agents.",
    careful: [
      "Accuracy on the total for a day or a month lets interval misses cancel out, so it can look excellent while intervals miss badly.",
      "MAPE weights a miss in a quiet interval as heavily as one in a busy interval; WAPE weights by volume.",
      "A forecast that is always high or always low has a bias to fix, which accuracy alone does not show.",
    ],
    formulas: [["forecast-accuracy", "WAPE"], ["forecast-accuracy", "Interval accuracy"], ["forecast-accuracy", "Tracking signal"]],
    tools: ["forecast-accuracy"], groups: [], related: ["offered-load", "service-level"],
  },
  {
    id: "containment-rate", name: "Containment and AI resolution", short: "", also: ["containment", "deflection", "self-service resolution"],
    what: "The share of contacts a self-service or AI channel finishes without an agent. Vendors and centers define it in several ways.",
    why: "It decides what an AI or self-service investment saves. A conversation that ends without an agent is not always a resolved issue.",
    careful: [
      "Check the denominator: all contacts, contacts the AI could handle, or conversations the AI took part in. The same system can report three rates.",
      "A customer who gives up, or calls back later, can still count as contained.",
      "Vendor-reported rates use the vendor's own definition.",
    ],
    formulas: [["ai-deflection", "Three rates, three denominators"], ["ai-deflection", "Durable resolution"]],
    tools: ["ai-deflection", "channel-shift"], groups: ["deflection", "channels"], related: ["cost-per-contact", "first-contact-resolution"],
  },
];

/* The Erlang C explainer. The worked table is computed by the shipped engine (src/lib/adherence.js) at a 10 Erlang
   load, the case the reference fixtures check against published tables. */
export const ERLANG = {
  id: "erlang-c",
  name: "Erlang C",
  what: "Erlang C is the queueing formula most contact centers use to work out how many agents a queue needs. Given the work arriving and the handle time, it gives the probability a caller waits, and from that the service level and the average wait for any number of agents.",
  history: "A. K. Erlang, a Danish engineer at the Copenhagen Telephone Company, published the model in 1917 to size telephone exchanges.",
  assumes: [
    "Contacts arrive at random, independently of one another, at a steady average rate within the interval.",
    "Handle times vary at random around their average.",
    "Every caller waits until answered: nobody hangs up and nobody gets a busy signal.",
    "Any agent can take any contact, one at a time, and the next caller in line takes the next free agent.",
  ],
  limits: [
    "Because nobody hangs up in the model, it slightly overstates the agents needed when callers do abandon. The Staffing Calculator shows an abandonment check beside the result.",
    "It assumes agents take one contact at a time, so it does not fit chat or email, where an agent handles several at once.",
    "It plans one interval. A day needs the calculation for each interval, and shrinkage on top.",
  ],
  case: { load: 10, aht: 180, threshold: 20, agents: [11, 12, 13, 14, 15, 16] },
  formulas: [["staffing-calculator", "Offered load"], ["staffing-calculator", "Erlang C"], ["staffing-calculator", "Service level"], ["schedule-adherence", "Speed of answer"]],
  fixtures: ["erlang-c-table", "erlang-c-hand", "erlang-c-80-20"],
  tools: ["staffing-calculator", "schedule-adherence", "occupancy-risk"],
};

/* The glossary. link: a site path (a metric's page, a tool, a method, a category) or none. Category names come from
   the registry at render time (kind "category"). Our own words; one or two sentences each. */
export const GLOSSARY = [
  { term: "After-contact work", also: "ACW, wrap-up", def: "What an agent does after the conversation ends and before taking the next contact: notes, updates, follow-up tasks. Usually counted in handle time." },
  { term: "Agent attrition", also: "turnover", link: "/reference/agent-attrition" },
  { term: "Automatic call distribution", also: "ACD", def: "The part of a phone system that queues calls and sends each to an available agent by set rules." },
  { term: "Average handle time", also: "AHT", link: "/reference/average-handle-time" },
  { term: "Average speed of answer", also: "ASA", link: "/reference/average-speed-of-answer" },
  { term: "Abandonment rate", link: "/reference/abandonment-rate" },
  { term: "Backfill", def: "Hiring to replace an agent who left. Choosing not to backfill is one way freed capacity turns into cash." },
  { term: "Capacity action", def: "What a center decides to do with agent time an improvement frees: avoid hiring, cut overtime, let attrition shrink the team, or redeploy people. Freed time saves money only through one of these." },
  { term: "Concurrency", def: "The number of contacts an agent handles at once, such as several chats. Phone is one at a time." },
  { term: "Containment", link: "/reference/containment-rate" },
  { term: "Conversational AI", also: "IVA, virtual agent, chatbot", def: "Software that holds a conversation with a customer in speech or text to answer a question or complete a task.", category: "iva" },
  { term: "Cost per contact", also: "CPC", link: "/reference/cost-per-contact" },
  { term: "Cost per resolution", def: "Cost per contact multiplied by the contacts an issue takes to resolve, so repeat contacts are counted.", link: "/reference/cost-per-contact" },
  { term: "Contact center as a service", also: "CCaaS", def: "A contact center platform run in the cloud by the vendor and paid for by subscription: routing, queues, recording and reporting without hardware on site.", category: "ccaas" },
  { term: "Directional", def: "", grade: "Directional" },
  { term: "Erlang", def: "A unit of work: one Erlang is one hour of handling in one hour. Ten Erlangs would keep ten agents busy every moment.", link: "/reference/offered-load" },
  { term: "Erlang C", link: "/reference/erlang-c" },
  { term: "Finance-grade", def: "", grade: "Finance-grade" },
  { term: "First contact resolution", also: "FCR", link: "/reference/first-contact-resolution" },
  { term: "Forecast accuracy", also: "WAPE, MAPE", link: "/reference/forecast-accuracy" },
  { term: "Full-time equivalent", also: "FTE", def: "Paid staff counted in full-time units, so two half-time agents are one FTE." },
  { term: "Generally available", also: "GA", def: "A feature released for every customer under the vendor's normal terms. Preview, beta and early access features are not yet generally available." },
  { term: "Interactive voice response", also: "IVR", def: "The phone menu a caller meets first, by keypad or speech, which routes the call or completes simple tasks." },
  { term: "Interval", def: "The block of time a contact center plans by, usually 15 or 30 minutes." },
  { term: "Marginal cost", def: "What one more or one fewer contact actually changes in cost. Lower than the average, because fixed costs do not move with volume." },
  { term: "Nesting", def: "The period after classroom training when new agents take live contacts with extra support before they work alone." },
  { term: "Occupancy", link: "/reference/occupancy" },
  { term: "Offered load", link: "/reference/offered-load" },
  { term: "Planning-grade", def: "", grade: "Planning-grade" },
  { term: "Quality management", also: "QM, QA", def: "Reviewing a sample of contacts against a scorecard to coach agents and check that policy is followed.", link: "/tools/qa-scorecard" },
  { term: "Ramp", def: "The months a new agent takes to reach full productivity." },
  { term: "Realization", def: "How much of a modelled saving becomes real money, given the capacity action chosen. Time freed with no action realizes nothing." },
  { term: "Repeat contact", def: "A customer coming back about an issue that was not resolved the first time." },
  { term: "Request for proposal", also: "RFP", def: "A formal document a buyer sends vendors listing requirements, asking each to say how it meets them and at what price.", link: "/tools/rfp-builder" },
  { term: "Schedule adherence", link: "/reference/schedule-adherence" },
  { term: "Seat", def: "One licensed agent. Named seats are tied to a person; concurrent seats cap how many are logged in at once." },
  { term: "Service level", also: "SL", link: "/reference/service-level" },
  { term: "Shrinkage", link: "/reference/shrinkage" },
  { term: "Total cost of ownership", also: "TCO", def: "Everything a contact center costs to run over a period: people, technology, telephony, facilities and overhead, beyond the license price.", link: "/tools/tco-calculator" },
  { term: "Tracking signal", def: "A running check on whether a forecast is consistently high or low: the sum of its errors divided by the average size of an error.", link: "/reference/forecast-accuracy" },
  { term: "Unified communications as a service", also: "UCaaS", def: "Cloud phone, meetings and messaging for a whole company. Some vendors sell it together with a contact center." },
  { term: "Workforce management", also: "WFM", def: "Forecasting contact volume, working out the agents needed and building schedules to meet it.", category: "wem-qm" },
];
