/* Utilities and Energy claims. See src/lib/claims.js for the kinds. `draft` holds the figure the page printed before
 * the scan; it never renders.
 *
 * Research pass 2026-09-25. The pre-scan table printed three columns (utilities, cross-industry, top quartile) of
 * unsourced figures and a storm volume multiple with no publisher. One utilities figure is published: SQM Group's
 * Energy first contact resolution. EIA publishes outage duration and frequency per customer, used in the stats strip,
 * the storm failure mode and the hub card. The strip's ACSI and J.D. Power figures could not be re-read on the
 * publishers' own pages (theacsi.com and jdpower.com refuse this network) and were retired until they can be. */
const SQM_FCR_2026 = { publisher: "SQM Group", title: "First Call Resolution Benchmark: Measure, Benchmark, and Improve with AI (chart: FCR Benchmarking by Industry 2026)", year: 2026, url: "https://www.sqmgroup.com/resources/library/blog/fcr-metric-operating-philosophy" };
const SQM_KPI_2023 = { publisher: "SQM Group", title: "What Are the Industry Standards For the Top Call Center KPIs?", year: 2023, url: "https://www.sqmgroup.com/resources/library/blog/industry-standards-top-call-center-kpis" };
const SQM_FCR_2024 = { publisher: "SQM Group", title: "Call Center FCR Benchmark 2024 Results by Industry", year: 2025, url: "https://www.sqmgroup.com/resources/library/blog/call-center-fcr-benchmark-2024-results-by-industry" };
const EIA_2024 = { publisher: "U.S. Energy Information Administration", title: "Hurricanes in 2024 led to the most hours without power in the United States in 10 years (Today in Energy, from Electric Power Annual 2024)", year: 2025, url: "https://www.eia.gov/todayinenergy/detail.php?id=66744" };
const PHMSA = { publisher: "PHMSA, eCFR", title: "49 CFR 192.615, Emergency plans", year: 2026, url: "https://www.ecfr.gov/current/title-49/subtitle-B/chapter-I/subchapter-D/part-192/subpart-L/section-192.615" };
const LCR = { publisher: "EPA, eCFR", title: "40 CFR 141.84, Service line inventory and replacement requirements", year: 2026, url: "https://www.ecfr.gov/current/title-40/chapter-I/subchapter-D/part-141/subpart-I/section-141.84" };
const SQM_POP = "SQM's benchmarked North American inbound customer service call centers, measured by post-call survey";
const fact = (value, label, source, test) => ({ kind: "fact", value, label, source, checked: "2026-09-25", ...(test ? { test } : {}) });
const none = (label, reason, draft, test) => ({ kind: "none", label, reason, draft, ...(test ? { test } : {}) });
const assume = (value, label, rationale, test) => ({ kind: "assumption", value, label, rationale, ...(test ? { test } : {}) });
const example = (value, label, rationale, text) => ({ kind: "example", value, label, rationale, text });
const NO_UTL = "No free public source publishes this metric for utility contact centers; the only public utilities breakout found (SQM Group) covers first contact resolution in energy call centers.";

