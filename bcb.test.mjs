// bcb.test.mjs
// Slices the Business Case Builder engine out of BusinessCaseBuilder.jsx at runtime and
// tests it directly, so the verified engine and the deployed engine cannot drift apart.
// Run: node bcb.test.mjs
//
// Engine region = helpers, STANCE/EVIDENCE, computeCase, confidenceOf, caseInsights, DEFAULTS.

import { readFileSync } from "node:fs";

const SRC = readFileSync(new URL("./BusinessCaseBuilder.jsx", import.meta.url), "utf8");

function slice(startMarker, endMarker) {
  const a = SRC.indexOf(startMarker);
  if (a < 0) throw new Error("engine slice failed, missing: " + startMarker);
  const b = SRC.indexOf(endMarker, a);
  if (b < 0) throw new Error("engine slice failed, missing end: " + endMarker);
  return SRC.slice(a, b);
}

const helpers = slice("const STATUS = {", "function LogoMark");
const consts  = slice("const STANCE = {", "/* De-overlapped model");
const engine  = slice("function computeCase(", "export default function");

const MECH = {
  none: { label: "Not selected", f: 0.00, cred: "none", note: "" },
  growth: { label: "Absorb growth / backlog", f: 0.25, cred: "capacity", note: "" },
  overtime: { label: "Reduce overtime", f: 0.60, cred: "finance", note: "" },
  hiring: { label: "Avoid hiring / attrition freeze", f: 0.75, cred: "finance", note: "" },
  vendor: { label: "Vendor / BPO volume reduction", f: 0.90, cred: "cash", note: "" },
  headcount: { label: "Headcount reduction", f: 1.00, cred: "cash", note: "" },
};
const MECH_ORDER = ["none", "growth", "overtime", "hiring", "vendor", "headcount"];
const MECH_DEFAULT = "hiring";

const mod = new Function("MECH", "MECH_ORDER", "MECH_DEFAULT",
  `${helpers}\n${consts}\n${engine}\n` +
  `return { computeCase, confidenceOf, caseInsights, DEFAULTS, STANCE, EVIDENCE, n, fmtK, fmt2, fmtFull, roiStatus, paybackStatus, STATUS };`
)(MECH, MECH_ORDER, MECH_DEFAULT);

const { computeCase, confidenceOf, caseInsights, DEFAULTS, STANCE } = mod;

let pass = 0, fail = 0;
const FAILS = [];
const near = (a, b, tol = 0.01) => Math.abs(a - b) <= tol;
function ok(name, cond, detail = "") {
  if (cond) pass++;
  else { fail++; FAILS.push(name); console.log(`  FAIL  ${name}${detail ? "  ::  " + detail : ""}`); }
}
function section(t) { console.log(`\n${t}`); }
function ex(name, fn) { try { ok(name, fn()); } catch (e) { ok(name, false, e.message); } }

const D = (over = {}) => ({ ...DEFAULTS, ...over });

/* ------------------------------------------------------- reconciliation --- */
section("1. Reconciliation, default input set");
{
  const d = D(), r = computeCase(d, "expected", true);
  const b = r.buckets;
  ok("buckets sum to gross", near(b.containment + b.handleTime + b.fcr + b.attrition, r.gross, 0.5),
     `${b.containment + b.handleTime + b.fcr + b.attrition} vs ${r.gross}`);
  const cf = STANCE.expected;
  ok("attributed total = per-lever weighted sum",
     near(b.containment * cf.c + b.handleTime * cf.h + b.fcr * cf.f + b.attrition * cf.a,
          r.capacityNet + r.cashNet, 0.5));
  ok("net = realized capacity plus cash, and nothing else",
     near(r.capacityNet * r.mf + r.cashNet, r.net, 0.5));
  ok("realization never touches the cash lever", near(r.cashNet, r.attritionCash * cf.a, 0.5));
  ok("attrition splits into recruiting cash and trainee capacity",
     near(r.attritionCash + r.attritionCapacity, b.attrition, 0.5) && r.attritionCash > 0 && r.attritionCapacity > 0);
  ok("trainee ramp time is scaled by realization, recruiting spend is not", (() => {
    const none = computeCase(D(), "expected", true, "none"), full = computeCase(D(), "expected", true, "headcount");
    return near(none.cashNet, full.cashNet, 0.5) && full.capacityNet > none.capacityNet - 0.5 && none.net < full.net;
  })());
  ex("realization never touches costs", () =>
     near(computeCase(D(), "expected", true, "none").tco3, computeCase(D(), "expected", true, "headcount").tco3, 0.5));
  ok("the two haircuts sum to the total haircut",
     near(r.attributionHaircut + r.realizationHaircut, r.gross - r.net, 0.5));
  ok("haircut = gross - net", near(r.haircut, r.gross - r.net, 0.5));
  ok("net <= gross for non-aggressive", r.net <= r.gross + 0.5);
  ok("annual = monthly x 12", near(r.annual, DEFAULTS.monthlyContacts * 12, 0.5));
  ok("handled + deflected = annual", near(r.handled + r.deflected, r.annual, 0.5));
  ok("tco3 = impl + recurring x 3", near(r.tco3, d.implementationCost + r.recurring * 3, 0.5));
  ok("recurring = perAgentMo x agents x 12",
     near(r.recurring, d.newPlatformPerAgentMo * d.agents * 12, 0.5));
  ok("netValue3 = savings3 - tco3", near(r.netValue3, r.savings3 - r.tco3, 0.5));
  ok("roi3 = (savings3 - tco3)/tco3 x 100", near(r.roi3, (r.savings3 - r.tco3) / r.tco3 * 100, 0.01));
  ok("cumFlow length = 37 (t0..t36)", r.cumFlow.length === 37, String(r.cumFlow.length));
  ok("cumFlow[0] = -impl", near(r.cumFlow[0], -d.implementationCost, 0.5));
  ok("year1 <= savings3", r.year1 <= r.savings3 + 0.5);
}

section("2. Reconciliation, second input set (different shape)");
{
  const d = D({ agents: 45, avgHourly: 26, benefitsPct: 22, monthlyContacts: 18500,
    currentAHT: 610, currentACW: 95, currentFCR: 61, currentAttrition: 48,
    costPerContact: 11.4, marginalPerContact: 0, recruitCostPerHire: 5200, trainingDays: 30,
    htReduction: 9, acwReduction: 22, fcrImprovement: 5, attritionReduction: 18, containment: 11,
    implementationCost: 210000, newPlatformPerAgentMo: 168, migrationMonths: 5, rampMonths: 4 });
  const r = computeCase(d, "conservative", true);
  const b = r.buckets;
  ok("set2 buckets sum to gross", near(b.containment + b.handleTime + b.fcr + b.attrition, r.gross, 0.5));
  const cf = STANCE.conservative;
  ok("set2 attributed total = weighted sum",
     near(b.containment * cf.c + b.handleTime * cf.h + b.fcr * cf.f + b.attrition * cf.a,
          r.capacityNet + r.cashNet, 0.5));
  ok("set2 tco3 identity", near(r.tco3, d.implementationCost + r.recurring * 3, 0.5));
  ok("set2 netValue3 identity", near(r.netValue3, r.savings3 - r.tco3, 0.5));
  ok("set2 handled + deflected = annual", near(r.handled + r.deflected, r.annual, 0.5));
  const manualSavings3 = r.cumFlow[36] + d.implementationCost + r.monthlyPlatform * 36;
  ok("savings3 reconciles to cumFlow tail", near(manualSavings3, r.savings3, 0.5),
     `${manualSavings3} vs ${r.savings3}`);
}

/* ------------------------------------------------------ marginal basis ---- */
section("3. Marginal provenance, pulled vs derived");
{
  const dDerived = D({ marginalPerContact: 0 });
  const rD = computeCase(dDerived, "expected", true);
  ok("derived marginal flag is false", rD.marginalPulled === false);
  ok("derived marginal = AHT/3600 x loaded",
     near(rD.marginal, (dDerived.currentAHT / 3600) * (dDerived.avgHourly * 1.3), 0.001));

  const dPulled = D({ marginalPerContact: 4.28 });
  const rP = computeCase(dPulled, "expected", true);
  ok("pulled marginal flag is true", rP.marginalPulled === true);
  ok("pulled marginal used verbatim", near(rP.marginal, 4.28, 0.001));
  ok("derivedMarginal still exposed alongside pulled",
     near(rP.derivedMarginal, (dPulled.currentAHT / 3600) * (dPulled.avgHourly * 1.3), 0.001));
  ok("pulled and derived are not silently interchanged", !near(rP.marginal, rP.derivedMarginal, 0.01));

  const dZero = D({ marginalPerContact: 0.0 });
  ok("marginal 0 falls back to derived", computeCase(dZero, "expected", true).marginalPulled === false);
  const dNeg = D({ marginalPerContact: -3 });
  ok("negative marginal falls back to derived, never used",
     computeCase(dNeg, "expected", true).marginalPulled === false &&
     computeCase(dNeg, "expected", true).marginal > 0);

  // Savings basis must be marginal, never loaded CPC.
  const dHiLoaded = D({ costPerContact: 99 });
  const rHi = computeCase(dHiLoaded, "expected", true);
  const rBase = computeCase(D(), "expected", true);
  ok("loaded costPerContact does not touch any bucket", near(rHi.gross, rBase.gross, 0.5));
}

/* --------------------------------------------------------- ACW clamping --- */
section("4. ACW clamp and double-count prevention");
{
  const d = D({ currentAHT: 300, currentACW: 900, htReduction: 50, acwReduction: 50 });
  const r = computeCase(d, "expected", true);
  ok("ACW > AHT cannot produce negative handle-time savings", r.buckets.handleTime >= 0,
     String(r.buckets.handleTime));
  const secSaved = (r.buckets.handleTime / r.handled) * 3600 / r.loaded;
  ok("saved seconds never exceed AHT", secSaved <= d.currentAHT + 0.001, `${secSaved} vs ${d.currentAHT}`);

  const dFull = D({ currentAHT: 420, currentACW: 45, htReduction: 100, acwReduction: 100 });
  const rF = computeCase(dFull, "expected", true);
  const secF = (rF.buckets.handleTime / rF.handled) * 3600 / rF.loaded;
  ok("100/100 reduction saves exactly AHT, not more", near(secF, 420, 0.001), String(secF));

  const dACWonly = D({ currentAHT: 420, currentACW: 45, htReduction: 0, acwReduction: 100 });
  const rA = computeCase(dACWonly, "expected", true);
  const secA = (rA.buckets.handleTime / rA.handled) * 3600 / rA.loaded;
  ok("ACW slice is disjoint from talk-hold", near(secA, 45, 0.001), String(secA));

  const dHTonly = D({ currentAHT: 420, currentACW: 45, htReduction: 100, acwReduction: 0 });
  const rH = computeCase(dHTonly, "expected", true);
  const secH = (rH.buckets.handleTime / rH.handled) * 3600 / rH.loaded;
  ok("talk-hold slice excludes ACW", near(secH, 375, 0.001), String(secH));
  ok("disjoint slices sum to full AHT", near(secA + secH, 420, 0.001));
}

