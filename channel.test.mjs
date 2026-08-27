/* channel.test.mjs
 *
 * Slices the @engine-start..@engine-end region out of ChannelShiftModel.jsx and
 * tests the DEPLOYED engine. Nothing is reconstructed. MECH comes from the real
 * ./src/lib/mech.js and the palette from the real ./src/lib/benchmarks.js, so a
 * drift in either fails here rather than passing on invented constants. If the
 * marker region stops parsing, this fails loudly rather than silently falling
 * back to a copy that would drift from the shipped file.
 *
 * Run from repo root: node channel.test.mjs
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

/* ---- 0. shared mechanism contract ---- */
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
A("a zero-realization option exists, so 'none' can mean $0", Object.values(MECH).some(v => v.f === 0));
A("cred classes are drawn from the known taxonomy",
  Object.values(MECH).every(v => ["none", "capacity", "finance", "cash"].indexOf(v.cred) >= 0));

/* ---- 1. slice the shipped engine ---- */
console.log("\n1. engine slice");
const SRC = readFileSync("./ChannelShiftModel.jsx", "utf8");
const a = SRC.indexOf("/* @engine-start"), b = SRC.indexOf("/* @engine-end */");
if (a < 0 || b < 0) { console.error("BLOCKER: engine markers not found in ChannelShiftModel.jsx."); process.exit(1); }
const region = SRC.slice(a, b).replace(/^export /gm, "");

let compute, buildVerdict, buildAnalystRead, solveBreakEven, primaryTarget,
  BASE, DEFAULTS, CURVE, TARGETS, RISKS, CRED_RANK, RANK_GRADE, GRADE_RANK, money, fmtK, n, TOOL_ID, ROUTE;
try {
  ({ compute, buildVerdict, buildAnalystRead, solveBreakEven, primaryTarget,
    BASE, DEFAULTS, CURVE, TARGETS, RISKS, CRED_RANK, RANK_GRADE, GRADE_RANK, money, fmtK, n, TOOL_ID, ROUTE } = new Function(
    "MECH", "COLORS",
    region + "\nreturn { compute, buildVerdict, buildAnalystRead, solveBreakEven, primaryTarget, BASE, DEFAULTS, CURVE, TARGETS, RISKS, CRED_RANK, RANK_GRADE, GRADE_RANK, money, fmtK, n, TOOL_ID, ROUTE };"
  )(MECH, COLORS));
} catch (e) {
  console.error("BLOCKER: the engine region did not evaluate. The marker region has");
  console.error("picked up code it cannot parse, or lost a dependency it closes over.");
  console.error(String(e.message || e));
  process.exit(1);
}
A("engine region slices and evaluates", typeof compute === "function");
A("engine region carries the verdict builder", typeof buildVerdict === "function");
A("engine region carries the analyst-read builder", typeof buildAnalystRead === "function");
A("engine region carries the break-even solver", typeof solveBreakEven === "function");
A("engine region carries its own formatters", typeof money === "function" && typeof fmtK === "function" && typeof n === "function");
A("engine region carries the shipped default input set", !!BASE && typeof BASE.monthlyContacts === "number");
A("engine region carries the scenario contract", TOOL_ID === "channel-shift" && ROUTE === "/tools/channel-shift");
A("DEFAULTS points at BASE, so the scenario link and the tool share one origin", DEFAULTS.d === BASE);
A("the shipped default mechanism is not headcount reduction", DEFAULTS.mech !== "headcount");
A("the engine region does NOT reconstruct MECH", !/const\s+MECH\s*=/.test(region));
A("the engine region does NOT reconstruct COLORS", !/const\s+COLORS\s*=/.test(region));
A("the credit ladder is in the engine region, not the component", !!CRED_RANK && typeof RANK_GRADE === "function");

