import IndustryPage from "./src/lib/IndustryPage.jsx";
import { claimIds } from "./src/lib/claims.js";

/* Insurance industry page: the content, as data. IndustryPage renders it (redesign Phase 8 part 2); every claim token
   still renders through ClaimText and is listed once through ClaimSources. */
export default function InsuranceVertical() {
  const subVerticals = [
    { name: "Personal Lines P&C", slug: "personal-lines", desc: "Auto, home, renters, and umbrella. High volume, FNOL urgency, catastrophe surges, and retention battles. Many calls come right after a loss.", contact: "High volume, catastrophe-driven spikes" },
    { name: "Commercial Lines", slug: "commercial-lines", desc: "Business insurance, general liability, commercial property, and fleet. B2B relationships with agents and brokers alongside direct policyholders.", contact: "Lower volume, higher complexity per interaction" },
    { name: "Life Insurance & Annuities", slug: "life-annuities", desc: "Policy servicing, beneficiary changes, premium payments, surrenders, and death claim processing. Long-duration relationships with high emotional stakes.", contact: "Low volume, very high sensitivity" },
    { name: "Workers' Compensation", slug: "workers-comp", desc: "Injury reporting, claims management, return-to-work coordination, and employer/employee dual-audience support. Medical and legal complexity in every claim.", contact: "Moderate volume, multi-party coordination" },
    { name: "Specialty & Surplus Lines", slug: "specialty-lines", desc: "Cyber, E&O, D&O, marine, aviation, and excess. Sophisticated policyholders, complex coverage, and broker-driven distribution.", contact: "Low volume, expert-level interactions" },
    { name: "Insurtech & Digital Carriers", slug: "insurtech", desc: "Digital-first insurance with app-native service, instant quoting, and AI-driven claims. Speed and transparency define the brand promise.", contact: "Growing volume, digital-first channels" },
  ];

  /* Verified statistics only (TB, S23): each names its primary publisher, linked where checked on the publisher's own page. Aggregator, vendor-blog
     and uncited figures were removed. */
  const stats = [
    { n: "[[ins.natcat.2025]]", label: "Insured natural catastrophe losses worldwide, 2025" },
    { n: "[[ins.bench.fcr.ins]]", label: "First contact resolution, insurance call centers, average" },
  ];

  const HERO = "Claims, policy servicing, renewals and first notice of loss define insurance CX. Insurers covered about [[ins.natcat.2025]] of natural catastrophe losses worldwide in 2025, and each of those events arrives at the contact center as a surge of distressed callers. This page covers the contact center decisions that differ in P&C, life, commercial, workers' comp, specialty lines and insurtech.";

  const failureModes = [
    { title: "FNOL is the moment of truth, and many carriers treat it as a form", desc: "First notice of loss is when the policyholder is most shaken and paying the closest attention. A slow, confusing or impersonal intake sets the tone for the whole claim. A carrier that runs FNOL purely as data capture misses the one conversation where the policyholder decides whether the insurer is on their side." },
    { title: "Catastrophe events expose every capacity and process weakness", desc: "When a hurricane, wildfire or hail storm hits, claim calls can run at [[ins.cat.surge]] a normal week within days. Carriers without a catastrophe plan (surge staffing, geo-targeted IVR messages, proactive outreach, a shorter FNOL path) fall behind while policyholders sit in long hold queues." },
    { title: "The agent channel creates a three-party service problem", desc: "Many policyholders are served by independent agents who sit between the carrier and the customer. When a policyholder calls the carrier directly, the agent isn't informed. When they call the agent, the carrier has no record. This creates duplicate work, conflicting information, and frustrated policyholders." },
    { title: "Claims cycle time shapes satisfaction as much as the settlement", desc: "Policyholders can live with a fair outcome. What wears on them is a gap between the timeline they expected and the one they get, such as [[ins.ex.cycle-gap]]. Set expectations at first notice of loss and report against them." },
    { title: "Renewal is treated as a billing event instead of a retention moment", desc: "Many carriers send a renewal notice a few weeks before expiration showing the new premium. If the premium rose, the policyholder shops. The contact center then takes the cancellation call with no save offer, no view of the competing quote and no authority to adjust the price." },
  ];

  const stackLayers = [
    { layer: 7, name: "Analytics & Governance", vendors: "NICE Nexidia, Verint, Medallia, Qualtrics", note: "Claims cycle time analytics, FNOL quality scoring, CAT response performance, agent/broker satisfaction, and E&O risk monitoring." },
    { layer: 6, name: "Routing & Orchestration", vendors: "Genesys, NICE CXone, Talkdesk Insurance", note: "FNOL priority routing, CAT surge protocols, line-of-business routing, licensed agent matching, and retention-skilled routing." },
    { layer: 5, name: "Conversation Management", vendors: "Hi Marley, Glia, LivePerson, Sprinklr", note: "Claims status messaging, document collection, damage photo upload, proactive notifications, and agent/broker portal communication." },
    { layer: 4, name: "Reasoning & Planning", vendors: "Cognigy, Kore.ai, Shift Technology AI", note: "FNOL intake bots, claims status, policy lookup, billing automation, and renewal comparison. Peril-specific data collection." },
    { layer: 3, name: "Policy & Guardrails", vendors: "Shift Technology, Verisk, SAS, NICE Actimize", note: "State DOI compliance, unfair claims practices monitoring, fraud detection, recorded statement protocols, and E&O controls." },
    { layer: 2, name: "Workflow Execution", vendors: "Guidewire, Duck Creek, Majesco, Pega", note: "FNOL, claims assignment, subrogation, policy endorsement, renewal retention, and CAT response workflows." },
    { layer: 1, name: "Data Access", vendors: "Guidewire, Duck Creek, Sapiens, Salesforce FSC", note: "Policy admin, claims management, billing, agent/broker portal, document management, and actuarial data integration." },
  ];

  const benchmarks = [
    { metric: "CSAT", ins: "[[ins.bench.csat.ins]]", cross: "[[ins.bench.csat.cross]]", note: "Moves with claims communication and delays" },
    { metric: "FCR", ins: "[[ins.bench.fcr.ins]]", cross: "[[ins.bench.fcr.cross]]", note: "Claims that need an adjuster, a document or a third party stand in the way of single-contact resolution" },
    { metric: "AHT", ins: "[[ins.bench.aht.ins]]", cross: "[[ins.bench.aht.cross]]", note: "Coverage discussions and claim intake run long; billing and ID card requests run short" },
    { metric: "Claims Cycle", ins: "[[ins.bench.cycle.ins]]", cross: "Not applicable", note: "Varies by line and peril: glass claims close fast, fire and liability claims take far longer" },
    { metric: "Attrition", ins: "[[ins.bench.attrition.ins]]", cross: "[[ins.bench.attrition.cross]]", note: "Driven by emotional load in claims work, licensing requirements and pay" },
    { metric: "Containment", ins: "[[ins.bench.containment.ins]]", cross: "[[ins.bench.containment.cross]]", note: "Limited by coverage complexity and the emotional stakes of a claim; billing and ID cards automate well" },
  ];

  return (
    <IndustryPage
      slug="insurance"
      name="Insurance"
      intro={HERO}
      stats={stats}
      segments={{ title: "Six distinct insurance service models.", intro: "A personal auto carrier taking hundreds of thousands of first notice calls a year and a cyber insurer serving a few thousand enterprise policyholders need different contact centers. Distribution, claims complexity and regulation all differ.", items: subVerticals }}
      failures={{ title: "Five failure modes unique to insurance CX.", items: failureModes }}
      stack={{ title: "Seven orchestration layers, mapped for insurance.", intro: "Layer 3 (Policy & Guardrails) carries extra weight in insurance because claims handling deadlines, disclosure rules and unfair practices definitions are set state by state. A compliance failure here is a regulatory finding, and good satisfaction scores do not undo it.", items: stackLayers }}
      benchmarks={{ title: "How insurance compares.", intro: "SQM Group publishes insurance call center figures for first contact resolution and customer satisfaction, each close to its all-industry figure. No free public source reports handle time, attrition, containment or one claims cycle time for insurance; measure yours with the linked tools. Each figure is labelled with what it measures.", columns: ["Insurance", "All Industries"], keys: ["ins", "cross"], rows: benchmarks,
        links: [["/tools/cost-per-contact", "Price your own cost per contact"], ["/tools/tco-calculator", "Model your insurance TCO"]] }}
      bpo={{ title: "How outsourcing fits in insurance CX.", value: ["FNOL intake for high-volume personal lines during CAT events","Policy servicing: endorsements, certificates, and billing inquiries","Claims status callbacks and proactive claim milestone notifications","After-hours and weekend FNOL coverage for 24/7 reporting","Outbound renewal reminder campaigns and payment collections"], risk: ["Coverage determinations require licensed adjusters: BPO agents cannot make coverage decisions","Complex claims handling (liability disputes, bodily injury) requires institutional judgment","State DOI compliance varies by jurisdiction: BPO training gaps create regulatory exposure","Recorded statements have legal implications that require carrier-controlled protocols","Agent/broker relationship management needs carrier-level authority and system access"] }}
      vendors={{ items: [{ name: "NICE CXone", href: "/vendors/nice-cxone" }, { name: "Genesys", href: "/vendors/genesys" }, { name: "Talkdesk", href: "/vendors/talkdesk" }, { name: "Five9", href: "/vendors/five9" }, { name: "Amazon Connect", href: "/vendors/amazon-connect" }, { name: "Content Guru", href: "/vendors" }] }}
      sources={{ ids: claimIds([HERO, stats, benchmarks, failureModes]), note: "Every figure on this page is a published figure checked on the publisher's own page, a labelled planning assumption you can test with your own numbers, a worked example, or marked as having no public benchmark." }}
      cta={{ title: "Evaluating CX technology for insurance?", text: "State DOI compliance, claims system integration, and CAT response routing change which platforms are viable. We can help you build a shortlist weighted for your line of business: personal lines, commercial, life, or specialty.",
        links: [["/contact", "Request an Insurance CX Briefing"], ["/tools/cx-maturity", "Take the CX Maturity Assessment"]] }}
    />
  );
}
