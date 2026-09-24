/* forecast.test.mjs
 *
 * The Forecast Accuracy engine (src/lib/forecast.js). Sliced from its markers and equal to
 * the module; every output equals an independent oracle; total-volume accuracy, MAPE and
 * bias are proven identical to the previous tool on thousands of whole-contact cases, so only
 * the intended changes moved (WAPE leads; the tracking signal replaces the unsourced 3% bias
 * line; misses rank by contacts; workload hours from an AHT). The one threshold is
 * registered; the retired grades and claims stay dead.
 */
import { readFileSync } from "node:fs";
import * as E0 from "./src/lib/forecast.js";
import { benchmark, BENCHMARK_SOURCES } from "./src/lib/benchmarks.js";

let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) pass++; else { fail++; console.log("  FAIL:", name); } };
const section = (t) => console.log("\n" + t);
const DASH = new RegExp("[" + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + "]");
let seed = 20260927;
const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
const close = (a, b, e = 1e-9) => (a === null || b === null ? a === b : Math.abs(a - b) <= e * Math.max(1, Math.abs(a), Math.abs(b)));
const P = { tsLimit: benchmark("forecast.ts.limit"), intervalMin: 30 };
const randomRows = () => {
  const n = 1 + Math.floor(rnd() * 40), scale = [5, 50, 500][Math.floor(rnd() * 3)];
  return Array.from({ length: n }, (_, i) => { const f = Math.floor(rnd() * scale); const a = rnd() < 0.08 ? 0 : Math.max(0, Math.round(f * (1 + (rnd() - 0.5 + (rnd() < 0.3 ? 0.3 : 0)) * 0.6))); return { interval: "i" + i, forecast: f, actual: a }; });
};
const PAIR = [{ interval: "9:00", forecast: 100, actual: 80 }, { interval: "9:30", forecast: 100, actual: 120 }];

