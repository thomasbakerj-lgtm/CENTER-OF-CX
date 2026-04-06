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
            {links.map(l => <a key={l.name} href={l.href} style={{ color: l.name === "Vendors" ? "#fff" : "rgba(255,255,255,0.7)", fontSize: 13.5, fontWeight: l.name === "Vendors" ? 600 : 500, fontFamily: "'DM Sans', sans-serif", transition: "color 0.2s", borderBottom: l.name === "Vendors" ? `2px solid ${ELECTRIC}` : "2px solid transparent", paddingBottom: 2 }} onMouseOver={e => e.target.style.color = "#fff"} onMouseOut={e => e.target.style.color = l.name === "Vendors" ? "#fff" : "rgba(255,255,255,0.7)"}>{l.name}</a>)}
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
      <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.05) 0%, transparent 70%)" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Home</a>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
            <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Vendors</span>
          </div>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 64, alignItems: "center" }} className="split-grid">
            <div>
              <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(34px, 4.5vw, 56px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 24px" }}>
                350+ vendors.{" "}
                <span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Scored, mapped, and evaluated.</span>
              </h1>
              <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 520, fontFamily: "'DM Sans', sans-serif" }}>
                Every vendor is assessed at the architecture level using proprietary scoring rubrics. We evaluate orchestration readiness, AI maturity, vertical fit, and operational impact. Inclusion requires demonstrated capability.
              </p>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "28px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { n: "350+", l: "Vendors assessed" },
                  { n: "9", l: "Decision domains" },
                  { n: "7", l: "Orchestration layers" },
                  { n: "10", l: "Scoring dimensions" },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center", padding: "12px 0" }}>
                    <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: LIGHT }}>{s.n}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'DM Sans', sans-serif" }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function Stance() {
  return (
    <section style={{ background: WARM, padding: "64px 28px", borderBottom: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: 16, maxWidth: 800 }}>
            <div style={{ width: 4, height: 48, background: ELECTRIC, borderRadius: 2, flexShrink: 0 }} />
            <p style={{ fontSize: 16, color: SLATE, lineHeight: 1.7, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
              This directory is curated. Vendors earn coverage through demonstrated capability, assessed through our proprietary scoring rubrics. We evaluate architecture, orchestration readiness, AI maturity, and operational fit. Every assessment is editorially independent.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function BrowseByCategory() {
  const categories = [
    { title: "Core CX Platforms", sub: "CCaaS", count: "44", vendors: "Genesys, NICE, Five9, AWS Connect, Talkdesk, 8x8, Cisco, Zoom", desc: "The foundational platform for voice, digital, routing, and workforce management." },
    { title: "Customer Automation & Self-Service AI", sub: "IVA · Bots · Autonomous Resolution", count: "50", vendors: "Kore.ai, Cognigy, Yellow.ai, LivePerson, PolyAI, Amelia, Nuance", desc: "From legacy IVAs to LLM-native virtual assistants and autonomous AI workers." },
    { title: "Agent Assist & Knowledge", sub: "Real-time Intelligence", count: "30+", vendors: "Uniphore, Observe.AI, Cresta, Coveo, Shelf, Guru, Bloomfire", desc: "Real-time guidance, knowledge retrieval, summarization, and next-best-action." },
    { title: "Workforce & Quality Management", sub: "WEM · QM · WFM", count: "25+", vendors: "NICE, Verint, Calabrio, Genesys WEM, Five9, Playvox", desc: "Forecasting, scheduling, quality monitoring, coaching, and AI-powered QA." },
    { title: "Experience Analytics & VoC", sub: "Speech · Text · Journey", count: "53", vendors: "CallMiner, Observe.AI, Qualtrics, Verint, Genesys, Clarabridge", desc: "Sentiment, topic analysis, root cause detection, and cross-channel journey patterns." },
    { title: "CX Orchestration & Workflow", sub: "ACD · Routing · Integration", count: "50", vendors: "MuleSoft, Workato, Camunda, Pega, UiPath, Genesys, NICE", desc: "How interactions get routed, how systems share data, and how workflows execute." },
    { title: "Digital Engagement", sub: "Chat · Messaging · Social", count: "50", vendors: "Ada, Intercom, Sprinklr, Zendesk, Salesforce DE, Khoros, Gladly", desc: "Multi-channel digital engagement platforms, CPaaS, and conversational messaging." },
    { title: "Payments, Identity & Trust", sub: "PCI · Auth · Fraud", count: "50+", vendors: "Stripe, Adyen, Worldpay, Forter, Sift, BioCatch, Checkout.com", desc: "Payment processing, PCI compliance, authentication, and fraud prevention in CX." },
    { title: "CX & AI Governance", sub: "Compliance · Model Risk", count: "Emerging", vendors: "Framework-driven — governance tooling is still consolidating", desc: "Compliance, model evaluation, escalation design, and AI auditability." },
  ];

  return (
    <section style={{ background: "#fff", padding: "96px 28px" }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ maxWidth: 560, marginBottom: 48 }}>
            <Label>Browse by decision domain</Label>
            <Title>Nine categories. Each one scored with a proprietary rubric.</Title>
          </div>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {categories.map((c, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 28px", cursor: "pointer", transition: "all 0.22s" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,136,221,0.06)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 20 }}>
                  <div style={{ flex: 1, minWidth: 280 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>{c.sub}</span>
                      <span style={{ fontSize: 11, color: MUTED, background: WARM, padding: "2px 8px", borderRadius: 4, fontFamily: "'DM Sans', sans-serif" }}>{c.count} vendors</span>
                    </div>
                    <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 6px" }}>{c.title}</h3>
                    <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.55, margin: "0 0 12px", fontFamily: "'DM Sans', sans-serif" }}>{c.desc}</p>
                    <p style={{ fontSize: 12.5, color: SLATE, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                      <span style={{ fontWeight: 600 }}>Key vendors: </span>{c.vendors}
                    </p>
                  </div>
                  <a href="/platforms-and-tech" style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC, fontFamily: "'DM Sans', sans-serif", flexShrink: 0, paddingTop: 4 }}>Explore →</a>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowWeEvaluate() {
  return (
    <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "96px 28px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "30%", left: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.04) 0%, transparent 70%)" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 580, margin: "0 auto 56px" }}>
            <Label light>How we evaluate</Label>
            <Title light>Proprietary rubrics built for operational reality.</Title>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {[
            { t: "Architecture-level scoring", d: "We evaluate at the orchestration layer level. Routing dependencies, data fabric requirements, API maturity, event-driven capability, and governance overhead. Feature checklists miss what matters — we go deeper." },
            { t: "Weighted dimension model", d: "Each category uses a custom rubric with 7–10 weighted scoring dimensions. Vendors receive granular scores (High / Med-High / Med / Low-Med / Low) that map to real operational implications." },
            { t: "Maturity tiering", d: "Vendors are placed into four maturity tiers — Leaders, Advancers, Developers, and Emerging — based on weighted total scores. Our bell curve distributions show exactly where the market clusters and where the gaps are." },
            { t: "Vertical and buyer context", d: "A vendor that's strong for retail may break in healthcare. Our evaluations include vertical fit signals, regulated-readiness indicators, and buyer-type alignment (enterprise vs mid-market vs SMB)." },
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

function VendorPagePreview() {
  return (
    <section style={{ background: WARM, padding: "96px 28px", borderTop: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 580, margin: "0 auto 48px" }}>
            <Label>Individual vendor pages</Label>
            <Title>Every vendor gets an honest assessment.</Title>
            <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.65, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
              Each vendor page follows a consistent structure designed to help buyers make decisions faster.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "40px 36px", maxWidth: 700, margin: "0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { label: "What they do well", desc: "Core strengths backed by our scoring data. Where the platform genuinely excels and which buyer profiles benefit most." },
                { label: "Where they break", desc: "Honest assessment of limitations, integration challenges, vertical gaps, and the scenarios where the platform struggles." },
                { label: "Best-fit customers", desc: "The operating model, vertical, and scale profile where this vendor delivers the strongest outcomes." },
                { label: "Red flags", desc: "Contract terms, pricing traps, implementation risks, and the patterns we've seen cause problems for buyers." },
                { label: "Competitive context", desc: "How this vendor compares to direct alternatives, including head-to-head scoring on the dimensions that matter for your situation." },
                { label: "Advisory intro", desc: "If this vendor fits your needs, we connect you with a vetted technology partner who specializes in their deployment." },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 16, padding: "12px 0", borderBottom: i < 5 ? `1px solid ${BORDER}` : "none" }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: `${ELECTRIC}10`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: ELECTRIC }}>{i + 1}</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: 14.5, fontWeight: 600, color: NAVY, margin: "0 0 3px", fontFamily: "'DM Sans', sans-serif" }}>{item.label}</h4>
                    <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.55, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section style={{ background: "#fff", padding: "96px 28px", borderTop: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
            <Title>Need a shortlist tailored to your situation?</Title>
            <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.65, margin: "8px 0 32px", fontFamily: "'DM Sans', sans-serif" }}>
              Browsing 350+ vendors takes time. Tell us your operating model, vertical, and constraints — we'll deliver a scored shortlist of 3–5 vendors with honest assessments of each one.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", boxShadow: `0 4px 18px rgba(0,136,221,0.2)` }}>Request a Vendor Shortlist</a>
              <a href="/how-to-choose" style={{ background: "#fff", border: `1px solid ${BORDER}`, color: NAVY, fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif" }}>Browse Buyer Guides</a>
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

export default function Vendors() {
  return (
    <div>
      <Nav />
      <Hero />
      <Stance />
      <BrowseByCategory />
      <HowWeEvaluate />
      <VendorPagePreview />
      <CTA />
      <Footer />
    </div>
  );
}
