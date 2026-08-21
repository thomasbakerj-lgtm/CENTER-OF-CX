// staffing.test.mjs
// Slices the Erlang engine out of StaffingCalculator.jsx and tests it against
// published reference values and internal invariants. Run: node staffing.test.mjs

import { readFileSync } from "node:fs";

const SRC = readFileSync(new URL("./StaffingCalculator.jsx", import.meta.url), "utf8");
function slice(a, b) {
  const i = SRC.indexOf(a);
  if (i < 0) throw new Error("slice failed: " + a);
  const j = SRC.indexOf(b, i);
  if (j < 0) throw new Error("slice end failed: " + b);
  return SRC.slice(i, j);
}
const engine = slice("function erlangB(", "function buildInsights(");
const mod = new Function(`${engine}\nreturn { erlangB, erlangC, calc, abandonmentCheck, modelValidity, sustainablePair, staffingCost, poolingPenalty, BENCHMARK_HOURLY, FULL_LOAD_MULTIPLE, PAID_HOURS_MONTH };`)();
const { erlangB, erlangC, calc, abandonmentCheck, modelValidity, sustainablePair, staffingCost, poolingPenalty, BENCHMARK_HOURLY, FULL_LOAD_MULTIPLE, PAID_HOURS_MONTH } = mod;

let pass = 0, fail = 0;
const near = (a, b, tol) => Math.abs(a - b) <= tol;
function ok(name, cond, detail = "") {
  if (cond) pass++;
  else { fail++; console.log(`  FAIL  ${name}${detail ? "  ::  " + detail : ""}`); }
}
const section = (t) => console.log(`\n${t}`);

/* ------------------------------------------------ Erlang B reference ---- */
section("Erlang B against closed-form");
{
  // B(N,A) = (A^N/N!) / sum_{k=0..N}(A^k/k!). Computed independently here.
  function bClosed(N, A) {
    let num = 1, den = 1, term = 1;
    for (let k = 1; k <= N; k++) { term = term * A / k; den += term; }
    num = term;
    return num / den;
  }
  for (const [N, A] of [[1, 0.5], [5, 3], [10, 8], [30, 25], [88, 80], [200, 180]]) {
    ok(`B(${N},${A}) matches closed form`, near(erlangB(N, A), bClosed(N, A), 1e-9),
      `${erlangB(N, A)} vs ${bClosed(N, A)}`);
  }
  ok("B(1,1) = 0.5 exactly", near(erlangB(1, 1), 0.5, 1e-12));
  ok("B is decreasing in N", erlangB(20, 10) < erlangB(10, 10));
  ok("B is increasing in A", erlangB(10, 12) > erlangB(10, 8));
  ok("B stays in [0,1] at extreme load", erlangB(5, 500) <= 1 && erlangB(5, 500) >= 0);
  ok("B does not overflow at large N", isFinite(erlangB(2000, 1800)));
}

/* ------------------------------------------------ Erlang C reference ---- */
section("Erlang C against published values");
{
  // C(N,A) = B / (1 - rho(1-B)). Independent closed form via B.
  function cClosed(N, A) {
    let term = 1, den = 1;
    for (let k = 1; k <= N; k++) { term = term * A / k; den += term; }
    const B = term / den, rho = A / N;
    return B / (1 - rho * (1 - B));
  }
  for (const [N, A] of [[5, 3], [10, 8], [88, 80], [130, 120]]) {
    ok(`C(${N},${A}) matches closed form`, near(erlangC(N, A), cClosed(N, A), 1e-9));
  }
  ok("C = 1 when N <= A (no spare capacity)", erlangC(80, 80) === 1 && erlangC(70, 80) === 1);
  ok("C >= B always", erlangC(20, 15) >= erlangB(20, 15));
  ok("C is decreasing in N", erlangC(30, 20) < erlangC(25, 20));
  ok("C in [0,1]", erlangC(30, 20) <= 1 && erlangC(30, 20) >= 0);
}

