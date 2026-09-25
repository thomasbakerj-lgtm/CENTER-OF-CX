/* Education claims. See src/lib/claims.js for the kinds. `draft` holds the figure the page printed before the scan; it
 * never renders.
 *
 * Research pass 2026-09-25. The pre-scan table printed three columns (education, cross-industry, top quartile) of
 * unsourced figures. No free public source publishes contact center metrics for education or university service
 * centers, and SQM Group's industry breakouts do not include education. The education column is "No public benchmark";
 * the all-industry column is SQM Group, each labelled with what it measures; the top quartile column is gone. The
 * Digital Adoption row is retired (no source for either cell). The hero's "72% of students who don't re-enroll cite
 * customer service" traces to a consultant's figure (Neal Raisman), printed as 72%, 76% and 78% in different places
 * with no published method; the Educational Policy Institute paper that repeats it (2017) surveyed campus staff
 * (N=29), not students. Retired. */
const SQM_FCR_2026 = { publisher: "SQM Group", title: "First Call Resolution Benchmark: Measure, Benchmark, and Improve with AI (chart: FCR Benchmarking by Industry 2026)", year: 2026, url: "https://www.sqmgroup.com/resources/library/blog/fcr-metric-operating-philosophy" };
const SQM_KPI_2023 = { publisher: "SQM Group", title: "What Are the Industry Standards For the Top Call Center KPIs?", year: 2023, url: "https://www.sqmgroup.com/resources/library/blog/industry-standards-top-call-center-kpis" };
const SQM_FCR_2024 = { publisher: "SQM Group", title: "Call Center FCR Benchmark 2024 Results by Industry", year: 2025, url: "https://www.sqmgroup.com/resources/library/blog/call-center-fcr-benchmark-2024-results-by-industry" };
const SQM_POP = "SQM's benchmarked North American inbound customer service call centers, measured by post-call survey";
const NSC_FALL = { publisher: "National Student Clearinghouse Research Center", title: "Final Fall Enrollment Trends 2025", year: 2026, url: "https://nscresearchcenter.org/final-fall-enrollment-trends/" };
const NSC_PR = { publisher: "National Student Clearinghouse Research Center", title: "Persistence and Retention: Fall 2024 Beginning Postsecondary Student Cohort", year: 2026, url: "https://nscresearchcenter.org/persistence-retention/" };
const ecfr = (section, title, path) => ({ publisher: "U.S. Department of Education, eCFR", title: `34 CFR ${section}, ${title}`, year: 2026, url: `https://www.ecfr.gov/current/title-34/${path}` });
const FERPA_PATH = "subtitle-A/part-99";
const T4_PATH = "subtitle-B/chapter-VI/part-668/subpart-F";
const fact = (value, label, source, test) => ({ kind: "fact", value, label, source, checked: "2026-09-25", ...(test ? { test } : {}) });
const none = (label, reason, draft, test) => ({ kind: "none", label, reason, draft, ...(test ? { test } : {}) });
const NO_EDU = "No free public source publishes this metric for education contact centers or university service centers; SQM Group's industry breakouts do not include education.";

const bench = {
  "edu.bench.csat.edu": none("Customer satisfaction, education contact centers", NO_EDU, "72%"),
  "edu.bench.csat.cross": fact("78%", `Customer satisfaction, all industries, share of customers very satisfied (top box); ${SQM_POP}`, SQM_KPI_2023),
  "edu.bench.fcr.edu": none("First contact resolution, education contact centers", NO_EDU, "55%", "fcr"),
  "edu.bench.fcr.cross": fact("71%", `First contact resolution, all industries, average (range 40% to 91%); ${SQM_POP}`, SQM_FCR_2026, "fcr"),
  "edu.bench.aht.edu": none("Average handle time, education contact centers", NO_EDU, "7:00", "aht"),
  "edu.bench.aht.cross": fact("11:37", "Average handle time (697 seconds, talk plus wrap), SQM's 2024 benchmarking participants, all industries", SQM_FCR_2024, "aht"),
  "edu.bench.abandon.edu": none("Abandon rate, education contact centers", NO_EDU, "15%", "staffing"),
  "edu.bench.abandon.cross": fact("6%", "Abandon rate, SQM's stated call center industry standard, all industries", SQM_KPI_2023, "staffing"),
  "edu.bench.attrition.edu": none("Annual agent attrition, education contact centers", `${NO_EDU} BLS JOLTS quits for educational services cover every worker in the sector, not service staff.`, "35%", "attrition"),
  "edu.bench.attrition.cross": fact("34%", "Annual agent turnover, SQM's 2024 benchmarking participants, all industries", SQM_FCR_2024, "attrition"),
};

