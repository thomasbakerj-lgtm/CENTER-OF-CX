/* prerender.test.mjs
 *
 * Gate for the full-page prerender (P1 task 3). The build writes each sitemap page's body into its HTML, so crawlers,
 * answer engines and link previews read the page without running JavaScript, and the browser hydrates it.
 *   1. The helpers fire: style text decodes, a self-closing style block is refused, nested links are counted.
 *   2. Every sitemap URL server-renders with an h1, its main text, no inline script (the CSP allows none) and no link
 *      inside a link (the browser would split it and hydration would fail).
 *   Structured data by page type (P1 task 4): tools WebApplication, method pages TechArticle, industry pages Article
 *   citing every published source the page renders, the homepage Organization and WebSite, no FAQ markup.
 *   3. The wiring: the build runs the server build and the prerender; the empty shell is kept as spa.html and every
 *      path outside the sitemap is rewritten to it; the client hydrates only a stateless page.
 * The server bundle is built here into a temporary folder, since the suite runs before `npm run build`.
 */
import { readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "vite";
import { rawStyles, nestedLinks, visibleText } from "./src/lib/prerenderHtml.js";
import { resolveSeo, structuredData } from "./src/lib/seo.js";
import { CLAIMS } from "./src/lib/claims.js";

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail); } };

console.log("\n1. Each helper fires on a planted sample");
ok("style entities decode to the raw CSS", rawStyles("<style>a{font:&#x27;X&#x27;}b{c:url(&quot;d?e=1&amp;f=2&quot;)}</style>") === "<style>a{font:'X'}b{c:url(\"d?e=1&f=2\")}</style>");
let refused = false; try { rawStyles("<style>&lt;/style&gt;<script>x</script></style>"); } catch { refused = true; }
ok("a style block that would close itself is refused", refused);
ok("a link inside a link is counted", nestedLinks('<a href="/x"><p>t <sup><a href="/y">s</a></sup></p></a>') === 1);
ok("sibling links are not nested", nestedLinks('<a href="/x">a</a><a href="/y">b</a><abbr>c</abbr>') === 0);
ok("visible text drops style and tags", visibleText("<style>p{x:1}</style><h1>Hi&amp;</h1><p>there</p>") === "Hi there");

