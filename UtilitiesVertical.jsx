import IndustryPage from "./src/lib/IndustryPage.jsx";
import { claimIds } from "./src/lib/claims.js";

/* Utilities industry page: the content, as data. IndustryPage renders it (redesign Phase 8 part 2); every claim token still
   renders through ClaimText and is listed once through ClaimSources. */
/* The hero sentence carries a claim token; listed here so the Sources block includes it. */
const HERO_TOKENS = "[[utl.eia.hours]]";

export default function UtilitiesVertical() {
  const subVerticals = [
    { name: "Electric Utilities (IOU)", slug: "electric-iou", desc: "Outage management, billing, service activation, energy efficiency programs, and storm response. Storm exposure and public visibility make it the most demanding utility type for the contact center.", contact: "High volume, storm-driven surges" },
    { name: "Natural Gas", slug: "natural-gas", desc: "Gas leaks, service connections, billing, appliance programs, and safety. Every gas-related call carries potential safety urgency.", contact: "Moderate volume, safety-critical" },
    { name: "Water & Wastewater", slug: "water", desc: "Billing, service quality, conservation programs, main breaks, and boil-water advisories. Essential service with public health implications.", contact: "Moderate volume, public health sensitivity" },
    { name: "Municipal & Co-Op Utilities", slug: "municipal-coop", desc: "Community-owned service with direct accountability to residents. Smaller operations with higher trust expectations and political visibility.", contact: "Lower volume, community accountability" },
    { name: "Renewable Energy & DER", slug: "renewable-der", desc: "Solar interconnection, battery storage, EV charging, net metering, and distributed energy resource management. A growing share of utility contacts.", contact: "Growing volume, technical complexity" },
    { name: "Energy Retail / Competitive Supply", slug: "energy-retail", desc: "Plan selection, rate comparison, contract management, and switching. Competitive markets where CX directly determines customer acquisition and retention.", contact: "Sales-driven, churn-sensitive" },
  ];
  /* Verified statistics only (TB, S23): each is a fact claim checked on the publisher's own page (research pass 2026-09-25).
     The ACSI and J.D. Power figures printed before could not be re-read on theacsi.com or jdpower.com and were retired. */
  const stats = [
    { n: "[[utl.eia.hours]]", label: "Average time without power per U.S. electricity customer in 2024"  },
    { n: "[[utl.eia.major]]", label: "Of hours without power in 2024 came from major events such as hurricanes"  },
    { n: "[[utl.eia.routine]]", label: "Without power per customer each year from routine interruptions, outside major events"  },
    { n: "[[utl.eia.saifi]]", label: "Power interruptions per customer in 2024"  },
  ];
  const failureModes = [
    { title: "Storm events multiply call volume within hours", desc: "Major events such as hurricanes caused [[utl.eia.major]] of U.S. customer hours without power in 2024, and Hurricane Helene alone cut power to [[utl.eia.helene]]. [[utl.ex.storm]] Without proactive outage notifications, IVR storm messaging, and automated restoration updates, the queue fills faster than any staffing plan can respond, and agents can only say 'we're aware of the outage and working to restore service.'" },
    { title: "Bill complexity makes every billing call longer than it needs to be", desc: "Demand charges, tiered rates, time-of-use pricing, fuel surcharges, regulatory riders, and taxes create bills that many customers, and some agents, struggle to explain. A billing call can spend [[utl.bill.explain]] on interpreting the bill before it reaches the actual concern." },
    { title: "Field service coordination is disconnected from customer communication", desc: "A customer calls about a downed power line. The contact center creates a ticket. A crew is dispatched. [[utl.ex.callbacks]] The field operations system and the contact center system don't share real-time status." },
    { title: "Payment difficulty is a public health and safety issue", desc: "Some customers cannot pay their full bill, and utilities cannot simply disconnect them: disconnection rules, winter moratoriums, and medical protection protocols create complex decision trees. Agents handling payment difficulty need social services training alongside billing system skills." },
    { title: "Customers rarely contact their utility, and usually because something is wrong", desc: "Contact tends to start with an outage, a high bill or a service problem, with few routine positive moments in between. Each interaction therefore weighs heavily in how the customer sees the utility." },
  ];
  const stackLayers = [
    { layer: 7, name: "Analytics & Governance", vendors: "NICE Nexidia, Verint, J.D. Power, Qualtrics", note: "J.D. Power satisfaction tracking, outage communication effectiveness, billing complaint root cause, and regulatory compliance reporting." },
    { layer: 6, name: "Routing & Orchestration", vendors: "Genesys, NICE CXone, Cisco, Avaya", note: "Storm IVR intercepts, outage vs billing vs service routing, priority routing for gas leaks and safety, and field dispatch coordination." },
    { layer: 5, name: "Conversation Management", vendors: "Notifi (Questline), Kubra, Sprinklr, Ada", note: "Proactive outage notifications, bill explanation tools, payment arrangement portals, and energy efficiency program enrollment." },
    { layer: 4, name: "Reasoning & Planning", vendors: "Cognigy, Ada, Google CCAI, utility-specific bots", note: "Outage status bots with real-time OMS data, bill explanation bots, payment arrangement bots, and move/start/stop service automation." },
    { layer: 3, name: "Policy & Guardrails", vendors: "PUC compliance, custom regulatory, Oracle Utilities", note: "Disconnection moratorium rules, medical baseline protections, CARE/LIHEAP payment assistance, PII/CPNI, and rate case compliance." },
    { layer: 2, name: "Workflow Execution", vendors: "Oracle Utilities, SAP IS-U, Itron, ServiceNow", note: "Service start/stop/transfer, outage management, field dispatch, payment arrangement, and energy efficiency program enrollment workflows." },
    { layer: 1, name: "Data Access", vendors: "Oracle CC&B, SAP IS-U, Itron, Salesforce Energy", note: "CIS (customer information system), OMS (outage management), MDMS (meter data), GIS (network mapping), and field service management." },
  ];
  const benchmarks = [
    { metric: "CSAT", utl: "[[utl.bench.csat.utl]]", cross: "[[utl.bench.csat.cross]]", note: "Moves with outage communication and with bill increases customers cannot control" },
    { metric: "FCR", utl: "[[utl.bench.fcr.utl]]", cross: "[[utl.bench.fcr.cross]]", note: "Outages and field work often need a follow-up the agent cannot close on the call" },
    { metric: "AHT", utl: "[[utl.bench.aht.utl]]", cross: "[[utl.bench.aht.cross]]", note: "Bill explanations and payment difficulty conversations run long; outage reports are short" },
    { metric: "Abandon Rate", utl: "[[utl.bench.abandon.utl]]", cross: "[[utl.bench.abandon.cross]]", note: "Driven by staffing against storm and high-bill peaks" },
    { metric: "Attrition", utl: "[[utl.bench.attrition.utl]]", cross: "[[utl.bench.attrition.cross]]", note: "Moves with pay, schedule stability and the strain of storm and collections work" },
    { metric: "Storm Volume", utl: "[[utl.bench.storm.utl]]", cross: "Not applicable", note: "Set by storm size, outage duration and how well proactive notifications answer the question before customers call" },
  ];
  return (
    <IndustryPage
      slug="utilities"
      name="Utilities & Energy"
      intro={"Outages, billing complexity, field service coordination, payment difficulty, and storm response define utility CX. U.S. electricity customers averaged [[utl.eia.hours]] without power in 2024, most of it from major storms, so utility contact centers must prepare for crisis while delivering on everyday service. This is the vertical-specific intelligence layer for electric, gas, water, municipal, renewable, and competitive energy."}
      stats={stats}
      segments={{ title: "Six distinct utility service models.", intro: "A large investor-owned electric utility and a small municipal water utility have fundamentally different regulatory, operational, and CX requirements. Monopoly vs competitive, regulated vs market-driven, storm-exposed vs weather-independent.", items: subVerticals }}
      failures={{ title: "Five failure modes unique to utilities CX.", items: failureModes }}
      stack={{ title: "Seven orchestration layers, mapped for utilities.", intro: "Layer 1 (Data Access) carries disproportionate weight because utility CX depends on real-time operational data, outage status, meter readings, field crew location, that lives in OMS, MDMS, and GIS systems the contact center rarely integrates deeply with.", items: stackLayers }}
      benchmarks={{ title: "How utilities compare.", intro: "The one published utilities figure is SQM Group's first contact resolution for energy call centers, close to its all-industry average. No free public source reports the other metrics for utility contact centers; measure yours with the linked tools. Each all-industry figure is labelled with what it measures.", columns: ["Utilities", "All industries"], keys: ["utl", "cross"], rows: benchmarks,
        links: [["/tools/cost-per-contact", "Price your own cost per contact"], ["/tools/forecast-accuracy", "Check your storm forecast accuracy"]] }}
      bpo={{ title: "How outsourcing fits in utility CX.", value: ["Storm overflow: surge capacity for outage reporting and status during weather events","After-hours service for outage reporting and emergency gas leak calls","Payment arrangement processing and collections outreach","Move/start/stop service transactions: high volume, scriptable","Energy efficiency program enrollment and appointment scheduling"], risk: ["Gas leak and safety-related calls require utility-controlled protocols and dispatch authority","Disconnection and reconnection decisions involve PUC regulations BPO agents may not know","Payment difficulty conversations require social services knowledge and program eligibility assessment","High-bill complaints during rate increases carry political and regulatory sensitivity","Field dispatch coordination requires OMS access that BPO contracts often leave out"] }}
      vendors={{ title: "CCaaS platforms often evaluated for utilities.", items: [{ name: "Genesys", href: "/vendors/genesys" }, { name: "NICE CXone", href: "/vendors/nice-cxone" }, { name: "Cisco", href: "/vendors/cisco" }, { name: "Avaya", href: "/vendors" }, { name: "Amazon Connect", href: "/vendors/amazon-connect" }, { name: "Five9", href: "/vendors/five9" }] }}
      sources={{ ids: claimIds([HERO_TOKENS, stats, failureModes, benchmarks]), note: "Every figure on this page is a published figure checked on the publisher's own page, a labelled planning assumption you can test with your own numbers, a worked example, or marked as having no public benchmark." }}
      cta={{ title: "Evaluating CX technology for utilities?", text: "OMS integration, storm routing, PUC compliance, and CIS connectivity change which platforms are viable. We can help you build a shortlist weighted for your utility type: IOU, municipal, co-op, or competitive retail.",
        links: [["/contact", "Request a Utilities CX Briefing"], ["/tools/cx-maturity", "Take the CX Maturity Assessment"]] }}
    />
  );
}
