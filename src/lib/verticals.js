// src/lib/verticals.js
//
// Vertical and category reference data, extracted from CategoryVerticalPage.jsx.
//
// This is the platform's strongest proprietary research: per-vertical compliance
// requirements, the systems a platform must integrate with, what actually drives
// handle time and volume, and scored CCaaS vendor fit across ten verticals. While
// it lived inside a React component nothing else could read it. Not seo.js, not
// the build-time prerender, not the industry pages, not any diagnostic tool.
//
// Must stay free of JSX and browser globals so Node can import it directly at
// build time. Same constraint as seo.js and type.js, same reason.
//
// The fit scores below cover CCaaS only. No other category has scored vertical
// fit, which is why only the ten CCaaS-by-vertical pages are indexable. Vendor
// self-described vertical strings are not fit scores and must never be treated
// as such.

/* One name per category (TB, 1 Oct 2026). Every heading, breadcrumb, card, back link, title and structured data
   name reads `name`. `also` holds terms that mean exactly the same thing (shown as "Also called" and given to search
   engines as alternate names); `related` holds what buyers search for part of the category or the outcome it serves
   (shown as "Related searches", never as a synonym). Each name describes the vendors profiled today: routing is
   "Routing and Orchestration" and payments "Payment Technology" until research of a wider category lands. */
export const CATEGORIES = {
  ccaas: {
    name: "Contact Center Platforms (CCaaS)", page: "/vendors/ccaas", vendorCount: 24,
    also: ["CCaaS", "contact center as a service", "cloud contact center"],
    related: ["call center software", "contact center software", "UCaaS and CCaaS"],
  },
  iva: {
    name: "IVA and Conversational AI", page: "/vendors/iva", vendorCount: 50,
    also: ["intelligent virtual agents", "conversational AI platforms"],
    related: ["customer self-service AI", "AI agents for customer service", "chatbots", "voicebots"],
  },
  "agent-assist": {
    name: "Agent Assist and Knowledge", page: "/vendors/agent-assist", vendorCount: 15,
    also: [],
    related: ["agent assist software", "real-time agent guidance", "agent copilot", "contact center knowledge management"],
  },
  "wem-qm": {
    name: "Workforce and Quality Management", page: "/vendors/wem-qm", vendorCount: 25,
    also: ["WFM and QM"],
    related: ["WEM", "workforce engagement management", "workforce management software", "contact center quality assurance", "auto QA"],
  },
  analytics: {
    name: "CX Analytics", page: "/vendors/analytics", vendorCount: 41,
    also: ["customer experience analytics"],
    related: ["speech analytics", "interaction analytics", "conversation intelligence", "product and journey analytics"],
  },
  "acd-routing": {
    name: "Routing and Orchestration", page: "/vendors/acd-routing", vendorCount: 44,
    also: [],
    related: ["ACD", "automatic call distribution", "skills-based routing", "Microsoft Teams contact center", "CX orchestration"],
  },
  "digital-engagement": {
    name: "Digital Engagement", page: "/vendors/digital-engagement", vendorCount: 46,
    also: [],
    related: ["live chat software", "messaging", "social customer care", "helpdesk software", "WhatsApp for customer service"],
  },
  payments: {
    name: "Payment Technology", page: "/vendors/payments", vendorCount: 33,
    also: [],
    related: ["payment processing", "payment gateways", "payment orchestration", "point of sale", "PCI compliance"],
  },
};

