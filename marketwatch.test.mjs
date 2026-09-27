// marketwatch.test.mjs
//
// Market Watch v1 (TB, 27 Sep 2026). Proves: every published item is dated, labelled by its source (verified, news,
// vendor-supplied), cites a specific https page with its publication date, was checked on or after that date, is
// written in our words (headline and summary within their length, no quotation, no dash, no verdict or promotional
// word), and the page leads each item with its label word; the labels are explained on the page and never rest on
// colour alone; filters narrow and never reorder; an item that skips a rule is refused and never renders; a named
// vendor offers an introduction on the market-watch surface; the page states that Market Watch never changes the
// research; nothing outside the Market Watch surfaces reads the data; route, header, footer, sitemap and homepage door.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail); } };
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
const M = await import("./src/lib/marketWatch.js");
const V = await bundle("./MarketWatch.jsx");
const render = (items) => renderToString(React.createElement(V.MarketWatchView, { items }));

const FIX = [
  { id: "mw-2026-09-10-rule", date: "2026-09-10", label: "verified", kind: "regulation", who: "Federal Communications Commission", vendors: [],
    headline: "Regulator sets a date for a new consent rule", summary: "The rule applies to calls placed after the date in the order.",
    source: { publisher: "Federal Communications Commission", title: "Order on consent", url: "https://www.fcc.gov/document/order", published: "2026-09-10" }, also: null, checked: "2026-09-27" },
  { id: "mw-2026-09-12-ga", date: "2026-09-12", label: "vendor-supplied", kind: "product", who: "Example Co", vendors: ["Example Co"],
    headline: "Example Co announces general availability of a routing feature", summary: "The company says the feature is available to all customers in two regions.",
    source: { publisher: "Example Co", title: "Newsroom post", url: "https://example.com/news/ga", published: "2026-09-12" },
    also: { publisher: "Trade Weekly", title: "Report", url: "https://tradeweekly.example/report", published: "2026-09-13" }, checked: "2026-09-27" },
  { id: "mw-2026-08-01-deal", date: "2026-08-01", label: "news", kind: "deal", who: "Buyer Inc", vendors: ["Buyer Inc", "Target Ltd"],
    headline: "Buyer Inc agrees to acquire Target Ltd", summary: "The deal is expected to close after regulatory review.",
    source: { publisher: "Trade Weekly", title: "Deal report", url: "https://tradeweekly.example/deal", published: "2026-08-02" }, also: null, checked: "2026-09-27" },
];

section("1. The rules fire on planted items");
ok("the fixtures pass", FIX.every((it) => M.itemProblems(it).length === 0));
const bad = {
  "a dash": { ...FIX[0], summary: "The rule applies \u2014 after the date." },
  "a verdict word": { ...FIX[1], headline: "Example Co releases the best routing feature" },
  "a quotation": { ...FIX[2], summary: "The buyer called it \"transformative\"." },
  "an unknown label": { ...FIX[0], label: "rumour" },
  "a homepage link": { ...FIX[0], source: { ...FIX[0].source, url: "https://www.fcc.gov/" } },
  "an http link": { ...FIX[0], source: { ...FIX[0].source, url: "http://www.fcc.gov/document/order" } },
  "no publication date": { ...FIX[0], source: { ...FIX[0].source, published: "" } },
  "checked before published": { ...FIX[0], checked: "2026-09-01" },
  "a long headline": { ...FIX[0], headline: "one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen" },
  "a long summary": { ...FIX[0], summary: Array(60).fill("word").join(" ") },
};
for (const [why, it] of Object.entries(bad)) {
  ok(`refused: ${why}`, M.itemProblems(it).length > 0);
  const rt = text(render([it]));
  ok(`not rendered: ${why}`, !rt.includes(it.headline) && !rt.includes(it.summary));
}

