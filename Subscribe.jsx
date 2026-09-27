import { useState, useEffect, useRef } from "react";
import { HOUSE, PILLARS, LINE, FINDINGS, alpha } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";

const NAVY = HOUSE.mist;
const DEEP = HOUSE.ink;
const ELECTRIC = PILLARS.research.onDark;
const LIGHT = PILLARS.research.onDark;
const WARM = HOUSE.navy;
const SLATE = HOUSE.body;
const MUTED = HOUSE.muted;
const BORDER = alpha(HOUSE.mist, LINE.hair);

const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };

function LogoMark({ size = 34, light = true }) {
  const arcColor = HOUSE.mist;
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
        @media (max-width: 860px) { .nav-links { display: none !important; } }
        input:focus { outline: none; border-color: ${ELECTRIC} !important; box-shadow: 0 0 0 3px ${alpha(HOUSE.electric, LINE.firm)}; }
      `}</style>
      
    </>
  );
}

function SubscribePage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const inputStyle = {
    width: "100%", padding: "13px 16px", fontSize: 14, fontFamily: FONT,
    border: `1px solid ${BORDER}`, borderRadius: 8, background: HOUSE.ink, color: NAVY,
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const labelStyle = {
    fontSize: 13, fontWeight: 600, color: NAVY, display: "block", marginBottom: 6,
    fontFamily: FONT,
  };

  const handleSubmit = () => {
    const form = document.getElementById("subscribe-form");
    const inputs = form.querySelectorAll("input[required]");
    let valid = true;
    inputs.forEach(input => {
      if (!input.value) {
        valid = false;
        input.style.borderColor = FINDINGS.high.dark;
      } else {
        input.style.borderColor = BORDER;
      }
    });
    if (!valid) return;

    setSending(true);
    const formData = new FormData();
    form.querySelectorAll("input").forEach(el => {
      if (el.name) formData.append(el.name, el.value);
    });

    fetch("https://formspree.io/f/xnjolywk", {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    }).then(res => {
      if (res.ok) setSubmitted(true);
      setSending(false);
    }).catch(() => setSending(false));
  };

  return (
    <section style={{ background: HOUSE.navy, minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", padding: "140px 28px 80px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "none", backgroundSize: "64px 64px" }} />
      <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: "none" }} />

      <div style={{ ...WRAP, position: "relative", zIndex: 1, width: "100%" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          {submitted ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: HOUSE.navy, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <span style={{ color: LIGHT, fontSize: 26 }}>✓</span>
              </div>
              <h1 style={{ fontFamily: FONT, fontSize: 32, fontWeight: 400, color: HOUSE.mist, margin: "0 0 12px" }}>You're in.</h1>
              <p style={{ fontSize: 16, color: HOUSE.body, lineHeight: 1.65, fontFamily: FONT, margin: "0 0 32px" }}>
                We'll send you vendor intelligence, market analysis, and operational insights worth reading. No filler.
              </p>
              <a href="/" style={{ color: LIGHT, fontSize: 14, fontWeight: 600, fontFamily: FONT }}>← Back to home</a>
            </div>
          ) : (
            <div>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <h1 style={{ fontFamily: FONT, fontSize: "clamp(30px, 4vw, 42px)", fontWeight: 400, color: HOUSE.mist, lineHeight: 1.12, margin: "0 0 16px" }}>
                  Stay ahead of the CX landscape.
                </h1>
                <p style={{ fontSize: 16, color: HOUSE.body, lineHeight: 1.65, fontFamily: FONT }}>
                  Vendor intelligence, market shifts, and operational insights delivered to your inbox. Written for CX leaders who make technology and strategy decisions.
                </p>
              </div>

              <div id="subscribe-form" style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, borderRadius: 14, padding: "32px 28px" }}>
                <input type="hidden" name="_subject" value="New Newsletter Subscriber: Center of CX" />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label htmlFor="sub-first_name" style={{ ...labelStyle, color: HOUSE.body }}>First name</label>
                    <input id="sub-first_name" name="first_name" required style={{ ...inputStyle, background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, color: HOUSE.mist }} placeholder="Jane" />
                  </div>
                  <div>
                    <label htmlFor="sub-last_name" style={{ ...labelStyle, color: HOUSE.body }}>Last name</label>
                    <input id="sub-last_name" name="last_name" required style={{ ...inputStyle, background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, color: HOUSE.mist }} placeholder="Smith" />
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label htmlFor="sub-company" style={{ ...labelStyle, color: HOUSE.body }}>Company</label>
                  <input id="sub-company" name="company" required style={{ ...inputStyle, background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, color: HOUSE.mist }} placeholder="Acme Corp" />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label htmlFor="sub-email" style={{ ...labelStyle, color: HOUSE.body }}>Work email</label>
                  <input id="sub-email" name="email" type="email" required style={{ ...inputStyle, background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, color: HOUSE.mist }} placeholder="jane@company.com" />
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={sending}
                  style={{
                    width: "100%", background: HOUSE.action, color: HOUSE.paper, opacity: sending ? 0.6 : 1,
                    fontSize: 15, fontWeight: 600, padding: "15px 32px", borderRadius: 8,
                    border: "none", cursor: sending ? "wait" : "pointer",
                    fontFamily: FONT, boxShadow: "none",
                    transition: "background 0.2s",
                  }}
                >
                  {sending ? "Subscribing..." : "Subscribe"}
                </button>

                <p style={{ fontSize: 12, color: HOUSE.body, textAlign: "center", margin: "16px 0 0", fontFamily: FONT }}>
                  Occasional emails. Unsubscribe anytime. We respect your inbox.
                </p>
              </div>
            </div>
          )}
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

export default function Subscribe() {
  return (
    <div>
      <Nav />
      <SubscribePage />
      <Footer />
    </div>
  );
}
