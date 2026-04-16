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

export default function InsuranceVertical() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const subVerticals = [
    { name: "Personal Lines P&C", slug: "personal-lines", desc: "Auto, home, renters, and umbrella. High volume, FNOL urgency, catastrophe surges, and retention battles. The most emotionally charged service journeys in insurance.", contact: "High volume, catastrophe-driven spikes" },
    { name: "Commercial Lines", slug: "commercial-lines", desc: "Business insurance, general liability, commercial property, and fleet. B2B relationships with agents and brokers alongside direct policyholders.", contact: "Lower volume, higher complexity per interaction" },
    { name: "Life Insurance & Annuities", slug: "life-annuities", desc: "Policy servicing, beneficiary changes, premium payments, surrenders, and death claim processing. Long-duration relationships with high emotional stakes.", contact: "Low volume, very high sensitivity" },
    { name: "Workers' Compensation", slug: "workers-comp", desc: "Injury reporting, claims management, return-to-work coordination, and employer/employee dual-audience support. Medical and legal complexity in every claim.", contact: "Moderate volume, multi-party coordination" },
    { name: "Specialty & Surplus Lines", slug: "specialty-lines", desc: "Cyber, E&O, D&O, marine, aviation, and excess. Sophisticated policyholders, complex coverage, and broker-driven distribution.", contact: "Low volume, expert-level interactions" },
    { name: "Insurtech & Digital Carriers", slug: "insurtech", desc: "Digital-first insurance with app-native service, instant quoting, and AI-driven claims. Speed and transparency define the brand promise.", contact: "Growing volume, digital-first channels" },
  ];

  const stats = [
    { n: "80%+", label: "CSAT benchmark — nearly 2x higher with clear communications", source: "J.D. Power / Nextiva" },
    { n: "$146B", label: "Insured losses from natural catastrophes in 2025", source: "Swiss Re Institute" },
    { n: "35%", label: "Increase in renewal likelihood from strong CX", source: "Industry composite" },
    { n: "70%", label: "Average FCR in insurance — claims require follow-up", source: "Nextiva 2026" },
    { n: "9 min", label: "Average handle time — coverage discussions can't be rushed", source: "Nextiva 2026" },
    { n: "81%", label: "Increase in retention from well-tailored customer service", source: "LiveAgent" },
  ];

  const failureModes = [
    { title: "FNOL is the moment of truth — and most carriers fumble it", desc: "First Notice of Loss is when the policyholder is most distressed and most attentive. A slow, confusing, or impersonal FNOL experience sets the tone for the entire claim. Carriers that treat FNOL as data collection rather than service recovery lose the emotional window where trust is built or destroyed." },
    { title: "Catastrophe events expose every capacity and process weakness", desc: "When a hurricane, wildfire, or hail storm hits, claim volume surges 10-50x in days. Carriers without CAT response plans — surge staffing, geo-targeted IVR, proactive outreach, simplified FNOL — drown in volume while policyholders wait on hold for hours." },
    { title: "The agent channel creates a three-party service problem", desc: "Many policyholders are served by independent agents who sit between the carrier and the customer. When a policyholder calls the carrier directly, the agent isn't informed. When they call the agent, the carrier has no record. This creates duplicate work, conflicting information, and frustrated policyholders." },
    { title: "Claims cycle time drives satisfaction more than claims outcome", desc: "Policyholders accept fair claim outcomes. What they don't accept is waiting 45 days for a decision they expected in 10. The gap between expected and actual claims timeline — not the dollar amount — is the primary driver of claims dissatisfaction." },
    { title: "Renewal is treated as a billing event instead of a retention moment", desc: "Most carriers send a renewal notice 30 days before expiration with a new premium. If the premium increased, the policyholder shops competitors. The carrier's contact center receives the cancellation call but has no save offer, no competitive context, and no authority to adjust pricing." },
  ];

  const stackLayers = [
    { layer: 7, name: "Analytics & Governance", vendors: "NICE Nexidia, Verint, Medallia, Qualtrics", note: "Claims cycle time analytics, FNOL quality scoring, CAT response performance, agent/broker satisfaction, and E&O risk monitoring." },
    { layer: 6, name: "Routing & Orchestration", vendors: "Genesys, NICE CXone, Talkdesk Insurance", note: "FNOL priority routing, CAT surge protocols, line-of-business routing, licensed agent matching, and retention-skilled routing." },
    { layer: 5, name: "Conversation Management", vendors: "Hi Marley, Glia, LivePerson, Sprinklr", note: "Claims status messaging, document collection, damage photo upload, proactive notifications, and agent/broker portal communication." },
    { layer: 4, name: "Reasoning & Planning", vendors: "Cognigy, Kore.ai, Shift Technology AI", note: "FNOL intake bots, claims status, policy lookup, billing automation, and renewal comparison. Peril-specific data collection." },
    { layer: 3, name: "Policy & Guardrails", vendors: "Shift Technology, Verisk, SAS, NICE Actimize", note: "State DOI compliance, unfair claims practices monitoring, fraud detection, recorded statement protocols, and E&O controls." },
    { layer: 2, name: "Workflow Execution", vendors: "Guidewire, Duck Creek, Majesco, Pega", note: "FNOL, claims assignment, subrogation, policy endorsement, renewal retention, and CAT response workflows." },
    { layer: 1, name: "Data Access", vendors: "Guidewire, Duck Creek, Sapiens, Salesforce FSC", note: "Policy admin, claims management, billing, agent/broker portal, document management, and actuarial data integration." },
  ];

  const benchmarks = [
    { metric: "CSAT", avg: "80%", cross: "78%", top: "90%+", note: "Above cross-industry when communications are clear — drops sharply with claims delays" },
    { metric: "FCR", avg: "65%", cross: "72%", top: "82%+", note: "Below average — multi-party claims coordination prevents single-call resolution" },
    { metric: "AHT", avg: "9:00", cross: "7:00", top: "7:00", note: "Above average — coverage discussions and claims intake are inherently detailed" },
    { metric: "Claims Cycle", avg: "30 days", cross: "N/A", top: "14 days", note: "Varies dramatically by peril type — auto glass is same-day; property fire is 60-90 days" },
    { metric: "Attrition", avg: "32%", cross: "35%", top: "20%", note: "Slightly below cross-industry — better compensation offsets emotional labor" },
    { metric: "Containment", avg: "15%", cross: "25%", top: "30%+", note: "Below average — policy complexity and emotional stakes limit what automation can handle" },
  ];

  return (
    <div><Nav />
      <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "130px 28px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn><div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}><a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span><a href="/industries" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Industries</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span><span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>Insurance</span></div></FadeIn>
          <FadeIn delay={0.05}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>Insurance{" "}<span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CX Intelligence</span></h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 640 }}>Claims, policy servicing, renewals, FNOL, and high-emotion service journeys define insurance CX. With $146 billion in catastrophe losses in 2025 alone, the contact center is where policyholder trust is either reinforced or destroyed. This is the vertical-specific intelligence layer for P&C, life, commercial, workers' comp, specialty lines, and insurtech.</p>
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
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Six distinct insurance service models.</h2>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 32 }}>A personal lines auto carrier handling 500,000 FNOL calls per year and a specialty cyber insurer serving 2,000 enterprise policyholders have fundamentally different CX requirements. Distribution model, claims complexity, and regulatory environment diverge completely.</p></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }} className="sub-grid">
          {subVerticals.map((sv, i) => (<FadeIn key={i} delay={i * 0.04}><a href={`/industries/insurance/${sv.slug}`} style={{ display: "block", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", height: "100%", transition: "border-color 0.2s", textDecoration: "none", color: "inherit" }} onMouseOver={e => e.currentTarget.style.borderColor = ELECTRIC} onMouseOut={e => e.currentTarget.style.borderColor = BORDER}><h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{sv.name}</h3><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: "0 0 10px" }}>{sv.desc}</p><span style={{ fontSize: 11, color: ELECTRIC, fontWeight: 500 }}>{sv.contact}</span><div style={{ fontSize: 12, fontWeight: 600, color: ELECTRIC, marginTop: 10 }}>Access CX Stack Framework →</div></a></FadeIn>))}
        </div>
      </div></section>

      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: RED, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>What Breaks</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Five failure modes unique to insurance CX.</h2></FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {failureModes.map((fm, i) => (<FadeIn key={i} delay={i * 0.04}><div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", borderLeft: `4px solid ${RED}` }}><h3 style={{ fontSize: 15, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{fm.title}</h3><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{fm.desc}</p></div></FadeIn>))}
        </div>
      </div></section>

      <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "80px 28px" }}><div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn><span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Technology Stack</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Seven orchestration layers, mapped for insurance.</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 600, marginBottom: 36 }}>Layer 3 (Policy & Guardrails) carries disproportionate weight because insurance operates under state-by-state regulatory requirements that vary in claims handling timelines, disclosure rules, and unfair practices definitions. A compliance failure in Layer 3 creates regulatory exposure that no amount of CSAT improvement can offset.</p></FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {stackLayers.map((sl, i) => (<FadeIn key={i} delay={i * 0.03}><div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "20px 22px", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}><div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 16, color: LIGHT }}>{sl.layer}</span></div><div style={{ flex: 1, minWidth: 250 }}><h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>{sl.name}</h3><p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 8px" }}>{sl.note}</p><div style={{ fontSize: 11, color: LIGHT }}>Key vendors: {sl.vendors}</div></div></div></FadeIn>))}
        </div>
      </div></section>

      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Industry Benchmarks</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>How insurance compares.</h2></FadeIn>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr style={{ borderBottom: `2px solid ${NAVY}` }}>{["Metric", "Insurance Avg", "Cross-Industry", "Top Quartile", "Why It Differs"].map(h => (<th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: NAVY, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>{benchmarks.map((b, i) => { const better = ["FCR","CSAT","Containment"].includes(b.metric) ? parseFloat(b.avg) >= parseFloat(b.cross) : parseFloat(b.avg) <= parseFloat(b.cross); return (<tr key={i} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? "#fff" : WARM }}><td style={{ padding: "12px 14px", fontWeight: 600, color: NAVY }}>{b.metric}</td><td style={{ padding: "12px 14px", fontWeight: 700, color: better ? GREEN : AMBER }}>{b.avg}</td><td style={{ padding: "12px 14px", color: MUTED }}>{b.cross}</td><td style={{ padding: "12px 14px", color: GREEN, fontWeight: 600 }}>{b.top}</td><td style={{ padding: "12px 14px", color: SLATE, fontSize: 12 }}>{b.note}</td></tr>); })}</tbody>
          </table>
        </div>
      </div></section>

      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: AMBER, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>The BPO Question</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>How outsourcing fits in insurance CX.</h2></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }} className="sub-grid">
          <FadeIn delay={0.04}><div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px" }}><h3 style={{ fontSize: 15, fontWeight: 600, color: GREEN, margin: "0 0 8px" }}>Where BPOs add value</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{["FNOL intake for high-volume personal lines during CAT events","Policy servicing — endorsements, certificates, and billing inquiries","Claims status callbacks and proactive claim milestone notifications","After-hours and weekend FNOL coverage for 24/7 reporting","Outbound renewal reminder campaigns and payment collections"].map((item, i) => (<p key={i} style={{ fontSize: 13, color: SLATE, margin: 0, lineHeight: 1.5, paddingLeft: 12, borderLeft: `2px solid ${GREEN}30` }}>{item}</p>))}</div></div></FadeIn>
          <FadeIn delay={0.08}><div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px" }}><h3 style={{ fontSize: 15, fontWeight: 600, color: RED, margin: "0 0 8px" }}>Where BPOs create risk</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{["Coverage determinations require licensed adjusters — BPO agents cannot make coverage decisions","Complex claims handling (liability disputes, bodily injury) requires institutional judgment","State DOI compliance varies by jurisdiction — BPO training gaps create regulatory exposure","Recorded statements have legal implications that require carrier-controlled protocols","Agent/broker relationship management needs carrier-level authority and system access"].map((item, i) => (<p key={i} style={{ fontSize: 13, color: SLATE, margin: 0, lineHeight: 1.5, paddingLeft: 12, borderLeft: `2px solid ${RED}30` }}>{item}</p>))}</div></div></FadeIn>
        </div>
      </div></section>

      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Vendor Intelligence</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>CCaaS platforms strongest for insurance.</h2></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14, marginTop: 24 }} className="sub-grid">
          {[
            { name: "NICE CXone", score: 90, why: "Industry-leading WEM and compliance controls for regulated insurance environments. Strong QA for claims interactions. Best-in-class analytics for E&O risk monitoring.", href: "/vendors/nice-cxone" },
            { name: "Genesys", score: 94, why: "Deepest routing for multi-line carriers. CAT surge routing, FNOL priority, and licensed-agent matching. Proven at major P&C carriers globally.", href: "/vendors/genesys" },
            { name: "Talkdesk", score: 78, why: "Purpose-built Insurance Experience Cloud with pre-built claims workflows, Guidewire integration, and FNOL automation.", href: "/vendors/talkdesk" },
            { name: "Five9", score: 82, why: "Strong Salesforce integration for carriers using FSC. Practical AI for policy servicing and billing. Good mid-market to enterprise fit.", href: "/vendors/five9" },
            { name: "Amazon Connect", score: 77, why: "Pay-per-use pricing attractive for carriers with CAT-driven volume variability. AWS ecosystem for custom claims AI solutions.", href: "/vendors/amazon-connect" },
            { name: "Content Guru", score: 76, why: "Strong in UK/EMEA insurance markets. storm platform handles the regulatory complexity of multi-jurisdiction insurance operations.", href: "/vendors" },
          ].map((v, i) => (<FadeIn key={i} delay={i * 0.04}><a href={v.href} style={{ display: "block", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 22px", transition: "all 0.2s", height: "100%" }} onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = "translateY(0)"; }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: 0 }}>{v.name}</h3><span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: ELECTRIC }}>{v.score}</span></div><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{v.why}</p></a></FadeIn>))}
        </div>
        <FadeIn delay={0.2}><div style={{ textAlign: "center", marginTop: 24 }}><a href="/vendors/ccaas" style={{ fontSize: 14, fontWeight: 600, color: ELECTRIC }}>See all 28 CCaaS vendors scored →</a></div></FadeIn>
      </div></section>

      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}><FadeIn>
        <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 36px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Evaluating CX technology for insurance?</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>State DOI compliance, claims system integration, and CAT response routing change which platforms are viable. We can help you build a shortlist weighted for your line of business — personal lines, commercial, life, or specialty.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>Request an Insurance CX Briefing</a>
            <a href="/tools/cx-maturity" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>Take the CX Maturity Assessment →</a>
          </div>
        </div>
      </FadeIn></div></section>

      <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={28} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span></div></div></footer>
    </div>
  );
}
