import { useState, useEffect } from "react";
import { CATEGORIES } from "./src/lib/verticals.js";
import CategoryTerms from "./src/lib/CategoryTerms.jsx";
import { categoryMeta, marketLayers, demoGates, brutalConclusions } from "./WEMData";
import { ScoresWithdrawn, Phase1Directory } from "./src/lib/Phase1Directory.jsx";
import { HOUSE, PILLARS, LINE, alpha } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";

const NAVY = HOUSE.mist; const DEEP = HOUSE.ink; const ELECTRIC = PILLARS.vendors.onDark; const LIGHT = PILLARS.vendors.onDark; const WARM = HOUSE.navy; const SLATE = HOUSE.body; const MUTED = HOUSE.muted; const BORDER = alpha(HOUSE.mist, LINE.hair); const GREEN = HOUSE.mist; const AMBER = HOUSE.mist; const RED = HOUSE.mist;
const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };
/* Content is visible from the first paint: no reveal on scroll, so a served page, a print and a quick scroll never show an empty band. */
function FadeIn({ children, style = {} }) { return <div style={style}>{children}</div>; }
function Nav(){const[scrolled,setScrolled]=useState(false);useEffect(()=>{const fn=()=>setScrolled(window.scrollY>50);window.addEventListener("scroll",fn,{passive:true});return()=>window.removeEventListener("scroll",fn)},[]);
const links=[{name:"Platforms & Tech",href:"/platforms-and-tech"},{name:"Tools",href:"/tools"},{name:"Research",href:"/research"},{name:"Vendors",href:"/vendors"},{name:"Advisory",href:"/advisory"}];
return(<><style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}@media(max-width:860px){.nav-links{display:none!important}.crit-grid{grid-template-columns:1fr!important}.lb-grid{grid-template-columns:1fr!important}.layer-grid{grid-template-columns:1fr!important}}`}</style>
</>)}

export default function WEMCategory() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  /* Integrity freeze (TB, S23): grouped by market layer, listed by name; no rank, score or leaderboard. */
  const groups = Object.values(marketLayers).map((l) => ({ name: l.name, desc: l.description, vendors: l.vendors.map((v) => ({ slug: v.slug, name: v.vendor, line: v.segment })) }));
  const total = groups.reduce((n, g) => n + g.vendors.length, 0);

  return (
    <div><Nav />
      {/* Hero */}
      <section style={{ background: HOUSE.navy, padding: "130px 28px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "none", backgroundSize: "64px 64px" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn><div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}><a href="/" style={{ color: HOUSE.body, fontSize: 13 }}>Home</a><span style={{ color: HOUSE.body, fontSize: 13 }}>/</span><a href="/vendors" style={{ color: HOUSE.body, fontSize: 13 }}>Vendors</a><span style={{ color: HOUSE.body, fontSize: 13 }}>/</span><span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>{CATEGORIES["wem-qm"].name}</span></div></FadeIn>
          <FadeIn delay={0.05}>
            <h1 style={{ fontFamily: FONT, fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 400, color: HOUSE.mist, lineHeight: 1.1, margin: "0 0 20px" }}>{CATEGORIES["wem-qm"].name}</h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: HOUSE.body, lineHeight: 1.7, maxWidth: 640 }}>{categoryMeta.executiveTake}</p>
            <CategoryTerms category="wem-qm" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", gap: 24, marginTop: 32, flexWrap: "wrap" }}>
              {[{ n: total, l: "Vendors listed" }, { n: groups.length, l: "Market layers" }].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}><div style={{ fontFamily: FONT, fontSize: 28, color: LIGHT }}>{s.n}</div><div style={{ fontSize: 11, color: HOUSE.body }}>{s.l}</div></div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <ScoresWithdrawn category={CATEGORIES["wem-qm"].name} />
      <Phase1Directory groups={groups} />

      {/* Demo Gates */}
      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn>
          <span style={{ color: RED, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Demo Gates</span>
          <h2 style={{ fontFamily: FONT, fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Five gates every vendor demo must pass.</h2>
          <p style={{ fontSize: 14, color: MUTED, maxWidth: 600, marginBottom: 24 }}>Polished demos hide weak exception handling, unexplainable AI, and hidden admin burden. These gates force vendors to prove operational readiness as well as feature existence.</p>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {demoGates.map((dg, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div style={{ background: HOUSE.ink, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 24px", borderLeft: `4px solid ${RED}` }}>
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
      <section style={{ background: HOUSE.ink, padding: "80px 28px" }}><div style={WRAP}>
        <FadeIn>
          <span style={{ color: NAVY, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Phase 1 assessment</span>
          <h2 style={{ fontFamily: FONT, fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 24px" }}>Seven observations from the Phase 1 review.</h2>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {brutalConclusions.map((bc, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "16px 0", borderBottom: i < brutalConclusions.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                <span style={{ fontFamily: FONT, fontSize: 20, color: ELECTRIC, flexShrink: 0, marginTop: -2 }}>{i + 1}</span>
                <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.6, margin: 0 }}>{bc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div></section>

      {/* CTA */}
      <section style={{ background: WARM, padding: "80px 28px" }}><div style={WRAP}><FadeIn>
        <div style={{ background: HOUSE.navy, borderRadius: 14, padding: "48px 36px", textAlign: "center" }}>
          <h2 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 400, color: HOUSE.mist, margin: "0 0 12px" }}>Evaluating WEM, WFM, or QA technology?</h2>
          <p style={{ fontSize: 15, color: HOUSE.body, lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>The right shortlist depends on whether you're buying a workforce control plane, a balanced WEM suite, or a QA modernization overlay. We can help you decide which layer to prioritize and which 3-5 vendors to evaluate.</p>
          <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
            <a href="/contact" style={{ background: HOUSE.action, color: HOUSE.paper, fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>Request a Workforce and Quality Management Briefing</a>
            <a href="/vendors/ccaas" style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, color: HOUSE.mist, fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>See {CATEGORIES.ccaas.name} →</a>
          </div>
        </div>
      </FadeIn></div></section>

      {/* Consolidation Note */}
      <section style={{ background: HOUSE.ink, padding: "40px 28px" }}><div style={{ ...WRAP, maxWidth: 700 }}>
        <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, textAlign: "center" }}>{categoryMeta.consolidationNote}: Last updated {categoryMeta.lastUpdated}.</p>
      </div></section>

      
    </div>
  );
}
