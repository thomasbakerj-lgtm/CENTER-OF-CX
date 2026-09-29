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
        @media (max-width: 860px) { .nav-links { display: none !important; } .contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }
        input:focus, textarea:focus, select:focus { outline: none; border-color: ${ELECTRIC} !important; box-shadow: 0 0 0 3px ${alpha(HOUSE.electric, LINE.firm)}; }
      `}</style>
      
    </>
  );
}

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  /* A vendor introduction arrives as ?intro=<profile slug> or ?vendor=<name>, checked by readIntro. Read after the
     first paint, so the prerendered page and the hydrated page match. */
  const [intro, setIntro] = useState(null);
  useEffect(() => { try { setIntro(readIntro(window.location.search)); } catch { setIntro(null); } }, []);
  const [sending, setSending] = useState(false);

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
      }
    } catch (err) {
      console.error(err);
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
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
                <a href="/" style={{ color: MUTED, fontSize: 13, fontFamily: FONT }}>Home</a>
                <span style={{ color: BORDER, fontSize: 13 }}>/</span>
                <span style={{ color: ELECTRIC, fontSize: 13, fontWeight: 600, fontFamily: FONT }}>Contact</span>
              </div>

              <h1 style={{ fontFamily: FONT, fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 400, color: NAVY, lineHeight: 1.12, margin: "0 0 20px", letterSpacing: "-0.015em" }}>
                Tell us your challenge. We will match you with a consultant we have vetted for exactly that kind of problem.
              </h1>
              <p style={{ fontSize: 16, color: SLATE, lineHeight: 1.7, margin: "0 0 40px", fontFamily: FONT }}>
                60 minutes with someone who understands both the strategy and the operations. Tell us about your situation, and we'll come prepared with relevant context from our vendor intelligence and frameworks.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {[
                  { q: "What happens after I submit?", a: "We review your submission and respond within one business day with availability and any follow-up questions." },
                  { q: "Is there a cost?", a: "Initial consultation matching is complimentary. The consultant will discuss scope and pricing directly with you." },
                  { q: "What should I prepare?", a: "A clear description of your current challenge is enough. If you have vendor shortlists, architecture diagrams, or RFPs in progress, bring those too." },
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
                        <option value="Platform selection / CCaaS evaluation">Platform selection / CCaaS evaluation</option>
                        <option value="AI readiness assessment">AI readiness assessment</option>
                        <option value="Vendor shortlisting">Vendor shortlisting</option>
                        <option value="Operating model design">Operating model design</option>
                        <option value="Executive briefing">Executive briefing</option>
                        <option value="Transformation workshop">Transformation workshop</option>
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
                      <input id="ct-source" name="source" style={inputStyle} placeholder="LinkedIn, referral, search, event..." />
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        const form = e.target.closest('div[style]');
                        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
                        let valid = true;
                        inputs.forEach(input => { if (!input.value || input.value === "") valid = false; });
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
                            }
                            setSending(false);
                          }).catch(() => setSending(false));
                        } else {
                          inputs.forEach(input => {
                            if (!input.value || input.value === "") {
                              input.style.borderColor = FINDINGS.high.dark;
                            }
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
      <Nav />
      <ContactPage />
      <Footer />
    </div>
  );
}