const bench = {
  "utl.bench.fcr.utl": fact("70%", `First contact resolution, energy call centers, average (range 54% to 80%); ${SQM_POP}`, SQM_FCR_2026, "fcr"),
  "utl.bench.fcr.cross": fact("71%", `First contact resolution, all industries, average (range 40% to 91%); ${SQM_POP}`, SQM_FCR_2026, "fcr"),
  "utl.bench.csat.utl": none("Customer satisfaction, utility contact centers", `${NO_UTL} ACSI and J.D. Power publish utility index scores on other scales, which measure the whole utility relationship.`, "73"),
  "utl.bench.csat.cross": fact("78%", `Customer satisfaction, all industries, share of customers very satisfied (top box); ${SQM_POP}`, SQM_KPI_2023),
  "utl.bench.aht.utl": none("Average handle time, utility contact centers", NO_UTL, "7:30", "aht"),
  "utl.bench.aht.cross": fact("11:37", "Average handle time (697 seconds, talk plus wrap), SQM's 2024 benchmarking participants, all industries", SQM_FCR_2024, "aht"),
  "utl.bench.abandon.utl": none("Abandon rate, utility contact centers", NO_UTL, undefined, "staffing"),
  "utl.bench.abandon.cross": fact("6%", "Abandon rate, SQM's stated call center industry standard, all industries", SQM_KPI_2023, "staffing"),
  "utl.bench.attrition.utl": none("Annual agent attrition, utility contact centers", `${NO_UTL} BLS JOLTS quits for utilities cover every worker in the sector, not agents.`, "30%", "attrition"),
  "utl.bench.attrition.cross": fact("34%", "Annual agent turnover, SQM's 2024 benchmarking participants, all industries", SQM_FCR_2024, "attrition"),
  "utl.bench.storm.utl": none("Storm day call volume against a normal day, utility contact centers", "No regulator or trade body publishes storm call volume multiples; EIA publishes customer outage hours, not contacts. Forecast from your own past storm events.", "10-50x", "forecast"),
};

/* Sub-page tiles. No free public source publishes these metrics for any utility segment (SQM's Energy FCR is an
 * industry figure and is not stretched to a segment; ACSI publishes segment index scores on a 0 to 100 scale that
 * cannot be read as a contact center CSAT, and could not be re-read here). */
const SV = {
  "electric-iou":   { aht: "7:30", fcr: "62%", csat: "72", storm: "10-50x" },
  "natural-gas":    { aht: "6:30", fcr: "68%", csat: "75", containment: "28%" },
  "water":          { aht: "5:30", fcr: "70%", csat: "74", containment: "30%" },
  "municipal-coop": { aht: "6:00", fcr: "72%", csat: "78", containment: "20%" },
  "renewable-der":  { aht: "11:00", fcr: "45%", csat: "68", containment: "15%" },
  "energy-retail":  { aht: "5:30", fcr: "75%", csat: "70", churn: "25%" },
};
const SV_TEST = { aht: "aht", fcr: "fcr", containment: "deflection", storm: "forecast" };
const SV_LABEL = { aht: "Average handle time", fcr: "First contact resolution", csat: "Customer satisfaction", containment: "Self-service containment", storm: "Storm day call volume against a normal day", churn: "Annual customer churn" };
const SV_REASON = {
  aht: "No regulator or trade body publishes handle time for this segment.",
  fcr: "No regulator or trade body publishes first contact resolution for this segment; SQM Group's energy figure covers the industry as a whole.",
  csat: "No public contact center CSAT percentage exists for this segment; ACSI and J.D. Power publish utility index scores on other scales.",
  containment: "No regulator or trade body publishes self-service containment for this segment.",
  storm: "No regulator or trade body publishes storm call volume multiples; EIA publishes customer outage hours, not contacts.",
  churn: "No regulator publishes a national churn rate for competitive retail energy suppliers; state switching statistics count accounts served, not churn.",
};
const sv = {};
for (const [slug, kpis] of Object.entries(SV)) for (const [m, v] of Object.entries(kpis)) {
  sv[`utl.sv.${slug}.${m}`] = { kind: "none", label: (m === "churn" ? `${SV_LABEL[m]}, competitive retail energy suppliers` : `${SV_LABEL[m]}, ${slug.replace(/-/g, " ")} contact centers`), reason: SV_REASON[m], draft: v, ...(SV_TEST[m] ? { test: SV_TEST[m] } : {}) };
}

