/* aht.test.mjs
 *
 * The AHT Decomposition engine (src/lib/aht.js). Sliced from its markers and equal to the
 * module; every output equals an independent oracle; each lever alone is proven identical
 * to the previous tool's scenarios on thousands of cases at the opening shares, so only the
 * intended changes moved (levers are editable and selectable; selected levers combine
 * multiplicatively on a shared component; the unreachable 90% talk floor is gone; seconds
 * become agent hours of capacity). Every lever share is registered; retired claims stay dead.
 */
import { readFileSync } from "node:fs";
import * as E0 from "./src/lib/aht.js";
import { benchmark, benchmarksForTool } from "./src/lib/benchmarks.js";

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
const DASH = new RegExp("[" + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + "]");
let seed = 20260926;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const close = (a, b, e = 1e-9) => Math.abs(a - b) <= e * Math.max(1, Math.abs(a), Math.abs(b));
const C = ["talk", "hold", "wrap", "transfer", "search", "admin"];
const SHARE = { summarization: { wrap: 50 }, knowledge: { search: 40, hold: 15 }, desktop: { admin: 50, hold: 10 }, routing: { transfer: 50, talk: 5 } };
const openLevers = (on = true) => Object.fromEntries(Object.entries(SHARE).map(([id, t]) => [id, { on, ...t }]));
const randomInputs = (edit = true) => {
  const values = Object.fromEntries(C.map((c) => [c, (c === "talk" ? 1 : 0) + Math.floor(rnd() * 400)]));
  const levers = Object.fromEntries(Object.entries(SHARE).map(([id, t]) => [id, { on: rnd() < 0.6, ...Object.fromEntries(Object.keys(t).map((c) => [c, edit ? Math.floor(rnd() * 101) : t[c]])) }]));
  return { values, contacts: Math.floor(rnd() * 200000), levers };
};
const base = { values: { talk: 210, hold: 55, wrap: 60, transfer: 15, search: 30, admin: 25 }, contacts: 20000, levers: openLevers() };

section("0. The engine is sliced live and matches the module");
const SRC = readFileSync("./src/lib/aht.js", "utf8");
const a = SRC.indexOf("/* @engine-start */"), b = SRC.indexOf("/* @engine-end */");
ok("engine markers present, in order", a > 0 && b > a);
const BODY = SRC.slice(a, b);
const load = (body) => new Function(body + "\nreturn { AHT_COMPONENTS, AHT_LEVERS, runAHT };")();
const E = load(BODY);
ok("the slice has no import, JSX, DOM access or lever share of its own", !/import |<[A-Z]|window\.|document\.|0\.5\b|0\.4\b|0\.15|0\.1\b|0\.05|0\.9/.test(BODY));
let same = true;
for (let i = 0; i < 5000; i++) { const v = randomInputs(); if (JSON.stringify(E.runAHT(v)) !== JSON.stringify(E0.runAHT(v))) same = false; }
ok("5,000 random cases: the sliced engine equals the module", same);

section("1. Every output against an independent oracle");
let oSame = true, bad = null;
for (let i = 0; i < 20000; i++) {
  const v = randomInputs(); const r = E0.runAHT(v); const t = v.values;
  const total = C.reduce((s, c) => s + t[c], 0);
  const lev = Object.entries(SHARE).map(([id, tg]) => Object.keys(tg).reduce((s, c) => s + t[c] * v.levers[id][c] / 100, 0));
  const keep = (c) => Object.entries(SHARE).reduce((f, [id, tg]) => (v.levers[id].on && c in tg ? f * (1 - v.levers[id][c] / 100) : f), 1);
  const comb = C.reduce((s, c) => s + t[c] * keep(c), 0);
  const eq = r.total === total && close(r.talkShare, t.talk / total) && r.nonTalk === total - t.talk
    && r.levers.every((L, j) => close(L.saved, lev[j]) && close(L.newAHT, total - lev[j]) && close(L.hours, lev[j] * v.contacts * 12 / 3600))
    && close(r.combinedNew, comb) && close(r.combinedSaved, total - comb) && close(r.combinedHours, (total - comb) * v.contacts * 12 / 3600)
    && r.selected === Object.values(v.levers).filter((l) => l.on).length;
  if (!eq) { oSame = false; bad = bad || { v, r: { total: r.total, comb: r.combinedNew, oracle: comb } }; }
}
ok(`20,000 random cases: every output equals the oracle${bad ? " " + JSON.stringify(bad) : ""}`, oSame);

section("2. Behavior neutral where no change was intended: A/B against the previous tool");
/* The previous tool's lines, frozen from AHTDecomposition.jsx at d9954ff so the check runs on a
   shallow CI checkout: each scenario subtracted component times its fixed reduction; the
   combined figure added the rounded scenario savings and floored at 90% of talk time. */
