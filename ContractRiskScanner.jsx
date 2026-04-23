import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981"; const AMBER = "#F59E0B"; const RED = "#EF4444";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const TERMS = [
  { id: "length", name: "Contract Length", options: ["1 year", "2 years", "3 years", "5 years"], risks: { "1 year": { level: "low", note: "Flexibility, but less pricing leverage." }, "2 years": { level: "low", note: "Standard. Balanced leverage and flexibility." }, "3 years": { level: "medium", note: "Common for enterprise. Ensure rate locks cover the full term and exit clauses are clean." }, "5 years": { level: "high", note: "Locks you in through a period of massive technology change. AI capabilities will evolve significantly. Ensure mid-term renegotiation rights." } } },
  { id: "renewal", name: "Auto-Renewal Window", options: ["30 days", "60 days", "90 days", "120 days", "180 days"], risks: { "30 days": { level: "low", note: "Reasonable notice period." }, "60 days": { level: "medium", note: "Tight. Set a calendar reminder 9 months before expiration." }, "90 days": { level: "high", note: "You must decide a full quarter before expiration. Many teams miss this." }, "120 days": { level: "high", note: "4 months notice. If you miss it, you auto-renew at potentially higher rates." }, "180 days": { level: "critical", note: "6 months notice required. This means you need to start vendor evaluation 12 months before expiration." } } },
  { id: "rateLock", name: "Rate Lock Duration", options: ["Full term", "Year 1 only", "Year 1-2 only", "No rate lock", "CPI-linked"], risks: { "Full term": { level: "low", note: "Ideal. Your price is your price for the contract duration." }, "Year 1 only": { level: "high", note: "You are exposed to 15-30% increases in Year 2+. This is the most common vendor tactic." }, "Year 1-2 only": { level: "medium", note: "Better, but still exposed in Year 3 if on a 3-year deal." }, "No rate lock": { level: "critical", note: "Vendor can raise prices at any renewal. Demand rate caps or walk." }, "CPI-linked": { level: "medium", note: "Reasonable if capped at 3-5%. Watch for uncapped CPI escalators." } } },
  { id: "sla", name: "SLA Guarantee", options: ["99.999% with credits", "99.99% with credits", "99.9% with credits", "99.9% no credits", "No SLA"], risks: { "99.999% with credits": { level: "low", note: "Gold standard. Verify credit calculation method and maximum credit cap." }, "99.99% with credits": { level: "low", note: "Standard enterprise. Roughly 52 minutes downtime per year." }, "99.9% with credits": { level: "medium", note: "8.7 hours downtime per year. Acceptable for non-critical environments only." }, "99.9% no credits": { level: "high", note: "SLA without financial consequence is not an SLA. It is a suggestion." }, "No SLA": { level: "critical", note: "Unacceptable for any production contact center. Do not sign." } } },
  { id: "termination", name: "Early Termination", options: ["Mutual 90-day notice", "Pay remaining term", "Pay 50% remaining", "Termination for cause only", "No early termination"], risks: { "Mutual 90-day notice": { level: "low", note: "Best case. Either party can exit with notice." }, "Pay remaining term": { level: "critical", note: "You pay the full contract even if you leave. This is a financial trap if the platform fails to deliver." }, "Pay 50% remaining": { level: "high", note: "Painful but survivable. Negotiate this down to 25-30%." }, "Termination for cause only": { level: "high", note: "'Cause' is narrowly defined. Performance failures rarely qualify. Push for performance-based exit triggers." }, "No early termination": { level: "critical", note: "You cannot leave regardless of performance. Never accept this." } } },
  { id: "dataPortability", name: "Data Portability", options: ["Full export, standard format, 30 days", "Export available, proprietary format", "Export on request, additional cost", "No export clause", "Unclear / not addressed"], risks: { "Full export, standard format, 30 days": { level: "low", note: "Ideal. You own your data and can leave with it." }, "Export available, proprietary format": { level: "medium", note: "You can get the data but may need significant transformation to use it elsewhere." }, "Export on request, additional cost": { level: "high", note: "Data hostage. The cost to export increases vendor lock-in." }, "No export clause": { level: "critical", note: "Your interaction data, recordings, and analytics stay with the vendor. This is a dealbreaker." }, "Unclear / not addressed": { level: "critical", note: "If it is not in the contract, you do not have the right. Add explicit data portability terms." } } },
  { id: "addOns", name: "Add-On Pricing Commitment", options: ["All add-ons priced in contract", "Key add-ons priced, others at list", "List pricing at time of purchase", "No add-on pricing committed", "Not discussed"], risks: { "All add-ons priced in contract": { level: "low", note: "Ideal. You know your full cost before signing." }, "Key add-ons priced, others at list": { level: "medium", note: "Acceptable if 'key' covers WEM, QA, analytics, and AI. Verify scope." }, "List pricing at time of purchase": { level: "high", note: "List prices increase. You will pay more for add-ons than a new customer would negotiate." }, "No add-on pricing committed": { level: "critical", note: "The base seat price is meaningless without add-on pricing. The gap runs 40-100%." }, "Not discussed": { level: "critical", note: "This will cost you. Get every module you might need in the first 18 months priced in writing." } } },
];

