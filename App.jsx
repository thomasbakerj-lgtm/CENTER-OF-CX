import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Analytics } from '@vercel/analytics/react'
import Homepage from './Homepage'
import PlatformsTech from './PlatformsTech'
import About from './About'
import Advisory from './Advisory'
import Contact from './Contact'
import Subscribe from './Subscribe'
import HowToChoose from './HowToChoose'
import Research from './Research'
import Vendors from './Vendors'
import Industries from './Industries'
import TCOCalculator from './TCOCalculator'
import VendorProfile from './VendorProfile'
import CCaaSCategory from './CCaaSCategory'
import IVACategory from './IVACategory'
import ACDRoutingCategory from './ACDRoutingCategory'
import AnalyticsCategory from './AnalyticsCategory'
import PaymentCategory from './PaymentCategory'
import DigitalEngagementCategory from './DigitalEngagementCategory'
import AgentAssistCategory from './AgentAssistCategory'
import CXEcosystem from './CXEcosystem'
import FinancialServicesVertical from './FinancialServicesVertical'
import HealthcareVertical from './HealthcareVertical'
import RetailVertical from './RetailVertical'
import FSSubVerticalPage from './FSSubVerticalPage'
import HCSubVerticalPage from './HCSubVerticalPage'
import RetailSubVerticalPage from './RetailSubVerticalPage'
import TelecomVertical from './TelecomVertical'
import TelecomSubVerticalPage from './TelecomSubVerticalPage'
import TravelVertical from './TravelVertical'
import TravelSubVerticalPage from './TravelSubVerticalPage'
import InsuranceVertical from './InsuranceVertical'
import InsuranceSubVerticalPage from './InsuranceSubVerticalPage'
import UtilitiesVertical from './UtilitiesVertical'
import UtilitiesSubVerticalPage from './UtilitiesSubVerticalPage'
import GovernmentVertical from './GovernmentVertical'
import GovernmentSubVerticalPage from './GovernmentSubVerticalPage'
import ManufacturingVertical from './ManufacturingVertical'
import ManufacturingSubVerticalPage from './ManufacturingSubVerticalPage'
import EducationVertical from './EducationVertical'
import EducationSubVerticalPage from './EducationSubVerticalPage'
import WEMCategory from './WEMCategory'
import GatedReport from './GatedReport'
import HumanPremium from './HumanPremium'
import ArticleCCaaSCosts from './ArticleCCaaSCosts'
import StaffingCalculator from './StaffingCalculator'
import ShrinkagePlanner from './ShrinkagePlanner'
import OccupancyRiskSimulator from './OccupancyRiskSimulator'
import ForecastAccuracyTracker from './ForecastAccuracyTracker'
import ScheduleAdherenceCalculator from './ScheduleAdherenceCalculator'
import AttritionCostCalculator from './AttritionCostCalculator'
import CostPerContactCalculator from './CostPerContactCalculator'
import AIDeflectionRealityCheck from './AIDeflectionRealityCheck'
import ChannelShiftModel from './ChannelShiftModel'
import LicenseBundleGapChecker from './LicenseBundleGapChecker'
import AHTDecomposition from './AHTDecomposition'
import AgentExperienceDiagnostic from './AgentExperienceDiagnostic'
import QAScorecardBuilder from './QAScorecardBuilder'
import FCRLeakageDiagnostic from './FCRLeakageDiagnostic'
import CalibrationDriftChecker from './CalibrationDriftChecker'
import CXMaturity from './CXMaturity'
import AIReadiness from './AIReadiness'
import ExperienceScorecard from './ExperienceScorecard'
import CXITAlignment from './CXITAlignment'
import GovernanceModel from './GovernanceModel'
import ServiceDesign from './ServiceDesign'
import RoadmapBuilder from './RoadmapBuilder'
import IntegrationPlanner from './IntegrationPlanner'
import BusinessCaseBuilder from './BusinessCaseBuilder'

const BASE = "https://contactcentercx.com";
const SITE = "The Center of CX";

