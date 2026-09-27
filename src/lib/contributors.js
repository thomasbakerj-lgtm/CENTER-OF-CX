// src/lib/contributors.js
//
// The contributor platform (decision D3, TB 27 Sep 2026: the rules as drafted). The rules the /contribute page
// publishes, the contributors and pieces the site has published, and the checks a piece must pass before it renders.
// A contributor piece is a perspective: it never feeds research, grades, Vendor Match or the Market Position Index
// (rule 7; contributors.test.mjs proves nothing outside the contributor pages reads this file).
//
// Publishing a piece: add its author to CONTRIBUTORS and the piece to PIECES once review is complete, add its path and
// its author's path to the sitemap, and rebuild. `validPiece` refuses a piece that skips a rule.

/* The rules and house rules the /contribute page publishes live in contributorRules.js, so page metadata (in the entry
   chunk) carries only the checks below. */

/* Published contributors, by slug: { name, role, org, since: "YYYY-MM", bio, links: [{ label, url }] }. */
export const CONTRIBUTORS = {};

/* Published pieces: { slug, author, title, dek, published: "YYYY-MM-DD", reviewed: "YYYY-MM-DD", tie: string | null,
   body: [{ h?, p }], sources: [{ publisher, title, url }], vendors: [name] }. `tie` is the author's commercial tie to a
   vendor or product named in the piece, or null when they declared none. */
export const PIECES = [];

export const perspectivePath = (slug) => `/perspectives/${slug}`;
export const contributorPath = (slug) => `/contributors/${slug}`;

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DASH = /[\u2013\u2014]/;
const PROMO = /\b(best|leading|world[- ]cla(?:ss)|seam(?:less)|best[- ]in[- ]class|industry[- ]leading|number one|#1)\b/i;

/** Why a contributor record cannot publish, or [] when it can. */
export function contributorProblems(c) {
  const out = [];
  if (!c || typeof c !== "object") return ["no record"];
  if (!c.name || !c.role || !c.org) out.push("name, role and organisation are required");
  if (!/^\d{4}-\d{2}$/.test(c.since || "")) out.push("since is YYYY-MM");
  for (const l of c.links || []) if (!/^https:\/\//.test(l.url || "")) out.push(`link ${l.label} is not https`);
  return out;
}

/** Why a piece cannot publish, or [] when it can. */
export function pieceProblems(p, contributors = CONTRIBUTORS) {
  const out = [];
  if (!p || typeof p !== "object") return ["no record"];
  if (!SLUG.test(p.slug || "")) out.push("slug");
  if (!contributors[p.author]) out.push("author is not a published contributor");
  if (!p.title || !p.dek) out.push("title and dek are required");
  if (!DATE.test(p.published || "") || !DATE.test(p.reviewed || "")) out.push("published and reviewed dates are YYYY-MM-DD");
  else if (p.reviewed > p.published) out.push("reviewed after it was published");
  if (!(p.tie === null || (typeof p.tie === "string" && p.tie.length > 2))) out.push("tie must be declared, or null for none");
  if (!Array.isArray(p.body) || !p.body.length || p.body.some((b) => typeof b.p !== "string" || !b.p)) out.push("body");
  for (const s of p.sources || []) if (!/^https:\/\//.test(s.url || "") || !s.publisher) out.push(`source ${s.title || "?"} needs a publisher and an https link`);
  const text = [p.title, p.dek, ...(p.body || []).flatMap((b) => [b.h || "", b.p || ""])].join(" ");
  if (DASH.test(text)) out.push("contains a dash");
  if (PROMO.test(text)) out.push("contains promotional language");
  return out;
}

export const pieceBySlug = (slug) => PIECES.find((p) => p.slug === slug) || null;
export const piecesBy = (author) => PIECES.filter((p) => p.author === author).sort((a, b) => (a.published < b.published ? 1 : -1));
export const publishedPieces = () => [...PIECES].sort((a, b) => (a.published < b.published ? 1 : -1));