export const VERTICALS = {
  "financial-services": {
    name: "Financial Services", industryPage: "/industries/financial-services",
    subVerts: "Retail Banking, Commercial Banking, Wealth Management, Capital Markets, Payments, Fintech, Credit Unions",
    keySystems: ["Core banking (FIS, Fiserv, Jack Henry)", "Lending (nCino, Temenos)", "CRM (Salesforce FSC)", "Fraud detection", "Identity verification"],
    ccaasLeaders: ["genesys", "nice-cxone", "five9", "talkdesk", "cisco"],
    ccaasContext: "Financial services requires the deepest compliance stack in any CCaaS evaluation. FedRAMP is increasingly expected even for non-government banking operations. Integration with core banking platforms (FIS, Fiserv, Jack Henry) is a mandatory evaluation criterion. Vendors without pre-built connectors require 6-12 months of custom integration work.",
  },
  healthcare: {
    name: "Healthcare", industryPage: "/industries/healthcare",
    subVerts: "Health Systems, Payer/Insurance, Pharma, Ambulatory/Clinics, Home Health, Digital Health",
    keySystems: ["Epic", "Oracle Health (Cerner)", "athenahealth", "MEDITECH", "NextGen", "Allscripts"],
    ccaasLeaders: ["genesys", "nice-cxone", "five9", "talkdesk", "cisco"],
    ccaasContext: "Healthcare CCaaS evaluations should require an EHR integration demo using your specific EHR platform. Ask vendors to show an inbound patient scheduling call with real-time Epic or Cerner screen pops. Vendors without native EHR connectors will require middleware and 6+ months of integration effort. HIPAA BAA is mandatory; a BAA 'available upon request' does not meet that bar.",
  },
  retail: {
    name: "Retail + eCommerce", industryPage: "/industries/retail",
    subVerts: "Mass Retail, DTC/eCommerce, Luxury, Grocery, Marketplace Sellers, Specialty",
    keySystems: ["Shopify", "BigCommerce", "commercetools", "Salesforce Commerce", "SAP Commerce", "Order management"],
    ccaasLeaders: ["five9", "talkdesk", "amazon-connect", "nice-cxone", "genesys"],
    ccaasContext: "Retail CCaaS evaluations should stress-test elastic scaling. Ask vendors: 'Show me your provisioning model for 5x volume spikes with 48 hours notice.' Consumption-based pricing (Amazon Connect) can be advantageous for seasonal retailers. Commerce platform integration is a differentiator. Talkdesk and Five9 have the strongest Shopify connectors.",
  },
  telecom: {
    name: "Telecom", industryPage: "/industries/telecom",
    subVerts: "Wireless Carriers, Cable/Broadband, MVNO, B2B Telecom, Fiber/ISP",
    keySystems: ["BSS/OSS platforms", "Network management", "Billing systems", "Provisioning", "Service assurance"],
    ccaasLeaders: ["genesys", "nice-cxone", "cisco", "content-guru"],
    ccaasContext: "Telecom evaluations should verify carrier-grade SLAs and BYOC (Bring Your Own Carrier) support. Most telecom operations have existing PSTN relationships they need to preserve. Genesys and Cisco have the deepest telecom heritage. Verify the vendor can handle complex IVR trees (100+ nodes) and ACD routing that factors network status alongside customer data.",
  },
  insurance: {
    name: "Insurance", industryPage: "/industries/insurance",
    subVerts: "P&C, Life/Annuity, Health Insurance, Specialty/Surplus, Reinsurance",
    keySystems: ["Guidewire", "Duck Creek", "Majesco", "Claims management", "Policy admin", "Agency management"],
    ccaasLeaders: ["genesys", "nice-cxone", "five9", "talkdesk"],
    ccaasContext: "Insurance evaluations should require separate demos for service and claims workflows. Ask vendors to show FNOL intake through IVA with handoff to a claims adjuster including full context. Verify integration with your policy admin platform. Guidewire and Duck Creek connectors are available from Talkdesk and Five9 but maturity varies. State-level compliance and recording requirements add evaluation complexity.",
  },
  travel: {
    name: "Travel + Hospitality", industryPage: "/industries/travel",
    subVerts: "Airlines, Hotels/Resorts, Online Travel, Cruise, Car Rental",
    keySystems: ["GDS (Amadeus, Sabre)", "PMS (Opera, Mews)", "Revenue management", "Loyalty platforms"],
    ccaasLeaders: ["genesys", "nice-cxone", "five9", "content-guru"],
    ccaasContext: "Travel evaluations should stress-test crisis response capabilities. Ask: 'How do we handle 10x volume in 2 hours when a weather event cancels 200 flights?' Global routing with multi-language support is a baseline. GDS or PMS integration is a differentiator. Without it, agents are copying data between systems on every call.",
  },
  government: {
    name: "Government", industryPage: "/industries/government",
    subVerts: "Federal Civilian, Defense/IC, State/Local, Public Safety, Benefits/Social Services, Courts/Justice",
    keySystems: ["Case management", "Benefits systems", "311/911 platforms", "Records management"],
    ccaasLeaders: ["genesys", "nice-cxone", "cisco", "content-guru"],
    ccaasContext: "Government evaluations begin and end with compliance. FedRAMP High is mandatory for federal. StateRAMP or equivalent for state/local. Vendors must demonstrate Section 508 compliance across all agent and supervisor interfaces. Cisco and Content Guru have the strongest government track records. Procurement via GSA Schedule or BPA adds 3-6 months to the timeline.",
  },
  utilities: {
    name: "Utilities", industryPage: "/industries/utilities",
    subVerts: "Electric, Gas, Water/Sewer, Multi-utility, Cooperative",
    keySystems: ["CIS (billing)", "SCADA/OMS", "AMI/Smart metering", "Outage management"],
    ccaasLeaders: ["genesys", "nice-cxone", "cisco", "five9"],
    ccaasContext: "Utility evaluations should verify emergency routing capabilities. Ask: 'How does the platform detect a major outage event and automatically shift IVR, routing, and staffing?' CIS integration is the single most important technical requirement. NERC CIP compliance applies to power utilities. Payment processing for bill pay requires PCI. Seasonal rate-change communications drive predictable volume spikes.",
  },
  manufacturing: {
    name: "Manufacturing", industryPage: "/industries/manufacturing",
    subVerts: "Discrete Manufacturing, Process Manufacturing, Automotive, Industrial Equipment, Consumer Products",
    keySystems: ["ERP (SAP, Oracle)", "PLM", "Supply chain management", "Dealer/distributor portals"],
    ccaasLeaders: ["genesys", "cisco", "nice-cxone", "five9"],
    ccaasContext: "Manufacturing evaluations should verify ERP integration capabilities. Ask vendors to demonstrate an inbound warranty claim with real-time SAP screen pop showing order history, warranty status, and parts availability. Multi-language support is often required for global manufacturing operations. Video/co-browse capabilities are important for technical support of complex equipment.",
  },
  education: {
    name: "Education", industryPage: "/industries/education",
    subVerts: "Higher Education, K-12, EdTech, Corporate Training, Student Services",
    keySystems: ["SIS (Student Information Systems)", "LMS (Canvas, Blackboard)", "CRM (Slate, Salesforce)", "Financial aid systems"],
    ccaasLeaders: ["zoom", "five9", "nice-cxone", "genesys"],
    ccaasContext: "Education evaluations should test enrollment-season scaling. Zoom Contact Center has the strongest education positioning due to existing Zoom penetration in higher ed. SIS integration is the critical differentiator. Without it, agents cannot resolve the majority of student inquiries. FERPA authentication workflows must be demonstrated. Chatbot/IVA for financial aid FAQ is the highest-ROI automation use case.",
  },
};

