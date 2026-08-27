/* licensegap.test.mjs
 *
 * Slices the @engine-start..@engine-end region out of LicenseBundleGapChecker.jsx
 * and tests the DEPLOYED engine. Nothing is reconstructed. COLORS comes from the
 * real ./src/lib/benchmarks.js, so a palette drift fails here rather than passing
 * on invented constants.
 *
 * This tool is the first in the suite where the engine did not exist as a function.
 * Roughly 150 lines of arithmetic sat inline in the component body, closing over
 * fifteen useState variables, which meant it could not be evaluated outside React
 * at all and had therefore never been tested. The extraction was proven behaviour
 * neutral across twenty scenarios and 1060 field comparisons before any fix landed.
 *
 * Run from repo root: node licensegap.test.mjs
 */
import { readFileSync } from "fs";

let COLORS;
try {
  ({ COLORS } = await import("./src/lib/benchmarks.js"));
} catch (e) {
  console.error("BLOCKER: could not import ./src/lib/benchmarks.js. Run from the repo root.");
  console.error(String(e.message || e));
  process.exit(1);
}

let pass = 0, fail = 0;
const A = (nm, c) => { if (c) pass++; else { fail++; console.log("  FAIL:", nm); } };
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

/* ---- 1. slice the shipped engine ---- */
console.log("\n1. engine slice");
const SRC = readFileSync("./LicenseBundleGapChecker.jsx", "utf8");
const a0 = SRC.indexOf("/* @engine-start"), b0 = SRC.indexOf("/* @engine-end */");
if (a0 < 0 || b0 < 0) { console.error("BLOCKER: engine markers not found in LicenseBundleGapChecker.jsx."); process.exit(1); }
const region = SRC.slice(a0, b0).replace(/^export /gm, "");

let compute, DEFAULTS, MODULES, USAGE_TYPES, COST_STATUS, DOC_EVIDENCE, DBL_MAP, DBL_LABEL,
  EVIDENCE_OPTS, GRADE_RANK, guardVal, n, fmtK, clone, TOOL_ID, ROUTE;
try {
  ({ compute, DEFAULTS, MODULES, USAGE_TYPES, COST_STATUS, DOC_EVIDENCE, DBL_MAP, DBL_LABEL,
    EVIDENCE_OPTS, GRADE_RANK, guardVal, n, fmtK, clone, TOOL_ID, ROUTE } = new Function(
    "COLORS", "GREEN", "AMBER", "RED", "ELECTRIC",
    region + "\nreturn { compute, DEFAULTS, MODULES, USAGE_TYPES, COST_STATUS, DOC_EVIDENCE, DBL_MAP, DBL_LABEL, EVIDENCE_OPTS, GRADE_RANK, guardVal, n, fmtK, clone, TOOL_ID, ROUTE };"
  )(COLORS, COLORS.green, COLORS.amber, COLORS.red, COLORS.electric));
} catch (e) {
  console.error("BLOCKER: the engine region did not evaluate. The marker region has");
  console.error("picked up code it cannot parse, or lost a dependency it closes over.");
  console.error(String(e.message || e));
  process.exit(1);
}

