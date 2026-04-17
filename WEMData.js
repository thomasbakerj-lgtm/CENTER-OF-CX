// Workforce & Quality Management — Category Intelligence Data
// 25 active vendors across 3 market layers, 3 scoring modes, 8 weighted criteria

export const categoryMeta = {
  name: "Workforce & Quality Management",
  slug: "wem-qm",
  vendorCount: 25,
  lastUpdated: "April 2026",
  executiveTake: "The workforce and quality stack is no longer one clean market. It has split into four real layers: enterprise WEM/WFO suites, CCaaS-embedded modules, best-of-breed WFM specialists, and AI-first QM/Auto-QA overlays. The mistake is treating them as interchangeable. They are not. WFM is still the harder operational control plane; QM is where AI overlays are fragmenting the market fastest.",
  scoringNote: "Do not force WFM, QM, and AI-QA into one flat leaderboard. Vendors are ranked within the layer they actually compete in. That keeps the shortlist honest and prevents a flashy Auto-QA overlay from outranking a true workforce control plane on the wrong criteria.",
  methodology: "Scores use one framework with three weighting modes. The criteria stay consistent, but the weights change based on whether you are buying a WFM backbone, a balanced WEM suite, or a QA modernization layer. Enterprise depth (1–5) measures suitability for large, complex, multi-site, multi-skill, compliance-heavy operations. AI-QA maturity (1–5) measures credibility of 100% interaction review, auto-scoring, coaching workflows, and operational usability. Scores are analyst judgment based on current official product evidence and market structure, not vendor self-scores.",
  consolidationNote: "Playvox is now folded into NICE. Klaus is now Zendesk QA. CommunityWFM is absorbed into RingCentral's WEM motion. These are not counted as standalone leaders — doing so would distort the market map.",
};

export const scoringCriteria = [
  { id: "forecasting", name: "Forecasting Depth", wfm: 22, balanced: 15, qa: 4, def: "Multiskill forecasting, shrinkage, scenario planning, long-range planning" },
  { id: "intraday", name: "Intraday Management", wfm: 16, balanced: 12, qa: 3, def: "Live reforecasting, schedule moves, SLA response, supervisor control" },
  { id: "adherence", name: "Adherence", wfm: 12, balanced: 10, qa: 3, def: "Real-time adherence, exceptions, actual vs planned visibility" },
  { id: "evaluator", name: "Evaluator Workflow", wfm: 6, balanced: 12, qa: 18, def: "Forms, assignments, disputes, calibration, auditability" },
  { id: "autoqa", name: "AutoQA Explainability", wfm: 8, balanced: 14, qa: 28, def: "How transparent, tunable, and defensible AI scoring is" },
  { id: "coaching", name: "Coaching", wfm: 8, balanced: 10, qa: 18, def: "Closed-loop coaching, action plans, supervisor and agent workflow" },
  { id: "bpo", name: "BPO Support", wfm: 14, balanced: 10, qa: 10, def: "Multi-client fit, role separation, governance, reporting isolation" },
  { id: "integration", name: "Native Integration Risk", wfm: 14, balanced: 17, qa: 16, def: "5=low risk native cohesion; 3=mixed; 1=OEM-heavy or fragmented" },
];

