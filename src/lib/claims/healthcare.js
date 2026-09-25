/* Healthcare claims (pilot). See src/lib/claims.js for the kinds. `draft` holds the figure the page printed before the
 * scan; `lead` says where the research pass looks first. A pending entry cannot ship. */

const pend = (draft, label, lead, test) => ({ kind: "fact", research: "pending", value: draft, label, lead, test });

const BENCH = {
  csat:      ["76%", "78%", "88%+", "Customer satisfaction"],
  fcr:       ["52%", "72%", "82%+", "First contact resolution"],
  aht:       ["6:36", "7:00", "5:20", "Average handle time"],
  abandon:   ["7%", "6%", "3%", "Abandon rate"],
  attrition: ["42%", "35%", "20%", "Annual agent attrition"],
  transfer:  ["19%", "15%", "8%", "Transfer rate"],
};
const BENCH_TEST = { csat: "qa", fcr: "fcr", aht: "aht", abandon: "staffing", attrition: "attrition", transfer: "fcr" };
const BENCH_LEAD = "SQM Group FCR by industry; ContactBabel US Contact Center Decision-Makers' Guide (healthcare breakdown); ACSI hospitals and health insurance indexes (index, not CSAT %); BLS JOLTS quits, health care and social assistance (economy-wide, not agent-specific)";

const bench = {};
for (const [m, [hc, cross, top, label]] of Object.entries(BENCH)) {
  bench[`hc.bench.${m}.hc`] = pend(hc, `${label}, healthcare contact centers`, BENCH_LEAD, BENCH_TEST[m]);
  bench[`hc.bench.${m}.cross`] = pend(cross, `${label}, all industries`, BENCH_LEAD, BENCH_TEST[m]);
  bench[`hc.bench.${m}.top`] = pend(top, `${label}, healthcare top quartile`, BENCH_LEAD, BENCH_TEST[m]);
}

const SV = {
  "health-systems":       { aht: "7:20", fcr: "48%", csat: "74%", containment: "18%" },
  "health-insurance":     { aht: "8:45", fcr: "55%", csat: "71%", containment: "25%" },
  "provider-groups":      { aht: "5:30", fcr: "62%", csat: "78%", containment: "22%" },
  "digital-health":       { aht: "4:30", fcr: "72%", csat: "80%", containment: "35%" },
  "pharma-life-sciences": { aht: "10:00", fcr: "72%", csat: "81%", containment: "15%" },
  "home-health":          { aht: "6:00", fcr: "55%", csat: "79%", containment: "10%" },
};
const SV_TEST = { aht: "aht", fcr: "fcr", csat: "qa", containment: "deflection" };
const sv = {};
for (const [slug, kpis] of Object.entries(SV)) for (const [m, v] of Object.entries(kpis)) {
  if (v) sv[`hc.sv.${slug}.${m}`] = pend(v, `${m.toUpperCase()}, ${slug.replace(/-/g, " ")}`, "Sub-segment benchmarks are rarely public; expect none unless a trade body or regulator publishes one", SV_TEST[m]);
}

