import { useState, useEffect } from "react";
import { VENDOR_PROFILE_COUNT, CATEGORY_COUNT, ADJACENT_PROFILE_COUNT, isVendorSlug } from "./src/lib/seo.js";
import { CCAAS_RESEARCH } from "./src/lib/researchStatus.js";
import { CATEGORIES } from "./src/lib/verticals.js";
import { HOUSE, PILLARS, LINE, alpha } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";

const NAVY = HOUSE.mist;
const DEEP = HOUSE.ink;
const ELECTRIC = PILLARS.vendors.onDark;
const LIGHT = PILLARS.vendors.onDark;
const ICE = HOUSE.navy;
const WARM = HOUSE.navy;
const SLATE = HOUSE.body;
const MUTED = HOUSE.muted;
const BORDER = alpha(HOUSE.mist, LINE.hair);


/* Content is visible from the first paint: no reveal on scroll, so a served page, a print and a quick scroll never show an empty band. */
function FadeIn({ children, style = {} }) { return <div style={style}>{children}</div>; }

const WRAP = { maxWidth: 1220, margin: "0 auto", padding: "0 28px" };
const Label = ({ children, light }) => <span style={{ color: light ? LIGHT : ELECTRIC, fontSize: 11.5, fontWeight: 700, letterSpacing: 2.2, textTransform: "uppercase", fontFamily: FONT, display: "block", marginBottom: 12 }}>{children}</span>;
const Title = ({ children, light }) => <h2 style={{ fontFamily: FONT, fontSize: "clamp(28px, 3.5vw, 44px)", fontWeight: 400, color: HOUSE.mist, lineHeight: 1.15, margin: "0 0 16px", letterSpacing: "-0.015em" }}>{children}</h2>;


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
        @media (max-width: 860px) { .nav-links { display: none !important; } .split-grid { grid-template-columns: 1fr !important; gap: 40px !important; } }
      `}</style>
      
    </>
  );
}

function Hero() {
  return (
    <section style={{ background: HOUSE.navy, padding: "140px 28px 80px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: "none", backgroundSize: "64px 64px" }} />
      <div style={{ position: "absolute", top: "-10%", right: "-5%", width: 500, height: 500, borderRadius: "50%", background: "none" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
            <a href="/" style={{ color: HOUSE.body, fontSize: 13, fontFamily: FONT }}>Home</a>
            <span style={{ color: HOUSE.body, fontSize: 13 }}>/</span>
            <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600, fontFamily: FONT }}>Vendors</span>
          </div>
        </FadeIn>
        <FadeIn delay={0.05}>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 64, alignItems: "center" }} className="split-grid">
            <div>
              <h1 style={{ fontFamily: FONT, fontSize: "clamp(34px, 4.5vw, 56px)", fontWeight: 400, color: HOUSE.mist, lineHeight: 1.1, letterSpacing: "-0.02em", margin: "0 0 24px" }}>
                {VENDOR_PROFILE_COUNT} vendors.{" "}
                <span style={{ background: `linear-gradient(135deg, ${ELECTRIC}, ${LIGHT})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Mapped by category.</span>
              </h1>
              <p style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: HOUSE.body, lineHeight: 1.7, maxWidth: 520, fontFamily: FONT }}>
                Every vendor is mapped to its category and to the layers of the stack it serves. Contact center platforms are researched finding by finding against a published method; the other categories are marked Phase 1 context until their research is complete. The category counts below add up to {VENDOR_PROFILE_COUNT - ADJACENT_PROFILE_COUNT}; the other {ADJACENT_PROFILE_COUNT} are adjacent suites listed on the contact center platforms page.
              </p>
            </div>
            <div style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, borderRadius: 12, padding: "28px 24px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {[
                  { n: String(VENDOR_PROFILE_COUNT), l: "Vendor profiles" },
                  { n: String(Object.keys(CCAAS_RESEARCH.complete).length), l: "Researched platforms" },
                  { n: "7", l: "Orchestration layers" },
                  { n: String(CATEGORY_COUNT), l: "Vendor categories" },
                ].map((s, i) => (
                  <div key={i} style={{ textAlign: "center", padding: "12px 0" }}>
                    <div style={{ fontFamily: FONT, fontSize: 28, color: LIGHT }}>{s.n}</div>
                    <div style={{ fontSize: 12, color: HOUSE.body, fontFamily: FONT }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function Stance() {
  return (
    <section style={{ background: WARM, padding: "64px 28px", borderBottom: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", gap: 16, maxWidth: 800 }}>
            <div style={{ width: 4, height: 48, background: ELECTRIC, borderRadius: 2, flexShrink: 0 }} />
            <p style={{ fontSize: 16, color: SLATE, lineHeight: 1.7, margin: 0, fontFamily: FONT }}>
              Profiles describe what each vendor sells and where it sits in the stack. No vendor pays to appear, and no profile carries a score or a rank.
            </p>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function BrowseByCategory() {

  /* count and href are derived from CATEGORIES, never typed. Four of these
     eight were wrong: Analytics claimed 52 against 41, Digital 50 against 46,
     Payments 51 against 33, and WEM rendered "25+" over a page headed 25.
     Governance carries no key because it is not a scored category yet. */
  const categories = [
    { key: "ccaas", title: "Core CX Platforms", sub: "CCaaS", vendors: [
      { name: "8x8", slug: "8x8" }, { name: "Amazon Connect", slug: "amazon-connect" }, { name: "Cisco Webex", slug: "cisco" },
      { name: "Five9", slug: "five9" }, { name: "Genesys", slug: "genesys" }, { name: "NICE CXone", slug: "nice-cxone" }, { name: "Talkdesk", slug: "talkdesk" }, { name: "Zoom", slug: "zoom" },
    ], desc: "The foundational platform for voice, digital, routing, and workforce management." },
    { key: "iva", title: "Customer Automation & Self-Service AI", sub: "IVA · Bots · Autonomous Resolution", vendors: [
      { name: "Kore.ai", slug: "kore-ai" }, { name: "NICE Cognigy", slug: "nice-cognigy" }, { name: "Yellow.ai", slug: "yellow-ai" }, { name: "LivePerson", slug: "liveperson" }, { name: "Google Dialogflow CX", slug: "google-dialogflow" }, { name: "Microsoft Copilot Studio", slug: "microsoft-copilot" }, { name: "Amelia / SoundHound", slug: "amelia-soundhound" },
    ], desc: "From legacy IVAs to LLM-native virtual assistants and autonomous AI workers." },
    { key: "agent-assist", title: "Agent Assist & Knowledge", sub: "Real-time Intelligence", vendors: [
      { name: "Balto", slug: "balto-aa" }, { name: "Cresta", slug: "cresta-aa" }, { name: "Genesys", slug: "genesys-aa" }, { name: "Google Cloud Agent Assist", slug: "google-aa" }, { name: "NICE", slug: "nice-aa" }, { name: "Observe.AI", slug: "observeai-aa" }, { name: "Verint", slug: "verint-aa" },
    ], desc: "Real-time guidance, knowledge retrieval, summarization, and next-best-action." },
    { key: "wem-qm", title: "Workforce & Quality Management", sub: "WEM · QM · WFM", vendors: [
      { name: "Assembled", slug: "assembled-wem" }, { name: "Calabrio", slug: "calabrio-wem" }, { name: "Five9", slug: "five9-wem" }, { name: "Genesys", slug: "genesys-wem" }, { name: "NICE", slug: "nice-wem" }, { name: "Verint", slug: "verint-wem" },
    ], desc: "Forecasting, scheduling, quality monitoring, coaching, and AI-powered QA." },
    { key: "analytics", title: "Experience Analytics & VoC", sub: "Speech · Text · Journey", vendors: [
      { name: "Calabrio", slug: "calabrio-analytics" }, { name: "CallMiner", slug: "callminer-analytics" }, { name: "Genesys Cloud CX", slug: "genesys-analytics" }, { name: "NICE CXone", slug: "nice-analytics" }, { name: "Observe.AI", slug: "observeai-analytics" }, { name: "Verint Speech Analytics", slug: "verint-analytics" },
    ], desc: "Sentiment, topic analysis, root cause detection, and cross-channel journey patterns." },
    { key: "acd-routing", title: "CX Orchestration & Workflow", sub: "ACD · Routing · Integration", vendors: [
      { name: "Amazon Connect", slug: "amazon-acd" }, { name: "Five9", slug: "five9-acd" }, { name: "Genesys Cloud", slug: "genesys-acd" }, { name: "NICE CXone", slug: "nice-acd" }, { name: "Salesforce Voice", slug: "salesforce-acd" }, { name: "Talkdesk", slug: "talkdesk-acd" },
    ], desc: "How interactions get routed, how systems share data, and how workflows execute." },
    { key: "digital-engagement", title: "Digital Engagement", sub: "Chat · Messaging · Social", vendors: [
      { name: "Ada", slug: "ada-de" }, { name: "Gladly", slug: "gladly-de" }, { name: "Intercom", slug: "intercom-de" }, { name: "Khoros", slug: "khoros-de" }, { name: "Salesforce Digital Engagement", slug: "salesforce-de" }, { name: "Sprinklr Service", slug: "sprinklr-de" }, { name: "Zendesk Messaging", slug: "zendesk-de" },
    ], desc: "Multi-channel digital engagement platforms, CPaaS, and conversational messaging." },
    { key: "payments", title: "Payments, Identity & Trust", sub: "PCI · Auth · Fraud", vendors: [
      { name: "Adyen", slug: "adyen-pay" }, { name: "Braintree", slug: "braintree-pay" }, { name: "Checkout.com", slug: "checkout-pay" }, { name: "CyberSource", slug: "cybersource-pay" }, { name: "Stripe", slug: "stripe-pay" }, { name: "Worldpay (FIS)", slug: "worldpay-pay" },
    ], desc: "Payment processing, PCI compliance, authentication, and fraud prevention in CX." },
    { title: "CX & AI Governance", sub: "Compliance · Model Risk", count: "Emerging", vendors: [], desc: "Compliance, model evaluation, escalation design, and AI auditability. Governance tooling is still consolidating." },
  ].map((c) => (c.key ? { ...c, count: String(CATEGORIES[c.key].vendorCount), href: CATEGORIES[c.key].page } : c));

  const VendorLink = ({ v }) => {
    const s = v.slug;
    const exists = isVendorSlug(s);
    return exists ? (
      <a href={`/vendors/${s}`} style={{ color: ELECTRIC, fontWeight: 600, borderBottom: `1px solid ${ELECTRIC}30`, transition: "border-color 0.2s" }}
        onMouseOver={e => e.target.style.borderColor = ELECTRIC}
        onMouseOut={e => e.target.style.borderColor = `${ELECTRIC}30`}>{v.name}</a>
    ) : <span>{v.name}</span>;
  };

  return (
    <section style={{ background: HOUSE.ink, padding: "96px 28px" }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ maxWidth: 560, marginBottom: 48 }}>
            <Label>Browse by decision domain</Label>
            <Title>{CATEGORY_COUNT} vendor categories and one emerging area.</Title>
          </div>
        </FadeIn>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {categories.map((c, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 28px", cursor: "pointer", transition: "all 0.22s" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = ELECTRIC; e.currentTarget.style.boxShadow = "none"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", flexWrap: "wrap", gap: 20 }}>
                  <div style={{ flex: 1, minWidth: "min(280px, 100%)" }}>
                    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px 12px", marginBottom: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", fontFamily: FONT }}>{c.sub}</span>
                      <span style={{ fontSize: 11, color: MUTED, background: WARM, padding: "2px 8px", borderRadius: 4, fontFamily: FONT }}>{c.count} vendors</span>
                    </div>
                    <h3 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 400, color: NAVY, margin: "0 0 6px" }}>{c.title}</h3>
                    <p style={{ fontSize: 13.5, color: MUTED, lineHeight: 1.55, margin: "0 0 12px", fontFamily: FONT }}>{c.desc}</p>
                    <p style={{ fontSize: 12.5, color: SLATE, margin: 0, fontFamily: FONT }}>
                      <span style={{ fontWeight: 600 }}>Profiles include (A to Z): </span>
                      {c.vendors.map((v, j) => (
                        <span key={j}><VendorLink v={v} />{j < c.vendors.length - 1 ? ", " : ""}</span>
                      ))}
                    </p>
                  </div>
                  <a href={c.href || "/vendors"} style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC, fontFamily: FONT, flexShrink: 0, paddingTop: 4 }}>Explore →</a>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowWeEvaluate() {
  return (
    <section style={{ background: HOUSE.navy, padding: "96px 28px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "30%", left: "-5%", width: 400, height: 400, borderRadius: "50%", background: "none" }} />
      <div style={{ ...WRAP, position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 580, margin: "0 auto 56px" }}>
            <Label light>How we evaluate</Label>
            <Title light>How the vendor profiles are built.</Title>
          </div>
        </FadeIn>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {[
            { t: "Researched contact center platforms", d: `${Object.keys(CCAAS_RESEARCH.complete).length} CCaaS vendors are researched under the current method: findings with dated public sources, compared only inside a competitive class, with where each platform breaks, what it takes to run, and what to ask for.` },
            { t: "Phase 1 profiles, labelled", d: "Every other profile carries the earlier Phase 1 assessment as context, and says so on the page. Its scores, tiers and rankings are withdrawn in every category until that category is researched under the current method." },
            { t: "No scores and no ranks", d: "No profile carries a score, tier or rank, and no vendor pays to appear. Numeric ratings stay withheld until each competitive class has enough researched peers to compare fairly." },
            { t: "Corrections in the open", d: "Anyone can report an error with a public source. Accepted corrections are noted on the vendor's page, and every report gets an answer." },
          ].map((item, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div style={{ background: HOUSE.navy, border: `1px solid ${alpha(HOUSE.mist, LINE.hair)}`, borderRadius: 10, padding: "28px 24px" }}>
                <h3 style={{ fontFamily: FONT, fontSize: 19, fontWeight: 400, color: HOUSE.mist, margin: "0 0 8px" }}>{item.t}</h3>
                <p style={{ fontSize: 13.5, color: HOUSE.body, lineHeight: 1.6, margin: 0, fontFamily: FONT }}>{item.d}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

function VendorPagePreview() {
  return (
    <section style={{ background: WARM, padding: "96px 28px", borderTop: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 580, margin: "0 auto 48px" }}>
            <Label>Researched vendor pages</Label>
            <Title>Six questions a researched profile answers.</Title>
            <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.65, marginTop: 4, fontFamily: FONT }}>
              Each researched CCaaS profile answers the same six questions from its sources. Phase 1 profiles show the earlier assessment, labelled as such, until their category is researched.
            </p>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div style={{ background: HOUSE.ink, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "40px 36px", maxWidth: 700, margin: "0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { label: "Is it a fit?", desc: "Its competitive class and the job that class does, who it is sold to, when it is the rational choice, and when to rule it out." },
                { label: "What does it do?", desc: "Each finding by capability, with its evidence state, its conditions, the date it was checked and its public sources." },
                { label: "Where does it break?", desc: "What triggers the break, who it hits, how it is mitigated, what that adds in build and cost, and who owns it after go-live." },
                { label: "What will it take?", desc: "Implementation, services terms, life after go-live, cost drivers and integrations." },
                { label: "What should I ask for?", desc: "The proof to request, the contract terms to raise, the AI controls to check and the open questions." },
                { label: "Where does this come from?", desc: "Who published the evidence, and every source with its publisher, tier and date. Any reader can ask for an introduction or report an error." },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 16, padding: "12px 0", borderBottom: i < 5 ? `1px solid ${BORDER}` : "none" }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: `${ELECTRIC}10`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: ELECTRIC }}>{i + 1}</span>
                  </div>
                  <div>
                    <h4 style={{ fontSize: 14.5, fontWeight: 600, color: NAVY, margin: "0 0 3px", fontFamily: FONT }}>{item.label}</h4>
                    <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.55, margin: 0, fontFamily: FONT }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section style={{ background: HOUSE.ink, padding: "96px 28px", borderTop: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
            <Title>Need a shortlist tailored to your situation?</Title>
            <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.65, margin: "8px 0 32px", fontFamily: FONT }}>
              Browsing {VENDOR_PROFILE_COUNT} vendors takes time. Tell us your operating model, industry and constraints, and we will help you build a shortlist, with the research behind each name.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <a href="/contact" style={{ background: HOUSE.action, color: HOUSE.paper, fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, fontFamily: FONT, boxShadow: "none" }}>Request a Vendor Shortlist</a>
              <a href="/how-to-choose" style={{ background: HOUSE.ink, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 15, fontWeight: 600, padding: "14px 28px", borderRadius: 8, fontFamily: FONT }}>Browse Buyer Guides</a>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

function Footer() {
  return (
    null
  );
}

function EcosystemLink() {
  return (
    <section style={{ background: WARM, padding: "48px 28px" }}>
      <div style={WRAP}>
        <FadeIn>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
            <p style={{ fontSize: 14, color: MUTED, margin: 0 }}>Looking for CX industry news, research, and community beyond vendor intelligence?</p>
            <a href="/cx-ecosystem" style={{ fontSize: 14, fontWeight: 600, color: ELECTRIC }}>Explore the CX Ecosystem →</a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default function Vendors() {
  return (
    <div>
      <Nav />
      <Hero />
      <Stance />
      <BrowseByCategory />
      <HowWeEvaluate />
      <VendorPagePreview />
      <CTA />
      <EcosystemLink />
      <Footer />
    </div>
  );
}
