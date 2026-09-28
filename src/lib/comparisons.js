/* comparisons.js
 *
 * "How others report it": published figures a reader can hold their own result against (TB, 28 Sep 2026, from two
 * benchmark research runs: the Benchmark Corpus and the Benchmark Library). Every figure here was read on the page it
 * cites, on 28 Sep 2026 unless the entry says otherwise; the date checked is on each source.
 *
 * Rules, each gated by comparisons.test.mjs:
 *   - Display only. No tool reads a figure from this file into its arithmetic, a default, a flag or a grade.
 *   - One publisher and one method per row. Nothing is averaged across publishers or methods, and no range is built
 *     from two publishers' ranges (the Library's "consensus" ranges were averages of this kind; they are not used).
 *   - Each row says what kind of figure it is: a benchmark study, a practice range, a survey of people, a regulatory
 *     standard, a list price or an official statistic. The kind is printed beside the figure.
 *   - A figure reached through another site names that host.
 *   - Industry rows appear only where a publisher prints an industry figure. First contact resolution by industry is
 *     read from the claims registry, the same records the industry pages render.
 *   - Withheld: figures the research found misattributed, uncited, forecast, vendor-defined or unreadable from this
 *     network (WITHHELD below). The test fails if any of them renders.
 */

import { CLAIMS } from "./claims.js";

export const KIND_LABEL = {
  measured: "Benchmark study",
  practice: "Practice range",
  survey: "Survey of people",
  regulation: "Regulatory standard",
  price: "List price",
  official: "Official statistic",
};

