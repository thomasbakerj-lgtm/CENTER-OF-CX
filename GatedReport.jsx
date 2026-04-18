import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED";
const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };

const reports = {
  "iva-buyer-guide": {
    title: "IVA & Conversational AI Platform Buyer's Guide 2026",
    subtitle: "43 vendors scored across 4 dimensions. The Human Premium workforce framework. Market forecasts through 2029.",
    pages: "25 pages",
    highlights: [
      "43 vendors scored on conversational autonomy, multi-channel, orchestration, and analytics",
      "Five architecture eras — know where every vendor sits and where the market is heading",
      "The Human Premium — why the best CX operations invest more in people, not less",
      "12 / 24 / 36-month forecasts with confidence levels, validated by Gartner and Forrester",
      "12 demo questions that separate real capability from slides",
      "TCO reality check — the costs nobody mentions until month 6",
      "Buyer scenarios mapping your situation to specific vendor shortlists",
    ],
    pdf: "/IVA-Conversational-AI-Buyer-Guide-2026.pdf",
    category: "IVA & Conversational AI",
    backLink: "/vendors/iva",
    backLabel: "IVA Market Intelligence",
  },
  "ccaas-buyer-guide": {
    title: "CCaaS Platform Buyer's Guide 2026",
    subtitle: "28 vendors scored across 7 weighted dimensions. The definitive enterprise CCaaS evaluation framework.",
    pages: "18 pages",
    highlights: [
      "28 CCaaS platforms scored on platform depth, workforce, AI, digital, architecture, commercial, and vertical fit",
      "Individual vendor profiles with strengths, weaknesses, best-fit scenarios, and red flags",
      "Competitive context showing where each vendor leads and where they trail",
      "Vendor selection framework matching your operational profile to the right shortlist",
      "Migration decision guide — when to switch, when to extend, when to stay",
      "Commercial negotiation intelligence — what to push on, what to protect",
    ],
    pdf: "/CCaaS-Platform-Buyer-Guide-2026.pdf",
    category: "CCaaS Platforms",
    backLink: "/vendors/ccaas",
    backLabel: "CCaaS Market Intelligence",
  },
  "orchestration-framework": {
    title: "The 7-Layer CX Orchestration Framework 2026",
    subtitle: "How every layer connects, who owns each one, and what to prepare for in the next 12 months.",
    pages: "13 pages",
    highlights: [
      "Seven orchestration layers mapped with ownership, vendor landscape, and rate of change",
      "Layer-by-layer deep dives with key decisions, 12-month outlook, and preparation steps",
      "Integration dependency map showing what breaks when each layer fails",
      "14-question readiness checklist with maturity scoring (Foundation to Industry-Leading)",
      "Forward-looking preparation for agentic AI, regulatory changes, and architecture evolution",
    ],
    pdf: "/CX-Orchestration-Framework-2026.pdf",
    category: "Platforms + Tech",
    backLink: "/platforms-and-tech",
    backLabel: "Platforms + Tech Intelligence",
  },
};

