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

import { readFileSync } from "node:fs";
import { resolveSeo, vendorDisplayName, SITE } from "./src/lib/seo.js";
import { CATEGORIES, VERTICALS } from "./src/lib/verticals.js";
import { collectVendorNames, findCollisions } from "./gen-seo-names.mjs";

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
  const claim = title.match(/(\d+)\s+(?:Vendors?|Platforms?)\s+Scored/i);
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

/* ------------------------------------------------------------------ report */

if (failures.length) {
  console.log("\nFAILURES");
  for (const f of failures.slice(0, 40)) console.log(`  ${f}`);
  if (failures.length > 40) console.log(`  ...and ${failures.length - 40} more`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
