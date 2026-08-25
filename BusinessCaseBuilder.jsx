import { useState, useEffect, useRef } from "react";
import ReportExport from "./ReportExport";
import NumField from "./src/lib/NumField";
import InfoDot from "./src/lib/InfoDot";
import { COLORS } from "./src/lib/benchmarks";
import { publishToolResult, getExternalPrimitive, getPrimitiveWithSource } from "./src/lib/toolData";
import { MECH, MECH_ORDER, MECH_DEFAULT } from "./src/lib/mech";
import { normalizeForPublish } from "./src/lib/metrics";
import { trackTool, severityBucket } from "./src/lib/track";
import { readScenarioFromUrl, copyShareUrl } from "./src/lib/scenario";

const NAVY = COLORS.navy, DEEP = "#061325", ELECTRIC = COLORS.electric, LIGHT = "#00AAFF";
const WARM = "#F8FAFB", SLATE = "#3A4F6A", MUTED = COLORS.muted, BORDER = "#D8E3ED", ICE = "#E8F4FD";
const GREEN = COLORS.green, AMBER = COLORS.amber, RED = COLORS.red;
const WRAP = { maxWidth: 880, margin: "0 auto", padding: "0 28px" };
const CAPTURE_ENDPOINT = "https://formspree.io/f/mjgjwzwz";

// Display names for rail producers. A pulled value must name the tool that actually
// produced it. Hardcoding "TCO Calculator" was printing a false provenance claim in a
// document a buyer hands a CFO. Unknown ids fall back to a readable form of the id.
const TOOL_LABELS = {
  "tco-calculator": "TCO Calculator", "cost-per-contact": "Cost per Contact",
  "fcr-leakage": "FCR Leakage Diagnostic", "staffing-calculator": "Staffing Calculator",
  "attrition-cost": "Attrition Cost Calculator", "channel-shift": "Channel Shift Model",
  "ai-deflection": "AI Deflection Reality Check", "license-gap": "License Bundle Gap Checker",
  "business-case-builder": "Business Case Builder",
};
const toolLabel = (id) => TOOL_LABELS[id] || (id ? String(id).replace(/-/g, " ") : "another tool");

// ONE status vocabulary, consumed by the UI cards, the PDF metric tiles and the analyst
// copy. Three independent readings of the same number is how a 5% three-year ROI came to
// print amber on screen and green in the document. Tests assert the state, never a colour.
const STATUS = { positive: "positive", caution: "caution", weak: "weak", fail: "fail" };
// 100% over three years is roughly 26% a year. 50% is roughly 15%, near a common hurdle.
// Below 15% total the case is barely clearing its own cost of capital; below zero it destroys value.
function roiStatus(r) {
  if (!r.roiDefined) return STATUS.caution;
  // Judge the number the reader can see. A raw 14.6% displays as 15%, and a status computed
  // on the raw value would paint a tile reading "15%" a different colour from one reading
  // "15%" next to it. The displayed figure and its verdict must come from one quantity.
  const shown = Math.round(r.roi3);
  if (shown < 0) return STATUS.fail;
  if (shown < 15) return STATUS.weak;
  if (shown < 50) return STATUS.caution;
  return STATUS.positive;
}
// Payback is judged on the months the business waits AFTER go-live. The build window is a
// stated cost, not an alarm, so a 12-month migration must not make every honest answer red.
function paybackStatus(r, rampOn) {
  if (r.payback === 0) return STATUS.fail;
  const post = r.payback - (rampOn ? r.M : 0);
  return post <= 12 ? STATUS.positive : post <= 18 ? STATUS.caution : STATUS.weak;
}
const STATUS_COLOR = (st, C) => st === "positive" ? C.green : st === "caution" ? C.amber : C.red;
// A colour is not a verdict in grayscale print or to a colour-blind reader. Every status
// carries a word, and the word ships in the PDF sub-line as well as on screen.
const STATUS_LABEL = { positive: "strong", caution: "acceptable", weak: "thin", fail: "does not return" };

const n = (v) => { const p = parseFloat(v); return isNaN(p) ? 0 : p; };
const fmtK = (v) => v >= 1000000 ? "$" + (v / 1000000).toFixed(2) + "M" : v >= 1000 ? "$" + (v / 1000).toFixed(0) + "K" : "$" + Math.round(v).toLocaleString();
const fmtFull = (v) => "$" + Math.round(v).toLocaleString();
const fmt2 = (v) => "$" + Number(v).toFixed(2);

