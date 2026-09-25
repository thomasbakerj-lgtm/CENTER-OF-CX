/* Telecommunications claims. See src/lib/claims.js for the kinds. `draft` holds the figure the page printed before the
 * scan, for lineage; it never renders.
 *
 * Research pass 2026-09-25. The pre-scan table printed four columns (telecom, cross-industry, top quartile, note) of
 * unsourced figures. Two published telecom figures exist on the publishers' own pages: SQM Group's 2026 telco call
 * center FCR (chart viewed) and Simon-Kucher's 2025 global telecom NPS. The top quartile column is gone (no public
 * source for any cell) and the churn row is retired (no public source for either cell). ACSI (theacsi.com) and
 * J.D. Power refused the fetch (HTTP 403), so no index score is used. */
const SQM_FCR_2026 = { publisher: "SQM Group", title: "First Call Resolution Benchmark: Measure, Benchmark, and Improve with AI (chart: FCR Benchmarking by Industry 2026)", year: 2026, url: "https://www.sqmgroup.com/resources/library/blog/fcr-metric-operating-philosophy" };
const SQM_KPI_2023 = { publisher: "SQM Group", title: "What Are the Industry Standards For the Top Call Center KPIs?", year: 2023, url: "https://www.sqmgroup.com/resources/library/blog/industry-standards-top-call-center-kpis" };
const SQM_FCR_2024 = { publisher: "SQM Group", title: "Call Center FCR Benchmark 2024 Results by Industry", year: 2025, url: "https://www.sqmgroup.com/resources/library/blog/call-center-fcr-benchmark-2024-results-by-industry" };
const SK_HAPPY = { publisher: "Simon-Kucher", title: "Leveraging customer happiness to drive growth: Key insights from the Global Telecommunications Study 2025", year: 2025, url: "https://www.simon-kucher.com/en/insights/leveraging-customer-happiness-drive-growth-key-insights-global-telecommunications-study" };
const SQM_POP = "SQM's benchmarked North American inbound customer service call centers, measured by post-call survey";
const SK_POP = "consumers surveyed by Simon-Kucher in 31 markets (over 15,700 respondents)";
const ECFR = (sec, title, url) => ({ publisher: "FCC, eCFR", title: `47 CFR ${sec}, ${title}`, year: 2026, url });
const fact = (value, label, source, test) => ({ kind: "fact", value, label, source, checked: "2026-09-25", ...(test ? { test } : {}) });
const none = (label, reason, draft, test) => ({ kind: "none", label, reason, draft, ...(test ? { test } : {}) });
const assume = (value, label, rationale, test) => ({ kind: "assumption", value, label, rationale, ...(test ? { test } : {}) });
const example = (value, label, rationale, text) => ({ kind: "example", value, label, rationale, ...(text ? { text } : {}) });
const NO_TEL = "No free public source publishes this metric for telecom contact centers; the public telecom breakouts are SQM Group's telco first contact resolution and Simon-Kucher's consumer NPS.";

