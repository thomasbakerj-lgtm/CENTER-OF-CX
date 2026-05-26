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
const GREEN = "#10B981";
const RED = "#EF4444";

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
    <div ref={ref} className={className} style={{ ...style, opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(18px)", transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s` }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }) {
  return <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2.2, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", display: "block", marginBottom: 10 }}>{children}</span>;
}

const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };

// ─── NAV ─────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", fn, { passive: true }); return () => window.removeEventListener("scroll", fn); }, []);
  const links = [
    { name: "Vendors", href: "/vendors" },
    { name: "Tools", href: "/how-to-choose" },
    { name: "Industries", href: "/industries" },
    { name: "Research", href: "/research" },
    { name: "The Human Premium", href: "/human-premium" },
  ];
  const bg = scrolled ? "rgba(6,19,37,0.97)" : "transparent";
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
          .hero-paths { grid-template-columns: 1fr !important; }
          .role-grid { grid-template-columns: 1fr 1fr !important; }
          .cat-grid { grid-template-columns: 1fr !important; }
          .tools-grid { grid-template-columns: 1fr !important; }
          .quick-bar { flex-wrap: wrap !important; }
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: bg, backdropFilter: scrolled ? "blur(14px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "all 0.35s ease", padding: scrolled ? "10px 0" : "16px 0" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <svg width="30" height="30" viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
              <g transform="translate(60,60)">
                <path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                <path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity="0.8"/>
                <path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
                <line x1="-14" y1="-14" x2="14" y2="14" stroke={LIGHT_BLUE} strokeWidth="5.5" strokeLinecap="round"/>
                <line x1="14" y1="-14" x2="-14" y2="14" stroke={LIGHT_BLUE} strokeWidth="5.5" strokeLinecap="round"/>
              </g>
            </svg>
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 14, letterSpacing: 0.4 }}>
              THE CENTER OF <span style={{ color: LIGHT_BLUE }}>CX</span>
            </span>
          </a>
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 26 }}>
            {links.map(l => <a key={l.name} href={l.href} style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 500, transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = "#fff"} onMouseOut={e => e.target.style.color = "rgba(255,255,255,0.7)"}>{l.name}</a>)}
            <a href="/subscribe" style={{ color: "#fff", fontSize: 12.5, fontWeight: 600, background: ELECTRIC, padding: "8px 18px", borderRadius: 6 }}>Subscribe</a>
          </div>
          <button className="mob-btn" onClick={() => setOpen(!open)} style={{ display: "none", flexDirection: "column", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 8 }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 20, height: 2, background: "#fff", borderRadius: 2 }} />)}
          </button>
        </div>
        {open && (
          <div style={{ background: DEEP_NAVY, padding: "20px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
            {links.map(l => <a key={l.name} href={l.href} style={{ color: "rgba(255,255,255,0.8)", fontSize: 15 }}>{l.name}</a>)}
            <a href="/subscribe" style={{ color: "#fff", fontSize: 14, fontWeight: 600, background: ELECTRIC, padding: "12px 20px", borderRadius: 6, textAlign: "center" }}>Subscribe</a>
          </div>
        )}
      </nav>
    </>
  );
}

