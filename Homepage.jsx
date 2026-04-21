import { useState, useEffect, useRef } from "react";

const NAVY = "#0B1D3A";
const DEEP_NAVY = "#061325";
const ELECTRIC = "#0088DD";
const LIGHT_BLUE = "#00AAFF";
const ICE = "#E8F4FD";
const WARM = "#F8FAFB";
const SLATE = "#3A4F6A";
const MUTED = "#6B7F99";
const BORDER = "#D8E3ED";
const AMBER = "#F59E0B";

function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.unobserve(el); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, v];
}

function FadeIn({ children, delay = 0, className, style = {} }) {
  const [ref, v] = useInView();
  return (
    <div ref={ref} className={className} style={{ ...style, opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.65s ease ${delay}s, transform 0.65s ease ${delay}s` }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return <span style={{ color: ELECTRIC, fontSize: 11.5, fontWeight: 700, letterSpacing: 2.2, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", display: "block", marginBottom: 12 }}>{children}</span>;
}

function SectionTitle({ children, light }) {
  return <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 400, color: light ? "#fff" : NAVY, lineHeight: 1.15, margin: "0 0 16px", letterSpacing: "-0.015em" }}>{children}</h2>;
}

const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };

// ─── NAV ─────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", fn, { passive: true }); return () => window.removeEventListener("scroll", fn); }, []);
  const links = [
    { name: "Platforms + Tech", href: "/platforms-and-tech" },
    { name: "How to Choose", href: "/how-to-choose" },
    { name: "Research", href: "/research" },
    { name: "Vendors", href: "/vendors" },
    { name: "The Human Premium", href: "/human-premium" },
    { name: "Advisory", href: "/advisory" },
  ];
  const bg = scrolled ? "rgba(6,19,37,0.96)" : "transparent";
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: #fff; color: ${NAVY}; -webkit-font-smoothing: antialiased; }
        a { text-decoration: none; }
        @media (max-width: 860px) {
          .nav-links { display: none !important; }
          .mob-btn { display: flex !important; }
        }
      `}</style>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: bg, backdropFilter: scrolled ? "blur(14px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "all 0.35s ease", padding: scrolled ? "12px 0" : "20px 0" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <svg width="34" height="34" viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
              <g transform="translate(60,60)">
                <path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                <path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity="0.8"/>
                <path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
                <line x1="-14" y1="-14" x2="14" y2="14" stroke={LIGHT_BLUE} strokeWidth="5.5" strokeLinecap="round"/>
                <line x1="14" y1="-14" x2="-14" y2="14" stroke={LIGHT_BLUE} strokeWidth="5.5" strokeLinecap="round"/>
              </g>
            </svg>
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 14.5, letterSpacing: 0.4 }}>
              THE CENTER OF <span style={{ color: LIGHT_BLUE }}>CX</span>
            </span>
          </a>
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {links.map(l => <a key={l.name} href={l.href} style={{ color: "rgba(255,255,255,0.7)", fontSize: 13.5, fontWeight: 500, transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = "#fff"} onMouseOut={e => e.target.style.color = "rgba(255,255,255,0.7)"}>{l.name}</a>)}
            <a href="/contact" style={{ color: "#fff", fontSize: 13, fontWeight: 600, background: ELECTRIC, padding: "9px 20px", borderRadius: 6, transition: "opacity 0.2s" }} onMouseOver={e => e.target.style.opacity = 0.9} onMouseOut={e => e.target.style.opacity = 1}>Request Briefing</a>
          </div>
          <button className="mob-btn" onClick={() => setOpen(!open)} style={{ display: "none", flexDirection: "column", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 8 }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 20, height: 2, background: "#fff", borderRadius: 2 }} />)}
          </button>
        </div>
        {open && (
          <div style={{ background: DEEP_NAVY, padding: "20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
            {links.map(l => <a key={l.name} href={l.href} style={{ color: "rgba(255,255,255,0.8)", fontSize: 15 }}>{l.name}</a>)}
            <a href="/contact" style={{ color: "#fff", fontSize: 14, fontWeight: 600, background: ELECTRIC, padding: "12px 20px", borderRadius: 6, textAlign: "center" }}>Request Briefing</a>
          </div>
        )}
      </nav>
    </>
  );
}

