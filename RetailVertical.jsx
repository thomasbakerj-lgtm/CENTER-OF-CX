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

export default function RetailVertical() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const subVerticals = [
    { name: "eCommerce / DTC", slug: "ecommerce-dtc", desc: "Order status, returns, shipping issues, payment disputes, and cart abandonment recovery. Digital-native with chat and messaging-heavy channel mix. Speed defines the experience.", contact: "Very high volume, low AHT, peak seasonality" },
    { name: "Omnichannel Retail", slug: "omnichannel-retail", desc: "Buy online pick up in store, cross-channel returns, inventory inquiries, and loyalty programs. The complexity is in the handoff between digital and physical.", contact: "Mixed channels, complex fulfillment queries" },
    { name: "Subscription & Membership", slug: "subscription-membership", desc: "Billing cycles, cancellation and retention, membership benefits, and recurring order management. Every interaction carries churn risk.", contact: "Moderate volume, high retention stakes" },
    { name: "Marketplace Sellers", slug: "marketplace", desc: "Seller support, buyer disputes, listing issues, payment holds, and policy enforcement. Two-sided marketplace dynamics create unique CX challenges.", contact: "Dual audience, policy-heavy resolution" },
    { name: "Luxury & Specialty", slug: "luxury-specialty", desc: "Concierge-style service, product expertise, after-purchase care, and VIP client management. Experience quality directly influences purchase decisions.", contact: "Lower volume, very high value per interaction" },
    { name: "Grocery & Delivery", slug: "grocery-delivery", desc: "Substitution issues, delivery windows, order modifications, refunds, and real-time logistics communication. Speed and accuracy are non-negotiable.", contact: "High volume, time-sensitive, real-time logistics" },
  ];

  const stats = [
    { n: "93%", label: "Of customers make repeat purchases from companies with excellent service", source: "HubSpot" },
    { n: "$3.7T", label: "Lost globally each year due to poor customer experiences", source: "Qualtrics XM Institute" },
    { n: "75%", label: "Average FCR rate in eCommerce contact centers", source: "Sprinklr" },
    { n: "78%", label: "Of Gen Z shoppers try to resolve issues independently first", source: "Shopify" },
    { n: "42%", label: "Annual agent attrition rate in retail contact centers", source: "Industry composite" },
    { n: "12x", label: "Cost difference: $0.50 per AI interaction vs $6.00 per human agent", source: "Tidio" },
  ];

  const failureModes = [
    { title: "Returns and fulfillment create 40-60% of contact volume", desc: "\"Where is my order\" and \"how do I return this\" dominate retail contact centers. Without real-time OMS integration and proactive shipping notifications, agents spend most of their time on status lookups that automation should handle." },
    { title: "Seasonal staffing spikes destroy quality", desc: "Retail contact centers can see 3-5x volume during peak seasons. Rapid hiring of temporary agents with minimal training creates inconsistent service quality at the exact moment customer expectations are highest." },
    { title: "Channel fragmentation loses the customer", desc: "Only 31% of eCommerce retailers support more than 2 channels. Customers who start on chat, call about the same issue, and email a follow-up experience the same problem three different ways. Context dies at every channel boundary." },
    { title: "Revenue-generating interactions get buried in service queues", desc: "Pre-purchase product questions, cart recovery opportunities, and upsell moments sit in the same queue as complaint handling. Without intent-based routing, revenue conversations wait behind refund requests." },
    { title: "Self-service deflects but doesn't resolve", desc: "Retailers invest in FAQ bots and help centers, but if the self-service path hits a wall (wrong tracking info, policy exception, damaged item), the handoff to a human agent loses all context. The customer starts over, angrier than before." },
  ];

  const stackLayers = [
    { layer: 7, name: "Analytics & Governance", vendors: "CallMiner, NICE Nexidia, Qualtrics, Medallia", note: "Post-purchase sentiment tracking. Returns root cause analysis. Agent performance during peak seasons. Review and social sentiment correlation." },
    { layer: 6, name: "Routing & Orchestration", vendors: "Genesys, NICE CXone, Talkdesk Retail, Five9", note: "Intent-based routing separating pre-purchase, order status, returns, and escalations. VIP and loyalty tier routing. Peak season overflow management." },
    { layer: 5, name: "Conversation Management", vendors: "Gladly, Gorgias, Zendesk, Intercom, Ada, Kustomer", note: "Chat and messaging as primary channels. Social commerce integration. Proactive order status notifications. Cart abandonment outreach." },
    { layer: 4, name: "Reasoning & Planning", vendors: "Ada, Forethought, Cognigy, Salesforce Einstein", note: "Order status bots with real-time OMS data. Returns eligibility automation. Product recommendation AI. Size and fit guidance." },
    { layer: 3, name: "Policy & Guardrails", vendors: "Forter, Sift, Signifyd, Stripe Radar", note: "Fraud prevention in returns and exchanges. Payment dispute management. Policy exception handling logic. Chargeback prevention." },
    { layer: 2, name: "Workflow Execution", vendors: "Shopify Flow, MuleSoft, Workato, Celigo", note: "Returns processing automation. Refund workflow orchestration. Inventory check integration. Loyalty point adjustment." },
    { layer: 1, name: "Data Access", vendors: "Shopify, Salesforce Commerce, SAP, Oracle Commerce, BigCommerce", note: "OMS, inventory, customer order history, loyalty program data, and payment records must surface in the agent desktop in real time." },
  ];

  const benchmarks = [
    { metric: "CSAT", avg: "76%", cross: "78%", top: "88%+", note: "Below cross-industry — returns friction and fulfillment issues suppress satisfaction" },
    { metric: "FCR", avg: "75%", cross: "72%", top: "82%+", note: "Above average — many retail issues are transactional and resolvable in one contact" },
    { metric: "AHT", avg: "5:40", cross: "7:00", top: "4:00", note: "Faster than average — high volume of simple status and returns queries" },
    { metric: "Abandon Rate", avg: "5%", cross: "6%", top: "3%", note: "Slightly better — digital channels reduce phone dependency" },
    { metric: "Attrition", avg: "42%", cross: "35%", top: "20%", note: "Well above average — seasonal hiring patterns, low wages, and repetitive work drive turnover" },
    { metric: "Containment", avg: "30%", cross: "25%", top: "40%+", note: "Above average — order status and tracking are highly automatable" },
  ];

  return (
    <div><Nav />
      <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "130px 28px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn><div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
            <a href="/industries" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Industries</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
            <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>Retail & eCommerce</span>
          </div></FadeIn>
          <FadeIn delay={0.05}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>Retail & eCommerce{" "}<span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CX Intelligence</span></h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 640 }}>Speed, volume, and seasonality define retail CX. Every delayed response is a lost sale. Every unresolved return is a lost customer. This is the vertical-specific intelligence layer — benchmarks, technology stack mapping, failure modes, and vendor recommendations built for eCommerce, omnichannel retail, subscription, and marketplace operations.</p>
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
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Six distinct retail service models.</h2>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 32 }}>A Shopify DTC brand handling returns over chat and a luxury retailer providing concierge service have fundamentally different technology needs, staffing models, and success metrics. The platform that serves one will often fail the other.</p>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }} className="sub-grid">
          {subVerticals.map((sv, i) => (<FadeIn key={i} delay={i * 0.04}><a href={`/industries/retail/${sv.slug}`} style={{ display: "block", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", height: "100%", transition: "border-color 0.2s", textDecoration: "none", color: "inherit" }} onMouseOver={e => e.currentTarget.style.borderColor = ELECTRIC} onMouseOut={e => e.currentTarget.style.borderColor = BORDER}><h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{sv.name}</h3><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: "0 0 10px" }}>{sv.desc}</p><span style={{ fontSize: 11, color: ELECTRIC, fontWeight: 500 }}>{sv.contact}</span><div style={{ fontSize: 12, fontWeight: 600, color: ELECTRIC, marginTop: 10 }}>Access CX Stack Framework →</div></a></FadeIn>))}
        </div>
      </div></section>

      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: RED, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>What Breaks</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Five failure modes unique to retail CX.</h2></FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {failureModes.map((fm, i) => (<FadeIn key={i} delay={i * 0.04}><div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", borderLeft: `4px solid ${RED}` }}><h3 style={{ fontSize: 15, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{fm.title}</h3><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{fm.desc}</p></div></FadeIn>))}
        </div>
      </div></section>

      <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "80px 28px" }}><div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn><span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Technology Stack</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Seven orchestration layers, mapped for retail.</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 600, marginBottom: 36 }}>Layer 5 (Conversation Management) carries disproportionate weight because retail is digital-first — chat, messaging, and social are primary channels. Retailers who over-invest in voice infrastructure at the expense of digital engagement are fighting yesterday's battle.</p>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {stackLayers.map((sl, i) => (<FadeIn key={i} delay={i * 0.03}><div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "20px 22px", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}><div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 16, color: LIGHT }}>{sl.layer}</span></div><div style={{ flex: 1, minWidth: 250 }}><h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>{sl.name}</h3><p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 8px" }}>{sl.note}</p><div style={{ fontSize: 11, color: LIGHT }}>Key vendors: {sl.vendors}</div></div></div></FadeIn>))}
        </div>
      </div></section>

      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Industry Benchmarks</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>How retail compares.</h2></FadeIn>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr style={{ borderBottom: `2px solid ${NAVY}` }}>{["Metric", "Retail Avg", "Cross-Industry", "Top Quartile", "Why It Differs"].map(h => (<th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: NAVY, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>{benchmarks.map((b, i) => { const better = ["AHT","Abandon Rate","Attrition"].includes(b.metric) ? parseFloat(b.avg) < parseFloat(b.cross) : parseFloat(b.avg) > parseFloat(b.cross); return (<tr key={i} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? "#fff" : WARM }}><td style={{ padding: "12px 14px", fontWeight: 600, color: NAVY }}>{b.metric}</td><td style={{ padding: "12px 14px", fontWeight: 700, color: better ? GREEN : AMBER }}>{b.avg}</td><td style={{ padding: "12px 14px", color: MUTED }}>{b.cross}</td><td style={{ padding: "12px 14px", color: GREEN, fontWeight: 600 }}>{b.top}</td><td style={{ padding: "12px 14px", color: SLATE, fontSize: 12 }}>{b.note}</td></tr>); })}</tbody>
          </table>
        </div>
        <FadeIn delay={0.1}><div style={{ display: "flex", gap: 14, marginTop: 24, flexWrap: "wrap" }}><a href="/tools/experience-scorecard" style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC }}>Score your metrics against these benchmarks →</a><a href="/tco-calculator" style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Model your retail TCO →</a></div></FadeIn>
      </div></section>

      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: AMBER, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>The BPO Question</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>How outsourcing fits in retail CX.</h2></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }} className="sub-grid">
          <FadeIn delay={0.04}><div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px" }}><h3 style={{ fontSize: 15, fontWeight: 600, color: GREEN, margin: "0 0 8px" }}>Where BPOs add value</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{["Peak season scaling (Black Friday, holiday, back-to-school)", "Order status and tracking inquiries — high volume, low complexity", "Returns processing and refund authorization", "After-hours and weekend coverage for global eCommerce", "Social media response management for brand protection"].map((item, i) => (<p key={i} style={{ fontSize: 13, color: SLATE, margin: 0, lineHeight: 1.5, paddingLeft: 12, borderLeft: `2px solid ${GREEN}30` }}>{item}</p>))}</div></div></FadeIn>
          <FadeIn delay={0.08}><div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px" }}><h3 style={{ fontSize: 15, fontWeight: 600, color: RED, margin: "0 0 8px" }}>Where BPOs create risk</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{["VIP and loyalty tier interactions require brand intimacy BPOs rarely achieve", "Complex product expertise (luxury, technical goods) needs deep training investment", "Retention and save offers require authority and system access most BPO contracts underspecify", "Fraud detection in returns requires institutional pattern recognition", "Brand voice consistency degrades when multiple BPO teams serve the same customer base"].map((item, i) => (<p key={i} style={{ fontSize: 13, color: SLATE, margin: 0, lineHeight: 1.5, paddingLeft: 12, borderLeft: `2px solid ${RED}30` }}>{item}</p>))}</div></div></FadeIn>
        </div>
      </div></section>

      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Vendor Intelligence</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Platforms strongest for retail CX.</h2></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14, marginTop: 24 }} className="sub-grid">
          {[
            { name: "Genesys", score: 94, why: "Strongest routing and orchestration for high-volume, multi-channel retail operations. Proven in large omnichannel environments with complex fulfillment workflows.", href: "/vendors/genesys" },
            { name: "NICE CXone", score: 90, why: "Industry-leading WEM for seasonal staffing management. Strong analytics for returns root cause and agent quality during peak periods.", href: "/vendors/nice-cxone" },
            { name: "Talkdesk", score: 78, why: "Purpose-built Retail Experience Cloud with Shopify and Salesforce Commerce integrations. Strong for mid-market to enterprise retail.", href: "/vendors/talkdesk" },
            { name: "Five9", score: 82, why: "Reliable CCaaS with strong CRM integration. Good fit for retail operations scaling from mid-market to enterprise.", href: "/vendors/five9" },
            { name: "Gladly", score: "adj", why: "Customer-timeline-first approach built for retail. Excellent agent experience for omnichannel service. Strong Shopify and commerce integrations.", href: "/vendors" },
            { name: "Gorgias", score: "adj", why: "Ecommerce-native helpdesk. Best-in-class Shopify integration with order management, returns, and revenue-driving CX built into the agent workflow.", href: "/vendors" },
          ].map((v, i) => (<FadeIn key={i} delay={i * 0.04}><a href={v.href} style={{ display: "block", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 22px", transition: "all 0.2s", height: "100%" }} onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = "translateY(0)"; }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: 0 }}>{v.name}</h3>{v.score !== "adj" ? <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: ELECTRIC }}>{v.score}</span> : <span style={{ fontSize: 10, color: AMBER, fontWeight: 600 }}>Adjacent</span>}</div><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{v.why}</p></a></FadeIn>))}
        </div>
        <FadeIn delay={0.2}><div style={{ textAlign: "center", marginTop: 24 }}><a href="/vendors/ccaas" style={{ fontSize: 14, fontWeight: 600, color: ELECTRIC }}>See all 28 CCaaS vendors scored →</a></div></FadeIn>
      </div></section>

      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}><FadeIn>
        <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Evaluating CX technology for retail?</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>Speed, seasonality, and commerce integration change which platforms are viable. We can help you build a shortlist weighted for your sub-vertical — eCommerce, omnichannel, subscription, or marketplace.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>Request a Retail CX Briefing</a>
              <a href="/tools/cx-maturity" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>Take the CX Maturity Assessment →</a>
            </div>
          </div>
        </div>
      </FadeIn></div></section>

      <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={28} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span></div></div></footer>
    </div>
  );
}
