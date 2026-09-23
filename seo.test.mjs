/* seo.test.mjs
 *
 * Reachability harness. Every other harness in this suite asks whether a number
 * is right. This one asks whether the page a stranger lands on describes itself
 * correctly, which under Doctrine Amendment 11 comes first: reachability
 * precedes rigor.
 *
 * WHAT THIS EXISTS TO CATCH
 *
 * seo.js built vendor page titles with titleCase(slug). Measured against the
 * live data files, 227 of 282 profiles rendered a title contradicting their own
 * heading, and 25 more (all of WEMData, which carries `vendor` rather than
 * `name`) had no name field read at all. "Genesys Acd" for a page headed
 * "Genesys Cloud". "Koreai Acd" for Kore.ai. The slug became unusable as a
 * display name the moment slugs were suffixed per category to resolve the
 * Sprinklr duplicate, so one reachability fix silently created another.
 *
 * Titles are now resolved from a generated map. A generated map can drift from
 * the data behind it, and drift would be invisible: the fallback still returns
 * a plausible-looking string. Section A is the entire reason the generated
 * approach is safe. Delete it and the map rots silently.
 *
 * Section D is the assertion that should have existed before the Sprinklr
 * profile went missing. A slug present in two data files resolves to whichever
 * accessor VendorProfile.jsx consults first, and the loser becomes an
 * unreachable page with no error anywhere. There are zero duplicates today.
 * Nothing asserted that until now.
 *
 * Run: node seo.test.mjs
 */

import { readFileSync, readdirSync } from "node:fs";
import { resolveSeo, vendorDisplayName, vendorCategoryLabel, SITE,
         TOOL_COUNT, CATEGORY_COUNT, ADJACENT_PROFILE_COUNT, VENDOR_PROFILE_COUNT, SEO_MAP } from "./src/lib/seo.js";
import { CATEGORIES, VERTICALS } from "./src/lib/verticals.js";
import { collectVendorNames, findCollisions, FILE_CATEGORY, collectSubVerticalNames, SUBVERTICAL_FILES } from "./gen-seo-names.mjs";

import { vendors } from "./VendorData.js";
import { ivaVendors } from "./IVAData.js";
import { agentAssistVendors } from "./AgentAssistData.js";
import { marketLayers } from "./WEMData.js";
import { analyticsVendors } from "./AnalyticsData.js";
import { acdVendors } from "./ACDRoutingData.js";
import { deVendors } from "./DigitalEngagementData.js";
import { paymentVendors } from "./PaymentData.js";

let pass = 0, fail = 0;
const failures = [];

function ok(label, cond) {
  if (cond) pass++;
  else { fail++; failures.push(label); }
}
function eq(label, got, want) {
  const good = got === want;
  if (good) pass++;
  else { fail++; failures.push(`${label}\n     got:  ${JSON.stringify(got)}\n     want: ${JSON.stringify(want)}`); }
}
function section(n) { console.log(`\n--- ${n}`); }

const rows = collectVendorNames();
const titleCase = (slug) =>
  slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

/* ------------------------------------------------------------------ A. map */
/* The generated map must equal the live data exactly. A vendor added, renamed
   or removed without running gen-seo-names.mjs fails here rather than shipping
   a title built from its slug. */
section("A. Generated map matches the live data files");

ok("A0  data files yield at least 250 vendor entries", rows.length >= 250);
console.log(`     ${rows.length} entries across 8 data files`);

for (const r of rows) {
  eq(`A1  ${r.file} ${r.slug}: map carries the data file's display name`,
     vendorDisplayName(r.slug), r.name);
  eq(`A1b ${r.file} ${r.slug}: map carries the category label for that data file`,
     vendorCategoryLabel(r.slug), CATEGORIES[r.cat].name);
}

/* The category key is stored, the label is resolved. A key with no CATEGORIES
   entry resolves to an empty label and silently drops the discriminator that
   keeps the title unique. */
for (const r of rows) {
  ok(`A1c ${r.slug}: category key ${r.cat} exists in CATEGORIES`, !!CATEGORIES[r.cat]);
}

/* The reverse direction. An entry left in the map after a vendor is deleted
   would keep a dead route titled and indexed. */
const seoSrc = readFileSync("./src/lib/seo.js", "utf8");
const block = seoSrc.slice(
  seoSrc.indexOf("VENDOR_NAMES_START"),
  seoSrc.indexOf("VENDOR_NAMES_END")
);
const mapSlugs = [...block.matchAll(/^\s*"([^"]+)":/gm)].map((m) => m[1]);
const dataSlugs = new Set(rows.map((r) => r.slug));

eq("A2  map holds exactly as many entries as the data files", mapSlugs.length, rows.length);
for (const s of mapSlugs) {
  ok(`A3  map entry ${s} still exists in a data file`, dataSlugs.has(s));
}

/* --------------------------------------------------------------- B. titles */
/* The title must contain the name a reader sees in the H1. Not a normalised
   form of it, not a close match. Verbatim. */
section("B. Every vendor title and description carries the name verbatim");

for (const r of rows) {
  const seo = resolveSeo(`/vendors/${r.slug}`);
  ok(`B1  ${r.slug}: title contains "${r.name}"`, seo.title.includes(r.name));
  ok(`B2  ${r.slug}: description contains "${r.name}"`, seo.desc.includes(r.name));
  ok(`B3  ${r.slug}: title ends with the site name`, seo.title.endsWith(`| ${SITE}`));
  ok(`B4  ${r.slug}: title is a usable length for a SERP`,
     seo.title.length > 10 && seo.title.length < 160);
  ok(`B5  ${r.slug}: title carries no em-dash`, seo.title.indexOf(String.fromCharCode(0x2014)) === -1);
}

