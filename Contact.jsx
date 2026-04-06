import { useState, useEffect, useRef } from "react";

const NAVY = "#0B1D3A";
const DEEP = "#061325";
const ELECTRIC = "#0088DD";
const LIGHT = "#00AAFF";
const ICE = "#E8F4FD";
const WARM = "#F8FAFB";
const SLATE = "#3A4F6A";
const MUTED = "#6B7F99";
const BORDER = "#D8E3ED";

function useInView(t = 0.1) {
  const ref = useRef(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const o = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); o.unobserve(el); } }, { threshold: t });
    o.observe(el);
    return () => o.disconnect();
  }, []);
  return [ref, v];
}

function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, v] = useInView();
  return <div ref={ref} style={{ ...style, opacity: v ? 1 : 0, transform: v ? "translateY(0)" : "translateY(22px)", transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s` }}>{children}</div>;
}

const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };

function LogoMark({ size = 34, light = true }) {
  const arcColor = light ? "#fff" : NAVY;
  const xColor = light ? LIGHT : ELECTRIC;
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
      <g transform="translate(60,60)">
        <path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={arcColor} strokeWidth="2" strokeLinecap="round" opacity={light ? 0.6 : 0.3}/>
        <path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={arcColor} strokeWidth="3.2" strokeLinecap="round" opacity={light ? 0.8 : 0.5}/>
        <path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={arcColor} strokeWidth="5" strokeLinecap="round"/>
        <line x1="-14" y1="-14" x2="14" y2="14" stroke={xColor} strokeWidth="5.5" strokeLinecap="round"/>
        <line x1="14" y1="-14" x2="-14" y2="14" stroke={xColor} strokeWidth="5.5" strokeLinecap="round"/>
      </g>
    </svg>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", fn, { passive: true }); return () => window.removeEventListener("scroll", fn); }, []);
  const links = [
    { name: "Platforms & Tech", href: "/platforms-and-tech" },
    { name: "How to Choose", href: "/how-to-choose" },
    { name: "Research", href: "/research" },
    { name: "Vendors", href: "/vendors" },
    { name: "Advisory", href: "/advisory" },
  ];
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { font-family: 'DM Sans', sans-serif; background: #fff; color: ${NAVY}; -webkit-font-smoothing: antialiased; }
        a { text-decoration: none; color: inherit; }
        @media (max-width: 860px) { .nav-links { display: none !important; } .contact-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }
        input:focus, textarea:focus, select:focus { outline: none; border-color: ${ELECTRIC} !important; box-shadow: 0 0 0 3px rgba(0,136,221,0.1); }
      `}</style>
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: scrolled ? "rgba(6,19,37,0.96)" : "transparent", backdropFilter: scrolled ? "blur(14px)" : "none", borderBottom: scrolled ? "1px solid rgba(255,255,255,0.05)" : "none", transition: "all 0.35s", padding: scrolled ? "12px 0" : "20px 0" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LogoMark size={34} />
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 14.5, letterSpacing: 0.4, fontFamily: "'DM Sans', sans-serif" }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span>
          </a>
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
            {links.map(l => <a key={l.name} href={l.href} style={{ color: "rgba(255,255,255,0.7)", fontSize: 13.5, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = "#fff"} onMouseOut={e => e.target.style.color = "rgba(255,255,255,0.7)"}>{l.name}</a>)}
            <a href="/contact" style={{ color: "#fff", fontSize: 13, fontWeight: 600, background: ELECTRIC, padding: "9px 20px", borderRadius: 6, fontFamily: "'DM Sans', sans-serif" }}>Request Briefing</a>
          </div>
        </div>
      </nav>
    </>
  );
}

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
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
    width: "100%", padding: "13px 16px", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    border: `1px solid ${BORDER}`, borderRadius: 8, background: "#fff", color: NAVY,
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const labelStyle = {
    fontSize: 13, fontWeight: 600, color: NAVY, display: "block", marginBottom: 6,
    fontFamily: "'DM Sans', sans-serif",
  };

  return (
    <section style={{ background: WARM, minHeight: "100vh", padding: "140px 28px 80px" }}>
      <div style={WRAP}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 80, alignItems: "start" }} className="contact-grid">
          {/* Left column - context */}
          <FadeIn>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
                <a href="/" style={{ color: MUTED, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Home</a>
                <span style={{ color: BORDER, fontSize: 13 }}>/</span>
                <span style={{ color: ELECTRIC, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Contact</span>
              </div>

              <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(30px, 4vw, 46px)", fontWeight: 400, color: NAVY, lineHeight: 1.12, margin: "0 0 20px", letterSpacing: "-0.015em" }}>
                Request a working session.
              </h1>
              <p style={{ fontSize: 16, color: SLATE, lineHeight: 1.7, margin: "0 0 40px", fontFamily: "'DM Sans', sans-serif" }}>
                60 minutes with someone who understands both the strategy and the operations. Tell us about your situation, and we'll come prepared with relevant context from our vendor intelligence and frameworks.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {[
                  { q: "What happens after I submit?", a: "We review your submission and respond within one business day with availability and any follow-up questions." },
                  { q: "Is there a cost?", a: "Initial working sessions are complimentary. We'll be upfront about scope and pricing before any paid engagement begins." },
                  { q: "What should I prepare?", a: "A clear description of your current challenge is enough. If you have vendor shortlists, architecture diagrams, or RFPs in progress, bring those too." },
                ].map((faq, i) => (
                  <div key={i}>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: NAVY, margin: "0 0 4px", fontFamily: "'DM Sans', sans-serif" }}>{faq.q}</h3>
                    <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.55, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{faq.a}</p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 40, padding: "20px 0", borderTop: `1px solid ${BORDER}` }}>
                <p style={{ fontSize: 13, color: MUTED, fontFamily: "'DM Sans', sans-serif" }}>
                  Prefer email? Reach us directly at{" "}
                  <a href="mailto:hello@contactcentercx.com" style={{ color: ELECTRIC, fontWeight: 600 }}>hello@contactcentercx.com</a>
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Right column - form */}
          <FadeIn delay={0.1}>
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "36px 32px", boxShadow: "0 4px 24px rgba(0,0,0,0.03)" }}>
              {submitted ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${ELECTRIC}12`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <span style={{ color: ELECTRIC, fontSize: 22 }}>✓</span>
                  </div>
                  <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 26, fontWeight: 400, color: NAVY, margin: "0 0 12px" }}>We've received your request.</h2>
                  <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.6, fontFamily: "'DM Sans', sans-serif" }}>
                    We'll review your submission and respond within one business day. Talk soon.
                  </p>
                </div>
              ) : (
                <div>
                  <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 4px" }}>Tell us about your situation.</h2>
                  <p style={{ fontSize: 13, color: MUTED, margin: "0 0 28px", fontFamily: "'DM Sans', sans-serif" }}>All fields are required unless marked optional.</p>

                  <div onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    {/* Hidden Formspree helper */}
                    <input type="hidden" name="_subject" value="New Working Session Request — Center of CX" />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div>
                        <label style={labelStyle}>First name</label>
                        <input name="first_name" required style={inputStyle} placeholder="Jane" />
                      </div>
                      <div>
                        <label style={labelStyle}>Last name</label>
                        <input name="last_name" required style={inputStyle} placeholder="Smith" />
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Work email</label>
                      <input name="email" type="email" required style={inputStyle} placeholder="jane@company.com" />
                    </div>

                    <div>
                      <label style={labelStyle}>Company</label>
                      <input name="company" required style={inputStyle} placeholder="Acme Corp" />
                    </div>

                    <div>
                      <label style={labelStyle}>Your role</label>
                      <input name="role" required style={inputStyle} placeholder="VP of Customer Experience" />
                    </div>

                    <div>
                      <label style={labelStyle}>What are you working on?</label>
                      <select name="topic" required style={{ ...inputStyle, cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236B7F99' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 16px center" }}>
                        <option value="" disabled selected>Select a topic</option>
                        <option value="Platform selection / CCaaS evaluation">Platform selection / CCaaS evaluation</option>
                        <option value="AI readiness assessment">AI readiness assessment</option>
                        <option value="Vendor shortlisting">Vendor shortlisting</option>
                        <option value="Operating model design">Operating model design</option>
                        <option value="Executive briefing">Executive briefing</option>
                        <option value="Transformation workshop">Transformation workshop</option>
                        <option value="General inquiry">General inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>Describe your situation <span style={{ fontWeight: 400, color: MUTED }}>(the more context, the better we can prepare)</span></label>
                      <textarea name="message" required rows={5} style={{ ...inputStyle, resize: "vertical", minHeight: 120 }} placeholder="We're evaluating CCaaS platforms and need help narrowing from 8 vendors to 3. Currently on legacy Avaya with 400 agents across two sites..." />
                    </div>

                    <div>
                      <label style={labelStyle}>How did you find us? <span style={{ fontWeight: 400, color: MUTED }}>(optional)</span></label>
                      <input name="source" style={inputStyle} placeholder="LinkedIn, referral, search, event..." />
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
                            }
                            setSending(false);
                          }).catch(() => setSending(false));
                        } else {
                          inputs.forEach(input => {
                            if (!input.value || input.value === "") {
                              input.style.borderColor = "#e74c3c";
                            }
                          });
                        }
                      }}
                      disabled={sending}
                      style={{
                        background: sending ? SLATE : ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600,
                        padding: "15px 32px", borderRadius: 8, border: "none", cursor: sending ? "wait" : "pointer",
                        fontFamily: "'DM Sans', sans-serif", boxShadow: `0 4px 18px rgba(0,136,221,0.2)`,
                        transition: "background 0.2s", width: "100%",
                      }}
                    >
                      {sending ? "Sending..." : "Submit Request"}
                    </button>

                    <p style={{ fontSize: 12, color: MUTED, textAlign: "center", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                      We'll respond within one business day. No spam, no vendor hand-offs without your permission.
                    </p>
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
    <footer style={{ background: DEEP, padding: "56px 28px 36px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={WRAP}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <LogoMark size={28} />
            <span style={{ color: "#fff", fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span>
          </a>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'DM Sans', sans-serif" }}>© 2026 The Center of CX. All rights reserved.</span>
        </div>
      </div>
    </footer>
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