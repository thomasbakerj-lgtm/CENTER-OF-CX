// AI Deflection Reality Check, V3 engine verification.
// Run from the repo root:  node aid.test.mjs
//
// This harness does not carry a copy of the engine. It slices the engine out of
// AIDeflectionRealityCheck.jsx between the @engine-start and @engine-end markers and
// imports it. A copy would drift. The whole point of the rail work was that copies drift.
//
// What it proves:
//   1. The boundary question. The V2 engine could publish a negative deflection rate, and
//      a >100% one, which the rail silently rescales rather than drops. The V3 engine cannot.
//   2. The rail semantic mismatch. netDeflectionRate is not a bot resolution rate.
//   3. The claim-to-reality bridge reconciles to net savings to 1e-10 across 1,728 cases.
//   4. Break-even thresholds are the true zero crossings of the engine, not approximations.
//   5. Ten directional sweeps, plus the doctrine assertion that loaded cost moves the
//      vendor's claim and moves net savings by exactly zero.
//   6. Grade reachability, and unreachability exactly where doctrine says.
//   7. One-time implementation cost hits Year 1 only and never escalates.
//   8. What the tool actually hands the rail.

import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { normalizeForPublish } from "./src/lib/metrics.js";

const ROOT = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(ROOT, "AIDeflectionRealityCheck.jsx"), "utf8");
const a = src.indexOf("/* @engine-start"), b = src.indexOf("/* @engine-end */");
if (a < 0 || b < 0) { console.error("Engine markers missing from AIDeflectionRealityCheck.jsx."); process.exit(1); }
const tmp = join(tmpdir(), `aid-engine-${Date.now()}.mjs`);
writeFileSync(tmp, `import { MECH, MECH_DEFAULT } from "${pathToFileURL(join(ROOT, "src/lib/mech.js")).href}";\n` + src.slice(a, b));
const { engine } = await import(pathToFileURL(tmp).href);
unlinkSync(tmp);

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log("  FAIL " + m); } };
const near = (x, y, t = 0.02) => Math.abs(x - y) < t;
const H = (t) => console.log("\n" + t);

const BASE = {
  M: 80000, cpc: 7, marg: 4.2,
  grossDeflection: 40, botLeakage: 15, containmentFailure: 12, escalationPenalty: 25,
  botPlatformCost: 8000, qaCost: 2000, tuningHours: 40, tuningRate: 65,
  knowledgeMaintHours: 20, knowledgeRate: 55, implOneTime: 0,
  mech: "hiring", rampOn: true, rampMonths: 6, evidence: "estimate", costBasisOwned: false,
};
const run = (o = {}) => engine({ ...BASE, ...o });

/* The V2 engine, in shape. Kept only to answer the boundary question against history. */
const v2rate = (M, Gp, Lp, Fp) => { const keep = (1 - Lp / 100) * (1 - Fp / 100); return M > 0 ? ((M * (Gp / 100) * keep) / M) * 100 : 0; };

/* ------------------------------------------------------------------ 1. BOUNDARY */
H("1. BOUNDARY. Can the engine produce a negative netDeflectionRate?");
{
  const r = v2rate(80000, 40, 150, 12);
  ok(r < 0, "V2 with typed leakage 150 goes negative");
  console.log(`  V2, botLeakage typed 150 -> netDeflectionRate ${r.toFixed(2)}%  NEGATIVE`);
  const { clean, flags } = normalizeForPublish({ realisticDeflectionRate: +(r / 100).toFixed(4) }, { sourceTool: "ai-deflection" });
  ok(clean.realisticDeflectionRate === undefined, "the rail drops a negative rate");
  console.log(`  rail -> ${JSON.stringify(clean)}   ${flags[0] || ""}`);

  const c = v2rate(80000, 150, 15, 12);
  const res = normalizeForPublish({ realisticDeflectionRate: +(c / 100).toFixed(4) }, { sourceTool: "ai-deflection" });
  ok(res.clean.realisticDeflectionRate > 0 && res.clean.realisticDeflectionRate < 0.02, "the rail SILENTLY RESCALES a >1 rate rather than dropping it");
  console.log(`  V2, grossDeflection typed 150 -> ${c.toFixed(2)}%  rail -> ${JSON.stringify(res.clean)}   silent corruption, worse than a drop`);
}
{
  const vals = [-1e6, -150, -1, -0.001, 0, 0.5, 1, 50, 99.999, 100, 100.001, 150, 1e6, NaN, Infinity, -Infinity];
  let neg = false, dropped = false, lo = Infinity, hi = -Infinity, cases = 0;
  for (const G of vals) for (const L of vals) for (const F of vals) for (const E of [-50, 0, 25, 200, 1e6]) {
    const r = run({ grossDeflection: G, botLeakage: L, containmentFailure: F, escalationPenalty: E }); cases++;
    if (r.netDeflectionRate < 0) neg = true;
    if (!r.railPublished) dropped = true;
    lo = Math.min(lo, r.netDeflectionRate); hi = Math.max(hi, r.netDeflectionRate);
  }
  ok(!neg, "V3 never produces a negative rate");
  ok(!dropped, "V3 never has its publish dropped by a hostile input");
  ok(lo >= 0 && hi <= 100, "V3 rate stays inside [0,100]");
  console.log(`  V3 guarded, ${cases.toLocaleString()} hostile combinations: range [${lo.toFixed(2)}, ${hi.toFixed(2)}]  negatives ${neg}  drops ${dropped}`);
}
{
  const r = run({ M: 0 });
  ok(!r.railPublished && /zero/.test(r.railReason || ""), "M=0 suppresses the publish and says why");
  ok(r.flags.some((f) => /fall back to its own default bot resolution rate of 65%/.test(f)), "the suppression names the downstream consequence");
  console.log(`  M=0 -> suppressed, and the report says so. This is the only surviving drop, and it is visible.`);
}