/* Sources. `host` names the site the figure was read on when it is not the publisher's own. */
export const SOURCES = {
  sqm26: { publisher: "SQM Group", title: "First Call Resolution Benchmark (FCR Benchmarking by Industry 2026)", published: "updated 20 Aug 2026", checked: "2026-09-28", url: "https://www.sqmgroup.com/resources/library/blog/fcr-metric-operating-philosophy" },
  sqm24: { publisher: "SQM Group", title: "Call Center FCR Benchmark 2024 Results by Industry", published: "6 Feb 2025", checked: "2026-09-28", url: "https://www.sqmgroup.com/resources/library/blog/call-center-fcr-benchmark-2024-results-by-industry" },
  sqm23: { publisher: "SQM Group", title: "What Are the Industry Standards for the Top Call Center KPIs?", published: "19 Jan 2023", checked: "2026-09-28", url: "https://www.sqmgroup.com/resources/library/blog/industry-standards-top-call-center-kpis" },
  cb26: { publisher: "ContactBabel", title: "The 2026 US Contact Center Decision-Makers' Guide, key findings", published: "2026", checked: "2026-09-28", url: "https://www.contactbabel.com/the-us-contact-center-decision-makers-guide/" },
  cb24: { publisher: "ContactBabel", host: "RingCentral", title: "The US Contact Center Decision-Makers' Guide 2024, HR benchmarks", published: "2024", checked: "2026-09-28", url: "https://assets.ringcentral.com/us/report/us-dmg-2024.pdf" },
  cb25: { publisher: "ContactBabel", host: "Contact Center Pipeline", title: "The 2025 US Contact Center Decision-Makers' Guide, as reported in \"The Great Contact Center Standoff\"", published: "14 Aug 2025", checked: "2026-09-28", url: "https://blog.contactcenterpipeline.com/2025/08/research-the-great-contact-center-standoff/" },
  nice25: { publisher: "NICE", title: "Managing the Modern Contact Center: Current Employer Trends (survey of contact center leaders, North America and EMEA)", published: "Apr 2025", checked: "2026-09-28", url: "https://resources.nice.com/wp-content/uploads/2025/04/Managing-the-Modern-Contact-Center-Current-Employer-Trends-2025-Survey.pdf" },
  shrm25: { publisher: "SHRM", title: "SHRM Releases 2025 Benchmarking Reports", published: "15 Oct 2025", checked: "2026-09-28", url: "https://www.shrm.org/about/press-room/shrm-releases-2025-benchmarking-reports--how-does-your-organizat" },
  shrm26: { publisher: "SHRM", title: "Recruiting Benchmarking", published: "2026", checked: "2026-09-28", url: "https://www.shrm.org/topics-tools/research/recruiting-benchmarking" },
  gartner24: { publisher: "Gartner", title: "Gartner Survey Finds Only 14% of Customer Service Issues Are Fully Resolved in Self-Service (survey of 5,728 customers, December 2023)", published: "19 Aug 2024", checked: "2026-09-25", url: "https://www.gartner.com/en/newsroom/press-releases/2024-08-19-gartner-survey-finds-only-14-percent-of-customer-service-issues-are-fully-resolved-in-self-service" },
  sf25: { publisher: "Salesforce", title: "State of Service, 2025 (survey of 6,500 service professionals in 39 countries, April to June 2025)", published: "13 Nov 2025", checked: "2026-09-28", url: "https://www.salesforce.com/news/stories/state-of-service-report-announcement-2025/" },
  yougov25: { publisher: "YouGov", title: "How Americans prefer to contact businesses for customer service", published: "13 Mar 2025", checked: "2026-09-28", url: "https://yougov.com/en-us/articles/51802-how-americans-prefer-to-contact-businesses-for-customer-service" },
  cchOcc: { publisher: "Call Centre Helper", title: "What Is the Right Figure for Contact Centre Occupancy?", published: "updated 22 Jul 2026", checked: "2026-09-28", url: "https://www.callcentrehelper.com/what-is-the-right-figure-for-contact-centre-occupancy-206495.htm" },
  cchShr: { publisher: "Call Centre Helper", title: "How to Calculate Contact Centre Shrinkage", published: "updated 30 Jul 2026", checked: "2026-09-28", url: "https://www.callcentrehelper.com/how-to-calculate-contact-centre-shrinkage-90353.htm" },
  cchAdh: { publisher: "Call Centre Helper", title: "What Is Adherence?", published: "updated 22 Jul 2026", checked: "2026-09-28", url: "https://www.callcentrehelper.com/what-is-adherence-209091.htm" },
  intradiem: { publisher: "Intradiem", title: "Call Center Occupancy: What It Is and Why It's So Crucial for Success", published: "16 Mar 2022", checked: "2026-09-28", url: "https://intradiem.com/resources/blog/how-is-occupancy-calculated-for-a-call-center/" },
  verint: { publisher: "Verint", title: "What Is Schedule Adherence and Why Is It Important in the Call Center?", published: "1 Jan 2021", checked: "2026-09-28", url: "https://www.verint.com/blog/what-is-schedule-adherence-and-why-is-it-important-in-the-call-center/" },
  techtarget: { publisher: "TechTarget", title: "Call center schedule adherence (definition)", published: "14 Jun 2024", checked: "2026-09-28", url: "https://www.techtarget.com/searchcustomerexperience/definition/call-center-schedule-adherence" },
  cpuc: { publisher: "California Public Utilities Commission", title: "General Order 103-A, Appendix E, customer service standards for Class A and B water utilities (effective 10 Sep 2009)", published: "2009", checked: "2026-09-28", url: "https://docs.cpuc.ca.gov/PUBLISHED/Graphics/107118.PDF" },
  blsOoh: { publisher: "US Bureau of Labor Statistics", title: "Occupational Outlook Handbook, Customer Service Representatives, pay by industry (May 2025 wages)", published: "2026", checked: "TB research, 2026-09-28", url: "https://www.bls.gov/ooh/office-and-administrative-support/customer-service-representatives.htm" },
  genesys: { publisher: "Genesys", title: "Genesys Cloud pricing", published: "vendor page", checked: "2026-09-28", url: "https://www.genesys.com/pricing" },
  nice: { publisher: "NICE", title: "CXone pricing", published: "vendor page", checked: "2026-09-28", url: "https://www.nice.com/pricing" },
  five9: { publisher: "Five9", title: "Five9 pricing", published: "vendor page", checked: "2026-09-28", url: "https://www.five9.com/pricing" },
  talkdesk: { publisher: "Talkdesk", title: "Talkdesk pricing", published: "vendor page", checked: "2026-09-28", url: "https://www.talkdesk.com/pricing/" },
  zoom: { publisher: "Zoom", title: "Zoom Contact Center pricing", published: "vendor page", checked: "2026-09-28", url: "https://zoom.us/pricing/zoom-contact-center" },
  msft: { publisher: "Microsoft", title: "Dynamics 365 Contact Center pricing", published: "vendor page", checked: "2026-09-28", url: "https://www.microsoft.com/en-us/dynamics-365/products/contact-center/pricing" },
  ringcx: { publisher: "RingCentral", title: "RingCX", published: "vendor page", checked: "2026-09-28", url: "https://www.ringcentral.com/ringcx.html" },
};

const SQM_METHOD = "post-call customer survey of SQM's benchmarked North American inbound customer service call centers";

