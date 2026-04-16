// Financial Services Sub-Vertical CX Stack Frameworks
// 7 sub-verticals × 7 layers × vendor stacks with "why" and integration pitfalls

export const fsSubVerticals = {
  "retail-banking": {
    name: "Retail Banking", parent: "Financial Services",
    tagline: "Account servicing, fraud alerts, card disputes, loan inquiries, and branch-to-digital migration.",
    intro: "Retail banking contact centers handle the broadest channel mix and highest volume of any financial services sub-vertical. The CX challenge is balancing transactional speed (balance checks, card activations) with consultative depth (mortgage inquiries, wealth referrals) while maintaining compliance across every interaction.",
    kpis: [
      { metric: "AHT", avg: "5:40", note: "Driven down by transactional volume; complex inquiries skew higher" },
      { metric: "FCR", avg: "72%", note: "Authentication and multi-system lookups reduce first-contact resolution" },
      { metric: "CSAT", avg: "79%", note: "Higher than healthcare but below retail; trust expectations are demanding" },
      { metric: "Containment", avg: "28%", note: "Balance checks and card activations are highly automatable" },
    ],
    layers: [
      { layer: 7, name: "Analytics & Governance",
        capabilities: ["CSAT and NPS tracking segmented by product line (deposits, lending, cards)","Compliance recording with automated audit trail for regulatory review","Agent quality scoring calibrated for transactional vs consultative interactions","Fraud interaction analytics — pattern detection across channels","Branch-to-digital handoff tracking and attribution"],
        vendors: "NICE Nexidia, Verint, CallMiner, Qualtrics", risk: "Regulatory audit failures if recording and QA gaps exist",
        stack: [
          { name: "NICE Nexidia", role: "Interaction Analytics", why: "Deepest speech and text analytics for banking. Automated compliance scoring, sentiment detection, and root-cause analysis across millions of interactions. Proven in Tier 1 banks.", href: "/vendors/analytics" },
          { name: "Verint", role: "WEM & QA", why: "Enterprise-grade workforce engagement with QA scoring calibrated for regulated environments. Strong desktop analytics showing agent workflow friction.", href: "/vendors/analytics" },
          { name: "CallMiner", role: "Speech Analytics", why: "Purpose-built conversation intelligence with banking compliance models. Automated redaction of PCI data in recordings.", href: "/vendors/analytics" },
          { name: "Qualtrics XM", role: "VoC Platform", why: "Closes the loop between interaction analytics and customer feedback. Product-line segmentation for deposits, lending, and cards.", href: "/vendors/analytics" },
        ],
        pitfall: "Recording platforms and analytics platforms are separate procurement decisions. Banks often buy NICE for recording but Verint for analytics — creating data silos where compliance recordings can't be analyzed without ETL pipelines that add 24-48 hours of latency. Choose a unified stack or budget for real-time integration."
      },
      { layer: 6, name: "Routing & Orchestration",
        capabilities: ["Intent-based routing separating fraud, service, sales, and retention","VIP and relationship-tier routing for wealth referrals and priority clients","Skills-based routing for licensed representatives (Series 6/7, insurance)","Overflow logic for branch closures and storm events","Callback and scheduled appointment routing for complex consultations"],
        vendors: "Genesys, NICE CXone, Five9, Talkdesk FS", risk: "Fraud and service sharing a queue creates response time risk",
        stack: [
          { name: "Genesys Cloud", role: "Primary CCaaS", why: "Most mature intent-based routing in the market. Predictive routing uses AI to match customer intent with best-fit agent. Proven at scale in top 10 U.S. banks.", href: "/vendors/genesys" },
          { name: "NICE CXone", role: "Primary CCaaS", why: "Strongest combined routing + WEM. Native workforce management means routing decisions account for agent skills, schedule, and quality scores simultaneously.", href: "/vendors/nice-cxone" },
          { name: "Talkdesk Financial Services", role: "Vertical CCaaS", why: "Pre-built banking routing flows — fraud, service, sales — reduce implementation time. Purpose-built for mid-market banks that need depth without Genesys complexity.", href: "/vendors/talkdesk" },
        ],
        pitfall: "Intent-based routing requires intent data. Most banks deploy 'intent routing' that is actually skills-based routing with renamed queues. True intent routing needs NLU analysis of the customer's reason for contact before the routing decision — which means your IVR or digital front door must classify intent, not just collect account numbers."
      },
      { layer: 5, name: "Conversation Management",
        capabilities: ["Secure messaging for account-sensitive communications (statements, disputes)","Co-browsing for online banking navigation and application assistance","Chat with PII redaction for card numbers and SSN","Video banking for advisory consultations and complex product discussions","Proactive notifications for fraud alerts, payment reminders, and rate changes"],
        vendors: "Glia, Unblu, LivePerson, Ada", risk: "Unsecured chat channels for sensitive banking data",
        stack: [
          { name: "Glia", role: "Digital Customer Service", why: "Built specifically for financial services. Secure co-browsing, video, and chat in a single platform with bank-grade encryption. Integrates with online banking sessions so agents see what the customer sees.", href: "/vendors/digital-engagement" },
          { name: "Unblu", role: "Secure Collaboration", why: "European-origin platform with strong data sovereignty controls. Document sharing with e-signature, co-browsing without screen sharing risks, and compliance archival built in.", href: "/vendors/digital-engagement" },
          { name: "LivePerson", role: "Conversational AI + Messaging", why: "Largest conversational AI deployment in banking. Async messaging lets customers continue conversations across sessions. Strong Apple Business Chat and WhatsApp integrations.", href: "/vendors/digital-engagement" },
        ],
        pitfall: "Co-browsing and screen sharing sound identical but are fundamentally different in a banking context. Screen sharing exposes the agent's view of back-office systems to the customer. Co-browsing lets the agent see and guide the customer's view. Deploying screen sharing when you meant co-browsing creates data exposure risk. Glia and Unblu solve this correctly; generic tools often don't."
      },
      { layer: 4, name: "Reasoning & Planning",
        capabilities: ["Balance inquiry and transaction lookup bots with real-time core banking data","Card activation, replacement, and PIN reset automation","Loan application status bots with document checklist logic","Product recommendation AI based on account profile and life events","Fraud alert response bots with immediate card freeze capability"],
        vendors: "Kasisto, Cognigy, Kore.ai, Google CCAI", risk: "AI handling financial advice without licensed-representative guardrails",
        stack: [
          { name: "Kasisto (KAI)", role: "Banking AI Assistant", why: "The only conversational AI built exclusively for banking. Pre-trained on banking intents (balance, transactions, payments, card management). Deployed at JP Morgan, Westpac, and Standard Chartered.", href: "/vendors/iva" },
          { name: "Kore.ai", role: "Enterprise IVA", why: "Strong pre-built banking bots with deep core banking integration. Handles complex multi-turn conversations (dispute filing, loan status with conditions). Good mid-market to enterprise fit.", href: "/vendors/iva" },
          { name: "Google CCAI", role: "AI Platform", why: "Dialogflow CX provides the NLU layer; Agent Assist provides real-time guidance. Best for banks with Google Cloud infrastructure and engineering teams that want to build custom.", href: "/vendors/iva" },
        ],
        pitfall: "Banking bots need real-time core banking data to be useful. A bot that says 'I'll check your balance' and then responds with yesterday's batch data destroys trust instantly. Most IVA vendors demo with mock data — demand a proof of concept with your actual core banking API before signing. Kasisto's advantage is pre-built core banking connectors; generic IVA platforms require custom integration that typically takes 3-6 months."
      },
      { layer: 3, name: "Policy & Guardrails",
        capabilities: ["KYC/AML identity verification integrated into every interaction","PCI DSS compliance for card data in voice and digital channels","Reg E dispute handling with required disclosure and timeline tracking","TCPA consent management for outbound communications","State-specific licensing validation for product recommendations"],
        vendors: "Pindrop, BioCatch, LexisNexis Risk, Nuance", risk: "Non-compliant disclosures creating regulatory exposure",
        stack: [
          { name: "Pindrop", role: "Voice Authentication & Fraud", why: "Passive voice authentication eliminates 'mother's maiden name' security questions. Analyzes 1,300+ audio features to detect spoofed calls and social engineering. Reduces AHT by 30-45 seconds per authenticated call.", href: "/vendors/acd-routing" },
          { name: "BioCatch", role: "Behavioral Biometrics", why: "Detects fraud by analyzing how users interact with digital channels — typing patterns, mouse movements, device handling. Catches account takeover that traditional auth misses.", href: "/vendors/acd-routing" },
          { name: "LexisNexis Risk Solutions", role: "Identity Verification", why: "ThreatMetrix provides device intelligence and digital identity verification. Cross-references thousands of identity attributes in real-time during account opening and high-risk transactions." },
          { name: "Nuance (Microsoft)", role: "Voice Biometrics", why: "Gatekeeper voice biometrics for passive enrollment and verification. Large installed base in banking. Now part of Microsoft's cloud ecosystem.", href: "/vendors/iva" },
        ],
        pitfall: "Voice biometrics vendors sell 'frictionless authentication' — but enrollment is the friction they don't mention. Pindrop and Nuance both require 20-30 seconds of speech to build a voiceprint, which means the first 3-5 calls from every customer still use knowledge-based authentication. Plan for a 6-12 month enrollment ramp before you see the full AHT reduction."
      },
      { layer: 2, name: "Workflow Execution",
        capabilities: ["Account opening workflow with identity verification and funding steps","Dispute intake and resolution workflow with Reg E timeline enforcement","Address/profile change workflow with fraud verification triggers","Loan modification workflow with document collection and status updates","Cross-sell referral workflow routing qualified leads to specialists"],
        vendors: "Pega, MuleSoft, Workato, UiPath", risk: "Manual handoffs between workflows creating data loss",
        stack: [
          { name: "Pega", role: "Process Orchestration", why: "Enterprise-grade decisioning and case management built for banking. Automates Reg E dispute timelines, account opening workflows, and cross-sell next-best-action. Deployed at the largest global banks.", href: "/vendors/acd-routing" },
          { name: "MuleSoft", role: "Integration Platform", why: "Anypoint Platform connects core banking, card systems, and CRM without point-to-point spaghetti. Pre-built banking accelerators reduce integration timelines. Part of Salesforce ecosystem.", href: "/vendors/acd-routing" },
          { name: "UiPath", role: "RPA & Task Automation", why: "Robotic process automation for the workflows that can't be API-integrated — legacy mainframe lookups, cross-system data entry, document processing. Bridges the gap while API modernization proceeds." },
        ],
        pitfall: "Banks buy Pega for workflow orchestration but implement it as a glorified forms engine. Pega's value is dynamic decisioning — automatically escalating disputes approaching Reg E deadlines, triggering fraud holds based on velocity rules, routing cross-sell opportunities based on propensity models. If your Pega implementation is just 'fill out form, submit to queue,' you've bought a Ferrari to drive to the mailbox."
      },
      { layer: 1, name: "Data Access",
        capabilities: ["Core banking system integration (real-time balance, transactions, holds)","Card management system access (status, limits, fraud flags)","Loan origination system connectivity (application status, documents)","CRM with full relationship view (all products, interactions, lifetime value)","Knowledge base with product terms, policies, and regulatory requirements"],
        vendors: "FIS, Fiserv, Jack Henry, Temenos, Salesforce FSC", risk: "Agent desktop requiring 3+ separate logins to serve one customer",
        stack: [
          { name: "FIS", role: "Core Banking", why: "Powers more U.S. bank accounts than any other provider. Real-time APIs for Modern Banking Platform; batch interfaces for legacy cores. Your CX stack is only as good as your FIS integration.", href: "/vendors/payments" },
          { name: "Fiserv", role: "Core Banking & Payments", why: "DNA and Premier cores with growing API capabilities. Strong in mid-market banking. Clover integration creates commerce data that can enrich service interactions.", href: "/vendors/payments" },
          { name: "Salesforce Financial Services Cloud", role: "CRM & Relationship View", why: "Unified customer view across deposits, lending, wealth, and insurance. Pre-built financial data model. Action plans for onboarding, servicing, and retention workflows.", href: "/vendors/ccaas" },
          { name: "Jack Henry", role: "Core Banking (Community)", why: "Symitar and SilverLake cores serving community banks and credit unions. Symitar's API strategy is improving but still requires middleware for real-time CX integration." },
        ],
        pitfall: "The agent desktop problem is not a CCaaS problem — it's a data access problem. Banks buy Genesys or NICE expecting a 'unified desktop' but the CCaaS platform only unifies communication channels. The agent still needs FIS for balances, a card system for disputes, an LOS for loan status, and Salesforce for the relationship view. The real integration work is building a single-pane agent experience that pulls from all four — which is middleware and UI work, not CCaaS configuration."
      },
    ],
  },

  "credit-unions": {
    name: "Credit Unions", parent: "Financial Services",
    tagline: "Member-centric service with relationship depth. Smaller operations but higher trust expectations.",
    intro: "Credit union contact centers serve members who chose a relationship-first institution over a megabank. The CX expectation is personal, empathetic, and community-aware. The operational challenge is delivering that experience with smaller teams, tighter budgets, and the same regulatory requirements as banks ten times their size.",
    kpis: [
      { metric: "AHT", avg: "6:20", note: "Longer than retail banking — members expect relationship-depth conversations" },
      { metric: "FCR", avg: "75%", note: "Higher than banks — smaller product set and deeper member knowledge" },
      { metric: "CSAT", avg: "84%", note: "Consistently higher than banks — member loyalty drives satisfaction" },
      { metric: "Containment", avg: "18%", note: "Lower than banks — members prefer human interaction for trust" },
    ],
    layers: [
      { layer: 7, name: "Analytics & Governance",
        capabilities: ["Member satisfaction tracking tied to retention and share-of-wallet","Regulatory compliance recording meeting NCUA examination requirements","Quality scoring that values relationship depth alongside efficiency","Member lifecycle analytics — onboarding, engagement, and attrition signals","Peer credit union benchmarking for service level comparison"],
        vendors: "NICE, Verint, Qualtrics", risk: "Over-optimizing for efficiency at the cost of member relationship quality",
        stack: [
          { name: "NICE CXone", role: "Recording & QA", why: "Scalable recording and quality management that right-sizes for credit union budgets. Cloud-native means no on-premise infrastructure investment.", href: "/vendors/nice-cxone" },
          { name: "Qualtrics XM", role: "Member Feedback", why: "Post-interaction surveys connected to member relationship data. Identifies at-risk members before they leave.", href: "/vendors/analytics" },
        ],
        pitfall: "Credit unions often buy analytics tools sized for banks and then underutilize 80% of the features. A 50-agent CU doesn't need the same analytics depth as Chase. Start with recording, basic QA scoring, and member satisfaction tracking — add speech analytics only when you have the staff to act on the insights."
      },
      { layer: 6, name: "Routing & Orchestration",
        capabilities: ["Relationship-aware routing matching members to their preferred representative","Small-team queue management balancing coverage with personalization","After-hours routing to shared service cooperatives or answering services","Escalation paths that keep members within the credit union ecosystem","Branch-to-contact-center warm transfer with full context"],
        vendors: "Genesys, NICE CXone, Cisco, 8x8", risk: "Small team size creating single-point-of-failure for specialized queries",
        stack: [
          { name: "NICE CXone", role: "Primary CCaaS", why: "Right-sized for credit union operations. Modular packaging lets CUs start with core routing and add WEM and analytics as they grow.", href: "/vendors/nice-cxone" },
          { name: "8x8", role: "UCaaS/CCaaS", why: "Unified communications and contact center on one platform. Ideal for CUs where branch staff and contact center agents need to collaborate seamlessly.", href: "/vendors" },
        ],
        pitfall: "Credit unions with 10-30 agents often choose platforms based on price alone and end up on systems that can't do skills-based routing. When your team is small, every routing decision matters more — sending a lending question to a deposit specialist wastes the only lending expert's availability. Pay for routing intelligence even if the seat count is low."
      },
      { layer: 5, name: "Conversation Management",
        capabilities: ["Secure messaging for loan applications and account servicing","Video banking connecting remote members with in-branch specialists","Community-aware chat reflecting credit union brand voice and values","Mobile app messaging integrated with online banking platform","Proactive outreach for rate changes, dividend notices, and community events"],
        vendors: "Glia, Unblu, POPi/o, Ada", risk: "Digital channels feeling impersonal in a relationship-first institution",
        stack: [
          { name: "Glia", role: "Digital Member Service", why: "Strong credit union customer base. Integrates with online/mobile banking sessions. Video, co-browsing, and chat with the security controls CUs need.", href: "/vendors/digital-engagement" },
          { name: "POPi/o", role: "Video Banking", why: "Purpose-built video banking for credit unions. Connects remote members with in-branch specialists for mortgage, wealth, and complex needs. Maintains the relationship feel.", href: "/vendors/digital-engagement" },
        ],
        pitfall: "Credit unions add digital channels to 'keep up with banks' but staff them with the same agents who handle phones, with no training on written communication. Chat and messaging require different skills than voice — shorter responses, faster pace, concurrent conversations. Either hire for digital skills or invest in serious training before launching."
      },
      { layer: 4, name: "Reasoning & Planning",
        capabilities: ["Balance and transaction bots sized for credit union core banking systems","Loan pre-qualification AI with member-specific rate calculation","Payment and transfer automation with share account logic","FAQ bots covering credit union-specific products (share certificates, SEGs)","After-hours self-service for card management and basic inquiries"],
        vendors: "Kasisto, Cognigy, Google CCAI", risk: "Bot interactions undermining the personal touch members expect",
        stack: [
          { name: "Kasisto (KAI)", role: "Banking AI", why: "Pre-trained on banking intents including credit union-specific terminology (shares, dividends, SEGs). Can be deployed at a scope appropriate for credit union budgets.", href: "/vendors/iva" },
          { name: "Ada", role: "AI Customer Service", why: "No-code bot builder that CU staff can manage without engineering resources. Pre-built financial services content. Good for after-hours self-service and FAQ automation.", href: "/vendors/iva" },
        ],
        pitfall: "Members chose a credit union because they don't want to talk to a bot. Deploy AI for the interactions members don't want to wait for (balance checks at 11pm, card freezes during fraud) — not for the interactions where they want a human (loan advice, financial hardship). The containment rate target for a CU should be 15-25%, not the 40%+ that fintechs chase."
      },
      { layer: 3, name: "Policy & Guardrails",
        capabilities: ["NCUA regulatory compliance controls and examination readiness","BSA/AML monitoring integration for suspicious activity reporting","Member authentication meeting FFIEC guidance for digital channels","TCPA compliance for outbound member communications","Share insurance disclosure requirements in automated interactions"],
        vendors: "Pindrop, LexisNexis, Verafin", risk: "Regulatory gaps due to smaller compliance teams",
        stack: [
          { name: "Verafin (Nasdaq)", role: "BSA/AML & Fraud", why: "Built specifically for credit unions and community banks. Cloud-based BSA/AML and fraud detection sized for mid-market. Strong NCUA examiner familiarity.", href: "/vendors" },
          { name: "Pindrop", role: "Voice Authentication", why: "Passive voice authentication reduces KBA friction. Even small CUs benefit from eliminating 'what's your mother's maiden name' — it saves 30-45 seconds per call.", href: "/vendors/acd-routing" },
        ],
        pitfall: "Credit unions share compliance obligations with megabanks but have 1/100th the compliance staff. Verafin and similar platforms solve this by automating SAR filing and transaction monitoring — but only if the CU actually integrates them with the contact center. Most CUs run compliance systems and contact center systems in parallel with no data flow between them."
      },
      { layer: 2, name: "Workflow Execution",
        capabilities: ["New member onboarding workflow with account funding and card issuance","Loan application workflow sized for credit union approval processes","Dispute resolution workflow meeting NCUA timeline requirements","Membership eligibility verification workflow for SEG-based credit unions","Deceased member account handling with required notifications"],
        vendors: "Symitar workflows, MuleSoft, UiPath", risk: "Manual processes surviving because 'we've always done it this way'",
        stack: [
          { name: "MeridianLink", role: "Loan Origination", why: "Most widely deployed LOS in credit unions. Digital lending workflow from application through decisioning. Integrates with Symitar and other CU cores.", href: "/vendors" },
          { name: "Alkami", role: "Digital Banking", why: "Digital banking platform purpose-built for credit unions. Member-facing workflows for account opening, transfers, and servicing that reduce contact center volume.", href: "/vendors" },
        ],
        pitfall: "Credit unions often automate new workflows while leaving legacy manual processes untouched. The result: new members get a slick digital onboarding experience, but existing members still call to do a wire transfer because that workflow was never digitized. Audit your top 10 call drivers and automate backwards from contact volume, not forwards from what's easiest to build."
      },
      { layer: 1, name: "Data Access",
        capabilities: ["Core system integration (Symitar, Corelation, DNA, CU*BASE)","Card processing system connectivity (PSCU, CO-OP, Visa DPS)","Loan origination system access for application status and decisions","Online/mobile banking platform integration for session continuity","Member relationship view spanning all share and loan accounts"],
        vendors: "Symitar (Jack Henry), Corelation, CU*Answers, CUNA Mutual", risk: "Legacy core systems with limited API capability",
        stack: [
          { name: "Jack Henry (Symitar)", role: "Core Banking", why: "Powers the majority of U.S. credit unions over $500M in assets. Growing API ecosystem through Banno. Your CX stack's ceiling is set by how well you integrate with Symitar.", href: "/vendors" },
          { name: "Corelation (KeyStone)", role: "Core Banking", why: "Modern API-first core gaining market share with progressive credit unions. Easier to integrate with CX platforms than legacy cores. Strong for CUs planning digital transformation.", href: "/vendors" },
          { name: "PSCU/Co-Op Solutions", role: "Card Processing", why: "Credit union-owned card processing cooperatives. Provide debit/credit card management, fraud detection, and member reward programs. Integration with the CX stack enables real-time card status in the agent desktop.", href: "/vendors" },
        ],
        pitfall: "Symitar's Banno platform is modernizing the API layer, but most CU implementations still rely on SymXchange or PowerOn, which are batch-oriented. If your contact center integration with Symitar only refreshes member data nightly, your agents are working with stale information every morning. Push for real-time API access or accept that your CX tools will always be 12 hours behind your core."
      },
    ],
  },

  "insurance": {
    name: "Insurance (P&C, Life, Health)", parent: "Financial Services",
    tagline: "Claims, policy servicing, renewals, FNOL, underwriting support, and high-emotion journeys.",
    intro: "Insurance contact centers operate at the intersection of complex policy logic, emotionally charged claims interactions, and regulatory compliance that varies by state and line of business. The CX challenge is guiding policyholders through processes they rarely understand, at moments when they are often distressed, while maintaining the accuracy that prevents E&O exposure.",
    kpis: [
      { metric: "AHT", avg: "9:00", note: "Longest in FS — claims and policy changes require detailed documentation" },
      { metric: "FCR", avg: "65%", note: "Below average — multi-party coordination prevents single-call resolution" },
      { metric: "CSAT", avg: "77%", note: "Driven by claims experience — fast FNOL and transparency improve satisfaction" },
      { metric: "Containment", avg: "12%", note: "Very low — policy complexity and emotional stakes limit automation" },
    ],
    layers: [
      { layer: 7, name: "Analytics & Governance",
        capabilities: ["Claims cycle time analytics by line of business and adjuster","Policyholder sentiment tracking across the claims lifecycle","State-specific compliance monitoring for disclosures and timelines","Agent E&O risk scoring based on interaction quality audits","Retention analytics linking service quality to policy renewal rates"],
        vendors: "NICE, Verint, Qualtrics, Medallia", risk: "Claims handling errors creating E&O exposure",
        stack: [
          { name: "NICE Nexidia", role: "Interaction Analytics", why: "Automated compliance scoring for claims interactions. Detects missing disclosures, incorrect coverage statements, and timeline violations before they become regulatory issues.", href: "/vendors/analytics" },
          { name: "Medallia", role: "Experience Platform", why: "Policyholder journey analytics across claims lifecycle. Identifies where satisfaction drops — typically at FNOL handoff, adjuster assignment delay, and settlement communication.", href: "/vendors/analytics" },
        ],
        pitfall: "Insurance analytics must distinguish between service interactions and claims interactions. Applying the same QA scorecard to a billing inquiry and an FNOL intake is meaningless. Build separate scorecards — service interactions optimize for speed and accuracy; claims interactions optimize for empathy, completeness, and compliance."
      },
      { layer: 6, name: "Routing & Orchestration",
        capabilities: ["FNOL priority routing with catastrophe-event surge protocols","Line-of-business routing (P&C, life, health, commercial)","Licensed agent routing for policy binding and coverage advice","Catastrophe event routing with geographic and peril-based triage","Adjuster-to-policyholder callback scheduling and warm transfer"],
        vendors: "Genesys, NICE CXone, Talkdesk Insurance", risk: "Catastrophe events overwhelming capacity without surge routing",
        stack: [
          { name: "Genesys Cloud", role: "Primary CCaaS", why: "Predictive routing matches policyholders with agents by line of business, state licensure, and claims expertise. Surge capacity scaling for catastrophe events without pre-provisioning.", href: "/vendors/genesys" },
          { name: "Talkdesk Insurance", role: "Vertical CCaaS", why: "Pre-built insurance workflows for FNOL, claims status, and policy servicing. Faster time to value than building insurance-specific routing on a generic platform.", href: "/vendors/talkdesk" },
        ],
        pitfall: "Catastrophe routing is not a feature you configure and forget — it requires a playbook. When a hurricane hits, your contact center needs to: activate surge agents, deploy geo-targeted IVR messaging, route affected policyholders to dedicated queues, and suppress non-urgent outbound communications. Most carriers discover their CAT routing doesn't work during the actual event."
      },
      { layer: 5, name: "Conversation Management",
        capabilities: ["Secure document upload for claims photos, receipts, and police reports","Video damage assessment for property and auto claims","Proactive claims status notifications at each milestone","Empathy-scripted messaging for total loss and denial communications","Agent-to-adjuster collaboration tools within the interaction"],
        vendors: "Glia, LivePerson, Sprinklr, Unblu", risk: "Impersonal automated messages during high-emotion claims moments",
        stack: [
          { name: "Glia", role: "Digital Customer Service", why: "Secure document and photo upload integrated into the conversation. Policyholder uploads damage photos during a chat or video call; agent and adjuster see them immediately.", href: "/vendors/digital-engagement" },
          { name: "Hi Marley", role: "Insurance Messaging", why: "Purpose-built SMS and messaging for insurance. Two-way texting for claims updates, document requests, and adjuster coordination. Built by insurance people for insurance workflows.", href: "/vendors/digital-engagement" },
        ],
        pitfall: "Automating claims status notifications sounds simple but is politically complex inside a carrier. Claims teams resist automation because they want to control the message — especially for denials and adverse decisions. The result: proactive happy-path notifications go live (claim received, adjuster assigned) but the high-impact communications (denial, total loss) remain manual and delayed. Solve the political problem before the technical one."
      },
      { layer: 4, name: "Reasoning & Planning",
        capabilities: ["FNOL intake bots collecting required information by peril type","Policy lookup and coverage verification automation","Claims status bots with adjuster assignment and timeline visibility","Premium payment and billing inquiry automation","Renewal quote comparison bots for retention offers"],
        vendors: "Cognigy, Kore.ai, EIS AI, Duck Creek AI", risk: "Bot handling coverage questions without licensed-agent oversight",
        stack: [
          { name: "Cognigy", role: "Conversational AI", why: "Enterprise-grade IVA with insurance pre-built intents. Handles FNOL data collection, claims status, and billing. Strong integration with Guidewire and Duck Creek.", href: "/vendors/iva" },
          { name: "Kore.ai", role: "Enterprise IVA", why: "Deep insurance domain coverage including P&C, life, and health intents. Handles multi-turn FNOL conversations that require peril-specific data collection (auto vs property vs liability).", href: "/vendors/iva" },
        ],
        pitfall: "FNOL bots must collect different data for different perils. An auto FNOL needs vehicle information, other party details, and police report number. A property FNOL needs damage description, temporary housing needs, and mitigation status. Generic 'tell us what happened' bots miss required fields, creating adjuster callback loops. Build peril-specific FNOL flows, not one generic intake."
      },
      { layer: 3, name: "Policy & Guardrails",
        capabilities: ["State DOI compliance controls for claims handling timelines","Unfair claims practices act adherence monitoring","Recorded statement protocols with required disclosures","Anti-fraud detection integrated into FNOL and claims workflows","E&O risk controls requiring supervisor review for coverage determinations"],
        vendors: "Verisk, LexisNexis, SAS, Shift Technology", risk: "State-specific timeline violations triggering regulatory penalties",
        stack: [
          { name: "Shift Technology", role: "AI Fraud Detection", why: "Purpose-built claims fraud detection using AI. Analyzes FNOL data, claimant history, and external data in real-time. Flags suspicious claims for SIU before adjuster assignment.", href: "/vendors" },
          { name: "Verisk", role: "Data & Analytics", why: "ISO ClaimSearch and property data for loss verification. Industry-standard fraud detection scores. Integrates with Guidewire for automated validation during FNOL.", href: "/vendors" },
        ],
        pitfall: "Claims handling timelines vary by state — California requires acknowledgment within 15 days, Texas within 15 business days, Florida within 14 days. Your claims workflow must enforce state-specific SLAs, not a single national standard. Most carriers discover they're out of compliance in specific states because their workflow engine treats all states the same."
      },
      { layer: 2, name: "Workflow Execution",
        capabilities: ["FNOL workflow with peril-specific data collection requirements","Claims assignment workflow routing to available adjuster by specialization","Subrogation tracking workflow with third-party coordination","Policy endorsement workflow with premium recalculation triggers","Renewal retention workflow with competitive rate comparison and save offers"],
        vendors: "Guidewire, Duck Creek, Majesco, Pega", risk: "Paper-based processes surviving in a digital-first world",
        stack: [
          { name: "Guidewire", role: "Core Insurance Platform", why: "Industry-standard claims management (ClaimCenter), policy admin (PolicyCenter), and billing (BillingCenter). Cloud-native Guidewire Cloud is the target platform for most P&C digital transformations.", href: "/vendors" },
          { name: "Duck Creek", role: "Core Insurance Platform", why: "SaaS-native alternative to Guidewire. Strong in mid-market carriers and MGAs. Faster implementation timeline. Growing API ecosystem for CX integration.", href: "/vendors" },
        ],
        pitfall: "Guidewire and Duck Creek are not CX platforms — they are core insurance platforms. The contact center integration is an afterthought in most implementations. Budget separately for the middleware that connects your claims system to your CCaaS platform. The 'we'll integrate that later' line item is where most insurance CX projects stall."
      },
      { layer: 1, name: "Data Access",
        capabilities: ["Policy administration system integration (coverage, endorsements, billing)","Claims management system connectivity (FNOL, reserves, payments)","Agent/broker portal integration for producer-initiated service","Document management system for claims files and correspondence","Actuarial and underwriting data for real-time eligibility decisions"],
        vendors: "Guidewire, Duck Creek, Majesco, Sapiens, Socotra", risk: "Legacy policy admin systems with batch-only data updates",
        stack: [
          { name: "Guidewire InsuranceSuite", role: "Core Systems", why: "PolicyCenter + ClaimCenter + BillingCenter provide the data foundation. Real-time APIs in Cloud edition. Agent needs policy coverage, claims history, and billing status in one view.", href: "/vendors" },
          { name: "Salesforce Financial Services Cloud", role: "CRM", why: "Policyholder relationship view across all lines of business. Action plans for renewals, claims follow-up, and retention. Connects the CX layer to the core insurance layer.", href: "/vendors/ccaas" },
          { name: "OnBase / Hyland", role: "Document Management", why: "Claims file management with version control, annotation, and workflow. Agents need to pull up the police report, damage photos, and adjuster notes without leaving the interaction.", href: "/vendors" },
        ],
        pitfall: "Insurance is the most document-heavy financial services vertical. A single auto claim generates 15-30 documents (FNOL, police report, photos, estimates, medical records, rental receipts). If your agent desktop can't surface these documents within the interaction — if the agent has to 'let me look that up and call you back' — your FCR will never exceed 60%. Document access is not a nice-to-have; it's the FCR bottleneck."
      },
    ],
  },

  "wealth-management": {
    name: "Wealth Management & Advisory", parent: "Financial Services",
    tagline: "Portfolio inquiries, advisor scheduling, compliance-sensitive communications, and high-value retention.",
    intro: "Wealth management contact centers serve clients whose relationship value can exceed seven figures. Every interaction carries revenue risk. The CX challenge is providing white-glove service with institutional-grade compliance — personalized enough to feel bespoke, governed enough to satisfy regulators.",
    kpis: [
      { metric: "AHT", avg: "11:00", note: "Longest sub-vertical — complex portfolio discussions and compliance requirements" },
      { metric: "FCR", avg: "78%", note: "Higher — dedicated advisors reduce handoff friction" },
      { metric: "CSAT", avg: "85%", note: "Highest in FS — high-touch service model with relationship continuity" },
      { metric: "Containment", avg: "8%", note: "Lowest in FS — clients expect human interaction for financial decisions" },
    ],
    layers: [
      { layer: 7, name: "Analytics & Governance",
        capabilities: ["Client satisfaction tracking tied to AUM retention and wallet share","Compliance surveillance for suitability and best-interest obligations","Advisor performance analytics with client outcome correlation","Client lifecycle analytics — onboarding, engagement, and attrition risk","Regulatory examination readiness dashboards"],
        vendors: "NICE, Verint, Smarsh, Global Relay", risk: "Surveillance gaps creating SEC/FINRA examination exposure",
        stack: [
          { name: "Smarsh", role: "Communications Archival", why: "Archives every communication channel — email, chat, SMS, social, voice — for SEC 17a-4 and FINRA 3110 compliance. Lexicon-based monitoring flags potential violations before regulators find them.", href: "/vendors" },
          { name: "Global Relay", role: "Compliance Archival", why: "Alternative to Smarsh with strong presence in wealth management. Captures Bloomberg, Symphony, and WhatsApp alongside traditional channels. Immutable archival for examination readiness.", href: "/vendors" },
          { name: "NICE Actimize", role: "Compliance Surveillance", why: "Trade surveillance, communications monitoring, and employee compliance in one platform. Detects insider trading patterns, churning, and unsuitable recommendations.", href: "/vendors" },
        ],
        pitfall: "Wealth management firms archive emails and calls but forget to archive LinkedIn messages, personal texts, and WhatsApp conversations between advisors and clients. SEC enforcement actions increasingly cite unmonitored communication channels. Your archival strategy must cover every channel advisors actually use — not just the channels you wish they'd use."
      },
      { layer: 6, name: "Routing & Orchestration",
        capabilities: ["Named-advisor routing connecting clients to their dedicated relationship manager","Licensed representative routing for trading, options, and margin inquiries","Escalation to compliance for complex suitability questions","After-hours routing to qualified backup advisors with client context","Priority routing for high-AUM clients and significant market events"],
        vendors: "Genesys, NICE CXone, Cisco", risk: "Client reaching an unlicensed representative for investment questions",
        stack: [
          { name: "Genesys Cloud", role: "Primary CCaaS", why: "Named-advisor routing ensures high-AUM clients reach their dedicated relationship manager. Predictive routing can factor in client value, tenure, and issue complexity.", href: "/vendors/genesys" },
          { name: "Cisco Webex CC", role: "UCaaS/CCaaS", why: "Strong in firms with existing Cisco infrastructure. Unified communications means advisors can escalate to portfolio managers or compliance via the same platform.", href: "/vendors/cisco" },
        ],
        pitfall: "Named-advisor routing fails when the advisor is unavailable — which happens 40-60% of the time (meetings, PTO, after-hours). The backup routing logic matters more than the primary. If a $5M client's advisor is out and they reach a general service representative who can't discuss their portfolio, you've damaged a relationship worth more than your entire CCaaS contract."
      },
      { layer: 5, name: "Conversation Management",
        capabilities: ["Secure client portal messaging with document sharing and e-signature","Video conferencing for portfolio reviews and financial planning sessions","Screen sharing for platform navigation and trade execution guidance","Compliant SMS and messaging with archival and supervision","Proactive market event communications and portfolio impact notifications"],
        vendors: "Glia, Unblu, Zoom, Symphony", risk: "Unarchived communications creating compliance violations",
        stack: [
          { name: "Unblu", role: "Secure Collaboration", why: "Purpose-built for wealth management. Compliant co-browsing lets advisors walk clients through portfolio dashboards. Document sharing with audit trail. Video with recording and archival.", href: "/vendors/digital-engagement" },
          { name: "Symphony", role: "Compliant Messaging", why: "Built for financial services messaging. End-to-end encryption with compliance archival. Used by the largest asset managers and banks for inter-firm and client communication.", href: "/vendors" },
          { name: "Zoom (for Financial Services)", role: "Video Platform", why: "Zoom for Financial Services includes compliant recording, archival integration, and DLP. Clients already know Zoom. The compliance wrapper makes it viable for regulated environments.", href: "/vendors" },
        ],
        pitfall: "Wealth management firms deploy video for 'client reviews' but don't integrate recording with their archival platform. A quarterly portfolio review on Zoom that isn't captured by Smarsh or Global Relay is an unarchived client communication. The SEC won't care that it was a 'routine review' — they care that it wasn't archived. Wire your video platform to your archival system before the first client call."
      },
      { layer: 4, name: "Reasoning & Planning",
        capabilities: ["Account balance and position lookup bots with real-time market data","Transfer and money movement automation with compliance checks","Tax document request and delivery automation (1099, K-1)","Appointment scheduling bots for advisor consultations","Basic market data and research access bots"],
        vendors: "Kasisto, Cognigy, Salesforce Einstein", risk: "AI providing investment guidance without suitability controls",
        stack: [
          { name: "Kasisto (KAI)", role: "Wealth AI", why: "Handles account balance, position lookups, and money movement with suitability guardrails. Won't provide investment recommendations — escalates to a licensed advisor. The guardrails are the feature.", href: "/vendors/iva" },
          { name: "Salesforce Einstein", role: "Next-Best-Action", why: "Propensity models for cross-sell (insurance, lending, planning) and attrition risk scoring. Advisors see which clients are most likely to consolidate assets or leave.", href: "/vendors" },
        ],
        pitfall: "Any AI that touches investment accounts must have hard guardrails preventing investment advice. A bot that says 'based on your risk profile, you should consider reallocating to bonds' just gave investment advice without a suitability review. This is a career-ending compliance violation for the supervising principal. Your AI's most important capability is knowing what it cannot say."
      },
      { layer: 3, name: "Policy & Guardrails",
        capabilities: ["SEC/FINRA compliance controls for all client communications","Suitability and best-interest obligation enforcement at interaction level","Anti-money laundering and suspicious activity reporting integration","Communication archival meeting SEC 17a-4 and FINRA 3110 requirements","Restricted trading list enforcement during client interactions"],
        vendors: "Smarsh, Global Relay, NICE Actimize, Verint", risk: "Compliance violations from unmonitored communication channels",
        stack: [
          { name: "Smarsh", role: "Full-Stack Compliance", why: "Archival + surveillance + policy management. Monitors for restricted stock mentions, outside business activities, and client complaint patterns. The compliance backbone.", href: "/vendors" },
          { name: "NICE Actimize", role: "Trade & Comms Surveillance", why: "Connects trade data with communication data to detect insider trading, front-running, and churning. Required capability for broker-dealers.", href: "/vendors" },
        ],
        pitfall: "Wealth management compliance is not optional or deferrable. A single WhatsApp message about a stock between an advisor and client — unarchived — led to $2B+ in SEC fines across Wall Street in 2021-2023. Your compliance stack must be live before your first client interaction on any channel. There is no 'phase 2' for compliance."
      },
      { layer: 2, name: "Workflow Execution",
        capabilities: ["New account opening workflow with KYC, suitability, and funding","Account transfer (ACAT) workflow with timeline tracking and status","Beneficiary change workflow with proper documentation and verification","Required minimum distribution (RMD) workflow with tax implications","Client review preparation workflow aggregating performance and holdings"],
        vendors: "Salesforce WM, SS&C, Pega, Appian", risk: "Manual processes creating delays in time-sensitive transfers",
        stack: [
          { name: "Salesforce Financial Services Cloud", role: "CRM & Workflows", why: "Action plans for client onboarding, annual reviews, and life events. Advisor desktop with full relationship view. Workflow automation for account opening and transfers.", href: "/vendors/ccaas" },
          { name: "SS&C", role: "Portfolio Operations", why: "Advent and Black Diamond platforms handle portfolio accounting, performance reporting, and rebalancing. Integration with the CX layer means advisors see real-time portfolio data during client conversations.", href: "/vendors" },
        ],
        pitfall: "ACAT transfers (moving accounts between custodians) take 5-7 business days and are the most anxiety-producing experience for new clients. If your CX stack can't provide daily transfer status updates — automatically — your service team will spend 30-40% of their time fielding 'where are my assets?' calls during onboarding. Automate ACAT status notifications before you automate anything else."
      },
      { layer: 1, name: "Data Access",
        capabilities: ["Portfolio management system integration (holdings, performance, allocations)","Custodial platform connectivity (Schwab, Fidelity, Pershing)","Financial planning software integration (eMoney, MoneyGuidePro)","CRM with complete relationship view and interaction history","Market data feeds for real-time portfolio context during interactions"],
        vendors: "SS&C Advent, Orion, Black Diamond, Salesforce WM, Wealthbox", risk: "Advisor and service team seeing different client data",
        stack: [
          { name: "Orion", role: "Portfolio Management", why: "Comprehensive wealth management platform — portfolio accounting, reporting, trading, and planning. Growing API ecosystem connects Orion data to CX and CRM platforms.", href: "/vendors" },
          { name: "Black Diamond (SS&C)", role: "Portfolio Reporting", why: "Industry-leading portfolio performance reporting. Client-facing portal and advisor dashboard. The data source for any 'how is my portfolio doing?' interaction.", href: "/vendors" },
          { name: "eMoney Advisor", role: "Financial Planning", why: "Most widely used financial planning software. Integration means agents and advisors can reference a client's financial plan during service interactions — connecting 'I need to withdraw $50K' to 'here's how that affects your retirement timeline.'", href: "/vendors" },
        ],
        pitfall: "Wealth management has a unique 'dual desktop' problem: the advisor sees the client through Orion/Black Diamond (portfolio-centric), while the service team sees the client through the CCaaS platform (interaction-centric). Neither has the other's view. The advisor doesn't see that the client called three times last week; the service team doesn't see that the client's portfolio dropped 8%. Solve this with a shared CRM layer (Salesforce FSC or Wealthbox) that both teams use."
      },
    ],
  },

  "lending-mortgage": {
    name: "Lending & Mortgage", parent: "Financial Services",
    tagline: "Application status, document collection, rate inquiries, closing coordination, and servicing.",
    intro: "Lending and mortgage contact centers manage the most complex, longest-duration customer journeys in financial services. A single mortgage interaction can span 45-90 days from application to close, involving multiple parties, document exchanges, and regulatory milestones.",
    kpis: [
      { metric: "AHT", avg: "8:30", note: "Long — rate explanations and document requirements are complex" },
      { metric: "FCR", avg: "58%", note: "Very low — multi-party coordination prevents single-call resolution" },
      { metric: "CSAT", avg: "74%", note: "Below average — process opacity suppresses satisfaction" },
      { metric: "Containment", avg: "15%", note: "Low — borrowers want human confirmation for high-stakes decisions" },
    ],
    layers: [
      { layer: 7, name: "Analytics & Governance",
        capabilities: ["Pipeline conversion analytics from application to close","Borrower satisfaction tracking at each milestone","TRID and RESPA compliance monitoring for disclosure timelines","Agent quality scoring for rate lock explanations and fee transparency","Fall-through analysis identifying where borrowers abandon the process"],
        vendors: "NICE, Verint, Qualtrics", risk: "TRID timing violations creating regulatory and rescission risk",
        stack: [
          { name: "NICE CXone", role: "QA & Recording", why: "Compliance recording with automated TRID disclosure detection. QA scoring verifies agents provide required fee transparency and rate lock confirmations.", href: "/vendors/nice-cxone" },
          { name: "Qualtrics", role: "Borrower Feedback", why: "Milestone-triggered surveys (application, UW decision, closing) identify where the borrower experience breaks down. Post-close NPS predicts referral likelihood.", href: "/vendors/analytics" },
        ],
        pitfall: "Mortgage analytics must track the entire 45-90 day journey, not just individual interactions. A great phone call on day 15 is meaningless if the borrower's application has been in underwriting limbo for 30 days. Map analytics to pipeline milestones, not just contact center metrics."
      },
      { layer: 6, name: "Routing & Orchestration",
        capabilities: ["Pipeline-stage routing connecting borrowers to their assigned loan officer","Rate lock urgency routing during volatile market conditions","Closing coordination routing connecting borrowers with title and settlement","Retention routing for borrowers exploring refinance with competitors","After-hours routing for rate inquiries during evening research"],
        vendors: "Genesys, NICE CXone, Five9", risk: "Borrower reaching a generic agent during a rate-lock-critical window",
        stack: [
          { name: "Five9", role: "Primary CCaaS", why: "Strong mid-market to enterprise fit for lending operations. Reliable routing with Salesforce integration. Good for lenders using Salesforce as their CRM layer.", href: "/vendors/five9" },
          { name: "Genesys Cloud", role: "Enterprise CCaaS", why: "Predictive routing for high-volume lending operations. Pipeline-aware routing connects borrowers to their assigned LO. Scales for refi boom volumes.", href: "/vendors/genesys" },
        ],
        pitfall: "Rate lock windows create the most time-sensitive routing in financial services. A borrower calling to lock their rate during a volatile market needs to reach their LO or an authorized rate desk — not a general service agent — within minutes. Build a 'rate lock emergency' routing path that bypasses the normal queue."
      },
      { layer: 5, name: "Conversation Management",
        capabilities: ["Secure document upload portal for income, asset, and property documentation","Co-browsing for online application assistance and document review","Proactive milestone notifications (application received, UW decision, clear-to-close)","Video for complex rate comparison and closing disclosure review","SMS alerts for document requests and deadline reminders"],
        vendors: "Glia, Blend, LivePerson", risk: "Borrower receiving conflicting rate information across channels",
        stack: [
          { name: "Blend", role: "Digital Lending", why: "End-to-end digital mortgage platform — application, document upload, disclosures, and closing. The conversation management layer is built into the lending workflow, not bolted on.", href: "/vendors" },
          { name: "Glia", role: "Digital Customer Service", why: "Co-browsing for mortgage application assistance. Agents guide borrowers through the application in real-time. Secure document sharing within the interaction.", href: "/vendors/digital-engagement" },
        ],
        pitfall: "Mortgage document collection is the #1 source of borrower frustration and process delay. Borrowers submit documents via email, fax, portal upload, and in-person drop-off — then call to ask 'did you get my documents?' Build a single document status view that both the borrower and agent can see. Blend solves this natively; most LOS platforms require custom development."
      },
      { layer: 4, name: "Reasoning & Planning",
        capabilities: ["Application status bots with pipeline stage and next-step guidance","Document checklist bots tracking received vs outstanding items","Rate quote bots with real-time pricing engine integration","Payment calculator bots with taxes, insurance, and PMI estimates","Pre-qualification bots collecting initial borrower information"],
        vendors: "Kasisto, Cognigy, Blend AI", risk: "AI quoting rates without proper disclosures and licensing",
        stack: [
          { name: "Blend AI", role: "Lending AI", why: "AI built into the lending workflow. Document collection reminders, status updates, and pre-qualification powered by actual underwriting logic — not generic chatbot responses.", href: "/vendors" },
          { name: "Cognigy", role: "Conversational AI", why: "Multi-turn document collection conversations. Handles 'I submitted my W-2 but can't find my bank statements' with intelligent follow-up and alternative document guidance.", href: "/vendors/iva" },
        ],
        pitfall: "A bot that quotes mortgage rates must include APR, required disclosures, and rate lock terms — or it violates TRID. 'Your rate would be about 6.5%' without the APR, origination fee, and expiration is a compliance violation. Either build disclosure logic into the bot or restrict it to directing borrowers to a licensed loan officer for rate discussions."
      },
      { layer: 3, name: "Policy & Guardrails",
        capabilities: ["TRID compliance automation for Loan Estimate and Closing Disclosure timelines","ECOA and fair lending monitoring across all interaction channels","RESPA controls for settlement service referrals and fee disclosures","NMLS licensing verification for agents providing rate and product advice","State-specific disclosure requirements automated by borrower location"],
        vendors: "Wolters Kluwer, Black Knight Compliance, ICE", risk: "Fair lending violations from inconsistent rate communication",
        stack: [
          { name: "ICE (Encompass Compliance)", role: "Regulatory Compliance", why: "TRID timeline automation, disclosure generation, and fee tolerance monitoring built into the origination workflow. The standard for mortgage compliance.", href: "/vendors" },
          { name: "Wolters Kluwer", role: "Compliance Content", why: "Regulatory content engine ensuring disclosures and documents meet state-specific requirements. Automatically updates when regulations change.", href: "/vendors" },
        ],
        pitfall: "Fair lending monitoring must cover the contact center, not just the origination system. If agents quote different rates to different borrowers for the same scenario — even unintentionally — you have a fair lending risk. Record and analyze rate discussions in the contact center with the same rigor you apply to loan officer pricing decisions."
      },
      { layer: 2, name: "Workflow Execution",
        capabilities: ["Loan application intake workflow with automated AUS submission","Document collection workflow with intelligent follow-up sequencing","Underwriting condition clearance workflow with borrower notification","Closing scheduling workflow coordinating title, settlement, and notary","Post-close onboarding workflow with servicing transfer communication"],
        vendors: "Encompass (ICE), Blend, MuleSoft, Byte", risk: "Manual document chasing creating timeline delays",
        stack: [
          { name: "ICE Encompass", role: "Loan Origination System", why: "Industry-standard LOS. Workflow rules engine for document collection, underwriting conditions, and closing coordination. Your CX stack integrates with Encompass — not the other way around.", href: "/vendors" },
          { name: "Blend", role: "Digital Origination", why: "Modern digital layer on top of Encompass. Borrower-facing application, document upload, and e-closing. Reduces the 'how do I submit this?' calls that consume 20-30% of mortgage contact center volume.", href: "/vendors" },
        ],
        pitfall: "Encompass is the system of record, but its agent-facing UI was designed for loan officers, not contact center agents. An agent answering 'what's the status of my loan?' doesn't need to see the full underwriting file — they need a simplified pipeline view with current stage, next milestone, and outstanding items. Build a contact center-specific Encompass view or you'll train agents to navigate a tool designed for a different job."
      },
      { layer: 1, name: "Data Access",
        capabilities: ["Loan origination system integration (Encompass, Byte, Calyx)","Pricing engine connectivity for real-time rate and fee calculation","AUS integration (DU, LPA) for automated underwriting decisions","Title and settlement system connectivity for closing coordination","Servicing platform integration for post-close inquiries and payments"],
        vendors: "ICE (Encompass), Black Knight, Sagent, FICS", risk: "Disconnected origination and servicing creating post-close confusion",
        stack: [
          { name: "ICE Encompass", role: "Origination Data", why: "Application data, pipeline status, conditions, and disclosures. The single source of truth for any pre-close interaction.", href: "/vendors" },
          { name: "ICE MSP / Sagent", role: "Servicing Data", why: "Post-close payment history, escrow analysis, and account status. When a borrower calls after closing, the servicing system — not the origination system — has the answers.", href: "/vendors" },
          { name: "Optimal Blue", role: "Pricing Engine", why: "Real-time rate and fee calculation. Integration means agents and bots can provide accurate rate quotes (with proper disclosures) rather than stale rate sheets.", href: "/vendors" },
        ],
        pitfall: "The origination-to-servicing handoff is the #1 post-close CX failure point. The borrower's loan moves from Encompass to MSP (or Sagent, or FICS) and the contact center loses visibility. The origination team says 'that's a servicing question now' and the servicing team has a 30-day onboarding lag. Build a transition protocol that bridges the gap — proactively notify borrowers of their new servicing contact before the transfer completes."
      },
    ],
  },

  "fintech-neobanks": {
    name: "Fintech & Neobanks", parent: "Financial Services",
    tagline: "Digital-native service models with app-first support and instant resolution expectations.",
    intro: "Fintech and neobank contact centers are born digital. Customers chose these institutions specifically because they promise faster, simpler, and more transparent financial experiences. The CX bar is set by the app experience, and the contact center must match that speed and simplicity.",
    kpis: [
      { metric: "AHT", avg: "4:00", note: "Fastest in FS — digital-native customers expect speed" },
      { metric: "FCR", avg: "78%", note: "Above average — simpler products and integrated systems" },
      { metric: "CSAT", avg: "82%", note: "High — digital-native users value speed and self-service" },
      { metric: "Containment", avg: "40%", note: "Highest in FS — app-native self-service handles most transactional queries" },
    ],
    layers: [
      { layer: 7, name: "Analytics & Governance",
        capabilities: ["Real-time app experience monitoring with support trigger correlation","CSAT embedded in app post-interaction with one-tap feedback","Support volume analytics correlated to product releases and outages","Agent productivity tracking across chat, email, and in-app messaging","Regulatory compliance dashboards meeting charter/license requirements"],
        vendors: "NICE, Amplitude, Mixpanel, Qualtrics", risk: "Scaling support without losing the speed that defines the brand",
        stack: [
          { name: "Amplitude", role: "Product Analytics", why: "Connects in-app behavior to support contact. Shows exactly which app screen or feature triggered the support request. Product teams use the same data to fix root causes.", href: "/vendors" },
          { name: "Mixpanel", role: "Event Analytics", why: "Event-based tracking for funnel analysis. Identifies where users drop off (onboarding, first deposit, first card transaction) and predicts who will contact support.", href: "/vendors" },
        ],
        pitfall: "Fintechs treat product analytics and support analytics as separate functions owned by separate teams. The result: product sees a 5% drop-off at identity verification but doesn't know that 60% of those users contact support. Pipe your support data into your product analytics platform. The best CX improvement in fintech is often a product fix, not a service fix."
      },
      { layer: 6, name: "Routing & Orchestration",
        capabilities: ["In-app support routing with full session context and user journey data","Priority routing based on account value, tenure, and issue severity","Fraud alert routing with immediate account freeze capability","Engineering escalation routing for product bugs surfaced through support","Queue-less routing — chat-first with callback as overflow only"],
        vendors: "Intercom, Zendesk, Genesys", risk: "Growing call volume undermining the digital-first brand promise",
        stack: [
          { name: "Intercom", role: "Primary Support Platform", why: "Built for product-led companies. In-app messaging as the primary support channel. Full user context (plan, tenure, recent actions) visible to agents. Product tours and tooltips reduce support volume.", href: "/vendors/digital-engagement" },
          { name: "Zendesk", role: "Support Platform", why: "More mature ticketing and workflow engine than Intercom. Better for fintechs scaling past 50 agents who need structured queue management alongside chat.", href: "/vendors" },
        ],
        pitfall: "Fintechs start on Intercom (chat-first, simple) and outgrow it around 80-100 agents when they need structured routing, WEM, and compliance features. Migrating from Intercom to a CCaaS platform mid-growth is expensive and disruptive. If you're growing fast, evaluate whether your current platform can scale to 200+ agents before you hit the wall."
      },
      { layer: 5, name: "Conversation Management",
        capabilities: ["In-app messaging as the primary support channel","Async chat allowing customers to continue conversations across sessions","Push notification support for proactive updates and resolutions","Screen recording and co-browsing for app navigation assistance","Community forums and help center as first line of self-service"],
        vendors: "Intercom, Zendesk, Ada, Kustomer", risk: "Forcing customers to call when the entire brand is built on not calling",
        stack: [
          { name: "Intercom Messenger", role: "In-App Messaging", why: "Native in-app messaging with article suggestions, bot flows, and agent handoff. The customer never leaves the app. Async by default — conversations persist across sessions.", href: "/vendors/digital-engagement" },
          { name: "Kustomer", role: "Omnichannel Support", why: "Timeline-based agent view shows every customer interaction chronologically. Strong for fintechs that need email, chat, social, and phone in one view as they add channels.", href: "/vendors" },
        ],
        pitfall: "Fintechs add phone support reluctantly as they scale — usually because regulators or bank partners require it. The phone implementation is often an afterthought with terrible hold times and untrained agents, which undermines the brand. If you must add phone, invest in it properly. A bad phone experience is worse than no phone experience."
      },
      { layer: 4, name: "Reasoning & Planning",
        capabilities: ["Transaction dispute bots with instant provisional credit logic","Card management bots (freeze, unfreeze, replace, set limits)","Account verification and KYC completion bots","Spending insights and budgeting tool support bots","Fee explanation and waiver bots with policy-based decisioning"],
        vendors: "Ada, Forethought, Intercom Fin, Cognigy", risk: "Bot limitations frustrating users who expect everything to work in-app",
        stack: [
          { name: "Intercom Fin", role: "AI Agent", why: "Trained on your help center and knowledge base. Resolves common questions without custom bot building. Falls back to human agents for complex issues with full conversation context.", href: "/vendors/iva" },
          { name: "Ada", role: "AI Customer Service", why: "No-code bot builder with strong fintech deployments. Handles card management, dispute filing, and account verification. Pre-built financial services content library.", href: "/vendors/iva" },
        ],
        pitfall: "Fintech bots must execute actions, not just provide information. A user who asks 'freeze my card' expects the card to be frozen — not a link to a help article about how to freeze their card in the app. If your bot can't call the card management API to freeze the card in real-time, it's not a bot — it's a search engine with a chat interface."
      },
      { layer: 3, name: "Policy & Guardrails",
        capabilities: ["Charter/license compliance appropriate to entity type","BSA/AML controls meeting regulatory expectations","Strong customer authentication for account changes and high-value transfers","Dispute resolution compliance meeting Reg E timelines","Data privacy controls meeting state-by-state requirements"],
        vendors: "Alloy, Sardine, Unit21, Plaid", risk: "Regulatory scrutiny increasing as fintechs grow beyond startup scale",
        stack: [
          { name: "Alloy", role: "Identity & Compliance", why: "Identity verification, KYC, and risk decisioning in one platform. Real-time compliance checks during onboarding and throughout the customer lifecycle. Standard for fintech compliance.", href: "/vendors" },
          { name: "Sardine", role: "Fraud & Compliance", why: "Behavioral fraud detection purpose-built for fintechs. Analyzes device signals, behavioral biometrics, and transaction patterns. Catches fraud that rule-based systems miss.", href: "/vendors" },
          { name: "Unit21", role: "Risk & Compliance Ops", why: "No-code compliance operations platform. Case management, SAR filing, and transaction monitoring without building custom compliance tools.", href: "/vendors" },
        ],
        pitfall: "Fintechs operating through bank partners (BaaS model) often assume the bank partner handles compliance. The bank partner handles banking compliance; the fintech handles customer-facing compliance. When a customer calls your support team and reports unauthorized transactions, your agents must follow Reg E timelines regardless of your bank partnership structure. Own your compliance obligations."
      },
      { layer: 2, name: "Workflow Execution",
        capabilities: ["Instant account opening workflow with real-time identity verification","Dispute resolution workflow with automated provisional credit and investigation","Account closure workflow with balance transfer and regulatory holds","Referral and reward redemption workflow with real-time tracking","Compliance case management workflow for suspicious activity"],
        vendors: "Alloy, Plaid, Unit, Treasury Prime", risk: "Speed-first culture creating compliance shortcuts",
        stack: [
          { name: "Plaid", role: "Financial Connectivity", why: "Bank account linking, income verification, and identity verification. Powers the account funding and verification workflows that reduce onboarding friction.", href: "/vendors" },
          { name: "Unit / Treasury Prime", role: "BaaS Platform", why: "Banking-as-a-service infrastructure. Account opening, card issuance, and money movement APIs. Your CX workflows execute against these APIs — their reliability is your reliability.", href: "/vendors" },
        ],
        pitfall: "BaaS platforms abstract banking complexity but introduce dependency risk. When Unit or Treasury Prime has an API outage, your customers can't open accounts, move money, or manage cards — and your support team has no way to help. Build manual fallback procedures for your top 5 BaaS-dependent workflows, and make sure your support team knows how to use them."
      },
      { layer: 1, name: "Data Access",
        capabilities: ["BaaS platform integration (Unit, Treasury Prime, Synapse)","Payment processor connectivity (Marqeta, Galileo, i2c)","Identity verification platform integration (Alloy, Plaid Identity)","Product analytics platform integration for user context during support","Internal knowledge base with product release notes and known issues"],
        vendors: "Unit, Treasury Prime, Marqeta, Galileo, Plaid", risk: "Third-party dependency on BaaS providers for real-time data access",
        stack: [
          { name: "Marqeta", role: "Card Issuing & Processing", why: "Modern card issuing platform powering most fintech debit and credit cards. Real-time transaction data, card controls, and tokenization. Your support agents need Marqeta data for any card-related interaction.", href: "/vendors" },
          { name: "Galileo", role: "Card Processing", why: "SoFi-owned processor serving Chime, Robinhood, and other major fintechs. Transaction processing, account management, and program management APIs.", href: "/vendors" },
          { name: "Plaid", role: "Data Connectivity", why: "Bank account linking and transaction data aggregation. When a user asks 'where's my ACH transfer?' the answer lives in Plaid's API, not your BaaS provider.", href: "/vendors" },
        ],
        pitfall: "Fintechs often have better data infrastructure than traditional banks — but worse data access for support agents. The engineering team builds beautiful real-time dashboards for product metrics while the support team copy-pastes between 4 admin panels to answer a single question. Invest in an internal support tool that aggregates Marqeta + BaaS + Plaid + product data into one agent view. Your engineers will resist building 'internal tools' — make it a priority anyway."
      },
    ],
  },

  "payments-processing": {
    name: "Payments & Processing", parent: "Financial Services",
    tagline: "Merchant support, transaction disputes, terminal troubleshooting, and settlement inquiries.",
    intro: "Payments and processing contact centers serve two distinct audiences — merchants (B2B) and cardholders (B2C) — often from the same operation. Every minute of downtime for a merchant is lost revenue.",
    kpis: [
      { metric: "AHT", avg: "7:30", note: "Mixed — consumer inquiries are fast, merchant technical support is long" },
      { metric: "FCR", avg: "70%", note: "Average — merchant issues often require escalation to technical teams" },
      { metric: "CSAT", avg: "76%", note: "Below average — merchant frustration with hold times and technical complexity" },
      { metric: "Containment", avg: "22%", note: "Transaction lookups are automatable; terminal troubleshooting requires humans" },
    ],
    layers: [
      { layer: 7, name: "Analytics & Governance",
        capabilities: ["Merchant satisfaction tracking segmented by volume tier and industry","Transaction dispute analytics with chargeback ratio monitoring","PCI compliance audit readiness across all interaction channels","Technical support resolution analytics by terminal type and issue","Settlement discrepancy tracking and root cause analysis"],
        vendors: "NICE, Verint, Qualtrics", risk: "Chargeback ratios exceeding card network thresholds",
        stack: [
          { name: "NICE CXone", role: "QA & Analytics", why: "Separates B2B (merchant) and B2C (cardholder) quality scoring. Different scorecards for technical support depth vs transactional speed.", href: "/vendors/nice-cxone" },
          { name: "Qualtrics", role: "Merchant Feedback", why: "Merchant satisfaction tracking tied to volume tier. Identifies at-risk enterprise merchants before they switch processors.", href: "/vendors/analytics" },
        ],
        pitfall: "Payments companies track CSAT at the interaction level but not at the merchant relationship level. A merchant can have 5 satisfactory interactions and still leave because settlement timing is inconsistent. Track relationship-level metrics (NPS, retention risk) alongside interaction metrics."
      },
      { layer: 6, name: "Routing & Orchestration",
        capabilities: ["B2B vs B2C routing separating merchant and cardholder queues","Merchant tier routing prioritizing high-volume and enterprise accounts","Technical support routing by terminal type, gateway, and integration method","Risk and fraud routing for suspicious transaction patterns","Settlement and funding urgency routing for merchant cash flow issues"],
        vendors: "Genesys, NICE CXone, Five9", risk: "High-value merchants waiting in general queue during outages",
        stack: [
          { name: "Genesys Cloud", role: "Primary CCaaS", why: "Skills-based routing matching merchant issues to agents with specific terminal, gateway, or integration expertise. Merchant tier routing ensures enterprise accounts get priority.", href: "/vendors/genesys" },
          { name: "Five9", role: "CCaaS", why: "Strong mid-market fit for payment processors scaling their support operations. Reliable routing with CRM integration for merchant relationship context.", href: "/vendors/five9" },
        ],
        pitfall: "Terminal-down calls from merchants are the payments equivalent of a 911 call — every minute costs the merchant revenue. These calls should route directly to technical support with the highest priority, bypassing the general queue entirely. Most payment processors don't have a 'terminal emergency' routing path, and merchants wait 10-15 minutes while their business loses sales."
      },
      { layer: 5, name: "Conversation Management",
        capabilities: ["Secure merchant portal with case management and knowledge base","Screen sharing for terminal configuration and gateway troubleshooting","Proactive outreach for settlement delays and processing changes","Developer support chat for API integration and webhook issues","Cardholder dispute intake with required documentation collection"],
        vendors: "Zendesk, Intercom, Freshdesk, Salesforce Service", risk: "Developer support quality not matching technical depth required",
        stack: [
          { name: "Zendesk", role: "Support Platform", why: "Structured ticketing for merchant support cases. Knowledge base for self-service. API documentation integration for developer support. Good for managing the B2B support lifecycle.", href: "/vendors" },
          { name: "Salesforce Service Cloud", role: "Merchant CRM", why: "Full merchant relationship view with case management. Tracks merchant portfolio data alongside support interactions. Enterprise-grade for large processor operations.", href: "/vendors/ccaas" },
        ],
        pitfall: "Developer support (API integration, webhook troubleshooting) is the highest-value, most-neglected support channel in payments. ISVs and merchants integrating your API generate recurring revenue for years — but most processors route developer questions to the same agents who handle card declines. Staff developer support with engineers who understand REST APIs, not agents reading from scripts."
      },
      { layer: 4, name: "Reasoning & Planning",
        capabilities: ["Transaction lookup bots with real-time authorization and settlement data","Cardholder dispute intake bots collecting required Reg E information","Merchant statement and fee explanation bots","Terminal activation and basic troubleshooting bots","Settlement status and funding timeline bots"],
        vendors: "Ada, Cognigy, Forethought", risk: "Bot mishandling dispute intake and missing required data fields",
        stack: [
          { name: "Ada", role: "AI Customer Service", why: "Handles transaction lookups, dispute intake, and merchant FAQ. Pre-built financial services content. No-code bot builder means non-engineers can maintain flows.", href: "/vendors/iva" },
          { name: "Forethought", role: "AI Support", why: "Predictive ticket routing and automated response suggestions. Good for triaging the mixed B2B/B2C volume that payment processors handle.", href: "/vendors/iva" },
        ],
        pitfall: "Dispute intake bots must collect every field required by card network rules (Visa CE 3.0, Mastercard). A bot that collects 'what happened?' without getting transaction date, amount, merchant name, and reason code creates a case that will be rejected by the network — and the cardholder will call back angrier. Map your bot intake fields to the actual network dispute form before you deploy."
      },
      { layer: 3, name: "Policy & Guardrails",
        capabilities: ["PCI DSS Level 1 compliance across all interaction channels","Card network dispute handling rule compliance","Reg E and Reg Z compliance for consumer transaction disputes","Merchant underwriting and risk monitoring integration","Anti-money laundering controls for suspicious merchant activity"],
        vendors: "Verisk, Ethoca, NICE Actimize", risk: "PCI scope creep as channels expand beyond voice",
        stack: [
          { name: "Ethoca (Mastercard)", role: "Chargeback Prevention", why: "Merchant-issuer collaboration to resolve disputes before they become chargebacks. Prevents friendly fraud and reduces chargeback ratios.", href: "/vendors" },
          { name: "Verifi (Visa)", role: "Dispute Resolution", why: "Visa's dispute resolution network. Rapid Dispute Resolution and Order Insight prevent chargebacks by providing merchants with real-time dispute alerts.", href: "/vendors" },
        ],
        pitfall: "Adding chat, SMS, or social support to a payments contact center expands your PCI scope. Every channel where an agent could potentially see card data must be PCI compliant — including the screen recording, analytics, and archival systems that touch those channels. Most processors add digital channels without reassessing PCI scope and discover the gap during their next QSA audit."
      },
      { layer: 2, name: "Workflow Execution",
        capabilities: ["Merchant onboarding workflow with underwriting and terminal provisioning","Chargeback response workflow with evidence collection and network deadlines","Terminal replacement and shipping workflow with configuration migration","Rate review and repricing workflow for merchant retention","Merchant account closure workflow with reserve hold and settlement"],
        vendors: "Salesforce, Pega, MuleSoft", risk: "Chargeback response deadlines missed due to manual evidence collection",
        stack: [
          { name: "Salesforce + MuleSoft", role: "CRM + Integration", why: "Merchant lifecycle management from onboarding through servicing. MuleSoft connects merchant portfolio systems, terminal management, and card network portals.", href: "/vendors/ccaas" },
          { name: "ChargebackOps / Midigator", role: "Chargeback Management", why: "Automated chargeback response with evidence collection and network-specific formatting. Reduces win-back time from days to hours.", href: "/vendors" },
        ],
        pitfall: "Chargeback response deadlines are set by the card networks and are non-negotiable. Visa gives merchants 30 days for first-cycle responses. If your chargeback response workflow requires manual evidence collection from 3 different systems, you're burning 20 of those 30 days on internal process. Automate evidence aggregation or accept a lower win rate."
      },
      { layer: 1, name: "Data Access",
        capabilities: ["Payment gateway integration (authorization, settlement, batch data)","Terminal management system connectivity (deployment, configuration, firmware)","Merchant portfolio system (pricing, statements, risk flags)","Card network portals (Visa Resolve Online, Mastercard Connect)","Cardholder account data for dispute resolution and fraud investigation"],
        vendors: "Adyen, Stripe, Worldpay, Fiserv, Global Payments", risk: "Fragmented data across acquirer, processor, and gateway systems",
        stack: [
          { name: "Stripe", role: "Payment Platform", why: "API-first platform with real-time transaction data, dispute management, and merchant dashboard. Best for tech-forward processors and payment facilitators.", href: "/vendors/payments" },
          { name: "Adyen", role: "Payment Platform", why: "Unified commerce platform with acquiring, processing, and terminal management. Single data source simplifies the agent desktop — no switching between acquirer and processor views.", href: "/vendors/payments" },
          { name: "Fiserv (First Data)", role: "Processing Infrastructure", why: "Largest card processor globally. Clover terminal ecosystem. Agent desktop needs real-time access to Fiserv authorization data, settlement status, and merchant portfolio.", href: "/vendors/payments" },
        ],
        pitfall: "Payments data is fragmented by design — the acquirer, processor, gateway, and card network each hold different pieces of the transaction lifecycle. An agent answering 'why was this transaction declined?' may need to check the gateway (technical decline), the processor (risk decline), and the issuer (insufficient funds) — all in different systems. Build a unified transaction view that shows the full lifecycle in one screen, or accept that agents will need 3-5 minutes per lookup."
      },
    ],
  },
};

export const getSubVertical = (slug) => fsSubVerticals[slug];
export const getAllSubVerticalSlugs = () => Object.keys(fsSubVerticals);
