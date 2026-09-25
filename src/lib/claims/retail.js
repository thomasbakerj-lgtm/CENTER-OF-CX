/* Retail and eCommerce claims. See src/lib/claims.js for the kinds. `draft` holds the figure the page printed before the
 * scan, for lineage; it never renders.
 *
 * Research pass 2026-09-25. The pre-scan benchmark table printed three columns (retail, cross-industry, top quartile) of
 * unsourced figures. The top quartile column is gone (no public source for any cell). One retail figure is published:
 * SQM Group's retail first contact resolution. The all-industry column is SQM Group, each figure labelled with what it
 * measures. The stats strip's Qualtrics "$3.7T" (2024, global, all industries) moved URL and has been superseded by
 * the publisher's own 2026 estimate; the strip now carries retail figures read on Census, NRF, Qualtrics and Baymard. */
const SQM_FCR_2026 = { publisher: "SQM Group", title: "First Call Resolution Benchmark: Measure, Benchmark, and Improve with AI (chart: FCR Benchmarking by Industry 2026)", year: 2026, url: "https://www.sqmgroup.com/resources/library/blog/fcr-metric-operating-philosophy" };
const SQM_KPI_2023 = { publisher: "SQM Group", title: "What Are the Industry Standards For the Top Call Center KPIs?", year: 2023, url: "https://www.sqmgroup.com/resources/library/blog/industry-standards-top-call-center-kpis" };
const SQM_FCR_2024 = { publisher: "SQM Group", title: "Call Center FCR Benchmark 2024 Results by Industry", year: 2025, url: "https://www.sqmgroup.com/resources/library/blog/call-center-fcr-benchmark-2024-results-by-industry" };
const NRF_2025 = { publisher: "National Retail Federation and Happy Returns", title: "Consumers Expected to Return Nearly $850 Billion in Merchandise in 2025 (2025 Retail Returns Landscape)", year: 2025, url: "https://nrf.com/media-center/press-releases/consumers-expected-to-return-nearly-850-billion-in-merchandise-in-2025" };
const NRF_POP = "358 ecommerce professionals at large US merchants (over $500 million in revenue), surveyed summer 2025";
const SQM_POP = "SQM's benchmarked North American inbound customer service call centers, measured by post-call survey";
const CHECKED = "2026-09-25";
const fact = (value, label, source, test) => ({ kind: "fact", value, label, source, checked: CHECKED, ...(test ? { test } : {}) });
const none = (label, reason, draft, test) => ({ kind: "none", label, reason, draft, ...(test ? { test } : {}) });
const assumption = (value, label, rationale, test) => ({ kind: "assumption", value, label, rationale, ...(test ? { test } : {}) });
const example = (value, label, rationale, text) => ({ kind: "example", value, label, rationale, text });
const NO_RETAIL = "No free public source publishes this metric for retail contact centers; the only public retail breakout (SQM Group) covers first contact resolution.";

const bench = {
  "retail.bench.fcr.retail": fact("77%", `First contact resolution, retail call centers, average (range 62% to 88%); ${SQM_POP}`, SQM_FCR_2026, "fcr"),
  "retail.bench.fcr.cross": fact("71%", `First contact resolution, all industries, average (range 40% to 91%); ${SQM_POP}`, SQM_FCR_2026, "fcr"),
  "retail.bench.csat.retail": none("Customer satisfaction, retail contact centers", `${NO_RETAIL} SQM's 2021 blog gave retail top-box Csat of 81% for its own clients; five years old, so not shown as current.`, "76%"),
  "retail.bench.csat.cross": fact("78%", `Customer satisfaction, all industries, share of customers very satisfied (top box); ${SQM_POP}`, SQM_KPI_2023),
  "retail.bench.aht.retail": none("Average handle time, retail contact centers", NO_RETAIL, "5:40", "aht"),
  "retail.bench.aht.cross": fact("11:37", "Average handle time (697 seconds, talk plus wrap), SQM's 2024 benchmarking participants, all industries", SQM_FCR_2024, "aht"),
  "retail.bench.abandon.retail": none("Abandon rate, retail contact centers", NO_RETAIL, "5%", "staffing"),
  "retail.bench.abandon.cross": fact("6%", "Abandon rate, SQM's stated call center industry standard, all industries", SQM_KPI_2023, "staffing"),
  "retail.bench.attrition.retail": none("Annual agent attrition, retail contact centers", `${NO_RETAIL} BLS JOLTS quits for retail trade cover every worker in stores and warehouses, not contact center agents.`, "42%", "attrition"),
  "retail.bench.attrition.cross": fact("34%", "Annual agent turnover, SQM's 2024 benchmarking participants, all industries", SQM_FCR_2024, "attrition"),
  "retail.bench.containment.retail": none("Self-service containment, retail contact centers", "No regulator, trade body or independent benchmark publishes self-service containment for retail; vendor figures describe their own customers.", "30%", "deflection"),
  "retail.bench.containment.cross": none("Self-service containment, all industries", "No independent public benchmark publishes self-service containment across industries; definitions differ by vendor.", "25%", "deflection"),
};

