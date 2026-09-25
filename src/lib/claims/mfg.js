/* Manufacturing and Automotive claims. See src/lib/claims.js for the kinds. `draft` holds the figure the page printed
 * before the scan, for lineage; it never renders.
 *
 * Research pass 2026-09-25. The pre-scan benchmark table printed three columns (manufacturing, cross-industry, top
 * quartile) of unsourced figures. No free public source publishes contact center metrics for manufacturing or any of
 * its segments; SQM Group's by-industry FCR chart covers nine industries, none of them manufacturing or automotive.
 * The top quartile column and the B2B churn row are gone (no public source for any cell). Two industry figures are
 * published: vehicles under safety recall (NHTSA's own recall data) and warranty claims paid (Warranty Week, compiled
 * from SEC filings). The pre-scan "30M+ vehicles recalled/yr" and "$50B+ in warranty claims" did not match either.
 */
const CHECKED = "2026-09-25";
const fact = (value, label, source, test) => ({ kind: "fact", value, label, source, checked: CHECKED, ...(test ? { test } : {}) });
const assumption = (value, label, rationale, test) => ({ kind: "assumption", value, label, rationale, ...(test ? { test } : {}) });
const example = (value, label, rationale, text) => ({ kind: "example", value, label, rationale, text });
const none = (label, reason, draft, test) => ({ kind: "none", label, reason, draft, ...(test ? { test } : {}) });

const SQM_FCR_2026 = { publisher: "SQM Group", title: "First Call Resolution Benchmark: Measure, Benchmark, and Improve with AI (chart: FCR Benchmarking by Industry 2026)", year: 2026, url: "https://www.sqmgroup.com/resources/library/blog/fcr-metric-operating-philosophy" };
const SQM_KPI_2023 = { publisher: "SQM Group", title: "What Are the Industry Standards For the Top Call Center KPIs?", year: 2023, url: "https://www.sqmgroup.com/resources/library/blog/industry-standards-top-call-center-kpis" };
const SQM_FCR_2024 = { publisher: "SQM Group", title: "Call Center FCR Benchmark 2024 Results by Industry", year: 2025, url: "https://www.sqmgroup.com/resources/library/blog/call-center-fcr-benchmark-2024-results-by-industry" };
const SQM_POP = "SQM's benchmarked North American inbound customer service call centers, measured by post-call survey";
const NO_MFG = "No free public source publishes this metric for manufacturing or automotive contact centers; SQM Group's by-industry breakouts do not include manufacturing.";

const NHTSA_RCL = { publisher: "NHTSA", title: "Recalls data file (FLAT_RCL_POST_2010), NHTSA datasets and APIs", year: 2026, url: "https://static.nhtsa.gov/odi/ffdd/rcl/FLAT_RCL_POST_2010.zip" };
const ECFR = (title, url) => ({ publisher: "eCFR", title, year: 2026, url });
const USC = (title, url) => ({ publisher: "Office of the Law Revision Counsel, US Code", title, year: 2026, url });

const core = {
  "mfg.nhtsa.recalled": fact("29.3 million", "Vehicles potentially affected by the 891 vehicle safety recall campaigns filed with NHTSA in 2025 (Part 573 reports received in calendar 2025; equipment, tire and child seat campaigns excluded), summed from NHTSA's own recall data file; 2024: 29.4 million, 2023: 34.8 million", NHTSA_RCL),
  "mfg.warranty.claims": fact("$30.37 billion", "Warranty claims paid in 2025 by US-based manufacturers publicly traded in the United States, all product sectors, compiled from SEC filings (vehicle sector: $20.81 billion)", { publisher: "Warranty Week", title: "23rd Annual Product Warranty Report", year: 2026, url: "https://www.warrantyweek.com/archive/ww20260416.html" }),
};

const bench = {
  "mfg.bench.csat.mfg": none("Customer satisfaction, manufacturing contact centers", NO_MFG, "76%"),
  "mfg.bench.csat.cross": fact("78%", `Customer satisfaction, all industries, share of customers very satisfied (top box); ${SQM_POP}`, SQM_KPI_2023),
  "mfg.bench.fcr.mfg": none("First contact resolution, manufacturing contact centers", NO_MFG, "60%", "fcr"),
  "mfg.bench.fcr.cross": fact("71%", `First contact resolution, all industries, average (range 40% to 91%); ${SQM_POP}`, SQM_FCR_2026, "fcr"),
  "mfg.bench.aht.mfg": none("Average handle time, manufacturing contact centers", NO_MFG, "8:30", "aht"),
  "mfg.bench.aht.cross": fact("11:37", "Average handle time (697 seconds, talk plus wrap), SQM's 2024 benchmarking participants, all industries", SQM_FCR_2024, "aht"),
  "mfg.bench.attrition.mfg": none("Annual agent attrition, manufacturing contact centers", `${NO_MFG} BLS JOLTS quits for manufacturing cover every worker in the sector, not agents.`, "30%", "attrition"),
  "mfg.bench.attrition.cross": fact("34%", "Annual agent turnover, SQM's 2024 benchmarking participants, all industries", SQM_FCR_2024, "attrition"),
};

