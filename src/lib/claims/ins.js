/* Insurance claims. See src/lib/claims.js for the kinds. `draft` holds the figure the page printed before the scan; it
 * never renders.
 *
 * Research pass 2026-09-25. The pre-scan benchmark table printed three columns (insurance, cross-industry, top quartile)
 * of unsourced figures. SQM Group publishes an insurance breakout for first contact resolution (2026) and for
 * customer satisfaction (2021); the page's 65% FCR is replaced by SQM's 75%. The top quartile column is gone (no
 * public source for any cell). The hero's "$146 billion in catastrophe losses in 2025" matches no publisher read:
 * Munich Re puts 2025 insured natural catastrophe losses at about US$108bn (Swiss Re's sigma page, US$107bn, refused
 * the fetch from this network, as did J.D. Power). Florida's claim acknowledgment limit is 7 calendar days, not 14. */
const SQM_FCR_2026 = { publisher: "SQM Group", title: "First Call Resolution Benchmark: Measure, Benchmark, and Improve with AI (chart: FCR Benchmarking by Industry 2026)", year: 2026, url: "https://www.sqmgroup.com/resources/library/blog/fcr-metric-operating-philosophy" };
const SQM_CSAT_2021 = { publisher: "SQM Group", title: "First Call Resolution and Customer Satisfaction Comparison by Industry and Call Reason", year: 2021, url: "https://www.sqmgroup.com/resources/library/blog/fcr-customer-satisfaction-comparison-industry-and-call-reason" };
const SQM_KPI_2023 = { publisher: "SQM Group", title: "What Are the Industry Standards For the Top Call Center KPIs?", year: 2023, url: "https://www.sqmgroup.com/resources/library/blog/industry-standards-top-call-center-kpis" };
const SQM_FCR_2024 = { publisher: "SQM Group", title: "Call Center FCR Benchmark 2024 Results by Industry", year: 2025, url: "https://www.sqmgroup.com/resources/library/blog/call-center-fcr-benchmark-2024-results-by-industry" };
const SQM_POP = "SQM's benchmarked North American inbound customer service call centers, measured by post-call survey";
const CHECKED = "2026-09-25";
const fact = (value, label, source, test) => ({ kind: "fact", value, label, source, checked: CHECKED, ...(test ? { test } : {}) });
const none = (label, reason, draft, test) => ({ kind: "none", label, reason, draft, ...(test ? { test } : {}) });
const assumption = (value, label, rationale, test) => ({ kind: "assumption", value, label, rationale, ...(test ? { test } : {}) });
const example = (value, label, rationale, text) => ({ kind: "example", value, label, rationale, text });
const NO_INS = "No free public source publishes this metric for insurance contact centers; SQM Group's insurance breakout covers first contact resolution and customer satisfaction only.";

const bench = {
  "ins.bench.csat.ins": fact("80%", `Customer satisfaction, insurance call centers, share of customers very satisfied (top box), 2021; ${SQM_POP}`, SQM_CSAT_2021),
  "ins.bench.csat.cross": fact("78%", `Customer satisfaction, all industries, share of customers very satisfied (top box); ${SQM_POP}`, SQM_KPI_2023),
  "ins.bench.fcr.ins": fact("75%", `First contact resolution, insurance call centers, average (range 69% to 80%); ${SQM_POP}`, SQM_FCR_2026, "fcr"),
  "ins.bench.fcr.cross": fact("71%", `First contact resolution, all industries, average (range 40% to 91%); ${SQM_POP}`, SQM_FCR_2026, "fcr"),
  "ins.bench.aht.ins": none("Average handle time, insurance contact centers", NO_INS, "9:00", "aht"),
  "ins.bench.aht.cross": fact("11:37", "Average handle time (697 seconds, talk plus wrap), SQM's 2024 benchmarking participants, all industries", SQM_FCR_2024, "aht"),
  "ins.bench.cycle.ins": none("Claims cycle time, all insurance lines", "No regulator or trade body publishes one claims cycle time across insurance lines; it varies by line and peril. Measure yours from first notice of loss to final payment.", "30 days"),
  "ins.bench.attrition.ins": none("Annual agent attrition, insurance contact centers", `${NO_INS} BLS JOLTS quits for finance and insurance cover every worker in the sector, not agents.`, "32%", "attrition"),
  "ins.bench.attrition.cross": fact("34%", "Annual agent turnover, SQM's 2024 benchmarking participants, all industries", SQM_FCR_2024, "attrition"),
  "ins.bench.containment.ins": none("Self-service containment, insurance contact centers", NO_INS, "15%", "deflection"),
  "ins.bench.containment.cross": none("Self-service containment, all industries", "No free public source publishes a measured all-industry containment rate on a definition that matches this row.", "25%", "deflection"),
};

