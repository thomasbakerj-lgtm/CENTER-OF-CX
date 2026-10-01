import { useState, useEffect } from "react";
import { Assent } from "./src/lib/Assent.jsx";
import { readIntro, INTRO_TOPIC } from "./src/lib/intro.js";
import { trackVendor } from "./src/lib/track.js";
import { HOUSE, PILLARS, LINE, FINDINGS, alpha } from "./src/lib/tokens.js";
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


/* Page rules: the two columns stack on a phone, and fields show a focus ring. */
function Styles() {
  return (
    <style>{`
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { scroll-behavior: smooth; }
      a { text-decoration: none; color: inherit; }
      @media (max-width: 860px) { .contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; } .help-grid { grid-template-columns: 1fr !important; } }
      input:focus, textarea:focus, select:focus { outline: none; border-color: ${ELECTRIC} !important; box-shadow: 0 0 0 3px ${alpha(HOUSE.electric, LINE.firm)}; }
    `}</style>
  );
}

/* Advisory and Contact are one page (TB, 1 Oct 2026). It says how consultants are chosen and never how the site is paid.
   Every line restates copy TB approved: an independent consultant who has done that work before, one we have vetted,
   matched to the problem; matching is free and scope and price are agreed with the consultant. */
const CHOSEN = [
  "We match on the problem you describe, your industry and the systems you run, so the person you meet has done this kind of work before.",
  "Every consultant we introduce is one we have vetted ourselves.",
  "They are independent consultants, and they work for you.",
  "An introduction never changes what this site publishes: no list order, research finding or tool result moves because of one.",
  "Nothing about you reaches a consultant or a vendor until you ask for the introduction.",
];
const STEPS = [
  "Tell us what you are working on, using the form on this page.",
  "We reply within one business day with a suggested match and any questions we have.",
  "You meet the consultant. Matching is free; if you go further, you agree scope and price directly with the consultant.",
];
const HELP = [
  { t: "Platform selection", d: "Comparing contact center platforms against your operating model, your industry's rules and the systems you integrate with." },
  { t: "AI readiness", d: "Whether your data, workflows, governance and team are ready for conversational AI, agent assist or AI quality review, and what is realistic on your timeline." },
  { t: "Vendor shortlisting", d: "Narrowing the field with you, starting from the vendor profiles and research on this site: where each vendor fits and the questions to put to it." },
  { t: "Operating model", d: "How strategy, contact center operations, digital channels, AI governance and workforce management fit together, and who owns each decision." },
  { t: "Executive briefings", d: "A focused session for a leadership team on what is changing in contact center technology and what it means for the decisions in front of them." },
  { t: "Workshops", d: "A facilitated half or full day that brings CX, IT, operations and finance to one set of priorities and an order of work." },
];

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  /* A vendor introduction arrives as ?intro=<profile slug> or ?vendor=<name>, checked by readIntro. Read after the
     first paint, so the prerendered page and the hydrated page match. */
  const [intro, setIntro] = useState(null);
  useEffect(() => { try { setIntro(readIntro(window.location.search)); } catch { setIntro(null); } }, []);
  const [sending, setSending] = useState(false);
  /* "" | "missing" | "failed": a request that did not send says so, and keeps what the reader typed. */
  const [problem, setProblem] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    const form = e.target;
    const data = new FormData(form);
    try {
      const res = await fetch("https://formspree.io/f/xvzvdnry", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        setSubmitted(true);
        form.reset();
      } else setProblem("failed");
    } catch (err) {
      setProblem("failed");
    }
    setSending(false);
  };

  const inputStyle = {
    width: "100%", padding: "13px 16px", fontSize: 14, fontFamily: FONT,
    border: `1px solid ${BORDER}`, borderRadius: 8, background: HOUSE.ink, color: NAVY,
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const labelStyle = {
    fontSize: 13, fontWeight: 600, color: NAVY, display: "block", marginBottom: 6,
    fontFamily: FONT,
  };

  return (
    <section style={{ background: WARM, minHeight: "100vh", padding: "140px 28px 80px" }}>
      <div style={WRAP}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 80, alignItems: "start" }} className="contact-grid">
          {/* Left column - context */}
          <FadeIn>
            <div>
              <h1 style={{ fontFamily: FONT, fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 400, color: NAVY, lineHeight: 1.12, margin: "0 0 20px", letterSpacing: "-0.015em" }}>
                Get help with a contact center decision.
              </h1>
              <p style={{ fontSize: 16, color: SLATE, lineHeight: 1.7, margin: "0 0 36px", fontFamily: FONT }}>
                The tools and research are free and stay free. When you want a person to work through a decision with you, tell us the problem and we introduce you to an independent consultant who has done that work before. You can also ask us a question or request an introduction to a vendor.
              </p>

              <section aria-labelledby="chosen" style={{ marginBottom: 32 }}>
                <h2 id="chosen" style={{ fontSize: 18, fontWeight: 600, color: NAVY, margin: "0 0 12px", fontFamily: FONT }}>How consultants are chosen</h2>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {CHOSEN.map((c) => <li key={c} style={{ display: "flex", gap: 10, fontSize: 14.5, color: SLATE, lineHeight: 1.6, fontFamily: FONT }}><span aria-hidden="true" style={{ color: ELECTRIC, flexShrink: 0 }}>+</span><span>{c}</span></li>)}
                </ul>
              </section>

              <section aria-labelledby="how" style={{ marginBottom: 32 }}>
                <h2 id="how" style={{ fontSize: 18, fontWeight: 600, color: NAVY, margin: "0 0 12px", fontFamily: FONT }}>How it works</h2>
                <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                  {STEPS.map((t, i) => <li key={t} style={{ display: "flex", gap: 12, fontSize: 14.5, color: SLATE, lineHeight: 1.6, fontFamily: FONT }}><span aria-hidden="true" style={{ color: ELECTRIC, fontWeight: 700, flexShrink: 0, width: 16 }}>{i + 1}</span><span>{t}</span></li>)}
                </ol>
              </section>

              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {[
                  { q: "What should I prepare?", a: "A clear description of the decision in front of you is enough. If you have vendor shortlists, architecture diagrams, a report from one of the tools here, or an RFP in progress, bring those too." },
                  { q: "Can I ask for a vendor introduction instead?", a: "Yes. Use the introduction link on any vendor page, or choose Vendor introduction in the form. Nothing reaches the vendor until you ask." },
                ].map((faq, i) => (
                  <div key={i}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, margin: "0 0 4px", fontFamily: FONT }}>{faq.q}</h3>
                    <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.55, margin: 0, fontFamily: FONT }}>{faq.a}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 40, padding: "20px 0", borderTop: `1px solid ${BORDER}` }}>
                <p style={{ fontSize: 13, color: MUTED, fontFamily: FONT }}>
                  Prefer email? Reach us directly at{" "}
                  <a href="mailto:hello@contactcentercx.com" style={{ color: ELECTRIC, fontWeight: 600 }}>hello@contactcentercx.com</a>
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Right column - form */}
          <FadeIn delay={0.1}>
            <div style={{ background: HOUSE.ink, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "36px 32px", boxShadow: "none" }}>
              {submitted ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${ELECTRIC}12`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <span style={{ color: ELECTRIC, fontSize: 22 }}>✓</span>
                  </div>
                  <h2 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>We've received your request.</h2>
                  <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.6, fontFamily: FONT }}>
                    We'll review your submission and respond within one business day. Talk soon.
                  </p>
                </div>
              ) : (
                <div>
                  <h2 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 4px" }}>{intro ? `Request an introduction to ${intro.name}.` : "Tell us about your situation."}</h2>
                  {intro && <p style={{ fontSize: 14, color: SLATE, margin: "0 0 8px", lineHeight: 1.6, fontFamily: FONT }}>Tell us what you want to see and who should join. We arrange the introduction and a demo run on your scenarios.</p>}
                  <p style={{ fontSize: 13, color: MUTED, margin: "0 0 28px", fontFamily: FONT }}>All fields are required unless marked optional.</p>

                  <div onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {intro && <input type="hidden" name="intro_vendor" value={intro.name} />}
                    {intro && intro.slug && <input type="hidden" name="intro_profile" value={intro.slug} />}
                    {intro && intro.from && <input type="hidden" name="intro_from" value={intro.from} />}
                    {/* Hidden Formspree helper */}
                    <input type="hidden" name="_subject" value={intro ? `Vendor introduction request: ${intro.name}` : "New Consultant Match Request: Center of CX"} />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label htmlFor="ct-first_name" style={labelStyle}>First name</label>
                        <input id="ct-first_name" name="first_name" required style={inputStyle} placeholder="Jane" />
                      </div>
                      <div>
                        <label htmlFor="ct-last_name" style={labelStyle}>Last name</label>
                        <input id="ct-last_name" name="last_name" required style={inputStyle} placeholder="Smith" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="ct-email" style={labelStyle}>Work email</label>
                      <input id="ct-email" name="email" type="email" required style={inputStyle} placeholder="jane@company.com" />
                    </div>

                    <div>
                      <label htmlFor="ct-company" style={labelStyle}>Company</label>
                      <input id="ct-company" name="company" required style={inputStyle} placeholder="Acme Corp" />
                    </div>

                    <div>
                      <label htmlFor="ct-role" style={labelStyle}>Your role</label>
                      <input id="ct-role" name="role" required style={inputStyle} placeholder="VP of Customer Experience" />
                    </div>

                    <div>
                      <label htmlFor="ct-topic" style={labelStyle}>What are you working on?</label>
                      <select key={intro ? "intro" : "none"} id="ct-topic" name="topic" required defaultValue={intro ? INTRO_TOPIC : ""} style={{ ...inputStyle, cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B7F99' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}>
                        <option value="" disabled>Select a topic</option>
                        <option value="Platform selection">Platform selection</option>
                        <option value="AI readiness">AI readiness</option>
                        <option value="Vendor shortlisting">Vendor shortlisting</option>
                        <option value="Operating model">Operating model</option>
                        <option value="Executive briefing">Executive briefing</option>
                        <option value="Workshop">Workshop</option>
                        <option value={INTRO_TOPIC}>{INTRO_TOPIC}</option>
                        <option value="General inquiry">General inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="ct-message" style={labelStyle}>Describe your situation <span style={{ fontWeight: 400, color: MUTED }}>(the more context, the better we can prepare)</span></label>
                      <textarea key={intro ? "intro" : "none"} id="ct-message" name="message" required rows={5} style={{ ...inputStyle, resize: "vertical", minHeight: 120 }} placeholder={intro ? "What you want to see in the demo, your timeline, and who should join the call..." : "We're evaluating CCaaS platforms and need help narrowing from 8 vendors to 3. Currently on legacy Avaya with 400 agents across two sites..."} />
                    </div>

                    <div>
                      <label htmlFor="ct-source" style={labelStyle}>How did you find us? <span style={{ fontWeight: 400, color: MUTED }}>(optional)</span></label>
                      <input id="ct-source" name="source" style={inputStyle} placeholder="LinkedIn, a colleague, search, an event..." />
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        const form = e.target.closest('div[style]');
                        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
                        let valid = true;
                        inputs.forEach(input => { if (!input.value || input.value === "") valid = false; });
                        setProblem(valid ? "" : "missing");
                        if (valid) {
                          const formData = new FormData();
                          form.querySelectorAll('input, textarea, select').forEach(el => {
                            if (el.name) formData.append(el.name, el.value);
                          });
                          setSending(true);
                          fetch("https://formspree.io/f/xvzvdnry", {
                            method: "POST",
                            body: formData,
                            headers: { Accept: "application/json" },
                          }).then(res => {
                            if (res.ok) {
                              setSubmitted(true);
                              if (intro) trackVendor.introSent(intro.slug || undefined);
                            } else setProblem("failed");
                            setSending(false);
                          }).catch(() => { setProblem("failed"); setSending(false); });
                        } else {
                          inputs.forEach(input => {
                            if (!input.value || input.value === "") {
                              input.style.borderColor = FINDINGS.high.dark;
                              input.setAttribute("aria-invalid", "true");
                            } else input.removeAttribute("aria-invalid");
                          });
                        }
                      }}
                      disabled={sending}
                      style={{
                        background: HOUSE.action, color: HOUSE.paper, opacity: sending ? 0.6 : 1, fontSize: 15, fontWeight: 600,
                        padding: "15px 32px", borderRadius: 8, border: "none", cursor: sending ? "wait" : "pointer",
                        fontFamily: FONT, boxShadow: "none",
                        transition: "background 0.2s", width: "100%",
                      }}
                    >
                      {sending ? "Sending..." : "Submit Request"}
                    </button>
                    {problem === "missing" && <p role="alert" style={{ fontSize: 14, color: NAVY, margin: 0, fontFamily: FONT }}>Please fill in the required fields marked in red.</p>}
                    {problem === "failed" && <p role="alert" style={{ fontSize: 14, color: NAVY, margin: 0, fontFamily: FONT }}>That did not go through. Your answers are still here: please try again in a moment.</p>}

                    <p style={{ fontSize: 12, color: MUTED, textAlign: "center", margin: 0, fontFamily: FONT }}>
                      We'll respond within one business day. No spam, no vendor hand-offs without your permission.
                    </p>
                    <Assent align="center" />
                  </div>
                </div>
              )}
            </div>
          </FadeIn>
        </div>

        <section aria-labelledby="help" style={{ marginTop: 72 }}>
          <h2 id="help" style={{ fontFamily: FONT, fontSize: "clamp(22px, 2.6vw, 30px)", fontWeight: 400, color: NAVY, margin: "0 0 8px" }}>What a consultant can help with</h2>
          <p style={{ fontSize: 14.5, color: SLATE, lineHeight: 1.6, margin: "0 0 24px", maxWidth: 680, fontFamily: FONT }}>Choose the closest topic in the form; the description is what we match on.</p>
          <div className="help-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {HELP.map((h) => (
              <div key={h.t} style={{ background: HOUSE.ink, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "20px 20px" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: NAVY, margin: "0 0 6px", fontFamily: FONT }}>{h.t}</h3>
                <p style={{ fontSize: 13.5, color: SLATE, lineHeight: 1.6, margin: 0, fontFamily: FONT }}>{h.d}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function Footer() {
  return (
    null
  );
}

export default function Contact() {
  return (
    <div>
      <Styles />
      <ContactPage />
      <Footer />
    </div>
  );
}