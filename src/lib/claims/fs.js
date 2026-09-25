/* Financial services claims. See src/lib/claims.js for the kinds. `draft` holds the figure the page printed before the
 * scan, for lineage; it never renders.
 *
 * Research pass 2026-09-25. The pre-scan benchmark table printed four columns (financial services, cross-industry, top
 * quartile, why it differs) of unsourced figures. The top quartile column is gone (no public source for any cell). Two
 * financial services figures are published by SQM Group (its "Financial" category: first contact resolution 2026 and
 * top-box Csat 2021); the page's 79% CSAT contradicted SQM's 75%. The abandon cell now carries Capgemini's bank
 * employee survey figures for retail banks. The stats strip's Capgemini figure was re-read in the report PDF itself.
 * Regulatory figures were read on eCFR, FINRA, SEC and the California, Texas and Florida official code pages; two state
 * claim acknowledgment limits on the page were wrong (Texas is 15 days, Florida is now 7 calendar days). */
const SQM_FCR_2026 = { publisher: "SQM Group", title: "First Call Resolution Benchmark: Measure, Benchmark, and Improve with AI (chart: FCR Benchmarking by Industry 2026)", year: 2026, url: "https://www.sqmgroup.com/resources/library/blog/fcr-metric-operating-philosophy" };
const SQM_CSAT_2021 = { publisher: "SQM Group", title: "First Call Resolution and Customer Satisfaction Comparison by Industry and Call Reason", year: 2021, url: "https://www.sqmgroup.com/resources/library/blog/fcr-customer-satisfaction-comparison-industry-and-call-reason" };
const SQM_KPI_2023 = { publisher: "SQM Group", title: "What Are the Industry Standards For the Top Call Center KPIs?", year: 2023, url: "https://www.sqmgroup.com/resources/library/blog/industry-standards-top-call-center-kpis" };
const SQM_FCR_2024 = { publisher: "SQM Group", title: "Call Center FCR Benchmark 2024 Results by Industry", year: 2025, url: "https://www.sqmgroup.com/resources/library/blog/call-center-fcr-benchmark-2024-results-by-industry" };
const CAPGEMINI_WRBR = { publisher: "Capgemini Research Institute", title: "World Retail Banking Report 2024 (page 29)", year: 2024, url: "https://www.capgemini.com/wp-content/uploads/2024/03/WRBR_2024_web.pdf" };
const SQM_POP = "SQM's benchmarked North American inbound customer service call centers, measured by post-call survey";
const CAP_POP = "Capgemini's 2024 survey of 1,500 retail banking employees in 14 markets";
const CHECKED = "2026-09-25";
const fact = (value, label, source, test) => ({ kind: "fact", value, label, source, checked: CHECKED, ...(test ? { test } : {}) });
const none = (label, reason, draft, test) => ({ kind: "none", label, reason, draft, ...(test ? { test } : {}) });
const assumption = (value, label, rationale, test) => ({ kind: "assumption", value, label, rationale, ...(test ? { test } : {}) });
const example = (value, label, rationale, text) => ({ kind: "example", value, label, rationale, text });
const NO_FS = "No free public source publishes this metric for financial services contact centers; the public breakouts (SQM Group, Capgemini) cover first contact resolution, top-box Csat and bank abandon rates.";

const bench = {
  "fs.bench.csat.fs": fact("75%", `Customer satisfaction, SQM's "Financial" call centers, share of customers very satisfied (top box), 2021; ${SQM_POP}`, SQM_CSAT_2021),
  "fs.bench.csat.cross": fact("78%", `Customer satisfaction, all industries, share of customers very satisfied (top box), 2023; ${SQM_POP}`, SQM_KPI_2023),
  "fs.bench.fcr.fs": fact("70%", `First contact resolution, SQM's "Financial" call centers, average (range 53% to 90%); ${SQM_POP}`, SQM_FCR_2026, "fcr"),
  "fs.bench.fcr.cross": fact("71%", `First contact resolution, all industries, average (range 40% to 91%); ${SQM_POP}`, SQM_FCR_2026, "fcr"),
  "fs.bench.aht.fs": none("Average handle time, financial services contact centers", NO_FS, "6:40", "aht"),
  "fs.bench.aht.cross": fact("11:37", "Average handle time (697 seconds, talk plus wrap), SQM's 2024 benchmarking participants, all industries", SQM_FCR_2024, "aht"),
  "fs.bench.abandon.fs": fact("12% (Tier I) and nearly 18% (Tier II)", `Call abandonment at retail banks, Tier I and Tier II banks globally; ${CAP_POP}`, CAPGEMINI_WRBR, "staffing"),
  "fs.bench.abandon.cross": fact("6%", "Abandon rate, SQM's stated call center industry standard, all industries", SQM_KPI_2023, "staffing"),
  "fs.bench.attrition.fs": none("Annual agent attrition, financial services contact centers", `${NO_FS} BLS JOLTS quits for finance and insurance cover every worker in the sector, not contact center agents.`, "28%", "attrition"),
  "fs.bench.attrition.cross": fact("34%", "Annual agent turnover, SQM's 2024 benchmarking participants, all industries", SQM_FCR_2024, "attrition"),
  "fs.bench.containment.fs": none("Self-service containment, financial services contact centers", "No regulator, trade body or independent benchmark publishes self-service containment for financial services; vendor figures describe their own customers.", "20%", "deflection"),
  "fs.bench.containment.cross": none("Self-service containment, all industries", "No independent public benchmark publishes self-service containment across industries; definitions differ by vendor.", "25%", "deflection"),
};