// ─── HERO ────────────────────────────────────────────
function Hero() {
  return (
    <section style={{ background: `linear-gradient(168deg, ${DEEP_NAVY} 0%, ${NAVY} 50%, #0F2847 100%)`, minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", padding: "140px 28px 100px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.025) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
      <div style={{ position: "absolute", top: "-15%", right: "-8%", width: 650, height: 650, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.07) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: "-12%", left: "-6%", width: 450, height: 450, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,170,255,0.04) 0%, transparent 70%)" }} />

      <div style={{ ...WRAP, width: "100%", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 740 }}>
          <FadeIn>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,136,221,0.08)", border: "1px solid rgba(0,136,221,0.18)", borderRadius: 100, padding: "5px 14px", marginBottom: 28 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: ELECTRIC, boxShadow: `0 0 8px ${ELECTRIC}` }} />
              <span style={{ color: LIGHT_BLUE, fontSize: 11.5, fontWeight: 700, letterSpacing: 1.8, textTransform: "uppercase" }}>Strategy · Operations · Intelligence</span>
            </div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(36px, 5.2vw, 68px)", fontWeight: 400, color: "#fff", lineHeight: 1.07, letterSpacing: "-0.02em", margin: "0 0 24px" }}>
              Where CX leaders separate{" "}
              <span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT_BLUE})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>platform hype</span>{" "}
              from operational reality.
            </h1>
          </FadeIn>

          <FadeIn delay={0.16}>
            <p style={{ fontSize: "clamp(15px, 1.7vw, 18px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 580, margin: "0 0 40px" }}>
              Independent vendor intelligence, buyer frameworks, and the operational clarity CX leaders need to make confident technology decisions. No vendor sponsorship. No pay-to-play. No fluff.
            </p>
          </FadeIn>

          <FadeIn delay={0.24}>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <a href="/platforms-and-tech" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, boxShadow: `0 4px 20px rgba(0,136,221,0.25)` }}>Explore Platforms + Tech</a>
              <a href="/how-to-choose" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.13)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "14px 28px", borderRadius: 8 }}>Buyer Guides + Tools</a>
            </div>
          </FadeIn>

          <FadeIn delay={0.32}>
            <div style={{ marginTop: 48, display: "flex", gap: 20, flexWrap: "wrap" }}>
              {["CCaaS Leaders", "CX Operations", "Digital + IT", "AI + Data"].map(t => (
                <span key={t} style={{ color: "rgba(255,255,255,0.3)", fontSize: 11.5, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{t}</span>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─── WHY NOW ─────────────────────────────────────────
function WhyNow() {
  const stats = [
    { n: "80%", l: "Of service orgs will apply generative AI by 2026", s: "Gartner projects that by 2026, 80% of customer service and support organizations will use generative AI in some form." },
    { n: "38%", l: "Measure agent satisfaction and well-being", s: "85% of contact centers track abandonment. 84% track AHT. Only 38% measure the people doing the work." },
    { n: "$65–249", l: "Per agent per month is just the license", s: "The real cost shows up in labor, deployment, integrations, and whatever your vendor decided not to bundle." },
    { n: "7", l: "Orchestration layers in a modern CX stack", s: "Distinct vendors, dependencies, and governance requirements at each layer. Most organizations manage this complexity by accident." },
  ];
  return (
    <section style={{ background: WARM, padding: "96px 28px", borderBottom: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ maxWidth: 660 }}>
            <SectionLabel>Why This Matters Now</SectionLabel>
            <SectionTitle>Customer experience is an operating discipline. Finally.</SectionTitle>
            <p style={{ fontSize: 16, color: SLATE, lineHeight: 1.75, marginTop: 8 }}>
              The contact center stack has more layers, more vendors, and more AI promises than ever. Platform costs shift but never disappear. Automation grows but complexity grows faster. The leaders who win are not buying the most technology. They are designing systems where strategy, operations, data, and AI actually work together.
            </p>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginTop: 56 }}>
          {stats.map((s, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div style={{ background: "#fff", borderRadius: 12, padding: "32px 24px", border: `1px solid ${BORDER}`, transition: "border-color 0.2s, box-shadow 0.2s", cursor: "default", height: "100%" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.boxShadow = "0 4px 18px rgba(0,136,221,0.07)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 34, color: ELECTRIC, marginBottom: 6 }}>{s.n}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: NAVY, marginBottom: 4, lineHeight: 1.4 }}>{s.l}</div>
                <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.5 }}>{s.s}</div>
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.4}>
          <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic", fontSize: 18, color: NAVY, lineHeight: 1.7, marginTop: 36, textAlign: "center", maxWidth: 720, margin: "36px auto 0", letterSpacing: "-0.01em", opacity: 0.75 }}>
            AI is getting deployed fast. Most teams still over-measure speed, under-measure agent health, underestimate total platform cost, and under-manage stack complexity.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── PLATFORMS & TECH ────────────────────────────────
function Platforms() {
  const cats = [
    { t: "Core CX Platforms", s: "CCaaS", d: "When add-ons beat rip-and-replace. Who should switch platforms and who shouldn't.", h: "/vendors/ccaas" },
    { t: "Customer Automation", s: "IVA + Self-Service AI", d: "Where IVAs actually contain, where they fail, and what autonomous resolution looks like in production.", h: "/vendors/iva" },
    { t: "Agent Assist + Knowledge", s: "Real-Time Intelligence", d: "RAG realities, adoption traps, and the gap between post-contact summaries and real-time guidance.", h: "/vendors/agent-assist" },
    { t: "Workforce + Quality", s: "WEM + QM", d: "Forecasting truth, AI QA vs human QA, and the cost levers most operations overlook.", h: "/vendors/wem-qm" },
    { t: "Experience Analytics", s: "VoC + Journey Intelligence", d: "Root cause vs vanity metrics. The analytics that change behavior vs the dashboards nobody opens.", h: "/vendors/analytics" },
    { t: "CX Orchestration", s: "ACD + Workflow + Integration", d: "Skills-based routing is dead. Orchestration patterns for CCaaS, CRM, and ITSM convergence.", h: "/vendors/acd-routing" },
    { t: "Digital Engagement", s: "Chat + Messaging + Social", d: "Channel breadth without channel depth is a trap. Who owns the full digital conversation.", h: "/vendors/digital-engagement" },
    { t: "Payments + Identity", s: "PCI + Auth + Trust", d: "PCI compliance, authentication friction, and fraud prevention inside the CX workflow.", h: "/vendors/payments" },
    { t: "CX + AI Governance", s: "Compliance + Model Risk", d: "Auditability, escalation design, and the governance layer most AI deployments skip.", h: "/platforms-and-tech" },
  ];
  return (
    <section style={{ background: "#fff", padding: "96px 28px" }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 48 }}>
            <div>
              <SectionLabel>Platforms + Tech</SectionLabel>
              <SectionTitle>Nine decision domains. Each one carries real risk.</SectionTitle>
            </div>
            <a href="/platforms-and-tech" style={{ fontSize: 14, fontWeight: 600, color: ELECTRIC }}>View all categories →</a>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(330px, 1fr))", gap: 16 }}>
          {cats.map((c, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <a href={c.h || "/platforms-and-tech"} style={{ display: "block", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "28px 24px", cursor: "pointer", transition: "all 0.22s", background: "#fff", textDecoration: "none", color: "inherit" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,136,221,0.08)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 8 }}>{c.s}</div>
                <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 21, fontWeight: 400, color: NAVY, margin: "0 0 8px", lineHeight: 1.25 }}>{c.t}</h3>
                <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.6, margin: "0 0 16px" }}>{c.d}</p>
                <span style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC }}>{c.h ? "View scored vendors →" : "Explore category →"}</span>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── HOW TO CHOOSE ───────────────────────────────────
function HowToChoose() {
  const guides = [
    { t: "CCaaS Platform Buyer's Guide", tag: "Buyer Guide", pages: "18 pages", href: "/research/ccaas-buyer-guide", live: true },
    { t: "IVA + Conversational AI Buyer's Guide", tag: "Buyer Guide", pages: "25 pages", href: "/research/iva-buyer-guide", live: true },
    { t: "Workforce + Quality Management Buyer's Guide", tag: "Buyer Guide", pages: "Coming Q2 2026", live: false },
    { t: "Agent Assist + Knowledge AI Buyer's Guide", tag: "Buyer Guide", pages: "Coming Q3 2026", live: false },
    { t: "Advanced Analytics Buyer's Guide", tag: "Buyer Guide", pages: "Coming Q3 2026", live: false },
  ];
  return (
    <section style={{ background: `linear-gradient(168deg, ${DEEP_NAVY}, ${NAVY})`, padding: "96px 28px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "40%", left: "50%", width: 700, height: 700, borderRadius: "50%", transform: "translate(-50%, -50%)", background: "radial-gradient(circle, rgba(0,136,221,0.05) 0%, transparent 70%)" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ maxWidth: 560, marginBottom: 44 }}>
            <SectionLabel>How to Choose</SectionLabel>
            <SectionTitle light>Independent buyer's guides. No vendor sponsorship. No pay-to-play.</SectionTitle>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, marginTop: 4 }}>Each guide scores vendors on weighted dimensions, maps buyer scenarios to shortlists, and includes the demo questions and TCO realities that vendor briefings leave out.</p>
          </div>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {guides.map((g, i) => (
            <FadeIn key={i} delay={i * 0.06}>
              {g.live ? (
                <a href={g.href} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 28px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: i === 0 ? "10px 10px 0 0" : 0, borderTop: i > 0 ? "none" : undefined, cursor: "pointer", transition: "background 0.2s", flexWrap: "wrap", gap: 12, textDecoration: "none", color: "inherit" }}
                  onMouseOver={e => e.currentTarget.style.background = "rgba(0,136,221,0.06)"}
                  onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 240 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(0,136,221,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: ELECTRIC, fontSize: 14 }}>↓</span>
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, fontWeight: 400, color: "#fff", margin: 0 }}>{g.t}</h3>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 2 }}>
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: LIGHT_BLUE, letterSpacing: 0.5, textTransform: "uppercase" }}>{g.tag}</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>·</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{g.pages}</span>
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC }}>Access Guide →</span>
                </a>
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 28px", background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: i === guides.length - 1 ? "0 0 10px 10px" : 0, borderTop: i > 0 ? "none" : undefined, flexWrap: "wrap", gap: 12, opacity: 0.6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 240 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14 }}>◆</span>
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, fontWeight: 400, color: "rgba(255,255,255,0.7)", margin: 0 }}>{g.t}</h3>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 2 }}>
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: 0.5, textTransform: "uppercase" }}>{g.tag}</span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>·</span>
                        <span style={{ fontSize: 11, color: AMBER, fontWeight: 600 }}>{g.pages}</span>
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>In development</span>
                </div>
              )}
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CX PRO TOOLS ────────────────────────────────────
function Tools() {
  const tiers = [
    {
      label: "Calculators + Diagnostics",
      sub: "Interactive tools with immediate output",
      items: [
        { name: "TCO Calculator", desc: "What your stack actually costs per agent, per contact, per resolved task.", href: "/tco-calculator" },
        { name: "CX Maturity Assessment", desc: "Where you stand across strategy, ops, tech, analytics, and governance.", href: "/tools/cx-maturity" },
        { name: "AI Readiness Diagnostic", desc: "Whether your data, workflows, and governance are ready for AI workers.", href: "/tools/ai-readiness" },
      ],
      accent: ELECTRIC,
    },
    {
      label: "Frameworks + Templates",
      sub: "Downloadable IP that demonstrates depth",
      items: [
        { name: "Experience Scorecard", desc: "Measure what matters: CSAT, FCR, cost-per-contact, containment.", href: "/tools/experience-scorecard" },
        { name: "CX + IT Alignment Framework", desc: "Bridge the gap between experience vision and tech execution.", href: "/tools/cx-it-alignment" },
        { name: "Governance + Operating Model", desc: "Who owns what across CX strategy, contact center ops, and AI.", href: "/tools/governance-model" },
        { name: "Service Design Toolkit", desc: "Journey mapping, effort scoring, and friction analysis combined.", href: "/tools/service-design" },
      ],
      accent: "#0099CC",
    },
    {
      label: "Planning Tools",
      sub: "For leaders in active transformation",
      items: [
        { name: "Transformation Roadmap Builder", desc: "90-day planning template with milestones and dependencies.", href: "/tools/roadmap-builder" },
        { name: "Integration Strategy Planner", desc: "Map your stack across the seven orchestration layers.", href: "/tools/integration-planner" },
        { name: "Business Case Builder", desc: "The ROI narrative for your board, built from your real numbers.", href: "/tools/business-case" },
      ],
      accent: "#006699",
    },
    {
      label: "The Human Premium",
      sub: "Career growth in the AI era",
      items: [
        { name: "Four New CX Roles", desc: "Complex Issue Resolver, AI Trainer, Experience Designer, and Quality Lead. Roles that didn't exist two years ago.", href: "/human-premium" },
        { name: "Growth Playbook", desc: "Seven moves that separate those who thrive from those who get displaced. Each with a concrete action step.", href: "/human-premium" },
        { name: "Certifications That Compound", desc: "12 certifications across AI, CX, and data analytics. Includes costs, time, and why each one matters.", href: "/human-premium" },
        { name: "Five Career Paths", desc: "Go deeper, go wider, go technical, go independent, or go build. Pick the one that fits your ambition.", href: "/human-premium" },
      ],
      accent: "#10B981",
    },
  ];

  return (
    <section style={{ background: WARM, padding: "96px 28px", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 56px" }}>
            <SectionLabel>CX Pro Tools</SectionLabel>
            <SectionTitle>Practical tools for serious operators.</SectionTitle>
            <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.65, marginTop: 4 }}>
              Free, gated resources built from real frameworks. Every tool ends with an output you can bring to your next leadership meeting.
            </p>
          </div>
        </FadeIn>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {tiers.map((tier, ti) => (
            <FadeIn key={ti} delay={ti * 0.1}>
              <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${BORDER}`, overflow: "hidden", height: "100%" }}>
                <div style={{ padding: "24px 24px 16px", borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: "inline-block", background: `${tier.accent}12`, color: tier.accent, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", padding: "4px 10px", borderRadius: 4, marginBottom: 10 }}>{tier.label}</div>
                  <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>{tier.sub}</p>
                </div>
                <div style={{ padding: "8px 0" }}>
                  {tier.items.map((item, ii) => (
                    <a key={ii} href={item.href} style={{ display: "block", padding: "16px 24px", cursor: "pointer", transition: "background 0.15s", borderBottom: ii < tier.items.length - 1 ? `1px solid ${BORDER}` : "none", textDecoration: "none", color: "inherit" }}
                      onMouseOver={e => e.currentTarget.style.background = ICE}
                      onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ fontSize: 14.5, fontWeight: 600, color: NAVY, margin: "0 0 3px" }}>{item.name}</h4>
                          <p style={{ fontSize: 12.5, color: MUTED, margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
                        </div>
                        <span style={{ color: tier.accent, fontSize: 16, flexShrink: 0, fontWeight: 600 }}>→</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── INDUSTRIES ──────────────────────────────────────
function Industries() {
  const top3 = [
    { n: "Financial Services", d: "7 sub-verticals from retail banking to payments processing. 245 capability checkpoints across compliance, identity verification, and core banking integration. The most regulated CX in any industry.", h: "/industries/financial-services", stat: "79% CSAT", statNote: "Below potential. Authentication friction and billing complexity suppress scores." },
    { n: "Healthcare", d: "6 sub-verticals from health systems to pharma. 210 capability checkpoints across HIPAA, EHR integration, and patient access. Where empathy and compliance intersect.", h: "/industries/healthcare", stat: "52% FCR", statNote: "Lowest in CX. Scheduling fragmentation and multi-system lookups prevent first-call resolution." },
    { n: "Retail + eCommerce", d: "6 sub-verticals from DTC to luxury. 210 capability checkpoints across commerce platforms, returns automation, and seasonal scaling. Speed defines everything.", h: "/industries/retail", stat: "93%", statNote: "Of customers make repeat purchases from companies with excellent service." },
  ];
  return (
    <section style={{ background: "#fff", padding: "96px 28px" }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ maxWidth: 600, marginBottom: 48 }}>
            <SectionLabel>Industry Expertise</SectionLabel>
            <SectionTitle>CX changes by context. Generic advice fails.</SectionTitle>
            <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.65, marginTop: 4 }}>Every vertical has different compliance burdens, technology stacks, failure modes, and customer expectations. We built dedicated intelligence for each one. Sub-vertical frameworks, vendor mapping, benchmarks, and the integration pitfalls that generic CX platforms consistently miss.</p>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 16, marginBottom: 32 }}>
          {top3.map((ind, i) => (
            <FadeIn key={i} delay={i * 0.06}>
              <a href={ind.h} style={{ display: "block", padding: "28px 24px", border: `1px solid ${BORDER}`, borderRadius: 10, cursor: "pointer", transition: "all 0.22s", background: "#fff", textDecoration: "none", color: "inherit", height: "100%" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,136,221,0.06)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}>
                <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>{ind.n}</h3>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, margin: "0 0 16px" }}>{ind.d}</p>
                <div style={{ background: WARM, borderRadius: 6, padding: "10px 14px", marginBottom: 14 }}>
                  <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: ELECTRIC }}>{ind.stat}</span>
                  <span style={{ fontSize: 11, color: MUTED, marginLeft: 8 }}>{ind.statNote}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC }}>Explore vertical →</span>
              </a>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.2}>
          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP_NAVY})`, borderRadius: 12, padding: "36px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <div style={{ maxWidth: 560 }}>
              <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: "#fff", margin: "0 0 8px" }}>10 verticals. 61 sub-verticals. 2,135 capability checkpoints.</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: 0 }}>From telecommunications and insurance to government, utilities, and education. Each vertical has dedicated CX intelligence with sub-vertical frameworks, 7-layer technology stacks, vendor recommendations, failure modes, and integration pitfalls built from real operational data.</p>
            </div>
            <a href="/industries" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "14px 24px", borderRadius: 8, flexShrink: 0, boxShadow: "0 4px 18px rgba(0,136,221,0.25)" }}>Explore All 10 Industries →</a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── RESEARCH & INSIGHT ──────────────────────────────