/* First contact resolution by industry, one publisher and one method (SQM Group, 2026). Site industries read the
   claims registry; SQM's other published groups follow in SQM's own words. Industries SQM does not publish say so. */
const FCR_INDUSTRY_CLAIMS = [
  ["All industries", "retail.bench.fcr.cross"], ["Retail", "retail.bench.fcr.retail"], ["Insurance", "ins.bench.fcr.ins"],
  ["Financial", "fs.bench.fcr.fs"], ["Energy and utilities", "utl.bench.fcr.utl"], ["Government", "gov.bench.fcr.gov"],
  ["Health insurance", "hc.bench.fcr.hc"], ["Telco", "tel.bench.fcr.tel"],
];
const fcrRows = () => [
  ...FCR_INDUSTRY_CLAIMS.map(([label, id]) => ({ label, value: CLAIMS[id].value, claim: id })),
  { label: "Not-for-profit", value: "73%", src: "sqm26" },
  { label: "Tech support", value: "64%", src: "sqm26" },
];

/* Groups by tool. A group is one question a reader asks of their result; each row is one publisher's figure. */
export const GROUPS = {
  fcr: () => ({
    id: "fcr", title: "First contact resolution by industry", kind: "measured", src: "sqm26",
    note: `SQM Group's 2026 averages, from a ${SQM_METHOD}. Industries SQM does not publish, such as manufacturing, education and travel, have no figure here.`,
    rows: [...fcrRows(), { label: "All industries, 2024 results", value: "69%", src: "sqm24" }],
  }),
  cost: () => ({
    id: "cost", title: "Cost of an inbound call", kind: "measured",
    note: "A cross-industry US average reported by contact centers. No free source publishes cost per contact by industry, so none is shown.",
    rows: [{ label: "Average cost of an inbound call, US", value: "$7.20", detail: "47% more than an email and 23% more than a web chat, as ContactBabel states it", src: "cb26" }],
  }),
  attrition: () => ({
    id: "attrition", title: "Agent attrition", kind: "measured",
    note: "Each publisher defines attrition its own way; read the definition before comparing. No free source publishes agent attrition by industry.",
    rows: [
      { label: "Mean, US, 2023", value: "31%", detail: "All agents leaving in 12 months over average headcount. Median 24%", src: "cb24" },
      { label: "Unmanaged attrition, 2024", value: "39%", detail: "Leaders' reported average: North America 36%, EMEA 41%. Unmanaged means agents the center did not plan to lose", src: "nice25" },
      { label: "Agent turnover, 2022", value: "35%", detail: "SQM's figure for 2022, which it called the highest it had measured in 25 years", src: "sqm23" },
    ],
  }),
  hiring: () => ({
    id: "hiring", title: "Cost and time to hire", kind: "measured",
    note: "All industries and all nonexecutive jobs, reported by SHRM members. Contact center hiring is not split out.",
    rows: [
      { label: "Average cost per hire, nonexecutive", value: "$5,475", src: "shrm25" },
      { label: "Median time to fill, nonexecutive", value: "39 days", detail: "Calendar days", src: "shrm26" },
    ],
  }),
  service: () => ({
    id: "service", title: "Service level targets", kind: "practice",
    note: "The common target is a convention. A few regulators set their own standard for the centers they oversee.",
    rows: [
      { label: "Traditional service level standard", value: "80% in 20 s", detail: "SQM adds that it finds no satisfaction penalty for calls answered within 120 seconds", src: "sqm23" },
      { label: "California water utilities, Class A and B", value: "80% in 30 s", kind: "regulation", detail: "Share of callers reaching a representative in business hours; abandoned calls at or below 5%", src: "cpuc" },
      { label: "Medicare Advantage lines, CMS standard", value: "2:00", kind: "regulation", claim: "hc.cms.hold", detail: "Average hold after the phone menu. CMS test calls measured 0:32 in January to June 2025" },
      { label: "Average speed of answer, US", value: "74 s", kind: "measured", detail: "One third above the pre-pandemic average", src: "cb26" },
      { label: "Abandon rate, industry standard", value: "6%", kind: "measured", detail: "SQM counts below 5% as favourable", src: "sqm23" },
    ],
  }),
  aht: () => ({
    id: "aht", title: "Voice handle time", kind: "measured",
    note: "All industries. Publishers define handle time differently, so the figures are not averaged. No free source publishes handle time by industry.",
    rows: [
      { label: "Average handle time, 2024", value: "11:37", detail: "697 seconds of talk and wrap-up, 18% more than the year before", src: "sqm24" },
      { label: "Typical service call, US, 2024", value: "7+ min", detail: "\"Over seven minutes\", 38% longer than in 2012", src: "cb25" },
    ],
  }),
  occupancy: () => ({
    id: "occupancy", title: "Occupancy", kind: "practice",
    note: "Targets from practice, not surveys of what centers achieve. Each publisher's range is shown as it states it.",
    rows: [
      { label: "Ideal rate, practitioner roundup", value: "85% to 90%", detail: "Some suggest 80% to 90%; centers under 100 agents 70% to 75%. The page adds there is no definitive answer", src: "cchOcc" },
      { label: "Industry standard", value: "75% to 85%", src: "sqm23" },
      { label: "Recommended target, from a workforce software vendor", value: "80% to 90%", src: "intradiem" },
    ],
  }),
  shrinkage: () => ({
    id: "shrinkage", title: "Shrinkage", kind: "practice",
    note: "Total shrinkage, planned and unplanned, as a share of paid time. Practice figures, not a survey of actuals.",
    rows: [
      { label: "Where shrinkage normally comes out", value: "30% to 35%", src: "cchShr" },
      { label: "Dimension Data benchmark average, as quoted", value: "35%", detail: "The original report is no longer published", src: "cchShr" },
      { label: "Short-term agent absence, US, 2023", value: "6.5%", kind: "measured", detail: "Median of centers' reported absence, one part of unplanned shrinkage; over a quarter of centers report above 15%", src: "cb24" },
    ],
  }),
  adherence: () => ({
    id: "adherence", title: "Schedule adherence", kind: "practice",
    note: "Targets from practice. No public survey reports the adherence centers achieve.",
    rows: [
      { label: "Generally considered acceptable", value: "85% to 95%", src: "cchAdh" },
      { label: "High-performing centers target, from a workforce software vendor", value: "85% to 95%", detail: "Complex interactions 85% to 90%", src: "verint" },
      { label: "What most centers strive for", value: "80%", src: "techtarget" },
    ],
  }),
  deflection: () => ({
    id: "deflection", title: "Self-service and AI resolution", kind: "survey",
    note: "Three different questions asked of different people; none is a containment rate. Vendor-defined resolution rates are left out.",
    rows: [
      { label: "Issues fully resolved in self-service", value: "14%", detail: "Customers' own account of their last issue", src: "gartner24" },
      { label: "Web chats handled without a human agent, US", value: "18%", kind: "measured", detail: "Reported by centers; 6% in 2020", src: "cb26" },
      { label: "Service cases handled by AI", value: "30%", detail: "Service professionals' own estimate", src: "sf25" },
    ],
  }),
  channels: () => ({
    id: "channels", title: "Channel mix and preference", kind: "measured",
    note: "What centers handle and what customers say they prefer are different measures; they are shown apart.",
    rows: [
      { label: "Live telephony, share of inbound, end of 2024", value: "62%", detail: "Email about 19%, web chat 8%, telephony self-service 9%", src: "cb25" },
      { label: "Phone as the preferred channel, US adults", value: "35%", kind: "survey", detail: "Email 23%, live chat 10%, in person 8%, chatbot 1%", src: "yougov25" },
    ],
  }),
  prices: () => ({
    id: "prices", title: "Published contact center list prices", kind: "price",
    note: "Per agent a month in USD, as each vendor's pricing page shows it. Seat types and terms differ (named, concurrent, annual), so the prices are listed and never averaged. Negotiated prices differ; vendors that publish no price are not listed.",
    rows: [
      { label: "Genesys Cloud CX 1, 2, 3, 4", value: "$75, $115, $155, $240", detail: "Per user, billed annually", src: "genesys" },
      { label: "NICE CXone Omnichannel, Essential, Core, Complete, Ultimate", value: "$110, $135, $169, $209, $249", detail: "Per agent, billed monthly in arrears; Ultimate also $0.25 a session", src: "nice" },
      { label: "Five9 Digital, Core", value: "$119, $159", detail: "Per seat, monthly; concurrent pricing with a 50-seat minimum", src: "five9" },
      { label: "Talkdesk Digital Essentials, Voice Essentials, Elite, Industry Experience Clouds", value: "$85, $105, $165, $225", detail: "Per user", src: "talkdesk" },
      { label: "Zoom Contact Center Essentials, Premium, Elite", value: "$69, $99, $149", detail: "Per user, billed annually; $85, $119, $179 billed monthly", src: "zoom" },
      { label: "Microsoft Dynamics 365 Contact Center, and its Digital and Voice editions", value: "$110, $95, $95", detail: "Per user, paid yearly", src: "msft" },
      { label: "RingCX", value: "from $65", detail: "Per user, monthly; starting price as published", src: "ringcx" },
    ],
  }),
  wageIndustry: () => ({
    id: "wageIndustry", title: "Customer service representative pay by industry", kind: "official",
    note: "Median hourly wage, May 2025, for the industries BLS lists. Other industries are not published at this level.",
    rows: [
      { label: "Wholesale trade", value: "$23.41", src: "blsOoh" },
      { label: "Insurance carriers and related activities", value: "$22.47", src: "blsOoh" },
      { label: "Professional, scientific and technical services", value: "$21.77", src: "blsOoh" },
      { label: "Retail trade", value: "$17.96", src: "blsOoh" },
      { label: "Business support services (includes outsourced call centers)", value: "$17.68", src: "blsOoh" },
    ],
  }),
};

