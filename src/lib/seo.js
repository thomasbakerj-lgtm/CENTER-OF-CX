// Single source of truth for per-route SEO.
// Imported by App.jsx at runtime and by prerender.mjs at build time.
// Must stay free of JSX and browser globals so Node can import it directly.

export const BASE = "https://www.contactcentercx.com";
export const SITE = "The Center of CX";

export const SEO_MAP = {
  "/": {
    title: `${SITE} | Independent CX + Contact Center Technology Intelligence`,
    desc: "283 vendors scored across 8 categories. Buyer guides, interactive tools, and the operational clarity CX leaders need to make confident technology decisions. No vendor sponsorship. No pay-to-play.",
  },
  "/platforms-and-tech": {
    title: `Platforms + Tech | ${SITE}`,
    desc: "Nine CX technology decision domains mapped to seven orchestration layers. Understand what you need, who owns it, and what breaks when you choose wrong.",
  },
  "/about": {
    title: `Our POV | ${SITE}`,
    desc: "How we think about CX technology, why independence matters, and the operating philosophy behind The Center of CX.",
  },
  "/advisory": {
    title: `Find a CX Consultant | ${SITE}`,
    desc: "Connect with vetted CX and contact center technology consultants. Platform selection, AI strategy, operational transformation. We match you with specialists in your vertical and challenge.",
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
    title: `CX Pro Tools | 30 Free Interactive Tools for Contact Center Professionals | ${SITE}`,
    desc: "30 free tools for CX operators. Staffing calculators, TCO models, QA scorecards, vendor matching, AHT decomposition, and more. Immediate output. No sales call required.",
  },
  "/research": {
    title: `Research + Insight | ${SITE}`,
    desc: "Original research, market analysis, and operator briefings on CX technology, AI in the contact center, and workforce transformation.",
  },
  "/vendors": {
    title: `Vendor Intelligence | 283 Vendors Scored Across 8 Categories | ${SITE}`,
    desc: "283 vendors across 8 categories. CCaaS, IVA, Agent Assist, WEM, Analytics, ACD/Routing, Digital Engagement, and Payments. Independently scored with published methodologies.",
  },
  "/vendors/ccaas": {
    title: `CCaaS Platform Market Intelligence | 28 Vendors Scored | ${SITE}`,
    desc: "28 CCaaS vendors scored across 7 weighted dimensions. Bell curve placement, scoring methodology, and honest assessments for enterprise buyers.",
  },
  "/vendors/iva": {
    title: `IVA + Conversational AI Market Intelligence: 50 Vendors Scored Across 7 Categories | ${SITE}`,
    desc: "50 IVA and conversational AI vendors scored across 7 market categories: Enterprise IVA, Voice-Native, Helpdesk AI, CCaaS-Native, Agent Assist, Ecommerce, and CRM/Workflow. 100-point scoring model. Use-case shortlists. Phase 1 + Phase 2 research.",
  },
  "/vendors/acd-routing": {
    title: `ACD + Routing Market Intelligence: 44 Vendors Scored | ${SITE}`,
    desc: "44 ACD/Routing vendors scored across 10 dimensions including routing logic, AI readiness, failover, and global scale. Quadrant matrix and tier rankings.",
  },
  "/vendors/analytics": {
    title: `Advanced Analytics Market Intelligence: 52 Vendors Scored | ${SITE}`,
    desc: "52 analytics vendors across 6 platform categories scored on 7 dimensions. CCaaS-embedded, AI-native, WEM, LLM infrastructure, agent assist, and product analytics.",
  },
  "/vendors/payments": {
    title: `Payment Technology Market Intelligence: 35 Vendors Scored | ${SITE}`,
    desc: "35 payment providers scored across 8 capability dimensions and evaluated through 5 C-suite lenses: CFO, CTO, CIO, COO, and CX.",
  },
  "/vendors/digital-engagement": {
    title: `Digital Engagement Market Intelligence: 50 Platforms Scored | ${SITE}`,
    desc: "50 digital engagement platforms scored across 8 dimensions. The first operator-grade classification of the market: CCaaS-native, messaging, social care, AI automation, and helpdesk.",
  },
  "/vendors/agent-assist": {
    title: `Agent Assist Market Intelligence: 15 Vendors Scored | ${SITE}`,
    desc: "15 agent assist vendors scored across 10 weighted dimensions. Real-time guidance, knowledge grounding, workflow execution, coaching, compliance, and market proof.",
  },
  "/cx-ecosystem": {
    title: `CX Industry Ecosystem: 15 Essential Publications + Communities | ${SITE}`,
    desc: "The 15 publications, research hubs, and communities that matter for CX and contact center professionals. Curated by The Center of CX.",
  },
  "/tools/cx-maturity": {
    title: `CX Maturity Assessment: Score Your Organization | ${SITE}`,
    desc: "Score your CX organization across 5 dimensions: strategy, operations, technology, analytics, and governance. 25 questions. Immediate results with maturity tier and recommendations.",
  },
  "/tools/ai-readiness": {
    title: `AI Readiness Diagnostic: Is Your Contact Center Ready? | ${SITE}`,
    desc: "Evaluate your data quality, workflow design, integration architecture, governance, and talent readiness for AI-driven automation. 24 questions across 6 dimensions.",
  },
  "/tools/experience-scorecard": {
    title: `Experience Scorecard: Benchmark Your Contact Center | ${SITE}`,
    desc: "Enter your contact center metrics and compare against industry benchmarks. CSAT, FCR, AHT, containment, cost per contact, attrition, and more. Graded A through D.",
  },
  "/tools/cx-it-alignment": {
    title: `CX + IT Alignment Framework | ${SITE}`,
    desc: "Rate 15 paired CX and IT statements to reveal alignment gaps in strategy, data, platforms, AI, and governance. Identify where misalignment creates friction.",
  },
  "/tools/governance-model": {
    title: `Governance + Operating Model | ${SITE}`,
    desc: "Map ownership across 30 CX responsibilities: strategy, operations, technology, AI, analytics, and budget. Identify governance gaps and overloaded functions.",
  },
  "/tools/service-design": {
    title: `Service Design Toolkit: Journey Friction Mapper | ${SITE}`,
    desc: "Score your customer journeys on 6 friction dimensions. Get a prioritized friction map showing where to invest in service design improvements.",
  },
  "/tools/roadmap-builder": {
    title: `Transformation Roadmap Builder: 90-Day Plan | ${SITE}`,
    desc: "Build a structured 90-day CX transformation plan with 18 milestones, dependencies, and status tracking across three phases.",
  },
  "/tools/integration-planner": {
    title: `Integration Strategy Planner: Map Your CX Stack | ${SITE}`,
    desc: "Map your technology stack across 7 CX orchestration layers. Identify integration gaps, legacy dependencies, and consolidation opportunities.",
  },
  "/tools/business-case": {
    title: `Business Case Builder: CX Transformation ROI | ${SITE}`,
    desc: "Model the ROI of your CX transformation. Calculate savings from AHT reduction, self-service containment, attrition improvement, and FCR gains.",
  },
  "/industries": {
    title: `Industries | ${SITE}`,
    desc: "Ten verticals mapped with CCaaS platforms and vertical-specific overlays. Healthcare, financial services, retail, telecom, insurance, travel, utilities, government, manufacturing, and education.",
  },
  "/industries/financial-services": {
    title: `Financial Services CX Intelligence | ${SITE}`,
    desc: "Vertical-specific CX intelligence for banking, insurance, lending, and wealth management. Benchmarks, technology stack mapping, failure modes, BPO guidance, and vendor recommendations.",
  },
  "/industries/healthcare": {
    title: `Healthcare CX Intelligence | ${SITE}`,
    desc: "Vertical-specific CX intelligence for health systems, payers, providers, and digital health. Patient access benchmarks, HIPAA-aware technology mapping, and failure modes.",
  },
  "/industries/retail": {
    title: `Retail + eCommerce CX Intelligence | ${SITE}`,
    desc: "Vertical-specific CX intelligence for eCommerce, omnichannel retail, subscription, and marketplace operations. Benchmarks, seasonal scaling, and commerce-integrated vendor recommendations.",
  },
  "/industries/telecom": {
    title: `Telecommunications CX Intelligence | ${SITE}`,
    desc: "Vertical-specific CX intelligence for wireless carriers, broadband/ISP, cable, and enterprise communications. Churn reduction, BSS/OSS integration, retention routing, and vendor recommendations.",
  },
  "/research/iva-buyer-guide": {
    title: `IVA + Conversational AI Buyer's Guide 2026 | ${SITE}`,
    desc: "50 vendors scored across 7 categories. The Human Premium framework. Market forecasts through 2029. Independent research. No vendor sponsorship.",
  },
  "/research/ccaas-buyer-guide": {
    title: `CCaaS Platform Buyer's Guide 2026 | ${SITE}`,
    desc: "28 CCaaS platforms scored across 7 dimensions. Strengths, weaknesses, best-fit, and red flags for every major platform.",
  },
  "/human-premium": {
    title: `The Human Premium: Why the Best CX Operations Invest More in People | ${SITE}`,
    desc: "Four new roles, five career paths, twelve certifications, and the growth playbook for CX professionals thriving in the AI era. Technology intelligence without workforce intelligence is half a strategy.",
  },
  "/research/ccaas-migration-costs": {
    title: `Why Your CCaaS Migration Didn't Cut Costs | ${SITE}`,
    desc: "The business case looked clean. Two years later, most organizations are spending the same or more. A 20-year operator breaks down where the money actually went across five CCaaS migrations.",
  },
  "/research/orchestration-framework": {
    title: `The 7-Layer CX Orchestration Framework 2026 | ${SITE}`,
    desc: "How every layer connects, who owns each one, and what to prepare for in the next 12 months. Layer-by-layer deep dives, integration dependencies, and a 14-question readiness checklist.",
  },
  "/tools/staffing-calculator": {
    title: `Staffing Requirement Calculator | Erlang C Staffing Model | ${SITE}`,
    desc: "Convert call volume, AHT, SLA target, and shrinkage into required FTE using Erlang C. Sensitivity analysis shows exactly what happens when you are short.",
  },
  "/tools/shrinkage-planner": {
    title: `Shrinkage Planner | Planned vs Unplanned Shrinkage Modeling | ${SITE}`,
    desc: "Model planned and unplanned shrinkage across 8 categories. See the staffing gap it creates and quantify the annual cost of lost capacity.",
  },
  "/tools/occupancy-risk": {
    title: `Occupancy Risk Simulator | When Efficiency Becomes Burnout | ${SITE}`,
    desc: "See how occupancy levels affect agent idle time, burnout risk, attrition, and hidden turnover costs. The math behind the 85% occupancy threshold.",
  },
  "/tools/forecast-accuracy": {
    title: `Forecast Accuracy Tracker | Forecast vs Actual by Interval | ${SITE}`,
    desc: "Compare forecast vs actual by interval and channel. Calculate MAPE, bias, and identify the intervals where your forecast breaks down.",
  },
  "/tools/schedule-adherence": {
    title: `Schedule Adherence Impact Calculator | ${SITE}`,
    desc: "See how 1-10 points of adherence loss cascade into SLA degradation, ASA spikes, higher abandonment, and overtime cost.",
  },
  "/tools/attrition-cost": {
    title: `Attrition Cost Calculator | The True Cost of Agent Turnover | ${SITE}`,
    desc: "Quantify the full cost of every agent departure: recruiting, training, nesting, ramp-to-proficiency, supervisor burden, overtime, and QA drag.",
  },
  "/tools/cost-per-contact": {
    title: `Cost per Contact vs Cost per Resolution Calculator | ${SITE}`,
    desc: "A $7 call that takes 3 contacts to resolve costs $21. Separate handle cost from resolution cost and quantify the real price of low FCR.",
  },
  "/tools/ai-deflection": {
    title: `AI Deflection Reality Check | Net Savings After the Fine Print | ${SITE}`,
    desc: "Your vendor says 40% deflection. What does net savings look like after bot leakage, containment failure, escalation premiums, and operating costs?",
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
    title: `AHT Decomposition Tool | Break Handle Time Into Actionable Components | ${SITE}`,
    desc: "Stop reducing AHT generically. Break it into talk, hold, wrap, transfer, search, and admin. Target the segments that are reducible without hurting quality.",
  },
  "/tools/agent-experience": {
    title: `Agent Experience Diagnostic | Five Dimensions That Drive Retention | ${SITE}`,
    desc: "Assess schedule control, tooling, knowledge, supervisor quality, and career visibility. Scored output with attrition risk projection.",
  },
  "/tools/qa-scorecard": {
    title: `QA Scorecard Builder | Weighted Evaluation Forms by Contact Type | ${SITE}`,
    desc: "Build context-specific QA scorecards with weighted dimensions and critical-fail criteria. Test with a sample evaluation. Three templates included.",
  },
  "/tools/fcr-leakage": {
    title: `FCR Leakage Diagnostic | What Drives Repeat Contacts | ${SITE}`,
    desc: "Low FCR is a symptom. This tool identifies the root cause across policy, handoffs, channels, knowledge, skills, and workflows.",
  },
  "/tools/calibration-drift": {
    title: `Calibration Drift Checker | QA Evaluator Consistency Analysis | ${SITE}`,
    desc: "Enter scores from multiple evaluators on the same calls. See inter-rater reliability, evaluator bias, and the calls that generate the most disagreement.",
  },
  "/tools/vendor-match": {
    title: `Vendor Match Engine | Ranked Shortlist for Your Environment | ${SITE}`,
    desc: "Tell us your operation size, vertical, priorities, and constraints. Get a ranked vendor shortlist with fit scores from 283 independently scored profiles.",
  },
  "/tools/platform-decision": {
    title: `Platform Decision Matrix | Stay, Extend, or Replace by Layer | ${SITE}`,
    desc: "Assess your current platform across all 7 orchestration layers. Get a layer-by-layer recommendation: stay, extend, evaluate, or replace.",
  },
  "/tools/contract-risk": {
    title: `Contract Risk Scanner | Find Red Flags Before You Sign | ${SITE}`,
    desc: "Select your contract terms across 7 critical areas. See which clauses protect you, which expose you, and what to renegotiate.",
  },
  "/tools/transformation-readiness": {
    title: `Transformation Readiness Scorecard | Go/No-Go Assessment | ${SITE}`,
    desc: "Score leadership alignment, budget realism, team capacity, vendor maturity, technical readiness, and change management. Get a phased recommendation.",
  },
  "/tools/rfp-builder": {
    title: `RFP Requirement Builder | Weighted Requirements by Layer | ${SITE}`,
    desc: "Generate weighted RFP requirements organized by the 7 orchestration layers. Tailored to your vertical, operation size, and priorities. Downloadable document.",
  },
  "/privacy": {
    title: `Privacy Policy | ${SITE}`,
    desc: "How The Center of CX handles your data. No vendor access to user data. No advertising cookies. No third-party tracking.",
  },
  "/terms": {
    title: `Terms of Service | ${SITE}`,
    desc: "Terms governing use of The Center of CX. Tool disclaimers, vendor assessment independence, intellectual property, and liability limitations.",
  },
  "/vendors/wem-qm": {
    title: `Workforce + Quality Management: 25 Vendors Scored | ${SITE}`,
    desc: "WEM, WFM, and QA vendor intelligence across 3 market layers and 3 scoring modes. NICE, Verint, Calabrio, Observe.AI, CallMiner, Cresta and 19 more scored on 8 weighted criteria.",
  },
  "/industries/education": {
    title: `Education CX Intelligence | ${SITE}`,
    desc: "Vertical-specific CX intelligence for admissions, financial aid, student services, IT help desk, and online education. FERPA, enrollment yield, retention, and student lifecycle.",
  },
  "/industries/manufacturing": {
    title: `Manufacturing + Automotive CX Intelligence | ${SITE}`,
    desc: "Vertical-specific CX intelligence for automotive OEM, dealers, industrial B2B, consumer electronics, aerospace, and food manufacturing. Warranty, recalls, parts logistics, and field service.",
  },
  "/industries/government": {
    title: `Government + Public Sector CX Intelligence | ${SITE}`,
    desc: "Vertical-specific CX intelligence for federal, state, local, courts, public safety, and social services. FedRAMP, accessibility, multilingual support, and citizen trust.",
  },
  "/industries/utilities": {
    title: `Utilities + Energy CX Intelligence | ${SITE}`,
    desc: "Vertical-specific CX intelligence for electric, gas, water, municipal, renewable energy, and competitive supply. Storm response, outage management, and regulatory compliance.",
  },
  "/industries/insurance": {
    title: `Insurance CX Intelligence | ${SITE}`,
    desc: "Vertical-specific CX intelligence for P&C, life, commercial, workers comp, specialty lines, and insurtech. Claims management, CAT response, and state DOI compliance.",
  },
  "/industries/travel": {
    title: `Travel + Hospitality CX Intelligence | ${SITE}`,
    desc: "Vertical-specific CX intelligence for airlines, hotels, OTAs, car rental, cruise lines, and tours. Disruption management, multilingual support, and GDS-integrated vendor recommendations.",
  },
  "/tools/tco-calculator": {
    title: `TCO Calculator | ${SITE}`,
    desc: "Model your contact center total cost of ownership across staffing, technology, operations, and transformation. Get a scored breakdown and connect with a consultant.",
  },
};
import { CATEGORIES, VERTICALS, hasScoredVerticalFit } from "./verticals.js";

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

