// src/lib/home.js
//
// The homepage (redesign Phase 5) as data: five doors, each door's question, its routes, and what the stack says
// about each layer. Every count and figure is derived from the registry that owns it, never typed: tools and vendor
// profiles from seo.js, researched vendors from researchStatus.js, methods from methodVersions.js, industries and
// segments from verticals.js and seo.js, industry figures from the claims registry, the layer map from Platform
// Decision's published model. Route steps that are tools take their
// names and links from the journey graph. home.test.mjs checks all of it.
//
// No time estimates: we have not measured how long a route takes, so a route says how many tools it has.

import { TOOL_COUNT, VENDOR_PROFILE_COUNT, CATEGORY_COUNT, SEGMENT_COUNT } from "./seo.js";
import { CCAAS_COMPLETE_COUNT } from "./researchStatus.js";
import { METHOD_VERSIONS, longDate } from "./methodVersions.js";
import { VERTICALS, CATEGORIES } from "./verticals.js";
import { CLAIMS, TESTS } from "./claims.js";
import { JOURNEY } from "./journey.js";
import { PLATFORM_DECISION } from "./rubrics/platformDecision.js";
import { publishedItems, latestDate } from "./marketWatch.js";

const MW_COUNT = publishedItems().length;
const MW_LATEST = latestDate();
export const METHOD_COUNT = Object.keys(METHOD_VERSIONS).length;
export const INDUSTRY_COUNT = Object.keys(VERTICALS).length;
export { SEGMENT_COUNT };

const WORDS = ["", "One", "Two", "Three", "Four"];
const tool = (id, why) => ({ name: JOURNEY[id].name, why, href: JOURNEY[id].route, tool: id });
const page = (name, why, href) => ({ name, why, href });
const toolRoute = (id, label, sub, layer, title, steps, ending) => ({
  id, label, sub, layer, title, steps, ending,
  kicker: "Your route", time: `${WORDS[steps.length]} ${steps.length === 1 ? "tool" : "tools"}`,
  cta: `Start with ${steps[0].name}`, href: steps[0].href, to: steps[0].tool,
});

/* Diagnostics: six things a reader may be trying to work out. `layer` lights one stack layer (Platform Decision's
   map) when the route is about one layer; null lights all seven. */
const DIAGNOSTIC_ROUTES = [
  toolRoute("cost", "What our operation really costs", "Loaded cost per contact, then what repeats add.", null, "Where the cost comes from",
    [tool("cost-per-contact", "Your loaded cost for one contact."), tool("fcr-leakage", "What repeat contacts add to it."), tool("business-case-builder", "Whether a fix pays, graded.")],
    "You fix what repeats, you build a case, or you stop after the first number. All three are answers."),
  toolRoute("ai-proposal", "Whether an AI proposal holds up", "Resolved contacts only, priced per conversation.", "l4", "Test the proposal against your volumes",
    [tool("ai-deflection", "Counts only contacts the bot resolves."), tool("channel-shift", "What moves, and what comes back."), tool("business-case-builder", "The return under your assumptions.")],
    "The proposal holds, it holds with conditions, or it does not pay at your volumes."),
  toolRoute("renewal", "How to approach a renewal", "Your needs, three years of cost, the contract.", null, "Renew, renew with conditions, or evaluate",
    [tool("platform-decision", "Your must-haves, rated as seen in production."), tool("tco-calculator", "Three years of cost, field by field."), tool("contract-risk", "Thirteen clauses, each with a published severity.")],
    "Renew as is, renew with conditions in the contract, or run an evaluation."),
  toolRoute("staffing", "How many people we need", "Erlang C, shrinkage and occupancy.", "l6", "Agents for your service level",
    [tool("staffing-calculator", "Erlang C against your target."), tool("shrinkage-planner", "Paid time off the queue."), tool("occupancy-risk", "What running hot costs.")],
    "Your plan holds, it needs more people, or it needs a different target."),
  toolRoute("readiness", "How ready we are to change", "Published rubrics and a checklist.", null, "Where your organisation stands",
    [tool("cx-maturity", "Your weakest statements, in order."), tool("ai-readiness", "What has to be true before AI."), tool("transformation-readiness", "Whether the change can land.")],
    "A checklist of what to fix first, and the diagnostic that measures it."),
  toolRoute("rfp", "What to put in an RFP", "Requirements first, then scored responses.", null, "Requirements you can score",
    [tool("rfp-builder", "Your requirements, weighted, responses scored."), tool("contract-risk", "The clauses to settle before signing.")],
    "A scored comparison of the vendors you invite, with a demo script for what must be proven."),
];

