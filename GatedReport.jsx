import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { track } from "./src/lib/track";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED";
const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };

const reports = {
  "iva-buyer-guide": {
    title: "IVA & Conversational AI Platform Buyer's Guide 2026",
    phase1: true,
    subtitle: "50 vendors scored across 7 market categories. The Human Premium workforce framework. Market forecasts through 2029.",
    pages: "25 pages",
    highlights: [
      "50 vendors scored across conversational autonomy, multi-channel, orchestration, and analytics",
      "Five architecture eras: know where every vendor sits and where the market is heading",
      "The Human Premium: why the best CX operations invest more in people, not less",
      "12 / 24 / 36-month forecasts with confidence levels, validated by Gartner and Forrester",
      "12 demo questions that separate real capability from slides",
      "TCO reality check: the costs nobody mentions until month 6",
      "Buyer scenarios mapping your situation to specific vendor shortlists",
    ],
    pdf: "/IVA-Conversational-AI-Buyer-Guide-2026.pdf",
    formspree: "https://formspree.io/f/xojydbwe",
    category: "IVA + Conversational AI",
    backLink: "/vendors/iva",
    backLabel: "IVA Market Intelligence",
  },
  "ccaas-buyer-guide": {
    title: "CCaaS Platform Buyer's Guide 2026",
    phase1: true,
    subtitle: "28 CCaaS platforms scored across 27 weighted dimensions. Architecture fit, migration risk, hidden costs, and the RFP questions most evaluations skip.",
    pages: "19 pages",
    published: "April 2026",
    highlights: [
      "28 CCaaS platforms scored across 27 dimensions in 7 weighted capability domains",
      "Tier placement from Strategic Foundation to Limited Fit, with every score shown",
      "Assessments of the top 12 vendors, plus the four adjacent platforms that shape CCaaS decisions",
      "Architecture fit: which platforms match which operating models",
      "Migration risk framework: the factors that predict a stall or an overrun",
      "Hidden costs vendors leave out of proposals, and the RFP questions that expose them",
      "A decision framework for building a defensible shortlist",
    ],
    pdf: "/CCaaS-Platform-Buyer-Guide-2026.pdf",
    formspree: "https://formspree.io/f/myklwvjy",
    category: "CCaaS Platforms",
    backLink: "/vendors/ccaas",
    backLabel: "CCaaS Market Intelligence",
    /* Public summary layer. Every figure here is taken from the published PDF,
       and the harness reconciles it against that source. The full guide stays
       one click away; the email form is optional. */
    summary: {
      domains: [
        ["Core Platform and Routing", 20], ["AI and Automation", 18], ["Integration and Architecture", 15],
        ["Security, Compliance and Enterprise", 13], ["Agent Experience and Desktop", 12],
        ["Analytics and Intelligence", 12], ["Workforce Management", 10],
      ],
      dimensions: 27,
      tiers: [
        { name: "Strategic Foundation", band: "85 to 100", note: "Can anchor an enterprise CX operation. Default shortlist candidates for 500+ agents with complex requirements.", vendors: ["Genesys", "NICE CXone"] },
        { name: "Strong Contender", band: "70 to 84", note: "Genuine strengths in specific operating models and verticals. Needs a fit assessment, not a blanket recommendation.", vendors: ["Five9", "Cisco", "Talkdesk", "Amazon Connect", "Content Guru", "Zoom", "RingCentral", "Bright Pattern"] },
        { name: "Situational Specialist", band: "55 to 69", note: "Viable in defined contexts: vertical fit, installed base, regional strength, or price sensitivity.", vendors: ["8x8", "Odigo", "UJET", "Avaya", "Enghouse", "Dialpad", "Anywhere365", "Puzzel", "Alvaria", "Vonage"] },
        { name: "Limited Fit", band: "below 55", note: "Narrow applicability for complex enterprise service environments.", vendors: ["Luware", "Nextiva", "Aircall", "GoTo"] },
      ],
      adjacent: ["Sprinklr", "Salesforce Service Cloud", "ServiceNow CX", "Zendesk"],
      fit: [
        ["Enterprise, voice-led, multi-site, regulated", "Genesys, NICE CXone", "Routing complexity, WEM depth, compliance controls, and global deployment."],
        ["Mid-market, fast-deploying, digital-first", "Talkdesk, Five9, Bright Pattern", "Time to value, practical AI, and CRM integration outweigh maximum configurability."],
        ["AWS-native, builder mentality", "Amazon Connect", "Fits teams with cloud engineering depth that want to own the architecture."],
        ["UCaaS convergence, one vendor", "Zoom, RingCentral, Cisco, 8x8", "The driver is a single vendor for all communications."],
        ["EMEA or public sector, data sovereignty", "Content Guru, Odigo, Puzzel", "European-origin platforms with a strong compliance posture."],
        ["Installed base migration", "Avaya, Cisco", "Substantial on-premise investment makes the migration path the deciding factor."],
      ],
      risks: [
        ["High", "Telephony porting complexity", "Number porting, SIP trunks, and carrier dependencies cause the most timeline slippage."],
        ["High", "Integration rebuild scope", "Every screen pop, WFM feed, and recording integration must be rebuilt. Undocumented ones surface mid-migration."],
        ["Medium", "Agent retraining load", "New desktop workflows and queue mechanics create a productivity dip during transition."],
        ["Medium", "Data migration and history", "Recordings, QA scores, and interaction history may be archived rather than migrated."],
        ["Medium", "Stakeholder alignment", "IT and operations misalignment is the most common organizational risk."],
        ["Low to medium", "Vendor professional services dependency", "Constrained vendor resources become your timeline risk. Build internal capability alongside."],
      ],
      fullOnly: ["Every vendor's weighted score", "Top 12 vendor assessments with strengths, weaknesses, and red flags", "Hidden costs vendors omit from proposals", "The RFP questions that reveal what demos hide", "The shortlist decision framework"],
      next: [
        ["Model the full cost, not the seat price", "/tools/tco-calculator"],
        ["Build requirements into an RFP", "/tools/rfp-builder"],
        ["Pressure-test the platform decision", "/tools/platform-decision"],
        ["Scan a CCaaS contract for risk", "/tools/contract-risk"],
      ],
    },
  },
  "orchestration-framework": {
    title: "The 7-Layer CX Orchestration Framework 2026",
    subtitle: "How every layer connects, who owns each one, and what to prepare for in the next 12 months.",
    pages: "13 pages",
    highlights: [
      "Seven orchestration layers mapped with ownership, vendor landscape, and rate of change",
      "Layer-by-layer deep dives with key decisions, 12-month outlook, and preparation steps",
      "Integration dependency map showing what breaks when each layer fails",
      "14-question readiness checklist with maturity scoring (Foundation to Leading)",
      "Forward-looking preparation for agentic AI, regulatory changes, and architecture evolution",
    ],
    pdf: "/CX-Orchestration-Framework-2026.pdf",
    formspree: "https://formspree.io/f/mgorkboe",
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
<a href="/contact" style={{color:"#fff",fontSize:13,fontWeight:600,background:ELECTRIC,padding:"9px 20px",borderRadius:6}}>Subscribe</a>
</div></div></nav></>)}

