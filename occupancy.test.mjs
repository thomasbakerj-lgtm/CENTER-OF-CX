/* occupancy.test.mjs
 *
 * The Occupancy engine (src/lib/occupancy.js). Sliced from its markers and equal to the
 * module; every output equals an independent oracle; the occupancy arithmetic and the
 * attrition multipliers are proven identical to the previous tool on thousands of cases,
 * so only the intended changes moved (replacement cost now includes the loaded ramp
 * wages, staffing cost now carries the benefits load, one attrition model instead of two).
 * Every constant is registered; the retired claims and the 0.15 formula stay dead.
 */
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import * as E0 from "./src/lib/occupancy.js";
import { BENCH, benchmark, benchmarksForTool } from "./src/lib/benchmarks.js";

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
const DASH = new RegExp("[" + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + "]");
let seed = 20260924;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const close = (a, b, e = 1e-6) => Math.abs(a - b) <= e * Math.max(1, Math.abs(a), Math.abs(b));
const P = {
  bands: BENCH.occupancy,
  mult: { caution: benchmark("occ.attrition.mult.caution"), critical: benchmark("occ.attrition.mult.critical") },
  load: benchmark("load.benefits"), hoursWeek: benchmark("occ.hours.week"), hoursYear: benchmark("occ.hours.year"),
};
const randomInputs = () => ({
  agents: 1 + Math.floor(rnd() * 400), callsPerHour: Math.floor(rnd() * 3000), aht: 30 + Math.floor(rnd() * 900),
  attritionRate: Math.floor(rnd() * 120), hiringCost: Math.floor(rnd() * 20000), trainingWeeks: Math.floor(rnd() * 16),
  hourlyRate: 10 + rnd() * 40, target: 60 + Math.floor(rnd() * 39),
});

section("0. The engine is sliced live and matches the module");
const SRC = readFileSync("./src/lib/occupancy.js", "utf8");
const a = SRC.indexOf("/* @engine-start */"), b = SRC.indexOf("/* @engine-end */");
ok("engine markers present, in order", a > 0 && b > a);
const BODY = SRC.slice(a, b);
const load = (body) => new Function(body + "\nreturn { occBand, occMultiplier, runOccupancy };")();
const E = load(BODY);
ok("the slice has no import, JSX, DOM access or numeric constant of its own beyond the ladder and time units", !/import |<[A-Z]|window\.|document\.|0\.15|1\.15|1\.4|2080|1\.3\b/.test(BODY));
let same = true;
for (let i = 0; i < 5000; i++) { const v = randomInputs(); if (JSON.stringify(E.runOccupancy(v, P)) !== JSON.stringify(E0.runOccupancy(v, P))) same = false; }
ok("5,000 random cases: the sliced engine equals the module", same);

section("1. Every output against an independent oracle");
let oSame = true, bad = null;
for (let i = 0; i < 20000; i++) {
  const v = randomInputs(); const r = E0.runOccupancy(v, P);
  const A = v.callsPerHour * v.aht / 3600, occ = A / v.agents, over = occ >= 1;
  const mult = (o) => (o > 0.9 ? 1.4 : o > 0.85 ? 1.15 : 1);
  const repl = v.hiringCost + v.trainingWeeks * 40 * v.hourlyRate * 1.3;
  const atT = A > 0 ? Math.ceil(A / (v.target / 100)) : 0, extra = Math.max(0, atT - v.agents);
  const want = { occ, over, band: over || occ > 0.9 ? "critical" : occ > 0.85 ? "caution" : "healthy", repl, atT, extra, staff: extra * v.hourlyRate * 2080 * 1.3, excess: Math.max(0, (over ? 1.4 : mult(occ)) - mult(v.target / 100)) * (v.attritionRate / 100) * v.agents * repl };
  const eq = close(r.occ, want.occ) && r.overloaded === want.over && r.band === want.band && close(r.replacementCost, want.repl) && r.agentsAtTarget === want.atT && r.extraAgents === want.extra && close(r.staffingCost, want.staff) && close(r.excessAttritionCost, want.excess)
    && r.ladder.length === 15 && r.ladder.every((l, j) => { const o = (70 + 2 * j) / 100; const ag = A > 0 ? Math.ceil(A / o) : 0; return l.occ === 70 + 2 * j && l.agents === ag && close(l.attrition, v.attritionRate * mult(o)) && close(l.turnoverCost, (v.attritionRate / 100) * mult(o) * ag * repl); });
  if (!eq) { oSame = false; bad = bad || { v, r: { occ: r.occ, band: r.band, extra: r.extraAgents } }; }
}
ok(`20,000 random cases: every output equals the oracle${bad ? " " + JSON.stringify(bad) : ""}`, oSame);

