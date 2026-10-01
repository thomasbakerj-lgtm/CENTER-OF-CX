// Single source of truth for per-route SEO.
// Imported by App.jsx at runtime and by prerender.mjs at build time.
// Must stay free of JSX and browser globals so Node can import it directly.

export const BASE = "https://www.contactcentercx.com";
export const SITE = "The Center of CX";

export const SEO_MAP = {
  "/": {
    title: `${SITE} | Contact Center Decision Tools and Vendor Research`,
    desc: "Set below with the live counts.",
  },
  "/vendors": {
    title: `Contact Center Vendors | ${SITE}`,
    desc: "Set below with the live counts.",
  },
  "/platforms-and-tech": {
    title: `Platforms + Tech | ${SITE}`,
    desc: "Nine CX technology decision domains mapped to seven orchestration layers. Understand what you need, who owns it, and what breaks when you choose wrong.",
  },
  "/about": {
    title: `About | ${SITE}`,
    desc: "What The Center of CX offers, how every figure is made and graded, the rules that keep vendor research independent, and what happens to your data.",
  },
  "/advisory": {
    title: `Find a CX Consultant | ${SITE}`,
    desc: "Find a contact center or CX consultant we have vetted: platform selection, AI strategy and operational change, matched to your industry and problem.",
  },
  "/contact": {
    title: `Connect with a CX Consultant | ${SITE}`,
    desc: "Tell us your challenge. We connect you with vetted CX consultants who specialize in your vertical, stack, and transformation stage.",
  },
  "/subscribe": {
    title: `Subscribe | ${SITE}`,
    desc: "CX technology intelligence delivered. Vendor updates, framework releases, and market analysis from The Center of CX.",
  },
  "/how-to-choose": {
    title: `Contact Center Tools | ${SITE}`,
    desc: "Set below with the live counts.",
  },
  "/research": {
    title: `Research: Vendors, Methods and Industries | ${SITE}`,
    desc: "What we have researched and how to check it: vendor research by category, published methods, sourced industry pages, Market Watch and perspectives.",
  },
  "/vendors/ccaas": {
    title: `CCaaS Vendors: 24 Platforms Profiled by the Job They Do | ${SITE}`,
    desc: "24 CCaaS vendors and 4 adjacent suites by the job each does. For the 18 researched: where it fits, where it breaks, and sources. Scores withdrawn.",
  },
  "/vendors/iva": {
    title: `IVA + Conversational AI: 50 Vendors Profiled | ${SITE}`,
    desc: "50 IVA and conversational AI vendors in 7 groups, from enterprise IVA and voice-native to helpdesk and CRM AI. Phase 1 scores withdrawn.",
  },
  "/vendors/acd-routing": {
    title: `ACD + Routing: 44 Vendors Profiled | ${SITE}`,
    desc: "44 ACD and routing vendors by segment: routing logic, AI routing, failover and global scale. Phase 1 scores withdrawn until current research.",
  },
  "/vendors/analytics": {
    title: `Advanced Analytics: 41 Vendors Profiled | ${SITE}`,
    desc: "41 analytics vendors in 6 groups: CCaaS-embedded, AI-native, WEM, LLM infrastructure, agent assist and product analytics. Phase 1 scores withdrawn.",
  },
  "/vendors/payments": {
    title: `Payment Technology: 33 Vendors Profiled | ${SITE}`,
    desc: "33 payment providers: unified commerce, digital-first, in-store, orchestration, regional and specialty. Phase 1 scores withdrawn.",
  },
  "/vendors/digital-engagement": {
    title: `Digital Engagement: 46 Platforms Profiled | ${SITE}`,
    desc: "46 digital engagement platforms: CCaaS-native, messaging, social care, AI automation and helpdesk. Phase 1 scores withdrawn.",
  },
  "/vendors/agent-assist": {
    title: `Agent Assist: 15 Vendors Profiled | ${SITE}`,
    desc: "15 agent assist vendors by type: real-time guidance, knowledge grounding, workflow, coaching and compliance. Phase 1 scores withdrawn.",
  },
  "/cx-ecosystem": {
    title: `CX Industry Publications and Communities | ${SITE}`,
    desc: "The publications, research hubs and communities CX and contact center professionals read, with what each covers.",
  },
  "/methodology/cx-maturity": {
    title: `CX Maturity Rubric: How the Assessment Scores | ${SITE}`,
    desc: "The published rubric behind the CX Maturity Assessment: 25 statements in 5 equal dimensions, band cut points, each statement's action and the limits.",
  },
  "/methodology/transformation-readiness": {
    title: `Transformation Readiness Rubric: How It Scores | ${SITE}`,
    desc: "The published rubric behind the Transformation Readiness Scorecard: 24 statements, 6 dimensions, band cut points, gap flags and each action.",
  },
  "/methodology/cx-it-alignment": {
    title: `CX + IT Alignment Rubric: How the Framework Scores | ${SITE}`,
    desc: "The published rubric behind CX + IT Alignment: 15 paired statements in 5 areas, gap bands, the misalignment and shared-weakness rules, and each action.",
  },
  "/methodology/governance-model": {
    title: `Governance & Operating Model: How the Map Is Read | ${SITE}`,
    desc: "The published model behind Governance & Operating Model: 30 decisions in 6 domains, the owner each needs, and the six finding rules and thresholds.",
  },
  "/methodology/platform-decision": {
    title: `Platform Decision Method: The Renewal Gate | ${SITE}`,
    desc: "The method behind Platform Decision: 35 needs across 7 layers, must-have gaps, proof requests for unknowns, the renewal gate and the notice-date clock.",
  },
  "/methodology/contract-risk": {
    title: `Contract Risk Method: How Each Clause Is Rated | ${SITE}`,
    desc: "The method behind the Contract Risk Scanner: 13 clauses, each option's severity and reason, the reading rule and the negotiation positions.",
  },
  "/methodology/rfp-builder": {
    title: `RFP Builder Method: Requirements and Response Scoring | ${SITE}`,
    desc: "The method behind the RFP Builder: requirements by layer, default weights, response credits (only GA earns full credit), clarifications and demo checks.",
  },
  "/methodology/occupancy-risk": {
    title: `Occupancy Risk Method: Formulas and a Worked Example | ${SITE}`,
    desc: "The method behind the Occupancy Risk Simulator: workload in Erlangs, occupancy bands, staffing to a target, the attrition model and a worked example.",
  },
  "/methodology/shrinkage-planner": {
    title: `Shrinkage Planner Method: Formulas and a Worked Example | ${SITE}`,
    desc: "The method behind the Shrinkage Planner: planned and unplanned shrinkage on one base, agents to schedule, paid time off the queue and a worked example.",
  },
  "/methodology/aht-decomposition": {
    title: `AHT Decomposition Method: Levers and a Worked Example | ${SITE}`,
    desc: "The method behind AHT Decomposition: handle time by component, levers as editable shares, how they combine, freed agent hours and a worked example.",
  },
  "/methodology/forecast-accuracy": {
    title: `Forecast Accuracy Method: WAPE, MAPE and Bias | ${SITE}`,
    desc: "The method behind the Forecast Accuracy Tracker: WAPE as the headline, MAPE, why total accuracy hides interval errors, bias and the tracking signal.",
  },
  "/methodology/schedule-adherence": {
    title: `Schedule Adherence Method: Erlang C and Overtime | ${SITE}`,
    desc: "The method behind the Schedule Adherence calculator: adherence as agents on the queue, Erlang C service level, agents to schedule and overtime cost.",
  },
  "/methodology/staffing-calculator": {
    title: `Staffing Calculator Method: Erlang C, FTE and Cost | ${SITE}`,
    desc: "The method behind the Staffing Calculator: offered load, Erlang C, agents for a service level, occupancy ceilings, shrinkage to FTE and annual cost.",
  },
  "/methodology/cost-per-contact": {
    title: `Cost per Contact Method: Cost per Resolution | ${SITE}`,
    desc: "The method behind the Cost per Contact Calculator: contacts per resolution, cost per resolution, repeat demand, channel cost and capacity released.",
  },
  "/methodology/channel-shift": {
    title: `Channel Shift Method: Net Minutes and Break-even | ${SITE}`,
    desc: "The method behind the Channel Shift Model: eligible voice, displacement and bounce-back, net minutes freed, bot fees, payback and break-even.",
  },
  "/methodology/fcr-leakage": {
    title: `FCR Leakage Method: Repeat Burden, Ceiling and Payback | ${SITE}`,
    desc: "The method behind the FCR Leakage Diagnostic: repeat burden, the practical ceiling by scope, contacts avoided, realizable savings and payback.",
  },
  "/methodology/ai-deflection": {
    title: `AI Deflection Method: Net Savings and Break-even | ${SITE}`,
    desc: "The method behind the AI Deflection Reality Check: coverage, true resolution, net automation, net savings, break-even resolution and a worked example.",
  },
  "/methodology/tco-calculator": {
    title: `TCO Method: Labor, Technology and Three Years | ${SITE}`,
    desc: "The method behind the TCO Calculator: labor, attrition, telephony, technology and overhead, cost per contact and resolution, levers and an example.",
  },
  "/methodology/license-gap": {
    title: `License Gap Method: Quoted Seat to Platform Cost | ${SITE}`,
    desc: "The method behind the License Gap Checker: quoted seat to effective seat and platform cost, the bundle gap, commit exposure and a worked example.",
  },
  "/methodology/attrition-cost": {
    title: `Attrition Cost Method: Cash, Capacity and Avoided Cost | ${SITE}`,
    desc: "The method behind the Attrition Cost Calculator: cash and capacity per departure, vacancy coverage, annual burden, avoided cost and a worked example.",
  },
  "/methodology/business-case-builder": {
    title: `Business Case Method: Levers, Realization, Return | ${SITE}`,
    desc: "The method behind the Business Case Builder: four levers, attribution, realization by capacity action, three-year cash flow, return and payback.",
  },
  "/methodology/qa-scorecard": {
    title: `QA Scorecard Method: Form Checks and Blind Calibration | ${SITE}`,
    desc: "The method behind the QA Scorecard Builder: form checks and blind calibration with Krippendorff's alpha, Gwet's AC1, bootstrap intervals and sources.",
  },
  "/methodology/ai-readiness": {
    title: `AI Readiness Rubric: How the Diagnostic Scores | ${SITE}`,
    desc: "The published rubric behind the AI Readiness Diagnostic: 24 statements in 6 equal dimensions, band cut points, each statement's action and the limits.",
  },
  "/tools/cx-maturity": {
    title: `CX Maturity Assessment | ${SITE}`,
    desc: "25 statements across strategy, operations, technology, analytics and governance. Your band, an action for each weak statement and a next diagnostic.",
  },
  "/tools/ai-readiness": {
    title: `AI Readiness Diagnostic for Contact Centers | ${SITE}`,
    desc: "24 statements across 6 dimensions, from data and workflow to governance and talent. See where AI would stall and what to fix first.",
  },
  "/tools/cx-it-alignment": {
    title: `CX + IT Alignment Framework | ${SITE}`,
    desc: "Rate 15 paired CX and IT statements to reveal alignment gaps in strategy, data, platforms, AI, and governance. Identify where misalignment creates friction.",
  },
  "/tools/governance-model": {
    title: `Governance + Operating Model | ${SITE}`,
    desc: "Map ownership across 30 CX responsibilities: strategy, operations, technology, AI, analytics, and budget. Identify governance gaps and overloaded functions.",
  },
  "/tools/roadmap-builder": {
    title: `Transformation Roadmap Builder: 90-Day Plan | ${SITE}`,
    desc: "Build a structured 90-day CX transformation plan with 18 milestones, dependencies, and status tracking across three phases.",
  },
  "/tools/business-case": {
    title: `Business Case Builder: CX Transformation ROI | ${SITE}`,
    desc: "Model the ROI of your CX transformation. Calculate savings from AHT reduction, self-service containment, attrition improvement, and FCR gains.",
  },
  "/industries": {
    title: `Industries | ${SITE}`,
    desc: "Ten industries and their segments: what their contact centers handle, the rules that apply, sourced figures and the technology each layer needs.",
  },
  "/industries/financial-services": {
    title: `Financial Services Contact Center CX | ${SITE}`,
    desc: "Banking, lending, payments and wealth contact centers: Regulation E and other rules, sourced figures, failure modes and the technology they need.",
  },
  "/industries/healthcare": {
    title: `Healthcare Contact Center CX | ${SITE}`,
    desc: "Health system, payer, digital health and pharma contact centers: HIPAA, Medicare rules, sourced figures and the technology each layer needs.",
  },
  "/industries/retail": {
    title: `Retail + eCommerce Contact Center CX | ${SITE}`,
    desc: "eCommerce, omnichannel, subscription and marketplace contact centers: returns, peak season, payment rules and the technology each layer needs.",
  },
  "/industries/telecom": {
    title: `Telecommunications Contact Center CX | ${SITE}`,
    desc: "Wireless, broadband, cable and enterprise communications contact centers: CPNI, billing disputes, retention and the technology they need.",
  },
  "/research/iva-buyer-guide": {
    title: `IVA + Conversational AI Buyer's Guide 2026 | ${SITE}`,
    desc: "Phase 1 edition, April 2026: 43 IVA and conversational AI vendors, architecture eras, demo questions and cost traps. Its scores and tiers are withdrawn on the site until the category is researched under the current methodology.",
  },
  "/research/ccaas-buyer-guide": {
    title: `CCaaS Platform Buyer's Guide 2026 | ${SITE}`,
    desc: "Phase 1 edition, April 2026: 28 CCaaS platforms on 27 dimensions, operating-model fit and migration risk. Its scores and tiers are withdrawn on the site.",
  },
  "/human-premium": {
    title: `The Human Premium: Contact Center Careers and AI | ${SITE}`,
    desc: "New roles, career paths and checked certifications for contact center professionals as AI takes on more of the work, with each provider's price.",
  },
  "/research/ccaas-migration-costs": {
    title: `Cloud Contact Center Migration Costs to Plan For | ${SITE}`,
    desc: "Costs a CCaaS migration quote tends to leave out: integration, add-on modules, training, parallel running and a longer timeline, and how to price each.",
  },
  "/research/orchestration-framework": {
    title: `The 7-Layer CX Orchestration Framework 2026 | ${SITE}`,
    desc: "How every layer connects, who owns each one, and what to prepare for in the next 12 months. Layer-by-layer deep dives, integration dependencies, and a 14-question readiness checklist.",
  },
  "/tools/staffing-calculator": {
    title: `Erlang C Staffing Calculator | ${SITE}`,
    desc: "Turn call volume, handle time, service level and shrinkage into the agents and FTE you need with Erlang C, and see what happens when you are short.",
  },
  "/tools/shrinkage-planner": {
    title: `Shrinkage Planner: Planned and Unplanned Shrinkage | ${SITE}`,
    desc: "Model planned and unplanned shrinkage across 8 categories, the agents you need to schedule, and the paid time spent off the queue each year.",
  },
  "/tools/occupancy-risk": {
    title: `Occupancy Risk Simulator: Occupancy vs Burnout | ${SITE}`,
    desc: "See what occupancy does to idle time, burnout risk and attrition cost, and what staffing to a target occupancy costs in a year.",
  },
  "/tools/forecast-accuracy": {
    title: `Forecast Accuracy Tracker: WAPE and Bias by Interval | ${SITE}`,
    desc: "Compare forecast and actual by interval. Interval accuracy (WAPE), MAPE, bias and the tracking signal show where your forecast breaks down.",
  },
  "/tools/schedule-adherence": {
    title: `Schedule Adherence Impact Calculator | ${SITE}`,
    desc: "See how 1-10 points of adherence loss cascade into SLA degradation, ASA spikes, higher abandonment, and overtime cost.",
  },
  "/tools/attrition-cost": {
    title: `Agent Attrition Cost Calculator | ${SITE}`,
    desc: "The full cost of each agent who leaves: recruiting, training, ramp, supervisor time and overtime, plus why agents leave and what to check next.",
  },
  "/tools/cost-per-contact": {
    title: `Cost per Contact vs Cost per Resolution Calculator | ${SITE}`,
    desc: "A $7 call that takes 3 contacts to resolve costs $21. Separate handle cost from resolution cost and quantify the real price of low FCR.",
  },
  "/tools/ai-deflection": {
    title: `AI Deflection Reality Check: Net Savings of a Bot | ${SITE}`,
    desc: "Test a vendor's deflection claim: coverage, true resolution, repeat contacts, bot fees and escalations, and the net saving that survives them.",
  },
  "/tools/channel-shift": {
    title: `Channel Shift Economics Model | ${SITE}`,
    desc: "What happens when you move voice to chat, bot, or email? Model the real staffing, cost, and transition impact of channel migration.",
  },
  "/tools/license-gap": {
    title: `License Bundle Gap Checker | List Price vs Real Cost | ${SITE}`,
    desc: "Compare the vendor seat price against what you actually need. WEM, QA, analytics, AI, telephony, storage, support. See the real gap.",
  },
  "/tools/aht-decomposition": {
    title: `AHT Decomposition: What Makes Up Your Handle Time | ${SITE}`,
    desc: "Break handle time into talk, hold, wrap, transfer, search and admin, then test which levers move it and what the freed agent hours are worth.",
  },
  "/tools/qa-scorecard": {
    title: `QA Scorecard Builder and Blind Calibration | ${SITE}`,
    desc: "Build weighted QA forms, check they produce defensible scores, and calibrate evaluators blind with Krippendorff's alpha and Gwet's AC1.",
  },
  "/tools/fcr-leakage": {
    title: `FCR Leakage Diagnostic | What Drives Repeat Contacts | ${SITE}`,
    desc: "Low FCR is a symptom. This tool identifies the root cause across policy, handoffs, channels, knowledge, skills, and workflows.",
  },
  "/tools/vendor-match": {
    title: `Vendor Match: A CCaaS Starting List | ${SITE}`,
    desc: "Enter your size, industry, priorities and constraints for a starting list of CCaaS platforms, with the Phase 1 method disclosed. No vendor pays to appear.",
  },
  "/tools/platform-decision": {
    title: `Platform Decision: Renew or Evaluate Your CCaaS | ${SITE}`,
    desc: "Decide at renewal: renew, renew with conditions, add a specialist or run an evaluation. Rate 35 needs across 7 layers against your notice date.",
  },
  "/tools/contract-risk": {
    title: `Contract Risk Scanner: CCaaS Contract Red Flags | ${SITE}`,
    desc: "Rate 13 clauses of a contact center platform contract: renewal, price, SLA, liability, exit, data, AI use and add-ons. See what to ask for instead.",
  },
  "/tools/transformation-readiness": {
    title: `Transformation Readiness Scorecard | ${SITE}`,
    desc: "Score leadership, budget, team capacity, vendor, technical and change readiness in 24 statements, with the gaps to close before you commit.",
  },
  "/tools/rfp-builder": {
    title: `RFP Requirement Builder for Contact Centers | ${SITE}`,
    desc: "Build weighted RFP requirements by layer for your industry and size, then score vendor responses: must-haves met, what is GA, what to verify in a demo.",
  },
  "/market-watch": {
    title: `Market Watch: Contact Center and CX Technology News | ${SITE}`,
    desc: "Dated items on launches, retirements, deals, outages and rules in contact center technology, each written from its source and labelled by it.",
  },
  "/perspectives": {
    title: `Contributor Perspectives | ${SITE}`,
    desc: "Practitioners, consultants and analysts writing under their own names, checked for facts, sources and disclosure. A perspective never changes a finding.",
  },
  /* A published piece or contributor gets its own entry here when it is published ("/perspectives/<slug>": title with the
     author, desc the piece's dek; "/contributors/<slug>"); contributors.test.mjs requires one for each and no other.
     Any other slug under those paths is noindex. */
  "/contribute": {
    title: `Write for The Center of CX | Contributor Rules | ${SITE}`,
    desc: "Publish under your own name: who may write, how review works, disclosure of vendor ties, no product promotion, you keep copyright, and how to propose a piece.",
  },
  "/corrections": {
    title: `How Corrections Work | Vendor Research | ${SITE}`,
    desc: "How anyone, including a vendor, can report an error in our research: what to send, when we answer, and why only public evidence changes a finding.",
  },
  "/privacy": {
    title: `Privacy Policy | ${SITE}`,
    desc: "How The Center of CX collects and uses personal information: what stays in your browser, what forms send, who processes it and the choices you have.",
  },
  "/terms": {
    title: `Terms of Use | ${SITE}`,
    desc: "The terms for using The Center of CX: tools and research as decision support, vendor information and introductions, submissions and liability.",
  },
  "/vendors/wem-qm": {
    title: `Workforce + Quality Management: 25 Vendors Profiled | ${SITE}`,
    desc: "25 WEM, WFM and QA vendors across 3 market layers, with the demo checks each should pass. Phase 1 scores withdrawn.",
  },
  "/industries/education": {
    title: `Education Contact Center CX | ${SITE}`,
    desc: "Admissions, financial aid, student services and online learning contact centers: FERPA, Title IV, sourced figures and the technology they need.",
  },
  "/industries/manufacturing": {
    title: `Manufacturing + Automotive Contact Center CX | ${SITE}`,
    desc: "Automotive, industrial, electronics and aerospace contact centers: recalls, warranty claims, parts and field service, and the technology they need.",
  },
  "/industries/government": {
    title: `Government + Public Sector Contact Center CX | ${SITE}`,
    desc: "Federal, state, local, courts, public safety and social services contact centers: Section 508, ADA Title II, language access and technology.",
  },
  "/industries/utilities": {
    title: `Utilities + Energy Contact Center CX | ${SITE}`,
    desc: "Electric, gas and water contact centers: outage surges, gas emergency procedures, regulation and the technology each layer needs.",
  },
  "/industries/insurance": {
    title: `Insurance Contact Center CX | ${SITE}`,
    desc: "P&C, life, commercial and specialty insurance contact centers: claim deadlines, catastrophe surges, state rules and the technology they need.",
  },
  "/industries/travel": {
    title: `Travel + Hospitality Contact Center CX | ${SITE}`,
    desc: "Airline, hotel, OTA, car rental and cruise contact centers: DOT refunds, EU 261, disruption surges and the technology each layer needs.",
  },
  "/tools/tco-calculator": {
    title: `Contact Center TCO Calculator | ${SITE}`,
    desc: "Model contact center total cost of ownership: labor, technology, telephony and overhead, cost per contact and per resolution, and three years out.",
  },
};
import { CATEGORIES, VERTICALS, hasScoredVerticalFit, CCAAS_INDEXED_INDUSTRIES } from "./verticals.js";
import { METHOD_VERSIONS } from "./methodVersions.js";

