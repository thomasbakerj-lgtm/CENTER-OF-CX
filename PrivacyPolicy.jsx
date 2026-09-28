// PrivacyPolicy.jsx
//
// The privacy policy, rewritten for accuracy (TB, 27 Sep 2026): it names every service the site uses and every form
// that collects personal information, matching the code (formspree endpoints, track.js, toolData.js, vercel.json).
// privacy.test.mjs checks that every form endpoint and every allowed third-party host in the site's security policy is
// named here, so a new service cannot ship without this page saying so. Tokens only.
import { useEffect } from "react";
import { HOUSE, PILLARS } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";

const LINK = PILLARS.research.onDark;
const WRAP = { maxWidth: 760, margin: "0 auto", padding: "0 20px", boxSizing: "border-box" };

const S = ({ children, id }) => <h2 id={id} style={{ fontFamily: FONT, fontSize: 20, fontWeight: 600, color: HOUSE.mist, margin: "36px 0 12px", lineHeight: 1.3 }}>{children}</h2>;
const P = ({ children }) => <p style={{ fontSize: 15, color: HOUSE.body, lineHeight: 1.7, margin: "0 0 14px" }}>{children}</p>;
const L = ({ items }) => <ul style={{ margin: "0 0 14px", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>{items.map((x, i) => <li key={i} style={{ fontSize: 15, color: HOUSE.body, lineHeight: 1.65 }}>{x}</li>)}</ul>;
const A = ({ href, children }) => <a href={href} style={{ color: LINK, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>{children}</a>;
const B = ({ children }) => <strong style={{ color: HOUSE.mist, fontWeight: 600 }}>{children}</strong>;

export const PRIVACY_UPDATED = "27 September 2026";

/* Every form that sends personal information, as the policy names it. privacy.test.mjs holds this list to the code. */
export const FORMS = [
  { what: "Contact, consultant and vendor introduction requests", fields: "name, work email, company, role, the topic, your message, how you found us and the vendor you asked about", endpoint: "xvzvdnry" },
  { what: "Contributor proposals", fields: "name, email, role, organisation, any commercial tie to a vendor, a working title, the proposal and an optional link to a draft", endpoint: "xvzvdnry" },
  { what: "Research correction reports", fields: "the statement you question, what your source shows, its public link, your email and whether you represent the vendor", endpoint: "xvzvdnry" },
  { what: "Report copies and review requests from a tool", fields: "your email and, as you choose, your name, company and role, and the tool's inputs and results you choose to send", endpoint: "maqlvwne" },
  { what: "Industry stack framework reviews", fields: "your email, name and company, and the stack profile you marked", endpoint: "maqlvwne" },
  { what: "Buyer guide downloads", fields: "name, job title and email", endpoint: "mgorkboe, myklwvjy, xojydbwe" },
  { what: "Vendor reviews you submit on a profile", fields: "your name, email, role, company size, tenure with the vendor and your review", endpoint: "xjgplvkz" },
  { what: "Newsletter sign-ups", fields: "email address", endpoint: "xnjolywk" },
  { what: "Ideas you send from the Research and perspectives pages", fields: "your idea and, if you choose, your role and email", endpoint: "xvzvdnry" },
];

export default function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh", background: HOUSE.ink, color: HOUSE.mist }}>
      <section style={{ background: HOUSE.navy, padding: "88px 0 28px" }}>
        <div style={WRAP}>
          <h1 style={{ fontFamily: FONT, fontSize: 34, fontWeight: 700, color: HOUSE.mist, margin: "0 0 6px" }}>Privacy Policy</h1>
          <p style={{ fontSize: 14, color: HOUSE.body, margin: 0 }}>Last updated: {PRIVACY_UPDATED}</p>
        </div>
      </section>

      <section style={{ padding: "24px 0 72px" }}>
        <div style={WRAP}>
          <P>The Center of CX ("we", "us", "our") operates contactcentercx.com (the "Site"). This policy explains what information we collect, when and why we collect it, who processes it for us, how long we keep it and the choices you have. By using the Site you acknowledge this policy.</P>

          <S id="summary">The short version</S>
          <L items={[
            <>Our tools run in your browser. You can use them without an account, and <B>most of the Site never asks for your email</B>.</>,
            <>Your tool inputs stay in your browser unless you choose to send them, for example with a review request.</>,
            <>When you ask us for something, such as a guide, a report copy, a review, an introduction or a consultation, we may require a valid email address and other contact details to fulfil it.</>,
            <>We measure how the Site is used with privacy-minded analytics that never receive what you type into a tool.</>,
            <>We do not sell your personal information, and no vendor pays us to see it.</>,
          ]} />

          <S id="collect">Information we collect</S>
          <P><B>When you use a tool.</B> Calculators, assessments and frameworks run in your browser. The numbers and answers you enter are not sent to us. To carry your results from one tool to the next during a visit, the Site keeps them in your browser's session storage, which clears when you close the tab. A scenario link you create holds your inputs in the link itself; it reaches anyone only if you share it. A logo you add to a report is processed in your browser and is not uploaded.</P>
          <P><B>When you ask us for something.</B> Most tools and pages do not require an email address. For specific purposes that you start, such as downloading a guide or a report, reading gated written content, requesting a report copy or a consultant review, asking for a vendor introduction or a consultation, reporting a research error, submitting a vendor review or subscribing to our newsletter, we may ask for, and may require before we fulfil the request, a valid email address and other contact details relevant to that purpose, such as your name, job title, company, role and, where the request calls for it, a telephone number. You may decline; if you do, we may not be able to complete that request. Today these forms collect:</P>
          <L items={FORMS.map((f) => <><B>{f.what}:</B> {f.fields}.</>)} />
          <P><B>Automatically, when you visit.</B> Like most websites, our host records standard technical information when your browser requests a page, including your IP address, browser type and the page requested. We also use two analytics services:</P>
          <L items={[
            <><B>Vercel Web Analytics</B> counts page views in aggregate. It does not use cookies.</>,
            <><B>PostHog</B> receives named events from a fixed list, such as which tool you opened or completed and the confidence grade it reached, together with the page, the site that referred you (its host name only) and any campaign tags in the link. It never receives the values you enter, your email or your company, with one exception, stated on that tool's page: when you open the Roadmap Builder's summary, it receives the status you set for each of the builder's 18 fixed milestones (not started, in progress, at risk, blocked or complete), with no notes or other text. To count visits, the Site stores a random identifier in your browser's local storage and a visit identifier in session storage; neither contains your name. PostHog may use your IP address to estimate an approximate location.</>,
          ]} />
          <P><B>Cookies and browser storage.</B> The Site does not set advertising or tracking cookies. It uses your browser's local and session storage for the purposes above, and to remember contact details you typed into a form so you need not type them again during the same visit. You can clear this storage at any time in your browser settings.</P>

          <S id="use">How we use your information</S>
          <L items={[
            "To fulfil what you asked for: send a guide or report, reply to a review or correction, arrange an introduction or a consultation.",
            "To send our newsletter if you subscribed, and occasional related updates about resources connected to what you requested. Every email lets you unsubscribe.",
            "To understand, in aggregate, which pages and tools are used and where visitors come from, so we can improve them.",
            "To keep the Site secure, prevent abuse and meet legal obligations.",
          ]} />

          <S id="share">Who receives your information</S>
          <P>We do not sell, rent or trade your personal information, and we do not share it for cross-context behavioural advertising. We share it only as follows:</P>
          <L items={[
            <><B>Service providers</B> that operate the Site for us, under their own privacy terms: Vercel (hosting and web analytics), PostHog (product analytics) and Formspree (form processing and delivery to our inbox). Our typefaces are served from the Site itself, so no font service receives your visit. GitHub hosts our source code and receives no visitor data.</>,
            <><B>A vendor you ask to be introduced to.</B> When you request an introduction, we share the details needed to arrange it with that vendor. No vendor receives your information otherwise.</>,
            <><B>A consultant</B> we connect you with at your request, for that engagement.</>,
            <><B>Where the law requires</B>, or to protect our rights, our users or the public, and to a successor if the Site changes ownership, under this policy.</>,
          ]} />

          <S id="independence">Independence</S>
          <P>No vendor pays to appear on the Site, to be researched or for where it appears. Vendor research is built from public evidence, and a finding changes only through our published <A href="/corrections">correction policy</A>. A request for an introduction never changes a list's order, a research finding or anything else a reader sees.</P>

          <S id="retention">How long we keep it</S>
          <P>Form submissions are kept for as long as we need them to handle your request and follow up, and then deleted on request or when no longer needed. Newsletter subscriptions are kept until you unsubscribe. Analytics events are kept by PostHog and Vercel under their retention settings and are not linked to your name or email.</P>

          <S id="rights">Your choices and rights</S>
          <P>You can ask us to access, correct, export or delete the personal information we hold about you, or to stop sending you email, at any time. Depending on where you live, including the European Union, the United Kingdom and US states such as California, you may have further rights, including the right to object to or restrict processing and to complain to your data protection authority. Where we rely on consent you may withdraw it at any time. We will not discriminate against you for exercising these rights. You can also block analytics with your browser's privacy settings or an extension; the Site keeps working.</P>

          <S id="security">Security and transfers</S>
          <P>The Site is served only over HTTPS under a strict content security policy, and it has no user accounts or passwords to protect. No method of transmission or storage is completely secure, and we cannot guarantee absolute security. Our service providers may process information in the United States and other countries; where the law requires, transfers rely on appropriate safeguards.</P>

          <S id="children">Children</S>
          <P>The Site is intended for business professionals. We do not knowingly collect personal information from anyone under 16. If you believe a child has sent us information, contact us and we will delete it.</P>

          <S id="changes">Changes to this policy</S>
          <P>We may update this policy as the Site changes. The date at the top shows the latest revision; material changes will be noted on the Site.</P>

          <S id="contact">Contact</S>
          <P>Questions or requests about this policy or your information: <A href="mailto:hello@contactcentercx.com">hello@contactcentercx.com</A>, or use the <A href="/contact">contact page</A>.</P>
        </div>
      </section>
    </div>
  );
}