const catName = (s) => CAT_NAMES[s] || LEGACY_CAT_NAMES[s];
const vertName = (s) => VERT_NAMES[s] || LEGACY_VERT_NAMES[s];

const titleCase = (slug) =>
  slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

// Returns a fresh object every call. Never mutates SEO_MAP.
export function resolveSeo(rawPath) {
  let pathname = rawPath || "/";
  if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);

  const mapped = SEO_MAP[pathname];
  if (mapped) return { title: mapped.title, desc: mapped.desc, path: pathname, known: true };

  const seo = {
    title: `${SITE} | Independent CX Technology Intelligence`,
    desc: "Independent CX and contact center technology intelligence. Vendor scoring, buyer frameworks, and consultant matching.",
    path: pathname,
    known: false,
  };

  if (pathname.startsWith("/vendors/")) {
    const parts = pathname.replace("/vendors/", "").split("/");
    if (parts.length === 2) {
      const cName = catName(parts[0]) || titleCase(parts[0]);
      const vName = vertName(parts[1]) || titleCase(parts[1]);
      /* Only CCaaS carries per-vendor vertical fit scoring, so only the ten CCaaS
         pages contain analysis that differs by category. The other seventy render
         the same vertical context under a different heading, which is a doorway
         pattern. They stay reachable and crawlable but noindex until real
         per-category scoring exists. Removing them from the sitemap is not enough:
         internal links will surface them regardless. */
      const scored = hasScoredVerticalFit(parts[0]) && !!vertName(parts[1]);
      seo.known = !!scored;
      seo.title = scored
        ? `${cName} for ${vName} | Scored Vendors + Vertical Fit | ${SITE}`
        : `${cName} for ${vName} | ${SITE}`;
      seo.desc = scored
        ? `${cName} vendors scored for ${vName}. Vertical fit rankings, compliance requirements, key integration systems, and evaluation guidance specific to ${vName} contact centers.`
        : `${vName} compliance requirements, key integration systems, and evaluation considerations relevant to ${cName}.`;
    } else {
      const vendorName = titleCase(parts[0]);
      seo.title = `${vendorName} | Vendor Profile | ${SITE}`;
      seo.known = true;
      seo.desc = `Independent assessment of ${vendorName}. Scores, strengths, weaknesses, competitive context, and community reviews.`;
    }
    return seo;
  }

  if (pathname.startsWith("/industries/")) {
    const parts = pathname.replace("/industries/", "").split("/");
    if (parts.length === 2) {
      const vName = vertName(parts[0]) || titleCase(parts[0]);
      const subName = titleCase(parts[1]);
      seo.title = `${subName} CX Intelligence | ${vName} | ${SITE}`;
      seo.known = true;
      seo.desc = `CX technology intelligence for ${subName} within ${vName}. Benchmarks, stack mapping, failure modes, and vendor guidance specific to ${subName} operations.`;
    } else {
      const name = titleCase(parts[0]);
      seo.title = `${name} CX Intelligence | ${SITE}`;
      seo.known = true;
      seo.desc = `Dedicated CX technology intelligence for ${name}. Sub-vertical frameworks, vendor mapping, benchmarks, and integration pitfalls.`;
    }
    return seo;
  }

  return seo;
}