export const leaderboards = {
  wfmBackbone: {
    name: "WFM Backbone Mode",
    description: "Weighted for organizations where workforce management — forecasting, scheduling, intraday, adherence — is the primary buying problem.",
    vendors: [
      { rank: 1, vendor: "NICE", score: 4.86, read: "Best overall labor control plane" },
      { rank: 1, vendor: "Verint", score: 4.86, read: "Peer to NICE for complex enterprise WFM" },
      { rank: 3, vendor: "Calabrio", score: 4.42, read: "Best balanced specialist suite behind top 2" },
      { rank: 4, vendor: "Genesys", score: 4.22, read: "Strong for Genesys estates, less dominant in AI-QA depth" },
      { rank: 5, vendor: "Aspect", score: 3.84, read: "Strongest pure WFM specialist" },
      { rank: 6, vendor: "Amazon Connect", score: 3.64, read: "Strong builder-led WFM, lighter ops governance feel" },
      { rank: 7, vendor: "Assembled", score: 3.50, read: "Excellent modern support-ops WFM, less classic enterprise voice depth" },
      { rank: 8, vendor: "Eleveo", score: 3.48, read: "Credible hybrid specialist, less category gravity" },
    ],
  },
  balancedWEM: {
    name: "Balanced WEM Mode",
    description: "Weighted for organizations wanting both workforce management and quality management in an integrated platform.",
    vendors: [
      { rank: 1, vendor: "NICE", score: 4.90, read: "Best overall combined WEM score" },
      { rank: 2, vendor: "Verint", score: 4.78, read: "Enterprise-grade alternative with strong automation" },
      { rank: 3, vendor: "Calabrio", score: 4.39, read: "Best balance of WFM + QM without mega-suite sprawl" },
      { rank: 4, vendor: "Genesys", score: 4.18, read: "Strong if platform alignment matters more than best-of-breed depth" },
      { rank: 5, vendor: "Zendesk", score: 3.45, read: "Digital-service-first WEM, not voice-first enterprise WEM" },
      { rank: 6, vendor: "RingCentral", score: 3.43, read: "Much more credible post-RingWEM, still proving top-end maturity" },
      { rank: 7, vendor: "Talkdesk", score: 3.41, read: "Good practical option, but mixed architecture drags score" },
      { rank: 8, vendor: "Five9", score: 3.02, read: "Solid embedded path for existing customers, not a WEM leader" },
    ],
  },
  qaModernization: {
    name: "QA Modernization Mode",
    description: "Weighted for organizations where AI-driven quality management — 100% interaction review, auto-scoring, coaching — is the primary buying motion.",
    vendors: [
      { rank: 1, vendor: "Cresta", score: 4.06, read: "Best coaching-forward Auto-QA score" },
      { rank: 2, vendor: "CallMiner", score: 3.98, read: "Strongest compliance/analytics-heavy QA overlay" },
      { rank: 2, vendor: "Zendesk QA", score: 3.98, read: "Strong digital-support QA with real 100% review motion" },
      { rank: 4, vendor: "Observe.AI", score: 3.88, read: "Strongest pure contact-center Auto-QA posture" },
      { rank: 5, vendor: "Scorebuddy", score: 3.80, read: "Strong midmarket/BPO QA operator choice" },
    ],
  },
};

