/* Healthcare claims (pilot). See src/lib/claims.js for the kinds. `draft` holds the figure the page printed before the
 * scan; `lead` says where the research pass looks first. A pending entry cannot ship. */


/* Research pass 2026-09-25. The pre-scan table printed three columns (healthcare, all industries, top quartile) of
 * unsourced figures; most traced to SQM Group's all-industry figures placed in healthcare cells. The top quartile
 * column is gone (no public source for any cell). One healthcare figure is published: SQM's health insurance FCR. */
const SQM_FCR_2026 = { publisher: "SQM Group", title: "First Call Resolution Benchmark: Measure, Benchmark, and Improve with AI (chart: FCR Benchmarking by Industry 2026)", year: 2026, url: "https://www.sqmgroup.com/resources/library/blog/fcr-metric-operating-philosophy" };
const SQM_KPI_2023 = { publisher: "SQM Group", title: "What Are the Industry Standards For the Top Call Center KPIs?", year: 2023, url: "https://www.sqmgroup.com/resources/library/blog/industry-standards-top-call-center-kpis" };
const SQM_FCR_2024 = { publisher: "SQM Group", title: "Call Center FCR Benchmark 2024 Results by Industry", year: 2025, url: "https://www.sqmgroup.com/resources/library/blog/call-center-fcr-benchmark-2024-results-by-industry" };
const SQM_POP = "SQM's benchmarked North American inbound customer service call centers, measured by post-call survey";
const fact = (value, label, source, test) => ({ kind: "fact", value, label, source, checked: "2026-09-25", ...(test ? { test } : {}) });
const none = (label, reason, draft, test) => ({ kind: "none", label, reason, draft, ...(test ? { test } : {}) });
const NO_HC = "No free public source publishes this metric for healthcare contact centers; the only public healthcare breakout (SQM Group) covers first contact resolution in health insurance.";

const bench = {
  "hc.bench.fcr.hc": fact("69%", `First contact resolution, health insurance call centers, average (range 51% to 91%); ${SQM_POP}`, SQM_FCR_2026, "fcr"),
  "hc.bench.fcr.cross": fact("71%", `First contact resolution, all industries, average (range 40% to 91%); ${SQM_POP}`, SQM_FCR_2026, "fcr"),
  "hc.bench.csat.hc": none("Customer satisfaction, healthcare contact centers", NO_HC, "76%"),
  "hc.bench.csat.cross": fact("78%", `Customer satisfaction, all industries, share of customers very satisfied (top box); ${SQM_POP}`, SQM_KPI_2023),
  "hc.bench.aht.hc": none("Average handle time, healthcare contact centers", NO_HC, "6:36", "aht"),
  "hc.bench.aht.cross": fact("11:37", "Average handle time (697 seconds, talk plus wrap), SQM's 2024 benchmarking participants, all industries", SQM_FCR_2024, "aht"),
  "hc.bench.abandon.hc": none("Abandon rate, healthcare contact centers", NO_HC, "7%", "staffing"),
  "hc.bench.abandon.cross": fact("6%", "Abandon rate, SQM's stated call center industry standard, all industries", SQM_KPI_2023, "staffing"),
  "hc.bench.attrition.hc": none("Annual agent attrition, healthcare contact centers", `${NO_HC} BLS JOLTS quits for health care and social assistance cover every worker in the sector, not agents.`, "42%", "attrition"),
  "hc.bench.attrition.cross": fact("34%", "Annual agent turnover, SQM's 2024 benchmarking participants, all industries", SQM_FCR_2024, "attrition"),
  "hc.bench.transfer.hc": none("Transfer rate, healthcare contact centers", NO_HC, "19%", "fcr"),
  "hc.bench.transfer.cross": fact("19%", "Transfer rate, SQM's stated call center industry standard, all industries", SQM_KPI_2023, "fcr"),
};

const SV = {
  "health-systems":       { aht: "7:20", fcr: "48%", csat: "74%", containment: "18%" },
  "health-insurance":     { aht: "8:45", fcr: "55%", csat: "71%", containment: "25%" },
  "provider-groups":      { aht: "5:30", fcr: "62%", csat: "78%", containment: "22%" },
  "digital-health":       { aht: "4:30", fcr: "72%", csat: "80%", containment: "35%" },
  "pharma-life-sciences": { aht: "10:00", fcr: "72%", csat: "81%", containment: "15%" },
  "home-health":          { aht: "6:00", fcr: "55%", csat: "79%", containment: "10%" },
};
/* Research pass 2026-09-25: no free public source publishes these four metrics for any healthcare segment. CMS test
 * calls measure hold time, dropped calls and interpreter availability; CAHPS, ACSI and J.D. Power publish index scores.
 * `draft` keeps the figure the page printed before, for lineage; it never renders. */
