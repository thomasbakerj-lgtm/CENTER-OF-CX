import { useState, useEffect, useRef } from "react";
import ReportActions from "./ReportActions";
import InfoDot from "./src/lib/InfoDot";
import { COLORS } from "./src/lib/benchmarks";
import { publishToolResult, getPrimitive } from "./src/lib/toolData";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { MECH, MECH_ORDER } from "./src/lib/mech";

const { green: GREEN, amber: AMBER, red: RED, electric: ELECTRIC, navy: NAVY, muted: MUTED } = COLORS;
const DEEP = "#061325"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const BORDER = "#D8E3ED";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };

const money = (n) => { const v = Math.round(n); return (v < 0 ? "-$" : "$") + Math.abs(v).toLocaleString(); };
const money2 = (n) => "$" + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtX = (x) => (Math.round(Number(x) * 100) / 100).toString();
const pct = (n, d = 1) => (n * 100).toFixed(d) + "%";
const num = (v) => { const x = parseFloat(String(v).replace(/[^0-9.\-]/g, "")); return isNaN(x) ? 0 : x; };
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// DEFS is the future glossary content: write once, lift later.
const DEFS = {
  fcrDef: { title: "FCR definition", text: "FCR has no industry standard. Call-level same-channel scores higher than cross-channel contact-level, and a post-call survey reads differently than an internal callback window. Declare yours so the result stays comparable to itself over time, not to a benchmark measured a different way." },
  scope: { title: "Resolution scope", text: "The set of channels a resolution must hold across. Voice-only is the most generous and inflates FCR. Enterprise one-contact is the strictest because a customer who failed in a bot, searched help, then called counts as unresolved. Narrower scope understates leakage." },
  marginalCPC: { title: "Marginal cost per contact", text: "The cost that actually disappears when one contact goes away: agent wage plus benefits for the handle time, not facilities or licenses. Savings are valued here because fixed costs do not refund when volume drops." },
  loadedCPC: { title: "Loaded cost per contact", text: "Fully burdened cost including facilities, software, and overhead. Used only for the unit metric you report upward, never for savings, because valuing savings at loaded cost is the most common way these numbers get inflated." },
  repeatModel: { title: "Repeat-behavior model", text: "The same FCR yields different leakage depending on how an unresolved issue behaves. One-callback assumes each failed issue returns once. Geometric assumes callbacks can themselves fail, so some issues return several times. If you have measured your real repeat rate, enter it and ignore the model." },
  repeatMult: { title: "Repeat complexity multiplier", text: "Repeat contacts often cost more than first contacts: longer handle time, more transfers, escalation, and back-office rework. Published estimates put repeats at 1.5x to 2x a first contact, with outliers to 4x. Guidance: 1.0x to 2.0x is the normal modeled range, 2.0x to 2.5x is elevated and fits centers where repeats escalate or run long, and above 2.5x is a high assumption to validate against your own handle-time and escalation data before using it in a business case. Default is 1.0x. Raise it only on evidence, do not invent the number." },
  ceiling: { title: "Opportunity times capture", text: "Two separate truths. Opportunity is how much controllable leakage exists, which is high when your diagnostic is weak. Capture is how much of it you can realistically book in year one, which is high when your diagnostic is strong. Headroom is measured against a practical maximum, not a perfect 100%, because gains get much harder above world-class. That maximum tightens as the definition broadens: voice-only 93%, cross-channel 90%, digital plus assisted 89%, enterprise one-contact 88%. Their product caps your target, so a center cannot claim a gain it has no realistic ability to capture." },
  controllable: { title: "Controllable vs non-controllable burden", text: "Only part of your repeat burden is inside your control this year. The rest comes from issue complexity, structural constraints, and customer-driven failures that no process fix removes. Savings are drawn only from the controllable slice." },
  sourcing: { title: "Sourcing model", text: "For in-house teams, reduced volume is capacity, not cash, until a mechanism converts it. For an outsourced per-contact model, reduced volume stops being billed, so it converts to cash directly. Same volume drop, very different cash speed." },
  mech: { title: "Realization mechanism", text: "Freed agent time is capacity, not cash, until you commit to converting it. None means zero dollars realized for in-house. The mechanism sets how much capacity becomes budget, from absorbing growth up to removing headcount." },
  invest: { title: "One-time vs recurring cost", text: "Raising FCR carries an upfront cost (integration, content build) and an ongoing cost (knowledge upkeep, coaching). Payback and year-one net are shown against both, because a project can be net positive annualized yet cash negative in its first year." },
  confidence: { title: "Confidence (two axes)", text: "Cost basis asks whether inputs are validated: estimate, operations data, or finance-confirmed. Realization asks whether the savings can be booked given your mechanism and sourcing. The headline reports the weaker of the two, and any impossible input or undeclared definition forces Directional." },
};

function NumField({ label, value, onChange, prefix, suffix, step = 1, min = 0, max = 1e12, pulled, info, infoTitle, align }) {
  const valRef = useRef(value); const holdRef = useRef(null); const delayRef = useRef(280);
  useEffect(() => { valRef.current = value; }, [value]);
  const commit = (v) => { const c = clamp(Math.round(v * 10000) / 10000, min, max); valRef.current = c; onChange(c); };
  const startHold = (dir) => {
    commit(num(valRef.current) + dir * step); delayRef.current = 280;
    const tick = () => { commit(num(valRef.current) + dir * step); delayRef.current = Math.max(45, delayRef.current - 30); holdRef.current = setTimeout(tick, delayRef.current); };
    holdRef.current = setTimeout(tick, delayRef.current);
  };
  const stopHold = () => { if (holdRef.current) clearTimeout(holdRef.current); holdRef.current = null; };
  return (
    <div>
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: SLATE, marginBottom: 6 }}>
        {label}{info && <InfoDot text={info} title={infoTitle} align={align} />}
        {pulled && <span style={{ fontSize: 9, fontWeight: 700, color: ELECTRIC, background: `${ELECTRIC}14`, padding: "1px 6px", borderRadius: 4, letterSpacing: 0.5 }}>PULLED</span>}
      </label>
      <div style={{ display: "flex", alignItems: "stretch", border: `1px solid ${BORDER}`, borderRadius: 8, overflow: "hidden", background: "#fff" }}>
        <button onMouseDown={() => startHold(-1)} onMouseUp={stopHold} onMouseLeave={stopHold} onTouchStart={(e) => { e.preventDefault(); startHold(-1); }} onTouchEnd={stopHold} style={{ width: 38, border: "none", borderRight: `1px solid ${BORDER}`, background: WARM, color: SLATE, fontSize: 18, cursor: "pointer" }}>−</button>
        <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 10px", gap: 2 }}>
          {prefix && <span style={{ color: MUTED, fontSize: 14 }}>{prefix}</span>}
          <input value={value} onChange={(e) => commit(num(e.target.value))} inputMode="decimal" style={{ width: "100%", border: "none", outline: "none", fontSize: 15, fontWeight: 600, color: NAVY, textAlign: "center", background: "transparent" }} />
          {suffix && <span style={{ color: MUTED, fontSize: 14 }}>{suffix}</span>}
        </div>
        <button onMouseDown={() => startHold(1)} onMouseUp={stopHold} onMouseLeave={stopHold} onTouchStart={(e) => { e.preventDefault(); startHold(1); }} onTouchEnd={stopHold} style={{ width: 38, border: "none", borderLeft: `1px solid ${BORDER}`, background: WARM, color: SLATE, fontSize: 18, cursor: "pointer" }}>+</button>
      </div>
    </div>
  );
}

function Sel({ label, value, onChange, options, info, infoTitle, align, disabled, note }) {
  return (
    <div>
      <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: disabled ? MUTED : SLATE, marginBottom: 6 }}>{label}{info && <InfoDot text={info} title={infoTitle} align={align} />}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} style={{ width: "100%", padding: "11px 12px", fontSize: 14, fontWeight: 600, color: disabled ? MUTED : NAVY, border: `1px solid ${BORDER}`, borderRadius: 8, background: disabled ? WARM : "#fff", outline: "none", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.7 : 1 }}>
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      {note && <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.45, margin: "6px 0 0" }}>{note}</p>}
    </div>
  );
}

