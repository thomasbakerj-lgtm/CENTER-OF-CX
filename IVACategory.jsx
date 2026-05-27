import { useState, useEffect, useRef } from "react";
import { IVA_CATEGORIES, SCORING_MODEL, USE_CASES, ivaVendors, USE_CASE_SHORTLISTS, getIVAVendorsByCategory, getAllIVAVendors } from "./IVAData";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 1120, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=28,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

function useInView(t=0.1){const r=useRef(null);const[v,s]=useState(false);useEffect(()=>{const e=r.current;if(!e)return;const o=new IntersectionObserver(([i])=>{if(i.isIntersecting){s(true);o.unobserve(e)}},{threshold:t});o.observe(e);return()=>o.disconnect()},[]);return[r,v]}
function FadeIn({children,delay=0,className,style={}}){const[r,v]=useInView();return<div ref={r} className={className} style={{...style,opacity:v?1:0,transform:v?"translateY(0)":"translateY(16px)",transition:`opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`}}>{children}</div>}

const tierColor = (s) => s >= 85 ? GREEN : s >= 78 ? "#7CB342" : s >= 70 ? AMBER : s >= 60 ? "#DC6B00" : MUTED;
const tierLabel = (s) => s >= 85 ? "Leader" : s >= 78 ? "Strong Contender" : s >= 70 ? "Contender" : s >= 60 ? "Emerging" : "Watchlist";

