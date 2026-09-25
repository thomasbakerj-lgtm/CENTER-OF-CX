import { useState, useEffect, useRef } from "react";
import ClaimText, { ClaimSources } from "./src/lib/ClaimText.jsx";
import { claimIds, claim } from "./src/lib/claims.js";
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

export default function EducationVertical() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const subVerticals = [
    { name: "Undergraduate Admissions & Enrollment", slug: "undergrad-admissions", desc: "Inquiry management, application support, yield campaigns, and enrollment onboarding. Every interaction is a recruitment moment: the contact center is the first human impression.", contact: "High seasonal volume, deadline-driven" },
    { name: "Graduate & Professional Programs", slug: "graduate-programs", desc: "Program inquiries, application guidance, cohort management, and career-focused advising. Higher-touch, higher-stakes recruitment with longer decision cycles.", contact: "Moderate volume, relationship-intensive" },
    { name: "Financial Aid & Student Accounts", slug: "financial-aid", desc: "FAFSA support, aid packaging, billing inquiries, payment plans, and 1098-T. Among the most emotionally charged interactions in education, because money determines access.", contact: "Very high volume, FAFSA-cycle surges" },
    { name: "Student Services & Campus Life", slug: "student-services", desc: "Housing, dining, health services, accessibility, counseling referrals, and Title IX. Support across the full student lifecycle from move-in to graduation.", contact: "Steady volume, broad service scope" },
    { name: "IT Help Desk & Learning Technology", slug: "it-helpdesk", desc: "LMS support, WiFi, account access, device troubleshooting, and classroom technology. Critical during first week of classes and exam periods.", contact: "Surge at semester start and exam periods" },
    { name: "Online & Continuing Education", slug: "online-education", desc: "Enrollment, technical support, proctor scheduling, credential verification, and corporate partnership management. Adult learners at a distance, where retention is the central challenge.", contact: "Growing volume, churn-sensitive" },
  ];
  /* Verified statistics only (TB, S23): each names its primary publisher, linked where checked on the publisher's own page. Aggregator, vendor-blog
     and uncited figures were removed. */
  const stats = [
    { id: "edu.nsc.enroll", label: "Postsecondary enrollments in the US, fall 2025" },
    { id: "edu.nsc.persist", label: "Fall 2024 college starters still enrolled a year later, at any institution" },
    { id: "edu.nsc.retain", label: "Fall 2024 college starters still at their starting institution a year later" },
  ].map((s) => { const c = claim(s.id); return { ...s, n: c.value, source: `${c.source.publisher}, ${c.source.year}`, url: c.source.url }; });
  const HERO = "Admissions, enrollment, financial aid, student services, IT support, and lifecycle communications make education depend on the contact center at every stage. Of students who started college in fall 2024, [[edu.nsc.retain]] were back at the same institution a year later. Every service contact along the way, from the first inquiry to the aid office to the help desk, is part of that record.";
  const failureModes = [
    { title: "Financial aid confusion stops enrollment", desc: "A prospective student who cannot understand their aid offer, cannot reach someone to explain it, or hears different answers from financial aid and billing may choose another institution. The redesigned FAFSA added new terms and a new timeline that families and aid offices are still learning." },
    { title: "Siloed departments create a runaround that students can't navigate", desc: "A student with a registration hold needs to call financial aid (to clear a balance), student accounts (to set up a payment plan), the registrar (to lift the hold), and advising (to register for classes). Each office has its own phone number and its own queue. The student sees one university; the university operates as disconnected offices." },
    { title: "Seasonal surges overwhelm capacity at the moments that matter most", desc: "Admissions yield season, FAFSA processing, fall registration, housing selection, and first-week-of-classes IT support all create surges of [[edu.surge]] normal volume. These are the moments when the student's impression is formed, and they're the moments when wait times are longest." },
    { title: "Consumer service habits meet office-hours service", desc: "Students used to instant order confirmation, live delivery tracking and round-the-clock chat from their bank bring the same expectations to their university. Many offices still answer only during weekday business hours, run phone trees nobody has revisited in years, and promise email replies within several business days." },
    { title: "Retention signals are visible in service data but nobody connects them", desc: "A student who keeps calling IT support about LMS problems, returns to financial aid about a balance, and stops coming to office hours is showing disengagement, but no one sees these contacts together. The retention team often learns of it only after the student has left." },
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
    { metric: "CSAT", avg: "[[edu.bench.csat.edu]]", cross: "[[edu.bench.csat.cross]]", note: "Moves with handoffs between separate offices and with staffing in peak weeks" },
    { metric: "FCR", avg: "[[edu.bench.fcr.edu]]", cross: "[[edu.bench.fcr.cross]]", note: "Issues that span financial aid, student accounts and the registrar stand in the way of single-contact resolution" },
    { metric: "AHT", avg: "[[edu.bench.aht.edu]]", cross: "[[edu.bench.aht.cross]]", note: "An average hides the spread: quick deadline questions sit beside long aid and billing calls" },
    { metric: "Abandonment", avg: "[[edu.bench.abandon.edu]]", cross: "[[edu.bench.abandon.cross]]", note: "Driven by staffing against FAFSA, registration and term-start peaks" },
    { metric: "Attrition", avg: "[[edu.bench.attrition.edu]]", cross: "[[edu.bench.attrition.cross]]", note: "Seasonal staff and student workers turn over by design; measure permanent staff separately" },
  ];
  return (
    <div><Nav />
      <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "130px 28px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn><div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}><a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span><a href="/industries" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Industries</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span><span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>Education</span></div></FadeIn>
          <FadeIn delay={0.05}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>Education{" "}<span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CX Intelligence</span></h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 640 }}><ClaimText text={HERO} /></p>
          </FadeIn>
        </div>
      </section>
      {stats.length > 0 && (<section style={{ background: "#fff", padding: "48px 28px", borderBottom: `1px solid ${BORDER}` }}><div style={WRAP}><FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(stats.length, 6)}, 1fr)`, gap: 16 }} className="stat-grid">
          {stats.map((s, i) => (<div key={i} style={{ textAlign: "center", padding: "12px 8px" }}><div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: ELECTRIC }}>{s.n}</div><div style={{ fontSize: 11, color: SLATE, lineHeight: 1.4, marginTop: 4 }}>{s.label}</div>{s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", fontSize: 11, color: MUTED, marginTop: 2, textDecoration: "underline" }}>{s.source}</a> : <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{s.source}</div>}</div>))}
        </div>
      </FadeIn></div></section>)}
      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Sub-Verticals</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Six distinct education service models.</h2>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 32 }}>A large undergraduate admissions office and an online program serving working adults need different things from a contact center: one recruits, the other retains; one serves recent high school graduates on campus, the other serves adults who may never set foot there.</p></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }} className="sub-grid">
          {subVerticals.map((sv, i) => (<FadeIn key={i} delay={i * 0.04}><a href={`/industries/education/${sv.slug}`} style={{ display: "block", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", height: "100%", transition: "border-color 0.2s", textDecoration: "none", color: "inherit" }} onMouseOver={e => e.currentTarget.style.borderColor = ELECTRIC} onMouseOut={e => e.currentTarget.style.borderColor = BORDER}><h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{sv.name}</h3><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: "0 0 10px" }}>{sv.desc}</p><span style={{ fontSize: 11, color: ELECTRIC, fontWeight: 500 }}>{sv.contact}</span><div style={{ fontSize: 12, fontWeight: 600, color: ELECTRIC, marginTop: 10 }}>Access CX Stack Framework →</div></a></FadeIn>))}
        </div>
      </div></section>
      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: RED, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>What Breaks</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Five failure modes unique to education CX.</h2></FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {failureModes.map((fm, i) => (<FadeIn key={i} delay={i * 0.04}><div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", borderLeft: `4px solid ${RED}` }}><h3 style={{ fontSize: 15, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{fm.title}</h3><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}><ClaimText text={fm.desc} /></p></div></FadeIn>))}
        </div>
      </div></section>
      <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "80px 28px" }}><div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn><span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Technology Stack</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Seven orchestration layers, mapped for education.</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 600, marginBottom: 36 }}>Layer 3 (Policy & Guardrails) carries extra weight because FERPA governs who may see a student's records and what may be disclosed, and to whom. A disclosure to the wrong person is a compliance failure and a breach of the trust students place in the institution.</p></FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {stackLayers.map((sl, i) => (<FadeIn key={i} delay={i * 0.03}><div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "20px 22px", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}><div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 16, color: LIGHT }}>{sl.layer}</span></div><div style={{ flex: 1, minWidth: 250 }}><h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>{sl.name}</h3><p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 8px" }}>{sl.note}</p><div style={{ fontSize: 11, color: LIGHT }}>Key vendors: {sl.vendors}</div></div></div></FadeIn>))}
        </div>
      </div></section>
      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Industry Benchmarks</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>How education compares.</h2>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 32 }}>No free public source reports contact center metrics for colleges and universities, and SQM Group's industry breakouts do not include education. Measure yours with the linked tools. Each all-industry figure is labelled with what it measures. The published education figures are enrollment and persistence, shown above.</p></FadeIn>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr style={{ borderBottom: `2px solid ${NAVY}` }}>{["Metric", "Education", "All Industries", "What Drives It"].map(h => (<th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: NAVY, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>{benchmarks.map((b, i) => (<tr key={i} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? "#fff" : WARM }}><td style={{ padding: "12px 14px", fontWeight: 600, color: NAVY }}>{b.metric}</td><td style={{ padding: "12px 14px", fontWeight: 700, color: NAVY }}><ClaimText text={b.avg} /></td><td style={{ padding: "12px 14px", color: MUTED }}><ClaimText text={b.cross} /></td><td style={{ padding: "12px 14px", color: SLATE, fontSize: 12 }}>{b.note}</td></tr>))}</tbody>
          </table>
        </div>
        <div id="sources" style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${BORDER}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>Sources and assumptions</h3>
          <p style={{ fontSize: 13, color: MUTED, margin: "0 0 18px" }}>Every figure on this page is a published figure checked on the publisher's own page, a labelled planning assumption you can test with your own numbers, or marked as having no public benchmark.</p>
          <ClaimSources ids={claimIds([HERO, stats.map((s) => `[[${s.id}]]`), benchmarks, failureModes])} color={SLATE} accent={ELECTRIC} />
        </div>
      </div></section>
      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Vendor Intelligence</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>CCaaS platforms often evaluated for education.</h2></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14, marginTop: 24 }} className="sub-grid">
          {[
            { name: "Genesys", why: "Multi-department routing for complex university operations. Handles the breadth of a university (admissions, financial aid, registrar, IT, housing) on one platform with separate service levels.", href: "/vendors/genesys" },
            { name: "NICE CXone", why: "Workforce management for seasonal education staffing. Student worker scheduling, surge capacity for FAFSA season, and compliance QA for FERPA.", href: "/vendors/nice-cxone" },
            { name: "Five9", why: "Often considered by mid-size institutions. Outbound capability for yield campaigns. Salesforce integration for institutions using Salesforce Education Cloud.", href: "/vendors/five9" },
            { name: "8x8", why: "Suited to smaller institutions combining the phone system and contact center: UCaaS and CCaaS on one platform.", href: "/vendors" },
            { name: "Amazon Connect", why: "Pay-per-use pricing follows seasonal education volume. Amazon Lex for student self-service bots. Fits institutions with cloud engineering capacity.", href: "/vendors/amazon-connect" },
            { name: "Ocelot (Anthology)", adj: true, why: "Education-specific AI chatbot and communication platform. Pre-built for financial aid, admissions, and student services. Integrated with Ellucian Banner and Colleague.", href: "/vendors" },
          ].sort((a, b) => a.name.localeCompare(b.name)).map((v, i) => (<FadeIn key={i} delay={i * 0.04}><a href={v.href} style={{ display: "block", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 22px", transition: "all 0.2s", height: "100%" }} onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = "translateY(0)"; }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: 0 }}>{v.name}</h3>{v.adj && <span style={{ fontSize: 10, color: AMBER, fontWeight: 600 }}>Education-specific</span>}</div><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{v.why}</p></a></FadeIn>))}
        </div>
      </div></section>
      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}><FadeIn>
        <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 36px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Evaluating CX technology for education?</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>SIS integration, FERPA compliance, seasonal staffing, and multi-department routing change which platforms are viable. We can help you build a shortlist weighted for your institution type: research university, community college, or online program.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>Request an Education CX Briefing</a>
            <a href="/tools/cx-maturity" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>Take the CX Maturity Assessment →</a>
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
