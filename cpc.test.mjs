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
let MECHMOD;
let MECH, MECH_ORDER, MECH_FALLBACK, MECH_INITIAL, COLORS, createGuards, guardVal, guardLine;
let benchmark, benchmarksForTool, BENCHMARK_SOURCES, CONF;
try {
  MECHMOD = await import("./src/lib/mech.js");
  const m = MECHMOD;
  ({ MECH, MECH_ORDER, MECH_FALLBACK, MECH_INITIAL } = m);
  ({ COLORS, benchmark, benchmarksForTool, BENCHMARK_SOURCES } = await import("./src/lib/benchmarks.js"));
  CONF = await import("./src/lib/confidence.js");
  ({ createGuards, guardVal, guardLine } = await import("./src/lib/guards.js"));
} catch (e) {
  console.error("BLOCKER: could not import ./src/lib/mech.js, ./src/lib/benchmarks.js or ./src/lib/guards.js.");
  console.error("The engine cannot be verified against reconstructed constants. Run from the repo root.");
  console.error(String(e.message || e));
  process.exit(1);
}

let pass = 0, fail = 0;
const A = (nm, c) => { if (c) pass++; else { fail++; console.log("  FAIL:", nm); } };
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(a), Math.abs(b));

/* ---- 0. Validate the shared mechanism module before trusting anything downstream ---- */
console.log("\n0. shared mechanism contract");
A("mech.js exports MECH, MECH_ORDER and both named mech constants",
  !!MECH && Array.isArray(MECH_ORDER) && typeof MECH_FALLBACK === "string" && typeof MECH_INITIAL === "string");
A("both mech constants are keys in MECH", !!MECH[MECH_FALLBACK] && !!MECH[MECH_INITIAL]);
A("the resolver fallback realizes zero and credits nothing", MECH[MECH_FALLBACK].f === 0 && MECH[MECH_FALLBACK].cred === "none");
A("the ambiguous MECH_DEFAULT name is retired from mech.js", !("MECH_DEFAULT" in MECHMOD));
A("no mech constant is headcount reduction", MECH_FALLBACK !== "headcount" && MECH_INITIAL !== "headcount");
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