const bench = {
  "tel.bench.csat.tel": none("Customer satisfaction, telecom contact centers", `${NO_TEL} ACSI and J.D. Power publish telecom index scores on other scales.`, "68%"),
  "tel.bench.csat.cross": fact("78%", `Customer satisfaction, all industries, share of customers very satisfied (top box); ${SQM_POP}`, SQM_KPI_2023),
  "tel.bench.fcr.tel": fact("56%", `First contact resolution, telco call centers, average (range 41% to 69%); ${SQM_POP}`, SQM_FCR_2026, "fcr"),
  "tel.bench.fcr.cross": fact("71%", `First contact resolution, all industries, average (range 40% to 91%); ${SQM_POP}`, SQM_FCR_2026, "fcr"),
  "tel.bench.aht.tel": none("Average handle time, telecom contact centers", NO_TEL, "8:30", "aht"),
  "tel.bench.aht.cross": fact("11:37", "Average handle time (697 seconds, talk plus wrap), SQM's 2024 benchmarking participants, all industries", SQM_FCR_2024, "aht"),
  "tel.bench.nps.tel": fact("14", `Net Promoter Score, telecom providers globally; ${SK_POP}`, SK_HAPPY),
  "tel.bench.nps.cross": fact("16 to 80", "Net Promoter Score range of the other industries Simon-Kucher compares telecom with, as stated in the study summary; the page does not name the industries or their survey", SK_HAPPY),
  "tel.bench.attrition.tel": none("Annual agent attrition, telecom contact centers", `${NO_TEL} BLS JOLTS quits for the information sector cover every worker in the sector, not agents.`, "45%", "attrition"),
  "tel.bench.attrition.cross": fact("34%", "Annual agent turnover, SQM's 2024 benchmarking participants, all industries", SQM_FCR_2024, "attrition"),
  "tel.stat.fcr": fact("36 to 38%", `Mobile and broadband customer support issues resolved on first contact, as reported by ${SK_POP}`, SK_HAPPY, "fcr"),
};

const SV = {
  "mobile-wireless":      { aht: "9:00", fcr: "38%", csat: "66%", containment: "32%" },
  "broadband-isp":        { aht: "10:30", fcr: "42%", csat: "64%", containment: "20%" },
  "cable-tv":             { aht: "8:00", fcr: "55%", csat: "63%", containment: "25%" },
  "enterprise-comms":     { aht: "12:00", fcr: "48%", csat: "72%", containment: "12%" },
  "managed-services":     { aht: "14:00", fcr: "35%", csat: "74%", containment: "8%" },
  "fiber-infrastructure": { aht: "7:00", fcr: "50%", csat: "72%", containment: "25%" },
};
/* Research pass 2026-09-25: no free public source publishes these four metrics for any telecom segment. SQM's telco FCR
 * covers telco call centers as one group; Simon-Kucher's 36 to 38% is consumer-reported and covers mobile and broadband
 * together. Neither is stretched to a segment tile. */
const SV_TEST = { aht: "aht", fcr: "fcr", containment: "deflection" };
const SV_LABEL = { aht: "Average handle time", fcr: "First contact resolution", csat: "Customer satisfaction", containment: "Self-service containment" };
const SV_REASON = {
  aht: "No regulator or trade body publishes handle time for this segment.",
  fcr: "No public source publishes first contact resolution for this segment; SQM Group's telco figure covers telco call centers as one group.",
  csat: "No public CSAT percentage exists for this segment; ACSI and J.D. Power publish telecom index scores on other scales.",
  containment: "No regulator or trade body publishes self-service containment for this segment.",
};
const sv = {};
for (const [slug, kpis] of Object.entries(SV)) for (const [m, v] of Object.entries(kpis)) {
  sv[`tel.sv.${slug}.${m}`] = { kind: "none", label: `${SV_LABEL[m]}, ${slug.replace(/-/g, " ")} contact centers`, reason: SV_REASON[m], draft: v, ...(SV_TEST[m] ? { test: SV_TEST[m] } : {}) };
}