const LEGACY = [
  "  const reducibleTime = values.hold + values.wrap + values.search + values.admin;",
  "    Object.entries(s.targets).forEach(([k, reduction]) => { newTotal -= values[k] * reduction; });",
  "    return { ...s, newAHT: Math.round(newTotal), savedSec: Math.round(saved), savedPct: ((saved / totalAHT) * 100).toFixed(1) };",
  "  const combinedSaved = scenarios.reduce((a, s) => a + s.savedSec, 0);",
  "  const combinedNew = Math.max(values.talk * 0.9, totalAHT - combinedSaved); // floor at ~90% talk time",
].join("\n");
ok("the previous tool added rounded scenario savings and floored at 90% of talk", /scenarios\.reduce\(\(a, s\) => a \+ s\.savedSec, 0\)/.test(LEGACY) && /values\.talk \* 0\.9/.test(LEGACY));
const OLD = [{ wrap: 0.5 }, { search: 0.4, hold: 0.15 }, { admin: 0.5, hold: 0.1 }, { transfer: 0.5, talk: 0.05 }];
let ab = true, halves = 0, floorBound = 0, overlapOnly = true;
for (let i = 0; i < 10000; i++) {
  const v = { ...randomInputs(false), levers: openLevers() }; const r = E0.runAHT(v); const t = v.values;
  const total = C.reduce((s, c) => s + t[c], 0);
  const old = OLD.map((tg) => { let n = total; for (const [k, x] of Object.entries(tg)) n -= t[k] * x; const saved = total - n; return { exact: saved, newAHT: Math.round(n), savedSec: Math.round(saved), savedPct: ((saved / total) * 100).toFixed(1) }; });
  /* Unrounded, every lever equals the previous scenario to float precision. A printed
     second or tenth may differ only where the true value sits exactly on a rounding line
     and the previous tool's float noise (124.39999... for 124.4) rounded it the other way. */
  const onLine = (x, step) => Math.abs((x / step) % 1 - 0.5) < 1e-6;
  for (const [j, L] of r.levers.entries()) {
    if (!close(L.saved, old[j].exact, 1e-9)) ab = false;
    const shown = Math.round(L.newAHT) === old[j].newAHT && Math.round(L.saved) === old[j].savedSec && (L.savedPct * 100).toFixed(1) === old[j].savedPct;
    if (!shown) { if (onLine(L.saved, 1) || onLine(L.newAHT, 1) || onLine(L.savedPct * 100, 0.1)) halves++; else ab = false; }
  }
  const oldSaved = old.reduce((s, o) => s + o.savedSec, 0);
  if (Math.max(t.talk * 0.9, total - oldSaved) !== total - oldSaved) floorBound++;
  /* Unrounded, the previous combined saving equals the new one plus the hold overlap the two hold levers double counted. */
  const oldExact = OLD.reduce((s, tg) => s + Object.entries(tg).reduce((x, [k, f]) => x + t[k] * f, 0), 0);
  if (!close(oldExact - r.combinedSaved, t.hold * 0.15 * 0.10, 1e-7)) overlapOnly = false;
}
ok(`10,000 cases at the opening shares: each lever alone equals the previous tool's scenario to float precision; the printed second and tenth match except ${halves} exact rounding-line cases the previous float noise rounded the other way`, ab && halves < 400);
ok("the previous 90% talk floor never bound in 10,000 cases, so removing it changes nothing", floorBound === 0);
ok("the combined saving differs from the previous sum by exactly the hold time the two hold levers double counted", overlapOnly);

section("3. The laws");
ok("an unselected lever adds nothing to the combined figure", (() => { for (let i = 0; i < 3000; i++) { const v = randomInputs(); const id = Object.keys(SHARE)[i % 4]; const off = { ...v, levers: { ...v.levers, [id]: { ...v.levers[id], on: false } } }; const on = { ...v, levers: { ...v.levers, [id]: { ...v.levers[id], on: true } } }; const r0 = E0.runAHT(off), r1 = E0.runAHT(on); if (r1.combinedSaved < r0.combinedSaved - 1e-9) return false; const none = E0.runAHT({ ...v, levers: openLevers(false) }); if (none.combinedSaved !== 0 || none.combinedNew !== none.total) return false; } return true; })());
ok("the combined saving never exceeds the sum of the selected levers alone", (() => { for (let i = 0; i < 3000; i++) { const r = E0.runAHT(randomInputs()); if (r.combinedSaved > r.levers.filter((L) => L.on).reduce((s, L) => s + L.saved, 0) + 1e-9) return false; } return true; })());
ok("no component goes below zero: at 100% on every share, targeted components reach zero and no further", (() => { const all = Object.fromEntries(Object.entries(SHARE).map(([id, t]) => [id, { on: true, ...Object.fromEntries(Object.keys(t).map((c) => [c, 100])) }])); const r = E0.runAHT({ ...base, levers: all }); return C.every((c) => r.left[c] === 0) && r.combinedNew === 0; })());
ok("a larger share never saves less", (() => { for (let i = 0; i < 3000; i++) { const v = randomInputs(); const r1 = E0.runAHT(v); const v2 = { ...v, levers: { ...v.levers, knowledge: { ...v.levers.knowledge, hold: Math.min(100, v.levers.knowledge.hold + 5) } } }; if (E0.runAHT(v2).levers[1].saved < r1.levers[1].saved - 1e-9) return false; } return true; })());
ok("agent hours are linear in contacts and zero with none", (() => { const r1 = E0.runAHT(base), r2 = E0.runAHT({ ...base, contacts: 40000 }), r0 = E0.runAHT({ ...base, contacts: 0 }); return close(r2.combinedHours, 2 * r1.combinedHours) && r0.combinedHours === 0 && r0.levers.every((L) => L.hours === 0); })());
ok("no output is NaN or infinite at the domain edges", [{ ...base, values: { talk: 1, hold: 0, wrap: 0, transfer: 0, search: 0, admin: 0 } }, { ...base, values: Object.fromEntries(C.map((c) => [c, 3600])), contacts: 100000000 }].every((v) => !/NaN|Infinity|null/.test(JSON.stringify(E0.runAHT(v)))));

