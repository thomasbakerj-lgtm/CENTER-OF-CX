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
const { readableIds, PLAIN } = await import("./src/lib/research/classWords.js");
const CLASSES = shared.competitive_classes.map((c) => ({ id: c.Competitive_Class_ID, name: c.Class_Name }));
const rd = (t) => readableIds(t, CLASSES); // a class id in research text reads as the class's name
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
  if (!head.includes(file.vendor.Supplier_Name) || !/Researched · validated/.test(head)) problems.push(`${slug} header`);
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
  const missing = file.claims.filter((c) => !views.findings.t.includes(norm(rd(c.Publishable_Summary))));
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
  if (file.breaks.length && !file.breaks.every((b) => views.breaks.t.includes(norm(rd(b.Break_Summary))))) problems.push(`${slug} breaks missing`);
  if (file.proof_requirements.length && !views.ask.t.includes("Proof to ask for")) problems.push(`${slug} proof missing`);
  if (file.decision_intelligence.length && !file.decision_intelligence.every((d) => views.fit.t.includes(norm(rd(d.Statement))))) problems.push(`${slug} decisions missing`);
  if (p.klass && p.klass.draft && !/Provisional peer group|Draft class/.test(views.fit.t)) problems.push(`${slug} draft class unmarked`);
}
ok(`22 researched vendors render all ${VIEWS.length} views cleanly [${problems.slice(0, 4).join("; ")}]`, bySlug.length === 22 && problems.length === 0);

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
    const shown = file.claims.filter((c) => t.includes(norm(rd(c.Publishable_Summary))));
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

/* Audit 30 Sep: product lines printed database labels ("CORE_PLATFORM", "Release state: Ga"). */
{
  const { words: W } = await import("./src/lib/research/profileView.js");
  const raw = [];
  for (const f of readdirSync(DIR + "/vendors")) {
    const file = JSON.parse(readFileSync(`${DIR}/vendors/${f}`, "utf8"));
    for (const p of file.products || []) for (const v of [p.Product_Type, p.GA_Status]) {
      const w = W(v);
      if (w && (/[A-Z]{2,}_[A-Z]/.test(w) || /\b(Ga|Eap|Ucaas|Ccaas|Ai|Qm|Wfm)\b/.test(w))) raw.push(`${f}: ${v} => ${w}`);
    }
  }
  ok("every product type and release state reads as words, with acronyms kept", raw.length === 0, raw.slice(0, 3).join("; "));
  ok("GA stays GA and early access stays EAP", W("GA") === "GA" && W("EAP") === "EAP" && W("PRE_GA_END_OF_SEPTEMBER_2026_TARGET") === "Pre GA end of September 2026 target");
  ok("the product line passes the type through the same words", /\[words\(x\.type\), x\.role\]/.test(readFileSync("./ResearchedProfile.jsx", "utf8")));
}

section("4. Copy audit batch 4: class ids read as names, the comparison line in plain words");
{
  const ids = [];
  for (const [slug, r] of bySlug) {
    const file = JSON.parse(readFileSync(`${DIR}/vendors/${r.vendorId}.json`, "utf8"));
    const html = renderToString(React.createElement(Page, { slug, file, shared, manifestDate: "2026-09-23", initialView: "fit" }))
      + renderToString(React.createElement(Page, { slug, file, shared, manifestDate: "2026-09-23", initialView: "findings" }));
    if (/CLS-CC-\d{3}/.test(html.replace(/(id|href)="[^"]*"/g, ""))) ids.push(slug);
  }
  ok(`no profile prints a class id as text (${ids.join(", ") || "none"})`, ids.length === 0);
  ok("a bare id reads as its class, an id before its own name keeps the name once",
    rd("CLS-CC-004 is the rational peer class.") === "The UC-attached CCaaS class is the rational peer class."
    && rd("best normalized in CLS-CC-004 UC-attached CCaaS rather") === "best normalized in UC-attached CCaaS rather");
  ok("every class has a plain comparison line with no dash and no instruction to researchers",
    CLASSES.every((c) => PLAIN[c.id] && PLAIN[c.id].compared && !/[\u2013\u2014]|Do not penalize|must not be conflated|Judge build burden/i.test(PLAIN[c.id].compared)));
}

section("5. Research Method v2: the method note at the foot, the cost view, the method page (TB, 1 Oct 2026)");
{
  const bad = [];
  for (const [slug, r] of bySlug) {
    const file = JSON.parse(readFileSync(`${DIR}/vendors/${r.vendorId}.json`, "utf8"));
    const html = renderToString(React.createElement(Page, { slug, file, shared, manifestDate: "2026-10-01", initialView: "fit" }));
    const at = html.indexOf("data-method-note=");
    const want = file.vendor.Method_Version === "2" ? "Researched under Research Method 2." : "Researched under Research Method 1. A re-audit under Research Method 2 is in progress.";
    /* At the foot: after the corrections note and the citation line, with nothing but the link and closing tags after it. */
    const foot = html.indexOf('aria-label="Corrections"');
    if (at < 0 || foot < 0 || at < foot || !html.slice(at).includes(want) || !html.slice(at).includes('href="/research/vendor-method"')) bad.push(slug + " foot");
    if (/re-audit|Research Method/i.test(text(html.slice(0, foot)))) bad.push(slug + " method named above the foot");
    const cost = text(renderToString(React.createElement(Page, { slug, file, shared, manifestDate: "2026-10-01", initialView: "cost" })));
    if (file.tco.length && (!file.tco.every((x) => cost.includes(norm(x.Cost_Component))) || !/are not added up/.test(cost))) bad.push(slug + " cost");
    if (file.tco.some((x) => x.Price_Points_Verified !== "YES" && Array.isArray(x.Public_Price_Points) && x.Public_Price_Points.length) && /Published price:/.test(cost)) bad.push(slug + " unverified price shown");
  }
  ok(`every profile names its method once, quietly, at the foot, and shows cost by layer [${bad.slice(0, 3).join(", ")}]`, bad.length === 0);
  const methodSrc = readFileSync("./src/lib/research/methodPage.js", "utf8") + readFileSync("./ResearchMethod.jsx", "utf8");
  ok("the method page leaves out what is proprietary", !/\bagents?\b|\d+\s?%|25[- ]item|\bweights?\b|weighted|Rating_Role|DIFFERENTIATOR|QUALIFICATION_GATE|archetype|founder/i.test(methodSrc.replace(/^\s*\/\/.*$/gm, "")));
  const APP = readFileSync("./App.jsx", "utf8"), SEO = readFileSync("./src/lib/seo.js", "utf8"), MAP = readFileSync("./public/sitemap.xml", "utf8");
  ok("the method page is routed, in the sitemap and the metadata", APP.includes('path="/research/vendor-method"') && MAP.includes("/research/vendor-method</loc>") && SEO.includes('"/research/vendor-method": {'));
  ok("the CCaaS page links the method page quietly", /href="\/research\/vendor-method"/.test(readFileSync("./CCaaSCategory.jsx", "utf8")));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
