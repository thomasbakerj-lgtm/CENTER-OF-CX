import { useState, useEffect } from "react";
import { FONT, FONT_IMPORT_CSS } from "./src/lib/type";
import { HOUSE, PILLARS, LINE, alpha } from "./src/lib/tokens.js";
import { METHOD_VERSIONS } from "./src/lib/methodVersions.js";

const NAVY = HOUSE.mist;
const DEEP = HOUSE.ink;
const ELECTRIC = PILLARS.diagnostics.onDark;
const LIGHT = PILLARS.diagnostics.onDark;
const ICE = HOUSE.navy;
const WARM = HOUSE.navy;
const SLATE = HOUSE.body;
const MUTED = HOUSE.muted;
const BORDER = alpha(HOUSE.mist, LINE.hair);
const GREEN = HOUSE.mist;
const AMBER = HOUSE.mist;
const RED = HOUSE.mist;

const WRAP = { maxWidth: 1080, margin: "0 auto", padding: "0 28px" };


/* Descriptions say what each tool gives you, restated from its published method (copy audit, 30 Sep 2026). The groups
   follow the decision a reader is making. No tool is marked popular: there is no usage data behind such a mark. */
const CATEGORIES = [
  { id: "workforce", label: "Workforce and quality", color: AMBER, desc: "How many agents, where their time goes, and how quality is judged",
    tools: [
      { title: "Staffing Requirement Calculator", method: "staffing-calculator", desc: "Agents and scheduled FTE for your busiest interval through Erlang C, and the year priced from your hours open.", href: "/tools/staffing-calculator" },
      { title: "Shrinkage Planner", method: "shrinkage-planner", desc: "The paid time that never reaches the queue, the agents it takes to cover it, and what that time costs.", href: "/tools/shrinkage-planner" },
      { title: "Occupancy Risk Simulator", method: "occupancy-risk", desc: "What reaching your occupancy target costs in hiring against what running hot costs in attrition.", href: "/tools/occupancy-risk" },
      { title: "Forecast Accuracy Tracker", method: "forecast-accuracy", desc: "Forecast error interval by interval, whether the forecast leans one way, and the workload the misses create.", href: "/tools/forecast-accuracy" },
      { title: "Schedule Adherence Calculator", method: "schedule-adherence", desc: "The service level each point of adherence loss costs, and the overtime it takes to hold your target.", href: "/tools/schedule-adherence" },
      { title: "AHT Decomposition", method: "aht-decomposition", desc: "Handle time split into its parts, and the agent hours each initiative you are weighing would free.", href: "/tools/aht-decomposition" },
      { title: "QA Scorecard Builder", method: "qa-scorecard", desc: "A QA form checked for scores you can defend, and blind calibration that shows whether your evaluators agree.", href: "/tools/qa-scorecard" },
    ]},
  { id: "cost", label: "Cost and savings", color: RED, desc: "What the operation costs, and what a change is worth once you act on it",
    tools: [
      { title: "TCO Calculator", method: "tco-calculator", desc: "Monthly, yearly and three-year cost from labor, technology and overhead, per contact and per resolution.", href: "/tools/tco-calculator" },
      { title: "Cost per Contact Calculator", method: "cost-per-contact", desc: "Cost per resolution, the cost of repeat demand, and the capacity an FCR improvement releases.", href: "/tools/cost-per-contact" },
      { title: "FCR Leakage Diagnostic", method: "fcr-leakage", desc: "Repeat contacts and their yearly cost, and how much improvement the root causes let you plan on.", href: "/tools/fcr-leakage" },
      { title: "Attrition Cost Calculator", method: "attrition-cost", desc: "What each agent departure costs in cash and lost capacity, and why agents are leaving.", href: "/tools/attrition-cost" },
      { title: "Business Case Builder", method: "business-case-builder", desc: "Whether a change pays back over three years, graded by how sure the inputs are.", href: "/tools/business-case" },
    ]},
  { id: "ai", label: "AI and automation", color: PILLARS.research.onDark, desc: "What automation removes from demand, and whether you are ready for it",
    tools: [
      { title: "AI Deflection Reality Check", method: "ai-deflection", desc: "The share of demand an AI program durably removes, what it is worth after its costs, and where it breaks even.", href: "/tools/ai-deflection" },
      { title: "Channel Shift Model", method: "channel-shift", desc: "Agent minutes freed when voice moves to chat, bot or email, net of fees, transition cost and repeats.", href: "/tools/channel-shift" },
      { title: "AI Readiness Diagnostic", method: "ai-readiness", desc: "How ready your data, workflows, integrations and governance are for AI, and which gaps to close first.", href: "/tools/ai-readiness" },
    ]},
  { id: "vendors", label: "Vendors, renewals and contracts", color: ELECTRIC, desc: "From the renewal question to a signed contract",
    tools: [
      { title: "Platform Decision", method: "platform-decision", desc: "Renew, renew with conditions, add a specialist or run an evaluation, and whether there is time before your notice date.", href: "/tools/platform-decision" },
      { title: "Vendor Match Engine", desc: "A starting list of CCaaS vendors from your environment and priorities, on the Phase 1 model with its method shown.", href: "/tools/vendor-match" },
      { title: "RFP Requirement Builder", method: "rfp-builder", desc: "Weighted requirements by layer, then vendor responses scored: who meets every must-have and what to verify in the demo.", href: "/tools/rfp-builder" },
      { title: "License Bundle Gap Checker", method: "license-gap", desc: "The quoted seat price against what the platform costs with add-ons, usage fees, commits and renewal uplift.", href: "/tools/license-gap" },
      { title: "Contract Risk Scanner", method: "contract-risk", desc: "13 contract clauses read against published severities, with the position to ask for on every flag.", href: "/tools/contract-risk" },
    ]},
  { id: "readiness", label: "Readiness and planning", color: GREEN, desc: "Where you stand, who owns what, and the plan",
    tools: [
      { title: "CX Maturity Assessment", method: "cx-maturity", desc: "Where you sit on a five-level rubric across strategy, operations, technology, analytics and governance.", href: "/tools/cx-maturity" },
      { title: "Transformation Readiness", method: "transformation-readiness", desc: "Whether you are ready to commit budget to a platform change, and the gaps to close before you do.", href: "/tools/transformation-readiness" },
      { title: "CX and IT Alignment", method: "cx-it-alignment", desc: "Where CX and IT see the same capability differently, and where both agree it is missing.", href: "/tools/cx-it-alignment" },
      { title: "Governance and Operating Model", method: "governance-model", desc: "Who is accountable for 30 CX decisions, and where a decision is unowned or one function is overloaded.", href: "/tools/governance-model" },
      { title: "Roadmap Builder", desc: "A 90-day plan with milestones, owners and what each one is waiting on.", href: "/tools/roadmap-builder" },
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
    <div style={{ fontFamily: FONT, minHeight: "100vh" }}>
      <style>{`
        ${FONT_IMPORT_CSS}
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; color: inherit; }
        @media (max-width: 860px) { .nav-links { display: none !important; } .mob-btn { display: flex !important; } .cat-jump { flex-wrap: wrap !important; } }
      `}</style>

      {/* Nav */}
      

      {/* Header */}
      <section style={{ background: DEEP, padding: "72px 28px 20px" }}>
        <div style={WRAP}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: FONT, fontSize: 28, fontWeight: 600, color: HOUSE.mist, margin: "0 0 4px" }}>{totalTools} free contact center tools</h1>
              <p style={{ fontSize: 13, color: HOUSE.body }}>Each runs in your browser, publishes its method and gives you a report. No sign-in.</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a href="/research/ccaas-buyer-guide" style={{ fontSize: 12, color: LIGHT, padding: "5px 12px", borderRadius: 4, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}` }}>CCaaS Guide ↓</a>
              <a href="/research/iva-buyer-guide" style={{ fontSize: 12, color: LIGHT, padding: "5px 12px", borderRadius: 4, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}` }}>IVA Guide ↓</a>
            </div>
          </div>
        </div>
      </section>

      {/* Category jump bar */}
      <section style={{ background: HOUSE.ink, borderBottom: `1px solid ${BORDER}`, padding: "0 28px", position: "sticky", top: 46, zIndex: 100 }}>
        <div style={{ ...WRAP, display: "flex", gap: 2, padding: "8px 0", overflow: "auto" }} className="cat-jump">
          {CATEGORIES.map(c => (
            <a key={c.id} href={`#${c.id}`} style={{ padding: "6px 14px", fontSize: 12, fontWeight: 600, borderRadius: 5, color: MUTED, border: `1px solid ${BORDER}`, whiteSpace: "nowrap", transition: "all 0.15s" }}
              onMouseOver={e => { e.target.style.color = c.color; e.target.style.borderColor = c.color; }}
              onMouseOut={e => { e.target.style.color = MUTED; e.target.style.borderColor = BORDER; }}>
              {c.label} <span style={{ opacity: 0.8 }}>({c.tools.length})</span>
            </a>
          ))}
        </div>
      </section>

      {/* Categories with tools */}
      <section style={{ background: HOUSE.ink, padding: "20px 28px 48px" }}>
        <div style={WRAP}>
          {CATEGORIES.map((cat, ci) => (
            <div key={cat.id} id={cat.id} style={{ marginBottom: ci < CATEGORIES.length - 1 ? 36 : 0, scrollMarginTop: 100 }}>
              {/* Category header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, paddingTop: ci > 0 ? 12 : 0, borderTop: ci > 0 ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ width: 4, height: 24, borderRadius: 2, background: cat.color }} />
                <div>
                  <h2 style={{ fontFamily: FONT, fontSize: 20, fontWeight: 600, color: NAVY, margin: 0 }}>{cat.label}</h2>
                  <span style={{ fontSize: 12, color: MUTED }}>{cat.desc}</span>
                </div>
              </div>

              {/* Tool list as clean rows, not tiles */}
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
                        {t.method && METHOD_VERSIONS[t.method] && <span style={{ fontSize: 11, color: MUTED, flexShrink: 0 }}>Method {METHOD_VERSIONS[t.method].version}</span>}
                      </div>
                      <span style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.4 }}>{t.desc}</span>
                    </div>
                    <span style={{ color: cat.color, fontSize: 13, fontWeight: 600, flexShrink: 0 }}>Open →</span>
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
          <span style={{ fontSize: 13, color: MUTED }}>Need help interpreting results? <a href="/contact" style={{ color: ELECTRIC, fontWeight: 600 }}>Connect with a consultant →</a></span>
          <span style={{ fontSize: 12, color: HOUSE.body }}>All tools are free. No sales call required.</span>
        </div>
      </section>

      {/* Footer */}
      
    </div>
  );
}
