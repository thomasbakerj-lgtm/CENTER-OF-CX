import { useState, useEffect, useRef } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };

function useInView(t=.1){const ref=useRef(null);const[v,setV]=useState(false);useEffect(()=>{const el=ref.current;if(!el)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.unobserve(el)}},{threshold:t});o.observe(el);return()=>o.disconnect()},[]);return[ref,v]}
function FadeIn({children,delay=0,style={}}){const[ref,v]=useInView();return<div ref={ref} style={{...style,opacity:v?1:0,transform:v?"translateY(0)":"translateY(22px)",transition:`opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`}}>{children}</div>}
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

function Nav(){const[scrolled,setScrolled]=useState(false);useEffect(()=>{const fn=()=>setScrolled(window.scrollY>50);window.addEventListener("scroll",fn,{passive:true});return()=>window.removeEventListener("scroll",fn)},[]);
const links=[{name:"Platforms & Tech",href:"/platforms-and-tech"},{name:"How to Choose",href:"/how-to-choose"},{name:"Research",href:"/research"},{name:"Vendors",href:"/vendors"},{name:"Advisory",href:"/advisory"}];
return(<><style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}@media(max-width:860px){.nav-links{display:none!important}.stat-grid{grid-template-columns:1fr 1fr!important}.stack-grid{grid-template-columns:1fr!important}.sub-grid{grid-template-columns:1fr!important}}`}</style>
<nav style={{position:"fixed",top:0,left:0,right:0,zIndex:1000,background:scrolled?"rgba(6,19,37,0.96)":"transparent",backdropFilter:scrolled?"blur(14px)":"none",borderBottom:scrolled?"1px solid rgba(255,255,255,0.05)":"none",transition:"all 0.35s",padding:scrolled?"12px 0":"20px 0"}}>
<div style={{...WRAP,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
<a href="/" style={{display:"flex",alignItems:"center",gap:10}}><LogoMark size={34}/><span style={{color:"#fff",fontWeight:600,fontSize:14.5,letterSpacing:0.4}}>THE CENTER OF <span style={{color:LIGHT}}>CX</span></span></a>
<div className="nav-links" style={{display:"flex",alignItems:"center",gap:28}}>
{links.map(l=><a key={l.name} href={l.href} style={{color:"rgba(255,255,255,0.7)",fontSize:13.5,fontWeight:500}}>{l.name}</a>)}
<a href="/contact" style={{color:"#fff",fontSize:13,fontWeight:600,background:ELECTRIC,padding:"9px 20px",borderRadius:6}}>Request Briefing</a>
</div></div></nav></>)}

export default function HealthcareVertical() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const subVerticals = [
    { name: "Health Systems & Hospitals", slug: "health-systems", desc: "Patient access, scheduling, billing inquiries, care coordination, and discharge follow-up. High emotional intensity with HIPAA governing every interaction.", contact: "High volume, high sensitivity" },
    { name: "Health Insurance (Payers)", slug: "health-insurance", desc: "Benefits verification, claims status, prior authorization, provider search, and enrollment. Complex multi-step journeys with regulatory language requirements.", contact: "Very high volume, complex policy logic" },
    { name: "Provider Groups & Clinics", slug: "provider-groups", desc: "Appointment scheduling, prescription refills, referral coordination, and billing. Smaller operations but patients expect the same responsiveness as large systems.", contact: "Moderate volume, relationship-intensive" },
    { name: "Digital Health & Telehealth", slug: "digital-health", desc: "Platform support, virtual visit scheduling, technical troubleshooting, and prescription management. Digital-native patients with low tolerance for friction.", contact: "Growing volume, digital-first channels" },
    { name: "Pharmaceutical & Life Sciences", slug: "pharma-life-sciences", desc: "Patient support programs, co-pay assistance, adverse event reporting, and HCP inquiries. Regulatory constraints shape every workflow.", contact: "Specialized volume, strict compliance" },
    { name: "Home Health & Post-Acute", slug: "home-health", desc: "Visit scheduling, caregiver coordination, supply management, and family communication. Vulnerable populations requiring empathy-first design.", contact: "Lower volume, highest emotional stakes" },
  ];

  const stats = [
    { n: "52%", label: "Average first contact resolution rate in healthcare", source: "DialogHealth" },
    { n: "3.5", label: "Average calls per patient per scheduling need", source: "DialogHealth" },
    { n: "4x", label: "More likely to switch after a negative phone interaction", source: "Industry research" },
    { n: "7%", label: "Average call abandonment rate in healthcare", source: "Sprinklr / LiveAgent" },
    { n: "40-45%", label: "Contact center agent turnover rate in healthcare", source: "Insignia Resource 2025" },
    { n: "19%", label: "Call transfer rate — nearly 1 in 5 patients get passed", source: "DialogHealth" },
  ];

  const failureModes = [
    { title: "HIPAA creates handoff friction that patients feel", desc: "Protected health information rules require identity verification at every channel switch. A patient who authenticated on the phone must re-authenticate in chat. Context cannot flow freely across systems without consent and audit trail controls." },
    { title: "Scheduling consumes agent capacity without resolution", desc: "Patients call 3.5 times per scheduling need on average. The root cause is often system fragmentation — the scheduling system, EHR, and contact center platform operate independently, forcing agents to navigate multiple screens per booking." },
    { title: "Empathy-intensive interactions accelerate burnout", desc: "Healthcare agents handle calls involving fear, grief, financial stress, and medical uncertainty. Without structured coaching, wellness support, and call-type rotation, turnover rates exceed 40% annually — well above cross-industry averages." },
    { title: "Prior authorization creates the worst patient journey", desc: "Prior auth workflows involve the patient, provider, payer, and pharmacy — each with different systems, timelines, and information needs. The contact center absorbs the frustration of a process it cannot control." },
    { title: "After-hours coverage creates clinical risk", desc: "Triaging urgent clinical calls outside business hours requires protocols that most generic contact center platforms cannot enforce. Routing a billing question and a symptom-escalation call through the same queue creates patient safety risk." },
  ];

  const stackLayers = [
    { layer: 7, name: "Analytics & Governance", vendors: "NICE Nexidia, Verint, Qualtrics XM, Press Ganey", note: "CAHPS and HCAHPS survey integration. Patient sentiment tracking. Compliance audit trails for every recorded interaction." },
    { layer: 6, name: "Routing & Orchestration", vendors: "NICE CXone, Genesys, Talkdesk Healthcare, Cisco", note: "Clinical vs administrative triage routing. After-hours escalation protocols. Provider callback workflows." },
    { layer: 5, name: "Conversation Management", vendors: "Hyro.ai, LivePerson, Ada, Orbita", note: "Patient-facing AI for scheduling, FAQs, and prescription refills. Secure messaging for clinical follow-up. Portal chat integration." },
    { layer: 4, name: "Reasoning & Planning", vendors: "Nuance DAX, Amelia, Cognigy, Google CCAI", note: "Clinical language understanding. Symptom triage logic. Intent detection for clinical vs administrative queries." },
    { layer: 3, name: "Policy & Guardrails", vendors: "Pindrop, LexisNexis, Imprivata", note: "HIPAA-compliant recording and storage. Patient identity verification. Consent management. PHI redaction in analytics." },
    { layer: 2, name: "Workflow Execution", vendors: "ServiceNow, UiPath, Pega, Workato", note: "Prior authorization automation. Referral coordination workflows. Insurance verification at point of scheduling." },
    { layer: 1, name: "Data Access", vendors: "Epic, Cerner (Oracle Health), athenahealth, Salesforce Health Cloud", note: "EHR integration is the foundation. Agent desktop must surface patient history, appointments, and insurance without PHI exposure risk." },
  ];

  const benchmarks = [
    { metric: "CSAT", avg: "76%", cross: "78%", top: "88%+", note: "Below cross-industry — driven by emotionally charged interactions and process friction" },
    { metric: "FCR", avg: "52%", cross: "72%", top: "82%+", note: "Significantly below average — multi-system scheduling and auth requirements prevent single-call resolution" },
    { metric: "AHT", avg: "6:36", cross: "7:00", top: "5:20", note: "Slightly faster but misleading — simple scheduling calls mask very long complex interactions" },
    { metric: "Abandon Rate", avg: "7%", cross: "6%", top: "3%", note: "Slightly above average — staffing gaps during peak hours drive abandonment" },
    { metric: "Attrition", avg: "42%", cross: "35%", top: "20%", note: "Well above average — emotional labor and burnout are the primary drivers" },
    { metric: "Transfer Rate", avg: "19%", cross: "15%", top: "8%", note: "Highest of any vertical — clinical/administrative routing gaps force transfers" },
  ];

  return (
    <div><Nav />
      <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "130px 28px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn><div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
            <a href="/industries" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Industries</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
            <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>Healthcare</span>
          </div></FadeIn>
          <FadeIn delay={0.05}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>Healthcare{" "}<span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CX Intelligence</span></h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 640 }}>Patient access, scheduling complexity, payer-provider friction, and HIPAA compliance define every interaction. Healthcare CX operates under emotional and regulatory constraints that generic platforms consistently underserve. This is the vertical-specific intelligence layer for health systems, payers, providers, and digital health.</p>
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
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Six distinct service models under one vertical.</h2>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 32 }}>A health system contact center managing patient access for 50 hospitals has fundamentally different requirements than a payer handling benefits verification for 3 million members. The technology, compliance, and staffing models diverge completely.</p>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }} className="sub-grid">
          {subVerticals.map((sv, i) => (<FadeIn key={i} delay={i * 0.04}><a href={`/industries/healthcare/${sv.slug}`} style={{ display: "block", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", height: "100%", transition: "border-color 0.2s", textDecoration: "none", color: "inherit" }} onMouseOver={e => e.currentTarget.style.borderColor = ELECTRIC} onMouseOut={e => e.currentTarget.style.borderColor = BORDER}><h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{sv.name}</h3><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: "0 0 10px" }}>{sv.desc}</p><span style={{ fontSize: 11, color: ELECTRIC, fontWeight: 500 }}>{sv.contact}</span><div style={{ fontSize: 12, fontWeight: 600, color: ELECTRIC, marginTop: 10 }}>Access CX Stack Framework →</div></a></FadeIn>))}
        </div>
      </div></section>

      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: RED, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>What Breaks</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Five failure modes unique to healthcare CX.</h2>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 32 }}>Healthcare contact centers absorb the friction of fragmented systems, regulatory constraints, and emotionally charged interactions. These are the patterns that generic CX strategies consistently miss.</p>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {failureModes.map((fm, i) => (<FadeIn key={i} delay={i * 0.04}><div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", borderLeft: `4px solid ${RED}` }}><h3 style={{ fontSize: 15, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{fm.title}</h3><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{fm.desc}</p></div></FadeIn>))}
        </div>
      </div></section>

      <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "80px 28px" }}><div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn><span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Technology Stack</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Seven orchestration layers, mapped for healthcare.</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 600, marginBottom: 36 }}>Layer 1 (Data Access) carries disproportionate weight because EHR integration determines whether agents can resolve issues or merely document them. Without real-time patient data, every other layer underperforms.</p>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {stackLayers.map((sl, i) => (<FadeIn key={i} delay={i * 0.03}><div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "20px 22px", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}><div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 16, color: LIGHT }}>{sl.layer}</span></div><div style={{ flex: 1, minWidth: 250 }}><h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>{sl.name}</h3><p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 8px" }}>{sl.note}</p><div style={{ fontSize: 11, color: LIGHT }}>Key vendors: {sl.vendors}</div></div></div></FadeIn>))}
        </div>
      </div></section>

      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Industry Benchmarks</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>How healthcare compares.</h2>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 32 }}>Healthcare underperforms cross-industry on FCR, transfer rate, and attrition. The root cause is system fragmentation and emotional labor — both addressable with the right technology and operating model.</p>
        </FadeIn>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}><thead><tr style={{ borderBottom: `2px solid ${NAVY}` }}>{["Metric", "HC Average", "Cross-Industry", "Top Quartile", "Why It Differs"].map(h => (<th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: NAVY, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
            <tbody>{benchmarks.map((b, i) => { const worse = ["FCR","CSAT"].includes(b.metric) ? parseFloat(b.avg) < parseFloat(b.cross) : parseFloat(b.avg) > parseFloat(b.cross); return (<tr key={i} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? "#fff" : WARM }}><td style={{ padding: "12px 14px", fontWeight: 600, color: NAVY }}>{b.metric}</td><td style={{ padding: "12px 14px", fontWeight: 700, color: worse ? RED : GREEN }}>{b.avg}</td><td style={{ padding: "12px 14px", color: MUTED }}>{b.cross}</td><td style={{ padding: "12px 14px", color: GREEN, fontWeight: 600 }}>{b.top}</td><td style={{ padding: "12px 14px", color: SLATE, fontSize: 12 }}>{b.note}</td></tr>); })}</tbody>
          </table>
        </div>
        <FadeIn delay={0.1}><div style={{ display: "flex", gap: 14, marginTop: 24, flexWrap: "wrap" }}><a href="/tools/experience-scorecard" style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC }}>Score your metrics against these benchmarks →</a><a href="/tco-calculator" style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Model your healthcare TCO →</a></div></FadeIn>
      </div></section>

      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: AMBER, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>The BPO Question</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>How outsourcing fits in healthcare CX.</h2></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }} className="sub-grid">
          <FadeIn delay={0.04}><div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px" }}><h3 style={{ fontSize: 15, fontWeight: 600, color: GREEN, margin: "0 0 8px" }}>Where BPOs add value</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{["Appointment scheduling and confirmation calls", "Insurance verification and eligibility checks", "Patient satisfaction surveys and follow-up", "After-hours triage (with clinical oversight protocols)", "Revenue cycle — billing inquiries and payment collections"].map((item, i) => (<p key={i} style={{ fontSize: 13, color: SLATE, margin: 0, lineHeight: 1.5, paddingLeft: 12, borderLeft: `2px solid ${GREEN}30` }}>{item}</p>))}</div></div></FadeIn>
          <FadeIn delay={0.08}><div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px" }}><h3 style={{ fontSize: 15, fontWeight: 600, color: RED, margin: "0 0 8px" }}>Where BPOs create risk</h3><div style={{ display: "flex", flexDirection: "column", gap: 6 }}>{["Clinical triage requires licensed professionals and institutional protocols", "HIPAA training gaps create compliance exposure — violations cost $100-$50,000 per incident", "PHI handling across offshore locations introduces data residency complexity", "Care coordination requires EHR access that most BPO contracts underspecify", "Patient empathy in crisis moments (diagnosis, end-of-life) requires institutional depth"].map((item, i) => (<p key={i} style={{ fontSize: 13, color: SLATE, margin: 0, lineHeight: 1.5, paddingLeft: 12, borderLeft: `2px solid ${RED}30` }}>{item}</p>))}</div></div></FadeIn>
        </div>
      </div></section>

      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn><span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Vendor Intelligence</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>CCaaS platforms strongest for healthcare.</h2></FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14, marginTop: 24 }} className="sub-grid">
          {[
            { name: "NICE CXone", score: 90, why: "Industry-leading compliance controls, WEM for healthcare staffing, and analytics depth for CAHPS alignment. Strong in payer and provider environments.", href: "/vendors/nice-cxone" },
            { name: "Genesys", score: 94, why: "Deepest routing for clinical vs administrative triage. Strong EHR integration ecosystem. Proven in large health systems.", href: "/vendors/genesys" },
            { name: "Talkdesk", score: 78, why: "Purpose-built Healthcare Experience Cloud with Epic integration, HIPAA compliance, and pre-built patient access workflows.", href: "/vendors/talkdesk" },
            { name: "Cisco", score: 78, why: "Enterprise security posture critical for healthcare networks. Strong in health systems with existing Cisco infrastructure.", href: "/vendors/cisco" },
            { name: "8x8", score: 68, why: "HIPAA-compliant unified communications for mid-size provider groups needing voice, video, and contact center on one platform.", href: "/vendors/8x8" },
            { name: "Five9", score: 82, why: "Strong Salesforce Health Cloud integration. Practical AI for patient scheduling and insurance verification.", href: "/vendors/five9" },
          ].map((v, i) => (<FadeIn key={i} delay={i * 0.04}><a href={v.href} style={{ display: "block", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 22px", transition: "all 0.2s", height: "100%" }} onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = "translateY(0)"; }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: 0 }}>{v.name}</h3><span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: ELECTRIC }}>{v.score}</span></div><p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{v.why}</p></a></FadeIn>))}
        </div>
        <FadeIn delay={0.2}><div style={{ textAlign: "center", marginTop: 24 }}><a href="/vendors/ccaas" style={{ fontSize: 14, fontWeight: 600, color: ELECTRIC }}>See all 28 CCaaS vendors scored →</a></div></FadeIn>
      </div></section>

      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}><FadeIn>
        <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Evaluating CX technology for healthcare?</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>HIPAA, EHR integration, and clinical triage routing change which platforms are viable. We can help you build a shortlist weighted for your specific sub-vertical — health systems, payers, providers, or digital health.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>Request a Healthcare Briefing</a>
              <a href="/tools/cx-maturity" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>Take the CX Maturity Assessment →</a>
            </div>
          </div>
        </div>
      </FadeIn></div></section>

      <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={28} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span></div></div></footer>
    </div>
  );
}