const SV = {
  "personal-lines":   { aht: "8:30", fcr: "62%", csat: "78%", containment: "18%" },
  "commercial-lines": { aht: "11:00", fcr: "55%", csat: "75%", containment: "10%" },
  "life-annuities":   { aht: "8:00", fcr: "72%", csat: "82%", containment: "22%" },
  "workers-comp":     { aht: "10:00", fcr: "50%", csat: "72%", containment: "10%" },
  "specialty-lines":  { aht: "13:00", fcr: "60%", csat: "78%", containment: "5%" },
  "insurtech":        { aht: "4:30", fcr: "76%", csat: "84%", containment: "40%" },
};
/* No free public source publishes these four metrics for any insurance line. SQM's insurance breakout is one figure per
 * metric for all insurance call centers, not per line; J.D. Power publishes index scores on a 1,000 point scale. */
const SV_TEST = { aht: "aht", fcr: "fcr", containment: "deflection" };
const SV_LABEL = { aht: "Average handle time", fcr: "First contact resolution", csat: "Customer satisfaction", containment: "Self-service containment" };
const SV_NAME = { "personal-lines": "personal lines P&C", "commercial-lines": "commercial lines", "life-annuities": "life and annuity", "workers-comp": "workers' compensation", "specialty-lines": "specialty and surplus lines", insurtech: "insurtech and digital carrier" };
const SV_REASON = {
  aht: "No regulator or trade body publishes handle time for this line of insurance.",
  fcr: "No public source publishes first contact resolution for this line; SQM Group's insurance figure covers all insurance call centers it benchmarks.",
  csat: "No public CSAT percentage exists for this line; SQM Group's insurance figure covers all insurance call centers, and J.D. Power publishes index scores on another scale.",
  containment: "No regulator or trade body publishes self-service containment for this line of insurance.",
};
const sv = {};
for (const [slug, kpis] of Object.entries(SV)) for (const [m, v] of Object.entries(kpis)) {
  sv[`ins.sv.${slug}.${m}`] = { kind: "none", label: `${SV_LABEL[m]}, ${SV_NAME[slug]} contact centers`, reason: SV_REASON[m], draft: v, ...(SV_TEST[m] ? { test: SV_TEST[m] } : {}) };
}

const CA = { publisher: "State of California, California Code of Regulations", title: "10 CCR 2695.5, Duties upon Receipt of Communications", year: 2026, url: "https://govt.westlaw.com/calregs/Document/IE63146575C2F11EC9C68000D3A7C4BC3" };
const NY = { publisher: "State of New York, NYCRR (Department of Financial Services Regulation 64)", title: "11 NYCRR 216.4, Failure to acknowledge pertinent communications", year: 2026, url: "https://govt.westlaw.com/nycrr/Document/I500ddac5cd1711dda432a117e6e0f345" };
const FL = { publisher: "Florida Legislature", title: "Florida Statutes 627.70131, Insurer's duty to acknowledge communications regarding claims; investigation (2026)", year: 2026, url: "https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0600-0699/0627/Sections/0627.70131.html" };