export const marketLayers = {
  fullSuiteWEM: {
    name: "Full-Suite WEM / CCaaS-Embedded",
    description: "Enterprise WEM suites and CCaaS platforms with embedded WFM + QM modules. The control-plane layer.",
    vendors: [
      { rank: 1, vendor: "NICE", segment: "Enterprise WEM suite", entDepth: 5, aiQA: 5, native: "Native", rec: "Best overall control plane if you want broad WFM + mature AI-QA in one stack", bpo: 5 },
      { rank: 2, vendor: "Verint", segment: "Enterprise WEM suite", entDepth: 5, aiQA: 5, native: "Native", rec: "Strongest alternative to NICE for enterprise breadth and automation depth", bpo: 5 },
      { rank: 3, vendor: "Calabrio", segment: "Enterprise WEM suite", entDepth: 5, aiQA: 4, native: "Native", rec: "Best balanced suite if you want less sprawl and clearer WEM focus", bpo: 4 },
      { rank: 4, vendor: "Genesys", segment: "CCaaS-embedded WEM", entDepth: 5, aiQA: 3, native: "Native", rec: "Strong if you are already a Genesys shop and want tighter platform alignment", bpo: 4 },
      { rank: 5, vendor: "Amazon Connect", segment: "CCaaS-embedded WFM/QM", entDepth: 4, aiQA: 4, native: "Native", rec: "Strong for AWS-centric buyers, but still less WEM-mature than NICE/Verint/Calabrio", bpo: 3 },
      { rank: 6, vendor: "Webex", segment: "CCaaS-embedded WFO", entDepth: 4, aiQA: 3, native: "Native", rec: "Legitimate suite, but usually not the first name in advanced WEM evaluations", bpo: 4 },
      { rank: 7, vendor: "Talkdesk", segment: "CCaaS-embedded WEM", entDepth: 4, aiQA: 4, native: "Mixed", rec: "Good fit where native ease matters, but complex WFM often pushes you toward Verint partner path", bpo: 3 },
      { rank: 8, vendor: "Five9", segment: "CCaaS-embedded WEM", entDepth: 4, aiQA: 3, native: "Mixed", rec: "Worth evaluating if already on Five9, but the WEM story is not as clean as the leaders", bpo: 3 },
      { rank: 9, vendor: "RingCentral", segment: "CCaaS-embedded WEM", entDepth: 4, aiQA: 4, native: "Acquired-native", rec: "Now more credible post-CommunityWFM absorption; still needs more proof at top-end scale", bpo: 3 },
      { rank: 10, vendor: "Zendesk", segment: "Digital-service WEM", entDepth: 3, aiQA: 5, native: "Acquired-native", rec: "Strong for digital support QA + WFM, not a voice-first enterprise WEM replacement", bpo: 2 },
      { rank: 11, vendor: "Content Guru", segment: "CCaaS + WEM", entDepth: 4, aiQA: 3, native: "Mixed", rec: "Real platform, but evaluate carefully where WFM depth depends on partner integration paths", bpo: 4 },
      { rank: 12, vendor: "8x8", segment: "CCaaS-embedded WEM", entDepth: 3, aiQA: 3, native: "Mixed", rec: "Improving, but still not where I'd start for complex enterprise WFM-led transformation", bpo: 3 },
    ],
  },
  wfmSpecialists: {
    name: "Best-of-Breed WFM Specialists",
    description: "Pure-play workforce management platforms. These vendors survive because forecasting, scheduling, adherence, shrinkage, and intraday control are harder to fake than AI scorecards.",
    vendors: [
      { rank: 1, vendor: "Aspect", segment: "Specialist WFM", entDepth: 5, aiQA: 2, native: "Native", rec: "Best pure WFM specialist on the shortlist", bpo: 4 },
      { rank: 2, vendor: "Peopleware / injixo", segment: "Specialist WFM", entDepth: 4, aiQA: 2, native: "Native", rec: "Strong modern WFM option, especially where usability and planning workflow matter", bpo: 3 },
      { rank: 3, vendor: "Eleveo", segment: "WFM + QM specialist", entDepth: 4, aiQA: 3, native: "Native", rec: "Best hybrid specialist if you want WFM plus credible QM in one vendor", bpo: 3 },
      { rank: 4, vendor: "Assembled", segment: "Support-ops WFM", entDepth: 3, aiQA: 2, native: "Native", rec: "Very strong for support operations, less proven for classic voice-heavy enterprise WFM", bpo: 3 },
      { rank: 5, vendor: "Pipkins", segment: "Specialist WFM", entDepth: 4, aiQA: 1, native: "Native", rec: "Still viable where WFM rigor matters more than AI gloss", bpo: 3 },
      { rank: 6, vendor: "Enghouse", segment: "WFM specialist / broader CC", entDepth: 3, aiQA: 2, native: "Native", rec: "Relevant, but not first-wave unless you already live in the Enghouse ecosystem", bpo: 3 },
    ],
  },
  aiQAOverlays: {
    name: "AI-QA / Auto-QA Overlays",
    description: "AI-first quality management platforms. Auto-QA is now baseline — the real separation is explainability, calibration, coaching integration, and how cleanly the model output becomes supervisor action.",
    vendors: [
      { rank: 1, vendor: "Observe.AI", segment: "Auto-QA overlay", entDepth: 3, aiQA: 5, native: "Native", rec: "Best pure Auto-QA posture on the board", bpo: 3 },
      { rank: 2, vendor: "CallMiner", segment: "Analytics-led AI-QA", entDepth: 4, aiQA: 5, native: "Native", rec: "Best if QA, compliance, and analytics need to sit together", bpo: 4 },
      { rank: 3, vendor: "Cresta", segment: "AI-QA + coaching", entDepth: 3, aiQA: 5, native: "Native", rec: "Strongest coaching-forward AI-QM play", bpo: 3 },
      { rank: 4, vendor: "MiaRec", segment: "Auto-QA / conversation intelligence", entDepth: 3, aiQA: 4, native: "Native", rec: "Strong practical Auto-QA option with clear contact-center focus", bpo: 3 },
      { rank: 5, vendor: "evaluagent", segment: "QA improvement platform", entDepth: 3, aiQA: 4, native: "Native", rec: "Good fit for modernizing governance, not just automating scoring", bpo: 3 },
      { rank: 6, vendor: "MaestroQA", segment: "QA automation", entDepth: 3, aiQA: 4, native: "Native", rec: "Best fit for support-centric QA modernization", bpo: 2 },
      { rank: 7, vendor: "Scorebuddy", segment: "QA/coaching platform", entDepth: 3, aiQA: 4, native: "Native", rec: "Good option when coaching and QA ops matter as much as scoring coverage", bpo: 4 },
    ],
  },
};