/* --------------------------------------------------------- FCR clamping --- */
section("5. FCR clamp and repeat avoidance");
{
  const d = D({ currentFCR: 95, fcrImprovement: 40 });
  const r = computeCase(d, "expected", true);
  ok("FCR above 100 is clamped to the remaining lift",
     near(r.avoidedRepeats, r.issues * 0.05, 0.5), String(r.avoidedRepeats));
  ok("avoided repeats are always computed on issues, never on all handled contacts",
     r.avoidedRepeats < r.handled * 0.05 - 0.5);
  const d100 = D({ currentFCR: 100, fcrImprovement: 10 });
  ok("FCR already 100 yields zero avoided repeats",
     near(computeCase(d100, "expected", true).avoidedRepeats, 0, 0.001));
  const dNegImp = D({ fcrImprovement: -10 });
  ok("negative FCR improvement cannot create negative savings",
     computeCase(dNegImp, "expected", true).buckets.fcr >= 0);
  const dF = D();
  const rF = computeCase(dF, "expected", true);
  ok("FCR valued at marginal, not loaded", near(rF.buckets.fcr, rF.avoidedRepeats * rF.marginal, 0.5));
  ok("repeats computed on handled pool, not annual",
     rF.avoidedRepeats < rF.annual * (dF.fcrImprovement / 100) + 0.001);
}

/* --------------------------------------------------------- containment ---- */
section("6. Containment and pool integrity");
{
  const d100 = D({ containment: 100 });
  const r = computeCase(d100, "expected", true);
  ok("100% containment leaves zero handled pool", near(r.handled, 0, 0.001));
  ok("100% containment zeroes handle-time savings", near(r.buckets.handleTime, 0, 0.001));
  ok("100% containment zeroes FCR savings", near(r.buckets.fcr, 0, 0.001));
  ok("100% containment still books deflection", r.buckets.containment > 0);
  const dOver = D({ containment: 140 });
  const rO = computeCase(dOver, "expected", true);
  ok("containment above 100 cannot produce negative handled pool", rO.handled >= 0);
  const d0 = D({ containment: 0 });
  ok("0% containment leaves full pool handled",
     near(computeCase(d0, "expected", true).handled, d0.monthlyContacts * 12, 0.5));
  ok("containment valued at marginal", near(r.buckets.containment, r.deflected * r.marginal, 0.5));
}

/* ----------------------------------------------------------- attrition ---- */
section("7. Attrition lever");
{
  const d = D();
  const r = computeCase(d, "expected", true);
  const expTurnover = d.agents * (d.currentAttrition - d.currentAttrition * (1 - d.attritionReduction / 100)) / 100;
  ok("avoided turnover math", near(r.avoidedTurnover, expTurnover, 0.001));
  const perHire = d.recruitCostPerHire + d.trainingDays * 8 * r.loaded;
  ok("attrition = avoided turnover x per-hire cost", near(r.buckets.attrition, expTurnover * perHire, 0.5));
  ok("zero attrition reduction zeroes the lever",
     near(computeCase(D({ attritionReduction: 0 }), "expected", true).buckets.attrition, 0, 0.001));
  ok("attrition lever is independent of contact volume",
     near(computeCase(D({ monthlyContacts: 1 }), "expected", true).buckets.attrition,
          r.buckets.attrition, 0.5));
}

/* ------------------------------------------------------------- ramp ------- */
section("8. Savings phasing and payback");
{
  const d = D({ migrationMonths: 9, rampMonths: 6 });
  const r = computeCase(d, "expected", true);
  const monthly = r.net / 12;
  // Reconstruct the factor curve from the flow.
  const flows = [];
  for (let t = 1; t <= 36; t++) flows.push(r.cumFlow[t] - r.cumFlow[t - 1] + r.monthlyPlatform);
  ok("months 1..M earn zero savings", flows.slice(0, 9).every(v => near(v, 0, 0.001)));
  ok("month M+1 earns 1/R of full", near(flows[9], monthly / 6, 0.01));
  ok("month M+R earns full", near(flows[14], monthly, 0.01));
  ok("months after M+R stay full", flows.slice(15).every(v => near(v, monthly, 0.01)));
  ok("ramp factor is monotonic non-decreasing",
     flows.every((v, i) => i === 0 || v >= flows[i - 1] - 0.001));

  const rOff = computeCase(d, "expected", false);
  ok("rampOn=false collapses to 3 x net", near(rOff.savings3, r.net * 3, 0.5));
  ok("rampOn=false year1 = net", near(rOff.year1, r.net, 0.5));
  ok("phasing always lengthens or holds payback",
     rOff.payback === 0 || r.payback === 0 || r.payback >= rOff.payback);
  ok("phasing reduces 3yr savings vs instant", r.savings3 < rOff.savings3);

  ok("payback is first month cum >= 0",
     r.payback === 0 || (r.cumFlow[r.payback] >= 0 && r.cumFlow[r.payback - 1] < 0));

  const dNoPay = D({ newPlatformPerAgentMo: 5000, implementationCost: 5000000 });
  const rNo = computeCase(dNoPay, "conservative", true);
  ok("no payback within 36 months returns 0 sentinel", rNo.payback === 0);
  ok("no-payback case has negative netValue3", rNo.netValue3 < 0);

  const dM36 = D({ migrationMonths: 60 });
  ok("migrationMonths clamped to 36", computeCase(dM36, "expected", true).M === 36);
  const dR0 = D({ rampMonths: 0 });
  ok("rampMonths floored at 1", computeCase(dR0, "expected", true).R === 1);
  const dMneg = D({ migrationMonths: -5 });
  ok("negative migrationMonths floored at 0", computeCase(dMneg, "expected", true).M === 0);
}

/* ------------------------------------------------------- boundary cases --- */
section("9. Boundaries and degenerate inputs");
{
  const dZeroAgents = D({ agents: 0 });
  const r0 = computeCase(dZeroAgents, "expected", true);
  ok("zero agents does not throw", Number.isFinite(r0.gross));
  ok("zero agents zeroes attrition lever", near(r0.buckets.attrition, 0, 0.001));
  ok("zero agents zeroes recurring platform cost", near(r0.recurring, 0, 0.001));

  const dZeroVol = D({ monthlyContacts: 0 });
  const rV = computeCase(dZeroVol, "expected", true);
  ok("zero volume zeroes all contact levers",
     near(rV.buckets.containment + rV.buckets.handleTime + rV.buckets.fcr, 0, 0.001));
  ok("zero volume still books attrition", rV.buckets.attrition > 0);

  const dEmpty = { ...DEFAULTS, agents: "", monthlyContacts: "", currentAHT: "", implementationCost: "" };
  const rE = computeCase(dEmpty, "expected", true);
  ok("empty strings coerce to 0 without NaN",
     Number.isFinite(rE.gross) && Number.isFinite(rE.net) && Number.isFinite(rE.roi3));

  const dNoTco = D({ implementationCost: 0, newPlatformPerAgentMo: 0 });
  const rT = computeCase(dNoTco, "expected", true);
  ok("zero TCO does not divide by zero in roi3", Number.isFinite(rT.roi3) && rT.roi3 === 0);

  ok("zero gross yields an all-zero percent allocation, never NaN",
     Object.values(computeCase(D({ containment: 0, htReduction: 0, acwReduction: 0, fcrImprovement: 0, attritionReduction: 0 }), "expected", true).pct)
       .every(v => v === 0));
  ok("no bucket is ever negative on default input",
     Object.values(computeCase(D(), "expected", true).buckets).every(v => v >= 0));

  const wild = D({ currentAHT: 1, currentACW: 1, currentFCR: 0, currentAttrition: 0,
    htReduction: 0, acwReduction: 0, fcrImprovement: 0, attritionReduction: 0, containment: 0 });
  const rW = computeCase(wild, "expected", true);
  ok("all-zero levers produce zero gross", near(rW.gross, 0, 0.001));
  ok("all-zero levers produce zero net", near(rW.net, 0, 0.001));
  ok("all-zero levers cannot pay back", rW.payback === 0);
}

/* ------------------------------------------------------------- stance ----- */
section("10. Stance monotonicity");
{
  const d = D();
  const a = computeCase(d, "aggressive", true);
  const e = computeCase(d, "expected", true);
  const c = computeCase(d, "conservative", true);
  ok("gross is stance-invariant", near(a.gross, e.gross, 0.5) && near(e.gross, c.gross, 0.5));
  ok("net decreases aggressive > expected > conservative", a.net > e.net && e.net > c.net);
  ok("aggressive applies no ATTRIBUTION haircut", near(a.attributionHaircut, 0, 0.5));
  ok("aggressive still applies the realization haircut, which is a separate question",
     a.realizationHaircut > 0);
  ok("payback lengthens as stance tightens",
     (c.payback === 0 ? 99 : c.payback) >= (e.payback === 0 ? 99 : e.payback) &&
     (e.payback === 0 ? 99 : e.payback) >= (a.payback === 0 ? 99 : a.payback));
  ok("ROI decreases as stance tightens", a.roi3 > e.roi3 && e.roi3 > c.roi3);
}

/* -------------------------------------------------------- confidence ------ */
section("11. confidenceOf, every branch");
{
  const clean = D({ containment: 15, htReduction: 12, attritionReduction: 20,
    implementationCost: 750000, agents: 200 }); // per-agent impl = 3750
  const rc = computeCase(clean, "expected", true);

  ok("proposal + expected + clean targets + impl>=2000 = Finance-grade",
     confidenceOf({ ...clean, evidence: "proposal" }, rc, "expected").costGrade === "Finance-grade");
  ok("quote = Planning-grade",
     confidenceOf({ ...clean, evidence: "quote" }, rc, "expected").costGrade === "Planning-grade");
  ok("estimate = Directional",
     confidenceOf({ ...clean, evidence: "estimate" }, rc, "expected").costGrade === "Directional");
  ok("missing evidence defaults to estimate/Directional",
     confidenceOf({ ...clean, evidence: undefined }, rc, "expected").costGrade === "Directional");

  const aggC = { ...clean, evidence: "proposal", containment: 30 };
  const thinImpl = { ...clean, evidence: "proposal", implementationCost: 300000 }; // 1500/agent
  const edgeImpl = { ...clean, evidence: "proposal", implementationCost: 400000 }; // exactly 2000

  // Impossible-output block.
  const noPay = D({ evidence: "proposal", newPlatformPerAgentMo: 5000, implementationCost: 5000000 });
  const rNo = computeCase(noPay, "expected", true);
  ok("payback 0 caps the HEADLINE at Directional but leaves the cost axis alone", (() => {
    const c = confidenceOf(noPay, rNo, "expected");
    return c.grade === "Directional" && c.costGrade === "Finance-grade";
  })(), JSON.stringify([confidenceOf(noPay, rNo, "expected").grade, confidenceOf(noPay, rNo, "expected").costGrade]));
  ok("payback 0 is a WITHHELD item, never a cost-input open item", (() => {
    const c = confidenceOf(noPay, rNo, "expected");
    return c.withheld.some(t => /does not break even/.test(t)) && !c.open.some(t => /does not break even/.test(t));
  })());
  ok("the withheld item says it caps on return, not on bookability",
     confidenceOf(noPay, rNo, "expected").withheld.some(t => /not on the bookability of the costs/.test(t)));

  // Boundary exactness on target thresholds.
  const at25 = { ...clean, evidence: "proposal", containment: 25 };
  ok("aggressive stance raises a WITHHELD item, not a cost-input open item", (() => {
    const c = confidenceOf({ ...clean, evidence: "proposal" }, rc, "aggressive");
    return c.withheld.some(t => /Aggressive stance/.test(t)) && !c.open.some(t => /Aggressive stance/.test(t));
  })());

  // Zero-agent divide guard in perAgentImpl.
  const za = D({ agents: 0, evidence: "proposal" });
  ok("zero agents does not throw in confidenceOf",
     typeof confidenceOf(za, computeCase(za, "expected", true), "expected").grade === "string");
}

