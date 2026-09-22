import { useState, useEffect, useRef } from "react";
import ReportActions from "./ReportActions";
import InfoDot from "./src/lib/InfoDot";
import NumField from "./src/lib/NumField";
import { COLORS, benchmark } from "./src/lib/benchmarks";
import { emitGrades, voidResult, railEvidence, weakerStream, realizationFromCred } from "./src/lib/confidence";
import { publishToolResult, getPrimitiveWithSource } from "./src/lib/toolData";
import { readScenario, clearScenarioParam } from "./src/lib/scenarioUrl";
import { severityBucket } from "./src/lib/track";
import { MECH, MECH_ORDER, MECH_INITIAL } from "./src/lib/mech";
import { nextFor } from "./src/lib/journey";
import { createGuards } from "./src/lib/guards";
import { FONT, FONT_IMPORT_CSS, TYPE, W, NUM } from "./src/lib/type";

const { green: GREEN, amber: AMBER, red: RED, electric: ELECTRIC, navy: NAVY, muted: MUTED } = COLORS;
const DEEP = "#061325"; const LIGHT = "#00AAFF"; const WARM = "#F8FAFB"; const SLATE = "#3A4F6A"; const BORDER = "#D8E3ED";
const WRAP = { maxWidth: 920, margin: "0 auto", padding: "0 28px" };

const money = (n) => { const v = Math.round(n); return (v < 0 ? "-$" : "$") + Math.abs(v).toLocaleString(); };
const money2 = (n) => "$" + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtX = (x) => (Math.round(Number(x) * 100) / 100).toString();

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

/* @engine-start
   Everything between these markers is the FCR leakage engine and the only
   things it closes over. fcr.test.mjs slices this exact region out of this
   exact file at runtime and evaluates it, so the tested engine and the shipped
   engine cannot drift apart. MECH and MECH_ORDER are injected from the real
   src/lib/mech.js, never reconstructed.

   clamp, pct, MECH_ALIAS, SCOPE and CRED_RANK were relocated here from
   elsewhere in the file. They are engine dependencies, so they belong inside
   the tested region rather than being rebuilt inside the harness. Nothing
   between their old and new positions evaluated them at module load, so the
   move is behaviour-neutral.

   11B, session 18. Every default, ceiling, curve point, band and threshold reads
   the registry by template id. TOOL_ID lives here because the grading layer needs
   it to recognise a value this tool restored from its own last run. */
const TOOL_ID = "fcr-leakage";
const dflt = (f) => benchmark(`fcr.default.${f}`);
const BASE = { M: dflt("M"), fcr: dflt("fcrPct") / 100, mCPC: dflt("mCPC"), lCPC: dflt("lCPC"), measuredRate: dflt("measuredPct") / 100, repeatMult: dflt("repeatMult"), investOneTime: dflt("investOneTime"), investRecurring: dflt("investRecurring") };
const OPP_LO = benchmark("fcr.curve.oppFloor"), OPP_SPAN = benchmark("fcr.curve.oppSpan"), OPP_HI = benchmark("fcr.curve.oppCeil");
const CAP_LO = benchmark("fcr.curve.capFloor"), CAP_SPAN = benchmark("fcr.curve.capSpan"), CAP_HI = benchmark("fcr.curve.capCeil");
const BANDS = { estimate: benchmark("fcr.band.estimate"), ops: benchmark("fcr.band.ops"), finance: benchmark("fcr.band.finance") };
const RAMP_MONTHS = benchmark("fcr.ramp.months");
const HORIZON = benchmark("fcr.guard.horizon");
const MARG_NEAR = benchmark("fcr.read.margNearLoaded"), MARG_FAR = benchmark("fcr.read.margFarBelow");
const MULT_HIGH = benchmark("fcr.read.multHigh"), MULT_ELEVATED = benchmark("fcr.read.multElevated");
const MEASURED_MAX = benchmark("fcr.read.measuredMax"), WINDOW_SHORT = benchmark("fcr.read.windowShort");
const SENS = { min: benchmark("fcr.sens.aggMin"), max: benchmark("fcr.sens.aggMax"), step: benchmark("fcr.sens.aggStep") };
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const pct = (n, d = 1) => (n * 100).toFixed(d) + "%";

/* The mechanism list lived below as a fourth divergent copy, keyed "absorb" where
   the shared module says "growth". It now comes from src/lib/mech.js. Any scenario
   link minted before this change still carries the old key, so normalize on read. */
const MECH_ALIAS = { absorb: "growth" };
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
/* Own-key only, and the fallback is none. The shipped truthy check admitted every
   inherited name: mech="toString" passed `MECH[m]`, then MECH[mechKey].f read
   undefined and every dollar figure on the page rendered NaN. An unknown key such
   as mech="bogus" was worse because it was quiet, silently crediting the 75%
   hiring default and carrying the document to Planning-grade realization. A broken
   or hand-edited link must never credit a realization the user did not choose, so
   the fallback realizes $0 and the substitution is disclosed. */

/* Practical FCR ceiling by definition strictness, and the display label, defined
   once. The component read a second copy of the label map. Broader scope means
   more ways for a contact to count as unresolved, so the achievable ceiling falls.
   "digital" previously duplicated "cc" at 0.90, which made two scope options
   produce identical output. It sits between cc and enterprise because it adds
   self-service to the resolution set. These are judgment values, stated openly.
   The fallback is enterprise, the strictest ceiling and therefore the lowest
   uplift, so a substituted scope can never inflate the savings it discloses. */
const SCOPE = {
  voice: { f: benchmark("fcr.scope.voice"), label: "Assisted voice only" },
  cc: { f: benchmark("fcr.scope.cc"), label: "Contact center, cross-channel" },
  digital: { f: benchmark("fcr.scope.digital"), label: "Digital plus assisted" },
  enterprise: { f: benchmark("fcr.scope.enterprise"), label: "Enterprise one-contact (strictest)" },
};
const SCOPE_UNDECLARED = benchmark("fcr.scope.undeclared");
/* Label resolution lives beside the table so the document and the engine can never
   name different scopes. It takes the resolved key, never the entered string. */
const scopeLabelFor = (k) => (k === "" || k == null ? "not declared" : SCOPE[k].label);

/* Realization confidence follows the credit class, not the mechanism name.
   Capacity-only is Directional. Finance-creditable is Planning-grade. Cash out
   the door is Finance-grade. This replaced a rubric in which Finance-grade
   realization was reachable only through headcount reduction, the one mechanism
   the suite explicitly tells people not to default to. */
const CRED_RANK = { none: 0, capacity: 1, finance: 2, cash: 3 };
/* Retained for scenario links and the harness contract. Since 11B the realization
   axis reads realizationFromCred in gradeFCR and nothing reads this ladder. */

/* Numeric disclosure. A scenario link decodes straight into state with no type
   check, so any numeric field can arrive as "", "abc", "12abc", "1,200", null or
   "Infinity". Before this reader existed nothing parsed them at all: a string
   volume concatenated in `repeats > M + 1`, string costs compared lexically so
   "9" > "11" raised a false impossible-input flag, "Infinity" booked infinite
   savings, and NaN reached the rail, the analyst read and the PDF. Every value is
   now read through the shared guard with no bounds, so clean input is untouched
   and bounds stay where the tool owns them. An unclean entry is held at the parsed
   value (0 when nothing parses) and disclosed with its raw text. "1,200" is held
   at 1: a link must reproduce the sender's case, and that text is locale
   ambiguous. Typed entry never reaches here unclean, because NumField parses first.
   A field that cannot move the case is sanitized but not disclosed: the callback
   window outside the internal method, and both measured shares outside the
   measured model. No blank is exempt, because this document never states that a
   field was not supplied. Numerics only: the caller's settings pass through. */