function LogoMark({size=34}){return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity={0.6}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity={0.8}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={LIGHT} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={LIGHT} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

function Nav(){const[scrolled,setScrolled]=useState(false);useEffect(()=>{const fn=()=>setScrolled(window.scrollY>50);window.addEventListener("scroll",fn,{passive:true});return()=>window.removeEventListener("scroll",fn)},[]);
const links=[{name:"Platforms & Tech",href:"/platforms-and-tech"},{name:"How to Choose",href:"/how-to-choose"},{name:"Research",href:"/research"},{name:"Vendors",href:"/vendors"},{name:"Advisory",href:"/advisory"}];
return(<><style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}@media(max-width:860px){.nav-links{display:none!important}.gate-grid{grid-template-columns:1fr!important}}`}</style>
<nav style={{position:"fixed",top:0,left:0,right:0,zIndex:1000,background:scrolled?"rgba(6,19,37,0.96)":"transparent",backdropFilter:scrolled?"blur(14px)":"none",borderBottom:scrolled?"1px solid rgba(255,255,255,0.05)":"none",transition:"all 0.35s",padding:scrolled?"12px 0":"20px 0"}}>
<div style={{...WRAP,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
<a href="/" style={{display:"flex",alignItems:"center",gap:10}}><LogoMark size={34}/><span style={{color:"#fff",fontWeight:600,fontSize:14.5,letterSpacing:0.4}}>THE CENTER OF <span style={{color:LIGHT}}>CX</span></span></a>
<div className="nav-links" style={{display:"flex",alignItems:"center",gap:28}}>
{links.map(l=><a key={l.name} href={l.href} style={{color:"rgba(255,255,255,0.7)",fontSize:13.5,fontWeight:500}}>{l.name}</a>)}
<a href="/contact" style={{color:"#fff",fontSize:13,fontWeight:600,background:ELECTRIC,padding:"9px 20px",borderRadius:6}}>Request Briefing</a>
</div></div></nav></>)}

export default function GatedReport() {
  const { slug } = useParams();
  const report = reports[slug];
  const [unlocked, setUnlocked] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({ name: "", title: "", email: "" });

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  if (!report) {
    return (
      <div><Nav />
        <section style={{ background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, padding: "180px 28px 80px", textAlign: "center" }}>
          <div style={WRAP}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 36, color: "#fff", margin: "0 0 16px" }}>Report not found.</h1>
            <a href="/research" style={{ display: "inline-block", background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>← Back to Research</a>
          </div>
        </section>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) return;
    setSending(true);
    try {
      await fetch("https://formspree.io/f/xnjolywk", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `Report Download: ${report.title}`,
          name: formData.name,
          title: formData.title,
          email: formData.email,
          report: report.title,
          timestamp: new Date().toISOString(),
        }),
      });
      setUnlocked(true);
    } catch (e) {
      setUnlocked(true);
    }
    setSending(false);
  };

  // ─── UNLOCKED STATE ───
  if (unlocked) {
    return (
      <div><Nav />
        <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "140px 28px 60px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
          <div style={{ ...WRAP, position: "relative", zIndex: 1, textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#10B98120", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <span style={{ fontSize: 28, color: "#10B981" }}>✓</span>
            </div>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 16px" }}>Your report is ready.</h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 32 }}>
              Thank you, {formData.name.split(" ")[0]}. Click below to open your copy of the {report.title}. No email required — it opens immediately.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <a href={report.pdf} target="_blank" rel="noopener noreferrer" style={{ background: ELECTRIC, color: "#fff", fontSize: 16, fontWeight: 600, padding: "16px 32px", borderRadius: 8, boxShadow: "0 4px 18px rgba(0,136,221,0.3)", display: "inline-block" }}>
                Open Report (PDF) →
              </a>
              <a href={report.backLink} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 15, fontWeight: 500, padding: "16px 28px", borderRadius: 8 }}>
                Explore {report.backLabel} →
              </a>
            </div>
          </div>
        </section>

        <section style={{ background: "#fff", padding: "64px 28px" }}>
          <div style={{ ...WRAP, maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Want to go deeper?</h2>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, marginBottom: 24 }}>We help CX leaders evaluate vendors, build shortlists, and design technology strategies. Tell us your challenge — we'll come prepared.</p>
            <a href="/contact" style={{ display: "inline-block", background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>Request a Briefing</a>
          </div>
        </section>

        <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={28} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span></div></div></footer>
      </div>
    );
  }

  // ─── GATED STATE ───
  return (
    <div><Nav />
      <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "130px 28px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Home</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
            <a href="/research" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>Research</a><span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
            <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>{report.category}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 48, alignItems: "start" }} className="gate-grid">
            {/* Left: Report info */}
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", background: "rgba(0,170,255,0.1)", padding: "3px 10px", borderRadius: 4 }}>Buyer's Guide</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", background: "rgba(255,255,255,0.05)", padding: "3px 10px", borderRadius: 4 }}>{report.pages}</span>
              </div>
              <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 400, color: "#fff", lineHeight: 1.15, margin: "0 0 16px" }}>{report.title}</h1>
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 28 }}>{report.subtitle}</p>

              <div style={{ fontSize: 12, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>What's inside</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {report.highlights.map((h, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: LIGHT, fontSize: 12, marginTop: 2, flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>{h}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 28, padding: "16px 20px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Independent research. No vendor sponsorship. No pay-to-play. Your information stays private.</span>
              </div>
            </div>

            {/* Right: Form */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "32px 28px" }}>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: "#fff", margin: "0 0 6px" }}>Get instant access.</h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, marginBottom: 24 }}>Fill out the form below. The report opens immediately — no email delivery, no waiting.</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 4 }}>Name *</label>
                  <input
                    type="text" required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Smith"
                    style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }}
                    onFocus={e => e.target.style.borderColor = ELECTRIC}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 4 }}>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="VP of Customer Experience"
                    style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }}
                    onFocus={e => e.target.style.borderColor = ELECTRIC}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", display: "block", marginBottom: 4 }}>Email *</label>
                  <input
                    type="email" required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@company.com"
                    style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: "1px solid rgba(255,255,255,0.12)", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "#fff", outline: "none" }}
                    onFocus={e => e.target.style.borderColor = ELECTRIC}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={sending || !formData.name || !formData.email}
                  style={{
                    width: "100%", padding: "14px 24px", fontSize: 15, fontWeight: 600,
                    background: (!formData.name || !formData.email) ? SLATE : ELECTRIC,
                    color: "#fff", border: "none", borderRadius: 8, cursor: sending ? "wait" : "pointer",
                    boxShadow: "0 4px 18px rgba(0,136,221,0.25)", marginTop: 4,
                    opacity: (!formData.name || !formData.email) ? 0.5 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  {sending ? "Opening report..." : "Get Instant Access →"}
                </button>

                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", margin: 0 }}>
                  Your information stays private. We don't sell data or spam.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={28} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span></div></div></footer>
    </div>
  );
}
