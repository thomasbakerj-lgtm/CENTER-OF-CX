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

export default function TravelVertical() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const subVerticals = [
    { name: "Airlines", slug: "airlines", desc: "Booking changes, cancellations, disruption management, loyalty programs, and baggage. The most time-sensitive, highest-emotion CX in any industry.", contact: "Extreme peak volume during disruptions" },
    { name: "Hotels & Resorts", slug: "hotels-resorts", desc: "Reservations, modifications, loyalty tiers, pre-arrival requests, and post-stay resolution. Personalization and recognition drive loyalty.", contact: "Moderate volume, high personalization expectation" },
    { name: "Online Travel Agencies", slug: "otas", desc: "Multi-supplier booking support, price disputes, cancellation policies, and trip coordination. The intermediary absorbs friction from every supplier.", contact: "Very high volume, multi-supplier complexity" },
    { name: "Car Rental & Ground Transport", slug: "car-rental", desc: "Reservations, vehicle issues, roadside assistance, damage disputes, and loyalty programs. Real-time operational support during the rental.", contact: "Moderate volume, real-time urgency" },
    { name: "Cruise Lines", slug: "cruise-lines", desc: "Booking, shore excursions, onboard services, health protocols, and itinerary changes. Long planning cycles with high emotional investment.", contact: "Seasonal volume, high-value bookings" },
    { name: "Tours & Experiences", slug: "tours-experiences", desc: "Activity booking, schedule changes, group coordination, weather cancellations, and local guide communication. Real-time support in unfamiliar destinations.", contact: "Time-zone spanning, multilingual" },
  ];

  const stats = [
    { n: "66%", label: "Of travelers feel less than positive about calling a travel brand", source: "Language I/O 2025" },
    { n: "86%", label: "Willing to pay more for a better customer experience", source: "GITNUX 2025" },
    { n: "55%", label: "Would abandon a booking if customer service is poor", source: "GITNUX 2025" },
    { n: "56%", label: "Of business travelers book at the last minute", source: "24/7.ai 2025" },
    { n: "72%", label: "More likely to return if staff remembered their preferences", source: "WiFi Talents 2026" },
    { n: "69%", label: "Expect fast response via messaging apps", source: "GITNUX 2025" },
  ];

  const failureModes = [
    { title: "Disruption volume overwhelms capacity within minutes", desc: "A single cancelled flight can generate 200+ calls in 30 minutes. A weather event affecting a hub airport creates thousands. Without surge protocols, automated rebooking, and proactive notifications, the contact center collapses under volume while passengers sit at gates with no information." },
    { title: "Loyalty status is invisible during the interaction that matters most", desc: "An elite-status traveler calling during a disruption waits in the same queue as a first-time booker. The agent who finally answers doesn't see the loyalty tier, lifetime value, or past preferences until they pull up the account — by which point the traveler is already frustrated by the wait." },
    { title: "Multilingual support is essential but undertreated", desc: "Travel is inherently global. A Japanese tourist stranded in Chicago, a Brazilian family rebooking from London, a German business traveler in Singapore — all need support in their language during high-stress moments. Most travel brands offer English-plus-one-or-two rather than true multilingual capability." },
    { title: "Policy complexity creates agent paralysis", desc: "Cancellation policies vary by fare class, booking channel, loyalty status, and destination regulations. An agent who can't quickly determine whether a rebooking fee applies, whether a voucher is the right remedy, or whether EU261 compensation is owed will default to 'let me check and call you back' — the worst possible response during a disruption." },
    { title: "Post-trip resolution is disconnected from the travel experience", desc: "A guest who had a terrible hotel experience files a complaint after returning home. The complaint reaches a team that wasn't involved in the stay, can't access the hotel's operational data, and responds with a generic apology and a small credit. The resolution feels impersonal because it is." },
  ];

  const stackLayers = [
    { layer: 7, name: "Analytics & Governance", vendors: "NICE Nexidia, Medallia, Qualtrics, ReviewPro", note: "Post-trip NPS, disruption recovery CSAT, loyalty tier satisfaction segmentation, and social review sentiment. Analytics must connect operational events to CX outcomes." },
    { layer: 6, name: "Routing & Orchestration", vendors: "Genesys, NICE CXone, Five9, Talkdesk", note: "Loyalty-tier routing, disruption surge protocols, multilingual routing, and channel-aware routing (messaging for simple, voice for disruptions)." },
    { layer: 5, name: "Conversation Management", vendors: "LivePerson, Sprinklr, Ada, Glia", note: "Messaging for modifications and status. Proactive disruption notifications. Social media management for real-time travel complaints. Multilingual chat and voice." },
    { layer: 4, name: "Reasoning & Planning", vendors: "Amelia, Cognigy, Ada, Google CCAI", note: "Booking management bots, flight/room status bots, disruption rebooking AI, loyalty point redemption, and FAQ across languages." },
    { layer: 3, name: "Policy & Guardrails", vendors: "Custom policy engines, payment compliance", note: "EU261 and DOT compensation rules, PCI compliance, loyalty program terms, cancellation policy enforcement, and data privacy (GDPR for EU travelers)." },
    { layer: 2, name: "Workflow Execution", vendors: "Amadeus, Sabre, Oracle Hospitality, Salesforce", note: "Rebooking workflows, compensation processing, loyalty adjustments, group booking coordination, and multi-supplier itinerary management." },
    { layer: 1, name: "Data Access", vendors: "Amadeus, Sabre, Oracle OPERA, Salesforce", note: "GDS/PSS for airlines, PMS for hotels, OTA booking platforms, loyalty databases, and real-time operational data (flight status, room inventory)." },
  ];

  const benchmarks = [
    { metric: "CSAT", avg: "72%", cross: "78%", top: "85%+", note: "Below average — disruptions and policy frustration suppress scores regardless of agent quality" },
    { metric: "FCR", avg: "58%", cross: "72%", top: "78%+", note: "Below average — multi-supplier bookings and disruption rebooking require follow-up" },
    { metric: "AHT", avg: "8:00", cross: "7:00", top: "5:30", note: "Above average — rebooking, loyalty lookups, and policy checks are time-intensive" },
    { metric: "Abandonment", avg: "12%", cross: "6%", top: "3%", note: "Significantly above average — disruption-driven volume spikes cause mass abandonment" },
    { metric: "Attrition", avg: "38%", cross: "35%", top: "20%", note: "Slightly above average — irregular hours, multilingual requirements, and emotional interactions" },
    { metric: "Digital Adoption", avg: "35%", cross: "30%", top: "55%+", note: "Slightly above average — mobile-savvy travelers adopt self-service when it works" },
  ];

  return (
    <div><Nav />
      <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "130px 28px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn><div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}><a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span><a href="/industries" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Industries</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span><span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>Travel & Hospitality</span></div></FadeIn>
          <FadeIn delay={0.05}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>Travel & Hospitality{" "}<span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CX Intelligence</span></h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 640 }}>Disruptions, reservations, loyalty, itinerary changes, and real-time journey support make travel one of the most CX-intensive industries. When things go wrong — and in travel, things go wrong constantly — the contact center is the only thing standing between a frustrated traveler and a lost customer. This is the vertical-specific intelligence layer for airlines, hotels, OTAs, and hospitality operations.</p>
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
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Six distinct travel service models.</h2>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 32 }}>An airline managing irregular operations for 50,000 passengers and a boutique hotel handling concierge requests have fundamentally different CX requirements. The urgency, complexity, and emotional stakes vary dramatically across sub-verticals.</p></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }} className="sub-grid">
          {subVerticals.map((sv, i) => (<FadeIn key={i} delay={i * 0.04}><a href={`/industries/travel/${sv.slug}`} style={{ display: "block", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", height: "100%", transition: "border-color 0.2s", textDecoration: "none", color: "inherit" }} onMouseOver={e => e.currentTarget.style.borderColor = ELECTRIC} onMouseOut={e => e.currentTarget.style.borderColor = BORDER}><h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{sv.name}</h3><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: "0 0 10px" }}>{sv.desc}</p><span style={{ fontSize: 11, color: ELECTRIC, fontWeight: 500 }}>{sv.contact}</span><div style={{ fontSize: 12, fontWeight: 600, color: ELECTRIC, marginTop: 10 }}>Access CX Stack Framework →</div></a></FadeIn>))}
        </div>
      </div></section>

      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: RED, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>What Breaks</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Five failure modes unique to travel CX.</h2></FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {failureModes.map((fm, i) => (<FadeIn key={i} delay={i * 0.04}><div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", borderLeft: `4px solid ${RED}` }}><h3 style={{ fontSize: 15, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{fm.title}</h3><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{fm.desc}</p></div></FadeIn>))}
        </div>
      </div></section>

      <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "80px 28px" }}><div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn><span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Technology Stack</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Seven orchestration layers, mapped for travel.</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 600, marginBottom: 36 }}>Layer 6 (Routing & Orchestration) carries disproportionate weight because travel CX is defined by disruption response. The difference between a carrier that rebooks you automatically and one that puts you on hold for 3 hours is a routing and orchestration decision — made before a human ever picks up the phone.</p></FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {stackLayers.map((sl, i) => (<FadeIn key={i} delay={i * 0.03}><div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "20px 22px", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}><div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 16, color: LIGHT }}>{sl.layer}</span></div><div style={{ flex: 1, minWidth: 250 }}><h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>{sl.name}</h3><p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 8px" }}>{sl.note}</p><div style={{ fontSize: 11, color: LIGHT }}>Key vendors: {sl.vendors}</div></div></div></FadeIn>))}
        </div>
      </div></section>

      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Industry Benchmarks</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>How travel compares.</h2></FadeIn>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr style={{ borderBottom: `2px solid ${NAVY}` }}>{["Metric", "Travel Avg", "Cross-Industry", "Top Quartile", "Why It Differs"].map(h => (<th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: NAVY, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>{benchmarks.map((b, i) => { const worse = ["FCR","CSAT","Digital Adoption"].includes(b.metric) ? parseFloat(b.avg) < parseFloat(b.cross) : parseFloat(b.avg) > parseFloat(b.cross); return (<tr key={i} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? "#fff" : WARM }}><td style={{ padding: "12px 14px", fontWeight: 600, color: NAVY }}>{b.metric}</td><td style={{ padding: "12px 14px", fontWeight: 700, color: worse ? AMBER : GREEN }}>{b.avg}</td><td style={{ padding: "12px 14px", color: MUTED }}>{b.cross}</td><td style={{ padding: "12px 14px", color: GREEN, fontWeight: 600 }}>{b.top}</td><td style={{ padding: "12px 14px", color: SLATE, fontSize: 12 }}>{b.note}</td></tr>); })}</tbody>
          </table>
        </div>
      </div></section>

      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: AMBER, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>The BPO Question</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>How outsourcing fits in travel CX.</h2></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }} className="sub-grid">
          <FadeIn delay={0.04}><div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px" }}><h3 style={{ fontSize: 15, fontWeight: 600, color: GREEN, margin: "0 0 8px" }}>Where BPOs add value</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{["After-hours and overflow coverage for routine booking modifications","Multilingual support — BPOs in Manila, Cairo, and Bogotá provide language breadth","Post-trip surveys and feedback collection","Loyalty program inquiries and point redemption","Seasonal scaling for peak booking periods"].map((item, i) => (<p key={i} style={{ fontSize: 13, color: SLATE, margin: 0, lineHeight: 1.5, paddingLeft: 12, borderLeft: `2px solid ${GREEN}30` }}>{item}</p>))}</div></div></FadeIn>
          <FadeIn delay={0.08}><div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px" }}><h3 style={{ fontSize: 15, fontWeight: 600, color: RED, margin: "0 0 8px" }}>Where BPOs create risk</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{["Disruption management requires real-time system access and rebooking authority most BPOs lack","Elite loyalty tier interactions demand brand knowledge and service instinct that's hard to outsource","Complex itinerary changes spanning multiple suppliers need deep GDS/booking system expertise","EU261 and DOT compensation decisions require regulatory knowledge and judgment","Brand voice consistency degrades when multiple BPO partners serve the same customer base"].map((item, i) => (<p key={i} style={{ fontSize: 13, color: SLATE, margin: 0, lineHeight: 1.5, paddingLeft: 12, borderLeft: `2px solid ${RED}30` }}>{item}</p>))}</div></div></FadeIn>
        </div>
      </div></section>

      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Vendor Intelligence</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>CCaaS platforms strongest for travel.</h2></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14, marginTop: 24 }} className="sub-grid">
          {[
            { name: "Genesys", score: 94, why: "Deepest routing for high-volume, multi-language travel operations. Predictive routing separates disruption calls from routine modifications. Proven at major airlines and hotel chains.", href: "/vendors/genesys" },
            { name: "NICE CXone", score: 90, why: "Industry-leading WEM for managing 24/7 multilingual operations. Strong analytics for disruption recovery CSAT and loyalty tier performance.", href: "/vendors/nice-cxone" },
            { name: "Five9", score: 82, why: "Strong mid-market fit for hotel groups and OTAs. Reliable routing with CRM integration. Good for travel brands scaling their digital CX.", href: "/vendors/five9" },
            { name: "Talkdesk", score: 78, why: "Fast deployment and strong AI capabilities. Good for travel brands adding digital channels and AI-assisted rebooking.", href: "/vendors/talkdesk" },
            { name: "Amazon Connect", score: 77, why: "Pay-per-use pricing ideal for travel's seasonal volume patterns. AWS ecosystem enables custom disruption management solutions.", href: "/vendors/amazon-connect" },
            { name: "Sprinklr", score: "adj", why: "Unified social media and digital CX management. Essential for travel brands where disruption complaints play out publicly on social media.", href: "/vendors" },
          ].map((v, i) => (<FadeIn key={i} delay={i * 0.04}><a href={v.href} style={{ display: "block", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 22px", transition: "all 0.2s", height: "100%" }} onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = "translateY(0)"; }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: 0 }}>{v.name}</h3>{v.score !== "adj" ? <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: ELECTRIC }}>{v.score}</span> : <span style={{ fontSize: 10, color: AMBER, fontWeight: 600 }}>Adjacent</span>}</div><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{v.why}</p></a></FadeIn>))}
        </div>
      </div></section>

      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}><FadeIn>
        <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 36px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Evaluating CX technology for travel?</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>Disruption routing, multilingual support, and GDS integration change which platforms are viable. We can help you build a shortlist weighted for your sub-vertical — airlines, hotels, OTAs, or cruise lines.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>Request a Travel CX Briefing</a>
            <a href="/tools/cx-maturity" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>Take the CX Maturity Assessment →</a>
          </div>
        </div>
      </FadeIn></div></section>

      <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={28} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span></div></div></footer>
    </div>
  );
}
