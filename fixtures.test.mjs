/* fixtures.test.mjs
 *
 * Phase E2: reference fixtures. Every case in src/lib/fixtures.js has an answer known outside
 * this site. This harness computes each with the shipped engine (the module, or the region
 * sliced from the tool file exactly as the tool's own harness does) and fails when the answer
 * printed on the method page differs from what the engine gives. It also checks each fixture
 * against an independent oracle where one exists, and that every fixture is shown on a page.
 */
import { readFileSync } from "node:fs";
const { FIXTURES, FIXTURE_KIND, fixturesFor } = await import("./src/lib/fixtures.js");
const { RUBRICS } = await import("./src/lib/rubrics/index.js");
const { BENCH, benchmark } = await import("./src/lib/benchmarks.js");
const conf = await import("./src/lib/confidence.js");
const { createGuards } = await import("./src/lib/guards.js");
const ADH = await import("./src/lib/adherence.js");
const QA = await import("./src/lib/qa.js");
const { runForecast } = await import("./src/lib/forecast.js");

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => { if (cond) pass++; else { fail++; console.log("  FAIL:", name, detail); } };
const F = Object.fromEntries(FIXTURES.map((f) => [f.id, f]));
const DASH = new RegExp("[" + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + "]");

console.log("\n1. The fixture set");
ok("every fixture has a kind, a case, a result, a source and at least one published method", FIXTURES.every((f) => FIXTURE_KIND[f.kind] && f.case && f.expected && f.source && f.methods.length && f.methods.every((m) => RUBRICS[m])));
ok("every fixture is shown on the page of each method it names", FIXTURES.every((f) => f.methods.every((m) => fixturesFor(m).includes(f))));
ok("ids are unique", new Set(FIXTURES.map((f) => f.id)).size === FIXTURES.length);
ok("no dash in any fixture", !DASH.test(JSON.stringify(FIXTURES)));
const PAGE = readFileSync("./RubricPage.jsx", "utf8");
ok("the calculator and QA method pages render the fixtures", (PAGE.match(/fixturesFor\(r\.id\)/g) || []).length >= 2);

/* Staffing's engine, sliced as methods.test.mjs slices it. */
const SS = readFileSync("./StaffingCalculator.jsx", "utf8");
const ST = new Function("benchmark", "BENCH", "emitGrades", "voidResult", "isVoid", "railEvidence", "weakerStream", "createGuards",
  SS.slice(SS.indexOf("function erlangB("), SS.indexOf("const S = ({ label")) + "\nreturn { calc, erlangC };")(benchmark, BENCH, conf.emitGrades, conf.voidResult, conf.isVoid, conf.railEvidence, conf.weakerStream, createGuards);

/* An independent oracle: Erlang C by its closed form with factorials, no recurrence. */
const fact = (k) => { let x = 1; for (let i = 2; i <= k; i++) x *= i; return x; };
const erlangCDirect = (N, A) => { const top = (A ** N / fact(N)) * (N / (N - A)); let sum = 0; for (let k = 0; k < N; k++) sum += A ** k / fact(k); return top / (sum + top); };

console.log("\n2. Erlang C");
{
  const want = F["erlang-c-table"].expected.match(/0\.\d{4}/g);
  const ns = [11, 12, 13, 14];
  ok("table: the Schedule Adherence engine gives the published values", ns.every((n, i) => ADH.erlangC(n, 10).toFixed(4) === want[i]));
  ok("table: the Staffing engine gives the published values", ns.every((n, i) => ST.erlangC(n, 10).toFixed(4) === want[i]));
  ok("table: the independent factorial oracle agrees", ns.every((n, i) => erlangCDirect(n, 10).toFixed(4) === want[i]));
  const h = F["erlang-c-hand"].expected;
  ok("by hand: 1 Erlang on 2 agents is one third in both engines and the oracle", ADH.erlangC(2, 1).toFixed(4) === h && ST.erlangC(2, 1).toFixed(4) === h && erlangCDirect(2, 1).toFixed(4) === h);
  const t = ST.calc(100, 180, 30, 0.8, 20, 0, null);
  ok("80/20 at 10 Erlangs: Staffing needs the tabled 14 agents", F["erlang-c-80-20"].expected === `${t.raw} agents` && t.A === 10, `${t.raw}`);
  ok("80/20 at 10 Erlangs: Schedule Adherence's solver agrees", ADH.requiredOnQueue(10, 0.8, 20, 180) === 14);
  const x = ST.calc(400, 257, 30, 0.8, 20, 0.3, 0.85);
  ok("Nextiva: 68 agents, 98 FTE, 84.0% occupancy", F["nextiva-erlang"].expected === `${x.raw} agents, ${x.sched} FTE, ${(x.occ * 100).toFixed(1)}% occupancy`, `${x.raw} ${x.sched} ${x.occ}`);
}

console.log("\n3. Krippendorff's alpha");
{
  const X = null;
  const K = [[1, 2, 3, 3, 2, 1, 4, 1, 2, X, X, X], [1, 2, 3, 3, 2, 2, 4, 1, 2, 5, X, 3], [X, 3, 3, 3, 2, 3, 4, 2, 2, 5, 1, X], [1, 2, 3, 3, 2, 4, 4, 1, 2, 5, 1, X]];
  const U = K[0].map((_, i) => K.map((o) => o[i]).filter((v) => v !== null));
  const got = `nominal alpha ${QA.krippendorffAlpha(U, "nominal").toFixed(3)}, interval alpha ${QA.krippendorffAlpha(U, "interval").toFixed(3)}`;
  ok("the QA engine reproduces the published example", F["krippendorff-2011"].expected === got, got);
  ok("the data are the source's four observers and twelve units", K.length === 4 && K.every((o) => o.length === 12));
}

console.log("\n4. WAPE");
{
  const R = runForecast([{ interval: "1", forecast: 100, actual: 120 }, { interval: "2", forecast: 100, actual: 80 }], { tsLimit: benchmark("forecast.ts.limit"), intervalMin: 30 }, 0);
  const got = `interval accuracy ${(R.intervalAccuracy * 100).toFixed(1)}%, total-volume accuracy ${(R.totalAccuracy * 100).toFixed(1)}%`;
  ok("the forecast engine gives the worked answer", F["wape-cancel"].expected === got, got);
}

console.log("\n5. The tracker fixture");
{
  const { MECH, MECH_ORDER, MECH_FALLBACK } = await import("./src/lib/mech.js");
  const SRC = readFileSync("./BusinessCaseBuilder.jsx", "utf8");
  const sl = (a, b) => { const i = SRC.indexOf(a); return SRC.slice(i, SRC.indexOf(b, i)); };
  const E = new Function("MECH", "MECH_ORDER", "MECH_FALLBACK", "createGuards", "emitGrades", "voidResult", "weakerStream", "realizationFromCred", "GRADE_RANK", "benchmark",
    sl("const STATUS = {", "function LogoMark") + "\n" + sl("const STANCE = {", "/* De-overlapped model") + "\n" + sl("function computeCase(", "export default function") + "\nreturn { computeCase, DEFAULTS };")(MECH, MECH_ORDER, MECH_FALLBACK, createGuards, conf.emitGrades, conf.voidResult, conf.weakerStream, conf.realizationFromCred, conf.GRADE_RANK, benchmark);
  const r = E.computeCase(E.DEFAULTS, "expected", true, "none");
  const got = `net $${Math.round(r.net).toLocaleString("en-US")} a year, three-year cost $${r.tco3.toLocaleString("en-US")}`;
  ok("the Business Case engine reproduces the tracker fixture at its opening case", F["bcb-tracker"].expected === got, got);
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
