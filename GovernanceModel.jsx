import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 860, margin: "0 auto", padding: "0 28px" };

function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const ROLES = ["CX Leader", "CC Ops", "IT / Arch", "AI / Data", "Finance", "Unowned"];
const ROLE_COLORS = [ELECTRIC, GREEN, "#7C3AED", AMBER, "#3B82F6", RED];

const DOMAINS = [
  { name: "CX Strategy & Vision", items: [
    "Overall CX strategy and roadmap", "Customer journey design and mapping", "Experience standards and brand alignment",
    "CX investment prioritization", "Cross-functional CX governance",
  ]},
  { name: "Contact Center Operations", items: [
    "Service level management and SLAs", "Workforce management and scheduling", "Quality assurance and coaching",
    "Agent performance and development", "Escalation design and exception handling",
  ]},
  { name: "Technology & Platforms", items: [
    "CCaaS platform selection and management", "Integration architecture and maintenance", "Agent desktop and tooling",
    "Telephony and channel infrastructure", "Technology vendor management",
  ]},
  { name: "AI & Automation", items: [
    "AI strategy and use case prioritization", "Bot and IVA design and performance", "Agent assist deployment and tuning",
    "AI governance, testing, and guardrails", "Automation ROI measurement",
  ]},
  { name: "Analytics & Intelligence", items: [
    "Reporting and dashboards", "Interaction analytics (speech, text, sentiment)", "Voice of customer and feedback programs",
    "Data quality and governance", "Insight-to-action process",
  ]},
  { name: "Budget & Vendor Management", items: [
    "CX technology budget ownership", "Vendor contract negotiation and renewal", "TCO modeling and cost optimization",
    "Build vs buy decisions", "Professional services oversight",
  ]},
];

