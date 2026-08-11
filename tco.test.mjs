// tco.test.mjs
// Slices the TCO engine out of TCOCalculator.jsx at runtime and tests it directly, so
// the verified engine and the deployed engine cannot drift apart. Run: node tco.test.mjs
//
// Engine region = INDUSTRY through the end of buildOptimizations. Nothing here is JSX.

import { readFileSync } from "node:fs";

const SRC = readFileSync(new URL("./TCOCalculator.jsx", import.meta.url), "utf8");

function slice(startMarker, endMarker) {
  const a = SRC.indexOf(startMarker);
  if (a < 0) throw new Error("engine slice failed, missing: " + startMarker);
  const b = SRC.indexOf(endMarker, a);
  if (b < 0) throw new Error("engine slice failed, missing end: " + endMarker);
  return SRC.slice(a, b);
}

const helpers = slice("const n = (v) =>", "function LogoMark");
const consts = slice("const INDUSTRY = {", "// InfoDot definition strings");
const engine = slice("function computeTCO(", "function buildAnalystRead");

const BENCH = { occupancy: { cautionMax: 0.87 } };

const mod = new Function(
  "BENCH",
  `${helpers}\n${consts}\n${engine}\nreturn { computeTCO, buildOptimizations, BASE, INDUSTRY, STANCE, n };`
)(BENCH);

const { computeTCO, buildOptimizations, BASE, INDUSTRY, STANCE } = mod;

let pass = 0, fail = 0;
const near = (a, b, tol = 0.01) => Math.abs(a - b) <= tol;
function ok(name, cond, detail = "") {
  if (cond) { pass++; }
  else { fail++; console.log(`  FAIL  ${name}${detail ? "  ::  " + detail : ""}`); }
}
function section(t) { console.log(`\n${t}`); }

const D = (over = {}) => ({ ...BASE, ...INDUSTRY.general, industry: "general", ...over });

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
  ok("estimate basis is Directional", computeTCO(D({ costBasis: "estimate" }), "expected").confidence === "Directional");
  ok("quoted basis is Planning-grade", computeTCO(D({ costBasis: "quoted" }), "expected").confidence === "Planning-grade");
  ok("invoiced basis reaches Finance-grade", computeTCO(D({ costBasis: "invoiced" }), "expected").confidence === "Finance-grade");
  ok("aggressive stance blocks Finance-grade",
    computeTCO(D({ costBasis: "invoiced" }), "aggressive").confidence === "Planning-grade");

  const spanned = computeTCO(D({ costBasis: "invoiced", supervisors: 2 }), "expected");
  ok("thin span of control caps Finance-grade", spanned.confidence === "Planning-grade");
  ok("thin span of control raises a flag", spanned.flags.some(f => f.level === "flag"));

  const insane = computeTCO(D({ costBasis: "invoiced", agentHourly: 5000 }), "expected");
  ok("impossible per-agent cost forces Directional", insane.confidence === "Directional");
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
  ok("AI usage dominance is a note, not a flag, and does not cap Finance-grade",
    ai.flags.some(f => f.level === "note") && ai.confidence === "Finance-grade");
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

console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
