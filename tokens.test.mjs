/* tokens.test.mjs
 *
 * Redesign Phase 2, the foundations (docs/REDESIGN_PLAN.md). Brand Guide 1.0 lives in
 * src/lib/tokens.js as data; this harness keeps the data, the guide and the site in step.
 *
 *   1. Every colour, type size, space, radius and motion value equals the guide's tables.
 *   2. Every text pairing the guide relies on passes WCAG AA (4.5:1).
 *   3. IBM Plex is self-hosted: the files exist, are woff2, carry the OFL, load with no
 *      font host, and index.html carries the generated block unchanged.
 *   4. type.js, which every tool reads, is on Plex; the report window is on Plex too.
 *   5. The 32 icons: the set equals the guide's list, every icon renders one stroked path
 *      in the text colour, and an unlabelled icon is hidden from screen readers.
 *   6. Migrated files carry no hard-coded colour: they read tokens or CSS variables.
 *
 * Run from repo root: node tokens.test.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");
const T = await import("./src/lib/tokens.js");
const TY = await import("./src/lib/type.js");
const { tokensBlock } = await import("./src/lib/tokensBlock.js");

let pass = 0, fail = 0;
const ok = (name, cond, detail) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail ? "(" + detail + ")" : ""); } };
const section = (t) => console.log("\n" + t);
const GUIDE = readFileSync("./docs/BRAND_GUIDE.md", "utf8");
const up = (s) => s.toUpperCase();

/* ------------------------------------------------------------ 1. the guide */
section("1. Tokens equal the Brand Guide tables");
{
  const row = (name) => (GUIDE.match(new RegExp("^\\| " + name + " \\|.*$", "m")) || [""])[0];
  const hexes = (s) => (s.match(/#[0-9A-Fa-f]{6}/g) || []).map(up);
  const house = { Ink: "ink", Navy: "navy", Surface: "surface", Mist: "mist", Muted: "muted", Action: "action", Electric: "electric" };
  for (const [g, k] of Object.entries(house)) ok(`house ${g} is ${T.HOUSE[k]}`, hexes(row(g))[0] === up(T.HOUSE[k]), row(g));
  ok("house light blue pair", hexes(row("Light blue")).join() === [T.HOUSE.sky, T.HOUSE.sky2].map(up).join());
  ok("house paper pair", hexes(row("Paper")).join() === [T.HOUSE.paper, T.HOUSE.paper2].map(up).join());

  const pil = { diagnostics: "Diagnostics", vendors: "Vendor Intelligence", industries: "Industry Insights", research: "Research \\(soon\\)", marketWatch: "Market Watch \\(soon\\)" };
  for (const [k, g] of Object.entries(pil)) {
    const p = T.PILLARS[k];
    ok(`pillar ${k}: fill, on dark, on light`, hexes(row(g)).join() === [p.fill, p.onDark, p.onLight].map(up).join(), row(g));
  }
  ok("two pillars are marked soon, Research and Market Watch",
    Object.entries(T.PILLARS).filter(([, p]) => p.soon).map(([k]) => k).join() === "research,marketWatch");

  const layerLine = (GUIDE.match(/L7 #[\s\S]*?L1 #[0-9A-F]{6}/) || [""])[0];
  ok("layers, L7 to L1, equal the guide", T.LAYERS.map((l) => "L" + l.n + " " + up(l.color)).join(", ").replace(/,\s+/g, ", ") === layerLine.replace(/\s+/g, " ").replace(/,\s*/g, ", "), layerLine);
  for (const l of T.LAYERS) {
    ok(`layer L${l.n} plain and technical names equal the stack table`, new RegExp("\\| L" + l.n + " \\| " + l.name + " \\| " + l.technical.replace(/\+/g, "\\+") + " \\|").test(GUIDE));
  }

  const arcs = (GUIDE.match(/Evidence (#[0-9A-F]{6}), Realization (#[0-9A-F]{6}), Completeness (#[0-9A-F]{6})/) || []).slice(1);
  ok("evidence mark arcs equal the guide", arcs.join() === [T.ARCS.evidence, T.ARCS.realization, T.ARCS.completeness].map(up).join(), arcs.join());

  const f = (g) => hexes(row(g));
  ok("finding critical, dark and paper", f("Critical").join() === [T.FINDINGS.critical.dark, T.FINDINGS.critical.print].map(up).join());
  ok("finding high, dark and paper", f("High").join() === [T.FINDINGS.high.dark, T.FINDINGS.high.print].map(up).join());
  ok("finding clear, dark and paper", f("Clear").join() === [T.FINDINGS.clear.dark, T.FINDINGS.clear.print].map(up).join());
  ok("finding unknown is dashed and never red", T.FINDINGS.unknown.form === "dashed" && /Unknown is never red/.test(GUIDE)
    && T.FINDINGS.unknown.dark !== T.FINDINGS.critical.dark && T.FINDINGS.unknown.print !== T.FINDINGS.critical.print);

  const scale = { figure: "Figure", display: "Display", h1: "Heading 1", h2: "Heading 2", h3: "Heading 3", body: "Body", small: "Small", label: "Label" };
  const W = { 400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold" };
  for (const [k, g] of Object.entries(scale)) {
    const r = row(g), s = T.TYPE_SCALE[k];
    ok(`type ${g}: ${s.size} ${W[s.weight]}`, new RegExp("\\| " + s.size + " " + W[s.weight] + "\\b").test(r), r);
  }
  ok("space scale equals the guide", GUIDE.includes("Space on a base of 4: " + T.SPACE.join(", ")));
  ok("radius equals the guide", GUIDE.includes(`Radius: ${T.RADIUS.chip} chips, ${T.RADIUS.field} fields and buttons, ${T.RADIUS.card} cards, pills for toggles`));
  ok("motion equals the guide", GUIDE.includes(`${parseInt(T.MOTION.press)} ms press and select; ${parseInt(T.MOTION.count)} ms figures counting`)
    && GUIDE.includes("1,600 ms arcs drawing once") && T.MOTION.draw === "1600ms" && GUIDE.includes(T.MOTION.curve));
  ok("touch targets 44 pixels", GUIDE.includes("Touch targets " + T.TOUCH + " pixels or larger"));
}

/* --------------------------------------------------------- 2. contrast */
section("2. Every text pairing passes WCAG AA");
{
  const AA = 4.5, c = T.contrast;
  ok("contrast function: white on black is 21", Math.abs(c("#FFFFFF", "#000000") - 21) < 1e-9);
  ok("contrast function: equal colours are 1", c("#0072BB", "#0072BB") === 1);
  ok("mist on ink", c(T.HOUSE.mist, T.HOUSE.ink) >= AA);
  ok("body text on ink and on navy", c(T.HOUSE.body, T.HOUSE.ink) >= AA && c(T.HOUSE.body, T.HOUSE.navy) >= AA);
  ok("muted on ink and on navy", c(T.HOUSE.muted, T.HOUSE.ink) >= AA && c(T.HOUSE.muted, T.HOUSE.navy) >= AA);
  ok("links (sky2) on ink and on navy", c(T.HOUSE.sky2, T.HOUSE.ink) >= AA && c(T.HOUSE.sky2, T.HOUSE.navy) >= AA);
  ok("white on the action button", c("#FFFFFF", T.HOUSE.action) >= AA);
  ok("report text on paper and panel", c(T.HOUSE.paperInk, T.HOUSE.paper) >= AA && c(T.HOUSE.paperInk, T.HOUSE.paper2) >= AA);
  let low = 99;
  for (const [k, p] of Object.entries(T.PILLARS)) {
    const x = c(p.fill, T.HOUSE.ink); low = Math.min(low, x);
    ok(`${k}: ink text on the fill`, x >= AA, x.toFixed(2));
    ok(`${k}: on-dark text on ink and navy`, c(p.onDark, T.HOUSE.ink) >= AA && c(p.onDark, T.HOUSE.navy) >= AA);
    ok(`${k}: on-light text on paper`, c(p.onLight, T.HOUSE.paper) >= AA && c(p.onLight, T.HOUSE.paper2) >= AA);
    ok(`${k}: onFill picks ink`, T.onFill(p.fill) === T.HOUSE.ink);
  }
  const stated = Number((GUIDE.match(/the lowest at ([0-9.]+):1/) || [])[1]);
  ok("the guide states the lowest pillar pair to one decimal", Math.floor(low * 10) / 10 === stated, `computed ${low.toFixed(2)}, guide ${stated}`);
  for (const l of T.LAYERS) ok(`layer L${l.n} reads on ink`, c(l.color, T.HOUSE.ink) >= 3, c(l.color, T.HOUSE.ink).toFixed(2));
  ok("critical: ink on the dark fill, white on the paper fill", c(T.HOUSE.ink, T.FINDINGS.critical.dark) >= AA && c("#FFFFFF", T.FINDINGS.critical.print) >= AA);
  ok("clear: ink on the dark fill, white on the paper fill", c(T.HOUSE.ink, T.FINDINGS.clear.dark) >= AA && c("#FFFFFF", T.FINDINGS.clear.print) >= AA);
  ok("high outline reads on ink and on paper", c(T.FINDINGS.high.dark, T.HOUSE.ink) >= AA && c(T.FINDINGS.high.print, T.HOUSE.paper) >= AA);
}

/* ----------------------------------------------------------- 3. fonts */
section("3. IBM Plex is self-hosted");
{
  const FAMILIES = new Set(T.FONT_FILES.map((f) => f.family));
  ok("three families: Sans, Sans Condensed, Mono", [...FAMILIES].join() === "IBM Plex Sans,IBM Plex Sans Condensed,IBM Plex Mono");
  ok("Plex Sans in the guide's four weights, plus italic", T.FONT_FILES.filter((f) => f.family === "IBM Plex Sans" && f.style === "normal").map((f) => f.weight).join() === "400,500,600,700"
    && T.FONT_FILES.some((f) => f.family === "IBM Plex Sans" && f.style === "italic"));
  ok("two weights preloaded, as the guide says", T.FONT_FILES.filter((f) => f.preload).length === 2 && /preload two/.test(GUIDE));
  for (const f of T.FONT_FILES) {
    const p = "./public/fonts/" + f.file, have = existsSync(p);
    ok(`${f.file} exists`, have);
    if (have) {
      const b = readFileSync(p);
      ok(`${f.file} is woff2`, b.slice(0, 4).toString("latin1") === "wOF2");
      ok(`${f.file} is under 40 KB`, b.length < 40 * 1024, String(b.length));
    }
  }
  ok("the Open Font License ships beside the files", existsSync("./public/fonts/OFL.txt") && /SIL Open Font License/.test(readFileSync("./public/fonts/OFL.txt", "utf8")));
  const face = T.fontFaceCss();
  ok("@font-face rules point at the site's own files only", !/https?:/.test(face) && (face.match(/url\(\/fonts\//g) || []).length === T.FONT_FILES.length);
  ok("every face swaps, so text shows before the font arrives", (face.match(/font-display:swap/g) || []).length === T.FONT_FILES.length);
  const html = readFileSync("./index.html", "utf8");
  const a = html.indexOf("<!-- TOKENS_START -->"), z = html.indexOf("<!-- TOKENS_END -->");
  ok("index.html carries the tokens markers once", a > 0 && z > a && html.split("<!-- TOKENS_START -->").length === 2);
  ok("index.html block equals the generated block (run node scripts/tokens-css.mjs)", html.slice(a + "<!-- TOKENS_START -->".length, z).trim() === tokensBlock().trim());
  ok("the block carries every CSS variable", html.includes(T.cssVars()));
  const csp = (readFileSync("./vercel.json", "utf8").match(/font-src ([^;]+);/) || [])[1] || "";
  ok("the site policy already allows same-origin fonts", /'self'/.test(csp));
  const v = JSON.parse(readFileSync("./vercel.json", "utf8"));
  const fontHeaders = v.headers.find((h) => h.source === "/fonts/(.*)");
  ok("font files are cached for a year and marked immutable", !!fontHeaders && /max-age=31536000, immutable/.test(JSON.stringify(fontHeaders)));
}

/* ------------------------------------------------------- 4. type system */
section("4. Every tool reads Plex through type.js; the report is on Plex");
{
  ok("FONT is IBM Plex Sans", TY.FONT === T.FONT_SANS && TY.FONT.startsWith("'IBM Plex Sans'"));
  ok("FONT_NARROW is Plex Sans Condensed", TY.FONT_NARROW === T.FONT_CONDENSED);
  ok("FONT_IMPORT_CSS asks no font host", TY.FONT_IMPORT_CSS === T.fontFaceCss() && !/googleapis|gstatic/.test(TY.FONT_IMPORT_CSS));
  const src = readFileSync("./src/lib/type.js", "utf8");
  ok("type.js names no retired family", !/Archivo|DM Sans|Instrument Serif/.test(src));
  const re = readFileSync("./ReportExport.jsx", "utf8");
  ok("the report window loads Plex from the site's own files", /FONT_FILES/.test(re) && /\/fonts\/\$\{e\(f\.file\)\}/.test(re) && !/googleapis|gstatic|Archivo/.test(re));
  ok("every type token uses the Plex stack", Object.values(TY.TYPE).every((t) => t.fontFamily === TY.FONT));
}

/* -------------------------------------------------------------- 5. icons */
section("5. The 32 icons");
{
  const r = await build({ entryPoints: ["./src/lib/Icon.jsx"], bundle: true, write: false, format: "cjs", platform: "node",
    jsx: "automatic", external: ["react", "react-dom"], logLevel: "silent" });
  const mod = { exports: {} };
  new Function("module", "exports", "require", r.outputFiles[0].text)(mod, mod.exports, require);
  const { Icon, ICONS } = mod.exports;
  const listed = ((GUIDE.match(/The set of 32: ([^.]+)\./) || [])[1] || "").replace(/\s+/g, " ").split(", ").map((s) => s.trim().replace(/ /g, "-"));
  ok("the guide lists 32", listed.length === 32, String(listed.length));
  ok("the set equals the guide's list", Object.keys(ICONS).sort().join() === listed.slice().sort().join(),
    Object.keys(ICONS).filter((k) => !listed.includes(k)).concat(listed.filter((k) => !(k in ICONS))).join(" "));
  const seen = new Set();
  for (const name of Object.keys(ICONS)) {
    const html = renderToStaticMarkup(React.createElement(Icon, { name }));
    ok(`${name}: one path, stroked in the text colour, no fill`, (html.match(/<path /g) || []).length === 1 && /stroke="currentColor"/.test(html) && /fill="none"/.test(html) && /stroke-width="2"/.test(html));
    ok(`${name}: round caps and joins on a 24 grid`, /stroke-linecap="round"/.test(html) && /stroke-linejoin="round"/.test(html) && /viewBox="0 0 24 24"/.test(html));
    ok(`${name}: hidden from screen readers without a label`, /aria-hidden="true"/.test(html) && !/role=/.test(html));
    const coords = (ICONS[name].match(/-?\d*\.?\d+/g) || []).map(Number);
    ok(`${name}: drawn inside the grid`, coords.every((n) => n >= -24 && n <= 24));
    ok(`${name}: drawn once`, !seen.has(ICONS[name])); seen.add(ICONS[name]);
  }
  const labelled = renderToStaticMarkup(React.createElement(Icon, { name: "close", label: "Close" }));
  ok("a labelled icon is an image with its name", /role="img"/.test(labelled) && /aria-label="Close"/.test(labelled) && !/aria-hidden/.test(labelled));
  let threw = false; try { renderToStaticMarkup(React.createElement(Icon, { name: "sparkle" })); } catch { threw = true; }
  ok("an unknown icon name fails loudly", threw);
}

/* ----------------------------------------------------- 6. migrated files */
section("6. Migrated files carry no hard-coded colour");
{
  // A file joins this list when it moves onto the new design. It may use tokens.js or the
  // --cx- variables, never a colour literal of its own.
  const MIGRATED = ["src/lib/Icon.jsx", "src/lib/ui.jsx", "src/lib/Shell.jsx", "src/lib/ToolFrame.jsx", "Homepage.jsx", "src/lib/home.js", "src/lib/SubVerticalPage.jsx", "src/lib/VendorTags.jsx", "CCaaSCategory.jsx", "CCaaSIndustry.jsx", "ResearchedProfile.jsx", "Corrections.jsx"];
  const COLOR = /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/;
  for (const f of MIGRATED) {
    const code = readFileSync("./" + f, "utf8").split("\n").filter((l) => !/^\s*\/\//.test(l)).join("\n");
    ok(`${f}: no colour literal`, !COLOR.test(code), (code.match(COLOR) || [""])[0]);
  }
  ok("the rule fires on a literal", COLOR.test("color: '#0B1D3A'") && COLOR.test("rgba(0,0,0,0.5)") && !COLOR.test("var(--cx-navy)"));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
