// profile.test.mjs
//
// The researched vendor profile (redesign Phase 7 part 2). Renders every researched CCaaS vendor in every view from the
// committed snapshot and proves: the page shows the research and only the research (no score, rank, tier, count of
// states or Phase 1 prose), every published finding and source reaches the page, unknown reads as "Not yet proven" and
// never as weak, every outbound source link is https and opens safely, and the profile route uses it for exactly the
// researched vendors. Truth surface: Vendor Intelligence.
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
globalThis.window = { location: { search: "", hash: "", pathname: "/" }, history: { replaceState() {} }, addEventListener() {}, removeEventListener() {} };
globalThis.document = { title: "", addEventListener() {}, removeEventListener() {} };

const r = await build({ entryPoints: ["./ResearchedProfile.jsx"], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic",
  loader: { ".js": "jsx" }, external: ["react", "react-dom"], logLevel: "silent" });
const mod = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
const Page = mod.exports.default;
const React = require("react");
const { renderToString } = require("react-dom/server");
const { buildProfile, VIEWS, FILTERS } = await import("./src/lib/research/profileView.js");
const { CCAAS_RESEARCH } = await import("./src/lib/researchStatus.js");
const DIR = "./src/data/research/ccaas";
const shared = JSON.parse(readFileSync(DIR + "/shared.json", "utf8"));
const bySlug = Object.entries(CCAAS_RESEARCH.complete);
const text = (html) => html.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ");
const norm = (s) => String(s).replace(/\s+/g, " ").trim();

/* Phase 1 prose for each researched vendor, which must not reach the page. */
const VD = await build({ entryPoints: ["./VendorData.js"], bundle: true, write: false, format: "cjs", platform: "node", logLevel: "silent" });
const vmod = { exports: {} };
new Function("module", "exports", "require", VD.outputFiles[0].text)(vmod, vmod.exports, require);

section("1. Every researched vendor renders every view");
const problems = [];
for (const [slug, { vendorId }] of bySlug) {
  const file = JSON.parse(readFileSync(`${DIR}/vendors/${vendorId}.json`, "utf8"));
  const p = buildProfile(file, shared);
  const views = {};
  for (const v of VIEWS) {
    let html;
    try { html = renderToString(React.createElement(Page, { slug, file, shared, manifestDate: "2026-09-23", initialView: v.id })); }
    catch (e) { problems.push(`${slug}/${v.id} threw ${e.message}`); continue; }
    views[v.id] = { html, t: text(html) };
    if ((html.match(/<h1[\s>]/g) || []).length !== 1) problems.push(`${slug}/${v.id} h1 count`);
    if (/\[object Object\]|>\s*(null|undefined|NaN)\s*</.test(html)) problems.push(`${slug}/${v.id} bad text`);
  }
  if (Object.keys(views).length !== VIEWS.length) continue;
  const all = Object.values(views).map((x) => x.t).join(" ");
  /* The page's own words: everything rendered, less every string the research itself supplies. The research may say
     "Auto Score" or "complexity is not weakness"; the page may never add a score, rank, tier or weakness of its own. */
  const researchStrings = [];
  const walk = (o) => { if (typeof o === "string") { if (o.length > 2) researchStrings.push(norm(o)); } else if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === "object") Object.values(o).forEach(walk); };
  walk(file); walk(shared);
  researchStrings.sort((a, b) => b.length - a.length);
  let own = all;
  for (const x of researchStrings) own = own.split(x).join(" ");
  if (/\b(NaN|Infinity|undefined|null)\b/.test(own)) problems.push(`${slug} prints ${(own.match(/.{0,30}\b(NaN|Infinity|undefined|null)\b.{0,20}/) || [""])[0]}`);
  const head = views.fit.t;
  if (!head.includes(file.vendor.Supplier_Name) || !/Current research complete/.test(head)) problems.push(`${slug} header`);
  if (!views.fit.html.includes(`href="/contact?intro=${slug}&amp;from=vendor"`)) problems.push(`${slug} introduction`);
  { const tg = (await import("./src/lib/research/ccaasTags.js")).tagsFor(file.vendor.Vendor_ID);
    if (!tg || !head.includes(tg.category) || !tg.sizes.every((z) => head.includes(z.label)) || !head.includes("Who it is sold to") || !head.includes("Sizes, in the research's words") || !head.includes("Where it runs") || !head.includes("Take it further") || !tg.notes.every((n) => head.includes(n.text))) problems.push(`${slug} tags`); }
  // research law: no score, rank, tier word or composite; tier appears only as an evidence tier on a source
  if (/\bscore|\branked?\b|\bleader(board)?\b|Strategic Foundation|Strong Contender|Enterprise Core|\bgrade\b/i.test(own.replace(/never a quality grade|carries no grade/g, ""))) problems.push(`${slug} score or tier word: ${(own.match(/.{0,40}(score|rank|leader|grade).{0,20}/i) || [""])[0]}`);
  if (/\b\d+\s+(findings? )?(meet|meets|partly|not yet proven|not offered)\b/i.test(own)) problems.push(`${slug} counts states`);
  if (/\bweak/i.test(own.replace(/it is not a weakness/g, ""))) problems.push(`${slug} calls something weak`);
  // Phase 1 prose stays out
  const legacy = vmod.exports.getVendor ? vmod.exports.getVendor(slug) : null;
  const prose = legacy ? [...(legacy.strengths || []), ...(legacy.weaknesses || []), legacy.summary].filter((x) => typeof x === "string" && x.length > 30) : [];
  if (prose.some((x) => all.includes(norm(x)))) problems.push(`${slug} shows Phase 1 prose`);
  // every published finding reaches the findings view, under the all filter
  const missing = file.claims.filter((c) => !views.findings.t.includes(norm(c.Publishable_Summary)));
  if (missing.length) problems.push(`${slug} findings missing ${missing.length} (${missing[0].Claim_ID})`);
  // every source reaches the sources view; outbound links are https and open safely
  const srcMissing = file.evidence.filter((e) => !views.sources.t.includes(norm(e.Source_Title)));
  if (srcMissing.length) problems.push(`${slug} sources missing ${srcMissing.length}`);
  const links = [...views.sources.html.matchAll(/<a [^>]*href="(http[^"]*)"[^>]*>/g)];
  if (links.some((m) => !m[1].startsWith("https://") || !/rel="noopener noreferrer"/.test(m[0]))) problems.push(`${slug} unsafe source link`);
  const counted = p.publishers.reduce((n, x) => n + x.count, 0);
  if (counted !== file.evidence.length) problems.push(`${slug} publisher counts ${counted} of ${file.evidence.length}`);
  // unknown reads as not yet proven, never coerced
  if (file.claims.some((c) => c.Capability_State === "UNKNOWN") && !views.findings.t.includes("Not yet proven")) problems.push(`${slug} unknown label`);
  // breaks, effort, ask and fit views carry their records
  if (file.breaks.length && !file.breaks.every((b) => views.breaks.t.includes(norm(b.Break_Summary)))) problems.push(`${slug} breaks missing`);
  if (file.proof_requirements.length && !views.ask.t.includes("Proof to ask for")) problems.push(`${slug} proof missing`);
  if (file.decision_intelligence.length && !file.decision_intelligence.every((d) => views.fit.t.includes(norm(d.Statement)))) problems.push(`${slug} decisions missing`);
  if (p.klass && p.klass.draft && !/Draft class/.test(views.fit.t)) problems.push(`${slug} draft class unmarked`);
}
ok(`18 researched vendors render all six views cleanly [${problems.slice(0, 4).join("; ")}]`, bySlug.length === 18 && problems.length === 0);

