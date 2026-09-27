import IndustryPage from "./src/lib/IndustryPage.jsx";
import { claimIds } from "./src/lib/claims.js";

/* Travel industry page: the content, as data. IndustryPage renders it (redesign Phase 8 part 2); every claim token still
   renders through ClaimText and is listed once through ClaimSources. */
export default function TravelVertical() {

  const subVerticals = [
    { name: "Airlines", slug: "airlines", desc: "Booking changes, cancellations, disruption management, loyalty programs, and baggage. Time pressure and emotion run high when plans break.", contact: "Extreme peak volume during disruptions" },
    { name: "Hotels & Resorts", slug: "hotels-resorts", desc: "Reservations, modifications, loyalty tiers, pre-arrival requests, and post-stay resolution. Personalization and recognition drive loyalty.", contact: "Moderate volume, high personalization expectation" },
    { name: "Online Travel Agencies", slug: "otas", desc: "Multi-supplier booking support, price disputes, cancellation policies, and trip coordination. The intermediary absorbs friction from every supplier.", contact: "Very high volume, multi-supplier complexity" },
    { name: "Car Rental & Ground Transport", slug: "car-rental", desc: "Reservations, vehicle issues, roadside assistance, damage disputes, and loyalty programs. Real-time operational support during the rental.", contact: "Moderate volume, real-time urgency" },
    { name: "Cruise Lines", slug: "cruise-lines", desc: "Booking, shore excursions, onboard services, health protocols, and itinerary changes. Long planning cycles with high emotional investment.", contact: "Seasonal volume, high-value bookings" },
    { name: "Tours & Experiences", slug: "tours-experiences", desc: "Activity booking, schedule changes, group coordination, weather cancellations, and local guide communication. Real-time support in unfamiliar destinations.", contact: "Time-zone spanning, multilingual" },
  ];

  /* Verified statistics only (TB, S23): each is a fact claim checked on the publisher's own page (src/lib/claims/trv.js). Aggregator, vendor-blog
     and uncited figures were removed. Research pass 2026-09-25: the rules that set travel contact center clocks. */
  const stats = [
    { n: "[[trv.dot.refund.card]]", label: "US deadline to refund an airline fare paid by card, once the refund is due", source: "US DOT, 14 CFR 260.2 (eCFR)" },
    { n: "[[trv.dot.sigchange]]", label: "Schedule change that gives a US passenger the right to decline and take a refund", source: "US DOT, 14 CFR 260.2 (eCFR)" },
    { n: "[[trv.eu261.comp]]", label: "EU261 cancellation and denied boarding compensation per passenger, by distance", source: "EUR-Lex, Regulation (EC) 261/2004, Article 7" },
  ];

  const failureModes = [
    { title: "Disruption volume overwhelms capacity within minutes", desc: "A single cancelled flight puts a planeload of passengers in the queue at once. A weather event at a hub airport multiplies that across every flight. Without surge protocols, automated rebooking, and proactive notifications, the contact center collapses under volume while passengers sit at gates with no information." },
    { title: "Loyalty status is invisible during the interaction that matters most", desc: "An elite-status traveler calling during a disruption waits in the same queue as a first-time booker. The agent who finally answers doesn't see the loyalty tier, lifetime value, or past preferences until they pull up the account, by which point the traveler is already frustrated by the wait." },
    { title: "Multilingual support is essential but undertreated", desc: "Travel is inherently global. A Japanese tourist stranded in Chicago, a Brazilian family rebooking from London, a German business traveler in Singapore, all need support in their language during high-stress moments. Many travel brands cover English and one or two other languages, well short of the languages their travelers speak." },
    { title: "Policy complexity creates agent paralysis", desc: "Cancellation policies vary by fare class, booking channel, loyalty status, and destination regulations. An agent who can't quickly determine whether a rebooking fee applies, whether a refund is owed, or whether EU261 compensation ([[trv.eu261.comp]]) is due will default to 'let me check and call you back', which during a disruption only adds to the queue." },
    { title: "Post-trip resolution is disconnected from the travel experience", desc: "A guest who had a terrible hotel experience files a complaint after returning home. The complaint reaches a team that wasn't involved in the stay, can't access the hotel's operational data, and responds with a generic apology and a small credit. The resolution feels impersonal because it is." },
  ];

  const stackLayers = [
    { layer: 7, name: "Analytics & Governance", vendors: "NICE Nexidia, Medallia, Qualtrics, ReviewPro", note: "Post-trip NPS, disruption recovery CSAT, loyalty tier satisfaction segmentation, and social review sentiment. Analytics must connect operational events to CX outcomes." },
    { layer: 6, name: "Routing & Orchestration", vendors: "Genesys, NICE CXone, Five9, Talkdesk", note: "Loyalty-tier routing, disruption surge protocols, multilingual routing, and channel-aware routing (messaging for simple, voice for disruptions)." },
    { layer: 5, name: "Conversation Management", vendors: "LivePerson, Sprinklr, Ada, Glia", note: "Messaging for modifications and status. Proactive disruption notifications. Social media management for real-time travel complaints. Multilingual chat and voice." },
    { layer: 4, name: "Reasoning & Planning", vendors: "Amelia, Cognigy, Ada, Google CCAI", note: "Booking management bots, flight/room status bots, disruption rebooking AI, loyalty point redemption, and FAQ across languages." },
    { layer: 3, name: "Policy & Guardrails", vendors: "Custom policy engines, payment compliance", note: "EU261 compensation and DOT refund rules, PCI compliance, loyalty program terms, cancellation policy enforcement, and data privacy (GDPR for EU travelers)." },
    { layer: 2, name: "Workflow Execution", vendors: "Amadeus, Sabre, Oracle Hospitality, Salesforce", note: "Rebooking workflows, compensation processing, loyalty adjustments, group booking coordination, and multi-supplier itinerary management." },
    { layer: 1, name: "Data Access", vendors: "Amadeus, Sabre, Oracle OPERA, Salesforce", note: "GDS/PSS for airlines, PMS for hotels, OTA booking platforms, loyalty databases, and real-time operational data (flight status, room inventory)." },
  ];

  const benchmarks = [
    { metric: "CSAT", trv: "[[trv.bench.csat.trv]]", cross: "[[trv.bench.csat.cross]]", note: "Moves with disruptions and policy friction as much as with agent quality" },
    { metric: "FCR", trv: "[[trv.bench.fcr.trv]]", cross: "[[trv.bench.fcr.cross]]", note: "Multi-supplier bookings and disruption rebooking often need follow-up" },
    { metric: "AHT", trv: "[[trv.bench.aht.trv]]", cross: "[[trv.bench.aht.cross]]", note: "Rebooking, loyalty lookups, and fare and policy checks drive handle time" },
    { metric: "Abandon Rate", trv: "[[trv.bench.abandon.trv]]", cross: "[[trv.bench.abandon.cross]]", note: "Driven by disruption volume spikes against the staff on shift" },
    { metric: "Attrition", trv: "[[trv.bench.attrition.trv]]", cross: "[[trv.bench.attrition.cross]]", note: "Irregular hours, language requirements, and emotional interactions are the drivers to watch" },
    { metric: "Digital Adoption", trv: "[[trv.bench.digital.trv]]", cross: "[[trv.bench.digital.cross]]", note: "Travelers use self-service for status and simple changes when it works" },
  ];

  return (
    <IndustryPage
      slug="travel"
      name="Travel & Hospitality"
      intro={"Disruptions, reservations, loyalty, itinerary changes, and real-time journey support put the contact center at the center of travel CX. When plans break, the contact center is often what decides whether a frustrated traveler becomes a lost customer. This is the vertical-specific intelligence layer for airlines, hotels, OTAs, and hospitality operations."}
      stats={stats}
      segments={{ title: "Six distinct travel service models.", intro: "An airline managing irregular operations across a hub and a boutique hotel handling concierge requests have fundamentally different CX requirements. The urgency, complexity, and emotional stakes vary dramatically across sub-verticals.", items: subVerticals }}
      failures={{ title: "Five failure modes unique to travel CX.", items: failureModes }}
      stack={{ title: "Seven orchestration layers, mapped for travel.", intro: "Layer 6 (Routing & Orchestration) carries extra weight because travel CX is judged on disruption response. Whether a carrier rebooks you automatically or leaves you on hold for hours is a routing and orchestration decision, made before a human ever picks up the phone.", items: stackLayers }}
      benchmarks={{ title: "How travel compares.", intro: "No free public source reports contact center metrics for travel or hospitality; SQM Group's industry breakouts carry no travel segment. Measure yours with the linked tools. Each all-industry figure is SQM Group's own, labelled with what it measures. The published travel figures are regulatory: the US refund rule and EU261, above.", columns: ["Travel & Hospitality", "All industries"], keys: ["trv", "cross"], rows: benchmarks,
        links: [["/tools/staffing-calculator", "Staff for your own disruption peaks"], ["/tools/cost-per-contact", "Price your own cost per contact"]] }}
      bpo={{ title: "How outsourcing fits in travel CX.", value: ["After-hours and overflow coverage for routine booking modifications","Multilingual support: BPOs in Manila, Cairo, and Bogotá provide language breadth","Post-trip surveys and feedback collection","Loyalty program inquiries and point redemption","Seasonal scaling for peak booking periods"], risk: ["Disruption management requires real-time system access and rebooking authority most BPOs lack","Elite loyalty tier interactions demand brand knowledge and service instinct that's hard to outsource","Complex itinerary changes spanning multiple suppliers need deep GDS/booking system expertise","EU261 compensation and DOT refund decisions require regulatory knowledge and judgment","Brand voice consistency degrades when multiple BPO partners serve the same customer base"] }}
      vendors={{ title: "CCaaS platforms often evaluated for travel.", items: [{ name: "Genesys", href: "/vendors/genesys" }, { name: "NICE CXone", href: "/vendors/nice-cxone" }, { name: "Five9", href: "/vendors/five9" }, { name: "Talkdesk", href: "/vendors/talkdesk" }, { name: "Amazon Connect", href: "/vendors/amazon-connect" }, { name: "Sprinklr", href: "/vendors", label: "Adjacent" }] }}
      sources={{ ids: claimIds([stats, benchmarks, failureModes]), note: "Every figure on this page is a published figure checked on the publisher's own page, a labelled planning assumption you can test with your own numbers, or marked as having no public benchmark." }}
      cta={{ title: "Evaluating CX technology for travel?", text: "Disruption routing, multilingual support, and GDS integration change which platforms are viable. We can help you build a shortlist weighted for your sub-vertical: airlines, hotels, OTAs, or cruise lines.",
        links: [["/contact", "Request a Travel CX Briefing"], ["/tools/cx-maturity", "Take the CX Maturity Assessment"]] }}
    />
  );
}