/* ------------------------------------------- published staffing cases ---- */
section("Published staffing references");
{
  // Nextiva published: 400 contacts / 30 min, AHT 257s, 80% in 20s, 85% occ cap,
  // 30% shrinkage -> 68 base, 98 FTE, 84.0% occupancy. Cited in the source comment.
  const r = calc(400, 257, 30, 0.8, 20, 0.3, 0.85);
  ok("Nextiva case, base agents = 68", r.raw === 68, `${r.raw}`);
  ok("Nextiva case, scheduled FTE = 98", r.sched === 98, `${r.sched}`);
  ok("Nextiva case, occupancy near 84%", near(r.occ, 0.84, 0.005), `${(r.occ * 100).toFixed(1)}%`);

  // Classic textbook case: 100 calls/half hour, AHT 180s, target 80% in 20s.
  // Intensity 10 Erlangs; standard Erlang C tables give 14 agents.
  const t = calc(100, 180, 30, 0.8, 20, 0, 0);
  ok("textbook 10-Erlang case needs 14 agents", t.raw === 14, `${t.raw}`);
  ok("textbook case meets its own target", t.sl >= 0.8);
}

/* ------------------------------------------------------- invariants ---- */
section("Engine invariants");
{
  const cases = [];
  for (const vol of [1, 50, 400, 574, 5000])
    for (const aht of [60, 180, 360, 413, 900])
      for (const int of [15, 30, 47, 60])
        for (const sl of [0.7, 0.8, 0.88, 0.95])
          cases.push([vol, aht, int, sl]);

  let bad = [];
  for (const [vol, aht, int, sl] of cases) {
    const r = calc(vol, aht, int, sl, 20, 0.3, 0);
    if (!isFinite(r.raw) || r.raw < 1) bad.push(["agents not finite/positive", vol, aht, int, sl]);
    if (r.raw <= r.A) bad.push(["agents not above traffic intensity", vol, aht, int, sl]);
    if (!(r.occ > 0 && r.occ < 1)) bad.push(["occupancy outside (0,1)", vol, aht, int, sl]);
    if (!(r.sl >= 0 && r.sl <= 1)) bad.push(["service level outside [0,1]", vol, aht, int, sl]);
    if (!(r.pw >= 0 && r.pw <= 1)) bad.push(["prob wait outside [0,1]", vol, aht, int, sl]);
    if (!isFinite(r.asa) || r.asa < 0) bad.push(["ASA not finite/non-negative", vol, aht, int, sl]);
    if (r.sched < r.raw) bad.push(["scheduled FTE below base agents", vol, aht, int, sl]);
  }
  ok(`all ${cases.length} input combinations hold every invariant`, bad.length === 0,
    bad.slice(0, 3).map(b => b.join(" ")).join(" | "));
}
{
  // Monotonicity: the properties an operator relies on when reading what-ifs.
  const base = calc(400, 360, 30, 0.8, 20, 0.3, 0);
  ok("more volume needs more agents", calc(480, 360, 30, 0.8, 20, 0.3, 0).raw > base.raw);
  ok("longer AHT needs more agents", calc(400, 396, 30, 0.8, 20, 0.3, 0).raw > base.raw);
  ok("tighter service level needs more agents", calc(400, 360, 30, 0.9, 20, 0.3, 0).raw > base.raw);
  ok("more shrinkage needs more scheduled FTE", calc(400, 360, 30, 0.8, 20, 0.35, 0).sched > base.sched);
  ok("shrinkage does not change base agents", calc(400, 360, 30, 0.8, 20, 0.35, 0).raw === base.raw);
  ok("shorter answer threshold needs more agents", calc(400, 360, 30, 0.8, 10, 0.3, 0).raw >= base.raw);
}
{
  // The staffing solution must actually meet the target it solved for.
  let miss = 0;
  for (const sl of [0.7, 0.8, 0.85, 0.9, 0.95])
    for (const vol of [50, 400, 2000]) {
      const r = calc(vol, 360, 30, sl, 20, 0.3, 0);
      if (r.sl < sl - 1e-9) miss++;
      const one = calc(vol, 360, 30, sl, 20, 0.3, 0);
      // and one fewer agent must NOT meet it, so the answer is minimal
      const pw = erlangC(one.raw - 1, one.A);
      const slLess = 1 - pw * Math.exp(-(one.raw - 1 - one.A) * 20 / 360);
      if (one.raw - 1 > one.A && slLess >= sl) miss++;
    }
  ok("solution meets target and is minimal", miss === 0, `${miss} violations`);
}

