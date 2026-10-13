/* search.js
 *
 * Site search (TB, 1 Oct 2026: "yes; matches the words people search, not only exact text"). Pure functions, shared by
 * the build and the page:
 *   buildDoc     the prerender turns each sitemap page's rendered HTML and metadata into one small record;
 *   search       the /search page matches a query against those records in the reader's browser.
 * Nothing the reader types leaves the browser: the index is a static file and no event carries the query.
 *
 * Matching: words are folded to a simple stem (forecasting, forecasts and forecast match), acronyms and common
 * names are expanded (WFM finds workforce management, call center finds contact center), a word of five letters or
 * more tolerates one typo, and the last word matches as a prefix while it is being typed. A title match counts most,
 * then headings, the description and the page's own words. Every word the reader typed must match somewhere; when no
 * page matches them all, pages matching some are shown and the page says so. Results are ordered by how well they
 * match the words, then A to Z: relevance to a query, never a judgment of a vendor or a tool.
 */

export const SEARCH_INDEX_VERSION = 1;

const STOP = new Set(("a an and are as at be by can do does for from has have how i if in into is it its of on or our so " +
  "than that the their them then there these they this to up us was we what when where which who why will with you your " +
  "not no all any each more most other some such only own same too very just also may might should would could " +
  "after before over under between both here out one two per get").split(" "));

/** A light English stem: enough to match plural, -ing and -ed forms without a dictionary. */
export function stem(w) {
  const s = stem1(w);
  return s.length > 4 && s.endsWith("e") && !s.endsWith("ee") ? s.slice(0, -1) : s;
}
function stem1(w) {
  if (w.length <= 3 || /\d/.test(w)) return w;
  if (w.endsWith("ies") && w.length > 4) return w.slice(0, -3) + "y";
  if (w.endsWith("ing") && w.length > 5) return dedouble(w.slice(0, -3));
  if (w.endsWith("ed") && w.length > 4) return dedouble(w.slice(0, -2));
  if (/(ss|us|is)$/.test(w)) return w;
  if (/(sh|ch|x|z)es$/.test(w)) return w.slice(0, -2);
  if (w.endsWith("s")) return w.slice(0, -1);
  return w;
}
const dedouble = (w) => (/([b-df-hj-np-tv-z])\1$/.test(w) && !/(ll|ss|ff|zz)$/.test(w) ? w.slice(0, -1) : w);

/** Words of a text, lower case, without punctuation or stop words, stemmed. */
export function terms(text) {
  return String(text || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9%+]+/g, " ").split(" ").filter((w) => w && !STOP.has(w)).map(stem);
}

/* Names that mean the same thing to a buyer. Each group is one concept: a query naming any of its phrases matches
   pages that use any of them. Category names come from the registry (verticals.js) at index time. */
export const SYNONYMS = [
  ["ccaas", "contact center as a service", "cloud contact center", "contact center platform", "contact center software", "call center software"],
  ["contact center", "call center", "contact centre", "call centre"],
  ["ucaas", "unified communications"],
  ["wfm", "workforce management"],
  ["wem", "workforce engagement management", "workforce engagement"],
  ["qm", "quality management"],
  ["qa", "quality assurance", "quality scorecard"],
  ["aht", "average handle time", "handle time"],
  ["fcr", "first contact resolution", "first call resolution", "repeat contact"],
  ["asa", "average speed of answer", "speed of answer"],
  ["sla", "service level"],
  ["tco", "total cost of ownership", "total cost"],
  ["roi", "return on investment", "business case"],
  ["cpc", "cost per contact", "cost per call"],
  ["iva", "intelligent virtual agent", "virtual agent", "conversational ai", "chatbot", "voicebot"],
  ["ivr", "interactive voice response"],
  ["acd", "automatic call distribution", "call routing", "routing"],
  ["csat", "customer satisfaction"],
  ["nps", "net promoter score"],
  ["rfp", "request for proposal"],
  ["byoc", "bring your own carrier"],
  ["ai", "artificial intelligence"],
  ["attrition", "turnover", "agent churn"],
  ["staffing", "erlang", "headcount"],
  ["occupancy", "utilization"],
  ["deflection", "containment", "self service"],
  ["agent assist", "copilot", "real time guidance"],
  ["speech analytics", "conversation intelligence", "interaction analytics"],
  ["renewal", "contract renewal"],
];

const GROUPS = SYNONYMS.map((g) => g.map(terms).filter((a) => a.length));

/** The page kind shown beside a result, from its path. */
export function kindOf(path, categoryPages = []) {
  if (path === "/") return "Home";
  if (path.startsWith("/tools/")) return "Tool";
  if (path === "/tools") return "Tools";
  if (path.startsWith("/methodology/")) return "Method";
  if (categoryPages.includes(path)) return "Vendor category";
  if (/^\/vendors\/ccaas\/[a-z-]+$/.test(path)) return "Research by industry";
  if (path.startsWith("/vendors/")) return "Vendor profile";
  if (path === "/vendors") return "Vendors";
  if (/^\/industries\/[a-z-]+\/[a-z-]+/.test(path)) return "Industry segment";
  if (path.startsWith("/industries")) return "Industry";
  if (path.startsWith("/research") || path === "/market-watch") return "Research";
  return "Page";
}

const strip = (html) => String(html || "")
  .replace(/<(script|style|header|footer|svg)[\s\S]*?<\/\1>/gi, " ")
  .replace(/<!--[\s\S]*?-->/g, "")
  .replace(/<[^>]+>/g, " ")
  .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const uniq = (a) => [...new Set(a)];
export const BODY_TERMS = 160;

