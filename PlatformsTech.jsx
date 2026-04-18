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

// ─── NAV (same as homepage) ──────────────────────────
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
        @media (max-width: 860px) { .nav-links { display: none !important; } .mob-btn { display: flex !important; } .orch-grid { grid-template-columns: 1fr !important; } .hero-split { grid-template-columns: 1fr !important; } .cat-grid { grid-template-columns: 1fr !important; } }
      `}</style>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: scrolled ? "rgba(6,19,37,0.96)" : "transparent", backdropFilter: scrolled ? "blur(14px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "all 0.35s", padding: scrolled ? "12px 0" : "20px 0" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <svg width="34" height="34" viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
              <g transform="translate(60,60)">
                <path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
                <path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity="0.8"/>
                <path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>
                <line x1="-14" y1="-14" x2="14" y2="14" stroke={LIGHT} strokeWidth="5.5" strokeLinecap="round"/>
                <line x1="14" y1="-14" x2="-14" y2="14" stroke={LIGHT} strokeWidth="5.5" strokeLinecap="round"/>
              </g>
            </svg>
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 14.5, letterSpacing: 0.4, fontFamily: "'DM Sans', sans-serif" }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span>
          </a>
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {links.map((l, i) => <a key={l.name} href={l.href} style={{ color: i === 0 ? "#fff" : "rgba(255,255,255,0.7)", fontSize: 13.5, fontWeight: i === 0 ? 600 : 500, fontFamily: "'DM Sans', sans-serif", transition: "color 0.2s", borderBottom: i === 0 ? `2px solid ${ELECTRIC}` : "2px solid transparent", paddingBottom: 2 }}>{l.name}</a>)}
            <a href="/contact" style={{ color: "#fff", fontSize: 13, fontWeight: 600, background: ELECTRIC, padding: "9px 20px", borderRadius: 6, fontFamily: "'DM Sans', sans-serif" }}>Request Briefing</a>
          </div>
        </div>
      </nav>
    </>
  );
}

// ─── HERO ────────────────────────────────────────────
function Hero() {
  return (
    <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "140px 28px 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
      <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.06) 0%, transparent 70%)" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Home</a>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
            <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Platforms & Tech</span>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 64, alignItems: "center" }} className="hero-split">
          <FadeIn delay={0.05}>
            <div>
              <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(34px, 4.5vw, 56px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 20px" }}>
                The CX technology landscape,{" "}
                <span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>organized for decisions.</span>
              </h1>
              <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 520, margin: "0 0 32px", fontFamily: "'DM Sans', sans-serif" }}>
                Nine decision domains mapped to seven orchestration layers. A framework for understanding what you actually need, who owns it, and what breaks when you choose wrong.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href="#categories" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "13px 24px", borderRadius: 7, fontFamily: "'DM Sans', sans-serif", boxShadow: `0 4px 18px rgba(0,136,221,0.25)` }}>Explore Categories</a>
                <a href="#orchestration" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 14, fontWeight: 500, padding: "13px 24px", borderRadius: 7, fontFamily: "'DM Sans', sans-serif" }}>View Orchestration Model →</a>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "28px 24px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>Each category answers</div>
              {["Who owns this decision", "When you need it (and when you don't)", "What breaks if you choose wrong", "Which vendors lead — and where they fall short", "How it maps to the orchestration stack"].map((q, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: `rgba(0,136,221,0.12)`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700 }}>✓</span>
                  </div>
                  <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{q}</span>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─── ORCHESTRATION LAYERS ────────────────────────────
function OrchestrationLayers() {
  const [active, setActive] = useState(null);
  const layers = [
    { n: 7, name: "Analytics, Feedback & Governance", color: "#1a5276", href: "/vendors/analytics", categories: [{t:"WEM (QM/WFM/Coaching)"}, {t:"Recording & Compliance"}, {t:"Speech Analytics",h:"/vendors/analytics"}, {t:"Text Analytics",h:"/vendors/analytics"}, {t:"Journey Analytics",h:"/vendors/analytics"}], roles: "WFM Analyst, QA Leader, Data Analyst, Compliance Officer" },
    { n: 6, name: "Routing & Experience Orchestration", color: "#1a6b8a", href: "/vendors/acd-routing", categories: [{t:"ACD / Routing",h:"/vendors/acd-routing"}, {t:"Outbound Notifications"}, {t:"Agent Desktop / Workspace"}], roles: "CX Architect, Routing Specialist, Product Manager" },
    { n: 5, name: "Conversation Management", color: "#1a7f9e", href: "/vendors/digital-engagement", categories: [{t:"Digital Engagement (chat, messaging, social)",h:"/vendors/digital-engagement"}, {t:"Voice/Telephony"}, {t:"Mobile/App Engagement"}, {t:"IVA (legacy bots)",h:"/vendors/iva"}, {t:"Agent Desktop / Workspace"}], roles: "Conversation Engineer, CX Designer, Telephony Architect" },
    { n: 4, name: "Reasoning & Planning", color: "#0e8c7f", href: "/vendors/iva", categories: [{t:"Virtual Assistants (LLM-native)",h:"/vendors/iva"}, {t:"Agent Assist"}, {t:"Knowledge AI"}, {t:"Autonomous Agents / AI Workers"}], roles: "Conversation Engineer, AI Trainer, CX Architect" },
    { n: 3, name: "Policy & Guardrails", color: "#0e7a5e", href: "/vendors/payments", categories: [{t:"Payments & PCI Vaults",h:"/vendors/payments"}, {t:"Fraud/Risk Systems"}], roles: "Compliance Officer, Fraud Ops, Risk Analyst" },
    { n: 2, name: "Workflow Execution", color: "#1a6b4a", categories: [{t:"RPA (UiPath, AA)"}, {t:"iPaaS (MuleSoft, Workato)"}, {t:"BPMN / Workflow Engines (Camunda, Pega)"}], roles: "Automation Engineer, Integration Engineer, Workflow Designer" },
    { n: 1, name: "Data Access", color: "#2c5f3f", categories: [{t:"CRM"}, {t:"Case/Ticketing"}, {t:"ERP/Billing/Orders"}, {t:"Event Streaming"}, {t:"ITSM"}], roles: "Data Product Owner, Data Engineer, Finance Ops" },
  ];

  return (
    <section id="orchestration" style={{ background: WARM, padding: "96px 28px", borderBottom: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 56px" }}>
            <Label>The Orchestration Model</Label>
            <Title>Seven layers. Every CX technology maps to at least one.</Title>
            <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.65, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
              This isn't a vendor diagram. It's an operating architecture. Understanding which layer a technology lives in tells you who should own it, what it depends on, and what governance it requires.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            {layers.map((layer, i) => {
              const isActive = active === i;
              return (
                <div key={i}
                  onClick={() => setActive(isActive ? null : i)}
                  style={{
                    cursor: "pointer", transition: "all 0.25s",
                    marginBottom: 4,
                    borderRadius: i === 0 ? "12px 12px 0 0" : i === layers.length - 1 ? "0 0 12px 12px" : 0,
                    overflow: "hidden",
                  }}>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "18px 24px",
                    background: isActive ? layer.color : `${layer.color}12`,
                    border: `1px solid ${isActive ? layer.color : BORDER}`,
                    borderRadius: i === 0 && !isActive ? "12px 12px 0 0" : i === layers.length - 1 && !isActive ? "0 0 12px 12px" : isActive ? "10px 10px 0 0" : 0,
                    transition: "all 0.25s",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 6,
                        background: isActive ? "rgba(255,255,255,0.15)" : `${layer.color}20`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 14,
                        color: isActive ? "#fff" : layer.color,
                        fontFamily: "'DM Sans', sans-serif",
                      }}>
                        {layer.n}
                      </div>
                      <div>
                        <span style={{
                          fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                          color: isActive ? "rgba(255,255,255,0.6)" : MUTED,
                          fontFamily: "'DM Sans', sans-serif",
                        }}>Layer {layer.n}</span>
                        <h3 style={{
                          fontFamily: "'Instrument Serif', Georgia, serif",
                          fontSize: 18, fontWeight: 400,
                          color: isActive ? "#fff" : NAVY,
                          margin: 0, lineHeight: 1.3,
                        }}>{layer.name}</h3>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 18, color: isActive ? "#fff" : MUTED,
                      transform: isActive ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform 0.25s",
                    }}>▾</span>
                  </div>

                  {isActive && (
                    <div style={{
                      background: "#fff", border: `1px solid ${BORDER}`, borderTop: "none",
                      borderRadius: "0 0 10px 10px", padding: "24px",
                    }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="orch-grid">
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>Technologies in this layer</div>
                          {layer.categories.map((c, ci) => (
                            <div key={ci} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                              <div style={{ width: 4, height: 4, borderRadius: "50%", background: layer.color, flexShrink: 0 }} />
                              {c.h ? (
                                <a href={c.h} style={{ fontSize: 13.5, color: ELECTRIC, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", borderBottom: `1px solid ${ELECTRIC}30`, transition: "border-color 0.2s" }}
                                  onMouseOver={e => e.target.style.borderColor = ELECTRIC}
                                  onMouseOut={e => e.target.style.borderColor = `${ELECTRIC}30`}>{c.t}</a>
                              ) : (
                                <span style={{ fontSize: 13.5, color: SLATE, fontFamily: "'DM Sans', sans-serif" }}>{c.t}</span>
                              )}
                            </div>
                          ))}
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>Typical owners</div>
                          <p style={{ fontSize: 13.5, color: SLATE, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>{layer.roles}</p>
                          <div style={{ marginTop: 16 }}>
                            <a href={layer.href || "/vendors"} style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC, fontFamily: "'DM Sans', sans-serif" }}>See vendors in this layer →</a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <a href="/research/orchestration-framework" style={{ fontSize: 14, fontWeight: 600, color: ELECTRIC, fontFamily: "'DM Sans', sans-serif" }}>Download the full orchestration framework (PDF) →</a>
          </div>
        </FadeIn>

        <FadeIn delay={0.25}>
          <a href="/seven-layers-map.html" target="_blank" rel="noopener noreferrer" style={{ display: "block", marginTop: 48, background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(0,136,221,0.08) 100%)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, overflow: "hidden", textDecoration: "none", color: "inherit", transition: "all 0.3s" }}
            onMouseOver={e => { e.currentTarget.style.borderColor = "rgba(0,136,221,0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,136,221,0.12)"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ padding: "32px 32px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: LIGHT, boxShadow: `0 0 12px ${LIGHT}`, animation: "pulse 2.4s ease-in-out infinite" }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: LIGHT, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>Interactive Experience</span>
                </div>
                <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: "#fff", margin: "0 0 8px" }}>7-Layer Orchestration Map</h3>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: "0 0 16px", fontFamily: "'DM Sans', sans-serif", maxWidth: 480 }}>
                  Watch a live customer interaction flow through all seven layers in real time. Toggle between Leader, Manager, and Agent lenses. Switch scenarios. See which layers are handled by AI and which require human judgment.
                </p>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {["Auto-playing scenarios", "Role-based lenses", "Live KPI dashboard", "AI vs Human routing"].map(f => (
                    <span key={f} style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'DM Sans', sans-serif" }}>{f}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, width: 140 }}>
                  {[
                    { n: "L1", c: "#2c5f3f" }, { n: "L2", c: "#1a6b4a" }, { n: "L3", c: "#0e7a5e" }, { n: "L4", c: "#0e8c7f" },
                    { n: "L5", c: "#1a7f9e" }, { n: "L6", c: "#1a6b8a" }, { n: "L7", c: "#1a5276" },
                  ].map(l => (
                    <div key={l.n} style={{ background: l.c, borderRadius: 3, padding: "6px 0", textAlign: "center", fontSize: 8, color: "#fff", fontWeight: 600, fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.5 }}>{l.n}</div>
                  ))}
                </div>
                <span style={{ background: ELECTRIC, color: "#fff", fontSize: 13, fontWeight: 600, padding: "12px 24px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 14px rgba(0,136,221,0.3)" }}>Launch Full Map →</span>
              </div>
            </div>
          </a>
          <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.5;transform:scale(0.8);} }`}</style>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── NINE DECISION DOMAINS ───────────────────────────
