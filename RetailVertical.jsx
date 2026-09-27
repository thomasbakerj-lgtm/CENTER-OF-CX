import IndustryPage from "./src/lib/IndustryPage.jsx";
import { claimIds } from "./src/lib/claims.js";

/* Retail industry page: the content, as data. IndustryPage renders it (redesign Phase 8 part 2); every claim token still
   renders through ClaimText and is listed once through ClaimSources. */
export default function RetailVertical() {
  const subVerticals = [
    { name: "eCommerce / DTC", slug: "ecommerce-dtc", desc: "Order status, returns, shipping issues, payment disputes, and cart abandonment recovery. Digital-native with chat and messaging-heavy channel mix. Speed defines the experience.", contact: "Very high volume, low AHT, peak seasonality" },
    { name: "Omnichannel Retail", slug: "omnichannel-retail", desc: "Buy online pick up in store, cross-channel returns, inventory inquiries, and loyalty programs. The complexity is in the handoff between digital and physical.", contact: "Mixed channels, complex fulfillment queries" },
    { name: "Subscription & Membership", slug: "subscription-membership", desc: "Billing cycles, cancellation and retention, membership benefits, and recurring order management. Every interaction carries churn risk.", contact: "Moderate volume, high retention stakes" },
    { name: "Marketplace Sellers", slug: "marketplace", desc: "Seller support, buyer disputes, listing issues, payment holds, and policy enforcement. Two-sided marketplace dynamics create unique CX challenges.", contact: "Dual audience, policy-heavy resolution" },
    { name: "Luxury & Specialty", slug: "luxury-specialty", desc: "Concierge-style service, product expertise, after-purchase care, and VIP client management. Experience quality directly influences purchase decisions.", contact: "Lower volume, very high value per interaction" },
    { name: "Grocery & Delivery", slug: "grocery-delivery", desc: "Substitution issues, delivery windows, order modifications, refunds, and real-time logistics communication. Speed and accuracy carry the experience.", contact: "High volume, time-sensitive, real-time logistics" },
  ];

  /* Verified statistics only (TB, S23): each is a fact claim read on the publisher's own page (src/lib/claims/retail.js). Research pass
     2026-09-25: the Qualtrics 2024 "$3.7T" (global, all industries) moved URL and was superseded by the publisher's 2026 estimate; the strip now
     carries retail figures. */
  const stats = [
    { n: "[[retail.stat.ecom-share]]", label: "E-commerce share of US retail sales, Q2 2026", source: "US Census Bureau, 2026", url: "https://www.census.gov/retail/ecommerce.html" },
    { n: "[[retail.returns.online]]", label: "Online sales retailers expect to be returned, 2025", source: "NRF and Happy Returns, 2025", url: "https://nrf.com/media-center/press-releases/consumers-expected-to-return-nearly-850-billion-in-merchandise-in-2025" },
    { n: "[[retail.stat.cut-spend]]", label: "Bad online retail experiences after which consumers cut spending", source: "Qualtrics XM Institute, 2025", url: "https://www.qualtrics.com/articles/customer-experience/3-trillion-risk-due-bad-customer-experiences-2026/" },
    { n: "[[retail.stat.cart]]", label: "Average documented cart abandonment rate across published studies", source: "Baymard Institute, 2025", url: "https://baymard.com/lists/cart-abandonment-rate" },
  ];

  const failureModes = [
    { title: "Order status and returns crowd out everything else", desc: "\"Where is my order\" and \"how do I return this\" make up much of the work in a retail contact center. Retailers told NRF they expect [[retail.returns.rate]] of 2025 sales to come back, and [[retail.returns.online]] of online sales. Without real-time order data and proactive shipping notices, agents spend their day on status lookups that automation could answer." },
    { title: "Seasonal staffing spikes erode quality", desc: "Peak season can bring [[retail.peak.spike]] a normal month's contact volume, and the returns wave follows it: [[retail.returns.seasonal]] of retailers surveyed by NRF planned to hire seasonal staff for holiday returns. Temporary agents hired fast with little training give uneven service just when customers are least patient." },
    { title: "Channel fragmentation loses the customer", desc: "A customer who starts on chat, phones about the same order, then emails a follow-up often meets three separate records of one problem. Each channel switch drops the context the last agent had." },
    { title: "Revenue-generating interactions get buried in service queues", desc: "Pre-purchase product questions, cart recovery opportunities, and upsell moments sit in the same queue as complaint handling. Without intent-based routing, revenue conversations wait behind refund requests." },
    { title: "Self-service deflects but doesn't resolve", desc: "Retailers invest in FAQ bots and help centers, but when the self-service path hits a wall (wrong tracking data, a policy exception, a damaged item), the handoff to a person often carries none of what the customer already said. They start over, and they are more annoyed than when they began." },
  ];

  const stackLayers = [
    { layer: 7, name: "Analytics & Governance", vendors: "CallMiner, NICE Nexidia, Qualtrics, Medallia", note: "Post-purchase sentiment tracking. Returns root cause analysis. Agent performance during peak seasons. Review and social sentiment correlation." },
    { layer: 6, name: "Routing & Orchestration", vendors: "Genesys, NICE CXone, Talkdesk Retail, Five9", note: "Intent-based routing separating pre-purchase, order status, returns, and escalations. VIP and loyalty tier routing. Peak season overflow management." },
    { layer: 5, name: "Conversation Management", vendors: "Gladly, Gorgias, Zendesk, Intercom, Ada, Kustomer", note: "Chat and messaging as primary channels. Social commerce integration. Proactive order status notifications. Cart abandonment outreach." },
    { layer: 4, name: "Reasoning & Planning", vendors: "Ada, Forethought, Cognigy, Salesforce Einstein", note: "Order status bots with real-time OMS data. Returns eligibility automation. Product recommendation AI. Size and fit guidance." },
    { layer: 3, name: "Policy & Guardrails", vendors: "Forter, Sift, Signifyd, Stripe Radar", note: "Fraud prevention in returns and exchanges. Payment dispute management. Policy exception handling logic. Chargeback prevention." },
    { layer: 2, name: "Workflow Execution", vendors: "Shopify Flow, MuleSoft, Workato, Celigo", note: "Returns processing automation. Refund workflow orchestration. Inventory check integration. Loyalty point adjustment." },
    { layer: 1, name: "Data Access", vendors: "Shopify, Salesforce Commerce, SAP, Oracle Commerce, BigCommerce", note: "OMS, inventory, customer order history, loyalty program data, and payment records must surface in the agent desktop in real time." },
  ];

  const benchmarks = [
    { metric: "CSAT", retail: "[[retail.bench.csat.retail]]", cross: "[[retail.bench.csat.cross]]", note: "Moves with returns friction and delivery problems as much as with the service contact itself" },
    { metric: "FCR", retail: "[[retail.bench.fcr.retail]]", cross: "[[retail.bench.fcr.cross]]", note: "Many retail contacts are single transactions (order status, a return, a refund) that one contact can close" },
    { metric: "AHT", retail: "[[retail.bench.aht.retail]]", cross: "[[retail.bench.aht.cross]]", note: "Driven by the mix of quick status checks against disputes, exchanges and product advice" },
    { metric: "Abandon Rate", retail: "[[retail.bench.abandon.retail]]", cross: "[[retail.bench.abandon.cross]]", note: "Driven by staffing against promotion and holiday peaks, and by how much volume digital channels take" },
    { metric: "Attrition", retail: "[[retail.bench.attrition.retail]]", cross: "[[retail.bench.attrition.cross]]", note: "Seasonal hiring, pay and repetitive work are the drivers to watch" },
    { metric: "Containment", retail: "[[retail.bench.containment.retail]]", cross: "[[retail.bench.containment.cross]]", note: "Depends on whether bots read live order, carrier and returns data" },
  ];

  return (
    <IndustryPage
      slug="retail"
      name="Retail & eCommerce"
      intro={"Speed, volume, and seasonality shape retail CX. A slow answer can cost a sale, and a return handled badly can cost the customer. This page covers what is published about retail contact centers, how the technology stack maps to retail work, where operations break, and which platforms retail buyers often evaluate, across eCommerce, omnichannel, subscription, marketplace, luxury and grocery."}
      stats={stats}
      segments={{ title: "Six distinct retail service models.", intro: "A Shopify DTC brand handling returns over chat and a luxury retailer providing concierge service have fundamentally different technology needs, staffing models, and success metrics. The platform that serves one will often fail the other.", items: subVerticals }}
      failures={{ title: "Five failure modes unique to retail CX.", items: failureModes }}
      stack={{ title: "Seven orchestration layers, mapped for retail.", intro: "Layer 5 (Conversation Management) carries extra weight in retail because chat, messaging and social are primary channels for many retailers. A plan that puts most of the budget into voice and little into digital engagement leaves the busiest channels underbuilt.", items: stackLayers }}
      benchmarks={{ title: "How retail compares.", intro: "The one published retail figure is SQM Group's first contact resolution for retail call centers, above its all-industry average; SQM attributes the gap to less complex calls. No free public source reports the other metrics for retail; measure yours with the linked tools. Each all-industry figure is labelled with what it measures.", columns: ["Retail", "All Industries"], keys: ["retail", "cross"], rows: benchmarks,
        links: [["/tools/cost-per-contact", "Price your own cost per contact"], ["/tools/tco-calculator", "Model your retail TCO"]] }}
      bpo={{ title: "How outsourcing fits in retail CX.", value: ["Peak season scaling (Black Friday, holiday, back-to-school)", "Order status and tracking inquiries: high volume, low complexity", "Returns processing and refund authorization", "After-hours and weekend coverage for global eCommerce", "Social media response management for brand protection"], risk: ["VIP and loyalty tier interactions require brand intimacy BPOs rarely achieve", "Complex product expertise (luxury, technical goods) needs deep training investment", "Retention and save offers require authority and system access most BPO contracts underspecify", "Fraud detection in returns requires institutional pattern recognition", "Brand voice consistency degrades when multiple BPO teams serve the same customer base"] }}
      vendors={{ items: [{ name: "Genesys", href: "/vendors/genesys" }, { name: "NICE CXone", href: "/vendors/nice-cxone" }, { name: "Talkdesk", href: "/vendors/talkdesk" }, { name: "Five9", href: "/vendors/five9" }, { name: "Gladly", href: "/vendors", label: "Adjacent" }, { name: "Gorgias", href: "/vendors", label: "Adjacent" }] }}
      sources={{ ids: claimIds([stats, benchmarks, failureModes]), note: "Every figure on this page is a published figure checked on the publisher's own page, a labelled planning assumption you can test with your own numbers, or marked as having no public benchmark." }}
      cta={{ title: "Evaluating CX technology for retail?", text: "Speed, seasonality, and commerce integration change which platforms are viable. We can help you build a shortlist weighted for your sub-vertical: eCommerce, omnichannel, subscription, or marketplace.",
        links: [["/contact", "Request a Retail CX Briefing"], ["/tools/cx-maturity", "Take the CX Maturity Assessment"]] }}
    />
  );
}
