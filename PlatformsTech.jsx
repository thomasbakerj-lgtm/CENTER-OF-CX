import { useState, useEffect } from "react";
import { HOUSE, PILLARS, LINE, LAYERS, alpha } from "./src/lib/tokens.js";
const LAYER = (n) => LAYERS.find((l) => l.n === n).color;
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


/* Content is visible from the first paint: no reveal on scroll, so a served page, a print and a quick scroll never show an empty band. */
function FadeIn({ children, style = {} }) { return <div style={style}>{children}</div>; }

const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };
const Label = ({ children, light }) => <span style={{ color: light ? LIGHT : ELECTRIC, fontSize: 11.5, fontWeight: 700, letterSpacing: 2.2, textTransform: "uppercase", fontFamily: FONT, display: "block", marginBottom: 12 }}>{children}</span>;
const Title = ({ children, light }) => <h2 style={{ fontFamily: FONT, fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 400, color: HOUSE.mist, lineHeight: 1.15, margin: "0 0 16px", letterSpacing: "-0.015em" }}>{children}</h2>;

// ─── NAV (same as homepage) ──────────────────────────
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
        @media (max-width: 860px) { .nav-links { display: none !important; } .mob-btn { display: flex !important; } .orch-grid { grid-template-columns: 1fr !important; } .hero-split { grid-template-columns: 1fr !important; } .cat-grid { grid-template-columns: 1fr !important; } }
      `}</style>
      
    </>
  );
}

// ─── HERO ────────────────────────────────────────────
function Hero() {
  return (
    <section style={{ background: HOUSE.navy, padding: "140px 28px 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "none", backgroundSize: "64px 64px" }} />
      <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "none" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <a href="/" style={{ color: HOUSE.body, fontSize: 13, fontFamily: FONT }}>Home</a>
            <span style={{ color: HOUSE.body, fontSize: 13 }}>/</span>
            <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600, fontFamily: FONT }}>Platforms & Tech</span>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 64, alignItems: "center" }} className="hero-split">
          <FadeIn delay={0.05}>
            <div>
              <h1 style={{ fontFamily: FONT, fontSize: "clamp(34px, 4.5vw, 56px)", fontWeight: 400, color: HOUSE.mist, lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 20px" }}>
                The CX technology landscape,{" "}
                <span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>organized for decisions.</span>
              </h1>
              <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: HOUSE.body, lineHeight: 1.7, maxWidth: 520, margin: "0 0 32px", fontFamily: FONT }}>
                Nine decision domains mapped to seven orchestration layers. A framework for understanding what you actually need, who owns it, and what breaks when you choose wrong.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href="#categories" style={{ background: HOUSE.action, color: HOUSE.paper, fontSize: 14, fontWeight: 600, padding: "13px 24px", borderRadius: 7, fontFamily: FONT, boxShadow: "none" }}>Explore Categories</a>
                <a href="#orchestration" style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, color: HOUSE.mist, fontSize: 14, fontWeight: 500, padding: "13px 24px", borderRadius: 7, fontFamily: FONT }}>View Orchestration Model →</a>
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, borderRadius: 14, padding: "28px 24px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 16, fontFamily: FONT }}>Each category answers</div>
              {["Who owns this decision", "When you need it (and when you don't)", "What breaks if you choose wrong", "Which vendors lead: and where they fall short", "How it maps to the orchestration stack"].map((q, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: i < 4 ? `1px solid ${alpha(HOUSE.mist, LINE.hair)}` : "none" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 4, background: alpha(HOUSE.sky2, LINE.soft), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700 }}>✓</span>
                  </div>
                  <span style={{ fontSize: 13.5, color: HOUSE.body, lineHeight: 1.5, fontFamily: FONT }}>{q}</span>
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
    { n: 7, name: "Analytics, Feedback & Governance", color: LAYER(7), href: "/vendors/analytics", categories: [{t:"WEM (QM/WFM/Coaching)"}, {t:"Recording & Compliance"}, {t:"Speech Analytics",h:"/vendors/analytics"}, {t:"Text Analytics",h:"/vendors/analytics"}, {t:"Journey Analytics",h:"/vendors/analytics"}], roles: "WFM Analyst, QA Leader, Data Analyst, Compliance Officer" },
    { n: 6, name: "Routing & Experience Orchestration", color: LAYER(6), href: "/vendors/acd-routing", categories: [{t:"ACD / Routing",h:"/vendors/acd-routing"}, {t:"Outbound Notifications"}, {t:"Agent Desktop / Workspace"}], roles: "CX Architect, Routing Specialist, Product Manager" },
    { n: 5, name: "Conversation Management", color: LAYER(5), href: "/vendors/digital-engagement", categories: [{t:"Digital Engagement (chat, messaging, social)",h:"/vendors/digital-engagement"}, {t:"Voice/Telephony"}, {t:"Mobile/App Engagement"}, {t:"IVA (legacy bots)",h:"/vendors/iva"}, {t:"Agent Desktop / Workspace"}], roles: "Conversation Engineer, CX Designer, Telephony Architect" },
    { n: 4, name: "Reasoning & Planning", color: LAYER(4), href: "/vendors/iva", categories: [{t:"Virtual Assistants (LLM-native)",h:"/vendors/iva"}, {t:"Agent Assist"}, {t:"Knowledge AI"}, {t:"Autonomous Agents / AI Workers"}], roles: "Conversation Engineer, AI Trainer, CX Architect" },
    { n: 3, name: "Policy & Guardrails", color: LAYER(3), href: "/vendors/payments", categories: [{t:"Payments & PCI Vaults",h:"/vendors/payments"}, {t:"Fraud/Risk Systems"}], roles: "Compliance Officer, Fraud Ops, Risk Analyst" },
    { n: 2, name: "Workflow Execution", color: LAYER(2), categories: [{t:"RPA (UiPath, AA)"}, {t:"iPaaS (MuleSoft, Workato)"}, {t:"BPMN / Workflow Engines (Camunda, Pega)"}], roles: "Automation Engineer, Integration Engineer, Workflow Designer" },
    { n: 1, name: "Data Access", color: LAYER(1), categories: [{t:"CRM"}, {t:"Case/Ticketing"}, {t:"ERP/Billing/Orders"}, {t:"Event Streaming"}, {t:"ITSM"}], roles: "Data Product Owner, Data Engineer, Finance Ops" },
  ];

  return (
    <section id="orchestration" style={{ background: WARM, padding: "96px 28px", borderBottom: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 56px" }}>
            <Label>The Orchestration Model</Label>
            <Title>Seven layers. Every CX technology maps to at least one.</Title>
            <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.65, marginTop: 4, fontFamily: FONT }}>
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
                        background: isActive ? alpha(HOUSE.mist, LINE.soft) : alpha(layer.color, LINE.hair),
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 14,
                        color: HOUSE.mist,
                        fontFamily: FONT,
                      }}>
                        {layer.n}
                      </div>
                      <div>
                        <span style={{
                          fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase",
                          color: isActive ? HOUSE.body : MUTED,
                          fontFamily: FONT,
                        }}>Layer {layer.n}</span>
                        <h3 style={{
                          fontFamily: FONT,
                          fontSize: 18, fontWeight: 400,
                          color: HOUSE.mist,
                          margin: 0, lineHeight: 1.3,
                        }}>{layer.name}</h3>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 18, color: isActive ? HOUSE.mist : MUTED,
                      transform: isActive ? "rotate(180deg)" : "rotate(0)",
                      transition: "transform 0.25s",
                    }}>▾</span>
                  </div>

                  {isActive && (
                    <div style={{
                      background: HOUSE.ink, border: `1px solid ${BORDER}`, borderTop: "none",
                      borderRadius: "0 0 10px 10px", padding: "24px",
                    }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="orch-grid">
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, fontFamily: FONT }}>Technologies in this layer</div>
                          {layer.categories.map((c, ci) => (
                            <div key={ci} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
                              <div style={{ width: 4, height: 4, borderRadius: "50%", background: layer.color, flexShrink: 0 }} />
                              {c.h ? (
                                <a href={c.h} style={{ fontSize: 13.5, color: ELECTRIC, fontWeight: 500, fontFamily: FONT, borderBottom: `1px solid ${ELECTRIC}30`, transition: "border-color 0.2s" }}
                                  onMouseOver={e => e.target.style.borderColor = ELECTRIC}
                                  onMouseOut={e => e.target.style.borderColor = `${ELECTRIC}30`}>{c.t}</a>
                              ) : (
                                <span style={{ fontSize: 13.5, color: SLATE, fontFamily: FONT }}>{c.t}</span>
                              )}
                            </div>
                          ))}
                        </div>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10, fontFamily: FONT }}>Typical owners</div>
                          <p style={{ fontSize: 13.5, color: SLATE, lineHeight: 1.6, fontFamily: FONT }}>{layer.roles}</p>
                          <div style={{ marginTop: 16 }}>
                            <a href={layer.href || "/vendors"} style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC, fontFamily: FONT }}>See vendors in this layer →</a>
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
            <a href="/research/orchestration-framework" style={{ fontSize: 14, fontWeight: 600, color: ELECTRIC, fontFamily: FONT }}>Download the full orchestration framework (PDF) →</a>
          </div>
        </FadeIn>

        <FadeIn delay={0.25}>
          <a href="/seven-layers-map.html" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 32, background: HOUSE.navy, border: `1px solid ${BORDER}30`, borderRadius: 10, padding: "20px 24px", textDecoration: "none", color: "inherit", transition: "all 0.25s", gap: 20, flexWrap: "wrap" }}
            onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "none"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = `${BORDER}30`; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 240 }}>
              <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
                {[1,2,3,4,5,6,7].map((n) => LAYER(n)).map((c,i) => (
                  <div key={i} style={{ width: 6, height: 28 + i*3, borderRadius: 2, background: c }} />
                ))}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: LIGHT, boxShadow: `0 0 8px ${LIGHT}` }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: LIGHT, letterSpacing: 1.8, textTransform: "uppercase" }}>Interactive</span>
                </div>
                <h3 style={{ fontFamily: FONT, fontSize: 18, fontWeight: 400, color: HOUSE.mist, margin: 0 }}>7-Layer Orchestration Map</h3>
                <p style={{ fontSize: 12, color: HOUSE.body, margin: "4px 0 0", maxWidth: 400 }}>Live scenarios showing how interactions flow through all 7 layers. Role lenses, KPI dashboard, AI vs human routing.</p>
              </div>
            </div>
            <span style={{ background: HOUSE.action, color: HOUSE.paper, fontSize: 13, fontWeight: 600, padding: "10px 22px", borderRadius: 6, flexShrink: 0 }}>Launch Map →</span>
          </a>
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
      d: "The foundational platform for voice, digital channels, routing, and workforce management. Most enterprises already have one: the real question is whether to optimize, extend, or replace.",
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
      d: "Forecasting, scheduling, quality monitoring, coaching, and performance management. AI is moving QA from reviewing a small sample of contacts toward evaluating every one.",
      questions: ["AI QA vs human QA: what actually works", "Forecasting truth in volatile environments", "Cost control levers most teams miss"],
      vendors: "NICE, Verint, Calabrio, Genesys WEM, Five9",
    },
    {
      t: "Experience Analytics & VoC", s: "Speech · Text · Journey Analytics", layers: "7", href: "/vendors/analytics",
      d: "Understanding what's actually happening in customer interactions, sentiment, topics, root cause, journey patterns, versus what your dashboards claim is happening.",
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
      questions: ["Messaging vs chat: what's the real difference", "Social CX management at scale", "CPaaS vs platform-native digital channels"],
      vendors: "Ada, Intercom, Sprinklr, Zendesk, Khoros, Gladly",
    },
  ];

  return (
    <section id="categories" style={{ background: HOUSE.ink, padding: "96px 28px" }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ maxWidth: 640, marginBottom: 56 }}>
            <Label>Nine Decision Domains</Label>
            <Title>These are buying decisions. Each one carries real risk.</Title>
            <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.65, marginTop: 4, fontFamily: FONT }}>
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
                transition: "all 0.22s", background: HOUSE.ink,
              }}
                onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.boxShadow = "none"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32, alignItems: "start" }} className="cat-grid">
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: FONT }}>{c.s}</span>
                      <span style={{ fontSize: 11, color: MUTED, fontFamily: FONT, background: `${ELECTRIC}08`, padding: "2px 8px", borderRadius: 4 }}>Layers {c.layers}</span>
                    </div>
                    <h3 style={{ fontFamily: FONT, fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 8px", lineHeight: 1.25 }}>{c.t}</h3>
                    <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.65, margin: "0 0 16px", fontFamily: FONT }}>{c.d}</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {c.questions.map((q, qi) => (
                        <span key={qi} style={{
                          fontSize: 12, color: SLATE, fontFamily: FONT,
                          background: ICE, padding: "5px 10px", borderRadius: 5,
                        }}>{q}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ borderLeft: `1px solid ${BORDER}`, paddingLeft: 24 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8, fontFamily: FONT }}>Key vendors</div>
                    <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, marginBottom: 16, fontFamily: FONT }}>{c.vendors}</p>
                    <a href={c.href || "/vendors"} style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC, fontFamily: FONT }}>Explore category →</a>
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
      automation: "IVR self-service for simple, structured requests",
      cost_driver: "Human labor + CapEx hardware/software",
      unit: "Cost per FTE",
    },
    {
      label: "Today", tag: "CCaaS Era",
      arch: "CCaaS core + add-on AI + some RPA/iPaaS",
      components: "CCaaS (omnichannel), IVA/VA, WEM suite, RPA/iPaaS, analytics, knowledge",
      automation: "IVA and virtual agents plus simple workflows",
      cost_driver: "Human labor + SaaS licenses",
      unit: "Cost per contact",
    },
    {
      label: "~2030", tag: "AI-Native Era",
      arch: "AI-native orchestration layer over CCaaS + automation fabric",
      components: "Orchestration engine (7 to 9 layers), AI workers, CCaaS as commodity, data fabric & governance",
      automation: "AI workers plus deep workflows",
      cost_driver: "Human labor for exceptions + AI/automation spend",
      unit: "Cost per successfully completed task/journey",
    },
  ];
  const e = eras[era];

  return (
    <section style={{ background: HOUSE.navy, padding: "96px 28px", position: "relative" }}>
      <div style={{ position: "absolute", top: "30%", right: 0, width: 500, height: 500, background: "none" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 48px" }}>
            <Label light>Architecture Evolution</Label>
            <Title light>Spend shifts from infrastructure to AI.</Title>
            <p style={{ fontSize: 15, color: HOUSE.body, lineHeight: 1.65, marginTop: 4, fontFamily: FONT }}>
              How the architecture, the automation and the cost driver change from one era to the next. It describes the shape of the change and carries no prices. To put numbers on your own operation, run the <a href="/tools/tco-calculator" style={{ color: HOUSE.sky2, fontWeight: 600 }}>TCO calculator</a>.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          {/* Era Selector */}
          <div style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 40 }}>
            {eras.map((er, i) => (
              <button key={i} type="button" aria-pressed={era === i} onClick={() => setEra(i)} style={{
                background: era === i ? HOUSE.action : HOUSE.navy,
                border: `1px solid ${era === i ? HOUSE.action : alpha(HOUSE.mist, LINE.hair)}`,
                color: era === i ? HOUSE.paper : HOUSE.body,
                padding: "10px 24px", borderRadius: 6, cursor: "pointer",
                fontSize: 14, fontWeight: 600, fontFamily: FONT,
                transition: "all 0.2s",
              }}>
                {er.label} <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 4 }}>{er.tag}</span>
              </button>
            ))}
          </div>

          {/* Era Detail */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {[
              { label: "Architecture", value: e.arch },
              { label: "Core Components", value: e.components },
              { label: "Tier 1 Automation", value: e.automation },
              { label: "Primary Cost Driver", value: e.cost_driver },
              { label: "Unit of Optimization", value: e.unit },
            ].map((item, ii) => (
              <div key={ii} style={{
                background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`,
                borderRadius: 10, padding: "22px 20px",
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: LIGHT, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6, fontFamily: FONT }}>{item.label}</div>
                <div style={{
                  fontSize: item.highlight ? 28 : 14,
                  fontFamily: FONT, fontWeight: item.highlight ? 600 : 400,
                  color: item.highlight ? ELECTRIC : HOUSE.body,
                  lineHeight: 1.5,
                }}>{item.value}</div>
              </div>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <p style={{ fontSize: 14, color: HOUSE.body, lineHeight: 1.6, maxWidth: 600, margin: "0 auto 20px", fontFamily: FONT }}>
              Where automation resolves more of the work, the measure that matters moves from cost per agent to cost per successfully completed task.
            </p>
            <a href="/contact" style={{ fontSize: 14, fontWeight: 600, color: LIGHT, fontFamily: FONT }}>Calculate your stack's TCO →</a>
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
            <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.65, margin: "8px 0 32px", fontFamily: FONT }}>
              Whether you're evaluating platforms, planning an AI pilot, or trying to make sense of your current vendor landscape, we connect you with vetted consultants who specialize in your stack, vertical, and transformation stage.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <a href="/contact" style={{ background: HOUSE.action, color: HOUSE.paper, fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, fontFamily: FONT, boxShadow: "none" }}>Connect with a Consultant →</a>
              <a href="/how-to-choose" style={{ background: HOUSE.ink, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, fontFamily: FONT }}>Download Buyer Guide</a>
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
    null
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