/* Sub-page tiles. Research pass 2026-09-25: no free public source publishes these metrics for any manufacturing
 * segment. J.D. Power publishes automotive CSI and SSI index scores on its own scale, not a CSAT percentage. */
const SV = {
  "automotive-oem":       { aht: "9:00", fcr: "55%", csat: "75%", containment: "22%" },
  "automotive-dealer":    { aht: "4:30", fcr: "72%", csat: "82%", apptset: "45%" },
  "industrial-b2b":       { aht: "12:00", fcr: "48%", csat: "72%", containment: "12%" },
  "consumer-electronics": { aht: "7:00", fcr: "65%", csat: "74%", containment: "30%" },
  "aerospace-defense":    { aht: "15:00", fcr: "40%", csat: "70%", aog: "2 hrs" },
  "food-beverage":        { aht: "5:00", fcr: "75%", csat: "78%", safety: "2%" },
};
const SV_TEST = { aht: "aht", fcr: "fcr", containment: "deflection" };
const SV_LABEL = { aht: "Average handle time", fcr: "First contact resolution", csat: "Customer satisfaction", containment: "Self-service containment", apptset: "Appointment set rate (share of inbound leads booked)", aog: "AOG part response time (request to part located and shipped)", safety: "Share of complaints escalated to a food safety investigation" };
const SV_REASON = {
  aht: "No regulator or trade body publishes handle time for this segment.",
  fcr: "No regulator or trade body publishes first contact resolution for this segment.",
  csat: "No public CSAT percentage exists for this segment; J.D. Power and ACSI publish index scores on other scales.",
  containment: "No regulator or trade body publishes self-service containment for this segment.",
  apptset: "No public source publishes a dealer BDC appointment set rate; dealer CRM vendors report their own customers' figures without a published method.",
  aog: "No public source publishes AOG part response times; operators and OEMs set their own targets by contract.",
  safety: "No public source publishes the share of consumer complaints escalated to food safety investigation.",
};
const sv = {};
for (const [slug, kpis] of Object.entries(SV)) for (const [m, v] of Object.entries(kpis)) {
  sv[`mfg.sv.${slug}.${m}`] = none(`${SV_LABEL[m]}, ${slug.replace(/-/g, " ")} contact centers`, SV_REASON[m], v, SV_TEST[m]);
}