/* Derived counts. Every surface that states a tool or vendor count reads these
   rather than carrying its own literal, so a number on the homepage cannot
   drift from the data behind it. Homepage.jsx and Vendors.jsx both carried
   hand-typed counts that disagreed with the category pages they linked to.

   TOOL_COUNT is the tool routes in SEO_MAP, the same set prerender.mjs and the
   sitemap already build from. VENDOR_PROFILE_COUNT is the eight scored
   categories plus the adjacent platforms tracked on the CCaaS page but not
   scored as core CCaaS. seo.test.mjs section E holds all three to the live
   data files, so a vendor added or removed fails the suite before it ships a
   claim a buyer can disprove. */
export const TOOL_COUNT = Object.keys(SEO_MAP).filter((p) => p.startsWith("/tools/")).length;
/* The tools hub states the live count, never a hand-written one (it said 30 after the retirements). */
Object.assign(SEO_MAP, { "/how-to-choose": {
  title: `${TOOL_COUNT} Free Contact Center Tools and Calculators | ${SITE}`,
  desc: `${TOOL_COUNT} free tools for contact center teams: staffing, TCO, QA, handle time, vendor fit and more, each with a published method. No sign-up.`,
} });
export const CATEGORY_COUNT = Object.keys(CATEGORIES).length;
export const ADJACENT_PROFILE_COUNT = 4;
export const VENDOR_PROFILE_COUNT =
  Object.values(CATEGORIES).reduce((a, c) => a + c.vendorCount, 0) + ADJACENT_PROFILE_COUNT;
