// mark.test.mjs
//
// The mark (Brand Guide section 4, src/lib/mark.js): a solid C, a C of voice bars, the X. Proves: the geometry holds its
// published construction (bars inside their band, the C clear of the bars, the X clear of the C, everything inside the box,
// the voice symmetric about the opening); the small drawing takes over below 40 pixels; every colour is visible where it is
// drawn; the header and footer, the favicon and the report masthead all draw from mark.js, and the retired three-arc mark
// is gone from each; public/favicon.svg equals the module's output.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail); } };
const React = require("react");
const { renderToString } = require("react-dom/server");
const M = await import("./src/lib/mark.js");
const { HOUSE, contrast } = await import("./src/lib/tokens.js");

console.log("\n1. The construction");
for (const [name, g] of Object.entries(M.MARK)) {
  const inner = Math.min(...g.bars.map((h) => g.barR - h)), outer = Math.max(...g.bars.map((h) => g.barR + h));
  ok(`${name}: every bar sits inside its band, radius 32 to 52`, inner >= 32 && outer <= 52, `${inner} to ${outer}`);
  ok(`${name}: the C stays clear of the bars`, g.cR + g.cW / 2 < inner - g.barW / 2);
  ok(`${name}: the X stays clear of the C`, g.x * Math.SQRT2 + g.xW / 2 < g.cR - g.cW / 2);
  ok(`${name}: everything sits inside the 120 unit box`, outer + g.barW / 2 < 60);
  const p = M.markParts(g);
  ok(`${name}: the voice spans 230 degrees, symmetric about the opening`, p.bars[0].rot === -115 && p.bars[p.bars.length - 1].rot === 115);
  ok(`${name}: the C opens 57 degrees either side`, g.tip === 57 && /^M 13\.07,-20\.13 A 24 24 0 1 0 13\.07,20\.13$/.test(p.c));
}
ok("the full mark has 17 bars, the small 9", M.MARK.full.bars.length === 17 && M.MARK.small.bars.length === 9);
ok("the small drawing is heavier", M.MARK.small.barW > M.MARK.full.barW && M.MARK.small.cW > M.MARK.full.cW && M.MARK.small.xW > M.MARK.full.xW);
ok("below 40 pixels the small drawing, from 40 the full", M.geometryFor(16) === M.MARK.small && M.geometryFor(30) === M.MARK.small && M.geometryFor(39) === M.MARK.small && M.geometryFor(40) === M.MARK.full && M.geometryFor(96) === M.MARK.full);

console.log("\n2. Colour");
const D = M.EVERYDAY.dark, P = M.EVERYDAY.paper;
for (const bg of [HOUSE.ink, HOUSE.navy]) for (const c of [D.c, D.voice, D.x]) ok(`${c} is at least 3:1 on ${bg}`, contrast(c, bg) >= 3, contrast(c, bg).toFixed(2));
for (const c of [P.c, P.voice, P.x]) ok(`${c} is at least 3:1 on paper`, contrast(c, HOUSE.paper) >= 3, contrast(c, HOUSE.paper).toFixed(2));
ok("the voice and the X share one blue", D.voice === D.x && P.voice === P.x && D.voice === HOUSE.sky && P.voice === HOUSE.action);
ok("mark.js carries no colour literal", !/#[0-9A-Fa-f]{3,6}\b/.test(readFileSync("./src/lib/mark.js", "utf8")));

console.log("\n3. The header and footer");
const r = await build({ entryPoints: ["./src/lib/Shell.jsx"], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic",
  loader: { ".js": "jsx" }, external: ["react", "react-dom"], logLevel: "silent" });
const m = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(m, m.exports, require);
const S = m.exports;
const lines = (h) => (h.match(/<line /g) || []).length;
const small = renderToString(React.createElement(S.Mark, { size: 30 })), big = renderToString(React.createElement(S.Mark, { size: 64 }));
ok("the header size draws the small mark: 9 bars", lines(small) === 9 && small.includes(`stroke-width="${M.MARK.small.barW}"`));
ok("a large mark draws 17 bars", lines(big) === 17);
ok("the everyday mark: mist C, sky voice and X", small.includes(`d="${M.markParts(M.MARK.small).c}" stroke="${HOUSE.mist}"`) && small.includes(`stroke="${HOUSE.sky}"`));
ok("the mark is decoration to a screen reader", /aria-hidden="true"/.test(small));
const SRC = readFileSync("./src/lib/Shell.jsx", "utf8");
ok("Shell.jsx draws from mark.js", /from "\.\/mark\.js"/.test(SRC) && /markParts\(geometryFor\(size\)\)/.test(SRC));
ok("the header and footer both place the mark", /<Mark size=\{30\} edition=\{edition\} \/>/.test(SRC) && /<Mark size=\{26\} \/>/.test(SRC));

console.log("\n4. The favicon");
const fav = readFileSync("./public/favicon.svg", "utf8");
ok("public/favicon.svg equals the module (node scripts/favicon.mjs)", fav === M.faviconSvg());
ok("the favicon draws the small mark on navy", lines(fav) === 9 && fav.includes(`fill="${HOUSE.navy}"`));
ok("index.html links it", /<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg" \/>/.test(readFileSync("./index.html", "utf8")));

console.log("\n5. The report masthead");
const REP = readFileSync("./ReportExport.jsx", "utf8");
ok("ReportExport.jsx draws from mark.js on paper", /from "\.\/src\/lib\/mark\.js"/.test(REP) && /markSvg_\(EVERYDAY\.paper, \{ size: 26/.test(REP));
const paper = M.markSvg(P, { size: 26, attrs: 'class="mark" aria-hidden="true"' });
ok("the paper mark is ink and action blue, never sky", paper.includes(HOUSE.paperInk) && paper.includes(HOUSE.action) && !paper.includes(HOUSE.sky));
ok("the paper mark at 26 pixels is the small drawing", lines(paper) === 9);

console.log("\n6. The three-arc mark is retired from every place the mark is drawn");
for (const [f, t] of [["src/lib/Shell.jsx", SRC], ["ReportExport.jsx", REP], ["public/favicon.svg", fav]]) ok(`${f}: no three-arc drawing`, !/A 58,58|A 44,44|A 30,30/.test(t));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