function Tag({ text, color }) {
  return <span style={{ fontSize: 9, fontWeight: 700, color, background: `${color}16`, padding: "1px 6px", borderRadius: 4, letterSpacing: 0.4, textTransform: "uppercase" }}>{text}</span>;
}

const DIMS = [
  { id: "policy", name: "Policy + Process Gaps", color: RED, icon: "📋", ownerClass: "Enterprise + CC controllable", owner: "Ops leadership and the business owner", desc: "Policies that force callbacks: verification that cannot finish in one contact, approval chains, processes that span departments.",
    qs: ["Agents can resolve the top 10 contact types without escalation or manager approval.", "Policy exceptions have documented authority levels agents apply in real time.", "Multi-step processes (claims, disputes, changes) complete in a single interaction.", "Customers do not call back to confirm an action was completed."],
    test: { move: "Audit the escalation authority matrix for the top 10 intents", lead: "Escalation rate on those intents", lag: "Repeat contact rate", stop: "Do not scale if CSAT or QA accuracy drops" } },
  { id: "handoff", name: "Handoff + Transfer Failures", color: AMBER, icon: "↗️", ownerClass: "CC + Tech controllable", owner: "Contact center ops and CX tech", desc: "Context lost during transfers, departments that do not share information, warm transfers that go cold.",
    qs: ["When agents transfer, full context (reason, steps, mood) transfers with it.", "Transferred customers do not re-explain their issue.", "Cross-department handoffs have SLAs for response and resolution.", "Transfer rates are tracked by reason code and used to improve routing."],
    test: { move: "Map the top 5 transfer destinations and whether context travels", lead: "Transfer rate and re-explanation rate", lag: "Repeat contact rate on transferred intents", stop: "Do not scale if AHT rises without FCR gain" } },
  { id: "channel", name: "Channel Mismatch", color: ELECTRIC, icon: "📱", ownerClass: "Tech + CC controllable", owner: "CX tech and routing", desc: "Customers forced into the wrong channel, or channel switches that lose context.",
    qs: ["Complex issues route to the channel best suited for resolution, not forced through chat or IVR.", "When a customer switches channels, prior context is available.", "Self-service handles the issues customers want to self-serve, not just the easy ones.", "Channel containment is measured by resolution, not just deflection."],
    test: { move: "Map top 10 intents to the channel best suited for resolution", lead: "Cross-channel switch rate before resolution", lag: "Enterprise one-contact resolution rate", stop: "Do not scale if deflection rises but resolution does not" } },
  { id: "knowledge", name: "Knowledge + Information Gaps", color: "#7C3AED", icon: "📚", ownerClass: "CC controllable", owner: "Knowledge and enablement", desc: "Outdated articles, missing procedures, conflicting sources, knowledge that exists but cannot be found.",
    qs: ["Knowledge articles are reviewed and updated at least quarterly.", "Agents report knowledge gaps and those reports are actioned within 2 weeks.", "There is a single source of truth, not conflicting wikis and tribal knowledge.", "Product, policy, and system changes hit the knowledge base before going live."],
    test: { move: "Have 5 agents search answers to the top 10 questions and time it", lead: "Search time and answer-found rate", lag: "Repeat contact rate on knowledge-driven intents", stop: "Do not scale if found answers are inaccurate" } },
  { id: "skill", name: "Agent Skill + Training Gaps", color: "#EC4899", icon: "🎯", ownerClass: "CC controllable", owner: "Contact center ops and training", desc: "Agents who lack the skill, confidence, or authority to resolve on first contact.",
    qs: ["Agents are assessed on specific skill gaps, not just overall QA, and training targets those gaps.", "New agents can identify when they are out of their depth and escalate gracefully.", "Tenured agents have skills and authority that grow with experience.", "Call types with the lowest FCR are analyzed for skill or training root causes."],
    test: { move: "Pull FCR by tenure band on the lowest-FCR intents", lead: "New-agent vs tenured FCR gap", lag: "Repeat contact rate by tenure", stop: "If tenured agents are also low, the gap is authority, not training" } },
  { id: "workflow", name: "Broken Workflows + Systems", color: "#0EA5E9", icon: "⚙️", ownerClass: "Tech controllable", owner: "CX tech and IT", desc: "Systems that do not talk to each other, manual steps that introduce errors, follow-up required by design.",
    qs: ["The top 10 workflows complete end-to-end in a single or tightly integrated system.", "Agents do not manually copy data between applications.", "System errors and timeouts are rare and do not force a callback.", "Follow-up notifications are triggered by the system, not the agent."],
    test: { move: "Map the top 10 workflows end-to-end and flag callback-by-design steps", lead: "Manual re-entry steps and system error rate", lag: "Repeat contact rate on system-driven intents", stop: "Do not scale a workaround that hides the integration gap" } },
];