/* Which groups each tool shows, and whether it carries the state wage picker. */
export const TOOL_GROUPS = {
  "fcr-leakage": { groups: ["fcr", "cost"] },
  "cost-per-contact": { groups: ["fcr", "cost"], wage: true },
  "attrition-cost": { groups: ["attrition", "hiring"], wage: true },
  "staffing-calculator": { groups: ["service", "aht"], wage: true },
  "occupancy-risk": { groups: ["occupancy"], wage: true },
  "shrinkage-planner": { groups: ["shrinkage"], wage: true },
  "schedule-adherence": { groups: ["adherence", "service"], wage: true },
  "ai-deflection": { groups: ["deflection", "channels"] },
  "channel-shift": { groups: ["channels", "cost", "deflection"], wage: true },
  "tco-calculator": { groups: ["prices", "aht", "fcr", "attrition", "service", "occupancy", "shrinkage", "adherence", "wageIndustry"], wage: true },
  "license-gap": { groups: ["prices"] },
};

/* A row's source: its own, the claim's, or the group's. */
export function rowSource(row, group) {
  if (row.claim) {
    const c = CLAIMS[row.claim];
    return { publisher: c.source.publisher, title: c.source.title, published: String(c.source.year), checked: c.checked || null, url: c.source.url };
  }
  return SOURCES[row.src || group.src];
}

