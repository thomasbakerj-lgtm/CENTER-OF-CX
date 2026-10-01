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

/* Why the site exists (TB, 29 Sep 2026: "why we built this and the value intended it brings all user types and
   personas", in a human voice, with no name on it). Each paragraph states intent or something the site does; none claims
   an outcome it cannot show. */
export const WHY = [
  "A contact center is where a company keeps its promises, or fails to. Every day, the people who answer the calls and messages live with decisions made far from the floor: the platform they log into, the targets they are held to, the staffing plan that decides whether there is a breath between one customer and the next.",
  "Those decisions are hard to get right. A platform choice can shape an operation for years. The people making it are busy running the place, rarely have neutral data, and seldom get to test a claim against their own numbers before they sign. Much of the guidance on offer comes from someone with something to sell, and figures travel from page to page until no one can say where they started.",
  "We built The Center of CX to be the place we wished existed. Free tools that take your numbers and show their working. Research that says where every finding comes from and when it was checked. A plain line between what is known, what is assumed and what is modelled, so you can see how far to lean on each answer. When a figure has no public source, we say so. When a result cannot be trusted, we show no figure at all.",
  "We believe better decisions in contact centers make better days for the people who work in them and better service for the people who call. Everything here is built toward that.",
];

/* What the site offers each kind of reader: the jobs they arrive with, answered with what the site actually has. */
export const FOR_YOU = [
  { who: "New to contact centers", text: "The numbers people will ask you about, explained where you first meet them: handle time, occupancy, first contact resolution, shrinkage. The tools show how each one moves the others, so you learn how the operation works as well as what it calls things." },
  { who: "Running operations and workforce", text: "Staffing, occupancy, shrinkage, adherence and forecast accuracy on published methods. When you ask for another agent or a schedule change, the case rests on arithmetic your leadership can check line by line." },
  { who: "Leadership", text: "Cost, service and risk in one view before you commit budget, with a grade on every result that tells you how far you can rely on it and what would make it firmer." },
  { who: "Strategy and transformation", text: "Readiness assessments, a renewal gate and a business case that keeps freed time apart from real savings, so a plan is built on what will actually change and who has to change it." },
  { who: "IT, platforms and architecture", text: "Vendor research finding by finding: what a platform does, where it breaks, what it takes to implement and who owns the complexity after go-live, with the public source behind each point." },
  { who: "Security, risk and compliance", text: "Contract terms read clause by clause, including how an AI vendor may use your data, security and residency, and the rules each industry answers to, each with its source." },
  { who: "Finance and procurement", text: "Total cost, license gaps and business cases where every figure is sourced, marked as an assumption, or yours, and the report says which. Built to hold up when someone asks where a number came from." },
  { who: "Consultants and advisors", text: "Methods anyone can read, reports you can hand to a client, and links that reopen a scenario exactly as you left it." },
  { who: "Vendors and partners", text: "A fair hearing. Anyone can report an error with a public source, every accepted correction is shown on the vendor's page, and no vendor pays to appear, to move or to preview research." },
];

/* What a reader can use, each with the count its registry holds. */
export const OFFER = [
  { n: TOOL_COUNT, title: "diagnostics", text: `Calculators, assessments and procurement tools. Each has a published method (${METHOD_COUNT} in all) and a report you can download with no sign-in.`, href: "/tools", cta: "See the diagnostics" },
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
  "The numbers you enter stay in your browser tab unless you send them to us for a review or share a scenario link, which carries them in its address.",
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

        <Section id="why" title="Why we built this">
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 760 }}>
            {WHY.map((p, i) => <p key={i} style={{ ...K.body, fontSize: 17, lineHeight: "29px", color: i === WHY.length - 1 ? HOUSE.mist : HOUSE.body, fontWeight: i === WHY.length - 1 ? 600 : 400 }}>{p}</p>)}
          </div>
        </Section>

        <Section id="for-you" title="What it offers you">
          <p style={K.body}>Whatever your role and however long you have been doing it, you should find something here that replaces guesswork with a number you can check.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: 14 }}>
            {FOR_YOU.map((f) => (
              <div key={f.who} style={{ ...K.panel, display: "flex", flexDirection: "column", gap: 6 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: HOUSE.mist }}>{f.who}</h3>
                <p style={K.body}>{f.text}</p>
              </div>
            ))}
          </div>
        </Section>

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