/* Home and vendor hub metadata state the live counts (30 Sep 2026: both said 282 by hand). */
Object.assign(SEO_MAP, {
  "/": {
    title: `${SITE} | Contact Center Decision Tools and Vendor Research`,
    desc: `${TOOL_COUNT} free contact center tools with published methods, ${VENDOR_PROFILE_COUNT} vendor profiles and sourced industry pages. Every figure shows its source.`,
  },
  "/vendors": {
    title: `Contact Center Vendors: ${VENDOR_PROFILE_COUNT} Profiles, ${CATEGORY_COUNT} Categories | ${SITE}`,
    desc: `${VENDOR_PROFILE_COUNT} contact center and CX vendors in ${CATEGORY_COUNT} categories, from CCaaS to payments, each with its research status. No vendor pays to be listed.`,
  },
});

const LEGACY_CAT_NAMES = {
  ccaas: "CCaaS Platforms",
  iva: "IVA + Conversational AI",
  "agent-assist": "Agent Assist",
  "wem-qm": "WEM + Quality",
  analytics: "CX Analytics",
  "acd-routing": "ACD + Routing",
  "digital-engagement": "Digital Engagement",
  payments: "Payments + Identity",
};

const LEGACY_VERT_NAMES = {
  "financial-services": "Financial Services",
  healthcare: "Healthcare",
  retail: "Retail + eCommerce",
  telecom: "Telecom",
  insurance: "Insurance",
  travel: "Travel + Hospitality",
  government: "Government",
  utilities: "Utilities",
  manufacturing: "Manufacturing",
  education: "Education",
};