export default function IVACategory() {
  const [activeCategory, setActiveCategory] = useState("enterprise");
  const [activeUseCase, setActiveUseCase] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", fn, { passive: true }); return () => window.removeEventListener("scroll", fn); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const allVendors = getAllIVAVendors();
  const catVendors = getIVAVendorsByCategory(activeCategory);
  const activeCat = IVA_CATEGORIES.find(c => c.id === activeCategory);

  const navLinks = [{ name: "Vendors", href: "/vendors" },{ name: "Tools", href: "/how-to-choose" },{ name: "Industries", href: "/industries" },{ name: "Research", href: "/research" },{ name: "The Human Premium", href: "/human-premium" }];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:860px){.nav-links{display:none!important}.mob-btn{display:flex!important}.pg{grid-template-columns:1fr!important}.cat-tabs{flex-wrap:wrap!important}}`}</style>

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: "rgba(6,19,37,0.97)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "10px 0" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13.5 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 26 }}>
            {navLinks.map(l => <a key={l.name} href={l.href} style={{ color: l.name === "Vendors" ? "#fff" : "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: l.name === "Vendors" ? 600 : 500, borderBottom: l.name === "Vendors" ? `2px solid ${ELECTRIC}` : "2px solid transparent", paddingBottom: 2 }} onMouseOver={e => e.target.style.color = "#fff"} onMouseOut={e => e.target.style.color = l.name === "Vendors" ? "#fff" : "rgba(255,255,255,0.6)"}>{l.name}</a>)}
            <a href="/subscribe" style={{ color: "#fff", fontSize: 12, fontWeight: 600, background: ELECTRIC, padding: "7px 16px", borderRadius: 5 }}>Subscribe</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY}, #0F2847)`, padding: "80px 28px 36px" }}>
        <div style={WRAP}>
          <FadeIn>
            <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2.2, textTransform: "uppercase" }}>Vendor Intelligence</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "8px 0 12px" }}>IVA + Conversational AI</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.65, maxWidth: 600 }}>
              {allVendors.length} vendors scored across 7 market categories. Enterprise IVA, voice-native, helpdesk AI, CCaaS-native, agent assist, ecommerce, and CRM/workflow. 100-point scoring model with 10 weighted dimensions.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
              <a href="/research/iva-buyer-guide" style={{ fontSize: 12, color: LIGHT, padding: "6px 14px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)" }}>IVA Buyer Guide (25 pages) ↓</a>
              <a href="/tools/ai-deflection" style={{ fontSize: 12, color: LIGHT, padding: "6px 14px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)" }}>AI Deflection Reality Check →</a>
              <a href="/tools/ai-readiness" style={{ fontSize: 12, color: LIGHT, padding: "6px 14px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)" }}>AI Readiness Diagnostic →</a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Operating Thesis */}
      <section style={{ background: `${ELECTRIC}06`, padding: "20px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ ...WRAP, maxWidth: 800 }}>
          <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, fontStyle: "italic", textAlign: "center" }}>
            The market is no longer chatbot vs IVA vs voicebot. The decision is now: which AI operating layer can resolve customer work, integrate with the enterprise stack, govern behavior, protect compliance, support agents, and improve cost per resolved interaction?
          </p>
        </div>
      </section>

      {/* Market Taxonomy */}
      <section style={{ background: "#fff", padding: "36px 28px 20px" }}>
        <div style={WRAP}>
          <FadeIn>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 16px" }}>Market Taxonomy</h2>
          </FadeIn>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 24 }} className="cat-tabs">
            {IVA_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => { setActiveCategory(cat.id); setActiveUseCase(null); }} style={{
                padding: "10px 16px", fontSize: 12, fontWeight: 600, borderRadius: 6, cursor: "pointer",
                border: `1px solid ${activeCategory === cat.id ? cat.color : BORDER}`,
                background: activeCategory === cat.id ? `${cat.color}08` : "#fff",
                color: activeCategory === cat.id ? cat.color : MUTED,
                transition: "all 0.15s",
              }}>
                {cat.name} <span style={{ opacity: 0.5 }}>({getIVAVendorsByCategory(cat.id).length})</span>
              </button>
            ))}
          </div>

          {/* Category description */}
          <div style={{ background: `${activeCat.color}06`, border: `1px solid ${activeCat.color}20`, borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{activeCat.desc}</p>
          </div>

          {/* Vendor directory for active category */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {catVendors.map((v, i) => (
              <div key={v.slug} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", border: `1px solid ${BORDER}`, borderRadius: 8, borderLeft: `4px solid ${tierColor(v.product)}`, transition: "all 0.15s" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = tierColor(v.product); e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.borderLeftColor = tierColor(v.product); e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", border: `2.5px solid ${tierColor(v.product)}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 15, color: tierColor(v.product) }}>{v.product}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{v.name}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, color: tierColor(v.product), padding: "2px 6px", borderRadius: 3, background: `${tierColor(v.product)}12` }}>{tierLabel(v.product)}</span>
                    {v.confidence >= 4.0 && <span style={{ fontSize: 9, fontWeight: 600, color: GREEN, padding: "2px 5px", borderRadius: 3, background: `${GREEN}08` }}>High confidence</span>}
                  </div>
                  <p style={{ fontSize: 12, color: MUTED, margin: "3px 0 0", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.summary}</p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                  <div style={{ fontSize: 10, color: MUTED }}>Ent: <span style={{ fontWeight: 600, color: NAVY }}>{v.enterprise}</span></div>
                  <div style={{ fontSize: 10, color: MUTED }}>BPO: <span style={{ fontWeight: 600, color: NAVY }}>{v.bpo}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Case Shortlists */}
      <section style={{ background: WARM, padding: "36px 28px", borderTop: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <FadeIn>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 6px" }}>Best-Fit by Use Case</h2>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 16 }}>There is no universal winner. The best vendor changes by operating model. Select a use case to see the shortlist.</p>
          </FadeIn>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 20 }}>
            {USE_CASES.map(uc => (
              <button key={uc.id} onClick={() => setActiveUseCase(activeUseCase === uc.id ? null : uc.id)} style={{
                padding: "6px 12px", fontSize: 11, fontWeight: 600, borderRadius: 5, cursor: "pointer",
                border: `1px solid ${activeUseCase === uc.id ? ELECTRIC : BORDER}`,
                background: activeUseCase === uc.id ? `${ELECTRIC}08` : "#fff",
                color: activeUseCase === uc.id ? ELECTRIC : MUTED,
              }}>
                {uc.name}
              </button>
            ))}
          </div>

          {activeUseCase && (
            <FadeIn>
              <div style={{ border: `1px solid ${ELECTRIC}20`, borderRadius: 10, overflow: "hidden", background: "#fff" }}>
                <div style={{ padding: "14px 18px", background: `${ELECTRIC}04`, borderBottom: `1px solid ${ELECTRIC}15` }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: 0 }}>{USE_CASES.find(u => u.id === activeUseCase)?.name}</h3>
                  <p style={{ fontSize: 12, color: MUTED, margin: "2px 0 0" }}>{USE_CASES.find(u => u.id === activeUseCase)?.desc}</p>
                </div>
                {(USE_CASE_SHORTLISTS[activeUseCase] || []).map((slug, i) => {
                  const v = ivaVendors[slug];
                  if (!v) return null;
                  const fit = v.useCaseFit?.[activeUseCase];
                  return (
                    <div key={slug} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 18px", borderBottom: i < (USE_CASE_SHORTLISTS[activeUseCase]?.length || 0) - 1 ? `1px solid ${BORDER}` : "none" }}>
                      <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 16, color: ELECTRIC, width: 24, textAlign: "center" }}>{i + 1}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: NAVY, flex: 1 }}>{v.name}</span>
                      {fit && <span style={{ fontSize: 10, fontWeight: 700, color: fit >= 5 ? GREEN : fit >= 4 ? AMBER : MUTED, padding: "2px 6px", borderRadius: 3, background: fit >= 5 ? `${GREEN}10` : fit >= 4 ? `${AMBER}10` : `${MUTED}10` }}>Fit: {fit}/5</span>}
                      <span style={{ fontSize: 11, color: MUTED }}>{v.product} pts</span>
                    </div>
                  );
                })}
              </div>
            </FadeIn>
          )}
        </div>
      </section>

      {/* Scoring Methodology */}
      <section style={{ background: "#fff", padding: "36px 28px", borderTop: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <FadeIn>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 6px" }}>Scoring Methodology</h2>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 16 }}>100-point product capability score across 10 weighted dimensions. Enterprise and BPO decision overlays scored separately.</p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
            {SCORING_MODEL.map((dim, i) => (
              <FadeIn key={i} delay={i * 0.03}>
                <div style={{ padding: "14px 16px", border: `1px solid ${BORDER}`, borderRadius: 8, background: WARM }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>{dim.name}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: ELECTRIC }}>{dim.weight}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: `${ELECTRIC}15` }}>
                    <div style={{ height: 4, borderRadius: 2, background: ELECTRIC, width: `${dim.weight * 5}%`, transition: "width 0.5s ease" }} />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: "12px 16px", background: `${AMBER}06`, border: `1px solid ${AMBER}20`, borderRadius: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: AMBER }}>Evidence rule: </span>
            <span style={{ fontSize: 12, color: SLATE }}>No vendor receives a confidence score of 5 without production metrics, POC results, or direct customer references. Vendor claims alone cap the score at 3. Demo-only evidence caps at 3.</span>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section style={{ background: WARM, padding: "28px 28px", borderTop: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 12 }}>Tools for IVA evaluation</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }} className="pg">
            {[
              { name: "AI Deflection Reality Check", desc: "Net savings after leakage, containment failure, and escalation", href: "/tools/ai-deflection" },
              { name: "AI Readiness Diagnostic", desc: "Data, workflows, governance — are you ready for AI?", href: "/tools/ai-readiness" },
              { name: "Vendor Match Engine", desc: "Ranked shortlist from 24 scored CCaaS vendors", href: "/tools/vendor-match" },
            ].map((t, i) => (
              <a key={i} href={t.href} style={{ display: "block", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "14px 16px", borderLeft: `3px solid ${ELECTRIC}`, transition: "all 0.15s" }}
                onMouseOver={e => e.currentTarget.style.borderColor = ELECTRIC}
                onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.borderLeftColor = ELECTRIC; }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 3 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: MUTED }}>{t.desc}</div>
              </a>
            ))}
          </div>
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <span style={{ fontSize: 13, color: MUTED }}>Need a human? <a href="/contact" style={{ color: ELECTRIC, fontWeight: 600 }}>Request a working session →</a></span>
          </div>
        </div>
      </section>

      <footer style={{ background: DEEP, padding: "32px 28px 20px" }}>
        <div style={{ ...WRAP, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={22} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 12 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>© 2026 The Center of CX. All rights reserved.</span>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="/privacy" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Privacy</a>
            <a href="/terms" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