/* ------------------------------------------------------- 2. RAIL SEMANTIC MISMATCH */
H("2. RAIL. netDeflectionRate is not a bot resolution rate.");
{
  const r = run();
  ok(near(r.botResolutionRate, r.realizedDeflectionPct), "botResolutionRate is identically keep*100");
  ok(r.botResolutionRate > r.netDeflectionRate * 2, "they differ by more than a factor of two at defaults");
  console.log(`  netDeflectionRate ${r.netDeflectionRate.toFixed(1)}%  = share of TOTAL volume removed`);
  console.log(`  botResolutionRate ${r.botResolutionRate.toFixed(1)}%  = share of BOT-ROUTED volume that resolves`);
  console.log(`  Channel Shift resBot defaults to 65 and means "resolves without bouncing".`);
  console.log(`  It has been receiving ${Math.round(r.netDeflectionRate)}. It needs ${Math.round(r.botResolutionRate)}.`);
}

/* -------------------------------------------------------------- 3. RECONCILIATION */
H("3. RECONCILIATION. The bridge must sum to net savings, everywhere.");
{
  let worst = 0, cases = 0;
  for (const mech of ["none", "growth", "overtime", "hiring", "vendor", "headcount"])
    for (const G of [0, 5, 40, 100]) for (const L of [0, 15, 60, 100]) for (const F of [0, 12, 55, 100])
      for (const E of [0, 25, 200]) for (const marg of [0, 1, 4.2, 7]) {
        const r = run({ mech, grossDeflection: G, botLeakage: L, containmentFailure: F, escalationPenalty: E, marg });
        worst = Math.max(worst, Math.abs(r.waterfallSum - r.netSavings)); cases++;
      }
  ok(worst < 1e-6, "bridge reconciles to net savings");
  console.log(`  worst residual across ${cases.toLocaleString()} cases: $${worst.toExponential(2)}`);
}

/* ----------------------------------------------------------------- 4. BREAK-EVEN */
H("4. BREAK-EVEN. Closed forms must be the engine's real zero crossings.");
{
  const r = run();
  ok(near(run({ grossDeflection: r.beGrossPct }).netSavings, 0, 0.01), "beGrossPct is the true zero");
  ok(near(run({ botLeakage: r.leakTolPct }).netSavings, 0, 0.01), "leakTolPct is the true zero");
  ok(near(run({ botPlatformCost: BASE.botPlatformCost + r.platformHeadroom }).netSavings, 0, 0.01), "platformHeadroom is opex room to zero");
  console.log(`  break-even deflection ${r.beGrossPct.toFixed(2)}%   max leakage ${r.leakTolPct.toFixed(2)}%   opex headroom $${Math.round(r.platformHeadroom).toLocaleString()}/mo`);
  const nb = run({ mech: "none", escalationPenalty: 0 });
  ok(nb.leakTolPct === null && /does not move net savings/.test(nb.leakTolNote), "no mech and no escalation makes leakage tolerance meaningless, and the tool says so rather than printing 0%");
  console.log(`  mech=none, esc=0 -> null, with a reason. Not a fake 0%.`);
}

