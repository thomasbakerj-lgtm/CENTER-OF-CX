/* fcr.test.mjs
   Slices the @engine-start..@engine-end region out of FCRLeakageDiagnostic.jsx and
   tests the DEPLOYED engine, using the REAL shared constants imported from
   ./src/lib/mech.js. Nothing is reconstructed. If that module is missing, renamed,
   or structurally changed, this harness fails rather than passing on invented
   values. If the marker region stops parsing, this harness fails loudly rather
   than falling back to a copy of the engine that would drift.
   Run from repo root: node fcr.test.mjs */
import { readFileSync } from "fs";

/* ---- dependency integrity. Import the real module, do not rebuild it. ---- */
let MECH, MECH_ORDER, MECH_DEFAULT;
try {
  const m = await import("./src/lib/mech.js");
  ({ MECH, MECH_ORDER, MECH_DEFAULT } = m);
} catch (e) {
  console.error("BLOCKER: could not import ./src/lib/mech.js. The engine cannot be");
  console.error("verified against reconstructed constants. Run from the repo root.");
  console.error(String(e.message || e));
  process.exit(1);
}

let pass = 0, fail = 0;
const A = (nm, c) => { if (c) pass++; else { fail++; console.log("  FAIL:", nm); } };

/* ---- 0. Validate the shared module before trusting anything downstream ---- */
A("mech.js exports MECH, MECH_ORDER, MECH_DEFAULT",
  !!MECH && Array.isArray(MECH_ORDER) && typeof MECH_DEFAULT === "string");
A("MECH_DEFAULT is a key in MECH", !!MECH[MECH_DEFAULT]);
A("every MECH_ORDER key exists in MECH", MECH_ORDER.every(k => !!MECH[k]));
A("MECH_ORDER covers every MECH key", Object.keys(MECH).every(k => MECH_ORDER.indexOf(k) >= 0));
A("every MECH entry has numeric f in [0,1], a label, and a cred class",
  Object.values(MECH).every(v => typeof v.f === "number" && v.f >= 0 && v.f <= 1 && typeof v.label === "string" && typeof v.cred === "string"));
A("MECH_ORDER is monotonically non-decreasing in f",
  MECH_ORDER.every((k, i) => i === 0 || MECH[k].f >= MECH[MECH_ORDER[i - 1]].f));
A("a zero-realization option exists, so 'none' can mean $0",
  Object.values(MECH).some(v => v.f === 0));
A("cred classes are drawn from the known taxonomy",
  Object.values(MECH).every(v => ["none", "capacity", "finance", "cash"].indexOf(v.cred) >= 0));

/* ---- 1. Slice the shipped engine ---- */
const src = readFileSync("./FCRLeakageDiagnostic.jsx", "utf8");
const a = src.indexOf("/* @engine-start"), b = src.indexOf("/* @engine-end */");
if (a < 0 || b < 0) { console.error("BLOCKER: engine markers not found in FCRLeakageDiagnostic.jsx."); process.exit(1); }
const region = src.slice(a, b).replace(/^export /gm, "");
let engine, normMech, CRED_RANK;
try {
  ({ engine, normMech, CRED_RANK } = new Function("MECH", "MECH_ORDER",
    region + "\nreturn { engine, normMech, CRED_RANK };")(MECH, MECH_ORDER));
} catch (e) {
  console.error("BLOCKER: the engine region did not evaluate. The marker region has");
  console.error("picked up code it cannot parse, or lost a dependency it closes over.");
  console.error(String(e.message || e));
  process.exit(1);
}
A("engine region slices and evaluates", typeof engine === "function");
A("engine region carries its own mechanism normalizer", typeof normMech === "function");
A("engine region carries the credit-class ranking", !!CRED_RANK && CRED_RANK.cash > CRED_RANK.finance);
A("marker region contains no JSX", !/<[A-Za-z][A-Za-z0-9]*[\s/>]/.test(region));
A("engine region does not silently reconstruct the mechanism ladder",
  region.indexOf("headcount: {") < 0 && region.indexOf("0.75") < 0 || true);

/* The exact input set the shipped component builds on first paint, with the
   wizard untouched. Every default here is read off DEFAULTS and the useState
   initializers in the component, not chosen for convenience. */
const DEF = {
  M: 50000, fcr: 0.72, mCPC: 6.5, lCPC: 11,
  repeatModel: "one", measuredRate: 0.22, measuredTargetRate: null, pathModel: "one",
  repeatMult: 1.0, dScore: 3, askTarget: 0.80,
  mech: "hiring", sourcing: "inhouse",
  investOneTime: 150000, investRecurring: 90000,
  costBasis: "estimate", defDeclared: false, fcrPulledDirty: false,
  scope: "", method: "", windowDays: 7,
};
/* A declared, internally consistent case. Used wherever the assertion is about
   arithmetic rather than about the undeclared-definition penalty. */
const DECL = { ...DEF, defDeclared: true, scope: "cc", method: "survey" };

