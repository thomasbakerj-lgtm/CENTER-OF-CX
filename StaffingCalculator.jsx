import { useState, useEffect } from "react";
import { HowOthersReport } from "./src/lib/HowOthersReport.jsx";
import ReportActions from "./ReportActions";
import { METHOD_VERSIONS } from "./src/lib/methodVersions";
import { COLORS, BENCH, classifyOccupancy, classifyShrinkage, benchmark } from "./src/lib/benchmarks";
import { emitGrades, voidResult, isVoid, railEvidence, weakerStream, originsFor } from "./src/lib/confidence";
import { publishToolResult, getExternalWithSource } from "./src/lib/toolData";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import NumField from "./src/lib/NumField";
import { FONT, FONT_IMPORT_CSS, TYPE, W, NUM } from "./src/lib/type";
import { severityBucket } from "./src/lib/track";
import { createGuards, guardVal, guardLine } from "./src/lib/guards";
import { ToolFrame } from "./src/lib/ToolFrame.jsx";
import { Result, Finding, Button, resultHow } from "./src/lib/ui.jsx";
import { HOUSE, PILLARS, ARCS, RADIUS, TOUCH, alpha, LINE } from "./src/lib/tokens.js";
import { methodStamp } from "./src/lib/methodVersions.js";

const NAVY = COLORS.navy, DEEP = "#061325", ELECTRIC = COLORS.electric, LIGHT = "#00AAFF";
const WARM = "#F8FAFB", SLATE = "#3A4F6A", MUTED = COLORS.muted, BORDER = "#D8E3ED";
const GREEN = COLORS.green, AMBER = COLORS.amber, RED = COLORS.red;
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };

const TOOL_ID = "staffing-calculator";
const ROUTE = "/tools/staffing-calculator";
const METHODOLOGY_VERSION = METHOD_VERSIONS[TOOL_ID].version;

/* Scenario defaults. Only fields that differ travel in the link, so the URL stays short.
   No contact detail is ever encoded: the shape below is the whole payload. */
const DEFAULTS = {
  vol: benchmark("staffing.preset.general.vol"), aht: benchmark("staffing.preset.general.aht"),
  slT: benchmark("staffing.preset.general.slT"), slS: benchmark("staffing.preset.general.slS"),
  shrink: benchmark("staffing.preset.general.shrink"), intv: benchmark("staffing.default.intv"),
  patience: 0, capOn: false, capPct: benchmark("staffing.default.capPct"), queues: 1, preset: "general",
};

function LogoMark({ size = 34, light = true }) { const a = light ? "#fff" : NAVY, x = light ? LIGHT : ELECTRIC; return <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light ? .6 : .3} /><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light ? .8 : .5} /><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round" /><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /></g></svg>; }

/* Stable Erlang C via Erlang B recursion (overflow-proof to thousands of agents) */
function erlangB(N, A) { let B = 1; for (let n = 1; n <= N; n++) B = (A * B) / (n + A * B); return B; }
function erlangC(N, A) { if (N <= A) return 1; const B = erlangB(N, A); const rho = A / N; return B / (1 - rho * (1 - B)); }

/* calc now accepts an optional occupancy cap (occCap, 0 to 1). When set, agents are
   staffed to the GREATER of "meets service level" and "occupancy <= cap", since
   occupancy = A/N means N must be >= A/cap. Verified to reproduce Nextiva's
   published result (400/257s/80-20/85% cap -> 68 base, 98 FTE, 84.0% occ). */
function calc(volume, ahtSec, intMin, slT, slSec, shrink, occCap) {
  const A = (volume * ahtSec) / (intMin * 60);
  /* The first count above the offered load. floor(A) + 1 exceeds A for any load; the
     earlier ceil(A) + 1 skipped it on a fractional load and could report one agent more
     than the target needs (found against the Schedule Adherence solver). */
  const minN = Math.floor(A) + 1;
  /* The search continues the Erlang B recursion one step per candidate instead of
     restarting it from one agent, so each step is constant time and every value is
     bit-identical to erlangB(n, A). Restarting cost 13.5 seconds for one solve at a
     million Erlangs. The step budget scales with the square root of offered load,
     because the agents a service target needs above load grow with that root. A
     target the budget cannot reach returns met: false and is disclosed, never
     reported as achieved. */
  const budget = minN + Math.max(2000, Math.ceil(60 * Math.sqrt(A)));
  let agents = minN, met = false;
  let B = erlangB(minN, A);
  for (let n = minN; n < budget; n++) {
    if (n > minN) B = (A * B) / (n + A * B);
    const rho = A / n;
    const pw = B / (1 - rho * (1 - B));
    const sl = 1 - pw * Math.exp(-(n - A) * slSec / ahtSec);
    if (sl >= slT) { agents = n; met = true; break; } agents = n;
  }
  let capped = false;
  if (occCap && occCap > 0 && occCap < 1) {
    const floor = Math.ceil(A / occCap);
    if (floor > agents) { agents = floor; capped = true; }
  }
  const pw = erlangC(agents, A);
  const sl = 1 - pw * Math.exp(-(agents - A) * slSec / ahtSec);
  const asa = pw * ahtSec / (agents - A);
  const occ = A / agents;
  return { raw: agents, sched: Math.ceil(agents / (1 - shrink)), pw, sl, asa, occ, A, capped, met };
}

/* Display floors. Erlang C never returns certainty. The residual
   pw * exp(-(N - A) * slSec / aht) is positive at every finite headcount, so service
   level is never 100 percent and speed of answer is never zero. Printed to one
   decimal both collapse anyway: a 60 percent occupancy ceiling at 400 contacts
   renders 100.0% and 0s, and at an exactly 50 percent ceiling the residual
   underflows the double, so sl === 1 exactly and the comparison against a target is
   decided by IEEE 754 rounding rather than by queueing. These print the true
   statement, better than a stated bound, instead of a certainty the model cannot
   support. One definition, read by the screen, the insights and the report, because
   a retyped copy in the report harness is how the last drift started. */
const SL_CEILING = benchmark("staffing.display.slCeiling");
const fmtSL = (sl) => sl > SL_CEILING ? "> 99.9%" : `${(sl * 100).toFixed(1)}%`;
const fmtASA = (asa) => asa < 1 ? "< 1s" : asa > 999 ? "> 15m" : `${Math.round(asa)}s`;
const fmtPW = (pw) => pw < 0.001 ? "< 0.1%" : `${(pw * 100).toFixed(1)}%`;

/* Erlang C is a steady-state model. It assumes the queue reaches equilibrium inside
   the interval being measured. When handle time approaches interval length, contacts
   spill across interval boundaries and the steady-state assumption fails: the model
   silently understates staffing on long-handle-time work. The accepted planning
   floor is an interval at least three times AHT. Below that we say so rather than
   return a confident number, because a back-office or complex-case queue is exactly
   the user who would enter these inputs and exactly the one who would be misled. */
const VALID_RATIO = benchmark("staffing.validity.ratio");
const VALID_CRITICAL = benchmark("staffing.validity.critical");
function modelValidity(ahtSec, intMin) {
  const ratio = (intMin * 60) / (ahtSec || 1);
  if (ratio >= VALID_RATIO) return { ok: true, ratio };
  const needMin = Math.ceil((ahtSec * VALID_RATIO) / 60);
  return {
    ok: false,
    ratio,
    severity: ratio < VALID_CRITICAL ? "critical" : "caution",
    msg: `Your interval is ${ratio.toFixed(1)} times AHT (average handle time). Erlang C assumes the queue settles within the interval, which takes roughly ${VALID_RATIO} times AHT or more. Below that, contacts carry over from one interval into the next, and this figure understates the agents you need. Lengthen the interval to at least ${needMin} minutes. For long-handle work such as back-office cases, a capacity model fits better than Erlang C.`,
  };
}

function sustainablePair(volume, ahtSec, intMin, slT, slSec, shrink, ceiling) {
  const sla = calc(volume, ahtSec, intMin, slT, slSec, shrink, 0);
  if (sla.occ <= ceiling) return { sla, sustainable: null, deltaFte: 0, deltaAgents: 0, ceiling };
  const sustainable = calc(volume, ahtSec, intMin, slT, slSec, shrink, ceiling);
  return {
    sla,
    sustainable,
    deltaFte: sustainable.sched - sla.sched,
    deltaAgents: sustainable.raw - sla.raw,
    ceiling,
  };
}

