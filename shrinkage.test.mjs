/* shrinkage.test.mjs
 *
 * The Shrinkage engine (src/lib/shrinkage.js). Sliced from its markers and equal to the
 * module; every output equals an independent oracle; the total and the agents on the queue
 * are proven identical to the previous tool on thousands of cases, so only the intended
 * changes moved (PTO counted as planned, a gross-up to schedule against a need, paid time
 * off the queue priced at the loaded rate and never called a cost of a gap). Every constant
 * is registered; the retired claims stay dead.
 */
import { readFileSync } from "node:fs";
import * as E0 from "./src/lib/shrinkage.js";
import { BENCH, benchmark } from "./src/lib/benchmarks.js";

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
const DASH = new RegExp("[" + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + "]");
let seed = 20260925;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const close = (a, b, e = 1e-9) => Math.abs(a - b) <= e * Math.max(1, Math.abs(a), Math.abs(b));
const P = { range: { low: benchmark("shrinkage.range.low"), high: benchmark("shrinkage.range.high") }, load: benchmark("load.benefits"), hoursYear: benchmark("time.hours.year"), maxTotal: 99 };
const KEYS = ["breaks", "coaching", "training", "meetings", "pto", "systemDown", "absenteeism", "lateAdherence"];
const PLANNED = ["breaks", "coaching", "training", "meetings", "pto"];
const randomInputs = (wide = false) => {
  const v = { agents: 1 + Math.floor(rnd() * 2000), needed: Math.floor(rnd() * 1500), hourlyRate: 10 + rnd() * 40 };
  for (const k of KEYS) v[k] = Math.round(rnd() * (wide ? 40 : 10) * 10) / 10;
  return v;
};
const base = { agents: 200, needed: 140, hourlyRate: 20.59, breaks: 8, coaching: 3, training: 4, meetings: 2, pto: 8, systemDown: 1, absenteeism: 5, lateAdherence: 2 };

section("0. The engine is sliced live and matches the module");
const SRC = readFileSync("./src/lib/shrinkage.js", "utf8");
const a = SRC.indexOf("/* @engine-start */"), b = SRC.indexOf("/* @engine-end */");
ok("engine markers present, in order", a > 0 && b > a);
const BODY = SRC.slice(a, b);
const load = (body) => new Function(body + "\nreturn { SHRINK_PLANNED, SHRINK_UNPLANNED, shrinkPosition, runShrinkage };")();
const E = load(BODY);
ok("the slice has no import, JSX, DOM access or registry constant of its own", !/import |<[A-Z]|window\.|document\.|2080|1\.3\b|0\.28|0\.35|20\.59/.test(BODY));
let same = true;
for (let i = 0; i < 5000; i++) { const v = randomInputs(i % 2 === 0); if (JSON.stringify(E.runShrinkage(v, P)) !== JSON.stringify(E0.runShrinkage(v, P))) same = false; }
ok("5,000 random cases: the sliced engine equals the module", same);

section("1. Every output against an independent oracle");
let oSame = true, bad = null;
const hv = (v) => v.hourlyRate * 2080 * 1.3;
for (let i = 0; i < 20000; i++) {
  const v = randomInputs(i % 3 === 0); const r = E0.runShrinkage(v, P);
  const t6 = (x) => Math.round(x * 1e6) / 1e6;
  const planned = t6(PLANNED.reduce((s, k) => s + v[k], 0)), raw = t6(KEYS.reduce((s, k) => s + v[k], 0));
  const total = Math.min(raw, 99), s = total / 100, sc = raw > 0 ? total / raw : 0;
  let sched = 0; while (v.needed > 0 && sched * ((100 - total) / 100) < v.needed - 1e-9) sched++;
  const pos = s > 0.35 ? "above" : s < 0.28 ? "below" : "within";
  const eq = close(r.plannedPct, planned) && close(r.rawPct, raw) && close(r.totalPct, total) && r.capped === raw > 99
    && close(r.onQueue, v.agents * (1 - s)) && r.onQueueRounded === Math.round(v.agents * (100 - total) / 100)
    && close(r.offQueueValue, v.agents * s * hv(v)) && close(r.plannedValue + r.unplannedValue, r.offQueueValue, 1e-7)
    && close(r.plannedValue, v.agents * planned * sc / 100 * hv(v)) && close(r.pointValue, v.agents / 100 * hv(v))
    && r.schedule === sched && r.rosterGap === sched - v.agents && r.position === pos;
  if (!eq) { oSame = false; bad = bad || { v, r: { total: r.totalPct, schedule: r.schedule, sched } }; }
}
ok(`20,000 random cases: every output equals the oracle${bad ? " " + JSON.stringify(bad) : ""}`, oSame);