function LogoMark({ size = 34, light = true }) { const a = light ? "#fff" : NAVY, x = light ? LIGHT : ELECTRIC; return <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke={a} strokeWidth="2" strokeLinecap="round" opacity={light ? .6 : .3} /><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke={a} strokeWidth="3.2" strokeLinecap="round" opacity={light ? .8 : .5} /><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke={a} strokeWidth="5" strokeLinecap="round" /><line x1="-14" y1="-14" x2="14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /><line x1="14" y1="-14" x2="-14" y2="14" stroke={x} strokeWidth="5.5" strokeLinecap="round" /></g></svg>; }

function Card({ children, accent }) {
  return <div style={{ background: "#fff", border: `1px solid ${accent ? accent + "40" : BORDER}`, borderRadius: 10, padding: "24px 22px", marginBottom: 16 }}>{children}</div>;
}
function H({ children, color }) {
  return <h3 style={{ fontSize: 13, fontWeight: 700, color: color || ELECTRIC, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 14 }}>{children}</h3>;
}

// InfoDot definition strings. Two sentences each: what it is, then why the tool uses it.
// This DEFS map is the future glossary content for this tool.
const DEFS = {
  repeatShare: "Same-reason repeat contacts as a share of total volume. Annual volume already contains repeats, so FCR improvement must be applied to the underlying issues, not to every contact. Supply this if you measure it. Left blank, the tool derives the issue count from FCR, which assumes one repeat per unresolved issue and is labelled a proxy in the report.",
  mech: "Freed agent time is released capacity, not cash. It becomes money only when a named action converts it: reducing overtime, avoiding planned hires, reducing vendor or BPO volume, or removing headcount. Absorbing growth is real operational value but is not cash this cycle, and selecting no action realizes zero. Only freed labor is scaled by this factor. Avoided recruiting spend, platform fees and implementation are never scaled.",
  marginal: "The variable cost that actually disappears when one contact goes away, essentially the agent handle-time labor for that contact. Savings are valued here rather than at fully loaded cost, because fixed tech, facilities, and supervision do not fall when a single contact is deflected.",
  loadedCPC: "Your fully loaded cost per contact, carrying labor plus a share of fixed tech, facilities, and supervision. The tool shows it for context but never values savings on it, because deflecting one contact does not remove those fixed costs.",
  stance: "A per-lever haircut on modeled savings, set higher for levers a board trusts and lower for levers that are hard to attribute to a platform. It exists because deflection, handle-time, FCR, and attrition are not equally believable, so a single blanket discount would either overstate the soft levers or understate the hard ones.",
  phasing: "Spreads savings across the migration build and the post-go-live ramp instead of assuming they arrive on day one. It exists because a transformation earns nothing while it is being built, so an instant-payback number is the fastest way to lose CFO trust.",
  confidence: "Two independent axes, and the badge shows the weaker. COST BASIS rates how bookable the investment inputs are, from estimate to signed proposal. REALIZATION rates whether the modeled savings can be booked at all, which depends on the capacity action: freed labor with no conversion action is planning value, not money. Both are kept separate from how believable the savings are, which is the stance, and from whether the organization can deliver the targets, which is a separate tool. It exists so a case built on guesses, or one whose benefit is unbanked capacity, cannot present with the same authority as one built on a signed proposal and a committed action.",
  containment: "The share of contacts the transformation fully handles in self-service with no agent. It is the lever a board probes first, so the tool sizes it on the handled pool and flags targets above what most centers actually reach.",
  ht: "The percent cut in talk-and-hold time, applied to AHT after after-call work is removed. Much of AHT is not compressible, so double-digit cuts should be read as upside rather than base case.",
  acw: "After-call work, the wrap time that sits inside AHT. The tool treats it as a separate slice so a handle-time cut and an ACW cut can never claim the same saved minute twice.",
  fcr: "The point lift in first-contact resolution, which removes repeat contacts from the handled pool. It saves money only by avoiding the second contact, so it is valued at the same marginal cost as a deflected one.",
  attrition: "The percent cut in agent turnover, converted into fewer hires and their recruiting and training cost. It is the softest lever because attrition has many causes, so a platform rarely deserves full credit for the improvement.",
};

const STANCE = {
  aggressive: { label: "Aggressive", c: 1.00, h: 1.00, f: 1.00, a: 1.00, note: "Full modeled savings, no discount. Matches typical vendor ROI tools." },
  expected: { label: "Expected", c: 0.85, h: 0.90, f: 0.80, a: 0.65, note: "Each lever discounted for real-world attribution. The defensible default." },
  conservative: { label: "Conservative", c: 0.70, h: 0.80, f: 0.65, a: 0.50, note: "Heavy haircut on the soft levers. The floor you can commit to." },
};

const EVIDENCE = {
  estimate: { label: "Estimate", note: "Numbers are internal estimates." },
  quote: { label: "Vendor quote", note: "Platform cost from a vendor quote." },
  proposal: { label: "Signed proposal", note: "Investment from a signed proposal or order form." },
};

/* De-overlapped model: every contact-based saving runs on the HANDLED pool
   (post-deflection); ACW is a disjoint slice of AHT; FCR repeats are on handled
   volume. Avoided contacts (deflection + FCR) are valued at MARGINAL cost, the
   same basis the TCO Calculator uses, so the two tools never disagree on the
   same contact. Attribution (stance) then discounts each lever, and realization (mech.js)
   converts freed labor into money. Attribution and realization are separate questions. */
function computeCase(d, stanceKey, rampOn, mechKey = MECH_DEFAULT) {
  const loaded = n(d.avgHourly) * (1 + n(d.benefitsPct) / 100);
  // Marginal cost per contact: use a value inherited from another tool when present,
  // otherwise derive the labor-marginal (handle-time at the loaded wage). This is
  // what actually disappears when a contact is deflected, not the fully loaded CPC.
  const derivedMarginal = (n(d.currentAHT) / 3600) * loaded;
  const marginal = n(d.marginalPerContact) > 0 ? n(d.marginalPerContact) : derivedMarginal;
  const marginalPulled = n(d.marginalPerContact) > 0;
  // An inherited marginal goes stale the moment AHT or wage is edited here, and a marginal
  // measured on a different operation is not this operation's marginal. Measure the gap so
  // the tool can state it rather than silently preferring the inherited figure.
  const marginalGap = marginalPulled && derivedMarginal > 0
    ? Math.abs(marginal - derivedMarginal) / derivedMarginal : 0;
  // Trigger on the SAME rounded percentage the tool prints. A raw > 0.10 test would flag a
  // 10.4% gap while the sentence beside it said "10%", so the stated arithmetic would not
  // reproduce its own trigger.
  const marginalStale = Math.round(marginalGap * 100) > 10;

  const annual = n(d.monthlyContacts) * 12;
  const deflected = annual * (n(d.containment) / 100);
  const handled = Math.max(0, annual - deflected);

  const acw = Math.min(n(d.currentACW), n(d.currentAHT));
  const talkHold = Math.max(0, n(d.currentAHT) - acw);
  const secSaved = talkHold * (n(d.htReduction) / 100) + acw * (n(d.acwReduction) / 100);
  const handleTime = handled * secSaved / 3600 * loaded;

  const containment = deflected * marginal;              // marginal basis, not loaded CPC

  // FCR economics run on ISSUES, not on contacts. Annual volume already contains the repeats,
  // so multiplying total handled volume by an FCR improvement counts contacts that were never
  // going to exist. Prefer a measured repeat share; fall back to deriving issues from FCR and
  // label that derivation a proxy, because it assumes one repeat per unresolved issue.
  // FCR economics act on the REPEAT POPULATION, and can never remove more repeats than exist.
  // The old formula applied the FCR point lift to the issue count, which on a measured repeat
  // share of 2% claimed to avoid 4.9x more repeats than the operation actually has. Instead:
  // improving FCR shrinks the unresolved pool PROPORTIONALLY, and that ratio is applied to the
  // repeat population. On the proxy path this is algebraically identical to the old formula, so
  // proxy cases are unchanged; only a measured repeat share behaves differently, and correctly.
  const fcrFrac = n(d.currentFCR) / 100;
  const oldFail = Math.max(0, 1 - fcrFrac);
  const newFail = Math.max(0, 1 - Math.min(1, fcrFrac + n(d.fcrImprovement) / 100));
  const fcrReductionRatio = oldFail > 0 ? Math.max(0, Math.min(1, (oldFail - newFail) / oldFail)) : 0;
  const measuredRepeatShare = n(d.repeatShare) > 0 ? Math.min(0.95, n(d.repeatShare) / 100) : 0;
  const repeatBasis = measuredRepeatShare > 0 ? "measured" : "fcr-proxy";
  // One repeat per unresolved issue is the proxy assumption, and it fixes the derived population.
  const proxyRepeatShare = (2 - fcrFrac) > 0 ? oldFail / (2 - fcrFrac) : 0;
  const repeatPopulation = handled * (measuredRepeatShare > 0 ? measuredRepeatShare : proxyRepeatShare);
  const issues = handled - repeatPopulation;
  const impliedRepeatShare = handled > 0 ? repeatPopulation / handled : 0;
  const fcrLift = Math.max(0, Math.min(100, n(d.currentFCR) + n(d.fcrImprovement)) - n(d.currentFCR)) / 100;
  // A target above the headroom to 100% is clamped by the engine, but the narrative must never
  // report the unclamped input: "improving FCR by 39 points" from 78% is not a thing.
  const fcrLiftEffectivePts = Math.round(fcrLift * 1000) / 10;
  const fcrLiftClamped = n(d.fcrImprovement) > fcrLiftEffectivePts + 0.05;
  const fcrPerfectTarget = fcrReductionRatio >= 0.999 && repeatPopulation > 0;
  const avoidedRepeats = Math.min(repeatPopulation, repeatPopulation * fcrReductionRatio);
  // A measured repeat share implies its own FCR. If that disagrees with the FCR entered, the two
  // inputs are measuring different things and the tool must say so rather than blend them.
  const fcrImpliedByRepeats = measuredRepeatShare > 0 && measuredRepeatShare < 0.5
    ? (1 - 2 * measuredRepeatShare) / (1 - measuredRepeatShare) : null;
  const fcrInputConflict = fcrImpliedByRepeats != null
    && Math.abs(fcrImpliedByRepeats - fcrFrac) > 0.05;
  const fcr = avoidedRepeats * marginal;                 // marginal basis, not loaded CPC

  const newAtt = n(d.currentAttrition) * (1 - n(d.attritionReduction) / 100);
  const avoidedTurnover = n(d.agents) * (n(d.currentAttrition) - newAtt) / 100;
  // Attrition avoidance is NOT uniformly cash. Recruiting spend genuinely disappears when a hire
  // is avoided. Trainee wages do not: had the incumbent stayed you would have paid them anyway,
  // so what is actually avoided is the lost production during ramp, which is capacity like any
  // other freed hour and must be scaled by the same realization factor.
  const perHireCash = n(d.recruitCostPerHire);
  const perHireCapacity = n(d.trainingDays) * 8 * loaded;
  const perHire = perHireCash + perHireCapacity;
  const attrition = avoidedTurnover * perHire;
  const attritionCash = avoidedTurnover * perHireCash;
  const attritionCapacity = avoidedTurnover * perHireCapacity;
  const hoursAttrition = avoidedTurnover * n(d.trainingDays) * 8;

  const buckets = { containment, handleTime, fcr, attrition };
  const gross = containment + handleTime + fcr + attrition;
  const cf = STANCE[stanceKey];

  // TWO SEPARATE ADJUSTMENTS, applied in order and never conflated.
  //
  //   attribution (the stance) asks: how much of this improvement is caused by the intervention?
  //   realization (mech.js)     asks: what action converts freed capacity into money?
  //
  // Containment, handle-time and FCR all free agent labor. Freed labor is capacity, not cash,
  // until somebody acts on it, and "no action" realizes zero. Attrition reduction is different:
  // it avoids recruiting spend and trainee wages, which is money that never leaves the building,
  // so it takes attribution but never a realization factor. Costs are never scaled by either.
  const mech = MECH[mechKey] || MECH[MECH_DEFAULT];
  const mf = mech.f;

  const capacityGross = containment + handleTime + fcr + attritionCapacity;
  const cashGross = attritionCash;
  const capacityNet = containment * cf.c + handleTime * cf.h + fcr * cf.f + attritionCapacity * cf.a;
  const cashNet = attritionCash * cf.a;                                      // attribution only
  const capacityRealized = capacityNet * mf;                                 // realization applied
  const unrealizedCapacity = capacityNet - capacityRealized;
  const net = capacityRealized + cashNet;

  const attributionHaircut = gross - (capacityNet + cashNet);
  const realizationHaircut = unrealizedCapacity;

  // The same story in hours, which is the unit a workforce manager can act on.
  const hoursContainment = deflected * (n(d.currentAHT) / 3600);
  const hoursHandleTime = handled * secSaved / 3600;
  const hoursFcr = avoidedRepeats * (n(d.currentAHT) / 3600);
  const freedHoursGross = hoursContainment + hoursHandleTime + hoursFcr + hoursAttrition;
  const freedHoursAttributed = hoursContainment * cf.c + hoursHandleTime * cf.h + hoursFcr * cf.f + hoursAttrition * cf.a;
  const freedHoursRealized = freedHoursAttributed * mf;

  // ONE percent allocation, consumed by the UI strip, the PDF table and the analyst read.
  // Largest remainder, so the printed column always sums to exactly 100. Returns all zeros
  // when gross is zero, which is what stops a no-improvement case printing NaN.
  const pct = (() => {
    const keys = Object.keys(buckets);
    const zero = {};
    for (const k of keys) zero[k] = 0;
    if (!(gross > 0)) return zero;
    const raw = keys.map(k => buckets[k] / gross * 100);
    const alloc = raw.map(Math.floor);
    let rem = 100 - alloc.reduce((a, b) => a + b, 0);
    const order = raw.map((v, i) => [i, v - alloc[i]]).sort((a, b) => b[1] - a[1]);
    for (let j = 0; j < order.length && rem > 0; j++) { alloc[order[j][0]]++; rem--; }
    const out = {};
    keys.forEach((k, i) => { out[k] = alloc[i]; });
    return out;
  })();

  const recurring = n(d.newPlatformPerAgentMo) * n(d.agents) * 12;
  const impl = n(d.implementationCost);
  const tco3 = impl + recurring * 3;

  // Monthly cash flow with a savings ramp. During the migration window savings are
  // ~0 while the new platform is already being paid; after go-live they phase up
  // linearly to full over the ramp window, turning an idealized instant payback into
  // an honest J-curve. With rampOn=false it collapses to the old instant model.
  const M = Math.max(0, Math.min(36, n(d.migrationMonths)));
  const R = Math.max(1, n(d.rampMonths));
  const monthlyFull = net / 12;
  const monthlyPlatform = recurring / 12;
  const factor = (t) => {
    if (!rampOn) return 1;
    if (t <= M) return 0;
    if (t <= M + R) return (t - M) / R;
    return 1;
  };
  const cumFlow = [-impl];
  let cum = -impl, savings3 = 0, year1 = 0, payback = 0;
  for (let t = 1; t <= 36; t++) {
    const s = factor(t) * monthlyFull;
    savings3 += s;
    if (t <= 12) year1 += s;
    cum += s - monthlyPlatform;
    cumFlow.push(cum);
    // A zero-cost, zero-savings case satisfies cum >= 0 at t=1. Payback requires savings.
    if (payback === 0 && cum >= 0 && savings3 > 0) payback = t;
  }
  // With no investment there is no denominator, so ROI is undefined rather than 0%.
  // netValue3 still carries the truth. The UI and PDF print "n/a" on roiDefined=false.
  const roiDefined = tco3 > 0;
  const roi3 = roiDefined ? ((savings3 - tco3) / tco3 * 100) : 0;
  const netValue3 = savings3 - tco3;

  // How much implementation cost this case can absorb before three-year value turns negative.
  // savings3 does not depend on implementation, so this is exact rather than a search.
  // Cumulative cash at month 36 IS netValue3, so break-even-by-36 and zero-three-year-value
  // are the same threshold; there is no second definition to keep in sync.
  const postMonthly = monthlyFull - monthlyPlatform;
  const breakEvenImpl = Math.max(0, savings3 - recurring * 3);
  const agentsN = n(d.agents);
  const breakEvenImplPerAgent = agentsN > 0 ? breakEvenImpl / agentsN : 0;
  const implHeadroom = breakEvenImpl - impl;
  const implHeadroomPerAgent = agentsN > 0 ? implHeadroom / agentsN : 0;

  // The month cumulative cash actually turns positive, which may sit beyond the evaluation
  // horizon. "No payback in 36 months" and "never pays back" are different investment
  // conclusions and the tool must not collapse them.
  const monthsBeyond = postMonthly > 0 ? Math.ceil(-netValue3 / postMonthly) : 0;
  const trueBreakevenMonth = payback > 0 ? payback : (postMonthly > 0 ? 36 + monthsBeyond : 0);

  // The same case priced at the bottom of the range this tool calls typical ($3K per agent).
  // Lets the implementation warning state its own consequence instead of asserting one.
  const TYPICAL_PER_AGENT = 3000;
  const typicalImpl = TYPICAL_PER_AGENT * agentsN;
  const typicalTco3 = typicalImpl + recurring * 3;
  const typicalValue3 = savings3 - typicalTco3;
  const typicalRoi3 = typicalTco3 > 0 ? typicalValue3 / typicalTco3 * 100 : 0;
  let typicalPayback = 0;
  for (let t = 1; t <= 36; t++) { if (cumFlow[t] + impl - typicalImpl >= 0) { typicalPayback = t; break; } }
  const typicalBreakeven = typicalPayback > 0 ? typicalPayback
    : (postMonthly > 0 ? 36 + Math.ceil(-typicalValue3 / postMonthly) : 0);

  return { loaded, marginal, marginalPulled, marginalGap, marginalStale, derivedMarginal,
    mechKey: MECH[mechKey] ? mechKey : MECH_DEFAULT, mf, mechLabel: mech.label, cred: mech.cred,
    capacityGross, cashGross, capacityNet, cashNet, capacityRealized, unrealizedCapacity,
    attritionCash, attritionCapacity, perHireCash, perHireCapacity,
    attributionHaircut, realizationHaircut,
    freedHoursGross, freedHoursAttributed, freedHoursRealized,
    issues, avoidedRepeats, repeatBasis, impliedRepeatShare, measuredRepeatShare,
    repeatPopulation, fcrReductionRatio, fcrImpliedByRepeats, fcrInputConflict,
    fcrLiftEffectivePts, fcrLiftClamped, fcrPerfectTarget, annual, handled, deflected, buckets, pct, gross, net, haircut: gross - net, recurring, tco3, roi3, roiDefined, payback, netValue3, avoidedTurnover, cumFlow, savings3, year1, M, R, monthlyFull, monthlyPlatform, postMonthly, rampOn,
    breakEvenImpl, breakEvenImplPerAgent, implHeadroom, implHeadroomPerAgent,
    trueBreakevenMonth, TYPICAL_PER_AGENT, typicalImpl, typicalValue3, typicalRoi3, typicalPayback, typicalBreakeven };
}

// Evidence-confidence: how bookable the cost and target inputs are, degraded by
// plausibility flags. Separate axis from the stance (which weights savings), and
// deliberately scoped: it certifies the cost basis, not that the org can deliver.
const GRADE_RANK = { "Directional": 0, "Planning-grade": 1, "Finance-grade": 2 };
// Credit class governs what finance will book. capacity-only earns Directional,
// finance-creditable earns Planning-grade, cash out the door earns Finance-grade.
const CRED_GRADE = { none: "Directional", capacity: "Directional", finance: "Planning-grade", cash: "Finance-grade" };

function confidenceOf(d, r, stanceKey) {
  const evidence = d.evidence || "estimate";
  const perAgentImpl = n(d.agents) > 0 ? n(d.implementationCost) / n(d.agents) : 0;

  // THREE CONCEPTS, THREE PLACES, and none of them may move another.
  //   open  : defects in the COST INPUTS themselves. Only these move the cost-basis axis.
  //   caps  : reasons the HEADLINE is capped that are not cost-input defects, each carrying
  //           its own ceiling and naming its own domain.
  //   flags : plausibility observations that inform the reader and move nothing.
  const open = [], caps = [], flags = [];

  // ---- COST BASIS. One question: how bookable are the investment inputs? ----
  if (r.marginalStale) open.push(`The inherited marginal cost of ${fmt2(r.marginal)} per contact is ${Math.round(r.marginalGap * 100)}% away from the ${fmt2(r.derivedMarginal)} implied by the AHT and wage entered here. One of the two is describing a different operation.`);
  if (r.fcrInputConflict) open.push(`The measured repeat share of ${Math.round(r.measuredRepeatShare * 100)}% implies a first-contact resolution rate near ${Math.round(r.fcrImpliedByRepeats * 100)}%, against the ${n(d.currentFCR)}% entered. The two are measuring different things, and the repeat population governs the economics.`);
  let costGrade;
  if (evidence === "proposal" && !r.marginalStale && !r.fcrInputConflict) costGrade = "Finance-grade";
  else if (evidence === "quote" || evidence === "proposal") costGrade = "Planning-grade";
  else costGrade = "Directional";

  // ---- REALIZATION. One question: can the modeled savings be booked at all? ----
  const realizationGrade = CRED_GRADE[r.cred] || "Directional";
  if (r.mechKey === "none")
    caps.push(["Directional", "No capacity action is committed, so freed agent time realizes zero cash. Until an action is chosen this case is released capacity, not a saving. This is a benefit-realization question and says nothing about the cost inputs."]);
  else if (GRADE_RANK[realizationGrade] < GRADE_RANK[costGrade])
    caps.push([realizationGrade, `The ${r.mechLabel} capacity action converts freed labor into ${r.cred === "capacity" ? "planning value rather than cash" : "finance-creditable value rather than cash out the door"}, so realization caps this case at ${realizationGrade}. This is a benefit-realization concern, not a cost-input one.`]);

  // ---- RETURN. Whether the case pays is not evidence about anything. ----
  if (r.payback === 0) caps.push(["Directional", r.trueBreakevenMonth > 0
    ? `The case does not break even within the three-year evaluation horizon, and on the same assumptions cumulative cash turns positive in month ${r.trueBreakevenMonth}. This caps the badge on the strength of the return, not on the bookability of the costs.`
    : "Modeled savings never exceed the monthly platform cost, so the case does not break even at any horizon. This caps the badge on the strength of the return, not on the bookability of the costs."]);
  if (r.breakEvenImplPerAgent > 0 && r.breakEvenImplPerAgent < r.TYPICAL_PER_AGENT && r.postMonthly > 0)
    caps.push(["Planning-grade", r.implHeadroomPerAgent >= 0
      ? `Three-year value turns negative above ${fmtFull(r.breakEvenImplPerAgent)} per agent of implementation, leaving only ${fmtFull(r.implHeadroomPerAgent)} per agent of headroom, and that cliff sits below the ${fmtFull(r.TYPICAL_PER_AGENT)} internal planning floor. This is a fragility observation about the return, not a defect in the cost evidence.`
      : `Three-year value is already negative on implementation cost. It would turn positive only below ${fmtFull(r.breakEvenImplPerAgent)} per agent, and ${fmtFull(perAgentImpl)} per agent was entered, so the case is ${fmtFull(-r.implHeadroomPerAgent)} per agent past the point where it returns. This is an observation about the return, not a defect in the cost evidence.`]);

  // ---- ATTRIBUTION. Stance and target ambition are savings questions. ----
  if (stanceKey === "aggressive") caps.push(["Planning-grade", "The Aggressive stance presents savings with no attribution haircut. This is a benefit-attribution concern rather than a cost-input one, and it is listed here precisely so it does not get counted as a costing defect."]);
  if (n(d.containment) > 25) flags.push(`Containment target of ${n(d.containment)}% is above the 10 to 25% range most centers reach without a proven pilot.`);
  if (n(d.htReduction) > 15) flags.push(`Handle-time reduction of ${n(d.htReduction)}% is above the 8 to 15% range we use for planning.`);
  if (r.fcrPerfectTarget) flags.push(`The FCR target reaches 100% first-contact resolution, which removes every repeat contact in the model. No contact center resolves every issue first time, so this lever sits at a theoretical ceiling rather than a plannable target.`);
  else if (r.fcrLiftEffectivePts > 10) flags.push(`FCR improvement of ${r.fcrLiftEffectivePts} points is above the 5 to 10 point internal planning range.`);
  if (r.fcrLiftClamped) flags.push(`An FCR improvement of ${n(d.fcrImprovement)} points was entered against a current rate of ${n(d.currentFCR)}%, which would exceed 100%. The model uses only the ${r.fcrLiftEffectivePts} points of headroom that exist.`);
  if (n(d.attritionReduction) > 25) flags.push(`Attrition reduction of ${n(d.attritionReduction)}% is optimistic and hard to attribute to a platform.`);
  if (flags.length) caps.push(["Planning-grade", `${flags.length} improvement target${flags.length > 1 ? "s sit" : " sits"} above the internal planning range: ${flags.join(" ")} This is a target-plausibility concern, not a cost-input one.`]);

  // ---- PRICE PLAUSIBILITY is not evidence quality. A signed proposal stays contracted. ----
  if (perAgentImpl > 0 && perAgentImpl < 2000 && r.postMonthly > 0)
    flags.push(`Implementation of ${fmtFull(perAgentImpl)} per agent is below our internal planning benchmark of $3 to 8K per agent for a full transformation, which is a heuristic rather than a sourced market figure. Evidence quality is unchanged by this: a signed proposal is still contracted.`);

  const headline = [costGrade, realizationGrade, ...caps.map(c => c[0])]
    .reduce((a, b) => GRADE_RANK[b] < GRADE_RANK[a] ? b : a, "Finance-grade");
  return { grade: headline, costGrade, realizationGrade, open, withheld: caps.map(c => c[1]), flags, evidence };
}

function caseInsights(r, d, stanceKey, conf) {
  const flags = [], leadFlags = [];
  // Input plausibility, the assumptions a CFO rejects on sight. These lead the read.
  if (n(d.containment) > 25) flags.push(`Your ${n(d.containment)}% self-service containment is above the 10 to 25% most centers actually achieve. Without a pilot proving it, model 15 to 20% as the defensible case. It is ${r.pct.containment}% of your savings, so the board challenges it first.`);
  if (n(d.htReduction) > 15) flags.push(`A ${n(d.htReduction)}% handle-time reduction is aggressive. 8 to 15% is typical even with AI assist, so treat anything above 15% as upside, not base case.`);
  if (n(d.attritionReduction) > 25) flags.push(`${n(d.attritionReduction)}% attrition reduction is optimistic (15 to 25% is realistic) and the hardest lever to attribute to a platform. Discount it heavily or footnote it.`);
  const perAgentImpl = n(d.agents) > 0 ? n(d.implementationCost) / n(d.agents) : 0;
  // Once recurring platform cost exceeds recurring benefit, the size of the one-time
  // implementation cannot change the outcome. Saying it looks understated is true and useless.
  if (perAgentImpl > 0 && perAgentImpl < 2000 && r.postMonthly > 0) {
    // Never assert that a corrected figure "survives diligence". The model can check that,
    // and on a thin case a complete figure does not lengthen payback, it removes it.
    const atTypical = r.typicalBreakeven === 0
      ? `the case would not break even at any horizon`
      : r.typicalPayback > 0
        ? `this case still returns ${Math.round(r.typicalRoi3)}% over three years with a ${r.typicalPayback}-month payback`
        : `this case returns ${Math.round(r.typicalRoi3)}% over three years and does not break even until month ${r.typicalBreakeven}, outside the horizon`;
    flags.push(`Implementation of ${fmtFull(n(d.implementationCost))} for ${n(d.agents)} agents is about ${fmtFull(perAgentImpl)} per agent, low against our internal planning benchmark of $3 to 8K per agent, which is a heuristic for a full transformation rather than a sourced market figure, and moves with scope, channels, integrations and professional services. Correcting it is the right call, and this is what it costs: at ${fmtFull(r.TYPICAL_PER_AGENT)} per agent, ${atTypical}.`);
  }
  // A case that cannot break even leads the read. An implementation nuance must never sit
  // above the finding that the investment does not return.
  if (r.payback === 0) flags.unshift(r.postMonthly <= 0
    ? `At full run-rate, monthly savings of ${fmtFull(r.monthlyFull)} do not exceed the ${fmtFull(r.monthlyPlatform)} monthly platform cost, so this case does not break even at any horizon, not merely within three years. Revisit platform cost, targets, or stance before presenting.`
    : `The case does not break even within the three-year evaluation horizon. Run-rate savings do exceed platform cost by ${fmtFull(r.postMonthly)} a month, so cumulative cash turns positive in month ${r.trueBreakevenMonth}. Present it as a longer-horizon investment or reduce the implementation figure, but do not present it as a three-year payback.`);
  else if (r.payback > 0 && r.payback < 3) flags.push(`A ${r.payback}-month payback reads as too good to be true and invites scrutiny. Confirm the investment captures professional services, change management, and internal time before you present it.`);

  if (r.marginalStale) flags.unshift(`Your savings basis of ${fmt2(r.marginal)} per contact came from another tool, but the AHT and wage on this page imply ${fmt2(r.derivedMarginal)}, a gap of ${Math.round(r.marginalGap * 100)}%. Every deflection and FCR dollar in this case is priced at the inherited figure. Reconcile the two before you present, because a reviewer who divides your savings by your contact volume will find the discrepancy.`);

  // Headroom to failure. More useful than any generic fragility threshold, because it names
  // how fragile, to what, and exactly where the cliff sits.
  const headroomLine = r.breakEvenImplPerAgent > 0 && r.payback > 0
    ? `This case carries ${fmtFull(r.implHeadroomPerAgent)} per agent of implementation headroom. Three-year value turns negative above ${fmtFull(r.breakEvenImplPerAgent)} per agent against the ${fmtFull(n(d.implementationCost) / Math.max(1, n(d.agents)))} you entered.${r.breakEvenImplPerAgent < r.TYPICAL_PER_AGENT ? ` That cliff sits below the ${fmtFull(r.TYPICAL_PER_AGENT)} per agent that is the floor of a typical platform transformation, so this case cannot absorb a normal implementation cost on the ${stanceKey} stance.` : ""}`
    : null;
  if (headroomLine && r.breakEvenImplPerAgent < r.TYPICAL_PER_AGENT) flags.unshift(headroomLine);

  // The sentence that separates released capacity from money. This is the headline finding on
  // any case whose savings are mostly freed labor, which is most cases.
  const capacityLine = r.capacityNet > 0
    ? `This case releases ${Math.round(r.freedHoursAttributed).toLocaleString()} agent hours a year, worth ${fmtK(r.capacityNet)} of labor-equivalent capacity after attribution. Freed time is not money until somebody acts on it. ${r.mechKey === "none" ? `No capacity action has been committed, so none of it converts and the whole ${fmtK(r.unrealizedCapacity)} stays outside the cash case. Choosing an action is a management decision, not a modelling one, and it is the single largest lever on this page.` : `Your stated action, ${r.mechLabel.toLowerCase()}, converts ${Math.round(r.mf * 100)}% of that into ${fmtK(r.capacityRealized)}${r.mf < 1 ? `, leaving ${fmtK(r.unrealizedCapacity)} as released capacity that is excluded from the cash case` : ""}.`} ${fmtK(r.cashNet)} of avoided recruiting spend is cash-releasing, because a hire not made is money not spent. Trainee wages are treated as capacity, not cash, because had the incumbent stayed you would have paid a wage anyway; what is avoided is the lost production during ramp.`
    : null;
  if (capacityLine && (r.mechKey === "none" || r.cred === "capacity")) flags.unshift(capacityLine);
  if (r.fcrInputConflict) leadFlags.push(`Two inputs disagree about the same thing. A measured repeat share of ${Math.round(r.measuredRepeatShare * 100)}% implies first-contact resolution near ${Math.round(r.fcrImpliedByRepeats * 100)}%, but ${n(d.currentFCR)}% was entered. The economics run on the measured repeat population of ${Math.round(r.repeatPopulation).toLocaleString()} contacts, so improving FCR by the ${r.fcrLiftEffectivePts} points of headroom that exist removes ${Math.round(r.fcrReductionRatio * 100)}% of them, or ${Math.round(r.avoidedRepeats).toLocaleString()} contacts. Reconcile the two definitions before presenting, because they are almost certainly measuring different windows or different scopes.`);
  flags.unshift(...leadFlags);

  const out = [...flags.slice(0, 2 + leadFlags.length)];
  if (capacityLine && !out.includes(capacityLine)) out.push(capacityLine);
  if (r.repeatBasis === "measured" && !r.fcrInputConflict && r.avoidedRepeats > 0)
    out.push(`Avoided repeats run on your measured repeat population of ${Math.round(r.repeatPopulation).toLocaleString()} contacts. Improving first-contact resolution by ${r.fcrLiftEffectivePts} points shrinks the unresolved pool by ${Math.round(r.fcrReductionRatio * 100)}%, which removes ${Math.round(r.avoidedRepeats).toLocaleString()} contacts. The model can never remove more repeats than you measure.`);
  if (r.repeatBasis === "fcr-proxy" && r.avoidedRepeats > 0)
    out.push(`Repeat-contact volume was not supplied, so FCR is being used as a proxy. Annual volume already contains repeats, so the model derives a repeat population of ${Math.round(r.repeatPopulation).toLocaleString()} contacts from your ${n(d.currentFCR)}% FCR, assuming one repeat per unresolved issue, then removes ${Math.round(r.fcrReductionRatio * 100)}% of it. Supplying measured same-reason repeat volume replaces that assumption with a measurement.`);
  if (headroomLine && !out.includes(headroomLine)) out.push(headroomLine);

  // The differentiator, stated plainly so a blind user understands why the number is smaller than a vendor's.
  out.push(`Deflected and repeat-avoided contacts are valued at the marginal cost of ${fmt2(r.marginal)} each, the marginal labor content of a contact, not the fully loaded ${fmt2(n(d.costPerContact))}. That valuation is shared with the TCO Calculator, which makes the two tools consistent on the same contact. Consistency is a shared definition, not evidence that the capacity is cash-releasing: that depends entirely on the realization action.`);

  const sorted = Object.entries(r.buckets).sort((a, b) => b[1] - a[1]);
  const [topName, topVal] = sorted[0];
  const labelMap = { containment: "self-service containment", handleTime: "handle-time reduction", fcr: "FCR improvement", attrition: "attrition reduction" };
  const topShare = r.pct[topName];
  out.push(`${topShare}% of your case rests on ${labelMap[topName]}. ${topName === "containment" ? "Deflection is the assumption most often wrong after go-live, so this is where a pilot result changes the conclusion most." : topName === "attrition" ? "That is the softest, least attributable lever, so expect the most pushback there." : "It is a relatively defensible lever, which strengthens the case."}`);

  if (r.rampOn && r.payback > 0) {
    const instMonthly = r.monthlyFull - r.monthlyPlatform;
    const instPay = instMonthly > 0 ? Math.ceil(n(d.implementationCost) / instMonthly) : 0;
    if (instPay > 0 && r.payback > instPay)
      out.push(`Phasing savings over your ${r.M}-month migration and ${r.R}-month ramp moves payback from an idealized ${instPay} month${instPay === 1 ? "" : "s"} to a realistic ${r.payback}. The phased figure is the one that reflects when cash actually arrives.`);
  } else if (!r.rampOn) {
    out.push(`Savings phasing is off, so this assumes 100% of savings land on day one, an idealized payback. Turn on phasing for the board-defensible number that accounts for migration and ramp.`);
  }

  if (stanceKey === "aggressive")
    out.push(`The aggressive stance applies no attribution haircut, so gross and attributed savings are the same ${fmtK(r.gross)}. That is the vendor-ROI presentation, and an undiscounted number carries no attribution risk adjustment at all. Expected applies attribution weighting to each lever; this stance does not.`);
  else
    out.push(`Two separate adjustments run on this case. The ${stanceKey} stance takes ${fmtK(r.attributionHaircut)} off gross savings for attribution, asking how much of the improvement this intervention actually causes. Realization then takes a further ${fmtK(r.realizationHaircut)} off freed labor, asking what converts capacity into money. ${r.mechKey === "none" ? `The realization figure is that large only because no action has been chosen, which is an open decision rather than a stress test. Choose the action you can actually commit to before comparing gross ${fmtK(r.gross)} against realizable ${fmtK(r.net)}.` : `Presenting gross ${fmtK(r.gross)} and realizable ${fmtK(r.net)} side by side, with both adjustments named, shows a reader exactly which assumptions the figure depends on.`}`);

  if (conf) out.push(`Case confidence reads ${conf.grade}, the weaker of a ${conf.costGrade} cost basis and a ${conf.realizationGrade} realization axis${conf.open.length ? `, with ${conf.open.length} open item${conf.open.length > 1 ? "s" : ""} on the cost inputs to close before you call the investment side final` : ", with no open items on the cost inputs"}.${conf.withheld && conf.withheld.length ? ` The grade is additionally capped by ${conf.withheld.length} item${conf.withheld.length > 1 ? "s" : ""} that ${conf.withheld.length > 1 ? "are" : "is"} not a costing defect, counted separately so a return problem never reads as a bookability problem.` : ""} Neither axis rates whether the organization can deliver the targets, which is a separate question for the Transformation Readiness tool.`);

  return out;
}

const DEFAULTS = {
  agents: 200, avgHourly: 18, benefitsPct: 30, monthlyContacts: 120000, currentAHT: 420, currentACW: 45,
  currentFCR: 72, repeatShare: 0, currentAttrition: 35, costPerContact: 7, marginalPerContact: 0, recruitCostPerHire: 3500, trainingDays: 21,
  htReduction: 12, acwReduction: 30, fcrImprovement: 8, attritionReduction: 20, containment: 15,
  implementationCost: 750000, newPlatformPerAgentMo: 135, migrationMonths: 9, rampMonths: 6, evidence: "estimate",
};

export default function BusinessCaseBuilder() {
  const [d, setD] = useState(DEFAULTS);
  const [stance, setStance] = useState("expected");
  const [rampOn, setRampOn] = useState(true);
  // Deliberately NOT MECH_DEFAULT. Preselecting a 75% conversion supplies a management
  // commitment the user never made, which is the tool manufacturing financial value.
  const [mech, setMech] = useState("none");
  const [pulled, setPulled] = useState({});
  const [sources, setSources] = useState({});
  const [copied, setCopied] = useState(false);
  const set = (k, v) => setD(prev => ({ ...prev, [k]: v }));

  const [capOpen, setCapOpen] = useState(false);
  const [capName, setCapName] = useState(""), [capCompany, setCapCompany] = useState(""), [capEmail, setCapEmail] = useState("");
  const [capState, setCapState] = useState("idle");
  const completedRef = useRef(false);

  // Mount: report the view, inherit the BASELINE from upstream tools (facts both tools
  // share), and honor a shared scenario URL. Targets are NOT inherited: the transformation
  // is authored here, so the target fields keep their defaults for the user to own.
  useEffect(() => {
    window.scrollTo(0, 0);
    trackTool.view("business-case-builder");
    const next = {}, got = {}, src = {};
    // EXTERNAL ONLY. getPrimitive would return this tool's own last publish, which is how a
    // marginal derived here came back one session later labelled as inherited from TCO and
    // priced a different contact center's savings. A value you published is not a value you
    // sourced. The cost of external-only is that revisiting the tool no longer restores your
    // own last run; the scenario link is the supported way to carry a scenario forward.
    const take = (field, key, xf = (x) => x) => {
      const v = getExternalPrimitive(key, "business-case-builder");
      if (v != null && !isNaN(v)) {
        next[field] = xf(v); got[field] = true;
        src[field] = getPrimitiveWithSource(key).sourceTool;
      }
    };
    take("agents", "agents");
    take("avgHourly", "agentHourly");
    take("currentAHT", "aht");
    take("currentFCR", "fcr", (x) => Math.round(x * 1000) / 10);        // fraction to percent
    take("currentAttrition", "attritionRate", (x) => Math.round(x * 1000) / 10);
    take("costPerContact", "costPerContact");                          // loaded, context only
    take("marginalPerContact", "marginalPerContact");                  // savings basis
    const annual = getExternalPrimitive("annualContacts", "business-case-builder");
    if (annual != null && !isNaN(annual)) {
      next.monthlyContacts = Math.round(annual / 12); got.monthlyContacts = true;
      src.monthlyContacts = getPrimitiveWithSource("annualContacts").sourceTool;
    } else {
      const mc = getExternalPrimitive("monthlyContacts", "business-case-builder");
      if (mc != null && !isNaN(mc)) {
        next.monthlyContacts = Math.round(mc); got.monthlyContacts = true;
        src.monthlyContacts = getPrimitiveWithSource("monthlyContacts").sourceTool;
      }
    }
    const scn = readScenarioFromUrl();
    if (scn && typeof scn === "object") { Object.assign(next, scn); trackTool.scenarioLoad("business-case-builder"); }
    if (Object.keys(next).length) { setD(prev => ({ ...prev, ...next })); setPulled(got); setSources(src); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const r = computeCase(d, stance, rampOn, mech);
  const conf = confidenceOf(d, r, stance);
  const insights = caseInsights(r, d, stance, conf);

  const spark = (() => {
    const W = 600, H = 88, pad = 8;
    const arr = r.cumFlow;
    const minV = Math.min(...arr), maxV = Math.max(...arr), span = (maxV - minV) || 1;
    const x = i => pad + (i / (arr.length - 1)) * (W - 2 * pad);
    const y = v => pad + (1 - (v - minV) / span) * (H - 2 * pad);
    const pts = arr.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    return { W, H, pts, y0: y(0), pbx: r.payback > 0 ? x(r.payback) : null, end: arr[arr.length - 1] };
  })();
  const paybackLabel = r.payback > 0 ? `${r.payback} mo` : ">36 mo";
  // Colour the months the business actually waits AFTER go-live. With phasing on, a 16-month
  // migration makes any payback under 16 impossible, so absolute 12/18 thresholds painted the
  // honest phased answer red while the ROI tile beside it read green on the same case. The
  // build window is a stated cost, not an alarm; the wait after go-live is the signal.
  const C = { green: GREEN, amber: AMBER, red: RED };
  const stPayback = paybackStatus(r, rampOn);
  const stRoi = roiStatus(r);
  const paybackColor = STATUS_COLOR(stPayback, C);
  const roiColor = r.roiDefined ? STATUS_COLOR(stRoi, C) : MUTED;

  // Publish through the shared normalizer so units and provenance are canonical on the rail.
  useEffect(() => {
    const primitives = {
      agents: n(d.agents), annualContacts: r.annual, monthlyContacts: n(d.monthlyContacts),
      grossSavings: Math.round(r.gross), netSavings: Math.round(r.net),
      capacityReleased: Math.round(r.capacityNet), capacityRealized: Math.round(r.capacityRealized),
      cashReleasing: Math.round(r.cashNet), freedHours: Math.round(r.freedHoursAttributed),
      capacityAction: r.mechLabel, creditClass: r.cred,
      // marginalPerContact is deliberately NOT published. This tool derives it from AHT and
      // wage; it does not measure it. Publishing a derived figure put it on the rail for
      // every other tool to inherit as though it had been sourced. TCO remains the producer.
      stance, paybackMonths: r.payback, threeYearROI: Math.round(r.roi3), implementationCost: n(d.implementationCost),
      year1Savings: Math.round(r.year1), rampOn, migrationMonths: r.M, rampMonths: r.R,
      confidence: conf.grade, analystRead: insights[0],
    };
    publishToolResult("business-case-builder", normalizeForPublish(primitives, { sourceTool: "business-case-builder" }).clean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d, stance, rampOn]);

  // Completion: fire once when the case has real inputs (not the untouched defaults).
  useEffect(() => {
    if (completedRef.current) return;
    const real = n(d.agents) !== DEFAULTS.agents || n(d.monthlyContacts) !== DEFAULTS.monthlyContacts || n(d.implementationCost) !== DEFAULTS.implementationCost || Object.keys(pulled).length > 0;
    if (real) { completedRef.current = true; trackTool.complete("business-case-builder", { real: true, severity: severityBucket(r.payback > 0 ? Math.min(1, r.payback / 36) : 1) }); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d, pulled]);

  const submitCapture = async () => {
    if (!capEmail.includes("@") || capState === "sending") return;
    setCapState("sending");
    try {
      await fetch(CAPTURE_ENDPOINT, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: capEmail, name: capName, company: capCompany, tool: "Business Case Builder", stance, net: fmtK(r.net), gross: fmtK(r.gross), payback: r.payback + "mo", roi: Math.round(r.roi3) + "%", confidence: conf.grade, _subject: `Business Case (${stance}): ${fmtK(r.net)} net for ${capCompany || capName || capEmail}` }),
      });
      setCapState("sent");
    } catch { setCapState("error"); }
  };

  const shareScenario = async () => {
    const ok = await copyShareUrl("/tools/business-case-builder", d);
    if (ok) { setCopied(true); trackTool.scenarioShare("business-case-builder"); setTimeout(() => setCopied(false), 2200); }
  };
  const goNext = (toTool, href) => { trackTool.nextStep("business-case-builder", toTool); window.location.href = href; };

  const bucketRows = [
    { label: "Self-service containment", key: "containment", val: r.buckets.containment },
    { label: "Handle-time reduction (talk + ACW)", key: "handleTime", val: r.buckets.handleTime },
    { label: "FCR improvement (avoided repeats)", key: "fcr", val: r.buckets.fcr },
    { label: "Attrition reduction", key: "attrition", val: r.buckets.attrition },
  ].sort((a, b) => b.val - a.val);

  // Name the tools that actually supplied the baseline. Never assert a tool the user did not run.
  const sourceNames = [...new Set(Object.values(sources).filter(Boolean))].map(toolLabel);
  const sourceSummary = sourceNames.length === 0 ? "an earlier tool run"
    : sourceNames.length === 1 ? `your ${sourceNames[0]} run`
    : `your ${sourceNames.slice(0, -1).join(", ")} and ${sourceNames[sourceNames.length - 1]} runs`;
  const marginalSource = sources.marginalPerContact ? toolLabel(sources.marginalPerContact) : null;

  const gradeColor = conf.grade === "Finance-grade" ? GREEN : conf.grade === "Planning-grade" ? AMBER : MUTED;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: WARM }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:'DM Sans',sans-serif;background:#fff;color:${NAVY};-webkit-font-smoothing:antialiased}a{text-decoration:none;color:inherit}input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}input[type=number]{-moz-appearance:textfield}@media(max-width:700px){.bc-grid{grid-template-columns:1fr!important}.bc-sum{grid-template-columns:1fr!important}}`}</style>

      <nav style={{ background: DEEP, padding: "16px 0" }}>
        <div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 10 }}><LogoMark size={30} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a>
          <a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>Back to Tools</a>
        </div>
      </nav>

      <section style={{ padding: "40px 28px 80px" }}>
        <div style={WRAP}>
          <span style={{ color: ELECTRIC, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Planning Tool</span>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, fontWeight: 400, color: NAVY, margin: "6px 0 6px" }}>Business Case Builder</h2>
          <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.6, marginBottom: 10, maxWidth: 680 }}>Model the ROI of a CX transformation on your real numbers, live and with no sign-up. This tool is built to survive a CFO, so it does four things most ROI calculators do not.</p>
          <ul style={{ fontSize: 13, color: SLATE, lineHeight: 1.7, marginBottom: 20, maxWidth: 680, paddingLeft: 18 }}>
            <li><b>Separates released capacity from cash.</b> Avoided contacts release agent labor capacity valued at marginal cost, not at fully loaded cost per contact. Whether that capacity becomes financial benefit depends on the realization action you select, and until one is selected it converts to nothing.</li>
            <li><b>De-overlaps every lever.</b> Deflection, handle-time, FCR, and attrition never claim the same minute or contact twice.</li>
            <li><b>Weights each lever separately.</b> A stance discounts soft levers harder than defensible ones, so the case is not a single blanket haircut.</li>
            <li><b>Phases savings over a real J-curve.</b> Nothing is earned during the build, so payback reflects migration and ramp instead of landing on day one.</li>
          </ul>

          {Object.keys(pulled).length > 0 && (
            <div style={{ background: ICE, border: `1px solid ${ELECTRIC}40`, borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 12.5, color: NAVY }}>
              Baseline inherited from {sourceSummary}. Fields marked <span style={{ fontSize: 9, fontWeight: 700, color: ELECTRIC, background: "#fff", padding: "1px 5px", borderRadius: 4 }}>PULLED</span> carried over as shared facts and stay editable. Target improvements were left for you to author, because the transformation is the argument, not an inherited assumption.
            </div>
          )}

          <Card>
            <H>Current State</H>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="bc-grid">
              <NumField label="Agent Count" value={d.agents} onChange={v => set("agents", v)} step={5} min={1} pulled={pulled.agents} />
              <NumField label="Avg Agent Hourly Rate" value={d.avgHourly} onChange={v => set("avgHourly", v)} prefix="$" step={0.5} min={0} pulled={pulled.avgHourly} />
              <NumField label="Benefits & Burden" value={d.benefitsPct} onChange={v => set("benefitsPct", v)} suffix="%" hint="Internal planning range 25 to 35%, adjust to your evidence" min={0} max={100} />
              <NumField label="Monthly Contact Volume" value={d.monthlyContacts} onChange={v => set("monthlyContacts", v)} step={1000} min={0} pulled={pulled.monthlyContacts} />
              <NumField label="Current AHT (sec)" value={d.currentAHT} onChange={v => set("currentAHT", v)} step={5} min={1} hint={`${(n(d.currentAHT) / 60).toFixed(1)} min total`} pulled={pulled.currentAHT} />
              <NumField label="Current ACW (sec)" value={d.currentACW} onChange={v => set("currentACW", v)} step={5} min={0} info={DEFS.acw} infoTitle="After-call work" hint="Part of AHT" />
              <NumField label="Current FCR" value={d.currentFCR} onChange={v => set("currentFCR", v)} suffix="%" min={0} max={100} pulled={pulled.currentFCR} />
              <NumField label="Same-Reason Repeat Contacts" value={d.repeatShare} onChange={v => set("repeatShare", v)} suffix="%" min={0} max={95} info={DEFS.repeatShare} infoTitle="Repeat-contact basis" hint="Optional. Blank derives it from FCR" />
              <NumField label="Annual Attrition" value={d.currentAttrition} onChange={v => set("currentAttrition", v)} suffix="%" min={0} max={100} pulled={pulled.currentAttrition} />
              <NumField label="Loaded Cost per Contact" value={d.costPerContact} onChange={v => set("costPerContact", v)} prefix="$" step={0.5} min={0} info={DEFS.loadedCPC} infoTitle="Loaded cost per contact" hint="Context only, not the savings basis" pulled={pulled.costPerContact} />
              <NumField label="Recruiting Cost / Hire" value={d.recruitCostPerHire} onChange={v => set("recruitCostPerHire", v)} prefix="$" step={100} min={0} />
              <NumField label="New Hire Training Days" value={d.trainingDays} onChange={v => set("trainingDays", v)} min={0} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, padding: "10px 14px", background: WARM, borderRadius: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>Savings basis</span>
              <InfoDot text={DEFS.marginal} title="Marginal cost per contact" />
              <span style={{ fontSize: 12, color: SLATE }}>avoided contacts valued at</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: ELECTRIC }}>{fmt2(r.marginal)}</span>
              {r.marginalPulled
                ? <>
                    <span style={{ fontSize: 9, fontWeight: 700, color: "#fff", background: r.marginalStale ? AMBER : ELECTRIC, padding: "1px 5px", borderRadius: 4 }}>{marginalSource ? `FROM ${marginalSource.toUpperCase()}` : "PULLED"}</span>
                    {r.marginalStale && <span style={{ fontSize: 11, color: AMBER, fontWeight: 600 }}>AHT and wage here imply {fmt2(r.derivedMarginal)}, a {Math.round(r.marginalGap * 100)}% gap</span>}
                  </>
                : <span style={{ fontSize: 11, color: MUTED }}>derived from AHT and loaded wage</span>}
              <span style={{ fontSize: 11, color: MUTED }}>vs {fmt2(n(d.costPerContact))} fully loaded</span>
            </div>
          </Card>

          <Card accent={GREEN}>
            <H color={GREEN}>Target Improvements <span style={{ fontWeight: 500, color: MUTED, letterSpacing: 0, textTransform: "none" }}>you author these</span></H>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }} className="bc-grid">
              <NumField label="Handle-time Reduction" value={d.htReduction} onChange={v => set("htReduction", v)} suffix="%" min={0} max={100} info={DEFS.ht} infoTitle="Handle-time reduction" hint="Applied to AHT minus ACW" />
              <NumField label="ACW Reduction" value={d.acwReduction} onChange={v => set("acwReduction", v)} suffix="%" min={0} max={100} hint="Applied to ACW only" />
              <NumField label="FCR Improvement" value={d.fcrImprovement} onChange={v => set("fcrImprovement", v)} suffix="pts" min={0} max={100} info={DEFS.fcr} infoTitle="FCR improvement" hint="Internal planning range 5 to 10 pts, adjust to your evidence" />
              <NumField label="Attrition Reduction" value={d.attritionReduction} onChange={v => set("attritionReduction", v)} suffix="%" min={0} max={100} info={DEFS.attrition} infoTitle="Attrition reduction" hint="Internal planning range 15 to 25%, adjust to your evidence" />
              <NumField label="Self-Service Containment" value={d.containment} onChange={v => set("containment", v)} suffix="%" min={0} max={100} info={DEFS.containment} infoTitle="Self-service containment" hint="Internal planning range 10 to 25%, adjust to your evidence" />
            </div>
            <p style={{ fontSize: 11, color: MUTED, marginTop: 12, lineHeight: 1.5 }}>ACW is modeled as a slice of AHT, so handle-time and ACW reductions never double-count the same minutes. Containment removes contacts from the handled pool before any per-contact saving is applied.</p>
          </Card>

          <Card accent={AMBER}>
            <H color={AMBER}>Investment</H>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }} className="bc-grid">
              <NumField label="Implementation (one-time)" value={d.implementationCost} onChange={v => set("implementationCost", v)} prefix="$" step={5000} min={0} hint="PS, migration, integration" />
              <NumField label="New Platform / Agent / Mo" value={d.newPlatformPerAgentMo} onChange={v => set("newPlatformPerAgentMo", v)} prefix="$" step={5} min={0} hint="Recurring solution cost" />
              <NumField label="Migration Timeline" value={d.migrationMonths} onChange={v => set("migrationMonths", v)} suffix="mo" min={1} max={36} info={DEFS.phasing} infoTitle="Savings phasing" hint="Build phase, about 0% savings" />
              <NumField label="Ramp to Full Savings" value={d.rampMonths} onChange={v => set("rampMonths", v)} suffix="mo" min={1} max={24} hint="Post-go-live climb to 100%" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>Evidence basis</span>
              <InfoDot text={DEFS.confidence} title="Case confidence" />
              <div style={{ display: "flex", gap: 6, background: WARM, padding: 4, borderRadius: 8 }}>
                {Object.entries(EVIDENCE).map(([k, v]) => (
                  <button key={k} onClick={() => set("evidence", k)} style={{ fontSize: 12, fontWeight: 600, padding: "7px 12px", borderRadius: 6, border: "none", cursor: "pointer", background: d.evidence === k ? ELECTRIC : "transparent", color: d.evidence === k ? "#fff" : SLATE }}>{v.label}</button>
                ))}
              </div>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", marginBottom: 16 }}>
              <input type="checkbox" checked={rampOn} onChange={e => setRampOn(e.target.checked)} style={{ width: 15, height: 15, accentColor: ELECTRIC, cursor: "pointer" }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>Phase in savings over migration + ramp <span style={{ color: MUTED, fontWeight: 400 }}>(recommended for an honest payback)</span></span>
            </label>

            <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>
                Capacity action <InfoDot text={DEFS.mech} title="Capacity action" />
              </div>
              <div style={{ fontSize: 12, color: mech === "none" ? AMBER : MUTED, marginBottom: 10 }}>{MECH[mech].note}</div>
              <select value={mech} onChange={e => setMech(e.target.value)} style={{ width: "100%", maxWidth: 420, padding: "10px 12px", fontSize: 13, fontWeight: 600, color: NAVY, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, cursor: "pointer" }}>
                {MECH_ORDER.map(k => <option key={k} value={k}>{MECH[k].label}{k !== "none" ? `  (${Math.round(MECH[k].f * 100)}%)` : ""}</option>)}
              </select>
              <div style={{ fontSize: 11.5, color: MUTED, marginTop: 8, lineHeight: 1.55, maxWidth: 640 }}>
                Freed agent time is capacity, not money. This selects what converts it. Avoided recruiting and training spend is cash-releasing regardless and is never scaled by this factor. Neither are platform or implementation costs.
              </div>
            </div>
          </Card>

          {/* Stance selector */}
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, padding: "18px 22px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 2, display: "flex", alignItems: "center", gap: 6 }}>Case stance <InfoDot text={DEFS.stance} title="Case stance" /></div>
                <div style={{ fontSize: 12, color: MUTED }}>{STANCE[stance].note}</div>
              </div>
              <div style={{ display: "flex", gap: 6, background: WARM, padding: 4, borderRadius: 8 }}>
                {Object.entries(STANCE).map(([k, v]) => (
                  <button key={k} onClick={() => setStance(k)} style={{ fontSize: 12, fontWeight: 600, padding: "8px 14px", borderRadius: 6, border: "none", cursor: "pointer", background: stance === k ? ELECTRIC : "transparent", color: stance === k ? "#fff" : SLATE }}>{v.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 14, padding: "32px 28px", marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: LIGHT, letterSpacing: 1.5, textTransform: "uppercase" }}>Business Case Summary <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>· {STANCE[stance].label} stance</span></h3>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: gradeColor, padding: "4px 10px", borderRadius: 20 }}>Case confidence: {conf.grade}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 22 }} className="bc-sum">
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: GREEN }}>{fmtK(r.net)}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Realizable Annual Savings <span style={{ opacity: 0.6 }}>· run-rate</span></div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{rampOn ? `year 1 ${fmtK(r.year1)} after ramp` : `gross ${fmtK(r.gross)} less ${fmtK(r.haircut)} haircut`}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: paybackColor }}>{paybackLabel}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Payback Period <span style={{ opacity: 0.75 }}>· {STATUS_LABEL[stPayback]}</span></div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{rampOn ? `phased: ${r.M}mo build + ${r.R}mo ramp` : "idealized, phasing off"}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: roiColor }}>{r.roiDefined ? Math.round(r.roi3) + "%" : "n/a"}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>3-Year Return{r.roiDefined ? <span style={{ opacity: 0.75 }}> · {STATUS_LABEL[stRoi]}</span> : null}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{r.roiDefined ? `on ${fmtK(r.tco3)} modeled 3-yr cost` : "no investment entered"}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {bucketRows.map((item, i) => {
                const pctv = r.gross > 0 ? item.val / r.gross * 100 : 0;
                const pctLabel = r.pct[item.key];
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", flex: 1 }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: GREEN, minWidth: 70, textAlign: "right" }}>{fmtK(item.val)}</span>
                    <div style={{ width: 80, height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${pctv}%`, height: "100%", background: GREEN, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", minWidth: 30 }}>{pctLabel}%</span>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.32)", marginTop: 8, letterSpacing: 0.3 }}>Gross modeled benefit before attribution and realization. These four do not sum to the headline.</div>

            <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.10)", display: "flex", gap: 26, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.33)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 }}>Capacity released</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{Math.round(r.freedHoursAttributed).toLocaleString()} hrs/yr</div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{fmtK(r.capacityNet)} labor-equivalent</div>
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.33)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 }}>Converted to value</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: r.mechKey === "none" ? RED : GREEN }}>{fmtK(r.capacityRealized)}</div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{r.mechLabel}, {Math.round(r.mf * 100)}%</div>
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.33)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 }}>Not converted</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: r.unrealizedCapacity > 0 ? AMBER : "rgba(255,255,255,0.5)" }}>{fmtK(r.unrealizedCapacity)}</div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>capacity, excluded from cash</div>
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.33)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 3 }}>Cash-releasing</div>
                <div style={{ fontSize: 17, fontWeight: 600, color: GREEN }}>{fmtK(r.cashNet)}</div>
                <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>recruiting spend avoided</div>
              </div>
            </div>

            {rampOn && (
              <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: 1, textTransform: "uppercase" }}>Cumulative Cash Flow · 36 months</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{r.payback > 0 ? `Breaks even month ${r.payback}` : "No breakeven in 3 yrs"} · ends {fmtK(spark.end)}</span>
                </div>
                <svg viewBox={`0 0 ${spark.W} ${spark.H}`} width="100%" height="88" preserveAspectRatio="none" style={{ display: "block", overflow: "visible" }}>
                  <line x1="0" y1={spark.y0} x2={spark.W} y2={spark.y0} stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                  {spark.pbx != null && <line x1={spark.pbx} y1="0" x2={spark.pbx} y2={spark.H} stroke={GREEN} strokeWidth="1" strokeDasharray="3 3" vectorEffect="non-scaling-stroke" />}
                  <polyline points={spark.pts} fill="none" stroke={LIGHT} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                  {spark.pbx != null && <circle cx={spark.pbx} cy={spark.y0} r="3.5" fill={GREEN} />}
                </svg>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                  <span>Month 0 · minus {fmtK(Math.abs(r.cumFlow[0]))}</span>
                  <span>Migration {r.M}mo</span>
                  <span>Month 36</span>
                </div>
              </div>
            )}
          </div>

          {/* Confidence & open issues */}
          <div style={{ background: "#fff", border: `1px solid ${gradeColor}55`, borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: gradeColor, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Case confidence: {conf.grade} · cost basis {conf.costGrade} · realization {conf.realizationGrade} · {EVIDENCE[conf.evidence].label}</div>
            <p style={{ fontSize: 12, color: SLATE, lineHeight: 1.55, marginBottom: (conf.open.length || conf.withheld.length) ? 8 : 0 }}>Two independent axes, and the badge shows the weaker. Cost basis rates how bookable the cost and investment inputs are. Realization rates whether the modeled savings can be booked at all. Neither certifies that the organization can deliver the targets, which the Transformation Readiness tool assesses separately.</p>
            {conf.withheld.length > 0 && (
              <div style={{ marginBottom: conf.open.length ? 10 : 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Capping the grade, and not a cost-input defect:</div>
                {conf.withheld.map((o, i) => <div key={i} style={{ fontSize: 12, color: SLATE, lineHeight: 1.5, paddingLeft: 12, position: "relative" }}><span style={{ position: "absolute", left: 0, color: AMBER }}>&rsaquo;</span>{o}</div>)}
              </div>
            )}
            {conf.open.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: NAVY, marginBottom: 4 }}>Open items on the cost inputs, before the investment side is final:</div>
                {conf.open.map((o, i) => <div key={i} style={{ fontSize: 12, color: SLATE, lineHeight: 1.5, paddingLeft: 12, position: "relative" }}><span style={{ position: "absolute", left: 0, color: gradeColor }}>›</span>{o}</div>)}
              </div>
            )}
          </div>

          {/* Decision Read */}
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderLeft: `3px solid ${ELECTRIC}`, borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: ELECTRIC, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Decision Read · what could change the conclusion</div>
            {insights.map((t, i) => (
              <p key={i} style={{ fontSize: 12.5, color: SLATE, lineHeight: 1.6, margin: i ? "8px 0 0" : 0 }}>{t}</p>
            ))}
          </div>

          {/* Optional capture */}
          <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
            {capState === "sent" ? (
              <div style={{ fontSize: 13, color: GREEN, fontWeight: 600 }}>Sent. The full business case is on its way to your inbox.</div>
            ) : !capOpen ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: SLATE }}>Want this case emailed to you? <span style={{ color: MUTED, fontSize: 11.5 }}>Your address is used to send this report and to reply if you ask a question. Nothing you entered leaves your browser unless you submit it here, and the download above never asks for it.</span></span>
                <button onClick={() => setCapOpen(true)} style={{ fontSize: 13, fontWeight: 600, color: ELECTRIC, background: "transparent", border: `1px solid ${ELECTRIC}`, borderRadius: 7, padding: "9px 16px", cursor: "pointer" }}>Email me this case</button>
              </div>
            ) : (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                  <input placeholder="Name" value={capName} onChange={e => setCapName(e.target.value)} style={{ padding: "10px 12px", fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6, outline: "none" }} />
                  <input placeholder="Company" value={capCompany} onChange={e => setCapCompany(e.target.value)} style={{ padding: "10px 12px", fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6, outline: "none" }} />
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input type="email" placeholder="you@company.com" value={capEmail} onChange={e => setCapEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submitCapture()} style={{ flex: "1 1 200px", padding: "10px 12px", fontSize: 13, border: `1px solid ${BORDER}`, borderRadius: 6, outline: "none" }} />
                  <button onClick={submitCapture} disabled={!capEmail.includes("@") || capState === "sending"} style={{ fontSize: 13, fontWeight: 700, color: "#fff", background: capEmail.includes("@") ? ELECTRIC : MUTED, border: "none", borderRadius: 6, padding: "10px 18px", cursor: "pointer" }}>{capState === "sending" ? "Sending" : "Send"}</button>
                </div>
                <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>Optional. We send this case once. No list, no spam.</div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <span onClick={() => trackTool.pdf("business-case-builder")} style={{ display: "inline-flex" }}>
              <ReportExport
                toolName="Business Case"
                subtitle={`CX Transformation ROI · ${STANCE[stance].label} stance · ${r.mechLabel} · case confidence ${conf.grade}`}
                userName={capName}
                userEmail={capEmail}
                sections={[
                  { title: "Confidence & Evidence", type: "text", content: `Case confidence: ${conf.grade}, the weaker of two independent axes. Cost basis: ${conf.costGrade} (evidence basis: ${EVIDENCE[conf.evidence].label}), which rates how bookable the cost and investment inputs are. Realization: ${conf.realizationGrade}, which rates whether the modeled savings can be booked at all given the ${r.mechLabel} capacity action. Neither axis certifies that the organization can deliver the operational targets. ${conf.open.length ? `Open items on the cost inputs, before the investment side is final: ${conf.open.join(" ")}` : "No open items were flagged on the cost inputs at the current settings."}${conf.withheld.length ? ` The grade is additionally capped for reasons that are not cost-input defects: ${conf.withheld.join(" ")}` : ""} Savings believability is governed separately by the ${STANCE[stance].label} stance, which weights each lever for attribution risk.` },
                  { title: "Executive Summary", type: "text", content: `Modeled on ${n(d.agents)} agents handling ${(r.annual / 1e6).toFixed(2)}M contacts annually, this CX transformation reaches ${fmtK(r.net)} in realizable annual savings at full run-rate (${STANCE[stance].label} stance) against a ${fmtFull(n(d.implementationCost))} one-time investment and ${fmtFull(r.recurring)} per year in platform cost. ${rampOn ? `Savings are phased over a ${r.M}-month migration and ${r.R}-month ramp, so year one delivers ${fmtK(r.year1)} as the program ramps, producing ` : `Assuming savings land at full run-rate immediately, this produces `}a ${r.payback > 0 ? `${r.payback}-month` : "beyond-three-year"} payback and ${r.roiDefined ? `${Math.round(r.roi3)}% three-year return on ${fmtK(r.tco3)} of modeled investment cost, which is implementation plus three years of the new platform fee and is not a full total cost of ownership because it carries no business-as-usual counterfactual` : `no meaningful ROI percentage, because no investment has been entered`}. Deflected and repeat-avoided contacts are valued at the marginal labor content of ${fmt2(r.marginal)} each rather than the fully loaded ${fmt2(n(d.costPerContact))}. ${stance === "aggressive" ? `Savings are de-overlapped so no lever double-counts another, but the Aggressive stance applies no attribution haircut, so these are full modeled savings with no attribution applied. The Expected stance applies attribution weighting to each lever.` : `Savings are de-overlapped and discounted for attribution risk.`} The headline is realizable savings, not gross labor value: this case releases ${Math.round(r.freedHoursAttributed).toLocaleString()} agent hours a year worth ${fmtK(r.capacityNet)}, of which the ${r.mechLabel} capacity action converts ${fmtK(r.capacityRealized)}, plus ${fmtK(r.cashNet)} of cash-releasing avoided recruiting spend. This is a conditional forecast under the stated assumptions, not a measured outcome.` },
                  { title: "Financial Summary", type: "metrics", items: [
                    { label: "Realizable Annual Savings", value: fmtFull(r.net), color: GREEN, sub: `${STANCE[stance].label} stance · ${r.mechLabel} · run-rate` },
                    { label: rampOn ? "Year 1 (ramped)" : "Gross (pre-haircut)", value: rampOn ? fmtFull(r.year1) : fmtFull(r.gross), color: rampOn ? ELECTRIC : MUTED, sub: rampOn ? `${r.M}mo build + ${r.R}mo ramp` : `Haircut ${fmtFull(r.haircut)}` },
                    { label: "One-time Investment", value: fmtFull(n(d.implementationCost)), color: RED },
                    { label: "Annual Platform Cost", value: fmtFull(r.recurring), color: AMBER },
                    { label: "Payback Period", value: r.payback > 0 ? `${r.payback} months` : ">36 months", color: paybackColor, sub: (r.payback > 0 ? (rampOn ? "phased" : "idealized") : (r.trueBreakevenMonth > 0 ? `breaks even month ${r.trueBreakevenMonth}, outside the horizon` : "no break-even at any horizon")) + ` · ${STATUS_LABEL[stPayback]}` },
                    { label: "3-Year Return", value: r.roiDefined ? `${Math.round(r.roi3)}%` : "n/a", color: roiColor, sub: r.roiDefined ? `on ${fmtFull(r.tco3)} modeled 3-yr investment cost · ${STATUS_LABEL[stRoi]}` : "no investment entered" },
                  ]},
                  { title: "Savings Breakdown", type: "table", rows: bucketRows.map(b => [b.label + (b.key === "attrition" ? " (cash-releasing)" : " (freed labor)"), fmtFull(b.val) + ` (${r.pct[b.key]}% of gross)`]) },
                  { title: "Capacity and Cash", type: "table", rows: [
                    ["Agent hours released per year", Math.round(r.freedHoursAttributed).toLocaleString() + " hrs (after attribution)"],
                    ["Labor-equivalent value of released capacity", fmtFull(r.capacityNet)],
                    ["Capacity action selected", `${r.mechLabel} (${Math.round(r.mf * 100)}% conversion, credit class ${r.cred})`],
                    ["Capacity converted to value", fmtFull(r.capacityRealized)],
                    ["Capacity NOT converted, excluded from the cash case", fmtFull(r.unrealizedCapacity)],
                    ["Cash-releasing savings (recruiting spend avoided)", fmtFull(r.cashNet)],
                    ["Trainee ramp time, treated as capacity not cash", fmtFull(r.attritionCapacity * STANCE[stance].a) + " after attribution, already inside the capacity figure above"],
                    ["Realizable annual savings", fmtFull(r.net)],
                  ]},
                  { title: "Decision Read", type: "findings", items: insights },
                  { title: "Key Assumptions", type: "table", rows: [
                    ["Loaded hourly rate", fmtFull(r.loaded) + ` per hr (${n(d.avgHourly)} plus ${n(d.benefitsPct)}% burden)`],
                    ["Marginal cost per contact (savings basis)", fmt2(r.marginal) + (r.marginalPulled ? ` (inherited from ${marginalSource || "an earlier tool run"}${r.marginalStale ? `, ${Math.round(r.marginalGap * 100)}% away from the ${fmt2(r.derivedMarginal)} implied by the AHT and wage on this case` : ""})` : " (derived from AHT and loaded wage)")],
                    ["Fully loaded cost per contact (context)", fmt2(n(d.costPerContact))],
                    ["Annual contacts", (r.annual).toLocaleString()],
                    ["Contacts deflected (containment)", Math.round(r.deflected).toLocaleString() + ` (${n(d.containment)}%)`],
                    ["Handled pool (post-deflection)", Math.round(r.handled).toLocaleString()],
                    ["Handle-time saved per contact", `${(((n(d.currentAHT) - Math.min(n(d.currentACW), n(d.currentAHT))) * n(d.htReduction) / 100) + (Math.min(n(d.currentACW), n(d.currentAHT)) * n(d.acwReduction) / 100)).toFixed(0)}s`],
                    ["Avoided repeat contacts (FCR)", Math.round(r.avoidedRepeats).toLocaleString()],
                    ["Avoided turnover (attrition)", `${r.avoidedTurnover.toFixed(1)} agents per yr`],
                    ["Savings phasing", rampOn ? `${r.M}-mo migration (0% savings) plus ${r.R}-mo linear ramp to full` : "Off, full savings assumed from day one"],
                    ...(rampOn ? [["Year 1 savings (ramped)", fmtFull(r.year1) + ` of ${fmtFull(r.net)} run-rate`]] : []),
                    ["Capacity action (realization)", `${r.mechLabel}, ${Math.round(r.mf * 100)}% of freed labor, credit class ${r.cred}`],
                    ["Repeat-contact basis", r.repeatBasis === "measured" ? `measured, ${Math.round(r.measuredRepeatShare * 100)}% of volume` : `derived from FCR (proxy), implies ${Math.round(r.impliedRepeatShare * 100)}% repeat share`],
                    ["Repeat population (the FCR denominator)", Math.round(r.repeatPopulation).toLocaleString() + ` contacts, of which ${Math.round(r.fcrReductionRatio * 100)}% are removed by the ${r.fcrLiftEffectivePts} point lift`],
                    ["Underlying issues (contacts less repeats)", Math.round(r.issues).toLocaleString()],
                    ["Attribution weighting", `containment ${Math.round(STANCE[stance].c * 100)}%, handle-time ${Math.round(STANCE[stance].h * 100)}%, FCR ${Math.round(STANCE[stance].f * 100)}%, attrition ${Math.round(STANCE[stance].a * 100)}%`],
                  ]},
                  { title: "Recommended Next Steps", type: "next", items: [
                    { tool: "TCO Calculator", reason: "Validate the platform cost assumptions behind this case", href: "/tools/tco-calculator" },
                    { tool: "Transformation Readiness", reason: "Confirm the organization can actually deliver these targets", href: "/tools/transformation-readiness" },
                    { tool: "Contract Risk Scanner", reason: "Pressure-test vendor pricing before it enters the case", href: "/tools/contract-risk" },
                  ]},
                  { title: "Methodology", type: "text", content: "Avoided contacts release agent labor capacity valued at marginal cost, the handle-time labor content of a contact, not the fully loaded cost per contact, because fixed tech, facilities and supervision do not fall when one contact is removed. This valuation is shared with the TCO Calculator, so the two tools are consistent on the value of the same contact. Consistency establishes a shared definition, not that the released capacity is cash-releasing. Savings are computed on the post-deflection handled pool so deflected contacts are never also credited with handle-time or FCR savings. After-call work is treated as a disjoint slice of AHT, so handle-time and ACW reductions cannot double-count the same minutes. Each lever is then weighted by an attribution-confidence factor (the stance). Attribution is then followed by a separate and independent adjustment: freed agent labor is released capacity, not cash, and converts to money only through a named action, so containment, handle-time and FCR savings are scaled by the " + r.mechLabel + " capacity action at " + Math.round(r.mf * 100) + "%. Avoided recruiting and training spend is cash-releasing and is never scaled. Platform and implementation costs are real cash out and are never scaled by either adjustment. " + (r.repeatBasis === "fcr-proxy" ? "Repeat-contact volume was not supplied, so avoided repeats are derived from FCR on the underlying issue count rather than on total handled contacts, which assumes one repeat per unresolved issue and is a proxy rather than a measurement." : "Avoided repeats are computed on measured same-reason repeat volume.") + (rampOn ? " Savings are phased over a monthly cash-flow model: zero during the migration build, then a linear ramp to full run-rate over the ramp window, so payback reflects the real J-curve rather than assuming benefits land on day one." : " Savings phasing was turned OFF for this case, so the model assumes full run-rate savings from month one. Payback and ROI here are idealized figures that ignore the migration build and the post-go-live ramp, and they will be shorter and higher than the phased case a CFO should be shown.") + " Return is calculated against modeled three-year investment cost, meaning one-time implementation plus three years of the new platform fee. This is deliberately not called total cost of ownership: it contains no business-as-usual counterfactual, so it excludes current platform spend that would be displaced, migration overlap, termination and decommissioning, internal project labor and usage-based charges. A full incremental comparison would move this figure in both directions." + (stance === "aggressive" ? " This case was run on the Aggressive stance, which applies no attribution haircut, so the savings side of this document is not conservative and should not be presented as such." : " On this stance each lever carries an attribution weight below one, so the modeled figure is lower than the technical potential by design.") },
                ]}
              />
            </span>
            <button onClick={shareScenario} style={{ background: "#fff", border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "13px 22px", borderRadius: 8, cursor: "pointer" }}>{copied ? "Link copied" : "Share scenario link"}</button>
            <a href="/contact" onClick={() => trackTool.nextStep("business-case-builder", "contact")} style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "13px 22px", borderRadius: 8 }}>Connect with a Consultant</a>
            <button onClick={() => goNext("tco-calculator", "/tools/tco-calculator")} style={{ background: "#fff", border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "13px 22px", borderRadius: 8, cursor: "pointer" }}>TCO Calculator</button>
          </div>
          <div style={{ fontSize: 11.5, color: MUTED, lineHeight: 1.6, marginTop: 10, maxWidth: 760 }}>Your results do not determine whether the consultant option appears, and nothing you entered is shared with anyone unless you ask us to. If a commercial relationship exists with any specialist we introduce, it is disclosed before an introduction is made. No vendor pays to appear here and this tool recommends no vendor.</div>
        </div>
      </section>

      <footer style={{ background: DEEP, padding: "40px 28px 28px" }}><div style={WRAP}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}><LogoMark size={24} /><span style={{ color: "#fff", fontWeight: 600, fontSize: 12 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>© 2026 The Center of CX</span>
        <div style={{ display: "flex", gap: 16 }}><a href="/privacy" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Privacy</a><a href="/terms" style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Terms</a></div></div></div></footer>
    </div>
  );
}