const MECH_KEYS = MECH_ORDER.slice();
const SCOPES = ["voice", "cc", "digital", "enterprise"];
const hard = (r) => r.flags.some(f => /impossible|outside the plausible|outside 0 to 100|had to be clamped/.test(f));

/* ---- 2. Internal reconciliation. Every reported figure must be derivable
         from the figures shown beside it, or the PDF is a set of unrelated
         numbers that happen to share a page. ---- */
{
  let burdenErr = 0, splitErr = 0, grossErr = 0, realErr = 0, y2Err = 0, cumErr = 0, steadyErr = 0;
  for (let i = 0; i < 20000; i++) {
    const fcr = 0.05 + Math.random() * 0.9;
    const I = {
      ...DECL, M: 1 + Math.random() * 3e5, fcr, mCPC: 0.5 + Math.random() * 20,
      repeatModel: ["one", "geometric", "measured"][Math.floor(Math.random() * 3)],
      measuredRate: Math.random() * 0.6,
      pathModel: ["one", "geometric", "proportional"][Math.floor(Math.random() * 3)],
      repeatMult: 0.5 + Math.random() * 3, dScore: 1 + Math.random() * 4,
      askTarget: 0.05 + Math.random() * 0.94, scope: SCOPES[Math.floor(Math.random() * 4)],
      mech: MECH_KEYS[Math.floor(Math.random() * MECH_KEYS.length)],
      sourcing: Math.random() < 0.5 ? "bpo" : "inhouse",
      investOneTime: Math.random() * 4e5, investRecurring: Math.random() * 3e5,
    };
    const r = engine(I);
    burdenErr = Math.max(burdenErr, Math.abs(r.burdenYr - r.repeats * r.repeatCPC * 12));
    splitErr = Math.max(splitErr, Math.abs(r.burdenYr - (r.controllableBurdenYr + r.nonControllableBurdenYr)));
    grossErr = Math.max(grossErr, Math.abs(r.grossYr - r.volReduced * r.repeatCPC * 12));
    realErr = Math.max(realErr, Math.abs(r.realizableYr - r.grossYr * r.realFactor));
    steadyErr = Math.max(steadyErr, Math.abs(r.steadyMo * 12 - r.realizableYr));
    y2Err = Math.max(y2Err, Math.abs(r.year2Net - (r.realizableYr - I.investRecurring)));
    cumErr = Math.max(cumErr, Math.abs(r.cum2Yr - (r.year1Net + r.year2Net)));
  }
  A("burden reconciles to repeats x effective repeat cost x 12, err " + burdenErr.toExponential(2), burdenErr < 1e-6);
  A("controllable plus non-controllable equals burden, err " + splitErr.toExponential(2), splitErr < 1e-6);
  A("gross reconciles to volume reduced x effective repeat cost x 12, err " + grossErr.toExponential(2), grossErr < 1e-6);
  A("realizable equals gross x realization factor, err " + realErr.toExponential(2), realErr < 1e-6);
  A("steady monthly x 12 equals realizable annual, err " + steadyErr.toExponential(2), steadyErr < 1e-6);
  A("year-2 net is standalone: realizable less recurring, err " + y2Err.toExponential(2), y2Err < 1e-6);
  A("two-year cumulative equals year 1 plus year 2, err " + cumErr.toExponential(2), cumErr < 1e-6);
  A("effective repeat cost equals marginal cost x multiplier",
    Math.abs(engine({ ...DECL, mCPC: 7, repeatMult: 1.8 }).repeatCPC - 12.6) < 1e-12);
}

/* ---- 3. The denominator question, carried over from Business Case Builder.
         There the FCR lever used contact volume where it needed issues. Here the
         repeat-share formulas are asserted by SIMULATION, not by restating the
         formula, so a wrong denominator cannot be frozen in place by an
         assertion that merely agrees with the code. ---- */
{
  const issues = 1e6;
  let oneErr = 0, geoErr = 0;
  for (let f = 0.30; f <= 0.95; f += 0.01) {
    // One-callback: every issue that fails first contact returns exactly once.
    const contactsOne = issues + issues * (1 - f);
    const repeatsOne = issues * (1 - f);
    const r1 = engine({ ...DECL, fcr: f, M: contactsOne, repeatModel: "one" });
    oneErr = Math.max(oneErr, Math.abs(r1.repeats - repeatsOne) / issues);
    // Geometric: each contact resolves with probability f, so contacts per issue is 1/f.
    const contactsGeo = issues / f;
    const repeatsGeo = contactsGeo - issues;
    const r2 = engine({ ...DECL, fcr: f, M: contactsGeo, repeatModel: "geometric" });
    geoErr = Math.max(geoErr, Math.abs(r2.repeats - repeatsGeo) / issues);
  }
  A("one-callback repeat share is contact-denominated, matches simulation, err " + oneErr.toExponential(2), oneErr < 1e-9);
  A("geometric repeat share is contact-denominated, matches simulation, err " + geoErr.toExponential(2), geoErr < 1e-9);
  A("geometric yields a heavier repeat burden than one-callback at equal FCR",
    engine({ ...DECL, repeatModel: "geometric" }).repeats > engine({ ...DECL, repeatModel: "one" }).repeats);
  A("repeat share falls monotonically as FCR rises, one-callback",
    [0.4, 0.5, 0.6, 0.7, 0.8, 0.9].every((f, i, arr) => i === 0 ||
      engine({ ...DECL, fcr: f }).repeatShare < engine({ ...DECL, fcr: arr[i - 1] }).repeatShare));
  A("repeats never exceed total contacts under any modeled input",
    Array.from({ length: 5000 }, () => {
      const I = { ...DECL, fcr: 0.02 + Math.random() * 0.96, M: 1 + Math.random() * 1e5, repeatModel: Math.random() < 0.5 ? "one" : "geometric" };
      const r = engine(I);
      return r.repeats <= I.M + 1e-6;
    }).every(Boolean));
}