function Categories() {
  const cats = [
    {
      t: "Core CX Platforms", s: "CCaaS", layers: "5, 6, 7", href: "/vendors/ccaas",
      d: "The foundational platform for voice, digital channels, routing, and workforce management. Most enterprises already have one — the real question is whether to optimize, extend, or replace.",
      questions: ["Who should not switch platforms", "When add-ons beat rip-and-replace", "Platform-native AI vs best-of-breed"],
      vendors: "Genesys, NICE, Five9, AWS Connect, Cisco, Talkdesk, 8x8, Zoom",
    },
    {
      t: "Customer Automation & Self-Service AI", s: "IVA · Bots · Autonomous Resolution", layers: "4, 5", href: "/vendors/iva",
      d: "The fastest-moving category in the stack. From legacy intent-based IVAs to LLM-native virtual assistants and fully autonomous AI workers handling multi-step tasks.",
      questions: ["Platform-native vs best-of-breed AI", "Where AI fails in production", "Containment rate realities"],
      vendors: "Cognigy, Kore.ai, Ada, Google CCAI, Nuance, PolyAI",
    },
    {
      t: "Agent Assist & Knowledge", s: "Real-time Intelligence · RAG · Knowledge AI", layers: "4", href: "/vendors/agent-assist",
      d: "Real-time guidance, knowledge retrieval, summarization, and next-best-action delivered to agents during live interactions. The adoption gap here is enormous.",
      questions: ["Real-time vs post-contact value", "RAG realities and grounding quality", "Adoption traps most teams hit"],
      vendors: "Uniphore, Observe.AI, Cresta, Coveo, Shelf, Guru",
    },
    {
      t: "Workforce & Quality Management", s: "WEM · QM · WFM · Coaching", layers: "7", href: "/vendors/wem-qm",
      d: "Forecasting, scheduling, quality monitoring, coaching, and performance management. AI is transforming QA from 2% sample reviews to 100% automated evaluation.",
      questions: ["AI QA vs human QA — what actually works", "Forecasting truth in volatile environments", "Cost control levers most teams miss"],
      vendors: "NICE, Verint, Calabrio, Genesys WEM, Five9",
    },
    {
      t: "Experience Analytics & VoC", s: "Speech · Text · Journey Analytics", layers: "7", href: "/vendors/analytics",
      d: "Understanding what's actually happening in customer interactions — sentiment, topics, root cause, journey patterns — versus what your dashboards claim is happening.",
      questions: ["Root cause vs vanity metrics", "Journey visibility across fragmented systems", "When speech analytics ROI is real vs theoretical"],
      vendors: "CallMiner, Observe.AI, Qualtrics, Genesys, Verint",
    },
    {
      t: "CX Orchestration & Workflow", s: "Routing · Integration · Process Automation", layers: "2, 6", href: "/vendors/acd-routing",
      d: "The glue layer. How interactions get routed, how systems share data, how workflows execute across CRM, CCaaS, and back-office systems. Routing as a standalone category is dead.",
      questions: ["Orchestration patterns that actually work", "CCaaS + CRM + ITSM convergence", "iPaaS vs RPA vs workflow engines"],
      vendors: "MuleSoft, Workato, Camunda, Pega, UiPath",
    },
    {
      t: "Enterprise & Employee Service", s: "ITSM · EX-CX Overlap", layers: "1, 2", href: "/vendors",
      d: "When internal service management belongs in the CX stack and when it doesn't. The overlap between employee experience and customer experience creates real architectural questions.",
      questions: ["When ITSM belongs in CX", "What you should never unify", "The EX-CX connection that matters"],
      vendors: "ServiceNow, BMC, Jira Service Management, Freshservice",
    },
    {
      t: "Payments, Identity & Trust", s: "PCI · Authentication · Fraud", layers: "3", href: "/vendors/payments",
      d: "The compliance and security layer that most CX strategies ignore until something breaks. PCI, authentication friction, fraud prevention, and identity verification within the service workflow.",
      questions: ["PCI segmentation in modern stacks", "Authentication vs customer effort tradeoffs", "Fraud prevention without CX destruction"],
      vendors: "Stripe, Adyen, Forter, Sift, BioCatch, PCI Proxy",
    },
    {
      t: "Digital Engagement", s: "Chat · Messaging · Social · CPaaS", layers: "5", href: "/vendors/digital-engagement",
      d: "Multi-channel digital engagement platforms, conversational messaging, social media management, and CPaaS. The layer that connects your brand to customers on the channels they actually use.",
      questions: ["Messaging vs chat — what's the real difference", "Social CX management at scale", "CPaaS vs platform-native digital channels"],
      vendors: "Ada, Intercom, Sprinklr, Zendesk, Khoros, Gladly",
    },
  ];

  return (
    <section id="categories" style={{ background: "#fff", padding: "96px 28px" }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ maxWidth: 640, marginBottom: 56 }}>
            <Label>Nine Decision Domains</Label>
            <Title>These are buying decisions. Each one carries real risk.</Title>
            <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.65, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
              Every category is framed around the decision a CX leader actually faces. Each one maps to specific orchestration layers, has distinct budget owners, and carries different risks when you choose wrong.
            </p>
          </div>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {cats.map((c, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div style={{
                border: `1px solid ${BORDER}`, borderRadius: 12,
                padding: "32px 28px", cursor: "pointer",
                transition: "all 0.22s", background: "#fff",
              }}
                onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.boxShadow = "0 6px 28px rgba(0,136,221,0.06)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, alignItems: "start" }} className="cat-grid">
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif" }}>{c.s}</span>
                      <span style={{ fontSize: 11, color: MUTED, fontFamily: "'DM Sans', sans-serif", background: `${ELECTRIC}08`, padding: "2px 8px", borderRadius: 4 }}>Layers {c.layers}</span>
                    </div>
                    <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 8px", lineHeight: 1.25 }}>{c.t}</h3>
                    <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, margin: "0 0 16px", fontFamily: "'DM Sans', sans-serif" }}>{c.d}</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {c.questions.map((q, qi) => (
                        <span key={qi} style={{
                          fontSize: 12, color: SLATE, fontFamily: "'DM Sans', sans-serif",
                          background: ICE, padding: "5px 10px", borderRadius: 5,
                        }}>{q}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderLeft: `1px solid ${BORDER}`, paddingLeft: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>Key vendors</div>
                    <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>{c.vendors}</p>
                    <a href={c.href || "/vendors"} style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC, fontFamily: "'DM Sans', sans-serif" }}>Explore category →</a>
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

// ─── ARCHITECTURE EVOLUTION ──────────────────────────
function ArchEvolution() {
  const [era, setEra] = useState(1);
  const eras = [
    {
      label: "~2015", tag: "On-Prem Era",
      arch: "On-prem ACD + IVR + CTI with point-solution WFM & recording",
      components: "PBX/ACD, IVR, CTI, WFM, recording, basic reporting",
      automation: "5–10% containment via IVR self-service",
      tco: "$450–$800",
      cost_driver: "Human labor + CapEx hardware/software",
      unit: "Cost per FTE",
    },
    {
      label: "Today", tag: "CCaaS Era",
      arch: "CCaaS core + add-on AI + some RPA/iPaaS",
      components: "CCaaS (omnichannel), IVA/VA, WEM suite, RPA/iPaaS, analytics, knowledge",
      automation: "20–40% automation via IVA/VA + simple workflows",
      tco: "$305–$540",
      cost_driver: "Human labor + SaaS licenses",
      unit: "Cost per contact",
    },
    {
      label: "~2030", tag: "AI-Native Era",
      arch: "AI-native orchestration layer over CCaaS + automation fabric",
      components: "Orchestration engine (7–9 layers), AI workers, CCaaS as commodity, data fabric & governance",
      automation: "50–70%+ automation via AI workers + deep workflows",
      tco: "$325–$600",
      cost_driver: "Human labor for exceptions + AI/automation spend",
      unit: "Cost per successfully completed task/journey",
    },
  ];
  const e = eras[era];

  return (
    <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "96px 28px", position: "relative" }}>
      <div style={{ position: "absolute", top: "30%", right: 0, width: 500, height: 500, background: "radial-gradient(circle, rgba(0,136,221,0.04) 0%, transparent 70%)" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 48px" }}>
            <Label light>Architecture Evolution</Label>
            <Title light>TCO doesn't drop linearly. Spend shifts from infrastructure to AI.</Title>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", lineHeight: 1.65, marginTop: 4, fontFamily: "'DM Sans', sans-serif" }}>
              Based on a ~500-seat contact center, mixed voice + digital. All-in TCO per agent per month including platform, licenses, infra, and implementation amortized.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          {/* Era Selector */}
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 40 }}>
            {eras.map((er, i) => (
              <button key={i} onClick={() => setEra(i)} style={{
                background: era === i ? ELECTRIC : "rgba(255,255,255,0.05)",
                border: `1px solid ${era === i ? ELECTRIC : "rgba(255,255,255,0.08)"}`,
                color: era === i ? "#fff" : "rgba(255,255,255,0.5)",
                padding: "10px 24px", borderRadius: 6, cursor: "pointer",
                fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s",
              }}>
                {er.label} <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.7, marginLeft: 4 }}>{er.tag}</span>
              </button>
            ))}
          </div>

          {/* Era Detail */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {[
              { label: "Architecture", value: e.arch },
              { label: "Core Components", value: e.components },
              { label: "Tier 1 Automation", value: e.automation },
              { label: "All-in TCO / Agent / Month", value: e.tco, highlight: true },
              { label: "Primary Cost Driver", value: e.cost_driver },
              { label: "Unit of Optimization", value: e.unit },
            ].map((item, ii) => (
              <div key={ii} style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10, padding: "22px 20px",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: LIGHT, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>{item.label}</div>
                <div style={{
                  fontSize: item.highlight ? 28 : 14,
                  fontFamily: item.highlight ? "'Instrument Serif', Georgia, serif" : "'DM Sans', sans-serif",
                  color: item.highlight ? ELECTRIC : "rgba(255,255,255,0.6)",
                  lineHeight: 1.5,
                }}>{item.value}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", lineHeight: 1.6, maxWidth: 600, margin: "0 auto 20px", fontFamily: "'DM Sans', sans-serif" }}>
              Cost per resolved interaction drops sharply as automation rises — even as per-agent TCO flattens. The winning metric shifts from cost-per-agent to cost-per-successful-task.
            </p>
            <a href="/contact" style={{ fontSize: 14, fontWeight: 600, color: LIGHT, fontFamily: "'DM Sans', sans-serif" }}>Calculate your stack's TCO →</a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────
function CTA() {
  return (
    <section style={{ background: WARM, padding: "96px 28px", borderTop: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
            <Title>Need help navigating the stack?</Title>
            <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.65, margin: "8px 0 32px", fontFamily: "'DM Sans', sans-serif" }}>
              Whether you're evaluating platforms, planning an AI pilot, or trying to make sense of your current vendor landscape, we offer vendor-neutral advisory grounded in independent research and real operational experience.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", boxShadow: `0 4px 18px rgba(0,136,221,0.2)` }}>Request a Working Session</a>
              <a href="/how-to-choose" style={{ background: "#fff", border: `1px solid ${BORDER}`, color: NAVY, fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif" }}>Download Buyer Guide</a>
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
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span>
          </a>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif" }}>© 2026 The Center of CX. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

// ─── APP ─────────────────────────────────────────────
export default function PlatformsTech() {
  return (
    <div>
      <Nav />
      <Hero />
      <OrchestrationLayers />
      <Categories />
      <ArchEvolution />
      <CTA />
      <Footer />
    </div>
  );
}