section("2. Behavior neutral where no change was intended: A/B against the previous tool");
const LEGACY = execSync("git show c90dfa6:OccupancyRiskSimulator.jsx", { encoding: "utf8" });
ok("the previous tool computed occupancy as workload over agents", /const intensity = \(v\.callsPerHour \* v\.aht\) \/ 3600;/.test(LEGACY) && /\(intensity \/ v\.agents\) \* 100/.test(LEGACY));
ok("the previous ladder used the same 1.15x and 1.4x multipliers at 85% and 90%", /occ > 90 \? v\.attritionRate \* 1\.4 : occ > 85 \? v\.attritionRate \* 1\.15/.test(LEGACY));
let ab = true;
for (let i = 0; i < 10000; i++) {
  const v = { ...randomInputs(), trainingWeeks: 0 };
  const r = E0.runOccupancy(v, P); const intensity = (v.callsPerHour * v.aht) / 3600;
  const curOld = v.agents > 0 ? (intensity / v.agents) * 100 : 0;
  if (!close(r.occ * 100, curOld)) ab = false;
  for (let occ = 70, j = 0; occ <= 98; occ += 2, j++) {
    const agentsNeeded = Math.ceil(intensity / (occ / 100));
    const attritionImpact = occ > 90 ? v.attritionRate * 1.4 : occ > 85 ? v.attritionRate * 1.15 : v.attritionRate;
    const l = r.ladder[j];
    if ((intensity > 0 && l.agents !== agentsNeeded) || !close(l.attrition, attritionImpact) || (intensity > 0 && Math.abs(l.turnoverCost - (attritionImpact / 100) * agentsNeeded * v.hiringCost) > 0.01) || l.idleMin.toFixed(1) !== ((1 - occ / 100) * 60).toFixed(1)) ab = false;
  }
}
ok("10,000 cases: occupancy, the ladder's agents, idle time, attrition and turnover cost (with no ramp, within a cent) equal the previous tool", ab);

section("3. The laws");
const base = { agents: 50, callsPerHour: 440, aht: 360, attritionRate: 35, hiringCost: 6500, trainingWeeks: 6, hourlyRate: 20.59, target: 85 };
ok("more calls never lower occupancy or the agents needed", (() => { for (let i = 0; i < 3000; i++) { const v = randomInputs(); const r1 = E0.runOccupancy(v, P), r2 = E0.runOccupancy({ ...v, callsPerHour: v.callsPerHour + 10 }, P); if (r2.occ < r1.occ || r2.agentsAtTarget < r1.agentsAtTarget) return false; } return true; })());
ok("at or below the target, no agents are added and no attrition cost is attached", (() => { for (let i = 0; i < 3000; i++) { const v = randomInputs(); const r = E0.runOccupancy(v, P); if (!r.aboveTarget && (r.extraAgents !== 0 || r.excessAttritionCost !== 0)) return false; } return true; })());
ok("staffing cost is cash: linear in the wage, and zero with no agents to add", (() => { const r1 = E0.runOccupancy(base, P), r2 = E0.runOccupancy({ ...base, hourlyRate: base.hourlyRate * 2 }, P); return close(r2.staffingCost, 2 * r1.staffingCost) && E0.runOccupancy({ ...base, agents: 400 }, P).staffingCost === 0; })());
ok("an overloaded queue is critical and carries the critical multiplier", (() => { const r = E0.runOccupancy({ ...base, agents: 10 }, P); return r.overloaded && r.band === "critical" && r.curMult === P.mult.critical && r.idleMin === 0; })());
ok("the multiplier is never below 1, and attrition never below what you entered", (() => { for (let i = 0; i < 3000; i++) { const r = E0.runOccupancy(randomInputs(), P); if (r.curMult < 1 || r.ladder.some((l) => l.mult < 1)) return false; } return true; })());
ok("the bands are the platform's shared occupancy bands", P.bands === BENCH.occupancy && E0.occBand(0.85, P.bands) === "healthy" && E0.occBand(0.851, P.bands) === "caution" && E0.occBand(0.9, P.bands) === "caution" && E0.occBand(0.901, P.bands) === "critical");
ok("no output is NaN or infinite anywhere in the guarded domain", (() => { const edge = [{ ...base, callsPerHour: 0 }, { ...base, agents: 1, callsPerHour: 1000000, aht: 36000 }, { ...base, attritionRate: 0, hiringCost: 0, trainingWeeks: 0, hourlyRate: 0 }, { ...base, target: 50 }, { ...base, target: 99 }]; return edge.every((v) => { const r = E0.runOccupancy(v, P); return JSON.stringify(r).match(/null|NaN|Infinity/) === null && r.ladder.every((l) => Number.isFinite(l.turnoverCost)); }); })());

