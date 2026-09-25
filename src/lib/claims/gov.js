/* Government and Public Sector claims. See src/lib/claims.js for the kinds. `draft` holds the figure the page printed
 * before the scan, for lineage; it never renders.
 *
 * Research pass 2026-09-25. The pre-scan table printed four columns of unsourced figures (government, cross-industry,
 * top quartile); its government CSAT was the ACSI federal score (0 to 100 index) set beside SQM's top box percentage.
 * The top quartile column is gone (no public source for any cell). Published government contact center figures found:
 * SQM Group's government FCR (2026 chart), ACSI's federal call center satisfaction index (FY2025), MACPAC's summary of
 * state Medicaid and CHIP call center data during the unwinding, and NENA's 911 call answering standard.
 * theacsi.org and theacsi.com refuse every fetch (403); the ACSI figures were read in ACSI's own study PDF, which the
 * publisher's site does not serve to us, at the copy FedScoop hosts. */
const SQM_FCR_2026 = { publisher: "SQM Group", title: "First Call Resolution Benchmark: Measure, Benchmark, and Improve with AI (chart: FCR Benchmarking by Industry 2026)", year: 2026, url: "https://www.sqmgroup.com/resources/library/blog/fcr-metric-operating-philosophy" };
const SQM_KPI_2023 = { publisher: "SQM Group", title: "What Are the Industry Standards For the Top Call Center KPIs?", year: 2023, url: "https://www.sqmgroup.com/resources/library/blog/industry-standards-top-call-center-kpis" };
const SQM_FCR_2024 = { publisher: "SQM Group", title: "Call Center FCR Benchmark 2024 Results by Industry", year: 2025, url: "https://www.sqmgroup.com/resources/library/blog/call-center-fcr-benchmark-2024-results-by-industry" };
const SQM_POP = "SQM's benchmarked North American inbound customer service call centers, measured by post-call survey";
const ACSI_2025 = { publisher: "American Customer Satisfaction Index (ACSI)", title: "ACSI Federal Government Study 2025 (study PDF, copy hosted by FedScoop)", year: 2025, url: "https://fedscoop.com/wp-content/uploads/sites/5/2025/11/25nov_Federal-Government-STUDY_FINAL.pdf" };
const ACSI_POP = "0 to 100 scale; 6,914 surveys of recent users of federal services across fiscal year 2025";
const MACPAC_2024 = { publisher: "MACPAC (Medicaid and CHIP Payment and Access Commission)", title: "State Reported Medicaid Unwinding Data (issue brief)", year: 2024, url: "https://www.macpac.gov/wp-content/uploads/2024/11/State-Reported-Medicaid-Unwinding-Data-Brief.pdf" };
const MACPAC_POP = "state Medicaid and CHIP agencies, national figures from state reports to CMS, April 2023 to June 2024";
const NENA_020 = { publisher: "NENA (National Emergency Number Association)", title: "NENA Standard for 9-1-1 Call Processing, NENA-STA-020.1-2020, section 2.2.1", year: 2020, url: "https://cdn.ymaws.com/www.nena.org/resource/resmgr/standards/nena-sta-020.1-2020_911_call.pdf" };
const IRS_NTA = { publisher: "IRS Newsroom (National Taxpayer Advocate)", title: "National Taxpayer Advocate delivers Annual Report to Congress; finds taxpayer service was strong in 2025", year: 2026, url: "https://www.irs.gov/newsroom/national-taxpayer-advocate-delivers-annual-report-to-congress-finds-taxpayer-service-was-strong-in-2025-but-foresees-challenges-for-taxpayers-who-encounter-problems-in-2026" };
const fact = (value, label, source, test) => ({ kind: "fact", value, label, source, checked: "2026-09-25", ...(test ? { test } : {}) });
const none = (label, reason, draft, test) => ({ kind: "none", label, reason, draft, ...(test ? { test } : {}) });
const assume = (value, label, rationale, test) => ({ kind: "assumption", value, label, rationale, ...(test ? { test } : {}) });
const example = (value, label, rationale, text) => ({ kind: "example", value, label, rationale, text });
const NO_GOV = "No free public source publishes this metric for government contact centers.";

