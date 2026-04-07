import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getVendor, getAllSlugs } from "./VendorData";

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
        @media (max-width: 860px) { .nav-links { display: none !important; } .profile-grid { grid-template-columns: 1fr !important; } .fit-grid { grid-template-columns: 1fr !important; } }
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

function ScoreBadge({ score, tier }) {
  const color = score >= 85 ? GREEN : score >= 70 ? ELECTRIC : score >= 55 ? AMBER : RED;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", border: `3px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color }}>{score}</span>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color, fontFamily: "'DM Sans', sans-serif" }}>{tier}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>Composite Score</div>
      </div>
    </div>
  );
}

function Section({ label, title, children, dark }) {
  return (
    <FadeIn>
      <div style={{ marginBottom: 32 }}>
        <span style={{ color: dark ? LIGHT : ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", display: "block", marginBottom: 8 }}>{label}</span>
        <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: dark ? "#fff" : NAVY, margin: "0 0 16px" }}>{title}</h2>
        {children}
      </div>
    </FadeIn>
  );
}

function VendorNotFound() {
  return (
    <div>
      <Nav />
      <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "180px 28px 80px", textAlign: "center" }}>
        <div style={WRAP}>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 36, color: "#fff", margin: "0 0 16px" }}>Vendor profile coming soon.</h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 480, margin: "0 auto 32px" }}>We're building out individual vendor assessments across all nine categories. This profile will be available shortly.</p>
          <a href="/vendors" style={{ display: "inline-block", background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>← Back to Vendors</a>
        </div>
      </section>
    </div>
  );
}