/* ------------------------------------------------------ occupancy cap ---- */
section("Occupancy cap");
{
  const un = calc(400, 360, 30, 0.8, 20, 0.3, 0);
  const cap = calc(400, 360, 30, 0.8, 20, 0.3, 0.85);
  ok("cap adds agents when occupancy would exceed it", cap.raw > un.raw);
  ok("cap actually holds the ceiling", cap.occ <= 0.85 + 1e-9, `${cap.occ}`);
  ok("cap flags that it bound", cap.capped === true);
  ok("cap never reduces below the service-level answer", cap.raw >= un.raw);
  const loose = calc(400, 360, 30, 0.8, 20, 0.3, 0.99);
  ok("a cap above natural occupancy does not bind", loose.capped === false && loose.raw === un.raw);
  ok("service level still met when the cap binds", cap.sl >= 0.8);
}

/* ------------------------------------------------------- abandonment ---- */
section("Abandonment reality-check");
{
  ok("off when patience is zero", abandonmentCheck(88, 80, 360, 0) === null);
  ok("off when N <= A", abandonmentCheck(80, 80, 360, 30) === null);
  const a = abandonmentCheck(94, 84.06, 413, 19);
  ok("abandonment estimate in [0,1]", a.estAband >= 0 && a.estAband <= 1, `${a.estAband}`);
  ok("more patience means less abandonment",
    abandonmentCheck(94, 84.06, 413, 60).estAband < abandonmentCheck(94, 84.06, 413, 10).estAband);
  ok("more agents means less abandonment",
    abandonmentCheck(110, 84.06, 413, 19).estAband < abandonmentCheck(94, 84.06, 413, 19).estAband);
  ok("abandonment never exceeds probability of wait",
    a.estAband <= erlangC(94, 84.06) + 1e-9);
}

/* ---------------------------------------------------- screenshot cases ---- */
section("Reproducing the live screenshots");
{
  const r = calc(400, 360, 30, 0.8, 20, 0.3, 0);
  ok("screenshot 1: traffic intensity 80.0 Erlangs", near(r.A, 80, 0.05), `${r.A}`);
  ok("screenshot 1: 88 base agents", r.raw === 88, `${r.raw}`);
  ok("screenshot 1: 126 scheduled FTE", r.sched === 126, `${r.sched}`);
  ok("screenshot 1: occupancy 90.9%", near(r.occ * 100, 90.9, 0.05), `${(r.occ * 100).toFixed(1)}`);
  ok("screenshot 1: service level 81.8%", near(r.sl * 100, 81.8, 0.05), `${(r.sl * 100).toFixed(1)}`);
  ok("screenshot 1: ASA 13s", Math.round(r.asa) === 13, `${r.asa.toFixed(1)}`);
  ok("screenshot 1: prob of wait 28.4%", near(r.pw * 100, 28.4, 0.05), `${(r.pw * 100).toFixed(1)}`);

  const c = calc(574, 413, 47, 0.88, 24, 0.27, 0);
  ok("screenshot 4: traffic intensity 84.1 Erlangs", near(c.A, 84.1, 0.05), `${c.A}`);
  ok("screenshot 4: 94 base agents", c.raw === 94, `${c.raw}`);
  ok("screenshot 4: 129 scheduled FTE", c.sched === 129, `${c.sched}`);
  ok("screenshot 4: occupancy 89.4%", near(c.occ * 100, 89.4, 0.05), `${(c.occ * 100).toFixed(1)}`);
  ok("screenshot 4: service level 88.4%", near(c.sl * 100, 88.4, 0.05), `${(c.sl * 100).toFixed(1)}`);
  ok("screenshot 4: prob of wait 20.7%", near(c.pw * 100, 20.7, 0.05), `${(c.pw * 100).toFixed(1)}`);

  const ab = abandonmentCheck(94, c.A, 413, 19);
  ok("screenshot 5: abandonment 14.2%", near(ab.estAband * 100, 14.2, 0.05), `${(ab.estAband * 100).toFixed(1)}`);
}


