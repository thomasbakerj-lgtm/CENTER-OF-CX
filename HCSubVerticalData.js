// Healthcare Sub-Vertical CX Stack Frameworks
// 6 sub-verticals × 7 layers × vendor stacks with "why" and integration pitfalls

export const hcSubVerticals = {
  "health-systems": {
    name: "Health Systems & Hospitals", parent: "Healthcare",
    tagline: "Patient access, scheduling, billing, care coordination, and discharge follow-up.",
    intro: "Health system contact centers are the front door to a complex clinical enterprise. They manage patient access (scheduling across dozens of specialties), billing inquiries (the most confusing bills in any industry), care coordination (referrals, test results, post-discharge follow-up), and urgent triage — all under HIPAA constraints that govern every word and every data transfer.",
    kpis: [
      { metric: "AHT", avg: "7:20", note: "Longer than average — scheduling requires provider matching, insurance verification, and prep instructions" },
      { metric: "FCR", avg: "48%", note: "Very low — scheduling changes, billing disputes, and multi-provider coordination require callbacks" },
      { metric: "CSAT", avg: "74%", note: "Below average — driven by scheduling friction and billing confusion" },
      { metric: "Containment", avg: "18%", note: "Low — patients prefer human confirmation for appointments and clinical questions" },
    ],
    layers: [
      { layer: 7, name: "Analytics & Governance",
        capabilities: ["CAHPS and HCAHPS survey integration with contact center interactions","Patient satisfaction tracking by department, provider, and service line","HIPAA compliance monitoring for PHI exposure in all channels","Agent quality scoring for empathy, accuracy, and scheduling completeness","No-show and cancellation analytics correlated to scheduling experience"],
        vendors: "NICE Nexidia, Press Ganey, Qualtrics Health", risk: "CAHPS scores dropping without root cause visibility in the contact center",
        stack: [
          { name: "Press Ganey", role: "Patient Experience", why: "Industry standard for CAHPS and patient satisfaction. Connects survey data to operational metrics. Shows exactly which contact center behaviors predict HCAHPS scores.", href: "/vendors/analytics" },
          { name: "NICE Nexidia", role: "Interaction Analytics", why: "Speech and text analytics with healthcare compliance models. Detects PHI exposure, missed scheduling steps, and empathy gaps. Automated QA at scale.", href: "/vendors/analytics" },
          { name: "Qualtrics Health", role: "Experience Platform", why: "Real-time patient feedback across touchpoints. Identifies where the patient journey breaks — scheduling, check-in, billing — with operational correlation.", href: "/vendors/analytics" },
        ],
        pitfall: "Health systems track CAHPS scores religiously but rarely connect them to contact center performance. A patient's CAHPS response about 'ease of getting an appointment' is directly shaped by the scheduling call — but most systems treat CAHPS as a clinical metric and contact center QA as an operational metric. They never meet. Connect Press Ganey data to your interaction analytics to find the real drivers."
      },
      { layer: 6, name: "Routing & Orchestration",
        capabilities: ["Clinical vs administrative triage routing at first contact","Department and service-line routing across dozens of specialties","After-hours clinical triage with nurse line protocols","Provider callback scheduling with calendar integration","Overflow routing during seasonal surges (flu, respiratory, back-to-school)"],
        vendors: "Genesys, NICE CXone, Cisco, Talkdesk HC", risk: "Clinical and administrative calls sharing a queue creates patient safety risk",
        stack: [
          { name: "Genesys Cloud", role: "Primary CCaaS", why: "Most mature routing for complex multi-department health systems. Handles 50+ specialty queues with skills-based matching. Predictive routing can account for provider availability and patient urgency.", href: "/vendors/genesys" },
          { name: "Talkdesk Healthcare", role: "Vertical CCaaS", why: "Pre-built healthcare routing flows — scheduling, billing, clinical triage, pharmacy. Epic integration included. Faster deployment than building on a generic platform.", href: "/vendors/talkdesk" },
          { name: "Cisco Webex CC", role: "Enterprise CCaaS", why: "Strong in health systems with existing Cisco network infrastructure. HIPAA-compliant recording and routing. UCaaS/CCaaS convergence for clinical collaboration.", href: "/vendors/cisco" },
        ],
        pitfall: "A patient calling about chest pain and a patient calling about a billing dispute should never be in the same queue. But most health system IVRs route by department, not by clinical urgency. Implement intent + urgency detection at the IVR level — if the system detects clinical keywords (pain, bleeding, breathing, fever in a child), bypass the department menu and route to clinical triage immediately."
      },
      { layer: 5, name: "Conversation Management",
        capabilities: ["Secure patient messaging integrated with the patient portal","Appointment reminders and confirmations via SMS and email","Video visits for telehealth scheduling and technical support","Chat for billing inquiries with PHI redaction","Post-discharge follow-up messaging with care plan instructions"],
        vendors: "Hyro.ai, Glia, LivePerson, Well Health", risk: "PHI exposure in unsecured messaging channels",
        stack: [
          { name: "Well Health", role: "Patient Communications", why: "Purpose-built healthcare messaging. Appointment reminders, recall campaigns, referral coordination, and post-visit follow-up. Integrates with Epic, Cerner, athenahealth. Reduces no-show rates 25-40%.", href: "/vendors/digital-engagement" },
          { name: "Hyro.ai", role: "Conversational AI", why: "Healthcare-specific conversational AI for patient access. Handles scheduling, provider search, and FAQ across web, phone, and chat. Plugs into EHR scheduling APIs.", href: "/vendors/iva" },
          { name: "Glia", role: "Digital Patient Service", why: "Secure co-browsing for patient portal navigation. Video for telehealth support. Chat with PHI controls. Patients don't leave the portal during the interaction.", href: "/vendors/digital-engagement" },
        ],
        pitfall: "Health systems send appointment reminders via SMS but don't include enough information for the patient to prepare (location, parking, prep instructions, what to bring). The result: the patient receives the reminder, can't find the details, and calls the contact center — creating the very call volume the reminder was supposed to prevent. Include a deep link to their appointment details in every reminder."
      },
      { layer: 4, name: "Reasoning & Planning",
        capabilities: ["Scheduling bots with provider/location/insurance matching logic","Prescription refill request automation with pharmacy routing","Appointment preparation bots delivering pre-visit instructions","Billing FAQ bots explaining EOBs, payment plans, and financial assistance","Symptom-based triage bots (Schmitt-Thompson protocols) for after-hours"],
        vendors: "Hyro.ai, Orbita, Nuance DAX, Notable Health", risk: "AI providing clinical guidance without proper clinical oversight protocols",
        stack: [
          { name: "Hyro.ai", role: "Healthcare AI Agent", why: "Handles the most common patient access calls — scheduling, provider search, location/hours, insurance acceptance — without custom NLU training. Pulls real-time availability from the EHR.", href: "/vendors/iva" },
          { name: "Notable Health", role: "Intelligent Automation", why: "AI-powered patient intake, pre-visit workflows, and follow-up. Reduces manual work for registration, insurance verification, and HRA collection.", href: "/vendors" },
          { name: "Orbita", role: "Healthcare Virtual Assistant", why: "HIPAA-compliant virtual assistant platform. Symptom checking, care navigation, and patient education. Strong in payer and provider environments.", href: "/vendors/iva" },
        ],
        pitfall: "Scheduling bots in healthcare are exponentially harder than in any other industry. A bot must check: provider availability, location, insurance network status, new vs existing patient rules, referral requirements, and prep instructions — then offer options. A bot that says 'I can schedule you with Dr. Smith on Tuesday at 2pm' without verifying insurance acceptance creates an appointment that will be cancelled at check-in. Validate insurance eligibility before confirming the appointment."
      },
      { layer: 3, name: "Policy & Guardrails",
        capabilities: ["HIPAA compliance controls for PHI in voice, chat, and messaging","Patient identity verification meeting healthcare authentication standards","Consent management for treatment, billing, and communication preferences","Business associate agreement enforcement for all technology vendors","Minimum necessary standard enforcement — agents see only needed PHI"],
        vendors: "Imprivata, LexisNexis Health, Pindrop", risk: "PHI exposure in a non-compliant channel — $100 to $50,000 per violation",
        stack: [
          { name: "Imprivata", role: "Identity & Access", why: "Healthcare-specific identity governance. Single sign-on for clinical and administrative applications. Ensures agents access only the PHI they need for the interaction — minimum necessary standard.", href: "/vendors" },
          { name: "Pindrop", role: "Voice Authentication", why: "Passive voice authentication reduces patient verification friction. Eliminates 'date of birth, last four of SSN' — which is itself a PHI exposure when spoken aloud in an open call center.", href: "/vendors/acd-routing" },
          { name: "LexisNexis Health", role: "Patient Matching", why: "Patient identity resolution across fragmented health system records. Reduces duplicate patient records that cause scheduling errors and clinical safety issues.", href: "/vendors" },
        ],
        pitfall: "Most health system contact centers verify patient identity by asking for date of birth and last four of SSN over the phone. This is PHI being spoken aloud in a room full of other agents and potentially recorded on a non-compliant system. Voice biometrics (Pindrop) or knowledge-based authentication that doesn't require speaking PHI aloud is both more secure and more HIPAA-appropriate. The verification process itself is often the biggest compliance risk."
      },
      { layer: 2, name: "Workflow Execution",
        capabilities: ["Multi-step appointment scheduling with insurance verification and prep instructions","Referral coordination workflow connecting PCP, specialist, and patient","Prescription refill workflow routing through pharmacy and provider approval","Financial counseling workflow for self-pay, payment plans, and charity care","Post-discharge follow-up workflow with readmission risk assessment"],
        vendors: "ServiceNow Health, Pega, Salesforce Health Cloud, UiPath", risk: "Manual referral coordination creating 2-3 week delays in specialist access",
        stack: [
          { name: "Salesforce Health Cloud", role: "Care Coordination CRM", why: "Patient relationship view across clinical and administrative interactions. Care plans, referral tracking, and social determinants. The CRM layer that connects the contact center to the clinical enterprise.", href: "/vendors/ccaas" },
          { name: "ServiceNow Health", role: "Workflow Platform", why: "Enterprise workflow automation for healthcare operations. Patient access workflows, prior authorization tracking, and IT service management on one platform.", href: "/vendors" },
          { name: "UiPath", role: "RPA", why: "Automates the EHR tasks agents do manually — scheduling in Epic, eligibility checks in payer portals, referral submissions. Bridges the gap while EHR APIs mature.", href: "/vendors" },
        ],
        pitfall: "Health systems automate scheduling but leave referral coordination manual. A PCP refers a patient to cardiology; the referral sits in a fax queue for 3 days; someone manually enters it into the scheduling system; the patient gets called 2 weeks later. By then, 30% of patients have scheduled elsewhere or given up. Automate the referral-to-appointment pipeline end-to-end, or accept that you're losing patients in the gap."
      },
      { layer: 1, name: "Data Access",
        capabilities: ["EHR integration (Epic, Cerner/Oracle Health) for scheduling and patient data","Practice management system connectivity for billing and insurance","Patient portal integration for session continuity","Revenue cycle system access for billing inquiries and payment processing","Insurance eligibility verification in real-time during scheduling"],
        vendors: "Epic, Oracle Health (Cerner), athenahealth, Salesforce Health Cloud", risk: "EHR integration depth determines whether agents resolve issues or just document them",
        stack: [
          { name: "Epic", role: "EHR", why: "Dominates large health systems. Cadence (scheduling), MyChart (patient portal), and Resolute (billing) are the data sources for 70%+ of patient access interactions. Your CX stack's ceiling is your Epic integration depth.", href: "/vendors" },
          { name: "Oracle Health (Cerner)", role: "EHR", why: "Second largest EHR. Millennium platform with growing cloud capabilities. HealtheIntent population health platform adds data for proactive patient outreach.", href: "/vendors" },
          { name: "athenahealth", role: "Cloud EHR", why: "Cloud-native EHR strong in ambulatory and multi-site provider groups. More modern API architecture than Epic/Cerner for CX integration. Good for mid-size health systems.", href: "/vendors" },
        ],
        pitfall: "Epic integration is not binary — it's a spectrum. Level 1: agent can look up patient demographics. Level 2: agent can see schedule and appointments. Level 3: agent can book, modify, and cancel appointments. Level 4: agent can check insurance eligibility and see clinical context. Most health systems stop at Level 2 and wonder why FCR is stuck at 50%. Push for Level 3-4 integration or accept that agents will 'take a message and call back' for every scheduling request."
      },
    ],
  },

  "health-insurance": {
    name: "Health Insurance (Payers)", parent: "Healthcare",
    tagline: "Benefits verification, claims status, prior authorization, provider search, and enrollment.",
    intro: "Payer contact centers handle the highest volume and most complex journeys in healthcare CX. A single member call about a denied claim can involve benefits interpretation, provider network rules, clinical criteria, appeals rights, and financial obligations — all governed by state and federal regulations that change annually.",
    kpis: [
      { metric: "AHT", avg: "8:45", note: "Long — benefits explanations and claims adjudication are inherently complex" },
      { metric: "FCR", avg: "55%", note: "Very low — claims disputes and prior auth require multi-party coordination" },
      { metric: "CSAT", avg: "71%", note: "Lowest in healthcare — members associate their insurer with denied claims and confusing EOBs" },
      { metric: "Containment", avg: "25%", note: "Benefits lookup and claims status are automatable; disputes require humans" },
    ],
    layers: [
      { layer: 7, name: "Analytics & Governance",
        capabilities: ["Member satisfaction tracking segmented by plan type (HMO, PPO, HDHP)","CMS Star Rating correlation with contact center performance","Grievance and appeal tracking with regulatory timeline compliance","Call reason analytics identifying systemic claims adjudication issues","Provider directory accuracy monitoring from member-reported errors"],
        vendors: "NICE, Verint, Qualtrics, Medallia", risk: "Star Rating impact from unresolved member complaints",
        stack: [
          { name: "NICE CXone", role: "QA & Analytics", why: "Compliance-scored QA for regulated payer interactions. Detects missing appeal rights notifications, incorrect benefits statements, and timeline violations.", href: "/vendors/nice-cxone" },
          { name: "Medallia", role: "Member Experience", why: "Experience analytics connecting member satisfaction to operational metrics. Identifies which claim types generate the most friction and complaint volume.", href: "/vendors/analytics" },
        ],
        pitfall: "CMS Star Ratings are partially driven by member experience scores from CAHPS surveys. But most payers don't connect their contact center QA program to Star Rating drivers. The agent who reads appeal rights incorrectly creates a member experience issue that suppresses Star Ratings — which directly affects Medicare Advantage revenue. Link your QA scorecard to specific Star Rating measures."
      },
      { layer: 6, name: "Routing & Orchestration",
        capabilities: ["Plan-type routing (Medicare, Medicaid, Commercial, Exchange)","Benefit-specific routing (medical, pharmacy, behavioral health, dental)","Prior authorization routing to clinical review teams","Grievance and appeal routing with regulatory priority","Provider-initiated routing separating member and provider calls"],
        vendors: "Genesys, NICE CXone, Five9", risk: "Medicare and commercial calls sharing agents without proper training segmentation",
        stack: [
          { name: "NICE CXone", role: "Primary CCaaS", why: "Strong in large payer operations. Native WEM handles the 1,000+ agent operations common in payer contact centers. Skills-based routing across plan types and benefit categories.", href: "/vendors/nice-cxone" },
          { name: "Genesys Cloud", role: "Primary CCaaS", why: "Predictive routing for high-volume payer operations. Intent detection separating 'what's my copay' from 'why was my claim denied' before the agent picks up.", href: "/vendors/genesys" },
        ],
        pitfall: "Payers route by plan type but not by call intent within plan type. A Medicare member calling about a denied prior auth and a Medicare member calling about their ID card end up in the same queue. The prior auth call requires clinical knowledge; the ID card call takes 90 seconds. Segment by intent within plan type, or your specialized agents will spend 40% of their time on simple administrative calls."
      },
      { layer: 5, name: "Conversation Management",
        capabilities: ["Secure member portal messaging for claims and benefits inquiries","EOB explanation tools with visual guides for complex benefits","Prior authorization status notifications with next-step guidance","Provider search tools with real-time network and availability data","Open enrollment campaign communications across channels"],
        vendors: "Glia, LivePerson, Pypestream, Relay Network", risk: "Members receiving conflicting benefits information across channels",
        stack: [
          { name: "Pypestream", role: "Digital Member Engagement", why: "Purpose-built for health insurance. Guided conversations for benefits lookup, claims status, and provider search. Reduces call volume by resolving digital-first.", href: "/vendors/digital-engagement" },
          { name: "Relay Network", role: "Member Communications", why: "Proactive member engagement platform. Delivers personalized benefits reminders, care gap notifications, and claims updates via secure messaging.", href: "/vendors" },
        ],
        pitfall: "Open enrollment creates a 2-4x volume spike that most payer contact centers handle by hiring temp agents with 2 weeks of training. These agents handle benefits questions for the most confusing product decision a member makes all year. The result: incorrect plan guidance that members discover when they need care. Invest in robust self-service for plan comparison during OEP, and restrict temp agents to simple administrative tasks."
      },
      { layer: 4, name: "Reasoning & Planning",
        capabilities: ["Benefits verification bots with real-time eligibility and copay data","Claims status bots with denial reason codes and appeal guidance","Provider search bots with network, specialty, and availability filtering","Prior authorization status bots with clinical criteria transparency","ID card request and replacement automation"],
        vendors: "Cognigy, Kore.ai, Hyro.ai, Google CCAI", risk: "Bot stating incorrect benefits creating member reliance and downstream disputes",
        stack: [
          { name: "Kore.ai", role: "Enterprise IVA", why: "Deep payer domain coverage. Benefits lookup, claims status, prior auth status, and provider search bots. Handles the multi-turn conversations that simple bots can't — 'my claim was denied, why, and how do I appeal?'", href: "/vendors/iva" },
          { name: "Cognigy", role: "Conversational AI", why: "Enterprise-grade with strong integration to claims adjudication and benefits administration systems. Handles high volume during OEP. Multi-language support for diverse member populations.", href: "/vendors/iva" },
        ],
        pitfall: "A benefits verification bot must return accurate, real-time data — not cached or approximated information. If a bot tells a member their specialist copay is $40 but the actual copay is $60 because they haven't met their deductible, the member will rely on that $40 figure. When they receive the bill, you've created a dispute, a complaint, and potentially a Star Rating impact. Connect your bot to the real-time eligibility and accumulator systems, not a benefits summary table."
      },
      { layer: 3, name: "Policy & Guardrails",
        capabilities: ["HIPAA compliance for member PHI across all communication channels","CMS Medicare marketing and communication guidelines enforcement","State DOI requirements for grievance and appeal timelines","Mental health parity compliance in behavioral health benefit explanations","ACA essential health benefits accuracy in plan descriptions"],
        vendors: "Imprivata, NICE Actimize, Verscend", risk: "CMS audit findings from non-compliant member communications",
        stack: [
          { name: "Verscend (Cotiviti)", role: "Claims Compliance", why: "Payment accuracy and compliance analytics for payers. Identifies systemic claims processing errors that generate member complaints. Fixes the root cause, not just the symptom.", href: "/vendors" },
          { name: "Imprivata", role: "Identity & Access", why: "Controls agent access to member PHI. Ensures minimum necessary standard — agents see only the data relevant to the member's inquiry.", href: "/vendors" },
        ],
        pitfall: "CMS marketing guidelines restrict what payer agents can say about plan benefits during specific periods. During the Annual Election Period, agents can describe plan features but cannot 'steer' members toward specific plans. The line between 'describing' and 'steering' is subjective and audited. Train agents on CMS communication rules — and record/monitor for compliance — or risk sanctions."
      },
      { layer: 2, name: "Workflow Execution",
        capabilities: ["Member enrollment and plan change workflow with eligibility verification","Prior authorization submission and tracking workflow","Grievance and appeal intake workflow with regulatory timeline enforcement","Provider credentialing inquiry workflow for provider-initiated calls","Claims reprocessing workflow with adjudication rule validation"],
        vendors: "Pega, Salesforce Health Cloud, ServiceNow, Appian", risk: "Grievance timeline violations triggering CMS sanctions",
        stack: [
          { name: "Pega", role: "Process Orchestration", why: "Industry-leading for payer operations. Care management, claims processing, and member service workflows. Automated SLA enforcement for grievance and appeal timelines.", href: "/vendors" },
          { name: "Salesforce Health Cloud", role: "Member CRM", why: "Unified member view across plan enrollment, claims, benefits, and interactions. Action plans for member outreach, care gap closure, and renewal retention.", href: "/vendors/ccaas" },
        ],
        pitfall: "CMS requires Medicare Advantage plans to resolve standard grievances within 30 days and expedited grievances within 24 hours. Your workflow engine must enforce these timelines automatically — including escalation alerts at 20 days and 72 hours respectively. Most payers track grievance timelines in spreadsheets until they receive a CMS warning letter. Automate before that happens."
      },
      { layer: 1, name: "Data Access",
        capabilities: ["Claims adjudication system integration for real-time claims status","Benefits administration system connectivity for eligibility and coverage","Provider network database with credentialing and directory accuracy","Member enrollment system for plan details and coverage history","Pharmacy benefit manager integration for drug coverage and formulary"],
        vendors: "HealthEdge, Facets (TriZetto), QNXT, Salesforce Health Cloud", risk: "Claims system latency creating stale information during member calls",
        stack: [
          { name: "HealthEdge (Source)", role: "Claims Platform", why: "Modern claims adjudication replacing legacy Facets and QNXT implementations. Real-time APIs for member service. Faster claims processing means faster answers for members.", href: "/vendors" },
          { name: "Facets (TriZetto/Cognizant)", role: "Claims Platform", why: "Still powers many of the largest commercial and Medicare payers. Legacy but deeply embedded. Your CX integration depends on which Facets version and what middleware sits in front of it.", href: "/vendors" },
          { name: "Salesforce Health Cloud", role: "Member CRM", why: "The CRM layer that unifies claims, benefits, enrollment, and interaction data. Without a CRM, agents toggle between 4-6 systems per call.", href: "/vendors/ccaas" },
        ],
        pitfall: "Payer claims systems process adjudication in batch cycles — often nightly. When a member calls at 2pm about a claim submitted at 9am, the system may show 'received' but not 'processed.' The agent says 'it's still processing' — which the member hears as 'nobody's looked at it.' Push for real-time or near-real-time adjudication status, or at minimum, give agents visibility into where the claim sits in the processing queue."
      },
    ],
  },

  "provider-groups": {
    name: "Provider Groups & Clinics", parent: "Healthcare",
    tagline: "Appointment scheduling, prescription refills, referrals, billing, and patient communications.",
    intro: "Multi-site provider groups operate contact centers that serve dozens to hundreds of locations, each with different providers, schedules, specialties, and sometimes different EHR instances. The CX challenge is providing centralized service with local knowledge — a patient calling about their doctor at the Oak Street clinic expects the agent to know that location's hours, providers, and services.",
    kpis: [
      { metric: "AHT", avg: "5:30", note: "Shorter than health systems — simpler scheduling and fewer service lines" },
      { metric: "FCR", avg: "62%", note: "Better than hospitals but still limited by multi-location scheduling complexity" },
      { metric: "CSAT", avg: "78%", note: "Higher than hospitals — smaller scale creates more responsive service" },
      { metric: "Containment", avg: "22%", note: "Scheduling and refill requests are automatable" },
    ],
    layers: [
      { layer: 7, name: "Analytics & Governance",
        capabilities: ["Patient satisfaction by location, provider, and call reason","Scheduling fill rate analytics — appointments booked vs available slots","No-show prediction correlated to reminder cadence and channel","Quality scoring for accuracy of insurance verification and scheduling","Revenue impact analytics — calls converted to appointments and procedures"],
        vendors: "NICE, Qualtrics, Press Ganey", risk: "Losing patients to competitors due to scheduling friction without visibility",
        stack: [
          { name: "NICE CXone", role: "QA & Recording", why: "Right-sized analytics for mid-market provider groups. Compliance recording, basic QA, and scheduling accuracy monitoring without enterprise complexity.", href: "/vendors/nice-cxone" },
          { name: "Press Ganey", role: "Patient Satisfaction", why: "Industry standard for patient experience measurement. Connects scheduling experience to downstream clinical satisfaction.", href: "/vendors/analytics" },
        ],
        pitfall: "Provider groups track appointments booked but not appointments lost. If a patient calls, can't get an appointment within an acceptable timeframe, and hangs up — that's an invisible revenue loss. Track 'scheduling abandonment' (calls where the patient didn't book) and 'scheduling deflection' (patients who booked with a competitor instead). These are your real metrics."
      },
      { layer: 6, name: "Routing & Orchestration",
        capabilities: ["Location-based routing matching patients to their home clinic","Specialty routing across multiple practice locations","Urgent care vs routine scheduling routing","Provider-specific routing for established patient relationships","After-hours answering service integration with clinical escalation"],
        vendors: "NICE CXone, Talkdesk, Five9, RingCentral", risk: "Patients calling one location and being unable to schedule at another",
        stack: [
          { name: "Talkdesk Healthcare", role: "CCaaS", why: "Pre-built healthcare routing with multi-location scheduling logic. Epic and athenahealth integrations. Good for groups with 50-500 agents.", href: "/vendors/talkdesk" },
          { name: "RingCentral", role: "UCaaS/CCaaS", why: "Unified communications for multi-site groups where front desk staff and contact center agents need to collaborate. Phone system and contact center on one platform.", href: "/vendors" },
        ],
        pitfall: "Centralized scheduling across multiple locations requires real-time visibility into every location's schedule. If the contact center can see Dr. Smith's availability at the Oak Street location but not the Elm Street location, the agent can't offer alternatives when Oak Street is full. This is an EHR integration problem, not a routing problem — but it surfaces as a routing failure."
      },
      { layer: 5, name: "Conversation Management",
        capabilities: ["Appointment reminders via SMS, email, and automated voice","Patient portal messaging integration for asynchronous communication","Recall campaign management for preventive care and chronic conditions","Secure messaging for prescription refill requests","Online scheduling links reducing inbound call volume"],
        vendors: "Well Health, Klara, Luma Health, Relatient", risk: "Reminder fatigue causing patients to ignore critical appointment notifications",
        stack: [
          { name: "Luma Health", role: "Patient Engagement", why: "Purpose-built for multi-site provider groups. Scheduling, reminders, waitlist management, and referral coordination. Integrates with 50+ EHR/PM systems.", href: "/vendors" },
          { name: "Klara", role: "Patient Communications", why: "HIPAA-compliant messaging, intake forms, and appointment coordination. Patients text the practice; staff respond from a unified inbox. Reduces phone volume.", href: "/vendors" },
          { name: "Well Health", role: "Patient Outreach", why: "Automated patient engagement across the care lifecycle. Reminders, recall campaigns, and post-visit surveys. Strong multi-location management.", href: "/vendors/digital-engagement" },
        ],
        pitfall: "Provider groups deploy patient messaging apps (Klara, Luma) alongside the EHR patient portal (MyChart, athenahealth Patient Portal), creating two messaging channels that patients use inconsistently. Staff check both, but sometimes miss messages. Choose one primary messaging channel for patients and make it the default — don't run parallel systems unless you have workflow automation connecting them."
      },
      { layer: 4, name: "Reasoning & Planning",
        capabilities: ["Online scheduling bots with provider, location, and insurance matching","Prescription refill request bots with pharmacy routing","Appointment preparation bots delivering location-specific instructions","FAQ bots for hours, locations, accepted insurance, and new patient process","Waitlist management bots offering cancellation fill opportunities"],
        vendors: "Hyro.ai, Ada, Notable Health", risk: "Scheduling bots booking appointments without insurance verification",
        stack: [
          { name: "Hyro.ai", role: "Healthcare AI", why: "Conversational AI for scheduling with real-time EHR integration. Handles the full scheduling flow — provider search, availability check, insurance verification, booking. Purpose-built for healthcare.", href: "/vendors/iva" },
          { name: "Notable Health", role: "Patient Automation", why: "AI-powered intake and scheduling. Pre-visit forms, insurance capture, and appointment reminders automated end-to-end. Reduces staff workload by 30-50% on administrative tasks.", href: "/vendors" },
        ],
        pitfall: "Online scheduling without insurance verification creates downstream chaos. A patient books online, arrives for their appointment, and discovers their insurance isn't accepted at that location — or their plan requires a referral they don't have. Every scheduling bot and online booking tool must verify insurance eligibility before confirming the appointment. This is harder than it sounds because eligibility APIs are inconsistent across payers."
      },
      { layer: 3, name: "Policy & Guardrails",
        capabilities: ["HIPAA compliance for patient communications across all channels","Patient identity verification for phone, chat, and messaging interactions","Consent management for communication preferences and marketing","TCPA compliance for automated outbound calls and texts","State-specific telehealth consent requirements for virtual visits"],
        vendors: "Pindrop, Imprivata, LexisNexis Health", risk: "TCPA violations from automated reminder calls to patients who haven't consented",
        stack: [
          { name: "Pindrop", role: "Voice Authentication", why: "Passive patient verification without asking PHI aloud. Especially valuable in multi-site groups where agents serve patients they don't personally know.", href: "/vendors/acd-routing" },
        ],
        pitfall: "Provider groups send appointment reminders via automated calls and texts — but TCPA requires prior express consent for automated calls to cell phones. If a patient provided their cell number on an intake form, that's not necessarily TCPA consent for automated calls. Audit your consent collection process before scaling automated outreach, or budget for TCPA defense when the lawsuits arrive."
      },
      { layer: 2, name: "Workflow Execution",
        capabilities: ["New patient registration workflow with insurance and demographics collection","Referral intake and scheduling workflow with referring provider notification","Prescription refill workflow routing through provider approval queue","Prior authorization tracking workflow with payer-specific requirements","Patient recall workflow for preventive care and chronic disease management"],
        vendors: "Salesforce Health Cloud, Luma Health, Notable, UiPath", risk: "Referral leakage — patients referred internally but scheduling externally",
        stack: [
          { name: "Luma Health", role: "Workflow Platform", why: "Referral management, waitlist filling, and recall campaigns automated across locations. Reduces referral leakage and no-show rates.", href: "/vendors" },
          { name: "Salesforce Health Cloud", role: "Patient CRM", why: "Patient relationship management across locations. Tracks the full patient lifecycle from first call through referral through follow-up.", href: "/vendors/ccaas" },
        ],
        pitfall: "Referral leakage is the silent revenue killer for provider groups. A PCP refers a patient to the group's orthopedist; the contact center doesn't schedule the appointment within 48 hours; the patient Googles 'orthopedist near me' and books with a competitor. Automate referral-to-appointment conversion within 24 hours or accept that 20-30% of internal referrals will leak to competitors."
      },
      { layer: 1, name: "Data Access",
        capabilities: ["EHR integration across all practice locations (may be multiple systems)","Practice management system for scheduling, billing, and insurance","Patient portal integration for online scheduling and messaging","Insurance eligibility verification in real-time","Provider directory with credentials, locations, and availability"],
        vendors: "athenahealth, eClinicalWorks, Epic, NextGen", risk: "Multiple EHR instances across locations creating data silos",
        stack: [
          { name: "athenahealth", role: "Cloud EHR/PM", why: "Most common EHR for multi-site provider groups. Cloud-native with modern APIs. athenaCollector (PM) and athenaClinicals (EHR) on one platform simplifies CX integration.", href: "/vendors" },
          { name: "eClinicalWorks", role: "EHR/PM", why: "Large market share in ambulatory groups. healow portal for patient engagement. Growing API capabilities but integration quality varies by version.", href: "/vendors" },
        ],
        pitfall: "Provider groups formed through acquisition often run 2-3 different EHR systems across locations. The contact center needs to schedule across all of them. Without middleware that normalizes scheduling across EHR instances, agents must learn multiple systems — and errors multiply. Invest in a scheduling abstraction layer (Luma Health, QueueDr) that presents a unified view across all EHR instances."
      },
    ],
  },

  "digital-health": {
    name: "Digital Health & Telehealth", parent: "Healthcare",
    tagline: "Platform support, virtual visit scheduling, technical troubleshooting, and care navigation.",
    intro: "Digital health contact centers support patients who expect the speed and simplicity of a consumer app applied to healthcare. The CX challenge is resolving technical issues (video connectivity, app navigation, device pairing) alongside clinical access needs (scheduling, prescriptions, care navigation) — two fundamentally different support models under one roof.",
    kpis: [
      { metric: "AHT", avg: "4:30", note: "Shorter — digital-native users and simpler issue resolution" },
      { metric: "FCR", avg: "72%", note: "Better than traditional HC — fewer multi-party dependencies" },
      { metric: "CSAT", avg: "80%", note: "Higher than traditional HC — self-selected digital-savvy population" },
      { metric: "Containment", avg: "35%", note: "Higher — FAQ, scheduling, and technical troubleshooting are automatable" },
    ],
    layers: [
      { layer: 7, name: "Analytics & Governance", capabilities: ["App experience monitoring with support trigger correlation","Virtual visit completion rate analytics with technical failure tracking","Patient satisfaction by visit type, provider, and platform","Support volume correlation to app releases and outages","Regulatory compliance tracking for telehealth-specific requirements"], vendors: "Amplitude, NICE, Qualtrics", risk: "Technical issues causing visit abandonment without root cause visibility",
        stack: [{ name: "Amplitude", role: "Product Analytics", why: "Connects in-app behavior to support contacts. Shows which app screen or feature triggers support requests. Product teams fix root causes.", href: "/vendors" }],
        pitfall: "Digital health companies track virtual visit completion rates but don't correlate them with pre-visit support contacts. If 15% of patients call support before their visit and 8% of those abandon the visit entirely, you have a technical barrier to care that only shows up in support data. Pipe support analytics into clinical quality reporting."
      },
      { layer: 6, name: "Routing & Orchestration", capabilities: ["Technical support vs clinical access routing","Platform-specific routing (iOS, Android, web, connected device)","Provider availability routing for same-day virtual visits","Escalation to clinical team for urgent symptom reporting","Post-visit follow-up routing for prescription and referral questions"], vendors: "Intercom, Zendesk, Genesys", risk: "Clinical urgency masked as a technical support request",
        stack: [{ name: "Intercom", role: "In-App Support", why: "In-app messaging with full user context. Agents see the patient's device, OS, app version, and recent actions. Purpose-built for product-led support.", href: "/vendors/digital-engagement" }, { name: "Zendesk", role: "Support Platform", why: "More structured ticketing for scaling past startup. Good for managing the mix of technical support, clinical access, and billing.", href: "/vendors" }],
        pitfall: "A patient messaging 'I can't connect to my visit' might have a technical problem (camera permissions, bandwidth) or a clinical problem (panic attack, cognitive impairment preventing app use). Route all 'can't connect' messages through a quick triage that distinguishes technical from clinical before assigning to the technical support queue."
      },
      { layer: 5, name: "Conversation Management", capabilities: ["In-app messaging as primary support channel","Pre-visit technical readiness checks (camera, mic, bandwidth)","Video visit technical support during live sessions","Post-visit care plan delivery and follow-up messaging","Connected device support for remote patient monitoring"], vendors: "Intercom, Twilio, Ada, Glia", risk: "Technical support friction preventing patients from accessing care",
        stack: [{ name: "Twilio", role: "Communications Platform", why: "Powers the video, voice, and messaging infrastructure for most telehealth platforms. When video fails, Twilio's diagnostics data tells you why — network, device, or platform.", href: "/vendors" }],
        pitfall: "Pre-visit tech checks are the single highest-ROI investment in digital health CX. A 30-second automated camera/mic/bandwidth test sent 15 minutes before the visit prevents 60-70% of 'I can't connect' calls. Most telehealth platforms skip this step and absorb the support volume instead."
      },
      { layer: 4, name: "Reasoning & Planning", capabilities: ["Technical troubleshooting bots for common connectivity issues","Appointment scheduling bots for virtual and in-person visits","Prescription status and pharmacy routing bots","Device pairing and setup bots for RPM equipment","Symptom checker bots with appropriate clinical escalation"], vendors: "Ada, Intercom Fin, Hyro.ai", risk: "Bot providing clinical guidance without proper protocols",
        stack: [{ name: "Ada (Support)", role: "AI Agent", why: "Handles technical troubleshooting (camera permissions, bandwidth, app updates) without engineering escalation. Pre-built healthcare content for scheduling and FAQ.", href: "/vendors/iva" }],
        pitfall: "Symptom checker bots in digital health operate in a regulatory gray area. If a bot asks about symptoms and provides guidance ('this sounds like it could wait for a scheduled visit'), it may be practicing medicine. Define clear boundaries: the bot triages to the right care pathway (urgent, same-day, scheduled) but never diagnoses, recommends treatment, or provides clinical opinion."
      },
      { layer: 3, name: "Policy & Guardrails", capabilities: ["HIPAA compliance for all digital interactions and stored data","State-specific telehealth licensure and consent requirements","Informed consent collection before virtual visits","Data privacy for connected device and wearable data","BAA enforcement for all third-party technology vendors"], vendors: "Imprivata, Compliancy Group", risk: "Operating in states without proper telehealth licensure",
        stack: [{ name: "Compliancy Group", role: "HIPAA Compliance", why: "HIPAA compliance management for digital health companies that may not have an institutional compliance team. Training, risk assessment, and BAA management.", href: "/vendors" }],
        pitfall: "Telehealth licensure requirements vary by state and change frequently. A provider licensed in New York cannot necessarily treat a patient physically located in New Jersey during the virtual visit. Your scheduling system must verify the patient's physical location (not billing address) at the time of the visit and confirm provider licensure in that state. This is an active area of regulatory change."
      },
      { layer: 2, name: "Workflow Execution", capabilities: ["Patient onboarding workflow with identity verification and insurance","Virtual visit scheduling with provider matching and tech readiness","Post-visit workflow with prescriptions, referrals, and follow-up scheduling","Connected device enrollment and data onboarding workflow","Insurance eligibility and prior authorization for virtual services"], vendors: "Salesforce Health Cloud, Healthie, Canvas Medical", risk: "Onboarding drop-off due to too many pre-visit steps",
        stack: [{ name: "Healthie", role: "Virtual Care Platform", why: "All-in-one platform for virtual care delivery. Scheduling, charting, billing, and patient engagement. Built for telehealth-first and hybrid models.", href: "/vendors" }],
        pitfall: "Digital health onboarding typically requires: account creation, identity verification, insurance entry, consent forms, health history, and tech check — 15-25 minutes before the first visit. Every additional step loses 5-10% of patients. Minimize pre-visit friction by collecting only what's clinically necessary before the first visit and gathering the rest during or after."
      },
      { layer: 1, name: "Data Access", capabilities: ["Telehealth platform integration (Amwell, Teladoc infrastructure)","EHR connectivity for clinical data and care coordination","Pharmacy network integration for e-prescribing","Connected device data platforms (RPM, wearables)","Insurance eligibility and claims submission systems"], vendors: "Amwell, Wheel, Twilio, Canvas Medical", risk: "Clinical data in the telehealth platform disconnected from the patient's primary EHR",
        stack: [{ name: "Canvas Medical", role: "EHR for Digital Health", why: "API-first EHR built for digital health companies. Modern data model with real-time APIs. Designed for programmatic access rather than traditional EHR UI-first design.", href: "/vendors" }, { name: "Amwell / Wheel", role: "Telehealth Infrastructure", why: "Enterprise telehealth platforms providing the clinical delivery layer. Provider networks, visit management, and clinical workflows.", href: "/vendors" }],
        pitfall: "Digital health visits create clinical records that need to flow back to the patient's primary care provider. If a patient has a Teladoc visit and their PCP never sees the visit note, care fragmentation worsens. Implement FHIR-based data sharing or direct EHR integration to ensure virtual visit records reach the patient's medical home."
      },
    ],
  },

  "pharma-life-sciences": {
    name: "Pharmaceutical & Life Sciences", parent: "Healthcare",
    tagline: "Patient support programs, co-pay assistance, adverse event reporting, and HCP inquiries.",
    intro: "Pharmaceutical contact centers serve two audiences with completely different needs: patients (support programs, co-pay cards, side effect questions) and healthcare providers (medical information, formulary status, sample requests). Both require absolute accuracy because incorrect information can affect treatment decisions and patient safety.",
    kpis: [
      { metric: "AHT", avg: "10:00", note: "Long — adverse event reports and medical information requests require detailed documentation" },
      { metric: "FCR", avg: "72%", note: "Higher than expected — specialized agents with deep product knowledge" },
      { metric: "CSAT", avg: "81%", note: "High — patients in support programs appreciate the personal attention" },
      { metric: "Containment", avg: "15%", note: "Low — regulatory requirements limit what automation can handle" },
    ],
    layers: [
      { layer: 7, name: "Analytics & Governance", capabilities: ["Adverse event reporting completeness and timeline monitoring","Patient support program enrollment and adherence analytics","Medical information inquiry tracking with response accuracy","HCP engagement analytics across channels","Regulatory compliance audit readiness for FDA and EMA requirements"], vendors: "NICE, Verint, IQVIA", risk: "FDA audit findings from incomplete adverse event documentation",
        stack: [{ name: "IQVIA", role: "Life Sciences Analytics", why: "Industry standard for pharmaceutical commercial and medical analytics. Connects patient support program performance to commercial outcomes.", href: "/vendors" }, { name: "NICE CXone", role: "QA & Compliance", why: "Compliance-scored QA ensuring adverse events are captured completely, medical information responses cite approved labeling, and off-label inquiries are escalated appropriately.", href: "/vendors/nice-cxone" }],
        pitfall: "Every product complaint and adverse event mentioned during any patient call — even casually — must be captured and reported to pharmacovigilance within defined timelines. 'My stomach has been bothering me since I started the medication' is a reportable adverse event, even if the patient called about a co-pay card. Train every agent — not just medical information staff — to recognize and document AEs."
      },
      { layer: 6, name: "Routing & Orchestration", capabilities: ["Patient vs HCP routing with different service models","Adverse event priority routing to pharmacovigilance-trained agents","Product-specific routing for multi-brand pharmaceutical companies","Medical information routing to medically trained staff","Co-pay and patient assistance program routing to benefits specialists"], vendors: "Genesys, NICE CXone", risk: "Adverse event report reaching an untrained agent who fails to capture it",
        stack: [{ name: "Genesys Cloud", role: "Primary CCaaS", why: "Skills-based routing separating patient support, medical information, adverse events, and HCP inquiries. Each requires different agent training and compliance controls.", href: "/vendors/genesys" }],
        pitfall: "Pharmaceutical contact centers often route by product brand, not by caller type. A patient calling about Brand X and an oncologist calling about Brand X need completely different agents with completely different training. Route by caller type first (patient vs HCP vs pharmacist), then by product. The caller type determines the conversation; the product determines the content."
      },
      { layer: 5, name: "Conversation Management", capabilities: ["Secure patient portal for program enrollment and document submission","HCP portal for medical information requests and sample management","Adverse event reporting forms accessible during any interaction","Co-pay card activation and balance check via digital channels","Patient education content delivery for medication onboarding"], vendors: "Salesforce Health Cloud, Veeva, LivePerson", risk: "Off-label information shared through unmonitored digital channels",
        stack: [{ name: "Veeva Vault", role: "Content Management", why: "Industry standard for pharmaceutical content management. Medical information responses must reference approved materials. Veeva ensures agents pull from the current approved label, not outdated documents.", href: "/vendors" }],
        pitfall: "Every response to a medical information inquiry must be based on FDA-approved labeling or published literature. If an agent answers a question from memory or personal knowledge — even if correct — it's undocumented and unverifiable. Medical information workflows must pull from an approved content repository (Veeva Vault) with version control and audit trail. Memory-based responses create regulatory risk."
      },
      { layer: 4, name: "Reasoning & Planning", capabilities: ["Co-pay card enrollment and activation bots","Prescription status and pharmacy locator bots","Patient program eligibility screening bots","Refill reminder and adherence support bots","Basic product FAQ bots (dosing, storage, administration)"], vendors: "Ada, Cognigy, Salesforce Einstein", risk: "Bot providing medical information without proper medical review controls",
        stack: [{ name: "Ada", role: "Patient Support AI", why: "Handles co-pay card activation, program enrollment, and pharmacy locator — the transactional interactions that don't require medical training. Keeps agents free for AE reports and medical inquiries.", href: "/vendors/iva" }],
        pitfall: "Pharmaceutical bots must never answer medical questions — even basic ones like 'can I take this with food?' — without pulling from approved labeling. The answer might seem obvious, but if the bot provides guidance that differs from the label, it's a regulatory violation. Restrict bots to administrative tasks (co-pay, enrollment, pharmacy finder) and route all medical questions to trained staff."
      },
      { layer: 3, name: "Policy & Guardrails", capabilities: ["FDA adverse event reporting requirements (MedWatch, CIOMS)","Off-label communication detection and escalation","HIPAA/patient privacy controls for support program data","Anti-kickback statute compliance for patient assistance programs","Global pharmacovigilance requirements for multinational programs"], vendors: "IQVIA PV, Veeva Safety, ArisGlobal", risk: "Missed adverse event creating FDA enforcement action",
        stack: [{ name: "Veeva Safety (Vault Safety)", role: "Pharmacovigilance", why: "End-to-end adverse event management — intake, assessment, reporting. Ensures AEs captured in the contact center flow to safety within required timelines.", href: "/vendors" }, { name: "ArisGlobal LifeSphere", role: "Safety & PV", why: "Global pharmacovigilance platform managing AE reporting across countries and regulatory bodies. Important for multinational pharma operations.", href: "/vendors" }],
        pitfall: "The handoff between the contact center and the pharmacovigilance team is where adverse events get lost. An agent captures the AE in the CRM; someone emails it to PV; PV enters it into their safety database. Each handoff introduces delay and data loss risk. Integrate your contact center platform directly with your safety system (Veeva Safety or ArisGlobal) so AE data flows automatically — no email, no re-entry."
      },
      { layer: 2, name: "Workflow Execution", capabilities: ["Patient support program enrollment with eligibility verification","Co-pay card issuance and benefit tracking workflow","Adverse event intake workflow with required data fields and follow-up","Prior authorization support workflow for specialty medications","Patient adherence program workflow with refill reminders and check-ins"], vendors: "Salesforce Health Cloud, Veeva CRM, AssistRx", risk: "Program enrollment drop-off due to complex eligibility requirements",
        stack: [{ name: "AssistRx", role: "Patient Services Platform", why: "iAssist platform manages the full patient services lifecycle — enrollment, benefits verification, prior authorization, co-pay assistance, and adherence. Purpose-built for specialty pharma.", href: "/vendors" }, { name: "Salesforce Health Cloud", role: "Patient CRM", why: "Patient relationship management for pharma. Tracks program enrollment, interactions, adherence signals, and outcomes across the patient journey.", href: "/vendors/ccaas" }],
        pitfall: "Patient support programs often require insurance verification, income documentation, and clinical criteria before enrollment. Each additional step loses 10-15% of eligible patients. Front-load the easiest wins (co-pay card activation can be instant) and parallelize the complex steps (income verification can happen after the patient starts receiving the medication, with a conditional enrollment period)."
      },
      { layer: 1, name: "Data Access", capabilities: ["Patient support program database with enrollment and activity history","Pharmacy network and specialty pharmacy connectivity","Insurance and benefits verification systems","Medical information library with approved labeling and published literature","CRM with full patient and HCP interaction history"], vendors: "Veeva CRM, Salesforce Health Cloud, AssistRx, CoverMyMeds", risk: "Patient data fragmented across program databases, CRM, and safety systems",
        stack: [{ name: "Veeva CRM", role: "HCP & Patient CRM", why: "Industry standard for pharmaceutical commercial operations. HCP interaction history, medical information requests, and sample management. The source of truth for HCP-facing interactions.", href: "/vendors" }, { name: "CoverMyMeds (McKesson)", role: "Prior Auth Platform", why: "Electronic prior authorization connecting providers, payers, and pharmacies. Agents helping patients with PA status need real-time visibility into this platform.", href: "/vendors" }],
        pitfall: "Pharmaceutical companies often run separate systems for each patient support program — Brand A on one platform, Brand B on another, medical information on a third. An agent taking a call from a patient on two of the company's medications must toggle between systems. Consolidate onto a single patient services platform (AssistRx or Salesforce Health Cloud) or accept that multi-product patients will get fragmented service."
      },
    ],
  },

  "home-health": {
    name: "Home Health & Post-Acute", parent: "Healthcare",
    tagline: "Visit scheduling, caregiver coordination, supply management, and family communication.",
    intro: "Home health contact centers serve the most vulnerable patient populations — elderly, post-surgical, chronically ill, and disabled individuals receiving care in their homes. The CX challenge is coordinating a mobile clinical workforce (nurses, therapists, aides) with patients and family caregivers who are often anxious, overwhelmed, and navigating the healthcare system for the first time.",
    kpis: [
      { metric: "AHT", avg: "6:00", note: "Moderate — scheduling and caregiver coordination are the primary call drivers" },
      { metric: "FCR", avg: "55%", note: "Low — visit changes require clinician coordination that can't happen in real-time" },
      { metric: "CSAT", avg: "79%", note: "Higher than expected — patients and families value the personal touch" },
      { metric: "Containment", avg: "10%", note: "Very low — vulnerable populations strongly prefer human interaction" },
    ],
    layers: [
      { layer: 7, name: "Analytics & Governance", capabilities: ["Patient satisfaction tracking with family/caregiver perspective included","Visit completion rate analytics with no-show and cancellation reasons","OASIS assessment compliance monitoring","Clinician utilization and scheduling efficiency analytics","Rehospitalization risk correlation with care plan adherence"], vendors: "NICE, MatrixCare Analytics, WellSky", risk: "CMS quality reporting gaps affecting star ratings and reimbursement",
        stack: [{ name: "WellSky (Kinnser)", role: "Home Health Analytics", why: "Industry-specific analytics for home health agencies. OASIS compliance, visit utilization, and quality measure tracking. The data source for CMS quality reporting.", href: "/vendors" }],
        pitfall: "Home health quality metrics (OASIS, star ratings) are clinical measures, but the contact center directly influences them through scheduling timeliness, care plan communication, and follow-up completion. Connect your contact center metrics to clinical quality outcomes — a missed scheduling call today becomes a missed visit tomorrow and a rehospitalization next week."
      },
      { layer: 6, name: "Routing & Orchestration", capabilities: ["Patient/family vs clinician routing with different service models","Urgent clinical concern routing to on-call nurse or supervisor","Visit scheduling and rescheduling routing to scheduling coordinators","Supply and equipment request routing to supply chain team","Referral intake routing for new patient admissions"], vendors: "NICE CXone, 8x8, RingCentral", risk: "Urgent clinical concerns routed to administrative staff",
        stack: [{ name: "8x8", role: "UCaaS/CCaaS", why: "Unified communications and contact center for mid-size home health agencies. Mobile app keeps field clinicians connected to the office. Right-sized for 20-100 agent operations.", href: "/vendors" }],
        pitfall: "Home health contact centers receive calls from patients, family members, referring physicians, hospital discharge planners, insurance companies, and field clinicians — all on the same number. Without caller identification and routing, a discharge planner with a time-sensitive referral waits behind a family member asking about tomorrow's visit schedule. Implement dedicated lines or IVR paths for referral sources and clinical staff."
      },
      { layer: 5, name: "Conversation Management", capabilities: ["Family/caregiver communication updates on visit schedule and care plan","Clinician-to-office messaging for real-time visit updates","Patient education materials delivered via simple channels (SMS, print)","Visit confirmation and preparation reminders","Telehealth integration for virtual check-ins between in-person visits"], vendors: "CarePort, WellSky, Forcura", risk: "Family caregivers not receiving updates and calling repeatedly for status",
        stack: [{ name: "Forcura", role: "Healthcare Communications", why: "Referral and document management for post-acute care. Streamlines the intake process and clinician communication. Reduces fax-based workflows.", href: "/vendors" }],
        pitfall: "Family caregivers — often adult children managing a parent's care — are the most frequent callers to home health contact centers. They call because they don't have visibility into the care schedule or care plan. Proactive communication to family caregivers (visit confirmations, clinician notes summaries, care plan updates) reduces call volume by 30-40%. But most home health agencies don't have the family caregiver's contact info in a structured field — it's buried in clinical notes."
      },
      { layer: 4, name: "Reasoning & Planning", capabilities: ["Visit schedule lookup and confirmation bots","Supply reorder bots for recurring medical supplies","New patient referral intake bots collecting required information","FAQ bots for agency services, coverage, and intake requirements","Post-visit satisfaction survey bots"], vendors: "Ada, basic IVR automation", risk: "Bots frustrating elderly patients who need simple, patient human interaction",
        stack: [{ name: "Simple IVR + SMS", role: "Basic Automation", why: "Home health patients are predominantly elderly. Complex bots frustrate them. Simple IVR confirmations ('press 1 to confirm your visit tomorrow at 2pm') and SMS reminders are the right level of automation for this population.", href: "/vendors" }],
        pitfall: "The instinct to deploy conversational AI in home health is strong but misguided for most interactions. The patient population is elderly, often cognitively impaired, and unfamiliar with technology. A bot that asks 'how can I help you today?' gets silence or confusion. Deploy automation for outbound tasks (visit reminders, supply reorders) and keep inbound interactions human-staffed. The containment target for home health should be 10-15%, not 40%."
      },
      { layer: 3, name: "Policy & Guardrails", capabilities: ["HIPAA compliance for patient and family communications","CMS Conditions of Participation compliance monitoring","State home health licensure and aide certification tracking","Informed consent for telehealth and remote monitoring","Incident reporting workflow for patient safety events"], vendors: "Compliancy Group, WellSky", risk: "CMS survey deficiencies from documentation gaps in contact center interactions",
        stack: [{ name: "Compliancy Group", role: "HIPAA Compliance", why: "HIPAA compliance management for home health agencies. Training, risk assessments, and BAA management. Especially important as agencies add digital communication channels.", href: "/vendors" }],
        pitfall: "Home health agencies often communicate patient information with family caregivers who are not the legal healthcare proxy. HIPAA allows sharing with 'involved family members' under certain conditions, but the rules are nuanced. Train agents on when they can and cannot share PHI with family callers — and document the patient's consent for family communication in a structured field, not a free-text note."
      },
      { layer: 2, name: "Workflow Execution", capabilities: ["New patient referral intake and admission workflow","Visit scheduling and clinician assignment workflow","Authorization tracking and re-authorization request workflow","Supply ordering and delivery coordination workflow","Discharge planning and care transition workflow"], vendors: "WellSky, MatrixCare, Axxess, Homecare Homebase", risk: "Authorization expiration causing visit interruptions",
        stack: [{ name: "WellSky (Kinnser)", role: "Home Health Platform", why: "End-to-end home health operations — referral intake, scheduling, clinical documentation, and billing. The operational backbone that the contact center integrates with.", href: "/vendors" }, { name: "Axxess", role: "Home Health Software", why: "Cloud-based home health platform growing in mid-market agencies. Scheduling, clinical documentation, and billing. Modern interface compared to legacy systems.", href: "/vendors" }],
        pitfall: "Authorization management is the most operationally critical workflow in home health. Insurance authorizes 20 visits; the agency schedules them; the authorization expires before all visits are completed; the patient's care is interrupted while re-authorization is processed. Your workflow engine must track authorization utilization and trigger re-auth requests at 70-80% utilization — not after the authorization expires."
      },
      { layer: 1, name: "Data Access", capabilities: ["Home health EMR integration (WellSky, MatrixCare, Homecare Homebase)","Referral source systems (hospital discharge planning, physician offices)","Insurance authorization and eligibility systems","Supply management and DME ordering systems","Clinician scheduling and mobile workforce management"], vendors: "WellSky, MatrixCare, Axxess, Homecare Homebase", risk: "Field clinician data entered on mobile devices not syncing to office systems in real-time",
        stack: [{ name: "WellSky/Kinnser", role: "Home Health EMR", why: "Clinical documentation, scheduling, and billing. Field clinicians document at the point of care; office staff need real-time visibility into visit completion and patient status.", href: "/vendors" }, { name: "MatrixCare", role: "Home Health EMR", why: "Strong in skilled nursing and home health. Post-acute care-specific workflows. Integration with hospital referral systems for streamlined admissions.", href: "/vendors" }],
        pitfall: "Home health operates with a split workforce — office staff managing the contact center and field clinicians delivering care. Data sync between mobile EMR (used by clinicians in the home) and office systems is often delayed by hours. When a family member calls asking 'did the nurse come today?', the agent may not see the visit documented yet because the clinician hasn't synced. Push for real-time or near-real-time mobile sync, or set caller expectations that visit confirmation may be delayed."
      },
    ],
  },
};

export const getHCSubVertical = (slug) => hcSubVerticals[slug];
export const getAllHCSubVerticalSlugs = () => Object.keys(hcSubVerticals);
