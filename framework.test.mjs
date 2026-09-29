/* framework.test.mjs
 *
 * The 7-Layer CX Orchestration Framework download (src/lib/frameworkGuide.js, src/lib/frameworkHtml.js,
 * scripts/framework-pdf.mjs). The April edition's download returned "not found" after the reader gave an email (the file
 * was committed as "... (1).pdf"), and the document carried unsourced figures, retired wording, an out of date EU AI Act
 * date and links to retired tools (TB, 29 Sep 2026: rebuild it). This file holds:
 *   1. Every gated download's file exists in public/ (no email is ever collected for a file that is not there).
 *   2. The committed PDF was printed from the current content (page hash and file hash equal the manifest).
 *   3. The content keeps the house rules: no dash, no retired or superlative wording, no "X, not Y", no forecast, and no
 *      figure outside a published comparison (layer numbers, the rating scale and the regulation number aside).
 *   4. Seven layers, once each, named as the site names them; every figure group exists; every link is a live page.
 *
 * Run from repo root: node framework.test.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";

const G = await import("./src/lib/frameworkGuide.js");
const { buildFrameworkHtml, frameworkLinks } = await import("./src/lib/frameworkHtml.js");
const { LAYERS } = await import("./src/lib/tokens.js");
const { GROUPS } = await import("./src/lib/comparisons.js");
const manifest = JSON.parse(readFileSync("./src/data/frameworkGuide.manifest.json", "utf8"));

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail ? "(" + detail + ")" : ""); } };
const section = (t) => console.log("\n" + t);
const sha = (b) => createHash("sha256").update(b).digest("hex");

section("1. Every gated download exists");
{
  const src = readFileSync("./GatedReport.jsx", "utf8");
  const pdfs = [...src.matchAll(/pdf: "(\/[^"]+\.pdf)"/g)].map((m) => m[1]);
  ok("the download page lists its files", pdfs.length >= 3, String(pdfs.length));
  for (const p of pdfs) ok(`${p} is in public/ and is a PDF`, existsSync("./public" + p) && readFileSync("./public" + p).subarray(0, 5).toString() === "%PDF-");
  ok("the framework page points at the guide's file", pdfs.includes(G.GUIDE.file));
  ok("the broken April file name is gone", !existsSync("./public/CX-Orchestration-Framework-2026 (1).pdf"));
  ok("the page no longer promises a 12 month outlook or maturity bands", !/12-month outlook|next 12 months|maturity scoring|Foundation to Leading/.test(src));
}

section("2. The PDF was printed from the current content");
{
  const html = buildFrameworkHtml();
  ok("page hash equals the manifest (reprint with scripts/framework-pdf.mjs after a content change)", sha(html) === manifest.htmlSha256);
  const pdf = readFileSync("./public" + G.GUIDE.file);
  ok("file hash and size equal the manifest", sha(pdf) === manifest.pdfSha256 && pdf.length === manifest.bytes);
  ok("the manifest names the edition and date", manifest.edition === G.GUIDE.edition && manifest.updated === G.GUIDE.updated);
  ok("the page is pure: two builds are identical", buildFrameworkHtml() === html);
}

section("3. House rules on the content");
{
  const L = G.LAYER_GUIDE;
  const prose = [G.GUIDE.subtitle, ...G.INTRO, ...L.flatMap((l) => [l.what, l.owners, ...l.questions, l.check, l.breaks]),
    ...G.DEPENDENCIES.flatMap(([, a, b]) => [a, b]), ...G.CHECKLIST.map(([, s]) => s), G.ABOUT.is, G.ABOUT.isnt, G.ABOUT.figures];
  const all = prose.join(" ");
  ok("no dash", !/[\u2013\u2014]/.test(all + G.ABOUT.changes.join(" ")));
  ok("no retired or superlative wording", !/industry[- ]leading|best[- ]in[- ]class|world[- ]class|seamless|competitive advantage|table stakes|cutting[- ]edge|game[- ]chang/i.test(all), (all.match(/industry[- ]leading|seamless|competitive advantage|table stakes/i) || [""])[0]);
  ok("no forecast", !/\bwill (become|replace|overtake|emerge)|\bby 20\d\d\b|within \d+ months/i.test(all));
  ok("no 'X, not Y' cadence", !/, not (a |an |the )?\w/.test(all));
  const figures = all.replace(/\(EU\) 2026\/1744/g, "").replace(/Layers? \d(, \d)*( and \d)?/g, "").match(/\d/g);
  ok("no bare figure in the prose (figures come only from published comparisons)", !figures, all.match(/[^.]*\d[^.]*\./) ? all.match(/[^.]*\d[^.]*\./)[0] : "");
  ok("the rating scale has five points and the rule is an action at 2 or below", G.SCALE.length === 5 && /rate 2 or below is an action/.test(buildFrameworkHtml()));
  ok("no total or band in the checklist", !/Total score|maturity level|Foundation|Developing|Optimized|Industry-Leading/.test(buildFrameworkHtml().split("Readiness checklist")[1].split("Section 5")[0]));
  ok("the EU AI Act note names the amending regulation and no date of its own", /Regulation \(EU\) 2026\/1744/.test(all) && !/August 2026/.test(all));
}

section("4. Layers, figures and links");
{
  const ns = G.LAYER_GUIDE.map((l) => l.n).join();
  ok("seven layers, bottom to top, once each", ns === "1,2,3,4,5,6,7");
  const html = buildFrameworkHtml();
  for (const l of LAYERS) ok(`layer ${l.n} named as the site names it (${l.name}, ${l.technical})`, html.includes(`>${l.name}<`) && html.includes(l.technical.replace(/\+/g, "+")));
  for (const l of G.LAYER_GUIDE) {
    ok(`layer ${l.n}: three questions, a check, a failure and a tool`, l.questions.length === 3 && l.check && l.breaks && l.tools.length >= 1);
    for (const g of l.figures || []) ok(`layer ${l.n}: figure group ${g} exists`, !!GROUPS[g]);
  }
  ok("every figure shown carries its source link", G.LAYER_GUIDE.flatMap(G.layerFigures).every((g) => g.rows.every((r) => /^https:\/\//.test(r.source.url))));
  const sitemap = readFileSync("./public/sitemap.xml", "utf8");
  const links = frameworkLinks();
  ok("the guide links the site", links.length >= 15, String(links.length));
  for (const p of new Set(links)) ok(`${p} is a live page`, sitemap.includes(`contactcentercx.com${p}</loc>`));
  ok("no link to a retired tool", !links.some((p) => /integration-planner|agent-experience|service-design|experience-scorecard|calibration-drift/.test(p)));
  ok("each checklist statement belongs to a layer, two per layer", [1, 2, 3, 4, 5, 6, 7].every((n) => G.CHECKLIST.filter(([m]) => m === n).length === 2));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
