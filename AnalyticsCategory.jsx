import { useState, useEffect, useRef } from "react";
import { getAllAnalytics, getAnalyticsByCategory, analyticsCats, analyticsDimensions } from "./AnalyticsData";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED";
const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };

function useInView(t=.1){const ref=useRef(null);const[v,setV]=useState(false);useEffect(()=>{const el=ref.current;if(!el)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){setV(true);o.unobserve(el)}},{threshold:t});o.observe(el);return()=>o.disconnect()},[]);return[ref,v]}
function FadeIn({children,delay=0,style={}}){const[ref,v]=useInView();return<div ref={ref} style={{...style,opacity:v?1:0,transform:v?"translateY(0)":"translateY(22px)",transition:`opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`}}>{children}</div>}
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

function Nav(){const[scrolled,setScrolled]=useState(false);useEffect(()=>{const fn=()=>setScrolled(window.scrollY>50);window.addEventListener("scroll",fn,{passive:true});return()=>window.removeEventListener("scroll",fn)},[]);
const links=[{name:"Platforms & Tech",href:"/platforms-and-tech"},{name:"How to Choose",href:"/how-to-choose"},{name:"Research",href:"/research"},{name:"Vendors",href:"/vendors"},{name:"Advisory",href:"/advisory"}];
return(<><style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}@media(max-width:860px){.nav-links{display:none!important}.cat-grid{grid-template-columns:1fr 1fr!important}.method-grid{grid-template-columns:1fr!important}}`}</style>
<nav style={{position:"fixed",top:0,left:0,right:0,zIndex:1000,background:scrolled?"rgba(6,19,37,0.96)":"transparent",backdropFilter:scrolled?"blur(14px)":"none",borderBottom:scrolled?"1px solid rgba(255,255,255,0.05)":"none",transition:"all 0.35s",padding:scrolled?"12px 0":"20px 0"}}>
<div style={{...WRAP,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
<a href="/" style={{display:"flex",alignItems:"center",gap:10}}><LogoMark size={34}/><span style={{color:"#fff",fontWeight:600,fontSize:14.5,letterSpacing:0.4}}>THE CENTER OF <span style={{color:LIGHT}}>CX</span></span></a>
<div className="nav-links" style={{display:"flex",alignItems:"center",gap:28}}>
{links.map(l=><a key={l.name} href={l.href} style={{color:l.name==="Vendors"?"#fff":"rgba(255,255,255,0.7)",fontSize:13.5,fontWeight:l.name==="Vendors"?600:500,borderBottom:l.name==="Vendors"?`2px solid ${ELECTRIC}`:"2px solid transparent",paddingBottom:2}}>{l.name}</a>)}
<a href="/contact" style={{color:"#fff",fontSize:13,fontWeight:600,background:ELECTRIC,padding:"9px 20px",borderRadius:6}}>Request Briefing</a>
</div></div></nav></>)}

export default function AnalyticsCategory() {
  const all = getAllAnalytics();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const scoreColor = (s, max=6) => s >= max ? "#10B981" : s >= max-1 ? ELECTRIC : s >= max-2 ? "#F59E0B" : "#EF4444";

  return (
    <div>
      <Nav />

      {/* Hero */}
      <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "130px 28px 70px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
              <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
              <a href="/vendors" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Vendors</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
              <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>Experience Analytics & VoC</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>
              Advanced Analytics{" "}<span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Market Intelligence</span>
            </h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 620 }}>
              {all.length} vendors across 6 platform categories, scored on 7 dimensions — intelligence depth, auto-QA, operational workflow, WFM alignment, product insights, integration/data, and scalability/governance. Total score out of 42.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", gap: 20, marginTop: 32, flexWrap: "wrap" }}>
              {[{ n: all.length, l: "Vendors scored" },{ n: "7", l: "Scoring dimensions" },{ n: "6", l: "Platform categories" },{ n: "42", l: "Max score" }].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "14px 20px", textAlign: "center", minWidth: 100 }}>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: LIGHT }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Category Overview */}
      <section style={{ background: WARM, padding: "80px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>6 Platform Categories</span>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: NAVY, margin: "8px 0 4px" }}>The analytics landscape is broader than most buyers realize.</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }} className="cat-grid">
              {analyticsCats.map((c, i) => {
                const vendors = getAnalyticsByCategory(c.id);
                return (
                  <FadeIn key={i} delay={i * 0.04}>
                    <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 18px", borderLeft: `4px solid ${c.color}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, margin: 0 }}>{c.name}</h3>
                        <span style={{ fontSize: 10, color: MUTED, background: WARM, padding: "2px 6px", borderRadius: 3 }}>{vendors.length} vendors</span>
                      </div>
                      <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.5, margin: "0 0 10px" }}>{c.desc}</p>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {vendors.slice(0, 4).map((v, j) => (
                          <span key={j} style={{ fontSize: 10, color: SLATE, background: WARM, padding: "1px 6px", borderRadius: 3, border: `1px solid ${BORDER}` }}>{v.name} <span style={{ fontWeight: 700, color: c.color }}>{v.score}</span></span>
                        ))}
                        {vendors.length > 4 && <span style={{ fontSize: 10, color: MUTED }}>+{vendors.length - 4} more</span>}
                      </div>
                    </div>
                  </FadeIn>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Full Directory by Category */}
      <section style={{ background: "#fff", padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Complete Directory</span>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 24px" }}>All {all.length} vendors, organized by platform category and ranked by total score.</h2>
          </FadeIn>

          {/* Dimension legend */}
          <FadeIn delay={0.03}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, padding: "10px 16px", background: `${ELECTRIC}06`, border: `1px solid ${ELECTRIC}15`, borderRadius: 8, marginBottom: 28, flexWrap: "wrap" }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: SLATE, marginRight: 6 }}>Dimensions (max 6 each):</span>
              {analyticsDimensions.map((d, i) => (
                <span key={i} style={{ fontSize: 10, color: MUTED }}>
                  <span style={{ fontWeight: 700, color: NAVY }}>{d.abbr}</span>={d.name}{i < analyticsDimensions.length - 1 ? <span style={{ color: BORDER, margin: "0 3px" }}>·</span> : ""}
                </span>
              ))}
            </div>
          </FadeIn>

          {analyticsCats.map((cat, ci) => {
            const vendors = getAnalyticsByCategory(cat.id);
            return (
              <FadeIn key={ci} delay={ci * 0.04}>
                <div style={{ marginBottom: 40 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 4, height: 22, borderRadius: 2, background: cat.color }} />
                    <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, fontWeight: 400, color: NAVY, margin: 0 }}>{cat.id}: {cat.name}</h3>
                    <span style={{ fontSize: 10, color: MUTED, background: WARM, padding: "2px 7px", borderRadius: 4, border: `1px solid ${BORDER}` }}>{vendors.length} vendors</span>
                  </div>
                  <p style={{ fontSize: 12, color: MUTED, marginBottom: 14, maxWidth: 680 }}>{cat.desc}</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {vendors.map((v, vi) => (
                      <div key={vi} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 8, transition: "border-color 0.2s" }}
                        onMouseOver={e => e.currentTarget.style.borderColor = cat.color}
                        onMouseOut={e => e.currentTarget.style.borderColor = BORDER}>

                        <div style={{ width: 40, height: 40, borderRadius: "50%", border: `2px solid ${cat.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 14, color: cat.color }}>{v.score}</span>
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{v.name}</span>
                            <span style={{ fontSize: 10, color: MUTED, background: "#fff", padding: "1px 6px", borderRadius: 3, border: `1px solid ${BORDER}` }}>{v.segment}</span>
                          </div>
                          <p style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.4, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.summary}</p>
                        </div>

                        <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                          {[
                            { l: "INT", s: v.intel }, { l: "AQA", s: v.autoQA }, { l: "OPS", s: v.opsWF },
                            { l: "WFM", s: v.wfm }, { l: "PRD", s: v.prodIns }, { l: "IDT", s: v.intData }, { l: "SGV", s: v.scaleGov },
                          ].map((d, di) => (
                            <div key={di} style={{ textAlign: "center", minWidth: 22 }}>
                              <div style={{ fontSize: 7, color: MUTED, letterSpacing: 0.3 }}>{d.l}</div>
                              <div style={{ fontSize: 11, fontWeight: 700, color: scoreColor(d.s) }}>{d.s}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* Scoring Methodology */}
      <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "80px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "30%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.04) 0%, transparent 70%)" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Scoring Methodology</span>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: "#fff", margin: "8px 0 8px" }}>7 dimensions. Scale of 2–6. Total out of 42.</h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 560, margin: "0 auto" }}>Each vendor is evaluated on a qualitative scale (High / Med-High / Med / Low-Med / Low) mapped to numeric scores (6 / 5 / 4 / 3 / 2). Vendors are organized by platform category for apples-to-apples comparison within each segment, then ranked across the full market.</p>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }} className="method-grid">
            {analyticsDimensions.map((d, i) => (
              <FadeIn key={i} delay={i * 0.04}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "18px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: LIGHT }}>{d.abbr}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Max: 6</span>
                  </div>
                  <h4 style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>{d.name}</h4>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.4, margin: 0 }}>{d.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: WARM, padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.08) 0%, transparent 70%)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Need help choosing the right analytics stack?</h2>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>The analytics landscape spans CCaaS-embedded, AI-native, WEM-integrated, and infrastructure-layer options. The right choice depends on your operational maturity, integration landscape, and what you actually need the analytics to do.</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                  <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, boxShadow: `0 4px 18px rgba(0,136,221,0.25)` }}>Request an Analytics Briefing</a>
                  <a href="/vendors/iva" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>Compare IVA Platforms →</a>
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
