import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getVendor, getAllSlugs } from "./VendorData";
import { getIVAVendor, ivaTierConfig, ivaScoringDimensions } from "./IVAData";
import { getAgentAssistVendor, aaTierConfig, aaDimensions } from "./AgentAssistData";
import { getWEMVendor, getWEMLeaderboardScores } from "./WEMData";
import { getAnalyticsVendor, analyticsDimensions } from "./AnalyticsData";

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
  const ivaVendor = !vendor ? getIVAVendor(slug) : null;
  const aaVendor = !vendor && !ivaVendor ? getAgentAssistVendor(slug) : null;
  const wemVendor = !vendor && !ivaVendor && !aaVendor ? getWEMVendor(slug) : null;
  const anaVendor = !vendor && !ivaVendor && !aaVendor && !wemVendor ? getAnalyticsVendor(slug) : null;
  const [showReview, setShowReview] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);
  const [reviewSending, setReviewSending] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  // ─── IVA VENDOR PROFILE ───
  if (ivaVendor) {
    const iv = ivaVendor;
    const tierCfg = ivaTierConfig[iv.tier] || { color: MUTED, range: "—" };
    const dims = [
      { name: "Conversational Autonomy", score: iv.autonomy, desc: "End-to-end interaction management, intent resolution, and escalation" },
      { name: "Multi-Channel Coverage", score: iv.multiChannel, desc: "Voice, chat, web, messaging, and cross-channel continuity" },
      { name: "Orchestration Depth", score: iv.orchestration, desc: "Business action execution, workflow coordination, and backend integration" },
      { name: "Analytics & Intelligence", score: iv.analytics, desc: "Reporting, conversation analytics, intent insights, and closed-loop learning" },
    ];
    return (
      <div><Nav />
        <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "130px 28px 60px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
          <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
              <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</a>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
              <a href="/vendors" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Vendors</a>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
              <a href="/vendors/iva" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>IVA</a>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
              <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>{iv.name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 32 }}>
              <div style={{ maxWidth: 600 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", background: "rgba(0,170,255,0.1)", padding: "3px 10px", borderRadius: 4 }}>{iv.type}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", padding: "3px 10px", borderRadius: 4 }}>{iv.modality}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", padding: "3px 10px", borderRadius: 4 }}>{iv.segment}</span>
                </div>
                <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "0 0 16px" }}>{iv.name}</h1>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{iv.summary}</p>
              </div>
              <div style={{ flexShrink: 0 }}>
                <ScoreBadge score={iv.score} tier={iv.tier} />
              </div>
            </div>
          </div>
        </section>

        {/* Dimension Scores */}
        <section style={{ background: WARM, padding: "64px 28px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={WRAP}>
            <FadeIn>
              <Section label="Scoring Dimensions" title="Four dimensions, equally weighted.">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="profile-grid">
                  {dims.map((d, i) => {
                    const color = d.score >= 5 ? GREEN : d.score >= 4 ? ELECTRIC : d.score >= 3 ? AMBER : RED;
                    return (
                      <div key={i} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 22px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, margin: 0 }}>{d.name}</h3>
                          <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color }}>{d.score}<span style={{ fontSize: 13, color: MUTED }}>/5</span></span>
                        </div>
                        <div style={{ width: "100%", height: 6, background: `${BORDER}`, borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
                          <div style={{ width: `${(d.score / 5) * 100}%`, height: "100%", background: color, borderRadius: 3 }} />
                        </div>
                        <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>{d.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </Section>
            </FadeIn>
          </div>
        </section>

        {/* Key Attributes */}
        <section style={{ background: "#fff", padding: "64px 28px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={WRAP}>
            <FadeIn>
              <Section label="Vendor Profile" title="Key attributes.">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }} className="profile-grid">
                  {[
                    { label: "Differentiator", value: iv.diff },
                    { label: "Primary Use Case", value: iv.useCase },
                    { label: "AI Origin", value: iv.origin },
                    { label: "Modality", value: iv.modality },
                    { label: "Market Segment", value: iv.segment },
                    { label: "Tier", value: `${iv.tier} (${tierCfg.range})` },
                  ].map((attr, i) => (
                    <div key={i} style={{ background: WARM, borderRadius: 8, padding: "16px 18px" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>{attr.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: NAVY }}>{attr.value}</div>
                    </div>
                  ))}
                </div>
              </Section>
            </FadeIn>
          </div>
        </section>

        {/* Tier Context */}
        <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "64px 28px" }}>
          <div style={WRAP}>
            <FadeIn>
              <Section label="Market Position" title={`${iv.tier} tier — ${tierCfg.range} score range.`} dark>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 20 }}>{tierCfg.desc}</p>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <a href="/vendors/iva" style={{ fontSize: 13, fontWeight: 600, color: LIGHT, background: "rgba(255,255,255,0.06)", padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)" }}>← Back to IVA Market Intelligence</a>
                  <a href="/contact" style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: ELECTRIC, padding: "8px 16px", borderRadius: 6 }}>Request a Vendor Briefing</a>
                </div>
              </Section>
            </FadeIn>
          </div>
        </section>

        {/* Community */}
        <section style={{ background: WARM, padding: "64px 28px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={WRAP}>
            <FadeIn>
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "36px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
                <div style={{ maxWidth: 480 }}>
                  <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Community Intelligence</span>
                  <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>Used {iv.name}? Share what you've seen.</h3>
                  <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, margin: 0 }}>Your operational experience helps other CX leaders make better decisions.</p>
                </div>
                <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, border: "none", cursor: "pointer", boxShadow: "0 4px 18px rgba(0,136,221,0.2)", flexShrink: 0 }}>Share Your Experience</a>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: "#fff", padding: "80px 28px" }}>
          <div style={WRAP}>
            <FadeIn>
              <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 36px", textAlign: "center" }}>
                <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Evaluating {iv.name} for your organization?</h2>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>We can help you evaluate whether {iv.name} fits your operating model, vertical requirements, and integration landscape.</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                  <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, boxShadow: "0 4px 18px rgba(0,136,221,0.25)" }}>Request a Vendor Briefing</a>
                  <a href="/vendors/iva" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>See All IVA Vendors →</a>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={28} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span></div></div></footer>
      </div>
    );
  }

  // ─── AGENT ASSIST VENDOR PROFILE ───
  if (aaVendor) {
    const aa = aaVendor;
    const tierCfg = aaTierConfig[aa.tier] || { color: MUTED, range: "—" };
    const dimScores = aaDimensions.map(d => ({ ...d, score: aa[d.abbr.toLowerCase()] }));
    return (
      <div><Nav />
        <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "130px 28px 60px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
          <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
              <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
              <a href="/vendors" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Vendors</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
              <a href="/vendors/agent-assist" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Agent Assist</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
              <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>{aa.name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 32 }}>
              <div style={{ maxWidth: 600 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", background: "rgba(0,170,255,0.1)", padding: "3px 10px", borderRadius: 4 }}>{aa.type}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", padding: "3px 10px", borderRadius: 4 }}>Agent Assist & Knowledge</span>
                  {aa.momentum === "Up" && <span style={{ fontSize: 11, fontWeight: 600, color: GREEN, background: `${GREEN}15`, padding: "3px 10px", borderRadius: 4 }}>↑ Momentum</span>}
                </div>
                <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "0 0 16px" }}>{aa.name}</h1>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{aa.bestFor}. {tierCfg.desc}</p>
              </div>
              <div style={{ flexShrink: 0 }}><ScoreBadge score={aa.score} tier={aa.tier} /></div>
            </div>
          </div>
        </section>

        {/* Strengths & Weaknesses */}
        <section style={{ background: WARM, padding: "64px 28px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={WRAP}>
            <FadeIn>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="profile-grid">
                <div>
                  <Section label="Assessment" title="What they do well.">
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[aa.strength1, aa.strength2, aa.strength3].map((s, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, padding: "14px 18px", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                          <div style={{ width: 22, height: 22, borderRadius: 6, background: `${GREEN}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}><span style={{ color: GREEN, fontSize: 12, fontWeight: 700 }}>+</span></div>
                          <span style={{ fontSize: 14, color: SLATE, lineHeight: 1.55 }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                </div>
                <div>
                  <Section label="Honest assessment" title="Where to probe.">
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {[aa.weakness1, aa.weakness2, aa.watchout].filter(Boolean).map((w, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, padding: "14px 18px", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                          <div style={{ width: 22, height: 22, borderRadius: 6, background: `${AMBER}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}><span style={{ color: AMBER, fontSize: 12, fontWeight: 700 }}>!</span></div>
                          <span style={{ fontSize: 14, color: SLATE, lineHeight: 1.55 }}>{w}</span>
                        </div>
                      ))}
                    </div>
                  </Section>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* 10 Dimension Scores */}
        <section style={{ background: "#fff", padding: "64px 28px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={WRAP}>
            <FadeIn>
              <Section label="Scoring Dimensions" title="Ten weighted dimensions.">
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }} className="profile-grid">
                  {dimScores.map((d, i) => {
                    const color = d.score >= 5 ? GREEN : d.score >= 4 ? ELECTRIC : d.score >= 3 ? AMBER : RED;
                    return (
                      <div key={i} style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "14px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <div><span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{d.name}</span><span style={{ fontSize: 10, color: MUTED, marginLeft: 6 }}>{d.weight}%</span></div>
                          <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color }}>{d.score}<span style={{ fontSize: 12, color: MUTED }}>/5</span></span>
                        </div>
                        <div style={{ width: "100%", height: 5, background: BORDER, borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ width: `${(d.score / 5) * 100}%`, height: "100%", background: color, borderRadius: 3 }} />
                        </div>
                        <p style={{ fontSize: 11, color: MUTED, margin: "6px 0 0" }}>{d.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </Section>
            </FadeIn>
          </div>
        </section>

        {/* Best Fit */}
        <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "64px 28px" }}>
          <div style={WRAP}>
            <FadeIn>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="profile-grid">
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "28px 24px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Best-fit scenario</div>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, margin: 0 }}>{aa.bestFor}</p>
                </div>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "28px 24px" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: AMBER, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>Watch out for</div>
                  <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.65, margin: 0 }}>{aa.watchout}</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
                <a href="/vendors/agent-assist" style={{ fontSize: 13, fontWeight: 600, color: LIGHT, background: "rgba(255,255,255,0.06)", padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)" }}>← Back to Agent Assist Intelligence</a>
                <a href="/contact" style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: ELECTRIC, padding: "8px 16px", borderRadius: 6 }}>Request a Vendor Briefing</a>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Community */}
        <section style={{ background: WARM, padding: "64px 28px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={WRAP}><FadeIn>
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "36px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
              <div style={{ maxWidth: 480 }}>
                <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Community Intelligence</span>
                <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>Used {aa.name} for agent assist? Share what you've seen.</h3>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, margin: 0 }}>Your operational experience helps other CX leaders make better decisions.</p>
              </div>
              <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, flexShrink: 0, boxShadow: "0 4px 18px rgba(0,136,221,0.2)" }}>Share Your Experience</a>
            </div>
          </FadeIn></div>
        </section>

        {/* CTA */}
        <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}><FadeIn>
          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 36px", textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Evaluating {aa.name} for agent assist?</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>We can help you evaluate whether {aa.name} fits your operating model, vertical requirements, and integration landscape.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, boxShadow: "0 4px 18px rgba(0,136,221,0.25)" }}>Request a Vendor Briefing</a>
              <a href="/vendors/agent-assist" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>See All Agent Assist Vendors →</a>
            </div>
          </div>
        </FadeIn></div></section>

        <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={28} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span></div></div></footer>
      </div>
    );
  }

  // ─── WEM/QM VENDOR PROFILE ───
  if (wemVendor) {
    const wv = wemVendor;
    const lbScores = getWEMLeaderboardScores(wv.vendor);
    const nativeColor = wv.native === "Native" ? GREEN : wv.native === "Mixed" ? AMBER : LIGHT;
    const attrs = [
      { label: "Market Layer", value: wv.layerName },
      { label: "Segment", value: wv.segment },
      { label: "Architecture", value: wv.native },
      { label: "Enterprise Depth", value: `${wv.entDepth}/5` },
      { label: "AI-QA Maturity", value: `${wv.aiQA}/5` },
      { label: "BPO Support", value: `${wv.bpo}/5` },
    ];
    return (
      <div><Nav />
        <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "130px 28px 60px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
          <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
              <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
              <a href="/vendors" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Vendors</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
              <a href="/vendors/wem-qm" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>WEM/QM</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
              <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>{wv.vendor}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 32 }}>
              <div style={{ maxWidth: 620 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", background: "rgba(0,170,255,0.1)", padding: "3px 10px", borderRadius: 4 }}>{wv.segment}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: nativeColor, background: `${nativeColor}15`, padding: "3px 10px", borderRadius: 4 }}>{wv.native}</span>
                </div>
                <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "0 0 16px" }}>{wv.vendor}</h1>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{wv.rec}</p>
              </div>
              <div style={{ flexShrink: 0, textAlign: "center" }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>Rank in layer</div>
                <div style={{ width: 64, height: 64, borderRadius: "50%", border: `3px solid ${ELECTRIC}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: ELECTRIC }}>#{wv.rank}</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>of {wv.layerKey === "fullSuiteWEM" ? 12 : wv.layerKey === "wfmSpecialists" ? 6 : 7}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Dimension Scores */}
        <section style={{ background: WARM, padding: "64px 28px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={WRAP}><FadeIn>
            <Section label="Vendor Dimensions" title="Three core scores.">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }} className="profile-grid">
                {[
                  { name: "Enterprise Depth", score: wv.entDepth, desc: "Suitability for large, complex, multi-site, multi-skill, compliance-heavy operations" },
                  { name: "AI-QA Maturity", score: wv.aiQA, desc: "Credibility of 100% interaction review, auto-scoring, coaching workflows, and operational usability" },
                  { name: "BPO Support", score: wv.bpo, desc: "Multi-client fit, role separation, governance, and reporting isolation" },
                ].map((d, i) => {
                  const color = d.score >= 5 ? GREEN : d.score >= 4 ? ELECTRIC : d.score >= 3 ? AMBER : RED;
                  return (
                    <div key={i} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 22px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, margin: 0 }}>{d.name}</h3>
                        <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color }}>{d.score}<span style={{ fontSize: 13, color: MUTED }}>/5</span></span>
                      </div>
                      <div style={{ width: "100%", height: 6, background: BORDER, borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
                        <div style={{ width: `${(d.score / 5) * 100}%`, height: "100%", background: color, borderRadius: 3 }} />
                      </div>
                      <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>{d.desc}</p>
                    </div>
                  );
                })}
              </div>
            </Section>
          </FadeIn></div>
        </section>

        {/* Leaderboard Positions */}
        {Object.keys(lbScores).length > 0 && (
          <section style={{ background: "#fff", padding: "64px 28px", borderBottom: `1px solid ${BORDER}` }}>
            <div style={WRAP}><FadeIn>
              <Section label="Weighted Rankings" title="How they score across decision modes.">
                <p style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>The same vendor scores differently depending on what you're buying. These are weighted totals out of 5.0 using the scoring framework with mode-specific criteria weights.</p>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${Object.keys(lbScores).length}, 1fr)`, gap: 16 }} className="profile-grid">
                  {Object.entries(lbScores).map(([mode, entry], i) => {
                    const pct = (entry.score / 5) * 100;
                    const color = entry.score >= 4.5 ? GREEN : entry.score >= 3.5 ? ELECTRIC : entry.score >= 2.5 ? AMBER : RED;
                    return (
                      <div key={i} style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 22px" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{entry.modeName}</div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                          <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color }}>#{entry.rank}</span>
                          <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: MUTED }}>{entry.score.toFixed(2)}/5</span>
                        </div>
                        <div style={{ width: "100%", height: 5, background: BORDER, borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3 }} />
                        </div>
                        <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>{entry.read}</p>
                      </div>
                    );
                  })}
                </div>
              </Section>
            </FadeIn></div>
          </section>
        )}

        {/* Key Attributes */}
        <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "64px 28px" }}>
          <div style={WRAP}><FadeIn>
            <Section label="Vendor Profile" title="Key attributes." dark>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="profile-grid">
                {attrs.map((a, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "14px 16px" }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: LIGHT, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>{a.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 500, color: "#fff" }}>{a.value}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
                <a href="/vendors/wem-qm" style={{ fontSize: 13, fontWeight: 600, color: LIGHT, background: "rgba(255,255,255,0.06)", padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)" }}>← Back to WEM/QM Intelligence</a>
                <a href="/contact" style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: ELECTRIC, padding: "8px 16px", borderRadius: 6 }}>Request a Vendor Briefing</a>
              </div>
            </Section>
          </FadeIn></div>
        </section>

        {/* Community */}
        <section style={{ background: WARM, padding: "64px 28px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={WRAP}><FadeIn>
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "36px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
              <div style={{ maxWidth: 480 }}>
                <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Community Intelligence</span>
                <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>Used {wv.vendor} for WEM/WFM/QM? Share what you've seen.</h3>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, margin: 0 }}>Your operational experience helps other CX leaders make better decisions.</p>
              </div>
              <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, flexShrink: 0, boxShadow: "0 4px 18px rgba(0,136,221,0.2)" }}>Share Your Experience</a>
            </div>
          </FadeIn></div>
        </section>

        {/* CTA */}
        <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}><FadeIn>
          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 36px", textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Evaluating {wv.vendor} for workforce or quality management?</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>The right shortlist depends on whether you're buying a workforce control plane, a balanced WEM suite, or a QA modernization overlay. We can help.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, boxShadow: "0 4px 18px rgba(0,136,221,0.25)" }}>Request a WEM/QM Briefing</a>
              <a href="/vendors/wem-qm" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>See All WEM/QM Vendors →</a>
            </div>
          </div>
        </FadeIn></div></section>

        <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={28} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span></div></div></footer>
      </div>
    );
  }

  // ─── ANALYTICS VENDOR PROFILE ───
  if (anaVendor) {
    const av = anaVendor;
    const maxScore = 42;
    const pct = Math.round((av.score / maxScore) * 100);
    const scoreColor = av.score >= 35 ? GREEN : av.score >= 28 ? ELECTRIC : av.score >= 20 ? AMBER : RED;
    const dims = [
      { name: "Intelligence Depth", score: av.intel, desc: "NLU maturity, topic discovery, sentiment, entity extraction, and reasoning quality" },
      { name: "Auto-QA", score: av.autoQA, desc: "Automated quality evaluation, scoring, calibration, and 100% interaction review" },
      { name: "Operational Workflow", score: av.opsWF, desc: "Supervisor tools, alerts, action triggers, and operational decision support" },
      { name: "WFM Alignment", score: av.wfm, desc: "Forecasting, scheduling, adherence, and workforce optimization integration" },
      { name: "Product Insights", score: av.prodIns, desc: "Ability to surface product, process, and journey improvement insights from interaction data" },
      { name: "Integration & Data", score: av.intData, desc: "API depth, CRM/CCaaS/data platform connectivity, and data export flexibility" },
      { name: "Scale & Governance", score: av.scaleGov, desc: "Enterprise deployment scale, security, compliance, and administrative governance" },
    ];
    return (
      <div><Nav />
        <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "130px 28px 60px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
          <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
              <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
              <a href="/vendors" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Vendors</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
              <a href="/vendors/analytics" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Analytics</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
              <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>{av.name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 32 }}>
              <div style={{ maxWidth: 620 }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", background: "rgba(0,170,255,0.1)", padding: "3px 10px", borderRadius: 4 }}>{av.catLabel}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", padding: "3px 10px", borderRadius: 4 }}>{av.segment}</span>
                </div>
                <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, margin: "0 0 16px" }}>{av.name}</h1>
                <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>{av.summary}</p>
              </div>
              <div style={{ flexShrink: 0, textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", border: `3px solid ${scoreColor}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, color: scoreColor }}>{av.score}</span>
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>of {maxScore}</div>
              </div>
            </div>
          </div>
        </section>

        {/* 7 Dimension Scores */}
        <section style={{ background: WARM, padding: "64px 28px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={WRAP}><FadeIn>
            <Section label="Scoring Dimensions" title="Seven dimensions, each scored 2–6.">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }} className="profile-grid">
                {dims.map((d, i) => {
                  const color = d.score >= 6 ? GREEN : d.score >= 5 ? ELECTRIC : d.score >= 4 ? AMBER : RED;
                  return (
                    <div key={i} style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "14px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{d.name}</span>
                        <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color }}>{d.score}<span style={{ fontSize: 12, color: MUTED }}>/6</span></span>
                      </div>
                      <div style={{ width: "100%", height: 5, background: BORDER, borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
                        <div style={{ width: `${(d.score / 6) * 100}%`, height: "100%", background: color, borderRadius: 3 }} />
                      </div>
                      <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>{d.desc}</p>
                    </div>
                  );
                })}
              </div>
            </Section>
          </FadeIn></div>
        </section>

        {/* Category Context */}
        <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "64px 28px" }}>
          <div style={WRAP}><FadeIn>
            <Section label="Market Position" title={`${av.catLabel} — ${av.segment}`} dark>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 20 }}>This vendor is categorized within the {av.catLabel} segment. Scores are most meaningful when compared within the same platform category — a CCaaS platform and an AI-native overlay serve different buying motions.</p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href="/vendors/analytics" style={{ fontSize: 13, fontWeight: 600, color: LIGHT, background: "rgba(255,255,255,0.06)", padding: "8px 16px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)" }}>← Back to Analytics Intelligence</a>
                <a href="/contact" style={{ fontSize: 13, fontWeight: 600, color: "#fff", background: ELECTRIC, padding: "8px 16px", borderRadius: 6 }}>Request a Vendor Briefing</a>
              </div>
            </Section>
          </FadeIn></div>
        </section>

        {/* Community */}
        <section style={{ background: WARM, padding: "64px 28px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={WRAP}><FadeIn>
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "36px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
              <div style={{ maxWidth: 480 }}>
                <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 8 }}>Community Intelligence</span>
                <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>Used {av.name} for analytics? Share what you've seen.</h3>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, margin: 0 }}>Your operational experience helps other CX leaders make better decisions.</p>
              </div>
              <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, flexShrink: 0, boxShadow: "0 4px 18px rgba(0,136,221,0.2)" }}>Share Your Experience</a>
            </div>
          </FadeIn></div>
        </section>

        {/* CTA */}
        <section style={{ background: "#fff", padding: "80px 28px" }}><div style={WRAP}><FadeIn>
          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "48px 36px", textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>Evaluating {av.name} for analytics?</h2>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 500, margin: "0 auto 28px" }}>We can help you evaluate whether {av.name} fits your analytics architecture and operational workflow requirements.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, boxShadow: "0 4px 18px rgba(0,136,221,0.25)" }}>Request a Vendor Briefing</a>
              <a href="/vendors/analytics" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>See All Analytics Vendors →</a>
            </div>
          </div>
        </FadeIn></div></section>

        <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={28} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span></div></div></footer>
      </div>
    );
  }

  // ─── CCaaS VENDOR PROFILE (existing) ───
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