/* Names come from the shared vertical module so they cannot drift from the pages
   themselves. The legacy maps remain only as a fallback for slugs that predate it. */
const CAT_NAMES = Object.fromEntries(Object.entries(CATEGORIES).map(([k, v]) => [k, v.name]));
const VERT_NAMES = Object.fromEntries(Object.entries(VERTICALS).map(([k, v]) => [k, v.name]));

/* Own-key reads. Route segments come straight from the address bar, and a bare
   bracket read resolves "toString" or "constructor" through the prototype, which
   printed native code into the title and let /vendors/ccaas/toString claim the
   scored, indexable branch. */
const own = (o, k) => (Object.prototype.hasOwnProperty.call(o, k) ? o[k] : undefined);
const catName = (s) => own(CAT_NAMES, s) || own(LEGACY_CAT_NAMES, s);
const vertName = (s) => own(VERT_NAMES, s) || own(LEGACY_VERT_NAMES, s);

const titleCase = (slug) =>
  slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

/* Vendor display names, generated from the eight data files.

   Titles used to be built with titleCase(slug), which produced "Genesys Acd"
   for a page whose own heading reads "Genesys Cloud", and "Koreai Acd" for
   Kore.ai. Measured across the live data, 227 of 282 profiles rendered a title
   that contradicted their own name field, and 25 more had no name field read at
   all. The cause was a prior fix: slugs were suffixed per category to resolve
   the Sprinklr duplicate, and that disambiguation is what made the slug
   unusable as a display name.

   The map is generated rather than imported because seo.js is reached from
   App.jsx, the root shell. Importing the data files here would pin all vendor
   data into the entry chunk and foreclose route-level code splitting. See
   gen-seo-names.mjs for the full argument. seo.test.mjs asserts this map
   against the live data so drift fails the suite. */