export default function GovernanceModel() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [sending, setSending] = useState(false);
  const [assignments, setAssignments] = useState({});

  useEffect(() => { window.scrollTo(0, 0); }, [phase]);

  const setOwner = (domIdx, itemIdx, roleIdx) => setAssignments(prev => ({ ...prev, [`${domIdx}-${itemIdx}`]: roleIdx }));
  const getOwner = (domIdx, itemIdx) => assignments[`${domIdx}-${itemIdx}`];
  const totalItems = DOMAINS.reduce((a, d) => a + d.items.length, 0);
  const assignedCount = Object.keys(assignments).length;
  const unownedCount = Object.values(assignments).filter(v => v === 5).length;

  const roleCounts = ROLES.map((_, ri) => Object.values(assignments).filter(v => v === ri).length);

  const handleGate = async () => {
    if (!email.includes("@")) return;
    setSending(true);
    try { await fetch("https://formspree.io/f/xnjolywk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "Governance & Operating Model", _subject: "Governance Model Access" }) }); } catch (e) {}
    setSending(false);
    setPhase("assign");
  };

  const handleResults = async () => {
    const summary = ROLES.map((r, i) => `${r}: ${roleCounts[i]}`).join(" | ");
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, company, tool: "Governance Model", assigned: assignedCount, unowned: unownedCount, distribution: summary, _subject: `Governance Model: ${unownedCount} unowned items — ${company || name || email}` }) }); } catch (e) {}
    setPhase("results");
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}`}</style>

      <nav style={{ background: DEEP, padding: "16px 0" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
          <a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a>
        </div>
      </nav>

      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", padding: "80px 28px" }}>
          <div style={{ ...WRAP, textAlign: "center" }}>
            <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Framework & Template</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "12px 0 16px" }}>Governance & Operating Model</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 auto 36px", maxWidth: 520 }}>Map ownership across 30 CX responsibilities — strategy, operations, technology, AI, analytics, and budget. Identify which functions are clearly owned, overloaded, or unowned. The result is a governance profile you can take to your leadership team.</p>
            <div style={{ maxWidth: 400, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Work email *" style={{ padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, outline: "none" }} />
              <div style={{ display: "flex", gap: 10 }}>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" style={{ flex: 1, padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none" }} />
                <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Company" style={{ flex: 1, padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "#fff", fontSize: 14, outline: "none" }} />
              </div>
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "16px", borderRadius: 8, border: "none", background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", opacity: sending ? 0.6 : 1, marginTop: 4 }}>{sending ? "Starting..." : "Start Mapping →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "assign" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "40px 28px 80px" }}>
          <div style={{ ...WRAP, maxWidth: 920 }}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>Who owns what?</h2>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 8 }}>For each responsibility, select the primary owner. If nobody clearly owns it, select "Unowned." {assignedCount}/{totalItems} assigned.</p>
            <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
              {ROLES.map((r, i) => (
                <span key={i} style={{ fontSize: 10, fontWeight: 600, color: ROLE_COLORS[i], background: `${ROLE_COLORS[i]}12`, padding: "3px 8px", borderRadius: 4, border: `1px solid ${ROLE_COLORS[i]}30` }}>{r}</span>
              ))}
            </div>

            {DOMAINS.map((dom, di) => (
              <div key={di} style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>{dom.name}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {dom.items.map((item, ii) => {
                    const owner = getOwner(di, ii);
                    return (
                      <div key={ii} style={{ background: "#fff", border: `1px solid ${owner !== undefined ? ROLE_COLORS[owner] + "30" : BORDER}`, borderRadius: 8, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 13, color: NAVY, fontWeight: 500, flex: 1, minWidth: 200 }}>{item}</span>
                        <div style={{ display: "flex", gap: 4 }}>
                          {ROLES.map((r, ri) => (
                            <button key={ri} onClick={() => setOwner(di, ii, ri)} style={{ padding: "4px 8px", fontSize: 9, fontWeight: owner === ri ? 700 : 500, borderRadius: 4, border: owner === ri ? `2px solid ${ROLE_COLORS[ri]}` : `1px solid ${BORDER}`, background: owner === ri ? `${ROLE_COLORS[ri]}15` : "#fff", color: owner === ri ? ROLE_COLORS[ri] : MUTED, cursor: "pointer", whiteSpace: "nowrap" }}>{r}</button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={handleResults} disabled={assignedCount < 20} style={{ padding: "14px 28px", borderRadius: 8, border: "none", background: assignedCount >= 20 ? GREEN : MUTED, color: "#fff", fontSize: 15, fontWeight: 600, cursor: assignedCount >= 20 ? "pointer" : "default", opacity: assignedCount >= 20 ? 1 : 0.5 }}>
                {assignedCount >= 20 ? `View Governance Profile (${assignedCount}/${totalItems}) →` : `Assign at least 20 items (${assignedCount}/${totalItems})`}
              </button>
            </div>
          </div>
        </section>
      )}

      {phase === "results" && (
        <section style={{ background: WARM, minHeight: "calc(100vh - 60px)", padding: "48px 28px 80px" }}>
          <div style={WRAP}>
            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "40px 32px", textAlign: "center", marginBottom: 32 }}>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Governance Profile</span>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", margin: "8px 0 16px" }}>{assignedCount} responsibilities mapped</h2>
              {unownedCount > 0 ? (
                <p style={{ fontSize: 16, color: RED, fontWeight: 600 }}>{unownedCount} item{unownedCount > 1 ? "s" : ""} marked as unowned — these are governance gaps.</p>
              ) : (
                <p style={{ fontSize: 16, color: GREEN, fontWeight: 600 }}>No unowned items. Every responsibility has a designated owner.</p>
              )}
            </div>

            {/* Distribution */}
            <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 20px" }}>Ownership Distribution</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 32 }}>
              {ROLES.map((r, i) => {
                const count = roleCounts[i];
                const pct = totalItems > 0 ? ((count / totalItems) * 100).toFixed(0) : 0;
                const isOverloaded = count > 8;
                return (
                  <div key={i} style={{ background: "#fff", border: `1px solid ${i === 5 && count > 0 ? RED : ROLE_COLORS[i]}30`, borderRadius: 10, padding: "16px", textAlign: "center" }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: ROLE_COLORS[i], fontFamily: "'Instrument Serif', Georgia, serif" }}>{count}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: NAVY, marginBottom: 2 }}>{r}</div>
                    <div style={{ fontSize: 10, color: MUTED }}>{pct}% of total</div>
                    {isOverloaded && i !== 5 && <div style={{ fontSize: 9, color: AMBER, fontWeight: 600, marginTop: 4 }}>Potentially overloaded</div>}
                    {i === 5 && count > 0 && <div style={{ fontSize: 9, color: RED, fontWeight: 600, marginTop: 4 }}>Governance gap</div>}
                  </div>
                );
              })}
            </div>

            {/* Unowned items */}
            {unownedCount > 0 && (
              <div style={{ background: `${RED}08`, border: `1px solid ${RED}20`, borderRadius: 10, padding: "20px 22px", marginBottom: 32 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: RED, letterSpacing: 1, textTransform: "uppercase" }}>Unowned Responsibilities</span>
                <div style={{ marginTop: 8 }}>
                  {DOMAINS.map((dom, di) => dom.items.map((item, ii) => {
                    if (getOwner(di, ii) === 5) return <p key={`${di}-${ii}`} style={{ fontSize: 13, color: NAVY, margin: "4px 0" }}><strong>{dom.name}:</strong> {item}</p>;
                    return null;
                  }))}
                </div>
              </div>
            )}

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "36px 28px", textAlign: "center" }}>
              <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: "#fff", margin: "0 0 10px" }}>Need help structuring governance?</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: "0 auto 24px", maxWidth: 440 }}>Your governance profile has been saved. Request a working session and we'll help you resolve ownership gaps, balance workloads, and build a governance model that scales with your AI and technology investments.</p>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "13px 24px", borderRadius: 8 }}>Request a Working Session</a>
                <a href="/vendors" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 14, fontWeight: 500, padding: "13px 24px", borderRadius: 8 }}>Browse Vendor Intelligence →</a>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
