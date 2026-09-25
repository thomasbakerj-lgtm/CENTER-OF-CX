/* Travel and hospitality claims. See src/lib/claims.js for the kinds. `draft` holds the figure the page printed before
 * the scan, for lineage; it never renders.
 *
 * Research pass 2026-09-25. The pre-scan table printed three columns (travel, cross-industry, top quartile) of
 * unsourced figures. No free public source publishes contact center metrics for travel or hospitality: SQM Group's
 * industry breakouts (2024 and 2026 FCR charts) carry no travel segment. The top quartile column is gone (no public
 * source for any cell). The all-industry cells are SQM Group's own figures, each labelled with what it measures. The
 * published travel figures are regulatory: the US automatic refund rule (14 CFR part 260, read on eCFR) and EU
 * Regulation 261/2004 (read on the EU Publications Office copy of the EUR-Lex text). */

const CHECKED = "2026-09-25";
const SQM_FCR_2026 = { publisher: "SQM Group", title: "First Call Resolution Benchmark: Measure, Benchmark, and Improve with AI (chart: FCR Benchmarking by Industry 2026)", year: 2026, url: "https://www.sqmgroup.com/resources/library/blog/fcr-metric-operating-philosophy" };
const SQM_KPI_2023 = { publisher: "SQM Group", title: "What Are the Industry Standards For the Top Call Center KPIs?", year: 2023, url: "https://www.sqmgroup.com/resources/library/blog/industry-standards-top-call-center-kpis" };
const SQM_FCR_2024 = { publisher: "SQM Group", title: "Call Center FCR Benchmark 2024 Results by Industry", year: 2025, url: "https://www.sqmgroup.com/resources/library/blog/call-center-fcr-benchmark-2024-results-by-industry" };
const SQM_POP = "SQM's benchmarked North American inbound customer service call centers, measured by post-call survey";

