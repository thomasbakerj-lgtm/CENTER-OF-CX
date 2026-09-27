// contributors.test.mjs
//
// The contributor platform (decision D3, TB 27 Sep 2026: the rules as drafted). Proves: /contribute publishes the eight
// approved rules in order, the house rules and the steps; the proposal form names every field for a screen reader,
// requires a declared vendor tie and both confirmations, and posts only to the allowed form host; a piece renders byline
// first with the Contributor perspective label, the declared tie (or "No vendor tie declared"), its review date and safe
// source links; a piece that skips a rule (a dash, promotion, an undeclared tie, an unknown author, review after
// publication) is refused and never renders; unknown slugs say not found and stay noindex; the published lists are
// valid and in the sitemap; the index says so honestly when nothing is published; and nothing outside the contributor
// surfaces reads the contributor data (rule 7: perspectives never feed research, grades, tools or Vendor Match).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
globalThis.window = { location: { search: "", hash: "", pathname: "/" }, history: { replaceState() {} }, addEventListener() {}, removeEventListener() {} };
globalThis.document = { title: "", addEventListener() {}, removeEventListener() {} };
const React = require("react");
const { renderToString } = require("react-dom/server");
const bundle = async (entry) => {
  const r = await build({ entryPoints: [entry], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic",
    loader: { ".js": "jsx", ".json": "json" }, external: ["react", "react-dom", "react-router-dom"], logLevel: "silent" });
  const m = { exports: {} };
  new Function("module", "exports", "require", r.outputFiles[0].text)(m, m.exports, require);
  return m.exports;
};
const text = (html) => html.replace(/<!-- -->/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ");
const C = { ...(await import("./src/lib/contributors.js")), ...(await import("./src/lib/contributorRules.js")) };
const h1s = (html) => (html.match(/<h1[\s>]/g) || []).length;

section("1. The rules page");
const Con = await bundle("./Contribute.jsx");
const html = renderToString(React.createElement(Con.default)), t = text(html);
ok("one h1", h1s(html) === 1);
const D3 = ["who", "review", "disclose", "promotion", "original", "licence", "separate", "removal"];
ok("the eight D3 rules, in order", C.RULES.map((r) => r.id).join() === D3.join() && C.RULES.every((r, i) => t.indexOf(r.title) > (i ? t.indexOf(C.RULES[i - 1].title) : -1)));
ok("vendor employees may write, employer named", /employed by a vendor may write on practice topics, and their employer is named/.test(t));
ok("review never changes the opinion", /It never changes your opinion/.test(t));
ok("the author keeps copyright; a non-exclusive licence", /keep the copyright/.test(t) && /non-exclusive licence/.test(t) && /publish it anywhere else/.test(t));
ok("pieces are labelled and kept apart from research", /labelled Contributor perspective/.test(t) && /never change a research finding, a grade, a tool's result/.test(t));
ok("withdrawal on request, noted", /we remove your piece, and we note/.test(t));
ok("house rules and steps are published", C.HOUSE_RULES.every((r) => t.includes(r)) && Con.STEPS.every((s) => t.includes(s)));

section("2. The proposal form");
for (const [id, name] of [["p-name", "name"], ["p-email", "email"], ["p-role", "role"], ["p-org", "organisation"], ["p-tie", "vendor_tie"], ["p-title", "working_title"], ["p-idea", "proposal"], ["p-link", "draft_url"]])
  ok(`${name}: named and labelled`, html.includes(`for="${id}"`) && new RegExp(`id="${id}"[^>]*name="${name}"|name="${name}"[^>]*id="${id}"`).test(html));
ok("a vendor tie must be declared (none is an answer)", /name="vendor_tie" required=""/.test(html) && /Write none if none/.test(html));
ok("a draft link, when given, is https", /name="draft_url" type="url" pattern="https:\/\/\.\+"/.test(html));
ok("both confirmations are required", ["confirms_original", "accepts_rules"].every((n) => new RegExp(`<input type="checkbox" name="${n}" required=""[^>]*value="yes"`).test(html)));
ok("the proposal is subject-tagged", html.includes('value="Contributor proposal"'));
const SRC = { con: readFileSync("./Contribute.jsx", "utf8"), per: readFileSync("./Perspectives.jsx", "utf8") };
const fetches = [...SRC.con.matchAll(/fetch\("([^"]+)"/g)];
ok("the proposal goes only to the allowed form host", fetches.length === 1 && fetches[0][1] === "https://formspree.io/f/xvzvdnry");
ok("the Privacy Policy names contributor proposals", /Contributor proposals/.test(readFileSync("./PrivacyPolicy.jsx", "utf8")));
ok("tokens only: no colour literal in either page", Object.values(SRC).every((s) => !/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(s)));

section("3. A piece renders byline first, labelled, disclosed and dated");
const P = await bundle("./Perspectives.jsx");
const PEOPLE = { "ana-ruiz": { name: "Ana Ruiz", role: "Director of Service Operations", org: "Example Health", since: "2026-09", bio: "Runs a 400 seat operation.", links: [{ label: "LinkedIn", url: "https://www.linkedin.com/in/example" }] } };
const GOOD = { slug: "staffing-after-ai", author: "ana-ruiz", title: "What we changed in staffing after our first bot", dek: "Three things we measured before and after.",
  published: "2026-09-26", reviewed: "2026-09-25", tie: "Customer of a platform named in the piece",
  body: [{ p: "We measured handle time for eight weeks before the change." }, { h: "What moved", p: "Transfers fell, and repeat calls did not." }],
  sources: [{ publisher: "US Bureau of Labor Statistics", title: "Customer Service Representatives", url: "https://www.bls.gov/ooh/office-and-administrative-support/customer-service-representatives.htm" }], vendors: [] };
ok("the fixture passes every rule", C.pieceProblems(GOOD, PEOPLE).length === 0 && C.contributorProblems(PEOPLE["ana-ruiz"]).length === 0);
const ph = renderToString(React.createElement(P.PerspectiveView, { slug: GOOD.slug, pieces: [GOOD], contributors: PEOPLE })), pt = text(ph);
ok("one h1, the title", h1s(ph) === 1 && /<h1[^>]*>What we changed in staffing after our first bot<\/h1>/.test(ph));
ok("byline before the title", ph.indexOf("Ana Ruiz") >= 0 && ph.indexOf("Ana Ruiz") < ph.indexOf("<h1"));
ok("labelled CONTRIBUTOR PERSPECTIVE with the declared tie", /CONTRIBUTOR PERSPECTIVE/.test(pt) && /Vendor tie: Customer of a platform named in the piece/.test(pt));
ok("contributor since, in words", /Contributor since September 2026/.test(pt));
ok("published and reviewed dates, and the view is the author's", /Published 26 September 2026/.test(pt) && /disclosure 25 September 2026/.test(pt) && /The views are the author's/.test(pt));
ok("every paragraph and heading renders", GOOD.body.every((b) => pt.includes(b.p) && (!b.h || pt.includes(b.h))));
ok("sources open safely in a new tab", /href="https:\/\/www\.bls\.gov[^"]*" target="_blank" rel="noopener noreferrer"/.test(ph));
ok("states it never changes the research", /never changes a research finding/.test(pt));
const noTie = renderToString(React.createElement(P.PerspectiveView, { slug: GOOD.slug, pieces: [{ ...GOOD, tie: null }], contributors: PEOPLE }));
ok("a piece with no tie says so", /No vendor tie declared/.test(text(noTie)));
const idx = text(renderToString(React.createElement(P.PerspectivesIndex, { pieces: [GOOD], contributors: PEOPLE })));
ok("the index lists the piece with its author and date", idx.includes(GOOD.title) && /Ana Ruiz, Director of Service Operations, Example Health\. Published 26 September 2026/.test(idx));
const prof = renderToString(React.createElement(P.ContributorView, { slug: "ana-ruiz", pieces: [GOOD], contributors: PEOPLE })), pf = text(prof);
ok("the profile: one h1, role, since, bio, safe links, pieces", h1s(prof) === 1 && /Director of Service Operations, Example Health\. Contributor since September 2026/.test(pf) && pf.includes(GOOD.title) && /rel="noopener noreferrer"/.test(prof));

section("4. A piece that skips a rule is refused and never renders");
const bad = {
  "a dash": { ...GOOD, dek: "Three things \u2014 measured." },
  "promotion": { ...GOOD, body: [{ p: "The best platform we tried." }] },
  "an undeclared tie": (() => { const x = { ...GOOD }; delete x.tie; return x; })(),
  "an unknown author": { ...GOOD, author: "nobody" },
  "review after publication": { ...GOOD, reviewed: "2026-09-27" },
  "an http source": { ...GOOD, sources: [{ publisher: "X", title: "Y", url: "http://example.com/a" }] },
  "a bad slug": { ...GOOD, slug: "Bad Slug" },
};
for (const [why, piece] of Object.entries(bad)) {
  ok(`refused: ${why}`, C.pieceProblems(piece, PEOPLE).length > 0);
  const r = text(renderToString(React.createElement(P.PerspectiveView, { slug: piece.slug, pieces: [piece], contributors: PEOPLE })));
  ok(`not rendered: ${why}`, /not found/.test(r) && !r.includes(GOOD.body[0].p));
  const i = text(renderToString(React.createElement(P.PerspectivesIndex, { pieces: [piece], contributors: PEOPLE })));
  ok(`not listed: ${why}`, !i.includes(GOOD.title) && /No pieces published yet/.test(i));
}
ok("a contributor without a role is refused", C.contributorProblems({ name: "X", org: "Y", since: "2026-09" }).length > 0);
const hostile = text(renderToString(React.createElement(P.ContributorView, { slug: "__proto__", pieces: [], contributors: PEOPLE })));
ok("an unknown or hostile contributor slug says not found", /Contributor not found/.test(hostile));

section("5. What is published");
for (const [slug, c] of Object.entries(C.CONTRIBUTORS)) ok(`contributor ${slug} is valid`, C.contributorProblems(c).length === 0);
for (const p of C.PIECES) ok(`piece ${p.slug} is valid`, C.pieceProblems(p).length === 0);
const empty = renderToString(React.createElement(P.PerspectivesIndex, {}));
ok("the index: one h1, and honest when nothing is published", h1s(empty) === 1 && (C.PIECES.length ? true : /No pieces published yet/.test(text(empty)) && /href="\/contribute"/.test(empty)));
const sitemap = readFileSync("./public/sitemap.xml", "utf8");
const inMap = (p) => sitemap.includes(`<loc>https://www.contactcentercx.com${p}</loc>`);
ok("/perspectives and /contribute are in the sitemap", inMap("/perspectives") && inMap("/contribute"));
ok("every published piece and contributor is in the sitemap", C.PIECES.every((p) => inMap(C.perspectivePath(p.slug))) && Object.keys(C.CONTRIBUTORS).every((s) => inMap(C.contributorPath(s))));
ok("no unpublished perspective or contributor is in the sitemap", [...sitemap.matchAll(/\/(perspectives|contributors)\/([a-z0-9-]+)</g)].every(([, k, s]) => (k === "perspectives" ? !!C.pieceBySlug(s) : !!C.CONTRIBUTORS[s])));
const { resolveSeo } = await import("./src/lib/seo.js");
const SEOSRC = readFileSync("./src/lib/seo.js", "utf8");
const { SEO_MAP, structuredData } = await import("./src/lib/seo.js");
ok("every published piece has its metadata entry (title with author, dek as description)", C.PIECES.every((p) => { const e = SEO_MAP[C.perspectivePath(p.slug)]; return e && e.title.includes(p.title) && e.title.includes(C.CONTRIBUTORS[p.author].name) && e.desc === p.dek; }));
ok("every published contributor has a metadata entry, and no other slug does", Object.keys(C.CONTRIBUTORS).every((s) => SEO_MAP[C.contributorPath(s)]) && Object.keys(SEO_MAP).filter((k) => /^\/(perspectives|contributors)\//.test(k)).every((k) => (k.startsWith("/perspectives/") ? !!C.pieceBySlug(k.split("/")[2]) : !!C.CONTRIBUTORS[k.split("/")[2]])));
ok("page metadata (entry chunk) carries no contributor data", !/contributors\.js/.test(SEOSRC));
const sd = structuredData("/perspectives/staffing-after-ai", { title: "x | y", desc: "d" }, { perspective: { piece: GOOD, author: PEOPLE["ana-ruiz"] } });
ok("a piece's structured data names its author as a person", sd.some((g) => g["@type"] === "Article" && g.author["@type"] === "Person" && g.author.name === "Ana Ruiz" && g.datePublished === GOOD.published));
ok("the prerender passes the piece and its author", /perspective: \{ piece, author: CONTRIBUTORS\[piece\.author\] \}/.test(readFileSync("./prerender.mjs", "utf8")));
ok("an unpublished slug is noindex", resolveSeo("/perspectives/not-a-piece").known === false && resolveSeo("/contributors/nobody").known === false);
ok("the index pages are known", resolveSeo("/perspectives").known && resolveSeo("/contribute").known);
const APP = readFileSync("./App.jsx", "utf8");
ok("routes are mounted", ['"/contribute"', '"/perspectives"', '"/perspectives/:slug"', '"/contributors/:slug"'].every((r) => APP.includes(`path=${r}`)));
const shell = readFileSync("./src/lib/Shell.jsx", "utf8");
ok("the footer links perspectives and the rules", /\["Contributor perspectives", "\/perspectives"\]/.test(shell) && /\["Write for us", "\/contribute"\]/.test(shell));

section("6. Rule 7: nothing outside the contributor surfaces reads the contributor data");
const ALLOWED = new Set(["Contribute.jsx", "Perspectives.jsx", "Research.jsx", "prerender.mjs"]);
const files = [];
const walk = (d) => { for (const f of readdirSync(d)) { if (["node_modules", "dist", "dist-ssr", ".git", "public"].includes(f)) continue; const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(jsx?|mjs)$/.test(f) && !/\.test\.mjs$|\.report\.mjs$/.test(f)) files.push(p.replace(/^\.\//, "")); } };
walk(".");
const readers = files.filter((f) => /from\s+["'][^"']*contributors\.js["']/.test(readFileSync(f, "utf8")) && f !== "src/lib/contributors.js");
ok("only the contributor pages, the Research landing and the prerender import it", readers.every((f) => ALLOWED.has(f)) && readers.length > 0);
ok("no engine, research, tool or Vendor Match file imports it", !readers.some((f) => /research\/|Vendor|Calculator|rubric|journey|toolData/.test(f)));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
