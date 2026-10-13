// src/lib/marketWatch.js
//
// Market Watch v1 (TB, 27 Sep 2026): dated items about the market, each labelled by the source it rests on. Market Watch
// is market news, kept apart from the research: an item never changes a research finding, a profile, a grade, a tool's
// result or Vendor Match (marketwatch.test.mjs proves nothing outside the Market Watch surfaces reads this file).
//
// An item is written in our own words from the page it cites; the originality check applies (no run of 8 or more words
// shared with its source). `itemProblems` refuses an item that skips a rule.

export const LABELS = {
  verified: { word: "VERIFIED", text: "We read the primary record ourselves: a regulator's own notice, a court or company filing, or the vendor's product documentation or status page." },
  news: { word: "NEWS", text: "Reported by an independent publication. We link the report." },
  "vendor-supplied": { word: "VENDOR-SUPPLIED", text: "The only source is the company's own announcement. We have not confirmed it elsewhere." },
};
export const LABEL_ORDER = ["verified", "news", "vendor-supplied"];

export const KINDS = {
  regulation: "Regulation",
  product: "Product",
  deal: "Deals",
  outage: "Outages",
  pricing: "Pricing and packaging",
};

/* The items, newest first on the page. Shape:
   { id, date: "YYYY-MM-DD", label, kind, who, vendors: [name], headline, summary,
     source: { publisher, title, url, published }, also: source | null, checked: "YYYY-MM-DD" } */