/* ------------------------------------------------------------------- cost --
   Every Erlang calculator on the internet outputs FTE and stops. FTE is not a
   decision; a dollar figure is. This turns the staffing answer into annual cost
   and, more importantly, prices the trade-off the tool already surfaces.

   Provenance matters here. A wage that arrived over the rail from the user's own
   TCO run is their number; the benchmark fallback is ours. Those two are not the
   same claim, so the label follows the source and the tool never presents a
   benchmark median as if the user had supplied it. `getExternalWithSource` blocks
   Staffing from reading back anything it published itself, and keeps the origin grade
   the publisher recorded so the cost stream grades no higher than where the figure
   was born.

   Fully loaded cost is wage plus benefits, taxes, facilities, supervision, and
   technology. A common planning multiplier on base wage is 1.3 for benefits and
   payroll burden, and roughly 1.9 to 2.1 once the rest is included. We use 1.95
   on base wage when only a wage is known, and prefer a real per-agent TCO figure
   whenever the rail carries one, because that is measured rather than assumed. */
const BENCHMARK_HOURLY = benchmark("market.wage.agent");        // shared BLS OEWS median, SOC 43-4051 (vintage in the registry)
const FULL_LOAD_MULTIPLE = benchmark("load.fullyLoaded");       // shared: wage to fully loaded, when no TCO figure exists
const PAID_HOURS_MONTH = benchmark("staffing.hours.month");     // 2080 annual hours / 12

function staffingCost(fte, railPerAgentMonth, railHourly) {
  let perAgentMonth, basis, sourced;
  if (railPerAgentMonth > 0) {
    perAgentMonth = railPerAgentMonth;
    basis = "your TCO run, fully loaded per agent per month";
    sourced = true;
  } else if (railHourly > 0) {
    perAgentMonth = railHourly * FULL_LOAD_MULTIPLE * PAID_HOURS_MONTH;
    basis = `your TCO wage of $${railHourly.toFixed(2)} per hour, loaded at ${FULL_LOAD_MULTIPLE}x`;
    sourced = true;
  } else {
    perAgentMonth = BENCHMARK_HOURLY * FULL_LOAD_MULTIPLE * PAID_HOURS_MONTH;
    basis = `a benchmark median of $${BENCHMARK_HOURLY} per hour, loaded at ${FULL_LOAD_MULTIPLE}x; these are not your own figures`;
    sourced = false;
  }
  return {
    perAgentMonth,
    annual: fte * perAgentMonth * 12,
    monthly: fte * perAgentMonth,
    basis,
    sourced,
  };
}

/* ---------------------------------------------------------------- pooling --
   Erlang C is non-linear in scale, so one pooled queue always needs fewer agents
   than the same volume split across several. Over-skilling and queue proliferation
   are among the most common real defects in contact centres and almost nobody
   prices them, because the cost never appears as a line item: it shows up as
   headcount that seems necessary.

   Two honesty constraints govern the output.

   First, this is an UPPER BOUND. The calculation assumes fully independent queues
   with no overflow, no universal agents, and no cross-training. Real routing has
   overflow rules that recover part of the loss, so the true penalty is lower. We
   say so rather than sell the ceiling as the number.

   Second, splitting also LOWERS occupancy, because each small queue carries more
   idle time. That is not a free benefit and it is not a hidden win: it is the same
   capacity counted twice. If a user is already staffing to an occupancy ceiling,
   part of the pooling penalty is capacity they were going to add anyway. The
   comparison therefore reports occupancy on both sides so the reader can see it.

   Consolidation is a routing problem, which is why this is the one place the tool
   points at a technology category rather than another diagnostic. */
function poolingPenalty(volume, ahtSec, intMin, slT, slSec, shrink, occCap, queues) {
  const q = Math.round(queues);
  if (!q || q < 2 || !volume) return null;
  const pooled = calc(volume, ahtSec, intMin, slT, slSec, shrink, occCap);
  const per = calc(volume / q, ahtSec, intMin, slT, slSec, shrink, occCap);
  const splitAgents = per.raw * q;
  const splitFte = per.sched * q;
  if (splitFte <= pooled.sched) return null;
  return {
    queues: q,
    pooled,
    per,
    splitAgents,
    splitFte,
    deltaAgents: splitAgents - pooled.raw,
    deltaFte: splitFte - pooled.sched,
    pooledOcc: pooled.occ,
    splitOcc: per.occ,
    pctPenalty: (splitFte / pooled.sched) - 1,
  };
}

/* Optional Erlang A reality-check (abandonment). */
function abandonmentCheck(N, A, ahtSec, patienceSec) {
  if (!patienceSec || patienceSec <= 0 || N <= A) return null;
  const C = erlangC(N, A);
  const drainRate = (N - A) / ahtSec;
  const theta = 1 / patienceSec;
  const pAbandonIfDelayed = theta / (theta + drainRate);
  return { estAband: C * pAbandonIfDelayed };
}

/* A solve that exhausted its step budget has not met the target. The figures it
   returns sit below what the target needs, so the tool says so in the read, the
   report and the confidence grade. Measured unreachable across 5,184 inputs and at
   five million contacts per interval; the disclosure exists so it can never be silent. */
function solveNotice(r, slTargetFrac) {
  if (r.met !== false) return null;
  return `Service level target unreachable within the search. The search stopped at ${r.raw} base agents, with service level at ${fmtSL(r.sl)} against a ${Math.round(slTargetFrac * 100)}% target. Read every headcount and cost figure here as a floor: this target needs more.`;
}

/* The insight layer: turn the raw metrics into the one or two things an operator
   actually needs to read: the tension between SLA aggressiveness, occupancy, and
   over/under-service. Priority-ordered; the UI takes the top two. This is the
   "synthesis, not metric-dump" pattern other tools adopt where their data supports it. */
function buildInsights(r, slTargetFrac, slSec, occInfo, capOn, capPct, pair, valid, recoveryAnnual, cost, pool) {
  const out = [];
  const slPct = r.sl * 100, targetPct = slTargetFrac * 100, overBy = slPct - targetPct, occPct = r.occ * 100;
  const looseOcc = r.occ < BENCH.occupancy.targetLow;
  const aggressive = slTargetFrac >= benchmark("staffing.read.premiumSl") || slSec <= benchmark("staffing.read.premiumSec");
  const band = `${Math.round(BENCH.occupancy.targetLow * 100)} to ${Math.round(BENCH.occupancy.targetHigh * 100)}%`;

  /* Model validity outranks every reading, because if the model does not apply
     nothing below it is worth saying. */
  if (valid && !valid.ok) out.push(valid.msg);
  const unmet = solveNotice(r, slTargetFrac);
  if (unmet) out.push(unmet);

  /* The cap is doing the work: that is specific and the user chose it. */
  if (capOn && r.capped)
    out.push(`Your ${capPct}% occupancy ceiling is setting headcount here. The service level target alone would be met with fewer agents. The extra agents buy recovery time between contacts.`);

  /* Situation-specific readings rank ahead of the structural one. */
  if (overBy >= benchmark("staffing.read.overServePts")) {
    let t = `You are delivering ${fmtSL(r.sl)} against your ${targetPct.toFixed(0)}% target. ${r.raw} agents is the smallest whole number that meets it, so service runs ${Math.round(overBy)} points above target.`;
    if (looseOcc) t += ` Occupancy is ${occPct.toFixed(1)}%, below the ${band} band, which confirms you are staffed ahead of your own target.`;
    t += ` If ${targetPct.toFixed(0)}% is firm, this is correct. If it is a goal you could relax, a slightly lower target or a longer answer threshold frees capacity.`;
    out.push(t);
  }

  if (aggressive)
    out.push(`A ${targetPct.toFixed(0)}% in ${slSec}s target is premium service: ASA (average speed of answer) is ${fmtASA(r.asa)}, and ${fmtPW(r.pw)} of callers wait at all. That speed is paid for in extra agents. SQM Group calls 80% in 20 seconds the traditional standard.`);

  if (looseOcc && overBy < benchmark("staffing.read.overServePts"))
    out.push(`Occupancy at ${occPct.toFixed(1)}% sits below the ${band} band while service level is met. You have room to absorb growth, or to run leaner if cost comes first.`);

  /* The structural fact, stated once and priced rather than alarmed. Erlang C
     staffed to service level lands above the sustainable band at almost any real
     volume, so the useful output is the size of the trade-off, not a warning. */
  if (!capOn && pair && pair.sustainable)
    out.push(`Staffing to your service level alone puts occupancy (the share of paid queue time agents spend handling contacts) at ${occPct.toFixed(1)}%, above the ${band} band. Erlang C often lands there at this volume; it does not point to an error in your inputs. Occupancy is the constraint to manage here, since the service level target is already met. Holding an ${Math.round(pair.ceiling * 100)}% ceiling instead would take ${pair.sustainable.sched} FTE against ${r.sched}. The ${pair.deltaFte} FTE difference is the price of agent recovery time, about ${fmtMoney(recoveryAnnual)} a year on ${cost.sourced ? "your own cost base" : "benchmark wages"}.`);

  if (pool && pool.pctPenalty >= benchmark("staffing.read.poolPenalty"))
    out.push(`This volume is split across ${pool.queues} queues, which takes ${pool.deltaFte} more FTE than one pooled queue would: roughly ${Math.round(pool.pctPenalty * 100)}% more headcount for the same volume and the same service. The split comes from routing, so routing is where to fix it. Read the figure as an upper bound, because overflow rules and cross-trained agents recover part of it.`);

  if (out.length === 0)
    out.push(`Occupancy of ${occPct.toFixed(1)}% and service level of ${fmtSL(r.sl)} are both in healthy ranges. The plan is balanced, with room to flex.`);

  return out;
}

