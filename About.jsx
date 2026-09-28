// About.jsx
//
// What the site is, how its numbers are made, the independence rules and what happens to a visitor's data, stated as
// facts a first-time reader can check. Every count is derived from the registry that owns it (seo.js, researchStatus.js,
// methodVersions.js, verticals.js), never typed. It replaces a page of positioning copy that promised verdicts the site
// does not make ("some platforms are genuinely better ... and we'll say so") and described vendor scoring the site
// withdrew in S22. Tokens only; the header sits in the flow.
import { HOUSE, PILLARS, RADIUS } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";
import { K } from "./src/lib/frameKit.jsx";
import { Crumbs } from "./src/lib/Shell.jsx";
import { Icon } from "./src/lib/Icon.jsx";
import { TOOL_COUNT, VENDOR_PROFILE_COUNT, CATEGORY_COUNT, SEGMENT_COUNT } from "./src/lib/seo.js";
import { CCAAS_COMPLETE_COUNT } from "./src/lib/researchStatus.js";
import { METHOD_COUNT, INDUSTRY_COUNT } from "./src/lib/home.js";

const ACCENT = HOUSE.sky2;
const link = { color: ACCENT, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 };
const CSS = `.cx-about p,.cx-about li{overflow-wrap:anywhere}`;

/* What a reader can use, each with the count its registry holds. */
export const OFFER = [
  { n: TOOL_COUNT, title: "diagnostics", text: `Calculators, assessments and procurement tools. Each has a published method (${METHOD_COUNT} in all) and a report you can download with no sign-in.`, href: "/how-to-choose", cta: "See the diagnostics" },
  { n: VENDOR_PROFILE_COUNT, title: "vendor profiles", text: `Across ${CATEGORY_COUNT} technology categories, listed A to Z. ${CCAAS_COMPLETE_COUNT} contact center platforms are researched finding by finding, each finding with its public sources and validation date.`, href: "/vendors", cta: "Browse the vendors" },
  { n: INDUSTRY_COUNT, title: "industries", text: `With ${SEGMENT_COUNT} segments: what each one requires, the regulation it answers to and the published benchmarks that exist for it. Where no public benchmark exists, the page says so.`, href: "/industries", cta: "Find your industry" },
];

/* How a figure on this site is made. */
export const HOW = [
  { title: "Every figure is one of four kinds", text: "A fact with its source, an assumption labelled as one, a result modelled from inputs you can see, or a measurement you entered. A model says what it computes under its inputs; it never promises a saving." },
  { title: "Every result says how sure it is", text: "Three grades sit behind each result: the evidence behind the inputs, how likely the value is to be realized, and how complete the inputs are. The weakest sets the headline, and the page says what would raise it. When a result cannot be trusted, the page shows no figure." },
  { title: "Every method is published", text: "Each diagnostic's formulas and constants are written out in words, with a version and date, and checked against published reference cases such as Erlang C tables. A constant with no public source is labelled as a planning value of our own." },
  { title: "Sources are linked, quotes are credited", text: "A published figure links to the publisher's own page. What is not a quotation is written in our own words." },
];

/* The independence rules. */
export const RULES = [
  "No vendor pays to appear, to move, to be left out or to see research before it is published.",
  "Vendor lists run A to Z. No scores or ranks are shown while the current research is in progress; the earlier Phase 1 scores are withdrawn.",
  "An introduction to a vendor, when you ask for one, never changes a list, an order or a finding.",
  "Anyone, including a vendor, can report an error with a public source. Every accepted correction is shown on the vendor's page.",
];

/* What happens to a visitor's data. */
export const DATA = [
  "No sign-in and no email to use any diagnostic or download its report.",
  "The numbers you enter stay in your browser tab unless you send them to us for a review.",
  "Usage is counted anonymously: which pages and tools are used, never the figures you enter.",
];

