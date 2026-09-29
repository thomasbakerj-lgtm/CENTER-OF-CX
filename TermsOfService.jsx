// TermsOfService.jsx
//
// The Terms of Use (TB, 29 Sep 2026, from TB's legal review notes: general information from LegalZoom, not legal advice).
// Terms do the liability work the Privacy Policy should not: research and ratings, calculators and assessments, no
// guarantee of outcomes, vendor information and introductions, submissions, intellectual property, acceptable use,
// warranties and liability. The operator is named as the Privacy Policy names it (a sole proprietorship; no entity
// formed yet). Governing law is Arizona, where the operator is based (TB, 29 Sep 2026; counsel to confirm), and arbitration is left out
// on purpose (TB's notes). Separate paid engagements take their own written agreement. Content is data (TERMS_SECTIONS) so
// terms.page checks in privacy.test.mjs read what renders. Tokens only.
import { useEffect } from "react";
import { HOUSE, PILLARS } from "./src/lib/tokens.js";
import { FONT } from "./src/lib/type.js";

const LINK = PILLARS.research.onDark;
const WRAP = { maxWidth: 760, margin: "0 auto", padding: "0 20px", boxSizing: "border-box" };

export const TERMS_UPDATED = "29 September 2026";

/* Each section: a heading and blocks. A string is a paragraph; { list: [...] } is a numbered list; { caps: "..." } is a
   paragraph set in capitals, as disclaimers conventionally are. */