/* VENDOR_NAMES_START generated by gen-seo-names.mjs, do not hand edit */
/* 282 vendor profiles. Regenerate with: node gen-seo-names.mjs */
const VENDOR_NAMES = {
  "360dialog-de": ["360Dialog", "digital-engagement"],
  "8x8": ["8x8", "ccaas"],
  "8x8-acd": ["8x8 Contact Center", "acd-routing"],
  "8x8-ai": ["8x8 AI Studio / Smart Assist", "iva"],
  "8x8-wem": ["8x8", "wem-qm"],
  "acquireio-de": ["Acquire.io (Mid)", "digital-engagement"],
  "ada": ["Ada", "iva"],
  "ada-analytics": ["Ada", "analytics"],
  "ada-de": ["Ada", "digital-engagement"],
  "adyen-pay": ["Adyen", "payments"],
  "affinipay-pay": ["AffiniPay", "payments"],
  "aircall": ["Aircall", "ccaas"],
  "aircall-acd": ["Aircall", "acd-routing"],
  "aisera": ["Aisera", "iva"],
  "alvaria": ["Alvaria", "ccaas"],
  "alvaria-acd": ["Alvaria", "acd-routing"],
  "amazon-aa": ["Amazon Connect", "agent-assist"],
  "amazon-acd": ["Amazon Connect", "acd-routing"],
  "amazon-connect": ["Amazon Connect", "ccaas"],
  "amazon-connect-ai": ["Amazon Connect + Lex", "iva"],
  "amazon-lex": ["Amazon Lex / Connect AI", "iva"],
  "amazon-wem": ["Amazon Connect", "wem-qm"],
  "amelia-soundhound": ["Amelia / SoundHound", "iva"],
  "amplitude-analytics": ["Amplitude", "analytics"],
  "anywhere-now": ["AnywhereNow", "ccaas"],
  "anywhere365-acd": ["Anywhere365", "acd-routing"],
  "asapp-analytics": ["ASAPP", "analytics"],
  "aspect-wem": ["Aspect", "wem-qm"],
  "assembled-wem": ["Assembled", "wem-qm"],
  "assemblyai-analytics": ["AssemblyAI", "analytics"],
  "audiocodes-acd": ["Audiocodes", "acd-routing"],
  "authnet-pay": ["Authorize.Net", "payments"],
  "avaya": ["Avaya", "ccaas"],
  "avaya-acd": ["Avaya Experience Platform", "acd-routing"],
  "avaya-analytics": ["Avaya Experience Platform", "analytics"],
  "aws-analytics": ["AWS Transcribe + Bedrock", "analytics"],
  "azure-analytics": ["Azure Cognitive + OpenAI", "analytics"],
  "balto": ["Balto", "iva"],
  "balto-aa": ["Balto", "agent-assist"],
  "balto-analytics": ["Balto", "analytics"],
  "birdeye-de": ["Birdeye", "digital-engagement"],
  "bluesnap-pay": ["BlueSnap", "payments"],
  "boost-ai": ["boost.ai", "iva"],
  "braintree-pay": ["Braintree", "payments"],
  "bright-acd": ["Bright Pattern", "acd-routing"],
  "bright-pattern": ["Bright Pattern", "ccaas"],
  "calabrio-analytics": ["Calabrio", "analytics"],
  "calabrio-wem": ["Calabrio", "wem-qm"],
  "callminer-analytics": ["CallMiner", "analytics"],
  "callminer-wem": ["CallMiner", "wem-qm"],
  "cc4all-acd": ["ContactCenter4All", "acd-routing"],
  "centrepal-acd": ["CentrePal", "acd-routing"],
  "chase-pay": ["Chase / JPM Payments", "payments"],
  "checkout-pay": ["Checkout.com", "payments"],
  "cisco": ["Cisco Webex Contact Center", "ccaas"],
  "cisco-acd": ["Cisco Webex CC", "acd-routing"],
  "cisco-analytics": ["Cisco Webex CC", "analytics"],
  "cisco-cc-ai": ["Cisco Webex Contact Center AI", "iva"],
  "claude-analytics": ["Anthropic Claude", "analytics"],
  "clickatell-de": ["Clickatell Touch", "digital-engagement"],
  "clickatell-plat-de": ["Clickatell (Platform)", "digital-engagement"],
  "cognigy-aa": ["Cognigy", "agent-assist"],
  "comm100-de": ["Comm100 (Enterprise)", "digital-engagement"],
  "comm100legacy-de": ["Comm100 (Legacy)", "digital-engagement"],
  "computertalk-acd": ["ComputerTalk", "acd-routing"],
  "connect-analytics": ["Amazon Connect", "analytics"],
  "content-guru": ["Content Guru", "ccaas"],
  "contentguru-acd": ["Content Guru (storm)", "acd-routing"],
  "contentguru-wem": ["Content Guru", "wem-qm"],
  "convoso-acd": ["Convoso", "acd-routing"],
  "cresta": ["Cresta", "iva"],
  "cresta-aa": ["Cresta", "agent-assist"],
  "cresta-analytics": ["Cresta", "analytics"],
  "cresta-wem": ["Cresta", "wem-qm"],
  "cybersource-pay": ["CyberSource", "payments"],
  "decagon": ["Decagon", "iva"],
  "deepgram-analytics": ["Deepgram", "analytics"],
  "dialpad": ["Dialpad", "ccaas"],
  "dialpad-aa": ["Dialpad", "agent-assist"],
  "digitalriver-pay": ["Digital River", "payments"],
  "dixa-acd": ["Dixa", "acd-routing"],
  "drift-de": ["Drift", "digital-engagement"],
  "egain": ["eGain", "iva"],
  "egain-de": ["eGain", "digital-engagement"],
  "einstein-analytics": ["Salesforce Einstein CI", "analytics"],
  "elavon-pay": ["Elavon", "payments"],
  "eleveo-wem": ["Eleveo", "wem-qm"],
  "emplifi-de": ["Emplifi", "digital-engagement"],
  "emplifi-light-de": ["Emplifi (care-light)", "digital-engagement"],
  "enghouse": ["Enghouse Interactive", "ccaas"],
  "enghouse-wem": ["Enghouse", "wem-qm"],
  "evaluagent-wem": ["evaluagent", "wem-qm"],
  "five9": ["Five9", "ccaas"],
  "five9-aa": ["Five9", "agent-assist"],
  "five9-acd": ["Five9", "acd-routing"],
  "five9-analytics": ["Five9", "analytics"],
  "five9-iva": ["Five9 IVA Studio", "iva"],
  "five9-wem": ["Five9", "wem-qm"],
  "forethought-analytics": ["Forethought", "analytics"],
  "freedompay": ["FreedomPay", "payments"],
  "freshchat-de": ["Freshchat (Mid)", "digital-engagement"],
  "freshdesk-acd": ["Freshdesk CC", "acd-routing"],
  "freshworks-freddy": ["Freshworks Freddy AI Agent", "iva"],
  "front-de": ["Front", "digital-engagement"],
  "fullstory-analytics": ["FullStory", "analytics"],
  "genesys": ["Genesys Cloud CX", "ccaas"],
  "genesys-aa": ["Genesys", "agent-assist"],
  "genesys-acd": ["Genesys Cloud", "acd-routing"],
  "genesys-ai": ["Genesys AI / Dialog Engine / Copilot", "iva"],
  "genesys-analytics": ["Genesys Cloud CX", "analytics"],
  "genesys-copilot": ["Genesys Cloud Copilot", "iva"],
  "genesys-wem": ["Genesys", "wem-qm"],
  "gladly": ["Gladly AI", "iva"],
  "gladly-de": ["Gladly", "digital-engagement"],
  "glassbox-analytics": ["Glassbox", "analytics"],
  "glia-aa": ["Glia", "agent-assist"],
  "globalpay": ["Global Payments", "payments"],
  "gocardless-pay": ["GoCardless", "payments"],
  "gong-analytics": ["Gong", "analytics"],
  "google-aa": ["Google Cloud Agent Assist", "agent-assist"],
  "google-analytics": ["Google Speech + Vertex", "analytics"],
  "google-dialogflow": ["Google Dialogflow CX", "iva"],
  "gorgias": ["Gorgias AI Agent", "iva"],
  "gorgias-de": ["Gorgias", "digital-engagement"],
  "goto": ["GoTo Contact Center", "ccaas"],
  "gr4vy-pay": ["Gr4vy", "payments"],
  "gupshup-de": ["Gupshup (Enterprise)", "digital-engagement"],
  "haptik-de": ["Haptik", "digital-engagement"],
  "heap-analytics": ["Heap", "analytics"],
  "helpscout-de": ["Help Scout", "digital-engagement"],
  "hootsuite-de": ["Hootsuite Social Care", "digital-engagement"],
  "hubspot-de": ["HubSpot Service Hub", "digital-engagement"],
  "ibm-watsonx": ["IBM watsonx Assistant", "iva"],
  "imagicle-acd": ["Imagicle", "acd-routing"],
  "infobip-de": ["Infobip Conversations", "digital-engagement"],
  "injixo-wem": ["Peopleware / injixo", "wem-qm"],
  "intercom-de": ["Intercom", "digital-engagement"],
  "intercom-fin": ["Intercom Fin", "iva"],
  "intermedia-acd": ["Intermedia CC", "acd-routing"],
  "invoca": ["Invoca", "iva"],
  "ipdynamics-acd": ["IPDynamics", "acd-routing"],
  "khoros-de": ["Khoros", "digital-engagement"],
  "koi-pay": ["Koi-Services", "payments"],
  "kore-ai": ["Kore.ai", "iva"],
  "koreai-acd": ["Kore.ai", "acd-routing"],
  "koreai-analytics": ["Kore.ai", "analytics"],
  "kustomer": ["Kustomer AI", "iva"],
  "kustomer-de": ["Kustomer", "digital-engagement"],
  "landis-acd": ["Landis", "acd-routing"],
  "level-ai": ["Level AI", "iva"],
  "levelai-analytics": ["Level AI", "analytics"],
  "liveagent-acd": ["LiveAgent", "acd-routing"],
  "livechat-de": ["LiveChat Inc.", "digital-engagement"],
  "liveperson": ["LivePerson", "iva"],
  "liveperson-de": ["LivePerson", "digital-engagement"],
  "luware": ["Luware", "ccaas"],
  "luware-acd": ["Luware", "acd-routing"],
  "maestroqa-wem": ["MaestroQA", "wem-qm"],
  "mangopay-pay": ["Mangopay", "payments"],
  "mercadopago-pay": ["MercadoPago", "payments"],
  "messagebird-de": ["MessageBird Inbox", "digital-engagement"],
  "miarec-wem": ["MiaRec", "wem-qm"],
  "microsoft-copilot": ["Microsoft Copilot Studio", "iva"],
  "mitel-acd": ["Mitel MiCC", "acd-routing"],
  "mitel-analytics": ["Mitel / Unify", "analytics"],
  "mollie-pay": ["Mollie", "payments"],
  "moveworks-servicenow": ["Moveworks / ServiceNow", "iva"],
  "mpesa-pay": ["M-Pesa", "payments"],
  "netcall-acd": ["Netcall", "acd-routing"],
  "netomi-de": ["Netomi", "digital-engagement"],
  "nextiva": ["Nextiva", "ccaas"],
  "nextiva-acd": ["Nextiva CC", "acd-routing"],
  "nice-aa": ["NICE", "agent-assist"],
  "nice-acd": ["NICE CXone", "acd-routing"],
  "nice-analytics": ["NICE CXone", "analytics"],
  "nice-autopilot": ["NICE Enlighten Autopilot / Cognigy", "iva"],
  "nice-cognigy": ["NICE Cognigy", "iva"],
  "nice-cognigy-de": ["NICE·Cognigy", "digital-engagement"],
  "nice-copilot": ["NICE Enlighten Copilot", "iva"],
  "nice-cxone": ["NICE CXone", "ccaas"],
  "nice-wem": ["NICE", "wem-qm"],
  "nice-wem-analytics": ["NICE WEM", "analytics"],
  "nuso-acd": ["NUSO", "acd-routing"],
  "nuvei-pay": ["Nuvei", "payments"],
  "observe-ai": ["Observe.AI", "iva"],
  "observeai-aa": ["Observe.AI", "agent-assist"],
  "observeai-analytics": ["Observe.AI", "analytics"],
  "observeai-wem": ["Observe.AI", "wem-qm"],
  "odigo": ["Odigo", "ccaas"],
  "odigo-acd": ["Odigo", "acd-routing"],
  "omilia": ["Omilia", "iva"],
  "onereach-ai": ["OneReach.ai", "iva"],
  "openai-analytics": ["OpenAI (Whisper + LLM)", "analytics"],
  "pagseguro-pay": ["PagSeguro", "payments"],
  "pax-pay": ["PAX", "payments"],
  "paysafe-pay": ["Paysafe", "payments"],
  "paytm-pay": ["Paytm", "payments"],
  "pendo-analytics": ["Pendo", "analytics"],
  "pipkins-wem": ["Pipkins", "wem-qm"],
  "playvox-analytics": ["Playvox", "analytics"],
  "podium-de": ["Podium", "digital-engagement"],
  "primer-pay": ["Primer", "payments"],
  "puzzel": ["Puzzel", "ccaas"],
  "puzzel-acd": ["Puzzel", "acd-routing"],
  "pypestream": ["Pypestream", "iva"],
  "pypestream-de": ["Pypestream", "digital-engagement"],
  "quiq-de": ["Quiq", "digital-engagement"],
  "rasa": ["Rasa Enterprise", "iva"],
  "reputation-de": ["Reputation", "digital-engagement"],
  "respondio-de": ["Respond.io", "digital-engagement"],
  "ringcentral": ["RingCentral RingCX", "ccaas"],
  "ringcentral-acd": ["RingCentral CC", "acd-routing"],
  "ringcentral-ai": ["RingCentral RingCX AI", "iva"],
  "ringcentral-analytics": ["RingCentral CC", "analytics"],
  "ringcentral-de": ["RingCentral Engage Digital", "digital-engagement"],
  "ringcentral-wem": ["RingCentral", "wem-qm"],
  "roger365-acd": ["ROGER365", "acd-routing"],
  "salesforce-acd": ["Salesforce Voice", "acd-routing"],
  "salesforce-de": ["Salesforce Digital Engagement", "digital-engagement"],
  "salesforce-service": ["Salesforce Service Cloud", "ccaas"],
  "scorebuddy-wem": ["Scorebuddy", "wem-qm"],
  "servicenow-cx": ["ServiceNow", "ccaas"],
  "shift4-pay": ["Shift4", "payments"],
  "sierra": ["Sierra", "iva"],
  "sikom-acd": ["Sikom", "acd-routing"],
  "sinch-de": ["Sinch Engage", "digital-engagement"],
  "spreedly-pay": ["Spreedly", "payments"],
  "sprinklr": ["Sprinklr", "ccaas"],
  "sprinklr-de": ["Sprinklr Service", "digital-engagement"],
  "sprinklr-iva": ["Sprinklr", "iva"],
  "sprout-de": ["Sprout Social Care", "digital-engagement"],
  "square-pay": ["Square / Block", "payments"],
  "stripe-pay": ["Stripe", "payments"],
  "sumup-pay": ["SumUp", "payments"],
  "talkdesk": ["Talkdesk", "ccaas"],
  "talkdesk-aa": ["Talkdesk", "agent-assist"],
  "talkdesk-acd": ["Talkdesk", "acd-routing"],
  "talkdesk-analytics": ["Talkdesk", "analytics"],
  "talkdesk-autopilot": ["Talkdesk Autopilot / AI Agents", "iva"],
  "talkdesk-wem": ["Talkdesk", "wem-qm"],
  "tcn-acd": ["TCN", "acd-routing"],
  "teneo-ai": ["Teneo.ai", "iva"],
  "teneo-de": ["Teneo.ai", "digital-engagement"],
  "tidio-de": ["Tidio", "digital-engagement"],
  "tidio-lyro": ["Tidio / Lyro", "iva"],
  "tietoevry-pay": ["Tietoevry Payments", "payments"],
  "twilio-acd": ["Twilio Flex", "acd-routing"],
  "twilio-flex": ["Twilio Flex + Conversational AI", "iva"],
  "ujet": ["UJET", "ccaas"],
  "ujet-acd": ["UJET", "acd-routing"],
  "ujet-va": ["UJET Virtual Agent", "iva"],
  "uniphore": ["Uniphore", "iva"],
  "uniphore-analytics": ["Uniphore", "analytics"],
  "verifone-pay": ["Verifone", "payments"],
  "verint": ["Verint", "iva"],
  "verint-aa": ["Verint", "agent-assist"],
  "verint-analytics": ["Verint Speech Analytics", "analytics"],
  "verint-de": ["Verint Digital-First", "digital-engagement"],
  "verint-wem": ["Verint", "wem-qm"],
  "verint-wfo": ["Verint WFO", "analytics"],
  "verloop-de": ["Verloop.io (Enterprise)", "digital-engagement"],
  "vicidial-acd": ["VICIdial", "acd-routing"],
  "vonage": ["Vonage", "ccaas"],
  "vonage-acd": ["Vonage CC", "acd-routing"],
  "vonage-analytics": ["Vonage CC", "analytics"],
  "webex-wem": ["Webex", "wem-qm"],
  "worldpay-pay": ["Worldpay (FIS)", "payments"],
  "yellow-ai": ["Yellow.ai", "iva"],
  "zendesk": ["Zendesk", "ccaas"],
  "zendesk-aa": ["Zendesk", "agent-assist"],
  "zendesk-acd": ["Zendesk", "acd-routing"],
  "zendesk-ai": ["Zendesk AI / Ultimate / Forethought", "iva"],
  "zendesk-analytics": ["Zendesk AI", "analytics"],
  "zendesk-de": ["Zendesk Messaging", "digital-engagement"],
  "zendesk-wem": ["Zendesk", "wem-qm"],
  "zenvia-de": ["Zenvia", "digital-engagement"],
  "zoom": ["Zoom Contact Center", "ccaas"],
  "zoom-aa": ["Zoom", "agent-assist"],
  "zoom-acd": ["Zoom CC", "acd-routing"],
  "zoom-analytics": ["Zoom Contact Center", "analytics"],
  "zoom-va": ["Zoom Virtual Agent", "iva"],
  "zowie": ["Zowie", "iva"],
};
/* VENDOR_NAMES_END */