section("1b. Take it further: tool links from the profile");
{
  const { decodeScenario } = await import("./src/lib/scenarioUrl.js");
  const bad = [];
  for (const [slug, { vendorId }] of bySlug) {
    const file = JSON.parse(readFileSync(`${DIR}/vendors/${vendorId}.json`, "utf8"));
    const href = mod.exports.rfpHref(file.vendor.Supplier_Name);
    const st = decodeScenario(href.slice(href.indexOf("?")), "rfp-builder", { vendors: [] });
    if (!st || st.vendors.length !== 1 || st.vendors[0] !== file.vendor.Supplier_Name) bad.push(slug);
    const html = renderToString(React.createElement(Page, { slug, file, shared, manifestDate: "2026-09-23", initialView: "fit" }));
    for (const path of ["/tools/platform-decision", "/tools/contract-risk", "/tools/tco-calculator", "/tools/license-gap", "/tools/vendor-match"]) if (!html.includes(`href="${path}"`)) bad.push(slug + path);
    if (!html.includes(`href="/vendors/ccaas#${file.vendor.Competitive_Class_ID.toLowerCase()}"`)) bad.push(slug + " peers");
    if (!/does not read this research yet/.test(html)) bad.push(slug + " vendor match note");
  }
  ok(`every profile links RFP Builder with the vendor entered, its peers and the tools [${bad.slice(0, 3).join(", ")}]`, bad.length === 0);
  const APP = readFileSync("./App.jsx", "utf8");
  ok("every linked tool route exists", ["rfp-builder", "platform-decision", "contract-risk", "tco-calculator", "license-gap", "vendor-match"].every((t) => APP.includes(`path="/tools/${t}"`)));
}

section("2. The state filter narrows findings and counts nothing");
{
  const [slug, { vendorId }] = bySlug.find(([, v]) => v.vendorId === "VEN-CC-0018");
  const file = JSON.parse(readFileSync(`${DIR}/vendors/${vendorId}.json`, "utf8"));
  for (const f of FILTERS) {
    const t = text(renderToString(React.createElement(Page, { slug, file, shared, initialView: "findings", initialFilter: f.id })));
    const shown = file.claims.filter((c) => t.includes(norm(c.Publishable_Summary)));
    const want = file.claims.filter(f.test);
    ok(`filter "${f.label}" shows exactly its findings (${want.length})`, shown.length === want.length && want.every((c) => shown.includes(c)));
  }
  ok("no filter label carries a number", FILTERS.every((f) => !/\d/.test(f.label)));
}

section("3. The profile route uses the research for exactly the researched vendors");
{
  const VP = readFileSync("./VendorProfile.jsx", "utf8");
  ok("the route checks the research registry, then the snapshot file", /CCAAS_RESEARCH\.complete\[slug\] && researchedProfile\(CCAAS_RESEARCH\.complete\[slug\]\.vendorId\)/.test(VP));
  const files = readdirSync(DIR + "/vendors").map((f) => f.replace(".json", "")).sort();
  ok("every registry vendor has a snapshot file", JSON.stringify(bySlug.map(([, v]) => v.vendorId).sort()) === JSON.stringify(files));
  const LP = readFileSync("./src/lib/research/loadProfile.js", "utf8");
  ok("each vendor's research loads as its own chunk", /import\.meta\.glob\("\.\.\/\.\.\/data\/research\/ccaas\/vendors\/\*\.json"\)/.test(LP) && !/eager/.test(LP));
  const RP = readFileSync("./ResearchedProfile.jsx", "utf8");
  ok("the page reads no Phase 1 vendor data, score or Market Position", !/VendorData|getVendor|\.score\b|\b(v|vendor|p)\.tier\b|market.?position/i.test(RP));
  ok("the page is tokens only", !/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(RP.replace(/^\s*\/\/.*$/gm, "")));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
