/* adherence.test.mjs
 *
 * The Schedule Adherence engine (src/lib/adherence.js). Sliced from its markers and equal to
 * the module; Erlang C pinned to published table values and to an independent direct-sum
 * oracle; agents needed for the target equal the Staffing Calculator's solver; service level
 * and speed of answer proven identical to the previous tool on thousands of cases, so only
 * the intended changes moved (the stepped abandonment heuristic is retired; overtime prices
 * the agents needed to hold the target instead of every missing agent for a full shift).
 */
import { readFileSync } from "node:fs";
import * as E0 from "./src/lib/adherence.js";
import { benchmark, BENCHMARK_SOURCES } from "./src/lib/benchmarks.js";

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
const DASH = new RegExp("[" + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + "]");
let seed = 20260928;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const close = (a, b, e = 1e-9) => (a === null || b === null ? a === b : Math.abs(a - b) <= e * Math.max(1, Math.abs(a), Math.abs(b)));
const randomInputs = () => {
  const agents = 5 + Math.floor(rnd() * 300), aht = 60 + Math.floor(rnd() * 840);
  const load = agents * (0.4 + rnd() * 0.65);
  return { agents, currentAdherence: 70 + Math.floor(rnd() * 31), callsPerHour: Math.round((load * 3600) / aht), aht, slaTarget: 50 + Math.floor(rnd() * 46), slaTime: [10, 20, 30, 60][Math.floor(rnd() * 4)], hourlyRate: 12 + rnd() * 30, otMultiplier: 1.5, hoursPerDay: 1 + Math.floor(rnd() * 24), daysPerYear: 200 + Math.floor(rnd() * 166) };
};
const base = { agents: 100, currentAdherence: 92, callsPerHour: 820, aht: 360, slaTarget: 80, slaTime: 20, hourlyRate: 20.59, otMultiplier: 1.5, hoursPerDay: 8, daysPerYear: 250 };