section("4. The worked example on the method page reconciles to the dollar");
const X = E0.runOccupancy(base, P);
ok("workload 44.0 Erlangs, occupancy 88.0%, caution band", X.intensity.toFixed(1) === "44.0" && (X.occ * 100).toFixed(1) === "88.0" && X.band === "caution");
ok("52 agents at 85%, 2 to add", X.agentsAtTarget === 52 && X.extraAgents === 2);
ok("replacement cost $12,924", Math.round(X.replacementCost) === 12924);
ok("staffing cost $111,351 a year", Math.round(X.staffingCost) === 111351);
ok("attrition cost of today's occupancy $33,926 a year", Math.round(X.excessAttritionCost) === 33926);

section("5. Registry and retired claims");
const TOOL = readFileSync("./OccupancyRiskSimulator.jsx", "utf8");
ok("four Occupancy constants are registered, every one labelled", benchmarksForTool("occupancy-risk").length === 4 && benchmarksForTool("occupancy-risk").every((e) => e.kind === "heuristic" && /Not sourced/.test(e.source)));
ok("the tool reads every constant from the registry and holds no literal of its own", /benchmark\("occ\.attrition\.mult\.caution"\)/.test(TOOL) && /benchmark\("load\.benefits"\)/.test(TOOL) && /benchmark\("market\.wage\.agent"\)/.test(TOOL) && !/\b(0\.15|1\.15|1\.4|2080|1\.3)\b/.test(TOOL));
ok("the invented 0.15 attrition formula is gone", !/\* 0\.15 \*/.test(TOOL));
ok("the unsourced claims are gone", !/82-86|15-40%|within 6 months|It usually is|usually is\./.test(TOOL));
ok("the unused tenure input is gone", !/avgTenure/.test(TOOL));
ok("the tool links the published method", /\/methodology\/occupancy-risk/.test(TOOL));
ok("no dash in the engine or the tool", !DASH.test(SRC) && !DASH.test(TOOL));

section("6. Mutants are caught");
const mutants = [
  ["replacement cost drops the ramp", "const replacementCost = v.hiringCost + rampWages;", "const replacementCost = v.hiringCost;", (X2) => Math.round(X2.runOccupancy(base, P).replacementCost) !== 12924],
  ["staffing cost drops the load", "extraAgents * v.hourlyRate * P.hoursYear * P.load", "extraAgents * v.hourlyRate * P.hoursYear", (X2) => Math.round(X2.runOccupancy(base, P).staffingCost) !== 111351],
  ["the caution band boundary moves", "occ > B.healthyMax ? \"caution\"", "occ >= B.healthyMax ? \"caution\"", (X2) => X2.occBand(0.85, P.bands) !== "healthy"],
  ["an overloaded queue is treated as healthy", "const curMult = overloaded ? M.critical : occMultiplier(occ, B, M);", "const curMult = occMultiplier(Math.min(occ, 0.5), B, M);", (X2) => X2.runOccupancy({ ...base, agents: 10 }, P).curMult !== P.mult.critical],
];
for (const [name, from, to, killed] of mutants) {
  ok(`mutant present in source: ${name}`, BODY.includes(from));
  ok(`mutant caught: ${name}`, killed(load(BODY.replace(from, to))));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