export default {
  ...bench,
  ...sv,

  /* Regulation, read on eCFR (title 47 current to 2026-09-23) and the Federal Register. */
  "tel.fcc.cpni": fact("47 CFR 64.2010", "FCC CPNI safeguards: carriers must authenticate a customer before disclosing CPNI on a customer-initiated call, and may disclose call detail by phone only after a password that is not prompted by readily available biographical or account information", ECFR("64.2010", "Safeguards on the disclosure of customer proprietary network information", "https://www.ecfr.gov/current/title-47/chapter-I/subchapter-B/part-64/subpart-U/section-64.2010")),
  "tel.fcc.simswap": fact("47 CFR 64.2010(h)", "FCC SIM change rule for wireless carriers: secure authentication without readily available biographical, account, recent payment or call detail information; staff unable to see CPNI until the caller is authenticated; staff training on SIM swap fraud. Paragraph (h)(9) states compliance is not required until a compliance date is added", ECFR("64.2010(h)", "Subscriber Identity Module (SIM) changes", "https://www.ecfr.gov/current/title-47/chapter-I/subchapter-B/part-64/subpart-U/section-64.2010")),
  "tel.fcc.labels": fact("47 CFR 8.1", "FCC broadband consumer label: each provider displays a label with prices, fees, and typical speed and latency at every point of sale, which the rule defines to include sales over the phone", ECFR("8.1", "Transparency", "https://www.ecfr.gov/current/title-47/chapter-I/subchapter-A/part-8/section-8.1")),
  "tel.fcc.labels.2026": fact("August 2026", "FCC order modifying broadband label rules, including how label information is given over the phone; effective September 14, 2026 except its change to 47 CFR 8.1(a), which is delayed until the FCC announces a date", { publisher: "FCC, Federal Register", title: "Empowering Broadband Consumers Through Transparency (2026-16503)", year: 2026, url: "https://www.federalregister.gov/documents/2026/08/13/2026-16503/empowering-broadband-consumers-through-transparency" }),
  "tel.fcc.onshoring": fact("April 2026 proposal", "FCC proposed rules to limit use of foreign call centers by telecom, wireless, interconnected VoIP, cable and satellite providers and to raise standards for the remaining foreign operations; a proposal, with no rule adopted as of the date checked", { publisher: "FCC, Federal Register", title: "Improving Customer Service and Protecting Consumers Through Onshoring (2026-07960)", year: 2026, url: "https://www.federalregister.gov/documents/2026/04/23/2026-07960/improving-customer-service-and-protecting-consumers-through-onshoring" }),
  "tel.fcc.cable.answer": fact("30 seconds, 90% of the time", "FCC cable customer service standard a franchise authority may enforce: phone answer time by a representative, including wait, under normal operating conditions, measured quarterly; transfers also within 30 seconds; busy signal less than 3% of the time (47 CFR 76.309(c)(1))", ECFR("76.309", "Customer service obligations", "https://www.ecfr.gov/current/title-47/chapter-I/subchapter-C/part-76/subpart-H/section-76.309"), "staffing"),

  /* Planning assumptions from practice: no public source; each says how to measure your own. */
  "tel.billing.share": assume("30 to 40%", "Share of inbound telecom calls that are billing related", "From practice; no public source reports a contact reason mix for telecom. Count your own contacts by reason."),
  "tel.outage.share": assume("15 to 20% of peak volume", "Peak volume an outage intercept can remove", "From practice; depends on outage frequency and how many callers the intercept reaches. Measure the share of your own peak volume that is outage calls.", "deflection"),
  "tel.cable.promo.lead": assume("60 days", "Outreach lead time before a promotional price expires", "A design choice that leaves time for a retention offer before the first higher bill; set your own."),
  "tel.ent.alert": assume("2 minutes", "Target from NOC detection to customer alert for enterprise accounts", "A design target that aims to reach the customer before their own staff notice; set yours by contract tier."),
  "tel.msp.mttv": assume("60 to 70%", "Share of multi-vendor incident resolution time spent finding and engaging the responsible vendor", "From practice; no published figure. Time-stamp vendor engagement in your own tickets to measure it.", "aht"),
  "tel.fiber.gap": assume("3 to 12 months", "Time from sign-up to fiber availability", "From practice; depends on permitting and construction. Track your own sign-up to activation interval."),
  "tel.fiber.presale": assume("half or more", "Pre-sale share of contact volume during a fiber build-out", "From practice; varies with build pace and marketing. Count your own pre-sale and active subscriber contacts.", "forecast"),

  /* Worked examples: the scenario is in the sentence. */
  "tel.ex.churn-mix": example("2% a month", "Illustrative churn rate and churn cause split", "Shows why a cause split is more useful than a rate; not measured figures.", "A rate of 2% monthly churn says how many left. A split of 35% for price, 25% for network, 20% for service, and 20% for competitor offers says why."),
  "tel.ex.bill": example("$120", "Illustrative bill a bot explains line by line", "Shows the limit of a bill explanation bot; the charges add to the total.", "A bot that says 'your bill is $120 this month because of a $30 plan charge, a $15 device installment, and $75 in usage' sounds helpful until the customer says 'but my plan was supposed to be $80.'"),
  "tel.ex.uptime": example("about 43 minutes", "Downtime allowed by 99.9% uptime in a 30 day month", "Arithmetic: 0.1% of 43,200 minutes is 43.2 minutes. The page previously said 87 minutes, which is 99.8% uptime.", "At 99.9% uptime a service can still be down about 43 minutes in a 30 day month."),
  "tel.ex.wifi": example("30 and 500 Mbps", "Illustrative WiFi speed against a subscribed plan", "A scenario, not a measured case.", "A customer on WiFi getting 30 Mbps complains about paying for 500 Mbps, when the bottleneck is their own router."),
  "tel.ex.cable-downgrade": example("$200 and $50", "Illustrative downgrade from a triple-play bundle", "Arithmetic: losing $150 of $200 is 75% of the revenue.", "A customer who moves from a $200 triple-play bundle to a $50 internet-only plan is still a subscriber, but the account has lost 75% of its revenue."),
  "tel.ex.equipment": example("$300", "Illustrative unreturned equipment charge", "A scenario, not a measured charge.", "The subscriber cancels, returns the set-top box to the local office, and receives a $300 unreturned equipment charge 60 days later."),
  "tel.ex.viewing": example("40 and 5 hours", "Illustrative weekly viewing of two subscribers", "A scenario, not measured viewing.", "A subscriber who watches 40 hours of sports a week has different retention levers from one who watches 5 hours of news."),
  "tel.ex.sla-report": example("99.95% and 99.9%", "Illustrative uptime and reporting trade-off", "A scenario, not a measured case.", "A carrier that delivers 99.95% uptime but sends monthly SLA reports 3 weeks late can lose the account to one that delivers 99.9% with real-time SLA dashboards."),
  "tel.ex.ent-queue": example("$50K a month", "Illustrative enterprise circuit caught in a consumer queue", "A scenario, not a measured case.", "An enterprise customer whose $50K a month MPLS circuit is down should never hear 'your estimated wait time is 12 minutes' because the consumer billing queue is backed up."),
  "tel.ex.noc": example("2:03pm and 2:05pm", "Illustrative detection and customer call times", "A scenario, not a measured case.", "If your NOC detects a circuit degradation at 2:03pm and the customer calls at 2:05pm to report it, the notification came too late."),
  "tel.ex.sla-credit": example("12 minutes", "Illustrative proactive SLA credit message", "A scenario; the credit amount is left open.", "'We missed our SLA on your Dallas circuit by 12 minutes last month. We have applied a credit to your next invoice.'"),
  "tel.ex.ent-aht": example("12 minutes", "Illustrative split of an enterprise handle time", "Arithmetic: 5 minutes of navigation plus 7 of help is 12; not a measured split.", "A 12 minute call can hold 5 minutes of navigating systems and 7 minutes of helping the customer."),
  "tel.ex.cmdb": example("100 Mbps and 1 Gbps", "Illustrative stale configuration record", "A scenario, not a measured case.", "If the CMDB shows the client's primary circuit as a 100 Mbps MPLS link but the client moved to 1 Gbps SD-WAN 6 months ago, the NOC engineer troubleshoots the wrong circuit."),
  "tel.ex.lateral": example("$5,000 and 50 feet", "Illustrative availability data errors", "A scenario, not measured cases.", "GIS data may show 'serviceable' for an address that needs a $5,000 lateral build, or 'not serviceable' for an address 50 feet from the main fiber line."),
};