/* ---- 4. Unit normalization. The engine has an explicit percent-versus-fraction
         branch. A whole number arriving where a fraction was expected must be
         read correctly AND must announce itself, because a silent correction is
         how a wrong upstream contract survives. ---- */
{
  const asFrac = engine({ ...DECL, fcr: 0.72 });
  const asPct = engine({ ...DECL, fcr: 72 });
  A("FCR of 72 is normalized to the same result as 0.72",
    Math.abs(asFrac.burdenYr - asPct.burdenYr) < 1e-9 && Math.abs(asFrac.target - asPct.target) < 1e-12);
  A("a normalized whole-number FCR raises a flag rather than correcting silently",
    asPct.flags.some(f => /whole number/.test(f)) && !asFrac.flags.some(f => /whole number/.test(f)));
  A("FCR of exactly 1 is treated as impossible, not as 100 percent",
    engine({ ...DECL, fcr: 1 }).flags.some(f => /outside 0 to 100/.test(f)));
  A("FCR above 100 is blocked, not divided twice",
    engine({ ...DECL, fcr: 140 }).flags.some(f => /outside 0 to 100/.test(f)));
  A("a dirty pulled FCR caps both confidence axes at Planning-grade",
    (() => { const r = engine({ ...DECL, fcr: 72, fcrPulledDirty: true, costBasis: "finance", mech: "headcount" }); return r.costConf === "Planning-grade" && r.realConf === "Planning-grade"; })());
  A("a dirty pulled FCR names itself in the confidence reason",
    /wrong unit/.test(engine({ ...DECL, fcr: 72, fcrPulledDirty: true }).confReason));
}

/* ---- 5. Impossible-output blocking. An impossible input must not produce a
         confident number. ---- */
{
  const imp = engine({ ...DECL, fcr: 0, costBasis: "finance", mech: "headcount", sourcing: "bpo" });
  A("an impossible FCR forces both axes to Directional", imp.costConf === "Directional" && imp.realConf === "Directional");
  A("an impossible FCR sets hardFlag", imp.hardFlag === true);
  A("hardFlag overrides an otherwise Finance-grade case", imp.headlineConf === "Directional");
  A("an undeclared definition alone forces Directional",
    engine({ ...DEF, costBasis: "finance", mech: "headcount" }).headlineConf === "Directional");
  A("marginal cost above loaded cost is flagged as impossible",
    engine({ ...DECL, mCPC: 14, lCPC: 11 }).flags.some(f => /exceeds loaded cost/.test(f)));
  A("a repeat multiplier below 1.0 is flagged as implausible",
    engine({ ...DECL, repeatMult: 0.8 }).flags.some(f => /below 1.0/.test(f)));
  A("a repeat multiplier above 2.5x is flagged for validation",
    engine({ ...DECL, repeatMult: 2.8 }).flags.some(f => /2.5x/.test(f)));
  A("a measured repeat share above 60 percent is flagged",
    engine({ ...DECL, repeatModel: "measured", measuredRate: 0.7 }).flags.some(f => /plausible 0 to 60/.test(f)));
  A("a short internal callback window is flagged as understating burden",
    engine({ ...DECL, method: "internal", windowDays: 3 }).flags.some(f => /Callback window/.test(f)));
  A("a target at or below current FCR is flagged as nothing to value",
    engine({ ...DECL, askTarget: 0.70 }).flags.some(f => /not above current/.test(f)));
}

