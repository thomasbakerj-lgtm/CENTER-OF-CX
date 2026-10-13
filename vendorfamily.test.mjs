// vendorfamily.test.mjs
//
// One page per vendor (open item 13, TB 13 Oct 2026): a vendor profiled in several categories has one page, its other
// category profiles as sections, and every merged address redirects to it. Proves the families are one company each,
// the page choice, every merged slug's redirect and sitemap state, no internal link to a merged slug, the sections'
// content and wiring, and that the header moved "Coming soon" to Research's studies card.
//
// Run: node vendorfamily.test.mjs

import { readFileSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { join } from "node:path";
import { build } from "esbuild";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const S = await import("./src/lib/seo.js");
const { CATEGORIES } = await import("./src/lib/verticals.js");

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail === undefined ? "" : JSON.stringify(detail).slice(0, 300)); } };
const section = (s) => console.log(`\n${s}`);
const F = S.VENDOR_FAMILIES;
const merged = Object.values(F).flatMap((m) => m.slice(1));

section("1. Families");
ok(`${Object.keys(F).length} families, ${merged.length} merged slugs`, Object.keys(F).length >= 40 && merged.length >= 90);
const first = (n) => String(n).toLowerCase().replace(/[^a-z0-9 ]/g, " ").trim().split(/\s+/)[0].replace(/(ai|io)$/, "");
for (const [main, members] of Object.entries(F)) {
  const names = members.map(S.vendorDisplayName);
  ok(`${main}: one company (${names.join(", ")})`, new Set(names.map(first)).size === 1, names);
  const cats = members.map((m) => S.vendorCategoryLabel(m));
  const cc = members.find((m) => S.vendorCategoryLabel(m) === CATEGORIES.ccaas.name);
  ok(`${main}: the page is the contact center platform profile when there is one`, !cc || cc === main, cats);
}
ok("every slug is in at most one family", new Set(Object.values(F).flat()).size === Object.values(F).flat().length);
ok("vendorHref sends a merged slug to its section, others to their own page", S.vendorHref("genesys-wem") === "/vendors/genesys#genesys-wem" && S.vendorHref("genesys") === "/vendors/genesys" && S.vendorHref("aisera") === "/vendors/aisera");

section("2. Redirects, sitemap and metadata");
let inSync = true;
try { execFileSync("node", ["scripts/vendor-families.mjs", "--check"], { stdio: "pipe" }); } catch { inSync = false; }
ok("vercel.json and the sitemap are in step with the families", inSync);
const vercel = JSON.parse(readFileSync("./vercel.json", "utf8"));
const rx = vercel.redirects.filter((r) => r.source.startsWith("/vendors/:merged(")).map((r) => ({ re: new RegExp("^/vendors/(" + r.source.slice(17, -1) + ")$"), to: r.destination, permanent: r.permanent }));
ok("every merged slug redirects permanently to its family page, and only those", merged.every((m) => { const hit = rx.filter((r) => r.re.test(`/vendors/${m}`)); return hit.length === 1 && hit[0].to === `/vendors/${S.vendorPage(m)}` && hit[0].permanent; }) && Object.keys(F).every((main) => !rx.some((r) => r.re.test(`/vendors/${main}`))));
const sitemap = readFileSync("./public/sitemap.xml", "utf8");
ok("no merged slug in the sitemap; every family page is", merged.every((m) => !sitemap.includes(`/vendors/${m}</loc>`)) && Object.keys(F).every((m) => sitemap.includes(`/vendors/${m}</loc>`)));
ok("a merged slug is not indexable; its family page is", merged.every((m) => !S.resolveSeo(`/vendors/${m}`).known) && Object.keys(F).every((m) => S.resolveSeo(`/vendors/${m}`).known));
ok("family descriptions fit a search result", Object.keys(F).every((m) => { const d = S.resolveSeo(`/vendors/${m}`).desc; return d.length >= 70 && d.length <= 160; }));
const list = S.structuredData("/vendors/wem-qm", S.resolveSeo("/vendors/wem-qm")).find((g) => g["@type"] === "ItemList");
ok("category ItemLists point merged profiles at their section", list && list.itemListElement.every((i) => !merged.some((m) => i.url.endsWith(`/vendors/${m}`))));

section("3. No internal link to a merged address");
const files = [];
const walk = (d) => { for (const f of readdirSync(d)) { if (["node_modules", "dist", "dist-ssr", ".git"].includes(f)) continue; const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(jsx?)$/.test(f)) files.push(p); } };
walk(".");
const bad = [];
for (const f of files) {
  const t = readFileSync(f, "utf8");
  for (const m of t.matchAll(/["'`]\/vendors\/([a-z0-9-]+)["'`#?]/g)) if (merged.includes(m[1])) bad.push(`${f}: ${m[1]}`);
}
ok("no source file links a merged slug", bad.length === 0, bad.slice(0, 5));
const linkers = ["src/lib/Phase1Directory.jsx", "Vendors.jsx", "VendorMatchEngine.jsx", "VendorProfile.jsx"];
ok("profile link builders go through vendorHref", linkers.every((f) => readFileSync(f, "utf8").includes("vendorHref(") && !/href=\{`\/vendors\/\$\{(v\.slug|s|compSlug)\}`\}/.test(readFileSync(f, "utf8"))));

section("4. The family page");
const r = await build({ entryPoints: ["./src/lib/VendorFamily.jsx"], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic",
  external: ["react", "react-dom", "react-router-dom"], loader: { ".js": "jsx" }, logLevel: "silent" });
const mod = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, createRequire(import.meta.url));
const V = mod.exports;
let all = true, text = true;
for (const [main, members] of Object.entries(F)) {
  const secs = V.familySections(main);
  if (JSON.stringify(secs.map((s) => s.slug)) !== JSON.stringify(members.slice(1))) all = false;
  const html = renderToStaticMarkup(React.createElement(V.default, { slug: main }));
  if (!members.slice(1).every((m) => html.includes(`id="${m}"`) && html.includes(`href="#${m}"`)) || /<h1/.test(html)) all = false;
  if ((html.match(/Request an introduction to/g) || []).length !== members.length - 1) all = false;
  if (/\b(score|scored|tier|rank|ranked|quadrant)\b/i.test(html.replace(/<[^>]+>/g, " ").replace(/Numeric scores, tiers and rankings are withdrawn/g, ""))) text = false;
}
ok("every family page has a section, anchor and introduction for each merged profile, and no h1", all);
ok("no section shows a score, tier, rank or quadrant word of its own", text);
ok("every section carries words from its category profile", Object.keys(F).every((m) => V.familySections(m).every((s) => s.rows.length > 0)), Object.keys(F).flatMap((m) => V.familySections(m).filter((s) => !s.rows.length).map((s) => s.slug)));
const vp = readFileSync("./VendorProfile.jsx", "utf8");
ok("a merged slug navigates to its section; a family page renders its sections", vp.includes("if (isMergedSlug(slug)) return <Navigate to={vendorHref(slug)} replace />;") && vp.includes("<VendorFamily slug={slug} />"));
ok("tokens only", !/#[0-9a-fA-F]{3,6}\b|rgba?\(/.test(readFileSync("./src/lib/VendorFamily.jsx", "utf8")));

section("5. Research nav");
ok("the header marks no pillar soon; Research's studies card says Coming soon", /soon: false \}\)\);/.test(readFileSync("./src/lib/Shell.jsx", "utf8")) && readFileSync("./Research.jsx", "utf8").includes('kicker="Coming soon" title="Studies of our own"'));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
