import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { trackTool, toolIdFromPath } from "./src/lib/track"
import { BASE, SITE, resolveSeo } from './src/lib/seo.js'
import { useEffect, useState, lazy, Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
const Homepage = lazy(() => import('./Homepage'))
const PlatformsTech = lazy(() => import('./PlatformsTech'))
const About = lazy(() => import('./About'))
const Advisory = lazy(() => import('./Advisory'))
const Contact = lazy(() => import('./Contact'))
const Subscribe = lazy(() => import('./Subscribe'))
const HowToChoose = lazy(() => import('./HowToChoose'))
const Research = lazy(() => import('./Research'))
const Vendors = lazy(() => import('./Vendors'))
const Industries = lazy(() => import('./Industries'))
const TCOCalculator = lazy(() => import('./TCOCalculator'))
const VendorProfile = lazy(() => import('./VendorProfile'))
const CCaaSCategory = lazy(() => import('./CCaaSCategory'))
const IVACategory = lazy(() => import('./IVACategory'))
const ACDRoutingCategory = lazy(() => import('./ACDRoutingCategory'))
const AnalyticsCategory = lazy(() => import('./AnalyticsCategory'))
const PaymentCategory = lazy(() => import('./PaymentCategory'))
const DigitalEngagementCategory = lazy(() => import('./DigitalEngagementCategory'))
const AgentAssistCategory = lazy(() => import('./AgentAssistCategory'))
const CXEcosystem = lazy(() => import('./CXEcosystem'))
const FinancialServicesVertical = lazy(() => import('./FinancialServicesVertical'))
const HealthcareVertical = lazy(() => import('./HealthcareVertical'))
const RetailVertical = lazy(() => import('./RetailVertical'))
const FSSubVerticalPage = lazy(() => import('./FSSubVerticalPage'))
const HCSubVerticalPage = lazy(() => import('./HCSubVerticalPage'))
const RetailSubVerticalPage = lazy(() => import('./RetailSubVerticalPage'))
const TelecomVertical = lazy(() => import('./TelecomVertical'))
const TelecomSubVerticalPage = lazy(() => import('./TelecomSubVerticalPage'))
const TravelVertical = lazy(() => import('./TravelVertical'))
const TravelSubVerticalPage = lazy(() => import('./TravelSubVerticalPage'))
const InsuranceVertical = lazy(() => import('./InsuranceVertical'))
const InsuranceSubVerticalPage = lazy(() => import('./InsuranceSubVerticalPage'))
const UtilitiesVertical = lazy(() => import('./UtilitiesVertical'))
const UtilitiesSubVerticalPage = lazy(() => import('./UtilitiesSubVerticalPage'))
const GovernmentVertical = lazy(() => import('./GovernmentVertical'))
const GovernmentSubVerticalPage = lazy(() => import('./GovernmentSubVerticalPage'))
const ManufacturingVertical = lazy(() => import('./ManufacturingVertical'))
const ManufacturingSubVerticalPage = lazy(() => import('./ManufacturingSubVerticalPage'))
const EducationVertical = lazy(() => import('./EducationVertical'))
const EducationSubVerticalPage = lazy(() => import('./EducationSubVerticalPage'))
const WEMCategory = lazy(() => import('./WEMCategory'))
const GatedReport = lazy(() => import('./GatedReport'))
const HumanPremium = lazy(() => import('./HumanPremium'))
const ArticleCCaaSCosts = lazy(() => import('./ArticleCCaaSCosts'))
const StaffingCalculator = lazy(() => import('./StaffingCalculator'))
const ShrinkagePlanner = lazy(() => import('./ShrinkagePlanner'))
const OccupancyRiskSimulator = lazy(() => import('./OccupancyRiskSimulator'))
const ForecastAccuracyTracker = lazy(() => import('./ForecastAccuracyTracker'))
const ScheduleAdherenceCalculator = lazy(() => import('./ScheduleAdherenceCalculator'))
const AttritionCostCalculator = lazy(() => import('./AttritionCostCalculator'))
const CostPerContactCalculator = lazy(() => import('./CostPerContactCalculator'))
const AIDeflectionRealityCheck = lazy(() => import('./AIDeflectionRealityCheck'))
const ChannelShiftModel = lazy(() => import('./ChannelShiftModel'))
const LicenseBundleGapChecker = lazy(() => import('./LicenseBundleGapChecker'))
const AHTDecomposition = lazy(() => import('./AHTDecomposition'))
const AgentExperienceDiagnostic = lazy(() => import('./AgentExperienceDiagnostic'))
const QAScorecardBuilder = lazy(() => import('./QAScorecardBuilder'))
const FCRLeakageDiagnostic = lazy(() => import('./FCRLeakageDiagnostic'))
const CalibrationDriftChecker = lazy(() => import('./CalibrationDriftChecker'))
const VendorMatchEngine = lazy(() => import('./VendorMatchEngine'))
const PlatformDecisionMatrix = lazy(() => import('./PlatformDecisionMatrix'))
const ContractRiskScanner = lazy(() => import('./ContractRiskScanner'))
const TransformationReadiness = lazy(() => import('./TransformationReadiness'))
const CategoryVerticalPage = lazy(() => import('./CategoryVerticalPage'))
const RFPRequirementBuilder = lazy(() => import('./RFPRequirementBuilder'))
const PrivacyPolicy = lazy(() => import('./PrivacyPolicy'))
const TermsOfService = lazy(() => import('./TermsOfService'))
const CXMaturity = lazy(() => import('./CXMaturity'))
const AIReadiness = lazy(() => import('./AIReadiness'))
const ExperienceScorecard = lazy(() => import('./ExperienceScorecard'))
const CXITAlignment = lazy(() => import('./CXITAlignment'))
const GovernanceModel = lazy(() => import('./GovernanceModel'))
const ServiceDesign = lazy(() => import('./ServiceDesign'))
const RoadmapBuilder = lazy(() => import('./RoadmapBuilder'))
const IntegrationPlanner = lazy(() => import('./IntegrationPlanner'))
const BusinessCaseBuilder = lazy(() => import('./BusinessCaseBuilder'))


function NotFound() {
  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "160px 28px 80px", textAlign: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 40, fontWeight: 400, color: "#0B1D3A", margin: "0 0 12px" }}>Page not found.</h1>
      <p style={{ fontSize: 16, color: "#6B7F99", maxWidth: 520, lineHeight: 1.7, margin: "0 0 28px" }}>
        That address does not exist on The Center of CX. The tools, vendor profiles, and research are all reachable from the links below.
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <a href="/how-to-choose" style={{ background: "#0088DD", color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 26px", borderRadius: 8, textDecoration: "none" }}>Browse the tools</a>
        <a href="/vendors" style={{ background: "#F8FAFB", border: "1px solid #D8E3ED", color: "#0B1D3A", fontSize: 15, fontWeight: 500, padding: "14px 26px", borderRadius: 8, textDecoration: "none" }}>Vendor intelligence</a>
        <a href="/" style={{ background: "#F8FAFB", border: "1px solid #D8E3ED", color: "#0B1D3A", fontSize: 15, fontWeight: 500, padding: "14px 26px", borderRadius: 8, textDecoration: "none" }}>Home</a>
      </div>
    </div>
  );
}