/* ---- 2. formatters ---- */
console.log("\n2. formatters");
A("n coerces garbage to 0", n("abc") === 0 && n(undefined) === 0 && n(null) === 0);
A("n parses numeric strings", n("12.5") === 12.5);
A("money signs negatives outside the symbol", money(-4.2) === "-$4.20");
A("money renders positives to two places", money(7) === "$7.00");
A("fmtK rounds sub-thousands whole", fmtK(842.4) === "$842");
A("fmtK renders thousands at K", fmtK(12400) === "$12K");
A("fmtK renders millions to two places", fmtK(2450000) === "$2.45M");
A("fmtK signs negatives outside the symbol", fmtK(-12400) === "-$12K");

/* ---- 3. baseline: the document most users see ---- */
console.log("\n3. baseline");
const R0 = compute(BASE, "hiring");
A("baseline voice volume is 70,000 of 100,000", near(R0.voiceVol, 70000));
A("baseline eligible pool is 42,000 (60% of voice)", near(R0.eligible, 42000));
A("baseline shifts 20,000 (20 pts of total), inside the eligible pool", near(R0.shifted, 20000) && !R0.scaled);
A("baseline displaces 11,350 voice contacts", near(R0.Dtot, 11350));
A("baseline bounces 5,000 back to voice", near(R0.Etot, 5000));
A("baseline voice AHT effective is 7.0 min", near(R0.baseEff, 7));
A("baseline net realizable is $2,135.99/mo", Math.abs(R0.netRealizable - 2135.99) < 0.005);
A("baseline produces no input corrections", R0.guards.length === 0 && R0.blocked === false);
A("baseline is not marked impossible or implausible", !R0.deptImpossible && !R0.deptImplausible);

/* ---- 4. the conservation invariant ---- */
/* Total voice minutes cannot change: shifting alters which calls remain, not how
   long any call takes. The residual uplift therefore FIXES the departing AHT.
   Setting both independently double-counts the same physical effect, which is the
   defect this engine was rebuilt to remove. */
console.log("\n4. voice-minute conservation");
{
  let ok = true, checked = 0;
  for (const curve of Object.keys(CURVE)) {
    for (const sh of [1, 5, 20, 40, 60]) {
      const d = { ...BASE, adverseCurve: curve, shiftToChat: sh, shiftToBot: 0, shiftToEmail: 0, eligibility: 100 };
      const r = compute(d, "hiring");
      const before = r.voiceVol * r.baseEff;
      const after = r.Dtot * r.deptEffRaw + (r.voiceVol - r.Dtot) * r.residualEff;
      if (!near(before, after, 1e-9)) ok = false;
      checked++;
    }
  }
  A(`total voice minutes are conserved across all ${checked} curve/shift combinations`, ok);
  A("a severe curve implies simpler departing calls than a mild one",
    compute({ ...BASE, adverseCurve: "severe" }, "hiring").deptEff <
    compute({ ...BASE, adverseCurve: "mild" }, "hiring").deptEff);
  A("a severe curve implies harder residual voice than a mild one",
    compute({ ...BASE, adverseCurve: "severe" }, "hiring").residualEff >
    compute({ ...BASE, adverseCurve: "mild" }, "hiring").residualEff);
  A("zero shift means zero residual uplift", compute({ ...BASE, shiftToChat: 0, shiftToBot: 0, shiftToEmail: 0 }, "hiring").residualUplift === 0);
  A("with no displacement the departing AHT falls back to the baseline",
    near(compute({ ...BASE, dispChat: 0, dispBot: 0, dispEmail: 0 }, "hiring").deptEffRaw, R0.baseEff));
}

/* ---- 5. guard and disclose ---- */
/* A scenario link decodes straight into compute with no field validation in
   between. Clamping alone is not a fix: a value the engine had to change is a
   value the report must disclose, or the document shows a number the engine
   never ran. Every case below must clamp AND record. */