/* SUBVERTICAL_NAMES_START generated by gen-seo-names.mjs, do not hand edit */
/* 61 sub-vertical pages. Regenerate with: node gen-seo-names.mjs */
const SUBVERTICAL_NAMES = {
  "education/financial-aid": "Financial Aid & Student Accounts",
  "education/graduate-programs": "Graduate & Professional Programs",
  "education/it-helpdesk": "IT Help Desk & Learning Technology",
  "education/online-education": "Online & Continuing Education",
  "education/student-services": "Student Services & Campus Life",
  "education/undergrad-admissions": "Undergraduate Admissions & Enrollment",
  "financial-services/credit-unions": "Credit Unions",
  "financial-services/fintech-neobanks": "Fintech & Neobanks",
  "financial-services/insurance": "Insurance (P&C, Life, Health)",
  "financial-services/lending-mortgage": "Lending & Mortgage",
  "financial-services/payments-processing": "Payments & Processing",
  "financial-services/retail-banking": "Retail Banking",
  "financial-services/wealth-management": "Wealth Management & Advisory",
  "government/courts-justice": "Courts & Justice",
  "government/federal": "Federal Government",
  "government/local-municipal": "Local & Municipal Government",
  "government/public-safety": "Public Safety & 911",
  "government/social-services": "Social Services & Benefits",
  "government/state": "State Government",
  "healthcare/digital-health": "Digital Health & Telehealth",
  "healthcare/health-insurance": "Health Insurance (Payers)",
  "healthcare/health-systems": "Health Systems & Hospitals",
  "healthcare/home-health": "Home Health & Post-Acute",
  "healthcare/pharma-life-sciences": "Pharmaceutical & Life Sciences",
  "healthcare/provider-groups": "Provider Groups & Clinics",
  "insurance/commercial-lines": "Commercial Lines",
  "insurance/insurtech": "Insurtech & Digital Carriers",
  "insurance/life-annuities": "Life Insurance & Annuities",
  "insurance/personal-lines": "Personal Lines P&C",
  "insurance/specialty-lines": "Specialty & Surplus Lines",
  "insurance/workers-comp": "Workers' Compensation",
  "manufacturing/aerospace-defense": "Aerospace & Defense",
  "manufacturing/automotive-dealer": "Automotive Dealer & Retail",
  "manufacturing/automotive-oem": "Automotive OEM",
  "manufacturing/consumer-electronics": "Consumer Electronics & Appliances",
  "manufacturing/food-beverage": "Food & Beverage Manufacturing",
  "manufacturing/industrial-b2b": "Industrial & B2B Manufacturing",
  "retail/ecommerce-dtc": "eCommerce / DTC",
  "retail/grocery-delivery": "Grocery & Delivery",
  "retail/luxury-specialty": "Luxury & Specialty",
  "retail/marketplace": "Marketplace Sellers",
  "retail/omnichannel-retail": "Omnichannel Retail",
  "retail/subscription-membership": "Subscription & Membership",
  "telecom/broadband-isp": "Broadband / ISP",
  "telecom/cable-tv": "Cable & Pay TV",
  "telecom/enterprise-comms": "Enterprise & Business Communications",
  "telecom/fiber-infrastructure": "Fiber & Infrastructure",
  "telecom/managed-services": "Managed Service Providers",
  "telecom/mobile-wireless": "Mobile / Wireless Carriers",
  "travel/airlines": "Airlines",
  "travel/car-rental": "Car Rental & Ground Transport",
  "travel/cruise-lines": "Cruise Lines",
  "travel/hotels-resorts": "Hotels & Resorts",
  "travel/otas": "Online Travel Agencies",
  "travel/tours-experiences": "Tours & Experiences",
  "utilities/electric-iou": "Electric Utilities (IOU)",
  "utilities/energy-retail": "Energy Retail / Competitive Supply",
  "utilities/municipal-coop": "Municipal & Co-Op Utilities",
  "utilities/natural-gas": "Natural Gas",
  "utilities/renewable-der": "Renewable Energy & DER",
  "utilities/water": "Water & Wastewater",
};
/* SUBVERTICAL_NAMES_END */
/* Industry segments with a page (the homepage states the count). */
export const SEGMENT_COUNT = Object.keys(SUBVERTICAL_NAMES).length;