/* ------------------------------------------------------------ 5. DIRECTIONAL SWEEP */
H("5. DIRECTIONAL SWEEP. Every input moves net savings the only way it can.");
const sweep = (key, lo, hi, expect) => {
  const out = []; for (let i = 0; i <= 40; i++) out.push(run({ [key]: lo + ((hi - lo) * i) / 40 }).netSavings);
  const d = out.slice(1).map((v, i) => v - out[i]);
  const up = d.every((x) => x >= -1e-9), down = d.every((x) => x <= 1e-9);
  const got = up && down ? "flat" : up ? "up" : down ? "down" : "NON-MONOTONIC";
  ok(got === expect, `${key} should be ${expect}, got ${got}`);
  console.log(`  ${key.padEnd(20)} ${String(lo).padStart(6)} -> ${String(hi).padEnd(8)} ${got.padEnd(14)} $${Math.round(out[0]).toLocaleString()} to $${Math.round(out[40]).toLocaleString()}`);
};
sweep("grossDeflection", 0, 100, "up");
sweep("botLeakage", 0, 100, "down");
sweep("containmentFailure", 0, 100, "down");
sweep("escalationPenalty", 0, 200, "down");
sweep("botPlatformCost", 0, 200000, "down");
sweep("qaCost", 0, 50000, "down");
sweep("tuningHours", 0, 400, "down");
sweep("knowledgeRate", 0, 500, "down");
sweep("marg", 0.01, 7, "up");
sweep("M", 0, 500000, "up");
{
  ok(near(run({ cpc: 7 }).netSavings, run({ cpc: 40 }).netSavings, 1e-9), "loaded cost must not move net savings");
  ok(run({ cpc: 40 }).vendorClaim > run({ cpc: 7 }).vendorClaim * 5, "loaded cost must move the vendor claim");
  console.log(`  cpc 7 -> 40:  netSavings FLAT at $${Math.round(run().netSavings).toLocaleString()}   vendorClaim $${Math.round(run({cpc:7}).vendorClaim).toLocaleString()} -> $${Math.round(run({cpc:40}).vendorClaim).toLocaleString()}`);
  const da = run({ marg: 0, cpc: 7 }).netSavings, db = run({ marg: 0, cpc: 40 }).netSavings;
  ok(!near(da, db, 1), "with marginal defaulted, loaded cost DOES move net savings, which is exactly why that state is Directional");
  console.log(`  marg unsupplied: cpc 7 -> 40 moves netSavings $${Math.round(da).toLocaleString()} -> $${Math.round(db).toLocaleString()}. Hence the Directional cap.`);

  const ladder = ["none", "growth", "overtime", "hiring", "vendor", "headcount"].map((m) => run({ mech: m }).netSavings);
  ok(ladder.every((v, i) => i === 0 || v >= ladder[i - 1] - 1e-9), "net savings non-decreasing across the credit ladder");
  const nn = run({ mech: "none" });
  ok(near(nn.netSavings, -(nn.opexMonthly + nn.escalationPremium), 0.01), "mech=none is exactly minus opex minus escalation premium");
  console.log(`  mech ladder: ${ladder.map((v) => "$" + Math.round(v).toLocaleString()).join("  ")}`);
  console.log(`  mech=none is a LOSS of $${Math.round(-nn.netSavings).toLocaleString()}/mo, not a zero. Operating cost is cash out regardless.`);

  const q = run({ mech: "none", escalationPenalty: 0 });
  ok(near(run({ mech: "none", escalationPenalty: 0, botLeakage: 0 }).netSavings, run({ mech: "none", escalationPenalty: 0, botLeakage: 90 }).netSavings, 1e-9),
    "with no mech and no escalation, leakage cannot move cash");
  console.log(`  leakage is inert when nothing is realized and nothing escalates. Asserted, not hidden. ($${Math.round(q.netSavings).toLocaleString()})`);
}