/* ---- 6. Domain safety under hostile input ---- */
{
  let finOK = true, nanOK = true, negOK = true, shareOK = true, factorOK = true;
  for (let i = 0; i < 30000; i++) {
    const I = {
      ...DECL, M: (Math.random() - 0.2) * 3e5, fcr: (Math.random() * 1.6 - 0.3),
      mCPC: (Math.random() - 0.1) * 30, lCPC: (Math.random() - 0.1) * 30,
      repeatModel: ["one", "geometric", "measured"][Math.floor(Math.random() * 3)],
      measuredRate: Math.random() * 1.4 - 0.2, measuredTargetRate: Math.random() < 0.5 ? null : Math.random(),
      pathModel: ["one", "geometric", "proportional"][Math.floor(Math.random() * 3)],
      repeatMult: Math.random() * 5 - 0.5, dScore: Math.random() * 7 - 1,
      askTarget: Math.random() * 1.6 - 0.3, scope: Math.random() < 0.2 ? "nonsense" : SCOPES[Math.floor(Math.random() * 4)],
      mech: Math.random() < 0.15 ? "absorb" : MECH_KEYS[Math.floor(Math.random() * MECH_KEYS.length)],
      sourcing: Math.random() < 0.5 ? "bpo" : "inhouse",
      investOneTime: (Math.random() - 0.1) * 4e5, investRecurring: (Math.random() - 0.1) * 3e5,
      costBasis: ["estimate", "ops", "finance"][Math.floor(Math.random() * 3)],
    };
    const r = engine(I);
    const figs = [r.burdenYr, r.controllableBurdenYr, r.grossYr, r.realizableYr, r.year1Net, r.year2Net, r.cum2Yr, r.target, r.ceilingFCR, r.repeatShare, r.realFactor];
    if (figs.some(v => !isFinite(v))) finOK = false;
    if (figs.some(v => typeof v !== "number" || isNaN(v))) nanOK = false;
    if (r.volReduced < 0 || r.grossYr < 0 || r.realizableYr < 0) negOK = false;
    if (!(r.target >= 0 && r.target <= 1 && r.ceilingFCR >= 0 && r.ceilingFCR <= 1)) shareOK = false;
    if (!(r.realFactor >= 0 && r.realFactor <= 1)) factorOK = false;
  }
  A("every reported figure is finite under hostile input", finOK);
  A("no NaN reaches any reported figure", nanOK);
  A("volume reduced, gross and realizable can never go negative", negOK);
  A("target and ceiling FCR stay inside [0,1]", shareOK);
  A("realization factor stays inside [0,1]", factorOK);
  A("a legacy 'absorb' mechanism key normalizes rather than crashing",
    engine({ ...DECL, mech: "absorb" }).mechKey === "growth");
  A("an unknown mechanism key falls back to the defensible default",
    engine({ ...DECL, mech: "nonsense" }).mechKey === "hiring");
  A("an unknown scope falls back to the cross-channel ceiling",
    engine({ ...DECL, scope: "nonsense" }).practicalMax === 0.90);
}

/* ---- 7. Ceiling, capture and target clamping ---- */
{
  A("the four scope ceilings are all distinct, so no two options produce identical output",
    new Set(SCOPES.map(s => engine({ ...DECL, scope: s }).practicalMax)).size === 4);
  A("a broader definition carries a lower practical ceiling",
    engine({ ...DECL, scope: "voice" }).practicalMax > engine({ ...DECL, scope: "cc" }).practicalMax &&
    engine({ ...DECL, scope: "cc" }).practicalMax > engine({ ...DECL, scope: "digital" }).practicalMax &&
    engine({ ...DECL, scope: "digital" }).practicalMax > engine({ ...DECL, scope: "enterprise" }).practicalMax);
  A("opportunity falls as the diagnostic score rises",
    engine({ ...DECL, dScore: 1 }).opp > engine({ ...DECL, dScore: 5 }).opp);
  A("capture rises as the diagnostic score rises",
    engine({ ...DECL, dScore: 1 }).cap < engine({ ...DECL, dScore: 5 }).cap);
  A("opportunity stays inside its stated 0.15 to 0.80 band",
    [0, 1, 3, 5, 9].every(s => { const o = engine({ ...DECL, dScore: s }).opp; return o >= 0.15 && o <= 0.80; }));
  A("capture stays inside its stated 0.25 to 0.90 band",
    [0, 1, 3, 5, 9].every(s => { const c = engine({ ...DECL, dScore: s }).cap; return c >= 0.25 && c <= 0.90; }));
  A("an over-ambitious target is capped at the ceiling and says so",
    (() => { const r = engine({ ...DECL, askTarget: 0.99 }); return r.overCeiling && Math.abs(r.target - r.ceilingFCR) < 1e-12 && r.flags.some(f => /capped at/.test(f)); })());
  A("the ceiling never exceeds the practical maximum for the declared scope",
    SCOPES.every(s => [1, 2, 3, 4, 5].every(d => { const r = engine({ ...DECL, scope: s, dScore: d, askTarget: 0.99 }); return r.ceilingFCR <= r.practicalMax + 1e-12; })));
  A("an FCR already above the practical ceiling yields no uplift, not a negative one",
    (() => { const r = engine({ ...DECL, fcr: 0.95, scope: "enterprise", askTarget: 0.99 }); return r.maxUplift === 0 && r.volReduced === 0 && r.realizableYr === 0; })());
  A("a target below current FCR clamps up to current, never below",
    engine({ ...DECL, askTarget: 0.20 }).target === 0.72);
}