const SV_TEST = { aht: "aht", fcr: "fcr", containment: "deflection" };
const SV_LABEL = { aht: "Average handle time", fcr: "First contact resolution", csat: "Customer satisfaction", containment: "Self-service containment" };
const SV_REASON = {
  aht: "No regulator or trade body publishes handle time for this segment; CMS call center monitoring measures hold time, not handle time.",
  fcr: "No regulator or trade body publishes first contact resolution for this segment.",
  csat: "No public CSAT percentage exists for this segment; CAHPS, ACSI and J.D. Power publish index scores on other scales.",
  containment: "No regulator or trade body publishes self-service containment for this segment.",
};
const sv = {};
for (const [slug, kpis] of Object.entries(SV)) for (const [m, v] of Object.entries(kpis)) {
  if (v) sv[`hc.sv.${slug}.${m}`] = { kind: "none", label: `${SV_LABEL[m]}, ${slug.replace(/-/g, " ")} contact centers`, reason: SV_REASON[m], draft: v, ...(SV_TEST[m] ? { test: SV_TEST[m] } : {}) };
}

const CMS_DISPLAY = { publisher: "CMS", title: "2026 Part C and D Display Measures Technical Notes, Attachment A (in the 2026 display measures download)", year: 2025, url: "https://www.cms.gov/files/zip/2026-display-measures.zip" };

