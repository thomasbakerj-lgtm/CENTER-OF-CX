/* verticalsContent.js
 *
 * The industry text the category by industry pages render (CategoryVerticalPage.jsx), kept out of verticals.js so the
 * entry chunk, which loads verticals.js on every page, does not carry it. Audit item 7, TB 29 Sep 2026: every figure in
 * `considerations` is a registry claim ([[id]], src/lib/claims.js) and every rule links its publisher. The pre-audit
 * paragraph and chip list are kept as `considerationsDraft` and `complianceDraft` for lineage; they never render.
 * Checked by catvertical.test.mjs.
 */

/* The rules and standards the category by industry pages name (audit item 7, TB 29 Sep 2026: validate and source the
   research on these pages). Each links its publisher's own page. The pre-audit chip lists mixed rules with operating
   requirements ("Seasonal 10x scale", "Multi-currency", "24/7 global coverage", "99.999% availability") and vague
   entries ("FCC compliance", "State insurance regulations"); those are gone. `checked` records how the link was read:
   "read" means the page opened from our network on the date; "refused" means the publisher's site refuses our network
   (a 403), the address is the publisher's own, and it was not re-read. */
export const RULES = {
  pci:      { name: "PCI DSS", kind: "Industry standard", note: "Card data security for anyone who stores, processes or transmits card data", url: "https://www.pcisecuritystandards.org/standards/pci-dss/", checked: "read 2026-09-29" },
  soc2:     { name: "SOC 2", kind: "Attestation report", note: "An auditor's report on a service provider's security controls, often asked of platform vendors", url: "https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2", checked: "read 2026-09-29" },
  ffiec:    { name: "FFIEC guidance", kind: "Supervisory guidance", note: "US bank examiners' IT and authentication guidance", url: "https://www.ffiec.gov/", checked: "refused" },
  glba:     { name: "GLBA Safeguards Rule", kind: "Federal rule", note: "Security program requirements for customer financial information", url: "https://www.ftc.gov/legal-library/browse/rules/safeguards-rule", checked: "read 2026-09-29" },
  finra4511:{ name: "FINRA Rule 4511", kind: "Self-regulatory rule", note: "Books and records for broker-dealers, including communications", url: "https://www.finra.org/rules-guidance/rulebooks/finra-rules/4511", checked: "read 2026-09-29" },
  hipaaBaa: { name: "HIPAA business associate contract", kind: "Federal regulation", note: "45 CFR 164.504(e): a vendor handling protected health information signs one", url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-E/section-164.504", checked: "read 2026-09-29" },
  hitrust:  { name: "HITRUST", kind: "Certification framework", note: "A security certification many health systems ask vendors for", url: "https://hitrustalliance.net/", checked: "read 2026-09-29" },
  ccpa:     { name: "CCPA", kind: "State law", note: "California consumer privacy rights", url: "https://oag.ca.gov/privacy/ccpa", checked: "read 2026-09-29" },
  gdpr:     { name: "GDPR", kind: "EU regulation", note: "Personal data of people in the EU", url: "https://gdpr-info.eu/", checked: "read 2026-09-29 (unofficial consolidated text; the official text is on EUR-Lex, which refuses our network)" },
  cpni:     { name: "FCC CPNI rules", kind: "Federal regulation", note: "47 CFR 64 subpart U: authenticate before disclosing customer network information", url: "https://www.ecfr.gov/current/title-47/chapter-I/subchapter-B/part-64/subpart-U", checked: "read 2026-09-29" },
  naic:     { name: "NAIC model laws", kind: "Model laws adopted state by state", note: "Insurance privacy, data security and claims practices vary by state", url: "https://content.naic.org/model-laws", checked: "refused" },
  fedramp:  { name: "FedRAMP", kind: "Federal authorization program", note: "How federal agencies authorize the cloud services they use", url: "https://www.fedramp.gov/", checked: "read 2026-09-29" },
  govramp:  { name: "GovRAMP (formerly StateRAMP)", kind: "Authorization program", note: "Cloud security verification used by many state and local governments", url: "https://govramp.org/", checked: "read 2026-09-29" },
  itar:     { name: "ITAR", kind: "Federal regulation", note: "22 CFR 120 to 130: export control of defense articles and technical data", url: "https://www.ecfr.gov/current/title-22/chapter-I/subchapter-M", checked: "read 2026-09-29" },
  cjis:     { name: "CJIS Security Policy", kind: "Federal policy", note: "FBI rules for systems that touch criminal justice information", url: "https://le.fbi.gov/cjis-division-resources/cjis-security-policy-resource-center", checked: "refused" },
  dodil:    { name: "DoD cloud impact levels (IL4, IL5)", kind: "Federal security requirements", note: "DoD Cloud Computing Security Requirements Guide levels for controlled unclassified information", url: "https://public.cyber.mil/dccs/", checked: "read 2026-09-29" },
  s508:     { name: "Section 508", kind: "Federal law and standard", note: "Accessible federal electronic content and communications", url: "https://www.section508.gov/", checked: "read 2026-09-29" },
  nerccip:  { name: "NERC CIP", kind: "Reliability standards", note: "Cyber security standards for the bulk electric system", url: "https://www.nerc.com/pa/Stand/Pages/ReliabilityStandards.aspx", checked: "read 2026-09-29" },
  iso27001: { name: "ISO/IEC 27001", kind: "International standard", note: "Information security management systems", url: "https://www.iso.org/standard/27001", checked: "refused" },
  ferpa:    { name: "FERPA", kind: "Federal regulation", note: "34 CFR 99: privacy of student education records", url: "https://www.ecfr.gov/current/title-34/subtitle-A/part-99", checked: "read 2026-09-29" },
  coppa:    { name: "COPPA", kind: "Federal rule", note: "16 CFR 312: online services directed to children under 13", url: "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-312", checked: "read 2026-09-29" },
};


export const VERTICAL_CONTENT = {
  "financial-services": {
    rules: ["pci", "soc2", "ffiec", "glba", "finra4511"],
    considerations: "Identity checks shape the experience: a customer verified in the phone menu should not have to prove who they are again when an agent answers. Voice authentication vendors publish what their products save, for example Pindrop states [[fs.pindrop.aht]] per call, a vendor claim to test in your own pilot. Card payments and disputes need recording that pauses while card details are taken, and error disputes run on regulated clocks: Regulation E gives an institution [[fs.rege.investigate]] to investigate a reported electronic transfer error.",
    considerationsDraft: "Authentication friction is the top CX killer. Average handle times run 20-30% longer than cross-industry because of compliance verification. Payment dispute handling requires PCI-compliant recording with selective pause/resume. Multi-channel identity must be consistent. A customer authenticated on IVR should not re-authenticate when transferred to an agent.",
    complianceDraft: ["PCI DSS Level 1", "SOC 2 Type II", "FFIEC", "GLBA", "FINRA recordkeeping", "Data residency"],
  },
  healthcare: {
    rules: ["hipaaBaa", "hitrust", "soc2"],
    considerations: "HIPAA applies to any call that touches protected health information, and a platform vendor that handles it signs a business associate contract; civil penalties run [[hc.hipaa.penalty]] per violation. The harder work is integration: agents need scheduling, coverage and care details from the EHR without leaving the conversation. Scheduling and referrals are where access is won or lost: in one large US health system, [[hc.referral.closed]] of referral scheduling attempts ended in a completed specialist appointment.",
    considerationsDraft: "HIPAA is table stakes but not sufficient. The real challenge is EHR integration. Agents need real-time access to patient scheduling, medication, and care plan data without switching to the EHR application. Average handle times are the longest of any vertical (7+ minutes) because of clinical complexity. Patient access scheduling and referral management drive 40-50% of contact volume.",
    complianceDraft: ["HIPAA BAA", "HITRUST", "PHI encryption", "Audit trails", "State health privacy"],
  },
  retail: {
    rules: ["pci", "ccpa", "gdpr"],
    considerations: "Peak seasons set the architecture: a platform has to add capacity for holiday and promotion peaks without weeks of provisioning. Returns are a large and predictable share of the work: large US retailers expected [[retail.returns.online]] of online sales to come back in 2025, and [[retail.returns.seasonal]] planned seasonal hiring to handle holiday returns and fraud. Commerce integration decides whether an agent can act on an order inside the conversation or has to switch systems.",
    considerationsDraft: "Seasonal volume spikes define the architecture requirement. Black Friday can drive 8-10x normal volume. Platforms that cannot elastically scale without pre-provisioning fail this vertical. Returns and order status inquiries drive 60-70% of volume and are prime automation candidates. Commerce platform integration (Shopify, commercetools) determines whether agents can action orders directly or need to alt-tab into a separate system.",
    complianceDraft: ["PCI DSS Level 1", "GDPR/CCPA", "Payment tokenization", "Seasonal 10x scale"],
  },
  telecom: {
    rules: ["cpni", "pci", "soc2"],
    considerations: "Telecom centers mix technical troubleshooting, billing disputes and service changes, each needing different skills and system access. Account security is regulated: under the FCC's CPNI rules ([[tel.fcc.cpni]]) a carrier must authenticate a caller before disclosing customer network information. Integration with billing, provisioning and network status systems decides whether an agent can see an order or an outage while the customer is on the line.",
    considerationsDraft: "Telecom contact centers handle the highest complexity-to-volume ratio in any vertical. Technical troubleshooting, billing disputes, and service provisioning each require different agent skills and system access. The carrier-grade availability requirement (99.999%) eliminates many vendors. Integration with BSS/OSS platforms is mandatory for real-time account and network status.",
    complianceDraft: ["FCC compliance", "CPNI protection", "99.999% availability", "Carrier-grade telephony"],
  },
  insurance: {
    rules: ["naic", "pci", "soc2"],
    considerations: "Insurance centers run two tracks: service (policy questions, billing, changes) and claims (first notice of loss, status, settlement), with different clocks and skills. Claim acknowledgment deadlines are set state by state; California, for example, allows [[ins.reg.ca.ack]]. Catastrophes drive claim surges: insured losses from natural disasters worldwide reached [[ins.natcat.2025]] in 2025. Integration with policy administration and claims systems decides whether an agent can quote, change or update a claim inside the conversation.",
    considerationsDraft: "Insurance contact centers operate on two distinct tracks: sales/service (policy inquiries, billing, endorsements) and claims (FNOL, status, adjustments). Each track has different SLAs, compliance requirements, and agent skill profiles. Integration with policy administration systems (Guidewire, Duck Creek) determines whether agents can quote, bind, and endorse in real time versus manual processing. Claims FNOL automation is the highest-ROI self-service use case.",
    complianceDraft: ["State insurance regulations", "SOC 2 Type II", "PCI for premiums", "Claims data protection", "NAIC"],
  },
  travel: {
    rules: ["pci", "gdpr", "ccpa"],
    considerations: "Disruption drives the volume: weather, cancellations and schedule changes arrive together, and refunds run on regulated clocks. In the US an airline owes a card refund within [[trv.dot.refund.card]], and a schedule change counts as significant at [[trv.dot.sigchange]]; in the EU, Regulation 261 sets compensation of [[trv.eu261.comp]] per passenger. Integration with reservation systems (a GDS for airlines, a PMS for hotels) decides whether an agent can rebook and refund without switching applications.",
    considerationsDraft: "Travel contact centers must handle extreme volume volatility: weather events, cancellations, and crises can spike volume 5-20x within hours. The 24/7 global coverage requirement means follow-the-sun routing and multi-language support are mandatory. Integration with GDS (airline) or PMS (hotel) systems determines whether agents can rebook, upgrade, and refund without switching applications. Loyalty tier recognition must influence routing priority.",
    complianceDraft: ["PCI DSS Level 1", "GDPR", "Multi-currency", "24/7 global coverage"],
  },
  government: {
    rules: ["fedramp", "govramp", "s508", "cjis", "itar", "dodil"],
    considerations: "Government centers work under public rules for accessibility and security. Federal electronic content must meet Section 508, which adopts [[gov.508.wcag]]; state and local governments fall under ADA Title II at [[gov.ada.wcag]]. Federal agencies authorize cloud services through FedRAMP, which a vendor can take [[gov.fedramp.time]] to reach. Demand can surge far past normal: weekly unemployment claims rose [[gov.ui.surge]] within four weeks in 2020.",
    considerationsDraft: "Government contact centers operate under the strictest compliance framework of any vertical. FedRAMP authorization is a hard gate for federal agencies. Vendors without it are eliminated regardless of capability. Accessibility (Section 508) is a legal requirement, not a nice-to-have. Multi-channel must include TTY/TDD support. Procurement cycles are 12-24 months and often require GSA schedule pricing.",
    complianceDraft: ["FedRAMP High", "ITAR", "CJIS", "Section 508/WCAG", "StateRAMP", "IL4/IL5"],
  },
  utilities: {
    rules: ["nerccip", "pci", "soc2"],
    considerations: "Utilities run two kinds of work: routine billing, starts and stops, and emergencies such as outages and gas odors, which need their own routing and staffing. Outage load is large and uneven: the average US customer spent [[utl.eia.hours]] without power in 2024, [[utl.eia.major]] of it from major events. For gas odor reports, federal rules require written emergency procedures that provide for a [[utl.gas.phmsa]]. Integration with billing and outage management decides whether an agent sees account, usage and outage status inside the conversation.",
    considerationsDraft: "Utility contact centers handle two fundamentally different workloads: routine (billing, starts/stops, rate inquiries) and emergency (outage reporting, gas leaks, safety). Emergency handling requires dedicated routing, IVR, and staffing protocols that activate automatically based on outage management system data. Integration with CIS (Customer Information System) is mandatory. Agents must see billing, usage, and account history in real time. High-bill season and storm events create predictable volume spikes.",
    complianceDraft: ["NERC CIP", "SOC 2 Type II", "PCI for billing", "Emergency protocols"],
  },
  manufacturing: {
    rules: ["itar", "iso27001", "soc2"],
    considerations: "Manufacturers serve end customers, dealers and distributors, and internal teams, each with different routing, knowledge and system access. Warranty is a large part of the work: US-based public manufacturers paid [[mfg.warranty.claims]] in warranty claims in 2025. Safety recalls run on regulated clocks, with a defect report due to NHTSA within [[mfg.nhtsa.573]], and they can bring sudden call surges. ERP integration decides whether an agent can check orders, warranty and parts inside the conversation.",
    considerationsDraft: "Manufacturing contact centers serve three distinct constituencies: end customers (warranty, support), dealers/distributors (orders, technical), and internal stakeholders (supply chain, logistics). Each constituency requires different routing, knowledge, and system access. ERP integration (SAP, Oracle) is critical for order status, warranty validation, and parts availability. Technical support often requires visual assistance (video, co-browse) for complex equipment troubleshooting.",
    complianceDraft: ["ITAR", "SOC 2 Type II", "ISO 27001", "Supply chain data protection", "Multi-language"],
  },
  education: {
    rules: ["ferpa", "coppa", "s508"],
    considerations: "Education centers are seasonal: admissions, aid deadlines, registration and the first weeks of term concentrate the year's contacts, a planning assumption of [[edu.surge]] a normal week. Financial aid calls carry legal risk: federal rules treat misleading statements about aid as misrepresentation ([[edu.t4.aid]]). FERPA governs student records, and its rights cover anyone who is or has been in attendance ([[edu.ferpa.student]]), so identity checks come before any record is discussed. Integration with the student information system decides whether an agent sees enrollment, aid and records inside the conversation.",
    considerationsDraft: "Education contact centers face extreme seasonality. Enrollment periods drive 3-5x normal volume. Financial aid inquiries are the most complex and highest-volume contact type in higher education. SIS integration (Banner, PeopleSoft, Workday Student) determines whether agents can access enrollment, financial aid, and academic records without switching systems. FERPA compliance is mandatory and prohibits sharing student records without proper authentication.",
    complianceDraft: ["FERPA", "COPPA (K-12)", "SOC 2 Type II", "Section 508/WCAG", "Student data protection"],
  },
};