export default {
  ...bench,
  ...sv,

  "hc.sched.calls": pend("3.5 times", "Calls per scheduling need", "Origin unknown; search the figure verbatim; likely retire", "fcr"),
  "hc.turnover": pend("40%", "Annual healthcare contact center agent turnover", "Same sources as the attrition benchmark", "attrition"),
  "hc.hipaa.penalty": pend("$100 to $50,000", "HIPAA civil money penalty per violation", "45 CFR 160.404 and the HHS annual inflation adjustment (current tiers are higher than the 2009 figures)"),
  "hc.noshow.reminders": pend("25 to 40%", "Reduction in no-show rates from automated reminders", "Peer-reviewed reviews of SMS and call reminders (PubMed, Cochrane)", "channel"),
  "hc.epic.share": { kind: "assumption", value: "70%+", label: "Share of patient access interactions whose data sits in Cadence, MyChart and Resolute", rationale: "From practice in Epic health systems; varies by module adoption. Not a published figure.", test: "aht" },
  "hc.referral.leak": pend("20 to 30%", "Internal referrals lost when not scheduled promptly", "Published referral leakage studies (health services research)", "fcr"),
  "hc.referral.delay": pend("2 to 3 week", "Specialist access delay from manual referral coordination", "Referral cycle time studies; likely a planning assumption", "fcr"),
  "hc.referral.gone": pend("30%", "Referred patients who schedule elsewhere or give up after a two-week delay", "Referral leakage studies; likely an example", "fcr"),
  "hc.fcr.stuck": { kind: "assumption", value: "50%", label: "FCR ceiling for health systems at Level 2 integration", rationale: "From practice; an illustration of where FCR stalls without EHR write-back. Not a published figure.", test: "fcr" },
  "hc.idcard.aht": { kind: "example", value: "90 seconds", label: "Illustrative handle time of an ID card request", rationale: "Contrasts a simple call with a prior authorization call." },
  "hc.admin.share": { kind: "assumption", value: "40%", label: "Specialist time spent on simple calls without intent segmentation", rationale: "From practice; depends on plan mix and routing. Not a published figure.", test: "aht" },
  "hc.oe.spike": pend("2 to 4x", "Open enrollment volume against a normal month", "CMS open enrollment call volume reports; payer investor disclosures", "forecast"),
  "hc.temp.training": { kind: "assumption", value: "2 weeks", label: "Typical training for seasonal temporary agents", rationale: "From practice; not a published figure.", test: "staffing" },
  "hc.cms.grievance": pend("30 days and 24 hours", "Medicare Advantage grievance resolution limits, standard and expedited", "42 CFR 422.564 on eCFR; CMS Parts C and D enrollee grievances guidance"),
  "hc.cms.alerts": { kind: "assumption", value: "20 days and 72 hours", label: "Escalation alert points ahead of the grievance limits", rationale: "A design choice that leaves working time before each limit; set your own." },
  "hc.admin.workload": pend("30 to 50%", "Reduction in administrative staff workload", "Vendor-stated; find the vendor's own claim or retire", "aht"),
  "hc.referral.window": { kind: "assumption", value: "24 hours", label: "Referral-to-appointment service target", rationale: "A service target from practice; set it against your own referral data.", test: "fcr" },
  "hc.ex.referral-fax": { kind: "example", value: "3 days and 2 weeks", label: "Illustrative referral delay in a fax-based workflow", rationale: "A scenario, not a measured delay.", text: "A PCP refers a patient to cardiology; the referral sits in a fax queue for 3 days; someone manually enters it into the scheduling system; the patient gets called 2 weeks later." },
  "hc.ex.referral-ortho": { kind: "example", value: "48 hours", label: "Illustrative window before a referred patient books elsewhere", rationale: "A scenario, not a measured window.", text: "A PCP refers a patient to the group's orthopedist; the contact center does not schedule the appointment within 48 hours; the patient searches 'orthopedist near me' and books with a competitor." },
  "hc.ex.copay": { kind: "example", value: "$40 and $60", label: "Illustrative copay quoted by a bot against the true copay", rationale: "Shows why a bot must read the deductible state before quoting.", text: "If a bot tells a member their specialist copay is $40 but the actual copay is $60 because they have not met their deductible, the member will rely on that $40 figure." },
  "hc.tele.support": { kind: "example", value: "15% and 8%", label: "Illustrative pre-visit support and visit abandonment rates", rationale: "A worked scenario; measure your own support contacts per visit.", text: "If 15% of patients call support before their visit and 8% of those abandon the visit entirely, you have a technical barrier to care that only shows up in support data." },
  "hc.tele.techcheck": pend("60 to 70%", "Share of connection calls prevented by a pre-visit tech check", "Telehealth vendor case studies or peer-reviewed telehealth access studies", "channel"),
  "hc.onboard.time": { kind: "assumption", value: "15 to 25 minutes", label: "Digital health onboarding time before a first visit", rationale: "From practice; count your own steps and time them.", test: "channel" },
  "hc.onboard.loss": pend("5 to 10%", "Patients lost at each added onboarding step", "Digital funnel drop-off studies; likely a planning assumption", "channel"),
  "hc.pharma.loss": pend("10 to 15%", "Eligible patients lost at each added enrollment step", "Patient support program enrollment studies; likely a planning assumption", "channel"),
  "hc.home.proactive": pend("30 to 40%", "Call volume reduction from proactive caregiver updates", "Home health operator case studies; likely a planning assumption", "channel"),
  "hc.home.containment": { kind: "assumption", value: "10 to 15%", label: "Containment target for home health, against 40% elsewhere", rationale: "From practice; a vulnerable, high-stakes population keeps more contacts with people.", test: "deflection" },
  "hc.home.reauth": { kind: "assumption", value: "70 to 80%", label: "Authorization use at which to trigger re-authorization", rationale: "A design choice that leaves lead time before visits run out; set your own." },
};