function Research() {
  const pieces = [
    { tag: "CX Reality Check", t: "Why Your CCaaS Migration Didn't Cut Costs", read: "8 min", href: "/research/ccaas-migration-costs" },
    { tag: "Market Map", t: "Agent Assist: Who's Real vs Who's Marketing", read: "12 min" },
    { tag: "Operator Briefing", t: "What 50–70% Automation Actually Requires", read: "10 min" },
    { tag: "Future Forecast", t: "The AI Worker Thesis: Confidence Level Assessment", read: "14 min" },
  ];
  return (
    <section style={{ background: WARM, padding: "96px 28px", borderTop: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20, marginBottom: 48 }}>
            <div>
              <SectionLabel>Research + Insight</SectionLabel>
              <SectionTitle>No press releases. No fluff. No vendor ghostwriting.</SectionTitle>
            </div>
            <a href="/research" style={{ fontSize: 14, fontWeight: 600, color: ELECTRIC }}>View all insights →</a>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {pieces.map((p, i) => {
            const Tag = p.href ? "a" : "div";
            const linkProps = p.href ? { href: p.href } : {};
            return (
            <FadeIn key={i} delay={i * 0.06}>
              <Tag {...linkProps} style={{ display: "block", background: "#fff", borderRadius: 10, border: `1px solid ${BORDER}`, overflow: "hidden", cursor: "pointer", transition: "all 0.22s", textDecoration: "none", color: "inherit" }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,136,221,0.06)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ height: 4, background: `linear-gradient(90deg, ${ELECTRIC}, ${LIGHT_BLUE})` }} />
                <div style={{ padding: "24px 22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.2, textTransform: "uppercase" }}>{p.tag}</span>
                    <span style={{ fontSize: 12, color: MUTED }}>{p.read}</span>
                  </div>
                  <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 19, fontWeight: 400, color: NAVY, margin: "0 0 16px", lineHeight: 1.3 }}>{p.t}</h3>
                  <span style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC }}>Read →</span>
                </div>
              </Tag>
            </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── ADVISORY ────────────────────────────────────────
function Advisory() {
  const offers = ["Platform Selection", "AI Readiness Assessment", "Vendor Shortlisting", "CX Operating Model Design", "Executive Briefings", "Transformation Workshops"];
  return (
    <section style={{ background: "#fff", padding: "96px 28px", borderTop: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="advisory-grid">
          <FadeIn>
            <div>
              <SectionLabel>Advisory</SectionLabel>
              <SectionTitle>Vendor-neutral guidance. Aligned to your outcomes.</SectionTitle>
              <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.7, margin: "12px 0 32px" }}>
                We help CX and contact center leaders make better technology and strategy decisions. We do not sell software. We do not implement platforms. Our advisory is grounded in independent research and aligned to your operational reality.
              </p>
              <a href="/contact" style={{ display: "inline-block", background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, boxShadow: `0 4px 18px rgba(0,136,221,0.2)` }}>Request a Working Session</a>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {offers.map((o, i) => (
                <div key={i} style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "18px 16px", fontSize: 13.5, fontWeight: 600, color: NAVY, transition: "border-color 0.2s", cursor: "default" }}
                  onMouseOver={e => e.currentTarget.style.borderColor = ELECTRIC}
                  onMouseOut={e => e.currentTarget.style.borderColor = BORDER}>
                  {o}
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
        <style>{`@media (max-width: 860px) { .advisory-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }`}</style>
      </div>
    </section>
  );
}

// ─── DIFFERENTIATORS ─────────────────────────────────
function Differentiators() {
  const diffs = [
    { t: "Strategy to the Floor", d: "We don't stop at the boardroom. We understand queues, SLAs, QA processes, escalation paths, and staffing models." },
    { t: "Vendor-Independent", d: "Technology matters. But tools are not the strategy. We help you think clearly before you buy." },
    { t: "AI as an Operating System Issue", d: "How AI changes routing, QA, role design, knowledge management, and governance. The operational reality behind the headlines." },
    { t: "Vertical Depth", d: "Healthcare is not retail. Insurance is not telecom. We show how industry context changes what the right answer looks like." },
  ];
  return (
    <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP_NAVY})`, padding: "96px 28px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 500, height: 500, background: "radial-gradient(circle, rgba(0,136,221,0.04) 0%, transparent 70%)" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 56px" }}>
            <SectionLabel>What Makes This Different</SectionLabel>
            <SectionTitle light>Built for transformation.</SectionTitle>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {diffs.map((d, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "32px 24px", transition: "border-color 0.2s" }}
                onMouseOver={e => e.currentTarget.style.borderColor = "rgba(0,136,221,0.3)"}
                onMouseOut={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}>
                <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, fontWeight: 400, color: "#fff", margin: "0 0 8px" }}>{d.t}</h3>
                <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: 0 }}>{d.d}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────
function FinalCTA() {
  return (
    <section style={{ background: WARM, padding: "96px 28px", borderTop: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 580, margin: "0 auto" }}>
            <SectionTitle>Ready to make better CX decisions?</SectionTitle>
            <p style={{ fontSize: 15.5, color: SLATE, lineHeight: 1.65, margin: "8px 0 36px" }}>
              Whether you need a buying framework, a vendor gut-check, or a strategy session with someone who has operated contact centers at scale. We are here for it.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "15px 32px", borderRadius: 8, boxShadow: `0 4px 20px rgba(0,136,221,0.2)` }}>Request a Working Session</a>
              <a href="/subscribe" style={{ background: "#fff", border: `1px solid ${BORDER}`, color: NAVY, fontSize: 15, fontWeight: 600, padding: "15px 32px", borderRadius: 8 }}>Subscribe to Insights</a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: DEEP_NAVY, padding: "64px 28px 40px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={WRAP}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 48 }} className="footer-grid">
          <div>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, textDecoration: "none" }}>
              <svg width="28" height="28" viewBox="0 0 120 120">
                <g transform="translate(60,60)">
                  <path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                  <path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity="0.7"/>
                  <path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
                  <line x1="-14" y1="-14" x2="14" y2="14" stroke={LIGHT_BLUE} strokeWidth="5.5" strokeLinecap="round"/>
                  <line x1="14" y1="-14" x2="-14" y2="14" stroke={LIGHT_BLUE} strokeWidth="5.5" strokeLinecap="round"/>
                </g>
              </svg>
              <span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT_BLUE }}>CX</span></span>
            </a>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6, maxWidth: 300 }}>
              Strategy, operations, and intelligence for the next era of customer experience. Vendor-neutral. Operationally grounded.
            </p>
          </div>
          {[
            { h: "Navigate", links: [
              { name: "Platforms + Tech", href: "/platforms-and-tech" },
              { name: "How to Choose", href: "/how-to-choose" },
              { name: "Research + Insight", href: "/research" },
              { name: "Vendors", href: "/vendors" },
              { name: "Advisory", href: "/advisory" },
            ]},
            { h: "Resources", links: [
              { name: "TCO Calculator", href: "/tco-calculator" },
              { name: "CX Ecosystem", href: "/cx-ecosystem" },
              { name: "Industries", href: "/industries" },
              { name: "Buyer Guides", href: "/how-to-choose" },
              { name: "The Human Premium", href: "/human-premium" },
              { name: "Newsletter", href: "/subscribe" },
            ]},
            { h: "Company", links: [
              { name: "About", href: "/about" },
              { name: "Contact", href: "/contact" },
              { name: "Request Briefing", href: "/contact" },
            ]},
          ].map((col, i) => (
            <div key={i}>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16 }}>{col.h}</h4>
              {col.links.map(l => <a key={l.name} href={l.href} style={{ display: "block", fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 10, transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = "#fff"} onMouseOut={e => e.target.style.color = "rgba(255,255,255,0.4)"}>{l.name}</a>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy", "Terms"].map(l => <a key={l} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = "rgba(255,255,255,0.5)"} onMouseOut={e => e.target.style.color = "rgba(255,255,255,0.25)"}>{l}</a>)}
          </div>
        </div>
        <style>{`@media (max-width: 860px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
      </div>
    </footer>
  );
}

// ─── APP ─────────────────────────────────────────────
export default function CenterOfCX() {
  return (
    <div>
      <Nav />
      <Hero />
      <WhyNow />
      <Platforms />
      <HowToChoose />
      <Tools />
      <Industries />
      <Research />
      <Advisory />
      <Differentiators />
      <FinalCTA />
      <Footer />
    </div>
  );
}