/* The specific regression. Where name and titleCase(slug) differ, the title
   must show the name. This is the assertion that would have caught the
   original defect on the day the slugs were suffixed. */
section("C. The slug-derived title is gone wherever it contradicted the name");

let contradicted = 0;
for (const r of rows) {
  const slugTitle = titleCase(r.slug);
  if (slugTitle === r.name) continue;
  contradicted++;
  const t = resolveSeo(`/vendors/${r.slug}`).title;
  ok(`C1  ${r.slug}: title shows "${r.name}", not "${slugTitle}"`,
     t.includes(r.name) && !t.startsWith(`${slugTitle} |`));
}
console.log(`     ${contradicted} slugs would render a contradicting title under titleCase`);
ok("C2  the defect was broad, not incidental", contradicted > 200);

/* ------------------------------------------------------- D. slug namespace */
/* VendorProfile.jsx resolves a slug through eight sequential accessors with a
   fixed precedence. A duplicate silently hides the later profile. */
section("D. Slug namespace is collision-free across all eight data files");

const collisions = findCollisions(rows);
eq("D1  zero slug collisions", collisions.length, 0);
if (collisions.length) for (const c of collisions) failures.push(`     ${c.slug}: ${c.files.join(" + ")}`);

const counts = new Map();
for (const r of rows) counts.set(r.slug, (counts.get(r.slug) || 0) + 1);
for (const r of rows) {
  ok(`D2  ${r.slug} is claimed by exactly one data file`, counts.get(r.slug) === 1);
}

/* Sprinklr is the named case. It appears in three categories under three
   slugs, and all three must be independently reachable. */
const sprinklr = rows.filter((r) => r.slug.startsWith("sprinklr"));
ok("D3  Sprinklr resolves to more than one distinct profile", sprinklr.length >= 2);
for (const r of sprinklr) {
  ok(`D4  ${r.slug} reaches its own profile titled "${r.name}"`,
     resolveSeo(`/vendors/${r.slug}`).title.includes(r.name));
}

/* --------------------------------------------------------------- E. counts */
/* A title promising "52 Vendors Scored" over a page whose own heading reads
   "All 41 vendors" is a quantified claim a buyer can disprove in ten seconds.
   The data files are the arbiter: every category page renders .length. */
section("E. Category vendor counts agree across data, metadata and title tag");

const wemAll = Object.values(marketLayers).flatMap((l) => l.vendors);
const ACTUAL = {
  ccaas: Object.values(vendors).filter((v) => v.categorySlug === "ccaas").length,
  iva: Object.keys(ivaVendors).length,
  "agent-assist": agentAssistVendors.length,
  "wem-qm": wemAll.length,
  analytics: analyticsVendors.length,
  "acd-routing": acdVendors.length,
  "digital-engagement": deVendors.length,
  payments: paymentVendors.length,
};

for (const [slug, actual] of Object.entries(ACTUAL)) {
  eq(`E1  ${slug}: CATEGORIES.vendorCount matches the data file`,
     CATEGORIES[slug].vendorCount, actual);

  const title = resolveSeo(`/vendors/${slug}`).title;
  /* CCaaS says Profiled since the S22 integrity freeze withdrew its Phase 1 scores. */
  const claim = title.match(/(\d+)\s+(?:Vendors?|Platforms?)\s+(?:Scored|Profiled)/i);
  ok(`E2  ${slug}: title states a vendor count`, !!claim);
  if (claim) eq(`E3  ${slug}: title count matches the data file`, Number(claim[1]), actual);
}

eq("E4  eight categories is the number, and code is the arbiter",
   Object.keys(CATEGORIES).length, 8);

/* Total profile routes reconcile: categorised vendors plus the adjacent
   platforms tracked on the CCaaS page but not scored as core CCaaS. */
const adjacent = Object.values(vendors).filter((v) => v.categorySlug === "adjacent").length;
const categorised = Object.values(ACTUAL).reduce((a, b) => a + b, 0);
eq("E5  every profile route is either categorised or adjacent, none stranded",
   categorised + adjacent, rows.length);

/* ------------------------------------------------- E2. surfaced counts ----
   Section E above proves the data, the registry and the category page title
   agree. It said nothing about the two pages that send the most traffic into
   them. Both carried hand-typed counts and both were wrong.

   Homepage.jsx advertised 283 vendors and six of eight category tiles were
   wrong: Agent Assist 38 against 15, WEM 32 against 25, Analytics 45 against
   41, ACD 28 against 44, Digital 36 against 46, Payments 30 against 33.
   Vendors.jsx was worse. Its H1 and hero stat both read "350+ vendors" over a
   catalogue of 282, and four tiles disagreed with their own category pages.

   A wrong count is not a cosmetic defect. It is a quantified claim a buyer
   disproves in one click, on the two pages where independence is the whole
   pitch, and an overclaim costs more trust than an underclaim. So the fix was
   to delete the literals rather than correct them, and this section is what
   keeps them deleted. E10 and E11 fail on any reintroduced literal, which is
   the assertion whose absence let every number above drift in the first
   place. */
