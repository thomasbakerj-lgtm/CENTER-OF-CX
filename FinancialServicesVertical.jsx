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

export default function FinancialServicesVertical() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const subVerticals = [
    { name: "Retail Banking", slug: "retail-banking", desc: "Account servicing, fraud alerts, card disputes, loan inquiries, and branch-to-digital migration. The highest volume sub-vertical with the broadest channel mix.", contact: "High volume, moderate complexity" },
    { name: "Credit Unions", slug: "credit-unions", desc: "Member-centric service with relationship depth. Smaller operations but higher trust expectations and community accountability.", contact: "Lower volume, higher relationship intensity" },
    { name: "Insurance (P&C, Life, Health)", slug: "insurance", desc: "Claims intake (FNOL), policy servicing, renewals, underwriting support, and high-emotion service journeys. Compliance and empathy are equally critical.", contact: "Moderate volume, high complexity per interaction" },
    { name: "Wealth Management & Advisory", slug: "wealth-management", desc: "Portfolio inquiries, advisor scheduling, compliance-sensitive communications, and high-value client retention. Every interaction carries revenue risk.", contact: "Low volume, very high value per interaction" },
    { name: "Lending & Mortgage", slug: "lending-mortgage", desc: "Application status, document collection, rate inquiries, closing coordination, and servicing. Long lifecycle journeys with multiple handoffs.", contact: "Seasonal volume spikes, complex multi-step journeys" },
    { name: "Fintech & Neobanks", slug: "fintech-neobanks", desc: "Digital-native service models with app-first support, instant resolution expectations, and chat-heavy channel mix. Speed and self-service define the experience.", contact: "High digital volume, low tolerance for friction" },
    { name: "Payments & Processing", slug: "payments-processing", desc: "Merchant support, transaction disputes, terminal troubleshooting, settlement inquiries, and integration support. B2B and B2C service models coexist.", contact: "Mixed B2B and B2C, technical support needs" },
  ];

  const stats = [
    { n: "79%", label: "Average CSAT in financial services contact centers", source: "Sprinklr / industry composite" },
    { n: "46%", label: "Of adults open to switching banks or using multiple institutions", source: "TTEC / industry research" },
    { n: "73%", label: "Of consumers expect seamless channel transitions", source: "CX Today" },
    { n: "13%", label: "Of consumers feel their financial institution meets that expectation", source: "CX Today" },
    { n: "1.3x", label: "Longer hold times than cross-industry average", source: "Talkdesk" },
    { n: "55%", label: "Of banks globally report FCR below 70%", source: "Capgemini" },
  ];

  const failureModes = [
    { title: "Authentication friction kills digital adoption", desc: "Customers must re-authenticate when switching channels, creating abandonment at the exact moment they need help most. Identity verification adds 45-90 seconds per interaction in regulated environments." },
    { title: "Compliance recording creates agent cognitive load", desc: "Mandatory disclosures, consent language, and call recording requirements add process steps that increase AHT and reduce the agent's ability to focus on resolution." },
    { title: "Fraud and service use the same queue", desc: "Fraud alerts requiring immediate action compete with routine balance inquiries for agent attention. Without intent-based routing, high-urgency interactions wait behind low-complexity ones." },
    { title: "Branch-to-digital handoffs lose context", desc: "When a customer starts a mortgage conversation in-branch and follows up through the contact center, context is lost. The agent sees the account but has no visibility into the branch interaction." },
    { title: "Retention save workflows burn agents out", desc: "Agents handling cancellation and retention calls face emotional labor that accelerates attrition. These interactions require negotiation skills most training programs underinvest in." },
  ];

  const stackLayers = [
    { layer: 7, name: "Analytics & Governance", vendors: "NICE Nexidia, Verint, CallMiner, Observe.AI, Qualtrics XM", fsNote: "Compliance recording and auditability are non-negotiable. Interaction analytics must support regulatory review and dispute resolution." },
    { layer: 6, name: "Routing & Orchestration", vendors: "Genesys, NICE CXone, Five9, Talkdesk FS", fsNote: "Intent-based routing separating fraud, service, and sales. VIP routing for wealth management. Skills-based routing for licensed representatives." },
    { layer: 5, name: "Conversation Management", vendors: "Glia, LivePerson, Unblu, Intercom, Ada", fsNote: "Secure messaging for sensitive data. Co-browsing for complex applications. Video for advisory consultations. Chat for transactional queries." },
    { layer: 4, name: "Reasoning & Planning", vendors: "Kasisto, Cognigy, Kore.ai, Amelia, Google CCAI", fsNote: "AI must handle balance inquiries, transaction lookups, and card management while escalating fraud, disputes, and complex financial advice to humans." },
    { layer: 3, name: "Policy & Guardrails", vendors: "Sift, BioCatch, Forter, Pindrop, Nuance", fsNote: "PCI compliance for payment data. KYC/AML identity verification. Fraud detection integrated into the interaction flow. Consent management." },
    { layer: 2, name: "Workflow Execution", vendors: "MuleSoft, Workato, UiPath, Pega, ServiceNow", fsNote: "Account opening workflows. Dispute resolution automation. Loan origination orchestration. Cross-system data synchronization." },
    { layer: 1, name: "Data Access", vendors: "Salesforce FSC, FIS, Fiserv, Jack Henry, Temenos", fsNote: "Core banking integration is the foundation. Agent desktop must surface account data, transaction history, and product holdings in real time." },
  ];

  const benchmarks = [
    { metric: "CSAT", fsAvg: "79%", crossIndustry: "78%", topQuartile: "88%+", note: "FS tracks close to cross-industry average despite higher interaction complexity" },
    { metric: "FCR", fsAvg: "68%", crossIndustry: "72%", topQuartile: "82%+", note: "Lower than average — compliance steps and multi-system lookups reduce first-contact resolution" },
    { metric: "AHT", fsAvg: "6:40", crossIndustry: "7:00", topQuartile: "5:20", note: "Slightly faster than average due to transactional inquiry volume, but complex interactions skew higher" },
    { metric: "Abandon Rate", fsAvg: "12%", crossIndustry: "6%", topQuartile: "3%", note: "Significantly higher than average — driven by authentication friction and hold time" },
    { metric: "Attrition", fsAvg: "28%", crossIndustry: "35%", topQuartile: "20%", note: "Lower than average — better compensation offsets emotional labor of fraud and retention work" },
    { metric: "Containment", fsAvg: "20%", crossIndustry: "25%", topQuartile: "40%+", note: "Below average — security and compliance requirements limit what automation can handle independently" },
  ];

  return (
    <div>
      <Nav />

      {/* Hero */}
      <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "130px 28px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
              <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
              <a href="/industries" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Industries</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
              <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>Financial Services</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>
              Financial Services{" "}<span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>CX Intelligence</span>
            </h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 640 }}>
              Trust, compliance, and identity verification shape every interaction. Financial services CX operates under constraints that generic platforms and generic advice fail to address. This is the vertical-specific intelligence layer — benchmarks, technology stack mapping, failure modes, and vendor recommendations built for banking, insurance, lending, and wealth management.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ background: "#fff", padding: "48px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 16 }} className="stat-grid">
              {stats.map((s, i) => (
                <div key={i} style={{ textAlign: "center", padding: "12px 8px" }}>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: ELECTRIC }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: SLATE, lineHeight: 1.4, marginTop: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 9, color: MUTED, marginTop: 2 }}>{s.source}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Sub-verticals */}
      <section style={{ background: WARM, padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Sub-Verticals</span>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Financial services is seven verticals in one.</h2>
            <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 32 }}>A retail banking contact center and a wealth management advisory desk have fundamentally different service models, compliance requirements, and technology needs. Treating them as one vertical is the first evaluation mistake.</p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }} className="sub-grid">
            {subVerticals.map((sv, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <a href={`/industries/financial-services/${sv.slug}`} style={{ display: "block", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", height: "100%", transition: "border-color 0.2s", textDecoration: "none", color: "inherit" }}
                  onMouseOver={e => e.currentTarget.style.borderColor = ELECTRIC}
                  onMouseOut={e => e.currentTarget.style.borderColor = BORDER}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{sv.name}</h3>
                  <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: "0 0 10px" }}>{sv.desc}</p>
                  <span style={{ fontSize: 11, color: ELECTRIC, fontWeight: 500 }}>{sv.contact}</span>
                  <div style={{ fontSize: 12, fontWeight: 600, color: ELECTRIC, marginTop: 10 }}>Access CX Stack Framework →</div>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Failure Modes */}
      <section style={{ background: "#fff", padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <span style={{ color: RED, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>What Breaks</span>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Five failure modes unique to financial services CX.</h2>
            <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 32 }}>These are the operational patterns that generic CX platforms and generic advice consistently miss. Each one creates measurable cost, risk, or attrition when left unaddressed.</p>
          </FadeIn>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {failureModes.map((fm, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <div style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", borderLeft: `4px solid ${RED}` }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: NAVY, margin: "0 0 6px" }}>{fm.title}</h3>
                  <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{fm.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "80px 28px" }}>
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn>
            <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Technology Stack</span>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Seven orchestration layers, mapped for financial services.</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 600, marginBottom: 36 }}>Every layer manifests differently in financial services. Layer 3 (Policy & Guardrails) carries disproportionate weight because compliance failures create regulatory exposure that no amount of CSAT improvement can offset.</p>
          </FadeIn>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {stackLayers.map((sl, i) => (
              <FadeIn key={i} delay={i * 0.03}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "20px 22px", display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 16, color: LIGHT }}>{sl.layer}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 250 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>{sl.name}</h3>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 8px" }}>{sl.fsNote}</p>
                    <div style={{ fontSize: 11, color: LIGHT }}>Key vendors: {sl.vendors}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Benchmarks */}
      <section style={{ background: "#fff", padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Industry Benchmarks</span>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>How financial services compares.</h2>
            <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 32 }}>Financial services outperforms cross-industry on attrition but underperforms on abandon rate and containment — a direct result of compliance constraints and authentication friction.</p>
          </FadeIn>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${NAVY}` }}>
                  {["Metric", "FS Average", "Cross-Industry", "Top Quartile", "Why It Differs"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: NAVY, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {benchmarks.map((b, i) => {
                  const fsNum = parseFloat(b.fsAvg);
                  const ciNum = parseFloat(b.crossIndustry);
                  const better = b.metric === "Abandon Rate" || b.metric === "Attrition" ? fsNum < ciNum : fsNum > ciNum;
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 0 ? "#fff" : WARM }}>
                      <td style={{ padding: "12px 14px", fontWeight: 600, color: NAVY }}>{b.metric}</td>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: better ? GREEN : AMBER }}>{b.fsAvg}</td>
                      <td style={{ padding: "12px 14px", color: MUTED }}>{b.crossIndustry}</td>
                      <td style={{ padding: "12px 14px", color: GREEN, fontWeight: 600 }}>{b.topQuartile}</td>
                      <td style={{ padding: "12px 14px", color: SLATE, fontSize: 12 }}>{b.note}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", gap: 14, marginTop: 24, flexWrap: "wrap" }}>
              <a href="/tools/experience-scorecard" style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC }}>Score your metrics against these benchmarks →</a>
              <a href="/tco-calculator" style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Model your FS TCO →</a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* BPO Role */}
      <section style={{ background: WARM, padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <span style={{ color: AMBER, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>The BPO Question</span>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>How outsourcing fits in financial services CX.</h2>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }} className="sub-grid">
            <FadeIn delay={0.04}>
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: GREEN, margin: "0 0 8px" }}>Where BPOs add value</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {["After-hours and overflow coverage for transactional inquiries", "Collections and early-stage delinquency management", "Back-office processing (document verification, data entry)", "Seasonal scaling for open enrollment or tax season", "Multilingual support for diverse customer bases"].map((item, i) => (
                    <p key={i} style={{ fontSize: 13, color: SLATE, margin: 0, lineHeight: 1.5, paddingLeft: 12, borderLeft: `2px solid ${GREEN}30` }}>{item}</p>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.08}>
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: RED, margin: "0 0 8px" }}>Where BPOs create risk</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {["Fraud detection and identity verification require deep institutional knowledge", "Wealth management and advisory interactions demand licensed representatives", "Regulatory compliance varies by state and jurisdiction — BPO training gaps create exposure", "Complex dispute resolution requires system access and authority that BPOs often lack", "Data residency and privacy requirements may restrict offshore processing"].map((item, i) => (
                    <p key={i} style={{ fontSize: 13, color: SLATE, margin: 0, lineHeight: 1.5, paddingLeft: 12, borderLeft: `2px solid ${RED}30` }}>{item}</p>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Vendor recommendations */}
      <section style={{ background: "#fff", padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Vendor Intelligence</span>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>CCaaS platforms strongest for financial services.</h2>
            <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 32 }}>Based on our 28-vendor CCaaS assessment, these platforms score highest when weighted for compliance controls, security posture, integration depth with core banking systems, and regulated-environment deployment experience.</p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 14 }} className="sub-grid">
            {[
              { name: "Genesys", score: 94, why: "Deepest routing, strongest compliance controls, proven in Tier 1 banks globally. Enterprise-grade security and multi-region deployment.", href: "/vendors/genesys" },
              { name: "NICE CXone", score: 90, why: "Industry-leading WEM and QA for regulated environments. Strong analytics for compliance review and dispute resolution workflows.", href: "/vendors/nice-cxone" },
              { name: "Talkdesk", score: 78, why: "Purpose-built Financial Services Experience Cloud with pre-built banking workflows, PCI compliance, and vertical-specific AI.", href: "/vendors/talkdesk" },
              { name: "Five9", score: 82, why: "Strong Salesforce Financial Services Cloud integration. Proven in mid-market banking and lending operations.", href: "/vendors/five9" },
              { name: "Cisco", score: 78, why: "Enterprise security posture and networking heritage. Strong fit for banks with existing Cisco infrastructure investments.", href: "/vendors/cisco" },
              { name: "Amazon Connect", score: 77, why: "Pay-per-use pricing with strong AI capabilities. Best for banks with AWS cloud maturity and builder teams.", href: "/vendors/amazon-connect" },
            ].map((v, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <a href={v.href} style={{ display: "block", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 22px", transition: "all 0.2s", height: "100%" }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: 0 }}>{v.name}</h3>
                    <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: ELECTRIC }}>{v.score}</span>
                  </div>
                  <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{v.why}</p>
                </a>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.2}>
            <div style={{ textAlign: "center", marginTop: 24 }}>
              <a href="/vendors/ccaas" style={{ fontSize: 14, fontWeight: 600, color: ELECTRIC }}>See all 28 CCaaS vendors scored →</a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: WARM, padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.08) 0%, transparent 70%)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Evaluating CX technology for financial services?</h2>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>Compliance, identity verification, and core banking integration change which platforms are viable and which are risky. We can help you build a shortlist weighted for your specific sub-vertical — retail banking, insurance, lending, or wealth management.</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                  <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, boxShadow: `0 4px 18px rgba(0,136,221,0.25)` }}>Request a Financial Services Briefing</a>
                  <a href="/tools/cx-maturity" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>Take the CX Maturity Assessment →</a>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={28} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span>
        </div></div>
      </footer>
    </div>
  );
}
