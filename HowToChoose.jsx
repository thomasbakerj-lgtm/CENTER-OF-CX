import { useState, useEffect } from "react";

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

const WRAP = { maxWidth: 1080, margin: "0 auto", padding: "0 28px" };

function LogoMark({ size = 28, light = true }) {
  const a = light ? "#fff" : NAVY, x = light ? LIGHT : ELECTRIC;
  return <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light ? .6 : .3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light ? .8 : .5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>;
}

const CATEGORIES = [
  { id: "wfm", label: "WFM + Staffing", color: AMBER, desc: "The tools operators actually need daily",
    tools: [
      { title: "Staffing Requirement Calculator", desc: "Erlang C model. Volume, AHT, SLA, and shrinkage to required FTE.", href: "/tools/staffing-calculator", popular: true },
      { title: "Shrinkage Planner", desc: "8-category shrinkage modeling. See the staffing gap and annual cost.", href: "/tools/shrinkage-planner" },
      { title: "Occupancy Risk Simulator", desc: "When efficiency becomes burnout. The math behind 85% occupancy.", href: "/tools/occupancy-risk" },
      { title: "Forecast Accuracy Tracker", desc: "Forecast vs actual. MAPE, bias, and worst-interval analysis.", href: "/tools/forecast-accuracy" },
      { title: "Schedule Adherence Calculator", desc: "How 1-10 points of adherence loss cascades into SLA and overtime.", href: "/tools/schedule-adherence" },
    ]},
  { id: "cost", label: "Cost + Economics", color: RED, desc: "The math the vendor slide skips",
    tools: [
      { title: "TCO Calculator", desc: "What your stack actually costs per agent, per contact, per resolution.", href: "/tco-calculator", popular: true },
      { title: "Attrition Cost Calculator", desc: "Full cost of every departure: recruiting, training, ramp, OT, QA drag.", href: "/tools/attrition-cost" },
      { title: "Cost per Contact vs Resolution", desc: "Handle cost and resolution cost are different numbers.", href: "/tools/cost-per-contact" },
      { title: "AI Deflection Reality Check", desc: "Net savings after leakage, containment failure, and escalation.", href: "/tools/ai-deflection", popular: true },
      { title: "Channel Shift Economics", desc: "What really happens to staffing when voice migrates to chat or bot.", href: "/tools/channel-shift" },
      { title: "License Bundle Gap Checker", desc: "Quoted seat price vs what you actually need. The gap runs 40-100%.", href: "/tools/license-gap" },
    ]},
  { id: "quality", label: "Performance + Quality", color: "#7C3AED", desc: "Measure what actually drives outcomes",
    tools: [
      { title: "AHT Decomposition", desc: "Break AHT into talk, hold, wrap, transfer, search, admin.", href: "/tools/aht-decomposition", popular: true },
      { title: "Agent Experience Diagnostic", desc: "Five dimensions that drive retention and attrition risk.", href: "/tools/agent-experience" },
      { title: "QA Scorecard Builder", desc: "Weighted QA forms by contact type. Critical-fail criteria. Test mode.", href: "/tools/qa-scorecard" },
      { title: "FCR Leakage Diagnostic", desc: "What drives repeat contacts across 6 root-cause dimensions.", href: "/tools/fcr-leakage" },
      { title: "Calibration Drift Checker", desc: "Evaluator consistency. Inter-rater reliability and bias detection.", href: "/tools/calibration-drift" },
    ]},
  { id: "selection", label: "Vendor Selection", color: ELECTRIC, desc: "From shortlist to signed contract",
    tools: [
      { title: "Vendor Match Engine", desc: "Ranked shortlist from 24 scored vendors. Environment, priorities, compliance.", href: "/tools/vendor-match", popular: true },
      { title: "Platform Decision Matrix", desc: "Stay, extend, or replace — layer-by-layer across 7 orchestration layers.", href: "/tools/platform-decision" },
      { title: "Contract Risk Scanner", desc: "7 contract terms analyzed. Negotiation recommendations for every flag.", href: "/tools/contract-risk" },
      { title: "Transformation Readiness", desc: "Go/no-go assessment. Six dimensions. Phased recommendation.", href: "/tools/transformation-readiness" },
    ]},
  { id: "assessment", label: "Assessments + Scorecards", color: GREEN, desc: "Where do you stand",
    tools: [
      { title: "CX Maturity Assessment", desc: "Strategy, ops, tech, analytics, governance. 25 questions. Tier classification.", href: "/tools/cx-maturity" },
      { title: "AI Readiness Diagnostic", desc: "Whether your data, workflows, and governance are ready for AI.", href: "/tools/ai-readiness" },
      { title: "Experience Scorecard", desc: "CSAT, FCR, cost-per-contact, containment scored across dimensions.", href: "/tools/experience-scorecard" },
    ]},
  { id: "framework", label: "Frameworks + Planning", color: "#0099CC", desc: "Build the plan, not just the score",
    tools: [
      { title: "CX-IT Alignment Framework", desc: "Bridge the gap between experience vision and tech execution.", href: "/tools/cx-it-alignment" },
      { title: "Governance + Operating Model", desc: "Who owns what across CX strategy, ops, and AI.", href: "/tools/governance-model" },
      { title: "Service Design Toolkit", desc: "Journey mapping, effort scoring, and friction analysis.", href: "/tools/service-design" },
      { title: "Roadmap Builder", desc: "90-day planning template with milestones and dependencies.", href: "/tools/roadmap-builder" },
      { title: "Integration Planner", desc: "Map your stack across the seven orchestration layers.", href: "/tools/integration-planner" },
      { title: "Business Case Builder", desc: "The ROI narrative for your board, built from your real numbers.", href: "/tools/business-case" },
    ]},
];

