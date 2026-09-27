/* home.test.mjs
 *
 * Redesign Phase 5, the homepage (Homepage.jsx, data in src/lib/home.js). Every count is the registry's, every route
 * step is a live page and every tool step is the journey graph's own name and link, every industry figure is the
 * claims registry's published value with its source (or none), the stack reads Platform Decision's published layer
 * map, "What changed" is the changelog's newest, no route promises a time we have not measured or a profile feature
 * that does not exist yet, and the events carry only taxonomy 1.1 values. The page renders on the server with one h1.
 *
 * Run from repo root: node home.test.mjs
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const H = await import("./src/lib/home.js");
const SEO = await import("./src/lib/seo.js");
const RS = await import("./src/lib/researchStatus.js");
const MV = await import("./src/lib/methodVersions.js");
const J = await import("./src/lib/journey.js");
const C = await import("./src/lib/claims.js");
const V = await import("./src/lib/verticals.js");
const CL = await import("./src/lib/changelog.js");
const PD = await import("./src/lib/rubrics/platformDecision.js");
const TR = await import("./src/lib/track.js");

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail ? "(" + detail + ")" : ""); } };
const section = (t) => console.log("\n" + t);

const APP = readFileSync("./App.jsx", "utf8");
const routes = [...APP.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]);
const live = (href) => routes.some((rt) => rt === href || (rt.includes(":") && new RegExp("^" + rt.replace(/:[a-zA-Z]+/g, "[^/]+") + "$").test(href)));
const SRC = readFileSync("./Homepage.jsx", "utf8"), DATA = readFileSync("./src/lib/home.js", "utf8");
const allRoutes = H.DOORS.flatMap((d) => (d.routes || []).map((r) => ({ door: d, r })));

section("1. Counts come from their registries");
{
  const d = Object.fromEntries(H.DOORS.map((x) => [x.pillar, x]));
  ok("diagnostics: tools and published methods", d.diagnostics.meta === `${SEO.TOOL_COUNT} tools. ${Object.keys(MV.METHOD_VERSIONS).length} published methods.`, d.diagnostics.meta);
  ok("vendors: profiles and CCaaS researched in full", d.vendors.meta === `${SEO.VENDOR_PROFILE_COUNT} profiles. ${RS.CCAAS_COMPLETE_COUNT} CCaaS researched in full.`, d.vendors.meta);
  ok("industries: industries and segments", d.industries.meta === `${Object.keys(V.VERTICALS).length} industries. ${SEO.SEGMENT_COUNT} segments.` && SEO.SEGMENT_COUNT > 50, d.industries.meta);
  const sitemapSegments = (readFileSync("./public/sitemap.xml", "utf8").match(/\/industries\/[a-z0-9-]+\/[a-z0-9-]+</g) || []).length;
  ok("the segment count equals the segment pages in the sitemap", SEO.SEGMENT_COUNT === sitemapSegments, `${SEO.SEGMENT_COUNT} vs ${sitemapSegments}`);
  ok("the proof tiles state the method and researched counts", H.PROOFS[0].n === String(H.METHOD_COUNT) && H.PROOFS[1].n === String(RS.CCAAS_COMPLETE_COUNT));
  ok("neither file types a count", !/\b\d{2,4}\s+(tools|profiles|methods|industries|segments|vendors)\b/i.test(SRC + DATA));
}

section("2. Doors and routes");
{
  ok("five doors in pillar order", H.DOORS.map((d) => d.pillar).join() === "diagnostics,vendors,industries,research,marketWatch");
  ok("Research and Market Watch are coming, with no routes; the other three have routes", H.DOORS.every((d) => (d.soon ? !d.routes : d.routes && d.routes.length)) && H.DOORS.filter((d) => d.soon).map((d) => d.pillar).join() === "research,marketWatch");
  ok("every door event is a taxonomy pillar", H.DOORS.every((d) => TR.PILLAR_IDS.has(d.event)));
  const bad = [];
  for (const { door, r } of allRoutes) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(r.id) || !("route" in TR.sanitizeProps({ route: r.id }))) bad.push(`${r.id} id`);
    if (!r.steps.length || r.steps.length > 3) bad.push(`${r.id} steps`);
    for (const s of r.steps) {
      if (!live(s.href)) bad.push(`${r.id} dead ${s.href}`);
      if (s.tool && (J.JOURNEY[s.tool].name !== s.name || J.JOURNEY[s.tool].route !== s.href)) bad.push(`${r.id} ${s.tool} name or link differs from the graph`);
    }
    if (!live(r.href)) bad.push(`${r.id} dead start ${r.href}`);
    const toIsTool = Object.prototype.hasOwnProperty.call(J.JOURNEY, r.to);
    if (toIsTool && J.JOURNEY[r.to].route !== r.href) bad.push(`${r.id} start is not ${r.to}`);
    if (!toIsTool && !TR.PAGE_TYPES.has(r.to)) bad.push(`${r.id} to ${r.to}`);
    if (!toIsTool && TR.pageType(r.href) !== r.to) bad.push(`${r.id} to ${r.to} is not the start page's type`);
    if (door.pillar === "diagnostics" && (!r.steps[0].tool || r.cta !== `Start with ${r.steps[0].name}`)) bad.push(`${r.id} diagnostic start`);
  }
  ok(`every route: slug id, one to three live steps, tool steps named and linked by the journey graph, a live start whose \`to\` is its tool or page type (${allRoutes.length} routes) [${bad.slice(0, 4).join("; ")}]`, bad.length === 0);
  ok("route ids are unique within a door", H.DOORS.every((d) => !d.routes || new Set(d.routes.map((r) => r.id)).size === d.routes.length));
  ok("a route lights one layer only when it is about one layer, and names a real layer", allRoutes.every(({ r }) => r.layer === null || /^l[1-7]$/.test(r.layer)) && allRoutes.filter(({ r }) => r.layer).map(({ r }) => `${r.id}:${r.layer}`).join() === "ai-proposal:l4,staffing:l6");
  ok("the diagnostics routes are the six approved", H.DOORS[0].routes.map((r) => r.id).join() === "cost,ai-proposal,renewal,staffing,readiness,rfp");
  ok("the vendor routes are the three approved", H.DOORS[1].routes.map((r) => r.id).join() === "category,vendor,starting-list");
}

section("3. Nothing promised that is not measured or not built");
{
  ok("no time estimate anywhere on the homepage (none has been measured)", !/\bminutes?\b|\b\d+\s*mins?\b/i.test(SRC + DATA.replace(/^\s*\/\/.*$/gm, "")));
  const vendorText = JSON.stringify(H.DOORS[1].routes);
  ok("vendor routes promise no findings, break conditions, proof tests or search (they arrive with the researched profiles)", !/finding|break|proof test|\bsearch\b/i.test(vendorText));
  ok("no search box and no contributor invitation (D3 is open)", !/\bsearch\b/i.test(SRC) && !/contribut/i.test(SRC));
  ok("no vendor score, rank or tier language", !/\b(score[ds]?|rank(ed|ing)?|tier)\b/i.test(JSON.stringify(H.DOORS[1]) + JSON.stringify(H.PROOFS)) || /Never ranked/.test(JSON.stringify(H.DOORS[1])));
}

section("4. Industry figures are the claims registry's");
{
  const ind = H.DOORS[2].routes;
  ok("every industry in the registry has a route, in registry order", ind.map((r) => r.label).join() === Object.values(V.VERTICALS).map((v) => v.name).join());
  const bad = [];
  for (const r of ind) {
    const f = r.fact;
    if (f.value) {
      const c = C.CLAIMS[f.claim];
      if (!c || c.kind !== "fact" || c.value !== f.value || c.source.publisher !== f.source || c.source.url !== f.url || !/^https:\/\//.test(f.url)) bad.push(`${r.id} figure`);
    } else if (!f.test || !live(f.test.href)) bad.push(`${r.id} measure-yours link`);
    if (!live(r.href)) bad.push(`${r.id} page`);
  }
  ok(`each figure is a published claim with its source, or none with a way to measure yours [${bad.join("; ")}]`, bad.length === 0);
  ok("industries with no published figure show none (not a number)", ind.filter((r) => !r.fact.value).map((r) => r.id).sort().join() === "education,manufacturing,travel");
}

section("5. The stack reads Platform Decision's layer map");
{
  const bad = [];
  for (const l of PD.PLATFORM_DECISION.layers) {
    const i = H.LAYER_INFO[`l${l.n}`];
    if (!i || i.tool.href !== J.JOURNEY[l.tool].route || i.category.href !== l.category || i.technical !== l.name || !i.what) bad.push(`l${l.n}`);
    if (i && (!live(i.tool.href) || !live(i.category.href))) bad.push(`l${l.n} dead`);
  }
  ok(`every layer's tool, vendor category and technical name are the published model's, and live [${bad.join(", ")}]`, bad.length === 0 && Object.keys(H.LAYER_INFO).length === 7);
}

section("6. What changed");
{
  const newest = [...CL.CHANGELOG].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  ok("the four newest changelog titles, dated", H.CHANGES.map((c) => c.title).join("|") === newest.map((c) => c.title).join("|") && H.CHANGES.every((c) => /^\d{1,2} [A-Z][a-z]+ \d{4}$/.test(c.date)));
}

section("7. The page renders");
{
  const r = await build({ entryPoints: ["./Homepage.jsx"], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic", external: ["react", "react-dom"], logLevel: "silent" });
  const mod = { exports: {} };
  new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
  const html = renderToStaticMarkup(React.createElement(mod.exports.default));
  ok("exactly one h1, the approved line", (html.match(/<h1/g) || []).length === 1 && /<h1[^>]*>Diagnose before you buy\.<\/h1>/.test(html));
  ok("five doors as one radio group, the first chosen", (html.match(/role="radio" aria-checked="(true|false)"/g) || []).length >= 5 && /aria-checked="true"[\s\S]*Diagnostics/.test(html));
  ok("step 2 opens on the first diagnostics route with its start button", html.includes("What are you trying to work out?") && html.includes("Where the cost comes from") && html.includes('href="/tools/cost-per-contact"'));
  ok("the stack and the evidence mark render", /aria-label="The seven layer stack"/.test(html) && /Every number says how sure it is/.test(html));
  ok("the proof tiles and what changed render", H.PROOFS.every((p) => html.includes(p.link)) && H.CHANGES.every((c) => html.includes(c.title.replace(/&/g, "&amp;"))));
  ok("the page adds no header, footer or nav of its own", !/<header|<footer|<nav\b/.test(html));
  ok("no NaN, undefined or Infinity", !/NaN|undefined|Infinity/.test(html));
}

section("8. Events are taxonomy 1.1 only");
{
  const calls = [...SRC.matchAll(/trackHome\.(\w+)\(/g)].map((m) => m[1]);
  ok("the page uses the four homepage helpers and no raw track call", ["door", "route", "start", "layer"].every((k) => calls.includes(k)) && !/\btrack\(/.test(SRC));
  ok("layer_select names its surface", /trackHome\.layer\(id, "home"\)/.test(SRC));
  ok("route_start sends the route's `to`", /trackHome\.start\(door\.event, route\.id, route\.to\)/.test(SRC));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