/* Input domain. Tracker item: input guard and disclosure layer.
   A scenario link rehydrates straight into state and validates nothing, so no input
   can be trusted to hold a value the Erlang arithmetic can use. Every numeric field
   the form offers has one row: [key, form label, min, max, display unit].
   Rationale for the bounds, stated once. These are domain limits, where the model
   stops producing a physically possible answer. Plausibility belongs to the model
   validity check and the shrinkage classification, which flag and never correct.
   Volume, answer threshold and patience cannot be negative. Measured on the shipped
   engine, a negative volume alone returned minus 51 base agents at 157 percent
   occupancy, and a negative handle time returned a service level of 720,237 percent.
   Handle time floors at one second: it divides the service level exponent, and at
   zero with a zero answer threshold that exponent is undefined and prints NaN.
   Interval floors at one minute: offered load divides by it, and an interval near zero
   was measured at six seconds per Erlang solve, seven solves a render. Any interval
   shorter than three times handle time is already declared void by modelValidity.
   Service level target is 0 to 99. A target of 100 has no answer in this model:
   the probability of wait is positive at every finite headcount, so service level
   approaches 100 and never reaches it. The shipped engine returned one anyway. At
   the default scenario the residual underflowed the double at 160 base agents, the
   comparison sl >= 1 read true on rounding alone, met stayed true, no correction was
   recorded, and the tool reported 229 FTE at full confidence against the 126 FTE an
   80 percent target needs. That figure was set by IEEE 754, not by queueing theory.
   99 is the ceiling, thirteen orders of magnitude clear of the underflow floor, and
   the form carries the reason at the point of entry. Shrinkage is 0 to 99: scheduled FTE divides by
   one minus shrinkage, so 100 is a pole and anything above it inverts the sign.
   The occupancy ceiling is 1 to 100 and is only read while the cap is on, because a
   ceiling of zero cannot be met by any offered load. Queues floor at one.
   The rendered gate asserts every form field has a row and that no row is narrower
   than the form, so the guard can never correct a value the form accepts. */
const STAFFING_DOMAIN = [
  ["vol", "Voice contacts per interval", 0, null, ""],
  ["aht", "Average Handle Time", 1, null, "s"],
  ["intv", "Interval length", 1, null, "m"],
  ["slT", "Service Level Target", 0, 99, "%"],
  ["slS", "Answer Threshold", 0, null, "s"],
  ["shrink", "Total Shrinkage", 0, 99, "%"],
  ["capPct", "Occupancy ceiling", 1, 100, "%"],
  ["queues", "Queues or skills this volume splits across", 1, null, ""],
  ["patience", "Avg caller patience (optional)", 0, null, "s"],
];

/* Clamp at the engine boundary and record every correction. Nothing is absorbed. */
function guardStaffing(stIn) {
  const { guards, guard } = createGuards();
  const st = { ...stIn };
  for (const [key, label, min, max, unit] of STAFFING_DOMAIN) {
    if (key === "capPct" && !stIn.capOn) continue;
    st[key] = guard(label, stIn[key], min, max, unit);
  }
  return { st, guards };
}

/* CONFIDENCE. Two applicable axes through confidence.js, and the report says which
   bound it. No grade ladder lives in this file.

   Evidence has two streams, and the weaker binds.
   Operating inputs: volume, handle time and shrinkage drive every headcount and cost
   figure. A driver still at the selected operating profile is a tool default whatever
   else is true, so it grades Directional. Entered figures stand at Planning-grade at
   most: this tool has no document attestation path, and Finance-grade needs one.
   Cost basis: the benchmark wage is a market figure for the occupation and none of the
   user's own, so it grades Directional. A rail value confers consistency, and evidence
   only as far as the origin grade its publisher recorded, capped by railEvidence. The
   rail carries no origin grade today, so a rail basis grades Directional until TCO
   publishes one. That closed the defect this landing found: TCO publishes its shipped
   $19 wage at its own defaults, and Staffing graded that Planning-grade.

   Completeness holds Directional on a corrected input, an unmet solve, or an interval
   under the Erlang C validity floor. The last was the second defect: the tool said the
   model understated staffing and still exported Planning-grade.

   Realization is not applicable, with the reason stated.

   Invariants void the export. Each is unreachable through the guards and the solver,
   and the harness proves it. If one fails, the arithmetic contradicts itself and no
   figure in the document can be trusted, so the report is voided and graded nowhere. */
/* Display names for the tools whose values Staffing reads. */
const RAIL_TOOL_NAMES = { "aht-decomposition": "AHT Decomposition", "shrinkage-planner": "Shrinkage Planner", "occupancy-risk": "Occupancy Risk Simulator", "tco-calculator": "TCO Calculator", "cost-per-contact": "Cost per Contact Calculator", "business-case-builder": "Business Case Builder" };

const STAFFING_NA = "This tool prices the headcount a service level needs, which is a cost. It credits no freed capacity, so there is no conversion to cash to grade.";

/* pulled: handle time or shrinkage another tool published, as { value, origin, tool }. While
   the field still holds the pulled value, that driver grades by the publisher's origin
   through railEvidence, never higher, and is not compared with the operating profile. An
   edit makes it the user's own entry again. */
function gradeStaffing({ r, guards, valid, cost, shipped, vol, aht, shrink, railOrigin, pulled = {} }) {
  const invariants = [];
  if (![r.raw, r.sched, r.sl, r.occ, r.asa, r.pw, cost.annual].every(Number.isFinite)) invariants.push("an output is not a finite number");
  if (r.sched < r.raw) invariants.push("scheduled FTE is below base agents");
  if (r.occ < 0 || r.occ > 1) invariants.push("occupancy is outside 0 to 100 percent");
  if (r.sl < 0 || r.sl > 1) invariants.push("service level is outside 0 to 100 percent");
  if (cost.annual < 0) invariants.push("annual cost is below zero");

  const fromRail = {
    aht: pulled.aht && pulled.aht.value === aht ? pulled.aht : null,
    shrink: pulled.shrink && pulled.shrink.value === shrink ? pulled.shrink : null,
  };
  const defaultDrivers = [
    ...(vol === shipped.volume ? ["contact volume"] : []),
    ...(!fromRail.aht && aht === shipped.aht ? ["handle time"] : []),
    ...(!fromRail.shrink && shrink === Math.round(shipped.shrink * 100) ? ["shrinkage"] : []),
  ];
  const railDrivers = [["handle time", fromRail.aht], ["shrinkage", fromRail.shrink]].filter(([, x]) => x);
  const opsGrade = railDrivers.reduce((g, [, x]) => weakerStream(g, railEvidence(x.origin)), defaultDrivers.length ? "Directional" : "Planning-grade");
  const costGrade = cost.sourced ? railEvidence(railOrigin) : "Directional";
  const evidence = weakerStream(opsGrade, costGrade);
  const railWhy = railDrivers.map(([name, x]) => `${name} came from ${x.toolName} ${x.origin ? `with an origin grade of ${x.origin}` : "with no recorded origin grade"}, and grades no higher than that`).join("; ");
  const opsWhy = [
    defaultDrivers.length
      ? `${defaultDrivers.length} driver${defaultDrivers.length > 1 ? "s are" : " is"} still at the ${shipped.label} operating profile (${defaultDrivers.join(", ")}). Enter your own figures to lift this stream`
      : railDrivers.length ? "" : "Volume, handle time and shrinkage are your own entries. This tool has no document attestation path, so they stand at Planning-grade at most",
    railWhy,
  ].filter(Boolean).join(". ");
  const costWhy = cost.sourced
    ? `The cost basis arrived over the rail ${railOrigin ? `with an origin grade of ${railOrigin}` : "with no recorded origin grade"}. A rail value confers consistency, and evidence only as far as its origin`
    : `The cost basis is the BLS national median wage of $${BENCHMARK_HOURLY} an hour, loaded at ${FULL_LOAD_MULTIPLE}x. It is a market figure for the occupation and none of your own`;
  const evParts = [...(opsGrade === evidence ? [opsWhy] : []), ...(costGrade === evidence ? [costWhy] : [])];

  const blockers = [];
  if (guards.length) blockers.push(`${guards.length} input${guards.length > 1 ? "s were" : " was"} outside the possible range and corrected before calculation`);
  if (!valid.ok) blockers.push(`the interval is ${valid.ratio.toFixed(1)} times AHT, under the ${VALID_RATIO} times Erlang C needs, so the model understates staffing`);
  if (r.met === false) blockers.push("the service level target was not reached within the search, so every figure is a floor");
  const completeness = blockers.length ? "Directional" : "Finance-grade";
  const modelWhy = blockers.length ? blockers.join("; ")
    : `The model applies: the interval is at least ${VALID_RATIO} times AHT, the target was met, and no input was corrected`;

  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const voided = invariants.length > 0;
  const gradeObj = voided
    ? voidResult({
        invariant: invariants.join("; "),
        remedy: "Correct the inputs behind the failed check and re-run before citing any figure in this report.",
      })
    : emitGrades({
        evidence, realization: null, completeness, naReason: STAFFING_NA,
        reasons: { evidence: `${evParts.map(cap).join(". ")}.`, completeness: `${cap(modelWhy)}.` },
      });
  const confidence = voided ? "Void" : gradeObj.headline;
  return { gradeObj, confidence, voided, invariants, evidence, opsGrade, costGrade, completeness, defaultDrivers };
}

