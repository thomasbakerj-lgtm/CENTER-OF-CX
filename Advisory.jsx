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
        @media (max-width: 860px) { .nav-links { display: none !important; } .split-grid { grid-template-columns: 1fr !important; gap: 40px !important; } .engage-grid { grid-template-columns: 1fr !important; } }
      `}</style>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: scrolled ? "rgba(6,19,37,0.96)" : "transparent", backdropFilter: scrolled ? "blur(14px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "all 0.35s", padding: scrolled ? "12px 0" : "20px 0" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LogoMark size={34} />
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 14.5, letterSpacing: 0.4, fontFamily: "'DM Sans', sans-serif" }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span>
          </a>
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {links.map((l, i) => <a key={l.name} href={l.href} style={{ color: l.name === "Advisory" ? "#fff" : "rgba(255,255,255,0.7)", fontSize: 13.5, fontWeight: l.name === "Advisory" ? 600 : 500, fontFamily: "'DM Sans', sans-serif", transition: "color 0.2s", borderBottom: l.name === "Advisory" ? `2px solid ${ELECTRIC}` : "2px solid transparent", paddingBottom: 2 }} onMouseOver={e => e.target.style.color = "#fff"} onMouseOut={e => e.target.style.color = l.name === "Advisory" ? "#fff" : "rgba(255,255,255,0.7)"}>{l.name}</a>)}
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
      <div style={{ position: "absolute", bottom: "-15%", left: "-8%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.05) 0%, transparent 70%)" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Home</a>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
            <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Advisory</span>
          </div>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div style={{ maxWidth: 680 }}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(34px, 4.5vw, 56px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 24px" }}>
              Independent guidance for{" "}
              <span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>high-stakes CX decisions.</span>
            </h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 560, fontFamily: "'DM Sans', sans-serif" }}>
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
              <Title>Advisory that stays on the decision side of the line.</Title>
              <div style={{ fontSize: 15.5, color: SLATE, lineHeight: 1.8, marginTop: 12, fontFamily: "'DM Sans', sans-serif" }}>
                <p style={{ marginBottom: 20 }}>
                  We help CX and contact center leaders make better technology and strategy decisions. Our work focuses on the questions that matter before implementation begins — which platform fits your operating model, whether your organization is ready for AI at scale, which vendors deserve a deeper look, and which ones you should walk away from.
                </p>
                <p>
                  When you need implementation support, we connect you with vetted technology partners who specialize in your vertical and stack. We keep advisory and delivery separate because it protects the integrity of both.
                </p>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "32px 28px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>How engagement works</div>
              {[
                { step: "01", text: "You request a working session. We ask a few questions to understand your situation before we meet." },
                { step: "02", text: "We hold a 60-minute strategy session. No pitch deck. No sales team. Just a direct conversation about your CX challenges." },
                { step: "03", text: "We deliver a clear recommendation — what to do, what to evaluate, what to avoid, and why." },
                { step: "04", text: "If you need implementation support, we introduce you to vetted partners who fit your vertical and stack." },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < 3 ? `1px solid ${BORDER}` : "none" }}>
                  <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: `${ELECTRIC}40`, flexShrink: 0, width: 28 }}>{s.step}</span>
                  <span style={{ fontSize: 14, color: SLATE, lineHeight: 1.55, fontFamily: "'DM Sans', sans-serif" }}>{s.text}</span>
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
      desc: "CCaaS evaluation, vendor shortlisting, and architecture-level comparison tailored to your operating model, vertical requirements, and integration landscape. We go deeper than feature matrices — we assess orchestration readiness, AI maturity, and long-term vendor trajectory.",
      who: "CX leaders, CIOs, and transformation leads evaluating CCaaS platforms",
      output: "Vendor shortlist with scored evaluation, architecture fit analysis, and negotiation guidance",
    },
    {
      title: "AI readiness assessment",
      desc: "A structured evaluation of whether your data, workflows, governance, and team structure are ready for AI-driven service delivery. Covers conversational AI, agent assist, autonomous agents, and QA automation — with an honest assessment of what's realistic on your timeline.",
      who: "CX and IT leaders planning AI pilots or scaling existing AI programs",
      output: "Readiness scorecard, gap analysis, phased rollout recommendation, and risk map",
    },
    {
      title: "Vendor shortlisting",
      desc: "You tell us what you need. We draw on our 350+ vendor assessment library to produce a shortlist of 3-5 vendors that fit your situation — with honest assessments of where each one excels and where each one will create friction.",
      who: "Procurement leads, CX directors, and operations executives running vendor evaluations",
      output: "Curated vendor shortlist with strengths, weaknesses, competitive context, and red flags",
    },
    {
      title: "Operating model design",
      desc: "How your CX organization should be structured to support modern service delivery — including the relationship between centralized strategy, contact center operations, digital channels, AI governance, and workforce management.",
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
    <section style={{ background: "#fff", padding: "96px 28px" }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ maxWidth: 560, marginBottom: 48 }}>
            <Label>Advisory offerings</Label>
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
                onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,136,221,0.06)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}
              >
                <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 10px" }}>{s.title}</h3>
                <p style={{ fontSize: 14.5, color: SLATE, lineHeight: 1.7, margin: "0 0 20px", fontFamily: "'DM Sans', sans-serif" }}>{s.desc}</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="engage-grid">
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>Best for</div>
                    <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.55, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{s.who}</p>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>You walk away with</div>
                    <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.55, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{s.output}</p>
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
    <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "96px 28px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "40%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.04) 0%, transparent 70%)" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 580, margin: "0 auto 48px" }}>
            <Label light>Clear boundaries</Label>
            <Title light>What we do, what we leave to others, and why.</Title>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, marginTop: 8, fontFamily: "'DM Sans', sans-serif" }}>
              Keeping advisory and delivery separate means our recommendations stay clean. Here's exactly where our work starts and stops.
            </p>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="split-grid">
          <FadeIn delay={0.05}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "32px 28px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>What we do</div>
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
                  <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{item}</span>
                </div>
              ))}
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "32px 28px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>What we leave to partners</div>
              {[
                "Platform implementation and deployment",
                "System integration and custom development",
                "Ongoing managed services and support",
                "Staffing, recruiting, and BPO operations",
                "Vendor contract negotiation (we advise, partners execute)",
                "Change management and training delivery",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0" }}>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{item}</span>
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
    { trigger: "You're evaluating CCaaS platforms", detail: "and the vendor demos are starting to blur together. You need someone who's seen 50+ implementations to tell you which three actually fit your operating model." },
    { trigger: "Your AI pilot isn't scaling", detail: "and leadership wants to know why. You need a structured assessment of what's blocking scale — data quality, workflow gaps, governance holes, or the wrong vendor." },
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16 }}>
          {scenarios.map((s, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "24px 22px", height: "100%", transition: "border-color 0.2s" }}
                onMouseOver={e => e.currentTarget.style.borderColor = ELECTRIC}
                onMouseOut={e => e.currentTarget.style.borderColor = BORDER}>
                <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14.5, fontWeight: 600, color: NAVY, margin: "0 0 6px", lineHeight: 1.4 }}>{s.trigger}</h3>
                <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.55, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{s.detail}</p>
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
    <section style={{ background: "#fff", padding: "96px 28px", borderTop: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 16, padding: "64px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.08) 0%, transparent 70%)" }} />
            <div style={{ position: "relative", zIndex: 1 }}>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 16px" }}>
                Request a working session.
              </h2>
              <p style={{ fontSize: 15.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, maxWidth: 480, margin: "0 auto 32px", fontFamily: "'DM Sans', sans-serif" }}>
                60 minutes. No pitch deck. A direct conversation about your CX challenges with someone who understands both the strategy and the operations.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "15px 32px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", boxShadow: `0 4px 20px rgba(0,136,221,0.3)` }}>Request a Working Session</a>
                <a href="/platforms-and-tech" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "15px 32px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif" }}>Explore the Platform →</a>
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