import IndustryPage from "./src/lib/IndustryPage.jsx";
import { claimIds } from "./src/lib/claims.js";

/* Government industry page: the content, as data. IndustryPage renders it (redesign Phase 8 part 2); every claim token
   still renders through ClaimText and is listed once through ClaimSources. */
export default function GovernmentVertical() {
  const subVerticals = [
    { name: "Federal Government", slug: "federal", desc: "Agency citizen services, benefits administration, immigration, tax support, and veterans affairs. National scale with FedRAMP security requirements and accessibility mandates.", contact: "Very high volume, diverse populations" },
    { name: "State Government", slug: "state", desc: "DMV, unemployment, Medicaid, licensing, and tax. A broad service portfolio spread across many agencies.", contact: "High volume, peak surges during enrollment periods" },
    { name: "Local & Municipal Government", slug: "local-municipal", desc: "311 services, permits, code enforcement, parks, public works, and elected official constituent services. Community accountability with political visibility.", contact: "Moderate volume, broad service scope" },
    { name: "Courts & Justice", slug: "courts-justice", desc: "Case status, jury duty, fines, filing procedures, and victim services. Legal complexity with accessibility and language access requirements.", contact: "Moderate volume, high sensitivity" },
    { name: "Public Safety & 911", slug: "public-safety", desc: "Emergency dispatch, non-emergency reporting, community outreach, and crisis intervention. Life-safety interactions with zero tolerance for failure.", contact: "24/7, life-critical" },
    { name: "Social Services & Benefits", slug: "social-services", desc: "SNAP, Medicaid, TANF, housing assistance, child protective services, and disability. Vulnerable populations navigating complex eligibility and enrollment.", contact: "High volume, vulnerable callers" },
  ];
  /* Verified statistics only (TB, S23): each names its primary publisher, linked where checked on the publisher's own page. Aggregator, vendor-blog
     and uncited figures were removed. */
  const stats = [
    { n: "[[gov.acsi.federal]]", label: "ACSI citizen satisfaction with federal services, fiscal year 2025, on a scale to 100" },
    { n: "[[gov.bench.fcr.gov]]", label: "First contact resolution, government call centers, SQM Group benchmark" },
    { n: "[[gov.irs.calls]]", label: "Calls taxpayers made to the IRS in 2025" },
    { n: "[[gov.irs.voicebot]]", label: "IRS calls routed to voicebots in 2025" },
  ];
  const failureModes = [
    { title: "Citizens bring private-sector expectations to government", desc: "People use banking apps, online retail and ride-hailing every day, and those services set the bar a benefits portal or an agency phone line is judged against. ACSI's model links citizen satisfaction to trust in government, so a service that falls short costs more than one bad call." },
    { title: "Siloed agencies create siloed citizen experiences", desc: "A family applying for SNAP, Medicaid, and housing assistance interacts with three different agencies, three different systems, and three different eligibility processes, often providing the same documentation three times. The citizen sees one government; the government operates as many disconnected agencies." },
    { title: "Accessibility is a legal obligation", desc: "Section 508 holds federal electronic content to [[gov.508.wcag]]. The ADA Title II rule holds state and local web content and mobile apps to [[gov.ada.wcag]], starting [[gov.ada.date]] for the largest governments. Title VI requires meaningful access for people with limited English. A contact center without TTY or relay access, multilingual service, or accessible self-service carries complaint and legal exposure at every touchpoint." },
    { title: "Legacy systems prevent digital transformation", desc: "Federal and state agencies still run core programs on mainframes, custom case management systems and paper workflows that resist modernization. GAO found the ten federal legacy systems most in need of modernization were [[gov.legacy.age]]. The contact center is often the human bridge between citizens and systems that cannot serve them digitally." },
    { title: "Surge events overwhelm capacity without warning", desc: "A policy change, a benefit deadline, a natural disaster, or a pandemic creates call volumes far beyond normal operations. In spring 2020 weekly initial unemployment claims rose [[gov.ui.surge]] in four weeks. During the Medicaid unwinding, monthly state Medicaid and CHIP call volume went from [[gov.medicaid.volume]] in its first months. Government contact centers cannot scale as fast as a commercial operation because procurement takes months." },
  ];
  const stackLayers = [
    { layer: 7, name: "Analytics & Governance", vendors: "NICE, Verint, Qualtrics, Medallia", note: "Citizen satisfaction (OMB Circular A-11), service level reporting, accessibility compliance monitoring, language access tracking, and congressional/constituent inquiry analytics." },
    { layer: 6, name: "Routing & Orchestration", vendors: "Genesys, NICE CXone, Cisco, Amazon Connect", note: "Multi-agency routing, language-based routing with interpretation, accessibility routing (TTY, video relay), priority routing for veterans and vulnerable populations." },
    { layer: 5, name: "Conversation Management", vendors: "Sprinklr, LivePerson, Ada, Granicus", note: "Citizen portals, multilingual self-service, proactive notifications for benefits and deadlines, 311 reporting with tracking, and accessible digital channels." },
    { layer: 4, name: "Reasoning & Planning", vendors: "Google CCAI, Amazon Lex, Cognigy, Ada", note: "Benefits eligibility bots, case status bots, FAQ across many programs, appointment scheduling, and document requirement guidance." },
    { layer: 3, name: "Policy & Guardrails", vendors: "FedRAMP-certified vendors, Section 508 compliance", note: "FedRAMP (federal), StateRAMP, PII/FISMA compliance, Section 508 accessibility, Title VI language access, and CJIS (criminal justice)." },
    { layer: 2, name: "Workflow Execution", vendors: "Salesforce Government Cloud, ServiceNow, Pega, Appian", note: "Benefits enrollment, case management, permit processing, constituent inquiry tracking, FOIA request management, and inter-agency referral workflows." },
    { layer: 1, name: "Data Access", vendors: "Salesforce Gov Cloud, Oracle, SAP, legacy mainframes", note: "Case management systems, eligibility databases, financial systems, identity verification (Login.gov), and inter-agency data sharing." },
  ];
  const benchmarks = [
    { metric: "CSAT", gov: "[[gov.bench.csat.gov]]", cross: "[[gov.bench.csat.cross]]", note: "Moves with processing times, status updates, and complaint handling. The two figures use different scales" },
    { metric: "FCR", gov: "[[gov.bench.fcr.gov]]", cross: "[[gov.bench.fcr.cross]]", note: "Multi-agency issues, eligibility rules, and system limits stand in the way of single-contact resolution" },
    { metric: "AHT", gov: "[[gov.bench.aht.gov]]", cross: "[[gov.bench.aht.cross]]", note: "Driven by eligibility questions, interpreted calls, and lookups across legacy systems" },
    { metric: "Abandon Rate", gov: "[[gov.bench.abandon.gov]]", cross: "[[gov.bench.abandon.cross]]", note: "Driven by surges from deadlines, renewals, and emergencies that staffing cannot follow" },
    { metric: "Attrition", gov: "[[gov.bench.attrition.gov]]", cross: "[[gov.bench.attrition.cross]]", note: "Driven by pay scales, hiring timelines, and the emotional load of benefits and crisis calls" },
  ];

  return (
    <IndustryPage
      slug="government"
      name="Government"
      intro={"Citizen services, accessibility, multilingual support, case management, and trust define government CX. ACSI scores citizen satisfaction with federal services at [[gov.acsi.federal]] out of 100, and with federal call centers at [[gov.bench.csat.gov]]. This is the vertical-specific intelligence layer for federal, state, local, courts, public safety, and social services."}
      stats={stats}
      segments={{ title: "Six distinct government service models.", intro: "A federal agency serving the whole country and a county 311 center serving one community differ in scale, security requirements, and procurement constraints: FedRAMP against StateRAMP, OMB mandates against local council priorities, long federal procurement cycles against faster local purchasing.", items: subVerticals }}
      failures={{ title: "Five failure modes unique to government CX.", items: failureModes }}
      stack={{ title: "Seven orchestration layers, mapped for government.", intro: "Layer 3 (Policy & Guardrails) carries extra weight because government CX operates under security (FedRAMP, FISMA), accessibility (Section 508, ADA), and equity (Title VI language access) requirements set in law. Every technology choice must pass these gates before functionality is evaluated.", items: stackLayers }}
      benchmarks={{ title: "How government compares.", intro: "Three government figures are published: SQM Group's first contact resolution for its government call centers, close to its all-industry average; ACSI's satisfaction index for federal call centers; and the peak abandonment state Medicaid call centers reported during the unwinding, a surge month. No free public source reports handle time or attrition for government contact centers; measure yours with the linked tools. Each figure is labelled with what it measures.", columns: ["Government", "All Industries"], keys: ["gov", "cross"], rows: benchmarks }}
      vendors={{ items: [{ name: "Genesys", href: "/vendors/genesys" }, { name: "NICE CXone", href: "/vendors/nice-cxone" }, { name: "Amazon Connect", href: "/vendors/amazon-connect" }, { name: "Cisco", href: "/vendors/cisco" }, { name: "Content Guru", href: "/vendors" }, { name: "Five9", href: "/vendors/five9" }] }}
      sources={{ ids: claimIds([stats, benchmarks, failureModes, "[[gov.acsi.federal]] [[gov.bench.csat.gov]]"]), note: "Every figure on this page is a published figure checked on the publisher's own page, or marked as having no public benchmark with a link to the tool that measures yours." }}
      cta={{ title: "Evaluating CX technology for government?", text: "FedRAMP authorization, Section 508 accessibility, multilingual support, and procurement compliance change which platforms are viable. We can help you navigate the unique requirements of government CX technology selection.",
        links: [["/contact", "Request a Government CX Briefing"], ["/tools/cx-maturity", "Take the CX Maturity Assessment"]] }}
    />
  );
}