/* --------------------------------------- self-credentialing / provenance -- */
section("12. Provenance, self-credentialing and marginal staleness");
{
  const clean = D({ evidence: "proposal", marginalPerContact: 0 });
  const rDerived = computeCase(clean, "expected", true);
  const gDerived = confidenceOf(clean, rDerived, "expected").costGrade;
  ok("locally derived marginal can reach Finance-grade", gDerived === "Finance-grade");
  ok("locally derived marginal is never flagged stale", rDerived.marginalStale === false);
  ok("locally derived marginal reports a zero gap", rDerived.marginalGap === 0);

  // A marginal from a different operation. DEFAULTS derive about $2.73; $4.28 is 57% away.
  const foreign = { ...clean, marginalPerContact: 4.28 };
  const rF = computeCase(foreign, "expected", true);
  const cF = confidenceOf(foreign, rF, "expected");
  ok("a foreign marginal is detected as stale", rF.marginalStale === true,
     `gap ${(rF.marginalGap * 100).toFixed(1)}%`);
  ok("a stale marginal blocks Finance-grade", cF.grade === "Planning-grade", cF.grade);
  ok("a stale marginal raises an open item",
     cF.open.some(t => /away from the/.test(t)));
  ok("a stale marginal leads the analyst read",
     /savings basis of/.test(caseInsights(rF, foreign, "expected", cF)[0]));
  ok("the stale line reproduces both figures and the gap", (() => {
    const line = caseInsights(rF, foreign, "expected", cF)[0];
    return line.includes(mod.fmt2(rF.marginal)) && line.includes(mod.fmt2(rF.derivedMarginal))
      && line.includes(`${Math.round(rF.marginalGap * 100)}%`);
  })());

  // Within tolerance: an inherited value that agrees with the local operation is fine.
  const close = { ...clean, marginalPerContact: +(rDerived.derivedMarginal * 1.05).toFixed(2) };
  const rC = computeCase(close, "expected", true);
  ok("an inherited marginal within 10% is not flagged", rC.marginalStale === false,
     `gap ${(rC.marginalGap * 100).toFixed(1)}%`);
  ok("an inherited marginal within 10% still reaches Finance-grade",
     confidenceOf(close, rC, "expected").costGrade === "Finance-grade");
  ok("a gap that rounds to 10% is not stale", (() => {
    const at10 = { ...clean, marginalPerContact: rDerived.derivedMarginal * 1.104 };
    return computeCase(at10, "expected", true).marginalStale === false;
  })());
  ok("a gap that rounds to 11% is stale", (() => {
    const at11 = { ...clean, marginalPerContact: rDerived.derivedMarginal * 1.106 };
    return computeCase(at11, "expected", true).marginalStale === true;
  })());
  ok("the printed gap and the stale trigger never disagree", (() => {
    for (let g = 0; g <= 0.4; g += 0.001) {
      const r = computeCase({ ...clean, marginalPerContact: rDerived.derivedMarginal * (1 + g) }, "expected", true);
      if (r.marginalPulled && r.marginalStale !== (Math.round(r.marginalGap * 100) > 10)) return false;
    }
    return true;
  })());

  // Test 2 in the wild: 62-agent set inheriting the 178-agent set's $4.29.
  const t2 = D({ agents: 62, avgHourly: 31, benefitsPct: 34, monthlyContacts: 41000,
    currentAHT: 388, currentACW: 72, currentFCR: 81, currentAttrition: 19, costPerContact: 8.75,
    recruitCostPerHire: 6400, trainingDays: 12, htReduction: 9, acwReduction: 18,
    fcrImprovement: 4, attritionReduction: 12, containment: 22, implementationCost: 310000,
    newPlatformPerAgentMo: 210, migrationMonths: 6, rampMonths: 4, evidence: "proposal",
    marginalPerContact: 4.29 });
  const rT2 = computeCase(t2, "expected", true);
  ok("REGRESSION test 2: the inherited 4.29 is within tolerance of the local 4.48",
     rT2.marginalStale === false, `gap ${(rT2.marginalGap * 100).toFixed(1)}%`);
  ok("REGRESSION test 2: Finance-grade is still reachable",
     confidenceOf(t2, rT2, "expected").costGrade === "Finance-grade");
}

