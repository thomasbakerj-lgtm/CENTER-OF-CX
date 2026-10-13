// reference.test.mjs
//
// The reference library (TB, 13 Oct 2026, open item 2): /reference, a page per metric, the glossary and the Erlang C
// explainer (src/lib/reference.js, Reference.jsx). Proves every formula is read from a published method, every figure
// comes from the sourced comparison groups, every link is live, the Erlang C table equals the shipped engine and the
// published fixtures, the wiring (routes, metadata, sitemap, footer, llms.txt, structured data), and house rules.
//
// Run: node reference.test.mjs

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const R = await import("./src/lib/reference.js");
const { RUBRICS } = await import("./src/lib/rubrics/index.js");
const { GROUPS } = await import("./src/lib/comparisons.js");
const { SEO_MAP, resolveSeo, structuredData } = await import("./src/lib/seo.js");
const { CATEGORIES } = await import("./src/lib/verticals.js");
const { FIXTURES } = await import("./src/lib/fixtures.js");
const { erlangC, requiredOnQueue } = await import("./src/lib/adherence.js");

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail === undefined ? "" : JSON.stringify(detail).slice(0, 300)); } };
const section = (s) => console.log(`\n${s}`);
const DASH = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");
const sitemap = readFileSync("./public/sitemap.xml", "utf8");
const live = (p) => !!SEO_MAP[p] || Object.values(CATEGORIES).some((c) => c.page === p) || sitemap.includes(`com${p}</loc>`);

section("1. Content");
const ids = R.METRICS.map((m) => m.id);
ok(`${ids.length} metrics, ids unique`, ids.length >= 12 && new Set(ids).size === ids.length);
for (const m of R.METRICS) {
  ok(`${m.id}: every formula is a published method's formula`, m.formulas.length > 0 && m.formulas.every(([mid, name]) => (RUBRICS[mid]?.formulas || []).some((f) => f.name === name)), m.formulas);
  ok(`${m.id}: comparison groups exist`, m.groups.every((g) => GROUPS[g]));
  ok(`${m.id}: tools live`, m.tools.length > 0 && m.tools.every((t) => !!SEO_MAP[`/tools/${t}`]), m.tools);
  ok(`${m.id}: related ids resolve`, m.related.every((r) => r === "erlang-c" || ids.includes(r)));
  ok(`${m.id}: definition, why and cautions present`, m.what && m.why && m.careful.length >= 2);
}
const text = JSON.stringify([R.METRICS.map(({ what, why, careful, name, also }) => [what, why, careful, name, also]), R.ERLANG, R.GLOSSARY]);
ok("no figure typed in the definitions (every published figure comes from the comparison groups)", !/\d+(\.\d+)?%|\$\d/.test(JSON.stringify(R.METRICS.map(({ what, why, careful }) => [what, why, careful]))));
ok("no dash", !DASH.test(text));
ok('no "X, not Y" cadence', !/, not (a |an |the )?[a-zA-Z]+/.test(text));
ok("no retired sales words", !/best-in-class|industry-leading|world-class|seamless/i.test(text));
ok("Erlang C formulas published", R.ERLANG.formulas.every(([mid, name]) => (RUBRICS[mid]?.formulas || []).some((f) => f.name === name)));
ok("Erlang C fixtures exist", R.ERLANG.fixtures.every((id) => FIXTURES.some((f) => f.id === id)));
const terms = R.GLOSSARY.map((g) => g.term);
ok(`${terms.length} glossary terms, unique`, terms.length >= 30 && new Set(terms).size === terms.length);
ok("every glossary term has a definition or a page", R.GLOSSARY.every((g) => g.def || g.grade || g.link));
ok("every glossary link and category live", R.GLOSSARY.every((g) => (!g.link || live(g.link)) && (!g.category || CATEGORIES[g.category])), R.GLOSSARY.filter((g) => g.link && !live(g.link)).map((g) => g.link));
ok("every metric is in the glossary", R.METRICS.every((m) => R.GLOSSARY.some((g) => g.link === `/reference/${m.id}`)));