section("0. The engine is sliced live and matches the module");
const SRC = readFileSync("./src/lib/forecast.js", "utf8");
const a = SRC.indexOf("/* @engine-start */"), b = SRC.indexOf("/* @engine-end */");
ok("engine markers present, in order", a > 0 && b > a);
const BODY = SRC.slice(a, b);
const load = (body) => new Function(body + "\nreturn { runForecast };")();
const E = load(BODY);
ok("the slice has no import, JSX, DOM access or threshold of its own", !/import |<[A-Z]|window\.|document\.|\b95\b|\b90\b|\b0\.03\b|\b4\b(?! )|\b30\b/.test(BODY.replace(/\/\*[\s\S]*?\*\//g, "")));
let same = true;
for (let i = 0; i < 5000; i++) { const r = randomRows(), aht = Math.floor(rnd() * 900); if (JSON.stringify(E.runForecast(r, P, aht)) !== JSON.stringify(E0.runForecast(r, P, aht))) same = false; }
ok("5,000 random cases: the sliced engine equals the module", same);

section("1. Every output against an independent oracle");
let oSame = true, bad = null;
for (let i = 0; i < 20000; i++) {
  const rows = randomRows(), aht = rnd() < 0.2 ? 0 : 60 + Math.floor(rnd() * 900); const r = E0.runForecast(rows, P, aht);
  let F = 0, A = 0, abs = 0, sum = 0, under = 0, over = 0, m = 0, mn = 0;
  for (const x of rows) { F += x.forecast; A += x.actual; const e = x.actual - x.forecast; abs += Math.abs(e); sum += e; if (e > 0) under += e; else over -= e; if (x.actual > 0) { m += Math.abs(e) / x.actual; mn++; } }
  const mad = abs / rows.length, ts = mad > 0 ? sum / mad : 0;
  const order = rows.map((x, j) => ({ j, e: x.actual - x.forecast })).filter((x) => x.e !== 0).sort((p, q) => Math.abs(q.e) - Math.abs(p.e) || p.j - q.j).slice(0, 5).map((x) => x.j);
  const eq = r.totalF === F && r.totalA === A && r.absErr === abs && close(r.wape, A > 0 ? abs / A : null) && close(r.intervalAccuracy, A > 0 ? 1 - abs / A : null)
    && close(r.mape, mn ? m / mn : null) && r.mapeExcluded === rows.length - mn && close(r.totalAccuracy, F > 0 ? 1 - Math.abs(A - F) / F : null) && close(r.bias, F > 0 ? (A - F) / F : null)
    && close(r.trackingSignal, ts) && r.lean === (ts > 4 ? "above" : ts < -4 ? "below" : "none")
    && close(r.underHours, under * aht / 3600) && close(r.overHours, over * aht / 3600)
    && r.perInterval.every((x, j) => close(x.agents, aht > 0 ? (rows[j].actual - rows[j].forecast) * aht / 1800 : 0))
    && JSON.stringify(r.worst.map((w) => w.i)) === JSON.stringify(order);
  if (!eq) { oSame = false; bad = bad || { n: rows.length, aht, ts: [r.trackingSignal, ts] }; }
}
ok(`20,000 random cases: every output equals the oracle${bad ? " " + JSON.stringify(bad) : ""}`, oSame);

section("2. Behavior neutral where no change was intended: A/B against the previous tool");
/* The previous tool's lines, frozen from ForecastAccuracyTracker.jsx at 6e77901 so the check
   runs on a shallow CI checkout: its "overall accuracy" was total-volume accuracy; its MAPE
   divided by actual over intervals with actual contacts; its bias was the day's total; its
   worst intervals ranked by percent of forecast; its bias line was an unsourced 3%. */
const LEGACY = [
  "  const overallAccuracy = totalForecast > 0 ? (1 - Math.abs(totalActual - totalForecast) / totalForecast) * 100 : 0;",
  "    ? (rows.filter(r => r.actual > 0).reduce((a, r) => a + Math.abs(r.actual - r.forecast) / Math.max(r.actual, 1), 0) / rows.filter(r => r.actual > 0).length) * 100 : 0;",
  "  const bias = totalForecast > 0 ? ((totalActual - totalForecast) / totalForecast) * 100 : 0;",
  "    const aErr = Math.abs(a.actual - a.forecast) / Math.max(a.forecast, 1);",
  "  const biasLabel = bias > 3 ? \"Under-forecasting (actual > forecast)\" : bias < -3 ? \"Over-forecasting (forecast > actual)\" : \"Well calibrated\";",
].join("\n");
ok("the previous tool headlined total-volume accuracy and ranked by percent of forecast", /1 - Math\.abs\(totalActual - totalForecast\) \/ totalForecast/.test(LEGACY) && /\/ Math\.max\(a\.forecast, 1\)/.test(LEGACY) && /bias > 3/.test(LEGACY));
let ab = true;
for (let i = 0; i < 10000; i++) {
  const rows = randomRows(); const r = E0.runForecast(rows, P, 0);
  const tF = rows.reduce((s, x) => s + x.forecast, 0), tA = rows.reduce((s, x) => s + x.actual, 0);
  const oldOverall = tF > 0 ? (1 - Math.abs(tA - tF) / tF) * 100 : 0;
  const nz = rows.filter((x) => x.actual > 0);
  const oldMape = nz.length > 0 ? (nz.reduce((s, x) => s + Math.abs(x.actual - x.forecast) / Math.max(x.actual, 1), 0) / nz.length) * 100 : 0;
  const oldBias = tF > 0 ? ((tA - tF) / tF) * 100 : 0;
  if (!close((r.totalAccuracy ?? 0) * 100, oldOverall) || !close((r.mape ?? 0) * 100, oldMape) || !close((r.bias ?? 0) * 100, oldBias)) ab = false;
}
ok("10,000 whole-contact cases: total-volume accuracy, MAPE and bias equal the previous tool", ab);
ok("the reason for the change, pinned: a forecast off by 20% every interval scored 99.8% on the old headline; WAPE reads 20.1%", (() => { const base = [18,22,35,52,68,82,95,98,92,88,85,78,72,75,80,85,78,70,62,55,48,42,38,32,28,24,20,16,12,8,5]; const rows = base.map((f, i) => ({ interval: "i" + i, forecast: f, actual: Math.round(f * (i % 2 ? 1.2 : 0.8)) })); const r = E0.runForecast(rows, P, 0); return (r.totalAccuracy * 100).toFixed(1) === "99.8" && (r.wape * 100).toFixed(1) === "20.1"; })());

section("3. The laws");
ok("interval errors never cancel: contacts missed are at least the day's net difference, so interval accuracy never exceeds 1", (() => { for (let i = 0; i < 3000; i++) { const r = E0.runForecast(randomRows(), P, 0); if (r.absErr < Math.abs(r.delta) || (r.intervalAccuracy !== null && r.intervalAccuracy > 1)) return false; } return true; })());
ok("scale free: multiplying every row by 7 leaves WAPE, MAPE, bias and the tracking signal unchanged", (() => { for (let i = 0; i < 2000; i++) { const rows = randomRows(); const r1 = E0.runForecast(rows, P, 0), r2 = E0.runForecast(rows.map((x) => ({ ...x, forecast: x.forecast * 7, actual: x.actual * 7 })), P, 0); if (!close(r1.wape, r2.wape) || !close(r1.mape, r2.mape) || !close(r1.bias, r2.bias) || !close(r1.trackingSignal, r2.trackingSignal)) return false; } return true; })());
ok("the tracking signal lies within plus or minus the number of intervals, and swapping forecast and actual flips its sign", (() => { for (let i = 0; i < 2000; i++) { const rows = randomRows(); const r = E0.runForecast(rows, P, 0), s = E0.runForecast(rows.map((x) => ({ ...x, forecast: x.actual, actual: x.forecast })), P, 0); if (Math.abs(r.trackingSignal) > r.n + 1e-9 || !close(r.trackingSignal, -s.trackingSignal)) return false; } return true; })());
ok("a perfect forecast: WAPE 0, interval accuracy 100%, tracking signal 0, no misses", (() => { const r = E0.runForecast(PAIR.map((x) => ({ ...x, actual: x.forecast })), P, 360); return r.wape === 0 && r.intervalAccuracy === 1 && r.trackingSignal === 0 && r.worst.length === 0 && r.underHours === 0; })());
ok("no actual contacts claims no WAPE or MAPE; no forecast claims no total accuracy or bias", (() => { const r1 = E0.runForecast(PAIR.map((x) => ({ ...x, actual: 0 })), P, 0), r2 = E0.runForecast(PAIR.map((x) => ({ ...x, forecast: 0 })), P, 0); return r1.wape === null && r1.mape === null && r2.totalAccuracy === null && r2.bias === null; })());
ok("workload hours are linear in AHT and zero without one", (() => { const r1 = E0.runForecast(PAIR, P, 360), r2 = E0.runForecast(PAIR, P, 720), r0 = E0.runForecast(PAIR, P, 0); return close(r2.underHours, 2 * r1.underHours) && r0.underHours === 0 && r0.perInterval.every((x) => x.agents === 0); })());

section("4. The worked example on the method page reconciles");
const X = E0.runForecast(PAIR, P, 360);
ok("total-volume accuracy 100% while WAPE is 20% and interval accuracy 80%", X.totalAccuracy === 1 && close(X.wape, 0.2) && close(X.intervalAccuracy, 0.8));
ok("MAPE 20.8% ((20/80 + 20/120) / 2)", (X.mape * 100).toFixed(1) === "20.8");
ok("tracking signal 0; 2.0 hours each way; 4.0 agents busy at 9:30", X.trackingSignal === 0 && close(X.underHours, 2) && close(X.overHours, 2) && close(X.perInterval[1].agents, 4));
ok("the worst interval is the earlier of two equal misses", X.worst[0].interval === "9:00" && X.worst.length === 2);

section("5. Registry and retired claims");
const TOOL = readFileSync("./ForecastAccuracyTracker.jsx", "utf8");
ok("the tracking signal limit is registered as a threshold with its source", BENCHMARK_SOURCES["forecast.ts.limit"].kind === "threshold" && BENCHMARK_SOURCES["forecast.ts.limit"].value === 4 && /Heizer/.test(BENCHMARK_SOURCES["forecast.ts.limit"].source));
ok("the tool reads the limit from the registry", /benchmark\("forecast\.ts\.limit"\)/.test(TOOL) && !/bias > 3|bias < -3|Math\.abs\(bias\) > 3/.test(TOOL));
ok("the unsourced grades and claims are gone", !/Excellent|Acceptable|Needs attention|Industry benchmark|Best-in-class|95%\+|90%\+|MAPE under 5%|not a better algorithm|Well calibrated|strong interval accuracy|acceptable but improvable/.test(TOOL));
ok("no colour line at 5 or 10% judges an interval", !/> 0\.1 \?|Math\.abs\(err\) > 10|Math\.abs\(err\) > 5|within 10%|off by 10%/.test(TOOL));
ok("the sample is never called random or drawn at random", !/Randomize|Math\.random/.test(TOOL.replace(/\/\*[\s\S]*?\*\//g, "")));
ok("the tool links the published method", /\/methodology\/forecast-accuracy/.test(TOOL));
ok("no dash in the engine, the tool or the method", !DASH.test(SRC) && !DASH.test(TOOL) && !DASH.test(readFileSync("./src/lib/rubrics/forecastModel.js", "utf8")));

section("6. Mutants are caught");
const mutants = [
  ["WAPE over forecast", "const wape = totalA > 0 ? absErr / totalA : null;", "const wape = totalF > 0 ? absErr / totalF : null;", (X2) => { const r = X2.runForecast([{ interval: "a", forecast: 100, actual: 50 }], P, 0); return !close(r.wape, 1); }],
  ["the tracking signal drops the MAD", "const trackingSignal = mad > 0 ? sumErr / mad : 0;", "const trackingSignal = sumErr;", (X2) => { const r = X2.runForecast([{ interval: "a", forecast: 100, actual: 150 }, { interval: "b", forecast: 100, actual: 150 }], P, 0); return r.trackingSignal !== 2; }],
  ["misses rank by percent", "Math.abs(b.err) - Math.abs(a.err)", "Math.abs(b.pctErr) - Math.abs(a.pctErr)", (X2) => X2.runForecast([{ interval: "a", forecast: 2, actual: 5 }, { interval: "b", forecast: 100, actual: 130 }], P, 0).worst[0].interval !== "b"],
  ["hours lose the 3,600", "const hoursPer = aht > 0 ? aht / 3600 : 0;", "const hoursPer = aht > 0 ? aht / 60 : 0;", (X2) => !close(X2.runForecast(PAIR, P, 360).underHours, 2)],
];
for (const [name, from, to, killed] of mutants) {
  ok(`mutant present in source: ${name}`, BODY.includes(from));
  ok(`mutant caught: ${name}`, killed(load(BODY.replace(from, to))));
}

console.log(`\n${pass} passed, ${fail} failed`);
if (fail > 0) process.exit(1);