export default {
  ...bench,
  ...sv,

  /* EIA, read on eia.gov 2026-09-25. */
  "utl.eia.hours": fact("11 hours", "Average time without power per U.S. electricity customer in 2024 (SAIDI including major events), nearly twice the average of the decade before", EIA_2024),
  "utl.eia.major": fact("80%", "Share of 2024 U.S. customer hours without power attributed to major events such as Hurricanes Beryl, Helene and Milton", EIA_2024),
  "utl.eia.routine": fact("about two hours", "Average yearly time without power per U.S. customer from interruptions not triggered by major events", EIA_2024),
  "utl.eia.saifi": fact("1.5", "Average number of power interruptions per U.S. electricity customer in 2024 (SAIFI)", EIA_2024),
  "utl.eia.helene": fact("5.9 million customers", "Customers left without power across 10 states by Hurricane Helene, September 2024", EIA_2024),

  /* Regulation, read on eCFR 2026-09-25. */
  "utl.gas.phmsa": fact("prompt and effective response", "What a gas operator's written emergency procedures must provide for a notice of gas detected inside or near a building (49 CFR 192.615(a)(3)(i)); the rule sets no minute limit, response time targets come from the operator's plan and state commissions", PHMSA),
  "utl.water.lcr.inventory": fact("October 16, 2024", "Date by which every water system had to submit its initial service line inventory to the State (40 CFR 141.84(a)(1)); the inventory must be publicly accessible, and online for systems serving more than 50,000 people (141.84(a)(5))", LCR),
  "utl.water.lcr.recheck": fact("30 days", "Time a water system has to respond with an offer to inspect when a customer reports that their service line material is categorized wrongly in the inventory (40 CFR 141.84(b)(4))", LCR),

  /* Planning assumptions and worked examples. */
  "utl.bill.explain": assume("3 to 5 minutes", "Time an agent spends interpreting the bill before reaching the customer's concern on a billing call", "From practice; not a published figure. Split your own billing calls into explanation and resolution time.", "aht"),
  "utl.gas.cluster": assume("two or more reports in the same area within 30 minutes", "Trigger for a clustering alert on gas odor reports", "A design choice; set the count and window against your own leak history."),
  "utl.retail.renewal": assume("60 to 90 days", "Lead time before fixed-rate contract expiration for renewal outreach", "From practice; not a published figure. Test your own renewal timing against retention.", "channel"),
  "utl.retail.estreads": assume("15%", "Share of estimated meter reads at which to treat utility EDI data as a quality problem", "A threshold from practice; not a published figure. Track your own estimated read share against billing disputes."),
  "utl.ex.storm": example("200,000 customers", "Illustrative storm outage", "A scenario, not a measured event.", "A major storm knocks out power for 200,000 customers, and many of them call to report the outage and ask when power will be back."),
  "utl.ex.callbacks": example("2 hours, 4 hours and the next morning", "Illustrative callback pattern when field status does not reach the customer", "A scenario, not a measured pattern.", "The customer receives no updates, so they call back 2 hours later, 4 hours later and again the next morning."),
  "utl.ex.oms": example("15 minutes and 5 minutes", "Illustrative lag between an outage and a status page refresh", "A scenario; measure your own OMS to bot refresh interval.", "If the bot reads a status page that refreshes every 15 minutes, a customer whose power went out 5 minutes ago can hear that there are no known outages in their area."),
  "utl.ex.gasdispatch": example("60 minutes and 10 minutes", "Illustrative share of a response window used before dispatch", "A scenario; the response window comes from your own emergency plan and state rules.", "If your plan sets a 60 minute response and the call takes 10 minutes to process and dispatch, a sixth of the window is gone before a truck moves."),
  "utl.ex.boilwater": example("10,000 and 2,000", "Illustrative inbound surge after a boil-water advisory", "A scenario, not a measured call rate; forecast from your own past advisories.", "If 10,000 customers receive a boil-water advisory and 2,000 of them call with questions, the inbound queue needs staffing the outbound system does not provide."),
  "utl.ex.afterhours": example("9pm, 9:45pm and 45 minutes", "Illustrative delay in an answering service handoff", "A scenario, not a measured delay.", "A customer reports a downed power line at 9pm, the answering service takes a message, and the message reaches dispatch at 9:45pm: 45 minutes lost."),
  "utl.ex.usage": example("2,000 kWh and 800 kWh", "Illustrative seasonal usage swing", "A scenario; use the customer's own interval history.", "A customer who uses 2,000 kWh in summer and 800 kWh in winter sees a very different bill under a flat-rate plan than under a tiered plan."),
};
