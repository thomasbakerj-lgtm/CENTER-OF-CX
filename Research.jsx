import { useState, useEffect, useRef } from "react";
import { HOUSE, PILLARS, LINE, alpha } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";

const NAVY = HOUSE.mist;
const DEEP = HOUSE.ink;
const ELECTRIC = PILLARS.research.onDark;
const LIGHT = PILLARS.research.onDark;
const ICE = HOUSE.navy;
const WARM = HOUSE.navy;
const SLATE = HOUSE.body;
const MUTED = HOUSE.muted;
const BORDER = alpha(HOUSE.mist, LINE.hair);

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
const Label = ({ children, light }) => <span style={{ color: light ? LIGHT : ELECTRIC, fontSize: 11.5, fontWeight: 700, letterSpacing: 2.2, textTransform: "uppercase", fontFamily: FONT, display: "block", marginBottom: 12 }}>{children}</span>;
const Title = ({ children, light }) => <h2 style={{ fontFamily: FONT, fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 400, color: HOUSE.mist, lineHeight: 1.15, margin: "0 0 16px", letterSpacing: "-0.015em" }}>{children}</h2>;

function LogoMark({ size = 34, light = true }) {
  const arcColor = HOUSE.mist;
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
    { name: "Research", href: "/research" },
    { name: "Vendors", href: "/vendors" },
    { name: "The Human Premium", href: "/human-premium" },
  ];
  return (
    <>
      <style>{`
        
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ; -webkit-font-smoothing: antialiased; }
        a { text-decoration: none; color: inherit; }
        @media (max-width: 860px) { .nav-links { display: none !important; } .feat-grid { grid-template-columns: 1fr !important; } .cat-tabs { flex-wrap: wrap !important; } }
      `}</style>
      
    </>
  );
}