const CFR_260_2 = { publisher: "US DOT, eCFR", title: "14 CFR 260.2, Definitions (Refunds and Other Consumer Protections)", year: 2026, url: "https://www.ecfr.gov/current/title-14/chapter-II/subchapter-A/part-260/section-260.2" };
const CFR_260_9 = { publisher: "US DOT, eCFR", title: "14 CFR 260.9, Notification to consumers", year: 2026, url: "https://www.ecfr.gov/current/title-14/chapter-II/subchapter-A/part-260/section-260.9" };
const EU261 = { publisher: "EUR-Lex", title: "Regulation (EC) No 261/2004 on compensation and assistance to air passengers", year: 2004, url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32004R0261" };

const fact = (value, label, source, test) => ({ kind: "fact", value, label, source, checked: CHECKED, ...(test ? { test } : {}) });
const none = (label, reason, draft, test) => ({ kind: "none", label, reason, draft, ...(test ? { test } : {}) });
const assumption = (value, label, rationale, test) => ({ kind: "assumption", value, label, rationale, ...(test ? { test } : {}) });
const example = (value, label, rationale, text) => ({ kind: "example", value, label, rationale, text });

const NO_TRV = "No free public source publishes this metric for travel or hospitality contact centers; SQM Group's published industry breakouts carry no travel segment.";

const bench = {
  "trv.bench.csat.trv": none("Customer satisfaction, travel and hospitality contact centers", NO_TRV, "72%"),
  "trv.bench.csat.cross": fact("78%", `Customer satisfaction, all industries, share of customers very satisfied (top box); ${SQM_POP}`, SQM_KPI_2023),
  "trv.bench.fcr.trv": none("First contact resolution, travel and hospitality contact centers", NO_TRV, "58%", "fcr"),
  "trv.bench.fcr.cross": fact("71%", `First contact resolution, all industries, average (range 40% to 91%); ${SQM_POP}`, SQM_FCR_2026, "fcr"),
  "trv.bench.aht.trv": none("Average handle time, travel and hospitality contact centers", NO_TRV, "8:00", "aht"),
  "trv.bench.aht.cross": fact("11:37", "Average handle time (697 seconds, talk plus wrap), SQM's 2024 benchmarking participants, all industries", SQM_FCR_2024, "aht"),
  "trv.bench.abandon.trv": none("Abandon rate, travel and hospitality contact centers", NO_TRV, "12%", "staffing"),
  "trv.bench.abandon.cross": fact("6%", "Abandon rate, SQM's stated call center industry standard, all industries", SQM_KPI_2023, "staffing"),
  "trv.bench.attrition.trv": none("Annual agent attrition, travel and hospitality contact centers", `${NO_TRV} BLS JOLTS quits for accommodation and food services cover every worker in the sector, not agents.`, "38%", "attrition"),
  "trv.bench.attrition.cross": fact("34%", "Annual agent turnover, SQM's 2024 benchmarking participants, all industries", SQM_FCR_2024, "attrition"),
  "trv.bench.digital.trv": none("Digital self-service adoption, travel and hospitality", `${NO_TRV} No public source defines digital adoption for contact centers in a comparable way.`, "35%", "channel"),
  "trv.bench.digital.cross": none("Digital self-service adoption, all industries", "No free public source publishes digital adoption for contact centers across industries with a stated definition and population.", "30%", "channel"),
};

/* Research pass 2026-09-25: no regulator or trade body publishes these four metrics for any travel segment. */
const SV = {
  "airlines":          { aht: "9:30", fcr: "52%", csat: "68%", containment: "30%" },
  "hotels-resorts":    { aht: "6:30", fcr: "65%", csat: "76%", containment: "28%" },
  "otas":              { aht: "10:00", fcr: "45%", csat: "65%", containment: "25%" },
  "car-rental":        { aht: "5:45", fcr: "70%", csat: "72%", containment: "35%" },
  "cruise-lines":      { aht: "11:00", fcr: "60%", csat: "82%", containment: "15%" },
  "tours-experiences": { aht: "5:00", fcr: "72%", csat: "78%", containment: "32%" },
};
const SV_NAME = { "airlines": "airline", "hotels-resorts": "hotel and resort", "otas": "online travel agency", "car-rental": "car rental", "cruise-lines": "cruise line", "tours-experiences": "tours and experiences" };
const SV_TEST = { aht: "aht", fcr: "fcr", containment: "deflection" };
const SV_LABEL = { aht: "Average handle time", fcr: "First contact resolution", csat: "Customer satisfaction", containment: "Self-service containment" };
const SV_REASON = {
  aht: "No regulator or trade body publishes handle time for this segment.",
  fcr: "No regulator or trade body publishes first contact resolution for this segment; SQM Group's industry breakouts carry no travel segment.",
  csat: "No public contact center CSAT percentage exists for this segment; published travel satisfaction studies report index scores on other scales.",
  containment: "No regulator or trade body publishes self-service containment for this segment.",
};
const sv = {};
for (const [slug, kpis] of Object.entries(SV)) for (const [m, v] of Object.entries(kpis)) {
  sv[`trv.sv.${slug}.${m}`] = none(`${SV_LABEL[m]}, ${SV_NAME[slug]} contact centers`, SV_REASON[m], v, SV_TEST[m]);
}

const regs = {
  "trv.dot.refund.card": fact("7 business days", "US automatic refund rule: a prompt refund of a fare or fee paid by credit card is due within 7 business days of the earliest date it was requested (14 CFR 260.2, prompt refund)", CFR_260_2),
  "trv.dot.refund.other": fact("20 calendar days", "US automatic refund rule: a prompt refund of a fare or fee paid by cash, check, debit card or other means is due within 20 calendar days (14 CFR 260.2, prompt refund)", CFR_260_2),
  "trv.dot.sigchange": fact("3 hours domestic, 6 hours international", "US automatic refund rule: a departure moved earlier or an arrival moved later by at least this much is a significant change, and a passenger who declines the new flight is owed a refund (14 CFR 260.2)", CFR_260_2),
  "trv.dot.downgrade": fact("a significant change", "US automatic refund rule: a downgrade to a lower class of service, or an itinerary with more connection points, is a significant change; a passenger who declines it is owed a refund (14 CFR 260.2)", CFR_260_2),
  "trv.dot.bag": fact("12 hours", "US automatic refund rule: a checked bag not delivered within 12 hours of a domestic arrival is significantly delayed and its fee is refundable (15 or 30 hours on international itineraries, by segment length; 14 CFR 260.2)", CFR_260_2),
  "trv.dot.notify": fact("notify affected passengers", "US automatic refund rule: on a cancellation or significant change a covered carrier must timely notify affected passengers, and its notification systems must tell passengers owed a refund of their right to it (14 CFR 260.9)", CFR_260_9),
  "trv.eu261.comp": fact("EUR 250 to 600", "EU Regulation 261/2004, compensation per passenger by flight distance: EUR 250 up to 1,500 km, EUR 400 for longer intra-EU flights and other flights of 1,500 to 3,500 km, EUR 600 for all others (Article 7(1))", EU261),
  "trv.eu261.notice": fact("at least two hours", "EU Regulation 261/2004: a carrier that denies boarding or cancels must give each affected passenger a written notice of the compensation and assistance rules, and an equivalent notice to each passenger delayed by at least two hours (Article 14(2))", EU261),
  "trv.eu261.twoweeks": fact("at least two weeks", "EU Regulation 261/2004: cancellation compensation does not apply when passengers are told of the cancellation at least two weeks before departure; shorter notice is exempt only with re-routing inside set time windows (Article 5(1)(c))", EU261),
  "trv.eu261.refund": fact("seven days", "EU Regulation 261/2004: on a cancellation, reimbursement of the ticket, when the passenger chooses it, is due within seven days (Article 8(1)(a))", EU261),
  "trv.eu261.scope": fact("departure airport and carrier", "EU Regulation 261/2004 applies to passengers departing from an airport in a Member State, and to passengers flying from a third country into a Member State on an EU carrier (Article 3(1)); residence does not set its scope", EU261),
};

const planning = {
  "trv.roadside.answer": assumption("30 seconds", "Answer target for roadside assistance calls", "A service target from practice for a caller who may be stranded; set your own and staff to it.", "staffing"),
  "trv.ota.supplier.lag": assumption("4 to 8 weeks", "Time for a supplier refund to reach an online travel agency", "From practice; varies by supplier, payment path and jurisdiction. Not a published figure. Track your own supplier refund cycle times."),
  "trv.cruise.docchecks": assumption("90, 30 and 7 days", "Pre-sailing points at which to check guest travel documents", "A design choice that leaves time to renew a passport or obtain a visa before sailing; set your own."),
  "trv.tours.meeting": assumption("24 hours and again 2 hours", "Lead times for sending the meeting point before a tour", "A design choice from practice; test it against your own no-show and where-is-my-guide contacts.", "channel"),
};

const examples = {
  "trv.ex.irop.hold": example("20 minutes and 2 hours", "Illustrative gap between operational and passenger views of a disruption", "A scenario, not a measured case.", "A flight that is cancelled and rebooked within 20 minutes on the operations report can still leave a passenger on hold for 2 hours to learn the new plan."),
  "trv.ex.connection": example("45 minutes", "Illustrative bad automatic rebooking", "A scenario, not a measured case.", "A bot that moves a business class passenger to an economy seat with a 45 minute connection through an unfamiliar hub has created a worse problem than the cancellation."),
  "trv.ex.hotel.tier": example("50+ nights and $15K a year", "Illustrative value of a top-tier loyalty member", "A scenario; use your own program's tier thresholds and spend.", "The Platinum member may have stayed 50+ nights and spent $15K a year with the brand."),
  "trv.ex.car.branch": example("3 times", "Illustrative branch-level complaint finding", "Shows the form of an actionable finding; not a measured rate.", "'Branch 247 generates 3 times the network's complaints per rental' is actionable; 'overall CSAT is 72%' is not."),
  "trv.ex.cruise.silence": example("10 months", "Illustrative gap between booking and sailing", "A scenario, not a measured booking window.", "A guest who books in January for a November sailing faces 10 months of silence, or of upsell emails."),
  "trv.ex.cruise.dining": example("2pm and 1pm", "Illustrative schedule conflict", "A scenario.", "Booking a shore excursion that returns at 2pm for a guest holding a 1pm specialty dining reservation creates a conflict the bot should catch."),
  "trv.ex.cruise.sync": example("2 hours", "Illustrative shore to ship sync delay", "A scenario.", "A guest who books an excursion through the contact center 2 hours before the ship reaches port may find it unconfirmed on the ship's system."),
  "trv.ex.tours.rating": example("5 stars and 2 stars", "Illustrative rating spread for one tour", "A scenario, not measured ratings.", "The same tour can earn 5 stars one day and 2 stars the next, and a 4.5 star product can hide one guide who is rated 2 stars again and again."),
  "trv.ex.tours.tz": example("6am Iceland time", "Illustrative time zone gap", "Arithmetic: Iceland is UTC+0, Tokyo UTC+9, Manila UTC+8.", "A customer in Tokyo books a tour in Reykjavik and needs support at 6am Iceland time: 3pm in Tokyo and 2pm at a support center in Manila."),
  "trv.ex.tours.weather": example("500 tours", "Illustrative weather cancellation surge", "A scenario, not a measured event.", "A hurricane warning in Hawaii can cancel 500 tours in one day, each needing a rebooking or a refund: 500 calls if handled one by one, close to none if processed in bulk before travelers call."),
};

export default { ...bench, ...sv, ...regs, ...planning, ...examples };
