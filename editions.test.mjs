// editions.test.mjs
//
// Special editions of the mark (Brand Guide 1.0 section 5; redesign Phase 11). Proves: every edition has three arcs and an
// X, each visible on the house (3:1 against ink and navy, the non-text contrast floor); the schedule is valid (a known
// edition, dates in order, a month at most, no overlap, a line on why) and the rules fire on planted mistakes; the switch
// picks an edition only inside its dates; the prerendered header always carries the everyday mark (the edition switches
// after load, so hydration never differs); a Mark drawn with an edition takes its colours; and only the header reads the
// editions, never a result, report, method or vendor page.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail); } };
const React = require("react");
const { renderToString } = require("react-dom/server");
const E = await import("./src/lib/editions.js");
const { HOUSE, contrast } = await import("./src/lib/tokens.js");

console.log("\n1. Every edition is three arcs and an X, visible on the house");
for (const [id, e] of Object.entries(E.EDITIONS)) {
  ok(`${id}: three arcs and an X`, Array.isArray(e.arcs) && e.arcs.length === 3 && /^#[0-9A-Fa-f]{6}$/.test(e.x) && e.arcs.every((c) => /^#[0-9A-Fa-f]{6}$/.test(c)));
  for (const c of [...e.arcs, e.x]) ok(`${id}: ${c} is at least 3:1 on ink and on navy`, contrast(c, HOUSE.ink) >= 3 && contrast(c, HOUSE.navy) >= 3, `${contrast(c, HOUSE.ink).toFixed(2)} / ${contrast(c, HOUSE.navy).toFixed(2)}`);
  ok(`${id}: named, with its use`, !!e.name && !!e.use);
}
ok("the pillar edition is magenta, amber and teal with the sky X", E.EDITIONS.pillar.arcs.join() === "#F0508C,#F5A524,#12B5A6" && E.EDITIONS.pillar.x === HOUSE.sky);

console.log("\n2. The schedule");
ok("the published schedule is valid", E.scheduleProblems().length === 0, E.scheduleProblems().join("; "));
ok("Customer Service Week and CX Day 2026 carry the Pillar edition (TB, 27 Sep 2026)", (E.editionFor("2026-10-05") || {}).id === "pillar" && (E.editionFor("2026-10-09") || {}).id === "pillar" && E.editionFor("2026-10-10") === null && E.editionFor("2026-09-28") === null);
const GOOD = [{ edition: "pillar", start: "2026-10-05", end: "2026-10-09", why: "Customer Service Week, the week the profession marks its work." }];
ok("a valid entry passes", E.scheduleProblems(GOOD).length === 0);
const bad = {
  "unknown edition": [{ ...GOOD[0], edition: "rainbow" }],
  "dates reversed": [{ ...GOOD[0], start: "2026-10-09", end: "2026-10-05" }],
  "no reason": [{ ...GOOD[0], why: "" }],
  "longer than a month": [{ ...GOOD[0], end: "2026-12-01" }],
  "overlap": [GOOD[0], { ...GOOD[0], start: "2026-10-08", end: "2026-10-12" }],
};
for (const [why, s] of Object.entries(bad)) ok(`refused: ${why}`, E.scheduleProblems(s).length > 0);

console.log("\n3. The switch");
ok("inside the dates, the edition", (E.editionFor("2026-10-05", GOOD) || {}).id === "pillar" && (E.editionFor("2026-10-09", GOOD) || {}).id === "pillar");
ok("outside the dates, the everyday mark", E.editionFor("2026-10-04", GOOD) === null && E.editionFor("2026-10-10", GOOD) === null);
ok("the edition carries its reason", /Customer Service Week/.test((E.editionFor("2026-10-06", GOOD) || {}).why || ""));
ok("today in UTC", E.todayUtc(new Date("2026-10-05T23:30:00Z")) === "2026-10-05");

console.log("\n4. The header");
const r = await build({ entryPoints: ["./src/lib/Shell.jsx"], bundle: true, write: false, format: "cjs", platform: "node", jsx: "automatic",
  loader: { ".js": "jsx" }, external: ["react", "react-dom"], logLevel: "silent" });
const m = { exports: {} };
new Function("module", "exports", "require", r.outputFiles[0].text)(m, m.exports, require);
const S = m.exports;
const head = renderToString(React.createElement(S.SiteHeader, {}));
ok("the prerendered header draws the everyday mark", !E.EDITIONS.pillar.arcs.some((c) => head.includes(c)) && head.includes(HOUSE.mist));
const marked = renderToString(React.createElement(S.Mark, { edition: E.EDITIONS.pillar }));
ok("a Mark with an edition takes its arc colours", E.EDITIONS.pillar.arcs.every((c) => marked.includes(`stroke="${c}"`)));
ok("the everyday Mark keeps mist arcs and the sky X", renderToString(React.createElement(S.Mark, {})).includes(`stroke="${HOUSE.mist}"`));
const SRC = readFileSync("./src/lib/Shell.jsx", "utf8");
ok("the header switches after load, in an effect", /useEffect\(\(\) => \{ try \{ setEdition\(editionFor\(todayUtc\(\)\)\)/.test(SRC));
ok("the footer mark never takes an edition", /<Mark size=\{26\} \/>/.test(SRC));

console.log("\n5. Only the header reads the editions");
const files = [];
const walk = (d) => { for (const f of readdirSync(d)) { if (["node_modules", "dist", "dist-ssr", ".git", "public"].includes(f)) continue; const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (/\.(jsx?|mjs)$/.test(f) && !/\.test\.mjs$|\.report\.mjs$/.test(f)) files.push(p.replace(/^\.\//, "")); } };
walk(".");
const readers = files.filter((f) => /from\s+["'][^"']*editions\.js["']/.test(readFileSync(f, "utf8")) && f !== "src/lib/editions.js");
ok("only src/lib/Shell.jsx imports it", readers.join() === "src/lib/Shell.jsx", readers.join());

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