/* Hand-written meta descriptions for the anchor sub-vertical of each vertical,
   the first entry in each data file. The template below stays the fallback for
   the other 51. Kept outside the generated block so gen-seo-names.mjs never
   touches it; seo.test.mjs section H holds every key to a real page. */
const SUBVERTICAL_DESC = {
  "education/undergrad-admissions": "Admissions contact centers: speed to lead, FERPA, the enrollment funnel and a 7-layer technology check for turning inquiries into enrolled students.",
  "financial-services/retail-banking": "Retail banking contact centers: fraud and dispute handling, Regulation E, compliance controls and a 7-layer technology check you can mark.",
  "government/federal": "Federal contact centers: FedRAMP, Section 508, language access, legacy systems and a 7-layer technology check you can mark.",
  "healthcare/health-systems": "Health system contact centers: patient access, scheduling, billing and care coordination, HIPAA guardrails and a 7-layer technology check.",
  "insurance/personal-lines": "Personal lines insurance contact centers: first notice of loss, catastrophe surges, claim deadlines, fraud controls and a 7-layer technology check.",
  "manufacturing/automotive-oem": "Automotive OEM contact centers: recall surges, warranty claims, connected vehicles and EVs, dealer handoffs and a 7-layer technology check.",
  "retail/ecommerce-dtc": "eCommerce and DTC contact centers: order status, returns, payment disputes and a 7-layer technology check you can mark.",
  "telecom/mobile-wireless": "Wireless carrier contact centers: billing disputes, device support, retention, SIM swap fraud controls and a 7-layer technology check.",
  "travel/airlines": "Airline contact center intelligence. IROP disruption surges, rebooking, EU261 and DOT compensation rules, loyalty routing, benchmarks, and a 7-layer CX stack.",
  "utilities/electric-iou": "Electric utility contact center intelligence. Storm and outage surge response, billing and start or stop service, benchmarks, and a 7-layer CX stack map.",
};

/* Each entry is [display name, category key]. Falls back to the slug only for
   a slug with no data entry, which the harness proves cannot happen for any
   route in the sitemap. The category label is resolved through catName rather
   than stored, so the generated map can never disagree with the category page
   a reader lands on. */
export const isVendorSlug = (slug) => typeof slug === "string" && !!own(VENDOR_NAMES, slug);
export const vendorDisplayName = (slug) => (own(VENDOR_NAMES, slug) || [])[0] || titleCase(slug);
export const vendorCategoryLabel = (slug) => {
  const entry = own(VENDOR_NAMES, slug);
  return entry ? catName(entry[1]) || "" : "";
};

