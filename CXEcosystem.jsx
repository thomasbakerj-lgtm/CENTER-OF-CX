import { useState, useEffect } from "react";
import { HOUSE, PILLARS, LINE, FINDINGS, alpha } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";

const NAVY = HOUSE.mist; const DEEP = HOUSE.ink; const ELECTRIC = PILLARS.research.onDark; const LIGHT = PILLARS.research.onDark; const WARM = HOUSE.navy; const SLATE = HOUSE.body; const MUTED = HOUSE.muted; const BORDER = alpha(HOUSE.mist, LINE.hair);
const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };

/* Content is visible from the first paint: no reveal on scroll, so a served page, a print and a quick scroll never show an empty band. */
function FadeIn({ children, style = {} }) { return <div style={style}>{children}</div>; }

function Nav(){const[scrolled,setScrolled]=useState(false);useEffect(()=>{const fn=()=>setScrolled(window.scrollY>50);window.addEventListener("scroll",fn,{passive:true});return()=>window.removeEventListener("scroll",fn)},[]);
const links=[{name:"Platforms & Tech",href:"/platforms-and-tech"},{name:"Tools",href:"/tools"},{name:"Research",href:"/research"},{name:"Vendors",href:"/vendors"},{name:"Advisory",href:"/advisory"}];
return(<><style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}@media(max-width:860px){.nav-links{display:none!important}.resource-grid{grid-template-columns:1fr!important}}`}</style>
</>)}

const resources = [
  // ═══ EDITORIAL & NEWS ═══
  {
    name: "CMSWire",
    url: "https://www.cmswire.com",
    tag: "Editorial & Strategy",
    tagColor: FINDINGS.clear.dark,
    take: "Editorial on CX strategy, leadership, digital experience, contact centers and research.",
    covers: "CX strategy, digital experience, contact center leadership, AI, research-driven editorial",
    audience: "CX leaders, digital experience professionals, enterprise strategists",
  },
  {
    name: "CX Dive",
    url: "https://www.customerexperiencedive.com/",
    tag: "News",
    tagColor: HOUSE.sky2,
    take: "Daily news on customer service, personalization, loyalty, AI and wider CX trends, from Industry Dive (Informa TechTarget).",
    covers: "Customer service news, personalization, loyalty programs, AI in CX, industry trends",
    audience: "CX executives, service leaders, industry watchers",
  },
  {
    name: "CX Today",
    url: "https://www.cxtoday.com",
    tag: "CX Tech & Contact Center",
    tagColor: HOUSE.sky2,
    take: "News and analysis on contact center technology, CRM, conversational AI, analytics and vendor moves.",
    covers: "Contact center technology, CRM, conversational AI, analytics, vendor news",
    audience: "Contact center leaders, CX technology buyers, IT decision makers",
  },
  {
    name: "No Jitter",
    url: "https://www.nojitter.com",
    tag: "Enterprise Comms & CC",
    tagColor: HOUSE.sky2,
    take: "Enterprise Connect's publication on unified communications, contact center and CX technology, including architecture and convergence.",
    covers: "Unified communications, contact center architecture, CX technology convergence",
    audience: "Enterprise architects, IT leaders, contact center technologists",
  },
  {
    name: "Customer Experience Magazine (CXM)",
    url: "https://www.cxm.co.uk",
    tag: "International CX",
    tagColor: HOUSE.sky2,
    take: "International CX news, trends, awards and community coverage across North America and Europe.",
    covers: "CX news, trends, awards, global CX community, best practices",
    audience: "CX professionals globally, brand leaders, service design practitioners",
  },
  {
    name: "Destination CRM",
    url: "https://www.destinationcrm.com",
    tag: "CRM & Service",
    tagColor: HOUSE.sky2,
    take: "A long-running publication on CRM, customer service operations and CX technology.",
    covers: "CRM technology, customer service, CX strategy, vendor analysis",
    audience: "CRM buyers, service operations leaders, CX strategists",
  },
  {
    name: "MyCustomer",
    url: "https://www.mycustomer.com",
    tag: "International CX",
    tagColor: HOUSE.sky2,
    take: "A UK-based publication on CX strategy, service design, leadership and employee experience, with an international view.",
    covers: "Customer experience strategy, service design, CX leadership, employee experience",
    audience: "CX leaders, service designers, international CX professionals",
  },

  // ═══ PRACTITIONER & OPERATIONS ═══
  {
    name: "Call Centre Helper",
    url: "https://www.callcentrehelper.com",
    tag: "Practitioner Operations",
    tagColor: PILLARS.industries.onDark,
    take: "Written for people who run contact center, customer service and BPO operations: queues, teams and daily service delivery, plus webinars and events.",
    covers: "Contact center operations, workforce management, quality assurance, training, metrics",
    audience: "Contact center managers, team leaders, WFM analysts, QA specialists",
  },
  {
    name: "Contact Center Pipeline",
    url: "https://www.contactcenterpipeline.com",
    tag: "Long-form Operations",
    tagColor: PILLARS.industries.onDark,
    take: "Monthly issues with long-form articles and first-party research on contact center management, workforce planning and leadership.",
    covers: "Contact center management, operational strategy, workforce planning, leadership",
    audience: "Senior contact center leaders, operations directors, workforce planners",
  },
  {
    name: "ICMI",
    url: "https://www.icmi.com",
    tag: "Training & Best Practices",
    tagColor: PILLARS.industries.onDark,
    take: "Contact center news, training, certification, research and management resources.",
    covers: "Contact center training, certification, best practices, industry research, events",
    audience: "Contact center professionals at all levels, trainers, operations leaders",
  },
  {
    name: "COPC",
    url: "https://www.copc.com",
    tag: "Standards & Performance",
    tagColor: PILLARS.industries.onDark,
    take: "A contact center performance standards body: certification, benchmarking frameworks and consulting on measurable service quality.",
    covers: "Performance standards, benchmarking, certification, operational excellence, consulting",
    audience: "Operations leaders, quality directors, BPO managers, CX transformation leads",
  },

  // ═══ RESEARCH & COMMUNITY ═══
  {
    name: "CCW Digital",
    url: "https://www.ccw.digital",
    tag: "Research Hub",
    tagColor: PILLARS.research.onDark,
    take: "Research, reports and events for contact center and customer contact leaders, covering CX trends, workforce and technology adoption.",
    covers: "CX research, workforce trends, technology adoption, benchmarks, events",
    audience: "VP-level contact center leaders, CX executives, transformation leaders",
  },
  {
    name: "CX Network",
    url: "https://www.cxnetwork.com",
    tag: "Enterprise Research",
    tagColor: PILLARS.research.onDark,
    take: "Benchmarks, reports and webinars for CX leaders running large programs.",
    covers: "CX benchmarks, leadership frameworks, global CX programs, reports, webinars",
    audience: "Enterprise CX leaders, program directors, transformation executives",
  },
  {
    name: "CustomerThink",
    url: "https://www.customerthink.com",
    tag: "Community & Thought Leadership",
    tagColor: PILLARS.research.onDark,
    take: "A contributor-led community on customer-centric strategy, founded by Bob Thompson.",
    covers: "CX thought leadership, customer-centric strategy, community perspectives, research",
    audience: "CX strategists, consultants, practitioners, academics",
  },
  {
    name: "Metrigy",
    url: "https://www.metrigy.com",
    tag: "Independent Research",
    tagColor: PILLARS.research.onDark,
    take: "A research firm publishing primary research on CX transformation, AI adoption and workforce, led by Robin Gareiss.",
    covers: "CX transformation research, AI adoption data, workforce analytics, technology ROI",
    audience: "CX executives, IT leaders, consultants, technology evaluators",
  },
];

export default function CXEcosystem() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const tags = [...new Set(resources.map(r => r.tag))];

  return (
    <div>
      <Nav />

      {/* Hero */}
      <section style={{ background: HOUSE.navy, padding: "130px 28px 70px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "none", backgroundSize: "64px 64px" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
              <a href="/" style={{ color: HOUSE.body, fontSize: 13 }}>Home</a><span style={{ color: HOUSE.body, fontSize: 13 }}>/</span>
              <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>CX Industry</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 style={{ fontFamily: FONT, fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 400, color: HOUSE.mist, lineHeight: 1.1, margin: "0 0 20px" }}>
              The CX{" "}<span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Ecosystem</span>
            </h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: HOUSE.body, lineHeight: 1.7, maxWidth: 620 }}>
              {resources.length} publications, research groups and communities we read, with what each one publishes. None of them pays to appear here, and the list carries no ranking.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", gap: 20, marginTop: 32, flexWrap: "wrap" }}>
              {[
                { n: resources.filter(r => r.tag.includes("News") || r.tag.includes("Editorial") || r.tag.includes("CX Tech") || r.tag.includes("Enterprise Comms") || r.tag.includes("CRM") || r.tag.includes("International")).length, l: "Editorial & News" },
                { n: resources.filter(r => r.tag.includes("Practitioner") || r.tag.includes("Long-form") || r.tag.includes("Training") || r.tag.includes("Standards")).length, l: "Practitioner & Ops" },
                { n: resources.filter(r => r.tag.includes("Research") || r.tag.includes("Community") || r.tag.includes("Independent")).length, l: "Research & Community" },
              ].map((s, i) => (
                <div key={i} style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, borderRadius: 8, padding: "14px 20px", textAlign: "center", minWidth: 140 }}>
                  <div style={{ fontFamily: FONT, fontSize: 24, color: LIGHT }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: HOUSE.body }}>{s.l}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Editorial & News */}
      <section style={{ background: HOUSE.ink, padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 4, height: 24, borderRadius: 2, background: FINDINGS.clear.dark }} />
              <h2 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 400, color: NAVY, margin: 0 }}>Editorial, News & Tech Coverage</h2>
            </div>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 32, maxWidth: 600 }}>The publications covering CX strategy, contact center technology, and industry developments with editorial depth and consistent publishing.</p>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(360px, 100%), 1fr))", gap: 16 }} className="resource-grid">
            {resources.filter(r => ["Editorial & Strategy","News","CX Tech & Contact Center","Enterprise Comms & CC","International CX","CRM & Service"].includes(r.tag)).map((r, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", transition: "all 0.2s", height: "100%" }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: NAVY, margin: "0 0 4px" }}>{r.name}</h3>
                      <span style={{ fontSize: 10, fontWeight: 600, color: r.tagColor, background: `${r.tagColor}10`, padding: "2px 8px", borderRadius: 4 }}>{r.tag}</span>
                    </div>
                    <span style={{ fontSize: 12, color: ELECTRIC, flexShrink: 0, marginTop: 4 }}>↗</span>
                  </div>
                  <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: "0 0 12px" }}>{r.take}</p>
                  <div style={{ fontSize: 11, color: MUTED }}><span style={{ fontWeight: 600, color: SLATE }}>Covers:</span> {r.covers}</div>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Practitioner & Operations */}
      <section style={{ background: WARM, padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 4, height: 24, borderRadius: 2, background: PILLARS.industries.onDark }} />
              <h2 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 400, color: NAVY, margin: 0 }}>Practitioner, Operations & Standards</h2>
            </div>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 32, maxWidth: 600 }}>The destinations built for people who manage queues, build WFM models, run QA programs, and develop contact center talent. Operational substance over thought leadership abstraction.</p>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(360px, 100%), 1fr))", gap: 16 }} className="resource-grid">
            {resources.filter(r => ["Practitioner Operations","Long-form Operations","Training & Best Practices","Standards & Performance"].includes(r.tag)).map((r, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", background: HOUSE.ink, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", transition: "all 0.2s", height: "100%" }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = PILLARS.industries.onDark; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: NAVY, margin: "0 0 4px" }}>{r.name}</h3>
                      <span style={{ fontSize: 10, fontWeight: 600, color: r.tagColor, background: `${r.tagColor}10`, padding: "2px 8px", borderRadius: 4 }}>{r.tag}</span>
                    </div>
                    <span style={{ fontSize: 12, color: PILLARS.industries.onDark, flexShrink: 0, marginTop: 4 }}>↗</span>
                  </div>
                  <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: "0 0 12px" }}>{r.take}</p>
                  <div style={{ fontSize: 11, color: MUTED }}><span style={{ fontWeight: 600, color: SLATE }}>Audience:</span> {r.audience}</div>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Research & Community */}
      <section style={{ background: HOUSE.ink, padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 4, height: 24, borderRadius: 2, background: PILLARS.research.onDark }} />
              <h2 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 400, color: NAVY, margin: 0 }}>Research, Community & Analyst Firms</h2>
            </div>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 32, maxWidth: 600 }}>The research hubs, analyst firms, and communities where CX professionals find benchmarks, primary research, and peer perspectives that shape strategy.</p>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(360px, 100%), 1fr))", gap: 16 }} className="resource-grid">
            {resources.filter(r => ["Research Hub","Enterprise Research","Community & Thought Leadership","Independent Research"].includes(r.tag)).map((r, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", transition: "all 0.2s", height: "100%" }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = PILLARS.research.onDark; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: NAVY, margin: "0 0 4px" }}>{r.name}</h3>
                      <span style={{ fontSize: 10, fontWeight: 600, color: r.tagColor, background: `${r.tagColor}10`, padding: "2px 8px", borderRadius: 4 }}>{r.tag}</span>
                    </div>
                    <span style={{ fontSize: 12, color: PILLARS.research.onDark, flexShrink: 0, marginTop: 4 }}>↗</span>
                  </div>
                  <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: "0 0 12px" }}>{r.take}</p>
                  <div style={{ fontSize: 11, color: MUTED }}><span style={{ fontWeight: 600, color: SLATE }}>Audience:</span> {r.audience}</div>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Our Position */}
      <section style={{ background: WARM, padding: "64px 28px", borderTop: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
              <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Where we fit</span>
              <h2 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 400, color: NAVY, margin: "8px 0 16px" }}>We research vendors. They cover the industry. Both matter.</h2>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7 }}>
                The Center of CX provides vendor intelligence, buyer frameworks, and consultant matching. The publications on this page provide news, community, practitioner guidance, and research that we don't replicate. We're complementary by design: strong CX decisions require both vendor-level depth and industry-wide perspective.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 28, flexWrap: "wrap" }}>
                <a href="/vendors" style={{ background: HOUSE.action, color: HOUSE.paper, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Explore Our Vendor Intelligence</a>
                <a href="/contact" style={{ background: HOUSE.ink, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8, border: `1px solid ${BORDER}` }}>Media Inquiries →</a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      
    </div>
  );
}