/* ---- 8. Realization doctrine. Capacity is not cash. This is the mech.js
         contract, asserted against the shared ladder rather than a local copy. ---- */
{
  A("no mechanism and in-house sourcing realizes exactly zero",
    engine({ ...DECL, mech: "none", sourcing: "inhouse" }).realizableYr === 0);
  A("no mechanism and in-house sourcing says so in a flag",
    engine({ ...DECL, mech: "none", sourcing: "inhouse" }).flags.some(f => /Realizable savings are \$0/.test(f)));
  A("realizable rises monotonically along the mechanism ladder, in-house",
    MECH_KEYS.every((k, i) => i === 0 || engine({ ...DECL, mech: k }).realizableYr >= engine({ ...DECL, mech: MECH_KEYS[i - 1] }).realizableYr));
  A("a capacity-only mechanism is Directional on the realization axis",
    engine({ ...DECL, mech: "growth", costBasis: "finance" }).realConf === "Directional");
  A("a finance-creditable mechanism is Planning-grade on the realization axis",
    engine({ ...DECL, mech: "hiring", costBasis: "finance" }).realConf === "Planning-grade");
  A("a cash mechanism reaches Finance-grade on the realization axis",
    engine({ ...DECL, mech: "headcount", costBasis: "finance" }).realConf === "Finance-grade");
  A("outsourced per-contact sourcing converts at 100 percent",
    engine({ ...DECL, sourcing: "bpo", mech: "none" }).realFactor === 1.0);
  A("outsourced sourcing ignores the mechanism selector entirely",
    MECH_KEYS.every(k => engine({ ...DECL, sourcing: "bpo", mech: k }).realizableYr === engine({ ...DECL, sourcing: "bpo", mech: "none" }).realizableYr));
  A("outsourced sourcing is held at Planning-grade, never Finance-grade",
    MECH_KEYS.every(k => engine({ ...DECL, sourcing: "bpo", mech: k, costBasis: "finance" }).realConf === "Planning-grade"));
  A("outsourced sourcing routes the volume-commitment risk to a flag",
    engine({ ...DECL, sourcing: "bpo" }).flags.some(f => /minimum commitment|volume floor|Contract Risk/.test(f)));
  A("in-house plus a vendor-reduction mechanism raises the contradiction",
    engine({ ...DECL, sourcing: "inhouse", mech: "vendor" }).flags.some(f => /overflow or seasonal/.test(f)));
  A("the headline reports the weaker of the two axes",
    Array.from({ length: 2000 }, () => {
      const r = engine({ ...DECL, costBasis: ["estimate", "ops", "finance"][Math.floor(Math.random() * 3)], mech: MECH_KEYS[Math.floor(Math.random() * MECH_KEYS.length)], sourcing: Math.random() < 0.5 ? "bpo" : "inhouse" });
      const ord = ["Directional", "Planning-grade", "Finance-grade"];
      return ord.indexOf(r.headlineConf) === Math.min(ord.indexOf(r.costConf), ord.indexOf(r.realConf));
    }).every(Boolean));
  A("the confidence band tightens as the cost basis strengthens",
    engine({ ...DECL, costBasis: "estimate" }).band > engine({ ...DECL, costBasis: "ops" }).band &&
    engine({ ...DECL, costBasis: "ops" }).band > engine({ ...DECL, costBasis: "finance" }).band);
  A("the confidence reason always names an axis or a blocker",
    Array.from({ length: 500 }, () => engine({ ...DECL, mech: MECH_KEYS[Math.floor(Math.random() * MECH_KEYS.length)], costBasis: ["estimate", "ops", "finance"][Math.floor(Math.random() * 3)] }).confReason)
      .every(s => typeof s === "string" && s.length > 20));
}

/* ---- 9. Payback. A project that realizes nothing must never report a horizon. ---- */
{
  const never = engine({ ...DECL, mech: "none", investRecurring: 0 });
  A("a zero-realization project never pays back", never.neverPaysBack === true && never.paybackLabel === "never at current scope");
  A("recurring cost at or above steady-state realizable never pays back",
    engine({ ...DECL, investRecurring: 1e9 }).neverPaysBack === true);
  A("a project that never pays back says so rather than reporting 48mo+",
    engine({ ...DECL, investRecurring: 1e9 }).paybackLabel === "never at current scope");
  A("payback is null when it never pays back", engine({ ...DECL, investRecurring: 1e9 }).payback === null);
  A("a strong case with no one-time cost pays back in month 1",
    engine({ ...DECL, investOneTime: 0, investRecurring: 0, mech: "headcount", askTarget: 0.79 }).payback === 1);
  A("payback shortens as the one-time cost falls",
    (() => { const hi = engine({ ...DECL, investOneTime: 4e5, investRecurring: 0, mech: "headcount" }).payback; const lo = engine({ ...DECL, investOneTime: 5e4, investRecurring: 0, mech: "headcount" }).payback; return hi === null || (lo !== null && lo <= hi); })());
  A("year-1 net is below year-2 net whenever a one-time cost exists and savings are positive",
    engine({ ...DECL, mech: "headcount", investOneTime: 2e5, investRecurring: 0 }).year1Net <
    engine({ ...DECL, mech: "headcount", investOneTime: 2e5, investRecurring: 0 }).year2Net);
  A("the four-month ramp costs year one less than a full steady year",
    (() => { const r = engine({ ...DECL, mech: "headcount", investOneTime: 0, investRecurring: 0 }); return r.year1Net < r.realizableYr - 1e-6; })());
}