section("4. The worked example on the method page reconciles to the second");
const X = E0.runAHT(base);
ok("395 seconds, 185 outside the conversation (47%)", X.total === 395 && X.nonTalk === 185 && Math.round(X.nonTalkShare * 100) === 47);
ok("levers alone: 30s, 20.25s, 18s, 18s", close(X.levers[0].saved, 30) && close(X.levers[1].saved, 20.25) && close(X.levers[2].saved, 18) && close(X.levers[3].saved, 18));
ok("hold with both hold levers keeps 55 × 0.85 × 0.9 = 42.075s", close(55 * X.left.hold, 42.075));
ok("combined: 395s to 309.575s, 85.425s a contact", close(X.combinedNew, 309.575) && close(X.combinedSaved, 85.425));
ok("5,695 agent hours a year at 20,000 contacts a month", Math.round(X.combinedHours) === 5695);

section("5. Registry and retired claims");
const TOOL = readFileSync("./AHTDecomposition.jsx", "utf8");
ok("seven lever shares are registered, every one labelled", benchmarksForTool("aht-decomposition").length === 7 && benchmarksForTool("aht-decomposition").every((e) => e.kind === "heuristic" && /Not sourced/.test(e.source)));
ok("the registered shares are the previous tool's reductions", Object.entries(SHARE).every(([id, t]) => Object.entries(t).every(([c, x]) => Math.round(benchmark(`aht.lever.${id}.${c}`) * 100) === x)));
ok("the tool reads every lever share from the registry and holds no reduction literal", /benchmark\(`aht\.lever\.\$\{L\.id\}\.\$\{c\}`\)/.test(TOOL) && !/targets: \{|\b0\.5\b|\b0\.4\b|0\.15|0\.05|talk \* 0\.9/.test(TOOL));
ok("the unsourced share ranges and reducibility ratings are gone", !/55-65%|10-18%|12-20%|3-8%|5-12%|5-10%|Very high|dramatically|significantly|benchmark: "/.test(TOOL));
ok("non-conversation time is never called reducible, and the retired cadence is gone", !/[Rr]educible|all reducible without|The goal is not/.test(TOOL));
ok("the presets are labelled illustrative and the unsourced colour thresholds are gone", /illustrative/.test(TOOL) && !/nonTalkPct > 45|> 38/.test(TOOL));
ok("the tool links the published method", /\/methodology\/aht-decomposition/.test(TOOL));
ok("no dash in the engine, the tool or the method", !DASH.test(SRC) && !DASH.test(TOOL) && !DASH.test(readFileSync("./src/lib/rubrics/ahtModel.js", "utf8")));

section("6. Mutants are caught");
const mutants = [
  ["levers add instead of compounding", "left[c] *= 1 - L.pcts[c] / 100;", "left[c] -= L.pcts[c] / 100;", (X2) => !close(X2.runAHT(base).combinedSaved, 85.425)],
  ["an unselected lever counts", "for (const L of levers) if (L.on) for", "for (const L of levers) if (true) for", (X2) => X2.runAHT({ ...base, levers: openLevers(false) }).combinedSaved !== 0],
  ["hours drop the months", "(v.contacts * 12) / 3600", "v.contacts / 3600", (X2) => Math.round(X2.runAHT(base).combinedHours) !== 5695],
  ["talk leaves the total", "const total = AHT_COMPONENTS.reduce((a, c) => a + t[c], 0);", "const total = AHT_COMPONENTS.filter((c) => c !== \"talk\").reduce((a, c) => a + t[c], 0);", (X2) => X2.runAHT(base).total !== 395],
];
for (const [name, from, to, killed] of mutants) {
  ok(`mutant present in source: ${name}`, BODY.includes(from));
  ok(`mutant caught: ${name}`, killed(load(BODY.replace(from, to))));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
