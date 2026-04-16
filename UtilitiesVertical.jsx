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

export default function UtilitiesVertical() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const subVerticals = [
    { name: "Electric Utilities (IOU)", slug: "electric-iou", desc: "Outage management, billing, service activation, energy efficiency programs, and storm response. The most CX-intensive utility type with the highest public visibility.", contact: "High volume, storm-driven surges" },
    { name: "Natural Gas", slug: "natural-gas", desc: "Gas leaks, service connections, billing, appliance programs, and safety. Every gas-related call carries potential safety urgency.", contact: "Moderate volume, safety-critical" },
    { name: "Water & Wastewater", slug: "water", desc: "Billing, service quality, conservation programs, main breaks, and boil-water advisories. Essential service with public health implications.", contact: "Moderate volume, public health sensitivity" },
    { name: "Municipal & Co-Op Utilities", slug: "municipal-coop", desc: "Community-owned service with direct accountability to residents. Smaller operations with higher trust expectations and political visibility.", contact: "Lower volume, community accountability" },
    { name: "Renewable Energy & DER", slug: "renewable-der", desc: "Solar interconnection, battery storage, EV charging, net metering, and distributed energy resource management. The fastest-growing segment.", contact: "Growing volume, technical complexity" },
    { name: "Energy Retail / Competitive Supply", slug: "energy-retail", desc: "Plan selection, rate comparison, contract management, and switching. Competitive markets where CX directly determines customer acquisition and retention.", contact: "Sales-driven, churn-sensitive" },
  ];
  const stats = [
    { n: "73", label: "ACSI customer satisfaction score — dropped 1% in 2026", source: "ACSI 2026" },
    { n: "55%", label: "Of utility customers experienced an outage in 2025", source: "J.D. Power 2026" },
    { n: "$189", label: "Average monthly electricity bill — record highs in 2025", source: "J.D. Power 2026" },
    { n: "40%", label: "Reduction in storm call volume from proactive outage notifications", source: "WiFi Talents 2026" },
    { n: "15", label: "Average utility NPS — bottom 20% of all industries", source: "WiFi Talents 2026" },
    { n: "22%", label: "Of customers unable to pay their full utility bill", source: "J.D. Power 2026" },
  ];
  const failureModes = [
    { title: "Storm events create 10-50x call volume that collapses the contact center", desc: "A major storm knocks out power for 200,000 customers. Every one of them calls to report the outage and ask when power will be restored. Without proactive outage notifications, IVR storm messaging, and automated restoration updates, the contact center is overwhelmed within minutes — and every agent can only say 'we're aware of the outage and working to restore service.'" },
    { title: "Bill complexity makes every billing call longer than it needs to be", desc: "Demand charges, tiered rates, time-of-use pricing, fuel surcharges, regulatory riders, and taxes create bills that most customers — and many agents — cannot explain. The average billing call involves 3-5 minutes of the agent interpreting the bill before addressing the actual concern." },
    { title: "Field service coordination is disconnected from customer communication", desc: "A customer calls about a downed power line. The contact center creates a ticket. A crew is dispatched. But the customer receives no updates — they call back 2 hours later, 4 hours later, the next morning. The field operations system and the contact center system don't share real-time status." },
    { title: "Payment difficulty is a public health and safety issue", desc: "22% of utility customers can't pay their full bill. Unlike other industries, utilities can't simply disconnect — disconnection rules, winter moratoriums, and medical protection protocols create complex decision trees. Agents handling payment difficulty need social services training alongside billing system skills." },
    { title: "Customers spend only 8 minutes per year interacting with their utility", desc: "When they do interact, it's because something is wrong. Every touchpoint is a complaint or a problem — there's no positive engagement equivalent. This means every interaction carries disproportionate weight in shaping the customer's perception of the utility." },
  ];
  const stackLayers = [
    { layer: 7, name: "Analytics & Governance", vendors: "NICE Nexidia, Verint, J.D. Power, Qualtrics", note: "J.D. Power satisfaction tracking, outage communication effectiveness, billing complaint root cause, and regulatory compliance reporting." },
    { layer: 6, name: "Routing & Orchestration", vendors: "Genesys, NICE CXone, Cisco, Avaya", note: "Storm IVR intercepts, outage vs billing vs service routing, priority routing for gas leaks and safety, and field dispatch coordination." },
    { layer: 5, name: "Conversation Management", vendors: "Notifi (Questline), Kubra, Sprinklr, Ada", note: "Proactive outage notifications, bill explanation tools, payment arrangement portals, and energy efficiency program enrollment." },
    { layer: 4, name: "Reasoning & Planning", vendors: "Cognigy, Ada, Google CCAI, utility-specific bots", note: "Outage status bots with real-time OMS data, bill explanation bots, payment arrangement bots, and move/start/stop service automation." },
    { layer: 3, name: "Policy & Guardrails", vendors: "PUC compliance, custom regulatory, Oracle Utilities", note: "Disconnection moratorium rules, medical baseline protections, CARE/LIHEAP payment assistance, PII/CPNI, and rate case compliance." },
    { layer: 2, name: "Workflow Execution", vendors: "Oracle Utilities, SAP IS-U, Itron, ServiceNow", note: "Service start/stop/transfer, outage management, field dispatch, payment arrangement, and energy efficiency program enrollment workflows." },
    { layer: 1, name: "Data Access", vendors: "Oracle CC&B, SAP IS-U, Itron, Salesforce Energy", note: "CIS (customer information system), OMS (outage management), MDMS (meter data), GIS (network mapping), and field service management." },
  ];
  const benchmarks = [
    { metric: "CSAT", avg: "73", cross: "78%", top: "80+", note: "Below average — driven by outage frustration and bill increases customers can't control" },
    { metric: "FCR", avg: "65%", cross: "72%", top: "78%+", note: "Below average — outages and field service coordination require follow-up" },
    { metric: "AHT", avg: "7:30", cross: "7:00", top: "5:30", note: "Slightly above — bill explanations and payment difficulty conversations are long" },
    { metric: "NPS", avg: "15", cross: "32", top: "35+", note: "Bottom 20% of all industries — monopoly structure limits competitive motivation" },
    { metric: "Attrition", avg: "30%", cross: "35%", top: "20%", note: "Below average — better benefits and stability offset lower excitement" },
    { metric: "Storm Volume", avg: "10-50x", cross: "N/A", top: "2-3x", note: "Most extreme volume variability of any industry — normal day to crisis in hours" },
  ];
  return (
    <div><Nav />
      <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "130px 28px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn><div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}><a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span><a href="/industries" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Industries</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span><span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>Utilities & Energy</span></div></FadeIn>
          <FadeIn delay={0.05}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>Utilities & Energy{" "}<span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CX Intelligence</span></h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 640 }}>Outages, billing complexity, field service coordination, payment difficulty, and storm response define utility CX. With an ACSI score of 73 — declining — and the most extreme volume variability of any industry, utility contact centers must prepare for crisis while delivering on everyday service. This is the vertical-specific intelligence layer for electric, gas, water, municipal, renewable, and competitive energy.</p>
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
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Six distinct utility service models.</h2>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 32 }}>An investor-owned electric utility serving 4 million customers and a municipal water utility serving 50,000 residents have fundamentally different regulatory, operational, and CX requirements. Monopoly vs competitive, regulated vs market-driven, storm-exposed vs weather-independent.</p></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }} className="sub-grid">
          {subVerticals.map((sv, i) => (<FadeIn key={i} delay={i * 0.04}><a href={`/industries/utilities/${sv.slug}`} style={{ display: "block", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", height: "100%", transition: "border-color 0.2s", textDecoration: "none", color: "inherit" }} onMouseOver={e => e.currentTarget.style.borderColor = ELECTRIC} onMouseOut={e => e.currentTarget.style.borderColor = BORDER}><h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{sv.name}</h3><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: "0 0 10px" }}>{sv.desc}</p><span style={{ fontSize: 11, color: ELECTRIC, fontWeight: 500 }}>{sv.contact}</span><div style={{ fontSize: 12, fontWeight: 600, color: ELECTRIC, marginTop: 10 }}>Access CX Stack Framework →</div></a></FadeIn>))}
        </div>
      </div></section>
      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: RED, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>What Breaks</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Five failure modes unique to utilities CX.</h2></FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {failureModes.map((fm, i) => (<FadeIn key={i} delay={i * 0.04}><div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", borderLeft: `4px solid ${RED}` }}><h3 style={{ fontSize: 15, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{fm.title}</h3><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{fm.desc}</p></div></FadeIn>))}
        </div>
      </div></section>
      <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "80px 28px" }}><div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn><span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Technology Stack</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Seven orchestration layers, mapped for utilities.</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 600, marginBottom: 36 }}>Layer 1 (Data Access) carries disproportionate weight because utility CX depends on real-time operational data — outage status, meter readings, field crew location — that lives in OMS, MDMS, and GIS systems the contact center rarely integrates deeply with.</p></FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {stackLayers.map((sl, i) => (<FadeIn key={i} delay={i * 0.03}><div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "20px 22px", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}><div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 16, color: LIGHT }}>{sl.layer}</span></div><div style={{ flex: 1, minWidth: 250 }}><h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>{sl.name}</h3><p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 8px" }}>{sl.note}</p><div style={{ fontSize: 11, color: LIGHT }}>Key vendors: {sl.vendors}</div></div></div></FadeIn>))}
        </div>
      </div></section>
      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Industry Benchmarks</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>How utilities compare.</h2></FadeIn>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr style={{ borderBottom: `2px solid ${NAVY}` }}>{["Metric", "Utilities Avg", "Cross-Industry", "Top Quartile", "Why It Differs"].map(h => (<th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: NAVY, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>{benchmarks.map((b, i) => (<tr key={i} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? "#fff" : WARM }}><td style={{ padding: "12px 14px", fontWeight: 600, color: NAVY }}>{b.metric}</td><td style={{ padding: "12px 14px", fontWeight: 700, color: AMBER }}>{b.avg}</td><td style={{ padding: "12px 14px", color: MUTED }}>{b.cross}</td><td style={{ padding: "12px 14px", color: GREEN, fontWeight: 600 }}>{b.top}</td><td style={{ padding: "12px 14px", color: SLATE, fontSize: 12 }}>{b.note}</td></tr>))}</tbody>
          </table>
        </div>
      </div></section>
      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: AMBER, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>The BPO Question</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>How outsourcing fits in utility CX.</h2></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }} className="sub-grid">
          <FadeIn delay={0.04}><div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px" }}><h3 style={{ fontSize: 15, fontWeight: 600, color: GREEN, margin: "0 0 8px" }}>Where BPOs add value</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{["Storm overflow — surge capacity for outage reporting and status during weather events","After-hours service for outage reporting and emergency gas leak calls","Payment arrangement processing and collections outreach","Move/start/stop service transactions — high volume, scriptable","Energy efficiency program enrollment and appointment scheduling"].map((item, i) => (<p key={i} style={{ fontSize: 13, color: SLATE, margin: 0, lineHeight: 1.5, paddingLeft: 12, borderLeft: `2px solid ${GREEN}30` }}>{item}</p>))}</div></div></FadeIn>
          <FadeIn delay={0.08}><div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px" }}><h3 style={{ fontSize: 15, fontWeight: 600, color: RED, margin: "0 0 8px" }}>Where BPOs create risk</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{["Gas leak and safety-related calls require utility-controlled protocols and dispatch authority","Disconnection and reconnection decisions involve PUC regulations BPO agents may not know","Payment difficulty conversations require social services knowledge and program eligibility assessment","High-bill complaints during rate increases carry political and regulatory sensitivity","Field dispatch coordination requires OMS access most BPO contracts don't include"].map((item, i) => (<p key={i} style={{ fontSize: 13, color: SLATE, margin: 0, lineHeight: 1.5, paddingLeft: 12, borderLeft: `2px solid ${RED}30` }}>{item}</p>))}</div></div></FadeIn>
        </div>
      </div></section>
      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Vendor Intelligence</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>CCaaS platforms strongest for utilities.</h2></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14, marginTop: 24 }} className="sub-grid">
          {[
            { name: "Genesys", score: 94, why: "Deepest routing for storm surge management. OMS integration for real-time outage status in the agent desktop. Proven at the largest IOUs.", href: "/vendors/genesys" },
            { name: "NICE CXone", score: 90, why: "Industry-leading WEM for managing seasonal and storm-driven volume variability. Strong compliance controls for PUC-regulated interactions.", href: "/vendors/nice-cxone" },
            { name: "Cisco", score: 78, why: "Strong installed base in utilities. Network infrastructure heritage. SCADA/OT network familiarity creates natural fit.", href: "/vendors/cisco" },
            { name: "Avaya", score: 64, why: "Massive legacy installed base in utilities. Many IOUs run Avaya on-premise. Cloud migration path critical for modernization.", href: "/vendors" },
            { name: "Amazon Connect", score: 77, why: "Pay-per-use pricing ideal for storm-driven volume variability. AWS IoT integration for smart meter and grid data.", href: "/vendors/amazon-connect" },
            { name: "Five9", score: 82, why: "Strong mid-market fit for municipal and co-op utilities. Reliable routing with practical AI for bill explanation and outage status.", href: "/vendors/five9" },
          ].map((v, i) => (<FadeIn key={i} delay={i * 0.04}><a href={v.href} style={{ display: "block", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 22px", transition: "all 0.2s", height: "100%" }} onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = "translateY(0)"; }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: 0 }}>{v.name}</h3><span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: ELECTRIC }}>{v.score}</span></div><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{v.why}</p></a></FadeIn>))}
        </div>
      </div></section>
      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}><FadeIn>
        <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 36px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Evaluating CX technology for utilities?</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>OMS integration, storm routing, PUC compliance, and CIS connectivity change which platforms are viable. We can help you build a shortlist weighted for your utility type — IOU, municipal, co-op, or competitive retail.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>Request a Utilities CX Briefing</a>
            <a href="/tools/cx-maturity" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>Take the CX Maturity Assessment →</a>
          </div>
        </div>
      </FadeIn></div></section>
      <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={28} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span></div></div></footer>
    </div>
  );
}