export const buyerShortlists = [
  { situation: "WFM backbone is the primary problem", shortlist: "NICE, Verint, Calabrio, Genesys — then Aspect, Peopleware/injixo, Eleveo for specialist depth", logic: "Buy workforce control first; then add QA depth" },
  { situation: "CCaaS-embedded WEM without a second platform", shortlist: "Amazon Connect, Webex, Talkdesk, Five9, RingCentral — based on your installed base", logic: "Unify admin and data model unless WFM depth is clearly insufficient" },
  { situation: "QA modernization is urgent and telephony is settled", shortlist: "Observe.AI, CallMiner, Cresta — strongest first-wave overlay shortlist", logic: "Overlay on existing CCaaS; don't replace the platform for QA" },
  { situation: "Digital-support-first, not voice-first", shortlist: "Zendesk, Assembled, MaestroQA", logic: "Optimize for support operations workflow, not classic call-center orthodoxy" },
  { situation: "BPO or multi-client operations", shortlist: "NICE, Verint, Calabrio, Aspect, CallMiner, Scorebuddy", logic: "Multi-client governance, role separation, and reporting isolation are non-negotiable" },
  { situation: "Enterprise voice-heavy global operations", shortlist: "NICE, Verint, Aspect, Calabrio — then CallMiner or Observe.AI for QA overlay", logic: "Buy workforce control first; then add QA depth" },
];

export const demoGates = [
  { gate: "Stress Handling Gate", desc: "Vendor must show same-day absenteeism, volume spike, SLA breach, and cross-skill rebalance live.", pass: "Demo shows all four scenarios in the product with clear operational controls.", penalty: -0.5, why: "Prevents polished demos from hiding weak exception handling" },
  { gate: "Evaluator Trust Gate", desc: "Vendor must explain why AI scored an interaction the way it did.", pass: "Demo shows evidence, rationale, tuning logic, and auditability for an AI score.", penalty: -0.5, why: "Auto-QA without explainability is not operationally trustworthy" },
  { gate: "Admin Burden Gate", desc: "Vendor must show scorecard maintenance, model tuning, calibration workflow, and supervisor effort.", pass: "Demo proves manageable admin model with role clarity and low services dependency.", penalty: -0.4, why: "Real TCO is driven by ongoing admin burden, not just license cost" },
  { gate: "Architecture Transparency Gate", desc: "Vendor must map what is native, acquired-native, OEM, and partner-driven.", pass: "Clean architecture map with clear support boundaries.", penalty: -0.3, why: "Vague 'seamless integration' claims hide real operational risk" },
  { gate: "BPO Multi-Tenant Gate", desc: "Vendor must show multi-client governance, role separation, and reporting isolation.", pass: "Demo shows separate client views, permission models, and isolated reporting.", penalty: -0.3, why: "BPO buyers need governance controls that single-tenant demos don't reveal" },
];

export const brutalConclusions = [
  "Do not evaluate WFM and QM as one flat category. You will confuse planning software, QA software, and AI coaching overlays and end up with a bad shortlist.",
  "WFM remains the operational backbone. QM is easier to bolt on than forecasting, scheduling, and intraday control. This is why specialist WFM vendors still survive.",
  "Auto-QA is now table stakes. Any vendor without a believable 100% interaction review story is already behind.",
  "The 'single platform' story is often overstated. Five9 partners with Verint; Talkdesk sells Verint WFM alongside its own; 8x8 has mixed native/OEM architecture. Ask exactly what is native vs partner.",
  "A lot of vendors claim 'quality management' when what they really have is conversation intelligence, agent coaching, or support analytics. Useful, yes. Equivalent to formal QM governance with evaluator workflows, calibration, disputes, and compliance audit trails? No.",
  "The weak move is buying 'WEM' from a vendor whose real strength is only QM or only AI coaching. Another weak move is assuming a partner-led WFM story carries the same roadmap control, support model, and product cohesion as a native suite.",
  "Consolidation is real. Playvox is rolling into NICE, Klaus is now Zendesk QA, CommunityWFM is absorbed into RingCentral. Counting old sub-brands as separate market leaders distorts your map.",
];
