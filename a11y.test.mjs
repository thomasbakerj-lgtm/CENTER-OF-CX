// a11y.test.mjs
//
// Static accessibility rules (redesign Phase 11, from the axe-core audit of every sitemap page at 1440 and 390). Each
// pattern below failed WCAG on the site before it was fixed; this keeps it from coming back. Every rule is proven to
// fire on a planted sample first.
//   1. A region that scrolls sideways can be reached from the keyboard (tabIndex) and is named.
//   2. No text colour is a hex with an alpha suffix (`${COLOR}40` put step numbers at 1.6:1 on Advisory and About).
//   3. A form label names its field (htmlFor), or wraps it.
//   4. No text is faded below 0.6 opacity (How to Choose's counts were 2.3:1 at 0.4).
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail); } };

const SCROLL = /<(div|section)\b[^>]*overflowX: ?"auto"[^>]*>/g;
const scrollBad = (s) => [...s.matchAll(SCROLL)].filter((m) => !/tabIndex=\{0\}/.test(m[0]) || !/aria-label=/.test(m[0])).map((m) => m[0].slice(0, 80));
const ALPHA_TEXT = /\bcolor: `\$\{[A-Za-z_.]+\}[0-9A-Fa-f]{2}`/;
/* A <label> element (not a component prop named label) that neither names a field nor wraps one. */
const labelBad = (s) => [...s.matchAll(/<label\b([^>]*)>([\s\S]*?)<\/label>/g)].filter(([, attrs, body]) => !/htmlFor=/.test(attrs) && !/<(input|select|textarea)\b/.test(body)).map((m) => m[0].slice(0, 80));
const FADED = /<span style=\{\{[^}]*\bopacity: ?0?\.[0-5]\d?\b[^}]*\}\}>[^<{]*\{?[^<]*<\/span>/;

console.log("\n1. Each rule fires on a planted sample");
ok("an unreachable scroll region is caught", scrollBad('<div style={{ overflowX: "auto" }}>').length === 1 && scrollBad('<div role="region" aria-label="Table" tabIndex={0} style={{ overflowX: "auto" }}>').length === 0);
ok("an alpha-suffixed text colour is caught", ALPHA_TEXT.test("color: `${ELECTRIC}40`") && !ALPHA_TEXT.test("color: ELECTRIC"));
ok("an unbound label is caught", labelBad('<label style={s}>Name</label><input name="x" />').length === 1 && labelBad('<label htmlFor="a">Name</label>').length === 0 && labelBad('<label><input type="checkbox" /> Yes</label>').length === 0);
ok("faded text is caught", FADED.test("<span style={{ opacity: 0.4 }}>(5)</span>") && !FADED.test("<span style={{ opacity: 0.8 }}>(5)</span>"));

const files = [];
const walk = (d) => { for (const f of readdirSync(d)) { if (["node_modules", "dist", "dist-ssr", ".git", "public", "docs"].includes(f)) continue; const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (f.endsWith(".jsx")) files.push(p.replace(/^\.\//, "")); } };
walk(".");

console.log(`\n2. The ${files.length} page and component files`);
const hits = { scroll: [], alpha: [], label: [], faded: [] };
for (const f of files) {
  const s = readFileSync(f, "utf8");
  for (const x of scrollBad(s)) hits.scroll.push(`${f}: ${x}`);
  if (ALPHA_TEXT.test(s)) hits.alpha.push(f);
  for (const x of labelBad(s)) hits.label.push(`${f}: ${x}`);
  if (FADED.test(s)) hits.faded.push(f);
}
ok("every sideways scroll region is reachable and named", hits.scroll.length === 0, hits.scroll.slice(0, 4).join(" | "));
/* A stylesheet that makes tables scroll (method pages on a phone) needs every table focusable. */
const cssScroll = files.filter((f) => { const t = readFileSync(f, "utf8"); return /table\{[^}]*overflow-x: ?auto/.test(t) && /<table(?![^>]*tabIndex=\{0\})[\s>]/.test(t); });
ok("tables that scroll through CSS are focusable", cssScroll.length === 0, cssScroll.join(", "));
ok("no text colour carries an alpha suffix", hits.alpha.length === 0, hits.alpha.join(", "));
ok("every form label names or wraps its field", hits.label.length === 0, hits.label.slice(0, 4).join(" | "));
ok("no text is faded below 0.6", hits.faded.length === 0, hits.faded.join(", "));
/* 30 Sep 2026: a button with no background of its own took the browser's light grey under pale text (RFP focus areas). */
{
  const html = readFileSync("./index.html", "utf8");
  ok("every button starts transparent and inherits its text colour", /button \{ background-color: transparent; color: inherit; -webkit-appearance: none; appearance: none; \}/.test(html));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
