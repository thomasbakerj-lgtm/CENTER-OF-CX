// updates.test.mjs
//
// The Updates hub and its feeds (TB, 13 Oct 2026, open item 3; src/lib/updates.js, Updates.jsx). Proves the entries are
// exactly the published Market Watch items, researched profiles and corrections; the order and the weeks; the RSS 2.0 and
// JSON Feed 1.1 output (escaping included); that no method change is published; the page and the wiring. When dist holds
// the built feeds (after npm run build) they must equal a fresh render.
//
// Run: node updates.test.mjs

import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const U = await import("./src/lib/updates.js");
const MW = await import("./src/lib/marketWatch.js");
const { CCAAS_RESEARCH } = await import("./src/lib/researchStatus.js");
const { CORRECTIONS } = await import("./src/lib/research/corrections.js");
const { SEO_MAP, resolveSeo, BASE } = await import("./src/lib/seo.js");

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail === undefined ? "" : JSON.stringify(detail).slice(0, 300)); } };
const section = (s) => console.log(`\n${s}`);
const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");

section("1. Entries");
const E = U.updateEntries();
const nMw = MW.publishedItems().length, nRs = Object.keys(CCAAS_RESEARCH.complete).length;
ok(`every published Market Watch item and researched profile, nothing else (${E.length})`, E.length === nMw + nRs + CORRECTIONS.length);
ok("ids unique", new Set(E.map((e) => e.id)).size === E.length);
ok("newest first, ties A to Z", E.every((e, i) => i === 0 || E[i - 1].date > e.date || (E[i - 1].date === e.date && E[i - 1].title.localeCompare(e.title) <= 0)));
ok("every entry has a date, title, summary and a site path", E.every((e) => /^\d{4}-\d{2}-\d{2}$/.test(e.date) && e.title && e.summary && e.path.startsWith("/")));
ok("Market Watch entries link their item", E.filter((e) => e.type === "marketWatch").every((e) => e.path === `/market-watch#${e.id}`));
ok("research entries link a researched profile", E.filter((e) => e.type === "research").every((e) => CCAAS_RESEARCH.complete[e.path.slice(9)]));
const bad = { ...MW.ITEMS[0], id: "mw-bad", summary: "Best-in-class " + String.fromCharCode(0x2014) + " promo" };
ok("an item that fails Market Watch's rules never reaches the feed", !U.updateEntries({ items: MW.publishedItems([...MW.ITEMS, bad]) }).some((e) => e.id === "mw-bad"));
const corr = [{ vendorId: "VEN-CC-0004", record: "CLM-CC-000123", date: "2026-10-10", changed: "A finding's release state corrected to Preview.", source: "https://example.com/doc" }];
const withC = U.updateEntries({ corrections: corr });
ok("an accepted correction becomes an entry linked to its profile", withC.some((e) => e.type === "correction" && e.path === "/vendors/genesys" && e.date === "2026-10-10"));
ok("a correction for an unresearched vendor is ignored", U.updateEntries({ corrections: [{ ...corr[0], vendorId: "VEN-CC-9999" }] }).length === E.length);
const src = readFileSync("./src/lib/updates.js", "utf8");
ok("no method change is published (the change log stays internal)", !/changelog|methodVersions/.test(src.replace(/\/\/.*$/gm, "")));

section("2. Weeks");
ok("weeks start on Monday", U.weekOf("2026-10-13") === "2026-10-12" && U.weekOf("2026-10-12") === "2026-10-12" && U.weekOf("2026-10-18") === "2026-10-12" && U.weekOf("2026-10-19") === "2026-10-19");
const W = U.byWeek(E);
ok("every entry once, in its own week, weeks newest first", W.flatMap((w) => w.entries).length === E.length && W.every((w) => w.entries.every((e) => U.weekOf(e.date) === w.week)) && W.every((w, i) => i === 0 || W[i - 1].week > w.week));

