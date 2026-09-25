import { useState, useEffect, useRef } from "react";
import { categoryMeta, marketLayers, demoGates, brutalConclusions } from "./WEMData";
import { ScoresWithdrawn, Phase1Directory } from "./src/lib/Phase1Directory.jsx";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };
function useInView(t=.1){const ref=useRef(null);const[v,setV]=useState(false);useEffect(()=>{const el=ref.current;if(!el)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.unobserve(el)}},{threshold:t});o.observe(el);return()=>o.disconnect()},[]);return[ref,v]}
function FadeIn({children,delay=0,style={}}){const[ref,v]=useInView();return<div ref={ref} style={{...style,opacity:v?1:0,transform:v?"translateY(0)":"translateY(22px)",transition:`opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`}}>{children}</div>}
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}
function Nav(){const[scrolled,setScrolled]=useState(false);useEffect(()=>{const fn=()=>setScrolled(window.scrollY>50);window.addEventListener("scroll",fn,{passive:true});return()=>window.removeEventListener("scroll",fn)},[]);
const links=[{name:"Platforms & Tech",href:"/platforms-and-tech"},{name:"How to Choose",href:"/how-to-choose"},{name:"Research",href:"/research"},{name:"Vendors",href:"/vendors"},{name:"Advisory",href:"/advisory"}];
return(<><style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}@media(max-width:860px){.nav-links{display:none!important}.crit-grid{grid-template-columns:1fr!important}.lb-grid{grid-template-columns:1fr!important}.layer-grid{grid-template-columns:1fr!important}}`}</style>
<nav style={{position:"fixed",top:0,left:0,right:0,zIndex:1000,background:scrolled?"rgba(6,19,37,0.96)":"transparent",backdropFilter:scrolled?"blur(14px)":"none",borderBottom:scrolled?"1px solid rgba(255,255,255,0.05)":"none",transition:"all 0.35s",padding:scrolled?"12px 0":"20px 0"}}>
<div style={{...WRAP,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
<a href="/" style={{display:"flex",alignItems:"center",gap:10}}><LogoMark size={34}/><span style={{color:"#fff",fontWeight:600,fontSize:14.5,letterSpacing:0.4}}>THE CENTER OF <span style={{color:LIGHT}}>CX</span></span></a>
<div className="nav-links" style={{display:"flex",alignItems:"center",gap:28}}>
{links.map(l=><a key={l.name} href={l.href} style={{color:"rgba(255,255,255,0.7)",fontSize:13.5,fontWeight:500}}>{l.name}</a>)}
<a href="/contact" style={{color:"#fff",fontSize:13,fontWeight:600,background:ELECTRIC,padding:"9px 20px",borderRadius:6}}>Subscribe</a>
</div></div></nav></>)}

export default function WEMCategory() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  /* Integrity freeze (TB, S23): grouped by market layer, listed by name; no rank, score or leaderboard. */
  const groups = Object.values(marketLayers).map((l) => ({ name: l.name, desc: l.description, vendors: l.vendors.map((v) => ({ slug: v.slug, name: v.vendor, line: v.segment })) }));
  const total = groups.reduce((n, g) => n + g.vendors.length, 0);

  return (
    <div><Nav />
      {/* Hero */}
      <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "130px 28px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn><div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}><a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span><a href="/vendors" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Vendors</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span><span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>Workforce & Quality Management</span></div></FadeIn>
          <FadeIn delay={0.05}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>Workforce & Quality{" "}<span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Management</span></h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 640 }}>{categoryMeta.executiveTake}</p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", gap: 24, marginTop: 32, flexWrap: "wrap" }}>
              {[{ n: total, l: "Vendors listed" }, { n: groups.length, l: "Market layers" }].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}><div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: LIGHT }}>{s.n}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{s.l}</div></div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <ScoresWithdrawn category="workforce and quality management" />
      <Phase1Directory groups={groups} />

      {/* Demo Gates */}
      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn>
          <span style={{ color: RED, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Demo Gates</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Five gates every vendor demo must pass.</h2>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 24 }}>Polished demos hide weak exception handling, unexplainable AI, and hidden admin burden. These gates force vendors to prove operational readiness, not just feature existence.</p>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {demoGates.map((dg, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 24px", borderLeft: `4px solid ${RED}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: NAVY, margin: 0 }}>{dg.gate}</h3>
                  
                </div>
                <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.5, margin: "0 0 6px" }}>{dg.desc}</p>
                <p style={{ fontSize: 12, color: GREEN, fontWeight: 500, margin: "0 0 4px" }}>Pass: {dg.pass}</p>
                <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>Why: {dg.why}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div></section>

      {/* Brutal Conclusions */}
      <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn>
          <span style={{ color: NAVY, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>What's Actually True</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 24px" }}>Seven things the market won't tell you.</h2>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {brutalConclusions.map((bc, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "16px 0", borderBottom: i < brutalConclusions.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color: ELECTRIC, flexShrink: 0, marginTop: -2 }}>{i + 1}</span>
                <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.6, margin: 0 }}>{bc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div></section>

      {/* CTA */}
      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}><FadeIn>
        <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 36px", textAlign: "center" }}>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Evaluating WEM, WFM, or QA technology?</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>The right shortlist depends on whether you're buying a workforce control plane, a balanced WEM suite, or a QA modernization overlay. We can help you decide which layer to prioritize and which 3-5 vendors to evaluate.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>Request a WEM/QM Briefing</a>
            <a href="/vendors/ccaas" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>See CCaaS Vendor Scores →</a>
          </div>
        </div>
      </FadeIn></div></section>

      {/* Consolidation Note */}
      <section style={{ background: "#fff", padding: "40px 28px" }}><div style={{ ...WRAP, maxWidth: 700 }}>
        <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, textAlign: "center" }}>{categoryMeta.consolidationNote}: Last updated {categoryMeta.lastUpdated}.</p>
      </div></section>

      <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={28} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="/privacy" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Privacy</a>
            <a href="/terms" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Terms</a>
          </div></div></div></footer>
    </div>
  );
}