A("engine region slices and evaluates", typeof compute === "function");
A("engine region carries its own formatters", typeof n === "function" && typeof fmtK === "function");
A("engine region carries the corrected-value renderer", typeof guardVal === "function");
A("engine region carries the grade ladder", GRADE_RANK && GRADE_RANK["Directional"] === 0 && GRADE_RANK["Finance-grade"] === 2);
A("engine region carries the module table", Array.isArray(MODULES) && MODULES.length === 12);
A("engine region carries the usage table", Array.isArray(USAGE_TYPES) && USAGE_TYPES.length === 6);
A("engine region carries the scenario contract", TOOL_ID === "license-gap" && ROUTE === "/tools/license-gap");
A("engine region carries the shipped default input set", !!DEFAULTS && Array.isArray(DEFAULTS.classes));
A("engine uses no capacity mechanism, because this prices cash not capacity", !/MECH\[|CRED_RANK\[|from "\.\/src\/lib\/mech/.test(region));
A("engine region contains no em-dash", region.indexOf(String.fromCharCode(0x2014)) < 0);

const D = () => clone(DEFAULTS);
const base = compute(D());

/* ---- 2. the shipped default scenario ---- */
console.log("\n2. shipped defaults");
A("150 billable seats", base.billable === 150);
A("quoted seat is $125", near(base.quotedSeat, 125));
A("effective license seat is $185", near(base.effLicenseSeat, 185));
A("platform seat-equivalent is $185 with no usage entered", near(base.effPlatformSeat, 185));
A("bundle gap is 48%", near(base.gapPct, 48));
A("hidden annual is $108,000", near(base.hiddenAnnual, 108000));
A("annual platform is $333,000", near(base.annualPlatform, 333000));
A("no inputs required correction on the shipped defaults", base.guards.length === 0);
A("no invariant fails on the shipped defaults", base.invariants.length === 0);
A("shipped defaults are not void", base.voided === false);
A("two shelfware modules are bundled but unused", base.shelfware.length === 2);
A("no needed module has unknown inclusion by default", base.unknowns.length === 0);
A("analyst read is populated", Array.isArray(base.analyst) && base.analyst.length >= 1);
A("confidence line names the grade", base.confLine.indexOf(base.confidence) >= 0);

/* ---- 3. the seat ladder, which is the whole point of the tool ---- */
console.log("\n3. seat ladder identities");
const ladder = (d) => { const r = compute(d); return r; };
const ladderCases = [
  ["defaults", D()],
  ["usage heavy", (() => { const d = D(); d.usage.ai = 40000; d.usage.bot = 9000; return d; })()],
  ["tier heavy", (() => { const d = D(); d.modules.analytics.status = "tier"; return d; })()],
  ["all classes staffed", (() => { const d = D(); d.classes[1].count = 12; d.classes[2].count = 3; d.classes[3].count = 4; return d; })()],
  ["one-time only", (() => { const d = D(); d.modules.services.need = "yes"; d.modules.services.cost = 250000; return d; })()],
];
for (const [nm, d] of ladderCases) {
  const r = ladder(d);
  A(`${nm}: quoted <= effective license seat`, r.effLicenseSeat >= r.quotedSeat - 1e-9);
  A(`${nm}: effective license <= platform seat-equivalent`, r.effPlatformSeat >= r.effLicenseSeat - 1e-9);
  A(`${nm}: license monthly = base + add-ons + tier`, near(r.licenseMonthly, r.baseMonthly + r.addOnMonthly + r.tierMonthly));
  A(`${nm}: platform monthly = license + usage`, near(r.platformMonthly, r.licenseMonthly + r.usageMonthly));
  A(`${nm}: hidden annual = (platform - base) x 12`, near(r.hiddenAnnual, (r.platformMonthly - r.baseMonthly) * 12));
  A(`${nm}: hidden annual = add-ons + tier + usage decomposed`, near(r.hiddenAnnual, r.decomp.addOns + r.decomp.tier + r.decomp.usage));
  A(`${nm}: annual platform = platform monthly x 12`, near(r.annualPlatform, r.platformMonthly * 12));
  A(`${nm}: gap % reproduces from the two seat figures`,
    r.quotedSeat <= 0 ? r.gapPct === 0 : near(r.gapPct, (r.effPlatformSeat - r.quotedSeat) / r.quotedSeat * 100));
  A(`${nm}: one-time cost is excluded from the recurring seat`, near(r.effLicenseSeat * r.billable, r.licenseMonthly));
  A(`${nm}: one-time cost is excluded from hidden annual`, r.oneTimeTotal === 0 || r.hiddenAnnual < r.oneTimeTotal * 12);
}

/* ---- 4. scope, which is how a per-seat fee stops being overstated ---- */
console.log("\n4. module scope");
const scopeCase = (scope) => {
  const d = D();
  d.classes[1].count = 10; d.classes[2].count = 5; d.classes[3].count = 4;
  Object.keys(d.modules).forEach(k => { d.modules[k].need = "no"; });
  d.modules.wem.need = "yes"; d.modules.wem.status = "addon"; d.modules.wem.cost = 10; d.modules.wem.scope = scope;
  return compute(d);
};
A("scope all: 169 seats priced", near(scopeCase("all").addOnMonthly, 1690));
A("scope agent: 150 seats priced", near(scopeCase("agent").addOnMonthly, 1500));
A("scope agentsup: 160 seats priced", near(scopeCase("agentsup").addOnMonthly, 1600));
A("scope sup: 10 seats priced", near(scopeCase("sup").addOnMonthly, 100));
A("scope admin: 5 seats priced", near(scopeCase("admin").addOnMonthly, 50));
A("scope analyst: 4 seats priced", near(scopeCase("analyst").addOnMonthly, 40));
A("a narrower scope never costs more than all seats", scopeCase("sup").addOnMonthly < scopeCase("all").addOnMonthly);
A("scope with an empty class prices nothing", (() => {
  const d = D(); Object.keys(d.modules).forEach(k => { d.modules[k].need = "no"; });
  d.modules.wem.need = "yes"; d.modules.wem.status = "addon"; d.modules.wem.cost = 99; d.modules.wem.scope = "sup";
  return compute(d).addOnMonthly === 0;
})());

/* ---- 5. pricing behaviour classification, not commercial source ---- */
console.log("\n5. status classification");
const only = (status, cost = 20, need = "yes") => {
  const d = D();
  Object.keys(d.modules).forEach(k => { d.modules[k].need = "no"; d.modules[k].status = "included"; });
  d.modules.wem.need = need; d.modules.wem.status = status; d.modules.wem.cost = cost; d.modules.wem.scope = "all";
  return compute(d);
};
A("addon lands in add-on monthly", near(only("addon").addOnMonthly, 150 * 20) && only("addon").tierMonthly === 0);
A("tier lands in tier monthly, not add-ons", near(only("tier").tierMonthly, 150 * 20) && only("tier").addOnMonthly === 0);
A("tier is named as a tier upgrade", only("tier").tiers.length === 1);
A("onetime lands in the one-time total only", only("onetime").oneTimeTotal === 20 && only("onetime").addOnMonthly === 0);
A("onetime never touches hidden annual", only("onetime").hiddenAnnual === 0);
A("included costs nothing", only("included").addOnMonthly === 0 && only("included").hiddenAnnual === 0);
A("limited is recorded for confirmation", only("limited").limiteds.length === 1);
A("unknown is recorded and costs nothing", only("unknown").unknowns.length === 1 && only("unknown").addOnMonthly === 0);
A("usage is flagged separately from per-seat pricing", only("usage").usageFlagged.length === 1);
A("a module not needed is never priced", only("addon", 500, "no").addOnMonthly === 0);
A("a module marked unsure is never priced", only("addon", 500, "unsure").addOnMonthly === 0);
A("unsure is recorded", only("addon", 500, "unsure").anyUnsure === true);

/* ---- 6. guard and disclose. Every clamped input must be recorded. ---- */
console.log("\n6. guard and disclose");
const guardCase = (mut) => { const d = D(); mut(d); return compute(d); };
const G = [
  ["negative agent seat count", d => { d.classes[0].count = -150; }, "Agent seat count", -150, 0],
  ["negative agent seat price", d => { d.classes[0].price = -125; }, "Agent seat price", -125, 0],
  ["negative module cost", d => { d.modules.wem.cost = -9999; }, "WEM / WFM cost", -9999, 0],
  ["negative usage fee", d => { d.usage.ai = -50000; }, "AI assistant / copilot usage fee", -50000, 0],
  ["negative committed seats", d => { d.committedSeats = -500; }, "Committed seats", -500, 0],
  ["negative renewal uplift", d => { d.uplift = -50; }, "Renewal uplift", -50, 0],
  ["renewal uplift above 100%", d => { d.uplift = 900; }, "Renewal uplift", 900, 100],
  ["negative expansion seats", d => { d.seats18mo = -1000; }, "Seats added within 18 months", -1000, 0],
];
for (const [nm, mut, label, entered, used] of G) {
  const r = guardCase(mut);
  const g = r.guards.find(x => x.label === label);
  A(`${nm}: a correction is recorded`, !!g);
  A(`${nm}: the correction records what was entered`, !!g && g.entered === entered);
  A(`${nm}: the correction records what was computed`, !!g && g.used === used);
  A(`${nm}: the correction reaches the integrity flags`, r.flags.some(f => f.t.indexOf(label) >= 0 && f.sev === "warn"));
  A(`${nm}: the correction reaches the confidence line`, r.confLine.indexOf("INPUTS CORRECTED") >= 0);
  A(`${nm}: a corrected input caps confidence at Directional`, r.confidence === "Directional");
}
A("custom commit rate is guarded only when that basis is selected",
  guardCase(d => { d.commitRate = -400; }).guards.length === 0);
A("custom commit rate is guarded when the basis is selected",
  guardCase(d => { d.commitBasis = "custom"; d.commitRate = -400; d.committedSeats = 300; })
    .guards.some(g => g.label === "Custom commit rate"));
A("an unused module with a junk cost raises no correction the reader cannot act on",
  guardCase(d => { d.modules.outbound.need = "no"; d.modules.outbound.cost = -777; }).guards.length === 0);
A("corrections render money with the symbol leading",
  guardVal({ label: "x", entered: -2, used: 0, unit: "$" }, "entered") === "$-2");
A("corrections render percentages with the symbol trailing",
  guardVal({ label: "x", entered: 900, used: 100, unit: "%" }, "entered") === "900%");
A("corrections render bare counts with no symbol",
  guardVal({ label: "x", entered: -5, used: 0, unit: "" }, "entered") === "-5");
A("one renderer serves every print site, so the same fact cannot print two ways",
  (SRC.match(/guardVal\(/g) || []).length >= 4);

/* ---- 7. impossible-output blocking ---- */
console.log("\n7. impossible-output blocking");
const PUBLISHED = ["quotedSeat", "effLicenseSeat", "effPlatformSeat", "hiddenAnnual", "annualPlatform",
  "commitExpAnnual", "year3Seat", "exp18Annual", "oneTimeTotal", "usageMonthly", "addOnMonthly", "tierMonthly"];
let fuzzNeg = 0, fuzzVoid = 0, fuzzNonFinite = 0;
const rnd = (lo, hi) => lo + Math.random() * (hi - lo);
for (let i = 0; i < 400; i++) {
  const d = D();
  d.classes.forEach(c => { c.count = Math.round(rnd(-400, 400)); c.price = Math.round(rnd(-500, 900)); });
  Object.keys(d.modules).forEach(k => {
    d.modules[k].need = ["yes", "no", "unsure"][Math.floor(Math.random() * 3)];
    d.modules[k].status = ["included", "limited", "addon", "tier", "usage", "onetime", "unknown"][Math.floor(Math.random() * 7)];
    d.modules[k].cost = Math.round(rnd(-5000, 5000));
    d.modules[k].scope = ["all", "agent", "agentsup", "sup", "admin", "analyst"][Math.floor(Math.random() * 6)];
  });
  Object.keys(d.usage).forEach(k => { d.usage[k] = Math.round(rnd(-20000, 20000)); });
  d.committedSeats = Math.round(rnd(-900, 900));
  d.commitBasis = ["license", "quoted", "custom"][Math.floor(Math.random() * 3)];
  d.commitRate = Math.round(rnd(-900, 900));
  d.uplift = Math.round(rnd(-500, 2000));
  d.seats18mo = Math.round(rnd(-900, 900));
  const r = compute(d);
  if (PUBLISHED.some(k => r[k] < -1e-9)) fuzzNeg++;
  if (PUBLISHED.some(k => !Number.isFinite(r[k]))) fuzzNonFinite++;
  if (r.voided) fuzzVoid++;
}
A("400 random adversarial scenarios produce no negative published figure", fuzzNeg === 0);
A("400 random adversarial scenarios produce no non-finite published figure", fuzzNonFinite === 0);
A("with every input guarded, the invariant check is unreachable", fuzzVoid === 0);
A("the invariant list exists and is checked", Array.isArray(base.invariants));
A("the void flag is exported so the component can refuse to publish", typeof base.voided === "boolean");
A("the component refuses to publish a voided result", /if \(voided\) return;/.test(SRC));
A("a negative seat count cannot invent commit exposure",
  guardCase(d => { d.classes[0].count = -150; d.committedSeats = 0; }).commitExpSeats === 0);
A("zero seats yields zero, not a division artefact", (() => {
  const r = guardCase(d => { d.classes.forEach(c => { c.count = 0; }); });
  return r.quotedSeat === 0 && r.effLicenseSeat === 0 && r.effPlatformSeat === 0 && r.gapPct === 0;
})());
A("non-numeric input is treated as zero, not NaN", (() => {
  const r = guardCase(d => { d.classes[0].count = "abc"; d.classes[0].price = "xyz"; });
  return Number.isFinite(r.quotedSeat) && Number.isFinite(r.gapPct);
})());

/* ---- 8. commit exposure ---- */
console.log("\n8. commit exposure");
const commit = (mut) => { const d = D(); mut(d); return compute(d); };
A("committed below active is no exposure", commit(d => { d.committedSeats = 100; }).commitExpSeats === 0);
A("committed equal to active is no exposure", commit(d => { d.committedSeats = 150; }).commitExpSeats === 0);
A("committed above active is exposure on the difference", commit(d => { d.committedSeats = 200; }).commitExpSeats === 50);
A("license basis prices idle seats at the effective license seat",
  near(commit(d => { d.committedSeats = 200; }).commitExpAnnual, 50 * 185 * 12));
A("quoted basis prices idle seats at the quoted seat",
  near(commit(d => { d.committedSeats = 200; d.commitBasis = "quoted"; }).commitExpAnnual, 50 * 125 * 12));
A("custom basis prices idle seats at the entered rate",
  near(commit(d => { d.committedSeats = 200; d.commitBasis = "custom"; d.commitRate = 100; }).commitExpAnnual, 50 * 100 * 12));
A("the default basis is the license seat, not the usage-loaded equivalent, so exposure is not overstated",
  DEFAULTS.commitBasis === "license");
A("exposure at the license basis never exceeds exposure at the platform equivalent", (() => {
  const d = D(); d.committedSeats = 200; d.usage.ai = 30000;
  const r = compute(d);
  return r.commitExpAnnual <= r.commitExpSeats * r.effPlatformSeat * 12 + 1e-9;
})());
A("commit exposure is flagged, never silently absorbed",
  commit(d => { d.committedSeats = 200; }).flags.some(f => f.t.indexOf("Commit exposure") >= 0));

/* ---- 9. renewal uplift ---- */
console.log("\n9. renewal uplift");
A("zero uplift holds the license seat flat", near(compute(D()).year3LicenseSeat, 185));
A("uplift compounds over two years", (() => {
  const r = commit(d => { d.uplift = 10; });
  return near(r.year3LicenseSeat, 185 * 1.1 * 1.1);
})());
A("uplift applies to the license component only, usage held flat", (() => {
  const d = D(); d.uplift = 10; d.usage.ai = 15000;
  const r = compute(d);
  return near(r.year3Seat, r.year3LicenseSeat + r.usagePerSeat);
})());
A("year-three seat is never below the year-one platform seat", (() => {
  for (const u of [0, 1, 5, 20, 100]) {
    const d = D(); d.uplift = u; d.usage.ai = 5000;
    const r = compute(d);
    if (r.year3Seat < r.effPlatformSeat - 1e-9) return false;
  }
  return true;
})());
A("uplift above the ceiling computes at the ceiling, not at the entered figure",
  near(commit(d => { d.uplift = 900; }).year3LicenseSeat, 185 * 4));
A("a negative uplift no longer silences the missing-uplift notice",
  commit(d => { d.uplift = -50; }).flags.some(f => f.t.indexOf("no annual uplift entered") >= 0));
A("expansion seats price at the platform equivalent",
  near(commit(d => { d.seats18mo = 25; }).exp18Annual, 25 * 185 * 12));

/* ---- 10. double counting ---- */
console.log("\n10. double counting");
const dbl = (mut) => { const d = D(); mut(d); return compute(d); };
A("a priced module with a matching usage meter is flagged",
  dbl(d => { d.modules.digital.need = "yes"; d.modules.digital.status = "addon"; d.usage.sms = 4000; }).doubles.indexOf("digital") >= 0);
A("an included module with a usage meter is not a double count",
  dbl(d => { d.modules.digital.need = "yes"; d.modules.digital.status = "included"; d.usage.sms = 4000; }).doubles.length === 0);
A("a priced module with no usage entered is not a double count",
  dbl(d => { d.modules.digital.need = "yes"; d.modules.digital.status = "addon"; }).doubles.length === 0);
A("a negative usage figure cannot manufacture a double count",
  dbl(d => { d.modules.digital.need = "yes"; d.modules.digital.status = "addon"; d.usage.sms = -4000; }).doubles.length === 0);
A("every double-count pair has a label the report can print",
  Object.keys(DBL_MAP).every(k => typeof DBL_LABEL[k] === "string" && DBL_LABEL[k].length > 0));
A("every double-count target is a real usage type",
  Object.values(DBL_MAP).every(v => USAGE_TYPES.some(t => t.id === v)));
A("every double-count source is a real module",
  Object.keys(DBL_MAP).every(k => MODULES.some(m => m.id === k)));
A("an unacknowledged double count is a warning",
  dbl(d => { d.modules.digital.need = "yes"; d.modules.digital.status = "addon"; d.usage.sms = 4000; })
    .flags.some(f => f.sev === "warn" && f.t.indexOf("double count") >= 0));
A("an acknowledged double count is an information note, not a warning",
  dbl(d => { d.modules.digital.need = "yes"; d.modules.digital.status = "addon"; d.usage.sms = 4000; d.dblAck = true; })
    .flags.some(f => f.sev === "info" && f.t.indexOf("Double count reviewed") >= 0));

/* ---- 11. single-driver dominance ---- */
console.log("\n11. single-driver dominance");
const domCase = (mut) => { const d = D(); mut(d); return compute(d); };
A("the shipped defaults spread cost across three drivers", base.singleDriverDominant === false);
A("one line above 80% of recurring cost is flagged", (() => {
  const r = domCase(d => { d.modules.wem.cost = 4000; });
  return r.singleDriverDominant === true;
})());
A("a dominant line names the driver in the flag", (() => {
  const r = domCase(d => { d.modules.wem.cost = 4000; });
  return r.flags.some(f => f.t.indexOf("WEM / WFM") >= 0 && f.t.indexOf("%") >= 0);
})());
A("dominance needs at least two recurring drivers to mean anything", (() => {
  const d = D();
  Object.keys(d.modules).forEach(k => { d.modules[k].need = "no"; });
  d.modules.wem.need = "yes"; d.modules.wem.status = "addon"; d.modules.wem.cost = 50;
  return compute(d).singleDriverDominant === false;
})());
A("dominance is measured on recurring license cost, not on hidden annual", (() => {
  const r = domCase(d => { d.usage.ai = 900000; });
  return r.singleDriverDominant === false;
})());
A("usage dominating the hidden annual is reported, never treated as a category error", (() => {
  const r = domCase(d => { d.usage.ai = 900000; });
  return r.usageDominant === true && r.flags.some(f => f.sev === "info" && f.t.indexOf("usage-heavy") >= 0);
})());
A("the dominant recurring driver is the largest recurring driver", (() => {
  const r = domCase(d => { d.modules.wem.cost = 4000; });
  return r.recurDrivers.every(x => x.annual <= r.topRecur.annual + 1e-9);
})());
A("drivers are sorted descending by annual cost",
  base.drivers.every((x, i) => i === 0 || base.drivers[i - 1].annual >= x.annual));

/* ---- 12. confidence: two axes, lower wins, and it says which ---- */
console.log("\n12. confidence");
const conf = (mut) => { const d = D(); mut(d); return compute(d); };
const financeReady = (d) => {
  d.evidence = "msa"; d.confirmed = true; d.committedSeats = 200; d.uplift = 5; d.dblAck = true;
};
A("a complete, documented, confirmed run reaches Finance-grade",
  conf(financeReady).confidence === "Finance-grade");
A("an estimate is Directional however complete the model is",
  conf(d => { financeReady(d); d.evidence = "estimate"; }).confidence === "Directional");
A("a vendor email reaches Planning-grade but no further",
  conf(d => { financeReady(d); d.evidence = "email"; }).confidence === "Planning-grade");
A("a document not confirmed in writing reaches Planning-grade but no further",
  conf(d => { financeReady(d); d.confirmed = false; }).confidence === "Planning-grade");
A("unknown inclusion on a needed module caps at Directional",
  conf(d => { financeReady(d); d.modules.wem.status = "unknown"; }).confidence === "Directional");
A("a module marked unsure caps at Directional",
  conf(d => { financeReady(d); d.modules.outbound.need = "unsure"; }).confidence === "Directional");
A("an implausible bundle gap caps at Directional",
  conf(d => { financeReady(d); d.modules.wem.cost = 5000; }).confidence === "Directional");
A("missing committed seats caps at Planning-grade",
  conf(d => { financeReady(d); d.committedSeats = 0; }).confidence === "Planning-grade");
A("missing renewal uplift caps at Planning-grade",
  conf(d => { financeReady(d); d.uplift = 0; }).confidence === "Planning-grade");
A("a usage-based module with no usage priced caps at Planning-grade",
  conf(d => { financeReady(d); d.modules.ai.need = "yes"; d.modules.ai.status = "usage"; }).confidence === "Planning-grade");
A("an unconfirmed double count caps at Planning-grade",
  conf(d => { financeReady(d); d.modules.digital.need = "yes"; d.modules.digital.status = "addon"; d.usage.sms = 3000; d.dblAck = false; }).confidence === "Planning-grade");
A("a dominant unconfirmed recurring line caps at Planning-grade", (() => {
  const r = conf(d => { financeReady(d); d.modules.wem.cost = 300; });
  return r.singleDriverDominant && r.confidence === "Planning-grade";
})());
A("confidence is never above either axis", (() => {
  for (const mut of [d => financeReady(d), d => { financeReady(d); d.evidence = "email"; },
    d => { financeReady(d); d.committedSeats = 0; }, d => {}, d => { d.evidence = "sku"; }]) {
    const r = conf(mut);
    if (GRADE_RANK[r.confidence] > GRADE_RANK[r.evidenceGrade]) return false;
    if (GRADE_RANK[r.confidence] > GRADE_RANK[r.completenessCeiling]) return false;
  }
  return true;
})());
A("confidence equals the lower of the two axes", (() => {
  for (const mut of [d => financeReady(d), d => { financeReady(d); d.evidence = "email"; },
    d => { financeReady(d); d.uplift = 0; }, d => {}, d => { d.evidence = "proposal"; d.confirmed = true; }]) {
    const r = conf(mut);
    const lower = GRADE_RANK[r.evidenceGrade] <= GRADE_RANK[r.completenessCeiling] ? r.evidenceGrade : r.completenessCeiling;
    if (r.confidence !== lower) return false;
  }
  return true;
})());
A("the rationale names which axis bound the grade", (() => {
  const evBound = conf(d => { financeReady(d); d.evidence = "estimate"; });
  const mdBound = conf(d => { financeReady(d); d.committedSeats = 0; });
  return evBound.boundBy === "evidence" && evBound.gradeWhy.indexOf("evidence") >= 0
    && mdBound.boundBy === "model completeness" && mdBound.gradeWhy.indexOf("committed seats") >= 0;
})());
A("a Finance-grade rationale says why it earned it",
  conf(financeReady).gradeWhy.indexOf("confirmed in writing") >= 0);
A("when both axes bind, both are named", (() => {
  const r = conf(d => { d.committedSeats = 0; });
  return r.boundBy === "both" || r.gradeWhy.indexOf("bound by") >= 0;
})());
A("every document evidence type is a real option",
  [...DOC_EVIDENCE].every(v => EVIDENCE_OPTS.some(o => o.v === v)));
A("an estimate is not a document", !DOC_EVIDENCE.has("estimate"));
A("a vendor email is not a document", !DOC_EVIDENCE.has("email"));
A("the magnitude-doubt rationale is exported, not left in prose", (() => {
  const r = conf(d => { financeReady(d); d.modules.wem.cost = 5000; });
  return Array.isArray(r.doubtWhy) && r.doubtWhy.length > 0 && r.doubtWhy.join(" ").indexOf("%") >= 0;
})());
A("no doubt rationale is exported when there is no doubt", base.doubtWhy.length === 0);

/* ---- 13. shelfware is leverage, never savings ---- */
console.log("\n13. shelfware");
A("bundled but unneeded is shelfware", base.shelfware.map(m => m.id).indexOf("support") >= 0);
A("a needed included module is not shelfware", (() => {
  const d = D(); d.modules.support.need = "yes";
  return compute(d).shelfware.map(m => m.id).indexOf("support") < 0;
})());
A("an unneeded add-on is not shelfware, because it is not bundled", (() => {
  const d = D(); d.modules.outbound.need = "no"; d.modules.outbound.status = "addon";
  return compute(d).shelfware.map(m => m.id).indexOf("outbound") < 0;
})());
A("shelfware never reduces hidden annual", (() => {
  const d = D(); d.modules.storage.need = "no"; d.modules.support.need = "no";
  return near(compute(d).hiddenAnnual, base.hiddenAnnual);
})());
A("shelfware is described as leverage, not recoverable savings",
  base.analyst.concat(base.flags.map(f => f.t)).join(" ").toLowerCase().indexOf("not recoverable") >= 0
  || base.flags.some(f => f.t.indexOf("not recoverable savings") >= 0));

/* ---- 14. unit normalization ---- */
console.log("\n14. unit normalization");
A("seat figures are monthly", near(base.quotedSeat * base.billable, base.baseMonthly));
A("decomposed figures are annual", near(base.decomp.addOns, base.addOnMonthly * 12));
A("tier decomposition is annual", near(base.decomp.tier, base.tierMonthly * 12));
A("usage decomposition is annual", near(base.decomp.usage, base.usageMonthly * 12));
A("usage per seat is monthly", (() => {
  const d = D(); d.usage.ai = 3000;
  const r = compute(d);
  return near(r.usagePerSeat, 3000 / 150);
})());
A("commit exposure is annual", (() => {
  const r = commit(d => { d.committedSeats = 200; });
  return near(r.commitExpAnnual, r.commitExpSeats * r.commitBasisPrice * 12);
})());
A("percentages are expressed 0 to 100, not 0 to 1", base.gapPct > 1);
A("fmtK renders thousands", fmtK(108000) === "$108K");
A("fmtK renders millions", fmtK(1800000) === "$1.80M");
A("fmtK carries the sign outside the symbol", fmtK(-2000) === "-$2K");

/* ---- 15. integrity flags reproduce their own arithmetic ---- */
console.log("\n15. flag arithmetic");
A("every flag carries a severity the report can render",
  base.flags.every(f => f.sev === "warn" || f.sev === "info"));
A("every flag carries text", base.flags.every(f => typeof f.t === "string" && f.t.length > 0));
A("a tier flag reproduces the blended per-seat figure", (() => {
  const d = D(); d.modules.analytics.status = "tier";
  const r = compute(d);
  const blended = Math.round(r.tierMonthly / Math.max(1, r.billable));
  return r.flags.some(f => f.t.indexOf("$" + blended + "/seat") >= 0);
})());
A("a usage-dominance flag reproduces its own percentage", (() => {
  const d = D(); d.usage.ai = 900000;
  const r = compute(d);
  const pct = Math.round((r.usageMonthly * 12 / r.hiddenAnnual) * 100);
  return r.flags.some(f => f.t.indexOf(pct + "%") >= 0);
})());
A("a commit-exposure flag reproduces its own seat count and basis price", (() => {
  const r = commit(d => { d.committedSeats = 200; });
  return r.flags.some(f => f.t.indexOf("200 committed vs 150 active") >= 0 && f.t.indexOf("$" + r.commitBasisPrice.toFixed(0)) >= 0);
})());
A("a priced module left at zero is flagged so the gap is not understated", (() => {
  const d = D(); d.modules.wem.cost = 0;
  return compute(d).flags.some(f => f.t.indexOf("WEM / WFM") >= 0 && f.t.indexOf("$0") >= 0);
})());
A("a clean run reports no unresolved caveats",
  conf(financeReady).confLine.indexOf("No unresolved commercial caveats") >= 0);

/* ---- 16. the analyst read tracks the numbers ---- */
console.log("\n16. analyst read");
A("the analyst read opens with the seat ladder",
  base.analyst[0].indexOf("$125") >= 0 && base.analyst[0].indexOf("$185") >= 0);
A("the analyst read reproduces the gap percentage", base.analyst[0].indexOf("48%") >= 0);
A("the analyst read reproduces the hidden annual", base.analyst[0].indexOf(fmtK(base.hiddenAnnual)) >= 0);
A("the analyst read refuses to call hidden cost waste", base.analyst[0].indexOf("not automatically waste") >= 0);
A("a commit-exposure run explains the exposure", (() => {
  const r = commit(d => { d.committedSeats = 200; });
  return r.analyst.some(t => t.indexOf("50-seat gap") >= 0);
})());
A("an uplift run reproduces the corrected uplift, never the entered one", (() => {
  const r = commit(d => { d.uplift = 900; });
  return r.analyst.some(t => t.indexOf("100% annual uplift") >= 0) && !r.analyst.some(t => t.indexOf("900%") >= 0);
})());
A("a one-time run states the exclusion", (() => {
  const d = D(); d.modules.services.need = "yes"; d.modules.services.cost = 250000;
  return compute(d).analyst.some(t => t.indexOf("excluded from the recurring") >= 0);
})());
A("the closing paragraph reproduces the corrected expansion seats", (() => {
  const r = commit(d => { d.seats18mo = -1000; });
  return r.analyst[r.analyst.length - 1].indexOf("-1000") < 0;
})());

/* ---- 17. defaults contract ---- */
console.log("\n17. defaults contract");
A("DEFAULTS carries every module", MODULES.every(m => !!DEFAULTS.modules[m.id]));
A("DEFAULTS carries every usage type", USAGE_TYPES.every(t => typeof DEFAULTS.usage[t.id] === "number"));
A("every default module status is a real status",
  MODULES.every(m => ["included", "limited", "addon", "tier", "usage", "onetime", "unknown"].indexOf(DEFAULTS.modules[m.id].status) >= 0));
A("every default module scope is a real scope",
  MODULES.every(m => ["all", "agent", "agentsup", "sup", "admin", "analyst"].indexOf(DEFAULTS.modules[m.id].scope) >= 0));
A("core modules default to needed", MODULES.filter(m => m.core).every(m => DEFAULTS.modules[m.id].need === "yes"));
A("non-core modules default to not needed", MODULES.filter(m => !m.core).every(m => DEFAULTS.modules[m.id].need === "no"));
A("no default usage fee is assumed", USAGE_TYPES.every(t => DEFAULTS.usage[t.id] === 0));
A("no default commitment is assumed", DEFAULTS.committedSeats === 0);
A("no default uplift is assumed", DEFAULTS.uplift === 0);
A("evidence defaults to the weakest claim", DEFAULTS.evidence === "estimate");
A("nothing is confirmed by default", DEFAULTS.confirmed === false && DEFAULTS.dblAck === false);
A("clone produces an independent copy", (() => {
  const a = D(); a.classes[0].count = 1;
  return DEFAULTS.classes[0].count === 150;
})());
A("compute does not mutate its input", (() => {
  const d = D(); const before = JSON.stringify(d);
  compute(d);
  return JSON.stringify(d) === before;
})());
A("compute is deterministic", JSON.stringify(compute(D()).flags) === JSON.stringify(compute(D()).flags));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