const regs = {
  "mfg.nhtsa.573": fact("5 working days", "Deadline to file a Part 573 defect or noncompliance report with NHTSA after a defect is determined to be safety related (49 CFR 573.6(b))", ECFR("49 CFR 573.6, Defect and noncompliance information report", "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-V/part-573/section-573.6")),
  "mfg.nhtsa.577": fact("60 days", "Deadline for owner notification after the manufacturer files its Part 573 report; vehicle owners are notified by first class mail (49 CFR 577.7(a))", ECFR("49 CFR 577.7, Time and manner of notification", "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-V/part-577/section-577.7")),
  "mfg.tcpa.damages": fact("$500", "Statutory damages per violation in a private TCPA action; a court may raise the award up to 3 times for a willful or knowing violation (47 U.S.C. 227(b)(3))", USC("47 U.S.C. 227, Restrictions on use of telephone equipment", "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title47-section227&num=0&edition=prelim")),
  "mfg.ftc.notify": fact("30 days", "Deadline to notify the FTC after discovering a security event involving the information of at least 500 consumers, FTC Safeguards Rule, effective May 13, 2024 (16 CFR 314.4(j), 314.5)", ECFR("16 CFR 314.4, Elements", "https://www.ecfr.gov/current/title-16/chapter-I/subchapter-C/part-314/section-314.4")),
  "mfg.cpsc.report": fact("24 hours", "Time within which a firm should report to CPSC after obtaining information that reasonably supports the conclusion that a product has a reportable defect or risk (16 CFR 1115.14(e))", ECFR("16 CFR 1115.14, Time computations", "https://www.ecfr.gov/current/title-16/chapter-II/subchapter-B/part-1115/subpart-A/section-1115.14")),
  "mfg.fda.rfr": fact("24 hours", "Deadline to report to FDA's Reportable Food Registry after a responsible party determines a food is reportable, that is, a reasonable probability of serious adverse health consequences or death (21 U.S.C. 350f(d)(1))", USC("21 U.S.C. 350f, Reportable food registry", "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title21-section350f&num=0&edition=prelim")),
  "mfg.fda.supplement": fact("15 business days", "Deadline for a dietary supplement's responsible person to submit a serious adverse event report to FDA after receiving it (21 U.S.C. 379aa-1(c)(1)); conventional foods have no equivalent mandatory report", USC("21 U.S.C. 379aa-1, Serious adverse event reporting for dietary supplements", "https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title21-section379aa-1&num=0&edition=prelim")),
  "mfg.fda.ftr": fact("July 20, 2028", "Date before which FDA will not enforce the Food Traceability Rule (FSMA section 204), following a Congressional directive; the original compliance date was January 20, 2026", { publisher: "FDA", title: "FSMA Final Rule on Requirements for Additional Traceability Records for Certain Foods", year: 2026, url: "https://www.fda.gov/food/food-safety-modernization-act-fsma/fsma-final-rule-requirements-additional-traceability-records-certain-foods" }),
};

const planning = {
  "mfg.recall.playbook": assumption("4 hours", "Time to deploy a recall readiness playbook (notice content, IVR update, agent briefing, FAQ, VIN checker)", "A readiness target from practice, not a published figure. Rehearse your own playbook and time it.", "forecast"),
  "mfg.oem.dtc.aht": assumption("2 to 3 minutes", "Handle time saved on a technical call when the agent sees the vehicle's diagnostic codes before the owner describes the symptom", "From practice; not a published figure. Measure the diagnosis segment of your own technical calls before and after.", "aht"),
  "mfg.dealer.followup": assumption("10 minutes", "Target for a personal follow-up call after an online lead arrives", "A service target from practice; published speed-to-lead studies are paywalled or unverifiable. Set it against your own lead conversion by response time.", "staffing"),
  "mfg.fb.cluster": assumption("three or more similar reports from one lot code within 48 hours", "Complaint cluster that triggers an automatic food safety investigation", "A design choice for an alert threshold; set it with your food safety team and your own complaint volumes."),
};

const examples = {
  "mfg.ex.recall-surge": example("2 million vehicles, 200,000 calls", "Illustrative recall call surge", "A scenario, not a measured rate; forecast your own from past campaigns.", "A safety recall covering 2 million vehicles that draws a call from one owner in ten puts 200,000 calls into the queue within weeks"),
  "mfg.ex.goodwill": example("$200 and $150,000", "Illustrative goodwill repair against an owner's future purchases", "A scenario that compares a one-time cost with lifetime value; use your own repurchase data.", "A $200 goodwill repair that keeps an owner worth $150,000 in future vehicle purchases"),
  "mfg.ex.tcpa": example("$5 million to $15 million", "Illustrative statutory exposure from 10,000 unconsented texts", "Arithmetic on the statutory $500 per violation and the up to threefold award.", "At $500 each, 10,000 unconsented reminder texts carry $5 million in statutory damages, and up to $15 million if a court trebles them"),
  "mfg.ex.mttr": example("15 and 2 tickets a quarter", "Illustrative accounts with the same resolution time", "A scenario; track resolution by account in your own data.", "An account that opens 15 tickets a quarter with a 4-day average time to resolve has a different experience from an account that opens 2 tickets a quarter at the same 4 days"),
  "mfg.ex.dispatch": example("3 hours and 2 to 5 days", "Illustrative field service trip without the right part", "A scenario, not a measured delay.", "A technician drives 3 hours to the customer site, opens the equipment and finds the replacement part is not on the truck; the line stays down another 2 to 5 days while the part ships"),
  "mfg.ex.support-cost": example("$15 and $3 per unit", "Illustrative support cost gap between two products", "A scenario; compute support cost per unit sold for your own products.", "If Product A generates $15 in support cost per unit and Product B generates $3, the $12 gap per unit is a design cost that grows with every unit sold"),
};

export default { ...core, ...bench, ...sv, ...regs, ...planning, ...examples };