// Pure engine. UI and export both read this object. No separate aggregation.
function engine(I) {
  const { M, fcr: fcrIn, mCPC, lCPC, repeatModel, measuredRate, measuredTargetRate, pathModel, repeatMult, dScore, askTarget, mech, sourcing, investOneTime, investRecurring, costBasis, defDeclared, fcrPulledDirty, scope, method, windowDays } = I;
  let fcr = fcrIn, fcrWasPercent = false;
  if (fcr > 1 && fcr <= 100) { fcr = fcr / 100; fcrWasPercent = true; }
  const fcrImpossible = !(fcr > 0 && fcr < 1);
  if (fcrImpossible) fcr = clamp(fcr, 0.01, 0.99);
  const opportunity = (s) => clamp(0.15 + (5 - s) / 4 * 0.65, 0.15, 0.80);
  const capture = (s) => clamp(0.25 + (s - 1) / 4 * 0.65, 0.25, 0.90);
  const shareOne = (f) => (1 - f) / (2 - f);
  const shareGeo = (f) => (1 - f);
  const repeatCPC = mCPC * repeatMult;

  let repeatShare, shareSource, shareBasis;
  if (repeatModel === "measured") { repeatShare = measuredRate; shareSource = "measured data"; shareBasis = "Measured"; }
  else if (repeatModel === "geometric") { repeatShare = shareGeo(fcr); shareSource = "geometric model"; shareBasis = "Modeled"; }
  else { repeatShare = shareOne(fcr); shareSource = "one-callback model"; shareBasis = "Modeled"; }
  const repeats = M * repeatShare;
  const burdenYr = repeats * repeatCPC * 12;

  const opp = opportunity(dScore), cap = capture(dScore);
  // Practical FCR ceiling by definition strictness. Broader scope means more ways
  // for a contact to count as unresolved, so the achievable ceiling falls.
  // "digital" previously duplicated "cc" at 0.90, which made two scope options
  // produce identical output. It sits between cc and enterprise because it adds
  // self-service to the resolution set. These are judgment values, stated openly.
  const practicalMax = { voice: 0.93, cc: 0.90, digital: 0.89, enterprise: 0.88 }[scope] || 0.90;
  const maxUplift = Math.max(0, practicalMax - fcr) * opp * cap;
  const ceilingFCR = clamp(fcr + maxUplift, fcr, practicalMax);
  const overCeiling = askTarget > ceilingFCR + 1e-9;
  const target = clamp(askTarget, fcr, ceilingFCR);

  let repeatShareT;
  if (repeatModel === "measured") {
    if (measuredTargetRate != null && measuredTargetRate > 0) repeatShareT = measuredTargetRate;
    else if (pathModel === "geometric") repeatShareT = shareGeo(target);
    else if (pathModel === "proportional") repeatShareT = (1 - fcr) > 0 ? repeatShare * ((1 - target) / (1 - fcr)) : 0;
    else repeatShareT = shareOne(target);
  } else if (repeatModel === "geometric") repeatShareT = shareGeo(target);
  else repeatShareT = shareOne(target);
  const repeatsT = M * repeatShareT;

  const volReduced = Math.max(0, repeats - repeatsT);
  const grossYr = volReduced * repeatCPC * 12;
  const controllableBurdenYr = burdenYr * opp;
  const nonControllableBurdenYr = burdenYr - controllableBurdenYr;

  const mechKey = normMech(mech);
  const MECHVAL = MECH[mechKey].f;
  // On a per-contact outsourced contract the invoice falls with volume, so no
  // capacity mechanism is needed and none is applied. The mechanism selector is
  // inert here, which is why the UI disables it and the report stops naming it.
  const mechApplies = sourcing !== "bpo";
  const realFactor = mechApplies ? MECHVAL : 1.0;
  const realizableYr = grossYr * realFactor;

  const steadyMo = realizableYr / 12;
  const recurMo = investRecurring / 12;
  // A project that realizes nothing never pays back. The old `realizableYr > 0`
  // guard excluded exactly that case, so a $0 mechanism reported "beyond 48 months"
  // when the true answer is never, and the recurring-cost flag never fired.
  const neverPaysBack = realizableYr <= investRecurring;
  const rampMo = (m) => (m >= 4 ? steadyMo : steadyMo * (m / 4));
  let cum = 0, payback = null;
  for (let m = 1; m <= 48; m++) { cum += rampMo(m) - recurMo; if (payback === null && cum >= investOneTime) payback = m; }
  let c12 = 0; for (let m = 1; m <= 12; m++) c12 += rampMo(m) - recurMo;
  const year1Net = c12 - investOneTime;
  // Standalone year two: steady-state savings less the recurring cost. The one-time
  // cost is gone by then. Reported separately from the two-year cumulative, because
  // a single figure named "year-2 net" that silently carried year one overstated
  // year two by exactly the amount of year-one net.
  const year2Net = realizableYr - investRecurring;
  const cum2Yr = year1Net + year2Net;
  const paybackLabel = neverPaysBack ? "never at current scope" : payback ? "month " + payback : "beyond 48 months";

  const band = { estimate: 0.25, ops: 0.15, finance: 0.10 }[costBasis];
  // BPO realization is Planning-grade, full stop. It was previously Math.max(rank, 2),
  // which let an inert mechanism selector lift an outsourced case to Finance-grade.
  // Finance-grade requires confirming there is no minimum volume commitment, which
  // this tool does not collect, so it routes that to Contract Risk instead.
  // BPO converts through billing, which is finance-creditable but not confirmed
  // cash until a minimum volume commitment is ruled out. Planning-grade, always.
  let realizationRank = mechApplies ? CRED_RANK[MECH[mechKey].cred] : 2;

  const flags = [];
  if (fcrPulledDirty) flags.push("Current FCR was pulled from another tool as a whole number and normalized to " + pct(fcr) + ". Confidence is capped until you confirm it. The upstream tool is publishing FCR in the wrong unit, which is a suite-contract issue worth fixing at the source.");
  if (fcrWasPercent) flags.push("Current FCR arrived as a whole number and was read as " + pct(fcr) + ". Confirm the upstream tool publishes FCR as a fraction, not a percentage.");
  if (fcrImpossible) flags.push("Current FCR was outside 0 to 100% and had to be clamped. The result is unreliable until the input is corrected.");
  if (repeats > M + 1) flags.push("Repeat contacts exceed total contacts, which is impossible. The inputs are inconsistent.");
  if (repeatModel === "measured" && (measuredRate < 0 || measuredRate > 0.6)) flags.push("Measured repeat share is outside the plausible 0 to 60% range. Recheck the figure.");
  if (method === "internal" && windowDays < 7) flags.push("Callback window of " + windowDays + " days is short. Internal FCR measured on a short window captures fewer return contacts and tends to run high, so the true repeat burden is likely larger than shown. This matters most for cross-channel and enterprise scope, where customers often return days later.");
  if (neverPaysBack) flags.push("Recurring cost meets or exceeds steady-state realizable savings, so this project does not pay back at any horizon under the current scope. Reduce recurring cost, strengthen the mechanism, or narrow the target.");
  if (repeatMult > 2.5) flags.push("Repeat complexity multiplier above 2.5x sits beyond most published estimates, which put repeats at 1.5x to 2x a first contact, with outliers to 4x. Confirm it against your own handle-time, escalation, and rework data before presenting these figures.");
  if (lCPC && mCPC > lCPC) flags.push("Marginal cost per contact exceeds loaded cost, which is impossible. Correct the inputs.");
  if (repeatMult < 1) flags.push("Repeat complexity multiplier below 1.0 implies repeats are cheaper than first contacts, which is implausible.");
  else if (lCPC && mCPC >= 0.85 * lCPC) flags.push("Marginal cost is close to loaded cost. You may have entered loaded cost. The savings basis must be marginal.");
  else if (lCPC && mCPC > 0 && mCPC <= 0.35 * lCPC) flags.push("Marginal cost is " + Math.round((mCPC / lCPC) * 100) + "% of loaded cost. Marginal cost is mostly agent wage and benefits, so it usually runs 50% to 75% of loaded. A ratio this low means either an unusually fixed cost base or a wrong input, and burden scales directly with it. Confirm the figure before presenting, especially if it was pulled from another tool.");
  if (!defDeclared) flags.push("FCR definition not declared. The result is not comparable across centers until you state how you measure it.");
  if (target <= fcr + 1e-9) flags.push("Target FCR is not above current. There is no improvement to value.");
  if (overCeiling) flags.push("Target was capped at " + pct(ceilingFCR) + ", the most your diagnostic says you can capture.");
  if (mech === "none" && sourcing !== "bpo") flags.push("No mechanism and in-house sourcing. Realizable savings are $0 until you commit to one.");
  if (mechApplies && mechKey === "vendor") flags.push("You selected in-house sourcing and a mechanism that reduces outsourcer volume. Those only hold together if you route overflow or seasonal volume to a per-contact vendor. If you do not, there is no invoice to reduce, the savings are capacity rather than cash, and this should be modeled as avoid hiring instead. This is the only path to Finance-grade realization that does not reduce headcount, so it will be the first assumption a CFO tests.");
  if (!mechApplies) flags.push("Outsourced per-contact sourcing converts volume reduction to cash at 100%, and the realization mechanism does not apply. This assumes billing tracks actual volume with no minimum commitment. If your contract carries a volume floor, nothing is saved until you drop below it. Confirm the commitment terms in Contract Risk Scanner before presenting these savings.");
  const hardFlag = flags.some((f) => /impossible|outside the plausible|outside 0 to 100|had to be clamped/.test(f));

  let costConf = costBasis === "finance" ? "Finance-grade" : costBasis === "ops" ? "Planning-grade" : "Directional";
  let realConf = realizationRank >= 3 ? "Finance-grade" : realizationRank >= 2 ? "Planning-grade" : "Directional";
  if (hardFlag || !defDeclared) { costConf = "Directional"; realConf = "Directional"; }
  const order = ["Directional", "Planning-grade", "Finance-grade"];
  if (fcrPulledDirty) { const ci = order.indexOf("Planning-grade"); if (order.indexOf(costConf) > ci) costConf = "Planning-grade"; if (order.indexOf(realConf) > ci) realConf = "Planning-grade"; }
  const headlineConf = order[Math.min(order.indexOf(costConf), order.indexOf(realConf))];
  const MECH_REASON = {
    none: "no capacity action is selected, so freed capacity converts to no cash",
    growth: "absorbing growth or backlog builds capacity, which finance does not credit as savings this cycle",
    overtime: "reducing overtime stops a payment finance already makes, which is creditable, but it is not cash leaving the cost base",
    hiring: "avoiding or slowing hiring is finance-creditable over the cycle, but it is not cash leaving the cost base",
    vendor: "reducing outsourcer volume takes cash off the invoice",
    headcount: "reducing headcount takes cash off the payroll",
  };
  const mechReason = mechApplies
    ? MECH_REASON[mechKey]
    : "per-contact billing falls directly with volume, so no capacity mechanism is required. It is held at Planning-grade rather than Finance-grade until a minimum volume commitment is ruled out";
  const weakerIsReal = order.indexOf(realConf) <= order.indexOf(costConf);
  let confReason;
  if (hardFlag) confReason = "an input is physically impossible, so the result is blocked.";
  else if (!defDeclared) confReason = "the FCR definition is not declared, so the result is not comparable across centers.";
  else if (fcrPulledDirty) confReason = "FCR was pulled from another tool in the wrong unit, so confidence is capped until you confirm the value.";
  else if (weakerIsReal) confReason = "realization is " + realConf + " because " + mechReason + ".";
  else confReason = "cost basis is " + costConf + " because " + (costBasis === "estimate" ? "cost inputs are estimates, not validated data" : costBasis === "ops" ? "cost inputs are operations data, not finance-confirmed" : "cost inputs are finance-confirmed") + ".";

  return { mechKey, repeatCPC, repeatShare, shareSource, shareBasis, repeats, burdenYr, opp, cap, maxUplift, ceilingFCR, practicalMax, target, overCeiling, repeatsT, volReduced, grossYr, controllableBurdenYr, nonControllableBurdenYr, realFactor, mechApplies, realizableYr, steadyMo, payback, paybackLabel, neverPaysBack, year1Net, year2Net, cum2Yr, band, headlineConf, costConf, realConf, confReason, flags, hardFlag };
}

