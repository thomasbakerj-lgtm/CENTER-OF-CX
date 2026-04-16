import { useState, useEffect, useRef } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };

function useInView(t=.1){const ref=useRef(null);const[v,setV]=useState(false);useEffect(()=>{const el=ref.current;if(!el)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.unobserve(el)}},{threshold:t});o.observe(el);return()=>o.disconnect()},[]);return[ref,v]}
function FadeIn({children,delay=0,style={}}){const[ref,v]=useInView();return<div ref={ref} style={{...style,opacity:v?1:0,transform:v?"translateY(0)":"translateY(22px)",transition:`opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`}}>{children}</div>}
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

function Nav(){const[scrolled,setScrolled]=useState(false);useEffect(()=>{const fn=()=>setScrolled(window.scrollY>50);window.addEventListener("scroll",fn,{passive:true});return()=>window.removeEventListener("scroll",fn)},[]);
const links=[{name:"Platforms & Tech",href:"/platforms-and-tech"},{name:"How to Choose",href:"/how-to-choose"},{name:"Research",href:"/research"},{name:"Vendors",href:"/vendors"},{name:"Advisory",href:"/advisory"}];
return(<><style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}@media(max-width:860px){.nav-links{display:none!important}.stat-grid{grid-template-columns:1fr 1fr!important}.sub-grid{grid-template-columns:1fr!important}}`}</style>
<nav style={{position:"fixed",top:0,left:0,right:0,zIndex:1000,background:scrolled?"rgba(6,19,37,0.96)":"transparent",backdropFilter:scrolled?"blur(14px)":"none",borderBottom:scrolled?"1px solid rgba(255,255,255,0.05)":"none",transition:"all 0.35s",padding:scrolled?"12px 0":"20px 0"}}>
<div style={{...WRAP,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
<a href="/" style={{display:"flex",alignItems:"center",gap:10}}><LogoMark size={34}/><span style={{color:"#fff",fontWeight:600,fontSize:14.5,letterSpacing:0.4}}>THE CENTER OF <span style={{color:LIGHT}}>CX</span></span></a>
<div className="nav-links" style={{display:"flex",alignItems:"center",gap:28}}>
{links.map(l=><a key={l.name} href={l.href} style={{color:"rgba(255,255,255,0.7)",fontSize:13.5,fontWeight:500}}>{l.name}</a>)}
<a href="/contact" style={{color:"#fff",fontSize:13,fontWeight:600,background:ELECTRIC,padding:"9px 20px",borderRadius:6}}>Request Briefing</a>
</div></div></nav></>)}

export default function TelecomVertical() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const subVerticals = [
    { name: "Mobile / Wireless Carriers", slug: "mobile-wireless", desc: "Plan changes, billing disputes, device support, network coverage complaints, and retention. The highest-volume, highest-churn sub-vertical in all of CX.", contact: "Extreme volume, churn-driven" },
    { name: "Broadband / ISP", slug: "broadband-isp", desc: "Service activation, speed complaints, outage management, billing, and technical troubleshooting. Customers who call their ISP are rarely happy.", contact: "High volume, high frustration" },
    { name: "Cable & Pay TV", slug: "cable-tv", desc: "Package management, billing, equipment troubleshooting, content disputes, and cord-cutting retention. A declining market fighting to keep every subscriber.", contact: "Declining volume, high save urgency" },
    { name: "Enterprise & Business Communications", slug: "enterprise-comms", desc: "UCaaS/SD-WAN support, SLA management, provisioning, circuit troubleshooting, and account management. B2B with revenue-critical uptime requirements.", contact: "Lower volume, very high revenue per account" },
    { name: "Managed Service Providers", slug: "managed-services", desc: "NOC support, incident management, SLA reporting, change requests, and multi-vendor coordination. Technical depth defines the service quality.", contact: "Technical volume, SLA-driven" },
    { name: "Fiber & Infrastructure", slug: "fiber-infrastructure", desc: "Installation scheduling, construction updates, service activation, and wholesale/carrier support. Long lead times with high customer anxiety.", contact: "Project-based, milestone-driven" },
  ];

  const stats = [
    { n: "31%", label: "Annual churn rate in telecommunications", source: "CustomerGauge 2025" },
    { n: "14", label: "Global telecom NPS — lowest of any industry", source: "Simon Kucher 2025" },
    { n: "36%", label: "First contact resolution for mobile and broadband support", source: "Simon Kucher Global Study" },
    { n: "35%", label: "Of consumers satisfied with telecom customer service", source: "Plivo / Industry research" },
    { n: "60%", label: "Of customer churn caused by poor service experience", source: "GITNUX 2025" },
    { n: "70%", label: "Of consumers prioritize reliability over speed", source: "Plivo 2025" },
  ];

  const failureModes = [
    { title: "Billing complexity creates the majority of contact volume", desc: "Promotional pricing that expires, hidden fees, prorated charges, device installments, and taxes create bills that customers cannot understand. 30-40% of inbound calls are billing-related, and the agent often can't explain the bill either because the billing system logic is opaque." },
    { title: "Retention offers reward disloyalty over loyalty", desc: "Customers who threaten to cancel receive better pricing than loyal customers who never complain. This creates a perverse incentive: the best way to get a good deal is to call and threaten to leave. Savvy customers learn the retention playbook and call quarterly for discounts, consuming agent time without genuine churn risk." },
    { title: "Technical support and billing share a queue", desc: "A customer with no internet service (urgent, technical) waits behind a customer disputing a $3 charge (low urgency, billing). Without intent-based routing, urgent service issues compete with routine billing inquiries for the same agents." },
    { title: "Outage communication is reactive instead of proactive", desc: "When a network outage occurs, thousands of customers call to report the same issue. Without proactive outage notifications and IVR intercepts, every affected customer generates a call the agent can't resolve — because the fix is in the network, not the contact center." },
    { title: "Agent attrition is the highest in any industry", desc: "Telecom contact center agents face angry customers, complex systems, and constant pressure to upsell. The combination produces attrition rates of 40-50% annually, which means the average agent has less than 18 months of experience — handling the most complex billing and technical issues." },
  ];

  const stackLayers = [
    { layer: 7, name: "Analytics & Governance", vendors: "NICE Nexidia, Verint, Medallia, Qualtrics", note: "Churn prediction models, NPS drivers, billing complaint root cause, and network experience correlation. Analytics must connect CX data to network data." },
    { layer: 6, name: "Routing & Orchestration", vendors: "Genesys, NICE CXone, Avaya, Cisco", note: "Intent-based routing separating billing, tech support, sales, retention, and outage. Proactive outage IVR intercepts. Retention-skilled agent routing." },
    { layer: 5, name: "Conversation Management", vendors: "LivePerson, Sprinklr, Glia, Ada", note: "Digital-first for billing and account changes. Social media management for network complaints. Proactive outage notifications. In-app support." },
    { layer: 4, name: "Reasoning & Planning", vendors: "Cognigy, Kore.ai, Google CCAI, Amelia", note: "Bill explanation bots, plan comparison bots, outage status bots, speed test integration, and device troubleshooting. High containment potential for routine queries." },
    { layer: 3, name: "Policy & Guardrails", vendors: "Pindrop, Amdocs, CSG, TransUnion", note: "CPNI compliance for customer data protection. FCC regulatory requirements. Credit check and fraud prevention. TCPA consent for marketing communications." },
    { layer: 2, name: "Workflow Execution", vendors: "Amdocs, CSG, Pega, ServiceNow", note: "Service activation, plan change, device upgrade, trouble ticket, and retention save workflows. Order fallout management for failed provisioning." },
    { layer: 1, name: "Data Access", vendors: "Amdocs, CSG, Netcracker, Salesforce Comms Cloud", note: "BSS/OSS integration — billing, CRM, network inventory, service inventory, and order management. The unified customer view across all product lines." },
  ];

  const benchmarks = [
    { metric: "CSAT", avg: "68%", cross: "78%", top: "82%+", note: "Lowest of any major industry — billing confusion, outages, and retention friction suppress scores" },
    { metric: "FCR", avg: "36%", cross: "72%", top: "65%+", note: "Dramatically below average — multi-system complexity and cross-department handoffs prevent resolution" },
    { metric: "AHT", avg: "8:30", cross: "7:00", top: "6:00", note: "Above average — billing explanations, technical troubleshooting, and retention negotiations are long" },
    { metric: "NPS", avg: "14", cross: "32", top: "40+", note: "Lowest of any industry — structural customer frustration with pricing, reliability, and service" },
    { metric: "Attrition", avg: "45%", cross: "35%", top: "20%", note: "Highest of any industry — angry customers, complex systems, and upsell pressure burn agents out" },
    { metric: "Churn", avg: "31%", cross: "20%", top: "15%", note: "Among the highest — driven by competitive switching, price sensitivity, and service frustration" },
  ];

  return (
    <div><Nav />
      <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "130px 28px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn><div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}><a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span><a href="/industries" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Industries</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span><span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>Telecommunications</span></div></FadeIn>
          <FadeIn delay={0.05}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>Telecommunications{" "}<span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CX Intelligence</span></h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 640 }}>Telecom runs on support, retention, billing, service activation, and churn management. With the lowest NPS of any industry and the highest agent attrition, telecom CX operates under structural pressures that no amount of chatbot deflection can solve. This is the vertical-specific intelligence layer — benchmarks, failure modes, technology stack mapping, and vendor recommendations built for carriers, ISPs, and enterprise communications.</p>
          </FadeIn>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "48px 28px", borderBottom: `1px solid ${BORDER}` }}><div style={WRAP}><FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }} className="stat-grid">
          {stats.map((s, i) => (<div key={i} style={{ textAlign: "center", padding: "12px 8px" }}><div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: ELECTRIC }}>{s.n}</div><div style={{ fontSize: 11, color: SLATE, lineHeight: 1.4, marginTop: 4 }}>{s.label}</div><div style={{ fontSize: 9, color: MUTED, marginTop: 2 }}>{s.source}</div></div>))}
        </div>
      </FadeIn></div></section>

      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Sub-Verticals</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Six distinct telecom service models.</h2>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 32 }}>A wireless carrier managing 50 million subscribers and a managed service provider supporting 200 enterprise clients have fundamentally different CX requirements. The technology, staffing, and retention models diverge completely.</p></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }} className="sub-grid">
          {subVerticals.map((sv, i) => (<FadeIn key={i} delay={i * 0.04}><a href={`/industries/telecom/${sv.slug}`} style={{ display: "block", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", height: "100%", transition: "border-color 0.2s", textDecoration: "none", color: "inherit" }} onMouseOver={e => e.currentTarget.style.borderColor = ELECTRIC} onMouseOut={e => e.currentTarget.style.borderColor = BORDER}><h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{sv.name}</h3><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: "0 0 10px" }}>{sv.desc}</p><span style={{ fontSize: 11, color: ELECTRIC, fontWeight: 500 }}>{sv.contact}</span><div style={{ fontSize: 12, fontWeight: 600, color: ELECTRIC, marginTop: 10 }}>Access CX Stack Framework →</div></a></FadeIn>))}
        </div>
      </div></section>

      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: RED, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>What Breaks</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Five failure modes unique to telecom CX.</h2></FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {failureModes.map((fm, i) => (<FadeIn key={i} delay={i * 0.04}><div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", borderLeft: `4px solid ${RED}` }}><h3 style={{ fontSize: 15, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{fm.title}</h3><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{fm.desc}</p></div></FadeIn>))}
        </div>
      </div></section>

      <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "80px 28px" }}><div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn><span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Technology Stack</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Seven orchestration layers, mapped for telecom.</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 600, marginBottom: 36 }}>Layer 1 (Data Access) and Layer 2 (Workflow Execution) carry disproportionate weight because telecom BSS/OSS complexity is the root cause of most CX failures. The billing system, the network inventory, and the order management system determine what the agent can actually do — not just see.</p></FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {stackLayers.map((sl, i) => (<FadeIn key={i} delay={i * 0.03}><div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "20px 22px", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}><div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 16, color: LIGHT }}>{sl.layer}</span></div><div style={{ flex: 1, minWidth: 250 }}><h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>{sl.name}</h3><p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 8px" }}>{sl.note}</p><div style={{ fontSize: 11, color: LIGHT }}>Key vendors: {sl.vendors}</div></div></div></FadeIn>))}
        </div>
      </div></section>

      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Industry Benchmarks</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>How telecom compares.</h2>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 32 }}>Telecom underperforms cross-industry on every major CX metric. The root causes are structural — billing complexity, network dependency, and competitive churn pressure — and require systemic solutions, not incremental improvements.</p></FadeIn>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr style={{ borderBottom: `2px solid ${NAVY}` }}>{["Metric", "Telecom Avg", "Cross-Industry", "Top Quartile", "Why It Differs"].map(h => (<th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: NAVY, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>{benchmarks.map((b, i) => (<tr key={i} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? "#fff" : WARM }}><td style={{ padding: "12px 14px", fontWeight: 600, color: NAVY }}>{b.metric}</td><td style={{ padding: "12px 14px", fontWeight: 700, color: RED }}>{b.avg}</td><td style={{ padding: "12px 14px", color: MUTED }}>{b.cross}</td><td style={{ padding: "12px 14px", color: GREEN, fontWeight: 600 }}>{b.top}</td><td style={{ padding: "12px 14px", color: SLATE, fontSize: 12 }}>{b.note}</td></tr>))}</tbody>
          </table>
        </div>
        <FadeIn delay={0.1}><div style={{ display: "flex", gap: 14, marginTop: 24, flexWrap: "wrap" }}><a href="/tools/experience-scorecard" style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC }}>Score your metrics against these benchmarks →</a><a href="/tco-calculator" style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Model your telecom TCO →</a></div></FadeIn>
      </div></section>

      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: AMBER, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>The BPO Question</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>How outsourcing fits in telecom CX.</h2></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }} className="sub-grid">
          <FadeIn delay={0.04}><div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px" }}><h3 style={{ fontSize: 15, fontWeight: 600, color: GREEN, margin: "0 0 8px" }}>Where BPOs add value</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{["Tier 1 billing inquiries and plan change requests — high volume, scriptable","Device activation and basic setup support","Outbound collections and payment arrangement calls","After-hours coverage for service disruption reporting","Seasonal scaling for product launches and promotional campaigns"].map((item, i) => (<p key={i} style={{ fontSize: 13, color: SLATE, margin: 0, lineHeight: 1.5, paddingLeft: 12, borderLeft: `2px solid ${GREEN}30` }}>{item}</p>))}</div></div></FadeIn>
          <FadeIn delay={0.08}><div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px" }}><h3 style={{ fontSize: 15, fontWeight: 600, color: RED, margin: "0 0 8px" }}>Where BPOs create risk</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{["Retention and save conversations require authority and system access most BPO contracts underspecify","Network troubleshooting above Tier 1 requires NOC access and engineering escalation paths","Enterprise and business accounts need deep product knowledge and SLA awareness","CPNI compliance training gaps create regulatory exposure with FCC penalties","Complex billing disputes require system expertise that generic BPO training can't replicate"].map((item, i) => (<p key={i} style={{ fontSize: 13, color: SLATE, margin: 0, lineHeight: 1.5, paddingLeft: 12, borderLeft: `2px solid ${RED}30` }}>{item}</p>))}</div></div></FadeIn>
        </div>
      </div></section>

      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Vendor Intelligence</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>CCaaS platforms strongest for telecom.</h2></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14, marginTop: 24 }} className="sub-grid">
          {[
            { name: "Genesys", score: 94, why: "Deepest routing for high-volume telecom operations. Predictive routing separates billing, tech support, sales, and retention. Proven at Tier 1 carriers globally.", href: "/vendors/genesys" },
            { name: "NICE CXone", score: 90, why: "Industry-leading WEM for managing 1,000+ agent operations. Churn prediction and retention analytics. Strong compliance controls for CPNI.", href: "/vendors/nice-cxone" },
            { name: "Cisco", score: 78, why: "Network infrastructure heritage creates natural fit for telecom. UCaaS/CCaaS convergence. Strong in carriers with existing Cisco network equipment.", href: "/vendors/cisco" },
            { name: "Avaya", score: 64, why: "Massive installed base in telecom. Many carriers run Avaya on-premise. Cloud migration path via Avaya Experience Platform.", href: "/vendors" },
            { name: "Five9", score: 82, why: "Strong mid-market fit for MVNOs and regional carriers. Reliable CCaaS with practical AI and CRM integration.", href: "/vendors/five9" },
            { name: "Amazon Connect", score: 77, why: "Pay-per-use pricing attractive for carriers with variable volume. AWS ecosystem integration. Best for carriers with cloud engineering depth.", href: "/vendors/amazon-connect" },
          ].map((v, i) => (<FadeIn key={i} delay={i * 0.04}><a href={v.href} style={{ display: "block", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 22px", transition: "all 0.2s", height: "100%" }} onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = "translateY(0)"; }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: 0 }}>{v.name}</h3><span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: ELECTRIC }}>{v.score}</span></div><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{v.why}</p></a></FadeIn>))}
        </div>
        <FadeIn delay={0.2}><div style={{ textAlign: "center", marginTop: 24 }}><a href="/vendors/ccaas" style={{ fontSize: 14, fontWeight: 600, color: ELECTRIC }}>See all 28 CCaaS vendors scored →</a></div></FadeIn>
      </div></section>

      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}><FadeIn>
        <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Evaluating CX technology for telecom?</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>BSS/OSS integration, churn prediction, and retention routing change which platforms are viable. We can help you build a shortlist weighted for your sub-vertical — wireless carrier, broadband, enterprise, or managed services.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>Request a Telecom CX Briefing</a>
              <a href="/tools/cx-maturity" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>Take the CX Maturity Assessment →</a>
            </div>
          </div>
        </div>
      </FadeIn></div></section>

      <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={28} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span></div></div></footer>
    </div>
  );
}
