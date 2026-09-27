// src/lib/contributorRules.js
//
// The contributor rules as decided (D3, TB 27 Sep 2026: the rules as drafted) and the house rules checked in review.
// Published on /contribute; kept apart from contributors.js so the page metadata in the entry chunk does not carry them.

export const RULES = [
  { id: "who", title: "Who may publish", text: "Working practitioners, consultants, analysts and academics in contact center and CX. People employed by a vendor may write on practice topics, and their employer is named on every piece they write." },
  { id: "review", title: "Every piece is reviewed", text: "We review each piece before it is published, for accuracy, originality and disclosure. Review checks facts, sources and our house rules. It never changes your opinion." },
  { id: "disclose", title: "Disclosure", text: "Each piece shows your role, your organisation and any commercial tie you have to a vendor or product named in it." },
  { id: "promotion", title: "No product promotion", text: "A piece may name vendors for context. It may not sell, rank or score them." },
  { id: "original", title: "Your own work", text: "You confirm the work is your own and that every quotation is credited with a link. Figures carry their source. Our originality check applies to every piece." },
  { id: "licence", title: "You keep copyright", text: "You keep the copyright. You grant The Center of CX a non-exclusive licence to publish the piece, quote from it and share it with credit to you. You may publish it anywhere else." },
  { id: "separate", title: "Kept apart from the research", text: "Pieces are labelled Contributor perspective. They never change a research finding, a grade, a tool's result or a vendor's place in any list." },
  { id: "removal", title: "You can withdraw it", text: "Ask and we remove your piece, and we note on the site that it was withdrawn." },
];

/* House rules a reviewed piece must meet, published on the page so a contributor knows them before writing. */
export const HOUSE_RULES = [
  "No dashes between clauses; use a comma, a colon or a new sentence.",
  "A figure carries its source, with a link to the publisher's own page.",
  "No superlatives or marketing adjectives about a product.",
  "Name vendors for context only: no rankings, scores or recommendations to buy.",
];