export default function HowToChoose() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", fn, { passive: true }); return () => window.removeEventListener("scroll", fn); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const totalTools = CATEGORIES.reduce((a, c) => a + c.tools.length, 0);
  const navLinks = [
    { name: "Vendors", href: "/vendors" },
    { name: "Tools", href: "/how-to-choose" },
    { name: "Industries", href: "/industries" },
    { name: "Research", href: "/research" },
    { name: "The Human Premium", href: "/human-premium" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: #fff; color: ${NAVY}; -webkit-font-smoothing: antialiased; }
        a { text-decoration: none; color: inherit; }
        @media (max-width: 860px) { .nav-links { display: none !important; } .mob-btn { display: flex !important; } .cat-jump { flex-wrap: wrap !important; } }
      `}</style>

      {/* Nav */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: scrolled ? "rgba(6,19,37,0.97)" : DEEP, backdropFilter: scrolled ? "blur(14px)" : "none", borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "all 0.3s", padding: "10px 0" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13.5 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 26 }}>
            {navLinks.map(l => <a key={l.name} href={l.href} style={{ color: l.name === "Tools" ? "#fff" : "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: l.name === "Tools" ? 600 : 500, borderBottom: l.name === "Tools" ? `2px solid ${ELECTRIC}` : "2px solid transparent", paddingBottom: 2, transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = "#fff"} onMouseOut={e => e.target.style.color = l.name === "Tools" ? "#fff" : "rgba(255,255,255,0.6)"}>{l.name}</a>)}
            <a href="/subscribe" style={{ color: "#fff", fontSize: 12, fontWeight: 600, background: ELECTRIC, padding: "7px 16px", borderRadius: 5 }}>Subscribe</a>
          </div>
          <button className="mob-btn" onClick={() => setOpen(!open)} style={{ display: "none", flexDirection: "column", gap: 4, background: "none", border: "none", cursor: "pointer", padding: 8 }}>{[0,1,2].map(i => <div key={i} style={{ width: 18, height: 2, background: "#fff", borderRadius: 1 }} />)}</button>
        </div>
        {open && <div style={{ background: DEEP, padding: "16px 28px", display: "flex", flexDirection: "column", gap: 14 }}>{navLinks.map(l => <a key={l.name} href={l.href} style={{ color: "rgba(255,255,255,0.8)", fontSize: 15 }}>{l.name}</a>)}</div>}
      </nav>

      {/* Header */}
      <section style={{ background: DEEP, padding: "72px 28px 20px" }}>
        <div style={WRAP}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: "#fff", margin: "0 0 4px" }}>CX Pro Tools</h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>{totalTools} tools across {CATEGORIES.length} categories. Free. Immediate output.</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a href="/research/ccaas-buyer-guide" style={{ fontSize: 11, color: LIGHT, padding: "5px 12px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)" }}>CCaaS Guide ↓</a>
              <a href="/research/iva-buyer-guide" style={{ fontSize: 11, color: LIGHT, padding: "5px 12px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.1)" }}>IVA Guide ↓</a>
            </div>
          </div>
        </div>
      </section>

      {/* Category jump bar */}
      <section style={{ background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "0 28px", position: "sticky", top: 46, zIndex: 100 }}>
        <div style={{ ...WRAP, display: "flex", gap: 2, padding: "8px 0", overflow: "auto" }} className="cat-jump">
          {CATEGORIES.map(c => (
            <a key={c.id} href={`#${c.id}`} style={{ padding: "6px 14px", fontSize: 12, fontWeight: 600, borderRadius: 5, color: MUTED, border: `1px solid ${BORDER}`, whiteSpace: "nowrap", transition: "all 0.15s" }}
              onMouseOver={e => { e.target.style.color = c.color; e.target.style.borderColor = c.color; }}
              onMouseOut={e => { e.target.style.color = MUTED; e.target.style.borderColor = BORDER; }}>
              {c.label} <span style={{ opacity: 0.4 }}>({c.tools.length})</span>
            </a>
          ))}
        </div>
      </section>

      {/* Categories with tools */}
      <section style={{ background: "#fff", padding: "20px 28px 48px" }}>
        <div style={WRAP}>
          {CATEGORIES.map((cat, ci) => (
            <div key={cat.id} id={cat.id} style={{ marginBottom: ci < CATEGORIES.length - 1 ? 36 : 0, scrollMarginTop: 100 }}>
              {/* Category header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, paddingTop: ci > 0 ? 12 : 0, borderTop: ci > 0 ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ width: 4, height: 24, borderRadius: 2, background: cat.color }} />
                <div>
                  <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, fontWeight: 400, color: NAVY, margin: 0 }}>{cat.label}</h2>
                  <span style={{ fontSize: 12, color: MUTED }}>{cat.desc}</span>
                </div>
              </div>

              {/* Tool list — clean rows, not tiles */}
              <div style={{ border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
                {cat.tools.map((t, ti) => (
                  <a key={ti} href={t.href} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
                    padding: "14px 18px",
                    borderBottom: ti < cat.tools.length - 1 ? `1px solid ${BORDER}` : "none",
                    transition: "background 0.12s", textDecoration: "none", color: "inherit",
                  }}
                    onMouseOver={e => e.currentTarget.style.background = ICE}
                    onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{t.title}</span>
                        {t.popular && <span style={{ fontSize: 9, fontWeight: 700, color: GREEN, letterSpacing: 0.6, textTransform: "uppercase", background: `${GREEN}10`, padding: "2px 6px", borderRadius: 3, flexShrink: 0 }}>Popular</span>}
                      </div>
                      <span style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.4 }}>{t.desc}</span>
                    </div>
                    <span style={{ color: cat.color, fontSize: 13, fontWeight: 600, flexShrink: 0 }}>Launch →</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Advisory whisper */}
      <section style={{ background: WARM, padding: "24px 28px", borderTop: `1px solid ${BORDER}` }}>
        <div style={{ ...WRAP, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 13, color: MUTED }}>Need help interpreting results? <a href="/contact" style={{ color: ELECTRIC, fontWeight: 600 }}>Request a working session →</a></span>
          <span style={{ fontSize: 12, color: "rgba(107,127,153,0.5)" }}>All tools are free. No sales call required.</span>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: DEEP, padding: "32px 28px 20px" }}>
        <div style={{ ...WRAP, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={22} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 12 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>© 2026 The Center of CX</span>
        </div>
      </footer>
    </div>
  );
}
