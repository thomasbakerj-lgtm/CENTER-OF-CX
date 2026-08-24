import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getVendorsByCategory, getVendor } from "./VendorData";
import { CATEGORIES, VERTICALS, CCAAS_VERTICAL_FIT } from "./src/lib/verticals";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 1080, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=28,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

export default function CategoryVerticalPage() {
  const { categorySlug, verticalSlug } = useParams();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", fn, { passive: true }); return () => window.removeEventListener("scroll", fn); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [categorySlug, verticalSlug]);

  const cat = CATEGORIES[categorySlug];
  const vert = VERTICALS[verticalSlug];
  if (!cat || !vert) return <div style={{ padding: 100, textAlign: "center" }}>Category or vertical not found. <a href="/vendors" style={{ color: ELECTRIC }}>Browse all vendors →</a></div>;

  // Get vendors for this category
  const allCatVendors = categorySlug === "ccaas" ? getVendorsByCategory("ccaas") : [];
  const fitScores = CCAAS_VERTICAL_FIT;

  // Rank vendors by vertical fit for CCaaS
  const rankedVendors = categorySlug === "ccaas"
    ? allCatVendors
        .map(v => ({ ...v, vertFit: fitScores[v.slug]?.[verticalSlug] || 2 }))
        .sort((a, b) => b.vertFit - a.vertFit || b.score - a.score)
    : [];

  // Split into recommended vs other
  const recommended = rankedVendors.filter(v => v.vertFit >= 4);
  const qualified = rankedVendors.filter(v => v.vertFit === 3);
  const limited = rankedVendors.filter(v => v.vertFit < 3);

  // For non-CCaaS categories, show leader slugs from vertical config
  const leaderSlugs = vert.ccaasLeaders || [];

  const navLinks = [
    { name: "Vendors", href: "/vendors" },
    { name: "Tools", href: "/how-to-choose" },
    { name: "Industries", href: "/industries" },
    { name: "Research", href: "/research" },
    { name: "The Human Premium", href: "/human-premium" },
  ];

  const fitColor = (f) => f >= 5 ? GREEN : f >= 4 ? "#7CB342" : f === 3 ? AMBER : RED;
  const fitLabel = (f) => f >= 5 ? "Strong Fit" : f >= 4 ? "Good Fit" : f === 3 ? "Conditional" : "Limited";

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:860px){.nav-links{display:none!important}.mob-btn{display:flex!important}.pg{grid-template-columns:1fr!important}}`}</style>

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: "rgba(6,19,37,0.97)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "10px 0" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13.5 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 26 }}>
            {navLinks.map(l => <a key={l.name} href={l.href} style={{ color: l.name === "Vendors" ? "#fff" : "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: l.name === "Vendors" ? 600 : 500, borderBottom: l.name === "Vendors" ? `2px solid ${ELECTRIC}` : "2px solid transparent", paddingBottom: 2 }}>{l.name}</a>)}
            <a href="/subscribe" style={{ color: "#fff", fontSize: 12, fontWeight: 600, background: ELECTRIC, padding: "7px 16px", borderRadius: 5 }}>Subscribe</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "80px 28px 36px" }}>
        <div style={WRAP}>
          <div style={{ display: "flex", gap: 6, marginBottom: 16, fontSize: 13 }}>
            <a href="/vendors" style={{ color: "rgba(255,255,255,0.4)" }}>Vendors</a>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
            <a href={cat.page} style={{ color: "rgba(255,255,255,0.4)" }}>{cat.name}</a>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>/</span>
            <span style={{ color: LIGHT, fontWeight: 600 }}>{vert.name}</span>
          </div>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 400, color: "#fff", lineHeight: 1.12, margin: "0 0 12px" }}>
            {cat.name} for{" "}
            <span style={{ color: LIGHT }}>{vert.name}</span>
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, maxWidth: 600 }}>
            {categorySlug === "ccaas" ? `${rankedVendors.length} vendors scored for ${vert.name} vertical fit.` : `${cat.name} vendors evaluated for ${vert.name} requirements.`} Compliance, integration, and operational considerations specific to this vertical.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <a href={cat.page} style={{ fontSize: 12, color: LIGHT, padding: "5px 12px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.12)" }}>All {cat.name} vendors →</a>
            <a href={vert.industryPage} style={{ fontSize: 12, color: LIGHT, padding: "5px 12px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.12)" }}>{vert.name} industry page →</a>
            <a href="/tools/vendor-match" style={{ fontSize: 12, color: LIGHT, padding: "5px 12px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.12)" }}>Vendor Match Engine →</a>
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

      {/* Vendor rankings for CCaaS */}
      {categorySlug === "ccaas" && (
        <section style={{ background: "#fff", padding: "32px 28px" }}>
          <div style={WRAP}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 6px" }}>Vendor Rankings for {vert.name}</h2>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>Ranked by vertical fit score (1-5) and weighted composite. Fit scores reflect compliance capabilities, vertical references, and integration depth.</p>

            {/* Category insight */}
            <div style={{ background: `${ELECTRIC}04`, border: `1px solid ${ELECTRIC}15`, borderRadius: 10, padding: "16px 18px", marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>Category Evaluation Context</div>
              <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0 }}>{vert.ccaasContext}</p>
            </div>

            {/* Recommended */}
            {recommended.length > 0 && (<>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: GREEN, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>Recommended for {vert.name} ({recommended.length})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                {recommended.map((v, i) => (
                  <a key={v.slug} href={`/vendors/${v.slug}`} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 18px", background: `${GREEN}04`, border: `1px solid ${GREEN}20`, borderRadius: 10, borderLeft: `4px solid ${fitColor(v.vertFit)}`, transition: "all 0.15s" }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = GREEN; e.currentTarget.style.boxShadow = "0 4px 16px rgba(16,185,129,0.08)"; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = `${GREEN}20`; e.currentTarget.style.boxShadow = "none"; }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", border: `2.5px solid ${fitColor(v.vertFit)}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 16, color: fitColor(v.vertFit) }}>{v.vertFit}/5</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: NAVY }}>{v.name}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: GREEN, padding: "2px 6px", borderRadius: 3, background: `${GREEN}12` }}>{fitLabel(v.vertFit)}</span>
                        <span style={{ fontSize: 11, color: MUTED }}>{v.tier} · Score {v.score}</span>
                      </div>
                      <p style={{ fontSize: 12, color: MUTED, margin: "4px 0 0", lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.bestFit?.substring(0, 140)}</p>
                    </div>
                    <span style={{ color: ELECTRIC, fontSize: 13, flexShrink: 0 }}>View profile →</span>
                  </a>
                ))}
              </div>
            </>)}

            {/* Qualified */}
            {qualified.length > 0 && (<>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: AMBER, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>Conditionally Qualified ({qualified.length})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 24 }}>
                {qualified.map(v => (
                  <a key={v.slug} href={`/vendors/${v.slug}`} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 8, transition: "border-color 0.15s" }}
                    onMouseOver={e => e.currentTarget.style.borderColor = AMBER}
                    onMouseOut={e => e.currentTarget.style.borderColor = BORDER}>
                    <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 14, color: AMBER, width: 30, textAlign: "center" }}>{v.vertFit}/5</span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: NAVY, flex: 1 }}>{v.name}</span>
                    <span style={{ fontSize: 11, color: MUTED }}>{v.tier} · {v.score}</span>
                    <span style={{ color: ELECTRIC, fontSize: 12 }}>→</span>
                  </a>
                ))}
              </div>
            </>)}

            {/* Limited */}
            {limited.length > 0 && (<>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8 }}>Limited Fit ({limited.length})</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
                {limited.map(v => (
                  <a key={v.slug} href={`/vendors/${v.slug}`} style={{ fontSize: 12, color: MUTED, padding: "6px 12px", borderRadius: 5, border: `1px solid ${BORDER}`, background: WARM }}>
                    {v.name} <span style={{ opacity: 0.5 }}>({v.vertFit}/5)</span>
                  </a>
                ))}
              </div>
            </>)}
          </div>
        </section>
      )}

      {/* Tools */}
      <section style={{ background: WARM, padding: "28px 28px", borderTop: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 12 }}>Tools for {vert.name} {cat.name} evaluation</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }} className="pg">
            {[
              { name: "Vendor Match Engine", desc: "Get a ranked shortlist filtered for " + vert.name, href: "/tools/vendor-match" },
              { name: "Platform Decision Matrix", desc: "Assess current platform across 7 layers", href: "/tools/platform-decision" },
              { name: "Contract Risk Scanner", desc: "Analyze terms before signing", href: "/tools/contract-risk" },
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
            <span style={{ fontSize: 13, color: MUTED }}>Need expert guidance? <a href="/contact" style={{ color: ELECTRIC, fontWeight: 600 }}>Connect with a vetted CX consultant →</a></span>
          </div>
        </div>
      </section>

      {/* Other verticals for this category */}
      <section style={{ background: "#fff", padding: "28px 28px", borderTop: `1px solid ${BORDER}` }}>
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
              <a key={k} href={`/vendors/${k}/${verticalSlug}`} style={{ fontSize: 12, color: SLATE, padding: "6px 14px", borderRadius: 5, border: `1px solid ${BORDER}`, background: "#fff", transition: "all 0.15s" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.color = ELECTRIC; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = SLATE; }}>
                {c.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer style={{ background: DEEP, padding: "32px 28px 20px" }}>
        <div style={{ ...WRAP, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={22} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 12 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>© 2026 The Center of CX</span>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="/privacy" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Privacy</a>
            <a href="/terms" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
