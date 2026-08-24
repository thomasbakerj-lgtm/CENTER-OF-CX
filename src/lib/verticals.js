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

export const CATEGORIES = {
  ccaas: { name: "CCaaS Platforms", full: "Core CX Platforms (CCaaS)", page: "/vendors/ccaas", vendorCount: 24 },
  iva: { name: "IVA + Conversational AI", full: "Customer Automation", page: "/vendors/iva", vendorCount: 50 },
  "agent-assist": { name: "Agent Assist + Knowledge", full: "Agent Assist + Knowledge AI", page: "/vendors/agent-assist", vendorCount: 38 },
  "wem-qm": { name: "WEM + Quality Management", full: "Workforce + Quality Management", page: "/vendors/wem-qm", vendorCount: 32 },
  analytics: { name: "CX Analytics", full: "Experience Analytics", page: "/vendors/analytics", vendorCount: 45 },
  "acd-routing": { name: "ACD + Routing", full: "Routing + Orchestration", page: "/vendors/acd-routing", vendorCount: 28 },
  "digital-engagement": { name: "Digital Engagement", full: "Digital Engagement", page: "/vendors/digital-engagement", vendorCount: 36 },
  payments: { name: "Payments + Identity", full: "Payments + Identity", page: "/vendors/payments", vendorCount: 30 },
};

