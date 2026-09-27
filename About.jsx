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
        @media (max-width: 860px) { .nav-links { display: none !important; } .split-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }
      `}</style>
      
    </>
  );
}

function Hero() {
  return (
    <section style={{ background: HOUSE.navy, padding: "140px 28px 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "none", backgroundSize: "64px 64px" }} />
      <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: "none" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <a href="/" style={{ color: HOUSE.body, fontSize: 13 }}>Home</a>
            <span style={{ color: HOUSE.body, fontSize: 13 }}>/</span>
            <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>About</span>
          </div>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div style={{ maxWidth: 680 }}>
            <h1 style={{ fontFamily: FONT, fontSize: "clamp(34px, 4.5vw, 56px)", fontWeight: 400, color: HOUSE.mist, lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 24px" }}>
              We understand both the{" "}
              <span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>boardroom and the queue.</span>
            </h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: HOUSE.body, lineHeight: 1.7, maxWidth: 560 }}>
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
                  We exist to help leaders cut through that noise, with frameworks, vendor intelligence, and operational depth grounded in how contact centers actually run.
                </p>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ background: HOUSE.ink, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "32px 28px" }}>
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
    { title: "Vendor intelligence", desc: "Vendor profiles across eight technology categories. Contact center platforms are researched finding by finding, each with its public sources and validation date; the other categories are marked Phase 1 context until their research is complete." },
    { title: "Buying frameworks", desc: "Decision tools for CCaaS selection, AI readiness, platform vs point-solution math, and RFPs that don't fail. Built for the way real procurement decisions actually happen." },
    { title: "Operational depth", desc: "TCO models, orchestration architecture, staffing implications, QA design, and governance frameworks. We go where most CX content stops: the queue, the SLA, the escalation path." },
    { title: "Industry-specific CX", desc: "Ten verticals, each with vertical-specific vendor maps, stack layer models, and specialization breakdowns. Because healthcare CX is nothing like retail CX." },
    { title: "Practical tools", desc: "TCO calculators, maturity assessments, AI readiness diagnostics, and planning templates. Tools that give you output you can bring to your next leadership meeting." },
    { title: "Consultant Matching", desc: "We connect CX leaders with vetted consultants who specialize in platform selection, AI strategy, and contact center transformation. We are the intelligence layer: they are the implementation experts." },
  ];
  return (
    <section style={{ background: HOUSE.ink, padding: "96px 28px" }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ maxWidth: 560, marginBottom: 48 }}>
            <Label>What we do</Label>
            <Title>Six pillars that make this different from everything else.</Title>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(340px, 100%), 1fr))", gap: 20 }}>
          {pillars.map((p, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <div style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "28px 24px", transition: "border-color 0.2s", height: "100%" }}
                onMouseOver={e => e.currentTarget.style.borderColor = ELECTRIC}
                onMouseOut={e => e.currentTarget.style.borderColor = BORDER}>
                <h3 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>{p.title}</h3>
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
              <div style={{ display: "flex", alignItems: "start", gap: 24, padding: "24px 28px", background: HOUSE.ink, border: `1px solid ${BORDER}`, borderRadius: i === 0 ? "10px 10px 0 0" : i === audiences.length - 1 ? "0 0 10px 10px" : 0, borderTop: i > 0 ? "none" : undefined, flexWrap: "wrap" }}>
                <div style={{ minWidth: 200 }}>
                  <h3 style={{ fontFamily: FONT, fontSize: 19, fontWeight: 400, color: NAVY, margin: 0 }}>{a.role}</h3>
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
    <section style={{ background: HOUSE.navy, padding: "96px 28px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "30%", left: "-5%", width: 400, height: 400, borderRadius: "50%", background: "none" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64 }} className="split-grid">
          <FadeIn>
            <div>
              <Label light>What we won't do</Label>
              <Title light>This site is not for everyone. That's the point.</Title>
              <p style={{ fontSize: 15, color: HOUSE.body, lineHeight: 1.7, marginTop: 8 }}>
                If you're looking for generic "CX is important" content, vendor press releases repackaged as insight, or a directory where every vendor looks equal: you'll find that elsewhere. We have opinions. We back them with data. And we'd rather be useful to a focused audience than comfortable for a broad one.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {[
                { no: "Vendor propaganda", why: "We don't take placement fees. Vendors earn coverage through demonstrated capability." },
                { no: "Abstract inspiration", why: "Every framework, tool, and assessment produces output you can act on Monday morning." },
                { no: "Feature-level comparisons", why: "We evaluate platforms at the architecture, operations, and governance level." },
                { no: "Implementation services", why: "We are the intelligence platform, not the implementor. We connect you with the right consultants. Keeping intelligence and delivery separate protects the integrity of both." },
                { no: "AI hype", why: "We show how AI restructures routing, QA, role design, knowledge, and governance. The operational implications are what matter." },
              ].map((item, i) => (
                <div key={i} style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, borderRadius: 8, padding: "18px 20px" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: HOUSE.mist, marginBottom: 4 }}>We don't do: {item.no}</div>
                  <div style={{ fontSize: 13, color: HOUSE.body, lineHeight: 1.5 }}>{item.why}</div>
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
    <section style={{ background: HOUSE.ink, padding: "96px 28px", borderTop: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 56px" }}>
            <Label>Operating principles</Label>
            <Title>How we work and why it matters.</Title>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
          {[
            { n: "01", t: "Editorially independent, commercially transparent", d: "Our research, scoring, and vendor evaluations are completely independent. No vendor pays for coverage or placement. When you need expert guidance, we connect you with vetted technology consultants, and we're transparent about how those relationships work." },
            { n: "02", t: "Operator credibility", d: "Our frameworks are built by people who've managed queues, staffing models, SLAs, and QA programs. We understand what happens when the theory hits the floor." },
            { n: "03", t: "Architecture over features", d: "We evaluate technology at the system level: orchestration layers, integration dependencies, governance requirements. Checkbox feature comparisons tell you what a platform can do. We tell you what it will do to your operations." },
            { n: "04", t: "Vertical specificity", d: "We don't give the same advice to a hospital that we give to a retailer. Compliance burden, customer emotion, channel mix, and data sensitivity change every recommendation." },
          ].map((p, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div>
                <span style={{ fontFamily: FONT, fontSize: 32, color: ELECTRIC }}>{p.n}</span>
                <h3 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 400, color: NAVY, margin: "4px 0 8px" }}>{p.t}</h3>
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
              Whether you're evaluating platforms, building an AI business case, or trying to make sense of a fragmented vendor landscape: we offer the clarity that vendor sales calls can't.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <a href="/contact" style={{ background: HOUSE.action, color: HOUSE.paper, fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, boxShadow: "none" }}>Find a Consultant →</a>
              <a href="/platforms-and-tech" style={{ background: HOUSE.ink, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>Explore the Platform</a>
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
    <section style={{ background: HOUSE.ink, padding: "48px 28px", borderTop: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>We're part of a larger CX ecosystem. See the publications and communities we respect.</p>
            <a href="/cx-ecosystem" style={{ fontSize: 14, fontWeight: 600, color: ELECTRIC }}>Explore the CX Ecosystem →</a>
          </div>
        </FadeIn>
      </div>
    </section>
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
      <EcosystemCallout />
      <Footer />
    </div>
  );
}