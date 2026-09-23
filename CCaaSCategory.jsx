import { useState, useEffect, useRef } from "react";
import { getCoreVendors, getAdjacentVendors } from "./VendorData";
import { ccaasResearchStatus, CCAAS_RESEARCH, fmtDate } from "./src/lib/researchStatus";

const NAVY = "#0B1D3A";
const DEEP = "#061325";
const ELECTRIC = "#0088DD";
const LIGHT = "#00AAFF";
const ICE = "#E8F4FD";
const WARM = "#F8FAFB";
const SLATE = "#3A4F6A";
const MUTED = "#6B7F99";
const BORDER = "#D8E3ED";
const GREEN = "#10B981";
const AMBER = "#F59E0B";
const RED = "#EF4444";
const PURPLE = "#7C3AED";

const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };

function useInView(t = 0.1) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.unobserve(el); } }, { threshold: t });
    o.observe(el);
    return () => o.disconnect();
  }, []);
  return [ref, v];
}

function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, v] = useInView();
  return <div ref={ref} style={{ ...style, opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(22px)", transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s` }}>{children}</div>;
}

function LogoMark({ size = 34, light = true }) {
  const arcColor = light ? "#fff" : NAVY;
  const xColor = light ? LIGHT : ELECTRIC;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
      <g transform="translate(60,60)">
        <path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={arcColor} strokeWidth="2" strokeLinecap="round" opacity={light ? 0.6 : 0.3}/>
        <path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={arcColor} strokeWidth="3.2" strokeLinecap="round" opacity={light ? 0.8 : 0.5}/>
        <path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={arcColor} strokeWidth="5" strokeLinecap="round"/>
        <line x1="-14" y1="-14" x2="14" y2="14" stroke={xColor} strokeWidth="5.5" strokeLinecap="round"/>
        <line x1="14" y1="-14" x2="-14" y2="14" stroke={xColor} strokeWidth="5.5" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", fn, { passive: true }); return () => window.removeEventListener("scroll", fn); }, []);
  const links = [
    { name: "Vendors", href: "/vendors" },
    { name: "Tools", href: "/how-to-choose" },
    { name: "Industries", href: "/industries" },
    { name: "Research", href: "/research" },
    { name: "The Human Premium", href: "/human-premium" },
  ];
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: #fff; color: ${NAVY}; -webkit-font-smoothing: antialiased; }
        a { text-decoration: none; color: inherit; }
        @media (max-width: 860px) { .nav-links { display: none !important; } .bell-tiers { flex-direction: column !important; } .method-grid { grid-template-columns: 1fr !important; } }
      `}</style>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: scrolled ? "rgba(6,19,37,0.96)" : "transparent", backdropFilter: scrolled ? "blur(14px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "all 0.35s", padding: scrolled ? "12px 0" : "20px 0" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LogoMark size={34} />
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 14.5, letterSpacing: 0.4, fontFamily: "'DM Sans', sans-serif" }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span>
          </a>
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {links.map(l => <a key={l.name} href={l.href} style={{ color: l.name === "Vendors" ? "#fff" : "rgba(255,255,255,0.7)", fontSize: 13.5, fontWeight: l.name === "Vendors" ? 600 : 500, fontFamily: "'DM Sans', sans-serif", transition: "color 0.2s", borderBottom: l.name === "Vendors" ? `2px solid ${ELECTRIC}` : "2px solid transparent", paddingBottom: 2 }} onMouseOver={e => e.target.style.color = "#fff"} onMouseOut={e => e.target.style.color = l.name === "Vendors" ? "#fff" : "rgba(255,255,255,0.7)"}>{l.name}</a>)}
            <a href="/subscribe" style={{ color: "#fff", fontSize: 13, fontWeight: 600, background: ELECTRIC, padding: "9px 20px", borderRadius: 6, fontFamily: "'DM Sans', sans-serif" }}>Subscribe</a>
          </div>
        </div>
      </nav>
    </>
  );
}

/* Integrity freeze, TB decision 23 Sep 2026 (S22). The Phase 1 tier distribution chart, the
   ranked directory and the 27-dimension composite no longer render. Phase 1 scored every
   vendor on one model across unlike platforms; current research compares vendors only
   inside a competitive class and publishes numeric ratings only once a class has enough
   validated peers. Vendors are listed by research status, alphabetically. */
const ADJACENT_DESC = "Influential in CX stack design and tracked as adjacent platforms beside core CCaaS.";

const METHOD_CARDS = [
  { name: "Atomic claims", text: "Each finding is one testable claim with its own dated evidence and an evidence state: verified, strongly supported, inferred or unverified." },
  { name: "Competitive classes", text: "Vendors are compared inside a class of platforms built for the same job. The class frames the comparison and carries no quality score." },
  { name: "Where they break", text: "Each break names the buyer condition that triggers it, whether implementation can mitigate it, what that adds in cost and who owns it after go-live." },
  { name: "Proof and contract", text: "Each researched vendor carries the demo tests, reference questions and contract clauses a buyer should demand before signing." },
  { name: "Unknown stays unknown", text: "Missing public evidence raises the proof burden. It is never counted as a weakness." },
  { name: "Ratings stay locked", text: "Numeric ratings publish only when a competitive class has enough validated peers for a defensible comparison." },
];

export default function CCaaSCategory() {
  const core = getCoreVendors();
  const adjacent = getAdjacentVendors();

  const complete = core.filter(v => ccaasResearchStatus(v.slug) === "complete");
  const phase1 = core.filter(v => ccaasResearchStatus(v.slug) !== "complete");
  const groups = [
    { name: "Current research complete", color: GREEN, label: `${complete.length} vendors`,
      desc: `These vendors passed the current research completion gate (last validated ${fmtDate(CCAAS_RESEARCH.asOf)}). Their pages still show the Phase 1 assessment while they are rebuilt from the new research.`,
      vendors: complete },
    { name: "Phase 1 context", color: ELECTRIC, label: `${phase1.length} vendors`,
      desc: "Not yet researched under the current methodology. Their pages show the earlier Phase 1 assessment, labelled as such.",
      vendors: phase1 },
  ];

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
              <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</a>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
              <a href="/vendors" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Vendors</a>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
              <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>Core CX Platforms (CCaaS)</span>
            </div>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "0 0 20px" }}>
              CCaaS Platform{" "}
              <span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Market Intelligence</span>
            </h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 600 }}>
              {core.length} core CCaaS platforms and {adjacent.length} adjacent suites. Current research, built from atomic claims, dated evidence, causal breaks and proof requirements, is complete on {complete.length} of them and being published. Numeric scores and tiers are withdrawn until class-specific ratings are validated.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              <a href="/research/ccaas-buyer-guide" style={{ fontSize: 12, color: LIGHT, padding: "6px 14px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)", transition: "background 0.15s" }}
                onMouseOver={e => e.currentTarget.style.background = "rgba(0,136,221,0.08)"}
                onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>CCaaS Buyer Guide (18 pages) ↓</a>
              <a href="/tools/vendor-match" style={{ fontSize: 12, color: LIGHT, padding: "6px 14px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)", transition: "background 0.15s" }}
                onMouseOver={e => e.currentTarget.style.background = "rgba(0,136,221,0.08)"}
                onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>Vendor Match Engine →</a>
              <a href="/research/ccaas-migration-costs" style={{ fontSize: 12, color: LIGHT, padding: "6px 14px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)", transition: "background 0.15s" }}
                onMouseOver={e => e.currentTarget.style.background = "rgba(0,136,221,0.08)"}
                onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}>Why CCaaS Migrations Don't Cut Costs →</a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Why there are no scores */}
      <section style={{ background: WARM, padding: "56px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ maxWidth: 760 }}>
              <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Scores withdrawn</span>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: NAVY, margin: "8px 0 12px" }}>Why this page no longer ranks vendors.</h2>
              <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.7, margin: 0 }}>The earlier assessment scored every vendor on one 27-dimension model and placed unlike platforms on a single curve. The current research compares vendors only inside a competitive class, keeps capability, evidence, fit, risk and implementation separate, and treats an unverified claim as a question to prove. Numeric ratings return when each class has enough validated peers to support them. Until then, the right shortlist depends on your requirements, and the vendor pages below explain where each platform fits and where it breaks.</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Directory by research status */}
      <section style={{ background: "#fff", padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Complete Directory</span>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 40px" }}>All {core.length} core vendors, by research status.</h2>
          </FadeIn>

          {groups.map((g, gi) => (
            <FadeIn key={gi} delay={gi * 0.05}>
              <div style={{ marginBottom: 40 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 4, height: 24, borderRadius: 2, background: g.color }} />
                  <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: 0 }}>{g.name}</h3>
                  <span style={{ fontSize: 11, color: MUTED, background: WARM, padding: "2px 8px", borderRadius: 4 }}>{g.label}</span>
                </div>
                <p style={{ fontSize: 13, color: MUTED, marginBottom: 16, maxWidth: 700 }}>{g.desc}</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {g.vendors.map((v, vi) => (
                    <a key={vi} href={`/vendors/${v.slug}`}
                      style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, transition: "all 0.2s", cursor: "pointer" }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = g.color; e.currentTarget.style.boxShadow = `0 4px 16px ${g.color}10`; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 16, fontWeight: 600, color: NAVY }}>{v.name}</span>
                          <span style={{ fontSize: 11, color: MUTED, background: "#fff", padding: "1px 8px", borderRadius: 4, border: `1px solid ${BORDER}` }}>{v.segment}</span>
                        </div>
                        <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, margin: "4px 0 0", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{v.summary}</p>
                      </div>
                      <span style={{ fontSize: 14, color: ELECTRIC, flexShrink: 0 }}>→</span>
                    </a>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}

          {/* Adjacent suites */}
          <FadeIn delay={0.2}>
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 4, height: 24, borderRadius: 2, background: PURPLE }} />
                <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: 0 }}>Adjacent / Non-Core</h3>
              </div>
              <p style={{ fontSize: 13, color: MUTED, marginBottom: 16, maxWidth: 700 }}>{ADJACENT_DESC}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {adjacent.map((v, i) => (
                  <a key={i} href={`/vendors/${v.slug}`}
                    style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, transition: "border-color 0.2s" }}
                    onMouseOver={e => e.currentTarget.style.borderColor = PURPLE}
                    onMouseOut={e => e.currentTarget.style.borderColor = BORDER}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", border: `2px dashed ${PURPLE}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: PURPLE, fontWeight: 600 }}>ADJ</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: 16, fontWeight: 600, color: NAVY }}>{v.name}</span>
                      <p style={{ fontSize: 13, color: MUTED, margin: "2px 0 0", lineHeight: 1.4 }}>{v.summary.substring(0, 120)}...</p>
                    </div>
                    <span style={{ fontSize: 14, color: PURPLE, flexShrink: 0 }}>→</span>
                  </a>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* How vendors are researched */}
      <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "80px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "30%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.04) 0%, transparent 70%)" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Research Method</span>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, fontWeight: 400, color: "#fff", margin: "8px 0 8px" }}>Research individually. Validate independently. Normalize collectively.</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", maxWidth: 600, margin: "0 auto" }}>Every vendor is researched on its own, every claim is tied to dated evidence, and comparisons are made only across vendors that do the same job.</p>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }} className="method-grid">
            {METHOD_CARDS.map((c, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "24px 20px" }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: "0 0 8px" }}>{c.name}</h4>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>{c.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <div style={{ marginTop: 32, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", maxWidth: 600, margin: "0 auto" }}>
                {complete.length} of {core.length} core vendors researched so far. {adjacent.length} adjacent platforms tracked for CX stack influence.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Tools + Next Steps */}
      <section style={{ background: WARM, padding: "48px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="method-grid">
              <a href="/tools/vendor-match" style={{ display: "block", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "22px 20px", textDecoration: "none", color: "inherit", transition: "all 0.2s", borderLeft: `3px solid ${ELECTRIC}` }}
                onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,136,221,0.08)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.borderLeftColor = ELECTRIC; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Most used</div>
                <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, fontWeight: 400, color: NAVY, margin: "0 0 4px" }}>Vendor Match Engine</h3>
                <p style={{ fontSize: 12, color: MUTED, margin: "0 0 8px", lineHeight: 1.5 }}>Tell us your environment and priorities. Get a shortlist with the reasoning behind it.</p>
                <span style={{ fontSize: 12, fontWeight: 600, color: ELECTRIC }}>Launch tool →</span>
              </a>
              <a href="/tools/platform-decision" style={{ display: "block", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "22px 20px", textDecoration: "none", color: "inherit", transition: "all 0.2s", borderLeft: `3px solid ${LIGHT}` }}
                onMouseOver={e => { e.currentTarget.style.borderColor = LIGHT; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,170,255,0.08)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.borderLeftColor = LIGHT; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: LIGHT, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Assessment</div>
                <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, fontWeight: 400, color: NAVY, margin: "0 0 4px" }}>Platform Decision Matrix</h3>
                <p style={{ fontSize: 12, color: MUTED, margin: "0 0 8px", lineHeight: 1.5 }}>Assess your current platform across all 7 layers. Stay, extend, or replace.</p>
                <span style={{ fontSize: 12, fontWeight: 600, color: LIGHT }}>Launch tool →</span>
              </a>
              <a href="/tools/contract-risk" style={{ display: "block", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "22px 20px", textDecoration: "none", color: "inherit", transition: "all 0.2s", borderLeft: `3px solid ${RED}` }}
                onMouseOver={e => { e.currentTarget.style.borderColor = RED; e.currentTarget.style.boxShadow = "0 4px 16px rgba(239,68,68,0.08)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.borderLeftColor = RED; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: RED, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>Before you sign</div>
                <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, fontWeight: 400, color: NAVY, margin: "0 0 4px" }}>Contract Risk Scanner</h3>
                <p style={{ fontSize: 12, color: MUTED, margin: "0 0 8px", lineHeight: 1.5 }}>7 critical contract terms analyzed with negotiation recommendations.</p>
                <span style={{ fontSize: 12, fontWeight: 600, color: RED }}>Launch tool →</span>
              </a>
            </div>
          </FadeIn>
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <span style={{ fontSize: 13, color: MUTED }}>Need expert guidance? <a href="/contact" style={{ color: ELECTRIC, fontWeight: 600 }}>Connect with a vetted CX consultant →</a></span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={WRAP}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <LogoMark size={28} />
              <span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span>
            </a>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="/privacy" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Privacy</a>
            <a href="/terms" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Terms</a>
          </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