function Section({ id, title, children }) {
  return (
    <section aria-labelledby={id} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h2 id={id} style={{ ...K.h2, fontSize: 22, lineHeight: "30px", margin: 0 }}>{title}</h2>
      {children}
    </section>
  );
}

export default function About() {
  return (
    <div className="cx-about" style={{ background: HOUSE.ink, color: HOUSE.mist, fontFamily: FONT, minHeight: "100vh" }}>
      <style>{CSS}</style>
      <Crumbs items={[["Home", "/"], ["About"]]} />
      <div style={{ maxWidth: 920, margin: "0 auto", padding: "32px 20px 72px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: 40 }}>
        <header style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span style={{ ...K.kicker, color: ACCENT }}>About The Center of CX</span>
          <h1 style={{ margin: 0, fontSize: "clamp(30px, 4.4vw, 46px)", fontWeight: 700, lineHeight: 1.1, color: HOUSE.mist }}>Free diagnostics and vendor research for contact center decisions.</h1>
          <p style={{ ...K.body, fontSize: 17, lineHeight: "28px", maxWidth: 720 }}>
            For the people who run contact centers, buy their technology and fund the change. Every figure on the site says where it came from and how sure it is, so you can check it before you rely on it.
          </p>
          <p style={K.small}>Independent and self-funded, with no vendor owner or investor.</p>
        </header>

        <Section id="offer" title="What you can use here">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(250px, 100%), 1fr))", gap: 14 }}>
            {OFFER.map((o) => (
              <div key={o.title} style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 34, fontWeight: 700, lineHeight: 1, color: HOUSE.mist }}>{o.n}</span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: HOUSE.mist }}>{o.title}</span>
                </div>
                <p style={{ ...K.body, flex: 1 }}>{o.text}</p>
                <a href={o.href} style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 44, fontSize: 14, fontWeight: 600, color: ACCENT, textDecoration: "none" }}>{o.cta}<Icon name="next" size={16} /></a>
              </div>
            ))}
          </div>
          <p style={K.body}>Also: <a href="/market-watch" style={link}>Market Watch</a>, dated launches, deals, outages and rule changes, each labelled by the source it rests on.</p>
        </Section>

        <Section id="how" title="How the numbers are made">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(380px, 100%), 1fr))", gap: 14 }}>
            {HOW.map((h) => (
              <div key={h.title} style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 6 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: HOUSE.mist }}>{h.title}</h3>
                <p style={K.body}>{h.text}</p>
              </div>
            ))}
          </div>
          <p style={K.body}>Read one: <a href="/methodology/cost-per-contact" style={link}>the Cost per Contact method</a>, or <a href="/methodology/staffing-calculator" style={link}>the Staffing method</a>, which is checked against published Erlang C cases.</p>
        </Section>

        <Section id="independence" title="Independence">
          <ul style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 10 }}>
            {RULES.map((r) => <li key={r} style={K.body}>{r}</li>)}
          </ul>
          <p style={K.body}><a href="/corrections" style={link}>How corrections work</a></p>
        </Section>

        <Section id="data" title="Your data">
          <ul style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 10 }}>
            {DATA.map((d) => <li key={d} style={K.body}>{d}</li>)}
          </ul>
          <p style={K.body}>The <a href="/privacy" style={link}>Privacy Policy</a> names every service the site uses and what each receives.</p>
        </Section>

        <section aria-labelledby="touch" style={{ ...K.panel, borderColor: PILLARS.diagnostics.onDark, borderRadius: RADIUS.card, display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 id="touch" style={{ ...K.h2, margin: 0 }}>Get in touch</h2>
          <p style={K.body}>
            Questions, a project or a vendor you want researched: <a href="/contact" style={link}>contact us</a>. To write for the site, see <a href="/contribute" style={link}>Write for us</a>. New methods, research and Market Watch items: <a href="/subscribe" style={link}>subscribe</a>. Publications and communities we read are on <a href="/cx-ecosystem" style={link}>the CX ecosystem page</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
