// search.test.mjs
//
// Site search (TB, 1 Oct 2026: matches the words people search, not only exact text). Proves the matcher on an index
// built from every sitemap page's title and description (no build needed), the wiring, and that the query stays in the
// browser. When dist/search-index.json exists (after npm run build) it is checked too.
//
// Run: node search.test.mjs

import { readFileSync, existsSync } from "node:fs";

const { stem, terms, oneEdit, concepts, search, buildDoc, kindOf, SYNONYMS } = await import("./src/lib/search.js");
const { resolveSeo, BASE } = await import("./src/lib/seo.js");
const { CATEGORIES } = await import("./src/lib/verticals.js");

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail === undefined ? "" : JSON.stringify(detail).slice(0, 300)); } };
const section = (s) => console.log(`\n${s}`);

section("1. Words: stems, typos, synonyms");
for (const [a, b] of [["forecasting", "forecast"], ["forecasts", "forecast"], ["routing", "route"], ["pricing", "price"], ["policies", "policy"], ["calls", "call"], ["managed", "manage"]]) {
  ok(`${a} and ${b} share a stem`, stem(a) === stem(b), [stem(a), stem(b)]);
}
ok("short words and numbers stay as typed", stem("qa") === "qa" && stem("2026") === "2026" && stem("bus") === "bus");
ok("stop words are dropped", terms("how do I find the cost of a call").join(" ") === "find cost call");
ok("one edit: insert, delete, substitute, swap", oneEdit("staffng", "staffing") && oneEdit("genesis", "genesys") && oneEdit("forcast", "forecast") && oneEdit("fro", "for"));
ok("two edits are not one", !oneEdit("staffing", "stuffinx") && !oneEdit("cost", "costly"));
const cs = concepts("call center WFM software");
ok("a phrase becomes one concept with its other names", cs.length === 3 && cs[0].alts.some((a) => a.join(" ") === "contact center") && cs[1].alts.some((a) => a.join(" ") === terms("workforce management").join(" ")));
ok("the longest name wins", concepts("call center software").length === 1);
const flat = SYNONYMS.flat();
ok("no synonym is listed twice", new Set(flat).size === flat.length);

section("2. Queries find the page a reader means (index from every sitemap page's title and description)");
const xml = readFileSync("./public/sitemap.xml", "utf8");
const paths = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1].slice(BASE.length) || "/");
const CATS = Object.values(CATEGORIES);
const docs = paths.map((p) => {
  const seo = resolveSeo(p);
  const cat = CATS.find((c) => c.page === p);
  return buildDoc({ path: p, title: seo.title.replace(/ \| The Center of CX$/, ""), desc: seo.desc, html: "", kind: kindOf(p, CATS.map((c) => c.page)), extra: cat ? [cat.name, ...cat.also, ...cat.related] : [] });
});
ok(`one record per sitemap page (${docs.length})`, docs.length === paths.length && docs.length > 350);
const top = (q, n = 3) => search(docs, q).results.slice(0, n).map((r) => r.doc.p);
const CASES = [
  ["WFM", "/vendors/wem-qm"],
  ["call center software", "/vendors/ccaas"],
  ["contact center as a service", "/vendors/ccaas"],
  ["handle time", "/tools/aht-decomposition"],
  ["AHT", "/tools/aht-decomposition"],
  ["first call resolution", "/tools/fcr-leakage"],
  ["staffng calculator", "/tools/staffing-calculator"],
  ["erlang", "/tools/staffing-calculator"],
  ["forecasting", "/tools/forecast-accuracy"],
  ["total cost of ownership", "/tools/tco-calculator"],
  ["agent turnover cost", "/tools/attrition-cost"],
  ["chatbots", "/vendors/iva"],
  ["genesys", "/vendors/genesys"],
  ["how we research vendors", "/research/vendor-method"],
  ["healthcare contact center", "/industries/healthcare"],
  ["request for proposal", "/tools/rfp-builder"],
];
for (const [q, want] of CASES) ok(`"${q}" finds ${want} in the top three`, top(q).includes(want), top(q));
ok("a word still being typed matches as a prefix", top("shrinka").includes("/tools/shrinkage-planner"), top("shrinka"));
const part = search(docs, "staffing zzqqxx");
ok("no page matches every word: pages matching some are shown and marked partial", part.partial && part.results.some((r) => r.doc.p === "/tools/staffing-calculator"));
ok("an empty or stop-word query returns nothing", search(docs, "").results.length === 0 && search(docs, "the of and").results.length === 0);
ok("nonsense returns nothing", search(docs, "zzqqxx").results.length === 0);
const tie = search(docs, "vendor").results;
ok("ties are ordered A to Z", tie.every((r, i) => i === 0 || r.score < tie[i - 1].score || r.doc.t.localeCompare(tie[i - 1].doc.t, "en", { sensitivity: "base" }) >= 0));
ok("at most 50 results", search(docs, "contact center").results.length <= 50);

section("3. Wiring and privacy");
const page = readFileSync("./Search.jsx", "utf8");
const app = readFileSync("./App.jsx", "utf8");
const shell = readFileSync("./src/lib/Shell.jsx", "utf8");
const pre = readFileSync("./prerender.mjs", "utf8");
ok("the route is mounted", app.includes(`<Route path="/search" element={<Search />} />`));
ok("titled and noindex, out of the sitemap", resolveSeo("/search").title.startsWith("Search") && resolveSeo("/search").known === false && !xml.includes("/search<"));
ok("the header links search on every width, named for screen readers", /href="\/search" aria-label="Search the site"/.test(shell));
ok("the prerender writes the index from every sitemap page", pre.includes('"search-index.json"') && pre.includes("searchDocs.push(buildDoc("));
ok("the query never leaves the browser: no tracking, no request but the index", !/track|posthog|formspree/i.test(page) && (page.match(/fetch\(/g) || []).length === 1 && page.includes('fetch("/search-index.json")'));
ok("the search box has a label and the form a search role", page.includes('htmlFor="cx-search"') && page.includes('id="cx-search"') && page.includes('role="search"'));
ok("a failed index load says so and offers the hubs", page.includes('role="alert"') && page.includes("did not load"));

section("4. The built index (after npm run build)");
if (existsSync("./dist/search-index.json")) {
  const raw = readFileSync("./dist/search-index.json", "utf8");
  const built = JSON.parse(raw);
  ok(`the index holds every sitemap page (${built.docs.length})`, built.docs.length === paths.length);
  ok(`the index stays small (${Math.round(raw.length / 1024)} KB)`, raw.length < 900 * 1024);
  ok("every record has a title, description, kind and words", built.docs.every((d) => d.p && d.t && d.d && d.k && d.tt));
  ok("no record carries the header or footer words alone", built.docs.every((d) => !/subscrib/.test(d.hh)));
  const b = (q) => search(built.docs, q).results.slice(0, 5).map((r) => r.doc.p);
  ok('the page\'s own words are searchable: "admin change test" finds researched profiles', b("admin change test").some((p) => /^\/vendors\/[a-z0-9-]+$/.test(p)), b("admin change test"));
} else console.log("  (no dist/search-index.json; build to check it)");

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