section("0. The engine is sliced live and matches the module");
const SRC = readFileSync("./src/lib/adherence.js", "utf8");
const a = SRC.indexOf("/* @engine-start */"), b = SRC.indexOf("/* @engine-end */");
ok("engine markers present, in order", a > 0 && b > a);
const BODY = SRC.slice(a, b);
const load = (body) => new Function(body + "\nreturn { ADH_DROPS, erlangC, serviceLevel, asa, requiredOnQueue, runAdherence };")();
const E = load(BODY);
ok("the slice has no import, JSX, DOM access, abandonment step or wage of its own", !/import |<[A-Z]|window\.|document\.|abandon|20\.59|\b1\.5\b|\b250\b/.test(BODY.replace(/\/\*[\s\S]*?\*\//g, "")));
let same = true;
for (let i = 0; i < 3000; i++) { const v = randomInputs(); if (JSON.stringify(E.runAdherence(v)) !== JSON.stringify(E0.runAdherence(v))) same = false; }
ok("3,000 random cases: the sliced engine equals the module", same);

section("1. Erlang C against published tables and an independent oracle");
ok("10 Erlangs on 11 to 14 agents: 0.6821, 0.4494, 0.2853, 0.1741, as in published Erlang C tables", [[11, "0.6821"], [12, "0.4494"], [13, "0.2853"], [14, "0.1741"]].every(([n, x]) => E0.erlangC(n, 10).toFixed(4) === x));
ok("two agents, one Erlang: C = 1/3 exactly (the value the pre-floor tool printed as 1/6)", close(E0.erlangC(2, 1), 1 / 3));
const direct = (N, A) => { let s = 0, t = 1; for (let k = 0; k < N; k++) { if (k) t *= A / k; s += t; } const top = t * (A / N) * (N / (N - A)); return top / (s + top); };
ok("Erlang C equals the direct sum formula on 5,000 small cases", (() => { for (let i = 0; i < 5000; i++) { const N = 1 + Math.floor(rnd() * 60), A = rnd() * N * 0.99; if (!close(E0.erlangC(N, A), direct(N, A), 1e-9)) return false; } return true; })());
ok("service level and speed of answer follow from C by their formulas", (() => { for (let i = 0; i < 3000; i++) { const N = 2 + Math.floor(rnd() * 200), A = rnd() * N * 0.98, t = 20, h = 300; const C = E0.erlangC(N, A); if (!close(E0.serviceLevel(N, A, t, h), Math.max(0, Math.min(1, 1 - C * Math.exp(-(N - A) * t / h)))) || !close(E0.asa(N, A, h), C * h / (N - A))) return false; } return true; })());
ok("an overloaded queue: service level 0 and no speed of answer", E0.serviceLevel(82, 82, 20, 360) === 0 && E0.asa(80, 82, 360) === null);

section("2. Agents needed for the target equal the Staffing Calculator's solver");
const SS = readFileSync("./StaffingCalculator.jsx", "utf8");
const i0 = SS.indexOf("function erlangB("), i1 = SS.indexOf("function buildInsights(", i0);
const ST = new Function("benchmark", `${SS.slice(i0, i1)}\nreturn { calc };`)(benchmark);
/* Staffing's search once started at ceil(A) + 1 and skipped floor(A) + 1 on a fractional
   load, answering one agent more (4 of 3,000 queues). Fixed in the rail step; the count of
   such cases must now be zero. */
let agree = true, badS = null, skipped = 0;
for (let i = 0; i < 3000; i++) {
  const v = randomInputs(); const A = v.callsPerHour * v.aht / 3600; if (A <= 0) continue;
  const mine = E0.requiredOnQueue(A, v.slaTarget / 100, v.slaTime, v.aht), theirs = ST.calc(v.callsPerHour, v.aht, 60, v.slaTarget / 100, v.slaTime, 0, 0);
  const explained = mine === Math.floor(A) + 1 && Math.ceil(A) + 1 === mine + 1 && theirs.raw === mine + 1;
  if (explained) skipped++;
  if (!theirs.met || (mine !== theirs.raw && !explained)) { agree = false; badS = badS || { A, mine, theirs: theirs.raw }; }
}
ok(`3,000 queues: the fewest agents meeting the target equal Staffing's at the same inputs, with no exception since Staffing's search starts at floor(A) + 1${badS ? " " + JSON.stringify(badS) : ""}`, agree && skipped === 0);
ok("the solver is the fewest: one agent fewer misses the target", (() => { for (let i = 0; i < 2000; i++) { const v = randomInputs(); const A = v.callsPerHour * v.aht / 3600, t = v.slaTarget / 100; const n = E0.requiredOnQueue(A, t, v.slaTime, v.aht); if (n === null || E0.serviceLevel(n, A, v.slaTime, v.aht) < t || (n - 1 > A && E0.serviceLevel(n - 1, A, v.slaTime, v.aht) >= t)) return false; } return true; })());
ok("a million calls an hour at ten minutes solves in under two seconds and stays finite", (() => { const t = Date.now(); const n = E0.requiredOnQueue(1000000 * 600 / 3600, 0.8, 20, 600); return Number.isFinite(n) && Date.now() - t < 2000; })());

section("3. Behavior neutral where no change was intended: A/B against the previous tool");
/* The previous tool's lines, frozen from ScheduleAdherenceCalculator.jsx at 6e63e28 so the
   check runs on a shallow CI checkout. */
const LEGACY = [
  "    return Math.max(0, Math.min(1, 1 - pW * Math.exp(-(N - A) * targetSec / ahtSec)));",
  "    return (pW * ahtSec) / (N - A);",
  "    const effectiveAgents = Math.round(v.agents * (adhPct / 100));",
  "    const abandonPct = asaVal > 120 ? 15 : asaVal > 60 ? 8 : asaVal > 30 ? 4 : asaVal > 15 ? 2 : 1;",
  "    const dailyOTHours = agentsLost * 8; // full shift equivalent",
  "    const annualOTCost = dailyOTCost * 250;",
].join("\n");
ok("the previous tool stepped abandonment on speed of answer and priced every missing agent for a full shift", /asaVal > 120 \? 15/.test(LEGACY) && /agentsLost \* 8/.test(LEGACY) && /\* 250/.test(LEGACY));
let ab = true;
for (let i = 0; i < 10000; i++) {
  const v = randomInputs(); const r = E0.runAdherence(v); const A = v.callsPerHour * v.aht / 3600;
  for (const row of r.rows) {
    const adhPct = Math.max(0, v.currentAdherence - row.drop), eff = Math.round(v.agents * (adhPct / 100));
    const N = Math.floor(eff), pW = E0.erlangC(eff, A);
    const oldSL = N <= A ? 0 : Math.max(0, Math.min(1, 1 - pW * Math.exp(-(N - A) * v.slaTime / v.aht)));
    const oldASA = N <= A ? 999 : (pW * v.aht) / (N - A);
    if (row.onQueue !== eff || !close(row.sl, oldSL) || (oldASA === 999 ? row.asa !== null : !close(row.asa, oldASA))) ab = false;
  }
}
ok("10,000 cases, every row: agents on the queue, service level and speed of answer equal the previous tool", ab);

section("4. The laws");
ok("more adherence never lowers service level; more calls never lower agents needed", (() => { for (let i = 0; i < 2000; i++) { const v = randomInputs(); const r = E0.runAdherence(v); for (let j = 1; j < r.rows.length; j++) if (r.rows[j].sl > r.rows[j - 1].sl + 1e-12) return false; const A = v.callsPerHour * v.aht / 3600; if (E0.requiredOnQueue(A * 1.1, 0.8, 20, v.aht) < E0.requiredOnQueue(A, 0.8, 20, v.aht)) return false; } return true; })());
ok("to schedule is the fewest agents whose adherence share covers the need", (() => { for (let i = 0; i < 2000; i++) { const r = E0.runAdherence(randomInputs()); for (const row of r.rows) { if (row.toSchedule === null) continue; const cover = (n) => n * row.adh / 100 >= r.need - 1e-9; if (!cover(row.toSchedule) || cover(row.toSchedule - 1)) return false; } } return true; })());
ok("no overtime while the roster covers the target; overtime is cash, linear in the rate, hours and days", (() => { const r = E0.runAdherence(base), r2 = E0.runAdherence({ ...base, hourlyRate: base.hourlyRate * 2, hoursPerDay: 16 }); return r.rows[0].otCost === 0 && close(r2.rows[3].otCost, 4 * r.rows[3].otCost) && E0.runAdherence({ ...base, agents: 200 }).rows.every((x) => x.otCost === 0); })());
ok("added cost is measured from today, so today adds nothing", E0.runAdherence(base).rows[0].addedCost === 0);
ok("no calls: nothing needed, service level full, no overtime", (() => { const r = E0.runAdherence({ ...base, callsPerHour: 0 }); return r.need === 0 && r.rows.every((x) => x.sl === 1 && x.otCost === 0); })());
ok("no output is NaN or infinite at the domain edges", [{ ...base, agents: 1, callsPerHour: 1000000, aht: 36000 }, { ...base, currentAdherence: 1 }, { ...base, slaTarget: 99, slaTime: 1 }].every((v) => !/NaN|Infinity/.test(JSON.stringify(E0.runAdherence(v)))));

section("5. The worked example on the method page reconciles to the dollar");
const X = E0.runAdherence(base);
ok("82 Erlangs; today 92 on the queue, 88.5% within 20 seconds, 7s speed of answer", X.A === 82 && X.base.onQueue === 92 && (X.base.sl * 100).toFixed(1) === "88.5" && Math.round(X.base.asa) === 7);
ok("90 agents on the queue meet the target", X.need === 90);
ok("the first miss is at 89% adherence, 76.7%", X.firstMiss.adh === 89 && (X.firstMiss.sl * 100).toFixed(1) === "76.7");
ok("holding the target at 89% schedules 102, 2 beyond the roster, $123,540 a year", X.firstMiss.toSchedule === 102 && X.firstMiss.extra === 2 && Math.round(X.firstMiss.otCost) === 123540);

section("6. Registry and retired claims");
const TOOL = readFileSync("./ScheduleAdherenceCalculator.jsx", "utf8");
ok("the overtime multiplier is registered as a market fact cited to the FLSA", BENCHMARK_SOURCES["adh.ot.multiplier"].kind === "market" && /29 U\.S\.C\. 207/.test(BENCHMARK_SOURCES["adh.ot.multiplier"].source));
ok("the tool reads the multiplier and the wage from the registry and holds no literal", /benchmark\("adh\.ot\.multiplier"\)/.test(TOOL) && /benchmark\("market\.wage\.agent"\)/.test(TOOL) && !/hourlyRate: 18|otMultiplier: 1\.5/.test(TOOL));
ok("the stepped abandonment and the full-shift overtime are gone", !/abandonPct|Est\. Abandon|full shift|agentsLost \* 8|\* 250\b/.test(TOOL));
ok("no colour line 5 points under the target", !/slaTarget - 5|slColor|500000/.test(TOOL));
ok("the tool links the published method", /\/methodology\/schedule-adherence/.test(TOOL));
ok("no dash in the engine, the tool or the method", !DASH.test(SRC) && !DASH.test(TOOL) && !DASH.test(readFileSync("./src/lib/rubrics/adherenceModel.js", "utf8")));

section("7. Mutants are caught");
const mutants = [
  ["Erlang C drops the 1/(1 - rho) factor", "return Math.max(0, Math.min(1, (N * B) / (N - A * (1 - B))));", "return Math.max(0, Math.min(1, B));", (X2) => X2.erlangC(2, 1).toFixed(4) !== "0.3333"],
  ["the schedule multiplies by adherence", "Math.ceil((need * 100) / adh - 1e-9)", "Math.ceil((need * adh) / 100 - 1e-9)", (X2) => X2.runAdherence(base).firstMiss.toSchedule !== 102],
  ["overtime drops the multiplier", "const otRate = v.hourlyRate * v.otMultiplier;", "const otRate = v.hourlyRate;", (X2) => Math.round(X2.runAdherence(base).firstMiss.otCost) !== 123540],
  ["the solver stops one short", "if (sl >= target) return n;", "if (sl >= target) return n - 1;", (X2) => X2.runAdherence(base).need !== 90],
];
for (const [name, from, to, killed] of mutants) {
  ok(`mutant present in source: ${name}`, BODY.includes(from));
  ok(`mutant caught: ${name}`, killed(load(BODY.replace(from, to))));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