function Summary({ report, onOpen }) {
  const s = report.summary;
  const h2 = { fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 28, fontWeight: 400, color: NAVY, margin: "0 0 10px" };
  const lead = { fontSize: 15, color: SLATE, lineHeight: 1.7, margin: "0 0 20px", maxWidth: 760 };
  const cell = { padding: "10px 12px", borderBottom: `1px solid ${BORDER}`, fontSize: 13.5, color: SLATE, textAlign: "left", verticalAlign: "top" };
  const block = { marginBottom: 56 };
  return (
    <section style={{ background: "#fff", padding: "72px 28px" }}>
      <div style={{ ...WRAP, maxWidth: 980 }}>
        <div style={block}>
          <h2 style={h2}>How the {report.summary.tiers.reduce((n, t) => n + t.vendors.length, 0) + s.adjacent.length} platforms are scored</h2>
          <p style={lead}>Each platform is scored 1 to 5 on {s.dimensions} dimensions. Each score is multiplied by its weight, for a maximum of 100. Weights sit in seven capability domains, prioritizing what matters after the demo.</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 420 }}>
              <thead><tr><th style={{ ...cell, color: NAVY, fontWeight: 600 }}>Capability domain</th><th style={{ ...cell, color: NAVY, fontWeight: 600, textAlign: "right" }}>Weight</th></tr></thead>
              <tbody>{s.domains.map(([d, w]) => <tr key={d}><td style={cell}>{d}</td><td style={{ ...cell, textAlign: "right", fontWeight: 600, color: NAVY }}>{w}%</td></tr>)}</tbody>
            </table>
          </div>
        </div>

        <div style={block}>
          <h2 style={h2}>The four tiers</h2>
          <p style={lead}>The distribution is intentionally harsh. Most of the market lands in the middle two tiers, and no vendor scores 100.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            {s.tiers.map((t) => (
              <div key={t.name} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 18px", background: WARM }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: NAVY }}>{t.name}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: ELECTRIC, margin: "2px 0 10px" }}>Score {t.band}</div>
                <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.55, margin: "0 0 10px" }}>{t.note}</p>
                <div style={{ fontSize: 12.5, color: MUTED, lineHeight: 1.6 }}>{t.vendors.join(", ")}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: MUTED, marginTop: 14 }}>Scored as adjacent platforms that shape CCaaS decisions: {s.adjacent.join(", ")}.</p>
        </div>

        <div style={block}>
          <h2 style={h2}>Match the platform to the operating model</h2>
          <p style={lead}>The most common evaluation mistake is buying features instead of fit. A platform that suits a 200-agent retailer can be wrong for a 2,000-agent regulated operation.</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 640 }}>
              <thead><tr>{["Operating model", "Best-fit platforms", "Why"].map((x) => <th key={x} style={{ ...cell, color: NAVY, fontWeight: 600 }}>{x}</th>)}</tr></thead>
              <tbody>{s.fit.map(([m, p, w]) => <tr key={m}><td style={{ ...cell, fontWeight: 600, color: NAVY }}>{m}</td><td style={cell}>{p}</td><td style={cell}>{w}</td></tr>)}</tbody>
            </table>
          </div>
        </div>

        <div style={block}>
          <h2 style={h2}>What predicts a migration stall</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {s.risks.map(([lvl, f, d]) => (
              <div key={f} style={{ display: "flex", gap: 14, alignItems: "baseline", borderBottom: `1px solid ${BORDER}`, paddingBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: lvl === "High" ? "#EF4444" : "#F59E0B", minWidth: 96 }}>{lvl}</span>
                <span style={{ fontSize: 14, color: SLATE, lineHeight: 1.55 }}><strong style={{ color: NAVY }}>{f}.</strong> {d}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...block, background: `linear-gradient(168deg, ${DEEP}, ${NAVY})`, borderRadius: 12, padding: "32px 28px" }}>
          <h2 style={{ ...h2, color: "#fff" }}>Only in the full guide</h2>
          <ul style={{ margin: "0 0 22px", paddingLeft: 18, color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.8 }}>{s.fullOnly.map((x) => <li key={x}>{x}</li>)}</ul>
          <a href={report.pdf} target="_blank" rel="noopener noreferrer" onClick={onOpen} style={{ display: "inline-block", background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>Open the full guide (PDF, {report.pages}) →</a>
        </div>

        <div>
          <h2 style={h2}>Run the numbers on your own shortlist</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
            {s.next.map(([label, href]) => (
              <a key={href} href={href} onClick={() => track("next_step_click", { from: "ccaas-buyer-guide", to: href.split("/").pop() })} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "16px 16px", color: NAVY, fontSize: 14, fontWeight: 600, background: WARM }}>{label} →</a>
            ))}
          </div>
          <p style={{ fontSize: 12, color: MUTED, marginTop: 20 }}>Published {report.published}. Scores come from public product documentation, analyst reports, customer reviews, deployment case studies, and direct product evaluation. Independent research. No vendor sponsorship. No pay-to-play.</p>
        </div>
      </div>
    </section>
  );
}

