import { useEffect } from "react";
import { HOUSE, PILLARS, LINE, alpha } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";

/* Where the money goes in a cloud contact center migration (TB's essay, rewritten 13 Oct 2026 to the site's standards:
   TB's voice, facts only, every figure linked to the publisher's own page and dated; no career counts or practice
   figures the page cannot show). Figures and sources live in SOURCES; the originality record is in
   src/lib/claims/originality.js. */

const NAVY = HOUSE.mist; const ELECTRIC = PILLARS.research.onDark; const LIGHT = PILLARS.research.onDark; const WARM = HOUSE.navy; const SLATE = HOUSE.body; const MUTED = HOUSE.muted; const BORDER = alpha(HOUSE.mist, LINE.hair);
const NARROW = { maxWidth: 720, margin: "0 auto", padding: "0 28px" };

export const UPDATED = "13 October 2026";

/* Every figure on the page, as its publisher states it, read on the publisher's own page on the date given. */
export const SOURCES = {
  forrester: {
    publisher: "Forrester Consulting, commissioned by SuccessKPI",
    title: "The Frustrating Journey to Cloud Contact Center Success",
    year: 2023,
    url: "https://successkpi.com/cloud-success",
    checked: "2026-10-13",
    shows: "40% report having limited success with their CCaaS migration efforts",
    quote: true,
    note: "Commissioned by a contact center analytics vendor.",
  },
  puzzel: {
    publisher: "Puzzel",
    title: "State of Contact Centres 2026",
    year: 2026,
    url: "https://www.puzzel.com/hubfs/State%20of%20Contact%20Centres%202026%20-%20Report.pdf",
    checked: "2026-10-13",
    shows: "Survey by OnePoll of 1,505 contact centre professionals in the UK, the Netherlands, Sweden, Norway and Denmark: contact centres rely on 3.9 platforms on average; 3% have a single, unified platform; 50% say multiple vendors raise maintenance and support costs; 44% name integration complexity.",
    note: "Published by a contact center platform vendor; European respondents.",
  },
};

const link = { color: ELECTRIC, fontWeight: 600 };
const Cite = ({ id, children }) => <a href={SOURCES[id].url} target="_blank" rel="noopener noreferrer" style={link}>{children}</a>;
const P = ({ children }) => <p style={{ fontSize: 16.5, color: SLATE, lineHeight: 1.85, margin: "0 0 20px" }}>{children}</p>;
const H2 = ({ children }) => <h2 style={{ fontFamily: FONT, fontSize: 26, fontWeight: 400, color: NAVY, lineHeight: 1.25, margin: "40px 0 16px" }}>{children}</h2>;
const Callout = ({ children }) => <div style={{ background: WARM, borderLeft: `3px solid ${ELECTRIC}`, padding: "20px 24px", margin: "28px 0", borderRadius: "0 8px 8px 0" }}><p style={{ fontSize: 14, color: SLATE, lineHeight: 1.7, margin: 0 }}>{children}</p></div>;
const Stat = ({ n, label, id }) => (
  <div style={{ textAlign: "center", padding: "20px 16px" }}>
    <div style={{ fontFamily: FONT, fontSize: 32, color: ELECTRIC }}>{n}</div>
    <div style={{ fontSize: 12, color: MUTED, marginTop: 4, lineHeight: 1.5 }}>{label} <Cite id={id}>({SOURCES[id].publisher.split(",")[0]}, {SOURCES[id].year})</Cite></div>
  </div>
);