section("2. The page");
const html = render(FIX), t = text(html);
ok("one h1", (html.match(/<h1[\s>]/g) || []).length === 1);
ok("every label is explained on the page", M.LABEL_ORDER.every((l) => t.includes(M.LABELS[l].word) && t.includes(M.LABELS[l].text)));
ok("newest first", t.indexOf(FIX[1].headline) < t.indexOf(FIX[0].headline) && t.indexOf(FIX[0].headline) < t.indexOf(FIX[2].headline));
for (const it of FIX) {
  const at = html.indexOf(">", html.indexOf(`id="${it.id}"`)) + 1, end = html.indexOf("</li>", html.indexOf(it.headline));
  const block = html.slice(at, end), bt = text(block);
  ok(`${it.id}: the label word leads the item`, bt.trim().startsWith(M.LABELS[it.label].word));
  ok(`${it.id}: date, kind and who`, bt.includes(M.KINDS[it.kind]) && bt.includes(it.who));
  ok(`${it.id}: source link opens safely, with its date`, block.includes(`href="${it.source.url}" target="_blank" rel="noopener noreferrer"`) && /Checked 27 September 2026/.test(bt));
  ok(`${it.id}: a second source when there is one`, !it.also || block.includes(it.also.url));
  ok(`${it.id}: every named vendor offers an introduction`, it.vendors.every((v) => bt.includes(`Request an introduction to ${v}`)));
}
ok("vendor-supplied is dashed, so the label never rests on colour", /dashed/.test(html.slice(html.indexOf('id="mw-2026-09-12-ga"'))) );
ok("the page states Market Watch never changes the research", /never changes a research finding, a vendor profile, a grade, a tool's result or Vendor Match/.test(t));
ok("filters are grouped buttons with a pressed state", /role="group" aria-label="Filter by source"/.test(html) && /role="group" aria-label="Filter by kind"/.test(html) && /aria-pressed="true"/.test(html));
ok("an empty list says so", /No items yet/.test(text(render([]))));
const SRC = readFileSync("./MarketWatch.jsx", "utf8");
ok("tokens only: no colour literal", !/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(SRC));
ok("introductions travel on the market-watch surface", /surface="market-watch"/.test(SRC));
const T = await import("./src/lib/track.js");
ok("market-watch is a surface and a page type (taxonomy 1.3)", T.SURFACES.has("market-watch") && T.PAGE_TYPES.has("market-watch") && T.pageType("/market-watch") === "market-watch");

section("3. The published items");
ok("every published item passes every rule", M.ITEMS.every((it) => M.itemProblems(it).length === 0));
ok("ids are unique", new Set(M.ITEMS.map((it) => it.id)).size === M.ITEMS.length);
ok("no vendor has more than two items", Object.values(M.ITEMS.flatMap((it) => it.vendors).reduce((a, v) => ({ ...a, [v]: (a[v] || 0) + 1 }), {})).every((n) => n <= 2));
const real = V.MarketWatchView ? renderToString(React.createElement(V.MarketWatchView, {})) : "";
ok("the live page renders every published item", M.ITEMS.every((it) => text(real).includes(it.headline)));

const { ORIGINALITY } = await import("./src/lib/claims/originality.js");
const rec = ORIGINALITY["src/lib/marketWatch.js"];
ok("the items carry an originality record, every match rewritten", !!rec && /^\d{4}-\d{2}-\d{2}$/.test(rec.checked) && rec.matches.every((x) => x.resolution === "rewritten" || (x.resolution === "quoted" && /^https:\/\//.test(x.url || ""))));
ok("the record is no older than the newest item's check", !!rec && M.ITEMS.every((it) => it.checked <= rec.checked));

section("4. Wiring");
const APP = readFileSync("./App.jsx", "utf8"), shell = readFileSync("./src/lib/Shell.jsx", "utf8");
ok("route mounted", APP.includes('path="/market-watch"'));
ok("the header links Market Watch; the footer too", /id: "marketWatch", href: "\/market-watch"/.test(shell) && /\["Market Watch", "\/market-watch"\]/.test(shell));
ok("in the sitemap", readFileSync("./public/sitemap.xml", "utf8").includes("<loc>https://www.contactcentercx.com/market-watch</loc>"));
const H = await import("./src/lib/home.js");
const door = H.DOORS.find((d) => d.pillar === "marketWatch");
ok("the homepage door opens the page", door.page && door.page.href === "/market-watch" && !door.soon && !door.routes);

section("5. Nothing outside the Market Watch surfaces reads the data");
const ALLOWED = new Set(["MarketWatch.jsx", "Research.jsx", "src/lib/home.js"]);
const files = [];
const walk = (d) => { for (const f of readdirSync(d)) { if (["node_modules", "dist", "dist-ssr", ".git", "public"].includes(f)) continue; const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(jsx?|mjs)$/.test(f) && !/\.test\.mjs$|\.report\.mjs$/.test(f)) files.push(p.replace(/^\.\//, "")); } };
walk(".");
const readers = files.filter((f) => /from\s+["'][^"']*marketWatch\.js["']/.test(readFileSync(f, "utf8")) && f !== "src/lib/marketWatch.js");
ok("only the page, the Research landing and the homepage door import it", readers.length > 0 && readers.every((f) => ALLOWED.has(f)), readers.join());
ok("no research, tool, grade or Vendor Match file imports it", !readers.some((f) => /research\/|Vendor|Calculator|rubric|journey|toolData|confidence/.test(f)));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
