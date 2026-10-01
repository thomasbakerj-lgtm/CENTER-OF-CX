import { useState, useEffect } from "react";
import { getAllAnalytics, analyticsCats } from "./AnalyticsData";
import { ScoresWithdrawn, Phase1Directory } from "./src/lib/Phase1Directory.jsx";
import { HOUSE, PILLARS, LINE, alpha } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";

const NAVY = HOUSE.mist; const DEEP = HOUSE.ink; const ELECTRIC = PILLARS.vendors.onDark; const LIGHT = PILLARS.vendors.onDark; const WARM = HOUSE.navy; const SLATE = HOUSE.body; const MUTED = HOUSE.muted; const BORDER = alpha(HOUSE.mist, LINE.hair);
const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };

/* Content is visible from the first paint: no reveal on scroll, so a served page, a print and a quick scroll never show an empty band. */
function FadeIn({ children, style = {} }) { return <div style={style}>{children}</div>; }

function Nav(){const[scrolled,setScrolled]=useState(false);useEffect(()=>{const fn=()=>setScrolled(window.scrollY>50);window.addEventListener("scroll",fn,{passive:true});return()=>window.removeEventListener("scroll",fn)},[]);
const links=[{name:"Platforms & Tech",href:"/platforms-and-tech"},{name:"Tools",href:"/tools"},{name:"Research",href:"/research"},{name:"Vendors",href:"/vendors"},{name:"Advisory",href:"/advisory"}];
return(<><style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}@media(max-width:860px){.nav-links{display:none!important}.cat-grid{grid-template-columns:1fr 1fr!important}.method-grid{grid-template-columns:1fr!important}}`}</style>
</>)}

export default function AnalyticsCategory() {
  const all = getAllAnalytics();
  useEffect(() => { window.scrollTo(0, 0); }, []);

  /* Integrity freeze (TB, S23): grouped by platform category, listed by name; no score. */
  const groups = analyticsCats.map((c) => ({ name: c.name, desc: c.desc, vendors: all.filter((v) => v.cat === c.id).map((v) => ({ slug: v.slug, name: v.name, line: v.segment })) })).filter((g) => g.vendors.length);

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
              <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>Experience Analytics & VoC</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 style={{ fontFamily: FONT, fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 400, color: HOUSE.mist, lineHeight: 1.1, margin: "0 0 20px" }}>
              Advanced Analytics{" "}<span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Market Intelligence</span>
            </h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: HOUSE.body, lineHeight: 1.7, maxWidth: 620 }}>
              {all.length} analytics vendors across {analyticsCats.length} platform categories: interaction analytics, auto-QA, operational workflow, WFM alignment, product insight and data integration. Listed by category and name; scores are withdrawn until this category is researched under the current methodology.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", gap: 20, marginTop: 32, flexWrap: "wrap" }}>
              {[{ n: all.length, l: "Vendors listed" },{ n: analyticsCats.length, l: "Platform categories" }].map((s, i) => (
                <div key={i} style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, borderRadius: 8, padding: "14px 20px", textAlign: "center", minWidth: 100 }}>
                  <div style={{ fontFamily: FONT, fontSize: 24, color: LIGHT }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: HOUSE.body }}>{s.l}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <ScoresWithdrawn category="experience analytics" />
      <Phase1Directory groups={groups} />

      {/* CTA */}
      <section style={{ background: WARM, padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ background: HOUSE.navy, borderRadius: 14, padding: "48px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "none" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <h2 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 400, color: HOUSE.mist, margin: "0 0 12px" }}>Need help choosing the right analytics stack?</h2>
                <p style={{ fontSize: 15, color: HOUSE.body, lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>The analytics landscape spans CCaaS-embedded, AI-native, WEM-integrated, and infrastructure-layer options. The right choice depends on your operational maturity, integration landscape, and what you actually need the analytics to do.</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                  <a href="/contact" style={{ background: HOUSE.action, color: HOUSE.paper, fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, boxShadow: "none" }}>Request an Analytics Briefing</a>
                  <a href="/vendors/iva" style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, color: HOUSE.mist, fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>Compare IVA Platforms →</a>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      
    </div>
  );
}
