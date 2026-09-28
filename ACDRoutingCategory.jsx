import { useState, useEffect } from "react";
import { getAllACD } from "./ACDRoutingData";
import { ScoresWithdrawn, Phase1Directory } from "./src/lib/Phase1Directory.jsx";
import { HOUSE, PILLARS, LINE, alpha } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";

const NAVY = HOUSE.mist;
const DEEP = HOUSE.ink;
const ELECTRIC = PILLARS.vendors.onDark;
const LIGHT = PILLARS.vendors.onDark;
const WARM = HOUSE.navy;
const SLATE = HOUSE.body;
const MUTED = HOUSE.muted;
const BORDER = alpha(HOUSE.mist, LINE.hair);
const GREEN = HOUSE.mist;
const AMBER = HOUSE.mist;
const RED = HOUSE.mist;
const PURPLE = HOUSE.mist;

const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };

/* Content is visible from the first paint: no reveal on scroll, so a served page, a print and a quick scroll never show an empty band. */
function FadeIn({ children, style = {} }) { return <div style={style}>{children}</div>; }
function LogoMark({ size = 34, light = true }) { const a = HOUSE.mist, x = light ? LIGHT : ELECTRIC; return <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>; }

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", fn, { passive: true }); return () => window.removeEventListener("scroll", fn); }, []);
  const links = [{ name: "Vendors", href: "/vendors" },{ name: "Tools", href: "/how-to-choose" },{ name: "Research", href: "/research" },{ name: "Vendors", href: "/vendors" },{ name: "The Human Premium", href: "/human-premium" }];
  return (<><style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}@media(max-width:860px){.nav-links{display:none!important}.bell-tiers{flex-direction:column!important}.quad-grid{grid-template-columns:1fr!important}.method-grid{grid-template-columns:1fr 1fr!important}}`}</style>
    </>);
}

export default function ACDRoutingCategory() {
  const all = getAllACD();
  /* Integrity freeze (TB, S23): grouped by segment, listed by name; no score, tier or quadrant. */
  const segs = [...new Set(all.map((v) => v.segment))].sort();
  const groups = segs.map((t) => ({ name: t, vendors: all.filter((v) => v.segment === t).map((v) => ({ slug: v.slug, name: v.name })) }));

  useEffect(() => { window.scrollTo(0, 0); }, []);


  return (
    <div>
      <Nav />

      {/* Hero */}
      <section style={{ background: HOUSE.navy, padding: "130px 28px 70px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "none", backgroundSize: "64px 64px" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
              <a href="/" style={{ color: HOUSE.body, fontSize: 13 }}>Home</a><span style={{ color: HOUSE.body, fontSize: 13 }}>/</span>
              <a href="/vendors" style={{ color: HOUSE.body, fontSize: 13 }}>Vendors</a><span style={{ color: HOUSE.body, fontSize: 13 }}>/</span>
              <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>ACD / Routing</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 style={{ fontFamily: FONT, fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 400, color: HOUSE.mist, lineHeight: 1.1, margin: "0 0 20px" }}>
              ACD & Routing{" "}<span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Market Intelligence</span>
            </h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: HOUSE.body, lineHeight: 1.7, maxWidth: 620 }}>
              {all.length} ACD and routing vendors: routing logic, data inputs, queue architecture, failover, observability, AI routing, integrations and global scale. Listed by segment and name; scores are withdrawn until this category is researched under the current methodology.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", gap: 20, marginTop: 32, flexWrap: "wrap" }}>
              {[{ n: all.length, l: "Vendors listed" },{ n: segs.length, l: "Segments" }].map((s, i) => (
                <div key={i} style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, borderRadius: 8, padding: "14px 20px", textAlign: "center", minWidth: 100 }}>
                  <div style={{ fontFamily: FONT, fontSize: 24, color: LIGHT }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: HOUSE.body }}>{s.l}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <ScoresWithdrawn category="ACD and routing" />
      <Phase1Directory groups={groups} />

      {/* CTA */}
      <section style={{ background: WARM, padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ background: HOUSE.navy, borderRadius: 14, padding: "48px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "none" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <h2 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 400, color: HOUSE.mist, margin: "0 0 12px" }}>Evaluating routing architecture for your contact center?</h2>
                <p style={{ fontSize: 15, color: HOUSE.body, lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>Routing is the control plane of your operation. The right architecture decision affects every interaction, every queue, every SLA. We can help you evaluate which vendors fit your complexity level.</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                  <a href="/contact" style={{ background: HOUSE.action, color: HOUSE.paper, fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, boxShadow: "none" }}>Request a Routing Briefing</a>
                  <a href="/vendors/ccaas" style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, color: HOUSE.mist, fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>Compare CCaaS Platforms →</a>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      
    </div>
  );
}