export default {
  ...bench,
  ...sv,

  "ins.natcat.2025": fact("$108 billion", "Insured losses from natural disasters worldwide in 2025, of about US$224bn in total losses", { publisher: "Munich Re", title: "Natural disaster figures for 2025 (media release, 13 January 2026)", year: 2026, url: "https://www.munichre.com/en/company/media-relations/media-information-and-corporate-news/media-information/2026/natural-disaster-figures-2025.html" }),
  "ins.cat.surge": assumption("10 to 50 times", "Claim call volume in the days after a major catastrophe, against a normal week", "From practice; depends on the peril, the footprint and the carrier's concentration in it. No public source measures it. Forecast from your own past catastrophe events.", "forecast"),
  "ins.ex.cycle-gap": example("45 days against 10", "Illustrative gap between the claim decision time a policyholder expects and the time it takes", "A scenario, not a measured cycle time.", "waiting 45 days for a decision they expected in 10"),

  "ins.pl.status.share": assumption("25 to 35%", "Share of post-FNOL contact volume that is claim status calls", "From practice; no published figure. Tag contact reasons after first notice of loss and count yours.", "fcr"),
  "ins.pl.status.cut": assumption("60 to 70%", "Share of claim status calls that proactive milestone notifications remove", "From practice; no published figure. Measure status calls per open claim before and after notifications start.", "channel"),
  "ins.reg.ca.ack": fact("15 calendar days", "California limit for an insurer to acknowledge a notice of claim (10 CCR 2695.5(e))", CA),
  "ins.reg.ny.ack": fact("15 business days", "New York limit for an insurer to acknowledge notification of a claim (11 NYCRR 216.4(a))", NY),
  "ins.reg.fl.ack": fact("7 calendar days", "Florida limit for an insurer to review and acknowledge a communication about a claim (Fla. Stat. 627.70131(1)(a))", FL),
  "ins.reg.fl.decide": fact("60 days", "Florida limit to pay or deny a property insurance claim after notice of the claim (Fla. Stat. 627.70131(7)(a))", FL),
  "ins.ex.pl.cat": example("5,000 claims and 200 adjusters", "Illustrative catastrophe claim load against adjuster capacity", "A scenario, not a measured event.", "5,000 new first notices of loss arrive in 48 hours and 200 adjusters are available"),

  "ins.ex.cl.profit": example("$500K and $50K", "Illustrative commercial accounts with the same service load and different premium", "Shows why service cost belongs beside premium.", "A $500K premium account that generates 50 service calls a year is profitable; a $50K premium account with the same 50 calls is not."),
  "ins.ex.cl.coi": example("30 seconds against 45 minutes", "Illustrative certificate of insurance request by portal against by phone", "A scenario, not a measured time.", "A contractor who needs a certificate by 3pm to start a job tomorrow should be able to download it from a portal in about 30 seconds instead of waiting 45 minutes on hold."),
  "ins.ex.cl.eo": example("$10M", "Illustrative size of an E&O claim from misstated commercial property coverage", "A scenario; the exposure tracks the limit of the policy misdescribed.", "Misstating coverage on a $10M commercial property policy can lead to an E&O claim of $10M or more."),
  "ins.cl.audit.notice": assumption("60 days", "Lead time for notifying a policyholder before a premium audit", "A design choice that leaves time to gather payroll and revenue records; set your own."),
  "ins.ex.cl.account": example("six policies", "Illustrative commercial account", "A scenario of one account's policy mix.", "A manufacturing company might hold general liability, commercial property, business auto for 20 vehicles, workers' comp in 3 states, umbrella and cyber: six policies that make up one account."),

  "ins.life.rarelyhear": fact("Nearly 40%", "Life insurance policyholders who say they rarely hear from their life insurer after purchase; survey of more than 6,100 consumers worldwide for the World Life Insurance Report 2027", { publisher: "Capgemini Research Institute and LIMRA", title: "Life insurers under pressure: 42% of consumers are confused and unconvinced by policies (World Life Insurance Report 2027 release)", year: 2026, url: "https://www.capgemini.com/news/press-releases/life-insurers-under-pressure-42-of-consumers-are-confused-and-unconvinced-by-policies/" }),
  "ins.naic.613": fact("Model 613", "NAIC model number of the Life Insurance and Annuities Replacement Model Regulation, which sets producer and insurer duties and the notice regarding replacements", { publisher: "National Association of Insurance Commissioners", title: "Life Insurance and Annuities Replacement Model Regulation (MO-613)", year: 2015, url: "https://content.naic.org/sites/default/files/model-law-613.pdf" }),
  "ins.ex.life.bot": example("$45,000 against $42,300", "Illustrative cash value quoted by a bot against the actual value", "Shows why a bot must read live values.", "A bot that says 'your cash value is approximately $45,000' when the actual value is $42,300"),
  "ins.ex.life.wait": example("45 days and $500K", "Illustrative death claim wait", "A scenario, not a measured processing time.", "A family waiting 45 days for a $500K death benefit while covering funeral costs on reduced income"),
  "ins.ex.life.cashvalue": example("$60,000, $15,000, $30,000 and $45,000", "Illustrative cash value breakdown", "The arithmetic is in the sentence: premiums plus interest less cost of insurance.", "'Your cash value is $45,000' is less useful than 'You've paid $60,000 in premiums, earned $15,000 in interest, and $30,000 has been applied to cost of insurance, resulting in a cash value of $45,000.'"),

  "ins.wc.monopolistic": fact("four", "States with an exclusive state fund for workers' compensation: North Dakota, Ohio, Washington and Wyoming", { publisher: "North Dakota Workforce Safety & Insurance", title: "Agency Overview & History", year: 2026, url: "https://www.workforcesafety.com/about-wsi/agency-overview-history" }),
  "ins.ex.wc.hours": example("8am to 5pm against 7am to 3:30pm", "Illustrative callback window against an injured worker's shift", "A scenario, not a measured schedule.", "A voicemail that says 'call us back between 8am and 5pm' reaches a worker whose shift runs 7am to 3:30pm."),
  "ins.ex.wc.rate": example("66% and 70%", "Illustrative wage replacement rates in two states", "Rates, maximums and wage bases differ by state; the figures show the error, they are not any state's rate.", "A bot that says 'you'll receive 66% of your average weekly wage' is wrong in a state where the rate is 70% or where the wage basis differs."),
  "ins.wc.contact": assumption("24 hours", "First contact with the injured worker after the first report of injury", "A service target from practice; not a published standard. Set it against your own claim outcomes."),

  "ins.sp.containment": assumption("under 10%", "Containment target for specialty lines", "From practice; nearly every specialty contact needs a specialist. Not a published figure.", "deflection"),

  "ins.ex.it.quote": example("15% within 24 hours", "Illustrative share of quoted, unbound users who contact support", "A scenario; measure your own.", "if 15% of users who complete a quote but don't bind contact support within 24 hours"),
  "ins.ex.it.bumper": example("$3,000 against $5,000", "Illustrative AI damage estimate against the repair cost", "A scenario, not a measured error rate.", "An AI that estimates $3,000 for a bumper repair when the actual cost is $5,000"),
};