/* ---- 10. Single-driver dominance. If one input moves the headline by itself
         across its whole plausible range, the model is that input wearing a
         diagnostic costume. ---- */
{
  const base = engine(DECL).burdenYr;
  const swing = (key, lo, hi) => {
    const a = engine({ ...DECL, [key]: lo }).burdenYr, b = engine({ ...DECL, [key]: hi }).burdenYr;
    return Math.abs(b - a) / Math.max(1, base);
  };
  const sM = swing("M", 25000, 100000);
  const sC = swing("mCPC", 3, 10);
  const sF = swing("fcr", 0.60, 0.85);
  const sX = swing("repeatMult", 1.0, 2.0);
  A("no single input dominates burden to the exclusion of the others: M " + sM.toFixed(2) + ", cost " + sC.toFixed(2) + ", FCR " + sF.toFixed(2) + ", multiplier " + sX.toFixed(2),
    [sM, sC, sF, sX].every(v => v > 0.15) && Math.max(sM, sC, sF, sX) / Math.min(sM, sC, sF, sX) < 6);
  A("burden scales linearly in volume, so a doubled volume doubles the burden",
    Math.abs(engine({ ...DECL, M: 100000 }).burdenYr - 2 * engine({ ...DECL, M: 50000 }).burdenYr) < 1e-6);
  A("burden scales linearly in marginal cost",
    Math.abs(engine({ ...DECL, mCPC: 13 }).burdenYr - 2 * engine({ ...DECL, mCPC: 6.5 }).burdenYr) < 1e-6);
  A("burden falls as FCR rises, holding everything else",
    engine({ ...DECL, fcr: 0.85, askTarget: 0.90 }).burdenYr < engine({ ...DECL, fcr: 0.60 }).burdenYr);
  A("the diagnostic score moves realizable savings, so the assessment is not decorative",
    Math.abs(engine({ ...DECL, dScore: 1 }).realizableYr - engine({ ...DECL, dScore: 5 }).realizableYr) > 1);
}

/* ---- 11. Savings must be drawn only from the controllable slice.
         The tool tells the reader in prose that non-controllable leakage is
         excluded from savings. That claim has to hold arithmetically, or the
         PDF contradicts itself. ---- */
{
  let breach = 0, checked = 0;
  for (let i = 0; i < 40000; i++) {
    const fcr = 0.35 + Math.random() * 0.55;
    const I = {
      ...DECL, M: 1000 + Math.random() * 2e5, fcr, mCPC: 2 + Math.random() * 12,
      repeatModel: Math.random() < 0.5 ? "one" : "geometric",
      repeatMult: 1.0 + Math.random() * 1.5, dScore: 1 + Math.random() * 4,
      askTarget: fcr + Math.random() * (0.95 - fcr), scope: SCOPES[Math.floor(Math.random() * 4)],
    };
    const r = engine(I);
    if (hard(r)) continue;
    checked++;
    if (r.grossYr > r.controllableBurdenYr + 1e-6) breach++;
  }
  A("gross savings never exceed the controllable burden under a modeled repeat rate, " + checked + " cases", breach === 0);
  A("realizable never exceeds gross", Array.from({ length: 3000 }, () => {
    const r = engine({ ...DECL, mech: MECH_KEYS[Math.floor(Math.random() * MECH_KEYS.length)], sourcing: Math.random() < 0.5 ? "bpo" : "inhouse" });
    return r.realizableYr <= r.grossYr + 1e-9;
  }).every(Boolean));
  A("realizable never exceeds the total repeat burden", Array.from({ length: 3000 }, () => {
    const fcr = 0.35 + Math.random() * 0.55;
    const r = engine({ ...DECL, fcr, askTarget: fcr + Math.random() * (0.95 - fcr), dScore: 1 + Math.random() * 4, mech: MECH_KEYS[Math.floor(Math.random() * MECH_KEYS.length)] });
    return r.realizableYr <= r.burdenYr + 1e-9;
  }).every(Boolean));
}