/* ------------------------------------------------------------------ AEO ----
   Structured data for answer engines and AI assistants. Emitted into raw HTML
   at build time by prerender.mjs, so engines that never execute JavaScript
   still receive it. Two graphs per tool route: SoftwareApplication describes
   what the tool is, FAQPage answers the methodology questions buyers actually
   ask. The FAQ answers are deliberately the contrarian, checkable ones. An
   answer engine has no reason to cite a page that repeats the consensus.
   ------------------------------------------------------------------------ */

export const TOOL_FAQ = {
  "/tools/tco-calculator": [
    ["What does a contact center actually cost per agent per month?",
     "Fully loaded, most operations land between $4,500 and $7,500 per agent per month once labor, technology, and overhead are counted together. Labor is normally 70 to 85 percent of the total, which is why trimming software rarely moves the number."],
    ["Should savings be valued at cost per contact or marginal cost?",
     "Marginal cost. Deflecting one contact frees the agent handle time for that contact, it does not remove a share of fixed technology, facilities, or supervision. Valuing deflection at fully loaded cost per contact overstates savings by a wide margin and is the single most common error in vendor ROI models."],
    ["How is cost per resolution calculated?",
     "Cost per contact multiplied by (2 minus FCR), the standard one-plus-repeat model. Dividing cost per contact by FCR is a frequent shortcut and it overstates the figure, because a 70 percent FCR means about 1.3 contacts per resolution, not 1.43."],
    ["Does a 3-year TCO need one escalator or two?",
     "Two. Labor and contracted software escalate at different rates, roughly 3.5 percent for wages against 6 percent for enterprise license renewals. A single blended rate misstates a cost base that is mostly labor, and finance teams notice."],
    ["Does the one-time implementation cost belong in annual TCO?",
     "No. Annual TCO is recurring run-rate. Implementation is a one-time cost that belongs in Year 1 cash and in the 3-year total, added once and never escalated. Folding it into the annual figure inflates every year of the projection."],
    ["Do FCR, occupancy, and shrinkage change current cost?",
     "No. They size the opportunity, they do not move today's total. Cost is driven by headcount, wages, contracted prices, and volume. A tool that shows your TCO falling when you improve FCR is modeling a future state, not your current cost."],
  ],
};

const APP_ROUTES = /^\/tools\//;

export function structuredData(pathname, seo) {
  const url = pathname === "/" ? `${BASE}/` : `${BASE}${pathname}`;
  const graphs = [];

  if (APP_ROUTES.test(pathname)) {
    graphs.push({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: seo.title.split(" | ")[0],
      description: seo.desc,
      url,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Any modern browser",
      isAccessibleForFree: true,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      publisher: { "@type": "Organization", name: SITE, url: BASE },
    });
  }

  const faq = TOOL_FAQ[pathname];
  if (faq) {
    graphs.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map(([q, a]) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    });
  }

  return graphs;
}