// ─── HERO: COMPACT, FUNCTIONAL ──────────────────────
function Hero() {
  return (
    <section style={{ background: `linear-gradient(168deg, ${DEEP_NAVY} 0%, ${NAVY} 60%, #0F2847 100%)`, padding: "100px 28px 48px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
      <div style={{ position: "absolute", top: "-20%", right: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.06) 0%, transparent 70%)" }} />

      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 680, marginBottom: 36 }}>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(30px, 4.5vw, 52px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 14px" }}>
            29 free tools. 276 scored vendors.{" "}
            <span style={{ color: "rgba(255,255,255,0.35)" }}>Zero vendor sponsorship.</span>
          </h1>
          <p style={{ fontSize: "clamp(14px, 1.5vw, 16px)", color: "rgba(255,255,255,0.4)", lineHeight: 1.6, maxWidth: 520 }}>
            The resource CX operators actually use. Independently scored vendor intelligence, operational calculators, and buyer frameworks for contact center professionals.
          </p>
        </div>

        {/* Three paths — immediately visible */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="hero-paths">
          {[
            { label: "Look up a vendor", sub: "276 profiles across 8 categories", href: "/vendors", icon: "◉" },
            { label: "Run a calculator", sub: "29 tools — staffing, TCO, AHT, QA", href: "/how-to-choose", icon: "⚡" },
            { label: "Read the research", sub: "Buyer guides, articles, frameworks", href: "/research", icon: "↓" },
          ].map((p, i) => (
            <a key={i} href={p.href} style={{ display: "block", padding: "20px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, transition: "all 0.2s", textDecoration: "none" }}
              onMouseOver={e => { e.currentTarget.style.background = "rgba(0,136,221,0.06)"; e.currentTarget.style.borderColor = "rgba(0,136,221,0.2)"; }}
              onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}>
              <div style={{ fontSize: 18, marginBottom: 8 }}>{p.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{p.label}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{p.sub}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── QUICK ACCESS BAR ────────────────────────────────
function QuickBar() {
  const tools = [
    { name: "Staffing Calculator", href: "/tools/staffing-calculator" },
    { name: "TCO Calculator", href: "/tco-calculator" },
    { name: "Vendor Match", href: "/tools/vendor-match" },
    { name: "AHT Decomposition", href: "/tools/aht-decomposition" },
    { name: "AI Deflection Check", href: "/tools/ai-deflection" },
    { name: "Contract Scanner", href: "/tools/contract-risk" },
  ];
  return (
    <div style={{ background: DEEP_NAVY, borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "10px 28px" }}>
      <div style={{ ...WRAP, display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }} className="quick-bar">
        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: 1.5, textTransform: "uppercase", marginRight: 8, flexShrink: 0 }}>Popular</span>
        {tools.map(t => (
          <a key={t.name} href={t.href} style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", padding: "4px 12px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", transition: "all 0.15s", flexShrink: 0, whiteSpace: "nowrap" }}
            onMouseOver={e => { e.target.style.color = "#fff"; e.target.style.borderColor = "rgba(0,136,221,0.3)"; }}
            onMouseOut={e => { e.target.style.color = "rgba(255,255,255,0.5)"; e.target.style.borderColor = "rgba(255,255,255,0.06)"; }}>{t.name}</a>
        ))}
      </div>
    </div>
  );
}

// ─── ROLE-BASED PATHS ────────────────────────────────
function RolePaths() {
  const roles = [
    { role: "I'm evaluating platforms", color: ELECTRIC, tools: [
      { name: "Vendor Match Engine", href: "/tools/vendor-match" },
      { name: "RFP Requirement Builder", href: "/tools/rfp-builder" },
      { name: "Platform Decision Matrix", href: "/tools/platform-decision" },
      { name: "Contract Risk Scanner", href: "/tools/contract-risk" },
    ]},
    { role: "I'm running operations", color: AMBER, tools: [
      { name: "Staffing Calculator", href: "/tools/staffing-calculator" },
      { name: "AHT Decomposition", href: "/tools/aht-decomposition" },
      { name: "QA Scorecard Builder", href: "/tools/qa-scorecard" },
      { name: "FCR Leakage Diagnostic", href: "/tools/fcr-leakage" },
    ]},
    { role: "I'm building a business case", color: RED, tools: [
      { name: "TCO Calculator", href: "/tco-calculator" },
      { name: "Attrition Cost Calculator", href: "/tools/attrition-cost" },
      { name: "AI Deflection Reality Check", href: "/tools/ai-deflection" },
      { name: "Business Case Builder", href: "/tools/business-case" },
    ]},
    { role: "I'm growing my career", color: GREEN, tools: [
      { name: "The Human Premium", href: "/human-premium" },
      { name: "Four New CX Roles", href: "/human-premium" },
      { name: "Certifications Guide", href: "/human-premium" },
      { name: "Five Career Paths", href: "/human-premium" },
    ]},
  ];
  return (
    <section style={{ background: "#fff", padding: "48px 28px", borderBottom: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <div style={{ fontSize: 13, fontWeight: 600, color: MUTED, marginBottom: 16 }}>What brings you here?</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }} className="role-grid">
          {roles.map((r, ri) => (
            <div key={ri} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, background: `${r.color}04` }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: NAVY }}>{r.role}</div>
              </div>
              <div>
                {r.tools.map((t, ti) => (
                  <a key={ti} href={t.href} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", fontSize: 13, color: SLATE, borderBottom: ti < r.tools.length - 1 ? `1px solid ${BORDER}` : "none", transition: "background 0.15s", textDecoration: "none" }}
                    onMouseOver={e => e.currentTarget.style.background = ICE}
                    onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                    <span>{t.name}</span>
                    <span style={{ color: r.color, fontSize: 14 }}>→</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FEATURED TOOLS (SPOTLIGHT) ──────────────────────
function FeaturedTools() {
  const featured = [
    { name: "Vendor Match Engine", desc: "Tell us your environment, priorities, and constraints. Get a ranked shortlist from 24 scored CCaaS vendors with fit reasoning and integration data.", href: "/tools/vendor-match", accent: ELECTRIC, tag: "Most used" },
    { name: "Staffing Calculator", desc: "Erlang C model. Volume, AHT, SLA target, and shrinkage to required FTE. Sensitivity analysis and industry presets included.", href: "/tools/staffing-calculator", accent: AMBER, tag: "Operations" },
    { name: "TCO Calculator", desc: "What your platform stack actually costs per agent, per contact, per resolved task. Including the costs your vendor quote left out.", href: "/tco-calculator", accent: RED, tag: "Economics" },
  ];
  return (
    <section style={{ background: WARM, padding: "48px 28px", borderBottom: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Featured tools</div>
          <a href="/how-to-choose" style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC }}>All 29 tools →</a>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="tools-grid">
          {featured.map((t, i) => (
            <a key={i} href={t.href} style={{ display: "block", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "22px 20px", transition: "all 0.2s", textDecoration: "none", color: "inherit" }}
              onMouseOver={e => { e.currentTarget.style.borderColor = t.accent; e.currentTarget.style.boxShadow = `0 4px 18px ${t.accent}12`; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: t.accent, letterSpacing: 1.2, textTransform: "uppercase" }}>{t.tag}</span>
                <span style={{ color: t.accent, fontSize: 16 }}>→</span>
              </div>
              <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, fontWeight: 400, color: NAVY, margin: "0 0 6px" }}>{t.name}</h3>
              <p style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.55, margin: 0 }}>{t.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── VENDOR INTELLIGENCE (CONDENSED) ─────────────────
function VendorIntel() {
  const cats = [
    { s: "CCaaS", t: "Core CX Platforms", n: "24 vendors", h: "/vendors/ccaas" },
    { s: "IVA", t: "Customer Automation", n: "43 vendors", h: "/vendors/iva" },
    { s: "Agent Assist", t: "Agent Assist + Knowledge", n: "38 vendors", h: "/vendors/agent-assist" },
    { s: "WEM + QM", t: "Workforce + Quality", n: "32 vendors", h: "/vendors/wem-qm" },
    { s: "Analytics", t: "Experience Analytics", n: "45 vendors", h: "/vendors/analytics" },
    { s: "ACD", t: "Routing + Orchestration", n: "28 vendors", h: "/vendors/acd-routing" },
    { s: "Digital", t: "Digital Engagement", n: "36 vendors", h: "/vendors/digital-engagement" },
    { s: "Payments", t: "Payments + Identity", n: "30 vendors", h: "/vendors/payments" },
  ];
  return (
    <section style={{ background: "#fff", padding: "48px 28px", borderBottom: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Vendor intelligence</span>
              <span style={{ fontSize: 12, color: "rgba(107,127,153,0.6)", marginLeft: 12 }}>276 vendors · 8 categories · scored independently</span>
            </div>
            <a href="/vendors" style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC }}>Browse all vendors →</a>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }} className="role-grid">
          {cats.map((c, i) => (
            <FadeIn key={i} delay={i * 0.03}>
              <a href={c.h} style={{ display: "block", padding: "18px 16px", border: `1px solid ${BORDER}`, borderRadius: 8, transition: "all 0.2s", textDecoration: "none", color: "inherit" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 4 }}>{c.s}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 3 }}>{c.t}</div>
                <div style={{ fontSize: 11.5, color: MUTED }}>{c.n} scored →</div>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── BUYER GUIDES (COMPACT) ─────────────────────────
function BuyerGuides() {
  const guides = [
    { t: "CCaaS Buyer Guide", p: "18 pages", href: "/research/ccaas-buyer-guide", live: true },
    { t: "IVA + Conversational AI Guide", p: "25 pages", href: "/research/iva-buyer-guide", live: true },
    { t: "7-Layer Orchestration Framework", p: "11 pages", href: "/research/orchestration-framework", live: true },
    { t: "WEM + Quality Management Guide", p: "Q2 2026", live: false },
  ];
  return (
    <section style={{ background: `linear-gradient(168deg, ${DEEP_NAVY}, ${NAVY})`, padding: "48px 28px" }}>
      <div style={WRAP}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>Buyer guides + frameworks</span>
          <a href="/research" style={{ fontSize: 13, fontWeight: 600, color: LIGHT_BLUE }}>All research →</a>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10 }} className="role-grid">
          {guides.map((g, i) => (
            g.live ? (
              <a key={i} href={g.href} style={{ display: "block", padding: "18px 16px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, transition: "background 0.15s", textDecoration: "none" }}
                onMouseOver={e => e.currentTarget.style.background = "rgba(0,136,221,0.05)"}
                onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{g.t}</div>
                <div style={{ fontSize: 11, color: LIGHT_BLUE }}>{g.p} · Download →</div>
              </a>
            ) : (
              <div key={i} style={{ padding: "18px 16px", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: 8, opacity: 0.5 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{g.t}</div>
                <div style={{ fontSize: 11, color: AMBER }}>{g.p}</div>
              </div>
            )
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── INDUSTRIES (CONDENSED) ──────────────────────────
function Industries() {
  const verts = [
    { n: "Financial Services", sub: "7 sub-verticals", h: "/industries/financial-services" },
    { n: "Healthcare", sub: "6 sub-verticals", h: "/industries/healthcare" },
    { n: "Retail + eCommerce", sub: "6 sub-verticals", h: "/industries/retail" },
    { n: "Insurance", sub: "5 sub-verticals", h: "/industries/insurance" },
    { n: "Telecom", sub: "5 sub-verticals", h: "/industries/telecom" },
    { n: "Government", sub: "6 sub-verticals", h: "/industries/government" },
    { n: "Travel + Hospitality", sub: "5 sub-verticals", h: "/industries/travel" },
    { n: "Utilities", sub: "4 sub-verticals", h: "/industries/utilities" },
    { n: "Manufacturing", sub: "5 sub-verticals", h: "/industries/manufacturing" },
    { n: "Education", sub: "5 sub-verticals", h: "/industries/education" },
  ];
  return (
    <section style={{ background: WARM, padding: "48px 28px", borderBottom: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Industry intelligence</span>
            <span style={{ fontSize: 12, color: "rgba(107,127,153,0.6)", marginLeft: 12 }}>10 verticals · 61 sub-verticals · 2,135 capability checkpoints</span>
          </div>
          <a href="/industries" style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC }}>All industries →</a>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {verts.map((v, i) => (
            <a key={i} href={v.h} style={{ padding: "10px 16px", border: `1px solid ${BORDER}`, borderRadius: 6, background: "#fff", fontSize: 13, fontWeight: 500, color: NAVY, transition: "all 0.15s", textDecoration: "none" }}
              onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.color = ELECTRIC; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = NAVY; }}>
              {v.n}
              <span style={{ fontSize: 11, color: MUTED, marginLeft: 6 }}>{v.sub}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── RESEARCH (COMPACT) ─────────────────────────────
function Research() {
  const pieces = [
    { tag: "Reality Check", t: "Why Your CCaaS Migration Didn't Cut Costs", read: "8 min", href: "/research/ccaas-migration-costs" },
    { tag: "Market Map", t: "Agent Assist: Who's Real vs Who's Marketing", read: "12 min" },
    { tag: "Operator Briefing", t: "What 50–70% Automation Actually Requires", read: "10 min" },
  ];
  return (
    <section style={{ background: "#fff", padding: "48px 28px", borderBottom: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: MUTED }}>Latest research</span>
          <a href="/research" style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC }}>All articles →</a>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="tools-grid">
          {pieces.map((p, i) => {
            const Tag = p.href ? "a" : "div";
            const linkProps = p.href ? { href: p.href } : {};
            return (
              <FadeIn key={i} delay={i * 0.05}>
                <Tag {...linkProps} style={{ display: "block", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "18px 16px", transition: "all 0.2s", textDecoration: "none", color: "inherit", cursor: "pointer" }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.2, textTransform: "uppercase" }}>{p.tag}</span>
                    <span style={{ fontSize: 11, color: MUTED }}>{p.read}</span>
                  </div>
                  <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 17, fontWeight: 400, color: NAVY, margin: 0, lineHeight: 1.3 }}>{p.t}</h3>
                </Tag>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── WHAT THIS IS (NOT "About Us" — just a line) ────
function WhatThis() {
  return (
    <section style={{ background: WARM, padding: "40px 28px", borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ ...WRAP, maxWidth: 700, textAlign: "center" }}>
        <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic", fontSize: 17, color: NAVY, lineHeight: 1.65, margin: 0, opacity: 0.7 }}>
          Built by operators for operators. No vendor pays to be here. No vendor pays to rank higher. The scores, the tools, and the research exist because CX professionals deserve a resource that is not trying to sell them something.
        </p>
      </div>
    </section>
  );
}

// ─── ADVISORY (WHISPER, NOT SHOUT) ──────────────────
function AdvisoryNote() {
  return (
    <section style={{ background: "#fff", padding: "36px 28px", borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ ...WRAP, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>Need a human?</span>
          <span style={{ fontSize: 14, color: MUTED, marginLeft: 8 }}>We also do vendor-neutral advisory for CX leaders navigating platform decisions.</span>
        </div>
        <a href="/contact" style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC, padding: "8px 20px", border: `1px solid ${ELECTRIC}`, borderRadius: 6, transition: "all 0.15s", flexShrink: 0 }}
          onMouseOver={e => { e.target.style.background = ELECTRIC; e.target.style.color = "#fff"; }}
          onMouseOut={e => { e.target.style.background = "transparent"; e.target.style.color = ELECTRIC; }}>Request a working session</a>
      </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: DEEP_NAVY, padding: "48px 28px 32px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={WRAP}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 36 }} className="footer-grid">
          <div>
            <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, textDecoration: "none" }}>
              <svg width="24" height="24" viewBox="0 0 120 120">
                <g transform="translate(60,60)">
                  <path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
                  <path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity="0.7"/>
                  <path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
                  <line x1="-14" y1="-14" x2="14" y2="14" stroke={LIGHT_BLUE} strokeWidth="5.5" strokeLinecap="round"/>
                  <line x1="14" y1="-14" x2="-14" y2="14" stroke={LIGHT_BLUE} strokeWidth="5.5" strokeLinecap="round"/>
                </g>
              </svg>
              <span style={{ color: "#fff", fontWeight: 600, fontSize: 12.5 }}>THE CENTER OF <span style={{ color: LIGHT_BLUE }}>CX</span></span>
            </a>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", lineHeight: 1.6, maxWidth: 280 }}>
              Independent CX + contact center technology intelligence. Vendor-neutral. Operationally grounded.
            </p>
          </div>
          {[
            { h: "Navigate", links: [
              { name: "Vendors", href: "/vendors" },
              { name: "Tools", href: "/how-to-choose" },
              { name: "Industries", href: "/industries" },
              { name: "Research", href: "/research" },
              { name: "Platforms + Tech", href: "/platforms-and-tech" },
            ]},
            { h: "Resources", links: [
              { name: "CCaaS Buyer Guide", href: "/research/ccaas-buyer-guide" },
              { name: "IVA Buyer Guide", href: "/research/iva-buyer-guide" },
              { name: "CX Ecosystem", href: "/cx-ecosystem" },
              { name: "The Human Premium", href: "/human-premium" },
              { name: "Newsletter", href: "/subscribe" },
            ]},
            { h: "Company", links: [
              { name: "About", href: "/about" },
              { name: "Advisory", href: "/advisory" },
              { name: "Contact", href: "/contact" },
            ]},
          ].map((col, i) => (
            <div key={i}>
              <h4 style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>{col.h}</h4>
              {col.links.map(l => <a key={l.name} href={l.href} style={{ display: "block", fontSize: 12.5, color: "rgba(255,255,255,0.35)", marginBottom: 8, transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = "#fff"} onMouseOut={e => e.target.style.color = "rgba(255,255,255,0.35)"}>{l.name}</a>)}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 20, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>© 2026 The Center of CX. All rights reserved.</span>
          <div style={{ display: "flex", gap: 20 }}>
            {["Privacy", "Terms"].map(l => <a key={l} href="#" style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = "rgba(255,255,255,0.4)"} onMouseOut={e => e.target.style.color = "rgba(255,255,255,0.2)"}>{l}</a>)}
          </div>
        </div>
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
      <QuickBar />
      <RolePaths />
      <FeaturedTools />
      <VendorIntel />
      <BuyerGuides />
      <Industries />
      <Research />
      <WhatThis />
      <AdvisoryNote />
      <Footer />
    </div>
  );
}
