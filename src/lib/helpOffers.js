// src/lib/helpOffers.js
//
// Help offers at five moments (open item 11, TB 14 Oct 2026; site audit 30 Sep, section 12 and change 18). An offer
// appears only when a tool's own result says the reader faces a decision a consultant helps with, never on a tool's
// opening state, and never in place of the result, the next step or Stop here. Pure: the tools pass the facts, this
// file decides. It names no vendor and changes no figure, grade, order or next step (no steering, TB S23).
// An offer opens the contact form with its topic chosen (/contact?help=<id>&from=<tool>); the form sends the offer id.
// Events: help_offer_view once per page view of an offer, help_offer_click on the button (taxonomy 1.6).

export const HELP_SHARED = "Matching is free, and if you go further you agree scope and price with the consultant. Nothing about you reaches anyone until you send the form.";

export const OFFERS = {
  "contract-review": {
    tool: "contract-risk",
    when: "The reading is Do not sign as written, or Negotiate before signing.",
    title: "Want a second read of this contract?",
    body: "A consultant who negotiates contact center contracts can go through the flagged clauses with you and help write the changes into the draft before you sign.",
    topic: "Contract review",
    prompt: "The contract's term and renewal date, the clauses the scanner flagged, and who signs...",
  },
  "renewal-evaluation": {
    tool: "platform-decision",
    when: "The renewal gate is Run an evaluation.",
    title: "Want help running the evaluation?",
    body: "A consultant can help you scope the market test, write the requirements and keep the evaluation inside the time your notice period leaves.",
    topic: "Platform selection",
    prompt: "Your current platform, the notice date, the layers the gate flagged, and who decides...",
  },
  "rfp-evaluation": {
    tool: "rfp-builder",
    when: "Two or more vendors' responses are entered.",
    title: "Want help with the demos and the final choice?",
    body: "A consultant can help you script the demos around your must-haves, check the claims marked to verify, and keep the scoring consistent from one vendor to the next.",
    topic: "Vendor evaluation",
    prompt: "How many vendors are left, when the demos are, and what the decision has to settle...",
  },
  "ai-pilot": {
    tool: "ai-deflection",
    when: "The decision is Run a bounded pilot.",
    title: "Want help designing the pilot?",
    body: "A consultant can help you set the pilot's scope, how resolution is measured, the exit criteria, and the contract terms that protect you if the rate falls short.",
    topic: "AI pilot design",
    prompt: "The use case, the vendor or proposal you are testing, your volumes, and when you need an answer...",
  },
  "license-review": {
    tool: "license-gap",
    when: "Your own entries show license cost above the quoted seat price.",
    title: "Want help pricing the full license?",
    body: "A consultant can help you get every module priced, check the edition, usage and renewal terms, and negotiate before you commit.",
    topic: "License and pricing review",
    prompt: "The platform, seat count, the modules you need and when the quote expires...",
  },
};

export const OFFER_IDS = Object.keys(OFFERS);
const known = (id) => typeof id === "string" && Object.prototype.hasOwnProperty.call(OFFERS, id);
export const HELP_TOPICS = [...new Set(OFFER_IDS.map((id) => OFFERS[id].topic))];

/** The one offer a tool's result calls for, or null. Each rule reads facts the tool already shows the reader. */
export function offerFor(tool, f = {}) {
  switch (tool) {
    case "contract-risk": return f.reading === "doNotSign" || f.reading === "negotiate" ? "contract-review" : null;
    case "platform-decision": return f.gate === "evaluate" ? "renewal-evaluation" : null;
    case "rfp-builder": return Number.isInteger(f.vendors) && f.vendors >= 2 ? "rfp-evaluation" : null;
    case "ai-deflection": return f.verdict === "Run a bounded pilot" ? "ai-pilot" : null;
    case "license-gap": return f.real === true && f.voided === false && Number.isFinite(f.hiddenAnnual) && f.hiddenAnnual > 0 ? "license-review" : null;
    default: return null;
  }
}

const FROM = /^[a-z0-9][a-z0-9-]{0,39}$/;

/** The contact link for an offer. */
export function helpHref(id, from) {
  if (!known(id)) return "/contact";
  const q = new URLSearchParams({ help: id });
  if (typeof from === "string" && FROM.test(from)) q.set("from", from);
  return "/contact?" + q.toString();
}

/** The offer a contact link asks for, or null. Only a known id passes. */
export function readHelp(search) {
  const q = new URLSearchParams(typeof search === "string" ? search : "");
  const id = q.get("help");
  if (!known(id)) return null;
  const from = FROM.test(q.get("from") || "") ? q.get("from") : null;
  return { id, ...OFFERS[id], from };
}
