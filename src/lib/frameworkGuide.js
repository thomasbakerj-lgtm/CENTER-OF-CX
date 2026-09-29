/* frameworkGuide.js
 *
 * The 7-Layer CX Orchestration Framework, the downloadable guide behind /research/orchestration-framework, as data
 * (TB, 29 Sep 2026: rebuild the April edition, which carried unsourced figures, retired wording, an out of date EU AI Act
 * date and dead links). scripts/framework-pdf.mjs renders this object to public/CX-Orchestration-Framework-2026.pdf, and
 * framework.test.mjs holds the rules: our own words, no dash, no retired or superlative wording, no bare figure (a figure
 * appears only through a published comparison, with its source), every site link live, and the committed PDF built from
 * this exact content.
 *
 * Layer names and numbers are the site's own (tokens.js LAYERS; Platform Decision's published model maps each layer to a
 * tool). The framework describes; it scores nothing and ranks no one.
 */

import { LAYERS } from "./tokens.js";
import { GROUPS, rowSource } from "./comparisons.js";

export const GUIDE = {
  title: "The 7-Layer CX Orchestration Framework",
  edition: "2026 edition",
  updated: "29 September 2026",
  replaces: "the April 2026 edition",
  subtitle: "How the layers of a contact center stack connect, who usually owns each one, and what to check before you change any of them.",
  file: "/CX-Orchestration-Framework-2026.pdf",
};

export const INTRO = [
  "A contact center runs on more than one platform. Customer data, workflows, rules, automated reasoning, the conversation itself, routing and measurement each have their own systems, owners and pace of change. When they are bought and run as one decision, the weakest connection sets the experience the customer gets.",
  "This framework separates the stack into seven layers so each can be owned, tested and changed on its own terms. It gives you a shared vocabulary for the people who run the operation, the people who build the technology and the people who fund it.",
  "Use it in four steps: place each of your systems on a layer; name who owns each layer today; read the questions for the layers you are about to change; then rate the readiness statements at the end and start with the weakest layer.",
];

/* One entry per layer, bottom of the stack first. `tools` are live routes on the site that test the layer with your own
   numbers; `figures` names comparison groups whose rows are shown with their sources. */