const bench = {
  "gov.bench.csat.gov": fact("65", `ACSI call center satisfaction index, federal government services, fiscal year 2025 (up 5% from 2024; websites 72); ${ACSI_POP}. An index score, on a different scale from a top box percentage`, ACSI_2025),
  "gov.bench.csat.cross": fact("78%", `Customer satisfaction, all industries, share of customers very satisfied (top box); ${SQM_POP}`, SQM_KPI_2023),
  "gov.bench.fcr.gov": fact("70%", `First contact resolution, government call centers, average (range 40% to 79%); ${SQM_POP}`, SQM_FCR_2026, "fcr"),
  "gov.bench.fcr.cross": fact("71%", `First contact resolution, all industries, average (range 40% to 91%); ${SQM_POP}`, SQM_FCR_2026, "fcr"),
  "gov.bench.aht.gov": none("Average handle time, government contact centers", `${NO_GOV} MACPAC's Medicaid call center summary reports wait time and abandonment, not handle time.`, "9:00", "aht"),
  "gov.bench.aht.cross": fact("11:37", "Average handle time (697 seconds, talk plus wrap), SQM's 2024 benchmarking participants, all industries", SQM_FCR_2024, "aht"),
  "gov.bench.abandon.gov": fact("17.7% at peak", `Call abandonment, national average at its January 2024 peak, during the Medicaid unwinding; 20 states reported peaks over 30%; ${MACPAC_POP}. A surge peak, not a typical month`, MACPAC_2024, "staffing"),
  "gov.bench.abandon.cross": fact("6%", "Abandon rate, SQM's stated call center industry standard, all industries", SQM_KPI_2023, "staffing"),
  "gov.bench.attrition.gov": none("Annual agent attrition, government contact centers", `${NO_GOV} BLS JOLTS quits for government cover every public employee, not contact center agents.`, "25%", "attrition"),
  "gov.bench.attrition.cross": fact("34%", "Annual agent turnover, SQM's 2024 benchmarking participants, all industries", SQM_FCR_2024, "attrition"),
};

/* Sub-page tiles. Research pass 2026-09-25: no public source publishes these metrics for any government segment except
 * the three published figures carried on the sub-pages as measures (ACSI federal, MACPAC Medicaid, NENA standard).
 * `draft` keeps the figure the page printed before, for lineage; it never renders. */
const SV = {
  "federal":         { aht: "10:00", fcr: "50%", csat: "69.7", containment: "22%" },
  "state":           { aht: "8:30", fcr: "52%", csat: "65", containment: "20%" },
  "local-municipal": { aht: "5:00", fcr: "60%", csat: "72", containment: "25%" },
  "courts-justice":  { aht: "6:00", fcr: "58%", csat: "68", containment: "20%" },
  "social-services": { aht: "12:00", fcr: "42%", csat: "62", containment: "12%" },
  "public-safety":   { answer: "10 sec", dispatch: "60 sec", abandon: "2%", accuracy: "99%+" },
};
const SV_TEST = { aht: "aht", fcr: "fcr", containment: "deflection", answer: "staffing", abandon: "staffing" };
const SV_LABEL = { aht: "Average handle time", fcr: "First contact resolution", csat: "Customer satisfaction", containment: "Self-service containment", answer: "Average 911 answer time", dispatch: "Call processing time, answer to dispatch", abandon: "911 call abandonment", accuracy: "Address and call type accuracy" };
const SV_REASON = {
  aht: "No regulator or trade body publishes handle time for this segment.",
  fcr: "No regulator or trade body publishes first contact resolution for this segment; SQM's government figure covers its government participants as a whole.",
  csat: "No public satisfaction figure exists for this segment's contact centers; ACSI publishes federal agency index scores, carried as a measure on the federal page.",
  containment: "No regulator or trade body publishes self-service containment for this segment.",
  answer: "No national average is published; NENA publishes the answering standard, shown as a measure on this page, and each PSAP reports its own.",
  dispatch: "No national average is published; NFPA and NENA set processing standards that vary by call type.",
  abandon: "No national average is published for 911 abandonment.",
  accuracy: "No national average is published for address or call type accuracy.",
};
const SV_NAME = { "local-municipal": "local and municipal", "courts-justice": "courts and justice", "social-services": "social services", "public-safety": "public safety and 911" };
const sv = {};
for (const [slug, kpis] of Object.entries(SV)) for (const [m, v] of Object.entries(kpis)) {
  sv[`gov.sv.${slug}.${m}`] = { kind: "none", label: `${SV_LABEL[m]}, ${SV_NAME[slug] || slug} contact centers`, reason: SV_REASON[m], draft: v, ...(SV_TEST[m] ? { test: SV_TEST[m] } : {}) };
}

