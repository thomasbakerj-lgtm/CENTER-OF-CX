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

export default function EducationVertical() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const subVerticals = [
    { name: "Undergraduate Admissions & Enrollment", slug: "undergrad-admissions", desc: "Inquiry management, application support, yield campaigns, and enrollment onboarding. Every interaction is a recruitment moment — the contact center is the first human impression.", contact: "High seasonal volume, deadline-driven" },
    { name: "Graduate & Professional Programs", slug: "graduate-programs", desc: "Program inquiries, application guidance, cohort management, and career-focused advising. Higher-touch, higher-stakes recruitment with longer decision cycles.", contact: "Moderate volume, relationship-intensive" },
    { name: "Financial Aid & Student Accounts", slug: "financial-aid", desc: "FAFSA support, aid packaging, billing inquiries, payment plans, and 1098-T. The most emotionally charged interactions in education — money determines access.", contact: "Very high volume, FAFSA-cycle surges" },
    { name: "Student Services & Campus Life", slug: "student-services", desc: "Housing, dining, health services, accessibility, counseling referrals, and Title IX. Support across the full student lifecycle from move-in to graduation.", contact: "Steady volume, broad service scope" },
    { name: "IT Help Desk & Learning Technology", slug: "it-helpdesk", desc: "LMS support, WiFi, account access, device troubleshooting, and classroom technology. Critical during first week of classes and exam periods.", contact: "Surge at semester start and exam periods" },
    { name: "Online & Continuing Education", slug: "online-education", desc: "Enrollment, technical support, proctor scheduling, credential verification, and corporate partnership management. The fastest-growing segment with retention challenges.", contact: "Growing volume, churn-sensitive" },
  ];
  const stats = [
    { n: "72%", label: "Of students who don't re-enroll cite customer service as the reason", source: "ECSI 2024" },
    { n: "18M", label: "Students enrolled in US colleges and universities", source: "HEP Inc 2025" },
    { n: "89%", label: "Believe a positive CX influences their choice of institution", source: "Zipdo 2025" },
    { n: "47%", label: "Would switch to a competitor due to poor customer service", source: "Zipdo 2025" },
    { n: "53%", label: "Increased retention after revamping CX strategies", source: "Zipdo 2025" },
    { n: "81%", label: "Expect quick responses from educational support services", source: "Zipdo 2025" },
  ];
  const failureModes = [
    { title: "Financial aid complexity is the #1 barrier to enrollment completion", desc: "A prospective student who can't understand their aid package, can't reach someone to explain it, or gets conflicting information from financial aid and billing will choose a different institution. FAFSA changes in 2024-2025 created additional confusion that many financial aid offices are still resolving." },
    { title: "Siloed departments create a runaround that students can't navigate", desc: "A student with a registration hold needs to call financial aid (to clear a balance), student accounts (to set up a payment plan), the registrar (to lift the hold), and advising (to register for classes). Four departments, four phone numbers, four wait times. The student sees one university; the university operates as disconnected offices." },
    { title: "Seasonal surges overwhelm capacity at the moments that matter most", desc: "Admissions yield season, FAFSA processing, fall registration, housing selection, and first-week-of-classes IT support all create 3-10x volume surges. These are the moments when the student's impression is formed — and they're the moments when wait times are longest." },
    { title: "Students expect Amazon-level responsiveness from institutions running 1990s systems", desc: "Students who get instant confirmation from Amazon, real-time tracking from Uber, and 24/7 chat from their bank expect the same from their university. Instead they get office hours of 8-5 M-F, a phone tree that hasn't been updated since 2015, and an email response SLA of '3-5 business days.'" },
    { title: "Retention signals are visible in service data but nobody connects them", desc: "A student who calls IT support 3 times about LMS issues, visits financial aid twice about a balance, and stops attending office hours is showing disengagement signals — but no one aggregates these touchpoints. By the time the retention team notices the student is gone, it's too late." },
  ];
  const stackLayers = [
    { layer: 7, name: "Analytics & Governance", vendors: "NICE, Qualtrics, EAB, Salesforce", note: "Enrollment yield analytics, retention risk correlation with service interactions, CSAT by service area, and seasonal volume forecasting." },
    { layer: 6, name: "Routing & Orchestration", vendors: "Genesys, NICE CXone, Five9, 8x8", note: "Department-based routing, yield campaign routing for admitted students, financial aid priority during FAFSA cycles, and IT surge routing." },
    { layer: 5, name: "Conversation Management", vendors: "Salesforce, Slate, EAB, Ada, LivePerson", note: "Admissions CRM communication, proactive financial aid notifications, student portal, chatbot for FAQ, and lifecycle messaging." },
    { layer: 4, name: "Reasoning & Planning", vendors: "Ada, Ocelot (Anthology), Ivy.ai, Google CCAI", note: "Application status bots, financial aid FAQ, registration help, IT troubleshooting, and campus services information." },
    { layer: 3, name: "Policy & Guardrails", vendors: "FERPA compliance, Title IX, ADA/Section 504", note: "FERPA student privacy, Title IX reporting protocols, ADA/504 accessibility, Clery Act safety, and GLBA financial data protection." },
    { layer: 2, name: "Workflow Execution", vendors: "Ellucian, Workday Student, Salesforce Education", note: "Admissions funnel, financial aid packaging, registration, housing assignment, and student case management workflows." },
    { layer: 1, name: "Data Access", vendors: "Ellucian Banner/Colleague, Workday, PeopleSoft, Slate, Salesforce", note: "SIS (Student Information System), admissions CRM, financial aid system, LMS (Canvas/Blackboard), and housing management." },
  ];
  const benchmarks = [
    { metric: "CSAT", avg: "72%", cross: "78%", top: "85%+", note: "Below average — siloed departments and seasonal understaffing suppress scores" },
    { metric: "FCR", avg: "55%", cross: "72%", top: "75%+", note: "Far below — cross-department issues and system limitations prevent resolution" },
    { metric: "AHT", avg: "7:00", cross: "7:00", top: "5:00", note: "Average — but financial aid and billing calls run 12-15 minutes" },
    { metric: "Abandonment", avg: "15%", cross: "6%", top: "4%", note: "Among the highest — FAFSA season and registration create mass abandonment" },
    { metric: "Attrition", avg: "35%", cross: "35%", top: "20%", note: "Average — seasonal staff and student workers contribute to turnover" },
    { metric: "Digital Adoption", avg: "35%", cross: "30%", top: "55%+", note: "Slightly above — students are digitally native but institutions lag" },
  ];
  return (
    <div><Nav />
      <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "130px 28px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn><div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}><a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span><a href="/industries" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Industries</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span><span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>Education</span></div></FadeIn>
          <FadeIn delay={0.05}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>Education{" "}<span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CX Intelligence</span></h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 640 }}>Admissions, enrollment, financial aid, student services, IT support, and lifecycle communications make education more contact-center-reliant than most people realize. With 72% of students who don't re-enroll citing customer service as the reason, the contact center directly affects enrollment yield, retention, and institutional revenue.</p>
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
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Six distinct education service models.</h2>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 32 }}>An undergraduate admissions office managing 50,000 applications and an online program supporting 10,000 adult learners have fundamentally different CX requirements. Recruitment vs retention, traditional vs non-traditional, residential vs fully remote.</p></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }} className="sub-grid">
          {subVerticals.map((sv, i) => (<FadeIn key={i} delay={i * 0.04}><a href={`/industries/education/${sv.slug}`} style={{ display: "block", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", height: "100%", transition: "border-color 0.2s", textDecoration: "none", color: "inherit" }} onMouseOver={e => e.currentTarget.style.borderColor = ELECTRIC} onMouseOut={e => e.currentTarget.style.borderColor = BORDER}><h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{sv.name}</h3><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: "0 0 10px" }}>{sv.desc}</p><span style={{ fontSize: 11, color: ELECTRIC, fontWeight: 500 }}>{sv.contact}</span><div style={{ fontSize: 12, fontWeight: 600, color: ELECTRIC, marginTop: 10 }}>Access CX Stack Framework →</div></a></FadeIn>))}
        </div>
      </div></section>
      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: RED, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>What Breaks</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Five failure modes unique to education CX.</h2></FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {failureModes.map((fm, i) => (<FadeIn key={i} delay={i * 0.04}><div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", borderLeft: `4px solid ${RED}` }}><h3 style={{ fontSize: 15, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{fm.title}</h3><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{fm.desc}</p></div></FadeIn>))}
        </div>
      </div></section>
      <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "80px 28px" }}><div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn><span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Technology Stack</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Seven orchestration layers, mapped for education.</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 600, marginBottom: 36 }}>Layer 3 (Policy & Guardrails) carries disproportionate weight because FERPA governs every student interaction — who can access what information, what can be disclosed, and to whom. A FERPA violation isn't just a compliance issue; it's a trust breach with an entire student body.</p></FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {stackLayers.map((sl, i) => (<FadeIn key={i} delay={i * 0.03}><div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "20px 22px", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}><div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 16, color: LIGHT }}>{sl.layer}</span></div><div style={{ flex: 1, minWidth: 250 }}><h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>{sl.name}</h3><p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 8px" }}>{sl.note}</p><div style={{ fontSize: 11, color: LIGHT }}>Key vendors: {sl.vendors}</div></div></div></FadeIn>))}
        </div>
      </div></section>
      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Industry Benchmarks</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>How education compares.</h2></FadeIn>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr style={{ borderBottom: `2px solid ${NAVY}` }}>{["Metric", "Education Avg", "Cross-Industry", "Top Quartile", "Why It Differs"].map(h => (<th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: NAVY, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>{benchmarks.map((b, i) => (<tr key={i} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? "#fff" : WARM }}><td style={{ padding: "12px 14px", fontWeight: 600, color: NAVY }}>{b.metric}</td><td style={{ padding: "12px 14px", fontWeight: 700, color: AMBER }}>{b.avg}</td><td style={{ padding: "12px 14px", color: MUTED }}>{b.cross}</td><td style={{ padding: "12px 14px", color: GREEN, fontWeight: 600 }}>{b.top}</td><td style={{ padding: "12px 14px", color: SLATE, fontSize: 12 }}>{b.note}</td></tr>))}</tbody>
          </table>
        </div>
      </div></section>
      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Vendor Intelligence</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>CCaaS platforms strongest for education.</h2></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14, marginTop: 24 }} className="sub-grid">
          {[
            { name: "Genesys", score: 94, why: "Multi-department routing for complex university operations. Handles the breadth — admissions, financial aid, registrar, IT, housing — on one platform with separate SLAs.", href: "/vendors/genesys" },
            { name: "NICE CXone", score: 90, why: "Strong WEM for managing seasonal education staffing. Student worker scheduling, surge capacity for FAFSA season, and compliance QA for FERPA.", href: "/vendors/nice-cxone" },
            { name: "Five9", score: 82, why: "Good fit for mid-size institutions. Outbound capability for yield campaigns. Salesforce integration for institutions using Salesforce Education Cloud.", href: "/vendors/five9" },
            { name: "8x8", score: 68, why: "Right-sized for smaller institutions combining phone system and contact center. UCaaS + CCaaS on one platform. Lower cost for 10-30 agent operations.", href: "/vendors" },
            { name: "Amazon Connect", score: 77, why: "Pay-per-use pricing ideal for seasonal education volume. AWS Lex for student self-service bots. Good for institutions with cloud engineering capacity.", href: "/vendors/amazon-connect" },
            { name: "Ocelot (Anthology)", score: "adj", why: "Education-specific AI chatbot and communication platform. Pre-built for financial aid, admissions, and student services. Integrated with Ellucian Banner and Colleague.", href: "/vendors" },
          ].map((v, i) => (<FadeIn key={i} delay={i * 0.04}><a href={v.href} style={{ display: "block", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 22px", transition: "all 0.2s", height: "100%" }} onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = "translateY(0)"; }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: 0 }}>{v.name}</h3>{v.score !== "adj" ? <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: ELECTRIC }}>{v.score}</span> : <span style={{ fontSize: 10, color: AMBER, fontWeight: 600 }}>Education-specific</span>}</div><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{v.why}</p></a></FadeIn>))}
        </div>
      </div></section>
      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}><FadeIn>
        <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 36px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Evaluating CX technology for education?</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>SIS integration, FERPA compliance, seasonal staffing, and multi-department routing change which platforms are viable. We can help you build a shortlist weighted for your institution type — research university, community college, or online program.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>Request an Education CX Briefing</a>
            <a href="/tools/cx-maturity" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>Take the CX Maturity Assessment →</a>
          </div>
        </div>
      </FadeIn></div></section>
      <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={28} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span></div></div></footer>
    </div>
  );
}