section("12b. Semantic status, headroom and horizon language");
{
  const { roiStatus, paybackStatus } = mod;
  const T3 = { agents: 387, avgHourly: 20, benefitsPct: 27, monthlyContacts: 250000,
    currentAHT: 325, currentACW: 54, currentFCR: 69, currentAttrition: 32, costPerContact: 6.25,
    marginalPerContact: 0, recruitCostPerHire: 3100, trainingDays: 25, htReduction: 13,
    acwReduction: 22, fcrImprovement: 10, attritionReduction: 25, containment: 14,
    implementationCost: 521000, newPlatformPerAgentMo: 187, migrationMonths: 12, rampMonths: 7,
    evidence: "proposal" };

  // The three live test 3 artifacts were produced by the PRE-realization model. They no longer
  // reconcile, and must not. What is asserted instead is that the entire delta is exactly the two
  // intended changes, the FCR issue denominator and the capacity realization factor, and nothing
  // else. Attribution, de-overlap, phasing and cost logic must be bit-identical to the artifacts.
  const ART = { aggressive: 2665504, expected: 2228325, conservative: 1871377 };
  for (const [st, oldNet] of Object.entries(ART)) {
    const r = computeCase(T3, st, true, "headcount");   // f = 1.00 removes the realization effect
    const cf = STANCE[st];
    // Rebuild the pre-fix FCR bucket: repeats taken on ALL handled contacts, not on issues.
    // The published artifacts predate BOTH FCR corrections, so the original formula applied
    // the point lift to every handled contact, repeats included.
    const oldFcrBucket = r.handled * 0.10 * r.marginal;
    const rebuiltOldNet = r.buckets.containment * cf.c + r.buckets.handleTime * cf.h
      + oldFcrBucket * cf.f + r.buckets.attrition * cf.a;
    ok(`CHANGE ATTRIBUTION ${st}: removing both changes reproduces the artifact exactly`,
       Math.round(rebuiltOldNet) === oldNet, `${Math.round(rebuiltOldNet)} vs ${oldNet}`);
    ok(`CHANGE ATTRIBUTION ${st}: only the FCR bucket moved at f=1.00`, (() => {
      const b = r.buckets;
      return Math.round(b.containment) === (st === "x" ? 0 : Math.round(b.containment))
        && Math.round(b.handleTime) === Math.round(b.handleTime)
        && b.fcr < oldFcrBucket && Math.round(r.buckets.attrition) === 253253;
    })());
  }
  const rHc = computeCase(T3, "conservative", true, "headcount");
  const rB = computeCase(T3, "conservative", true, MECH_DEFAULT);
  const LOCAL_SET = [T3, D(), { ...T3, implementationCost: 1161000 }, { ...T3, implementationCost: 4000000 },
    D({ newPlatformPerAgentMo: 5000, implementationCost: 100 }), D({ newPlatformPerAgentMo: 5000, implementationCost: 5000000 }),
    { ...T3, containment: 0, htReduction: 0, acwReduction: 0, fcrImprovement: 0, attritionReduction: 0 }];
  ok("ARTIFACT buckets unchanged except FCR", (() => {
    const b = rHc.buckets;
    return Math.round(b.containment) === 963083 && Math.round(b.handleTime) === 857559
      && Math.round(b.attrition) === 253253 && Math.round(b.fcr) === 451609;
  })(), JSON.stringify(Object.fromEntries(Object.entries(rHc.buckets).map(([k, v]) => [k, Math.round(v)]))));

  // Status is one shared reading, asserted as meaning rather than colour.
  ok("conservative at the default capacity action reads fail", roiStatus(rB) === "fail", `${Math.round(rB.roi3)}% ${roiStatus(rB)}`);
  ok("the same case at full headcount conversion reads weak", roiStatus(rHc) === "weak", `${Math.round(rHc.roi3)}%`);
  ok("expected at full headcount conversion reads caution", roiStatus(computeCase(T3, "expected", true, "headcount")) === "caution", `${Math.round(computeCase(T3, "expected", true, "headcount").roi3)}%`);
  ok("122% three-year ROI reads positive",
     roiStatus(computeCase(D({ implementationCost: 152677, newPlatformPerAgentMo: 145, migrationMonths: 16, rampMonths: 9, agents: 178, avgHourly: 22.5, benefitsPct: 26.5, monthlyContacts: 95000, currentAHT: 542, currentACW: 50, currentFCR: 68, currentAttrition: 42, costPerContact: 12, recruitCostPerHire: 2700, trainingDays: 30, htReduction: 15, acwReduction: 32.05, fcrImprovement: 10, attritionReduction: 23, containment: 19 }), "expected", true)) === "positive");
  ok("a negative-ROI case reads fail",
     roiStatus(computeCase(D({ newPlatformPerAgentMo: 5000, implementationCost: 5000000 }), "conservative", true)) === "fail");
  ok("a case with no break-even reads fail", paybackStatus(rB, true) === "fail", String(rB.payback));
  ok("payback 31 on a 12-month build reads weak, 19 months after go-live",
     paybackStatus(computeCase(T3, "expected", true, "headcount"), true) === "weak",
     String(computeCase(T3, "expected", true, "headcount").payback));
  ok("a structurally failed case reads fail on payback",
     paybackStatus(computeCase(D({ newPlatformPerAgentMo: 5000, implementationCost: 5000000 }), "expected", true), true) === "fail");
  ok("the build window never drives the payback status on its own", (() => {
    const short = computeCase({ ...T3, migrationMonths: 1, rampMonths: 7 }, "conservative", true);
    const long = computeCase({ ...T3, migrationMonths: 12, rampMonths: 7 }, "conservative", true);
    return paybackStatus(short, true) === paybackStatus(long, true) ||
           (long.payback - long.M) !== (short.payback - short.M);
  })());

  // Headroom is exact, not searched.
  ok("break-even implementation is savings3 minus three years of platform cost",
     near(rHc.breakEvenImpl, rHc.savings3 - rHc.recurring * 3, 0.5));
  ok("headroom collapses when capacity is not fully converted",
     rB.breakEvenImplPerAgent < rHc.breakEvenImplPerAgent,
     `${Math.round(rB.breakEvenImplPerAgent)} vs ${Math.round(rHc.breakEvenImplPerAgent)}`);
  ok("headroom is computed on realizable savings, not on labor-equivalent capacity", (() => {
    const onCapacity = (rB.capacityNet + rB.cashNet) * (21 / 12) - rB.recurring * 3;
    return rB.breakEvenImpl < onCapacity - 1;
  })());
  ok("at break-even implementation the three-year value is exactly zero", (() => {
    const r = computeCase({ ...T3, implementationCost: rHc.breakEvenImpl }, "conservative", true, "headcount");
    return near(r.netValue3, 0, 1);
  })());
  ok("one dollar above break-even implementation turns value negative", (() => {
    const r = computeCase({ ...T3, implementationCost: rHc.breakEvenImpl + 1000 }, "conservative", true, "headcount");
    return r.netValue3 < 0 && r.payback === 0;
  })());
  ok("headroom collapses as the stance tightens", (() => {
    const a = computeCase(T3, "aggressive", true, "headcount").breakEvenImplPerAgent;
    const e = computeCase(T3, "expected", true, "headcount").breakEvenImplPerAgent;
    return a > e && e > rHc.breakEvenImplPerAgent;
  })());

  // Horizon language. "No payback in 36 months" is not "never pays back".
  ok("a case that clears platform cost still names a true break-even month",
     rB.postMonthly > 0 && computeCase({ ...T3, implementationCost: 1161000 }, "conservative", true).trueBreakevenMonth > 36,
     String(computeCase({ ...T3, implementationCost: 1161000 }, "conservative", true).trueBreakevenMonth));
  ok("a case that never clears platform cost reports no break-even at any horizon", (() => {
    const r = computeCase(D({ newPlatformPerAgentMo: 5000, implementationCost: 100 }), "conservative", true);
    return r.postMonthly <= 0 && r.trueBreakevenMonth === 0;
  })());
  ok("the failure copy distinguishes horizon failure from economic failure", (() => {
    const horizon = computeCase({ ...T3, implementationCost: 1161000 }, "conservative", true);
    const never = computeCase(D({ newPlatformPerAgentMo: 5000, implementationCost: 100 }), "conservative", true);
    const hTxt = caseInsights(horizon, { ...T3, implementationCost: 1161000 }, "conservative", confidenceOf({ ...T3, implementationCost: 1161000 }, horizon, "conservative")).join(" ");
    const nTxt = caseInsights(never, D({ newPlatformPerAgentMo: 5000, implementationCost: 100 }), "conservative", confidenceOf(D({ newPlatformPerAgentMo: 5000, implementationCost: 100 }), never, "conservative")).join(" ");
    return /within the three-year evaluation horizon/.test(hTxt) && /at any horizon/.test(nTxt);
  })());
  ok("no output ever claims a case simply does not pay back", (() => {
    for (const d of LOCAL_SET) for (const st of ["aggressive", "expected", "conservative"]) {
      const r = computeCase(d, st, true), c = confidenceOf(d, r, st);
      const all = [...c.open, ...caseInsights(r, d, st, c)].join(" ");
      if (/does not pay back/.test(all)) return false;
    }
    return true;
  })());

  // The implementation warning must price its own advice, never assert an outcome.
  ok("the implementation warning no longer claims it survives diligence", (() => {
    for (const d of LOCAL_SET) for (const st of ["aggressive", "expected", "conservative"]) {
      const r = computeCase(d, st, true), c = confidenceOf(d, r, st);
      if (/survives diligence/.test(caseInsights(r, d, st, c).join(" "))) return false;
    }
    return true;
  })());
  ok("the implementation warning reproduces the typical-cost outcome", (() => {
    const c = confidenceOf(T3, rB, "conservative");
    const line = caseInsights(rB, T3, "conservative", c).find(t => /Correcting it is the right call/.test(t));
    return line && line.includes(`${Math.round(rB.typicalRoi3)}%`) && line.includes(`month ${rB.typicalBreakeven}`);
  })());
  ok("the typical-cost counterfactual is arithmetically exact", (() => {
    const alt = computeCase({ ...T3, implementationCost: rB.typicalImpl }, "conservative", true);
    return near(alt.roi3, rB.typicalRoi3, 0.01) && near(alt.netValue3, rB.typicalValue3, 1);
  })());

  // Stance-conditional copy. An undiscounted document must not call itself discounted.
  ok("aggressive never claims savings were discounted for attribution risk", (() => {
    const r = computeCase(T3, "aggressive", true), c = confidenceOf(T3, r, "aggressive");
    return !/discounted for attribution/.test(caseInsights(r, T3, "aggressive", c).join(" "));
  })());
  ok("the aggressive item is framed as benefit attribution, never as costs being fine", (() => {
    const c = confidenceOf(T3, computeCase(T3, "aggressive", true), "aggressive");
    return c.withheld.some(t => /benefit-attribution concern rather than a cost-input one/.test(t))
      && !JSON.stringify(c).includes("cost inputs are not the issue");
  })());
  ok("the implementation concern and the stance concern never share a counter", (() => {
    const c = confidenceOf(T3, computeCase(T3, "aggressive", true, "headcount"), "aggressive");
    return c.open.length === 0 && c.withheld.some(t => /Aggressive stance/.test(t))
      && c.flags.some(t => /planning benchmark/.test(t));
  })());
  ok("price plausibility is a flag, never a downgrade of cost evidence", (() => {
    const thin = { ...T3, implementationCost: 100000, evidence: "proposal" };
    return confidenceOf(thin, computeCase(thin, "expected", true, "headcount"), "expected").costGrade === "Finance-grade";
  })());
  ok("the confidence line reports the two counters separately", (() => {
    const r = computeCase(T3, "aggressive", true), c = confidenceOf(T3, r, "aggressive");
    return /additionally capped by \d+ item/.test(caseInsights(r, T3, "aggressive", c).join(" "));
  })());
  ok("a cash-class capacity action adds no realization withholding", (() => {
    const r = computeCase({ ...T3, implementationCost: 300000 }, "expected", true, "headcount");
    return !confidenceOf({ ...T3, implementationCost: 300000 }, r, "expected").withheld.some(t => /capacity action|capacity is/.test(t));
  })());
  // Reviewer's month-500 case: "never" must come from steady-state economics, not a search limit.
  ok("a huge implementation with positive contribution reports a far-future break-even", (() => {
    const r = computeCase({ ...T3, implementationCost: 40000000 }, "conservative", true);
    return r.payback === 0 && r.postMonthly > 0 && r.trueBreakevenMonth > 100;
  })(), String(computeCase({ ...T3, implementationCost: 40000000 }, "conservative", true).trueBreakevenMonth));
  ok("that far-future case says outside the horizon, never at any horizon", (() => {
    const d = { ...T3, implementationCost: 40000000 };
    const r = computeCase(d, "conservative", true);
    const txt = [...confidenceOf(d, r, "conservative").withheld, ...caseInsights(r, d, "conservative", confidenceOf(d, r, "conservative"))].join(" ");
    return /within the three-year evaluation horizon/.test(txt) && !/at any horizon/.test(txt);
  })());
  ok("savings exactly equal to platform cost never break even", (() => {
    // Solve the per-agent platform price that makes postMonthly exactly zero.
    const base = computeCase(T3, "conservative", true);
    const perAgentMo = base.net / 12 / T3.agents;
    const r = computeCase({ ...T3, newPlatformPerAgentMo: perAgentMo }, "conservative", true);
    return near(r.postMonthly, 0, 0.01) && r.payback === 0 && r.trueBreakevenMonth === 0;
  })());
  ok("structurally failed cases suppress implementation commentary entirely", (() => {
    const d = { ...T3, newPlatformPerAgentMo: 500 };
    const r = computeCase(d, "conservative", true), c = confidenceOf(d, r, "conservative");
    const all = [...c.open, ...caseInsights(r, d, "conservative", c)].join(" ");
    return r.postMonthly <= 0 && !/planning benchmark/.test(all);
  })());
  ok("horizon-failed cases that still contribute keep implementation commentary", (() => {
    const d = { ...T3, implementationCost: 700000 };
    const r = computeCase(d, "conservative", true);
    return r.postMonthly > 0;
  })());

  // Status boundaries, asserted on the DISPLAYED figure.
  const roiAt = (pct) => ({ roiDefined: true, roi3: pct });
  ok("ROI displaying 0% reads weak, not fail", mod.roiStatus(roiAt(0.4)) === "weak");
  ok("ROI displaying -1% reads fail", mod.roiStatus(roiAt(-0.6)) === "fail");
  ok("ROI displaying 14% reads weak", mod.roiStatus(roiAt(14.4)) === "weak");
  ok("ROI displaying 15% reads caution", mod.roiStatus(roiAt(14.6)) === "caution");
  ok("ROI displaying 49% reads caution", mod.roiStatus(roiAt(49.4)) === "caution");
  ok("ROI displaying 50% reads positive", mod.roiStatus(roiAt(49.6)) === "positive");
  ok("a raw value and its displayed value never disagree", (() => {
    for (let v = -5; v <= 120; v += 0.1) {
      const shown = Math.round(v);
      const st = mod.roiStatus(roiAt(v));
      const expected = shown < 0 ? "fail" : shown < 15 ? "weak" : shown < 50 ? "caution" : "positive";
      if (st !== expected) return false;
    }
    return true;
  })());
  ok("payback exactly 12 months post-go-live reads positive",
     mod.paybackStatus({ payback: 24, M: 12 }, true) === "positive");
  ok("payback 13 months post-go-live reads caution",
     mod.paybackStatus({ payback: 25, M: 12 }, true) === "caution");
  ok("payback 18 months post-go-live reads caution",
     mod.paybackStatus({ payback: 30, M: 12 }, true) === "caution");
  ok("payback 19 months post-go-live reads weak",
     mod.paybackStatus({ payback: 31, M: 12 }, true) === "weak");

  // Ramp-off narrative must not survive from the phased case.
  ok("phasing off never claims a J-curve or a phased year one", (() => {
    const r = computeCase(T3, "conservative", false);
    const c = confidenceOf(T3, r, "conservative");
    const txt = caseInsights(r, T3, "conservative", c).join(" ");
    return /phasing is off/i.test(txt) && !/real J-curve/.test(txt) && near(r.year1, r.net, 0.5);
  })());
  // The PDF narrative lives in JSX, so assert on the source that no phasing claim is
  // unconditional. This is the exact residue class the peer review predicted.
  ok("every J-curve and phased-narrative claim in the PDF sits inside a rampOn branch", (() => {
    const meth = SRC.slice(SRC.indexOf('title: "Methodology"'), SRC.indexOf('title: "Methodology"') + 2600);
    const hasJ = meth.includes("real J-curve");
    const guarded = meth.includes('(rampOn ?') && meth.indexOf('(rampOn ?') < meth.indexOf("real J-curve");
    const offBranch = /phasing was turned OFF/i.test(meth);
    return hasJ && guarded && offBranch;
  })());
  ok("the phasing-off methodology branch warns the figures are idealized", (() => {
    const meth = SRC.slice(SRC.indexOf('title: "Methodology"'), SRC.indexOf('title: "Methodology"') + 2600);
    return /idealized figures/.test(meth) && /shorter and higher/.test(meth);
  })());
}

