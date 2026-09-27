// industry.test.mjs
//
// The CCaaS by industry pages rebuilt from the research (redesign Phase 7 part 4). Renders all ten from the committed
// industry index and proves: each theme shows every record the index holds for it, in the research's own words, with its
// rule stated; an industry with no record says so and claims nothing about the vendors; every CCaaS vendor is listed
// once with an introduction; the page's own words add no score, rank, tier or fit claim and no unsourced figure; the
// RFP link opens with the industry chosen; the non-CCaaS category pages are untouched by the route. Tokens only.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
globalThis.window = { location: { search: "", hash: "", pathname: "/" }, history: { replaceState() {} }, addEventListener() {}, removeEventListener() {} };
globalThis.document = { title: "", addEventListener() {}, removeEventListener() {} };

const r = await build({ entryPoints: ["./CCaaSIndustry.jsx"], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic",
  loader: { ".js": "jsx", ".json": "json" }, external: ["react", "react-dom"], logLevel: "silent" });
const mod = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
const Page = mod.exports.default;
const React = require("react");
const { renderToString } = require("react-dom/server");
const { VERTICALS } = await import("./src/lib/verticals.js");
const { THEMES } = await import("./src/lib/research/ccaasIndustry.js");
const { decodeScenario } = await import("./src/lib/scenarioUrl.js");
const { RFP_BUILDER: MODEL } = await import("./src/lib/rubrics/rfpBuilder.js");
const INDEX = JSON.parse(readFileSync("./src/data/research/ccaas/industry.json", "utf8"));
const VD = await build({ entryPoints: ["./VendorData.js"], bundle: true, write: false, format: "cjs", platform: "node", logLevel: "silent" });
const vmod = { exports: {} };
new Function("module", "exports", "require", VD.outputFiles[0].text)(vmod, vmod.exports, require);
const core = vmod.exports.getCoreVendors();
const text = (html) => html.replace(/<!-- -->/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ");
const norm = (s) => String(s).replace(/\s+/g, " ").trim();
const SRC = readFileSync("./CCaaSIndustry.jsx", "utf8");

for (const [slug, vert] of Object.entries(VERTICALS)) {
  section(`${vert.name}`);
  const html = renderToString(React.createElement(Page, { verticalSlug: slug })), t = text(html);
  ok("one h1 naming the industry", (html.match(/<h1[\s>]/g) || []).length === 1 && t.includes(`Contact center platforms for ${vert.name}`));
  ok("no bad text", !/\[object Object\]|>\s*(null|undefined|NaN)\s*</.test(html));
  const entry = INDEX.industries.find((i) => i.industry === slug);
  const themes = entry.themes.filter((x) => x.rows.length);
  for (const th of themes) {
    ok(`${th.title}: rule stated`, t.includes(`Shows every published research record that ${th.rule}`));
    const missing = th.rows.filter((row) => !t.includes(norm(row.text)));
    ok(`${th.title}: all ${th.rows.length} records shown in their own words`, missing.length === 0);
  }
  ok(themes.length ? "shows its themes" : "says the research has no finding and claims nothing", themes.length ? true : t.includes(`No ${vert.name.toLowerCase()} finding in the research yet`) && t.includes("says nothing about how well any platform serves the industry"));
  ok("links the sourced industry page", html.includes(`href="${vert.industryPage}"`));
  const intros = (html.match(/href="\/contact\?intro=[^"&]+&amp;from=category"/g) || []).length;
  ok(`every CCaaS vendor listed once with an introduction (${intros})`, intros === core.length && core.every((v) => (html.match(new RegExp(`href="/vendors/${v.slug}"`, "g")) || []).length >= 1));
  const rfp = (html.match(/href="(\/tools\/rfp-builder\?s=[^"]+)"/) || [])[1];
  const st = rfp && decodeScenario(rfp.slice(rfp.indexOf("?")), "rfp-builder", { vertical: "" });
  ok("RFP Builder opens with this industry chosen", !!st && st.vertical === mod.exports.RFP_VERTICAL[slug]);
  /* The page's own words: remove every string the research supplies, then look for claims of its own. */
  const strings = [];
  const walk = (o) => { if (typeof o === "string") { if (o.length > 2) strings.push(norm(o)); } else if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === "object") Object.values(o).forEach(walk); };
  walk(entry);
  const { CCAAS_TAGS } = await import("./src/lib/research/ccaasTags.js");
  walk(Object.values(CCAAS_TAGS).map((x) => [x.sizeNote, x.uc && x.uc.note, x.publicSector && x.publicSector.note]));
  strings.sort((a, b) => b.length - a.length);
  let own = t.replace("Phase 1 vertical fit scores are withdrawn", "").replace("Nothing here ranks a vendor", "").split("carries no grade").join("");
  for (const x of strings) own = own.split(x).join(" ");
  ok(`no score, rank, tier, grade or fit claim of its own [${(own.match(/.{0,30}\b(scores?|rank\w*|tiers?|leader\w*|grade|recommended|best fit|top \d+)\b.{0,20}/i) || [""])[0]}]`, !/\b(scores?|rank\w*|tiers?|leader\w*|grade|recommended|best fit|top \d+)\b/i.test(own));
  ok(`no figure of its own [${(own.match(/.{0,30}\d+\s*%.{0,10}/) || [""])[0]}]`, !/\d+\s*%/.test(own));
}

section("Source and wiring");
{
  const { CCAAS_INDEXED_INDUSTRIES } = await import("./src/lib/verticals.js");
  for (const v of CCAAS_INDEXED_INDUSTRIES) {
    const rows = INDEX.industries.find((i) => i.industry === v).themes.reduce((n, t) => n + t.rows.length, 0);
    ok(`${v}: an indexed page carries research substance (${rows} records, at least 20)`, rows >= 20);
  }
}
ok("every RFP industry name is one the RFP Builder knows", Object.values(mod.exports.RFP_VERTICAL).every((v) => (MODEL.verticals || []).includes(v)));
ok("tokens only: no colour literal", !/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(SRC));
ok("no dash", !/[\u2013\u2014]/.test(SRC + readFileSync("./src/data/research/ccaas/industry.json", "utf8") + readFileSync("./src/lib/research/ccaasIndustry.js", "utf8")));
const CV = readFileSync("./CategoryVerticalPage.jsx", "utf8");
ok("the route sends CCaaS to the rebuilt page and keeps the other categories", /if \(categorySlug === "ccaas"\) return <CCaaSIndustry verticalSlug=\{verticalSlug\} \/>;/.test(CV));
ok("no unsourced vertical prose on the CCaaS pages", !/considerations|ccaasContext|compliance\.map|keySystems/.test(SRC));
ok("themes exist for every industry, empty where the research has nothing", Object.keys(THEMES).length === Object.keys(VERTICALS).length);

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
