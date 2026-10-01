import IndustryPage from "./src/lib/IndustryPage.jsx";
import { claimIds } from "./src/lib/claims.js";

/* Healthcare industry page: the content, as data. IndustryPage renders it (redesign Phase 8 part 2); every claim token still
   renders through ClaimText and is listed once through ClaimSources. */
export default function HealthcareVertical() {
  const subVerticals = [
    { name: "Health Systems & Hospitals", slug: "health-systems", desc: "Patient access, scheduling, billing inquiries, care coordination, and discharge follow-up. High emotional intensity with HIPAA governing every interaction.", contact: "High volume, high sensitivity" },
    { name: "Health Insurance (Payers)", slug: "health-insurance", desc: "Benefits verification, claims status, prior authorization, provider search, and enrollment. Complex multi-step journeys with regulatory language requirements.", contact: "Very high volume, complex policy logic" },
    { name: "Provider Groups & Clinics", slug: "provider-groups", desc: "Appointment scheduling, prescription refills, referral coordination, and billing. Smaller operations but patients expect the same responsiveness as large systems.", contact: "Moderate volume, relationship-intensive" },
    { name: "Digital Health & Telehealth", slug: "digital-health", desc: "Platform support, virtual visit scheduling, technical troubleshooting, and prescription management. Digital-native patients with low tolerance for friction.", contact: "Growing volume, digital-first channels" },
    { name: "Pharmaceutical & Life Sciences", slug: "pharma-life-sciences", desc: "Patient support programs, co-pay assistance, adverse event reporting, and HCP inquiries. Regulatory constraints shape every workflow.", contact: "Specialized volume, strict compliance" },
    { name: "Home Health & Post-Acute", slug: "home-health", desc: "Visit scheduling, caregiver coordination, supply management, and family communication. Vulnerable populations requiring empathy-first design.", contact: "Lower volume, highest emotional stakes" },
  ];

  /* Verified statistics only (TB, S23): each names its primary publisher, linked where checked on the publisher's own page. Aggregator, vendor-blog
     and uncited figures were removed. */
  const stats = [
  ];

  const failureModes = [
    { title: "HIPAA creates handoff friction that patients feel", desc: "Protected health information rules require identity verification at every channel switch. A patient who authenticated on the phone must re-authenticate in chat. Context cannot flow freely across systems without consent and audit trail controls." },
    { title: "Scheduling consumes agent capacity without resolution", desc: "Repeat calls for one scheduling need usually trace to system fragmentation: the scheduling system, EHR, and contact center platform operate independently, forcing agents to navigate multiple screens per booking." },
    { title: "Empathy-intensive interactions accelerate burnout", desc: "Healthcare agents handle calls involving fear, grief, financial stress, and medical uncertainty. Without structured coaching, wellness support, and call-type rotation, that load shows up in turnover." },
    { title: "Prior authorization creates the worst patient journey", desc: "Prior auth workflows involve the patient, provider, payer, and pharmacy, each with different systems, timelines, and information needs. The contact center absorbs the frustration of a process it cannot control." },
    { title: "After-hours coverage creates clinical risk", desc: "Triaging urgent clinical calls outside business hours requires protocols that most generic contact center platforms cannot enforce. Routing a billing question and a symptom-escalation call through the same queue creates patient safety risk." },
  ];

  const stackLayers = [
    { layer: 7, name: "Analytics & Governance", vendors: "NICE Nexidia, Verint, Qualtrics XM, Press Ganey", note: "CAHPS and HCAHPS survey integration. Patient sentiment tracking. Compliance audit trails for every recorded interaction." },
    { layer: 6, name: "Routing & Orchestration", vendors: "NICE CXone, Genesys, Talkdesk Healthcare, Cisco", note: "Clinical vs administrative triage routing. After-hours escalation protocols. Provider callback workflows." },
    { layer: 5, name: "Conversation Management", vendors: "Hyro.ai, LivePerson, Ada, Orbita", note: "Patient-facing AI for scheduling, FAQs, and prescription refills. Secure messaging for clinical follow-up. Portal chat integration." },
    { layer: 4, name: "Reasoning & Planning", vendors: "Nuance DAX, Amelia, Cognigy, Google CCAI", note: "Clinical language understanding. Symptom triage logic. Intent detection for clinical vs administrative queries." },
    { layer: 3, name: "Policy & Guardrails", vendors: "Pindrop, LexisNexis, Imprivata", note: "HIPAA-compliant recording and storage. Patient identity verification. Consent management. PHI redaction in analytics." },
    { layer: 2, name: "Workflow Execution", vendors: "ServiceNow, UiPath, Pega, Workato", note: "Prior authorization automation. Referral coordination workflows. Insurance verification at point of scheduling." },
    { layer: 1, name: "Data Access", vendors: "Epic, Cerner (Oracle Health), athenahealth, Salesforce Health Cloud", note: "EHR integration is the foundation. Agent desktop must surface patient history, appointments, and insurance without PHI exposure risk." },
  ];

  const benchmarks = [
    { metric: "CSAT", hc: "[[hc.bench.csat.hc]]", cross: "[[hc.bench.csat.cross]]", note: "Moves with emotionally charged interactions and process friction" },
    { metric: "FCR", hc: "[[hc.bench.fcr.hc]]", cross: "[[hc.bench.fcr.cross]]", note: "Multi-system scheduling and authorization requirements stand in the way of single-call resolution" },
    { metric: "AHT", hc: "[[hc.bench.aht.hc]]", cross: "[[hc.bench.aht.cross]]", note: "An average hides the spread: simple scheduling calls sit beside long clinical and billing calls" },
    { metric: "Abandon Rate", hc: "[[hc.bench.abandon.hc]]", cross: "[[hc.bench.abandon.cross]]", note: "Driven by staffing gaps at peak hours" },
    { metric: "Attrition", hc: "[[hc.bench.attrition.hc]]", cross: "[[hc.bench.attrition.cross]]", note: "Emotional labor and burnout are the drivers to watch" },
    { metric: "Transfer Rate", hc: "[[hc.bench.transfer.hc]]", cross: "[[hc.bench.transfer.cross]]", note: "Driven by routing gaps between clinical and administrative teams" },
  ];

  return (
    <IndustryPage
      slug="healthcare"
      name="Healthcare"
      intro={"Health system and payer contact centers schedule across specialties, explain bills, handle prior authorization and follow up after discharge. HIPAA governs what can be recorded, automated and shared. This page covers the rules, the published figures and what each layer of the technology stack needs, for health systems, payers, providers and digital health."}
      stats={stats}
      segments={{ title: "Six distinct service models under one vertical.", intro: "A health system contact center managing patient access for 50 hospitals has fundamentally different requirements than a payer handling benefits verification for 3 million members. The technology, compliance, and staffing models diverge completely.", items: subVerticals }}
      failures={{ title: "Five failure modes unique to healthcare CX.", intro: "Healthcare contact centers absorb the friction of fragmented systems, regulatory constraints, and emotionally charged interactions. These are the patterns that generic CX strategies consistently miss.", items: failureModes }}
      stack={{ title: "Seven orchestration layers, mapped for healthcare.", intro: "Layer 1 (Data Access) carries disproportionate weight because EHR integration determines whether agents can resolve issues or merely document them. Without real-time patient data, every other layer underperforms.", items: stackLayers }}
      benchmarks={{ title: "How healthcare compares.", intro: "The one published healthcare figure is SQM Group's first contact resolution for health insurance call centers, close to its all-industry average. No free public source reports the other metrics for healthcare; measure yours with the linked tools. Each all-industry figure is labelled with what it measures.", columns: ["Healthcare", "All industries"], keys: ["hc", "cross"], rows: benchmarks,
        links: [["/tools/cost-per-contact", "Price your own cost per contact"], ["/tools/tco-calculator", "Model your healthcare TCO"]] }}
      bpo={{ title: "How outsourcing fits in healthcare CX.", value: ["Appointment scheduling and confirmation calls", "Insurance verification and eligibility checks", "Patient satisfaction surveys and follow-up", "After-hours triage (with clinical oversight protocols)", "Revenue cycle: billing inquiries and payment collections"], risk: ["Clinical triage requires licensed professionals and institutional protocols", "HIPAA training gaps create compliance exposure, violations cost [[hc.hipaa.penalty]] per violation", "PHI handling across offshore locations introduces data residency complexity", "Care coordination requires EHR access that most BPO contracts underspecify", "Patient empathy in crisis moments (diagnosis, end-of-life) requires institutional depth"] }}
      vendors={{ title: "CCaaS platforms often evaluated for healthcare.", items: [{ name: "NICE CXone", href: "/vendors/nice-cxone" }, { name: "Genesys", href: "/vendors/genesys" }, { name: "Talkdesk", href: "/vendors/talkdesk" }, { name: "Cisco", href: "/vendors/cisco" }, { name: "8x8", href: "/vendors/8x8" }, { name: "Five9", href: "/vendors/five9" }] }}
      sources={{ ids: claimIds([benchmarks, failureModes, "[[hc.hipaa.penalty]]"]), note: "Every figure on this page is a published figure checked on the publisher's own page, a labelled planning assumption you can test with your own numbers, or marked as having no public benchmark." }}
      cta={{ title: "Evaluating CX technology for healthcare?", text: "HIPAA, EHR integration, and clinical triage routing change which platforms are viable. We can help you build a shortlist weighted for your specific sub-vertical: health systems, payers, providers, or digital health.",
        links: [["/contact", "Request a Healthcare Briefing"], ["/tools/cx-maturity", "Take the CX Maturity Assessment"]] }}
    />
  );
}