/* Sub-page tiles. Research pass 2026-09-25: no regulator, trade body or free public benchmark publishes handle time,
 * first contact resolution, CSAT, containment, abandonment or speed to lead for any of these service areas. The one
 * published tile is the undergraduate yield rate (NACAC's analysis of IPEDS data); the page printed 35%, the source says
 * 30%. Graduate enrollment rate and online retention have no public figure for those populations: NSC persistence covers
 * all first-time starters, not graduate applicants or online programs. */
const SV = {
  "undergrad-admissions": { aht: "5:30", fcr: "68%", lead: "4 hrs" },
  "graduate-programs":    { aht: "8:00", fcr: "60%", lead: "30 min", enroll: "25%" },
  "financial-aid":        { aht: "12:00", fcr: "45%", csat: "65%", abandon: "20%" },
  "student-services":     { aht: "6:00", fcr: "62%", csat: "74%", containment: "25%" },
  "it-helpdesk":          { aht: "8:00", fcr: "65%", csat: "72%", containment: "35%" },
  "online-education":     { aht: "6:00", fcr: "68%", csat: "70%", retention: "60%" },
};
const SV_TEST = { aht: "aht", fcr: "fcr", containment: "deflection", abandon: "staffing" };
const SV_LABEL = { aht: "Average handle time", fcr: "First contact resolution", csat: "Customer satisfaction", containment: "Self-service containment", abandon: "Abandon rate", lead: "Speed to lead (time to first contact with a new inquiry)", enroll: "Enrollment rate (applicants or admits who enroll)", retention: "Term to term retention" };
const SV_REASON = {
  aht: "No regulator or trade body publishes handle time for this service area.",
  fcr: "No regulator or trade body publishes first contact resolution for this service area.",
  csat: "No public CSAT percentage exists for this service area.",
  containment: "No regulator or trade body publishes self-service containment for this service area.",
  abandon: "No regulator or trade body publishes abandon rate for this service area.",
  lead: "No free public source publishes response time to inquiries for higher education admissions.",
  enroll: "NACAC's yield analysis covers first-year admits at four-year colleges; no free public source publishes an enrollment rate for graduate programs as a whole.",
  retention: "NSC and IPEDS publish persistence and retention for all first-time starters; neither publishes a retention rate for online programs.",
};
const SV_NAME = { "undergrad-admissions": "undergraduate admissions", "graduate-programs": "graduate programs", "financial-aid": "financial aid and student accounts", "student-services": "student services", "it-helpdesk": "university IT help desks", "online-education": "online and continuing education" };
const sv = {};
for (const [slug, kpis] of Object.entries(SV)) for (const [m, v] of Object.entries(kpis)) {
  sv[`edu.sv.${slug}.${m}`] = none(`${SV_LABEL[m]}, ${SV_NAME[slug]}`, SV_REASON[m], v, SV_TEST[m]);
}