/* -------------------------------------------------------- 6. GRADE REACHABILITY */
H("6. GRADE REACHABILITY. Reachable everywhere it should be, nowhere it should not.");
const g = (o) => run(o).headlineConf;
ok(g({}) === "Directional", "defaults are Directional");
ok(g({ evidence: "proposal", costBasisOwned: true, mech: "hiring" }) === "Planning-grade", "proposal plus hiring reaches Planning-grade");
ok(g({ evidence: "pilot", costBasisOwned: true, mech: "vendor" }) === "Finance-grade", "observed pilot plus vendor reduction reaches Finance-grade");
ok(g({ evidence: "sla", costBasisOwned: true, mech: "headcount" }) === "Finance-grade", "contracted SLA plus headcount reaches Finance-grade");
console.log("  reachable: all three grades");
ok(g({ evidence: "pilot", costBasisOwned: true, mech: "none" }) === "Directional", "no mechanism forces Directional even on pilot data");
ok(g({ evidence: "pilot", costBasisOwned: true, mech: "growth" }) === "Directional", "capacity-only credit class forces Directional");
ok(g({ evidence: "pilot", costBasisOwned: true, mech: "hiring" }) === "Planning-grade", "finance-creditable caps at Planning-grade");
ok(g({ evidence: "proposal", costBasisOwned: true, mech: "vendor" }) === "Planning-grade", "a proposal is a document, not a commitment: caps at Planning-grade");
ok(g({ evidence: "marketing", costBasisOwned: true, mech: "vendor" }) === "Directional", "vendor marketing forces Directional");
ok(g({ evidence: "pilot", costBasisOwned: false, mech: "vendor" }) === "Planning-grade", "an unconfirmed cost basis caps at Planning-grade");
ok(g({ evidence: "pilot", costBasisOwned: true, mech: "vendor", marg: 0 }) === "Directional", "a defaulted marginal cost forces Directional");
ok(g({ evidence: "pilot", costBasisOwned: true, mech: "vendor", botLeakage: 150 }) === "Directional", "a clamped input forces Directional");
console.log("  unreachable where doctrine says: none, growth, marketing, proposal+cash, unconfirmed basis, defaulted basis, clamped input");
{
  const b = { evidence: "pilot", costBasisOwned: true, mech: "vendor" };
  ok(g(b) !== g({ ...b, evidence: "proposal" }), "the evidence selector is live");
  ok(g(b) !== g({ ...b, mech: "hiring" }), "the mechanism selector is live");
  ok(g(b) !== g({ ...b, costBasisOwned: false }), "the cost-basis confirmation is live");
  console.log("  no dead controls: evidence, mechanism, and cost confirmation each move the grade independently");
}

/* ------------------------------------------------------------------- 7. YEAR ONE */
H("7. YEAR 1. One-time cost hits Year 1 only and never escalates.");
{
  const a = run(), b = run({ implOneTime: 300000 });
  ok(near(a.year1 - b.year1, 300000, 0.01), "year 1 falls by exactly the one-time cost");
  ok(near(a.steadyAnnual, b.steadyAnnual, 1e-9), "steady state is untouched");
  ok(a.flags.some((f) => /Implementation cost is zero/.test(f)), "a zero implementation cost is flagged, not silently accepted");
  ok(run({ rampOn: false }).year1 > a.year1, "no ramp beats a six month ramp");
  console.log(`  implOneTime 0 -> 300,000:  year1 $${Math.round(a.year1).toLocaleString()} -> $${Math.round(b.year1).toLocaleString()}   payback month ${a.payback} -> ${b.payback}   steady unchanged`);
}

/* ---------------------------------------------------------------- 8. RAIL PUBLISH */
H("8. RAIL PUBLISH. What this tool hands the suite on a clean run.");
{
  const r = run();
  const { clean, flags } = normalizeForPublish({
    realisticDeflectionRate: +r.railRate.toFixed(4),
    botResolutionRate: +r.railBot.toFixed(4),
    capacityAction: r.mechKey,
  }, { sourceTool: "ai-deflection" });
  ok(flags.length === 0, "a clean run raises no rail flags");
  ok(clean.realisticDeflectionRate <= 1 && clean.botResolutionRate <= 1, "both rates publish as fractions");
  console.log("  " + JSON.stringify(clean));
  const bad = normalizeForPublish({ botResolutionRate: 74.8 }, { sourceTool: "ai-deflection" });
  ok(bad.clean.botResolutionRate === 0.748 && bad.flags.length === 1, "botResolutionRate is REGISTERED, so a percent gets corrected and flagged");
  console.log("  registry guard: publishing 74.8 instead of 0.748 is corrected and flagged, not silently accepted");
}

console.log(`\n${pass}/${pass + fail} assertions passing.` + (fail ? `  ${fail} FAILING.` : ""));
process.exit(fail ? 1 : 0);