export const LAYER_GUIDE = [
  { n: 1, what: "The systems of record the rest of the stack reads and writes: CRM, case management, billing, order and account systems, and the event streams between them.",
    owners: "Data and platform owners, with the business owner of each system of record.",
    questions: [
      "Can the contact center read and write the customer record while the customer is still on the line, or does it wait for a later sync?",
      "Which systems does a typical contact touch, and who owns each one?",
      "Are interaction events (contact started, intent recognised, escalation) published somewhere the other layers can use them?",
    ],
    check: "List every system an agent or automated flow reads during a contact, with who owns it, how fresh its data is and whether it can be written back to. The gaps agents complain about most are usually the first integrations to fix.",
    breaks: "Every layer above loses context: automated answers cannot personalise, routing cannot prioritise, and agents ask customers for what the company already knows.",
    tools: [["/tools/cx-it-alignment", "CX IT Alignment"]] },
  { n: 2, what: "The workflows that carry out a request across systems: process engines, integration platforms and robotic automation.",
    owners: "Automation and integration engineers, with the operations owner of each process.",
    questions: [
      "Which of your highest-volume requests can be completed end to end without someone copying data between systems?",
      "When a workflow fails part way (a declined payment, a timeout, a policy exception), does it recover, or does the customer start again?",
      "Can your workflows be started through an API by an automated agent as well as by a person?",
    ],
    check: "Map your highest-volume workflows from start to finish: every system, every handoff and every point where one fails. Mark each as automated, partly automated or manual.",
    breaks: "The request is understood but not fulfilled. Agents complete it by hand and customers wait longer.",
    tools: [["/tools/tco-calculator", "TCO Calculator"], ["/tools/aht-decomposition", "AHT Decomposition"]] },
  { n: 3, what: "The rules every interaction must respect: payment security, identity verification, fraud controls, privacy and the guardrails on automated decisions.",
    owners: "Compliance, security, fraud and risk teams, with legal review of contracts.",
    questions: [
      "Do agents ever hear or type card numbers, or is payment handled outside the conversation?",
      "Is a customer verified the same way on voice, chat and self-service?",
      "For every point where an automated system answers a customer, what stops it promising what the business cannot deliver or disclosing what it should not?",
    ],
    check: "Document every point where an automated system makes or shapes a customer-facing decision, and the guardrail on each. If you serve customers in the EU, check which obligations of the AI Act apply to you and when, as amended by Regulation (EU) 2026/1744.",
    breaks: "Automated answers go ungoverned, payment flows fail and compliance exposure grows.",
    tools: [["/tools/contract-risk", "Contract Risk"], ["/tools/governance-model", "Governance Model"]] },
  { n: 4, what: "The reasoning that decides the next step: virtual agents, agent assist, knowledge retrieval and automated agents that act on a customer's behalf.",
    owners: "Conversation designers, knowledge owners and the CX architect, with risk review for anything that acts on its own.",
    questions: [
      "Does your virtual agent answer from your current knowledge, policies and product data, or only from what it was built with?",
      "Does agent assist help during the conversation, or only summarise after it ends?",
      "What share of contacts does automation fully resolve today, measured the same way a customer would judge it?",
    ],
    check: "Review your knowledge base on a schedule you set and keep: who owns each article, when it was last checked, and what the automated layer does when the answer is not there.",
    breaks: "Self-service fails, contacts that could have been resolved flow to agents, and queues grow.",
    figures: ["deflection"],
    tools: [["/tools/ai-deflection", "AI Deflection Reality Check"], ["/tools/ai-readiness", "AI Readiness"]] },
  { n: 5, what: "The conversation itself: voice, chat, messaging, email, social and in-app support, and the agent workspace where they meet.",
    owners: "Channel and telephony owners, CX designers and the operations leaders who staff each channel.",
    questions: [
      "If a customer moves from chat to a call, does the agent see what was already said?",
      "Can your digital channels carry a complex conversation to resolution, or only simple questions?",
      "How many applications does an agent open to resolve a typical contact?",
    ],
    check: "Test continuity yourself: start a conversation in one channel, move it to another, and see what carries over. Count the applications an agent opens on a typical contact.",
    breaks: "Customers repeat themselves, channels fall out of step, and the measurement layer loses the thread.",
    figures: ["channels"],
    tools: [["/tools/channel-shift", "Channel Shift"], ["/tools/fcr-leakage", "FCR Leakage"]] },
  { n: 6, what: "Routing and orchestration: which person or automated agent takes each contact, in what order, with what context and with what authority.",
    owners: "Routing and workforce specialists and the CX architect.",
    questions: [
      "Do you route on skill tags alone, or also on intent, customer history and the capacity actually available?",
      "Can routing send a contact to an automated agent first and hand it to a person, with context, when needed?",
      "Does routing coordinate with workforce management, the CRM and knowledge, or run on its own?",
    ],
    check: "List your routing rules and when each was last reviewed, and check that the staffing plan behind them matches the demand the rules create.",
    breaks: "Contacts reach the wrong person or the wrong automated agent, transfers rise and customer effort climbs.",
    figures: ["service"],
    tools: [["/tools/staffing-calculator", "Staffing Calculator"], ["/tools/occupancy-risk", "Occupancy Risk"]] },
  { n: 7, what: "Measurement and governance: quality management, workforce management, speech and text analytics, journey analytics and compliance monitoring.",
    owners: "Workforce, quality and analytics leads, with compliance.",
    questions: [
      "How are interactions chosen for quality review, and does the sample size answer the questions you ask of it?",
      "How far are your forecasts from actual volume, measured interval by interval?",
      "Do findings from analytics change routing, coaching and automated answers, or stop at a dashboard?",
    ],
    check: "Measure your forecast accuracy by interval, calibrate your quality evaluators against each other, and trace one recent finding from the dashboard to the change it produced.",
    breaks: "Nothing stops at once, but quality drifts unseen, staffing falls out of step with demand and compliance gaps widen.",
    figures: ["adherence"],
    tools: [["/tools/forecast-accuracy", "Forecast Accuracy"], ["/tools/qa-scorecard", "QA Scorecard"], ["/tools/schedule-adherence", "Schedule Adherence"]] },
];