let compute, buildAnalystRead, BASE, DEFAULTS, money, fmtK, n, gradeCPC, fieldOrigin, DIV_STEPS, QUOTED_STEP, VBENCH, TOOL_ID;
try {
  ({ compute, buildAnalystRead, BASE, DEFAULTS, money, fmtK, n, gradeCPC, fieldOrigin, DIV_STEPS, QUOTED_STEP, VBENCH, TOOL_ID } = new Function(
    "MECH", "MECH_INITIAL", "ELECTRIC", "GREEN", "AMBER", "createGuards", "guardVal", "guardLine", "benchmark",
    "emitGrades", "voidResult", "isVoid", "railEvidence", "weakerStream", "realizationFromCred",
    region + "\nreturn { compute, buildAnalystRead, BASE, DEFAULTS, money, fmtK, n, gradeCPC, fieldOrigin, DIV_STEPS, QUOTED_STEP, VBENCH, TOOL_ID };"
  )(MECH, MECH_INITIAL, COLORS.electric, COLORS.green, COLORS.amber, createGuards, guardVal, guardLine, benchmark,
    CONF.emitGrades, CONF.voidResult, CONF.isVoid, CONF.railEvidence, CONF.weakerStream, CONF.realizationFromCred));
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
A("DEFAULTS.mech is mech.js MECH_INITIAL, never a literal in this file (1-08b residue)",
  DEFAULTS.mech === MECH_INITIAL && /const DEFAULTS = \{ d: BASE, mech: MECH_INITIAL \};/.test(SRC) && !/mech: "hiring"/.test(SRC));
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

  /* The capacity action indexed MECH raw. An unknown key threw on .f, and a
     prototype name computed NaN with zero corrections. Every hostile key must
     resolve to none, realize $0, and disclose exactly one correction. none, never
     the hiring default: a broken link must not credit a realization nobody chose. */
  {
    const M = (k, over) => compute({ ...B(), ...(over || {}) }, k);
    const NONE = M("none");
    const shape = (r) => JSON.stringify({ ...r, guards: r.guards.map(g => ({ ...g, entered: g.label === "Capacity action" ? "<KEY>" : g.entered })),
      flags: r.flags.map(f => ({ ...f, t: f.t.replace(/^Capacity action: you entered [\s\S]*?, which/, "Capacity action: you entered <KEY>, which") })) });
    const bare = (r) => JSON.stringify({ ...r, guards: [], blocked: false, flags: r.flags.filter(f => f.t.indexOf("Capacity action: you entered") !== 0) });
    /* An unguarded engine throws on the first unknown key. Fail as an assertion
       rather than crash, so the rest of the harness still reports. */
    let Z = null;
    try { Z = M("zzz"); } catch (e) { Z = null; }
    A("an unknown capacity action computes without throwing", Z !== null);
    A("the capacity action flag is the shipped guard sentence, so shape() replaces something",
      Z !== null && Z.flags.filter(f => f.t.indexOf("Capacity action: you entered zzz, which") === 0).length === 1);
    if (Z !== null) for (const k of K) {
      const r = M(k);
      A(`capacity action ${k} runs as entered with no correction`, r.mechKey === k && r.guards.length === 0);
    }
    const hostile = ["bogus", "", "HIRING", " hiring", undefined, ...Object.getOwnPropertyNames(Object.prototype)];
    if (Z !== null) for (const k of hostile) {
      const tag = JSON.stringify(k === undefined ? "undefined" : k);
      let r, a, threw = null;
      try { r = M(k); a = buildAnalystRead(B(), r, k); } catch (e) { threw = e; }
      A(`capacity action ${tag} computes without throwing`, threw === null);
      if (threw) continue;
      const cg = r.guards.filter(g => g.label === "Capacity action");
      A(`capacity action ${tag} resolves to none with one disclosed correction`,
        r.mechKey === "none" && cg.length === 1 && cg[0].entered === String(k) && cg[0].used === "none" && r.guards.length === 1 && r.blocked === true);
      A(`capacity action ${tag} realizes $0 and stays finite`,
        r.mf === 0 && r.dividend.every(s => s.realizable === 0 && Number.isFinite(s.released)));
      A(`capacity action ${tag} carries the none credit class and a Directional realization`, r.cred === "none" && CONF.realizationFromCred(r.cred) === "Directional");
      A(`capacity action ${tag} raises the no-action warning`, r.flags.some(f => /No capacity action selected/.test(f.t)));
      A(`capacity action ${tag} matches an unknown key apart from the entered text`, shape(r) === shape(Z));
      A(`capacity action ${tag} runs the same arithmetic as none`, bare(r) === bare(NONE));
      A(`capacity action ${tag} writes the same analyst read as none`, JSON.stringify(a) === JSON.stringify(buildAnalystRead(B(), NONE, "none")));
    }
    if (Z !== null) {
      A("a hostile key never inherits the shipped hiring default", M("bogus").mechKey !== DEFAULTS.mech);
      A("the analyst read follows the resolved key, not the argument it is handed",
        JSON.stringify(buildAnalystRead(B(), M("hiring"), "toString")) === JSON.stringify(buildAnalystRead(B(), M("hiring"), "hiring")));
      A("a hostile action between hostile inputs discloses in engine order",
        JSON.stringify(M("toString", { fcrRate: 150, monthlyContacts: -1 }).guards.map(g => g.label)) === JSON.stringify(["First contact resolution", "Capacity action", "Monthly handled contacts"]));
    }
  }
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
  A("the confidence gate no longer reads its own pulled map",
    !/filter\(k => pulled\[k\]\)/.test(SRC));
  A("every prefilled value is recorded with the tool that wrote it",
    /seen\[field\] = \{ value: next\[field\], src: res\.sourceTool \|\| "" \};/.test(SRC));
  A("the prefill record is captured at mount, before this tool publishes", /setPre\(seen\);/.test(SRC));
  A("the component grades through gradeCPC with the mount record and no origin grade",
    /const graded = gradeCPC\(\{ d, r, pre, railOrigin: null \}\);/.test(SRC));
  A("the rail publishes the headline the grading layer computed", /grade: confidence, analystRead/.test(SRC));
  A("the prefill badge names its real source rather than assuming TCO",
    !/from your TCO run/.test(SRC));
  A("publishToolResult is called with the tool's own registered id",
    /publishToolResult\("cost-per-contact"/.test(SRC));
  A("the publish payload is normalized before it reaches the rail",
    /normalizeForPublish\(/.test(SRC));
  A("the tool declares its source tool on publish, so the rail can attribute it",
    /sourceTool: "cost-per-contact"/.test(SRC));
  A("ReportActions is wired", /<ReportActions/.test(SRC));
  /* Source gates pin pick in the destructure. Channel Shift's gate is the same
     line; a destructure that drops pick would leave the resolution below unbound. */
  A("the engine builds its guard list through createGuards with pick", /const \{ guards, guard, pick \} = createGuards\(\);/.test(SRC));
  A("the capacity action resolves through the shared own-key pick with a none fallback",
    /const mechKey = pick\("Capacity action", mechIn, MECH, "none"\);/.test(region));
  A("compute takes the entered action under a name that cannot index MECH by accident",
    /function compute\(d, mechIn\)/.test(region) && !/MECH\[mechIn\]/.test(SRC));
  A("compute returns the resolved capacity action on r", /mechKey, cred: MECH\[mechKey\]\.cred/.test(region));
  A("the analyst read names the resolved key",
    /MECH\[r\.mechKey\]\.label/.test(region) && !/[^.]\bmechKey\b/.test(region.slice(region.indexOf("{", region.indexOf("function buildAnalystRead")))));
  A("no MECH lookup on the entered capacity action remains in the component", !/MECH\[mech\]/.test(SRC));
  A("the scenario contract carries the exact engine input set", /const scenario = \{ d, mech \}/.test(SRC));
}

/* ---- 12b. Credit-class doctrine. Realization reads mech.js and nothing else. ---- */
console.log("\n12b. realization from credit class");
{
  A("the engine reports the credit class mech.js assigns the selected action",
    K.every(k => compute(B(), k).cred === MECH[k].cred));
  A("no local credit ladder remains", !/CRED_RANK|RANK_GRADE|ceilingGrade|credRank/.test(SRC));
  A("realization is read through realizationFromCred", /const realization = realizationFromCred\(r\.cred\);/.test(region));
  for (const k of K) {
    const g = gradeCPC({ d: B(), r: compute(B(), k), pre: {}, railOrigin: null });
    A(`${k}: realization equals the credit class grade`, g.realization === CONF.realizationFromCred(MECH[k].cred));
    A(`${k}: the headline never exceeds realization`, CONF.GRADE_RANK[g.confidence] <= CONF.GRADE_RANK[g.realization]);
  }
}

/* ---- 14. 11B. Registry, emission, defect classes 2 and 3, decisions C to E ---- */
console.log("\n14. 11B grading layer and registry");
{
  const TOOL = "cost-per-contact";
  const ids = [...SRC.matchAll(/benchmark\("([^"]+)"\)/g)].map(m => m[1]);
  const vk = [...SRC.matchAll(/vert\("(\w+)", "/g)].map(m => m[1]);
  const vf = [...SRC.matchAll(/benchmark\(`cpc\.vert\.\$\{k\}\.(\w+)`\)/g)].map(m => m[1]);
  const owned = benchmarksForTool(TOOL).map(e => e.id);
  const readIds = new Set([...ids, ...vk.flatMap(k => vf.map(f => `cpc.vert.${k}.${f}`))]);
  A("the tool reads its benchmarks from the registry", ids.length >= 25);
  A("every id the tool reads is registered", ids.every(id => id in BENCHMARK_SOURCES));
  A("every id the tool reads belongs to this tool", ids.every(id => BENCHMARK_SOURCES[id].tool === TOOL));
  A("the vertical ranges read every field by template", ["cpcLow", "cpcHigh", "cprLow", "cprHigh", "fcr"].every(f => vf.includes(f)) && vk.length === 3);
  A("every registered entry for this tool is read", owned.every(id => readIds.has(id)));
  A("the registry holds 44 entries for this tool", owned.length === 44);
  A("no default ships a bare number", !/:\s*\d/.test(SRC.slice(SRC.indexOf("const BASE = {"), SRC.indexOf("};", SRC.indexOf("const BASE = {")))));
  A("no derivation, fallback, floor or threshold ships bare",
    !/loaded \* 0\.6|\? 5\.5 :|Math\.max\(0\.1|repeatShare > 0\.25|fcr < 0\.70|Mu < 1\.3|fcrPct < 78|gapPct > 40|gapPct > 20|used: 140|: 140;/.test(SRC));
  A("no dividend step ships bare", !/\[5, 10, 15\]|x\.p === 10|FCR \+10pts|\+10 FCR/.test(SRC));
  A("decision C: the default wage is the BLS May 2024 market median, this tool's own entry",
    BASE.agentHourly === 20.59 && BENCHMARK_SOURCES["cpc.wage.median"].kind === "market"
    && /May 2024/.test(BENCHMARK_SOURCES["cpc.wage.median"].source) && /43-4051/.test(BENCHMARK_SOURCES["cpc.wage.median"].source));
  A("every heuristic is labelled as one", benchmarksForTool(TOOL).filter(e => e.kind === "heuristic").every(e => /heuristic/i.test(e.source)));
  A("every threshold states a rationale", benchmarksForTool(TOOL).filter(e => e.kind === "threshold").every(e => e.rationale.length > 40));
  A("the vertical ranges are labelled internal planning heuristics on the page",
    /internal planning heuristics, not published benchmarks/.test(SRC) && !/validated 2026/.test(SRC));
  A("the vertical ranges print the registry values",
    VBENCH[0].cpc === `$${benchmark("cpc.vert.fin.cpcLow")} to $${benchmark("cpc.vert.fin.cpcHigh")}` && VBENCH[2].fcr === `${benchmark("cpc.vert.retail.fcr")}%`);
  A("the dividend prices the registry steps, in order", JSON.stringify(compute(B(), "hiring").dividend.map(x => x.p)) === JSON.stringify(DIV_STEPS) && QUOTED_STEP === DIV_STEPS[1]);

  A("the engine calls emitGrades", /emitGrades\(\{/.test(region));
  A("the engine voids through voidResult", /voidResult\(\{/.test(region));
  A("the engine never grades a voided result", /const confidence = voided \? "Void"/.test(region));
  A("the component passes the emitted object to ReportActions", /grades=\{gradeObj\}/.test(SRC) && !/confidence=\{grade\}/.test(SRC));

  const G = (o = {}, mech = "hiring", pre = {}, railOrigin = null) => { const d = { ...B(), ...o }; return gradeCPC({ d, r: compute(d, mech), pre, railOrigin }); };
  const OWN = { monthlyContacts: 41000, fcrRate: 68, contactsPerUnresolved: 2.7, loadedCPC: 8.1, marginalCPC: 4.6, validated: true };

  const def = G();
  A("an untouched tool grades Directional, bound by evidence", def.confidence === "Directional" && def.gradeObj.boundAxes.includes("evidence") && def.evidence === "Directional");
  A("the untouched rationale names every default driver", ["contact volume", "fcr", "m ", "loaded cost", "marginal cost"].every(x => def.gradeObj.reasons.evidence.toLowerCase().includes(x)));
  A("all own figures, attested, with a finance-credited action grade Planning-grade", G(OWN).confidence === "Planning-grade" && G(OWN).evidence === "Planning-grade");

  /* Defect class 2. */
  const railCost = { loadedCPC: { value: OWN.loadedCPC, src: "tco-calculator" } };
  const r2 = G(OWN, "vendor", railCost);
  A("class 2: a rail cost basis with no origin grade grades Directional", r2.costGrade === "Directional" && r2.confidence === "Directional");
  A("class 2: the rationale says the rail value carried no origin grade", /no recorded origin grade/.test(r2.gradeObj.reasons.evidence));
  A("class 2: a rail FCR with no origin grade grades the operating stream Directional",
    G(OWN, "vendor", { fcrRate: { value: OWN.fcrRate, src: "fcr-leakage" } }).opsGrade === "Directional");
  A("class 2: an origin grade lifts a rail value only to the rail cap",
    G(OWN, "vendor", railCost, "Finance-grade").costGrade === "Planning-grade" && G(OWN, "vendor", railCost, "Directional").costGrade === "Directional");
  A("class 2: a rail value the user then changed is the user's own",
    G({ ...OWN, loadedCPC: 9.3 }, "vendor", railCost).costGrade === "Planning-grade");
  A("self-credentialing: a value restored from this tool's own last run grades Directional",
    G(OWN, "vendor", { marginalCPC: { value: OWN.marginalCPC, src: TOOL_ID } }).costGrade === "Directional"
    && fieldOrigin({ ...B(), ...OWN }, { marginalCPC: { value: OWN.marginalCPC, src: TOOL_ID } }, "marginalCPC") === "self");
  A("a derived marginal grades cost evidence Directional", G({ ...OWN, marginalCPC: 0 }).costGrade === "Directional");

  /* Decision D. */
  A("D: own FCR and M without attestation grade the operating stream Directional", G({ ...OWN, validated: false }).opsGrade === "Directional");
  A("D: attestation over a default FCR does nothing", G({ ...OWN, fcrRate: BASE.fcrRate }).opsGrade === "Directional");
  A("D: attestation over a default M does nothing", G({ ...OWN, contactsPerUnresolved: BASE.contactsPerUnresolved }).opsGrade === "Directional");
  A("D: own volume, FCR and M, attested, stand at Planning-grade", G(OWN).opsGrade === "Planning-grade");

  /* Defect class 3. Each disclosed model failure reaches completeness. */
  const blockers = {
    "a corrected input": { ...OWN, fcrRate: 150 },
    "marginal at or above loaded": { ...OWN, marginalCPC: 9 },
    "a mix off 100 percent": { ...OWN, emailPct: 5 },
    "the handle time fallback": { ...OWN, voiceAHT: 0, chatAHT: 0, emailAHT: 0 },
    "low FCR with shallow M": { ...OWN, fcrRate: 65, contactsPerUnresolved: 1.2 },
    "no handled volume": { ...OWN, monthlyContacts: 0 },
    "a concurrency below one": { ...OWN, chatConcurrency: 0 },
  };
  for (const [nm, o] of Object.entries(blockers)) {
    const g = G(o, "vendor");
    A(`class 3: ${nm} holds completeness Directional`, g.completeness === "Directional" && g.confidence === "Directional" && g.blockers.length > 0);
    A(`class 3: ${nm} is named in the completeness rationale`, g.gradeObj.reasons.completeness.length > 20 && g.gradeObj.boundAxes.includes("completeness"));
  }
  A("class 3: a whole model grades completeness Finance-grade", G(OWN, "vendor").completeness === "Finance-grade" && G(OWN, "vendor").blockers.length === 0);

  /* Decision E. */
  const c0 = compute({ ...B(), chatConcurrency: 0 }, "hiring"), c1 = compute({ ...B(), chatConcurrency: 1 }, "hiring");
  A("E: a concurrency of zero is corrected to one and disclosed", c0.guards.some(g => g.label === "Chat concurrency" && g.entered === 0 && g.used === 1) && c0.channels[1].conc === 1);
  A("E: the corrected run computes exactly the run at one", c0.fteBurden === c1.fteBurden && c0.blendedHandle === c1.blendedHandle);
  A("E: a negative concurrency is corrected the same way", compute({ ...B(), voiceConcurrency: -3 }, "hiring").guards.some(g => g.label === "Voice concurrency" && g.used === 1));
  A("E: the shipped concurrencies raise no correction", compute(B(), "hiring").guards.length === 0);

  /* Sweep. No Finance-grade anywhere, no void reachable, no silent axis. */
  let fin = 0, voids = 0, silent = 0, notMin = 0, defects = 0;
  const pres = [{}, railCost, { fcrRate: { value: OWN.fcrRate, src: TOOL_ID } }];
  for (let i = 0; i < 6000; i++) {
    const o = {
      monthlyContacts: [0, 1, 50000, 1e7, -5, "x"][i % 6] === 50000 ? Math.round(Math.random() * 900000) : [0, 1, 50000, 1e7, -5, "x"][i % 6],
      fcrRate: [Math.random() * 100, 150, -20, 0, 100][i % 5], contactsPerUnresolved: [1 + Math.random() * 5, 0.2, 1e6][i % 3],
      loadedCPC: [Math.random() * 30, -4, 0][i % 3], marginalCPC: [Math.random() * 20, 0, -1, 99][i % 4],
      chatConcurrency: [2.5, 0, -1][i % 3], voicePct: [60, 0, 100][i % 3], validated: i % 2 === 0,
      denominator: i % 2 ? "issues" : "handled",
    };
    const g = G(o, K[i % K.length], pres[i % 3], [null, "Finance-grade", "Planning-grade"][i % 3]);
    if (g.confidence === "Finance-grade") fin++;
    if (g.voided) voids++;
    if (!g.voided && g.gradeObj.applicable.some(a => !g.gradeObj.reasons[a].trim())) silent++;
    if (!g.voided && g.confidence !== CONF.gradeConfidence({ evidence: g.evidence, realization: g.realization, completeness: g.completeness }).headline) notMin++;
    if (!g.voided && g.gradeObj.defects.length) defects++;
  }
  A("sweep: no input set reaches Finance-grade without document attestation", fin === 0);
  A("sweep: every invariant is unreachable through the guards", voids === 0);
  A("sweep: every applicable axis carries a stated reason", silent === 0);
  A("sweep: the headline is the minimum of the applicable axes", notMin === 0);
  A("sweep: emitGrades reports no content defect", defects === 0);

  const bad = { ...compute(B(), "hiring") }; bad.burden = NaN;
  const vg = gradeCPC({ d: B(), r: bad, pre: {}, railOrigin: null });
  A("a failed invariant voids the export and claims no grade", vg.voided && vg.confidence === "Void" && CONF.isVoid(vg.gradeObj) && vg.gradeObj.headline === null);
  const over = { ...compute(B(), "hiring") }; over.dividend = over.dividend.map(x => ({ ...x, realizable: x.released * 2 + 1 }));
  A("realizable above released voids the export", gradeCPC({ d: B(), r: over, pre: {}, railOrigin: null }).voided);
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
