/* Contract Risk Scanner, version 1.0. A contract terms model (kind "terms").
 *
 * Published at /methodology/contract-risk from this object, and read by the engine in
 * src/lib/terms.js. Truth type: the buyer's own contract terms, read against published
 * severities. It reads no vendor research and names no vendor.
 *
 * Each of 13 clauses is answered with the option that matches the contract, or "don't
 * know". Every option carries a published severity and the reason for it. A clause you do
 * not know is an item to find in the contract before signing, never a pass and never a
 * risk rating. Figures inside a negotiation position (a cap, a credit, a notice period)
 * are common starting positions from contract practice, not sourced benchmarks, and are
 * labelled so; uptime minutes are arithmetic.
 *
 * The seven clauses of the previous version keep their ids and option wording, so an old
 * link opens with every answer intact. Six clauses are new.
 */
export const CONTRACT_RISK = {
  id: "contract-risk",
  kind: "terms",
  title: "Contract Risk Scanner",
  version: "1.0",
  published: "2026-09-24",
  route: "/tools/contract-risk",
  methodology: "/methodology/contract-risk",
  truthType: "The buyer's own contract terms against published severities. Reads no vendor research and names no vendor.",
  what: "Which clauses in a contact center platform contract put you at risk, how serious each one is and why, what to ask for instead, and which clauses you still need to find before you sign.",
  unknown: { val: "Don't know", label: "Don't know" },
  levels: [
    { id: "low", label: "Low", test: "The clause protects you or is standard." },
    { id: "medium", label: "Medium", test: "The clause is workable with a change or a watch item." },
    { id: "high", label: "High", test: "The clause exposes you to cost or lock-in you should negotiate before signing." },
    { id: "critical", label: "Critical", test: "The clause leaves you without a basic protection. Do not sign it as written." },
  ],
  readings: [
    { id: "doNotSign", label: "Do not sign as written", test: "At least one clause is critical." },
    { id: "negotiate", label: "Negotiate before signing", test: "No clause is critical and at least one is high." },
    { id: "find", label: "Find the missing clauses before signing", test: "No clause is critical or high, and at least one is not known yet." },
    { id: "notes", label: "Acceptable with notes", test: "Every clause is known, none is critical or high, and at least one is medium." },
    { id: "clear", label: "No flagged clause", test: "Every clause is known and low." },
  ],
  positionsNote: "Figures in negotiation positions are common starting positions from contract practice, not sourced benchmarks. Set your own with your legal and finance teams.",
  limits: [
    "It reads the answers you give about the contract. It does not read the contract, and it is not legal advice; have counsel review the final terms.",
    "Severities describe a typical contact center platform contract. A clause can matter more or less in yours, for example where regulation sets its own terms.",
    "Negotiation positions are starting points from practice. What a vendor will accept depends on your size, timing and alternatives.",
    "It never names or compares vendors. It reads one contract at a time.",
  ],
  next: { price: "tco-calculator", addons: "license-gap", renewal: "platform-decision" },
  terms: [
    { id: "length", name: "Contract Length", why: "Longer terms trade price for flexibility, across a period in which contact center AI capabilities are changing fast.", options: [
      { val: "1 year", level: "low", note: "Most flexibility, least pricing leverage.", negotiate: "" },
      { val: "2 years", level: "low", note: "A balance of leverage and flexibility.", negotiate: "" },
      { val: "3 years", level: "medium", note: "Common for enterprise. The rate lock must cover the full term.", negotiate: "Ask for a full-term rate lock and a mid-term review at 18 months, with the right to renegotiate if usage changes materially." },
      { val: "5 years", level: "high", note: "Locks you in through years of technology change.", negotiate: "Ask for a technology refresh clause that allows a platform or tier change at Year 3, and a rate reset if the vendor moves to consumption pricing." },
    ]},
    { id: "renewal", name: "Auto-Renewal Notice Window", why: "A long notice window means you must decide to leave months before the term ends, often before an evaluation can finish.", options: [
      { val: "30 days", level: "low", note: "A reasonable notice period.", negotiate: "" },
      { val: "60 days", level: "medium", note: "Put the notice date in the calendar well ahead of it.", negotiate: "Ask for 30 days. If the vendor holds at 60, allow notice by email as well as by letter." },
      { val: "90 days", level: "high", note: "You must decide a full quarter before the term ends.", negotiate: "Ask for 60 days. If the vendor holds at 90, require a written renewal reminder from the vendor 120 days before the term ends." },
      { val: "180 days", level: "critical", note: "Six months of notice. An evaluation would have to start a year before the term ends.", negotiate: "Ask for 60 to 90 days. If the vendor refuses, require written notice from the vendor 210 days before the term ends." },
    ]},
    { id: "renewalPrice", name: "Price at Renewal", why: "The renewal price sets what the next term costs; without a cap, the leverage sits with the vendor once switching is hard.", options: [
      { val: "Renewal price capped in contract", level: "low", note: "You know the most the next term can cost.", negotiate: "" },
      { val: "Renewal at then-current list less discount", level: "medium", note: "The discount holds but the list price can move.", negotiate: "Ask for the renewal discount to be written as a fixed percentage off today's price, with a cap on the increase." },
      { val: "Renewal at then-current list price", level: "high", note: "Your discount can disappear at renewal.", negotiate: "Ask for a cap on the renewal increase; a low single-digit annual cap is a common starting position." },
      { val: "Renewal price not addressed", level: "critical", note: "The next term's price is whatever the vendor sets.", negotiate: "Write a renewal price rule into this contract before signing: a cap, or a fixed percentage off the current price." },
    ]},
    { id: "rateLock", name: "Rate Lock Duration", why: "Without a lock, prices can rise at every anniversary while you are committed to the term.", options: [
      { val: "Full term", level: "low", note: "Your price holds for the whole term.", negotiate: "" },
      { val: "Year 1 only", level: "high", note: "Prices can rise at every anniversary after Year 1; treat any increase as uncapped until the contract says otherwise.", negotiate: "Ask for a full-term lock. A common fallback position is an annual increase cap in the low single digits." },
      { val: "CPI-linked", level: "medium", note: "Workable if capped. An uncapped index escalator is not.", negotiate: "Cap the index increase each year, and name the index used." },
      { val: "No rate lock", level: "critical", note: "The vendor can raise prices at any time during the term.", negotiate: "Ask for at least a two-year lock with an annual cap after it. A vendor that refuses is signalling its pricing intentions." },
    ]},
    { id: "sla", name: "Uptime SLA + Consequences", why: "An uptime target only protects you when missing it costs the vendor something.", options: [
      { val: "99.999% with credits", level: "low", note: "About 5 minutes of downtime a year. Check how credits are calculated and capped.", negotiate: "" },
      { val: "99.99% with credits", level: "low", note: "About 53 minutes of downtime a year.", negotiate: "Make sure credits are material, and that uptime is measured where customers feel it as well as at the vendor's own infrastructure." },
      { val: "99.9% with credits", level: "medium", note: "About 8.8 hours of downtime a year.", negotiate: "Ask for 99.99%. If the vendor holds at 99.9%, ask for larger credits per incident." },
      { val: "99.9% no credits", level: "high", note: "A target with no credit has no consequence when it is missed.", negotiate: "Add a credit structure that grows with each step below the target." },
      { val: "No SLA", level: "critical", note: "No uptime commitment for a production contact center.", negotiate: "Do not sign without an uptime commitment and credits." },
    ]},
    { id: "liability", name: "Liability Cap", why: "The cap sets the most the vendor owes you when something goes wrong, including a breach of your customers' data.", options: [
      { val: "Cap of 12 months' fees or more, with carve-outs", level: "low", note: "A standard cap, with data breach and confidentiality outside it or under a higher cap.", negotiate: "" },
      { val: "Cap of 12 months' fees, no carve-outs", level: "medium", note: "A data breach is limited to the same cap as everything else.", negotiate: "Ask for a separate, higher cap for data breach and confidentiality." },
      { val: "Cap below 12 months' fees", level: "high", note: "The vendor's exposure is small next to yours.", negotiate: "Ask for at least 12 months of fees, and a higher cap for data breach." },
      { val: "Vendor liability excluded", level: "critical", note: "The vendor owes you nothing when it fails.", negotiate: "Do not sign an exclusion of liability. Ask for a cap and data breach carve-outs." },
    ]},
    { id: "termination", name: "Early Termination Rights", why: "Exit rights decide what failure costs you if the platform does not deliver.", options: [
      { val: "Mutual 90-day notice", level: "low", note: "Either party can leave with notice.", negotiate: "" },
      { val: "Pay remaining term", level: "critical", note: "Leaving costs the full remaining term, even if the platform fails.", negotiate: "Ask for a declining termination fee, and a no-fee exit for repeated SLA breaches." },
      { val: "Pay 50% remaining", level: "high", note: "Leaving is costly but possible.", negotiate: "Ask for a fee that declines each year, and a performance exit that applies whatever the fee." },
      { val: "Termination for cause only", level: "high", note: "Cause is usually defined narrowly, and performance failures rarely qualify.", negotiate: "Define cause to include repeated SLA breaches, contracted features not delivered by their date, and a material security incident." },
    ]},
    { id: "data", name: "Data Portability + Ownership", why: "Your recordings, transcripts and analytics are the hardest thing to move, and the easiest to hold hostage.", options: [
      { val: "Full export, standard format, 30 days", level: "low", note: "You own your data and can leave with it.", negotiate: "" },
      { val: "Export available, proprietary format", level: "medium", note: "You can get your data out, but it needs converting.", negotiate: "Ask for standard formats (CSV, JSON) and API access to extract data during the transition." },
      { val: "Export on request, additional cost", level: "high", note: "Paying to leave raises lock-in.", negotiate: "Make export a contract right at no cost, with transition support after termination." },
      { val: "No export clause", level: "critical", note: "Nothing obliges the vendor to hand your data back.", negotiate: "Add a clause that all customer data, recordings and analytics are yours, exportable in a standard format within a set period of the request." },
    ]},
    { id: "aiData", name: "Use of Your Data for AI", why: "Interaction data used to train a vendor's models can leave your control and cannot be recalled.", options: [
      { val: "No training on our data without opt-in", level: "low", note: "Your data trains nothing unless you agree.", negotiate: "" },
      { val: "Training on de-identified data, with opt-out", level: "medium", note: "Your data is used unless you opt out, and de-identification is the vendor's own.", negotiate: "Ask for opt-in instead of opt-out, and a description of the de-identification." },
      { val: "Training on our data allowed", level: "high", note: "Your customers' conversations can train models other customers use.", negotiate: "Ask for a prohibition on training with your data, or opt-in only, with deletion on exit." },
      { val: "AI data use not addressed", level: "critical", note: "The contract is silent on what the vendor may do with your data in AI.", negotiate: "Write a data use clause before signing: purpose, training, retention, sub-processors and deletion on exit." },
    ]},
    { id: "security", name: "Security + Data Residency", why: "Where data lives and which controls are attested decide whether the platform can meet your regulatory obligations.", options: [
      { val: "Attested controls and residency in contract", level: "low", note: "Security reports, certifications and data location are contract terms.", negotiate: "" },
      { val: "Attested controls, residency not stated", level: "medium", note: "The controls are evidenced, but data can move between regions.", negotiate: "Name the regions where data is stored and processed, with notice before any change." },
      { val: "Security described, not attested", level: "high", note: "A description of controls with no independent report behind it.", negotiate: "Ask for current independent reports (for example SOC 2 Type II or ISO 27001) and the right to review them each year." },
      { val: "No security terms", level: "critical", note: "Nothing in the contract commits the vendor to protect your data.", negotiate: "Do not sign without security obligations, breach notification terms and a data processing agreement." },
    ]},
    { id: "addons", name: "Add-On Pricing Commitment", why: "The base seat price covers only part of what a working contact center costs; unpriced modules are where budgets move.", options: [
      { val: "All modules priced in contract", level: "low", note: "You know your full cost.", negotiate: "" },
      { val: "Key modules priced, others at list", level: "medium", note: "Workable if the key modules include workforce, quality, analytics and AI.", negotiate: "Name the key modules explicitly, and ask for a most-favored-customer clause on the rest." },
      { val: "List pricing at time of purchase", level: "high", note: "List prices rise, so later modules cost more.", negotiate: "Lock prices now for modules you expect to add within the term, with a set discount off list for any other." },
      { val: "No pricing committed", level: "critical", note: "The base seat price is the only committed number.", negotiate: "Get every module you need priced before signing; the License Bundle Gap Checker lists them." },
    ]},
    { id: "assignment", name: "Assignment + Change of Control", why: "If the vendor is acquired, the contract can pass to a new owner with new priorities.", options: [
      { val: "Consent required, exit right on change of control", level: "low", note: "You can leave if the vendor changes hands.", negotiate: "" },
      { val: "Consent required, no exit right", level: "medium", note: "The contract cannot move without you, but a change of owner does not let you leave.", negotiate: "Add an exit right, without fee, within a set period after a change of control." },
      { val: "Vendor may assign freely", level: "high", note: "The contract can pass to another company without your consent.", negotiate: "Require your consent for assignment, and an exit right on change of control." },
    ]},
    { id: "transition", name: "Transition Assistance at Exit", why: "Moving a live contact center takes months; without help from the outgoing vendor, you run two platforms blind.", options: [
      { val: "Defined assistance and overlap period", level: "low", note: "The vendor must help you move, for a set period at set rates.", negotiate: "" },
      { val: "Assistance at then-current rates", level: "medium", note: "Help is available, at a price the vendor sets when you need it.", negotiate: "Fix the rates and the length of the assistance period now." },
      { val: "No transition assistance", level: "high", note: "Nothing obliges the vendor to help you leave.", negotiate: "Add a transition period with continued service, data export and named support at fixed rates." },
    ]},
  ],
};
