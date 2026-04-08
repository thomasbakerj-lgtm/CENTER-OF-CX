import { useState, useEffect, useRef } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED";
const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };

function useInView(t=.1){const ref=useRef(null);const[v,setV]=useState(false);useEffect(()=>{const el=ref.current;if(!el)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.unobserve(el)}},{threshold:t});o.observe(el);return()=>o.disconnect()},[]);return[ref,v]}
function FadeIn({children,delay=0,style={}}){const[ref,v]=useInView();return<div ref={ref} style={{...style,opacity:v?1:0,transform:v?"translateY(0)":"translateY(22px)",transition:`opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`}}>{children}</div>}
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

function Nav(){const[scrolled,setScrolled]=useState(false);useEffect(()=>{const fn=()=>setScrolled(window.scrollY>50);window.addEventListener("scroll",fn,{passive:true});return()=>window.removeEventListener("scroll",fn)},[]);
const links=[{name:"Platforms & Tech",href:"/platforms-and-tech"},{name:"How to Choose",href:"/how-to-choose"},{name:"Research",href:"/research"},{name:"Vendors",href:"/vendors"},{name:"Advisory",href:"/advisory"}];
return(<><style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}@media(max-width:860px){.nav-links{display:none!important}.resource-grid{grid-template-columns:1fr!important}}`}</style>
<nav style={{position:"fixed",top:0,left:0,right:0,zIndex:1000,background:scrolled?"rgba(6,19,37,0.96)":"transparent",backdropFilter:scrolled?"blur(14px)":"none",borderBottom:scrolled?"1px solid rgba(255,255,255,0.05)":"none",transition:"all 0.35s",padding:scrolled?"12px 0":"20px 0"}}>
<div style={{...WRAP,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
<a href="/" style={{display:"flex",alignItems:"center",gap:10}}><LogoMark size={34}/><span style={{color:"#fff",fontWeight:600,fontSize:14.5,letterSpacing:0.4}}>THE CENTER OF <span style={{color:LIGHT}}>CX</span></span></a>
<div className="nav-links" style={{display:"flex",alignItems:"center",gap:28}}>
{links.map(l=><a key={l.name} href={l.href} style={{color:"rgba(255,255,255,0.7)",fontSize:13.5,fontWeight:500,transition:"color 0.2s"}} onMouseOver={e=>e.target.style.color="#fff"} onMouseOut={e=>e.target.style.color="rgba(255,255,255,0.7)"}>{l.name}</a>)}
<a href="/contact" style={{color:"#fff",fontSize:13,fontWeight:600,background:ELECTRIC,padding:"9px 20px",borderRadius:6}}>Request Briefing</a>
</div></div></nav></>)}

const resources = [
  // ═══ EDITORIAL & NEWS ═══
  {
    name: "CMSWire",
    url: "https://www.cmswire.com",
    tag: "Editorial & Strategy",
    tagColor: "#10B981",
    take: "Best overall if you want a serious mix of CX strategy, leadership, digital experience, contact center, and research-driven editorial. Two decades of serving CX professionals with consistently substantive content.",
    covers: "CX strategy, digital experience, contact center leadership, AI, research-driven editorial",
    audience: "CX leaders, digital experience professionals, enterprise strategists",
  },
  {
    name: "CX Dive",
    url: "https://www.cxdive.com",
    tag: "News",
    tagColor: "#0088DD",
    take: "Best straight-news destination for CX. Operated by Informa TechTarget with tight focus on customer service, personalization, loyalty, AI, and broader CX trends. Clean reporting without vendor influence.",
    covers: "Customer service news, personalization, loyalty programs, AI in CX, industry trends",
    audience: "CX executives, service leaders, industry watchers",
  },
  {
    name: "CX Today",
    url: "https://www.cxtoday.com",
    tag: "CX Tech & Contact Center",
    tagColor: "#3B82F6",
    take: "Best for the contact center plus CX tech stack angle. Covers contact centers, CRM, conversational AI, analytics, and buying-relevant market moves with consistent publishing cadence.",
    covers: "Contact center technology, CRM, conversational AI, analytics, vendor news",
    audience: "Contact center leaders, CX technology buyers, IT decision makers",
  },
  {
    name: "No Jitter",
    url: "https://www.nojitter.com",
    tag: "Enterprise Comms & CC",
    tagColor: "#3B82F6",
    take: "Enterprise Connect's publication covering UC, contact center, and CX technology. Strong on architecture, convergence, and the intersection of communications infrastructure with customer experience.",
    covers: "Unified communications, contact center architecture, CX technology convergence",
    audience: "Enterprise architects, IT leaders, contact center technologists",
  },
  {
    name: "Customer Experience Magazine (CXM)",
    url: "https://www.cxm.co.uk",
    tag: "International CX",
    tagColor: "#0088DD",
    take: "Broadest international CX destination combining news, trends, awards, and community. Strong global perspective that balances North American and European CX thinking.",
    covers: "CX news, trends, awards, global CX community, best practices",
    audience: "CX professionals globally, brand leaders, service design practitioners",
  },
  {
    name: "Destination CRM",
    url: "https://www.destinationcrm.com",
    tag: "CRM & Service",
    tagColor: "#3B82F6",
    take: "One of the longest-running CRM and customer service publications. Covers the intersection of CRM, service operations, and CX technology with editorial depth that comes from decades of market coverage.",
    covers: "CRM technology, customer service, CX strategy, vendor analysis",
    audience: "CRM buyers, service operations leaders, CX strategists",
  },
  {
    name: "MyCustomer",
    url: "https://www.mycustomer.com",
    tag: "International CX",
    tagColor: "#0088DD",
    take: "UK-based CX publication with strong international perspective. Valuable for CX professionals who want thinking beyond the North American vendor ecosystem.",
    covers: "Customer experience strategy, service design, CX leadership, employee experience",
    audience: "CX leaders, service designers, international CX professionals",
  },

  // ═══ PRACTITIONER & OPERATIONS ═══
  {
    name: "Call Centre Helper",
    url: "https://www.callcentrehelper.com",
    tag: "Practitioner Operations",
    tagColor: "#F59E0B",
    take: "Best practitioner site for real-world operations. Built explicitly for contact center, customer service, BPO, and CX professionals who manage queues, teams, and daily service delivery. Current with webinars, events, and operational content.",
    covers: "Contact center operations, workforce management, quality assurance, training, metrics",
    audience: "Contact center managers, team leaders, WFM analysts, QA specialists",
  },
  {
    name: "Contact Center Pipeline",
    url: "https://www.contactcenterpipeline.com",
    tag: "Long-form Operations",
    tagColor: "#F59E0B",
    take: "Best for deeper long-form operational management content. Monthly issues with in-depth articles and first-party research. The kind of publication where a single article can change how you think about a staffing model or QA program.",
    covers: "Contact center management, operational strategy, workforce planning, leadership",
    audience: "Senior contact center leaders, operations directors, workforce planners",
  },
  {
    name: "ICMI",
    url: "https://www.icmi.com",
    tag: "Training & Best Practices",
    tagColor: "#F59E0B",
    take: "Best for contact center best practices, skills development, and management resources. Combines timely industry news with training, certification, research, and operational guidance.",
    covers: "Contact center training, certification, best practices, industry research, events",
    audience: "Contact center professionals at all levels, trainers, operations leaders",
  },
  {
    name: "COPC",
    url: "https://www.copc.com",
    tag: "Standards & Performance",
    tagColor: "#F59E0B",
    take: "The contact center performance standards body. COPC certification and benchmarking frameworks are the operational credibility standard. Essential reference for organizations serious about measurable service quality.",
    covers: "Performance standards, benchmarking, certification, operational excellence, consulting",
    audience: "Operations leaders, quality directors, BPO managers, CX transformation leads",
  },

  // ═══ RESEARCH & COMMUNITY ═══
  {
    name: "CCW Digital",
    url: "https://www.ccw.digital",
    tag: "Research Hub",
    tagColor: "#7C3AED",
    take: "Best research hub for senior contact center and customer contact leaders. 185,000+ member community with consistent research output covering CX trends, workforce evolution, and technology adoption. Their annual event is one of the largest in the industry.",
    covers: "CX research, workforce trends, technology adoption, benchmarks, events",
    audience: "VP-level contact center leaders, CX executives, transformation leaders",
  },
  {
    name: "CX Network",
    url: "https://www.cxnetwork.com",
    tag: "Enterprise Research",
    tagColor: "#7C3AED",
    take: "Best for enterprise-grade CX leadership, benchmarks, and global program thinking. Strong report library and webinar series that serve CX executives managing large-scale programs.",
    covers: "CX benchmarks, leadership frameworks, global CX programs, reports, webinars",
    audience: "Enterprise CX leaders, program directors, transformation executives",
  },
  {
    name: "CustomerThink",
    url: "https://www.customerthink.com",
    tag: "Community & Thought Leadership",
    tagColor: "#7C3AED",
    take: "Best for community-led thought leadership. Founded by Bob Thompson, this is one of the largest customer-centric business communities online. The contributor model surfaces diverse perspectives that vendor-owned publications can't replicate.",
    covers: "CX thought leadership, customer-centric strategy, community perspectives, research",
    audience: "CX strategists, consultants, practitioners, academics",
  },
  {
    name: "Metrigy",
    url: "https://www.metrigy.com",
    tag: "Independent Research",
    tagColor: "#7C3AED",
    take: "Independent research firm focused on CX transformation, AI, and workforce. Robin Gareiss runs serious primary research with real data sets. Valuable for leaders who want analyst insight grounded in operational reality.",
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
      <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "130px 28px 70px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
              <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
              <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>CX Industry</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>
              The CX{" "}<span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Ecosystem</span>
            </h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 620 }}>
              The {resources.length} publications, research hubs, and communities that matter for CX and contact center professionals. We're media-friendly and industry-connected — this page exists because the CX ecosystem is stronger when its best resources are easy to find.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", gap: 20, marginTop: 32, flexWrap: "wrap" }}>
              {[
                { n: resources.filter(r => r.tag.includes("News") || r.tag.includes("Editorial") || r.tag.includes("CX Tech") || r.tag.includes("Enterprise Comms") || r.tag.includes("CRM") || r.tag.includes("International")).length, l: "Editorial & News" },
                { n: resources.filter(r => r.tag.includes("Practitioner") || r.tag.includes("Long-form") || r.tag.includes("Training") || r.tag.includes("Standards")).length, l: "Practitioner & Ops" },
                { n: resources.filter(r => r.tag.includes("Research") || r.tag.includes("Community") || r.tag.includes("Independent")).length, l: "Research & Community" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "14px 20px", textAlign: "center", minWidth: 140 }}>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: LIGHT }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Editorial & News */}
      <section style={{ background: "#fff", padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 4, height: 24, borderRadius: 2, background: "#10B981" }} />
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: NAVY, margin: 0 }}>Editorial, News & Tech Coverage</h2>
            </div>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 32, maxWidth: 600 }}>The publications covering CX strategy, contact center technology, and industry developments with editorial depth and consistent publishing.</p>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }} className="resource-grid">
            {resources.filter(r => ["Editorial & Strategy","News","CX Tech & Contact Center","Enterprise Comms & CC","International CX","CRM & Service"].includes(r.tag)).map((r, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", transition: "all 0.2s", height: "100%" }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,136,221,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
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
              <div style={{ width: 4, height: 24, borderRadius: 2, background: "#F59E0B" }} />
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: NAVY, margin: 0 }}>Practitioner, Operations & Standards</h2>
            </div>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 32, maxWidth: 600 }}>The destinations built for people who manage queues, build WFM models, run QA programs, and develop contact center talent. Operational substance over thought leadership abstraction.</p>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }} className="resource-grid">
            {resources.filter(r => ["Practitioner Operations","Long-form Operations","Training & Best Practices","Standards & Performance"].includes(r.tag)).map((r, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", transition: "all 0.2s", height: "100%" }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = "#F59E0B"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(245,158,11,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: NAVY, margin: "0 0 4px" }}>{r.name}</h3>
                      <span style={{ fontSize: 10, fontWeight: 600, color: r.tagColor, background: `${r.tagColor}10`, padding: "2px 8px", borderRadius: 4 }}>{r.tag}</span>
                    </div>
                    <span style={{ fontSize: 12, color: "#F59E0B", flexShrink: 0, marginTop: 4 }}>↗</span>
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
      <section style={{ background: "#fff", padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 4, height: 24, borderRadius: 2, background: "#7C3AED" }} />
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: NAVY, margin: 0 }}>Research, Community & Analyst Firms</h2>
            </div>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 32, maxWidth: 600 }}>The research hubs, analyst firms, and communities where CX professionals find benchmarks, primary research, and peer perspectives that shape strategy.</p>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }} className="resource-grid">
            {resources.filter(r => ["Research Hub","Enterprise Research","Community & Thought Leadership","Independent Research"].includes(r.tag)).map((r, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", transition: "all 0.2s", height: "100%" }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(124,58,237,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 600, color: NAVY, margin: "0 0 4px" }}>{r.name}</h3>
                      <span style={{ fontSize: 10, fontWeight: 600, color: r.tagColor, background: `${r.tagColor}10`, padding: "2px 8px", borderRadius: 4 }}>{r.tag}</span>
                    </div>
                    <span style={{ fontSize: 12, color: "#7C3AED", flexShrink: 0, marginTop: 4 }}>↗</span>
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
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: NAVY, margin: "8px 0 16px" }}>We score vendors. They cover the industry. Both matter.</h2>
              <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.7 }}>
                The Center of CX provides scored vendor intelligence, buyer frameworks, and advisory services. The publications on this page provide news, community, practitioner guidance, and research that we don't replicate. We're complementary by design — strong CX decisions require both vendor-level depth and industry-wide perspective.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 28, flexWrap: "wrap" }}>
                <a href="/vendors" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Explore Our Vendor Intelligence</a>
                <a href="/contact" style={{ background: "#fff", color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8, border: `1px solid ${BORDER}` }}>Media Inquiries →</a>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={28} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span>
        </div></div>
      </footer>
    </div>
  );
}