section("3. Feeds");
const rss = U.rssXml();
ok("RSS 2.0 with a self link and one item per entry up to the limit", rss.startsWith('<?xml version="1.0" encoding="UTF-8"?>') && rss.includes('<rss version="2.0"') && rss.includes(`href="${BASE}/feed.xml" rel="self"`) && (rss.match(/<item>/g) || []).length === Math.min(E.length, U.FEED_LIMIT));
ok("every RSS date is RFC 822", [...rss.matchAll(/<pubDate>([^<]+)<\/pubDate>/g)].every((m) => /^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} 12:00:00 \+0000$/.test(m[1])));
const hostile = [{ id: "x<y", date: "2026-10-01", type: "marketWatch", title: "A & B <script>", summary: "\"q\" 'x' </description>", path: "/market-watch#x", tags: [], source: null }];
const hr = U.rssXml(hostile);
ok("RSS escapes every field", !hr.includes("<script>") && !hr.includes("</description></description>") && hr.includes("A &amp; B &lt;script&gt;") && hr.includes("x&lt;y"));
ok("no raw ampersand in the RSS", !/&(?!amp;|lt;|gt;|quot;|apos;)/.test(rss));
const jf = JSON.parse(U.jsonFeed());
ok("JSON Feed 1.1 header", jf.version === "https://jsonfeed.org/version/1.1" && jf.feed_url === `${BASE}/feed.json` && jf.home_page_url === `${BASE}/updates`);
ok("JSON items carry id, url, title, text and an ISO date", jf.items.length === Math.min(E.length, U.FEED_LIMIT) && jf.items.every((i) => i.id && i.url.startsWith(BASE) && i.title && i.content_text && /^\d{4}-\d{2}-\d{2}T12:00:00Z$/.test(i.date_published)));
ok("feed text has no dash", !DASH.test(rss) && !DASH.test(U.jsonFeed()) && !DASH.test(U.CADENCE + U.FEED_DESC));

section("4. Page and wiring");
const r = await build({ entryPoints: ["./Updates.jsx"], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic",
  external: ["react", "react-dom", "react-router-dom"], loader: { ".js": "jsx" }, logLevel: "silent" });
const mod = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, createRequire(import.meta.url));
const html = renderToStaticMarkup(React.createElement(mod.exports.default));
ok("one h1, every entry, no NaN or undefined", (html.match(/<h1/g) || []).length === 1 && E.every((e) => html.includes(`href="${e.path}"`)) && !/NaN|undefined/.test(html));
ok("the page links both feeds and the email", html.includes('href="/feed.xml"') && html.includes('href="/feed.json"') && html.includes('href="/subscribe"'));
ok("the page states the cadence", html.includes(U.CADENCE.slice(0, 40)));
const sitemap = readFileSync("./public/sitemap.xml", "utf8");
ok("route, metadata and sitemap", readFileSync("./App.jsx", "utf8").includes('<Route path="/updates" element={<Updates />} />') && resolveSeo("/updates").known && sitemap.includes("com/updates</loc>"));
ok("footer, llms.txt, Market Watch page and head link the feeds", readFileSync("./src/lib/Shell.jsx", "utf8").includes('["Updates", "/updates"]') && readFileSync("./src/lib/llmsTxt.js", "utf8").includes("/feed.xml")
  && readFileSync("./MarketWatch.jsx", "utf8").includes('href="/feed.xml"') && readFileSync("./index.html", "utf8").includes('type="application/rss+xml"') && readFileSync("./index.html", "utf8").includes('type="application/feed+json"'));
ok("the prerender writes both feeds", /feed\.xml"\), rssXml\(\)/.test(readFileSync("./prerender.mjs", "utf8")) && /feed\.json"\), jsonFeed\(\)/.test(readFileSync("./prerender.mjs", "utf8")));
ok("the page carries no colour literal", !/#[0-9a-fA-F]{3,6}\b|rgba?\(/.test(readFileSync("./Updates.jsx", "utf8")));

section("5. Built feeds (after npm run build)");
if (existsSync("./dist/feed.xml") && existsSync("./dist/feed.json")) {
  ok("dist/feed.xml equals a fresh render", readFileSync("./dist/feed.xml", "utf8") === U.rssXml());
  ok("dist/feed.json equals a fresh render", readFileSync("./dist/feed.json", "utf8") === U.jsonFeed());
} else console.log("  (no built feeds; build to check them)");

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