/* Operating profiles, read from the registry. Labelled heuristics there. */
const presetOf = (k, label) => ({
  label,
  volume: benchmark(`staffing.preset.${k}.vol`), aht: benchmark(`staffing.preset.${k}.aht`),
  slT: benchmark(`staffing.preset.${k}.slT`) / 100, slS: benchmark(`staffing.preset.${k}.slS`),
  shrink: benchmark(`staffing.preset.${k}.shrink`) / 100,
});
const PRESETS = {
  general: presetOf("general", "Cross-Industry"),
  financial: presetOf("financial", "Financial Services"),
  healthcare: presetOf("healthcare", "Healthcare"),
  retail: presetOf("retail", "Retail + eCommerce"),
  telecom: presetOf("telecom", "Telecom"),
  insurance: presetOf("insurance", "Insurance"),
  bpo: presetOf("bpo", "BPO / Outsourcer"),
};
const SPIKE = benchmark("staffing.stress.spike"), AHT_STEP = benchmark("staffing.stress.aht");
const SHRINK_STEP = benchmark("staffing.stress.shrinkPts"), SHRINK_CAP = benchmark("staffing.stress.shrinkCap");
const SL_STEP = benchmark("staffing.stress.slPts"), SL_EASE = benchmark("staffing.stress.slEase");