export const TERMS_SECTIONS = [
  { h: null, blocks: [
    "These Terms of Use (\"Terms\") govern your access to and use of contactcentercx.com and the tools, calculators, assessments, research, reports, vendor profiles, frameworks, content and other features made available through it (the \"Site\").",
    "The Site is operated by its founder as a sole proprietorship based in Arizona, United States, doing business as The Center of CX (\"The Center of CX\", \"we\", \"us\" or \"our\").",
    "By accessing or using the Site, you agree to these Terms. If you do not agree, do not use the Site.",
    "Certain services, advisory engagements, paid products, research arrangements or other offerings may be governed by separate written terms. If separate terms conflict with these Terms, the separate terms control for that specific service.",
  ] },
  { h: "1. What The Center of CX provides", blocks: [
    "The Center of CX provides research, educational resources, decision-support tools, industry information, vendor intelligence, calculators, assessments, frameworks and related content for contact center, customer experience and technology professionals.",
    "The Site is intended to help users ask better questions, evaluate alternatives and make more informed decisions. The Site does not make decisions for you.",
    "You remain responsible for evaluating information, verifying assumptions, performing appropriate due diligence and determining whether any technology, vendor, strategy, investment or course of action is appropriate for your organization.",
  ] },
  { h: "2. Informational purposes only", blocks: [
    "Content on the Site is provided for general informational, educational and decision-support purposes.",
    "Unless we expressly enter into a separate written professional-services agreement with you, information made available through the Site does not constitute legal, financial, accounting, tax, cybersecurity, compliance, insurance, investment or procurement advice.",
    "Use of the Site does not create an attorney-client, accountant-client, fiduciary, broker, agency, consultant-client or other professional relationship.",
    "You should consult appropriately qualified professionals when a decision requires professional advice or involves material legal, financial, regulatory, security, compliance or operational risk.",
  ] },
  { h: "3. Research, ratings and analysis", blocks: [
    "The Site may publish vendor research, market analysis, category definitions, comparisons, classifications, observations, benchmarks or other assessments, and may in future publish scores, ratings or rankings. Earlier Phase 1 vendor scores and tiers have been withdrawn while current research is published; the Site shows no vendor score or rank today.",
    "These materials reflect our methodology, available evidence and editorial judgment at the time they are prepared. They should not be interpreted as guarantees, certifications or statements that a particular vendor, technology or strategy is appropriate for every organization.",
    "Research may rely on public information, vendor materials, product documentation, third-party sources, interviews, demonstrations, submitted information and other evidence that we believe to be relevant. We attempt to use credible information, but we do not guarantee that every source is complete, current, error-free or independently verified.",
    "Markets, products, pricing, leadership, ownership, features, security capabilities, certifications, service availability and other facts can change after publication. An assessment may also change as our methodology, available evidence or market conditions change.",
    "We may correct, update, expand, reclassify or remove research at any time. We are not obligated to update any particular piece of content on a specific schedule. The existence of a correction process does not mean that every disagreement will result in a change.",
  ] },
  { h: "4. Calculators, assessments and decision-support tools", blocks: [
    "The Site may provide calculators, assessments, benchmarking tools, vendor-selection tools, cost models, maturity assessments, business-case tools, roadmap builders and other interactive resources.",
    "Outputs from these tools are estimates and decision-support information only. Results depend on the information you provide and the assumptions, formulas, methodologies and data used by the tool. Actual results may differ materially.",
    "A tool may not account for every factor relevant to a real-world decision, including implementation costs, integration requirements, contract terms, taxes, labor costs, staffing changes, licensing structures, usage patterns, migration expenses, security requirements, regulatory obligations, vendor negotiations, geographic differences or future business conditions.",
    "You are responsible for reviewing the assumptions underlying a result and determining whether they apply to your circumstances. You should not make a material business, financial, employment, security, technology or procurement decision solely because of an output produced by the Site.",
  ] },
  { h: "5. No guarantee of outcomes", blocks: [
    "We do not guarantee that use of the Site, its research, tools, frameworks or vendor information will produce any particular business result.",
    "Without limitation, we do not guarantee cost savings, increased revenue, improved customer experience, reduced risk, vendor performance, implementation success, return on investment, employee productivity, compliance, security outcomes or achievement of any benchmark.",
    "Past performance, benchmarks, case studies, examples and modeled results do not guarantee future results. Your organization's results depend on factors outside our control.",
  ] },
  { h: "6. Vendor information", blocks: [
    "The Site may contain information about technology vendors, service providers, consultants and other companies. References to a vendor do not constitute a guarantee, certification or warranty of that vendor, its products or its services.",
    "Vendor capabilities, availability, pricing, contract terms, security posture, regulatory status, integrations, service levels and product functionality should be verified directly with the vendor before making a purchasing decision.",
    "Vendor statements and materials may contain claims made by the vendor. The fact that we reference or summarize those statements does not necessarily mean that we independently verified each claim.",
    "You are responsible for conducting appropriate technical, commercial, security, legal and financial due diligence before entering into a vendor relationship.",
  ] },
  { h: "7. Vendor introductions", blocks: [
    "The Site may allow you to request an introduction or a demo with a vendor, consultant or other provider. An introduction does not constitute a recommendation, endorsement or guarantee.",
    "Unless a separate written agreement expressly provides otherwise, The Center of CX is not a party to any contract entered into between you and a third party following an introduction. We are not responsible for the third party's products, services, pricing, negotiations, representations, performance, security practices, contractual obligations or conduct. You are responsible for evaluating and negotiating any resulting relationship.",
    "The Center of CX may have commercial relationships with companies discussed on the Site. Where disclosure is required by law or our published policies, we will provide the applicable disclosure. Commercial relationships do not by themselves affect research placement, findings or outcomes.",
  ] },
  { h: "8. Independence of research", blocks: [
    "No vendor is entitled to a particular classification, finding, score, ranking or editorial outcome.",
    "Submitting information, requesting a correction, participating in research, engaging with The Center of CX commercially or receiving an introduction does not give a vendor control over our research methodology or editorial conclusions.",
    "We may consider additional evidence supplied by a vendor or another party but retain editorial control over whether and how that information affects published research, under our correction policy.",
  ] },
  { h: "9. Third-party websites and services", blocks: [
    "The Site may link to vendor websites, research sources, government resources, publications and other third-party websites or services. Links are provided for convenience, research or reference.",
    "We do not control third-party websites and are not responsible for their content, availability, security, privacy practices, accuracy, products or services. A link does not necessarily mean that we endorse the third party. Your use of a third-party website or service is governed by that third party's terms and policies.",
  ] },
  { h: "10. User submissions", blocks: [
    "The Site may allow you to submit reviews, corrections, comments, ideas, proposals, research materials, messages, feedback or other content (\"Submitted Content\"). You retain ownership of any intellectual property rights you hold in your Submitted Content.",
    "By submitting content to the Site, you grant The Center of CX a non-exclusive, worldwide, royalty-free license to host, store, reproduce, format, edit for clarity or moderation, publish, display, distribute and otherwise use the Submitted Content as reasonably necessary to operate, promote and improve the Site and its research. This license includes the right to preserve Submitted Content for research integrity, moderation, audit and recordkeeping purposes. Where a separate contributor, licensing or commercial agreement applies, that agreement controls.",
    "You represent that:",
    { list: [
      "you have the right to submit the content;",
      "the content does not violate another person's intellectual property, privacy, confidentiality or other rights;",
      "the content is not knowingly false, deceptive, defamatory or unlawful;",
      "you will not submit confidential or proprietary information unless you are authorized to do so; and",
      "any material commercial relationship relevant to the submission will be disclosed when requested.",
    ] },
    "Submitting content does not guarantee that we will publish it. We may review, verify, reject, edit, moderate, remove or decline to publish Submitted Content at our discretion. We are not obligated to compensate you for Submitted Content unless we have separately agreed to do so in writing.",
  ] },
  { h: "11. Vendor reviews", blocks: [
    "Vendor reviews are intended to provide useful professional experience and perspective. A review represents the submitter's views, not necessarily those of The Center of CX. We may take reasonable steps to verify, moderate, edit or remove reviews but do not guarantee that every statement in a review has been independently verified.",
    "You may not submit a review that is fabricated, submitted on behalf of another person without authorization, generated to manipulate a vendor's reputation, or submitted in exchange for undisclosed compensation or other consideration. We may remove reviews that we reasonably believe violate these Terms or undermine the integrity of the research platform.",
  ] },
  { h: "12. Intellectual property", blocks: [
    "Unless otherwise identified, the Site and its original content, design, research, methodologies, frameworks, taxonomies, databases, graphics, software, tools, calculations, reports, text, logos and other materials are owned by or licensed to The Center of CX and are protected by applicable intellectual-property laws. Published methods describe how our tools work; publishing them does not license their reuse beyond what these Terms allow.",
    "The Center of CX name, branding and logos may not be used in a manner that suggests sponsorship, endorsement or affiliation without our written permission.",
    "You may use publicly accessible Site content for your own internal business evaluation and ordinary personal or professional reference. Unless we provide written permission, you may not:",
    { list: [
      "reproduce or republish substantial portions of the Site;",
      "sell, license, sublicense or commercially redistribute Site content;",
      "create a competing research database or commercial dataset using Site content;",
      "systematically extract vendor profiles, research findings or other Site information;",
      "scrape, crawl or use automated systems to collect Site content except for ordinary search-engine indexing performed in accordance with our technical instructions;",
      "remove copyright, trademark or attribution notices;",
      "falsely represent Site content as your own research;",
      "reverse engineer or attempt to extract protected logic, software or methodologies from interactive tools except where applicable law expressly permits it; or",
      "use Site content or datasets to train, fine-tune or materially enhance an artificial-intelligence or machine-learning model without our prior written permission.",
    ] },
    "Limited quotation and linking are permitted where allowed by law, provided the use is not misleading and appropriate attribution is given.",
  ] },
  { h: "13. Acceptable use", blocks: [
    "You may not use the Site to:",
    { list: [
      "violate applicable law or another person's rights;",
      "transmit malware, malicious code or harmful material;",
      "attempt to gain unauthorized access to systems, accounts or data;",
      "interfere with the operation or security of the Site;",
      "probe, scan or test vulnerabilities without written authorization;",
      "impersonate another person or misrepresent your affiliation;",
      "submit fraudulent, fabricated or intentionally misleading information;",
      "harvest personal information from the Site;",
      "circumvent access controls, rate limits or technical restrictions;",
      "use automated systems in violation of the intellectual-property provisions above;",
      "manipulate research, reviews or Site functionality;",
      "use the Site to send spam or unsolicited commercial communications; or",
      "use the Site in a manner that could reasonably damage, disable or materially impair the Site or other users' access to it.",
    ] },
    "We may restrict or block access where we reasonably believe these Terms are being violated or where necessary to protect the Site, our users or our systems.",
  ] },
  { h: "14. Privacy", blocks: [
    "Our collection and use of personal information is described in our Privacy Policy (/privacy). The Privacy Policy is a separate disclosure about our information practices and should be read together with these Terms.",
  ] },
  { h: "15. Availability and changes to the Site", blocks: [
    "We may add, modify, suspend or discontinue Site content, tools, features or services at any time. We do not guarantee that the Site or any particular feature will always be available, uninterrupted, secure or error-free. We may perform maintenance or make technical and editorial changes without advance notice.",
  ] },
  { h: "16. Disclaimer of warranties", blocks: [
    { caps: "To the maximum extent permitted by applicable law, the Site and all content, research, tools, calculators, assessments, reports, vendor information and other materials are provided \"as is\" and \"as available.\"" },
    { caps: "The Center of CX disclaims all warranties, express or implied, including implied warranties of merchantability, fitness for a particular purpose, title, non-infringement, accuracy, completeness and quiet enjoyment." },
    { caps: "We do not warrant that the Site will be error-free, uninterrupted, completely secure or free from harmful components. We do not warrant that information available through the Site will be complete, current or appropriate for your particular circumstances." },
    "Some jurisdictions do not allow certain warranty exclusions, so some exclusions may not apply to you.",
  ] },
  { h: "17. Limitation of liability", blocks: [
    { caps: "To the maximum extent permitted by applicable law, The Center of CX and its owners, officers, directors, employees, contractors, affiliates and agents will not be liable for any indirect, incidental, special, exemplary, consequential or punitive damages arising from or related to your access to or use of the Site. This includes loss of profits, revenue, savings, business opportunities, data, goodwill or business interruption, even if we have been advised that such damages may occur." },
    { caps: "To the maximum extent permitted by law, we are not liable for losses arising from:" },
    { list: [
      "reliance on research, assessments or vendor information;",
      "decisions made using a calculator, assessment, framework or other tool;",
      "vendor selection, negotiation, implementation or performance;",
      "inaccurate, outdated or incomplete third-party information;",
      "Submitted Content or third-party websites;",
      "interruption or unavailability of the Site;",
      "unauthorized access or security incidents outside our reasonable control; or",
      "business decisions made based on Site content.",
    ] },
    { caps: "To the maximum extent permitted by applicable law, our total aggregate liability arising out of or relating to the Site or these Terms will not exceed the greater of (a) $100 or (b) the amount you paid directly to The Center of CX for the specific Site service giving rise to the claim during the 12 months before the event giving rise to liability." },
    "This limitation does not apply to separately contracted professional services where another written agreement establishes different liability terms. Nothing in these Terms excludes liability that cannot legally be excluded or limited.",
  ] },
  { h: "18. Indemnification", blocks: [
    "To the extent permitted by applicable law, you agree to indemnify, defend and hold harmless The Center of CX and its owners, officers, employees, contractors, affiliates and agents from claims, liabilities, damages, losses and reasonable costs arising from:",
    { list: [
      "your material violation of these Terms;",
      "your unlawful or unauthorized use of the Site;",
      "Submitted Content you provide;",
      "your infringement or violation of another person's rights; or",
      "your misuse of Site content, tools or data.",
    ] },
    "This provision does not require you to indemnify us for conduct for which indemnification cannot lawfully be required.",
  ] },
  { h: "19. Business use", blocks: [
    "The Site is primarily designed for business and professional audiences. If you use the Site on behalf of a company or other organization, you represent that you have authority to use the Site on that organization's behalf and, where legally applicable, to bind that organization to these Terms.",
  ] },
  { h: "20. Eligibility", blocks: [
    "You must be at least 18 years old to use the Site. By using the Site, you represent that you meet this requirement.",
  ] },
  { h: "21. Copyright and rights complaints", blocks: [
    "If you believe material on the Site infringes your copyright, trademark or other rights, contact us at hello@contactcentercx.com with enough information to identify the material and the basis for your request. We may request additional information before taking action. Nothing in this section represents that we have adopted any particular statutory safe-harbor procedure unless expressly stated elsewhere.",
  ] },
  { h: "22. Governing law", blocks: [
    "These Terms are governed by the laws of the State of Arizona, without regard to conflict-of-law principles, except where applicable law requires otherwise.",
    "Subject to any mandatory rights available under applicable law, legal proceedings arising from or relating to these Terms or the Site will be brought in the state or federal courts located in Arizona, and you and The Center of CX consent to the jurisdiction of those courts.",
  ] },
  { h: "23. Changes to these Terms", blocks: [
    "We may update these Terms as the Site, our services or applicable requirements change. The \"Last updated\" date identifies the most recent revision. Material changes may also be communicated through the Site or another reasonable method.",
    "Your continued use of the Site after revised Terms become effective constitutes acceptance of the revised Terms to the extent permitted by applicable law. If you do not agree to revised Terms, you should stop using the Site.",
  ] },
  { h: "24. Severability", blocks: [
    "If any provision of these Terms is found unenforceable, the remaining provisions will remain in effect to the maximum extent permitted by law. The unenforceable provision will be interpreted or modified only to the extent necessary to make it enforceable where permitted.",
  ] },
  { h: "25. No waiver", blocks: [
    "Our failure to enforce a provision of these Terms does not waive our right to enforce it later. A waiver is effective only if made expressly in writing by The Center of CX.",
  ] },
  { h: "26. Assignment", blocks: [
    "You may not assign or transfer your rights or obligations under these Terms without our written consent. We may assign these Terms in connection with a merger, acquisition, reorganization, sale of assets or similar business transaction, subject to applicable law.",
  ] },
  { h: "27. Entire agreement", blocks: [
    "These Terms, together with the Privacy Policy and any additional terms expressly applicable to a particular Site feature, constitute the agreement between you and The Center of CX regarding use of the Site. They do not replace a separate written agreement governing consulting, advisory, paid research or other professional services.",
  ] },
  { h: "28. Contact", blocks: [
    "Questions about these Terms: hello@contactcentercx.com, or use the contact page (/contact). The Center of CX, contactcentercx.com.",
  ] },
];