export default {
  ...bench,
  ...sv,

  "edu.sv.undergrad-admissions.yield": { ...fact("30%", "Average yield rate (share of admitted students who enroll), four-year not-for-profit colleges, fall 2022 (private 33%, public 25%); NACAC analysis of NCES IPEDS data", { publisher: "NACAC", title: "Trends in Yield Rates at Four-Year Colleges", year: 2023, url: "https://www.nacacnet.org/trends-in-yield-rates-at-four-year-colleges/" }), draft: "35%" },

  "edu.nsc.enroll": fact("19.4 million", "Postsecondary enrollments in the US, fall 2025 (16.2 million undergraduate, 3.2 million graduate)", NSC_FALL),
  "edu.nsc.persist": fact("77.1%", "Students who started college in fall 2024 and were enrolled at any US institution in fall 2025 (second fall persistence)", NSC_PR),
  "edu.nsc.retain": fact("69.1%", "Students who started college in fall 2024 and were enrolled at their starting institution in fall 2025 (second fall retention)", NSC_PR),

  "edu.ferpa.student": fact("34 CFR 99.3", "FERPA definition of student: an individual who is or has been in attendance at the institution and about whom it keeps education records", ecfr("99.3", "What definitions apply to these regulations?", `${FERPA_PATH}/subpart-A/section-99.3`)),
  "edu.ferpa.eligible": fact("34 CFR 99.5(a)", "FERPA rights transfer from parents to the student once the student attends a postsecondary institution", ecfr("99.5", "What are the rights of students?", `${FERPA_PATH}/subpart-A/section-99.5`)),
  "edu.ferpa.dependent": fact("34 CFR 99.31(a)(8)", "FERPA permits, and does not require, disclosure without consent to the parents of a student who is a dependent for federal tax purposes", ecfr("99.31", "Under what conditions is prior consent not required to disclose information?", `${FERPA_PATH}/subpart-D/section-99.31`)),
  "edu.t4.aid": fact("34 CFR 668.73", "Title IV misrepresentation includes false, erroneous or misleading statements about the availability, amount or nature of financial assistance", ecfr("668.73", "Nature of financial charges or financial assistance", `${T4_PATH}/section-668.73`)),
  "edu.t4.jobs": fact("34 CFR 668.74", "Title IV misrepresentation includes false, erroneous or misleading statements about graduates' employability, including actual employment rates materially lower than those marketed", ecfr("668.74", "Employability of graduates", `${T4_PATH}/section-668.74`)),
  "edu.t4.sanction": fact("34 CFR 668.71", "On substantial misrepresentation the Secretary may limit or revoke participation in Title IV programs (provisionally certified institutions), deny applications, or start a fine, limitation, suspension or termination proceeding", ecfr("668.71", "Scope and special definitions", `${T4_PATH}/section-668.71`)),

  "edu.coach.rct": fact("more likely to persist", "Students randomly assigned an InsideTrack coach were more likely to persist during coaching and more likely to be enrolled one year after it ended; randomized experiment at public, private and proprietary universities, mostly non-traditional students", { publisher: "NBER (Bettinger and Baker)", title: "The Effects of Student Coaching in College: An Evaluation of a Randomized Experiment in Student Mentoring, Working Paper 16881", year: 2011, url: "https://www.nber.org/papers/w16881" }),

  "edu.surge": { kind: "assumption", value: "3 to 10x", label: "Contact volume in peak weeks (yield season, FAFSA processing, registration, first week of classes) against a normal week", rationale: "From practice; no public source measures it. Forecast each peak from your own academic calendar and last year's volume.", test: "forecast" },
  "edu.grad.cycle": { kind: "assumption", value: "3 to 12 months", label: "Graduate enrollment cycle from first inquiry to enrollment", rationale: "From practice; varies by program and start dates. Measure inquiry to enrollment time in your own CRM.", test: "forecast" },

  "edu.ex.grad-weight": { kind: "example", value: "$120,000 and $5,000", label: "Illustrative tuition of an MBA against a certificate", rationale: "Arithmetic on illustrative prices; use your own program tuition.", text: "one enrollment in a $120,000 MBA brings as much tuition as 24 enrollments in a $5,000 certificate" },
  "edu.ex.grad-speed": { kind: "example", value: "4 hours and 15 minutes", label: "Illustrative response times of two programs to the same inquiry", rationale: "A scenario, not a measured response time.", text: "If your program answers in 4 hours with a generic email while a competitor calls in 15 minutes with a tailored conversation" },
  "edu.ex.netprice": { kind: "example", value: "$55,000 and $12,000", label: "Illustrative cost of attendance against net price", rationale: "Shows how to present both figures; use your own net price calculator.", text: "The cost of attendance is $55,000. Based on typical aid for your income range, your estimated net price is about $12,000." },
  "edu.ex.balance": { kind: "example", value: "$12,000, $10,000 and $2,000", label: "Illustrative balance shown beside pending aid", rationale: "A scenario showing one view of bill and aid together.", text: "Your balance is $12,000. Pending financial aid of $10,000 will be applied by August 15, leaving an estimated balance of $2,000." },
};