console.log("\n5. guard and disclose");
const G = (ov) => compute({ ...BASE, ...ov }, "hiring");
const guarded = (r, label) => r.guards.some(g => g.label === label);
{
  const cases = [
    ["negative monthly contacts", { monthlyContacts: -100000 }, "Monthly contacts"],
    ["negative agent hourly", { hourlyRate: -18 }, "Agent hourly rate"],
    ["marginal overhead below 1x", { marginalOH: -1 }, "Marginal overhead"],
    ["loaded overhead below 1x", { loadedOH: 0 }, "Loaded overhead"],
    ["negative voice mix", { voicePct: -70 }, "Voice mix"],
    ["voice mix above 100", { voicePct: 150 }, "Voice mix"],
    ["negative eligibility", { eligibility: -20 }, "Eligible voice for shift"],
    ["eligibility above 100", { eligibility: 200 }, "Eligible voice for shift"],
    ["resolution above 100", { resChat: 150 }, "Chat resolution"],
    ["negative resolution", { resChat: -50 }, "Chat resolution"],
    ["displacement above 100", { dispChat: 300 }, "Chat displacement"],
    ["negative displacement", { dispChat: -100 }, "Chat displacement"],
    ["negative shift points", { shiftToChat: -10 }, "Chat shift"],
    ["shift points above 100", { shiftToChat: 500 }, "Chat shift"],
    ["negative voice AHT", { voiceAHT: -7 }, "Voice AHT"],
    ["voice concurrency below 1", { voiceConc: 0 }, "Voice concurrency"],
    ["chat concurrency below 1", { chatConc: 0 }, "Chat concurrency"],
    ["negative bot cost", { botCost: -5 }, "Bot cost per contact"],
    ["escalation return factor below 1x", { escReturnFactor: 0.2 }, "Escalation return factor"],
    ["negative training cost", { trainingPerAgent: -1500 }, "Training per agent"],
    ["negative ramp weeks", { rampWeeks: -4 }, "Ramp weeks"],
  ];
  for (const [nm, ov, label] of cases) {
    const r = G(ov);
    A(`${nm} is clamped and disclosed`, guarded(r, label) && r.blocked === true);
  }
  A("an unrecognised complexity curve falls back to moderate and discloses it",
    G({ adverseCurve: "zzz" }).curveKey === "moderate" && guarded(G({ adverseCurve: "zzz" }), "Residual complexity curve"));
  A("a recognised curve is not reported as corrected", !guarded(G({ adverseCurve: "severe" }), "Residual complexity curve"));
  A("a correction records both what was entered and what was used",
    G({ resChat: 150 }).guards.some(g => g.entered === 150 && g.used === 100));
  A("a legal input set records nothing", G({}).guards.length === 0);
}

/* ---- 6. impossible outputs are blocked, not printed ---- */
console.log("\n6. impossible outputs");
{
  const cases = { monthlyContacts: -100000, hourlyRate: -18, voicePct: -70, eligibility: -20, resChat: -50, dispChat: -100, shiftToChat: -10, voiceAHT: -7, voiceConc: 0, chatConc: 0, botCost: -5, trainingPerAgent: -1500, rampWeeks: -4, marginalOH: -1, adverseCurve: "zzz", resChat2: 150 };
  let ok = true, bad = [];
  for (const [k, v] of Object.entries(cases)) {
    const r = G(k === "resChat2" ? { resChat: 150 } : { [k]: v });
    const viol = [];
    if (r.voiceVol < 0) viol.push("voiceVol<0");
    if (r.eligible < 0) viol.push("eligible<0");
    if (r.shifted < 0) viol.push("shifted<0");
    if (r.Dtot < 0) viol.push("Dtot<0");
    if (r.Etot < 0) viol.push("Etot<0");
    if (r.Dtot > r.shifted + 1e-9) viol.push("Dtot>shifted");
    if (r.baseEff < 0) viol.push("baseEff<0");
    if (r.deptEff < 0) viol.push("deptEff<0");
    if (r.botFee < 0) viol.push("botFee<0");
    if (r.transition < 0) viol.push("transition<0");
    if (isFinite(r.payback) && r.payback < 0) viol.push("payback<0");
    if (!isFinite(r.netRealizable) || isNaN(r.netRealizable)) viol.push("net not finite");
    if (viol.length) { ok = false; bad.push(k + ": " + viol.join(",")); }
  }
  if (!ok) console.log("    violations:", bad.join(" | "));
  A("no hostile input produces a negative volume, a negative cost, or a negative payback", ok);
  A("displaced voice can never exceed volume shifted", G({ resChat: 100, dispChat: 100 }).Dtot <= G({ resChat: 100, dispChat: 100 }).shifted + 1e-9);
  A("bounced plus resolved equals shifted, per target",
    compute(BASE, "hiring").perTarget.every(t => near(t.E + t.R, t.S)));
  A("displaced plus incremental equals resolved, per target",
    compute(BASE, "hiring").perTarget.every(t => near(t.D + t.incremental, t.R)));
  A("a transition investment is never a rebate", G({ trainingPerAgent: -1500, rampWeeks: -4 }).transition >= 0);
  A("payback is Infinity, never negative, when the shift does not pay",
    G({ resChat: 0, resBot: 0, resEmail: 0 }).payback === Infinity);
}