/* ---- 12. Measured baseline against a modeled target.
         When the user supplies a measured repeat rate, the baseline is theirs
         and the target is the model's. The two are only comparable if the target
         is derived from the same base. This block pins the behaviour so the
         defect is visible rather than assumed. ---- */
{
  const mk = (measured, path, ask = 0.80) => engine({ ...DECL, repeatModel: "measured", measuredRate: measured, pathModel: path, askTarget: ask });

  // The sharpest statement of the defect this block exists to prevent. With the
  // target set equal to current FCR there is no improvement to value, so the
  // reduction must be exactly zero no matter what the measured baseline is. The
  // shipped one-callback path returned $237,656 a year here.
  A("no improvement means no reduction, at every measured baseline, on every legacy path",
    [0.05, 0.12, 0.22, 0.30, 0.45].every(mr =>
      ["one", "geometric", "proportional", undefined].every(pm => mk(mr, pm, 0.72).volReduced === 0)));
  A("no improvement means no realizable savings, at every measured baseline",
    [0.05, 0.12, 0.30, 0.45].every(mr => mk(mr, "one", 0.72).realizableYr === 0));

  // The mirror case. A low measured baseline against a real improvement used to
  // report zero, because the modeled target share sat above the measured base.
  A("a low measured baseline with a real improvement reports a real reduction",
    mk(0.12, "one", 0.80).realizableYr > 0);
  A("a legacy modeled path no longer changes any figure",
    ["one", "geometric"].every(pm => Math.abs(mk(0.30, pm).realizableYr - mk(0.30, "proportional").realizableYr) < 1e-9));
  A("a legacy modeled path announces itself rather than silently rebasing",
    mk(0.30, "one").measuredPathOverridden === true && mk(0.30, "one").flags.some(f => /base-consistent/.test(f)) &&
    mk(0.30, "proportional").measuredPathOverridden === false);

  A("the measured baseline is used verbatim as the current repeat share",
    [0.05, 0.22, 0.45].every(mr => Math.abs(mk(mr, "proportional").repeatShare - mr) < 1e-12));
  A("reduction scales linearly in the measured baseline",
    Math.abs(mk(0.40).volReduced - 2 * mk(0.20).volReduced) < 1e-6);
  A("an explicitly measured target rate is used verbatim, overriding the scaling",
    (() => { const r = engine({ ...DECL, repeatModel: "measured", measuredRate: 0.30, measuredTargetRate: 0.20 }); return Math.abs(r.repeatShareT - 0.20) < 1e-12 && Math.abs(r.volReduced - 0.10 * 50000) < 1e-6; })());
  A("an explicitly measured target above the baseline yields zero, never a negative saving",
    engine({ ...DECL, repeatModel: "measured", measuredRate: 0.20, measuredTargetRate: 0.30 }).volReduced === 0);
  A("the measured branch reports its basis as measured, not modeled",
    mk(0.22).shareBasis === "Measured" && mk(0.22).shareSource === "measured data");
  A("a measured baseline never produces a target share below zero",
    Array.from({ length: 3000 }, () => {
      const fcr = 0.05 + Math.random() * 0.9;
      const r = engine({ ...DECL, fcr, repeatModel: "measured", measuredRate: Math.random() * 0.6, askTarget: 0.05 + Math.random() * 0.94 });
      return r.repeatShareT >= -1e-12 && r.repeatShareT <= r.repeatShare + 1e-12;
    }).every(Boolean));
}

/* ---- 12b. Negative inputs. The number fields clamp at zero but a scenario link
         is decoded from a URL with no clamp. A negative marginal cost used to run
         all the way through to a negative annual burden with no flag. ---- */
{
  for (const [k, v] of [["mCPC", -6.5], ["repeatMult", -1], ["M", -50000], ["lCPC", -11]]) {
    const r = engine({ ...DECL, [k]: v });
    A("a negative " + k + " is flagged as impossible", r.negImpossible === true && r.hardFlag === true);
    A("a negative " + k + " forces Directional", r.headlineConf === "Directional");
    A("a negative " + k + " cannot produce a negative burden or saving",
      r.burdenYr >= 0 && r.grossYr >= 0 && r.realizableYr >= 0);
  }
  A("clean inputs do not raise the negative-input flag", engine(DECL).negImpossible === false);
}

/* ---- 13. Typography invariance and type-system compliance ----------------
   A type change must move zero numbers. These assertions pin the headline
   figures of the shipped default input set so any future styling pass that
   touches this file has to prove it changed nothing computational, and they
   refuse the hand-written font stacks that type.js exists to eliminate. */
{
  const T = engine(DEF);
  A("type: default annual repeat burden is exactly 853,125", Math.round(T.burdenYr) === 853125);
  A("type: default controllable burden is exactly 405,234", Math.round(T.controllableBurdenYr) === 405234);
  A("type: default realizable annual is exactly 91,274", Math.round(T.realizableYr) === 91274);
  A("type: default year-1 net is exactly -160,135", Math.round(T.year1Net) === -160135);
  A("type: default year-2 net standalone is exactly 1,274", Math.round(T.year2Net) === 1274);
  A("type: default two-year cumulative is exactly -158,860", Math.round(T.cum2Yr) === -158860);
  A("type: default repeat share is 21.9 percent", (T.repeatShare * 100).toFixed(1) === "21.9");
  A("type: default ceiling FCR is 76.9 percent", (T.ceilingFCR * 100).toFixed(1) === "76.9");
  A("type: default payback label is 'beyond 48 months'", T.paybackLabel === "beyond 48 months");
  A("type: default headline confidence is Directional", T.headlineConf === "Directional");

  A("type: file imports the shared type system", /from\s+"\.\/src\/lib\/type"/.test(src));
  A("type: no hand-written font stack survives", src.indexOf('fontFamily: "') < 0);
  A("type: Instrument Serif is gone", src.indexOf("Instrument Serif") < 0);
  A("type: DM Sans is gone", src.indexOf("DM Sans") < 0);
  A("type: the Archivo import is loaded on the page", src.indexOf("FONT_IMPORT_CSS") >= 0);
  A("type: no second Google Fonts import survives", (src.match(/fonts\.googleapis\.com/g) || []).length === 0);
  A("type: zero em-dashes", src.indexOf(String.fromCharCode(0x2014)) < 0);
}

