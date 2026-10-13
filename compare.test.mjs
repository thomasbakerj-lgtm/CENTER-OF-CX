// compare.test.mjs
//
// Peer group comparison and "alternatives to" pages (TB, 13 Oct 2026, open item 9; Compare.jsx,
// src/lib/research/compareView.js). Truth surface: Vendor Intelligence; presentation only. Proves every page exists for
// every published group and researched vendor, every member and every published decision statement reaches its page in
// the research's own words, vendors are A to Z, the page's own words carry no rank or score, nothing reads a rating,
// Phase 1 or Market Position source, the wiring, and that the metadata map cannot drift from the research.
//
// Run: node compare.test.mjs

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const CAT = JSON.parse(readFileSync("./src/data/research/ccaas/category.json", "utf8"));
const CMP = JSON.parse(readFileSync("./src/data/research/ccaas/compare.json", "utf8"));
const V = await import("./src/lib/research/compareView.js");
const { PLAIN, readableIds } = await import("./src/lib/research/classWords.js");
const { CCAAS_RESEARCH } = await import("./src/lib/researchStatus.js");
const { resolveSeo, COMPARE_GROUPS, SEO_MAP } = await import("./src/lib/seo.js");
const { CATEGORIES } = await import("./src/lib/verticals.js");

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail === undefined ? "" : JSON.stringify(detail).slice(0, 300)); } };
const section = (s) => console.log(`\n${s}`);
const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
const sitemap = readFileSync("./public/sitemap.xml", "utf8");
const SLUG_OF = Object.fromEntries(Object.entries(CCAAS_RESEARCH.complete).map(([s, r]) => [r.vendorId, s]));

section("1. The index");
ok("one entry per researched vendor", CMP.vendors.length === Object.keys(CCAAS_RESEARCH.complete).length && CMP.vendors.every((v) => SLUG_OF[v.id]));
ok("vendors A to Z", CMP.vendors.every((v, i) => i === 0 || CMP.vendors[i - 1].name.localeCompare(v.name, "en", { sensitivity: "base" }) <= 0));
ok("only the three decision kinds, each in Decision_ID order", CMP.vendors.every((v) => JSON.stringify(Object.keys(v.decisions)) === '["best","caution","eliminate"]' && Object.values(v.decisions).every((l) => l.every((d, i) => i === 0 || l[i - 1].id < d.id))));
for (const v of CMP.vendors) {
  const f = JSON.parse(readFileSync(`./src/data/research/ccaas/vendors/${v.id}.json`, "utf8"));
  const want = (t) => f.decision_intelligence.filter((d) => d.Decision_Type === t && d.Publishable === "YES" && d.Statement).map((d) => d.Statement).sort();
  ok(`${v.name}: every published decision statement, word for word`, V.DECISION_KINDS.every(([k, t]) => JSON.stringify(v.decisions[k].map((d) => d.statement).sort()) === JSON.stringify(want(t))));
}
ok("no score, rating or rank field", !/"[A-Za-z_]*(Score|Rating|Rank|Tier)[A-Za-z_]*":/i.test(JSON.stringify(CMP)));

section("2. Addresses and metadata");
const groups = CAT.classes.map((c) => c.id);
ok("one compare page per published peer group, and the metadata map names exactly those", JSON.stringify(Object.keys(COMPARE_GROUPS).sort()) === JSON.stringify(groups.map(V.classSlug).sort()));
ok("the metadata names are the plain group names", groups.every((id) => COMPARE_GROUPS[V.classSlug(id)].toLowerCase() === PLAIN[id].name.toLowerCase()));
ok("slugs round-trip", groups.every((id) => V.classBySlug(V.classSlug(id)) === id));
const pages = [...groups.map(V.comparePath), ...CMP.vendors.map((v) => V.alternativesPath(SLUG_OF[v.id]))];
ok(`every page is in the sitemap and indexable (${pages.length})`, pages.every((p) => sitemap.includes(`com${p}</loc>`) && resolveSeo(p).known));
ok("an unknown group or unresearched vendor is not indexable", !resolveSeo("/vendors/ccaas/compare/nope").known && !resolveSeo("/vendors/sprinklr/alternatives").known);
ok("every title fits and every description is 70 to 160 characters", pages.every((p) => { const s = resolveSeo(p); return s.title.split(" | ")[0].length <= 55 && s.desc.length >= 70 && s.desc.length <= 160; }), pages.map((p) => [p, resolveSeo(p).title.split(" | ")[0].length, resolveSeo(p).desc.length]).filter(([, t, d]) => t > 55 || d > 160 || d < 70));

section("3. Pages");
const r = await build({ entryPoints: ["./Compare.jsx"], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic",
  external: ["react", "react-dom", "react-router-dom"], loader: { ".js": "jsx" }, logLevel: "silent" });