const FCR_NUM = [
  ["M", "Monthly contacts"], ["fcrPct", "Current FCR"], ["mCPC", "Marginal cost per contact"],
  ["lCPC", "Loaded cost per contact"], ["windowDays", "Callback window"], ["measuredPct", "Measured repeat share"],
  ["measuredTargetPct", "Measured target repeat share"], ["repeatMult", "Repeat complexity multiplier"],
  ["targetPct", "Target FCR"], ["investOneTime", "One-time cost"], ["investRecurring", "Recurring annual cost"],
];
function saneFcr(s) {
  const { guards: raws, guard: rawProbe } = createGuards();
  const numericCorrections = [];
  const out = {};
  const applies = (k) => k === "windowDays" ? s.method === "internal"
    : (k === "measuredPct" || k === "measuredTargetPct") ? s.repeatModel === "measured" : true;
  const read = (what, raw, check) => {
    const v = rawProbe(what, raw, -Infinity, null, "");
    const bad = raws.length ? raws.pop().entered : null;
    if (check && bad !== null) numericCorrections.push(`${what} was entered as ${bad}, which is not a number, and was held at ${v}.`);
    return v;
  };
  for (const [k, what] of FCR_NUM) out[k] = read(what, s[k], applies(k));
  /* Diagnostic answers sum into the score. A string answer concatenated in that sum
     ("0" + "4" + "5"), so a hand-edited link could move opportunity and capture. */
  const sc = s.scores !== null && typeof s.scores === "object" && !Array.isArray(s.scores) ? s.scores : {};
  if (sc !== s.scores && s.scores != null) numericCorrections.push(`Diagnostic answers were entered as ${typeof s.scores === "string" ? `"${s.scores}"` : String(s.scores)}, which is not a set of answers, and were held at unanswered.`);
  out.scores = {};
  for (const k of Object.keys(sc)) out.scores[k] = read(`Diagnostic answer ${k}`, sc[k], true);
  return { ...out, numericCorrections };
}

// Pure engine. UI and export both read this object. No separate aggregation.
function engine(I) {
  let { M, mCPC, lCPC, repeatMult } = I;
  const { fcr: fcrIn, repeatModel, measuredRate, measuredTargetRate, pathModel, dScore, askTarget, mech, sourcing, investOneTime, investRecurring, costBasis, defDeclared, fcrPulledDirty, scope, method, windowDays } = I;
  /* Enum inputs resolve through the shared own-key pick, the rule Cost per Contact,
     Channel Shift and AI Deflection already run. Raw indexing let an inherited name
     through the truthy check and computed NaN, and let an unknown key silently take
     a shipped default. A substituted key is disclosed in this tool's own sentence,
     which carries "was held at" and so blocks the result at Directional. */
  const { guards: picks, pick } = createGuards();
  const enumCorrections = [];
  const resolve = (label, raw, table, fallback) => {
    const k = pick(label, raw, table, fallback);
    if (picks.length) enumCorrections.push(`${label} was "${picks.pop().entered}", which is not an option this tool offers, and was held at ${table[k].label}.`);
    return k;
  };

  let fcr = fcrIn, fcrWasPercent = false;
  if (fcr > 1 && fcr <= 100) { fcr = fcr / 100; fcrWasPercent = true; }
  const fcrImpossible = !(fcr > 0 && fcr < 1);
  if (fcrImpossible) fcr = clamp(fcr, 0.01, 0.99);
  // Volume, cost and multiplier cannot be negative. The number fields clamp at
  // zero, but a scenario link is decoded straight from a URL with no clamp, so a
  // hand-edited link could drive a negative marginal cost through the whole
  // model and produce a negative annual burden and negative savings with no
  // flag raised. Block it here, where every path has to pass.
  const negImpossible = M < 0 || mCPC < 0 || lCPC < 0 || repeatMult < 0;
  M = Math.max(0, M); mCPC = Math.max(0, mCPC); lCPC = Math.max(0, lCPC); repeatMult = Math.max(0, repeatMult);
  const opportunity = (s) => clamp(OPP_LO + (5 - s) / 4 * OPP_SPAN, OPP_LO, OPP_HI);
  const capture = (s) => clamp(CAP_LO + (s - 1) / 4 * CAP_SPAN, CAP_LO, CAP_HI);
  const shareOne = (f) => (1 - f) / (2 - f);
  const shareGeo = (f) => (1 - f);
  const repeatCPC = mCPC * repeatMult;

  /* A measured share is a fraction of volume, so it lives on 0 to 1. A link could
     carry -10 or 150, which drove the burden negative or above total volume. Held at
     the bound and disclosed with "was held at", so it blocks the page and holds
     completeness Directional instead of reaching the void. */
  const measuredCorrections = [];
  const holdShare = (label, v) => {
    if (v == null || !(v < 0 || v > 1)) return v;
    const h = clamp(v, 0, 1);
    measuredCorrections.push(`${label} was entered as ${Math.round(v * 1000) / 10}%, outside 0 to 100% of volume, and was held at ${Math.round(h * 100)}%.`);
    return h;
  };
  const measuredShare = repeatModel === "measured" ? holdShare("Measured repeat share", measuredRate) : measuredRate;
  const measuredTarget = repeatModel === "measured" ? holdShare("Measured target repeat share", measuredTargetRate) : measuredTargetRate;
  let repeatShare, shareSource, shareBasis;
  if (repeatModel === "measured") { repeatShare = measuredShare; shareSource = "measured data"; shareBasis = "Measured"; }
  else if (repeatModel === "geometric") { repeatShare = shareGeo(fcr); shareSource = "geometric model"; shareBasis = "Modeled"; }
  else { repeatShare = shareOne(fcr); shareSource = "one-callback model"; shareBasis = "Modeled"; }
  const repeats = M * repeatShare;
  const burdenYr = repeats * repeatCPC * 12;

  const opp = opportunity(dScore), cap = capture(dScore);
  // An undeclared scope is a real state the wizard starts in, so it is not a
  // correction. Anything else must be an own key of SCOPE or it is substituted
  // and disclosed. The shipped `|| 0.90` read inherited names as a ceiling and
  // drove practicalMax, ceilingFCR, target and every dollar figure to NaN.
  const scopeKey = scope === "" || scope == null ? "" : resolve("Resolution scope", scope, SCOPE, "enterprise");
  const practicalMax = scopeKey === "" ? SCOPE_UNDECLARED : SCOPE[scopeKey].f;
  const maxUplift = Math.max(0, practicalMax - fcr) * opp * cap;
  const ceilingFCR = clamp(fcr + maxUplift, fcr, practicalMax);
  const overCeiling = askTarget > ceilingFCR + 1e-9;
  const target = clamp(askTarget, fcr, ceilingFCR);

  // A measured baseline has to be improved on its own base. The one-callback and
  // geometric paths compute the TARGET share from a model whose baseline the user
  // has just overridden with measured data, which is a base switch rather than an
  // improvement. It produced savings out of nothing: a measured 30% repeat share
  // at 72% FCR, targeting 72% FCR, meaning no improvement at all, reported
  // $237,656 a year of realizable savings, the entire figure being the gap
  // between the user's measured rate and the model's rate at the same FCR. The
  // mirror case is worse because it is quiet: a measured 12% baseline targeting a
  // real 8-point FCR gain reported $0, because the modeled target share sat above
  // the measured baseline. Proportional scaling is the only base-consistent path,
  // so it is now the only path. `pathModel` is still read from legacy scenario
  // links and flagged, so a reader holding an older PDF learns why it moved.
  let repeatShareT;
  const measuredPathOverridden = repeatModel === "measured" && (measuredTarget == null || measuredTarget <= 0) && pathModel && pathModel !== "proportional";
  if (repeatModel === "measured") {
    if (measuredTarget != null && measuredTarget > 0) repeatShareT = measuredTarget;
    else repeatShareT = (1 - fcr) > 0 ? repeatShare * ((1 - target) / (1 - fcr)) : repeatShare;
  } else if (repeatModel === "geometric") repeatShareT = shareGeo(target);
  else repeatShareT = shareOne(target);
  const repeatsT = M * repeatShareT;

  const volReduced = Math.max(0, repeats - repeatsT);
  const grossYr = volReduced * repeatCPC * 12;
  const controllableBurdenYr = burdenYr * opp;
  const nonControllableBurdenYr = burdenYr - controllableBurdenYr;

  const mechKey = resolve("Realization mechanism", own(MECH_ALIAS, mech) ? MECH_ALIAS[mech] : mech, MECH, "none");
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
  const rampMo = (m) => (m >= RAMP_MONTHS ? steadyMo : steadyMo * (m / RAMP_MONTHS));
  let cum = 0, payback = null;
  for (let m = 1; m <= HORIZON; m++) { cum += rampMo(m) - recurMo; if (payback === null && cum >= investOneTime) payback = m; }
  let c12 = 0; for (let m = 1; m <= 12; m++) c12 += rampMo(m) - recurMo;
  const year1Net = c12 - investOneTime;
  // Standalone year two: steady-state savings less the recurring cost. The one-time
  // cost is gone by then. Reported separately from the two-year cumulative, because
  // a single figure named "year-2 net" that silently carried year one overstated
  // year two by exactly the amount of year-one net.
  const year2Net = realizableYr - investRecurring;
  const cum2Yr = year1Net + year2Net;
  const paybackLabel = neverPaysBack ? "never at current scope" : payback ? "month " + payback : "beyond " + HORIZON + " months";

  const band = BANDS[costBasis];
  // BPO realization is Planning-grade, full stop. It was previously Math.max(rank, 2),
  // which let an inert mechanism selector lift an outsourced case to Finance-grade.
  // Finance-grade requires confirming there is no minimum volume commitment, which
  // this tool does not collect, so it routes that to Contract Risk instead.
  // BPO converts through billing, which is finance-creditable but not confirmed
  // cash until a minimum volume commitment is ruled out. Planning-grade, always.

  const flags = [];
  // Substituted enum inputs lead the list. They describe what the engine actually
  // ran, so a reader never reconciles a figure against an input that was not used.
  for (const c of enumCorrections) flags.push(c);
  for (const c of I.numericCorrections || []) flags.push(c);
  for (const c of measuredCorrections) flags.push(c);
  if (fcrPulledDirty) flags.push("Current FCR was pulled from another tool as a whole number and normalized to " + pct(fcr) + ". Confidence is capped until you confirm it. The upstream tool is publishing FCR in the wrong unit, which is a suite-contract issue worth fixing at the source.");
  if (fcrWasPercent) flags.push("Current FCR arrived as a whole number and was read as " + pct(fcr) + ". Confirm the upstream tool publishes FCR as a fraction, not a percentage.");
  if (fcrImpossible) flags.push("Current FCR was outside 0 to 100% and had to be clamped. The result is unreliable until the input is corrected.");
  if (negImpossible) flags.push("A negative volume, cost, or multiplier reached the model, which is impossible, and was clamped to zero. This can only arrive through an edited scenario link. Re-enter the inputs directly before using any figure on this page.");
  if (repeats > M + 1) flags.push("Repeat contacts exceed total contacts, which is impossible. The inputs are inconsistent.");
  if (repeatModel === "measured" && (repeatShare < 0 || repeatShare > MEASURED_MAX)) flags.push("Measured repeat share is outside the plausible 0 to " + Math.round(MEASURED_MAX * 100) + "% range. Recheck the figure.");
  if (method === "internal" && windowDays < WINDOW_SHORT) flags.push("Callback window of " + windowDays + " days is short. Internal FCR measured on a short window captures fewer return contacts and tends to run high, so the true repeat burden is likely larger than shown. This matters most for cross-channel and enterprise scope, where customers often return days later.");
  if (neverPaysBack) flags.push("Recurring cost meets or exceeds steady-state realizable savings, so this project does not pay back at any horizon under the current scope. Reduce recurring cost, strengthen the mechanism, or narrow the target.");
  if (repeatMult > MULT_HIGH) flags.push("Repeat complexity multiplier above " + MULT_HIGH + "x sits beyond most published estimates, which put repeats at 1.5x to 2x a first contact, with outliers to 4x. Confirm it against your own handle-time, escalation, and rework data before presenting these figures.");
  if (lCPC && mCPC > lCPC) flags.push("Marginal cost per contact exceeds loaded cost, which is impossible. Correct the inputs.");
  if (repeatMult < 1) flags.push("Repeat complexity multiplier below 1.0 implies repeats are cheaper than first contacts, which is implausible.");
  else if (lCPC && mCPC >= MARG_NEAR * lCPC) flags.push("Marginal cost is close to loaded cost. You may have entered loaded cost. The savings basis must be marginal.");
  else if (lCPC && mCPC > 0 && mCPC <= MARG_FAR * lCPC) flags.push("Marginal cost is " + Math.round((mCPC / lCPC) * 100) + "% of loaded cost. Marginal cost is mostly agent wage and benefits, so it usually runs 50% to 75% of loaded. A ratio this low means either an unusually fixed cost base or a wrong input, and burden scales directly with it. Confirm the figure before presenting, especially if it was pulled from another tool.");
  if (measuredPathOverridden) flags.push("This scenario carried a modeled improvement path against a measured repeat rate. That path computes the target share from a model whose baseline your measured figure replaces, so it books the gap between the two as savings. The improvement is now scaled proportionally on your own measured base, which is the only base-consistent reading. Figures here will not match a report generated from this link before that change.");
  if (!defDeclared) flags.push("FCR definition not declared. The result is not comparable across centers until you state how you measure it.");
  if (target <= fcr + 1e-9) flags.push("Target FCR is not above current. There is no improvement to value.");
  if (overCeiling) flags.push("Target was capped at " + pct(ceilingFCR) + ", the most your diagnostic says you can capture.");
  if (mechKey === "none" && sourcing !== "bpo") flags.push("No mechanism and in-house sourcing. Realizable savings are $0 until you commit to one.");
  if (mechApplies && mechKey === "vendor") flags.push("You selected in-house sourcing and a mechanism that reduces outsourcer volume. Those only hold together if you route overflow or seasonal volume to a per-contact vendor. If you do not, there is no invoice to reduce, the savings are capacity rather than cash, and this should be modeled as avoid hiring instead. This is the only path to Finance-grade realization that does not reduce headcount, so it will be the first assumption a CFO tests.");
  if (!mechApplies) flags.push("Outsourced per-contact sourcing converts volume reduction to cash at 100%, and the realization mechanism does not apply. This assumes billing tracks actual volume with no minimum commitment. If your contract carries a volume floor, nothing is saved until you drop below it. Confirm the commitment terms in Contract Risk Scanner before presenting these savings.");
  const hardFlag = flags.some((f) => /impossible|outside the plausible|outside 0 to 100|had to be clamped|clamped to zero|was held at/.test(f));

  /* The two-axis ladder that lived here graded a single select to Finance-grade and
     never read a completeness axis. Since 11B the grade is gradeFCR's alone. The
     engine reports what it ran, and the grading layer reads those facts. */
  return { mechKey, scopeKey, repeatCPC, repeatShare, shareSource, shareBasis, repeats, burdenYr, opp, cap, maxUplift, ceilingFCR, practicalMax, target, overCeiling, repeatsT, volReduced, grossYr, controllableBurdenYr, nonControllableBurdenYr, realFactor, mechApplies, realizableYr, steadyMo, payback, paybackLabel, neverPaysBack, year1Net, year2Net, cum2Yr, band, flags, hardFlag, repeatShareT, measuredPathOverridden, negImpossible, fcrImpossible,
    fcrWasPercent, fcr, M, mCPC, lCPC, repeatMult, enumCorrections, measuredCorrections, numericCorrections: I.numericCorrections || [] };
}

