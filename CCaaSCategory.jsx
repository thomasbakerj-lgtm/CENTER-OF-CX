import { useState, useEffect, useRef } from "react";
import { getCoreVendors, getAdjacentVendors } from "./VendorData";

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
    { name: "Platforms & Tech", href: "/platforms-and-tech" },
    { name: "How to Choose", href: "/how-to-choose" },
    { name: "Research", href: "/research" },
    { name: "Vendors", href: "/vendors" },
    { name: "Advisory", href: "/advisory" },
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
            <a href="/contact" style={{ color: "#fff", fontSize: 13, fontWeight: 600, background: ELECTRIC, padding: "9px 20px", borderRadius: 6, fontFamily: "'DM Sans', sans-serif" }}>Request Briefing</a>
          </div>
        </div>
      </nav>
    </>
  );
}

const tierConfig = {
  "Strategic Foundation": { color: GREEN, bg: `${GREEN}08`, border: `${GREEN}20`, label: "Top Tier Core", desc: "Vendors that can credibly anchor serious enterprise or regulated CCaaS programs with broad platform substance. Default benchmarks in any enterprise evaluation." },
  "Strong Contender": { color: ELECTRIC, bg: `${ELECTRIC}08`, border: `${ELECTRIC}20`, label: "Upper-Mid Core", desc: "Strong platforms with clear relevance and meaningful differentiation. Credible enterprise or mid-market options with specific strengths that can outperform top-tier leaders in defined scenarios." },
  "Situational Specialist": { color: AMBER, bg: `${AMBER}08`, border: `${AMBER}20`, label: "Specialist", desc: "Useful in defined motions, segments, or regions. Legacy bridge, regional, or niche strength. Qualified carefully for broader enterprise needs." },
  "Limited Fit": { color: RED, bg: `${RED}08`, border: `${RED}20`, label: "Narrow Fit", desc: "Relevant for SMB, narrow use cases, or legacy outbound. Should not appear in enterprise-scale evaluations without specific justification." },
  "Adjacent": { color: PURPLE, bg: `${PURPLE}08`, border: `${PURPLE}20`, label: "N/A", desc: "Influential to CX stack design but evaluated as adjacent platforms, not core CCaaS foundation." },
};

const scoringGroups = [
  { name: "Platform Core", weight: 35, dims: ["Voice / ACD / Routing (10)", "Telephony / BYOC (6)", "Digital Channels (5)", "Outbound (4)", "IVR / IVA / Self-Service (6)", "Agent Desktop / Supervisor (4)"] },
  { name: "Workforce Maturity", weight: 20, dims: ["Forecasting / Scheduling (5)", "QM / Auto-QA / Compliance (7)", "Speech / Text Analytics (5)", "Performance Mgmt / Coaching (3)"] },
  { name: "AI Substance", weight: 20, dims: ["Agent Copilot (6)", "Supervisor Copilot (3)", "Knowledge Grounding (4)", "AI Orchestration / Journey Intelligence (7)"] },
  { name: "Architecture", weight: 16, dims: ["Cloud-Native Depth (4)", "API / Extensibility (5)", "Marketplace / Ecosystem (4)", "Hybrid / Migration Support (3)"] },
  { name: "Enterprise Readiness", weight: 15, dims: ["Security / Compliance (6)", "Availability / Resilience (4)", "Global Scale / Data Residency (5)"] },
  { name: "Commercial & Market Fit", weight: 11, dims: ["Partner Leverage (4)", "Time-to-Value (3)", "Services Burden (2)", "Vertical Credibility (5)", "BPO Suitability (2)", "SMB-Midmarket Fit (2)"] },
];