/* What each layer depends on: if the first fails, the others feel it. Our reading of the stack, in words. */
export const DEPENDENCIES = [
  [1, "Every layer above", "Agents and automated answers work without context."],
  [2, "Layers 4, 5 and 6", "Requests are understood but not completed."],
  [3, "Layers 4 and 5", "Automated answers and payments run without the rules they need."],
  [4, "Layers 5 and 6", "Contacts that automation could resolve reach agents instead."],
  [5, "Layers 6 and 7", "Customers cannot reach you in the channel they chose, and measurement loses data."],
  [6, "Layers 5 and 7", "Contacts reach the wrong resource and effort rises."],
  [7, "No layer at once", "Quality, staffing and compliance drift without anyone seeing it."],
];

/* Readiness statements, two per layer, rated 1 to 5. The same rule the site's assessments use: any statement rated 2 or
   below is an action, weakest layer first. No total, band or verdict. */
export const SCALE = ["Not started", "Partly in place", "Working", "Working and reviewed", "Working, reviewed and improving"];
export const CHECKLIST = [
  [1, "The contact center can read and write customer, billing and case data while the customer is on the line."],
  [1, "Every system the contact center depends on is documented with its owner."],
  [2, "Our highest-volume workflows are documented end to end, with the systems each one touches."],
  [2, "Our highest-volume requests complete without anyone copying data between systems."],
  [3, "Card payments are handled outside the conversation."],
  [3, "Every point where automation answers a customer has a documented guardrail and an owner."],
  [4, "Automated answers draw on current knowledge, policies and product data."],
  [4, "The knowledge base is reviewed on a schedule we keep, and each article has an owner."],
  [5, "Context carries over when a customer moves between chat, voice and self-service."],
  [5, "Agents resolve a typical contact from one workspace."],
  [6, "Routing rules are reviewed on a schedule and reflect current priorities."],
  [6, "Routing can send a contact to an automated agent first and hand it to a person with context."],
  [7, "The quality sample is chosen on purpose and big enough for the questions we ask of it."],
  [7, "Findings from analytics change routing, coaching and automated answers."],
];

export const ABOUT = {
  is: "A planning framework: the decisions each layer holds, who usually holds them, and what to check before you change anything. It is our own synthesis, in our own words.",
  isnt: "It is not a vendor evaluation. It does not score, rank or name platforms, and it does not replace architecture design for your operation.",
  figures: "Figures appear only where a publisher reports one, each with its source and date. Everything else is a question to answer with your own numbers, and each layer names a free diagnostic on the site that does it.",
  changes: [
    "Unsourced figures are removed, including a 2% quality sample, a 10% forecast gap and fixed review intervals.",
    "Predictions about the next 12 months are removed; each layer now says what to check today.",
    "The EU AI Act note now points to the obligations as amended by Regulation (EU) 2026/1744.",
    "The readiness checklist no longer totals to a maturity band; a statement rated 2 or below is an action.",
    "Links to retired tools are replaced with the diagnostics that exist today.",
  ],
};

/* The published figures a layer shows, resolved from the comparison groups with their sources. */
export function layerFigures(layer) {
  return (layer.figures || []).map((g) => {
    const group = GROUPS[g]();
    return { title: group.title, rows: group.rows.map((r) => ({ label: r.label, value: r.value, source: rowSource(r, group) })) };
  });
}

export const layerMeta = (n) => LAYERS.find((l) => l.n === n);