export default function ArticleCCaaSCosts() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div>
      <section style={{ background: HOUSE.navy, padding: "140px 28px 60px" }}>
        <div style={NARROW}>
          <nav aria-label="Breadcrumb" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <a href="/" style={{ color: HOUSE.body, fontSize: 13 }}>Home</a><span style={{ color: HOUSE.body, fontSize: 13 }}>/</span>
            <a href="/research" style={{ color: HOUSE.body, fontSize: 13 }}>Research</a><span style={{ color: HOUSE.body, fontSize: 13 }}>/</span>
            <span style={{ color: LIGHT, fontSize: 13, fontWeight: 600 }}>Migration costs</span>
          </nav>
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase", padding: "3px 0" }}>Analysis</span>
            <span style={{ fontSize: 11, color: HOUSE.body, padding: "3px 0" }}>Updated {UPDATED}</span>
          </div>
          <h1 style={{ fontFamily: FONT, fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 400, color: HOUSE.mist, lineHeight: 1.15, margin: "0 0 20px" }}>
            Where the money goes in a cloud contact center migration
          </h1>
          <p style={{ fontSize: 16, color: HOUSE.body, lineHeight: 1.7 }}>
            The business case for moving a contact center to the cloud usually compares two price lists. The bill covers more than that. Here is what the quote tends to leave out, what the published research shows, and how to price each cost before you sign.
          </p>
        </div>
      </section>

      <section style={{ background: HOUSE.ink, padding: "56px 28px 80px" }}>
        <div style={NARROW}>
          <P>
            I am for cloud contact centers. I have worked on moves from on-premises systems to cloud platforms, and I would make the move again. The reasons are real: vendors are retiring their on-premises products, the people who know how to run them are harder to find, and most new AI features reach cloud platforms first. My argument is narrower. The business case that gets a migration approved often leaves out costs the organization will pay anyway.
          </P>

          <H2>The comparison that gets approved</H2>
          <P>
            The usual business case puts today's on-premises costs beside the new platform's price per seat. Servers, data center space and the team that kept the old system running come off one side. The subscription goes on the other. The gap between them is labelled savings. That slide compares two price lists. What the organization will pay is the new price list plus everything it takes to make the new platform do what the old one did.
          </P>

          <H2>What the quote tends to leave out</H2>
          <P>
            <strong>Integration.</strong> Every system the contact center touches has to be reconnected, tested and then maintained: the CRM, workforce management, quality management, the knowledge base, identity checks, payments, recording and reporting. Nobody can price that work well until each connection is on a list with an owner. It is also where complexity piles up. In Puzzel's 2026 survey of contact centre professionals in the UK, the Netherlands and the Nordics, 44% named integration complexity as a problem of running several technology vendors <Cite id="puzzel">(Puzzel, 2026)</Cite>.
          </P>
          <P>
            <strong>Add-on modules.</strong> Cloud platforms are sold in modules. The seat price buys a base. Recording, speech analytics, quality management, workforce management, outbound dialing and AI features may each carry a separate price, depending on the vendor and the tier. Capabilities the old system included in one licence can each become a line of their own.
          </P>
          <P>
            <strong>Running both systems.</strong> Until cutover is complete, the old platform and the new one are both paid for. Each month the project runs past its plan adds a month of paying for both.
          </P>
          <P>
            <strong>Training and the productivity dip.</strong> Agents, supervisors, quality analysts and planners have years of habits, reports and workarounds built around the old system. Rebuilding them takes time, and output falls while people learn.
          </P>
          <P>
            <strong>Internal labor.</strong> The people running the migration usually keep their day jobs too. Their time is a cost even when no invoice arrives for it.
          </P>
          <P>
            Nobody has to mislead anyone for this to happen. These costs land on different budgets at different times, and the business case usually sees only the first of them.
          </P>

          <H2>What the published research shows</H2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 1, background: BORDER, borderRadius: 10, overflow: "hidden", margin: "24px 0" }}>
            <div style={{ background: HOUSE.ink }}><Stat n="40%" id="forrester" label="of contact center decision makers report limited success with their CCaaS migration efforts" /></div>
            <div style={{ background: HOUSE.ink }}><Stat n="3.9" id="puzzel" label="platforms the average contact centre relies on" /></div>
            <div style={{ background: HOUSE.ink }}><Stat n="3%" id="puzzel" label="of contact centres have a single, unified platform" /></div>
          </div>
          <P>
            A Forrester Consulting study commissioned by SuccessKPI, which sells contact center analytics, found that 40% of contact center decision makers reported limited success with their CCaaS migration efforts <Cite id="forrester">(Forrester Consulting for SuccessKPI, 2023)</Cite>. A vendor paid for the study, so I read it as one data point. It is consistent with what buyers describe.
          </P>
          <P>
            Puzzel's 2026 survey of 1,505 contact centre professionals found that contact centres rely on 3.9 platforms on average and that only 3% run on a single, unified platform. Half of the leaders surveyed said that using several vendors raises maintenance and support costs <Cite id="puzzel">(Puzzel, 2026)</Cite>. Puzzel sells a contact center platform and its respondents are in Europe. Even so, the finding is plain: a migration rarely ends with one system.
          </P>

          <H2>Why it keeps happening</H2>
          <P>
            Each party to a migration is measured on something other than the total cost. A vendor's sales team is paid on contract value. A partner billing by the hour earns more when the project runs long. The internal sponsor needs the project to read as a success. By the time the full cost is visible, the people who approved the business case have often moved on. None of that requires bad faith. It does mean nobody in the room is paid to raise the full cost, so the buyer has to.
          </P>

          <H2>How to price it before you sign</H2>
          <P>
            <strong>List every integration.</strong> Every system the contact center reads from or writes to, who owns it, and what it costs to rebuild the connection and keep it running. Price each one before the contract is signed.
          </P>
          <P>
            <strong>Build your own total cost.</strong> Platform, integration, internal labor, training time, the months of running both systems, and every module you expect to use. The <a href="/tools/tco-calculator" style={link}>TCO Calculator</a> does the arithmetic with your numbers and shows where each figure comes from.
          </P>
          <P>
            <strong>Get every module priced in the first contract.</strong> Recording, analytics, quality, workforce management and AI features: a written price for each module you expect to use, with protection on price at renewal. <a href="/tools/license-gap" style={link}>License Gap</a> shows what a bundle leaves out, and <a href="/tools/contract-risk" style={link}>Contract Risk</a> checks the clauses that decide what you pay later.
          </P>
          <P>
            <strong>Plan training as a program.</strong> Cover the new platform, the new workflows and the new reports, and budget for the dip in output while people learn.
          </P>
          <P>
            <strong>Keep leverage after go-live.</strong> Write the performance you were promised into the contract, with remedies that apply if the platform misses it.
          </P>

          <Callout>
            <strong>If you are partway through a migration:</strong> what has been spent is spent. What has not been spent can still be negotiated: the integration scope, the training time, and module pricing before renewal.
          </Callout>

          <H2>Still worth doing</H2>
          <P>
            I would still move off an aging on-premises platform. The case for moving is strong. The case for stating the full cost is stronger, because an understated business case costs more than money. It makes finance more skeptical of the next request, including the good ones. Build the business case on the whole cost, and the migration can be judged on what it delivers.
          </P>

          <div style={{ width: 60, height: 2, background: ELECTRIC, margin: "40px 0", borderRadius: 1 }} />

          <section aria-labelledby="sources" style={{ background: WARM, border: `1px solid ${BORDER}`, borderRadius: 12, padding: "28px 24px", marginTop: 32 }}>
            <h2 id="sources" style={{ fontSize: 11, fontWeight: 700, color: ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", margin: "0 0 12px" }}>Sources</h2>
            <ol style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.values(SOURCES).map((s) => (
                <li key={s.url} style={{ overflowWrap: "anywhere" }}>
                  {s.publisher}, <a href={s.url} target="_blank" rel="noopener noreferrer" style={{ ...link, fontWeight: 500 }}>{s.title}</a> ({s.year}). {s.quote ? <>In the publisher's words: &ldquo;{s.shows}&rdquo;.</> : s.shows} {s.note} Read on the publisher's page on {s.checked}.
                </li>
              ))}
            </ol>
          </section>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 32 }}>
            <a href="/tools/tco-calculator" style={{ background: HOUSE.action, color: HOUSE.paper, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Build your total cost</a>
            <a href="/vendors/ccaas" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Browse contact center platforms (CCaaS) by job</a>
            <a href="/tools/contract-risk" style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8 }}>Check the contract</a>
          </div>
        </div>
      </section>
    </div>
  );
}