/* Turn "(/path)" references in the text into links, so the data stays plain text. */
function withLinks(text) {
  const parts = text.split(/\((\/[a-z-]*)\)/);
  return parts.map((p, i) => (i % 2 ? <span key={i}> (<a href={p} style={{ color: LINK, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>{p === "/privacy" ? "Privacy Policy" : p === "/contact" ? "contact page" : p}</a>)</span> : p));
}

const P = ({ children, caps }) => <p style={{ fontSize: 15, color: HOUSE.body, lineHeight: 1.7, margin: "0 0 14px", textTransform: caps ? "uppercase" : "none", letterSpacing: caps ? "0.01em" : "normal" }}>{children}</p>;

export default function TermsOfService() {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh", background: HOUSE.ink, color: HOUSE.mist }}>
      <section style={{ background: HOUSE.navy, padding: "88px 0 28px" }}>
        <div style={WRAP}>
          <h1 style={{ fontFamily: FONT, fontSize: 34, fontWeight: 700, color: HOUSE.mist, margin: "0 0 6px" }}>Terms of Use</h1>
          <p style={{ fontSize: 14, color: HOUSE.body, margin: 0 }}>Last updated: {TERMS_UPDATED}</p>
        </div>
      </section>
      <section style={{ padding: "24px 0 72px" }}>
        <div style={WRAP}>
          {TERMS_SECTIONS.map((s, i) => (
            <div key={i}>
              {s.h && <h2 id={`s${i}`} style={{ fontFamily: FONT, fontSize: 20, fontWeight: 600, color: HOUSE.mist, margin: "36px 0 12px", lineHeight: 1.3 }}>{s.h}</h2>}
              {s.blocks.map((b, j) => typeof b === "string" ? <P key={j}>{withLinks(b)}</P>
                : b.caps ? <P key={j} caps>{b.caps}</P>
                : <ol key={j} style={{ margin: "0 0 14px", paddingLeft: 24, display: "flex", flexDirection: "column", gap: 6 }}>{b.list.map((x, k) => <li key={k} style={{ fontSize: 15, color: HOUSE.body, lineHeight: 1.65 }}>{x}</li>)}</ol>)}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