/* ---- 7. eligibility ceiling ---- */
console.log("\n7. eligibility ceiling");
{
  const r = G({ shiftToChat: 40, shiftToBot: 20, shiftToEmail: 0 });
  A("a shift larger than the eligible pool is scaled, not run", r.scaled === true);
  A("a scaled shift lands exactly on the eligible pool", near(r.shifted, r.eligible));
  A("a shift inside the eligible pool is not scaled", compute(BASE, "hiring").scaled === false);
  A("zero eligibility moves nothing", near(G({ eligibility: 0 }).shifted, 0));
  A("zero voice mix leaves nothing to shift", near(G({ voicePct: 0 }).shifted, 0));
  A("scaling preserves the ratio between targets", (() => {
    const s = G({ shiftToChat: 40, shiftToBot: 20, shiftToEmail: 0 });
    const chat = s.perTarget.find(t => t.key === "Chat"), bot = s.perTarget.find(t => t.key === "Bot");
    return near(chat.S / bot.S, 2);
  })());
}

/* ---- 8. capacity action and the credit-class ceiling ---- */
/* Freed voice time is capacity, not cash. Channel Shift referenced MECH[].cred
   zero times before this rebuild, so a scenario set to absorb growth (25%
   realization, capacity only) could present a Finance-grade document. */
console.log("\n8. capacity action and credit class");
{
  A("no capacity action realizes exactly zero labor value", near(compute(BASE, "none").laborCash, 0));
  A("with no capacity action the only money left is the bot fee, as a cost",
    near(compute(BASE, "none").netRealizable, -compute(BASE, "none").botFee));
  A("realized labor rises monotonically with the mechanism ladder",
    MECH_ORDER.every((k, i) => i === 0 || compute(BASE, k).laborCash >= compute(BASE, MECH_ORDER[i - 1]).laborCash - 1e-9));
  A("bot platform fees are real cash and are never scaled by the mechanism",
    MECH_ORDER.every(k => near(compute(BASE, k).botFee, R0.botFee)));
  A("net agent-minutes freed do not depend on the mechanism",
    MECH_ORDER.every(k => near(compute(BASE, k).netMin, R0.netMin)));
  A("the credit ladder matches the one in mech.js", CRED_RANK.none === 0 && CRED_RANK.capacity === 1 && CRED_RANK.finance === 2 && CRED_RANK.cash === 3);
  A("no capacity action ceilings at Directional", compute(BASE, "none").ceilingGrade === "Directional");
  A("absorbing growth is capacity-only and ceilings at Directional", compute(BASE, "growth").ceilingGrade === "Directional");
  A("reducing overtime is finance-creditable and ceilings at Planning-grade", compute(BASE, "overtime").ceilingGrade === "Planning-grade");
  A("avoiding hiring is finance-creditable and ceilings at Planning-grade", compute(BASE, "hiring").ceilingGrade === "Planning-grade");
  A("vendor volume reduction is cash and can reach Finance-grade", compute(BASE, "vendor").ceilingGrade === "Finance-grade");
  A("headcount reduction is cash and can reach Finance-grade", compute(BASE, "headcount").ceilingGrade === "Finance-grade");
  A("the ceiling is derived from mech.js, not decided here",
    MECH_ORDER.every(k => compute(BASE, k).ceilingGrade === RANK_GRADE(CRED_RANK[MECH[k].cred])));
  A("the grade rank ladder is ordered", GRADE_RANK["Directional"] < GRADE_RANK["Planning-grade"] && GRADE_RANK["Planning-grade"] < GRADE_RANK["Finance-grade"]);
}

