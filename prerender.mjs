// prerender.mjs
// Runs after `vite build`. Reads dist/index.html, and for every URL in
// public/sitemap.xml writes dist/<path>/index.html with the correct
// title, description, canonical, Open Graph, and Twitter tags injected.
//
// Body content is still client-rendered. This fixes the head only, which is
// what crawlers and social scrapers read without executing JavaScript.
//
// Fails the build loudly rather than shipping wrong canonicals silently.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BASE, resolveSeo } from "./src/lib/seo.js";

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, "dist");
const SHELL = join(DIST, "index.html");
const SITEMAP = join(ROOT, "public", "sitemap.xml");

const START = "<!-- SEO_START -->";
const END = "<!-- SEO_END -->";

function fail(msg) {
  console.error(`\nprerender: ${msg}\n`);
  process.exit(1);
}

if (!existsSync(SHELL)) fail("dist/index.html not found. Did vite build run?");
if (!existsSync(SITEMAP)) fail("public/sitemap.xml not found.");

const shell = readFileSync(SHELL, "utf8");
const startIdx = shell.indexOf(START);
const endIdx = shell.indexOf(END);

if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
  fail(`markers ${START} / ${END} missing from index.html. Nothing was injected.`);
}

const head = shell.slice(0, startIdx);
const tail = shell.slice(endIdx + END.length);

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function buildHead(seo) {
  const url = seo.path === "/" ? `${BASE}/` : `${BASE}${seo.path}`;
  const t = esc(seo.title);
  const d = esc(seo.desc);
  return [
    START,
    `    <title>${t}</title>`,
    `    <meta name="description" content="${d}" />`,
    `    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />`,
    `    <link rel="canonical" href="${url}" />`,
    `    <meta property="og:type" content="${seo.path === "/" ? "website" : "article"}" />`,
    `    <meta property="og:site_name" content="The Center of CX" />`,
    `    <meta property="og:locale" content="en_US" />`,
    `    <meta property="og:title" content="${t}" />`,
    `    <meta property="og:description" content="${d}" />`,
    `    <meta property="og:url" content="${url}" />`,
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    <meta name="twitter:site" content="@centerofcx" />`,
    `    <meta name="twitter:title" content="${t}" />`,
    `    <meta name="twitter:description" content="${d}" />`,
    `    ${END}`,
  ].join("\n");
}

const xml = readFileSync(SITEMAP, "utf8");
const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);

if (locs.length === 0) fail("no <loc> entries parsed from sitemap.xml.");

const seen = new Set();
let written = 0;
let fallbackCount = 0;
const fallbacks = [];

for (const loc of locs) {
  if (!loc.startsWith(BASE)) {
    fail(`sitemap URL does not start with ${BASE}: ${loc}`);
  }
  let path = loc.slice(BASE.length) || "/";
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  if (seen.has(path)) continue;
  seen.add(path);

  const seo = resolveSeo(path);

  // Track routes that fell all the way through to the generic default.
  if (
    path !== "/" &&
    seo.title === "The Center of CX | Independent CX Technology Intelligence"
  ) {
    fallbackCount++;
    if (fallbacks.length < 20) fallbacks.push(path);
  }

  const html = head + buildHead(seo) + tail;
  const outDir = path === "/" ? DIST : join(DIST, path);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "index.html"), html, "utf8");
  written++;
}

console.log(`prerender: wrote ${written} route files from ${locs.length} sitemap URLs.`);
if (fallbackCount > 0) {
  console.warn(
    `prerender: ${fallbackCount} route(s) used the generic default title. Sample: ${fallbacks.join(", ")}`
  );
}
