// methodPage.js
//
// "How we research vendors": the vendor research method at a high level, as data (TB, 1 Oct 2026: a subpage reached by
// an inconspicuous link, sharing the method at a high level, leaving out what is proprietary). Written in our own words
// from METHOD.md (Research Method v2, private research repository).
//
// Published: what a researched profile answers, how a finding is labelled, which sources count and which never do, that
// every vendor is researched, challenged, audited and signed off by a person, the peer groups, that ratings stay locked,
// the two method versions and how corrections work.
// Left out as proprietary: the research program's agent setup, its completion checklist item by item, the criteria and
// their roles and weights, the break library, the review sampling rates and the step-by-step procedure.

export const METHOD_EFFECTIVE = "2026-10-01";

export const QUESTIONS = [
  { q: "Is it a fit?", a: "The peer group the platform belongs to, who it is sold to, when it is a strong fit, when to be careful and when to rule it out." },
  { q: "What does it do?", a: "Each capability finding, with its label and the sources behind it." },
  { q: "Where does it break?", a: "The conditions under which the platform stops being the rational choice: what triggers it, what it costs, who owns it and when to walk away." },
  { q: "Who runs it?", a: "The setup effort, who runs the platform after go-live, and how much routine change your own team can make." },
  { q: "What does it really cost?", a: "Cost in five layers: subscription and usage, setup and switching, year-two running cost, cost when things go wrong, and cost to change or leave." },
  { q: "How do I prove it?", a: "Tests to run with your own data before you sign, contract terms to ask for, and the questions the research could not settle." },
  { q: "Where does this come from?", a: "Every source, who published it, and when it was read." },
];

/* The five evidence labels, in the research's public words (its glossary), each with what it means for a reader. */
export const LABELS = [
  { label: "Independently confirmed", meaning: "At least one source the vendor does not control supports it, and nothing we found contradicts it." },
  { label: "Vendor-documented", meaning: "The vendor's own documentation says so. It shows what the vendor offers; how it runs in your operation still needs proof." },
  { label: "Vendor claim", meaning: "Only the vendor's marketing says so." },
  { label: "Our analysis", meaning: "Our reading of documented facts. Setup effort, staffing and services findings stay at this label unless independently confirmed." },
  { label: "Not yet confirmed", meaning: "The evidence does not settle it either way. It becomes something to ask the vendor to prove, and it never counts as a weakness." },
];

export const SOURCES = {
  count: [
    "Vendor documentation, pricing pages, release notes and status pages, which show what the vendor says and offers.",
    "Sources the vendor does not control: regulators' records and filings, status page incident history, material customers publish themselves, practitioner communities and independent reporting.",
    "Our own tests in trial or developer environments, where one is open to anyone.",
  ],
  never: [
    "Reseller, distributor, partner program and affiliate material.",
    "Sponsored content and paid placements.",
    "Review site ratings and reviews, which are never used as evidence.",
    "How a vendor is sold. Who implements and supports the platform is in scope, because it changes what you own.",
  ],
};

export const STEPS = [
  { t: "Research", d: "The platform is researched from its own documentation and from independent sources, one vendor at a time." },
  { t: "Challenge", d: "A separate pass looks for evidence that contradicts each material finding. Every search is recorded, including the ones that find nothing." },
  { t: "Audit", d: "The vendor's research is checked against a completion checklist before it can publish." },
  { t: "Sign-off", d: "A person reviews every rule-it-out finding, every critical break, every published price and a sample of everything else." },
  { t: "Revisit", d: "A vendor is researched again when something material changes: an acquisition, a major release, a pricing change, or new evidence that contradicts a finding." },
];

export const PEER_GROUPS_NOTE = "Each platform is compared only with platforms that do the same job, in its peer group. The site publishes no scores, ranks or tiers. Ratings stay unpublished until a peer group has at least three vendors researched under the current method and checked against each other.";

export const VERSIONS = [
  { v: "Research Method 2", from: "1 October 2026", d: "Adds the evidence labels above, the record of every challenge search, where a platform wins, who runs it, the five cost layers and the admin change test." },
  { v: "Research Method 1", from: "September 2026", d: "The method the first vendors were researched under. Each one is being re-audited under Method 2; until then, the foot of its page says so." },
];

export const INDEPENDENCE = "No vendor, reseller or partner program funds, reviews or influences the research. No vendor pays to appear, previews a page or approves a finding.";