function LegacyRedirect({ to }) {
  useEffect(() => { window.location.replace(to); }, [to]);
  return null;
}

function SEOManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = resolveSeo(pathname);

    document.title = seo.title;

    const setMeta = (attr, key, content) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };

    // Core meta
    setMeta("name", "description", seo.desc);
    setMeta("name", "robots", seo.known ? "index, follow, max-snippet:-1, max-image-preview:large" : "noindex, follow");
    setMeta("name", "author", "The Center of CX");
    setMeta("name", "publisher", "The Center of CX");

    // Open Graph
    setMeta("property", "og:title", seo.title);
    setMeta("property", "og:description", seo.desc);
    setMeta("property", "og:url", seo.path === "/" ? `${BASE}/` : `${BASE}${seo.path}`);
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
    canonical.setAttribute("href", seo.path === "/" ? `${BASE}/` : `${BASE}${seo.path}`);

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
        "description": "Independent CX and contact center technology intelligence. 283 vendors scored. 30 free tools. Consultant matching for platform selection and AI strategy.",
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

/* Journey
 *
 * tool_view for every tool route, from one call site instead of thirty. The
 * router already knows the path; a per-tool useEffect in every tool file would
 * be thirty copies of the same three lines, each free to drift.
 *
 * This is also where session depth is counted, which is what makes a second
 * tool entered in one visit distinguishable from two unrelated single-tool
 * visits. That distinction is the strongest available proxy for active
 * investigation, and it needs no cross-visit identifier to produce.
 *
 * Non-tool routes are deliberately not tracked here. Pageviews for those are
 * already collected by <Analytics />, which works on the current plan. */
function Journey() {
  const { pathname } = useLocation();
  useEffect(() => {
    const id = toolIdFromPath(pathname);
    if (id) trackTool.view(id);
  }, [pathname]);
  return null;
}

/* RouteFallback
 *
 * Every route is now behind a lazy boundary, so there is a gap between the
 * router matching a path and the chunk arriving. On a warm cache or a fast
 * connection that gap is a few milliseconds, and painting a spinner into it
 * produces a flash that reads as a bug.
 *
 * So the fallback renders nothing for the first 300ms and only then admits it
 * is waiting. 300ms is the point at which a delay stops being perceived as
 * instant response and starts being perceived as an unexplained stall. Below
 * it a spinner costs more than it buys. Above it, silence is worse.
 *
 * minHeight holds the scroll position steady so the footer does not jump up
 * and then back down when the chunk lands. */
function RouteFallback() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "160px 28px 80px" }}>
      {show ? (
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: "#6B7F99", margin: 0 }}>Loading.</p>
      ) : null}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SEOManager />
      <Journey />
      <Analytics />
      <Suspense fallback={<RouteFallback />}>
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
        <Route path="/tools/vendor-match" element={<VendorMatchEngine />} />
        <Route path="/tools/platform-decision" element={<PlatformDecisionMatrix />} />
        <Route path="/tools/contract-risk" element={<ContractRiskScanner />} />
        <Route path="/tools/transformation-readiness" element={<TransformationReadiness />} />
        <Route path="/tools/rfp-builder" element={<RFPRequirementBuilder />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/vendors/:categorySlug/:verticalSlug" element={<CategoryVerticalPage />} />
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
        <Route path="/tools/tco-calculator" element={<TCOCalculator />} />
        <Route path="/tco-calculator" element={<LegacyRedirect to="/tools/tco-calculator" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