export default {
  ...bench,
  ...sv,

  "hc.hipaa.penalty": { kind: "fact", value: "$145 to $73,011", label: "HIPAA civil money penalty per violation, 2025 inflation adjusted, lowest tier minimum to highest per violation maximum (45 CFR 160.404(b)(2) as adjusted; calendar year cap $2,190,294)", source: { publisher: "HHS, eCFR", title: "45 CFR 102.3, Penalty adjustment and table", year: 2025, url: "https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-A/part-102/section-102.3" }, checked: "2026-09-25" },
  "hc.noshow.reminders": { kind: "fact", value: "29% of the baseline rate", label: "Relative reduction in hospital appointment non-attendance from automated reminders, weighted mean across a systematic review of 29 studies (manual phone calls: 39%)", source: { publisher: "Journal of Telemedicine and Telecare (Hasvold and Wootton)", title: "Use of telephone and SMS reminders to improve attendance at hospital appointments: a systematic review", year: 2011, url: "https://pubmed.ncbi.nlm.nih.gov/21933898/" }, checked: "2026-09-25", test: "channel" },
  "hc.referral.closed": { kind: "fact", value: "34.8%", label: "Primary care referral scheduling attempts that ended in a documented completed specialist appointment, one large US health system (103,737 attempts, 20 specialties, 2015 to 2016)", source: { publisher: "Journal of General Internal Medicine (Patel et al.)", title: "Closing the Referral Loop: an Analysis of Primary Care Referrals to Specialists in a Large Health System", year: 2018, url: "https://pubmed.ncbi.nlm.nih.gov/29532299/" }, checked: "2026-09-25", test: "fcr" },
  "hc.epic.share": { kind: "assumption", value: "70%+", label: "Share of patient access interactions whose data sits in Cadence, MyChart and Resolute", rationale: "From practice in Epic health systems; varies by module adoption. Not a published figure.", test: "aht" },
  "hc.referral.delay": { kind: "assumption", value: "2 to 3 week", label: "Specialist access delay from manual referral coordination", rationale: "From practice; no published cycle time for manual referral coordination. Time your own referral to appointment interval.", test: "fcr" },
  "hc.fcr.stuck": { kind: "assumption", value: "50%", label: "FCR ceiling for health systems at Level 2 integration", rationale: "From practice; an illustration of where FCR stalls without EHR write-back. Not a published figure.", test: "fcr" },
  "hc.idcard.aht": { kind: "example", value: "90 seconds", label: "Illustrative handle time of an ID card request", rationale: "Contrasts a simple call with a prior authorization call." },
  "hc.admin.share": { kind: "assumption", value: "40%", label: "Specialist time spent on simple calls without intent segmentation", rationale: "From practice; depends on plan mix and routing. Not a published figure.", test: "aht" },
  "hc.oe.spike": { kind: "assumption", value: "2 to 4x", label: "Open enrollment volume against a normal month", rationale: "From practice; CMS publishes federal Marketplace call volume only during open enrollment, with no payer baseline. Forecast from your own past enrollment periods.", test: "forecast" },
  "hc.temp.training": { kind: "assumption", value: "2 weeks", label: "Typical training for seasonal temporary agents", rationale: "From practice; not a published figure.", test: "staffing" },
  "hc.cms.grievance": { kind: "fact", value: "30 days", label: "Medicare Advantage grievance decision limit from receipt, extendable by up to 14 days (42 CFR 422.564(e))", source: { publisher: "CMS, eCFR", title: "42 CFR 422.564, Grievance procedures", year: 2026, url: "https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-B/part-422/subpart-M/section-422.564" }, checked: "2026-09-25" },
  "hc.cms.expedited": { kind: "fact", value: "24 hours", label: "Medicare Advantage expedited grievance response limit, for a complaint about an extension or a refused expedited request (42 CFR 422.564(f))", source: { publisher: "CMS, eCFR", title: "42 CFR 422.564, Grievance procedures", year: 2026, url: "https://www.ecfr.gov/current/title-42/chapter-IV/subchapter-B/part-422/subpart-M/section-422.564" }, checked: "2026-09-25" },
  "hc.cms.hold": { kind: "fact", value: "0:32", label: "Average hold after the phone menu before a live person, Medicare Advantage customer service lines, CMS test calls January to June 2025 (CMS compliance standard 2:00)", source: CMS_DISPLAY, checked: "2026-09-25", test: "staffing" },
  "hc.cms.disconnect": { kind: "fact", value: "1.01%", label: "Calls unexpectedly dropped by the plan, Medicare Advantage customer service lines, CMS test calls January to June 2025 (CMS compliance standard 5%)", source: CMS_DISPLAY, checked: "2026-09-25" },
  "hc.cms.interpreter": { kind: "fact", value: "97%", label: "Interpreter and TTY contacts completed on Medicare Advantage prospective member lines, CMS test calls February to May 2025 (2026 Star Ratings measure C33)", source: { publisher: "CMS", title: "Medicare 2026 Part C and D Star Ratings Technical Notes, Attachment C", year: 2025, url: "https://www.cms.gov/files/document/2026-star-ratings-technical-notes.pdf" }, checked: "2026-09-25" },
  "hc.cms.alerts": { kind: "assumption", value: "day 20 and hour 12", label: "Escalation alert points ahead of the standard and expedited grievance limits", rationale: "A design choice that leaves a third to a half of each limit as working time; set your own." },
  "hc.referral.window": { kind: "assumption", value: "24 hours", label: "Referral-to-appointment service target", rationale: "A service target from practice; set it against your own referral data.", test: "fcr" },
  "hc.ex.referral-fax": { kind: "example", value: "3 days and 2 weeks", label: "Illustrative referral delay in a fax-based workflow", rationale: "A scenario, not a measured delay.", text: "A PCP refers a patient to cardiology; the referral sits in a fax queue for 3 days; someone manually enters it into the scheduling system; the patient gets called 2 weeks later." },
  "hc.ex.referral-ortho": { kind: "example", value: "48 hours", label: "Illustrative window before a referred patient books elsewhere", rationale: "A scenario, not a measured window.", text: "A PCP refers a patient to the group's orthopedist; the contact center does not schedule the appointment within 48 hours; the patient searches 'orthopedist near me' and books with a competitor." },
  "hc.ex.copay": { kind: "example", value: "$40 and $60", label: "Illustrative copay quoted by a bot against the true copay", rationale: "Shows why a bot must read the deductible state before quoting.", text: "If a bot tells a member their specialist copay is $40 but the actual copay is $60 because they have not met their deductible, the member will rely on that $40 figure." },
  "hc.tele.support": { kind: "example", value: "15% and 8%", label: "Illustrative pre-visit support and visit abandonment rates", rationale: "A worked scenario; measure your own support contacts per visit.", text: "If 15% of patients call support before their visit and 8% of those abandon the visit entirely, you have a technical barrier to care that only shows up in support data." },
  "hc.onboard.time": { kind: "assumption", value: "15 to 25 minutes", label: "Digital health onboarding time before a first visit", rationale: "From practice; count your own steps and time them.", test: "channel" },
  "hc.onboard.loss": { kind: "assumption", value: "5 to 10%", label: "Patients lost at each added onboarding step", rationale: "From practice; no published per-step drop-off for digital health onboarding. Measure completion at each step of your own funnel.", test: "channel" },
  "hc.pharma.loss": { kind: "assumption", value: "10 to 15%", label: "Eligible patients lost at each added support program enrollment step", rationale: "From practice; no public per-step figure for patient support program enrollment. Measure completion at each step of your own program.", test: "channel" },
  "hc.home.containment": { kind: "assumption", value: "10 to 15%", label: "Containment target for home health, against 40% elsewhere", rationale: "From practice; a vulnerable, high-stakes population keeps more contacts with people.", test: "deflection" },
  "hc.home.reauth": { kind: "assumption", value: "70 to 80%", label: "Authorization use at which to trigger re-authorization", rationale: "A design choice that leaves lead time before visits run out; set your own." },
};
