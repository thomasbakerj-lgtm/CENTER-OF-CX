import { useState, useEffect } from "react";
import ReportExport from "./ReportExport";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 960, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=28,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const VERTICALS = ["Financial Services","Healthcare","Retail + eCommerce","Telecom","Insurance","Travel + Hospitality","Government","Utilities","Manufacturing","Education","Other"];
const SIZES = ["Under 50 agents","50-200 agents","200-500 agents","500-1000 agents","1000-5000 agents","5000+ agents"];

const LAYERS = [
  { n: 7, name: "Analytics + Governance", color: "#1a5276", reqs: [
    { text: "Real-time operational dashboards with customizable KPIs", priority: "must", tags: ["all"] },
    { text: "AI-powered quality management evaluating 100% of interactions", priority: "must", tags: ["enterprise","quality"] },
    { text: "Speech and text analytics with sentiment and topic detection", priority: "should", tags: ["all"] },
    { text: "Compliance recording with role-based access and audit trails", priority: "must", tags: ["regulated"] },
    { text: "WFM forecasting within 5% accuracy at interval level", priority: "must", tags: ["wfm"] },
    { text: "Closed-loop feedback from analytics into routing and coaching", priority: "should", tags: ["enterprise"] },
    { text: "Custom reporting API with data export in standard formats", priority: "should", tags: ["all"] },
    { text: "AI model performance monitoring and drift detection", priority: "nice", tags: ["ai"] },
  ]},
  { n: 6, name: "Routing + Orchestration", color: "#1a6b8a", reqs: [
    { text: "Skills-based routing with weighted multi-attribute matching", priority: "must", tags: ["all"] },
    { text: "Intent-driven routing using AI classification of customer need", priority: "should", tags: ["ai","enterprise"] },
    { text: "Dynamic priority based on customer value, wait time, and predicted complexity", priority: "should", tags: ["enterprise"] },
    { text: "Cross-channel routing preserving context between voice and digital", priority: "must", tags: ["digital"] },
    { text: "Real-time queue management with intraday adjustment without admin intervention", priority: "should", tags: ["wfm"] },
    { text: "Callback scheduling with estimated wait time communication", priority: "must", tags: ["all"] },
    { text: "Overflow and failover routing with configurable business rules", priority: "must", tags: ["all"] },
  ]},
  { n: 5, name: "Conversation Management", color: "#1a7f9e", reqs: [
    { text: "Unified voice and digital channels from a single platform", priority: "must", tags: ["all"] },
    { text: "Agent desktop consolidation — under 3 applications for full interaction handling", priority: "should", tags: ["all"] },
    { text: "Cross-channel context continuity (chat-to-phone preserves full history)", priority: "must", tags: ["digital"] },
    { text: "WhatsApp, Apple Business Chat, RCS, and SMS messaging channels", priority: "should", tags: ["digital"] },
    { text: "Co-browse and screen sharing for complex issue resolution", priority: "nice", tags: ["enterprise"] },
    { text: "Async conversation management with SLA tracking", priority: "should", tags: ["digital"] },
    { text: "Video support for high-value or complex interactions", priority: "nice", tags: ["enterprise"] },
  ]},
  { n: 4, name: "Reasoning + AI", color: "#0e8c7f", reqs: [
    { text: "IVA/chatbot with natural language understanding across voice and digital", priority: "must", tags: ["ai"] },
    { text: "Real-time agent assist with suggested responses during live interactions", priority: "should", tags: ["ai"] },
    { text: "Knowledge AI with RAG grounding on enterprise data sources", priority: "should", tags: ["ai","enterprise"] },
    { text: "AI-generated interaction summaries and auto-disposition", priority: "should", tags: ["ai"] },
    { text: "Autonomous task execution (booking, cancellation, status change) not just text generation", priority: "nice", tags: ["ai"] },
    { text: "Guardrails preventing hallucination, off-topic responses, and policy violations", priority: "must", tags: ["ai"] },
    { text: "Human escalation with full AI conversation context transferred to agent", priority: "must", tags: ["ai"] },
  ]},
  { n: 3, name: "Policy + Guardrails", color: "#0e7a5e", reqs: [
    { text: "PCI DSS compliance with payment tokenization or pause/resume recording", priority: "must", tags: ["regulated","payments"] },
    { text: "HIPAA BAA with PHI encryption at rest and in transit", priority: "must", tags: ["healthcare"] },
    { text: "FedRAMP High authorization", priority: "must", tags: ["government"] },
    { text: "SOC 2 Type II certification current within 12 months", priority: "must", tags: ["all"] },
    { text: "GDPR and CCPA compliance with data subject request handling", priority: "must", tags: ["regulated"] },
    { text: "Role-based access control with SSO/SAML integration", priority: "must", tags: ["enterprise"] },
    { text: "Data residency options for geographic compliance requirements", priority: "should", tags: ["enterprise","regulated"] },
    { text: "AI decision audit trails for customer-facing automated actions", priority: "should", tags: ["ai","regulated"] },
  ]},
  { n: 2, name: "Workflow Execution", color: "#1a6b4a", reqs: [
    { text: "End-to-end workflow automation for top 10 contact types", priority: "should", tags: ["all"] },
    { text: "CRM integration with real-time read/write (Salesforce, ServiceNow, Dynamics, HubSpot)", priority: "must", tags: ["all"] },
    { text: "API-triggered workflows from external events (not just UI-initiated)", priority: "should", tags: ["enterprise"] },
    { text: "Cross-system data writes — agent actions update billing, CRM, and case systems simultaneously", priority: "should", tags: ["enterprise"] },
    { text: "Workflow versioning and rollback capability", priority: "nice", tags: ["enterprise"] },
    { text: "Low-code workflow builder for business users (not developer-only)", priority: "should", tags: ["all"] },
  ]},
  { n: 1, name: "Data Access + Infrastructure", color: "#2c5f3f", reqs: [
    { text: "99.99% uptime SLA with financial credits for breaches", priority: "must", tags: ["all"] },
    { text: "BYOC (Bring Your Own Carrier) support for existing telephony relationships", priority: "should", tags: ["enterprise"] },
    { text: "Open API architecture with rate limits sufficient for production integration", priority: "must", tags: ["all"] },
    { text: "Event streaming / webhooks for real-time interaction signals", priority: "should", tags: ["enterprise"] },
    { text: "CDR and interaction data export in standard formats (CSV, JSON, API)", priority: "must", tags: ["all"] },
    { text: "Multi-region deployment for disaster recovery and data residency", priority: "should", tags: ["enterprise","regulated"] },
    { text: "SSO, SCIM provisioning, and directory integration", priority: "must", tags: ["enterprise"] },
  ]},
];

