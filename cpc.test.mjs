/* cpc.test.mjs
 *
 * Slices the @engine-start..@engine-end region out of CostPerContactCalculator.jsx
 * and tests the DEPLOYED engine. Nothing is reconstructed. MECH comes from the real
 * ./src/lib/mech.js and the three channel colours from the real
 * ./src/lib/benchmarks.js, so a drift in either fails here rather than passing on
 * invented constants. If the marker region stops parsing, this fails loudly rather
 * than silently falling back to a copy that would drift from the shipped file.
 *
 * Run from repo root: node cpc.test.mjs
 */
import { readFileSync } from "fs";

/* ---- dependency integrity. Import the real modules, do not rebuild them. ---- */
let MECH, MECH_ORDER, MECH_DEFAULT, COLORS;
try {
  const m = await import("./src/lib/mech.js");
  ({ MECH, MECH_ORDER, MECH_DEFAULT } = m);
  ({ COLORS } = await import("./src/lib/benchmarks.js"));
} catch (e) {
  console.error("BLOCKER: could not import ./src/lib/mech.js or ./src/lib/benchmarks.js.");
  console.error("The engine cannot be verified against reconstructed constants. Run from the repo root.");
  console.error(String(e.message || e));
  process.exit(1);
}

let pass = 0, fail = 0;
const A = (nm, c) => { if (c) pass++; else { fail++; console.log("  FAIL:", nm); } };
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

/* ---- 0. Validate the shared mechanism module before trusting anything downstream ---- */
console.log("\n0. shared mechanism contract");
A("mech.js exports MECH, MECH_ORDER, MECH_DEFAULT",
  !!MECH && Array.isArray(MECH_ORDER) && typeof MECH_DEFAULT === "string");
A("MECH_DEFAULT is a key in MECH", !!MECH[MECH_DEFAULT]);
A("MECH_DEFAULT is not headcount reduction", MECH_DEFAULT !== "headcount");
A("every MECH_ORDER key exists in MECH", MECH_ORDER.every(k => !!MECH[k]));
A("MECH_ORDER covers every MECH key", Object.keys(MECH).every(k => MECH_ORDER.indexOf(k) >= 0));
A("every MECH entry has numeric f in [0,1], a label and a cred class",
  Object.values(MECH).every(v => typeof v.f === "number" && v.f >= 0 && v.f <= 1 && typeof v.label === "string" && typeof v.cred === "string"));
A("MECH_ORDER is monotonically non-decreasing in f",
  MECH_ORDER.every((k, i) => i === 0 || MECH[k].f >= MECH[MECH_ORDER[i - 1]].f));
A("a zero-realization option exists, so 'none' can mean $0",
  Object.values(MECH).some(v => v.f === 0));
A("cred classes are drawn from the known taxonomy",
  Object.values(MECH).every(v => ["none", "capacity", "finance", "cash"].indexOf(v.cred) >= 0));

/* ---- 1. Slice the shipped engine ---- */
console.log("\n1. engine slice");
const SRC = readFileSync("./CostPerContactCalculator.jsx", "utf8");
const a = SRC.indexOf("/* @engine-start"), b = SRC.indexOf("/* @engine-end */");
if (a < 0 || b < 0) { console.error("BLOCKER: engine markers not found in CostPerContactCalculator.jsx."); process.exit(1); }
const region = SRC.slice(a, b).replace(/^export /gm, "");