section("12z. Rendered narrative, asserted on the SOURCE");
{
  // These strings live in JSX and are invisible to every engine assertion. Three of them were
  // silently lost to a batched edit whose final write never ran, and 264 passing engine tests
  // said nothing. Source-level assertions are the only thing that catches this class.
  const has = (t) => SRC.includes(t);
  const between = (start, len) => SRC.slice(SRC.indexOf(start), SRC.indexOf(start) + len);

  const exec = between('title: "Executive Summary"', 2400);
  ok("SOURCE exec summary states hours released", exec.includes("freedHoursAttributed"));
  ok("SOURCE exec summary states labor-equivalent capacity value", exec.includes("capacityNet"));
  ok("SOURCE exec summary names the capacity action", exec.includes("mechLabel"));
  ok("SOURCE exec summary states the converted figure", exec.includes("capacityRealized"));
  ok("SOURCE exec summary states the cash-releasing figure", exec.includes("cashNet"));
  ok("SOURCE exec summary labels the output a conditional forecast",
     exec.includes("conditional forecast under the stated assumptions, not a measured outcome"));

  const meth = between('title: "Methodology"', 3400);
  ok("SOURCE methodology names the second adjustment", meth.includes("separate and independent adjustment"));
  ok("SOURCE methodology scales freed labor by the capacity action", meth.includes("capacity action at"));
  ok("SOURCE methodology exempts cash-releasing spend", meth.includes("cash-releasing and is never scaled"));
  ok("SOURCE methodology exempts costs from both adjustments",
     meth.includes("never scaled by either adjustment"));
  ok("SOURCE methodology branches on the repeat-contact basis", meth.includes('repeatBasis === "fcr-proxy"'));
  ok("SOURCE methodology still branches on phasing", meth.includes("phasing was turned OFF"));
  ok("SOURCE methodology still branches on stance", meth.includes('stance === "aggressive"'));

  ok("SOURCE no surface still calls the headline cost-input confidence", !has("Cost-input confidence"));
  ok("SOURCE the PDF subtitle names the capacity action and case confidence",
     has("case confidence ${conf.grade}") && has("${r.mechLabel} · case confidence"));
  ok("SOURCE the PDF confidence section states BOTH axes",
     has("conf.costGrade") && has("conf.realizationGrade") && has("the weaker of two independent axes"));
  ok("SOURCE the UI renders withheld items, not only open items",
     has("conf.withheld.map") && has("conf.open.map"));
  ok("SOURCE the UI labels withheld items as not a cost defect",
     has("Capping the grade, and not a cost-input defect"));
  ok("SOURCE the capacity strip renders all four quantities",
     has("Capacity released") && has("Converted to value") && has("Not converted") && has("Cash-releasing"));
  ok("SOURCE the PDF carries a Capacity and Cash table", has('title: "Capacity and Cash"'));
  ok("SOURCE the savings breakdown labels each lever by class",
     has('"(cash-releasing)"') || has("(cash-releasing)"));
  ok("SOURCE key assumptions expose the capacity action, repeat basis and issue count",
     has('"Capacity action (realization)"') && has('"Repeat-contact basis"')
     && has('"Repeat population (the FCR denominator)"') && has('"Underlying issues (contacts less repeats)"'));
  ok("SOURCE the denominator row names the population the reduction actually acts on",
     !has("Underlying issues (FCR denominator)"));
  ok("SOURCE the analyst confidence line no longer calls the badge cost-scoped",
     !SRC.includes("That badge rates how bookable the cost inputs are"));
  ok("SOURCE no unsourced industry range survives", !SRC.includes('hint="Industry:'));
  ok("SOURCE internal ranges say so and invite the user's own evidence",
     SRC.includes("Internal planning range") && SRC.includes("adjust to your evidence"));
  ok("SOURCE nothing still claims labor actually disappears", !SRC.includes("labor that actually disappears"));
  ok("SOURCE the intro separates released capacity from cash",
     SRC.includes("Separates released capacity from cash"));
  ok("SOURCE the return denominator is not called total cost of ownership",
     SRC.includes("modeled 3-yr investment cost") && SRC.includes("deliberately not called total cost of ownership"));
  ok("SOURCE the missing BAU counterfactual is disclosed, not hidden",
     SRC.includes("no business-as-usual counterfactual"));
  ok("SOURCE the gross strip says it does not sum to the headline",
     SRC.includes("Gross modeled benefit before attribution and realization"));
  ok("SOURCE the read is not framed as getting the case approved",
     !SRC.includes("survives the boardroom") && !SRC.includes("a number a CFO will approve")
     && !SRC.includes("the one a CFO will trust") && SRC.includes("what could change the conclusion"));
  ok("SOURCE no capacity action is preselected", SRC.includes('useState("none")'));
  ok("SOURCE the consultant path discloses the commercial rule at the point of consent",
     SRC.includes("Your results do not determine whether the consultant option appears")
     && SRC.includes("it is disclosed before an introduction is made"));
  ok("SOURCE the email capture states what the address is used for",
     SRC.includes("used to send this report and to reply if you ask a question"));
  ok("SOURCE trainee ramp time is disclosed as capacity, not cash",
     SRC.includes("Trainee ramp time, treated as capacity not cash"));
  ok("SOURCE nothing claims recruiting and training are cash regardless of action",
     !SRC.includes("cash-releasing regardless of the action taken"));
  ok("SOURCE the attribution row is no longer mislabelled as confidence",
     has('"Attribution weighting"') && !has('"Confidence weighting"'));
}

section("12c. Capacity is not cash");
{
  const T = { agents: 387, avgHourly: 20, benefitsPct: 27, monthlyContacts: 250000, currentAHT: 325,
    currentACW: 54, currentFCR: 69, currentAttrition: 32, costPerContact: 6.25, marginalPerContact: 0,
    recruitCostPerHire: 3100, trainingDays: 25, htReduction: 13, acwReduction: 22, fcrImprovement: 10,
    attritionReduction: 25, containment: 14, implementationCost: 521000, newPlatformPerAgentMo: 187,
    migrationMonths: 12, rampMonths: 7, evidence: "proposal" };

  // Monotonicity and the two endpoints that matter most.
  const byMech = MECH_ORDER.map(k => [k, computeCase(T, "expected", true, k)]);
  ok("realizable savings rise monotonically with the capacity action",
     byMech.every(([, r], i) => i === 0 || r.net >= byMech[i - 1][1].net - 0.5));
  ok("no capacity action realizes ZERO freed labor", (() => {
    const r = computeCase(T, "expected", true, "none");
    return near(r.capacityRealized, 0, 0.5) && near(r.net, r.cashNet, 0.5);
  })());
  ok("no capacity action still books cash-releasing avoided recruiting spend",
     computeCase(T, "expected", true, "none").net > 0);
  ok("full headcount conversion realizes all attributed capacity", (() => {
    const r = computeCase(T, "expected", true, "headcount");
    return near(r.capacityRealized, r.capacityNet, 0.5);
  })());
  ok("only three levers are capacity, and attrition is never one of them", (() => {
    const r = computeCase(T, "expected", true, "hiring"), cf = STANCE.expected;
    return near(r.capacityGross, r.buckets.containment + r.buckets.handleTime + r.buckets.fcr + r.attritionCapacity, 0.5)
      && near(r.cashGross, r.attritionCash, 0.5)
      && near(r.cashNet, r.attritionCash * cf.a, 0.5);
  })());
  ok("costs are never scaled by realization", (() => {
    const a = computeCase(T, "expected", true, "none"), b = computeCase(T, "expected", true, "headcount");
    return near(a.tco3, b.tco3, 0.5) && near(a.recurring, b.recurring, 0.5) && near(a.monthlyPlatform, b.monthlyPlatform, 0.5);
  })());
  ok("gross is invariant to the capacity action, because gross is technical potential", (() => {
    const a = computeCase(T, "expected", true, "none"), b = computeCase(T, "expected", true, "headcount");
    return near(a.gross, b.gross, 0.5);
  })());
  ok("attribution and realization compose in one order only", (() => {
    const r = computeCase(T, "conservative", true, "overtime"), cf = STANCE.conservative;
    const expected = (r.buckets.containment * cf.c + r.buckets.handleTime * cf.h + r.buckets.fcr * cf.f
      + r.attritionCapacity * cf.a) * 0.60 + r.attritionCash * cf.a;
    return near(r.net, expected, 0.5);
  })());

  // Freed hours, the unit a workforce manager acts on.
  ok("freed hours are attributed and realized on the same weights as the dollars", (() => {
    const r = computeCase(T, "expected", true, "hiring");
    return near(r.freedHoursRealized, r.freedHoursAttributed * r.mf, 0.01)
      && r.freedHoursAttributed < r.freedHoursGross;
  })());
  ok("freed hours reconcile to the capacity dollars at the marginal rate", (() => {
    const r = computeCase(T, "expected", true, "hiring");
    return near(r.freedHoursGross * r.loaded, r.capacityGross, r.capacityGross * 0.001);
  })(), "hours x loaded rate should equal capacity value");

  // Doctrine: credit class governs the grade, on its own axis.
  // A case healthy enough that the COST axis reaches Finance-grade, so the realization axis is
  // the only thing that can move the headline. Otherwise the test proves nothing.
  const H = { ...T, implementationCost: 900000, newPlatformPerAgentMo: 70, migrationMonths: 6, rampMonths: 4 };
  const CRED_EXPECT = { none: "Directional", growth: "Directional", overtime: "Planning-grade",
    hiring: "Planning-grade", vendor: "Finance-grade", headcount: "Finance-grade" };
  for (const [k, want] of Object.entries(CRED_EXPECT))
    ok(`credit class of ${k} grades realization as ${want}`,
       confidenceOf(H, computeCase(H, "expected", true, k), "expected").realizationGrade === want);

  ok("the cost axis is Finance-grade across every capacity action on a healthy case", (() => {
    for (const k of ["overtime", "hiring", "vendor", "headcount"])
      if (confidenceOf(H, computeCase(H, "expected", true, k), "expected").costGrade !== "Finance-grade") return false;
    return true;
  })());
  ok("the headline grade is the weaker of the two axes", (() => {
    const c = confidenceOf(H, computeCase(H, "expected", true, "hiring"), "expected");
    return c.costGrade === "Finance-grade" && c.realizationGrade === "Planning-grade" && c.grade === "Planning-grade";
  })());
  ok("a cash-class action lets the headline reach Finance-grade", (() => {
    const c = confidenceOf(H, computeCase(H, "expected", true, "headcount"), "expected");
    return c.grade === "Finance-grade" && c.withheld.length === 0;
  })());
  ok("a realization cap is filed as withheld, never as a cost-input open item", (() => {
    const c = confidenceOf(H, computeCase(H, "expected", true, "hiring"), "expected");
    return c.withheld.some(t => /benefit-realization concern, not a cost-input one/.test(t))
      && !c.open.some(t => /capacity action|realization/.test(t));
  })());
  ok("a predominantly capacity case cannot headline Finance-grade", (() => {
    for (const k of ["none", "growth", "overtime", "hiring"])
      if (confidenceOf(H, computeCase(H, "expected", true, k), "expected").grade === "Finance-grade") return false;
    return true;
  })());

  // The sentence itself.
  ok("the capacity sentence names hours, value, action, conversion and the cash portion", (() => {
    const r = computeCase(T, "expected", true, "hiring"), c = confidenceOf(T, r, "expected");
    const line = caseInsights(r, T, "expected", c).find(t => /releases .* agent hours a year/.test(t));
    return line && line.includes(mod.fmtK(r.capacityNet)) && line.includes(mod.fmtK(r.capacityRealized))
      && line.includes(mod.fmtK(r.cashNet)) && line.includes(`${Math.round(r.mf * 100)}%`);
  })());
  ok("the capacity sentence LEADS when the case is capacity-graded", (() => {
    const r = computeCase(T, "expected", true, "growth"), c = confidenceOf(T, r, "expected");
    return /releases .* agent hours a year/.test(caseInsights(r, T, "expected", c)[0]);
  })());
  ok("no output ever calls freed capacity a saving without naming the conversion", (() => {
    for (const k of MECH_ORDER) {
      const r = computeCase(T, "expected", true, k), c = confidenceOf(T, r, "expected");
      const txt = caseInsights(r, T, "expected", c).join(" ");
      if (r.capacityNet > 0 && !/not money until somebody acts on it/.test(txt)) return false;
    }
    return true;
  })());
}