/* Stats strip: each read on the publisher's own page. */
const stats = {
  "retail.stat.ecom-share": fact("17.1%", "E-commerce share of total US retail sales, second quarter 2026, seasonally adjusted", { publisher: "US Census Bureau", title: "Quarterly Retail E-Commerce Sales, 2nd Quarter 2026 (CB26-133)", year: 2026, url: "https://www.census.gov/retail/ecommerce.html" }, "channel"),
  "retail.stat.cut-spend": fact("58%", "Share of bad online retail experiences after which consumers cut spending; Qualtrics XM Institute Q3 2025 survey of 20,001 consumers in 14 countries", { publisher: "Qualtrics XM Institute", title: "$3 Trillion is at risk due to bad customer experiences in 2026", year: 2025, url: "https://www.qualtrics.com/articles/customer-experience/3-trillion-risk-due-bad-customer-experiences-2026/" }),
  "retail.stat.cart": fact("70.22%", "Average documented online shopping cart abandonment rate, Baymard Institute's average of 50 published studies (list last updated September 2025)", { publisher: "Baymard Institute", title: "Cart Abandonment Rate Statistics", year: 2025, url: "https://baymard.com/lists/cart-abandonment-rate" }),
};

const SV = {
  "ecommerce-dtc":           { aht: "4:20", fcr: "78%", csat: "76%", containment: "35%" },
  "omnichannel-retail":      { aht: "5:50", fcr: "68%", csat: "74%", containment: "22%" },
  "subscription-membership": { aht: "6:10", fcr: "80%", csat: "72%", containment: "30%" },
  "marketplace":             { aht: "7:00", fcr: "60%", csat: "70%", containment: "28%" },
  "luxury-specialty":        { aht: "9:30", fcr: "85%", csat: "88%", containment: "8%" },
  "grocery-delivery":        { aht: "3:40", fcr: "82%", csat: "73%", containment: "42%" },
};
/* Research pass 2026-09-25: no free public source publishes these four metrics for any retail segment. SQM's retail FCR
 * covers retail call centers as a whole, not these segments; ACSI publishes 0 to 100 index scores. */
const SV_TEST = { aht: "aht", fcr: "fcr", containment: "deflection" };
const SV_LABEL = { aht: "Average handle time", fcr: "First contact resolution", csat: "Customer satisfaction", containment: "Self-service containment" };
const SV_REASON = {
  aht: "No regulator or trade body publishes handle time for this segment.",
  fcr: "No public source publishes first contact resolution for this segment; SQM Group's retail figure covers retail call centers as a whole.",
  csat: "No public CSAT percentage exists for this segment; ACSI publishes index scores on a 0 to 100 scale.",
  containment: "No regulator or trade body publishes self-service containment for this segment; vendor figures describe their own customers.",
};
const sv = {};
for (const [slug, kpis] of Object.entries(SV)) for (const [m, v] of Object.entries(kpis)) {
  sv[`retail.sv.${slug}.${m}`] = { kind: "none", label: `${SV_LABEL[m]}, ${slug.replace(/-/g, " ")} contact centers`, reason: SV_REASON[m], draft: v, ...(SV_TEST[m] ? { test: SV_TEST[m] } : {}) };
}