/* Vendor Intelligence: what the profiles hold today. Findings, break conditions and proof tests arrive with the
   researched profiles (Phase 7); until then no step promises them. */
const VENDOR_ROUTES = [
  { id: "category", label: "Understand a category", sub: `What each of ${CATEGORY_COUNT} categories covers, vendors A to Z.`, layer: null,
    kicker: "Vendor Intelligence", time: `${CATEGORY_COUNT} categories`, title: "The category first, then the vendors",
    steps: [page("Categories", "What each category covers, with its vendors A to Z.", "/vendors"), page("Research status", "Every profile says whether it is researched under the current method, and when.", CATEGORIES.ccaas.page), tool("rfp-builder", "Turn what you need into requirements you can score.")],
    ending: "A view of the category before any vendor is named.", cta: "Open the categories", href: "/vendors", to: "vendor" },
  { id: "vendor", label: "Look up a vendor", sub: "One profile: what it sells and how far it is researched.", layer: null,
    kicker: "Vendor Intelligence", time: `${VENDOR_PROFILE_COUNT} profiles`, title: "Find a vendor",
    steps: [page("The directory", `${VENDOR_PROFILE_COUNT} profiles in ${CATEGORY_COUNT} categories, A to Z.`, "/vendors"), page("The profile", "What it sells, with its research status and date.", "/vendors"), tool("platform-decision", "Rate your own platform on the needs that matter to you.")],
    ending: "What the vendor sells and how much of it is researched, before your next vendor meeting.", cta: "Browse vendors", href: "/vendors", to: "vendor" },
  { id: "starting-list", label: "Build a starting list", sub: "From your requirements, before you invite anyone.", layer: null,
    kicker: "Vendor Intelligence", time: "Three steps", title: "A list you can defend",
    steps: [tool("rfp-builder", "Your must-haves first."), page("Categories", "Which kinds of platform do the job you need.", "/vendors"), tool("contract-risk", "Terms to settle early.")],
    ending: "A starting list with the reason each vendor is on it.", cta: `Start with ${JOURNEY["rfp-builder"].name}`, href: JOURNEY["rfp-builder"].route, to: "rfp-builder" },
];

/* Industries: one route per industry. The figure is the industry's own first contact resolution claim when the
   claims registry holds a published one; otherwise none is shown and the reader is sent to measure theirs. */
const INDUSTRY_FCR = {
  healthcare: "hc.bench.fcr.hc", "financial-services": "fs.bench.fcr.fs", insurance: "ins.bench.fcr.ins", retail: "retail.bench.fcr.retail",
  telecom: "tel.bench.fcr.tel", utilities: "utl.bench.fcr.utl", government: "gov.bench.fcr.gov", travel: "trv.bench.fcr.trv",
};
const INDUSTRY_ROUTES = Object.values(VERTICALS).map((v) => {
  const slug = v.industryPage.split("/").pop();
  const c = INDUSTRY_FCR[slug] ? CLAIMS[INDUSTRY_FCR[slug]] : null;
  const test = TESTS.fcr;
  return {
    id: slug, label: v.name, sub: "", layer: null, kicker: "Industry Insights", time: "Sourced page", title: `${v.name}, sourced`,
    fact: c && c.kind === "fact" ? { value: c.value, label: c.label, source: c.source.publisher, year: c.source.year, url: c.source.url, claim: INDUSTRY_FCR[slug] }
      : { value: null, label: "No public benchmark for first contact resolution in this industry.", test: { name: test.label, href: test.href } },
    steps: [page("The industry page", "Regulation, benchmarks and failure modes, each figure sourced.", v.industryPage), page("Segment frameworks", "Map what you have and need across the seven layers.", v.industryPage), page(test.label, "Measure your own first contact resolution.", test.href)],
    ending: "", cta: `Open ${v.name}`, href: v.industryPage, to: "industry",
  };
});