export const groupsFor = (toolId) => (TOOL_GROUPS[toolId] ? TOOL_GROUPS[toolId].groups.map((g) => GROUPS[g]()) : []);

/* Figures the research found and this site does not show, with the reason. comparisons.test.mjs fails if any of these
   strings reaches a tool page. */
export const WITHHELD = [
  { claim: "Industry FCR ranges credited to SQM 2024 (utilities 76% to 82%, telecom 52% to 58%)", reason: "Not on SQM's pages.", match: ["76% to 82%", "52% to 58%"] },
  { claim: "Vertical agent attrition such as financial services 52% to 61%", reason: "No source per figure.", match: ["52% to 61%", "47% to 56%"] },
  { claim: "Fin average resolution rate 76%", reason: "A vendor's own definition of resolution.", match: ["Fin average resolution"] },
  { claim: "Agentic AI will resolve 80% of common issues by 2029", reason: "A forecast.", match: ["by 2029"] },
  { claim: "Freshworks platform FCR by industry (2022 ticket data)", reason: "Ticket data from one platform, a different measure; one value printed as 8.05%.", match: ["Freshworks", "8.05%"] },
  { claim: "Gartner median cost per contact $13.50 assisted, $1.84 self-service", reason: "The document could not be read from this network; not shown until it is.", match: ["$13.50", "$1.84"] },
  { claim: "Averaged 'consensus' ranges: occupancy 79% to 87%, shrinkage 32% to 38%, adherence 83% to 90%", reason: "No publisher states them; they average several publishers' ranges.", match: ["79% to 87%", "32% to 38%", "83% to 90%"] },
  { claim: "Sector quit rates (BLS JOLTS) as an industry turnover index", reason: "Covers every role in a sector, not agents.", match: ["turnover pressure", "JOLTS"] },
  { claim: "Dialpad seat prices", reason: "Read on a competitor's blog; Dialpad's own page did not show them.", match: ["Dialpad Support"] },
  { claim: "May 2023 mean wages by industry", reason: "Out of date against May 2025 and a different statistic (means).", match: ["$46,200", "$59,560"] },
];
