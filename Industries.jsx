// Industries.jsx
//
// The Industry Insights hub (redesign Phase 8 part 2), on the new design. Each industry card states one sourced figure
// through ClaimText (its source is on the industry page). Links go to the ten industry pages and to contact center
// platforms by industry. Tokens only.
import ClaimText from "./src/lib/ClaimText.jsx";
import { Crumbs, HEADER_HEIGHT } from "./src/lib/Shell.jsx";
import { CCAAS_COMPLETE_COUNT } from "./src/lib/researchStatus.js";
import { HOUSE, PILLARS } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";
import { K } from "./src/lib/frameKit.jsx";
import { CCAAS_INDEXED_INDUSTRIES } from "./src/lib/verticals.js";
import { SEGMENT_COUNT } from "./src/lib/seo.js";

const ACCENT = PILLARS.industries.onDark;
const WRAP = { maxWidth: 1080, margin: "0 auto", padding: "28px 20px 64px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 32 };
const CSS = `.cx-hub p,.cx-hub a,.cx-hub span{overflow-wrap:anywhere}`;

const DIMENSIONS = [
            { t: "Regulatory burden", d: "HIPAA, PCI, GDPR, state insurance regulations: compliance requirements reshape every technology and process decision." },
            { t: "Customer emotion", d: "A patient calling about a diagnosis and a shopper tracking a package require fundamentally different service design." },
            { t: "Channel mix", d: "Banking skews voice and secure messaging. Retail skews chat and social. Utilities skew IVR and outbound. The right channel strategy varies by vertical." },
            { t: "Data sensitivity", d: "Financial data, health records, payment information: the sensitivity level determines governance, authentication, and AI guardrail requirements." },
            { t: "Service urgency", d: "A power outage, a flight cancellation, and a subscription renewal have completely different time pressures and escalation needs." },
];

export default function Industries() {
  const industries = [
    { name: "Financial Services", href: "/industries/financial-services", subs: 7, sub: "Retail Banking · Credit Unions · Insurance · Wealth · Lending · Fintech · Payments", stat: "[[fs.bench.fcr.fs]] FCR, financial", why: "Trust-sensitive, compliance-heavy, multi-system authentication, and core banking integration." },
    { name: "Healthcare", href: "/industries/healthcare", subs: 6, sub: "Health Systems · Health Insurance · Provider Groups · Digital Health · Pharma · Home Health", stat: "[[hc.bench.fcr.hc]] FCR, health insurance", why: "Emotionally charged patient interactions, HIPAA at every layer, EHR integration, and scheduling fragmentation across clinical and administrative systems." },
    { name: "Retail & eCommerce", href: "/industries/retail", subs: 6, sub: "eCommerce/DTC · Omnichannel · Subscription · Marketplace · Luxury · Grocery/Delivery", stat: "[[retail.bench.fcr.retail]] FCR", why: "High-volume speed-sensitive service, returns and fulfillment complexity, seasonal surges, and commerce platform integration." },
    { name: "Telecommunications", href: "/industries/telecom", subs: 6, sub: "Mobile/Wireless · Broadband/ISP · Cable/Pay TV · Enterprise Comms · MSPs · Fiber", stat: "[[tel.bench.nps.tel]] NPS, global telecom", why: "Billing complexity, BSS/OSS integration, outage surges, SIM swap fraud, and CPNI authentication rules on every call." },
    { name: "Travel & Hospitality", href: "/industries/travel", subs: 6, sub: "Airlines · Hotels & Resorts · OTAs · Car Rental · Cruise Lines · Tours & Experiences", stat: "[[trv.dot.refund.card]] US card refund deadline", why: "Disruption volume spikes, multilingual support across timezones, GDS integration, and loyalty recognition failures." },
    { name: "Insurance", href: "/industries/insurance", subs: 6, sub: "Personal Lines P&C · Commercial · Life & Annuities · Workers' Comp · Specialty · Insurtech", stat: "[[ins.natcat.2025]] insured cat losses, 2025", why: "First notice of loss (FNOL) sets the course of a claim. Catastrophe surge capacity, state DOI compliance in every jurisdiction, and claims adjudication stakes." },
    { name: "Utilities & Energy", href: "/industries/utilities", subs: 6, sub: "Electric IOU · Natural Gas · Water · Municipal/Co-Op · Renewable/DER · Energy Retail", stat: "[[utl.eia.hours]] without power per customer, 2024", why: "Storm-driven volume swings, outage communication, PUC compliance, and payment difficulty as a public health issue." },
    { name: "Government & Public Sector", href: "/industries/government", subs: 6, sub: "Federal · State · Local/Municipal · Courts & Justice · Public Safety/911 · Social Services", stat: "[[gov.bench.fcr.gov]] FCR, government", why: "FedRAMP, GovRAMP, Section 508, Title VI language access, CJIS: legal mandates checked before functionality is evaluated." },
    { name: "Manufacturing & Automotive", href: "/industries/manufacturing", subs: 6, sub: "Automotive OEM · Dealer/Retail · Industrial B2B · Consumer Electronics · Aerospace · Food & Beverage", stat: "[[mfg.nhtsa.recalled]] vehicles under recall, 2025", why: "Warranty adjudication, recall surge routing, connected vehicle telemetry, parts logistics, and NHTSA/ITAR compliance." },
    { name: "Education", href: "/industries/education", subs: 6, sub: "Undergrad Admissions · Graduate Programs · Financial Aid · Student Services · IT Help Desk · Online Education", stat: "[[edu.nsc.persist]] of fall 2024 starters still enrolled a year later", why: "FERPA governs every interaction. FAFSA season creates surges. Siloed departments create a runaround. Retention signals hidden in service data." },
  ];

  return (
    <div className="cx-hub" style={{ background: HOUSE.ink, color: HOUSE.mist, fontFamily: FONT, minHeight: "100vh", paddingTop: HEADER_HEIGHT }}>
      <style>{CSS}</style>
      <Crumbs items={[["Industry Insights"]]} />
      <div style={WRAP}>
        <header style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 760 }}>
          <span style={{ ...K.kicker, color: ACCENT }}>Industry Insights</span>
          <h1 style={{ margin: 0, fontSize: "clamp(32px, 4.5vw, 50px)", fontWeight: 700, lineHeight: 1.1, color: HOUSE.mist }}>Contact center requirements by industry.</h1>
          <p style={{ ...K.body, fontSize: 17, lineHeight: "28px" }}>Rules, published figures and failure points for {industries.length} industries and {SEGMENT_COUNT} segments, with what each layer of the technology stack has to do. Every figure is sourced, labelled as a planning assumption, or marked as having no public benchmark.</p>
        </header>

        <section aria-labelledby="ten" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 760 }}>
            <span style={K.kicker}>Ten verticals</span>
            <h2 id="ten" style={{ ...K.h2, fontSize: 22, lineHeight: "30px", margin: 0 }}>What each industry page covers.</h2>
            <p style={K.body}>Each page has sourced figures, where operations fail, what each of the seven layers needs, benchmark tables, outsourcing notes, the platforms named, and its segments, each with a stack check you can mark as in place, needed or planned.</p>
          </div>
          <div style={K.grid(320)}>
            {industries.map((ind) => (
              <a key={ind.href} href={ind.href} style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 8, textDecoration: "none", color: HOUSE.mist }}>
                <span style={{ fontSize: 19, fontWeight: 700 }}>{ind.name}</span>
                <span style={K.small}>{ind.subs} segments</span>
                <span style={K.small}>{ind.sub}</span>
                <span style={K.body}>{ind.why}</span>
                <span style={{ ...K.strong, fontSize: 15 }}><ClaimText text={ind.stat} links={false} /></span>
                <span style={{ ...K.link, color: ACCENT, fontSize: 14 }}>Explore {ind.name}</span>
              </a>
            ))}
          </div>
        </section>

        <section aria-labelledby="why" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={K.kicker}>Why industry matters</span>
            <h2 id="why" style={{ ...K.h2, fontSize: 22, lineHeight: "30px", margin: 0 }}>Five things that change from one industry to the next.</h2>
          </div>
          <div style={K.grid(200)}>
            {DIMENSIONS.map((item) => (
              <div key={item.t} style={K.box}><h3 style={{ ...K.h2, fontSize: 16, margin: "0 0 6px" }}>{item.t}</h3><p style={K.small}>{item.d}</p></div>
            ))}
          </div>
        </section>

        <section aria-labelledby="vendors-by" style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={K.kicker}>Vendors by vertical</span>
          <h2 id="vendors-by" style={{ ...K.h2, fontSize: 22, lineHeight: "30px", margin: 0 }}>Contact center platforms by industry.</h2>
          <p style={K.body}>For healthcare, government and financial services, the research on {CCAAS_COMPLETE_COUNT} platforms gathered for the industry. For every industry, the platforms named with their tags and an introduction. Vendor scores are withdrawn; nothing here ranks a vendor.</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {industries.map((ind) => {
              const slug = ind.href.replace("/industries/", "");
              return <a key={slug} href={`/vendors/ccaas/${slug}`} style={{ ...K.box, ...K.link, color: HOUSE.mist, fontSize: 14 }}>{ind.name}{CCAAS_INDEXED_INDUSTRIES.includes(slug) ? ": what the research says" : ""}</a>;
            })}
          </div>
          <p style={K.small}>Need expert guidance? <a href="/contact" style={K.link}>Connect with a CX consultant</a>.</p>
        </section>
      </div>
    </div>
  );
}
