import { useState, useEffect, useRef } from "react";
import { getAllIVA, ivaTierConfig, ivaScoringDimensions } from "./IVAData";

const NAVY = "#0B1D3A";
const DEEP = "#061325";
const ELECTRIC = "#0088DD";
const LIGHT = "#00AAFF";
const WARM = "#F8FAFB";
const SLATE = "#3A4F6A";
const MUTED = "#6B7F99";
const BORDER = "#D8E3ED";
const GREEN = "#10B981";
const AMBER = "#F59E0B";
const RED = "#EF4444";

const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };

function useInView(t = 0.1) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.unobserve(el); } }, { threshold: t }); o.observe(el); return () => o.disconnect(); }, []); return [ref, v];
}
function FadeIn({ children, delay = 0, style = {} }) { const [ref, v] = useInView(); return <div ref={ref} style={{ ...style, opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(22px)", transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s` }}>{children}</div>; }

function LogoMark({ size = 34, light = true }) {
  const a = light ? "#fff" : NAVY, x = light ? LIGHT : ELECTRIC;
  return <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>;
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", fn, { passive: true }); return () => window.removeEventListener("scroll", fn); }, []);
  const links = [{ name: "Platforms & Tech", href: "/platforms-and-tech" },{ name: "How to Choose", href: "/how-to-choose" },{ name: "Research", href: "/research" },{ name: "Vendors", href: "/vendors" },{ name: "Advisory", href: "/advisory" }];
  return (<><style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}@media(max-width:860px){.nav-links{display:none!important}.bell-tiers{flex-direction:column!important}.method-grid{grid-template-columns:1fr!important}.dim-grid{grid-template-columns:1fr 1fr!important}}`}</style>
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: scrolled ? "rgba(6,19,37,0.96)" : "transparent", backdropFilter: scrolled ? "blur(14px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "all 0.35s", padding: scrolled ? "12px 0" : "20px 0" }}>
      <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={34} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14.5, letterSpacing: 0.4 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {links.map(l => <a key={l.name} href={l.href} style={{ color: l.name === "Vendors" ? "#fff" : "rgba(255,255,255,0.7)", fontSize: 13.5, fontWeight: l.name === "Vendors" ? 600 : 500, borderBottom: l.name === "Vendors" ? `2px solid ${ELECTRIC}` : "2px solid transparent", paddingBottom: 2 }}>{l.name}</a>)}
          <a href="/contact" style={{ color: "#fff", fontSize: 13, fontWeight: 600, background: ELECTRIC, padding: "9px 20px", borderRadius: 6 }}>Request Briefing</a>
        </div>
      </div>
    </nav></>);
}

export default function IVACategory() {
  const all = getAllIVA();
  const tiers = ["Leader","Advancer","Developer","Emerging"].map(t => ({ name: t, vendors: all.filter(v => v.tier === t), ...ivaTierConfig[t] }));

  useEffect(() => { window.scrollTo(0, 0); }, []);

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
              <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>Intelligent Virtual Agents (IVA)</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>
              IVA Market{" "}<span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Intelligence</span>
            </h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 600 }}>
              {all.length} vendors scored across four weighted dimensions — Conversational Autonomy, Multi-Channel Coverage, Orchestration Depth, and Analytics. Spanning standalone enterprise IVAs, CCaaS-native bots, developer frameworks, and adjacent AI platforms.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", gap: 20, marginTop: 32, flexWrap: "wrap" }}>
              {[{ n: all.length, l: "Vendors scored" },{ n: "4", l: "Scoring dimensions" },{ n: "4", l: "Market segments" },{ n: "4", l: "Maturity tiers" }].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "14px 20px", textAlign: "center", minWidth: 100 }}>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: LIGHT }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Bell Curve */}
      <section style={{ background: WARM, padding: "64px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Bell Curve Distribution</span>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: NAVY, margin: "8px 0 4px" }}>Where the IVA market clusters.</h2>
              <p style={{ fontSize: 13, color: MUTED, maxWidth: 500, margin: "0 auto" }}>40–50% of the Emerging tier will merge or OEM by 2027. The Leaders tier contains the platforms that can anchor enterprise-scale conversational AI programs.</p>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }} className="bell-tiers">
              {tiers.map((t, i) => {
                const heights = [180, 240, 260, 200];
                return (
                  <div key={i} style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ background: `${t.color}08`, border: `1px solid ${t.color}20`, borderRadius: "10px 10px 0 0", padding: "14px 12px", minHeight: heights[i], display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: t.color, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
                        {t.name} <span style={{ fontWeight: 400, opacity: 0.7 }}>({t.range})</span>
                      </div>
                      {t.vendors.map((v, j) => (
                        <div key={j} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3px 0", fontSize: 11.5, color: SLATE, borderBottom: j < t.vendors.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                          <span style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "75%" }}>{v.name}</span>
                          <span style={{ fontWeight: 700, color: t.color, fontSize: 11 }}>{v.score}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ background: t.color, color: "#fff", textAlign: "center", padding: "5px", borderRadius: "0 0 6px 6px", fontSize: 11, fontWeight: 700 }}>
                      {t.vendors.length} vendor{t.vendors.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Full Directory */}
      <section style={{ background: "#fff", padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Complete Directory</span>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 40px" }}>All {all.length} IVA vendors, ranked by weighted composite score.</h2>
          </FadeIn>

          {tiers.map((t, ti) => (
            <FadeIn key={ti} delay={ti * 0.05}>
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 4, height: 24, borderRadius: 2, background: t.color }} />
                  <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: 0 }}>{t.name}s</h3>
                  <span style={{ fontSize: 11, color: MUTED, background: WARM, padding: "2px 8px", borderRadius: 4 }}>{t.range}</span>
                </div>
                <p style={{ fontSize: 13, color: MUTED, marginBottom: 16, maxWidth: 700 }}>{t.desc}</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {t.vendors.map((v, vi) => (
                    <div key={vi} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, transition: "all 0.2s", cursor: "default" }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = t.color; e.currentTarget.style.boxShadow = `0 4px 16px ${t.color}10`; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}>

                      <div style={{ width: 44, height: 44, borderRadius: "50%", border: `2.5px solid ${t.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 16, color: t.color }}>{v.score}</span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{v.name}</span>
                          <span style={{ fontSize: 10, color: MUTED, background: "#fff", padding: "1px 6px", borderRadius: 4, border: `1px solid ${BORDER}` }}>{v.type}</span>
                        </div>
                        <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.4, margin: "3px 0 0", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{v.summary}</p>
                      </div>

                      {/* Dimension scores */}
                      <div style={{ display: "flex", gap: 6, flexShrink: 0 }} className="dim-grid">
                        {[{ l: "AUT", v: v.autonomy },{ l: "MCH", v: v.multiChannel },{ l: "ORC", v: v.orchestration },{ l: "ANL", v: v.analytics }].map((d, di) => (
                          <div key={di} style={{ textAlign: "center", minWidth: 32 }}>
                            <div style={{ fontSize: 9, color: MUTED, letterSpacing: 0.5 }}>{d.l}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: d.v >= 5 ? GREEN : d.v >= 4 ? ELECTRIC : d.v >= 3 ? AMBER : RED }}>{d.v}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Scoring Methodology */}
      <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "80px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "30%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.04) 0%, transparent 70%)" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Scoring Methodology</span>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, fontWeight: 400, color: "#fff", margin: "8px 0 8px" }}>4 dimensions. Equal weight. Score out of 100.</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", maxWidth: 560, margin: "0 auto" }}>Each vendor is scored 1–5 on four dimensions. Each dimension carries 25% weight. The total is normalized to a 100-point composite. Vendors are then placed into maturity tiers based on their composite score.</p>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }} className="method-grid">
            {ivaScoringDimensions.map((d, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "24px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>{d.name}</h4>
                    <span style={{ fontSize: 12, fontWeight: 700, color: LIGHT, background: "rgba(0,170,255,0.1)", padding: "2px 8px", borderRadius: 4 }}>{d.weight}</span>
                  </div>
                  <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, margin: 0 }}>{d.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <div style={{ marginTop: 32, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", maxWidth: 560, margin: "0 auto" }}>
                Vendors are classified across four segments: Standalone Enterprise IVA, CCaaS-Native IVA, Developer Framework, and Adjacent AI Platform. Scoring is conducted within-segment first, then normalized for cross-segment comparison.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Market segments */}
      <section style={{ background: WARM, padding: "80px 28px", borderTop: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <FadeIn>
            <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Four Market Segments</span>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: NAVY, margin: "0 0 32px" }}>The IVA market is broader than most buyers realize.</h2>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {[
              { name: "Standalone Enterprise IVA", count: all.filter(v => v.type.includes("Standalone")).length, desc: "Purpose-built IVA platforms that operate independently of any specific CCaaS vendor. Deepest orchestration and autonomy capabilities." },
              { name: "CCaaS-Native IVA", count: all.filter(v => v.type.includes("CCaaS")).length, desc: "IVA capabilities built into or tightly integrated with CCaaS platforms like Genesys, NICE, Five9. Strongest when you want unified self-service within your existing platform." },
              { name: "Developer Framework", count: all.filter(v => v.type.includes("Open") || v.type.includes("Conversational Platform")).length, desc: "Open-source or cloud-native conversational AI platforms (Rasa, Dialogflow, Lex, Botpress). Maximum flexibility, highest engineering investment." },
              { name: "Adjacent AI Platform", count: all.filter(v => v.type.includes("AI Platform") || v.type.includes("Agent Assist") || v.type.includes("Intelligent")).length, desc: "AI platforms that influence IVA decisions — agent assist, workflow automation, conversation intelligence. Evaluated alongside core IVA, not as replacement." },
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 600, color: NAVY, margin: 0 }}>{s.name}</h4>
                    <span style={{ fontSize: 11, color: MUTED, background: WARM, padding: "2px 8px", borderRadius: 4 }}>{s.count} vendors</span>
                  </div>
                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.55, margin: 0 }}>{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "#fff", padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.08) 0%, transparent 70%)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Evaluating IVA platforms for your organization?</h2>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>
                  Tell us your use cases, volume, and constraints. We'll deliver a scored shortlist with honest assessments — drawn from this data and our operational frameworks.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                  <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, boxShadow: `0 4px 18px rgba(0,136,221,0.25)` }}>Request an IVA Briefing</a>
                  <a href="/vendors/ccaas" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>Compare CCaaS Platforms →</a>
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