export default {
  ...bench,
  ...sv,

  /* Stats strip and sub-page measures. */
  "gov.acsi.federal": fact("70.4", `ACSI citizen satisfaction with federal government services, fiscal year 2025, a 19-year high; ${ACSI_POP}`, ACSI_2025),
  "gov.irs.calls": fact("over 100 million", "Calls taxpayers made to the IRS in 2025", IRS_NTA),
  "gov.irs.voicebot": fact("about 35 million", "Calls the IRS routed to its new voicebots in 2025", IRS_NTA, "deflection"),
  "gov.medicaid.volume": fact("7.1 million to 10.9 million", `Monthly call center volume, April to August 2023, peaking at almost 11 million in January 2024; ${MACPAC_POP}`, MACPAC_2024, "forecast"),
  "gov.medicaid.wait": fact("over 13 minutes", `Average call center wait time, national figure at its January 2024 peak; state peaks ranged from 1 to 72 minutes; ${MACPAC_POP}`, MACPAC_2024, "staffing"),
  "gov.medicaid.terminated": fact("20.7 million", `People whose Medicaid or CHIP coverage was terminated at renewal; ${MACPAC_POP}`, MACPAC_2024),
  "gov.medicaid.procedural": fact("68.7%", `Share of unwinding terminations made for a procedural reason, such as no response to a renewal notice; ${MACPAC_POP}`, MACPAC_2024),
  "gov.nena.answer": fact("90% within 15 seconds", "NENA 911 answering standard: 90% of calls arriving at the PSAP shall be answered within 15 seconds, and 95% should be answered within 20 seconds", NENA_020, "staffing"),

  /* Regulatory and published research. */
  "gov.508.wcag": fact("WCAG 2.0 Level AA", "Section 508 standard for federal electronic content: Level A and AA success criteria of WCAG 2.0 (36 CFR 1194, Appendix A, E205.4)", { publisher: "U.S. Access Board, eCFR", title: "36 CFR Part 1194, Information and Communication Technology Standards and Guidelines", year: 2026, url: "https://www.ecfr.gov/current/title-36/chapter-XI/part-1194" }),
  "gov.ada.wcag": fact("WCAG 2.1 Level AA", "ADA Title II web and mobile app standard for state and local governments (28 CFR 35.200)", { publisher: "U.S. Department of Justice, eCFR", title: "28 CFR 35.200, Requirements for web and mobile accessibility", year: 2026, url: "https://www.ecfr.gov/current/title-28/chapter-I/part-35/subpart-H/section-35.200" }),
  "gov.ada.date": fact("April 26, 2027", "ADA Title II compliance date for public entities of 50,000 people or more; smaller entities and special districts follow on April 26, 2028 (28 CFR 35.200(b), as amended April 2026)", { publisher: "U.S. Department of Justice, eCFR", title: "28 CFR 35.200, Requirements for web and mobile accessibility", year: 2026, url: "https://www.ecfr.gov/current/title-28/chapter-I/part-35/subpart-H/section-35.200" }),
  "gov.ui.surge": fact("about 30 times", "Weekly initial unemployment insurance claims, week ending April 4, 2020 (6,161,268) against the week ending March 7, 2020 (199,914), national, not seasonally adjusted", { publisher: "U.S. Department of Labor, Employment and Training Administration", title: "Unemployment Insurance Weekly Claims Data (report r539cy, national, 2020)", year: 2020, url: "https://oui.doleta.gov/unemploy/claims.asp" }, "forecast"),
  "gov.ui.fraud": fact("$100 billion to $135 billion", "Estimated fraud in unemployment insurance programs during the COVID-19 pandemic, April 2020 to May 2023, about 11% to 15% of benefits paid", { publisher: "U.S. Government Accountability Office", title: "Unemployment Insurance: Estimated Amount of Fraud during Pandemic Likely Between $100 Billion and $135 Billion (GAO-23-106696)", year: 2023, url: "https://www.gao.gov/products/gao-23-106696" }),
  "gov.legacy.age": fact("8 to 51 years old", "Age of the ten federal legacy systems GAO judged most in need of modernization, at ten agencies including the Social Security Administration and the Treasury", { publisher: "U.S. Government Accountability Office", title: "Information Technology: Agencies Need to Develop Modernization Plans for Critical Legacy Systems (GAO-19-471)", year: 2019, url: "https://www.gao.gov/products/gao-19-471" }),
  "gov.fta.nudges": fact("13 to 21%", "Reduction in failures to appear for low-level offenses from a redesigned summons form and text message reminders, two field studies in New York City", { publisher: "Science (Fishbane, Ouss and Shah)", title: "Behavioral nudges reduce failure to appear for court", year: 2020, url: "https://pubmed.ncbi.nlm.nih.gov/33033154/" }),
  "gov.fta.warrants": fact("30,000 fewer arrest warrants over three years", "Arrest warrants avoided by the same two interventions in New York City", { publisher: "Science (Fishbane, Ouss and Shah)", title: "Behavioral nudges reduce failure to appear for court", year: 2020, url: "https://pubmed.ncbi.nlm.nih.gov/33033154/" }),

  /* Planning assumptions. */
  "gov.interp.handoff": assume("2 to 3 minutes", "Time an over-the-phone interpreter connection adds to a call", "From practice; interpreter vendors and agencies publish no neutral figure. Time interpreted calls against the same call types handled in English.", "aht"),
  "gov.fedramp.time": assume("6 to 18 months", "Time a vendor typically spends reaching FedRAMP authorization", "From practice under the agency authorization path; FedRAMP publishes no average and its 20x program aims to shorten it. Ask each vendor for its dated status in the FedRAMP Marketplace."),
  "gov.transfer.cut": assume("20 to 30%", "Share of transfers a statewide front door that classifies intent can remove", "From practice; no public before and after figure exists. Count your cross-agency transfers before and after.", "fcr"),
  "gov.intake.loss": assume("15 to 20%", "Eligible applicants lost at each added application form or verification step", "From practice; no public per-step figure for benefits applications. Measure completion at each step of your own application.", "channel"),
  "gov.court.reminder.timing": assume("7 days and 1 day", "When to send court date reminders ahead of an appearance", "A design choice that gives a week to arrange time off and a final prompt the day before. Set your own schedule and measure appearance rates."),

  /* Worked examples. */
  "gov.ex.pending": example("6 months", "Illustrative pending application", "Shows the gap between interaction and outcome satisfaction.", "A citizen who reaches an agent quickly, is treated politely, and is told the application is still pending after 6 months will rate the call well and the service poorly."),
  "gov.ex.transfer": example("45 minutes", "Illustrative cross-agency transfer chain", "A scenario, not a measured journey.", "A citizen calls about unemployment, is transferred to the tax department, then to workforce development, and reaches unemployment 45 minutes later."),
  "gov.ex.311closure": example("500, 400 and 200", "Illustrative 311 closure counts", "Shows why closure codes need auditing.", "A city receives 500 pothole reports and closes 400 service requests, then finds that 200 of those closures were coded 'unable to locate' or 'no action required.'"),
  "gov.ex.equity": example("3 days and 14 days", "Illustrative gap in repair times between neighborhoods", "A scenario, not a measured gap.", "If potholes on the west side are filled in 3 days and the east side waits 14 days, the contact center data has surfaced a policy problem."),
  "gov.ex.court-sms": example("Tuesday, March 15 at 9:00 AM", "Illustrative court reminder text", "Shows the specific details a reminder should carry.", "'You have a court appearance on Tuesday, March 15 at 9:00 AM in Room 301.'"),
  "gov.ex.protective": example("5 to 7 business days", "Illustrative standard response time applied to a protective order", "Shows why protective orders need an expedited path.", "An applicant for a protective order told they will hear back in 5 to 7 business days may be in danger tonight."),
};
