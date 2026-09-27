import IndustryPage from "./src/lib/IndustryPage.jsx";
import { claimIds } from "./src/lib/claims.js";

/* Financial services industry page: the content, as data. IndustryPage renders it (redesign Phase 8 part 2); every claim token
   still renders through ClaimText and is listed once through ClaimSources. */
export default function FinancialServicesVertical() {
  const subVerticals = [
    { name: "Retail Banking", slug: "retail-banking", desc: "Account servicing, fraud alerts, card disputes, loan inquiries, and branch-to-digital migration. High volume with a broad channel mix.", contact: "High volume, moderate complexity" },
    { name: "Credit Unions", slug: "credit-unions", desc: "Member-centric service with relationship depth. Smaller operations but higher trust expectations and community accountability.", contact: "Lower volume, higher relationship intensity" },
    { name: "Insurance (P&C, Life, Health)", slug: "insurance", desc: "Claims intake (FNOL), policy servicing, renewals, underwriting support, and high-emotion service journeys. Compliance and empathy are equally critical.", contact: "Moderate volume, high complexity per interaction" },
    { name: "Wealth Management & Advisory", slug: "wealth-management", desc: "Portfolio inquiries, advisor scheduling, compliance-sensitive communications, and high-value client retention. Every interaction carries revenue risk.", contact: "Low volume, very high value per interaction" },
    { name: "Lending & Mortgage", slug: "lending-mortgage", desc: "Application status, document collection, rate inquiries, closing coordination, and servicing. Long lifecycle journeys with multiple handoffs.", contact: "Seasonal volume spikes, complex multi-step journeys" },
    { name: "Fintech & Neobanks", slug: "fintech-neobanks", desc: "Digital-native service models with app-first support, instant resolution expectations, and chat-heavy channel mix. Speed and self-service define the experience.", contact: "High digital volume, low tolerance for friction" },
    { name: "Payments & Processing", slug: "payments-processing", desc: "Merchant support, transaction disputes, terminal troubleshooting, settlement inquiries, and integration support. B2B and B2C service models coexist.", contact: "Mixed B2B and B2C, technical support needs" },
  ];

  /* Verified statistics only (TB, S23): each names its primary publisher, linked where checked on the publisher's own page. Aggregator, vendor-blog
     and uncited figures were removed. */
  const stats = [
    { n: "[[fs.stat.fcr-below-70]]", label: "Of banks worldwide report first contact resolution below the level Capgemini treats as the industry benchmark", source: "Capgemini, World Retail Banking Report 2024", url: "https://www.capgemini.com/wp-content/uploads/2024/03/WRBR_2024_web.pdf" },
  ];

  const failureModes = [
    { title: "Authentication friction kills digital adoption", desc: "Customers must re-authenticate when switching channels, creating abandonment at the exact moment they need help most. Identity verification adds [[fs.auth.time]] per interaction in regulated environments." },
    { title: "Compliance recording creates agent cognitive load", desc: "Mandatory disclosures, consent language, and call recording requirements add process steps that increase AHT and reduce the agent's ability to focus on resolution." },
    { title: "Fraud and service use the same queue", desc: "Fraud alerts requiring immediate action compete with routine balance inquiries for agent attention. Without intent-based routing, high-urgency interactions wait behind low-complexity ones." },
    { title: "Branch-to-digital handoffs lose context", desc: "When a customer starts a mortgage conversation in-branch and follows up through the contact center, context is lost. The agent sees the account but has no visibility into the branch interaction." },
    { title: "Retention save workflows burn agents out", desc: "Agents handling cancellation and retention calls face emotional labor that accelerates attrition. These interactions require negotiation skills that training programs often underinvest in." },
  ];

  const stackLayers = [
    { layer: 7, name: "Analytics & Governance", vendors: "NICE Nexidia, Verint, CallMiner, Observe.AI, Qualtrics XM", fsNote: "Compliance recording and auditability are non-negotiable. Interaction analytics must support regulatory review and dispute resolution." },
    { layer: 6, name: "Routing & Orchestration", vendors: "Genesys, NICE CXone, Five9, Talkdesk FS", fsNote: "Intent-based routing separating fraud, service, and sales. VIP routing for wealth management. Skills-based routing for licensed representatives." },
    { layer: 5, name: "Conversation Management", vendors: "Glia, LivePerson, Unblu, Intercom, Ada", fsNote: "Secure messaging for sensitive data. Co-browsing for complex applications. Video for advisory consultations. Chat for transactional queries." },
    { layer: 4, name: "Reasoning & Planning", vendors: "Kasisto, Cognigy, Kore.ai, Amelia, Google CCAI", fsNote: "AI must handle balance inquiries, transaction lookups, and card management while escalating fraud, disputes, and complex financial advice to humans." },
    { layer: 3, name: "Policy & Guardrails", vendors: "Sift, BioCatch, Forter, Pindrop, Nuance", fsNote: "PCI compliance for payment data. KYC/AML identity verification. Fraud detection integrated into the interaction flow. Consent management." },
    { layer: 2, name: "Workflow Execution", vendors: "MuleSoft, Workato, UiPath, Pega, ServiceNow", fsNote: "Account opening workflows. Dispute resolution automation. Loan origination orchestration. Cross-system data synchronization." },
    { layer: 1, name: "Data Access", vendors: "Salesforce FSC, FIS, Fiserv, Jack Henry, Temenos", fsNote: "Core banking integration is the foundation. Agent desktop must surface account data, transaction history, and product holdings in real time." },
  ];

  const benchmarks = [
    { metric: "CSAT", fs: "[[fs.bench.csat.fs]]", cross: "[[fs.bench.csat.cross]]", note: "Moves with authentication friction, hold time and whether the issue is resolved" },
    { metric: "FCR", fs: "[[fs.bench.fcr.fs]]", cross: "[[fs.bench.fcr.cross]]", note: "Compliance steps and lookups across several systems stand in the way of single-contact resolution" },
    { metric: "AHT", fs: "[[fs.bench.aht.fs]]", cross: "[[fs.bench.aht.cross]]", note: "An average hides the spread: quick transactional calls sit beside long dispute, claims and advisory calls" },
    { metric: "Abandon Rate", fs: "[[fs.bench.abandon.fs]]", cross: "[[fs.bench.abandon.cross]]", note: "Driven by authentication friction, hold time and staffing gaps at peak" },
    { metric: "Attrition", fs: "[[fs.bench.attrition.fs]]", cross: "[[fs.bench.attrition.cross]]", note: "Emotional labor on fraud, collections and retention calls is the driver to watch" },
    { metric: "Containment", fs: "[[fs.bench.containment.fs]]", cross: "[[fs.bench.containment.cross]]", note: "Security and compliance requirements set what automation can handle on its own" },
  ];

  return (
    <IndustryPage
      slug="financial-services"
      name="Financial Services"
      intro={"Trust, compliance, and identity verification shape every interaction. Financial services CX operates under constraints that generic platforms and generic advice fail to address. This is the vertical-specific intelligence layer: benchmarks, technology stack mapping, failure modes, and vendor recommendations built for banking, insurance, lending, and wealth management."}
      stats={stats}
      segments={{ title: "Financial services is seven verticals in one.", intro: "A retail banking contact center and a wealth management advisory desk have fundamentally different service models, compliance requirements, and technology needs. Treating them as one vertical is the first evaluation mistake.", items: subVerticals }}
      failures={{ title: "Five failure modes unique to financial services CX.", intro: "These are the operational patterns that generic CX platforms and generic advice consistently miss. Each one creates measurable cost, risk, or attrition when left unaddressed.", items: failureModes }}
      stack={{ title: "Seven orchestration layers, mapped for financial services.", intro: "Every layer manifests differently in financial services. Layer 3 (Policy & Guardrails) carries disproportionate weight because compliance failures create regulatory exposure that no amount of CSAT improvement can offset.", items: stackLayers.map((sl) => ({ ...sl, note: sl.fsNote })) }}
      benchmarks={{ title: "How financial services compares.", intro: "SQM Group publishes first contact resolution and customer satisfaction for its financial services clients as one group, both close to its all-industry figures, and Capgemini publishes abandon rates from its survey of retail bank employees. No free public source reports handle time, attrition or containment for financial services; measure yours with the linked tools. Each all-industry figure is labelled with what it measures.", columns: ["Financial Services", "All Industries"], keys: ["fs", "cross"], rows: benchmarks,
        links: [["/tools/cost-per-contact", "Price your own cost per contact"], ["/tools/tco-calculator", "Model your FS TCO"]] }}
      bpo={{ title: "How outsourcing fits in financial services CX.", value: ["After-hours and overflow coverage for transactional inquiries", "Collections and early-stage delinquency management", "Back-office processing (document verification, data entry)", "Seasonal scaling for open enrollment or tax season", "Multilingual support for diverse customer bases"], risk: ["Fraud detection and identity verification require deep institutional knowledge", "Wealth management and advisory interactions demand licensed representatives", "Regulatory compliance varies by state and jurisdiction, BPO training gaps create exposure", "Complex dispute resolution requires system access and authority that BPOs often lack", "Data residency and privacy requirements may restrict offshore processing"] }}
      vendors={{ items: [{ name: "Genesys", href: "/vendors/genesys" }, { name: "NICE CXone", href: "/vendors/nice-cxone" }, { name: "Talkdesk", href: "/vendors/talkdesk" }, { name: "Five9", href: "/vendors/five9" }, { name: "Cisco", href: "/vendors/cisco" }, { name: "Amazon Connect", href: "/vendors/amazon-connect" }] }}
      sources={{ ids: claimIds([stats, benchmarks, failureModes]), note: "Every figure on this page is a published figure checked on the publisher's own page, a labelled planning assumption you can test with your own numbers, or marked as having no public benchmark." }}
      cta={{ title: "Evaluating CX technology for financial services?", text: "Compliance, identity verification, and core banking integration change which platforms are viable and which are risky. We can help you build a shortlist weighted for your specific sub-vertical: retail banking, insurance, lending, or wealth management.",
        links: [["/contact", "Request a Financial Services Briefing"], ["/tools/cx-maturity", "Take the CX Maturity Assessment"]] }}
    />
  );
}