export default function VendorProfile() {
  const { slug } = useParams();
  const vendor = getVendor(slug);
  const [showReview, setShowReview] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);
  const [reviewSending, setReviewSending] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!vendor) return <VendorNotFound />;

  const v = vendor;

  return (
    <div>
      <Nav />

      {/* Hero */}
      <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "130px 28px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div style={{ position: "absolute", bottom: "-15%", right: "-8%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.05) 0%, transparent 70%)" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Home</a>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
            <a href="/vendors" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Vendors</a>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
            <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{v.name}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 32 }}>
            <div style={{ maxWidth: 600 }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", background: "rgba(0,170,255,0.1)", padding: "3px 10px", borderRadius: 4 }}>{v.category}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", fontFamily: "'DM Sans', sans-serif", background: "rgba(255,255,255,0.05)", padding: "3px 10px", borderRadius: 4 }}>{v.segment}</span>
              </div>
              <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "0 0 16px" }}>{v.name}</h1>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>{v.summary}</p>
            </div>
            <div style={{ flexShrink: 0 }}>
              <ScoreBadge score={v.score} tier={v.tier} />
            </div>
          </div>
        </div>
      </section>

      {/* Strengths */}
      <section style={{ background: WARM, padding: "64px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <Section label="Assessment" title="What they do well.">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {v.strengths.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "14px 18px", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: `${GREEN}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <span style={{ color: GREEN, fontSize: 12, fontWeight: 700 }}>+</span>
                  </div>
                  <span style={{ fontSize: 14, color: SLATE, lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif" }}>{s}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* Weaknesses */}
      <section style={{ background: "#fff", padding: "64px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <Section label="Honest assessment" title="Where they break.">
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {v.weaknesses.map((w, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "14px 18px", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: `${AMBER}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <span style={{ color: AMBER, fontSize: 12, fontWeight: 700 }}>!</span>
                  </div>
                  <span style={{ fontSize: 14, color: SLATE, lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif" }}>{w}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* Best fit / Not fit */}
      <section style={{ background: WARM, padding: "64px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="fit-grid">
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 24px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>Best-fit customers</div>
                <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.65, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{v.bestFit}</p>
              </div>
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 24px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: RED, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>Likely not the right fit</div>
                <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.65, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{v.notFit}</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Red flags */}
      <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "64px 28px" }}>
        <div style={WRAP}>
          <Section label="Buyer warnings" title="Red flags to watch for." dark>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {v.redFlags.map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "14px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: `${RED}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <span style={{ color: RED, fontSize: 12, fontWeight: 700 }}>⚠</span>
                  </div>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif" }}>{r}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* Competitive context */}
      <section style={{ background: "#fff", padding: "64px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <Section label="Competitive landscape" title="How they compare.">
            <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.75, margin: "0 0 24px", fontFamily: "'DM Sans', sans-serif" }}>{v.competitiveContext}</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {v.competitors.map((c, i) => {
                const compSlug = c.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
                const exists = getAllSlugs().includes(compSlug);
                return exists ? (
                  <a key={i} href={`/vendors/${compSlug}`} style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC, background: `${ELECTRIC}08`, padding: "6px 14px", borderRadius: 6, border: `1px solid ${ELECTRIC}20`, fontFamily: "'DM Sans', sans-serif", transition: "background 0.2s" }}
                    onMouseOver={e => e.target.style.background = `${ELECTRIC}15`}
                    onMouseOut={e => e.target.style.background = `${ELECTRIC}08`}>
                    {c} →
                  </a>
                ) : (
                  <span key={i} style={{ fontSize: 13, fontWeight: 500, color: MUTED, background: WARM, padding: "6px 14px", borderRadius: 6, border: `1px solid ${BORDER}`, fontFamily: "'DM Sans', sans-serif" }}>{c}</span>
                );
              })}
            </div>
          </Section>
        </div>
      </section>

      {/* Community */}
      <section style={{ background: WARM, padding: "64px 28px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "36px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
              <div style={{ maxWidth: 480 }}>
                <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", display: "block", marginBottom: 8 }}>Community Intelligence</span>
                <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>Used {v.name}? Share what you've seen.</h3>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Your operational experience helps other CX leaders make better decisions. Score this vendor, share what works, flag what doesn't. Every review is attributed by role and company size.</p>
              </div>
              <button onClick={() => setShowReview(true)} style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: `0 4px 18px rgba(0,136,221,0.2)`, flexShrink: 0 }}>Share Your Experience</button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Review Modal */}
      {showReview && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowReview(false)}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(6,19,37,0.7)", backdropFilter: "blur(6px)" }} />
          <div onClick={e => e.stopPropagation()} style={{ position: "relative", background: "#fff", borderRadius: 16, padding: "36px 32px", maxWidth: 560, width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 24px 80px rgba(0,0,0,0.25)" }}>
            <button onClick={() => setShowReview(false)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", fontSize: 20, color: MUTED, cursor: "pointer", lineHeight: 1 }}>×</button>

            {reviewSent ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${GREEN}12`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <span style={{ color: GREEN, fontSize: 22 }}>✓</span>
                </div>
                <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: NAVY, margin: "0 0 8px" }}>Review submitted. Thank you.</h3>
                <p style={{ fontSize: 14, color: MUTED, fontFamily: "'DM Sans', sans-serif" }}>Your experience helps the CX community make better technology decisions.</p>
              </div>
            ) : (
              <div>
                <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: NAVY, margin: "0 0 4px" }}>Review {v.name}</h3>
                <p style={{ fontSize: 13, color: MUTED, margin: "0 0 24px", fontFamily: "'DM Sans', sans-serif" }}>Your feedback is visible to the community and our editorial team. All fields are required unless marked optional.</p>

                <div id="review-form" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <input type="hidden" name="vendor" value={v.name} />
                  <input type="hidden" name="vendor_slug" value={v.slug} />
                  <input type="hidden" name="_subject" value={`Community Review: ${v.name} — Center of CX`} />

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: SLATE, display: "block", marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>Your overall score</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[1,2,3,4,5].map(num => (
                        <label key={num} style={{ flex: 1 }}>
                          <input type="radio" name="score" value={num} style={{ display: "none" }} />
                          <div className="score-opt" style={{ textAlign: "center", padding: "12px 0", borderRadius: 8, border: `1px solid ${BORDER}`, cursor: "pointer", transition: "all 0.15s", fontFamily: "'DM Sans', sans-serif" }}
                            onClick={e => { e.currentTarget.parentElement.querySelector('input').checked = true; document.querySelectorAll('.score-opt').forEach(el => { el.style.background = '#fff'; el.style.borderColor = BORDER; el.style.color = SLATE; }); e.currentTarget.style.background = `${ELECTRIC}10`; e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.color = ELECTRIC; }}>
                            <div style={{ fontSize: 18, fontWeight: 700 }}>{num}</div>
                            <div style={{ fontSize: 10, color: MUTED }}>{["Poor","Below avg","Average","Strong","Excellent"][num-1]}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: SLATE, display: "block", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>Your role</label>
                      <select name="role" required style={{ width: "100%", padding: "10px 12px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, cursor: "pointer" }}>
                        <option value="" disabled selected>Select</option>
                        <option value="CX Leader / VP">CX Leader / VP</option>
                        <option value="Contact Center Director">Contact Center Director</option>
                        <option value="IT / CTO / CIO">IT / CTO / CIO</option>
                        <option value="Operations Executive">Operations Executive</option>
                        <option value="Agent / Supervisor">Agent / Supervisor</option>
                        <option value="Consultant / Integrator">Consultant / Integrator</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: SLATE, display: "block", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>Company size</label>
                      <select name="company_size" required style={{ width: "100%", padding: "10px 12px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, cursor: "pointer" }}>
                        <option value="" disabled selected>Select</option>
                        <option value="Under 50 agents">Under 50 agents</option>
                        <option value="50–200 agents">50–200 agents</option>
                        <option value="200–500 agents">200–500 agents</option>
                        <option value="500–1000 agents">500–1000 agents</option>
                        <option value="1000+ agents">1000+ agents</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: SLATE, display: "block", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>How long have you used {v.name}?</label>
                    <select name="tenure" required style={{ width: "100%", padding: "10px 12px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, cursor: "pointer" }}>
                      <option value="" disabled selected>Select</option>
                      <option value="Less than 6 months">Less than 6 months</option>
                      <option value="6–12 months">6–12 months</option>
                      <option value="1–2 years">1–2 years</option>
                      <option value="2–4 years">2–4 years</option>
                      <option value="4+ years">4+ years</option>
                      <option value="Evaluated but did not buy">Evaluated but did not buy</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: SLATE, display: "block", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>What works well?</label>
                    <textarea name="what_works" required rows={3} style={{ width: "100%", padding: "10px 12px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, resize: "vertical" }} placeholder="Specific capabilities, support quality, implementation experience, daily operations..." />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: SLATE, display: "block", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>What would you change?</label>
                    <textarea name="what_to_change" required rows={3} style={{ width: "100%", padding: "10px 12px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY, resize: "vertical" }} placeholder="Gaps, frustrations, missing features, support issues, pricing concerns..." />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: SLATE, display: "block", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>Would you recommend {v.name} to a peer?</label>
                    <div style={{ display: "flex", gap: 10 }}>
                      {["Yes", "With caveats", "No"].map(opt => (
                        <label key={opt} style={{ flex: 1 }}>
                          <input type="radio" name="recommend" value={opt} style={{ display: "none" }} />
                          <div className="rec-opt" style={{ textAlign: "center", padding: "10px 0", borderRadius: 6, border: `1px solid ${BORDER}`, cursor: "pointer", fontSize: 13, fontWeight: 500, color: SLATE, fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" }}
                            onClick={e => { e.currentTarget.parentElement.querySelector('input').checked = true; document.querySelectorAll('.rec-opt').forEach(el => { el.style.background = '#fff'; el.style.borderColor = BORDER; el.style.color = SLATE; }); e.currentTarget.style.background = `${ELECTRIC}10`; e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.color = ELECTRIC; }}>
                            {opt}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: SLATE, display: "block", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>Your name <span style={{ fontWeight: 400, color: MUTED }}>(optional — displayed as first name + last initial)</span></label>
                    <input name="reviewer_name" style={{ width: "100%", padding: "10px 12px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY }} placeholder="Jane S." />
                  </div>

                  <div>
                    <label style={{ fontSize: 12, fontWeight: 600, color: SLATE, display: "block", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>Email <span style={{ fontWeight: 400, color: MUTED }}>(private — for verification only)</span></label>
                    <input name="email" type="email" required style={{ width: "100%", padding: "10px 12px", fontSize: 14, fontFamily: "'DM Sans', sans-serif", border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", color: NAVY }} placeholder="jane@company.com" />
                  </div>

                  <button
                    type="button"
                    disabled={reviewSending}
                    onClick={() => {
                      const form = document.getElementById("review-form");
                      const formData = new FormData();
                      form.querySelectorAll("input, select, textarea").forEach(el => {
                        if (el.name) {
                          if (el.type === "radio") { if (el.checked) formData.append(el.name, el.value); }
                          else formData.append(el.name, el.value);
                        }
                      });
                      setReviewSending(true);
                      fetch("https://formspree.io/f/xjgplvkz", {
                        method: "POST", body: formData, headers: { Accept: "application/json" },
                      }).then(res => { if (res.ok) setReviewSent(true); setReviewSending(false); })
                      .catch(() => setReviewSending(false));
                    }}
                    style={{ width: "100%", background: reviewSending ? SLATE : ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, border: "none", cursor: reviewSending ? "wait" : "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: `0 4px 18px rgba(0,136,221,0.2)` }}>
                    {reviewSending ? "Submitting..." : "Submit Review"}
                  </button>

                  <p style={{ fontSize: 11, color: MUTED, textAlign: "center", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Your email stays private. Reviews may be edited for clarity.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA */}
      <section style={{ background: WARM, padding: "80px 28px" }}>
        <div style={WRAP}>
          <FadeIn>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 36px", textAlign: "center", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.08) 0%, transparent 70%)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>
                  Evaluating {v.name} for your organization?
                </h2>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px", fontFamily: "'DM Sans', sans-serif" }}>
                  We can help you evaluate whether {v.name} fits your operating model, vertical requirements, and integration landscape. We'll come prepared with competitive context and the questions you should be asking.
                </p>
                <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                  <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", boxShadow: `0 4px 18px rgba(0,136,221,0.25)` }}>Request a Vendor Briefing</a>
                  <a href="/vendors" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif" }}>Browse All Vendors →</a>
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
              <span style={{ color: "#fff", fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span>
            </a>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif" }}>© 2026 The Center of CX. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