/* The mechanism list lived here as a fourth divergent copy, keyed "absorb" where
   the shared module says "growth". It now comes from src/lib/mech.js. Any scenario
   link minted before this change still carries the old key, so normalize on read. */
const MECH_ALIAS = { absorb: "growth" };
const normMech = (m) => (MECH[m] ? m : MECH[MECH_ALIAS[m]] ? MECH_ALIAS[m] : "hiring");
const MECH_OPTS = MECH_ORDER.map((k) => ({ v: k, l: MECH[k].label + (k === "none" ? " ($0)" : `  (${Math.round(MECH[k].f * 100)}%)`) }));

/* Realization confidence follows the credit class, not the mechanism name.
   Capacity-only is Directional. Finance-creditable is Planning-grade. Cash out
   the door is Finance-grade. This replaced a rubric in which Finance-grade
   realization was reachable only through headcount reduction, the one mechanism
   the suite explicitly tells people not to default to. */
const CRED_RANK = { none: 0, capacity: 1, finance: 2, cash: 3 };
const LABELS = ["", "Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
const GAMING = ["Reopen / repeat-contact rate", "Transfer rate", "Escalation rate", "AHT drift (chasing FCR by lengthening calls)", "Confirmed bot containment, not raw containment", "CSAT / CES", "QA resolution accuracy", "Complaint rate"];

function LogoMark({ size = 30 }) {
  return <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity={0.6} /><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity={0.8} /><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" /><line x1="-14" y1="-14" x2="14" y2="14" stroke={LIGHT} strokeWidth="5.5" strokeLinecap="round" /><line x1="14" y1="-14" x2="-14" y2="14" stroke={LIGHT} strokeWidth="5.5" strokeLinecap="round" /></g></svg>;
}

/* Scenario contract. Defaults are STATIC on purpose: the state initializers
   below seed from cross-tool pulls, but the URL diff must be taken against a
   fixed baseline or the same link would decode differently in another session. */
const TOOL_ID = "fcr-leakage";
const ROUTE = "/tools/fcr-leakage";
const DEFAULTS = {
  phase: "setup", M: 50000, fcrPct: 72, mCPC: 6.5, lCPC: 11,
  scope: "", method: "", windowDays: 7, repeatModel: "one",
  measuredPct: 22, measuredTargetPct: 0, pathModel: "one",
  repeatMult: 1.0, targetPct: 80, sourcing: "inhouse", mech: "hiring",
  investOneTime: 150000, investRecurring: 90000,
  costBasis: "estimate", fcrConfirmed: false, scores: {},
};

export default function FCRLeakageDiagnostic() {
  const [phase, setPhase] = useState("setup");
  const [M, setM] = useState(() => getPrimitive("monthlyContacts") || 50000);
  const [fcrPct, setFcrPct] = useState(() => { const raw = getPrimitive("fcr"); const f = raw == null ? 0.72 : raw > 1 ? raw / 100 : raw; return clamp(Math.round(f * 100), 1, 99); });
  const [mCPC, setMCPC] = useState(() => getPrimitive("marginalPerContact") || getPrimitive("marginalCPC") || 6.5);
  const [lCPC, setLCPC] = useState(() => getPrimitive("loadedCPC") || getPrimitive("costPerContact") || 11);
  const [scope, setScope] = useState(""); const [method, setMethod] = useState(""); const [windowDays, setWindowDays] = useState(7);
  const [repeatModel, setRepeatModel] = useState("one");
  const [measuredPct, setMeasuredPct] = useState(22); const [measuredTargetPct, setMeasuredTargetPct] = useState(0); const [pathModel, setPathModel] = useState("one");
  const [repeatMult, setRepeatMult] = useState(1.0);
  const [targetPct, setTargetPct] = useState(80);
  const [sourcing, setSourcing] = useState("inhouse"); const [mech, setMech] = useState("hiring");  // must be a key in src/lib/mech.js
  const [investOneTime, setInvestOneTime] = useState(150000); const [investRecurring, setInvestRecurring] = useState(90000);
  const [costBasis, setCostBasis] = useState("estimate");
  const [fcrConfirmed, setFcrConfirmed] = useState(false);
  const [currentDim, setCurrentDim] = useState(0); const [scores, setScores] = useState({});
  const [fromLink, setFromLink] = useState(false);

  useEffect(() => {
    // A scenario link is a deliberate act. It outranks the cross-tool pulls that
    // seeded the initializers, and it suppresses the PULLED badges and the
    // dirty-unit confidence cap, which would otherwise reflect someone else's session.
    const sc = readScenario(TOOL_ID, DEFAULTS);
    if (!sc) return;
    setM(sc.M); setFcrPct(sc.fcrPct); setMCPC(sc.mCPC); setLCPC(sc.lCPC);
    setScope(sc.scope); setMethod(sc.method); setWindowDays(sc.windowDays);
    setRepeatModel(sc.repeatModel); setMeasuredPct(sc.measuredPct);
    setMeasuredTargetPct(sc.measuredTargetPct); setPathModel(sc.pathModel);
    setRepeatMult(sc.repeatMult); setTargetPct(sc.targetPct);
    setSourcing(sc.sourcing); setMech(normMech(sc.mech));  // legacy links keyed "absorb"
    setInvestOneTime(sc.investOneTime); setInvestRecurring(sc.investRecurring);
    setCostBasis(sc.costBasis); setFcrConfirmed(sc.fcrConfirmed);
    setScores(sc.scores); setPhase(sc.phase);
    setFromLink(true);
    clearScenarioParam();
  }, []);

  const rawPulledFcr = getPrimitive("fcr");
  const pulledM = !fromLink && !!getPrimitive("monthlyContacts"); const pulledFcr = !fromLink && rawPulledFcr != null;
  const fcrPulledDirty = !fromLink && rawPulledFcr != null && rawPulledFcr > 1 && !fcrConfirmed;
  const onFcr = (v) => { setFcrConfirmed(true); setFcrPct(v); };
  const pulledMcpc = !fromLink && (getPrimitive("marginalPerContact") || getPrimitive("marginalCPC")) != null;
  useEffect(() => { window.scrollTo(0, 0); }, [phase]);

  const setScore = (dimId, qIdx, val) => setScores((p) => ({ ...p, [`${dimId}-${qIdx}`]: val }));
  const dimScore = (dimId) => { const d = DIMS.find((x) => x.id === dimId); const vals = d.qs.map((_, i) => scores[`${dimId}-${i}`] || 0).filter((v) => v > 0); return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0; };
  const dimComplete = (dimId) => DIMS.find((d) => d.id === dimId).qs.every((_, i) => scores[`${dimId}-${i}`] > 0);
  const allComplete = DIMS.every((d) => dimComplete(d.id));
  const dScore = DIMS.reduce((a, d) => a + dimScore(d.id), 0) / DIMS.length;
  const defDeclared = scope !== "" && method !== "";

  const engineInput = { M, fcr: fcrPct / 100, mCPC, lCPC, repeatModel, measuredRate: measuredPct / 100, measuredTargetRate: measuredTargetPct > 0 ? measuredTargetPct / 100 : null, pathModel, repeatMult, dScore: dScore || 3, askTarget: targetPct / 100, mech, sourcing, investOneTime, investRecurring, costBasis, defDeclared, fcrPulledDirty, scope, method, windowDays };
  const R = engine(engineInput);

  /* Exact input set the scenario link carries. Phase rides along so a shared
     link opens on the results the sender was looking at, not an empty wizard. */
  const scenario = {
    phase, M, fcrPct, mCPC, lCPC, scope, method, windowDays, repeatModel,
    measuredPct, measuredTargetPct, pathModel, repeatMult, targetPct,
    sourcing, mech, investOneTime, investRecurring, costBasis, fcrConfirmed, scores,
  };
  const aggMult = Math.min(3.0, Math.max(1.5, repeatMult + 0.4));
  const sensLo = engine({ ...engineInput, repeatModel: "one", repeatMult: 1.0 });
  const sensHi = engine({ ...engineInput, repeatModel: "geometric", repeatMult: aggMult });
  const sorted = [...DIMS].sort((a, b) => dimScore(a.id) - dimScore(b.id));
  const top = sorted[0];
  const confColor = (c) => c === "Finance-grade" ? GREEN : c === "Planning-grade" ? AMBER : MUTED;
  const scopeLabel = { voice: "Assisted voice only", cc: "Contact center, cross-channel", digital: "Digital plus assisted", enterprise: "Enterprise one-contact (strictest)" }[scope] || "not declared";
  const methodLabel = method === "survey" ? "external post-call survey" : method === "internal" ? "internal callback window of " + windowDays + " days" : "not declared";

  useEffect(() => {
    if (phase === "results") publishToolResult("fcr-leakage", {
      repeatContactBurden: R.burdenYr, controllableRepeatBurden: R.controllableBurdenYr, cashRealizableSavings: R.realizableYr,
      repeatContactShare: R.repeatShare, marginalPerContact: mCPC, targetFCR: R.target, fcr: fcrPct / 100, monthlyContacts: M,
      fcrLeakageConfidence: R.headlineConf,
      analystRead: `Repeat burden ${money(R.burdenYr)}/yr (${money(R.controllableBurdenYr)} controllable). ${money(R.realizableYr)} realizable at ${pct(R.target)} FCR, payback ${R.paybackLabel}.`,
    });
  }, [phase, R.burdenYr, R.realizableYr, R.payback]);

  const card = { border: `1px solid ${BORDER}`, borderRadius: 12, padding: "22px", marginBottom: 18 };
  const h3 = { fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 16, letterSpacing: 0.3 };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#fff", color: NAVY }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Instrument+Serif:ital@0;1&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}select{font-family:inherit}@media(max-width:700px){.g2{grid-template-columns:1fr!important}.g3{grid-template-columns:1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}><LogoMark /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>← Back to Tools</a></div></nav>

      {phase === "setup" && (
        <section style={{ padding: "44px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 760 }}>
            <span style={{ color: RED, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Performance + Quality</span>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 34, fontWeight: 400, lineHeight: 1.12, margin: "10px 0 10px" }}>FCR Leakage Diagnostic</h1>
            <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.6, marginBottom: 12, maxWidth: 620 }}>Repeat contacts are the leakage. This tool separates the burden you carry, the portion that is realistically controllable, and the part that converts to actual cash. It will tell you when a project does not pay back.</p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 26, fontSize: 11, color: MUTED }}><span>1. Burden</span><span>2. Controllable opportunity</span><span>3. Realizable cash</span><span>4. Confidence</span><span>5. Next operating test</span></div>

            <div style={card}>
              <h3 style={h3}>Volume + Economics</h3>
              <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <NumField label="Monthly contacts" value={M} onChange={setM} step={500} pulled={pulledM} />
                <NumField label="Current FCR" value={fcrPct} onChange={onFcr} suffix="%" step={1} min={1} max={99} pulled={pulledFcr} info={DEFS.fcrDef.text} infoTitle={DEFS.fcrDef.title} />
                <NumField label="Marginal cost / contact" value={mCPC} onChange={setMCPC} prefix="$" step={0.25} pulled={pulledMcpc} info={DEFS.marginalCPC.text} infoTitle={DEFS.marginalCPC.title} />
                <NumField label="Loaded cost / contact" value={lCPC} onChange={setLCPC} prefix="$" step={0.25} info={DEFS.loadedCPC.text} infoTitle={DEFS.loadedCPC.title} align="right" />
              </div>
            </div>

            <div style={card}>
              <h3 style={{ ...h3, marginBottom: 6 }}>Declare your FCR definition</h3>
              <p style={{ fontSize: 12, color: MUTED, marginBottom: 16, lineHeight: 1.5 }}>FCR has no industry standard. Until you declare scope and method, the result stays Directional and is not comparable across centers.</p>
              <div className="g3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <Sel label="Resolution scope" value={scope} onChange={setScope} info={DEFS.scope.text} infoTitle={DEFS.scope.title} options={[{ v: "", l: "Select..." }, { v: "voice", l: "Voice only" }, { v: "cc", l: "CC cross-channel" }, { v: "digital", l: "Digital + assisted" }, { v: "enterprise", l: "Enterprise OCR" }]} />
                <Sel label="Measurement method" value={method} onChange={setMethod} options={[{ v: "", l: "Select..." }, { v: "survey", l: "External post-call survey" }, { v: "internal", l: "Internal callback window" }]} />
                {method === "internal" ? <NumField label="Callback window" value={windowDays} onChange={setWindowDays} suffix=" days" step={1} min={1} max={30} /> : <div />}
              </div>
              {scope === "voice" && <p style={{ fontSize: 12, color: AMBER, marginTop: 12, lineHeight: 1.5 }}>Voice-only scope is the most generous definition. It usually inflates FCR and understates leakage, because a customer who failed in chat or a bot before calling is not counted.</p>}
              {method === "internal" && windowDays < 7 && <p style={{ fontSize: 12, color: AMBER, marginTop: 12, lineHeight: 1.5 }}>A {windowDays}-day callback window is short. It captures fewer return contacts, so internal FCR tends to read high and the true leakage is likely larger than shown. Cross-channel and enterprise scope feel this most, since customers often return through another channel days later. Common practice is 7 to 30 days depending on issue type.</p>}
            </div>

            <div style={card}>
              <h3 style={h3}>Leakage Model</h3>
              <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Sel label="Repeat-behavior model" value={repeatModel} onChange={setRepeatModel} info={DEFS.repeatModel.text} infoTitle={DEFS.repeatModel.title} options={[{ v: "one", l: "One callback then resolved" }, { v: "geometric", l: "Geometric (callbacks can fail)" }, { v: "measured", l: "I have my measured repeat rate" }]} />
                <NumField label="Repeat complexity multiplier" value={repeatMult} onChange={setRepeatMult} suffix="x" step={0.1} min={0.5} max={3} info={DEFS.repeatMult.text} infoTitle={DEFS.repeatMult.title} align="right" />
                {repeatModel === "measured" && <NumField label="Measured current repeat share" value={measuredPct} onChange={setMeasuredPct} suffix="%" step={1} min={0} max={60} />}
                {repeatModel === "measured" && <NumField label="Measured target repeat share (0 = model it)" value={measuredTargetPct} onChange={setMeasuredTargetPct} suffix="%" step={1} min={0} max={60} align="right" />}
                {repeatModel === "measured" && measuredTargetPct === 0 && <Sel label="Improvement path model" value={pathModel} onChange={setPathModel} options={[{ v: "one", l: "One-callback path" }, { v: "geometric", l: "Geometric path" }, { v: "proportional", l: "Proportional to failure reduction" }]} />}
                <NumField label="Target FCR" value={targetPct} onChange={setTargetPct} suffix="%" step={1} min={1} max={95} info={DEFS.ceiling.text} infoTitle={DEFS.ceiling.title} align="right" />
              </div>
              {repeatMult > 2.5 ? <p style={{ fontSize: 12, color: RED, marginTop: 12, lineHeight: 1.5 }}>High assumption at {fmtX(repeatMult)}x. This is above most published estimates. Validate it against your handle-time, escalation, and rework data before using these figures in a business case.</p> : repeatMult > 2.0 ? <p style={{ fontSize: 12, color: AMBER, marginTop: 12, lineHeight: 1.5 }}>Elevated at {fmtX(repeatMult)}x. Reasonable if your repeats escalate or run longer than first contacts. The normal modeled range is 1.0x to 2.0x.</p> : null}
            </div>

            <div style={card}>
              <h3 style={h3}>Realization + Investment</h3>
              <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Sel label="Sourcing model" value={sourcing} onChange={setSourcing} info={DEFS.sourcing.text} infoTitle={DEFS.sourcing.title} options={[{ v: "inhouse", l: "In-house (capacity, needs mechanism)" }, { v: "bpo", l: "Outsourced per-contact (direct cash)" }]} />
                <Sel label="Realization mechanism" value={mech} onChange={setMech} info={DEFS.mech.text} infoTitle={DEFS.mech.title} align="right" options={MECH_OPTS} disabled={sourcing === "bpo"} note={sourcing === "bpo" ? "Not used. On a per-contact contract the invoice falls with volume, so savings convert at 100% without a capacity mechanism. Switch to in-house sourcing to apply one." : null} />
                <NumField label="One-time cost to achieve" value={investOneTime} onChange={setInvestOneTime} prefix="$" step={10000} info={DEFS.invest.text} infoTitle={DEFS.invest.title} />
                <NumField label="Recurring annual cost" value={investRecurring} onChange={setInvestRecurring} prefix="$" step={5000} align="right" />
                <Sel label="Cost basis" value={costBasis} onChange={setCostBasis} info={DEFS.confidence.text} infoTitle={DEFS.confidence.title} options={[{ v: "estimate", l: "Estimate (±25%)" }, { v: "ops", l: "Operations data (±15%)" }, { v: "finance", l: "Finance-confirmed (±10%)" }]} />
              </div>
            </div>

            <button onClick={() => setPhase("diagnostic")} style={{ padding: "14px 28px", fontSize: 15, fontWeight: 600, background: ELECTRIC, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>Diagnose the root cause →</button>
          </div>
        </section>
      )}

      {phase === "diagnostic" && (
        <section style={{ padding: "40px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 700 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 28, flexWrap: "wrap" }}>
              {DIMS.map((d, i) => <button key={d.id} onClick={() => setCurrentDim(i)} style={{ padding: "8px 13px", fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: "pointer", border: `1px solid ${i === currentDim ? d.color : dimComplete(d.id) ? GREEN : BORDER}`, background: i === currentDim ? `${d.color}12` : dimComplete(d.id) ? `${GREEN}08` : "#fff", color: i === currentDim ? d.color : dimComplete(d.id) ? GREEN : MUTED }}>{dimComplete(d.id) ? "✓ " : ""}{d.icon} {d.name.split("+")[0].trim()}</button>)}
            </div>
            {(() => { const d = DIMS[currentDim]; return (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}><span style={{ fontSize: 22 }}>{d.icon}</span><h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 23, fontWeight: 400, margin: 0 }}>{d.name}</h2><Tag text={d.ownerClass} color={SLATE} /></div>
                <p style={{ fontSize: 13, color: MUTED, marginBottom: 22, maxWidth: 560, lineHeight: 1.5 }}>{d.desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {d.qs.map((q, qi) => (
                    <div key={qi} style={{ background: WARM, border: `1px solid ${scores[`${d.id}-${qi}`] ? d.color + "30" : BORDER}`, borderRadius: 10, padding: "16px 18px" }}>
                      <p style={{ fontSize: 14, lineHeight: 1.5, margin: "0 0 12px" }}>{q}</p>
                      <div style={{ display: "flex", gap: 6 }}>{[1, 2, 3, 4, 5].map((v) => <button key={v} onClick={() => setScore(d.id, qi, v)} style={{ flex: 1, padding: "8px 4px", fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: "pointer", border: `1px solid ${scores[`${d.id}-${qi}`] === v ? d.color : BORDER}`, background: scores[`${d.id}-${qi}`] === v ? d.color : "#fff", color: scores[`${d.id}-${qi}`] === v ? "#fff" : MUTED }}>{LABELS[v]}</button>)}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
                  <button onClick={() => currentDim === 0 ? setPhase("setup") : setCurrentDim(currentDim - 1)} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, borderRadius: 6, border: `1px solid ${BORDER}`, background: "#fff", color: NAVY, cursor: "pointer" }}>← {currentDim === 0 ? "Inputs" : "Previous"}</button>
                  {currentDim < DIMS.length - 1 ? <button onClick={() => setCurrentDim(currentDim + 1)} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, borderRadius: 6, border: "none", background: d.color, color: "#fff", cursor: "pointer" }}>Next →</button> : <button onClick={() => setPhase("results")} disabled={!allComplete} style={{ padding: "10px 24px", fontSize: 13, fontWeight: 600, borderRadius: 6, border: "none", background: allComplete ? GREEN : MUTED, color: "#fff", cursor: "pointer", opacity: allComplete ? 1 : 0.5 }}>{allComplete ? "See the economics →" : "Complete all dimensions"}</button>}
                </div>
              </div>
            ); })()}
          </div>
        </section>
      )}

      {phase === "results" && (
        <section style={{ padding: "40px 28px 60px" }}>
          <div style={WRAP}>
            {R.hardFlag && (
              <div>
                <div style={{ background: `${RED}0A`, border: `2px solid ${RED}`, borderRadius: 12, padding: "26px 28px", marginBottom: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: RED, letterSpacing: 1.5, textTransform: "uppercase" }}>Result blocked: invalid inputs</span>
                  <p style={{ fontSize: 14, color: NAVY, lineHeight: 1.6, margin: "10px 0 14px" }}>The engine produced a physically impossible value, so no result is shown. An invalid result is not a low-confidence result. Correct the inputs below and the economics will return.</p>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>{R.flags.filter((f) => /impossible|outside the plausible|outside 0 to 100|had to be clamped/.test(f)).map((f, i) => <li key={i} style={{ fontSize: 13, color: RED, lineHeight: 1.5, marginBottom: 4 }}>{f}</li>)}</ul>
                </div>
                <button onClick={() => setPhase("setup")} style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8, border: "none", cursor: "pointer" }}>Adjust inputs</button>
              </div>
            )}
            {!R.hardFlag && (<>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: confColor(R.headlineConf), letterSpacing: 1, textTransform: "uppercase" }}>{R.headlineConf}</span>
              <span style={{ fontSize: 12, color: SLATE }}>Cost basis <strong style={{ color: confColor(R.costConf) }}>{R.costConf}</strong></span>
              <span style={{ fontSize: 12, color: SLATE }}>Realization <strong style={{ color: confColor(R.realConf) }}>{R.realConf}</strong></span>
              <span style={{ fontSize: 12, color: SLATE }}>Headline reports the weaker axis.</span>
              <InfoDot text={DEFS.confidence.text} title={DEFS.confidence.title} />
              <div style={{ flexBasis: "100%", fontSize: 12, color: SLATE, lineHeight: 1.5, marginTop: 2 }}>{R.confReason.charAt(0).toUpperCase() + R.confReason.slice(1)}</div>
            </div>

            <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div style={{ background: `${RED}06`, border: `1px solid ${RED}22`, borderRadius: 12, padding: "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><span style={{ fontSize: 11, fontWeight: 700, color: RED, letterSpacing: 1, textTransform: "uppercase" }}>Annual repeat burden</span><Tag text={R.shareBasis} color={RED} /><InfoDot text={DEFS.controllable.text} title={DEFS.controllable.title} /></div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 40, color: RED }}>{money(R.burdenYr)}</div>
                <p style={{ fontSize: 12, color: SLATE, marginTop: 6, lineHeight: 1.5 }}>{Math.round(R.repeats).toLocaleString()} repeats/mo at {pct(R.repeatShare)} of volume ({R.shareSource}), valued at {money2(R.repeatCPC)} repeat-adjusted marginal cost ({money2(mCPC)} base times {fmtX(repeatMult)}x complexity). Burden ceiling, not recoverable. Range {money(R.burdenYr * (1 - R.band))} to {money(R.burdenYr * (1 + R.band))}.</p>
              </div>
              <div style={{ background: `${GREEN}06`, border: `1px solid ${GREEN}22`, borderRadius: 12, padding: "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><span style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 1, textTransform: "uppercase" }}>Year-1 net</span><Tag text="Assumed" color={GREEN} /><InfoDot text={DEFS.invest.text} title={DEFS.invest.title} /></div>
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 40, color: R.year1Net >= 0 ? GREEN : RED }}>{money(R.year1Net)}</div>
                <p style={{ fontSize: 12, color: SLATE, marginTop: 6, lineHeight: 1.5 }}>{money(R.realizableYr)}/yr realizable at steady state. Payback {R.paybackLabel}. Year-2 net {money(R.year2Net)}, two-year cumulative {money(R.cum2Yr)}. {R.year1Net < 0 ? "Cash negative in year one as scoped." : "Cash positive in year one."}</p>
              </div>
            </div>

            <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
              <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><span style={{ fontSize: 12, fontWeight: 700, color: NAVY }}>Burden split, not savings</span><InfoDot text={DEFS.controllable.text} title={DEFS.controllable.title} /></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}><span style={{ color: SLATE }}>Theoretical controllable burden <Tag text="Capped" color={AMBER} /></span><strong style={{ color: NAVY }}>{money(R.controllableBurdenYr)}</strong></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}><span style={{ color: SLATE }}>Non-controllable <Tag text="Excluded" color={MUTED} /></span><strong style={{ color: MUTED }}>{money(R.nonControllableBurdenYr)}</strong></div>
                <p style={{ fontSize: 10.5, color: MUTED, lineHeight: 1.45, marginTop: 8 }}>Burden, not savings. The controllable slice is not cash-realizable unless the selected mechanism converts freed capacity, and only net of the cost to achieve it.</p>
              </div>
              <div style={{ background: NAVY, borderRadius: 12, padding: "16px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}><span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Opportunity times capture</span><InfoDot text={DEFS.ceiling.text} title={DEFS.ceiling.title} /></div>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.85)", lineHeight: 1.55, margin: 0 }}>Diagnostic {dScore.toFixed(1)}/5: opportunity {pct(R.opp, 0)}, capture {pct(R.cap, 0)}. Realistic FCR ceiling {pct(R.ceilingFCR)}, applied target {pct(R.target)}. {R.overCeiling ? "Your ask exceeded the ceiling and was capped." : "Your target is within the ceiling."}</p>
              </div>
            </div>

            {R.flags.length > 0 && (
              <div style={{ background: `${AMBER}08`, border: `1px solid ${AMBER}30`, borderRadius: 10, padding: "14px 18px", marginBottom: 18 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: AMBER, letterSpacing: 1, textTransform: "uppercase" }}>Integrity flags</span>
                <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>{R.flags.map((f, i) => <li key={i} style={{ fontSize: 12.5, color: SLATE, lineHeight: 1.5, marginBottom: 3 }}>{f}</li>)}</ul>
              </div>
            )}

            <div style={{ background: `${RED}06`, border: `1px solid ${RED}20`, borderRadius: 12, padding: "20px 24px", marginBottom: 18 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: RED, marginBottom: 10 }}>Top leakage sources (lowest scores)</h3>
              {sorted.slice(0, 3).map((d, i) => (
                <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < 2 ? `1px solid ${RED}15` : "none" }}>
                  <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: RED, width: 22 }}>{i + 1}</span>
                  <div style={{ flex: 1 }}><span style={{ fontSize: 13, fontWeight: 600 }}>{d.icon} {d.name}</span><div style={{ fontSize: 11, color: MUTED }}>Owner: {d.owner}</div></div>
                  <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 18, color: RED }}>{dimScore(d.id).toFixed(1)}</span>
                </div>
              ))}
            </div>

            <div style={{ background: `linear-gradient(135deg, ${NAVY}, ${DEEP})`, borderRadius: 12, padding: "22px 26px", marginBottom: 18 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, color: GREEN, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 }}>Your next 30-day operating test</h3>
              <p style={{ fontSize: 13.5, color: "#fff", lineHeight: 1.6, margin: "0 0 10px" }}>Your leakage points first at <strong>{top.name}</strong>, owned by {top.owner}. Do not start with agent training unless the diagnostic points there.</p>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
                <div><strong style={{ color: "rgba(255,255,255,0.9)" }}>First move:</strong> {top.test.move}.</div>
                <div><strong style={{ color: "rgba(255,255,255,0.9)" }}>Leading indicator:</strong> {top.test.lead}.</div>
                <div><strong style={{ color: "rgba(255,255,255,0.9)" }}>Lagging indicator:</strong> {top.test.lag}.</div>
                <div><strong style={{ color: "rgba(255,255,255,0.9)" }}>Stop condition:</strong> {top.test.stop}.</div>
              </div>
            </div>

            <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
              <div style={{ border: `1px solid ${AMBER}30`, borderRadius: 12, padding: "16px 20px", background: `${AMBER}06` }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: AMBER, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Do not let FCR get gamed</h4>
                <p style={{ fontSize: 11.5, color: SLATE, lineHeight: 1.5, marginBottom: 8 }}>FCR rises falsely if agents mark issues resolved, callbacks get recoded, or bots contain without resolving. Track these alongside it:</p>
                <div style={{ fontSize: 11.5, color: SLATE, lineHeight: 1.7 }}>{GAMING.join(" · ")}</div>
              </div>
              <div style={{ border: `1px solid ${ELECTRIC}30`, borderRadius: 12, padding: "16px 20px", background: `${ELECTRIC}06` }}>
                <h4 style={{ fontSize: 12, fontWeight: 700, color: ELECTRIC, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Containment is not resolution</h4>
                <p style={{ fontSize: 11.5, color: SLATE, lineHeight: 1.55 }}>A bot can contain a conversation without resolving it, and a customer who gives up looks like a success. Use confirmed resolution, repeat contact, escalation, and CSAT as balancing checks before crediting AI deflection. Benchmarks run 50% to 90% by industry and complexity, so your own trend and definition consistency matter more than the market average.</p>
              </div>
            </div>

            <div style={{ border: `1px solid ${BORDER}`, borderRadius: 12, padding: "18px 22px", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}><h3 style={{ fontSize: 13, fontWeight: 700, color: NAVY, margin: 0 }}>Assumption sensitivity</h3><InfoDot text="Repeat-contact cost premiums run 1.5x to 2x in published research, and repeat behavior can be one-callback or geometric. This shows how those two assumptions swing year-one net, holding your FCR, target, mechanism, and costs constant, so you can see which assumptions matter most before acting." title="Assumption sensitivity" /></div>
              <p style={{ fontSize: 11.5, color: MUTED, marginBottom: 12, lineHeight: 1.5 }}>Same FCR, target, mechanism, and costs. Only the repeat-behavior model and cost premium change.</p>
              {[
                { k: "Conservative", d: "one-callback, 1.0x cost", r: sensLo },
                { k: "Current model", d: `${repeatModel === "geometric" ? "geometric" : repeatModel === "measured" ? "measured" : "one-callback"}, ${fmtX(repeatMult)}x cost`, r: R, cur: true },
                { k: "Aggressive", d: `geometric, ${fmtX(aggMult)}x cost`, r: sensHi },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < 2 ? `1px solid ${BORDER}` : "none", background: row.cur ? `${ELECTRIC}06` : "transparent" }}>
                  <span style={{ fontSize: 12.5, fontWeight: row.cur ? 700 : 600, color: row.cur ? ELECTRIC : NAVY, width: 120 }}>{row.k}</span>
                  <span style={{ fontSize: 11.5, color: MUTED, flex: 1 }}>{row.d}</span>
                  <span style={{ fontSize: 12, color: SLATE }}>burden {money(row.r.burdenYr)}</span>
                  <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 17, color: row.r.year1Net >= 0 ? GREEN : RED, width: 110, textAlign: "right" }}>{money(row.r.year1Net)}</span>
                </div>
              ))}
              <p style={{ fontSize: 10.5, color: MUTED, marginTop: 8 }}>Rightmost column is year-one net. If the sign flips across these rows, your repeat-cost assumption is the deciding factor and is worth measuring before you commit.</p>
            </div>

            <ReportActions
              toolId={TOOL_ID}
              toolName="FCR Leakage Diagnostic"
              subtitle={`${R.headlineConf} • Repeat burden ${money(R.burdenYr)}/yr • Year-1 net ${money(R.year1Net)}`}
              routePath={ROUTE}
              state={scenario}
              defaults={DEFAULTS}
              confidence={R.headlineConf}
              summary={[
                { label: "Repeat burden annual", value: money(R.burdenYr) },
                { label: "Controllable burden annual", value: money(R.controllableBurdenYr) },
                { label: "Realizable annual", value: money(R.realizableYr) },
                { label: "Year-1 net", value: money(R.year1Net) },
                { label: "Year-2 net standalone", value: money(R.year2Net) },
                { label: "Two-year cumulative net", value: money(R.cum2Yr) },
                { label: "Payback", value: R.neverPaysBack ? "never at current scope" : R.payback ? "month " + R.payback : "beyond 48 months" },
              ]}
              signals={{
                cost_basis_confidence: R.costConf,
                realization_confidence: R.realConf,
                current_fcr: fcrPct + "%",
                target_fcr: targetPct + "%",
                capacity_action: R.mechApplies ? MECH[R.mechKey].label : "not applicable (bpo)",
                credit_class: R.mechApplies ? MECH[R.mechKey].cred : "billing",
                realization_factor: R.realFactor,
                sourcing,
                hard_flag: R.hardFlag ? "yes" : "no",
                integrity_flags: R.flags.length,
                from_scenario_link: fromLink ? "yes" : "no",
              }}
              sections={[
                { title: "Result Summary", type: "text", content: `Repeat contacts cost ${money(R.burdenYr)} per year at the margin. Of that, ${money(R.controllableBurdenYr)} is controllable leakage burden, which is not savings until a mechanism converts it. At a ${pct(R.target)} FCR target the project realizes ${money(R.realizableYr)} per year at steady state, nets ${money(R.year1Net)} in year one, and pays back ${R.neverPaysBack ? "never at current scope" : R.payback ? "in month " + R.payback : "beyond 48 months"}. Confidence is ${R.headlineConf}.` },
                { title: "Definitions and Scope Used", type: "findings", items: [
                  `FCR definition: ${scopeLabel}, ${methodLabel}.`,
                  `Repeat behavior: ${R.shareSource}. Repeat complexity multiplier ${fmtX(repeatMult)}x.`,
                  `Sourcing: ${sourcing === "bpo" ? "outsourced per-contact. Volume reduction converts to cash at 100% through billing. No capacity mechanism applies, and none was used." : "in-house. Freed capacity is gated by a mechanism. Mechanism applied: " + MECH[R.mechKey].label + " (" + Math.round(MECH[R.mechKey].f * 100) + "%), credited as " + MECH[R.mechKey].cred + "."}`,
                  `Cost basis: ${{estimate:"Estimate marginal cost (±25%)",ops:"Operations-data marginal cost (±15%)",finance:"Finance-confirmed marginal cost (±10%)"}[costBasis]}. Target capped by diagnostic: ${R.overCeiling ? "yes, at " + pct(R.ceilingFCR) : "no"}.`,
                ] },
                { title: "Leakage Economics", type: "metrics", items: [
                  { label: "Repeat share of volume", value: pct(R.repeatShare), color: RED, sub: R.shareBasis },
                  { label: "Effective repeat cost", value: money2(R.repeatCPC), color: SLATE, sub: money2(mCPC) + " base times " + fmtX(repeatMult) + "x" },
                  { label: "Annual repeat burden (marginal)", value: money(R.burdenYr), color: RED },
                  { label: "Burden range (±" + (R.band * 100) + "%)", value: money(R.burdenYr * (1 - R.band)) + " to " + money(R.burdenYr * (1 + R.band)), color: SLATE },
                  { label: "Controllable leakage burden (not yet savings)", value: money(R.controllableBurdenYr), color: AMBER },
                  { label: "Non-controllable (excluded)", value: money(R.nonControllableBurdenYr), color: MUTED },
                ] },
                { title: "Cash Conversion and Payback", type: "metrics", items: [
                  { label: "Diagnostic ceiling FCR / applied target", value: pct(R.ceilingFCR) + " / " + pct(R.target), color: NAVY },
                  { label: sourcing === "bpo" ? "Gross volume reduction value" : "Gross capacity value", value: money(R.grossYr), color: SLATE },
                  { label: "Realizable via " + (sourcing === "bpo" ? "billing reduction" : "mechanism"), value: money(R.realizableYr), color: R.realizableYr > 0 ? GREEN : RED },
                  { label: "One-time cost", value: money(investOneTime), color: SLATE },
                  { label: "Recurring annual cost", value: money(investRecurring), color: SLATE },
                  { label: "Payback", value: R.neverPaysBack ? "never" : R.payback ? "month " + R.payback : "48mo+", color: R.neverPaysBack ? RED : NAVY },
                  { label: "Year-1 net (after one-time cost)", value: money(R.year1Net), color: R.year1Net >= 0 ? GREEN : RED },
                  { label: "Year-2 net (standalone)", value: money(R.year2Net), color: R.year2Net >= 0 ? GREEN : RED },
                  { label: "Two-year cumulative net", value: money(R.cum2Yr), color: R.cum2Yr >= 0 ? GREEN : RED, sub: "year 1 plus year 2" },
                ] },
                { title: "Confidence and Risk Flags", type: "findings", items: [
                  `Headline ${R.headlineConf}. Cost basis ${R.costConf}, realization ${R.realConf}. The headline reports the weaker axis. ${R.confReason.charAt(0).toUpperCase() + R.confReason.slice(1)}`,
                  ...(R.flags.length ? R.flags : ["No integrity flags raised."]),
                ] },
                { title: "Dimension Scores", type: "table", rows: DIMS.map((d) => [d.name, dimScore(d.id).toFixed(1) + "/5 (" + d.ownerClass + ")"]) },
                { title: "Top Leakage Sources", type: "findings", items: sorted.slice(0, 3).map((d, i) => "#" + (i + 1) + " " + d.name + " (" + dimScore(d.id).toFixed(1) + "/5), owner " + d.owner + ": " + d.desc) },
                { title: "30-Day Operating Test", type: "findings", items: [`Target: ${top.name}, owned by ${top.owner}.`, `First move: ${top.test.move}.`, `Leading indicator: ${top.test.lead}. Lagging indicator: ${top.test.lag}.`, `Stop condition: ${top.test.stop}.`] },
                { title: "Assumptions and Exclusions", type: "findings", items: [
                  "Savings valued at marginal cost, never loaded. Loaded cost is context only.",
                  sourcing === "bpo"
                    ? "Repeat burden is a ceiling. Only the controllable slice is realizable, converted at 100% through per-contact billing. This assumes no minimum volume commitment."
                    : "Repeat burden is a ceiling. Only the controllable slice, converted through the selected capacity mechanism, is realizable.",
                  "Non-controllable leakage (complexity, structural, customer-driven) is excluded from savings.",
                  "Balancing metrics (reopen, transfer, escalation, AHT, confirmed containment, CSAT) must hold or the FCR gain is not real.",
                  "Interval staffing, multi-year board case, and contract penalties are out of scope and routed below.",
                ] },
                { title: "Next Steps", type: "next", items: [
                  { tool: "Staffing Calculator", reason: "Does this volume reduction change the interval staffing requirement", href: "/tools/staffing-calculator" },
                  { tool: "Attrition Cost Calculator", reason: "Repeat-contact rework feeds agent burnout and turnover", href: "/tools/attrition-cost" },
                  { tool: "Business Case Builder", reason: "Build the multi-year board case on these numbers", href: "/tools/business-case" },
                  { tool: "Transformation Readiness", reason: "Confirm the organization can actually capture the upside", href: "/tools/transformation-readiness" },
                ] },
              ]}
            />

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
              <button onClick={() => { setCurrentDim(DIMS.length - 1); setPhase("diagnostic"); }} style={{ background: "#fff", border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8, cursor: "pointer" }}>← Back to diagnostic</button>
              <button onClick={() => setPhase("setup")} style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8, cursor: "pointer" }}>Adjust inputs</button>
              <a href="/tools/cost-per-contact" style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8, textDecoration: "none" }}>Cost per Resolution →</a>
            </div>
            </>)}
          </div>
        </section>
      )}
    </div>
  );
}