export const VERTICALS = {
  "financial-services": {
    name: "Financial Services", industryPage: "/industries/financial-services",
    subVerts: "Retail Banking, Commercial Banking, Wealth Management, Capital Markets, Payments, Fintech, Credit Unions",
    compliance: ["PCI DSS Level 1", "SOC 2 Type II", "FFIEC", "GLBA", "FINRA recordkeeping", "Data residency"],
    keySystems: ["Core banking (FIS, Fiserv, Jack Henry)", "Lending (nCino, Temenos)", "CRM (Salesforce FSC)", "Fraud detection", "Identity verification"],
    considerations: "Authentication friction is the top CX killer. Average handle times run 20-30% longer than cross-industry because of compliance verification. Payment dispute handling requires PCI-compliant recording with selective pause/resume. Multi-channel identity must be consistent. A customer authenticated on IVR should not re-authenticate when transferred to an agent.",
    ccaasLeaders: ["genesys", "nice-cxone", "five9", "talkdesk", "cisco"],
    ccaasContext: "Financial services requires the deepest compliance stack in any CCaaS evaluation. FedRAMP is increasingly expected even for non-government banking operations. Integration with core banking platforms (FIS, Fiserv, Jack Henry) is a mandatory evaluation criterion. Vendors without pre-built connectors require 6-12 months of custom integration work.",
  },
  healthcare: {
    name: "Healthcare", industryPage: "/industries/healthcare",
    subVerts: "Health Systems, Payer/Insurance, Pharma, Ambulatory/Clinics, Home Health, Digital Health",
    compliance: ["HIPAA BAA", "HITRUST", "PHI encryption", "Audit trails", "State health privacy"],
    keySystems: ["Epic", "Oracle Health (Cerner)", "athenahealth", "MEDITECH", "NextGen", "Allscripts"],
    considerations: "HIPAA is table stakes but not sufficient. The real challenge is EHR integration. Agents need real-time access to patient scheduling, medication, and care plan data without switching to the EHR application. Average handle times are the longest of any vertical (7+ minutes) because of clinical complexity. Patient access scheduling and referral management drive 40-50% of contact volume.",
    ccaasLeaders: ["genesys", "nice-cxone", "five9", "talkdesk", "cisco"],
    ccaasContext: "Healthcare CCaaS evaluations should require an EHR integration demo using your specific EHR platform. Ask vendors to show an inbound patient scheduling call with real-time Epic or Cerner screen pops. Vendors without native EHR connectors will require middleware and 6+ months of integration effort. HIPAA BAA is mandatory, not optional, not 'available upon request.'",
  },
  retail: {
    name: "Retail + eCommerce", industryPage: "/industries/retail",
    subVerts: "Mass Retail, DTC/eCommerce, Luxury, Grocery, Marketplace Sellers, Specialty",
    compliance: ["PCI DSS Level 1", "GDPR/CCPA", "Payment tokenization", "Seasonal 10x scale"],
    keySystems: ["Shopify", "BigCommerce", "commercetools", "Salesforce Commerce", "SAP Commerce", "Order management"],
    considerations: "Seasonal volume spikes define the architecture requirement. Black Friday can drive 8-10x normal volume. Platforms that cannot elastically scale without pre-provisioning fail this vertical. Returns and order status inquiries drive 60-70% of volume and are prime automation candidates. Commerce platform integration (Shopify, commercetools) determines whether agents can action orders directly or need to alt-tab into a separate system.",
    ccaasLeaders: ["five9", "talkdesk", "amazon-connect", "nice-cxone", "genesys"],
    ccaasContext: "Retail CCaaS evaluations should stress-test elastic scaling. Ask vendors: 'Show me your provisioning model for 5x volume spikes with 48 hours notice.' Consumption-based pricing (Amazon Connect) can be advantageous for seasonal retailers. Commerce platform integration is a differentiator. Talkdesk and Five9 have the strongest Shopify connectors.",
  },
  telecom: {
    name: "Telecom", industryPage: "/industries/telecom",
    subVerts: "Wireless Carriers, Cable/Broadband, MVNO, B2B Telecom, Fiber/ISP",
    compliance: ["FCC compliance", "CPNI protection", "99.999% availability", "Carrier-grade telephony"],
    keySystems: ["BSS/OSS platforms", "Network management", "Billing systems", "Provisioning", "Service assurance"],
    considerations: "Telecom contact centers handle the highest complexity-to-volume ratio in any vertical. Technical troubleshooting, billing disputes, and service provisioning each require different agent skills and system access. The carrier-grade availability requirement (99.999%) eliminates many vendors. Integration with BSS/OSS platforms is mandatory for real-time account and network status.",
    ccaasLeaders: ["genesys", "nice-cxone", "cisco", "content-guru"],
    ccaasContext: "Telecom evaluations should verify carrier-grade SLAs and BYOC (Bring Your Own Carrier) support. Most telecom operations have existing PSTN relationships they need to preserve. Genesys and Cisco have the deepest telecom heritage. Verify the vendor can handle complex IVR trees (100+ nodes) and ACD routing that factors network status alongside customer data.",
  },
  insurance: {
    name: "Insurance", industryPage: "/industries/insurance",
    subVerts: "P&C, Life/Annuity, Health Insurance, Specialty/Surplus, Reinsurance",
    compliance: ["State insurance regulations", "SOC 2 Type II", "PCI for premiums", "Claims data protection", "NAIC"],
    keySystems: ["Guidewire", "Duck Creek", "Majesco", "Claims management", "Policy admin", "Agency management"],
    considerations: "Insurance contact centers operate on two distinct tracks: sales/service (policy inquiries, billing, endorsements) and claims (FNOL, status, adjustments). Each track has different SLAs, compliance requirements, and agent skill profiles. Integration with policy administration systems (Guidewire, Duck Creek) determines whether agents can quote, bind, and endorse in real time versus manual processing. Claims FNOL automation is the highest-ROI self-service use case.",
    ccaasLeaders: ["genesys", "nice-cxone", "five9", "talkdesk"],
    ccaasContext: "Insurance evaluations should require separate demos for service and claims workflows. Ask vendors to show FNOL intake through IVA with handoff to a claims adjuster including full context. Verify integration with your policy admin platform. Guidewire and Duck Creek connectors are available from Talkdesk and Five9 but maturity varies. State-level compliance and recording requirements add evaluation complexity.",
  },
  travel: {
    name: "Travel + Hospitality", industryPage: "/industries/travel",
    subVerts: "Airlines, Hotels/Resorts, Online Travel, Cruise, Car Rental",
    compliance: ["PCI DSS Level 1", "GDPR", "Multi-currency", "24/7 global coverage"],
    keySystems: ["GDS (Amadeus, Sabre)", "PMS (Opera, Mews)", "Revenue management", "Loyalty platforms"],
    considerations: "Travel contact centers must handle extreme volume volatility: weather events, cancellations, and crises can spike volume 5-20x within hours. The 24/7 global coverage requirement means follow-the-sun routing and multi-language support are mandatory. Integration with GDS (airline) or PMS (hotel) systems determines whether agents can rebook, upgrade, and refund without switching applications. Loyalty tier recognition must influence routing priority.",
    ccaasLeaders: ["genesys", "nice-cxone", "five9", "content-guru"],
    ccaasContext: "Travel evaluations should stress-test crisis response capabilities. Ask: 'How do we handle 10x volume in 2 hours when a weather event cancels 200 flights?' Global routing with multi-language support is a baseline. GDS or PMS integration is a differentiator. Without it, agents are copying data between systems on every call.",
  },
  government: {
    name: "Government", industryPage: "/industries/government",
    subVerts: "Federal Civilian, Defense/IC, State/Local, Public Safety, Benefits/Social Services, Courts/Justice",
    compliance: ["FedRAMP High", "ITAR", "CJIS", "Section 508/WCAG", "StateRAMP", "IL4/IL5"],
    keySystems: ["Case management", "Benefits systems", "311/911 platforms", "Records management"],
    considerations: "Government contact centers operate under the strictest compliance framework of any vertical. FedRAMP authorization is a hard gate for federal agencies. Vendors without it are eliminated regardless of capability. Accessibility (Section 508) is a legal requirement, not a nice-to-have. Multi-channel must include TTY/TDD support. Procurement cycles are 12-24 months and often require GSA schedule pricing.",
    ccaasLeaders: ["genesys", "nice-cxone", "cisco", "content-guru"],
    ccaasContext: "Government evaluations begin and end with compliance. FedRAMP High is mandatory for federal. StateRAMP or equivalent for state/local. Vendors must demonstrate Section 508 compliance across all agent and supervisor interfaces. Cisco and Content Guru have the strongest government track records. Procurement via GSA Schedule or BPA adds 3-6 months to the timeline.",
  },
  utilities: {
    name: "Utilities", industryPage: "/industries/utilities",
    subVerts: "Electric, Gas, Water/Sewer, Multi-utility, Cooperative",
    compliance: ["NERC CIP", "SOC 2 Type II", "PCI for billing", "Emergency protocols"],
    keySystems: ["CIS (billing)", "SCADA/OMS", "AMI/Smart metering", "Outage management"],
    considerations: "Utility contact centers handle two fundamentally different workloads: routine (billing, starts/stops, rate inquiries) and emergency (outage reporting, gas leaks, safety). Emergency handling requires dedicated routing, IVR, and staffing protocols that activate automatically based on outage management system data. Integration with CIS (Customer Information System) is mandatory. Agents must see billing, usage, and account history in real time. High-bill season and storm events create predictable volume spikes.",
    ccaasLeaders: ["genesys", "nice-cxone", "cisco", "five9"],
    ccaasContext: "Utility evaluations should verify emergency routing capabilities. Ask: 'How does the platform detect a major outage event and automatically shift IVR, routing, and staffing?' CIS integration is the single most important technical requirement. NERC CIP compliance applies to power utilities. Payment processing for bill pay requires PCI. Seasonal rate-change communications drive predictable volume spikes.",
  },
  manufacturing: {
    name: "Manufacturing", industryPage: "/industries/manufacturing",
    subVerts: "Discrete Manufacturing, Process Manufacturing, Automotive, Industrial Equipment, Consumer Products",
    compliance: ["ITAR", "SOC 2 Type II", "ISO 27001", "Supply chain data protection", "Multi-language"],
    keySystems: ["ERP (SAP, Oracle)", "PLM", "Supply chain management", "Dealer/distributor portals"],
    considerations: "Manufacturing contact centers serve three distinct constituencies: end customers (warranty, support), dealers/distributors (orders, technical), and internal stakeholders (supply chain, logistics). Each constituency requires different routing, knowledge, and system access. ERP integration (SAP, Oracle) is critical for order status, warranty validation, and parts availability. Technical support often requires visual assistance (video, co-browse) for complex equipment troubleshooting.",
    ccaasLeaders: ["genesys", "cisco", "nice-cxone", "five9"],
    ccaasContext: "Manufacturing evaluations should verify ERP integration capabilities. Ask vendors to demonstrate an inbound warranty claim with real-time SAP screen pop showing order history, warranty status, and parts availability. Multi-language support is often required for global manufacturing operations. Video/co-browse capabilities are important for technical support of complex equipment.",
  },
  education: {
    name: "Education", industryPage: "/industries/education",
    subVerts: "Higher Education, K-12, EdTech, Corporate Training, Student Services",
    compliance: ["FERPA", "COPPA (K-12)", "SOC 2 Type II", "Section 508/WCAG", "Student data protection"],
    keySystems: ["SIS (Student Information Systems)", "LMS (Canvas, Blackboard)", "CRM (Slate, Salesforce)", "Financial aid systems"],
    considerations: "Education contact centers face extreme seasonality. Enrollment periods drive 3-5x normal volume. Financial aid inquiries are the most complex and highest-volume contact type in higher education. SIS integration (Banner, PeopleSoft, Workday Student) determines whether agents can access enrollment, financial aid, and academic records without switching systems. FERPA compliance is mandatory and prohibits sharing student records without proper authentication.",
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
export function hasScoredVerticalFit(categorySlug) {
  return categorySlug === "ccaas";
}

/** Vertical fit for one vendor in one vertical. Returns 2, a neutral default,
    when the vendor is unscored, matching the render behaviour. */
export function verticalFit(vendorSlug, verticalSlug) {
  return CCAAS_VERTICAL_FIT[vendorSlug]?.[verticalSlug] ?? 2;
}
