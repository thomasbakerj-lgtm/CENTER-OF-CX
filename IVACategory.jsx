import { useState, useEffect } from "react";
import { IVA_CATEGORIES, getAllIVAVendors } from "./IVAData";
import { ScoresWithdrawn, Phase1Directory } from "./src/lib/Phase1Directory.jsx";
import { HOUSE, PILLARS, LINE, alpha } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";

const NAVY = HOUSE.mist; const DEEP = HOUSE.ink; const ELECTRIC = PILLARS.vendors.onDark; const LIGHT = PILLARS.vendors.onDark; const WARM = HOUSE.navy; const SLATE = HOUSE.body; const MUTED = HOUSE.muted; const BORDER = alpha(HOUSE.mist, LINE.hair); const GREEN = HOUSE.mist; const AMBER = HOUSE.mist; const RED = HOUSE.mist;
const WRAP = { maxWidth: 1120, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=28,light=true}){const a=HOUSE.mist,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

/* Content is visible from the first paint: no reveal on scroll, so a served page, a print and a quick scroll never show an empty band. */
function FadeIn({ children, className, style = {} }) { return <div className={className} style={style}>{children}</div>; }


export default function IVACategory() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", fn, { passive: true }); return () => window.removeEventListener("scroll", fn); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const allVendors = getAllIVAVendors();
  /* Integrity freeze (TB, S23): grouped by market category, listed by name; no score, tier or fit rating. */
  const groups = IVA_CATEGORIES.map((c) => ({ name: c.name, desc: c.desc, vendors: allVendors.filter((v) => v.category === c.id).map((v) => ({ slug: v.slug, name: v.name, line: v.modality })) })).filter((g) => g.vendors.length);

  const navLinks = [{ name: "Vendors", href: "/vendors" },{ name: "Tools", href: "/how-to-choose" },{ name: "Industries", href: "/industries" },{ name: "Research", href: "/research" },{ name: "The Human Premium", href: "/human-premium" }];

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh" }}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}}a{text-decoration:none;color:inherit}@media(max-width:860px){.nav-links{display:none!important}.mob-btn{display:flex!important}.pg{grid-template-columns:1fr!important}.cat-tabs{flex-wrap:wrap!important}}`}</style>

      

      {/* Hero */}
      <section style={{ background: HOUSE.navy, padding: "80px 28px 36px" }}>
        <div style={WRAP}>
          <FadeIn>
            <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2.2, textTransform: "uppercase" }}>Vendor Intelligence</span>
            <h1 style={{ fontFamily: FONT, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 400, color: HOUSE.mist, lineHeight: 1.1, margin: "8px 0 12px" }}>IVA + Conversational AI</h1>
            <p style={{ fontSize: 15, color: HOUSE.body, lineHeight: 1.65, maxWidth: 600 }}>
              {allVendors.length} vendors across {IVA_CATEGORIES.length} market categories: enterprise IVA, voice-native, helpdesk AI, CCaaS-native, agent assist, ecommerce, and CRM and workflow. Listed by category and name; scores are withdrawn until this category is researched under the current methodology.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
              <a href="/research/iva-buyer-guide" style={{ fontSize: 12, color: LIGHT, padding: "6px 14px", borderRadius: 5, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, background: HOUSE.navy }}>IVA Buyer Guide, Phase 1 edition (25 pages) ↓</a>
              <a href="/tools/ai-deflection" style={{ fontSize: 12, color: LIGHT, padding: "6px 14px", borderRadius: 5, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, background: HOUSE.navy }}>AI Deflection Reality Check →</a>
              <a href="/tools/ai-readiness" style={{ fontSize: 12, color: LIGHT, padding: "6px 14px", borderRadius: 5, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, background: HOUSE.navy }}>AI Readiness Diagnostic →</a>
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

      <ScoresWithdrawn category="IVA and conversational AI" />
      <Phase1Directory groups={groups} />

      {/* Tools */}
      <section style={{ background: WARM, padding: "28px 28px", borderTop: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 12 }}>Tools for IVA evaluation</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }} className="pg">
            {[
              { name: "AI Deflection Reality Check", desc: "Net savings after leakage, containment failure, and escalation", href: "/tools/ai-deflection" },
              { name: "AI Readiness Diagnostic", desc: "Data, workflows, governance, are you ready for AI?", href: "/tools/ai-readiness" },
              { name: "Vendor Match Engine", desc: "A starting list of CCaaS vendors for your requirements", href: "/tools/vendor-match" },
            ].map((t, i) => (
              <a key={i} href={t.href} style={{ display: "block", background: HOUSE.ink, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "14px 16px", borderLeft: `3px solid ${ELECTRIC}`, transition: "all 0.15s" }}
                onMouseOver={e => e.currentTarget.style.borderColor = ELECTRIC}
                onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.borderLeftColor = ELECTRIC; }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 3 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: MUTED }}>{t.desc}</div>
              </a>
            ))}
          </div>
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <span style={{ fontSize: 13, color: MUTED }}>Need expert guidance? <a href="/contact" style={{ color: ELECTRIC, fontWeight: 600 }}>Connect with a vetted CX consultant →</a></span>
          </div>
        </div>
      </section>

      
    </div>
  );
}