export default function ContractRiskScanner() {
  const [phase, setPhase] = useState("gate");
  const [email, setEmail] = useState(""); const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [selections, setSelections] = useState({});
  useEffect(() => { window.scrollTo(0, 0); }, [phase]);
  const setTerm = (id, val) => setSelections(prev => ({ ...prev, [id]: val }));

  const handleGate = async () => {
    if (!email.includes("@")) return; setSending(true);
    try { await fetch("https://formspree.io/f/maqlvwne", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, name, tool: "Contract Risk Scanner", _subject: "Contract Risk Scanner Access" }) }); } catch (e) {}
    setSending(false); setPhase("calc");
  };

  const analyzed = TERMS.map(t => {
    const sel = selections[t.id];
    const risk = sel ? t.risks[sel] : null;
    return { ...t, selected: sel, risk };
  });
  const riskCounts = { low: 0, medium: 0, high: 0, critical: 0 };
  analyzed.forEach(a => { if (a.risk) riskCounts[a.risk.level]++; });
  const totalFlags = riskCounts.high + riskCounts.critical;
  const allAnswered = TERMS.every(t => selections[t.id]);

  const overallRisk = riskCounts.critical >= 2 ? "High Risk" : riskCounts.critical >= 1 || riskCounts.high >= 3 ? "Elevated Risk" : riskCounts.high >= 1 ? "Moderate Risk" : "Low Risk";
  const overallColor = riskCounts.critical >= 2 ? RED : riskCounts.critical >= 1 || riskCounts.high >= 3 ? "#DC6B00" : riskCounts.high >= 1 ? AMBER : GREEN;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}@media(max-width:700px){.pg{grid-template-columns:1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a></div></nav>

      {phase === "gate" && (
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "80px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 520 }}>
            <span style={{ color: RED, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 12 }}>Vendor Selection</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 12px" }}>Contract Risk Scanner</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, marginBottom: 32 }}>Select your contract terms across 7 critical areas. See which clauses protect you, which expose you, and what to renegotiate before signing.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }} />
              <button onClick={handleGate} disabled={sending || !email.includes("@")} style={{ padding: "14px", fontSize: 15, fontWeight: 600, background: email.includes("@") ? RED : SLATE, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", opacity: email.includes("@") ? 1 : 0.5 }}>{sending ? "Loading..." : "Launch Scanner →"}</button>
            </div>
          </div>
        </section>
      )}

      {phase === "calc" && (
        <section style={{ background: "#fff", padding: "40px 28px 60px" }}>
          <div style={WRAP}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>Contract Risk Scanner</h2>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 24 }}>Select your current or proposed contract terms for each area. Risk assessment updates in real time.</p>

            {allAnswered && (
              <div style={{ background: `${overallColor}08`, border: `2px solid ${overallColor}`, borderRadius: 12, padding: "20px 24px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                <div>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, color: overallColor }}>{overallRisk}</div>
                  <div style={{ fontSize: 13, color: SLATE }}>{totalFlags} terms flagged as high or critical risk</div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  {[["Critical", riskCounts.critical, RED], ["High", riskCounts.high, "#DC6B00"], ["Medium", riskCounts.medium, AMBER], ["Low", riskCounts.low, GREEN]].map(([l, c, color]) => (
                    <div key={l} style={{ textAlign: "center" }}>
                      <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, color }}>{c}</div>
                      <div style={{ fontSize: 10, color: MUTED }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {analyzed.map((term, i) => {
                const riskColor = term.risk ? ({ low: GREEN, medium: AMBER, high: "#DC6B00", critical: RED }[term.risk.level]) : BORDER;
                return (
                  <div key={term.id} style={{ background: WARM, border: `1px solid ${term.risk ? riskColor + "40" : BORDER}`, borderRadius: 10, padding: "18px 20px", borderLeft: term.risk ? `4px solid ${riskColor}` : "4px solid transparent" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 8 }}>{term.name}</div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: term.risk ? 10 : 0 }}>
                      {term.options.map(opt => {
                        const optRisk = term.risks[opt];
                        const isSelected = selections[term.id] === opt;
                        const optColor = isSelected ? ({ low: GREEN, medium: AMBER, high: "#DC6B00", critical: RED }[optRisk.level]) : BORDER;
                        return (
                          <button key={opt} onClick={() => setTerm(term.id, opt)} style={{ padding: "8px 14px", fontSize: 12, fontWeight: isSelected ? 600 : 400, borderRadius: 6, cursor: "pointer", border: `1px solid ${isSelected ? optColor : BORDER}`, background: isSelected ? `${optColor}12` : "#fff", color: isSelected ? optColor : MUTED }}>{opt}</button>
                        );
                      })}
                    </div>
                    {term.risk && (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: riskColor, letterSpacing: 1, textTransform: "uppercase", padding: "2px 6px", borderRadius: 3, background: `${riskColor}12`, flexShrink: 0 }}>{term.risk.level}</span>
                        <span style={{ fontSize: 12, color: SLATE, lineHeight: 1.5 }}>{term.risk.note}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "32px", textAlign: "center", marginTop: 28, marginBottom: 24 }}>
              <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: "#fff", margin: "0 0 8px" }}>Contract terms are negotiable. All of them.</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 480, margin: "0 auto 20px" }}>
                Most buyers accept the first contract the vendor presents. The terms flagged above can be renegotiated. A working session can help you build a negotiation strategy before you sign.
              </p>
              <a href="/contact" style={{ display: "inline-block", background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 32px", borderRadius: 8, boxShadow: "0 4px 18px rgba(0,136,221,0.3)" }}>Request a Working Session →</a>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="/tools/license-gap" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>License Bundle Gap Checker →</a>
              <a href="/tools/vendor-match" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Vendor Match Engine →</a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