section("2. Pages render");
const r = await build({ entryPoints: ["./Reference.jsx"], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic",
  external: ["react", "react-dom", "react-router-dom"], loader: { ".js": "jsx" }, logLevel: "silent" });
const mod = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, createRequire(import.meta.url));
const P = mod.exports;
const page = (id) => renderToStaticMarkup(React.createElement(P.ReferencePage, { id }));
const all = ["", "glossary", "erlang-c", ...ids];
for (const id of all) {
  const h = page(id || undefined);
  ok(`/reference${id ? "/" + id : ""}: one h1, no NaN or undefined`, (h.match(/<h1/g) || []).length === 1 && !/NaN|undefined|Infinity/.test(h.replace(/"[^"]*"/g, "")));
  const hrefs = [...h.matchAll(/href="([^"#]+)"/g)].map((m) => m[1]).filter((x) => x.startsWith("/"));
  ok(`/reference${id ? "/" + id : ""}: every internal link live`, hrefs.every((x) => x === "/" || live(x)), hrefs.filter((x) => x !== "/" && !live(x)));
}
for (const m of R.METRICS) {
  const h = page(m.id);
  for (const [mid, name] of m.formulas) {
    const f = RUBRICS[mid].formulas.find((x) => x.name === name);
    ok(`${m.id}: renders ${name} from ${mid}`, h.includes(f.formula.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")));
  }
  if (m.groups.length) ok(`${m.id}: published figures render with their source`, h.includes("Published figures") && GROUPS[m.groups[0]]().rows.every((row) => h.includes(row.value.replace(/&/g, "&amp;"))));
}
ok("an unknown id says so", page("nope").includes("No reference page here"));

section("3. Erlang C table equals the engine and the published table");
const rows = P.erlangRows(R.ERLANG.case);
ok("waits equal the engine", rows.every((x) => x.wait === erlangC(x.n, 10)));
const pub = { 11: "0.6821", 12: "0.4494", 13: "0.2853", 14: "0.1741" };
ok("waits match the published 10 Erlang table", Object.entries(pub).every(([n, v]) => rows.find((x) => x.n === +n).wait.toFixed(4) === v));
ok("14 agents is the first count meeting 80% in 20 s, as published", requiredOnQueue(10, 0.8, 20, 180) === 14 && rows.find((x) => x.n === 14).sl >= 0.8 && rows.find((x) => x.n === 13).sl < 0.8);
ok("the case is 10 Erlangs at 200 calls an hour and 180 seconds", 200 * R.ERLANG.case.aht / 3600 === R.ERLANG.case.load);
const eh = page("erlang-c");
ok("the page prints every row", rows.every((x) => eh.includes(`>${x.wait.toFixed(4)}<`)));

section("4. Wiring");
const app = readFileSync("./App.jsx", "utf8"), shell = readFileSync("./src/lib/Shell.jsx", "utf8"), llms = readFileSync("./src/lib/llmsTxt.js", "utf8");
ok("routes mounted", app.includes('<Route path="/reference" element={<Reference />} />') && app.includes('<Route path="/reference/:id" element={<Reference />} />'));
const refKeys = Object.keys(SEO_MAP).filter((p) => p.startsWith("/reference"));
const want = all.map((id) => "/reference" + (id ? "/" + id : ""));
ok("one metadata entry per page and no other", refKeys.length === want.length && want.every((p) => SEO_MAP[p] && resolveSeo(p).known), refKeys.filter((k) => !want.includes(k)));
ok("every page in the sitemap", want.every((p) => sitemap.includes(`com${p}</loc>`)));
ok("footer links the library", shell.includes('["Metrics reference", "/reference"]'));
ok("llms.txt names it", llms.includes("/reference"));
const sd = (p) => structuredData(p, resolveSeo(p)).map((g) => g["@type"]);
ok("metric pages and Erlang C are Articles, the glossary a DefinedTermSet", sd("/reference/occupancy").includes("Article") && sd("/reference/erlang-c").includes("Article") && sd("/reference/glossary").includes("DefinedTermSet"));
const pageSrc = readFileSync("./Reference.jsx", "utf8");
ok("the page carries no colour literal", !/#[0-9a-fA-F]{3,6}\b|rgba?\(/.test(pageSrc));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