/* -------------------------------------------------------- model validity ---- */
section("Erlang C validity guard");
{
  ok("30min interval with 6min AHT is valid", modelValidity(360, 30).ok);
  ok("47min interval with 6.9min AHT is valid", modelValidity(413, 47).ok);
  ok("exactly 3x is the boundary and passes", modelValidity(600, 30).ok);
  ok("just under 3x fails", !modelValidity(601, 30).ok);
  ok("15min AHT in a 30min interval fails", !modelValidity(900, 30).ok);
  ok("30min AHT in a 30min interval is critical", modelValidity(1800, 30).severity === "critical");
  ok("2x is caution, not critical", modelValidity(900, 30).severity === "caution");
  ok("ratio is reported accurately", Math.abs(modelValidity(900, 30).ratio - 2) < 1e-9);
  ok("the suggested interval actually clears the threshold", (() => {
    const v = modelValidity(900, 15);
    const need = Math.ceil((900 * 3) / 60);
    return modelValidity(900, need).ok;
  })());
  ok("guard never divides by zero", isFinite(modelValidity(0, 30).ratio));
  // every industry preset must be valid at the default interval
  const presetAht = [360, 320, 420, 280, 440, 480, 340];
  ok("all seven presets are valid at a 30 minute interval",
    presetAht.every(a => modelValidity(a, 30).ok), presetAht.filter(a => !modelValidity(a, 30).ok).join(","));
  ok("insurance preset at a 15 minute interval correctly warns", !modelValidity(480, 15).ok);
}


/* --------------------------------------------------- sustainable pair ---- */
section("Sustainable staffing pair");
{
  const P = [
    ["general", 400, 360, 0.80, 20, 0.30], ["financial", 500, 320, 0.80, 20, 0.28],
    ["healthcare", 350, 420, 0.80, 30, 0.32], ["retail", 600, 280, 0.80, 20, 0.32],
    ["telecom", 550, 440, 0.80, 20, 0.30], ["insurance", 300, 480, 0.80, 30, 0.28],
    ["bpo", 700, 340, 0.80, 20, 0.34],
  ];
  for (const [n, v, a, t, sec, sh] of P) {
    const p = sustainablePair(v, a, 30, t, sec, sh, 0.87);
    ok(`${n} pair produces a sustainable alternative`, p.sustainable !== null);
    ok(`${n} sustainable option actually holds the ceiling`, p.sustainable.occ <= 0.87 + 1e-9,
      `${(p.sustainable.occ * 100).toFixed(1)}%`);
    ok(`${n} sustainable option still meets service level`, p.sustainable.sl >= t - 1e-9);
    ok(`${n} delta is positive and equals the FTE difference`,
      p.deltaFte > 0 && p.deltaFte === p.sustainable.sched - p.sla.sched);
  }
}
{
  // When the SLA answer already sits under the ceiling there is no trade-off to sell.
  const p = sustainablePair(20, 180, 30, 0.80, 20, 0.30, 0.87);
  ok("no pair offered when occupancy already sits under the ceiling",
    p.sla.occ > 0.87 ? p.sustainable !== null : p.sustainable === null);
  const low = sustainablePair(5, 120, 30, 0.80, 20, 0.30, 0.87);
  ok("small queue returns no sustainable alternative", low.sustainable === null && low.deltaFte === 0);
  ok("ceiling is echoed back for display", low.ceiling === 0.87);
}
{
  // The custom run from the reviewed PDF.
  const p = sustainablePair(650, 512, 32, 0.75, 15, 0.32, 0.87);
  ok("reviewed custom run: SLA answer is 271 FTE", p.sla.sched === 271, `${p.sla.sched}`);
  ok("reviewed custom run: sustainable answer is 295 FTE", p.sustainable.sched === 295, `${p.sustainable.sched}`);
  ok("reviewed custom run: recovery time costs 24 FTE", p.deltaFte === 24, `${p.deltaFte}`);
  ok("reviewed custom run: ceiling actually held", p.sustainable.occ <= 0.87);
}
{
  // Monotonic: a tighter ceiling never costs less.
  let bad = 0;
  for (const c of [0.95, 0.90, 0.87, 0.85, 0.80]) {
    const p = sustainablePair(400, 360, 30, 0.80, 20, 0.30, c);
    const prev = sustainablePair(400, 360, 30, 0.80, 20, 0.30, Math.min(c + 0.05, 0.99));
    if (p.sustainable && prev.sustainable && p.sustainable.sched < prev.sustainable.sched) bad++;
  }
  ok("a tighter ceiling never costs fewer FTE", bad === 0, `${bad}`);
}


