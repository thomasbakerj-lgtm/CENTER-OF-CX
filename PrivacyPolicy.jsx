// PrivacyPolicy.jsx
//
// The privacy policy, rewritten for accuracy (TB, 27 Sep 2026) and hardened from TB's legal review notes (29 Sep 2026:
// describe practices without promises the code does not prove; IP discarded in PostHog, Google Workspace named, reviews
// not published, the scenario-link warning): it names every service the site uses and every form
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

export const PRIVACY_UPDATED = "29 September 2026";

/* Every form that sends personal information, as the policy names it. privacy.test.mjs holds this list to the code. */
export const FORMS = [
  { what: "Contact, consultant and vendor introduction requests", fields: "name, work email, company, role, the topic, your message, how you found us and the vendor you asked about", endpoint: "xvzvdnry" },
  { what: "Demo requests from Vendor Match", fields: "work email and, if you choose, your name, company, what the demo should show and your answers in the tool", endpoint: "xvzvdnry" },
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
          <P>The Center of CX ("The Center of CX", "we", "us" or "our") is operated by its founder as a sole proprietorship based in the United States. This Privacy Policy explains how we collect, use, disclose and protect personal information when you use contactcentercx.com and pages that link to this policy (the "Site"). It describes our practices; our <A href="/terms">Terms of Use</A> govern your use of the Site.</P>

          <S id="summary">The short version</S>
          <L items={[
            <>Most of the Site can be used without an account and <B>most of the Site never asks for your email</B>.</>,
            <>Our calculators, assessments and frameworks are designed to process the values you enter in your browser. Technical information about using a tool, such as opening or completing it, may still be collected as described below.</>,
            <>When you choose to send us something, such as a request for a report, a review, an introduction or a consultation, we receive what we need to handle that request.</>,
            <>Our analytics are built so that they do not receive what you type into a tool, your email address or your company name, except where this policy or the page says otherwise.</>,
            <>We do not sell personal information, and we do not give it to vendors for their own advertising. When you ask us for an introduction, we share what is needed to make it.</>,
          ]} />

          <S id="browser">Information processed in your browser</S>
          <P>Many tools keep your inputs in your browser. During a visit, some tools use session storage so your results can move between steps or related tools; session storage generally clears when you close the tab. Some features use local storage to remember settings or an analytics identifier between visits. You can clear both in your browser settings. A logo you add to a report is processed in your browser and is not uploaded to us.</P>
          <P><B>Scenario links.</B> A scenario link carries the inputs of a tool in the web address itself. Anyone who receives the link can see what it contains. When a link is opened, its full address is sent to our host like any web address, and the host's request logs may record it; browsers, messaging applications, email systems and security tools that handle the link may keep it too. Do not put confidential information, personal information, credentials, regulated information or sensitive customer data into a scenario you plan to share.</P>

          <S id="send">Information you choose to send us</S>
          <P>Most tools and pages do not require an email address. For specific purposes that you start, such as downloading a guide or a report, requesting a report copy or a review, asking for a vendor introduction, a demo or a consultation, reporting a research error, proposing a contribution, submitting a vendor review or subscribing to our newsletter, we may ask for, and may require before we fulfil the request, a valid email address and other contact details relevant to that purpose, such as your name, job title, company, role and, where the request calls for it, a telephone number. You may decline; if you do, we may not be able to complete that request. Today these forms collect:</P>
          <L items={FORMS.map((f) => <><B>{f.what}:</B> {f.fields}.</>)} />
          <P><B>Vendor reviews.</B> Reviews you submit are not published on the Site today; they are read by us. If we begin publishing reviews, we will say on the form, before you submit, which fields will be public and which are kept only for verification, moderation or contact. Your email address is never published.</P>
          <P><B>Please do not send sensitive information.</B> Do not submit Social Security or other government identification numbers, financial account or payment card details, passwords, medical or health information or other highly sensitive information through our forms or tools, and do not send confidential information or personal information about another person unless you are authorised to share it.</P>

          <S id="visit">Information collected when you visit</S>
          <P>When your browser requests a page, our hosting provider processes standard technical information such as your IP address, browser and device details, the page requested and the time, to operate, secure and troubleshoot the Site. We also use two analytics services:</P>
          <L items={[
            <><B>Vercel Web Analytics</B> counts page views in aggregate, without identifying visitors by name.</>,
            <><B>PostHog</B> receives named events from a fixed list, such as which page or tool was opened or completed and the confidence grade a result reached, together with the page's path, the host name of the site that referred you and any campaign tags in the link. We send these events ourselves, without PostHog's browser library, so there is no automatic recording of clicks, keystrokes or sessions. They are designed never to include the values you enter, your email or your company, with one exception stated on that tool's page: when you open the Roadmap Builder's summary, the event carries the status you set for each of the builder's fixed milestones (not started, in progress, at risk, blocked or complete), with no notes or other text. Each event carries a random browser identifier kept in local storage and a visit identifier kept in session storage; neither contains your name, email or company. PostHog is set to discard IP addresses, so it does not keep yours or estimate a location from it.</>,
          ]} />

          <S id="storage">Cookies and browser storage</S>
          <P>The Site does not serve third-party behavioural advertising. It uses local storage, session storage and similar browser features to run features, carry information through a visit, keep the analytics identifiers described above and remember contact details you typed into a form during the same visit. You can block or clear them in your browser settings; some features may not work without them. Where the law requires a choice before a particular technology is used, we will offer it.</P>

          <S id="use">How we use personal information</S>
          <L items={[
            "To provide what you asked for: a guide, a report, a review, an introduction, a demo, a consultation or a reply.",
            "To operate, secure and improve the Site, understand in aggregate how pages and tools are used, and prevent misuse.",
            "To investigate research corrections, keep our research accurate and handle contributions and reviews.",
            "To comply with the law, establish or defend legal claims and keep appropriate business records.",
            "To send our newsletter if you subscribed. Requesting a guide, report, introduction or other resource does not subscribe you.",
          ]} />

          <S id="email">Email</S>
          <P>We send messages needed to handle a request you started. Newsletter and other marketing emails go only to people who subscribed, and each one includes a way to unsubscribe. When you unsubscribe we keep a record of the address so we can honour your choice, even if we delete your other information.</P>

          <S id="share">Who receives information</S>
          <P>Service providers operate parts of the Site and process information on our behalf under their agreements with us:</P>
          <L items={[
            <><B>Vercel</B> hosts the Site and provides web analytics.</>,
            <><B>PostHog</B> provides product analytics.</>,
            <><B>Formspree</B> receives the forms described above and delivers them to our email.</>,
            <><B>Google Workspace</B> provides our business email, where form submissions and messages arrive.</>,
            <><B>GitHub</B> hosts our source code. Visitor form submissions and tool inputs are not sent to it.</>,
          ]} />
          <P>Our typefaces are served from the Site itself, so no font service receives your visit. We review these services and this policy when our tools change.</P>
          <P><B>Introductions.</B> If you ask us to introduce you to a vendor or to connect you with a consultant or another independent party, we give them the information needed to make that introduction. Once they receive it, they handle it under their own privacy practices and legal responsibilities.</P>
          <P><B>Legal and business reasons.</B> We may disclose information where reasonably necessary to comply with law or valid legal process, to investigate fraud, security incidents or abuse, to protect rights and safety, to establish or defend legal claims, or as part of a merger, acquisition, financing, reorganisation or sale of all or part of the Site, subject to applicable law.</P>

          <S id="nosale">No sale of personal information</S>
          <P>We do not sell, rent or trade your personal information, and we do not disclose it to vendors for their own cross-context behavioural advertising. A vendor does not receive your contact information because it appears in our research or on the Site; it receives only what you ask us to pass on when you request an introduction or a demo. If this changes, we will update this policy and give any notice or choice the law requires before the new practice applies.</P>

          <S id="independence">Independence</S>
          <P>How vendors appear in our research is separate from how we handle personal information. No vendor pays to appear, to be researched or for where it appears. Vendor research follows our published method, and a finding changes only through our <A href="/corrections">correction policy</A>. A request for an introduction never changes a list, an order, a finding or anything else a reader sees, and no commercial relationship gives a vendor access to visitor information except as this policy describes or as you authorise.</P>

          <S id="retention">How long we keep it</S>
          <L items={[
            "Requests you send are kept while we handle them and for a period afterward long enough to record the exchange and deal with follow-up.",
            "Newsletter subscriptions are kept while you are subscribed; after you unsubscribe we keep only the record needed to honour it.",
            "Research corrections, contributions and reviews may be kept while the related material is published, and afterward where reasonably needed for editorial, research, audit or dispute records.",
            "Analytics and hosting data are kept under the retention settings of the provider concerned and our operational needs.",
            "When information is no longer reasonably needed, we delete it, anonymise it or otherwise dispose of it, consistent with our systems, backups and legal obligations.",
          ]} />

          <S id="rights">Your privacy rights and choices</S>
          <P>Depending on where you live and whether a privacy law applies to us, you may have the right to access or receive a copy of your personal information, correct it, delete it, learn how it is used or disclosed, object to or restrict certain processing, withdraw consent where we rely on it, and opt out of marketing. Some rights have exceptions: for example, we may need to keep information to comply with law, keep the Site secure, defend legal claims or honour an unsubscribe request. Where the law gives you a right to appeal our decision or to use an authorised agent, we will provide the process. We will not discriminate against you for exercising a privacy right.</P>
          <P>To make a request, email <A href="mailto:hello@contactcentercx.com">hello@contactcentercx.com</A>. We may need to confirm your identity or authority before completing it.</P>

          <S id="eea">European Economic Area and United Kingdom</S>
          <P>Where the GDPR, UK GDPR or a similar law applies, we process information on these bases: to take steps you request or provide something you asked for; for our legitimate interests, such as operating and securing the Site, answering business enquiries, improving our services, keeping our research accurate, preventing misuse and understanding how the Site is used, where those interests are not overridden by your rights; with your consent, which you may withdraw at any time without affecting earlier processing; and to comply with a legal obligation or establish, exercise or defend legal claims. You may object to processing based on legitimate interests and complain to the data protection authority where you live.</P>

          <S id="transfers">International processing</S>
          <P>We and some of our service providers are located in, or process information in, the United States, and providers may process it in other countries where they operate. Where the law requires safeguards for international transfers, we rely on recognised transfer mechanisms or other safeguards available through our provider relationships.</P>

          <S id="security">Security</S>
          <P>We use administrative, technical and organisational measures designed to protect personal information, appropriate to its nature and to our operations, including encrypted connections, restricted access, data minimisation and the security measures of our service providers. No transmission, browser, service or storage system is completely secure, so we cannot guarantee that information will never be accessed, disclosed, altered, lost or destroyed without authorisation. If a security incident occurs, we will investigate, respond and give the notifications the law requires.</P>

          <S id="children">Children</S>
          <P>The Site is for business and professional audiences and is not directed to children. We do not knowingly collect personal information from anyone under 16. If you believe a child has sent us personal information, contact us and we will review and address it.</P>

          <S id="links">Other websites</S>
          <P>The Site links to websites run by vendors, research sources and other third parties. Their privacy and security practices are theirs; review their privacy information before giving them personal information.</P>

          <S id="changes">Changes to this policy</S>
          <P>We may update this policy as the Site, our tools or the law change. The date at the top shows the latest revision. Before a material change to how we use or disclose information we already hold takes effect, we will give any notice or choice the law requires.</P>

          <S id="contact">Contact</S>
          <P>Questions, privacy requests or concerns: <A href="mailto:hello@contactcentercx.com">hello@contactcentercx.com</A>, or use the <A href="/contact">contact page</A>. The Center of CX, contactcentercx.com.</P>
        </div>
      </section>
    </div>
  );
}
