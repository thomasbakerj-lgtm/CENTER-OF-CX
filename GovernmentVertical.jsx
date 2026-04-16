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

export default function GovernmentVertical() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const subVerticals = [
    { name: "Federal Government", slug: "federal", desc: "Agency citizen services, benefits administration, immigration, tax support, and veterans affairs. Massive scale with FedRAMP security requirements and accessibility mandates.", contact: "Very high volume, diverse populations" },
    { name: "State Government", slug: "state", desc: "DMV, unemployment, Medicaid, licensing, and tax. The most interaction-intensive government level with the broadest service portfolio.", contact: "High volume, peak surges during enrollment periods" },
    { name: "Local & Municipal Government", slug: "local-municipal", desc: "311 services, permits, code enforcement, parks, public works, and elected official constituent services. Community accountability with political visibility.", contact: "Moderate volume, broad service scope" },
    { name: "Courts & Justice", slug: "courts-justice", desc: "Case status, jury duty, fines, filing procedures, and victim services. Legal complexity with accessibility and language access requirements.", contact: "Moderate volume, high sensitivity" },
    { name: "Public Safety & 911", slug: "public-safety", desc: "Emergency dispatch, non-emergency reporting, community outreach, and crisis intervention. Life-safety interactions with zero tolerance for failure.", contact: "24/7, life-critical" },
    { name: "Social Services & Benefits", slug: "social-services", desc: "SNAP, Medicaid, TANF, housing assistance, child protective services, and disability. Vulnerable populations navigating complex eligibility and enrollment.", contact: "High volume, highest vulnerability" },
  ];
  const stats = [
    { n: "69.7", label: "ACSI federal government satisfaction score — highest in 7 years", source: "ACSI 2024" },
    { n: "11 pts", label: "Behind private sector on Forrester's CX Index", source: "Forrester / Deloitte" },
    { n: "9x", label: "More likely to trust government when digital services work well", source: "Liferay / research" },
    { n: "70%", label: "Of government CIOs increasing CX investment by 2026", source: "Gartner" },
    { n: "$200B", label: "Government IT spending projected for 2026", source: "Gartner" },
    { n: "47%", label: "Of government employees struggle to find information they need", source: "Liferay" },
  ];
  const failureModes = [
    { title: "Citizens compare government to Amazon, not to other agencies", desc: "Taxpayers don't benchmark government CX against the DMV down the street — they benchmark against their last Amazon delivery, their banking app, and their Uber experience. The gap between private-sector CX and government CX creates frustration that erodes institutional trust." },
    { title: "Siloed agencies create siloed citizen experiences", desc: "A family applying for SNAP, Medicaid, and housing assistance interacts with three different agencies, three different systems, and three different eligibility processes — often providing the same documentation three times. The citizen sees one government; the government operates as fifty disconnected agencies." },
    { title: "Accessibility is a legal obligation, not a feature", desc: "Section 508, ADA, Title VI language access, and WCAG 2.1 AA compliance aren't optional enhancements — they're legal requirements. Yet many government contact centers lack TTY/TDD support, multilingual agents, and accessible self-service portals. Every inaccessible touchpoint is a potential complaint and legal liability." },
    { title: "Legacy systems prevent digital transformation", desc: "Federal and state agencies run on COBOL-era mainframes, custom-built case management systems from the 1990s, and paper-based workflows that resist modernization. The contact center is often the human bridge between citizens and systems that can't serve them digitally." },
    { title: "Surge events overwhelm capacity without warning", desc: "A policy change, a benefit deadline, a natural disaster, or a pandemic creates call volumes that dwarf normal operations. Unemployment offices during COVID saw 1,000x normal volume. Government contact centers lack the commercial flexibility to scale rapidly because procurement takes months." },
  ];
  const stackLayers = [
    { layer: 7, name: "Analytics & Governance", vendors: "NICE, Verint, Qualtrics, Medallia", note: "Citizen satisfaction (OMB Circular A-11), service level reporting, accessibility compliance monitoring, language access tracking, and congressional/constituent inquiry analytics." },
    { layer: 6, name: "Routing & Orchestration", vendors: "Genesys, NICE CXone, Cisco, Amazon Connect", note: "Multi-agency routing, language-based routing (200+ languages for federal), accessibility routing (TTY, video relay), priority routing for veterans and vulnerable populations." },
    { layer: 5, name: "Conversation Management", vendors: "Sprinklr, LivePerson, Ada, Granicus", note: "Citizen portals, multilingual self-service, proactive notifications for benefits and deadlines, 311 reporting with tracking, and accessible digital channels." },
    { layer: 4, name: "Reasoning & Planning", vendors: "Google CCAI, Amazon Lex, Cognigy, Ada", note: "Benefits eligibility bots, case status bots, FAQ across hundreds of programs, appointment scheduling, and document requirement guidance." },
    { layer: 3, name: "Policy & Guardrails", vendors: "FedRAMP-certified vendors, Section 508 compliance", note: "FedRAMP (federal), StateRAMP, PII/FISMA compliance, Section 508 accessibility, Title VI language access, and CJIS (criminal justice)." },
    { layer: 2, name: "Workflow Execution", vendors: "Salesforce Government Cloud, ServiceNow, Pega, Appian", note: "Benefits enrollment, case management, permit processing, constituent inquiry tracking, FOIA request management, and inter-agency referral workflows." },
    { layer: 1, name: "Data Access", vendors: "Salesforce Gov Cloud, Oracle, SAP, legacy mainframes", note: "Case management systems, eligibility databases, financial systems, identity verification (Login.gov), and inter-agency data sharing." },
  ];
  const benchmarks = [
    { metric: "CSAT", avg: "69.7", cross: "78%", top: "78+", note: "Lowest of any sector — structural complexity and monopoly create persistent gaps" },
    { metric: "FCR", avg: "55%", cross: "72%", top: "70%+", note: "Far below average — multi-agency issues and system limitations prevent resolution" },
    { metric: "AHT", avg: "9:00", cross: "7:00", top: "6:30", note: "Above average — complex eligibility, multilingual interpretation, and system navigation" },
    { metric: "Accessibility", avg: "Partial", cross: "N/A", top: "Full 508", note: "Most agencies have partial compliance — TTY available but digital channels lag" },
    { metric: "Attrition", avg: "25%", cross: "35%", top: "15%", note: "Below average — government benefits and stability retain staff" },
    { metric: "Digital Adoption", avg: "25%", cross: "30%", top: "50%+", note: "Below average — legacy systems and accessibility requirements slow digital deployment" },
  ];
  return (
    <div><Nav />
      <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "130px 28px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn><div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}><a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span><a href="/industries" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Industries</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span><span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>Government & Public Sector</span></div></FadeIn>
          <FadeIn delay={0.05}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>Government{" "}<span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CX Intelligence</span></h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 640 }}>Citizen services, accessibility, multilingual support, case management, and trust define government CX. With an ACSI score nearly 11 points behind the private sector — and citizens who compare government services to Amazon — the public sector faces a CX gap that directly affects institutional trust. This is the vertical-specific intelligence layer for federal, state, local, courts, public safety, and social services.</p>
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
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Six distinct government service models.</h2>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 32 }}>A federal agency serving 300 million citizens and a county 311 center serving 200,000 residents have fundamentally different scale, security requirements, and procurement constraints. FedRAMP vs StateRAMP, OMB mandates vs local council priorities, and year-long procurement vs agile purchasing.</p></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }} className="sub-grid">
          {subVerticals.map((sv, i) => (<FadeIn key={i} delay={i * 0.04}><a href={`/industries/government/${sv.slug}`} style={{ display: "block", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", height: "100%", transition: "border-color 0.2s", textDecoration: "none", color: "inherit" }} onMouseOver={e => e.currentTarget.style.borderColor = ELECTRIC} onMouseOut={e => e.currentTarget.style.borderColor = BORDER}><h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{sv.name}</h3><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: "0 0 10px" }}>{sv.desc}</p><span style={{ fontSize: 11, color: ELECTRIC, fontWeight: 500 }}>{sv.contact}</span><div style={{ fontSize: 12, fontWeight: 600, color: ELECTRIC, marginTop: 10 }}>Access CX Stack Framework →</div></a></FadeIn>))}
        </div>
      </div></section>
      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: RED, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>What Breaks</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Five failure modes unique to government CX.</h2></FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {failureModes.map((fm, i) => (<FadeIn key={i} delay={i * 0.04}><div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", borderLeft: `4px solid ${RED}` }}><h3 style={{ fontSize: 15, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{fm.title}</h3><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{fm.desc}</p></div></FadeIn>))}
        </div>
      </div></section>
      <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "80px 28px" }}><div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn><span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Technology Stack</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Seven orchestration layers, mapped for government.</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 600, marginBottom: 36 }}>Layer 3 (Policy & Guardrails) carries disproportionate weight because government CX operates under security (FedRAMP, FISMA), accessibility (Section 508, ADA), and equity (Title VI language access) requirements that are legal mandates, not optional features. Every technology choice must pass these gates before functionality is even evaluated.</p></FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {stackLayers.map((sl, i) => (<FadeIn key={i} delay={i * 0.03}><div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "20px 22px", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}><div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 16, color: LIGHT }}>{sl.layer}</span></div><div style={{ flex: 1, minWidth: 250 }}><h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>{sl.name}</h3><p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 8px" }}>{sl.note}</p><div style={{ fontSize: 11, color: LIGHT }}>Key vendors: {sl.vendors}</div></div></div></FadeIn>))}
        </div>
      </div></section>
      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Industry Benchmarks</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>How government compares.</h2></FadeIn>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr style={{ borderBottom: `2px solid ${NAVY}` }}>{["Metric", "Gov Avg", "Cross-Industry", "Top Quartile", "Why It Differs"].map(h => (<th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: NAVY, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>{benchmarks.map((b, i) => (<tr key={i} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? "#fff" : WARM }}><td style={{ padding: "12px 14px", fontWeight: 600, color: NAVY }}>{b.metric}</td><td style={{ padding: "12px 14px", fontWeight: 700, color: AMBER }}>{b.avg}</td><td style={{ padding: "12px 14px", color: MUTED }}>{b.cross}</td><td style={{ padding: "12px 14px", color: GREEN, fontWeight: 600 }}>{b.top}</td><td style={{ padding: "12px 14px", color: SLATE, fontSize: 12 }}>{b.note}</td></tr>))}</tbody>
          </table>
        </div>
      </div></section>
      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Vendor Intelligence</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>CCaaS platforms strongest for government.</h2></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14, marginTop: 24 }} className="sub-grid">
          {[
            { name: "Genesys", score: 94, why: "FedRAMP authorized. Deepest routing for multi-agency, multilingual government operations. Proven at federal and state scale. GovCloud deployment.", href: "/vendors/genesys" },
            { name: "NICE CXone", score: 90, why: "FedRAMP authorized. Strong WEM for managing unionized government workforces. Compliance controls for Section 508 and language access.", href: "/vendors/nice-cxone" },
            { name: "Amazon Connect", score: 77, why: "AWS GovCloud FedRAMP High. Pay-per-use pricing ideal for government budget constraints. Strong for agencies with AWS cloud commitment.", href: "/vendors/amazon-connect" },
            { name: "Cisco", score: 78, why: "Massive government installed base. JITC certified for DoD. Strong in agencies with existing Cisco network infrastructure.", href: "/vendors/cisco" },
            { name: "Content Guru", score: 76, why: "Strong in UK/EMEA public sector. storm platform handles multi-agency, multi-language government operations with data sovereignty controls.", href: "/vendors" },
            { name: "Five9", score: 82, why: "Growing government presence. FedRAMP in process. Good for state and local agencies seeking modern CCaaS without federal-scale complexity.", href: "/vendors/five9" },
          ].map((v, i) => (<FadeIn key={i} delay={i * 0.04}><a href={v.href} style={{ display: "block", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 22px", transition: "all 0.2s", height: "100%" }} onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = "translateY(0)"; }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: 0 }}>{v.name}</h3><span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: ELECTRIC }}>{v.score}</span></div><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{v.why}</p></a></FadeIn>))}
        </div>
      </div></section>
      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}><FadeIn>
        <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 36px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Evaluating CX technology for government?</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>FedRAMP authorization, Section 508 accessibility, multilingual support, and procurement compliance change which platforms are viable. We can help you navigate the unique requirements of government CX technology selection.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>Request a Government CX Briefing</a>
            <a href="/tools/cx-maturity" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>Take the CX Maturity Assessment →</a>
          </div>
        </div>
      </FadeIn></div></section>
      <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={28} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span></div></div></footer>
    </div>
  );
}