/* -------------------------------------------------------- economic layer ---- */
section("Cost engine");
{
  const bench = staffingCost(100, 0, 0);
  ok("no rail data falls back to the benchmark",
    Math.abs(bench.perAgentMonth - BENCHMARK_HOURLY * FULL_LOAD_MULTIPLE * PAID_HOURS_MONTH) < 1e-6);
  ok("benchmark fallback is Directional, not Planning-grade", bench.confidence === "Directional" && bench.sourced === false);
  ok("benchmark basis says plainly it is not the user's figures", /not your own figures/.test(bench.basis));

  const wage = staffingCost(100, 0, 24);
  ok("a rail wage is used over the benchmark",
    Math.abs(wage.perAgentMonth - 24 * FULL_LOAD_MULTIPLE * PAID_HOURS_MONTH) < 1e-6);
  ok("a rail wage earns Planning-grade", wage.confidence === "Planning-grade" && wage.sourced === true);

  const tco = staffingCost(100, 6372, 24);
  ok("a measured per-agent TCO figure outranks a wage", tco.perAgentMonth === 6372);
  ok("per-agent basis names the TCO run", /TCO run/.test(tco.basis));
  ok("per-agent basis is Planning-grade", tco.confidence === "Planning-grade");

  ok("annual is monthly times twelve", Math.abs(tco.annual - tco.monthly * 12) < 1e-6);
  ok("annual scales linearly with FTE",
    Math.abs(staffingCost(200, 6372, 0).annual - 2 * staffingCost(100, 6372, 0).annual) < 1e-6);
  ok("zero FTE costs zero", staffingCost(0, 6372, 0).annual === 0);
  ok("negative or absent rail values do not poison the basis",
    staffingCost(100, -5, 0).sourced === false && staffingCost(100, 0, -5).sourced === false);
  ok("loaded cost lands in a defensible per-agent range",
    bench.perAgentMonth > 4000 && bench.perAgentMonth < 8000, `${Math.round(bench.perAgentMonth)}`);
}
{
  // The number the tool leads with: what recovery time costs, in dollars.
  const P = [["general", 400, 360, 0.80, 20, 0.30], ["bpo", 700, 340, 0.80, 20, 0.34],
             ["telecom", 550, 440, 0.80, 20, 0.30]];
  for (const [n, v, a, t, sec, sh] of P) {
    const p = sustainablePair(v, a, 30, t, sec, sh, 0.87);
    const base = staffingCost(p.sla.sched, 0, 0);
    const ceil = staffingCost(p.sustainable.sched, 0, 0);
    const delta = ceil.annual - base.annual;
    ok(`${n} recovery-time cost is positive`, delta > 0);
    ok(`${n} recovery cost equals delta FTE times the per-agent rate`,
      Math.abs(delta - p.deltaFte * base.perAgentMonth * 12) < 1, `${Math.round(delta)}`);
  }
}


