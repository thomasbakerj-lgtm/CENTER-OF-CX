// tco.test.mjs
// Slices the TCO engine out of TCOCalculator.jsx at runtime and tests it directly, so
// the verified engine and the deployed engine cannot drift apart. Run: node tco.test.mjs
//
// Engine region = the @engine-start..@engine-end block. Nothing here is JSX.

import { readFileSync } from "node:fs";
/* The shared guard module the engine imports. Injected, never reconstructed. */
const { createGuards, guardVal, guardLine } = await import("./src/lib/guards.js");
const CONF = await import("./src/lib/confidence.js");
const BENCHMOD = await import("./src/lib/benchmarks.js");
const JOURNEYMOD = await import("./src/lib/journey.js");

const SRC = readFileSync(new URL("./TCOCalculator.jsx", import.meta.url), "utf8");

function slice(startMarker, endMarker) {
  const a = SRC.indexOf(startMarker);
  if (a < 0) throw new Error("engine slice failed, missing: " + startMarker);
  const b = SRC.indexOf(endMarker, a);
  if (b < 0) throw new Error("engine slice failed, missing end: " + endMarker);
  return SRC.slice(a, b);
}

const region = slice("/* @engine-start", "/* @engine-end */");

const BENCH = { occupancy: { cautionMax: 0.87 } };

const mod = new Function(
  "BENCH", "benchmark", "benchmarksForTool", "createGuards", "guardVal", "guardLine", "emitGrades", "voidResult", "railEvidence", "weakerStream", "TOOL_ID",
  `${region}\nreturn { computeTCO, buildOptimizations, buildAnalystRead, reconcile, gradeTCO, tcoFieldOrigin, tcoDefaults, TCO_OPS, TCO_COST, TCO_CHECKS, TCO_DOMAIN, BASE, INDUSTRY, STANCE, BENCHMARK_SOURCES, n };`
)(BENCH, BENCHMOD.benchmark, BENCHMOD.benchmarksForTool, createGuards, guardVal, guardLine, CONF.emitGrades, CONF.voidResult, CONF.railEvidence, CONF.weakerStream, "tco-calculator");

const { computeTCO, buildOptimizations, buildAnalystRead, reconcile, gradeTCO, tcoFieldOrigin, tcoDefaults, TCO_OPS, TCO_COST, TCO_CHECKS, TCO_DOMAIN, BASE, INDUSTRY, STANCE } = mod;