/* Launch set, researched 27 September 2026 from the page each item cites (July to September 2026). */
export const ITEMS = [
  /* Set of 13 October 2026: researched from the page each item cites, 1 to 13 October 2026. */
  {
    "id": "mw-2026-10-01-fcc-26-67-full-text",
    "date": "2026-10-01",
    "label": "verified",
    "kind": "regulation",
    "who": "Federal Communications Commission",
    "vendors": [],
    "headline": "FCC releases full robocall consent order; changes start 30 days after Federal Register",
    "summary": "The FCC released the full text of FCC 26-67 on 1 October. Callers that disclose it clearly may name one method for opting out, such as a key press, set reply words or a website. The changes start 30 days after Federal Register publication, which had not happened by 13 October.",
    "source": {
      "publisher": "Federal Communications Commission",
      "title": "Report and Order and Further Notice of Proposed Rulemaking, FCC 26-67",
      "url": "https://docs.fcc.gov/public/attachments/FCC-26-67A1.pdf",
      "published": "2026-10-01"
    },
    "also": null,
    "checked": "2026-10-13"
  },
  {
    "id": "mw-2026-10-08-fcc-robocall-mitigation-orders",
    "date": "2026-10-08",
    "label": "verified",
    "kind": "regulation",
    "who": "Federal Communications Commission",
    "vendors": [],
    "headline": "FCC orders traffic blocked from one voice provider and warns two more",
    "summary": "On 5 October the FCC Enforcement Bureau removed Digital Solutions Inc. from the Robocall Mitigation Database and told the next providers in the call path to stop accepting its traffic 30 days later. On 8 October it gave Aspireistic Inc. and Callsto, LLC 14 days to answer before the same steps.",
    "source": {
      "publisher": "Federal Communications Commission",
      "title": "Final Determination Order and Removal Order, Digital Solutions Inc., DA 26-1073",
      "url": "https://docs.fcc.gov/public/attachments/DA-26-1073A1.pdf",
      "published": "2026-10-05"
    },
    "also": {
      "publisher": "Federal Communications Commission",
      "title": "Initial Determination Order and Order to Show Cause, Aspireistic Inc., DA 26-1084",
      "url": "https://docs.fcc.gov/public/attachments/DA-26-1084A1.pdf",
      "published": "2026-10-08"
    },
    "checked": "2026-10-13"
  },
  {
    "id": "mw-2026-10-07-automation-anywhere-boost-ai",
    "date": "2026-10-07",
    "label": "news",
    "kind": "deal",
    "who": "Automation Anywhere",
    "vendors": [
      "Automation Anywhere",
      "Boost.ai"
    ],
    "headline": "Automation Anywhere agrees to buy conversational and voice AI company Boost.ai",
    "summary": "Automation Anywhere signed a definitive agreement on 7 October to buy Boost.ai from Nordic Capital. Both companies expect the deal to close in the fourth quarter of 2026, subject to regulatory approval, and neither disclosed the price.",
    "source": {
      "publisher": "SiliconANGLE",
      "title": "Automation Anywhere acquires Boost.ai to expand customer-facing voice AI",
      "url": "https://siliconangle.com/2026/10/08/automation-anywhere-acquires-boost-ai-to-expand-customer-facing-voice-ai",
      "published": "2026-10-08"
    },
    "also": {
      "publisher": "Nordic Capital",
      "title": "Nordic Capital to sell Boost.ai to Automation Anywhere",
      "url": "https://www.nordiccapital.com/insights/press-releases/nordic-capital-agrees-to-sell-boostai-a-leading-conversational-and-voice-ai-company-for-regulated-industries-to-automation-anywhere/",
      "published": "2026-10-07"
    },
    "checked": "2026-10-13"
  },
  {
    "id": "mw-2026-10-09-genesys-cloud-us-east-errors",
    "date": "2026-10-09",
    "label": "verified",
    "kind": "outage",
    "who": "Genesys",
    "vendors": [
      "Genesys"
    ],
    "headline": "Genesys Cloud reports elevated errors in its US East region on 9 October",
    "summary": "Genesys says that for 34 minutes on 9 October, from 18:25 Eastern, some customers in its US East region saw errors with bot flows, accepting interactions, WebRTC calls and analytics. It worked with its platform provider on the cause and will send a root cause report to affected customers.",
    "source": {
      "publisher": "Genesys",
      "title": "Genesys Cloud Status: Elevated Error Rates, Americas (US-East)",
      "url": "https://status.mypurecloud.com/incidents/bdn6vylmq1md",
      "published": "2026-10-09"
    },
    "also": null,
    "checked": "2026-10-13"
  },
  {
    "id": "mw-2026-10-12-aircall-calling-issues",
    "date": "2026-10-12",
    "label": "verified",
    "kind": "outage",
    "who": "Aircall",
    "vendors": [
      "Aircall"
    ],
    "headline": "Aircall reports some customers unable to make or receive calls on 12 October",
    "summary": "Aircall's status page recorded a major incident on 12 October affecting inbound and outbound calls for a subset of customers. It opened at 09:29 UTC, a fix was in place by 10:05 UTC and the incident was marked resolved at 10:17 UTC.",
    "source": {
      "publisher": "Aircall",
      "title": "Aircall Status: Calling Issues",
      "url": "https://status.aircall.com/incidents/2yc546pjqbhd",
      "published": "2026-10-12"
    },
    "also": null,
    "checked": "2026-10-13"
  },
  {
    "id": "mw-2026-10-01-webex-personalized-ai-routing",
    "date": "2026-10-01",
    "label": "verified",
    "kind": "product",
    "who": "Cisco",
    "vendors": [
      "Cisco"
    ],
    "headline": "Webex Contact Center makes Personalized AI Routing available",
    "summary": "Cisco's administrator release notes for 1 October 2026 list Personalized AI Routing as available in Webex Contact Center. It pairs each contact with an agent using the customer's intent and what is known about agents, and can be pointed at a business measure the customer chooses.",
    "source": {
      "publisher": "Cisco",
      "title": "What's new for administrators in Webex Contact Center",
      "url": "https://help.webex.com/en-us/article/nv7abhz/What's-new-for-administrators-in-Webex-Contact-Center",
      "published": "2026-10"
    },
    "also": null,
    "checked": "2026-10-13"
  },
  {
    "id": "mw-2026-10-12-amazon-connect-prefilled-guides",
    "date": "2026-10-12",
    "label": "verified",
    "kind": "product",
    "who": "Amazon Web Services",
    "vendors": [
      "Amazon Connect"
    ],
    "headline": "Amazon Connect fills in after-contact guides from the conversation",
    "summary": "AWS said on 12 October that Amazon Connect Customer can now complete the step-by-step guides agents fill in after a contact, using details drawn from the conversation such as booking or claim numbers and a summary. Managers choose the fields and agents check and submit. Nine AWS Regions at launch.",
    "source": {
      "publisher": "Amazon Web Services",
      "title": "Amazon Connect Customer now prefills step-by-step guides for after contact work",
      "url": "https://aws.amazon.com/about-aws/whats-new/2026/10/connect-customer-prefills-guides-acw",
      "published": "2026-10-12"
    },
    "also": null,
    "checked": "2026-10-13"
  },
  {
    "id": "mw-2026-10-06-zendesk-voice-ai-agents-ga",
    "date": "2026-10-06",
    "label": "verified",
    "kind": "product",
    "who": "Zendesk",
    "vendors": [
      "Zendesk"
    ],
    "headline": "Zendesk makes voice AI agents generally available to its voice customers",
    "summary": "Zendesk's October 2026 release roundup, posted 6 October, lists voice AI agents as generally available to Zendesk voice customers. They automate phone conversations and pass calls to people with the transcript, summary and recording. The same roundup adds voicemail for its contact center.",
    "source": {
      "publisher": "Zendesk",
      "title": "October 2026 Release roundup: Channels, Voice, and Messaging",
      "url": "https://community.zendesk.com/product-updates/october-2026-release-roundup-channels-voice-and-messaging-22627",
      "published": "2026-10-06"
    },
    "also": null,
    "checked": "2026-10-13"
  },
  {
    "id": "mw-2026-09-30-fcc-tcpa-revocation-adopted",
    "date": "2026-09-30",
    "label": "verified",
    "kind": "regulation",
    "who": "Federal Communications Commission",
    "vendors": [],
    "headline": "FCC adopts narrower robocall consent revocation rules and seeks comment on more",
    "summary": "The FCC adopted its Report and Order in CG Docket 02-278 (FCC 26-67) on 30 September 2026, three commissioners approving. Consumers can stop one category of informational robocall and keep the others, and callers can designate the method for revoking consent. A further notice asks about shorter honoring times and revocation by reply text.",
    "source": {
      "publisher": "Federal Communications Commission",
      "title": "FCC Votes to Give Consumers More Choice in the Calls They Receive (news release, FCC 26-67)",
      "url": "https://docs.fcc.gov/public/attachments/DOC-425498A1.pdf",
      "published": "2026-09-30"
    },
    "also": {
      "publisher": "Federal Communications Commission",
      "title": "Statement of Chairman Brendan Carr, FCC 26-67",
      "url": "https://docs.fcc.gov/public/attachments/DOC-425498A2.pdf",
      "published": "2026-09-30"
    },
    "checked": "2026-10-01"
  },
  {
    "id": "mw-2026-09-09-fcc-tcpa-revocation-draft",
    "date": "2026-09-09",
    "label": "verified",
    "kind": "regulation",
    "who": "Federal Communications Commission",
    "vendors": [],
    "headline": "FCC circulates draft order narrowing how robocall consent revocations must be honored",
    "summary": "The FCC circulated a draft order in CG Docket 02-278 for its 30 September 2026 meeting. Callers could treat an opt-out as covering only the category of informational calls it targets and name exclusive opt-out methods. The Commission adopted the order on 30 September 2026; the item of that date records the vote.",
    "source": {
      "publisher": "Federal Communications Commission",
      "title": "FCC Fact Sheet: Rules and Regulations Implementing the Telephone Consumer Protection Act of 1991, Report and Order and Further Notice of Proposed Rulemaking (FCC-CIRC 2609-05)",
      "url": "https://docs.fcc.gov/public/attachments/DOC-424844A1.pdf",
      "published": "2026-09-09"
    },
    "also": {
      "publisher": "Inside Global Tech (Covington)",
      "title": "FCC Releases Draft Rules and Proposals on TCPA Consent Revocation",
      "url": "https://www.insideglobaltech.com/2026/09/11/fcc-releases-draft-rules-and-proposals-on-tcpa-consent-revocation/",
      "published": "2026-09-11"
    },
    "checked": "2026-10-01"
  },
  {
    "id": "mw-2026-09-02-fcc-rmd-removals",
    "date": "2026-09-02",
    "label": "verified",
    "kind": "regulation",
    "who": "Federal Communications Commission",
    "vendors": [],
    "headline": "FCC removes 14 voice providers from Robocall Mitigation Database, orders their traffic blocked",
    "summary": "The FCC Enforcement Bureau removed 14 providers that did not fix deficient database certifications or answer show cause orders. Other U.S. voice and intermediate providers were given two days to start blocking all of their traffic.",
    "source": {
      "publisher": "Federal Communications Commission",
      "title": "FCC Cuts Off Providers for Violating Robocall Rules",
      "url": "https://docs.fcc.gov/public/attachments/DOC-424692A1.pdf",
      "published": "2026-09-02"
    },
    "also": null,
    "checked": "2026-09-27"
  },
  {
    "id": "mw-2026-07-27-eu-ai-omnibus-in-force",
    "date": "2026-07-27",
    "label": "verified",
    "kind": "regulation",
    "who": "European Union",
    "vendors": [],
    "headline": "EU Digital Omnibus on AI enters into force, pushing back high-risk AI Act deadlines",
    "summary": "Regulation (EU) 2026/1744 appeared in the EU Official Journal on 24 July 2026 and took effect on 27 July. Stand-alone high-risk system rules now apply from 2 December 2027 and product-embedded ones from 2 August 2028. General AI Act provisions still apply from 2 August 2026.",
    "source": {
      "publisher": "Publications Office of the European Union (EUR-Lex)",
      "title": "Regulation (EU) 2026/1744 of the European Parliament and of the Council of 8 July 2026 amending Regulations (EU) 2024/1689, (EU) 2018/1139 and (EU) 2023/1230 (Digital Omnibus on AI), OJ L, 24.7.2026",
      "url": "https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng",
      "published": "2026-07-24"
    },
    "also": {
      "publisher": "Law & Technology",
      "title": "Digital Omnibus on AI in the Official Journal: Regulation (EU) 2026/1744 is published",
      "url": "https://lawandtechnology.eu/en/digital-omnibus-on-ai-official-journal-regulation-2026-1744/",
      "published": "2026-07-24"
    },
    "checked": "2026-10-01"
  },
  {
    "id": "mw-2026-07-15-ofcom-a2p-sms-rules",
    "date": "2026-07-15",
    "label": "news",
    "kind": "regulation",
    "who": "Ofcom",
    "vendors": [],
    "headline": "Ofcom sets new UK rules for business text messaging to curb scams",
    "summary": "Ofcom confirmed rules for mobile operators and aggregators. Business-to-person messaging must carry stronger know-your-customer checks at onboarding, controls against fake alphanumeric sender IDs and ongoing traffic monitoring, from 15 July 2027. Person-to-person rules start 18 January 2027. OTT apps such as WhatsApp fall outside scope.",
    "source": {
      "publisher": "ISPreview UK",
      "title": "Ofcom Introduce New UK Rules to Tackle Mobile Messaging Scams UPDATE",
      "url": "https://www.ispreview.co.uk/index.php/2026/07/ofcom-introduce-new-uk-rules-to-tackle-mobile-messaging-scams.html",
      "published": "2026-07-15"
    },
    "also": null,
    "checked": "2026-09-27"
  },
  {
    "id": "mw-2026-09-10-salesforce-completes-fin",
    "date": "2026-09-10",
    "label": "verified",
    "kind": "deal",
    "who": "Salesforce",
    "vendors": [
      "Salesforce",
      "Fin"
    ],
    "headline": "Salesforce closes its acquisition of Fin, the company formerly named Intercom",
    "summary": "Salesforce completed the purchase of Intercom, Inc., now called Fin, on 10 September 2026 under a merger agreement signed on 15 June 2026. Salesforce says Fin will keep serving its existing customers as part of its AI Labs unit.",
    "source": {
      "publisher": "U.S. Securities and Exchange Commission (Salesforce, Inc. filing)",
      "title": "Salesforce, Inc. Form S-8 Registration Statement",
      "url": "https://www.sec.gov/Archives/edgar/data/0001108524/000110852426000204/forms-8xfinequityplan.htm",
      "published": "2026-09-10"
    },
    "also": {
      "publisher": "Salesforce",
      "title": "Salesforce Completes Acquisition of Fin",
      "url": "https://www.salesforce.com/news/press-releases/2026/09/10/salesforce-completes-acquisition-of-fin/",
      "published": "2026-09-10"
    },
    "checked": "2026-09-27"
  },
  {
    "id": "mw-2026-09-16-salesforce-hyperforce-disruption",
    "date": "2026-09-16",
    "label": "verified",
    "kind": "outage",
    "who": "Salesforce",
    "vendors": [
      "Salesforce"
    ],
    "headline": "Salesforce reports major disruption across hundreds of Hyperforce production instances on 16 September",
    "summary": "Salesforce's status record shows a major service disruption from 07:50 to 15:26 UTC on 16 September 2026, with delays, errors and trouble reaching services or opening support cases. Salesforce said a full investigation of trigger and cause would follow; no root cause was posted on the record when checked.",
    "source": {
      "publisher": "Salesforce Trust",
      "title": "Trust Status (incident 20004433)",
      "url": "https://status.salesforce.com/incidents/20004433",
      "published": "2026-09-16"
    },
    "also": {
      "publisher": "CIO",
      "title": "Salesforce's massive outage exposes the hidden risks of cloud dependencies",
      "url": "https://www.cio.com/article/4223037/salesforces-massive-outage-exposes-the-hidden-risks-of-cloud-dependencies.html",
      "published": "2026-09-16"
    },
    "checked": "2026-09-27"
  },
  {
    "id": "mw-2026-09-02-amazon-connect-agentic-cx-designer-ga",
    "date": "2026-09-02",
    "label": "verified",
    "kind": "product",
    "who": "Amazon Web Services",
    "vendors": [
      "Amazon Connect"
    ],
    "headline": "Amazon Connect agentic CX designer reaches general availability",
    "summary": "AWS made its no-code canvas for building voice and digital self-service with AI agents and rule-based steps generally available. It runs in N. Virginia, Oregon, Canada Central, Tokyo, Seoul, Singapore, Sydney, Frankfurt and London. The announcement gives no pricing.",
    "source": {
      "publisher": "Amazon Web Services",
      "title": "Release notes for Connect Customer - Amazon Connect Customer",
      "url": "https://docs.aws.amazon.com/connect/latest/adminguide/amazon-connect-release-notes.html",
      "published": "2026-09"
    },
    "also": {
      "publisher": "Amazon Web Services",
      "title": "Amazon Connect Customer announces general availability of agentic CX designer",
      "url": "https://aws.amazon.com/about-aws/whats-new/2026/09/agentic-cx-designer/",
      "published": "2026-09-02"
    },
    "checked": "2026-09-27"
  },
  {
    "id": "mw-2026-07-20-avaya-agent-for-desktop-eos",
    "date": "2026-07-20",
    "label": "verified",
    "kind": "product",
    "who": "Avaya",
    "vendors": [
      "Avaya"
    ],
    "headline": "Avaya ends sale of Avaya Agent for Desktop for new systems",
    "summary": "From 20 July 2026 Avaya no longer sells the SIP and H.323 versions of Avaya Agent for Desktop to new systems. Expansions for existing systems and manufacturer software support end 23 October 2028. Avaya points SIP users to Avaya Workplace and H.323 users to Workplace or J1xx endpoints.",
    "source": {
      "publisher": "Avaya",
      "title": "End of Sale Notice: End of Sale - Avaya Agent for Desktop (SIP and H.323)",
      "url": "https://support.avaya.com/css/public/documents/101095497",
      "published": "2026-04-16"
    },
    "also": null,
    "checked": "2026-09-27"
  },
  {
    "id": "mw-2026-07-25-cisco-webex-wfo-last-order",
    "date": "2026-07-25",
    "label": "verified",
    "kind": "product",
    "who": "Cisco",
    "vendors": [
      "Cisco"
    ],
    "headline": "Cisco stops taking new orders for Webex WFO recording, quality and workforce tools",
    "summary": "Cisco's end of life notice for Webex WFO set 25 July 2026 as the last order date for 28 SKUs, including call recording, quality management and workforce management. Renewals and changes end 30 July 2027 and support ends 31 July 2031. Cisco lists Webex Contact Center native features among migration options.",
    "source": {
      "publisher": "Cisco",
      "title": "Cisco Collaboration Flex Plan - End-of-Sale and End-of-Life Announcement for the Cisco Webex WFO",
      "url": "https://www.cisco.com/c/en/us/products/collateral/unified-communications/cisco-collaboration-flex-plan/webex-wfo-eol.html",
      "published": "2026-07-01"
    },
    "also": null,
    "checked": "2026-09-27"
  },
  {
    "id": "mw-2026-08-25-microsoft-retires-release-waves",
    "date": "2026-08-25",
    "label": "vendor-supplied",
    "kind": "product",
    "who": "Microsoft",
    "vendors": [
      "Microsoft"
    ],
    "headline": "Microsoft ends twice-yearly Dynamics 365 release waves and retires Release Planner",
    "summary": "Microsoft said Dynamics 365, Power Platform and Dataverse capabilities will be published continuously on the AI at Work roadmap from September 2026. Roadmap items with preview or GA dates from 1 June 2026 move there, and Release Planner is to be retired by 15 November 2026.",
    "source": {
      "publisher": "Microsoft Dynamics 365 Blog",
      "title": "One always-on roadmap: Dynamics 365, Power Platform, and Dataverse join the AI at Work roadmap",
      "url": "https://www.microsoft.com/en-us/dynamics-365/blog/business-leader/2026/08/25/one-always-on-roadmap-dynamics-365-power-platform-and-dataverse-join-the-ai-at-work-roadmap/",
      "published": "2026-08-25"
    },
    "also": null,
    "checked": "2026-09-27"
  },
  {
    "id": "mw-2026-09-02-genesys-xperience-agentic",
    "date": "2026-09-02",
    "label": "vendor-supplied",
    "kind": "product",
    "who": "Genesys",
    "vendors": [
      "Genesys"
    ],
    "headline": "Genesys releases Contextual Intelligence and AI Control Plane, dates Navigator and Orchestrator",
    "summary": "At Xperience 2026 Genesys said Contextual Intelligence and the AI Control Plane for Genesys Cloud are available now. It expects Genesys Cloud Navigator to be generally available between 1 November 2026 and 31 January 2027, and Orchestrator between 1 February and 30 April 2027.",
    "source": {
      "publisher": "Genesys",
      "title": "Genesys Launches New Innovations that Advance Genesys Cloud as the Agentic Orchestration Platform for Customer Experience",
      "url": "https://www.genesys.com/company/newsroom/announcements/genesys-launches-new-innovations-that-advance-genesys-cloud-as-the-agentic-orchestration-platform-for-customer-experience",
      "published": "2026-09-02"
    },
    "also": null,
    "checked": "2026-09-27"
  },
  {
    "id": "mw-2026-07-09-zoom-virtual-agent-receptionist-standalone",
    "date": "2026-07-09",
    "label": "vendor-supplied",
    "kind": "pricing",
    "who": "Zoom",
    "vendors": [
      "Zoom"
    ],
    "headline": "Zoom sells Virtual Agent Receptionist on its own, without Zoom Phone",
    "summary": "Zoom made its AI receptionist available for purchase online as a standalone product that works with other phone systems. Listed pricing is $29.99 USD per month for 100 minutes, or $24.99 USD per month for 100 minutes on annual billing.",
    "source": {
      "publisher": "Zoom",
      "title": "Deploy Zoom Virtual Agent Receptionist across any telephony environment",
      "url": "https://news.zoom.com/standalone-zoom-virtual-agent-receptionist/",
      "published": "2026-07-09"
    },
    "also": null,
    "checked": "2026-09-27"
  }
];

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const DASH = /[\u2013\u2014]/;
const VERDICT = /\b(best|leading|leader|winner|world[- ]cla(?:ss)|seam(?:less)|best[- ]in[- ]class|industry[- ]leading|cutting[- ]ed(?:ge)|revolut(?:ionary)|game[- ]cha(?:ng)\w*|should buy|we recommend)\b/i;

