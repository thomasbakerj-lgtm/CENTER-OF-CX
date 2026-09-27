import IndustryPage from "./src/lib/IndustryPage.jsx";
import { claimIds } from "./src/lib/claims.js";

/* Manufacturing industry page: the content, as data. IndustryPage renders it (redesign Phase 8 part 2); every claim token still
   renders through ClaimText and is listed once through ClaimSources. */
export default function ManufacturingVertical() {
  const subVerticals = [
    { name: "Automotive OEM", slug: "automotive-oem", desc: "Recalls, warranty, connected vehicle support, EV ownership, and brand loyalty. [[mfg.nhtsa.recalled]] vehicles under safety recall in the US in 2025, with NHTSA oversight.", contact: "High volume, recall-driven surges" },
    { name: "Automotive Dealer & Retail", slug: "automotive-dealer", desc: "BDC operations, service scheduling, sales follow-up, F&I support, and CSI management. The dealer is the brand experience for most owners.", contact: "Moderate volume, revenue-driven" },
    { name: "Industrial & B2B Manufacturing", slug: "industrial-b2b", desc: "Parts ordering, warranty claims, technical support, field service coordination, and distributor/channel support.", contact: "Lower volume, high technical complexity" },
    { name: "Consumer Electronics & Appliances", slug: "consumer-electronics", desc: "Product setup, troubleshooting, warranty claims, returns, and smart home integration. Post-purchase experience defines repurchase.", contact: "High volume, product complexity varies" },
    { name: "Aerospace & Defense", slug: "aerospace-defense", desc: "MRO support, parts logistics, AOG emergencies, regulatory compliance, and fleet operator technical services.", contact: "Low volume, mission-critical urgency" },
    { name: "Food & Beverage Manufacturing", slug: "food-beverage", desc: "Product quality complaints, allergen inquiries, recall management, retailer support, and consumer hotline.", contact: "Variable: recall-spike-driven" },
  ];
  /* Verified statistics only (TB, S23): each names its primary publisher, linked where checked on the publisher's own page. Aggregator, vendor-blog
     and uncited figures were removed. */
  const stats = [
    { n: "[[mfg.nhtsa.recalled]]", label: "Vehicles under safety recall in the US, 2025 campaigns", source: "NHTSA recall data", url: "https://static.nhtsa.gov/odi/ffdd/rcl/FLAT_RCL_POST_2010.zip" },
    { n: "[[mfg.warranty.claims]]", label: "Warranty claims paid in 2025 by US-based, publicly traded manufacturers", source: "Warranty Week, April 2026", url: "https://www.warrantyweek.com/archive/ww20260416.html" },
  ];
  const failureModes = [
    { title: "Recall campaigns create massive, unpredictable contact surges", desc: "[[mfg.ex.recall-surge]]: owners asking if their vehicle is affected, how to schedule a repair, and whether it's safe to drive. Without proactive VIN-specific notification and self-service scheduling, every affected owner calls individually." },
    { title: "Warranty claim disputes erode brand loyalty permanently", desc: "A customer whose repair is denied as 'not covered under warranty' may not buy from that brand again, and tells friends and family why. Warranty agents deciding coverage under time pressure with incomplete vehicle history handle some of the most consequential moments in manufacturing CX." },
    { title: "Connected vehicle and EV support requires a new agent profile", desc: "A Tesla owner calling about over-the-air update failures and a Ford owner calling about a Mustang Mach-E charging issue need agents with software and electrical engineering knowledge, which traditional automotive call center training does not cover. Training programs are still catching up." },
    { title: "Dealer and OEM support are disconnected", desc: "The customer sees one brand. The OEM and dealer operate as separate businesses with separate systems and separate incentives. An owner who calls the OEM about a bad dealer experience gets 'that's the dealer's responsibility.' An owner who calls the dealer about a product defect gets 'call the manufacturer.' Nobody owns the full experience." },
    { title: "B2B manufacturers run support as a cost center", desc: "Some industrial manufacturers still run support through email ticketing with next-day response targets, while each hour a customer's line sits idle costs that customer output. The disconnect between the customer's urgency and the manufacturer's response creates channel conflict: customers call their sales rep directly because support is too slow." },
  ];
  const stackLayers = [
    { layer: 7, name: "Analytics & Governance", vendors: "NICE, Verint, Medallia, J.D. Power", note: "Warranty cost analytics, recall completion tracking, CSI/SSI scoring, connected vehicle issue trending, and NPS by product line." },
    { layer: 6, name: "Routing & Orchestration", vendors: "Genesys, NICE CXone, Five9, Cisco", note: "Recall surge routing, warranty tier routing, VIN-based routing, technical escalation paths, and dealer vs OEM routing." },
    { layer: 5, name: "Conversation Management", vendors: "LivePerson, Sprinklr, Ada, Salesforce", note: "Recall notifications, connected vehicle in-car support, proactive maintenance reminders, warranty status portals, and social media management." },
    { layer: 4, name: "Reasoning & Planning", vendors: "Ada, Cognigy, Google CCAI, custom bots", note: "VIN recall lookup bots, warranty coverage verification, troubleshooting guides, parts lookup, and service scheduling." },
    { layer: 3, name: "Policy & Guardrails", vendors: "NHTSA compliance, Magnuson-Moss, UCC", note: "NHTSA recall compliance, Magnuson-Moss Warranty Act, lemon law state requirements, CPSC product safety, and ITAR/EAR for defense." },
    { layer: 2, name: "Workflow Execution", vendors: "Salesforce Mfg Cloud, SAP, Oracle, ServiceMax", note: "Warranty claim adjudication, recall scheduling, field service dispatch, parts order fulfillment, and RMA processing." },
    { layer: 1, name: "Data Access", vendors: "SAP, Oracle, Salesforce Mfg Cloud, DMS (CDK, Reynolds)", note: "ERP/MRP, warranty management, CRM, parts inventory, connected vehicle telemetry, and dealer management systems." },
  ];
  const benchmarks = [
    { metric: "CSAT", mfg: "[[mfg.bench.csat.mfg]]", cross: "[[mfg.bench.csat.cross]]", note: "Moves with warranty decisions, recall communication and product quality" },
    { metric: "FCR", mfg: "[[mfg.bench.fcr.mfg]]", cross: "[[mfg.bench.fcr.cross]]", note: "Warranty decisions, parts availability and technical diagnosis often need follow-up" },
    { metric: "AHT", mfg: "[[mfg.bench.aht.mfg]]", cross: "[[mfg.bench.aht.cross]]", note: "VIN or serial lookup, warranty verification and technical diagnosis add time" },
    { metric: "Attrition", mfg: "[[mfg.bench.attrition.mfg]]", cross: "[[mfg.bench.attrition.cross]]", note: "Technical specialization and product knowledge are the drivers to watch" },
    { metric: "Vehicles under recall (US)", mfg: "[[mfg.nhtsa.recalled]]", cross: "Not applicable", note: "Recall campaigns drive surges in owner contacts" },
  ];
  return (
    <IndustryPage
      slug="manufacturing"
      name="Manufacturing & Automotive"
      intro={"Warranty, recalls, technical support, parts logistics, and post-purchase service define manufacturing CX. In 2025, [[mfg.nhtsa.recalled]] vehicles in the US were covered by safety recalls, and US-based, publicly traded manufacturers paid [[mfg.warranty.claims]] in warranty claims. The contact center is where product quality meets customer loyalty."}
      stats={stats}
      segments={{ title: "Six distinct manufacturing service models.", intro: "An automotive OEM with millions of vehicles under warranty and an industrial pump maker supporting a few thousand business accounts have different CX requirements. Consumer vs B2B, recalls vs parts logistics, brand vs channel.", items: subVerticals }}
      failures={{ title: "Five failure modes unique to manufacturing CX.", items: failureModes }}
      stack={{ title: "Seven orchestration layers, mapped for manufacturing.", intro: "Layer 2 (Workflow Execution) carries disproportionate weight because warranty adjudication, recall scheduling, and parts fulfillment are the core workflows that determine CX outcomes. The agent's ability to resolve an issue is constrained by the warranty system's coverage rules and the parts system's inventory.", items: stackLayers }}
      benchmarks={{ title: "How manufacturing compares.", intro: "No free public source reports contact center metrics for manufacturing or automotive; SQM Group's by-industry breakouts do not include it. Measure yours with the linked tools. The all-industry figures are labelled with what they measure. The published manufacturing figure is NHTSA's own recall count.", columns: ["Manufacturing", "All Industries"], keys: ["mfg", "cross"], rows: benchmarks }}
      bpo={{ title: "How outsourcing fits in manufacturing CX.", value: ["Recall notification campaigns: high-volume outbound VIN-specific contact","Tier 1 warranty status and parts order tracking","Product registration and basic troubleshooting for consumer products","After-hours roadside assistance and emergency support","CSI survey administration and follow-up for automotive"], risk: ["Warranty claim adjudication requires product knowledge and authority BPOs typically lack","Technical troubleshooting for complex products needs engineering-level expertise","Dealer relationship management involves commercial sensitivity and brand authority","NHTSA safety-related complaint documentation has regulatory consequences","Connected vehicle and EV support requires software/firmware knowledge that evolves weekly"] }}
      vendors={{ items: [{ name: "Genesys", href: "/vendors/genesys" }, { name: "NICE CXone", href: "/vendors/nice-cxone" }, { name: "Five9", href: "/vendors/five9" }, { name: "Amazon Connect", href: "/vendors/amazon-connect" }, { name: "Talkdesk", href: "/vendors/talkdesk" }, { name: "Salesforce Service Cloud", href: "/vendors/ccaas", label: "Adjacent" }] }}
      sources={{ ids: claimIds([stats, subVerticals, failureModes, benchmarks, "[[mfg.warranty.claims]]"]), note: "Every figure on this page is a published figure checked on the publisher's own page, a worked example, or marked as having no public benchmark." }}
      cta={{ title: "Evaluating CX technology for manufacturing?", text: "Warranty system integration, recall routing, parts inventory connectivity, and connected product telemetry change which platforms are viable. We can help you build a shortlist weighted for your manufacturing sub-vertical.",
        links: [["/contact", "Request a Manufacturing CX Briefing"], ["/tools/cx-maturity", "Take the CX Maturity Assessment"]] }}
    />
  );
}