/* 11B grading layer. Doctrine Section 5. Three axes, read field by field.

   Evidence. Volume and FCR are the user's own figures and stand at Planning-grade
   once entered. The repeat share is Planning-grade only when it is measured and
   entered. A modeled share is a formula applied to FCR and grades Directional
   (Decision J2). The repeat multiplier at its default is the conservative floor,
   so it does not bind. Marginal cost reaches Planning-grade only when the cost
   basis select names operations or finance data, and one-time and recurring cost
   stand at Planning-grade once entered. Nothing reaches Finance-grade: the select
   is self-declared and no document is inspected (Decision J1). A value at its
   default, a value restored from this tool's own last run, and a rail value with
   no recorded origin all grade Directional (Decision J3). Loaded cost values no
   savings and reaches no axis.

   Realization reads mech.js credit class through realizationFromCred. Per-contact
   outsourcing holds at Planning-grade until a volume floor is ruled out (J5). An
   in-house center crediting outsourcer volume holds at Planning-grade too, because
   the invoice it would reduce is unconfirmed (J9).

   Completeness holds Directional on any corrected input, any failed validity or
   applicability check, and any model that measured nothing (J4). Void is reserved
   for outputs no input can produce through the guards.

   This function never reads realizable savings, payback, year-one or two-year net,
   or the ceiling cap. Doctrine 5.5. */
const OPS_OWN = [["M", "monthly volume"], ["fcr", "current FCR"]];
const COST_ATTEST = [["mCPC", "marginal cost"]];
const COST_OWN = [["investOneTime", "one-time cost"], ["investRecurring", "recurring cost"]];
const asNum = (x) => (typeof x === "number" ? x : Number(x));

/* Where a graded field's value came from. `pre` holds what the mount prefill wrote,
   field by field, in engine units, with the tool that published it. A prefilled
   value the user has since changed is the user's own. */
function fieldOrigin(I, pre, f) {
  const v = asNum(I[f]);
  const p = pre && Object.prototype.hasOwnProperty.call(pre, f) ? pre[f] : null;
  if (p && asNum(p.value) === v) return p.src === TOOL_ID ? "self" : "rail";
  if (v === BASE[f]) return "default";
  return "entered";
}