const stats = {
  "fs.stat.fcr-below-70": fact("55%", `Share of banks globally reporting first contact resolution below 70% (53% of Tier I, 58% of Tier II); ${CAP_POP}`, CAPGEMINI_WRBR, "fcr"),
};

/* Sub-page KPI tiles. Research pass 2026-09-25: no free public source publishes these metrics for any financial
 * services segment except SQM Group's "Insurance" category (FCR 2026, top-box Csat 2021), reported separately from
 * health insurance. `draft` keeps the figure the page printed before, for lineage; it never renders. */
const SV = {
  "retail-banking":      { aht: "5:40", fcr: "72%", csat: "79%", containment: "28%" },
  "credit-unions":       { aht: "6:20", fcr: "75%", csat: "84%", containment: "18%" },
  "insurance":           { aht: "9:00", fcr: "65%", csat: "77%", containment: "12%" },
  "wealth-management":   { aht: "11:00", fcr: "78%", csat: "85%", containment: "8%" },
  "lending-mortgage":    { aht: "8:30", fcr: "58%", csat: "74%", containment: "15%" },
  "fintech-neobanks":    { aht: "4:00", fcr: "78%", csat: "82%", containment: "40%" },
  "payments-processing": { aht: "7:30", fcr: "70%", csat: "76%", containment: "22%" },
};
const SV_TEST = { aht: "aht", fcr: "fcr", containment: "deflection" };
const SV_LABEL = { aht: "Average handle time", fcr: "First contact resolution", csat: "Customer satisfaction", containment: "Self-service containment" };
const SV_REASON = {
  aht: "No regulator or trade body publishes handle time for this segment.",
  fcr: "No regulator or trade body publishes first contact resolution for this segment; SQM Group's \"Financial\" figure covers its financial clients as one group.",
  csat: "No public CSAT percentage exists for this segment; ACSI and J.D. Power publish index scores on other scales.",
  containment: "No regulator or trade body publishes self-service containment for this segment.",
};
const sv = {};
for (const [slug, kpis] of Object.entries(SV)) for (const [m, v] of Object.entries(kpis)) {
  sv[`fs.sv.${slug}.${m}`] = { kind: "none", label: `${SV_LABEL[m]}, ${slug.replace(/-/g, " ")} contact centers`, reason: SV_REASON[m], draft: v, ...(SV_TEST[m] ? { test: SV_TEST[m] } : {}) };
}
sv["fs.sv.insurance.fcr"] = { ...fact("75%", `First contact resolution, SQM's "Insurance" call centers (reported separately from health insurance), average (range 69% to 80%); ${SQM_POP}`, SQM_FCR_2026, "fcr"), draft: "65%" };
sv["fs.sv.insurance.csat"] = { ...fact("80%", `Customer satisfaction, SQM's "Insurance" call centers, share of customers very satisfied (top box), 2021; ${SQM_POP}`, SQM_CSAT_2021), draft: "77%" };

const ECFR12 = (part, section, title, sub) => ({ publisher: "CFPB, eCFR", title: `12 CFR ${section}, ${title}`, year: 2026, url: `https://www.ecfr.gov/current/title-12/chapter-X/part-${part}/${sub}/section-${section}` });