/* ------------------------------------------------------ pooling penalty ---- */
section("Queue fragmentation");
{
  ok("one queue is not a penalty", poolingPenalty(400, 360, 30, 0.8, 20, 0.3, 0, 1) === null);
  ok("zero or missing queue count returns nothing", poolingPenalty(400, 360, 30, 0.8, 20, 0.3, 0, 0) === null);
  ok("zero volume returns nothing", poolingPenalty(0, 360, 30, 0.8, 20, 0.3, 0, 4) === null);

  const p = poolingPenalty(400, 360, 30, 0.8, 20, 0.3, 0, 4);
  ok("four queues cost more than one", p.deltaFte > 0);
  ok("split FTE equals per-queue FTE times queue count", p.splitFte === p.per.sched * p.queues);
  ok("delta equals split minus pooled", p.deltaFte === p.splitFte - p.pooled.sched);
  ok("percentage penalty matches the FTE figures",
    Math.abs(p.pctPenalty - ((p.splitFte / p.pooled.sched) - 1)) < 1e-9);

  // The property that makes the diagnostic true: penalty grows with fragmentation.
  let prev = 0, bad = 0;
  for (const q of [2, 3, 4, 6, 8, 12]) {
    const r = poolingPenalty(400, 360, 30, 0.8, 20, 0.3, 0, q);
    if (r.deltaFte < prev) bad++;
    prev = r.deltaFte;
  }
  ok("penalty is monotonic in queue count", bad === 0, `${bad} inversions`);

  // Each split queue must still meet the service level, or the comparison is unfair.
  for (const q of [2, 4, 8]) {
    const r = poolingPenalty(400, 360, 30, 0.8, 20, 0.3, 0, q);
    ok(`each of ${q} split queues still meets the target`, r.per.sl >= 0.8 - 1e-9);
  }

  // Splitting lowers occupancy. The card says so; assert it stays true.
  const f = poolingPenalty(400, 360, 30, 0.8, 20, 0.3, 0, 6);
  ok("splitting lowers occupancy", f.splitOcc < f.pooledOcc, `${f.splitOcc} vs ${f.pooledOcc}`);

  // Small operations suffer proportionally more, which is the real-world claim.
  const small = poolingPenalty(60, 360, 30, 0.8, 20, 0.3, 0, 4);
  const large = poolingPenalty(2000, 360, 30, 0.8, 20, 0.3, 0, 4);
  ok("fragmentation hurts small queues proportionally more",
    small.pctPenalty > large.pctPenalty, `${small.pctPenalty.toFixed(3)} vs ${large.pctPenalty.toFixed(3)}`);

  // Never claim a saving from splitting.
  let neg = 0;
  for (const v of [30, 60, 120, 400, 900, 2000])
    for (const q of [2, 3, 5, 9]) {
      const r = poolingPenalty(v, 360, 30, 0.8, 20, 0.3, 0, q);
      if (r && r.deltaFte <= 0) neg++;
    }
  ok("pooling is never presented as costing more than splitting", neg === 0, `${neg}`);

  // The cost figure the card prints must equal delta FTE at the per-agent rate.
  const c = poolingPenalty(400, 360, 30, 0.8, 20, 0.3, 0, 6);
  const annual = staffingCost(c.splitFte, 0, 0).annual - staffingCost(c.pooled.sched, 0, 0).annual;
  ok("fragmentation cost equals delta FTE times the per-agent rate",
    Math.abs(annual - c.deltaFte * staffingCost(1, 0, 0).perAgentMonth * 12) < 1, `${Math.round(annual)}`);
}

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
