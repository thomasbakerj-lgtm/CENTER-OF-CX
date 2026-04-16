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

export default function ManufacturingVertical() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const subVerticals = [
    { name: "Automotive OEM", slug: "automotive-oem", desc: "Recalls, warranty, connected vehicle support, EV ownership, and brand loyalty. 30+ million vehicles recalled annually with NHTSA oversight.", contact: "High volume, recall-driven surges" },
    { name: "Automotive Dealer & Retail", slug: "automotive-dealer", desc: "BDC operations, service scheduling, sales follow-up, F&I support, and CSI management. The dealer is the brand experience for most owners.", contact: "Moderate volume, revenue-driven" },
    { name: "Industrial & B2B Manufacturing", slug: "industrial-b2b", desc: "Parts ordering, warranty claims, technical support, field service coordination, and distributor/channel support.", contact: "Lower volume, high technical complexity" },
    { name: "Consumer Electronics & Appliances", slug: "consumer-electronics", desc: "Product setup, troubleshooting, warranty claims, returns, and smart home integration. Post-purchase experience defines repurchase.", contact: "High volume, product complexity varies" },
    { name: "Aerospace & Defense", slug: "aerospace-defense", desc: "MRO support, parts logistics, AOG emergencies, regulatory compliance, and fleet operator technical services.", contact: "Low volume, mission-critical urgency" },
    { name: "Food & Beverage Manufacturing", slug: "food-beverage", desc: "Product quality complaints, allergen inquiries, recall management, retailer support, and consumer hotline.", contact: "Variable — recall-spike-driven" },
  ];
  const stats = [
    { n: "30M+", label: "Vehicles recalled in the US in 2025 across ~1,000 campaigns", source: "NHTSA / AutoInsurance.com" },
    { n: "12M+", label: "Vehicles recalled in Q1 2026 alone — accelerating sharply", source: "BizzyCar Q1 2026" },
    { n: "35%", label: "Of manufacturing churn — highest B2B churn rate by industry", source: "CustomerGauge" },
    { n: "$50B+", label: "Annual US warranty claims cost across all manufacturers", source: "Industry composite" },
    { n: "153", label: "Recalls by Ford alone in 2025 — most of any manufacturer", source: "NHTSA" },
    { n: "78%", label: "Of consumers say post-purchase service affects brand loyalty", source: "Industry research" },
  ];
  const failureModes = [
    { title: "Recall campaigns create massive, unpredictable contact surges", desc: "A single safety recall affecting 2 million vehicles generates 200,000+ calls within weeks — owners asking if their vehicle is affected, how to schedule a repair, and whether it's safe to drive. Without proactive VIN-specific notification and self-service scheduling, every affected owner calls individually." },
    { title: "Warranty claim disputes erode brand loyalty permanently", desc: "A customer whose $800 repair is denied as 'not covered under warranty' will never buy from that brand again — and will tell 10 people. Warranty agents making coverage decisions under time pressure with incomplete vehicle history create the most consequential CX moments in manufacturing." },
    { title: "Connected vehicle and EV support requires a new agent profile", desc: "A Tesla owner calling about over-the-air update failures and a Ford owner calling about a Mustang Mach-E charging issue need agents with software and electrical engineering knowledge — not traditional automotive call center training. The industry hasn't caught up." },
    { title: "Dealer and OEM support are disconnected", desc: "The customer sees one brand. The OEM and dealer operate as separate businesses with separate systems and separate incentives. An owner who calls the OEM about a bad dealer experience gets 'that's the dealer's responsibility.' An owner who calls the dealer about a product defect gets 'call the manufacturer.' Nobody owns the full experience." },
    { title: "B2B manufacturers treat support as cost center, not competitive advantage", desc: "Industrial manufacturers with 48-hour part delivery SLAs and $10,000/hour production line downtime still run support through email ticketing systems with 24-hour response times. The disconnect between the customer's urgency and the manufacturer's response creates channel conflict — customers call their sales rep directly because support is too slow." },
  ];
  const stackLayers = [
    { layer: 7, name: "Analytics & Governance", vendors: "NICE, Verint, Medallia, J.D. Power", note: "Warranty cost analytics, recall completion tracking, CSI/SSI scoring, connected vehicle issue trending, and NPS by product line." },
    { layer: 6, name: "Routing & Orchestration", vendors: "Genesys, NICE CXone, Five9, Cisco", note: "Recall surge routing, warranty tier routing, VIN-based routing, technical escalation paths, and dealer vs OEM routing." },
    { layer: 5, name: "Conversation Management", vendors: "LivePerson, Sprinklr, Ada, Salesforce", note: "Recall notifications, connected vehicle in-car support, proactive maintenance reminders, warranty status portals, and social media management." },
    { layer: 4, name: "Reasoning & Planning", vendors: "Ada, Cognigy, Google CCAI, custom bots", note: "VIN recall lookup bots, warranty coverage verification, troubleshooting guides, parts lookup, and service scheduling." },
    { layer: 3, name: "Policy & Guardrails", vendors: "NHTSA compliance, Magnuson-Moss, UCC", note: "NHTSA recall compliance, Magnuson-Moss Warranty Act, lemon law state requirements, CPSC product safety, and ITAR/EAR for defense." },
    { layer: 2, name: "Workflow Execution", vendors: "Salesforce Mfg Cloud, SAP, Oracle, ServiceMax", note: "Warranty claim adjudication, recall scheduling, field service dispatch, parts order fulfillment, and RMA processing." },
    { layer: 1, name: "Data Access", vendors: "SAP, Oracle, Salesforce Mfg Cloud, DMS (CDK, Reynolds)", note: "ERP/MRP, warranty management, CRM, parts inventory, connected vehicle telemetry, and dealer management systems." },
  ];
  const benchmarks = [
    { metric: "CSAT", avg: "76%", cross: "78%", top: "85%+", note: "Near average — warranty and recall friction offset by product enthusiasm" },
    { metric: "FCR", avg: "60%", cross: "72%", top: "78%+", note: "Below average — warranty decisions, parts availability, and technical complexity require follow-up" },
    { metric: "AHT", avg: "8:30", cross: "7:00", top: "6:00", note: "Above average — VIN lookup, warranty verification, and technical diagnosis are time-intensive" },
    { metric: "Churn (B2B)", avg: "35%", cross: "20%", top: "12%", note: "Highest B2B churn — commoditized products with undifferentiated service" },
    { metric: "Attrition", avg: "30%", cross: "35%", top: "18%", note: "Below average — technical specialization and product knowledge create retention" },
    { metric: "Recall Volume", avg: "30M/yr", cross: "N/A", top: "N/A", note: "Unique to manufacturing — single recalls can drive 100K+ inbound calls" },
  ];
  return (
    <div><Nav />
      <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "130px 28px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn><div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}><a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span><a href="/industries" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Industries</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span><span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>Manufacturing & Automotive</span></div></FadeIn>
          <FadeIn delay={0.05}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>Manufacturing & Automotive{" "}<span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CX Intelligence</span></h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 640 }}>Warranty, recalls, technical support, parts logistics, and post-purchase service define manufacturing CX. With 30+ million vehicles recalled annually, $50B+ in warranty claims, and the highest B2B churn rate of any industry, the contact center is where product quality meets customer loyalty — or doesn't.</p>
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
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Six distinct manufacturing service models.</h2>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 32 }}>An automotive OEM managing 10 million warranty-covered vehicles and an industrial pump manufacturer supporting 5,000 B2B accounts have fundamentally different CX requirements. Consumer vs B2B, recalls vs parts logistics, brand vs channel.</p></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }} className="sub-grid">
          {subVerticals.map((sv, i) => (<FadeIn key={i} delay={i * 0.04}><a href={`/industries/manufacturing/${sv.slug}`} style={{ display: "block", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", height: "100%", transition: "border-color 0.2s", textDecoration: "none", color: "inherit" }} onMouseOver={e => e.currentTarget.style.borderColor = ELECTRIC} onMouseOut={e => e.currentTarget.style.borderColor = BORDER}><h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{sv.name}</h3><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: "0 0 10px" }}>{sv.desc}</p><span style={{ fontSize: 11, color: ELECTRIC, fontWeight: 500 }}>{sv.contact}</span><div style={{ fontSize: 12, fontWeight: 600, color: ELECTRIC, marginTop: 10 }}>Access CX Stack Framework →</div></a></FadeIn>))}
        </div>
      </div></section>
      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: RED, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>What Breaks</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Five failure modes unique to manufacturing CX.</h2></FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {failureModes.map((fm, i) => (<FadeIn key={i} delay={i * 0.04}><div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", borderLeft: `4px solid ${RED}` }}><h3 style={{ fontSize: 15, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{fm.title}</h3><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{fm.desc}</p></div></FadeIn>))}
        </div>
      </div></section>
      <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "80px 28px" }}><div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn><span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Technology Stack</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Seven orchestration layers, mapped for manufacturing.</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 600, marginBottom: 36 }}>Layer 2 (Workflow Execution) carries disproportionate weight because warranty adjudication, recall scheduling, and parts fulfillment are the core workflows that determine CX outcomes. The agent's ability to resolve an issue is constrained by the warranty system's coverage rules and the parts system's inventory.</p></FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {stackLayers.map((sl, i) => (<FadeIn key={i} delay={i * 0.03}><div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "20px 22px", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}><div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 16, color: LIGHT }}>{sl.layer}</span></div><div style={{ flex: 1, minWidth: 250 }}><h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>{sl.name}</h3><p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 8px" }}>{sl.note}</p><div style={{ fontSize: 11, color: LIGHT }}>Key vendors: {sl.vendors}</div></div></div></FadeIn>))}
        </div>
      </div></section>
      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Industry Benchmarks</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>How manufacturing compares.</h2></FadeIn>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr style={{ borderBottom: `2px solid ${NAVY}` }}>{["Metric", "Mfg Avg", "Cross-Industry", "Top Quartile", "Why It Differs"].map(h => (<th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: NAVY, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>{benchmarks.map((b, i) => (<tr key={i} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? "#fff" : WARM }}><td style={{ padding: "12px 14px", fontWeight: 600, color: NAVY }}>{b.metric}</td><td style={{ padding: "12px 14px", fontWeight: 700, color: AMBER }}>{b.avg}</td><td style={{ padding: "12px 14px", color: MUTED }}>{b.cross}</td><td style={{ padding: "12px 14px", color: GREEN, fontWeight: 600 }}>{b.top}</td><td style={{ padding: "12px 14px", color: SLATE, fontSize: 12 }}>{b.note}</td></tr>))}</tbody>
          </table>
        </div>
      </div></section>
      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: AMBER, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>The BPO Question</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>How outsourcing fits in manufacturing CX.</h2></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }} className="sub-grid">
          <FadeIn delay={0.04}><div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px" }}><h3 style={{ fontSize: 15, fontWeight: 600, color: GREEN, margin: "0 0 8px" }}>Where BPOs add value</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{["Recall notification campaigns — high-volume outbound VIN-specific contact","Tier 1 warranty status and parts order tracking","Product registration and basic troubleshooting for consumer products","After-hours roadside assistance and emergency support","CSI survey administration and follow-up for automotive"].map((item, i) => (<p key={i} style={{ fontSize: 13, color: SLATE, margin: 0, lineHeight: 1.5, paddingLeft: 12, borderLeft: `2px solid ${GREEN}30` }}>{item}</p>))}</div></div></FadeIn>
          <FadeIn delay={0.08}><div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px" }}><h3 style={{ fontSize: 15, fontWeight: 600, color: RED, margin: "0 0 8px" }}>Where BPOs create risk</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{["Warranty claim adjudication requires product knowledge and authority BPOs typically lack","Technical troubleshooting for complex products needs engineering-level expertise","Dealer relationship management involves commercial sensitivity and brand authority","NHTSA safety-related complaint documentation has regulatory consequences","Connected vehicle and EV support requires software/firmware knowledge that evolves weekly"].map((item, i) => (<p key={i} style={{ fontSize: 13, color: SLATE, margin: 0, lineHeight: 1.5, paddingLeft: 12, borderLeft: `2px solid ${RED}30` }}>{item}</p>))}</div></div></FadeIn>
        </div>
      </div></section>
      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Vendor Intelligence</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>CCaaS platforms strongest for manufacturing.</h2></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14, marginTop: 24 }} className="sub-grid">
          {[
            { name: "Genesys", score: 94, why: "Deepest routing for multi-product, multi-channel manufacturing operations. VIN-based routing for automotive. Proven at global OEM scale.", href: "/vendors/genesys" },
            { name: "NICE CXone", score: 90, why: "Strong WEM for manufacturing operations with variable volume driven by recalls and product launches. Compliance QA for warranty and safety interactions.", href: "/vendors/nice-cxone" },
            { name: "Five9", score: 82, why: "Good mid-market fit for manufacturing companies scaling from email-based support to omnichannel. Practical AI for parts lookup and warranty status.", href: "/vendors/five9" },
            { name: "Amazon Connect", score: 77, why: "Pay-per-use ideal for recall-driven volume spikes. AWS IoT integration for connected product telemetry. Custom AI for product-specific troubleshooting.", href: "/vendors/amazon-connect" },
            { name: "Talkdesk", score: 78, why: "Fast deployment for manufacturers modernizing from on-premise systems. Good Salesforce integration for manufacturers using Salesforce Manufacturing Cloud.", href: "/vendors/talkdesk" },
            { name: "Salesforce Service Cloud", score: "adj", why: "Not a CCaaS but the dominant CRM for manufacturing service. Warranty management, case management, and field service on one platform.", href: "/vendors/ccaas" },
          ].map((v, i) => (<FadeIn key={i} delay={i * 0.04}><a href={v.href} style={{ display: "block", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 22px", transition: "all 0.2s", height: "100%" }} onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = "translateY(0)"; }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: 0 }}>{v.name}</h3>{v.score !== "adj" ? <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: ELECTRIC }}>{v.score}</span> : <span style={{ fontSize: 10, color: AMBER, fontWeight: 600 }}>Adjacent</span>}</div><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{v.why}</p></a></FadeIn>))}
        </div>
      </div></section>
      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}><FadeIn>
        <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 36px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Evaluating CX technology for manufacturing?</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>Warranty system integration, recall routing, parts inventory connectivity, and connected product telemetry change which platforms are viable. We can help you build a shortlist weighted for your manufacturing sub-vertical.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>Request a Manufacturing CX Briefing</a>
            <a href="/tools/cx-maturity" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>Take the CX Maturity Assessment →</a>
          </div>
        </div>
      </FadeIn></div></section>
      <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={28} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span></div></div></footer>
    </div>
  );
}