const rules = {
  "fs.rege.investigate": fact("10 business days", "Regulation E: time a financial institution has to determine whether an electronic fund transfer error occurred, from receiving the notice of error (12 CFR 1005.11(c)(1)); 20 business days for a new account", ECFR12(1005, "1005.11", "Procedures for resolving errors", "subpart-A")),
  "fs.rege.extended": fact("45 days", "Regulation E: longer investigation period allowed if the institution provisionally credits the account within 10 business days (12 CFR 1005.11(c)(2)); 90 days for new accounts, point of sale and foreign transfers", ECFR12(1005, "1005.11", "Procedures for resolving errors", "subpart-A")),
  "fs.regz.apr": fact("an annual percentage rate", "Regulation Z: an advertisement that states a rate of finance charge must state it as an annual percentage rate, using that term (12 CFR 1026.24(c))", ECFR12(1026, "1026.24", "Advertising", "subpart-C")),
  "fs.respa.transfer": fact("15 days", "RESPA (Regulation X): the transferor servicer must send the borrower a notice of servicing transfer not less than 15 days before the transfer takes effect (12 CFR 1024.33(b)(3))", ECFR12(1024, "1024.33", "Mortgage servicing transfers", "subpart-C")),
  "fs.finra.acat.validate": fact("one business day", "FINRA Rule 11870(b)(1): the carrying member validates or takes exception to a customer account transfer instruction within one business day", { publisher: "FINRA", title: "Rule 11870, Customer Account Transfer Contracts", year: 2026, url: "https://www.finra.org/rules-guidance/rulebooks/finra-rules/11870" }),
  "fs.finra.acat.complete": fact("three business days", "FINRA Rule 11870(e): the carrying member completes the account transfer within three business days following validation", { publisher: "FINRA", title: "Rule 11870, Customer Account Transfer Contracts", year: 2026, url: "https://www.finra.org/rules-guidance/rulebooks/finra-rules/11870" }),
  "fs.sec.offchannel": fact("more than $2 billion", "SEC recordkeeping (off-channel communications) initiative, penalties since December 2021 against more than 100 firms, as of the fiscal 2024 enforcement results", { publisher: "U.S. Securities and Exchange Commission", title: "SEC Announces Enforcement Results for Fiscal Year 2024 (press release 2024-186)", year: 2024, url: "https://www.sec.gov/newsroom/press-releases/2024-186" }),
  "fs.ins.ack.ca": fact("15 calendar days", "California: an insurer acknowledges a notice of claim immediately and in no event more than 15 calendar days after receiving it (10 CCR 2695.5(e)(1), Fair Claims Settlement Practices Regulations)", { publisher: "California Code of Regulations (official, via California Department of Insurance)", title: "10 CCR 2695.5, Duties upon Receipt of Communications", year: 2026, url: "https://govt.westlaw.com/calregs/Document/IE63146575C2F11EC9C68000D3A7C4BC3" }),
  "fs.ins.ack.tx": fact("15 days", "Texas: an insurer acknowledges receipt of a first-party claim not later than the 15th day after receiving written notice (30th business day for an eligible surplus lines insurer) (Texas Insurance Code 542.055(a))", { publisher: "Texas Legislature", title: "Texas Insurance Code, Chapter 542, Sec. 542.055", year: 2026, url: "https://statutes.capitol.texas.gov/Docs/IN/htm/IN.542.htm" }),
  "fs.ins.ack.fl": fact("7 calendar days", "Florida: an insurer reviews and acknowledges a communication about a claim within 7 calendar days (Florida Statutes 627.70131(1)(a), 2026 edition)", { publisher: "The Florida Legislature", title: "The 2026 Florida Statutes, 627.70131", year: 2026, url: "https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.70131.html" }),
};

const vendor = {
  "fs.pindrop.aht": fact("about 45 seconds", "Vendor-stated: handle time Pindrop says its Passport authentication saves per call, on average, by removing up to four knowledge-based questions and verifying in the IVR", { publisher: "Pindrop", title: "Pindrop Passport (product page)", year: 2026, url: "https://www.pindrop.com/product/pindrop-passport/" }, "aht"),
};

const practice = {
  "fs.auth.time": assumption("45 to 90 seconds", "Time identity verification adds to an interaction in a regulated financial services contact center", "From practice; depends on the number of knowledge-based questions and the channel. Not a published figure. Time your own authentication step.", "aht"),
  "fs.iva.integration": assumption("3 to 6 months", "Custom integration of a conversational AI platform with a core banking API", "From practice; depends on the core, its API layer and the number of intents. Not a published figure."),
  "fs.vb.ramp": assumption("6 to 12 month", "Voice biometrics enrollment ramp before most repeat callers are enrolled", "From practice; depends on call frequency per customer and on whether enrollment is passive. Track your own enrollment rate.", "aht"),
  "fs.cu.containment": assumption("15 to 25%", "Self-service containment target for a credit union", "From practice; a relationship-led membership keeps more contacts with people. Not a published figure.", "deflection"),
  "fs.wm.advisor.away": assumption("40 to 60%", "Share of client calls placed when the named advisor is unavailable (meetings, time off, after hours)", "From practice; not a published figure. Measure the share of named-advisor calls that reach backup routing.", "staffing"),
  "fs.mtg.cycle": assumption("45 to 90 days", "Mortgage journey from application to closing", "From practice; varies with loan type and market volume. Not a published figure. Measure your own application to close interval.", "fcr"),
};

const examples = {
  "fs.ex.fintech-dropoff": example("5% and 60%", "Illustrative onboarding drop-off and support contact share", "A worked scenario; measure your own drop-off and the share of those users who contact support.", "product sees a 5% drop-off at identity verification but does not know that 60% of those users contact support."),
};

export default { ...bench, ...stats, ...sv, ...rules, ...vendor, ...practice, ...examples };
