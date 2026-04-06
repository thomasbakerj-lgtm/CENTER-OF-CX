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
            <svg width="34" height="34" viewBox="0 0 120 120">
              <g transform="translate(60,60)">
                <path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                <path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity="0.8"/>
                <path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
                <line x1="-14" y1="-14" x2="14" y2="14" stroke={LIGHT} strokeWidth="5.5" strokeLinecap="round"/>
                <line x1="14" y1="-14" x2="-14" y2="14" stroke={LIGHT} strokeWidth="5.5" strokeLinecap="round"/>
              </g>
            </svg>
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 14.5, letterSpacing: 0.4 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span>
          </a>
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {links.map(l => <a key={l.name} href={l.href} style={{ color: "rgba(255,255,255,0.7)", fontSize: 13.5, fontWeight: 500, transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = "#fff"} onMouseOut={e => e.target.style.color = "rgba(255,255,255,0.7)"}>{l.name}</a>)}
            <a href="/contact" style={{ color: "#fff", fontSize: 13, fontWeight: 600, background: ELECTRIC, padding: "9px 20px", borderRadius: 6 }}>Request Briefing</a>
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
      <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.05) 0%, transparent 70%)" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</a>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
            <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>About</span>
          </div>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div style={{ maxWidth: 680 }}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(34px, 4.5vw, 56px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 24px" }}>
              We understand both the{" "}
              <span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>boardroom and the queue.</span>
            </h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 560 }}>
              The Center of CX is a strategy and intelligence platform for contact center and CX leaders who need more than vendor marketing and recycled best practices.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function POV() {
  return (
    <section style={{ background: WARM, padding: "96px 28px", borderBottom: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }} className="split-grid">
          <FadeIn>
            <div>
              <Label>Our point of view</Label>
              <Title>Customer experience has entered its operational era.</Title>
              <div style={{ fontSize: 15.5, color: SLATE, lineHeight: 1.8, marginTop: 12 }}>
                <p style={{ marginBottom: 20 }}>
                  Great CX doesn't happen because companies say they care. It happens when strategy, systems, teams, data, and execution align. Most organizations are nowhere close.
                </p>
                <p style={{ marginBottom: 20 }}>
                  The contact center stack has more layers, more vendors, and more AI promises than ever. Platform costs shift but don't disappear. Automation rises but complexity rises faster. And every vendor claims to be the answer.
                </p>
                <p>
                  We exist to help leaders cut through that noise — with frameworks, vendor intelligence, and operational depth grounded in how contact centers actually run.
                </p>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "32px 28px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 20 }}>What we believe</div>
              {[
                "Technology matters, but tools aren't the strategy.",
                "AI reshapes routing, QA, role design, knowledge, and governance. The efficiency gains are a side effect of deeper structural change.",
                "Healthcare is not retail. Insurance is not telecom. Context changes the right answer.",
                "The best CX content is practical enough for operators and strategic enough for executives.",
                "Our evaluations are editorially independent. Some platforms are genuinely better than others for specific situations, and we'll say so.",
              ].map((belief, i) => (
                <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < 4 ? `1px solid ${BORDER}` : "none" }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, background: `${ELECTRIC}10`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700 }}>✓</span>
                  </div>
                  <span style={{ fontSize: 14, color: SLATE, lineHeight: 1.55 }}>{belief}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function WhatWeDo() {
  const pillars = [
    { title: "Vendor intelligence", desc: "Scored, weighted assessments across 350+ vendors in nine technology categories. Operator-grade evaluation built on proprietary rubrics, structured scoring models, and maturity benchmarks." },
    { title: "Buying frameworks", desc: "Decision tools for CCaaS selection, AI readiness, platform vs point-solution math, and RFPs that don't fail. Built for the way real procurement decisions actually happen." },
    { title: "Operational depth", desc: "TCO models, orchestration architecture, staffing implications, QA design, and governance frameworks. We go where most CX content stops — the queue, the SLA, the escalation path." },
    { title: "Industry-specific CX", desc: "Ten verticals, each with vertical-specific vendor maps, stack layer models, and specialization breakdowns. Because healthcare CX is nothing like retail CX." },
    { title: "Practical tools", desc: "TCO calculators, maturity assessments, AI readiness diagnostics, and planning templates. Tools that give you output you can bring to your next leadership meeting." },
    { title: "Advisory", desc: "Independent guidance on platform selection, AI pilots, operating model design, and transformation planning. When implementation support is needed, we connect you with vetted technology partners." },
  ];
  return (
    <section style={{ background: "#fff", padding: "96px 28px" }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ maxWidth: 560, marginBottom: 48 }}>
            <Label>What we do</Label>
            <Title>Six pillars that make this different from everything else.</Title>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 }}>
          {pillars.map((p, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "28px 24px", transition: "border-color 0.2s", height: "100%" }}
                onMouseOver={e => e.currentTarget.style.borderColor = ELECTRIC}
                onMouseOut={e => e.currentTarget.style.borderColor = BORDER}>
                <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>{p.title}</h3>
                <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6, margin: 0 }}>{p.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhoItsFor() {
  const audiences = [
    { role: "CX leaders", needs: "Strategy, maturity models, governance, customer journey alignment, executive framing." },
    { role: "Contact center leaders", needs: "Staffing, QA, coaching, WEM, channel strategy, CCaaS modernization, AI workflow impact." },
    { role: "CIO / CTO / Digital transformation", needs: "Architecture, integration strategy, AI governance, platform design, data alignment." },
    { role: "Operations executives", needs: "Measurable outcomes, cost-to-serve reduction, process redesign, adoption risk management." },
    { role: "Founders / PE / Growth operators", needs: "Scalable service operations, retention strategy, experience design as growth leverage." },
  ];
  return (
    <section style={{ background: WARM, padding: "96px 28px", borderTop: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ maxWidth: 560, marginBottom: 48 }}>
            <Label>Who this is for</Label>
            <Title>Five audiences. One platform. No dilution.</Title>
          </div>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {audiences.map((a, i) => (
            <FadeIn key={i} delay={i * 0.06}>
              <div style={{ display: "flex", alignItems: "start", gap: 24, padding: "24px 28px", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: i === 0 ? "10px 10px 0 0" : i === audiences.length - 1 ? "0 0 10px 10px" : 0, borderTop: i > 0 ? "none" : undefined, flexWrap: "wrap" }}>
                <div style={{ minWidth: 200 }}>
                  <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 19, fontWeight: 400, color: NAVY, margin: 0 }}>{a.role}</h3>
                </div>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, margin: 0, flex: 1, minWidth: 280 }}>{a.needs}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatWeWontDo() {
  return (
    <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "96px 28px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "30%", left: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.04) 0%, transparent 70%)" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }} className="split-grid">
          <FadeIn>
            <div>
              <Label light>What we won't do</Label>
              <Title light>This site is not for everyone. That's the point.</Title>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, marginTop: 8 }}>
                If you're looking for generic "CX is important" content, vendor press releases repackaged as insight, or a directory where every vendor looks equal — you'll find that elsewhere. We have opinions. We back them with data. And we'd rather be useful to a focused audience than comfortable for a broad one.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { no: "Vendor propaganda", why: "We don't take placement fees. Vendors earn coverage through demonstrated capability." },
                { no: "Abstract inspiration", why: "Every framework, tool, and assessment produces output you can act on Monday morning." },
                { no: "Feature-level comparisons", why: "We evaluate platforms at the architecture, operations, and governance level." },
                { no: "Implementation services", why: "We advise on decisions and connect you with the right partners. Keeping advisory and delivery separate protects the integrity of both." },
                { no: "AI hype", why: "We show how AI restructures routing, QA, role design, knowledge, and governance. The operational implications are what matter." },
              ].map((item, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "18px 20px" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>We don't do: {item.no}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{item.why}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

function Principles() {
  return (
    <section style={{ background: "#fff", padding: "96px 28px", borderTop: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 56px" }}>
            <Label>Operating principles</Label>
            <Title>How we work and why it matters.</Title>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
          {[
            { n: "01", t: "Editorially independent, commercially transparent", d: "Our research, scoring, and vendor evaluations are completely independent. No vendor pays for coverage or placement. When you engage us for advisory, we connect you with vetted technology partners — and we're upfront about how those relationships work." },
            { n: "02", t: "Operator credibility", d: "Our frameworks are built by people who've managed queues, staffing models, SLAs, and QA programs. We understand what happens when the theory hits the floor." },
            { n: "03", t: "Architecture over features", d: "We evaluate technology at the system level — orchestration layers, integration dependencies, governance requirements. Checkbox feature comparisons tell you what a platform can do. We tell you what it will do to your operations." },
            { n: "04", t: "Vertical specificity", d: "We don't give the same advice to a hospital that we give to a retailer. Compliance burden, customer emotion, channel mix, and data sensitivity change every recommendation." },
          ].map((p, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div>
                <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: `${ELECTRIC}30` }}>{p.n}</span>
                <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, fontWeight: 400, color: NAVY, margin: "4px 0 8px" }}>{p.t}</h3>
                <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, margin: 0 }}>{p.d}</p>
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
            <Title>If this resonates, we should talk.</Title>
            <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.65, margin: "8px 0 32px" }}>
              Whether you're evaluating platforms, building an AI business case, or trying to make sense of a fragmented vendor landscape — we offer the clarity that vendor sales calls can't.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, boxShadow: `0 4px 18px rgba(0,136,221,0.2)` }}>Request a Working Session</a>
              <a href="/platforms-and-tech" style={{ background: "#fff", border: `1px solid ${BORDER}`, color: NAVY, fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>Explore the Platform</a>
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
            <svg width="28" height="28" viewBox="0 0 120 120">
              <g transform="translate(60,60)">
                <path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                <path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity="0.7"/>
                <path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
                <line x1="-14" y1="-14" x2="14" y2="14" stroke={LIGHT} strokeWidth="5.5" strokeLinecap="round"/>
                <line x1="14" y1="-14" x2="-14" y2="14" stroke={LIGHT} strokeWidth="5.5" strokeLinecap="round"/>
              </g>
            </svg>
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span>
          </a>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

export default function About() {
  return (
    <div>
      <Nav />
      <Hero />
      <POV />
      <WhatWeDo />
      <WhoItsFor />
      <WhatWeWontDo />
      <Principles />
      <CTA />
      <Footer />
    </div>
  );
}