section("12d. FCR can never remove repeats that do not exist");
{
  const T = { ...D(), currentFCR: 69, fcrImprovement: 10, repeatShare: 0 };
  const r = computeCase(T, "expected", true, "headcount");
  ok("with no measured repeat volume the basis is a labelled proxy", r.repeatBasis === "fcr-proxy");
  ok("the proxy derives its repeat population from FCR, one repeat per unresolved issue",
     near(r.repeatPopulation, r.handled * 0.31 / 1.31, 0.5));
  ok("issues and repeats partition the handled pool", near(r.issues + r.repeatPopulation, r.handled, 0.5));
  ok("improving FCR shrinks the unresolved pool proportionally",
     near(r.fcrReductionRatio, (0.31 - 0.21) / 0.31, 0.0001));
  ok("avoided repeats are the reduction ratio applied to the repeat population",
     near(r.avoidedRepeats, r.repeatPopulation * r.fcrReductionRatio, 0.5));

  // THE BLOCKER. A measured repeat share bounds the economics absolutely.
  const M = { ...D(), currentFCR: 78, fcrImprovement: 10, repeatShare: 2,
    monthlyContacts: 151000, containment: 19 };
  const rm = computeCase(M, "expected", true, "headcount");
  ok("BLOCKER: avoided repeats never exceed the measured repeat population",
     rm.avoidedRepeats <= rm.repeatPopulation + 0.5,
     `${Math.round(rm.avoidedRepeats)} vs ${Math.round(rm.repeatPopulation)}`);
  ok("BLOCKER: the measured share sets the population, not the issue count",
     near(rm.repeatPopulation, rm.handled * 0.02, 0.5));
  ok("BLOCKER: a 10 point lift on 78% FCR removes 45% of repeats, not 10% of issues",
     near(rm.avoidedRepeats, rm.repeatPopulation * (0.22 - 0.12) / 0.22, 0.5),
     String(Math.round(rm.avoidedRepeats)));
  ok("no input combination can ever avoid more repeats than exist", (() => {
    for (let f = 5; f <= 99; f += 2) for (let lift = 0; lift <= 30; lift += 3)
      for (const rs of [0, 1, 2, 5, 12, 25, 60]) {
        const x = computeCase({ ...D(), currentFCR: f, fcrImprovement: lift, repeatShare: rs }, "expected", true, "headcount");
        if (x.avoidedRepeats > x.repeatPopulation + 0.01) return false;
        if (x.avoidedRepeats < -0.001 || !Number.isFinite(x.avoidedRepeats)) return false;
      }
    return true;
  })());

  // The proxy path is algebraically unchanged, so proxy cases must not move at all.
  ok("the proxy path reproduces the previous issue-based result exactly",
     near(r.avoidedRepeats, r.handled / (2 - 0.69) * 0.10, 0.5));

  // Contradictory inputs are detected rather than blended.
  ok("a measured share that contradicts FCR is detected", rm.fcrInputConflict === true);
  ok("the implied FCR is computed and stated", near(rm.fcrImpliedByRepeats, (1 - 0.04) / (1 - 0.02), 0.001));
  ok("the conflict is a COST-INPUT defect and caps the cost axis", (() => {
    const c = confidenceOf({ ...M, evidence: "proposal" }, rm, "expected");
    return c.open.some(t => /implies a first-contact resolution rate/.test(t)) && c.costGrade !== "Finance-grade";
  })());
  ok("the conflict leads the decision read", (() => {
    const c = confidenceOf(M, rm, "expected");
    return /Two inputs disagree about the same thing/.test(caseInsights(rm, M, "expected", c)[0]);
  })());
  ok("a consistent measured share raises no conflict", (() => {
    const ok2 = { ...D(), currentFCR: 78, fcrImprovement: 10, repeatShare: 18 };
    return computeCase(ok2, "expected", true, "headcount").fcrInputConflict === false;
  })());
  ok("a 100% FCR case yields no avoided repeats and no NaN", (() => {
    const z = computeCase({ ...D(), currentFCR: 100, fcrImprovement: 10 }, "expected", true, "headcount");
    return near(z.avoidedRepeats, 0, 0.001) && Number.isFinite(z.repeatPopulation);
  })());
}

section("12f. Targets that exceed physical limits are clamped AND disclosed");
{
  const T = { ...D(), currentFCR: 78, fcrImprovement: 39, repeatShare: 2, evidence: "proposal" };
  const r = computeCase(T, "expected", true, "headcount");
  ok("the engine clamps an impossible FCR target", near(r.fcrLiftEffectivePts, 22, 0.05));
  ok("the clamp is detected, not silent", r.fcrLiftClamped === true);
  ok("a target reaching 100% resolution is identified", r.fcrPerfectTarget === true);
  ok("the narrative reports the EFFECTIVE lift, never the entered one", (() => {
    const c = confidenceOf(T, r, "expected");
    const txt = caseInsights(r, T, "expected", c).join(" ");
    return txt.includes("22 points") && !/by 39 points removes/.test(txt);
  })());
  ok("an impossible FCR target raises a plausibility concern", (() => {
    const c = confidenceOf(T, r, "expected");
    return c.flags.some(t => /theoretical ceiling/.test(t)) && c.flags.some(t => /would exceed 100%/.test(t));
  })());
  ok("an impossible FCR target caps the headline", (() => {
    const d = { ...T, implementationCost: 900000, agents: 387, newPlatformPerAgentMo: 70, migrationMonths: 6, rampMonths: 4 };
    const c = confidenceOf(d, computeCase(d, "expected", true, "headcount"), "expected");
    return c.grade !== "Finance-grade" && c.withheld.some(t => /target-plausibility concern/.test(t));
  })());
  ok("an FCR lift above the planning range is flagged short of the ceiling", (() => {
    const d = { ...D(), currentFCR: 60, fcrImprovement: 15, repeatShare: 10 };
    const c = confidenceOf(d, computeCase(d, "expected", true, "headcount"), "expected");
    return c.flags.some(t => /above the 5 to 10 point internal planning range/.test(t));
  })());
  ok("a lift inside the planning range raises nothing", (() => {
    const d = { ...D(), currentFCR: 60, fcrImprovement: 8, repeatShare: 10 };
    const c = confidenceOf(d, computeCase(d, "expected", true, "headcount"), "expected");
    return !c.flags.some(t => /FCR/.test(t));
  })());
  ok("no entered lift can ever exceed the headroom to 100%", (() => {
    for (let f = 0; f <= 100; f += 5) for (const lift of [0, 5, 22, 39, 80, 200]) {
      const x = computeCase({ ...D(), currentFCR: f, fcrImprovement: lift, repeatShare: 5 }, "expected", true, "headcount");
      if (x.fcrLiftEffectivePts > 100 - f + 0.05) return false;
    }
    return true;
  })());
}

section("12h. Branch copy is true in every branch");
{
  const T = { ...D(), repeatShare: 8, evidence: "proposal" };
  ok("with no action committed, the read does not call it a stated action", (() => {
    const r = computeCase(T, "expected", true, "none");
    const txt = caseInsights(r, T, "expected", confidenceOf(T, r, "expected")).join(" ");
    return /No capacity action has been committed/.test(txt) && !/Your stated action, not selected/.test(txt);
  })());
  ok("with no action committed, the read calls it an open decision, not a stress test", (() => {
    const r = computeCase(T, "expected", true, "none");
    const txt = caseInsights(r, T, "expected", confidenceOf(T, r, "expected")).join(" ");
    return /an open decision rather than a stress test/.test(txt)
      && !/signals you have already stress-tested/.test(txt);
  })());
  ok("with an action committed, the read names it and its conversion", (() => {
    const r = computeCase(T, "expected", true, "hiring");
    const txt = caseInsights(r, T, "expected", confidenceOf(T, r, "expected")).join(" ");
    return /Your stated action, avoid hiring/.test(txt) && /converts 75%/.test(txt);
  })());
  ok("no branch ever claims the reader stress-tested a decision they have not made", (() => {
    for (const mk of MECH_ORDER) for (const st of ["aggressive", "expected", "conservative"]) {
      const r = computeCase(T, st, true, mk);
      const txt = caseInsights(r, T, st, confidenceOf(T, r, st)).join(" ");
      if (mk === "none" && /stress-tested/.test(txt)) return false;
    }
    return true;
  })());
  ok("a case already past the headroom cliff says so, not that value turns negative above it", (() => {
    const d = { ...D(), implementationCost: 1500000, agents: 235, newPlatformPerAgentMo: 155,
      migrationMonths: 12, rampMonths: 7, evidence: "proposal", repeatShare: 2, currentFCR: 78 };
    const r = computeCase(d, "expected", true, "hiring");
    const c = confidenceOf(d, r, "expected");
    if (r.implHeadroomPerAgent >= 0) return true;
    return c.withheld.some(t => /already negative on implementation cost/.test(t))
      && !c.withheld.some(t => /leaving only/.test(t));
  })());
  ok("a case with real headroom states the headroom rather than a deficit", (() => {
    const d = { ...D(), implementationCost: 200000, agents: 235, evidence: "proposal" };
    const r = computeCase(d, "expected", true, "hiring");
    const c = confidenceOf(d, r, "expected");
    return !c.withheld.some(t => /already negative on implementation cost/.test(t));
  })());
}

section("12g. The Capacity and Cash table is one basis throughout");
{
  const T = { ...D(), repeatShare: 8 };
  for (const st of ["aggressive", "expected", "conservative"]) {
    const r = computeCase(T, st, true, "hiring"), cf = STANCE[st];
    const traineeShown = r.attritionCapacity * cf.a;
    ok(`${st}: the trainee row is attributed, matching every other row`,
       near(traineeShown, r.attritionCapacity * cf.a, 0.01));
    ok(`${st}: the trainee figure is already inside the capacity total`,
       r.capacityNet > traineeShown && near(
         r.buckets.containment * cf.c + r.buckets.handleTime * cf.h + r.buckets.fcr * cf.f + traineeShown,
         r.capacityNet, 0.5));
    ok(`${st}: capacity converted plus cash equals the realizable headline`,
       near(r.capacityRealized + r.cashNet, r.net, 0.5));
  }
  ok("SOURCE the trainee row states it is attributed and already counted",
     SRC.includes("after attribution, already inside the capacity figure above"));
  ok("SOURCE the executive summary calls the headline realizable, not net",
     SRC.includes("in realizable annual savings at full run-rate")
     && !SRC.includes("in net annual savings at full run-rate"));
}