/* The five doors. Pillar ids match tokens.js; the event slug is the taxonomy's (market-watch). */
export const DOORS = [
  { pillar: "diagnostics", event: "diagnostics", line: "Run the numbers on your own operation: cost, staffing, AI proposals, renewals, readiness.",
    meta: `${TOOL_COUNT} tools. ${METHOD_COUNT} published methods.`, question: "What are you trying to work out?", routes: DIAGNOSTIC_ROUTES, cols: 2 },
  { pillar: "vendors", event: "vendors", line: `Vendor profiles in ${CATEGORY_COUNT} categories, listed A to Z. Never ranked, never paid for.`,
    meta: `${VENDOR_PROFILE_COUNT} profiles. ${CCAAS_COMPLETE_COUNT} CCaaS researched in full.`, question: "How do you want to look at the market?", routes: VENDOR_ROUTES, cols: 1 },
  { pillar: "industries", event: "industries", line: "What your sector demands, sourced: regulation, published benchmarks, failure modes.",
    meta: `${INDUSTRY_COUNT} industries. ${SEGMENT_COUNT} segments.`, question: "Which industry are you in?", routes: INDUSTRY_ROUTES, cols: 5 },
  { pillar: "research", event: "research", line: "Original studies, with the data and the method published beside them.", meta: "In preparation",
    soon: { body: "Studies we run ourselves, starting from what professionals choose to share through the diagnostics. Nothing is collected until the consent design is published.",
      rules: ["Every study publishes its data, its method and its limits.", "Participation is opt-in and anonymous.", "Tell us what to study first: every idea is read."],
      cta: "Suggest a study", href: "/research#ideas" } },
  { pillar: "marketWatch", event: "market-watch", line: "Launches, deals, outages and rules, each labelled for its source.",
    meta: MW_COUNT ? `${MW_COUNT} items. Latest ${longDate(MW_LATEST)}.` : "Items appear as they are checked.", question: "What is new in the market?",
    page: { body: "What is new in the contact center and CX technology market, kept apart from the research. Each item is dated, written in our words from the page it cites, and labelled for its source.",
      rules: ["Every item is labelled: verified, news, or supplied by the vendor.", "An item never changes a profile, a finding or a starting list.", "A new entrant gets a researched profile once it passes the research gate."],
      cta: "Read Market Watch", href: "/market-watch", time: MW_LATEST ? `Updated ${longDate(MW_LATEST)}` : "Open" } },
];

/* The stack. Plain words for what each layer does; the tool and vendor category come from Platform Decision's
   published layer map, so the homepage adds no mapping of its own. */
const LAYER_WHAT = {
  l7: "Reporting, quality, workforce plans and who decides what.",
  l6: "Getting each contact to the right person or bot at the right moment.",
  l5: "Voice, chat and messaging, and one view of the conversation across them.",
  l4: "Bots, agent assist and knowledge that work out what should happen next.",
  l3: "Payments, identity, AI guardrails and the audit trail.",
  l2: "The workflows that finish the job in other systems.",
  l1: "The customer data every other layer reads.",
};
export const LAYER_INFO = Object.fromEntries(PLATFORM_DECISION.layers.map((l) => [`l${l.n}`, {
  what: LAYER_WHAT[`l${l.n}`], technical: l.name, tool: { name: JOURNEY[l.tool].name, href: JOURNEY[l.tool].route }, category: { name: l.categoryLabel, href: l.category },
}]));

/* Proof, from the registries. */
export const PROOFS = [
  { n: String(METHOD_COUNT), text: "methods published: the rules and formulas each tool runs, in words, with where every constant comes from.", link: "Read a method", href: "/methodology/cost-per-contact" },
  { n: String(CCAAS_COMPLETE_COUNT), text: "CCaaS vendors researched under the current method, each profile with its validation date.", link: "See the research", href: CATEGORIES.ccaas.page },
  { n: "A to Z", text: "Vendor lists run alphabetically. No vendor can pay to appear or to move.", link: "About the site", href: "/about" },
];