/* ---- 9. break-even ---- */
console.log("\n9. break-even");
{
  const pt = primaryTarget(R0);
  A("the primary target is the largest guarded shift", pt && pt.key === "Chat");
  A("a negative shift cannot become the primary target", (() => {
    const r = compute({ ...BASE, shiftToChat: -10, shiftToBot: 5, shiftToEmail: 0 }, "hiring");
    const p = primaryTarget(r);
    return p && p.key === "Bot";
  })());
  const be = solveBreakEven(BASE, "hiring", TARGETS.find(t => t.key === "Chat"));
  A("baseline chat break-even solves inside 0-100", be != null && be > 0 && be < 100);
  A("net realizable at the solved break-even is within a rounding step of zero",
    Math.abs(compute({ ...BASE, resChat: be }, "hiring").netRealizable) < 50);
  A("modelled resolution above break-even is net positive",
    compute({ ...BASE, resChat: Math.ceil(be) + 5 }, "hiring").netRealizable > 0);
  A("modelled resolution below break-even is net negative",
    compute({ ...BASE, resChat: Math.floor(be) - 5 }, "hiring").netRealizable < 0);
  A("net realizable is monotonically non-decreasing in chat resolution", (() => {
    let prev = -Infinity;
    for (let x = 0; x <= 100; x += 5) {
      const v = compute({ ...BASE, resChat: x }, "hiring").netRealizable;
      if (v < prev - 1e-6) return false;
      prev = v;
    }
    return true;
  })());
  A("break-even returns null when the shift never pays inside range",
    solveBreakEven({ ...BASE, botCost: 40 }, "hiring", TARGETS.find(t => t.key === "Bot")) === null);
}

/* ---- 10. single-driver dominance ---- */
/* Every input below must move the answer. An input that changes nothing is either
   dead or wired to the wrong term, and both read identically from the outside. */
console.log("\n10. single-driver dominance");
{
  const drivers = [
    ["monthlyContacts", 150000], ["hourlyRate", 30], ["marginalOH", 1.4], ["voicePct", 50],
    ["eligibility", 20], ["shiftToChat", 5], ["shiftToBot", 2], ["resChat", 60], ["resBot", 40],
    ["dispChat", 50], ["dispBot", 40], ["chatAHT", 20], ["chatConc", 1], ["voiceAHT", 12],
    ["botCost", 2], ["escReturnFactor", 1.5], ["adverseCurve", "severe"],
  ];
  for (const [k, v] of drivers) {
    A(`${k} moves net realizable`, !near(G({ [k]: v }).netRealizable, R0.netRealizable, 1e-6));
  }
  A("training cost moves transition but not net realizable",
    !near(G({ trainingPerAgent: 4000 }).transition, R0.transition) && near(G({ trainingPerAgent: 4000 }).netRealizable, R0.netRealizable));
  A("ramp weeks move transition but not net realizable",
    !near(G({ rampWeeks: 10 }).transition, R0.transition) && near(G({ rampWeeks: 10 }).netRealizable, R0.netRealizable));
  A("loaded overhead moves ramp cost but not net realizable",
    !near(G({ loadedOH: 1.9 }).ramp, R0.ramp) && near(G({ loadedOH: 1.9 }).netRealizable, R0.netRealizable));
  A("bot cost is the only channel cost that touches the bot lane",
    near(G({ chatAHT: 20 }).botFee, R0.botFee) && !near(G({ botCost: 2 }).botFee, R0.botFee));
  A("email inputs are inert when no email shift is modelled",
    near(G({ emailAHT: 30 }).netRealizable, R0.netRealizable));
  A("email inputs bite once an email shift exists",
    !near(compute({ ...BASE, shiftToEmail: 5, emailAHT: 30 }, "hiring").netRealizable,
      compute({ ...BASE, shiftToEmail: 5 }, "hiring").netRealizable));
}

