import { useState, useEffect } from "react";

const NAVY = "#0B1D3A"; const DEEP = "#061325"; const ELECTRIC = "#0088DD"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const MUTED = "#6B7F99"; const BORDER = "#D8E3ED";
const WRAP = { maxWidth: 760, margin: "0 auto", padding: "0 28px" };
function LogoMark({size=28,light=true}){const a=light?"#fff":NAVY,x=light?LIGHT:ELECTRIC;return<svg width={size} height={size} viewBox="0 0 120 120" style={{flexShrink:0}}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light?.6:.3}/><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light?.8:.5}/><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round"/><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round"/></g></svg>}

const S = ({ children }) => <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 20, fontWeight: 400, color: NAVY, margin: "32px 0 12px", lineHeight: 1.25 }}>{children}</h2>;
const P = ({ children }) => <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.7, margin: "0 0 14px" }}>{children}</p>;

export default function PrivacyPolicy() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", fn, { passive: true }); return () => window.removeEventListener("scroll", fn); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const navLinks = [{ name: "Vendors", href: "/vendors" },{ name: "Tools", href: "/how-to-choose" },{ name: "Industries", href: "/industries" },{ name: "Research", href: "/research" },{ name: "The Human Premium", href: "/human-premium" }];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY}}a{text-decoration:none;color:inherit}`}</style>

      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000, background: "rgba(6,19,37,0.97)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(255,255,255,0.05)", padding: "10px 0" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark /><span style={{ color: "#fff", fontWeight: 600, fontSize: 13.5 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
          <a href="/subscribe" style={{ color: "#fff", fontSize: 12, fontWeight: 600, background: ELECTRIC, padding: "7px 16px", borderRadius: 5 }}>Subscribe</a>
        </div>
      </nav>

      <section style={{ background: DEEP, padding: "72px 28px 24px" }}>
        <div style={WRAP}>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32, fontWeight: 400, color: "#fff", margin: "0 0 4px" }}>Privacy Policy</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Last updated: May 2026</p>
        </div>
      </section>

      <section style={{ background: "#fff", padding: "32px 28px 64px" }}>
        <div style={WRAP}>
          <P>The Center of CX ("we," "us," "our") operates contactcentercx.com. This policy explains what data we collect, why, and how we handle it.</P>

          <S>What we collect</S>
          <P>When you use our interactive tools, download a buyer guide, or subscribe to our newsletter, we collect the information you provide: typically your name, email address, and optionally your company name. We collect this through Formspree, our form processing service.</P>
          <P>We use Vercel Analytics to understand how visitors use the site. This collects anonymized usage data including pages visited, device type, and approximate location. Vercel Analytics does not use cookies and does not track individual users across sessions.</P>
          <P>When you upload a company logo to the report generation feature, the logo is processed entirely in your browser. It is never sent to our servers or stored anywhere beyond your local session.</P>

          <S>How we use your information</S>
          <P>We use your email address to deliver the tool results, reports, or guides you requested. If you subscribe to our newsletter, we use your email to send periodic CX intelligence updates. We may use your information to follow up with relevant resources based on the tools you used — for example, if you run the Staffing Calculator, we may send you related content about workforce optimization.</P>
          <P>We do not sell, rent, or share your personal information with vendors, technology companies, or any third party for marketing purposes. This is a core commitment. No vendor pays to access your data. No vendor receives your information unless you explicitly request a consultant introduction through our matching service.</P>

          <S>Vendor independence</S>
          <P>No vendor pays to appear on this site. No vendor pays to rank higher. No vendor receives access to user data collected through our tools, forms, or subscriptions. Vendor scores are independently assigned based on published methodologies. This independence is foundational to our value and we will not compromise it.</P>

          <S>Cookies and tracking</S>
          <P>We do not use advertising cookies, remarketing pixels, or third-party tracking scripts. Vercel Analytics provides privacy-friendly site analytics without cookies. We do not run Google Analytics, Facebook Pixel, or any ad-network tracking.</P>

          <S>Third-party services</S>
          <P>We use the following third-party services to operate the site:</P>
          <P>Formspree — processes form submissions (name, email, tool data). Their privacy policy is available at formspree.io/legal/privacy-policy.</P>
          <P>Vercel — hosts the website and provides anonymized analytics. Their privacy policy is available at vercel.com/legal/privacy-policy.</P>
          <P>GitHub — hosts our source code repository. No user data is stored in GitHub.</P>

          <S>Data retention</S>
          <P>Form submissions are retained in Formspree for as long as we need them to follow up with you. Newsletter subscriptions are retained until you unsubscribe. You can request deletion of your data at any time by emailing us at the address below.</P>

          <S>Your rights</S>
          <P>You can request access to, correction of, or deletion of your personal data at any time. You can unsubscribe from our newsletter using the link in any email. If you are located in the EU, you have additional rights under GDPR including the right to data portability and the right to lodge a complaint with a supervisory authority.</P>

          <S>Children's privacy</S>
          <P>This site is designed for business professionals. We do not knowingly collect information from anyone under 16 years of age.</P>

          <S>Changes to this policy</S>
          <P>We may update this policy from time to time. The "Last updated" date at the top of this page reflects the most recent revision. Material changes will be noted on the site.</P>

          <S>Contact</S>
          <P>Questions about this privacy policy or your data can be directed to: <a href="/contact" style={{ color: ELECTRIC, fontWeight: 600 }}>contactcentercx.com/contact</a></P>
        </div>
      </section>

      <footer style={{ background: DEEP, padding: "32px 28px 20px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "0 28px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={22} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 12 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>© 2026 The Center of CX</span>
        </div>
      </footer>
    </div>
  );
}
