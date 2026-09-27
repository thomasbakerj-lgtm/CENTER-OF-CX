/* shell.test.mjs
 *
 * Redesign Phase 4, the site shell (src/lib/Shell.jsx). One header and one footer for every
 * page, rendered once by App around every route. Checks the five pillars and their links,
 * the soon labels, the active mark, the phone menu, the breadcrumb row, every footer link
 * against a live route, and that no page draws its own navigation or footer any more.
 * prerender.test.mjs checks every sitemap page carries the shell exactly once.
 *
 * Run from repo root: node shell.test.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const T = await import("./src/lib/tokens.js");

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail ? "(" + detail + ")" : ""); } };
const section = (t) => console.log("\n" + t);

const r = await build({ entryPoints: ["./src/lib/Shell.jsx"], bundle: true, write: false, format: "cjs", platform: "node",
  jsx: "automatic", external: ["react", "react-dom"], logLevel: "silent" });
const mod = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
const S = mod.exports;
const h = (C, p) => renderToStaticMarkup(React.createElement(C, p));
const APP = readFileSync("./App.jsx", "utf8");
const routes = [...APP.matchAll(/<Route path="([^"]+)"/g)].map((m) => m[1]);
const live = (href) => routes.some((rt) => rt === href || (rt.includes(":") && new RegExp("^" + rt.replace(/:[a-z]+/gi, "[^/]+") + "$").test(href)));

section("1. The header");
{
  const hd = h(S.SiteHeader, {});
  ok("one header with one primary navigation", (hd.match(/<header/g) || []).length === 1 && (hd.match(/aria-label="Primary"/g) || []).length === 1);
  ok("five pillars in order", S.NAV.map((n) => n.name).join() === "Diagnostics,Vendor Intelligence,Industry Insights,Research,Market Watch");
  ok("every pillar with a page links to a live route", S.NAV.filter((n) => n.href).every((n) => live(n.href)), S.NAV.filter((n) => n.href && !live(n.href)).map((n) => n.href).join());
  ok("Market Watch has no page yet, so it is a label and not a link", !S.NAV.find((n) => n.id === "marketWatch").href && !/<a [^>]*>Market Watch/.test(hd));
  ok("Research and Market Watch are marked soon, nothing else", (hd.match(/>SOON</g) || []).length === 2 && S.NAV.filter((n) => n.soon).map((n) => n.id).join() === "research,marketWatch");
  ok("the header adds no h1", !/<h1/.test(hd));
  ok("the logo links home", /<a href="\/"[^>]*>.*The Center of CX/.test(hd));
  ok("the phone menu button is named and says whether it is open", /aria-expanded="false" aria-controls="cx-menu" aria-label="Open menu"/.test(hd));
  for (const n of S.NAV.filter((x) => x.href)) {
    const a = h(S.SiteHeader, { active: n.id });
    ok(`${n.id}: marked as the current page and ticked in its pillar colour`, (a.match(/aria-current="page"/g) || []).length === 1 && a.includes(`2px solid ${T.PILLARS[n.id].fill}`));
  }
  ok("no active pillar marks nothing current", !/aria-current/.test(h(S.SiteHeader, { active: null })));
  ok("fixed places it over the page; the default sticks in the flow", /position:fixed/.test(h(S.SiteHeader, { fixed: true })) && /position:sticky/.test(hd));
  ok("the header text reads on ink", T.contrast(T.HOUSE.body, T.HOUSE.ink) >= 4.5 && T.contrast(T.HOUSE.muted, T.HOUSE.ink) >= 4.5);
}

section("2. The pillar a path belongs to");
{
  const cases = { "/tools/cost-per-contact": "diagnostics", "/methodology/tco-calculator": "diagnostics", "/how-to-choose": "diagnostics", "/changelog": "diagnostics",
    "/vendors": "vendors", "/vendors/ccaas": "vendors", "/vendors/genesys": "vendors", "/industries": "industries", "/industries/healthcare/payer": "industries",
    "/research": "research", "/research/ccaas-migration-costs": "research", "/": null, "/about": null, "/vendorsx": null, "/tools": null };
  for (const [p, want] of Object.entries(cases)) ok(`${p} is ${want}`, S.pillarFor(p) === want, String(S.pillarFor(p)));
  // The header sits over the pages that were built to clear a fixed bar, and in the flow
  // everywhere else (a sub-vertical page, a floor tool and a method page carry no clearance).
  const fixedCases = { "/": false, "/vendors": true, "/vendors/ccaas": true, "/vendors/five9": true, "/vendors/ccaas/healthcare": true,
    "/industries": true, "/industries/healthcare": true, "/industries/healthcare/payer": false, "/research/ccaas-migration-costs": true,
    "/tools/tco-calculator": true, "/tools/cost-per-contact": false, "/methodology/staffing": false, "/changelog": false };
  for (const [p, want] of Object.entries(fixedCases)) ok(`${p} header ${want ? "over the page" : "in the flow"}`, S.headerFixed(p) === want);
}

section("3. The footer");
{
  const ft = h(S.SiteFooter, {});
  ok("one footer", (ft.match(/<footer/g) || []).length === 1);
  const hrefs = [...ft.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  ok("every footer link is a live route", hrefs.every(live), hrefs.filter((x) => !live(x)).join());
  ok("privacy and terms are linked", hrefs.includes("/privacy") && hrefs.includes("/terms"));
  ok("each column is a named navigation", S.FOOTER.every((c) => ft.includes(`aria-label="${c.head}"`)));
}

section("4. The breadcrumb row");
{
  const c = h(S.Crumbs, { items: [["Industry Insights", "/industries"], ["Healthcare", "/industries/healthcare"], ["Payer"]], action: ["Open the tool", "/tools/cx-maturity"] });
  ok("a named breadcrumb navigation", /<nav aria-label="Breadcrumb"/.test(c));
  ok("the last item is the current page, not a link", /aria-current="page"[^>]*>Payer</.test(c) && !/href="[^"]*"[^>]*>Payer/.test(c));
  ok("one action at most", (c.match(/Open the tool/g) || []).length === 1);
}

section("5. One shell for the whole site");
{
  ok("App renders the header and the footer once, around every route", (APP.match(/<ShellHeader \/>/g) || []).length === 1 && (APP.match(/<SiteFooter \/>/g) || []).length === 1
    && APP.indexOf("<ShellHeader />") < APP.indexOf("<Routes>") && APP.indexOf("<SiteFooter />") > APP.indexOf("</Routes>"));
  const files = readdirSync(".").filter((f) => f.endsWith(".jsx")).map((f) => "./" + f).concat(readdirSync("./src/lib").filter((f) => f.endsWith(".jsx") && f !== "Shell.jsx").map((f) => "./src/lib/" + f));
  const own = files.filter((f) => /<nav\b(?![^>]*aria-label="Breadcrumb")|<footer\b/.test(readFileSync(f, "utf8")));
  ok("no page draws its own navigation bar or footer (a breadcrumb trail is allowed)", own.length === 0, own.join(" "));
  const toolNav = files.filter((f) => /\bToolNav\b/.test(readFileSync(f, "utf8")));
  ok("the retired ToolNav is gone", toolNav.length === 0, toolNav.join(" "));
  const src = readFileSync("./src/lib/Shell.jsx", "utf8").split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");
  ok("the shell carries no colour literal", !/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(src));
  // A grid column minimum wider than a phone's content box (390 less two 28px gutters) scrolls
  // the page sideways; /about did until Phase 4. Wrap it in min(..., 100%).
  const wide = files.filter((f) => /minmax\((3[3-9]\d|[4-9]\d\d)px/.test(readFileSync(f, "utf8")));
  ok("no grid column minimum is wider than a phone", wide.length === 0, wide.join(" "));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
