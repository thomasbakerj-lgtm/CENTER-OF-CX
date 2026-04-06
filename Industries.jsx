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
const Label = ({ children, light }) => <span style={{ color: light ? LIGHT : ELECTRIC, fontSize: 11.5, fontWeight: 700, letterSpacing: 2.2, textTransform: "uppercase", fontFamily: "'DM Sans', sans-serif", display: "block", marginBottom: 12 }}>{children}</span>;
const Title = ({ children, light }) => <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 400, color: light ? "#fff" : NAVY, lineHeight: 1.15, margin: "0 0 16px", letterSpacing: "-0.015em" }}>{children}</h2>;

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
        @media (max-width: 860px) { .nav-links { display: none !important; } .model-grid { grid-template-columns: 1fr !important; } }
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

function Hero() {
  return (
    <section style={{ background: `linear-gradient(168deg, ${DEEP} 0%, ${NAVY} 50%, #0F2847 100%)`, padding: "140px 28px 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,136,221,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,136,221,0.02) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
      <div style={{ position: "absolute", bottom: "-15%", left: "-8%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.05) 0%, transparent 70%)" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <a href="/" style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>Home</a>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>/</span>
            <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>Industries</span>
          </div>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div style={{ maxWidth: 680 }}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: "clamp(34px, 4.5vw, 56px)", fontWeight: 400, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 24px" }}>
              CX changes by context.{" "}
              <span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Generic advice fails.</span>
            </h1>
            <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: 560, fontFamily: "'DM Sans', sans-serif" }}>
              Regulatory burden, customer emotion, channel mix, data sensitivity, and service urgency vary dramatically by vertical. The right CCaaS platform for a bank looks nothing like the right one for a retailer. We map the differences so your decisions account for them.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function StackModel() {
  return (
    <section style={{ background: WARM, padding: "80px 28px", borderBottom: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }} className="model-grid">
            <div>
              <Label>The two-layer model</Label>
              <Title>Every vertical needs a CCaaS platform and a vertical CX overlay.</Title>
              <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.7, marginTop: 8, fontFamily: "'DM Sans', sans-serif" }}>
                Layer 1 is the CCaaS platform that handles routing, voice, digital channels, and workforce management. Layer 2 is the vertical-specific CX stack — the overlays and adjacent solutions purpose-built for your industry's unique compliance, workflow, and customer interaction patterns.
              </p>
              <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.7, marginTop: 12, fontFamily: "'DM Sans', sans-serif" }}>
                Most organizations pick Layer 1 first and hope Layer 2 works itself out. The strongest operators evaluate both layers together because the integration points between them determine whether the system actually delivers.
              </p>
            </div>
            <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
              <div style={{ background: `${ELECTRIC}08`, padding: "20px 24px", borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>Layer 2 — Vertical CX Stack</div>
                <p style={{ fontSize: 13, color: SLATE, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Industry-specific overlays: digital service, AI, WEM, analytics, and bot platforms purpose-built for your vertical</p>
              </div>
              <div style={{ padding: "20px 24px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4, fontFamily: "'DM Sans', sans-serif", opacity: 0.5 }}>Layer 1 — CCaaS Platform</div>
                <p style={{ fontSize: 13, color: MUTED, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Full-suite contact center platform: routing, voice, digital channels, workforce management, core analytics</p>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function IndustryGrid() {
  const industries = [
    {
      name: "Financial Services",
      sub: "Banking · Credit Unions · Insurance · Fintech · Lending",
      why: "Trust-sensitive interactions, high compliance burden, complex servicing journeys, fraud and authentication challenges.",
      ccaas: "Talkdesk FS, NICE CXone, Genesys, Amazon Connect, RingCentral",
      overlay: "Glia, Kasisto, Unblu, Verint, Personetics, Amelia, Cognigy",
    },
    {
      name: "Healthcare",
      sub: "Payers · Providers · Digital Health · Patient Access",
      why: "Emotionally charged interactions, HIPAA complexity, fragmented systems, scheduling and triage challenges.",
      ccaas: "NICE CXone, Genesys, Talkdesk Healthcare, Cisco Webex, 8x8",
      overlay: "Orbita, Hyro.ai, Nuance, Amelia, Qualtrics, LivePerson, Invoca",
    },
    {
      name: "Retail & eCommerce",
      sub: "DTC · Omnichannel · Marketplaces · Subscription",
      why: "High-volume speed-sensitive service, returns and fulfillment complexity, seasonal staffing pressure, low friction tolerance.",
      ccaas: "Talkdesk Retail, Genesys, NICE CXone, RingCentral, Five9",
      overlay: "Gladly, Kustomer, Gorgias, Salesforce, Ada, Forethought, Coveo",
    },
    {
      name: "Telecommunications",
      sub: "Telecom · SaaS · Enterprise Software · Consumer Tech",
      why: "Technical troubleshooting, recurring revenue retention, tiered support models, churn tied to service quality.",
      ccaas: "Genesys, NICE CXone, Avaya, Cisco Webex, Amazon Connect",
      overlay: "ServiceNow, Verint, Cognigy, Sprinklr, Amdocs",
    },
    {
      name: "Insurance",
      sub: "P&C · Life · Health · Claims · Underwriting Support",
      why: "High-value service moments, claims journey complexity, regulatory compliance, trust preservation.",
      ccaas: "NICE CXone, Genesys, Talkdesk Insurance, Bright Pattern, Enghouse",
      overlay: "Glia, Guidewire, Duck Creek, Unblu, Cognigy, Amelia",
    },
    {
      name: "Travel & Hospitality",
      sub: "Airlines · Hotels · OTAs · Car Rental · Logistics",
      why: "Real-time service failures, disruption management, loyalty-intensive models, multilingual demand spikes.",
      ccaas: "Genesys, Talkdesk Travel, NICE CXone, Puzzel, RingCentral",
      overlay: "Sprinklr, Zendesk, Uniphore, Verint, Amelia, Qualtrics",
    },
    {
      name: "Utilities & Energy",
      sub: "Power · Gas · Water · Energy Retailers",
      why: "Essential service relationships, outage communication, billing sensitivity, regulatory complexity.",
      ccaas: "Odigo, Genesys, NICE CXone, Cisco Webex, Amazon Connect",
      overlay: "Opower, Verint, Cognigy, Boost.ai, Qualtrics, UiPath",
    },
    {
      name: "Government & Public Sector",
      sub: "Citizen Services · Benefits · Municipal Contact Centers",
      why: "Accessibility requirements, budget constraints, process-heavy journeys, multilingual and inclusive design needs.",
      ccaas: "NICE CXone, Genesys, Cisco Webex, Odigo, Enghouse",
      overlay: "Verint Citizen, Cognigy, Nuance, ServiceNow, Qualtrics XM",
    },
    {
      name: "Manufacturing & Automotive",
      sub: "Industrial · Field Service · Dealership · After-Sales",
      why: "Scheduling complexity, field dispatch coordination, asset-centric service, local service expectations.",
      ccaas: "Genesys, NICE CXone, Odigo, Enghouse, Bright Pattern",
      overlay: "IFS, PTC, Syncron, ServiceMax, Salesforce Manufacturing",
    },
    {
      name: "Media & Entertainment",
      sub: "Streaming · Fan Engagement · Events · Publishing",
      why: "High-volume event spikes, subscriber retention, content-driven support, real-time interaction demands.",
      ccaas: "Genesys, NICE CXone, Five9, Vonage, RingCentral",
      overlay: "Sprinklr, Zendesk, Cognigy, LivePerson, Salesforce",
    },
  ];

  return (
    <section style={{ background: "#fff", padding: "96px 28px" }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ maxWidth: 560, marginBottom: 48 }}>
            <Label>Ten verticals</Label>
            <Title>Each one mapped with CCaaS platforms and vertical-specific overlays.</Title>
          </div>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {industries.map((ind, i) => (
            <FadeIn key={i} delay={i * 0.03}>
              <IndustryCard ind={ind} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function IndustryCard({ ind }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      style={{ border: `1px solid ${open ? ELECTRIC : BORDER}`, borderRadius: 12, overflow: "hidden", cursor: "pointer", transition: "border-color 0.2s, box-shadow 0.2s", boxShadow: open ? "0 4px 20px rgba(0,136,221,0.06)" : "none" }}
    >
      <div style={{ padding: "24px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h3 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 4px" }}>{ind.name}</h3>
          <span style={{ fontSize: 12.5, color: MUTED, fontFamily: "'DM Sans', sans-serif" }}>{ind.sub}</span>
        </div>
        <span style={{ fontSize: 20, color: MUTED, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.25s", flexShrink: 0, marginLeft: 16 }}>▾</span>
      </div>
      {open && (
        <div style={{ padding: "0 28px 28px", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ padding: "20px 0 0" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 6, fontFamily: "'DM Sans', sans-serif" }}>Why this vertical is different</div>
              <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.6, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{ind.why}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="model-grid">
              <div style={{ background: WARM, borderRadius: 8, padding: "16px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8, fontFamily: "'DM Sans', sans-serif", opacity: 0.5 }}>Layer 1 — CCaaS platforms</div>
                <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{ind.ccaas}</p>
              </div>
              <div style={{ background: `${ELECTRIC}06`, borderRadius: 8, padding: "16px 18px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>Layer 2 — Vertical CX stack</div>
                <p style={{ fontSize: 13, color: SLATE, lineHeight: 1.6, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{ind.overlay}</p>
              </div>
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 16 }}>
              <a href="/contact" style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC, fontFamily: "'DM Sans', sans-serif" }}>Request industry briefing →</a>
              <a href="/vendors" style={{ fontSize: 13, fontWeight: 600, color: MUTED, fontFamily: "'DM Sans', sans-serif" }}>Browse vendors →</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WhyVerticalMatters() {
  return (
    <section style={{ background: `linear-gradient(168deg, ${NAVY}, ${DEEP})`, padding: "96px 28px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "30%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,136,221,0.04) 0%, transparent 70%)" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 580, margin: "0 auto 48px" }}>
            <Label light>Why vertical specificity matters</Label>
            <Title light>Five dimensions that change every recommendation.</Title>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {[
            { t: "Regulatory burden", d: "HIPAA, PCI, GDPR, state insurance regulations — compliance requirements reshape every technology and process decision." },
            { t: "Customer emotion", d: "A patient calling about a diagnosis and a shopper tracking a package require fundamentally different service design." },
            { t: "Channel mix", d: "Banking skews voice and secure messaging. Retail skews chat and social. Utilities skew IVR and outbound. The right channel strategy varies by vertical." },
            { t: "Data sensitivity", d: "Financial data, health records, payment information — the sensitivity level determines governance, authentication, and AI guardrail requirements." },
            { t: "Service urgency", d: "A power outage, a flight cancellation, and a subscription renewal have completely different time pressures and escalation needs." },
          ].map((item, i) => (
            <FadeIn key={i} delay={i * 0.06}>
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "24px 20px" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: "0 0 6px", fontFamily: "'DM Sans', sans-serif" }}>{item.t}</h3>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)", lineHeight: 1.55, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{item.d}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section style={{ background: WARM, padding: "96px 28px", borderTop: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
            <Title>Need guidance specific to your vertical?</Title>
            <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.65, margin: "8px 0 32px", fontFamily: "'DM Sans', sans-serif" }}>
              We help CX leaders in regulated, complex, and high-volume verticals make better technology and strategy decisions. Tell us your industry and your challenge — we'll come prepared with relevant vendor intelligence and frameworks.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <a href="/contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif", boxShadow: `0 4px 18px rgba(0,136,221,0.2)` }}>Request an Industry Briefing</a>
              <a href="/advisory" style={{ background: "#fff", border: `1px solid ${BORDER}`, color: NAVY, fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, fontFamily: "'DM Sans', sans-serif" }}>Explore Advisory</a>
            </div>
          </div>
        </FadeIn>
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

export default function Industries() {
  return (
    <div>
      <Nav />
      <Hero />
      <StackModel />
      <IndustryGrid />
      <WhyVerticalMatters />
      <CTA />
      <Footer />
    </div>
  );
}