const MECH_REASON = {
  none: "no capacity action is selected, so freed capacity converts to no cash",
  growth: "absorbing growth or backlog builds capacity, which finance does not credit as savings this cycle",
  overtime: "reducing overtime stops a payment finance already makes, which is creditable, but it is not cash leaving the cost base",
  hiring: "avoiding or slowing hiring is finance-creditable over the cycle, but it is not cash leaving the cost base",
  vendor: "reducing outsourcer volume takes cash off the invoice",
  headcount: "reducing headcount takes cash off the payroll",
};

function gradeFCR({ I, r, pre, railOrigin }) {
  const invariants = [];
  const figs = [r.burdenYr, r.controllableBurdenYr, r.nonControllableBurdenYr, r.grossYr, r.repeats, r.repeatsT, r.target, r.ceilingFCR, r.realFactor, r.repeatCPC];
  if (!figs.every(Number.isFinite)) invariants.push("an output is not a finite number");
  if (r.repeats > r.M * (1 + 1e-9) + 1e-9 || r.repeatsT > r.M * (1 + 1e-9) + 1e-9) invariants.push("more repeat contacts than total contacts");
  if (r.burdenYr < 0 || r.grossYr < 0 || r.controllableBurdenYr < 0) invariants.push("a burden or a gross value is below zero");
  if (r.controllableBurdenYr > r.burdenYr * (1 + 1e-9) + 1e-9) invariants.push("the controllable slice exceeds the whole burden");

  const measured = I.repeatModel === "measured";
  const fields = [...OPS_OWN, ...(measured ? [["measuredRate", "measured repeat share"]] : []), ["repeatMult", "repeat complexity multiplier"], ...COST_ATTEST, ...COST_OWN];
  const origins = Object.fromEntries(fields.map(([f]) => [f, fieldOrigin(I, pre, f)]));
  const railG = railEvidence(railOrigin);
  const attested = I.costBasis === "ops" || I.costBasis === "finance";
  const fieldGrade = (f, entered) => ({ default: "Directional", self: "Directional", rail: railG, entered })[origins[f]];
  const opsList = [...OPS_OWN, ...(measured ? [["measuredRate", "measured repeat share"]] : [])];
  const multBinds = origins.repeatMult !== "default";
  const opsGrades = [...opsList.map(([f]) => fieldGrade(f, "Planning-grade")), ...(multBinds ? [fieldGrade("repeatMult", "Planning-grade")] : []), ...(measured ? [] : ["Directional"])];
  const opsGrade = opsGrades.reduce(weakerStream);
  const costGrade = [...COST_ATTEST.map(([f]) => fieldGrade(f, attested ? "Planning-grade" : "Directional")), ...COST_OWN.map(([f]) => fieldGrade(f, "Planning-grade"))].reduce(weakerStream);
  const evidence = weakerStream(opsGrade, costGrade);

  const named = (list, o) => list.filter(([f]) => origins[f] === o).map(([, l]) => l);
  const say = (list) => list.length > 1 ? list.slice(0, -1).join(", ") + " and " + list[list.length - 1] : list[0];
  const why = (list) => {
    const parts = [];
    const def = named(list, "default"), self = named(list, "self"), rail = named(list, "rail");
    if (def.length) parts.push(`${say(def)} ${def.length > 1 ? "are" : "is"} still at the tool default`);
    if (self.length) parts.push(`${say(self)} ${self.length > 1 ? "were" : "was"} restored from this tool's own last run, and a tool never credentials itself`);
    if (rail.length) parts.push(`${say(rail)} arrived over the rail ${railOrigin ? `with an origin grade of ${railOrigin}` : "with no recorded origin grade"}, which confers consistency and evidence only as far as its origin`);
    return parts;
  };
  const opsParts = why([...opsList, ...(multBinds ? [["repeatMult", "repeat complexity multiplier"]] : [])]);
  if (!measured) opsParts.push(`the repeat share is modeled from FCR by the ${r.shareSource}, not measured. Select the measured model and enter your repeat rate to lift it`);
  if (!opsParts.length) opsParts.push("Volume, FCR and the measured repeat share are your own entries. Self-declared figures stand at Planning-grade at most, because no data was inspected");
  const costParts = why([...COST_ATTEST, ...COST_OWN]);
  if (!costParts.length && !attested) costParts.push("Marginal cost is your own entry but the cost basis is an estimate. Select operations or finance data once it is validated");
  if (!costParts.length) costParts.push("Marginal, one-time and recurring cost are your own entries, with the cost basis declared by your own account. Self-declaration stands at Planning-grade at most");
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const evParts = [...(opsGrade === evidence ? opsParts : []), ...(costGrade === evidence ? costParts : [])];

  const inhouseVendor = r.mechApplies && r.mechKey === "vendor";
  const realization = !r.mechApplies ? "Planning-grade" : inhouseVendor ? weakerStream(realizationFromCred(MECH[r.mechKey].cred), "Planning-grade") : realizationFromCred(MECH[r.mechKey].cred);
  const realWhy = !r.mechApplies
    ? "Per-contact billing falls directly with volume, so no capacity mechanism applies. It is held at Planning-grade until a minimum volume commitment is ruled out"
    : inhouseVendor
      ? `${MECH.vendor.label} on in-house sourcing is held at Planning-grade, because the outsourcer invoice it would reduce is not confirmed by anything this tool collects`
      : `${MECH[r.mechKey].label} is credited as ${MECH[r.mechKey].cred} in mech.js, because ${MECH_REASON[r.mechKey] || "that is its credit class"}`;

  const blockers = [];
  const corrected = r.enumCorrections.length + r.numericCorrections.length + r.measuredCorrections.length + (r.fcrImpossible ? 1 : 0) + (r.negImpossible ? 1 : 0) + (r.fcrWasPercent ? 1 : 0);
  if (corrected) blockers.push(`${corrected} input${corrected > 1 ? "s were" : " was"} outside the possible range, in the wrong unit, or not a valid entry, and corrected before calculation`);
  if (I.fcrPulledDirty) blockers.push("FCR arrived from another tool as a whole number and has not been confirmed");
  if (r.lCPC > 0 && r.mCPC > r.lCPC) blockers.push("marginal cost exceeds loaded cost, which is impossible");
  else if (r.lCPC > 0 && r.mCPC >= MARG_NEAR * r.lCPC) blockers.push(`marginal cost is at least ${Math.round(MARG_NEAR * 100)} percent of loaded cost, which usually means loaded cost was entered as marginal`);
  else if (r.lCPC > 0 && r.mCPC > 0 && r.mCPC <= MARG_FAR * r.lCPC) blockers.push(`marginal cost is at most ${Math.round(MARG_FAR * 100)} percent of loaded cost, outside the usual range, and the burden scales directly with it`);
  if (r.repeatMult < 1) blockers.push("the repeat multiplier is below 1.0, which prices a repeat below a first contact");
  else if (r.repeatMult > MULT_HIGH) blockers.push(`the repeat multiplier is above ${MULT_HIGH}x and is not yet validated against handle-time and rework data`);
  if (measured && r.repeatShare > MEASURED_MAX) blockers.push(`the measured repeat share is above the plausible ${Math.round(MEASURED_MAX * 100)} percent`);
  if (I.method === "internal" && I.windowDays < WINDOW_SHORT) blockers.push(`the internal callback window is under ${WINDOW_SHORT} days, which undercounts return contacts`);
  if (r.measuredPathOverridden) blockers.push("a legacy modeled improvement path was replaced by proportional scaling on the measured base");
  if (!I.defDeclared) blockers.push("the FCR definition is not declared, so the result is not comparable across centers");
  if (!I.diagComplete) blockers.push("the root-cause diagnostic is not fully answered, so opportunity and capture were read at the midpoint");
  if (!(r.M > 0) || !(r.repeatCPC > 0)) blockers.push("there is no repeat volume or no repeat cost, so the model measured nothing");
  else if (!(I.askTarget > r.fcr + 1e-9)) blockers.push("the target FCR is not above current, so the model measured no improvement");
  else if (!(r.practicalMax > r.fcr + 1e-9)) blockers.push("current FCR is at or above the practical maximum for this scope, so the model measured no improvement");
  const completeness = blockers.length ? "Directional" : "Finance-grade";
  const modelWhy = blockers.length ? blockers.join("; ")
    : "The model is whole: no input was corrected, the definition is declared, the diagnostic is answered and every validity check passed";

  const voided = invariants.length > 0;
  const gradeObj = voided
    ? voidResult({
        invariant: invariants.join("; "),
        remedy: "Correct the inputs behind the failed check and re-run before citing any figure in this report.",
      })
    : emitGrades({
        evidence, realization, completeness,
        reasons: { evidence: `${evParts.map(cap).join(". ")}.`, realization: `${realWhy}.`, completeness: `${cap(modelWhy)}.` },
      });
  const confidence = voided ? "Void" : gradeObj.headline;
  const gradeWhy = voided
    ? `export void: ${invariants.join("; ")}`
    : `Bound by ${gradeObj.boundBy}. ${gradeObj.boundAxes.map((x) => gradeObj.reasons[x]).join(" ")}`;
  return { gradeObj, confidence, gradeWhy, voided, invariants, evidence, opsGrade, costGrade, realization, completeness, blockers, origins };
}

