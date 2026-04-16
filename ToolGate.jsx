import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED"; const GREEN = "#10B981";
const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };

function LogoMark({size=34,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const TOOLS = {
  "roadmap-builder": { name: "Transformation Roadmap Builder", desc: "Build a 90-day CX transformation plan with milestones, dependencies, and stakeholder alignment. Start from your current state and map to your target operating model.", category: "Planning Tool", status: "coming-soon" },
  "integration-planner": { name: "Integration Strategy Planner", desc: "Map your current and target technology stack across the seven CX orchestration layers. Identify integration gaps, dependency risks, and consolidation opportunities.", category: "Planning Tool", status: "coming-soon" },
  "business-case": { name: "Business Case Builder", desc: "Build the ROI narrative for your board using your real numbers. Model labor savings, automation impact, vendor consolidation economics, and implementation costs.", category: "Planning Tool", status: "coming-soon" },
};

export default function ToolGate() {
  const { slug } = useParams();
  const tool = TOOLS[slug];
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  if (!tool) {
    return (
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#fff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, color: NAVY }}>Tool not found</h1>
          <a href="/how-to-choose" style={{ color: ELECTRIC, fontSize: 14, fontWeight: 600 }}>← Back to How to Choose</a>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!email || !email.includes("@")) return;
    setSending(true);
    try {
      await fetch("https://formspree.io/f/xnjolywk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tool: tool.name, source: "tool-gate", _subject: `Tool Access: ${tool.name}` }),
      });
      setSubmitted(true);
    } catch (e) { setSubmitted(true); }
    setSending(false);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}`}</style>

      {/* Nav */}
      <nav style={{ background: DEEP, padding: "16px 0" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LogoMark size={30} />
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 14, letterSpacing: 0.4 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span>
          </a>
          <a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>← Back to Tools</a>
        </div>
      </nav>

      {/* Gate */}
      <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, minHeight: "calc(100vh - 60px)", display: "flex", alignItems: "center", padding: "80px 28px" }}>
        <div style={{ ...WRAP, maxWidth: 560, textAlign: "center" }}>
          <span style={{ color: LIGHT, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", display: "block", marginBottom: 16 }}>{tool.category}</span>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 16px" }}>{tool.name}</h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 36px" }}>{tool.desc}</p>

          {!submitted ? (
            <div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>Enter your email to access this tool. We'll send you the link and notify you of updates.</p>
              <div style={{ display: "flex", gap: 8, maxWidth: 420, margin: "0 auto" }}>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                  placeholder="your@email.com"
                  style={{ flex: 1, padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.06)", color: "#fff", fontSize: 14, outline: "none" }}
                />
                <button
                  onClick={handleSubmit}
                  disabled={sending}
                  style={{ padding: "14px 24px", borderRadius: 8, border: "none", background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", opacity: sending ? 0.6 : 1 }}>
                  {sending ? "..." : "Access Tool →"}
                </button>
              </div>
            </div>
          ) : tool.status === "coming-soon" ? (
            <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: "32px 28px" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>✓</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: GREEN, margin: "0 0 8px" }}>You're on the list.</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, margin: "0 0 20px" }}>
                The {tool.name} is in final development. We'll email you the moment it launches — along with early access and a walkthrough of the methodology behind it.
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
                <a href="/tco-calculator" style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>Try the TCO Calculator now →</a>
                <a href="/vendors" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Browse vendor intelligence →</a>
              </div>
            </div>
          ) : (
            <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: "32px 28px" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>✓</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: GREEN, margin: "0 0 8px" }}>Access granted.</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", margin: "0 0 16px" }}>Loading your tool...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