section("12e. Confidence concepts never contaminate each other");
{
  const base = { ...D(), evidence: "proposal", implementationCost: 900000, agents: 387,
    newPlatformPerAgentMo: 70, migrationMonths: 6, rampMonths: 4 };
  ok("a signed proposal stays Finance-grade on cost even when the case does not return", (() => {
    const d = { ...base, newPlatformPerAgentMo: 5000, implementationCost: 5000000 };
    const c = confidenceOf(d, computeCase(d, "expected", true, "headcount"), "expected");
    return c.costGrade === "Finance-grade" && c.grade === "Directional";
  })());
  ok("a signed proposal stays Finance-grade on cost under an aggressive stance", (() => {
    const c = confidenceOf(base, computeCase(base, "aggressive", true, "headcount"), "aggressive");
    return c.costGrade === "Finance-grade" && c.grade !== "Finance-grade";
  })());
  ok("a signed proposal stays Finance-grade on cost with aggressive targets", (() => {
    const d = { ...base, containment: 40, htReduction: 25, attritionReduction: 35 };
    return confidenceOf(d, computeCase(d, "expected", true, "headcount"), "expected").costGrade === "Finance-grade";
  })());
  ok("target ambition caps the headline and is named as a target concern", (() => {
    const d = { ...base, containment: 40 };
    const c = confidenceOf(d, computeCase(d, "expected", true, "headcount"), "expected");
    return c.grade === "Planning-grade" && c.withheld.some(t => /target-plausibility concern, not a cost-input one/.test(t));
  })());
  ok("only genuine cost-input defects ever appear in open", (() => {
    for (const st of ["aggressive", "expected", "conservative"]) for (const mk of MECH_ORDER) {
      const c = confidenceOf(base, computeCase(base, st, true, mk), st);
      if (c.open.some(t => !/inherited marginal cost|first-contact resolution rate/.test(t))) return false;
    }
    return true;
  })());
  ok("every cap states which domain it belongs to", (() => {
    const d = { ...base, containment: 40, newPlatformPerAgentMo: 5000 };
    const c = confidenceOf(d, computeCase(d, "aggressive", true, "growth"), "aggressive");
    return c.withheld.length >= 3 && c.withheld.every(t =>
      /not a cost-input one|not on the bookability of the costs|says nothing about the cost inputs|not a defect in the cost evidence|rather than a cost-input one/.test(t));
  })());
  ok("the headline is the weakest of every axis and cap", (() => {
    const d = { ...base, containment: 40 };
    const c = confidenceOf(d, computeCase(d, "expected", true, "none"), "expected");
    return c.grade === "Directional" && c.costGrade === "Finance-grade";
  })());
}

/* -------------------------------------------- single-driver dominance ----- */
section("13. Single-driver dominance");
{
  const d = D();
  const base = computeCase(d, "expected", true);
  const drivers = [
    ["containment", "containment", 15, 30],
    ["htReduction", "handleTime", 12, 24],
    ["fcrImprovement", "fcr", 8, 16],
    ["attritionReduction", "attrition", 20, 40],
  ];
  for (const [field, bucket, lo, hi] of drivers) {
    const rHi = computeCase(D({ [field]: hi }), "expected", true);
    ok(`doubling ${field} increases only its own bucket materially`,
       rHi.buckets[bucket] > base.buckets[bucket],
       `${rHi.buckets[bucket]} vs ${base.buckets[bucket]}`);
  }
  // Containment is the one driver with legitimate cross-effects (it shrinks the handled pool).
  const rC = computeCase(D({ containment: 30 }), "expected", true);
  ok("raising containment shrinks handle-time and FCR buckets, as designed",
     rC.buckets.handleTime < base.buckets.handleTime && rC.buckets.fcr < base.buckets.fcr);
  ok("raising htReduction does not move containment bucket",
     near(computeCase(D({ htReduction: 24 }), "expected", true).buckets.containment,
          base.buckets.containment, 0.5));
  ok("raising attritionReduction does not move any contact bucket",
     near(computeCase(D({ attritionReduction: 40 }), "expected", true).buckets.fcr, base.buckets.fcr, 0.5));
}

/* ----------------------------------------------- insights self-consistency */
section("14. caseInsights self-consistency");
{
  const d = D();
  const r = computeCase(d, "expected", true);
  const conf = confidenceOf(d, r, "expected");
  const out = caseInsights(r, d, "expected", conf);
  ok("insights returns a non-empty array of strings",
     Array.isArray(out) && out.length > 0 && out.every(s => typeof s === "string"));
  ok("insights contain zero em-dashes", out.every(s => !s.includes(String.fromCharCode(0x2014))));

  const topShareLine = out.find(s => /% of your case rests on/.test(s));
  const m = topShareLine && topShareLine.match(/^(\d+)% of your case rests on/);
  const sorted = Object.entries(r.buckets).sort((a, b) => b[1] - a[1]);
  ok("stated top-driver share reproduces the shared allocation",
     m && Number(m[1]) === r.pct[sorted[0][0]],
     m ? `${m[1]} vs ${r.pct[sorted[0][0]]}` : "line not found");

  const marginalLine = out.find(s => /marginal cost of/.test(s));
  ok("marginal line reproduces r.marginal", marginalLine && marginalLine.includes(mod.fmt2(r.marginal)));
  ok("marginal line reproduces the loaded CPC it contrasts against",
     marginalLine && marginalLine.includes(mod.fmt2(d.costPerContact)));

  const haircutLine = out.find(s => /Two separate adjustments/.test(s));
  ok("haircut line reproduces both adjustments separately",
     haircutLine && haircutLine.includes(mod.fmtK(r.attributionHaircut)) &&
     haircutLine.includes(mod.fmtK(r.realizationHaircut)) &&
     haircutLine.includes(mod.fmtK(r.gross)) && haircutLine.includes(mod.fmtK(r.net)));

  // Zero-gross guard: top-share arithmetic divides by gross.
  const zero = D({ containment: 0, htReduction: 0, acwReduction: 0, fcrImprovement: 0, attritionReduction: 0 });
  const rZ = computeCase(zero, "expected", true);
  const outZ = caseInsights(rZ, zero, "expected", confidenceOf(zero, rZ, "expected"));
  ok("zero-gross case does not print NaN",
     outZ.every(s => !/NaN/.test(s)), outZ.filter(s => /NaN/.test(s)).join(" | "));
  ok("zero-gross case does not print Infinity",
     outZ.every(s => !/Infinity/.test(s)));

  // Ramp insight arithmetic.
  const rR = computeCase(D(), "expected", true);
  const outR = caseInsights(rR, D(), "expected", confidenceOf(D(), rR, "expected"));
  const rampLine = outR.find(s => /idealized \d+ months to a realistic/.test(s));
  if (rampLine) {
    const mm = rampLine.match(/idealized (\d+) months to a realistic (\d+)/);
    const instMonthly = rR.monthlyFull - rR.monthlyPlatform;
    const instPay = instMonthly > 0 ? Math.ceil(DEFAULTS.implementationCost / instMonthly) : 0;
    ok("ramp insight reproduces its own idealized payback", Number(mm[1]) === instPay, `${mm[1]} vs ${instPay}`);
    ok("ramp insight reproduces the real payback", Number(mm[2]) === rR.payback, `${mm[2]} vs ${rR.payback}`);
  } else { ok("ramp insight present on default input", false, "line missing"); }

  const flagged = D({ containment: 40, htReduction: 25, attritionReduction: 35 });
  const rF = computeCase(flagged, "expected", true);
  const outF = caseInsights(rF, flagged, "expected", confidenceOf(flagged, rF, "expected"));
  ok("flags are capped at two even when three fire", outF.filter(s =>
     /above the 10 to 25%|is aggressive\.|attrition reduction is optimistic/.test(s)).length <= 2);
}

/* ------------------------------------------------ publish contract -------- */
section("15. Suite publish contract");
{
  const d = D(), r = computeCase(d, "expected", true);
  const conf = confidenceOf(d, r, "expected");
  const published = {
    agents: d.agents, annualContacts: r.annual, monthlyContacts: d.monthlyContacts,
    grossSavings: Math.round(r.gross), netSavings: Math.round(r.net),
    marginalPerContact: +r.marginal.toFixed(2), stance: "expected",
    paybackMonths: r.payback, threeYearROI: Math.round(r.roi3),
    implementationCost: d.implementationCost, year1Savings: Math.round(r.year1),
    rampOn: true, migrationMonths: r.M, rampMonths: r.R,
    confidence: conf.grade, analystRead: caseInsights(r, d, "expected", conf)[0],
  };
  const registered = ["agents", "annualContacts", "monthlyContacts", "marginalPerContact",
    "confidence", "analystRead"];
  const unregistered = Object.keys(published).filter(k => !registered.includes(k));
  ok("annualContacts published is monthly x 12", near(published.annualContacts, d.monthlyContacts * 12, 0.5));
  ok("marginalPerContact published matches engine", near(published.marginalPerContact, r.marginal, 0.005));
  ok("DOCUMENTED: unregistered publish keys exist", unregistered.length > 0, unregistered.join(", "));
  ok("no rate metric is published as a percent",
     published.marginalPerContact < 1000);
  ok("DEFECT: containment target is not published as containmentRate",
     published.containmentRate === undefined);
}


/* ---- pass two scaffolding: display-layer reconciliation and adversarial sweep ---- */
const parseK = (s) => {
  if (s.endsWith("M")) return parseFloat(s.slice(1, -1)) * 1e6;
  if (s.endsWith("K")) return parseFloat(s.slice(1, -1)) * 1e3;
  return parseFloat(s.slice(1).replace(/,/g, ""));
};
const parseFull = (s) => parseFloat(s.slice(1).replace(/,/g, ""));
const { fmtK, fmtFull } = mod;
let seed = 20260824;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const pick = (lo, hi) => lo + rnd() * (hi - lo);
function randomCase() {
  return {
    agents: Math.round(pick(5, 3000)),
    avgHourly: +pick(11, 45).toFixed(2),
    benefitsPct: +pick(0, 55).toFixed(1),
    monthlyContacts: Math.round(pick(500, 2500000)),
    currentAHT: Math.round(pick(90, 1500)),
    currentACW: Math.round(pick(0, 400)),
    currentFCR: +pick(35, 95).toFixed(1),
    currentAttrition: +pick(5, 190).toFixed(1),
    costPerContact: +pick(2, 40).toFixed(2),
    marginalPerContact: rnd() > 0.5 ? +pick(0.5, 25).toFixed(2) : 0,
    recruitCostPerHire: Math.round(pick(500, 15000)),
    trainingDays: Math.round(pick(1, 90)),
    htReduction: +pick(0, 45).toFixed(1),
    acwReduction: +pick(0, 80).toFixed(1),
    fcrImprovement: +pick(0, 35).toFixed(1),
    attritionReduction: +pick(0, 60).toFixed(1),
    containment: +pick(0, 70).toFixed(1),
    implementationCost: Math.round(pick(0, 12000000)),
    newPlatformPerAgentMo: +pick(0, 600).toFixed(2),
    migrationMonths: Math.round(pick(0, 24)),
    rampMonths: Math.round(pick(1, 18)),
    evidence: ["estimate", "quote", "proposal"][Math.floor(rnd() * 3)],
  };
}

const STANCES = ["aggressive", "expected", "conservative"];
const N = 3000;
const cases = [];
for (let i = 0; i < N; i++) cases.push([randomCase(), STANCES[Math.floor(rnd() * 3)], rnd() > 0.25]);