export default function CCaaSCategory() {
  const core = getCoreVendors();
  const adjacent = getAdjacentVendors();

  const tiers = [
    { name: "Strategic Foundation", vendors: core.filter(v => v.tier === "Strategic Foundation") },
    { name: "Strong Contender", vendors: core.filter(v => v.tier === "Strong Contender") },
    { name: "Situational Specialist", vendors: core.filter(v => v.tier === "Situational Specialist") },
    { name: "Limited Fit", vendors: core.filter(v => v.tier === "Limited Fit") },
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
              {core.length} vendors scored across 27 weighted dimensions covering platform depth, workforce maturity, AI substance, architecture, enterprise readiness, and commercial fit. Every score is sourced, weighted, and placed on a maturity bell curve.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", gap: 20, marginTop: 32, flexWrap: "wrap" }}>
              {[
                { n: core.length, l: "Vendors scored" },
                { n: "27", l: "Scoring dimensions" },
                { n: "6", l: "Category groups" },
                { n: "4", l: "Maturity tiers" },
              ].map((s, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "14px 20px", textAlign: "center", minWidth: 100 }}>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: LIGHT }}>{s.n}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{s.l}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Bell Curve Visual */}
      <section style={{ background: WARM, padding: "64px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Bell Curve Distribution</span>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: NAVY, margin: "8px 0 0" }}>Where the market clusters.</h2>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }} className="bell-tiers">
              {tiers.map((t, i) => {
                const cfg = tierConfig[t.name];
                const heights = [140, 220, 280, 120];
                return (
                  <div key={i} style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: "10px 10px 0 0", padding: "16px 14px", minHeight: heights[i], display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: cfg.color, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
                        {t.name} <span style={{ fontWeight: 400, opacity: 0.7 }}>({cfg.label})</span>
                      </div>
                      {t.vendors.map((v, j) => (
                        <a key={j} href={`/vendors/${v.slug}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", fontSize: 12.5, color: SLATE, borderBottom: j < t.vendors.length - 1 ? `1px solid ${BORDER}` : "none", transition: "color 0.15s" }}
                          onMouseOver={e => e.currentTarget.style.color = ELECTRIC}
                          onMouseOut={e => e.currentTarget.style.color = SLATE}>
                          <span style={{ fontWeight: 500 }}>{v.name}</span>
                          <span style={{ fontWeight: 700, color: cfg.color, fontSize: 12 }}>{v.score}</span>
                        </a>
                      ))}
                    </div>
                    <div style={{ background: cfg.color, color: "#fff", textAlign: "center", padding: "6px", borderRadius: "0 0 6px 6px", fontSize: 11, fontWeight: 700 }}>
                      {t.vendors.length} vendor{t.vendors.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Full Directory by Tier */}
      <section style={{ background: "#fff", padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Complete Directory</span>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: NAVY, margin: "0 0 40px" }}>All {core.length} vendors, ranked by weighted composite score.</h2>
          </FadeIn>

          {tiers.map((t, ti) => {
            const cfg = tierConfig[t.name];
            return (
              <FadeIn key={ti} delay={ti * 0.05}>
                <div style={{ marginBottom: 40 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 4, height: 24, borderRadius: 2, background: cfg.color }} />
                    <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: 0 }}>{t.name}</h3>
                    <span style={{ fontSize: 11, color: MUTED, background: WARM, padding: "2px 8px", borderRadius: 4 }}>{cfg.label}</span>
                  </div>
                  <p style={{ fontSize: 13, color: MUTED, marginBottom: 16, maxWidth: 700 }}>{cfg.desc}</p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {t.vendors.map((v, vi) => (
                      <a key={vi} href={`/vendors/${v.slug}`}
                        style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, transition: "all 0.2s", cursor: "pointer" }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = cfg.color; e.currentTarget.style.boxShadow = `0 4px 16px ${cfg.color}10`; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}>

                        {/* Score circle */}
                        <div style={{ width: 48, height: 48, borderRadius: "50%", border: `2.5px solid ${cfg.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: cfg.color }}>{v.score}</span>
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 16, fontWeight: 600, color: NAVY }}>{v.name}</span>
                            <span style={{ fontSize: 11, color: MUTED, background: "#fff", padding: "1px 8px", borderRadius: 4, border: `1px solid ${BORDER}` }}>{v.segment}</span>
                          </div>
                          <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.5, margin: "4px 0 0", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{v.summary}</p>
                        </div>

                        {/* Arrow */}
                        <span style={{ fontSize: 14, color: ELECTRIC, flexShrink: 0 }}>→</span>
                      </a>
                    ))}
                  </div>
                </div>
              </FadeIn>
            );
          })}

          {/* Adjacent suites */}
          <FadeIn delay={0.2}>
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ width: 4, height: 24, borderRadius: 2, background: PURPLE }} />
                <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: 0 }}>Adjacent / Non-Core</h3>
              </div>
              <p style={{ fontSize: 13, color: MUTED, marginBottom: 16, maxWidth: 700 }}>{tierConfig["Adjacent"].desc}</p>
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

      {/* Scoring Methodology */}
      <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "80px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "30%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.04) 0%, transparent 70%)" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Scoring Methodology</span>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, fontWeight: 400, color: "#fff", margin: "8px 0 8px" }}>27 dimensions. 6 category groups. Total weight: 100.</h2>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", maxWidth: 560, margin: "0 auto" }}>Each vendor is scored 1–5 on every dimension. Scores are multiplied by dimension weight, summed, and normalized to a 100-point composite. Weights reflect operational importance — routing and QA carry more weight than marketplace breadth.</p>
            </div>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }} className="method-grid">
            {scoringGroups.map((g, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "24px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>{g.name}</h4>
                    <span style={{ fontSize: 12, fontWeight: 700, color: LIGHT, background: "rgba(0,170,255,0.1)", padding: "2px 8px", borderRadius: 4 }}>Weight: {g.weight}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {g.dims.map((d, j) => (
                      <div key={j} style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", padding: "3px 0" }}>{d}</div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={0.3}>
            <div style={{ marginTop: 32, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", maxWidth: 600, margin: "0 auto" }}>
                Tier placement is analyst-assigned based on market position, platform substance, and enterprise credibility — not a formula. The weighted composite score provides a quantitative benchmark. 24 core vendors scored across 27 dimensions. 4 adjacent platforms tracked for CX stack influence.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: WARM, padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.08) 0%, transparent 70%)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Need help choosing the right platform?</h2>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>
                  Tell us your operating model, vertical, and constraints. We'll deliver a scored shortlist of 3–5 platforms with honest assessments of each one — drawn from this data.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                  <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, boxShadow: `0 4px 18px rgba(0,136,221,0.25)` }}>Request a Vendor Shortlist</a>
                  <a href="/tco-calculator" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>Calculate Your TCO →</a>
                </div>
              </div>
            </div>
          </FadeIn>
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
          </div>
        </div>
      </footer>
    </div>
  );
}
