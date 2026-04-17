import { useState, useEffect, useRef } from "react";

const NAVY = "#0B1D3A";
const DEEP = "#061325";
const ELECTRIC = "#0088DD";
const LIGHT = "#00AAFF";
const ICE = "#E8F4FD";
const WARM = "#F8FAFB";
const SLATE = "#3A4F6A";
const MUTED = "#6B7F99";
const BORDER = "#D8E3ED";

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

const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };
const Label = ({ children, light }) => <span style={{ color: light ? LIGHT : ELECTRIC, fontSize: 11.5, fontWeight: 700, letterSpacing: 2.2, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", display: "block", marginBottom: 12 }}>{children}</span>;
const Title = ({ children, light }) => <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 400, color: light ? "#fff" : NAVY, lineHeight: 1.15, margin: "0 0 16px", letterSpacing: "-0.015em" }}>{children}</h2>;

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
        @media (max-width: 860px) { .nav-links { display: none !important; } .split-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }
      `}</style>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: scrolled ? "rgba(6,19,37,0.96)" : "transparent", backdropFilter: scrolled ? "blur(14px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "all 0.35s", padding: scrolled ? "12px 0" : "20px 0" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LogoMark size={34} />
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 14.5, letterSpacing: 0.4, fontFamily: "'DM Sans', sans-serif" }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span>
          </a>
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {links.map(l => <a key={l.name} href={l.href} style={{ color: l.name === "How to Choose" ? "#fff" : "rgba(255,255,255,0.7)", fontSize: 13.5, fontWeight: l.name === "How to Choose" ? 600 : 500, fontFamily: "'DM Sans', sans-serif", transition: "color 0.2s", borderBottom: l.name === "How to Choose" ? `2px solid ${ELECTRIC}` : "2px solid transparent", paddingBottom: 2 }} onMouseOver={e => e.target.style.color = "#fff"} onMouseOut={e => e.target.style.color = l.name === "How to Choose" ? "#fff" : "rgba(255,255,255,0.7)"}>{l.name}</a>)}
            <a href="/contact" style={{ color: "#fff", fontSize: 13, fontWeight: 600, background: ELECTRIC, padding: "9px 20px", borderRadius: 6, fontFamily: "'DM Sans', sans-serif" }}>Request Briefing</a>
          </div>
        </div>
      </nav>
    </>
  );
}

function Hero() {
  return (
    <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "140px 28px 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
      <div style={{ position: "absolute", top: "-10%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.05) 0%, transparent 70%)" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Home</a>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
            <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>How to Choose</span>
          </div>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div style={{ maxWidth: 680 }}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(34px, 4.5vw, 56px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 24px" }}>
              Buying frameworks that{" "}
              <span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>actually prevent bad decisions.</span>
            </h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 560, fontFamily: "'DM Sans', sans-serif" }}>
              Two buyer's guides with independently scored vendor intelligence. Ten interactive tools that produce scored, actionable output. No placeholder content — everything on this page is live and ready to use.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function FeaturedGuide() {
  const guides = [
    {
      title: "IVA & Conversational AI Buyer's Guide 2026",
      desc: "43 vendors scored across 4 dimensions. The Human Premium workforce framework. Market forecasts through 2029 with Gartner, Forrester, and Opus Research validation.",
      tags: ["43 vendors", "Market forecasts", "Human Premium", "Demo questions", "TCO reality"],
      pages: "25 pages", href: "/research/iva-buyer-guide", edition: "IVA Buyer Guide",
    },
    {
      title: "CCaaS Platform Buyer's Guide 2026",
      desc: "28 platforms scored across 7 weighted dimensions. Individual vendor profiles with strengths, weaknesses, best-fit scenarios, red flags, and competitive context.",
      tags: ["28 platforms", "7 dimensions", "Vendor profiles", "Migration risk", "Negotiation intel"],
      pages: "18 pages", href: "/research/ccaas-buyer-guide", edition: "CCaaS Buyer Guide",
    },
  ];
  return (
    <section style={{ background: WARM, padding: "96px 28px", borderBottom: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ marginBottom: 40 }}>
            <Label>Buyer's Guides</Label>
            <Title>Deep research, independently scored. No vendor sponsorship.</Title>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="split-grid">
          {guides.map((g, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <a href={g.href} style={{ display: "block", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, overflow: "hidden", textDecoration: "none", color: "inherit", transition: "all 0.22s", height: "100%" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,136,221,0.08)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, padding: "28px 24px", display: "flex", alignItems: "center", gap: 16 }}>
                  <LogoMark size={40} light={true} />
                  <div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 1 }}>2026 EDITION</div>
                    <div style={{ fontSize: 15, color: "#fff", fontFamily: "'Instrument Serif', Georgia, serif" }}>{g.edition}</div>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: LIGHT, background: "rgba(0,170,255,0.1)", padding: "3px 10px", borderRadius: 4, fontWeight: 600 }}>{g.pages}</span>
                </div>
                <div style={{ padding: "24px 24px 28px" }}>
                  <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 10px", lineHeight: 1.25 }}>{g.title}</h3>
                  <p style={{ fontSize: 13.5, color: SLATE, lineHeight: 1.65, margin: "0 0 16px" }}>{g.desc}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                    {g.tags.map(t => (<span key={t} style={{ fontSize: 11, color: SLATE, background: ICE, padding: "3px 8px", borderRadius: 4 }}>{t}</span>))}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC }}>Access Guide →</span>
                </div>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function GuidesList() {
  const tools = [
    { title: "TCO Calculator", desc: "Model your true 3-year contact center technology cost — license, implementation, integration, internal labor, and hidden overhead. Compare build vs buy.", href: "/tco-calculator", tag: "Calculator" },
    { title: "CX Maturity Assessment", desc: "Score your organization across strategy, operations, technology, analytics, and governance. 25 questions with immediate results and tier classification.", href: "/tools/cx-maturity", tag: "Assessment" },
    { title: "AI Readiness Assessment", desc: "Evaluate whether your organization is ready for AI deployment across data quality, workflow design, governance, and team readiness.", href: "/tools/ai-readiness", tag: "Assessment" },
    { title: "Experience Scorecard", desc: "Score your customer experience across service quality, channel effectiveness, resolution performance, and customer effort.", href: "/tools/experience-scorecard", tag: "Scorecard" },
    { title: "CX-IT Alignment Tool", desc: "Evaluate the alignment between your CX strategy and IT architecture. Identify gaps that prevent technology from delivering on CX promises.", href: "/tools/cx-it-alignment", tag: "Diagnostic" },
    { title: "Governance Model Builder", desc: "Design your AI governance framework — escalation design, model evaluation, compliance monitoring, and decision authority mapping.", href: "/tools/governance-model", tag: "Framework" },
    { title: "Service Design Canvas", desc: "Map your service interactions across channels, touchpoints, and resolution paths. Identify friction points and automation opportunities.", href: "/tools/service-design", tag: "Canvas" },
    { title: "CX Roadmap Builder", desc: "Build a phased technology roadmap aligned to your maturity level, budget constraints, and operational priorities.", href: "/tools/roadmap-builder", tag: "Planner" },
    { title: "Integration Planner", desc: "Map your integration landscape — CRM, CCaaS, WEM, knowledge, identity — and identify the dependencies that determine deployment success.", href: "/tools/integration-planner", tag: "Planner" },
    { title: "Business Case Builder", desc: "Build the financial justification for CX technology investment with ROI projections, risk-adjusted scenarios, and executive-ready output.", href: "/tools/business-case", tag: "Builder" },
  ];

  return (
    <section style={{ background: "#fff", padding: "96px 28px" }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ maxWidth: 560, marginBottom: 48 }}>
            <Label>Interactive Tools</Label>
            <Title>Ten self-service tools. Each one produces a deliverable you can use immediately.</Title>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, marginTop: 8 }}>Every tool is email-gated with instant results. No waiting, no sales call required. Your scored output is delivered on-screen the moment you complete the assessment.</p>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="split-grid">
          {tools.map((t, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <a href={t.href} style={{ display: "block", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", transition: "all 0.2s", textDecoration: "none", color: "inherit", height: "100%" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.2, textTransform: "uppercase" }}>{t.tag}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: ELECTRIC }}>Launch →</span>
                </div>
                <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, fontWeight: 400, color: NAVY, margin: "0 0 6px" }}>{t.title}</h3>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.55, margin: 0 }}>{t.desc}</p>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function Approach() {
  return (
    <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "96px 28px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "30%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.04) 0%, transparent 70%)" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 580, margin: "0 auto 48px" }}>
            <Label light>Our approach</Label>
            <Title light>Where G2 and Gartner stop, we keep going.</Title>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, marginTop: 8, fontFamily: "'DM Sans', sans-serif" }}>
              Review aggregators tell you what other buyers thought. Analyst firms tell you what quadrant a vendor sits in. We tell you what actually happens when you deploy the platform in your operating model, your vertical, with your integration landscape.
            </p>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {[
            { t: "Architecture-level evaluation", d: "We assess platforms at the orchestration layer level — routing dependencies, data fabric requirements, governance overhead — because feature checklists miss what matters." },
            { t: "Vertical-aware recommendations", d: "A healthcare contact center has different compliance, emotion, and workflow requirements than a retail one. Our recommendations account for regulatory burden, channel mix, and data sensitivity." },
            { t: "Operational honesty", d: "We tell you where vendors struggle. Which integrations break under load. Where the marketing claims diverge from production reality. Every guide includes a vendor traps section for a reason." },
            { t: "Decision-ready output", d: "Every framework, checklist, and assessment produces a tangible deliverable. A score. A shortlist. A risk map. Something you can put in front of your leadership team Monday morning." },
          ].map((item, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "28px 24px" }}>
                <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 19, fontWeight: 400, color: "#fff", margin: "0 0 8px" }}>{item.t}</h3>
                <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{item.d}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section style={{ background: WARM, padding: "96px 28px", borderTop: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
            <Title>Need a recommendation tailored to your situation?</Title>
            <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.65, margin: "8px 0 32px", fontFamily: "'DM Sans', sans-serif" }}>
              The guides above cover common decision patterns. If your situation has specific constraints — regulatory, architectural, timeline, or political — a working session will get you further, faster.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", boxShadow: `0 4px 18px rgba(0,136,221,0.2)` }}>Request a Working Session</a>
              <a href="/platforms-and-tech" style={{ background: "#fff", border: `1px solid ${BORDER}`, color: NAVY, fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif" }}>Explore Platforms & Tech</a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function Footer() {
  return (
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
  );
}

export default function HowToChoose() {
  return (
    <div>
      <Nav />
      <Hero />
      <FeaturedGuide />
      <GuidesList />
      <Approach />
      <CTA />
      <Footer />
    </div>
  );
}