// Returns a fresh object every call. Never mutates SEO_MAP.
export function resolveSeo(rawPath) {
  let pathname = rawPath || "/";
  if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);

  const mapped = own(SEO_MAP, pathname);
  if (mapped) return { title: mapped.title, desc: mapped.desc, path: pathname, known: true };

  const seo = {
    title: `${SITE} | Contact Center Tools and Research`,
    desc: "Free tools and research for contact center decisions: calculators with published methods, vendor profiles and sourced industry pages.",
    path: pathname,
    known: false,
  };

  if (pathname.startsWith("/vendors/")) {
    const parts = pathname.replace("/vendors/", "").split("/");
    if (parts.length === 2) {
      const cName = catName(parts[0]) || titleCase(parts[0]);
      const vName = vertName(parts[1]) || titleCase(parts[1]);
      /* Every category-by-industry page is noindex (TB, S23). The seventy outside CCaaS
         render the same vertical context under a different heading, a doorway pattern.
         The ten CCaaS pages lost their vendor fit scores in the integrity freeze and
         are a concept build until research Stage 3 rebuilds them. All stay reachable
         for visitors and crawlable, but out of the sitemap, and the prerendered HTML
         carries the noindex (P1 task 6). */
      const scored = hasScoredVerticalFit(parts[0]) && !!vertName(parts[1]);
      /* Research Stage 3 rebuilt the ten CCaaS pages from the research; the three with substance are indexable
         (TB, 27 Sep 2026). */
      if (parts[0] === "ccaas" && CCAAS_INDEXED_INDUSTRIES.includes(parts[1])) {
        seo.known = true;
        seo.title = `CCaaS Research: ${vName} Contact Centers | ${SITE}`;
        seo.desc = `What current CCaaS research says about ${vName}: every finding, product and break that bears on it, dated, with vendors A to Z.`;
        return seo;
      }
      seo.known = false;
      seo.title = scored
        ? `${cName} for ${vName} | Vendors + Vertical Requirements | ${SITE}`
        : `${cName} for ${vName} | ${SITE}`;
      seo.desc = scored
        ? `${cName} vendors for ${vName} contact centers, by research status. Compliance requirements, key integration systems, and evaluation guidance specific to ${vName}.`
        : `${vName} compliance requirements, key integration systems, and evaluation considerations relevant to ${cName}.`;
    } else {
      /* The category is not decoration. The same vendor holds a profile in up
         to five categories under five suffixed slugs, so a name-only title
         collapsed 96 routes onto 38 duplicate titles and 38 duplicate
         descriptions. The category is what distinguishes them, and it is also
         the term a buyer is actually searching alongside the vendor name. */
      const vendorName = vendorDisplayName(parts[0]);
      const vendorCat = vendorCategoryLabel(parts[0]);
      /* The name and category stay within 55 characters so a result shows them whole; a long product name drops the category. */
      seo.title = vendorCat && `${vendorName} | ${vendorCat}`.length <= 55
        ? `${vendorName} | ${vendorCat} | ${SITE}`
        : `${vendorName} | Vendor Profile | ${SITE}`;
      seo.known = true;
      seo.desc = vendorCat
        ? `${vendorName} in ${vendorCat}: what it is, where it fits and its research status, with sources where it has been researched.`
        : `${vendorName}: what it is, where it fits and its research status, with sources where it has been researched.`;
    }
    return seo;
  }

  if (pathname.startsWith("/industries/")) {
    const parts = pathname.replace("/industries/", "").split("/");
    /* Indexable only when both segments resolve to a real page. An unknown
       vertical or sub-vertical renders NotFound or "Sub-vertical not found", and
       claiming known:true there told crawlers to index a soft 404. */
    if (parts.length === 2) {
      const realSub = own(SUBVERTICAL_NAMES, `${parts[0]}/${parts[1]}`);
      const vName = vertName(parts[0]) || titleCase(parts[0]);
      const subName = realSub || titleCase(parts[1]);
      seo.title = `${subName} Contact Center CX | ${SITE}`;
      seo.known = !!realSub && !!vertName(parts[0]);
      seo.desc = (realSub && own(SUBVERTICAL_DESC, `${parts[0]}/${parts[1]}`)) || `${subName} contact centers: what they handle, the rules that apply, sourced figures where they exist and a 7-layer technology check.`;
    } else {
      const name = titleCase(parts[0]);
      seo.title = `${name} Contact Center CX | ${SITE}`;
      seo.known = parts.length === 1 && !!vertName(parts[0]);
      seo.desc = `${name} contact centers: segments, the rules that apply, sourced figures and the technology each layer needs.`;
    }
    return seo;
  }

  return seo;
}

/* ------------------------------------------------------------------ AEO ----
   Structured data for search and answer engines, emitted into raw HTML at build time by prerender.mjs (the browser
   adds none). One graph per page type, each describing what the reader actually sees:
     /             Organization and WebSite
     /tools/*      WebApplication: a free tool that runs in the browser
     /methodology  TechArticle: the published method, with its version date
     /industries/* Article, citing every published source the page renders (claims registry, recorded during the
                   server render); dateModified is the latest date a cited figure was checked
   No FAQPage: none of the site's pages shows a question and answer list, and markup must match visible content.
   (The TCO FAQ answers carried unsourced figures and never appeared on the page; retired, P1 task 4.)
   ------------------------------------------------------------------------ */

const APP_ROUTES = /^\/tools\//;
const ORG = { "@type": "Organization", name: SITE, url: BASE };
const METHOD_PATH = /^\/methodology\/([a-z0-9-]+)$/;
const INDUSTRY_PATH = /^\/industries\/[a-z0-9-]+(\/[a-z0-9-]+)?$/;
const CCAAS_INDUSTRY_PATH = /^\/vendors\/ccaas\/([a-z0-9-]+)$/;

export function structuredData(pathname, seo, extra = {}) {
  const url = pathname === "/" ? `${BASE}/` : `${BASE}${pathname}`;
  const name = seo.title.split(" | ")[0];
  const graphs = [];

  if (pathname === "/") {
    graphs.push({
      "@context": "https://schema.org", "@type": "Organization", name: SITE, url: BASE, foundingDate: "2026",
      description: `Free tools and research for contact center decisions. ${VENDOR_PROFILE_COUNT} vendor profiles across ${CATEGORY_COUNT} categories. ${TOOL_COUNT} free tools with published methods.`,
      knowsAbout: ["Contact Center Technology", "Customer Experience", "CCaaS", "IVA", "Conversational AI", "Workforce Management", "CX Analytics", "Digital Engagement"],
    });
    graphs.push({
      "@context": "https://schema.org", "@type": "WebSite", name: SITE, url: BASE,
      description: "Free tools and research for contact center decisions: vendor profiles, buyer guides and decision tools with published methods.",
      publisher: ORG,
    });
  }

  if (APP_ROUTES.test(pathname)) {
    graphs.push({
      "@context": "https://schema.org", "@type": "WebApplication", name, description: seo.desc, url,
      applicationCategory: "BusinessApplication", operatingSystem: "Any modern browser", browserRequirements: "Requires JavaScript",
      isAccessibleForFree: true, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, publisher: ORG,
    });
  }

  const m = pathname.match(METHOD_PATH);
  if (m) {
    const v = METHOD_VERSIONS[m[1]];
    graphs.push({
      "@context": "https://schema.org", "@type": "TechArticle", headline: name, description: seo.desc, url,
      author: ORG, publisher: ORG, isAccessibleForFree: true,
      ...(v ? { version: v.version, datePublished: v.published, dateModified: v.published } : {}),
    });
  }

  if (INDUSTRY_PATH.test(pathname)) {
    const citation = extra.citation || [];
    graphs.push({
      "@context": "https://schema.org", "@type": "Article", headline: name, description: seo.desc, url,
      author: ORG, publisher: ORG, isAccessibleForFree: true,
      ...(extra.checked ? { dateModified: extra.checked } : {}),
      ...(citation.length ? { citation } : {}),
    });
  }

  /* A published contributor piece: an Article by its author, a person, published by the site. The prerender passes the
     piece and its author (extra.perspective), so no contributor data rides in the entry chunk. */
  if (/^\/perspectives\/[a-z0-9-]+$/.test(pathname) && extra.perspective) {
    const { piece, author } = extra.perspective;
    graphs.push({ "@context": "https://schema.org", "@type": "Article", headline: piece.title, description: piece.dek, url,
      author: { "@type": "Person", name: author.name, jobTitle: author.role, worksFor: { "@type": "Organization", name: author.org } },
      publisher: ORG, datePublished: piece.published, isAccessibleForFree: true });
  }

  /* A rebuilt CCaaS by industry page open to search: an Article gathering the research, published by the site. */
  const ci = pathname.match(CCAAS_INDUSTRY_PATH);
  if (ci && CCAAS_INDEXED_INDUSTRIES.includes(ci[1])) {
    graphs.push({ "@context": "https://schema.org", "@type": "Article", headline: name, description: seo.desc, url, author: ORG, publisher: ORG, isAccessibleForFree: true });
  }

  return graphs;
}
