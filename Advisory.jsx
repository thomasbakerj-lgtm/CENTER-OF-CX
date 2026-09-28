import { useState, useEffect, useRef } from "react";
import { HOUSE, PILLARS, LINE, alpha } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";
import { VENDOR_PROFILE_COUNT } from "./src/lib/seo.js";

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
        a { text-decoration: none; color: inherit; }
        @media (max-width: 860px) { .nav-links { display: none !important; } .split-grid { grid-template-columns: 1fr !important; gap: 40px !important; } .engage-grid { grid-template-columns: 1fr !important; } }
      `}</style>
      
    </>
  );
}

function Hero() {
  return (
    <section style={{ background: HOUSE.navy, padding: "140px 28px 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "none", backgroundSize: "64px 64px" }} />
      <div style={{ position: "absolute", bottom: "-15%", left: "-8%", width: 500, height: 500, borderRadius: "50%", background: "none" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <a href="/" style={{ color: HOUSE.body, fontSize: 13, fontFamily: FONT }}>Home</a>
            <span style={{ color: HOUSE.body, fontSize: 13 }}>/</span>
            <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600, fontFamily: FONT }}>Advisory</span>
          </div>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div style={{ maxWidth: 680 }}>
            <h1 style={{ fontFamily: FONT, fontSize: "clamp(34px, 4.5vw, 56px)", fontWeight: 400, color: HOUSE.mist, lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 24px" }}>
              Independent guidance for{" "}
              <span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>high-stakes CX decisions.</span>
            </h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: HOUSE.body, lineHeight: 1.7, maxWidth: 560, fontFamily: FONT }}>
              Platform selection. AI readiness. Vendor evaluation. Operating model design. We bring the strategic clarity that vendor sales teams and internal politics make difficult.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function HowWeWork() {
  return (
    <section style={{ background: WARM, padding: "96px 28px", borderBottom: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }} className="split-grid">
          <FadeIn>
            <div>
              <Label>How we work</Label>
              <Title>We connect you with the right consultant for your challenge.</Title>
              <div style={{ fontSize: 15.5, color: SLATE, lineHeight: 1.8, marginTop: 12, fontFamily: FONT }}>
                <p style={{ marginBottom: 20 }}>
                  We help CX and contact center leaders make better technology and strategy decisions. Our work focuses on the questions that matter before implementation begins, which platform fits your operating model, whether your organization is ready for AI at scale, which vendors deserve a deeper look, and which ones you should walk away from.
                </p>
                <p>
                  We are the intelligence platform, not the consulting firm. When you need expert guidance on platform selection, AI strategy, or operational transformation, we match you with vetted consultants who specialize in your vertical and stack.
                </p>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ background: HOUSE.ink, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "32px 28px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 20, fontFamily: FONT }}>How engagement works</div>
              {[
                { step: "01", text: "You request a working session. We ask a few questions to understand your situation before we meet." },
                { step: "02", text: "We hold a 60-minute strategy session. No pitch deck. No sales team. Just a direct conversation about your CX challenges." },
                { step: "03", text: "We deliver a clear recommendation: what to do, what to evaluate, what to avoid, and why." },
                { step: "04", text: "If you need implementation support, we introduce you to vetted partners who fit your vertical and stack." },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < 3 ? `1px solid ${BORDER}` : "none" }}>
                  <span style={{ fontFamily: FONT, fontSize: 22, color: ELECTRIC, flexShrink: 0, width: 28 }}>{s.step}</span>
                  <span style={{ fontSize: 14, color: SLATE, lineHeight: 1.55, fontFamily: FONT }}>{s.text}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function Offerings() {
  const services = [
    {
      title: "Platform selection",
      desc: "CCaaS evaluation, vendor shortlisting, and architecture-level comparison tailored to your operating model, vertical requirements, and integration landscape. We go deeper than feature matrices: we assess orchestration readiness, AI maturity, and long-term vendor trajectory.",
      who: "CX leaders, CIOs, and transformation leads evaluating CCaaS platforms",
      output: "Vendor shortlist with scored evaluation, architecture fit analysis, and negotiation guidance",
    },
    {
      title: "AI readiness assessment",
      desc: "A structured evaluation of whether your data, workflows, governance, and team structure are ready for AI-driven service delivery. Covers conversational AI, agent assist, autonomous agents, and QA automation, with an honest assessment of what's realistic on your timeline.",
      who: "CX and IT leaders planning AI pilots or scaling existing AI programs",
      output: "Readiness scorecard, gap analysis, phased rollout recommendation, and risk map",
    },
    {
      title: "Vendor shortlisting",
      desc: `You tell us what you need. We draw on our ${VENDOR_PROFILE_COUNT} vendor profiles and the research behind them to produce a short list of vendors that fit your situation, with an honest account of where each one fits and where each one will create friction.`,
      who: "Procurement leads, CX directors, and operations executives running vendor evaluations",
      output: "Curated vendor shortlist with strengths, weaknesses, competitive context, and red flags",
    },
    {
      title: "Operating model design",
      desc: "How your CX organization should be structured to support modern service delivery, including the relationship between centralized strategy, contact center operations, digital channels, AI governance, and workforce management.",
      who: "SVPs of CX, COOs, and transformation leaders redesigning service operations",
      output: "Operating model blueprint, RACI framework, governance structure, and change roadmap",
    },
    {
      title: "Executive briefings",
      desc: "A focused session for leadership teams who need to understand where the CX technology landscape is heading and what that means for their investment decisions. Covers CCaaS evolution, AI's operational impact, orchestration architecture, and vendor market dynamics.",
      who: "C-suite, board members, PE operating partners, and senior leadership teams",
      output: "Executive briefing deck, market context summary, and strategic recommendation",
    },
    {
      title: "Transformation workshops",
      desc: "A structured working session (half-day or full-day) with your cross-functional team to align on CX transformation priorities, technology decisions, and execution sequencing. We facilitate the hard conversations between CX, IT, operations, and finance.",
      who: "Cross-functional leadership teams at the start of a transformation initiative",
      output: "Prioritized transformation roadmap, stakeholder alignment, and 90-day action plan",
    },
  ];

  return (
    <section style={{ background: HOUSE.ink, padding: "96px 28px" }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ maxWidth: 560, marginBottom: 48 }}>
            <Label>How we connect you</Label>
            <Title>Six ways to engage. Each one produces a clear deliverable.</Title>
          </div>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {services.map((s, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div style={{
                border: `1px solid ${BORDER}`, borderRadius: 12, padding: "32px 28px",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
                onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.boxShadow = "none"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}
              >
                <h3 style={{ fontFamily: FONT, fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 10px" }}>{s.title}</h3>
                <p style={{ fontSize: 14.5, color: SLATE, lineHeight: 1.7, margin: "0 0 20px", fontFamily: FONT }}>{s.desc}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="engage-grid">
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, fontFamily: FONT }}>Best for</div>
                    <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.55, margin: 0, fontFamily: FONT }}>{s.who}</p>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, fontFamily: FONT }}>You walk away with</div>
                    <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.55, margin: 0, fontFamily: FONT }}>{s.output}</p>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function Boundaries() {
  return (
    <section style={{ background: HOUSE.navy, padding: "96px 28px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "40%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "none" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 580, margin: "0 auto 48px" }}>
            <Label light>Clear boundaries</Label>
            <Title light>What we do, what we leave to others, and why.</Title>
            <p style={{ fontSize: 15, color: HOUSE.body, lineHeight: 1.65, marginTop: 8, fontFamily: FONT }}>
              We keep intelligence and consulting separate because it protects the integrity of both. Here's exactly where our work starts and stops.
            </p>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="split-grid">
          <FadeIn delay={0.05}>
            <div style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, borderRadius: 12, padding: "32px 28px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20, fontFamily: FONT }}>What we do</div>
              {[
                "Evaluate platforms at the architecture and operations level",
                "Produce scored vendor shortlists with honest assessments",
                "Assess AI readiness across data, workflows, governance, and team structure",
                "Design operating models for modern CX organizations",
                "Facilitate hard conversations between CX, IT, operations, and finance",
                "Connect you with vetted implementation partners when you're ready",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0" }}>
                  <span style={{ color: LIGHT, fontSize: 13, flexShrink: 0 }}>+</span>
                  <span style={{ fontSize: 13.5, color: HOUSE.body, lineHeight: 1.5, fontFamily: FONT }}>{item}</span>
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, borderRadius: 12, padding: "32px 28px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: HOUSE.body, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20, fontFamily: FONT }}>What we leave to partners</div>
              {[
                "Platform implementation and deployment",
                "System integration and custom development",
                "Ongoing managed services and support",
                "Staffing, recruiting, and BPO operations",
                "Vendor contract negotiation (consultants advise and negotiate)",
                "Change management and training delivery",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0" }}>
                  <span style={{ color: HOUSE.body, fontSize: 13, flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: 13.5, color: HOUSE.body, lineHeight: 1.5, fontFamily: FONT }}>{item}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function WhoItsFor() {
  const scenarios = [
    { trigger: "You're evaluating CCaaS platforms", detail: "and the vendor demos are starting to blur together. You need someone who has seen many implementations to tell you which ones actually fit your operating model." },
    { trigger: "Your AI pilot isn't scaling", detail: "and leadership wants to know why. You need a structured assessment of what's blocking scale: data quality, workflow gaps, governance holes, or the wrong vendor." },
    { trigger: "You inherited a fragmented stack", detail: "from a previous team and need to decide what stays, what goes, and how to sequence the transition without disrupting service levels." },
    { trigger: "Your board is asking about AI in CX", detail: "and you need an executive briefing that's grounded in operational reality, with clear recommendations they can act on." },
    { trigger: "CX and IT can't align", detail: "on technology priorities. You need a facilitated workshop that gets both teams to a shared roadmap with clear ownership and sequencing." },
    { trigger: "You're spending too much per contact", detail: "and you know automation should help, but your containment rates aren't moving. You need someone to diagnose the bottleneck." },
  ];

  return (
    <section style={{ background: WARM, padding: "96px 28px", borderTop: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ maxWidth: 560, marginBottom: 48 }}>
            <Label>When to engage</Label>
            <Title>If any of these sound familiar, we should talk.</Title>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))", gap: 16 }}>
          {scenarios.map((s, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div style={{ background: HOUSE.ink, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", height: "100%", transition: "border-color 0.2s" }}
                onMouseOver={e => e.currentTarget.style.borderColor = ELECTRIC}
                onMouseOut={e => e.currentTarget.style.borderColor = BORDER}>
                <h3 style={{ fontFamily: FONT, fontSize: 14.5, fontWeight: 600, color: NAVY, margin: "0 0 6px", lineHeight: 1.4 }}>{s.trigger}</h3>
                <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.55, margin: 0, fontFamily: FONT }}>{s.detail}</p>
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
    <section style={{ background: HOUSE.ink, padding: "96px 28px", borderTop: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ background: HOUSE.navy, borderRadius: 16, padding: "64px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "none" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2 style={{ fontFamily: FONT, fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 400, color: HOUSE.mist, lineHeight: 1.15, margin: "0 0 16px" }}>
                Tell us your challenge. We will match you with the right consultant.
              </h2>
              <p style={{ fontSize: 15.5, color: HOUSE.body, lineHeight: 1.65, maxWidth: 480, margin: "0 auto 32px", fontFamily: FONT }}>
                60 minutes. No pitch deck. A direct conversation about your CX challenges with someone who understands both the strategy and the operations.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                <a href="/contact" style={{ background: HOUSE.action, color: HOUSE.paper, fontSize: 15, fontWeight: 600, padding: "15px 32px", borderRadius: 8, fontFamily: FONT, boxShadow: "none" }}>Find a Consultant →</a>
                <a href="/platforms-and-tech" style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, color: HOUSE.mist, fontSize: 15, fontWeight: 500, padding: "15px 32px", borderRadius: 8, fontFamily: FONT }}>Explore the Platform →</a>
              </div>
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

export default function Advisory() {
  return (
    <div>
      <Nav />
      <Hero />
      <HowWeWork />
      <Offerings />
      <Boundaries />
      <WhoItsFor />
      <CTA />
      <Footer />
    </div>
  );
}