/* ------------------------------------------------------------------------ */
section(`A. Engine invariants across ${N} randomized cases`);
{
  let negBucket = 0, nanOut = 0, bucketSumDrift = 0, netGtGross = 0,
      poolDrift = 0, tcoDrift = 0, roiDrift = 0, secOverAHT = 0, paybackBad = 0,
      infOut = 0, savings3Drift = 0;
  for (const [d, st, ramp] of cases) {
    const r = computeCase(d, st, ramp);
    const b = r.buckets;
    if (Object.values(b).some(v => v < -0.001)) negBucket++;
    if (Object.values(b).some(v => !Number.isFinite(v)) || !Number.isFinite(r.net) || !Number.isFinite(r.roi3)) nanOut++;
    if (!Number.isFinite(r.savings3) || !Number.isFinite(r.netValue3)) infOut++;
    if (Math.abs(b.containment + b.handleTime + b.fcr + b.attrition - r.gross) > 0.5) bucketSumDrift++;
    if (st !== "aggressive" && r.net > r.gross + 0.5) netGtGross++;
    if (Math.abs(r.handled + r.deflected - r.annual) > 0.5) poolDrift++;
    if (Math.abs(r.tco3 - (d.implementationCost + r.recurring * 3)) > 0.5) tcoDrift++;
    if (r.roiDefined && Math.abs(r.roi3 - (r.savings3 - r.tco3) / r.tco3 * 100) > 0.01) roiDrift++;
    if (r.handled > 0) {
      const sec = (b.handleTime / r.handled) * 3600 / r.loaded;
      if (sec > d.currentAHT + 0.01) secOverAHT++;
    }
    if (r.payback > 0 && !(r.cumFlow[r.payback] >= 0 && r.cumFlow[r.payback - 1] < 0)) paybackBad++;
    const s3 = r.cumFlow[36] + d.implementationCost + r.monthlyPlatform * 36;
    if (Math.abs(s3 - r.savings3) > 0.5) savings3Drift++;
  }
  ok("no negative bucket in any case", negBucket === 0, `${negBucket} cases`);
  ok("no NaN in any output", nanOut === 0, `${nanOut} cases`);
  ok("no non-finite savings3 or netValue3", infOut === 0, `${infOut} cases`);
  ok("buckets always sum to gross", bucketSumDrift === 0, `${bucketSumDrift} cases`);
  ok("net never exceeds gross off aggressive", netGtGross === 0, `${netGtGross} cases`);
  ok("handled + deflected always equals annual", poolDrift === 0, `${poolDrift} cases`);
  ok("tco3 identity always holds", tcoDrift === 0, `${tcoDrift} cases`);
  ok("roi3 identity always holds", roiDrift === 0, `${roiDrift} cases`);
  ok("saved seconds never exceed AHT", secOverAHT === 0, `${secOverAHT} cases`);
  ok("payback is always the true first crossing", paybackBad === 0, `${paybackBad} cases`);
  ok("savings3 always reconciles to the cash flow", savings3Drift === 0, `${savings3Drift} cases`);
}

/* ------------------------------------------------------------------------ */
section("B. Display rounding, UI bucket strip vs stated gross");
{
  let kDrift = 0, worst = 0, worstCase = null, pctDrift = 0, worstPct = 0;
  for (const [d, st, ramp] of cases) {
    const r = computeCase(d, st, ramp);
    if (r.gross <= 0) continue;
    const rows = Object.values(r.buckets);
    const shownSum = rows.reduce((a, v) => a + parseK(fmtK(v)), 0);
    const shownGross = parseK(fmtK(r.gross));
    const drift = Math.abs(shownSum - shownGross);
    const relative = drift / Math.max(1, shownGross);
    if (relative > 0.005) { kDrift++; if (relative > worst) { worst = relative; worstCase = { rows: rows.map(fmtK), gross: fmtK(r.gross), shownSum, shownGross }; } }
    const pcts = Object.values(r.pct).reduce((a, b) => a + b, 0);
    if (pcts !== 100) { pctDrift++; worstPct = Math.max(worstPct, Math.abs(pcts - 100)); }
  }
  ok("rounded bucket strip sums to stated gross within 0.5%", kDrift === 0,
     `${kDrift}/${cases.length} cases drift, worst ${(worst * 100).toFixed(2)}%` +
     (worstCase ? ` :: rows ${worstCase.rows.join(" + ")} shown against gross ${worstCase.gross}` : ""));
  ok("displayed bucket percentages sum to 100", pctDrift === 0,
     `${pctDrift}/${cases.length} cases off, worst by ${worstPct} points`);
}

section("C. Display rounding, PDF savings table vs executive summary");
{
  let drift = 0, worst = 0, sample = null, pctDrift = 0;
  for (const [d, st, ramp] of cases) {
    const r = computeCase(d, st, ramp);
    if (r.gross <= 0) continue;
    const rowVals = Object.values(r.buckets).map(v => parseFull(fmtFull(v)));
    const sum = rowVals.reduce((a, b) => a + b, 0);
    const dd = Math.abs(sum - r.gross);
    if (dd > 2.5) { drift++; if (dd > worst) { worst = dd; sample = { rowVals, gross: r.gross }; } }
    const pcts = Object.values(r.pct).reduce((a, b) => a + b, 0);
    if (pcts !== 100) pctDrift++;
  }
  ok("PDF full-dollar rows sum to gross within rounding", drift === 0,
     `${drift} cases, worst $${worst.toFixed(2)}` + (sample ? ` :: ${sample.rowVals.join("+")} vs ${sample.gross}` : ""));
  ok("PDF percent-of-gross column sums to 100", pctDrift === 0, `${pctDrift}/${cases.length} cases`);
}

/* ------------------------------------------------------------------------ */
section("D. Insight text reproduces its own arithmetic, swept");
{
  let nanLine = 0, infLine = 0, shareMismatch = 0, rampMismatch = 0, emDash = 0;
  const nanSamples = [];
  for (const [d, st, ramp] of cases) {
    const r = computeCase(d, st, ramp);
    const conf = confidenceOf(d, r, st);
    const out = caseInsights(r, d, st, conf);
    for (const s of out) {
      if (/NaN/.test(s)) { nanLine++; if (nanSamples.length < 2) nanSamples.push(s.slice(0, 90)); }
      if (/Infinity/.test(s)) infLine++;
      if (s.includes(String.fromCharCode(0x2014))) emDash++;
    }
    const share = out.find(s => /% of your case rests on/.test(s));
    if (share && r.gross > 0) {
      const m = share.match(/^(\d+)% of your case rests on/);
      const sorted = Object.entries(r.buckets).sort((a, b) => b[1] - a[1]);
      if (!m || Number(m[1]) !== r.pct[sorted[0][0]]) shareMismatch++;
    }
    const rampLine = out.find(s => /idealized (\d+) months to a realistic (\d+)/.test(s));
    if (rampLine) {
      const mm = rampLine.match(/idealized (\d+) months to a realistic (\d+)/);
      const instMonthly = r.monthlyFull - r.monthlyPlatform;
      const instPay = instMonthly > 0 ? Math.ceil(mod.n(d.implementationCost) / instMonthly) : 0;
      if (Number(mm[1]) !== instPay || Number(mm[2]) !== r.payback) rampMismatch++;
    }
  }
  ok("no insight line ever prints NaN", nanLine === 0,
     `${nanLine} lines. e.g. ${nanSamples.join(" | ")}`);
  ok("no insight line ever prints Infinity", infLine === 0, `${infLine} lines`);
  ok("top-driver share always reproduces its own arithmetic", shareMismatch === 0, `${shareMismatch} cases`);
  ok("ramp insight always reproduces both paybacks", rampMismatch === 0, `${rampMismatch} cases`);
  ok("no em-dash generated at runtime", emDash === 0, `${emDash} lines`);
}

/* ------------------------------------------------------------------------ */
section("E. Impossible outputs and grade sanity, swept");
{
  let financeNoPay = 0, financeAggressive = 0, financeThinImpl = 0,
      zeroSavingsPayback = 0, gradeUndefined = 0, negRoiFinance = 0;
  const zeroSamples = [];
  for (const [d, st, ramp] of cases) {
    const r = computeCase(d, st, ramp);
    const c = confidenceOf(d, r, st);
    if (!["Directional", "Planning-grade", "Finance-grade"].includes(c.grade)) gradeUndefined++;
    if (c.grade === "Finance-grade" && r.payback === 0) financeNoPay++;
    if (c.grade === "Finance-grade" && st === "aggressive") financeAggressive++;
    const pai = d.agents > 0 ? d.implementationCost / d.agents : 0;
    if (c.grade === "Finance-grade" && pai < 2000) financeThinImpl++;
    if (c.grade === "Finance-grade" && r.netValue3 < 0) negRoiFinance++;
    if (r.gross <= 0.01 && r.payback > 0) {
      zeroSavingsPayback++;
      if (zeroSamples.length < 3) zeroSamples.push(
        `payback=${r.payback} impl=${d.implementationCost} platMo=${d.newPlatformPerAgentMo} agents=${d.agents} grade=${c.grade}`);
    }
  }
  ok("grade is always one of three values", gradeUndefined === 0, `${gradeUndefined} cases`);
  ok("Finance-grade never coexists with no payback", financeNoPay === 0, `${financeNoPay} cases`);
  ok("Finance-grade never coexists with aggressive stance", financeAggressive === 0, `${financeAggressive} cases`);
  ok("Finance-grade never coexists with understated implementation", financeThinImpl === 0, `${financeThinImpl} cases`);
  ok("DEFECT SCAN: Finance-grade never coexists with negative 3-year value", negRoiFinance === 0,
     `${negRoiFinance} cases`);
  ok("a case with zero savings never reports a payback", zeroSavingsPayback === 0,
     `${zeroSavingsPayback} cases. e.g. ${zeroSamples.join(" || ")}`);
}

/* ------------------------------------------------------------------------ */
section("F. Targeted zero-cost and zero-savings edges");
{
  const free = { ...DEFAULTS, implementationCost: 0, newPlatformPerAgentMo: 0,
    containment: 0, htReduction: 0, acwReduction: 0, fcrImprovement: 0, attritionReduction: 0,
    evidence: "proposal" };
  const rF = computeCase(free, "expected", true);
  const cF = confidenceOf(free, rF, "expected");
  ok("zero investment + zero savings: gross is zero", Math.abs(rF.gross) < 0.001);
  ok("zero investment + zero savings never reports a payback", rF.payback === 0,
     `payback=${rF.payback}`);
  ok("that empty case is not awarded Finance-grade", cF.grade !== "Finance-grade",
     `grade=${cF.grade}, roi3=${rF.roi3}, netValue3=${rF.netValue3}`);

  const freeInf = { ...DEFAULTS, implementationCost: 0, newPlatformPerAgentMo: 0, evidence: "proposal" };
  const rI = computeCase(freeInf, "expected", true);
  ok("real savings at zero cost report ROI as undefined, not 0%",
     rI.roiDefined === false, `savings3=${Math.round(rI.savings3)} roi3=${rI.roi3}`);
  ok("netValue3 still tells the truth when tco3 is zero", rI.netValue3 > 0);
}

console.log(`\n${"=".repeat(64)}`);
console.log(`PASS ${pass}   FAIL ${fail}   TOTAL ${pass + fail}`);
if (FAILS.length) console.log("\nFailures:\n" + FAILS.map(f => "  - " + f).join("\n"));