console.log("\n2. Every sitemap URL server-renders its body");
/* Inside the repository so the bundle resolves react from node_modules; git-ignored and removed after. */
const out = join(process.cwd(), ".prerender-test-ssr");
rmSync(out, { recursive: true, force: true });
try {
  await build({ logLevel: "silent", build: { ssr: "entry-server.jsx", outDir: out, copyPublicDir: false } });
  const { render, citationsOf } = await import(pathToFileURL(join(out, "entry-server.js")).href);
  const paths = [...readFileSync("public/sitemap.xml", "utf8").matchAll(/<loc>\s*https?:\/\/[^/<]+([^<\s]*)\s*<\/loc>/g)].map((m) => m[1] || "/");
  ok("sitemap parsed", paths.length > 400, String(paths.length));
  const bad = { render: [], h1: [], text: [], script: [], nested: [], style: [] };
  const ld = { app: [], tech: [], article: [], cite: [], faq: [], headline: [], home: [], main: [] };
  let articles = 0, cited = 0;
  for (const p of paths) {
    let html;
    let claims;
    try { ({ html, claims } = await render(p)); } catch (e) { bad.render.push(`${p} (${e.message.slice(0, 60)})`); continue; }
    /* Structured data by page type, as the prerender writes it (P1 task 4). */
    const seo = resolveSeo(p);
    const extra = citationsOf(claims);
    const graphs = JSON.parse(JSON.stringify(structuredData(seo.path, seo, extra)));
    const of = (t) => graphs.filter((g) => g["@type"] === t);
    if (graphs.some((g) => g["@type"] === "FAQPage")) ld.faq.push(p);
    if (graphs.some((g) => (g.headline || "").length > 110)) ld.headline.push(p);
    if (p.startsWith("/tools/")) { const g = of("WebApplication")[0]; if (!g || !g.name || !g.description || !/^https:\/\//.test(g.url) || !g.applicationCategory || !g.offers || g.offers.price !== "0") ld.app.push(p); }
    if (p.startsWith("/methodology/")) { const g = of("TechArticle")[0]; if (!g || !g.headline || !g.author || !g.publisher || !/^\d{4}-\d{2}-\d{2}$/.test(g.datePublished || "") || !/^https:\/\//.test(g.url)) ld.tech.push(p); }
    if (p.startsWith("/industries/")) {
      articles++;
      const g = of("Article")[0];
      const factUrls = new Set(claims.map((id) => CLAIMS[id]).filter((c) => c && c.kind === "fact").map((c) => c.source.url));
      if (!g || !g.headline || !g.author || !g.publisher || !/^https:\/\//.test(g.url)) ld.article.push(p);
      else if ((g.citation || []).length !== factUrls.size || (g.citation || []).some((c) => !/^https:\/\//.test(c.url) || !c.name || !c.publisher?.name) || (factUrls.size && !/^\d{4}-\d{2}-\d{2}$/.test(g.dateModified || ""))) ld.cite.push(`${p} (${(g.citation || []).length} of ${factUrls.size})`);
      if (factUrls.size) cited++;
      if (/^\/industries\/[a-z-]+$/.test(p) && !(g && (g.citation || []).length)) ld.main.push(p);
    }
    if (p === "/" && !(of("Organization").length && of("WebSite").length)) ld.home.push(p);
    const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1];
    if (!h1 || visibleText(h1).length < 3) bad.h1.push(p);
    if (visibleText(html).length < 250) bad.text.push(p);
    if (/<script/i.test(html)) bad.script.push(p);
    if (nestedLinks(html) > 0) bad.nested.push(p);
    try { rawStyles(html); } catch { bad.style.push(p); }
  }
  ok(`all ${paths.length} URLs render`, bad.render.length === 0, bad.render.slice(0, 3).join(" | "));
  ok("every page carries a non-empty h1", bad.h1.length === 0, bad.h1.slice(0, 5).join(" "));
  ok("every page carries its main text (250+ visible characters; the shortest are assessment intro screens)", bad.text.length === 0, bad.text.slice(0, 5).join(" "));
  ok("no page renders an inline script", bad.script.length === 0, bad.script.slice(0, 5).join(" "));
  ok("no page renders a link inside a link", bad.nested.length === 0, bad.nested.slice(0, 5).join(" "));
  ok("every style block decodes safely", bad.style.length === 0, bad.style.slice(0, 5).join(" "));
  ok("every tool page is a WebApplication with name, description, category and a zero price", ld.app.length === 0, ld.app.slice(0, 5).join(" "));
  ok("every method page is a TechArticle with author, publisher and its version date", ld.tech.length === 0, ld.tech.slice(0, 5).join(" "));
  ok("every industry page is an Article with author and publisher", ld.article.length === 0, ld.article.slice(0, 5).join(" "));
  ok("every industry Article cites each published source its page renders, over https, dated", ld.cite.length === 0, ld.cite.slice(0, 5).join(" "));
  ok("all 71 industry pages are Articles; each of the 10 main pages cites its sources", articles === 71 && ld.main.length === 0, `${articles} articles, ${cited} with citations; none on ${ld.main.join(" ")}`);
  ok("the homepage carries Organization and WebSite", ld.home.length === 0);
  ok("no page carries FAQ markup (no page shows a question list)", ld.faq.length === 0, ld.faq.slice(0, 5).join(" "));
  ok("every headline is 110 characters or fewer", ld.headline.length === 0, ld.headline.slice(0, 5).join(" "));
  const tool = (await render("/tools/staffing-calculator")).html;
  ok("a tool page carries its form, not a loading screen", /<input|<select/.test(tool) && !/Loading/i.test(visibleText(tool).slice(0, 200)));
} finally {
  rmSync(out, { recursive: true, force: true });
}

console.log("\n3. Wiring");
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
ok("build runs the client build, the server build, then the prerender", /vite build && vite build --ssr entry-server\.jsx --outDir dist-ssr && node prerender\.mjs/.test(pkg.scripts.build), pkg.scripts.build);
const pre = readFileSync("prerender.mjs", "utf8");
ok("prerender keeps the empty shell as spa.html", /join\(DIST, "spa\.html"\)/.test(pre) && /writeFileSync\(SHELL,/.test(pre));
ok("prerender refuses a page with no h1 or a nested link", /has no h1/.test(pre) && /nestedLinks\(body\) > 0/.test(pre));
const vercel = JSON.parse(readFileSync("vercel.json", "utf8"));
ok("paths outside the sitemap are rewritten to the empty shell", vercel.rewrites.length === 1 && vercel.rewrites[0].destination === "/spa.html");
const main = readFileSync("main.jsx", "utf8");
ok("the client hydrates a prerendered page", /hydrateRoot\(root, app\)/.test(main) && /root\.hasChildNodes\(\)/.test(main));
ok("a tool page with a query string or session state renders fresh", /startsWith\('\/tools\/'\)/.test(main) && /window\.location\.search/.test(main) && /coc:toolData/.test(main) && /coc:contact/.test(main));
ok("the state keys match the rail and the review form", /const KEY = "coc:toolData"/.test(readFileSync("src/lib/toolData.js", "utf8")) && /CONTACT_KEY = "coc:contact"/.test(readFileSync("ReportActions.jsx", "utf8")));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
