import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
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

const BASE = "https://contactcentercx.com";
const SITE = "The Center of CX";

const SEO_MAP = {
  "/": {
    title: `${SITE} | Independent CX Technology Intelligence`,
    desc: "267 vendors scored across 7 categories with published methodologies. Independent CX and contact center technology intelligence — scored, weighted, honest.",
  },
  "/platforms-and-tech": {
    title: `Platforms & Tech | ${SITE}`,
    desc: "Nine decision domains mapped to seven orchestration layers. A framework for understanding what CX technology you actually need, who owns it, and what breaks when you choose wrong.",
  },
  "/about": {
    title: `Our POV | ${SITE}`,
    desc: "How we think about CX technology, why independence matters, and the operating philosophy behind The Center of CX.",
  },
  "/advisory": {
    title: `Advisory Services | ${SITE}`,
    desc: "Strategy, vendor evaluation, and transformation advisory for CX and contact center leaders. Vendor-independent guidance backed by scored intelligence.",
  },
  "/contact": {
    title: `Request a Working Session | ${SITE}`,
    desc: "Tell us your challenge. We'll come prepared with relevant vendor intelligence, frameworks, and honest assessments.",
  },
  "/subscribe": {
    title: `Subscribe | ${SITE}`,
    desc: "Get CX technology intelligence delivered. Vendor updates, framework releases, and market analysis from The Center of CX.",
  },
  "/how-to-choose": {
    title: `How to Choose | ${SITE}`,
    desc: "Buyer guides, decision frameworks, and evaluation tools for CX technology decisions. Built from operational experience.",
  },
  "/research": {
    title: `Research & Insight | ${SITE}`,
    desc: "Original research, market analysis, and operator briefings on CX technology, AI automation, and contact center transformation.",
  },
  "/vendors": {
    title: `Vendor Intelligence Directory | ${SITE}`,
    desc: "267 vendors across 7 categories — CCaaS, IVA, ACD/Routing, Analytics, Payments, Digital Engagement, and Agent Assist. Scored with published methodologies.",
  },
  "/vendors/ccaas": {
    title: `CCaaS Platform Market Intelligence — 28 Vendors Scored | ${SITE}`,
    desc: "28 CCaaS vendors scored across 27 weighted dimensions. Bell curve placement, scoring methodology, and honest assessments. Strategic Foundation to Limited Fit.",
  },
  "/vendors/iva": {
    title: `IVA Market Intelligence — 43 Vendors Scored | ${SITE}`,
    desc: "43 IVA vendors scored on Conversational Autonomy, Multi-Channel Coverage, Orchestration Depth, and Analytics. Leaders to Emerging tier placement.",
  },
  "/vendors/acd-routing": {
    title: `ACD & Routing Market Intelligence — 44 Vendors Scored | ${SITE}`,
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
    title: `CX Industry Ecosystem — 15 Essential Publications & Communities | ${SITE}`,
    desc: "The 15 publications, research hubs, and communities that matter for CX and contact center professionals. Curated by The Center of CX.",
  },
  "/industries": {
    title: `Industries | ${SITE}`,
    desc: "Ten verticals mapped with CCaaS platforms and vertical-specific overlays. Healthcare, financial services, retail, telecom, insurance, travel, utilities, government, manufacturing, and media.",
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
      seo.title = `${vendorName} — Vendor Profile | ${SITE}`;
      seo.desc = `Independent assessment of ${vendorName}. Strengths, weaknesses, red flags, competitive context, and community reviews.`;
    }

    document.title = seo.title;

    const setMeta = (attr, key, content) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`);
      if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
      el.setAttribute("content", content);
    };

    setMeta("name", "description", seo.desc);
    setMeta("property", "og:title", seo.title);
    setMeta("property", "og:description", seo.desc);
    setMeta("property", "og:url", `${BASE}${pathname}`);
    setMeta("name", "twitter:title", seo.title);
    setMeta("name", "twitter:description", seo.desc);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.setAttribute("rel", "canonical"); document.head.appendChild(canonical); }
    canonical.setAttribute("href", `${BASE}${pathname}`);

  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <SEOManager />
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
        <Route path="/vendors/:slug" element={<VendorProfile />} />
        <Route path="/industries" element={<Industries />} />
        <Route path="/tco-calculator" element={<TCOCalculator />} />
      </Routes>
    </BrowserRouter>
  )
}