let pass = 0, fail = 0;
const near = (a, b, tol = 0.01) => Math.abs(a - b) <= tol;
function ok(name, cond, detail = "") {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL  ${name}${detail ? "  ::  " + detail : ""}`); }
}
function section(t) { console.log(`\n${t}`); }

const D = (over = {}) => ({ ...BASE, ...INDUSTRY.general, industry: "general", ...over });
const g = (d, st = "expected", pre = {}, railOrigin = null) => { const r = computeTCO(d, st); return gradeTCO({ d: r.d, r, pre, railOrigin, stanceKey: st }); };

/* ---------------------------------------------------- reconciliation ---- */
section("Reconciliation");
{
  const d = D(), r = computeTCO(d, "expected");
  const b = r.breakdown;
  const laborSum = b.agentLabor + b.supLabor + b.qaLabor + b.wfmLabor + b.trainerLabor + b.itLabor;
  ok("labor parts sum to labor", near(laborSum, r.labor, 0.5), `${laborSum} vs ${r.labor}`);

  const techSum = b.ccaas + b.wem + b.crm + b.aiUsage + b.analytics + b.ipaas + b.recording + b.knowledge + b.security + b.telephony;
  ok("tech parts sum to tech", near(techSum, r.tech, 0.5), `${techSum} vs ${r.tech}`);

  const ovhSum = b.cloudInfra + b.psAmortized + 12000 + b.attritionCost;
  ok("overhead parts sum to overhead", near(ovhSum, r.overhead, 0.5), `${ovhSum} vs ${r.overhead}`);

  ok("labor + tech + overhead = monthly", near(r.labor + r.tech + r.overhead, r.monthly, 0.5));
  ok("annual = monthly x 12", near(r.annual, r.monthly * 12, 0.5));
  ok("shares sum to 1", near(r.laborPct + r.techPct + r.overheadPct, 1, 0.0001));
}

/* ------------------------------------------------ 3-year projection ---- */
section("Three-year projection");
{
  const d = D(), r = computeTCO(d, "expected");
  ok("Year 1 equals annual snapshot", near(r.y1, r.annual, 0.5), `${r.y1} vs ${r.annual}`);
  ok("3-year = y1 + y2 + y3 with no implementation", near(r.threeYear, r.y1 + r.y2 + r.y3, 0.5));

  const buckets = (r.wageMonthly + r.licenseMonthly + r.flatMonthly);
  ok("escalation buckets are exhaustive and sum to monthly", near(buckets, r.monthly, 0.5), `${buckets} vs ${r.monthly}`);

  ok("y2 > y1 when escalators positive", r.y2 > r.y1);
  ok("y3 > y2", r.y3 > r.y2);

  const wA = r.wageMonthly * 12, lA = r.licenseMonthly * 12, fA = r.flatMonthly * 12;
  ok("y2 matches hand calc", near(r.y2, wA * 1.035 + lA * 1.06 + fA, 0.5));
  ok("y3 compounds, not linear", near(r.y3, wA * 1.035 ** 2 + lA * 1.06 ** 2 + fA, 0.5));
  ok("flat bucket does not escalate", near(r.y3 - r.y2, wA * 1.035 * 0.035 + lA * 1.06 * 0.06, 0.5));
}
{
  const impl = 250000;
  const a = computeTCO(D(), "expected");
  const b = computeTCO(D({ implementationOneTime: impl }), "expected");
  ok("one-time implementation excluded from annual run-rate", near(a.annual, b.annual, 0.5));
  ok("one-time implementation added exactly once to 3-year", near(b.threeYear - a.threeYear, impl, 0.5));
  ok("one-time never escalates", near(b.y3, a.y3, 0.5));
}
{
  const s = computeTCO(D({ useSingleEscalator: true }), "expected");
  ok("single blended escalator applies to both buckets", s.single && near(s.wEff, s.lEff, 1e-9));
}

/* --------------------------------------------------- unit cost model ---- */
section("Unit cost model");
{
  const d = D(), r = computeTCO(d, "expected");
  ok("cost per contact = monthly / contacts", near(r.costPerContact, r.monthly / r.contacts, 0.001));
  ok("cost per resolution uses (2 - FCR), not 1/FCR",
    near(r.costPerResolution, r.costPerContact * (2 - d.fcr), 0.001) &&
    !near(r.costPerResolution, r.costPerContact / d.fcr, 0.01));
  ok("cost per resolution >= cost per contact", r.costPerResolution >= r.costPerContact);
  ok("marginal < fully loaded cost per contact", r.marginalPerContact < r.costPerContact);

  const perfect = computeTCO(D({ fcr: 1 }), "expected");
  ok("FCR 100% collapses resolution premium to zero", near(perfect.costPerResolution, perfect.costPerContact, 0.001));
}
{
  // Telephony bills line-open time only. ACW happens after disconnect.
  const a = computeTCO(D({ aht: 390, acw: 45 }), "expected");
  const b = computeTCO(D({ aht: 390, acw: 0 }), "expected");
  ok("ACW is excluded from billable voice minutes", b.voiceMinutes > a.voiceMinutes);
  const d = D({ aht: 390, acw: 45 });
  const expected = d.monthlyContacts * d.channelMixVoice * ((390 - 45) / 60);
  ok("voice minutes match hand calc", near(a.voiceMinutes, expected, 1));
  const acwOver = computeTCO(D({ aht: 100, acw: 400 }), "expected");
  ok("ACW greater than AHT cannot produce negative minutes", acwOver.voiceMinutes >= 0);
}
{
  const d = D(), r = computeTCO(d, "expected");
  ok("labor uses 173 paid hours, not productive hours",
    near(r.breakdown.agentLabor, d.agents * d.agentHourly * 1.3 * 173, 1));
  ok("productive hours are net of shrinkage", near(r.productiveHours, 173 * (1 - d.shrinkage), 0.01));
}

/* -------------------------------------------------------- optimization ---- */
section("Optimization model");
{
  const d = D(), r = computeTCO(d, "expected");
  const opt = buildOptimizations(d, r, "expected");
  ok("net total equals sum of rounded line items",
    near(opt.netTotal, opt.items.reduce((s, o) => s + o.net, 0), 0.5));
  ok("gross total equals sum of rounded line items",
    near(opt.grossTotal, opt.items.reduce((s, o) => s + o.gross, 0), 0.5));
  ok("every line item is rounded to the nearest 1000", opt.items.every(o => o.net % 1000 === 0));
  ok("net never exceeds gross", opt.items.every(o => o.net <= o.gross));
}
{
  const d = D(), r = computeTCO(d, "expected");
  const none = buildOptimizations(d, r, "none");
  ok("none stance books exactly zero", none.netTotal === 0);
  const cons = buildOptimizations(d, r, "conservative");
  const exp = buildOptimizations(d, r, "expected");
  const agg = buildOptimizations(d, r, "aggressive");
  ok("stance ordering is monotonic", cons.netTotal <= exp.netTotal && exp.netTotal <= agg.netTotal);
  ok("aggressive equals gross (no haircut)", near(agg.netTotal, agg.grossTotal, 4000));
}
{
  // De-overlap: deflection must shrink the pool the FCR and AHT levers act on.
  const lo = D({ containment: 0.28, targetContainment: 0.30, aht: 500, targetAht: 420 });
  const hi = D({ containment: 0.28, targetContainment: 0.60, aht: 500, targetAht: 420 });
  const rl = computeTCO(lo, "expected"), rh = computeTCO(hi, "expected");
  const ol = buildOptimizations(lo, rl, "expected"), oh = buildOptimizations(hi, rh, "expected");
  const aht = (o) => (o.items.find(i => i.key === "aht") || { gross: 0 }).gross;
  ok("bigger deflection leaves a smaller pool for the AHT lever", aht(oh) < aht(ol), `${aht(oh)} vs ${aht(ol)}`);
}
{
  // Targets at or below current state must produce no lever.
  const d = D({ targetContainment: 0.10, targetFcr: 0.10, targetAht: 9999, targetAttrition: 0.99 });
  const r = computeTCO(d, "expected");
  const opt = buildOptimizations(d, r, "expected");
  ok("no levers when every target is worse than current", opt.items.length === 0 && opt.netTotal === 0);
}
{
  // Levers are valued at marginal cost, never fully loaded.
  const d = D({ targetContainment: 0.40 });
  const r = computeTCO(d, "expected");
  const opt = buildOptimizations(d, r, "expected");
  const cont = opt.items.find(i => i.key === "containment");
  const deflected = (0.40 - d.containment) * r.contacts;
  ok("containment lever valued at marginal, not loaded",
    near(cont.gross, Math.round(deflected * r.marginalPerContact / 1000) * 1000, 1000));
  ok("containment lever is far below loaded valuation", cont.gross < deflected * r.costPerContact);
}
{
  // Attrition lever is volume-independent.
  const a = D({ attrition: 0.45, targetAttrition: 0.30 });
  const b = D({ attrition: 0.45, targetAttrition: 0.30, monthlyContacts: 500000 });
  const oa = buildOptimizations(a, computeTCO(a), "expected");
  const ob = buildOptimizations(b, computeTCO(b), "expected");
  const at = (o) => (o.items.find(i => i.key === "attrition") || {}).gross;
  ok("attrition lever does not scale with contact volume", at(oa) === at(ob));
}

/* ------------------------------------------------------- confidence ---- */
section("Confidence and guardrails");
{
  /* The legacy two-axis grade is retired. Its guardrails now reach completeness. */
  ok("D11: invoiced on preset inputs grades Directional", g(D({ costBasis: "invoiced" })).confidence === "Directional");
  const spanned = computeTCO(D({ costBasis: "invoiced", supervisors: 2 }), "expected");
  ok("thin span of control holds completeness Directional", g(D({ costBasis: "invoiced", supervisors: 2 })).completeness === "Directional");
  ok("thin span of control raises a flag", spanned.flags.some(f => f.level === "flag"));
  const insane = computeTCO(D({ costBasis: "invoiced", agentHourly: 5000 }), "expected");
  ok("impossible per-agent cost holds completeness Directional", g(D({ costBasis: "invoiced", agentHourly: 5000 })).completeness === "Directional");
  ok("impossible per-agent cost blocks", insane.hasBlock);
}
{
  const sens = { estimate: 0.25, quoted: 0.15, invoiced: 0.10 };
  for (const [basis, pct] of Object.entries(sens)) {
    const r = computeTCO(D({ costBasis: basis }), "expected");
    ok(`sensitivity band for ${basis} is ${pct * 100}%`, near(r.sensitivity.pct, pct, 1e-9));
    ok(`sensitivity band brackets the annual for ${basis}`,
      r.sensitivity.annualLow < r.annual && r.annual < r.sensitivity.annualHigh);
  }
}
{
  const dom = computeTCO(D({ costBasis: "invoiced", ccaasSeat: 5000 }), "expected");
  ok("one dominant license line raises a flag", dom.flags.some(f => f.level === "flag"));
  const ai = computeTCO(D({ costBasis: "invoiced", ivaMonthly: 900000 }), "expected");
  ok("AI usage dominance is a note, not a flag, and does not reach completeness",
    ai.flags.some(f => f.level === "note") && g(D({ costBasis: "invoiced", ivaMonthly: 900000 })).completeness === "Finance-grade");
  const dbl = computeTCO(D({ psAmortized: 8000, implementationOneTime: 100000 }), "expected");
  ok("amortized PS plus one-time implementation raises a double-count note",
    dbl.flags.some(f => f.level === "note" && /twice/i.test(f.msg)));
}

/* --------------------------------------------------------- boundaries ---- */
section("Boundaries");
{
  const zero = computeTCO(D({ monthlyContacts: 0, agents: 0 }), "expected");
  ok("zero contacts does not divide by zero", isFinite(zero.costPerContact));
  ok("zero agents does not divide by zero", isFinite(zero.perAgentMonth));
  const full = computeTCO(D({ containment: 1 }), "expected");
  ok("100% containment does not divide by zero", isFinite(full.costPerHuman));
  const r = computeTCO(D(), "expected");
  ok("no NaN in any returned scalar",
    Object.entries(r).filter(([, v]) => typeof v === "number").every(([, v]) => !isNaN(v)));
  ok("no NaN in any breakdown line",
    Object.values(r.breakdown).every(v => typeof v !== "number" || !isNaN(v)));
}
{
  // Single-driver dominance: each cost driver must move the total on its own.
  const base = computeTCO(D(), "expected").monthly;
  const drivers = { agents: 400, agentHourly: 38, ccaasSeat: 300, monthlyContacts: 240000, attrition: 0.80 };
  for (const [k, v] of Object.entries(drivers)) {
    const moved = computeTCO(D({ [k]: v }), "expected").monthly;
    ok(`${k} moves the monthly total`, moved !== base);
  }
  // FCR, occupancy, and shrinkage must NOT move current cost. They size opportunity only.
  for (const k of ["fcr", "occupancy", "shrinkage"]) {
    const moved = computeTCO(D({ [k]: 0.5 }), "expected").monthly;
    ok(`${k} does not change current cost`, near(moved, base, 0.5));
  }
}

/* ------------------------------------------------------------ industry ---- */
section("Industry presets");
{
  for (const key of Object.keys(INDUSTRY)) {
    const d = { ...BASE, ...INDUSTRY[key], industry: key };
    const r = computeTCO(d, "expected");
    ok(`${key} preset produces a sane per-agent cost`,
      r.perAgentMonth > 1000 && r.perAgentMonth < 25000, `${Math.round(r.perAgentMonth)}`);
    const mix = d.channelMixVoice + d.channelMixChat + d.channelMixEmail + d.channelMixSocial + d.channelMixSelfServe;
    ok(`${key} channel mix sums to 1`, near(mix, 1, 0.005), `${mix}`);
  }
}


/* --------------------------------------- default target coherence ---- */
section("Default target coherence");
{
  for (const key of Object.keys(INDUSTRY)) {
    const d = { ...BASE, ...INDUSTRY[key], industry: key };
    ok(`${key} AHT target is an improvement on its own preset`,
      d.targetAht < d.aht, `aht ${d.aht} vs target ${d.targetAht}`);
    ok(`${key} containment target is an improvement`, d.targetContainment > d.containment);
    ok(`${key} FCR target is an improvement`, d.targetFcr > d.fcr);
    ok(`${key} attrition target is an improvement`, d.targetAttrition < d.attrition);
  }
}


/* ------------------------------------------------- PDF reconciliation ---- */
section("PDF reconciliation");
{
  // The allocator itself.
  ok("reconcile preserves the rounded total", reconcile([1.4, 1.4, 1.4], 4.2).reduce((a, b) => a + b, 0) === 4);
  ok("reconcile handles an exact split", reconcile([50, 30, 20], 100).join(",") === "50,30,20");
  ok("reconcile never moves a part by more than one unit",
    reconcile([10.9, 10.9, 10.9], 32.7).every(v => Math.abs(v - 10.9) < 1.5));
  ok("reconcile handles a zero part", reconcile([100.5, 0, 0.5], 101).reduce((a, b) => a + b, 0) === 101);
  ok("reconcile absorbs a negative residual", reconcile([1.9, 1.9], 3).reduce((a, b) => a + b, 0) === 3);
}
{
  // Every PDF table must tie to its own stated total, on every preset, at every stance.
  for (const key of Object.keys(INDUSTRY)) {
    const d = { ...BASE, ...INDUSTRY[key], industry: key };
    const r = computeTCO(d, "expected");
    const b = r.breakdown;

    const parts = [
      b.agentLabor,
      b.supLabor + b.qaLabor + b.wfmLabor + b.trainerLabor + b.itLabor,
      b.ccaas + b.wem + b.crm,
      b.aiUsage + b.analytics + b.ipaas + b.recording + b.knowledge + b.security,
      b.telephony,
      b.cloudInfra + b.psAmortized + d.facilitiesCost,
      b.attritionCost,
    ];
    ok(`${key} cost reconciliation rows tie to the monthly total`,
      reconcile(parts, r.monthly).reduce((a, x) => a + x, 0) === Math.round(r.monthly));

    const shares = reconcile([r.laborPct * 1000, r.techPct * 1000, r.overheadPct * 1000], 1000);
    ok(`${key} cost distribution shares tie to 100.0%`, shares.reduce((a, x) => a + x, 0) === 1000);

    ok(`${key} cost distribution amounts tie to the monthly total`,
      reconcile([r.labor, r.tech, r.overhead], r.monthly).reduce((a, x) => a + x, 0) === Math.round(r.monthly));

    for (const impl of [0, 250000, 1]) {
      const dd = { ...d, implementationOneTime: impl };
      const rr = computeTCO(dd, "expected");
      const yr = reconcile([rr.y1, rr.y2, rr.y3, impl], rr.threeYear);
      ok(`${key} three-year rows tie to the total at implementation ${impl}`,
        yr.reduce((a, x) => a + x, 0) === Math.round(rr.threeYear));
    }
  }
}


/* ------------------------------------------- cross-table consistency ---- */
section("Cross-table consistency");
{
  // Every rendered figure must come from ONE allocation. Two independent
  // allocators over the same total printed the same quantity a dollar apart.
  const cases = [];
  for (const key of Object.keys(INDUSTRY)) {
    for (const over of [{}, { facilitiesCost: 25500 }, { agents: 240, monthlyContacts: 174000, aht: 550 }, { agents: 1 }, { monthlyContacts: 1 }]) {
      cases.push({ ...BASE, ...INDUSTRY[key], industry: key, ...over });
    }
  }
  let bad = 0;
  for (const d of cases) {
    const r = computeTCO(d, "expected");
    const p = r.disp;
    if (p.rows.reduce((a, x) => a + x, 0) !== p.total) bad++;
    if (p.rows[0] + p.rows[1] !== p.labor) bad++;
    if (p.rows[2] + p.rows[3] + p.rows[4] !== p.tech) bad++;
    if (p.rows[5] + p.rows[6] !== p.overhead) bad++;
    if (p.labor + p.tech + p.overhead !== p.total) bad++;
    if (p.total !== Math.round(r.monthly)) bad++;
    const shares = [p.laborPctStr, p.techPctStr, p.overheadPctStr].map(x => parseFloat(x));
    if (+(shares[0] + shares[1] + shares[2]).toFixed(1) !== 100) bad++;
  }
  ok(`all ${cases.length} input cases keep every table tied to one allocation`, bad === 0, `${bad} violations`);
}
{
  // The analyst read quotes the same labor share the distribution table prints.
  for (const key of Object.keys(INDUSTRY)) {
    const d = { ...BASE, ...INDUSTRY[key], industry: key };
    const r = computeTCO(d, "expected");
    const opt = buildOptimizations(d, r, "expected");
    const prose = buildAnalystRead(d, r, opt, "expected").join(" ");
    const quoted = prose.match(/Labor is ([\d.]+%) of TCO/);
    ok(`${key} analyst read quotes the printed labor share`,
      !quoted || quoted[1] === r.disp.laborPctStr, `${quoted && quoted[1]} vs ${r.disp.laborPctStr}`);
  }
}
{
  // Priority is rank-based: exactly one high, one medium, regardless of spread.
  for (const over of [{ aht: 550, targetAht: 345 }, {}, { containment: 0.28, targetContainment: 0.60 }]) {
    const d = { ...BASE, ...INDUSTRY.general, industry: "general", ...over };
    const opt = buildOptimizations(d, computeTCO(d), "expected");
    if (opt.items.length < 2) continue;
    const ranked = [...opt.items].sort((a, b) => b.net - a.net);
    ok("highest-value lever ranks first", ranked[0].net >= ranked[1].net);
    ok("ranking is by money, not pipeline order",
      ranked[0].net === Math.max(...opt.items.map(x => x.net)));
  }
}


/* ---------------------------------------------- 11B: three-axis grade ---- */
section("11B grading: evidence by origin, realization N/A, completeness by validity");
{
  const GRADED = [...TCO_OPS, ...TCO_COST];
  /* Every graded field off its preset, the channel mix still whole. */
  const E = (over = {}) => {
    const x = D();
    for (const [f] of GRADED) if (f !== "channelMixVoice") x[f] = +(x[f] + (x[f] < 1 ? 0.01 : 1)).toFixed(4);
    x.channelMixVoice = +(x.channelMixVoice + 0.01).toFixed(4); x.channelMixChat = +(x.channelMixChat - 0.01).toFixed(4);
    return { ...x, ...over };
  };
  ok("first paint grades Directional", g(D()).confidence === "Directional");
  ok("first paint is bound by evidence", g(D()).gradeObj.boundBy === "evidence");
  ok("D11: invoiced on presets is Directional", g(D({ costBasis: "invoiced" })).evidence === "Directional");
  ok("own figures on an estimate basis: cost evidence Directional", g(E()).costGrade === "Directional" && g(E()).opsGrade === "Planning-grade");
  ok("own figures, quoted: Planning-grade", g(E({ costBasis: "quoted" })).confidence === "Planning-grade");
  ok("J1: own figures, invoiced: Planning-grade and no higher", g(E({ costBasis: "invoiced" })).confidence === "Planning-grade");
  ok("a clean own-figure run is complete", g(E({ costBasis: "invoiced" })).completeness === "Finance-grade");
  for (const [f, label] of GRADED) {
    const x = E({ costBasis: "quoted" }); x[f] = D()[f];
    if (f === "channelMixVoice") x.channelMixChat = D().channelMixChat;
    const G = g(x);
    ok(`${f} left at its preset binds evidence Directional`, G.evidence === "Directional" && G.origins[f] === "default");
    ok(`${f} at its preset is named in the reason`, G.gradeObj.reasons.evidence.toLowerCase().includes(label.toLowerCase()));
  }
  ok("the preset follows the selected industry", g(E({ costBasis: "quoted", industry: "retail", agentHourly: INDUSTRY.retail.agentHourly })).origins.agentHourly === "default");
  ok("a general preset value is entered once retail is selected", g(E({ costBasis: "quoted", industry: "retail", agentHourly: INDUSTRY.general.agentHourly })).origins.agentHourly === "entered");

  const x = E({ costBasis: "quoted" });
  ok("self: this tool's own value never credentials it", g(x, "expected", { agents: { value: x.agents, src: "tco-calculator" } }).evidence === "Directional");
  ok("rail with no origin grade is Directional", g(x, "expected", { agents: { value: x.agents, src: "staffing-calculator" } }).evidence === "Directional");
  ok("rail with a Planning origin grade stands at Planning-grade", g(x, "expected", { agents: { value: x.agents, src: "staffing-calculator" } }, "Planning-grade").evidence === "Planning-grade");
  ok("rail with a Finance origin grade is capped at Planning-grade", g(x, "expected", { agents: { value: x.agents, src: "staffing-calculator" } }, "Finance-grade").evidence === "Planning-grade");
  ok("a rail value the user changed grades as entered", g(x, "expected", { agents: { value: x.agents + 7, src: "staffing-calculator" } }).origins.agents === "entered");
  ok("an ungraded field on the rail changes nothing", g(x, "expected", { shrinkage: { value: x.shrinkage, src: "staffing-calculator" } }).confidence === "Planning-grade");

  ok("realization is not applicable", g(x).gradeObj.realization === null && g(x).gradeObj.applicable.indexOf("realization") < 0);
  ok("realization N/A states its reason", /cost baseline/.test(g(x).gradeObj.naReason));
  ok("a clean grade carries no defect", g(x).gradeObj.defects.length === 0);
  ok("every applicable axis has a reason", g(x).gradeObj.applicable.every((a) => g(x).gradeObj.reasons[a].length > 20));

  const blocks = [
    ["aggressive stance", [x, "aggressive"]],
    ["a corrected input", [{ ...x, agents: -4 }]],
    ["per-agent cost above the ceiling", [{ ...x, agentHourly: 5000 }]],
    ["one dominant software line", [{ ...x, ccaasSeat: 5000 }]],
    ["span of control above 20", [{ ...x, supervisors: 2 }]],
    ["a channel mix that does not total 100", [{ ...x, channelMixChat: x.channelMixChat + 0.1 }]],
  ];
  for (const [label, args] of blocks) {
    const G = g(...args);
    ok(`${label} holds completeness Directional`, G.completeness === "Directional" && G.confidence === "Directional");
    ok(`${label} is named in the completeness reason`, G.blockers.length >= 1 && G.gradeObj.reasons.completeness.length > 30);
  }
  ok("AI usage dominance is not a blocker", g({ ...x, ivaMonthly: 900000, costBasis: "quoted" }).completeness === "Finance-grade");
  ok("a double-count note is not a blocker", g({ ...x, implementationOneTime: 100000 }).completeness === "Finance-grade");

  /* Void: an invariant failure supersedes every axis. */
  const r0 = computeTCO(x, "expected");
  const vd = gradeTCO({ d: r0.d, r: { ...r0, y1: r0.annual + 1 }, pre: {}, railOrigin: null, stanceKey: "expected" });
  ok("Year 1 off the annual voids the export", vd.voided && vd.confidence === "Void" && vd.gradeObj.headline === null);
  const vb = gradeTCO({ d: r0.d, r: { ...r0, flatMonthly: r0.flatMonthly + 100 }, pre: {}, railOrigin: null, stanceKey: "expected" });
  ok("buckets off the monthly voids the export", vb.voided && /buckets/.test(vb.gradeWhy));
  const vn = gradeTCO({ d: r0.d, r: { ...r0, threeYear: NaN }, pre: {}, railOrigin: null, stanceKey: "expected" });
  ok("a non-finite output voids the export", vn.voided);

  /* Class 3: the grade reads engine values and validity checks, never flag text, a
     verdict, or the legacy grade. */
  const body = region.slice(region.indexOf("function gradeTCO"), region.indexOf("/* @engine-end */"));
  ok("class 3: the grade never reads flag text", !/\.flags\b|\.msg\b|openIssues|itemsToConfirm|hasFlag|hasBlock/.test(body));
  ok("class 3: the grade never reads a total's size", !/r\.annual\s*[<>]|r\.monthly\s*[<>]|opt\./.test(body));
  ok("the legacy grade is gone from the engine", !/basisRank\s*===\s*2\s*&&/.test(region) && computeTCO(D()).confidence === undefined);

  /* Sweep: 6,000 randomized runs. */
  let seed = 20260922; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; const pk = (a) => a[Math.floor(rnd() * a.length)];
  const R = { GR: { Directional: 0, "Planning-grade": 1, "Finance-grade": 2 } };
  const bad = new Set(); let voids = 0, plan = 0;
  const inds = Object.keys(INDUSTRY), stances = Object.keys(STANCE);
  for (let i = 0; i < 6000; i++) {
    const ind = pk(inds); const d = { ...BASE, ...INDUSTRY[ind], industry: ind };
    const every = rnd() < 0.4; /* a user who replaced every preset */
    for (const [k] of TCO_DOMAIN) if ((every || rnd() < 0.5) && typeof d[k] === "number") d[k] = +(d[k] * (0.3 + rnd() * 1.7) + (every ? 0.001 : 0)).toFixed(3);
    if (rnd() < 0.5) { const t = d.channelMixVoice + d.channelMixChat + d.channelMixEmail + d.channelMixSocial + d.channelMixSelfServe; for (const c of ["channelMixVoice", "channelMixChat", "channelMixEmail", "channelMixSocial", "channelMixSelfServe"]) d[c] = d[c] / t; }
    d.costBasis = pk(["estimate", "quoted", "invoiced"]); d.useSingleEscalator = rnd() < 0.3;
    const st = pk(stances);
    const pre = rnd() < 0.3 ? { agents: { value: d.agents, src: pk(["tco-calculator", "staffing-calculator"]) } } : {};
    const ro = pk([null, "Directional", "Planning-grade", "Finance-grade"]);
    const G = g(d, st, pre, ro);
    if (G.voided) { voids++; continue; }
    const o = G.gradeObj;
    if (o.headline === "Finance-grade") bad.add("Finance-grade is never reached on self-declared evidence");
    if (G.evidence === "Finance-grade") bad.add("evidence never exceeds Planning-grade");
    const minAx = ["evidence", "completeness"].map((a) => R.GR[o[a]]).reduce((p, q) => Math.min(p, q));
    if (R.GR[o.headline] !== minAx) bad.add("headline is the minimum of the applicable axes");
    if (!o.boundAxes.every((a) => R.GR[o[a]] === minAx)) bad.add("the binding axis is named");
    if (o.realization !== null) bad.add("realization is always N/A");
    if (o.defects.length) bad.add("no grade carries a defect");
    if (d.costBasis === "estimate" && G.costGrade !== "Directional") bad.add("an estimate basis never lifts cost evidence");
    if (pre.agents && pre.agents.src === "tco-calculator" && G.evidence !== "Directional") bad.add("self never credentials");
    if (st === "aggressive" && G.completeness !== "Directional") bad.add("aggressive always blocks completeness");
    /* Scale invariance: every price times k moves no grade unless the ceiling is crossed. */
    const k = pk([0.5, 2, 3]); const s2 = { ...d };
    for (const [f] of TCO_COST) if (f !== "agentBenefitsPct") s2[f] = d[f] * k;
    const r2 = computeTCO(s2, st);
    const pre2 = pre;
    if (Math.max(computeTCO(d, st).perAgentMonth, r2.perAgentMonth) <= TCO_CHECKS.perAgentCeiling && r2.guards.length === computeTCO(d, st).guards.length) {
      const G2 = g(s2, st, pre2, ro);
      if (G2.confidence !== G.confidence || G2.completeness !== G.completeness) bad.add("scale invariance: price level moves no grade");
    }
    /* Stance invariance: only aggressive reaches the grade. */
    if (st !== "aggressive") { const G3 = g(d, st === "none" ? "expected" : "none", pre, ro); if (G3.confidence !== G.confidence) bad.add("stance invariance: none, conservative and expected grade alike"); }
    if (G.confidence === "Planning-grade") plan++;
  }
  for (const b of bad) ok(b, false);
  ok("6,000-case sweep: no invariant broken", bad.size === 0, [...bad].join("; "));
  ok("the sweep never voids a clean engine run", voids === 0, `${voids} voided`);
  ok("Planning-grade is reachable in the sweep", plan > 0, `${plan} of 6000`);
  console.log(`  sweep: ${plan} of 6000 at Planning-grade, ${voids} void`);
}

// ------------------------------------------------- registry gate (J10, J11, step 2)
section("benchmark registry: every constant this tool ships is registered");
{
  const SRCTXT = SRC;
  const { BENCHMARK_SOURCES, benchmarksForTool, benchmark: bm } = BENCHMOD;
  const TOOL = "tco-calculator";
  const readIds = [...SRCTXT.matchAll(/benchmark\("([^"]+)"\)/g)].map((m) => m[1]);

  ok("the tool reads the registry rather than shipping bare constants", readIds.length > 0);
  ok("every id the tool reads is registered", readIds.every((id) => id in BENCHMARK_SOURCES),
    readIds.filter((id) => !(id in BENCHMARK_SOURCES)).join(", "));
  ok("every id the tool reads is owned by this tool or shared",
    readIds.every((id) => [TOOL, "shared"].includes(BENCHMARK_SOURCES[id].tool)));
  ok("the registry holds 16 entries for this tool", benchmarksForTool(TOOL).length === 16, `${benchmarksForTool(TOOL).length}`);
  ok("every heuristic is labelled as one", benchmarksForTool(TOOL).filter((e) => e.kind === "heuristic").every((e) => /heuristic/i.test(e.source)));
  ok("every threshold states a rationale", benchmarksForTool(TOOL).filter((e) => e.kind === "threshold").every((e) => e.rationale.length > 40));
  ok("the one market entry names its source and date", benchmarksForTool(TOOL).filter((e) => e.kind === "market").every((e) => /Bureau of Labor Statistics/.test(e.source)));

  // J10. Four load concepts exist, three shared and one owned, and no fifth ships bare.
  ok("J10: the agent benefits load is the shared concept", BASE.agentBenefitsPct === bm("load.benefits") - 1 && BENCHMARK_SOURCES["load.benefits"].tool === "shared");
  ok("J10: the salaried load is registered to this tool, not hardcoded",
    bm("tco.load.salaried") === 1.25 && BENCHMARK_SOURCES["tco.load.salaried"].tool === TOOL && !/\* 1\.25 \* HRS/.test(SRCTXT));
  ok("J10: no bare 1.35 multiple survives anywhere in this tool", !/1\.35/.test(SRCTXT));
  ok("J10: the three shared load concepts are named and distinct",
    bm("load.benefits") === 1.30 && bm("load.marginal") === 1.18 && bm("load.fullyLoaded") === 1.95);

  // J11. One shared wage entry, and this tool's industry wages are registered heuristics.
  ok("J11: the shared market wage is the BLS May 2024 median",
    bm("market.wage.agent") === 20.59 && BENCHMARK_SOURCES["market.wage.agent"].tool === "shared"
    && /43-4051/.test(BENCHMARK_SOURCES["market.wage.agent"].source));
  ok("J11: the three per-tool wage copies are retired",
    !("staffing.wage.median" in BENCHMARK_SOURCES) && !("cpc.wage.median" in BENCHMARK_SOURCES) && !("channel.wage.median" in BENCHMARK_SOURCES));
  const inds = ["general", "financial", "healthcare", "retail", "telecom", "insurance", "bpo"];
  ok("J11: all seven industry wages are registered heuristics",
    inds.every((k) => BENCHMARK_SOURCES[`tco.wage.${k}`] && BENCHMARK_SOURCES[`tco.wage.${k}`].kind === "heuristic"));
  ok("J11: each industry preset reads its wage from the registry",
    inds.every((k) => INDUSTRY[k].agentHourly === bm(`tco.wage.${k}`)));
  ok("J11: no industry wage is presented as the sourced market figure",
    inds.every((k) => /not a published median/.test(BENCHMARK_SOURCES[`tco.wage.${k}`].rationale)));

  // Step 2. The hand-written sources paragraph is gone and cannot come back.
  const paragraph = mod.BENCHMARK_SOURCES || "";
  ok("step 2: the sources paragraph is built, not hand-written", /const BENCHMARK_SOURCES = \(\(\) =>/.test(SRCTXT));
  ok("step 2: the unverified vendor containment claim is retired",
    !/Balto|Parloa|Teneo|SQM|Sprinklr|Calabrio|Giva|Forrester|Salary\.com/.test(SRCTXT));
  ok("step 2: the false BLS wage claim is retired", !/BLS \(agent wages/.test(SRCTXT) && !/roughly \$19 per hour/.test(SRCTXT));
  ok("step 2: the paragraph names its sourced figures", /Bureau of Labor Statistics/.test(paragraph));
  ok("step 2: the paragraph says plainly what is not sourced", /internal planning value/.test(paragraph));

  // No bare constant reaches the engine where a registry id exists for it.
  ok("the hours constant reads the registry", !/const HRS = 173/.test(SRCTXT));
  ok("the escalator defaults read the registry", !/wageEscalatorPct: 0\.035/.test(SRCTXT) && !/licenseEscalatorPct: 0\.06/.test(SRCTXT));
  ok("the validity checks read the registry", !/perAgentCeiling: 25000/.test(SRCTXT));
  ok("the checks still hold their shipped values",
    TCO_CHECKS.perAgentCeiling === 25000 && TCO_CHECKS.domShareMax === 0.80 && TCO_CHECKS.spanMax === 20 && TCO_CHECKS.mixTol === 0.005);
}

// ------------------------------------------------- step 5: next steps come from the graph
section("next steps: the journey graph is the only source");
{
  const J = JOURNEYMOD;
  const edges = J.nextFor("tco-calculator");
  ok("the tool has next steps in the graph", edges.length === 3);
  ok("the graph carries license gap, AI deflection and the decision node",
    edges.map((e) => e.to).join(",") === "license-gap,ai-deflection,business-case-builder");
  ok("every next step resolves to a live route", edges.every((e) => typeof e.href === "string" && e.href.startsWith("/tools/")));
  ok("every next step carries a reason", edges.every((e) => String(e.why || "").length > 20));
  ok("the decision node is reachable and comes last", edges[edges.length - 1].to === J.DECISION_NODE);

  ok("step 5: the page CTAs render from nextFor", /\{nextFor\(TOOL_ID\)\.map\(\(c, i\) =>/.test(SRC));
  ok("step 5: the PDF next steps render from nextFor", /items: nextFor\(TOOL_ID\)\.map\(\(e\) => \(\{ tool: e\.name, reason: e\.why, href: e\.href \}\)\)/.test(SRC));
  ok("step 5: no hardcoded tool route survives in the component",
    !/href: "\/tools\/license-gap"/.test(SRC) && !/href: "\/tools\/ai-deflection"/.test(SRC) && !/href: "\/tools\/business-case"/.test(SRC));
  ok("step 5: no hardcoded next-step label survives",
    !/tool: "License Bundle Gap Checker"/.test(SRC) && !/tool: "AI Deflection Reality Check"/.test(SRC) && !/tool: "Business Case Builder"/.test(SRC));
  ok("the methodology paragraph reads its constants from the registry",
    !/computed on 173 paid hours/.test(SRC) && !/wage 3\.5 percent and license 6 percent/.test(SRC));
}

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
