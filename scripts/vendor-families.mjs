// scripts/vendor-families.mjs
//
// One page per vendor (open item 13, TB 13 Oct 2026). Keeps two files in step with the families seo.js derives from the
// vendor name map (VENDOR_FAMILIES):
//   vercel.json   one permanent redirect per merged category slug, to its section on the family page (#slug);
//   sitemap.xml   merged slugs out (each redirects), family pages in.
// Run after adding or renaming a vendor (after gen-seo-names.mjs): node scripts/vendor-families.mjs
// With --check it writes nothing and exits 1 if either file is out of step (vendorfamily.test.mjs runs it).
import { readFileSync, writeFileSync } from "node:fs";
import { VENDOR_FAMILIES, BASE } from "../src/lib/seo.js";

const check = process.argv.includes("--check");
const MARK = (r) => typeof r.source === "string" && r.source.startsWith("/vendors/:merged(");

export function redirects() {
  return Object.entries(VENDOR_FAMILIES).sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([main, members]) => members.slice(1).map((m) => ({ source: `/vendors/:merged(${m})`, destination: `/vendors/${main}#${m}`, permanent: true })));
}

export function vercelJson(text) {
  const v = JSON.parse(text);
  v.redirects = [...v.redirects.filter((r) => !MARK(r)), ...redirects()];
  return JSON.stringify(v, null, 2) + "\n";
}

export function sitemapXml(text) {
  const merged = new Set(Object.values(VENDOR_FAMILIES).flatMap((m) => m.slice(1)));
  return text.replace(/  <url>\n    <loc>([^<]+)<\/loc>\n[\s\S]*?  <\/url>\n/g, (block, loc) => {
    const m = loc.match(/\/vendors\/([a-z0-9-]+)$/);
    return m && merged.has(m[1]) && loc.startsWith(BASE) ? "" : block;
  });
}

const files = [["vercel.json", vercelJson], ["public/sitemap.xml", sitemapXml]];
let stale = false;
for (const [f, fn] of files) {
  const now = readFileSync(f, "utf8"), want = fn(now);
  if (now !== want) { stale = true; if (!check) writeFileSync(f, want); }
}
if (check && stale) { console.error("vendor-families: vercel.json or sitemap.xml out of step; run node scripts/vendor-families.mjs"); process.exit(1); }
if (!check) console.log(`vendor-families: ${Object.keys(VENDOR_FAMILIES).length} families, ${redirects().length} redirect rules`);
