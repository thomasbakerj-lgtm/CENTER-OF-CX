import IndustryPage from "./src/lib/IndustryPage.jsx";
import { claimIds } from "./src/lib/claims.js";

/* Telecom industry page: the content, as data. IndustryPage renders it (redesign Phase 8 part 2); every claim token still
   renders through ClaimText and is listed once through ClaimSources. */
export default function TelecomVertical() {
  const subVerticals = [
    { name: "Mobile / Wireless Carriers", slug: "mobile-wireless", desc: "Plan changes, billing disputes, device support, network coverage complaints, and retention. High volume in a market where switching carriers is easy.", contact: "Extreme volume, churn-driven" },
    { name: "Broadband / ISP", slug: "broadband-isp", desc: "Service activation, speed complaints, outage management, billing, and technical troubleshooting. Calls usually start with a service problem.", contact: "High volume, high frustration" },
    { name: "Cable & Pay TV", slug: "cable-tv", desc: "Package management, billing, equipment troubleshooting, content disputes, and cord-cutting retention. A shrinking market working to keep every subscriber.", contact: "Declining volume, high save urgency" },
    { name: "Enterprise & Business Communications", slug: "enterprise-comms", desc: "UCaaS/SD-WAN support, SLA management, provisioning, circuit troubleshooting, and account management. B2B with revenue-critical uptime requirements.", contact: "Lower volume, very high revenue per account" },
    { name: "Managed Service Providers", slug: "managed-services", desc: "NOC support, incident management, SLA reporting, change requests, and multi-vendor coordination. Technical depth defines the service quality.", contact: "Technical volume, SLA-driven" },
    { name: "Fiber & Infrastructure", slug: "fiber-infrastructure", desc: "Installation scheduling, construction updates, service activation, and wholesale/carrier support. Long lead times with high customer anxiety.", contact: "Project-based, milestone-driven" },
  ];

  /* Verified statistics only (TB, S23): each names its primary publisher, linked where checked on the publisher's own page. Aggregator, vendor-blog
     and uncited figures were removed. */
  const stats = [
    { n: "[[tel.bench.nps.tel]]", label: "Global telecom NPS; other industries Simon-Kucher compares: [[tel.bench.nps.cross]]", source: "Simon-Kucher Global Telecommunications Study 2025", url: "https://www.simon-kucher.com/en/insights/leveraging-customer-happiness-drive-growth-key-insights-global-telecommunications-study" },
    { n: "[[tel.stat.fcr]]", label: "Of mobile and broadband support issues resolved on first contact, as consumers report it", source: "Simon-Kucher Global Telecommunications Study 2025", url: "https://www.simon-kucher.com/en/insights/leveraging-customer-happiness-drive-growth-key-insights-global-telecommunications-study" },
    { n: "[[tel.bench.fcr.tel]]", label: "First contact resolution in telco call centers, by post-call survey (all industries: [[tel.bench.fcr.cross]])", source: "SQM Group FCR Benchmarking by Industry 2026", url: "https://www.sqmgroup.com/resources/library/blog/fcr-metric-operating-philosophy" },
  ];

  const failureModes = [
    { title: "Billing complexity drives a large share of contact volume", desc: "Promotional pricing that expires, hidden fees, prorated charges, device installments, and taxes create bills that customers cannot understand. Billing can account for [[tel.billing.share]] of inbound calls, and the agent often can't explain the bill either because the billing system logic is opaque." },
    { title: "Retention offers reward disloyalty over loyalty", desc: "Customers who threaten to cancel receive better pricing than loyal customers who never complain. This creates a perverse incentive: the best way to get a good deal is to call and threaten to leave. Savvy customers learn the retention playbook and call quarterly for discounts, consuming agent time without genuine churn risk." },
    { title: "Technical support and billing share a queue", desc: "A customer with no internet service (urgent, technical) waits behind a customer disputing a small charge (low urgency, billing). Without intent-based routing, urgent service issues compete with routine billing inquiries for the same agents." },
    { title: "Outage communication is reactive instead of proactive", desc: "When a network outage occurs, thousands of customers call to report the same issue. Without proactive outage notifications and IVR intercepts, every affected customer generates a call the agent can't resolve, because the fix is in the network, not the contact center." },
    { title: "Agent attrition drains experience from the hardest calls", desc: "Telecom contact center agents face angry customers, complex systems, and constant pressure to upsell. When that load drives turnover, the agents left handling complex billing and technical issues are often the least experienced. No public source reports telecom agent attrition; measure your own." },
  ];

  const stackLayers = [
    { layer: 7, name: "Analytics & Governance", vendors: "NICE Nexidia, Verint, Medallia, Qualtrics", note: "Churn prediction models, NPS drivers, billing complaint root cause, and network experience correlation. Analytics must connect CX data to network data." },
    { layer: 6, name: "Routing & Orchestration", vendors: "Genesys, NICE CXone, Avaya, Cisco", note: "Intent-based routing separating billing, tech support, sales, retention, and outage. Proactive outage IVR intercepts. Retention-skilled agent routing." },
    { layer: 5, name: "Conversation Management", vendors: "LivePerson, Sprinklr, Glia, Ada", note: "Digital-first for billing and account changes. Social media management for network complaints. Proactive outage notifications. In-app support." },
    { layer: 4, name: "Reasoning & Planning", vendors: "Cognigy, Kore.ai, Google CCAI, Amelia", note: "Bill explanation bots, plan comparison bots, outage status bots, speed test integration, and device troubleshooting. High containment potential for routine queries." },
    { layer: 3, name: "Policy & Guardrails", vendors: "Pindrop, Amdocs, CSG, TransUnion", note: "CPNI compliance for customer data protection. FCC regulatory requirements. Credit check and fraud prevention. TCPA consent for marketing communications." },
    { layer: 2, name: "Workflow Execution", vendors: "Amdocs, CSG, Pega, ServiceNow", note: "Service activation, plan change, device upgrade, trouble ticket, and retention save workflows. Order fallout management for failed provisioning." },
    { layer: 1, name: "Data Access", vendors: "Amdocs, CSG, Netcracker, Salesforce Comms Cloud", note: "BSS/OSS integration: billing, CRM, network inventory, service inventory, and order management. The unified customer view across all product lines." },
  ];

  const benchmarks = [
    { metric: "CSAT", avg: "[[tel.bench.csat.tel]]", cross: "[[tel.bench.csat.cross]]", note: "Moves with billing confusion, outages, and retention friction" },
    { metric: "FCR", avg: "[[tel.bench.fcr.tel]]", cross: "[[tel.bench.fcr.cross]]", note: "Multi-system complexity and cross-department handoffs stand in the way of single-contact resolution" },
    { metric: "AHT", avg: "[[tel.bench.aht.tel]]", cross: "[[tel.bench.aht.cross]]", note: "Driven by billing explanations, technical troubleshooting, and retention negotiations" },
    { metric: "NPS", avg: "[[tel.bench.nps.tel]]", cross: "[[tel.bench.nps.cross]]", note: "Moves with price and value perception, network reliability, and service" },
    { metric: "Attrition", avg: "[[tel.bench.attrition.tel]]", cross: "[[tel.bench.attrition.cross]]", note: "Angry customers, complex systems, and upsell pressure are the drivers to watch" },
  ];

  const bpoRisks = [
    "Retention and save conversations require authority and system access that BPO contracts often underspecify",
    "Network troubleshooting above Tier 1 requires NOC access and engineering escalation paths",
    "Enterprise and business accounts need deep product knowledge and SLA awareness",
    "CPNI training gaps create regulatory exposure: FCC rules ([[tel.fcc.cpni]]) require authentication before any CPNI is disclosed on a customer call",
    "The FCC has proposed limits on foreign call centers for telecom, wireless, VoIP, cable and satellite providers ([[tel.fcc.onshoring]]); track the rulemaking before moving work offshore",
    "Complex billing disputes require system expertise that generic BPO training can't replicate",
  ];


  return (
    <IndustryPage
      slug="telecom"
      name="Telecommunications"
      intro={"Telecom runs on support, retention, billing, service activation, and churn management. Simon-Kucher puts global telecom NPS below every other industry it compares, and telecom CX runs under structural pressures (billing complexity, network dependency, easy switching) that chatbot deflection alone does not fix. This is the vertical-specific intelligence layer: benchmarks, failure modes, technology stack mapping, and vendor recommendations built for carriers, ISPs, and enterprise communications."}
      stats={stats}
      segments={{ title: "Six distinct telecom service models.", intro: "A national wireless carrier with tens of millions of subscribers and a managed service provider with a few hundred enterprise clients have fundamentally different CX requirements. The technology, staffing, and retention models diverge completely.", items: subVerticals }}
      failures={{ title: "Five failure modes unique to telecom CX.", items: failureModes }}
      stack={{ title: "Seven orchestration layers, mapped for telecom.", intro: "Layer 1 (Data Access) and Layer 2 (Workflow Execution) carry disproportionate weight because telecom BSS/OSS complexity is a frequent root cause of CX failures. The billing system, the network inventory, and the order management system determine what the agent can actually do, not just see.", items: stackLayers }}
      benchmarks={{ title: "How telecom compares.", intro: "Two published figures cover telecom: SQM Group's first contact resolution for telco call centers, measured by post-call survey and below its all-industry average, and Simon-Kucher's global telecom NPS, below the other industries it compares. No free public source reports the other metrics for telecom; measure yours with the linked tools. Each all-industry figure is labelled with what it measures.", columns: ["Telecom", "All Industries"], keys: ["avg", "cross"], rows: benchmarks,
        links: [["/tools/cost-per-contact", "Price your own cost per contact"], ["/tools/tco-calculator", "Model your telecom TCO"]] }}
      bpo={{ title: "How outsourcing fits in telecom CX.", value: ["Tier 1 billing inquiries and plan change requests: high volume, scriptable","Device activation and basic setup support","Outbound collections and payment arrangement calls","After-hours coverage for service disruption reporting","Seasonal scaling for product launches and promotional campaigns"], risk: bpoRisks }}
      vendors={{ items: [{ name: "Genesys", href: "/vendors/genesys" }, { name: "NICE CXone", href: "/vendors/nice-cxone" }, { name: "Cisco", href: "/vendors/cisco" }, { name: "Avaya", href: "/vendors" }, { name: "Five9", href: "/vendors/five9" }, { name: "Amazon Connect", href: "/vendors/amazon-connect" }] }}
      sources={{ ids: claimIds([stats, benchmarks, failureModes, bpoRisks]), note: "Every figure on this page is a published figure checked on the publisher's own page, a labelled planning assumption you can test with your own numbers, or marked as having no public benchmark." }}
      cta={{ title: "Evaluating CX technology for telecom?", text: "BSS/OSS integration, churn prediction, and retention routing change which platforms are viable. We can help you build a shortlist weighted for your sub-vertical: wireless carrier, broadband, enterprise, or managed services.",
        links: [["/contact", "Request a Telecom CX Briefing"], ["/tools/cx-maturity", "Take the CX Maturity Assessment"]] }}
    />
  );
}