export default function GatedReport() {
  const { slug } = useParams();
  const report = reports[slug];
  const [unlocked, setUnlocked] = useState(false);
  const open = report && report.summary;
  const onOpen = () => track("next_step_click", { from: slug, to: "pdf" });
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
      await fetch(report.formspree, {
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
      if (open) track("report_copy_requested", { tool: slug });
      setUnlocked(true);
    } catch (e) {
      setUnlocked(true);
    }
    setSending(false);
  };

  // ─── UNLOCKED STATE ───
  if (unlocked && !open) {
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
              Thank you, {formData.name.split(" ")[0]}. Click below to open your copy of the {report.title}. No email required: it opens immediately.
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
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, marginBottom: 24 }}>We help CX leaders evaluate vendors, build shortlists, and design technology strategies. Tell us your challenge: we'll come prepared.</p>
            <a href="/contact" style={{ display: "inline-block", background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>Request a Briefing</a>
          </div>
        </section>

        <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={28} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span>
          <div style={{ display: "flex", gap: 16 }}>
            <a href="/privacy" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Privacy</a>
            <a href="/terms" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Terms</a>
          </div></div></div></footer>
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
              <p style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: report.phase1 ? 12 : 28 }}>{report.subtitle}</p>
              {report.phase1 && <p style={{ fontSize: 13, color: LIGHT, lineHeight: 1.6, marginBottom: 28, maxWidth: 620 }}>Phase 1 edition. This report predates the current research methodology. Its scores and tiers are withdrawn everywhere else on the site and stay here only as a dated record of that assessment.</p>}

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
              {open ? (<>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: "#fff", margin: "0 0 6px" }}>Read the full guide now.</h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, marginBottom: 16 }}>No form required. The summary is below.</p>
              <a href={report.pdf} target="_blank" rel="noopener noreferrer" onClick={onOpen} style={{ display: "block", textAlign: "center", background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 24px", borderRadius: 8, marginBottom: 24 }}>Open the guide (PDF) →</a>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, marginBottom: 14 }}>Optional: get notified when the guide is updated.</div>
              </>) : (<>
              <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: "#fff", margin: "0 0 6px" }}>Get instant access.</h2>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, marginBottom: 24 }}>Fill out the form below. The report opens immediately: no email delivery, no waiting.</p>
              </>)}
              {open && unlocked ? (
                <p style={{ fontSize: 14, color: "#10B981", margin: 0 }}>Thanks. You're on the update list.</p>
              ) : (

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
                  {open ? (sending ? "Sending..." : "Notify me of updates") : (sending ? "Opening report..." : "Get Instant Access →")}
                </button>

                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textAlign: "center", margin: 0 }}>
                  Your information stays private. We don't sell data or spam.
                </p>
              </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {open && <Summary report={report} onOpen={onOpen} />}

      <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={28} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX. All rights reserved.</span></div></div></footer>
    </div>
  );
}
