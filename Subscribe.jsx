import { useState, useEffect, useRef } from "react";

const NAVY = "#0B1D3A";
const DEEP = "#061325";
const ELECTRIC = "#0088DD";
const LIGHT = "#00AAFF";
const WARM = "#F8FAFB";
const SLATE = "#3A4F6A";
const MUTED = "#6B7F99";
const BORDER = "#D8E3ED";

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
        @media (max-width: 860px) { .nav-links { display: none !important; } }
        input:focus { outline: none; border-color: ${ELECTRIC} !important; box-shadow: 0 0 0 3px rgba(0,136,221,0.1); }
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

function SubscribePage() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const inputStyle = {
    width: "100%", padding: "13px 16px", fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    border: `1px solid ${BORDER}`, borderRadius: 8, background: "#fff", color: NAVY,
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const labelStyle = {
    fontSize: 13, fontWeight: 600, color: NAVY, display: "block", marginBottom: 6,
    fontFamily: "'DM Sans', sans-serif",
  };

  const handleSubmit = () => {
    const form = document.getElementById("subscribe-form");
    const inputs = form.querySelectorAll("input[required]");
    let valid = true;
    inputs.forEach(input => {
      if (!input.value) {
        valid = false;
        input.style.borderColor = "#e74c3c";
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
    <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden", padding: "140px 28px 80px" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
      <div style={{ position: "absolute", bottom: "-20%", right: "-10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.06) 0%, transparent 70%)" }} />

      <div style={{ ...WRAP, position: "relative", zIndex: 1, width: "100%" }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          {submitted ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(0,136,221,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
                <span style={{ color: LIGHT, fontSize: 26 }}>✓</span>
              </div>
              <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", margin: "0 0 12px" }}>You're in.</h1>
              <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif", margin: "0 0 32px" }}>
                We'll send you vendor intelligence, market analysis, and operational insights worth reading. No filler.
              </p>
              <a href="/" style={{ color: LIGHT, fontSize: 14, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>← Back to home</a>
            </div>
          ) : (
            <div>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(30px, 4vw, 42px)", fontWeight: 400, color: "#fff", lineHeight: 1.12, margin: "0 0 16px" }}>
                  Stay ahead of the CX landscape.
                </h1>
                <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>
                  Vendor intelligence, market shifts, and operational insights delivered to your inbox. Written for CX leaders who make technology and strategy decisions.
                </p>
              </div>

              <div id="subscribe-form" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "32px 28px" }}>
                <input type="hidden" name="_subject" value="New Newsletter Subscriber — Center of CX" />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                  <div>
                    <label style={{ ...labelStyle, color: "rgba(255,255,255,0.7)" }}>First name</label>
                    <input name="first_name" required style={{ ...inputStyle, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} placeholder="Jane" />
                  </div>
                  <div>
                    <label style={{ ...labelStyle, color: "rgba(255,255,255,0.7)" }}>Last name</label>
                    <input name="last_name" required style={{ ...inputStyle, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} placeholder="Smith" />
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={{ ...labelStyle, color: "rgba(255,255,255,0.7)" }}>Company</label>
                  <input name="company" required style={{ ...inputStyle, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} placeholder="Acme Corp" />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ ...labelStyle, color: "rgba(255,255,255,0.7)" }}>Work email</label>
                  <input name="email" type="email" required style={{ ...inputStyle, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff" }} placeholder="jane@company.com" />
                </div>

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={sending}
                  style={{
                    width: "100%", background: sending ? SLATE : ELECTRIC, color: "#fff",
                    fontSize: 15, fontWeight: 600, padding: "15px 32px", borderRadius: 8,
                    border: "none", cursor: sending ? "wait" : "pointer",
                    fontFamily: "'DM Sans', sans-serif", boxShadow: `0 4px 18px rgba(0,136,221,0.25)`,
                    transition: "background 0.2s",
                  }}
                >
                  {sending ? "Subscribing..." : "Subscribe"}
                </button>

                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textAlign: "center", margin: "16px 0 0", fontFamily: "'DM Sans', sans-serif" }}>
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

export default function Subscribe() {
  return (
    <div>
      <Nav />
      <SubscribePage />
      <Footer />
    </div>
  );
}