section("E2. Counts rendered on Homepage and Vendors derive from the registry");

eq("E6  ADJACENT_PROFILE_COUNT matches the adjacent rows in VendorData",
   ADJACENT_PROFILE_COUNT, adjacent);

eq("E7  VENDOR_PROFILE_COUNT equals every profile route in the live data",
   VENDOR_PROFILE_COUNT, rows.length);

eq("E8  CATEGORY_COUNT equals the registry", CATEGORY_COUNT, Object.keys(CATEGORIES).length);

/* App.jsx is the arbiter for tools. The 31st /tools/ reference there is the
   LegacyRedirect target for /tco-calculator, not a route, which is why a raw
   reference count reads one high and must not be used. */
const appSrc = readFileSync("./App.jsx", "utf8");
/* S22: a retired tool keeps its path as a LegacyRedirect route so an in-app
   link or a bookmark lands on the living asset. Those are not tools. */
const toolRoutes = new Set(
  [...appSrc.matchAll(/<Route\s+path="(\/tools\/[a-z0-9-]+)"\s+element=\{<(?!LegacyRedirect)/g)].map((m) => m[1])
);

/* S22 removals (TB decisions 19 Sep 2026): three tools retired, two folded.
   Each path 301s to its nearest living asset at the edge and in the app, and
   leaves the sitemap, the metadata map, the tool index and every inbound link. */
const RETIRED = {
  "/tools/service-design": "/tools/cx-maturity",
  "/tools/experience-scorecard": "/tools/cost-per-contact",
  "/tools/integration-planner": "/vendors",
  "/tools/agent-experience": "/tools/attrition-cost",
  "/tools/calibration-drift": "/tools/qa-scorecard",
};
{
  const vercel = JSON.parse(readFileSync("./vercel.json", "utf8"));
  const smap = readFileSync("./public/sitemap.xml", "utf8");
  const inbound = readdirSync(".").filter((f) => f.endsWith(".jsx") && f !== "App.jsx");
  for (const [from, to] of Object.entries(RETIRED)) {
    ok(`R1 ${from}: permanent 301 at the edge to ${to}`, vercel.redirects.some((r) => r.source === from && r.destination === to && r.permanent === true));
    ok(`R2 ${from}: the app route redirects to ${to}`, appSrc.includes(`<Route path="${from}" element={<LegacyRedirect to="${to}" />} />`));
    ok(`R3 ${from}: the destination is a live route`, to === "/vendors" ? appSrc.includes('<Route path="/vendors" element') : toolRoutes.has(to));
    ok(`R4 ${from}: gone from the sitemap`, !smap.includes(from + "<"));
    ok(`R5 ${from}: gone from the metadata map`, !Object.prototype.hasOwnProperty.call(SEO_MAP, from));
    const linkers = inbound.filter((f) => readFileSync("./" + f, "utf8").includes(`"${from}"`));
    ok(`R6 ${from}: no page links to it [${linkers.join(", ")}]`, linkers.length === 0);
  }
}
eq("E9  TOOL_COUNT equals the distinct tool routes mounted in App.jsx",
   TOOL_COUNT, toolRoutes.size);

const sitemapTools = (readFileSync("./public/sitemap.xml", "utf8")
  .match(/<loc>[^<]*\/tools\/[a-z0-9-]+<\/loc>/g) || []).length;
eq("E9b every mounted tool route is in the sitemap", sitemapTools, toolRoutes.size);

/* The literal detector. Two-to-four digit counts, and any N+ form, standing
   next to vendor, tool, profile, platform or category language. Single digits
   are excluded so "a shortlist of 3 to 5 vendors" does not fire, but the
   category count is caught at any width because 8 is the real claim. Run
   against the pre-fix files this flags 15 literals on the homepage and the
   350+ pair on the vendor page. */
const COUNT_LITERAL = [
  /\b\d{2,4}\+?\s*(?:free\s+)?(?:vendors?|tools?|profiles?|platforms?)\b/gi,
  /\b\d{1,4}\+?\s+categories\b/gi,
  /\b\d{1,4}\+\s*(?:vendors?|tools?|profiles?|platforms?)\b/gi,
];
const countLiterals = (src) => COUNT_LITERAL.flatMap((r) => src.match(r) || []);

const SURFACES = {
  "Homepage.jsx": ["TOOL_COUNT", "CATEGORY_COUNT", "VENDOR_PROFILE_COUNT"],
  "Vendors.jsx": ["VENDOR_PROFILE_COUNT"],
  /* S22: the site-wide Organization JSON-LD read "283 vendors scored. 30 free
     tools." after both pages above were fixed. Search engines read it on every route. */
  "App.jsx": ["TOOL_COUNT", "CATEGORY_COUNT", "VENDOR_PROFILE_COUNT"],
};

let li = 10;
for (const [file, required] of Object.entries(SURFACES)) {
  const src = readFileSync(`./${file}`, "utf8");
  const found = countLiterals(src);
  eq(`E${li}  ${file}: no hand-typed vendor, tool or category count [${found.join(", ")}]`,
     found.length, 0);

  ok(`E${li}b ${file}: reads the derived counts from seo.js`,
     required.every((n) => new RegExp(`\\b${n}\\b`).test(src)));

  /* A tile that links to a path the registry does not publish is a broken
     journey even when its number is right. */
  ok(`E${li}c ${file}: reads category hrefs from CATEGORIES rather than typing them`,
     !/href:\s*"\/vendors\/(ccaas|iva|agent-assist|wem-qm|analytics|acd-routing|digital-engagement|payments)"/.test(src));
  li++;
}

/* ------------------------------------------------------------ F. fallbacks */
/* titleCase survives as a fallback for category, vertical and sub-vertical
   paths. Prove no live route reaches it, so it is dead weight rather than a
   live defect surface. */
section("F. The titleCase fallback is unreachable for every route in the sitemap");

const locs = [...readFileSync("./public/sitemap.xml", "utf8").matchAll(/<loc>(.*?)<\/loc>/g)]
  .map((m) => m[1].replace(/^https?:\/\/[^/]+/, "") || "/");

ok("F0  sitemap parsed", locs.length > 300);

const catKeys = new Set(Object.keys(CATEGORIES));
const vertKeys = new Set(Object.keys(VERTICALS));

const sitemapVendorRoutes = locs.filter((p) => p.startsWith("/vendors/"));
for (const p of sitemapVendorRoutes) {
  const parts = p.replace("/vendors/", "").split("/");
  if (parts.length === 1) {
    ok(`F1  ${p}: resolves as a known category or a mapped vendor`,
       catKeys.has(parts[0]) || dataSlugs.has(parts[0]));
  } else {
    ok(`F2  ${p}: category segment has a real name, not a title-cased slug`, catKeys.has(parts[0]));
    ok(`F3  ${p}: vertical segment has a real name, not a title-cased slug`, vertKeys.has(parts[1]));
  }
}

for (const p of locs.filter((x) => x.startsWith("/industries/") && x !== "/industries")) {
  const parts = p.replace("/industries/", "").split("/");
  ok(`F4  ${p}: vertical segment has a real name, not a title-cased slug`, vertKeys.has(parts[0]));
}

/* ------------------------------------------------------ G. sitemap parity */
/* A profile with no sitemap entry is a page nobody crawls. A sitemap entry with
   no profile is a crawl budget spent on VendorNotFound. */
section("G. Sitemap and data files describe the same set of profiles");

const sitemapProfiles = new Set(
  sitemapVendorRoutes
    .map((p) => p.replace("/vendors/", ""))
    .filter((s) => !s.includes("/") && !catKeys.has(s))
);

eq("G1  sitemap profile count equals data file entry count", sitemapProfiles.size, rows.length);
for (const r of rows) ok(`G2  ${r.slug} appears in the sitemap`, sitemapProfiles.has(r.slug));
for (const s of sitemapProfiles) ok(`G3  sitemap route /vendors/${s} has a data entry`, dataSlugs.has(s));
for (const c of catKeys) ok(`G4  category page /vendors/${c} is in the sitemap`, locs.includes(`/vendors/${c}`));

/* --------------------------------------------------- H. title uniqueness */
/* The assertion whose absence let the last regression ship. Resolving the
   display name was correct and still collapsed 96 vendor routes onto 38
   duplicate titles and 38 duplicate descriptions, because the same vendor
   holds a profile in up to five categories under five suffixed slugs. Five9,
   Talkdesk and Amazon Connect each rendered five byte-identical titles.
   Duplicate titles across a page class are the textbook doorway signal, and
   every section above passed while it was live.

   Uniqueness is asserted globally, across every route in the sitemap rather
   than only across vendor routes, because a vendor title can equally collide
   with a category, tool or industry title. */
section("H. Every route in the sitemap has a unique title and description");

const uniqueLocs = [...new Set(locs)];
eq("H0  sitemap itself lists no route twice", uniqueLocs.length, locs.length);

const titleOwners = new Map();
const descOwners = new Map();
for (const p of uniqueLocs) {
  const r = resolveSeo(p);
  if (!titleOwners.has(r.title)) titleOwners.set(r.title, []);
  titleOwners.get(r.title).push(p);
  if (!descOwners.has(r.desc)) descOwners.set(r.desc, []);
  descOwners.get(r.desc).push(p);
}

eq("H1  distinct titles equals route count", titleOwners.size, uniqueLocs.length);
eq("H2  distinct descriptions equals route count", descOwners.size, uniqueLocs.length);

for (const [t, owners] of titleOwners) {
  ok(`H3  title unique: "${t}" claimed by ${owners.join(", ")}`, owners.length === 1);
}
for (const [, owners] of descOwners) {
  ok(`H4  description unique: claimed by ${owners.join(", ")}`, owners.length === 1);
}

/* A route with no description hands the SERP snippet to the crawler. */
for (const p of uniqueLocs) {
  const r = resolveSeo(p);
  ok(`H5  ${p}: has a substantive description`, typeof r.desc === "string" && r.desc.length > 40);
  ok(`H6  ${p}: description carries no em-dash`,
     (r.desc || "").indexOf(String.fromCharCode(0x2014)) === -1);
  ok(`H7  ${p}: title carries no em-dash`,
     (r.title || "").indexOf(String.fromCharCode(0x2014)) === -1);
}

/* ------------------------------------------------------------------ report */


/* ------------------------------------------------------ Z. prototype keys */
/* Route segments arrive from the address bar. A bare bracket read resolves
   inherited names through Object.prototype, which printed native code into the
   title and let /vendors/ccaas/toString claim the scored, indexable branch. */
section("Z. Prototype names in route segments resolve as unknown");
{
  const PROTO = ["constructor", "toString", "__proto__", "hasOwnProperty", "valueOf", "isPrototypeOf", "toLocaleString"];
  const native = (s) => /native code|function /.test(String(s));
  for (const k of PROTO) {
    for (const p of [`/vendors/${k}`, `/vendors/${k}/healthcare`, `/vendors/ccaas/${k}`, `/vendors/${k}/${k}`, `/industries/${k}`, `/industries/${k}/x`, `/industries/healthcare/${k}`, `/${k}`]) {
      let r, threw = false;
      try { r = resolveSeo(p); } catch (e) { threw = true; }
      ok(`Z  ${p} does not throw`, !threw);
      if (threw) continue;
      ok(`Z  ${p} title carries no native code`, !native(r.title));
      ok(`Z  ${p} description carries no native code`, !native(r.desc));
    }
    eq(`Z  /vendors/ccaas/${k} is not indexable`, resolveSeo(`/vendors/ccaas/${k}`).known, false);
    ok(`Z  /vendors/ccaas/${k} does not claim scored fit`, !/Scored Vendors/.test(resolveSeo(`/vendors/ccaas/${k}`).title));
    eq(`Z  /${k} does not match a mapped route`, resolveSeo(`/${k}`).known, false);
    eq(`Z  vendorDisplayName("${k}") falls back to the slug`, vendorDisplayName(k), titleCase(k));
    eq(`Z  vendorCategoryLabel("${k}") is empty`, vendorCategoryLabel(k), "");
  }
  const SEO_SRC = readFileSync("./src/lib/seo.js", "utf8");
  ok("Z  source gate: seo.js defines an own-key reader", /const own = \(o, k\) => \(Object\.prototype\.hasOwnProperty\.call\(o, k\)/.test(SEO_SRC));
  ok("Z  source gate: no bare bracket read on a name map", !/\b(CAT_NAMES|VERT_NAMES|LEGACY_CAT_NAMES|LEGACY_VERT_NAMES|VENDOR_NAMES|SEO_MAP)\[/.test(SEO_SRC));
}


/* ------------------------------------------------ V. Vendor Match roster */
/* Vendor Match carries its own scoring roster. Three of its slugs pointed at
   profiles that do not exist, so the shortlist linked a gated user to dead
   pages, and its names and tiers used a different vocabulary from the category
   page. Every roster slug must resolve, and the shortlist must read name and
   tier from the profile it links to. */
section("V. Vendor Match roster resolves to live CCaaS profiles");
{
  const VM = readFileSync("./VendorMatchEngine.jsx", "utf8");
  const roster = [...VM.matchAll(/\{ name:"[^"]+",slug:"([^"]+)",tier:"/g)].map(m => m[1]);
  const core = Object.values(vendors).filter(v => v.categorySlug === "ccaas").map(v => v.slug);
  eq("V  roster size equals the CCaaS profile count", roster.length, core.length);
  eq("V  roster has no duplicate slugs", new Set(roster).size, roster.length);
  for (const slug of roster) {
    ok(`V  ${slug} resolves to a profile`, Object.prototype.hasOwnProperty.call(vendors, slug));
    ok(`V  ${slug} resolves to a CCaaS profile`, vendors[slug] && vendors[slug].categorySlug === "ccaas");
  }
  for (const slug of core) ok(`V  CCaaS profile ${slug} is in the Vendor Match roster`, roster.includes(slug));
  ok("V  source gate: Vendor Match imports the profile reader", /import \{ getVendor \} from "\.\/VendorData"/.test(VM));
  ok("V  source gate: shortlist name and tier come from the profile", /name: p \? p\.name : v\.name, tier: p \? p\.tier : v\.tier/.test(VM));
  ok("V  Vendor Match contains no em-dash or en-dash", VM.indexOf(String.fromCharCode(0x2014)) < 0 && VM.indexOf(String.fromCharCode(0x2013)) < 0);
  const CC = readFileSync("./CCaaSCategory.jsx", "utf8");
  /* Integrity freeze (S22): Phase 1 CCaaS scores are withdrawn. Page and meta must agree
     that they are, and neither may claim the retired 27-dimension composite or tiers. */
  const CCMETA = resolveSeo("/vendors/ccaas");
  ok("V  CCaaS page and meta both state that scores are withdrawn", /withdrawn/.test(CC) && /withdrawn/.test(CCMETA.desc));
  ok("V  CCaaS meta claims no score, dimension count or tier", !/scored|weighted dimensions|bell curve|tier/i.test(CCMETA.title + " " + CCMETA.desc));
  ok("V  CCaaS page renders no composite score or tier", !/\{v\.score\}|\{v\.tier\}|v\.tier ===|ranked by weighted composite/i.test(CC));
  ok("V  CCaaS category page contains no em-dash or en-dash", CC.indexOf(String.fromCharCode(0x2014)) < 0 && CC.indexOf(String.fromCharCode(0x2013)) < 0);
}


/* ------------------------------------------------ S. industries soft 404 */
/* Every /industries/<vertical>/<slug> path used to claim known:true with a
   title built from the slug, so a typo told crawlers to index a page that
   renders "Sub-vertical not found". Only real pages may be indexable, and real
   sub-vertical pages carry the name their H1 renders. */
section("S. Industries routes are indexable only when the page exists");
{
  const subs = collectSubVerticalNames();
  const SEO_SRC = readFileSync("./src/lib/seo.js", "utf8");
  ok("S  generator walks ten sub-vertical files", Object.keys(SUBVERTICAL_FILES).length === 10);
  ok("S  every sub-vertical file keys a real vertical", Object.keys(SUBVERTICAL_FILES).every((k) => Object.prototype.hasOwnProperty.call(VERTICALS, k)));
  ok("S  at least 60 sub-vertical pages", subs.length >= 60);
  const m = SEO_SRC.match(/const SUBVERTICAL_NAMES = \{([\s\S]*?)\n\};/);
  ok("S  generated sub-vertical map present", !!m);
  const gen = m ? Object.fromEntries([...m[1].matchAll(/^\s+("[^"]+"): ("(?:[^"\\]|\\.)*"),$/gm)].map((x) => [JSON.parse(x[1]), JSON.parse(x[2])])) : {};
  eq("S  generated map size equals live data", Object.keys(gen).length, subs.length);
  const titles = new Set();
  for (const { key, name } of subs) {
    eq(`S  map entry ${key} matches live name`, gen[key], name);
    const r = resolveSeo(`/industries/${key}`);
    eq(`S  /industries/${key} is indexable`, r.known, true);
    ok(`S  /industries/${key} title carries the page name`, r.title.startsWith(`${name} CX Intelligence | `));
    ok(`S  /industries/${key} title is unique`, !titles.has(r.title));
    titles.add(r.title);
  }
  for (const v of Object.keys(VERTICALS)) {
    eq(`S  /industries/${v} is indexable`, resolveSeo(`/industries/${v}`).known, true);
    eq(`S  /industries/${v}/not-a-page is not indexable`, resolveSeo(`/industries/${v}/not-a-page`).known, false);
    eq(`S  /industries/${v}/a/b is not indexable`, resolveSeo(`/industries/${v}/a/b`).known, false);
  }
  for (const p of ["/industries/not-a-vertical", "/industries/not-a-vertical/x", "/industries/constructor", "/industries/healthcare/toString", "/industries/a/b/c", "/industries/retail/ecommerce"]) {
    eq(`S  ${p} is not indexable`, resolveSeo(p).known, false);
  }
  ok("S  source gate: sub-vertical lookup is own-key", /own\(SUBVERTICAL_NAMES, /.test(SEO_SRC));
  ok("S  source gate: no unconditional known:true in the industries branch", !/seo\.known = true;[\s\S]{0,40}CX technology intelligence for/.test(SEO_SRC) && !/CX Intelligence \| \$\{SITE\}`;\n\s+seo\.known = true;/.test(SEO_SRC));
}

section("P. Sub-vertical getters resolve prototype names as not found");
{
  const { readdirSync } = await import("node:fs");
  const { pathToFileURL } = await import("node:url");
  const PROTO = ["toString", "constructor", "__proto__", "hasOwnProperty", "valueOf", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "__defineGetter__", "__lookupGetter__"];
  const files = readdirSync(".").filter((f) => f.endsWith("SubVerticalData.js")).sort();
  eq("P  ten sub-vertical data files present", files.length, 10);
  let pages = 0;
  for (const f of files) {
    const mod = await import(pathToFileURL(`./${f}`).href);
    const getName = Object.keys(mod).find((k) => /^get\w*SubVertical$/.test(k));
    const allName = Object.keys(mod).find((k) => /^getAll\w*SubVerticalSlugs$/.test(k));
    ok(`P  ${f} exports a getter and a slug lister`, !!getName && !!allName);
    if (!getName || !allName) continue;
    const get = mod[getName];
    const slugs = mod[allName]();
    pages += slugs.length;
    ok(`P  ${f} every live slug renders layers and kpis`, slugs.every((sl) => {
      try { const sv = get(sl); return !!sv && Array.isArray(sv.layers) && Array.isArray(sv.kpis); } catch { return false; }
    }));
    for (const n of PROTO) {
      let got;
      try { got = get(n); } catch { got = "THREW"; }
      eq(`P  ${getName}("${n}") is not found`, got, undefined);
    }
    const src = readFileSync(`./${f}`, "utf8");
    ok(`P  source gate: ${f} has no bare [slug] lookup`, !/=>\s*\w+\[slug\]/.test(src));
    ok(`P  source gate: ${f} getter is own-key`, /Object\.prototype\.hasOwnProperty\.call\(\w+, slug\)/.test(src));
  }
  eq("P  getter slugs match the generated sub-vertical count", pages, collectSubVerticalNames().length);
}

section("Q. Sitemap carries every sub-vertical page and nothing else under a vertical");
{
  const subs = collectSubVerticalNames();
  const want = new Set(subs.map(({ key }) => `/industries/${key}`));
  const have = new Set(locs.filter((p) => /^\/industries\/[^/]+\/[^/]+$/.test(p)));
  const APP_SRC = readFileSync("./App.jsx", "utf8");
  eq("Q  sitemap sub-vertical count equals generated count", have.size, want.size);
  for (const p of want) ok(`Q  ${p} is in the sitemap`, have.has(p));
  for (const p of have) ok(`Q  sitemap ${p} has a data entry`, want.has(p));
  for (const v of new Set(subs.map(({ key }) => key.split("/")[0]))) {
    ok(`Q  App.jsx routes /industries/${v}/:slug`, APP_SRC.includes(`path="/industries/${v}/:slug"`));
  }
}

section("H. Hand-written anchor sub-vertical descriptions");
{
  const { readdirSync } = await import("node:fs");
  const SEO_SRC = readFileSync("./src/lib/seo.js", "utf8");
  const DASH = (s) => s.indexOf(String.fromCharCode(0x2014)) >= 0 || s.indexOf(String.fromCharCode(0x2013)) >= 0;
  const TEMPLATE = "CX technology intelligence for ";
  const m = SEO_SRC.match(/const SUBVERTICAL_DESC = \{([\s\S]*?)\n\};/);
  ok("H  hand-written description map present", !!m);
  const hand = m ? Object.fromEntries([...m[1].matchAll(/^\s+("[^"]+"): ("(?:[^"\\]|\\.)*"),$/gm)].map((x) => [JSON.parse(x[1]), JSON.parse(x[2])])) : {};
  eq("H  map holds exactly ten entries", Object.keys(hand).length, 10);
  const subs = collectSubVerticalNames();
  const realKeys = new Set(subs.map(({ key }) => key));
  const files = readdirSync(".").filter((f) => f.endsWith("SubVerticalData.js")).sort();
  const anchors = new Map();
  let dashTotal = 0;
  for (const f of files) {
    const src = readFileSync(`./${f}`, "utf8");
    for (const c of src) if (c === String.fromCharCode(0x2014) || c === String.fromCharCode(0x2013)) dashTotal++;
  }
  for (const [vert, obj] of Object.entries(SUBVERTICAL_FILES)) {
    const slug = Object.keys(obj)[0];
    anchors.set(`${vert}/${slug}`, obj[slug]);
  }
  ok("H  dash count in sub-vertical data never rises above 1049", dashTotal <= 1049);
  const seen = new Set();
  for (const [key, desc] of Object.entries(hand)) {
    ok(`H  ${key} is a real sub-vertical page`, realKeys.has(key));
    ok(`H  ${key} is the first entry of its data file`, anchors.has(key));
    const r = resolveSeo(`/industries/${key}`);
    eq(`H  ${key} resolves to its hand-written description`, r.desc, desc);
    eq(`H  ${key} stays indexable`, r.known, true);
    ok(`H  ${key} description is 110 to 160 characters`, desc.length >= 110 && desc.length <= 160);
    ok(`H  ${key} description has no em-dash or en-dash`, !DASH(desc));
    ok(`H  ${key} description is not the template`, !desc.startsWith(TEMPLATE));
    ok(`H  ${key} description is unique`, !seen.has(desc));
    seen.add(desc);
    const a = anchors.get(key);
    ok(`H  ${key} rendered intro has no em-dash or en-dash`, !!a && !DASH(a.intro));
    ok(`H  ${key} tagline has no em-dash or en-dash`, !!a && !DASH(a.tagline));
  }
  eq("H  one hand-written description per vertical", new Set(Object.keys(hand).map((k) => k.split("/")[0])).size, 10);
  eq("H  every anchor has a hand-written description", [...anchors.keys()].filter((k) => !hand[k]).length, 0);
  for (const { key } of subs) {
    if (hand[key]) continue;
    ok(`H  ${key} keeps the template fallback`, resolveSeo(`/industries/${key}`).desc.startsWith(TEMPLATE));
  }
  for (const p of ["/industries/travel/constructor", "/industries/travel/__proto__", "/industries/retail/airlines", "/industries/travel/airlines/x"]) {
    ok(`H  ${p} never receives a hand-written description`, !Object.values(hand).includes(resolveSeo(p).desc));
  }
  ok("H  source gate: lookup is own-key and gated on a real page", /\(realSub && own\(SUBVERTICAL_DESC, /.test(SEO_SRC));
}

/* ------------------------------------------ I. server redirects and demand URLs */
/* A client-side redirect answers 200 to a crawler, so the legacy path indexes as
   its own page. The 308 must live in vercel.json, ahead of the SPA rewrite. */
section("I. server-side redirects and indexed demand URLs");
{
  const vj = JSON.parse(readFileSync("./vercel.json", "utf8"));
  const r = (vj.redirects || []).find((x) => x.source === "/tco-calculator");
  ok("I1  /tco-calculator has a server redirect", !!r);
  ok("I2  it targets /tools/tco-calculator", r && r.destination === "/tools/tco-calculator");
  ok("I3  it is permanent (308)", r && r.permanent === true && !("statusCode" in r));
  const smLocs = [...readFileSync("./public/sitemap.xml", "utf8").matchAll(/<loc>(.*?)<\/loc>/g)].map((x) => x[1]);
  ok("I4  the legacy path is not in the sitemap", !smLocs.some((u) => u.endsWith("/tco-calculator") && !u.includes("/tools/")));
  ok("I5  /research/ccaas-buyer-guide is in the sitemap", smLocs.includes("https://www.contactcentercx.com/research/ccaas-buyer-guide"));
  ok("I6  sitemap has no duplicate URLs", new Set(smLocs).size === smLocs.length);
  ok("I7  every sitemap URL is on the www host", smLocs.every((u) => u.startsWith("https://www.contactcentercx.com")));
  /* The 12 category-vertical pages Google indexed on its own, from the 16 Sep GSC
     export. Each must be a real category and vertical pair, or it renders the
     not-found message with a 200. */
  const INDEXED_CV = ["analytics/utilities", "analytics/education", "analytics/travel", "analytics/financial-services",
    "payments/healthcare", "payments/telecom", "digital-engagement/education", "digital-engagement/retail",
    "agent-assist/manufacturing", "agent-assist/healthcare", "iva/government", "iva/insurance"];
  for (const cv of INDEXED_CV) {
    const [c, v] = cv.split("/");
    ok(`I8  /vendors/${cv} is in the sitemap`, smLocs.includes(`https://www.contactcentercx.com/vendors/${cv}`));
    ok(`I9  /vendors/${cv} is a valid category and vertical`, !!CATEGORIES[c] && !!VERTICALS[v]);
  }
  const cvLocs = smLocs.map((u) => u.replace("https://www.contactcentercx.com", "")).filter((p) => p.split("/").length === 4 && p.startsWith("/vendors/"));
  ok("I10 no sitemap category-vertical URL renders the not-found message", cvLocs.every((p) => { const [, , c, v] = p.split("/"); return !!CATEGORIES[c] && !!VERTICALS[v]; }));
  for (const [from, to] of [["/vendors/ccaas/travel-hospitality", "/vendors/ccaas/travel"], ["/vendors/ccaas/retail-ecommerce", "/vendors/ccaas/retail"]]) {
    const rr = (vj.redirects || []).find((x) => x.source === from);
    ok(`I11 legacy slug ${from} 308s to ${to}`, !!rr && rr.destination === to && rr.permanent === true);
    ok(`I12 legacy slug ${from} is not in the sitemap`, !smLocs.some((u) => u.endsWith(from)));
  }
}

/* ------------------------------------ J. buyer guide summary reconciles with PDF */
/* The public summary layer restates the published guide. Every count it shows
   must reconcile with the guide itself, or the page contradicts the PDF it links. */
section("J. CCaaS buyer guide summary layer reconciles with the published PDF");
{
  const gr = readFileSync("./GatedReport.jsx", "utf8");
  const blk = (gr.match(/"ccaas-buyer-guide": \{[\s\S]*?\n  \},\n/) || [""])[0];
  const pdf = readFileSync("./public/CCaaS-Platform-Buyer-Guide-2026.pdf", "latin1");
  const pdfPages = Number((pdf.match(/\/Type\s*\/Pages[^>]*?\/Count\s+(\d+)/) || pdf.match(/\/Count\s+(\d+)/) || [])[1]);
  ok("J1  config block found with a summary", /summary: \{/.test(blk));
  ok("J2  page count matches the PDF", blk.includes(`pages: "${pdfPages} pages"`));
  const weights = [...(blk.match(/domains: \[([\s\S]*?)\],\n\s*dimensions/) || ["", ""])[1].matchAll(/, (\d+)\]/g)].map((x) => +x[1]);
  ok("J3  seven domains", weights.length === 7);
  ok("J4  domain weights sum to 100", weights.reduce((a, b) => a + b, 0) === 100);
  ok("J5  27 dimensions", /dimensions: 27,/.test(blk));
  const tierVendors = [...blk.matchAll(/vendors: \[([^\]]*)\]/g)].map((x) => x[1].split(",").filter((v) => v.trim()).length);
  const adjacent = ((blk.match(/adjacent: \[([^\]]*)\]/) || ["", ""])[1].split(",").filter((v) => v.trim())).length;
  ok("J6  four tiers", tierVendors.length === 4);
  ok("J7  tiers plus adjacent platforms total the 28 scored", tierVendors.reduce((a, b) => a + b, 0) + adjacent === 28);
  ok("J8  tier bands are contiguous and cover 0 to 100", /band: "85 to 100"[\s\S]*band: "70 to 84"[\s\S]*band: "55 to 69"[\s\S]*band: "below 55"/.test(blk));
  ok("J9  the PDF link resolves to a shipped file", blk.includes('pdf: "/CCaaS-Platform-Buyer-Guide-2026.pdf"'));
  ok("J10 no stale 7-dimension claim in the guide config", !/\b7 (weighted )?dimensions/.test(blk));
  const seoSrc = readFileSync("./src/lib/seo.js", "utf8");
  const seoDesc = (seoSrc.match(/"\/research\/ccaas-buyer-guide": \{[\s\S]*?desc: "([^"]*)"/) || ["", ""])[1];
  ok("J11 seo description states 27 dimensions", /27 weighted dimensions/.test(seoDesc));
  ok("J12 Research card states the PDF page count", readFileSync("./Research.jsx", "utf8").includes(`read: "${pdfPages} pages",\n      title: "CCaaS Platform Buyer's Guide 2026"`));
  ok("J13 Homepage card states the PDF page count", readFileSync("./Homepage.jsx", "utf8").includes(`p: "${pdfPages} pages", href: "/research/ccaas-buyer-guide"`));
  ok("J14 open reports skip the unlock page", /if \(unlocked && !open\)/.test(gr));
  ok("J15 the full guide opens with no form", /open \? \(<>[\s\S]*?href=\{report\.pdf\}/.test(gr));
  ok("J16 the summary renders only for reports that carry one", /\{open && <Summary report=\{report\} onOpen=\{onOpen\} \/>\}/.test(gr));
  ok("J17 no new dashes in the summary layer", !/[\u2013\u2014]/.test((gr.match(/function Summary\([\s\S]*?\n}\n/) || [""])[0] + blk));
}

if (failures.length) {
  console.log("\nFAILURES");
  for (const f of failures.slice(0, 40)) console.log(`  ${f}`);
  if (failures.length > 40) console.log(`  ...and ${failures.length - 40} more`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
