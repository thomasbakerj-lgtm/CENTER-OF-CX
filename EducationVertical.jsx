import IndustryPage from "./src/lib/IndustryPage.jsx";
import { claimIds, claim } from "./src/lib/claims.js";

/* Education industry page: the content, as data. IndustryPage renders it (redesign Phase 8 part 2); every claim token still
   renders through ClaimText and is listed once through ClaimSources. */
export default function EducationVertical() {
  const subVerticals = [
    { name: "Undergraduate Admissions & Enrollment", slug: "undergrad-admissions", desc: "Inquiry management, application support, yield campaigns, and enrollment onboarding. Every interaction is a recruitment moment: the contact center is the first human impression.", contact: "High seasonal volume, deadline-driven" },
    { name: "Graduate & Professional Programs", slug: "graduate-programs", desc: "Program inquiries, application guidance, cohort management, and career-focused advising. Higher-touch, higher-stakes recruitment with longer decision cycles.", contact: "Moderate volume, relationship-intensive" },
    { name: "Financial Aid & Student Accounts", slug: "financial-aid", desc: "FAFSA support, aid packaging, billing inquiries, payment plans, and 1098-T. Among the most emotionally charged interactions in education, because money determines access.", contact: "Very high volume, FAFSA-cycle surges" },
    { name: "Student Services & Campus Life", slug: "student-services", desc: "Housing, dining, health services, accessibility, counseling referrals, and Title IX. Support across the full student lifecycle from move-in to graduation.", contact: "Steady volume, broad service scope" },
    { name: "IT Help Desk & Learning Technology", slug: "it-helpdesk", desc: "LMS support, WiFi, account access, device troubleshooting, and classroom technology. Critical during first week of classes and exam periods.", contact: "Surge at semester start and exam periods" },
    { name: "Online & Continuing Education", slug: "online-education", desc: "Enrollment, technical support, proctor scheduling, credential verification, and corporate partnership management. Adult learners at a distance, where retention is the central challenge.", contact: "Growing volume, churn-sensitive" },
  ];
  /* Verified statistics only (TB, S23): each names its primary publisher, linked where checked on the publisher's own page. Aggregator, vendor-blog
     and uncited figures were removed. */
  const stats = [
    { id: "edu.nsc.enroll", label: "Postsecondary enrollments in the US, fall 2025" },
    { id: "edu.nsc.persist", label: "Fall 2024 college starters still enrolled a year later, at any institution" },
    { id: "edu.nsc.retain", label: "Fall 2024 college starters still at their starting institution a year later" },
  ].map((s) => { const c = claim(s.id); return { ...s, n: c.value, source: `${c.source.publisher}, ${c.source.year}`, url: c.source.url }; });
  const HERO = "Admissions, enrollment, financial aid, student services, IT support, and lifecycle communications make education depend on the contact center at every stage. Of students who started college in fall 2024, [[edu.nsc.retain]] were back at the same institution a year later. Every service contact along the way, from the first inquiry to the aid office to the help desk, is part of that record.";
  const failureModes = [
    { title: "Financial aid confusion stops enrollment", desc: "A prospective student who cannot understand their aid offer, cannot reach someone to explain it, or hears different answers from financial aid and billing may choose another institution. The redesigned FAFSA added new terms and a new timeline that families and aid offices are still learning." },
    { title: "Siloed departments create a runaround that students can't navigate", desc: "A student with a registration hold needs to call financial aid (to clear a balance), student accounts (to set up a payment plan), the registrar (to lift the hold), and advising (to register for classes). Each office has its own phone number and its own queue. The student sees one university; the university operates as disconnected offices." },
    { title: "Seasonal surges overwhelm capacity at the moments that matter most", desc: "Admissions yield season, FAFSA processing, fall registration, housing selection, and first-week-of-classes IT support all create surges of [[edu.surge]] normal volume. These are the moments when the student's impression is formed, and they're the moments when wait times are longest." },
    { title: "Consumer service habits meet office-hours service", desc: "Students used to instant order confirmation, live delivery tracking and round-the-clock chat from their bank bring the same expectations to their university. Many offices still answer only during weekday business hours, run phone trees nobody has revisited in years, and promise email replies within several business days." },
    { title: "Retention signals are visible in service data but nobody connects them", desc: "A student who keeps calling IT support about LMS problems, returns to financial aid about a balance, and stops coming to office hours is showing disengagement, but no one sees these contacts together. The retention team often learns of it only after the student has left." },
  ];
  const stackLayers = [
    { layer: 7, name: "Analytics & Governance", vendors: "NICE, Qualtrics, EAB, Salesforce", note: "Enrollment yield analytics, retention risk correlation with service interactions, CSAT by service area, and seasonal volume forecasting." },
    { layer: 6, name: "Routing & Orchestration", vendors: "Genesys, NICE CXone, Five9, 8x8", note: "Department-based routing, yield campaign routing for admitted students, financial aid priority during FAFSA cycles, and IT surge routing." },
    { layer: 5, name: "Conversation Management", vendors: "Salesforce, Slate, EAB, Ada, LivePerson", note: "Admissions CRM communication, proactive financial aid notifications, student portal, chatbot for FAQ, and lifecycle messaging." },
    { layer: 4, name: "Reasoning & Planning", vendors: "Ada, Ocelot (Anthology), Ivy.ai, Google CCAI", note: "Application status bots, financial aid FAQ, registration help, IT troubleshooting, and campus services information." },
    { layer: 3, name: "Policy & Guardrails", vendors: "FERPA compliance, Title IX, ADA/Section 504", note: "FERPA student privacy, Title IX reporting protocols, ADA/504 accessibility, Clery Act safety, and GLBA financial data protection." },
    { layer: 2, name: "Workflow Execution", vendors: "Ellucian, Workday Student, Salesforce Education", note: "Admissions funnel, financial aid packaging, registration, housing assignment, and student case management workflows." },
    { layer: 1, name: "Data Access", vendors: "Ellucian Banner/Colleague, Workday, PeopleSoft, Slate, Salesforce", note: "SIS (Student Information System), admissions CRM, financial aid system, LMS (Canvas/Blackboard), and housing management." },
  ];
  const benchmarks = [
    { metric: "CSAT", avg: "[[edu.bench.csat.edu]]", cross: "[[edu.bench.csat.cross]]", note: "Moves with handoffs between separate offices and with staffing in peak weeks" },
    { metric: "FCR", avg: "[[edu.bench.fcr.edu]]", cross: "[[edu.bench.fcr.cross]]", note: "Issues that span financial aid, student accounts and the registrar stand in the way of single-contact resolution" },
    { metric: "AHT", avg: "[[edu.bench.aht.edu]]", cross: "[[edu.bench.aht.cross]]", note: "An average hides the spread: quick deadline questions sit beside long aid and billing calls" },
    { metric: "Abandonment", avg: "[[edu.bench.abandon.edu]]", cross: "[[edu.bench.abandon.cross]]", note: "Driven by staffing against FAFSA, registration and term-start peaks" },
    { metric: "Attrition", avg: "[[edu.bench.attrition.edu]]", cross: "[[edu.bench.attrition.cross]]", note: "Seasonal staff and student workers turn over by design; measure permanent staff separately" },
  ];
  return (
    <IndustryPage
      slug="education"
      name="Education"
      intro={HERO}
      stats={stats}
      segments={{ title: "Six distinct education service models.", intro: "A large undergraduate admissions office and an online program serving working adults need different things from a contact center: one recruits, the other retains; one serves recent high school graduates on campus, the other serves adults who may never set foot there.", items: subVerticals }}
      failures={{ title: "Five failure modes unique to education CX.", items: failureModes }}
      stack={{ title: "Seven orchestration layers, mapped for education.", intro: "Layer 3 (Policy & Guardrails) carries extra weight because FERPA governs who may see a student's records and what may be disclosed, and to whom. A disclosure to the wrong person is a compliance failure and a breach of the trust students place in the institution.", items: stackLayers }}
      benchmarks={{ title: "How education compares.", intro: "No free public source reports contact center metrics for colleges and universities, and SQM Group's industry breakouts do not include education. Measure yours with the linked tools. Each all-industry figure is labelled with what it measures. The published education figures are enrollment and persistence, shown above.", columns: ["Education", "All industries"], keys: ["avg", "cross"], rows: benchmarks }}
      vendors={{ title: "CCaaS platforms often evaluated for education.", items: [{ name: "Genesys", href: "/vendors/genesys" }, { name: "NICE CXone", href: "/vendors/nice-cxone" }, { name: "Five9", href: "/vendors/five9" }, { name: "8x8", href: "/vendors" }, { name: "Amazon Connect", href: "/vendors/amazon-connect" }, { name: "Ocelot (Anthology)", href: "/vendors", label: "Education-specific" }] }}
      sources={{ ids: claimIds([HERO, stats.map((s) => `[[${s.id}]]`), benchmarks, failureModes]), note: "Every figure on this page is a published figure checked on the publisher's own page, a labelled planning assumption you can test with your own numbers, or marked as having no public benchmark." }}
      cta={{ title: "Evaluating CX technology for education?", text: "SIS integration, FERPA compliance, seasonal staffing, and multi-department routing change which platforms are viable. We can help you build a shortlist weighted for your institution type: research university, community college, or online program.",
        links: [["/contact", "Request an Education CX Briefing"], ["/tools/cx-maturity", "Take the CX Maturity Assessment"]] }}
    />
  );
}