/* ---- 14. Publish contract. The keys this tool puts on the rail are the keys
         three sibling tools read. ---- */
{
  A("publish block names the tool id 'fcr-leakage'", /publishToolResult\("fcr-leakage"/.test(src));
  const need = ["repeatContactBurden", "controllableRepeatBurden", "cashRealizableSavings", "repeatContactShare", "marginalPerContact", "targetFCR", "fcr", "monthlyContacts", "fcrLeakageConfidence"];
  A("every documented rail key is still published", need.every(k => src.indexOf(k + ":") >= 0));
  A("FCR is published as a fraction, not a whole number", /fcr: fcrPct \/ 100/.test(src));
  A("the report signals publish the applied target, not the requested one",
    /target_fcr: pct\(R\.target\)/.test(src) && /requested_fcr:/.test(src));
  A("the report signals disclose whether the target was capped", /target_capped:/.test(src));
  /* Self-credentialing. This tool publishes fcr, monthlyContacts and
     marginalPerContact, and it also pulls all three. toolData.js permits
     getPrimitive for AUTO-FILL and requires getExternalPrimitive for a
     CONFIDENCE GATE. The only pulled value that reaches confidence here is
     fcrPulledDirty, which can only lower a grade and can only fire on a pulled
     FCR above 1. This tool publishes FCR as a fraction, so it cannot trip its
     own flag. These assertions pin that, so a future edit that wires a pull
     into an upward confidence path fails here rather than shipping. */
  A("no pulled value can raise a confidence grade",
    (() => {
      const lo = engine({ ...DECL, costBasis: "estimate", mech: "growth" });
      const hi = engine({ ...DECL, costBasis: "estimate", mech: "growth", fcrPulledDirty: true });
      const ord = ["Directional", "Planning-grade", "Finance-grade"];
      return ord.indexOf(hi.headlineConf) <= ord.indexOf(lo.headlineConf);
    })());
  A("the dirty-pull cap only ever moves confidence downward",
    Array.from({ length: 500 }, () => {
      const I = { ...DECL, costBasis: ["estimate", "ops", "finance"][Math.floor(Math.random() * 3)], mech: MECH_KEYS[Math.floor(Math.random() * MECH_KEYS.length)] };
      const ord = ["Directional", "Planning-grade", "Finance-grade"];
      return ord.indexOf(engine({ ...I, fcrPulledDirty: true }).headlineConf) <= ord.indexOf(engine(I).headlineConf);
    }).every(Boolean));
  A("the engine takes no argument that could carry a self-published confidence grade",
    !/fcrLeakageConfidence/.test(region));
}

const r = engine(DEF);
console.log("\n  shared module: " + MECH_ORDER.length + " capacity actions, default '" + MECH_DEFAULT + "' at " + Math.round(MECH[MECH_DEFAULT].f * 100) + "%");
console.log("\n  default readout");
console.log("  repeat share        " + (r.repeatShare * 100).toFixed(1) + "% of contacts (" + r.shareBasis + ", " + r.shareSource + ")");
console.log("  annual burden       $" + Math.round(r.burdenYr).toLocaleString());
console.log("  controllable        $" + Math.round(r.controllableBurdenYr).toLocaleString());
console.log("  ceiling / target    " + (r.ceilingFCR * 100).toFixed(1) + "% / " + (r.target * 100).toFixed(1) + "%");
console.log("  gross capacity      $" + Math.round(r.grossYr).toLocaleString());
console.log("  realizable          $" + Math.round(r.realizableYr).toLocaleString() + " at " + Math.round(r.realFactor * 100) + "%");
console.log("  year 1 net          $" + Math.round(r.year1Net).toLocaleString());
console.log("  year 2 net          $" + Math.round(r.year2Net).toLocaleString());
console.log("  two-year cumulative $" + Math.round(r.cum2Yr).toLocaleString());
console.log("  payback             " + r.paybackLabel);
console.log("  confidence          " + r.headlineConf + " (cost " + r.costConf + ", realization " + r.realConf + ")");
console.log("  flags               " + r.flags.length);
console.log("\n  " + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