export default {
  ...bench,
  ...stats,
  ...sv,

  /* Returns, NRF and Happy Returns 2025 */
  "retail.returns.rate": fact("15.8%", `Share of annual sales retailers estimate will be returned in 2025 (about $849.9 billion); ${NRF_POP}`, NRF_2025),
  "retail.returns.online": fact("19.3%", `Share of online sales retailers estimate will be returned in 2025; ${NRF_POP}`, NRF_2025),
  "retail.returns.fraud": fact("9%", `Share of all returns that are fraudulent, as reported by retailers; ${NRF_POP}`, NRF_2025),
  "retail.returns.seasonal": fact("43%", `Retailers planning to hire seasonal staff to handle holiday returns and fraudulent activity, 2025; ${NRF_POP}`, NRF_2025, "staffing"),

  /* Regulation */
  "retail.ftc.mailorder": fact("30 days", "FTC Mail, Internet, or Telephone Order Merchandise Rule (16 CFR 435): with no shipment date stated, the seller must have a reasonable basis to ship within 30 days (50 days when the order includes a credit application), and must seek consent to any delay or refund", { publisher: "Federal Trade Commission", title: "Business Guide to the FTC's Mail, Internet, or Telephone Order Merchandise Rule (edited January 2025)", year: 2011, url: "https://www.ftc.gov/business-guidance/resources/business-guide-ftcs-mail-internet-or-telephone-order-merchandise-rule" }),
  "retail.ftc.clicktocancel": fact("vacated", "Status of the FTC's 2024 click-to-cancel amendments to the Negative Option Rule, as the FTC describes them in its March 2026 advance notice of proposed rulemaking, which asks whether to retain the current rule or adopt provisions of the vacated 2024 rule", { publisher: "Federal Trade Commission", title: "FTC Seeks Public Comment in Response to Advance Notice of Proposed Rulemaking Regarding Negative Option Marketing Practices", year: 2026, url: "https://www.ftc.gov/news-events/news/press-releases/2026/03/ftc-seeks-public-comment-response-advance-notice-proposed-rulemaking-regarding-negative-option" }),
  "retail.ftc.rosca": fact("simple mechanisms", "Restore Online Shoppers' Confidence Act, 15 U.S.C. 8403(3): an online seller of a negative option plan must provide simple mechanisms for a consumer to stop recurring charges", { publisher: "Federal Trade Commission", title: "Restore Online Shoppers' Confidence Act", year: 2010, url: "https://www.ftc.gov/legal-library/browse/statutes/restore-online-shoppers-confidence-act" }),

  /* Planning assumptions */
  "retail.peak.spike": assumption("3 to 5x", "Peak season contact volume against a normal month", "From practice; varies with promotion calendar and category. Not a published figure. Forecast from your own past peaks.", "forecast"),
  "retail.lux.book": assumption("50 to 150 clients", "Client book per advisor for named-advisor luxury service", "From practice; depends on client value and contact frequency. Not a published figure. Size books from your own advisor workload.", "staffing"),
  "retail.mkt.dispute": assumption("48 hours, 24 hours and 72 hours", "Evidence window, review target and total resolution target for marketplace disputes", "A design choice that keeps disputes moving; set your own against your dispute data."),

  /* Worked examples */
  "retail.ex.churn-drivers": example("8%, 40%, 25%, 20% and 15%", "Illustrative churn rate and churn driver split", "A scenario showing why the driver split matters more than the rate; not measured.", "'Our churn rate is 8%' is less useful than '40% churn for price, 25% for product fatigue, 20% for poor service, 15% for life change.'"),
  "retail.ex.save-offer": example("10%, $2,000 and $200", "Illustrative save offers and customer lifetime values", "A scenario; set offer tiers from your own LTV and churn data.", "Many retention teams can offer only a small fixed discount (say 10%) or one free month, when the save offer for a $2,000 LTV customer should differ from a $200 LTV customer."),
  "retail.ex.lux-basket": example("$5,000 and $50", "Illustrative luxury and mass market purchase values", "Contrasts two purchase values; not a measured figure.", "A $5,000 handbag buyer expects a different experience from a $50 t-shirt buyer."),
  "retail.ex.lux-call": example("15 minutes, $3,000 and 3 minutes", "Illustrative luxury call length and purchase value", "A scenario showing why handle time is the wrong target in luxury; not measured.", "a 15-minute call that ends in a $3,000 purchase is worth more than five 3-minute calls that end in nothing."),
  "retail.ex.lux-bot": example("$6 and $50,000", "Illustrative agent cost saved against client lifetime value at risk", "A scenario; price your own contact cost in the Cost Per Contact tool.", "A bot that deflects a client's call about a repair saves perhaps $6 in agent cost and puts a $50,000 lifetime relationship at risk."),
  "retail.ex.lux-repair": example("$25,000 and $200", "Illustrative repair item values", "Contrasts two service tiers; not measured.", "A repair request for a $25,000 watch and one for a $200 pair of shoes need different handling"),
};
