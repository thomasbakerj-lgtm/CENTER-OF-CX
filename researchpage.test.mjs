// researchpage.test.mjs
//
// The Research landing (redesign Phase 10). Proves: one h1; every count on the page equals the data it describes
// (CCaaS researched and total, classes, validation dates, methods, industries, segments); the research order is the
// category order in CLAUDE.md section 13 and only CCaaS claims current research; every internal link resolves to a
// mounted route or a sitemap page (the old landing listed eight articles that were never written); the Market Watch
// excerpt and the perspectives count come from their own data; no figure appears without a source; tokens only.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail); } };
globalThis.window = { location: { search: "", hash: "", pathname: "/research" }, history: { replaceState() {} }, addEventListener() {}, removeEventListener() {} };
globalThis.document = { title: "", addEventListener() {}, removeEventListener() {} };
const React = require("react");
const { renderToString } = require("react-dom/server");
const r = await build({ entryPoints: ["./Research.jsx"], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic",
  loader: { ".js": "jsx", ".json": "json" }, external: ["react", "react-dom", "react-router-dom"], logLevel: "silent" });
const m = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(m, m.exports, require);
const html = renderToString(React.createElement(m.exports.default));
const t = html.replace(/<!-- -->/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ");

const { CATEGORIES, VERTICALS, CCAAS_INDEXED_INDUSTRIES } = await import("./src/lib/verticals.js");
const { CCAAS_COMPLETE_COUNT, CCAAS_RESEARCH } = await import("./src/lib/researchStatus.js");
const { SEGMENT_COUNT, vendorDisplayName } = await import("./src/lib/seo.js");
const { METHOD_COUNT, INDUSTRY_COUNT } = await import("./src/lib/home.js");
const { longDate } = await import("./src/lib/methodVersions.js");
const MW = await import("./src/lib/marketWatch.js");
const CT = await import("./src/lib/contributors.js");
const INDEX = JSON.parse(readFileSync("./src/data/research/ccaas/category.json", "utf8"));

console.log("\n1. One page, counts from the data");
ok("one h1", (html.match(/<h1[\s>]/g) || []).length === 1);
ok("CCaaS researched of total", t.includes(`${CCAAS_COMPLETE_COUNT} of ${CATEGORIES.ccaas.vendorCount} researched`));
ok("classes, calibrated and the validation window", t.includes(`${INDEX.classes.length} competitive classes (${INDEX.classes.filter((c) => !c.draft).length} calibrated)`) && t.includes(`between ${longDate(INDEX.validatedFrom)} and ${longDate(INDEX.validatedTo)}`));
ok("the next vendor", !CCAAS_RESEARCH.next || t.includes(`Next: ${vendorDisplayName(CCAAS_RESEARCH.next)}.`));
ok("methods, industries and segments", t.includes(`${METHOD_COUNT} tools publish their method`) && t.includes(`${INDUSTRY_COUNT} industries and ${SEGMENT_COUNT} segments`));
ok("the three indexed CCaaS by industry pages", CCAAS_INDEXED_INDUSTRIES.every((v) => html.includes(`href="/vendors/ccaas/${v}"`) && t.includes(VERTICALS[v].name)));

console.log("\n2. Research order and status");
const order = ["ccaas", "iva", "agent-assist", "wem-qm", "analytics", "acd-routing", "digital-engagement", "payments"];
ok("the section 13 order", m.exports.RESEARCH_ORDER.join() === order.join() && order.every((s, i) => !i || html.indexOf(`href="${CATEGORIES[s].page}"`) > html.indexOf(`href="${CATEGORIES[order[i - 1]].page}"`)));
ok("only CCaaS claims current research", (t.match(/current research published/g) || []).length === 1 && (t.match(/Phase 1 context, listed A to Z/g) || []).length === order.length - 1);

console.log("\n3. Every internal link resolves");
const APP = readFileSync("./App.jsx", "utf8");
const routes = [...APP.matchAll(/path="([^"]+)"/g)].map((x) => x[1]);
const sitemap = readFileSync("./public/sitemap.xml", "utf8");
const resolves = (h) => { const p = h.split("#")[0]; return routes.includes(p) || sitemap.includes(`<loc>https://www.contactcentercx.com${p}</loc>`); };
const hrefs = [...new Set([...html.matchAll(/href="(\/[^"]*)"/g)].map((x) => x[1]))];
ok("every internal link", hrefs.length > 10 && hrefs.every(resolves), hrefs.filter((h) => !resolves(h)).join());
ok("no link goes nowhere", !/href="#"/.test(html) && !/href=""/.test(html));
ok("the retired placeholder articles are gone", !/AI Worker Thesis|Payment Friction Is Your Silent|ACD Routing Is Dead|Who's Real vs Who's Marketing|Sampling 2%/.test(t));

console.log("\n4. Market Watch and perspectives from their own data");
const latest = MW.publishedItems().slice(0, 3);
ok("the three newest items, linked by id", latest.every((it) => t.includes(it.headline) && html.includes(`href="/market-watch#${it.id}"`)));
ok("perspectives count or an honest invitation", CT.PIECES.length ? t.includes(`${CT.PIECES.length} piece`) : /Proposals are open/.test(t));

console.log("\n5. No unsourced figure, tokens only");
const own = t.replace(/\d+ of \d+ researched|\d+ competitive classes \(\d+ calibrated\)|\d+ tools publish|\d+ industries and \d+ segments|\d{1,2} \w+ \d{4}|April 2026 edition, \d+ pages/g, "");
ok("no percentage or dollar figure of our own", !/\d+(\.\d+)?\s?%|\$\s?\d/.test(own.replace(new RegExp(latest.map((i) => i.headline.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") || "^$", "g"), "")));
ok("tokens only: no colour literal", !/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(readFileSync("./Research.jsx", "utf8")));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