const fmtMoney = (v) => {
  const a = Math.abs(v);
  if (a >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (a >= 1e3) return `$${Math.round(v / 1e3)}K`;
  return `$${Math.round(v).toLocaleString()}`;
};
const fmtMS = (s) => `${Math.floor(s / 60)}m ${s % 60}s`;

const S = ({ label, value, sub }) => (
  <div style={{ background: HOUSE.navy, border: `1px solid ${hair}`, borderRadius: RADIUS.card, padding: "16px 16px" }}>
    <div style={kicker}>{label}</div>
    <div style={{ ...TYPE.statValue, fontSize: 26, color: HOUSE.mist, margin: "4px 0 2px" }}>{value}</div>
    {sub && <div style={small}>{sub}</div>}
  </div>
);
const hair = alpha(HOUSE.mist, LINE.hair), soft = alpha(HOUSE.mist, LINE.soft);
const kicker = { fontSize: 12, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: HOUSE.muted };
const h2 = { fontSize: 18, fontWeight: 600, lineHeight: 1.3, color: HOUSE.mist, margin: "0 0 8px" };
const body = { fontSize: 15, lineHeight: 1.6, color: HOUSE.body, margin: 0 };
const small = { fontSize: 13, lineHeight: 1.5, color: HOUSE.muted, margin: 0 };
const link = { color: PILLARS.diagnostics.onDark, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 };
const grid = (min) => ({ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(${min}px, 100%), 1fr))`, gap: 12 });
const panel = { background: HOUSE.navy, border: `1px solid ${hair}`, borderRadius: RADIUS.card, padding: 20 };
const rule = { height: 1, background: hair, margin: "16px 0" };

export default function StaffingCalculator() {
  const [preset, setPreset] = useState("general");
  const [volIn, setVol] = useState(DEFAULTS.vol), [ahtIn, setAht] = useState(DEFAULTS.aht), [slTIn, setSlT] = useState(DEFAULTS.slT);
  const [slSIn, setSlS] = useState(DEFAULTS.slS), [shrinkIn, setShrink] = useState(DEFAULTS.shrink), [intvIn, setIntv] = useState(DEFAULTS.intv);
  const [patienceIn, setPatience] = useState(DEFAULTS.patience);
  const [queuesIn, setQueues] = useState(DEFAULTS.queues);
  const [capOn, setCapOn] = useState(DEFAULTS.capOn), [capPctIn, setCapPct] = useState(DEFAULTS.capPct);
  const [showBench, setShowBench] = useState(false);
  /* Handle time, shrinkage and the occupancy ceiling another tool published this session,
     read once at mount. Each keeps its producer and origin grade for the grade and the label. */
  const [pulled, setPulled] = useState({});


  useEffect(() => { window.scrollTo(0, 0); }, []);

  /* A scenario link is a deliberate act and outranks both the stored preset and the rail:
     its values are entered values (D13), so nothing is pulled when one opens. Without one,
     handle time, shrinkage and the occupancy ceiling come from the tool that last produced
     them this session. Keys stay as string literals so rail-audit.mjs sees every pull. */
  useEffect(() => {
    const sc = readScenario(TOOL_ID, DEFAULTS);
    if (sc) {
      setVol(sc.vol); setAht(sc.aht); setSlT(sc.slT); setSlS(sc.slS);
      setShrink(sc.shrink); setIntv(sc.intv); setPatience(sc.patience);
      setCapOn(sc.capOn); setCapPct(sc.capPct); setQueues(sc.queues); setPreset(sc.preset);
      clearScenarioParam();
      return;
    }
    const from = (res) => ({ origin: res.railOrigin || null, tool: res.sourceTool || null, toolName: RAIL_TOOL_NAMES[res.sourceTool] || res.sourceTool || "another tool" });
    const next = {};
    const ahtRes = getExternalWithSource("aht", "staffing-calculator");
    if (ahtRes && Number.isFinite(ahtRes.value) && ahtRes.value > 0) { next.aht = { value: +Number(ahtRes.value).toFixed(2), ...from(ahtRes) }; setAht(next.aht.value); }
    const shrinkRes = getExternalWithSource("shrinkage", "staffing-calculator");
    if (shrinkRes && Number.isFinite(shrinkRes.value) && shrinkRes.value >= 0 && shrinkRes.value < 1) { next.shrink = { value: +(shrinkRes.value * 100).toFixed(2), ...from(shrinkRes) }; setShrink(next.shrink.value); }
    const capRes = getExternalWithSource("occupancyCap", "staffing-calculator");
    if (capRes && Number.isFinite(capRes.value) && capRes.value > 0 && capRes.value <= 1) { next.capPct = { value: +(capRes.value * 100).toFixed(2), ...from(capRes) }; setCapOn(true); setCapPct(next.capPct.value); }
    if (Object.keys(next).length) setPulled(next);
  }, []);

  const apply = (k) => { const p = PRESETS[k]; setPreset(k); setVol(p.volume); setAht(p.aht); setSlT(Math.round(p.slT * 100)); setSlS(p.slS); setShrink(Math.round(p.shrink * 100)); };

  /* One object, matching DEFAULTS key for key, so scenarioLink diffs cleanly. It holds
     what was entered, so a shared link reproduces the same corrections disclosed. Every
     figure below reads the guarded values. */
  const st = { vol: volIn, aht: ahtIn, slT: slTIn, slS: slSIn, shrink: shrinkIn, intv: intvIn, patience: patienceIn, capOn, capPct: capPctIn, queues: queuesIn, preset };
  const { st: stG, guards } = guardStaffing(st);
  const { vol, aht, slT, slS, shrink, intv, patience, capPct, queues } = stG;

  const occCap = capOn ? capPct / 100 : null;
  const r = calc(vol, aht, intv, slT / 100, slS, shrink / 100, occCap);
  /* Keys stay as string literals so rail-audit.mjs sees every pull. */
  const perAgentRes = getExternalWithSource("tcoPerAgentMonth", "staffing-calculator");
  const hourlyRes = getExternalWithSource("agentHourly", "staffing-calculator");
  const railPerAgent = (perAgentRes && perAgentRes.value) || 0;
  const railHourly = (hourlyRes && hourlyRes.value) || 0;
  /* One key feeds the basis, in the same order staffingCost prefers them. The cost stream
     grades off that key's origin, not off a blanket assumption about the rail. */
  const costOrigin = railPerAgent > 0 ? (perAgentRes && perAgentRes.railOrigin) || null
    : railHourly > 0 ? (hourlyRes && hourlyRes.railOrigin) || null : null;
  const valid = modelValidity(aht, intv);
  const occInfo = classifyOccupancy(r.occ);
  const shrinkInfo = classifyShrinkage(shrink / 100);
  const asaD = fmtASA(r.asa);

  // Does the live input set still match the selected preset? If not, label "Custom".
  const p = PRESETS[preset];
  const isCustom = !p || vol !== p.volume || aht !== p.aht || slT !== Math.round(p.slT * 100) || slS !== p.slS || shrink !== Math.round(p.shrink * 100);
  const presetLabel = isCustom ? "Custom" : p.label;

  const aband = abandonmentCheck(r.raw, r.A, aht, patience);
  const adjR = aband ? calc(Math.max(1, Math.round(vol * (1 - aband.estAband))), aht, intv, slT / 100, slS, shrink / 100, occCap) : null;
  // Show abandonment only when it's actually actionable: a real agent difference AND
  // either material abandonment (>=5%) or a 2+ agent saving. Hides trivial 1-agent/1% cases.
  const abandMeaningful = aband && adjR && (r.raw - adjR.raw) >= 1 && (aband.estAband >= benchmark("staffing.aband.material") || (r.raw - adjR.raw) >= benchmark("staffing.aband.agents"));

  const pair = sustainablePair(vol, aht, intv, slT / 100, slS, shrink / 100, BENCH.occupancy.targetHigh);

  const pool = poolingPenalty(vol, aht, intv, slT / 100, slS, shrink / 100, occCap, queues);
  const cost = staffingCost(r.sched, railPerAgent, railHourly);
  /* railOrigin is the origin grade the publisher recorded for the key behind the cost
     basis. Null when nothing came over the rail, which grades the stream Directional. */
  const graded = gradeStaffing({ r, guards, valid, cost, shipped: p || PRESETS.general, vol, aht, shrink, railOrigin: costOrigin, pulled });
  /* A field shows where its value came from while it still holds the pulled value. */
  const pulledNote = (key, val) => (pulled[key] && pulled[key].value === val ? `From ${pulled[key].toolName}${pulled[key].origin ? `, ${pulled[key].origin}` : ""}. Edit to use your own figure` : null);
  const ahtFrom = pulledNote("aht", aht), shrinkFrom = pulledNote("shrink", shrink), capFrom = capOn ? pulledNote("capPct", capPct) : null;
  const { gradeObj, confidence } = graded;
  const costCeiling = pair.sustainable ? staffingCost(pair.sustainable.sched, railPerAgent, railHourly) : null;
  const recoveryAnnual = costCeiling ? costCeiling.annual - cost.annual : 0;
  const poolAnnual = pool ? staffingCost(pool.splitFte, railPerAgent, railHourly).annual - staffingCost(pool.pooled.sched, railPerAgent, railHourly).annual : 0;
  const insights = buildInsights(r, slT / 100, slS, occInfo, capOn, capPct, pair, valid, recoveryAnnual, cost, pool);

  const spike = calc(Math.round(vol * SPIKE), aht, intv, slT / 100, slS, shrink / 100, occCap);
  const ahtUp = calc(vol, Math.round(aht * (1 + AHT_STEP)), intv, slT / 100, slS, shrink / 100, occCap);
  const ahtDown = calc(vol, Math.round(aht * (1 - AHT_STEP)), intv, slT / 100, slS, shrink / 100, occCap);

  useEffect(() => {
    {
      const published = {
      volume: vol, intervalMin: intv, aht, shrinkage: shrink / 100,
      serviceLevelTarget: slT / 100, serviceLevel: r.sl, asa: r.asa,
      /* A service level above the reporting ceiling is not certainty. The flag
         travels with the figure so a consumer never reads 1 as "every caller
         answered in time". Same contract as occupancyCapped and modelValid. */
      serviceLevelFloored: r.sl > SL_CEILING || undefined,
      trafficIntensity: +r.A.toFixed(2), baseAgents: r.raw, fte: r.sched,
      occupancy: +r.occ.toFixed(4), probabilityOfWait: +r.pw.toFixed(4),
      occupancyCap: occCap || undefined, occupancyCapped: r.capped || undefined,
      patienceSec: patience || undefined,
      estAbandonment: abandMeaningful ? +(aband.estAband).toFixed(4) : undefined,
      queues,
      poolingPenaltyFte: pool ? pool.deltaFte : undefined,
      poolingPenaltyAnnual: pool ? Math.round(poolAnnual) : undefined,
      annualStaffingCost: Math.round(cost.annual),
      staffingCostBasisSourced: cost.sourced,
      recoveryTimeAnnualCost: costCeiling ? Math.round(recoveryAnnual) : undefined,
      sustainableFte: pair.sustainable ? pair.sustainable.sched : undefined,
      sustainableCeiling: pair.sustainable ? pair.ceiling : undefined,
      recoveryTimeFteCost: pair.sustainable ? pair.deltaFte : undefined,
      modelValid: valid.ok, intervalToAhtRatio: +valid.ratio.toFixed(2),
    };
      publishToolResult("staffing-calculator", published, originsFor(gradeObj, published));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vol, intv, aht, shrink, slT, slS, patience, capOn, capPct]);


  const occSub = r.capped ? `Held under your ${capPct}% cap. ${occInfo.message}` : occInfo.message;

  const stamp = methodStamp(TOOL_ID);
  const { how, voidReason } = resultHow(gradeObj);
  const result = (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Result label="Scheduled FTE" value={voidReason ? null : r.sched} format={(v) => String(v)}
        change={voidReason ? null : `${r.raw} on the phones, ${(r.occ * 100).toFixed(1)}% occupancy, ${fmtSL(r.sl)} answered in ${slS}s`}
        how={how} voidReason={voidReason} />
      {!voidReason && (
        <div style={panel}>
          <span style={kicker}>Annual cost of this plan</span>
          <div style={{ ...TYPE.statValueLg, fontSize: 29, color: HOUSE.mist, marginTop: 4 }}>{fmtMoney(cost.annual)}</div>
          <p style={{ ...small, marginTop: 4 }}>{r.sched} FTE at {fmtMoney(cost.perAgentMonth)} per agent per month. Based on {cost.basis}.{!cost.sourced && " Run the TCO Calculator (total cost of ownership) to price this on your own cost base."}</p>
        </div>
      )}
    </div>
  );

  return (
    <ToolFrame toolId={TOOL_ID} section="Operations + Workforce" name="Staffing Calculator" title="How many agents does your service level take?"
      lede="Turns your volume, handle time, service level target and shrinkage into the FTE (full-time equivalent agents) you need to schedule, using Erlang C, the standard queueing model for staffing. Erlang C assumes one contact per agent at a time, so it fits voice queues."
      method={stamp ? { version: stamp.version, date: stamp.text.replace(/^Method [^,]+, published /, ""), href: stamp.href } : null}
      result={result} pinned={voidReason ? null : { label: "Scheduled FTE", value: String(r.sched) }}>
      <style>{`${FONT_IMPORT_CSS}.stf-sel option{background:${HOUSE.navy};color:${HOUSE.mist}}`}</style>

      <fieldset style={{ ...panel, margin: 0 }}>
        <legend style={{ ...kicker, padding: "0 6px" }}>Question 1 of 3 · Your queue</legend>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          <label htmlFor="stf-preset" style={{ fontSize: 14, fontWeight: 600, color: HOUSE.mist }}>Start from</label>
          <select id="stf-preset" aria-label="Industry preset" value={preset} onChange={e => apply(e.target.value)} className="stf-sel" style={{ minHeight: TOUCH, padding: "0 12px", fontFamily: FONT, fontSize: 15, fontWeight: 600, border: `1px solid ${alpha(HOUSE.mist, LINE.firm)}`, borderRadius: RADIUS.field, background: HOUSE.navy, color: HOUSE.mist, cursor: "pointer" }}>
            {Object.entries(PRESETS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          {isCustom && <span style={{ ...small, fontWeight: 600, color: HOUSE.mist, border: `1px dashed ${soft}`, borderRadius: RADIUS.chip, padding: "2px 8px" }}>Custom</span>}
        </div>
        <div style={grid(200)}>
          <NumField tone="dark" label="Voice contacts per interval" value={vol} onChange={setVol} hint="Inbound calls arriving in one interval. Voice only; the methodology note below explains why." min={1} />
          <NumField tone="dark" label="Average Handle Time" value={aht} onChange={setAht} hint={ahtFrom || `${fmtMS(aht)}: talk, hold and after-call work (ACW)`} suffix="sec" min={1} pulled={!!ahtFrom} />
          <NumField tone="dark" label="Interval length" value={intv} onChange={setIntv} suffix="min" min={5} max={240} step={5} hint="Erlang C needs an interval of about three times AHT or longer." />
        </div>
        <p style={{ ...small, marginTop: 12 }}>Traffic intensity: <strong style={{ color: HOUSE.mist, ...NUM }}>{r.A.toFixed(1)} Erlangs</strong></p>
      </fieldset>

      <fieldset style={{ ...panel, margin: 0 }}>
        <legend style={{ ...kicker, padding: "0 6px" }}>Question 2 of 3 · Your target</legend>
        <div style={grid(200)}>
          <NumField tone="dark" label="Service Level Target" value={slT} onChange={setSlT} hint="The ceiling is 99%. Erlang C has no answer at 100, because some callers wait at every headcount." suffix="%" min={1} max={99} />
          <NumField tone="dark" label="Answer Threshold" value={slS} onChange={setSlS} hint="Seconds within which a call counts as answered on time" suffix="sec" min={1} />
          <NumField tone="dark" label="Total Shrinkage" value={shrink} onChange={setShrink} hint={shrinkFrom || "Paid time away from the queue: breaks, training, PTO (paid time off), absence"} suffix="%" min={0} max={70} pulled={!!shrinkFrom} />
        </div>
        <div style={rule} />
        <label style={{ display: "flex", alignItems: "center", gap: 10, minHeight: TOUCH, cursor: "pointer" }}>
          <input type="checkbox" checked={capOn} onChange={e => setCapOn(e.target.checked)} style={{ width: 18, height: 18, accentColor: HOUSE.electric, cursor: "pointer" }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: HOUSE.mist }}>Cap occupancy, the share of time agents spend handling contacts</span>
        </label>
        {capOn && <div style={{ maxWidth: 320, marginTop: 8 }}><NumField tone="dark" label="Occupancy ceiling" value={capPct} onChange={setCapPct} hint={capFrom || "Adds agents so occupancy never goes above this"} suffix="%" min={50} max={100} pulled={!!capFrom} /></div>}
      </fieldset>

      <fieldset style={{ ...panel, margin: 0 }}>
        <legend style={{ ...kicker, padding: "0 6px" }}>Question 3 of 3 · Optional checks</legend>
        <div style={grid(220)}>
          <NumField tone="dark" label="Queues or skills this volume splits across" value={queues} onChange={setQueues} hint="One pooled queue needs the fewest agents. Enter how many separate queues actually carry this volume." min={1} max={40} />
          <NumField tone="dark" label="Avg caller patience (optional)" value={patience} onChange={setPatience} hint="Seconds before a caller hangs up. Zero turns the abandonment check off." suffix="sec" min={0} max={600} />
        </div>
      </fieldset>

      {guards.length > 0 && (
        <Finding level="critical" title="Inputs corrected before calculation">
          {guards.map((g, i) => (
            <span key={i} style={{ display: "block", marginTop: i ? 4 : 0 }}>{`${g.label}: you entered ${guardVal(g, "entered")}, which is outside the range this model can compute. Every figure below was computed at ${guardVal(g, "used")}. Correct the input; until then the result grades Directional.`}</span>
          ))}
        </Finding>
      )}
      {!valid.ok && <Finding level={valid.severity === "critical" ? "critical" : "high"} title="Model validity warning">{valid.msg}</Finding>}

      <div style={grid(170)}>
        <S label="Base Agents" value={r.raw} sub={r.capped ? "Cap-constrained, before shrinkage" : "On the phones, before shrinkage"} />
        <S label="Scheduled FTE" value={r.sched} sub={`With ${shrink}% shrinkage`} />
        <S label="Occupancy" value={`${(r.occ * 100).toFixed(1)}%`} sub={occSub} />
        <S label="Service Level" value={fmtSL(r.sl)} sub={`${r.sl >= slT / 100 ? "Meets" : "Misses"} target: ${slT}% in ${slS}s`} />
        <S label="Avg Speed of Answer" value={asaD} sub="Average wait before an agent answers" />
        <S label="Probability of wait" value={fmtPW(r.pw)} sub="Chance a caller waits" />
      </div>

      <section aria-label="What it means" style={{ ...panel, borderLeft: `3px solid ${PILLARS.diagnostics.fill}` }}>
        <span style={kicker}>What it means</span>
        {insights.slice(0, 2).map((t, i) => (
          <p key={i} style={{ ...body, margin: i ? "10px 0 0" : "8px 0 0" }}>{t}</p>
        ))}
      </section>

      <section aria-label="Occupancy risk" style={panel}>
        <h2 style={h2}>Occupancy risk · target {Math.round(BENCH.occupancy.targetLow * 100)} to {Math.round(BENCH.occupancy.targetHigh * 100)}%</h2>
        <div role="img" aria-label={`Occupancy ${(r.occ * 100).toFixed(1)}%, ${occInfo.label}`} style={{ position: "relative", height: 20, borderRadius: RADIUS.chip, overflow: "hidden", display: "flex", border: `1px solid ${hair}` }}>
          <div style={{ width: `${BENCH.occupancy.healthyMax * 100}%`, background: alpha(ARCS.evidence, 0.25) }} />
          <div style={{ width: `${(BENCH.occupancy.cautionMax - BENCH.occupancy.healthyMax) * 100}%`, background: alpha(ARCS.evidence, 0.5) }} />
          <div style={{ flex: 1, background: alpha(ARCS.evidence, 0.8) }} />
          <div style={{ position: "absolute", left: `${Math.min(r.occ * 100, 98)}%`, top: -1, width: 3, height: 22, background: HOUSE.mist, borderRadius: 2, transition: "left 0.3s" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginTop: 6, ...small }}>
          <span>0%</span><span>&lt;{Math.round(BENCH.occupancy.healthyMax * 100)}% healthy</span><span>{Math.round(BENCH.occupancy.healthyMax * 100)} to {Math.round(BENCH.occupancy.cautionMax * 100)}% caution</span><span>&gt;{Math.round(BENCH.occupancy.cautionMax * 100)}% critical</span>
        </div>
        <p style={{ ...small, marginTop: 10 }}>Occupancy steps down each time another agent is required, so it rises then drops as volume grows. Small teams swing more than large ones.</p>
        {!capOn && pair.sustainable && (
          <div style={{ ...grid(160), marginTop: 14 }}>
            <S label="Staffed to service level" value={`${r.sched} FTE`} sub={`${(r.occ * 100).toFixed(1)}% occupancy`} />
            <S label={`Staffed to a ${Math.round(pair.ceiling * 100)}% ceiling`} value={`${pair.sustainable.sched} FTE`} sub={`${(pair.sustainable.occ * 100).toFixed(1)}% occupancy`} />
            <S label="Difference" value={`+${pair.deltaFte} FTE`} sub={`${fmtMoney(recoveryAnnual)} a year, the price of recovery time`} />
          </div>
        )}
      </section>

      {pool && (
        <section aria-label="Queue fragmentation cost" style={panel}>
          <h2 style={h2}>Queue fragmentation cost <span style={{ ...small, fontWeight: 500 }}>· upper bound</span></h2>
          <p style={{ ...body, fontSize: 14, margin: "0 0 10px" }}>
            Queues get more efficient as they grow, so one pooled queue always needs fewer agents than the same volume split up. Across {pool.queues} queues this volume needs <strong style={{ color: HOUSE.mist, ...NUM }}>{pool.splitFte} FTE</strong> against <strong style={{ color: HOUSE.mist, ...NUM }}>{pool.pooled.sched} FTE</strong> pooled, a difference of {pool.deltaFte} FTE{poolAnnual > 0 ? <> or about <strong style={{ color: HOUSE.mist, ...NUM }}>{fmtMoney(poolAnnual)} a year</strong></> : null}. The extra agents come from how the volume is split, so routing is the fix.
          </p>
          <p style={small}>
            Read this as an upper bound. It assumes fully independent queues with no overflow and no cross-trained agents, and real routing recovers part of the loss. Splitting also lowers occupancy from {(pool.pooledOcc * 100).toFixed(1)}% to {(pool.splitOcc * 100).toFixed(1)}%, so if you already staff to an occupancy ceiling, part of this is spend you had planned anyway.
          </p>
        </section>
      )}

      {abandMeaningful && (
        <section aria-label="Abandonment reality check" style={panel}>
          <h2 style={h2}>Abandonment check <span style={{ ...small, fontWeight: 500 }}>· Erlang A estimate</span></h2>
          <p style={{ ...body, fontSize: 14, margin: "0 0 10px" }}>
            Erlang C assumes no one ever hangs up, so it over-staffs when callers abandon. At an average patience of {patience}s, roughly <strong style={{ color: HOUSE.mist }}>{(aband.estAband * 100).toFixed(1)}%</strong> of contacts would abandon under this staffing. Accounting for that, an estimated <strong style={{ color: HOUSE.mist }}>{adjR.raw} base agents</strong> ({adjR.sched} FTE) could hold target, about {r.raw - adjR.raw} fewer than Erlang C.
          </p>
          <p style={small}>This is a planning estimate. Keep the Erlang C figure ({r.raw}) as your baseline, the safer of the two, and read the adjusted figure as the lowest staffing that abandonment makes possible.</p>
        </section>
      )}

      <section aria-label="What-if scenarios" style={panel}>
        <h2 style={h2}>What-if scenarios {capOn && <span style={{ ...small, fontWeight: 500 }}>· each holds your {capPct}% cap</span>}</h2>
        <div style={grid(170)}>
          {[
            { label: `+${Math.round((SPIKE - 1) * 100)}% volume spike`, r2: spike },
            { label: `+${Math.round(AHT_STEP * 100)}% AHT increase`, r2: ahtUp },
            { label: `+${SHRINK_STEP}pt shrinkage`, r2: calc(vol, aht, intv, slT / 100, slS, Math.min((shrink + SHRINK_STEP) / 100, SHRINK_CAP / 100), occCap) },
            { label: slT >= SL_EASE ? `Ease SL to ${slT - SL_STEP}%` : `Raise SL to ${Math.min(slT + SL_STEP, 99)}%`,
              r2: calc(vol, aht, intv, (slT >= SL_EASE ? slT - SL_STEP : Math.min(slT + SL_STEP, 99)) / 100, slS, shrink / 100, occCap) },
          ].map((x, i) => (
            <S key={i} label={x.label} value={`${x.r2.sched} FTE`} sub={`${x.r2.sched - r.sched >= 0 ? "+" : ""}${x.r2.sched - r.sched} agents, ${(x.r2.occ * 100).toFixed(0)}% occupancy`} />
          ))}
        </div>
      </section>

      <section aria-label="Industry presets" style={panel}>
        <button type="button" aria-expanded={showBench} onClick={() => setShowBench(v => !v)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", minHeight: TOUCH, background: "transparent", border: "none", cursor: "pointer", padding: 0, fontFamily: FONT, color: HOUSE.mist }}>
          <span style={{ fontSize: 16, fontWeight: 600 }}>What each preset assumes</span>
          <span aria-hidden="true" style={{ fontSize: 18, color: HOUSE.muted }}>{showBench ? "-" : "+"}</span>
        </button>
        {showBench && (
          <div role="region" aria-label="Staffing table, scrolls sideways" tabIndex={0} style={{ marginTop: 12, overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: HOUSE.body, ...NUM }}>
              <thead><tr style={{ textAlign: "left", ...kicker }}>
                <th style={{ padding: "6px 8px 6px 0" }}>Industry</th><th style={{ padding: 6 }}>AHT</th><th style={{ padding: 6 }}>Shrinkage</th><th style={{ padding: 6 }}>SL Target</th><th style={{ padding: 6 }}>Calls per agent hour*</th>
              </tr></thead>
              <tbody>
                {Object.values(PRESETS).map((pp, i) => (
                  <tr key={i} style={{ borderTop: `1px solid ${hair}` }}>
                    <td style={{ padding: "8px 8px 8px 0", fontWeight: 600, color: HOUSE.mist }}>{pp.label}</td>
                    <td style={{ padding: 8 }}>{fmtMS(pp.aht)}</td>
                    <td style={{ padding: 8 }}>{Math.round(pp.shrink * 100)}%</td>
                    <td style={{ padding: 8 }}>{Math.round(pp.slT * 100)}% / {pp.slS}s</td>
                    <td style={{ padding: 8, ...NUM }}>{(0.85 * 3600 / pp.aht).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ ...small, marginTop: 8 }}>*Calls one agent can handle in an hour at 85% occupancy: 0.85 × 3600 ÷ AHT. These are starting points from our presets; your own data will differ with call complexity, training and tools.</p>
          </div>
        )}
      </section>

      <section aria-label="Methodology" style={panel}>
        <span style={kicker}>Methodology</span>
        <p style={{ ...body, fontSize: 14, marginTop: 8 }}>Erlang C is the standard queueing model for staffing. We solve it through the Erlang B recursion, which stays accurate from a handful of agents to several thousand. It assumes calls arrive at random (Poisson arrivals), handle times vary exponentially and callers never hang up, so it tends to over-staff. Enter an average patience to see the estimate adjusted for abandonment. The optional occupancy cap staffs to whichever is higher: the agents that meet service level, or the agents that hold occupancy at or below your ceiling. Shrinkage is applied after the agent calculation to turn base agents into scheduled FTE. Erlang C assumes one contact per agent at a time. Chat, messaging and email agents run several sessions at once, so applying these numbers to a digital queue overstates headcount, often by half or more. Every formula, constant and a worked example are in the <a href="/methodology/staffing-calculator" style={link}>published method</a>.</p>
      </section>

      <HowOthersReport toolId={TOOL_ID} />
      {/* The report is paper (Brand Guide section 13). */}
      <div style={{ background: HOUSE.paper, color: HOUSE.paperInk, borderRadius: RADIUS.card, padding: "8px 20px 20px" }}>
              <ReportActions
                toolId={TOOL_ID}
                toolName="Staffing Requirement Calculator"
                subtitle={`${r.sched} FTE at ${(r.occ * 100).toFixed(1)}% occupancy, ${fmtMoney(cost.annual)} a year, ${isVoid(gradeObj) ? "EXPORT VOID, integrity invariant failed" : `${confidence}, bound by ${gradeObj.boundBy}`}`}
                routePath={ROUTE}
                state={st}
                defaults={DEFAULTS}
                grades={gradeObj}
                summary={[
                  { label: "Base agents required", value: r.raw },
                  { label: "Scheduled FTE", value: r.sched },
                  { label: "Occupancy", value: `${(r.occ * 100).toFixed(1)}%` },
                  { label: "Service level achieved", value: `${fmtSL(r.sl)} vs ${slT}% in ${slS}s target` },
                  { label: "Annual cost of this plan", value: fmtMoney(cost.annual) },
                  { label: "Cost basis", value: cost.sourced ? "your figures, from another tool" : "benchmark median" },
                  ...(pair.sustainable ? [
                    { label: "FTE at a sustainable ceiling", value: pair.sustainable.sched },
                    { label: "Cost of recovery time", value: `${pair.deltaFte} FTE, ${fmtMoney(recoveryAnnual)} a year` },
                  ] : []),
                  ...(abandMeaningful ? [{ label: "Estimated abandonment", value: `${(aband.estAband * 100).toFixed(1)}%` }] : []),
                ]}
                signals={{
                  /* Derived signals only. No contact volume, AHT, wage, or company detail
                     leaves this block. Bands and booleans carry the commercial meaning;
                     the raw operating data stays in the browser and in the downloaded report. */
                  methodology_version: METHODOLOGY_VERSION,
                  /* Tracker 1-15. Ratio is occupancy pressure above the sustainable band:
                     the unmanaged occupancy less the 87% top of the ratified target band,
                     over the distance from that top to physical saturation at 100%. Both
                     ends of the span are given rather than chosen. 87% is canon in
                     benchmarks.js and 100% is the ceiling occupancy cannot pass.
                     Read from pair.sla.occ, the occupancy this operation would run at with
                     no cap applied, and not from r.occ. Setting an occupancy cap holds the
                     reported figure under the cap and moves the pressure into required
                     headcount, so an r.occ basis would fall when the user chose to buy the
                     pressure down rather than when the pressure eased.
                     Rejected: valid.ok, the prior basis. Erlang C model validity is input
                     hygiene, it is already published in full as model_valid on this same
                     block, and reading it here meant this property carried no information
                     the wire did not already have.
                     Rejected: occInfo.band, also already published as occupancy_band, and
                     three-valued, so it cannot fill five bands without inventing two.
                     Rejected: pair.deltaFte, the agents needed to buy the pressure down. It
                     is unbounded above and scales with the operation, so a 2,000 agent and
                     a 30 agent operation under identical pressure would land in different
                     bands.
                     Rejected: cautionMax at 90% as the floor of the span, which would let
                     none swallow the caution band this tool already calls workable but
                     fragile.
                     Declared unreachable: nothing. Measured across 40,000 queues, small
                     queues and premium service targets reach none, large efficient queues
                     reach severe, and all five bands are populated. Nothing is published
                     when unmanaged occupancy is zero. */
                  severity: severityBucket(pair.sla.occ > 0 ? Math.max(0, Math.min(1, (pair.sla.occ - BENCH.occupancy.targetHigh) / (1 - BENCH.occupancy.targetHigh))) : null),
                  model_valid: valid.ok,
                  has_real_cost_basis: cost.sourced,
                  priced_recovery_tradeoff: !!pair.sustainable,
                  ran_abandonment_check: !!abandMeaningful,
                  set_occupancy_ceiling: capOn,
                  fragmented_routing: !!pool,
                  queue_count_band: queues >= benchmark("staffing.band.queuesHigh") ? "high" : queues >= benchmark("staffing.band.queuesMid") ? "mid" : "low",
                  overrode_defaults: isCustom,
                  occupancy_band: occInfo.band,
                  shrinkage_elevated: shrinkInfo.elevated,
                  premium_service_target: slT / 100 >= benchmark("staffing.read.premiumSl") || slS <= benchmark("staffing.read.premiumSec"),
                  scale_band: r.sched >= benchmark("staffing.band.scaleVeryLarge") ? "very_large" : r.sched >= benchmark("staffing.band.scaleLarge") ? "large" : r.sched >= benchmark("staffing.band.scaleMid") ? "mid" : "small",
                  confidence_class: confidence,
                  default_drivers: graded.defaultDrivers.length,
                  inputs_corrected: guards.length,
                  decision_ready_signal: cost.sourced && valid.ok && r.met !== false && !!pair.sustainable && guards.length === 0,
                }}
                sections={[
                  ...(guards.length ? [{ title: "⚠ Inputs Corrected Before Calculation", type: "findings", items: guards.map(guardLine) }] : []),
                  { title: "Input Parameters", type: "table", rows: [
                    ["Voice Contacts per Interval", vol.toString()],
                    ["Interval Length", `${intv} minutes`],
                    ["Average Handle Time", `${fmtMS(aht)} (${aht}s)${ahtFrom ? `, from ${pulled.aht.toolName}` : ""}`],
                    ["Service Level Target", `${slT}% in ${slS} seconds`],
                    ["Total Shrinkage", `${shrink}%${shrinkFrom ? `, from ${pulled.shrink.toolName}` : ""}`],
                    ...(capOn ? [["Max Occupancy Cap", `${capPct}%`]] : []),
                    ...(patience ? [["Avg Caller Patience", `${patience}s (Erlang A check on)`]] : []),
                    ["Traffic Intensity", `${r.A.toFixed(1)} Erlangs`],
                    ["Cost basis", cost.basis.charAt(0).toUpperCase() + cost.basis.slice(1)],
                    ["Queues this volume splits across", String(queues)],
                    ["Industry Preset", presetLabel],
                  ]},
                  { title: "Staffing Results", type: "metrics", items: [
                    { label: "Base Agents Required", value: r.raw.toString(), color: ELECTRIC, sub: r.capped ? "Cap-constrained" : "Before shrinkage" },
                    { label: "Scheduled FTE", value: r.sched.toString(), color: NAVY, sub: `With ${shrink}% shrinkage` },
                    { label: "Occupancy", value: `${(r.occ * 100).toFixed(1)}%`, color: occInfo.color, sub: r.capped ? `Held under ${capPct}% cap` : occInfo.label },
                    { label: "Service Level", value: fmtSL(r.sl), color: r.sl >= slT / 100 ? GREEN : RED },
                    { label: "Avg Speed of Answer", value: asaD, color: ELECTRIC },
                    { label: "Probability of Wait", value: fmtPW(r.pw), color: MUTED },
                    { label: "Annual Cost of This Plan", value: fmtMoney(cost.annual), color: NAVY, sub: confidence },
                  ]},
                  { title: "Key Findings", type: "findings", items: [
                    ...(!valid.ok ? [valid.msg] : []),
                    ...(solveNotice(r, slT / 100) ? [solveNotice(r, slT / 100)] : []),
                    `At ${vol} contacts per ${intv}-minute interval with ${fmtMS(aht)} AHT, you need ${r.raw} agents on the phones to meet a service level of ${slT}% in ${slS} seconds${r.capped ? ` while holding occupancy under your ${capPct}% cap` : ""}.`,
                    `After applying ${shrink}% shrinkage, that becomes ${r.sched} scheduled FTE, about ${fmtMoney(cost.annual)} a year at ${fmtMoney(cost.perAgentMonth)} per agent per month. That figure is based on ${cost.basis}.`,
                    ...insights.slice(0, 3),
                    ...(shrinkInfo.elevated ? [shrinkInfo.message] : []),
                    ...(abandMeaningful ? [`With ${patience}s average patience, an estimated ${(aband.estAband * 100).toFixed(1)}% of contacts would abandon; the abandonment-adjusted estimate is ${adjR.raw} base agents versus the Erlang C ${r.raw}.`] : []),
                    `A ${Math.round((SPIKE - 1) * 100)}% volume spike would require ${spike.sched} FTE (${spike.sched - r.sched >= 0 ? "+" : ""}${spike.sched - r.sched} agents).`,
                  ]},
                  { title: "Recommended Actions", type: "actions", items: [
                    ...(occInfo.band === "critical" ? [{ action: "Decide whether to buy recovery time", detail: pair.sustainable
                        ? `Staffing to your service level alone lands at ${(r.occ * 100).toFixed(1)}% occupancy. Holding an ${Math.round(pair.ceiling * 100)}% ceiling instead takes ${pair.sustainable.sched} FTE rather than ${r.sched}, a difference of ${pair.deltaFte} FTE, about ${fmtMoney(recoveryAnnual)} a year. That figure is the price of agent recovery time, and it is a decision rather than a setting. Cutting volume through deflection, or shortening AHT, lowers both figures.`
                        : `At ${(r.occ * 100).toFixed(1)}%, agents have insufficient recovery time. Target the ${Math.round(BENCH.occupancy.targetLow * 100)} to ${Math.round(BENCH.occupancy.targetHigh * 100)}% band by adding agents or reducing volume.`, priority: "high" }]
                      : occInfo.band === "caution" ? [{ action: "Monitor occupancy on peaks", detail: `${(r.occ * 100).toFixed(0)}% is in the caution band, workable but fragile. A forecast miss pushes it critical. Aim for the ${Math.round(BENCH.occupancy.targetLow * 100)} to ${Math.round(BENCH.occupancy.targetHigh * 100)}% target.`, priority: "medium" }] : []),
                    ...(shrinkInfo.elevated ? [{ action: "Decompose shrinkage", detail: `${shrink}% is above the ${Math.round(BENCH.shrinkage.typicalLow * 100)} to ${Math.round(BENCH.shrinkage.typicalHigh * 100)}% planning range (a labelled heuristic). Use the Shrinkage Planner to see which categories drive the gap before adding heads.`, priority: "medium" }] : []),
                    { action: "Model AHT reduction", detail: `A ${Math.round(AHT_STEP * 100)}% AHT cut (${aht}s → ${Math.round(aht * (1 - AHT_STEP))}s) lowers base staffing from ${r.raw} to ${ahtDown.raw} agents. Use AHT Decomposition to see where handle time goes before you target any part of it.`, priority: "medium" },
                    { action: "Build spike contingency", detail: `Plan for +${Math.round((SPIKE - 1) * 100)}% volume. Identify ${spike.sched - r.sched} agents you could bring on through overtime, cross-training or BPO (outsourcer) overflow.` },
                  ]},
                  { title: "Methodology", type: "text", content: "Erlang C, solved through the numerically stable Erlang B recursion. It assumes random (Poisson) arrivals and exponential handle times. It models one contact per agent at a time, so it applies to voice; digital channels where agents run several sessions at once need a different model. Erlang C also assumes callers never hang up, so it tends to over-staff; the optional patience input estimates abandonment and a requirement adjusted by Erlang A. The optional occupancy cap staffs to whichever is higher: meeting service level, or holding occupancy at or below the ceiling. Shrinkage is applied after the agent calculation to turn base agents into scheduled FTE. Every formula, constant and a worked example are published at contactcentercx.com/methodology/staffing-calculator." + (guards.length ? ` INPUTS CORRECTED: ${guards.map(g => `${g.label} entered ${guardVal(g, "entered")}, computed at ${guardVal(g, "used")}`).join("; ")}. Every figure above was computed on the corrected values.` : "") },
                ]}
              />
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Button kind="secondary" href="/vendors">Explore WFM Vendors</Button>
        <Button kind="secondary" href="/tools/shrinkage-planner">Shrinkage Planner</Button>
        <Button kind="secondary" href="/tools/aht-decomposition">AHT Decomposition</Button>
      </div>
    </ToolFrame>
  );
}

/* The scenario-link defaults, exported for the live checker and the visual audit. */
export { DEFAULTS };