/**
 * One record per page: path, title and description for display, the kind, and the stemmed words of each field.
 * extra: names a page is also known by (a category's other names and related searches), indexed beside its title.
 */
export function buildDoc({ path, title, desc, html, kind, extra = [] }) {
  const body = strip(html);
  const heads = [...String(html || "").matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)].map((m) => strip(m[1]));
  const counts = new Map();
  for (const t of terms(body)) if (t.length > 1) counts.set(t, (counts.get(t) || 0) + 1);
  const top = [...counts].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1)).slice(0, BODY_TERMS).map(([t]) => t).sort();
  return {
    p: path,
    t: title,
    d: desc,
    k: kind,
    tt: uniq(terms(title)).join(" "),
    aa: uniq(extra.map((x) => terms(x).join(" ")).filter(Boolean)).join("|"),
    hh: uniq(terms(heads.join(" "))).join(" "),
    dd: uniq(terms(desc)).join(" "),
    bb: top.join(" "),
  };
}

/* A page's other names (a category's also and related terms) count like its title. */
const FIELDS = [["tt", 10], ["aa", 10], ["hh", 5], ["dd", 4], ["bb", 1]];
/* Hub pages first when a query names what a hub collects: a small lift that never outranks a better match. */
const KIND_LIFT = { "Vendor category": 3, Tool: 2, Method: 1, Industry: 1 };

/** Damerau one-edit check (insert, delete, substitute or swap two neighbours). */
export function oneEdit(a, b) {
  if (a === b) return true;
  const la = a.length, lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0;
  while (i < la && i < lb && a[i] === b[i]) i++;
  if (la === lb) return a.slice(i + 1) === b.slice(i + 1) || (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2));
  return la > lb ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
}

/** The query as concepts: each is a list of alternatives, and each alternative a list of stems that must all appear. */
export function concepts(query) {
  const q = terms(query);
  const out = [];
  for (let i = 0; i < q.length;) {
    let best = null, len = 0;
    for (const g of GROUPS) for (const alt of g) {
      if (alt.length > len && alt.every((t, j) => q[i + j] === t)) { best = g; len = alt.length; }
    }
    if (best) { out.push({ alts: best, words: q.slice(i, i + len) }); i += len; }
    else { out.push({ alts: [[q[i]]], words: [q[i]] }); i++; }
  }
  return out;
}

const fieldSets = (doc) => Object.fromEntries(FIELDS.map(([f]) => [f, doc[f] ? doc[f].split(/[ |]/) : []]));

function termScore(term, list, set, { prefix, fuzzy }) {
  if (set.has(term)) return 1;
  if (prefix && term.length >= 2 && list.some((w) => w.startsWith(term))) return 0.8;
  if (fuzzy && term.length >= 5 && list.some((w) => (Math.abs(w.length - term.length) <= 1 && oneEdit(term, w)) || (w.length >= 4 && term.startsWith(w) && term.length - w.length <= 3))) return 0.6;
  return 0;
}

/** Best score of one concept on one document: the best alternative, in the best field. */
function conceptScore(c, fs, sets, opts) {
  let best = 0;
  for (const alt of c.alts) {
    for (const [f, w] of FIELDS) {
      let s = 1;
      for (const t of alt) { const m = termScore(t, fs[f], sets[f], opts); s = Math.min(s, m); if (!s) break; }
      if (s * w > best) best = s * w;
    }
  }
  return best;
}

/**
 * Search the index. Returns { results, partial, concepts } where results are { doc, score } best first, ties A to Z.
 * partial is true when no page matched every word and pages matching some are shown instead.
 */
export function search(docs, query, { limit = 50 } = {}) {
  const cs = concepts(query);
  if (!cs.length) return { results: [], partial: false, concepts: cs };
  const typing = !/\s$/.test(String(query));
  const scored = [];
  for (const doc of docs) {
    const fs = fieldSets(doc);
    const sets = Object.fromEntries(Object.entries(fs).map(([f, l]) => [f, new Set(l)]));
    const each = cs.map((c, i) => conceptScore(c, fs, sets, { prefix: typing && i === cs.length - 1 && c.alts.length === 1, fuzzy: c.alts.length === 1 }));
    const hits = each.filter((s) => s > 0).length;
    let score = each.reduce((a, b) => a + b, 0);
    if (hits) {
      /* How much of the title the query covers, so "Genesys" puts the Genesys page before "Genesys Agent Assist". */
      const qs = new Set(cs.flatMap((c) => c.words));
      const title = fs.tt;
      score += title.length ? 2 * title.filter((t) => qs.has(t)).length / title.length : 0;
      const slug = doc.p.split("/").pop();
      if (slug && terms(slug.replace(/-/g, " ")).join(" ") === cs.flatMap((c) => c.words).join(" ")) score += 6;
      score += KIND_LIFT[doc.k] || 0;
      /* A query that names one of the page's other names exactly ("call center software"). */
      const names = doc.aa ? doc.aa.split("|") : [];
      if (names.length && cs.some((c) => c.alts.some((a) => names.includes(a.join(" "))))) score += 4;
    }
    scored.push({ doc, each, score, hits });
  }
  const order = (a, b) => b.score - a.score || a.doc.t.localeCompare(b.doc.t, "en", { sensitivity: "base" });
  let results = scored.filter((r) => r.hits === cs.length);
  let partial = false;
  if (!results.length && cs.length > 1) {
    const most = Math.max(...scored.map((r) => r.hits));
    if (most > 0) { results = scored.filter((r) => r.hits === most); partial = true; }
  }
  return { results: results.sort(order).slice(0, limit).map(({ doc, score }) => ({ doc, score })), partial, concepts: cs };
}