// CCaaS vendor vertical fit scores from spreadsheet data
export const CCAAS_VERTICAL_FIT = {
  "genesys": { "financial-services": 5, "healthcare": 5, "retail": 4, "telecom": 5, "insurance": 5, "travel": 4, "government": 4, "utilities": 4, "manufacturing": 4, "education": 3 },
  "nice-cxone": { "financial-services": 5, "healthcare": 5, "retail": 4, "telecom": 4, "insurance": 5, "travel": 3, "government": 5, "utilities": 4, "manufacturing": 3, "education": 3 },
  "five9": { "financial-services": 4, "healthcare": 4, "retail": 5, "telecom": 3, "insurance": 4, "travel": 3, "government": 3, "utilities": 3, "manufacturing": 3, "education": 3 },
  "talkdesk": { "financial-services": 4, "healthcare": 5, "retail": 5, "telecom": 3, "insurance": 4, "travel": 3, "government": 3, "utilities": 3, "manufacturing": 3, "education": 3 },
  "amazon-connect": { "financial-services": 3, "healthcare": 3, "retail": 5, "telecom": 4, "insurance": 2, "travel": 3, "government": 3, "utilities": 2, "manufacturing": 3, "education": 2 },
  "cisco": { "financial-services": 4, "healthcare": 4, "retail": 3, "telecom": 5, "insurance": 3, "travel": 3, "government": 5, "utilities": 4, "manufacturing": 4, "education": 3 },
  "content-guru": { "financial-services": 4, "healthcare": 3, "retail": 3, "telecom": 4, "insurance": 4, "travel": 3, "government": 5, "utilities": 4, "manufacturing": 3, "education": 2 },
  "ringcentral": { "financial-services": 3, "healthcare": 3, "retail": 3, "telecom": 3, "insurance": 3, "travel": 2, "government": 2, "utilities": 2, "manufacturing": 3, "education": 2 },
  "zoom": { "financial-services": 2, "healthcare": 2, "retail": 3, "telecom": 2, "insurance": 2, "travel": 2, "government": 2, "utilities": 2, "manufacturing": 2, "education": 4 },
  "8x8": { "financial-services": 3, "healthcare": 2, "retail": 3, "telecom": 2, "insurance": 2, "travel": 2, "government": 2, "utilities": 2, "manufacturing": 3, "education": 2 },
  "bright-pattern": { "financial-services": 3, "healthcare": 3, "retail": 3, "telecom": 2, "insurance": 2, "travel": 2, "government": 2, "utilities": 2, "manufacturing": 2, "education": 2 },
  "odigo": { "financial-services": 4, "healthcare": 3, "retail": 3, "telecom": 3, "insurance": 4, "travel": 3, "government": 3, "utilities": 4, "manufacturing": 2, "education": 2 },
  "ujet": { "financial-services": 3, "healthcare": 3, "retail": 4, "telecom": 3, "insurance": 2, "travel": 3, "government": 2, "utilities": 2, "manufacturing": 2, "education": 2 },
};

/* ------------------------------------------------------------------ helpers */

export const VERTICAL_SLUGS = Object.keys(VERTICALS);
export const CATEGORY_SLUGS = Object.keys(CATEGORIES);

/** Only CCaaS carries scored vendor fit, so only CCaaS-by-vertical pages are
    substantive enough to index. Used by seo.js and the prerender. */
/* The CCaaS by industry pages open to search (TB, 27 Sep 2026: "index the three"): the industries where the research has
   substance (industry.test.mjs holds each to it). The other seven CCaaS pages and the seventy in other categories stay
   noindex and out of the sitemap. */
export const CCAAS_INDEXED_INDUSTRIES = ["financial-services", "government", "healthcare"];

export function hasScoredVerticalFit(categorySlug) {
  return categorySlug === "ccaas";
}

/** Vertical fit for one vendor in one vertical. Returns 2, a neutral default,
    when the vendor is unscored, matching the render behaviour. */
export function verticalFit(vendorSlug, verticalSlug) {
  return CCAAS_VERTICAL_FIT[vendorSlug]?.[verticalSlug] ?? 2;
}