section("2. Behavior neutral where no change was intended: A/B against the previous tool");
/* The previous tool's lines, frozen from ShrinkagePlanner.jsx at 34741ab so the check runs on
   a shallow CI checkout. PTO sat in the unplanned list; the total capped at 100; agents
   available were the roster times what was left, rounded; the gap was priced unloaded. */
const LEGACY = [
  "    { name: \"PTO / vacation\", pct: v.pto, type: \"unplanned\" },",
  "  const totalShrinkage = Math.min(100, rawShrinkage);",
  "  const effectiveAgents = Math.round(v.agents * (availablePct / 100));",
  "  const annualCost = gap * v.hourlyRate * 2080;",
].join("\n");
ok("the previous tool filed PTO as unplanned and priced the gap unloaded", /PTO \/ vacation", pct: v\.pto, type: "unplanned"/.test(LEGACY) && /gap \* v\.hourlyRate \* 2080/.test(LEGACY));
let ab = true, noise = 0;
for (let i = 0; i < 10000; i++) {
  const v = randomInputs(i % 2 === 0); const r = E0.runShrinkage(v, P);
  const oldPlanned = v.breaks + v.coaching + v.training + v.meetings, oldUnplanned = v.pto + v.systemDown + v.absenteeism + v.lateAdherence;
  const oldTotal = Math.min(100, oldPlanned + oldUnplanned);
  if (oldPlanned + oldUnplanned > 99) continue;
  const effectiveAgents = Math.round(v.agents * ((100 - oldTotal) / 100));
  /* The previous tool carried float noise in its sum (46.800000000000004) and its product
     (1,355 × 0.7 = 948.4999...), so an exact half agent could round down. Such a case is the
     only difference allowed: the true value sits on a half and the new engine rounds it. */
  const trueOnQueue = v.agents * (100 - r.totalPct) / 100;
  const explained = r.onQueueRounded !== effectiveAgents && Math.abs(trueOnQueue - Math.floor(trueOnQueue) - 0.5) < 1e-9 && r.onQueueRounded === Math.round(trueOnQueue);
  if (explained) noise++;
  if (!close(r.totalPct, oldTotal) || (r.onQueueRounded !== effectiveAgents && !explained) || !close(r.plannedPct, oldPlanned + v.pto) || !close(r.unplannedPct, oldUnplanned - v.pto)) ab = false;
}
ok(`10,000 cases below the cap: the total and agents on the queue equal the previous tool; planned and unplanned differ by PTO alone (${noise} exact half-agent cases the previous tool's float noise rounded down are the only differences)`, ab && noise < 50);

section("3. The laws");
const R0 = E0.runShrinkage(base, P);
ok("more shrinkage in any category never raises agents on the queue nor lowers agents to schedule", (() => { for (let i = 0; i < 3000; i++) { const v = randomInputs(); const k = KEYS[i % KEYS.length]; const r1 = E0.runShrinkage(v, P), r2 = E0.runShrinkage({ ...v, [k]: v[k] + 1 }, P); if (r2.onQueue > r1.onQueue + 1e-9 || r2.schedule < r1.schedule) return false; } return true; })());
ok("the schedule is the fewest agents that keep the need on the queue", (() => { for (let i = 0; i < 3000; i++) { const v = randomInputs(true); const r = E0.runShrinkage(v, P); if (v.needed > 0 && (r.schedule * r.avail < v.needed - 1e-9 || (r.schedule - 1) * r.avail >= v.needed - 1e-9)) return false; } return true; })());
ok("the gross-up divides: at 33% shrinkage 140 needs 209, where multiplying by 1.33 would give 187", R0.schedule === 209 && Math.ceil(140 * 1.33) === 187);
ok("paid time off the queue is linear in the wage and zero with no shrinkage", (() => { const r2 = E0.runShrinkage({ ...base, hourlyRate: base.hourlyRate * 2 }, P); const z = E0.runShrinkage({ ...base, ...Object.fromEntries(KEYS.map((k) => [k, 0])) }, P); return close(r2.offQueueValue, 2 * R0.offQueueValue) && z.offQueueValue === 0 && z.schedule === 140 && z.onQueue === 200; })());
ok("a sum above 99% is capped at 99% and flagged; nothing is NaN or infinite", (() => { const r = E0.runShrinkage({ ...base, breaks: 100, pto: 100 }, P); return r.capped && r.totalPct === 99 && Number.isFinite(r.schedule) && !/NaN|Infinity|null/.test(JSON.stringify(r)); })());
ok("the order of addition never moves the total across a line: 35 in any order is within the range", (() => { const v = { ...base, breaks: 9, coaching: 2.5, training: 2.8, meetings: 5.5, pto: 8.9, systemDown: 3.1, absenteeism: 2, lateAdherence: 1.2 }; const r = E0.runShrinkage(v, P); return r.totalPct === 35 && r.position === "within" && [9, 2.5, 2.8, 5.5, 8.9, 3.1, 2, 1.2].reduce((x, y) => x + y, 0) !== 35; })());
ok("no need entered schedules nobody", E0.runShrinkage({ ...base, needed: 0 }, P).schedule === 0);
ok("the position is a fact against the range: 28% and 35% are within, just outside is not", E0.shrinkPosition(0.28, P.range) === "within" && E0.shrinkPosition(0.35, P.range) === "within" && E0.shrinkPosition(0.279, P.range) === "below" && E0.shrinkPosition(0.351, P.range) === "above");
ok("PTO is planned; system downtime, absenteeism and adherence are unplanned", E0.SHRINK_PLANNED.some(([k]) => k === "pto") && E0.SHRINK_UNPLANNED.map(([k]) => k).join() === "systemDown,absenteeism,lateAdherence");

section("4. The worked example on the method page reconciles to the dollar");
ok("33% total, 25% planned, 8% unplanned", R0.totalPct === 33 && R0.plannedPct === 25 && R0.unplannedPct === 8);
ok("134 agents on the queue; 209 to schedule for 140, 9 above the roster", R0.onQueueRounded === 134 && R0.schedule === 209 && R0.rosterGap === 9);
ok("paid time off the queue $3,674,574 a year: $2,783,768 planned, $890,806 unplanned", Math.round(R0.offQueueValue) === 3674574 && Math.round(R0.plannedValue) === 2783768 && Math.round(R0.unplannedValue) === 890806);
ok("one point of shrinkage: 2 agents, $111,351 a year", R0.pointAgents === 2 && Math.round(R0.pointValue) === 111351);

section("5. Registry and retired claims");
const TOOL = readFileSync("./ShrinkagePlanner.jsx", "utf8");
ok("the planning range is one shared entry, equal to the Staffing flag's range", benchmark("shrinkage.range.low") === BENCH.shrinkage.typicalLow && benchmark("shrinkage.range.high") === BENCH.shrinkage.typicalHigh && benchmark("shrinkage.range.low") === 0.28 && benchmark("shrinkage.range.high") === 0.35);
ok("the tool reads every constant from the registry and holds no literal of its own", /benchmark\("shrinkage\.range\.low"\)/.test(TOOL) && /benchmark\("load\.benefits"\)/.test(TOOL) && /benchmark\("time\.hours\.year"\)/.test(TOOL) && /benchmark\("market\.wage\.agent"\)/.test(TOOL) && !/\b(2080|1\.3|1\.30|0\.28|0\.35|20\.59)\b|hourlyRate: 18/.test(TOOL));
ok("the unsourced claims are gone", !/Industry benchmark|28-35%|highest-ROI|Well managed|Above industry norm|Within range|typically runs/.test(TOOL));
ok("paid time off the queue is never called a cost of a gap", !/Annual Cost of Gap|Staffing Gap|Agents lost to shrinkage|Annual cost impact/i.test(TOOL));
ok("the Staffing flag names the range as a labelled planning range", !/above the typical/.test(readFileSync("./StaffingCalculator.jsx", "utf8")) && !/the typical \$\{/.test(readFileSync("./src/lib/benchmarks.js", "utf8")));
ok("the tool links the published method", /\/methodology\/shrinkage-planner/.test(TOOL));
ok("no dash in the engine, the tool or the method", !DASH.test(SRC) && !DASH.test(TOOL) && !DASH.test(readFileSync("./src/lib/rubrics/shrinkageModel.js", "utf8")));

section("6. Mutants are caught");
const mutants = [
  ["the gross-up multiplies", "Math.ceil(v.needed / avail - 1e-9)", "Math.ceil(v.needed * (1 + s) - 1e-9)", (X2) => X2.runShrinkage(base, P).schedule !== 209],
  ["the value drops the load", "v.hourlyRate * P.hoursYear * P.load", "v.hourlyRate * P.hoursYear", (X2) => Math.round(X2.runShrinkage(base, P).offQueueValue) !== 3674574],
  ["PTO goes back to unplanned", "  [\"pto\", \"PTO and vacation\"],\n];", "];", (X2) => X2.runShrinkage(base, P).plannedPct !== 25],
  ["the cap is lost", "const capped = rawPct > P.maxTotal;", "const capped = false;", (X2) => X2.runShrinkage({ ...base, breaks: 100 }, P).totalPct > 99],
];
for (const [name, from, to, killed] of mutants) {
  ok(`mutant present in source: ${name}`, BODY.includes(from));
  ok(`mutant caught: ${name}`, killed(load(BODY.replace(from, to))));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
