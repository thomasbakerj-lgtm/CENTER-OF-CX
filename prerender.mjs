// prerender.mjs
// Runs after `vite build`. Reads dist/index.html, and for every URL in
// public/sitemap.xml writes dist/<path>/index.html with the correct
// title, description, canonical, Open Graph, and Twitter tags injected.
//
// It also server-renders each page's body into <div id="root"> through the SSR
// build of entry-server.jsx (dist-ssr), so crawlers, answer engines and link
// previews read the page without executing JavaScript. The client hydrates it.
//
// Fails the build loudly rather than shipping wrong canonicals silently.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { BASE, resolveSeo, structuredData } from "./src/lib/seo.js";
import { pathToFileURL } from "node:url";
import { rawStyles, nestedLinks } from "./src/lib/prerenderHtml.js";

const ROOT = dirname(fileURLToPath(import.meta.url));
const DIST = join(ROOT, "dist");
const INDEX = join(DIST, "index.html");
/* The empty app shell. The homepage's prerender overwrites dist/index.html, so the shell is kept as dist/spa.html and
   vercel.json rewrites every path outside the sitemap to it: such a page renders fresh instead of hydrating against
   the homepage's HTML. Reading from spa.html also makes a second run of this script safe. */
const SHELL = join(DIST, "spa.html");
const SITEMAP = join(ROOT, "public", "sitemap.xml");
const SSR = join(ROOT, "dist-ssr", "entry-server.js");
const ROOT_DIV = '<div id="root"></div>';

const START = "<!-- SEO_START -->";
const END = "<!-- SEO_END -->";

function fail(msg) {
  console.error(`\nprerender: ${msg}\n`);
  process.exit(1);
}

if (!existsSync(SHELL)) {
  if (!existsSync(INDEX)) fail("dist/index.html not found. Did vite build run?");
  writeFileSync(SHELL, readFileSync(INDEX, "utf8"), "utf8");
}
if (!existsSync(SITEMAP)) fail("public/sitemap.xml not found.");

const shell = readFileSync(SHELL, "utf8");
const startIdx = shell.indexOf(START);
const endIdx = shell.indexOf(END);

if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
  fail(`markers ${START} / ${END} missing from index.html. Nothing was injected.`);
}

if (!existsSync(SSR)) fail("dist-ssr/entry-server.js not found. Did the SSR build run?");
if (shell.split(ROOT_DIV).length !== 2) fail(`${ROOT_DIV} must appear exactly once in index.html.`);
const { render } = await import(pathToFileURL(SSR).href);

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
    ...structuredData(seo.path, seo).map(
      (g) => `    <script type="application/ld+json">${JSON.stringify(g).replace(/</g, "\\u003c")}</script>`
    ),
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

  let body;
  try {
    body = await render(path);
  } catch (err) {
    fail(`server render failed for ${path}: ${err && err.message}`);
  }
  if (!/<h1[\s>]/.test(body)) fail(`server render of ${path} has no h1.`);
  try {
    body = rawStyles(body);
  } catch (err) {
    fail(`${path}: ${err.message}`);
  }
  if (nestedLinks(body) > 0) fail(`${path} renders a link inside a link; the browser would split it and hydration would fail.`);
  const html = head + buildHead(seo) + tail.replace(ROOT_DIV, `<div id="root">${body}</div>`);
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