/* @engine-end */

const MECH_OPTS = MECH_ORDER.map((k) => ({ v: k, l: MECH[k].label + (k === "none" ? " ($0)" : `  (${Math.round(MECH[k].f * 100)}%)`) }));

const LABELS = ["", "Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"];
const GAMING = ["Reopen / repeat-contact rate", "Transfer rate", "Escalation rate", "AHT drift (chasing FCR by lengthening calls)", "Confirmed bot containment, not raw containment", "CSAT / CES", "QA resolution accuracy", "Complaint rate"];

function LogoMark({ size = 30 }) {
  return <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}><g transform="translate(60,60)"><path d="M 30,-50 A 58,58 0 1,0 30,50" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity={0.6} /><path d="M 22,-38 A 44,44 0 1,0 22,38" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity={0.8} /><path d="M 15,-26 A 30,30 0 1,0 15,26" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" /><line x1="-14" y1="-14" x2="14" y2="14" stroke={LIGHT} strokeWidth="5.5" strokeLinecap="round" /><line x1="14" y1="-14" x2="-14" y2="14" stroke={LIGHT} strokeWidth="5.5" strokeLinecap="round" /></g></svg>;
}

/* Scenario contract. Defaults are STATIC on purpose: the state initializers
   below seed from cross-tool pulls, but the URL diff must be taken against a
   fixed baseline or the same link would decode differently in another session. */
const ROUTE = "/tools/fcr-leakage";
const DEFAULTS = {
  phase: "setup", M: dflt("M"), fcrPct: dflt("fcrPct"), mCPC: dflt("mCPC"), lCPC: dflt("lCPC"),
  scope: "", method: "", windowDays: dflt("windowDays"), repeatModel: "one",
  measuredPct: dflt("measuredPct"), measuredTargetPct: dflt("measuredTargetPct"), pathModel: "one",
  repeatMult: dflt("repeatMult"), targetPct: dflt("targetPct"), sourcing: "inhouse", mech: MECH_INITIAL,
  investOneTime: dflt("investOneTime"), investRecurring: dflt("investRecurring"),
  costBasis: "estimate", fcrConfirmed: false, scores: {},
};