function Hero() {
  return (
    <section style={{ background: HOUSE.navy, padding: "140px 28px 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "none", backgroundSize: "64px 64px" }} />
      <div style={{ position: "absolute", bottom: "-15%", right: "-8%", width: 500, height: 500, borderRadius: "50%", background: "none" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <a href="/" style={{ color: HOUSE.body, fontSize: 13, fontFamily: FONT }}>Home</a>
            <span style={{ color: HOUSE.body, fontSize: 13 }}>/</span>
            <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600, fontFamily: FONT }}>Research & Insight</span>
          </div>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div style={{ maxWidth: 680 }}>
            <h1 style={{ fontFamily: FONT, fontSize: "clamp(34px, 4.5vw, 56px)", fontWeight: 400, color: HOUSE.mist, lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 24px" }}>
              No press releases.{" "}
              <span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>No vendor ghostwriting.</span>
            </h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: HOUSE.body, lineHeight: 1.7, maxWidth: 560, fontFamily: FONT }}>
              Opinionated research, market analysis, and operational insight written for CX leaders who make decisions. Everything here is editorially independent and grounded in how contact centers actually operate.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function ContentTypes() {
  const types = [
    { tag: "CX Reality Checks", color: PILLARS.research.onDark, desc: "The myths and assumptions that cost organizations money. We name them, quantify the damage, and explain what to do instead." },
    { tag: "Market Maps", color: PILLARS.research.onDark, desc: "Opinionated views of vendor landscapes by category: how each market splits, what is changing, and why the standard analyst maps miss the picture." },
    { tag: "Operator Briefings", color: PILLARS.research.onDark, desc: "What's actually working in production environments. Real operational patterns from contact centers that have moved past the pilot stage." },
    { tag: "Future Forecasts", color: PILLARS.research.onDark, desc: "Where the CX technology and operations landscape is heading, with explicit confidence levels. We tell you what we're sure about and what we're guessing." },
  ];

  return (
    <section style={{ background: WARM, padding: "96px 28px", borderBottom: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ maxWidth: 560, marginBottom: 48 }}>
            <Label>Four content types</Label>
            <Title>Everything we publish falls into one of these categories.</Title>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {types.map((t, i) => (
            <FadeIn key={i} delay={i * 0.06}>
              <div style={{ background: HOUSE.ink, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "28px 24px", borderTop: `3px solid ${t.color}`, height: "100%" }}>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: t.color, letterSpacing: 0.5, margin: "0 0 8px", fontFamily: FONT }}>{t.tag}</h3>
                <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6, margin: 0, fontFamily: FONT }}>{t.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedArticles() {
  const featured = [
    {
      tag: "Buyer's Guide", color: PILLARS.research.onDark, read: "25 pages",
      title: "IVA & Conversational AI Platform Buyer's Guide 2026",
      desc: "Phase 1 edition. 50 vendors across 7 market categories; its scores are withdrawn on the site until the category is researched under the current methodology. The Human Premium workforce framework. Market forecasts through 2029 with validated Gartner, Forrester, and Opus Research data. Architecture eras, buyer scenarios, demo questions, TCO reality, and implementation pitfalls.",
      href: "/research/iva-buyer-guide",
    },
    {
      tag: "Buyer's Guide", color: PILLARS.research.onDark, read: "19 pages",
      title: "CCaaS Platform Buyer's Guide 2026",
      desc: "Phase 1 edition (April 2026). 28 CCaaS platforms; its scores and tiers are withdrawn on the site while current research is published. Operating-model fit, migration risk, hidden costs, and the RFP questions most evaluations skip.",
      href: "/research/ccaas-buyer-guide",
    },
    {
      tag: "CX Reality Check", color: PILLARS.research.onDark, read: "8 min",
      title: "Why Your CCaaS Migration Didn't Cut Costs",
      desc: "The pitch was compelling: move to the cloud, reduce infrastructure spend, pay per seat. Two years later, most organizations are spending the same or more. Here's where the money actually went, and what the vendors left out of the business case.",
    },
    {
      tag: "Market Map", color: PILLARS.research.onDark, read: "12 min",
      title: "Agent Assist in 2026: Who's Real vs Who's Marketing",
      desc: "Every CCaaS vendor now claims agent assist capabilities. The standalone players are fighting for survival. We look at real-time guidance quality, knowledge retrieval depth, summarization accuracy and adoption.",
    },
  ];

  return (
    <section style={{ background: HOUSE.ink, padding: "96px 28px" }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ marginBottom: 48 }}>
            <Label>Featured</Label>
            <Title>Start here.</Title>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="feat-grid">
          {featured.map((a, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <a href={a.href || "#"} style={{ display: "block", border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden", cursor: "pointer", transition: "all 0.22s", height: "100%", textDecoration: "none", color: "inherit" }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "none"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ height: 5, background: a.color }} />
                <div style={{ padding: "32px 28px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: a.color, letterSpacing: 1.2, textTransform: "uppercase", fontFamily: FONT }}>{a.tag}</span>
                    <span style={{ fontSize: 12, color: MUTED, fontFamily: FONT }}>{a.read}</span>
                  </div>
                  <h3 style={{ fontFamily: FONT, fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 12px", lineHeight: 1.25 }}>{a.title}</h3>
                  <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, margin: "0 0 20px", fontFamily: FONT }}>{a.desc}</p>
                  <span style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC, fontFamily: FONT }}>{a.href ? "Access Guide →" : "Read →"}</span>
                </div>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function AllArticles() {
  const articles = [
    { tag: "Operator Briefing", color: PILLARS.research.onDark, read: "10 min", title: "What 50 to 70% Automation Actually Requires", desc: "The target-state numbers are everywhere. The operational prerequisites are rarely discussed. Here's what your data, workflows, governance, and team structure need to look like before automation at that level becomes realistic." },
    { tag: "Future Forecast", color: PILLARS.research.onDark, read: "14 min", title: "The AI Worker Thesis: A Confidence Level Assessment", desc: "Autonomous AI agents handling multi-step customer interactions end-to-end. The technology is approaching readiness. The governance, liability, and customer acceptance frameworks are lagging. We break down what's likely, what's possible, and what's premature." },
    { tag: "CX Reality Check", color: PILLARS.research.onDark, read: "7 min", title: "Payment Friction Is Your Silent Cost Center", desc: "Payment issues drive 3 to 12% of all inbound contact volume. Most organizations don't measure this because it spans CX, IT, and finance. Here's the math that makes your CFO pay attention." },
    { tag: "Market Map", color: PILLARS.research.onDark, read: "15 min", title: "The 2026 Digital Engagement Landscape: 50 Platforms That Matter", desc: "The digital engagement market is bloated, inconsistent, and full of legacy players pretending to be modern. This is the first operator-grade classification: divided into future-forward platforms and everything else." },
    { tag: "Operator Briefing", color: PILLARS.research.onDark, read: "9 min", title: "ACD Routing Is Dead. Here's What Replaced It.", desc: "Skills-based routing was the right answer in 2015. In 2026, intent-driven orchestration across seven layers determines who, or what, handles each interaction. The vendors who understand this and the ones who are still catching up." },
    { tag: "Future Forecast", color: PILLARS.research.onDark, read: "11 min", title: "CCaaS Becomes Commodity Infrastructure by 2030", desc: "The platform that defines your contact center today will be a utility layer under an orchestration engine within five years. Here's what that transition looks like, who benefits, and what the vendor consolidation timeline probably looks like." },
    { tag: "CX Reality Check", color: PILLARS.research.onDark, read: "6 min", title: "Your QA Program Is Sampling 2% and Calling It Quality", desc: "Manual QA at 2% sample rates was acceptable when it was all we had. AI-powered evaluation across 100% of interactions changes the math on staffing, coaching, and performance management entirely." },
    { tag: "Market Map", color: PILLARS.research.onDark, read: "13 min", title: "IVA Market Map: Categories and Where the Market Splits", desc: "A Phase 1 view of 50 IVA vendors across conversational autonomy, multi-channel coverage, orchestration depth and analytics. Its scores are withdrawn on the site until the category is researched under the current methodology." },
  ];

  return (
    <section style={{ background: WARM, padding: "96px 28px", borderTop: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ marginBottom: 48 }}>
            <Label>All research & insight</Label>
            <Title>The full library.</Title>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
          {articles.map((a, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div style={{ background: HOUSE.ink, border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden", cursor: "pointer", transition: "all 0.22s", height: "100%" }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "none"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ height: 4, background: a.color }} />
                <div style={{ padding: "24px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: a.color, letterSpacing: 1.2, textTransform: "uppercase", fontFamily: FONT }}>{a.tag}</span>
                    <span style={{ fontSize: 12, color: MUTED, fontFamily: FONT }}>{a.read}</span>
                  </div>
                  <h3 style={{ fontFamily: FONT, fontSize: 19, fontWeight: 400, color: NAVY, margin: "0 0 8px", lineHeight: 1.3 }}>{a.title}</h3>
                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, margin: "0 0 16px", fontFamily: FONT }}>{a.desc}</p>
                  <span style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC, fontFamily: FONT }}>Read →</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function SubscribeCTA() {
  return (
    <section style={{ background: HOUSE.navy, padding: "96px 28px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "30%", left: "50%", width: 600, height: 600, borderRadius: "50%", transform: "translateX(-50%)", background: "none" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
            <Title light>Get the research as it publishes.</Title>
            <p style={{ fontSize: 15, color: HOUSE.body, lineHeight: 1.65, margin: "8px 0 32px", fontFamily: FONT }}>
              Vendor intelligence, market shifts, and operational insights delivered to your inbox. Written for CX leaders who make technology and strategy decisions. Occasional emails. No filler.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <a href="/subscribe" style={{ background: HOUSE.action, color: HOUSE.paper, fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, fontFamily: FONT, boxShadow: "none" }}>Subscribe to Insights</a>
              <a href="/contact" style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, color: HOUSE.mist, fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8, fontFamily: FONT }}>Connect with a Consultant →</a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function Footer() {
  return (
    null
  );
}

function EcosystemCallout() {
  return (
    <section style={{ background: HOUSE.ink, padding: "64px 28px", borderTop: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "32px 28px", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 280 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase" }}>Beyond our research</span>
              <h3 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 400, color: NAVY, margin: "6px 0 8px" }}>The CX Ecosystem</h3>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, margin: 0 }}>15 publications, research hubs, and communities that matter for CX and contact center professionals. We curate the destinations worth your time.</p>
            </div>
            <a href="/cx-ecosystem" style={{ background: HOUSE.action, color: HOUSE.paper, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8, flexShrink: 0 }}>Explore the Ecosystem →</a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default function Research() {
  return (
    <div>
      <Nav />
      <Hero />
      <ContentTypes />
      <FeaturedArticles />
      <AllArticles />
      <EcosystemCallout />
      <SubscribeCTA />
      <Footer />
    </div>
  );
}