const SEO_MAP = {
  "/": {
    title: `${SITE} | Independent CX + Contact Center Technology Intelligence`,
    desc: "276 vendors scored across 8 categories. Buyer guides, interactive tools, and the operational clarity CX leaders need to make confident technology decisions. No vendor sponsorship. No pay-to-play.",
  },
  "/platforms-and-tech": {
    title: `Platforms + Tech | ${SITE}`,
    desc: "Nine CX technology decision domains mapped to seven orchestration layers. Understand what you need, who owns it, and what breaks when you choose wrong.",
  },
  "/about": {
    title: `Our POV | ${SITE}`,
    desc: "How we think about CX technology, why independence matters, and the operating philosophy behind The Center of CX.",
  },
  "/advisory": {
    title: `Advisory Services | ${SITE}`,
    desc: "Vendor-independent CX strategy, vendor evaluation, and transformation advisory for contact center leaders. Backed by scored intelligence across 276 vendors.",
  },
  "/contact": {
    title: `Request a Working Session | ${SITE}`,
    desc: "Tell us your challenge. We come prepared with vendor intelligence, frameworks, and honest assessments tailored to your situation.",
  },
  "/subscribe": {
    title: `Subscribe | ${SITE}`,
    desc: "CX technology intelligence delivered. Vendor updates, framework releases, and market analysis from The Center of CX.",
  },
  "/how-to-choose": {
    title: `How to Choose | Buyer Guides + Interactive Tools | ${SITE}`,
    desc: "Two independently scored buyer guides and ten interactive CX tools. Every output is actionable. No placeholders. No vendor sponsorship.",
  },
  "/research": {
    title: `Research + Insight | ${SITE}`,
    desc: "Original research, market analysis, and operator briefings on CX technology, AI in the contact center, and workforce transformation.",
  },
  "/vendors": {
    title: `Vendor Intelligence | 276 Vendors Scored Across 8 Categories | ${SITE}`,
    desc: "276 vendors across 8 categories. CCaaS, IVA, Agent Assist, WEM, Analytics, ACD/Routing, Digital Engagement, and Payments. Independently scored with published methodologies.",
  },
  "/vendors/ccaas": {
    title: `CCaaS Platform Market Intelligence | 28 Vendors Scored | ${SITE}`,
    desc: "28 CCaaS vendors scored across 7 weighted dimensions. Bell curve placement, scoring methodology, and honest assessments for enterprise buyers.",
  },
  "/vendors/iva": {
    title: `IVA Market Intelligence — 43 Vendors Scored | ${SITE}`,
    desc: "43 IVA vendors scored on Conversational Autonomy, Multi-Channel Coverage, Orchestration Depth, and Analytics. Leaders to Emerging tier placement.",
  },
  "/vendors/acd-routing": {
    title: `ACD + Routing Market Intelligence — 44 Vendors Scored | ${SITE}`,
    desc: "44 ACD/Routing vendors scored across 10 dimensions including routing logic, AI readiness, failover, and global scale. Quadrant matrix and tier rankings.",
  },
  "/vendors/analytics": {
    title: `Advanced Analytics Market Intelligence — 52 Vendors Scored | ${SITE}`,
    desc: "52 analytics vendors across 6 platform categories scored on 7 dimensions. CCaaS-embedded, AI-native, WEM, LLM infrastructure, agent assist, and product analytics.",
  },
  "/vendors/payments": {
    title: `Payment Technology Market Intelligence — 35 Vendors Scored | ${SITE}`,
    desc: "35 payment providers scored across 8 capability dimensions and evaluated through 5 C-suite lenses — CFO, CTO, CIO, COO, and CX.",
  },
  "/vendors/digital-engagement": {
    title: `Digital Engagement Market Intelligence — 50 Platforms Scored | ${SITE}`,
    desc: "50 digital engagement platforms scored across 8 dimensions. The first operator-grade classification of the market — CCaaS-native, messaging, social care, AI automation, and helpdesk.",
  },
  "/vendors/agent-assist": {
    title: `Agent Assist Market Intelligence — 15 Vendors Scored | ${SITE}`,
    desc: "15 agent assist vendors scored across 10 weighted dimensions. Real-time guidance, knowledge grounding, workflow execution, coaching, compliance, and market proof.",
  },
  "/cx-ecosystem": {
    title: `CX Industry Ecosystem — 15 Essential Publications + Communities | ${SITE}`,
    desc: "The 15 publications, research hubs, and communities that matter for CX and contact center professionals. Curated by The Center of CX.",
  },
  "/tools/cx-maturity": {
    title: `CX Maturity Assessment — Score Your Organization | ${SITE}`,
    desc: "Score your CX organization across 5 dimensions — strategy, operations, technology, analytics, and governance. 25 questions. Immediate results with maturity tier and recommendations.",
  },
  "/tools/ai-readiness": {
    title: `AI Readiness Diagnostic — Is Your Contact Center Ready? | ${SITE}`,
    desc: "Evaluate your data quality, workflow design, integration architecture, governance, and talent readiness for AI-driven automation. 24 questions across 6 dimensions.",
  },
  "/tools/experience-scorecard": {
    title: `Experience Scorecard — Benchmark Your Contact Center | ${SITE}`,
    desc: "Enter your contact center metrics and compare against industry benchmarks. CSAT, FCR, AHT, containment, cost per contact, attrition, and more. Graded A through D.",
  },
  "/tools/cx-it-alignment": {
    title: `CX + IT Alignment Framework | ${SITE}`,
    desc: "Rate 15 paired CX and IT statements to reveal alignment gaps in strategy, data, platforms, AI, and governance. Identify where misalignment creates friction.",
  },
  "/tools/governance-model": {
    title: `Governance + Operating Model | ${SITE}`,
    desc: "Map ownership across 30 CX responsibilities — strategy, operations, technology, AI, analytics, and budget. Identify governance gaps and overloaded functions.",
  },
  "/tools/service-design": {
    title: `Service Design Toolkit — Journey Friction Mapper | ${SITE}`,
    desc: "Score your customer journeys on 6 friction dimensions. Get a prioritized friction map showing where to invest in service design improvements.",
  },
  "/tools/roadmap-builder": {
    title: `Transformation Roadmap Builder — 90-Day Plan | ${SITE}`,
    desc: "Build a structured 90-day CX transformation plan with 18 milestones, dependencies, and status tracking across three phases.",
  },
  "/tools/integration-planner": {
    title: `Integration Strategy Planner — Map Your CX Stack | ${SITE}`,
    desc: "Map your technology stack across 7 CX orchestration layers. Identify integration gaps, legacy dependencies, and consolidation opportunities.",
  },
  "/tools/business-case": {
    title: `Business Case Builder — CX Transformation ROI | ${SITE}`,
    desc: "Model the ROI of your CX transformation. Calculate savings from AHT reduction, self-service containment, attrition improvement, and FCR gains.",
  },
  "/tools/staffing-calculator": {
    title: `Staffing Requirement Calculator — Erlang C | ${SITE}`,
    desc: "Convert call volume, AHT, SLA target, and shrinkage into required FTE using Erlang C. Sensitivity analysis shows the cost of being short even one agent.",
  },
  "/tools/shrinkage-planner": {
    title: `Shrinkage Planner — Planned vs Unplanned | ${SITE}`,
    desc: "Model planned and unplanned shrinkage categories. See the staffing gap, effective agents, and annual cost of every point of shrinkage.",
  },
  "/tools/occupancy-risk": {
    title: `Occupancy Risk Simulator | ${SITE}`,
    desc: "See when efficiency becomes burnout. Model how occupancy levels affect agent idle time, attrition risk, and the hidden cost of pushing utilization too high.",
  },
  "/tools/forecast-accuracy": {
    title: `Forecast Accuracy Tracker | ${SITE}`,
    desc: "Compare forecast vs actual by period and channel. Identify bias, measure accuracy, and quantify the cost of forecast error.",
  },
  "/tools/schedule-adherence": {
    title: `Schedule Adherence Impact Calculator | ${SITE}`,
    desc: "See how 2-5 points of adherence loss cascades into ASA degradation, SLA misses, higher abandonment, and overtime cost.",
  },
  "/industries": {
    title: `Industries | ${SITE}`,
    desc: "Ten verticals mapped with CCaaS platforms and vertical-specific overlays. Healthcare, financial services, retail, telecom, insurance, travel, utilities, government, manufacturing, and education.",
  },
  "/industries/financial-services": {
    title: `Financial Services CX Intelligence | ${SITE}`,
    desc: "Vertical-specific CX intelligence for banking, insurance, lending, and wealth management. Benchmarks, technology stack mapping, failure modes, BPO guidance, and vendor recommendations.",
  },
  "/industries/healthcare": {
    title: `Healthcare CX Intelligence | ${SITE}`,
    desc: "Vertical-specific CX intelligence for health systems, payers, providers, and digital health. Patient access benchmarks, HIPAA-aware technology mapping, and failure modes.",
  },
  "/industries/retail": {
    title: `Retail + eCommerce CX Intelligence | ${SITE}`,
    desc: "Vertical-specific CX intelligence for eCommerce, omnichannel retail, subscription, and marketplace operations. Benchmarks, seasonal scaling, and commerce-integrated vendor recommendations.",
  },
  "/industries/telecom": {
    title: `Telecommunications CX Intelligence | ${SITE}`,
    desc: "Vertical-specific CX intelligence for wireless carriers, broadband/ISP, cable, and enterprise communications. Churn reduction, BSS/OSS integration, retention routing, and vendor recommendations.",
  },
  "/research/iva-buyer-guide": {
    title: `IVA + Conversational AI Buyer's Guide 2026 | ${SITE}`,
    desc: "43 vendors scored. The Human Premium framework. Market forecasts through 2029. Independent research — no vendor sponsorship.",
  },
  "/research/ccaas-buyer-guide": {
    title: `CCaaS Platform Buyer's Guide 2026 | ${SITE}`,
    desc: "28 CCaaS platforms scored across 7 dimensions. Strengths, weaknesses, best-fit, and red flags for every major platform.",
  },
  "/human-premium": {
    title: `The Human Premium — Why the Best CX Operations Invest More in People | ${SITE}`,
    desc: "Four new roles, five career paths, twelve certifications, and the growth playbook for CX professionals thriving in the AI era. Technology intelligence without workforce intelligence is half a strategy.",
  },
  "/research/ccaas-migration-costs": {
    title: `Why Your CCaaS Migration Didn't Cut Costs | ${SITE}`,
    desc: "The business case looked clean. Two years later, most organizations are spending the same or more. A 20-year operator breaks down where the money actually went across five CCaaS migrations.",
  },
  "/research/orchestration-framework": {
    title: `The 7-Layer CX Orchestration Framework 2026 | ${SITE}`,
    desc: "How every layer connects, who owns each one, and what to prepare for in the next 12 months. Layer-by-layer deep dives, integration dependencies, and a 14-question readiness checklist.",
  },
  "/tools/staffing-calculator": {
    title: `Staffing Requirement Calculator | Erlang C Staffing Model | ${SITE}`,
    desc: "Convert call volume, AHT, SLA target, and shrinkage into required FTE using Erlang C. Sensitivity analysis shows exactly what happens when you are short.",
  },
  "/tools/shrinkage-planner": {
    title: `Shrinkage Planner | Planned vs Unplanned Shrinkage Modeling | ${SITE}`,
    desc: "Model planned and unplanned shrinkage across 8 categories. See the staffing gap it creates and quantify the annual cost of lost capacity.",
  },
  "/tools/occupancy-risk": {
    title: `Occupancy Risk Simulator | When Efficiency Becomes Burnout | ${SITE}`,
    desc: "See how occupancy levels affect agent idle time, burnout risk, attrition, and hidden turnover costs. The math behind the 85% occupancy threshold.",
  },
  "/tools/forecast-accuracy": {
    title: `Forecast Accuracy Tracker | Forecast vs Actual by Interval | ${SITE}`,
    desc: "Compare forecast vs actual by interval and channel. Calculate MAPE, bias, and identify the intervals where your forecast breaks down.",
  },
  "/tools/schedule-adherence": {
    title: `Schedule Adherence Impact Calculator | ${SITE}`,
    desc: "See how 1-10 points of adherence loss cascade into SLA degradation, ASA spikes, higher abandonment, and overtime cost.",
  },
  "/tools/attrition-cost": {
    title: `Attrition Cost Calculator | The True Cost of Agent Turnover | ${SITE}`,
    desc: "Quantify the full cost of every agent departure: recruiting, training, nesting, ramp-to-proficiency, supervisor burden, overtime, and QA drag.",
  },
  "/tools/cost-per-contact": {
    title: `Cost per Contact vs Cost per Resolution Calculator | ${SITE}`,
    desc: "A $7 call that takes 3 contacts to resolve costs $21. Separate handle cost from resolution cost and quantify the real price of low FCR.",
  },
  "/tools/ai-deflection": {
    title: `AI Deflection Reality Check | Net Savings After the Fine Print | ${SITE}`,
    desc: "Your vendor says 40% deflection. What does net savings look like after bot leakage, containment failure, escalation premiums, and operating costs?",
  },
  "/tools/channel-shift": {
    title: `Channel Shift Economics Model | ${SITE}`,
    desc: "What happens when you move voice to chat, bot, or email? Model the real staffing, cost, and transition impact of channel migration.",
  },
  "/tools/license-gap": {
    title: `License Bundle Gap Checker | List Price vs Real Cost | ${SITE}`,
    desc: "Compare the vendor seat price against what you actually need. WEM, QA, analytics, AI, telephony, storage, support. See the real gap.",
  },
  "/tools/aht-decomposition": {
    title: `AHT Decomposition Tool | Break Handle Time Into Actionable Components | ${SITE}`,
    desc: "Stop reducing AHT generically. Break it into talk, hold, wrap, transfer, search, and admin. Target the segments that are reducible without hurting quality.",
  },
  "/tools/agent-experience": {
    title: `Agent Experience Diagnostic | Five Dimensions That Drive Retention | ${SITE}`,
    desc: "Assess schedule control, tooling, knowledge, supervisor quality, and career visibility. Scored output with attrition risk projection.",
  },
  "/tools/qa-scorecard": {
    title: `QA Scorecard Builder | Weighted Evaluation Forms by Contact Type | ${SITE}`,
    desc: "Build context-specific QA scorecards with weighted dimensions and critical-fail criteria. Test with a sample evaluation. Three templates included.",
  },
  "/tools/fcr-leakage": {
    title: `FCR Leakage Diagnostic | What Drives Repeat Contacts | ${SITE}`,
    desc: "Low FCR is a symptom. This tool identifies the root cause across policy, handoffs, channels, knowledge, skills, and workflows.",
  },
  "/tools/calibration-drift": {
    title: `Calibration Drift Checker | QA Evaluator Consistency Analysis | ${SITE}`,
    desc: "Enter scores from multiple evaluators on the same calls. See inter-rater reliability, evaluator bias, and the calls that generate the most disagreement.",
  },
  "/vendors/wem-qm": {
    title: `Workforce + Quality Management — 25 Vendors Scored | ${SITE}`,
    desc: "WEM, WFM, and QA vendor intelligence across 3 market layers and 3 scoring modes. NICE, Verint, Calabrio, Observe.AI, CallMiner, Cresta and 19 more scored on 8 weighted criteria.",
  },
  "/industries/education": {
    title: `Education CX Intelligence | ${SITE}`,
    desc: "Vertical-specific CX intelligence for admissions, financial aid, student services, IT help desk, and online education. FERPA, enrollment yield, retention, and student lifecycle.",
  },
  "/industries/manufacturing": {
    title: `Manufacturing + Automotive CX Intelligence | ${SITE}`,
    desc: "Vertical-specific CX intelligence for automotive OEM, dealers, industrial B2B, consumer electronics, aerospace, and food manufacturing. Warranty, recalls, parts logistics, and field service.",
  },
  "/industries/government": {
    title: `Government + Public Sector CX Intelligence | ${SITE}`,
    desc: "Vertical-specific CX intelligence for federal, state, local, courts, public safety, and social services. FedRAMP, accessibility, multilingual support, and citizen trust.",
  },
  "/industries/utilities": {
    title: `Utilities + Energy CX Intelligence | ${SITE}`,
    desc: "Vertical-specific CX intelligence for electric, gas, water, municipal, renewable energy, and competitive supply. Storm response, outage management, and regulatory compliance.",
  },
  "/industries/insurance": {
    title: `Insurance CX Intelligence | ${SITE}`,
    desc: "Vertical-specific CX intelligence for P&C, life, commercial, workers comp, specialty lines, and insurtech. Claims management, CAT response, and state DOI compliance.",
  },
  "/industries/travel": {
    title: `Travel + Hospitality CX Intelligence | ${SITE}`,
    desc: "Vertical-specific CX intelligence for airlines, hotels, OTAs, car rental, cruise lines, and tours. Disruption management, multilingual support, and GDS-integrated vendor recommendations.",
  },
  "/tco-calculator": {
    title: `TCO Calculator | ${SITE}`,
    desc: "Model your contact center total cost of ownership across staffing, technology, operations, and transformation. Get a scored breakdown and request a working session.",
  },
};

function SEOManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = SEO_MAP[pathname] || {
      title: `${SITE} | Independent CX Technology Intelligence`,
      desc: "Independent CX and contact center technology intelligence. Vendor scoring, buyer frameworks, and advisory services.",
    };

    if (pathname.startsWith("/vendors/") && !SEO_MAP[pathname]) {
      const slug = pathname.replace("/vendors/", "");
      const vendorName = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      seo.title = `${vendorName} | Vendor Profile | ${SITE}`;
      seo.desc = `Independent assessment of ${vendorName}. Scores, strengths, weaknesses, competitive context, and community reviews.`;
    }

    if (pathname.startsWith("/industries/") && !SEO_MAP[pathname]) {
      const slug = pathname.replace("/industries/", "").split("/")[0];
      const name = slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      seo.title = `${name} CX Intelligence | ${SITE}`;
      seo.desc = `Dedicated CX technology intelligence for ${name}. Sub-vertical frameworks, vendor mapping, benchmarks, and integration pitfalls.`;
    }

    document.title = seo.title;

    const setMeta = (attr, key, content) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };

    // Core meta
    setMeta("name", "description", seo.desc);
    setMeta("name", "robots", "index, follow, max-snippet:-1, max-image-preview:large");
    setMeta("name", "author", "The Center of CX");
    setMeta("name", "publisher", "The Center of CX");

    // Open Graph
    setMeta("property", "og:title", seo.title);
    setMeta("property", "og:description", seo.desc);
    setMeta("property", "og:url", `${BASE}${pathname}`);
    setMeta("property", "og:type", pathname === "/" ? "website" : "article");
    setMeta("property", "og:site_name", "The Center of CX");
    setMeta("property", "og:locale", "en_US");

    // Twitter Card
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", seo.title);
    setMeta("name", "twitter:description", seo.desc);
    setMeta("name", "twitter:site", "@centerofcx");

    // GEO tags
    setMeta("name", "geo.region", "US");
    setMeta("name", "geo.placename", "United States");

    // Topic/category signals
    setMeta("name", "category", "Technology");
    setMeta("name", "coverage", "Worldwide");
    setMeta("name", "topic", "Contact Center Technology, Customer Experience, CX Intelligence, IVA, CCaaS, AI in CX");

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
    canonical.setAttribute("href", `${BASE}${pathname}`);

    // JSON-LD structured data (homepage only)
    if (pathname === "/") {
      let script = document.querySelector('script[data-ld="org"]');
      if (!script) {
        script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-ld", "org");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "The Center of CX",
        "url": BASE,
        "description": "Independent CX and contact center technology intelligence platform. 276 vendors scored across 8 categories.",
        "foundingDate": "2026",
        "sameAs": [],
        "knowsAbout": ["Contact Center Technology", "Customer Experience", "CCaaS", "IVA", "Conversational AI", "Workforce Management", "CX Analytics", "Digital Engagement"]
      });
    }

    // JSON-LD WebSite for sitelinks search
    if (pathname === "/") {
      let ws = document.querySelector('script[data-ld="website"]');
      if (!ws) {
        ws = document.createElement("script");
        ws.type = "application/ld+json";
        ws.setAttribute("data-ld", "website");
        document.head.appendChild(ws);
      }
      ws.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "The Center of CX",
        "url": BASE,
        "description": "Independent CX technology intelligence for enterprise buyers. Vendor scoring, buyer guides, and interactive tools.",
      });
    }

  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <SEOManager />
      <Analytics />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/platforms-and-tech" element={<PlatformsTech />} />
        <Route path="/about" element={<About />} />
        <Route path="/advisory" element={<Advisory />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="/how-to-choose" element={<HowToChoose />} />
        <Route path="/research" element={<Research />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/vendors/ccaas" element={<CCaaSCategory />} />
        <Route path="/vendors/iva" element={<IVACategory />} />
        <Route path="/vendors/acd-routing" element={<ACDRoutingCategory />} />
        <Route path="/vendors/analytics" element={<AnalyticsCategory />} />
        <Route path="/vendors/payments" element={<PaymentCategory />} />
        <Route path="/vendors/digital-engagement" element={<DigitalEngagementCategory />} />
        <Route path="/vendors/agent-assist" element={<AgentAssistCategory />} />
        <Route path="/cx-ecosystem" element={<CXEcosystem />} />
        <Route path="/tools/cx-maturity" element={<CXMaturity />} />
        <Route path="/tools/ai-readiness" element={<AIReadiness />} />
        <Route path="/tools/experience-scorecard" element={<ExperienceScorecard />} />
        <Route path="/tools/cx-it-alignment" element={<CXITAlignment />} />
        <Route path="/tools/governance-model" element={<GovernanceModel />} />
        <Route path="/tools/service-design" element={<ServiceDesign />} />
        <Route path="/tools/roadmap-builder" element={<RoadmapBuilder />} />
        <Route path="/tools/integration-planner" element={<IntegrationPlanner />} />
        <Route path="/tools/business-case" element={<BusinessCaseBuilder />} />
        <Route path="/tools/staffing-calculator" element={<StaffingCalculator />} />
        <Route path="/tools/shrinkage-planner" element={<ShrinkagePlanner />} />
        <Route path="/tools/occupancy-risk" element={<OccupancyRiskSimulator />} />
        <Route path="/tools/forecast-accuracy" element={<ForecastAccuracyTracker />} />
        <Route path="/tools/schedule-adherence" element={<ScheduleAdherenceCalculator />} />
        <Route path="/tools/attrition-cost" element={<AttritionCostCalculator />} />
        <Route path="/tools/cost-per-contact" element={<CostPerContactCalculator />} />
        <Route path="/tools/ai-deflection" element={<AIDeflectionRealityCheck />} />
        <Route path="/tools/channel-shift" element={<ChannelShiftModel />} />
        <Route path="/tools/license-gap" element={<LicenseBundleGapChecker />} />
        <Route path="/tools/aht-decomposition" element={<AHTDecomposition />} />
        <Route path="/tools/agent-experience" element={<AgentExperienceDiagnostic />} />
        <Route path="/tools/qa-scorecard" element={<QAScorecardBuilder />} />
        <Route path="/tools/fcr-leakage" element={<FCRLeakageDiagnostic />} />
        <Route path="/tools/calibration-drift" element={<CalibrationDriftChecker />} />
        <Route path="/vendors/:slug" element={<VendorProfile />} />
        <Route path="/industries" element={<Industries />} />
        <Route path="/industries/financial-services" element={<FinancialServicesVertical />} />
        <Route path="/industries/healthcare" element={<HealthcareVertical />} />
        <Route path="/industries/retail" element={<RetailVertical />} />
        <Route path="/industries/financial-services/:slug" element={<FSSubVerticalPage />} />
        <Route path="/industries/healthcare/:slug" element={<HCSubVerticalPage />} />
        <Route path="/industries/retail/:slug" element={<RetailSubVerticalPage />} />
        <Route path="/industries/telecom" element={<TelecomVertical />} />
        <Route path="/industries/telecom/:slug" element={<TelecomSubVerticalPage />} />
        <Route path="/industries/travel" element={<TravelVertical />} />
        <Route path="/industries/travel/:slug" element={<TravelSubVerticalPage />} />
        <Route path="/industries/insurance" element={<InsuranceVertical />} />
        <Route path="/industries/insurance/:slug" element={<InsuranceSubVerticalPage />} />
        <Route path="/industries/utilities" element={<UtilitiesVertical />} />
        <Route path="/industries/utilities/:slug" element={<UtilitiesSubVerticalPage />} />
        <Route path="/industries/government" element={<GovernmentVertical />} />
        <Route path="/industries/government/:slug" element={<GovernmentSubVerticalPage />} />
        <Route path="/industries/manufacturing" element={<ManufacturingVertical />} />
        <Route path="/industries/manufacturing/:slug" element={<ManufacturingSubVerticalPage />} />
        <Route path="/industries/education" element={<EducationVertical />} />
        <Route path="/industries/education/:slug" element={<EducationSubVerticalPage />} />
        <Route path="/vendors/wem-qm" element={<WEMCategory />} />
        <Route path="/research/:slug" element={<GatedReport />} />
        <Route path="/human-premium" element={<HumanPremium />} />
        <Route path="/research/ccaas-migration-costs" element={<ArticleCCaaSCosts />} />
        <Route path="/tco-calculator" element={<TCOCalculator />} />
      </Routes>
    </BrowserRouter>
  )
}