const TAG_FILTERS = [
  { id: "all", label: "Core Requirements", desc: "Applies to all evaluations" },
  { id: "enterprise", label: "Enterprise", desc: "500+ agents, complex environments" },
  { id: "ai", label: "AI + Automation", desc: "IVA, agent assist, autonomous" },
  { id: "digital", label: "Digital Channels", desc: "Chat, messaging, async" },
  { id: "wfm", label: "Workforce", desc: "Forecasting, scheduling, QA" },
  { id: "regulated", label: "Regulated", desc: "PCI, HIPAA, GDPR" },
  { id: "quality", label: "Quality Focus", desc: "QA automation, coaching" },
];

const VERTICAL_REQS = {
  "Healthcare": ["HIPAA BAA with PHI encryption", "EHR integration (Epic, Oracle Health, athenahealth)", "Patient identity verification across channels", "Appointment scheduling and referral management workflows"],
  "Financial Services": ["PCI DSS Level 1 with tokenization", "Core banking integration (FIS, Fiserv, Jack Henry)", "Identity verification with multi-factor authentication", "FFIEC and GLBA compliance documentation"],
  "Government": ["FedRAMP High authorization", "Section 508 / WCAG 2.1 AA accessibility", "CJIS compliance for law enforcement use cases", "StateRAMP authorization for state/local agencies"],
  "Retail + eCommerce": ["Commerce platform integration (Shopify, BigCommerce, commercetools)", "Seasonal elastic scaling (8-10x volume without pre-provisioning)", "Order management system integration for real-time status", "Returns automation workflow"],
  "Insurance": ["Policy admin integration (Guidewire, Duck Creek)", "Claims FNOL automation through IVA", "State insurance regulation compliance", "Separate routing for service vs claims tracks"],
  "Telecom": ["BSS/OSS platform integration", "Carrier-grade 99.999% availability", "CPNI protection compliance", "Complex IVR support (100+ nodes)"],
};