const mod = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, createRequire(import.meta.url));
const P = mod.exports;
const render = (el) => renderToStaticMarkup(React.createElement(el.type, el.props));
const live = (h) => h === "/" || !!SEO_MAP[h] || Object.values(CATEGORIES).some((c) => c.page === h) || sitemap.includes(`com${h}</loc>`);
/* The page's own words: everything but the research's statements, definitions and vendor names. */
const ownWords = (html) => {
  let t = html.replace(/<[^>]+>/g, " ");
  const research = [...CMP.vendors.flatMap((v) => Object.values(v.decisions).flat().map((d) => readableIds(d.statement, CAT.classes))), ...CAT.classes.flatMap((c) => [c.name, c.definition, c.buyer, c.boundary].filter(Boolean)), ...CMP.vendors.map((v) => v.name)];
  for (const s of research.sort((a, b) => b.length - a.length)) t = t.split(esc(s)).join(" ");
  return t;
};
const RANK = /\b(rank|ranked|ranking|score|scored|rating|rated|top \d|#\d|leader|winner|best[- ]in|number one|first place)\b/i;
for (const id of groups) {
  const h = render({ type: P.ClassCompare, props: { id } });
  const members = [...CMP.vendors.filter((v) => v.klass === id), ...CMP.vendors.filter((v) => v.also === id && v.klass !== id)];
  const label = V.comparePath(id);
  ok(`${label}: one h1, every member and each of its statements`, (h.match(/<h1/g) || []).length === 1 && members.every((v) => h.includes(esc(v.name)) && Object.values(v.decisions).flat().every((d) => h.includes(esc(readableIds(d.statement, CAT.classes))))));
  const lists = h.split("<dl").slice(1).map((part) => [...part.split("</dl>")[0].matchAll(/<dt[^>]*>([^<]+)<\/dt>/g)].map((m) => m[1]));
  ok(`${label}: each side by side list A to Z`, lists.length === 3 && lists.every((order) => order.length === members.length && order.every((n, i) => i === 0 || order[i - 1].localeCompare(n, "en", { sensitivity: "base" }) <= 0)));
  ok(`${label}: its own words carry no rank, score or rating, and no dash`, !RANK.test(ownWords(h)) && !DASH.test(h), (ownWords(h).match(RANK) || [])[0]);
  const hrefs = [...h.matchAll(/href="([^"#?]+)/g)].map((m) => m[1]).filter((x) => x.startsWith("/") && x !== "/contact");
  ok(`${label}: every internal link live, an introduction per member`, hrefs.every(live) && (h.match(/Request an introduction to/g) || []).length === members.length, hrefs.filter((x) => !live(x)));
}
for (const v of CMP.vendors) {
  const slug = SLUG_OF[v.id];
  const h = render({ type: P.Alternatives, props: { slug } });
  const peers = CMP.vendors.filter((x) => x.klass === v.klass && x.id !== v.id);
  ok(`${slug}: one h1 naming the vendor; every peer; never itself as a peer`, (h.match(/<h1/g) || []).length === 1 && h.includes(`Alternatives to ${esc(v.name)}`) && peers.every((x) => h.includes(`href="/vendors/${SLUG_OF[x.id]}"`)) && !h.includes(`Alternatives to ${esc(v.name)}</a>`));
  ok(`${slug}: its own rule-out and caution statements, word for word`, [...v.decisions.eliminate, ...v.decisions.caution].every((d) => h.includes(esc(readableIds(d.statement, CAT.classes)))));
  ok(`${slug}: its own words carry no rank or score`, !RANK.test(ownWords(h)), (ownWords(h).match(RANK) || [])[0]);
  const hrefs = [...h.matchAll(/href="([^"#?]+)/g)].map((m) => m[1]).filter((x) => x.startsWith("/") && x !== "/contact");
  ok(`${slug}: every internal link live`, hrefs.every(live), hrefs.filter((x) => !live(x)));
}
const talk = CMP.vendors.find((v) => Object.values(v.decisions).every((l) => !l.length));
if (talk) ok(`a vendor with no statements says so (${talk.name})`, render({ type: P.Alternatives, props: { slug: SLUG_OF[talk.id] } }).includes("publishes no caution or rule-out statement"));
ok("an unknown group or vendor says there is no comparison", render({ type: P.ClassCompare, props: { id: null } }).includes("No comparison here") && render({ type: P.Alternatives, props: { slug: "sprinklr" } }).includes("No comparison here"));

section("4. Separation and wiring");
const src = readFileSync("./Compare.jsx", "utf8") + readFileSync("./src/lib/research/compareView.js", "utf8");
const code = src.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
ok("reads no Phase 1, Vendor Match, rating or Market Position source", !/VendorData|VendorMatch|phase1|market.?position/i.test(code) && !/\b[A-Za-z_]*(Rating|Score)[A-Za-z_]*\b/.test(code));
ok("tokens only", !/#[0-9a-fA-F]{3,6}\b|rgba?\(/.test(readFileSync("./Compare.jsx", "utf8")));
const app = readFileSync("./App.jsx", "utf8");
ok("both routes mounted before the category by industry route", app.indexOf('path="/vendors/ccaas/compare/:group"') > 0 && app.indexOf('path="/vendors/:slug/alternatives"') > 0 && app.indexOf('path="/vendors/:slug/alternatives"') < app.indexOf('path="/vendors/:categorySlug/:verticalSlug"'));
ok("each researched profile links its alternatives; the CCaaS page links each group's comparison", readFileSync("./ResearchedProfile.jsx", "utf8").includes("`/vendors/${slug}/alternatives`") && readFileSync("./CCaaSCategory.jsx", "utf8").includes("comparePath(c.id)"));
ok("research-sync writes the index", readFileSync("./scripts/research-sync.mjs", "utf8").includes('"compare.json"), compareIndexJson('));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
