import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { track } from "./src/lib/track";
import { HOUSE, PILLARS, LINE, FINDINGS, alpha } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";

const NAVY = HOUSE.mist; const DEEP = HOUSE.ink; const ELECTRIC = PILLARS.research.onDark; const LIGHT = PILLARS.research.onDark; const WARM = HOUSE.navy; const SLATE = HOUSE.body; const MUTED = HOUSE.muted; const BORDER = alpha(HOUSE.mist, LINE.hair);
const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };

const reports = {
  "iva-buyer-guide": {
    title: "IVA & Conversational AI Platform Buyer's Guide 2026",
    phase1: true,
    subtitle: "The Phase 1 assessment of 43 IVA and conversational AI vendors, dated April 2026. Architecture eras, demo questions and cost traps, kept as a dated record while current research is published.",
    pages: "25 pages",
    published: "April 2026",
    highlights: [
      "The Phase 1 assessment of 43 vendors, dated April 2026. Its scores and tiers are withdrawn on the site while current research is published",
      "Five architecture eras, from intent-based IVR to LLM-based agents, as that edition described them",
      "Demo questions to ask any vendor before you believe a capability claim",
      "Costs that proposals tend to leave out",
      "Market figures and forecasts as that edition stated them in April 2026; they have not been re-checked since",
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
    subtitle: "The Phase 1 assessment of 28 CCaaS platforms, dated April 2026. Migration risk, hidden costs, and the RFP questions most evaluations skip.",
    pages: "19 pages",
    published: "April 2026",
    highlights: [
      "The Phase 1 assessment of 28 CCaaS platforms, dated April 2026. Its scores and tiers are withdrawn on the site while current research is published",
      "Assessments of the top 12 vendors, plus the four adjacent platforms that shape CCaaS decisions",
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
      risks: [
        ["High", "Telephony porting complexity", "Number porting, SIP trunks, and carrier dependencies cause the most timeline slippage."],
        ["High", "Integration rebuild scope", "Every screen pop, WFM feed, and recording integration must be rebuilt. Undocumented ones surface mid-migration."],
        ["Medium", "Agent retraining load", "New desktop workflows and queue mechanics create a productivity dip during transition."],
        ["Medium", "Data migration and history", "Recordings, QA scores, and interaction history may be archived rather than migrated."],
        ["Medium", "Stakeholder alignment", "IT and operations misalignment is the most common organizational risk."],
        ["Low to medium", "Vendor professional services dependency", "Constrained vendor resources become your timeline risk. Build internal capability alongside."],
      ],
      fullOnly: ["Top 12 vendor assessments with strengths, weaknesses, and red flags", "Hidden costs vendors omit from proposals", "The RFP questions that reveal what demos hide", "The shortlist decision framework"],
      next: [
        ["Model the full cost beyond the seat price", "/tools/tco-calculator"],
        ["Build requirements into an RFP", "/tools/rfp-builder"],
        ["Pressure-test the platform decision", "/tools/platform-decision"],
        ["Scan a CCaaS contract for risk", "/tools/contract-risk"],
      ],
    },
  },
  "orchestration-framework": {
    title: "The 7-Layer CX Orchestration Framework 2026",
    subtitle: "How the layers of a contact center stack connect, who usually owns each one, and what to check before you change any of them. Updated 29 September 2026.",
    pages: "14 pages",
    highlights: [
      "Seven layers, from customer data to measurement, each with what it does and who usually owns it",
      "For each layer: the questions to answer, what to check first, what fails when it fails, and the free diagnostic that tests it",
      "Published figures where a publisher reports one, each with its source and date",
      "A map of how a failure in one layer travels to the others",
      "A readiness checklist in which any statement rated 2 or below is an action, with no score or band",
    ],
    pdf: "/CX-Orchestration-Framework-2026.pdf",
    formspree: "https://formspree.io/f/mgorkboe",
    category: "Platforms + Tech",
    backLink: "/platforms-and-tech",
    backLabel: "Platforms + Tech Intelligence",
  },
};


function Nav(){const[scrolled,setScrolled]=useState(false);useEffect(()=>{const fn=()=>setScrolled(window.scrollY>50);window.addEventListener("scroll",fn,{passive:true});return()=>window.removeEventListener("scroll",fn)},[]);
const links=[{name:"Platforms & Tech",href:"/platforms-and-tech"},{name:"How to Choose",href:"/how-to-choose"},{name:"Research",href:"/research"},{name:"Vendors",href:"/vendors"},{name:"Advisory",href:"/advisory"}];
return(<><style>{`*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}@media(max-width:860px){.nav-links{display:none!important}.gate-grid{grid-template-columns:1fr!important}}`}</style>
</>)}

function Summary({ report, onOpen }) {
  const s = report.summary;
  const h2 = { fontFamily: FONT, fontSize: 28, fontWeight: 400, color: NAVY, margin: "0 0 10px" };
  const lead = { fontSize: 15, color: SLATE, lineHeight: 1.7, margin: "0 0 20px", maxWidth: 760 };
  const cell = { padding: "10px 12px", borderBottom: `1px solid ${BORDER}`, fontSize: 13.5, color: SLATE, textAlign: "left", verticalAlign: "top" };
  const block = { marginBottom: 56 };
  return (
    <section style={{ background: HOUSE.ink, padding: "72px 28px" }}>
      <div style={{ ...WRAP, maxWidth: 980 }}>
        <div style={block}>
          <h2 style={h2}>What predicts a migration stall</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {s.risks.map(([lvl, f, d]) => (
              <div key={f} style={{ display: "flex", gap: 14, alignItems: "baseline", borderBottom: `1px solid ${BORDER}`, paddingBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: lvl === "High" ? FINDINGS.high.dark : PILLARS.industries.onDark, minWidth: 96 }}>{lvl}</span>
                <span style={{ fontSize: 14, color: SLATE, lineHeight: 1.55 }}><strong style={{ color: NAVY }}>{f}.</strong> {d}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...block, background: HOUSE.navy, borderRadius: 12, padding: "32px 28px" }}>
          <h2 style={{ ...h2, color: HOUSE.mist }}>In the full guide (Phase 1 edition)</h2>
          <ul style={{ margin: "0 0 22px", paddingLeft: 18, color: HOUSE.body, fontSize: 14, lineHeight: 1.8 }}>{s.fullOnly.map((x) => <li key={x}>{x}</li>)}</ul>
          <a href={report.pdf} target="_blank" rel="noopener noreferrer" onClick={onOpen} style={{ display: "inline-block", background: HOUSE.action, color: HOUSE.paper, fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>Open the full guide (PDF, {report.pages}) →</a>
        </div>

        <div>
          <h2 style={h2}>Run the numbers on your own shortlist</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
            {s.next.map(([label, href]) => (
              <a key={href} href={href} onClick={() => track("next_step_click", { from: "ccaas-buyer-guide", to: href.split("/").pop() })} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "16px 16px", color: NAVY, fontSize: 14, fontWeight: 600, background: WARM }}>{label} →</a>
            ))}
          </div>
          <p style={{ fontSize: 12, color: MUTED, marginTop: 20 }}>Phase 1 edition, published {report.published}. The full guide keeps that assessment's scores and tiers as a dated record; the site no longer shows them while current research is published. No vendor sponsorship. No pay-to-play.</p>
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
        <section style={{ background: HOUSE.navy, padding: "180px 28px 80px", textAlign: "center" }}>
          <div style={WRAP}>
            <h1 style={{ fontFamily: FONT, fontSize: 36, color: HOUSE.mist, margin: "0 0 16px" }}>Report not found.</h1>
            <a href="/research" style={{ display: "inline-block", background: HOUSE.action, color: HOUSE.paper, fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>← Back to Research</a>
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
        <section style={{ background: HOUSE.navy, padding: "140px 28px 60px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "none", backgroundSize: "64px 64px" }} />
          <div style={{ ...WRAP, position: "relative", zIndex: 1, textAlign: "center", maxWidth: 640, margin: "0 auto" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: alpha(FINDINGS.clear.dark, 0.13), display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <span style={{ fontSize: 28, color: FINDINGS.clear.dark }}>✓</span>
            </div>
            <h1 style={{ fontFamily: FONT, fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 400, color: HOUSE.mist, lineHeight: 1.15, margin: "0 0 16px" }}>Your report is ready.</h1>
            <p style={{ fontSize: 15, color: HOUSE.body, lineHeight: 1.7, marginBottom: 32 }}>
              Thank you, {formData.name.split(" ")[0]}. Click below to open your copy of the {report.title}. No email required: it opens immediately.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <a href={report.pdf} target="_blank" rel="noopener noreferrer" style={{ background: HOUSE.action, color: HOUSE.paper, fontSize: 16, fontWeight: 600, padding: "16px 32px", borderRadius: 8, boxShadow: "none", display: "inline-block" }}>
                Open Report (PDF) →
              </a>
              <a href={report.backLink} style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, color: HOUSE.mist, fontSize: 15, fontWeight: 500, padding: "16px 28px", borderRadius: 8 }}>
                Explore {report.backLabel} →
              </a>
            </div>
          </div>
        </section>

        <section style={{ background: HOUSE.ink, padding: "64px 28px" }}>
          <div style={{ ...WRAP, maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
            <h2 style={{ fontFamily: FONT, fontSize: 24, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>Want to go deeper?</h2>
            <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, marginBottom: 24 }}>We help CX leaders evaluate vendors, build shortlists, and design technology strategies. Tell us your challenge: we'll come prepared.</p>
            <a href="/contact" style={{ display: "inline-block", background: HOUSE.action, color: HOUSE.paper, fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8 }}>Request a Briefing</a>
          </div>
        </section>

        
      </div>
    );
  }

  // ─── GATED STATE ───
  return (
    <div><Nav />
      <section style={{ background: HOUSE.navy, padding: "130px 28px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "none", backgroundSize: "64px 64px" }} />
        <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <a href="/" style={{ color: HOUSE.body, fontSize: 13 }}>Home</a><span style={{ color: HOUSE.body, fontSize: 13 }}>/</span>
            <a href="/research" style={{ color: HOUSE.body, fontSize: 13 }}>Research</a><span style={{ color: HOUSE.body, fontSize: 13 }}>/</span>
            <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>{report.category}</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 48, alignItems: "start" }} className="gate-grid">
            {/* Left: Report info */}
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", background: HOUSE.navy, padding: "3px 10px", borderRadius: 4 }}>Buyer's Guide</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: HOUSE.body, background: HOUSE.navy, padding: "3px 10px", borderRadius: 4 }}>{report.pages}</span>
              </div>
              <h1 style={{ fontFamily: FONT, fontSize: "clamp(28px, 3.5vw, 40px)", fontWeight: 400, color: HOUSE.mist, lineHeight: 1.15, margin: "0 0 16px" }}>{report.title}</h1>
              <p style={{ fontSize: 15, color: HOUSE.body, lineHeight: 1.7, marginBottom: report.phase1 ? 12 : 28 }}>{report.subtitle}</p>
              {report.phase1 && <p style={{ fontSize: 13, color: LIGHT, lineHeight: 1.6, marginBottom: 28, maxWidth: 620 }}>Phase 1 edition. This report predates the current research methodology. Its scores and tiers are withdrawn everywhere else on the site and stay here only as a dated record of that assessment.</p>}

              <div style={{ fontSize: 12, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>What's inside</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {report.highlights.map((h, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <span style={{ color: LIGHT, fontSize: 12, marginTop: 2, flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: 13, color: HOUSE.body, lineHeight: 1.5 }}>{h}</span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 28, padding: "16px 20px", background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, borderRadius: 8 }}>
                <span style={{ fontSize: 11, color: HOUSE.body }}>Independent research. No vendor sponsorship. No pay-to-play. Your information stays private.</span>
              </div>
            </div>

            {/* Right: Form */}
            <div style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, borderRadius: 12, padding: "32px 28px" }}>
              {open ? (<>
              <h2 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 400, color: HOUSE.mist, margin: "0 0 6px" }}>Read the full guide now.</h2>
              <p style={{ fontSize: 13, color: HOUSE.body, lineHeight: 1.5, marginBottom: 16 }}>No form required. The summary is below.</p>
              <a href={report.pdf} target="_blank" rel="noopener noreferrer" onClick={onOpen} style={{ display: "block", textAlign: "center", background: HOUSE.action, color: HOUSE.paper, fontSize: 15, fontWeight: 600, padding: "14px 24px", borderRadius: 8, marginBottom: 24 }}>Open the guide (PDF) →</a>
              <div style={{ borderTop: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, paddingTop: 20, fontSize: 13, color: HOUSE.body, lineHeight: 1.5, marginBottom: 14 }}>Optional: get notified when the guide is updated.</div>
              </>) : (<>
              <h2 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 400, color: HOUSE.mist, margin: "0 0 6px" }}>Get instant access.</h2>
              <p style={{ fontSize: 13, color: HOUSE.body, lineHeight: 1.5, marginBottom: 24 }}>Fill out the form below. The report opens immediately: no email delivery, no waiting.</p>
              </>)}
              {open && unlocked ? (
                <p style={{ fontSize: 14, color: FINDINGS.clear.dark, margin: 0 }}>Thanks. You're on the update list.</p>
              ) : (

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label htmlFor="gr-name" style={{ fontSize: 12, fontWeight: 600, color: HOUSE.body, display: "block", marginBottom: 4 }}>Name *</label>
                  <input
                    id="gr-name"
                    type="text" required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Jane Smith"
                    style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, borderRadius: 6, background: HOUSE.navy, color: HOUSE.mist, outline: "none" }}
                    onFocus={e => e.target.style.borderColor = ELECTRIC}
                    onBlur={e => e.target.style.borderColor = alpha(HOUSE.mist, LINE.hair)}
                  />
                </div>

                <div>
                  <label htmlFor="gr-title" style={{ fontSize: 12, fontWeight: 600, color: HOUSE.body, display: "block", marginBottom: 4 }}>Title</label>
                  <input
                    id="gr-title"
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="VP of Customer Experience"
                    style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, borderRadius: 6, background: HOUSE.navy, color: HOUSE.mist, outline: "none" }}
                    onFocus={e => e.target.style.borderColor = ELECTRIC}
                    onBlur={e => e.target.style.borderColor = alpha(HOUSE.mist, LINE.hair)}
                  />
                </div>

                <div>
                  <label htmlFor="gr-email" style={{ fontSize: 12, fontWeight: 600, color: HOUSE.body, display: "block", marginBottom: 4 }}>Email *</label>
                  <input
                    id="gr-email"
                    type="email" required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@company.com"
                    style={{ width: "100%", padding: "12px 14px", fontSize: 14, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, borderRadius: 6, background: HOUSE.navy, color: HOUSE.mist, outline: "none" }}
                    onFocus={e => e.target.style.borderColor = ELECTRIC}
                    onBlur={e => e.target.style.borderColor = alpha(HOUSE.mist, LINE.hair)}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={sending || !formData.name || !formData.email}
                  style={{
                    width: "100%", padding: "14px 24px", fontSize: 15, fontWeight: 600,
                    background: HOUSE.action,
                    color: HOUSE.paper, border: "none", borderRadius: 8, cursor: sending ? "wait" : "pointer",
                    boxShadow: "none", marginTop: 4,
                    opacity: (!formData.name || !formData.email) ? 0.5 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  {open ? (sending ? "Sending..." : "Notify me of updates") : (sending ? "Opening report..." : "Get Instant Access →")}
                </button>

                <p style={{ fontSize: 11, color: HOUSE.body, textAlign: "center", margin: 0 }}>
                  Your information stays private. We don't sell data or spam.
                </p>
              </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {open && <Summary report={report} onOpen={onOpen} />}

      
    </div>
  );
}