export default function FCRLeakageDiagnostic() {
  /* Read the rail exactly once, at mount and BEFORE this tool publishes, with the tool
     that wrote each value. This tool republishes fcr, monthlyContacts and
     marginalPerContact, so a pull re-read on every render found its own output and
     showed it as PULLED. `pre` feeds gradeFCR field by field, in engine units: a
     restored own value and a rail value with no origin grade both grade Directional.
     Keys stay as string literals so rail-audit.mjs can see every pull. */
  const rail = useRef(null);
  if (rail.current === null) {
    const got = {
      M: getPrimitiveWithSource("monthlyContacts"), fcr: getPrimitiveWithSource("fcr"),
      mCPC: getPrimitiveWithSource("marginalPerContact"), mCPCalt: getPrimitiveWithSource("marginalCPC"),
      lCPC: getPrimitiveWithSource("loadedCPC"), lCPCalt: getPrimitiveWithSource("costPerContact"),
    };
    const first = (a, b) => (a.value ? a : b.value ? b : null);
    const hit = { M: got.M.value ? got.M : null, mCPC: first(got.mCPC, got.mCPCalt), lCPC: first(got.lCPC, got.lCPCalt) };
    const rawFcr = got.fcr.value;
    const fcrPct = rawFcr == null || isNaN(rawFcr) ? null : clamp(Math.round((rawFcr > 1 ? rawFcr / 100 : rawFcr) * 100), 1, 99);
    const pre = {};
    for (const f of ["M", "mCPC", "lCPC"]) if (hit[f] && !isNaN(hit[f].value)) pre[f] = { value: hit[f].value, src: hit[f].sourceTool || "" };
    if (fcrPct != null) pre.fcr = { value: fcrPct / 100, src: got.fcr.sourceTool || "" };
    rail.current = { M: pre.M ? pre.M.value : null, mCPC: pre.mCPC ? pre.mCPC.value : null, lCPC: pre.lCPC ? pre.lCPC.value : null, fcrPct, rawFcr: fcrPct == null ? null : rawFcr, pre };
  }
  const [phase, setPhase] = useState("setup");
  const [M, setM] = useState(() => rail.current.M != null ? rail.current.M : DEFAULTS.M);
  const [fcrPct, setFcrPct] = useState(() => rail.current.fcrPct != null ? rail.current.fcrPct : DEFAULTS.fcrPct);
  const [mCPC, setMCPC] = useState(() => rail.current.mCPC != null ? rail.current.mCPC : DEFAULTS.mCPC);
  const [lCPC, setLCPC] = useState(() => rail.current.lCPC != null ? rail.current.lCPC : DEFAULTS.lCPC);
  const [scope, setScope] = useState(""); const [method, setMethod] = useState(""); const [windowDays, setWindowDays] = useState(DEFAULTS.windowDays);
  const [repeatModel, setRepeatModel] = useState("one");
  const [measuredPct, setMeasuredPct] = useState(DEFAULTS.measuredPct); const [measuredTargetPct, setMeasuredTargetPct] = useState(DEFAULTS.measuredTargetPct); const [pathModel, setPathModel] = useState("proportional");
  /* A fresh session runs the only path the engine has, proportional. DEFAULTS keeps
     "one" on purpose: a legacy link that omitted pathModel was minted on "one", so it
     still decodes as "one" and still carries the legacy-path disclosure. The shipped
     initial state of "one" fired that disclosure on every fresh measured run. */
  const [repeatMult, setRepeatMult] = useState(DEFAULTS.repeatMult);
  const [targetPct, setTargetPct] = useState(DEFAULTS.targetPct);
  const [sourcing, setSourcing] = useState("inhouse"); const [mech, setMech] = useState(DEFAULTS.mech);
  const [investOneTime, setInvestOneTime] = useState(DEFAULTS.investOneTime); const [investRecurring, setInvestRecurring] = useState(DEFAULTS.investRecurring);
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
    /* Raw, deliberately. Normalizing here re-created the silent substitution the
       engine now discloses: a hand-edited link resolved to a default before the
       engine ever saw it, so the document showed a mechanism the sender never
       chose and no correction. The engine resolves and discloses, the selectors
       below display the resolved key, and legacy "absorb" links still alias. */
    setSourcing(sc.sourcing); setMech(sc.mech);
    setInvestOneTime(sc.investOneTime); setInvestRecurring(sc.investRecurring);
    setCostBasis(sc.costBasis); setFcrConfirmed(sc.fcrConfirmed);
    setScores(sc.scores); setPhase(sc.phase);
    setFromLink(true);
    clearScenarioParam();
  }, []);

  const pulledM = !fromLink && rail.current.M != null; const pulledFcr = !fromLink && rail.current.fcrPct != null;
  const fcrPulledDirty = !fromLink && rail.current.rawFcr != null && rail.current.rawFcr > 1 && !fcrConfirmed;
  const onFcr = (v) => { setFcrConfirmed(true); setFcrPct(v); };
  const pulledMcpc = !fromLink && rail.current.mCPC != null;
  useEffect(() => { window.scrollTo(0, 0); }, [phase]);

  /* Every figure below reads the sanitized numerics. Input fields keep the raw state
     so the user sees exactly what the link carried beside its disclosure. */
  const N = saneFcr({ M, fcrPct, mCPC, lCPC, windowDays, measuredPct, measuredTargetPct, repeatMult, targetPct, investOneTime, investRecurring, scores, method, repeatModel });
  const setScore = (dimId, qIdx, val) => setScores((p) => ({ ...p, [`${dimId}-${qIdx}`]: val }));
  const dimScore = (dimId) => { const d = DIMS.find((x) => x.id === dimId); const vals = d.qs.map((_, i) => N.scores[`${dimId}-${i}`] || 0).filter((v) => v > 0); return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0; };
  const dimComplete = (dimId) => DIMS.find((d) => d.id === dimId).qs.every((_, i) => N.scores[`${dimId}-${i}`] > 0);
  const allComplete = DIMS.every((d) => dimComplete(d.id));
  const dScore = DIMS.reduce((a, d) => a + dimScore(d.id), 0) / DIMS.length;
  const defDeclared = scope !== "" && method !== "";

  const engineInput = { M: N.M, fcr: N.fcrPct / 100, mCPC: N.mCPC, lCPC: N.lCPC, repeatModel, measuredRate: N.measuredPct / 100, measuredTargetRate: N.measuredTargetPct > 0 ? N.measuredTargetPct / 100 : null, pathModel, repeatMult: N.repeatMult, dScore: dScore || 3, askTarget: N.targetPct / 100, mech, sourcing, investOneTime: N.investOneTime, investRecurring: N.investRecurring, costBasis, defDeclared, fcrPulledDirty, scope, method, windowDays: N.windowDays, numericCorrections: N.numericCorrections, diagComplete: allComplete };
  const R = engine(engineInput);
  /* railOrigin is null because the rail carries no origin grade yet. A scenario link
     suppresses the prefill record, since those values describe someone else's session. */
  const G = gradeFCR({ I: engineInput, r: R, pre: fromLink ? {} : rail.current.pre, railOrigin: null });
  const blocked = R.hardFlag || G.voided;

  /* Exact input set the scenario link carries. Phase rides along so a shared
     link opens on the results the sender was looking at, not an empty wizard. */
  const scenario = {
    phase, M, fcrPct, mCPC, lCPC, scope, method, windowDays, repeatModel,
    measuredPct, measuredTargetPct, pathModel, repeatMult, targetPct,
    sourcing, mech, investOneTime, investRecurring, costBasis, fcrConfirmed, scores,
  };
  const aggMult = Math.min(SENS.max, Math.max(SENS.min, N.repeatMult + SENS.step));
  const sensLo = engine({ ...engineInput, repeatModel: "one", repeatMult: 1.0 });
  const sensHi = engine({ ...engineInput, repeatModel: "geometric", repeatMult: aggMult });
  const sorted = [...DIMS].sort((a, b) => dimScore(a.id) - dimScore(b.id));
  const top = sorted[0];
  const confColor = (c) => c === "Finance-grade" ? GREEN : c === "Planning-grade" ? AMBER : c === "Void" ? RED : MUTED;
  const methodLabel = method === "survey" ? "external post-call survey" : method === "internal" ? "internal callback window of " + N.windowDays + " days" : "not declared";

  useEffect(() => {
    if (phase === "results") publishToolResult("fcr-leakage", {
      repeatContactBurden: R.burdenYr, controllableRepeatBurden: R.controllableBurdenYr, cashRealizableSavings: R.realizableYr,
      repeatContactShare: R.repeatShare, marginalPerContact: N.mCPC, targetFCR: R.target, fcr: N.fcrPct / 100, monthlyContacts: N.M,
      fcrLeakageConfidence: G.confidence,
      analystRead: `Repeat burden ${money(R.burdenYr)}/yr (${money(R.controllableBurdenYr)} controllable). ${money(R.realizableYr)} realizable at ${pct(R.target)} FCR, payback ${R.paybackLabel}.`,
    });
  }, [phase, R.burdenYr, R.realizableYr, R.payback, G.confidence]);

  const card = { border: `1px solid ${BORDER}`, borderRadius: 12, padding: "22px", marginBottom: 18 };
  const h3 = { fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 16, letterSpacing: 0.3 };

  return (
    <div style={{ fontFamily: FONT, minHeight: "100vh", background: "#fff", color: NAVY }}>
      <style>{`${FONT_IMPORT_CSS}*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}select{font-family:inherit}@media(max-width:700px){.g2{grid-template-columns:1fr!important}.g3{grid-template-columns:1fr!important}}`}</style>
      <nav style={{ background: DEEP, padding: "16px 0" }}><div style={{ ...WRAP, display: "flex", alignItems: "center", justifyContent: "space-between" }}><a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}><LogoMark /><span style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>THE CENTER OF <span style={{ color: LIGHT }}>CX</span></span></a><a href="/how-to-choose" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none" }}>← Back to Tools</a></div></nav>

      {phase === "setup" && (
        <section style={{ padding: "44px 28px 60px" }}>
          <div style={{ ...WRAP, maxWidth: 760 }}>
            <span style={{ color: RED, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Performance + Quality</span>
            <h1 style={{ ...TYPE.display, margin: "10px 0 10px" }}>FCR Leakage Diagnostic</h1>
            <p style={{ fontSize: 15, color: SLATE, lineHeight: 1.6, marginBottom: 12, maxWidth: 620 }}>Repeat contacts are the leakage. This tool separates the burden you carry, the portion that is realistically controllable, and the part that converts to actual cash. It will tell you when a project does not pay back.</p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 26, fontSize: 11, color: MUTED }}><span>1. Burden</span><span>2. Controllable opportunity</span><span>3. Realizable cash</span><span>4. Confidence</span><span>5. Next operating test</span></div>

            <div style={card}>
              <h3 style={h3}>Volume + Economics</h3>
              <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <NumField label="Monthly contacts" value={M} onChange={setM} step={500} min={0} pulled={pulledM} />
                <NumField label="Current FCR" value={fcrPct} onChange={onFcr} suffix="%" step={1} min={1} max={99} pulled={pulledFcr} info={DEFS.fcrDef.text} infoTitle={DEFS.fcrDef.title} />
                <NumField label="Marginal cost / contact" value={mCPC} onChange={setMCPC} prefix="$" step={0.25} min={0} pulled={pulledMcpc} info={DEFS.marginalCPC.text} infoTitle={DEFS.marginalCPC.title} />
                <NumField label="Loaded cost / contact" value={lCPC} onChange={setLCPC} prefix="$" step={0.25} min={0} info={DEFS.loadedCPC.text} infoTitle={DEFS.loadedCPC.title} infoAlign="right" />
              </div>
            </div>

            <div style={card}>
              <h3 style={{ ...h3, marginBottom: 6 }}>Declare your FCR definition</h3>
              <p style={{ fontSize: 12, color: MUTED, marginBottom: 16, lineHeight: 1.5 }}>FCR has no industry standard. Until you declare scope and method, the result stays Directional and is not comparable across centers.</p>
              <div className="g3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <Sel label="Resolution scope" value={R.scopeKey} onChange={setScope} info={DEFS.scope.text} infoTitle={DEFS.scope.title} options={[{ v: "", l: "Select..." }, { v: "voice", l: "Voice only" }, { v: "cc", l: "CC cross-channel" }, { v: "digital", l: "Digital + assisted" }, { v: "enterprise", l: "Enterprise OCR" }]} />
                <Sel label="Measurement method" value={method} onChange={setMethod} options={[{ v: "", l: "Select..." }, { v: "survey", l: "External post-call survey" }, { v: "internal", l: "Internal callback window" }]} />
                {method === "internal" ? <NumField label="Callback window" value={windowDays} onChange={setWindowDays} suffix=" days" step={1} min={1} max={30} /> : <div />}
              </div>
              {scope === "voice" && <p style={{ fontSize: 12, color: AMBER, marginTop: 12, lineHeight: 1.5 }}>Voice-only scope is the most generous definition. It usually inflates FCR and understates leakage, because a customer who failed in chat or a bot before calling is not counted.</p>}
              {method === "internal" && N.windowDays < WINDOW_SHORT && <p style={{ fontSize: 12, color: AMBER, marginTop: 12, lineHeight: 1.5 }}>A {N.windowDays}-day callback window is short. It captures fewer return contacts, so internal FCR tends to read high and the true leakage is likely larger than shown. Cross-channel and enterprise scope feel this most, since customers often return through another channel days later. Common practice is 7 to 30 days depending on issue type.</p>}
            </div>

            <div style={card}>
              <h3 style={h3}>Leakage Model</h3>
              <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Sel label="Repeat-behavior model" value={repeatModel} onChange={setRepeatModel} info={DEFS.repeatModel.text} infoTitle={DEFS.repeatModel.title} options={[{ v: "one", l: "One callback then resolved" }, { v: "geometric", l: "Geometric (callbacks can fail)" }, { v: "measured", l: "I have my measured repeat rate" }]} />
                <NumField label="Repeat complexity multiplier" value={repeatMult} onChange={setRepeatMult} suffix="x" step={0.1} min={0.5} max={3} info={DEFS.repeatMult.text} infoTitle={DEFS.repeatMult.title} infoAlign="right" />
                {repeatModel === "measured" && <NumField label="Measured current repeat share" value={measuredPct} onChange={setMeasuredPct} suffix="%" step={1} min={0} max={60} />}
                {repeatModel === "measured" && <NumField label="Measured target repeat share (0 = model it)" value={measuredTargetPct} onChange={setMeasuredTargetPct} suffix="%" step={1} min={0} max={60} infoAlign="right" />}
                {/* The improvement-path selector was removed. Two of its three options
                    switched bases against a measured baseline and invented savings.
                    `pathModel` stays in the scenario contract so legacy links still
                    decode, and the engine flags them. */}
                <NumField label="Target FCR" value={targetPct} onChange={setTargetPct} suffix="%" step={1} min={1} max={95} info={DEFS.ceiling.text} infoTitle={DEFS.ceiling.title} infoAlign="right" />
              </div>
              {N.repeatMult > MULT_HIGH ? <p style={{ fontSize: 12, color: RED, marginTop: 12, lineHeight: 1.5 }}>High assumption at {fmtX(N.repeatMult)}x. This is above most published estimates. Validate it against your handle-time, escalation, and rework data before using these figures in a business case.</p> : N.repeatMult > MULT_ELEVATED ? <p style={{ fontSize: 12, color: AMBER, marginTop: 12, lineHeight: 1.5 }}>Elevated at {fmtX(N.repeatMult)}x. Reasonable if your repeats escalate or run longer than first contacts. The normal modeled range is 1.0x to 2.0x.</p> : null}
            </div>

            <div style={card}>
              <h3 style={h3}>Realization + Investment</h3>
              <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Sel label="Sourcing model" value={sourcing} onChange={setSourcing} info={DEFS.sourcing.text} infoTitle={DEFS.sourcing.title} options={[{ v: "inhouse", l: "In-house (capacity, needs mechanism)" }, { v: "bpo", l: "Outsourced per-contact (direct cash)" }]} />
                <Sel label="Realization mechanism" value={R.mechKey} onChange={setMech} info={DEFS.mech.text} infoTitle={DEFS.mech.title} align="right" options={MECH_OPTS} disabled={sourcing === "bpo"} note={sourcing === "bpo" ? "Not used. On a per-contact contract the invoice falls with volume, so savings convert at 100% without a capacity mechanism. Switch to in-house sourcing to apply one." : null} />
                <NumField label="One-time cost to achieve" value={investOneTime} onChange={setInvestOneTime} prefix="$" step={10000} min={0} info={DEFS.invest.text} infoTitle={DEFS.invest.title} />
                <NumField label="Recurring annual cost" value={investRecurring} onChange={setInvestRecurring} prefix="$" step={5000} min={0} infoAlign="right" />
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
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}><span style={{ fontSize: 22 }}>{d.icon}</span><h2 style={{ ...TYPE.h1, margin: 0 }}>{d.name}</h2><Tag text={d.ownerClass} color={SLATE} /></div>
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
            {blocked && (
              <div>
                <div style={{ background: `${RED}0A`, border: `2px solid ${RED}`, borderRadius: 12, padding: "26px 28px", marginBottom: 20 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: RED, letterSpacing: 1.5, textTransform: "uppercase" }}>Result blocked: invalid inputs</span>
                  <p style={{ fontSize: 14, color: NAVY, lineHeight: 1.6, margin: "10px 0 14px" }}>The engine produced a physically impossible value, so no result is shown. An invalid result is not a low-confidence result. Correct the inputs below and the economics will return.</p>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>{[...(G.voided ? [`Export void: ${G.invariants.join("; ")}.`] : []), ...R.flags.filter((f) => /impossible|outside the plausible|outside 0 to 100|had to be clamped|was held at/.test(f))].map((f, i) => <li key={i} style={{ fontSize: 13, color: RED, lineHeight: 1.5, marginBottom: 4 }}>{f}</li>)}</ul>
                </div>
                <button onClick={() => setPhase("setup")} style={{ background: ELECTRIC, color: "#fff", fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8, border: "none", cursor: "pointer" }}>Adjust inputs</button>
              </div>
            )}
            {!blocked && (<>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", background: WARM, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 16px", marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: confColor(G.confidence), letterSpacing: 1, textTransform: "uppercase" }}>{G.confidence}</span>
              <span style={{ fontSize: 12, color: SLATE }}>Evidence <strong style={{ color: confColor(G.evidence) }}>{G.evidence}</strong></span>
              <span style={{ fontSize: 12, color: SLATE }}>Realization <strong style={{ color: confColor(G.realization) }}>{G.realization}</strong></span>
              <span style={{ fontSize: 12, color: SLATE }}>Completeness <strong style={{ color: confColor(G.completeness) }}>{G.completeness}</strong></span>
              <InfoDot text={DEFS.confidence.text} title={DEFS.confidence.title} />
              <div style={{ flexBasis: "100%", fontSize: 12, color: SLATE, lineHeight: 1.5, marginTop: 2 }}>{G.gradeWhy}</div>
              <div style={{ flexBasis: "100%", fontSize: 11.5, color: MUTED, lineHeight: 1.5 }}>This grade is self-declared. It reflects what you told this tool about your sources. No payroll file, finance record or repeat-contact dataset was inspected.</div>
            </div>

            <div className="g2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div style={{ background: `${RED}06`, border: `1px solid ${RED}22`, borderRadius: 12, padding: "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><span style={{ fontSize: 11, fontWeight: 700, color: RED, letterSpacing: 1, textTransform: "uppercase" }}>Annual repeat burden</span><Tag text={R.shareBasis} color={RED} /><InfoDot text={DEFS.controllable.text} title={DEFS.controllable.title} /></div>
                <div style={{ ...TYPE.statValueLg, color: RED }}>{money(R.burdenYr)}</div>
                <p style={{ fontSize: 12, color: SLATE, marginTop: 6, lineHeight: 1.5 }}>{Math.round(R.repeats).toLocaleString()} repeats/mo at {pct(R.repeatShare)} of volume ({R.shareSource}), valued at {money2(R.repeatCPC)} repeat-adjusted marginal cost ({money2(N.mCPC)} base times {fmtX(N.repeatMult)}x complexity). Burden ceiling, not recoverable. Range {money(R.burdenYr * (1 - R.band))} to {money(R.burdenYr * (1 + R.band))}.</p>
              </div>
              <div style={{ background: `${GREEN}06`, border: `1px solid ${GREEN}22`, borderRadius: 12, padding: "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><span style={{ fontSize: 11, fontWeight: 700, color: GREEN, letterSpacing: 1, textTransform: "uppercase" }}>Year-1 net</span><Tag text="Assumed" color={GREEN} /><InfoDot text={DEFS.invest.text} title={DEFS.invest.title} /></div>
                <div style={{ ...TYPE.statValueLg, color: R.year1Net >= 0 ? GREEN : RED }}>{money(R.year1Net)}</div>
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
                  <span style={{ ...TYPE.h2, ...NUM, color: RED, width: 22 }}>{i + 1}</span>
                  <div style={{ flex: 1 }}><span style={{ fontSize: 13, fontWeight: 600 }}>{d.icon} {d.name}</span><div style={{ fontSize: 11, color: MUTED }}>Owner: {d.owner}</div></div>
                  <span style={{ ...TYPE.h2, ...NUM, color: RED }}>{dimScore(d.id).toFixed(1)}</span>
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
                { k: "Current model", d: `${repeatModel === "geometric" ? "geometric" : repeatModel === "measured" ? "measured" : "one-callback"}, ${fmtX(N.repeatMult)}x cost`, r: R, cur: true },
                { k: "Aggressive", d: `geometric, ${fmtX(aggMult)}x cost`, r: sensHi },
              ].map((row, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < 2 ? `1px solid ${BORDER}` : "none", background: row.cur ? `${ELECTRIC}06` : "transparent" }}>
                  <span style={{ fontSize: 12.5, fontWeight: row.cur ? 700 : 600, color: row.cur ? ELECTRIC : NAVY, width: 120 }}>{row.k}</span>
                  <span style={{ fontSize: 11.5, color: MUTED, flex: 1 }}>{row.d}</span>
                  <span style={{ fontSize: 12, color: SLATE }}>burden {money(row.r.burdenYr)}</span>
                  <span style={{ ...TYPE.h3, ...NUM, fontWeight: W.semibold, color: row.r.year1Net >= 0 ? GREEN : RED, width: 110, textAlign: "right" }}>{money(row.r.year1Net)}</span>
                </div>
              ))}
              <p style={{ fontSize: 10.5, color: MUTED, marginTop: 8 }}>Rightmost column is year-one net. If the sign flips across these rows, your repeat-cost assumption is the deciding factor and is worth measuring before you commit.</p>
            </div>

            <ReportActions
              toolId={TOOL_ID}
              toolName="FCR Leakage Diagnostic"
              subtitle={`${G.confidence} • Repeat burden ${money(R.burdenYr)}/yr • Year-1 net ${money(R.year1Net)}`}
              routePath={ROUTE}
              state={scenario}
              defaults={DEFAULTS}
              confidence={G.confidence}
              grades={G.gradeObj}
              summary={[
                { label: "Repeat burden annual", value: money(R.burdenYr) },
                { label: "Controllable burden annual", value: money(R.controllableBurdenYr) },
                { label: "Realizable annual", value: money(R.realizableYr) },
                { label: "Year-1 net", value: money(R.year1Net) },
                { label: "Year-2 net standalone", value: money(R.year2Net) },
                { label: "Two-year cumulative net", value: money(R.cum2Yr) },
                { label: "Payback", value: R.neverPaysBack ? "never at current scope" : R.payback ? "month " + R.payback : "beyond " + HORIZON + " months" },
              ]}
              signals={{
                /* Severity is the share of the achievable resolution frontier
                   this center is not getting: practical max minus current FCR,
                   over practical max. The denominator is the ceiling the engine
                   itself publishes by definition scope, 0.88 to 0.93, stated
                   openly as a judgment value in the engine rather than invented
                   at the publish site. 72% FCR reads low, 60% moderate, 45% and
                   30% high, 15% and below severe.

                   Two other numerators were measured and rejected. Repeat share
                   is the obvious candidate and it is wrong here: under the
                   default one-callback model it is (1-f)/(2-f), which cannot
                   exceed 0.5 at any FCR, so severe would be structurally
                   unreachable on the default path and the same center would
                   publish a different band purely for picking the geometric
                   model. The gap against ceilingFCR rather than practicalMax
                   folds the diagnostic capture factor into the denominator, and
                   it compressed a center at 30% FCR to moderate, because a low
                   diagnostic score lowers the ceiling and therefore shrinks the
                   gap it is measured against. Being unable to fix the problem is
                   not the same as not having it.

                   A hard flag or an impossible FCR means an input is physically
                   invalid and the result is blocked, so the key is omitted
                   rather than published off a clamped number. */
                ...(blocked || R.fcrImpossible || !(R.practicalMax > 0) ? {} : {
                  severity: severityBucket(Math.max(0, R.practicalMax - N.fcrPct / 100) / R.practicalMax),
                }),
                evidence_confidence: G.voided ? "void" : G.evidence,
                realization_confidence: G.voided ? "void" : G.realization,
                completeness_confidence: G.voided ? "void" : G.completeness,
                current_fcr: N.fcrPct + "%",
                // The APPLIED target, not the ask. These diverge whenever the
                // diagnostic caps the target, which is most of the time: the
                // signal read 78% while the model had run 76.9%, and anything
                // consuming this block downstream was reading a number the
                // engine never used. `requested_fcr` keeps the ask visible.
                target_fcr: pct(R.target),
                requested_fcr: N.targetPct + "%",
                target_capped: R.overCeiling ? "yes" : "no",
                capacity_action: R.mechApplies ? MECH[R.mechKey].label : "not applicable (bpo)",
                credit_class: R.mechApplies ? MECH[R.mechKey].cred : "billing",
                realization_factor: R.realFactor,
                sourcing,
                hard_flag: R.hardFlag ? "yes" : "no",
                inputs_corrected: N.numericCorrections.length,
                integrity_flags: R.flags.length,
                from_scenario_link: fromLink ? "yes" : "no",
              }}
              sections={[
                { title: "Result Summary", type: "text", content: `Repeat contacts cost ${money(R.burdenYr)} per year at the margin. Of that, ${money(R.controllableBurdenYr)} is controllable leakage burden, which is not savings until a mechanism converts it. At a ${pct(R.target)} FCR target the project realizes ${money(R.realizableYr)} per year at steady state, nets ${money(R.year1Net)} in year one, and pays back ${R.neverPaysBack ? "never at current scope" : R.payback ? "in month " + R.payback : "beyond " + HORIZON + " months"}. Confidence is ${G.confidence}.` },
                { title: "Definitions and Scope Used", type: "findings", items: [
                  `FCR definition: ${scopeLabelFor(R.scopeKey)}, ${methodLabel}.`,
                  `Repeat behavior: ${R.shareSource}. Repeat complexity multiplier ${fmtX(N.repeatMult)}x.`,
                  `Sourcing: ${sourcing === "bpo" ? "outsourced per-contact. Volume reduction converts to cash at 100% through billing. No capacity mechanism applies, and none was used." : "in-house. Freed capacity is gated by a mechanism. Mechanism applied: " + MECH[R.mechKey].label + " (" + Math.round(MECH[R.mechKey].f * 100) + "%), credited as " + MECH[R.mechKey].cred + "."}`,
                  `Cost basis: ${{estimate:"Estimate marginal cost (±25%)",ops:"Operations-data marginal cost (±15%)",finance:"Finance-confirmed marginal cost (±10%)"}[costBasis]}. Target capped by diagnostic: ${R.overCeiling ? "yes, at " + pct(R.ceilingFCR) : "no"}.`,
                ] },
                { title: "Leakage Economics", type: "metrics", items: [
                  { label: "Repeat share of volume", value: pct(R.repeatShare), color: RED, sub: R.shareBasis },
                  { label: "Effective repeat cost", value: money2(R.repeatCPC), color: SLATE, sub: money2(N.mCPC) + " base times " + fmtX(N.repeatMult) + "x" },
                  { label: "Annual repeat burden (marginal)", value: money(R.burdenYr), color: RED },
                  { label: "Burden range (±" + (R.band * 100) + "%)", value: money(R.burdenYr * (1 - R.band)) + " to " + money(R.burdenYr * (1 + R.band)), color: SLATE },
                  { label: "Controllable leakage burden (not yet savings)", value: money(R.controllableBurdenYr), color: AMBER },
                  { label: "Non-controllable (excluded)", value: money(R.nonControllableBurdenYr), color: MUTED },
                ] },
                { title: "Cash Conversion and Payback", type: "metrics", items: [
                  { label: "Diagnostic ceiling FCR / applied target", value: pct(R.ceilingFCR) + " / " + pct(R.target), color: NAVY },
                  { label: sourcing === "bpo" ? "Gross volume reduction value" : "Gross capacity value", value: money(R.grossYr), color: SLATE },
                  { label: "Realizable via " + (sourcing === "bpo" ? "billing reduction" : "mechanism"), value: money(R.realizableYr), color: R.realizableYr > 0 ? GREEN : RED },
                  { label: "One-time cost", value: money(N.investOneTime), color: SLATE },
                  { label: "Recurring annual cost", value: money(N.investRecurring), color: SLATE },
                  { label: "Payback", value: R.neverPaysBack ? "never" : R.payback ? "month " + R.payback : HORIZON + "mo+", color: R.neverPaysBack ? RED : NAVY },
                  { label: "Year-1 net (after one-time cost)", value: money(R.year1Net), color: R.year1Net >= 0 ? GREEN : RED },
                  { label: "Year-2 net (standalone)", value: money(R.year2Net), color: R.year2Net >= 0 ? GREEN : RED },
                  { label: "Two-year cumulative net", value: money(R.cum2Yr), color: R.cum2Yr >= 0 ? GREEN : RED, sub: "year 1 plus year 2" },
                ] },
                { title: "Confidence and Risk Flags", type: "findings", items: [
                  `Headline ${G.confidence}. ${G.gradeWhy}`,
                  `Evidence axis: ${G.voided ? "Void" : G.evidence}.`,
                  `Realization axis: ${G.voided ? "Void" : G.realization} (${R.mechApplies ? MECH[R.mechKey].label : "per-contact billing"}).`,
                  `Completeness axis: ${G.voided ? "Void" : G.completeness}${G.blockers.length ? ", " + G.blockers.length + (G.blockers.length === 1 ? " check failed" : " checks failed") : ", model is whole"}.`,
                  "This grade is self-declared. It reflects the sources you named. No payroll file, finance record or repeat-contact dataset was inspected.",
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
                /* The edge set lives in src/lib/journey.js, the same graph the tracked
                   "Run this next" card renders, so the page and the PDF cannot name
                   different next steps. */
                { title: "Next Steps", type: "next", items: nextFor(TOOL_ID).map((e) => ({ tool: e.name, reason: e.why, href: e.href })) },
              ]}
            />

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
              <button onClick={() => { setCurrentDim(DIMS.length - 1); setPhase("diagnostic"); }} style={{ background: "#fff", border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8, cursor: "pointer" }}>← Back to diagnostic</button>
              <button onClick={() => setPhase("setup")} style={{ background: WARM, border: `1px solid ${BORDER}`, color: NAVY, fontSize: 14, fontWeight: 600, padding: "12px 24px", borderRadius: 8, cursor: "pointer" }}>Adjust inputs</button>
            </div>
            </>)}
          </div>
        </section>
      )}
    </div>
  );
}
