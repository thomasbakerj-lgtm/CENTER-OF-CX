import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CATEGORIES, VERTICALS } from "./src/lib/verticals";
import CCaaSIndustry from "./CCaaSIndustry.jsx";
import { HOUSE, PILLARS, LINE, alpha } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";

const NAVY = HOUSE.mist; const DEEP = HOUSE.ink; const ELECTRIC = PILLARS.vendors.onDark; const LIGHT = PILLARS.vendors.onDark; const WARM = HOUSE.navy; const SLATE = HOUSE.body; const MUTED = HOUSE.muted; const BORDER = alpha(HOUSE.mist, LINE.hair); const GREEN = HOUSE.mist; const AMBER = HOUSE.mist; const RED = HOUSE.mist;
const WRAP = { maxWidth: 1080, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=28,light=true}){const a=HOUSE.mist,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

export default function CategoryVerticalPage() {
  const { categorySlug, verticalSlug } = useParams();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", fn, { passive: true }); return () => window.removeEventListener("scroll", fn); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [categorySlug, verticalSlug]);

  const cat = CATEGORIES[categorySlug];
  const vert = VERTICALS[verticalSlug];
  if (!cat || !vert) return <div style={{ padding: 100, textAlign: "center" }}>Category or vertical not found. <a href="/vendors" style={{ color: ELECTRIC }}>Browse all vendors →</a></div>;
  /* CCaaS by industry is rebuilt from the research (Phase 7 part 4); the other categories keep this page. */
  if (categorySlug === "ccaas") return <CCaaSIndustry verticalSlug={verticalSlug} />;

  // For non-CCaaS categories, show leader slugs from vertical config
  const leaderSlugs = vert.ccaasLeaders || [];

  const navLinks = [
    { name: "Vendors", href: "/vendors" },
    { name: "Tools", href: "/how-to-choose" },
    { name: "Industries", href: "/industries" },
    { name: "Research", href: "/research" },
    { name: "The Human Premium", href: "/human-premium" },
  ];

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh" }}>
      <style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}}a{text-decoration:none;color:inherit}@media(max-width:860px){.nav-links{display:none!important}.mob-btn{display:flex!important}.pg{grid-template-columns:1fr!important}}`}</style>

      

      {/* Hero */}
      <section style={{ background: HOUSE.navy, padding: "80px 28px 36px" }}>
        <div style={WRAP}>
          <div style={{ display: "flex", gap: 6, marginBottom: 16, fontSize: 13 }}>
            <a href="/vendors" style={{ color: HOUSE.body }}>Vendors</a>
            <span style={{ color: HOUSE.body }}>/</span>
            <a href={cat.page} style={{ color: HOUSE.body }}>{cat.name}</a>
            <span style={{ color: HOUSE.body }}>/</span>
            <span style={{ color: LIGHT, fontWeight: 600 }}>{vert.name}</span>
          </div>
          <h1 style={{ fontFamily: FONT, fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 400, color: HOUSE.mist, lineHeight: 1.12, margin: "0 0 12px" }}>
            {cat.name} for{" "}
            <span style={{ color: LIGHT }}>{vert.name}</span>
          </h1>
          <p style={{ fontSize: 15, color: HOUSE.body, lineHeight: 1.6, maxWidth: 600 }}>
            {`${cat.name} vendors evaluated for ${vert.name} requirements.`} Compliance, integration, and operational considerations specific to this vertical.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <a href={cat.page} style={{ fontSize: 12, color: LIGHT, padding: "5px 12px", borderRadius: 4, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}` }}>All {cat.name} vendors →</a>
            <a href={vert.industryPage} style={{ fontSize: 12, color: LIGHT, padding: "5px 12px", borderRadius: 4, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}` }}>{vert.name} industry page →</a>
            <a href="/tools/vendor-match" style={{ fontSize: 12, color: LIGHT, padding: "5px 12px", borderRadius: 4, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}` }}>Vendor Match Engine →</a>
          </div>
        </div>
      </section>

      {/* Vertical context */}
      <section style={{ background: WARM, padding: "28px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="pg">
            <div>
              <h2 style={{ fontSize: 13, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 }}>Why {vert.name} is different</h2>
              <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6 }}>{vert.considerations}</p>
            </div>
            <div>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Compliance requirements</h3>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
                {vert.compliance.map((c, i) => <span key={i} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: `${RED}08`, color: RED, fontWeight: 500 }}>{c}</span>)}
              </div>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: NAVY, marginBottom: 6 }}>Key systems to integrate</h3>
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
                {vert.keySystems.map((s, i) => <span key={i} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 4, background: `${ELECTRIC}08`, color: ELECTRIC }}>{s}</span>)}
              </div>
              <div style={{ fontSize: 11, color: MUTED }}>Sub-verticals: {vert.subVerts}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools */}
      <section style={{ background: WARM, padding: "28px 28px", borderTop: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 12 }}>Tools for {vert.name} {cat.name} evaluation</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }} className="pg">
            {[
              { name: "Vendor Match Engine", desc: "Get a shortlist filtered for " + vert.name, href: "/tools/vendor-match" },
              { name: "Platform Decision", desc: "The renewal gate for your current platform", href: "/tools/platform-decision" },
              { name: "Contract Risk Scanner", desc: "Analyze terms before signing", href: "/tools/contract-risk" },
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

      {/* Other verticals for this category */}
      <section style={{ background: HOUSE.ink, padding: "28px 28px", borderTop: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 10 }}>{cat.name} for other industries</h3>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Object.entries(VERTICALS).filter(([k]) => k !== verticalSlug).map(([k, v]) => (
              <a key={k} href={`/vendors/${categorySlug}/${k}`} style={{ fontSize: 12, color: SLATE, padding: "6px 14px", borderRadius: 5, border: `1px solid ${BORDER}`, background: WARM, transition: "all 0.15s" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.color = ELECTRIC; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = SLATE; }}>
                {v.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Other categories for this vertical */}
      <section style={{ background: WARM, padding: "28px 28px", borderTop: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 10 }}>{vert.name} across all technology categories</h3>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Object.entries(CATEGORIES).filter(([k]) => k !== categorySlug).map(([k, c]) => (
              <a key={k} href={`/vendors/${k}/${verticalSlug}`} style={{ fontSize: 12, color: SLATE, padding: "6px 14px", borderRadius: 5, border: `1px solid ${BORDER}`, background: HOUSE.ink, transition: "all 0.15s" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.color = ELECTRIC; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = SLATE; }}>
                {c.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      
    </div>
  );
}
