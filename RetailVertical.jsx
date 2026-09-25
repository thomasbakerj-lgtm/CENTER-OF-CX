import { useState, useEffect, useRef } from "react";
import ClaimText, { ClaimSources } from "./src/lib/ClaimText.jsx";
import { claimIds, plain } from "./src/lib/claims.js";

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
<a href="/contact" style={{color:"#fff",fontSize:13,fontWeight:600,background:ELECTRIC,padding:"9px 20px",borderRadius:6}}>Subscribe</a>
</div></div></nav></>)}

export default function RetailVertical() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const subVerticals = [
    { name: "eCommerce / DTC", slug: "ecommerce-dtc", desc: "Order status, returns, shipping issues, payment disputes, and cart abandonment recovery. Digital-native with chat and messaging-heavy channel mix. Speed defines the experience.", contact: "Very high volume, low AHT, peak seasonality" },
    { name: "Omnichannel Retail", slug: "omnichannel-retail", desc: "Buy online pick up in store, cross-channel returns, inventory inquiries, and loyalty programs. The complexity is in the handoff between digital and physical.", contact: "Mixed channels, complex fulfillment queries" },
    { name: "Subscription & Membership", slug: "subscription-membership", desc: "Billing cycles, cancellation and retention, membership benefits, and recurring order management. Every interaction carries churn risk.", contact: "Moderate volume, high retention stakes" },
    { name: "Marketplace Sellers", slug: "marketplace", desc: "Seller support, buyer disputes, listing issues, payment holds, and policy enforcement. Two-sided marketplace dynamics create unique CX challenges.", contact: "Dual audience, policy-heavy resolution" },
    { name: "Luxury & Specialty", slug: "luxury-specialty", desc: "Concierge-style service, product expertise, after-purchase care, and VIP client management. Experience quality directly influences purchase decisions.", contact: "Lower volume, very high value per interaction" },
    { name: "Grocery & Delivery", slug: "grocery-delivery", desc: "Substitution issues, delivery windows, order modifications, refunds, and real-time logistics communication. Speed and accuracy carry the experience.", contact: "High volume, time-sensitive, real-time logistics" },
  ];

  /* Verified statistics only (TB, S23): each is a fact claim read on the publisher's own page (src/lib/claims/retail.js). Research pass
     2026-09-25: the Qualtrics 2024 "$3.7T" (global, all industries) moved URL and was superseded by the publisher's 2026 estimate; the strip now
     carries retail figures. */
  const stats = [
    { n: "[[retail.stat.ecom-share]]", label: "E-commerce share of US retail sales, Q2 2026", source: "US Census Bureau, 2026", url: "https://www.census.gov/retail/ecommerce.html" },
    { n: "[[retail.returns.online]]", label: "Online sales retailers expect to be returned, 2025", source: "NRF and Happy Returns, 2025", url: "https://nrf.com/media-center/press-releases/consumers-expected-to-return-nearly-850-billion-in-merchandise-in-2025" },
    { n: "[[retail.stat.cut-spend]]", label: "Bad online retail experiences after which consumers cut spending", source: "Qualtrics XM Institute, 2025", url: "https://www.qualtrics.com/articles/customer-experience/3-trillion-risk-due-bad-customer-experiences-2026/" },
    { n: "[[retail.stat.cart]]", label: "Average documented cart abandonment rate across published studies", source: "Baymard Institute, 2025", url: "https://baymard.com/lists/cart-abandonment-rate" },
  ];

  const failureModes = [
    { title: "Order status and returns crowd out everything else", desc: "\"Where is my order\" and \"how do I return this\" make up much of the work in a retail contact center. Retailers told NRF they expect [[retail.returns.rate]] of 2025 sales to come back, and [[retail.returns.online]] of online sales. Without real-time order data and proactive shipping notices, agents spend their day on status lookups that automation could answer." },
    { title: "Seasonal staffing spikes erode quality", desc: "Peak season can bring [[retail.peak.spike]] a normal month's contact volume, and the returns wave follows it: [[retail.returns.seasonal]] of retailers surveyed by NRF planned to hire seasonal staff for holiday returns. Temporary agents hired fast with little training give uneven service just when customers are least patient." },
    { title: "Channel fragmentation loses the customer", desc: "A customer who starts on chat, phones about the same order, then emails a follow-up often meets three separate records of one problem. Each channel switch drops the context the last agent had." },
    { title: "Revenue-generating interactions get buried in service queues", desc: "Pre-purchase product questions, cart recovery opportunities, and upsell moments sit in the same queue as complaint handling. Without intent-based routing, revenue conversations wait behind refund requests." },
    { title: "Self-service deflects but doesn't resolve", desc: "Retailers invest in FAQ bots and help centers, but when the self-service path hits a wall (wrong tracking data, a policy exception, a damaged item), the handoff to a person often carries none of what the customer already said. They start over, and they are more annoyed than when they began." },
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
    { metric: "CSAT", retail: "[[retail.bench.csat.retail]]", cross: "[[retail.bench.csat.cross]]", note: "Moves with returns friction and delivery problems as much as with the service contact itself" },
    { metric: "FCR", retail: "[[retail.bench.fcr.retail]]", cross: "[[retail.bench.fcr.cross]]", note: "Many retail contacts are single transactions (order status, a return, a refund) that one contact can close" },
    { metric: "AHT", retail: "[[retail.bench.aht.retail]]", cross: "[[retail.bench.aht.cross]]", note: "Driven by the mix of quick status checks against disputes, exchanges and product advice" },
    { metric: "Abandon Rate", retail: "[[retail.bench.abandon.retail]]", cross: "[[retail.bench.abandon.cross]]", note: "Driven by staffing against promotion and holiday peaks, and by how much volume digital channels take" },
    { metric: "Attrition", retail: "[[retail.bench.attrition.retail]]", cross: "[[retail.bench.attrition.cross]]", note: "Seasonal hiring, pay and repetitive work are the drivers to watch" },
    { metric: "Containment", retail: "[[retail.bench.containment.retail]]", cross: "[[retail.bench.containment.cross]]", note: "Depends on whether bots read live order, carrier and returns data" },
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
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 640 }}>Speed, volume, and seasonality shape retail CX. A slow answer can cost a sale, and a return handled badly can cost the customer. This page covers what is published about retail contact centers, how the technology stack maps to retail work, where operations break, and which platforms retail buyers often evaluate, across eCommerce, omnichannel, subscription, marketplace, luxury and grocery.</p>
          </FadeIn>
        </div>
      </section>

      {stats.length > 0 && (<section style={{ background: "#fff", padding: "48px 28px", borderBottom: `1px solid ${BORDER}` }}><div style={WRAP}><FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(stats.length, 6)}, 1fr)`, gap: 16 }} className="stat-grid">
          {stats.map((s, i) => (<div key={i} style={{ textAlign: "center", padding: "12px 8px" }}><div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: ELECTRIC }}>{plain(s.n)}</div><div style={{ fontSize: 11, color: SLATE, lineHeight: 1.4, marginTop: 4 }}>{s.label}</div><a href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 2, textDecoration: "underline" }}>{s.source}</a></div>))}
        </div>
      </FadeIn></div></section>)}

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
          {failureModes.map((fm, i) => (<FadeIn key={i} delay={i * 0.04}><div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", borderLeft: `4px solid ${RED}` }}><h3 style={{ fontSize: 15, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{fm.title}</h3><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}><ClaimText text={fm.desc} /></p></div></FadeIn>))}
        </div>
      </div></section>

      <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "80px 28px" }}><div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn><span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Technology Stack</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Seven orchestration layers, mapped for retail.</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 600, marginBottom: 36 }}>Layer 5 (Conversation Management) carries extra weight in retail because chat, messaging and social are primary channels for many retailers. A plan that puts most of the budget into voice and little into digital engagement leaves the busiest channels underbuilt.</p>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {stackLayers.map((sl, i) => (<FadeIn key={i} delay={i * 0.03}><div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "20px 22px", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}><div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 16, color: LIGHT }}>{sl.layer}</span></div><div style={{ flex: 1, minWidth: 250 }}><h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>{sl.name}</h3><p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 8px" }}>{sl.note}</p><div style={{ fontSize: 11, color: LIGHT }}>Key vendors: {sl.vendors}</div></div></div></FadeIn>))}
        </div>
      </div></section>

      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Industry Benchmarks</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>How retail compares.</h2>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 32 }}>The one published retail figure is SQM Group's first contact resolution for retail call centers, above its all-industry average; SQM attributes the gap to less complex calls. No free public source reports the other metrics for retail; measure yours with the linked tools. Each all-industry figure is labelled with what it measures.</p>
        </FadeIn>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr style={{ borderBottom: `2px solid ${NAVY}` }}>{["Metric", "Retail", "All Industries", "What Drives It"].map(h => (<th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: NAVY, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>{benchmarks.map((b, i) => (<tr key={i} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? "#fff" : WARM }}><td style={{ padding: "12px 14px", fontWeight: 600, color: NAVY }}>{b.metric}</td><td style={{ padding: "12px 14px", fontWeight: 700, color: NAVY }}><ClaimText text={b.retail} /></td><td style={{ padding: "12px 14px", color: MUTED }}><ClaimText text={b.cross} /></td><td style={{ padding: "12px 14px", color: SLATE, fontSize: 12 }}>{b.note}</td></tr>))}</tbody>
          </table>
        </div>
        <FadeIn delay={0.1}><div style={{ display: "flex", gap: 14, marginTop: 24, flexWrap: "wrap" }}><a href="/tools/cost-per-contact" style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC }}>Price your own cost per contact →</a><a href="/tco-calculator" style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Model your retail TCO →</a></div></FadeIn>
        <div id="sources" style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${BORDER}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>Sources and assumptions</h3>
          <p style={{ fontSize: 13, color: MUTED, margin: "0 0 18px" }}>Every figure on this page is a published figure checked on the publisher's own page, a labelled planning assumption you can test with your own numbers, or marked as having no public benchmark.</p>
          <ClaimSources ids={claimIds([stats, benchmarks, failureModes])} color={SLATE} accent={ELECTRIC} />
        </div>
      </div></section>

      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: AMBER, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>The BPO Question</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>How outsourcing fits in retail CX.</h2></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }} className="sub-grid">
          <FadeIn delay={0.04}><div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px" }}><h3 style={{ fontSize: 15, fontWeight: 600, color: GREEN, margin: "0 0 8px" }}>Where BPOs add value</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{["Peak season scaling (Black Friday, holiday, back-to-school)", "Order status and tracking inquiries: high volume, low complexity", "Returns processing and refund authorization", "After-hours and weekend coverage for global eCommerce", "Social media response management for brand protection"].map((item, i) => (<p key={i} style={{ fontSize: 13, color: SLATE, margin: 0, lineHeight: 1.5, paddingLeft: 12, borderLeft: `2px solid ${GREEN}30` }}>{item}</p>))}</div></div></FadeIn>
          <FadeIn delay={0.08}><div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px" }}><h3 style={{ fontSize: 15, fontWeight: 600, color: RED, margin: "0 0 8px" }}>Where BPOs create risk</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{["VIP and loyalty tier interactions require brand intimacy BPOs rarely achieve", "Complex product expertise (luxury, technical goods) needs deep training investment", "Retention and save offers require authority and system access most BPO contracts underspecify", "Fraud detection in returns requires institutional pattern recognition", "Brand voice consistency degrades when multiple BPO teams serve the same customer base"].map((item, i) => (<p key={i} style={{ fontSize: 13, color: SLATE, margin: 0, lineHeight: 1.5, paddingLeft: 12, borderLeft: `2px solid ${RED}30` }}>{item}</p>))}</div></div></FadeIn>
        </div>
      </div></section>

      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Vendor Intelligence</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Platforms often evaluated for retail CX.</h2></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14, marginTop: 24 }} className="sub-grid">
          {[
            { name: "Genesys", why: "Routing and orchestration for high-volume, multi-channel retail operations. Used in large omnichannel environments with complex fulfillment workflows.", href: "/vendors/genesys" },
            { name: "NICE CXone", why: "WEM for seasonal staffing management. Strong analytics for returns root cause and agent quality during peak periods.", href: "/vendors/nice-cxone" },
            { name: "Talkdesk", why: "Retail Experience Cloud with Shopify and Salesforce Commerce integrations. Aimed at mid-market to enterprise retail.", href: "/vendors/talkdesk" },
            { name: "Five9", why: "CCaaS with CRM integration, often shortlisted by retail operations moving from mid-market to enterprise scale.", href: "/vendors/five9" },
            { name: "Gladly", adj: true, why: "Customer-timeline-first design aimed at retail: one running conversation per customer across channels, with Shopify and commerce integrations.", href: "/vendors" },
            { name: "Gorgias", adj: true, why: "Helpdesk built for ecommerce. Shopify integration puts order management, returns and sales actions inside the agent workflow.", href: "/vendors" },
          ].sort((a, b) => a.name.localeCompare(b.name)).map((v, i) => (<FadeIn key={i} delay={i * 0.04}><a href={v.href} style={{ display: "block", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 22px", transition: "all 0.2s", height: "100%" }} onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = "translateY(0)"; }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: 0 }}>{v.name}</h3>{v.adj && <span style={{ fontSize: 10, color: AMBER, fontWeight: 600 }}>Adjacent</span>}</div><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{v.why}</p></a></FadeIn>))}
        </div>
        <FadeIn delay={0.2}><div style={{ textAlign: "center", marginTop: 24 }}><a href="/vendors/ccaas" style={{ fontSize: 14, fontWeight: 600, color: ELECTRIC }}>See all CCaaS vendors →</a></div></FadeIn>
      </div></section>

      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}><FadeIn>
        <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Evaluating CX technology for retail?</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>Speed, seasonality, and commerce integration change which platforms are viable. We can help you build a shortlist weighted for your sub-vertical: eCommerce, omnichannel, subscription, or marketplace.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>Request a Retail CX Briefing</a>
              <a href="/tools/cx-maturity" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>Take the CX Maturity Assessment →</a>
            </div>
          </div>
        </div>
      </FadeIn></div></section>

      <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={28} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="/privacy" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Privacy</a>
            <a href="/terms" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Terms</a>
          </div></div></div></footer>
    </div>
  );
}