/* ---- 11. directional sanity ---- */
console.log("\n11. directional sanity");
A("higher resolution improves the case", G({ resChat: 95 }).netRealizable > R0.netRealizable);
A("higher displacement improves the case", G({ dispChat: 95 }).netRealizable > R0.netRealizable);
A("a more expensive bot worsens the case", G({ botCost: 2 }).netRealizable < R0.netRealizable);
A("a harsher return factor worsens the case", G({ escReturnFactor: 1.8 }).netRealizable < R0.netRealizable);
A("a severe complexity curve reduces freed minutes", G({ adverseCurve: "severe" }).netMin < R0.netMin);
A("chat concurrency improves the case, because the target channel absorbs more per agent",
  G({ chatConc: 4 }).netRealizable > R0.netRealizable);
A("a longer chat AHT worsens the case", G({ chatAHT: 20 }).netRealizable < R0.netRealizable);
/* A bounced contact was always going to be a voice call, so only the EXTRA
   friction of the re-contact is new cost. At a return factor of exactly 1.0
   there is no extra friction, and the recovery term must vanish entirely. */
A("a return factor of exactly 1.0 charges no recovery friction", (() => {
  const one = compute({ ...BASE, escReturnFactor: 1 }, "hiring");
  const targetMin = one.perTarget.filter(t => !t.bot).reduce((acc, t) => acc + (t.D + t.E) * (t.key === "Chat" ? BASE.chatAHT / BASE.chatConc : BASE.emailAHT / BASE.emailConc), 0);
  return near(one.netMin, one.Dtot * one.deptEff - targetMin);
})());
A("a harsher return factor charges strictly more recovery friction",
  G({ escReturnFactor: 1.8 }).netMin < G({ escReturnFactor: 1.2 }).netMin);
A("FTE freed and net minutes always share a sign", (R0.netMin >= 0) === (R0.fteFreed >= 0));
A("gross is never below net realizable while the mechanism is below full",
  compute(BASE, "growth").gross >= compute(BASE, "growth").netRealizable - 1e-9);

/* ---- 12. verdict and analyst read ---- */
console.log("\n12. verdict and analyst read");
{
  const v0 = buildVerdict(BASE, R0, "hiring");
  A("a net-positive unflagged baseline approves", v0.label === "Approve");
  A("the verdict carries the break-even it names", typeof v0.be === "number");
  A("the verdict reports the modelled resolution as a guarded number", v0.curRes === BASE.resChat);
  const neg = { ...BASE, resChat: 20, resBot: 10 };
  A("a net-negative case refuses approval", buildVerdict(neg, compute(neg, "hiring"), "hiring").label === "Do not approve yet");
  const risky = { ...BASE, riskRegulated: true };
  A("flagged risk volume downgrades approval to pilot-only",
    buildVerdict(risky, compute(risky, "hiring"), "hiring").label === "Approve only with pilot");
  const nothing = { ...BASE, shiftToChat: 0, shiftToBot: 0, shiftToEmail: 0 };
  A("no shift modelled returns the no-shift verdict",
    buildVerdict(nothing, compute(nothing, "hiring"), "hiring").label === "No shift modeled");
  A("every RISKS key exists in the default input set", RISKS.every(x => x.k in BASE));

  const an = buildAnalystRead(BASE, R0, "hiring", v0);
  A("the analyst read returns prose, not a verdict object", Array.isArray(an) && an.length >= 3);
  A("the analyst read names the displaced count, not the headline shift", an[0].includes(Math.round(R0.Dtot).toLocaleString()));
  A("the analyst read quotes the guarded eligibility", an[0].includes(String(R0.eligPct)));
  A("the analyst read quotes the net, not the gross", an[1].includes(fmtK(R0.netRealizable)));
  A("the analyst read names the capacity action", an.some(t => t.includes(MECH.hiring.label)));
  A("the analyst read discloses the departing-AHT assumption it rests on", an.some(t => t.includes(R0.deptEff.toFixed(1))));
  A("with no capacity action the analyst read does not print a realization percentage",
    !buildAnalystRead(BASE, compute(BASE, "none"), "none", buildVerdict(BASE, compute(BASE, "none"), "none")).some(t => /\(0%\)/.test(t)));
  A("the analyst read never contains an em-dash", an.every(t => t.indexOf(String.fromCharCode(0x2014)) < 0));
  A("a corrected input set still produces a complete analyst read",
    buildAnalystRead({ ...BASE, resChat: 150 }, G({ resChat: 150 }), "hiring", buildVerdict({ ...BASE, resChat: 150 }, G({ resChat: 150 }), "hiring")).length >= 3);
}