function sourceProblems(s, name) {
  const out = [];
  if (!s || !s.publisher || !s.title) out.push(`${name} needs a publisher and a title`);
  if (!/^https:\/\/[^/]+\/.+/.test((s && s.url) || "")) out.push(`${name} must link a specific https page`);
  /* A page that shows only its month (release notes) is cited by month. */
  if (!/^\d{4}-\d{2}(-\d{2})?$/.test((s && s.published) || "")) out.push(`${name} published date is YYYY-MM-DD, or YYYY-MM when the page shows only the month`);
  return out;
}

/** Why an item cannot publish, or [] when it can. */
export function itemProblems(it) {
  const out = [];
  if (!it || typeof it !== "object") return ["no record"];
  if (!/^mw-[a-z0-9-]+$/.test(it.id || "")) out.push("id");
  if (!DATE.test(it.date || "") || !DATE.test(it.checked || "")) out.push("date and checked are YYYY-MM-DD");
  if (!LABELS[it.label]) out.push("label");
  if (!KINDS[it.kind]) out.push("kind");
  if (!it.who) out.push("who");
  if (!Array.isArray(it.vendors)) out.push("vendors is a list");
  if (!it.headline || it.headline.split(/\s+/).length > 14) out.push("headline of at most 14 words");
  if (!it.summary || it.summary.split(/\s+/).length > 55) out.push("summary of at most 55 words");
  out.push(...sourceProblems(it.source, "source"));
  if (it.also) out.push(...sourceProblems(it.also, "also"));
  if (it.source && DATE.test(it.source.published || "") && DATE.test(it.checked || "") && it.source.published > it.checked) out.push("source published after it was checked");
  const text = `${it.headline || ""} ${it.summary || ""}`;
  if (DASH.test(text)) out.push("contains a dash");
  if (VERDICT.test(text)) out.push("contains a verdict or promotional word");
  if (/["“”]/.test(text)) out.push("contains a quotation");
  return out;
}

export const publishedItems = (items = ITEMS) =>
  items.filter((it) => itemProblems(it).length === 0).sort((a, b) => (a.date === b.date ? (a.id < b.id ? -1 : 1) : a.date < b.date ? 1 : -1));
export const latestDate = (items = ITEMS) => publishedItems(items).reduce((m, it) => (it.date > m ? it.date : m), "");

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/** A source's publication date in words: "2 September 2026", or "September 2026" for a month-only page. */
export const publishedWords = (p) => { const [y, m, d] = String(p).split("-").map(Number); return d ? `${d} ${MONTHS[m - 1]} ${y}` : `${MONTHS[m - 1]} ${y}`; };

