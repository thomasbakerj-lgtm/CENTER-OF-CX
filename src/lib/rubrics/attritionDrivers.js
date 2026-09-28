/* Attrition root-cause check, part of the Attrition Cost method from version 1.2.
 *
 * Why agents leave, asked as statements the reader rates for their own operation. It
 * returns the content of the retired Agent Experience Diagnostic (S22) as Attrition's
 * root-cause layer, rewritten in our words: the five areas that tool asked about plus
 * workload, with every unsourced figure removed (the old statements carried thresholds
 * such as "at least 4 weeks" and "within 60 seconds", and its bands predicted attrition
 * rates and replacement costs with no source).
 *
 * Scored by the one rubric engine (src/lib/rubric.js). What it returns here: each
 * driver's answers and a checklist of every statement answered at 2 or below, weakest
 * driver first, each with the action it calls for and the tool on this site that
 * measures that driver. What it never returns: an overall score, a band, a predicted
 * attrition rate, or any change to a figure or grade in the cost calculation. Drivers
 * are not averaged, because a strong driver does not offset a weak one.
 */
export const ATTRITION_DRIVERS = {
  id: "attrition-drivers",
  title: "Why agents leave: the root-cause check",
  scale: { min: 1, max: 5, low: "Disagree", high: "Agree" },
  failAt: 2,
  what: "Six drivers of agent departures, each asked as statements you rate for your own operation. A statement at 2 or below becomes an action, with the tool that measures that driver.",
  limits: [
    "It records how the person answering sees the operation. Exit interviews and stay conversations tell you what agents themselves say.",
    "It does not estimate or predict an attrition rate. No published source ties these statements to a rate, so the check claims none.",
    "Drivers are not averaged into one score. A strong driver does not offset a weak one.",
    "Your answers change no figure and no grade in the cost calculation.",
  ],
  /* The engine's band lookup is not used by this check: no overall position is reported. */
  bands: [],
  dims: [
    { id: "workload", name: "Workload and recovery", weight: 1, next: "occupancy-risk", criteria: [
      { text: "Agents get recovery time between contacts on busy intervals as well as quiet ones.", action: "Plan occupancy to a target and check the busiest intervals against it, since sustained back-to-back contacts are where recovery time disappears." },
      { text: "Occupancy is planned to a target and reviewed whenever it runs above that target.", action: "Set a target occupancy, report it by interval and review every week it runs above target." },
      { text: "Complaints and escalations are spread across the team.", action: "Rotate or route complaint and escalation work so it does not land on the same agents every day." },
    ]},
    { id: "schedule", name: "Schedule control", weight: 1, next: "staffing-calculator", criteria: [
      { text: "Agents can swap shifts with each other through a self-service process for routine changes.", action: "Open a self-service shift swap for routine changes, with rules the system checks instead of a manager." },
      { text: "Schedule preferences are collected and used when schedules are built.", action: "Collect start time and day off preferences, and report how many were met in each schedule cycle." },
      { text: "Overtime is mostly voluntary; mandatory overtime is rare and announced ahead.", action: "Size staffing so mandatory overtime is the exception, and give notice every time it is required." },
      { text: "Flexible patterns such as hybrid work or compressed weeks are available under published rules.", action: "Publish which flexible patterns exist, who qualifies and how to ask." },
    ]},
    { id: "tools", name: "Tools and desktop", weight: 1, next: "aht-decomposition", criteria: [
      { text: "Agents handle most contacts from one desktop or one integrated workspace.", action: "Count the applications an agent opens for your five most common contact types and integrate the most used one first." },
      { text: "Customer history and account context appear without the agent searching for them.", action: "Bring customer history and account context into the contact screen when the contact arrives." },
      { text: "System slowness, crashes and workarounds are logged, and each fix is tracked to closure.", action: "Log desktop failures and workarounds as incidents with an owner and a closing date." },
    ]},
    { id: "knowledge", name: "Knowledge and enablement", weight: 1, next: "fcr-leakage", criteria: [
      { text: "New hires complete structured training and a nesting period before handling contacts alone.", action: "Write down the training and nesting path every new hire completes before working contacts alone." },
      { text: "Agents can find the answer to a routine question quickly in the knowledge base.", action: "Test the knowledge base against your most common questions and fix every answer that is hard to find or out of date." },
      { text: "Gaps found in quality reviews or escalations reach training and knowledge articles on a set schedule.", action: "Route every gap found in quality review or escalation to a named owner in training or knowledge, reviewed on a fixed cycle." },
      { text: "Product and policy changes reach agents before customers start asking about them.", action: "Brief agents on each product or policy change before it is announced to customers." },
    ]},
    { id: "coaching", name: "Supervisor coaching", weight: 1, next: "qa-scorecard", criteria: [
      { text: "Supervisors have protected time each week for coaching and development.", action: "Protect coaching time on every supervisor's calendar and move routine administration away from it." },
      { text: "Every agent gets regular coaching based on reviewed interactions.", action: "Schedule recurring coaching for every agent, each session built on interactions the supervisor has reviewed." },
      { text: "Feedback names specific strengths and specific changes, beyond a score.", action: "Coach from the interaction: name what went well and one change, with the moment in the contact where it applies." },
      { text: "Supervisors are trained to coach, whether they were hired in or promoted from the floor.", action: "Train every new supervisor in coaching before or soon after they take the role." },
    ]},
    { id: "career", name: "Career path", weight: 1, next: null,
      nextNote: "No tool on this site measures career paths yet. The Human Premium describes the contact center roles that are emerging.",
      read: { label: "The Human Premium", href: "/human-premium" },
      criteria: [
        { text: "Agents can see the documented paths out of the agent role, such as specialist, lead, trainer, quality or workforce management.", action: "Document each path out of the agent role and publish it where agents can see it." },
        { text: "Agents know the skills, tenure or certifications the next step requires.", action: "Write down what each next step requires and share it in every development conversation." },
        { text: "Supervisor and specialist openings are filled from inside the team when a qualified internal candidate exists.", action: "Post supervisor and specialist openings internally first and report how many were filled from inside." },
        { text: "Pay can rise with skill without a move into management.", action: "Add skill steps to agent pay so growth does not depend on a management title." },
      ]},
  ],
};

/* Tool names for the drivers that point at a tool, so the page and the method page name them the same way. */
export const DRIVER_TOOL_NAMES = {
  "occupancy-risk": "Occupancy Risk Simulator",
  "staffing-calculator": "Staffing Requirement Calculator",
  "aht-decomposition": "AHT Decomposition",
  "fcr-leakage": "FCR Leakage Diagnostic",
  "qa-scorecard": "QA Scorecard Builder",
};