let compute, buildAnalystRead, BASE, DEFAULTS, money, fmtK, n;
try {
  ({ compute, buildAnalystRead, BASE, DEFAULTS, money, fmtK, n } = new Function(
    "MECH", "ELECTRIC", "GREEN", "AMBER",
    region + "\nreturn { compute, buildAnalystRead, BASE, DEFAULTS, money, fmtK, n };"
  )(MECH, COLORS.electric, COLORS.green, COLORS.amber));
} catch (e) {
  console.error("BLOCKER: the engine region did not evaluate. The marker region has");
  console.error("picked up code it cannot parse, or lost a dependency it closes over.");
  console.error(String(e.message || e));
  process.exit(1);
}
A("engine region slices and evaluates", typeof compute === "function");
A("engine region carries the analyst-read builder", typeof buildAnalystRead === "function");
A("engine region carries its own formatters", typeof money === "function" && typeof fmtK === "function" && typeof n === "function");
A("engine region carries the shipped default input set", !!BASE && typeof BASE.monthlyContacts === "number");
A("DEFAULTS.d is the shipped BASE, not a second copy", DEFAULTS.d === BASE);
A("DEFAULTS.mech is a real mechanism key", !!MECH[DEFAULTS.mech]);
A("DEFAULTS.mech is not headcount reduction", DEFAULTS.mech !== "headcount");
A("marker region contains no JSX", !/<[A-Za-z][A-Za-z0-9]*[\s/>]/.test(region));
A("engine region does not reconstruct the mechanism ladder", !/\bnone:\s*\{\s*label:/.test(region));
A("the file no longer carries a second copy of the formatters",
  (SRC.match(/^const money = /gm) || []).length === 1 && (SRC.match(/^const fmtK = /gm) || []).length === 1);

const K = MECH_ORDER.slice();
const B = () => JSON.parse(JSON.stringify(BASE));
const clean = (r) => r.guards.length === 0;

/* ---- 2. Core identity. Every figure must be derivable from the figures
         printed beside it, or the report is unrelated numbers sharing a page. ---- */
console.log("\n2. internal reconciliation");
{
  let cErr = 0, cprErr = 0, resErr = 0, repErr = 0, shareErr = 0, burErr = 0, burLErr = 0, gapErr = 0;
  for (let i = 0; i < 20000; i++) {
    const fcrPct = Math.random() * 100;
    const d = {
      ...B(),
      monthlyContacts: Math.round(Math.random() * 500000),
      fcrRate: fcrPct,
      contactsPerUnresolved: 1 + Math.random() * 4,
      loadedCPC: 1 + Math.random() * 30,
      marginalCPC: 0.5 + Math.random() * 15,
      agentHourly: 8 + Math.random() * 40,
      overheadMultiplier: 1 + Math.random(),
      denominator: Math.random() < 0.5 ? "issues" : "handled",
    };
    const mech = K[Math.floor(Math.random() * K.length)];
    const r = compute(d, mech);
    const fcr = r.fcrPct / 100;

    if (!near(r.C, fcr + (1 - fcr) * r.Mu)) cErr++;
    if (!near(r.gapPct, (r.C - 1) * 100)) gapErr++;
    if (!near(r.cprLoaded, r.loaded * r.C)) cprErr++;
    // Rounded outputs: reconcile to the printed integers within one unit.
    if (d.denominator === "issues") {
      if (Math.abs(r.handled - r.vol * r.C) > 1) resErr++;
      if (Math.abs(r.resolutions - r.vol) > 1) resErr++;
    } else {
      if (Math.abs(r.handled - r.vol) > 1) resErr++;
      if (Math.abs(r.resolutions - r.vol / r.C) > 1) resErr++;
    }
    if (Math.abs(r.repeatContacts - (r.handled - r.resolutions)) > 2) repErr++;
    /* handled, resolutions and repeatContacts are rounded to integers on the way
       out because the report prints them as contact counts; burden and share are
       computed from the unrounded figures. A reader who multiplies the printed
       repeat count by the printed marginal cost must land within one contact of
       the printed burden, or the document does not reconcile by hand. */
    if (r.handled > 0 && Math.abs(r.repeatShare - r.repeatContacts / r.handled) > 1 / r.handled) shareErr++;
    if (Math.abs(r.burden - r.repeatContacts * r.marg) > r.marg) burErr++;
    if (Math.abs(r.burdenLoaded - r.repeatContacts * r.loaded) > r.loaded) burLErr++;
  }
  A("C = FCR + (1 - FCR) x M in every case", cErr === 0);
  A("resolution gap % = (C - 1) x 100 in every case", gapErr === 0);
  A("cost per resolution = loaded CPC x C in every case", cprErr === 0);
  A("handled and resolved reconcile through C on BOTH volume bases", resErr === 0);
  A("repeat contacts = handled minus resolutions in every case", repErr === 0);
  A("repeat share = repeat contacts / handled in every case", shareErr === 0);
  A("repeat-demand burden = repeat contacts x MARGINAL cost, never loaded", burErr === 0);
  A("burden (loaded) = repeat contacts x LOADED cost", burLErr === 0);
  A("contact counts are published as integers, so the printed report reconciles by hand",
    [B(), { ...B(), denominator: "issues" }, { ...B(), monthlyContacts: 137 }].every(d => {
      const r = compute(d, "hiring");
      return Number.isInteger(r.handled) && Number.isInteger(r.resolutions) && Number.isInteger(r.repeatContacts);
    }));
}

/* ---- 3. Capacity versus cash. The mech.js doctrine is the point of this tool. ---- */
console.log("\n3. capacity versus cash");
{
  const r = compute(B(), "hiring");
  A("released is marginal-valued, never loaded",
    r.dividend.every(s => near(s.released, s.avoided * r.marg)));
  A("realizable = released x the mechanism factor, always",
    r.dividend.every(s => near(s.realizable, s.released * MECH.hiring.f)));
  A("realizable never exceeds released", r.dividend.every(s => s.realizable <= s.released + 1e-9));

  const none = compute(B(), "none");
  A("mechanism 'none' realizes exactly $0 across every dividend step",
    none.dividend.every(s => s.realizable === 0));
  A("mechanism 'none' still shows non-zero released capacity",
    none.dividend.every(s => s.released > 0));
  A("released is identical across every mechanism: capacity does not depend on the action",
    K.every(k => compute(B(), k).dividend.every((s, i) => near(s.released, none.dividend[i].released))));
  A("realizable is monotonically non-decreasing across the mechanism ladder",
    K.every((k, i) => i === 0 || compute(B(), k).dividend[1].realizable >= compute(B(), K[i - 1]).dividend[1].realizable - 1e-9));
  A("headcount reduction realizes 100% of released and nothing more",
    near(compute(B(), "headcount").dividend[1].realizable, none.dividend[1].released));
  A("the repeat-demand burden is NOT scaled by the mechanism: it is a baseline, not a saving",
    K.every(k => near(compute(B(), k).burden, none.burden)));
  A("mf on the result is exactly the shared MECH factor for the selected key",
    K.every(k => compute(B(), k).mf === MECH[k].f));
}

/* ---- 4. The FCR dividend ---- */
console.log("\n4. FCR dividend");
{
  const r = compute(B(), "hiring");
  A("three dividend steps are modelled: +5, +10, +15", r.dividend.map(s => s.p).join(",") === "5,10,15");
  A("released rises with the size of the FCR move",
    r.dividend[0].released < r.dividend[1].released && r.dividend[1].released < r.dividend[2].released);
  A("+5 is labelled operational, +10 root-cause, +15 transformation",
    r.dividend[0].tier === "Operational" && r.dividend[1].tier === "Root-cause work" && r.dividend[2].tier === "Transformation");
  A("avoided contacts are never negative", r.dividend.every(s => s.avoided >= 0));
  A("new FCR is capped at 100% and never exceeds it",
    compute({ ...B(), fcrRate: 92 }, "hiring").dividend.every(s => s.newFCR <= 100 + 1e-9));
  A("at 100% FCR there is nothing left to release",
    compute({ ...B(), fcrRate: 100 }, "hiring").dividend.every(s => s.released === 0));
  A("released never exceeds the total repeat-demand burden it is carved out of",
    r.dividend.every(s => s.released <= r.burden + 1e-6));
  A("avoided contacts scale with volume, linearly",
    near(compute({ ...B(), monthlyContacts: 100000 }, "hiring").dividend[1].avoided,
         2 * compute({ ...B(), monthlyContacts: 50000 }, "hiring").dividend[1].avoided, 1e-6));
  A("FTE equivalent = avoided contacts x blended effective minutes / 60 / productive hours",
    r.dividend.every(s => near(s.fte, (s.avoided * r.blendedEffMin / 60) / r.pHrs)));
}

/* ---- 5. Volume basis. The tool offers two denominators; they must agree. ---- */
console.log("\n5. volume basis");
{
  const h = compute({ ...B(), denominator: "handled", monthlyContacts: 50000 }, "hiring");
  const iss = compute({ ...B(), denominator: "issues", monthlyContacts: Math.round(h.resolutions) }, "hiring");
  A("stating the SAME operation on either basis produces the same handled volume",
    Math.abs(iss.handled - h.handled) <= 2);
  A("stating the same operation on either basis produces the same repeat share",
    Math.abs(iss.repeatShare - h.repeatShare) < 1e-3);
  A("unit costs are basis-independent: CPC and CPR do not move with the denominator",
    near(iss.loaded, h.loaded) && near(iss.cprLoaded, h.cprLoaded));
  A("switching basis on the SAME number is not a no-op: issues basis implies more contacts",
    compute({ ...B(), denominator: "issues" }, "hiring").handled >
    compute({ ...B(), denominator: "handled" }, "hiring").handled);
}

/* ---- 6. Input guards. A scenario link decodes straight into compute() with no
         field validation in between, so the engine is the only place this can be
         caught. Clamping silently is not a fix: the report must disclose it. ---- */
console.log("\n6. input guards and impossible-output blocking");
{
  const neg = compute({ ...B(), monthlyContacts: -50000 }, "hiring");
  A("negative volume is blocked, not silently absorbed", neg.blocked);
  A("negative volume produces no negative handled figure", neg.handled >= 0);
  A("negative volume raises a warn-level flag", neg.flags.some(f => f.sev === "warn"));

  const negC = compute({ ...B(), loadedCPC: -7 }, "hiring");
  A("negative loaded cost is blocked", negC.blocked);
  A("negative loaded cost cannot print a negative cost per resolution", negC.cprLoaded >= 0);

  const negM = compute({ ...B(), marginalCPC: -4.2 }, "hiring");
  A("negative marginal cost is blocked", negM.blocked);
  A("negative marginal cost cannot print a negative burden", negM.burden >= 0);

  const hi = compute({ ...B(), fcrRate: 150 }, "hiring");
  A("FCR above 100% is blocked, not silently capped", hi.blocked);
  A("FCR above 100% is computed at 100%", hi.fcrPct === 100);
  A("the guard record names both the entered and the used value",
    hi.guards.some(g => g.entered === 150 && g.used === 100));

  const lo = compute({ ...B(), fcrRate: -20 }, "hiring");
  A("negative FCR is blocked", lo.blocked);
  A("negative FCR is computed at 0%, so C can never exceed M", lo.C <= lo.Mu + 1e-9);

  const m0 = compute({ ...B(), contactsPerUnresolved: 0.5 }, "hiring");
  A("M below 1 is blocked: an unresolved issue takes at least one contact", m0.blocked && m0.Mu === 1);

  const ah = compute({ ...B(), agentHourly: -18 }, "hiring");
  A("negative agent pay is blocked", ah.blocked);
  A("negative agent pay cannot produce a negative blended handle cost", ah.blendedHandle >= 0);

  const ph = compute({ ...B(), productiveHoursPerFTE: 0 }, "hiring");
  A("a zero productive-hours substitution is disclosed, not silent", ph.blocked && ph.pHrs === 140);
  A("FTE burden stays finite when productive hours are zero", isFinite(ph.fteBurden));

  const ov = compute({ ...B(), overheadMultiplier: 0.4 }, "hiring");
  A("an overhead multiplier below 1 is blocked: loaded cost cannot be under base pay", ov.blocked);

  A("the shipped defaults are clean: no guard fires on an untouched tool", clean(compute(B(), "hiring")));
  A("guard flags are ordered first, ahead of the advisory flags",
    hi.flags[0].t.indexOf("First contact resolution") === 0);
  A("a blocked run still returns a complete, finite result object",
    [neg, negC, hi, lo, ah, ph].every(r => isFinite(r.cprLoaded) && isFinite(r.burden) && isFinite(r.fteBurden) && Array.isArray(r.dividend)));
  A("no result anywhere in the guard set is NaN",
    [neg, negC, negM, hi, lo, m0, ah, ph, ov].every(r =>
      [r.C, r.cprLoaded, r.burden, r.burdenLoaded, r.repeatShare, r.blendedHandle, r.fteBurden].every(v => isFinite(v))));
}

/* ---- 7. Channel mix ---- */
console.log("\n7. channel handle economics");
{
  const r = compute(B(), "hiring");
  A("channel mix sums to 100% on the shipped defaults", r.chPctTotal === 100);
  A("effective AHT is stated AHT divided by concurrency",
    r.channels.every(c => near(c.effAHT, c.aht / c.conc)));
  A("chat undercuts voice on handle cost purely through concurrency",
    r.channels[1].handleCPC < r.channels[0].handleCPC);
  A("handle cost per contact = loaded labour per minute x effective minutes",
    r.channels.every(c => near(c.handleCPC, (r.agentHourly * r.overheadMult / 60) * c.effAHT)));
  A("blended handle cost is the mix-weighted average of the three channels",
    near(r.blendedHandle, r.channels.reduce((s, c) => s + (c.pct / r.chPctTotal) * c.handleCPC, 0)));
  A("channel spend sums to handled volume x blended handle cost at a 100% mix",
    near(r.channels.reduce((s, c) => s + c.spend, 0), r.handled * r.blendedHandle, 1e-6));

  const off = compute({ ...B(), voicePct: 60, chatPct: 25, emailPct: 5 }, "hiring");
  A("a mix that does not sum to 100% is flagged",
    off.flags.some(f => /Channel mix sums to 90%/.test(f.t)));

  const zero = compute({ ...B(), voicePct: 0, chatPct: 0, emailPct: 0 }, "hiring");
  A("a 0% mix is flagged: the || 100 fallback no longer masks its own guard",
    zero.flags.some(f => /Channel mix sums to 0%/.test(f.t)));
  A("a 0% mix discloses that effective handle time fell back to a constant",
    zero.blendedEffMinFallback === true);
  A("a 0% mix does not silently print a positive blended handle cost", zero.blendedHandle === 0);
  A("the FTE burden stays finite on a 0% mix", isFinite(zero.fteBurden) && zero.fteBurden > 0);
}

/* ---- 8. Derived marginal cost ---- */
console.log("\n8. derived marginal cost");
{
  const der = compute({ ...B(), marginalCPC: 0 }, "hiring");
  A("a blank marginal cost is derived at 60% of loaded", near(der.marg, der.loaded * 0.6));
  A("a derived marginal cost is disclosed, not assumed silently", der.margDerived === true);
  A("a derived marginal cost raises a flag naming the derivation",
    der.flags.some(f => /derived at 60% of loaded/.test(f.t)));
  A("an entered marginal cost is never overwritten", compute(B(), "hiring").margDerived === false);
  A("marginal at or above loaded is flagged as a cost-basis error",
    compute({ ...B(), marginalCPC: 9 }, "hiring").flags.some(f => /Marginal cost is not below loaded/.test(f.t)));
}

/* ---- 9. Single-driver dominance and directional sanity ---- */
console.log("\n9. directional sanity");
{
  const base = compute(B(), "hiring");
  A("burden rises when FCR falls", compute({ ...B(), fcrRate: 60 }, "hiring").burden > base.burden);
  A("burden rises when M rises", compute({ ...B(), contactsPerUnresolved: 3.5 }, "hiring").burden > base.burden);
  A("burden rises when marginal cost rises", compute({ ...B(), marginalCPC: 6 }, "hiring").burden > base.burden);
  A("cost per resolution rises when loaded cost rises", compute({ ...B(), loadedCPC: 9 }, "hiring").cprLoaded > base.cprLoaded);
  A("cost per resolution equals cost per contact only at 100% FCR",
    near(compute({ ...B(), fcrRate: 100 }, "hiring").cprLoaded, base.loaded));
  A("burden (loaded) always exceeds burden (marginal) when marginal is below loaded",
    base.burdenLoaded > base.burden);
  A("burden is bounded by handled volume x marginal cost",
    base.burden <= base.handled * base.marg + 1e-6);
  A("the repeat-demand flag fires only above a 25% repeat share",
    compute({ ...B(), fcrRate: 95, contactsPerUnresolved: 1.2 }, "hiring").flags.every(f => !/resolution problem/.test(f.t)));
  A("a low FCR paired with shallow M is flagged as an understated burden",
    compute({ ...B(), fcrRate: 65, contactsPerUnresolved: 1.2 }, "hiring").flags.some(f => /understates the repeat burden/.test(f.t)));
  A("selecting no mechanism is flagged before any savings number is presented",
    compute(B(), "none").flags.some(f => /realizable savings are \$0/.test(f.t)));
  A("headcount reduction carries a change-risk flag",
    compute(B(), "headcount").flags.some(f => /highest change and CSAT risk/.test(f.t)));
}

/* ---- 10. Analyst read must quote the engine, not a parallel calculation ---- */
console.log("\n10. analyst read reconciliation");
{
  for (const mech of K) {
    const d = B(), r = compute(d, mech), out = buildAnalystRead(d, r, mech);
    A(`analyst read returns four paragraphs (${mech})`, out.length === 4);
    A(`analyst read quotes the engine's cost per contact (${mech})`, out[0].includes(money(r.loaded)));
    A(`analyst read quotes the engine's cost per resolution (${mech})`, out[0].includes(money(r.cprLoaded)));
    A(`analyst read quotes the engine's burden (${mech})`, out[1].includes(fmtK(r.burden)));
    A(`analyst read quotes the engine's released figure (${mech})`, out[2].includes(fmtK(r.dividend[1].released)));
    A(`analyst read quotes the engine's realizable figure (${mech})`, out[2].includes(fmtK(r.dividend[1].realizable)));
    A(`analyst read names the selected mechanism by its shared label (${mech})`, out[2].includes(MECH[mech].label));
    A(`analyst read calls the burden a ceiling, never a saving (${mech})`, /ceiling, not a savings figure/.test(out[1]));
  }
  const none = B();
  A("with no mechanism the analyst read says the realizable figure is $0",
    /that's \$0 because no capacity action is selected/.test(buildAnalystRead(none, compute(none, "none"), "none")[2]));
  A("the analyst read never claims released capacity is cash",
    /capacity released, not yet cash/.test(buildAnalystRead(none, compute(none, "hiring"), "hiring")[2]));
}

/* ---- 11. Formatter contract. Every printed figure passes through these. ---- */
console.log("\n11. formatters");
{
  A("money prints two decimals with a leading sign for negatives", money(-3.456) === "-$3.46");
  A("fmtK abbreviates millions", fmtK(2500000) === "$2.50M");
  A("fmtK abbreviates thousands", fmtK(59138) === "$59K");
  A("fmtK prints small figures in full", fmtK(742) === "$742");
  A("fmtK carries the sign for negatives", fmtK(-59138) === "-$59K");
  A("n() coerces junk to zero rather than NaN", n("abc") === 0 && n(undefined) === 0 && n(null) === 0);
  A("n() parses a numeric string", n("7.25") === 7.25);
}

/* ---- 12. Publish contract ---- */
console.log("\n12. publish contract");
{
  A("the tool publishes the FCR the engine RAN, not the FCR that was typed",
    /fcr: r\.fcrPct \/ 100/.test(SRC));
  A("the report signals print the FCR the engine ran",
    /fcr_rate: r\.fcrPct/.test(SRC));
  A("a corrected FCR is disclosed alongside the value that was entered",
    /fcr_rate_entered/.test(SRC));
  A("the report carries a corrected-inputs section",
    /Inputs Corrected Before Calculation/.test(SRC));
  A("the confidence gate reads externally sourced values only",
    /sourcedExternally\(\[/.test(SRC) && !/const sourced = \[/.test(SRC));
  A("the confidence gate no longer reads its own pulled map",
    !/filter\(k => pulled\[k\]\)/.test(SRC));
  A("externality is captured at mount, before this tool publishes",
    /setExtSourced\(sourcedExternally/.test(SRC));
  A("the prefill badge names its real source rather than assuming TCO",
    !/from your TCO run/.test(SRC));
  A("publishToolResult is called with the tool's own registered id",
    /publishToolResult\("cost-per-contact"/.test(SRC));
  A("the publish payload is normalized before it reaches the rail",
    /normalizeForPublish\(/.test(SRC));
  A("the tool declares its source tool on publish, so the rail can attribute it",
    /sourceTool: "cost-per-contact"/.test(SRC));
  A("ReportActions is wired", /<ReportActions/.test(SRC));
  A("the scenario contract carries the exact engine input set", /const scenario = \{ d, mech \}/.test(SRC));
}

/* ---- 12b. Credit-class doctrine. Shared with FCR Leakage and AI Deflection. ---- */
console.log("\n12b. credit-class ceiling");
{
  A("the engine reports the credit class mech.js assigns the selected action",
    K.every(k => compute(B(), k).cred === MECH[k].cred));
  A("the credit rank ladder matches the one in the sibling locked tools",
    /CRED_RANK = \{ none: 0, capacity: 1, finance: 2, cash: 3 \}/.test(SRC));
  A("cash-creditable actions ceiling at Finance-grade",
    K.filter(k => MECH[k].cred === "cash").every(k => compute(B(), k).ceilingGrade === "Finance-grade"));
  A("finance-creditable actions ceiling at Planning-grade, never Finance-grade",
    K.filter(k => MECH[k].cred === "finance").every(k => compute(B(), k).ceilingGrade === "Planning-grade"));
  A("capacity-only actions ceiling at Directional",
    K.filter(k => MECH[k].cred === "capacity").every(k => compute(B(), k).ceilingGrade === "Directional"));
  A("no capacity action ceilings at Directional", compute(B(), "none").ceilingGrade === "Directional");
  A("the ceiling never rises as the credit class falls",
    K.every((k, i) => i === 0 || compute(B(), k).credRank >= compute(B(), K[i - 1]).credRank));
  A("the component takes the LOWER of the evidence grade and the credit ceiling",
    /GRADE_RANK\[evidenceGrade\] <= GRADE_RANK\[r\.ceilingGrade\]/.test(SRC));
  A("selecting the default mechanism alone no longer earns Planning-grade",
    !/\(sourced \|\| mechSelected\)/.test(SRC));
  A("the evidence grade requires an external source or an explicit attestation",
    /evidenceGrade = \(sourced && d\.validated\)/.test(SRC));
  A("the rationale names the capacity action when the credit class is what bound the grade",
    /capped by capacity action/.test(SRC));
}

/* ---- 13. Typography migration ---- */
console.log("\n13. typography");
{
  A("no Instrument Serif remains", !/Instrument Serif/.test(SRC));
  A("no DM Sans remains", !/DM Sans/.test(SRC));
  A("no hand-written Google Fonts import remains", !/fonts\.googleapis\.com/.test(SRC));
  A("the shared font import is used", /FONT_IMPORT_CSS/.test(SRC));
  A("type tokens are imported from the single source of truth", /from "\.\/src\/lib\/type"/.test(SRC));
  A("the Archivo migration moved nothing inside the engine region",
    !/TYPE\.|FONT_IMPORT_CSS|fontFamily/.test(region));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