/* ---- 13. cross-tool rail contract ---- */
console.log("\n13. rail contract");
{
  A("the tool pulls with getPrimitiveWithSource, not getPrimitive", /getPrimitiveWithSource\(/.test(SRC) && !/[^h]getPrimitive\(/.test(SRC));
  A("externality is tested with sourcedExternally against this tool's own id", /sourcedExternally\(\[[^\]]*\], TOOL_ID\)/.test(SRC));
  A("externality is captured at mount, before this tool publishes", /setExtSourced\(sourcedExternally/.test(SRC));
  A("pull keys stay as string literals, so the static rail audit can see them",
    /getPrimitiveWithSource\("monthlyContacts"\)/.test(SRC) && /getPrimitiveWithSource\("agentHourly"\)/.test(SRC));
  A("bot resolution is pulled as botResolutionRate, a share of ROUTED volume",
    /getPrimitiveWithSource\("botResolutionRate"\)/.test(SRC));
  A("the total-demand deflection rate is never pulled into a resolution field",
    !/getPrimitiveWithSource\("realisticDeflectionRate"\)/.test(SRC));
  A("the publish payload is normalized at the door", /normalizeForPublish\(/.test(SRC));
  A("the publish payload stamps its own source tool", /sourceTool: "channel-shift"/.test(SRC));
}

/* ---- 14. two-ceiling confidence, as wired in the component ---- */
console.log("\n14. two-ceiling confidence");
{
  A("the evidence grade requires an external source or an explicit attestation",
    /evidenceGrade = \(sourced && d\.validated\)/.test(SRC));
  A("selecting the default mechanism alone no longer earns a grade", !/\(sourced \|\| mechSelected\)/.test(SRC));
  A("the report takes the lower of evidence and credit class", /GRADE_RANK\[evidenceGrade\] <= GRADE_RANK\[r\.ceilingGrade\]/.test(SRC));
  A("the rationale names the capacity action when the credit class is what bound the grade", /capped by capacity action/.test(SRC));
  A("the grade rationale is displayed on the page, not only in the PDF", /\{gradeWhy\}/.test(SRC));
  A("corrected inputs are counted in the signals payload", /inputs_corrected: r\.guards\.length/.test(SRC));
  A("corrections are printed ahead of the analyst read", SRC.indexOf("Inputs Corrected Before Calculation") < SRC.indexOf('{ title: "Analyst Read"'));
  A("corrections are repeated in the methodology", /INPUTS CORRECTED/.test(SRC));
}

/* ---- 15. typography migration ---- */
console.log("\n15. typography");
{
  A("no Instrument Serif remains", !/Instrument Serif/.test(SRC));
  A("no DM Sans remains", !/DM Sans/.test(SRC));
  A("no hand-written Google Fonts import remains", !/fonts\.googleapis\.com/.test(SRC));
  A("the shared font import is used", /FONT_IMPORT_CSS/.test(SRC));
  A("type tokens are imported from the single source of truth", /from "\.\/src\/lib\/type"/.test(SRC));
  A("the Archivo migration moved nothing inside the engine region",
    !/TYPE\.|FONT_IMPORT_CSS|fontFamily/.test(region));
  A("the shared hardened input is used, not a local copy", /from "\.\/src\/lib\/NumField"/.test(SRC) && !/^function NumField/m.test(SRC));
  A("no em-dash anywhere in the file", SRC.indexOf(String.fromCharCode(0x2014)) < 0);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
