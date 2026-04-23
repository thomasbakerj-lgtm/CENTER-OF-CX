// CCaaS Vendor Intelligence — sourced from CCaaS Matrices and Market Evaluation v2
// 24 core vendors + 4 adjacent suites | 27 weighted scoring dimensions | Total weight: 100

export const vendors = {

  // ═══════════════════════════════════════════════════════════
  // STRATEGIC FOUNDATION (85–100)
  // ═══════════════════════════════════════════════════════════

  "genesys": {
    name: "Genesys Cloud CX", slug: "genesys", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "Enterprise Core", tier: "Strategic Foundation", score: 94, website: "genesys.com",
    summary: "The broadest all-around enterprise CCaaS foundation with strong orchestration, ecosystem depth, and native WEM. Genesys has the widest functional footprint in the market and the architecture to support complex, multi-site, multi-region operations. AI investment is accelerating across routing, agent assist, QA, and journey orchestration.",
    strengths: [
      "Deepest omnichannel routing engine in the market — intent and policy-based capabilities approaching true orchestration",
      "Native WEM suite (WFM, QM, coaching) that competes with standalone WEM vendors, reducing stack fragmentation",
      "Mature API ecosystem and AppFoundry marketplace for third-party extensions",
      "Proven enterprise scalability across multi-site, multi-region, regulated deployments",
      "Strong journey analytics and cross-channel visibility with real-time dashboards",
      "Active AI investment: agent assist, predictive routing, speech/text analytics, and bot platform improving rapidly",
    ],
    weaknesses: [
      "Pricing complexity — multiple SKUs, add-ons, and usage-based components make TCO difficult to predict without detailed scoping",
      "Can be too heavy and over-engineered for simpler organizations or speed-first deployments",
      "Legacy Genesys Engage customers face a meaningful migration lift to Cloud CX",
      "Implementation complexity for enterprise deployments still requires experienced partners and meaningful project management",
      "AI orchestration vision is directional — validate which capabilities are GA vs roadmap",
    ],
    bestFit: "Enterprise contact centers (200+ seats) with omnichannel requirements, complex routing needs, and budget for a full-suite platform. Strongest in financial services, healthcare, telecom, and government. Default benchmark in serious enterprise evaluations.",
    notFit: "SMB or mid-market organizations seeking simple, fast deployment. Teams that need a lightweight digital-first solution. Small, fast-moving centers with limited admin maturity.",
    redFlags: [
      "Watch for bundled pricing that looks attractive at signing but escalates with usage-based overages on channels, storage, or API calls",
      "Ensure your implementation partner has specific Genesys Cloud CX experience — Engage expertise does not transfer cleanly",
      "The AI roadmap is ambitious; validate which capabilities are GA vs beta before building your business case around them",
    ],
    competitors: ["NICE CXone", "Five9", "Amazon Connect", "Talkdesk", "Cisco Webex"],
    competitiveContext: "Genesys and NICE CXone are the two strongest enterprise CCaaS platforms. Genesys has the edge in routing sophistication and native WEM integration. NICE has the edge in interaction analytics and QA depth. Five9 competes well on ease of deployment and mid-market value. Amazon Connect wins on AWS-native integration and consumption pricing. Talkdesk is catching up on AI but lacks the enterprise deployment track record.",
  },

  "nice-cxone": {
    name: "NICE CXone", slug: "nice-cxone", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "Enterprise Core", tier: "Strategic Foundation", score: 90, website: "nice.com",
    summary: "Best-in-class ops-heavy posture with AI, WEM, QA, analytics, and regulated-market strength. Following the Cognigy acquisition, NICE is building toward an AI orchestration layer that could redefine how digital and voice interactions are managed. The strongest platform for organizations where quality management, compliance, and interaction analytics are mission-critical.",
    strengths: [
      "Industry-leading interaction analytics — Enlighten AI provides automated QA scoring, sentiment analysis, and behavioral insights at scale",
      "Strongest WEM suite in the CCaaS market (WFM, QM, recording, coaching) — often eliminates the need for standalone WEM vendors",
      "Mature skills-based and behavioral routing with AI-enhanced decisioning",
      "Post-Cognigy acquisition positions NICE as a serious conversational AI orchestration player",
      "Deep compliance and recording capabilities suited for regulated industries",
      "Massive installed base and proven global enterprise scalability",
    ],
    weaknesses: [
      "Commercial complexity and transformation burden can slow adoption — full-suite licensing pushes TCO above some competitors",
      "Platform breadth means longer implementation timelines and steeper learning curves for admin teams",
      "Integration of Cognigy AI capabilities is still in progress — evaluate current state vs roadmap carefully",
      "Historically voice-centric; digital engagement capabilities are improving but pure digital-first organizations may find the UX weighted toward voice workflows",
      "Partner ecosystem for implementation is smaller than Genesys in some regions",
    ],
    bestFit: "Enterprise contact centers that prioritize analytics, QA automation, and workforce optimization. Default benchmark for regulated and QA-heavy environments. Strongest for financial services, insurance, healthcare, and utilities.",
    notFit: "Digital-first organizations with minimal voice volume. SMB or startup contact centers seeking fast deployment. Cost-sensitive or low-change-tolerance deals where transformation burden matters.",
    redFlags: [
      "Full-suite pricing can escalate quickly — model your TCO across all modules before committing, especially Enlighten AI and advanced WEM",
      "The Cognigy integration roadmap should be validated with specific timelines and GA dates",
      "Contract terms for enterprise deals can be rigid — negotiate flexibility on seat counts and module adoption phasing",
    ],
    competitors: ["Genesys Cloud CX", "Five9", "Talkdesk", "Verint", "Calabrio"],
    competitiveContext: "NICE and Genesys are the market's two enterprise CCaaS leaders. NICE wins on analytics and QA depth. Genesys wins on routing sophistication and ecosystem breadth. Against Verint and Calabrio, NICE competes directly on WEM and increasingly wins because WEM is embedded in the CCaaS. Five9 competes on ease of deployment and mid-market pricing.",
  },

  // ═══════════════════════════════════════════════════════════
  // STRONG CONTENDER (70–84)
  // ═══════════════════════════════════════════════════════════

  "five9": {
    name: "Five9", slug: "five9", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "Enterprise Core", tier: "Strategic Foundation", score: 78, website: "five9.com",
    summary: "Pragmatic enterprise CCaaS with strong outbound heritage and solid market credibility. Five9 balances capability depth with implementation speed and has one of the strongest partner ecosystems in the market. The AI portfolio is growing rapidly, and the platform handles the mid-market to large enterprise range well.",
    strengths: [
      "Balanced platform — strong enough for enterprise complexity, deployable fast enough for mid-market timelines",
      "Excellent outbound and blended contact capabilities — one of the best in the market for significant outbound volume",
      "Clean CRM integrations (Salesforce, ServiceNow, Zendesk) with pre-built connectors that reduce implementation lift",
      "Strong partner ecosystem and advisor accessibility across North America",
      "Growing AI portfolio improving quarter over quarter",
    ],
    weaknesses: [
      "WEM capabilities are functional but less mature than Genesys or NICE — complex forecasting or advanced QA may require a standalone vendor",
      "Not always the broadest control-plane winner in the hardest multinational environments",
      "International presence is growing but still behind Genesys and NICE for complex multi-region deployments",
      "Interaction analytics improving but don't match NICE Enlighten depth",
    ],
    bestFit: "Mid-market to enterprise contact centers (100–1000+ seats) seeking a reliable, well-integrated platform. Strong for blended service/sales operations, Salesforce shops, and pragmatic enterprise modernization.",
    notFit: "Organizations requiring the deepest analytics and QA automation (NICE is stronger). Public-sector sovereignty-led or highly bespoke multinational deals.",
    redFlags: [
      "Evaluate whether Five9's native WEM meets your forecasting and QA requirements or if you'll need a standalone vendor — that changes TCO",
      "AI capabilities are improving rapidly but some features are newer — ask for customer references on the specific AI features you plan to use",
      "International deployment capabilities should be validated for your specific regions",
    ],
    competitors: ["Genesys Cloud CX", "NICE CXone", "Talkdesk", "Amazon Connect", "8x8"],
    competitiveContext: "Five9 sits in a strong middle position — more enterprise-capable than Talkdesk or 8x8, faster to deploy than Genesys or NICE. Against Genesys, Five9 trades routing depth for implementation speed. Against NICE, Five9 trades analytics depth for a cleaner mid-market fit. Very partner-carryable compared with heavier enterprise suites.",
  },

  "cisco": {
    name: "Cisco Webex Contact Center", slug: "cisco", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "Enterprise Core", tier: "Strong Contender", score: 75, website: "cisco.com",
    summary: "Secure enterprise-ready CCaaS with strong collaboration adjacency and telecom/government relevance. Cisco wins in estates where security, network infrastructure, and collaboration stack consolidation drive the decision. The platform is credible for enterprise operations where Cisco already has strategic weight.",
    strengths: [
      "Security and compliance posture is among the strongest in the market — natural fit for government, healthcare, and telecom",
      "Deep integration with the broader Cisco collaboration, network, and security ecosystem",
      "Strong in enterprise consolidation where Cisco is already the infrastructure standard",
      "Mature telephony and carrier-grade reliability",
    ],
    weaknesses: [
      "Less compelling in pure greenfield CX-led bakeoffs where Cisco estate advantage is absent",
      "WEM and QA depth are growing but trail NICE and Genesys in advanced scenarios",
      "AI capabilities are competitive but not leading-edge in agent assist or journey orchestration",
      "Strongest when buyer values Cisco's broader stack — weaker when evaluated purely on CCaaS merit",
    ],
    bestFit: "Cisco-heavy enterprise estates. Security-first environments. Healthcare, telecom, government, and public-sector organizations where Cisco's compliance and network infrastructure are strategic assets.",
    notFit: "Retail or media deals centered on rapid digital-CX reinvention. Pure greenfield CX beauty contests where Cisco has no estate advantage.",
    redFlags: [
      "Do not overrate Cisco without a real estate or security advantage — the platform competes differently when evaluated standalone",
      "Validate WEM and QA depth for your specific requirements — supplemental vendors may be needed",
      "Implementation partners should have Webex Contact Center experience, not just broader Cisco expertise",
    ],
    competitors: ["Genesys Cloud CX", "NICE CXone", "Zoom", "RingCentral", "Amazon Connect"],
    competitiveContext: "Cisco competes best when the decision is influenced by security posture, existing Cisco infrastructure, and enterprise consolidation logic. Against Genesys and NICE, Cisco trades broader CCaaS depth for security and collaboration adjacency. Against Zoom and RingCentral, Cisco brings significantly more enterprise gravity.",
  },

  "talkdesk": {
    name: "Talkdesk", slug: "talkdesk", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "Growth Challenger", tier: "Strong Contender", score: 75, website: "talkdesk.com",
    summary: "Clear verticalized modernization story with strong business-value packaging and industry clouds. Talkdesk differentiates through its Experience Clouds for financial services, healthcare, and retail. The platform is modern, API-first, and appeals to organizations that want a CCaaS vendor with genuine vertical understanding.",
    strengths: [
      "Industry-specific Experience Clouds provide pre-built workflows, integrations, and compliance features for financial services, healthcare, and retail",
      "Strong business-value packaging and clear modernization narrative that resonates with CX buyers",
      "Modern cloud-native architecture with clean APIs and good developer experience",
      "AppConnect marketplace with broad ecosystem of pre-built integrations",
      "Good UX for agent and supervisor interfaces — cleaner than many enterprise competitors",
    ],
    weaknesses: [
      "Enterprise deployment track record is shorter than Genesys, NICE, or Five9 — validate with references at your scale",
      "Hardest bespoke enterprise complexity is not its cleanest lane — extreme multinational or deeply custom environments can dilute its simplicity advantage",
      "WEM capabilities are growing but still maturing — advanced WFM and QA scenarios may require supplemental vendors",
      "Outbound capabilities are less mature than Five9 for heavy outbound or blended operations",
    ],
    bestFit: "Mid-market to enterprise organizations in financial services, healthcare, or retail that want a CCaaS vendor with genuine vertical understanding. Best when business framing and vertical-led modernization matter.",
    notFit: "The largest enterprise deployments (2000+ seats) with deeply bespoke multinational estates. Heavy outbound operations. Telecom carrier-grade and deeply bespoke industrial environments.",
    redFlags: [
      "Validate the vertical Experience Cloud depth carefully — some vertical features are more mature than others",
      "Ask for references at your specific seat count and complexity — Talkdesk's sweet spot is mid-market and growing enterprise",
      "Do not confuse vertical messaging with guaranteed operational superiority — packaging strength and operational depth are different things",
    ],
    competitors: ["Genesys Cloud CX", "NICE CXone", "Five9", "Amazon Connect", "RingCentral"],
    competitiveContext: "Talkdesk's strongest position is against mid-market and growing enterprise buyers who value vertical specialization and modern architecture. Against Genesys, Talkdesk trades routing depth and global scale for vertical-specific workflows and a cleaner UX. Against Five9, Talkdesk offers stronger vertical positioning but a less mature outbound engine.",
  },

  "amazon-connect": {
    name: "Amazon Connect", slug: "amazon-connect", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "Enterprise Core", tier: "Strong Contender", score: 74, website: "aws.amazon.com/connect",
    summary: "Powerful programmable cloud foundation with strong extensibility and AWS leverage. Connect takes a fundamentally different approach — consumption-based pricing, deep AWS service integration, and a build-it-yourself architecture that gives engineering-led organizations maximum flexibility. The tradeoff: you're assembling a contact center from infrastructure components, which means more control and more engineering lift.",
    strengths: [
      "Consumption-based pricing (pay per minute/message) eliminates per-seat licensing — transformative economics for variable-volume operations",
      "Deep integration with AWS services: Lex (bots), Bedrock (LLMs), Lambda, S3, and Connect-native features like Contact Lens",
      "Infinite scalability — AWS infrastructure means no capacity planning for spikes",
      "Strongest extensibility and developer posture in the CCaaS market",
      "AI-native routing with contact flows and customer profiles enabling sophisticated personalization",
    ],
    weaknesses: [
      "Requires engineering investment — this is infrastructure your team builds on. Organizations without strong technical teams will struggle",
      "Native WEM capabilities are limited — WFM, QM, and coaching require third-party solutions or custom builds",
      "Out-of-box reporting and supervisor tooling is basic compared to Genesys, NICE, or Five9",
      "Consumption pricing is attractive but unpredictable — high-volume or long-AHT operations can see costs exceed traditional per-seat models",
      "Needs disciplined architecture governance and operating maturity to succeed",
    ],
    bestFit: "Technology-forward organizations with strong engineering teams already invested in AWS. Variable-volume operations where consumption pricing delivers meaningful savings. Builder-led transformations where custom AI/ML integration matters.",
    notFit: "Contact centers that need a turnkey out-of-box solution. Organizations without dedicated engineering resources. Teams that require deep native WEM or supervisor tooling. Customers with weak platform ownership discipline.",
    redFlags: [
      "Model your consumption costs carefully at realistic volumes, AHT, and growth projections — the per-minute model can surprise at scale",
      "Plan for total build cost: Connect licensing is cheap but the engineering labor to build your contact center is the real investment",
      "Architecture governance risk can distort field outcomes — evaluate whether your team can sustain ongoing platform development",
    ],
    competitors: ["Genesys Cloud CX", "NICE CXone", "Five9", "Talkdesk", "Google CCAI"],
    competitiveContext: "Amazon Connect occupies a unique position — it competes on architecture flexibility and AWS ecosystem depth rather than out-of-box completeness. Against Genesys and NICE, Connect trades turnkey functionality for infrastructure-level control. Against Five9 and Talkdesk, Connect appeals to the CTO with engineering resources who wants to own the architecture.",
  },

  "content-guru": {
    name: "Content Guru", slug: "content-guru", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "Enterprise Core", tier: "Strong Contender", score: 74, website: "contentguru.com",
    summary: "High-resilience, mission-critical CCaaS with strong public-sector credibility and compliance depth. Content Guru wins where uptime guarantees, sovereignty requirements, and government-grade security matter more than broad-market brand recognition. A specialist core vendor with genuine enterprise depth in defined environments.",
    strengths: [
      "Mission-critical resilience and availability — among the strongest uptime and redundancy architectures in the market",
      "Deep public-sector and government credibility with strong compliance certifications",
      "Solid WEM and QA capabilities that exceed many mid-tier competitors",
      "Strong in regulated and sovereignty-sensitive environments, particularly UK and EMEA",
    ],
    weaknesses: [
      "Lower broad-market mindshare — brand recognition trails the top-tier leaders significantly",
      "Narrower partner ecosystem and go-to-market reach outside public sector and UK/EMEA",
      "Commercial deals driven by broad ecosystem expectations may find the platform less compelling",
    ],
    bestFit: "Public-sector, emergency services, and high-availability environments where resilience and compliance are the primary decision criteria. UK and EMEA-led regulated-sector pursuits.",
    notFit: "Commercial deals driven by broad ecosystem expectations or brand power. North America-first general enterprise transformations.",
    redFlags: [
      "Do not ignore Content Guru in public sector because mindshare is lower — the platform substance is real in its defined lane",
      "Validate go-to-market coverage and partner availability in your region",
    ],
    competitors: ["Genesys Cloud CX", "NICE CXone", "Cisco Webex", "Odigo"],
    competitiveContext: "Content Guru competes in a specific lane — mission-critical, high-availability, government and regulated environments. Against Genesys and NICE, it trades broad-market gravity for deeper resilience and compliance proof. Against Odigo, it shares European relevance but with stronger public-sector credentials.",
  },

  "zoom": {
    name: "Zoom Contact Center", slug: "zoom", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "Growth Challenger", tier: "Strong Contender", score: 63, website: "zoom.com",
    summary: "Modern UX and practical AI momentum with strong ecosystem pull from the Zoom installed base. Zoom Contact Center has evolved rapidly from a meeting-adjacent add-on into a credible mid-market CCaaS platform that's beginning to win enterprise deals. The brand familiarity, UX quality, and AI investment are creating real momentum — particularly in digital-first and media/hospitality environments.",
    strengths: [
      "Familiar brand and ecosystem pull — organizations already using Zoom Phone and Meetings can expand into contact center with minimal change management",
      "Modern UX for agents and supervisors that consistently scores well in usability evaluations",
      "Practical AI momentum — copilot capabilities and analytics are improving faster than market expectations",
      "Strong digital-first and video-native service capabilities that differentiate from voice-centric competitors",
      "Competitive pricing and fast time-to-value for mid-market deployments",
    ],
    weaknesses: [
      "Enterprise workforce management and compliance depth still trailing established leaders — deep WFM and QA scenarios may require supplemental vendors",
      "Still building proof in the hardest regulated and enterprise-governed environments",
      "Smaller professional services and implementation partner ecosystem compared to Genesys, NICE, or Five9",
      "Outbound and blended capabilities are less mature than Five9 or legacy outbound specialists",
    ],
    bestFit: "Digital-first support teams, media and hospitality environments, internal help desks, and organizations with significant Zoom estate. Mid-market contact centers that value UX quality and fast deployment. Growing enterprise accounts where Zoom already has strategic weight.",
    notFit: "Heavily regulated environments with complex workforce governance. Large-scale BPO operations. Contact centers where deep WEM and compliance recording are table-stakes requirements.",
    redFlags: [
      "Do not let UX familiarity substitute for control-plane proof — validate routing depth, reporting maturity, and admin controls for your specific complexity level",
      "Enterprise WEM depth should be tested against your requirements before assuming the native capabilities are sufficient",
      "Qualify complexity honestly — Zoom's strength is in the mid-market and growing enterprise, and its enterprise proof is building but still earlier stage",
    ],
    competitors: ["RingCentral", "8x8", "Five9", "Talkdesk", "Dialpad"],
    competitiveContext: "Zoom competes most directly with RingCentral and 8x8 in the UC+CC convergence space, but is increasingly winning against Talkdesk and Five9 in mid-market evaluations. Against RingCentral, Zoom has stronger UX and brand momentum. Against 8x8, Zoom has more AI investment and market energy. Against Five9, Zoom trades outbound depth for ecosystem pull and faster deployment.",
  },

  // ═══════════════════════════════════════════════════════════
  // SITUATIONAL SPECIALIST (55–69)
  // ═══════════════════════════════════════════════════════════

  "ringcentral": {
    name: "RingCentral RingCX", slug: "ringcentral", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "Growth Challenger", tier: "Strong Contender", score: 64, website: "ringcentral.com",
    summary: "Good UC+CC simplification story and strong channel motion. RingCentral's current RingCX platform should be evaluated separately from the legacy RingCentral Contact Center product. The platform is most compelling in distributed service environments and UC consolidation scenarios where simplicity and channel accessibility matter more than deep enterprise complexity.",
    strengths: [
      "Strong channel leverage and partner accessibility — one of the easiest CCaaS platforms for advisors to carry",
      "UC+CC consolidation value for organizations that want communications and contact center on one platform",
      "Fast time-to-value and accessible commercial story for distributed service teams",
      "Growing AI and WEM capabilities in the RingCX product line",
    ],
    weaknesses: [
      "Depth limits emerge in more complex enterprise service operations — WEM, QM, and routing complexity can expose gaps",
      "Brand confusion between current RingCX and legacy RingCentral Contact Center remains a market challenge",
      "Enterprise gravity is lower than Genesys, NICE, Five9, or Cisco in high-stakes evaluations",
    ],
    bestFit: "Distributed service teams, branch service, UC consolidation. Partners already successful in UCaaS who want a CX upsell. SMB to mid-market organizations prioritizing simplicity.",
    notFit: "Highly regulated enterprise or complex BPO deals. Deep WEM/QM/routing complexity requirements.",
    redFlags: [
      "Separate current RingCX from legacy RCC baggage and verify WEM depth carefully",
      "Can be oversold into more complex CCaaS needs than the platform should handle",
    ],
    competitors: ["Zoom", "8x8", "Five9", "Talkdesk", "Vonage"],
    competitiveContext: "RingCentral competes primarily in the UC+CC convergence space against Zoom and 8x8. Against Zoom, RingCentral has a larger installed UC base but weaker brand momentum. Against 8x8, it's a close competitor on value. Against Five9 and Talkdesk, RingCentral needs careful qualification — deeper enterprise evaluations tend to favor the purpose-built CCaaS players.",
  },

  "bright-pattern": {
    name: "Bright Pattern", slug: "bright-pattern", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "Growth Challenger", tier: "Strong Contender", score: 66, website: "brightpattern.com",
    summary: "Useful broad feature set for midmarket service operations where functionality matters more than brand power. Bright Pattern delivers practical omnichannel capability with integrated QM and AI at a competitive price point. A solid midmarket comparator that tends to underperform in high-stakes enterprise selections where ecosystem gravity and prestige signal matter.",
    strengths: [
      "Practical feature breadth covering omnichannel, QM, and AI at a competitive midmarket price point",
      "Simpler deployment model compared to enterprise leaders",
      "Strong outbound and blended capabilities for its segment",
      "Integrated quality management that exceeds some larger competitors in its tier",
    ],
    weaknesses: [
      "Lower ecosystem pull and less top-tier proof than market leaders — weak prestige signal in board-visible selections",
      "Partner and implementation ecosystem is narrower",
      "Enterprise gravity insufficient for the hardest evaluations",
    ],
    bestFit: "Midmarket omnichannel deployments where practical functionality matters more than brand power. Good comparator for buyers who want to pressure-test pricing against the bigger players.",
    notFit: "Board-visible enterprise selections where brand confidence matters. Large-scale transformations requiring deep partner ecosystem.",
    redFlags: ["Good practical option; evaluate carefully whether your organization needs the market confidence that comes with a top-tier brand"],
    competitors: ["Five9", "Talkdesk", "RingCentral", "8x8"],
    competitiveContext: "Bright Pattern competes best when the buyer values functionality-per-dollar over brand gravitas. Usually loses to Five9, Talkdesk, and Genesys when confidence and scale matter more than cost efficiency.",
  },

  "8x8": {
    name: "8x8", slug: "8x8", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "Growth Challenger", tier: "Strong Contender", score: 63, website: "8x8.com",
    summary: "Value-oriented unified UC+CC platform with practical fit for SMB and midmarket buyers. 8x8 delivers omnichannel contact center capability bundled with unified communications, making it compelling for cost-conscious organizations seeking consolidation. Enterprise gravity is limited.",
    strengths: [
      "Unified UC+CC value proposition for organizations wanting a single-vendor communications and service platform",
      "Competitive pricing for SMB-midmarket consolidation",
      "Global reach for its segment — better international presence than some mid-tier competitors",
      "BPO and outsourcer suitability for cost-sensitive operations",
    ],
    weaknesses: [
      "Lower enterprise gravity and shallower operational depth in high-complexity transformations",
      "WEM and QA depth trail purpose-built enterprise CCaaS platforms",
      "Less differentiated AI story compared to market leaders and AI-native challengers",
    ],
    bestFit: "Cost-conscious SMB-midmarket consolidation. Unified UC+CC value plays. Practical omnichannel service without enterprise-scale complexity.",
    notFit: "Large-scale transformation with strict governance demands. Enterprise evaluations where top-tier depth is table stakes.",
    redFlags: ["Useful value option — verify that your complexity requirements won't outgrow the platform within your contract term"],
    competitors: ["RingCentral", "Zoom", "Vonage", "Five9"],
    competitiveContext: "8x8 competes most directly with RingCentral and Zoom in unified-stack value plays. Usually loses to Genesys, NICE, and Five9 in serious enterprise evaluations. Against RingCentral, 8x8 competes on price; against Zoom, 8x8 has less brand momentum.",
  },

  "odigo": {
    name: "Odigo", slug: "odigo", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "Growth Challenger", tier: "Strong Contender", score: 64, website: "odigo.com",
    summary: "Strong regional relevance in Europe, especially in regulated and sovereignty-sensitive sectors. Odigo delivers a credible CCaaS foundation for organizations where European data sovereignty, regulated-industry fit, and regional go-to-market strength matter more than global-market scale.",
    strengths: [
      "Strong sovereignty positioning and European data residency for regulated sectors",
      "Credible platform depth for BFSI, utilities, government, and insurance in Europe",
      "Good AI and self-service capabilities within its geographic focus area",
    ],
    weaknesses: [
      "Not a universal North American or global default — relevance drops significantly outside Europe",
      "Smaller partner ecosystem and lower market mindshare globally",
      "Enterprise gravity is limited to its regional specialization",
    ],
    bestFit: "Europe-first regulated-sector pursuits. BFSI, utilities, government, and insurance organizations with data sovereignty requirements in EMEA.",
    notFit: "North America-led deals with low sovereignty sensitivity. Global enterprise standardization programs.",
    redFlags: ["Strong regional specialist — do not position as a universal answer outside Europe-first requirements"],
    competitors: ["Genesys Cloud CX", "NICE CXone", "Content Guru", "Puzzel"],
    competitiveContext: "Odigo wins in European sovereignty-sensitive contexts where global leaders may face compliance scrutiny. Usually loses to Genesys and NICE in global-enterprise standards deals. Shares some European overlap with Content Guru but with different vertical strengths.",
  },

  "ujet": {
    name: "UJET", slug: "ujet", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "CCaaS Growth Specialist", tier: "Strong Contender", score: 61, website: "ujet.cx",
    summary: "Modern CCaaS story with mobile-first and digital-native relevance. UJET appeals to organizations redesigning customer service around app-centric and digital-native journeys. The platform has genuine AI substance and growing WFM capabilities, but its market footprint is smaller than top-tier leaders.",
    strengths: [
      "Mobile-first and digital-native CX design — strong for app-centric support journeys",
      "Good AI substance for its segment with agent copilot and automation capabilities",
      "Growing WFM capabilities that improve its operational completeness",
    ],
    weaknesses: [
      "Smaller market footprint and brand recognition than enterprise leaders",
      "Deep enterprise breadth and scale proof are still limited compared to Genesys, NICE, or Five9",
      "Legacy-heavy multinational operations are outside its sweet spot",
    ],
    bestFit: "Digital-native customer service redesign. App-centric support models. Organizations wanting modern CX rework rather than legacy migration support.",
    notFit: "Legacy-heavy multinational operations. Enterprise evaluations demanding extensive deployment references at scale.",
    redFlags: ["Interesting challenger — demand proof of production performance rather than relying on the modern-platform narrative alone"],
    competitors: ["Talkdesk", "Five9", "Zoom", "Dialpad"],
    competitiveContext: "UJET competes as a modern challenger against Talkdesk and Zoom in digital-first evaluations. Usually loses to Genesys, NICE, and Five9 when enterprise proof matters. Differentiates on mobile-first design.",
  },

  "avaya": {
    name: "Avaya", slug: "avaya", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "Enterprise Core", tier: "Situational Specialist", score: 61, website: "avaya.com",
    summary: "Still relevant in incumbent accounts with hybrid and migration demands. Avaya carries significant legacy baggage and uneven market confidence, but its installed base remains massive. The platform matters for migration strategy and hybrid coexistence scenarios where ripping and replacing would be more disruptive than staged modernization.",
    strengths: [
      "Massive installed base — still deeply embedded in telecom, government, and healthcare enterprises",
      "Hybrid transition and coexistence capabilities for staged modernization",
      "Enterprise telephony depth and routing maturity from decades of deployment experience",
      "Enterprise gravity score of 4 reflects the organizational inertia that keeps Avaya relevant",
    ],
    weaknesses: [
      "Legacy perception and uneven market confidence remain real — buyer scrutiny is high",
      "AI substance and modern innovation trail every major competitor",
      "WEM and QA depth have fallen behind the market leaders",
      "Gets cut immediately when buyer wants a clean future-state cloud bet",
    ],
    bestFit: "Incumbent defense and staged modernization. Telecom, government, and legacy enterprise accounts where migration reality outweighs future-state purity.",
    notFit: "Greenfield cloud-first enterprise transformations. Any evaluation where the buyer is optimizing for innovation velocity.",
    redFlags: [
      "Do not recommend Avaya unless migration reality genuinely outweighs future-state purity",
      "Financial and organizational stability should be validated independently before committing to a multi-year platform strategy",
    ],
    competitors: ["Genesys Cloud CX", "NICE CXone", "Cisco Webex", "Enghouse"],
    competitiveContext: "Avaya's competitive relevance is almost entirely tied to its installed base. Against Genesys, NICE, and Cisco, Avaya loses in future-state cloud-led deals. Its wins come from incumbent defense scenarios where switching costs and organizational disruption favor staying.",
  },

  "enghouse": {
    name: "Enghouse Interactive", slug: "enghouse", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "Enterprise Core", tier: "Situational Specialist", score: 61, website: "enghouseinteractive.com",
    summary: "Useful flexibility in mixed estates and migration-led strategies. Enghouse's portfolio approach provides contact center solutions that bridge legacy and cloud environments. Strongest when the problem is migration, coexistence, and gradual transformation rather than greenfield inspiration.",
    strengths: [
      "Flexible migration story and broad installed-base utility for mixed-estate coexistence",
      "Useful WFM and telephony depth from a deep portfolio of acquired products",
      "Security and compliance posture that competes with enterprise-grade platforms",
    ],
    weaknesses: [
      "Portfolio complexity and weaker unified cloud-market narrative compared to cloud-native competitors",
      "AI substance trails the market — modern innovation velocity is lower",
      "Gets cut in clean-sheet cloud transformation contests where inspiration matters",
    ],
    bestFit: "Incumbent transitions, coexistence scenarios, and gradual cloud movement. Installed-base transformation programs.",
    notFit: "Net-new cloud-first transformation with executive urgency. Evaluations where a cohesive modern platform narrative matters.",
    redFlags: ["Useful when migration is the problem — evaluate carefully whether you're buying a bridge or a destination"],
    competitors: ["Avaya", "Genesys Cloud CX", "Cisco Webex"],
    competitiveContext: "Enghouse wins in coexistence and migration-led strategies. Loses to Genesys, NICE, and Talkdesk in cleaner cloud-first evaluations. Competes with Avaya for legacy-bridge scenarios.",
  },

  "dialpad": {
    name: "Dialpad", slug: "dialpad", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "SMB / Midmarket Challenger", tier: "Situational Specialist", score: 61, website: "dialpad.com",
    summary: "AI-forward narrative and simple operations that appeal to lean teams. Dialpad has built a strong brand around AI-native communications and contact center capability. The AI substance is real for its segment (agent copilot scored 4), but enterprise control-plane depth has limits that require honest qualification.",
    strengths: [
      "AI-native brand positioning with genuine substance in conversation intelligence and agent copilot",
      "Simple, fast deployment for lean teams that value modern UX",
      "Clean integration story and developer-friendly architecture",
    ],
    weaknesses: [
      "Enterprise governance, routing depth, and WEM capabilities do not match purpose-built enterprise CCaaS platforms",
      "Do not confuse AI-native brand with proven enterprise control-plane depth — the depth question matters in harder evaluations",
      "Partner and implementation ecosystem is limited",
    ],
    bestFit: "Lean AI-forward SMB/midmarket operations. Growth-stage organizations that want modern AI-native communications.",
    notFit: "Highly governed regulated enterprise or BPO environments. Complex multi-site operations.",
    redFlags: ["Do not let brand narrative outrun operational evidence — validate production depth for your complexity level"],
    competitors: ["Zoom", "RingCentral", "Aircall", "8x8"],
    competitiveContext: "Dialpad competes in the AI-native challenger space against Zoom and newer entrants. Usually loses to Genesys, NICE, Five9, and Cisco in enterprise operations. Wins on AI messaging and simplicity with lean buyers.",
  },

  "anywhere-now": {
    name: "AnywhereNow", slug: "anywhere-now", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "Teams-Native Specialist", tier: "Strong Contender", score: 58, website: "anywhere365.io",
    summary: "Relevant Teams-native foundation for Microsoft-standardized enterprise environments. AnywhereNow is compelling when Microsoft Teams is a true strategic constraint and the organization wants contact center capability built natively on Azure and Teams infrastructure. Outside that specific context, its relevance drops significantly.",
    strengths: [
      "True Teams-native architecture — built on Azure and Microsoft stack from the ground up",
      "Good AI copilot capabilities within the Microsoft ecosystem",
      "Relevant for organizations mandating Teams as their enterprise communication standard",
    ],
    weaknesses: [
      "Only compelling when Teams is a true strategic constraint — outside Microsoft-centric estates, relevance is limited",
      "Broader CCaaS depth (routing, WEM, analytics) trails dedicated CCaaS platforms",
      "Lower market mindshare and narrower go-to-market reach",
    ],
    bestFit: "Teams-standardized enterprise service environments. Microsoft-first IT strategies where contact center must align to the Teams and Azure ecosystem.",
    notFit: "Non-Microsoft organizations or multi-stack flexibility demands. General-purpose CCaaS evaluations.",
    redFlags: ["Only relevant when Microsoft is strategic — do not include in evaluations where Teams centrality is weak"],
    competitors: ["Luware", "Cisco Webex", "Genesys Cloud CX"],
    competitiveContext: "AnywhereNow competes with Luware in the Teams-native space. Against Genesys, Cisco, and AWS, it wins only when the Microsoft mandate overrides broader CCaaS depth requirements.",
  },

  "puzzel": {
    name: "Puzzel", slug: "puzzel", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "Growth Challenger", tier: "Situational Specialist", score: 59, website: "puzzel.com",
    summary: "Practical regional contact center platform with usable AI story. Puzzel serves Nordic, UK, and regional service organizations well. The platform delivers solid omnichannel capability for regional operations but lacks the global scale and enterprise governance depth for larger transformations.",
    strengths: [
      "Practical regional platform with usable omnichannel and AI capabilities",
      "Good fit for Nordic, UK, and regional service organizations",
      "Partner accessibility and practical deployment for smaller operations",
      "Integrated QM capabilities that exceed some competitors in its tier",
    ],
    weaknesses: [
      "Limited global enterprise scale — regional scope constrains relevance",
      "Enterprise governance and routing depth trail dedicated enterprise platforms",
    ],
    bestFit: "Regional service organizations in Nordic and UK markets. Hospitality and practical support operations at moderate scale.",
    notFit: "Global enterprise standardization pursuits. Complex regulated environments requiring deep governance.",
    redFlags: ["Keep it regional and practical — do not inflate category position beyond its natural scope"],
    competitors: ["Odigo", "Content Guru", "Bright Pattern"],
    competitiveContext: "Puzzel competes regionally against Odigo and lighter European providers. Loses to Genesys, Five9, and Talkdesk in larger transformation programs.",
  },

  "alvaria": {
    name: "Alvaria", slug: "alvaria", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "Legacy / Specialist", tier: "Limited Fit", score: 59, website: "alvaria.com",
    summary: "Relevant for outreach-heavy and legacy enterprise environments. Alvaria (formerly Aspect + Noble Systems) carries strong outbound and compliant-dialing heritage that remains valuable in collections, outreach, and compliance-intensive outbound scenarios. The broader modern CCaaS narrative is weaker.",
    strengths: [
      "Strong outbound and compliant dialing capabilities — one of the best for collections and compliant outreach",
      "Deep WFM heritage from the Aspect lineage",
      "Enterprise telephony depth and legacy deployment experience",
    ],
    weaknesses: [
      "Not a clean modern broad CCaaS foundation story — AI and cloud-native depth trail the market",
      "Inbound and digital capabilities are less competitive than purpose-built modern CCaaS platforms",
      "Market narrative and brand positioning are weaker than cloud-native competitors",
    ],
    bestFit: "Outbound-heavy or hybrid estates. Collections, compliant outreach, and legacy enterprise operations where outbound is the primary use case.",
    notFit: "General-purpose enterprise CCaaS bakeoffs. Modern inbound-first or digital-first transformations.",
    redFlags: ["Treat as situational specialist only — evaluate whether outbound depth justifies a narrower platform foundation"],
    competitors: ["Five9", "Genesys Cloud CX", "NICE CXone"],
    competitiveContext: "Alvaria wins on outbound heritage and compliant dialing. Loses to nearly any modern broad CCaaS core vendor in general-purpose evaluations. Five9 is the most direct competitor given its strong outbound capabilities on a modern platform.",
  },

  "vonage": {
    name: "Vonage", slug: "vonage", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "Growth Challenger", tier: "Situational Specialist", score: 56, website: "vonage.com",
    summary: "Communications adjacency and integration flexibility that help in specific midmarket cases. Vonage's CCaaS capability is best understood as part of a broader communications platform play rather than a standalone contact center leadership position. CRM-friendly and integration-rich, but lacking enterprise control-plane depth.",
    strengths: [
      "Integration flexibility and CRM-friendly architecture for midmarket use cases",
      "Communications adjacency — useful when contact center is part of a broader comms strategy",
      "Cloud-native architecture and developer-friendly posture",
    ],
    weaknesses: [
      "Enterprise control-plane depth is insufficient for serious CCaaS evaluations",
      "WEM, QA, and routing sophistication trail purpose-built platforms significantly",
      "AI substance is limited compared to both enterprise leaders and AI-native challengers",
    ],
    bestFit: "Midmarket CRM-led and communications-adjacent use cases. Blended comms environments where contact center is secondary to broader communications.",
    notFit: "Regulated enterprise and large BPO operations. Any evaluation where CCaaS foundation depth is scrutinized.",
    redFlags: ["Do not position as universal foundation — evaluate whether the comms-adjacent value justifies a thinner CCaaS layer"],
    competitors: ["RingCentral", "8x8", "Five9"],
    competitiveContext: "Vonage competes in communications-led midmarket scenarios. Loses to Five9, Genesys, and Talkdesk in serious CCaaS selections.",
  },

  "luware": {
    name: "Luware", slug: "luware", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "Teams-Native Specialist", tier: "Strong Contender", score: 55, website: "luware.com",
    summary: "Useful Teams-native customer service platform, especially in Europe. Like AnywhereNow, Luware is only compelling when Microsoft Teams is the mandated communication standard. European-market strength and managed service models are differentiators within this narrow lane.",
    strengths: [
      "Teams-native architecture with European market strength",
      "Managed service model support for partners",
      "Useful in Microsoft-heavy enterprise environments where Teams is mandated",
    ],
    weaknesses: [
      "Microsoft dependence narrows universal relevance significantly",
      "Broader CCaaS depth trails dedicated platforms across routing, WEM, and analytics",
    ],
    bestFit: "Microsoft-native service environments, particularly in Europe. Teams-mandated customer service operations.",
    notFit: "Non-Microsoft enterprise environments. General-purpose CCaaS evaluations.",
    redFlags: ["Important only when Microsoft is strategic — outside Teams-centric contexts, relevance is minimal"],
    competitors: ["AnywhereNow", "Cisco Webex"],
    competitiveContext: "Luware competes with AnywhereNow in the Teams-native space. Against broader CCaaS platforms, both Teams-native vendors win only when the Microsoft mandate is non-negotiable.",
  },

  // ═══════════════════════════════════════════════════════════
  // LIMITED FIT (below 55)
  // ═══════════════════════════════════════════════════════════

  "nextiva": {
    name: "Nextiva", slug: "nextiva", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "SMB / Midmarket Challenger", tier: "Limited Fit", score: 55, website: "nextiva.com",
    summary: "Unified communications plus service value for smaller firms. Nextiva offers all-in-one CX and business phone capability targeted at SMB and lower midmarket buyers. The platform is more SMB-weighted than a true enterprise CCaaS foundation.",
    strengths: ["All-in-one simplicity for SMB buyers", "Competitive bundled pricing", "Growing QM capabilities"],
    weaknesses: ["Enterprise depth is insufficient for serious CCaaS evaluations", "WFM and advanced routing trail the market"],
    bestFit: "SMB-midmarket simplification and bundled CX.", notFit: "Large-scale or regulated service environments.",
    redFlags: ["Do not elevate into enterprise core discussions without evidence of depth at your complexity level"],
    competitors: ["RingCentral", "8x8", "GoTo"],
    competitiveContext: "Competes with RingCentral, 8x8, and GoTo in SMB-midmarket. Loses to every enterprise-core vendor in larger evaluations.",
  },

  "aircall": {
    name: "Aircall", slug: "aircall", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "SMB / Midmarket Challenger", tier: "Limited Fit", score: 49, website: "aircall.io",
    summary: "Fast, modern customer communications for SMB support and sales teams. Aircall delivers easy SMB sale, modern integrations, speed, and usability. It is not a serious enterprise CCaaS foundation — keep evaluation strictly in the SMB lane.",
    strengths: ["Fast modern deployment for SMB", "Strong integrations with CRM and productivity tools", "Good AI agents for its segment"],
    weaknesses: ["Not a serious enterprise CCaaS foundation", "WEM, QA, and routing depth are minimal"],
    bestFit: "SMB sales/support teams and lower-midmarket environments.", notFit: "Regulated enterprise or complex omnichannel operations.",
    redFlags: ["Keep in SMB lane only — gets cut immediately in serious enterprise CCaaS evaluations"],
    competitors: ["Dialpad", "GoTo", "Nextiva"],
    competitiveContext: "Aircall competes with Dialpad and GoTo for SMB buyers. Loses to nearly all enterprise-core platforms.",
  },

  "goto": {
    name: "GoTo Contact Center", slug: "goto", category: "Core CX Platforms (CCaaS)", categorySlug: "ccaas",
    segment: "SMB / Midmarket Challenger", tier: "Limited Fit", score: 43, website: "goto.com",
    summary: "Simple all-in-one contact center fit for smaller organizations. GoTo delivers fast SMB-midmarket consolidation and cost control. Enterprise credibility and regulated-market relevance are weak.",
    strengths: ["Simple all-in-one value for SMB", "Fast consolidation and cost control"],
    weaknesses: ["Weak large-enterprise and regulated-market credibility", "AI, WEM, and routing depth are minimal", "Lower ecosystem gravity than nearly all competitors"],
    bestFit: "Cost-sensitive SMB buyers seeking fast consolidation.", notFit: "Complex multi-site regulated operations. Any enterprise-scale evaluation.",
    redFlags: ["Keep strictly in SMB-midmarket lens — no enterprise relevance"],
    competitors: ["Nextiva", "Aircall", "8x8"],
    competitiveContext: "GoTo competes with Nextiva and Aircall for cost-sensitive SMB buyers. Loses to 8x8, RingCentral, and Five9 in any evaluation with modest complexity.",
  },

  // ═══════════════════════════════════════════════════════════
  // ADJACENT / NON-CORE (not scored as CCaaS foundation)
  // ═══════════════════════════════════════════════════════════

  "sprinklr": {
    name: "Sprinklr", slug: "sprinklr", category: "Adjacent Suite", categorySlug: "adjacent",
    segment: "Adjacent Suite", tier: "Adjacent", score: null, website: "sprinklr.com",
    summary: "Strong digital service and AI relevance, but better treated as an overlay or adjacent suite rather than a core CCaaS foundation. Sprinklr's unified platform covers digital engagement, social listening, and AI-powered service — making it influential in CX stack design even though it should not be scored as a standalone CCaaS anchor.",
    strengths: ["Strong digital service and social engagement capabilities", "AI substance for digital-first service", "Unified platform spanning marketing, service, and engagement"],
    weaknesses: ["Usually not the cleanest pure CCaaS foundation", "Voice and telephony capabilities are secondary to digital"],
    bestFit: "Digital-first service transformation as an overlay to a core CCaaS platform.", notFit: "Standalone CCaaS foundation evaluation.",
    redFlags: ["Evaluate as adjacent stack, not core CCaaS replacement"],
    competitors: ["Zendesk", "Salesforce Service Cloud", "Khoros"],
    competitiveContext: "Sprinklr competes in the digital engagement and unified CX layer. Should be evaluated alongside — not instead of — a core CCaaS platform.",
  },

  "salesforce-service": {
    name: "Salesforce Service Cloud", slug: "salesforce-service", category: "Adjacent Suite", categorySlug: "adjacent",
    segment: "Adjacent Suite", tier: "Adjacent", score: null, website: "salesforce.com",
    summary: "CRM gravity and ecosystem matter heavily in service transformation, but Salesforce is too ecosystem-dependent to score as a pure CCaaS platform. Its influence on contact center strategy is enormous — many CCaaS evaluations are shaped by which platform integrates best with Salesforce.",
    strengths: ["Massive CRM ecosystem and integration gravity", "Service Cloud voice and digital engagement capabilities", "Einstein AI for service predictions and agent assist"],
    weaknesses: ["Too ecosystem-dependent to evaluate as standalone CCaaS", "Telephony requires partner integration (Amazon Connect, etc.)"],
    bestFit: "CRM-first transformation strategy where Salesforce is the system of record.", notFit: "Standalone CCaaS foundation evaluation.",
    redFlags: ["Track as adjacent platform influence — CCaaS selection should complement, not be driven by, Salesforce alone"],
    competitors: ["ServiceNow", "Zendesk", "Microsoft Dynamics"],
    competitiveContext: "Salesforce shapes CCaaS decisions through its CRM gravity. Five9, Talkdesk, and Amazon Connect have the strongest Salesforce integrations among core CCaaS platforms.",
  },

  "servicenow-cx": {
    name: "ServiceNow", slug: "servicenow-cx", category: "Adjacent Suite", categorySlug: "adjacent",
    segment: "Adjacent Suite", tier: "Adjacent", score: null, website: "servicenow.com",
    summary: "Workflow and service-operations strength that can shape contact center strategy. ServiceNow is increasingly relevant in CX stack design — particularly for organizations where IT service management, employee service, and customer service converge. It is not a standalone CCaaS anchor.",
    strengths: ["Workflow orchestration depth that influences CX architecture", "Strong IT/employee/customer service convergence story", "Growing customer service management capabilities"],
    weaknesses: ["Not a standalone CCaaS foundation in most evaluations", "Voice and contact center-specific depth require partner platforms"],
    bestFit: "Workflow-heavy service environments where ServiceNow is already the IT backbone.", notFit: "Standalone CCaaS foundation evaluation.",
    redFlags: ["Track as adjacent workflow platform — should complement core CCaaS, not replace it"],
    competitors: ["Salesforce Service Cloud", "Pega", "Microsoft Dynamics"],
    competitiveContext: "ServiceNow influences CCaaS decisions through its workflow gravity. Organizations heavily invested in ServiceNow should evaluate which CCaaS platforms integrate most cleanly.",
  },

  "zendesk": {
    name: "Zendesk", slug: "zendesk", category: "Adjacent Suite", categorySlug: "adjacent",
    segment: "Adjacent Suite", tier: "Adjacent", score: null, website: "zendesk.com",
    summary: "Very relevant to digital support motions and smaller CX teams, but not a true CCaaS foundation control plane. Zendesk excels in digital customer service workflows and has a strong ecosystem of telephony integrations, but voice and omnichannel contact center depth are secondary to its digital-first heritage.",
    strengths: ["Strong digital customer service workflows", "Large integration ecosystem", "Good fit for smaller CX teams and digital support"],
    weaknesses: ["Not a true CCaaS foundation control plane", "Voice and enterprise contact center depth are limited"],
    bestFit: "Digital support modernization for smaller CX teams.", notFit: "Enterprise contact center foundation evaluation.",
    redFlags: ["Keep in digital engagement evaluation — do not position as CCaaS foundation"],
    competitors: ["Salesforce Service Cloud", "Freshdesk", "Intercom"],
    competitiveContext: "Zendesk competes in digital service against Salesforce Service Cloud and Freshdesk. For organizations needing voice and omnichannel depth, a core CCaaS platform should sit alongside or replace Zendesk.",
  },
};

export const getVendor = (slug) => vendors[slug] || null;
export const getVendorsByCategory = (cat) => Object.values(vendors).filter(v => v.categorySlug === cat);
export const getAllVendors = () => Object.values(vendors);
export const getAllSlugs = () => Object.keys(vendors);
export const getCoreVendors = () => Object.values(vendors).filter(v => v.categorySlug === "ccaas").sort((a,b) => (b.score||0) - (a.score||0));
export const getAdjacentVendors = () => Object.values(vendors).filter(v => v.categorySlug === "adjacent");