export default function RFPRequirementBuilder() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState(""); const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState(0);
  const [vertical, setVertical] = useState("");
  const [size, setSize] = useState("");
  const [activeTags, setActiveTags] = useState(["all"]);
  const [reqs, setReqs] = useState({});
  useEffect(() => { window.scrollTo(0,0); }, [phase]);

  const toggleTag = (id) => setActiveTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  const setReq = (layerN, reqIdx, priority) => setReqs(prev => ({ ...prev, [`${layerN}-${reqIdx}`]: priority }));
  const getReq = (layerN, reqIdx, defaultP) => reqs[`${layerN}-${reqIdx}`] || defaultP;

  const isEnterprise = size.includes("500") || size.includes("1000") || size.includes("5000");
  const isRegulated = ["Healthcare","Financial Services","Government","Insurance"].includes(vertical);

  // Auto-select tags based on env
  useEffect(() => {
    const auto = ["all"];
    if (isEnterprise) auto.push("enterprise");
    if (isRegulated) auto.push("regulated");
    if (vertical === "Healthcare") auto.push("healthcare");
    if (vertical === "Government") auto.push("government");
    setActiveTags(auto);
  }, [vertical, size]);

  // Filter and collect requirements
  const getFilteredReqs = () => {
    const result = [];
    LAYERS.forEach(layer => {
      const layerReqs = layer.reqs
        .map((r, i) => ({ ...r, layerN: layer.n, layerName: layer.name, idx: i, priority: getReq(layer.n, i, r.priority) }))
        .filter(r => r.tags.some(t => activeTags.includes(t) || t === "all"));
      if (layerReqs.length > 0) result.push({ layer, reqs: layerReqs });
    });
    return result;
  };

  const filtered = getFilteredReqs();
  const totalReqs = filtered.reduce((a, g) => a + g.reqs.length, 0);
  const mustCount = filtered.reduce((a, g) => a + g.reqs.filter(r => r.priority === "must").length, 0);
  const shouldCount = filtered.reduce((a, g) => a + g.reqs.filter(r => r.priority === "should").length, 0);
  const niceCount = filtered.reduce((a, g) => a + g.reqs.filter(r => r.priority === "nice").length, 0);
  const vertReqs = VERTICAL_REQS[vertical] || [];

  const handleGate = async () => {
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "RFP Requirement Builder", _subject: "RFP Builder Access" }) }); } catch(e) {}
    setSending(false); setPhase("input");
  };

  const handleGenerate = async () => {
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "RFP Requirement Builder", vertical, size, tags: activeTags.join(","), totalReqs, mustCount, _subject: `RFP Builder: ${vertical} | ${size} | ${totalReqs} reqs — ${company || name || email}` }) }); } catch(e) {}
    setPhase("results");
  };

  const priColors = { must: RED, should: AMBER, nice: MUTED };
  const priLabels = { must: "Must Have", should: "Should Have", nice: "Nice to Have" };

  const navLinks = [{ name: "Vendors", href: "/vendors" },{ name: "Tools", href: "/how-to-choose" },{ name: "Industries", href: "/industries" },{ name: "Research", href: "/research" },{ name: "The Human Premium", href: "/human-premium" }];

  // Build report sections for export
  const reportSections = [
    { title: "RFP Context", type: "table", rows: [["Vertical", vertical || "Not specified"],["Size", size || "Not specified"],["Focus Areas", activeTags.filter(t=>t!=="all").map(t => TAG_FILTERS.find(f=>f.id===t)?.label || t).join(", ") || "Core only"],["Total Requirements", totalReqs.toString()],["Must Have", mustCount.toString()],["Should Have", shouldCount.toString()],["Nice to Have", niceCount.toString()]] },
    ...filtered.map(g => ({
      title: `Layer ${g.layer.n}: ${g.layer.name}`,
      type: "table",
      rows: g.reqs.map(r => [r.priority === "must" ? "★ " + r.text : r.text, priLabels[r.priority]]),
    })),
    ...(vertReqs.length > 0 ? [{ title: `${vertical}-Specific Requirements`, type: "findings", items: vertReqs }] : []),
    { title: "Scoring Guidance", type: "text", content: "Weight Must Have requirements at 3x the points of Should Have. Nice to Have should be scored but not weighted in the shortlist decision. Request vendors to self-score each requirement (Fully Native, Available via Add-On, Partner/Marketplace, Roadmap, Not Available) and verify their top 3 claims during structured demos using your scenarios." },
    { title: "Next Steps", type: "next", items: [
      { tool: "Vendor Match Engine", reason: "Get a ranked shortlist before sending this RFP" },
      { tool: "Contract Risk Scanner", reason: "Analyze contract terms alongside RFP responses" },
    ]},
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.pg{grid-template-columns:1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "10px 0", position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13.5 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
          <a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a>
        </div>
      </nav>

      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg,${DEEP},${NAVY})`, padding: "80px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 540 }}>
            <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Vendor Selection</span>
            <h1 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>RFP Requirement Builder</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 32 }}>Generate weighted RFP requirements organized by the 7 orchestration layers. Tailored to your vertical, operation size, and priorities. Output a structured document you can send to vendors.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="text" placeholder="Company" value={company} onChange={e => setCompany(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "14px", fontSize: 15, fontWeight: 600, background: email.includes("@") ? ELECTRIC : SLATE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: email.includes("@") ? 1 : 0.5 }}>{sending ? "Loading..." : "Build RFP Requirements →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "input" && (
        <section style={{ background: "#fff", padding: "64px 28px 48px" }}>
          <div style={{ ...WRAP, maxWidth: 700 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
              {["Environment","Focus Areas","Review + Customize"].map((s,i) => (
                <div key={i} style={{ flex: 1, textAlign: "center", padding: "10px", borderBottom: `3px solid ${step === i ? ELECTRIC : BORDER}`, cursor: "pointer", fontSize: 12, fontWeight: 600, color: step === i ? NAVY : MUTED }} onClick={() => setStep(i)}>{s}</div>
              ))}
            </div>

            {step === 0 && (<div>
              <h2 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 16px" }}>Your environment</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div><label style={{ fontSize: 12, fontWeight: 600, color: NAVY, display: "block", marginBottom: 4 }}>Industry vertical</label>
                  <select value={vertical} onChange={e => setVertical(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, color: NAVY }}><option value="">Select...</option>{VERTICALS.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                <div><label style={{ fontSize: 12, fontWeight: 600, color: NAVY, display: "block", marginBottom: 4 }}>Operation size</label>
                  <select value={size} onChange={e => setSize(e.target.value)} style={{ width: "100%", padding: "10px 12px", fontSize: 14, border: `1px solid ${BORDER}`, borderRadius: 6, color: NAVY }}><option value="">Select...</option>{SIZES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              </div>
              <button onClick={() => setStep(1)} disabled={!vertical || !size} style={{ marginTop: 24, padding: "12px 28px", fontSize: 14, fontWeight: 600, borderRadius: 8, border: "none", background: vertical && size ? ELECTRIC : MUTED, color: "#fff", cursor: "pointer", opacity: vertical && size ? 1 : 0.5 }}>Next: Focus Areas →</button>
            </div>)}

            {step === 1 && (<div>
              <h2 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>What are your focus areas?</h2>
              <p style={{ fontSize: 13, color: MUTED, marginBottom: 16 }}>We auto-selected based on your environment. Add or remove as needed.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }} className="pg">
                {TAG_FILTERS.map(t => (
                  <button key={t.id} onClick={() => t.id !== "all" && toggleTag(t.id)} style={{ padding: "14px 16px", textAlign: "left", borderRadius: 8, cursor: t.id === "all" ? "default" : "pointer", border: `1px solid ${activeTags.includes(t.id) ? ELECTRIC : BORDER}`, background: activeTags.includes(t.id) ? `${ELECTRIC}06` : "#fff", opacity: t.id === "all" ? 0.6 : 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: activeTags.includes(t.id) ? ELECTRIC : NAVY }}>{activeTags.includes(t.id) ? "✓ " : ""}{t.label}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>{t.desc}</div>
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button onClick={() => setStep(0)} style={{ padding: "12px 24px", fontSize: 14, fontWeight: 600, borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: NAVY, cursor: "pointer" }}>← Back</button>
                <button onClick={() => setStep(2)} style={{ padding: "12px 28px", fontSize: 14, fontWeight: 600, borderRadius: 8, border: "none", background: ELECTRIC, color: "#fff", cursor: "pointer" }}>Review Requirements →</button>
              </div>
            </div>)}

            {step === 2 && (<div>
              <h2 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>Review + customize your requirements</h2>
              <p style={{ fontSize: 13, color: MUTED, marginBottom: 8 }}>Adjust priority levels for each requirement. Click Must / Should / Nice to change.</p>
              <div style={{ display: "flex", gap: 12, marginBottom: 20, padding: "10px 14px", background: WARM, borderRadius: 8, border: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: RED }}>★ Must Have: {mustCount}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: AMBER }}>Should Have: {shouldCount}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>Nice to Have: {niceCount}</span>
                <span style={{ fontSize: 12, color: MUTED, marginLeft: "auto" }}>{totalReqs} total</span>
              </div>

              {filtered.map(g => (
                <div key={g.layer.n} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 5, background: g.layer.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>{g.layer.n}</div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{g.layer.name}</span>
                    <span style={{ fontSize: 11, color: MUTED }}>({g.reqs.length} requirements)</span>
                  </div>
                  <div style={{ border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden" }}>
                    {g.reqs.map((r, ri) => (
                      <div key={ri} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: ri < g.reqs.length - 1 ? `1px solid ${BORDER}` : "none", fontSize: 13, color: SLATE }}>
                        <span style={{ flex: 1 }}>{r.text}</span>
                        <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
                          {["must","should","nice"].map(p => (
                            <button key={p} onClick={() => setReq(r.layerN, r.idx, p)} style={{ padding: "3px 8px", fontSize: 10, fontWeight: 600, borderRadius: 4, cursor: "pointer", border: `1px solid ${r.priority === p ? priColors[p] : BORDER}`, background: r.priority === p ? `${priColors[p]}12` : "#fff", color: r.priority === p ? priColors[p] : MUTED }}>{p === "must" ? "Must" : p === "should" ? "Should" : "Nice"}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {vertReqs.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 5, background: GREEN, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>V</div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{vertical}-Specific Requirements</span>
                  </div>
                  <div style={{ border: `1px solid ${GREEN}30`, borderRadius: 8, overflow: "hidden", background: `${GREEN}04` }}>
                    {vertReqs.map((r, i) => (
                      <div key={i} style={{ padding: "10px 14px", borderBottom: i < vertReqs.length - 1 ? `1px solid ${GREEN}15` : "none", fontSize: 13, color: SLATE, display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ color: GREEN, fontWeight: 700, fontSize: 12 }}>★</span> {r}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button onClick={() => setStep(1)} style={{ padding: "12px 24px", fontSize: 14, fontWeight: 600, borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: NAVY, cursor: "pointer" }}>← Back</button>
                <button onClick={handleGenerate} style={{ padding: "12px 28px", fontSize: 14, fontWeight: 600, borderRadius: 8, border: "none", background: GREEN, color: "#fff", cursor: "pointer" }}>Generate RFP Document →</button>
              </div>
            </div>)}
          </div>
        </section>
      )}

      {phase === "results" && (
        <section style={{ background: "#fff", padding: "64px 28px 48px" }}>
          <div style={WRAP}>
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 2, textTransform: "uppercase" }}>Your RFP requirements are ready</span>
              <h2 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 28, fontWeight: 400, color: NAVY, margin: "8px 0" }}>{totalReqs} requirements across {filtered.length} layers</h2>
              <p style={{ fontSize: 13, color: MUTED }}>{vertical} · {size} · {mustCount} must have · {shouldCount} should have · {niceCount} nice to have</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }} className="pg">
              <div style={{ textAlign: "center", padding: "16px", background: `${RED}06`, border: `1px solid ${RED}20`, borderRadius: 10 }}>
                <div style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 32, color: RED }}>{mustCount}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: RED }}>Must Have</div>
              </div>
              <div style={{ textAlign: "center", padding: "16px", background: `${AMBER}06`, border: `1px solid ${AMBER}20`, borderRadius: 10 }}>
                <div style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 32, color: AMBER }}>{shouldCount}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: AMBER }}>Should Have</div>
              </div>
              <div style={{ textAlign: "center", padding: "16px", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10 }}>
                <div style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: 32, color: MUTED }}>{niceCount}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: MUTED }}>Nice to Have</div>
              </div>
            </div>

            {filtered.map(g => (
              <div key={g.layer.n} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, background: g.layer.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 10, fontWeight: 700 }}>{g.layer.n}</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: NAVY }}>{g.layer.name}</span>
                </div>
                <div style={{ border: `1px solid ${BORDER}`, borderRadius: 6, overflow: "hidden" }}>
                  {g.reqs.map((r, ri) => (
                    <div key={ri} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: ri < g.reqs.length - 1 ? `1px solid ${BORDER}` : "none", fontSize: 12.5, color: SLATE, background: r.priority === "must" ? `${RED}03` : "transparent" }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: priColors[r.priority], padding: "2px 6px", borderRadius: 3, background: `${priColors[r.priority]}12`, flexShrink: 0 }}>{priLabels[r.priority]}</span>
                      <span>{r.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24, alignItems: "center" }}>
              <ReportExport toolName="RFP Requirements Document" subtitle={`${vertical} · ${size} · ${totalReqs} requirements`} userName={name} userEmail={email} sections={reportSections} />
              <a href="/tools/vendor-match" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Vendor Match Engine →</a>
              <a href="/tools/contract-risk" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Contract Risk Scanner →</a>
              <a href="/how-to-choose" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>All Tools</a>
            </div>

            <div style={{ marginTop: 20, textAlign: "center" }}>
              <span style={{ fontSize: 13, color: MUTED }}>Want someone to review this before you send it? <a href="/contact" style={{ color: ELECTRIC, fontWeight: 600 }}>Request a working session →</a></span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
